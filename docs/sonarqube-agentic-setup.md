# SonarQube Agentic Analysis con Claude Code

Guía paso a paso para implementar el ciclo **Guide → Generate → Verify** en este proyecto
(backend C# .NET + frontend TypeScript/React).

Basado en: [SonarSource/getting-started-agentic-analysis-claude-code](https://github.com/SonarSource/getting-started-agentic-analysis-claude-code)

---

## Tabla de contenidos

1. [Qué hace esto y por qué importa](#1-qué-hace-esto-y-por-qué-importa)
2. [Prerrequisitos](#2-prerrequisitos)
3. [Paso 1 — Token de SonarQube](#3-paso-1--token-de-sonarqube) ✅
4. [Paso 2 — Registrar el servidor MCP](#4-paso-2--registrar-el-servidor-mcp) ✅
5. [Paso 3 — Verificar conectividad](#5-paso-3--verificar-conectividad) ✅
6. [Paso 4 — Agregar CLAUDE.md](#6-paso-4--agregar-claudemd) ✅
7. [Paso 5 — Instalar los skills](#7-paso-5--instalar-los-skills) ✅
8. [Cómo usar el ciclo en el día a día](#8-cómo-usar-el-ciclo-en-el-día-a-día)
9. [Referencia de herramientas por lenguaje](#9-referencia-de-herramientas-por-lenguaje)

---

## 1. Qué hace esto y por qué importa

Sin esta integración, Sonar detecta problemas **después** de hacer push — el ciclo de feedback
es lento. Con el servidor MCP de SonarQube, Claude Code puede:

| Fase | Herramienta | Qué hace |
|------|-------------|----------|
| **Guide** | `get_guidelines`, `get_current_architecture`, `get_type_hierarchy` | Carga las reglas Sonar de tu proyecto y la estructura del código **antes** de escribir |
| **Generate** | Claude escribe el código | Genera código ya consciente de las reglas |
| **Verify** | `run_advanced_code_analysis` | Ejecuta el mismo análisis que CI, con contexto cruzado entre archivos |

El resultado: issues detectados y corregidos **en la misma sesión**, antes de cualquier push.

---

## 2. Prerrequisitos

- [x] **Docker Desktop** corriendo en tu máquina (el servidor MCP es un contenedor)
- [x] **Cuenta SonarQube Cloud** con el proyecto ya analizado (`ssancheze912_ruta`)
- [x] **Organization ID** y **Project Key** — guardados en `.sonarqube.credentials`
- [x] **Claude Code CLI** instalado

> Para este proyecto: el backend está en C# (.NET) y el frontend en TypeScript/React.
> Ambos lenguajes son soportados por el servidor MCP.

---

## 3. Paso 1 — Token de SonarQube ✅

Genera un **user token** (no organization token) en SonarQube Cloud:

1. Ir a **My Account → Security → Generate Tokens**
2. Crear token de tipo **User Token**
3. Copiar el valor — solo se muestra una vez

Agregar el token al perfil de shell (persiste entre sesiones):

```bash
# En Git Bash / WSL / zsh
echo 'export SONARQUBE_TOKEN="squ_tutoken..."' >> ~/.bashrc && source ~/.bashrc
```

O solo para la sesión actual:

```bash
export SONARQUBE_TOKEN="squ_tutoken..."
```

---

## 4. Paso 2 — Registrar el servidor MCP ✅

Ejecutar este comando **desde el directorio raíz del proyecto**.
Reemplazar `TU_ORG_ID` y `TU_PROJECT_KEY` con los valores reales:

```bash
claude mcp add sonarqube -s user \
  -e SONARQUBE_URL=https://sonarcloud.io \
  -e SONARQUBE_ORG=TU_ORG_ID \
  -e SONARQUBE_PROJECT_KEY=TU_PROJECT_KEY \
  -e SONARQUBE_TOOLSETS=cag,projects,analysis \
  -- docker run -i --rm --pull=always \
  -e SONARQUBE_URL -e SONARQUBE_TOKEN \
  -e SONARQUBE_ORG -e SONARQUBE_PROJECT_KEY \
  -e SONARQUBE_TOOLSETS \
  -v "$(pwd):/app/mcp-workspace:rw" mcp/sonarqube
```

La opción `-s user` registra el servidor a nivel de usuario, disponible en cualquier sesión
de Claude Code para este proyecto.

**Verificar que quedó registrado:**

```bash
claude mcp list
```

Deberías ver `sonarqube` en la lista.

### Referencia de configuración (`~/.claude/mcp.json`)

```json
{
  "mcpServers": {
    "sonarqube": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm", "--pull=always",
        "-e", "SONARQUBE_URL",
        "-e", "SONARQUBE_TOKEN",
        "-e", "SONARQUBE_ORG",
        "-e", "SONARQUBE_PROJECT_KEY",
        "-e", "SONARQUBE_TOOLSETS",
        "-v", "${PWD}:/app/mcp-workspace:rw",
        "mcp/sonarqube"
      ],
      "env": {
        "SONARQUBE_URL": "https://sonarcloud.io",
        "SONARQUBE_TOKEN": "${SONARQUBE_TOKEN}",
        "SONARQUBE_ORG": "TU_ORG_ID",
        "SONARQUBE_PROJECT_KEY": "TU_PROJECT_KEY",
        "SONARQUBE_TOOLSETS": "cag,projects,analysis"
      }
    }
  }
}
```

> `SONARQUBE_TOKEN` se lee del entorno en runtime — nunca hardcodear en el JSON.

---

## 5. Paso 3 — Verificar conectividad ✅

Abrir Claude Code en el directorio del proyecto y escribir:

```
What SonarQube tools do you have available? List them.
```

La respuesta debe incluir: `get_guidelines`, `get_current_architecture`, `run_advanced_code_analysis`, y otros.

Si no aparecen:
- Verificar que Docker está corriendo
- Ejecutar `claude mcp list` para confirmar el registro
- Revisar que `SONARQUBE_TOKEN` está seteado en el entorno

---

## 6. Paso 4 — Agregar CLAUDE.md ⬜ pendiente

Agregar el siguiente bloque al `CLAUDE.md` del proyecto (loop autónomo completo — Fase 3):

```markdown
# SonarQube Integration — Autonomous Mode

## Before Writing Any Code

When implementing a new feature, adding a class, or making a significant
change to an existing class:

1. Call `get_guidelines` with:
   - `mode: "combined"`
   - `categories`: relevant categories for the code being written:
     - For C# backend: "Code Complexity & Maintainability", "Naming Conventions & Code Style",
       "Exception/Error Handling", "Type System & Generics"
     - For TypeScript/React frontend: "Code Complexity & Maintainability",
       "Naming Conventions & Code Style", "REST API Development",
       "Web Security (XSS, CSRF, Injection)", "Authentication & Authorization"
   - `languages`: `["csharp"]` for backend files, `["typescript"]` for frontend files

2. When adding to or modifying an existing class, call the relevant
   architecture tools:
   - `get_current_architecture(depth=1)` — entender estructura de módulos/paquetes
   - `get_type_hierarchy(fqn)` — entender herencia e implementaciones
   - `get_references(fqn)` — entender quién usa la clase (blast radius)

## After Writing or Modifying Any Source File

After every source file modification:

1. Call `run_advanced_code_analysis` on the modified file with:
   - `filePath`: ruta relativa al proyecto
   - `branchName`: el branch git actual
   - `fileScope`: `["MAIN"]` para código de producción, `["TEST"]` para tests

2. If issues are found:
   a. Note the rule key (e.g., `csharpsquid:S1172`)
   b. Fix the issue
   c. Re-run `run_advanced_code_analysis` on the same file
   d. Repeat until no BLOCKER, CRITICAL, or MAJOR issues remain

3. Only proceed to the next file after the current file is clean.

## Completion Criteria

Never declare a task complete until:
- All modified files have been analysed
- None have BLOCKER, CRITICAL, or MAJOR issues
- The final analysis shows a clean result for every modified file
```

---

## 7. Paso 5 — Instalar los skills ⬜ pendiente

Los skills son slash commands reutilizables que encapsulan el flujo correcto.

```bash
# Crear el directorio si no existe
mkdir -p ~/.claude/commands
```

### `/sonar-verify` — verificación rápida post-edición

```bash
cat > ~/.claude/commands/sonar-verify.md << 'EOF'
# /sonar-verify

Run SonarQube advanced code analysis on the current staged or modified files
and report a pass/fail result with issue details.

## Steps

1. Run `git diff --name-only HEAD` and `git diff --name-only --cached`, combine and deduplicate.

2. If no modified files found, report "No modified files to verify."

3. For each modified source file (.cs, .ts, .tsx, .js):
   - Call `run_advanced_code_analysis` with:
     - `filePath`: project-relative path
     - `branchName`: current git branch
     - `fileScope`: `["MAIN"]` for production code, `["TEST"]` for test files

4. Report result per file:
   ✓ PASS — path/to/File.cs (0 issues)
   ✗ FAIL — path/to/File.cs (2 issues)
     [MAJOR] Line 45: csharpsquid:S1172 — description

5. Final status: PASS (0 issues) or FAIL with file count.
EOF
```

### `/sonar-scan` — escaneo completo con guidelines

```bash
cat > ~/.claude/commands/sonar-scan.md << 'EOF'
# /sonar-scan

Fetch SonarQube guidelines for current files, run analysis, report summary.

## Steps

1. Identify modified files in this session.

2. Call `get_guidelines` with:
   - `mode: "combined"`
   - `file_paths`: list of modified files
   - `languages`: inferred from extensions (`["csharp"]` for .cs, `["typescript"]` for .ts/.tsx)

3. For each modified file, call `run_advanced_code_analysis`.

4. Report:
   - Issue count by severity (BLOCKER, CRITICAL, MAJOR, MINOR, INFO)
   - Per issue: file, line, rule key, message, explanation
   - Overall pass/fail (pass = 0 BLOCKER/CRITICAL/MAJOR)

5. If BLOCKER or CRITICAL issues found, offer to fix immediately.
EOF
```

### `/sonar-review` — revisión completa pre-PR

```bash
cat > ~/.claude/commands/sonar-review.md << 'EOF'
# /sonar-review

Full pre-PR SonarQube review. Fetches guidelines, runs analysis on all changed
files, summarises issues by severity, suggests fixes.

## Steps

1. Determine base branch (default: `main`).

2. `git diff --name-only main...HEAD` — lista de archivos cambiados.

3. Infer languages from extensions.

4. Call `get_guidelines` with `mode: "combined"`, all changed files, inferred languages.

5. Call `run_advanced_code_analysis` on each changed source file.

6. Print structured report:
   ## Pre-PR SonarQube Review
   Files analysed: N | Total issues: N (N blocker, N critical, N major, N minor, N info)

   ### BLOCKER (must fix before merge)
   - path/File.cs:45  csharpsquid:SXXXX  Description
     Fix: [specific suggestion]

   ### CRITICAL / MAJOR / MINOR / INFO
   ...

   ## Summary: [READY TO MERGE / NOT READY]

7. Offer auto-fix for BLOCKER and CRITICAL issues.
8. After fixes, re-run analysis to confirm clean.
EOF
```

O copiar directamente al proyecto para compartirlos con el equipo via git:

```bash
mkdir -p .claude/commands
cp ~/.claude/commands/sonar-verify.md .claude/commands/
cp ~/.claude/commands/sonar-scan.md .claude/commands/
cp ~/.claude/commands/sonar-review.md .claude/commands/
```

---

## 8. Cómo usar el ciclo en el día a día

### Nivel 1 — Solo verificación (mínimo esfuerzo)

Después de escribir código, pedir análisis manualmente:

```
Acabo de modificar backend/src/SiesaAgents.API/Controllers/AgentsController.cs.
Corre un análisis Sonar y dime qué issues encontró.
```

O usar el skill:
```
/sonar-verify
```

### Nivel 2 — Guidelines antes de escribir

Antes de implementar una nueva feature:

```
Antes de escribir código, llama get_guidelines para C# con las categorías
"Code Complexity & Maintainability", "Naming Conventions & Code Style" y
"Exception/Error Handling". Luego implementa [descripción de la feature].
```

O usar:
```
/sonar-scan
```

### Nivel 3 — Loop autónomo completo (recomendado con CLAUDE.md configurado)

Solo describir la tarea — Claude ejecuta el ciclo automáticamente:

```
Implementa el endpoint POST /api/agents/{id}/execute según las specs en docs/story-X.md
```

Claude llamará `get_guidelines` → escribirá código → llamará `run_advanced_code_analysis` →
corregirá issues → repetirá hasta que el archivo esté limpio → reportará resultado final.

### Antes de abrir un PR

```
/sonar-review
```

---

## 9. Referencia de herramientas por lenguaje

### C# (backend)

| Herramienta | Disponible | Uso |
|-------------|-----------|-----|
| `get_guidelines` | ✅ | `languages: ["csharp"]` |
| `get_current_architecture` | ✅ | Estructura de namespaces y módulos |
| `get_type_hierarchy` | ✅ | Herencia e implementaciones de interfaces |
| `get_references` | ✅ | Quién usa una clase — blast radius de cambios |
| `get_downstream_call_flow` | ❌ | Solo Java |
| `search_by_signature_patterns` | ❌ | Solo Java |
| `run_advanced_code_analysis` | ✅ | Análisis CI-level en archivos `.cs` |

### TypeScript/React (frontend)

| Herramienta | Disponible | Uso |
|-------------|-----------|-----|
| `get_guidelines` | ✅ | `languages: ["typescript", "javascript"]` |
| `get_current_architecture` | ✅ | Estructura de módulos (usa `:` como separador de FQN) |
| `get_type_hierarchy` | ✅ | Herencia de clases e interfaces TS |
| `get_references` | ✅ | Quién importa un módulo o clase |
| `get_downstream_call_flow` | ❌ | Solo Java |
| `run_advanced_code_analysis` | ✅ | Análisis en archivos `.ts`, `.tsx` |

### Categorías de guidelines recomendadas para este proyecto

**Backend C#:**
- `"Code Complexity & Maintainability"` — complejidad cognitiva, estructuras de loops
- `"Naming Conventions & Code Style"` — convenciones de nombres C#
- `"Exception/Error Handling"` — manejo correcto de excepciones
- `"Type System & Generics"` — uso correcto de genéricos

**Frontend TypeScript:**
- `"Code Complexity & Maintainability"` — complejidad, nesting profundo
- `"Naming Conventions & Code Style"` — convenciones TS
- `"REST API Development"` — patrones de consumo de APIs
- `"Web Security (XSS, CSRF, Injection)"` — seguridad en cliente
- `"Authentication & Authorization"` — manejo de tokens y sesiones
