# Phase 5 — Enhancements

**Status:** ⬜ Not started  
**Layer:** Full-stack  
**Depends on:** [Phase 2](02-polish.md) and/or [Phase 3](03-collection-value.md)  
**Optional:** Can be split into independent sub-features

## Goal

Nice-to-have features that improve sharing, insights, and exports. Each sub-phase is independent.

## Prerequisites

- MVP minimum; some items need Phase 3 (pricing history)

## Out of scope

- Native mobile apps
- Marketplace / trading
- Multi-language UI

---

## 5A — Price history

**Depends on:** Phase 3

- [ ] `price_history` table — daily snapshot per card+variant in user collections
- [ ] Nightly job appends row (not full catalog)
- [ ] `GET /binders/:id/valuation/history?days=30`
- [ ] Chart: "Your binder gained/lost $X this month"
- [ ] Consider paid TCG API only if TCGdex trends insufficient

---

## 5B — Export binder

**Depends on:** MVP

- [ ] Export page or full binder as PNG/PDF
- [ ] Server-side (`puppeteer` / `@react-pdf`) or client canvas
- [ ] Include binder name, page numbers, card images

---

## 5C — Share read-only link

**Depends on:** MVP

- [ ] `binder_shares` table: `token`, `binderId`, `expiresAt`
- [ ] `POST /binders/:id/share` → public URL
- [ ] `GET /public/binders/:token` — no auth, read-only grid
- [ ] Revoke share endpoint
- [ ] Optional: hide prices on public view

---

## 5D — Collection stats

**Depends on:** MVP

- [ ] Dashboard: cards per set, rarity breakdown, empty slots count
- [ ] `GET /binders/:id/stats`
- [ ] Duplicate card detection ("you have this on page 3")

---

## 5E — Wishlist slots

**Depends on:** MVP

- [ ] Mark empty slot as "wishlist" with target card
- [ ] Visual distinction from empty slot
- [ ] Optional: notify when price drops (needs Phase 3 + email)

---

## Agent prompt starter

```
Implement Phase 5 sub-feature [5A|5B|5C|5D|5E] for ReBind.
Read docs/phases/05-enhancements.md.
Only implement the requested sub-section.
```
