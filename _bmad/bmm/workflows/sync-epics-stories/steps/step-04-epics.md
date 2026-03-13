---
name: 'step-04-epics'
description: 'Synchronize Epics from markdown to Jira'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/sync-epics-stories'
# File References
thisStepFile: '{workflow_path}/steps/step-04-epics.md'
nextStepStories: '{workflow_path}/steps/step-05-stories.md'
epicsFile: '{output_folder}/planning-artifacts/epics.md'
configFile: '{project-root}/_bmad-output/jira_docs/project_config.yaml'
workflowFile: '{workflow_path}/workflow.md'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

---

# Step 4: Epic Synchronization

## STEP GOAL:

To read `epics.md`, check for existing Epics in Jira, create missing ones, and update the markdown file with synchronization status.

## MANDATORY EXECUTION RULES:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔒 **STRICT MCP ONLY:** You must ONLY use the provided MCP tools (`searchJiraIssuesUsingJql`, `createJiraIssue`).
- ⛔ **FORBIDDEN:** Do NOT use `fetch`, `curl`, or raw HTTP requests.

## EXECUTION SEQUENCE:

### 1. Load Data

- Read `{configFile}` to get `project_key` and `cloud_id`.
- Read `{epicsFile}`.
- **CRITICAL:** Read the epic template payload from `{project-root}/_bmad/bmm/workflows/sync-epics-stories/data/templates/epic-template.json`.

### 2. Iterate and Sync

For each Epic in the file:

1.  **Local Idempotency Check (CRITICAL):**
    -   Check if the Epic Title in the markdown ALREADY contains a Jira Key (e.g., `[PROJ-123]`).
    -   If found: **SKIP creation**. Log Key.
    -   If not found: Proceed to JQL check.

2.  **Remote Idempotency Check:**
    -   Execute `searchJiraIssuesUsingJql`: `project = KEY AND issuetype = Epic AND summary ~ "Epic Name"`
    -   If found: **SKIP creation**. Log Key. Update markdown with found key.
    -   If not found: **PROCEED**.

    3.  **Creation (Atomic Transaction):**

        -   Execute `createJiraIssue`. DO NOT use hardcoded JSON.
        -   You MUST format the JSON object using the `epic-template.json` file you loaded in Step 1.
        -   Extract the `{{Epic Number}}` (e.g., "1" from "Epic 1: Core Inventory Visibility...") and `{{Epic Name}}` from the Markdown.
        -   Inject those, along with `{{goal}}`, `{{description}}`, and `{{project_key}}` into the template payload.
        -   **Hierarchy Handling (CRITICAL):** Check `project_config.yaml` for `hierarchy_level_2_name`.
            -   **If present (Custom Hierarchy):** Search for this issue using JQL to get its Key. Inject that Key into `{{Parent_Key}}` in the template.
            -   **If absent (Standard Hierarchy):** Remove the `"parent": "{{Parent_Key}}"` property completely from the JSON payload before sending it to Jira.

        -   ⚠️ **CRITICAL CONSTRAINT:** `issueTypeName` MUST be exactly `"Epic"`. DO NOT translate to "Épica" or any other language. The API requires the English identifier.

4.  **Immediate File Persistence (CRITICAL):**
    -   **IMMEDIATELY** after obtaining the new `key` (or finding an existing one):
    -   Update `{epicsFile}` **RIGHT NOW**. Do not wait for the loop to finish.
    -   **Action:**
        1.  Append/Update the `[Key]` to the Epic Header in the file.
        2.  Append a "Jira Information" block at the end of the Epic section:
            ```markdown
            > **Jira Sync:** [{{KEY}}]({{jira_url}}/browse/{{KEY}}) | Status: Synced
            ```
    -   *Why?* This ensures that if the process fails at Epic #5, Epics #1-4 are safely saved.

### 3. Report Results

Display summary: "Created: X, Skipped: Y, Failed: Z".

### 4. Determine Next Step

- If `target_scope` was "Both", proceed to Stories.
- Else, Finish.

### 5. Present MENU OPTIONS

Display: "**Epics Synced - Select an Option:** [C] Continue"

#### Menu Handling Logic:

- IF C:
  - If scope == both: Load `{nextStepStories}`.
  - Else: Display "Workflow Complete" and exit.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All epics processed
- No duplicates created
- `epics.md` updated with IDs

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
