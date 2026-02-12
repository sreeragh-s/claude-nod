# claude-nod Quick Setup Guide

## One-Command Setup

After installing claude-nod (drag to Applications), run this single command:

```bash
curl -fsSL https://raw.githubusercontent.com/sreeragh-s/claude-nod/main/setup.sh | bash
```

Or download and run locally:

```bash
# Download the setup script
curl -O https://raw.githubusercontent.com/sreeragh-s/claude-nod/main/setup.sh

# Make it executable
chmod +x setup.sh

# Run it
./setup.sh
```

## What the Setup Script Does

The setup script automates:

1. ✅ Verifies claude-nod installation
2. ✅ Removes macOS quarantine attributes
3. ✅ Creates configuration directory and files
4. ✅ Sets up Claude Desktop integration (if installed)
5. ✅ Guides you through system permission setup
6. ✅ Optionally adds to Login Items
7. ✅ Starts the application
8. ✅ Tests the MCP endpoint connection
9. ✅ Creates an uninstall script

## Manual Setup (If Preferred)

### 1. Remove Quarantine

```bash
xattr -cr /Applications/claude-nod.app
```

### 2. Create Configuration

```bash
mkdir -p ~/Library/Application\ Support/claude-nod

cat > ~/Library/Application\ Support/claude-nod/config.json << 'EOF'
{
  "autoStart": true,
  "port": 54321,
  "shortcuts": {
    "approve": "CommandOrControl+A",
    "reject": "CommandOrControl+R"
  }
}
EOF
```

### 3. Configure Claude Desktop

```bash
mkdir -p ~/Library/Application\ Support/Claude

cat > ~/Library/Application\ Support/Claude/claude_desktop_config.json << 'EOF'
{
  "permissionHandler": {
    "type": "external",
    "endpoint": "http://127.0.0.1:54321/permissions"
  }
}
EOF
```

### 4. Grant Permissions

Open System Settings:
- Privacy & Security → Screen Recording → Enable claude-nod
- Privacy & Security → Accessibility → Enable claude-nod

### 5. Start the App

```bash
open -a claude-nod
```

## Testing

Verify the setup works:

```bash
# Check if app is running
pgrep -x claude-nod

# Test MCP endpoint
curl http://127.0.0.1:54321/health

# View logs
tail -f ~/Library/Logs/claude-nod/main.log
```

## Uninstall

Run the generated uninstall script:

```bash
~/Desktop/uninstall-claude-nod.sh
```

Or manually:

```bash
killall claude-nod
rm -rf /Applications/claude-nod.app
rm -rf ~/Library/Application\ Support/claude-nod
```

## Troubleshooting

### App Won't Open

```bash
# Remove all extended attributes
xattr -cr /Applications/claude-nod.app

# Try running directly
/Applications/claude-nod.app/Contents/MacOS/claude-nod
```

### Permission Overlay Not Showing

1. Check Screen Recording permission is enabled
2. Restart the app after granting permissions
3. Check logs for errors

### MCP Connection Failed

```bash
# Check if port is in use
lsof -i :54321

# Restart the app
killall claude-nod && open -a claude-nod
```

## Advanced Configuration

Edit `~/Library/Application Support/claude-nod/config.json`:

```json
{
  "autoStart": true,
  "port": 54321,
  "host": "127.0.0.1",
  "theme": "system",
  "notifications": {
    "enabled": true,
    "sound": true
  },
  "shortcuts": {
    "approve": "CommandOrControl+A",
    "reject": "CommandOrControl+R",
    "approveAll": "CommandOrControl+D"
  },
  "security": {
    "requireConfirmation": true,
    "autoApproveList": [],
    "autoRejectList": []
  }
}
```

## Support

- 📖 Full documentation: [INSTALLATION.adoc](INSTALLATION.adoc)
- 🐛 Report issues: GitHub Issues
- 💬 Get help: support@example.com
