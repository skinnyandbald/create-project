# Phase 5.1: Composable Variant

> **Depends on:** Phase 4.2 (default variant verified)

**Goal:** Create the `--composable` overlay that swaps Supabase for Better Auth + Drizzle + Neon.

---

## Files to create

All under `scaffolds/nextjs/composable/`:

| File | Purpose |
|------|---------|
| `package.json` | Complete package.json replacing Supabase deps with Better Auth + Drizzle + Neon |
| `.env.example` | Composable-specific env vars (DATABASE_URL, BETTER_AUTH_SECRET, etc.) |
| `proxy.ts` | Better Auth middleware replacing Supabase proxy |
| `drizzle.config.ts` | Drizzle Kit configuration |
| `src/lib/auth/index.ts` | Better Auth server config |
| `src/lib/auth/client.ts` | Better Auth client |
| `src/lib/db/index.ts` | Drizzle client + schema |
| `src/server/db.ts` | Re-export for tRPC context |

---

## Steps

- [ ] **5.1.1** Research Better Auth + Next.js 16 integration — verify current API via `vibe-tools web "Better Auth Next.js 16 proxy.ts setup March 2026"`

- [ ] **5.1.2** Create `composable/package.json` — full package.json with Better Auth, Drizzle ORM, @neondatabase/serverless replacing Supabase deps. Keep all other deps identical.

- [ ] **5.1.3** Create `composable/.env.example`:
```env
DATABASE_URL=your-neon-connection-string
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

- [ ] **5.1.4** Create `composable/proxy.ts` — Better Auth middleware for Next.js 16

- [ ] **5.1.5** Create auth and db helpers

- [ ] **5.1.6** Create `composable/drizzle.config.ts`

- [ ] **5.1.7** Verify: scaffold with `--composable`, install, typecheck, build

- [ ] **5.1.8** Commit: `git add scaffolds/nextjs/composable/ && git commit -m "feat: add composable variant (Better Auth + Drizzle + Neon)"`
