# Phase 1A — Auth API

**Status:** ⬜ Not started  
**Layer:** `apps/api`  
**Depends on:** [Phase 0](00-foundation.md)  
**Blocks:** 1B, 1C, 1D

## Goal

Users can register, log in, refresh tokens, and access protected routes. All binder/card routes will require auth from this phase onward.

## Prerequisites

- Phase 0 complete (DB migrated, API runs)
- `User` model in Prisma schema

## Out of scope

- Binder or card endpoints
- Web UI / login pages (Phase 1D)
- Stripe, pricing, email verification, OAuth, password reset
- Plan limit enforcement beyond returning `planTier` in `/auth/me`

## Deliverables

### API routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create user, return tokens |
| POST | `/auth/login` | Validate credentials, return tokens |
| POST | `/auth/refresh` | Issue new access token |
| POST | `/auth/logout` | Invalidate refresh token |
| GET | `/auth/me` | Current user + plan info |

### Implementation

- [ ] `apps/api/src/routes/auth.ts` — route handlers
- [ ] `apps/api/src/lib/password.ts` — bcrypt hash/compare
- [ ] `apps/api/src/lib/jwt.ts` — sign/verify access + refresh tokens
- [ ] `apps/api/src/plugins/auth.ts` — `authenticate` decorator / preHandler
- [ ] Zod schemas for register/login bodies
- [ ] Register routes in `apps/api/src/index.ts`
- [ ] Store refresh tokens (choose one):
  - **Option A (simpler):** httpOnly cookie + DB table `refresh_tokens`
  - **Option B:** Return refresh token in JSON body (less secure, ok for MVP)

### DB (if Option A)

Add to schema if not present:

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  tokenHash String   @map("token_hash")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
  @@map("refresh_tokens")
}
```

### Env vars (already in `.env.example`)

- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`

### Dependencies to add

- `bcrypt` or `@node-rs/bcrypt`
- `jsonwebtoken` or `jose`
- `zod`

## Response shapes

### POST `/auth/register` & `/auth/login`

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "planTier": "free",
    "subscriptionStatus": "none"
  },
  "accessToken": "eyJ..."
}
```

### GET `/auth/me`

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "planTier": "free",
  "subscriptionStatus": "none",
  "limits": {
    "maxBinders": 1,
    "currentBinders": 0
  }
}
```

## Acceptance criteria

- [ ] Register creates user with `planTier: free`, never returns `passwordHash`
- [ ] Duplicate email → `400` with clear error
- [ ] Login with wrong password → `401`
- [ ] Protected route without token → `401`
- [ ] Valid access token → request proceeds, `request.user` populated
- [ ] Expired access + valid refresh → new access token
- [ ] All auth events logged with `event` field (`auth.register`, `auth.login_failed`, etc.)
- [ ] Passwords never appear in logs (redaction already configured)

## Handoff notes

**Phase 1B** will use `authenticate` preHandler on all `/binders/*` routes.  
**Phase 1D** needs `accessToken` in response and CORS `credentials: true` (already set).  
Export types: `AuthenticatedRequest` with `user: { id, email, planTier, subscriptionStatus }`.

## Agent prompt starter

```
Implement Phase 1A (Auth API) for ReBind.
Read docs/phases/01a-auth-api.md and docs/API.md#auth.
Do not implement binders, cards, or web UI.
Use @rebind/db and structured logging.
```
