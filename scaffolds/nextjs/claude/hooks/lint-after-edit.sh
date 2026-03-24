#!/bin/bash
# Runs biome check on edited files after Edit/Write/MultiEdit.
# Exit 2 + stderr = Claude sees the errors as feedback.
# Exit 0 = clean, nothing to report.

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only check TS/JS files (matches biome.json includes)
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

# Skip files outside the project (e.g. node_modules, generated)
if [[ "$FILE_PATH" == *"node_modules"* ]] || [[ "$FILE_PATH" == *"generated"* ]]; then
  exit 0
fi

OUTPUT=$(cd "$CLAUDE_PROJECT_DIR" && npx @biomejs/biome check --no-errors-on-unmatched "$FILE_PATH" 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "Biome found issues in $FILE_PATH:" >&2
  echo "$OUTPUT" >&2
  exit 2
fi

exit 0
