# Scaffold Modernization — Implementation Plan

**Spec:** `docs/superpowers/specs/2026-03-24-scaffold-modernization-design.md`

**Goal:** Replace `create-t3-app` with custom template-copy scaffold for Next.js 16 + Supabase + tRPC v11

## Phases

| Phase | Description | Files | Depends on |
|-------|-------------|-------|------------|
| 1.1 | Template config files (package.json, tsconfig, biome, vitest, postcss) | 9 files | — |
| 1.2 | Supabase client helpers (server + browser) | 2 files | 1.1 |
| 1.3 | tRPC v11 server layer (init, router, procedures) | 2 files | 1.2 |
| 1.4 | tRPC client layer (provider, RSC caller, HTTP handler) | 3 files | 1.3 |
| 2.1 | Auth middleware + auth pages (proxy.ts, sign-in, sign-up, callback) | 4 files | 1.2 |
| 2.2 | Layout, pages, CSS (layout.tsx, page.tsx, dashboard, globals.css) | 4 files | 1.4, 2.1 |
| 2.3 | Smoke test | 1 file | 1.3, 2.2 |
| 3.1 | Claude Code configs (CLAUDE.md, settings, hooks, presets) | ~12 files | — |
| 3.2 | DevOps files (CI, Vercel, CodeRabbit, GitHub workflows) | ~6 files | — |
| 4.1 | Rewrite CLI `scaffold_nextjs()` function | 1 file | 1.x, 2.x, 3.x |
| 4.2 | End-to-end verification (scaffold, install, typecheck, build, dev) | — | 4.1 |
| 5.1 | Composable variant (Better Auth + Drizzle + Neon overlay) | ~7 files | 4.2 |
| 5.2 | README update | 1 file | 4.2 |

Each phase has its own plan file: `phase-X.Y.md`
