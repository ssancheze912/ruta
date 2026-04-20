import { test, expect } from '../support/fixtures'
import { apiRequest } from '../support/helpers/api-request'

/**
 * E2E tests for Epic 4 — Client-Contact Association (Asociación Cliente-Contacto)
 *
 * Covers: viewing contacts in client detail, bidirectional navigation, associate,
 * disassociate, and reassign flows. All tests seed data via API factories and
 * clean up automatically on teardown.
 */

test.describe('Asociación — Client Detail shows associated contacts', () => {
  test('[P0] should show "Contactos asociados" section in client detail', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: A client with no contacts
    const cliente = await clienteFactory.create({ nombre: 'Cliente Sin Contactos E2E' })

    // WHEN: The user opens the client detail
    await page.goto(`/clientes/${cliente.id}`)

    // THEN: The "Contactos asociados" section heading is visible
    await expect(page.getByRole('heading', { name: /contactos asociados/i })).toBeVisible()
  })

  test('[P1] should show empty state when client has no contacts', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: A client with no associated contacts
    const cliente = await clienteFactory.create({ nombre: 'Cliente Vacío E2E' })

    // WHEN: The user opens the client detail
    await page.goto(`/clientes/${cliente.id}`)

    // THEN: The empty state message is shown
    await expect(page.getByText(/sin contactos asociados/i)).toBeVisible()
  })

  test('[P0] should display a contact that is associated with the client', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: A client with one associated contact
    const cliente = await clienteFactory.create({ nombre: 'Cliente Con Contacto E2E' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Asociado E2E' })
    await contactoFactory.assignCliente(contacto.id, cliente.id)

    // WHEN: The user opens the client detail
    await page.goto(`/clientes/${cliente.id}`)

    // THEN: The associated contact's name appears in the section
    await expect(page.getByText(contacto.nombre)).toBeVisible()
  })
})

test.describe('Asociación — Forward navigation (client → contact)', () => {
  test('[P0] should navigate to contact detail from client detail in ≤2 clicks (NFR8)', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: A client with one associated contact
    const cliente = await clienteFactory.create({ nombre: 'Cliente Navegar E2E' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Navegar E2E' })
    await contactoFactory.assignCliente(contacto.id, cliente.id)

    // WHEN: The user is in the client detail and clicks the contact row (1 click from client)
    await page.goto(`/clientes/${cliente.id}`)
    await expect(page.getByText(contacto.nombre)).toBeVisible()
    await page.getByText(contacto.nombre).first().click()

    // THEN: The contact detail page loads (≤2 clicks from client record → 1 click = NFR8 satisfied)
    await expect(page).toHaveURL(new RegExp(`/contactos/${contacto.id}`))
    await expect(page.getByRole('heading', { name: contacto.nombre })).toBeVisible()
  })
})

test.describe('Asociación — Back navigation (contact → client)', () => {
  test('[P1] should navigate to client detail by clicking client name link in contact detail (FR24)', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: A contact associated with a client
    const cliente = await clienteFactory.create({ nombre: 'Cliente Link E2E' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Link E2E' })
    await contactoFactory.assignCliente(contacto.id, cliente.id)

    // WHEN: The user opens the contact detail and clicks the client name link
    await page.goto(`/contactos/${contacto.id}`)
    await expect(page.getByRole('button', { name: cliente.nombre })).toBeVisible()
    await page.getByRole('button', { name: cliente.nombre }).click()

    // THEN: The client detail page loads
    await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
    await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
  })

  test('[P1] should show "Sin cliente asignado" for a contact with no client', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: A contact with no client assigned (orphan)
    const contacto = await contactoFactory.create({ nombre: 'Contacto Huérfano Link E2E' })

    // WHEN: The user opens the contact detail
    await page.goto(`/contactos/${contacto.id}`)

    // THEN: "Sin cliente asignado" is displayed in the cliente field (FR23)
    await expect(page.getByText('Sin cliente asignado')).toBeVisible()
  })
})

test.describe('Asociación — Associate contact', () => {
  test('[P1] should associate an orphan contact to a client via "Asociar contacto"', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: A client with no contacts and an orphan contact
    const cliente = await clienteFactory.create({ nombre: 'Cliente Asociar E2E' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Para Asociar E2E' })

    // WHEN: The user opens the client detail, opens the selector and picks the contact
    await page.goto(`/clientes/${cliente.id}`)
    await page.getByRole('button', { name: /asociar contacto/i }).click()
    await expect(page.getByText(/seleccionar contacto a asociar/i)).toBeVisible()
    await page.getByRole('button', { name: contacto.nombre }).click()

    // THEN: The contact appears in the AssociatedContactsSection immediately (FR27)
    await expect(page.getByText(contacto.nombre)).toBeVisible()
  })
})

test.describe('Asociación — Disassociate contact', () => {
  test('[P2] should disassociate a contact from client without deleting either record', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: A client with one associated contact
    const cliente = await clienteFactory.create({ nombre: 'Cliente Desasociar E2E' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Desasociar E2E' })
    await contactoFactory.assignCliente(contacto.id, cliente.id)

    // WHEN: The user opens the client detail and clicks "Desasociar"
    await page.goto(`/clientes/${cliente.id}`)
    await expect(page.getByText(contacto.nombre)).toBeVisible()
    await page.getByRole('button', { name: /desasociar/i }).click()

    // THEN: The contact is removed from the section immediately (FR20, FR27)
    await expect(page.getByText(contacto.nombre)).not.toBeVisible()
    await expect(page.getByText(/sin contactos asociados/i)).toBeVisible()

    // AND: The contact still exists in /contactos (not deleted)
    await page.goto('/contactos')
    await expect(page.getByText(contacto.nombre)).toBeVisible()
  })
})

test.describe('Asociación — Reassign contact', () => {
  test('[P2] should reassign a contact to a different client (FR26, FR27)', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Two clients and one contact assigned to the first client
    const clienteA = await clienteFactory.create({ nombre: 'Cliente A Reasignar E2E' })
    const clienteB = await clienteFactory.create({ nombre: 'Cliente B Reasignar E2E' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Reasignar E2E' })
    await contactoFactory.assignCliente(contacto.id, clienteA.id)

    // WHEN: The user opens the contact detail and initiates reassignment
    await page.goto(`/contactos/${contacto.id}`)
    await page.getByRole('button', { name: /reasignar cliente/i }).click()
    await expect(page.getByRole('heading', { name: /reasignar a otro cliente/i })).toBeVisible()

    // Select the new client from the dropdown
    await page.getByLabel('Seleccionar cliente destino').selectOption({ label: clienteB.nombre })
    await page.getByRole('button', { name: /^guardar$/i }).click()

    // THEN: The contact now shows the new client's name
    await expect(page.getByRole('button', { name: clienteB.nombre })).toBeVisible()

    // AND: The new client's AssociatedContactsSection shows the contact (FR27)
    await page.goto(`/clientes/${clienteB.id}`)
    await expect(page.getByText(contacto.nombre)).toBeVisible()
  })
})

// ─── EPIC-SA-F4: Association & Data Quality — CSV-traced tests ────────────────

test.describe('EPIC-SA-F4 — ContactManager', () => {
  test('TC-F4-01 [P2] ContactManager muestra contactos del cliente (FR21)', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Client with 3 associated contacts
    const cliente = await clienteFactory.create({ nombre: 'Cliente 3 Contactos F4' })
    const c1 = await contactoFactory.create({ nombre: 'CM Contacto A F4' })
    const c2 = await contactoFactory.create({ nombre: 'CM Contacto B F4' })
    const c3 = await contactoFactory.create({ nombre: 'CM Contacto C F4' })
    await contactoFactory.assignCliente(c1.id, cliente.id)
    await contactoFactory.assignCliente(c2.id, cliente.id)
    await contactoFactory.assignCliente(c3.id, cliente.id)

    // WHEN: Navigate to /clientes/:clienteId
    await page.goto(`/clientes/${cliente.id}`)

    // THEN: ContactManager renders all 3 contacts
    await expect(page.getByText('CM Contacto A F4')).toBeVisible()
    await expect(page.getByText('CM Contacto B F4')).toBeVisible()
    await expect(page.getByText('CM Contacto C F4')).toBeVisible()
  })

  test('TC-F4-02 [P3] ContactManager EmptyState cuando cliente sin contactos', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: Client with no contacts
    const cliente = await clienteFactory.create({ nombre: 'Cliente Vacío CM F4' })

    // WHEN: View client detail
    await page.goto(`/clientes/${cliente.id}`)

    // THEN: Empty state shown
    await expect(page.getByText(/no hay contactos asociados|sin contactos/i)).toBeVisible()
  })

  test('TC-F4-03 [P2] ContactManager ErrorPanel cuando BE falla', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: Client exists; contacts fetch returns 500
    const cliente = await clienteFactory.create({ nombre: 'Cliente Error CM F4' })
    await page.route(`**/api/v1/contactos**`, (route) =>
      route.fulfill({ status: 500, body: 'error' })
    )

    // WHEN: View client detail
    await page.goto(`/clientes/${cliente.id}`)

    // THEN: ErrorPanel with retry option visible in ContactManager
    await expect(page.getByRole('button', { name: /reintentar/i })).toBeVisible()
  })

  test('TC-F4-04 [P0] CRÍTICO: Asociar contacto + cache invalidation', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Contact without client; active client
    const cliente = await clienteFactory.create({ nombre: 'Cliente Asociar Cache F4' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Sin Cliente F4' })

    // WHEN: Open client detail and associate the contact
    await page.goto(`/clientes/${cliente.id}`)
    await page.getByRole('button', { name: /asociar contacto/i }).click()
    await expect(page.getByText(/seleccionar contacto/i)).toBeVisible()
    await page.getByRole('button', { name: contacto.nombre }).click()

    // THEN: Contact appears in ContactManager without manual refresh
    await expect(page.getByText(contacto.nombre)).toBeVisible()
  })

  test('TC-F4-05 [P1] Crear contacto desde ContactManager → auto-asociado (FR18)', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: Active client with ContactManager open
    const cliente = await clienteFactory.create({ nombre: 'Cliente Auto-Asociar F4' })
    await page.goto(`/clientes/${cliente.id}`)

    // WHEN: Create new contact from within ContactManager
    await page.getByRole('button', { name: /nuevo contacto/i }).click()
    await page.getByLabel(/^nombre$/i).fill('Auto Asociado F4')
    await page.getByLabel(/^cargo$/i).fill('Tester')
    await page.getByLabel(/^email$/i).fill(`auto.asoc.f4.${Date.now()}@test.com`)
    await page.getByRole('button', { name: /^guardar$/i }).click()

    // THEN: Contact created with clienteId=clienteActivo; appears in ContactManager immediately
    await expect(page.getByText('Auto Asociado F4')).toBeVisible()
  })

  test('TC-F4-06 [P0] CRÍTICO: Desasociar contacto — no elimina registros (FR20)', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Contact associated with active client
    const cliente = await clienteFactory.create({ nombre: 'Cliente Desasociar F4' })
    const contacto = await contactoFactory.create({ nombre: 'Juan Pérez F4 Desasociar' })
    await contactoFactory.assignCliente(contacto.id, cliente.id)

    // WHEN: Disassociate "Juan Pérez F4" from client via ContactManager
    await page.goto(`/clientes/${cliente.id}`)
    await expect(page.getByText(contacto.nombre)).toBeVisible()
    await page.getByRole('button', { name: /desasociar/i }).click()

    // THEN: Contact disappears from ContactManager; still accessible in /contactos
    await expect(page.getByText(contacto.nombre)).not.toBeVisible()
    await page.goto('/contactos')
    await expect(page.getByText(contacto.nombre)).toBeVisible()
  })
})

test.describe('EPIC-SA-F4 — Navigation & Links', () => {
  test('TC-F4-07 [P2] Navegar de cliente a contacto en ≤2 clics (FR22, NFR8)', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Client with contacts in ContactManager
    const cliente = await clienteFactory.create({ nombre: 'Cliente Nav F4' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Nav F4' })
    await contactoFactory.assignCliente(contacto.id, cliente.id)

    // WHEN: Click contact in ContactManager (1 click)
    await page.goto(`/clientes/${cliente.id}`)
    await expect(page.getByText(contacto.nombre)).toBeVisible()
    await page.getByText(contacto.nombre).first().click()

    // THEN: Navigates to /contactos/:id in exactly 1 click (NFR8 ≤2 satisfied)
    await expect(page).toHaveURL(new RegExp(`/contactos/${contacto.id}`))
    await expect(page.getByRole('heading', { name: contacto.nombre })).toBeVisible()
  })

  test('TC-F4-08 [P2] Botón atrás regresa al detalle del cliente', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: User navigated from client to contact via ContactManager
    const cliente = await clienteFactory.create({ nombre: 'Cliente Back F4' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Back F4' })
    await contactoFactory.assignCliente(contacto.id, cliente.id)
    await page.goto(`/clientes/${cliente.id}`)
    await page.getByText(contacto.nombre).first().click()
    await expect(page).toHaveURL(new RegExp(`/contactos/${contacto.id}`))

    // WHEN: Press browser back button
    await page.goBack()

    // THEN: Returns to /clientes/:clienteId without context loss
    await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
    await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
  })

  test('TC-F4-09 [P2] Detalle de contacto muestra cliente asociado sin búsqueda (FR23, NFR9)', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Contact with assigned clienteId
    const cliente = await clienteFactory.create({ nombre: 'Cliente Visible F4' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Cliente Visible F4' })
    await contactoFactory.assignCliente(contacto.id, cliente.id)

    // WHEN: Navigate to contact detail
    await page.goto(`/contactos/${contacto.id}`)

    // THEN: Associated client name visible directly; no additional search required
    await expect(page.getByText(cliente.nombre)).toBeVisible()
  })

  test('TC-F4-10 [P3] Clic en nombre del cliente navega a su detalle (FR24)', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Contact detail with client visible
    const cliente = await clienteFactory.create({ nombre: 'Cliente Clic F4' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Clic F4' })
    await contactoFactory.assignCliente(contacto.id, cliente.id)

    await page.goto(`/contactos/${contacto.id}`)
    await expect(page.getByRole('button', { name: cliente.nombre })).toBeVisible()

    // WHEN: Click the client name
    await page.getByRole('button', { name: cliente.nombre }).click()

    // THEN: Navigates to /clientes/:clienteId; correct client detail shown
    await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
    await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
  })

  test('TC-F4-11 [P3] Contacto huérfano muestra "Sin cliente asignado" en detalle', async ({
    page,
    contactoFactory,
  }) => {
    // GIVEN: Contact with clienteId=null
    const contacto = await contactoFactory.create({ nombre: 'Huérfano F4 Detalle' })
    await page.goto(`/contactos/${contacto.id}`)

    // THEN: Shows "Sin cliente asignado"; no crash; no nav link
    await expect(page.getByText('Sin cliente asignado')).toBeVisible()
  })

  test('TC-F4-23 [P2] Navegación profunda cliente→contacto×5 sin corrupción de historial', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Real data with associated clients and contacts
    const cliente = await clienteFactory.create({ nombre: 'Cliente Historia F4' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Historia F4' })
    await contactoFactory.assignCliente(contacto.id, cliente.id)

    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    // WHEN: Alternate navigation 5 times
    await page.goto(`/clientes/${cliente.id}`)
    for (let i = 0; i < 5; i++) {
      await page.getByText(contacto.nombre).first().click()
      await expect(page).toHaveURL(new RegExp(`/contactos/${contacto.id}`))
      await page.goBack()
      await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
    }

    // THEN: No errors; no redirect loops; browser history navigable
    expect(consoleErrors.filter((e) => !e.includes('favicon'))).toHaveLength(0)
  })
})

test.describe('EPIC-SA-F4 — Orphan Filter', () => {
  test('TC-F4-12 [P1] Filtro "Sin cliente" muestra solo contactos huérfanos (FR25)', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Mix of assigned and orphan contacts
    const cliente = await clienteFactory.create({ nombre: 'Cliente Filtro F4' })
    const asignado = await contactoFactory.create({ nombre: 'Asignado Filtro F4' })
    const huerfano = await contactoFactory.create({ nombre: 'Huérfano Filtro F4' })
    await contactoFactory.assignCliente(asignado.id, cliente.id)

    await page.goto('/contactos')
    await expect(page.getByText(asignado.nombre)).toBeVisible()
    await expect(page.getByText(huerfano.nombre)).toBeVisible()

    // WHEN: Activate "Sin cliente" filter
    await page.getByRole('button', { name: /sin cliente/i }).click()

    // THEN: Only orphan contacts visible; count badge visible
    await expect(page.getByText(huerfano.nombre)).toBeVisible()
    await expect(page.getByText(asignado.nombre)).not.toBeVisible()
    await expect(page.getByText(/sin cliente/i)).toBeVisible()
  })

  test('TC-F4-13 [P3] EmptyState cuando todos los contactos están asignados', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: All contacts have clienteId
    const cliente = await clienteFactory.create({ nombre: 'Cliente Todos Asignados F4' })
    const c = await contactoFactory.create({ nombre: 'Todos Asignados F4' })
    await contactoFactory.assignCliente(c.id, cliente.id)

    await page.goto('/contactos')

    // WHEN: Activate "Sin cliente" filter
    await page.getByRole('button', { name: /sin cliente/i }).click()

    // THEN: EmptyState "Todos los contactos están asignados a un cliente"
    await expect(page.getByText(/todos los contactos.*asignados|asignados a un cliente/i)).toBeVisible()
  })

  test('TC-F4-14 [P3] Desactivar filtro restaura lista completa de contactos', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: "Sin cliente" filter active
    const cliente = await clienteFactory.create({ nombre: 'Cliente Restaurar F4' })
    const asignado = await contactoFactory.create({ nombre: 'Asignado Restaurar F4' })
    await contactoFactory.assignCliente(asignado.id, cliente.id)
    await contactoFactory.create({ nombre: 'Huérfano Restaurar F4' })

    await page.goto('/contactos')
    await page.getByRole('button', { name: /sin cliente/i }).click()
    await expect(page.getByText('Asignado Restaurar F4')).not.toBeVisible()

    // WHEN: Deactivate filter
    await page.getByRole('button', { name: /sin cliente/i }).click()

    // THEN: Full list restored (assigned + orphans)
    await expect(page.getByText('Asignado Restaurar F4')).toBeVisible()
    await expect(page.getByText('Huérfano Restaurar F4')).toBeVisible()
  })

  test('TC-F4-15 [P0] CRÍTICO: Huérfanos aparecen en filtro inmediatamente post-delete', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Client with 3 contacts; "Sin cliente" filter visible
    const cliente = await clienteFactory.create({ nombre: 'Cliente Cascade Filter F4' })
    const contacts = await Promise.all([
      contactoFactory.create({ nombre: 'Cascade Filter C1 F4' }),
      contactoFactory.create({ nombre: 'Cascade Filter C2 F4' }),
      contactoFactory.create({ nombre: 'Cascade Filter C3 F4' }),
    ])
    for (const c of contacts) await contactoFactory.assignCliente(c.id, cliente.id)

    // WHEN: Delete the client
    await page.goto(`/clientes/${cliente.id}`)
    await page.getByRole('button', { name: /^eliminar$/i }).click()
    await page.getByRole('dialog').getByRole('button', { name: /confirmar|eliminar/i }).click()
    await expect(page).toHaveURL('/clientes')

    // AND: Activate "Sin cliente" filter
    await page.goto('/contactos')
    await page.getByRole('button', { name: /sin cliente/i }).click()

    // THEN: The 3 orphaned contacts appear immediately (FR27)
    for (const c of contacts) {
      await expect(page.getByText(c.nombre)).toBeVisible()
    }
  })
})

test.describe('EPIC-SA-F4 — Reassign & Edge Cases', () => {
  test('TC-F4-16 [P0] CRÍTICO: Reasignar contacto — 3 query keys invalidadas (FR26, FR27)', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Contact assigned to Empresa A; user at /contactos/:id
    const empresaA = await clienteFactory.create({ nombre: 'Empresa A Reasignar F4' })
    const empresaB = await clienteFactory.create({ nombre: 'Empresa B Reasignar F4' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Reasignar F4' })
    await contactoFactory.assignCliente(contacto.id, empresaA.id)

    await page.goto(`/contactos/${contacto.id}`)

    // WHEN: Reassign to Empresa B
    await page.getByRole('button', { name: /reasignar cliente/i }).click()
    await expect(page.getByRole('heading', { name: /reasignar a otro cliente/i })).toBeVisible()
    await page.getByLabel(/seleccionar cliente destino/i).selectOption({ label: empresaB.nombre })
    await page.getByRole('button', { name: /^guardar$/i }).click()

    // THEN: Contact now shows Empresa B; toast shown
    await expect(page.getByRole('button', { name: empresaB.nombre })).toBeVisible()
    await expect(page.getByText(/reasignado correctamente/i)).toBeVisible()

    // AND: Empresa B ContactManager shows the contact
    await page.goto(`/clientes/${empresaB.id}`)
    await expect(page.getByText(contacto.nombre)).toBeVisible()

    // AND: Empresa A ContactManager no longer shows the contact
    await page.goto(`/clientes/${empresaA.id}`)
    await expect(page.getByText(contacto.nombre)).not.toBeVisible()
  })

  test('TC-F4-17 [P3] Cancelar reasignación — asociación sin cambios', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Contact with assigned client
    const cliente = await clienteFactory.create({ nombre: 'Cliente Cancelar Reasignar F4' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Cancelar Reasignar F4' })
    await contactoFactory.assignCliente(contacto.id, cliente.id)

    await page.goto(`/contactos/${contacto.id}`)
    await page.getByRole('button', { name: /reasignar cliente/i }).click()

    // WHEN: Cancel reassignment
    await page.getByRole('button', { name: /cancelar/i }).click()

    // THEN: No PUT sent; original association intact
    await expect(page.getByRole('button', { name: cliente.nombre })).toBeVisible()
  })

  test('TC-F4-20 [P2] Reasignar contacto al mismo cliente (no-op)', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Contact assigned to Empresa A
    const empresaA = await clienteFactory.create({ nombre: 'Empresa A No-Op F4' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto No-Op F4' })
    await contactoFactory.assignCliente(contacto.id, empresaA.id)

    await page.goto(`/contactos/${contacto.id}`)

    // WHEN: Reassign to the same Empresa A
    await page.getByRole('button', { name: /reasignar cliente/i }).click()
    await page.getByLabel(/seleccionar cliente destino/i).selectOption({ label: empresaA.nombre })
    await page.getByRole('button', { name: /^guardar$/i }).click()

    // THEN: No error; contact still in Empresa A; PUT idempotent
    await expect(page.getByRole('button', { name: empresaA.nombre })).toBeVisible()
  })

  test('TC-F4-21 [P0] Asociar contacto ya asignado a otro cliente — reasignación implícita', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Contact with clienteId=EmpresaA; user in ContactManager of EmpresaB
    const empresaA = await clienteFactory.create({ nombre: 'Empresa A Implicita F4' })
    const empresaB = await clienteFactory.create({ nombre: 'Empresa B Implicita F4' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Implicita F4' })
    await contactoFactory.assignCliente(contacto.id, empresaA.id)

    // WHEN: From Empresa B ContactManager, select the contact (already in A)
    await page.goto(`/clientes/${empresaB.id}`)
    await page.getByRole('button', { name: /asociar contacto/i }).click()
    await expect(page.getByText(/seleccionar contacto/i)).toBeVisible()
    await page.getByRole('button', { name: contacto.nombre }).click()

    // THEN: Implicit reassignment; contact in Empresa B; disappears from Empresa A
    await expect(page.getByText(contacto.nombre)).toBeVisible()
    await page.goto(`/clientes/${empresaA.id}`)
    await expect(page.getByText(contacto.nombre)).not.toBeVisible()
  })

  test('TC-F4-22 [P0] Concurrencia: 2 usuarios reasignan el mismo contacto simultáneamente', async ({
    request,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: Contact assigned to Empresa A
    const API_URL = process.env.API_URL ?? 'http://localhost:5000/api/v1'
    const empresaA = await clienteFactory.create({ nombre: 'Empresa A Concurrente F4' })
    const empresaB = await clienteFactory.create({ nombre: 'Empresa B Concurrente F4' })
    const empresaC = await clienteFactory.create({ nombre: 'Empresa C Concurrente F4' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Concurrente F4' })
    await contactoFactory.assignCliente(contacto.id, empresaA.id)

    // WHEN: User A and User B send PUT simultaneously
    const [res1, res2] = await Promise.all([
      request.put(`${API_URL}/contactos/${contacto.id}/cliente`, {
        data: { clienteId: empresaB.id },
        headers: { 'Content-Type': 'application/json' },
      }),
      request.put(`${API_URL}/contactos/${contacto.id}/cliente`, {
        data: { clienteId: empresaC.id },
        headers: { 'Content-Type': 'application/json' },
      }),
    ])

    // THEN: Last-write-wins; no 500; no data corruption
    expect([res1.status(), res2.status()]).not.toContain(500)

    // AND: Final state is consistent (contacto belongs to exactly one client)
    const final = await request.get(`${API_URL}/contactos/${contacto.id}`)
    const body = await final.json()
    expect([empresaB.id, empresaC.id]).toContain(body.clienteId)
  })

  test('TC-F4-24 [P2] Cliente eliminado mientras otro usuario lo visualiza — error manejado', async ({
    page,
    clienteFactory,
    contactoFactory,
  }) => {
    // GIVEN: User A viewing active client; simulate User B deletes it via route interception
    const cliente = await clienteFactory.create({ nombre: 'Cliente Eliminado Concurrente F4' })
    const contacto = await contactoFactory.create({ nombre: 'Contacto Eliminado Concurrente F4' })
    await contactoFactory.assignCliente(contacto.id, cliente.id)

    await page.goto(`/clientes/${cliente.id}`)
    await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()

    // Simulate concurrent deletion
    await page.route(`**/api/v1/clientes/${cliente.id}`, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 404, body: JSON.stringify({ title: 'Not Found' }) })
      } else {
        route.continue()
      }
    })
    await page.route(`**/api/v1/contactos**`, (route) => {
      if (route.request().url().includes(`clienteId=${cliente.id}`)) {
        route.fulfill({ status: 404, body: JSON.stringify({ title: 'Not Found' }) })
      } else {
        route.continue()
      }
    })

    // WHEN: User A reloads / tries ContactManager
    await page.reload()

    // THEN: Handled error shown (ErrorPanel or 404 message); no crash; no stack trace (NFR6)
    await expect(page.getByText(/no encontrado|not found|error|404/i)).toBeVisible()
    await expect(page.getByText(/stack|exception|System\./i)).not.toBeVisible()
  })
})

test.describe('EPIC-SA-F4 — Association API Validation (BE)', () => {
  const API_URL = process.env.API_URL ?? 'http://localhost:5000/api/v1'

  test('TC-F4-18 [P1] PUT /contactos/{id}/cliente con clienteId UUID inválido → 400', async ({
    request,
    contactoFactory,
  }) => {
    // GIVEN: Valid contacto
    const contacto = await contactoFactory.create({ nombre: 'Contacto UUID Inválido F4' })

    // WHEN: PUT with invalid UUID format
    const response = await request.put(`${API_URL}/contactos/${contacto.id}/cliente`, {
      data: { clienteId: 'no-es-uuid' },
      headers: { 'Content-Type': 'application/json' },
    })

    // THEN: 400 Bad Request Problem Details; no 500; no data corruption
    expect(response.status()).toBe(400)
    await expect(response.status()).not.toBe(500)
    const body = await response.json()
    expect(body.errors ?? body).toMatchObject(
      expect.objectContaining({ clienteId: expect.anything() })
    )
  })

  test('TC-F4-19 [P2] PUT /contactos/{id}/cliente con contactoId inexistente → 404', async ({
    request,
    clienteFactory,
  }) => {
    // GIVEN: Valid clienteId but non-existent contactoId
    const cliente = await clienteFactory.create({ nombre: 'Cliente para 404 F4' })

    // WHEN: PUT with a non-existent contacto UUID
    const response = await request.put(
      `${API_URL}/contactos/00000000-0000-0000-0000-000000000000/cliente`,
      {
        data: { clienteId: cliente.id },
        headers: { 'Content-Type': 'application/json' },
      }
    )

    // THEN: 404 Not Found Problem Details
    expect(response.status()).toBe(404)
  })
})
