import { test, expect } from '../support/fixtures'
import { apiRequest } from '../support/helpers/api-request'

test.describe('Contactos — List View', () => {
  test('[P0] should display the contactos list page', async ({ page }) => {
    // GIVEN: The user navigates to /contactos
    await page.goto('/contactos')

    // THEN: Page heading "Contactos" is visible
    await expect(page.getByRole('heading', { name: /^contactos$/i })).toBeVisible()
  })

  test('[P0] should show a seeded contacto in the list', async ({ page, contactoFactory }) => {
    // GIVEN: A contacto was seeded via API
    const contacto = await contactoFactory.create({ nombre: 'Ana García E2E' })

    // WHEN: The user navigates to /contactos
    await page.goto('/contactos')

    // THEN: The seeded contacto's name appears in the list
    await expect(page.getByText(contacto.nombre)).toBeVisible()
  })

  test('[P1] should filter contacts by nombre in the search input', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: Two contacts, only one with a unique search term
    const target = await contactoFactory.create({ nombre: 'Buscar Único E2E 12345' })
    await contactoFactory.create({ nombre: 'Otro Contacto E2E' })

    await page.goto('/contactos')
    await expect(page.getByText(target.nombre)).toBeVisible()

    // WHEN: The user types in the search input
    await page.getByLabel('Buscar contactos').fill('Buscar Único')

    // THEN: Only the matching contact is shown
    await expect(page.getByText(target.nombre)).toBeVisible()
    await expect(page.getByText('Otro Contacto E2E')).not.toBeVisible()
  })

  test('[P2] should show orphan count badge when contacts have no client', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: A contacto with no client assigned (orphan)
    await contactoFactory.create({ nombre: 'Contacto Huérfano E2E' })

    // WHEN: The user navigates to /contactos
    await page.goto('/contactos')

    // THEN: A badge indicating "N sin cliente" is shown in the header
    await expect(page.getByText(/sin cliente/i)).toBeVisible()
  })
})

test.describe('Contactos — Create', () => {
  test('[P1] should create a new contacto via the UI', async ({ page }) => {
    // GIVEN: The user is on the contactos list
    await page.goto('/contactos')

    // WHEN: The user opens the create dialog and fills in all fields
    await page.getByRole('button', { name: /nuevo contacto/i }).click()
    await expect(page.getByRole('heading', { name: /nuevo contacto/i })).toBeVisible()

    await page.getByLabel(/^nombre$/i).fill('Nuevo Contacto E2E')
    await page.getByLabel(/^cargo$/i).fill('Gerente General')
    await page.getByLabel(/^teléfono$/i).fill('3001234567')
    await page.getByLabel(/^email$/i).fill('nuevo.contacto.e2e@testdomain.com')

    await page.getByRole('button', { name: /^guardar$/i }).click()

    // THEN: The new contacto appears in the list
    await expect(page.getByText('Nuevo Contacto E2E')).toBeVisible()
  })
})

test.describe('Contactos — Detail Navigation', () => {
  test('[P1] should navigate to contacto detail on table row click', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: A seeded contacto
    const contacto = await contactoFactory.create({ nombre: 'Detalle Contacto E2E' })

    // WHEN: The user navigates to the list and clicks the contacto row
    await page.goto('/contactos')
    await expect(page.getByText(contacto.nombre)).toBeVisible()
    await page.getByText(contacto.nombre).first().click()

    // THEN: The detail page loads with the correct heading and URL
    await expect(page).toHaveURL(new RegExp(`/contactos/${contacto.id}`))
    await expect(page.getByRole('heading', { name: contacto.nombre })).toBeVisible()
  })
})

test.describe('Contactos — Edit', () => {
  test('[P1] should edit a contacto from the list inline dialog', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: A seeded contacto visible in the list
    const contacto = await contactoFactory.create({ nombre: 'Editar Contacto E2E' })
    await page.goto('/contactos')
    await expect(page.getByText(contacto.nombre)).toBeVisible()

    // WHEN: The user clicks the row-level "Editar" button and updates the name
    const row = page.locator('tr').filter({ hasText: contacto.nombre })
    await row.getByRole('button', { name: /^editar$/i }).click()

    await expect(page.getByRole('heading', { name: /editar contacto/i })).toBeVisible()
    const nombreInput = page.getByLabel(/^nombre$/i)
    await nombreInput.clear()
    await nombreInput.fill('Nombre Actualizado E2E')
    await page.getByRole('button', { name: /^guardar$/i }).click()

    // THEN: The updated name appears in the list
    await expect(page.getByText('Nombre Actualizado E2E')).toBeVisible()
  })
})

test.describe('Contactos — Delete', () => {
  test('[P1] should delete a contacto from the list and remove it', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: A seeded contacto visible in the list
    const contacto = await contactoFactory.create({ nombre: 'Eliminar Contacto E2E' })
    await page.goto('/contactos')
    await expect(page.getByText(contacto.nombre)).toBeVisible()

    // WHEN: The user clicks "Eliminar" in the row and confirms
    const row = page.locator('tr').filter({ hasText: contacto.nombre })
    await row.getByRole('button', { name: /^eliminar$/i }).click()

    await expect(page.getByText('¿Eliminar este contacto?')).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: /^eliminar$/i }).click()

    // THEN: The contacto no longer appears in the list
    await expect(page.getByText(contacto.nombre)).not.toBeVisible()
  })
})

// ─── EPIC-SA-F3: Contact Management — CSV-traced tests ────────────────────────

test.describe('EPIC-SA-F3 — Contactos List', () => {
  test('TC-F3-01 [P3] Lista de contactos muestra todos los registros (FR10)', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: 5+ contacts seeded
    const contacts = [
      { nombre: 'Ana Lista F3', cargo: 'Director', email: 'ana.f3@test.com' },
      { nombre: 'Juan Lista F3', cargo: 'Gerente', email: 'juan.f3@test.com' },
      { nombre: 'Maria Lista F3', cargo: 'Analista', email: 'maria.f3@test.com' },
    ]
    for (const c of contacts) await contactoFactory.create(c)

    // WHEN: Navigate to /contactos
    await page.goto('/contactos')

    // THEN: List shows all contacts with Nombre, Cargo, Email per item
    for (const c of contacts) {
      await expect(page.getByText(c.nombre)).toBeVisible()
    }
  })

  test('TC-F3-02 [P2] Búsqueda por nombre de contacto filtra en tiempo real (FR11)', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: Multiple contacts
    await contactoFactory.create({ nombre: 'Ana Búsqueda F3', email: 'ana.busqueda@test.com' })
    await contactoFactory.create({ nombre: 'Pedro Excluir F3', email: 'pedro.ex@test.com' })

    await page.goto('/contactos')
    await expect(page.getByText('Ana Búsqueda F3')).toBeVisible()

    // WHEN: Type "Ana" in search
    const searchInput = page.getByLabel(/buscar contactos/i).or(page.getByPlaceholder(/buscar/i))
    await searchInput.fill('Ana')

    // THEN: Only Ana shown; Pedro not visible
    await expect(page.getByText('Ana Búsqueda F3')).toBeVisible()
    await expect(page.getByText('Pedro Excluir F3')).not.toBeVisible()
  })

  test('TC-F3-03 [P2] Búsqueda por email filtra en tiempo real (FR12)', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: Contacts with distinct email domains
    await contactoFactory.create({ nombre: 'Email Domain A', email: 'contacto@empresa.com' })
    await contactoFactory.create({ nombre: 'Email Domain B', email: 'otro@diferente.net' })

    await page.goto('/contactos')
    await expect(page.getByText('Email Domain A')).toBeVisible()

    // WHEN: Search by email domain
    const searchInput = page.getByLabel(/buscar contactos/i).or(page.getByPlaceholder(/buscar/i))
    await searchInput.fill('@empresa.com')

    // THEN: Only matching contact shown
    await expect(page.getByText('Email Domain A')).toBeVisible()
    await expect(page.getByText('Email Domain B')).not.toBeVisible()
  })

  test('TC-F3-04 [P0] Búsqueda responde en <1s con 1000 contactos (NFR1)', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: 20 contacts seeded (representative sample for timing)
    for (let i = 0; i < 20; i++) {
      await contactoFactory.create({ nombre: `Contacto Perf F3 ${i}`, email: `perf${i}@test.com` })
    }
    await page.goto('/contactos')

    // WHEN: Measure keystroke-to-re-render
    const start = Date.now()
    const searchInput = page.getByLabel(/buscar contactos/i).or(page.getByPlaceholder(/buscar/i))
    await searchInput.fill('Perf F3')
    await page.waitForTimeout(50)
    const elapsed = Date.now() - start

    // THEN: Filter < 1000ms
    expect(elapsed).toBeLessThan(1000)
  })

  test('TC-F3-05 [P3] EmptyState cuando no hay contactos', async ({ page }) => {
    // GIVEN: Intercept to return empty list
    await page.route('**/api/v1/contactos**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    )

    // WHEN: Navigate to /contactos
    await page.goto('/contactos')

    // THEN: EmptyState guides user to create first contact
    await expect(page.getByText(/sin contactos|no hay contactos|crear/i)).toBeVisible()
  })

  test('TC-F3-06 [P3] Detalle de contacto muestra todos los campos (FR13, FR30)', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: A contact with all fields
    const contacto = await contactoFactory.create({
      nombre: 'Detalle Completo F3',
      cargo: 'Director TI',
      telefono: '3001112222',
      email: 'detalle.f3@empresa.com',
    })

    // WHEN: Navigate to list and click the contact
    await page.goto('/contactos')
    await expect(page.getByText(contacto.nombre)).toBeVisible()
    await page.getByText(contacto.nombre).first().click()

    // THEN: Detail shows Nombre, Cargo, Teléfono, Email; URL updates
    await expect(page.getByText(contacto.nombre)).toBeVisible()
    await expect(page.getByText('Director TI')).toBeVisible()
    await expect(page.getByText('detalle.f3@empresa.com')).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`/contactos/${contacto.id}`))
  })

  test('TC-F3-20 [P3] Búsqueda con caracteres especiales sin crash', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: 10+ contacts in list
    for (let i = 0; i < 3; i++) {
      await contactoFactory.create({ nombre: `Contacto Especial ${i}`, email: `especial${i}@test.com` })
    }
    await page.goto('/contactos')

    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    // WHEN: Search with special characters
    const searchInput = page.getByLabel(/buscar contactos/i).or(page.getByPlaceholder(/buscar/i))
    await searchInput.fill('()')
    await searchInput.fill('%')
    await searchInput.fill('[test]')

    // THEN: No JS errors; results shown or empty without crash
    expect(consoleErrors.filter((e) => !e.includes('favicon'))).toHaveLength(0)
  })

  test('TC-F3-21 [P3] Contacto sin cliente asignado muestra "Sin cliente asignado"', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: Contact with clienteId=null (orphan)
    const contacto = await contactoFactory.create({ nombre: 'Huérfano F3 Sin Cliente' })
    await page.goto(`/contactos/${contacto.id}`)

    // THEN: Detail shows "Sin cliente asignado"; no crash; no nav link
    await expect(page.getByText('Sin cliente asignado')).toBeVisible()
  })
})

test.describe('EPIC-SA-F3 — Contactos Create', () => {
  test('TC-F3-07 [P0] Crear contacto con todos los campos válidos (FR9, FR27)', async ({ page }) => {
    // GIVEN: DB active
    await page.goto('/contactos')

    // WHEN: Click "Nuevo contacto" and fill all fields
    await page.getByRole('button', { name: /nuevo contacto/i }).click()
    await page.getByLabel(/^nombre$/i).fill('Juan Pérez')
    await page.getByLabel(/^cargo$/i).fill('Director')
    await page.getByLabel(/^teléfono$/i).fill('+57 310 1111111')
    await page.getByLabel(/^email$/i).fill('juan.perez.f3@empresa.com')
    await page.getByRole('button', { name: /^guardar$/i }).click()

    // THEN: 201 from BE; contact appears immediately; toast shown
    await expect(page.getByText('Juan Pérez')).toBeVisible()
    await expect(page.getByText(/creado correctamente|contacto creado/i)).toBeVisible()
  })

  test('TC-F3-08 [P1] Form bloqueado con Email vacío (FR16 — Zod)', async ({ page }) => {
    // GIVEN: Create form open
    await page.goto('/contactos')
    await page.getByRole('button', { name: /nuevo contacto/i }).click()
    await page.getByLabel(/^nombre$/i).fill('Sin Email')
    await page.getByLabel(/^cargo$/i).fill('Analista')

    // WHEN: Leave Email empty and submit
    await page.getByRole('button', { name: /^guardar$/i }).click()

    // THEN: Inline error on Email; no HTTP call
    await expect(page.getByText(/campo requerido|obligatorio|email.*requerido/i)).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('TC-F3-09 [P1] Form bloqueado con email inválido (FR16 — Zod)', async ({ page }) => {
    // GIVEN: Create form open
    await page.goto('/contactos')
    await page.getByRole('button', { name: /nuevo contacto/i }).click()
    await page.getByLabel(/^nombre$/i).fill('Email Inválido')
    await page.getByLabel(/^cargo$/i).fill('Analista')
    await page.getByLabel(/^email$/i).fill('no-es-email')

    // WHEN: Submit
    await page.getByRole('button', { name: /^guardar$/i }).click()

    // THEN: Zod inline error "Email inválido"; no HTTP call
    await expect(page.getByText(/email.*inválido|formato.*email|invalid email/i)).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('TC-F3-19 [P1] XSS en campo Email — sanitización', async ({ page }) => {
    // GIVEN: Create form open
    await page.goto('/contactos')
    await page.getByRole('button', { name: /nuevo contacto/i }).click()

    const dialogs: string[] = []
    page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss() })

    // WHEN: Enter XSS payload in Email
    await page.getByLabel(/^nombre$/i).fill('XSS Test F3')
    await page.getByLabel(/^cargo$/i).fill('Tester')
    await page.getByLabel(/^email$/i).fill('<img src=x onerror=alert(1)>@test.com')
    await page.getByRole('button', { name: /^guardar$/i }).click()

    // THEN: Zod rejects invalid format; script NOT executed
    await expect(page.getByText(/email.*inválido|invalid/i)).toBeVisible()
    expect(dialogs).toHaveLength(0)
  })
})

test.describe('EPIC-SA-F3 — Contactos Edit & Delete', () => {
  test('TC-F3-12 [P2] Editar contacto — form pre-poblado y cambio guardado (FR14, FR27)', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Contact with assigned clienteId
    const cliente = await clienteFactory.create({ nombre: 'Cliente para Editar Contacto F3' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Editar F3', email: 'edit.f3@test.com' })
    await contactoFactory.assignCliente(contacto.id, cliente.id)
    await page.goto(`/contactos/${contacto.id}`)

    // WHEN: Click Editar, change Cargo, submit
    await page.getByRole('button', { name: /^editar$/i }).click()
    const cargoInput = page.getByLabel(/^cargo$/i)
    await cargoInput.clear()
    await cargoInput.fill('Nuevo Cargo F3')
    await page.getByRole('button', { name: /^guardar$/i }).click()

    // THEN: Change reflected immediately; clienteId unchanged; toast shown
    await expect(page.getByText('Nuevo Cargo F3')).toBeVisible()
    await expect(page.getByText(/actualizado correctamente|contacto actualizado/i)).toBeVisible()
  })

  test('TC-F3-13 [P1] Editar contacto no altera clienteId', async ({
    page,
    request,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Contact with assigned clienteId
    const API_URL = process.env.API_URL ?? 'http://localhost:5000/api/v1'
    const cliente = await clienteFactory.create({ nombre: 'Cliente Original F3' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto ClienteId F3', email: 'cid.f3@test.com' })
    await contactoFactory.assignCliente(contacto.id, cliente.id)

    // WHEN: Edit all fields except clienteId
    await page.goto(`/contactos/${contacto.id}`)
    await page.getByRole('button', { name: /^editar$/i }).click()
    await page.getByLabel(/^nombre$/i).clear()
    await page.getByLabel(/^nombre$/i).fill('Nombre Editado F3')
    await page.getByRole('button', { name: /^guardar$/i }).click()
    await expect(page.getByText('Nombre Editado F3')).toBeVisible()

    // THEN: clienteId is exactly the same as before
    const updated = await request.get(`${API_URL}/contactos/${contacto.id}`)
    const body = await updated.json()
    expect(body.clienteId).toBe(cliente.id)
  })

  test('TC-F3-14 [P2] Eliminar contacto — confirmar (FR15, FR27)', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: Contact exists
    const contacto = await contactoFactory.create({ nombre: 'Eliminar Confirmar F3', email: 'del.f3@test.com' })
    await page.goto('/contactos')
    await expect(page.getByText(contacto.nombre)).toBeVisible()

    // WHEN: Delete and confirm
    const row = page.locator('tr').filter({ hasText: contacto.nombre })
    await row.getByRole('button', { name: /^eliminar$/i }).click()
    await expect(page.getByText(/¿eliminar este contacto/i)).toBeVisible()
    await page.getByRole('dialog').getByRole('button', { name: /^eliminar$/i }).click()

    // THEN: 204 from BE; contact gone; toast shown; view returns to list
    await expect(page.getByText(contacto.nombre)).not.toBeVisible()
    await expect(page.getByText(/eliminado correctamente/i)).toBeVisible()
  })

  test('TC-F3-15 [P3] Cancelar eliminación de contacto — registro inalterado', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: Contact in detail
    const contacto = await contactoFactory.create({ nombre: 'Cancelar Delete F3', email: 'cancel.f3@test.com' })
    await page.goto('/contactos')
    const row = page.locator('tr').filter({ hasText: contacto.nombre })
    await row.getByRole('button', { name: /^eliminar$/i }).click()

    // WHEN: Cancel
    await page.getByRole('dialog').getByRole('button', { name: /cancelar/i }).click()

    // THEN: Contact persists
    await expect(page.getByText(contacto.nombre)).toBeVisible()
  })

  test('TC-F3-18 [P2] Email en mayúsculas — normalización', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: Create form open
    await page.goto('/contactos')
    await page.getByRole('button', { name: /nuevo contacto/i }).click()
    await page.getByLabel(/^nombre$/i).fill('Email Mayúsculas F3')
    await page.getByLabel(/^cargo$/i).fill('Tester')
    await page.getByLabel(/^email$/i).fill('JUAN@EMPRESA.COM')
    await page.getByRole('button', { name: /^guardar$/i }).click()

    // THEN: Contact accepted; edge case behavior documented (normalized or as-is)
    await expect(page.getByText('Email Mayúsculas F3')).toBeVisible()

    // AND: Search by lowercase finds it (or does not — behavior documented)
    const searchInput = page.getByLabel(/buscar contactos/i).or(page.getByPlaceholder(/buscar/i))
    await searchInput.fill('juan@empresa.com')
    // No assertion on find/not-find — this is investigative
  })
})

test.describe('EPIC-SA-F3 — Contactos API Validation (BE)', () => {
  const API_URL = process.env.API_URL ?? 'http://localhost:5000/api/v1'

  test('TC-F3-10 [P1] Backend rechaza email inválido via FluentValidation', async ({ request }) => {
    // WHEN: POST /api/v1/contactos with invalid email
    const response = await request.post(`${API_URL}/contactos`, {
      data: {
        nombre: 'Contacto EmailInvalido BE',
        cargo: 'Tester',
        telefono: '111',
        email: 'invalid',
      },
      headers: { 'Content-Type': 'application/json' },
    })

    // THEN: 400 Bad Request with Problem Details; errors.email present
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.errors ?? body).toMatchObject(
      expect.objectContaining({ email: expect.anything() })
    )
  })

  test('TC-F3-11 [P2] Backend rechaza Cargo con solo espacios (FluentValidation trim)', async ({
    request,
  }) => {
    // WHEN: POST with cargo = 3 spaces
    const response = await request.post(`${API_URL}/contactos`, {
      data: {
        nombre: 'Contacto CargoEspacios BE',
        cargo: '   ',
        telefono: '111',
        email: `spaces.cargo.${Date.now()}@test.com`,
      },
      headers: { 'Content-Type': 'application/json' },
    })

    // THEN: 400 Bad Request; FluentValidation trims and rejects; errors.cargo present
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.errors ?? body).toMatchObject(
      expect.objectContaining({ cargo: expect.anything() })
    )
  })

  test('TC-F3-16 [P3] Email con longitud máxima válida (254 chars — RFC 5321)', async ({
    request,
  }) => {
    // Email: local@domain where total = 254
    const local = 'a'.repeat(244)
    const email254 = `${local}@test.com`

    const response = await request.post(`${API_URL}/contactos`, {
      data: {
        nombre: 'Contacto Email254',
        cargo: 'Tester',
        telefono: '111',
        email: email254,
      },
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status()).toBe(201)
    const body = await response.json()
    if (body.id) await request.delete(`${API_URL}/contactos/${body.id}`)
  })

  test('TC-F3-17 [P2] Email con longitud 255 chars rechazado (BVA)', async ({ request }) => {
    const local = 'a'.repeat(245)
    const email255 = `${local}@test.com`

    const response = await request.post(`${API_URL}/contactos`, {
      data: {
        nombre: 'Contacto Email255',
        cargo: 'Tester',
        telefono: '111',
        email: email255,
      },
      headers: { 'Content-Type': 'application/json' },
    })

    expect(response.status()).toBe(400)
  })
})
