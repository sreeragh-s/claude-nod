# claude-nod

AI Assistant Permission Manager - Visual overlay for approving AI tool execution requests

## Quick Start

### For End Users

1. **Download the DMG** from releases
2. **Install**: Drag claude-nod to Applications folder
3. **Setup**: Run the automated setup script
   ```bash
   curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/setup.sh | bash
   ```
   Or run locally:
   ```bash
   ./setup.sh
   ```

📖 See [SETUP.md](SETUP.md) for quick setup or [INSTALLATION.adoc](INSTALLATION.adoc) for comprehensive documentation.

## Development

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For macOS (DMG installer)
$ npm run build:mac

# For Windows
$ npm run build:win

# For Linux
$ npm run build:linux

# Unpacked (for testing)
$ npm run build:unpack
```

## Building the DMG Installer

```bash
# Clean build
rm -rf dist/ out/

# Build DMG
npm run build:mac

# DMG will be created at:
# dist/claude-nod-1.0.0.dmg
```

The DMG includes:
- Drag-and-drop installation to Applications
- Pre-configured for menubar integration
- Unsigned (for development)

## Features

- **Visual Permission Overlay** - Beautiful UI for approving/rejecting AI tool requests
- **Keyboard Shortcuts** - Quick approval/rejection (Cmd+A, Cmd+R, Cmd+D)
- **MCP Integration** - Works with Model Context Protocol
- **Menu Bar App** - Runs in the background, accessible from menu bar
- **Diff Viewer** - Preview file changes before approval
- **Auto-start** - Optional launch on login

## Post-Installation Setup

After installing the app, run the setup script to configure:

```bash
./setup.sh
```

This will:
- ✅ Remove macOS quarantine
- ✅ Create default configuration
- ✅ Setup Claude Desktop integration
- ✅ Request system permissions
- ✅ Add to Login Items (optional)
- ✅ Start the app and test connection

## Documentation

- [SETUP.md](SETUP.md) - Quick setup guide
- [INSTALLATION.adoc](INSTALLATION.adoc) - Comprehensive installation and configuration guide
- [MCP Integration Guide](INSTALLATION.adoc#setting-up-model-context-protocol-mcp) - Setting up Model Context Protocol

## License

MIT
