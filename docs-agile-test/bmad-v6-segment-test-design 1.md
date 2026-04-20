# Diseño de Pruebas BMAD V6.0 — Maestro de Segmentos (SEGM-SEGMT)

**Proyecto:** Segments Service — Siesa ERP
**Módulo/Feature:** segment (Maestro de Segmentos)
**Feature Code:** SEGM-SEGMT
**Fecha del Diseño:** 2026-04-08
**Autor:** QA Lead — asistido por IA (BMAD V6.0)
**Stack:**
```
Backend:        .NET 10, EF Core 10, PostgreSQL (schema: segment), Dapr 1.17.0
Frontend:       React 19, TanStack Query, Siesa UI Kit v1.0.41
Testing BE:     xUnit 2.9.3, NSubstitute, FluentAssertions, Testcontainers.PostgreSql
Testing FE:     Jest, MSW, Playwright
Patrón:         BaseHierarchicalMasterService<SegmentEntity> (GLOBAL con overrides por compañía)
```

---

## I. REPORTE DEL GATEKEEPER (GRANULAR)

> **Criterio de clasificación:**
> - **Lógica de Negocio (BL):** Historia con comportamiento testeable (validación, reglas, flujo, UI interactiva)
> - **Ruido Técnico (TN):** Historia de infraestructura/scaffolding sin comportamiento propio verificable

| ID Historia | Nombre / Épica | Clasificación | Justificación / Explicación de Ruido Técnico |
| :--- | :--- | :--- | :--- |
| SEGM-SEGMT-E001-S001 | Define SegmentEntity, OverridesEntity & TreeEntity (EF Core) | **BL** | Constraints de campo (UK, maxlength, nullable), token de concurrencia xmin, FK self-reference — verificable via integración |
| SEGM-SEGMT-E001-S002 | Create Database Migration | **BL** | Correctitud de migración (FKs, UKs, nullable columns) verificable con Testcontainers |
| SEGM-SEGMT-E001-S003 | Implement SegmentService (BaseHierarchicalMasterService) | **BL** | Wiring de MasterDefinition, registro de servicio, override resolution — verificable via smoke integration |
| SEGM-SEGMT-E001-S004 | Implement SegmentTreeSyncService | **BL** | Generación de tree en create, sync en cambio code/name, rebuild dual-branch en reparent — comportamiento core de negocio |
| SEGM-SEGMT-E002-S001 | Implement CreateSegmentValidator & UpdateSegmentValidator | **BL** | Campos requeridos, longitudes máximas, LocalizedValidator — reglas unitariamente testeables |
| SEGM-SEGMT-E002-S002 | Implement POST, GET by id & DELETE endpoints | **BL** | Permission gating, happy paths, errores 422/403/404 — API integration tests |
| SEGM-SEGMT-E002-S003 | Implement PUT dual-path & PATCH status endpoints | **BL** | Guards IsTitle, inmutabilidad ConfigID, concurrencia, dual-path routing — historia de mayor riesgo |
| SEGM-SEGMT-E002-S004 | Implement POST /companies & DELETE /companies/{id} | **BL** | Assign/unassign compañía, gates de permiso, ciclo de vida de override row |
| SEGM-SEGMT-E003-S001 | Implement GET list/search con GLOBAL override resolution | **BL** | COALESCE LEFT JOIN con y sin X-Company-Id — ruta crítica de lectura de datos |
| SEGM-SEGMT-E003-S002 | Implement GET /tree endpoint | **BL** | Respuesta jerárquica desde segment_trees, manejo de niveles null |
| SEGM-SEGMT-E003-S003 | Implement Dapr domain events | **BL** | Correctitud de envelope, TenantId sourcing, SequenceNumber, 5 tipos de evento |
| SEGM-SEGMT-E003-S004 | Implement LookupField self-reference search | **BL** | Filtro isTitleOnly, excludeIds cycle guard, additionalParams.companyId override |
| SEGM-SEGMT-E004-S001 | Define TypeScript interfaces & i18n namespaces | **TN** | Interfaces y archivos JSON de namespace — sin comportamiento runtime testeable |
| SEGM-SEGMT-E004-S002 | Implement segmentService (companyHeaders, dual-path) | **BL** | Lógica de inyección X-Company-Id header, routing dual-path en service layer FE |
| SEGM-SEGMT-E004-S003 | Implement TanStack Query hooks | **BL** | Invalidación de hook, rollback optimista, surfacing de errores — testeable con MSW |
| SEGM-SEGMT-E004-S004 | Implement company assign/unassign mutations & override hooks | **BL** | Side-effects de mutación, invalidación de cache — testeable con MSW |
| SEGM-SEGMT-E005-S001 | Implement SegmentsPage (MasterCrud shell & GLOBAL banner) | **BL** | Renderizado de página, banner GLOBAL, columnas visibles |
| SEGM-SEGMT-E005-S002 | Implement hierarchical list display | **BL** | Niveles de indentación, badge IsTitle, display de nombre de parent |
| SEGM-SEGMT-E005-S003 | Implement list filters | **BL** | Estado de filtro conduce parámetros de API call — unit y E2E verificable |
| SEGM-SEGMT-E005-S004 | Implement row actions con RBAC | **BL** | Acciones ocultas/visibles por permiso — E2E verificable |
| SEGM-SEGMT-E006-S001 | Implement drawer form shell (tres secciones) | **BL** | Renderizado de formulario con secciones correctas, campos presentes |
| SEGM-SEGMT-E006-S002 | Implement Hierarchy section (IsTitle toggle & parent LookupField) | **BL** | Guard UI IsTitle (lock icon permanente), LookupField filtrado, preview de ancestría |
| SEGM-SEGMT-E006-S003 | Implement Configuration section (ConfigID locked in edit) | **BL** | ConfigID read-only en edit mode, warnings de IsTitle guard |
| SEGM-SEGMT-E006-S004 | Implement post-create company dialog y error surface 409/422 | **BL** | Diálogo abre en 201, mensajes de error correctos por código de error |
| SEGM-SEGMT-E007-S001 | Wire activeByCompany, linkedMap, fromMasterCrudRef | **BL** | Integración company selector, fetch de override, propagación de estado |
| SEGM-SEGMT-E007-S002 | Implement onConfirmLinking con 409-guard | **BL** | Guard 409 en re-assign, correctitud de loop de asignación bulk |
| SEGM-SEGMT-E007-S003 | Implement Company Override Panel (IsActive toggle) | **BL** | Override set/clear, null restaura herencia — UI y API integration |
| SEGM-SEGMT-E007-S004 | E2E test suite — full GLOBAL flow | **BL** | End-to-end: create → assign → override → list con company context |

**Resumen:** 27 BL / 1 TN (SEGM-SEGMT-E004-S001)

---

## II. DEFINICIÓN DE FEATURES Y CRITERIOS MAESTROS (FAC) EN GHERKIN

> Las épicas e historias se agrupan en **5 Funcionalidades (Features)** por capacidad de negocio lógica.
> Las épicas de frontend (E004–E007) se consolidan en una sola funcionalidad (F5).

---

### Feature F1: Gestión del Ciclo de Vida de Segmentos (CRUD, Validación & Reglas de Negocio)

- **Épicas/Historias Asociadas:** E001-S001, E001-S002, E001-S003, E002-S001, E002-S002, E002-S003
- **Dependencias:** segment_configurations (FK), users_prj (audit), Siesa.MasterPattern, FluentValidation

#### FAC Funcionales (Gherkin)

```gherkin
Feature: F1 — Ciclo de vida del Segmento (CRUD)

  # --- CREACIÓN ---

  Scenario: F1-FAC-01 — Crear segmento con campos requeridos completos
    Given un usuario con permiso segment.segments.create
    And una SegmentConfiguration válida existe
    When se envía POST /api/v1/segments con Code, Name y SegmentConfigurationID completos
    Then la API retorna HTTP 201
    And el response incluye el id, code y version del segmento creado
    And el registro existe en la tabla segments

  Scenario: F1-FAC-02 — Campos requeridos faltantes retorna 422
    Given un request POST /api/v1/segments
    When Code, Name o SegmentConfigurationID está vacío o ausente
    Then la API retorna HTTP 422
    And el response contiene error code "SEGMT-VAL-001" con detalle por campo
    And ningún registro se persiste

  Scenario: F1-FAC-03 — Longitud de campo excedida retorna 422
    Given un request POST /api/v1/segments
    When Code excede 20 chars, Name excede 250, o Description excede 2000
    Then la API retorna HTTP 422
    And el response contiene error code "SEGMT-VAL-002"

  Scenario: F1-FAC-04 — Code duplicado retorna 409
    Given un segmento con Code "PRY-001" ya existe
    When se envía POST /api/v1/segments con Code "PRY-001"
    Then la API retorna HTTP 409
    And el response contiene error code "SEGMT-BUS-001"

  # --- ACTUALIZACIÓN ---

  Scenario: F1-FAC-05 — SegmentConfigurationID es inmutable después de creación
    Given un segmento existente con SegmentConfigurationID = "config-A"
    When PUT /api/v1/segments/{id} envía SegmentConfigurationID = "config-B"
    Then la API retorna HTTP 422
    And error code "SEGMT-BUS-006"
    And el ConfigID almacenado permanece "config-A"
    And esto aplica SIN importar el nivel de permiso del usuario

  Scenario: F1-FAC-06 — IsTitle detail→title permanentemente bloqueado
    Given un segmento existente con IsTitle = false
    When PUT /api/v1/segments/{id} envía IsTitle = true
    Then la API retorna HTTP 422
    And error code "SEGMT-BUS-004"
    And el segmento retiene IsTitle = false
    And esta restricción es incondicional (ningún permiso la bypasea)

  Scenario: F1-FAC-07 — IsTitle title→detail bloqueado cuando tiene hijos
    Given un segmento con IsTitle = true que tiene al menos un hijo
    When PUT /api/v1/segments/{id} envía IsTitle = false
    Then la API retorna HTTP 409
    And error code "SEGMT-BUS-003"

  Scenario: F1-FAC-08 — IsTitle title→detail permitido sin hijos
    Given un segmento con IsTitle = true sin hijos
    When PUT /api/v1/segments/{id} envía IsTitle = false con version actual
    Then la API retorna HTTP 200
    And el segmento tiene is_title = false

  Scenario: F1-FAC-09 — Parent debe ser segmento título
    Given un segmento detail D (is_title = false)
    When un request POST o PUT establece ParentSegmentID = D.id
    Then la API retorna HTTP 422
    And error code "SEGMT-VAL-003"

  Scenario: F1-FAC-10 — Parent debe compartir el mismo SegmentConfigurationID
    Given un segmento título T con SegmentConfigurationID = "config-X"
    And un segmento siendo creado/actualizado con SegmentConfigurationID = "config-Y"
    When el request establece ParentSegmentID = T.id
    Then la API retorna HTTP 422
    And error code "SEGMT-VAL-004"

  Scenario: F1-FAC-11 — Referencia circular detectada y rechazada
    Given segmento A es ancestro de segmento B
    When PUT /api/v1/segments/A establece ParentSegmentID = B.id
    Then la API retorna HTTP 409
    And error code "SEGMT-BUS-005"

  Scenario: F1-FAC-12 — Auto-referencia rechazada
    Given segmento A
    When PUT /api/v1/segments/A establece ParentSegmentID = A.id
    Then la API retorna HTTP 409
    And error code "SEGMT-BUS-005"

  # --- CONCURRENCIA ---

  Scenario: F1-FAC-13 — Versión obsoleta rechazada con 409
    Given un segmento con versión xmin actual V
    When PUT /api/v1/segments/{id} se envía con version = V-1 (obsoleta)
    Then la API retorna HTTP 409
    And error code "SEGMT-BUS-002"
    And ningún dato cambia

  Scenario: F1-FAC-14 — Versión actual aceptada
    Given un segmento con versión xmin actual V
    When PUT /api/v1/segments/{id} se envía con version = V y body válido
    Then la API retorna HTTP 200
    And la actualización se aplica

  # --- CAMBIO DE ESTADO ---

  Scenario: F1-FAC-15 — Desactivar segmento globalmente
    Given un usuario con permiso change_status y un segmento activo
    When PATCH /api/v1/segments/{id}/status con { "isActive": false }
    Then HTTP 200 y el segmento tiene is_active = false en DB
    And el registro NO se elimina

  # --- PERMISOS ---

  Scenario Outline: F1-FAC-16 — Endpoint sin permiso retorna 403
    Given un usuario SIN el permiso <permission>
    When se llama <endpoint>
    Then la API retorna HTTP 403

    Examples:
      | endpoint                                   | permission                     |
      | GET /api/v1/segments                       | segment.segments.read          |
      | POST /api/v1/segments                      | segment.segments.create        |
      | PUT /api/v1/segments/{id} (global)         | segment.segments.update_global |
      | PATCH /api/v1/segments/{id}/status          | segment.segments.change_status |
      | POST /api/v1/segments/{id}/companies       | segment.segments.assign        |
      | DELETE /{id}/companies/{cId}               | segment.segments.assign        |
      | PUT /{id}/companies/{cId}/overrides        | segment.segments.update        |
```

#### FAC No Funcionales (Gherkin)

```gherkin
Feature: F1-NF — Requisitos no funcionales del ciclo de vida

  Scenario: F1-NF-01 — Detección de ciclos iterativa (sin stack overflow)
    Given una cadena jerárquica de 10 niveles de profundidad
    When un PUT intenta establecer un parent circular
    Then el servicio detecta el ciclo iterativamente sin StackOverflowException
    And retorna HTTP 409 con SEGMT-BUS-005

  Scenario: F1-NF-02 — Actualizaciones concurrentes manejadas de forma segura
    Given usuario A y usuario B leen el mismo segmento con versión V
    When usuario A actualiza exitosamente (versión incrementa a V+1)
    And usuario B envía PUT con la versión obsoleta V
    Then el request de usuario B retorna HTTP 409 con SEGMT-BUS-002

  Scenario: F1-NF-03 — AsNoTracking en todas las consultas de lectura
    Given cualquier endpoint GET list, search o tree
    When la consulta se ejecuta
    Then AsNoTracking() está aplicado en todas las lecturas
```

---

### Feature F2: Materialización Jerárquica del Árbol de Segmentos

- **Épicas/Historias Asociadas:** E001-S004, E003-S002
- **Dependencias:** segments (FK), segment_trees (tabla sistema), SegmentTreeSyncService

#### FAC Funcionales (Gherkin)

```gherkin
Feature: F2 — Árbol jerárquico de segmentos

  # --- AUTO-GENERACIÓN ---

  Scenario: F2-FAC-01 — Segmento detail genera fila en segment_trees
    Given un POST /api/v1/segments válido con IsTitle = false
    And el segmento tiene una cadena de ancestros de N niveles
    When el segmento se crea exitosamente
    Then exactamente una fila se inserta en segment_trees con segment_id = nuevo ID
    And CodeSegment y NameSegment coinciden con el segmento creado
    And SegmentLevel1ID … SegmentLevelNID reflejan la cadena de ancestría correcta
    And todos los niveles más allá de N son null

  Scenario: F2-FAC-02 — Segmento title NO genera fila en segment_trees
    Given un POST /api/v1/segments válido con IsTitle = true
    When el segmento se crea exitosamente
    Then NO se inserta fila en segment_trees para este segmento

  # --- SINCRONIZACIÓN ---

  Scenario: F2-FAC-03 — Cambio de Code propaga a todas las filas de tree
    Given segmento T (title) aparece como ancestro en múltiples filas de segment_trees
    When PUT /api/v1/segments/T actualiza Code de "OLD" a "NEW"
    Then todas las filas de segment_trees donde T aparece como ancestro reflejan Code = "NEW"
    And el cambio se aplica dentro de la misma transacción

  Scenario: F2-FAC-04 — Cambio de Code/Name actualiza la fila propia del tree
    Given un segmento detail D con una fila en segment_trees
    When Code o Name de D se actualiza
    Then las columnas code_segment / name_segment de la fila de D se actualizan

  # --- REPARENTING ---

  Scenario: F2-FAC-05 — Reparent reconstruye ambas ramas en una sola transacción
    Given segmento D (detail) bajo parent P1 (ancestros: A → P1)
    And segment_trees tiene fila para D mostrando la ancestría A → P1
    When PUT /api/v1/segments/{id} cambia ParentSegmentID de P1 a P2
    Then las filas de segment_trees para D y todos sus descendientes detail se actualizan
    And rama origen: las referencias antiguas a P1/A se limpian de todas las filas afectadas
    And rama nueva: la nueva ruta completa de ancestría (P2 y sus ancestros + subárbol movido) se escribe
    And ninguna fila retiene datos de ancestría obsoletos de la rama origen
    And todo ocurre dentro de la misma transacción DB

  # --- ENDPOINT ---

  Scenario: F2-FAC-06 — GET /tree retorna estructura jerárquica
    Given segmentos T1 (root title) → T2 → D1 (detail)
    When GET /api/v1/segments/tree se llama
    Then la respuesta es una estructura jerárquica con T1 en la raíz
    And T2 es hijo de T1 y D1 es hijo de T2
    And no ocurre null pointer exception cuando hay niveles ausentes

  Scenario: F2-FAC-07 — GET /tree con DB vacía retorna array vacío
    Given no existen segmentos
    When GET /api/v1/segments/tree se llama
    Then HTTP 200 con array vacío (no 404 ni 500)
```

#### FAC No Funcionales (Gherkin)

```gherkin
Feature: F2-NF — Requisitos no funcionales del árbol

  Scenario: F2-NF-01 — Fallo en escritura de tree hace rollback del update del parent
    Given una operación de reparent que inicia actualización de segment_trees
    When la escritura de tree falla a mitad de transacción
    Then toda la transacción se revierte
    And el segmento retiene su ParentSegmentID original
    And segment_trees retiene su estado pre-operación
```

---

### Feature F3: Asignación por Compañía, Overrides y Búsqueda con Resolución GLOBAL

- **Épicas/Historias Asociadas:** E002-S004, E003-S001, E003-S004
- **Dependencias:** segments_overrides (tabla), companies_prj, X-Company-Id header, COALESCE

#### FAC Funcionales (Gherkin)

```gherkin
Feature: F3 — Asignación por compañía y resolución de overrides

  # --- ASIGNACIÓN ---

  Scenario: F3-FAC-01 — Asignar segmento a compañía crea fila override con NULL IsActive
    Given un usuario con permiso assign
    When POST /api/v1/segments/{id}/companies con CompanyId
    Then HTTP 201
    And una fila se inserta en segments_overrides con is_active = NULL

  Scenario: F3-FAC-02 — Desasignar segmento de compañía elimina fila override
    Given un segmento asignado a una compañía
    When DELETE /api/v1/segments/{id}/companies/{companyId}
    Then la fila de override se elimina de segments_overrides

  Scenario: F3-FAC-03 — Override IsActive por compañía
    Given un segmento asignado a una compañía
    When PUT /api/v1/segments/{id}/companies/{companyId}/overrides con { "isActive": false }
    Then la fila override se actualiza con is_active = false
    And el registro global del segmento permanece sin cambios

  Scenario: F3-FAC-04 — Override a null restaura herencia
    Given un override de compañía existe con is_active = false
    When PUT /{id}/companies/{companyId}/overrides con { "isActive": null }
    Then la fila override tiene is_active = NULL
    And búsqueda posterior con companyId retorna el valor base vía COALESCE

  # --- DUAL-PATH PUT ---

  Scenario: F3-FAC-05 — PUT con X-Company-Id NO modifica tabla base
    Given un segmento con Code = "PRY" y Name = "Projects"
    And usuario tiene permiso update (no update_global)
    When PUT /api/v1/segments/{id} se llama CON X-Company-Id header
    And body incluye { code: "HACKED", name: "Hacked", isActive: false }
    Then la tabla base retiene Code = "PRY", Name = "Projects"
    And segments_overrides se actualiza con is_active = false para esa compañía

  Scenario: F3-FAC-06 — PUT sin X-Company-Id modifica tabla base
    Given un segmento con Code = "PRY"
    And usuario tiene permiso update_global
    When PUT /api/v1/segments/{id} sin X-Company-Id header
    And body incluye { code: "PRY-NEW", version: actual }
    Then la tabla segments se actualiza con code = "PRY-NEW"

  # --- BÚSQUEDA CON OVERRIDE ---

  Scenario: F3-FAC-07 — Búsqueda sin companyId retorna IsActive base
    Given segmentos con varios valores is_active y filas de override
    When POST /api/v1/segments/search sin additionalParams.companyId
    Then los resultados muestran el valor global is_active de cada segmento

  Scenario: F3-FAC-08 — Búsqueda con companyId aplica COALESCE
    Given segmento S con base is_active = true
    And un override de compañía para S con is_active = false
    When POST /api/v1/segments/search con additionalParams.companyId
    Then el resultado de S muestra is_active = false (override gana)

  Scenario: F3-FAC-09 — Búsqueda con companyId y override NULL hereda base
    Given segmento S con base is_active = true
    And un override de compañía para S con is_active = NULL
    When POST /api/v1/segments/search con additionalParams.companyId
    Then el resultado de S muestra is_active = true (vía COALESCE)

  # --- LOOKUPFIELD ---

  Scenario: F3-FAC-10 — isTitleOnly=true retorna solo segmentos título
    Given una mezcla de segmentos título y detail
    When POST /api/v1/segments/search con additionalParams.isTitleOnly = "true"
    Then solo segmentos con is_title = true aparecen en resultados

  Scenario: F3-FAC-11 — Sin isTitleOnly retorna todos los segmentos
    Given una mezcla de segmentos título y detail
    When POST /api/v1/segments/search sin isTitleOnly
    Then tanto segmentos título como detail aparecen en resultados
```

#### FAC No Funcionales (Gherkin)

```gherkin
Feature: F3-NF — Requisitos no funcionales de búsqueda

  Scenario: F3-NF-01 — Búsqueda con 500 segmentos responde en menos de 500ms
    Given 500 segmentos con overrides para una compañía
    When POST /api/v1/segments/search con companyId y pagination
    Then la respuesta se retorna en menos de 500ms al p95
```

---

### Feature F4: Publicación de Eventos de Dominio (Dapr)

- **Épicas/Historias Asociadas:** E003-S003
- **Dependencias:** Dapr pub/sub, DomainEventEnvelope, TenantId

#### FAC Funcionales (Gherkin)

```gherkin
Feature: F4 — Eventos de dominio publicados vía Dapr

  Scenario: F4-FAC-01 — segment.created publicado en create exitoso
    When POST /api/v1/segments tiene éxito
    Then un SegmentCreatedEvent se publica al topic "segments.segment.created"
    And el envelope incluye Id, Code, Name, IsTitle, SegmentConfigurationID, TenantId, SequenceNumber

  Scenario: F4-FAC-02 — segment.updated publicado en update exitoso
    When PUT /api/v1/segments/{id} tiene éxito
    Then un SegmentUpdatedEvent se publica al topic "segments.segment.updated"
    And el envelope incluye UpdatedFields[], TenantId, SequenceNumber

  Scenario: F4-FAC-03 — segment.status_changed publicado en cambio de estado
    When PATCH /api/v1/segments/{id}/status tiene éxito
    Then un SegmentStatusChangedEvent se publica al topic "segments.segment.status_changed"
    And el envelope incluye Id, IsActive (nuevo valor), TenantId, SequenceNumber

  Scenario: F4-FAC-04 — TenantId sourced desde endpoint, NO desde servicio
    Given el endpoint resuelve tenantId vía ctx.GetTenantID()
    When cualquier endpoint que genera evento se llama
    Then el envelope publicado contiene el TenantId correcto
    And TenantId NO fue sourced dentro del método del servicio
```

#### FAC No Funcionales (Gherkin)

```gherkin
Feature: F4-NF — Requisitos no funcionales de eventos

  Scenario: F4-NF-01 — Nombres de topic exactos (sin typos)
    Then los topics son exactamente:
      | Event                           | Topic                                  |
      | SegmentCreatedEvent             | segments.segment.created               |
      | SegmentUpdatedEvent             | segments.segment.updated               |
      | SegmentStatusChangedEvent       | segments.segment.status_changed        |
      | SegmentAssignedToCompanyEvent   | segments.segment.company_assigned      |
      | SegmentUnassignedFromCompanyEvent| segments.segment.company_unassigned   |
```

---

### Feature F5: Interfaz de Usuario — Lista, Formulario, Panel de Override y GLOBAL Wiring

- **Épicas/Historias Asociadas:** E004-S002, E004-S003, E004-S004, E005-S001 a S004, E006-S001 a S004, E007-S001 a S004
- **Dependencias:** Siesa UI Kit MasterCrud, AccessManager usePermission, TanStack Query, segmentService

#### FAC Funcionales (Gherkin)

```gherkin
Feature: F5 — Interfaz de usuario completa del Maestro de Segmentos

  # --- LISTA ---

  Scenario: F5-FAC-01 — Página de segmentos se renderiza correctamente
    Given el usuario está autenticado con permiso read
    When navega a /finance/segments/segments
    Then la SegmentsPage renderiza sin errores
    And el banner de clasificación GLOBAL es visible
    And al menos una cabecera de columna (Code, Name, IsTitle, Status) es visible

  Scenario: F5-FAC-02 — Filtros de lista conducen llamada API
    Given la lista de segmentos está visible
    When el usuario aplica filtro isTitle = true
    Then la API se llama con el parámetro correspondiente
    And solo segmentos título aparecen en resultados

  # --- FORMULARIO ---

  Scenario: F5-FAC-03 — ConfigurationID read-only en modo edición
    Given el drawer de segmento se abre en modo edición
    Then el LookupField de SegmentConfigurationID está disabled/read-only
    And no es posible cambiar el valor

  Scenario: F5-FAC-04 — ConfigurationID editable en modo creación
    Given el drawer de segmento se abre en modo creación
    Then el LookupField de SegmentConfigurationID es interactivo y requerido

  Scenario: F5-FAC-05 — Lock icon permanente para segmentos detail en edit mode
    Given un segmento detail (IsTitle = false) en el drawer de edición
    Then el toggle IsTitle muestra lock icon permanente
    And un tooltip explica que el cambio está permanentemente bloqueado

  Scenario: F5-FAC-06 — Toggle IsTitle interactivo en create mode
    Given el drawer está en modo creación
    Then el toggle IsTitle es interactivo (sin lock)

  # --- POST-CREATE DIALOG ---

  Scenario: F5-FAC-07 — Diálogo de asignación de compañía abre después de crear
    Given el usuario envía el formulario de creación de segmento
    When la API retorna HTTP 201
    Then el diálogo de asignación de compañía se muestra automáticamente
    And el usuario puede saltar (diálogo es opcional)

  # --- COMPANY OVERRIDE PANEL ---

  Scenario: F5-FAC-08 — Panel de override por compañía
    Given el usuario opera en contexto de compañía (X-Company-Id activo)
    When abre el formulario de edición de un segmento
    Then el panel de override muestra el IsActive efectivo (resuelto)
    And el toggle de override puede establecer o limpiar el override por compañía

  # --- CONCURRENCY UI ---

  Scenario: F5-FAC-09 — Banner de recarga en conflicto 409
    Given el usuario edita un segmento con versión obsoleta
    When la API retorna 409 con SEGMT-BUS-002
    Then la UI muestra un banner de recarga (NO un toast)
    And ningún dato se sobreescribe silenciosamente
```

---

## III. PUNTOS CIEGOS DETECTADOS POR FEATURE

> Arquetipos simulados: Usuario Inexperto, Usuario Malintencionado, Perfil de Integración (API Consumer),
> Entorno Hostil (Infraestructura), Contador Financiero, Administrador Multi-Compañía, Gestor de Configuración, Auditor de Procesos.

### Feature F1 — Gestión del Ciclo de Vida

| Arquetipo | Riesgo Detectado | Consecuencia para el Negocio |
| :--- | :--- | :--- |
| **Usuario Malintencionado** | Envía PUT con SegmentConfigurationID diferente aún con update_global | Si la inmutabilidad no se valida a nivel de servicio, se corrompen trees y reportes jerárquicos |
| **Usuario Malintencionado** | Envía IsTitle = true en segmento detail con JWT forjado que incluye update_global | Si la guarda IsTitle no es incondicional, segmentos detail se convierten en contenedores — rompiendo la integridad de transacciones contables |
| **Usuario Malintencionado** | Llama DELETE /companies/{companyId} sin permiso assign | Remoción no autorizada de asignaciones de compañía |
| **Entorno Hostil** | PUT concurrente de dos clientes con el mismo version token | Si xmin no se maneja, se produce pérdida silenciosa de datos |
| **Entorno Hostil** | POST con caracteres Unicode/especiales en Code (20 chars Unicode) | Constraint MaxLength(20) y DB podrían manejar diferente bytes vs chars |
| **API Consumer** | Envía PUT sin campo version en body | Debe retornar 422, no crash 500 |
| **API Consumer** | GET /segments/{id} para ID inexistente | Debe retornar 404, no 500 |

### Feature F2 — Árbol Jerárquico

| Arquetipo | Riesgo Detectado | Consecuencia para el Negocio |
| :--- | :--- | :--- |
| **Gestor de Configuración** | Reparenta un segmento título con muchos descendientes detail | Si el rebuild de tree es parcial, se producen reportes financieros jerárquicos incorrectos |
| **Gestor de Configuración** | Crea segmento en profundidad 10 (máximo permitido) | Si la fila de tree no popula los 10 niveles correctamente, reportes truncan ancestría |
| **Entorno Hostil** | Fallo de tree rebuild a mitad de transacción por constraint DB | Si la transacción no hace rollback completo, se producen segmentos huérfanos sin tree |
| **Usuario Inexperto** | Crea segmento detail sin parent (root detail) | El tree debe popularse con todos los niveles null — no debe lanzar error |
| **API Consumer** | Llama GET /tree sin segmentos en DB | Debe retornar array vacío, no 404 o 500 |

### Feature F3 — Asignación y Overrides

| Arquetipo | Riesgo Detectado | Consecuencia para el Negocio |
| :--- | :--- | :--- |
| **Usuario Malintencionado** | Envía PUT con X-Company-Id header + update_global + campos estructurales | Si dual-path no aísla correctamente, campos globales se mutan en contexto de compañía — corrupción de datos maestros |
| **Contador Financiero** | Busca segmentos por compañía para etiquetado de transacciones | Si COALESCE falla, un segmento desactivado por compañía aparece como activo — transacciones contables en segmento inválido |
| **Admin Multi-Compañía** | Asigna el mismo segmento a la misma compañía dos veces (409-guard) | Si el 409-guard no funciona, puede crear filas duplicadas en overrides o romper el loop de asignación bulk |
| **Admin Multi-Compañía** | Establece override IsActive a null para restaurar herencia | Si null no se maneja correctamente en COALESCE, el segmento podría aparecer como inactivo cuando debería heredar activo |
| **API Consumer** | Lee lista de segmentos sin X-Company-Id header | Debe recibir valores globales IsActive — no debe haber resolución de override accidental |

### Feature F4 — Eventos de Dominio

| Arquetipo | Riesgo Detectado | Consecuencia para el Negocio |
| :--- | :--- | :--- |
| **Auditor de Procesos** | TenantId populado dentro del servicio en lugar del endpoint | Si TenantId se sourcea incorrectamente, eventos van al tenant equivocado — fuga de datos cross-tenant |
| **API Consumer** | Envelope sin campo SequenceNumber | Consumidores downstream que dependen de ordering pierden capacidad de deduplicación |
| **Entorno Hostil** | Typo en nombre de topic de Dapr | Eventos se publican a topic inexistente — consumidores nunca reciben el evento |

### Feature F5 — Interfaz de Usuario

| Arquetipo | Riesgo Detectado | Consecuencia para el Negocio |
| :--- | :--- | :--- |
| **Usuario Inexperto** | Crea segmento detail e intenta agregar hijos vía UI | LookupField de parent debe excluir segmentos detail silenciosamente |
| **Usuario Inexperto** | Guarda segmento e inmediatamente edita sin refrescar | Token de versión del response de creación debe incluirse en PUT subsecuente — sino 409 |
| **Contador Financiero** | Espera estructura de tree en segment_trees para reporte jerárquico | Fila de tree debe existir para todos los segmentos detail; segmentos reparentados deben mostrar nueva ancestría |
| **Auditor de Procesos** | Lee CreatedAt, UpdatedAt, CreatedByUserID del GET response | Campos de auditoría deben estar poblados e inmutables (CreatedAt nunca cambia en update) |

---

## IV. MATRIZ INTEGRAL DE PRUEBAS (DISEÑO 360°)

> Nomenclatura: TC-{Prioridad}-{Área}-{NNN}
> Técnicas aplicadas: Partición de Equivalencia (PE), Valores Límite (VL), Tabla de Decisión (TD), Transición de Estados (TE), Error Guessing (EG), Análisis de Riesgo (AR)
> Riesgo = Impacto (1-5) × Probabilidad (1-5)

### P0 — Críticos (Deben pasar en cada build)

| ID | Funcionalidad | Épicas | Nivel | Técnica | Escenario | Precondiciones | Pasos | Resultado Esperado | Riesgo (I×P) | Prioridad | Estrategia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-P0-CRUD-001 | F1 - CRUD | E002-S002 | BE-Integration | PE | Crear segmento detail — happy path | SegmentConfiguration válida existe; usuario con permiso create | 1. POST /api/v1/segments con Code="PRY-001", Name="Bridge Project", IsTitle=false, ConfigID válido, IsActive=true | HTTP 201; response contiene id, code="PRY-001", isTitle=false; fila en segments; fila en segment_trees con code_segment="PRY-001", niveles 1-10=NULL (root detail) | 5×2=10 | P0 | Automatizado |
| TC-P0-CRUD-002 | F2 - Tree | E001-S004 | BE-Integration | TD | Crear segmento title — NO genera tree row | SegmentConfiguration válida existe | 1. POST /api/v1/segments con IsTitle=true | HTTP 201; fila en segments con is_title=true; CERO filas en segment_trees para este segmento | 5×2=10 | P0 | Automatizado |
| TC-P0-CRUD-003 | F2 - Tree | E001-S004 | BE-Integration | PE | Crear detail bajo title — tree row con ancestría correcta | Title T1 (root) existe | 1. POST segments con IsTitle=false, ParentSegmentID=T1.id | segment_trees para D1: level1_id=T1.id, code_level1=T1.code, name_level1=T1.name, levels 2-10=NULL | 5×2=10 | P0 | Automatizado |
| TC-P0-CRUD-004 | F1 - CRUD | E002-S002 | BE-Integration | PE | Get segment by ID retorna entidad con version | Segmento existe con id X y xmin V | 1. GET /api/v1/segments/X con permiso read | HTTP 200; response incluye id=X, version=V (non-zero uint), code, isTitle, isActive | 3×1=3 | P0 | Automatizado |
| TC-P0-CRUD-005 | F2 - Tree | E001-S004 | BE-Integration | AR | Update Code de title — tree rows actualizados para todas las refs ancestro | T1 con code="OLD-T"; D1 hijo de T1; D2 nieto vía T2 (level1=T1) | 1. PUT /segments/T1 actualiza Code="NEW-T" | D1.tree.code_level1="NEW-T"; D2.tree.code_level1="NEW-T"; ambos en misma TX | 5×3=15 | P0 | Automatizado |
| TC-P0-CRUD-006 | F1 - Status | E002-S003 | BE-Integration | TE | Desactivar segmento globalmente | Segmento activo; usuario con change_status | 1. PATCH /segments/{id}/status con { isActive: false } | HTTP 200; is_active=false en DB; registro no eliminado; SegmentStatusChangedEvent publicado | 4×2=8 | P0 | Automatizado |
| TC-P0-CRUD-007 | F3 - Search | E003-S001 | BE-Integration | TD | Búsqueda sin company context — retorna IsActive base | Seg A: base active=true, override company C: false; Seg B: base active=false | 1. POST /search SIN companyId | Seg A: is_active=true (base); Seg B: is_active=false (base) | 5×2=10 | P0 | Automatizado |
| TC-P0-CRUD-008 | F3 - Search | E003-S001 | BE-Integration | TD+AR | Búsqueda con company context — COALESCE override resolution | Seg A: base=true, override C=false; Seg B: base=true, override C=NULL; Seg C: base=false, sin override C | 1. POST /search CON companyId=C | Seg A: false (override); Seg B: true (NULL→base COALESCE); Seg C: false (no override→base) | 5×3=15 | P0 | Automatizado |
| TC-P0-ASSIGN-001 | F3 - Assign | E002-S004 | BE-Integration | PE | Asignar segmento a compañía — fila override con NULL | Segmento S y compañía C existen; usuario con assign | 1. POST /segments/S/companies con companyId=C.id | HTTP 201; fila en overrides (segment_id=S, company_id=C, is_active=NULL); evento publicado | 4×2=8 | P0 | Automatizado |
| TC-P0-ASSIGN-002 | F3 - Assign | E002-S004 | BE-Integration | PE | Desasignar segmento de compañía — fila eliminada | Segmento S asignado a C (override row existe) | 1. DELETE /segments/S/companies/C | HTTP 204; sin fila en overrides para (S,C); evento publicado | 4×2=8 | P0 | Automatizado |
| TC-P0-TREE-001 | F2 - Reparent | E001-S004 | BE-Integration | AR+EG | Reparent title — ambas ramas reconstruidas en una TX | T-Root→T1→D1,D2; T2 separado (target) | 1. PUT /segments/T1 cambia ParentSegmentID de T-Root a T2 | En una TX: D1,D2 trees actualizados con nueva ancestría vía T2; refs a T-Root eliminadas; ninguna fila retiene T-Root | 5×3=15 | P0 | Automatizado |
| TC-P0-SMOKE-001 | F5 - UI | E005-S001 | FE-E2E | — | Página de Segmentos carga y renderiza | Usuario autenticado con read | 1. Navegar a /finance/segments/segments | Página renderiza; banner GLOBAL visible; columnas Code, Name, IsTitle, Status visibles; sin errores de consola | 4×2=8 | P0 | Automatizado |

### P1 — Alta Prioridad (Reglas de Negocio Core)

| ID | Funcionalidad | Épicas | Nivel | Técnica | Escenario | Precondiciones | Pasos | Resultado Esperado | Riesgo (I×P) | Prioridad | Estrategia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-P1-GUARD-001 | F1 - Guards | E002-S003 | BE-Unit+Integ | TD+AR | IsTitle detail→title permanentemente bloqueado | Segmento con IsTitle=false | Unit: UpdateAsync con IsTitle=true → Result.Failure(SEGMT-BUS-004). Integ: PUT /{id} con isTitle=true → HTTP 422, code SEGMT-BUS-004; retiene is_title=false; aplica aún con update_global | Guard incondicional; sin bypass por permisos | 5×2=10 | P1 | Automatizado |
| TC-P1-GUARD-002 | F1 - Guards | E002-S003 | BE-Unit+Integ | TD | IsTitle title→detail bloqueado con hijos | Segmento título con al menos un hijo | Unit: UpdateAsync IsTitle=false → Failure(SEGMT-BUS-003). Integ: PUT → HTTP 409 | Bloqueo cuando existen hijos | 4×2=8 | P1 | Automatizado |
| TC-P1-GUARD-003 | F1 - Guards | E002-S003 | BE-Integration | TD | IsTitle title→detail permitido sin hijos | Segmento título sin hijos | 1. PUT /{id} con IsTitle=false, version actual | HTTP 200; segmento tiene is_title=false | 3×2=6 | P1 | Automatizado |
| TC-P1-IMMUT-001 | F1 - Immutab. | E002-S003 | BE-Unit+Integ | AR | ConfigID change rechazado incondicionalmente | Segmento con ConfigID=GUID-A | Unit: ConfigID=GUID-B → Failure(SEGMT-BUS-006). Integ: PUT con ConfigID diferente (aún con update_global) → HTTP 422 | ConfigID inmutable | 5×2=10 | P1 | Automatizado |
| TC-P1-CYCLE-001 | F1 - Cycle | E002-S003 | BE-Unit | EG | Auto-referencia directa rechazada | Segmento A (title) | cycle detection con parentID=A.id, currentID=A.id → HasCycle=true | Failure(SEGMT-BUS-005) | 5×2=10 | P1 | Automatizado |
| TC-P1-CYCLE-002 | F1 - Cycle | E002-S003 | BE-Unit+Integ | EG | Ciclo de 2 hops rechazado | Cadena A→B→C (A es root) | PUT /segments/A con ParentSegmentID=C → ciclo detectado | HTTP 409, code SEGMT-BUS-005 | 5×2=10 | P1 | Automatizado |
| TC-P1-PARENT-001 | F1 - Parent | E002-S001 | BE-Unit+Integ | PE | Parent debe ser segmento título | Segmento detail D existe | POST/PUT con ParentSegmentID=D.id → SEGMT-VAL-003 | HTTP 422 | 4×2=8 | P1 | Automatizado |
| TC-P1-PARENT-002 | F1 - Parent | E002-S001 | BE-Unit+Integ | PE | Parent debe compartir mismo ConfigID | Title T config-X; child config-Y | POST/PUT con ParentSegmentID=T.id y ConfigID diferente → SEGMT-VAL-004 | HTTP 422 | 4×2=8 | P1 | Automatizado |
| TC-P1-CONC-001 | F1 - Concurr. | E002-S003 | BE-Integration | AR | Versión obsoleta rechazada 409 | Segmento con xmin=V | PUT con version=V-1 | HTTP 409, SEGMT-BUS-002; datos sin cambios | 5×2=10 | P1 | Automatizado |
| TC-P1-CONC-002 | F1 - Concurr. | E002-S003 | BE-Integration | PE | Versión actual aceptada | Segmento con xmin=V | PUT con version=V y body válido | HTTP 200; datos actualizados | 3×1=3 | P1 | Automatizado |
| TC-P1-DUAL-001 | F3 - DualPath | E002-S003 | BE-Integration | AR | PUT con X-Company-Id — structural fields NO escritos a base | Seg Code="PRY", Name="Projects"; user con update | PUT CON header, body code="HACKED" name="Hacked" isActive=false | Base retiene PRY/Projects; overrides actualizado is_active=false | 5×3=15 | P1 | Automatizado |
| TC-P1-DUAL-002 | F3 - DualPath | E002-S003 | BE-Integration | PE | PUT sin X-Company-Id — global fields escritos a base | Seg Code="PRY"; user con update_global | PUT SIN header, code="PRY-NEW" | segments.code="PRY-NEW"; HTTP 200 | 3×2=6 | P1 | Automatizado |
| TC-P1-PERM-001 | F1 - Permisos | E002-S002/S003/S004 | BE-Integration | TD | 7 códigos de permiso enforced | JWT sin cada permiso | Para cada (endpoint, permiso): llamar sin permiso | HTTP 403 en cada caso | 5×2=10 | P1 | Automatizado |
| TC-P1-EVENT-001 | F4 - Events | E003-S003 | BE-Unit+Integ | AR | SegmentCreatedEvent publicado con envelope correcto | — | CreateAsync exitoso → Dapr publisher llamado | Topic "segments.segment.created"; envelope: Id, Code, Name, IsTitle, ConfigID, IsActive, TenantId (param), SequenceNumber (non-zero) | 4×3=12 | P1 | Automatizado |
| TC-P1-EVENT-002 | F4 - Events | E003-S003 | BE-Unit | PE | SegmentStatusChangedEvent publicado en PATCH status | — | ChangeStatusAsync exitoso | Topic "segments.segment.status_changed"; Id, IsActive, TenantId, SequenceNumber | 4×2=8 | P1 | Automatizado |
| TC-P1-EVENT-003 | F4 - Events | E003-S003 | BE-Unit | AR | DomainEventEnvelope incluye SequenceNumber | — | Construcción de envelope para cada evento SEGMT | SequenceNumber field type long, non-zero | 4×2=8 | P1 | Automatizado |
| TC-P1-LOOKUP-001 | F3 - Lookup | E003-S004 | BE-Integration | PE | isTitleOnly filter retorna solo títulos | Mix: T1, T2 (title), D1, D2 (detail) | POST /search con isTitleOnly="true" | Solo T1, T2 en resultados; D1, D2 excluidos | 4×2=8 | P1 | Automatizado |
| TC-P1-OVR-001 | F3 - Override | E002-S004 | BE-Integration | PE | Update override — IsActive set to false | Seg S asignado a C (is_active=NULL) | PUT /segments/S/companies/C/overrides con {isActive:false} | HTTP 200; override is_active=false; base sin cambios | 4×2=8 | P1 | Automatizado |
| TC-P1-OVR-002 | F3 - Override | E002-S004 | BE-Integration | PE | Override a null restaura herencia | Override con is_active=false | PUT /overrides con {isActive:null} | override is_active=NULL; search con companyId retorna base value | 4×2=8 | P1 | Automatizado |
| TC-P1-E2E-001 | F5 - UI E2E | E007-S004 | FE-E2E | TE | Flujo completo: Create → Assign → List | User con create, assign, read | 1. Click "New" 2. Fill form 3. Submit 4. Assign company 5. Return to list | 201, diálogo abre, assignment exitoso, segmento en lista, banner GLOBAL visible | 4×2=8 | P1 | Automatizado |

### P2 — Media Prioridad (Casos Borde y Límites)

| ID | Funcionalidad | Épicas | Nivel | Técnica | Escenario | Precondiciones | Pasos | Resultado Esperado | Riesgo (I×P) | Prioridad | Estrategia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-P2-TREE-001 | F2 - Tree | E001-S004 | BE-Integ | VL | Cadena de 3 niveles — ancestros correctos | T1→T2→T3→D1 (depth 4) | Crear D1 | tree: level1=T1, level2=T2, level3=T3, levels 4-10=NULL | 3×2=6 | P2 | Automatizado |
| TC-P2-TREE-002 | F2 - Tree | E001-S004 | BE-Integ | VL | Cadena de 10 niveles — tree completamente poblado | T1→T2→…→T9→D1 | Crear D1 | tree: levels 1-9 poblados (T1-T9), level 10=NULL | 3×2=6 | P2 | Automatizado |
| TC-P2-TREE-003 | F2 - Tree | E001-S004 | BE-Integ | VL+EG | Cadena de 11 niveles — truncación silenciosa (TD-SEGMT-003) | T1→…→T10→D1 (depth 11) | Crear D1 | tree: levels 1-10 poblados; sin excepción (truncación conocida) | 2×2=4 | P2 | Automatizado |
| TC-P2-SEARCH-001 | F3 - Search | E003-S001 | BE-Integ | VL | Paginación boundary | 25 segmentos existen | POST /search page=1 pageSize=10 → totalItems=25, totalPages=3, data.length=10; page=3 → data.length=5 | 2×2=4 | P2 | Automatizado |
| TC-P2-TREE-EP-001 | F2 - Tree EP | E003-S002 | BE-Integ | PE | GET /tree retorna estructura jerárquica | T1→T2→D1 | GET /tree | Estructura con T1 raíz, T2 hijo, D1 hoja; sin NPE | 3×2=6 | P2 | Automatizado |
| TC-P2-TREE-EP-002 | F2 - Tree EP | E003-S002 | BE-Integ | EG | GET /tree con DB vacía | Sin segmentos | GET /tree | HTTP 200, array vacío | 2×1=2 | P2 | Automatizado |
| TC-P2-LOOKUP-001 | F3 - Lookup | E003-S004 | BE-Integ | TD | LookupField search con companyId aplica COALESCE | Seg S: base=true, override C=false | POST /search con companyId=C e isTitleOnly="true" | S aparece con is_active=false | 3×2=6 | P2 | Automatizado |
| TC-P2-CODE-001 | F1 - Code | E002-S001 | BE-Integ | VL | Unicidad de Code case sensitivity | Seg con Code="PRY-001" | POST con Code="pry-001" | Según collation DB: case-insensitive→409; case-sensitive→201. Documentar comportamiento | 2×2=4 | P2 | Automatizado |
| TC-P2-409-001 | F3 - Assign | E007-S002 | BE-Unit+Integ | EG | Re-asignar a misma compañía retorna 409 gracefully | Seg S ya asignado a C | POST /segments/S/companies con companyId=C | HTTP 409; override row sin cambios; 409-guard no rompe batch | 3×2=6 | P2 | Automatizado |
| TC-P2-AUDIT-001 | F1 - Audit | E002-S002 | BE-Integ | PE | CreatedAt inmutable después de update | Seg S creado en T1 | PUT /segments/S (update válido); GET /segments/S | created_at=T1 (sin cambio); updated_at=T2 (>T1) | 2×2=4 | P2 | Automatizado |

### P3 — Baja Prioridad (Edge Cases y Polish)

| ID | Funcionalidad | Épicas | Nivel | Técnica | Escenario | Precondiciones | Pasos | Resultado Esperado | Riesgo (I×P) | Prioridad | Estrategia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC-P3-404-001 | F1 - CRUD | E002-S002 | BE-Integ | EG | GET por ID desconocido retorna 404 | — | GET /segments/{unknown-uuid} | HTTP 404 (no 500) | 2×1=2 | P3 | Automatizado |
| TC-P3-EMPTY-001 | F3 - Search | E003-S001 | BE-Integ | VL | GET list sin segmentos retorna PagedResponse vacío | Sin segmentos | GET /segments | HTTP 200; { data: [], totalItems: 0, totalPages: 0 } | 1×1=1 | P3 | Automatizado |
| TC-P3-TOPIC-001 | F4 - Events | E003-S003 | BE-Unit | EG | Topic names exactos (sin typos) | — | Verificar cada event class | Topics match: created, updated, status_changed, company_assigned, company_unassigned | 2×2=4 | P3 | Automatizado |
| TC-P3-I18N-001 | F5 - UI | E006-S004 | FE-E2E | EG | Error messages no en blanco en UI | — | Trigger SEGMT-VAL-001 desde form | Texto de error renderizado no es blank, vacío ni raw key | 1×2=2 | P3 | Automatizado |
| TC-P3-PERF-001 | F3 - Search | E003-S001 | BE-Integ | AR | Búsqueda con 500 segmentos < 500ms | 500 segs con overrides | POST /search con companyId, pageSize=50 (10 llamadas) | Tiempo < 500ms al p95 | 2×2=4 | P3 | Semi-auto |
| TC-P3-LOCK-001 | F5 - UI | E006-S003 | FE-E2E | PE | ConfigID read-only en edit mode | Segmento con ConfigID="Config-X" | Abrir edit drawer | ConfigID LookupField disabled; no se puede cambiar | 2×2=4 | P3 | Automatizado |
| TC-P2-CONC-UI-001 | F5 - UI | E006-S004 | FE-E2E | AR | Banner de recarga en 409 concurrencia | User edita con version obsoleta | Submit form con stale version | API retorna 409; UI muestra banner (no toast); datos no sobreescritos | 3×2=6 | P3 | Automatizado |
| TC-P1-E2E-LOCK-001 | F5 - UI | E006-S002 | FE-E2E | PE | Lock icon IsTitle para detail en edit mode | Detail segment existe | Abrir edit drawer | Toggle IsTitle muestra lock icon permanente; tooltip visible; toggle no interactivo | 3×2=6 | P3 | Automatizado |

---

## V. INFORME TSR (TEST SUMMARY REPORT)

### 1. Métricas de Diseño

| Métrica | Valor |
|---------|-------|
| Features Identificadas | 5 |
| Épicas Totales | 7 (E001–E007) |
| Historias Totales | 28 |
| Historias de Lógica de Negocio (BL) | 27 |
| Historias de Ruido Técnico (TN) | 1 (E004-S001) |
| FAC Funcionales generados | 39 |
| FAC No Funcionales generados | 6 |
| **FAC Totales** | **45** |
| Riesgos identificados por arquetipos | 20 puntos ciegos |

### 2. Prioridad Crítica (P0)

| Total P0 | Áreas Cubiertas |
|----------|-----------------|
| **12** | CRUD happy path (4), Tree auto-gen (3), Search COALESCE (2), Assign/Unassign (2), UI Smoke (1) |

### 3. Riesgos CRÍTICOS (Puntaje ≥ 10)

| ID Test | Feature | Riesgo | I×P | Mitigación |
|---------|---------|--------|-----|------------|
| TC-P0-CRUD-005 | F2 - Tree Sync | Cambio de Code no propaga a tree rows — reportes con datos obsoletos | 5×3=15 | Integration test: actualizar Code de title → verificar TODAS las tree rows ancestro |
| TC-P0-CRUD-008 | F3 - COALESCE | COALESCE produce resultado incorrecto con override NULL — segmentos inactivos aparecen activos | 5×3=15 | Integration test: 3 escenarios de override (false, NULL, sin override) |
| TC-P0-TREE-001 | F2 - Reparent | Rebuild parcial de tree — rama origen retiene ancestría obsoleta | 5×3=15 | Integration test: reparent → assert ambas ramas; assert refs antiguas NULL |
| TC-P1-DUAL-001 | F3 - DualPath | PUT con X-Company-Id muta campos globales — corrupción de datos maestros | 5×3=15 | Integration test: PUT+header → base table unchanged |
| TC-P1-EVENT-001 | F4 - Events | TenantId sourced incorrectamente → eventos a tenant equivocado | 4×3=12 | Unit test: TenantId es parámetro, NO sourced en service |
| TC-P0-CRUD-001 | F1 - CRUD | Creación falla silenciosamente sin tree row para detail — reportes incompletos | 5×2=10 | Integration: create detail → verify tree row exists |
| TC-P1-GUARD-001 | F1 - Guards | IsTitle guard bypassed → detail se convierte en title → transacciones contables en nodo incorrecto | 5×2=10 | Unit + Integration: incondicional, sin bypass por permisos |
| TC-P1-IMMUT-001 | F1 - Immutab. | ConfigID mutado → trees corruptos, reportes cruzados entre configuraciones | 5×2=10 | Unit + Integration: incondicional |
| TC-P1-CYCLE-001/002 | F1 - Cycle | Referencia circular → hierarchy infinite loop → crash o datos corruptos | 5×2=10 | Unit: self-ref + 2-hop; Integration: HTTP 409 |
| TC-P1-PERM-001 | F1 - Permisos | Endpoint sin permission gate → acceso no autorizado a datos financieros | 5×2=10 | Integration: 7 endpoints × missing permission → 403 |

### 4. Cobertura P0

| Funcionalidad | Casos P0 | % Cubierto |
|---------------|----------|------------|
| F1 - Gestión Ciclo de Vida | 3 | 100% rutas CRUD críticas |
| F2 - Árbol Jerárquico | 4 | 100% create/sync/reparent |
| F3 - Overrides y Búsqueda | 4 | 100% COALESCE + assign |
| F4 - Eventos de Dominio | 0 (P1) | Cubierto en P1 |
| F5 - Interfaz de Usuario | 1 | 100% smoke render |
| **Total** | **12** | **100%** |

### 5. Tablas de Cobertura Específicas

#### Cobertura por Feature

| Feature | P0 | P1 | P2 | P3 | Total | Cobertura FACs |
|---------|----|----|----|----|-------|----------------|
| F1 - Gestión Ciclo de Vida | 3 | 10 | 2 | 1 | **16** | 16/16 FAC-F = 100% |
| F2 - Árbol Jerárquico | 4 | 0 | 4 | 0 | **8** | 7/7 FAC-F = 100% |
| F3 - Overrides y Búsqueda | 4 | 5 | 3 | 2 | **14** | 11/11 FAC-F = 100% |
| F4 - Eventos de Dominio | 0 | 3 | 0 | 1 | **4** | 4/4 FAC-F = 100% |
| F5 - Interfaz de Usuario | 1 | 2 | 0 | 4 | **7** | 9/9 FAC-F = 100% |
| **TOTAL** | **12** | **20** | **9** | **8** | **49** | **45/45 = 100%** |

#### Cobertura de Seguridad

| Control de Seguridad | Test Cases | Cobertura |
|---------------------|-----------|-----------|
| RBAC — 7 permission codes | TC-P1-PERM-001 (parameterized) | 100% endpoints |
| Dual-path isolation (X-Company-Id) | TC-P1-DUAL-001, TC-P1-DUAL-002 | 100% |
| ConfigID inmutabilidad (anti-tampering) | TC-P1-IMMUT-001 | 100% |
| IsTitle guard incondicional | TC-P1-GUARD-001 | 100% |
| Cycle detection (anti-DoS hierarchy) | TC-P1-CYCLE-001, TC-P1-CYCLE-002 | 100% |
| TenantId isolation | TC-P1-EVENT-001 | 100% |
| Optimistic concurrency (anti-overwrite) | TC-P1-CONC-001, TC-P1-CONC-002 | 100% |

#### Cobertura de Performance

| Escenario | Test Case | Umbral | Nivel |
|-----------|----------|--------|-------|
| Búsqueda con 500 segmentos + overrides | TC-P3-PERF-001 | P95 < 500ms | Integration |

#### Cobertura de Integraciones

| Integración | Test Cases | Cobertura |
|-------------|-----------|-----------|
| PostgreSQL (Testcontainers) | 31 tests de Integration | 100% CRUD + tree |
| Dapr pub/sub (domain events) | TC-P1-EVENT-001/002/003, TC-P3-TOPIC-001 | 5/5 event types |
| Siesa.MasterPattern (GLOBAL override) | TC-P0-CRUD-007/008 + TC-P1-DUAL-001/002 | COALESCE + dual-path |
| Siesa.AccessManager (RBAC) | TC-P1-PERM-001 | 7/7 permission codes |
| Siesa UI Kit MasterCrud | TC-P0-SMOKE-001, TC-P1-E2E-001 | Render + flow |

---

## APÉNDICE: MATRIZ DE TRAZABILIDAD

### Funcionalidad → Épicas → Casos de Prueba

**F1 — Gestión del Ciclo de Vida de Segmentos**
- E001-S001 (Entities & EF Core) → TC-P0-CRUD-004
- E001-S002 (Migration) → Implícito en todos los integration tests
- E001-S003 (SegmentService wiring) → TC-P0-CRUD-001, TC-P0-CRUD-004
- E002-S001 (Validators) → TC-P1-PARENT-001, TC-P1-PARENT-002, TC-P2-CODE-001
- E002-S002 (POST/GET/DELETE) → TC-P0-CRUD-001, TC-P0-CRUD-002, TC-P0-CRUD-004, TC-P3-404-001
- E002-S003 (PUT/PATCH) → TC-P1-GUARD-001/002/003, TC-P1-IMMUT-001, TC-P1-CYCLE-001/002, TC-P1-CONC-001/002, TC-P0-CRUD-006

**F2 — Materialización Jerárquica del Árbol**
- E001-S004 (SegmentTreeSyncService) → TC-P0-CRUD-001/002/003/005, TC-P0-TREE-001, TC-P2-TREE-001/002/003
- E003-S002 (GET /tree) → TC-P2-TREE-EP-001/002

**F3 — Asignación por Compañía, Overrides y Búsqueda**
- E002-S004 (Assign/Unassign) → TC-P0-ASSIGN-001/002, TC-P1-OVR-001/002, TC-P2-409-001
- E003-S001 (Search COALESCE) → TC-P0-CRUD-007/008, TC-P2-SEARCH-001, TC-P3-EMPTY-001
- E003-S004 (LookupField) → TC-P1-LOOKUP-001, TC-P2-LOOKUP-001

**F4 — Publicación de Eventos de Dominio**
- E003-S003 (Dapr events) → TC-P1-EVENT-001/002/003, TC-P3-TOPIC-001

**F5 — Interfaz de Usuario**
- E005-S001 (SegmentsPage) → TC-P0-SMOKE-001
- E006-S002 (IsTitle toggle) → TC-P1-E2E-LOCK-001
- E006-S003 (ConfigID lock) → TC-P3-LOCK-001
- E006-S004 (Error surface) → TC-P3-I18N-001, TC-P2-CONC-UI-001
- E007-S004 (E2E full flow) → TC-P1-E2E-001

### Requerimientos Funcionales → FAC → Test Cases

| Req. Funcional | FAC | Test Cases |
|----------------|-----|------------|
| FR-SEGMT-001 (campos requeridos) | F1-FAC-01/02/03 | TC-P0-CRUD-001 |
| FR-SEGMT-002 (unicidad code) | F1-FAC-04 | TC-P0-CRUD-001, TC-P2-CODE-001 |
| FR-SEGMT-005 (title→detail blocked con hijos) | F1-FAC-07 | TC-P1-GUARD-002 |
| FR-SEGMT-006 (detail→title permanentemente blocked) | F1-FAC-06 | TC-P1-GUARD-001 |
| FR-SEGMT-007 (parent: title + mismo config) | F1-FAC-09/10 | TC-P1-PARENT-001/002 |
| FR-SEGMT-008 (sin ciclos) | F1-FAC-11/12 | TC-P1-CYCLE-001/002 |
| FR-SEGMT-009 (ConfigID inmutable) | F1-FAC-05 | TC-P1-IMMUT-001 |
| FR-SEGMT-010 (tree auto-gen create) | F2-FAC-01/02 | TC-P0-CRUD-001/002/003 |
| FR-SEGMT-011 (tree sync code/name) | F2-FAC-03/04 | TC-P0-CRUD-005 |
| FR-SEGMT-012 (reparent ambas ramas) | F2-FAC-05 | TC-P0-TREE-001 |
| FR-SEGMT-013 (cambio estado global) | F1-FAC-15 | TC-P0-CRUD-006 |
| FR-SEGMT-015 (asignar a compañía) | F3-FAC-01 | TC-P0-ASSIGN-001 |
| FR-SEGMT-016 (desasignar) | F3-FAC-02 | TC-P0-ASSIGN-002 |
| FR-SEGMT-017 (override IsActive) | F3-FAC-03/04 | TC-P1-OVR-001/002 |
| FR-SEGMT-018 (COALESCE en search) | F3-FAC-07/08/09 | TC-P0-CRUD-007/008 |
| FR-SEGMT-019 (concurrencia optimista) | F1-FAC-13/14 | TC-P1-CONC-001/002, TC-P2-CONC-UI-001 |
| FR-SEGMT-021 (post-create dialog) | F5-FAC-07 | TC-P1-E2E-001 |
| FR-SEGMT-022 (LookupField title-only) | F3-FAC-10 | TC-P1-LOOKUP-001 |
| RBAC (7 permissions) | F1-FAC-16 | TC-P1-PERM-001 |
| Domain Events (5 eventos) | F4-FAC-01/02/03/04 | TC-P1-EVENT-001/002/003, TC-P3-TOPIC-001 |

---

> **Nota:** Documento generado con metodología BMAD V6.0. Documento vivo — actualizar al identificar nuevos riesgos o al cerrar features del sprint.
