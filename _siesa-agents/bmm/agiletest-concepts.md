# AgileTest — Definición de entidades

## Test Case (Caso de Prueba)
El escenario de prueba individual. Define **qué** se va a probar: título, prioridad, pasos (acción → resultado esperado). Es la unidad base de todo.

---

## Requirement (Requisito)
Una User Story o historia de usuario de Jira vinculada al test case. Su único propósito es **trazabilidad**: saber qué historia cubre cada caso de prueba y qué cobertura tiene cada historia. No defines nada especial, es cualquier issue de Jira (Task, Story, Bug) que enlazas con el link type "AgileTest / tests".

---

## Test Plan (PPR — Plan de Pruebas)
Agrupa test cases relacionados bajo un **objetivo de prueba**. Responde: "¿qué conjunto de TCs cubre esta feature/release?". No es ejecución — es solo la selección y organización de casos.

---

## Test Execution (PEP — Plan de Ejecución)
Es donde los testers **corren** los casos de prueba en un ciclo específico. Cada TC dentro de una ejecución tiene un estado: `TODO`, `PASS`, `FAIL`, `BLOCKED`, `SKIP`. Se puede tener múltiples ciclos (Ciclo 1, Ciclo 2, regresión, etc.) sobre el mismo Plan.

---

## Defect (Defecto)
Un issue Jira (tipo Bug) creado desde un TC fallido en una ejecución. Vincula el fallo de ejecución con el bug que lo causó.

---

## Flujo completo

```
Requirement (Story)
    └── vinculada a → Test Case(s)
                         └── agrupado en → Test Plan
                                              └── ejecutado en → Test Execution
                                                                    └── falla → Defect
```

Los defectos se crean manualmente cuando un TC falla durante las pruebas. El resto del flujo se genera automáticamente con `bmad_to_agiletest.py`.
