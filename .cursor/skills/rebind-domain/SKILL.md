---
name: rebind-domain
description: >-
  ReBind product domain — digital Pokémon TCG binders, TCGdex card API,
  binder slots, plan limits, and pricing cache patterns. Use when implementing
  binders, cards, subscriptions, collection value, or any ReBind feature.
---

# ReBind Domain

## Product

Digital Pokémon TCG binder organizer. Users create binders (e.g. 24 pages), pick 3×3 or 3×4 grids, search cards, place them in slots.

**Not in scope:** marketplace, trading, money management (pricing is informational only).

## Card API

Use **[TCGdex](https://tcgdex.dev/)** — free, no API key.

- Search: `GET https://api.tcgdex.net/v2/en/cards` with filters
- Card detail + pricing: `GET https://api.tcgdex.net/v2/en/cards/{id}`
- Do **not** use pokemontcg.io (paid Scrydex migration)

Proxy TCGdex through `apps/api`; cache in Redis. Frontend never calls TCGdex in production.

## Data rules

| Store on slot | Do NOT store on slot |
|---------------|----------------------|
| `cardExternalId`, `cardName`, `imageUrl`, `variant` | Price |

Prices → `card_prices` table (cache). Binder total → `binder_valuations` snapshot.

## Plan limits

Config: `packages/shared/src/plans.ts`

- Free: 1 binder
- Collector (paid): 50 binders

Enforce in API on `POST /binders`. Error code: `BINDER_LIMIT_REACHED`.

## Slot grid

- `layout`: `GRID_3X3` (9 slots/page) or `GRID_3X4` (12 slots/page)
- `page_index`: 0-based in DB, 1-based in UI
- Pre-create all slots when binder is created

## Variants (pricing accuracy)

`normal` | `reverse` | `holo` — required for meaningful collection value.

## References

- [docs/PLAN.md](../../docs/PLAN.md)
- [docs/DATABASE.md](../../docs/DATABASE.md)
- [docs/API.md](../../docs/API.md)
