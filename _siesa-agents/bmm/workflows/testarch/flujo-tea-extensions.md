# Flujo TEA — Greenfield vs Brownfield

El agente TEA (Test Architect) de BMAD orquesta todos los comandos de calidad y testing dentro
del ciclo de desarrollo. Tres de sus comandos fueron extendidos para conectarse con el
`test-cases.csv` generado por el proceso de calidad QA, convirtiéndolo en la fuente de verdad
compartida que guía el diseño, la implementación y la revisión de los tests.

---

## Los tres comandos extendidos

### test-design ★
Diseña casos de prueba por épica usando el CSV como baseline.
- Lee el `test-cases.csv` existente antes de diseñar
- Identifica qué casos ya están diseñados para esa épica
- Solo crea casos nuevos para los gaps — nunca rediseña lo que ya existe
- Output: `test-design-epic-N.md` + `test-cases-new-EPIC.csv` listo para mergear

### test-automate ★
Implementa los tests pendientes usando el CSV como lista de targets.
- Filtra únicamente los casos con `Estado = "Not Started"`
- Genera los archivos `.spec.ts` en orden de prioridad: P0 → P1 → P2 → P3
- Cada test incluye el ID del caso (`TC-XX-YY`) en su nombre para trazabilidad
- Ignora los casos ya ejecutados (`Pass` / `Fail`)

### test-review ★
Revisa la calidad del suite y verifica la integridad entre el CSV y los specs.
- Ejecuta todos los quality checks estándar (BDD, waits, determinismo, aislamiento)
- **Check A:** detecta tests sin `TC-XX-YY` en el nombre — no son trazables al CSV
- **Check B:** detecta casos `Not Started` en el CSV sin spec implementado — gaps reales
- **Check C:** detecta casos `Pass/Fail` en el CSV cuyo spec ya no existe — CSV desincronizado
- **Check D:** detecta specs con ID que no existe en el CSV — tests sin diseño formal

---

## Flujo Greenfield

Proyecto nuevo, sin código previo. Todos los casos del CSV nacen en `Not Started`.

### Fase 3 — Solutioning

1. `/create-epics-and-stories`
   - Define las épicas y stories del proyecto

2. `/quality-process` — Fase 1: Planeación
   - Genera: QA Test Plan, Matriz de Riesgo, Data Buckets

3. `/quality-process` — Fase 2: Diseño ← **genera el CSV**
   - Genera: `test-cases.csv` con todos los casos en `Not Started`

4. `test-design` — modo System-Level *(sin extensión en esta fase)*
   - Genera: `test-design-system.md`, estrategia de niveles, enfoque NFR, concerns de testabilidad

5. `test-framework`
   - Genera: estructura base de tests, fixtures, factories, helpers, configuración de Playwright

6. `continuous-integration`
   - Genera: pipeline CI/CD con stages, sharding, burn-in loops, política de artefactos

### Fase 4 — Implementación *(se repite por cada épica)*

1. `/sprint-planning`

2. **`test-design` [Épica] ★ EXTENDIDO**
   - Lee `test-cases.csv` como baseline de la épica
   - Solo diseña casos nuevos — no rediseña lo existente
   - Output: `test-design-epic-N.md` + `test-cases-new-EPIC.csv`

3. `atdd` *(opcional — enfoque TDD)*
   - Genera tests E2E que fallan antes de implementar
   - Usar cuando se quiere guiar el desarrollo por tests

4. `/create-story` → `/dev-story`
   - Implementa las stories de la épica

5. **`test-automate` ★ EXTENDIDO**
   - Filtra `Estado = "Not Started"` del CSV
   - Genera specs en orden P0 → P1 → P2 → P3
   - Cada test incluye `TC-XX-YY` en su nombre

6. `test-trace`
   - Traza requisitos → tests implementados
   - Detecta gaps de cobertura por requisito
   - Toma decisión de quality gate (pasar o bloquear)

7. `/code-review`

8. **`test-review` ★ EXTENDIDO**
   - Quality checks estándar + 4 checks de integridad CSV ↔ specs
   - Check A, B, C y D según corresponda

9. `/sprint-status`

---

## Flujo Brownfield

Proyecto ya desarrollado, con código y posiblemente tests existentes.
El CSV puede incluir casos `Pass/Fail` del código anterior desde el primer día.

### Fase 3 — Solutioning

1. `/create-epics-and-stories`
   - Épicas basadas en lo que ya existe + lo que falta

2. `/quality-process` — Fase 1: Planeación

3. `/quality-process` — Fase 2: Diseño ← **genera el CSV**
   - Genera: `test-cases.csv` con mix de `Not Started`, `Pass` y `Fail`

4. `test-design` — modo System-Level *(sin extensión en esta fase)*
   - Evalúa testabilidad del código existente
   - Identifica concerns de arquitectura heredada

5. **`test-review` ★ EXTENDIDO ← auditoría inicial del código actual**
   - Check B: revela qué casos del CSV no tienen spec todavía
   - Check D: revela specs legacy sin trazabilidad al CSV
   - Da visibilidad real del estado de cobertura antes de empezar

6. `test-framework` *(solo si la infraestructura base falta)*

7. `continuous-integration`
   - Adapta o crea el pipeline CI/CD sobre lo existente

### Fase 4 — Implementación *(se repite por cada épica)*

1. `/sprint-planning`

2. **`test-design` [Épica] ★ EXTENDIDO**
   - Respeta los casos `Pass/Fail` del código anterior — no los rediseña
   - Solo diseña lo que falta para esta épica

3. `atdd` *(opcional — enfoque TDD)*
   - Útil para nuevas features dentro del proyecto legacy

4. `/create-story` → `/dev-story`
   - Implementa nuevas features o refactoriza las existentes

5. **`test-automate` ★ EXTENDIDO**
   - Filtra `Estado = "Not Started"` — ignora `Pass/Fail`
   - Puede ser un subconjunto pequeño si ya hay cobertura parcial

6. `test-trace`
   - Traza requisitos nuevos + heredados → tests
   - Decisión de quality gate antes de merge

7. `/code-review`

8. **`test-review` ★ EXTENDIDO**
   - Quality checks estándar
   - Check C: detecta specs legacy eliminados sin actualizar el CSV
   - Check D: detecta tests legacy sin trazabilidad al CSV

9. `/sprint-status`

---

## El CSV como hilo conductor

El archivo `test-cases.csv`, generado por `/quality-process`, es la fuente de verdad
compartida entre los tres comandos extendidos. Cada uno lo usa con un propósito distinto:

- **test-design** lo usa para **no repetir trabajo** — sabe qué ya está diseñado
- **test-automate** lo usa para **saber qué escribir** — solo implementa lo pendiente
- **test-review** lo usa para **verificar que todo está en orden** — cruza CSV con specs

La diferencia principal entre Greenfield y Brownfield es el estado inicial del CSV:
en Greenfield todos los casos nacen en `Not Started`; en Brownfield puede haber casos
`Pass` o `Fail` del código preexistente, lo que hace que `test-review` sea especialmente
valioso desde el inicio como auditoría del estado real de cobertura.
