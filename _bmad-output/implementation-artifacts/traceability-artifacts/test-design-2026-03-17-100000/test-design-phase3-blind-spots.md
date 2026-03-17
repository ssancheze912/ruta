---
workflow: traceability-and-testing
version: 1.0.0
methodology: BMAD V6.0 MegaPrompt
generated_date: 2026-03-17
project_name: Siesa-Agents
phase: 3
title: Blind Spots Detected by Feature
input_documents:
  epics: _bmad-output/planning-artifacts/epics/
  prd: _bmad-output/planning-artifacts/archive/prd.md
---

# Phase 3: Blind Spots Detected by Feature

## III. PUNTOS CIEGOS DETECTADOS POR FEATURE

> **Methodology:** Each feature is analyzed through 6 universal archetypes to detect scenarios not covered by happy-path FAC scenarios. These blind spots are then incorporated into the Phase 4 test matrix.

---

## F1 — Application Shell & Navigation

**Stories in scope:** 1.2 (Frontend Navigation Shell)

| # | Archetype | Blind Spot Risk | Severity |
|---|-----------|-----------------|----------|
| BS-F1-01 | **Usuario Inexperto** | User attempts to navigate by typing URLs manually and encounters inconsistent behavior when the URL has trailing slashes (e.g., `/clientes/` vs `/clientes`) — may receive blank screen instead of content | Medium |
| BS-F1-02 | **Usuario Inexperto** | User on mobile rotates device mid-session: NavigationBar to NavigationRail transition may lose active route highlight, confusing the user about which section they are in | Medium |
| BS-F1-03 | **Usuario Malintencionado** | User manually types a deeply nested or malformed URL (e.g., `/clientes/../../../etc`) — the 404 handler may not catch path traversal-style routes, showing unexpected behavior | Low |
| BS-F1-04 | **Perfil de Integración** | When the browser's Back/Forward buttons are used after SPA navigation, the NavigationRail active state may not update to reflect the current route, breaking visual context | High |
| BS-F1-05 | **Entorno Hostil** | On a very slow network, the SPA shell loads but the lazy-loaded section content fails silently — user sees blank content area with no error message | High |
| BS-F1-06 | **Entorno Hostil** | Browser zoom level at 150% or higher causes NavigationRail items to overflow or truncate labels, impeding usability | Medium |
| BS-F1-07 | **Usuario de Consulta/Reportería** | User bookmarks a deep-link URL (e.g., `/clientes/123`) and reopens it in a new tab — the SPA must handle direct deep-link hydration correctly without 404 | High |
| BS-F1-08 | **Auditor de Procesos** | No visual indicator (spinner, skeleton) is shown while navigating between sections on slow connections — the user cannot confirm that navigation was registered | Medium |

---

## F2 — Client Management

**Stories in scope:** 2.1, 2.2, 2.3, 2.4, 2.5

| # | Archetype | Blind Spot Risk | Severity |
|---|-----------|-----------------|----------|
| BS-F2-01 | **Usuario Inexperto** | User types search query with leading/trailing spaces (e.g., `"  ACME  "`) — real-time search may not trim input, returning 0 results even though the client exists | Medium |
| BS-F2-02 | **Usuario Inexperto** | User clicks "Crear Cliente" multiple times rapidly before the first creation completes — system may create duplicate clients if the submit button is not disabled during processing | High |
| BS-F2-03 | **Usuario Inexperto** | User fills in the Create Client form, browser auto-fill overwrites a field with incorrect data (e.g., wrong NIT), and the user submits without noticing — system should validate on submit | Medium |
| BS-F2-04 | **Usuario Malintencionado** | NIT field accepts special characters or SQL-injection-like strings (e.g., `'; DROP TABLE--`) — the UI should accept them as plain text but the backend must sanitize | High |
| BS-F2-05 | **Usuario Malintencionado** | User submits a client name with 10,000 characters — UI may not enforce max-length, causing an unhandled backend error instead of an inline validation message | Medium |
| BS-F2-06 | **Perfil de Integración** | After creating a client, the list is supposed to refresh immediately (FR27) — but if the cache invalidation fails silently, the list shows stale data. The new client appears only after a hard refresh | High |
| BS-F2-07 | **Perfil de Integración** | When editing a client simultaneously from two browser tabs, the second save overwrites the first save without warning — last-write-wins with no concurrency notification | Medium |
| BS-F2-08 | **Entorno Hostil** | User is on an unstable network and the delete confirmation dialog is shown, but the actual DELETE request fails — the dialog closes but the client still appears in the list with no error feedback | High |
| BS-F2-09 | **Entorno Hostil** | The client list loads partially (first page of results) and the network drops — the user sees a truncated list and may assume no more clients exist | Medium |
| BS-F2-10 | **Usuario de Consulta/Reportería** | Search by NIT with partial match (e.g., searching `"123"` should return `"NIT-1234"` and `"NIT-5123"`) — the search algorithm may only support prefix match, missing partial matches | High |
| BS-F2-11 | **Auditor de Procesos** | No confirmation or audit trail is surfaced to the user before deleting a client that has associated contacts — deletion proceeds without warning about orphaned contacts | High |

---

## F3 — Contact Management

**Stories in scope:** 3.1, 3.2, 3.3, 3.4, 3.5

| # | Archetype | Blind Spot Risk | Severity |
|---|-----------|-----------------|----------|
| BS-F3-01 | **Usuario Inexperto** | User searches contacts by email with uppercase letters (e.g., `"JUAN@SIESA.COM"`) — if search is case-sensitive, no results return even though the contact exists | Medium |
| BS-F3-02 | **Usuario Inexperto** | User leaves the phone number field empty during contact creation — if the field is optional (per epic), the form should accept empty; if required, inline validation must trigger immediately on blur | Medium |
| BS-F3-03 | **Usuario Inexperto** | User attempts to enter a phone number with country code prefix and spaces (e.g., `"+57 310 123 4567"`) — system may reject it as invalid format without clear guidance on expected format | Medium |
| BS-F3-04 | **Usuario Malintencionado** | Email field accepts an address with 512 characters — UI may not cap length, and if backend validation fails, the error returned may not be surfaced as a user-friendly message | Medium |
| BS-F3-05 | **Usuario Malintencionado** | User creates a contact with the exact same email as an existing contact — the system should handle this gracefully (allow or reject with a clear message), not produce a generic 500 error | High |
| BS-F3-06 | **Perfil de Integración** | After deleting a contact that is linked to a client, the client's associated contacts list (F4) may still display the deleted contact until the next page load (stale cache) | High |
| BS-F3-07 | **Perfil de Integración** | Contact detail view deep link (e.g., `/contactos/999`) for a non-existent ID must return a 404 page — not a blank screen or unhandled JavaScript error | High |
| BS-F3-08 | **Entorno Hostil** | On slow networks, the contact list displays a loading skeleton — if the API times out, the skeleton persists indefinitely with no timeout error message | Medium |
| BS-F3-09 | **Usuario de Consulta/Reportería** | Contact search across all three fields (name, position, email) simultaneously — a search for `"garcia"` should match contacts where "garcia" appears in any of the three fields | High |
| BS-F3-10 | **Auditor de Procesos** | No visual differentiation between a contact with no client association (orphan) and a contact with a client in the contact list — users cannot tell at a glance which contacts are orphaned | Medium |

---

## F4 — Client-Contact Association & Data Quality

**Stories in scope:** 4.1, 4.2, 4.3, 4.4, 4.5, 4.6

| # | Archetype | Blind Spot Risk | Severity |
|---|-----------|-----------------|----------|
| BS-F4-01 | **Usuario Inexperto** | User opens the associate-contact dialog and searches for a contact by partial name — the search may only match exact full names, returning 0 results and confusing the user | High |
| BS-F4-02 | **Usuario Inexperto** | User attempts to associate a contact that is already associated with the current client — the UI should prevent the duplicate or display an appropriate message, not silently fail or show a technical error | Medium |
| BS-F4-03 | **Usuario Inexperto** | In the reassign dialog, the dropdown shows all clients including the current client — user selects the current client and saves, which is semantically a no-op; the system should either exclude current client or warn | High |
| BS-F4-04 | **Usuario Malintencionado** | User rapidly clicks "Disassociate" for multiple contacts simultaneously — race conditions may cause inconsistent state (some contacts disassociated, others in error) | Medium |
| BS-F4-05 | **Usuario Malintencionado** | User manipulates the URL to navigate to `/contactos/[id]` of a contact linked to a deleted client — the client panel in contact detail must handle the missing client reference gracefully | High |
| BS-F4-06 | **Perfil de Integración** | After reassigning a contact, the original client's associated contacts list must NOT show the reassigned contact — stale query cache may show it until manual refresh | High |
| BS-F4-07 | **Perfil de Integración** | Navigate from client detail to contact detail (F4.3) and then use the browser Back button — the navigation should return to client detail, not to the contacts list root | High |
| BS-F4-08 | **Entorno Hostil** | Orphan filter toggled while search query is active — the combination (orphan filter ON + search text) may return 0 results even though matching orphan contacts exist, if filter and search are not composed correctly | High |
| BS-F4-09 | **Entorno Hostil** | User opens the reassign dialog when the clients list API is unavailable — the dropdown must show an error state, not an empty list that looks like "no other clients exist" | High |
| BS-F4-10 | **Usuario de Consulta/Reportería** | Orphan filter count badge (if any) in the Contactos section must update immediately after a contact is associated to a client — stale badge count misleads the user about data quality | Medium |
| BS-F4-11 | **Auditor de Procesos** | No success confirmation is shown after disassociating a contact from a client — the user may click the button multiple times thinking the action did not register | High |
| BS-F4-12 | **Auditor de Procesos** | No visual distinction between "contact has no client" and "contact's client was deleted" — both appear as orphans, but the root cause is different; audit context matters | Low |

---

## Blind Spots Summary

| Feature | Total Blind Spots | High Severity | Medium Severity | Low Severity |
|---------|-------------------|---------------|-----------------|--------------|
| F1 — Navigation | 8 | 3 | 4 | 1 |
| F2 — Client Mgmt | 11 | 6 | 5 | 0 |
| F3 — Contact Mgmt | 10 | 4 | 6 | 0 |
| F4 — Association | 12 | 8 | 3 | 1 |
| **TOTAL** | **41** | **21** | **18** | **2** |

> **Key Risk Areas:** Concurrency and cache invalidation (F2-06, F3-06, F4-06), deep-link handling (F1-07, F3-07, F4-05), filter composition (F4-08), and missing confirmation feedback (F2-11, F4-11) are the highest-priority blind spots to cover in the Phase 4 test matrix.
