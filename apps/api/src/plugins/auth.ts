import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { API_ERROR_CODES } from "@rebind/shared";
import { verifyAccessToken } from "../lib/jwt.js";

export type AuthUser = {
  id: string;
  email: string;
  planTier: "free" | "collector";
  subscriptionStatus: "none" | "active" | "past_due" | "canceled";
};

export type AuthenticatedRequest = FastifyRequest & {
  user: AuthUser;
};

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

async function authPlugin(app: FastifyInstance) {
  app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({
        error: {
          code: API_ERROR_CODES.UNAUTHORIZED,
          message: "Missing or invalid authorization header",
        },
      });
    }

    const token = authHeader.slice("Bearer ".length);

    try {
      const payload = await verifyAccessToken(token);
      request.user = {
        id: payload.sub,
        email: payload.email,
        planTier: payload.planTier as AuthUser["planTier"],
        subscriptionStatus: payload.subscriptionStatus as AuthUser["subscriptionStatus"],
      };
    } catch {
      return reply.status(401).send({
        error: {
          code: API_ERROR_CODES.UNAUTHORIZED,
          message: "Invalid or expired access token",
        },
      });
    }
  });
}

export default fp(authPlugin, {
  name: "rebind-auth",
});
