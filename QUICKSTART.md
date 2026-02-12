# claude-nod - Quick Start

## Installation Complete! 🎉

### Next Steps

1. **Run Setup Script** (Recommended)
   ```bash
   curl -fsSL https://raw.githubusercontent.com/sreeragh-s/claude-nod/main/setup.sh | bash
   ```

2. **Or Manual Setup**
   - Open System Settings → Privacy & Security
   - Enable Screen Recording for claude-nod
   - Enable Accessibility for claude-nod

3. **Start the App**
   - Find claude-nod in Applications
   - Look for the menu bar icon in top-right corner

### Keyboard Shortcuts

- `⌘ + A` - Approve request
- `⌘ + R` - Reject request  
- `⌘ + D` - Approve and don't ask again

### Configuration

Config file location:
```
~/Library/Application Support/claude-nod/config.json
```

### Testing

Check if running:
```bash
curl http://127.0.0.1:54321/health
```

### Troubleshooting

**App won't open?**
```bash
xattr -cr /Applications/claude-nod.app
```

**Need help?**
- See INSTALLATION.adoc for full docs
- See SETUP.md for quick guide

### Uninstall

```bash
~/Desktop/uninstall-claude-nod.sh
```

---

Version 1.0.0 | MIT License
