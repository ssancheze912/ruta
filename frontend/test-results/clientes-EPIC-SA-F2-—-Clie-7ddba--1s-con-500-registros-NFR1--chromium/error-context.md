# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clientes.spec.ts >> EPIC-SA-F2 — Clientes List >> TC-F2-04 [P0] Búsqueda responde en <1s con 500 registros (NFR1)
- Location: tests\e2e\clientes.spec.ts:164:3

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 1000
Received:   1327
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
        - heading "Clientes" [level=1] [ref=e34]
        - button "Nuevo cliente" [ref=e35]:
          - generic [ref=e36]: Nuevo cliente
      - textbox "Buscar clientes" [active] [ref=e40]:
        - /placeholder: Buscar por nombre o NIT/RUC
        - text: Perf
      - generic [ref=e43]:
        - button "Nombre" [ref=e44] [cursor=pointer]:
          - generic [ref=e45]: Nombre
        - generic [ref=e49]: NIT/RUC
        - generic [ref=e51]: Teléfono
        - generic [ref=e53]: Ciudad
        - generic [ref=e55]:
          - generic [ref=e57]: Cliente Perf 0
          - generic [ref=e59]: "866026926"
          - generic [ref=e61]: (630) 519-0807
          - generic [ref=e63]: North Alton
          - generic [ref=e66]:
            - button "Ver" [ref=e67]:
              - generic [ref=e68]: Ver
            - button "Editar" [ref=e69]:
              - generic [ref=e70]: Editar
            - button "Eliminar" [ref=e71]:
              - generic [ref=e72]: Eliminar
        - generic [ref=e73]:
          - generic [ref=e75]: Cliente Perf 1
          - generic [ref=e77]: "509113331"
          - generic [ref=e79]: (813) 884-5829
          - generic [ref=e81]: Annetteview
          - generic [ref=e84]:
            - button "Ver" [ref=e85]:
              - generic [ref=e86]: Ver
            - button "Editar" [ref=e87]:
              - generic [ref=e88]: Editar
            - button "Eliminar" [ref=e89]:
              - generic [ref=e90]: Eliminar
        - generic [ref=e91]:
          - generic [ref=e93]: Cliente Perf 2
          - generic [ref=e95]: "784888731"
          - generic [ref=e97]: (295) 723-4371
          - generic [ref=e99]: West Sidneyborough
          - generic [ref=e102]:
            - button "Ver" [ref=e103]:
              - generic [ref=e104]: Ver
            - button "Editar" [ref=e105]:
              - generic [ref=e106]: Editar
            - button "Eliminar" [ref=e107]:
              - generic [ref=e108]: Eliminar
        - generic [ref=e109]:
          - generic [ref=e111]: Cliente Perf 3
          - generic [ref=e113]: "979275251"
          - generic [ref=e115]: (380) 886-8816
          - generic [ref=e117]: Simi Valley
          - generic [ref=e120]:
            - button "Ver" [ref=e121]:
              - generic [ref=e122]: Ver
            - button "Editar" [ref=e123]:
              - generic [ref=e124]: Editar
            - button "Eliminar" [ref=e125]:
              - generic [ref=e126]: Eliminar
        - generic [ref=e127]:
          - generic [ref=e129]: Cliente Perf 4
          - generic [ref=e131]: "103361231"
          - generic [ref=e133]: (876) 520-3747
          - generic [ref=e135]: Port Jared
          - generic [ref=e138]:
            - button "Ver" [ref=e139]:
              - generic [ref=e140]: Ver
            - button "Editar" [ref=e141]:
              - generic [ref=e142]: Editar
            - button "Eliminar" [ref=e143]:
              - generic [ref=e144]: Eliminar
        - generic [ref=e145]:
          - generic [ref=e147]: Cliente Perf 5
          - generic [ref=e149]: "953084519"
          - generic [ref=e151]: (493) 623-4136
          - generic [ref=e153]: Lake Melvinworth
          - generic [ref=e156]:
            - button "Ver" [ref=e157]:
              - generic [ref=e158]: Ver
            - button "Editar" [ref=e159]:
              - generic [ref=e160]: Editar
            - button "Eliminar" [ref=e161]:
              - generic [ref=e162]: Eliminar
        - generic [ref=e163]:
          - generic [ref=e165]: Cliente Perf 6
          - generic [ref=e167]: "351200935"
          - generic [ref=e169]: (809) 779-8269
          - generic [ref=e171]: South Grace
          - generic [ref=e174]:
            - button "Ver" [ref=e175]:
              - generic [ref=e176]: Ver
            - button "Editar" [ref=e177]:
              - generic [ref=e178]: Editar
            - button "Eliminar" [ref=e179]:
              - generic [ref=e180]: Eliminar
        - generic [ref=e181]:
          - generic [ref=e183]: Cliente Perf 7
          - generic [ref=e185]: "804094538"
          - generic [ref=e187]: (226) 668-0535
          - generic [ref=e189]: South Joanie
          - generic [ref=e192]:
            - button "Ver" [ref=e193]:
              - generic [ref=e194]: Ver
            - button "Editar" [ref=e195]:
              - generic [ref=e196]: Editar
            - button "Eliminar" [ref=e197]:
              - generic [ref=e198]: Eliminar
        - generic [ref=e199]:
          - generic [ref=e201]: Cliente Perf 8
          - generic [ref=e203]: "901942054"
          - generic [ref=e205]: (665) 742-6364
          - generic [ref=e207]: New Jeffery
          - generic [ref=e210]:
            - button "Ver" [ref=e211]:
              - generic [ref=e212]: Ver
            - button "Editar" [ref=e213]:
              - generic [ref=e214]: Editar
            - button "Eliminar" [ref=e215]:
              - generic [ref=e216]: Eliminar
        - generic [ref=e217]:
          - generic [ref=e219]: Cliente Perf 9
          - generic [ref=e221]: "660645379"
          - generic [ref=e223]: (724) 795-3742
          - generic [ref=e225]: Lenexa
          - generic [ref=e228]:
            - button "Ver" [ref=e229]:
              - generic [ref=e230]: Ver
            - button "Editar" [ref=e231]:
              - generic [ref=e232]: Editar
            - button "Eliminar" [ref=e233]:
              - generic [ref=e234]: Eliminar
        - generic [ref=e235]:
          - generic [ref=e237]: Cliente Perf 10
          - generic [ref=e239]: "225469144"
          - generic [ref=e241]: (255) 454-3873
          - generic [ref=e243]: San Mateo
          - generic [ref=e246]:
            - button "Ver" [ref=e247]:
              - generic [ref=e248]: Ver
            - button "Editar" [ref=e249]:
              - generic [ref=e250]: Editar
            - button "Eliminar" [ref=e251]:
              - generic [ref=e252]: Eliminar
        - generic [ref=e253]:
          - generic [ref=e255]: Cliente Perf 11
          - generic [ref=e257]: "814669209"
          - generic [ref=e259]: (240) 491-7955
          - generic [ref=e261]: Port Marilyn
          - generic [ref=e264]:
            - button "Ver" [ref=e265]:
              - generic [ref=e266]: Ver
            - button "Editar" [ref=e267]:
              - generic [ref=e268]: Editar
            - button "Eliminar" [ref=e269]:
              - generic [ref=e270]: Eliminar
        - generic [ref=e271]:
          - generic [ref=e273]: Cliente Perf 12
          - generic [ref=e275]: "369644414"
          - generic [ref=e277]: (846) 328-4109
          - generic [ref=e279]: North Cheryl
          - generic [ref=e282]:
            - button "Ver" [ref=e283]:
              - generic [ref=e284]: Ver
            - button "Editar" [ref=e285]:
              - generic [ref=e286]: Editar
            - button "Eliminar" [ref=e287]:
              - generic [ref=e288]: Eliminar
        - generic [ref=e289]:
          - generic [ref=e291]: Cliente Perf 13
          - generic [ref=e293]: "743174040"
          - generic [ref=e295]: (599) 236-6215
          - generic [ref=e297]: Lake Beatricechester
          - generic [ref=e300]:
            - button "Ver" [ref=e301]:
              - generic [ref=e302]: Ver
            - button "Editar" [ref=e303]:
              - generic [ref=e304]: Editar
            - button "Eliminar" [ref=e305]:
              - generic [ref=e306]: Eliminar
        - generic [ref=e307]:
          - generic [ref=e309]: Cliente Perf 14
          - generic [ref=e311]: "928245977"
          - generic [ref=e313]: (899) 718-0933
          - generic [ref=e315]: Alainamouth
          - generic [ref=e318]:
            - button "Ver" [ref=e319]:
              - generic [ref=e320]: Ver
            - button "Editar" [ref=e321]:
              - generic [ref=e322]: Editar
            - button "Eliminar" [ref=e323]:
              - generic [ref=e324]: Eliminar
        - generic [ref=e325]:
          - generic [ref=e327]: Cliente Perf 15
          - generic [ref=e329]: "010047401"
          - generic [ref=e331]: (329) 691-6740
          - generic [ref=e333]: Ernserton
          - generic [ref=e336]:
            - button "Ver" [ref=e337]:
              - generic [ref=e338]: Ver
            - button "Editar" [ref=e339]:
              - generic [ref=e340]: Editar
            - button "Eliminar" [ref=e341]:
              - generic [ref=e342]: Eliminar
        - generic [ref=e343]:
          - generic [ref=e345]: Cliente Perf 16
          - generic [ref=e347]: "097036361"
          - generic [ref=e349]: (415) 804-6600
          - generic [ref=e351]: North Alma
          - generic [ref=e354]:
            - button "Ver" [ref=e355]:
              - generic [ref=e356]: Ver
            - button "Editar" [ref=e357]:
              - generic [ref=e358]: Editar
            - button "Eliminar" [ref=e359]:
              - generic [ref=e360]: Eliminar
        - generic [ref=e361]:
          - generic [ref=e363]: Cliente Perf 17
          - generic [ref=e365]: "829524263"
          - generic [ref=e367]: (814) 289-3598
          - generic [ref=e369]: Lake Timothychester
          - generic [ref=e372]:
            - button "Ver" [ref=e373]:
              - generic [ref=e374]: Ver
            - button "Editar" [ref=e375]:
              - generic [ref=e376]: Editar
            - button "Eliminar" [ref=e377]:
              - generic [ref=e378]: Eliminar
        - generic [ref=e379]:
          - generic [ref=e381]: Cliente Perf 18
          - generic [ref=e383]: "849599452"
          - generic [ref=e385]: (645) 270-1609
          - generic [ref=e387]: Kessler-Klingfield
          - generic [ref=e390]:
            - button "Ver" [ref=e391]:
              - generic [ref=e392]: Ver
            - button "Editar" [ref=e393]:
              - generic [ref=e394]: Editar
            - button "Eliminar" [ref=e395]:
              - generic [ref=e396]: Eliminar
        - generic [ref=e397]:
          - generic [ref=e399]: Cliente Perf 19
          - generic [ref=e401]: "210419349"
          - generic [ref=e403]: (952) 938-3074
          - generic [ref=e405]: New Marques
          - generic [ref=e408]:
            - button "Ver" [ref=e409]:
              - generic [ref=e410]: Ver
            - button "Editar" [ref=e411]:
              - generic [ref=e412]: Editar
            - button "Eliminar" [ref=e413]:
              - generic [ref=e414]: Eliminar
```

# Test source

```ts
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
  140 |   test('TC-F2-03 [P2] Búsqueda por NIT/RUC parcial filtra correctamente (FR4)', async ({
  141 |     page,
  142 |     clienteFactory,
  143 |   }) => {
  144 |     // GIVEN: 5+ clients with distinct NITs
  145 |     await clienteFactory.create({ nombre: 'Cliente NIT A', nit: '900100001' })
  146 |     await clienteFactory.create({ nombre: 'Cliente NIT B', nit: '900100002' })
  147 |     await clienteFactory.create({ nombre: 'Cliente NIT C', nit: '111222333' })
  148 | 
  149 |     await page.goto('/clientes')
  150 |     await expect(page.getByText('Cliente NIT A')).toBeVisible()
  151 | 
  152 |     // WHEN: Type partial NIT "9001" in search
  153 |     const searchInput = page.getByRole('textbox', { name: /buscar/i }).or(
  154 |       page.getByPlaceholder(/buscar/i)
  155 |     )
  156 |     await searchInput.fill('9001')
  157 | 
  158 |     // THEN: Only clients with "9001" in NIT shown
  159 |     await expect(page.getByText('Cliente NIT A')).toBeVisible()
  160 |     await expect(page.getByText('Cliente NIT B')).toBeVisible()
  161 |     await expect(page.getByText('Cliente NIT C')).not.toBeVisible()
  162 |   })
  163 | 
  164 |   test('TC-F2-04 [P0] Búsqueda responde en <1s con 500 registros (NFR1)', async ({
  165 |     page,
  166 |     clienteFactory,
  167 |   }) => {
  168 |     // GIVEN: 500 clients seeded (batch-created via API)
  169 |     const batch = Array.from({ length: 20 }, (_, i) => ({ nombre: `Cliente Perf ${i}` }))
  170 |     for (const c of batch) {
  171 |       await clienteFactory.create(c)
  172 |     }
  173 | 
  174 |     await page.goto('/clientes')
  175 | 
  176 |     // WHEN: Measure keystroke-to-re-render time
  177 |     const start = Date.now()
  178 |     const searchInput = page.getByRole('textbox', { name: /buscar/i }).or(
  179 |       page.getByPlaceholder(/buscar/i)
  180 |     )
  181 |     await searchInput.fill('Perf')
  182 |     await page.waitForTimeout(50) // allow re-render
  183 |     const elapsed = Date.now() - start
  184 | 
  185 |     // THEN: Filter response < 1000ms (P95)
> 186 |     expect(elapsed).toBeLessThan(1000)
      |                     ^ Error: expect(received).toBeLessThan(expected)
  187 |   })
  188 | 
  189 |   test('TC-F2-05 [P3] EmptyState cuando no hay clientes', async ({ page }) => {
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
```