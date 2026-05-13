# BlogPilot AI - one-command installer for Windows PowerShell.
$ErrorActionPreference = "Stop"

Write-Host "BlogPilot AI - installer" -ForegroundColor Blue
Write-Host ""

# 1. Node check
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host "Node.js is not installed. Get it from https://nodejs.org/ (v18.17+ required)." -ForegroundColor Red
  exit 1
}
$nodeVer = (node -v).TrimStart('v')
$nodeMajor = [int]($nodeVer.Split('.')[0])
if ($nodeMajor -lt 18) {
  Write-Host "Node v$nodeVer is too old. BlogPilot needs v18.17+. Upgrade: https://nodejs.org/" -ForegroundColor Red
  exit 1
}
Write-Host "OK  Node v$nodeVer" -ForegroundColor Green

# 2. Install deps
Write-Host "Installing dependencies..."
npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "OK  Dependencies installed" -ForegroundColor Green

# 3. Generate migrations
$hasMigrations = $false
if (Test-Path drizzle) {
  $hasMigrations = (Get-ChildItem drizzle -Filter *.sql -ErrorAction SilentlyContinue).Count -gt 0
}
if (-not $hasMigrations) {
  Write-Host "Generating database migrations..."
  npx drizzle-kit generate | Out-Null
}
Write-Host "OK  Migrations ready" -ForegroundColor Green

# 4. .env
if (-not (Test-Path .env) -and -not (Test-Path .env.local)) {
  Copy-Item .env.example .env
  Write-Host "OK  Copied .env.example -> .env (edit it to add at least one AI key)" -ForegroundColor Green
}

# 5. Doctor
node ./bin/blogpilot.mjs doctor

Write-Host ""
Write-Host "Install complete." -ForegroundColor Green
Write-Host ""
Write-Host "Next:"
Write-Host "  1. Edit .env and add at least one AI provider key (Gemini is free)"
Write-Host "  2. Run: .\start.ps1   (or: npm run dev)"
Write-Host "  3. Open: http://localhost:3000"
