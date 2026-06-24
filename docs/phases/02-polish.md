# Phase 2 — Polish

**Status:** ✅ Complete  
**Layer:** Full-stack  
**Depends on:** [Phase 1E](01e-binder-editor-ui.md) (MVP)  
**Blocks:** Phase 5 (partially)

## Goal

Improve binder editing UX: variants, drag-and-drop, mobile layout, binder management.

## Prerequisites

- MVP complete (Phase 1E)

## Out of scope

- Collection value / pricing (Phase 3)
- Stripe / subscriptions (Phase 4)
- Price history charts (Phase 5)
- Share links, PDF export (Phase 5)

## Deliverables

### 2A — Variant picker

- [x] Slot detail popover: change variant (`normal` | `reverse` | `holo`)
- [x] `PATCH` slot or `PUT` with variant only
- [x] Visual badge on slot showing variant
- [x] API: validate variant enum

### 2B — Drag and drop

- [x] Drag card between slots (same page first; cross-page optional)
- [x] API: consider `POST /binders/:id/slots/swap` or two PUTs
- [x] Touch-friendly fallback for mobile (long-press → move)

### 2C — Binder management

- [x] Duplicate binder (copy all slots) — counts toward plan limit
- [x] Edit page count with confirmation if shrinking loses cards
- [x] Change layout (only if empty, or with warning)

### 2D — Responsive / mobile

- [x] Binder grid usable on phone (smaller cells, scroll)
- [x] Page navigator as horizontal scroll strip
- [x] Search modal full-screen on mobile

### 2E — UX polish

- [x] Empty states (no binders, empty page)
- [x] Toast notifications for errors/success
- [x] Loading skeletons for grid
- [x] Keyboard: Escape closes modal

## API changes (if needed)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/binders/:id/duplicate` | Clone binder + slots |
| POST | `/binders/:id/slots/swap` | Swap two slots (optional) |

Update `docs/API.md` when adding endpoints.

## Acceptance criteria

- [x] User can mark a slot as reverse holo and see badge
- [x] Drag card from slot A to slot B works
- [x] Duplicate binder creates copy with new name
- [x] Usable on 375px wide viewport
- [x] No regression to MVP flows

## Agent prompt starter

```
Implement Phase 2 (Polish) for ReBind.
Read docs/phases/02-polish.md.
MVP must be complete. Pick sub-section 2A-2E as scoped.
Do not implement pricing or Stripe.
```
