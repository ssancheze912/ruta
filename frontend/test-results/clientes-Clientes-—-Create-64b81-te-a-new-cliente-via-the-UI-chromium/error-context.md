# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clientes.spec.ts >> Clientes — Create >> should create a new cliente via the UI
- Location: tests\e2e\clientes.spec.ts:23:3

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /saltar/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
          - heading [level=1] [ref=e34]: Clientes
          - button [ref=e35]:
            - generic [ref=e36]: Nuevo cliente
        - textbox [ref=e40]:
          - /placeholder: Buscar por nombre o NIT/RUC
        - generic [ref=e43]:
          - button [ref=e44] [cursor=pointer]:
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
              - button [ref=e67]:
                - generic [ref=e68]: Ver
              - button [ref=e69]:
                - generic [ref=e70]: Editar
              - button [ref=e71]:
                - generic [ref=e72]: Eliminar
          - generic [ref=e73]:
            - generic [ref=e75]: SANTIAGO SANCHEZ ESQUIVEL
            - generic [ref=e77]: "12331233"
            - generic [ref=e79]: "3186287645"
            - generic [ref=e81]: CALI
            - generic [ref=e84]:
              - button [ref=e85]:
                - generic [ref=e86]: Ver
              - button [ref=e87]:
                - generic [ref=e88]: Editar
              - button [ref=e89]:
                - generic [ref=e90]: Eliminar
          - generic [ref=e91]:
            - generic [ref=e93]: SANTIAGOaaaa SANCHEZ ESQUIVEL
            - generic [ref=e95]: 123fff
            - generic [ref=e97]: 3186287645f
            - generic [ref=e99]: CALI
            - generic [ref=e102]:
              - button [ref=e103]:
                - generic [ref=e104]: Ver
              - button [ref=e105]:
                - generic [ref=e106]: Editar
              - button [ref=e107]:
                - generic [ref=e108]: Eliminar
          - generic [ref=e109]:
            - generic [ref=e111]: SANTIAGO SANCHEZ ESQUIVEL
            - generic [ref=e113]: "12323"
            - generic [ref=e115]: "3186287645"
            - generic [ref=e117]: CALI
            - generic [ref=e120]:
              - button [ref=e121]:
                - generic [ref=e122]: Ver
              - button [ref=e123]:
                - generic [ref=e124]: Editar
              - button [ref=e125]:
                - generic [ref=e126]: Eliminar
          - generic [ref=e127]:
            - generic [ref=e129]: SANTIAGO SANCHEZ ESQUIVEL
            - generic [ref=e131]: "11"
            - generic [ref=e133]: "3186287645"
            - generic [ref=e135]: CALI
            - generic [ref=e138]:
              - button [ref=e139]:
                - generic [ref=e140]: Ver
              - button [ref=e141]:
                - generic [ref=e142]: Editar
              - button [ref=e143]:
                - generic [ref=e144]: Eliminar
          - generic [ref=e145]:
            - generic [ref=e147]: Concurrente NIT
            - generic [ref=e149]: RACE1776281874672
            - generic [ref=e151]: "111"
            - generic [ref=e153]: Test
            - generic [ref=e156]:
              - button [ref=e157]:
                - generic [ref=e158]: Ver
              - button [ref=e159]:
                - generic [ref=e160]: Editar
              - button [ref=e161]:
                - generic [ref=e162]: Eliminar
          - generic [ref=e163]:
            - generic [ref=e165]: Concurrente NIT
            - generic [ref=e167]: RACE1776260909754
            - generic [ref=e169]: "111"
            - generic [ref=e171]: Test
            - generic [ref=e174]:
              - button [ref=e175]:
                - generic [ref=e176]: Ver
              - button [ref=e177]:
                - generic [ref=e178]: Editar
              - button [ref=e179]:
                - generic [ref=e180]: Eliminar
          - generic [ref=e181]:
            - generic [ref=e183]: Empresa UI E2E
            - generic [ref=e185]: "123456789"
            - generic [ref=e187]: "3001234567"
            - generic [ref=e189]: Bogotá
            - generic [ref=e192]:
              - button [ref=e193]:
                - generic [ref=e194]: Ver
              - button [ref=e195]:
                - generic [ref=e196]: Editar
              - button [ref=e197]:
                - generic [ref=e198]: Eliminar
          - generic [ref=e199]:
            - generic [ref=e201]: Empresa XYZ
            - generic [ref=e203]: 800111222-3
            - generic [ref=e205]: +57 300 5555555
            - generic [ref=e207]: Cali
            - generic [ref=e210]:
              - button [ref=e211]:
                - generic [ref=e212]: Ver
              - button [ref=e213]:
                - generic [ref=e214]: Editar
              - button [ref=e215]:
                - generic [ref=e216]: Eliminar
          - generic [ref=e217]:
            - generic [ref=e219]: Concurrente NIT
            - generic [ref=e221]: RACE1776260185437
            - generic [ref=e223]: "111"
            - generic [ref=e225]: Test
            - generic [ref=e228]:
              - button [ref=e229]:
                - generic [ref=e230]: Ver
              - button [ref=e231]:
                - generic [ref=e232]: Editar
              - button [ref=e233]:
                - generic [ref=e234]: Eliminar
          - generic [ref=e235]:
            - generic [ref=e237]: Concurrente NIT
            - generic [ref=e239]: RACE1776261755400
            - generic [ref=e241]: "111"
            - generic [ref=e243]: Test
            - generic [ref=e246]:
              - button [ref=e247]:
                - generic [ref=e248]: Ver
              - button [ref=e249]:
                - generic [ref=e250]: Editar
              - button [ref=e251]:
                - generic [ref=e252]: Eliminar
  - dialog "Nuevo cliente" [ref=e256]:
    - heading "Nuevo cliente" [level=2] [ref=e258]
    - generic [ref=e259]:
      - generic [ref=e260]:
        - generic [ref=e262]: Nombre
        - textbox "Nombre" [ref=e264]: Empresa UI E2E
      - generic [ref=e265]:
        - generic [ref=e267]: NIT/RUC
        - textbox "NIT/RUC" [ref=e269]: "123456789"
        - paragraph [ref=e270]: El NIT/RUC ya está registrado
      - generic [ref=e271]:
        - generic [ref=e273]: Teléfono
        - textbox "Teléfono" [ref=e275]: "3001234567"
      - generic [ref=e276]:
        - generic [ref=e278]: Ciudad
        - textbox "Ciudad" [ref=e280]: Bogotá
      - generic [ref=e281]:
        - button "Cancelar" [ref=e282]:
          - generic [ref=e283]: Cancelar
        - button "Guardar" [ref=e284]:
          - generic [ref=e285]: Guardar
    - button "Close" [ref=e286]:
      - img
      - generic [ref=e287]: Close
```

# Test source

```ts
  1   | import { test, expect } from '../support/fixtures'
  2   | import { apiRequest } from '../support/helpers/api-request'
  3   | 
  4   | test.describe('Clientes — List View', () => {
  5   |   test('should display the clientes list page', async ({ page }) => {
  6   |     await page.goto('/clientes')
  7   |     await expect(page.getByRole('heading', { name: /clientes/i })).toBeVisible()
  8   |   })
  9   | 
  10  |   test('should show a newly created cliente in the list', async ({ page, clienteFactory }) => {
  11  |     // Arrange: seed a cliente via API before navigating
  12  |     const cliente = await clienteFactory.create({ nombre: 'Empresa Test E2E', nit: '999888777' })
  13  | 
  14  |     // Act: navigate to the list
  15  |     await page.goto('/clientes')
  16  | 
  17  |     // Assert: the seeded cliente appears
  18  |     await expect(page.getByText(cliente.nombre)).toBeVisible()
  19  |   })
  20  | })
  21  | 
  22  | test.describe('Clientes — Create', () => {
  23  |   test('should create a new cliente via the UI', async ({ page }) => {
  24  |     await page.goto('/clientes')
  25  | 
  26  |     // Open create dialog
  27  |     await page.getByRole('button', { name: /nuevo cliente/i }).click()
  28  | 
  29  |     // Fill form fields
  30  |     await page.getByLabel(/nombre/i).fill('Empresa UI E2E')
  31  |     await page.getByLabel(/nit\/ruc/i).fill('123456789')
  32  |     await page.getByLabel(/teléfono/i).fill('3001234567')
  33  |     await page.getByLabel(/ciudad/i).fill('Bogotá')
  34  | 
  35  |     // Submit
  36  |     await page.getByRole('button', { name: /guardar/i }).click()
  37  | 
  38  |     // After create, the "Asociar contacto (opcional)" step appears — skip it
> 39  |     await page.getByRole('button', { name: /saltar/i }).click()
      |                                                         ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  40  | 
  41  |     // Assert the new client appears in the list
  42  |     await expect(page.getByText('Empresa UI E2E')).toBeVisible()
  43  |   })
  44  | })
  45  | 
  46  | test.describe('Clientes — Detail', () => {
  47  |   test('[P0] should navigate to client detail on row click', async ({ page, clienteFactory }) => {
  48  |     // Arrange: seed a client via API
  49  |     const cliente = await clienteFactory.create({ nombre: 'Cliente Detalle E2E' })
  50  | 
  51  |     // Act: navigate to list and click the row
  52  |     await page.goto('/clientes')
  53  |     await expect(page.getByText(cliente.nombre)).toBeVisible()
  54  |     await page.getByText(cliente.nombre).first().click()
  55  | 
  56  |     // Assert: detail page loads with the client's name as heading
  57  |     await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
  58  |     await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
  59  |   })
  60  | 
  61  |   test('[P1] should edit a client name from the detail view', async ({ page, clienteFactory }) => {
  62  |     // Arrange: seed a client and navigate to its detail
  63  |     const cliente = await clienteFactory.create({ nombre: 'Editar Cliente E2E', nit: '111222333' })
  64  |     await page.goto(`/clientes/${cliente.id}`)
  65  | 
  66  |     // Act: open edit dialog, change nombre, save
  67  |     await page.getByRole('button', { name: /^editar$/i }).click()
  68  |     await expect(page.getByRole('heading', { name: /editar cliente/i })).toBeVisible()
  69  |     const nombreInput = page.getByLabel(/nombre/i)
  70  |     await nombreInput.clear()
  71  |     await nombreInput.fill('Cliente Actualizado E2E')
  72  |     await page.getByRole('button', { name: /guardar/i }).click()
  73  | 
  74  |     // Assert: heading updates to the new name
  75  |     await expect(page.getByRole('heading', { name: 'Cliente Actualizado E2E' })).toBeVisible()
  76  |   })
  77  | 
  78  |   test('[P1] should delete a client and redirect to list', async ({ page, clienteFactory }) => {
  79  |     // Arrange: seed a client and navigate to its detail
  80  |     const cliente = await clienteFactory.create({ nombre: 'Eliminar Cliente E2E' })
  81  |     await page.goto(`/clientes/${cliente.id}`)
  82  | 
  83  |     // Act: click Eliminar, confirm in dialog
  84  |     await page.getByRole('button', { name: /^eliminar$/i }).click()
  85  |     await expect(page.getByText('¿Eliminar este cliente?')).toBeVisible()
  86  |     await page.getByRole('dialog').getByRole('button', { name: /eliminar/i }).click()
  87  | 
  88  |     // Assert: redirected to /clientes, deleted client no longer visible
  89  |     await expect(page).toHaveURL('/clientes')
  90  |     await expect(page.getByText('Eliminar Cliente E2E')).not.toBeVisible()
  91  |   })
  92  | })
  93  | 
  94  | // ─── EPIC-SA-F2: Client Management — CSV-traced tests ─────────────────────────
  95  | 
  96  | test.describe('EPIC-SA-F2 — Clientes List', () => {
  97  |   test('TC-F2-01 [P3] Lista de clientes muestra todos los registros (FR2)', async ({
  98  |     page,
  99  |     clienteFactory,
  100 |   }) => {
  101 |     // GIVEN: 5+ clients seeded in DB
  102 |     const names = ['Empresa Alpha', 'Empresa Beta', 'Empresa Gamma', 'Empresa Delta', 'Empresa Epsilon']
  103 |     for (const nombre of names) {
  104 |       await clienteFactory.create({ nombre })
  105 |     }
  106 | 
  107 |     // WHEN: Navigate to /clientes
  108 |     await page.goto('/clientes')
  109 | 
  110 |     // THEN: Scrollable list shows all clients with Nombre and NIT/RUC per item
  111 |     for (const nombre of names) {
  112 |       await expect(page.getByText(nombre)).toBeVisible()
  113 |     }
  114 |   })
  115 | 
  116 |   test('TC-F2-02 [P2] Búsqueda por nombre parcial filtra correctamente (FR3)', async ({
  117 |     page,
  118 |     clienteFactory,
  119 |   }) => {
  120 |     // GIVEN: 5+ clients, some with "Empresa" in name
  121 |     await clienteFactory.create({ nombre: 'Empresa Filtro Uno' })
  122 |     await clienteFactory.create({ nombre: 'Empresa Filtro Dos' })
  123 |     await clienteFactory.create({ nombre: 'Corporacion Excluir' })
  124 | 
  125 |     await page.goto('/clientes')
  126 |     await expect(page.getByText('Empresa Filtro Uno')).toBeVisible()
  127 | 
  128 |     // WHEN: Type "Empresa" in the search field
  129 |     const searchInput = page.getByRole('textbox', { name: /buscar/i }).or(
  130 |       page.getByPlaceholder(/buscar/i)
  131 |     )
  132 |     await searchInput.fill('Empresa')
  133 | 
  134 |     // THEN: Only clients with "Empresa" in name shown; no API call needed (client-side)
  135 |     await expect(page.getByText('Empresa Filtro Uno')).toBeVisible()
  136 |     await expect(page.getByText('Empresa Filtro Dos')).toBeVisible()
  137 |     await expect(page.getByText('Corporacion Excluir')).not.toBeVisible()
  138 |   })
  139 | 
```