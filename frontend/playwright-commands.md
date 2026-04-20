# Comandos Playwright — Pruebas E2E

> Todos los comandos se ejecutan desde el directorio `frontend/`.
> El servidor de desarrollo (`npm run dev`) se levanta automáticamente si no está corriendo.

---

## Scripts npm (atajos del proyecto)

| Script | Comando real | Descripción |
|---|---|---|
| `npm run test:e2e` | `npx playwright test` | Ejecuta todas las pruebas en modo headless |
| `npm run test:e2e:ui` | `npx playwright test --ui` | Abre la UI interactiva de Playwright |
| `npm run test:e2e:headed` | `npx playwright test --headed` | Ejecuta las pruebas con el navegador visible |

---

## Comandos completos de `npx playwright test`

### Ejecutar pruebas

```bash
# Todas las pruebas (headless, todos los browsers)
npx playwright test

# Con el navegador visible
npx playwright test --headed

# Abrir la UI interactiva (recomendado para desarrollo)
npx playwright test --ui
```

### Filtrar por archivo / spec

```bash
# Un archivo específico
npx playwright test tests/e2e/clientes.spec.ts
npx playwright test tests/e2e/contactos.spec.ts
npx playwright test tests/e2e/asociacion.spec.ts

# Por nombre del test (substring match)
npx playwright test --grep "nombre del test"

# Excluir tests por nombre
npx playwright test --grep-invert "nombre del test"
```

### Filtrar por browser

Los browsers configurados en este proyecto son: `chromium`, `firefox`, `webkit`.

```bash
# Solo Chromium (Chrome)
npx playwright test --project=chromium

# Solo Firefox
npx playwright test --project=firefox

# Solo WebKit (Safari)
npx playwright test --project=webkit

# Combinar archivo + browser
npx playwright test tests/e2e/clientes.spec.ts --project=chromium
```

### Modo depuración

```bash
# Abre el inspector de Playwright (paso a paso)
npx playwright test --debug

# Debug de un archivo específico
npx playwright test tests/e2e/clientes.spec.ts --debug

# Modo con trazas activadas (útil para CI)
npx playwright test --trace on
```

### Reintentos y workers

```bash
# Reintentar tests fallidos N veces
npx playwright test --retries=2

# Número de workers paralelos
npx playwright test --workers=4

# Deshabilitar paralelismo (serial)
npx playwright test --workers=1
```

### Variables de entorno

```bash
# Cambiar la URL base (por defecto: http://localhost:5173)
BASE_URL=http://localhost:3000 npx playwright test

# Simular entorno CI (forbidOnly, retries=2, workers=1)
CI=true npx playwright test
```

---

## Reportes

### Ver el reporte HTML después de ejecutar

```bash
npx playwright show-report
```

> El reporte se genera en `playwright-report/`. Los artefactos de fallos (screenshots, videos, traces) quedan en `test-results/`.

### Abrir una traza grabada

```bash
npx playwright show-trace test-results/<carpeta-del-test>/trace.zip
```

---

## Otros comandos útiles

```bash
# Instalar los browsers de Playwright
npx playwright install

# Instalar solo un browser
npx playwright install chromium

# Ver la versión instalada
npx playwright --version

# Listar todos los tests disponibles sin ejecutarlos
npx playwright test --list

# Listar tests de un archivo específico
npx playwright test tests/e2e/clientes.spec.ts --list

# Generar código automáticamente (Codegen - graba acciones en el browser)
npx playwright codegen http://localhost:5173
```

---

## Specs disponibles en este proyecto

| Archivo | Ruta |
|---|---|
| `clientes.spec.ts` | `tests/e2e/clientes.spec.ts` |
| `contactos.spec.ts` | `tests/e2e/contactos.spec.ts` |
| `asociacion.spec.ts` | `tests/e2e/asociacion.spec.ts` |

---

## Referencia rápida de flags

| Flag | Descripción |
|---|---|
| `--headed` | Muestra el navegador durante la ejecución |
| `--ui` | Abre la interfaz visual interactiva |
| `--debug` | Modo paso a paso con inspector |
| `--project=<name>` | Ejecuta solo en el browser indicado |
| `--grep "<pattern>"` | Filtra tests por nombre (regex) |
| `--retries=<n>` | Número de reintentos en caso de fallo |
| `--workers=<n>` | Número de tests paralelos |
| `--trace on\|off\|retain-on-failure` | Control de grabación de trazas |
| `--reporter=<type>` | Tipo de reporte: `html`, `list`, `junit`, `dot` |
| `--list` | Lista los tests sin ejecutarlos |
| `--timeout=<ms>` | Timeout global por test en milisegundos |
