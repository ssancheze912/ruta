# Fase 3 — Registro AgileTest: El proceso

## ¿Qué es?

La Fase 3 del proceso de calidad QA transforma un diseño de pruebas técnico (documento markdown) en **artefactos reales dentro de Jira/AgileTest**, listos para que el equipo QA ejecute. Elimina la carga manual de registrar casos de prueba uno por uno.

---

## El problema que resuelve

Diseñar pruebas es solo la mitad del trabajo. El otro 50% es registrarlas en la herramienta: crear los Test Cases, armar los Planes de Prueba, vincular todo con los requisitos y generar los Planes de Ejecución. Con decenas o cientos de TCs, esto toma **días de carga manual** propensa a errores.

La Fase 3 lo hace en **~5 minutos, de forma automatizada y trazable**.

---

## Entrada → Salida

| Entrada (diseño en markdown) | Salida (artefactos en Jira/AgileTest) |
|---|---|
| Documento `test-design.md` | Test Cases con pasos estructurados |
| Features del producto | Planes de Prueba (PPR) por feature |
| Criterios de aceptación (Gherkin) | Steps de ejecución por TC |
| Stories de negocio clasificadas | Requisitos linkeados a TCs |
| Matriz de riesgos (P0/P1/P2/P3) | Planes de Ejecución (PEP) listos para asignar |

---

## Los 5 pasos del proceso

### 1. Seleccionar diseño
El sistema detecta automáticamente el diseño de pruebas más reciente y muestra un resumen: cuántos features, stories y TCs contiene. Si hay varios, el QA elige cuál registrar.

### 2. Validar credenciales (Pre-flight)
Antes de tocar Jira, verifica que las credenciales de acceso estén configuradas. Si falta alguna, el proceso se detiene y da instrucciones claras para obtenerlas.

### 3. Dry-run — Vista previa obligatoria
Simula la creación completa sin escribir nada en Jira. Muestra exactamente cuántos issues se crearán, con qué prioridades y en qué features. El equipo puede pedir detalle de cada TC antes de aprobar.

### 4. Gate de aprobación humana
**Nada se crea sin aprobación explícita del QA Lead.** Puede aprobar, ver más detalle, o cancelar. Este paso es no omisible por diseño.

### 5. Creación en AgileTest
Al aprobar, el proceso ejecuta en secuencia:
1. Autentica con las APIs de Jira y AgileTest
2. Crea los **Requisitos** (stories de negocio como Tasks)
3. Crea los **Test Cases** con prioridad (P0 crítico → P3 baja)
4. Agrega **Steps estructurados** a cada TC
5. Crea los **Planes de Prueba (PPR)** — uno por feature
6. Crea los **Planes de Ejecución (PEP)** — Ciclo 1 por feature
7. Genera todos los **links de trazabilidad** (TC → Requisito → PPR → PEP)
8. Guarda un archivo de estado para idempotencia

---

## Estructura de artefactos generados

```
Jira / AgileTest
│
├── Requisitos (uno por Story de negocio)
│   └── Linkeados a sus Test Cases
│
├── Test Cases (uno por fila de la Matriz 360°)
│   ├── Prioridad: P0 / P1 / P2 / P3
│   ├── Steps de ejecución estructurados
│   └── Links a Requisito + PPR + PEP
│
├── Planes de Prueba — PPR (uno por feature)
│   └── Agrupa todos los TCs del feature
│
└── Planes de Ejecución — PEP (uno por feature)
    └── Ciclo 1 listo para asignar al equipo
```

---

## Principios de diseño

| Principio | Descripción |
|---|---|
| **Humano en control** | Gate de aprobación obligatorio — la IA acelera, el humano autoriza |
| **Idempotente** | Re-ejecutar es seguro: el state file evita duplicados |
| **Trazabilidad completa** | Cada TC linkea a Requisito, PPR y PEP automáticamente |
| **Cero fricción** | Un solo comando genera cientos de links de trazabilidad |
| **Reversible** | El script incluye modo `--delete` para limpiar si se necesita |

---

## ¿Qué NO hace la Fase 3?

- No ejecuta los tests — eso es responsabilidad del equipo QA
- No modifica el código ni el diseño de pruebas
- No toca issues existentes en Jira
- No reemplaza el criterio del QA — amplifica su capacidad
