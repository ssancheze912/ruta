# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: asociacion.spec.ts >> EPIC-SA-F4 — Orphan Filter >> TC-F4-13 [P3] EmptyState cuando todos los contactos están asignados
- Location: tests\e2e\asociacion.spec.ts:457:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/todos los contactos.*asignados|asignados a un cliente/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/todos los contactos.*asignados|asignados a un cliente/i)

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
        - generic [ref=e34]:
          - heading "Contactos" [level=1] [ref=e35]
          - button "Sin cliente (38)" [active] [ref=e36]:
            - generic [ref=e37]: Sin cliente (38)
        - button "Nuevo contacto" [ref=e38]:
          - generic [ref=e39]: Nuevo contacto
      - textbox "Buscar contactos" [ref=e43]:
        - /placeholder: Buscar por nombre o email
      - generic [ref=e46]:
        - button "Nombre" [ref=e47] [cursor=pointer]:
          - generic [ref=e48]: Nombre
        - generic [ref=e52]: Cargo
        - generic [ref=e54]: Teléfono
        - generic [ref=e56]: Email
        - generic [ref=e58]: Cliente
        - generic [ref=e60]:
          - generic [ref=e62]: Juan Pérez
          - generic [ref=e64]: Director
          - generic [ref=e66]: +57 310 1111111
          - generic [ref=e68]: juan.perez.f3@empresa.com
          - generic [ref=e72]: Sin cliente
          - generic [ref=e75]:
            - button "Ver" [ref=e76]:
              - generic [ref=e77]: Ver
            - button "Editar" [ref=e78]:
              - generic [ref=e79]: Editar
            - button "Eliminar" [ref=e80]:
              - generic [ref=e81]: Eliminar
        - generic [ref=e82]:
          - generic [ref=e84]: Contacto Email255
          - generic [ref=e86]: Tester
          - generic [ref=e88]: "111"
          - generic [ref=e90]: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@test.com
          - generic [ref=e94]: Sin cliente
          - generic [ref=e97]:
            - button "Ver" [ref=e98]:
              - generic [ref=e99]: Ver
            - button "Editar" [ref=e100]:
              - generic [ref=e101]: Editar
            - button "Eliminar" [ref=e102]:
              - generic [ref=e103]: Eliminar
        - generic [ref=e104]:
          - generic [ref=e106]: Nuevo Contacto E2E
          - generic [ref=e108]: Gerente General
          - generic [ref=e110]: "3001234567"
          - generic [ref=e112]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e116]: Sin cliente
          - generic [ref=e119]:
            - button "Ver" [ref=e120]:
              - generic [ref=e121]: Ver
            - button "Editar" [ref=e122]:
              - generic [ref=e123]: Editar
            - button "Eliminar" [ref=e124]:
              - generic [ref=e125]: Eliminar
        - generic [ref=e126]:
          - generic [ref=e128]: Contacto Email255
          - generic [ref=e130]: Tester
          - generic [ref=e132]: "111"
          - generic [ref=e134]: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@test.com
          - generic [ref=e138]: Sin cliente
          - generic [ref=e141]:
            - button "Ver" [ref=e142]:
              - generic [ref=e143]: Ver
            - button "Editar" [ref=e144]:
              - generic [ref=e145]: Editar
            - button "Eliminar" [ref=e146]:
              - generic [ref=e147]: Eliminar
        - generic [ref=e148]:
          - generic [ref=e150]: Juan Pérez
          - generic [ref=e152]: Director
          - generic [ref=e154]: +57 310 1111111
          - generic [ref=e156]: juan.perez.f3@empresa.com
          - generic [ref=e160]: Sin cliente
          - generic [ref=e163]:
            - button "Ver" [ref=e164]:
              - generic [ref=e165]: Ver
            - button "Editar" [ref=e166]:
              - generic [ref=e167]: Editar
            - button "Eliminar" [ref=e168]:
              - generic [ref=e169]: Eliminar
        - generic [ref=e170]:
          - generic [ref=e172]: Nuevo Contacto E2E
          - generic [ref=e174]: Gerente General
          - generic [ref=e176]: "3001234567"
          - generic [ref=e178]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e182]: Sin cliente
          - generic [ref=e185]:
            - button "Ver" [ref=e186]:
              - generic [ref=e187]: Ver
            - button "Editar" [ref=e188]:
              - generic [ref=e189]: Editar
            - button "Eliminar" [ref=e190]:
              - generic [ref=e191]: Eliminar
        - generic [ref=e192]:
          - generic [ref=e194]: Nuevo Contacto E2E
          - generic [ref=e196]: Gerente General
          - generic [ref=e198]: "3001234567"
          - generic [ref=e200]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e204]: Sin cliente
          - generic [ref=e207]:
            - button "Ver" [ref=e208]:
              - generic [ref=e209]: Ver
            - button "Editar" [ref=e210]:
              - generic [ref=e211]: Editar
            - button "Eliminar" [ref=e212]:
              - generic [ref=e213]: Eliminar
        - generic [ref=e214]:
          - generic [ref=e216]: Nuevo Contacto E2E
          - generic [ref=e218]: Gerente General
          - generic [ref=e220]: "3001234567"
          - generic [ref=e222]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e226]: Sin cliente
          - generic [ref=e229]:
            - button "Ver" [ref=e230]:
              - generic [ref=e231]: Ver
            - button "Editar" [ref=e232]:
              - generic [ref=e233]: Editar
            - button "Eliminar" [ref=e234]:
              - generic [ref=e235]: Eliminar
        - generic [ref=e236]:
          - generic [ref=e238]: Nuevo Contacto E2E
          - generic [ref=e240]: Gerente General
          - generic [ref=e242]: "3001234567"
          - generic [ref=e244]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e248]: Sin cliente
          - generic [ref=e251]:
            - button "Ver" [ref=e252]:
              - generic [ref=e253]: Ver
            - button "Editar" [ref=e254]:
              - generic [ref=e255]: Editar
            - button "Eliminar" [ref=e256]:
              - generic [ref=e257]: Eliminar
        - generic [ref=e258]:
          - generic [ref=e260]: Contacto Email255
          - generic [ref=e262]: Tester
          - generic [ref=e264]: "111"
          - generic [ref=e266]: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@test.com
          - generic [ref=e270]: Sin cliente
          - generic [ref=e273]:
            - button "Ver" [ref=e274]:
              - generic [ref=e275]: Ver
            - button "Editar" [ref=e276]:
              - generic [ref=e277]: Editar
            - button "Eliminar" [ref=e278]:
              - generic [ref=e279]: Eliminar
        - generic [ref=e280]:
          - generic [ref=e282]: Contacto Email255
          - generic [ref=e284]: Tester
          - generic [ref=e286]: "111"
          - generic [ref=e288]: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@test.com
          - generic [ref=e292]: Sin cliente
          - generic [ref=e295]:
            - button "Ver" [ref=e296]:
              - generic [ref=e297]: Ver
            - button "Editar" [ref=e298]:
              - generic [ref=e299]: Editar
            - button "Eliminar" [ref=e300]:
              - generic [ref=e301]: Eliminar
        - generic [ref=e302]:
          - generic [ref=e304]: Nuevo Contacto E2E
          - generic [ref=e306]: Gerente General
          - generic [ref=e308]: "3001234567"
          - generic [ref=e310]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e314]: Sin cliente
          - generic [ref=e317]:
            - button "Ver" [ref=e318]:
              - generic [ref=e319]: Ver
            - button "Editar" [ref=e320]:
              - generic [ref=e321]: Editar
            - button "Eliminar" [ref=e322]:
              - generic [ref=e323]: Eliminar
        - generic [ref=e324]:
          - generic [ref=e326]: Nuevo Contacto E2E
          - generic [ref=e328]: Gerente General
          - generic [ref=e330]: "3001234567"
          - generic [ref=e332]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e336]: Sin cliente
          - generic [ref=e339]:
            - button "Ver" [ref=e340]:
              - generic [ref=e341]: Ver
            - button "Editar" [ref=e342]:
              - generic [ref=e343]: Editar
            - button "Eliminar" [ref=e344]:
              - generic [ref=e345]: Eliminar
        - generic [ref=e346]:
          - generic [ref=e348]: Nuevo Contacto E2E
          - generic [ref=e350]: Gerente General
          - generic [ref=e352]: "3001234567"
          - generic [ref=e354]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e358]: Sin cliente
          - generic [ref=e361]:
            - button "Ver" [ref=e362]:
              - generic [ref=e363]: Ver
            - button "Editar" [ref=e364]:
              - generic [ref=e365]: Editar
            - button "Eliminar" [ref=e366]:
              - generic [ref=e367]: Eliminar
        - generic [ref=e368]:
          - generic [ref=e370]: Nuevo Contacto E2E
          - generic [ref=e372]: Gerente General
          - generic [ref=e374]: "3001234567"
          - generic [ref=e376]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e380]: Sin cliente
          - generic [ref=e383]:
            - button "Ver" [ref=e384]:
              - generic [ref=e385]: Ver
            - button "Editar" [ref=e386]:
              - generic [ref=e387]: Editar
            - button "Eliminar" [ref=e388]:
              - generic [ref=e389]: Eliminar
        - generic [ref=e390]:
          - generic [ref=e392]: Nuevo Contacto E2E
          - generic [ref=e394]: Gerente General
          - generic [ref=e396]: "3001234567"
          - generic [ref=e398]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e402]: Sin cliente
          - generic [ref=e405]:
            - button "Ver" [ref=e406]:
              - generic [ref=e407]: Ver
            - button "Editar" [ref=e408]:
              - generic [ref=e409]: Editar
            - button "Eliminar" [ref=e410]:
              - generic [ref=e411]: Eliminar
        - generic [ref=e412]:
          - generic [ref=e414]: Nuevo Contacto E2E
          - generic [ref=e416]: Gerente General
          - generic [ref=e418]: "3001234567"
          - generic [ref=e420]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e424]: Sin cliente
          - generic [ref=e427]:
            - button "Ver" [ref=e428]:
              - generic [ref=e429]: Ver
            - button "Editar" [ref=e430]:
              - generic [ref=e431]: Editar
            - button "Eliminar" [ref=e432]:
              - generic [ref=e433]: Eliminar
        - generic [ref=e434]:
          - generic [ref=e436]: Nuevo Contacto E2E
          - generic [ref=e438]: Gerente General
          - generic [ref=e440]: "3001234567"
          - generic [ref=e442]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e446]: Sin cliente
          - generic [ref=e449]:
            - button "Ver" [ref=e450]:
              - generic [ref=e451]: Ver
            - button "Editar" [ref=e452]:
              - generic [ref=e453]: Editar
            - button "Eliminar" [ref=e454]:
              - generic [ref=e455]: Eliminar
        - generic [ref=e456]:
          - generic [ref=e458]: Nuevo Contacto E2E
          - generic [ref=e460]: Gerente General
          - generic [ref=e462]: "3001234567"
          - generic [ref=e464]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e468]: Sin cliente
          - generic [ref=e471]:
            - button "Ver" [ref=e472]:
              - generic [ref=e473]: Ver
            - button "Editar" [ref=e474]:
              - generic [ref=e475]: Editar
            - button "Eliminar" [ref=e476]:
              - generic [ref=e477]: Eliminar
        - generic [ref=e478]:
          - generic [ref=e480]: test
          - generic [ref=e482]: Director
          - generic [ref=e484]: "3186287645"
          - generic [ref=e486]: santiago.esqssssuivel@correounivalle.edu.co
          - generic [ref=e490]: Sin cliente
          - generic [ref=e493]:
            - button "Ver" [ref=e494]:
              - generic [ref=e495]: Ver
            - button "Editar" [ref=e496]:
              - generic [ref=e497]: Editar
            - button "Eliminar" [ref=e498]:
              - generic [ref=e499]: Eliminar
        - generic [ref=e500]:
          - generic [ref=e502]: Nuevo Contacto E2E
          - generic [ref=e504]: Gerente General
          - generic [ref=e506]: "3001234567"
          - generic [ref=e508]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e512]: Sin cliente
          - generic [ref=e515]:
            - button "Ver" [ref=e516]:
              - generic [ref=e517]: Ver
            - button "Editar" [ref=e518]:
              - generic [ref=e519]: Editar
            - button "Eliminar" [ref=e520]:
              - generic [ref=e521]: Eliminar
        - generic [ref=e522]:
          - generic [ref=e524]: Nuevo Contacto E2E
          - generic [ref=e526]: Gerente General
          - generic [ref=e528]: "3001234567"
          - generic [ref=e530]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e534]: Sin cliente
          - generic [ref=e537]:
            - button "Ver" [ref=e538]:
              - generic [ref=e539]: Ver
            - button "Editar" [ref=e540]:
              - generic [ref=e541]: Editar
            - button "Eliminar" [ref=e542]:
              - generic [ref=e543]: Eliminar
        - generic [ref=e544]:
          - generic [ref=e546]: Nuevo Contacto E2E
          - generic [ref=e548]: Gerente General
          - generic [ref=e550]: "3001234567"
          - generic [ref=e552]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e556]: Sin cliente
          - generic [ref=e559]:
            - button "Ver" [ref=e560]:
              - generic [ref=e561]: Ver
            - button "Editar" [ref=e562]:
              - generic [ref=e563]: Editar
            - button "Eliminar" [ref=e564]:
              - generic [ref=e565]: Eliminar
        - generic [ref=e566]:
          - generic [ref=e568]: Nuevo Contacto E2E
          - generic [ref=e570]: Gerente General
          - generic [ref=e572]: "3001234567"
          - generic [ref=e574]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e578]: Sin cliente
          - generic [ref=e581]:
            - button "Ver" [ref=e582]:
              - generic [ref=e583]: Ver
            - button "Editar" [ref=e584]:
              - generic [ref=e585]: Editar
            - button "Eliminar" [ref=e586]:
              - generic [ref=e587]: Eliminar
        - generic [ref=e588]:
          - generic [ref=e590]: Nuevo Contacto E2E
          - generic [ref=e592]: Gerente General
          - generic [ref=e594]: "3001234567"
          - generic [ref=e596]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e600]: Sin cliente
          - generic [ref=e603]:
            - button "Ver" [ref=e604]:
              - generic [ref=e605]: Ver
            - button "Editar" [ref=e606]:
              - generic [ref=e607]: Editar
            - button "Eliminar" [ref=e608]:
              - generic [ref=e609]: Eliminar
        - generic [ref=e610]:
          - generic [ref=e612]: Nuevo Contacto E2E
          - generic [ref=e614]: Gerente General
          - generic [ref=e616]: "3001234567"
          - generic [ref=e618]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e622]: Sin cliente
          - generic [ref=e625]:
            - button "Ver" [ref=e626]:
              - generic [ref=e627]: Ver
            - button "Editar" [ref=e628]:
              - generic [ref=e629]: Editar
            - button "Eliminar" [ref=e630]:
              - generic [ref=e631]: Eliminar
        - generic [ref=e632]:
          - generic [ref=e634]: Nuevo Contacto E2E
          - generic [ref=e636]: Gerente General
          - generic [ref=e638]: "3001234567"
          - generic [ref=e640]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e644]: Sin cliente
          - generic [ref=e647]:
            - button "Ver" [ref=e648]:
              - generic [ref=e649]: Ver
            - button "Editar" [ref=e650]:
              - generic [ref=e651]: Editar
            - button "Eliminar" [ref=e652]:
              - generic [ref=e653]: Eliminar
        - generic [ref=e654]:
          - generic [ref=e656]: Nuevo Contacto E2E
          - generic [ref=e658]: Gerente General
          - generic [ref=e660]: "3001234567"
          - generic [ref=e662]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e666]: Sin cliente
          - generic [ref=e669]:
            - button "Ver" [ref=e670]:
              - generic [ref=e671]: Ver
            - button "Editar" [ref=e672]:
              - generic [ref=e673]: Editar
            - button "Eliminar" [ref=e674]:
              - generic [ref=e675]: Eliminar
        - generic [ref=e676]:
          - generic [ref=e678]: Nuevo Contacto E2E
          - generic [ref=e680]: Gerente General
          - generic [ref=e682]: "3001234567"
          - generic [ref=e684]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e688]: Sin cliente
          - generic [ref=e691]:
            - button "Ver" [ref=e692]:
              - generic [ref=e693]: Ver
            - button "Editar" [ref=e694]:
              - generic [ref=e695]: Editar
            - button "Eliminar" [ref=e696]:
              - generic [ref=e697]: Eliminar
        - generic [ref=e698]:
          - generic [ref=e700]: Nuevo Contacto E2E
          - generic [ref=e702]: Gerente General
          - generic [ref=e704]: "3001234567"
          - generic [ref=e706]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e710]: Sin cliente
          - generic [ref=e713]:
            - button "Ver" [ref=e714]:
              - generic [ref=e715]: Ver
            - button "Editar" [ref=e716]:
              - generic [ref=e717]: Editar
            - button "Eliminar" [ref=e718]:
              - generic [ref=e719]: Eliminar
        - generic [ref=e720]:
          - generic [ref=e722]: Nuevo Contacto E2E
          - generic [ref=e724]: Gerente General
          - generic [ref=e726]: "3001234567"
          - generic [ref=e728]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e732]: Sin cliente
          - generic [ref=e735]:
            - button "Ver" [ref=e736]:
              - generic [ref=e737]: Ver
            - button "Editar" [ref=e738]:
              - generic [ref=e739]: Editar
            - button "Eliminar" [ref=e740]:
              - generic [ref=e741]: Eliminar
        - generic [ref=e742]:
          - generic [ref=e744]: Nuevo Contacto E2E
          - generic [ref=e746]: Gerente General
          - generic [ref=e748]: "3001234567"
          - generic [ref=e750]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e754]: Sin cliente
          - generic [ref=e757]:
            - button "Ver" [ref=e758]:
              - generic [ref=e759]: Ver
            - button "Editar" [ref=e760]:
              - generic [ref=e761]: Editar
            - button "Eliminar" [ref=e762]:
              - generic [ref=e763]: Eliminar
        - generic [ref=e764]:
          - generic [ref=e766]: Nuevo Contacto E2E
          - generic [ref=e768]: Gerente General
          - generic [ref=e770]: "3001234567"
          - generic [ref=e772]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e776]: Sin cliente
          - generic [ref=e779]:
            - button "Ver" [ref=e780]:
              - generic [ref=e781]: Ver
            - button "Editar" [ref=e782]:
              - generic [ref=e783]: Editar
            - button "Eliminar" [ref=e784]:
              - generic [ref=e785]: Eliminar
        - generic [ref=e786]:
          - generic [ref=e788]: Nuevo Contacto E2E
          - generic [ref=e790]: Gerente General
          - generic [ref=e792]: "3001234567"
          - generic [ref=e794]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e798]: Sin cliente
          - generic [ref=e801]:
            - button "Ver" [ref=e802]:
              - generic [ref=e803]: Ver
            - button "Editar" [ref=e804]:
              - generic [ref=e805]: Editar
            - button "Eliminar" [ref=e806]:
              - generic [ref=e807]: Eliminar
        - generic [ref=e808]:
          - generic [ref=e810]: Nuevo Contacto E2E
          - generic [ref=e812]: Gerente General
          - generic [ref=e814]: "3001234567"
          - generic [ref=e816]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e820]: Sin cliente
          - generic [ref=e823]:
            - button "Ver" [ref=e824]:
              - generic [ref=e825]: Ver
            - button "Editar" [ref=e826]:
              - generic [ref=e827]: Editar
            - button "Eliminar" [ref=e828]:
              - generic [ref=e829]: Eliminar
        - generic [ref=e830]:
          - generic [ref=e832]: Juan Pérez
          - generic [ref=e834]: Director
          - generic [ref=e836]: +57 310 1111111
          - generic [ref=e838]: juan.perez.f3@empresa.com
          - generic [ref=e842]: Sin cliente
          - generic [ref=e845]:
            - button "Ver" [ref=e846]:
              - generic [ref=e847]: Ver
            - button "Editar" [ref=e848]:
              - generic [ref=e849]: Editar
            - button "Eliminar" [ref=e850]:
              - generic [ref=e851]: Eliminar
        - generic [ref=e852]:
          - generic [ref=e854]: Nuevo Contacto E2E
          - generic [ref=e856]: Gerente General
          - generic [ref=e858]: "3001234567"
          - generic [ref=e860]: nuevo.contacto.e2e@testdomain.com
          - generic [ref=e864]: Sin cliente
          - generic [ref=e867]:
            - button "Ver" [ref=e868]:
              - generic [ref=e869]: Ver
            - button "Editar" [ref=e870]:
              - generic [ref=e871]: Editar
            - button "Eliminar" [ref=e872]:
              - generic [ref=e873]: Eliminar
        - generic [ref=e874]:
          - generic [ref=e876]: Juan Pérez
          - generic [ref=e878]: Director
          - generic [ref=e880]: +57 310 1111111
          - generic [ref=e882]: juan.perez.f3@empresa.com
          - generic [ref=e886]: Sin cliente
          - generic [ref=e889]:
            - button "Ver" [ref=e890]:
              - generic [ref=e891]: Ver
            - button "Editar" [ref=e892]:
              - generic [ref=e893]: Editar
            - button "Eliminar" [ref=e894]:
              - generic [ref=e895]: Eliminar
```

# Test source

```ts
  373 |     contactoFactory,
  374 |   }) => {
  375 |     // GIVEN: Contact detail with client visible
  376 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Clic F4' })
  377 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Clic F4' })
  378 |     await contactoFactory.assignCliente(contacto.id, cliente.id)
  379 | 
  380 |     await page.goto(`/contactos/${contacto.id}`)
  381 |     await expect(page.getByRole('button', { name: cliente.nombre })).toBeVisible()
  382 | 
  383 |     // WHEN: Click the client name
  384 |     await page.getByRole('button', { name: cliente.nombre }).click()
  385 | 
  386 |     // THEN: Navigates to /clientes/:clienteId; correct client detail shown
  387 |     await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
  388 |     await expect(page.getByRole('heading', { name: cliente.nombre })).toBeVisible()
  389 |   })
  390 | 
  391 |   test('TC-F4-11 [P3] Contacto huérfano muestra "Sin cliente asignado" en detalle', async ({
  392 |     page,
  393 |     contactoFactory,
  394 |   }) => {
  395 |     // GIVEN: Contact with clienteId=null
  396 |     const contacto = await contactoFactory.create({ nombre: 'Huérfano F4 Detalle' })
  397 |     await page.goto(`/contactos/${contacto.id}`)
  398 | 
  399 |     // THEN: Shows "Sin cliente asignado"; no crash; no nav link
  400 |     await expect(page.getByText('Sin cliente asignado')).toBeVisible()
  401 |   })
  402 | 
  403 |   test('TC-F4-23 [P2] Navegación profunda cliente→contacto×5 sin corrupción de historial', async ({
  404 |     page,
  405 |     clienteFactory,
  406 |     contactoFactory,
  407 |   }) => {
  408 |     // GIVEN: Real data with associated clients and contacts
  409 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Historia F4' })
  410 |     const contacto = await contactoFactory.create({ nombre: 'Contacto Historia F4' })
  411 |     await contactoFactory.assignCliente(contacto.id, cliente.id)
  412 | 
  413 |     const consoleErrors: string[] = []
  414 |     page.on('console', (msg) => {
  415 |       if (msg.type() === 'error') consoleErrors.push(msg.text())
  416 |     })
  417 | 
  418 |     // WHEN: Alternate navigation 5 times
  419 |     await page.goto(`/clientes/${cliente.id}`)
  420 |     for (let i = 0; i < 5; i++) {
  421 |       await page.getByText(contacto.nombre).first().click()
  422 |       await expect(page).toHaveURL(new RegExp(`/contactos/${contacto.id}`))
  423 |       await page.goBack()
  424 |       await expect(page).toHaveURL(new RegExp(`/clientes/${cliente.id}`))
  425 |     }
  426 | 
  427 |     // THEN: No errors; no redirect loops; browser history navigable
  428 |     expect(consoleErrors.filter((e) => !e.includes('favicon'))).toHaveLength(0)
  429 |   })
  430 | })
  431 | 
  432 | test.describe('EPIC-SA-F4 — Orphan Filter', () => {
  433 |   test('TC-F4-12 [P1] Filtro "Sin cliente" muestra solo contactos huérfanos (FR25)', async ({
  434 |     page,
  435 |     clienteFactory,
  436 |     contactoFactory,
  437 |   }) => {
  438 |     // GIVEN: Mix of assigned and orphan contacts
  439 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Filtro F4' })
  440 |     const asignado = await contactoFactory.create({ nombre: 'Asignado Filtro F4' })
  441 |     const huerfano = await contactoFactory.create({ nombre: 'Huérfano Filtro F4' })
  442 |     await contactoFactory.assignCliente(asignado.id, cliente.id)
  443 | 
  444 |     await page.goto('/contactos')
  445 |     await expect(page.getByText(asignado.nombre)).toBeVisible()
  446 |     await expect(page.getByText(huerfano.nombre)).toBeVisible()
  447 | 
  448 |     // WHEN: Activate "Sin cliente" filter
  449 |     await page.getByRole('button', { name: /sin cliente/i }).click()
  450 | 
  451 |     // THEN: Only orphan contacts visible; count badge visible
  452 |     await expect(page.getByText(huerfano.nombre)).toBeVisible()
  453 |     await expect(page.getByText(asignado.nombre)).not.toBeVisible()
  454 |     await expect(page.getByText(/sin cliente/i)).toBeVisible()
  455 |   })
  456 | 
  457 |   test('TC-F4-13 [P3] EmptyState cuando todos los contactos están asignados', async ({
  458 |     page,
  459 |     clienteFactory,
  460 |     contactoFactory,
  461 |   }) => {
  462 |     // GIVEN: All contacts have clienteId
  463 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Todos Asignados F4' })
  464 |     const c = await contactoFactory.create({ nombre: 'Todos Asignados F4' })
  465 |     await contactoFactory.assignCliente(c.id, cliente.id)
  466 | 
  467 |     await page.goto('/contactos')
  468 | 
  469 |     // WHEN: Activate "Sin cliente" filter
  470 |     await page.getByRole('button', { name: /sin cliente/i }).click()
  471 | 
  472 |     // THEN: EmptyState "Todos los contactos están asignados a un cliente"
> 473 |     await expect(page.getByText(/todos los contactos.*asignados|asignados a un cliente/i)).toBeVisible()
      |                                                                                            ^ Error: expect(locator).toBeVisible() failed
  474 |   })
  475 | 
  476 |   test('TC-F4-14 [P3] Desactivar filtro restaura lista completa de contactos', async ({
  477 |     page,
  478 |     clienteFactory,
  479 |     contactoFactory,
  480 |   }) => {
  481 |     // GIVEN: "Sin cliente" filter active
  482 |     const cliente = await clienteFactory.create({ nombre: 'Cliente Restaurar F4' })
  483 |     const asignado = await contactoFactory.create({ nombre: 'Asignado Restaurar F4' })
  484 |     await contactoFactory.assignCliente(asignado.id, cliente.id)
  485 |     await contactoFactory.create({ nombre: 'Huérfano Restaurar F4' })
  486 | 
  487 |     await page.goto('/contactos')
  488 |     await page.getByRole('button', { name: /sin cliente/i }).click()
  489 |     await expect(page.getByText('Asignado Restaurar F4')).not.toBeVisible()
  490 | 
  491 |     // WHEN: Deactivate filter
  492 |     await page.getByRole('button', { name: /sin cliente/i }).click()
  493 | 
  494 |     // THEN: Full list restored (assigned + orphans)
  495 |     await expect(page.getByText('Asignado Restaurar F4')).toBeVisible()
  496 |     await expect(page.getByText('Huérfano Restaurar F4')).toBeVisible()
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
```