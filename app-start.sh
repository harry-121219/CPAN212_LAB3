#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "=========================================="
echo "Starting IncidentTracker (macOS/Linux)"
echo "Root: $ROOT_DIR"
echo "=========================================="

if [ ! -d "$ROOT_DIR/backend" ]; then
  echo "ERROR: backend folder not found."
  exit 1
fi
if [ ! -d "$ROOT_DIR/frontend" ]; then
  echo "ERROR: frontend folder not found."
  exit 1
fi

echo ""
echo "Starting Backend..."
cd "$ROOT_DIR/backend"
npm install
npm start &
BACK_PID=$!

echo ""
echo "Waiting 5 seconds..."
sleep 5

echo ""
echo "Starting Frontend..."
cd "$ROOT_DIR/frontend"
npm install
npm run dev &
FRONT_PID=$!

echo ""
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop."

trap "kill $BACK_PID $FRONT_PID 2>/dev/null || true" INT TERM
wait
