#!/bin/bash
# PreToolUse hook: runs typecheck before git commit commands.
# Catches type errors (including `any` types via Biome) before they're committed.
# Exit 2 + stderr = blocks the commit with feedback to Claude.
# Exit 0 = clean, proceed.

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only intercept Bash tool calls that are git commits
if [ "$TOOL_NAME" != "Bash" ]; then
  exit 0
fi

if ! echo "$TOOL_INPUT" | grep -q "git commit"; then
  exit 0
fi

# Resolve the working tree this commit targets. Prefer the session cwd (the dir
# the commit runs in — correct inside a git worktree), fall back to
# CLAUDE_PROJECT_DIR, then normalize to the git toplevel. Using
# CLAUDE_PROJECT_DIR directly is wrong under worktrees: it points at the main
# checkout, so an unrelated typecheck error there (e.g. a parallel session's
# uncommitted WIP) would block commits from every worktree.
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
PROJECT_DIR="${CWD:-$CLAUDE_PROJECT_DIR}"
PROJECT_DIR=$(cd -- "$PROJECT_DIR" >/dev/null 2>&1 && git rev-parse --show-toplevel 2>/dev/null || printf '%s\n' "$PROJECT_DIR")

# Run typecheck
OUTPUT=$(cd "$PROJECT_DIR" && npx tsc --noEmit 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "TypeScript errors found — fix before committing:" >&2
  echo "$OUTPUT" | head -30 >&2
  exit 2
fi

exit 0
