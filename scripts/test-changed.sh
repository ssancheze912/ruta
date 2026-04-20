#!/bin/bash
# Run only Playwright tests for changed source files
# Usage: ./scripts/test-changed.sh
# Requires: git, Node, Playwright configured

set -e

cd "$(dirname "$0")/../frontend"

CHANGED_FILES=$(git diff --name-only HEAD~1 2>/dev/null || git diff --name-only HEAD 2>/dev/null)

if [ -z "$CHANGED_FILES" ]; then
  echo "No changed files detected — running full suite."
  npm run test:e2e
  exit 0
fi

# Map changed source modules to likely test grep patterns
GREP_PATTERNS=""

if echo "$CHANGED_FILES" | grep -qi "clientes"; then
  GREP_PATTERNS="$GREP_PATTERNS|Clientes"
fi

if echo "$CHANGED_FILES" | grep -qi "contacto"; then
  GREP_PATTERNS="$GREP_PATTERNS|Contacto"
fi

# Strip leading pipe
GREP_PATTERNS="${GREP_PATTERNS#|}"

if [ -n "$GREP_PATTERNS" ]; then
  echo "Changed files detected — running affected tests matching: $GREP_PATTERNS"
  npm run test:e2e -- --grep="$GREP_PATTERNS"
else
  echo "Changed files do not map to specific tests — running full suite."
  npm run test:e2e
fi
