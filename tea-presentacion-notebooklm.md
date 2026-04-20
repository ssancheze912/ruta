# TEA — Master Test Architect · Módulo BMAD V6
## Guía de presentación para NotebookLM

> **TEA** (agente Murat 🧪) es el guardián de calidad del ciclo de desarrollo en BMAD V6.
> No escribe tests por defecto — diseña, planifica y gobierna la calidad.
> Su filosofía: **risk-based testing** — la profundidad del testing escala con el impacto del cambio.

---

## Principios clave del agente

1. **Risk-based testing** — la profundidad escala con el impacto
2. **Quality gates respaldados por datos**
3. **Los tests reflejan patrones de uso reales**
4. **Flakiness = deuda técnica crítica** — se trata de inmediato
5. **Tests first, AI implements, suite validates** — ATDD sobre TDD reactivo
6. **Calcular risk vs value** para cada decisión de testing

---

## Los 8 workflows del módulo TEA

---

### [TF] Framework Setup
**Comando:** `/bmad:bmm:workflows:testarch-framework`

**Objetivo:** Inicializar la infraestructura de testing completa y production-ready desde cero. Scaffolda Playwright o Cypress con estructura de directorios, configuración de entornos, timeout standards y patrones de fixtures.

**Artefactos que entrega:**

| Artefacto | Descripción |
|-----------|-------------|
| `playwright.config.ts` / `cypress.config.ts` | Config del framework con timeouts y reporters HTML + JUnit |
| `tests/e2e/`, `tests/api/`, `tests/support/` | Estructura base de directorios de tests |
| `tests/support/fixtures/` | Fixtures base con patrón `mergeTests` |
| `tests/support/factories/` | Data factories con faker y auto-cleanup |
| `.env.example` | Variables de entorno requeridas |
| `tests/README.md` | Instrucciones de setup y guía de arquitectura |

**Niveles de ejecución:**

| Nivel | ¿Aplica? |
|-------|----------|
| Sistema / Proyecto | ✅ Una vez al inicio del proyecto |
| Épica | ❌ |
| Historia | ❌ |
| Release | ❌ |

---

### [AT] ATDD (Acceptance Test Driven Development)
**Comando:** `/bmad:bmm:workflows:testarch-atdd`

**Objetivo:** Generar tests de aceptación **fallidos** ANTES de la implementación, siguiendo el ciclo red → green → refactor. Define el comportamiento esperado antes de escribir una línea de código de producción.

**Artefactos que entrega:**

| Artefacto | Descripción |
|-----------|-------------|
| `tests/e2e/{feature}.spec.ts` | Tests E2E del flujo completo del usuario — deben fallar al crearlos |
| `tests/api/{feature}.api.spec.ts` | Tests de contrato de API — validan request/response |
| `tests/component/{Component}.test.tsx` | Tests de componentes UI en aislamiento |
| `tests/support/factories/{entity}.factory.ts` | Factories con faker para generar datos de prueba |
| `_bmad-output/atdd-checklist-{story_id}.md` | Checklist: tests creados, fixtures, `data-testid` necesarios y workflow red→green→refactor |

**Niveles de ejecución:**

| Nivel | ¿Aplica? |
|-------|----------|
| Sistema / Proyecto | ❌ |
| Épica | ❌ |
| Historia | ✅ Una vez por historia, antes de implementar |
| Release | ❌ |

---

### [TA] Automate (Expansión de cobertura)
**Comando:** `/bmad:bmm:workflows:testarch-automate`

**Objetivo:** Expandir la cobertura de automatización después de la implementación. Analiza el codebase existente y genera un test suite comprensivo. Complementa ATDD cuando ya existe código sin tests.

**Artefactos que entrega:**

| Artefacto | Descripción |
|-----------|-------------|
| `tests/e2e/{feature}.spec.ts` | Tests E2E nuevos con cobertura P0/P1 |
| `tests/api/{feature}.api.spec.ts` | Tests de API para lógica de negocio compleja |
| `tests/component/{Component}.test.tsx` | Tests de componentes para edge cases de UI |
| `tests/unit/{module}.test.ts` | Tests unitarios para lógica pura |
| `_bmad-output/automation-summary.md` | Resumen de tests creados por nivel (P0/P1/P2/P3) y gaps pendientes |

**Niveles de ejecución:**

| Nivel | ¿Aplica? |
|-------|----------|
| Sistema / Proyecto | ✅ Cobertura completa de todo el codebase |
| Épica | ✅ Cobertura de todo lo implementado en la épica |
| Historia | ✅ Solo flujos críticos de la historia recién implementada |
| Release | ❌ |

---

### [TD] Test Design (Diseño de pruebas)
**Comando:** `/bmad:bmm:workflows:testarch-test-design`

**Objetivo:** Revisión dual-mode de testabilidad. En modo **epic-level** genera escenarios de prueba y una matriz de riesgo por historia (uso habitual en Siesa). En modo **system-level** identifica qué partes del sistema son difíciles de testear y por qué.

**Artefactos que entrega:**

| Artefacto | Descripción |
|-----------|-------------|
| `_bmad-output/test-design-system.md` | (Modo system) Revisión de testabilidad del sistema completo |
| `_bmad-output/test-design-epic-{num}.md` | (Modo epic) Escenarios por historia + matriz de riesgo con scoring P0/P1/P2/P3 |

**Niveles de ejecución:**

| Nivel | ¿Aplica? |
|-------|----------|
| Sistema / Proyecto | ✅ Revisión de testabilidad del sistema completo |
| Épica | ✅ Escenarios de prueba + matriz de riesgo (uso normal en Siesa) |
| Historia | ❌ |
| Release | ❌ |

---

### [TR] Trace + Quality Gate (Trazabilidad y gate de calidad)
**Comando:** `/bmad:bmm:workflows:testarch-trace`

**Objetivo:** Generar la matriz de trazabilidad requirements → tests y emitir una decisión formal de quality gate. Es el workflow de cierre que determina si un cambio puede pasar al siguiente ambiente.

**Artefactos que entrega:**

| Artefacto | Descripción |
|-----------|-------------|
| `_bmad-output/traceability-matrix.md` | Cada AC mapeado a su test con estado FULL / PARTIAL / NONE y prioridad |
| `_bmad-output/gate-decision-{gate_type}-{id}.md` | Decisión formal: cobertura P0/P1/P2, gaps, decisión PASS/CONCERNS/FAIL/WAIVED y próximos pasos |

**Decisiones posibles:**
- `PASS` — cobertura adecuada, proceder al despliegue
- `CONCERNS` — gaps identificados, proceder con riesgo aceptado y documentado
- `FAIL` — cobertura insuficiente, bloquear despliegue
- `WAIVED` — excepción aprobada con justificación firmada

**Niveles de ejecución:**

| Nivel | ¿Aplica? |
|-------|----------|
| Sistema / Proyecto | ❌ |
| Épica | ✅ Consolida cobertura de todas las historias de la épica |
| Historia | ✅ Solo historias de riesgo alto 🔴, antes del merge |
| Release | ✅ Cobertura completa — requiere `nfr-assessment.md` previo |
| Hotfix | ✅ Alcance reducido a los flujos afectados |

---

### [RV] Test Review (Revisión de calidad)
**Comando:** `/bmad:bmm:workflows:testarch-test-review`

**Objetivo:** Auditar la calidad de los tests existentes usando la knowledge base del agente. Valida que cumplan el Definition of Done, los límites de tiempo de ejecución y los patrones de calidad documentados.

**Artefactos que entrega:**

| Artefacto | Descripción |
|-----------|-------------|
| `_bmad-output/test-review.md` | Reporte con score 0-100 / grado A/B/C/F, issues críticos a corregir, recomendaciones y detalle por archivo |

**Niveles de ejecución:**

| Nivel | ¿Aplica? |
|-------|----------|
| Sistema / Proyecto | ✅ Auditoría general de toda la suite |
| Épica | ✅ Auditoría de los tests de un módulo o épica |
| Historia | ✅ Revisa los tests nuevos después de implementar |
| Release | ❌ |

---

### [NR] NFR Assessment (Requisitos no funcionales)
**Comando:** `/bmad:bmm:workflows:testarch-nfr`

**Objetivo:** Evaluar requisitos no funcionales (performance, seguridad, reliability, maintainability) con evidencia antes del release. Su output es prerequisito obligatorio para ejecutar `[TR]` a nivel release.

**Artefactos que entrega:**

| Artefacto | Descripción |
|-----------|-------------|
| `_bmad-output/nfr-assessment.md` | Reporte por dimensión: estado PASS/CONCERNS/FAIL, evidencia, valor real vs umbral definido, plan de remediación |

**Dimensiones evaluadas:** Security · Performance · Reliability · Maintainability

**Niveles de ejecución:**

| Nivel | ¿Aplica? |
|-------|----------|
| Sistema / Proyecto | ❌ |
| Épica | ⚠️ Solo si tiene SLA de performance/seguridad explícito |
| Historia | ❌ |
| Release | ✅ Siempre antes de producción |

---

### [CI] CI/CD Scaffold (Pipeline de calidad)
**Comando:** `/bmad:bmm:workflows:testarch-ci`

**Objetivo:** Configurar el pipeline de calidad en CI/CD. Cubre ejecución de tests, burn-in loops para detectar flakiness, recolección de artefactos y sharding para GitHub Actions y GitLab CI.

**Artefactos que entrega:**

| Artefacto | Descripción |
|-----------|-------------|
| `.github/workflows/test.yml` / `.gitlab-ci.yml` | Pipeline con stages: lint → test (4 shards) → burn-in (10 iteraciones) → report |
| `scripts/test-changed.sh` | Ejecuta solo tests afectados por el git diff — para PRs rápidos |
| `scripts/ci-local.sh` | Replica el pipeline de CI en local para debuggear fallos |
| `scripts/burn-in.sh` | Burn-in standalone: corre tests N veces para detectar flakiness |
| `docs/ci.md` | Documentación del pipeline: stages, cómo correr localmente, secrets necesarios |
| `docs/ci-secrets-checklist.md` | Lista de secrets requeridos y cómo configurarlos |

**Niveles de ejecución:**

| Nivel | ¿Aplica? |
|-------|----------|
| Sistema / Proyecto | ✅ Una vez al configurar el pipeline |
| Épica | ❌ |
| Historia | ❌ |
| Release | ❌ |

---

## Resumen de niveles por workflow

| Workflow | Sistema | Épica | Historia | Release |
|----------|:-------:|:-----:|:--------:|:-------:|
| [TF] Framework | ✅ | ❌ | ❌ | ❌ |
| [AT] ATDD | ❌ | ❌ | ✅ | ❌ |
| [TA] Automate | ✅ | ✅ | ✅ | ❌ |
| [TD] Test Design | ✅ | ✅ | ❌ | ❌ |
| [TR] Trace + Gate | ❌ | ✅ | 🔴 alto | ✅ |
| [RV] Test Review | ✅ | ✅ | ✅ | ❌ |
| [NR] NFR Assessment | ❌ | ⚠️ | ❌ | ✅ |
| [CI] CI/CD Scaffold | ✅ | ❌ | ❌ | ❌ |

---

## Flujo completo de TEA en Siesa-Agents

### Cómo invocar TEA en siesa-agents / Claude Code

**Modo agente interactivo (menú):**
```
/bmad:bmm:agents:tea
```
Abre el menú interactivo. Luego escribes el código entre corchetes, ej: `[TD]`

**Modo directo por workflow:**
```
/bmad:bmm:workflows:testarch-{nombre-workflow}
```

---

### Flujo estándar de una épica con TEA

```
INICIO DE SPRINT
─────────────────────────────────────────────────────────────
1. Proyecto nuevo (primera vez)
   QA → /bmad:bmm:workflows:testarch-framework   [TF]
         └─ Scaffolda Playwright/Cypress completo

2. Al comenzar cada épica
   QA → /bmad:bmm:workflows:testarch-test-design  [TD]
         └─ modo: epic-level
         └─ Genera escenarios de prueba por historia
         └─ Produce matriz de riesgo: 🟢 bajo / 🟡 medio / 🔴 alto

─────────────────────────────────────────────────────────────
LOOP — Por cada historia dentro de la épica
─────────────────────────────────────────────────────────────
3. ANTES de que DEV implemente
   QA → /bmad:bmm:workflows:testarch-atdd          [AT]
         └─ Genera tests E2E/API/componente que deben FALLAR ✅
         └─ DEV usa los tests como especificación ejecutable

4. DEV implementa la historia
         └─ Corre los tests → deben pasar 🟢

5. DESPUÉS de implementar
   QA → /bmad:bmm:workflows:testarch-automate      [TA]
         └─ Detecta gaps de cobertura post-implementación
         └─ Genera tests adicionales para edge cases

   QA → /bmad:bmm:workflows:testarch-test-review   [RV]
         └─ Audita la calidad de todos los tests escritos
         └─ Score 0–100, detecta tests frágiles

6. [CONDICIONAL] Solo si la historia tiene riesgo alto 🔴
   QA → /bmad:bmm:workflows:testarch-trace         [TR]
         └─ gate_type: story
         └─ Verifica cobertura de los AC antes del merge
         └─ PASS ✅ → historia aprobada para merge

─────────────────────────────────────────────────────────────
FIN DE ÉPICA
─────────────────────────────────────────────────────────────
7. Al cerrar la épica
   QA → /bmad:bmm:workflows:testarch-trace         [TR]
         └─ gate_type: epic
         └─ Consolida cobertura de TODAS las historias
         └─ PASS ✅ → épica lista para desplegar al ambiente

─────────────────────────────────────────────────────────────
RELEASE FORMAL (varias épicas → producción)
─────────────────────────────────────────────────────────────
8. Evaluación NFR (obligatoria)
   QA → /bmad:bmm:workflows:testarch-nfr           [NR]
         └─ Evalúa: performance · seguridad · reliability
         └─ Si FAIL → bloquea el release hasta resolver

9. Gate de release
   QA → /bmad:bmm:workflows:testarch-trace         [TR]
         └─ gate_type: release
         └─ Incorpora resultado del NFR Assessment
         └─ PASS ✅ → release aprobado para producción 🚀

─────────────────────────────────────────────────────────────
¿QUÉ PASA CON UN FAIL?
─────────────────────────────────────────────────────────────
[TR] o [NR] → FAIL
  └─ TEA indica exactamente qué falta
  └─ DEV agrega los tests o corrige el problema
  └─ QA re-ejecuta el workflow que falló
  └─ Si el equipo decide liberar igual → WAIVED con justificación firmada
```

---

### Tabla de referencia rápida — cuándo usar cada workflow en el sprint

| Momento del sprint | Workflow | Comando directo |
|--------------------|----------|-----------------|
| Proyecto nuevo | [TF] Framework | `/bmad:bmm:workflows:testarch-framework` |
| Inicio de épica | [TD] Test Design | `/bmad:bmm:workflows:testarch-test-design` |
| Antes de cada historia (pre-dev) | [AT] ATDD | `/bmad:bmm:workflows:testarch-atdd` |
| Después de implementar | [TA] Automate | `/bmad:bmm:workflows:testarch-automate` |
| Después de implementar | [RV] Test Review | `/bmad:bmm:workflows:testarch-test-review` |
| Historia riesgo alto (pre-merge) | [TR] Trace – story | `/bmad:bmm:workflows:testarch-trace` |
| Cierre de épica | [TR] Trace – epic | `/bmad:bmm:workflows:testarch-trace` |
| Pre-release (siempre) | [NR] NFR Assessment | `/bmad:bmm:workflows:testarch-nfr` |
| Pre-release (después del NFR) | [TR] Trace – release | `/bmad:bmm:workflows:testarch-trace` |
| Configurar pipeline CI | [CI] CI/CD Scaffold | `/bmad:bmm:workflows:testarch-ci` |
| Auditoría general de calidad | [RV] Test Review | `/bmad:bmm:workflows:testarch-test-review` |

---

## Integración con proceso de calidad Siesa

| Artefacto Siesa | Workflows TEA que lo alimentan |
|-----------------|-------------------------------|
| `planeacion.md` | [TD] Test Design (modo epic) + [TR] Trace |
| `diseno.md` | [TD] Test Design + [AT] ATDD + [NR] NFR Assessment |