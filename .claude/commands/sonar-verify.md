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
