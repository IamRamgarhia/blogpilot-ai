# BlogPilot AI - one-command installer for Windows PowerShell. Idempotent.
$ErrorActionPreference = "Stop"

Write-Host "BlogPilot AI - installer" -ForegroundColor Blue
Write-Host ""

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

Write-Host "Installing dependencies..."
npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "OK  Dependencies installed" -ForegroundColor Green

npm run setup
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

node ./bin/blogpilot.mjs doctor

Write-Host ""
Write-Host "Install complete." -ForegroundColor Green
Write-Host ""
Write-Host "Next:"
Write-Host "  1. (Optional) Edit .env to add an AI provider key (Gemini is free)"
Write-Host "  2. Run: .\start.ps1   (or: npm run dev)"
Write-Host "  3. Open: http://localhost:3000"
