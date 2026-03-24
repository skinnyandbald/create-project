# Phase 1.3: tRPC v11 Server Layer

> **Depends on:** Phase 1.2

**Goal:** Create tRPC initialization, context with Supabase, and app router with example procedures.

**Spec:** `docs/superpowers/specs/2026-03-24-scaffold-modernization-design.md`

---

## Files to create

| File | Purpose |
|------|---------|
| `scaffolds/nextjs/template/src/server/trpc/init.ts` | initTRPC, context factory, public/protected procedures |
| `scaffolds/nextjs/template/src/server/trpc/router.ts` | App router with health + me procedures |

---

### Steps

- [ ] **1.3.1** Create `src/server/trpc/init.ts`:
```ts
import { initTRPC, TRPCError } from '@trpc/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

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

- [ ] **1.3.2** Create `src/server/trpc/router.ts`:
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

- [ ] **1.3.3** Commit: `git add scaffolds/nextjs/template/src/server/trpc/ && git commit -m "feat: add tRPC v11 init, router, and procedures"`
