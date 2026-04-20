# Playwright — Capacidades Completas

> Referencia de todo lo que puede hacer Playwright y cómo se mapea a las herramientas disponibles en este proyecto.

## Leyenda

| Símbolo | Significado |
|---|---|
| ✅ | Soportado completamente |
| ⚠️ | Soportado parcialmente / con limitaciones |
| ❌ | No soportado |

**TEA** = Agente BMAD (diseña estrategia, genera código de tests, no ejecuta)
**MCP** = `playwright-mcp` configurado en Claude Code (controla el browser en tiempo real)

---

## 1. Testing

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **E2E Testing** | Pruebas completas de flujos de usuario en browser real | ✅ Genera tests E2E, diseña escenarios, ATDD | ⚠️ Puede explorar manualmente pero no ejecuta suites |
| **Integration testing** | Combina llamadas API con acciones de UI en el mismo test | ✅ Genera código con fixtures composables | ❌ No tiene concepto de suite de tests |
| **API testing (sin browser)** | Peticiones HTTP directas vía `APIRequestContext` sin abrir browser | ✅ Genera tests de API con `api-request` util | ❌ MCP siempre opera sobre un browser |
| **Visual regression** | Compara screenshots pixel a pixel contra imágenes de referencia | ⚠️ Puede diseñar la estrategia, no gestiona baseline | ⚠️ Puede tomar screenshots pero no compara contra baseline |
| **Component testing** | Monta componentes React/Vue/Svelte en browser real con Vite | ⚠️ Puede generar tests de componente | ❌ No soportado en MCP |
| **Snapshot testing de texto** | Compara strings contra valores de referencia almacenados | ✅ Puede incluirlo en tests generados | ❌ No aplica |

---

## 2. Browser Automation

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **Navegación** | `goto()`, `goBack()`, `goForward()`, `reload()`, esperar URL | ✅ En código generado | ✅ `browser_navigate`, `browser_navigate_back` |
| **Sistema de Locators** | `getByRole`, `getByText`, `getByLabel`, `getByTestId`, CSS/XPath, encadenamiento | ✅ Knowledge base de selectores resilientes | ✅ Via `browser_snapshot` — trabaja con refs del árbol de accesibilidad |
| **Clicks** | Click simple, doble, derecho, con modificadores (Shift/Ctrl), espera auto de visibilidad | ✅ En código generado | ✅ `browser_click` |
| **Formularios** | `fill()`, `pressSequentially()`, `selectOption()`, `check()`, `clear()` | ✅ Genera fixtures de formularios | ✅ `browser_fill_form`, `browser_type`, `browser_select_option` |
| **Teclado** | Teclas individuales o combinaciones (`Control+A`, `Enter`, `F5`) | ✅ En código generado | ✅ `browser_press_key` |
| **Drag & Drop** | Arrastra elemento a otro, o control manual vía mouse down/move/up | ✅ En código generado | ✅ `browser_drag` |
| **File Upload** | Sube archivos a `<input type="file">`, acepta buffers en memoria | ✅ Genera tests con `file-utils` util | ✅ `browser_file_upload` |
| **iframes y frames** | `frameLocator()` para interactuar con contenido dentro de iframes | ✅ En código generado | ⚠️ Depende de si el árbol de accesibilidad penetra el iframe |
| **Shadow DOM** | Traversal automático de shadow roots abiertos | ✅ Genera locators que lo atraviesan | ⚠️ El snapshot incluye shadow DOM si es accesible |
| **Diálogos** | Acepta/descarta `alert()`, `confirm()`, `prompt()`, `beforeunload` | ✅ En código generado | ✅ `browser_handle_dialog` |
| **JavaScript en página** | `evaluate()`, `evaluateHandle()`, `addInitScript()`, `exposeFunction()` | ✅ En código generado | ✅ `browser_evaluate`, `browser_run_code` |
| **Hover** | Desplaza el mouse sobre un elemento sin hacer click | ✅ En código generado | ✅ `browser_hover` |

---

## 3. Network

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **Monitoreo de requests** | Escucha todas las peticiones/respuestas en tiempo real | ✅ Con `network-error-monitor` util | ✅ `browser_network_requests` (lista peticiones realizadas) |
| **Route mocking** | Intercepta URLs y responde con datos simulados (`fulfill`), cancela (`abort`) o modifica (`continue`) | ✅ Con `intercept-network-call` util, genera fixtures de mocking | ⚠️ Requiere `--caps network` en la config del MCP |
| **HAR files** | Graba peticiones reales a un archivo para replay offline | ✅ Con `network-recorder` util, genera código de record/playback | ❌ No soportado en MCP |
| **WebSockets** | Captura conexiones WS, intercepta mensajes en ambas direcciones | ✅ En código generado | ❌ No soportado en MCP |
| **Proxy** | Configura proxy HTTP/SOCKS a nivel de contexto | ✅ En configuración generada | ❌ Solo via config del servidor MCP |
| **Auth HTTP básica** | Credentials de Basic/Digest Authentication en el contexto | ✅ En configuración generada | ❌ No soportado en MCP |
| **Consola del browser** | Lee logs, errors y warnings emitidos por la página | ✅ Con `log` util | ✅ `browser_console_messages` |

---

## 4. Multi-browser y Emulación

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **Chromium / Chrome / Edge** | Tests en motor Chromium | ✅ En configuración de proyectos generada | ✅ Default del MCP (`--browser chrome`) |
| **Firefox** | Tests en motor Firefox | ✅ En configuración de proyectos generada | ✅ `--browser firefox` |
| **WebKit / Safari** | Tests en motor WebKit (Safari) en Linux/Windows | ✅ En configuración de proyectos generada | ✅ `--browser webkit` |
| **Emulación de dispositivos** | Perfiles predefinidos (iPhone 15, Pixel 7, iPad, etc.) con UA, viewport, touch | ✅ En configuración generada | ⚠️ Via `--device` en config del servidor MCP |
| **Geolocalización** | Fija coordenadas GPS para la sesión del browser | ✅ En código generado | ❌ No soportado en MCP |
| **Timezone y Locale** | Afecta `Date`, `Intl` y formato de números/fechas en el browser | ✅ En configuración generada | ❌ Solo via config del servidor MCP |
| **Color scheme** | Emula `prefers-color-scheme: dark/light` | ✅ En configuración generada | ❌ No soportado en MCP |
| **Offline mode** | Simula pérdida de conectividad | ✅ En código generado | ❌ Requiere `--caps network` y no está expuesto |
| **JS deshabilitado** | Prueba degradación graceful sin JavaScript | ✅ En código generado | ❌ No soportado en MCP |
| **Throttling de red/CPU** | Simula 3G lento, 4G, CPU degradada (via CDP) | ⚠️ Puede incluirlo en tests avanzados | ❌ No soportado en MCP |

---

## 5. Screenshots y Video

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **Screenshot de viewport** | Captura lo visible en la pantalla actual | ✅ En código generado | ✅ `browser_take_screenshot` |
| **Screenshot de página completa** | Captura toda la página con scroll (`fullPage: true`) | ✅ En código generado | ⚠️ `browser_take_screenshot` con `fullPage` |
| **Screenshot de elemento** | Captura solo el área de un locator específico | ✅ En código generado | ❌ No soportado en MCP |
| **Máscaras en screenshot** | Pinta en magenta áreas a ocultar antes de capturar | ✅ En código generado (visual regression) | ❌ No soportado en MCP |
| **Video recording** | Graba WebM de toda la ejecución, solo al fallar, o siempre | ✅ En configuración generada | ⚠️ Requiere `--caps devtools` |
| **Generación de PDF** | Genera PDF usando el motor de impresión de Chromium (solo Chromium) | ✅ En código generado | ⚠️ Requiere `--caps pdf` |

---

## 6. Autenticación

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **Storage State** | Serializa cookies + localStorage + IndexedDB a JSON para reutilizar sesión | ✅ Con `auth-session` util, genera setup de auth | ⚠️ Requiere `--caps storage` en MCP; `--storage-state` para cargar |
| **Global setup de auth** | Login una vez antes de toda la suite, reutilizando el estado en todos los tests | ✅ Genera proyecto de setup con `dependencies` | ❌ MCP no tiene concepto de suite |
| **Múltiples roles** | Diferentes storage states para admin, user, etc. en el mismo test | ✅ Con `auth-session` multi-usuario util | ❌ MCP opera con un solo contexto |
| **API login** | Hace login via HTTP sin UI para mayor velocidad | ✅ Con `api-request` + `auth-session` utils | ❌ MCP no combina API request con estado de browser automáticamente |
| **Email auth / magic links** | Manejo de flujos de auth con magic links y cacheo de tokens | ✅ Con `email-auth` knowledge | ❌ No soportado en MCP |

---

## 7. Paralelización

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **Workers paralelos** | Múltiples procesos OS con su propio browser | ✅ Configura en `playwright.config.ts` generado | ❌ MCP es una sola instancia de browser |
| **Paralelismo dentro de archivo** | `fullyParallel: true` o `test.describe.configure({ mode: 'parallel' })` | ✅ En configuración generada | ❌ No aplica |
| **Modo serial** | Fuerza secuencia en tests dependientes, saltando los siguientes si uno falla | ✅ En configuración generada | ❌ No aplica |
| **Sharding** | Distribuye tests entre múltiples máquinas con `--shard=1/3` | ✅ Con `ci-burn-in` knowledge, genera config de sharding | ❌ No aplica |
| **Burn-in selectivo** | Ejecuta solo los tests afectados por el git diff | ✅ Con `burn-in` util | ❌ No aplica |

---

## 8. CI/CD

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **GitHub Actions** | Workflow YAML con instalación de browsers, ejecución y upload de reportes | ✅ Workflow `[CI]` genera el YAML completo | ❌ No aplica |
| **Docker** | Imagen `mcr.microsoft.com/playwright` con browsers y deps del OS preinstalados | ✅ Genera Dockerfile y config CI | ❌ No aplica |
| **Sharding en CI** | Múltiples jobs paralelos + fusión de reportes con `merge-reports` | ✅ Con `ci-burn-in` knowledge | ❌ No aplica |
| **Azure / GitLab / CircleCI** | Ejemplos para otras plataformas CI | ✅ Genera config según plataforma | ❌ No aplica |
| **Quality Gate** | Decisión objetiva PASS/CONCERNS/FAIL/WAIVED antes del despliegue | ✅ Workflow `[TR]` Trace + Quality Gate | ❌ No aplica |

---

## 9. Debugging

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **Trace Viewer** | GUI con snapshots DOM, screenshots por acción, red y consola — abre con `show-trace` | ✅ Configura `trace: on-first-retry` en setup generado | ⚠️ Requiere `--caps devtools` |
| **Playwright Inspector** | GUI interactiva para avanzar acción a acción, editar locators en vivo | ✅ En conocimiento de debugging | ❌ MCP no tiene modo inspector interactivo |
| **Slow-Mo** | Agrega delay entre acciones para seguir visualmente la ejecución | ✅ En configuración generada | ❌ No soportado en MCP |
| **Headed mode** | Abre ventana de browser visible durante los tests | ✅ En configuración generada | ✅ Por defecto el MCP corre headed (sin `--headless`) |
| **page.pause()** | Punto de pausa que abre el Inspector y detiene ejecución | ✅ En código generado | ❌ No aplica en MCP |
| **Consola del browser** | Lee los mensajes emitidos por la página | ✅ Con `log` util | ✅ `browser_console_messages` |

---

## 10. Accessibility Testing

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **axe-core scan completo** | Escanea toda la página con axe y retorna violaciones WCAG | ✅ Genera tests con `@axe-core/playwright` | ❌ No soportado en MCP |
| **Escaneo selectivo** | `include(selector)` / `exclude(selector)` para analizar partes del DOM | ✅ En código generado | ❌ No soportado en MCP |
| **Filtrado por estándar WCAG** | `.withTags(['wcag2aa'])` para verificar solo un nivel de conformidad | ✅ En código generado | ❌ No soportado en MCP |
| **Árbol de accesibilidad** | `page.accessibility.snapshot()` retorna el árbol ARIA completo como JSON | ✅ En código generado | ✅ Es el mecanismo central del MCP — `browser_snapshot` expone el árbol de accesibilidad |

---

## 11. Performance

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **page.metrics()** | Métricas CDP de Chromium: JS heap, nodos, duraciones de layout/script | ✅ En workflow `[NR]` NFR Assessment | ❌ No soportado en MCP |
| **Web Performance API** | `performance.timing`, Core Web Vitals (LCP, FCP, CLS) via `evaluate()` | ✅ En workflow `[NR]` | ⚠️ Se puede hacer via `browser_evaluate` pero no hay herramienta dedicada |
| **CDP Session** | Acceso directo al Chrome DevTools Protocol para métricas avanzadas | ✅ En conocimiento avanzado | ❌ No soportado en MCP |
| **Throttling de red/CPU** | Simula 3G lento, CPU degradada via CDP | ✅ En workflow `[NR]` | ❌ No soportado en MCP |

---

## 12. Codegen (Generación de código)

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **Grabación de acciones** | Convierte interacciones del usuario a código Playwright en JS/TS/Python/Java/C# | ✅ Es la filosofía central de TEA — genera código a partir de historias | ❌ MCP genera automatización, no código de test |
| **Selección inteligente de locators** | Elige automáticamente el mejor locator disponible (role > texto > test-id > CSS) | ✅ Knowledge base de selector-resilience.md | ❌ MCP usa refs del árbol de accesibilidad (no locators de Playwright) |
| **Grabación de assertions** | Agrega assertions de visibilidad/texto/valor desde el Inspector | ✅ Genera assertions en código ATDD | ❌ No aplica |
| **Extensión VS Code** | Graba tests directamente desde el editor | ✅ Puede guiar su uso | ❌ No aplica |

---

## 13. API Testing (sin browser)

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **APIRequestContext** | GET/POST/PUT/DELETE/PATCH sin abrir browser, con headers y auth configurables | ✅ Con `api-request` util + fixtures generados | ❌ MCP siempre requiere un browser activo |
| **Sincronización de cookies con browser** | El contexto de API hereda cookies del BrowserContext y viceversa | ✅ Con `auth-session` + `api-request` utils combinados | ❌ No aplica |
| **Setup/teardown de estado via API** | Prepara o limpia datos del servidor antes/después del test E2E | ✅ Genera fixtures que usan API para setup | ❌ No aplica |

---

## 14. Component Testing

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **mount() / unmount()** | Monta componentes React/Vue/Svelte en browser real con Vite | ✅ Con `component-tdd` knowledge (red-green-refactor) | ❌ MCP no tiene soporte para component testing |
| **update()** | Actualiza props del componente montado dinámicamente | ✅ En código generado | ❌ No aplica |
| **Network mocking en componente** | Intercepta peticiones del componente via MSW | ✅ En código generado | ❌ No aplica |
| **Providers (Router, Redux, i18n)** | `beforeMount` hook para envolver el componente con providers necesarios | ✅ En código generado | ❌ No aplica |

---

## 15. Fixtures, Configuración y Utilidades

| Capacidad | Qué hace | TEA | MCP |
|---|---|---|---|
| **Sistema de fixtures** | Setup/teardown lazy e inyectable, con scope `test` o `worker` | ✅ Con `fixture-architecture` knowledge — genera fixtures composables con `mergeTests` | ❌ No aplica |
| **Fixtures automáticos** | `{ auto: true }` activa el fixture en todos los tests sin declararlo | ✅ En código generado | ❌ No aplica |
| **Fixtures de worker** | Se crean una vez por worker — ideal para conexiones BD, servidores levantados | ✅ En código generado | ❌ No aplica |
| **Hooks beforeEach/afterEach** | Setup local a un archivo o describe block | ✅ En código generado | ❌ No aplica |
| **Global setup con project dependencies** | Un proyecto `setup` que corre antes que todos los tests | ✅ En configuración generada | ❌ No aplica |
| **Clock API** | Controla `Date.now()` y timers (setTimeout, setInterval) para tests de tiempo | ✅ En código generado (countdowns, sesiones, polling) | ❌ No soportado en MCP |
| **Contract testing** | Pact / provider verification para contratos entre servicios | ✅ Con `contract-testing` knowledge | ❌ No aplica |
| **Feature flags testing** | Gestión de enums LaunchDarkly, targeting por usuario | ✅ Con `feature-flags` knowledge | ❌ No aplica |
| **Data factories** | Factories con faker para generar datos de prueba realistas | ✅ Con `data-factories` knowledge | ❌ No aplica |
| **Error handling y retry** | Patrones de manejo de excepciones y reintentos en tests | ✅ Con `error-handling` knowledge | ❌ No aplica en MCP |
| **Validación de archivos descargados** | Verifica CSV, XLSX, PDF, ZIP descargados por la app | ✅ Con `file-utils` util | ❌ No soportado en MCP |

---

## Resumen ejecutivo

| Área | TEA | MCP |
|---|---|---|
| Diseño y estrategia de testing | ✅ Especializado | ❌ No aplica |
| Generación de código de tests | ✅ Especializado | ❌ No genera código |
| Ejecución de suites de tests | ❌ No ejecuta | ❌ No ejecuta suites |
| Automatización de browser en tiempo real | ❌ No controla browser | ✅ Especializado |
| Exploración manual de la app | ❌ No aplica | ✅ Especializado |
| Tests de API sin browser | ✅ Genera código | ❌ Siempre requiere browser |
| Tests de componente | ✅ Genera código | ❌ No soportado |
| Paralelización y sharding | ✅ Configura y diseña | ❌ No aplica |
| CI/CD pipeline | ✅ Scaffolda completo | ❌ No aplica |
| Network mocking avanzado (HAR, WebSocket) | ✅ Con utils especializadas | ⚠️ Solo con `--caps network` |
| Debugging (trace viewer, inspector) | ✅ Configura y guía | ⚠️ Parcial con `--caps devtools` |
| Accesibilidad (axe-core) | ✅ Genera tests | ❌ Solo árbol de accesibilidad raw |
| Performance / NFR | ✅ Workflow dedicado `[NR]` | ⚠️ Parcial via `browser_evaluate` |
| Control del tiempo (Clock API) | ✅ Genera código | ❌ No soportado |

> **Regla simple:** TEA diseña y genera — MCP explora y automatiza en vivo. Son complementarios: TEA para construir la suite de tests, MCP para explorar la app y validar comportamientos en tiempo real.
