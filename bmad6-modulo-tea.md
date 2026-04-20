# Módulo TEA — BMAD V6

> Documentación completa del agente TEA (Master Test Architect) en el framework BMAD V6.

---

## 1. Contexto y Propósito

### ¿Qué hace?

TEA es el agente de **arquitectura y estrategia de testing** dentro de BMAD V6. No escribe tests por defecto — diseña, planifica y gobierna la calidad. Sus responsabilidades principales son:

| Responsabilidad | Cómo ejecutarla |
|----------------|-----------------|
| Definir la **estrategia de testing** adecuada para el riesgo de cada cambio | `[TD]` Test Design → modo **epic-level** |
| Generar tests de aceptación **antes** de la implementación (ATDD) | `[AT]` ATDD |
| Establecer y hacer cumplir **quality gates** con criterios objetivos | `[TR]` Trace + Quality Gate |
| Auditar y revisar la calidad de tests existentes | `[RV]` Test Review |
| Evaluar **non-functional requirements** (performance, seguridad, reliability) | `[NR]` NFR Assessment |
| Scaffoldar frameworks de testing e infraestructura CI/CD desde cero | `[TF]` Framework Setup + `[CI]` CI/CD Scaffold |

### ¿Cuándo usarlo?

| Momento | Workflow recomendado | Comando directo |
|---------|---------------------|-----------------|
| Al iniciar un proyecto o módulo nuevo | `[TF]` Framework Setup | `/bmad:bmm:workflows:testarch-framework` |
| Antes de implementar una historia o feature | `[AT]` ATDD | `/bmad:bmm:workflows:testarch-atdd` |
| Después de implementar, para aumentar cobertura | `[TA]` Automate | `/bmad:bmm:workflows:testarch-automate` |
| Al planificar el testing de una épica completa | `[TD]` Test Design | `/bmad:bmm:workflows:testarch-test-design` |
| Antes de un release para verificar cobertura | `[TR]` Trace + Quality Gate | `/bmad:bmm:workflows:testarch-trace` |
| Para auditar calidad de tests existentes | `[RV]` Test Review | `/bmad:bmm:workflows:testarch-test-review` |
| Para validar performance, seguridad o reliability | `[NR]` NFR Assessment | `/bmad:bmm:workflows:testarch-nfr` |
| Al configurar o mejorar el pipeline de CI/CD | `[CI]` CI/CD Scaffold | `/bmad:bmm:workflows:testarch-ci` |

TEA actúa como el **guardián de calidad** del ciclo de desarrollo: se invoca al inicio (definir qué testear), durante (ATDD, test design) y al final (review, gate, NFR) de cada iteración.

---

## 2. Descripción General

| Campo | Valor |
|-------|-------|
| **Nombre del Agente** | TEA |
| **Persona** | Murat |
| **Título** | Master Test Architect |
| **Emoji** | 🧪 |
| **Versión BMAD** | 6.0.0-alpha.22 |
| **Fecha de build** | 2026-01-05T18:45:33.361Z |

TEA es el agente de arquitectura de testing en BMAD V6. Está especializado en CI/CD, marcos de trabajo de automatización y quality gates escalables. Su filosofía central es el **risk-based testing**: la profundidad del testing escala con el impacto del cambio.

---

## 3. Filosofía y Principios

### Estilo de Comunicación
- Combina datos con intuición ("strong opinions, weakly held")
- Habla en términos de *risk calculations* e *impact assessments*
- Orientado a decisiones basadas en evidencia

### Principios Clave
1. **Risk-based testing** — la profundidad escala con el impacto
2. **Quality gates respaldados por datos**
3. **Los tests reflejan patrones de uso reales**
4. **Flakiness es critical technical debt** — se trata inmediatamente
5. **Tests first, AI implements, suite validates** — ATDD sobre TDD reactivo
6. **Calcular risk vs value** para cada decisión de testing

---

## 3. Ubicaciones de Archivos

| Componente | Ruta |
|-----------|------|
| Definición del Agente | `bmad/bmm/agents/tea.md` |
| Configuración del módulo BMM | `bmad/bmm/config.yaml` |
| Índice de conocimiento | `bmad/bmm/testarch/tea-index.csv` |
| Workflows | `bmad/bmm/workflows/testarch/` |
| Fragmentos de conocimiento | `bmad/bmm/testarch/knowledge/` |
| Personalización | `bmad/_config/agents/bmm-tea.customize.yaml` |
| Comando Claude | `.claude/commands/bmad/bmm/agents/tea.md` |
| Reglas Cursor | `.cursor/rules/bmad/bmm/agents/tea.mdc` |
| Comando Gemini | `.gemini/commands/bmad-agent-bmm-tea.toml` |
| Agente GitHub | `.github/agents/bmd-custom-bmm-tea.agent.md` |

---

## 4. Menú del Agente

| Código | Descripción |
|--------|-------------|
| `[MH]` | Redisplay Menu Help |
| `[CH]` | Chat libre con el agente |
| `[WS]` | Obtener workflow status |
| `[TF]` | Inicializar arquitectura de test framework production-ready |
| `[AT]` | Generar E2E tests antes de implementación (ATDD) |
| `[TA]` | Generar test automation comprensivo |
| `[TD]` | Crear test scenarios comprensivos (Test Design) |
| `[TR]` | Mapear requirements a tests y decisión de quality gate |
| `[NR]` | Validar non-functional requirements |
| `[CI]` | Scaffold CI/CD quality pipeline |
| `[RV]` | Review de calidad de tests usando knowledge base |
| `[PM]` | Iniciar Party Mode |
| `[DA]` | Dismiss Agent |

---

## 5. Workflows de Testing

Todos los workflows residen en: `bmad/bmm/workflows/testarch/`

---

### 6.1 Framework (`framework/`)

**Código de menú:** `[TF]`
**Versión:** 4.0 (BMad v6)
**Propósito:** Inicializar infraestructura de testing completa y production-ready.

**Archivos:**
- `workflow.yaml` — configuración del workflow
- `instructions.md` — instrucciones detalladas de ejecución
- `checklist.md` — validación de completitud

**Resumen:** Scaffolda un framework completo con Playwright o Cypress. Cubre estructura de directorios, configuración de entornos, timeout standards y patrones de fixtures.

**Outputs:**

| Archivo | Propósito |
|---|---|
| `playwright.config.ts` / `cypress.config.ts` | Configuración del framework con timeouts, reporters HTML + JUnit, y proyectos |
| `tests/e2e/`, `tests/api/`, `tests/support/` | Estructura base de directorios de tests |
| `tests/support/fixtures/` | Fixtures base con patrón `mergeTests` |
| `tests/support/factories/` | Data factories con faker y auto-cleanup |
| `.env.example` | Variables de entorno requeridas (`TEST_ENV`, `BASE_URL`, `API_URL`) |
| `.nvmrc` | Versión de Node recomendada |
| `tests/README.md` | Instrucciones de setup, comandos de ejecución y guía de arquitectura |

| Nivel | ¿Aplica? |
|---|---|
| Sistema / Proyecto | ✅ Una vez al inicio |
| Épica | ❌ |
| Historia | ❌ |
| Release | ❌ |

---

### 6.2 ATDD (`atdd/`)

**Código de menú:** `[AT]`
**Propósito:** Generar tests de aceptación fallidos ANTES de la implementación (ciclo red-green-refactor de TDD).

**Archivos:**
- `workflow.yaml`
- `instructions.md`
- `checklist.md`
- `atdd-checklist-template.md`

**Resumen:** Crea cobertura de tests comprensiva en los niveles apropiados (unit, integration, E2E). Los tests definen el comportamiento esperado antes de escribir una sola línea de código de producción.

**Outputs:**

| Archivo | Propósito |
|---|---|
| `tests/e2e/{feature}.spec.ts` | Tests E2E del flujo completo del usuario — deben fallar al crearlos |
| `tests/api/{feature}.api.spec.ts` | Tests de contrato de API — validan request/response |
| `tests/component/{Component}.test.tsx` | Tests de componentes UI en aislamiento |
| `tests/support/factories/{entity}.factory.ts` | Factories con faker para generar datos de prueba |
| `tests/support/fixtures/` | Fixtures con auto-cleanup para el contexto de la historia |
| `_bmad-output/atdd-checklist-{story_id}.md` | Checklist de implementación: qué tests se crearon, qué fixtures, qué `data-testid` se necesitan en el HTML, y el workflow red→green→refactor |

| Nivel | ¿Aplica? |
|---|---|
| Sistema / Proyecto | ❌ |
| Épica | ❌ |
| Historia | ✅ Una vez por historia, antes de implementar |
| Release | ❌ |

---

### 6.3 Automate (`automate/`)

**Código de menú:** `[TA]`
**Propósito:** Expandir cobertura de automatización después de la implementación.

**Archivos:**
- `workflow.yaml`
- `instructions.md`
- `checklist.md`

**Resumen:** Analiza el codebase existente y genera un test suite comprensivo. Complementa ATDD cuando ya existe código sin tests.

**Outputs:**

| Archivo | Propósito |
|---|---|
| `tests/e2e/{feature}.spec.ts` | Tests E2E nuevos con cobertura de P0/P1 |
| `tests/api/{feature}.api.spec.ts` | Tests de API para lógica de negocio compleja |
| `tests/component/{Component}.test.tsx` | Tests de componentes para edge cases de UI |
| `tests/unit/{module}.test.ts` | Tests unitarios para lógica pura |
| `tests/support/fixtures/` | Fixtures nuevas o mejoradas con auto-cleanup |
| `tests/support/factories/` | Factories nuevas o mejoradas |
| `_bmad-output/automation-summary.md` | Resumen de cuántos tests se crearon por nivel (P0/P1/P2/P3) y gaps que quedaron pendientes |

| Nivel | ¿Aplica? |
|---|---|
| Sistema / Proyecto | ✅ Cobertura completa de todo el codebase |
| Épica | ✅ Cobertura de todo lo implementado en la épica |
| Historia | ✅ Solo flujos críticos de la historia recién implementada |
| Release | ❌ |

---

### 6.4 Test Design (`test-design/`)

**Código de menú:** `[TD]`
**Propósito:** Revisión dual-mode de testabilidad del sistema.

**Archivos:**
- `workflow.yaml`
- `instructions.md`
- `checklist.md`
- `test-design-template.md`

**Outputs:**

| Archivo | Propósito |
|---|---|
| `_bmad-output/test-design-system.md` | (Solo modo system-level) Revisión de testabilidad del sistema: qué partes son difíciles de testear y por qué |
| `_bmad-output/test-design-epic-{num}.md` | (Solo modo epic-level) Escenarios de prueba por historia + matriz de riesgo con scoring P0/P1/P2/P3 para cada criterio de aceptación |

| Nivel | ¿Aplica? |
|---|---|
| Sistema / Proyecto | ✅ Revisión de testabilidad del sistema completo |
| Épica | ✅ Escenarios de prueba + matriz de riesgo para las historias (uso normal en Siesa) |
| Historia | ❌ |
| Release | ❌ |

---

### 6.5 Trace (`trace/`)

**Código de menú:** `[TR]`
**Propósito:** Generar matriz de trazabilidad requirements-to-tests y tomar decisión de quality gate.

**Archivos:**
- `workflow.yaml`
- `instructions.md`
- `checklist.md`
- `trace-template.md`

**Outputs:**

| Archivo | Propósito |
|---|---|
| `_bmad-output/traceability-matrix.md` | Matriz requirements → tests: cada AC mapeado a su test con estado (FULL / PARTIAL / NONE) y prioridad |
| `_bmad-output/gate-decision-{gate_type}-{id}.md` | Decisión de quality gate con evidencia: cobertura P0/P1/P2, gaps encontrados, decisión PASS/CONCERNS/FAIL/WAIVED y próximos pasos |

| Nivel | ¿Aplica? |
|---|---|
| Sistema / Proyecto | ❌ |
| Épica | ✅ Consolida cobertura de todas las historias de la épica |
| Historia | ✅ Solo para historias de riesgo alto 🔴, antes del merge |
| Release | ✅ Cobertura completa del release — requiere `nfr-assessment.md` previo |

> También soporta `hotfix`: alcance reducido a los flujos afectados por el fix, para deploys de emergencia.

**Decisiones de Quality Gate posibles:**
- `PASS` — cobertura adecuada, proceder al despliegue
- `CONCERNS` — gaps identificados, proceder con riesgo aceptado y documentado
- `FAIL` — cobertura insuficiente, bloquear despliegue
- `WAIVED` — excepción aprobada con justificación firmada por el responsable

---

### 6.6 Test Review (`test-review/`)

**Código de menú:** `[RV]`
**Propósito:** Review de calidad de tests usando la knowledge base del agente.

**Archivos:**
- `workflow.yaml`
- `instructions.md`
- `checklist.md`
- `test-review-template.md`

| Nivel | ¿Aplica? |
|---|---|
| Sistema / Proyecto | ✅ Auditoría general de toda la suite |
| Épica | ✅ Auditoría de los tests de un módulo o épica |
| Historia | ✅ Revisa los tests nuevos después de implementar |
| Release | ❌ |

**Resumen:** Valida que los tests existentes cumplan el Definition of Done, los límites de tiempo de ejecución y los patrones de calidad documentados en la knowledge base.

**Outputs:**

| Archivo | Propósito |
|---|---|
| `_bmad-output/test-review.md` | Reporte de calidad: score 0-100 con grado (A/B/C/F), issues críticos que deben corregirse, recomendaciones, y detalle por archivo |

---

### 6.7 NFR Assessment (`nfr-assess/`)

**Código de menú:** `[NR]`
**Propósito:** Evaluar non-functional requirements con evidencia antes del release.

**Archivos:**
- `workflow.yaml`
- `instructions.md`
- `checklist.md`
- `nfr-report-template.md`

| Nivel | ¿Aplica? |
|---|---|
| Sistema / Proyecto | ❌ |
| Épica | ⚠️ Solo si la épica tiene SLA de performance/seguridad explícito |
| Historia | ❌ |
| Release | ✅ Siempre antes de producción — su output es prerequisito de `[TR]` release |

**Outputs:**

| Archivo | Propósito |
|---|---|
| `_bmad-output/nfr-assessment.md` | Reporte de evaluación NFR: estado PASS/CONCERNS/FAIL por dimensión, evidencia usada, valor real vs umbral definido, y plan de remediación |

**Dimensiones evaluadas:**
- Security
- Performance
- Reliability
- Maintainability

---

### 6.8 CI/CD (`ci/`)

**Código de menú:** `[CI]`
**Propósito:** Scaffold del pipeline de calidad en CI/CD.

**Archivos:**
- `workflow.yaml`
- `instructions.md`
- `checklist.md`
- `github-actions-template.yaml`
- `gitlab-ci-template.yaml`

| Nivel | ¿Aplica? |
|---|---|
| Sistema / Proyecto | ✅ Una vez al configurar el pipeline |
| Épica | ❌ |
| Historia | ❌ |
| Release | ❌ |

**Resumen:** Configura ejecución de tests, burn-in loops, recolección de artefactos y sharding para GitHub Actions y GitLab CI.

**Outputs:**

| Archivo | Propósito |
|---|---|
| `.github/workflows/test.yml` / `.gitlab-ci.yml` / `.circleci/config.yml` | Pipeline CI con stages: lint → test (4 shards paralelos) → burn-in (10 iteraciones) → report |
| `scripts/test-changed.sh` | Ejecuta solo los tests afectados por el git diff — para PRs rápidos |
| `scripts/ci-local.sh` | Replica el pipeline de CI en local para debuggear fallos |
| `scripts/burn-in.sh` | Burn-in standalone: corre los tests N veces para detectar flakiness |
| `docs/ci.md` | Documentación del pipeline: stages, cómo correr localmente, secrets necesarios |
| `docs/ci-secrets-checklist.md` | Lista de secrets requeridos y cómo configurarlos en la plataforma CI |

---

## 6. Integración Multi-IDE

| IDE / Herramienta | Archivo de activación |
|-------------------|-----------------------|
| Claude Code | `.claude/commands/bmad/bmm/agents/tea.md` |
| Cursor | `.cursor/rules/bmad/bmm/agents/tea.mdc` |
| Gemini | `.gemini/commands/bmad-agent-bmm-tea.toml` |
| GitHub Copilot / Actions | `.github/agents/bmd-custom-bmm-tea.agent.md` |

---

## 7. Integración con el Proceso de Calidad Siesa

TEA opera en dos niveles dentro del flujo de calidad de Siesa: **estrategia** (antes del desarrollo) y **validación** (después de la implementación). Se articula directamente con los dos artefactos del proceso de calidad del proyecto:

| Artefacto Siesa | Workflows TEA que lo generan / validan |
|-----------------|----------------------------------------|
| `planeacion.md` | `[TD]` Test Design (modo epic-level) + `[TR]` Trace |
| `diseno.md` | `[TD]` Test Design + `[AT]` ATDD + `[NR]` NFR Assessment |

### Flujo completo TEA dentro del ciclo BMAD

```
create-epics-and-stories completo
    │
    ├─────────────────────────────────────────┐
    │                                         │
    ▼                                         ▼
[QA — TEA activo]                    [DEV — dev-story loop]
    │
    ├─▶ [TD] Test Design (epic-level)
    │     └─ produce: escenarios de prueba + riesgo
    │
    ├─▶ [AT] ATDD (por historia)
    │     └─ produce: tests fallidos ANTES de que dev implemente
    │
    ├─▶ [NR] NFR Assessment (si hay performance/seguridad)
    │
    ▼
Dev libera features → QA prueba
    │
    ├─▶ [TA] Automate (coverage post-implementación)
    ├─▶ [RV] Test Review (auditar calidad de tests escritos)
    └─▶ [TR] Trace + Quality Gate → PASS / CONCERNS / FAIL / WAIVED
```

---

### Ejemplo práctico — Épica con 2 historias

**Contexto:** Épica 3 — Módulo de Reportes
- Historia 3.1 — Generar reporte en pantalla
- Historia 3.2 — Exportar reporte a Excel

> Cada paso muestra: `[código menú]` para modo interactivo · `/comando` para modo directo

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INICIO DE ÉPICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QA ejecuta [TD]  /bmad:bmm:workflows:testarch-test-design  (modo: epic-level)
  └─ TEA analiza las 2 historias
  └─ Genera escenarios de prueba por historia
  └─ Produce matriz de riesgo:
       Historia 3.1 → 🟡 Riesgo medio (R=10)
       Historia 3.2 → 🔴 Riesgo alto  (R=18) ← prioridad

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOOP — HISTORIA 3.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QA ejecuta [AT]  /bmad:bmm:workflows:testarch-atdd
  └─ TEA genera tests para Historia 3.1
  └─ Tests fallan ✅ (correcto, el código no existe)

DEV implementa Historia 3.1
  └─ Corre los tests → deben pasar 🟢

QA ejecuta [TA]  /bmad:bmm:workflows:testarch-automate
  └─ TEA detecta gaps de cobertura post-implementación
  └─ Genera tests adicionales para edge cases

QA ejecuta [RV]  /bmad:bmm:workflows:testarch-test-review
  └─ TEA audita la calidad de todos los tests
  └─ Detecta tests frágiles o incompletos

[OPCIONAL — solo si Historia 3.1 tiene riesgo alto 🔴]
QA ejecuta [TR]  /bmad:bmm:workflows:testarch-trace  (gate_type: story)
  └─ Verifica cobertura de los AC antes del merge
  └─ PASS ✅ → cobertura confirmada

DEV hace code-review
  └─ Revisa código con calidad ya validada por TEA
  └─ Historia 3.1 liberada, merge aprobado ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOOP — HISTORIA 3.2  (mismo ciclo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QA ejecuta [AT]  /bmad:bmm:workflows:testarch-atdd
  └─ Tests fallan ✅ (correcto)

DEV implementa Historia 3.2
  └─ Corre los tests → deben pasar 🟢

QA ejecuta [TA]  /bmad:bmm:workflows:testarch-automate
  └─ Genera tests adicionales para edge cases

QA ejecuta [RV]  /bmad:bmm:workflows:testarch-test-review
  └─ Audita calidad de todos los tests

[OPCIONAL — solo si Historia 3.2 tiene riesgo alto 🔴]
QA ejecuta [TR]  /bmad:bmm:workflows:testarch-trace  (gate_type: story)
  └─ Verifica cobertura de los AC antes del merge
  └─ PASS ✅ → cobertura confirmada

DEV hace code-review
  └─ Revisa código con calidad ya validada por TEA
  └─ Historia 3.2 liberada, merge aprobado ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIN DE ÉPICA  (gate_type: epic)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QA ejecuta [TR]  /bmad:bmm:workflows:testarch-trace  (gate_type: epic)
  └─ Verifica cobertura de TODA la épica (historias 3.1 + 3.2)
  └─ Fase 1 — Traceability Matrix:
       Historia 3.1 → spec.ts:12  ✅ Cubierto
       Historia 3.2 → spec.ts:45  ✅ Cubierto
  └─ Fase 2 — Quality Gate automática:
       P0 coverage: 100% ✅
       P1 coverage: 95%  ✅
  └─ PASS ✅ → Épica 3 lista para desplegar

DESPLIEGUE — Épica 3 va al ambiente 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RELEASE FORMAL  (gate_type: release)
cuando se agrupan varias épicas para producción
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QA ejecuta [NR]  /bmad:bmm:workflows:testarch-nfr  ← solo aquí, no antes
  └─ TEA evalúa: performance, seguridad, reliability, maintainability
  └─ Si FAIL → bloquea el release hasta resolver

QA ejecuta [TR]  /bmad:bmm:workflows:testarch-trace  (gate_type: release)
  └─ Incorpora resultado del NFR Assessment
  └─ Verifica cobertura de todas las épicas del release
  └─ PASS ✅ → release aprobado

RELEASE A PRODUCCIÓN 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
¿QUÉ PASA SI CUALQUIER GATE DICE FAIL?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [TR] o [NR] → FAIL
    └─ TEA indica qué falta
    └─ DEV agrega los tests o corrige el problema
    └─ QA re-ejecuta el workflow que falló
    └─ Si pasa → continúa el flujo
    └─ Si el equipo decide liberar igual → WAIVED con justificación firmada
```

### Cuándo QA ejecuta cada workflow en el sprint Siesa

| Momento del sprint | Workflow TEA | Output clave |
|--------------------|-------------|--------------|
| Inicio (post-epics) | `[TD]` Test Design | Escenarios por historia + matriz de riesgo |
| Por cada historia, antes de dev | `[AT]` ATDD | Tests E2E/unitarios que deben fallar |
| Proyecto nuevo | `[TF]` Framework | Scaffold Playwright/Cypress completo |
| Features liberadas | `[TA]` Automate | Suite de regresión automatizada |
| Pre-release | `[TR]` Trace | Decision gate: PASS / FAIL |
| Auditoría de calidad | `[RV]` Review | Score de calidad por test file |
| Release con SLA de performance | `[NR]` NFR | Reporte de security + performance |

---

## 8. Flujo de Decisión — ¿Qué workflow usar?

```
¿Tienes un proyecto SIN framework de tests?
  └─▶ SÍ → [TF] Framework Setup (primero siempre)
  └─▶ NO → continuar

¿Estás en fase de planificación / antes de implementar?
  └─▶ SÍ → [TD] Test Design (nivel épica o sistema)
           ↓
        ¿Quieres tests que fallen antes de que el dev escriba código?
          └─▶ SÍ → [AT] ATDD
  └─▶ NO → continuar

¿Ya existe código implementado sin tests suficientes?
  └─▶ SÍ → [TA] Automate

¿Quieres revisar la calidad de los tests existentes?
  └─▶ SÍ → [RV] Test Review

¿Necesitas verificar cobertura antes de un release?
  └─▶ SÍ → [TR] Trace + Quality Gate

¿Hay requisitos de performance, seguridad o reliability?
  └─▶ SÍ → [NR] NFR Assessment

¿Tu pipeline de CI no ejecuta tests automáticamente?
  └─▶ SÍ → [CI] CI/CD Scaffold
```

---

## 9. Guía de Capacitación

### 13.1 Objetivos de aprendizaje

Al finalizar la capacitación, el participante debe ser capaz de:

1. Activar el agente TEA en Claude Code
2. Seleccionar el workflow correcto según el momento del ciclo de desarrollo
3. Ejecutar los 3 workflows más usados en proyectos Siesa: `[TD]`, `[AT]`, `[TR]`
4. Interpretar una decisión de quality gate y actuar en consecuencia
5. Integrar TEA con el proceso de calidad Siesa (`planeacion.md` / `diseno.md`)

### 13.2 Demos paso a paso

#### Demo 1 — Activar TEA

```
Paso 1: Abrir Claude Code en el proyecto Siesa-Agents
Paso 2: Escribir el slash command:
          /bmad:bmm:agents:tea
Paso 3: TEA carga su persona "Murat" y muestra el menú
Paso 4: Elegir [CH] para chat libre o cualquier opción del menú
```

**Resultado esperado:** El agente responde en español (por config), se presenta como Murat y muestra el menú numerado.

---

#### Demo 2 — Test Design para una épica (`[TD]`)

**Escenario:** El equipo terminó de definir Épica 3 — Módulo de Reportes.

```
Paso 1: Activar TEA → seleccionar [TD]
Paso 2: TEA pregunta: ¿modo System-level o Epic-level?
        → Responder: "Epic-level, épica 3"
Paso 3: TEA lee los archivos de la épica automáticamente
Paso 4: Genera escenarios de prueba por historia + matriz de riesgo
Paso 5: Revisar el output — identificar los ítems 🔴 (R > 15)
         → Esos son los primeros en cubrir con ATDD
```

**Qué mirar en el output:**
- ¿Están cubiertos los flujos críticos de negocio?
- ¿La matriz de riesgo es razonable? (debate con el equipo)
- ¿Hay features sin escenarios? → gap de cobertura

---

#### Demo 3 — ATDD antes de implementar una historia (`[AT]`)

**Escenario:** El dev va a implementar Historia 3.2 — Exportar reporte a Excel. QA activa TEA primero.

```
Paso 1: Activar TEA → seleccionar [AT]
Paso 2: Proveer contexto: "Historia 3.2 — exportar a Excel, criterios de aceptación: [pegar AC]"
Paso 3: TEA genera:
         - Tests E2E: flujo completo usuario→descarga archivo
         - Tests de integración: API devuelve XLSX válido
         - Tests unitarios: transformación de datos correcta
Paso 4: Ejecutar los tests → DEBEN FALLAR (red phase)
Paso 5: El dev implementa → tests pasan (green phase)
```

**Punto clave para capacitación:** Los tests fallando es el estado CORRECTO al inicio. Es evidencia de que el test valida algo real.

---

#### Demo 4 — Quality Gate antes de release (`[TR]`)

**Escenario:** Sprint terminado, se va a hacer release del Módulo de Reportes.

```
Paso 1: Activar TEA → seleccionar [TR]
Paso 2: TEA lee todos los tests existentes y los requirements de la épica
Paso 3: Genera la traceability matrix:
         Feature X → Cubierto por test_file.spec.ts:línea_42
         Feature Y → SIN COBERTURA ← gap
Paso 4: TEA emite decisión de quality gate
         PASS     → proceder
         CONCERNS → documentar riesgo aceptado
         FAIL     → bloquear, indicar qué falta
         WAIVED   → excepción aprobada por el equipo
```

**Pregunta para el grupo:** "Si el gate dice CONCERNS, ¿quién toma la decisión de proceder?"
→ Respuesta: El Dev Lead / Tech Lead con el contexto de riesgo.

---

### 13.3 Antipatrones — Errores comunes

| # | Antipatrón | Por qué es un problema | Cómo evitarlo |
|---|-----------|----------------------|---------------|
| 1 | Usar `[TA]` (Automate) en lugar de `[AT]` (ATDD) | Se pierde el beneficio de tests-first; el dev puede ignorar las pruebas | Siempre ejecutar `[AT]` **antes** de dar la historia al dev |
| 2 | Ignorar decisiones `CONCERNS` del quality gate | Deuda técnica silenciosa que acumula riesgo | Documentar el riesgo aceptado con firma del responsable |
| 3 | Ejecutar `[TF]` Framework en un proyecto que ya tiene tests | Puede sobreescribir configuraciones existentes | Usar `[TF]` solo al inicio de proyectos nuevos |
| 4 | No revisar la matriz de riesgo del `[TD]` con el equipo | QA trabaja en aislamiento; el dev no sabe qué es crítico | La matriz de riesgo debe presentarse en el inicio del sprint |
| 5 | Asumir que `tea_use_playwright_utils: false` rompe todo | Solo deshabilita utilidades extra; los workflows funcionan igual | Verificar config.yaml antes de escalar el problema |
| 6 | Usar TEA para diseño de arquitectura del sistema | TEA evalúa testabilidad, no diseña arquitectura | Para eso usar el agente `arch` |

---

### 13.4 Preguntas Frecuentes (FAQ)

**¿TEA escribe el código de los tests automáticamente?**
Sí. En `[AT]` ATDD y `[TA]` Automate, TEA genera el código de los tests. En `[TD]` Test Design, genera los escenarios en texto (el dev o QA los convierte a código).

**¿TEA reemplaza al QA humano?**
No. TEA amplifica la capacidad del QA: genera artefactos que tomarían horas en minutos. El QA humano revisa, valida y toma decisiones de riesgo.

**¿Qué pasa si no tengo `project-context.md`?**
TEA funciona igual, pero pierde el contexto específico del proyecto (patrones, restricciones). Se recomienda generarlo con el workflow `generate-project-context` primero.

**¿Puedo usar TEA con Cypress en lugar de Playwright?**
Sí. En `[TF]` Framework Setup, TEA pregunta qué framework usar. En este proyecto (`config.yaml`), Playwright Utils está deshabilitado pero el soporte de framework funciona igual.

**¿La decisión FAIL del quality gate bloquea el merge automáticamente?**
Depende del pipeline. TEA emite la decisión, pero el enforcement lo hace el pipeline de CI (`[CI]` CI/CD Scaffold) o el proceso de revisión del equipo.

**¿Con qué frecuencia debo invocar a TEA?**
- Al menos una vez por épica (`[TD]`)
- Una vez por historia antes de implementar (`[AT]`)
- Una vez antes de cada release (`[TR]`)

**¿TEA puede revisar tests que ya existen en el repositorio?**
Sí, con `[RV]` Test Review. Analiza los archivos de test contra los patrones de calidad de su knowledge base y genera un reporte con hallazgos específicos.

---

### 13.5 Ejercicios Prácticos

#### Ejercicio 1 — Diagnóstico de workflow (10 min)

Para cada escenario, identificar qué workflow TEA usar:

| Escenario | Respuesta |
|-----------|-----------|
| Nuevo proyecto, no hay ningún test | `[TF]` |
| Épica 2 está definida, dev aún no empieza | `[TD]` → `[AT]` |
| El dev terminó Historia 4.1, hay cobertura parcial | `[TA]` |
| Se va a hacer release el viernes | `[TR]` |
| El pipeline de CI no ejecuta tests | `[CI]` |
| Los tests están tardando 8 minutos en correr | `[RV]` + `[CI]` |
| Se reportó un problema de performance en prod | `[NR]` |

#### Ejercicio 2 — Interpretar un quality gate (15 min)

Dado el siguiente output del workflow `[TR]`:

```
Feature AUTH-01 (Login)       → COVERED  — auth.spec.ts:12
Feature AUTH-02 (2FA)         → COVERED  — auth.spec.ts:45
Feature RPT-01 (Exportar PDF) → NOT COVERED
Feature RPT-02 (Exportar XLS) → PARTIALLY — rpt.spec.ts:8 (solo happy path)
Feature NFR-PERF-01           → NOT COVERED
```

**Preguntas:**
1. ¿Cuál sería la decisión de quality gate? ¿PASS, CONCERNS o FAIL?
2. ¿Qué features hay que cubrir obligatoriamente antes del release?
3. Si el equipo decide hacer WAIVED para NFR-PERF-01, ¿qué documentación se necesita?

**Respuestas esperadas:**
1. `FAIL` — hay features sin cobertura en producción
2. `RPT-01` mínimo; `RPT-02` extender a edge cases
3. Justificación escrita con el riesgo aceptado y firma del responsable (Dev Lead)

#### Ejercicio 3 — Activación en vivo (20 min)

Activar TEA en Claude Code con el comando `/bmad:bmm:agents:tea` y ejecutar:
1. `[TD]` Test Design sobre una épica real del proyecto
2. Discutir en grupo si la matriz de riesgo generada refleja la realidad del negocio
3. Identificar mínimo 2 escenarios que habrían quedado sin cubrir sin TEA

---

## 10. Resumen de Capacidades

```
TEA (Murat) — Master Test Architect
├── 8 Workflows especializados
│   ├── Framework Setup
│   ├── ATDD (tests antes de implementación)
│   ├── Automation Coverage
│   ├── Test Design (dual-mode)
│   ├── Traceability Matrix + Quality Gate
│   ├── Test Review
│   ├── NFR Assessment
│   └── CI/CD Pipeline Scaffold
├── 33 Fragmentos de conocimiento indexados
│   ├── Patrones fundamentales (6)
│   ├── Estrategias de testing (6)
│   ├── Gobernanza y decisiones (7)
│   ├── Selectors y timing (2)
│   └── Playwright Utils (11 + overview)
├── Soporte multi-framework
│   ├── Playwright
│   └── Cypress
├── Soporte multi-CI
│   ├── GitHub Actions
│   └── GitLab CI
└── Integración multi-IDE
    ├── Claude Code
    ├── Cursor
    ├── Gemini
    └── GitHub Copilot
```
