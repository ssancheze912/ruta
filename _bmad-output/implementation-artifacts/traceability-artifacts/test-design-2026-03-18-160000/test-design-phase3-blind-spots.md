---
workflow: traceability-and-testing
version: 1.0.0
methodology: BMAD V6.0 MegaPrompt
phase: 3 - Blind Spot Detection by Archetype
generated_date: 2026-03-18T16:00:00Z
project_name: Siesa-Agents
features_analyzed: 4
total_risks_detected: 31
---

# FASE 3: DETECCIÓN DE PUNTOS CIEGOS POR FEATURE

**Project:** Siesa-Agents
**Methodology:** BMAD V6.0 — Phase 3 of 5
**Generated:** 2026-03-18

---

## III. PUNTOS CIEGOS DETECTADOS POR FEATURE

---

### Feature F1 — Application Shell & Navigation

| Arquetipo | Riesgo Detectado | Consecuencia para el Negocio |
| :--- | :--- | :--- |
| **Usuario Inexperto** | User types a URL with extra slashes or trailing spaces (`/clientes/`) expecting the app to handle it gracefully | App crash or blank screen erodes trust on first use |
| **Usuario Inexperto** | User expects browser forward button to work after navigating back — broken forward history | Confusing UX, user feels lost in SPA navigation |
| **Entorno Hostil** | Viewport width exactly at breakpoint boundary (1024px) — ambiguous Rail vs Bar decision | Navigation becomes unusable at exact breakpoint, affecting users who split-screen |
| **Usuario Inexperto** | Slow device renders navigation items but they are unclickable until JS hydrates | User clicks appear to do nothing, they abandon the session |
| **Perfil de Integración** | TanStack Router fails silently if route tree is not regenerated after adding new routes | Navigation to new routes returns 404, blocking feature adoption |
| **Auditor de Procesos** | Deep link access is not logged — impossible to audit who accessed which client/contact directly | Compliance gap if audit trail is required for data access |

---

### Feature F2 — Client Management CRUD

| Arquetipo | Riesgo Detectado | Consecuencia para el Negocio |
| :--- | :--- | :--- |
| **Usuario Inexperto** | User leaves NIT/RUC field with only spaces — whitespace passes client-side validation but fails server-side | Confusing server error without clear guidance |
| **Usuario Malintencionado** | NIT/RUC field accepts `'; DROP TABLE clientes; --` — SQL injection attempt | Data loss or table corruption if backend does not sanitize (NFR5) |
| **Usuario Malintencionado** | Nombre field accepts `<script>alert('xss')</script>` — XSS injection | Stored XSS could compromise all users who view the client list |
| **Usuario Inexperto** | Two users create a client with the same NIT/RUC at exactly the same second (race condition) | Duplicate records in the database violating business rules |
| **Perfil de Integración** | TanStack Query cache not invalidated correctly after client deletion — stale client appears in list | User sees ghost records, attempts to click lead to 404 |
| **Entorno Hostil** | User deletes a client while in an area with intermittent connectivity — deletion confirmed in UI but backend never received the call | Ghost deletion: UI shows client removed but record persists in DB |
| **Auditor de Procesos** | Delete confirmation dialog dismissed by pressing Escape key — is the record preserved? | Unintended deletions if Escape does not map to "Cancelar" |
| **Usuario Inexperto** | User edits a client that another user deleted simultaneously — edit is applied to a non-existent record | 404 or unexpected error with no user-friendly message |
| **Perfil de Integración** | Nombre with 256 characters (1 over limit) — truncated silently vs rejected with error | Data integrity issue — what's stored differs from what was entered |

---

### Feature F3 — Contact Management CRUD

| Arquetipo | Riesgo Detectado | Consecuencia para el Negocio |
| :--- | :--- | :--- |
| **Usuario Inexperto** | User enters email `juan@` (partial email with @) — browser autocomplete suggests it as valid | Invalid email stored, all communication to this contact will fail |
| **Usuario Malintencionado** | Email field with `test@domain.com'; DELETE FROM contactos; --` | SQL injection through email field — data loss |
| **Usuario Inexperto** | Phone number field accepts alphabetic characters — no format validation | Garbage data stored as phone number, unusable for dialing |
| **Entorno Hostil** | Contact created while backend is slow — user clicks "Guardar" multiple times — duplicate contacts created | Duplicate records pollute the contact list |
| **Perfil de Integración** | Contact detail viewed via deep link before the contact list query is cached — inconsistent data display | User sees stale or empty contact detail from a direct URL |
| **Usuario de Consulta** | Search by email is case-sensitive in PostgreSQL — user searches `Juan@empresa.com` but contact was stored as `juan@empresa.com` | Contact is "invisible" to search, user thinks it does not exist |
| **Auditor de Procesos** | No confirmation dialog before deleting a contact that is associated with a client — orphan rule is applied silently | User accidentally deletes an important contact without realizing the cascading effect |

---

### Feature F4 — Client-Contact Association & Data Quality

| Arquetipo | Riesgo Detectado | Consecuencia para el Negocio |
| :--- | :--- | :--- |
| **Usuario Inexperto** | User attempts to associate a contact that is already associated with the same client — no idempotency error shown | Duplicate association attempt results in confusing UI feedback |
| **Usuario Malintencionado** | User manually crafts a PUT request to `PUT /api/v1/contactos/{id}/cliente` with a non-existent clienteId | Backend stores invalid foreign key, breaking referential integrity |
| **Perfil de Integración** | TanStack Query invalidates `['contactos']` but NOT `['contactos', { clienteId }]` after disassociation — stale ContactManager | Previous client still shows the contact in its ContactManager even after disassociation |
| **Entorno Hostil** | Two users simultaneously associate different contacts to the same client — last-write-wins without conflict notification | One user's association is silently overwritten |
| **Usuario Inexperto** | User navigates from Client A → Contact X → Contact X's associated client (Client B) in 2 clicks — expects the client detail, but the back button history is broken | Navigation chain becomes confusing; back button loops unexpectedly |
| **Usuario de Consulta** | Orphan filter count shows stale data after a contact is reassigned — count not refreshed by TanStack Query | User sees incorrect orphan count, makes wrong data quality decisions |
| **Auditor de Procesos** | No audit log of association/disassociation/reassignment events — who linked contact X to client Y at what time? | Impossible to trace who made relationship changes; compliance risk |
| **Usuario Inexperto** | "Sin cliente" filter active and user creates a new contact from the ContactManager — new contact auto-assigned but filter still shows it as orphan | Filter count is inconsistent immediately after creation |
| **Perfil de Integración** | Reassignment PUT sends `{ clienteId: newId }` but only invalidates the new client's queryKey — previous client's ContactManager remains stale | Previous client still shows the contact even after reassignment |
| **Entorno Hostil** | Client is deleted while another user has its ContactManager open and is about to associate a contact — the association PUT is sent with a deleted clienteId | Server returns 404/409 but UI shows no error message to the user |
