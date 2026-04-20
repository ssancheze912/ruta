# Playwright MCP — Referencia Técnica

**Qué es:** Servidor MCP oficial de Microsoft (`@playwright/mcp`) que permite a Claude controlar un navegador real. Expone el **árbol de accesibilidad** (snapshot en texto) en lugar de screenshots — más eficiente en tokens y determinístico.

**Docs:** https://playwright.dev/docs/getting-started-mcp | **GitHub:** https://github.com/microsoft/playwright-mcp

---

## Herramientas core disponibles

| Herramienta | Descripción |
|---|---|
| `browser_navigate` | Navega a una URL |
| `browser_snapshot` | Lee el árbol de accesibilidad (usar antes de interactuar) |
| `browser_click` | Click en un elemento por `ref` |
| `browser_type` | Escribe texto en un input |
| `browser_fill_form` | Rellena múltiples campos a la vez |
| `browser_press_key` | Simula tecla (`Enter`, `Tab`, etc.) |
| `browser_select_option` | Selecciona en un `<select>` |
| `browser_drag` | Drag-and-drop entre dos refs |
| `browser_hover` | Hover sobre un elemento |
| `browser_handle_dialog` | Acepta/descarta alerts, confirms, prompts |
| `browser_take_screenshot` | Captura visual |
| `browser_evaluate` | Ejecuta JavaScript en la página |
| `browser_console_messages` | Lee la consola del navegador |
| `browser_network_requests` | Lista las peticiones de red |
| `browser_resize` | Cambia el tamaño del viewport |
| `browser_navigate_back` | Retrocede en el historial |
| `browser_close` | Cierra la pestaña |
| `browser_tabs` | Gestión de pestañas |

**Capacidades extra** (requieren `--caps <nombre>`): `vision`, `network`, `storage`, `testing`, `devtools`, `pdf`

---

## Loop de trabajo

Cada interacción sigue este ciclo obligatorio. Claude no puede actuar sobre un elemento que no ha visto primero.

```
1. browser_snapshot       →  Claude lee la página: obtiene el árbol de accesibilidad con todos
                              los elementos y sus refs (ej: ref="e42", ref="e17")

2. Identificar ref         →  Claude localiza el elemento objetivo en el snapshot
                              (ej: botón "Guardar" tiene ref="e42")

3. Ejecutar acción         →  Claude llama browser_click(ref="e42") u otra herramienta
                              usando ese ref como identificador

4. browser_snapshot        →  Claude vuelve a leer la página para verificar que el cambio
                              ocurrió (nueva vista, error, modal abierto, etc.)

5. Repetir                 →  Continúa hasta completar la tarea
```

> Los `ref` son efímeros: cambian con cada snapshot. Nunca reutilizar un ref de un snapshot anterior.

---

## Config en Claude Code

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

**Flags útiles:**

| Flag | Descripción |
|---|---|
| `--headless` | Ejecuta el navegador sin abrir ventana visible. Útil en servidores o entornos CI donde no hay display. |
| `--browser chrome\|firefox\|webkit` | Elige el motor del navegador. `chrome` es el default y el más compatible. `webkit` es el motor de Safari. |
| `--isolated` | Inicia el navegador con un perfil temporal en memoria — sin cookies, sin sesión guardada, sin historial. Cada ejecución parte desde cero. También permite correr múltiples instancias en paralelo. |
| `--caps network,storage,testing` | Activa grupos de herramientas extra. `network` habilita mocking de rutas; `storage` da acceso a cookies y localStorage; `testing` agrega herramientas de aserción. Se pueden combinar con comas. |
| `--viewport-size "1280x720"` | Define el tamaño del viewport en píxeles. Afecta qué elementos son visibles y cómo responde el layout responsive de la app. |

**Perfil del navegador (Windows):** `%USERPROFILE%\AppData\Local\ms-playwright\mcp-chrome-profile`
— Eliminar para iniciar sesión limpia.

---

## Costos en tokens

| Modo | Qué hace | Costo aproximado |
|---|---|---|
| Snapshot (default) | Lee el árbol de accesibilidad: estructura en texto de todos los elementos interactivos de la página (botones, links, inputs, etc.). Claude interactúa referenciando IDs estables (`ref`). | ~2–5 KB por snapshot |
| Vision mode (`--caps vision`) | Toma screenshots del viewport y Claude interactúa por coordenadas X/Y. Necesario para canvas, SVGs interactivos o páginas con HTML no semántico. | ~500 KB–2 MB por screenshot |
| Tarea típica completa | — | ~114,000 tokens |

Snapshot mode es ~100–400x más barato que vision mode. Preferir siempre snapshot salvo que la UI no tenga árbol de accesibilidad (canvas, HTML no semántico).

---

## Notas

- El error **"Browser is already in use"** ocurre cuando hay otra instancia activa. Usar `--isolated` para correr instancias paralelas.
- Vision mode (`--caps vision`): usa coordenadas X/Y en lugar de refs — útil para canvas o HTML no semántico, pero más frágil y costoso en tokens.
