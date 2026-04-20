# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: asociacion.spec.ts >> Asociación — Reassign contact >> [P2] should reassign a contact to a different client (FR26, FR27)
- Location: tests\e2e\asociacion.spec.ts:165:3

# Error details

```
Error: locator.selectOption: Error: Element is not a <select> element
Call log:
  - waiting for getByLabel('Seleccionar cliente destino')
    - locator resolved to <button type="button" aria-expanded="false" aria-haspopup="listbox" title="Seleccionar cliente..." aria-label="Seleccionar cliente destino" class="inline-flex items-center justify-between gap-3 w-full px-3 py-2 text-sm font-normal leading-5 rounded-lg border transition-all duration-150 w-full bg-bg-primary border-border-primary text-content-primary dark:bg-dark-bg-primary dark:border-dark-border-primary dark:text-dark-content-primary hover:border-[#f9f9f9] dark:hover:border-[#3a3a3f] focus:outline-hid…>…</button>
  - attempting select option action
    - waiting for element to be visible and enabled

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - navigation [ref=e4]:
      - img [ref=e6]
    - generic [ref=e8]:
      - generic [ref=e11]:
        - generic [ref=e12]:
          - button [ref=e13] [cursor=pointer]:
            - img [ref=e16]
          - button [ref=e18] [cursor=pointer]:
            - img [ref=e21]
        - generic [ref=e23]:
          - separator [ref=e24]
          - button [ref=e26]:
            - img [ref=e28]
      - generic [ref=e32]:
        - generic [ref=e33]:
          - heading [level=1] [ref=e34]: Contacto Reasignar E2E
          - generic [ref=e35]:
            - button [ref=e36]:
              - generic [ref=e37]: Editar
            - button [ref=e38]:
              - generic [ref=e39]: Eliminar
            - button [ref=e40]:
              - generic [ref=e41]: Reasignar cliente
            - button [ref=e42]:
              - generic [ref=e43]: Volver
        - generic [ref=e44]:
          - generic [ref=e45]:
            - paragraph [ref=e47]: Nombre
            - paragraph [ref=e49]: Contacto Reasignar E2E
          - generic [ref=e50]:
            - paragraph [ref=e52]: Cargo
            - paragraph [ref=e54]: Investor Group Engineer
          - generic [ref=e55]:
            - paragraph [ref=e57]: Teléfono
            - paragraph [ref=e59]: (676) 949-4924
          - generic [ref=e60]:
            - paragraph [ref=e62]: Email
            - paragraph [ref=e64]: Kailee.Stoltenberg@gmail.com
          - generic [ref=e65]:
            - paragraph [ref=e67]: Cliente
            - paragraph [ref=e69]:
              - button [ref=e70]:
                - generic [ref=e71]: Cliente A Reasignar E2E
  - dialog "Reasignar a otro cliente" [ref=e75]:
    - heading "Reasignar a otro cliente" [level=2] [ref=e77]
    - generic [ref=e78]:
      - button "Seleccionar cliente destino" [active] [ref=e80]:
        - generic [ref=e81]: Seleccionar cliente...
        - img [ref=e82]
      - generic [ref=e84]:
        - button "Cancelar" [ref=e85]:
          - generic [ref=e86]: Cancelar
        - button "Guardar" [disabled]:
          - generic: Guardar
    - button "Close" [ref=e87]:
      - img
      - generic [ref=e88]: Close
```

# Test source

```ts
  82  |   test('[P1] should navigate to client detail by clicking client name link in contact detail (FR24)', async ({
  83  |     page,
  84  |     clienteFactory,
  85  |     contactoFactory,
  86  |   }) => {
  87  |     // GIVEN: A contact associated with a client
  88  |     const cliente = await clienteFactory.create({ nombre: 'Cliente Link E2E' })
  89  |     const contacto = await contactoFactory.create({ nombre: 'Contacto Link E2E' })
  90  |     await contactoFactory.assignCliente(contacto.id, cliente.id)
  91  | 
  92  |     // WHEN: The user opens the contact detail and clicks the client name link
  93  |     await page.goto(`/contactos/${contacto.id}`)
  94  |     await expect(page.getByRole('button', { name: cliente.nombre })).toBeVisible()
  95  |     await page.getByRole('button', { name: cliente.nombre }).click()
  96  | 
  97  |     // THEN: The client detail page loads
  98  |     await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
  99  |     await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
  100 |   })
  101 | 
  102 |   test('[P1] should show "Sin cliente asignado" for a contact with no client', async ({
  103 |     page,
  104 |     contactoFactory,
  105 |   }) => {
  106 |     // GIVEN: A contact with no client assigned (orphan)
  107 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Huérfano Link E2E' })
  108 | 
  109 |     // WHEN: The user opens the contact detail
  110 |     await page.goto(`/contactos/${contacto.id}`)
  111 | 
  112 |     // THEN: "Sin cliente asignado" is displayed in the cliente field (FR23)
  113 |     await expect(page.getByText('Sin cliente asignado')).toBeVisible()
  114 |   })
  115 | })
  116 | 
  117 | test.describe('Asociación — Associate contact', () => {
  118 |   test('[P1] should associate an orphan contact to a client via "Asociar contacto"', async ({
  119 |     page,
  120 |     clienteFactory,
  121 |     contactoFactory,
  122 |   }) => {
  123 |     // GIVEN: A client with no contacts and an orphan contact
  124 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Asociar E2E' })
  125 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Para Asociar E2E' })
  126 | 
  127 |     // WHEN: The user opens the client detail, opens the selector and picks the contact
  128 |     await page.goto(`/clientes/${cliente.id}`)
  129 |     await page.getByRole('button', { name: /asociar contacto/i }).click()
  130 |     await expect(page.getByText(/seleccionar contacto a asociar/i)).toBeVisible()
  131 |     await page.getByRole('button', { name: contacto.nombre }).click()
  132 | 
  133 |     // THEN: The contact appears in the AssociatedContactsSection immediately (FR27)
  134 |     await expect(page.getByText(contacto.nombre)).toBeVisible()
  135 |   })
  136 | })
  137 | 
  138 | test.describe('Asociación — Disassociate contact', () => {
  139 |   test('[P2] should disassociate a contact from client without deleting either record', async ({
  140 |     page,
  141 |     clienteFactory,
  142 |     contactoFactory,
  143 |   }) => {
  144 |     // GIVEN: A client with one associated contact
  145 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Desasociar E2E' })
  146 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Desasociar E2E' })
  147 |     await contactoFactory.assignCliente(contacto.id, cliente.id)
  148 | 
  149 |     // WHEN: The user opens the client detail and clicks "Desasociar"
  150 |     await page.goto(`/clientes/${cliente.id}`)
  151 |     await expect(page.getByText(contacto.nombre)).toBeVisible()
  152 |     await page.getByRole('button', { name: /desasociar/i }).click()
  153 | 
  154 |     // THEN: The contact is removed from the section immediately (FR20, FR27)
  155 |     await expect(page.getByText(contacto.nombre)).not.toBeVisible()
  156 |     await expect(page.getByText(/sin contactos asociados/i)).toBeVisible()
  157 | 
  158 |     // AND: The contact still exists in /contactos (not deleted)
  159 |     await page.goto('/contactos')
  160 |     await expect(page.getByText(contacto.nombre)).toBeVisible()
  161 |   })
  162 | })
  163 | 
  164 | test.describe('Asociación — Reassign contact', () => {
  165 |   test('[P2] should reassign a contact to a different client (FR26, FR27)', async ({
  166 |     page,
  167 |     clienteFactory,
  168 |     contactoFactory,
  169 |   }) => {
  170 |     // GIVEN: Two clients and one contact assigned to the first client
  171 |     const clienteA = await clienteFactory.create({ nombre: 'Cliente A Reasignar E2E' })
  172 |     const clienteB = await clienteFactory.create({ nombre: 'Cliente B Reasignar E2E' })
  173 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Reasignar E2E' })
  174 |     await contactoFactory.assignCliente(contacto.id, clienteA.id)
  175 | 
  176 |     // WHEN: The user opens the contact detail and initiates reassignment
  177 |     await page.goto(`/contactos/${contacto.id}`)
  178 |     await page.getByRole('button', { name: /reasignar cliente/i }).click()
  179 |     await expect(page.getByRole('heading', { name: /reasignar a otro cliente/i })).toBeVisible()
  180 | 
  181 |     // Select the new client from the dropdown
> 182 |     await page.getByLabel('Seleccionar cliente destino').selectOption({ label: clienteB.nombre })
      |                                                          ^ Error: locator.selectOption: Error: Element is not a <select> element
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
  279 |     await page.getByRole('button', { name: /nuevo contacto/i }).click()
  280 |     await page.getByLabel(/^nombre$/i).fill('Auto Asociado F4')
  281 |     await page.getByLabel(/^cargo$/i).fill('Tester')
  282 |     await page.getByLabel(/^email$/i).fill(`auto.asoc.f4.${Date.now()}@test.com`)
```