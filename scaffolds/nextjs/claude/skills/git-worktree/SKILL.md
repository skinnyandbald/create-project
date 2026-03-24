---
name: git-worktree
description: Manages Git worktrees for isolated parallel development. Creates worktrees in .github/worktrees/ with symlinked .env files.
---

# Git Worktree Manager

Manage isolated Git worktrees for parallel development, following project conventions.

## Quick Reference

| Command | Description |
|---------|-------------|
| `create <name> [base]` | Create worktree with symlinked .env |
| `list` | List all worktrees |
| `cleanup` | Remove inactive worktrees |
| `switch <name>` | Switch to a worktree |

## CRITICAL: Always Use the Manager Script

**NEVER call `git worktree add` directly.** Always use the script.

```bash
# CORRECT
bash .claude/skills/git-worktree/scripts/worktree-manager.sh create feature-name

# WRONG - Never do this directly
git worktree add .github/worktrees/feature-name -b feature-name main
```

The script handles:
1. Symlinks `.env` file (not copy) from project root
2. Ensures `.github/worktrees/` is in `.gitignore`
3. Creates consistent directory structure at `.github/worktrees/`

## Project Conventions

This project uses **symlinks** for `.env` files, not copies:

```bash
# Script creates: ln -s ../../../.env .github/worktrees/[name]/.env
```

**Why symlinks?**
- Single source of truth for environment variables
- Changes in main `.env` reflect immediately in worktrees
- No sync issues between copies

## Commands

### `create <branch-name> [from-branch]`

Creates worktree in `.github/worktrees/<branch-name>`.

```bash
# Create from main (default)
bash .claude/skills/git-worktree/scripts/worktree-manager.sh create feature/new-feature main

# Create from specific branch
bash .claude/skills/git-worktree/scripts/worktree-manager.sh create hotfix/auth develop
```

**What happens:**
1. Checks if worktree exists
2. Creates `.github/worktrees/` directory if needed
3. Updates base branch from remote
4. Creates worktree and branch
5. **Symlinks `.env` from project root**
6. Verifies symlink

### `list` or `ls`

```bash
bash .claude/skills/git-worktree/scripts/worktree-manager.sh list
```

Shows:
- Worktree name and branch
- Current worktree marked with `*`
- Main repo status

### `switch <name>` or `go <name>`

```bash
bash .claude/skills/git-worktree/scripts/worktree-manager.sh switch feature/pipeline-steps
```

### `cleanup` or `clean`

Removes inactive worktrees interactively.

```bash
bash .claude/skills/git-worktree/scripts/worktree-manager.sh cleanup
```

**Safety:** Won't remove current worktree.

## Workflow Examples

### Feature Development

```bash
# Create worktree for new feature
bash .claude/skills/git-worktree/scripts/worktree-manager.sh create feature/new-feature main

# Work in the worktree (note: slashes become dashes in directory name)
cd .github/worktrees/feature-new-feature
npm install  # if needed
npm run dev

# Return to project root and cleanup when done
cd "$PROJECT_ROOT"
bash .claude/skills/git-worktree/scripts/worktree-manager.sh cleanup
```

### PR Review in Isolation

```bash
# Create worktree for PR
bash .claude/skills/git-worktree/scripts/worktree-manager.sh create pr-42-auth-fix origin/pr-branch

# Review in isolation
cd .github/worktrees/pr-42-auth-fix
npm run test

# Cleanup after review
cd "$PROJECT_ROOT"
bash .claude/skills/git-worktree/scripts/worktree-manager.sh cleanup
```

## Directory Structure

```text
project/
├── .env                              # Source of truth
├── .github/
│   └── worktrees/                    # All worktrees live here
│       ├── feature-auth/
│       │   ├── .env -> ../../../.env # Symlink
│       │   ├── src/
│       │   └── ...
│       └── feature-api/
│           ├── .env -> ../../../.env # Symlink
│           └── ...
└── .gitignore                        # Includes .github/worktrees
```

## Troubleshooting

### "Worktree already exists"

Switch to it instead:

```bash
bash .claude/skills/git-worktree/scripts/worktree-manager.sh switch <name>
```

### "Cannot remove worktree: it is current"

Return to main repo first:

```bash
cd "$PROJECT_ROOT"
bash .claude/skills/git-worktree/scripts/worktree-manager.sh cleanup
```

### Symlink broken?

Recreate manually:

```bash
cd .github/worktrees/<name>
rm .env
ln -s ../../../.env .env
ls -la .env  # Verify
```
