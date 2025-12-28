#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$HOME/.config/scaffold"
CONFIG_FILE="$CONFIG_DIR/config"

echo "Setting up create-project..."
echo ""

# Prompt for projects directory
DEFAULT_PROJECT_DIR="$HOME/code"
if [ -f "$CONFIG_FILE" ]; then
    # shellcheck source=/dev/null
    source "$CONFIG_FILE"
    DEFAULT_PROJECT_DIR="${PROJECT_DIR:-$DEFAULT_PROJECT_DIR}"
fi

read -p "Projects directory [$DEFAULT_PROJECT_DIR]: " PROJECT_DIR
PROJECT_DIR="${PROJECT_DIR:-$DEFAULT_PROJECT_DIR}"

# Expand ~ to $HOME
PROJECT_DIR="${PROJECT_DIR/#\~/$HOME}"

# Create config directory and save config
mkdir -p "$CONFIG_DIR"
cat > "$CONFIG_FILE" << EOF
# Scaffold configuration
PROJECT_DIR="$PROJECT_DIR"
EOF

# Create projects directory if it doesn't exist
if [ ! -d "$PROJECT_DIR" ]; then
    echo "→ Creating projects directory: $PROJECT_DIR"
    mkdir -p "$PROJECT_DIR"
fi

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
echo "Configuration saved to: $CONFIG_FILE"
echo "Projects will be created in: $PROJECT_DIR"
echo ""
echo "Usage:"
echo "  scaffold              # Interactive mode"
echo "  scaffold my-app       # Create project"
echo "  /create-project       # Claude skill"
