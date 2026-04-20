# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clientes.spec.ts >> EPIC-SA-F2 — Clientes Create >> TC-F2-29 [P0] Creación concurrente con mismo NIT — race condition
- Location: tests\e2e\clientes.spec.ts:383:3

# Error details

```
Error: apiRequestContext.post: Request context disposed.
Call log:
  - → POST http://localhost:5000/api/v1/clientes
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.15 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - content-type: application/json
    - content-length: 87

```

# Test source

```ts
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
  358 |     await expect(matches.first()).toBeVisible()
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
> 399 |       request.post(`${API_URL}/clientes`, { data: payload }),
      |               ^ Error: apiRequestContext.post: Request context disposed.
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
  459 |     await page.goto(`/clientes/${cliente.id}`)
  460 |     await page.getByRole('button', { name: /^editar$/i }).click()
  461 | 
  462 |     // WHEN: Clear Nombre and submit
  463 |     const nombreInput = page.getByLabel(/nombre/i)
  464 |     await nombreInput.clear()
  465 |     await page.getByRole('button', { name: /guardar/i }).click()
  466 | 
  467 |     // THEN: Inline error; no HTTP call
  468 |     await expect(page.getByText(/campo requerido|obligatorio/i)).toBeVisible()
  469 |   })
  470 | 
  471 |   test('TC-F2-18 [P3] Cancelar edición no persiste cambios', async ({
  472 |     page,
  473 |     clienteFactory,
  474 |   }) => {
  475 |     // GIVEN: Edit form open with a pending change
  476 |     const cliente = await clienteFactory.create({ nombre: 'Cancel Edicion E2E' })
  477 |     await page.goto(`/clientes/${cliente.id}`)
  478 |     await page.getByRole('button', { name: /^editar$/i }).click()
  479 |     await page.getByLabel(/nombre/i).fill('New Name Not Saved')
  480 | 
  481 |     // WHEN: Cancel
  482 |     await page.getByRole('button', { name: /cancelar/i }).click()
  483 | 
  484 |     // THEN: Original nombre shown
  485 |     await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
  486 |     await expect(page.getByText('New Name Not Saved')).not.toBeVisible()
  487 |   })
  488 | 
  489 |   test('TC-F2-26 [P2] Pegar texto con Unicode special (non-breaking space)', async ({
  490 |     page,
  491 |     clienteFactory,
  492 |   }) => {
  493 |     // GIVEN: Create form open
  494 |     await page.goto('/clientes')
  495 |     await page.getByRole('button', { name: /nuevo cliente/i }).click()
  496 | 
  497 |     // WHEN: Fill name with non-breaking space (U+00A0)
  498 |     const nombreWithNBSP = 'Empresa\u00a0ABC'
  499 |     await page.getByLabel(/nombre/i).fill(nombreWithNBSP)
```