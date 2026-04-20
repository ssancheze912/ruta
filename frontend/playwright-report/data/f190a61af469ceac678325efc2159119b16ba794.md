# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: asociacion.spec.ts >> EPIC-SA-F4 — Reassign & Edge Cases >> TC-F4-20 [P2] Reasignar contacto al mismo cliente (no-op)
- Location: tests\e2e\asociacion.spec.ts:583:3

# Error details

```
Error: locator.selectOption: Error: Element is not a <select> element
Call log:
  - waiting for getByLabel(/seleccionar cliente destino/i)
    - locator resolved to <button type="button" aria-expanded="false" aria-haspopup="listbox" title="Seleccionar cliente..." aria-label="Seleccionar cliente destino" class="inline-flex items-center justify-between gap-3 w-full px-3 py-2 text-sm font-normal leading-5 rounded-lg border transition-all duration-150 w-full bg-bg-primary border-border-primary text-content-primary dark:bg-dark-bg-primary dark:border-dark-border-primary dark:text-dark-content-primary hover:border-[#f9f9f9] dark:hover:border-[#3a3a3f] focus:outline-hid…>…</button>
  - attempting select option action
    - waiting for element to be visible and enabled

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
          - heading [level=1] [ref=e34]: Contacto No-Op F4
          - generic [ref=e35]:
            - button [ref=e36]:
              - generic [ref=e37]: Editar
            - button [ref=e38]:
              - generic [ref=e39]: Eliminar
            - button [ref=e40]:
              - generic [ref=e41]: Reasignar cliente
            - button [ref=e42]:
              - generic [ref=e43]: Volver
        - generic [ref=e44]:
          - generic [ref=e45]:
            - paragraph [ref=e47]: Nombre
            - paragraph [ref=e49]: Contacto No-Op F4
          - generic [ref=e50]:
            - paragraph [ref=e52]: Cargo
            - paragraph [ref=e54]: Principal Operations Representative
          - generic [ref=e55]:
            - paragraph [ref=e57]: Teléfono
            - paragraph [ref=e59]: (275) 438-2679
          - generic [ref=e60]:
            - paragraph [ref=e62]: Email
            - paragraph [ref=e64]: Carolyne.Johnston@yahoo.com
          - generic [ref=e65]:
            - paragraph [ref=e67]: Cliente
            - paragraph [ref=e69]:
              - button [ref=e70]:
                - generic [ref=e71]: Empresa A No-Op F4
  - dialog "Reasignar a otro cliente" [ref=e75]:
    - heading "Reasignar a otro cliente" [level=2] [ref=e77]
    - generic [ref=e78]:
      - button "Seleccionar cliente destino" [active] [ref=e80]:
        - generic [ref=e81]: Seleccionar cliente...
        - img [ref=e82]
      - generic [ref=e84]:
        - button "Cancelar" [ref=e85]:
          - generic [ref=e86]: Cancelar
        - button "Guardar" [disabled]:
          - generic: Guardar
    - button "Close" [ref=e87]:
      - img
      - generic [ref=e88]: Close
```

# Test source

```ts
  497 |   })
  498 | 
  499 |   test('TC-F4-15 [P0] CRÍTICO: Huérfanos aparecen en filtro inmediatamente post-delete', async ({
  500 |     page,
  501 |     clienteFactory,
  502 |     contactoFactory,
  503 |   }) => {
  504 |     // GIVEN: Client with 3 contacts; "Sin cliente" filter visible
  505 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Cascade Filter F4' })
  506 |     const contacts = await Promise.all([
  507 |       contactoFactory.create({ nombre: 'Cascade Filter C1 F4' }),
  508 |       contactoFactory.create({ nombre: 'Cascade Filter C2 F4' }),
  509 |       contactoFactory.create({ nombre: 'Cascade Filter C3 F4' }),
  510 |     ])
  511 |     for (const c of contacts) await contactoFactory.assignCliente(c.id, cliente.id)
  512 | 
  513 |     // WHEN: Delete the client
  514 |     await page.goto(`/clientes/${cliente.id}`)
  515 |     await page.getByRole('button', { name: /^eliminar$/i }).click()
  516 |     await page.getByRole('dialog').getByRole('button', { name: /confirmar|eliminar/i }).click()
  517 |     await expect(page).toHaveURL('/clientes')
  518 | 
  519 |     // AND: Activate "Sin cliente" filter
  520 |     await page.goto('/contactos')
  521 |     await page.getByRole('button', { name: /sin cliente/i }).click()
  522 | 
  523 |     // THEN: The 3 orphaned contacts appear immediately (FR27)
  524 |     for (const c of contacts) {
  525 |       await expect(page.getByText(c.nombre)).toBeVisible()
  526 |     }
  527 |   })
  528 | })
  529 | 
  530 | test.describe('EPIC-SA-F4 — Reassign & Edge Cases', () => {
  531 |   test('TC-F4-16 [P0] CRÍTICO: Reasignar contacto — 3 query keys invalidadas (FR26, FR27)', async ({
  532 |     page,
  533 |     clienteFactory,
  534 |     contactoFactory,
  535 |   }) => {
  536 |     // GIVEN: Contact assigned to Empresa A; user at /contactos/:id
  537 |     const empresaA = await clienteFactory.create({ nombre: 'Empresa A Reasignar F4' })
  538 |     const empresaB = await clienteFactory.create({ nombre: 'Empresa B Reasignar F4' })
  539 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Reasignar F4' })
  540 |     await contactoFactory.assignCliente(contacto.id, empresaA.id)
  541 | 
  542 |     await page.goto(`/contactos/${contacto.id}`)
  543 | 
  544 |     // WHEN: Reassign to Empresa B
  545 |     await page.getByRole('button', { name: /reasignar cliente/i }).click()
  546 |     await expect(page.getByRole('heading', { name: /reasignar a otro cliente/i })).toBeVisible()
  547 |     await page.getByLabel(/seleccionar cliente destino/i).selectOption({ label: empresaB.nombre })
  548 |     await page.getByRole('button', { name: /^guardar$/i }).click()
  549 | 
  550 |     // THEN: Contact now shows Empresa B; toast shown
  551 |     await expect(page.getByRole('button', { name: empresaB.nombre })).toBeVisible()
  552 |     await expect(page.getByText(/reasignado correctamente/i)).toBeVisible()
  553 | 
  554 |     // AND: Empresa B ContactManager shows the contact
  555 |     await page.goto(`/clientes/${empresaB.id}`)
  556 |     await expect(page.getByText(contacto.nombre)).toBeVisible()
  557 | 
  558 |     // AND: Empresa A ContactManager no longer shows the contact
  559 |     await page.goto(`/clientes/${empresaA.id}`)
  560 |     await expect(page.getByText(contacto.nombre)).not.toBeVisible()
  561 |   })
  562 | 
  563 |   test('TC-F4-17 [P3] Cancelar reasignación — asociación sin cambios', async ({
  564 |     page,
  565 |     clienteFactory,
  566 |     contactoFactory,
  567 |   }) => {
  568 |     // GIVEN: Contact with assigned client
  569 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Cancelar Reasignar F4' })
  570 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Cancelar Reasignar F4' })
  571 |     await contactoFactory.assignCliente(contacto.id, cliente.id)
  572 | 
  573 |     await page.goto(`/contactos/${contacto.id}`)
  574 |     await page.getByRole('button', { name: /reasignar cliente/i }).click()
  575 | 
  576 |     // WHEN: Cancel reassignment
  577 |     await page.getByRole('button', { name: /cancelar/i }).click()
  578 | 
  579 |     // THEN: No PUT sent; original association intact
  580 |     await expect(page.getByRole('button', { name: cliente.nombre })).toBeVisible()
  581 |   })
  582 | 
  583 |   test('TC-F4-20 [P2] Reasignar contacto al mismo cliente (no-op)', async ({
  584 |     page,
  585 |     clienteFactory,
  586 |     contactoFactory,
  587 |   }) => {
  588 |     // GIVEN: Contact assigned to Empresa A
  589 |     const empresaA = await clienteFactory.create({ nombre: 'Empresa A No-Op F4' })
  590 |     const contacto = await contactoFactory.create({ nombre: 'Contacto No-Op F4' })
  591 |     await contactoFactory.assignCliente(contacto.id, empresaA.id)
  592 | 
  593 |     await page.goto(`/contactos/${contacto.id}`)
  594 | 
  595 |     // WHEN: Reassign to the same Empresa A
  596 |     await page.getByRole('button', { name: /reasignar cliente/i }).click()
> 597 |     await page.getByLabel(/seleccionar cliente destino/i).selectOption({ label: empresaA.nombre })
      |                                                           ^ Error: locator.selectOption: Error: Element is not a <select> element
  598 |     await page.getByRole('button', { name: /^guardar$/i }).click()
  599 | 
  600 |     // THEN: No error; contact still in Empresa A; PUT idempotent
  601 |     await expect(page.getByRole('button', { name: empresaA.nombre })).toBeVisible()
  602 |   })
  603 | 
  604 |   test('TC-F4-21 [P0] Asociar contacto ya asignado a otro cliente — reasignación implícita', async ({
  605 |     page,
  606 |     clienteFactory,
  607 |     contactoFactory,
  608 |   }) => {
  609 |     // GIVEN: Contact with clienteId=EmpresaA; user in ContactManager of EmpresaB
  610 |     const empresaA = await clienteFactory.create({ nombre: 'Empresa A Implicita F4' })
  611 |     const empresaB = await clienteFactory.create({ nombre: 'Empresa B Implicita F4' })
  612 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Implicita F4' })
  613 |     await contactoFactory.assignCliente(contacto.id, empresaA.id)
  614 | 
  615 |     // WHEN: From Empresa B ContactManager, select the contact (already in A)
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
```