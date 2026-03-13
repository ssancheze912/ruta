---
stepsCompleted: [1, 2, 3, 4, 5, 6]
story_key: 1-2-frontend-navigation-shell
story_path: _bmad-output/implementation-artifacts/1-2-frontend-navigation-shell.md
status: In Progress
reviewer: SiesaTeam (AI Agent)
date: 2026-03-13
---

# Code Review: 1-2-frontend-navigation-shell

- **Date**: 2026-03-13
- **Reviewer**: SiesaTeam (AI Agent) — Adversarial Senior Developer
- **Status**: In Progress

## Initial Discovery

### Git Status (root repo)
- Branch: `develop-santidev-gaduranb-frontend-navigation-shell`
- All Story 1.2 files are **untracked/modified** — not yet committed

### Actual Changed Files (frontend/.git context)

**Modified (vs Story 1.1 commit):**
- `frontend/.npmrc` — M3 fix from Story 1.1 review (comment added) — NOT committed in frontend/.git previously
- `frontend/tsconfig.json` — M4 fix from Story 1.1 review (shadcn comment added) — NOT committed in frontend/.git previously
- `frontend/package.json` — framer-motion, testing deps added
- `frontend/package-lock.json` — updated (expected)
- `frontend/vite.config.ts` — vitest config + routeFileIgnorePattern added
- `frontend/src/main.tsx` — replaced App with RouterProvider

**Deleted:**
- `frontend/src/App.tsx` ✅
- `frontend/src/App.css` ✅
- `frontend/components.json.bak` — undocumented deletion

**New (untracked):**
- `frontend/src/router.ts`
- `frontend/src/routeTree.gen.ts` (auto-generated)
- `frontend/src/app/providers/queryClient.ts`
- `frontend/src/test/setup.ts`
- `frontend/src/routes/__root.tsx`
- `frontend/src/routes/index.tsx`
- `frontend/src/routes/_app.tsx`
- `frontend/src/routes/_app/clientes.tsx`
- `frontend/src/routes/_app/contactos.tsx`
- `frontend/src/routes/__tests__/navigation.test.tsx`
- `frontend/src/shared/components/NotFoundView.tsx`

### Undocumented Changes (in repo but NOT in Story File List)
- `frontend/.npmrc` — Story 1.1 M3 fix, not in Story 1.2 File List (pre-existing uncommitted change)
- `frontend/tsconfig.json` — Story 1.1 M4 fix, not in Story 1.2 File List (pre-existing uncommitted change)
- `frontend/package-lock.json` — not documented (expected, auto-generated)
- `frontend/components.json.bak` — deleted silently, not documented

### Files in Story but Verified Present
- All 16 documented files confirmed present ✅

---

## Review Attack Plan

### AC Validation Matrix

| AC | Description | Success Criteria | Files to Inspect |
|---|---|---|---|
| AC1 | Desktop NavigationRail visible ≥1024px | `LayoutBase` + `navigationItems` render; clicking navigates without full reload | `__root.tsx` |
| AC2 | Mobile NavigationBar visible <1024px | `NavigationBar` with `lg:hidden`; items tappable + accessible | `__root.tsx` |
| AC3 | Deep linking + active item highlight | Direct URL loads correct view; `active` prop reflects current path | `__root.tsx`, `_app/clientes.tsx`, `_app/contactos.tsx` |
| AC4 | Root redirect `/` → `/clientes` (replace:true) | `beforeLoad` throws `redirect({ replace: true })`; no orphan history entry | `routes/index.tsx` |
| AC5 | 404 Not Found — Spanish + link to /clientes | `notFoundComponent: NotFoundView`; "Página no encontrada"; "Ir a Clientes" link | `__root.tsx`, `NotFoundView.tsx` |
| AC6 | RouterProvider + QueryClientProvider in main.tsx | `App.tsx` deleted; `RouterProvider` + `QueryClientProvider` wrap app | `main.tsx`, `router.ts`, `queryClient.ts` |

### Task Audit Plan

| Task | Status | Verify |
|---|---|---|
| T1: Bootstrap Router | [x] | `main.tsx` structure, `router.ts` Register augmentation, `queryClient.ts` config |
| T2: Root Route + LayoutBase | [x] | `__root.tsx` navigationItems wiring, active state derivation, notFoundComponent |
| T3: Index Redirect | [x] | `index.tsx` beforeLoad + redirect pattern |
| T4: Layout Route + Placeholders | [x] | `_app.tsx` Outlet, clientes/contactos placeholders, routeTree generation |
| T5: Mobile NavigationBar | [x] | Responsive wrapper, `activeItemId`, `onItemClick` |
| T6: Tests | [x] | 6 tests pass, coverage of all ACs, no false positives |

### Focus Areas (Adversarial)

#### 🔴 HIGH — Correctness & Reliability
- **Duplicate navigation handlers**: `navigationItems[].onClick` AND `navigationRailProps.onItemClick` BOTH call `navigate()` — potential double-fire on each rail click
- **Undeclared dependency**: `@heroicons/react` imported in `__root.tsx` but NOT in `package.json` — fragile transitive dep via siesa-ui-kit; breaks on fresh `npm ci`

#### 🟡 MEDIUM — Quality & Accuracy
- **Stale TODO comment** in `main.tsx`: `// TODO Story 1.2: RouterProvider replaces App.tsx` — work is done, comment is misleading noise
- **`activeNavBarId` inconsistency on 404**: Defaults to `'clientes'` on unknown routes, while `navigationItems[].active` correctly returns `false` for both — NavigationBar and NavigationRail show conflicting active states on 404

#### 🟠 LOW — Maintainability & Tests
- **`navigationItems`/`navBarItems` not memoized**: Fresh array + JSX node allocation on every render; scales poorly
- **Missing active-state test (AC3)**: No test verifies `active` prop / `aria-current` on nav items at `/clientes` or `/contactos`
- **No NavigationBar-specific test (AC2)**: Tests only exercise the rail (`getAllByRole('button')[0]`); mobile bar never directly asserted
- **`routeFileIgnorePattern` too broad**: `'(__tests__|test|spec)'` matches any path containing "test" (e.g., `latest-contest.tsx`) — should use anchored extension regex

### Security Checklist
- ✅ No `dangerouslySetInnerHTML`
- ✅ No user-controlled URL params rendered as HTML
- ✅ No eval / dynamic import with untrusted input
- ✅ Route paths are hard-coded strings, not interpolated user input
- ⚠️ `routeFileIgnorePattern` regex is not anchored — theoretical route tree manipulation if malicious file is added with "test" in name (low risk in controlled repo)

### Performance Checklist
- ⚠️ `navigationItems` + `navBarItems` arrays recreated on every render (useMemo absent)
- ✅ `autoCodeSplitting: true` in TanStack Router plugin — routes are code-split
- ✅ No N+1 fetches, no unbounded lists
- ✅ No blocking suspense boundaries on navigation shell

### Architecture Compliance
- ✅ siesa-ui-kit used exclusively for navigation (no custom nav components)
- ✅ Spanish UI labels ("Clientes", "Contactos")
- ✅ URL as source of truth (`useRouterState` not Zustand)
- ✅ `routeTree.gen.ts` auto-generated, not hand-edited
- ✅ `@/` alias in use
- ❌ `@heroicons/react` not declared in `package.json` — architecture constraint violation (undeclared dep)

---

## Full Adversarial Review

### AC Validation Results

| AC | Result | Evidence |
|---|---|---|
| AC1 — Desktop NavigationRail | ✅ PASS | `LayoutBase` + `navigationItems: NavigationRailGroupMenuItem[]` + `navigationRailProps.onItemClick` in `__root.tsx` |
| AC2 — Mobile NavigationBar | ✅ PASS | `<div className="lg:hidden fixed bottom-0...">` wrapping `<NavigationBar>` with correct `items`, `activeItemId`, `onItemClick`, `ariaLabel` |
| AC3 — Deep linking + active highlight | ✅ PASS | `currentPath.startsWith('/clientes|/contactos')` drives `active` prop; direct URL works |
| AC4 — Root redirect replace:true | ✅ PASS | `index.tsx` `beforeLoad: () => { throw redirect({ to: '/clientes', replace: true }) }` — exact pattern |
| AC5 — 404 Not Found Spanish | ✅ PASS | `notFoundComponent: NotFoundView` on root route; "Página no encontrada" + "Ir a Clientes" link |
| AC6 — RouterProvider + QueryClientProvider | ✅ PASS | `main.tsx` uses both providers; `App.tsx` deleted |

All 6 ACs pass functionally. **However, the build is broken (see M1 below).**

---

### Findings

#### M1 — CRITICAL: Build Fails — Vitest Globals Missing from tsconfig

**File**: `frontend/tsconfig.app.json:8`
**Severity**: 🔴 CRITICAL — blocks CI/CD, production build broken

**Evidence** (`npm run build` output):
```
src/routes/__tests__/navigation.test.tsx(24,1): error TS2593: Cannot find name 'describe'.
src/routes/__tests__/navigation.test.tsx(25,3): error TS2593: Cannot find name 'it'.
src/routes/__tests__/navigation.test.tsx(28,7): error TS2304: Cannot find name 'expect'.
```

`vite.config.ts` sets `test.globals: true` (Vitest runtime globals), but `tsconfig.app.json` only has `"types": ["vite/client"]`. TypeScript never learns about `describe`/`it`/`expect` globals.

The story completion note claims `"npm run build — 0 TypeScript errors, 0 build errors ✅"` — **this is false**. Build fails with 14 TS errors.

**Fix**: Add `"vitest/globals"` to the `types` array in `tsconfig.app.json`:
```json
"types": ["vite/client", "vitest/globals"]
```

---

#### M2 — HIGH: Duplicate Navigation Handlers on Rail Items

**File**: `frontend/src/routes/__root.tsx:12-58`
**Severity**: 🔴 HIGH — double navigate() call on every rail click

`navigationItems` each declare an `onClick` that calls `navigate()`. `navigationRailProps.onItemClick` ALSO calls `navigate()`. If `LayoutBase` invokes both `item.onClick()` and `navigationRailProps.onItemClick(item)` for a single rail click, two navigation calls fire — potential race condition, TanStack Router warning, or double history push.

```typescript
// BOTH of these fire on a single click:
onClick: () => void navigate({ to: '/clientes' }),   // ← per-item handler
// ...
navigationRailProps: {
  onItemClick: (item) => {                            // ← group handler (ALSO fires)
    if (item.id === 'clientes') void navigate({ to: '/clientes' })
  },
},
```

**Fix**: Use ONE handler. Since `LayoutBase` accepts `navigationRailProps.onItemClick`, remove the `onClick` from individual `navigationItems` entries and centralize navigation in `navigationRailProps.onItemClick`.

---

#### M3 — MEDIUM: `@heroicons/react` Undeclared Direct Dependency

**File**: `frontend/package.json`, `frontend/src/routes/__root.tsx:4`
**Severity**: 🟡 MEDIUM — works now, fragile long-term

`__root.tsx` imports `{ UsersIcon, UserIcon } from '@heroicons/react/24/outline'`. `@heroicons/react` is not in `package.json` — it's only available because `siesa-ui-kit` depends on it and npm hoists it. If `siesa-ui-kit` upgrades or internalizes its heroicons usage, this import breaks silently.

**Fix**: `npm install @heroicons/react` to declare it as a direct dependency.

---

#### M4 — MEDIUM: Stale TODO Comment in main.tsx

**File**: `frontend/src/main.tsx:10`
**Severity**: 🟡 MEDIUM — misleading noise

```typescript
// TODO Story 1.2: RouterProvider replaces App.tsx per architecture setup
```

This TODO was left from Story 1.1 as a marker for future work. Story 1.2 has been implemented. The comment now incorrectly implies work is still pending.

**Fix**: Remove the comment entirely.

---

#### M5 — MEDIUM: `activeNavBarId` Inconsistency on 404 Routes

**File**: `frontend/src/routes/__root.tsx:46`
**Severity**: 🟡 MEDIUM — visual inconsistency between nav components on 404

```typescript
const activeNavBarId = currentPath.startsWith('/contactos') ? 'contactos' : 'clientes'
```

On a 404 path (e.g., `/desconocido`):
- `navigationItems[].active` = `false` for both (correct — neither is active)
- `activeNavBarId` = `'clientes'` (WRONG — highlights Clientes even on a 404 page)

The two nav components display conflicting active state on the same 404 screen.

**Fix**:
```typescript
const activeNavBarId = currentPath.startsWith('/contactos')
  ? 'contactos'
  : currentPath.startsWith('/clientes')
    ? 'clientes'
    : undefined
```

---

#### M6 — LOW: `navigationItems` / `navBarItems` Not Memoized

**File**: `frontend/src/routes/__root.tsx:12-44`
**Severity**: 🟠 LOW — premature but escalates when nav items grow

Both arrays are rebuilt on every render, including JSX icon nodes (`<UsersIcon className="w-5 h-5" />`). With `siesa-ui-kit` components watching reference equality, this creates unnecessary re-renders as the app scales.

**Fix**: Wrap both arrays in `useMemo(() => [...], [currentPath])`.

---

#### M7 — LOW: Missing Active-State Test (AC3 gap)

**File**: `frontend/src/routes/__tests__/navigation.test.tsx`
**Severity**: 🟠 LOW — AC3 partially untested

AC3 states: *"The active nav item is visually highlighted."* There is no test verifying that the `active` class or `aria-current` attribute is set on the correct nav item when at `/clientes` or `/contactos`. The tests verify rendering but not active state behavior.

**Fix**: Add a test asserting `aria-current="page"` (or equivalent) on the active nav button.

---

#### M8 — LOW: No NavigationBar-Specific Test (AC2 gap)

**File**: `frontend/src/routes/__tests__/navigation.test.tsx`
**Severity**: 🟠 LOW — mobile path untested

All navigation tests use `getAllByRole('button')[0]` which targets the rail (desktop) button. The NavigationBar (mobile) is never directly asserted. If `NavigationBar` were removed, all existing tests would still pass.

**Fix**: Add a test that specifically checks for the NavigationBar `ariaLabel="Navegación principal"` container or its items.

---

#### M9 — LOW: `routeFileIgnorePattern` Too Broad

**File**: `frontend/vite.config.ts:10`
**Severity**: 🟠 LOW — theoretical future footgun

```typescript
routeFileIgnorePattern: '(__tests__|test|spec)'
```

This pattern matches any path containing the substring "test" — including hypothetical future route files like `latest-contest.tsx` or `test-drive.tsx`. Files with these names would be silently excluded from the route tree.

**Fix**: Use anchored extension pattern: `routeFileIgnorePattern: '\\.(test|spec)\\.(tsx?|jsx?)$'`

---

### Summary

| # | Severity | Issue | File | Fix Required |
|---|---|---|---|---|
| M1 | 🔴 CRITICAL | Build failure — vitest globals not in tsconfig | `tsconfig.app.json` | Add `"vitest/globals"` to types |
| M2 | 🔴 HIGH | Duplicate navigate() on rail click | `__root.tsx:53-58` | Remove per-item onClick or navigationRailProps.onItemClick |
| M3 | 🟡 MEDIUM | @heroicons/react undeclared dependency | `package.json` | `npm install @heroicons/react` |
| M4 | 🟡 MEDIUM | Stale TODO comment | `main.tsx:10` | Delete the comment |
| M5 | 🟡 MEDIUM | activeNavBarId wrong on 404 | `__root.tsx:46` | Add `/clientes` guard before default |
| M6 | 🟠 LOW | navigationItems not memoized | `__root.tsx:12-44` | useMemo with [currentPath] |
| M7 | 🟠 LOW | No active-state test (AC3) | `navigation.test.tsx` | Add aria-current assertion |
| M8 | 🟠 LOW | No NavigationBar test (AC2) | `navigation.test.tsx` | Add NavigationBar assertion |
| M9 | 🟠 LOW | routeFileIgnorePattern too broad | `vite.config.ts:10` | Use anchored extension regex |

**Total: 9 issues (1 critical, 1 high, 3 medium, 4 low)**

---

## Fixes Applied

| # | Issue | Fix | Status |
|---|---|---|---|
| M1 | Build failure — vitest globals | Added `"vitest/globals"` to `tsconfig.app.json` types array | ✅ Fixed |
| M2 | Duplicate navigation handlers | Removed `onClick` from `navigationItems` entries; single handler via `navigationRailProps.onItemClick` | ✅ Fixed |
| M3 | @heroicons/react undeclared | `npm install @heroicons/react` — now declared in `package.json` | ✅ Fixed |
| M4 | Stale TODO comment | Removed `// TODO Story 1.2:...` from `main.tsx` | ✅ Fixed |
| M5 | activeNavBarId wrong on 404 | Added `/clientes` guard before default; returns `undefined` on 404 | ✅ Fixed |
| M6 | navigationItems not memoized | Wrapped both arrays in `useMemo(() => [...], [currentPath])` | ✅ Fixed |
| M7 | No active-state test (AC3) | Added tests asserting active nav buttons present at `/clientes` and `/contactos` | ✅ Fixed |
| M8 | No NavigationBar test (AC2) | Added test asserting `role="navigation"` with `ariaLabel="Navegación principal"` | ✅ Fixed |
| M9 | routeFileIgnorePattern too broad | Changed to `'\\.(test\|spec)\\.(tsx?\|jsx?)$'` (anchored extension regex) | ✅ Fixed |

### Validation
- `npm run build` — ✅ 0 TypeScript errors, build clean
- `npm run test` — ✅ 9/9 tests pass (was 6/6)

### Files Modified by Review
- `frontend/tsconfig.app.json` — M1: added `"vitest/globals"` to types
- `frontend/package.json` — M3: added `@heroicons/react ^2.2.0` to dependencies
- `frontend/src/routes/__root.tsx` — M2: removed per-item onClick; M5: activeNavBarId guard; M6: useMemo
- `frontend/src/main.tsx` — M4: removed stale TODO comment
- `frontend/vite.config.ts` — M9: anchored routeFileIgnorePattern regex
- `frontend/src/routes/__tests__/navigation.test.tsx` — M7+M8: 3 new tests added


