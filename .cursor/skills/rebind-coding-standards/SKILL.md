---
name: rebind-coding-standards
description: >-
  ReBind coding standards — feature-based folder structure, clean code, naming,
  small functions/files, tests, comments, and structured logs. Use when writing,
  reviewing, or refactoring code in this repo.
---

# ReBind Coding Standards

Apply these standards on every change. Match existing code before inventing new patterns.

## Folder structure by feature

Organize by **domain feature**, not by technical layer alone.

### API (`apps/api/src/`)

```
features/
  auth/
    auth.routes.ts      # Fastify route registration
    auth.schemas.ts     # Zod validators
    auth.service.ts     # Business logic (no HTTP)
  binders/
    binders.routes.ts
    binders.service.ts
    binders.schemas.ts
plugins/                # Cross-cutting Fastify plugins (auth, logging)
lib/                    # Shared infra only (logger, jwt, password)
```

- One feature = one folder with routes, schemas, and service split.
- Routes stay thin: parse → call service → map response.
- Shared helpers belong in `lib/` only when used by 2+ features.

### Web (`apps/web/src/`)

```
features/
  auth/
    components/
    hooks/
    api.ts              # Typed fetch wrappers for this feature
  binders/
    components/
    hooks/
    api.ts
app/                    # Next.js App Router pages (compose features)
components/             # Truly shared UI (buttons, layout shells)
lib/                    # Shared client/server utilities
```

- Pages in `app/` orchestrate feature components; avoid fat page files.
- Co-locate feature-specific hooks and API calls with the feature.

### Packages

- `packages/shared` — types, constants, plan config (no I/O)
- `packages/db` — Prisma schema and client only

When adding a new feature, create its folder first; do not append unrelated logic to existing feature files.

## File and function size

| Guideline | Target |
|-----------|--------|
| File length | Prefer **&lt; 200 lines**; split before ~300 |
| Function length | Prefer **&lt; 30 lines**; split before ~50 |
| Parameters | **≤ 4**; use an options object beyond that |
| Nesting depth | **≤ 3** levels; extract early returns or helpers |

**If a function feels complex, make it smaller.** Extract private helpers in the same file first; move to `*.service.ts` or `lib/` when reused.

Signs a function should be split:
- Multiple responsibilities (validate + persist + notify)
- Hard to name in one verb phrase
- Needs a block comment to explain flow
- More than one `try/catch` or nested `if/else` chain

## Naming

- **Files:** `kebab-case.ts` / `PascalCase.tsx` for React components
- **Functions:** verb + noun — `createBinder`, `validateSlotPosition`, `hashPassword`
- **Booleans:** `is`, `has`, `can` — `isAuthenticated`, `hasReachedBinderLimit`
- **Types/interfaces:** `PascalCase` — `BinderSlot`, `CreateBinderInput`
- **Constants:** `SCREAMING_SNAKE` — `REFRESH_COOKIE`, `API_ERROR_CODES`
- **Events (logs):** `domain.action` or `domain.action_result` — `binder.created`, `auth.login_failed`
- Avoid vague names: `data`, `info`, `handle`, `process`, `utils` (prefer specific nouns)

Names should reveal intent without reading the body.

## Clean code

1. **Single responsibility** — one reason to change per module/function
2. **Thin boundaries** — routes/pages delegate; services own business rules
3. **Explicit errors** — `{ error: { code, message } }` in API; no silent failures
4. **No magic** — named constants for limits, TTLs, cookie names
5. **Minimize scope** — smallest correct diff; no drive-by refactors
6. **DRY with judgment** — extract on the second real duplication, not the first guess

Enforce business rules in the **API**, not only the UI.

## Comments

- Code should be self-explanatory via naming and structure.
- Comment **why**, not what — non-obvious business rules, security tradeoffs, TCGdex quirks.
- Do **not** comment obvious code or use comments to excuse unclear naming.
- No commented-out dead code — delete it.

## Logging

Follow the `rebind-logging` skill. Summary:

- **Never** `console.log` in API code
- Use `request.log` / `app.log` with structured fields
- Always include searchable `event` field
- Log outcomes that matter: created, failed, limit reached — not every line of happy path

```ts
request.log.info({ event: "binder.created", binderId }, "binder created");
request.log.warn({ event: "binder.limit_reached", userId }, "binder limit reached");
request.log.error({ err, event: "tcgdex.failed", cardId }, "tcgdex request failed");
```

## Tests

Add tests when they protect real behavior — not to tick a box.

**Prioritize:**
- Business rules (plan limits, slot validation, auth edge cases)
- Pure functions (parsers, mappers, price calculations)
- API route integration for critical paths (auth, binder CRUD)

**Skip:**
- Trivial getters, one-line wrappers, framework boilerplate
- Tests that only assert mocks were called

**Conventions (when test runner is added):**
- Co-locate as `*.test.ts` next to source, or `__tests__/` inside the feature folder
- Name: `describe("createBinder")` → `it("returns 403 when plan limit reached")`
- Arrange–Act–Assert; one assertion focus per test when practical

## Refactor checklist

Before finishing a change, verify:

- [ ] Code lives in the correct **feature folder**
- [ ] No file or function exceeds size guidelines (or you split it)
- [ ] Names are specific and consistent with surrounding code
- [ ] Business logic is in service layer, not route/page
- [ ] Errors and validation use existing patterns (Zod, `API_ERROR_CODES`)
- [ ] Logs use `event` field on meaningful paths
- [ ] Comments explain non-obvious **why** only
- [ ] Tests added for new business rules (when test infra exists)

## References

- [.cursor/rules/api-conventions.mdc](../../rules/api-conventions.mdc)
- [.cursor/rules/web-conventions.mdc](../../rules/web-conventions.mdc)
- [rebind-logging skill](../rebind-logging/SKILL.md)
- [docs/LOGGING.md](../../docs/LOGGING.md)
