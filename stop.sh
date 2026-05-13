#!/usr/bin/env bash
# Stop any BlogPilot dev server listening on port 3000 (or PORT env var).
PORT="${PORT:-3000}"
PID=$(lsof -ti :"$PORT" 2>/dev/null || true)
if [ -z "$PID" ]; then
  echo "No process listening on port $PORT."
  exit 0
fi
echo "Killing PID(s): $PID"
kill -9 $PID
echo "Stopped."
