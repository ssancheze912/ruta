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
