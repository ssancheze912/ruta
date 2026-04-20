---
workflow: quality-process
phase: planeacion
version: 1.0.0
methodology: BMAD V6.0 MegaPrompt
generated_date: 2026-03-25T12:00:00Z
project_name: Siesa-Agents
input_documents:
  epics:
    - _bmad-output/planning-artifacts/epics/epic-01-foundation.md
    - _bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md
    - _bmad-output/planning-artifacts/epics/epic-03-gestion-de-contactos.md
    - _bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md
  prd:
    - _bmad-output/planning-artifacts/prd/executive-summary.md
    - _bmad-output/planning-artifacts/prd/functional-requirements.md
technology_stack: _bmad/bmm/workflows/3-solutioning/create-architecture/data/company-standards/technology-stack.md
---

# Diseño de Pruebas BMAD V6.0 — Siesa-Agents (Documento Maestro)

**Proyecto:** Siesa-Agents
**Metodología:** BMAD V6.0 MegaPrompt — Principal QA Architect
**Fecha de Generación:** 2026-03-25
**Features analizados:** 4 (F1 Navegación, F2 Clientes, F3 Contactos, F4 Asociación)
**Total de casos de prueba:** 135

---

> **Nota de navegación:** Este documento maestro contiene las 5 fases del diseño de pruebas en un solo archivo.
> Los documentos individuales por fase están disponibles en la misma carpeta para consulta granular:
> - `test-design-phase1-gatekeeper.md`
> - `test-design-phase2-fac.md`
> - `test-design-phase3-blind-spots.md`
> - `test-design-phase4-test-matrix.md`
> - `test-design-phase5-tsr.md`

---

## I. REPORTE DEL GATEKEEPER (GRANULAR)

| ID Historia | Nombre / Feature | Clasificación | Justificación / Explicación de Ruido Técnico |
| :--- | :--- | :--- | :--- |
| E1-S1.1 | Project Initialization & Repository Structure | ⛔ Ruido Técnico | Configura entorno de desarrollo (Vite, .NET 10, CORS). No representa capacidad de negocio validable. Infraestructura de arranque invisible para el usuario. |
| E1-S1.2 | Frontend Navigation Shell | ✅ Lógica de Negocio | Habilita navegación entre Clientes y Contactos (FR28, FR29, FR30). Capacidad funcional directamente percibida por el usuario. |
| E1-S1.3 | Backend Database Foundation | ⛔ Ruido Técnico | Configura PostgreSQL, migraciones EF Core vacías, snake_case. Infraestructura de datos sin lógica de negocio testeable. |
| E2-S2.1 | Client List & Search | ✅ Lógica de Negocio | Lista y búsqueda de clientes. FR2, FR3, FR4, NFR1. |
| E2-S2.2 | Client Detail View | ✅ Lógica de Negocio | Detalle completo de cliente y deep linking. FR5, FR30. |
| E2-S2.3 | Create Client | ✅ Lógica de Negocio | Registro con validación de campos y unicidad NIT/RUC. FR1, FR8. |
| E2-S2.4 | Edit Client | ✅ Lógica de Negocio | Modificación con validación y respuesta inmediata. FR6, FR8, FR27. |
| E2-S2.5 | Delete Client | ✅ Lógica de Negocio | Eliminación con gestión de contactos huérfanos. FR7, FR25, FR27. Lógica de cascada crítica. |
| E3-S3.1 | Contact List & Search | ✅ Lógica de Negocio | Lista y búsqueda de contactos. FR10, FR11, FR12, NFR1. |
| E3-S3.2 | Contact Detail View | ✅ Lógica de Negocio | Detalle de contacto con deep linking. FR13, FR30. |
| E3-S3.3 | Create Contact | ✅ Lógica de Negocio | Registro con validación. FR9, FR16. |
| E3-S3.4 | Edit Contact | ✅ Lógica de Negocio | Modificación con validación. FR14, FR16, FR27. |
| E3-S3.5 | Delete Contact | ✅ Lógica de Negocio | Eliminación con confirmación. FR15, FR27. |
| E4-S4.1 | View Associated Contacts in Client Detail | ✅ Lógica de Negocio | ContactManager cliente→contactos. FR21. |
| E4-S4.2 | Associate & Disassociate Contacts from Client | ✅ Lógica de Negocio | Gestión bidireccional de asociaciones. FR17–FR20, FR27. |
| E4-S4.3 | Navigate from Client Detail to Contact Detail | ✅ Lógica de Negocio | Navegación contextual ≤ 2 clics. FR22, NFR8. |
| E4-S4.4 | View Associated Client from Contact Detail | ✅ Lógica de Negocio | Visibilidad inversa Contacto→Cliente. FR23, FR24, NFR9. |
| E4-S4.5 | Orphan Contacts Filter | ✅ Lógica de Negocio | Filtro calidad de datos. FR25. |
| E4-S4.6 | Reassign Contact to Different Client | ✅ Lógica de Negocio | Reasignación con invalidación de caché. FR26, FR27. |

**Features Lógicos:** 4 | **Historias Negocio:** 17 | **Ruido Técnico:** 2

---

## II. DEFINICIÓN DE FEATURES Y CRITERIOS MAESTROS (FAC) EN GHERKIN

> **Ver detalle completo:** `test-design-phase2-fac.md`

### Feature F1 — Navegación y Shell de Aplicación
- **Historias:** E1-S1.2 | **FRs:** FR28, FR29, FR30
- **FAC clave:** NavigationRail en desktop; NavigationBar en móvil; SPA sin recargas; deep linking /clientes y /contactos; 404 para rutas desconocidas; nav < 500ms; tap targets ≥ 44px.
- **Dependencias:** TanStack Router, siesa-ui-kit, Vite SPA

### Feature F2 — Gestión de Clientes
- **Historias:** E2-S2.1–2.5 | **FRs:** FR1–FR8, FR27, FR30
- **FAC clave:** Lista scrollable con Nombre/NIT/RUC; búsqueda dual en tiempo real < 1s/500 registros; EmptyState y ErrorPanel; deep link detalle; CRUD con validación inline; NIT/RUC único; contactos huérfanos al eliminar; errores sin stack trace.
- **Dependencias:** REST CRUD /api/v1/clientes; TanStack Query; React Hook Form + Zod; FluentValidation

### Feature F3 — Gestión de Contactos
- **Historias:** E3-S3.1–3.5 | **FRs:** FR9–FR16, FR27, FR30
- **FAC clave:** Lista con Nombre/Cargo/Email; búsqueda por nombre y email < 1s/1000 registros; CRUD con validación; formato de email válido obligatorio; errores sin stack trace.
- **Dependencias:** REST CRUD /api/v1/contactos; TanStack Query; React Hook Form + Zod

### Feature F4 — Asociación Cliente-Contacto & Calidad de Datos
- **Historias:** E4-S4.1–4.6 | **FRs:** FR17–FR27
- **FAC clave:** ContactManager via GET /contactos?clienteId; asociar/desasociar via PUT /contactos/:id/cliente; auto-asociar al crear desde ContactManager; navegación bidireccional; "Sin cliente asignado"; filtro huérfanos; reasignación con 3 queryKeys invalidados; cambios inmediatos FR27.
- **Dependencias:** PUT /api/v1/contactos/:id/cliente; ContactManager siesa-ui-kit; TanStack Query invalidateQueries

---

## III. PUNTOS CIEGOS DETECTADOS POR FEATURE

> **Ver análisis completo:** `test-design-phase3-blind-spots.md`

### F1 — Navegación
- 🙈 Rapid navigation clicks → estado UI inconsistente
- 😈 XSS en URL query params
- 🔌 Back/forward history stack con TanStack Router
- 🔥 Service worker sirve bundle desactualizado
- 📱 iOS Safari back gesture sale de la SPA

### F2 — Clientes
- 🙈 Campos con espacios en blanco pasan `.length > 0` sin `.trim()`
- 🙈 Doble clic en "Guardar" → clientes duplicados
- 😈 XSS stored en campo Nombre
- 😈 SQL injection en NIT/RUC
- 🔌 HTTP 409 no mapeado correctamente a mensaje de usuario
- 🔥 Pérdida de red durante submit → cliente creado en BE pero no confirmado en FE → duplicado en reintento
- 🔍 Sin historial de auditoría de cambios en clientes
- 📊 Wildcards SQL en búsqueda (%, _, \)

### F3 — Contactos
- 🙈 Email con formato inválido aceptado por regex permisivo
- 🙈 Búsqueda case-sensitive puede no encontrar contactos
- 😈 XSS en campo Email
- 🔥 1,000 contactos sin virtualización → lag en móvil de gama baja
- 🔍 Sin historial de modificaciones de contactos

### F4 — Asociación
- 🙈 Asociar mismo contacto dos veces (idempotencia)
- 😈 IDOR: PUT /contactos/:id/cliente accesible sin auth
- 🔌 Race condition: dos usuarios asocian mismo contacto simultáneamente
- 🔌 3 queryKeys deben invalidarse (riesgo de faltante)
- 🔥 Network timeout durante PUT → estado inconsistente UI/BD
- 📊 Selector de reasignación con 500 clientes sin búsqueda/paginación
- 🔍 Sin historial de reasignaciones de contactos

---

## IV. MATRIZ INTEGRAL DE PRUEBAS (DISEÑO 360°)

> **Ver tabla completa (135 casos):** `test-design-phase4-test-matrix.md`

**Resumen de casos por feature:**

| Feature | Total | P0 | P1 | P2 | P3 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F1 — Navegación | 15 | 0 | 5 | 6 | 4 |
| F2 — Clientes | 40 | 10 | 17 | 7 | 6 |
| F3 — Contactos | 35 | 10 | 12 | 8 | 5 |
| F4 — Asociación | 45 | 14 | 22 | 8 | 1 |
| **TOTAL** | **135** | **34** | **56** | **33** | **12** |

---

## V. INFORME TSR (TEST SUMMARY REPORT)

> **Ver informe completo + Trazabilidad:** `test-design-phase5-tsr.md`

### Métricas de Diseño

| Métrica | Valor |
| :--- | :--- |
| Features Lógicos | 4 |
| Historias Lógica de Negocio | 17 / 19 |
| Historias de Ruido Técnico | 2 |
| **Casos de prueba totales** | **135** |
| Casos P0 Críticos | 34 |
| Casos P1 Alto | 56 |
| Casos P2 Medio | 33 |
| Casos P3 Bajo | 12 |
| **Cobertura de riesgos críticos** | **100% (34/34)** |

### Top 5 Riesgos Críticos

| Riesgo | Feature | Score |
| :--- | :--- | :--- |
| Race condition asociación concurrente (TC-F4-038) | F4 | 5×4=20 |
| IDOR clienteId sin validación (TC-F4-044) | F4 | 5×4=20 |
| Eliminación cliente sin huérfanos correctos (TC-F2-031) | F2 | 5×4=20 |
| Reasignación no actualiza ContactManagers (TC-F4-028–031) | F4 | 5×4=20 |
| Campos solo espacios pasan validación (TC-F2-037, TC-F3-034) | F2, F3 | 4×4=16 |

### Recomendaciones

1. Ejecutar los 34 P0 antes de cualquier demo o entrega.
2. Automatizar con Playwright los P0/P1 de F2 y F3 (CRUD + validaciones).
3. Ejecutar manualmente los casos de seguridad (XSS, SQL injection, IDOR) y race conditions.
4. Preparar test data fixtures: 500 clientes, 1,000 contactos, cliente con 100+ contactos.
5. Documentar como riesgo aceptado el IDOR (TC-F4-044) hasta implementar autenticación.
6. Agregar al backlog: historia técnica de audit log de asociaciones cliente-contacto.
