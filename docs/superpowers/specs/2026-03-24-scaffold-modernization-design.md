# Scaffold Modernization Design

**Date**: 2026-03-24
**Status**: Approved
**Author**: Ben + Claude

## Summary

Modernize the `create-project` scaffolding tool to replace the stale `create-t3-app` dependency with a custom template-copy scaffold targeting Next.js 16, Supabase, tRPC v11, Tailwind v4, Zod 4, TypeScript 6, and Biome 2. The scaffold retains its Claude Code integration, DevOps automation, and multi-project-type support (nextjs, laravel, discovery).

## Context

- `create-t3-app` is effectively stale (v7.40.0, Nov 2025, 49 unmerged PRs, no Next.js 16 support)
- `create-t3-turbo` is more current but is a monorepo template (Next.js + Expo), not a CLI scaffold
- Auth.js joined Better Auth in Sep 2025 and is now in maintenance mode
- Multiple major version bumps across the ecosystem require template rewrites

## Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Scaffold approach | Template-copy (Approach A) | Simplest, template is testable real code, two variants manageable |
| CLI type flag | `--type=nextjs` (alias `t3`) | Accurate name, avoids stale T3 branding |
| Default stack | Supabase (auth + DB + storage) | User uses Supabase 99% of the time, simplifies auth significantly |
| Default ORM | Supabase client SDK only (`@supabase/ssr`) | Simplicity over stronger type inference |
| Composable variant | `--composable` flag | Better Auth + Drizzle + Neon for users wanting independent pieces |
| Package manager | pnpm | User preference, document npm/yarn/bun equivalents |

## Architecture

### CLI Interface

```
scaffold my-app                        # Supabase (default), --type=nextjs implied
scaffold my-app --type=nextjs          # Explicit
scaffold my-app --composable           # Better Auth + Drizzle + Neon
scaffold my-app --type=laravel         # Laravel (unchanged)
scaffold my-app --type=discovery       # Discovery (unchanged)
```

`--type=t3` is accepted as a hidden alias for `--type=nextjs`.

### Directory Layout

```
scaffolds/nextjs/
├── template/                          # Complete, runnable Next.js 16 project
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css            # Tailwind v4 CSS-first config
│   │   │   ├── layout.tsx             # Root layout (imports globals.css, QueryClient provider)
│   │   │   ├── page.tsx               # Home page
│   │   │   ├── (auth)/
│   │   │   │   ├── sign-in/page.tsx   # Sign-in page
│   │   │   │   ├── sign-up/page.tsx   # Sign-up page
│   │   │   │   └── callback/route.ts  # OAuth/email callback handler
│   │   │   └── api/
│   │   │       └── trpc/[trpc]/route.ts
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── server.ts          # createServerClient helper
│   │   │   │   └── browser.ts         # createBrowserClient helper
│   │   │   └── trpc/
│   │   │       ├── client.ts          # tRPC client + React Query provider
│   │   │       └── server.ts          # tRPC caller for RSC
│   │   ├── server/
│   │   │   └── trpc/
│   │   │       ├── init.ts            # initTRPC, context, procedures
│   │   │       └── router.ts          # App router with example procedure
│   │   ├── components/               # Shared UI components
│   │   └── __tests__/
│   │       └── smoke.test.ts          # Smoke test (imports router, validates health)
│   ├── proxy.ts                       # Auth middleware (Next.js 16)
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── biome.json
│   ├── vitest.config.ts
│   ├── package.json
│   ├── .gitignore
│   └── .env.example
├── composable/                        # Override files for --composable variant
│   ├── src/lib/auth/                  # Better Auth config
│   ├── src/lib/db/                    # Drizzle config + schema
│   ├── src/server/db.ts              # Drizzle client
│   ├── proxy.ts                       # Better Auth middleware
│   ├── drizzle.config.ts
│   ├── package.json                   # Complete package.json for composable variant
│   └── .env.example                   # Composable-specific env vars
├── claude/                            # Claude Code configs (both variants)
│   ├── CLAUDE.md
│   ├── settings.json
│   ├── mcp.json
│   ├── claudeignore
│   ├── hooks/
│   ├── commands/
│   ├── skills/
│   └── presets/
└── devops/                            # GitHub Actions, CodeRabbit, Vercel
    ├── vercel.json
    ├── coderabbit.yaml
    └── .github/workflows/
```

### CLI Logic

The CLI uses `set -euo pipefail` and a cleanup trap for rollback on failure:

```bash
trap 'rm -rf "$TARGET_DIR"' ERR
```

Steps:
1. Validate project name and target directory (fail if exists)
2. Copy `scaffolds/nextjs/template/` → `$TARGET_DIR`
3. If `--composable`: overlay `composable/` files (including complete `package.json` replacement)
4. Copy `claude/` → `$TARGET_DIR/.claude/`
5. Copy `devops/` files to project root
6. String-replace `{{PROJECT_NAME}}` in allowlisted text files only (`.ts`, `.tsx`, `.json`, `.md`, `.yaml`, `.yml`, `.css`, `.env.example`)
7. Run `pnpm install`
8. Init git, optionally create GitHub repo
9. Remove cleanup trap on success

The composable variant uses a **complete `package.json`** (not a patch file) to avoid JSON patching fragility. The CLI copies `composable/package.json` over the default one before `pnpm install`.

## Dependencies (verified March 24, 2026)

### Default (Supabase) package.json

```json
{
  "engines": {
    "node": ">=22.0.0"
  },
  "dependencies": {
    "next": "^16.2.1",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@supabase/ssr": "^0.9.0",
    "@supabase/supabase-js": "^2.100.0",
    "@trpc/server": "^11.15.0",
    "@trpc/client": "^11.15.0",
    "@trpc/react-query": "^11.15.0",
    "@tanstack/react-query": "^5.95.0",
    "zod": "^4.3.0",
    "tailwindcss": "^4.2.0"
  },
  "devDependencies": {
    "typescript": "^6.0.0",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@biomejs/biome": "^2.4.0",
    "vitest": "^3.1.0",
    "@testing-library/react": "^16.3.0",
    "husky": "^9.1.0",
    "lint-staged": "^16.4.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "biome check",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Composable variant additions

Remove: `@supabase/ssr`, `@supabase/supabase-js`
Add:

```json
{
  "better-auth": "^1.5.6",
  "drizzle-orm": "^0.45.1",
  "@neondatabase/serverless": "^1.0.0",
  "drizzle-kit": "^0.31.0"
}
```

### Compatibility Matrix

| Package | Old (current scaffold) | New | Status | Notes |
|---------|----------------------|-----|--------|-------|
| Next.js | via create-t3-app (~14/15) | 16.2.1 | **Breaking** | App Router only, `proxy.ts`, async APIs, Turbopack default |
| React | ~18.x | 19.2.4 | **Breaking** | Server Components stable, new hooks |
| tRPC | v10 | v11.15.0 | **Breaking** | `inputSchema` not `parameters`, Standard Schema |
| NextAuth | v4/v5 | Removed | **Replaced** | Supabase Auth (default) or Better Auth (composable) |
| Prisma | included | Removed | **Replaced** | Supabase client (default) or Drizzle (composable) |
| Tailwind | v3 | v4.2.2 | **Breaking** | CSS-first config, no `tailwind.config.js` |
| Zod | v3 | v4.3.6 | **Breaking** | Top-level validators, error param renamed, `.default()` behavior changed |
| TypeScript | ~5.x | 6.0.2 | **Breaking** | `strict: true` default, `types: []` default, `baseUrl` deprecated |
| ESLint | next config | Biome v2.4.8 | **Replaced** | `includes` field, `linter.domains`, `assist.actions.source` |
| lint-staged | ~15.x | 16.4.0 | **Major** | Verify config compatibility |

## Key Template Files

### proxy.ts (Supabase variant)

```ts
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return response
}
```

### next.config.ts

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Turbopack is default in Next.js 16 — no config needed
}

export default nextConfig
```

### tailwind.css (v4 CSS-first)

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", sans-serif;
  --font-mono: "Geist Mono", monospace;
}
```

### tRPC context with Supabase

```ts
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
```

### biome.json (v2)

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.8/schema.json",
  "files": {
    "includes": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.json"]
  },
  "linter": {
    "enabled": true,
    "domains": {
      "react": "recommended",
      "next": "recommended"
    },
    "rules": {
      "recommended": true,
      "correctness": { "noUnusedImports": "warn" },
      "suspicious": { "noExplicitAny": "error" },
      "security": { "noDangerouslySetInnerHtml": "error" }
    }
  },
  "formatter": { "indentStyle": "space", "indentWidth": 2 },
  "assist": {
    "enabled": true,
    "actions": { "source": { "organizeImports": "on" } }
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es2025",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "types": ["node"],
    "paths": {
      "@/*": ["./src/*"]
    },
    "jsx": "preserve",
    "incremental": true,
    "skipLibCheck": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### .env.example

```env
# Public keys (safe for browser)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only. Never expose in NEXT_PUBLIC_ vars.
# Only needed for admin operations (user management, bypassing RLS).
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## CLAUDE.md Updates

Key changes from current template:

- Remove all Prisma, NextAuth references
- Add Supabase patterns: RLS policies, `@supabase/ssr` client creation, auth helpers
- tRPC v11: `inputSchema` not `parameters`, `Output.object()`, `stopWhen: stepCountIs(N)`
- Next.js v16: async APIs (`await cookies()`, `await params`), `proxy.ts`, Cache Components (`'use cache'`), Turbopack default
- Tailwind v4: CSS-first config, `@theme` blocks, no `tailwind.config.js`
- Zod v4: top-level validators (`z.email()`), `{ error: }` syntax
- TypeScript v6: explicit `types` array, no `baseUrl`, strict default
- Biome v2: `includes` field, `assist.actions.source`, `linter.domains`

## DevOps

### GitHub Actions

- **claude.yml**: Unchanged (responds to `@claude` mentions)
- **claude-code-review.yml**: Unchanged (auto-review on PR open)
- **ci.yml**: Updated for pnpm, Node 24, Biome v2 check

### Vercel

Minimal `vercel.json` — Next.js 16 is zero-config on Vercel.

### CodeRabbit

Updated `coderabbit.yaml` path instructions for Supabase, tRPC v11, Tailwind v4.

### Claude Code Hooks

- `lint-after-edit.sh`: Unchanged (`biome check <file>` works in v2)
- `typecheck-before-commit.sh`: Unchanged (`tsc --noEmit` works in TS 6)
- `settings.json`: Add `Bash(pnpm:*)` permission

## Verification Plan

### Automated CLI Tests (`test/scaffold.test.sh`)

Bash test script that runs as part of the scaffold repo's own CI:

1. **File tree assertion**: Scaffold into `/tmp`, assert all expected files exist for both variants
2. **Placeholder check**: `grep -r '{{PROJECT_NAME}}' /tmp/test-app` returns zero matches
3. **Package.json correctness**: `jq` assertions on dependency names and script entries
4. **Install**: `pnpm install --frozen-lockfile` succeeds
5. **Typecheck**: `pnpm tsc --noEmit` passes
6. **Lint**: `pnpm biome check` passes
7. **Build**: `pnpm next build` succeeds (production build)
8. **Unit tests**: `pnpm test` passes (smoke test in template)
9. **Composable variant**: Repeat steps 1-8 with `--composable`

### Manual Verification (post-implementation)

10. **Dev server**: `pnpm dev`, page loads at localhost:3000
11. **Auth redirect**: `/dashboard` redirects to `/sign-in` when unauthenticated
12. **Browser check**: `agent-browser open http://localhost:3000 && agent-browser snapshot -i` — page renders, no error overlay, no console errors
13. **Claude Code hooks**: Edit a `.ts` file → lint triggers. Stage + commit → typecheck triggers.

### Template Smoke Test (`src/__tests__/smoke.test.ts`)

Ships inside the generated project:

```ts
import { describe, it, expect } from 'vitest'

describe('scaffold health', () => {
  it('zod v4 works', async () => {
    const { z } = await import('zod')
    const schema = z.object({ name: z.string() })
    expect(schema.parse({ name: 'test' })).toEqual({ name: 'test' })
  })
})
```

## Out of Scope

- Laravel and Discovery scaffold types (unchanged in this update)
- Turborepo monorepo support
- Mobile/Expo integration
- AI SDK integration (can be added later)
- Supabase Realtime or Storage template code (users add as needed)

## Risks

- **Zod 4**: Major version with API changes — template code must use v4 syntax
- **TypeScript 6**: New defaults break most existing tsconfigs — template must be explicit
- **Biome 2**: Config format changed — existing `biome.json` needs rewrite
- **@supabase/ssr 0.x**: Still pre-1.0 — API may change
- **tRPC v11 + Supabase**: Integration pattern works but is less documented than Prisma
