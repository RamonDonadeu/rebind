import { z } from "zod";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Prisma, type User } from "@rebind/db";
import { prisma } from "@rebind/db";
import { API_ERROR_CODES, maxBindersForPlan, type PlanTier } from "@rebind/shared";
import { hashPassword, verifyPassword } from "../lib/password.js";
import {
  hashToken,
  newTokenId,
  refreshExpiresAt,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../lib/jwt.js";
import type { AuthenticatedRequest } from "../plugins/auth.js";

const REFRESH_COOKIE = "refreshToken";

const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    planTier: user.planTier,
    subscriptionStatus: user.subscriptionStatus,
  };
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: refreshExpiresAt(),
  };
}

async function issueTokens(user: User, reply: FastifyReply) {
  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    planTier: user.planTier,
    subscriptionStatus: user.subscriptionStatus,
  });

  const jti = newTokenId();
  const refreshToken = await signRefreshToken(user.id, jti);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiresAt(),
    },
  });

  reply.setCookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());

  return { accessToken };
}

export default async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const parsed = credentialsSchema.safeParse(request.body);

    if (!parsed.success) {
      request.log.warn({ event: "auth.register_validation_failed", issues: parsed.error.issues });
      return reply.status(400).send({
        error: {
          code: API_ERROR_CODES.VALIDATION_ERROR,
          message: parsed.error.issues[0]?.message ?? "Invalid request body",
        },
      });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    try {
      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
        },
      });

      const { accessToken } = await issueTokens(user, reply);

      request.log.info({ event: "auth.register", userId: user.id }, "user registered");

      return reply.status(201).send({
        user: toPublicUser(user),
        accessToken,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        request.log.warn({ event: "auth.register_duplicate", email: normalizedEmail }, "duplicate email");
        return reply.status(400).send({
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message: "An account with this email already exists",
          },
        });
      }

      throw err;
    }
  });

  app.post("/auth/login", async (request, reply) => {
    const parsed = credentialsSchema.safeParse(request.body);

    if (!parsed.success) {
      request.log.warn({ event: "auth.login_validation_failed", issues: parsed.error.issues });
      return reply.status(400).send({
        error: {
          code: API_ERROR_CODES.VALIDATION_ERROR,
          message: parsed.error.issues[0]?.message ?? "Invalid request body",
        },
      });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      request.log.warn({ event: "auth.login_failed", email: normalizedEmail }, "login failed");
      return reply.status(401).send({
        error: {
          code: API_ERROR_CODES.UNAUTHORIZED,
          message: "Invalid email or password",
        },
      });
    }

    const { accessToken } = await issueTokens(user, reply);

    request.log.info({ event: "auth.login", userId: user.id }, "user logged in");

    return reply.send({
      user: toPublicUser(user),
      accessToken,
    });
  });

  app.post("/auth/refresh", async (request, reply) => {
    const refreshToken = request.cookies[REFRESH_COOKIE];

    if (!refreshToken) {
      request.log.warn({ event: "auth.refresh_missing" }, "refresh token missing");
      return reply.status(401).send({
        error: {
          code: API_ERROR_CODES.UNAUTHORIZED,
          message: "Refresh token missing",
        },
      });
    }

    let userId: string;

    try {
      const payload = await verifyRefreshToken(refreshToken);
      userId = payload.sub;
    } catch {
      request.log.warn({ event: "auth.refresh_invalid" }, "refresh token invalid");
      return reply.status(401).send({
        error: {
          code: API_ERROR_CODES.UNAUTHORIZED,
          message: "Invalid or expired refresh token",
        },
      });
    }

    const stored = await prisma.refreshToken.findFirst({
      where: {
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: { gt: new Date() },
      },
    });

    if (!stored) {
      request.log.warn({ event: "auth.refresh_not_found", userId }, "refresh token not found");
      return reply.status(401).send({
        error: {
          code: API_ERROR_CODES.UNAUTHORIZED,
          message: "Invalid or expired refresh token",
        },
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      request.log.warn({ event: "auth.refresh_user_missing", userId }, "refresh user missing");
      return reply.status(401).send({
        error: {
          code: API_ERROR_CODES.UNAUTHORIZED,
          message: "Invalid or expired refresh token",
        },
      });
    }

    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      planTier: user.planTier,
      subscriptionStatus: user.subscriptionStatus,
    });

    request.log.info({ event: "auth.refresh", userId: user.id }, "access token refreshed");

    return reply.send({ accessToken });
  });

  app.post(
    "/auth/logout",
    { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply) => {
      const user = (request as AuthenticatedRequest).user;
      const refreshToken = request.cookies[REFRESH_COOKIE];

      if (refreshToken) {
        await prisma.refreshToken.deleteMany({
          where: {
            userId: user.id,
            tokenHash: hashToken(refreshToken),
          },
        });
      }

      reply.clearCookie(REFRESH_COOKIE, { path: "/" });

      request.log.info({ event: "auth.logout", userId: user.id }, "user logged out");

      return reply.status(204).send();
    }
  );

  app.get(
    "/auth/me",
    { preHandler: [app.authenticate] },
    async (request: FastifyRequest, reply) => {
      const authUser = (request as AuthenticatedRequest).user;

      const user = await prisma.user.findUnique({ where: { id: authUser.id } });

      if (!user) {
        return reply.status(401).send({
          error: {
            code: API_ERROR_CODES.UNAUTHORIZED,
            message: "User not found",
          },
        });
      }

      const currentBinders = await prisma.binder.count({ where: { userId: user.id } });
      const maxBinders = maxBindersForPlan(
        user.planTier as PlanTier,
        user.subscriptionStatus
      );

      return reply.send({
        ...toPublicUser(user),
        limits: {
          maxBinders,
          currentBinders,
        },
      });
    }
  );
}
