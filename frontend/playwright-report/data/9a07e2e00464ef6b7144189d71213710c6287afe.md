# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clientes.spec.ts >> EPIC-SA-F2 — Clientes Edit >> TC-F2-17 [P2] Edición bloqueada al borrar campo requerido (FR8)
- Location: tests\e2e\clientes.spec.ts:453:3

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:5173/clientes/8faef996-a5a9-49b6-a084-5a1af459b503", waiting until "load"

```

# Test source

```ts
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
> 459 |     await page.goto(`/clientes/${cliente.id}`)
      |                ^ Error: page.goto: Target page, context or browser has been closed
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
  500 |     await page.getByLabel(/nit\/ruc/i).fill('555444333')
  501 |     await page.getByRole('button', { name: /guardar/i }).click()
  502 | 
  503 |     const saltar = page.getByRole('button', { name: /saltar/i })
  504 |     if (await saltar.isVisible()) await saltar.click()
  505 | 
  506 |     // THEN: Client appears in list; search behavior documented (edge case investigation)
  507 |     await expect(page.getByText(/Empresa/i)).toBeVisible()
  508 |   })
  509 | 
  510 |   test('TC-F2-30 [P2] Editar cliente eliminado concurrentemente — 404 en PUT', async ({
  511 |     page,
  512 |     clienteFactory,
  513 |   }) => {
  514 |     // GIVEN: Client open for editing by User A; simulate User B deletes it
  515 |     const cliente = await clienteFactory.create({ nombre: 'Concurrente Delete E2E' })
  516 |     await page.goto(`/clientes/${cliente.id}`)
  517 |     await page.getByRole('button', { name: /^editar$/i }).click()
  518 | 
  519 |     // Simulate the client being deleted while form is open
  520 |     await page.route(`**/api/v1/clientes/${cliente.id}`, (route) => {
  521 |       if (route.request().method() === 'PUT') {
  522 |         route.fulfill({ status: 404, body: JSON.stringify({ title: 'Not Found' }) })
  523 |       } else {
  524 |         route.continue()
  525 |       }
  526 |     })
  527 | 
  528 |     // WHEN: User A saves changes
  529 |     await page.getByLabel(/nombre/i).fill('Intento Fallido')
  530 |     await page.getByRole('button', { name: /guardar/i }).click()
  531 | 
  532 |     // THEN: Clear error message; no stack trace (NFR6)
  533 |     await expect(page.getByText(/no encontrado|not found|404|error/i)).toBeVisible()
  534 |     await expect(page.getByText(/stack|exception|System\./i)).not.toBeVisible()
  535 |   })
  536 | })
  537 | 
  538 | test.describe('EPIC-SA-F2 — Clientes Delete', () => {
  539 |   test('TC-F2-19 [P3] Dialog de confirmación aparece al eliminar cliente (FR7)', async ({
  540 |     page,
  541 |     clienteFactory,
  542 |   }) => {
  543 |     // GIVEN: Client visible in detail
  544 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Dialog Delete E2E' })
  545 |     await page.goto(`/clientes/${cliente.id}`)
  546 | 
  547 |     // WHEN: Click Eliminar
  548 |     await page.getByRole('button', { name: /^eliminar$/i }).click()
  549 | 
  550 |     // THEN: Confirmation dialog shows with Confirmar and Cancelar buttons
  551 |     await expect(page.getByText(/¿eliminar este cliente|eliminar cliente/i)).toBeVisible()
  552 |     await expect(page.getByRole('dialog').getByRole('button', { name: /confirmar|eliminar/i })).toBeVisible()
  553 |     await expect(page.getByRole('dialog').getByRole('button', { name: /cancelar/i })).toBeVisible()
  554 |   })
  555 | 
  556 |   test('TC-F2-20 [P1] Confirmar eliminación remueve cliente de la lista (FR7, FR27)', async ({
  557 |     page,
  558 |     clienteFactory,
  559 |   }) => {
```