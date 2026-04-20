# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: asociacion.spec.ts >> EPIC-SA-F4 — ContactManager >> TC-F4-05 [P1] Crear contacto desde ContactManager → auto-asociado (FR18)
- Location: tests\e2e\asociacion.spec.ts:270:3

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /nuevo contacto/i })

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
        - heading "Cliente Auto-Asociar F4" [level=1] [ref=e34]
        - generic [ref=e35]:
          - button "Editar" [ref=e36]:
            - generic [ref=e37]: Editar
          - button "Eliminar" [ref=e38]:
            - generic [ref=e39]: Eliminar
          - button "Volver" [ref=e40]:
            - generic [ref=e41]: Volver
      - generic [ref=e42]:
        - paragraph [ref=e44]: Nombre
        - paragraph [ref=e46]: Cliente Auto-Asociar F4
      - generic [ref=e47]:
        - paragraph [ref=e49]: NIT/RUC
        - paragraph [ref=e51]: "407159978"
      - generic [ref=e52]:
        - paragraph [ref=e54]: Teléfono
        - paragraph [ref=e56]: (255) 624-4592
      - generic [ref=e57]:
        - paragraph [ref=e59]: Ciudad
        - paragraph [ref=e61]: East Christianaland
      - generic [ref=e62]:
        - heading "Contactos asociados" [level=2] [ref=e63]
        - generic [ref=e64]:
          - button "Asociar contacto" [ref=e66]:
            - generic [ref=e67]: Asociar contacto
          - paragraph [ref=e68]: Sin contactos asociados aún.
```

# Test source

```ts
  179 |     await expect(page.getByRole('heading', { name: /reasignar a otro cliente/i })).toBeVisible()
  180 | 
  181 |     // Select the new client from the dropdown
  182 |     await page.getByLabel('Seleccionar cliente destino').selectOption({ label: clienteB.nombre })
  183 |     await page.getByRole('button', { name: /^guardar$/i }).click()
  184 | 
  185 |     // THEN: The contact now shows the new client's name
  186 |     await expect(page.getByRole('button', { name: clienteB.nombre })).toBeVisible()
  187 | 
  188 |     // AND: The new client's AssociatedContactsSection shows the contact (FR27)
  189 |     await page.goto(`/clientes/${clienteB.id}`)
  190 |     await expect(page.getByText(contacto.nombre)).toBeVisible()
  191 |   })
  192 | })
  193 | 
  194 | // ─── EPIC-SA-F4: Association & Data Quality — CSV-traced tests ────────────────
  195 | 
  196 | test.describe('EPIC-SA-F4 — ContactManager', () => {
  197 |   test('TC-F4-01 [P2] ContactManager muestra contactos del cliente (FR21)', async ({
  198 |     page,
  199 |     clienteFactory,
  200 |     contactoFactory,
  201 |   }) => {
  202 |     // GIVEN: Client with 3 associated contacts
  203 |     const cliente = await clienteFactory.create({ nombre: 'Cliente 3 Contactos F4' })
  204 |     const c1 = await contactoFactory.create({ nombre: 'CM Contacto A F4' })
  205 |     const c2 = await contactoFactory.create({ nombre: 'CM Contacto B F4' })
  206 |     const c3 = await contactoFactory.create({ nombre: 'CM Contacto C F4' })
  207 |     await contactoFactory.assignCliente(c1.id, cliente.id)
  208 |     await contactoFactory.assignCliente(c2.id, cliente.id)
  209 |     await contactoFactory.assignCliente(c3.id, cliente.id)
  210 | 
  211 |     // WHEN: Navigate to /clientes/:clienteId
  212 |     await page.goto(`/clientes/${cliente.id}`)
  213 | 
  214 |     // THEN: ContactManager renders all 3 contacts
  215 |     await expect(page.getByText('CM Contacto A F4')).toBeVisible()
  216 |     await expect(page.getByText('CM Contacto B F4')).toBeVisible()
  217 |     await expect(page.getByText('CM Contacto C F4')).toBeVisible()
  218 |   })
  219 | 
  220 |   test('TC-F4-02 [P3] ContactManager EmptyState cuando cliente sin contactos', async ({
  221 |     page,
  222 |     clienteFactory,
  223 |   }) => {
  224 |     // GIVEN: Client with no contacts
  225 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Vacío CM F4' })
  226 | 
  227 |     // WHEN: View client detail
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
> 279 |     await page.getByRole('button', { name: /nuevo contacto/i }).click()
      |                                                                 ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
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
```