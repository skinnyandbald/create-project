#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Setting up create-project..."

# Create symlink for scaffold CLI
echo "→ Symlinking scaffold to /usr/local/bin/"
ln -sf "$SCRIPT_DIR/bin/scaffold" /usr/local/bin/scaffold

# Create symlink for Claude skill
echo "→ Symlinking /create-project skill to ~/.claude/commands/"
mkdir -p ~/.claude/commands
ln -sf "$SCRIPT_DIR/commands/create-project.md" ~/.claude/commands/create-project.md

echo ""
echo "✓ Setup complete!"
echo ""
echo "Usage:"
echo "  scaffold              # Interactive mode"
echo "  scaffold my-app       # Create project"
echo "  /create-project       # Claude skill"
