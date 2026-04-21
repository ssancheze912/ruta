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
