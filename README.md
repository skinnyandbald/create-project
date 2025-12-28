# create-project

Opinionated project scaffolding tool with Claude Code integration.

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

# With project name
scaffold my-app

# Direct stack selection
scaffold my-app --type=t3
scaffold my-app --type=laravel
scaffold my-app --type=discovery

# Upgrade discovery project to a stack
scaffold my-app --upgrade
```

### Claude Skill

In any Claude Code session:
```
/create-project
```

## Project Types

| Type | Stack | Deployment |
|------|-------|------------|
| **T3** | Next.js, TypeScript, Tailwind, tRPC, Prisma | Vercel |
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

### T3 Projects
- Full create-t3-app setup
- UI Kit: lucide, cva, clsx, tailwind-merge, sonner, next-themes, radix
- Testing: Vitest, Playwright, husky, lint-staged, oxlint
- `vercel.json` - Deployment config

### Laravel Projects
- Laravel + Breeze with React/Inertia
- UI Kit: lucide, cva, clsx, tailwind-merge, sonner
- Testing: Pest, Dusk, Pint, Larastan
- Laravel AI Boost MCP

### Discovery Projects
- Requirements gathering commands
- Minimal setup until stack is chosen
- Upgrade path to T3 or Laravel

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
├── t3/               # T3 templates
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
