---
name: run-all-acceptance-tests
description: "Ejecuta TODOS los casos de prueba compatibles con Playwright (Automated-E2E + Manual) desde test-cases.csv sin filtros ni menús. Actualiza el CSV con resultados en tiempo real."
version: 1.0.0
---

# Script — Ejecución Completa de Casos de Prueba con Playwright MCP

**Modo:** Automático — sin preguntas de filtrado. Carga el CSV, ejecuta todos los casos
compatibles con Playwright en orden y actualiza los resultados caso a caso.

**Casos ejecutables:** `Automated-E2E` y `Manual`
**Casos omitidos automáticamente:** `Automated-FE`, `Automated-BE`, `Security`, `Performance`

---

## EJECUCIÓN

### S1: Cargar configuración y CSV

1. Leer `{project-root}/_bmad/bmm/config.yaml` → resolver `{implementation_artifacts}`
2. Leer el CSV completo:
   `{implementation_artifacts}/quality-process/planeacion/test-design-2026-04-09-100000/test-cases.csv`
3. Parsear todas las filas en memoria
4. Separar en dos grupos:
   ```
   ejecutables = filas donde "Tipo prueba" IN ["Automated-E2E", "Manual"]
   omitidos    = filas donde "Tipo prueba" NOT IN ["Automated-E2E", "Manual"]
   ```
5. Dentro de `ejecutables`, priorizar los `Not Started` primero; al final los ya ejecutados.

Notificar:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 RUN ALL — Ejecución completa con Playwright MCP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Total casos en CSV:      {total}
✅ Ejecutables (Playwright): {N ejecutables}
⏭️  Omitidos (auto-Skipped): {N omitidos}

Orden de ejecución: Automated-E2E primero, luego Manual
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### S2: Marcar omitidos en CSV

Antes de abrir el navegador, persistir los casos omitidos en el CSV:
- `Estado = "Skipped"`
- `Fecha Ejecución = {DD-MM-YYYY}`
- Agregar al campo `Notas`: ` | Auto-Skipped: requiere {herramienta}`
  - `Automated-FE`  → `Vitest + RTL`
  - `Automated-BE`  → `xUnit`
  - `Security`      → `OWASP ZAP / Burp`
  - `Performance`   → `k6 / JMeter`

Escribir CSV con Write tool (nunca bash/sed/awk).

---

### S3: Abrir navegador

Leer `{workflow_root}/environments.yaml` → tomar el ambiente `id: local` → `app_base_url`.

```
🌐 Abriendo navegador → {app_base_url}
```

Ejecutar:
1. `playwright_navigate` con `url = {app_base_url}`
2. `playwright_screenshot` para confirmar carga
3. Si no responde → notificar error y detener

---

### S4: Bucle de ejecución

Iterar sobre cada caso en `ejecutables` en orden secuencial.

Para cada caso:

```
━━━ [{n}/{total_ejecutables}] {tc_id} — {title} ━━━
Épica: {epic_id} | Tipo: {test_type}
```

#### S4.1 — Precondiciones

Leer `Precondiciones` del caso.

- Si incluye viewport específico → configurar antes de navegar
- Navegar a `{app_base_url}` para estado limpio

#### S4.2 — Ejecutar pasos

Los pasos vienen en `Pasos de Ejecución` separados por ` | `.

Para cada paso, mapear a herramienta MCP y ejecutar:

| Indicador en el paso | Herramienta MCP |
|---|---|
| "abrir", "navegar", "ir a" | `playwright_navigate` |
| "hacer clic", "clic en", "presionar" | `playwright_click` |
| "escribir", "ingresar", "llenar" | `playwright_fill` |
| "verificar", "observar", "comprobar" | `playwright_evaluate` o `playwright_wait_for_element` |
| "esperar" | `playwright_wait_for_element` |
| "capturar" | `playwright_screenshot` |
| "seleccionar" (dropdown) | `playwright_select_option` |

Mostrar progreso por paso:
```
  ▶ Paso {n}: {texto del paso}
    → ejecutado
```

#### S4.3 — Validar resultado

Comparar estado del navegador contra `Resultados Esperados`.

Tomar `playwright_screenshot` como evidencia.

#### S4.4 — Determinar estado

```
Pass    → resultado observado coincide con el esperado
Fail    → resultado observado NO coincide
Blocked → no se pudo ejecutar (prerequisito faltante, error de ambiente)
```

Mostrar:
```
  ✅ PASS
  ❌ FAIL  → {descripción breve de la discrepancia}
  ⚠️ BLOCKED → {razón}
```

**Si FAIL:** pedir descripción del fallo e ID de defecto:
```
❌ [{tc_id}] falló. Describe brevemente lo que viste:
[texto libre del QA]

¿ID de defecto? (opcional):
```

#### S4.5 — Actualizar CSV inmediatamente

Después de cada caso, leer el CSV completo → actualizar la fila del `tc_id` → escribir con Write tool:

| Campo | Valor |
|---|---|
| `Fecha Ejecución` | `{DD-MM-YYYY}` |
| `Estado` | `Pass` / `Fail` / `Blocked` |
| `ID Defecto` | ID si existe |
| `Descripción Fallo` | Descripción si Fail/Blocked |

Confirmar: `✅ CSV actualizado [{tc_id}] → {estado}`

#### S4.6 — Progreso global

```
📊 [{n}/{total_ejecutables}] ✅{pass} ❌{fail} ⚠️{blocked} — Siguiente: {next_tc_id}
```

#### S4.7 — Error de Playwright

Si una herramienta MCP falla:
```
⚠️ Error en Playwright: {mensaje}
   [R] Reintentar  [S] Saltar paso  [B] Marcar Blocked  [P] Pausar
```

---

### S5: Reporte final

Al terminar todos los casos ejecutables, generar reporte en:
```
{implementation_artifacts}/quality-process/ejecucion/
  test-run-ALL-{YYYY-MM-DD-HHmmss}/
    test-execution-report.md
```

**Contenido del reporte:**

```markdown
# Test Execution Report — Suite Completa
Fecha: {DD-MM-YYYY} | Ambiente: {app_base_url} | Ejecutado por: {user_name}

## Resumen

| | Cantidad | % del total CSV |
|---|---|---|
| Total CSV | {total} | 100% |
| Ejecutados con Playwright | {ejecutables} | {%} |
| ✅ Pass | {pass} | {%} |
| ❌ Fail | {fail} | {%} |
| ⚠️ Blocked | {blocked} | {%} |
| ⏭️ Auto-Skipped | {omitidos} | {%} |

Tasa de éxito (sobre ejecutados): {pass/ejecutables * 100}%

## Decisión Go / No-Go
{GO si pass% ≥ 80% y sin casos P0 fallidos}
{NO-GO si hay casos P0 fallidos o pass% < 80%}

## Defectos encontrados
| TC-ID | Épica | Título | Descripción | ID Defecto |
|---|---|---|---|---|
{filas de casos Fail}

## Casos Blocked
| TC-ID | Épica | Razón del bloqueo |
|---|---|---|
{filas de casos Blocked}

## Casos Auto-Skipped (requieren otra herramienta)
| TC-ID | Tipo | Herramienta requerida |
|---|---|---|
{filas de casos omitidos}
```

Mostrar al finalizar:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ EJECUCIÓN COMPLETA FINALIZADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Ejecutados: {N} | ✅ {pass} Pass | ❌ {fail} Fail | ⚠️ {blocked} Blocked
⏭️  Auto-Skipped: {omitidos} (requieren Vitest / xUnit / ZAP / k6)

🎯 Go/No-Go: {resultado}

📁 CSV actualizado: quality-process/planeacion/test-design-2026-04-09-100000/test-cases.csv
📄 Reporte: quality-process/ejecucion/test-run-ALL-{timestamp}/test-execution-report.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

*(Note: `workflow_root` es `{project-root}/_siesa-agents/bmm/workflows/4-implementation/run-acceptance-tests`)*
