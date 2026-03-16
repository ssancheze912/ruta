---
stepsCompleted: [1, 2, 3, 4]
story_key: 4-1-view-associated-contacts-in-client-detail
story_path: _bmad-output/implementation-artifacts/4-1-view-associated-contacts-in-client-detail.md
status: done
date: 2026-03-15
---

# Code Review: 4-1-view-associated-contacts-in-client-detail

- **Date**: 2026-03-15
- **Reviewer**: SiesaTeam (AI Agent — Adversarial Senior Developer)
- **Status**: In Progress

## Initial Discovery

### Git vs Story File List Cross-Reference

**Files in Story but NOT in Git:** None ✅ — all 13 claimed files confirmed in git.

**Files in Git but NOT in Story (undocumented):**
- `frontend/src/modules/crm/clientes/presentation/ClienteFormDialog.tsx` — modified pre-story (epic 2)
- `frontend/src/modules/crm/clientes/presentation/ClienteFormDialog.test.tsx` — modified pre-story
- `frontend/src/modules/crm/clientes/application/useUpdateCliente.ts` — untracked, pre-story
- `frontend/src/modules/crm/clientes/application/useUpdateCliente.test.ts` — untracked, pre-story
- `frontend/src/modules/crm/contactos/presentation/ContactosSplitLayout.tsx` — untracked orphan
- `_bmad-output/implementation-artifacts/feature-status.yaml` — Jira sync artifact

---

## Review Findings

### 🔴 HIGH — 2 Issues

---

#### [H1] Integration Tests Will Fail: FK Constraint Violation in `SeedContactoAsync`

**File:** `backend/tests/SiesaAgents.IntegrationTests/Contactos/GetContactosByClienteIdTests.cs:50-66`

**Problem:** `SeedContactoAsync` inserts a `ContactoEntity` with `ClienteId = clienteId` (a random `Guid.NewGuid()`) directly into the database. However `ContactoConfiguration.cs` defines a real FK constraint:

```csharp
builder.HasOne<ClienteEntity>()
    .WithMany()
    .HasForeignKey(c => c.ClienteId)
    .OnDelete(DeleteBehavior.SetNull)
    .HasConstraintName("fk_contactos_clientes");
```

PostgreSQL enforces `fk_contactos_clientes`: a non-null `client_id` value **must** exist in the `clientes` table. Inserting a contact with a random GUID `ClienteId` that has no corresponding `ClienteEntity` will throw `23503 foreign_key_violation`. All 3 integration tests will fail at runtime.

**Fix:** Seed a `ClienteEntity` row first for each `clienteId` used in tests, then seed the contacts.

---

#### [H2] Pre-existing: 12 Broken Tests in `ContactoListView.test.tsx`

**File:** `frontend/src/modules/crm/contactos/presentation/ContactoListView.test.tsx`

**Problem:** `ContactoListView` was rewritten in a prior session to use `useNavigate` (from `@tanstack/react-router`) and `Table` from `siesa-ui-kit`, but `ContactoListView.test.tsx` was never updated. The mock still only exposes `Link` from `@tanstack/react-router`, causing:

```
Error: [vitest] No "useNavigate" export is defined on the "@tanstack/react-router" mock.
```

12 tests fail. The test also mocks `ContactoForm` which no longer exists (renamed to `ContactoFormDialog`), and tests table rows via `Link` instead of `Table onRowClick`.

**Fix:** Rewrite `ContactoListView.test.tsx` to match the current component implementation — mock `useNavigate`, mock `siesa-ui-kit` Table, mock `ContactoFormDialog`.

---

### 🟡 MEDIUM — 2 Issues

---

#### [M1] Fully-Qualified `[Microsoft.AspNetCore.Mvc.FromQuery]` — Readability

**File:** `backend/src/SiesaAgents.API/Endpoints/ContactoEndpoints.cs:13`

**Problem:**
```csharp
[Microsoft.AspNetCore.Mvc.FromQuery] Guid? clienteId,
```
All other endpoint files in the project use short attribute names. This endpoint file already uses `using FluentValidation;` and other usings. A `using Microsoft.AspNetCore.Mvc;` statement would allow `[FromQuery]` directly, consistent with the rest of the codebase.

**Fix:** Add `using Microsoft.AspNetCore.Mvc;` and use `[FromQuery]` without full namespace.

---

#### [M2] Orphaned Unused File: `ContactosSplitLayout.tsx`

**File:** `frontend/src/modules/crm/contactos/presentation/ContactosSplitLayout.tsx`

**Problem:** This file was created during the split-layout exploration in a prior session and is never imported or used anywhere in the codebase. It exists only as an untracked file in git. Dead files create noise in the codebase and can confuse future developers.

**Fix:** Delete the file.

---

### 🔵 LOW — 2 Issues

---

#### [L1] Dead Code: `emptyMessage` Prop on `<Table>` Never Rendered

**File:** `frontend/src/modules/crm/clientes/presentation/AssociatedContactsSection.tsx:38-50`

**Problem:** The component returns early when `contactos.length === 0`:

```tsx
if (contactos.length === 0) {
  return <p className="text-sm text-slate-500">Sin contactos asociados aún.</p>
}
// later...
<Table emptyMessage="Sin contactos asociados aún." />  // ← never reached with empty data
```

The `emptyMessage` prop on `<Table>` is dead code — it will never be rendered because the empty check happens before the `Table` render. This creates a misleading duplicate empty message that could confuse future maintainers about which is the canonical empty state.

**Fix:** Remove the `emptyMessage` prop from the `<Table>` usage.

---

#### [L2] Missing Unit Test for `GetContactosQueryHandler` Filtering Branch

**File:** `backend/src/SiesaAgents.Application/Contactos/Queries/GetContactosQueryHandler.cs:9-17`

**Problem:** The handler now has branching logic:
```csharp
IEnumerable<ContactoEntity> contactos = query.ClienteId.HasValue
    ? await repository.GetByClienteIdAsync(query.ClienteId.Value, ct)
    : await repository.GetAllAsync(ct);
```
The `ClienteId.HasValue == true` branch is only covered by integration tests. No unit test in `SiesaAgents.UnitTests` verifies that the handler calls `GetByClienteIdAsync` (not `GetAllAsync`) when `ClienteId` is provided, and passes the correct value.

**Fix:** Add a unit test `GetContactosQueryHandler_WithClienteId_CallsGetByClienteIdAsync` that mocks the repository and asserts `GetByClienteIdAsync` is called with the expected ID.

---

## Summary

| Severity | Count | Issues |
|---|---|---|
| 🔴 HIGH | 2 | H1: Integration test FK violation, H2: 12 broken ContactoListView tests |
| 🟡 MEDIUM | 2 | M1: Fully-qualified FromQuery attribute, M2: Orphaned file |
| 🔵 LOW | 2 | L1: Dead emptyMessage prop, L2: Missing unit test for handler branch |
| **Total** | **6** | |
