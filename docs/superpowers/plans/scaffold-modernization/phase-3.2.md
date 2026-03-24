# Phase 3.2: DevOps Files

> **Depends on:** Nothing (can run in parallel with Phase 1/2/3.1)

**Goal:** Create Vercel config, GitHub Actions workflows, CodeRabbit config, and PR template.

**Spec:** `docs/superpowers/specs/2026-03-24-scaffold-modernization-design.md` → "DevOps"

---

## Files to create/copy

| File | Action |
|------|--------|
| `scaffolds/nextjs/devops/vercel.json` | **Create** — minimal |
| `scaffolds/nextjs/devops/coderabbit.yaml` | **Rewrite** — update path instructions for new stack |
| `scaffolds/nextjs/devops/PULL_REQUEST_TEMPLATE.md` | **Copy** from `scaffolds/t3/devops/` |
| `scaffolds/nextjs/devops/.github/workflows/ci.yml` | **Create** — pnpm, Node 24, biome check, typecheck, build, test |
| `scaffolds/nextjs/devops/.github/workflows/claude.yml` | **Copy** from `scaffolds/t3/devops/workflows/` |
| `scaffolds/nextjs/devops/.github/workflows/claude-code-review.yml` | **Copy** from `scaffolds/t3/devops/workflows/` |

---

### Steps

- [ ] **3.2.1** Create directory: `mkdir -p scaffolds/nextjs/devops/.github/workflows`

- [ ] **3.2.2** Create `vercel.json`:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json"
}
```

- [ ] **3.2.3** Create `ci.yml`:
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

- [ ] **3.2.4** Update `coderabbit.yaml` — rewrite path instructions for Supabase, tRPC v11, Tailwind v4, Next.js 16 proxy.ts

- [ ] **3.2.5** Copy unchanged files:
```bash
cp scaffolds/t3/devops/PULL_REQUEST_TEMPLATE.md scaffolds/nextjs/devops/
cp scaffolds/t3/devops/workflows/claude.yml scaffolds/nextjs/devops/.github/workflows/
cp scaffolds/t3/devops/workflows/claude-code-review.yml scaffolds/nextjs/devops/.github/workflows/
```

- [ ] **3.2.6** Commit: `git add scaffolds/nextjs/devops/ && git commit -m "feat: add DevOps configs for Next.js scaffold"`
