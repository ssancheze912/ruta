# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clientes.spec.ts >> EPIC-SA-F2 — Clientes Create >> TC-F2-24 [P1] Doble clic en Guardar no crea duplicados
- Location: tests\e2e\clientes.spec.ts:340:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Cliente Doble Click E2E').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Cliente Doble Click E2E').first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - img "Siesa" [ref=e6]
  - generic [ref=e8]:
    - generic [ref=e11]:
      - generic [ref=e12]:
        - button "Clientes" [ref=e13] [cursor=pointer]:
          - img [ref=e16]
        - button "Contactos" [ref=e18] [cursor=pointer]:
          - img [ref=e21]
      - generic [ref=e23]:
        - separator [ref=e24]
        - button "Expandir" [ref=e26]:
          - img [ref=e28]
    - generic [ref=e32]:
      - generic [ref=e33]:
        - heading "Clientes" [level=1] [ref=e34]
        - button "Nuevo cliente" [ref=e35]:
          - generic [ref=e36]: Nuevo cliente
      - textbox "Buscar clientes" [ref=e40]:
        - /placeholder: Buscar por nombre o NIT/RUC
      - generic [ref=e43]:
        - button "Nombre" [ref=e44] [cursor=pointer]:
          - generic [ref=e45]: Nombre
        - generic [ref=e49]: NIT/RUC
        - generic [ref=e51]: Teléfono
        - generic [ref=e53]: Ciudad
        - generic [ref=e55]:
          - generic [ref=e57]: testttt
          - generic [ref=e59]: "1233123"
          - generic [ref=e61]: "1233213"
          - generic [ref=e63]: Calidfdfdf
          - generic [ref=e66]:
            - button "Ver" [ref=e67]:
              - generic [ref=e68]: Ver
            - button "Editar" [ref=e69]:
              - generic [ref=e70]: Editar
            - button "Eliminar" [ref=e71]:
              - generic [ref=e72]: Eliminar
        - generic [ref=e73]:
          - generic [ref=e75]: SANTIAGO SANCHEZ ESQUIVEL
          - generic [ref=e77]: "12331233"
          - generic [ref=e79]: "3186287645"
          - generic [ref=e81]: CALI
          - generic [ref=e84]:
            - button "Ver" [ref=e85]:
              - generic [ref=e86]: Ver
            - button "Editar" [ref=e87]:
              - generic [ref=e88]: Editar
            - button "Eliminar" [ref=e89]:
              - generic [ref=e90]: Eliminar
        - generic [ref=e91]:
          - generic [ref=e93]: SANTIAGOaaaa SANCHEZ ESQUIVEL
          - generic [ref=e95]: 123fff
          - generic [ref=e97]: 3186287645f
          - generic [ref=e99]: CALI
          - generic [ref=e102]:
            - button "Ver" [ref=e103]:
              - generic [ref=e104]: Ver
            - button "Editar" [ref=e105]:
              - generic [ref=e106]: Editar
            - button "Eliminar" [ref=e107]:
              - generic [ref=e108]: Eliminar
        - generic [ref=e109]:
          - generic [ref=e111]: SANTIAGO SANCHEZ ESQUIVEL
          - generic [ref=e113]: "12323"
          - generic [ref=e115]: "3186287645"
          - generic [ref=e117]: CALI
          - generic [ref=e120]:
            - button "Ver" [ref=e121]:
              - generic [ref=e122]: Ver
            - button "Editar" [ref=e123]:
              - generic [ref=e124]: Editar
            - button "Eliminar" [ref=e125]:
              - generic [ref=e126]: Eliminar
        - generic [ref=e127]:
          - generic [ref=e129]: SANTIAGO SANCHEZ ESQUIVEL
          - generic [ref=e131]: "11"
          - generic [ref=e133]: "3186287645"
          - generic [ref=e135]: CALI
          - generic [ref=e138]:
            - button "Ver" [ref=e139]:
              - generic [ref=e140]: Ver
            - button "Editar" [ref=e141]:
              - generic [ref=e142]: Editar
            - button "Eliminar" [ref=e143]:
              - generic [ref=e144]: Eliminar
        - generic [ref=e145]:
          - generic [ref=e147]: Concurrente NIT
          - generic [ref=e149]: RACE1776281874672
          - generic [ref=e151]: "111"
          - generic [ref=e153]: Test
          - generic [ref=e156]:
            - button "Ver" [ref=e157]:
              - generic [ref=e158]: Ver
            - button "Editar" [ref=e159]:
              - generic [ref=e160]: Editar
            - button "Eliminar" [ref=e161]:
              - generic [ref=e162]: Eliminar
        - generic [ref=e163]:
          - generic [ref=e165]: Concurrente NIT
          - generic [ref=e167]: RACE1776260909754
          - generic [ref=e169]: "111"
          - generic [ref=e171]: Test
          - generic [ref=e174]:
            - button "Ver" [ref=e175]:
              - generic [ref=e176]: Ver
            - button "Editar" [ref=e177]:
              - generic [ref=e178]: Editar
            - button "Eliminar" [ref=e179]:
              - generic [ref=e180]: Eliminar
        - generic [ref=e181]:
          - generic [ref=e183]: Empresa UI E2E
          - generic [ref=e185]: "123456789"
          - generic [ref=e187]: "3001234567"
          - generic [ref=e189]: Bogotá
          - generic [ref=e192]:
            - button "Ver" [ref=e193]:
              - generic [ref=e194]: Ver
            - button "Editar" [ref=e195]:
              - generic [ref=e196]: Editar
            - button "Eliminar" [ref=e197]:
              - generic [ref=e198]: Eliminar
        - generic [ref=e199]:
          - generic [ref=e201]: Empresa XYZ
          - generic [ref=e203]: 800111222-3
          - generic [ref=e205]: +57 300 5555555
          - generic [ref=e207]: Cali
          - generic [ref=e210]:
            - button "Ver" [ref=e211]:
              - generic [ref=e212]: Ver
            - button "Editar" [ref=e213]:
              - generic [ref=e214]: Editar
            - button "Eliminar" [ref=e215]:
              - generic [ref=e216]: Eliminar
        - generic [ref=e217]:
          - generic [ref=e219]: Concurrente NIT
          - generic [ref=e221]: RACE1776260185437
          - generic [ref=e223]: "111"
          - generic [ref=e225]: Test
          - generic [ref=e228]:
            - button "Ver" [ref=e229]:
              - generic [ref=e230]: Ver
            - button "Editar" [ref=e231]:
              - generic [ref=e232]: Editar
            - button "Eliminar" [ref=e233]:
              - generic [ref=e234]: Eliminar
        - generic [ref=e235]:
          - generic [ref=e237]: Empresa Detalle Completa
          - generic [ref=e239]: "800555666"
          - generic [ref=e241]: "3109876543"
          - generic [ref=e243]: Cali
          - generic [ref=e246]:
            - button "Ver" [ref=e247]:
              - generic [ref=e248]: Ver
            - button "Editar" [ref=e249]:
              - generic [ref=e250]: Editar
            - button "Eliminar" [ref=e251]:
              - generic [ref=e252]: Eliminar
        - generic [ref=e253]:
          - generic [ref=e255]: Concurrente NIT
          - generic [ref=e257]: RACE1776261755400
          - generic [ref=e259]: "111"
          - generic [ref=e261]: Test
          - generic [ref=e264]:
            - button "Ver" [ref=e265]:
              - generic [ref=e266]: Ver
            - button "Editar" [ref=e267]:
              - generic [ref=e268]: Editar
            - button "Eliminar" [ref=e269]:
              - generic [ref=e270]: Eliminar
```

# Test source

```ts
  258 |   test('TC-F2-09 [P3] Deep link con ID inexistente muestra not-found', async ({ page }) => {
  259 |     // WHEN: Navigate to /clientes with a non-existent UUID
  260 |     await page.goto('/clientes/00000000-0000-0000-0000-000000000000')
  261 | 
  262 |     // THEN: Not-found message shown; no JavaScript error
  263 |     const consoleErrors: string[] = []
  264 |     page.on('console', (msg) => {
  265 |       if (msg.type() === 'error') consoleErrors.push(msg.text())
  266 |     })
  267 |     await expect(page.getByText(/no encontrado|not found|404/i)).toBeVisible()
  268 |   })
  269 | })
  270 | 
  271 | test.describe('EPIC-SA-F2 — Clientes Create', () => {
  272 |   test('TC-F2-10 [P0] Crear cliente con todos los campos válidos (FR1, FR27)', async ({ page }) => {
  273 |     // GIVEN: DB active, form ready to open
  274 |     await page.goto('/clientes')
  275 | 
  276 |     // WHEN: Click "Nuevo cliente" and fill all fields
  277 |     await page.getByRole('button', { name: /nuevo cliente/i }).click()
  278 |     await page.getByLabel(/nombre/i).fill('Empresa XYZ')
  279 |     await page.getByLabel(/nit\/ruc/i).fill('800111222-3')
  280 |     await page.getByLabel(/teléfono/i).fill('+57 300 5555555')
  281 |     await page.getByLabel(/ciudad/i).fill('Cali')
  282 |     await page.getByRole('button', { name: /guardar/i }).click()
  283 | 
  284 |     // Skip optional association step if it appears
  285 |     const saltar = page.getByRole('button', { name: /saltar/i })
  286 |     if (await saltar.isVisible()) await saltar.click()
  287 | 
  288 |     // THEN: Client appears in list immediately; toast shown; form closes
  289 |     await expect(page.getByText('Empresa XYZ')).toBeVisible()
  290 |     await expect(page.getByText(/creado correctamente|cliente creado/i)).toBeVisible()
  291 |   })
  292 | 
  293 |   test('TC-F2-11 [P0] Crear cliente con NIT duplicado → 409 Conflict (FR8)', async ({
  294 |     page,
  295 |     clienteFactory,
  296 |   }) => {
  297 |     // GIVEN: A client with NIT "800111222-3" already exists
  298 |     await clienteFactory.create({ nombre: 'Existente NIT', nit: '800111222-3' })
  299 | 
  300 |     // WHEN: Try to create another client with the same NIT
  301 |     await page.goto('/clientes')
  302 |     await page.getByRole('button', { name: /nuevo cliente/i }).click()
  303 |     await page.getByLabel(/nombre/i).fill('Duplicado NIT')
  304 |     await page.getByLabel(/nit\/ruc/i).fill('800111222-3')
  305 |     await page.getByRole('button', { name: /guardar/i }).click()
  306 | 
  307 |     // THEN: Error message about duplicated NIT; no stack trace; form stays open
  308 |     await expect(page.getByText(/nit.*registrado|ya está registrado|duplicado/i)).toBeVisible()
  309 |     await expect(page.getByRole('dialog')).toBeVisible()
  310 |   })
  311 | 
  312 |   test('TC-F2-12 [P1] Form bloqueado con Nombre vacío (FR8 — Zod)', async ({ page }) => {
  313 |     // GIVEN: Create form open
  314 |     await page.goto('/clientes')
  315 |     await page.getByRole('button', { name: /nuevo cliente/i }).click()
  316 | 
  317 |     // WHEN: Leave Nombre empty and submit
  318 |     await page.getByLabel(/nit\/ruc/i).fill('999777555')
  319 |     await page.getByRole('button', { name: /guardar/i }).click()
  320 | 
  321 |     // THEN: Inline error on Nombre; no HTTP call; form stays open
  322 |     await expect(page.getByText(/campo requerido|obligatorio|nombre.*requerido/i)).toBeVisible()
  323 |     await expect(page.getByRole('dialog')).toBeVisible()
  324 |   })
  325 | 
  326 |   test('TC-F2-13 [P1] Form bloqueado con NIT/RUC vacío (FR8 — Zod)', async ({ page }) => {
  327 |     // GIVEN: Create form open
  328 |     await page.goto('/clientes')
  329 |     await page.getByRole('button', { name: /nuevo cliente/i }).click()
  330 | 
  331 |     // WHEN: Leave NIT/RUC empty and submit
  332 |     await page.getByLabel(/nombre/i).fill('Sin NIT')
  333 |     await page.getByRole('button', { name: /guardar/i }).click()
  334 | 
  335 |     // THEN: Inline error on NIT/RUC; no HTTP call
  336 |     await expect(page.getByText(/campo requerido|obligatorio|nit.*requerido/i)).toBeVisible()
  337 |     await expect(page.getByRole('dialog')).toBeVisible()
  338 |   })
  339 | 
  340 |   test('TC-F2-24 [P1] Doble clic en Guardar no crea duplicados', async ({ page }) => {
  341 |     // GIVEN: Form ready with valid data
  342 |     await page.goto('/clientes')
  343 |     await page.getByRole('button', { name: /nuevo cliente/i }).click()
  344 |     await page.getByLabel(/nombre/i).fill('Cliente Doble Click E2E')
  345 |     await page.getByLabel(/nit\/ruc/i).fill('321654987')
  346 | 
  347 |     // WHEN: Double-click Guardar quickly
  348 |     const saveBtn = page.getByRole('button', { name: /guardar/i })
  349 |     await Promise.all([saveBtn.click(), saveBtn.click()])
  350 | 
  351 |     // Skip optional step if shown
  352 |     const saltar = page.getByRole('button', { name: /saltar/i })
  353 |     if (await saltar.isVisible()) await saltar.click()
  354 | 
  355 |     // THEN: Only 1 client created (button disabled during mutation)
  356 |     await page.goto('/clientes')
  357 |     const matches = page.getByText('Cliente Doble Click E2E')
> 358 |     await expect(matches.first()).toBeVisible()
      |                                   ^ Error: expect(locator).toBeVisible() failed
  359 |     expect(await matches.count()).toBe(1)
  360 |   })
  361 | 
  362 |   test('TC-F2-25 [P1] XSS en campo Nombre del cliente — sanitización', async ({ page }) => {
  363 |     // GIVEN: Create form open
  364 |     await page.goto('/clientes')
  365 |     await page.getByRole('button', { name: /nuevo cliente/i }).click()
  366 | 
  367 |     // WHEN: Enter XSS payload in Nombre
  368 |     const xss = "<script>alert('xss')</script>"
  369 |     await page.getByLabel(/nombre/i).fill(xss)
  370 |     await page.getByLabel(/nit\/ruc/i).fill('777888999')
  371 |     await page.getByRole('button', { name: /guardar/i }).click()
  372 | 
  373 |     const saltar = page.getByRole('button', { name: /saltar/i })
  374 |     if (await saltar.isVisible()) await saltar.click()
  375 | 
  376 |     // THEN: Script not executed; rendered as literal text
  377 |     const dialogs: string[] = []
  378 |     page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss() })
  379 |     await page.goto('/clientes')
  380 |     expect(dialogs).toHaveLength(0)
  381 |   })
  382 | 
  383 |   test('TC-F2-29 [P0] Creación concurrente con mismo NIT — race condition', async ({
  384 |     page,
  385 |     request,
  386 |   }) => {
  387 |     // GIVEN: Backend active with uk_clientes_nit constraint
  388 |     const API_URL = process.env.API_URL ?? 'http://localhost:5000/api/v1'
  389 |     const payload = {
  390 |       nombre: 'Concurrente NIT',
  391 |       nit: `RACE${Date.now()}`,
  392 |       telefono: '111',
  393 |       ciudad: 'Test',
  394 |     }
  395 | 
  396 |     // WHEN: Send 2 simultaneous POSTs with the same NIT
  397 |     const [res1, res2] = await Promise.all([
  398 |       request.post(`${API_URL}/clientes`, { data: payload }),
  399 |       request.post(`${API_URL}/clientes`, { data: payload }),
  400 |     ])
  401 | 
  402 |     const statuses = [res1.status(), res2.status()].sort()
  403 | 
  404 |     // THEN: Only 1 created (201); the other gets 409; no 500
  405 |     expect(statuses).toContain(201)
  406 |     expect(statuses).toContain(409)
  407 |     expect(statuses).not.toContain(500)
  408 |   })
  409 | })
  410 | 
  411 | test.describe('EPIC-SA-F2 — Clientes Edit', () => {
  412 |   test('TC-F2-15 [P2] Form de edición pre-poblado con valores actuales (FR6)', async ({
  413 |     page,
  414 |     clienteFactory,
  415 |   }) => {
  416 |     // GIVEN: Client with all fields complete
  417 |     const cliente = await clienteFactory.create({
  418 |       nombre: 'PrePoblado E2E',
  419 |       nit: '900444555',
  420 |       telefono: '3201234567',
  421 |       ciudad: 'Medellín',
  422 |     })
  423 |     await page.goto(`/clientes/${cliente.id}`)
  424 | 
  425 |     // WHEN: Click Editar
  426 |     await page.getByRole('button', { name: /^editar$/i }).click()
  427 | 
  428 |     // THEN: Form opens with exact current values
  429 |     await expect(page.getByLabel(/nombre/i)).toHaveValue(cliente.nombre)
  430 |     await expect(page.getByLabel(/nit\/ruc/i)).toHaveValue(cliente.nit)
  431 |   })
  432 | 
  433 |   test('TC-F2-16 [P2] Editar cliente — guardar cambios reflejado inmediatamente (FR6, FR27)', async ({
  434 |     page,
  435 |     clienteFactory,
  436 |   }) => {
  437 |     // GIVEN: Existing client
  438 |     const cliente = await clienteFactory.create({ nombre: 'Editar Ciudad E2E', ciudad: 'Bogotá' })
  439 |     await page.goto(`/clientes/${cliente.id}`)
  440 | 
  441 |     // WHEN: Edit ciudad to "Medellín"
  442 |     await page.getByRole('button', { name: /^editar$/i }).click()
  443 |     const ciudadInput = page.getByLabel(/ciudad/i)
  444 |     await ciudadInput.clear()
  445 |     await ciudadInput.fill('Medellín')
  446 |     await page.getByRole('button', { name: /guardar/i }).click()
  447 | 
  448 |     // THEN: "Medellín" shown immediately; toast visible
  449 |     await expect(page.getByText('Medellín')).toBeVisible()
  450 |     await expect(page.getByText(/actualizado correctamente|cliente actualizado/i)).toBeVisible()
  451 |   })
  452 | 
  453 |   test('TC-F2-17 [P2] Edición bloqueada al borrar campo requerido (FR8)', async ({
  454 |     page,
  455 |     clienteFactory,
  456 |   }) => {
  457 |     // GIVEN: Edit form open with complete data
  458 |     const cliente = await clienteFactory.create({ nombre: 'Edicion Bloqueada E2E' })
```