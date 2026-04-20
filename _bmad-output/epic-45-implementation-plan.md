# Plan de Implementación — Epic 45: Subscription-Level Pricing (Price Lock)

**Fecha:** 2026-04-09
**Basado en:** `sprint-change-proposal-2026-04-09.md` (Status: Approved)

---

## Resumen de Fases

| Fase | Prioridad | Stories | Objetivo |
|------|-----------|---------|----------|
| **Fase A — Core** | Alta | 45.1 – 45.5 | Price lock funcional end-to-end |
| **Fase B — Enhancement** | Media | 45.6 – 45.8 | Override de precios por suscripción |

---

## PASO 1 — Crear Epic 45 en el backlog

**Workflow:** `/bmad:bmm:workflows:create-epics-and-stories`

**Prompt a usar:**
```
Necesito crear el Epic 45 "Subscription-Level Pricing (Price Lock)" basado en el sprint change proposal aprobado.

El epic tiene 2 fases:

Fase A (Core):
- 45.1: Prisma migration — add pricing fields to SubscriptionComponent (Small)
- 45.2: ComponentsService — clone pricing from PC at component creation (Medium)
- 45.3: BillingDataRealService — read pricing from subscription with PC fallback (Medium)
- 45.4: Backfill script for existing subscriptions (Medium)
- 45.5: Unit + integration tests for cloning and billing flow (Medium)

Fase B (Enhancement):
- 45.6: PATCH endpoint for per-subscription pricing override (Medium)
- 45.7: POST endpoint for pricing reset/re-clone from PC (Small)
- 45.8: Admin Portal UI for pricing visualization and override (Medium)

Servicios afectados: SM-Service (NestJS/Prisma), Billing-Service (.NET), PC-Service (NestJS/Prisma).
Genera los archivos de epic y stories en el formato estándar del proyecto.
```

---

## PASO 2 — Actualizar Arquitectura

**Workflow:** `/bmad:bmm:workflows:create-architecture`

**Prompt a usar:**
```
Necesito actualizar el documento de arquitectura existente en
_bmad-output/planning-artifacts/architecture.md
para reflejar los cambios del Epic 45:

1. Actualizar el modelo de datos SubscriptionComponent — agregar 6 campos:
   fee (Decimal 18,4), pay_in_advance (Boolean), billing_cycle (VarChar 20),
   currency (VarChar 10), charges_snapshot (JSONB), pricing_source (VarChar 10)

2. Actualizar el diagrama ER con los nuevos campos.

3. Actualizar el flujo billing-data: SM-Service ya NO llama a PC en tiempo real;
   lee pricing desde la suscripción. PC solo se consulta como fallback cuando
   pricing_source IS NULL (datos legacy).

4. Añadir el nuevo endpoint:
   PATCH /api/v1/subscriptions/:subscriptionId/components/:componentId/pricing
   POST  /api/v1/subscriptions/:subscriptionId/components/:componentId/pricing/reset

Revisa el documento actual antes de hacer cambios y preserva todo lo que no está afectado.
```

---

## PASO 3 — Actualizar Sprint Plan

**Workflow:** `/bmad:bmm:workflows:sprint-planning`

**Prompt a usar:**
```
Agrega el Epic 45 "Subscription-Level Pricing (Price Lock)" al sprint-status.yaml.
Las stories de Fase A (45.1-45.5) van al sprint actual como backlog.
Las stories de Fase B (45.6-45.8) van como backlog con prioridad media.
El epic no bloquea los epics 39, 43 y 44 que están en progreso.
```

---

## PASO 4 — Ejecutar Story 45.1 (Prisma Migration)

**Workflow:** `/bmad:bmm:workflows:dev-story`

**Prompt a usar:**
```
Ejecuta la Story 45.1: Prisma migration — add pricing fields to SubscriptionComponent.

Archivo target: apps/sm-service/prisma/schema.prisma
Modelo a modificar: SubscriptionComponent

Campos a agregar (todos nullable):
- fee          Decimal(18,4)?
- pay_in_advance Boolean?
- billing_cycle  String? @db.VarChar(20)
- currency       String? @db.VarChar(10)
- charges_snapshot Json?
- pricing_source  String? @db.VarChar(10)

SQL de migración:
ALTER TABLE subscription_components
  ADD COLUMN fee DECIMAL(18, 4),
  ADD COLUMN pay_in_advance BOOLEAN,
  ADD COLUMN billing_cycle VARCHAR(20),
  ADD COLUMN currency VARCHAR(10),
  ADD COLUMN charges_snapshot JSONB,
  ADD COLUMN pricing_source VARCHAR(10);

Prerequisito: debe ejecutarse ANTES de cualquier otra story del Epic 45.
```

---

## PASO 5 — Ejecutar Story 45.2 (Clone pricing en ComponentsService)

**Workflow:** `/bmad:bmm:workflows:dev-story`

**Prompt a usar:**
```
Ejecuta la Story 45.2: ComponentsService — clone pricing from PC at component creation.

Archivo target: apps/sm-service/src/components/components.service.ts

Cambios requeridos:
1. En addComponent(): después de validar plan/addon, llamar pcClient.getBillingComponent()
2. Extraer del resultado: fee, pay_in_advance, billing_cycle, currency, charges[]
3. Pasar el pricing snapshot a repository.create() junto con el DTO existente
4. Establecer pricing_source = 'cloned'
5. Crear método privado buildPricingSnapshot(billingComponent) para la extracción
6. Aplicar la misma lógica en bulkAddComponents()
7. Inyectar ProductCatalogClient en ComponentsService si no está inyectado

Prerequisito: Story 45.1 debe estar completa (campos en el schema).
```

---

## PASO 6 — Ejecutar Story 45.3 (BillingDataRealService lee de suscripción)

**Workflow:** `/bmad:bmm:workflows:dev-story`

**Prompt a usar:**
```
Ejecuta la Story 45.3: BillingDataRealService — read pricing from subscription with PC fallback.

Archivo target: apps/sm-service/src/billing-integration/services/billing-data-real.service.ts

Cambios requeridos:
1. En getBillingData(): ELIMINAR la llamada paralela a fetchBillingComponentSafely(componentId)
2. CONSTRUIR el DTO billing_component desde los campos clonados en el componente de suscripción
3. FALLBACK a PC solo cuando component.pricing_source === null (datos legacy sin backfill)
4. Usar component.pay_in_advance directamente (no desde billingComponentResult)
5. ELIMINAR PC de la lista failedServices cuando pricing_source existe
6. Crear método privado buildBillingComponentFromSubscription(component)
7. PRESERVAR estructura idéntica de ComponentChargesDto — cero breaking changes para Billing-Service

Prerequisito: Stories 45.1 y 45.2 deben estar completas.
```

---

## PASO 7 — Ejecutar Story 45.4 (Backfill Script)

**Workflow:** `/bmad:bmm:workflows:dev-story`

**Prompt a usar:**
```
Ejecuta la Story 45.4: Backfill script para suscripciones existentes.

Archivo a crear: apps/sm-service/scripts/backfill-component-pricing.ts

Comportamiento requerido:
- Leer todos los SubscriptionComponents donde pricing_source IS NULL
- Para cada uno, llamar PC: GET /api/v1/billing-components/{plan_id|add_on_id}
- Escribir campos de pricing + pricing_source = 'cloned'
- Procesar en batches de 50 con 100ms de rate limiting entre batches
- Diseño idempotente: se puede re-ejecutar sin duplicar datos
- Tolerante a errores: loguear fallos y continuar con el siguiente

Orden de deployment una vez tenga las 3 stories anteriores:
1. Deploy migración Prisma (columnas nuevas)
2. Deploy addComponent() con clonado
3. Ejecutar este backfill script
4. Deploy BillingDataRealService (lee de suscripción)
5. Monitorear logs — PC fallback no debe invocarse en subscriptions con pricing_source
```

---

## PASO 8 — Ejecutar Story 45.5 (Tests)

**Workflow:** `/bmad:bmm:workflows:dev-story`

**Prompt a usar:**
```
Ejecuta la Story 45.5: Unit + integration tests para cloning y billing flow.

Tests unitarios — ComponentsService:
- Clona fee, pay_in_advance, billing_cycle, currency, charges desde PC
- Clona add_on amount como fee
- Establece pricing_source = 'cloned'
- Maneja charges array vacío
- bulkAddComponents() clona individualmente

Tests unitarios — BillingDataRealService:
- Construye billing_component desde pricing clonado
- NO llama a PC cuando pricing_source existe
- Fallback a PC cuando pricing_source es null
- Response structure idéntica a la anterior (sourced from PC)

Tests E2E:
- Flujo completo: crear suscripción → pricing clonado → billing-data retorna clonado
- Cambio de precio en PC NO afecta suscripción existente (regression test crítico)
- Nueva suscripción después de cambio de precio obtiene precio nuevo
- Cobertura >80% en código nuevo
```

---

## PASO 9 — Code Review

**Workflow:** `/bmad:bmm:workflows:code-review`

**Prompt a usar:**
```
Realiza un code review adversarial del Epic 45 implementado.

Stories revisadas: 45.1, 45.2, 45.3, 45.4, 45.5
Servicios: SM-Service (NestJS/Prisma)

Criterios de éxito a validar:
1. Nuevas suscripciones tienen pricing clonado desde PC
2. billing-data endpoint retorna pricing desde suscripción, no desde PC
3. Cambio de precio en PC NO afecta suscriptores existentes
4. Zero breaking changes para Billing-Service — payload structure idéntica
5. Cobertura de tests >80% en código nuevo
6. Script de backfill es idempotente y tolerante a errores
7. PC fallback funciona correctamente para datos legacy (pricing_source IS NULL)
```

---

## PASO 10 (Fase B) — Stories 45.6, 45.7, 45.8

Solo iniciar **después de que Fase A esté en producción y estable**.

**Workflow por cada story:** `/bmad:bmm:workflows:dev-story`

| Story | Acción |
|-------|--------|
| 45.6 | PATCH endpoint pricing override — usar prompt del proposal Section 4 / Proposal 4 |
| 45.7 | POST endpoint pricing reset — reclona desde PC, sets pricing_source = 'cloned' |
| 45.8 | Admin Portal UI — visualización y override de pricing por suscripción |

---

## Notas de Deployment

```
Orden obligatorio para Fase A:
1. Prisma migration  (45.1)
2. addComponent() clone  (45.2)
3. Backfill script  (45.4)
4. BillingDataRealService  (45.3)
5. Tests en CI  (45.5)
```

> **IMPORTANTE:** No desplegar 45.3 antes del backfill (45.4), o suscripciones legacy
> sin pricing_source quedarán sin fallback hasta que el backfill termine.

---

*Generado por BMad Master — basado en sprint-change-proposal-2026-04-09.md*
