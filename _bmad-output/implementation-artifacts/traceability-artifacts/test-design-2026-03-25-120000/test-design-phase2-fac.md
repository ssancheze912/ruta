---
workflow: quality-process
phase: planeacion
version: 1.0.0
methodology: BMAD V6.0 MegaPrompt
generated_date: 2026-03-25T12:00:00Z
project_name: Siesa-Agents
input_documents:
  epics:
    - _bmad-output/planning-artifacts/epics/epic-01-foundation.md
    - _bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md
    - _bmad-output/planning-artifacts/epics/epic-03-gestion-de-contactos.md
    - _bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md
  prd:
    - _bmad-output/planning-artifacts/prd/executive-summary.md
    - _bmad-output/planning-artifacts/prd/functional-requirements.md
technology_stack: _bmad/bmm/workflows/3-solutioning/create-architecture/data/company-standards/technology-stack.md
---

# Fase 2 — Definición de Features y Criterios Maestros (FAC) en Gherkin

## II. DEFINICIÓN DE FEATURES Y CRITERIOS MAESTROS (FAC) EN GHERKIN

---

### Feature F1 — Navegación y Shell de Aplicación

- **Feature:** F1 — Navegación y Shell de Aplicación
- **Historias Asociadas:** E1-S1.2
- **FRs Cubiertos:** FR28 (SPA sin recargas), FR29 (acceso móvil), FR30 (deep linking)
- **Epic ACs:** AC-E1.1, AC-E1.2, AC-E1.3

#### FAC Funcionales (Gherkin)

```gherkin
Feature: F1 — Navegación y Shell de Aplicación

  Background:
    Given la aplicación Siesa-Agents está desplegada en localhost:5173
    And el servidor de desarrollo está en ejecución sin errores en consola

  # AC-E1.1 + FR28 — Desktop NavigationRail
  Scenario: FAC-F1-01 — NavigationRail visible en viewport de escritorio
    Given el usuario accede a la aplicación desde un navegador desktop con viewport ≥ 1024px
    When la aplicación termina de cargar completamente
    Then el componente NavigationRail (siesa-ui-kit) es visible en el lado izquierdo de la pantalla
    And el NavigationRail contiene exactamente dos entradas: "Clientes" y "Contactos"
    And ambas entradas son visualmente distinguibles e interactivas (clickeables)

  # AC-E1.1 + FR29 — Mobile NavigationBar
  Scenario: FAC-F1-02 — NavigationBar visible en viewport móvil
    Given el usuario accede a la aplicación desde un navegador con viewport < 768px
    When la aplicación termina de cargar completamente
    Then el componente NavigationBar (siesa-ui-kit) es visible (bottom bar o top bar)
    And todas las entradas de navegación ("Clientes", "Contactos") son visibles sin scroll horizontal
    And los tap targets de cada entrada tienen un área mínima de 44×44px (WCAG 2.5.5)

  # AC-E1.2 + FR28 — Navigate to Clientes (SPA)
  Scenario: FAC-F1-03 — Navegación a la sección Clientes sin recarga de página
    Given el usuario está en cualquier vista de la aplicación
    When el usuario hace clic en la entrada "Clientes" del NavigationRail o NavigationBar
    Then la URL del navegador cambia a "/clientes"
    And la vista de Clientes se renderiza correctamente en el área de contenido principal
    And NO ocurre una recarga completa de página (el DOM raíz de React no se desmonta ni remonta)
    And la entrada "Clientes" se muestra visualmente como activa/seleccionada

  # AC-E1.2 + FR28 — Navigate to Contactos (SPA)
  Scenario: FAC-F1-04 — Navegación a la sección Contactos sin recarga de página
    Given el usuario está en cualquier vista de la aplicación
    When el usuario hace clic en la entrada "Contactos" del NavigationRail o NavigationBar
    Then la URL del navegador cambia a "/contactos"
    And la vista de Contactos se renderiza correctamente
    And NO ocurre una recarga completa de página
    And la entrada "Contactos" se muestra visualmente como activa/seleccionada

  # AC-E1.3 + FR30 — Deep link /clientes
  Scenario: FAC-F1-05 — Deep linking directo a /clientes vía URL
    Given el usuario escribe "http://localhost:5173/clientes" directamente en la barra de URL
    When el navegador termina de cargar la página
    Then la vista de Clientes se renderiza correctamente sin redirección previa
    And el NavigationRail/Bar indica visualmente que "Clientes" es la sección activa
    And no se produce error 404 ni redireccionamiento a la página de inicio

  # AC-E1.3 + FR30 — Deep link /contactos
  Scenario: FAC-F1-06 — Deep linking directo a /contactos vía URL
    Given el usuario escribe "http://localhost:5173/contactos" directamente en la barra de URL
    When el navegador termina de cargar la página
    Then la vista de Contactos se renderiza correctamente sin redirección previa
    And el NavigationRail/Bar indica visualmente que "Contactos" es la sección activa

  # Unknown route
  Scenario: FAC-F1-07 — Ruta desconocida muestra vista 404 elegante
    Given el usuario navega a una URL que no existe en la aplicación (ej: "/ruta-inexistente")
    When la página termina de cargar
    Then se muestra una vista de error 404 / not-found de forma elegante
    And la estructura de navegación (NavigationRail/Bar) permanece visible e interactiva
    And no se produce un error técnico no controlado ni un blank screen
```

#### FAC No Funcionales (Gherkin)

```gherkin
  # NFR — Performance de navegación
  Scenario: FAC-F1-NF-01 — Tiempo de respuesta de la navegación SPA
    Given la aplicación está completamente cargada en el navegador
    When el usuario hace clic en cualquier entrada del NavigationRail o NavigationBar
    Then la vista de destino se renderiza completamente en menos de 500ms
    And no ocurre parpadeo visual (flickering) ni layout shift durante la transición

  # NFR — Responsive sin scroll horizontal
  Scenario: FAC-F1-NF-02 — Interfaz responsiva sin scroll horizontal en móvil
    Given la aplicación se carga en un dispositivo con viewport de 320px a 767px de ancho
    When el usuario visualiza la aplicación sin aplicar zoom
    Then no hay scroll horizontal en ninguna vista
    And todos los controles de navegación son accesibles con una sola acción táctil
    And el layout se adapta correctamente entre orientación portrait y landscape
```

- **Dependencias F1:** TanStack Router 1+ (file-based routing, rutas /clientes y /contactos), siesa-ui-kit (NavigationRail, NavigationBar), React 18+ + Vite 7+ (SPA, HMR), TailwindCSS v4 (responsive breakpoints)

---

### Feature F2 — Gestión de Clientes

- **Feature:** F2 — Gestión de Clientes
- **Historias Asociadas:** E2-S2.1, E2-S2.2, E2-S2.3, E2-S2.4, E2-S2.5
- **FRs Cubiertos:** FR1 (crear), FR2 (listar), FR3 (buscar nombre), FR4 (buscar NIT/RUC), FR5 (ver detalle), FR6 (editar), FR7 (eliminar), FR8 (validación), FR27 (cambios inmediatos), FR30 (deep linking)
- **Epic ACs:** AC-E2.1, AC-E2.2, AC-E2.3, AC-E2.4, AC-E2.5

#### FAC Funcionales (Gherkin)

```gherkin
Feature: F2 — Gestión de Clientes

  Background:
    Given el backend Siesa-Agents está en ejecución en localhost:5000
    And el frontend está en ejecución en localhost:5173
    And la base de datos PostgreSQL está accesible y migraciones aplicadas

  # FR2 — List
  Scenario: FAC-F2-01 — Lista de clientes visible con Nombre y NIT/RUC
    Given existen uno o más clientes registrados en el sistema
    When el usuario navega a "/clientes"
    Then el panel izquierdo (280px) muestra una lista scrollable de todos los clientes
    And cada ítem de la lista muestra el Nombre y el NIT/RUC del cliente de forma visible

  # FR2 — Empty state
  Scenario: FAC-F2-02 — EmptyState cuando no existen clientes
    Given no existe ningún cliente en el sistema
    When el usuario navega a "/clientes"
    Then se muestra un componente EmptyState con un mensaje orientando al usuario a crear el primer cliente
    And no se muestra ningún error en la interfaz

  # FR3, FR4, NFR1 — Search by Nombre
  Scenario: FAC-F2-03 — Búsqueda en tiempo real por Nombre
    Given la lista de clientes está cargada con registros en pantalla
    When el usuario escribe texto en el campo de búsqueda
    Then la lista se filtra en tiempo real mostrando solo los clientes cuyo Nombre coincide con el texto ingresado
    And los resultados se actualizan visualmente mientras el usuario escribe (sin botón de submit)

  # FR3, FR4, NFR1 — Search by NIT/RUC
  Scenario: FAC-F2-04 — Búsqueda en tiempo real por NIT/RUC
    Given la lista de clientes está cargada
    When el usuario escribe un NIT/RUC (parcial o completo) en el campo de búsqueda
    Then la lista se filtra mostrando solo clientes cuyo NIT/RUC contiene el texto ingresado
    And los resultados aparecen en menos de 1 segundo con hasta 500 registros en el sistema (NFR1)

  # Error state
  Scenario: FAC-F2-05 — ErrorPanel cuando el backend no está disponible
    Given el backend está caído o no es accesible al momento de cargar la lista
    When el usuario navega a "/clientes"
    Then se muestra un ErrorPanel con un botón "Reintentar"
    And el mensaje de error NO expone stack traces, nombres de clase ni detalles técnicos internos (NFR6)

  # FR5, FR30 — Detail view
  Scenario: FAC-F2-06 — Ver detalle completo de cliente al hacer clic
    Given la lista de clientes está visible en el panel izquierdo
    When el usuario hace clic en un ítem de cliente
    Then el panel derecho muestra los detalles completos: Nombre, NIT/RUC, Teléfono, Ciudad
    And la URL se actualiza a "/clientes/:clienteId" (deep linking, FR30)

  Scenario: FAC-F2-07 — Deep link directo al detalle de un cliente
    Given el usuario accede directamente a "http://localhost:5173/clientes/:clienteId" via URL
    When la página carga
    Then los detalles correctos del cliente se cargan y se muestran en pantalla
    And si el clienteId no existe en el sistema, se muestra un mensaje not-found elegante

  # FR1, FR8 — Create
  Scenario: FAC-F2-08 — Apertura del formulario de creación con campos requeridos
    Given el usuario está en la vista "/clientes"
    When el usuario hace clic en el botón "Nuevo cliente"
    Then se abre un formulario con exactamente los 4 campos requeridos: Nombre, NIT/RUC, Teléfono, Ciudad
    And todos los campos están vacíos (formulario limpio)

  Scenario: FAC-F2-09 — Creación de cliente con datos válidos
    Given el formulario de creación está abierto
    When el usuario completa los 4 campos requeridos con datos válidos y hace clic en guardar
    Then el cliente es creado en el sistema (POST /api/v1/clientes)
    And el nuevo cliente aparece en la lista del panel izquierdo inmediatamente sin refrescar (FR27)
    And se muestra un toast de éxito con el mensaje "Cliente creado correctamente"

  Scenario: FAC-F2-10 — Validación de campo Nombre requerido al crear
    Given el formulario de creación está abierto
    When el usuario deja el campo Nombre vacío e intenta enviar el formulario
    Then el formulario NO se envía al backend
    And se muestra un mensaje de error inline debajo del campo Nombre indicando que es requerido (FR8)

  Scenario: FAC-F2-11 — Validación de campo NIT/RUC requerido al crear
    Given el formulario de creación está abierto
    When el usuario deja el campo NIT/RUC vacío e intenta enviar
    Then el formulario NO se envía al backend
    And se muestra un mensaje de error inline en el campo NIT/RUC

  Scenario: FAC-F2-12 — Validación de campo Teléfono requerido al crear
    Given el formulario de creación está abierto
    When el usuario deja el campo Teléfono vacío e intenta enviar
    Then el formulario NO se envía al backend
    And se muestra un mensaje de error inline en el campo Teléfono

  Scenario: FAC-F2-13 — Validación de campo Ciudad requerido al crear
    Given el formulario de creación está abierto
    When el usuario deja el campo Ciudad vacío e intenta enviar
    Then el formulario NO se envía al backend
    And se muestra un mensaje de error inline en el campo Ciudad

  Scenario: FAC-F2-14 — Conflicto por NIT/RUC duplicado
    Given existe un cliente con NIT/RUC "900123456-7" en el sistema
    When el usuario intenta crear un nuevo cliente con el mismo NIT/RUC "900123456-7"
    And envía el formulario
    Then el backend retorna HTTP 409 Conflict
    And la interfaz muestra el mensaje "El NIT/RUC ya está registrado"
    And no se exponen detalles técnicos al usuario (NFR6)

  # FR6, FR8 — Edit
  Scenario: FAC-F2-15 — Formulario de edición pre-poblado con datos actuales
    Given el usuario está visualizando el detalle de un cliente
    When el usuario hace clic en el botón "Editar"
    Then el formulario se abre con los valores actuales de todos los campos (Nombre, NIT/RUC, Teléfono, Ciudad)
    And ningún campo está vacío en el formulario de edición

  Scenario: FAC-F2-16 — Guardar cambios de edición con datos válidos
    Given el formulario de edición está abierto con datos del cliente
    When el usuario modifica uno o más campos con datos válidos y guarda
    Then los cambios se reflejan inmediatamente en el panel de detalle y en la lista (FR27)
    And se muestra un toast de éxito "Cliente actualizado correctamente"

  Scenario: FAC-F2-17 — Validación al editar: campo requerido vacío
    Given el formulario de edición está abierto
    When el usuario borra un campo requerido e intenta guardar
    Then el formulario NO se envía al backend
    And se muestra un mensaje de error inline en el campo vaciado (FR8)

  Scenario: FAC-F2-18 — Cancelar edición no modifica datos
    Given el formulario de edición está abierto con modificaciones no guardadas
    When el usuario hace clic en "Cancelar"
    Then el formulario se cierra
    And los datos originales del cliente permanecen sin cambios en el detalle y en la lista

  # FR7 — Delete
  Scenario: FAC-F2-19 — Diálogo de confirmación antes de eliminar
    Given el usuario está viendo el detalle de un cliente
    When el usuario hace clic en el botón "Eliminar"
    Then aparece un diálogo de confirmación con el mensaje "¿Eliminar este cliente?"
    And el diálogo contiene las opciones "Confirmar" y "Cancelar"

  Scenario: FAC-F2-20 — Eliminación confirmada de cliente sin contactos
    Given el diálogo de confirmación de eliminación está visible
    And el cliente a eliminar no tiene contactos asociados
    When el usuario hace clic en "Confirmar"
    Then el cliente es removido del sistema (DELETE /api/v1/clientes/:id)
    And el cliente desaparece de la lista del panel izquierdo inmediatamente (FR27)
    And el panel derecho retorna al estado vacío/default
    And se muestra un toast "Cliente eliminado correctamente"

  Scenario: FAC-F2-21 — Eliminación de cliente con contactos asociados — contactos pasan a huérfanos
    Given el diálogo de confirmación está visible
    And el cliente tiene uno o más contactos asociados
    When el usuario hace clic en "Confirmar"
    Then el cliente es eliminado del sistema
    And los contactos previamente asociados permanecen en el sistema con sus datos intactos
    And esos contactos quedan con `clienteId = null` (pasan a ser huérfanos)
    And aparecen en el filtro "Sin cliente" de la sección Contactos (FR25)
    And se muestra el toast "Cliente eliminado. Sus contactos asociados quedaron sin cliente asignado."

  Scenario: FAC-F2-22 — Cancelar eliminación preserva el registro
    Given el diálogo de confirmación de eliminación está visible
    When el usuario hace clic en "Cancelar"
    Then el diálogo se cierra
    And el registro del cliente permanece en el sistema sin modificaciones
```

#### FAC No Funcionales (Gherkin)

```gherkin
  # NFR1 — Search performance
  Scenario: FAC-F2-NF-01 — Búsqueda de clientes responde en menos de 1 segundo
    Given el sistema tiene hasta 500 registros de clientes en la base de datos
    When el usuario ingresa texto en el campo de búsqueda
    Then los resultados filtrados se muestran en menos de 1000ms desde que el usuario deja de tipear

  # NFR2 — CRUD performance
  Scenario: FAC-F2-NF-02 — Operaciones CRUD reflejan cambios en menos de 2 segundos
    Given el usuario ejecuta una operación de creación, edición o eliminación de cliente
    When la operación es procesada por el backend y la respuesta llega al frontend
    Then la UI refleja el cambio (lista actualizada, detalle actualizado) en menos de 2000ms

  # NFR6 — Error handling
  Scenario: FAC-F2-NF-03 — Mensajes de error no exponen información técnica
    Given ocurre cualquier error en el backend durante una operación de cliente
    When el error es recibido por el frontend
    Then el mensaje visible al usuario es amigable y orientado al negocio
    And el mensaje NO contiene stack traces, nombres de clases, queries SQL, ni datos de infraestructura
```

- **Dependencias F2:** `GET /api/v1/clientes`, `POST /api/v1/clientes`, `GET /api/v1/clientes/:id`, `PUT /api/v1/clientes/:id`, `DELETE /api/v1/clientes/:id`; TanStack Query (queryKey: `['clientes']`); React Hook Form + Zod (validación FE); FluentValidation (validación BE); Toast system; siesa-ui-kit (EmptyState, ErrorPanel)

---

### Feature F3 — Gestión de Contactos

- **Feature:** F3 — Gestión de Contactos
- **Historias Asociadas:** E3-S3.1, E3-S3.2, E3-S3.3, E3-S3.4, E3-S3.5
- **FRs Cubiertos:** FR9 (crear), FR10 (listar), FR11 (buscar nombre), FR12 (buscar email), FR13 (ver detalle), FR14 (editar), FR15 (eliminar), FR16 (validación), FR27 (cambios inmediatos), FR30 (deep linking)
- **Epic ACs:** AC-E3.1, AC-E3.2, AC-E3.3, AC-E3.4, AC-E3.5

#### FAC Funcionales (Gherkin)

```gherkin
Feature: F3 — Gestión de Contactos

  Background:
    Given el backend Siesa-Agents está en ejecución
    And el frontend está en ejecución en localhost:5173

  # FR10 — List
  Scenario: FAC-F3-01 — Lista de contactos visible con Nombre, Cargo y Email
    Given existen uno o más contactos registrados en el sistema
    When el usuario navega a "/contactos"
    Then se muestra una lista de todos los contactos
    And cada ítem muestra el Nombre, el Cargo y el Email del contacto (FR10)

  # FR10 — Empty state
  Scenario: FAC-F3-02 — EmptyState cuando no existen contactos
    Given no existe ningún contacto en el sistema
    When el usuario navega a "/contactos"
    Then se muestra un componente EmptyState con un mensaje guía para crear el primer contacto

  # FR11, FR12, NFR1 — Search
  Scenario: FAC-F3-03 — Búsqueda en tiempo real por Nombre
    Given la lista de contactos está cargada
    When el usuario escribe texto en el campo de búsqueda
    Then la lista se filtra mostrando solo contactos cuyo Nombre coincide con el texto
    And los resultados aparecen en menos de 1 segundo con hasta 1,000 registros (NFR1)

  Scenario: FAC-F3-04 — Búsqueda en tiempo real por Email
    Given la lista de contactos está cargada
    When el usuario escribe un email (parcial o completo) en el campo de búsqueda
    Then la lista se filtra mostrando solo contactos cuyo Email coincide con el texto ingresado

  # Error state
  Scenario: FAC-F3-05 — ErrorPanel cuando el backend no está disponible
    Given el backend está caído al momento de cargar la lista de contactos
    When el usuario navega a "/contactos"
    Then se muestra un ErrorPanel con un botón "Reintentar"
    And el mensaje no expone detalles técnicos internos (NFR6)

  # FR13, FR30 — Detail
  Scenario: FAC-F3-06 — Ver detalle completo de contacto al hacer clic
    Given la lista de contactos está visible
    When el usuario hace clic en un ítem de contacto
    Then se muestra el detalle del contacto con: Nombre, Cargo, Teléfono, Email (FR13)
    And la URL se actualiza a "/contactos/:contactoId" (FR30)

  Scenario: FAC-F3-07 — Deep link directo al detalle de un contacto
    Given el usuario accede directamente a "/contactos/:contactoId" via URL
    When la página carga
    Then los detalles correctos del contacto se cargan y se muestran
    And si el contactoId no existe, se muestra un mensaje not-found elegante

  # FR9, FR16 — Create
  Scenario: FAC-F3-08 — Apertura del formulario de creación con campos requeridos
    Given el usuario está en la vista "/contactos"
    When el usuario hace clic en "Nuevo contacto"
    Then se abre un formulario con exactamente los 4 campos requeridos: Nombre, Cargo, Teléfono, Email

  Scenario: FAC-F3-09 — Creación de contacto con datos válidos
    Given el formulario de creación está abierto
    When el usuario completa los 4 campos con datos válidos y envía el formulario
    Then el contacto es creado en el sistema
    And el nuevo contacto aparece en la lista inmediatamente (FR27)
    And se muestra un toast de éxito "Contacto creado correctamente"

  Scenario: FAC-F3-10 — Validación de campos requeridos al crear contacto
    Given el formulario de creación de contacto está abierto
    When el usuario deja cualquier campo requerido (Nombre, Cargo, Teléfono, Email) vacío e intenta enviar
    Then el formulario NO se envía al backend
    And se muestran mensajes de error inline en los campos vacíos (FR16)

  Scenario: FAC-F3-11 — Error de validación de backend al crear contacto
    Given el formulario de creación está abierto
    When el backend retorna un error de validación (4xx)
    Then el mensaje de error se muestra claramente en la interfaz
    And no se exponen detalles técnicos al usuario (NFR6)

  # FR14, FR16 — Edit
  Scenario: FAC-F3-12 — Formulario de edición pre-poblado con datos actuales
    Given el usuario está viendo el detalle de un contacto
    When el usuario hace clic en "Editar"
    Then el formulario se abre con los valores actuales de todos los campos (Nombre, Cargo, Teléfono, Email)

  Scenario: FAC-F3-13 — Guardar cambios de edición
    Given el formulario de edición del contacto está abierto
    When el usuario modifica uno o más campos con datos válidos y guarda
    Then los cambios se reflejan inmediatamente en el detalle y la lista (FR27)
    And se muestra un toast de éxito "Contacto actualizado correctamente"

  Scenario: FAC-F3-14 — Validación al editar: campo requerido vacío
    Given el formulario de edición está abierto
    When el usuario borra un campo requerido e intenta guardar
    Then el formulario NO se envía al backend
    And se muestra un mensaje de error inline en el campo vaciado (FR16)

  Scenario: FAC-F3-15 — Cancelar edición no modifica datos
    Given el formulario de edición está abierto con modificaciones no guardadas
    When el usuario hace clic en "Cancelar"
    Then los datos originales del contacto permanecen sin cambios

  # FR15 — Delete
  Scenario: FAC-F3-16 — Diálogo de confirmación antes de eliminar contacto
    Given el usuario está viendo el detalle de un contacto
    When el usuario hace clic en "Eliminar"
    Then aparece un diálogo de confirmación "¿Eliminar este contacto?" con "Confirmar" y "Cancelar"

  Scenario: FAC-F3-17 — Eliminación confirmada de contacto
    Given el diálogo de confirmación está visible
    When el usuario hace clic en "Confirmar"
    Then el contacto es eliminado del sistema
    And es removido de la lista de contactos inmediatamente (FR27)
    And la vista retorna a la lista de contactos
    And se muestra un toast "Contacto eliminado correctamente"

  Scenario: FAC-F3-18 — Cancelar eliminación preserva el registro
    Given el diálogo de confirmación de eliminación está visible
    When el usuario hace clic en "Cancelar"
    Then el contacto permanece en el sistema sin modificaciones
```

#### FAC No Funcionales (Gherkin)

```gherkin
  Scenario: FAC-F3-NF-01 — Búsqueda de contactos responde en menos de 1 segundo
    Given el sistema tiene hasta 1,000 registros de contactos
    When el usuario ingresa texto en el campo de búsqueda
    Then los resultados filtrados se muestran en menos de 1000ms

  Scenario: FAC-F3-NF-02 — CRUD de contactos refleja cambios en menos de 2 segundos
    Given el usuario ejecuta una operación CRUD sobre un contacto
    When la operación es procesada
    Then la UI refleja el cambio en menos de 2000ms
```

- **Dependencias F3:** `GET /api/v1/contactos`, `POST /api/v1/contactos`, `GET /api/v1/contactos/:id`, `PUT /api/v1/contactos/:id`, `DELETE /api/v1/contactos/:id`; TanStack Query (queryKey: `['contactos']`); React Hook Form + Zod; FluentValidation; Toast system; siesa-ui-kit

---

### Feature F4 — Asociación Cliente-Contacto & Calidad de Datos

- **Feature:** F4 — Asociación Cliente-Contacto & Calidad de Datos
- **Historias Asociadas:** E4-S4.1, E4-S4.2, E4-S4.3, E4-S4.4, E4-S4.5, E4-S4.6
- **FRs Cubiertos:** FR17–FR27
- **Epic ACs:** AC-E4.1 a AC-E4.7

#### FAC Funcionales (Gherkin)

```gherkin
Feature: F4 — Asociación Cliente-Contacto & Calidad de Datos

  Background:
    Given el backend Siesa-Agents está en ejecución
    And existen clientes y contactos registrados en el sistema

  # FR21, E4-S4.1 — View associated contacts
  Scenario: FAC-F4-01 — ContactManager visible con contactos asociados al cliente
    Given existe un cliente con uno o más contactos asociados
    When el usuario abre el detalle de dicho cliente
    Then el componente ContactManager (siesa-ui-kit) se renderiza en el panel derecho
    And muestra todos los contactos vinculados a ese cliente (FR21)
    And el componente usa `ClienteContactServiceAdapter` con `GET /api/v1/contactos?clienteId=:id`

  Scenario: FAC-F4-02 — ContactManager muestra estado vacío cuando cliente no tiene contactos
    Given existe un cliente sin contactos asociados
    When el usuario abre el detalle de ese cliente
    Then el ContactManager muestra un estado vacío indicando que no hay contactos vinculados aún

  Scenario: FAC-F4-03 — Error al cargar contactos del cliente muestra opción de reintento
    Given el backend no puede cargar los contactos del cliente (error de red)
    When el usuario abre el detalle del cliente
    Then el ContactManager muestra un estado de error con opción de "Reintentar"

  # FR17, FR19, FR20, E4-S4.2 — Associate & Disassociate
  Scenario: FAC-F4-04 — Asociar contacto existente a cliente desde el detalle del cliente
    Given el usuario está en el detalle de un cliente
    And existe un contacto disponible (no asociado a este cliente)
    When el usuario usa el ContactManager para agregar el contacto existente
    Then se llama a `PUT /api/v1/contactos/{id}/cliente` con `{ clienteId: <uuid_cliente> }`
    And el contacto aparece inmediatamente en el ContactManager (FR27)
    And los queryKeys `['contactos']` y `['contactos', { clienteId }]` son invalidados

  # FR18 — Create and auto-associate
  Scenario: FAC-F4-05 — Crear nuevo contacto desde ContactManager lo asocia automáticamente
    Given el usuario está en el detalle de un cliente
    When el usuario crea un nuevo contacto desde dentro del ContactManager
    Then el nuevo contacto es creado en el sistema
    And es automáticamente asociado al cliente actual (FR18)
    And el contacto aparece en el ContactManager inmediatamente

  # FR20 — Disassociate
  Scenario: FAC-F4-06 — Desasociar contacto de cliente sin eliminar ninguno de los dos
    Given el usuario está en el detalle de un cliente con contactos en el ContactManager
    When el usuario desasocia un contacto vía el ContactManager y confirma
    Then se llama a `PUT /api/v1/contactos/{id}/cliente` con `{ clienteId: null }`
    And el contacto desaparece del ContactManager inmediatamente (FR27)
    And el contacto sigue existiendo y es accesible desde "/contactos"

  # FR22, NFR8, E4-S4.3 — Navigate client → contact
  Scenario: FAC-F4-07 — Navegar del detalle de cliente al detalle de contacto en máximo 2 clics
    Given el usuario está en el detalle de un cliente con contactos listados en el ContactManager
    When el usuario hace clic en un contacto del ContactManager
    Then el usuario es navegado a "/contactos/:contactoId" mostrando el detalle completo del contacto (FR22)
    And la navegación requirió no más de 2 clics desde el registro del cliente (NFR8)

  Scenario: FAC-F4-08 — Botón Volver desde detalle de contacto regresa al detalle del cliente
    Given el usuario navegó al detalle de un contacto desde el ContactManager de un cliente
    When el usuario hace clic en "Volver" o en el botón back del navegador
    Then el usuario regresa a la vista del detalle del cliente de origen

  # FR23, FR24, NFR9, E4-S4.4 — View client from contact
  Scenario: FAC-F4-09 — Detalle de contacto muestra el cliente asociado
    Given un contacto está asociado a un cliente
    When el usuario visualiza el detalle de dicho contacto
    Then el nombre del cliente asociado es visible en el detalle del contacto (FR23)
    And esta información está disponible sin navegación adicional (NFR9)

  Scenario: FAC-F4-10 — Navegar del detalle de contacto al detalle del cliente en 1 clic
    Given el nombre del cliente asociado es visible en el detalle del contacto
    When el usuario hace clic en el nombre del cliente
    Then el usuario es navegado a "/clientes/:clienteId" mostrando el detalle completo del cliente (FR24)

  Scenario: FAC-F4-11 — Contacto sin cliente asociado muestra "Sin cliente asignado"
    Given un contacto no está asociado a ningún cliente (clienteId = null)
    When el usuario visualiza el detalle de ese contacto
    Then se muestra el mensaje "Sin cliente asignado" en el lugar del nombre del cliente (FR23)

  # FR25, E4-S4.5 — Orphan filter
  Scenario: FAC-F4-12 — Filtro "Sin cliente" muestra solo contactos sin cliente asignado
    Given el usuario está en la vista "/contactos"
    When el usuario activa el filtro "Sin cliente"
    Then la lista muestra exclusivamente los contactos cuyo `clienteId` es null (FR25)
    And el conteo de contactos huérfanos es visible en la interfaz

  Scenario: FAC-F4-13 — Filtro "Sin cliente" muestra estado vacío cuando todos tienen cliente
    Given todos los contactos del sistema tienen un cliente asignado
    When el usuario activa el filtro "Sin cliente"
    Then se muestra un estado vacío indicando que todos los contactos están asignados

  Scenario: FAC-F4-14 — Desactivar filtro "Sin cliente" restaura la lista completa
    Given el filtro "Sin cliente" está activo
    When el usuario lo desactiva
    Then la lista completa de contactos se restaura (sin filtrar)

  # FR26, FR27, E4-S4.6 — Reassign
  Scenario: FAC-F4-15 — Reasignar contacto a un cliente diferente
    Given el usuario está viendo el detalle de un contacto asociado a un cliente
    When el usuario inicia la acción de reasignación
    Then un selector muestra todos los clientes disponibles para elegir

  Scenario: FAC-F4-16 — Confirmación de reasignación actualiza ambas listas de contactos
    Given el selector de clientes está visible
    When el usuario selecciona un cliente diferente y confirma la reasignación
    Then se llama a `PUT /api/v1/contactos/{id}/cliente` con el nuevo `{ clienteId: uuid_nuevo }`
    And el contacto aparece en el ContactManager del nuevo cliente
    And el contacto es removido del ContactManager del cliente anterior (FR26, FR27)
    And los queryKeys `['contactos']`, `['contactos', { clienteId: oldId }]` y `['contactos', { clienteId: newId }]` son invalidados
    And se muestra un toast "Contacto reasignado correctamente"

  Scenario: FAC-F4-17 — Cancelar reasignación mantiene la asociación actual
    Given el selector de clientes está visible
    When el usuario hace clic en "Cancelar"
    Then la asociación actual del contacto permanece sin cambios

  # FR27 — Immediate visibility for all users
  Scenario: FAC-F4-18 — Cambios de asociación son visibles inmediatamente para todos los usuarios
    Given dos sesiones de usuario están abiertas simultáneamente en diferentes navegadores
    When el Usuario A asocia o desasocia un contacto en su sesión
    Then al refrescar (o invalidar cache), el Usuario B ve los cambios reflejados
    And no es necesario un refresh manual para observar los cambios (via TanStack Query invalidateQueries)
```

#### FAC No Funcionales (Gherkin)

```gherkin
  # NFR8 — 2 clicks max
  Scenario: FAC-F4-NF-01 — Navegación Cliente→Contacto en máximo 2 clics
    Given el usuario está en la lista de clientes (/clientes)
    When el usuario hace clic en un cliente (clic 1) y luego en un contacto del ContactManager (clic 2)
    Then el usuario llega al detalle completo del contacto habiendo realizado exactamente 2 clics

  # NFR9 — Client name without navigation
  Scenario: FAC-F4-NF-02 — Nombre del cliente visible en detalle de contacto sin navegación extra
    Given un contacto está asociado a un cliente
    When el usuario abre el detalle del contacto (1 acción)
    Then el nombre del cliente asociado es visible en la misma pantalla sin clicks adicionales
```

- **Dependencias F4:** `PUT /api/v1/contactos/{id}/cliente` (asociar/desasociar/reasignar); `GET /api/v1/contactos?clienteId=:id` (filtrar por cliente); `GET /api/v1/contactos?clienteId=null` (filtro huérfanos); siesa-ui-kit (ContactManager, ClienteContactServiceAdapter); TanStack Query (invalidateQueries en queryKeys `['contactos']`, `['contactos', { clienteId }]`); TanStack Router (navegación bidireccional)
