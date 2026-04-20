# Aprovechamiento del Pipeline CI — Guía Práctica

> Qué hacer con todo lo que generó el workflow `[CI]` de TEA para sacarle el máximo valor al equipo.

---

## Lo que tenemos disponible

| Artefacto | Ubicación |
|---|---|
| Pipeline principal | `.github/workflows/test.yml` |
| Script de tests selectivos | `scripts/test-changed.sh` |
| Script de CI local | `scripts/ci-local.sh` |
| Script de burn-in standalone | `scripts/burn-in.sh` |
| Documentación del pipeline | `docs/ci.md` |
| Checklist de secrets | `docs/ci-secrets-checklist.md` |

---

## 1. Activación inicial (hacer una sola vez)

### 1.1 Configurar secrets en GitHub/GitLab

Abrir `docs/ci-secrets-checklist.md` y configurar cada secret en la plataforma CI antes de hacer el primer push. Sin esto el pipeline falla en el primer intento.

**En GitHub:** Settings → Secrets and variables → Actions → New repository secret

### 1.2 Primer push y validación

```bash
git add .github/workflows/test.yml scripts/ docs/
git commit -m "ci: add test pipeline with burn-in and sharding"
git push
```

Abrir un PR hacia `develop` o `main` y observar el primer run. Verificar que los 4 stages aparecen: **lint → test → burn-in → report**.

### 1.3 Ajustar sharding según el tiempo real

Observar cuánto tarda cada shard en el primer run:
- Si cada shard tarda **menos de 3 min** → bajar a 2 shards (la suite es pequeña)
- Si cada shard tarda **más de 10 min** → subir a 6-8 shards
- Objetivo: **cada shard < 10 minutos**

---

## 2. Rutina diaria del desarrollador

### Antes de hacer push — tests selectivos

```bash
./scripts/test-changed.sh
```

Corre solo los tests afectados por los archivos que modificaste. 50-80% más rápido que la suite completa. Úsalo antes de cada push para tener feedback inmediato sin esperar el pipeline completo.

### Cuando algo falla en CI — reproducir en local

```bash
./scripts/ci-local.sh
```

Replica exactamente lo que hace el pipeline: lint → test → burn-in (3 iteraciones en local vs 10 en CI). Si pasa aquí, el problema probablemente es de entorno o de timing en CI. Si falla igual, tienes el bug en local donde es fácil debuggear.

### Cuando sospechas un test flaky — confirmar antes de reportar

```bash
./scripts/burn-in.sh
```

Corre el test 10 veces seguidas. Si falla aunque sea una vez, es flaky y hay que arreglarlo antes de mergear. Una sola falla en 10 iteraciones ya es suficiente evidencia.

---

## 3. Rutina por PR

Cada PR hacia `develop` o `main` dispara automáticamente:

| Stage | Qué hace | Tiempo aprox |
|---|---|---|
| **Lint** | ESLint + Prettier — bloquea si hay errores de código | < 2 min |
| **Test** | Suite completa en 4 shards paralelos | < 10 min por shard |
| **Burn-in** | Corre los tests 10 veces para detectar flakiness | < 30 min |
| **Report** | Agrega resultados y publica el reporte HTML | < 2 min |

**Regla del equipo:** Un PR no se mergea si cualquier stage falla. No hay excepciones al lint ni al burn-in.

---

## 4. Qué hacer cuando un stage falla

### Falla el stage Lint

El error está en el código, no en los tests. Corregir localmente y pushear de nuevo:

```bash
npm run lint        # ver los errores exactos
npm run lint --fix  # corregir automáticamente lo que se pueda
```

### Falla el stage Test

1. Bajar los artifacts del run fallido desde la UI de GitHub/GitLab (se guardan automáticamente en fallo)
2. Los artifacts contienen: **traces de Playwright**, **screenshots** y **videos** del momento del fallo
3. Abrir el trace con:
   ```bash
   npx playwright show-trace test-results/trace.zip
   ```
4. El Trace Viewer muestra snapshot del DOM + red + consola en cada paso — identificar en qué acción exacta falló
5. Si no se reproduce en local → correr `./scripts/ci-local.sh` para descartar diferencias de entorno

### Falla el stage Burn-in

El test es flaky — pasa unas veces y falla otras. Pasos:

1. Ver en qué iteración falló (el log indica "🔥 Burn-in iteration X/10")
2. Correr localmente con más iteraciones para reproducirlo:
   ```bash
   ./scripts/burn-in.sh 20  # 20 iteraciones
   ```
3. Causas comunes: race condition, dependencia de datos de otro test, timing con animaciones CSS, hardcoded waits
4. **No mergear hasta que el burn-in pase limpio** — un test flaky en main contamina la confianza de toda la suite

---

## 5. Uso semanal — cron de burn-in

El pipeline tiene un job programado que corre el burn-in completo cada semana aunque no haya PRs. Sirve para detectar flakiness que aparece con el tiempo (datos acumulados, cambios de dependencias externas, etc.).

**Qué mirar los lunes en el reporte semanal:**
- ¿Hubo fallos en el cron de burn-in?
- ¿El tiempo promedio de los shards aumentó vs la semana anterior?
- Si aumentó más del 20% → hay tests nuevos que son lentos y hay que revisarlos con `[RV]`

---

## 6. Mantener el pipeline saludable

### Cuando se agrega un test nuevo

Correr burn-in del archivo nuevo antes de mergear para confirmar que no es flaky desde el inicio:

```bash
npx playwright test tests/e2e/nuevo-feature.spec.ts --repeat-each=10
```

### Cuando el pipeline empieza a tardar más de lo esperado

Señal de que hay tests lentos acumulados. Ejecutar `[RV]` de TEA sobre el directorio de tests:

```
/bmad:bmm:workflows:testarch-test-review
```

TEA detecta tests que superan los límites de tiempo (default: 60s por test) y genera recomendaciones para optimizarlos.

### Cuando se cambia la infraestructura de tests (fixtures, factories)

Correr el burn-in completo manualmente antes de hacer merge, ya que los cambios en fixtures afectan a todos los tests que los usan:

```bash
./scripts/burn-in.sh 10
```

### Cuando un test falla solo en CI pero pasa en local

Causas más frecuentes:
- El test depende de datos que existen en local pero no en CI → usar factories para crear los datos dentro del test
- El test hace `waitForTimeout` en lugar de esperar un evento real → reemplazar por `waitForSelector` o `waitForResponse`
- Diferencia de viewport o resolución → verificar que `playwright.config.ts` tiene viewport fijo
- Variables de entorno faltantes en CI → revisar `docs/ci-secrets-checklist.md`

---

## 7. Integrar el pipeline con el quality gate de TEA

El pipeline de CI y el workflow `[TR]` Trace de TEA se complementan directamente:

| Qué hace el CI | Qué hace `[TR]` Trace |
|---|---|
| Ejecuta los tests y reporta si pasan o fallan | Verifica que los tests cubren todos los AC de la historia/épica |
| Detecta tests flaky antes del merge | Detecta AC sin ningún test implementado |
| Genera el reporte JUnit con resultados de ejecución | Consume ese reporte JUnit como evidencia para la decisión de gate |

**Flujo correcto antes de un release:**

```
1. CI pipeline pasa (todos los tests verdes, burn-in limpio)
       ↓
2. Exportar el reporte de resultados del último CI run
       ↓
3. Ejecutar [TR] con gate_type: release
   → TEA lee el reporte JUnit generado por CI como evidencia
   → Emite decisión PASS / CONCERNS / FAIL
       ↓
4. Si PASS → release aprobado
   Si CONCERNS o FAIL → actuar según la decisión antes de deployar
```

El reporte JUnit se genera automáticamente en `test-results/junit.xml` en cada run. Es el archivo que TEA necesita como evidencia de ejecución.

---

## 8. Señales de que el pipeline necesita ajuste

| Señal | Qué hacer |
|---|---|
| Los shards tardan más de 15 min | Aumentar el número de shards o revisar tests lentos con `[RV]` |
| El burn-in falla más de una vez por semana | Hay tests flaky sistémicos — sesión de debugging con `[RV]` sobre la suite completa |
| Los artifacts de fallo ocupan más de 1 GB/mes | Reducir retención de 30 a 15 días, o pasar a retener solo traces (no videos) |
| El stage lint tarda más de 5 min | Revisar si se están lintando `node_modules` o archivos generados |
| El pipeline no se dispara en algunos PRs | Verificar que el branch pattern en el trigger del workflow incluye las ramas del equipo |
