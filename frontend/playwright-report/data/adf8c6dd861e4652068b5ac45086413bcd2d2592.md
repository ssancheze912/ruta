# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clientes.spec.ts >> EPIC-SA-F2 — Clientes Create >> TC-F2-10 [P0] Crear cliente con todos los campos válidos (FR1, FR27)
- Location: tests\e2e\clientes.spec.ts:272:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/creado correctamente|cliente creado/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/creado correctamente|cliente creado/i)

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
        - textbox "Nombre" [ref=e264]: Empresa XYZ
      - generic [ref=e265]:
        - generic [ref=e267]: NIT/RUC
        - textbox "NIT/RUC" [ref=e269]: 800111222-3
        - paragraph [ref=e270]: El NIT/RUC ya está registrado
      - generic [ref=e271]:
        - generic [ref=e273]: Teléfono
        - textbox "Teléfono" [ref=e275]: +57 300 5555555
      - generic [ref=e276]:
        - generic [ref=e278]: Ciudad
        - textbox "Ciudad" [ref=e280]: Cali
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
  190 |     // GIVEN: DB has no clients (test isolation — run in a clean env or use a unique search)
  191 |     await page.goto('/clientes')
  192 | 
  193 |     // Intercept so the list returns empty
  194 |     await page.route('**/api/v1/clientes**', (route) =>
  195 |       route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  196 |     )
  197 |     await page.reload()
  198 | 
  199 |     // THEN: EmptyState component visible with guidance message
  200 |     await expect(page.getByText(/sin clientes|no hay clientes|crear/i)).toBeVisible()
  201 |   })
  202 | 
  203 |   test('TC-F2-06 [P2] ErrorPanel cuando backend no responde', async ({ page }) => {
  204 |     // GIVEN: Backend returns 500 for GET /clientes
  205 |     await page.route('**/api/v1/clientes**', (route) =>
  206 |       route.fulfill({ status: 500, body: 'Internal Server Error' })
  207 |     )
  208 | 
  209 |     // WHEN: Navigate to /clientes
  210 |     await page.goto('/clientes')
  211 | 
  212 |     // THEN: ErrorPanel visible with "Reintentar" button; no stack trace
  213 |     await expect(page.getByRole('button', { name: /reintentar/i })).toBeVisible()
  214 |     await expect(page.getByText(/stack|exception|System\./i)).not.toBeVisible()
  215 |   })
  216 | })
  217 | 
  218 | test.describe('EPIC-SA-F2 — Clientes Detail', () => {
  219 |   test('TC-F2-07 [P3] Detalle de cliente muestra todos los campos (FR5)', async ({
  220 |     page,
  221 |     clienteFactory,
  222 |   }) => {
  223 |     // GIVEN: A client exists with all fields filled
  224 |     const cliente = await clienteFactory.create({
  225 |       nombre: 'Empresa Detalle Completa',
  226 |       nit: '800555666',
  227 |       telefono: '3109876543',
  228 |       ciudad: 'Cali',
  229 |     })
  230 | 
  231 |     // WHEN: Navigate to list and click the client
  232 |     await page.goto('/clientes')
  233 |     await expect(page.getByText(cliente.nombre)).toBeVisible()
  234 |     await page.getByText(cliente.nombre).first().click()
  235 | 
  236 |     // THEN: Right panel shows Nombre, NIT/RUC, Teléfono, Ciudad
  237 |     await expect(page.getByText(cliente.nombre)).toBeVisible()
  238 |     await expect(page.getByText(cliente.nit)).toBeVisible()
  239 |     await expect(page.getByText('3109876543')).toBeVisible()
  240 |     await expect(page.getByText('Cali')).toBeVisible()
  241 |   })
  242 | 
  243 |   test('TC-F2-08 [P2] Deep link a /clientes/:id carga detalle correcto (FR30)', async ({
  244 |     page,
  245 |     clienteFactory,
  246 |   }) => {
  247 |     // GIVEN: Client with known UUID
  248 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Deep Link Detail' })
  249 | 
  250 |     // WHEN: Navigate directly to /clientes/:id
  251 |     await page.goto(`/clientes/${cliente.id}`)
  252 | 
  253 |     // THEN: Correct client detail shown without redirect
  254 |     await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
  255 |     await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
  256 |   })
  257 | 
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
> 290 |     await expect(page.getByText(/creado correctamente|cliente creado/i)).toBeVisible()
      |                                                                          ^ Error: expect(locator).toBeVisible() failed
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
```