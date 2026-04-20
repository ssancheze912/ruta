# CI/CD Pipeline Guide

## Overview

This project uses **GitHub Actions** for continuous integration. The test pipeline runs Playwright E2E tests against the `frontend/` application with parallel sharding, flaky-test burn-in, and failure artifact collection.

**Pipeline file:** `.github/workflows/test.yml`

---

## Pipeline Stages

### 1. Lint (`lint` job)
- Runs `npm run lint` (ESLint) in `frontend/`
- Runs `npm audit --audit-level=high` (frontend dependencies)
- Runs `dotnet list package --vulnerable` (backend dependencies)
- Runs in parallel with `unit-tests`
- Target time: < 2 minutes

### 2. Unit Tests (`unit-tests` job)
- **Frontend:** `npm run test:coverage` (Vitest + coverage report uploaded as artifact)
- **Backend:** `dotnet test tests/SiesaAgents.UnitTests/` (xUnit, no Docker needed)
- Runs in parallel with `lint`; required before `backend-integration`
- Target time: < 3 minutes

### 3. Backend Integration Tests (`backend-integration` job)
- `dotnet test tests/SiesaAgents.IntegrationTests/` (xUnit + Testcontainers)
- Each test class spins up its own PostgreSQL 16 container via Docker
- Requires Docker (available on `ubuntu-latest` by default)
- Required before E2E (validates API contracts and schema)
- Target time: < 5 minutes

### 4. E2E Tests (`e2e` job — 4 parallel shards)
- Splits the Playwright suite across 4 matrix jobs
- Starts a real Postgres service + backend process per shard
- Collects traces/screenshots/videos on failure only (30-day retention)
- Needs: `lint` + `backend-integration`
- Target time: < 10 minutes per shard

### 5. Burn-In (`burn-in` job)
- Runs the full Chromium suite **10 times consecutively**
- Detects non-deterministic (flaky) tests before they reach `main`
- **Triggers:** PRs to `main`/`develop` + weekly cron (Monday 3AM UTC)
- Even 1 failure in 10 iterations = the test is flaky and must be fixed
- Target time: < 30 minutes

---

## Triggers

| Event | Lint | Unit Tests | Integration | E2E | Burn-In |
|-------|------|------------|-------------|-----|---------|
| Push to `main`/`develop` | ✅ | ✅ | ✅ | ✅ | ❌ |
| PR to `main`/`develop` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Weekly cron (Mon 3AM) | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Running Locally

### Mirror CI pipeline
```bash
./scripts/ci-local.sh
```
Runs all 5 stages: lint → unit tests (frontend + backend) → backend integration tests → E2E → burn-in (3 iterations locally, 10 in CI).

**Prerequisite for stages 4 & 5:** Backend must be running at `http://localhost:5000`.
```bash
# Terminal 1 — start backend with a local Postgres
cd backend && dotnet run --project src/SiesaAgents.API/
# Terminal 2 — run the pipeline
./scripts/ci-local.sh
```

**Stages 1–3 (lint + unit + integration) work without a running backend:**
```bash
# Stages 1-3 only
cd frontend && npm run lint && npm run test:coverage && cd ..
cd backend && dotnet test tests/SiesaAgents.UnitTests/ && dotnet test tests/SiesaAgents.IntegrationTests/
```

### Run only affected tests (by changed files)
```bash
./scripts/test-changed.sh
```
Detects which source modules changed and runs only related tests. Falls back to full suite if no mapping found.

### Standalone burn-in
```bash
# Default: 10 iterations, all browsers
./scripts/burn-in.sh

# Custom iterations
./scripts/burn-in.sh 5

# Chromium only (faster)
./scripts/burn-in.sh 10 --chromium-only
```

---

## Debugging Failed CI Runs

### 1. Download failure artifacts
In the GitHub Actions run → **Artifacts** section → download `test-results-shard-N` or `burn-in-failures`.

### 2. Open Playwright trace viewer
```bash
npx playwright show-trace path/to/trace.zip
```

### 3. Mirror CI locally
```bash
./scripts/ci-local.sh
```
This runs the same steps as CI with the same `CI=true` environment variable.

### 4. Common issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Dev server timeout | Vite takes > 30s to start | Check for build errors in `npm run dev` output |
| Tests pass locally, fail in CI | `CI=true` sets `workers: 1` | Run locally with `CI=true npm run test:e2e` |
| Cache miss → slow install | `package-lock.json` changed | Expected — cache rebuilds automatically |
| Flaky test detected in burn-in | Non-deterministic assertion or race condition | Add `await expect(...).toBeVisible()` with proper timeout |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BASE_URL` | No | Override app URL (default: `http://localhost:5173`) |
| `CI` | Auto-set | Enables Playwright CI mode (1 worker, 2 retries) |

---

## Secrets

See `docs/ci-secrets-checklist.md` for the full list of secrets to configure.

For notifications (optional Slack), configure `SLACK_WEBHOOK` in:
**Repository → Settings → Secrets and variables → Actions**

---

## Badge

Add this to `README.md` to show CI status:

```markdown
![Tests](https://github.com/ssancheze912/ruta/actions/workflows/test.yml/badge.svg)
```

---

## Performance Targets

| Stage | Target |
|-------|--------|
| Lint | < 2 min |
| Unit Tests | < 3 min |
| Backend Integration | < 5 min |
| E2E (per shard) | < 10 min |
| Burn-In | < 30 min |
| Total (PR pipeline) | < 50 min |

---

## Next Steps After CI Setup

1. **Commit & push** the CI config to trigger the first run
2. **Configure secrets** (see `ci-secrets-checklist.md`)
3. **Open a PR** to verify the full pipeline including burn-in
4. Add `playwright.config.ts` `webServer` config if the backend is needed in CI
