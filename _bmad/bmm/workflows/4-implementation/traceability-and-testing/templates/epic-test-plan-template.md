---
epic_id: "{{epic_id}}"
epic_title: "{{epic_title}}"
frs_covered: []
total_stories: 0
total_test_cases: 0
coverage_rate: 0
generated_date: "{{date}}"
---

# Plan de Pruebas: {{epic_id}} - {{epic_title}}

**Generado:** {{date}}
**Proyecto:** {{project_name}}

---

## Descripción General de la Épica

{{epic_description}}

**ID de Épica:** {{epic_id}}
**Título de Épica:** {{epic_title}}

---

## Requerimientos Funcionales Cubiertos

Esta épica aborda los siguientes Requerimientos Funcionales:

{{fr_list}}

---

## Objetivos de Prueba

Este plan de pruebas valida:

{{test_objectives}}

---

## Alcance

### Dentro del Alcance

{{in_scope_items}}

### Fuera del Alcance

{{out_of_scope_items}}

---

## Casos de Prueba por Historia

{{for each story in epic}}

### Historia {{story_id}}: {{story_title}}

**Descripción:** {{story_description}}

**Criterios de Aceptación:**

{{acceptance_criteria_list}}

**Casos de Prueba ({{test_case_count}}):**

| ID Prueba | Nombre Prueba | Prioridad | Tipo | Pasos | Resultado Esperado |
|-----------|---------------|-----------|------|-------|--------------------|
{{test_cases_table}}

**Análisis de Cobertura:**
- Criterios de Aceptación: {{acs_covered}}/{{total_acs}} cubiertos ({{ac_coverage_percent}}%)
- Casos de Prueba: {{test_case_count}}
- Distribución de Prioridad: {{high_count}} Alta, {{medium_count}} Media, {{low_count}} Baja

{{if gaps exist}}
⚠️ **Brechas de Prueba:**
{{gap_list}}
{{endif}}

{{end for}}

---

## Resumen de Cobertura

### Cobertura General de la Épica

- **Historias:** {{stories_with_tests}}/{{total_stories}} ({{story_coverage_percent}}%)
- **Criterios de Aceptación:** {{acs_covered}}/{{total_acs}} ({{ac_coverage_percent}}%)
- **Total de Casos de Prueba:** {{total_test_cases}}

### Distribución por Prioridad

- **Prioridad Alta:** {{high_priority_count}} casos de prueba
- **Prioridad Media:** {{medium_priority_count}} casos de prueba
- **Prioridad Baja:** {{low_priority_count}} casos de prueba

### Distribución por Tipo de Prueba

{{test_type_distribution}}

---

## Estrategia de Ejecución de Pruebas

### Orden de Ejecución

**Fase 1: Pruebas Fundamentales (Deben pasar primero)**

{{foundation_tests}}

**Fase 2: Pruebas de Funcionalidades**

{{feature_tests}}

**Fase 3: Casos Límite e Integración**

{{edge_case_tests}}

### Dependencias y Prerequisitos

**Dependencias Externas:**

{{external_dependencies}}

**Requisitos de Datos de Prueba:**

{{test_data_requirements}}

**Requisitos de Ambiente:**

{{environment_requirements}}

---

## Evaluación de Riesgos

### Áreas de Alto Riesgo

{{high_risk_areas}}

### Resumen de Brechas de Prueba

{{testing_gaps_summary}}

**Recomendaciones:**

{{recommendations}}

---

## Seguimiento de Ejecución de Pruebas

| ID Prueba | Estado | Ejecutado Por | Fecha | Resultado | Notas |
|-----------|--------|---------------|-------|-----------|-------|
{{for each test case}}
| {{test_id}} | ⬜ No Ejecutado | | | | |
{{end for}}

**Leyenda de Estados:**
- ⬜ No Ejecutado
- ✅ Pasó
- ❌ Falló
- ⏸️ Bloqueado
- ⏭️ Omitido

---

## Firmas de Aprobación

### Revisión del Plan de Pruebas

- **Autor:** Generado por workflow traceability-and-testing
- **Revisado por:** _______________________
- **Fecha de Revisión:** _______________________
- **Aprobado por:** _______________________
- **Fecha de Aprobación:** _______________________

### Firma de Ejecución de Pruebas

- **Líder de Pruebas:** _______________________
- **Fecha de Inicio de Ejecución:** _______________________
- **Fecha de Fin de Ejecución:** _______________________
- **Resultado General:** _______________________

### Resumen de Defectos

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| Crítica | | |
| Alta | | |
| Media | | |
| Baja | | |

---

## Notas y Comentarios

{{notes_section}}

---

## Documentos Relacionados

- **Mapa de Trazabilidad:** Ver `traceability-map.md`
- **Definición de Épica:** Ver `epics.md` - {{epic_id}}
- **Exportación Excel:** Ver `exports/traceability-and-test-plans.xlsx`
- **Todos los Planes de Prueba de Épicas:** Ver `epic-test-plans/INDEX.md`

---

*Generado por el workflow traceability-and-testing de BMAD6*
