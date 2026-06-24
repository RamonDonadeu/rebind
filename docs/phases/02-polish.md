# Phase 2 — Polish

**Status:** ⬜ Not started  
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

- [ ] Slot detail popover: change variant (`normal` | `reverse` | `holo`)
- [ ] `PATCH` slot or `PUT` with variant only
- [ ] Visual badge on slot showing variant
- [ ] API: validate variant enum

### 2B — Drag and drop

- [ ] Drag card between slots (same page first; cross-page optional)
- [ ] API: consider `POST /binders/:id/slots/swap` or two PUTs
- [ ] Touch-friendly fallback for mobile (long-press → move)

### 2C — Binder management

- [ ] Duplicate binder (copy all slots) — counts toward plan limit
- [ ] Edit page count with confirmation if shrinking loses cards
- [ ] Change layout (only if empty, or with warning)

### 2D — Responsive / mobile

- [ ] Binder grid usable on phone (smaller cells, scroll)
- [ ] Page navigator as horizontal scroll strip
- [ ] Search modal full-screen on mobile

### 2E — UX polish

- [ ] Empty states (no binders, empty page)
- [ ] Toast notifications for errors/success
- [ ] Loading skeletons for grid
- [ ] Keyboard: Escape closes modal

## API changes (if needed)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/binders/:id/duplicate` | Clone binder + slots |
| POST | `/binders/:id/slots/swap` | Swap two slots (optional) |

Update `docs/API.md` when adding endpoints.

## Acceptance criteria

- [ ] User can mark a slot as reverse holo and see badge
- [ ] Drag card from slot A to slot B works
- [ ] Duplicate binder creates copy with new name
- [ ] Usable on 375px wide viewport
- [ ] No regression to MVP flows

## Agent prompt starter

```
Implement Phase 2 (Polish) for ReBind.
Read docs/phases/02-polish.md.
MVP must be complete. Pick sub-section 2A-2E as scoped.
Do not implement pricing or Stripe.
```
