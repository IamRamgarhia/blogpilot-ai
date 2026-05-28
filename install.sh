#!/usr/bin/env bash
# BlogPilot AI - one-command installer for macOS / Linux. Idempotent.
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}BlogPilot AI - installer${NC}"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}Node.js is not installed. Get it from https://nodejs.org/ (v18.17+ required).${NC}"
  exit 1
fi

NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo -e "${RED}Node $(node -v) is too old. BlogPilot needs v18.17+. Upgrade: https://nodejs.org/${NC}"
  exit 1
fi
echo -e "${GREEN}OK${NC}  Node $(node -v)"

echo "Installing dependencies..."
npm install --no-audit --no-fund
echo -e "${GREEN}OK${NC}  Dependencies installed"

# Runs migrations, env setup, AND creates a Desktop shortcut.
npm run setup

node ./bin/blogpilot.mjs doctor

echo ""
echo -e "${GREEN}Install complete.${NC}"
echo ""
echo "Launch:"
echo "  • Double-click the \"BlogPilot AI\" shortcut on your Desktop"
echo "  • OR run: ./start.sh   (or: npm run launch)"
echo ""
echo "It opens automatically at http://localhost:44321"
