#!/bin/bash
# Standalone burn-in script — run tests N times to detect flakiness
# Usage: ./scripts/burn-in.sh [iterations] [--chromium-only]
# Default: 10 iterations, all browsers
# Requires: backend running at http://localhost:5000

set -e

cd "$(dirname "$0")/../frontend"

ITERATIONS=${1:-10}
EXTRA_ARGS=""

if [[ "$*" == *"--chromium-only"* ]]; then
  EXTRA_ARGS="--project=chromium"
fi

# Verify backend is reachable
if ! curl -sf http://localhost:5000/api/v1/clientes > /dev/null 2>&1; then
  echo "❌ Backend not reachable at http://localhost:5000"
  echo "   Start it with: cd backend && dotnet run --project src/SiesaAgents.API/"
  exit 1
fi

echo "Starting burn-in: $ITERATIONS iterations $EXTRA_ARGS"
echo ""

FAILURES=0
for i in $(seq 1 "$ITERATIONS"); do
  echo "🔥 Iteration $i/$ITERATIONS"
  if ! CI=true npm run test:e2e -- $EXTRA_ARGS; then
    FAILURES=$((FAILURES + 1))
    echo "⚠️  FAILURE detected on iteration $i"
  fi
done

echo ""
if [ "$FAILURES" -gt 0 ]; then
  echo "❌ Burn-in FAILED: $FAILURES/$ITERATIONS iterations had failures — tests are flaky."
  exit 1
else
  echo "✅ Burn-in PASSED: $ITERATIONS/$ITERATIONS iterations clean."
fi
