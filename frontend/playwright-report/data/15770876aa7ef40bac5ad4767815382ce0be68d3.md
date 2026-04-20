# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: asociacion.spec.ts >> EPIC-SA-F4 — Association API Validation (BE) >> TC-F4-18 [P1] PUT /contactos/{id}/cliente con clienteId UUID inválido → 400
- Location: tests\e2e\asociacion.spec.ts:702:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 500
```

# Test source

```ts
  616 |     await page.goto(`/clientes/${empresaB.id}`)
  617 |     await page.getByRole('button', { name: /asociar contacto/i }).click()
  618 |     await expect(page.getByText(/seleccionar contacto/i)).toBeVisible()
  619 |     await page.getByRole('button', { name: contacto.nombre }).click()
  620 | 
  621 |     // THEN: Implicit reassignment; contact in Empresa B; disappears from Empresa A
  622 |     await expect(page.getByText(contacto.nombre)).toBeVisible()
  623 |     await page.goto(`/clientes/${empresaA.id}`)
  624 |     await expect(page.getByText(contacto.nombre)).not.toBeVisible()
  625 |   })
  626 | 
  627 |   test('TC-F4-22 [P0] Concurrencia: 2 usuarios reasignan el mismo contacto simultáneamente', async ({
  628 |     request,
  629 |     clienteFactory,
  630 |     contactoFactory,
  631 |   }) => {
  632 |     // GIVEN: Contact assigned to Empresa A
  633 |     const API_URL = process.env.API_URL ?? 'http://localhost:5000/api/v1'
  634 |     const empresaA = await clienteFactory.create({ nombre: 'Empresa A Concurrente F4' })
  635 |     const empresaB = await clienteFactory.create({ nombre: 'Empresa B Concurrente F4' })
  636 |     const empresaC = await clienteFactory.create({ nombre: 'Empresa C Concurrente F4' })
  637 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Concurrente F4' })
  638 |     await contactoFactory.assignCliente(contacto.id, empresaA.id)
  639 | 
  640 |     // WHEN: User A and User B send PUT simultaneously
  641 |     const [res1, res2] = await Promise.all([
  642 |       request.put(`${API_URL}/contactos/${contacto.id}/cliente`, {
  643 |         data: { clienteId: empresaB.id },
  644 |         headers: { 'Content-Type': 'application/json' },
  645 |       }),
  646 |       request.put(`${API_URL}/contactos/${contacto.id}/cliente`, {
  647 |         data: { clienteId: empresaC.id },
  648 |         headers: { 'Content-Type': 'application/json' },
  649 |       }),
  650 |     ])
  651 | 
  652 |     // THEN: Last-write-wins; no 500; no data corruption
  653 |     expect([res1.status(), res2.status()]).not.toContain(500)
  654 | 
  655 |     // AND: Final state is consistent (contacto belongs to exactly one client)
  656 |     const final = await request.get(`${API_URL}/contactos/${contacto.id}`)
  657 |     const body = await final.json()
  658 |     expect([empresaB.id, empresaC.id]).toContain(body.clienteId)
  659 |   })
  660 | 
  661 |   test('TC-F4-24 [P2] Cliente eliminado mientras otro usuario lo visualiza — error manejado', async ({
  662 |     page,
  663 |     clienteFactory,
  664 |     contactoFactory,
  665 |   }) => {
  666 |     // GIVEN: User A viewing active client; simulate User B deletes it via route interception
  667 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Eliminado Concurrente F4' })
  668 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Eliminado Concurrente F4' })
  669 |     await contactoFactory.assignCliente(contacto.id, cliente.id)
  670 | 
  671 |     await page.goto(`/clientes/${cliente.id}`)
  672 |     await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
  673 | 
  674 |     // Simulate concurrent deletion
  675 |     await page.route(`**/api/v1/clientes/${cliente.id}`, (route) => {
  676 |       if (route.request().method() === 'GET') {
  677 |         route.fulfill({ status: 404, body: JSON.stringify({ title: 'Not Found' }) })
  678 |       } else {
  679 |         route.continue()
  680 |       }
  681 |     })
  682 |     await page.route(`**/api/v1/contactos**`, (route) => {
  683 |       if (route.request().url().includes(`clienteId=${cliente.id}`)) {
  684 |         route.fulfill({ status: 404, body: JSON.stringify({ title: 'Not Found' }) })
  685 |       } else {
  686 |         route.continue()
  687 |       }
  688 |     })
  689 | 
  690 |     // WHEN: User A reloads / tries ContactManager
  691 |     await page.reload()
  692 | 
  693 |     // THEN: Handled error shown (ErrorPanel or 404 message); no crash; no stack trace (NFR6)
  694 |     await expect(page.getByText(/no encontrado|not found|error|404/i)).toBeVisible()
  695 |     await expect(page.getByText(/stack|exception|System\./i)).not.toBeVisible()
  696 |   })
  697 | })
  698 | 
  699 | test.describe('EPIC-SA-F4 — Association API Validation (BE)', () => {
  700 |   const API_URL = process.env.API_URL ?? 'http://localhost:5000/api/v1'
  701 | 
  702 |   test('TC-F4-18 [P1] PUT /contactos/{id}/cliente con clienteId UUID inválido → 400', async ({
  703 |     request,
  704 |     contactoFactory,
  705 |   }) => {
  706 |     // GIVEN: Valid contacto
  707 |     const contacto = await contactoFactory.create({ nombre: 'Contacto UUID Inválido F4' })
  708 | 
  709 |     // WHEN: PUT with invalid UUID format
  710 |     const response = await request.put(`${API_URL}/contactos/${contacto.id}/cliente`, {
  711 |       data: { clienteId: 'no-es-uuid' },
  712 |       headers: { 'Content-Type': 'application/json' },
  713 |     })
  714 | 
  715 |     // THEN: 400 Bad Request Problem Details; no 500; no data corruption
> 716 |     expect(response.status()).toBe(400)
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  717 |     await expect(response.status()).not.toBe(500)
  718 |     const body = await response.json()
  719 |     expect(body.errors ?? body).toMatchObject(
  720 |       expect.objectContaining({ clienteId: expect.anything() })
  721 |     )
  722 |   })
  723 | 
  724 |   test('TC-F4-19 [P2] PUT /contactos/{id}/cliente con contactoId inexistente → 404', async ({
  725 |     request,
  726 |     clienteFactory,
  727 |   }) => {
  728 |     // GIVEN: Valid clienteId but non-existent contactoId
  729 |     const cliente = await clienteFactory.create({ nombre: 'Cliente para 404 F4' })
  730 | 
  731 |     // WHEN: PUT with a non-existent contacto UUID
  732 |     const response = await request.put(
  733 |       `${API_URL}/contactos/00000000-0000-0000-0000-000000000000/cliente`,
  734 |       {
  735 |         data: { clienteId: cliente.id },
  736 |         headers: { 'Content-Type': 'application/json' },
  737 |       }
  738 |     )
  739 | 
  740 |     // THEN: 404 Not Found Problem Details
  741 |     expect(response.status()).toBe(404)
  742 |   })
  743 | })
  744 | 
```