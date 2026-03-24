# Phase 2.1: Auth Middleware + Auth Pages

> **Depends on:** Phase 1.2

**Goal:** Create proxy.ts for auth session refresh and route protection, plus sign-in/sign-up/callback pages.

**Spec:** `docs/superpowers/specs/2026-03-24-scaffold-modernization-design.md` → "proxy.ts (Supabase variant)"

---

## Files to create

| File | Purpose |
|------|---------|
| `scaffolds/nextjs/template/proxy.ts` | Next.js 16 auth middleware with session refresh |
| `scaffolds/nextjs/template/src/app/(auth)/sign-in/page.tsx` | Sign-in form |
| `scaffolds/nextjs/template/src/app/(auth)/sign-up/page.tsx` | Sign-up form |
| `scaffolds/nextjs/template/src/app/(auth)/callback/route.ts` | OAuth/email callback handler |

---

### Steps

- [ ] **2.1.1** Create `proxy.ts` — copy exact code from spec. Critical details:
  - Export function named `proxy` (not `middleware`)
  - `setAll` MUST recreate response via `NextResponse.next({ request })`
  - Redirect MUST copy cookies to redirect response
  - Export `config` with matcher excluding static assets

- [ ] **2.1.2** Create `src/app/(auth)/sign-in/page.tsx` — client component with email/password form using `createClient()` from `@/lib/supabase/browser`, calls `signInWithPassword`, redirects to `/dashboard` on success

- [ ] **2.1.3** Create `src/app/(auth)/sign-up/page.tsx` — similar form with `signUp`, redirects to sign-in with success message

- [ ] **2.1.4** Create `src/app/(auth)/callback/route.ts` — copy from spec:
  - GET handler reads `code` from searchParams
  - Creates Supabase server client with cookie handling
  - Calls `exchangeCodeForSession(code)`
  - Redirects to `next` param or `/` on success
  - Redirects to `/sign-in?error=auth` on failure

- [ ] **2.1.5** Commit: `git add scaffolds/nextjs/template/proxy.ts scaffolds/nextjs/template/src/app/\(auth\)/ && git commit -m "feat: add proxy.ts auth middleware and auth pages"`
