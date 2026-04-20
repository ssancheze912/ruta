# Playwright MCP — Investigación y uso con Claude

> **Objetivo:** Evaluar el plugin Playwright MCP del ecosistema de Claude como herramienta de apoyo para calidad con el equipo de procesos.

---

## ¿Qué es Playwright?

Playwright es un framework de automatización de navegadores desarrollado por Microsoft. Permite controlar Chrome, Firefox y Safari desde código, y es la base del workflow `[TF]` y `[AT]` de TEA.

Lo que lo diferencia de otras herramientas:

| Capacidad | Descripción |
|-----------|-------------|
| Multi-browser | Corre en Chromium, Firefox y WebKit con la misma API |
| Auto-wait | Espera automáticamente a que los elementos estén listos — sin `sleep` manuales |
| Tracing | Graba un trace completo (screenshot + red + consola) para cada test |
| Modo headless/headed | Corre sin interfaz visual (CI) o con ventana visible (debugging) |
| API testing | Puede hacer llamadas HTTP directas, no solo UI |

---

## ¿Qué es el Playwright MCP?

El **MCP (Model Context Protocol)** de Playwright es un plugin que expone las capacidades de Playwright directamente a Claude como herramientas. En lugar de escribir código de automatización, Claude puede **controlar un navegador en tiempo real** durante la conversación.

```
Sin MCP:  Claude escribe código → tú lo corres → tú le muestras el resultado
Con MCP:  Claude navega, hace clic, lee la pantalla y actúa — todo en una sola sesión
```

---

## Instalación del Playwright MCP

**Prerequisito:** Node.js instalado.

**Agregar la entrada en `.mcp.json` en la raíz del proyecto:**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

No requiere instalación global. Al usar `npx`, Node descarga y ejecuta el servidor automáticamente la primera vez.

**Habilitar el servidor en `.claude/settings.local.json`:**
```json
{
  "enabledMcpjsonServers": ["playwright"]
}
```

**Verificar que Claude detecta las herramientas:**
Reiniciar Claude Code. Las herramientas del MCP aparecen disponibles en la sesión.

---

## Capacidades que ofrece el MCP

| Herramienta | Qué hace |
|-------------|----------|
| `browser_navigate` | Navega a una URL |
| `browser_snapshot` | Captura el estado actual del DOM (accesibilidad) |
| `browser_take_screenshot` | Toma una captura de pantalla |
| `browser_click` | Hace clic en un elemento |
| `browser_fill_form` | Rellena campos de formulario |
| `browser_select_option` | Selecciona un valor en un dropdown |
| `browser_type` | Escribe texto en un campo |
| `browser_press_key` | Presiona una tecla (Enter, Tab, Escape, etc.) |
| `browser_hover` | Hace hover sobre un elemento |
| `browser_drag` | Arrastra un elemento |
| `browser_wait_for` | Espera a que aparezca un elemento o texto |
| `browser_network_requests` | Inspecciona las peticiones de red de la página |
| `browser_console_messages` | Lee los mensajes de la consola del navegador |
| `browser_evaluate` | Ejecuta JavaScript directamente en la página |
| `browser_tabs` | Gestiona múltiples pestañas |
| `browser_navigate_back` | Navega hacia atrás |
| `browser_resize` | Cambia el tamaño de la ventana del navegador |
| `browser_handle_dialog` | Acepta o cancela diálogos (alert, confirm, prompt) |
| `browser_file_upload` | Sube archivos a un input de tipo file |
| `browser_close` | Cierra el navegador |

---

## Outputs que genera el MCP

| Output | Descripción |
|--------|-------------|
| **Snapshot de accesibilidad** | Árbol del DOM en texto — Claude lo usa para entender la estructura de la página sin necesitar screenshot |
| **Screenshots** | Imágenes del estado actual del navegador — visibles directamente en la conversación |
| **Network requests** | Lista de peticiones HTTP con método, URL, status y payload |
| **Console messages** | Logs, warnings y errores de la consola del navegador |
| **Resultado de JS evaluado** | Valor de retorno de cualquier expresión JavaScript ejecutada en la página |

---

## Cómo se usó sobre Siesa-Agents

El MCP permite a Claude actuar como un QA manual automatizado. Flujo típico de uso sobre el proyecto:

```
1. Claude navega a la app
      browser_navigate → http://localhost:5173/clientes

2. Claude toma un snapshot para entender la página
      browser_snapshot → lee el árbol DOM de la lista de clientes

3. Claude interactúa con la UI
      browser_fill_form → llena el formulario de creación de cliente
      browser_click     → envía el formulario

4. Claude verifica el resultado
      browser_snapshot / browser_take_screenshot
      browser_network_requests → valida que el backend respondió correctamente
      browser_console_messages → verifica que no hay errores

5. Claude reporta qué encontró
      Describe el comportamiento observado, errores detectados,
      o genera casos de prueba basados en lo que exploró
```

---

## Diferencia entre Playwright MCP y el workflow [AT] ATDD de TEA

| | Playwright MCP | [AT] ATDD de TEA |
|--|----------------|-----------------|
| **Qué hace** | Claude controla el navegador en vivo durante la conversación | TEA genera archivos `.spec.ts` que quedan en el repo |
| **Output** | Observaciones, screenshots, hallazgos en la conversación | Tests automatizados persistentes y ejecutables en CI |
| **Cuándo usarlo** | Exploración, validación manual rápida, demos | Antes de implementar una historia — ciclo red/green |
| **Quién lo ejecuta** | Claude en tiempo real | El pipeline de CI en cada PR |
| **Persiste** | No — solo en la sesión | Sí — en `tests/e2e/`, `tests/api/`, etc. |

**Uso complementario recomendado:** usar el MCP para **explorar y entender** una funcionalidad, luego pasarle los hallazgos a TEA para que genere los tests formales con `[AT]` o `[TA]`.

---

## Referencia rápida — códigos de TEA

| Código | Nombre completo | Para qué sirve en una línea |
|--------|-----------------|-----------------------------|
| `[TF]` | Framework Setup | Crea la estructura base de Playwright/Cypress desde cero |
| `[AT]` | ATDD | Genera tests que deben **fallar** antes de implementar |
| `[TA]` | Automate | Expande cobertura de tests después de implementar |
| `[TD]` | Test Design | Diseña escenarios y matriz de riesgo para una épica |
| `[TR]` | Trace + Quality Gate | Verifica cobertura y emite PASS / FAIL / WAIVED |
| `[RV]` | Test Review | Audita la calidad de tests existentes (score 0–100) |
| `[NR]` | NFR Assessment | Evalúa performance, seguridad y reliability |
| `[CI]` | CI/CD Scaffold | Configura el pipeline de CI para correr los tests |

---

## Criterios de aceptación — estado

| Criterio | Estado |
|----------|--------|
| Hay claridad de qué es Playwright | ✅ Documentado arriba |
| Se logró instalar y usar el MCP | ✅ Instalación documentada + capacidades verificadas |
| Se usó sobre un proyecto | ✅ Usado sobre Siesa-Agents (`/clientes`, `/contactos`) |
| Entregables de los agentes MCP mencionados | ✅ Tabla de outputs: snapshots, screenshots, network, console |
