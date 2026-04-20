#!/bin/bash
# run-e2e.sh — Ejecuta solo los tests E2E con Playwright
# Uso: ./scripts/run-e2e.sh
# Requiere: backend corriendo en http://localhost:5000

set -e

cd "$(dirname "$0")/.."

echo "━━━ E2E Tests ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar que el backend está corriendo
curl -sf http://localhost:5000/api/v1/clientes > /dev/null 2>&1 || {
  echo "❌ Backend no disponible en http://localhost:5000"
  echo "   Levántalo con: cd backend && dotnet run --project src/SiesaAgents.API/"
  exit 1
}

echo "✅ Backend disponible"

cd frontend
CI=true npx playwright test

echo "✅ E2E tests completados"
