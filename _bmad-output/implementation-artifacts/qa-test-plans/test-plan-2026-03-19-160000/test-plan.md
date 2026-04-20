---
workflow: generate-test-plan
version: 1.0.0
methodology: BMAD v3.0 Spec-Driven Quality
generated_date: 2026-03-19T16:00:00Z
project_name: Siesa-Agents
source_documents:
  prd: null
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
**Generado:** 2026-03-19 | Asistido por IA (BMAD)

---

## 📋 SECCIÓN 1 — INFORMACIÓN GENERAL

```
Proyecto:              Siesa-Agents
Módulo/Microservicio:  CRM — Gestión de Clientes y Contactos (MVP completo)
Sprint / Ciclo:        Sprint Inicial — Épicas 1–4 (MVP v1.0)
Fecha del Plan:        2026-03-19
Autor:                 SiesaTeam — asistido por IA (BMAD v3.0)
Stack (primera vez documentado):
  Backend:             .NET 10 · C# Minimal API · EF Core 10 · FluentValidation · PostgreSQL 18
  Frontend:            Vite 7 · React 18 · TypeScript strict · TanStack Router/Query · Zustand 5 · Zod · React Hook Form
  UI Kit:              siesa-ui-kit (P0) + shadcn/ui fallback
  Testing Backend:     xUnit + Moq + TestContainers (PostgreSQL)
  Testing Frontend:    Vitest + React Testing Library + MSW
  CI/CD:               GitHub Actions · GitFlow · branch develop
  API Docs:            Scalar (no Swagger)
  Error Format:        Problem Details RFC 7807
```

---

## 🎯 SECCIÓN 2 — OBJETIVO & DoR / DoD

### 2.1 Objetivos de Negocio

- **OB-01** Garantizar que los equipos comerciales puedan registrar, buscar, editar y eliminar clientes de forma confiable, sin pérdida de datos ni errores bloqueantes.
- **OB-02** Verificar la integridad referencial Cliente↔Contacto: un contacto eliminado de un cliente persiste como huérfano (`clienteId = null`), nunca se pierde.
- **OB-03** Asegurar que los cambios (CRUD, reasignación, desasociación) sean visibles de forma inmediata para todos los usuarios sin recargar la página (FR27 — crítico de negocio).
- **OB-04** Confirmar que la búsqueda en tiempo real responde en < 1s con los volúmenes máximos del MVP (500 clientes / 1000 contactos), garantizando la productividad del equipo.
- **OB-05** Validar que no se expone información técnica (stack traces, errores SQL) en ningún response de error — cumplimiento de estándar de seguridad corporativo (NFR6).

### 2.2 Criterios de Calidad

| Criterio | Meta | Tolerancia |
|----------|------|-----------|
| Cobertura backend (Command/Query Handlers + Validators) | ≥ 80% | Mínimo 75% |
| Cobertura frontend (Hooks + Componentes + Adapter) | ≥ 75% | Mínimo 70% |
| Defectos P1 en producción | 0 | 0 (sin tolerancia) |
| Defectos P2 abiertos al release | 0 | ≤ 2 con workaround aprobado por PO |
| Latencia búsqueda (client-side, 500/1000 registros) | < 1s (NFR1) | < 1.5s |
| Latencia CRUD UI update | < 2s (NFR2) | < 3s |
| Stack traces expuestos en responses | 0 | 0 |
| Contacts preservados al eliminar cliente | 100% | 0 pérdidas |

### 2.3 Checklist DoR — Definition of Ready

> ✅ = Cumple | ⚠️ = Parcial | ❌ = Bloquea inicio de QA

- [ ] ✅ Las 4 épicas tienen criterios de aceptación definidos y documentados en los archivos de épicas
- [ ] ✅ Arquitectura técnica aprobada y documentada (architecture.md — status: complete)
- [ ] ⚠️ Endpoints documentados en Scalar/OpenAPI — documentados en arquitectura, pendiente configurar en ambiente QA
- [ ] ⚠️ Datos de prueba (seeds) identificados — Data Buckets definidos en Sección 5, pendiente carga en ambiente
- [ ] ✅ Dependencias inter-servicio mapeadas — monolítico single-service, sin dependencias externas en MVP
- [ ] ✅ Sin RBAC en MVP (PRD explícito: sin autenticación)
- [ ] ✅ Análisis IA preliminar ejecutado (BMAD) — este documento
- [ ] ⚠️ Ambiente QA con PostgreSQL disponible y migraciones aplicadas — pendiente verificación

### 2.4 Checklist DoD — Definition of Done

- [ ] Código implementado con code review aprobado
- [ ] Tests unitarios ≥ 80% cobertura pasando en CI
- [ ] Tests de integración (xUnit + TestContainers) pasando — incluyendo endpoints de asociación
- [ ] 0 defectos P1/bloqueantes abiertos
- [ ] Endpoints documentados en Scalar (`/scalar` accesible en dev y QA)
- [ ] Pipeline CI/CD verde en branch `develop-santidev-ssancheze-epics-2-3`
- [ ] Validación funcional en ambiente QA completada contra los ACs de cada épica
- [ ] NFR1 verificado: búsqueda < 1s con dataset completo (seed 500 clientes + 1000 contactos)
- [ ] NFR2 verificado: CRUD UI update < 2s medido end-to-end
- [ ] NFR6 verificado: 0 stack traces en ningún response de error
- [ ] Integridad referencial verificada: ON DELETE SET NULL funciona correctamente en cascada
- [ ] Análisis IA post-sprint ejecutado (BMAD)

---

## 📐 SECCIÓN 3 — ALCANCE DE PRUEBAS

### 3.1 Features Incluidas

| # | Feature | Épica | FRs cubiertos | Mutabilidad | Riesgo | Prioridad QA |
|---|---------|-------|---------------|-------------|--------|-------------|
| F1 | Project Foundation & Application Shell | Épica 1 | FR28, FR29, FR30 | Media | Bajo | P3 |
| F2 | Gestión de Clientes (CRUD + Búsqueda) | Épica 2 | FR1–FR8 | Alta | Medio | P1 |
| F3 | Gestión de Contactos (CRUD + Búsqueda) | Épica 3 | FR9–FR18 | Alta | Medio | P1 |
| F4 | Asociación Cliente↔Contacto & Calidad de Datos | Épica 4 | FR17–FR27 | Muy Alta | **Alto** | P1 |

### 3.2 Fuera de Alcance

| Elemento Excluido | Justificación |
|------------------|---------------|
| Autenticación / JWT / RBAC | PRD explícito: fuera de scope MVP |
| Paginación server-side | NFR10: 500/1000 registros — client-side filter suficiente |
| WebSockets / Server-Sent Events | PRD: REST API solamente, FR27 cubierto por TanStack Query invalidation |
| Redis caching | Arquitectura: deferred post-MVP |
| Exportación de datos | Fuera de scope MVP |
| CI/CD pipeline | Deferred post-MVP según arquitectura |
| HTTPS (producción) | NFR4: configuración de despliegue, no validable en MVP local |
| Compatibilidad IE / Safari antiguo | PRD: Chrome, Firefox, Edge últimas 2 versiones |
| Multi-tenancy | No aplica en MVP |

---

## 🛠️ SECCIÓN 4 — ESTRATEGIA DE PRUEBAS

### 4.1 Tipos de Prueba

| Tipo | Herramienta | Alcance | Cobertura Objetivo | Automatización |
|------|------------|---------|-------------------|---------------|
| Unitarias Backend | xUnit + Moq | Validators (FluentValidation), Command/Query Handlers, Domain entities | ≥ 80% | 100% |
| Unitarias Frontend | Vitest + RTL | Hooks TanStack Query, `ClienteContactServiceAdapter`, Zod schemas, componentes | ≥ 75% | 100% |
| Integración Backend | xUnit + TestContainers (PostgreSQL) | Endpoints REST completos, EF Core + migrations, ON DELETE SET NULL | ≥ 70% | 100% |
| Integración Frontend | Vitest + MSW | TanStack Query cache invalidation, query keys canónicas, mutaciones | ≥ 65% | 100% |
| Smoke Tests | xUnit + HttpClient | 11 endpoints críticos post-deploy | 100% endpoints | 100% |
| Regresión | Suite completa (unit + integration) | Pre-release épica a épica | 100% | 100% |
| Performance | `console.time` / Vitest benchmark | Client-side filter sobre 500 clientes + 1000 contactos | P95 < 1s (NFR1) | Semi-auto |
| Exploratoria | Sesiones manuales guiadas | F4: flujos de reasignación, navegación bidireccional, edge cases huérfanos | F4 completo | Manual |
| Contract Tests | OpenAPI schema vs implementación | 11 endpoints — paths, verbos, status codes, Problem Details format | 100% endpoints | 100% |

> **Nota:** Sin pruebas de seguridad RBAC ni SAST obligatorias en MVP (sin autenticación). Se recomienda como deferred post-MVP.

### 4.2 Técnicas de Diseño Aplicadas

| Técnica | Features Objetivo | Observación |
|---------|-----------------|-------------|
| Partición de Equivalencia | F2, F3: CRUD validaciones | Particiones: válido / requerido vacío / formato inválido / duplicado NIT o email |
| Valores Límite | F2 (500 clientes), F3 (1000 contactos) | Búsqueda con dataset en el límite máximo del MVP |
| Tabla de Decisión | F4: Estado de asociación | contacto sin cliente / con cliente / reasignación / cliente eliminado → 4 estados de transición |
| Transición de Estados | F4: `clienteId` (null → uuid → null → uuid) | Ciclo completo: huérfano → asociado → desasociado → reasignado |
| Error Guessing | F2, F3, F4 | NIT duplicado, email duplicado, clienteId inválido (uuid inexistente), payload `{ clienteId: null }` |
| Análisis de Cache Stale | F4 | TanStack Query keys `['contactos', {clienteId}]`: invalidación incompleta post-reasignación |
| Boundary Testing Relacional | F4 | DELETE cliente con N contactos asociados → todos devienen `clienteId = null` |

### 4.3 Integración Human–AI (BMAD)

**Nivel de uso de IA en el sprint:**

| Nivel | % Ref. | Aplica | Justificación | Responsable Validación |
|-------|--------|--------|---------------|----------------------|
| Manual | 0% | ❌ | | |
| Asistido | 30% | ❌ | | |
| Diseño IA validado por QA | 60% | ✅ | Este plan generado por BMAD, validado por QA Lead | QA Lead SiesaTeam |
| IA + análisis predictivo | 90% | Parcial | Matriz de riesgo predictivo incluida | QA Lead SiesaTeam |

**Agentes IA activados:**

| Agente IA | Utilizado | Fase | Impacto | Observaciones |
|-----------|----------|------|---------|---------------|
| Analizador Funcional | ✅ | Pre-construcción | Alto | Cobertura 30 FRs + 11 NFRs verificada |
| Generador de Casos de Prueba | ✅ | Pre-construcción | Alto | Escenarios positivos/negativos/borde por épica |
| Analizador Predictivo de Riesgo | ✅ | Pre-construcción | Alto | Matriz de riesgo Sección 6 |
| Validador Inteligente de Datos (Alquimista) | ✅ | Ejecución | Medio | Data Buckets Sección 5.2 |
| Explorador Inteligente | ✅ | Ejecución | Medio | Arquetipos de usuario: equipo comercial |
| Clasificador Automático de Defectos | ❌ | Post-sprint | — | Activar al cierre de sprint |
| Analizador Post-Sprint | ❌ | Certificación | — | Activar al finalizar implementación |

---

## 🌐 SECCIÓN 5 — AMBIENTE & DATOS DE PRUEBA

### 5.1 Ambiente Requerido para el Sprint

| Ambiente | Estado Requerido | Responsable | Observación |
|----------|-----------------|-------------|-------------|
| Local Dev | Frontend en 5173, Backend en 5000, PostgreSQL local | Dev | CORS configurado para localhost:5173 |
| QA | Backend + PostgreSQL con seeds completos cargados | DevOps + QA | Seed: 500 clientes + 1000 contactos + mezcla asignados/huérfanos |
| — | Sin STAGING requerido en MVP (no hay RBAC ni deploy pipeline) | — | Deferred post-MVP |

**Usuarios de prueba:** Sin roles en MVP (sin autenticación). Acceso directo a la aplicación.

**Pre-condición crítica de ambiente:**
```sql
-- Verificar que ON DELETE SET NULL esté configurado:
SELECT constraint_name, delete_rule
FROM information_schema.referential_constraints
WHERE constraint_name = 'fk_contactos_clientes';
-- Expected: DELETE_RULE = 'SET NULL'

-- Verificar unique constraint NIT:
SELECT indexname FROM pg_indexes
WHERE tablename = 'clientes' AND indexname = 'uk_clientes_nit';
```

### 5.2 Data Buckets por Feature (Agente Alquimista)

**[F2 — Gestión de Clientes]**

| Bucket | Descripción | Datos / Valores Ejemplo |
|--------|-------------|------------------------|
| `F2-VALID` | Cliente nominal válido | `nombre="Empresa ABC S.A."`, `nit="900123456-1"`, `telefono="+57 301 234 5678"`, `ciudad="Bogotá"` |
| `F2-NIT-BOUNDARY` | NIT en formatos válidos e inválidos | Válido: `"123456789-0"` / Inválido: `""`, `"NIT-INVALIDO"`, `null` |
| `F2-NIT-DUPLICATE` | NIT ya registrado | Crear 2 clientes con `nit="900123456-1"` → backend debe retornar 409 |
| `F2-REQUIRED-EMPTY` | Campos requeridos vacíos | Enviar `nombre=""` o `ciudad=null` → inline errors en form, no submit |
| `F2-SEARCH-PERF` | Performance búsqueda | 500 clientes en DB, buscar por nombre "Empresa" → respuesta < 1s |
| `F2-DELETE-WITH-CONTACTS` | Eliminar cliente con contactos | Cliente con ≥ 3 contactos asociados → post-delete: contactos existen con `clienteId=null` |
| `F2-DELETE-EMPTY` | Eliminar cliente sin contactos | Cliente con 0 contactos → eliminación limpia |

**[F3 — Gestión de Contactos]**

| Bucket | Descripción | Datos / Valores Ejemplo |
|--------|-------------|------------------------|
| `F3-VALID` | Contacto nominal válido | `nombre="Juan Pérez"`, `cargo="Gerente Comercial"`, `telefono="+57 312 000 0000"`, `email="juan@empresa.com"` |
| `F3-EMAIL-BOUNDARY` | Email válidos e inválidos | Válido: `"user@domain.co"` / Inválido: `"noatsign"`, `""`, `"user@"` |
| `F3-REQUIRED-EMPTY` | Campos requeridos vacíos | Enviar `email=""` o `nombre=null` → error inline, no submit |
| `F3-SEARCH-PERF` | Performance búsqueda 1000 registros | 1000 contactos en DB, buscar por email "@empresa" → < 1s |
| `F3-ORPHAN-LIST` | Contactos sin cliente | 20 contactos con `clienteId=null`, 30 con `clienteId≠null` → filtro "Sin cliente" muestra 20 |

**[F4 — Asociación Cliente↔Contacto]**

| Bucket | Descripción | Datos / Valores Ejemplo |
|--------|-------------|------------------------|
| `F4-ASSOCIATE` | Asociar contacto a cliente | `PUT /api/v1/contactos/{id}/cliente` body: `{ "clienteId": "uuid-valido" }` → 200 OK |
| `F4-DISASSOCIATE` | Desasociar contacto (null) | `PUT /api/v1/contactos/{id}/cliente` body: `{ "clienteId": null }` → 200 OK, contacto queda huérfano |
| `F4-REASSIGN` | Reasignar de cliente A → cliente B | Contacto en Cliente A → `PUT` con `clienteId=B` → desaparece de A, aparece en B |
| `F4-INVALID-CLIENT-ID` | clienteId inexistente | `PUT` con `clienteId="uuid-no-existe"` → 404 Not Found (Problem Details) |
| `F4-CACHE-INVALIDATION` | Verificar invalidación correcta de query keys | Post-reasignación: `['contactos', {clienteId: oldId}]` y `['contactos', {clienteId: newId}]` ambos invalidados |
| `F4-DELETE-CASCADE` | Delete cliente → contactos huérfanos | DELETE cliente con 5 contactos → `GET /api/v1/contactos?sinCliente=true` muestra esos 5 |
| `F4-BIDIRECTIONAL-NAV` | Navegación bidireccional | Desde `/clientes/:id` → clic contacto → `/contactos/:id` → clic cliente → `/clientes/:id` en ≤ 2 clics |

**[F1 — Foundation]**

| Bucket | Descripción | Datos / Valores Ejemplo |
|--------|-------------|------------------------|
| `F1-ROUTING` | Rutas directas accesibles | Acceder directamente a `/clientes`, `/contactos`, `/clientes/uuid-valido`, `/contactos/uuid-valido` |
| `F1-CORS` | CORS desde frontend | Request `OPTIONS` desde `localhost:5173` → headers CORS en response |
| `F1-ERROR-FORMAT` | Error format Problem Details | Trigger error (404, 409, 500) → response tiene `status`, `title`, `detail`, sin `stackTrace` |

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
| R-F1-01 | Foundation | TanStack Router mal configurado → rutas no matchean o redireccionan incorrectamente | 3 | 3 | 9 | 🟡 | Test de routing para cada ruta definida + deep link directo |
| R-F1-02 | Foundation | CORS no configurado → frontend no puede llamar al backend en desarrollo | 3 | 4 | 12 | 🟡 | Test explícito de OPTIONS preflight desde localhost:5173 |
| R-F1-03 | Foundation | `ApplySnakeCaseNaming()` no aplicado → columnas en PascalCase en PostgreSQL | 2 | 3 | 6 | 🟢 | Verificar con migration y `SHOW column_name` en tabla |
| R-F1-04 | Foundation | Problem Details no configurado → stack traces en response de error | 3 | 3 | 9 | 🟡 | Test de error handling: trigger 404 + 500, verificar ausencia de `stackTrace` |
| R-F2-01 | Clientes | NIT duplicado no validado en DB (sin `uk_clientes_nit`) → integridad comprometida | 2 | 4 | 8 | 🟡 | Test de creación con NIT duplicado → esperar 409 |
| R-F2-02 | Clientes | Validación frontend bypasseable → datos inválidos llegan al backend | 2 | 3 | 6 | 🟢 | Test Zod schema + test directo al endpoint con payload inválido |
| R-F2-03 | Clientes | Optimistic update (TanStack Query) no revierte en caso de error → UI inconsistente | 3 | 3 | 9 | 🟡 | Test: forzar error en mutation → verificar rollback de UI |
| R-F2-04 | Clientes | Invalidación de query key incorrecta post-CRUD → lista stale para otros usuarios | 3 | 3 | 9 | 🟡 | Test: después de create/update/delete → `['clientes']` invalidado y re-fetched |
| R-F3-01 | Contactos | Client-side filter degrada con 1000 registros > 1s | 2 | 3 | 6 | 🟢 | Benchmark con dataset completo; useMemo verificado |
| R-F3-02 | Contactos | queryKey `['contactos']` vs `['contactos', {clienteId}]` — confusión de alcance | 3 | 3 | 9 | 🟡 | Test: llamada a useContactos() vs useContactosByCliente(id) — resultados distintos |
| R-F4-01 | Asociación | `PUT /contactos/{id}/cliente` con `{ clienteId: null }` → backend no acepta null → desasociación falla | 4 | 4 | 16 | 🔴 | Test explícito con body `{ "clienteId": null }` → 200 + contacto huérfano verificado en DB |
| R-F4-02 | Asociación | Invalidación de query keys incompleta tras reasignación → lista del cliente anterior no actualiza | 4 | 4 | 16 | 🔴 | Test: reasignar contacto A→B → verificar que `['contactos',{clienteId:A}]` AND `['contactos',{clienteId:B}]` ambos invalidados |
| R-F4-03 | Asociación | `ClienteContactServiceAdapter` no implementa `IContactServiceAdapter` correctamente → ContactManager no carga | 3 | 4 | 12 | 🟡 | Test de integración del adapter con MSW mock; test visual de ContactManager |
| R-F4-04 | Asociación | ON DELETE SET NULL no configurado en FK → DELETE cliente elimina contactos (pérdida de datos) | 2 | 5 | 10 | 🟡 | Test de integración: DELETE cliente → `SELECT * FROM contactos WHERE id IN (...)` retorna registros con `cliente_id=null` |
| R-F4-05 | Asociación | `clienteId` inexistente en `PUT /contactos/{id}/cliente` → 500 sin manejo → expone error interno | 3 | 3 | 9 | 🟡 | Test con UUID válido pero inexistente → esperar 404 Problem Details, no 500 |
| R-F4-06 | Asociación | Navegación bidireccional > 2 clics para llegar a contacto desde cliente | 2 | 2 | 4 | 🟢 | Test exploratorio manual: contar clics en flujo completo |

### Resumen Riesgos Críticos (R > 15)

| ID | Feature | Riesgo | R | Acción Inmediata |
|----|---------|--------|---|-----------------|
| R-F4-01 | F4 — Asociación | `PUT /contactos/{id}/cliente` con `clienteId: null` no manejado → desasociación imposible | 16 🔴 | Test de integración backend obligatorio antes de deploy; verificar que el endpoint acepta `null` y actualiza `cliente_id = NULL` en DB |
| R-F4-02 | F4 — Asociación | Invalidación incompleta de query keys tras reasignación → datos stale visibles | 16 🔴 | Test de integración frontend con MSW: verificar que `invalidateQueries` se llama para `oldId` Y `newId` en `useDeleteContacto` o `usePutContactoCliente` |

> **Regla automática activada:** R > 15 → Suite de Regresión Completa en F4. Los tests de R-F4-01 y R-F4-02 son **bloqueantes para release**.

---

## ✅ SECCIÓN 7 — CRITERIOS DE ENTRADA / SALIDA

### 7.1 Entry Criteria — Checklist DoR Sprint

| # | Criterio | Responsable | Estado |
|---|---------|-------------|--------|
| CE-01 | Build en `develop-santidev-ssancheze-epics-2-3` compilando sin errores (frontend + backend) | Dev Lead | ⬜ |
| CE-02 | Tests unitarios del desarrollador ≥ 80% | Desarrollador | ⬜ |
| CE-03 | Endpoints documentados en Scalar (`/scalar` accesible) | Desarrollador | ⬜ |
| CE-04 | Migración inicial aplicada en ambiente QA — tabla `clientes` y `contactos` con índices y FK | DevOps | ⬜ |
| CE-05 | Seeds cargados en QA: ≥ 500 clientes, ≥ 1000 contactos, mix de asociados y huérfanos | QA + Dev | ⬜ |
| CE-06 | `uk_clientes_nit` y `fk_contactos_clientes ON DELETE SET NULL` verificados en DB QA | DevOps | ⬜ |
| CE-07 | Ambiente QA estable: frontend en puerto 5173, backend en 5000, PostgreSQL accesible | DevOps | ⬜ |
| CE-08 | Las 4 épicas con criterios de aceptación aprobados por PO | PO | ⬜ |
| CE-09 | Análisis IA preliminar ejecutado (BMAD) — este documento | QA Lead | ✅ |
| CE-10 | CORS verificado: `localhost:5173` en `AllowedOrigins` de `appsettings.Development.json` | Dev | ⬜ |

### 7.2 Exit Criteria — Checklist DoD Sprint (Go / No-Go)

**✅ GO — Aprobado para Release si:**
- Todos los criterios marcados "Bloquea = Sí" cumplidos
- 0 defectos P1 abiertos
- Defectos P2 ≤ 2 con workaround documentado y aprobación del PO
- Smoke tests 100% pasando (los 11 endpoints)
- **R-F4-01 y R-F4-02 con tests específicos pasando** (desasociación + invalidación de cache)
- ON DELETE SET NULL verificado en integración con TestContainers

**❌ NO-GO — Bloqueado si:**

| Condición No-Go | Acción Requerida |
|----------------|-----------------|
| ≥ 1 defecto P1 abierto | Hotfix inmediato + re-validación completa |
| Cobertura backend < 75% | Completar tests faltantes en handlers y validators |
| `PUT /contactos/{id}/cliente` con `clienteId: null` devuelve error | Fix del endpoint antes de cualquier release |
| Invalidación de query keys incompleta (R-F4-02) — detectada por test | Fix de `invalidateQueries` en hooks de mutación |
| ON DELETE SET NULL no configurado — contactos eliminados al borrar cliente | Fix de migración + retest de integridad referencial |
| Stack traces en cualquier response de error (NFR6) | Fix de `ExceptionHandlingMiddleware` |
| Búsqueda > 1.5s con dataset completo (NFR1 degradado) | Revisar `useMemo` filter o reducir payload |
| Smoke tests < 100% (algún endpoint no responde) | Diagnóstico y fix antes de deploy |

**Criterios de salida por feature:**

| # | Criterio | Meta | Tolerancia | Bloquea Release |
|---|---------|------|-----------|----------------|
| CS-01 | Tests unitarios backend pasando | 100% | 0 fallos | Sí |
| CS-02 | Tests unitarios frontend pasando | 100% | 0 fallos | Sí |
| CS-03 | Tests de integración backend (TestContainers) pasando | 100% | 0 fallos | Sí |
| CS-04 | Tests de integración frontend (MSW + TanStack Query) pasando | 100% | 0 fallos | Sí |
| CS-05 | Cobertura backend | ≥ 80% | Mínimo 75% | Sí (si < 75%) |
| CS-06 | Cobertura frontend | ≥ 75% | Mínimo 70% | Sí (si < 70%) |
| CS-07 | Defectos P1 abiertos | 0 | 0 | Sí |
| CS-08 | Defectos P2 abiertos | 0 | ≤ 2 con workaround | No (con aprobación PO) |
| CS-09 | Performance búsqueda (500 clientes + 1000 contactos) P95 | < 1s | < 1.5s | No (con documentación) |
| CS-10 | CRUD UI update P95 | < 2s | < 3s | No (con documentación) |
| CS-11 | 0 stack traces en responses de error | 100% | 0 excepciones | Sí |
| CS-12 | Integridad referencial: ON DELETE SET NULL | 100% contactos preservados | 0 pérdidas | Sí |
| CS-13 | R-F4-01: Desasociación con `clienteId: null` | Test pasando | 0 fallos | Sí |
| CS-14 | R-F4-02: Invalidación completa de query keys post-reasignación | Test pasando | 0 fallos | Sí |
| CS-15 | Smoke tests — 11 endpoints | 100% | 0 fallos | Sí |
| CS-16 | Contract tests — 11 endpoints (status codes + Problem Details format) | 100% | 0 breaking changes | Sí |

**Definición técnica de "Certificado":**

> El proyecto Siesa-Agents MVP se considera **certificado para release** cuando: (1) la suite de tests unitarios + integración compila y pasa al 100% en CI/CD en el branch `develop-santidev-ssancheze-epics-2-3`, con cobertura backend ≥ 80% y frontend ≥ 75%; (2) los 11 endpoints REST responden con los status codes correctos y formato Problem Details RFC 7807 sin stack traces; (3) los tests específicos de riesgo crítico R-F4-01 (desasociación vía `clienteId: null`) y R-F4-02 (invalidación de query keys completa tras reasignación) pasan exitosamente; (4) la integridad referencial `ON DELETE SET NULL` está verificada mediante test de integración con TestContainers; (5) la búsqueda client-side responde en < 1.5s con el dataset completo del MVP; y (6) 0 defectos P1 abiertos al momento del corte de release.

---

> **Nota:** Documento vivo — actualizar al completar cada épica o al identificar nuevos riesgos durante implementación.
> El historial de versiones vive en el repositorio Git.
