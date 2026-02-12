#!/bin/bash

# claude-nod Post-Installation Setup Script
# Run this after installing claude-nod to configure MCP and system settings

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="claude-nod"
APP_PATH="/Applications/${APP_NAME}.app"
CONFIG_DIR="$HOME/Library/Application Support/${APP_NAME}"
CONFIG_FILE="$CONFIG_DIR/config.json"
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
MCP_PORT=54321

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_app_installed() {
    if [ ! -d "$APP_PATH" ]; then
        print_error "claude-nod is not installed at $APP_PATH"
        echo ""
        echo "Please install claude-nod first:"
        echo "1. Mount the DMG file"
        echo "2. Drag claude-nod to Applications folder"
        echo "3. Run this script again"
        exit 1
    fi
    print_success "claude-nod found at $APP_PATH"
}

remove_quarantine() {
    print_info "Removing quarantine attribute..."
    if xattr -d com.apple.quarantine "$APP_PATH" 2>/dev/null; then
        print_success "Quarantine removed"
    else
        print_warning "No quarantine attribute found (this is fine)"
    fi
}

create_config_dir() {
    print_info "Creating configuration directory..."
    mkdir -p "$CONFIG_DIR"
    print_success "Configuration directory created"
}

create_default_config() {
    print_info "Creating default configuration..."
    
    cat > "$CONFIG_FILE" << 'EOF'
{
  "version": "1.0.0",
  "autoStart": true,
  "port": 54321,
  "host": "127.0.0.1",
  "theme": "system",
  "notifications": {
    "enabled": true,
    "sound": true,
    "showPreview": true
  },
  "shortcuts": {
    "approve": "CommandOrControl+A",
    "reject": "CommandOrControl+R",
    "approveAll": "CommandOrControl+D"
  },
  "ui": {
    "overlay": {
      "position": "center",
      "opacity": 0.95,
      "blur": true
    },
    "animations": true
  },
  "security": {
    "requireConfirmation": true,
    "autoApproveList": [],
    "autoRejectList": [],
    "logRequests": true
  }
}
EOF
    
    print_success "Configuration file created at $CONFIG_FILE"
}

setup_claude_desktop() {
    print_info "Setting up Claude Desktop integration..."
    
    # Check if Claude Desktop is installed
    if [ ! -d "/Applications/Claude.app" ]; then
        print_warning "Claude Desktop not found. Skipping Claude integration."
        echo ""
        print_info "To install Claude Desktop later:"
        echo "  Visit: https://claude.ai/download"
        return
    fi
    
    # Create Claude config directory
    mkdir -p "$(dirname "$CLAUDE_CONFIG")"
    
    # Check if config exists
    if [ -f "$CLAUDE_CONFIG" ]; then
        print_warning "Claude Desktop config already exists"
        echo ""
        read -p "Do you want to update it with claude-nod integration? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping Claude Desktop integration"
            return
        fi
        
        # Backup existing config
        cp "$CLAUDE_CONFIG" "${CLAUDE_CONFIG}.backup.$(date +%s)"
        print_info "Backed up existing config"
    fi
    
    # Create or update Claude config
    cat > "$CLAUDE_CONFIG" << EOF
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "$HOME/Documents"]
    }
  },
  "permissionHandler": {
    "type": "external",
    "endpoint": "http://127.0.0.1:${MCP_PORT}/permissions"
  }
}
EOF
    
    print_success "Claude Desktop configured to use claude-nod"
}

request_permissions() {
    print_info "Setting up system permissions..."
    echo ""
    echo "claude-nod needs the following permissions to work properly:"
    echo "  • Screen Recording - To display overlay"
    echo "  • Accessibility - To capture keyboard shortcuts"
    echo ""
    print_warning "macOS will prompt you for these permissions when you first launch the app"
    echo ""
    
    read -p "Open System Settings to grant permissions now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "x-apple.systempreferences:com.apple.preference.security?Privacy"
        print_info "Please enable:"
        echo "  1. Privacy & Security > Screen Recording > claude-nod"
        echo "  2. Privacy & Security > Accessibility > claude-nod"
        echo ""
        read -p "Press Enter after granting permissions..."
    fi
}

add_to_login_items() {
    print_info "Adding to Login Items..."
    echo ""
    read -p "Start claude-nod automatically on login? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        osascript -e "tell application \"System Events\" to make login item at end with properties {path:\"$APP_PATH\", hidden:false}" 2>/dev/null || true
        print_success "Added to Login Items"
        echo ""
        print_info "You can manage Login Items in:"
        echo "  System Settings > General > Login Items"
    else
        print_info "Skipped adding to Login Items"
    fi
}

start_app() {
    print_info "Starting claude-nod..."
    
    # Kill any existing instances
    killall "$APP_NAME" 2>/dev/null || true
    sleep 1
    
    # Start the app
    open -a "$APP_NAME"
    sleep 2
    
    # Check if running
    if pgrep -x "$APP_NAME" > /dev/null; then
        print_success "claude-nod is running"
        print_info "Look for the menu bar icon in the top-right corner"
    else
        print_error "Failed to start claude-nod"
        echo ""
        print_info "Try starting manually:"
        echo "  open -a $APP_NAME"
    fi
}

test_connection() {
    print_info "Testing MCP endpoint..."
    
    sleep 1
    
    if curl -s "http://127.0.0.1:${MCP_PORT}/health" > /dev/null 2>&1; then
        print_success "MCP endpoint is responding on port ${MCP_PORT}"
    else
        print_warning "MCP endpoint not responding yet"
        echo ""
        print_info "This is normal if the app just started. Wait a few seconds and try:"
        echo "  curl http://127.0.0.1:${MCP_PORT}/health"
    fi
}

create_uninstall_script() {
    print_info "Creating uninstall script..."
    
    cat > "$HOME/Desktop/uninstall-claude-nod.sh" << 'UNINSTALL_EOF'
#!/bin/bash

# Uninstall claude-nod

echo "Uninstalling claude-nod..."

# Stop the app
killall claude-nod 2>/dev/null || true

# Remove application
rm -rf "/Applications/claude-nod.app"

# Remove user data
rm -rf "$HOME/Library/Application Support/claude-nod"
rm -rf "$HOME/Library/Preferences/com.claude.nod.plist"
rm -rf "$HOME/Library/Caches/claude-nod"
rm -rf "$HOME/Library/Logs/claude-nod"

# Remove from login items
osascript -e 'tell application "System Events" to delete login item "claude-nod"' 2>/dev/null || true

echo "✓ claude-nod has been uninstalled"
echo ""
echo "Note: Claude Desktop configuration was not modified."
echo "To remove claude-nod from Claude Desktop config:"
echo "  rm ~/Library/Application\ Support/Claude/claude_desktop_config.json"
UNINSTALL_EOF
    
    chmod +x "$HOME/Desktop/uninstall-claude-nod.sh"
    print_success "Uninstall script created on Desktop"
}

print_summary() {
    print_header "Setup Complete!"
    
    echo -e "${GREEN}claude-nod is ready to use!${NC}"
    echo ""
    echo "Quick Start:"
    echo "  • Menu bar icon shows status"
    echo "  • Permission requests appear as overlays"
    echo "  • Use shortcuts: Cmd+A (approve), Cmd+R (reject)"
    echo ""
    echo "Configuration:"
    echo "  • Config file: $CONFIG_FILE"
    echo "  • Logs: $HOME/Library/Logs/claude-nod/"
    echo ""
    echo "Claude Desktop:"
    if [ -f "$CLAUDE_CONFIG" ]; then
        echo "  • Configured: $CLAUDE_CONFIG"
        echo "  • Restart Claude Desktop to apply changes"
    else
        echo "  • Not configured (Claude Desktop not found)"
        echo "  • Install from: https://claude.ai/download"
    fi
    echo ""
    echo "Testing:"
    echo "  • Health check: curl http://127.0.0.1:${MCP_PORT}/health"
    echo "  • View logs: tail -f ~/Library/Logs/claude-nod/main.log"
    echo ""
    echo "Uninstall:"
    echo "  • Run: ~/Desktop/uninstall-claude-nod.sh"
    echo ""
    print_info "Need help? Check INSTALLATION.adoc for detailed documentation"
}

# Main execution
main() {
    clear
    print_header "claude-nod Setup Wizard"
    
    echo "This script will:"
    echo "  1. Verify installation"
    echo "  2. Create configuration files"
    echo "  3. Setup Claude Desktop integration (if available)"
    echo "  4. Request system permissions"
    echo "  5. Add to Login Items (optional)"
    echo "  6. Start the application"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setup cancelled"
        exit 0
    fi
    
    print_header "Step 1: Verify Installation"
    check_app_installed
    remove_quarantine
    
    print_header "Step 2: Create Configuration"
    create_config_dir
    create_default_config
    
    print_header "Step 3: Setup Claude Desktop"
    setup_claude_desktop
    
    print_header "Step 4: System Permissions"
    request_permissions
    
    print_header "Step 5: Login Items"
    add_to_login_items
    
    print_header "Step 6: Start Application"
    start_app
    
    print_header "Step 7: Test Connection"
    test_connection
    
    print_header "Step 8: Create Uninstall Script"
    create_uninstall_script
    
    echo ""
    print_summary
}

# Run main function
main
