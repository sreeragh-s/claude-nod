# claude-nod

Claude-nod - Visual overlay for approving claude code permissions form anywhere 

A beautiful macOS menu bar app that gives you visual control over AI assistant tool requests, with keyboard shortcuts and real-time diff previews.

## ⚡ Quick Installation

**One-line installer** (recommended):
```bash
curl -fsSL https://raw.githubusercontent.com/sreeragh-s/claude-nod/main/setup.sh | bash
```

This will:
- ✅ Download and install claude-nod
- ✅ Configure MCP integration
- ✅ Request system permissions
- ✅ Launch the app

**Manual Installation:**
1. Download the [latest DMG release](https://github.com/sreeragh-s/claude-nod/releases)
2. Drag claude-nod to Applications folder
3. Run setup:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/sreeragh-s/claude-nod/main/setup.sh | bash
   ```

📖 See [SETUP.md](SETUP.md) for quick setup or [INSTALLATION.adoc](INSTALLATION.adoc) for comprehensive documentation.

## 🛠️ Development

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Project Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for macOS (DMG installer)
npm run build:mac

# Build unpacked (for testing)
npm run build:unpack

# Generate app icons from SVG
npm run icons
```

### Building the DMG Installer

```bash
# Clean previous builds
rm -rf dist/ out/

# Build DMG
npm run build:mac

# Output: dist/claude-nod-0.0.1.dmg
```

The DMG includes:
- Drag-and-drop installation to Applications
- Pre-configured for menubar integration
- Unsigned (for development)

## ✨ Features

- **Visual Permission Overlay** - Beautiful UI for approving/rejecting AI tool requests
- **Keyboard Shortcuts** - Quick actions (⌘A approve, ⌘R reject, ⌘D details)
- **MCP Integration** - Works seamlessly with Model Context Protocol
- **Menu Bar App** - Runs in background, accessible from macOS menu bar
- **Diff Viewer** - Preview file changes before approval with syntax highlighting
- **Smart Notifications** - Desktop notifications for approval requests
- **Auto-start** - Optional launch on login
- **Secure** - All approvals are explicit and transparent

## 📚 Documentation

- [SETUP.md](SETUP.md) - Quick setup guide (2 minutes)
- [QUICKSTART.md](QUICKSTART.md) - Quick reference card
- [INSTALLATION.adoc](INSTALLATION.adoc) - Comprehensive installation and configuration guide
- [MCP Integration Guide](INSTALLATION.adoc#setting-up-model-context-protocol-mcp) - Setting up Model Context Protocol

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT - See [LICENSE](LICENSE) for details.

## ⭐ Support

If you find this project helpful, please give it a star on GitHub!
