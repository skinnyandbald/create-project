# Phase 1.4: tRPC Client Layer

> **Depends on:** Phase 1.3

**Goal:** Create tRPC client with React Query provider, RSC caller, and HTTP route handler.

**Spec:** `docs/superpowers/specs/2026-03-24-scaffold-modernization-design.md`

**Important:** tRPC v11 APIs may differ from what's shown here. Before writing code, verify the exact API by checking `node_modules/@trpc/react-query` and `node_modules/@trpc/client` after `pnpm install` in a test project. The `createTRPCContext` from `@trpc/tanstack-react-query` may have a different name or export path.

---

## Files to create

| File | Purpose |
|------|---------|
| `scaffolds/nextjs/template/src/lib/trpc/client.tsx` | tRPC + React Query provider (client component) |
| `scaffolds/nextjs/template/src/lib/trpc/server.ts` | RSC caller factory |
| `scaffolds/nextjs/template/src/app/api/trpc/[trpc]/route.ts` | HTTP handler for tRPC |

---

## Steps

- [ ] **1.4.1** Create `src/lib/trpc/client.tsx` — tRPC React Query provider. Verify exact imports from `@trpc/tanstack-react-query` (v11 renamed this). Must export `Providers` component and `useTRPC` hook.

- [ ] **1.4.2** Create `src/lib/trpc/server.ts`:
```ts
import { createCallerFactory, createTRPCContext } from '@/server/trpc/init'
import { appRouter } from '@/server/trpc/router'

const createCaller = createCallerFactory(appRouter)

export async function api() {
  const context = await createTRPCContext()
  return createCaller(context)
}
```

- [ ] **1.4.3** Create `src/app/api/trpc/[trpc]/route.ts`:
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

- [ ] **1.4.4** Commit: `git add scaffolds/nextjs/template/src/lib/trpc/ scaffolds/nextjs/template/src/app/api/ && git commit -m "feat: add tRPC client, RSC caller, and HTTP handler"`
