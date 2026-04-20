import { test, expect } from '../support/fixtures'

test.describe('EPIC-SA-F1 — App Shell & Navigation', () => {
  test('TC-F1-01 [P3] NavigationRail visible en viewport desktop', async ({ page }) => {
    // GIVEN: App loaded with viewport >= 1024px (default Desktop Chrome)
    await page.setViewportSize({ width: 1280, height: 720 })

    // WHEN: App opens at root
    await page.goto('/')

    // THEN: NavigationRail is visible with "Clientes" and "Contactos" entries
    const navRail = page.locator('[data-testid="navigation-rail"]')
    await expect(navRail).toBeVisible()
    await expect(navRail.getByText(/clientes/i)).toBeVisible()
    await expect(navRail.getByText(/contactos/i)).toBeVisible()
  })

  test('TC-F1-02 [P3] NavigationBar visible en viewport móvil (375px)', async ({ page }) => {
    // GIVEN: App loaded with mobile viewport 375px
    await page.setViewportSize({ width: 375, height: 667 })

    // WHEN: Navigate to root
    await page.goto('/')

    // THEN: NavigationBar (mobile) is visible; NavigationRail is NOT visible
    await expect(page.locator('[data-testid="navigation-bar"]')).toBeVisible()
    await expect(page.locator('[data-testid="navigation-rail"]')).not.toBeVisible()
  })

  test('TC-F1-03 [P2] Navegación a /clientes sin page reload (FR28)', async ({ page }) => {
    // GIVEN: App loaded at root
    await page.goto('/')

    // WHEN: Click "Clientes" in the nav — listen for beforeunload (SPA should NOT fire it)
    let reloaded = false
    page.on('load', () => { reloaded = true })

    await page.getByRole('link', { name: /clientes/i }).first().click()

    // THEN: URL changes to /clientes and view renders without a page reload
    await expect(page).toHaveURL('/clientes')
    expect(reloaded).toBe(false)
  })

  test('TC-F1-04 [P2] Deep link directo a /clientes (FR30)', async ({ page }) => {
    // GIVEN: Frontend server active
    // WHEN: Navigate directly to /clientes via URL
    await page.goto('/clientes')

    // THEN: Clientes view renders correctly without redirect to /
    await expect(page).toHaveURL('/clientes')
    await expect(page.getByRole('heading', { name: /clientes/i })).toBeVisible()
  })

  test('TC-F1-05 [P2] Deep link directo a /contactos (FR30)', async ({ page }) => {
    // GIVEN: Frontend server active
    // WHEN: Navigate directly to /contactos
    await page.goto('/contactos')

    // THEN: Contactos view renders correctly without redirect
    await expect(page).toHaveURL('/contactos')
    await expect(page.getByRole('heading', { name: /contactos/i })).toBeVisible()
  })

  test('TC-F1-06 [P3] Ruta desconocida muestra 404 gracefully', async ({ page }) => {
    // GIVEN: App loaded
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    // WHEN: Navigate to an unknown route
    await page.goto('/ruta-inexistente')

    // THEN: 404 view shown; no JS errors; NavigationRail still accessible
    await expect(page.getByText(/404|no encontrado|not found/i)).toBeVisible()
    expect(consoleErrors.filter((e) => !e.includes('favicon'))).toHaveLength(0)
  })

  test('TC-F1-07 [P2] Breakpoint exacto 1024px — NavigationRail activo', async ({ page }) => {
    // GIVEN: Viewport at exactly 1024px
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto('/')

    // THEN: NavigationRail visible at 1024px
    await expect(page.locator('[data-testid="navigation-rail"]')).toBeVisible()

    // WHEN: Reduce to 1023px
    await page.setViewportSize({ width: 1023, height: 768 })

    // THEN: NavigationBar visible; NavigationRail NOT visible
    await expect(page.locator('[data-testid="navigation-bar"]')).toBeVisible()
    await expect(page.locator('[data-testid="navigation-rail"]')).not.toBeVisible()
  })

  test('TC-F1-08 [P2] Navegación rápida entre rutas 10x seguidas', async ({ page }) => {
    // GIVEN: App loaded with data in both views
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    await page.goto('/')

    // WHEN: Click alternating between Clientes and Contactos 10 times quickly
    const navLinks = [
      () => page.getByRole('link', { name: /clientes/i }).first().click(),
      () => page.getByRole('link', { name: /contactos/i }).first().click(),
    ]
    for (let i = 0; i < 10; i++) {
      await navLinks[i % 2]()
    }

    // THEN: No JS errors, no blank page, view rendered correctly
    expect(consoleErrors.filter((e) => !e.includes('favicon'))).toHaveLength(0)
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('TC-F1-09 [P3] URL con trailing slash /clientes/ no genera 404', async ({ page }) => {
    // GIVEN: App loaded
    // WHEN: Navigate to /clientes/ (with trailing slash)
    const response = await page.goto('/clientes/')

    // THEN: Clientes view rendered or clean redirect to /clientes; no 404
    await expect(page.getByRole('heading', { name: /clientes/i })).toBeVisible()
    expect(response?.status()).not.toBe(404)
  })

  test('TC-F1-10 [P2] F5 refresh en ruta profunda /clientes/:id', async ({
    page,
    clienteFactory,
  }) => {
    // GIVEN: A client exists; user is on the client detail page
    const cliente = await clienteFactory.create({ nombre: 'Cliente F5 Refresh E2E' })
    await page.goto(`/clientes/${cliente.id}`)
    await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()

    // WHEN: Hard refresh (F5)
    await page.reload()

    // THEN: Client detail reloads correctly; no 404 from server
    await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
  })
})
