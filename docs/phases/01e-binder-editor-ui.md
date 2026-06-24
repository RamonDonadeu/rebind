# Phase 1E — Binder Editor UI (MVP Complete)

**Status:** ⬜ Not started  
**Layer:** `apps/web` (+ minor API tweaks if needed)  
**Depends on:** [1B](01b-binders-api.md), [1C](01c-tcgdex-proxy.md), [1D](01d-web-auth-shell.md)  
**Blocks:** Phases 2, 3, 4

## Goal

**Complete the MVP.** Users manage binders and place cards in a visual grid.

## Prerequisites

- All Phase 1A–1D complete
- Full binder + card API working

## Out of scope

- Variant picker modal (Phase 2) — always place as `normal`
- Drag-and-drop (Phase 2)
- Binder valuation / prices (Phase 3)
- Stripe upgrade flow (Phase 4)
- Duplicate binder, PDF export

## Deliverables

### Pages & flows

| Flow | Description |
|------|-------------|
| Binder list | `/binders` — list binders, create button, show limit "1/1" |
| Create binder | Modal/page: name, page count (default 24), layout 3×3 / 3×4 |
| Binder editor | `/binders/[id]` — page navigator + grid |
| Place card | Click empty slot → search modal → select → slot updates |
| Clear card | Click filled slot → clear or replace |
| Edit binder | Rename, delete binder |

### Components

- [ ] `BinderCard.tsx` — list item
- [ ] `CreateBinderDialog.tsx`
- [ ] `BinderGrid.tsx` — CSS grid, correct aspect ratio (~2.5:3.5)
- [ ] `CardSlot.tsx` — empty state / card thumbnail
- [ ] `PageNavigator.tsx` — prev/next, page number pills (1–24)
- [ ] `CardSearchModal.tsx` — debounced search, results list
- [ ] `BinderHeader.tsx` — name, back link, delete

### Grid behavior

- Read `layout` from binder → 3×3 or 3×4
- Filter slots for current `pageIndex` (UI page 1 = API page 0)
- Optimistic UI optional; must reconcile on API error
- Lazy-load images (`loading="lazy"`)

### Create binder limit

When at free limit, disable create button and show message:

> Free plan includes 1 binder.

(API still enforces — UI is advisory.)

### API integration

| Action | Call |
|--------|------|
| List | `GET /binders` |
| Create | `POST /binders` |
| Load editor | `GET /binders/:id` |
| Place card | `PUT /binders/:id/pages/:p/slots/:r/:c` |
| Clear | `DELETE ...` same path |
| Search | `GET /cards/search?q=` |
| Delete binder | `DELETE /binders/:id` |

## Acceptance criteria (MVP)

- [ ] Register → create binder → 24 pages visible
- [ ] Search "Charizard" → place card in slot → image shows
- [ ] Navigate to page 5 → place another card
- [ ] Reload browser → binder state persisted
- [ ] Clear slot works
- [ ] Second binder creation blocked with clear error
- [ ] Delete binder returns to list
- [ ] Works on desktop viewport (mobile polish is Phase 2)
- [ ] No console errors; broken images show fallback

## MVP milestone 🎉

When this phase is done, update `docs/phases/README.md` status table: **MVP complete**.

## Handoff notes

**Phase 2** adds variant picker, drag-drop, mobile layout.  
**Phase 3** adds price display using TCGdex `pricing` from `GET /cards/:id`.  
**Phase 4** adds upgrade CTA when `BINDER_LIMIT_REACHED`.

Design components to extend — don't hardcode limits only in UI.

## Agent prompt starter

```
Implement Phase 1E (Binder editor UI) for ReBind MVP.
Read docs/phases/01e-binder-editor-ui.md.
Requires APIs from 1B and 1C, auth shell from 1D.
Build binder list, editor grid, and card search modal.
Do not implement pricing or Stripe.
```
