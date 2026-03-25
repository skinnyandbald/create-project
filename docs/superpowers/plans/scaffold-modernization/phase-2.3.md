# Phase 2.3: Smoke Test

> **Depends on:** Phase 1.3, Phase 2.2

**Goal:** Add a smoke test that verifies Zod 4 and tRPC router initialization work in the generated project.

---

## Files to create

| File | Purpose |
|------|---------|
| `scaffolds/nextjs/template/src/__tests__/smoke.test.ts` | Template smoke test |

---

## Steps

- [ ] **2.3.1** Create `src/__tests__/smoke.test.ts` — copy from spec:
```ts
import { describe, it, expect } from 'vitest'

describe('scaffold health', () => {
  it('zod v4 works', async () => {
    const { z } = await import('zod')
    const schema = z.object({ name: z.string() })
    expect(schema.parse({ name: 'test' })).toEqual({ name: 'test' })
  })

  it('tRPC router initializes', async () => {
    const { appRouter } = await import('@/server/trpc/router')
    expect(appRouter).toBeDefined()
    expect(typeof appRouter.createCaller).toBe('function')
  })
})
```

- [ ] **2.3.2** Commit: `git add scaffolds/nextjs/template/src/__tests__/ && git commit -m "feat: add template smoke test"`
