# run-acceptance-tests — Guía de Uso

**Comando:** `/bmad:bmm:workflows:run-acceptance-tests`

Ejecuta los casos de prueba definidos en `test-cases.csv` sobre la aplicación real usando el MCP de Playwright, valida los criterios de aceptación por épica y actualiza el CSV con los resultados.

---

## Requisito previo

El **MCP de Playwright** debe estar configurado y activo en la sesión de Claude Code.
Sin él, el workflow se detiene y muestra instrucciones de instalación.

---

## Cómo invocarlo

```bash
# Interactivo — muestra menú de selección
/bmad:bmm:workflows:run-acceptance-tests

# Directo por épica
/bmad:bmm:workflows:run-acceptance-tests epic_id="EPIC-PPS-F1"
/bmad:bmm:workflows:run-acceptance-tests epic_id="EPIC-PPS-F2"
/bmad:bmm:workflows:run-acceptance-tests epic_id="EPIC-PPS-F3"
/bmad:bmm:workflows:run-acceptance-tests epic_id="EPIC-PPS-F4"

# Caso específico
/bmad:bmm:workflows:run-acceptance-tests epic_id="EPIC-PPS-F1" test_case_id="TC-F1-003"
```

---

## Flujo de ejecución

```
INIT ──→ STEP 1 ──→ STEP 2 ──→ STEP 3 ──→ STEP 4 ──→ STEP 5
         Cargar      Selección   Setup       Ejecutar    Reporte
         artefactos  de épica    navegador   casos       final
```

### INIT — Inicialización

1. Lee `_bmad/core/config.yaml` y `_bmad/bmm/config.yaml`
2. Resuelve rutas: `implementation_artifacts`, `quality_process_root`
3. **Verifica que el MCP de Playwright está disponible** — si no, se detiene

### STEP 1 — Carga de Artefactos

Carga automáticamente desde `_bmad-output/implementation-artifacts/quality-process/`:

| Archivo | Uso |
|---|---|
| `planeacion/test-design-2026-04-09-100000/test-cases.csv` | Fuente principal de casos |
| `planeacion/test-design-2026-04-09-100000/test-design-phase2-fac.md` | Criterios de aceptación en Gherkin |
| `planeacion/test-design-2026-04-09-100000/test-design-phase4-test-matrix.md` | Matriz de pruebas con técnicas y riesgos |
| `planeacion/test-design-2026-04-09-100000/test-design-complete.md` | Documento maestro |
| `diseno/*/test-plan.md` | Estrategia QA (si existe) |

Parsea el CSV y agrupa los 92 casos por épica:

| Épica | Feature | Casos |
|---|---|---|
| EPIC-PPS-F1 | Application Navigation Shell | ~12 |
| EPIC-PPS-F2 | Client Management | ~27 |
| EPIC-PPS-F3 | Contact Management | ~26 |
| EPIC-PPS-F4 | Client-Contact Association | ~27 |

### STEP 2 — Modo y Selección

Primero pregunta el **modo de ejecución**:

```
¿Cómo deseas ejecutar las pruebas?

  1. Por Épica   — Selecciona una épica específica y ejecuta sus casos
  2. Por Feature — Selecciona un feature completo y ejecuta todos sus casos en secuencia
```

**Si elige Por Épica**, muestra las 4 épicas del CSV:
- EPIC-PPS-F1 — Application Navigation Shell
- EPIC-PPS-F2 — Client Management
- EPIC-PPS-F3 — Contact Management
- EPIC-PPS-F4 — Client-Contact Association

**Si elige Por Feature**, lee `feature-status.yaml` y muestra los features con nombres legibles:
- feature-1 — Foundation (Application Shell)
- feature-2 — Gestión de Clientes
- feature-3 — Gestión de Contactos
- feature-4 — Asociación Cliente-Contacto
- **Todos los features** — suite completa (F1 → F2 → F3 → F4 en secuencia)

En ambos modos, el workflow **clasifica automáticamente** los casos según compatibilidad con Playwright:

| Compatible | Tipo | Herramienta real |
|---|---|---|
| ✅ Sí | `Automated-E2E` | Playwright MCP |
| ✅ Sí | `Manual` | Playwright MCP (el QA confirma visualmente) |
| ⏭️ Auto-Skipped | `Automated-FE` | Vitest + React Testing Library |
| ⏭️ Auto-Skipped | `Automated-BE` | xUnit / Supertest |
| ⏭️ Auto-Skipped | `Security` | OWASP ZAP / Burp Suite |
| ⏭️ Auto-Skipped | `Performance` | k6 / JMeter |

Los casos incompatibles se marcan automáticamente como `Skipped` en el CSV con una nota explicativa. El QA solo ve y elige entre los casos ejecutables:

```
✅ Ejecutables con Playwright (17 casos):
   • Automated-E2E  → 12 casos
   • Manual         → 5 casos

⏭️ Se omitirán automáticamente (10 casos):
   • Automated-FE   → 5 casos  (requiere Vitest + RTL)
   • Automated-BE   → 3 casos  (requiere xUnit)
   • Performance    → 2 casos  (requiere k6 / JMeter)
```

Si elige **"Otra opción →"**, aparece un submenú con:
- Solo Not Started
- Solo fallidos (re-test de Fail o Blocked)
- Todos (incluyendo re-ejecución)
- Caso específico por TC-ID

El ambiente es siempre **Local** — la URL se lee automáticamente de `environments.yaml`, sin preguntar al QA.

### STEP 3 — Setup

- Muestra los criterios de aceptación (FAC en Gherkin) de la épica seleccionada
- Abre el navegador con `playwright_navigate` y toma un screenshot de confirmación

### STEP 4 — Ejecución (caso por caso)

Para cada caso de prueba:

```
1. Muestra precondiciones
2. Navega a la URL base (estado limpio)
3. Ejecuta cada paso con las herramientas MCP:
   - playwright_navigate   → navegar
   - playwright_click      → hacer clic
   - playwright_fill       → llenar formularios
   - playwright_screenshot → capturar evidencia
   - playwright_evaluate   → verificar JS/DOM/red
   - playwright_wait_for_element → esperar carga
4. Compara resultado observado vs. resultado esperado
5. Determina estado: Pass / Fail / Blocked / Skipped
6. Si Fail: pide descripción del fallo e ID de defecto
7. Actualiza el CSV INMEDIATAMENTE (sin esperar al final)
```

Estrategia por tipo de prueba:

| Tipo CSV | Estrategia |
|---|---|
| `Automated-E2E` | Flujo completo: navegar → interactuar → validar UI + red |
| `Automated-FE` | Navegar → interactuar → evaluar DOM/estado React |
| `Automated-BE` | Interceptar requests/responses con `playwright_evaluate` |
| `Manual` | Ejecutar pasos → pedir confirmación visual al operador |
| `Security` | Enviar payloads maliciosos → verificar respuesta segura |
| `Performance` | Medir con `performance.timing` vía `playwright_evaluate` |

Si Playwright falla en un paso, el workflow ofrece: Reintentar / Saltar / Marcar Blocked / Pausar.

### STEP 5 — Reporte Final

Genera el reporte en:
```
_bmad-output/implementation-artifacts/quality-process/ejecucion/
  test-run-{EPIC-ID}-{YYYY-MM-DD-HHmmss}/
    test-execution-report.md
```

El reporte incluye:
- Resumen ejecutivo con porcentajes Pass/Fail/Blocked/Skipped
- **Decisión Go/No-Go** automática
- Criterios de aceptación evaluados (Validado / No cumple / Parcial)
- Tabla detallada de todos los casos ejecutados
- Lista de defectos encontrados con descripción
- Riesgos residuales (casos Skipped/Blocked)
- Próximos pasos recomendados

---

## Qué lee y qué escribe

### Lee (inputs)
```
_bmad/core/config.yaml
_bmad/bmm/config.yaml
_bmad-output/implementation-artifacts/quality-process/planeacion/test-design-2026-04-09-100000/
  ├── test-cases.csv                    ← fuente principal
  ├── test-design-phase2-fac.md         ← criterios Gherkin
  ├── test-design-phase4-test-matrix.md ← matriz de pruebas
  └── test-design-complete.md           ← documento maestro
_bmad-output/implementation-artifacts/quality-process/diseno/*/test-plan.md
```

### Escribe (outputs)
```
_bmad-output/implementation-artifacts/quality-process/planeacion/test-design-2026-04-09-100000/
  └── test-cases.csv                    ← actualizado con resultados

_bmad-output/implementation-artifacts/quality-process/ejecucion/
  └── test-run-{EPIC-ID}-{timestamp}/
        └── test-execution-report.md    ← reporte generado
```

---

## Estados del CSV

| Estado | Significado |
|---|---|
| `Not Started` | Aún no ejecutado (valor inicial) |
| `Pass` | Resultado observado coincide con el esperado |
| `Fail` | Resultado observado NO coincide con el esperado |
| `Blocked` | No se pudo ejecutar por prerequisito o error de ambiente |
| `Skipped` | No aplica en el ambiente actual |

---

## Épicas del proyecto

| ID Épica | Feature | Descripción |
|---|---|---|
| `EPIC-PPS-F1` | Application Navigation Shell | NavigationRail desktop, NavigationBar móvil, deep linking, 404 |
| `EPIC-PPS-F2` | Client Management | Listado, búsqueda, creación, edición, eliminación de clientes |
| `EPIC-PPS-F3` | Contact Management | Listado, búsqueda, creación, edición, eliminación de contactos |
| `EPIC-PPS-F4` | Client-Contact Association | Asociar, desasociar, reasignar contactos a clientes |
