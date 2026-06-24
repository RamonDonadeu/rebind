---
name: rebind-phases
description: >-
  ReBind development phases and MVP roadmap. Use when starting implementation
  work to identify the correct phase scope, dependencies, and out-of-scope items.
  Directs agents to docs/phases/ for single-phase focus.
---

# ReBind Development Phases

## Before coding

1. Read [docs/phases/README.md](../../docs/phases/README.md) for the dependency map
2. Open **only** the phase file assigned to you
3. Implement deliverables + acceptance criteria in that file only
4. Mark checklist items done when complete

## MVP = Phases 0 → 1E

| Phase | File | Focus |
|-------|------|-------|
| 0 | `00-foundation.md` | Docker, DB, health |
| 1A | `01a-auth-api.md` | Auth API |
| 1B | `01b-binders-api.md` | Binders + slots API |
| 1C | `01c-tcgdex-proxy.md` | Card search proxy |
| 1D | `01d-web-auth-shell.md` | Login/register UI |
| 1E | `01e-binder-editor-ui.md` | Grid + search → **MVP done** |

## Post-MVP (independent after 1E)

| Phase | File | Focus |
|-------|------|-------|
| 2 | `02-polish.md` | Variants, drag-drop, mobile |
| 3 | `03-collection-value.md` | Pricing cache, binder total |
| 4 | `04-payments.md` | Stripe subscriptions |
| 5 | `05-enhancements.md` | History, export, share |

## Parallel tracks after 1A

```
1A → 1B ─┐
1A → 1C ─┼→ 1E
1A → 1D ─┘
```

## Global rules

- API enforces plan limits, not UI alone
- TCGdex via API proxy only; never pokemontcg.io
- Structured logs with `event` field
- See `rebind-domain` skill for product rules
