import { createHash, randomUUID } from "node:crypto";
import * as jose from "jose";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  planTier: string;
  subscriptionStatus: string;
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
};

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

function accessExpiresIn(): string {
  return process.env.JWT_ACCESS_EXPIRES_IN ?? "15m";
}

function refreshExpiresIn(): string {
  return process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";
}

export function parseDurationMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) {
    throw new Error(`Invalid duration: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return value * multipliers[unit]!;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newTokenId(): string {
  return randomUUID();
}

export async function signAccessToken(payload: Omit<AccessTokenPayload, "sub"> & { sub: string }): Promise<string> {
  return new jose.SignJWT({
    email: payload.email,
    planTier: payload.planTier,
    subscriptionStatus: payload.subscriptionStatus,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(accessExpiresIn())
    .sign(getAccessSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jose.jwtVerify(token, getAccessSecret());

  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Invalid access token");
  }

  const email = payload.email;
  const planTier = payload.planTier;
  const subscriptionStatus = payload.subscriptionStatus;

  if (typeof email !== "string" || typeof planTier !== "string" || typeof subscriptionStatus !== "string") {
    throw new Error("Invalid access token claims");
  }

  return {
    sub: payload.sub,
    email,
    planTier,
    subscriptionStatus,
  };
}

export async function signRefreshToken(userId: string, jti: string): Promise<string> {
  return new jose.SignJWT({ jti })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(refreshExpiresIn())
    .sign(getRefreshSecret());
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jose.jwtVerify(token, getRefreshSecret());

  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Invalid refresh token");
  }

  const jti = payload.jti;
  if (typeof jti !== "string") {
    throw new Error("Invalid refresh token");
  }

  return { sub: payload.sub, jti };
}

export function refreshExpiresAt(): Date {
  return new Date(Date.now() + parseDurationMs(refreshExpiresIn()));
}
