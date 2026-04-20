# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: asociacion.spec.ts >> Asociación — Forward navigation (client → contact) >> [P0] should navigate to contact detail from client detail in ≤2 clicks (NFR8)
- Location: tests\e2e\asociacion.spec.ts:60:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/contactos\/8e01aff6-f103-4180-8ce3-bc0fb727b90b/
Received string:  "http://localhost:5173/clientes/c7666a8f-2068-4f63-8bfd-51b55af80be5"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    13 × unexpected value "http://localhost:5173/clientes/c7666a8f-2068-4f63-8bfd-51b55af80be5"

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
        - heading "Cliente Navegar E2E" [level=1] [ref=e34]
        - generic [ref=e35]:
          - button "Editar" [ref=e36]:
            - generic [ref=e37]: Editar
          - button "Eliminar" [ref=e38]:
            - generic [ref=e39]: Eliminar
          - button "Volver" [ref=e40]:
            - generic [ref=e41]: Volver
      - generic [ref=e42]:
        - paragraph [ref=e44]: Nombre
        - paragraph [ref=e46]: Cliente Navegar E2E
      - generic [ref=e47]:
        - paragraph [ref=e49]: NIT/RUC
        - paragraph [ref=e51]: "750477087"
      - generic [ref=e52]:
        - paragraph [ref=e54]: Teléfono
        - paragraph [ref=e56]: (253) 451-4778
      - generic [ref=e57]:
        - paragraph [ref=e59]: Ciudad
        - paragraph [ref=e61]: Lindastead
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
              - generic [ref=e83]: Contacto Navegar E2E
              - generic [ref=e85]: Customer Mobility Manager
              - generic [ref=e87]: (953) 358-4022
              - generic [ref=e89]: Garnet_Cormier17@gmail.com
              - button "Desasociar" [ref=e92]:
                - generic [ref=e93]: Desasociar
```

# Test source

```ts
  1   | import { test, expect } from '../support/fixtures'
  2   | import { apiRequest } from '../support/helpers/api-request'
  3   | 
  4   | /**
  5   |  * E2E tests for Epic 4 — Client-Contact Association (Asociación Cliente-Contacto)
  6   |  *
  7   |  * Covers: viewing contacts in client detail, bidirectional navigation, associate,
  8   |  * disassociate, and reassign flows. All tests seed data via API factories and
  9   |  * clean up automatically on teardown.
  10  |  */
  11  | 
  12  | test.describe('Asociación — Client Detail shows associated contacts', () => {
  13  |   test('[P0] should show "Contactos asociados" section in client detail', async ({
  14  |     page,
  15  |     clienteFactory,
  16  |   }) => {
  17  |     // GIVEN: A client with no contacts
  18  |     const cliente = await clienteFactory.create({ nombre: 'Cliente Sin Contactos E2E' })
  19  | 
  20  |     // WHEN: The user opens the client detail
  21  |     await page.goto(`/clientes/${cliente.id}`)
  22  | 
  23  |     // THEN: The "Contactos asociados" section heading is visible
  24  |     await expect(page.getByRole('heading', { name: /contactos asociados/i })).toBeVisible()
  25  |   })
  26  | 
  27  |   test('[P1] should show empty state when client has no contacts', async ({
  28  |     page,
  29  |     clienteFactory,
  30  |   }) => {
  31  |     // GIVEN: A client with no associated contacts
  32  |     const cliente = await clienteFactory.create({ nombre: 'Cliente Vacío E2E' })
  33  | 
  34  |     // WHEN: The user opens the client detail
  35  |     await page.goto(`/clientes/${cliente.id}`)
  36  | 
  37  |     // THEN: The empty state message is shown
  38  |     await expect(page.getByText(/sin contactos asociados/i)).toBeVisible()
  39  |   })
  40  | 
  41  |   test('[P0] should display a contact that is associated with the client', async ({
  42  |     page,
  43  |     clienteFactory,
  44  |     contactoFactory,
  45  |   }) => {
  46  |     // GIVEN: A client with one associated contact
  47  |     const cliente = await clienteFactory.create({ nombre: 'Cliente Con Contacto E2E' })
  48  |     const contacto = await contactoFactory.create({ nombre: 'Contacto Asociado E2E' })
  49  |     await contactoFactory.assignCliente(contacto.id, cliente.id)
  50  | 
  51  |     // WHEN: The user opens the client detail
  52  |     await page.goto(`/clientes/${cliente.id}`)
  53  | 
  54  |     // THEN: The associated contact's name appears in the section
  55  |     await expect(page.getByText(contacto.nombre)).toBeVisible()
  56  |   })
  57  | })
  58  | 
  59  | test.describe('Asociación — Forward navigation (client → contact)', () => {
  60  |   test('[P0] should navigate to contact detail from client detail in ≤2 clicks (NFR8)', async ({
  61  |     page,
  62  |     clienteFactory,
  63  |     contactoFactory,
  64  |   }) => {
  65  |     // GIVEN: A client with one associated contact
  66  |     const cliente = await clienteFactory.create({ nombre: 'Cliente Navegar E2E' })
  67  |     const contacto = await contactoFactory.create({ nombre: 'Contacto Navegar E2E' })
  68  |     await contactoFactory.assignCliente(contacto.id, cliente.id)
  69  | 
  70  |     // WHEN: The user is in the client detail and clicks the contact row (1 click from client)
  71  |     await page.goto(`/clientes/${cliente.id}`)
  72  |     await expect(page.getByText(contacto.nombre)).toBeVisible()
  73  |     await page.getByText(contacto.nombre).first().click()
  74  | 
  75  |     // THEN: The contact detail page loads (≤2 clicks from client record → 1 click = NFR8 satisfied)
> 76  |     await expect(page).toHaveURL(new RegExp(`/contactos/${contacto.id}`))
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  77  |     await expect(page.getByRole('heading', { name: contacto.nombre })).toBeVisible()
  78  |   })
  79  | })
  80  | 
  81  | test.describe('Asociación — Back navigation (contact → client)', () => {
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
```