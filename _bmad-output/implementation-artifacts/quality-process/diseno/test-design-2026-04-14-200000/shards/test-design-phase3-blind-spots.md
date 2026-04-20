---
workflow: quality-process
phase: diseno
version: 1.0.0
methodology: BMAD V6.0 MegaPrompt
generated_date: 2026-04-14T20:00:00Z
project_name: Siesa-Agents
input_documents:
  epics:
    - _bmad-output/planning-artifacts/epics/epic-01-foundation.md
    - _bmad-output/planning-artifacts/epics/epic-02-gestion-de-clientes.md
    - _bmad-output/planning-artifacts/epics/epic-03-gestion-de-contactos.md
    - _bmad-output/planning-artifacts/epics/epic-04-asociacion-cliente-contacto.md
  prd: _bmad-output/planning-artifacts/prd/
  technology_stack: _bmad/bmm/workflows/3-solutioning/create-architecture/data/company-standards/technology-stack.md
  test_plan: _bmad-output/implementation-artifacts/quality-process/planeacion/test-plan-2026-04-14-100000/test-plan.md
---

# FASE 3 — DETECCIÓN DE PUNTOS CIEGOS (SIMULACIÓN UNIVERSAL)

## III. PUNTOS CIEGOS DETECTADOS POR FEATURE

---

### Feature F1 — Application Shell & Navigation

**Arquetipo: Usuario Inexperto (Naive User)**
→ Escribe `/clientes/` con trailing slash o `/CLIENTES` en mayúsculas → el router de TanStack puede no normalizar la ruta → **Consecuencia:** Vista en blanco o 404 inesperado; usuario cree que la aplicación está caída.

**Arquetipo: Usuario Inexperto (Naive User)**
→ Presiona F5 (refresh) mientras está en `/clientes/:id` → el servidor de desarrollo (Vite) podría no tener fallback a `index.html` para rutas SPA → **Consecuencia:** Error 404 del servidor de desarrollo al cargar la app; rompe deep linking en producción si nginx/IIS no está configurado con `try_files`.

**Arquetipo: Entorno Hostil (Infraestructura)**
→ El viewport se redimensiona dinámicamente (usuario en tablet rota entre landscape y portrait) mientras navega → el breakpoint de NavigationRail↔NavigationBar puede no aplicarse dinámicamente sin re-render → **Consecuencia:** UI bloqueada en el layout incorrecto; Carlos no puede usar la barra de navegación en su tablet.

**Arquetipo: Entorno Hostil (Infraestructura)**
→ Navegador con JavaScript deshabilitado o extensión bloqueando React → la SPA no renderiza nada → **Consecuencia:** Pantalla en blanco completa; sin mensaje de fallback. Aunque fuera de alcance de NFR, es un punto ciego de UX.

**Arquetipo: Perfil de Integración (APIs)**
→ El historial del navegador acumula 50+ entradas de navegación entre `/clientes` y `/contactos` → Memory Leak en el router o en TanStack Query si los listeners no se desmontan correctamente → **Consecuencia:** Degradación progresiva de performance (NFR2 violado) en sesiones largas de Marcela.

---

### Feature F2 — Client Management

**Arquetipo: Usuario Inexperto (Naive User)**
→ El usuario hace doble-clic en el botón "Guardar" al crear un cliente → si el mutation no tiene `disabled` estado durante la llamada HTTP → se envían 2 POST requests simultáneos → **Consecuencia:** Creación de 2 clientes duplicados con el mismo NIT/RUC (viola `uk_clientes_nit`) o cliente duplicado con NIT diferente si el usuario aún no lo completó.

**Arquetipo: Usuario Inexperto (Naive User)**
→ El usuario pega texto de Word con caracteres especiales (`—`, `"`, `\u00a0` non-breaking space) en el campo Nombre → el campo Nombre acepta el texto visualmente pero la búsqueda posterior no encuentra al cliente porque el texto guardado tiene caracteres Unicode no convencionales → **Consecuencia:** Cliente "fantasma" — creado pero imposible de encontrar por búsqueda, afectando la confiabilidad del sistema para Carlos.

**Arquetipo: Usuario Malintencionado**
→ El usuario ingresa `<script>alert('XSS')</script>` en el campo Nombre del cliente → si el backend no sanitiza correctamente y el frontend renderiza sin escapado → **Consecuencia:** XSS persistente: el script se ejecuta cada vez que cualquier usuario carga la lista de clientes, comprometiendo la sesión y datos de todos los usuarios.

**Arquetipo: Usuario Malintencionado**
→ El usuario ingresa `' OR '1'='1` en el campo de búsqueda → si la búsqueda futura se implementa server-side sin ORM → **Consecuencia:** SQL Injection que expone todos los registros. Actualmente la búsqueda es client-side (mitigado), pero cuando el dataset crezca y se implemente server-side, este riesgo se vuelve crítico.

**Arquetipo: Perfil de Integración (APIs)**
→ El TanStack Query cache expira (staleTime) exactamente mientras el usuario está editando un cliente → el hook `useCliente(id)` refetch automáticamente sobrescribiendo los cambios no guardados en el form → **Consecuencia:** El usuario pierde los cambios que estaba escribiendo sin advertencia.

**Arquetipo: Entorno Hostil (Infraestructura)**
→ La conexión a internet se corta durante el envío del formulario de creación de cliente → el frontend no recibe 201 pero el backend procesó el POST antes de perder conexión → **Consecuencia:** El cliente existe en la base de datos pero el frontend no lo sabe. Al reconectarse, el usuario intenta crear de nuevo, recibe 409 NIT duplicado, y cree que el sistema falló. El cliente está creado pero "perdido" para el usuario.

**Arquetipo: Entorno Hostil (Infraestructura)**
→ Usuario abre el mismo cliente en dos pestañas del navegador y edita el teléfono en ambas → la segunda PUT sobreescribe la primera sin conflicto (no hay optimistic lock) → **Consecuencia:** Pérdida silenciosa de datos. El último en guardar gana, sin notificación al usuario sobre el conflicto (last-write-wins problem).

**Arquetipo: Auditor de Procesos**
→ No existe campo de auditoría visible (`CreatedAt`, `UpdatedAt`) en la interfaz de usuario → aunque están en la BD, no son accesibles al equipo comercial → **Consecuencia:** Marcela no puede determinar cuándo fue creado o modificado un cliente para auditar cambios históricos; esto es un gap entre el modelo de datos y la UI.

**Arquetipo: Usuario Comercial (Siesa-específico)**
→ El NIT/RUC colombiano tiene un formato específico (10 dígitos + dígito verificador separado por guion: `900.123.456-7`). Si el campo acepta solo texto libre sin validación de formato colombiano, los registros tendrán NIT en múltiples formatos inconsistentes → **Consecuencia:** La búsqueda por NIT falla si el usuario busca `9001234567` pero el registro fue guardado como `900.123.456-7`.

---

### Feature F3 — Contact Management

**Arquetipo: Usuario Inexperto (Naive User)**
→ El usuario ingresa un email válido con mayúsculas (`Juan.Perez@Empresa.COM`) → si Zod y FluentValidation no normalizan a minúsculas antes de guardar → el mismo contacto puede ser creado con variaciones de mayúsculas del mismo email → **Consecuencia:** Duplicados semánticos — dos registros para el mismo contacto, difíciles de detectar por búsqueda.

**Arquetipo: Usuario Inexperto (Naive User)**
→ El usuario hace clic en "Eliminar contacto" sin querer (botón muy cercano a "Editar") → sin el confirmation dialog, el contacto se eliminaría instantáneamente. Los ACs incluyen el dialog, pero si el dialog tiene auto-focus en "Confirmar" → el usuario presiona Enter y confirma accidentalmente → **Consecuencia:** Eliminación accidental irreversible de un contacto con historial de asociaciones.

**Arquetipo: Usuario Malintencionado**
→ Envío directo de POST `/api/v1/contactos` con email `a@b.c` (técnicamente válido según RFC pero inusual) y Cargo vacío enviado como string de solo espacios `"   "` → si FluentValidation usa `.NotEmpty()` sin `.Trim()` → **Consecuencia:** Se guarda un contacto con Cargo="   " (espacios), aparece en listas como si estuviera vacío, viola la invariante de datos del negocio.

**Arquetipo: Perfil de Integración (APIs)**
→ Llamada GET `/api/v1/contactos` cuando hay 1000 registros devuelve el array completo en una respuesta sin paginación → si el payload supera 1MB → el browser puede tardar en parsear el JSON, violando NFR1 → **Consecuencia:** Degradación de performance con datasets reales en producción.

**Arquetipo: Entorno Hostil (Infraestructura)**
→ Se elimina un contacto que estaba siendo editado por otro usuario simultáneamente → el segundo usuario guarda los cambios → el PUT retorna 404 (contacto ya no existe) → si el frontend no maneja el 404 en mutaciones → **Consecuencia:** Error no manejado visible al usuario con mensaje técnico, violando NFR6.

**Arquetipo: Usuario de Consulta/Reportería**
→ El usuario desea exportar la lista de contactos (Carlos quiere llevarla a una reunión) → la aplicación no tiene funcionalidad de exportación en el MVP → **Consecuencia:** Gap de funcionalidad esperada por el usuario; no es un defecto pero sí una expectativa no cumplida que puede llevar a rechazo del usuario.

**Arquetipo: Auditor de Procesos (Siesa-específico)**
→ El campo Cargo no tiene un catálogo o lista predefinida → cada usuario ingresa el cargo libremente ("Director", "DIRECTOR", "Dir.", "director de ventas") → **Consecuencia:** Imposibilidad de agrupar o filtrar por cargo en reportes futuros; datos inconsistentes desde el inicio.

---

### Feature F4 — Client-Contact Association & Data Quality

**Arquetipo: Usuario Inexperto (Naive User)**
→ El usuario intenta asociar un contacto que ya está asignado a otro cliente sin ser consciente de ello → si la UI no muestra el cliente actual del contacto en la lista de selección del ContactManager → **Consecuencia:** Reasignación accidental; el usuario cree que está asociando, pero en realidad está reasignando el contacto y removiéndolo del cliente anterior.

**Arquetipo: Usuario Inexperto (Naive User)**
→ El usuario activa el filtro "Sin cliente" y luego navega al detalle de un contacto, regresa y el filtro está desactivado → si el estado del filtro no persiste en el store de Zustand → **Consecuencia:** Marcela pierde el contexto de su sesión de limpieza de datos cada vez que navega entre contactos.

**Arquetipo: Usuario Malintencionado**
→ El usuario envía PUT `/api/v1/contactos/{id}/cliente` con `{ clienteId: "invalid-uuid-format" }` → si FluentValidation no valida el formato UUID del clienteId → **Consecuencia:** Error 500 en lugar de 400 Bad Request; Problem Details no se devuelve correctamente.

**Arquetipo: Perfil de Integración (APIs)**
→ El ContactManager realiza múltiples llamadas simultáneas a `GET /api/v1/contactos?clienteId=:id` cuando el cliente tiene 500 contactos y el componente se remonta frecuentemente → si el IContactServiceAdapter no cancela requests previos → **Consecuencia:** Race condition: la respuesta más antigua llega después y sobrescribe los datos más recientes (stale closure problem).

**Arquetipo: Perfil de Integración (APIs)**
→ Después de la reasignación de un contacto, el componente del cliente origen no recibe la invalidación porque `['contactos', { clienteId: oldId }]` fue calculado con el ID incorrecto (bug en el hook) → **Consecuencia:** El contacto sigue apareciendo en el ContactManager del cliente anterior — dato fantasma que confunde al usuario hasta que recarga la página.

**Arquetipo: Entorno Hostil (Infraestructura)**
→ Dos usuarios ejecutan simultáneamente `PUT /api/v1/contactos/{mismoId}/cliente` con clienteIds diferentes → la BD PostgreSQL garantiza atomicidad de cada transacción, pero el último en llegar gana sin notificación → **Consecuencia:** User A cree que asignó el contacto a "Empresa A" pero User B lo asignó a "Empresa B" simultáneamente. User A ve los datos actualizados solo después del próximo refetch.

**Arquetipo: Entorno Hostil (Infraestructura)**
→ La app pierde conectividad justo después de enviar la disociación de un contacto → la BD actualizó el `clienteId = null` pero el frontend no recibió confirmación → TanStack Query no invalida el cache → **Consecuencia:** El ContactManager sigue mostrando el contacto como asociado; el dato es incorrecto hasta que el usuario recarga.

**Arquetipo: Auditor de Procesos**
→ No hay registro de auditoría de las asociaciones/disociaciones → si "Empresa A" pierde el contacto "Juan Pérez" inesperadamente, no hay forma de saber quién lo reasignó ni cuándo → **Consecuencia:** Imposibilidad de reconstruir el historial de relaciones; potencial problema de confianza en el sistema para Marcela.

**Arquetipo: Usuario Comercial (Carlos — Siesa-específico)**
→ Carlos navega desde un cliente a un contacto, luego hace clic en el cliente asociado desde el contacto (navega de vuelta), pero este es un cliente *diferente* al que comenzó (el contacto fue reasignado) → el historial del router puede llevar a una ruta incorrecta → **Consecuencia:** Carlos se desorienta — "¿Por qué estoy viendo Empresa B cuando empecé en Empresa A?" Viola el principio UX "Contexto es sagrado".
