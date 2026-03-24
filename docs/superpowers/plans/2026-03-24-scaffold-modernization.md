# Scaffold Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `create-t3-app`-based scaffold with a custom template-copy scaffold producing Next.js 16 + Supabase + tRPC v11 + Tailwind v4 projects.

**Architecture:** Template-copy approach — a complete, runnable Next.js project lives in `scaffolds/nextjs/template/`. The CLI copies it, applies string replacements, and runs `pnpm install`. A `--composable` variant overlays Better Auth + Drizzle + Neon files.

**Tech Stack:** Bash CLI, Next.js 16.2, React 19.2, TypeScript 6, tRPC 11.15, Supabase (@supabase/ssr 0.9), Zod 4.3, Tailwind 4.2, Biome 2.4, Vitest 3.1

**Spec:** `docs/superpowers/specs/2026-03-24-scaffold-modernization-design.md`

---

## File Structure

### New files to create (default Supabase variant)

```
scaffolds/nextjs/
├── template/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── (auth)/
│   │   │   │   ├── sign-in/page.tsx
│   │   │   │   ├── sign-up/page.tsx
│   │   │   │   └── callback/route.ts
│   │   │   ├── dashboard/page.tsx
│   │   │   └── api/trpc/[trpc]/route.ts
│   │   ├── lib/
│   │   │   ├── supabase/server.ts
│   │   │   ├── supabase/browser.ts
│   │   │   ├── trpc/client.tsx
│   │   │   └── trpc/server.ts
│   │   ├── server/trpc/init.ts
│   │   ├── server/trpc/router.ts
│   │   └── __tests__/smoke.test.ts
│   ├── proxy.ts
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── biome.json
│   ├── vitest.config.ts
│   ├── postcss.config.mjs
│   ├── package.json
│   ├── .gitignore
│   ├── .env.example
│   └── next-env.d.ts
├── claude/
│   ├── CLAUDE.md
│   ├── settings.json
│   ├── mcp.json
│   ├── claudeignore
│   ├── hooks/lint-after-edit.sh
│   ├── hooks/typecheck-before-commit.sh
│   ├── commands/simplify.md
│   ├── commands/remote.md
│   ├── skills/git-worktree/SKILL.md
│   └── presets/
│       ├── coding-agent.md
│       ├── frontend-design.md
│       ├── research-analysis.md
│       └── long-horizon-agent.md
└── devops/
    ├── vercel.json
    ├── coderabbit.yaml
    ├── PULL_REQUEST_TEMPLATE.md
    └── .github/workflows/
        ├── ci.yml
        ├── claude.yml
        └── claude-code-review.yml
```

### Files to modify

```
bin/scaffold        # Rewrite scaffold_t3() → scaffold_nextjs(), add --composable, alias --type=t3
```

### Files to move/rename

```
scaffolds/t3/ → keep for reference, new scaffold is scaffolds/nextjs/
```

---

## Task 1: Create template config files

**Files:**
- Create: `scaffolds/nextjs/template/package.json`
- Create: `scaffolds/nextjs/template/tsconfig.json`
- Create: `scaffolds/nextjs/template/next.config.ts`
- Create: `scaffolds/nextjs/template/biome.json`
- Create: `scaffolds/nextjs/template/vitest.config.ts`
- Create: `scaffolds/nextjs/template/postcss.config.mjs`
- Create: `scaffolds/nextjs/template/.gitignore`
- Create: `scaffolds/nextjs/template/.env.example`
- Create: `scaffolds/nextjs/template/next-env.d.ts`

- [ ] **Step 1: Create package.json** — copy exact content from spec (includes name placeholder, engines, all deps, scripts)
- [ ] **Step 2: Create tsconfig.json** — copy from spec (TS 6 defaults, react-jsx, verbatimModuleSyntax)
- [ ] **Step 3: Create next.config.ts** — copy from spec (empty, Turbopack is default)
- [ ] **Step 4: Create biome.json** — copy from spec (v2 format, domains, assist)
- [ ] **Step 5: Create vitest.config.ts** — copy from spec (jsdom, @/ alias)
- [ ] **Step 6: Create postcss.config.mjs** — copy from spec (@tailwindcss/postcss)
- [ ] **Step 7: Create .gitignore**

```
node_modules/
.next/
.env
.env.local
.env*.local
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 8: Create .env.example** — copy from spec (public keys, commented service role)
- [ ] **Step 9: Create next-env.d.ts**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 10: Commit**

```bash
git add scaffolds/nextjs/template/
git commit -m "feat: add Next.js 16 template config files"
```

---

## Task 2: Create Supabase client helpers

**Files:**
- Create: `scaffolds/nextjs/template/src/lib/supabase/server.ts`
- Create: `scaffolds/nextjs/template/src/lib/supabase/browser.ts`

- [ ] **Step 1: Create server.ts**

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

- [ ] **Step 2: Create browser.ts**

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add scaffolds/nextjs/template/src/lib/supabase/
git commit -m "feat: add Supabase server and browser client helpers"
```

---

## Task 3: Create tRPC v11 server layer

**Files:**
- Create: `scaffolds/nextjs/template/src/server/trpc/init.ts`
- Create: `scaffolds/nextjs/template/src/server/trpc/router.ts`

- [ ] **Step 1: Create init.ts** — tRPC initialization with Supabase context

```ts
import { initTRPC, TRPCError } from '@trpc/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { z } from 'zod'

export const createTRPCContext = cache(async () => {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  return { supabase, user }
})

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create()

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, user: ctx.user } })
})
```

- [ ] **Step 2: Create router.ts** — app router with health procedure

```ts
import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from './init'

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return { id: ctx.user.id, email: ctx.user.email }
  }),
})

export type AppRouter = typeof appRouter
```

- [ ] **Step 3: Commit**

```bash
git add scaffolds/nextjs/template/src/server/trpc/
git commit -m "feat: add tRPC v11 init, router, and procedures"
```

---

## Task 4: Create tRPC client layer

**Files:**
- Create: `scaffolds/nextjs/template/src/lib/trpc/client.tsx`
- Create: `scaffolds/nextjs/template/src/lib/trpc/server.ts`
- Create: `scaffolds/nextjs/template/src/app/api/trpc/[trpc]/route.ts`

- [ ] **Step 1: Create client.tsx** — tRPC + React Query provider

```tsx
'use client'

import type { AppRouter } from '@/server/trpc/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, createTRPCClient } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import { useState, type ReactNode } from 'react'

const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()
export { useTRPC }

function getUrl() {
  if (typeof window !== 'undefined') return '/api/trpc'
  return `http://localhost:${process.env.PORT ?? 3000}/api/trpc`
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: getUrl() })],
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 2: Create server.ts** — RSC caller

```ts
import { createCallerFactory, createTRPCContext } from '@/server/trpc/init'
import { appRouter } from '@/server/trpc/router'

const createCaller = createCallerFactory(appRouter)

export async function api() {
  const context = await createTRPCContext()
  return createCaller(context)
}
```

- [ ] **Step 3: Create route.ts** — tRPC HTTP handler

```ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/trpc/router'
import { createTRPCContext } from '@/server/trpc/init'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  })

export { handler as GET, handler as POST }
```

- [ ] **Step 4: Commit**

```bash
git add scaffolds/nextjs/template/src/lib/trpc/ scaffolds/nextjs/template/src/app/api/
git commit -m "feat: add tRPC client, RSC caller, and HTTP handler"
```

---

## Task 5: Create proxy.ts and auth pages

**Files:**
- Create: `scaffolds/nextjs/template/proxy.ts`
- Create: `scaffolds/nextjs/template/src/app/(auth)/sign-in/page.tsx`
- Create: `scaffolds/nextjs/template/src/app/(auth)/sign-up/page.tsx`
- Create: `scaffolds/nextjs/template/src/app/(auth)/callback/route.ts`

- [ ] **Step 1: Create proxy.ts** — copy exact content from spec (includes matcher, cookie forwarding on redirect)
- [ ] **Step 2: Create sign-in/page.tsx** — minimal Supabase sign-in form

```tsx
'use client'

import { createClient } from '@/lib/supabase/browser'
import { useState } from 'react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSignIn} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Sign In</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border px-3 py-2" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded border px-3 py-2" required />
        <button type="submit" className="w-full rounded bg-foreground text-background py-2 font-medium">Sign In</button>
        <p className="text-sm text-center">No account? <a href="/sign-up" className="underline">Sign up</a></p>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Create sign-up/page.tsx** — similar form with `signUp`
- [ ] **Step 4: Create callback/route.ts** — OAuth/email callback handler

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL('/sign-in?error=auth', request.url))
}
```

- [ ] **Step 5: Commit**

```bash
git add scaffolds/nextjs/template/proxy.ts scaffolds/nextjs/template/src/app/\(auth\)/
git commit -m "feat: add proxy.ts auth middleware and auth pages"
```

---

## Task 6: Create layout, pages, and CSS

**Files:**
- Create: `scaffolds/nextjs/template/src/app/globals.css`
- Create: `scaffolds/nextjs/template/src/app/layout.tsx`
- Create: `scaffolds/nextjs/template/src/app/page.tsx`
- Create: `scaffolds/nextjs/template/src/app/dashboard/page.tsx`

- [ ] **Step 1: Create globals.css** — copy from spec (Tailwind v4 CSS-first)
- [ ] **Step 2: Create layout.tsx** — root layout with Providers wrapper

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

- [ ] **Step 3: Create page.tsx** — minimal home page
- [ ] **Step 4: Create dashboard/page.tsx** — protected page (proxy.ts redirects unauthenticated users)

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Welcome, {user?.email}</p>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add scaffolds/nextjs/template/src/app/
git commit -m "feat: add layout, pages, globals.css, and dashboard"
```

---

## Task 7: Create smoke test

**Files:**
- Create: `scaffolds/nextjs/template/src/__tests__/smoke.test.ts`

- [ ] **Step 1: Create smoke.test.ts** — copy from spec (Zod + tRPC router assertions)
- [ ] **Step 2: Commit**

```bash
git add scaffolds/nextjs/template/src/__tests__/
git commit -m "feat: add template smoke test"
```

---

## Task 8: Create Claude Code configs

**Files:**
- Create: `scaffolds/nextjs/claude/CLAUDE.md`
- Create: `scaffolds/nextjs/claude/settings.json`
- Create: `scaffolds/nextjs/claude/mcp.json`
- Create: `scaffolds/nextjs/claude/claudeignore`
- Copy: `scaffolds/nextjs/claude/hooks/` (from existing t3 hooks)
- Copy: `scaffolds/nextjs/claude/commands/` (from existing t3 commands)
- Copy: `scaffolds/nextjs/claude/skills/` (from existing t3 skills)
- Copy: `scaffolds/nextjs/claude/presets/` (from existing t3 presets)

- [ ] **Step 1: Write new CLAUDE.md** — rewrite for Supabase + tRPC v11 + Next.js 16 + Zod 4 + TS 6 + Biome 2 + Tailwind v4 (see spec CLAUDE.md Updates section for all changes)
- [ ] **Step 2: Create settings.json** — copy from existing t3, add `Bash(pnpm:*)` permission
- [ ] **Step 3: Copy mcp.json, claudeignore, hooks, commands, skills, presets** from existing `scaffolds/t3/`
- [ ] **Step 4: Commit**

```bash
git add scaffolds/nextjs/claude/
git commit -m "feat: add Claude Code configs for Next.js scaffold"
```

---

## Task 9: Create DevOps files

**Files:**
- Create: `scaffolds/nextjs/devops/vercel.json`
- Create: `scaffolds/nextjs/devops/coderabbit.yaml`
- Create: `scaffolds/nextjs/devops/PULL_REQUEST_TEMPLATE.md`
- Create: `scaffolds/nextjs/devops/.github/workflows/ci.yml`
- Copy: `scaffolds/nextjs/devops/.github/workflows/claude.yml` (from t3)
- Copy: `scaffolds/nextjs/devops/.github/workflows/claude-code-review.yml` (from t3)

- [ ] **Step 1: Create vercel.json** — minimal (`{"$schema": "https://openapi.vercel.sh/vercel.json"}`)
- [ ] **Step 2: Create ci.yml** — Node 24, pnpm, typecheck + lint + build + test
- [ ] **Step 3: Update coderabbit.yaml** — update path instructions for new stack
- [ ] **Step 4: Copy unchanged files** (claude.yml, claude-code-review.yml, PR template from t3)
- [ ] **Step 5: Commit**

```bash
git add scaffolds/nextjs/devops/
git commit -m "feat: add DevOps configs for Next.js scaffold"
```

---

## Task 10: Rewrite CLI scaffold function

**Files:**
- Modify: `bin/scaffold` (rewrite `scaffold_t3` → `scaffold_nextjs`, add `--composable`, alias `--type=t3`)

- [ ] **Step 1: Add `scaffold_nextjs()` function** — implements the CLI Logic from spec:
  1. Set `TARGET_DIR` and trap
  2. Copy template/
  3. If composable: overlay files
  4. Copy claude/ → .claude/
  5. Copy devops/ files
  6. String-replace `{{PROJECT_NAME}}` in allowlisted extensions
  7. `pnpm install`
  8. `git init`, optional GitHub repo
  9. Remove trap

- [ ] **Step 2: Update type parsing** — accept `--type=nextjs` and `--type=t3` (alias), add `--composable` flag
- [ ] **Step 3: Update interactive menu** — replace "T3" with "Next.js" in prompts
- [ ] **Step 4: Keep `scaffold_t3()` as a wrapper** that calls `scaffold_nextjs()` for backwards compat
- [ ] **Step 5: Commit**

```bash
git add bin/scaffold
git commit -m "feat: rewrite CLI for template-copy Next.js scaffold"
```

---

## Task 11: Verify default variant

- [ ] **Step 1: Scaffold a test project**

```bash
cd /tmp && scaffold test-nextjs --type=nextjs
```

- [ ] **Step 2: Verify file tree** — check all expected files exist
- [ ] **Step 3: Check no placeholders remain** — `grep -r '{{PROJECT_NAME}}' /tmp/test-nextjs` returns nothing
- [ ] **Step 4: Run install** — `cd /tmp/test-nextjs && pnpm install`
- [ ] **Step 5: Run typecheck** — `pnpm typecheck`
- [ ] **Step 6: Run lint** — `pnpm lint`
- [ ] **Step 7: Run tests** — `pnpm test`
- [ ] **Step 8: Run build** — `pnpm build`
- [ ] **Step 9: Start dev server and browser verify**

```bash
pnpm dev &
sleep 5
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
agent-browser screenshot --annotate
agent-browser snapshot -i
agent-browser close
kill %1
```

- [ ] **Step 10: Fix any issues, re-verify, commit fixes**

---

## Task 12: Create composable variant (deferred)

> This task creates the `--composable` variant with Better Auth + Drizzle + Neon. It can be implemented after the default variant is verified.

**Files:**
- Create: `scaffolds/nextjs/composable/package.json`
- Create: `scaffolds/nextjs/composable/.env.example`
- Create: `scaffolds/nextjs/composable/proxy.ts`
- Create: `scaffolds/nextjs/composable/drizzle.config.ts`
- Create: `scaffolds/nextjs/composable/src/lib/auth/`
- Create: `scaffolds/nextjs/composable/src/lib/db/`
- Create: `scaffolds/nextjs/composable/src/server/db.ts`

- [ ] **Step 1: Create composable package.json** — full package.json with Better Auth + Drizzle + Neon replacing Supabase deps
- [ ] **Step 2: Create composable .env.example** — Neon DATABASE_URL, Better Auth vars
- [ ] **Step 3: Create composable proxy.ts** — Better Auth middleware pattern
- [ ] **Step 4: Create auth and db helpers** — Better Auth config, Drizzle schema
- [ ] **Step 5: Verify composable variant** — scaffold with `--composable`, install, typecheck, build
- [ ] **Step 6: Commit**

```bash
git add scaffolds/nextjs/composable/
git commit -m "feat: add composable variant (Better Auth + Drizzle + Neon)"
```

---

## Task 13: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update usage docs** — replace `--type=t3` with `--type=nextjs`, document `--composable` flag
- [ ] **Step 2: Update stack description** — Next.js 16 + Supabase + tRPC v11 + Tailwind v4
- [ ] **Step 3: Add prerequisites** — Node >= 22, pnpm
- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: update README for Next.js scaffold"
```
