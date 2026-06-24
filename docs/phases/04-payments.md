# Phase 4 — Payments (Stripe)

**Status:** ⬜ Not started  
**Layer:** Full-stack  
**Depends on:** [Phase 1E](01e-binder-editor-ui.md) (MVP)  
**Independent of:** Phase 2, Phase 3

## Goal

Freemium monetization: free users get 1 binder; **Collector** subscribers get up to 50. Stripe handles billing.

## Prerequisites

- MVP complete
- `User.stripeCustomerId`, `planTier`, `subscriptionStatus` in schema (already defined)
- `PLANS` in `packages/shared/src/plans.ts`

## Out of scope

- Lifetime deals (optional later)
- Multiple paid tiers
- Team/family plans
- In-app card marketplace

## Deliverables

### 4A — Stripe setup

- [ ] Stripe products/prices for Collector monthly + yearly
- [ ] Env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs
- [ ] `apps/api/src/services/stripe.service.ts`

### 4B — Billing API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/billing/checkout` | Create Checkout session → return URL |
| POST | `/billing/portal` | Customer portal URL |
| POST | `/billing/webhook` | Handle Stripe events (raw body) |

Webhook events:

- `checkout.session.completed` → activate subscription
- `customer.subscription.updated` → sync status
- `customer.subscription.deleted` → downgrade to free

### 4C — Plan sync

- [ ] Update `user.planTier` + `subscriptionStatus` + `subscriptionEndsAt` on webhook
- [ ] `maxBindersForPlan()` already handles `collector` + `active`
- [ ] Re-verify binder limit on `POST /binders` (already in 1B)

### 4D — Soft lock on downgrade

When subscription ends and user has >1 binder:

- [ ] **View** all binders (GET works)
- [ ] **Edit** only the oldest/first binder (or first created — document choice)
- [ ] **Create** new binder blocked
- [ ] `apps/api/src/lib/plan-access.ts` — `canEditBinder(user, binder)`

### 4E — Web UI

- [ ] `/settings/billing` — current plan, upgrade button, manage subscription
- [ ] Upgrade CTA when `BINDER_LIMIT_REACHED`
- [ ] Show "Collector" badge when subscribed
- [ ] Pricing page copy (static)

## Acceptance criteria

- [ ] Test mode checkout upgrades user to Collector
- [ ] Collector can create multiple binders (up to 50)
- [ ] Webhook idempotency (don't double-activate)
- [ ] Cancel subscription → soft lock applied
- [ ] Webhook signature verified; secrets not logged
- [ ] Stripe keys only in env, never client except publishable key if needed

## Agent prompt starter

```
Implement Phase 4 (Stripe payments) for ReBind.
Read docs/phases/04-payments.md and packages/shared/src/plans.ts.
Requires MVP. Implement checkout, webhooks, soft lock on downgrade.
Do not implement price history.
```
