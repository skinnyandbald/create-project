# Phase 1.2: Supabase Client Helpers

> **Depends on:** Phase 1.1

**Goal:** Create reusable Supabase client factories for server and browser contexts.

**Spec:** `docs/superpowers/specs/2026-03-24-scaffold-modernization-design.md`

---

## Files to create

| File | Purpose |
|------|---------|
| `scaffolds/nextjs/template/src/lib/supabase/server.ts` | Server-side Supabase client with cookie handling |
| `scaffolds/nextjs/template/src/lib/supabase/browser.ts` | Browser-side Supabase client |

---

### Steps

- [ ] **1.2.1** Create `src/lib/supabase/server.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- [ ] **1.2.2** Create `src/lib/supabase/browser.ts`:
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **1.2.3** Commit: `git add scaffolds/nextjs/template/src/lib/supabase/ && git commit -m "feat: add Supabase server and browser client helpers"`
