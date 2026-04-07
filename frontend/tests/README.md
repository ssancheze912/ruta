# E2E Test Suite — Siesa Agents CRM

End-to-end tests using [Playwright](https://playwright.dev/). These tests run against the live app + real API (no mocks).

## Prerequisites

- Node 20+ (see `.nvmrc` at project root)
- The backend API running at `http://localhost:5000`
- The Vite dev server running at `http://localhost:5173`

## Setup

```bash
# 1. Install Playwright and faker (first time only)
npm install -D @playwright/test @faker-js/faker
npx playwright install

# 2. Copy environment config
cp .env.example .env
# Edit .env if your ports differ from the defaults

# 3. Start the app + API, then run tests
npm run test:e2e
```

## Running Tests

| Command | Description |
|---|---|
| `npm run test:e2e` | Run all E2E tests (headless, all browsers) |
| `npm run test:e2e:ui` | Interactive Playwright UI mode |
| `npm run test:e2e:headed` | Visible browser (debug-friendly) |
| `npx playwright test --grep "Clientes"` | Filter by suite name |
| `npx playwright show-report` | Open last HTML report |

## Directory Structure

```
tests/
├── e2e/                        # Test specs organized by feature
│   └── clientes.spec.ts        # Clientes CRUD flows
├── support/
│   ├── fixtures/               # Composable Playwright fixtures
│   │   ├── index.ts            # Merged test object (import here)
│   │   └── factories/
│   │       ├── cliente-factory.ts   # API-level Cliente seeding + cleanup
│   │       └── contacto-factory.ts  # API-level Contacto seeding + cleanup
│   └── helpers/
│       └── api-request.ts      # Typed fetch wrapper (pure function)
├── tsconfig.json               # TypeScript config for Node/Playwright
└── README.md                   # This file
```

## Architecture

### Fixture Pattern (pure function → fixture → `extend`)

Test helpers follow three layers:

1. **Pure function** (`helpers/`) — framework-agnostic, easily unit-tested
2. **Factory class** (`fixtures/factories/`) — wraps pure function, tracks cleanup
3. **Fixture** (`fixtures/index.ts`) — wires factory into Playwright's `test.extend`

```typescript
// In a test file
import { test, expect } from '../support/fixtures'

test('seeds a cliente and verifies it in the UI', async ({ page, clienteFactory }) => {
  const cliente = await clienteFactory.create({ nombre: 'Acme' })
  await page.goto('/clientes')
  await expect(page.getByText(cliente.nombre)).toBeVisible()
  // clienteFactory.cleanup() runs automatically after the test
})
```

### Data Isolation

Each test creates its own data via API and each factory deletes what it created.
This means tests can run in parallel without interfering with each other.

### Selector Strategy

Always use `data-testid` attributes:

```typescript
page.getByTestId('cliente-list-item')     // preferred
page.getByRole('button', { name: /crear/i }) // accessible role (also good)
// Avoid: page.locator('.btn-primary')    // brittle CSS
```

## Failure Artifacts

Playwright captures on failure only (configured in `playwright.config.ts`):

- **Screenshots**: `test-results/`
- **Videos**: `test-results/` (deleted on success)
- **Traces**: `test-results/` — open with `npx playwright show-trace trace.zip`
- **HTML Report**: `test-results/html/index.html`
- **JUnit XML**: `test-results/junit.xml` (for CI upload)

## CI Integration

Tests are configured for CI via `process.env.CI`:

- `forbidOnly: true` — fails if `.only` is left in code
- `retries: 2` — automatic retry on flakiness
- `workers: 1` — sequential runs in CI to avoid port conflicts

See `.github/workflows/` for the CI pipeline that uploads `test-results/` as artifacts.

## Adding New Tests

1. Create `tests/e2e/<feature>.spec.ts`
2. Import `test, expect` from `'../support/fixtures'` (not `@playwright/test` directly)
3. Use factories to seed data — never hardcode IDs or assume existing records
4. Add `data-testid` attributes in the component if the selector doesn't exist yet

## Knowledge Base Applied

- Fixture architecture: pure function → factory class → `test.extend`
- Data factories: faker-based with override support and auto-cleanup
- Network-first: tests seed data via API before navigating (avoids UI race conditions)
- Failure-only artifacts: screenshot, video, trace retained only on failure
