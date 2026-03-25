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

# Next.js (default)
scaffold my-app

# Explicit Next.js
scaffold my-app --type=nextjs

# Next.js composable variant (Better Auth + Drizzle + Neon)
scaffold my-app --composable

# Laravel
scaffold my-app --type=laravel

# Discovery (requirements gathering)
scaffold my-app --type=discovery

# Upgrade discovery project to a stack
scaffold my-app --upgrade
```

> `--type=t3` is still accepted as an alias for `--type=nextjs`.

### Claude Skill

In any Claude Code session:
```
/create-project
```

## Project Types

| Type | Stack | Deployment |
|------|-------|------------|
| **Next.js** | Next.js 16, TypeScript 6, Tailwind v4, tRPC v11, Supabase, Zod 4, Vitest, Biome v2 | Vercel |
| **Next.js `--composable`** | Next.js 16, TypeScript 6, Tailwind v4, tRPC v11, Better Auth, Drizzle, Neon, Zod 4, Vitest, Biome v2 | Vercel |
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
- Supabase (Auth + Database + Storage)
- tRPC v11 (type-safe API)
- Tailwind CSS v4 (CSS-first config)
- Zod 4 (schema validation)
- TypeScript 6 (strict mode)
- Biome v2 (linting + formatting)
- Vitest (testing)
- UI Kit: lucide, cva, clsx, tailwind-merge, sonner, next-themes, radix
- `vercel.json` - Deployment config

#### Composable variant (`--composable`)

Replaces Supabase with a composable auth/database stack:
- **Better Auth** instead of Supabase Auth
- **Drizzle ORM** instead of Supabase client
- **Neon** (serverless Postgres) instead of Supabase Database

Everything else (tRPC, Tailwind, Biome, Vitest, etc.) stays the same.

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
