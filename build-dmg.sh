#!/bin/bash

# Complete Build Script for claude-nod DMG
# This script builds the DMG installer from source

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  claude-nod DMG Builder${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js first.${NC}"
    echo "  brew install node"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Clean previous builds
echo -e "\n${BLUE}Cleaning previous builds...${NC}"
rm -rf dist/ out/
echo -e "${GREEN}✓ Cleaned${NC}"

# Install dependencies
echo -e "\n${BLUE}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Build the application
echo -e "\n${BLUE}Building application...${NC}"
npm run build:mac

# Check if DMG was created
if [ -f "dist/claude-nod-1.0.0.dmg" ]; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  Build Successful! 🎉${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    
    DMG_SIZE=$(ls -lh dist/claude-nod-1.0.0.dmg | awk '{print $5}')
    echo -e "📦 DMG File: ${BLUE}dist/claude-nod-1.0.0.dmg${NC}"
    echo -e "📏 Size: ${BLUE}${DMG_SIZE}${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Mount the DMG: open dist/claude-nod-1.0.0.dmg"
    echo "  2. Drag claude-nod to Applications"
    echo "  3. Run setup: ./setup.sh"
    echo ""
    echo -e "${BLUE}Distribution:${NC}"
    echo "  • Share the DMG file with users"
    echo "  • Include setup.sh for automated configuration"
    echo "  • Include QUICKSTART.md for user guidance"
    echo ""
    
    # Offer to open the DMG
    read -p "Open the DMG now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open dist/claude-nod-1.0.0.dmg
    fi
    
else
    echo -e "\n${RED}========================================${NC}"
    echo -e "${RED}  Build Failed ✗${NC}"
    echo -e "${RED}========================================${NC}\n"
    echo "Check the output above for errors."
    exit 1
fi
