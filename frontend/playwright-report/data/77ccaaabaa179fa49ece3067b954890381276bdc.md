# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: asociacion.spec.ts >> EPIC-SA-F4 — Navigation & Links >> TC-F4-09 [P2] Detalle de contacto muestra cliente asociado sin búsqueda (FR23, NFR9)
- Location: tests\e2e\asociacion.spec.ts:353:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Cliente Visible F4')
Expected: visible
Error: strict mode violation: getByText('Cliente Visible F4') resolved to 3 elements:
    1) <h1 class="text-xl font-semibold text-slate-900">Contacto Cliente Visible F4</h1> aka getByRole('heading', { name: 'Contacto Cliente Visible F4' })
    2) <p class="text-sm leading-5 text-content-primary dark:text-dark-content-primary font-normal">Contacto Cliente Visible F4</p> aka getByRole('paragraph').filter({ hasText: 'Contacto Cliente Visible F4' })
    3) <span class="text-sm">Cliente Visible F4</span> aka getByRole('button', { name: 'Cliente Visible F4' })

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Cliente Visible F4')

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
        - heading "Contacto Cliente Visible F4" [level=1] [ref=e34]
        - generic [ref=e35]:
          - button "Editar" [ref=e36]:
            - generic [ref=e37]: Editar
          - button "Eliminar" [ref=e38]:
            - generic [ref=e39]: Eliminar
          - button "Reasignar cliente" [ref=e40]:
            - generic [ref=e41]: Reasignar cliente
          - button "Volver" [ref=e42]:
            - generic [ref=e43]: Volver
      - generic [ref=e44]:
        - generic [ref=e45]:
          - paragraph [ref=e47]: Nombre
          - paragraph [ref=e49]: Contacto Cliente Visible F4
        - generic [ref=e50]:
          - paragraph [ref=e52]: Cargo
          - paragraph [ref=e54]: Dynamic Infrastructure Architect
        - generic [ref=e55]:
          - paragraph [ref=e57]: Teléfono
          - paragraph [ref=e59]: (583) 822-0593
        - generic [ref=e60]:
          - paragraph [ref=e62]: Email
          - paragraph [ref=e64]: Naomi_Waters28@yahoo.com
        - generic [ref=e65]:
          - paragraph [ref=e67]: Cliente
          - paragraph [ref=e69]:
            - button "Cliente Visible F4" [ref=e70]:
              - generic [ref=e71]: Cliente Visible F4
```

# Test source

```ts
  267 |     await expect(page.getByText(contacto.nombre)).toBeVisible()
  268 |   })
  269 | 
  270 |   test('TC-F4-05 [P1] Crear contacto desde ContactManager → auto-asociado (FR18)', async ({
  271 |     page,
  272 |     clienteFactory,
  273 |   }) => {
  274 |     // GIVEN: Active client with ContactManager open
  275 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Auto-Asociar F4' })
  276 |     await page.goto(`/clientes/${cliente.id}`)
  277 | 
  278 |     // WHEN: Create new contact from within ContactManager
  279 |     await page.getByRole('button', { name: /nuevo contacto/i }).click()
  280 |     await page.getByLabel(/^nombre$/i).fill('Auto Asociado F4')
  281 |     await page.getByLabel(/^cargo$/i).fill('Tester')
  282 |     await page.getByLabel(/^email$/i).fill(`auto.asoc.f4.${Date.now()}@test.com`)
  283 |     await page.getByRole('button', { name: /^guardar$/i }).click()
  284 | 
  285 |     // THEN: Contact created with clienteId=clienteActivo; appears in ContactManager immediately
  286 |     await expect(page.getByText('Auto Asociado F4')).toBeVisible()
  287 |   })
  288 | 
  289 |   test('TC-F4-06 [P0] CRÍTICO: Desasociar contacto — no elimina registros (FR20)', async ({
  290 |     page,
  291 |     clienteFactory,
  292 |     contactoFactory,
  293 |   }) => {
  294 |     // GIVEN: Contact associated with active client
  295 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Desasociar F4' })
  296 |     const contacto = await contactoFactory.create({ nombre: 'Juan Pérez F4 Desasociar' })
  297 |     await contactoFactory.assignCliente(contacto.id, cliente.id)
  298 | 
  299 |     // WHEN: Disassociate "Juan Pérez F4" from client via ContactManager
  300 |     await page.goto(`/clientes/${cliente.id}`)
  301 |     await expect(page.getByText(contacto.nombre)).toBeVisible()
  302 |     await page.getByRole('button', { name: /desasociar/i }).click()
  303 | 
  304 |     // THEN: Contact disappears from ContactManager; still accessible in /contactos
  305 |     await expect(page.getByText(contacto.nombre)).not.toBeVisible()
  306 |     await page.goto('/contactos')
  307 |     await expect(page.getByText(contacto.nombre)).toBeVisible()
  308 |   })
  309 | })
  310 | 
  311 | test.describe('EPIC-SA-F4 — Navigation & Links', () => {
  312 |   test('TC-F4-07 [P2] Navegar de cliente a contacto en ≤2 clics (FR22, NFR8)', async ({
  313 |     page,
  314 |     clienteFactory,
  315 |     contactoFactory,
  316 |   }) => {
  317 |     // GIVEN: Client with contacts in ContactManager
  318 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Nav F4' })
  319 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Nav F4' })
  320 |     await contactoFactory.assignCliente(contacto.id, cliente.id)
  321 | 
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
> 367 |     await expect(page.getByText(cliente.nombre)).toBeVisible()
      |                                                  ^ Error: expect(locator).toBeVisible() failed
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
  422 |       await expect(page).toHaveURL(new RegExp(`/contactos/${contacto.id}`))
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
```