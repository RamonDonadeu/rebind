# Phase 1C — TCGdex Proxy

**Status:** ✅ Complete  
**Layer:** `apps/api`  
**Depends on:** [Phase 1A](01a-auth-api.md)  
**Blocks:** Phase 1E

## Goal

Authenticated card search and detail via TCGdex, proxied and cached through the API. Frontend never calls TCGdex directly.

## Prerequisites

- Phase 1A complete (routes require auth)
- Redis running (docker-compose includes it)

## Out of scope

- Storing prices in `card_prices` (Phase 3)
- Persisting card data beyond what client sends to slot endpoints
- Web search UI (Phase 1E)
- Japanese/multilingual UI (use `TCGDEX_LANG=en` for now)
- pokemontcg.io / Scrydex

## Deliverables

### API routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cards/search` | Search cards by name (and optional set) |
| GET | `/cards/:externalId` | Full card detail |

### Query params (`/cards/search`)

| Param | Required | Description |
|-------|----------|-------------|
| `q` | yes | Search term (name) |
| `set` | no | Filter by set id |
| `page` | no | Pagination (default 1) |
| `limit` | no | Results per page (default 20, max 50) |

### Implementation

- [x] `apps/api/src/routes/cards.ts`
- [x] `apps/api/src/services/tcgdex.service.ts` — HTTP client for TCGdex
- [x] `apps/api/src/services/cache.service.ts` — Redis get/set with TTL
- [x] `apps/api/src/lib/tcgdex.types.ts` — normalize TCGdex response shapes
- [x] Connect Redis client on API startup (graceful if Redis down — log warning, skip cache)

### TCGdex endpoints

```
GET {TCGDEX_BASE_URL}/{lang}/cards?name={q}
GET {TCGDEX_BASE_URL}/{lang}/cards/{id}
```

Base: `https://api.tcgdex.net/v2` — see [tcgdex.dev](https://tcgdex.dev/).

### Cache keys & TTL

| Key | TTL |
|-----|-----|
| `tcgdex:search:{hash}` | 1 hour |
| `tcgdex:card:{id}` | 24 hours |

### Normalized search response

```json
{
  "data": [
    {
      "externalId": "sv3-125",
      "name": "Pikachu",
      "imageUrl": "https://assets.tcgdex.net/en/sv/sv3/125",
      "setId": "sv3",
      "localId": "125"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 42 }
}
```

Append `/high.webp` or `/low.webp` to image URL per TCGdex asset conventions if needed.

### Normalized card detail

Include fields useful for slot placement: `externalId`, `name`, `imageUrl`, `setId`, `rarity`, `localId`.  
Include `pricing` object if present — **display only**, do not persist (Phase 3).

### Error handling

- TCGdex timeout/down → `502` with `TCGDEX_UNAVAILABLE`
- Not found → `404`
- Rate limit internally if needed → `429`

### Dependencies to add

- `ioredis` or `redis` (node-redis v4)

## Acceptance criteria

- [x] Search "pikachu" returns card list with images
- [x] Second identical search served from Redis cache (log `tcgdex.cache_hit`)
- [x] `GET /cards/:id` returns card detail
- [x] Routes require authentication
- [x] No TCGdex API key required
- [x] TCGdex errors logged with `event: "tcgdex.error"`

## Handoff to Phase 1E

Search modal will call `GET /cards/search?q=` and use returned `externalId`, `name`, `imageUrl` in `PUT` slot request.

Image URL format must work in `<img src>` tags.

## Agent prompt starter

```
Implement Phase 1C (TCGdex proxy) for ReBind.
Read docs/phases/01c-tcgdex-proxy.md and docs/API.md#cards.
Requires Phase 1A auth. Use Redis cache.
Do not implement web UI or card_prices table writes.
```
