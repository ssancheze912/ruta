# Playwright + TEA + MCP — Valor para un equipo de calidad

> Qué problemas resuelven, qué capacidades dan, y cómo mejorar el trabajo diario de un equipo QA.

---

## El problema que resuelven en conjunto

Los equipos de calidad normalmente enfrentan estos cuellos de botella:

- Las pruebas manuales no escalan con la velocidad del equipo de desarrollo
- Los bugs llegan a producción porque los tests se escriben tarde o nunca
- No hay visibilidad de qué está cubierto y qué no
- Cada release es un evento de riesgo porque no se sabe qué puede romper
- Los tests automatizados se vuelven frágiles y nadie los mantiene
- El QA es el último eslabón, no un participante activo desde el inicio

**TEA** y el **MCP de Playwright** atacan cada uno de estos puntos desde ángulos distintos y complementarios.

---

## 1. Escribir tests antes de que el dev empiece (ATDD)

**Problema:** El QA prueba al final, cuando cambiar algo ya es costoso.

**Qué hace:** TEA genera tests automatizados que fallan a propósito antes de que el desarrollador escriba una sola línea de código. El dev sabe exactamente qué tiene que construir para que los tests pasen.

**Valor:**
- Los bugs se detectan en la etapa más barata: antes de que existan
- El desarrollador tiene una definición de "hecho" objetiva y ejecutable
- El QA deja de ser un filtro al final y pasa a ser un co-diseñador desde el inicio
- Los requisitos ambiguos se vuelven visibles antes de implementar — un requisito que no se puede convertir en test es un requisito incompleto

---

## 2. Saber exactamente qué está cubierto y qué no (Trazabilidad)

**Problema:** No hay forma clara de responder "¿estamos listos para liberar?" con datos, no con intuición.

**Qué hace:** TEA genera una matriz de trazabilidad que conecta cada requisito funcional → épica → historia → caso de prueba. Para cada ítem indica si tiene cobertura, qué tipo de test lo cubre, y con qué nivel de riesgo.

**Valor:**
- Respuesta objetiva a "¿qué pasa si liberamos hoy?": PASS / CONCERNS / FAIL / WAIVED
- Se puede mostrar a producto, gerencia o cliente exactamente qué se probó
- Los gaps de cobertura dejan de ser sorpresas de último momento
- Cada decisión de liberar queda documentada con su justificación

---

## 3. Evaluar riesgo antes de cada release (Quality Gate)

**Problema:** No todos los bugs son iguales, pero se trata igual la pantalla de login que un campo opcional de configuración.

**Qué hace:** TEA aplica una matriz de scoring de riesgo (probabilidad × impacto) a cada funcionalidad. Los flujos críticos reciben cobertura profunda; las funcionalidades de bajo riesgo, cobertura básica. Antes del release, emite una decisión objetiva con el razonamiento documentado.

**Valor:**
- El esfuerzo de testing se concentra donde más importa
- Las excepciones al gate quedan firmadas y justificadas, no ignoradas
- Se reduce el tiempo de QA sin reducir la seguridad de los releases
- El equipo puede decir "sí, liberamos con riesgo conocido en X" en lugar de "esperamos que esté bien"

---

## 4. Explorar la app y encontrar bugs sin escribir código (MCP)

**Problema:** Explorar comportamientos complejos o reproducir bugs reportados toma tiempo y requiere configurar entornos.

**Qué hace:** El MCP de Playwright permite a Claude controlar el browser directamente — navegar, hacer clicks, llenar formularios, interceptar peticiones de red — en tiempo real, con instrucciones en lenguaje natural.

**Valor:**
- Un QA puede pedirle a Claude que reproduzca un bug descrito sin saber Playwright
- Se pueden explorar flujos completos de la app conversacionalmente
- La consola del browser, las peticiones de red y los errores se capturan automáticamente
- Ideal para smoke testing rápido antes de una demo o después de un deploy
- No requiere que el QA sepa programar para automatizar una verificación puntual

---

## 5. Tener una suite de tests que no se rompe con cada cambio de UI

**Problema:** Los tests automatizados fallan constantemente porque el HTML cambia y los selectores CSS dejan de funcionar.

**Qué hace:** TEA usa una knowledge base de selectores resilientes que priorizan atributos semánticos (`data-testid`, roles ARIA, texto visible) sobre estructuras de HTML frágiles. También incluye patrones de healing — estrategias para cuando un selector deja de funcionar.

**Valor:**
- Los tests sobreviven rediseños de UI sin necesidad de reescribirlos
- El equipo de frontend puede cambiar clases CSS o mover elementos sin romper la suite
- Menos tiempo manteniendo tests y más tiempo construyendo cobertura nueva
- Los tests se documentan solos: `getByRole('button', { name: 'Guardar' })` es autoexplicativo

---

## 6. Arrancar un proyecto desde cero con el framework correcto (Setup)

**Problema:** Configurar Playwright, CI, reportes, fixtures y patrones lleva días y el resultado no siempre es consistente.

**Qué hace:** TEA scaffolda un framework de testing completo en una sola sesión: estructura de directorios, configuración de Playwright, fixtures base, integración con CI (GitHub Actions, GitLab, Azure DevOps), reportes HTML y JUnit, y patrones de autenticación.

**Valor:**
- Un proyecto nuevo arranca con calidad desde el día uno
- Todo el equipo parte del mismo patrón — no hay cinco formas distintas de hacer lo mismo
- El CI/CD incluye quality gates reales, no solo "los tests pasaron"
- Los proyectos existentes pueden adoptarlo incrementalmente

---

## 7. Probar en todos los navegadores sin infraestructura adicional

**Problema:** "Funciona en Chrome pero no en Safari" aparece tarde porque probar en múltiples browsers manualmente es inviable.

**Qué hace:** Playwright corre la misma suite de tests en Chromium, Firefox y WebKit (Safari) en paralelo, incluyendo emulación de dispositivos móviles, sin necesidad de tener esos navegadores instalados o usar servicios de terceros pagos.

**Valor:**
- Cobertura cross-browser en cada PR sin costo adicional
- Los bugs específicos de Safari se detectan en desarrollo, no en producción
- Se puede emular iPhone, Pixel, iPad y docenas de dispositivos sin dispositivos físicos
- Un solo test cubre todos los navegadores — no hay que mantener suites separadas

---

## 8. Entender qué pasó cuando un test falla (Debugging y Trazas)

**Problema:** Un test falla en CI y nadie sabe por qué — no hay suficiente información para diagnosticar.

**Qué hace:** Playwright genera trazas que incluyen snapshots del DOM en cada paso, capturas de pantalla, registro de red y consola del browser. Se visualizan en el Trace Viewer con una línea de tiempo interactiva.

**Valor:**
- Cada fallo en CI viene con evidencia completa — no hay que reproducirlo manualmente
- Se reduce drásticamente el tiempo de diagnóstico de bugs intermitentes
- Las capturas y videos se adjuntan automáticamente a los reportes
- El QA puede compartir una traza con el dev para que entienda exactamente qué pasó

---

## 9. No repetir el login en cada test (Gestión de sesiones)

**Problema:** Los tests son lentos porque cada uno hace el flujo completo de login antes de lo que realmente quiere probar.

**Qué hace:** Playwright guarda el estado de autenticación (cookies, tokens, localStorage) en un archivo después del primer login y lo reutiliza en todos los tests. TEA genera los fixtures de auth para múltiples roles (admin, usuario, auditor, etc.).

**Valor:**
- Los tests son significativamente más rápidos al eliminar el login repetido
- Se pueden probar permisos de diferentes roles sin configuración manual
- Las sesiones se reutilizan entre CI runs si no han expirado
- Ideal para apps con SSO o flujos de autenticación complejos

---

## 10. Simular respuestas de API sin depender del backend (Mocking de red)

**Problema:** Los tests fallan o son lentos porque dependen de APIs externas, servicios de terceros o estados del servidor difíciles de reproducir.

**Qué hace:** Playwright intercepta las peticiones de red y puede responder con datos controlados — simular un error 500, una respuesta vacía, datos de un escenario específico — sin modificar el backend. También puede grabar respuestas reales y reproducirlas offline (HAR files).

**Valor:**
- Los tests no dependen de que el backend esté disponible o en el estado correcto
- Se pueden probar escenarios de error que son difíciles de reproducir con datos reales
- Los tests corren más rápido al evitar latencia de red
- Permite que el equipo de frontend testee antes de que el backend esté listo

---

## 11. Detectar problemas de accesibilidad automáticamente

**Problema:** La accesibilidad se verifica manualmente al final del proyecto, cuando corregirla es costoso.

**Qué hace:** TEA genera tests con axe-core que escanean cada pantalla automáticamente contra estándares WCAG, detectando problemas de contraste, etiquetas faltantes, estructura de headings incorrecta, y decenas de otras reglas.

**Valor:**
- Los problemas de accesibilidad se detectan en cada PR, no en una auditoría final
- La organización reduce el riesgo legal asociado a la accesibilidad
- El reporte muestra exactamente qué elemento falla y por qué
- Se puede configurar el nivel de conformidad requerido (WCAG 2.0 A, AA, AAA)

---

## 12. Medir el impacto de cambios en performance

**Problema:** La app se vuelve lenta gradualmente y nadie lo nota hasta que los usuarios se quejan.

**Qué hace:** TEA diseña tests de performance que miden Core Web Vitals (LCP, FCP, CLS), tiempos de navegación y uso de memoria en cada build. El workflow NFR Assessment evalúa si los criterios de performance son alcanzables con la arquitectura actual.

**Valor:**
- Las regresiones de performance se detectan en CI antes de llegar a producción
- Se establece una línea base medible — no "parece más lento" sino "aumentó 2s"
- Los criterios de performance son parte del quality gate, no un deseo opcional
- Se puede comparar performance entre browsers y dispositivos

---

## Resumen de valor por rol

| Rol | Principales beneficios |
|---|---|
| **QA Engineer** | Menos tiempo en pruebas manuales repetitivas, tests que no se rompen solos, evidencia de fallos lista para compartir |
| **QA Lead / Manager** | Visibilidad completa de cobertura, quality gates objetivos, métricas de calidad por sprint |
| **Tech Lead / Arquitecto** | Framework consistente en todos los proyectos, tests desde el inicio, CI/CD con gates reales |
| **Product Manager** | Respuesta objetiva a "¿podemos liberar?", riesgo documentado, trazabilidad de requisitos a tests |
| **Desarrollador** | Sabe exactamente qué construir (ATDD), feedback inmediato, no hay sorpresas al final del sprint |
| **Equipo de QA sin conocimiento de código** | MCP permite explorar y verificar la app conversacionalmente sin escribir Playwright |

---

## Lo que cambia en el proceso

| Antes | Con estas herramientas |
|---|---|
| QA prueba al final del sprint | QA define los criterios de aceptación al inicio |
| "Creo que está cubierto" | Matriz de trazabilidad con evidencia |
| Tests frágiles que nadie mantiene | Tests semánticos que sobreviven cambios de UI |
| Bug en producción → reproducción manual | Traza completa con todo lo que pasó |
| Release = evento de riesgo | Release con quality gate documentado |
| Explorar la app = sesión manual larga | Exploración conversacional con el MCP |
| Setup de Playwright = días | Framework completo en una sesión con TEA |
