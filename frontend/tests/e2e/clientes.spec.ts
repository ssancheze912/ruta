import { test, expect } from '../support/fixtures'

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
  test('should create a new cliente via the UI', async ({ page, clienteFactory: _ }) => {
    await page.goto('/clientes')

    // Open create dialog (adjust selector to actual data-testid)
    await page.getByRole('button', { name: /nuevo cliente/i }).click()

    // Fill form fields
    await page.getByLabel(/nombre/i).fill('Empresa UI E2E')
    await page.getByLabel(/nit/i).fill('123456789')
    await page.getByLabel(/teléfono/i).fill('3001234567')
    await page.getByLabel(/ciudad/i).fill('Bogotá')

    // Submit
    await page.getByRole('button', { name: /guardar/i }).click()

    // Assert success
    await expect(page.getByText('Empresa UI E2E')).toBeVisible()
  })
})
