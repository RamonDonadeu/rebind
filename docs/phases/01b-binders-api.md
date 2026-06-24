# Phase 1B — Binders API

**Status:** ✅ Complete  
**Layer:** `apps/api`  
**Depends on:** [Phase 1A](01a-auth-api.md)  
**Blocks:** Phase 1E

## Goal

Authenticated users can create, read, update, and delete binders. Slots are pre-created for every page/cell. Users can place and clear cards in slots.

## Prerequisites

- Phase 1A complete (`authenticate` middleware works)
- `Binder`, `BinderSlot` models in Prisma

## Out of scope

- TCGdex search (Phase 1C) — accept card data in request body as-is
- Web UI (Phase 1E)
- Variant picker UI (Phase 2) — accept `variant` field, default `normal`
- Pricing, valuations, Stripe
- Drag-and-drop, duplicate binder
- Soft-lock on downgrade (Phase 4) — enforce simple count limit only

## Deliverables

### API routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/binders` | List user's binders (summary) |
| POST | `/binders` | Create binder + pre-create all slots |
| GET | `/binders/:id` | Binder metadata + all slots |
| PATCH | `/binders/:id` | Update name, pageCount, layout |
| DELETE | `/binders/:id` | Delete binder (cascade slots) |
| PUT | `/binders/:id/pages/:page/slots/:row/:col` | Place card |
| DELETE | `/binders/:id/pages/:page/slots/:row/:col` | Clear slot |

### Implementation

- [x] `apps/api/src/routes/binders.ts`
- [x] `apps/api/src/services/binder.service.ts` — business logic
- [x] `apps/api/src/lib/slots.ts` — `createSlotsForBinder(binderId, pageCount, layout)`
- [x] Plan limit check on `POST /binders` using `maxBindersForPlan()` from `@rebind/shared`
- [x] Ownership check: user can only access own binders → `404`
- [x] Zod validation for create/patch/place bodies

### Slot pre-creation logic

On binder create:

```
for pageIndex in 0..pageCount-1:
  for row in 0..rows-1:
    for col in 0..cols-1:
      create BinderSlot(binderId, pageIndex, row, col)
```

Use `LAYOUT_SLOTS` and `slotsPerPage()` from `@rebind/shared`.

### Plan enforcement

```ts
const count = await prisma.binder.count({ where: { userId } });
if (count >= maxBindersForPlan(user.planTier, user.subscriptionStatus)) {
  throw forbidden("BINDER_LIMIT_REACHED", ...);
}
```

Free tier = 1 binder. No Stripe yet — all users are `free` / `none`.

### PATCH behavior

- Changing `pageCount` **up**: create new empty slots for new pages
- Changing `pageCount` **down**: delete slots on removed pages (confirm cards lost)
- Changing `layout`: requires empty binder (all slots cleared); otherwise `400`

### Place card body

```json
{
  "cardExternalId": "sv3-125",
  "cardName": "Pikachu",
  "imageUrl": "https://assets.tcgdex.net/en/sv/sv3/125",
  "variant": "normal"
}
```

Client provides data from TCGdex (Phase 1C). This phase does not validate against TCGdex.

## Acceptance criteria

- [x] Free user can create 1 binder; second → `403 BINDER_LIMIT_REACHED`
- [x] `GET /binders/:id` returns all slots for all pages (including empty)
- [x] Place card updates slot; clear sets card fields to null
- [x] Cannot access another user's binder
- [x] `page` param is 0-based in API (document in responses)
- [x] Delete binder removes all slots
- [x] Events logged: `binder.created`, `binder.deleted`, `slot.placed`, `slot.cleared`

## Handoff to Phase 1E

Web editor expects:

- `GET /binders/:id` → `{ id, name, pageCount, layout, slots: [...] }`
- Slots include `pageIndex`, `row`, `col`, nullable card fields
- `PUT` slot endpoint for placement after search

## Agent prompt starter

```
Implement Phase 1B (Binders API) for ReBind.
Read docs/phases/01b-binders-api.md and docs/API.md#binders.
Requires Phase 1A auth middleware.
Do not implement TCGdex proxy or web UI.
Pre-create all slots on binder create.
```
