# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: asociacion.spec.ts >> EPIC-SA-F4 — Reassign & Edge Cases >> TC-F4-21 [P0] Asociar contacto ya asignado a otro cliente — reasignación implícita
- Location: tests\e2e\asociacion.spec.ts:604:3

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Contacto Implicita F4' })

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
        - heading "Empresa B Implicita F4" [level=1] [ref=e34]
        - generic [ref=e35]:
          - button "Editar" [ref=e36]:
            - generic [ref=e37]: Editar
          - button "Eliminar" [ref=e38]:
            - generic [ref=e39]: Eliminar
          - button "Volver" [ref=e40]:
            - generic [ref=e41]: Volver
      - generic [ref=e42]:
        - paragraph [ref=e44]: Nombre
        - paragraph [ref=e46]: Empresa B Implicita F4
      - generic [ref=e47]:
        - paragraph [ref=e49]: NIT/RUC
        - paragraph [ref=e51]: "636418114"
      - generic [ref=e52]:
        - paragraph [ref=e54]: Teléfono
        - paragraph [ref=e56]: (341) 851-2127
      - generic [ref=e57]:
        - paragraph [ref=e59]: Ciudad
        - paragraph [ref=e61]: Hialeah
      - generic [ref=e62]:
        - heading "Contactos asociados" [level=2] [ref=e63]
        - generic [ref=e64]:
          - generic [ref=e65]:
            - button "Asociar contacto" [active] [ref=e66]:
              - generic [ref=e67]: Asociar contacto
            - generic [ref=e69]:
              - heading "Seleccionar contacto a asociar" [level=3] [ref=e70]
              - list [ref=e71]:
                - listitem [ref=e72]:
                  - button "Juan PérezDirector" [ref=e73]:
                    - generic [ref=e74]: Juan PérezDirector
                - listitem [ref=e75]:
                  - button "Contacto Email255Tester" [ref=e76]:
                    - generic [ref=e77]: Contacto Email255Tester
                - listitem [ref=e78]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e79]:
                    - generic [ref=e80]: Nuevo Contacto E2EGerente General
                - listitem [ref=e81]:
                  - button "Contacto Email255Tester" [ref=e82]:
                    - generic [ref=e83]: Contacto Email255Tester
                - listitem [ref=e84]:
                  - button "Juan PérezDirector" [ref=e85]:
                    - generic [ref=e86]: Juan PérezDirector
                - listitem [ref=e87]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e88]:
                    - generic [ref=e89]: Nuevo Contacto E2EGerente General
                - listitem [ref=e90]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e91]:
                    - generic [ref=e92]: Nuevo Contacto E2EGerente General
                - listitem [ref=e93]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e94]:
                    - generic [ref=e95]: Nuevo Contacto E2EGerente General
                - listitem [ref=e96]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e97]:
                    - generic [ref=e98]: Nuevo Contacto E2EGerente General
                - listitem [ref=e99]:
                  - button "Contacto Email255Tester" [ref=e100]:
                    - generic [ref=e101]: Contacto Email255Tester
                - listitem [ref=e102]:
                  - button "Contacto Email255Tester" [ref=e103]:
                    - generic [ref=e104]: Contacto Email255Tester
                - listitem [ref=e105]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e106]:
                    - generic [ref=e107]: Nuevo Contacto E2EGerente General
                - listitem [ref=e108]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e109]:
                    - generic [ref=e110]: Nuevo Contacto E2EGerente General
                - listitem [ref=e111]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e112]:
                    - generic [ref=e113]: Nuevo Contacto E2EGerente General
                - listitem [ref=e114]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e115]:
                    - generic [ref=e116]: Nuevo Contacto E2EGerente General
                - listitem [ref=e117]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e118]:
                    - generic [ref=e119]: Nuevo Contacto E2EGerente General
                - listitem [ref=e120]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e121]:
                    - generic [ref=e122]: Nuevo Contacto E2EGerente General
                - listitem [ref=e123]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e124]:
                    - generic [ref=e125]: Nuevo Contacto E2EGerente General
                - listitem [ref=e126]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e127]:
                    - generic [ref=e128]: Nuevo Contacto E2EGerente General
                - listitem [ref=e129]:
                  - button "testDirector" [ref=e130]:
                    - generic [ref=e131]: testDirector
                - listitem [ref=e132]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e133]:
                    - generic [ref=e134]: Nuevo Contacto E2EGerente General
                - listitem [ref=e135]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e136]:
                    - generic [ref=e137]: Nuevo Contacto E2EGerente General
                - listitem [ref=e138]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e139]:
                    - generic [ref=e140]: Nuevo Contacto E2EGerente General
                - listitem [ref=e141]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e142]:
                    - generic [ref=e143]: Nuevo Contacto E2EGerente General
                - listitem [ref=e144]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e145]:
                    - generic [ref=e146]: Nuevo Contacto E2EGerente General
                - listitem [ref=e147]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e148]:
                    - generic [ref=e149]: Nuevo Contacto E2EGerente General
                - listitem [ref=e150]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e151]:
                    - generic [ref=e152]: Nuevo Contacto E2EGerente General
                - listitem [ref=e153]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e154]:
                    - generic [ref=e155]: Nuevo Contacto E2EGerente General
                - listitem [ref=e156]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e157]:
                    - generic [ref=e158]: Nuevo Contacto E2EGerente General
                - listitem [ref=e159]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e160]:
                    - generic [ref=e161]: Nuevo Contacto E2EGerente General
                - listitem [ref=e162]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e163]:
                    - generic [ref=e164]: Nuevo Contacto E2EGerente General
                - listitem [ref=e165]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e166]:
                    - generic [ref=e167]: Nuevo Contacto E2EGerente General
                - listitem [ref=e168]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e169]:
                    - generic [ref=e170]: Nuevo Contacto E2EGerente General
                - listitem [ref=e171]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e172]:
                    - generic [ref=e173]: Nuevo Contacto E2EGerente General
                - listitem [ref=e174]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e175]:
                    - generic [ref=e176]: Nuevo Contacto E2EGerente General
                - listitem [ref=e177]:
                  - button "Juan PérezDirector" [ref=e178]:
                    - generic [ref=e179]: Juan PérezDirector
                - listitem [ref=e180]:
                  - button "Nuevo Contacto E2EGerente General" [ref=e181]:
                    - generic [ref=e182]: Nuevo Contacto E2EGerente General
                - listitem [ref=e183]:
                  - button "Juan PérezDirector" [ref=e184]:
                    - generic [ref=e185]: Juan PérezDirector
              - button "Cancelar" [ref=e187]:
                - generic [ref=e188]: Cancelar
          - paragraph [ref=e189]: Sin contactos asociados aún.
```

# Test source

```ts
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
  597 |     await page.getByLabel(/seleccionar cliente destino/i).selectOption({ label: empresaA.nombre })
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
> 619 |     await page.getByRole('button', { name: contacto.nombre }).click()
      |                                                               ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
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
  716 |     expect(response.status()).toBe(400)
  717 |     await expect(response.status()).not.toBe(500)
  718 |     const body = await response.json()
  719 |     expect(body.errors ?? body).toMatchObject(
```