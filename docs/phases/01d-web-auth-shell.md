# Phase 1D — Web Auth Shell

**Status:** ⬜ Not started  
**Layer:** `apps/web`  
**Depends on:** [Phase 1A](01a-auth-api.md)  
**Blocks:** Phase 1E

## Goal

Web app with login/register pages, auth state management, protected routes, and app layout shell. No binder editor yet.

## Prerequisites

- Phase 1A complete (auth API live)
- `NEXT_PUBLIC_API_URL` configured

## Out of scope

- Binder list/editor UI (Phase 1E)
- Card search modal
- Pricing, billing, settings beyond logout
- OAuth, forgot password

## Deliverables

### Pages

| Path | Auth | Description |
|------|------|-------------|
| `/login` | public | Login form |
| `/register` | public | Register form |
| `/` | redirect | → `/binders` if logged in, else `/login` |
| `/binders` | protected | Placeholder list ("No binders yet") |

### Implementation

- [ ] `apps/web/src/lib/api-client.ts` — fetch wrapper with auth header + refresh logic
- [ ] `apps/web/src/lib/auth.ts` — token storage (memory + localStorage or cookie strategy matching API)
- [ ] `apps/web/src/contexts/auth-context.tsx` or hook `useAuth()`
- [ ] `apps/web/src/components/layout/app-shell.tsx` — header, nav, logout
- [ ] `apps/web/src/app/(auth)/login/page.tsx`
- [ ] `apps/web/src/app/(auth)/register/page.tsx`
- [ ] `apps/web/src/app/(app)/layout.tsx` — protected layout wrapper
- [ ] `apps/web/src/app/(app)/binders/page.tsx` — placeholder
- [ ] Middleware or layout guard redirecting unauthenticated users to `/login`

### API client behavior

- Attach `Authorization: Bearer {accessToken}` to requests
- On `401`: attempt refresh once, retry, else redirect to login
- Base URL from `NEXT_PUBLIC_API_URL`

### UX

- Form validation (email format, password min 8 chars)
- Show API error messages
- Loading states on submit
- Logout calls `POST /auth/logout` and clears local state

### Styling

- Continue dark theme from Phase 0 landing page
- Tailwind; keep components minimal and reusable for Phase 1E

## Acceptance criteria

- [ ] User can register and land on `/binders`
- [ ] User can log out and get redirected to `/login`
- [ ] `/binders` without token redirects to `/login`
- [ ] Page refresh keeps user logged in (refresh token flow works)
- [ ] Header shows user email and plan tier from `/auth/me`
- [ ] No direct TCGdex calls from browser

## Handoff to Phase 1E

Provides:

- `apiClient.get/post/put/delete` with auth
- `useAuth()` with `user`, `login`, `logout`, `register`
- `(app)` layout with shell for binder pages
- `/binders` route ready to become real list

## Agent prompt starter

```
Implement Phase 1D (Web auth shell) for ReBind.
Read docs/phases/01d-web-auth-shell.md.
Requires Phase 1A API. Do not build binder grid or card search.
Use NEXT_PUBLIC_API_URL; credentials/cookies per API design.
```
