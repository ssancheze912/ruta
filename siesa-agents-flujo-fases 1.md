# 🚀 Metodología Siesa-Agents: Flujo de Trabajo de Ingeniería

> **Objetivo:** Estandarizar el ciclo de vida del desarrollo de software en las fábricas de Siesa Business, garantizando trazabilidad total desde el requerimiento en Jira hasta la implementación técnica con GitFlow.

---

## Fase 1: Definición Inicial (Opcional)

* **`/bmad:core:workflows:workflow-init`**
    * **Propósito:** Preparar el entorno local.
    * **Acción:** Configura la estructura de carpetas necesaria para que todos los workflows posteriores operen correctamente.
* **`/bmad:bmm:workflows:create-product-brief`**
    * **Propósito:** Establecer la visión.
    * **Acción:** Genera un resumen ejecutivo con los objetivos del negocio cuando no existe documentación previa.

---

## Fase 2: Definición de Producto y UX

* **`/bmad:bmm:workflows:create-prd`**
    * **Integración Jira:** Durante el paso de **Descubrimiento**, el workflow guía la autenticación y permite extraer los *features* directamente desde Jira o cargarlos desde un archivo `.md`.
    * **Resultado:** Genera el **PRD Semilla** (monolítico).
* **`/bmad:core:workflows:shard-docs` (Opción: [P] PRD)**
    * **Acción:** Explota el PRD Semilla detectando secciones `### feature —`.
    * **Organización:** Crea la carpeta `prd/` con shards transversales (`goals.md`, `nfr.md`) y shards por funcionalidad (`feature-{name}.md`). El original se mueve a `archive/`.
* **`/bmad:bmm:workflows:create-ux-design`**
    * **Acción:** Produce especificaciones de diseño transversales para asegurar consistencia visual en todo el proyecto.

---

## Fase 3: Arquitectura y Desglose Técnico

* **`/bmad:bmm:workflows:create-architecture`**
    * **Acción:** Define los estándares técnicos del servicio (Backend, Frontend, Base de Datos y Patrones).
* **`/bmad:core:workflows:generate-project-context`**
    * **Acción:** Crea el `project-context.md`, fuente de verdad inmutable para el contexto del proyecto.
* **`/bmad:bmm:workflows:create-epics-and-stories`**
    * **Acción:** Desglose de épicas e historias a alto nivel con criterios de aceptación iniciales y consecutivo global de numeración.
* **`/bmad:core:workflows:shard-docs` (Opción: [E] Epics)**
    * **Acción:** Fragmenta el documento de épicas hacia la carpeta `epics/`, generando archivos `epic-{NN}-{name}.md` y un `index.md` de trazabilidad.
* **`/bmad:bmm:workflows:check-implementation-readiness`**
    * **Validación Crítica:** Auditoría automática que asegura que el PRD, la Arquitectura y las Épicas/Historias estén alineados y sin contradicciones antes de desarrollar.

---

## Fase 4: Planeación y Ejecución de Desarrollo

* **`/bmad:bmm:workflows:sprint-planning`**
    * **Acción:** Genera el `sprint-status.yaml`. Utiliza el campo `source` para apuntar al shard de épicas correspondiente, optimizando la lectura de requerimientos.
* **`/bmad:bmm:workflows:create-story`**
    * **Acción:** Genera la **Historia de Usuario detallada** en `stories/`, integrando automáticamente componentes del **Siesa UI Kit**.
* **`/bmad:core:workflows:dev-story`**
    * **Construcción y GitFlow:** Es el motor de desarrollo. El workflow **desarrolla la historia** (escribe el código) y **garantiza el GitFlow**:
        1. Valida rama y estándares de naming de Siesa.
        2. Implementa la lógica técnica.
        3. **Ejecuta los commits** automáticamente.
    * **Responsabilidad Humana:** El ingeniero debe validar manualmente el trabajo y realizar el **push**.
* **`/bmad:core:workflows:code-review`**
    * **Acción:** Revisión técnica de calidad frente a los criterios de aceptación.
* **`/bmad:bmm:workflows:sync-epics-stories`**
    * **Cierre de Ciclo:** Cuando las historias de una épica están listas, este workflow sincroniza y envía todo el detalle técnico de vuelta a **Jira**. Es un workflow que se debe ejecutar de forma manual, ya que el ingeniero decide en que momento desea sincronizar.