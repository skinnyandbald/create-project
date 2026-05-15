# create-project

Opinionated project scaffolding tool with Claude Code integration.

## Prerequisites

- Node.js >= 22
- pnpm

## Installation

1. Clone this repo:
```bash
cd ~/code
git clone git@github.com:YOUR_USERNAME/create-project.git
```

2. Run the setup script:
```bash
./setup.sh
```

This will:
- Prompt for your projects directory (default: `~/code`)
- Save configuration to `~/.config/scaffold/config`
- Symlink `scaffold` to your PATH
- Symlink the `/create-project` skill to `~/.claude/commands/`

## Usage

### CLI

```bash
# Interactive mode
scaffold

# Next.js (default: Better Auth + Drizzle + Neon)
scaffold my-app

# Next.js with Supabase instead
scaffold my-app --supabase

# Next.js + provision cloud services via Stripe Projects
scaffold my-app --provision

# Laravel
scaffold my-app --type=laravel

# Discovery (requirements gathering)
scaffold my-app --type=discovery

# Upgrade discovery project to a stack
scaffold my-app --upgrade
```

> `--type=t3` and `--type=nextjs` are accepted as aliases. `--composable` is deprecated (composable is now the default).

### Claude Skill

In any Claude Code session:
```
/create-project
```

## Project Types

| Type | Stack | Deployment |
|------|-------|------------|
| **Next.js** (default) | Next.js 16, TypeScript 6, Tailwind v4, tRPC v11, Better Auth, Drizzle, Neon, Zod 4, Vitest, Biome v2 | Vercel |
| **Next.js `--supabase`** | Next.js 16, TypeScript 6, Tailwind v4, tRPC v11, Supabase, Zod 4, Vitest, Biome v2 | Vercel |
| **Laravel** | Laravel, Inertia, React, TypeScript | Laravel Cloud |
| **Discovery** | Requirements gathering only | N/A |

## What Gets Scaffolded

### All Projects
- `CLAUDE.md` - Claude Code instructions
- `.claude/settings.json` - Permissions
- `.claude/mcp.json` - MCP servers (Context7, Figma)
- `.coderabbit.yaml` - PR review config
- `.github/workflows/` - Claude GitHub Actions
- `.claudeignore` - Protect secrets from Claude

### Next.js Projects
- Next.js 16 (App Router, Turbopack, proxy.ts)
- Better Auth (authentication)
- Drizzle ORM (database access)
- Neon (serverless Postgres)
- tRPC v11 (type-safe API)
- Tailwind CSS v4 (CSS-first config)
- Zod 4 (schema validation)
- TypeScript 6 (strict mode)
- Biome v2 (linting + formatting)
- Vitest (testing)
- UI Kit: lucide, cva, clsx, tailwind-merge, sonner, next-themes, radix
- `vercel.json` - Deployment config

#### Supabase variant (`--supabase`)

Replaces the default auth/database stack with Supabase:
- **Supabase Auth** instead of Better Auth
- **Supabase client** instead of Drizzle ORM
- **Supabase Database** instead of Neon

Everything else (tRPC, Tailwind, Biome, Vitest, etc.) stays the same.

### Cloud Provisioning (`--provision`)

Provisions cloud services via [Stripe Projects](https://projects.dev) after scaffolding. Currently supported for Next.js projects only.

```bash
scaffold my-app --provision
```

Interactively confirms each service before provisioning. Syncs credentials to `.env`.

**Default stack:** Neon, Vercel, Sentry, PostHog
**Supabase stack:** Supabase, Vercel, Sentry, PostHog

Requires: Stripe CLI (`brew install stripe/stripe-cli/stripe`) with the projects plugin (`stripe plugin install projects`). You must be logged in (`stripe login`).

**Note:** This provisions real cloud accounts. Some services may incur costs.

### Laravel Projects
- Laravel + Breeze with React/Inertia
- UI Kit: lucide, cva, clsx, tailwind-merge, sonner
- Testing: Pest, Dusk, Pint, Larastan
- Laravel AI Boost MCP

### Discovery Projects
- Requirements gathering commands
- Minimal setup until stack is chosen
- Upgrade path to Next.js or Laravel

## Configuration

User configuration is stored in `~/.config/scaffold/config`:
```bash
PROJECT_DIR="/your/projects/path"
```

Re-run `./setup.sh` to change the projects directory.

## Customization

Templates are in `scaffolds/`:
```
scaffolds/
├── nextjs/           # Next.js templates
├── laravel/          # Laravel templates
└── discovery/        # Discovery templates
```

Edit templates to customize defaults for your workflow.

## Syncing Across Devices

This is a Git repo - push changes and pull on other machines:
```bash
cd ~/code/create-project
git pull
```

Run `./setup.sh` after pulling to update symlinks.
