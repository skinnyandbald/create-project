# Phase 3.1: Claude Code Configs

> **Depends on:** Nothing (can run in parallel with Phase 1/2)

**Goal:** Create Claude Code configuration files (CLAUDE.md, settings, hooks, MCP, presets) for the new scaffold, updated for the modern stack.

**Spec:** `docs/superpowers/specs/2026-03-24-scaffold-modernization-design.md` → "CLAUDE.md Updates"

---

## Files to create/copy

| File | Action |
|------|--------|
| `scaffolds/nextjs/claude/CLAUDE.md` | **Rewrite** — update for Supabase, tRPC v11, Next.js 16, Zod 4, TS 6, Biome 2, Tailwind v4 |
| `scaffolds/nextjs/claude/settings.json` | **Copy + modify** from `scaffolds/t3/settings.json` — add `Bash(pnpm:*)` |
| `scaffolds/nextjs/claude/mcp.json` | **Copy** from `scaffolds/t3/mcp.json` |
| `scaffolds/nextjs/claude/claudeignore` | **Copy** from `scaffolds/t3/claudeignore` |
| `scaffolds/nextjs/claude/hooks/*` | **Copy** from `scaffolds/t3/hooks/` |
| `scaffolds/nextjs/claude/commands/*` | **Copy** from `scaffolds/t3/commands/` |
| `scaffolds/nextjs/claude/skills/*` | **Copy** from `scaffolds/t3/skills/` |
| `scaffolds/nextjs/claude/presets/*` | **Copy** from `scaffolds/t3/presets/` |

---

## Steps

- [ ] **3.1.1** Create directory structure: `mkdir -p scaffolds/nextjs/claude/{hooks,commands,skills,presets}`

- [ ] **3.1.2** Write `CLAUDE.md` — this is the largest file. Key changes from current `scaffolds/t3/CLAUDE.md`:
  - Replace Prisma patterns → Supabase client patterns (`createClient()`, RLS, `getUser()`)
  - Replace NextAuth patterns → Supabase Auth patterns
  - Update tRPC section for v11 (`inputSchema`, `Output.object()`, `stopWhen: stepCountIs(N)`)
  - Update Next.js patterns for v16 (async APIs, proxy.ts, Cache Components `'use cache'`)
  - Update Tailwind for v4 (CSS-first, `@theme`, no config file)
  - Update Zod for v4 (top-level validators, `{ error: }` syntax)
  - Update TypeScript for v6 (explicit `types`, no `baseUrl`)
  - Update Biome for v2 (`includes`, `linter.domains`, `assist.actions.source`)

- [ ] **3.1.3** Copy and modify `settings.json` — read existing, add `Bash(pnpm:*)` to allow list

- [ ] **3.1.4** Copy unchanged files:
```bash
cp scaffolds/t3/mcp.json scaffolds/nextjs/claude/mcp.json
cp scaffolds/t3/claudeignore scaffolds/nextjs/claude/claudeignore
cp scaffolds/t3/hooks/*.sh scaffolds/nextjs/claude/hooks/
cp -r scaffolds/t3/commands/* scaffolds/nextjs/claude/commands/
cp -r scaffolds/t3/skills/* scaffolds/nextjs/claude/skills/
cp -r scaffolds/t3/presets/* scaffolds/nextjs/claude/presets/
```

- [ ] **3.1.5** Commit: `git add scaffolds/nextjs/claude/ && git commit -m "feat: add Claude Code configs for Next.js scaffold"`
