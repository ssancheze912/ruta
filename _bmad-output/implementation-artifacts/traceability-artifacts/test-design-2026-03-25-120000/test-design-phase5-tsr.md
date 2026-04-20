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

# Fase 5 — Informe TSR (Test Summary Report) & Trazabilidad

## V. INFORME TSR (TEST SUMMARY REPORT)

---

### 1. Métricas de Diseño

| Métrica | Valor |
| :--- | :--- |
| Épicas analizadas | 4 |
| Historias de usuario totales | 19 |
| Historias de Ruido Técnico (excluidas) | 2 (E1-S1.1, E1-S1.3) |
| Historias de Lógica de Negocio | 17 |
| **Features Lógicos identificados** | **4** |
| FRs cubiertos | 30 (FR1–FR30) |
| NFRs cubiertos | NFR1, NFR2, NFR5, NFR6, NFR8, NFR9, NFR10, NFR11 |
| **Casos de prueba totales diseñados** | **135** |
| Técnicas de diseño aplicadas | Partición de Equivalencia, Valores Límite, Tabla de Decisión, Transición de Estados, Caso de Uso, Caso de Borde (Edge Cases) |
| Niveles de prueba cubiertos | FE, BE, BE+FE |

---

### 2. Distribución por Prioridad

| Prioridad | Criterio de Riesgo | Cantidad | % del Total |
| :--- | :--- | :--- | :--- |
| **P0 — Crítico** | Riesgo 16–25 (Impacto × Probabilidad) | **34** | 25.2% |
| **P1 — Alto** | Riesgo 10–15 | **56** | 41.5% |
| **P2 — Medio** | Riesgo 5–9 | **33** | 24.4% |
| **P3 — Bajo** | Riesgo 1–4 | **12** | 8.9% |
| **Total** | | **135** | **100%** |

---

### 3. Distribución por Feature

| Feature | Casos Totales | P0 | P1 | P2 | P3 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F1 — Navegación y Shell | 15 | 0 | 5 | 6 | 4 |
| F2 — Gestión de Clientes | 40 | 10 | 17 | 7 | 6 |
| F3 — Gestión de Contactos | 35 | 10 | 12 | 8 | 5 |
| F4 — Asociación & Calidad | 45 | 14 | 22 | 8 | 1 |
| **TOTAL** | **135** | **34** | **56** | **33** | **12** |

---

### 4. Prioridad Crítica (P0) — 34 Casos

| ID Caso | Feature | Escenario |
| :--- | :--- | :--- |
| TC-F2-012 | F2 | Formulario de creación con 4 campos requeridos |
| TC-F2-013 | F2 | Creación de cliente válido aparece inmediatamente |
| TC-F2-015 | F2 | Campo Nombre vacío → error inline, sin envío |
| TC-F2-016 | F2 | Campo NIT/RUC vacío → error inline, sin envío |
| TC-F2-017 | F2 | Campo Teléfono vacío → error inline, sin envío |
| TC-F2-018 | F2 | Campo Ciudad vacío → error inline, sin envío |
| TC-F2-022 | F2 | Guardar edición → refleja cambio inmediato |
| TC-F2-024 | F2 | Borrar campo requerido en edición → error inline |
| TC-F2-031 | F2 | Eliminar cliente → contactos pasan a huérfanos |
| TC-F2-037 | F2 | Campos con solo espacios son rechazados |
| TC-F3-012 | F3 | Formulario de creación de contacto con 4 campos |
| TC-F3-013 | F3 | Creación de contacto válido aparece inmediatamente |
| TC-F3-015 | F3 | Campo Nombre vacío en contacto → error inline |
| TC-F3-016 | F3 | Campo Cargo vacío → error inline |
| TC-F3-017 | F3 | Campo Teléfono vacío en contacto → error inline |
| TC-F3-018 | F3 | Campo Email vacío → error inline |
| TC-F3-021 | F3 | Guardar edición de contacto → refleja cambio inmediato |
| TC-F3-023 | F3 | Borrar campo requerido en edición de contacto |
| TC-F3-030 | F3 | Email con formato inválido es rechazado |
| TC-F3-034 | F3 | Campos con solo espacios en contacto rechazados |
| TC-F4-005 | F4 | Asociar contacto → ContactManager actualizado inmediatamente |
| TC-F4-007 | F4 | Asociación reflejada para todos los usuarios (FR27) |
| TC-F4-010 | F4 | Desasociar contacto → removido del ContactManager inmediatamente |
| TC-F4-014 | F4 | Clic en contacto del ContactManager → navega a detalle |
| TC-F4-017 | F4 | Nombre del cliente asociado visible en detalle del contacto |
| TC-F4-018 | F4 | Clic en nombre del cliente → navega a detalle del cliente |
| TC-F4-019 | F4 | Contacto sin cliente → "Sin cliente asignado" |
| TC-F4-021 | F4 | Filtro "Sin cliente" muestra solo contactos huérfanos |
| TC-F4-026 | F4 | Acción de reasignación muestra selector de clientes |
| TC-F4-028 | F4 | Confirmar reasignación mueve el contacto al nuevo cliente |
| TC-F4-030 | F4 | Contacto visible en ContactManager del nuevo cliente |
| TC-F4-031 | F4 | Contacto removido del ContactManager del cliente anterior |
| TC-F4-038 | F4 | Race condition: dos usuarios asocian mismo contacto simultáneamente |
| TC-F4-044 | F4 | IDOR: clienteId inexistente manejado por backend |

---

### 5. Riesgos Críticos Detectados (P0 — Riesgo > 15)

Los siguientes riesgos presentan impacto y probabilidad máximos y deben ser priorizados en la planificación del sprint de ejecución de pruebas:

| # | Riesgo | Feature | Puntuación | Consecuencia si no se mitiga |
| :--- | :--- | :--- | :--- | :--- |
| R-01 | Formulario de cliente/contacto permite envío con campos de solo espacios en blanco | F2, F3 | 4×4=16 | Registros con datos vacíos/inválidos en producción; corrupción de calidad de datos |
| R-02 | Validación de todos los campos requeridos no bloquea el submit | F2, F3 | 4×4=16 | Entidades incompletas creadas; errores en downstream (notificaciones, reportes) |
| R-03 | Operaciones CRUD (crear/editar) no reflejan cambios inmediatamente | F2, F3, F4 | 5×4=20 | Usuarios creen que la operación falló; duplicados por reintentos; pérdida de confianza en el sistema |
| R-04 | Eliminación de cliente no convierte correctamente los contactos asociados en huérfanos | F2, F4 | 5×4=20 | Contactos "fantasma" con referencias a cliente eliminado; FK violations; corrupción de datos |
| R-05 | Filtro "Sin cliente" no aplica correctamente el filtro clienteId=null | F4 | 4×4=16 | Imposibilidad de gestionar calidad de datos; contactos huérfanos invisibles para el operador |
| R-06 | Race condition en asociación concurrente del mismo contacto | F4 | 5×4=20 | Estado corrupto en BD; asignaciones incorrectas silenciosas; pérdida de integridad referencial |
| R-07 | IDOR en PUT /contactos/{id}/cliente sin validación de clienteId | F4 | 5×4=20 | Cualquier usuario puede reasignar cualquier contacto arbitrariamente; violación de integridad de datos |
| R-08 | Reasignación de contacto no actualiza ambos ContactManagers inmediatamente | F4 | 5×4=20 | Listas inconsistentes entre clientes; usuario puede creer que la reasignación falló |
| R-09 | Validación de formato de email muy permisiva | F3 | 4×4=16 | Emails inválidos almacenados; comunicaciones fallidas; datos de contacto inutilizables |
| R-10 | Navegación ContactManager→detalle contacto requiere más de 2 clics | F4 | 4×4=16 | Violación del NFR8; experiencia de usuario degradada; propuesta de valor central del producto comprometida |

---

### 6. Cobertura P0

| Métrica de Cobertura | Valor |
| :--- | :--- |
| Total de riesgos críticos identificados (P0) | 34 |
| Casos de prueba P0 diseñados para cubrir esos riesgos | 34 |
| **Cobertura de riesgos críticos** | **100% (34/34)** |

---

### 7. Tablas de Cobertura Específicas

#### 7.1 Cobertura por Feature

| Feature | FRs Cubiertos | Casos Diseñados | Cobertura de ACs Epic |
| :--- | :--- | :--- | :--- |
| F1 — Navegación y Shell | FR28, FR29, FR30 | 15 | AC-E1.1 ✅ AC-E1.2 ✅ AC-E1.3 ✅ |
| F2 — Gestión de Clientes | FR1–FR8, FR27, FR30 | 40 | AC-E2.1 ✅ AC-E2.2 ✅ AC-E2.3 ✅ AC-E2.4 ✅ AC-E2.5 ✅ |
| F3 — Gestión de Contactos | FR9–FR16, FR27, FR30 | 35 | AC-E3.1 ✅ AC-E3.2 ✅ AC-E3.3 ✅ AC-E3.4 ✅ AC-E3.5 ✅ |
| F4 — Asociación & Calidad | FR17–FR27 | 45 | AC-E4.1 ✅ AC-E4.2 ✅ AC-E4.3 ✅ AC-E4.4 ✅ AC-E4.5 ✅ AC-E4.6 ✅ AC-E4.7 ✅ |

#### 7.2 Cobertura de Seguridad

| Tipo de Vulnerabilidad | Cases que lo cubren | Estado |
| :--- | :--- | :--- |
| XSS — Stored (campos Nombre, Email) | TC-F2-039, TC-F3-033 | ✅ Cubierto |
| SQL Injection (NIT/RUC, campos de búsqueda) | TC-F2-038 | ✅ Cubierto |
| IDOR (clienteId inventado en PUT) | TC-F4-044 | ✅ Cubierto |
| URL Parameter XSS | TC-F1-012 | ✅ Cubierto |
| Error exposure (stack traces) | TC-F2-006, TC-F2-020, TC-F3-006, TC-F3-019 | ✅ Cubierto |
| Input sanitization (espacios) | TC-F2-037, TC-F3-034 | ✅ Cubierto |
| CSRF | ⚠️ Sin autenticación en MVP — no aplica por ahora, revisar en siguiente fase | ⚠️ N/A MVP |
| Auth bypass | ⚠️ MVP sin autenticación — todos los endpoints son públicos por diseño | ⚠️ N/A MVP |

#### 7.3 Cobertura de Performance

| Requerimiento de Performance | NFR | Case que lo valida | Umbral |
| :--- | :--- | :--- | :--- |
| Búsqueda de clientes con 500 registros | NFR1 | TC-F2-004 | < 1000ms |
| Búsqueda de contactos con 1,000 registros | NFR1 | TC-F3-004 | < 1000ms |
| Operaciones CRUD reflejan cambio en UI | NFR2 | TC-F2-013, TC-F2-022, TC-F3-013, TC-F3-021 | < 2000ms |
| Navegación SPA entre secciones | NFR (implícito) | TC-F1-009 | < 500ms |
| ContactManager con 100+ contactos | Identificado como blind spot | TC-F4-039 | < 2000ms render + 30FPS scroll |

#### 7.4 Cobertura de Integraciones (API)

| Endpoint | Método | Cases que lo validan |
| :--- | :--- | :--- |
| /api/v1/clientes | GET | TC-F2-001, TC-F2-004, TC-F2-010 |
| /api/v1/clientes | POST | TC-F2-013, TC-F2-015–018, TC-F2-019, TC-F2-040 |
| /api/v1/clientes/:id | GET | TC-F2-010, TC-F2-011 |
| /api/v1/clientes/:id | PUT | TC-F2-022, TC-F2-024 |
| /api/v1/clientes/:id | DELETE | TC-F2-027, TC-F2-031, TC-F2-033 |
| /api/v1/contactos | GET | TC-F3-001, TC-F3-004, TC-F4-002 |
| /api/v1/contactos?clienteId=:id | GET | TC-F4-002, TC-F4-025 |
| /api/v1/contactos?clienteId=null | GET | TC-F4-025 |
| /api/v1/contactos | POST | TC-F3-013, TC-F4-009 |
| /api/v1/contactos/:id | GET | TC-F3-010, TC-F3-011 |
| /api/v1/contactos/:id | PUT | TC-F3-021, TC-F3-023 |
| /api/v1/contactos/:id | DELETE | TC-F3-026, TC-F3-029 |
| /api/v1/contactos/:id/cliente | PUT (associate) | TC-F4-005, TC-F4-006, TC-F4-009 |
| /api/v1/contactos/:id/cliente | PUT (null) | TC-F4-010, TC-F4-011 |
| /api/v1/contactos/:id/cliente | PUT (reassign) | TC-F4-028, TC-F4-029, TC-F4-035, TC-F4-044 |

#### 7.5 Cobertura de Calidad de Datos

| Aspecto de Calidad | Cobertura |
| :--- | :--- |
| Unicidad de NIT/RUC | TC-F2-019 ✅ |
| Validación de formato de email | TC-F3-030 ✅ |
| Integridad referencial al eliminar cliente | TC-F2-031, TC-F2-033, TC-F2-034 ✅ |
| Detección de contactos huérfanos | TC-F4-021, TC-F4-022, TC-F4-023 ✅ |
| Reasignación de contactos entre clientes | TC-F4-026–F4-034 ✅ |
| Idempotencia de asociaciones | TC-F4-035, TC-F4-036 ✅ |
| Race conditions en asociación concurrente | TC-F4-038 ✅ |

#### 7.6 Cobertura de Navegación y UX

| Capacidad de Navegación | FR | Cases |
| :--- | :--- | :--- |
| SPA sin recargas | FR28 | TC-F1-003, TC-F1-004 ✅ |
| Deep linking a todas las vistas | FR30 | TC-F1-006, TC-F1-007, TC-F2-010, TC-F3-010 ✅ |
| Acceso móvil completo | FR29 | TC-F1-002, TC-F1-010, TC-F1-015 ✅ |
| Navegación cliente→contacto ≤ 2 clics | NFR8 | TC-F4-014, TC-F4-015 ✅ |
| Información cliente en detalle contacto sin navegación extra | NFR9 | TC-F4-017, TC-F4-020 ✅ |
| Navegación bidireccional con Volver | FR22, FR24 | TC-F4-016, TC-F4-018 ✅ |

---

## APÉNDICE: MATRIZ DE TRAZABILIDAD

### Trazabilidad Funcionalidad → Historias → Casos de Prueba

```
F1 — Navegación y Shell de Aplicación
  └── E1-S1.2 — Frontend Navigation Shell
       ├── TC-F1-001: NavigationRail en desktop
       ├── TC-F1-002: NavigationBar en móvil
       ├── TC-F1-003: Navegar a Clientes sin recarga
       ├── TC-F1-004: Navegar a Contactos sin recarga
       ├── TC-F1-005: Item activo resaltado
       ├── TC-F1-006: Deep link /clientes
       ├── TC-F1-007: Deep link /contactos
       ├── TC-F1-008: Ruta desconocida → 404
       ├── TC-F1-009: Performance < 500ms
       ├── TC-F1-010: Tap targets ≥ 44px
       ├── TC-F1-011: [EDGE] Browser back/forward
       ├── TC-F1-012: [EDGE] XSS en URL params
       ├── TC-F1-013: [EDGE] URL malformada
       ├── TC-F1-014: [EDGE] Clics rápidos sucesivos
       └── TC-F1-015: [EDGE] Cambio de orientación móvil

F2 — Gestión de Clientes
  ├── E2-S2.1 — Client List & Search
  │    ├── TC-F2-001: Lista con Nombre y NIT/RUC
  │    ├── TC-F2-002: Búsqueda por Nombre
  │    ├── TC-F2-003: Búsqueda por NIT/RUC
  │    ├── TC-F2-004: Performance búsqueda 500 registros
  │    ├── TC-F2-005: EmptyState
  │    ├── TC-F2-006: ErrorPanel
  │    └── TC-F2-007: Limpiar búsqueda
  ├── E2-S2.2 — Client Detail View
  │    ├── TC-F2-008: Detalle al hacer clic
  │    ├── TC-F2-009: URL deep link
  │    ├── TC-F2-010: Deep link carga cliente correcto
  │    └── TC-F2-011: ID inexistente → not-found
  ├── E2-S2.3 — Create Client
  │    ├── TC-F2-012: Formulario con 4 campos [P0]
  │    ├── TC-F2-013: Creación válida [P0]
  │    ├── TC-F2-014: Toast éxito
  │    ├── TC-F2-015: Validación Nombre [P0]
  │    ├── TC-F2-016: Validación NIT/RUC [P0]
  │    ├── TC-F2-017: Validación Teléfono [P0]
  │    ├── TC-F2-018: Validación Ciudad [P0]
  │    ├── TC-F2-019: NIT/RUC duplicado 409
  │    └── TC-F2-020: Backend 500 graceful
  ├── E2-S2.4 — Edit Client
  │    ├── TC-F2-021: Formulario pre-poblado
  │    ├── TC-F2-022: Guardar cambios [P0]
  │    ├── TC-F2-023: Toast éxito edición
  │    ├── TC-F2-024: Validación campo requerido [P0]
  │    └── TC-F2-025: Cancelar edición
  ├── E2-S2.5 — Delete Client
  │    ├── TC-F2-026: Diálogo de confirmación
  │    ├── TC-F2-027: Confirmar eliminación
  │    ├── TC-F2-028: Panel retorna a vacío
  │    ├── TC-F2-029: Toast éxito eliminación
  │    ├── TC-F2-030: Cancelar eliminación
  │    ├── TC-F2-031: Contactos pasan a huérfanos [P0]
  │    ├── TC-F2-032: Toast huérfanos
  │    ├── TC-F2-033: Huérfanos accesibles en /contactos
  │    └── TC-F2-034: Huérfanos en filtro clienteId=null
  └── Edge Cases F2
       ├── TC-F2-035: [EDGE] NIT/RUC longitud máxima
       ├── TC-F2-036: [EDGE] Caracteres especiales
       ├── TC-F2-037: [EDGE] Solo espacios en campos [P0]
       ├── TC-F2-038: [EDGE] SQL injection
       ├── TC-F2-039: [EDGE] XSS en Nombre
       └── TC-F2-040: [EDGE] Doble clic en guardar

F3 — Gestión de Contactos
  ├── E3-S3.1 — Contact List & Search
  │    ├── TC-F3-001: Lista con Nombre, Cargo, Email
  │    ├── TC-F3-002: Búsqueda por Nombre
  │    ├── TC-F3-003: Búsqueda por Email
  │    ├── TC-F3-004: Performance 1000 registros
  │    ├── TC-F3-005: EmptyState
  │    ├── TC-F3-006: ErrorPanel
  │    └── TC-F3-007: Limpiar búsqueda
  ├── E3-S3.2 — Contact Detail View
  │    ├── TC-F3-008: Detalle al clic
  │    ├── TC-F3-009: URL deep link
  │    ├── TC-F3-010: Deep link carga contacto correcto
  │    └── TC-F3-011: ID inexistente → not-found
  ├── E3-S3.3 — Create Contact
  │    ├── TC-F3-012: Formulario con 4 campos [P0]
  │    ├── TC-F3-013: Creación válida [P0]
  │    ├── TC-F3-014: Toast éxito
  │    ├── TC-F3-015: Validación Nombre [P0]
  │    ├── TC-F3-016: Validación Cargo [P0]
  │    ├── TC-F3-017: Validación Teléfono [P0]
  │    ├── TC-F3-018: Validación Email [P0]
  │    └── TC-F3-019: Error BE graceful
  ├── E3-S3.4 — Edit Contact
  │    ├── TC-F3-020: Formulario pre-poblado
  │    ├── TC-F3-021: Guardar cambios [P0]
  │    ├── TC-F3-022: Toast éxito edición
  │    ├── TC-F3-023: Validación campo requerido [P0]
  │    └── TC-F3-024: Cancelar edición
  ├── E3-S3.5 — Delete Contact
  │    ├── TC-F3-025: Diálogo de confirmación
  │    ├── TC-F3-026: Confirmar eliminación
  │    ├── TC-F3-027: Vista retorna a lista
  │    ├── TC-F3-028: Toast éxito eliminación
  │    └── TC-F3-029: Cancelar eliminación
  └── Edge Cases F3
       ├── TC-F3-030: [EDGE] Email formato inválido [P0]
       ├── TC-F3-031: [EDGE] Campos al límite máximo
       ├── TC-F3-032: [EDGE] Unicode y emojis
       ├── TC-F3-033: [EDGE] XSS en Email
       ├── TC-F3-034: [EDGE] Solo espacios [P0]
       └── TC-F3-035: [EDGE] Cargo muy largo (overflow)

F4 — Asociación Cliente-Contacto & Calidad de Datos
  ├── E4-S4.1 — View Associated Contacts in Client Detail
  │    ├── TC-F4-001: ContactManager con contactos
  │    ├── TC-F4-002: GET /contactos?clienteId usado
  │    ├── TC-F4-003: ContactManager estado vacío
  │    └── TC-F4-004: Error → retry en ContactManager
  ├── E4-S4.2 — Associate & Disassociate Contacts
  │    ├── TC-F4-005: Asociar contacto → ContactManager inmediato [P0]
  │    ├── TC-F4-006: PUT con clienteId correcto
  │    ├── TC-F4-007: Cambio visible para todos [P0]
  │    ├── TC-F4-008: QueryKeys invalidados
  │    ├── TC-F4-009: Crear desde ContactManager → auto-asociado
  │    ├── TC-F4-010: Desasociar → removido inmediato [P0]
  │    ├── TC-F4-011: PUT con clienteId: null
  │    ├── TC-F4-012: Desasociado sigue en /contactos
  │    └── TC-F4-013: QueryKeys invalidados en desasociación
  ├── E4-S4.3 — Navigate Client → Contact
  │    ├── TC-F4-014: Clic en ContactManager → /contactos/:id [P0]
  │    ├── TC-F4-015: Máximo 2 clics cliente → contacto
  │    └── TC-F4-016: Volver desde contacto → cliente
  ├── E4-S4.4 — View Client from Contact Detail
  │    ├── TC-F4-017: Nombre cliente visible en detalle contacto [P0]
  │    ├── TC-F4-018: Clic en cliente → /clientes/:id [P0]
  │    ├── TC-F4-019: Sin cliente → "Sin cliente asignado" [P0]
  │    └── TC-F4-020: Info cliente sin navegación extra
  ├── E4-S4.5 — Orphan Contacts Filter
  │    ├── TC-F4-021: Filtro "Sin cliente" → solo clienteId=null [P0]
  │    ├── TC-F4-022: Conteo visible
  │    ├── TC-F4-023: Todos asignados → estado vacío
  │    ├── TC-F4-024: Desactivar filtro → lista completa
  │    └── TC-F4-025: Backend query con parámetro correcto
  ├── E4-S4.6 — Reassign Contact
  │    ├── TC-F4-026: Selector de clientes visible [P0]
  │    ├── TC-F4-027: Selector con todos los clientes
  │    ├── TC-F4-028: Confirmar reasignación [P0]
  │    ├── TC-F4-029: PUT con nuevo clienteId
  │    ├── TC-F4-030: Contacto en nuevo cliente [P0]
  │    ├── TC-F4-031: Contacto removido del cliente anterior [P0]
  │    ├── TC-F4-032: 3 queryKeys invalidados
  │    ├── TC-F4-033: Toast éxito reasignación
  │    └── TC-F4-034: Cancelar → sin cambios
  └── Edge Cases F4
       ├── TC-F4-035: [EDGE] Asociar al mismo cliente (idempotencia)
       ├── TC-F4-036: [EDGE] Reasignar al mismo cliente
       ├── TC-F4-037: [EDGE] Eliminar cliente con ContactManager activo
       ├── TC-F4-038: [EDGE] Race condition concurrente [P0]
       ├── TC-F4-039: [EDGE] 100+ contactos en ContactManager
       ├── TC-F4-040: [EDGE] Navegar a contacto eliminado
       ├── TC-F4-041: [EDGE] Desasociar último contacto
       ├── TC-F4-042: [EDGE] Selector vacío (sin otros clientes)
       ├── TC-F4-043: [EDGE] Timeout de red en PUT asociación
       ├── TC-F4-044: [EDGE] IDOR en clienteId inexistente [P0]
       └── TC-F4-045: [EDGE] Asociar/desasociar rápido 5x
```

---

### Recomendaciones para la Fase de Ejecución

1. **Prioridad absoluta:** Ejecutar todos los 34 casos P0 antes de aprobar cualquier demo o entrega parcial del sprint.
2. **Automatización:** Los casos P0 y P1 de F2 y F3 (validaciones CRUD) son candidatos inmediatos para automatización con Playwright — alta repeatability y cobertura de regresión.
3. **Ejecución manual primero:** Los casos de seguridad (TC-F2-038, TC-F2-039, TC-F3-033, TC-F1-012), race conditions (TC-F4-038) y pruebas de dispositivo móvil real (TC-F1-015) requieren ejecución manual o entornos especializados.
4. **Test data:** Preparar fixtures de BD con: (a) 500 clientes para NFR1, (b) 1,000 contactos para NFR1, (c) cliente con 100+ contactos para TC-F4-039, (d) contacto con payload XSS para pruebas de seguridad.
5. **Blind spot crítico — auditoría:** Se recomienda agregar al backlog una historia técnica para implementar audit log de asociaciones cliente-contacto antes del paso a producción.
6. **Deuda técnica identificada:** El MVP sin autenticación hace que TC-F4-044 (IDOR) no tenga mitigación completa. Documentar como riesgo aceptado hasta implementación de auth.
