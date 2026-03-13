---
name: 'step-05-stories'
description: 'Synchronize Stories from markdown to Jira, linking to Parent Epics'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/sync-epics-stories'

# File References
thisStepFile: '{workflow_path}/steps/step-05-stories.md'
storiesFolder: '{output_folder}/implementation-artifacts/'
epicsFile: '{output_folder}/planning-artifacts/epics.md'
configFile: '{project-root}/_bmad-output/jira_docs/project_config.yaml'
workflowFile: '{workflow_path}/workflow.md'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

---

# Step 5: Story Synchronization

## STEP GOAL:

To read story files from `{storiesFolder}`, link them to Parent Epics (found in `epics.md`), check existence in Jira, create missing stories, and update documentation.

## MANDATORY EXECUTION RULES:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔒 **STRICT MCP ONLY:** You must ONLY use the provided MCP tools (`searchJiraIssuesUsingJql`, `createJiraIssue`, `addCommentToJiraIssue`).
- ⛔ **FORBIDDEN:** Do NOT use `fetch`, `curl`, or raw HTTP requests.

## EXECUTION SEQUENCE:

### 1. Pre-flight Validation (Parent Check)

1.  **Analyze Dependencies:**
    -   Scan all markdown files in `{storiesFolder}`.
    -   Extract all Parent Epic names/references.
    -   Check `{epicsFile}` for these links.
2.  **Verify Sync Status:**
    -   For each Parent Epic:
        -   Does it have a `[KEY-123]` (Jira Key) in the header?
        -   If NO: Mark as `Unsynced`.
3.  **Decision Gate:**
    -   If `Unsynced` count > 0:
        -   Display: "⚠️ CRITICAL: Found {{count}} Parent Epics that are not synced to Jira. Stories cannot be linked without Parent IDs."
        -   Display: "**Unsynced Epics detected:** {{List of Epics}}"
        -   **Prompt Menu:**
            -   **[S]** Sync Epics First (Required)
            -   **[E]** Exit Workflow
        -   **Handler [S]:** Load and execute `{workflow_path}/steps/step-04-epics.md` IMMEDIATELY. (Note: Step 4 will ask to Continue back to this step if scope allows, or you must restart).
        -   **Handler [E]:** Exit and terminate.
    -   If All Parents Synced: **PROCEED** to Load Data.

### 2. Load Data

- Read `{configFile}`.
- Get list of all `.md` files in `{storiesFolder}`.
- Read `{epicsFile}` (to lookup Parent Epic IDs).
- **CRITICAL:** Read the template payloads from `{project-root}/_bmad/bmm/workflows/sync-epics-stories/data/templates/` (`story-template.json`, `task-template.json`, and `subtask-template.json`).

### 3. Iterate and Sync

For each markdown file in `{storiesFolder}`:

1.  **Parse & Local Check (Prevention of Duplicates):**
    -   Read file content.
    -   **Check:** Does the file already contain a `**Jira Issue Key:**` [KEY-123] reference?
    -   **Condition A (Already Synced Locally):**
        -   If YES:
            -   **Log:** "Story {{StoryName}} already synced locally as {{KEY}}."
            -   **Extract:** The Jira Key (e.g., `KEY-123`) from the file to use in Step 6.
            -   **ACTION:** **SKIP** Steps 2, 3, and 4.
            -   **JUMP DIRECTLY** to **Step 6 (Sub-task Synchronization)**.
    -   **Condition B (Not Synced):**
        -   If NO: Proceed to Step 2.

2.  **Resolve Parent (If Condition B):**
    -   Find the parent Epic in `{epicsFile}` based on reference.
    -   Extract its **Jira Issue Key** (e.g., KEY-1).
    -   If no Key found: **SKIP Story** (Cannot link). Log failure.

3.  **Remote Idempotency Check (If Condition B):**
    -   Execute `searchJiraIssuesUsingJql`: `project = KEY AND issuetype in (Story, Historia) AND summary ~ "Story Name"`
    -   **Condition Found (Remote Exists):**
        -   If found:
            -   **Log:** "Story {{StoryName}} found in Jira as {{FoundKEY}}."
            -   **Set:** `{{KEY}}` = `{{FoundKEY}}`.
            -   **Update Action:** APPEND the Jira Information block to the end of the file. **DO NOT rewrite existing content.**
            -   **SKIP** Step 4 (Creation).
            -   **PROCEED** to **Step 6 (Sub-task Synchronization)**.
    -   **Condition Not Found:**
        -   Proceed to Step 4.

4.  **Creation (Atomic Transaction - If Condition Not Found):**
    -   Execute `createJiraIssue`. DO NOT use hardcoded JSON.
    -   You MUST format the JSON object using `story-template.json` that you loaded in Step 2.
    -   Extract the `{{Story ID}}` (e.g. "1.1") and `{{Story Name}}` from the Markdown file's main H1 header.
    -   Inject those, along with `{{user_story}}`, `{{acceptance_criteria}}`, `{{dev_notes}}`, and `{{Parent_Epic_Key}}` into the template payload.
    -   **Set:** `{{KEY}}` = New Issue Key.

5.  **Immediate File Persistence (CRITICAL):**
    -   **IMMEDIATELY** after obtaining the `key` (from Step 4):
    -   Update the story file **RIGHT NOW**.
    -   **Action:** Append the following block to the end of the file:

    ```markdown

    ## Jira Information

    **Jira Issue Key:** [{{KEY}}]({{jira_url}}/browse/{{KEY}})
    **Jira URL:** {{jira_url}}/browse/{{KEY}}
    **Status:** Synced
    ```

6.  **Sub-task Synchronization (Hierarchical Sync & Validation):**
    -   **Prerequisite:** Ensure we have a valid `{{KEY}}` for the Parent Story. If ID is missing, SKIP sub-tasks.
    -   **Goal:** Sync items from `## Tasks / Subtasks` to Jira as Sub-tasks, avoiding duplicates.
    -   **Action:**
        1.  **Parse Sync Table:** Read the `## Synced Tasks` table at the bottom of the file (if it exists).
            -   Create a list/set of *already synced tasks* by minimizing/normalizing the "Task Name" column.
        2.  **Locate Source Tasks:** Find `## Tasks / Subtasks` section.
            -   If missing: Log "No Tasks section". **CONTINUE** to next file.
        3.  **Iterate:** For each **Level 1 Bullet Point** (The Task) in the source list:
            -   **Validation (Idempotency):**
                -   Check: Is `{{Task Name}}` already present in the *already synced tasks* list?
                -   **If YES:** **SKIP** this task. Log "Task '{{Task Name}}' already synced."
                -   **If NO:** **PROCEED** to Create.
            -   **Create:** Execute `createJiraIssue` formatting the `task-template.json` loaded in Step 2.
                -   Remember to inject `{{Story ID}}` parsed from earlier, `{{Task Name}}`, and `{{project_key}}`.
            -   **Context:** If the task has nested items (indented bullets), combine them into a **simple markdown bulleted list** (ensuring no checklist `[ ]` syntax is used) and execute `addCommentToJiraIssue` formatting the `subtask-template.json` loaded in Step 2.
            -   **Persistence (Append Update):**
                -   **Immediately** append a new row to the `## Synced Tasks` table (create table header if it doesn't exist yet):
                ```markdown
                | {{Task Name}} | [{{SubTaskKey}}]({{url}}) | Synced | {{Date}} |
                ```
                *(Ensure the table structure is maintained)*

### 4. Report Results

Display summary: "Created: X, Skipped: Y, Failed: Z".

### 5. Present MENU OPTIONS

Display: "**Stories Synced - Select an Option:** [C] Finish"

#### Menu Handling Logic:

- IF C: Display "Workflow Complete. All artifacts synchronized." and exit.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Stories processed and linked to Epics
- No duplicates
- `stories.md` updated

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
