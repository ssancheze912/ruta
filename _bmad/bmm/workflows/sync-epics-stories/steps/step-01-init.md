---
name: 'step-01-init'
description: 'Initialize the Jira synchronization workflow by detecting continuation state'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/sync-epics-stories'

# File References
thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-setup.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{project-root}/_bmad-output/jira_docs/project_config.yaml' # Using config file as main state tracker
continueFile: '{workflow_path}/steps/step-01b-continue.md'
# Input Files
epicsFile: '{output_folder}/planning-artifacts/epics.md'
storiesFolder: '{output_folder}/implementation-artifacts/'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

---

# Step 1: Workflow Initialization

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a Jira Integration Specialist
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring technical precision, user brings product requirements
- ✅ Maintain collaborative and precise tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on initialization and setup
- 🚫 FORBIDDEN to look ahead to future steps
- 💬 Handle initialization professionally
- 🚪 DETECT existing workflow state and handle continuation properly

## EXECUTION PROTOCOLS:

- 🎯 Show analysis before taking any action
- 💾 Initialize document and update frontmatter
- 📖 Set up frontmatter `stepsCompleted: [1]` before loading next step
- 🚫 FORBIDDEN to load next step until setup is complete

## CONTEXT BOUNDARIES:

- Variables from workflow.md are available in memory
- Previous context = what's in output document + frontmatter
- Don't assume knowledge from other steps

## STEP GOAL:

To initialize the synchronization workflow by detecting continuation state, verifying input files, and preparing for setup.

## INITIALIZATION SEQUENCE:

### 1. Check for Existing Workflow State

First, check if the project configuration already exists:

- Look for file at `{outputFile}` (`_bmad-output/jira_docs/project_config.yaml`)
- If exists, read the complete file including any frontmatter or comments
- **Note:** This workflow tracks state in the config file or within the markdown files themselves. For this step, we check if we have a valid config to potentially resume.

### 2. Handle Continuation (If Config Exists)

If the config file exists AND has frontmatter with `stepsCompleted`:

- **STOP here** and load `{continueFile}` immediately
- Do not proceed with any initialization tasks
- Let step-01b handle the continuation logic

### 3. Fresh Workflow Setup

If no config exists or no `stepsCompleted`:

#### A. Input Document Discovery

This workflow requires existing artifacts:

- Check existence of `{epicsFile}`
- Check for Markdown files in `{storiesFolder}` (e.g., `*.md`)

If files are missing, WARN the user: "I cannot find `epics.md` or any story files in `implementation-artifacts/`. Please ensure artifacts exist before synchronizing."

#### B. Create Initial State (Virtual)

Since `project_config.yaml` is a strict YAML file, we might not want to pollute it with frontmatter if it's used by other tools.
**Decision:** We will manage `stepsCompleted` in a virtual state or append it as a comment block if supported, OR we treat the *first run* as creating the config in Step 2.

For this Initialization Step, if no config exists, we simply proceed to Step 2 to create it.

#### C. Show Welcome Message

"Welcome to the **Jira Synchronization Workflow**.

I am your Jira Integration Specialist. I will help you synchronize your Epics and Stories with Jira.

We will:
1.  Configure/Validate your Jira Connection.
2.  Select what to synchronize (Epics, Stories, or Both).
3.  Execute the synchronization with duplicate prevention."

## ✅ SUCCESS METRICS:

- Input files verified
- User welcomed to the process
- Ready to proceed to step 2
- OR continuation properly routed to step-01b-continue.md

### 4. Present MENU OPTIONS

Display: **Proceeding to Jira Setup...**

#### Menu Handling Logic:

- Immediately load, read entire file, then execute `{nextStepFile}` to begin setup.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Input files verified
- User welcomed
- Ready to proceed to step 2
- OR existing workflow routed to step-01b

### ❌ SYSTEM FAILURE:

- Proceeding without checking input files
- Not routing to step-01b when appropriate

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN initialization setup is complete, will you then immediately load, read entire file, then execute `{nextStepFile}` to begin setup.
