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
