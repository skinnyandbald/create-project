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

if ! echo "$TOOL_INPUT" | grep -qE '^\s*git\s+commit(\s|$)'; then
  exit 0
fi

# Run typecheck
OUTPUT=$(cd "$CLAUDE_PROJECT_DIR" && npx tsc --noEmit 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "TypeScript errors found — fix before committing:" >&2
  echo "$OUTPUT" | head -30 >&2
  exit 2
fi

exit 0
