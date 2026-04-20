# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: asociacion.spec.ts >> EPIC-SA-F4 — Navigation & Links >> TC-F4-07 [P2] Navegar de cliente a contacto en ≤2 clics (FR22, NFR8)
- Location: tests\e2e\asociacion.spec.ts:312:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/contactos\/dca3975a-23d6-422a-94b7-275cae87e02a/
Received string:  "http://localhost:5173/clientes/2be7d7ba-e51b-4b84-9c63-e01d51bdf996"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    13 × unexpected value "http://localhost:5173/clientes/2be7d7ba-e51b-4b84-9c63-e01d51bdf996"

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
        - heading "Cliente Nav F4" [level=1] [ref=e34]
        - generic [ref=e35]:
          - button "Editar" [ref=e36]:
            - generic [ref=e37]: Editar
          - button "Eliminar" [ref=e38]:
            - generic [ref=e39]: Eliminar
          - button "Volver" [ref=e40]:
            - generic [ref=e41]: Volver
      - generic [ref=e42]:
        - paragraph [ref=e44]: Nombre
        - paragraph [ref=e46]: Cliente Nav F4
      - generic [ref=e47]:
        - paragraph [ref=e49]: NIT/RUC
        - paragraph [ref=e51]: "087532179"
      - generic [ref=e52]:
        - paragraph [ref=e54]: Teléfono
        - paragraph [ref=e56]: (732) 692-9067
      - generic [ref=e57]:
        - paragraph [ref=e59]: Ciudad
        - paragraph [ref=e61]: Beattyboro
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
              - generic [ref=e83]: Contacto Nav F4
              - generic [ref=e85]: Direct Division Coordinator
              - generic [ref=e87]: (719) 203-1999
              - generic [ref=e89]: Noah53@gmail.com
              - button "Desasociar" [ref=e92]:
                - generic [ref=e93]: Desasociar
```

# Test source

```ts
  228 |     await page.goto(`/clientes/${cliente.id}`)
  229 | 
  230 |     // THEN: Empty state shown
  231 |     await expect(page.getByText(/no hay contactos asociados|sin contactos/i)).toBeVisible()
  232 |   })
  233 | 
  234 |   test('TC-F4-03 [P2] ContactManager ErrorPanel cuando BE falla', async ({
  235 |     page,
  236 |     clienteFactory,
  237 |   }) => {
  238 |     // GIVEN: Client exists; contacts fetch returns 500
  239 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Error CM F4' })
  240 |     await page.route(`**/api/v1/contactos**`, (route) =>
  241 |       route.fulfill({ status: 500, body: 'error' })
  242 |     )
  243 | 
  244 |     // WHEN: View client detail
  245 |     await page.goto(`/clientes/${cliente.id}`)
  246 | 
  247 |     // THEN: ErrorPanel with retry option visible in ContactManager
  248 |     await expect(page.getByRole('button', { name: /reintentar/i })).toBeVisible()
  249 |   })
  250 | 
  251 |   test('TC-F4-04 [P0] CRÍTICO: Asociar contacto + cache invalidation', async ({
  252 |     page,
  253 |     clienteFactory,
  254 |     contactoFactory,
  255 |   }) => {
  256 |     // GIVEN: Contact without client; active client
  257 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Asociar Cache F4' })
  258 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Sin Cliente F4' })
  259 | 
  260 |     // WHEN: Open client detail and associate the contact
  261 |     await page.goto(`/clientes/${cliente.id}`)
  262 |     await page.getByRole('button', { name: /asociar contacto/i }).click()
  263 |     await expect(page.getByText(/seleccionar contacto/i)).toBeVisible()
  264 |     await page.getByRole('button', { name: contacto.nombre }).click()
  265 | 
  266 |     // THEN: Contact appears in ContactManager without manual refresh
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
> 328 |     await expect(page).toHaveURL(new RegExp(`/contactos/${contacto.id}`))
      |                        ^ Error: expect(page).toHaveURL(expected) failed
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
  422 |       await expect(page).toHaveURL(new RegExp(`/contactos/${contacto.id}`))
  423 |       await page.goBack()
  424 |       await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
  425 |     }
  426 | 
  427 |     // THEN: No errors; no redirect loops; browser history navigable
  428 |     expect(consoleErrors.filter((e) => !e.includes('favicon'))).toHaveLength(0)
```