---
workflow: generate-test-plan
version: 1.0.0
methodology: BMAD v3.0 Spec-Driven Quality
generated_date: 2026-03-20T16:00:00Z
project_name: Siesa-Agents
source_documents:
  prd: _bmad-output/planning-artifacts/prd/ (sharded — 12 files)
  architecture: _bmad-output/planning-artifacts/architecture.md
  epics:
    - _bmad-output/planning-artifacts/epics/epic-01-foundation.md
    - _bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md
    - _bmad-output/planning-artifacts/epics/epic-03-gestion-de-contactos.md
    - _bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md
  regulatory: null
  ux_design: _bmad-output/planning-artifacts/ux-design-specification.md
---

# Plan de Pruebas QA — Siesa-Agents
**Metodología:** BMAD v3.0 Spec-Driven Quality

---

## 📋 SECCIÓN 1 — INFORMACIÓN GENERAL

```
Proyecto:              Siesa-Agents
Módulo / Dominio:      CRM — Gestión de Clientes y Contactos (SPA + REST API)
Sprint / Ciclo:        MVP — Épicas 1-4 (completo)
Fecha del Plan:        2026-03-20
Autor:                 SiesaTeam — asistido por IA (BMAD v3.0)

Stack:
  Backend:             .NET 10 · C# Minimal API · EF Core 10 · FluentValidation · PostgreSQL 18+
  Frontend:            Vite 7 · React 18 · TypeScript strict · TanStack Router · TanStack Query 5+ · Zustand 5+ · siesa-ui-kit
  Testing Backend:     xUnit · Moq · TestContainers (Postgres) · HttpClient
  Testing Frontend:    Vitest · React Testing Library · MSW
  API Docs:            Scalar (no Swagger)
  CI/CD:               GitHub Actions · GitFlow
```

---

## 🎯 SECCIÓN 2 — OBJETIVO & DoR / DoD

### 2.1 Objetivos de Negocio

1. **Integridad de datos cliente-contacto:** Garantizar que la relación 1:N entre `Cliente` y `Contacto` se mantiene correctamente bajo todos los flujos de asociación, desasociación, reasignación y eliminación — incluyendo el comportamiento `ON DELETE SET NULL`.
2. **Consistencia de UI en tiempo real:** Verificar que todos los cambios CRUD y de asociación se reflejan de forma inmediata en la UI para todos los usuarios (FR27), a través de la invalidación correcta de TanStack Query keys.
3. **Calidad de datos:** Validar que el sistema impide la creación de registros con campos requeridos vacíos o NIT duplicado (FR7, FR8, FR16), protegiendo la integridad del directorio comercial.
4. **Usabilidad mínima sin fricción:** Confirmar que un usuario nuevo puede completar flujos core (registrar cliente + contacto + asociar) sin documentación, en ≤ 2 clics de navegación (NFR7, NFR8, NFR9).
5. **Robustez ante errores técnicos:** Verificar que ningún error interno expone stack traces al usuario final (NFR6) y que todos los endpoints retornan Problem Details RFC 7807.

### 2.2 Criterios de Calidad

| Criterio | Meta |
|----------|------|
| Cobertura backend (xUnit) | ≥ 80% en Application layer (Handlers, Validators) |
| Cobertura frontend (Vitest) | ≥ 75% en Hooks, Adapters, componentes críticos |
| Defectos P1 en producción | 0 |
| Búsqueda `< 1s` (NFR1) con 500+ registros | 100% de scenarios de search |
| CRUD refleja cambio `< 2s` (NFR2) | 100% de mutations validadas |
| Exposición de stack traces (NFR6) | 0 — Problem Details obligatorio |
| NIT duplicado rechazado con 409 | 100% |
| `ON DELETE SET NULL` — contactos subsisten | 100% |

### 2.3 Checklist DoR — Definition of Ready

> ✅ = Cumple | ⚠️ = Parcial | ❌ = Bloquea inicio de QA

- [x] ✅ Historias con criterios de aceptación definidos y revisados (épicas 1-4 completas)
- [x] ✅ Arquitectura técnica aprobada (`architecture.md` — status: complete)
- [ ] ⚠️ Endpoints documentados en Scalar — verificar que `/scalar` está activo en QA (AC-E1-Story1.1)
- [ ] ⚠️ Datos de prueba identificados — requiere seeds en BD QA (ver Data Buckets §5.2)
- [x] ✅ Dependencias inter-servicio mapeadas — ninguna externa en MVP
- [x] ✅ RBAC no aplica en MVP (PRD decision explícita — sin auth)
- [x] ✅ Análisis IA preliminar ejecutado (BMAD v3.0 — este documento)
- [ ] ⚠️ Migración inicial aplicada en ambiente QA (`siesa_agents_db` creada)
- [ ] ⚠️ CORS configurado para el ambiente QA (no solo `localhost:5173`)

### 2.4 Checklist DoD — Definition of Done

- [ ] Código implementado con code review aprobado (GitHub PR merged a `develop`)
- [ ] Tests unitarios ≥ 80% cobertura pasando (xUnit + Vitest)
- [ ] Tests de integración (TestContainers PostgreSQL) pasando — todos los endpoints
- [ ] 0 defectos P1/bloqueantes abiertos
- [ ] Endpoints documentados en Scalar (`/api/v1/clientes`, `/api/v1/contactos`, `/api/v1/contactos/{id}/cliente`)
- [ ] Pipeline CI/CD verde en `develop`
- [ ] Validación funcional completa en ambiente QA (flujos Épica 1-4)
- [ ] NFR1 verificado: search < 1s con dataset de 500 clientes / 1000 contactos
- [ ] NFR2 verificado: CRUD < 2s bajo carga normal
- [ ] NFR6 verificado: 0 stack traces — solo Problem Details RFC 7807
- [ ] `ON DELETE SET NULL` validado: eliminar cliente → contactos permanecen con `clienteId = null`
- [ ] TanStack Query invalidation verificada: todas las mutations invalidan las query keys correctas
- [ ] Análisis IA post-sprint ejecutado (BMAD)

---

## 📐 SECCIÓN 3 — ALCANCE DE PRUEBAS

### 3.1 Features Incluidas

| # | Feature | Dominio | Mutabilidad | Riesgo | Prioridad QA |
|---|---------|---------|-------------|--------|-------------|
| F1 | Foundation & Application Shell (Épica 1) | Infraestructura / Navegación | Baja | Bajo | P3 |
| F2 | Gestión de Clientes — CRUD (Épica 2) | CRM — Entidad Cliente | Media | Medio | P2 |
| F3 | Gestión de Contactos — CRUD (Épica 3) | CRM — Entidad Contacto | Media | Medio | P2 |
| F4 | Asociación Cliente↔Contacto & Calidad de Datos (Épica 4) | CRM — Relación 1:N | Alta | **Alto** | **P1** |

### 3.2 Fuera de Alcance

| Elemento Excluido | Justificación |
|------------------|---------------|
| Autenticación / JWT | Fuera de scope MVP — decisión explícita en PRD y arquitectura |
| Paginación server-side | MVP usa client-side filtering; escala de 500/1000 registros |
| HTTPS (configuración) | Solo aplica en producción — no en ambiente de desarrollo/QA local |
| Redis / Caching distribuido | Diferido a post-MVP |
| Docker / Kubernetes | Solo para producción — fuera de scope QA |
| CI/CD pipeline completo | En construcción — smoke tests manuales en QA por ahora |
| RBAC / Permisos por rol | Sin autenticación en MVP |
| Exportación de datos | No en PRD MVP |

---

## 🛠️ SECCIÓN 4 — ESTRATEGIA DE PRUEBAS

### 4.1 Tipos de Prueba

| Tipo | Herramienta | Alcance | Cobertura Objetivo | Automatización |
|------|------------|---------|-------------------|---------------|
| Unitarias Backend | xUnit + Moq | Validators (FluentValidation), Command/Query Handlers, Domain Entities | ≥ 80% en Application + Domain | 100% |
| Unitarias Frontend | Vitest + RTL | Hooks TanStack Query (`useClientes`, `useContactos`, `useCreateCliente`…), `ClienteContactServiceAdapter`, Componentes de validación | ≥ 75% en hooks + adapters | 100% |
| Integración Backend | xUnit + TestContainers (PostgreSQL) | Repositorios EF Core, Endpoints Minimal API, ExceptionHandlingMiddleware, ON DELETE SET NULL cascade | ≥ 70% en Integration layer | 100% |
| Integración Frontend | Vitest + MSW | API calls via Axios, TanStack Query invalidation patterns, optimistic updates, error states | ≥ 60% en infrastructure layer | 100% |
| Smoke Tests | xUnit + HttpClient | 11 endpoints críticos post-deploy: GET /clientes, POST /clientes, GET /contactos, POST /contactos, PUT /contactos/{id}/cliente, DELETE /clientes/{id} | 100% endpoints | 100% |
| Performance | k6 (manual/semi-auto) | GET /api/v1/clientes y /api/v1/contactos con 500/1000 registros; P95 < 300ms | NFR1 threshold | Semi-auto |
| Seguridad básica | xUnit + HttpClient manual | Input injection en campos Nombre, NIT, Email; Problem Details RFC 7807 enforcement | Todos los inputs de usuario | 100% |
| Exploratoria | Sesiones guiadas (manual) | Flujos de Épica 4: asociación → reasignación → eliminación de cliente → verificar contactos huérfanos; navegación bidireccional | Features P1 | Manual |

> **Nota sobre Pact/Contract Tests:** No aplica en MVP — frontend y backend están en el mismo repositorio y no hay microservicios separados. El contrato se valida via OpenAPI Scalar + tests de integración backend.

### 4.2 Técnicas de Diseño Aplicadas

| Técnica | Features Objetivo | Observación |
|---------|-----------------|-------------|
| Partición de Equivalencia | F2 (NIT), F3 (Email), F4 (clienteId) | Clases: válido / vacío / duplicado / formato incorrecto |
| Valores Límite | F2 (Nombre 1-255 chars), F3 (Email formato), F4 (clienteId: válido / null / inexistente) | Frontend Zod + Backend FluentValidation — validar coherencia entre capas |
| Tabla de Decisión | F4 — Asociación/Desasociación/Reasignación | 4 estados: sin cliente → asociado → reasignado → cliente eliminado (huérfano) |
| Transición de Estados | F4 — ciclo de vida `clienteId` en ContactoEntity | Estado: `null` → `uuid_A` → `uuid_B` → `null` (DELETE CASCADE) |
| Error Guessing / Risk-Based | F4 (TanStack Query stale cache), F2 (NIT race condition), F1 (CORS) | Escenarios: mutation sin invalidación, request paralelo mismo NIT, CORS preflight fallo |

### 4.3 Integración Human–AI (BMAD)

**Nivel de uso de IA en el sprint:**
| Nivel | % Ref. | Aplica | Justificación | Responsable Validación |
|-------|--------|--------|---------------|----------------------|
| Manual | 0% | ❌ | Stack ya definido — no requiere análisis manual puro | — |
| Asistido | 30% | ❌ | Supera capacidad de análisis del sprint | — |
| Diseño IA validado por QA | 60% | ✅ | Este plan generado por BMAD, validado por QA humano | QA Lead |
| IA + análisis predictivo | 90% | ✅ (Risk Matrix) | Riesgos predictivos F4 identificados automáticamente | QA Lead |

**Agentes IA activados:**
| Agente IA | Utilizado | Fase | Impacto | Observaciones |
|-----------|----------|------|---------|---------------|
| Analizador Funcional | ✅ | Pre-construcción | Alto | AC coverage completo para Épicas 1-4 |
| Generador de Casos de Prueba | ✅ | Pre-construcción | Alto | Escenarios positivos, negativos, borde por FR |
| Analizador Predictivo de Riesgo | ✅ | Pre-construcción | Crítico | Identificó R-F4-02 (cache stale) como único R>15 |
| Validador Inteligente de Datos (Alquimista) | ✅ | Ejecución | Medio | Data Buckets por feature (§5.2) |
| Explorador Inteligente | ✅ | Ejecución | Medio | Arquetipos de usuario + sesiones exploratorias F4 |
| Clasificador Automático de Defectos | ✅ | Ejecución | Medio | Taxonomía de bugs esperados por capa |
| Analizador Post-Sprint | ⬜ | Certificación | Alto | Ejecutar al finalizar implementación |

---

## 🌐 SECCIÓN 5 — AMBIENTE & DATOS DE PRUEBA

### 5.1 Ambiente Requerido

| Ambiente | Estado Requerido | Responsable | Observación |
|----------|-----------------|-------------|-------------|
| Local DEV | Frontend en puerto 5173, Backend en 5000, PostgreSQL `siesa_agents_db` | Desarrollador | CORS `localhost:5173` configurado |
| QA | Backend con seeds cargados, BD limpia por suite de test | QA + Dev | Usar TestContainers para tests de integración — BD efímera |
| STAGING | N/A en MVP | — | Smoke tests manuales previo a release |

**Usuarios de prueba:** No aplica — sin autenticación en MVP.

### 5.2 Data Buckets por Feature (Agente Alquimista)

#### F2 — Gestión de Clientes

| Bucket | Descripción | Datos / Valores Ejemplo |
|--------|-------------|------------------------|
| `F2-VALID` | Caso nominal — cliente completo | `{ nombre: "Empresa ABC S.A.S.", nit: "900123456-1", telefono: "+57 1 2345678", ciudad: "Bogotá" }` |
| `F2-BOUNDARY-NOMBRE` | Nombre en límite de longitud | Nombre de 1 carácter, nombre de 255 caracteres, nombre de 256 caracteres (debe rechazar) |
| `F2-NEGATIVE-EMPTY` | Campos requeridos vacíos | Payload sin `nombre`, sin `nit`, sin `telefono`, sin `ciudad` — cada uno individualmente |
| `F2-NEGATIVE-NIT-DUP` | NIT duplicado | Crear cliente A con NIT `900123456-1`, luego crear cliente B con mismo NIT → esperar 409 |
| `F2-NEGATIVE-NIT-FORMAT` | NIT con formato inválido | `{ nit: "LETRAS" }`, `{ nit: "" }`, `{ nit: null }` |
| `F2-CONCURRENT` | Dos requests simultáneos con mismo NIT | 2 threads POST `/api/v1/clientes` con NIT idéntico — solo uno debe persistir con 201, el otro 409 |
| `F2-DELETE-WITH-CONTACTS` | Eliminar cliente con contactos asociados | Cliente con ≥ 3 contactos asociados; post-DELETE, verificar contactos existen con `clienteId = null` |
| `F2-SEARCH-PERFORMANCE` | 500 registros en BD para NFR1 | Seed de 500 clientes; medir tiempo de respuesta client-side filter |

#### F3 — Gestión de Contactos

| Bucket | Descripción | Datos / Valores Ejemplo |
|--------|-------------|------------------------|
| `F3-VALID` | Caso nominal — contacto completo | `{ nombre: "Juan Pérez", cargo: "Gerente Comercial", telefono: "+57 310 1234567", email: "juan.perez@empresa.com" }` |
| `F3-BOUNDARY-EMAIL` | Email en límite de validez | Email válido largo (254 chars), email sin `@`, email sin dominio, email con espacios |
| `F3-NEGATIVE-EMPTY` | Campos requeridos vacíos | Payload sin `nombre`, sin `cargo`, sin `telefono`, sin `email` |
| `F3-NEGATIVE-EMAIL-FORMAT` | Email formato inválido | `"notanemail"`, `"@sinusuario.com"`, `"sindominio@"` |
| `F3-ORPHAN-FILTER` | Contactos sin cliente para filtro "Sin cliente" | ≥ 5 contactos con `clienteId = null`, ≥ 5 con `clienteId` asignado |
| `F3-SEARCH-PERFORMANCE` | 1000 contactos en BD para NFR1 | Seed de 1000 contactos; medir tiempo de respuesta client-side filter |

#### F4 — Asociación Cliente↔Contacto (CRÍTICO — P1)

| Bucket | Descripción | Datos / Valores Ejemplo |
|--------|-------------|------------------------|
| `F4-ASSOCIATE` | Asociar contacto a cliente | Contacto huérfano (`clienteId = null`) + Cliente válido → `PUT /contactos/{id}/cliente { clienteId: uuid }` |
| `F4-DISASSOCIATE` | Desasociar contacto de cliente | Contacto asociado → `PUT /contactos/{id}/cliente { clienteId: null }` |
| `F4-REASSIGN` | Reasignar contacto a cliente diferente | Contacto en Cliente A → reasignar a Cliente B → verificar: desaparece de A, aparece en B |
| `F4-REASSIGN-QUERY-KEYS` | Validar invalidación de todas las query keys | Post-reasignación: `['contactos']`, `['contactos', { clienteId: oldId }]`, `['contactos', { clienteId: newId }]` deben refrescar |
| `F4-DELETE-CASCADE` | ON DELETE SET NULL — eliminar cliente | Cliente con 3 contactos → DELETE cliente → contactos subsisten con `clienteId = null` y aparecen en filtro "Sin cliente" |
| `F4-BIDIRECTIONAL-NAV` | Navegación bidireccional cliente↔contacto | Desde Cliente Detail → clic en contacto → `/contactos/:id` → botón volver → regresa a `/clientes/:id` |
| `F4-CONCURRENT-ASSOC` | Asociación concurrente | 2 requests simultáneos asignando el mismo contacto a 2 clientes distintos — solo el último debe persistir |
| `F4-NONEXISTENT-CLIENT` | Asociar a clienteId inexistente | `PUT /contactos/{id}/cliente { clienteId: "uuid-no-existe" }` → esperar 404 o 422 |

---

## ⚠️ SECCIÓN 6 — MATRIZ DE RIESGO PREDICTIVO

### Escala de Evaluación

| Valor | Probabilidad (P) | Impacto (I) |
|-------|-----------------|-------------|
| 1 | Muy baja (< 5%) | Cosmético |
| 2 | Baja (5-15%) | Menor / workaround disponible |
| 3 | Media (15-40%) | Moderado / funcionalidad degradada |
| 4 | Alta (40-70%) | Mayor / funcionalidad bloqueada |
| 5 | Muy alta (> 70%) | Crítico / pérdida de datos |

### Matriz por Feature

| ID | Feature | Riesgo Identificado | P | I | R=P×I | Nivel | Mitigación |
|----|---------|--------------------|----|---|-------|-------|-----------|
| R-F4-02 | Asociación/Reasignación | TanStack Query cache stale post-reasignación: `['contactos', { clienteId: oldId }]` no invalidado → cliente anterior muestra contacto fantasma (FR27) | 4 | 4 | **16** | 🔴 | Test unitario `useDeleteContacto` / `useUpdateCliente` verificando invalidación de TODAS las query keys; test de integración frontend (MSW) simulando reasignación completa |
| R-F4-01 | Asociación/Eliminación | `ON DELETE SET NULL` no configurado en EF Core `ContactoConfiguration` → al eliminar cliente, contactos se eliminan en cascada (violación FR23) | 3 | 5 | **15** | 🟡 | Test de integración backend con TestContainers: DELETE `/api/v1/clientes/{id}` → assert `contactos.cliente_id = NULL`; verificar `ContactoConfiguration.cs` tiene `.OnDelete(DeleteBehavior.SetNull)` |
| R-F1-01 | Foundation | CORS mal configurado en QA/STAGING → frontend no puede comunicarse con backend (bloquea todo) | 2 | 5 | **10** | 🟡 | Smoke test CORS preflight en ambiente QA; `GET /api/v1/clientes` desde origen `localhost:5173` debe retornar 200 con headers CORS correctos |
| R-F2-01 | Clientes | NIT duplicado: backend retorna error genérico en lugar de 409 → frontend muestra mensaje técnico (NFR6) | 3 | 3 | **9** | 🟡 | Test integración: POST `/api/v1/clientes` con NIT existente → assert status 409 + Problem Details con `title: "Conflict"` + mensaje en español |
| R-F4-03 | Asociación | Concurrencia — dos usuarios asignan el mismo contacto a clientes diferentes simultáneamente → estado inconsistente | 3 | 3 | **9** | 🟡 | Test de concurrencia: 2 requests paralelos `PUT /contactos/{id}/cliente` con diferentes `clienteId`; assert DB tiene exactamente 1 `clienteId` final |
| R-F3-01 | Contactos | Validación de email divergente entre Zod (frontend) y FluentValidation (backend) → backend acepta email que frontend rechazó | 2 | 3 | **6** | 🟢 | Test de contrato: mismo conjunto de emails inválidos probados en ambas capas; documentar regla de validación compartida |
| R-F2-02 | Clientes | IContactServiceAdapter no inicializado con `clienteId` correcto → ContactManager carga contactos de cliente equivocado | 2 | 3 | **6** | 🟢 | Test unitario `ClienteContactServiceAdapter` con mock de TanStack Query verificando que `clienteId` se inyecta correctamente |
| R-F1-02 | Foundation | `ApplySnakeCaseNaming()` no aplicado en `OnModelCreating` → columnas en PascalCase en PostgreSQL → queries fallando | 2 | 4 | **8** | 🟡 | Test de integración: crear y leer un registro de `clientes` via EF Core; verificar que las columnas en BD son `snake_case` |
| R-F3-02 | Contactos | Filtro "Sin cliente" usa param `sinCliente=true` pero backend no lo implementa → filtro sin efecto | 2 | 3 | **6** | 🟢 | Test integración: GET `/api/v1/contactos?sinCliente=true` → assert solo contactos con `cliente_id = null` |
| R-F2-03 | Clientes | Error en `ExceptionHandlingMiddleware` → stack trace expuesto en respuesta JSON (NFR6) | 2 | 4 | **8** | 🟡 | Test: provocar excepción no manejada → assert response body es Problem Details RFC 7807 sin `stackTrace` field |

### Resumen Riesgos Críticos (R > 15)

| ID | Feature | Riesgo | R | Acción Inmediata |
|----|---------|--------|---|-----------------|
| R-F4-02 | Asociación/Reasignación | TanStack Query cache stale post-reasignación — contacto fantasma visible en cliente anterior | **16** | Suite de tests de integración frontend (MSW) cubriendo TODOS los flujos de reasignación; verificar que `onSuccess` de cada mutation invalida las 3 query keys afectadas |

> **Regla automática activada:** R-F4-02 > 15 → Suite de Regresión de Feature F4 completa obligatoria antes de release.

---

## ✅ SECCIÓN 7 — CRITERIOS DE ENTRADA / SALIDA

### 7.1 Entry Criteria — Checklist DoR Sprint

| # | Criterio | Responsable | Estado |
|---|---------|-------------|--------|
| CE-01 | Build en `develop` compilando sin errores (frontend + backend) | Dev Lead | ⬜ |
| CE-02 | Tests unitarios del desarrollador ≥ 80% (xUnit + Vitest) | Desarrollador | ⬜ |
| CE-03 | Endpoints documentados en Scalar (`/scalar` accesible en QA) | Desarrollador | ⬜ |
| CE-04 | Migración inicial aplicada en BD QA (`siesa_agents_db` creada con snake_case columns) | DevOps / Dev | ⬜ |
| CE-05 | Seeds y Data Buckets disponibles en ambiente QA | QA + Dev | ⬜ |
| CE-06 | RBAC no aplica — confirmado en PRD (sin autenticación MVP) | PO | ✅ |
| CE-07 | Ambiente QA estable (health check backend + BD OK) | Dev | ⬜ |
| CE-08 | Historias Épicas 1-4 con criterios de aceptación aprobados (AC-E1 a AC-E4.7) | PO | ✅ |
| CE-09 | Análisis IA preliminar ejecutado (este documento — BMAD v3.0) | QA Lead | ✅ |
| CE-10 | `IContactServiceAdapter` integrado con `ClienteDetailView` y probado manualmente | Desarrollador | ⬜ |
| CE-11 | `ExceptionHandlingMiddleware` configurado y retornando Problem Details en DEV | Desarrollador | ⬜ |

### 7.2 Exit Criteria — Checklist DoD Sprint (Go / No-Go)

**✅ GO — Aprobado para Release si:**
- Todos los criterios "Bloquea = Sí" cumplidos
- 0 defectos P1 abiertos
- Defectos P2 ≤ 2 con workaround documentado y aprobación del PO
- Smoke tests en QA pasando al 100% (11 endpoints)
- R-F4-02 (R=16) con tests de mitigación pasando: suite completa de invalidación de query keys

**❌ NO-GO — Bloqueado si:**
| Condición No-Go | Acción Requerida |
|----------------|-----------------|
| ≥ 1 defecto P1 abierto | Hotfix inmediato + re-validación completa del flujo afectado |
| Cobertura backend < 75% en Application layer | Completar tests de handlers/validators faltantes |
| Test `ON DELETE SET NULL` fallando (R-F4-01) | Corregir `ContactoConfiguration.cs` → `.OnDelete(DeleteBehavior.SetNull)` |
| TanStack Query stale cache en reasignación (R-F4-02) | Auditar y corregir `onSuccess` de `useReassignContacto` — invalidar los 3 query keys |
| Stack trace expuesto en cualquier respuesta de error | Fix inmediato en `ExceptionHandlingMiddleware` + re-test NFR6 |
| CORS preflight fallando en QA | Fix en `Program.cs` + smoke test CORS |
| `GET /api/v1/clientes` con 500 registros > 1s P95 | Revisar query EF Core + client-side filter |

**Criterios de salida por feature:**
| # | Criterio | Meta | Tolerancia | Bloquea Release |
|---|---------|------|-----------|----------------|
| CS-01 | Tests unitarios backend pasando (xUnit) | 100% | 0 fallos | Sí |
| CS-02 | Tests unitarios frontend pasando (Vitest) | 100% | 0 fallos | Sí |
| CS-03 | Tests de integración backend pasando (TestContainers) | 100% | 0 fallos | Sí |
| CS-04 | Cobertura backend (Application layer) | ≥ 80% | Mínimo 75% | Sí (< 75%) |
| CS-05 | Cobertura frontend (hooks + adapters) | ≥ 75% | Mínimo 70% | Sí (< 70%) |
| CS-06 | Defectos P1 abiertos | 0 | 0 | Sí |
| CS-07 | Defectos P2 abiertos | 0 | ≤ 2 con workaround | No (con aprobación PO) |
| CS-08 | Performance P95 GET /api/v1/clientes (500 registros) | < 300ms backend | < 1s total con render | Sí |
| CS-09 | Performance P95 GET /api/v1/contactos (1000 registros) | < 300ms backend | < 1s total con render | Sí |
| CS-10 | RBAC validation suite | N/A MVP | — | No aplica |
| CS-11 | Smoke tests en QA (11 endpoints) | 100% | 0 fallos | Sí |
| CS-12 | `ON DELETE SET NULL` validado | 100% | 0 contactos perdidos | Sí |
| CS-13 | TanStack Query invalidation F4 (R-F4-02) | 100% | 0 cache stale | Sí |
| CS-14 | Problem Details RFC 7807 enforcement (NFR6) | 100% | 0 stack traces | Sí |
| CS-15 | NIT duplicado → 409 con mensaje en español | 100% | 0 mensajes técnicos | Sí |
| CS-16 | Navegación bidireccional ≤ 2 clics (NFR8) | 100% | — | Sí |
| CS-17 | Vista responsive mobile (NFR9) | 100% viewport 375px | — | Sí |

**Definición técnica de "Certificado" para Siesa-Agents MVP:**
> El sistema está certificado para release cuando: (a) todos los flujos CRUD de Cliente y Contacto completan sin error con datos válidos e inválidos según los Data Buckets §5.2; (b) los flujos de asociación/desasociación/reasignación de Épica 4 son correctos sin cache stale (R-F4-02 resuelto); (c) la eliminación de un cliente no elimina sus contactos (`ON DELETE SET NULL` verificado en integración); (d) ninguna respuesta HTTP expone stack traces (solo Problem Details RFC 7807); (e) cobertura de tests ≥ 80% backend / ≥ 75% frontend; (f) búsqueda con dataset máximo responde en < 1s P95.

---

> **Nota:** Documento vivo. Actualizar al cerrar cada épica o al identificar nuevos riesgos durante implementación.
> El historial de versiones vive en el repositorio Git.
