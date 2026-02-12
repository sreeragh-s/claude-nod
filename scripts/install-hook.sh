#!/bin/bash

# Install Claude Code permission hook
# This script configures Claude Code to send permission requests
# to the Claude Permission Overlay app.

set -e

SETTINGS_FILE="$HOME/.claude/settings.json"
HOOK_SCRIPT="$(cd "$(dirname "$0")" && pwd)/hook.js"

echo "Claude Permission Overlay - Hook Installer"
echo "============================================"
echo ""

# Check hook script exists
if [ ! -f "$HOOK_SCRIPT" ]; then
  echo "Error: hook.js not found at $HOOK_SCRIPT"
  exit 1
fi

# Make hook script executable
chmod +x "$HOOK_SCRIPT"

# Ensure .claude directory exists
mkdir -p "$HOME/.claude"

# Check if settings file exists
if [ ! -f "$SETTINGS_FILE" ]; then
  echo "{}" > "$SETTINGS_FILE"
  echo "Created $SETTINGS_FILE"
fi

# Check if node is available
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is required but not found in PATH"
  exit 1
fi

# Use node to merge the hook config into existing settings
node -e "
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('$SETTINGS_FILE', 'utf8'));

// Add hooks config
if (!settings.hooks) settings.hooks = {};
if (!settings.hooks.PermissionRequest) settings.hooks.PermissionRequest = [];

// Check if hook already installed
const hookPath = '$HOOK_SCRIPT';
const existing = settings.hooks.PermissionRequest.find(
  h => h.hooks && h.hooks.some(hh => hh.command && hh.command.includes('hook.js'))
);

if (existing) {
  console.log('Hook is already installed. Updating path...');
  settings.hooks.PermissionRequest = settings.hooks.PermissionRequest.filter(
    h => !(h.hooks && h.hooks.some(hh => hh.command && hh.command.includes('hook.js')))
  );
}

settings.hooks.PermissionRequest.push({
  matcher: '',
  hooks: [
    {
      type: 'command',
      command: 'node ' + hookPath
    }
  ]
});

fs.writeFileSync('$SETTINGS_FILE', JSON.stringify(settings, null, 2));
console.log('Hook installed successfully!');
console.log('');
console.log('Hook script: ' + hookPath);
console.log('Settings file: $SETTINGS_FILE');
console.log('');
console.log('Make sure the Claude Permission Overlay app is running');
console.log('before using Claude Code.');
"
