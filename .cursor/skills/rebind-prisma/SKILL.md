---
name: rebind-prisma
description: >-
  Prisma schema and migrations for ReBind (`packages/db`). Use when changing
  `schema.prisma`, adding tables/columns/enums, or creating database migrations.
---

# ReBind Prisma

Schema: `packages/db/prisma/schema.prisma`  
Migrations: `packages/db/prisma/migrations/` (generated only — never hand-written)

## Migration workflow

1. Edit `schema.prisma` only.
2. Generate the migration with Prisma CLI — **do not** create `migrations/*/migration.sql` yourself.

```bash
# From repo root (preferred)
npm run migrate -w @rebind/db -- --name descriptive_snake_case_name

# Or from packages/db
cd packages/db
npx prisma migrate dev --name descriptive_snake_case_name
```

3. Commit both `schema.prisma` and the new folder under `migrations/`.
4. Regenerate client if needed: `npm run db:generate`

## Production / CI

Apply existing migrations only — never create new ones on prod:

```bash
npm run db:migrate:deploy
```

Docker dev: `docker compose exec api npm run db:migrate`

## Rules

| Do | Don't |
|----|-------|
| `prisma migrate dev` after schema changes | Hand-write `migration.sql` files |
| Descriptive `--name` (e.g. `binder_slot_owned`) | Empty or timestamp-only names |
| `@map` / `@@map` for snake_case DB columns | Raw SQL unless Prisma cannot express it |

Use `prisma db push` only for throwaway local experiments — not for changes that ship in the repo.

## References

- [docs/DATABASE.md](../../docs/DATABASE.md)
- [.cursor/rules/prisma-migrations.mdc](../rules/prisma-migrations.mdc)
