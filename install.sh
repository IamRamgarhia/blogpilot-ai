#!/usr/bin/env bash
# BlogPilot AI — one-command installer for macOS / Linux.
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}BlogPilot AI — installer${NC}"
echo ""

# 1. Node check
if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}Node.js is not installed. Get it from https://nodejs.org/ (v18.17+ required).${NC}"
  exit 1
fi

NODE_MAJOR=$(node -v | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo -e "${RED}Node $(node -v) is too old. BlogPilot needs v18.17 or higher. Upgrade: https://nodejs.org/${NC}"
  exit 1
fi
echo -e "${GREEN}OK${NC}  Node $(node -v)"

# 2. Install deps
echo "Installing dependencies..."
npm install --no-audit --no-fund
echo -e "${GREEN}OK${NC}  Dependencies installed"

# 3. Generate migrations
if [ ! -d drizzle ] || [ -z "$(ls drizzle/*.sql 2>/dev/null)" ]; then
  echo "Generating database migrations..."
  npx drizzle-kit generate >/dev/null
fi
echo -e "${GREEN}OK${NC}  Migrations ready"

# 4. .env
if [ ! -f .env ] && [ ! -f .env.local ]; then
  cp .env.example .env
  echo -e "${GREEN}OK${NC}  Copied .env.example → .env (edit it to add at least one AI key)"
fi

# 5. Doctor
node ./bin/blogpilot.mjs doctor

echo ""
echo -e "${GREEN}Install complete.${NC}"
echo ""
echo "Next:"
echo "  1. Edit .env and add at least one AI provider key (Gemini is free)"
echo "  2. Run: ./start.sh   (or: npm run dev)"
echo "  3. Open: http://localhost:3000"
