# Stop any BlogPilot dev server listening on a port (default 3000).
param([int]$Port = 3000)
$conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $conns) {
  Write-Host "No process listening on port $Port."
  exit 0
}
$pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($pid in $pids) {
  Write-Host "Killing PID $pid"
  Stop-Process -Id $pid -Force
}
Write-Host "Stopped."
