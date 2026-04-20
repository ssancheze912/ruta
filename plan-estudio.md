# Plan de Estudio: Dominio de Siesa Agents (BMAD)

> Basado en los archivos instalados en `_bmad/` y `_siesa-agents/`, el flujo oficial de `siesa-agents-flujo-fases 1.md` y la arquitectura de `bmad6-mega-project-architecture(1) 2.md`.

---

## TEMA 1 — Workflows / Siesa Agents
**Fecha límite: 11/03/2026**

### Objetivo
Comprender el flujo completo de las 4 fases de la metodología, qué workflow se ejecuta en cada paso, por qué existe y qué produce.

### Mapa mental del flujo (léelo primero)

```
siesa-agents-flujo-fases 1.md  →  Flujo oficial de las 4 fases
bmad6-mega-project-architecture(1) 2.md  →  Cómo se organiza el output
```

### Archivos a leer (en orden)

| Orden | Archivo | Por qué |
|-------|---------|---------|
| 1 | `siesa-agents-flujo-fases 1.md` | El flujo completo de principio a fin |
| 2 | `bmad6-mega-project-architecture(1) 2.md` | Cómo se organiza `_bmad-output/` |
| 3 | `_bmad/_config/workflow-manifest.csv` | Inventario completo de los 45 workflows |
| 4 | `_bmad/bmm/workflows/1-analysis/create-product-brief/` | Fase 1 |
| 5 | `_bmad/bmm/workflows/2-plan-workflows/prd/` + `_siesa-agents/bmm/workflows/2-plan-workflows/prd/workflow_ext.md` | Fase 2 — PRD con ext Siesa |
| 6 | `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/` + `_siesa-agents/bmm/workflows/3-solutioning/create-epics-and-stories/workflow_ext.md` | Fase 3 — Épicas con ext Siesa |
| 7 | `_siesa-agents/core/tasks/shard-doc.md` | Task de sharding inteligente |
| 8 | `_bmad/bmm/workflows/4-implementation/sprint-planning/` + `_siesa-agents/bmm/workflows/4-implementation/sprint-planning/workflow_ext.md` | Fase 4 — Sprint con ext Siesa |
| 9 | `_bmad/bmm/workflows/4-implementation/dev-story/` | Motor de desarrollo |
| 10 | `_bmad/core/agents/bmad-master.md` | Agente orquestador |

### Ejercicios prácticos

1. **Mapa de fases:** Sin mirar los archivos, dibuja el flujo completo de las 4 fases con los workflows exactos en cada paso (usa `siesa-agents-flujo-fases 1.md` para verificar).

2. **Diferencia base vs extensión:** Para cada uno de los 3 `workflow_ext.md` de `_siesa-agents`, responde:
   - ¿Qué agrega la extensión Siesa que no tiene el workflow base de `_bmad`?
   - ¿Por qué fue necesario ese cambio?

3. **Árbol de output:** Dado un proyecto llamado `mi-proyecto` con 3 features: `login`, `dashboard`, `reportes`, dibuja cómo quedaría el árbol de carpetas en `_bmad-output/` después de ejecutar las fases 1, 2 y 3 completas (con sharding).

4. **Shard-doc manual:** Toma cualquier archivo `.md` que tengas y ejecútalo con `/bmad:core:workflows:shard-docs`. Observa cómo detecta headings y genera el `index.md`.

### Criterios de dominio

- [ ] Puedes decir de memoria qué workflow se ejecuta en cada fase y qué produce
- [ ] Entiendes por qué `_siesa-agents` extiende solo 3 workflows (y no los 45)
- [ ] Puedes explicar la diferencia entre un shard transversal y un shard de feature
- [ ] Sabes qué es `archive/` y por qué no se debe editar
- [ ] Puedes explicar `sprint-status.yaml` y el campo `source`

---

## TEMA 2 — Integraciones con Otros Servicios
**Fecha límite: 13/03/2026**

### Sub-temas

#### 2A. Jira (lectura y escritura)

**Archivos a leer:**
- `_siesa-agents/bmm/workflows/2-plan-workflows/prd/workflow_ext.md` — extracción de features desde Jira en el PRD
- `_bmad/bmm/workflows/sync-epics-stories/` — escritura de vuelta a Jira
- `_bmad/bmm/workflows/sync-epics-stories/completion-summary-sync-epics-stories.md`
- `.claude/commands/bmad/bmm/workflows/create-prd.md`

**Flujo Jira completo:**
```
Jira → (get-features skill) → PRD → Épicas → Stories → (sync-epics-stories) → Jira
```

**Ejercicios:**
1. Ejecuta `/get-features` y examina la estructura del output. ¿Qué campos devuelve?
2. En el `workflow_ext.md` del PRD, identifica el paso exacto donde se llama a `get-features` y cómo se estructura el feature en el PRD.
3. Ejecuta `/bmad:bmm:workflows:sync-epics-stories` con datos de prueba. Observa qué campos se sincronizan de vuelta a Jira.

#### 2B. Design System / Siesa UI Kit

**Archivos a leer:**
- `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/`
- `_bmad/bmm/agents/ux-designer.md`
- `_bmad/bmm/workflows/4-implementation/create-story/` — donde se integran componentes del UI Kit
- `_bmad/bmm/workflows/3-solutioning/create-architecture/data/company-standards/`

**Ejercicios:**
1. Ejecuta `/bmad:bmm:workflows:create-ux-design` con un caso de uso simple. ¿Qué produce?
2. Lee un archivo de story existente (si tienes) y encuentra dónde referencia componentes del UI Kit.

#### 2C. Git / GitFlow

**Flujo que implementa `dev-story`:**
```
1. Valida rama actual (feature/X o fix/X)
2. Implementa código
3. Ejecuta commits automáticos con naming convention Siesa
4. Ingeniero hace el push manualmente
```

**Archivos a leer:**
- `_bmad/bmm/workflows/4-implementation/dev-story/checklist.md`
- `_bmad/bmm/workflows/3-solutioning/create-architecture/data/company-standards/backend-standards.md`

**Ejercicios:**
1. Lee el checklist de `dev-story` completo. Identifica cada paso donde hay una acción de Git.
2. Responde: ¿por qué el workflow hace los commits pero el push lo hace el humano?
3. ¿Cuál es el naming convention de ramas en Siesa?

#### 2D. Documentación de Calidad (QA)

**Archivos a leer:**
- `_bmad/bmm/workflows/4-implementation/traceability-and-testing/`
- `_bmad/bmm/workflows/testarch/` (directorio completo — ver sección TEA)
- `_bmad/bmm/workflows/4-implementation/code-review/checklist.md`

#### 2E. Documentación de Usuario Final

**Archivos a leer:**
- `_bmad/bmm/workflows/5-documentation/create-user-guide/`
- `_bmad/bmm/agents/tech-writer.md`
- `_bmad/bmm/data/documentation-standards.md`

**Ejercicio:**
1. Ejecuta `/bmad:bmm:workflows:create-user-guide` tomando como input una épica de ejemplo. Analiza la estructura del output.

### Criterios de dominio

- [ ] Sabes el flujo completo Jira → PRD → Épicas → Stories → Jira (con los commands exactos)
- [ ] Entiendes qué hace `get-features` y cómo conecta con el PRD
- [ ] Sabes en qué paso del `dev-story` ocurre cada acción de Git y quién hace el push
- [ ] Puedes generar una guía de usuario desde una épica
- [ ] Entiendes la diferencia entre documentación de calidad (trazabilidad) y documentación de usuario

---

## TEMA 3 — Skills
**Fecha límite: 17/03/2026**

### Qué es un Skill en Siesa Agents

Un skill es un archivo `SKILL.md` que expone información o capacidades de un dominio/equipo para que otros agentes lo puedan consumir. Viven en `.agents/skills/` y `.claude/skills/`.

**Estructura en el proyecto:**
```
.agents/skills/{dominio-sa-nombre-skill}/SKILL.md
.claude/skills/{dominio-sa-nombre-skill}/SKILL.md
```

### Archivos a leer

| Archivo | Por qué |
|---------|---------|
| `bmad6-mega-project-architecture(1) 2.md` (sección `.agents/skills/`) | Estructura de skills en el proyecto |
| `.claude/commands/` (cualquier skill instalado) | Ver ejemplos reales |
| `_bmad/_config/agent-manifest.csv` | Cómo están registrados los agentes que consumen skills |
| Skill `get-features` (instalado en Claude Code) | Ejemplo de skill de integración |
| Skill `jira_sync:feature_sync` | Ejemplo de skill de sincronización |

### CRUD de Skills

#### Crear un skill
1. Crear carpeta: `.claude/skills/{dominio}-sa-{nombre}/`
2. Crear `SKILL.md` con:
   - Propósito y contexto del dominio
   - Qué información expone
   - Cómo consumirlo (comandos, ejemplos)
3. Registrar en el manifest si aplica
4. Replicar en `.agents/skills/` para compatibilidad con OpenCode

#### Editar un skill
- Modificar `SKILL.md` directamente
- Actualizar versión/fecha si el skill tiene metadata
- Notificar a equipos que lo consumen si cambió la interfaz

#### Eliminar un skill
- Eliminar la carpeta completa
- Verificar que ningún workflow o agente lo referencia antes de borrar
- Actualizar manifest

#### Mantener un skill
- Revisar periódicamente que los datos expuestos sigan siendo válidos
- Actualizar cuando cambia la API o los DTOs del dominio

### Interacción entre Skills de Diferentes Dominios

**Patrón:** Un equipo expone un skill con sus DTOs/contratos. Otro equipo los consume en sus workflows.

```
Equipo Finance:
  .claude/skills/finance-sa-dto-inventory/SKILL.md
  → Expone: estructura de DTOs del módulo inventario

Equipo Ventas (consume):
  En su workflow carga el skill de Finance para conocer
  los contratos de integración
```

**Ejercicios:**

1. **Analiza un skill existente:** Lee cualquier skill instalado en `.claude/commands/` o `.claude/skills/`. Identifica: ¿qué expone? ¿quién lo consume? ¿cómo se invoca?

2. **Crea un skill de práctica:** Usa `/bmad:core:agents:bmad-master` con la instrucción de crear un skill ficticio llamado `pagos-sa-dto-factura` que exponga la estructura de una factura. Debe tener: campos requeridos, tipos de datos, ejemplo de uso.

3. **Edita el skill:** Agrega un campo nuevo `fecha_vencimiento` al skill que creaste.

4. **Simula consumo entre dominios:** Crea un segundo skill `ventas-sa-integracion-pagos` que en su descripción haga referencia al skill de `pagos-sa-dto-factura` y explique cómo se usa para generar una orden de pago.

5. **Documenta el proceso:** Escribe en un archivo `proceso-skills.md` el flujo completo de: creación → publicación → consumo → mantenimiento de un skill.

### Criterios de dominio

- [ ] Puedes crear un skill desde cero con la estructura correcta
- [ ] Sabes la diferencia entre `.agents/skills/` y `.claude/skills/` y para qué sirve cada uno
- [ ] Entiendes cómo un skill de un equipo es consumido por otro equipo
- [ ] Sabes qué verificar antes de eliminar un skill
- [ ] Puedes explicar el naming convention `{dominio}-sa-{nombre}`

---

## TEMA 4 — Test Architect (TEA)
**Fecha límite: 19/03/2026**

### Qué es TEA

TEA (Test Architect) es el agente `Murat` — un experto en arquitectura de testing. Tiene su propio conjunto de 8 sub-workflows especializados y una knowledge base completa.

### Archivos a leer (en orden)

| Orden | Archivo | Por qué |
|-------|---------|---------|
| 1 | `_bmad/bmm/agents/tea.md` | Definición del agente, capacidades y cuándo usarlo |
| 2 | `_bmad/bmm/workflows/testarch/test-design/checklist.md` | Punto de entrada: revisión de testeabilidad del sistema |
| 3 | `_bmad/bmm/workflows/testarch/atdd/checklist.md` + `atdd-checklist-template.md` | TDD rojo-verde-refactor |
| 4 | `_bmad/bmm/workflows/testarch/framework/checklist.md` | Setup Playwright o Cypress |
| 5 | `_bmad/bmm/workflows/testarch/automate/checklist.md` | Expansión de cobertura |
| 6 | `_bmad/bmm/workflows/testarch/ci/checklist.md` | CI/CD pipeline de calidad |
| 7 | `_bmad/bmm/workflows/testarch/test-review/checklist.md` | Revisión de calidad de tests |
| 8 | `_bmad/bmm/workflows/testarch/trace/checklist.md` | Trazabilidad req → tests |
| 9 | `_bmad/bmm/workflows/testarch/nfr-assess/checklist.md` | NFR: performance, seguridad |
| 10 | `_bmad/bmm/testarch/knowledge/` (todos los archivos) | Knowledge base completa |

### Los 8 Sub-workflows de TEA

```
1. test-design   → Revisión de testeabilidad antes de implementar
2. atdd          → Generar tests que fallan ANTES de escribir código
3. framework     → Inicializar infraestructura de testing (Playwright/Cypress)
4. automate      → Expandir cobertura de automatización post-implementación
5. ci            → Scaffold CI/CD con ejecución de tests y burn-in loops
6. test-review   → Revisión adversarial de calidad de tests existentes
7. trace         → Matriz de trazabilidad req → tests → gate decision
8. nfr-assess    → Validación de NFRs antes del release
```

### Estrategia de Pruebas Basada en Riesgos

**Concepto clave:** No se automatiza todo — se prioriza según riesgo.

**Knowledge base a estudiar:**
- `_bmad/bmm/testarch/knowledge/burn-in.md` — estrategia de burn-in
- `_bmad/bmm/testarch/knowledge/ci-burn-in.md` — integración en CI
- `_bmad/bmm/testarch/knowledge/component-tdd.md` — TDD por componente
- `_bmad/bmm/testarch/knowledge/contract-testing.md` — testing de contratos
- `_bmad/bmm/testarch/knowledge/data-factories.md` — fábricas de datos de prueba
- `_bmad/bmm/testarch/knowledge/api-request.md` — testing de APIs
- `_bmad/bmm/testarch/knowledge/auth-session.md` — testing de autenticación

### Ejercicios Prácticos

1. **Mapa de workflows TEA:** Sin mirar los archivos, dibuja los 8 sub-workflows con una frase de para qué sirve cada uno y en qué fase del desarrollo se usa.

2. **ATDD en práctica:**
   - Toma una historia de usuario simple (puedes inventarla: "Como usuario quiero hacer login con email y contraseña")
   - Ejecuta `/bmad:bmm:workflows:testarch-atdd` para generar los tests que fallan
   - Observa el output: ¿qué genera? ¿cómo se estructura?

3. **Trazabilidad:**
   - Ejecuta `/bmad:bmm:workflows:testarch-trace`
   - Entiende la matriz FR → Epic → Story → Test
   - ¿Cuándo el gate es PASS vs FAIL vs WAIVED?

4. **NFR Assessment:**
   - Lee el checklist de `nfr-assess`
   - ¿Qué dimensiones evalúa? (performance, seguridad, reliability, mantenibilidad)
   - ¿Qué evidencia se necesita para cada dimensión?

5. **Test Review adversarial:**
   - Lee el checklist de `test-review`
   - Lista las 5 preguntas más importantes que hace el revisor adversarial
   - ¿Por qué es "adversarial" y no solo una revisión normal?

6. **Framework setup:**
   - Ejecuta `/bmad:bmm:workflows:testarch-framework`
   - ¿Qué estructura de carpetas genera? ¿Qué archivos de configuración crea?

### Criterios de dominio

- [ ] Puedes nombrar los 8 sub-workflows y decir cuándo usar cada uno
- [ ] Entiendes el ciclo rojo-verde-refactor del ATDD y puedes aplicarlo
- [ ] Sabes qué es una matriz de trazabilidad y cómo hacer un gate decision
- [ ] Puedes configurar un framework de testing desde cero con TEA
- [ ] Entiendes qué evalúa NFR assessment y qué evidencia requiere
- [ ] Sabes qué hace el `burn-in` loop en CI y por qué existe

---

## Resumen de Compromisos

| # | Tema | Fecha | Archivos clave |
|---|------|-------|----------------|
| 1 | Workflows / Siesa Agents | **11/03** (mañana) | `siesa-agents-flujo-fases 1.md`, `workflow_ext.md` x3, `shard-doc.md` |
| 2 | Integraciones | **13/03** | `workflow_ext.md` PRD, `sync-epics-stories/`, `dev-story/checklist.md` |
| 3 | Skills | **17/03** | `bmad6-mega-project-architecture.md` (sección skills), skills instalados |
| 4 | TEA | **19/03** | `tea.md`, 8 checklists de testarch, knowledge base completa |

---

## Tips de Estudio

- **Lee los `checklist.md`** de cada workflow — son los más densos en conocimiento
- **Los `workflow_ext.md`** de `_siesa-agents` son pequeños pero cruciales — son la diferencia entre BMAD base y Siesa Agents
- **Practica ejecutando** cada workflow, no solo leyendo — la metodología se aprende haciendo
- **Para cada workflow pregúntate:** ¿qué consume? ¿qué produce? ¿quién lo ejecuta (qué agente)?
