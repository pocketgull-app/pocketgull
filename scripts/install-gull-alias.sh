#!/usr/bin/env bash
# Pocket-Gull CLI (gull) Bash/Zsh Alias Installer

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
GULL_JS="${SCRIPT_DIR}/gull.js"

if [ ! -f "$GULL_JS" ]; then
    echo "❌ Error: Could not locate gull.js at ${GULL_JS}"
    exit 1
fi

ALIAS_LINE="alias gull=\"node \\\"${GULL_JS}\\\""

PROFILE_FILE=""
if [ -n "$ZSH_VERSION" ] || [ -f "$HOME/.zshrc" ]; then
    PROFILE_FILE="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    PROFILE_FILE="$HOME/.bashrc"
else
    PROFILE_FILE="$HOME/.profile"
fi

if grep -q "alias gull=" "$PROFILE_FILE" 2>/dev/null; then
    echo "ℹ️ 'gull' alias is already present in ${PROFILE_FILE}."
else
    echo "" >> "$PROFILE_FILE"
    echo "# Pocket-Gull Diagnostic CLI Global Alias" >> "$PROFILE_FILE"
    echo "$ALIAS_LINE" >> "$PROFILE_FILE"
    echo "✅ Successfully added 'gull' alias to ${PROFILE_FILE}"
    echo "💡 Run 'source ${PROFILE_FILE}' to start using 'gull'"
fi
