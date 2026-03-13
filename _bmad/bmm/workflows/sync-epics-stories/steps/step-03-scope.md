---
name: 'step-03-scope'
description: 'Select synchronization scope (Epics, Stories, or Both)'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/sync-epics-stories'

# File References
thisStepFile: '{workflow_path}/steps/step-03-scope.md'
stepEpics: '{workflow_path}/steps/step-04-epics.md'
stepStories: '{workflow_path}/steps/step-05-stories.md'
outputFile: '{project-root}/_bmad-output/jira_docs/project_config.yaml'
workflowFile: '{workflow_path}/workflow.md'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

---

# Step 3: Scope Selection

## STEP GOAL:

To determine the scope of synchronization: Epics, Stories, or Both.

## MANDATORY EXECUTION RULES:

- 🛑 **STOP AND WAIT:** You MUST halt execution at the menu options. Do NOT proceed until the user explicitly selects an option.
- 🛑 **NO AUTO-PILOT:** Even if you "think" you know what the user wants based on available files, you MUST ask.
- 📖 **READ FIRST:** Read the complete step file before taking any action.

## EXECUTION SEQUENCE:

### 1. Present Options

"**Select Synchronization Scope:**

1.  **Epics Only** (Syncs `epics.md` -> Jira Epics)
2.  **Stories & Tasks** (Syncs `stories.md` -> Jira Stories & Sub-tasks, requires Parent Epics to exist)
3.  **Both** (Syncs Epics first, then Stories & Tasks)"

### 2. Handle Selection

**Logic:**

- **Option 1 (Epics):** Load `{stepEpics}`. Set next step after Epics to "Finish".
- **Option 2 (Stories):** Load `{stepStories}`.
- **Option 3 (Both):** Load `{stepEpics}`. Set next step after Epics to `{stepStories}` (Chain).

### 3. Present MENU OPTIONS

Display: "**Select Scope:** [1] Epics [2] Stories & Tasks [3] Both"

#### Menu Handling Logic:

- IF 1: Update frontmatter `target_scope: epics`, load `{stepEpics}`.
- IF 2: Update frontmatter `target_scope: stories`, load `{stepStories}`.
- IF 3: Update frontmatter `target_scope: both`, load `{stepEpics}` (and pass flag to chain next step).

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- User selection captured
- Correct next step loaded

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
