# API Specification

Base URL: `http://localhost:4000` (dev) or configured production URL.

All JSON request/response bodies unless noted.

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | `{ email, password }` → user + tokens |
| POST | `/auth/login` | — | `{ email, password }` → tokens |
| POST | `/auth/refresh` | cookie | New access token |
| POST | `/auth/logout` | ✓ | Invalidate refresh token |
| GET | `/auth/me` | ✓ | Current user + plan info |

## Binders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/binders` | ✓ | List user's binders |
| POST | `/binders` | ✓ | Create binder; enforces plan limit |
| GET | `/binders/:id` | ✓ | Binder + all slots |
| PATCH | `/binders/:id` | ✓ | Update name, page_count, layout |
| DELETE | `/binders/:id` | ✓ | Delete binder and slots |

### Create binder body

```json
{
  "name": "Base Set Collection",
  "pageCount": 24,
  "layout": "GRID_3X3"
}
```

**Errors:** `403 BINDER_LIMIT_REACHED` when free user has 1 binder already.

## Slots

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PUT | `/binders/:id/pages/:page/slots/:row/:col` | ✓ | Place or update card |
| DELETE | `/binders/:id/pages/:page/slots/:row/:col` | ✓ | Clear slot |

### Place card body

```json
{
  "cardExternalId": "sv3-125",
  "cardName": "Pikachu",
  "imageUrl": "https://assets.tcgdex.net/...",
  "variant": "normal"
}
```

## Cards (TCGdex proxy)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/cards/search?q=` | ✓ | Search cards (cached) |
| GET | `/cards/:externalId` | ✓ | Card detail + pricing |

Query params for search: `q`, `set` (optional), `page`, `limit`.

## Billing (Phase 4)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/billing/checkout` | ✓ | Stripe Checkout session URL |
| POST | `/billing/portal` | ✓ | Stripe Customer Portal URL |
| POST | `/billing/webhook` | — | Stripe webhook (raw body) |

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | `{ status: "ok", db: "ok" }` |

## Error format

```json
{
  "error": {
    "code": "BINDER_LIMIT_REACHED",
    "message": "Free plan allows 1 binder. Upgrade to create more."
  }
}
```

## Status codes

| Code | Usage |
|------|-------|
| 400 | Validation error |
| 401 | Missing or invalid token |
| 403 | Plan limit or ownership violation |
| 404 | Resource not found |
| 429 | Rate limited (TCGdex proxy) |
| 500 | Internal error |
