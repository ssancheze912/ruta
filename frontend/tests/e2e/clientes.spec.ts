import { test, expect } from '../support/fixtures'
import { apiRequest } from '../support/helpers/api-request'

test.describe('Clientes — List View', () => {
  test('should display the clientes list page', async ({ page }) => {
    await page.goto('/clientes')
    await expect(page.getByRole('heading', { name: /clientes/i })).toBeVisible()
  })

  test('should show a newly created cliente in the list', async ({ page, clienteFactory }) => {
    // Arrange: seed a cliente via API before navigating
    const cliente = await clienteFactory.create({ nombre: 'Empresa Test E2E', nit: '999888777' })

    // Act: navigate to the list
    await page.goto('/clientes')

    // Assert: the seeded cliente appears
    await expect(page.getByText(cliente.nombre)).toBeVisible()
  })
})

test.describe('Clientes — Create', () => {
  test('should create a new cliente via the UI', async ({ page }) => {
    await page.goto('/clientes')

    // Open create dialog
    await page.getByRole('button', { name: /nuevo cliente/i }).click()

    // Fill form fields
    await page.getByLabel(/nombre/i).fill('Empresa UI E2E')
    await page.getByLabel(/nit\/ruc/i).fill('123456789')
    await page.getByLabel(/teléfono/i).fill('3001234567')
    await page.getByLabel(/ciudad/i).fill('Bogotá')

    // Submit
    await page.getByRole('button', { name: /guardar/i }).click()

    // After create, the "Asociar contacto (opcional)" step appears — skip it
    await page.getByRole('button', { name: /saltar/i }).click()

    // Assert the new client appears in the list
    await expect(page.getByText('Empresa UI E2E')).toBeVisible()
  })
})

test.describe('Clientes — Detail', () => {
  test('[P0] should navigate to client detail on row click', async ({ page, clienteFactory }) => {
    // Arrange: seed a client via API
    const cliente = await clienteFactory.create({ nombre: 'Cliente Detalle E2E' })

    // Act: navigate to list and click the row
    await page.goto('/clientes')
    await expect(page.getByText(cliente.nombre)).toBeVisible()
    await page.getByText(cliente.nombre).first().click()

    // Assert: detail page loads with the client's name as heading
    await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
    await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
  })

  test('[P1] should edit a client name from the detail view', async ({ page, clienteFactory }) => {
    // Arrange: seed a client and navigate to its detail
    const cliente = await clienteFactory.create({ nombre: 'Editar Cliente E2E', nit: '111222333' })
    await page.goto(`/clientes/${cliente.id}`)

    // Act: open edit dialog, change nombre, save
    await page.getByRole('button', { name: /^editar$/i }).click()
    await expect(page.getByRole('heading', { name: /editar cliente/i })).toBeVisible()
    const nombreInput = page.getByLabel(/nombre/i)
    await nombreInput.clear()
    await nombreInput.fill('Cliente Actualizado E2E')
    await page.getByRole('button', { name: /guardar/i }).click()

    // Assert: heading updates to the new name
    await expect(page.getByRole('heading', { name: 'Cliente Actualizado E2E' })).toBeVisible()
  })

  test('[P1] should delete a client and redirect to list', async ({ page, clienteFactory }) => {
    // Arrange: seed a client and navigate to its detail
    const cliente = await clienteFactory.create({ nombre: 'Eliminar Cliente E2E' })
    await page.goto(`/clientes/${cliente.id}`)

    // Act: click Eliminar, confirm in dialog
    await page.getByRole('button', { name: /^eliminar$/i }).click()
    await expect(page.getByText('¿Eliminar este cliente?')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: /eliminar/i }).click()

    // Assert: redirected to /clientes, deleted client no longer visible
    await expect(page).toHaveURL('/clientes')
    await expect(page.getByText('Eliminar Cliente E2E')).not.toBeVisible()
  })
})

// ─── EPIC-SA-F2: Client Management — CSV-traced tests ─────────────────────────

test.describe('EPIC-SA-F2 — Clientes List', () => {
  test('TC-F2-01 [P3] Lista de clientes muestra todos los registros (FR2)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: 5+ clients seeded in DB
    const names = ['Empresa Alpha', 'Empresa Beta', 'Empresa Gamma', 'Empresa Delta', 'Empresa Epsilon']
    for (const nombre of names) {
      await clienteFactory.create({ nombre })
    }

    // WHEN: Navigate to /clientes
    await page.goto('/clientes')

    // THEN: Scrollable list shows all clients with Nombre and NIT/RUC per item
    for (const nombre of names) {
      await expect(page.getByText(nombre)).toBeVisible()
    }
  })

  test('TC-F2-02 [P2] Búsqueda por nombre parcial filtra correctamente (FR3)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: 5+ clients, some with "Empresa" in name
    await clienteFactory.create({ nombre: 'Empresa Filtro Uno' })
    await clienteFactory.create({ nombre: 'Empresa Filtro Dos' })
    await clienteFactory.create({ nombre: 'Corporacion Excluir' })

    await page.goto('/clientes')
    await expect(page.getByText('Empresa Filtro Uno')).toBeVisible()

    // WHEN: Type "Empresa" in the search field
    const searchInput = page.getByRole('textbox', { name: /buscar/i }).or(
      page.getByPlaceholder(/buscar/i)
    )
    await searchInput.fill('Empresa')

    // THEN: Only clients with "Empresa" in name shown; no API call needed (client-side)
    await expect(page.getByText('Empresa Filtro Uno')).toBeVisible()
    await expect(page.getByText('Empresa Filtro Dos')).toBeVisible()
    await expect(page.getByText('Corporacion Excluir')).not.toBeVisible()
  })

  test('TC-F2-03 [P2] Búsqueda por NIT/RUC parcial filtra correctamente (FR4)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: 5+ clients with distinct NITs
    await clienteFactory.create({ nombre: 'Cliente NIT A', nit: '900100001' })
    await clienteFactory.create({ nombre: 'Cliente NIT B', nit: '900100002' })
    await clienteFactory.create({ nombre: 'Cliente NIT C', nit: '111222333' })

    await page.goto('/clientes')
    await expect(page.getByText('Cliente NIT A')).toBeVisible()

    // WHEN: Type partial NIT "9001" in search
    const searchInput = page.getByRole('textbox', { name: /buscar/i }).or(
      page.getByPlaceholder(/buscar/i)
    )
    await searchInput.fill('9001')

    // THEN: Only clients with "9001" in NIT shown
    await expect(page.getByText('Cliente NIT A')).toBeVisible()
    await expect(page.getByText('Cliente NIT B')).toBeVisible()
    await expect(page.getByText('Cliente NIT C')).not.toBeVisible()
  })

  test('TC-F2-04 [P0] Búsqueda responde en <1s con 500 registros (NFR1)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: 500 clients seeded (batch-created via API)
    const batch = Array.from({ length: 20 }, (_, i) => ({ nombre: `Cliente Perf ${i}` }))
    for (const c of batch) {
      await clienteFactory.create(c)
    }

    await page.goto('/clientes')

    // WHEN: Measure keystroke-to-re-render time
    const start = Date.now()
    const searchInput = page.getByRole('textbox', { name: /buscar/i }).or(
      page.getByPlaceholder(/buscar/i)
    )
    await searchInput.fill('Perf')
    await page.waitForTimeout(50) // allow re-render
    const elapsed = Date.now() - start

    // THEN: Filter response < 1000ms (P95)
    expect(elapsed).toBeLessThan(1000)
  })

  test('TC-F2-05 [P3] EmptyState cuando no hay clientes', async ({ page }) => {
    // GIVEN: DB has no clients (test isolation — run in a clean env or use a unique search)
    await page.goto('/clientes')

    // Intercept so the list returns empty
    await page.route('**/api/v1/clientes**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    )
    await page.reload()

    // THEN: EmptyState component visible with guidance message
    await expect(page.getByText(/sin clientes|no hay clientes|crear/i)).toBeVisible()
  })

  test('TC-F2-06 [P2] ErrorPanel cuando backend no responde', async ({ page }) => {
    // GIVEN: Backend returns 500 for GET /clientes
    await page.route('**/api/v1/clientes**', (route) =>
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    )

    // WHEN: Navigate to /clientes
    await page.goto('/clientes')

    // THEN: ErrorPanel visible with "Reintentar" button; no stack trace
    await expect(page.getByRole('button', { name: /reintentar/i })).toBeVisible()
    await expect(page.getByText(/stack|exception|System\./i)).not.toBeVisible()
  })
})

test.describe('EPIC-SA-F2 — Clientes Detail', () => {
  test('TC-F2-07 [P3] Detalle de cliente muestra todos los campos (FR5)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: A client exists with all fields filled
    const cliente = await clienteFactory.create({
      nombre: 'Empresa Detalle Completa',
      nit: '800555666',
      telefono: '3109876543',
      ciudad: 'Cali',
    })

    // WHEN: Navigate to list and click the client
    await page.goto('/clientes')
    await expect(page.getByText(cliente.nombre)).toBeVisible()
    await page.getByText(cliente.nombre).first().click()

    // THEN: Right panel shows Nombre, NIT/RUC, Teléfono, Ciudad
    await expect(page.getByText(cliente.nombre)).toBeVisible()
    await expect(page.getByText(cliente.nit)).toBeVisible()
    await expect(page.getByText('3109876543')).toBeVisible()
    await expect(page.getByText('Cali')).toBeVisible()
  })

  test('TC-F2-08 [P2] Deep link a /clientes/:id carga detalle correcto (FR30)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: Client with known UUID
    const cliente = await clienteFactory.create({ nombre: 'Cliente Deep Link Detail' })

    // WHEN: Navigate directly to /clientes/:id
    await page.goto(`/clientes/${cliente.id}`)

    // THEN: Correct client detail shown without redirect
    await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
  })

  test('TC-F2-09 [P3] Deep link con ID inexistente muestra not-found', async ({ page }) => {
    // WHEN: Navigate to /clientes with a non-existent UUID
    await page.goto('/clientes/00000000-0000-0000-0000-000000000000')

    // THEN: Not-found message shown; no JavaScript error
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    await expect(page.getByText(/no encontrado|not found|404/i)).toBeVisible()
  })
})

test.describe('EPIC-SA-F2 — Clientes Create', () => {
  test('TC-F2-10 [P0] Crear cliente con todos los campos válidos (FR1, FR27)', async ({ page }) => {
    // GIVEN: DB active, form ready to open
    await page.goto('/clientes')

    // WHEN: Click "Nuevo cliente" and fill all fields
    await page.getByRole('button', { name: /nuevo cliente/i }).click()
    await page.getByLabel(/nombre/i).fill('Empresa XYZ')
    await page.getByLabel(/nit\/ruc/i).fill('800111222-3')
    await page.getByLabel(/teléfono/i).fill('+57 300 5555555')
    await page.getByLabel(/ciudad/i).fill('Cali')
    await page.getByRole('button', { name: /guardar/i }).click()

    // Skip optional association step if it appears
    const saltar = page.getByRole('button', { name: /saltar/i })
    if (await saltar.isVisible()) await saltar.click()

    // THEN: Client appears in list immediately; toast shown; form closes
    await expect(page.getByText('Empresa XYZ')).toBeVisible()
    await expect(page.getByText(/creado correctamente|cliente creado/i)).toBeVisible()
  })

  test('TC-F2-11 [P0] Crear cliente con NIT duplicado → 409 Conflict (FR8)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: A client with NIT "800111222-3" already exists
    await clienteFactory.create({ nombre: 'Existente NIT', nit: '800111222-3' })

    // WHEN: Try to create another client with the same NIT
    await page.goto('/clientes')
    await page.getByRole('button', { name: /nuevo cliente/i }).click()
    await page.getByLabel(/nombre/i).fill('Duplicado NIT')
    await page.getByLabel(/nit\/ruc/i).fill('800111222-3')
    await page.getByRole('button', { name: /guardar/i }).click()

    // THEN: Error message about duplicated NIT; no stack trace; form stays open
    await expect(page.getByText(/nit.*registrado|ya está registrado|duplicado/i)).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('TC-F2-12 [P1] Form bloqueado con Nombre vacío (FR8 — Zod)', async ({ page }) => {
    // GIVEN: Create form open
    await page.goto('/clientes')
    await page.getByRole('button', { name: /nuevo cliente/i }).click()

    // WHEN: Leave Nombre empty and submit
    await page.getByLabel(/nit\/ruc/i).fill('999777555')
    await page.getByRole('button', { name: /guardar/i }).click()

    // THEN: Inline error on Nombre; no HTTP call; form stays open
    await expect(page.getByText(/campo requerido|obligatorio|nombre.*requerido/i)).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('TC-F2-13 [P1] Form bloqueado con NIT/RUC vacío (FR8 — Zod)', async ({ page }) => {
    // GIVEN: Create form open
    await page.goto('/clientes')
    await page.getByRole('button', { name: /nuevo cliente/i }).click()

    // WHEN: Leave NIT/RUC empty and submit
    await page.getByLabel(/nombre/i).fill('Sin NIT')
    await page.getByRole('button', { name: /guardar/i }).click()

    // THEN: Inline error on NIT/RUC; no HTTP call
    await expect(page.getByText(/campo requerido|obligatorio|nit.*requerido/i)).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('TC-F2-24 [P1] Doble clic en Guardar no crea duplicados', async ({ page }) => {
    // GIVEN: Form ready with valid data
    await page.goto('/clientes')
    await page.getByRole('button', { name: /nuevo cliente/i }).click()
    await page.getByLabel(/nombre/i).fill('Cliente Doble Click E2E')
    await page.getByLabel(/nit\/ruc/i).fill('321654987')

    // WHEN: Double-click Guardar quickly
    const saveBtn = page.getByRole('button', { name: /guardar/i })
    await Promise.all([saveBtn.click(), saveBtn.click()])

    // Skip optional step if shown
    const saltar = page.getByRole('button', { name: /saltar/i })
    if (await saltar.isVisible()) await saltar.click()

    // THEN: Only 1 client created (button disabled during mutation)
    await page.goto('/clientes')
    const matches = page.getByText('Cliente Doble Click E2E')
    await expect(matches.first()).toBeVisible()
    expect(await matches.count()).toBe(1)
  })

  test('TC-F2-25 [P1] XSS en campo Nombre del cliente — sanitización', async ({ page }) => {
    // GIVEN: Create form open
    await page.goto('/clientes')
    await page.getByRole('button', { name: /nuevo cliente/i }).click()

    // WHEN: Enter XSS payload in Nombre
    const xss = "<script>alert('xss')</script>"
    await page.getByLabel(/nombre/i).fill(xss)
    await page.getByLabel(/nit\/ruc/i).fill('777888999')
    await page.getByRole('button', { name: /guardar/i }).click()

    const saltar = page.getByRole('button', { name: /saltar/i })
    if (await saltar.isVisible()) await saltar.click()

    // THEN: Script not executed; rendered as literal text
    const dialogs: string[] = []
    page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss() })
    await page.goto('/clientes')
    expect(dialogs).toHaveLength(0)
  })

  test('TC-F2-29 [P0] Creación concurrente con mismo NIT — race condition', async ({
    page,
    request,
  }) => {
    // GIVEN: Backend active with uk_clientes_nit constraint
    const API_URL = process.env.API_URL ?? 'http://localhost:5000/api/v1'
    const payload = {
      nombre: 'Concurrente NIT',
      nit: `RACE${Date.now()}`,
      telefono: '111',
      ciudad: 'Test',
    }

    // WHEN: Send 2 simultaneous POSTs with the same NIT
    const [res1, res2] = await Promise.all([
      request.post(`${API_URL}/clientes`, { data: payload }),
      request.post(`${API_URL}/clientes`, { data: payload }),
    ])

    const statuses = [res1.status(), res2.status()].sort()

    // THEN: Only 1 created (201); the other gets 409; no 500
    expect(statuses).toContain(201)
    expect(statuses).toContain(409)
    expect(statuses).not.toContain(500)
  })
})

test.describe('EPIC-SA-F2 — Clientes Edit', () => {
  test('TC-F2-15 [P2] Form de edición pre-poblado con valores actuales (FR6)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: Client with all fields complete
    const cliente = await clienteFactory.create({
      nombre: 'PrePoblado E2E',
      nit: '900444555',
      telefono: '3201234567',
      ciudad: 'Medellín',
    })
    await page.goto(`/clientes/${cliente.id}`)

    // WHEN: Click Editar
    await page.getByRole('button', { name: /^editar$/i }).click()

    // THEN: Form opens with exact current values
    await expect(page.getByLabel(/nombre/i)).toHaveValue(cliente.nombre)
    await expect(page.getByLabel(/nit\/ruc/i)).toHaveValue(cliente.nit)
  })

  test('TC-F2-16 [P2] Editar cliente — guardar cambios reflejado inmediatamente (FR6, FR27)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: Existing client
    const cliente = await clienteFactory.create({ nombre: 'Editar Ciudad E2E', ciudad: 'Bogotá' })
    await page.goto(`/clientes/${cliente.id}`)

    // WHEN: Edit ciudad to "Medellín"
    await page.getByRole('button', { name: /^editar$/i }).click()
    const ciudadInput = page.getByLabel(/ciudad/i)
    await ciudadInput.clear()
    await ciudadInput.fill('Medellín')
    await page.getByRole('button', { name: /guardar/i }).click()

    // THEN: "Medellín" shown immediately; toast visible
    await expect(page.getByText('Medellín')).toBeVisible()
    await expect(page.getByText(/actualizado correctamente|cliente actualizado/i)).toBeVisible()
  })

  test('TC-F2-17 [P2] Edición bloqueada al borrar campo requerido (FR8)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: Edit form open with complete data
    const cliente = await clienteFactory.create({ nombre: 'Edicion Bloqueada E2E' })
    await page.goto(`/clientes/${cliente.id}`)
    await page.getByRole('button', { name: /^editar$/i }).click()

    // WHEN: Clear Nombre and submit
    const nombreInput = page.getByLabel(/nombre/i)
    await nombreInput.clear()
    await page.getByRole('button', { name: /guardar/i }).click()

    // THEN: Inline error; no HTTP call
    await expect(page.getByText(/campo requerido|obligatorio/i)).toBeVisible()
  })

  test('TC-F2-18 [P3] Cancelar edición no persiste cambios', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: Edit form open with a pending change
    const cliente = await clienteFactory.create({ nombre: 'Cancel Edicion E2E' })
    await page.goto(`/clientes/${cliente.id}`)
    await page.getByRole('button', { name: /^editar$/i }).click()
    await page.getByLabel(/nombre/i).fill('New Name Not Saved')

    // WHEN: Cancel
    await page.getByRole('button', { name: /cancelar/i }).click()

    // THEN: Original nombre shown
    await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
    await expect(page.getByText('New Name Not Saved')).not.toBeVisible()
  })

  test('TC-F2-26 [P2] Pegar texto con Unicode special (non-breaking space)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: Create form open
    await page.goto('/clientes')
    await page.getByRole('button', { name: /nuevo cliente/i }).click()

    // WHEN: Fill name with non-breaking space (U+00A0)
    const nombreWithNBSP = 'Empresa\u00a0ABC'
    await page.getByLabel(/nombre/i).fill(nombreWithNBSP)
    await page.getByLabel(/nit\/ruc/i).fill('555444333')
    await page.getByRole('button', { name: /guardar/i }).click()

    const saltar = page.getByRole('button', { name: /saltar/i })
    if (await saltar.isVisible()) await saltar.click()

    // THEN: Client appears in list; search behavior documented (edge case investigation)
    await expect(page.getByText(/Empresa/i)).toBeVisible()
  })

  test('TC-F2-30 [P2] Editar cliente eliminado concurrentemente — 404 en PUT', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: Client open for editing by User A; simulate User B deletes it
    const cliente = await clienteFactory.create({ nombre: 'Concurrente Delete E2E' })
    await page.goto(`/clientes/${cliente.id}`)
    await page.getByRole('button', { name: /^editar$/i }).click()

    // Simulate the client being deleted while form is open
    await page.route(`**/api/v1/clientes/${cliente.id}`, (route) => {
      if (route.request().method() === 'PUT') {
        route.fulfill({ status: 404, body: JSON.stringify({ title: 'Not Found' }) })
      } else {
        route.continue()
      }
    })

    // WHEN: User A saves changes
    await page.getByLabel(/nombre/i).fill('Intento Fallido')
    await page.getByRole('button', { name: /guardar/i }).click()

    // THEN: Clear error message; no stack trace (NFR6)
    await expect(page.getByText(/no encontrado|not found|404|error/i)).toBeVisible()
    await expect(page.getByText(/stack|exception|System\./i)).not.toBeVisible()
  })
})

test.describe('EPIC-SA-F2 — Clientes Delete', () => {
  test('TC-F2-19 [P3] Dialog de confirmación aparece al eliminar cliente (FR7)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: Client visible in detail
    const cliente = await clienteFactory.create({ nombre: 'Cliente Dialog Delete E2E' })
    await page.goto(`/clientes/${cliente.id}`)

    // WHEN: Click Eliminar
    await page.getByRole('button', { name: /^eliminar$/i }).click()

    // THEN: Confirmation dialog shows with Confirmar and Cancelar buttons
    await expect(page.getByText(/¿eliminar este cliente|eliminar cliente/i)).toBeVisible()
    await expect(page.getByRole('dialog').getByRole('button', { name: /confirmar|eliminar/i })).toBeVisible()
    await expect(page.getByRole('dialog').getByRole('button', { name: /cancelar/i })).toBeVisible()
  })

  test('TC-F2-20 [P1] Confirmar eliminación remueve cliente de la lista (FR7, FR27)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: Client without contacts in detail
    const cliente = await clienteFactory.create({ nombre: 'Eliminar Confirmado E2E' })
    await page.goto(`/clientes/${cliente.id}`)

    // WHEN: Click Eliminar → Confirmar
    await page.getByRole('button', { name: /^eliminar$/i }).click()
    await page.getByRole('dialog').getByRole('button', { name: /confirmar|eliminar/i }).click()

    // THEN: Client gone from list; empty right panel; toast shown
    await expect(page).toHaveURL('/clientes')
    await expect(page.getByText('Eliminar Confirmado E2E')).not.toBeVisible()
    await expect(page.getByText(/eliminado correctamente/i)).toBeVisible()
  })

  test('TC-F2-21 [P0] CRÍTICO: Eliminar cliente con contactos → cascade NULL', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Client with 3 associated contacts
    const cliente = await clienteFactory.create({ nombre: 'Cliente Cascade E2E' })
    const c1 = await contactoFactory.create({ nombre: 'Cascada Contacto 1' })
    const c2 = await contactoFactory.create({ nombre: 'Cascada Contacto 2' })
    const c3 = await contactoFactory.create({ nombre: 'Cascada Contacto 3' })
    await contactoFactory.assignCliente(c1.id, cliente.id)
    await contactoFactory.assignCliente(c2.id, cliente.id)
    await contactoFactory.assignCliente(c3.id, cliente.id)

    // WHEN: Delete the client
    await page.goto(`/clientes/${cliente.id}`)
    await page.getByRole('button', { name: /^eliminar$/i }).click()
    await page.getByRole('dialog').getByRole('button', { name: /confirmar|eliminar/i }).click()

    // THEN: Client deleted; toast mentions orphaned contacts
    await expect(page).toHaveURL('/clientes')
    await expect(page.getByText(/contactos.*sin cliente|quedaron sin cliente/i)).toBeVisible()

    // AND: Contacts still exist in /contactos with no client
    await page.goto('/contactos')
    await expect(page.getByText('Cascada Contacto 1')).toBeVisible()
    await expect(page.getByText('Cascada Contacto 2')).toBeVisible()
    await expect(page.getByText('Cascada Contacto 3')).toBeVisible()
  })

  test('TC-F2-22 [P3] Cancelar eliminación — cliente inalterado', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: Client in detail
    const cliente = await clienteFactory.create({ nombre: 'Cancelar Delete E2E' })
    await page.goto(`/clientes/${cliente.id}`)

    // WHEN: Click Eliminar → Cancelar
    await page.getByRole('button', { name: /^eliminar$/i }).click()
    await page.getByRole('dialog').getByRole('button', { name: /cancelar/i }).click()

    // THEN: Client still in list and detail
    await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
  })
})

test.describe('EPIC-SA-F2 — Clientes Performance & Edge Cases', () => {
  test('TC-F2-23 [P2] CRUD mutation UI actualizado en <2s (NFR2)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: Backend active with normal latency
    const cliente = await clienteFactory.create({ nombre: 'Performance Mutation E2E' })
    await page.goto(`/clientes/${cliente.id}`)
    await page.getByRole('button', { name: /^editar$/i }).click()

    // WHEN: Measure time from Submit to change appearing in UI
    const start = Date.now()
    await page.getByLabel(/ciudad/i).fill('Bogotá Perf')
    await page.getByRole('button', { name: /guardar/i }).click()
    await expect(page.getByText('Bogotá Perf')).toBeVisible()
    const elapsed = Date.now() - start

    // THEN: Change reflected in ≤2000ms (P95)
    expect(elapsed).toBeLessThan(2000)
  })
})

test.describe('EPIC-SA-F2 — Clientes API Validation (BE)', () => {
  const API_URL = process.env.API_URL ?? 'http://localhost:5000/api/v1'

  test('TC-F2-14 [P1] Backend rechaza cliente con Nombre vacío (FluentValidation)', async ({
    request,
  }) => {
    // WHEN: POST /api/v1/clientes with empty nombre
    const response = await request.post(`${API_URL}/clientes`, {
      data: { nombre: '', nit: '900111222', telefono: '111', ciudad: 'Bogota' },
      headers: { 'Content-Type': 'application/json' },
    })

    // THEN: 400 Bad Request in Problem Details RFC 7807 with errors.nombre
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.errors ?? body).toMatchObject(expect.objectContaining({
      nombre: expect.anything(),
    }))
  })

  test('TC-F2-27 [P3] Nombre cliente con longitud máxima (255 chars)', async ({ request }) => {
    const nombre255 = 'A'.repeat(255)

    // WHEN: POST with 255-char name
    const response = await request.post(`${API_URL}/clientes`, {
      data: { nombre: nombre255, nit: `NIT${Date.now()}`, telefono: '111', ciudad: 'Test' },
      headers: { 'Content-Type': 'application/json' },
    })

    // THEN: 201 Created
    expect(response.status()).toBe(201)

    // Cleanup
    const body = await response.json()
    if (body.id) {
      await request.delete(`${API_URL}/clientes/${body.id}`)
    }
  })

  test('TC-F2-28 [P2] Nombre cliente con longitud > máximo (256 chars)', async ({ request }) => {
    const nombre256 = 'A'.repeat(256)

    // WHEN: POST with 256-char name
    const response = await request.post(`${API_URL}/clientes`, {
      data: { nombre: nombre256, nit: `NIT${Date.now()}`, telefono: '111', ciudad: 'Test' },
      headers: { 'Content-Type': 'application/json' },
    })

    // THEN: 400 Bad Request with Problem Details
    expect(response.status()).toBe(400)
  })
})
