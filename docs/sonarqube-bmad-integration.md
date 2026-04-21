# SonarQube + BMAD — Mapa de integración

Dónde encaja cada comando Sonar dentro de los workflows de BMAD.

---

## `/sonar-verify` — gate rápido post-edición

> Escanea archivos staged + unstaged. Ideal al final de cualquier tarea de escritura de código.

| Workflow | Dónde insertar |
|----------|----------------|
| `dev-story` | Antes de marcar la story como done |
| `fast-track-dev` | Al final de cada iteración de código |
| `quick-dev` | Al final, antes de reportar resultado |

---

## `/sonar-scan` — guidelines + análisis con reporte

> Carga reglas Sonar para los archivos del contexto y corre análisis. Útil cuando se genera scaffolding o se define estructura.

| Workflow | Dónde insertar |
|----------|----------------|
| `create-architecture` | Al validar la arquitectura propuesta contra reglas reales |
| `testarch-framework` | Al generar el scaffolding inicial de tests |
| `testarch-automate` | Después de expandir cobertura de tests |

---

## `/sonar-review` — revisión completa pre-PR

> Diff contra `main`, guidelines para todos los archivos cambiados, reporte por severidad, READY TO MERGE / NOT READY.

| Workflow | Dónde insertar |
|----------|----------------|
| `code-review` | Como primer paso antes del review humano |
| `check-implementation-readiness` | Como gate de calidad antes de aprobar |
| `quality-process` | En la fase de validación final |
| `retrospective` | Para generar métricas de deuda técnica del sprint |

---

## Prioridad de implementación

Los workflows con mayor ROI son **`code-review`** y **`check-implementation-readiness`** — son los dos momentos donde ya se revisa calidad, así que Sonar llega justo antes en lugar de ser un paso extra.

Orden sugerido:

1. `dev-story` — impacto diario, convierte Sonar en parte del definition of done
2. `code-review` — llega antes que el review humano, filtra issues triviales
3. `check-implementation-readiness` — gate de calidad antes de aprobar
4. `quality-process` — cobertura en el proceso formal de QA
5. `fast-track-dev` / `quick-dev` — variantes de dev-story, mismo patrón
6. `create-architecture` / `testarch-*` — cobertura en fases de diseño y testing
7. `retrospective` — métricas de deuda técnica por sprint
