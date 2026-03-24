# Phase 1.1: Template Config Files

> **For agentic workers:** Use superpowers:executing-plans. All code is in the spec — copy exactly.

**Goal:** Create the foundational config files for the Next.js 16 template.

**Spec:** `docs/superpowers/specs/2026-03-24-scaffold-modernization-design.md`

---

## Files to create

All under `scaffolds/nextjs/template/`:

| File | Source |
|------|--------|
| `package.json` | Spec → "Default (Supabase) package.json" |
| `tsconfig.json` | Spec → "tsconfig.json" |
| `next.config.ts` | Spec → "next.config.ts" |
| `biome.json` | Spec → "biome.json (v2)" |
| `vitest.config.ts` | Spec → "vitest.config.ts" |
| `postcss.config.mjs` | Spec → "postcss.config.mjs" |
| `.gitignore` | See below |
| `.env.example` | Spec → ".env.example" |
| `next-env.d.ts` | See below |

---

### Steps

- [ ] **1.1.1** Create directory: `mkdir -p scaffolds/nextjs/template`
- [ ] **1.1.2** Create `package.json` — copy exact JSON from spec (includes `{{PROJECT_NAME}}`, `"private": true`, engines, all deps, all scripts)
- [ ] **1.1.3** Create `tsconfig.json` — copy from spec (es2025, react-jsx, bundler, verbatimModuleSyntax, types: ["node"])
- [ ] **1.1.4** Create `next.config.ts` — copy from spec (empty config, comment about Turbopack default)
- [ ] **1.1.5** Create `biome.json` — copy from spec (v2 schema, includes, domains, assist)
- [ ] **1.1.6** Create `vitest.config.ts` — copy from spec (jsdom, @/ alias)
- [ ] **1.1.7** Create `postcss.config.mjs` — copy from spec (@tailwindcss/postcss)
- [ ] **1.1.8** Create `.gitignore`:
```
node_modules/
.next/
.env
.env.local
.env*.local
*.tsbuildinfo
next-env.d.ts
```
- [ ] **1.1.9** Create `.env.example` — copy from spec (public keys, commented service role key)
- [ ] **1.1.10** Create `next-env.d.ts`:
```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```
- [ ] **1.1.11** Commit: `git add scaffolds/nextjs/template/ && git commit -m "feat: add Next.js 16 template config files"`

### Verification

```bash
# All 9 files exist
ls scaffolds/nextjs/template/{package.json,tsconfig.json,next.config.ts,biome.json,vitest.config.ts,postcss.config.mjs,.gitignore,.env.example,next-env.d.ts}
```
