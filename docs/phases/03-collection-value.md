# Phase 3 — Collection Value

**Status:** ⬜ Not started  
**Layer:** Full-stack  
**Depends on:** [Phase 1E](01e-binder-editor-ui.md) (MVP)  
**Blocks:** Phase 5 (price history)

## Goal

Show approximate binder collection value using TCGdex embedded pricing, with cached prices and refresh strategy.

## Prerequisites

- MVP complete
- TCGdex proxy (Phase 1C) — extend to expose pricing
- `card_prices` and `binder_valuations` tables exist in schema (already defined)

## Out of scope

- Stripe / paid tiers (Phase 4)
- Price history charts (Phase 5)
- Graded/PSA prices
- PkmnPrices / Scrydex integration (future if TCGdex insufficient)
- Storing prices on slot rows

## Deliverables

### 3A — Price cache service

- [ ] `apps/api/src/services/price.service.ts`
- [ ] On fetch card detail, upsert `card_prices` for each variant with data
- [ ] `GET /cards/:id` response includes cached price if fresh (<24h)
- [ ] Price fields: `marketPrice`, `lowPrice`, `currency`, `source` (`tcgplayer` / `cardmarket`)

### 3B — Binder valuation

- [ ] `apps/api/src/services/valuation.service.ts`
- [ ] `GET /binders/:id/valuation` — computed total + metadata
- [ ] `POST /binders/:id/valuation/refresh` — on-demand refresh
- [ ] Upsert `binder_valuations` snapshot
- [ ] Sum slot values: join slot → `card_prices` by `cardExternalId` + `variant`
- [ ] Track `pricedCount`, `missingPriceCount`, `computedAt`

### 3C — Background refresh (optional for hobby scale)

- [ ] `apps/api/src/jobs/refresh-prices.ts` — cron or manual script
- [ ] Collect distinct card+variant IDs from all slots platform-wide
- [ ] Batch fetch from TCGdex with rate limiting
- [ ] Document running via `docker compose exec api node ...` or scheduled Dockploy job

### 3D — Web UI

- [ ] Binder header: "Collection value: $X.XX (as of DATE)"
- [ ] Partial total note when some cards lack prices
- [ ] "Refresh prices" button → `POST .../refresh`
- [ ] Per-slot: show small price under card (optional)
- [ ] Currency toggle USD/EUR (if Cardmarket data available)

## Valuation response

```json
{
  "totalUsd": 1247.50,
  "totalEur": null,
  "cardCount": 87,
  "pricedCount": 82,
  "missingPriceCount": 5,
  "computedAt": "2026-06-24T15:00:00Z",
  "partial": true
}
```

## Acceptance criteria

- [ ] Binder with priced cards shows total
- [ ] Cards without TCGdex pricing excluded from total, counted in `missingPriceCount`
- [ ] Refresh updates `computedAt` and values
- [ ] Prices not duplicated on every slot row in DB
- [ ] 24h cache prevents hammering TCGdex on every page load

## Agent prompt starter

```
Implement Phase 3 (Collection value) for ReBind.
Read docs/phases/03-collection-value.md and docs/PLAN.md pricing strategy.
Use card_prices cache and binder_valuations table.
Do not implement Stripe or price history charts.
```
