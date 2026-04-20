#!/bin/bash
# ci-local.sh — Mirror the CI pipeline locally for debugging
# Usage: ./scripts/ci-local.sh
# Requires: backend running at http://localhost:5000, Docker for Testcontainers

set -e

cd "$(dirname "$0")/.."

echo "🔍 Running CI pipeline locally..."
echo ""

# ── Stage 1: Lint ────────────────────────────────────────────────────────────
echo "━━━ [1/5] Lint & Security Scan ━━━━━━━━━━━━━━━━━━━━━"
cd frontend
npm run lint || { echo "❌ Lint failed"; exit 1; }
echo "✅ Lint passed"

echo ""
npm audit --audit-level=high || echo "⚠️  npm vulnerabilities found — review before merge"
cd ..

cd backend
dotnet list package --vulnerable --include-transitive || echo "⚠️  Backend vulnerabilities found — review before merge"
cd ..

# ── Stage 2: Unit Tests ──────────────────────────────────────────────────────
echo ""
echo "━━━ [2/5] Unit Tests ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd frontend
npm run test:coverage || { echo "❌ Frontend unit tests / coverage failed"; exit 1; }
echo "✅ Frontend unit tests passed (coverage report: frontend/coverage/)"
cd ..

cd backend
dotnet test tests/SiesaAgents.UnitTests/ --configuration Release --logger "console;verbosity=minimal" || { echo "❌ Backend unit tests failed"; exit 1; }
echo "✅ Backend unit tests passed"
cd ..

# ── Stage 3: Backend Integration Tests ──────────────────────────────────────
echo ""
echo "━━━ [3/5] Backend Integration Tests ━━━━━━━━━━━━━━━━"
echo "(Requires Docker for Testcontainers)"
cd backend
dotnet test tests/SiesaAgents.IntegrationTests/ --configuration Release --logger "console;verbosity=minimal" || { echo "❌ Backend integration tests failed"; exit 1; }
echo "✅ Backend integration tests passed"
cd ..

# ── Stage 4: E2E Tests ───────────────────────────────────────────────────────
echo ""
echo "━━━ [4/5] E2E Tests ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "(Requires backend running at http://localhost:5000)"
curl -sf http://localhost:5000/api/v1/clientes > /dev/null 2>&1 || {
  echo "❌ Backend not reachable at http://localhost:5000"
  echo "   Start it with: cd backend && dotnet run --project src/SiesaAgents.API/"
  exit 1
}
cd frontend
CI=true npm run test:e2e || { echo "❌ E2E tests failed"; exit 1; }
echo "✅ E2E tests passed"

# ── Stage 5: Burn-in (3 iterations locally, 10 in CI) ───────────────────────
echo ""
echo "━━━ [5/5] Burn-in (3 of 10 iterations) ━━━━━━━━━━━━━"
for i in {1..3}; do
  echo "🔥 Burn-in $i/3"
  CI=true npm run test:e2e -- --project=chromium || { echo "❌ Burn-in failed on iteration $i"; exit 1; }
done
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Local CI pipeline passed (all 5 stages)"
echo "   Coverage report: frontend/coverage/index.html"
