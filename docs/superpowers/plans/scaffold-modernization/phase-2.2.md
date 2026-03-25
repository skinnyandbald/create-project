# Phase 2.2: Layout, Pages, and CSS

> **Depends on:** Phase 1.4, Phase 2.1

**Goal:** Create root layout with tRPC providers, home page, protected dashboard page, and Tailwind v4 CSS.

**Spec:** `docs/superpowers/specs/2026-03-24-scaffold-modernization-design.md`

---

## Files to create

| File | Purpose |
|------|---------|
| `scaffolds/nextjs/template/src/app/globals.css` | Tailwind v4 CSS-first config |
| `scaffolds/nextjs/template/src/app/layout.tsx` | Root layout with Providers |
| `scaffolds/nextjs/template/src/app/page.tsx` | Home page |
| `scaffolds/nextjs/template/src/app/dashboard/page.tsx` | Protected dashboard (proxy.ts redirects unauthed) |

---

## Steps

- [ ] **2.2.1** Create `src/app/globals.css` — copy from spec:
```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", sans-serif;
  --font-mono: "Geist Mono", monospace;
}
```

- [ ] **2.2.2** Create `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Providers } from '@/lib/trpc/client'
import './globals.css'

export const metadata: Metadata = {
  title: '{{PROJECT_NAME}}',
  description: 'Built with Next.js 16, Supabase, and tRPC',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **2.2.3** Create `src/app/page.tsx` — minimal home page with project name, link to dashboard, link to sign-in

- [ ] **2.2.4** Create `src/app/dashboard/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">Welcome, {user?.email}</p>
    </div>
  )
}
```

- [ ] **2.2.5** Commit: `git add scaffolds/nextjs/template/src/app/ && git commit -m "feat: add layout, pages, globals.css, and dashboard"`
