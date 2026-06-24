# ReBind — Agent Context

## Product

ReBind lets collectors build **digital Pokémon TCG binders**: N pages, each with a 3×3 or 3×4 card grid. Users search cards and place them in slots. No marketplace or trading in scope.

## Monorepo

- `apps/api` — Fastify REST API (auth, binders, card proxy)
- `apps/web` — Next.js UI
- `packages/db` — Prisma + PostgreSQL
- `packages/shared` — Types, plan limits, constants

## External services

- **Card catalog + prices (MVP):** [TCGdex](https://tcgdex.dev/) — free, no key. Backend proxies and caches; frontend never calls TCGdex directly in production.
- **Payments (later):** Stripe subscriptions — free tier = 1 binder, paid = more.

## Conventions

- Enforce plan limits (binder count) in the **API**, not only the UI.
- Store `cardExternalId` + `variant` + `owned` on slots; prices live in `card_prices` cache, not on slots.
- Use `PLANS` config in `packages/shared` for tier limits.
- Docker: dev = `docker-compose.yml`, prod/Dockploy = `docker-compose.prod.yml`.
- Dockploy env vars go in UI → `.env`; services use `env_file: .env` or `${VAR}` — redeploy after changes.
- Logging: API emits JSON stdout; central stack in `docker/logging/` (Loki + Grafana). See [docs/LOGGING.md](docs/LOGGING.md).

## Docs

Read `docs/phases/README.md` for **implementation phases** (agent-scoped work).
Read `docs/PLAN.md` for product vision, `docs/ARCHITECTURE.md` for design, `docs/DEPLOYMENT.md` for Dockploy, `docs/LOGGING.md` for centralized logs.

## Implementation workflow

1. Pick a phase from `docs/phases/` (e.g. `01a-auth-api.md`)
2. Complete only that phase's deliverables and acceptance criteria
3. Update the phase checklist and `docs/phases/README.md` status table
4. Use [Conventional Commits](docs/RELEASE.md) in PR titles (`feat:`, `fix:`, etc.) for automated releases
