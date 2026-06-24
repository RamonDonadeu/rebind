# Phase 0 — Foundation

**Status:** 🟡 Mostly complete  
**Layer:** Infrastructure  
**Depends on:** —  
**Blocks:** All other phases

## Goal

Runnable local/prod environment with database schema, API health check, web shell, logging, and Docker/Dockploy wiring.

## Prerequisites

None — this is the starting point.

## Out of scope

- Auth, binders, cards, payments, pricing UI
- Any feature beyond health/status pages

## Deliverables

### Done ✅

- [x] Monorepo (`apps/api`, `apps/web`, `packages/db`, `packages/shared`)
- [x] Prisma schema (`users`, `binders`, `binder_slots`, `card_prices`, `binder_valuations`)
- [x] Initial SQL migration
- [x] `docker-compose.yml` (dev) + `docker-compose.prod.yml` (Dockploy)
- [x] API `/health` with DB check
- [x] Web landing page with API status
- [x] Structured logging (Pino) + `docker/logging/` stack
- [x] Plan config in `packages/shared/src/plans.ts`
- [x] Documentation + Cursor skills/rules

### Remaining

- [ ] Verify `docker compose up --build` works end-to-end
- [ ] Verify `docker compose exec api npm run db:migrate:deploy` applies migration
- [ ] Confirm web → API health check works inside Docker (`API_INTERNAL_URL`)

## Files (reference)

```
package.json
docker-compose.yml
docker-compose.prod.yml
packages/db/prisma/schema.prisma
packages/db/prisma/migrations/
apps/api/src/index.ts
apps/api/src/lib/logger.ts
apps/web/src/app/page.tsx
```

## Acceptance criteria

- [ ] `GET /health` returns `{ status: "ok", db: "ok" }` with Postgres running
- [ ] Web at `:3000` shows API + DB status green
- [ ] Logs are JSON with `service: "rebind-api"`

## Handoff to Phase 1A

Next phases expect:

- Prisma client importable as `@rebind/db`
- `User` model exists in schema (auth will use it)
- `PLANS` and `maxBindersForPlan()` available from `@rebind/shared`
- Fastify app registers plugins in `apps/api/src/plugins/`
- Routes go in `apps/api/src/routes/`

## Agent prompt starter

```
Implement Phase 0 remaining items for ReBind.
Read docs/phases/00-foundation.md.
Verify Docker stack and DB migrations work.
Do not implement auth or binders.
```
