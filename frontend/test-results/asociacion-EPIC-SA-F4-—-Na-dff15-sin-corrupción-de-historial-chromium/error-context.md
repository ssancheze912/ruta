# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: asociacion.spec.ts >> EPIC-SA-F4 — Navigation & Links >> TC-F4-23 [P2] Navegación profunda cliente→contacto×5 sin corrupción de historial
- Location: tests\e2e\asociacion.spec.ts:403:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/contactos\/d0bc610e-485c-4596-9916-8752b16ba0f4/
Received string:  "http://localhost:5173/clientes/275892b3-b2ad-4ad0-8976-a17121b361cc"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    13 × unexpected value "http://localhost:5173/clientes/275892b3-b2ad-4ad0-8976-a17121b361cc"

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
        - heading "Cliente Historia F4" [level=1] [ref=e34]
        - generic [ref=e35]:
          - button "Editar" [ref=e36]:
            - generic [ref=e37]: Editar
          - button "Eliminar" [ref=e38]:
            - generic [ref=e39]: Eliminar
          - button "Volver" [ref=e40]:
            - generic [ref=e41]: Volver
      - generic [ref=e42]:
        - paragraph [ref=e44]: Nombre
        - paragraph [ref=e46]: Cliente Historia F4
      - generic [ref=e47]:
        - paragraph [ref=e49]: NIT/RUC
        - paragraph [ref=e51]: "146448140"
      - generic [ref=e52]:
        - paragraph [ref=e54]: Teléfono
        - paragraph [ref=e56]: (481) 712-8017
      - generic [ref=e57]:
        - paragraph [ref=e59]: Ciudad
        - paragraph [ref=e61]: Dibbertfield
      - generic [ref=e62]:
        - heading "Contactos asociados" [level=2] [ref=e63]
        - generic [ref=e64]:
          - button "Asociar contacto" [ref=e66]:
            - generic [ref=e67]: Asociar contacto
          - generic [ref=e69]:
            - button "Nombre" [ref=e70] [cursor=pointer]:
              - generic [ref=e71]: Nombre
            - generic [ref=e75]: Cargo
            - generic [ref=e77]: Teléfono
            - generic [ref=e79]: Email
            - generic [ref=e81]:
              - generic [ref=e83]: Contacto Historia F4
              - generic [ref=e85]: Chief Interactions Director
              - generic [ref=e87]: (944) 532-9501
              - generic [ref=e89]: Gerald_Robel1@gmail.com
              - button "Desasociar" [ref=e92]:
                - generic [ref=e93]: Desasociar
```

# Test source

```ts
  322 |     // WHEN: Click contact in ContactManager (1 click)
  323 |     await page.goto(`/clientes/${cliente.id}`)
  324 |     await expect(page.getByText(contacto.nombre)).toBeVisible()
  325 |     await page.getByText(contacto.nombre).first().click()
  326 | 
  327 |     // THEN: Navigates to /contactos/:id in exactly 1 click (NFR8 ≤2 satisfied)
  328 |     await expect(page).toHaveURL(new RegExp(`/contactos/${contacto.id}`))
  329 |     await expect(page.getByRole('heading', { name: contacto.nombre })).toBeVisible()
  330 |   })
  331 | 
  332 |   test('TC-F4-08 [P2] Botón atrás regresa al detalle del cliente', async ({
  333 |     page,
  334 |     clienteFactory,
  335 |     contactoFactory,
  336 |   }) => {
  337 |     // GIVEN: User navigated from client to contact via ContactManager
  338 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Back F4' })
  339 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Back F4' })
  340 |     await contactoFactory.assignCliente(contacto.id, cliente.id)
  341 |     await page.goto(`/clientes/${cliente.id}`)
  342 |     await page.getByText(contacto.nombre).first().click()
  343 |     await expect(page).toHaveURL(new RegExp(`/contactos/${contacto.id}`))
  344 | 
  345 |     // WHEN: Press browser back button
  346 |     await page.goBack()
  347 | 
  348 |     // THEN: Returns to /clientes/:clienteId without context loss
  349 |     await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
  350 |     await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
  351 |   })
  352 | 
  353 |   test('TC-F4-09 [P2] Detalle de contacto muestra cliente asociado sin búsqueda (FR23, NFR9)', async ({
  354 |     page,
  355 |     clienteFactory,
  356 |     contactoFactory,
  357 |   }) => {
  358 |     // GIVEN: Contact with assigned clienteId
  359 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Visible F4' })
  360 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Cliente Visible F4' })
  361 |     await contactoFactory.assignCliente(contacto.id, cliente.id)
  362 | 
  363 |     // WHEN: Navigate to contact detail
  364 |     await page.goto(`/contactos/${contacto.id}`)
  365 | 
  366 |     // THEN: Associated client name visible directly; no additional search required
  367 |     await expect(page.getByText(cliente.nombre)).toBeVisible()
  368 |   })
  369 | 
  370 |   test('TC-F4-10 [P3] Clic en nombre del cliente navega a su detalle (FR24)', async ({
  371 |     page,
  372 |     clienteFactory,
  373 |     contactoFactory,
  374 |   }) => {
  375 |     // GIVEN: Contact detail with client visible
  376 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Clic F4' })
  377 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Clic F4' })
  378 |     await contactoFactory.assignCliente(contacto.id, cliente.id)
  379 | 
  380 |     await page.goto(`/contactos/${contacto.id}`)
  381 |     await expect(page.getByRole('button', { name: cliente.nombre })).toBeVisible()
  382 | 
  383 |     // WHEN: Click the client name
  384 |     await page.getByRole('button', { name: cliente.nombre }).click()
  385 | 
  386 |     // THEN: Navigates to /clientes/:clienteId; correct client detail shown
  387 |     await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
  388 |     await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
  389 |   })
  390 | 
  391 |   test('TC-F4-11 [P3] Contacto huérfano muestra "Sin cliente asignado" en detalle', async ({
  392 |     page,
  393 |     contactoFactory,
  394 |   }) => {
  395 |     // GIVEN: Contact with clienteId=null
  396 |     const contacto = await contactoFactory.create({ nombre: 'Huérfano F4 Detalle' })
  397 |     await page.goto(`/contactos/${contacto.id}`)
  398 | 
  399 |     // THEN: Shows "Sin cliente asignado"; no crash; no nav link
  400 |     await expect(page.getByText('Sin cliente asignado')).toBeVisible()
  401 |   })
  402 | 
  403 |   test('TC-F4-23 [P2] Navegación profunda cliente→contacto×5 sin corrupción de historial', async ({
  404 |     page,
  405 |     clienteFactory,
  406 |     contactoFactory,
  407 |   }) => {
  408 |     // GIVEN: Real data with associated clients and contacts
  409 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Historia F4' })
  410 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Historia F4' })
  411 |     await contactoFactory.assignCliente(contacto.id, cliente.id)
  412 | 
  413 |     const consoleErrors: string[] = []
  414 |     page.on('console', (msg) => {
  415 |       if (msg.type() === 'error') consoleErrors.push(msg.text())
  416 |     })
  417 | 
  418 |     // WHEN: Alternate navigation 5 times
  419 |     await page.goto(`/clientes/${cliente.id}`)
  420 |     for (let i = 0; i < 5; i++) {
  421 |       await page.getByText(contacto.nombre).first().click()
> 422 |       await expect(page).toHaveURL(new RegExp(`/contactos/${contacto.id}`))
      |                          ^ Error: expect(page).toHaveURL(expected) failed
  423 |       await page.goBack()
  424 |       await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
  425 |     }
  426 | 
  427 |     // THEN: No errors; no redirect loops; browser history navigable
  428 |     expect(consoleErrors.filter((e) => !e.includes('favicon'))).toHaveLength(0)
  429 |   })
  430 | })
  431 | 
  432 | test.describe('EPIC-SA-F4 — Orphan Filter', () => {
  433 |   test('TC-F4-12 [P1] Filtro "Sin cliente" muestra solo contactos huérfanos (FR25)', async ({
  434 |     page,
  435 |     clienteFactory,
  436 |     contactoFactory,
  437 |   }) => {
  438 |     // GIVEN: Mix of assigned and orphan contacts
  439 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Filtro F4' })
  440 |     const asignado = await contactoFactory.create({ nombre: 'Asignado Filtro F4' })
  441 |     const huerfano = await contactoFactory.create({ nombre: 'Huérfano Filtro F4' })
  442 |     await contactoFactory.assignCliente(asignado.id, cliente.id)
  443 | 
  444 |     await page.goto('/contactos')
  445 |     await expect(page.getByText(asignado.nombre)).toBeVisible()
  446 |     await expect(page.getByText(huerfano.nombre)).toBeVisible()
  447 | 
  448 |     // WHEN: Activate "Sin cliente" filter
  449 |     await page.getByRole('button', { name: /sin cliente/i }).click()
  450 | 
  451 |     // THEN: Only orphan contacts visible; count badge visible
  452 |     await expect(page.getByText(huerfano.nombre)).toBeVisible()
  453 |     await expect(page.getByText(asignado.nombre)).not.toBeVisible()
  454 |     await expect(page.getByText(/sin cliente/i)).toBeVisible()
  455 |   })
  456 | 
  457 |   test('TC-F4-13 [P3] EmptyState cuando todos los contactos están asignados', async ({
  458 |     page,
  459 |     clienteFactory,
  460 |     contactoFactory,
  461 |   }) => {
  462 |     // GIVEN: All contacts have clienteId
  463 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Todos Asignados F4' })
  464 |     const c = await contactoFactory.create({ nombre: 'Todos Asignados F4' })
  465 |     await contactoFactory.assignCliente(c.id, cliente.id)
  466 | 
  467 |     await page.goto('/contactos')
  468 | 
  469 |     // WHEN: Activate "Sin cliente" filter
  470 |     await page.getByRole('button', { name: /sin cliente/i }).click()
  471 | 
  472 |     // THEN: EmptyState "Todos los contactos están asignados a un cliente"
  473 |     await expect(page.getByText(/todos los contactos.*asignados|asignados a un cliente/i)).toBeVisible()
  474 |   })
  475 | 
  476 |   test('TC-F4-14 [P3] Desactivar filtro restaura lista completa de contactos', async ({
  477 |     page,
  478 |     clienteFactory,
  479 |     contactoFactory,
  480 |   }) => {
  481 |     // GIVEN: "Sin cliente" filter active
  482 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Restaurar F4' })
  483 |     const asignado = await contactoFactory.create({ nombre: 'Asignado Restaurar F4' })
  484 |     await contactoFactory.assignCliente(asignado.id, cliente.id)
  485 |     await contactoFactory.create({ nombre: 'Huérfano Restaurar F4' })
  486 | 
  487 |     await page.goto('/contactos')
  488 |     await page.getByRole('button', { name: /sin cliente/i }).click()
  489 |     await expect(page.getByText('Asignado Restaurar F4')).not.toBeVisible()
  490 | 
  491 |     // WHEN: Deactivate filter
  492 |     await page.getByRole('button', { name: /sin cliente/i }).click()
  493 | 
  494 |     // THEN: Full list restored (assigned + orphans)
  495 |     await expect(page.getByText('Asignado Restaurar F4')).toBeVisible()
  496 |     await expect(page.getByText('Huérfano Restaurar F4')).toBeVisible()
  497 |   })
  498 | 
  499 |   test('TC-F4-15 [P0] CRÍTICO: Huérfanos aparecen en filtro inmediatamente post-delete', async ({
  500 |     page,
  501 |     clienteFactory,
  502 |     contactoFactory,
  503 |   }) => {
  504 |     // GIVEN: Client with 3 contacts; "Sin cliente" filter visible
  505 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Cascade Filter F4' })
  506 |     const contacts = await Promise.all([
  507 |       contactoFactory.create({ nombre: 'Cascade Filter C1 F4' }),
  508 |       contactoFactory.create({ nombre: 'Cascade Filter C2 F4' }),
  509 |       contactoFactory.create({ nombre: 'Cascade Filter C3 F4' }),
  510 |     ])
  511 |     for (const c of contacts) await contactoFactory.assignCliente(c.id, cliente.id)
  512 | 
  513 |     // WHEN: Delete the client
  514 |     await page.goto(`/clientes/${cliente.id}`)
  515 |     await page.getByRole('button', { name: /^eliminar$/i }).click()
  516 |     await page.getByRole('dialog').getByRole('button', { name: /confirmar|eliminar/i }).click()
  517 |     await expect(page).toHaveURL('/clientes')
  518 | 
  519 |     // AND: Activate "Sin cliente" filter
  520 |     await page.goto('/contactos')
  521 |     await page.getByRole('button', { name: /sin cliente/i }).click()
  522 | 
```