# Overlay Inversion + Security Scanning

**Date:** 2026-03-29
**Status:** Approved (post-critic-review, 2 rounds)
**Author:** Ben Fisher

## Overview

Two changes to `create-project`:

1. **Default DB/Auth swap:** Neon + BetterAuth + Drizzle becomes the default Next.js scaffold. Supabase becomes an optional `--supabase` flag overlay.
2. **Security scanning by default:** Every new Next.js and Laravel project includes a `security.yml` GitHub Actions workflow that calls the reusable workflow from `skinnyandbald/github-defaults`. User is prompted with default-yes; `--no-security` bypasses the prompt.

## Motivation

- The composable stack (Neon + BetterAuth + Drizzle) is now the preferred default for new projects. Supabase is still supported but should be opt-in.
- No scaffolded projects currently include security scanning. Every repo needs it added manually after creation.
- A reusable security workflow already exists at `skinnyandbald/github-defaults/.github/workflows/security-reusable.yml` with SHA-pinned actions (Semgrep, Trivy, Gitleaks with SARIF upload). Scaffolded projects should call it rather than inline the jobs.

## Architecture: Overlay Inversion

### Current Directory Structure

```
scaffolds/nextjs/
├── template/          # Base = Supabase (default)
├── composable/        # Overlay = Neon + BetterAuth + Drizzle
├── claude/
└── devops/
```

### New Directory Structure

```
scaffolds/nextjs/
├── template/          # Base = Neon + BetterAuth + Drizzle (was composable)
├── supabase/          # Overlay = Supabase files (inverted)
├── claude/
└── devops/

scaffolds/shared/
└── security/
    └── .github/
        └── workflows/
            └── security.yml   # Caller workflow (calls github-defaults reusable)
```

### Migration Steps

**CRITICAL: Steps must be executed in this exact order. Step 1 captures Supabase originals BEFORE step 2 overwrites them. Do NOT delete `composable/` until both variants pass smoke tests (step 6).**

1. **Capture Supabase files into `scaffolds/nextjs/supabase/` overlay.** Copy the following files from the CURRENT `scaffolds/nextjs/template/` into a new `scaffolds/nextjs/supabase/` directory, preserving their directory structure:
   - `src/lib/supabase/browser.ts`
   - `src/lib/supabase/server.ts`
   - `src/app/(auth)/callback/route.ts`
   - `src/app/(auth)/sign-in/page.tsx` (Supabase version)
   - `src/app/(auth)/sign-up/page.tsx` (Supabase version)
   - `src/app/dashboard/page.tsx` (Supabase version)
   - `src/server/trpc/init.ts` (Supabase version)
   - `src/server/trpc/router.ts` (Supabase version)
   - `.env.example` (Supabase version)
   - `package.json` (Supabase version -- full file, overwrites template's package.json when applied)

   **Note:** `middleware.ts` does not exist in the current template. `next.config.ts` is minimal (no Supabase/BetterAuth references). `env.ts`/`env.mjs` do not exist. None of these need variant-specific handling.

2. **Merge composable INTO template.** Copy all files from `scaffolds/nextjs/composable/` into `scaffolds/nextjs/template/`, overwriting any conflicts. Use `cp -R` (not glob) to include dotfiles. The composable overlay contains:
   - `package.json` (replaces Supabase deps with Drizzle/BetterAuth/Neon deps)
   - `drizzle.config.ts` (new -- no equivalent in Supabase template)
   - `proxy.ts` (new -- BetterAuth dev proxy)
   - `src/app/(auth)/sign-in/page.tsx` (replaces Supabase auth page)
   - `src/app/(auth)/sign-up/page.tsx` (replaces Supabase auth page)
   - `src/app/api/auth/[...all]/route.ts` (new -- BetterAuth catch-all route)
   - `src/app/dashboard/page.tsx` (replaces Supabase dashboard)
   - `src/lib/auth/client.ts` (new -- replaces Supabase client auth)
   - `src/lib/auth/index.ts` (new -- BetterAuth server config)
   - `src/lib/db/index.ts` (new -- Drizzle client)
   - `src/lib/db/schema.ts` (new -- Drizzle schema)
   - `src/server/trpc/init.ts` (replaces Supabase context with BetterAuth context)
   - `src/server/trpc/router.ts` (replaces Supabase procedures with BetterAuth ones)

3. **Remove Supabase-specific files from template.** After the merge, delete:
   - `src/lib/supabase/browser.ts`
   - `src/lib/supabase/server.ts`
   - `src/app/(auth)/callback/route.ts` (Supabase OAuth callback -- not used by BetterAuth)

4. **Create `scaffolds/shared/security/`.** Add the caller workflow (see Security Scanning section below).

5. **Validate the migration.** Run these checks to confirm no cross-contamination. Grep the ENTIRE variant directory (not just `src/`):
   ```bash
   # Default template must NOT contain Supabase imports
   grep -R "@supabase" scaffolds/nextjs/template/ && echo "FAIL: Supabase leak in default" || echo "PASS"
   # Supabase overlay must NOT contain BetterAuth/Drizzle imports
   grep -R "better-auth\|drizzle\|@neondatabase" scaffolds/nextjs/supabase/ && echo "FAIL: BetterAuth leak in supabase" || echo "PASS"
   ```

6. **Smoke test both variants.** Before proceeding to step 7:
   ```bash
   # Default variant
   ./bin/scaffold /tmp/test-default --no-security && cd /tmp/test-default && pnpm install && pnpm lint && pnpm typecheck
   # Supabase variant
   ./bin/scaffold /tmp/test-supa --supabase --no-security && cd /tmp/test-supa && pnpm install && pnpm lint && pnpm typecheck
   ```
   Both must pass. If either fails, fix before proceeding.

7. **Delete `scaffolds/nextjs/composable/`.** Only after step 6 passes. This is the point of no return -- git history preserves the files but they are no longer in the tree.

## CLI Flag Changes

### New Flags

| Flag | Behavior |
|------|----------|
| `--supabase` | Apply Supabase overlay instead of default Neon + BetterAuth |
| `--no-security` | Skip security scanning prompt, do not include security.yml |
| `--composable` | **Deprecated.** Prints warning. No-op. Rejected if combined with `--supabase`. |

### Flag Parsing (add to `while` loop in `main()`)

```bash
--supabase)
    supabase=true
    shift
    ;;
--no-security)
    no_security=true
    shift
    ;;
--composable)
    composable_seen=true
    print_warning "--composable is deprecated (now the default). Ignoring. Remove this flag from any CI scripts or aliases."
    shift
    ;;
```

Initialize variables at top of `main()`:
```bash
local supabase=false
local no_security=false
local composable_seen=false
```

Add conflict check after the `while` loop:
```bash
if [ "$supabase" = "true" ] && [ "$composable_seen" = "true" ]; then
    print_error "--supabase and --composable are mutually exclusive."
    exit 1
fi
```

### Menu Label Update

Change the `select_option` call in `main()` from:
```bash
project_type=$(select_option "Select project type:" "Next.js (Supabase + tRPC + Tailwind)" "Laravel" "Discovery")
```
to:
```bash
project_type=$(select_option "Select project type:" "Next.js (Neon + BetterAuth + tRPC + Tailwind)" "Laravel" "Discovery")
```

Update the `case` match accordingly:
```bash
nextjs|t3|"Next.js (Neon + BetterAuth + tRPC + Tailwind)")
```

### Security Prompt in `main()`

After project type selection, before scaffolding, for non-Discovery projects. The existing `confirm` function already supports a default second argument ("y" = default yes):
```bash
if [ "$no_security" != "true" ] && [ "$project_type" != "discovery" ] && [ "$project_type" != "Discovery" ]; then
    if ! confirm "Add security scanning (Semgrep + Trivy + Gitleaks)?" "y"; then
        no_security=true
    fi
fi
```

**Non-TTY behavior:** If `stdin` is not a terminal (CI/scripting context), `read` returns immediately with empty input, which defaults to "y" (security included). To explicitly skip in CI, use `--no-security`. To explicitly include without prompt, the default behavior handles it. Add this guard before the `confirm` call:
```bash
if [ ! -t 0 ]; then
    # Non-interactive: accept default (yes, include security)
    true
elif ! confirm "Add security scanning (Semgrep + Trivy + Gitleaks)?" "y"; then
    no_security=true
fi
```

### Upgrade Path

Update `upgrade_project()`:
- Change select_option label from `"Next.js (Supabase + tRPC + Tailwind)"` to `"Next.js (Neon + BetterAuth + tRPC + Tailwind)"`
- Default upgrade target = Neon/BetterAuth unless `--supabase` flag is passed
- Accept `--supabase` and `--no-security` flags in upgrade command parsing
- Prompt for security scanning during upgrade (same `confirm` call as main)
- If `.github/workflows/security.yml` already exists in the target directory, skip the copy (idempotent)
- If target directory already contains conflicting auth/db files (e.g., `src/lib/supabase/` when upgrading to default), warn and exit rather than silently overwriting

## Changes to `scaffold_nextjs()`

### Signature Change

From: `scaffold_nextjs "$project_name" "$composable"`
To: `scaffold_nextjs "$project_name" "$supabase" "$no_security"`

### New Variable: `$SHARED_DIR`

Add at script top as a **script-level global** (not local to any function), alongside `$SCAFFOLDS_DIR`:
```bash
SHARED_DIR="$(dirname "$0")/../scaffolds/shared"
SHARED_DIR="$(cd "$SHARED_DIR" 2>/dev/null && pwd)" || {
    print_error "Shared scaffolds directory not found at $SHARED_DIR"
    exit 1
}
```

### Logic Inversion

Current step 2 (composable overlay):
```bash
if [ "$composable" = "true" ]; then
    print_step "Applying composable variant (Better Auth + Drizzle + Neon)..."
    cp -r "$SCAFFOLDS_DIR/nextjs/composable/"* "$TARGET_DIR/"
    rm -rf "$TARGET_DIR/src/lib/supabase"
    rm -rf "$TARGET_DIR/src/app/(auth)/callback"
fi
```

New step 2 (supabase overlay):
```bash
if [ "$supabase" = "true" ]; then
    print_step "Applying Supabase variant..."
    if [ -d "$SCAFFOLDS_DIR/nextjs/supabase" ] && [ "$(ls -A "$SCAFFOLDS_DIR/nextjs/supabase")" ]; then
        # Use /. syntax to include dotfiles (.env.example)
        cp -R "$SCAFFOLDS_DIR/nextjs/supabase/." "$TARGET_DIR/"
    fi
    # Remove BetterAuth/Drizzle-specific files that Supabase replaces
    rm -rf "$TARGET_DIR/src/lib/auth"
    rm -rf "$TARGET_DIR/src/lib/db"
    rm -rf "$TARGET_DIR/src/app/api/auth"
    rm -f "$TARGET_DIR/drizzle.config.ts"
    rm -f "$TARGET_DIR/proxy.ts"
    rm -rf "$TARGET_DIR/drizzle" # Drizzle migrations directory
fi
```

**Key fix:** Uses `cp -R .../supabase/. "$TARGET_DIR/"` instead of glob `*` to ensure dotfiles (`.env.example`) are included.

### Security Workflow Step

Add after the existing DevOps step (renumber as step 5):
```bash
# 5. Security scanning
local no_security="${3:-false}"
if [ "$no_security" != "true" ]; then
    print_step "Adding security scanning workflow..."
    mkdir -p "$TARGET_DIR/.github/workflows"
    cp "$SHARED_DIR/security/.github/workflows/security.yml" \
       "$TARGET_DIR/.github/workflows/security.yml"
fi
```

**Key fix:** `mkdir -p` ensures `.github/workflows/` exists before copy, regardless of whether the DevOps step ran.

## Changes to `scaffold_laravel()`

### Signature Change

From: `scaffold_laravel "$project_name"`
To: `scaffold_laravel "$project_name" "$no_security"`

### Parameter Initialization

At the **top** of `scaffold_laravel()`, alongside other parameter reads:
```bash
scaffold_laravel() {
    local project_name="$1"
    local no_security="${2:-false}"
    # ... rest of function
```

### Security Workflow Step

Add after the existing DevOps step:
```bash
# Security scanning
if [ "$no_security" != "true" ]; then
    print_step "Adding security scanning workflow..."
    mkdir -p "$project_path/.github/workflows"
    cp "$SHARED_DIR/security/.github/workflows/security.yml" \
       "$project_path/.github/workflows/security.yml"
fi
```

## Security Scanning: Reusable Workflow Architecture

Instead of inlining the full Semgrep + Trivy + Gitleaks jobs in every scaffolded project, the scaffold generates a thin **caller workflow** that references the **reusable workflow** in `skinnyandbald/github-defaults`.

### Why Reusable

- **Single source of truth.** Update the workflow in `github-defaults` and all repos get the fix on next run.
- **SHA-pinned actions.** The reusable workflow already pins all third-party actions to commit SHAs (not tags), eliminating supply chain risk.
- **Proper error handling.** Semgrep uses `|| [ $? -eq 1 ]` (passes on findings, fails on real errors), not `|| true`.
- **Full SARIF coverage.** All three tools (including Gitleaks with `GITLEAKS_ENABLE_SARIF_REPORT: true`) upload SARIF for Security tab integration.

### Reusable Workflow (already exists)

Location: `skinnyandbald/github-defaults/.github/workflows/security-reusable.yml`

This workflow uses `workflow_call` trigger with optional secrets:
```yaml
on:
  workflow_call:
    secrets:
      SEMGREP_APP_TOKEN:
        required: false
```

It includes:
- **Semgrep SAST** -- SHA-pinned container image, optional `SEMGREP_APP_TOKEN` secret
- **Trivy SCA** -- SHA-pinned action, CRITICAL+HIGH severity, filesystem scan
- **Gitleaks** -- SHA-pinned action, SARIF report enabled, full git history scan
- All three upload SARIF to GitHub Security tab
- `permissions: contents: read, security-events: write` set in the reusable workflow

**Verified:** The `SEMGREP_APP_TOKEN` secret is declared as `required: false`, so the caller workflow's explicit secret forwarding is correct.

### Caller Workflow (scaffolded into new projects)

File: `scaffolds/shared/security/.github/workflows/security.yml`

```yaml
name: Security Scanning

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1' # Weekly Monday 6am UTC

jobs:
  security:
    uses: skinnyandbald/github-defaults/.github/workflows/security-reusable.yml@cb986cfbeb9f1dec608f7442c7a398d65863c945
    secrets:
      SEMGREP_APP_TOKEN: ${{ secrets.SEMGREP_APP_TOKEN }}
```

**SHA-pinned** to commit `cb986cf` instead of `@main`. This eliminates the supply chain risk of a mutable branch ref. When the reusable workflow is updated in `github-defaults`, update the SHA in `scaffolds/shared/security/` and all newly-scaffolded projects get the new version. Existing projects keep the old SHA until they update (explicit opt-in).

### SARIF Upload Limitation

SARIF upload to GitHub's Security tab requires GitHub Advanced Security (GHAS) on **private** repositories. On repos without GHAS, the upload steps fail silently (`continue-on-error: true` in the reusable workflow). The scans still run -- findings appear in CI logs but not in the Security tab.

**No action required** unless the user specifically needs Security tab integration on private repos.

## Maintenance

### `package.json` Drift

The Supabase overlay contains a full `package.json` that overwrites the template's. This means non-auth/db changes to the default template's `package.json` (lint rules, scripts, Next.js bumps, shared dev deps) must be manually mirrored to `scaffolds/nextjs/supabase/package.json`.

**Accepted maintenance cost.** This is the same tradeoff the composable overlay had (just inverted). To mitigate, add a CI check in `create-project` that diffs key shared fields between `template/package.json` and `supabase/package.json` on any PR touching either file. Fields to compare: `scripts`, `packageManager`, `engines`, shared `devDependencies` (biome, vitest, typescript, next, react), and lint/format tooling versions.

### Reusable Workflow SHA Updates

When `skinnyandbald/github-defaults/.github/workflows/security-reusable.yml` is updated, the SHA in `scaffolds/shared/security/.github/workflows/security.yml` must be bumped manually. This is an intentional tradeoff: pinning to SHA prevents upstream breakage in scaffolded repos.

## Testing Plan

1. **New default project:** `scaffold test-default` should create a Neon + BetterAuth project with `security.yml` in `.github/workflows/`
2. **Supabase flag:** `scaffold test-supa --supabase` should create a Supabase project with `security.yml`
3. **No security flag:** `scaffold test-nosec --no-security` should create a project WITHOUT `security.yml`
4. **Security prompt decline:** Run `scaffold test-decline`, answer "n" to security prompt -- should skip `security.yml`
5. **Composable deprecation:** `scaffold test-depr --composable` should print warning, create default (Neon) project
6. **Laravel with security:** `scaffold test-laravel --type=laravel` should include `security.yml`
7. **Discovery unchanged:** `scaffold test-disc --type=discovery` should NOT prompt for security, should NOT include `security.yml`
8. **Upgrade path:** Create discovery project, upgrade to Next.js -- should get Neon default and security prompt
9. **File integrity (default):** After scaffolding default, verify:
   - `src/lib/auth/` exists (BetterAuth)
   - `src/lib/db/` exists (Drizzle)
   - `src/lib/supabase/` does NOT exist
   - `drizzle.config.ts` exists
   - `.github/workflows/security.yml` exists
   - No `@supabase` imports anywhere: `grep -R "@supabase" src/ .env* package.json` returns nothing
10. **File integrity (Supabase):** After `--supabase`, verify:
    - `src/lib/supabase/` exists
    - `src/lib/auth/` does NOT exist
    - `src/lib/db/` does NOT exist
    - `drizzle.config.ts` does NOT exist
    - No `better-auth` or `drizzle` imports anywhere
11. **Flag combination:** `scaffold test-combo --supabase --no-security` -- Supabase files present, no `security.yml`
12. **Flag conflict:** `scaffold test-conflict --supabase --composable` -- should exit with error message
13. **Smoke test (default):** Scaffold default project, run `pnpm install && pnpm lint && pnpm typecheck` -- all should pass
14. **Smoke test (Supabase):** Scaffold `--supabase` project, run `pnpm install && pnpm lint && pnpm typecheck` -- all should pass

## Out of Scope

- No changes to the CLAUDE.md templates (they reference stack-appropriate patterns already)
- No changes to CodeRabbit config
- No changes to the discovery scaffold
- No DAST or CSPM scanning (future enhancement)
- No Semgrep Cloud onboarding (documented as optional post-scaffold step)
- No migration tooling for existing projects (this is for new scaffolds only)
- No `middleware.ts` variant handling (no middleware file exists in current template)
- No `next.config.ts` variant handling (current config is minimal with no stack-specific references)
- No `env.ts`/`env.mjs` variant handling (no env validation files exist in current template)
