---
name: 'step-02-setup'
description: 'Configure and validate Jira integration'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/sync-epics-stories'

# File References
thisStepFile: '{workflow_path}/steps/step-02-setup.md'
nextStepFile: '{workflow_path}/steps/step-03-scope.md'
outputFile: '{project-root}/_bmad-output/jira_docs/project_config.yaml'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

---

# Step 2: Jira Configuration & Setup

## STEP GOAL:

To configure the Jira integration by authenticating via MCP, validating project access, and saving the configuration file.

## MANDATORY EXECUTION RULES:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 📋 YOU ARE A JIRA INTEGRATION SPECIALIST
- 🔒 **STRICT MCP ONLY:** You must ONLY use the provided MCP tools. NO curl, NO fetch, NO custom API calls.

## EXECUTION SEQUENCE:

### 1. 🔒 PRE-FLIGHT CHECK: MCP Authentication

**CRITICAL FIRST STEP:** Before reading any files or configurations, verify we can talk to Jira.

**Action:** Execute MCP Tool `getAccessibleAtlassianResources`.

-   **FAILURE CONDITION:** If the tool fails, returns an error, or returns an empty list `[]`.
    -   **STOP IMMEDIATELY.**
    -   **Display Error:** "❌ **MCP Authentication Failed.** I cannot connect to Jira. Please ensure you are authenticated with the Atlassian MCP server."
    -   **Instruction:** "Run the following command to authenticate (copy and paste into your terminal/chat):"
    -   **Display:**
        ```bash
        /mcp auth mcp-atlassian
        ```
    -   **Display Info:**
        ```text
        ℹ  Note: Authentication requires completing an OAuth flow in your web browser.
           Follow the on-screen instructions provided by the CLI after running the command.
        ```
    -   **Instruction:** "After validating in the browser, please choose an option:"
    -   **Menu:**
        -   **[R] Retry Authentication:** Re-run the check (`getAccessibleAtlassianResources`).
        -   **[E] Exit:** Stop the workflow.
    -   **Logic:**
        -   **IF R:** Restart this Step 2 from the beginning.
        -   **IF E:** Terminate the workflow with a message: "Workflow aborted due to authentication failure."
    -   **DO NOT PROCEED** past this point without successful authentication.

-   **SUCCESS CONDITION:** If the tool returns a valid list of resources.
    -   Proceed to Section 2.

### 2. Check Existing Configuration

Check if `{outputFile}` exists.
- If YES: Read and Display current settings (Project Key, Cloud ID). Ask: "Do you want to use this configuration? [Y/N]"
- If NO: Proceed to setup.

### 3. Elicit Project Key

If not already known (from config), ask: "Please enter your Jira Project Key (e.g., PROJ, SCRUM):"

### 4. Validate Project Access

**Action:** Execute MCP Tool `getVisibleJiraProjects` with `cloudId` and search for `projectKey`.

- **Success:** Confirm Project Name and Key match.
- **Failure:** Stop and ask user to check permissions or key.

### 5. Save Configuration

Create/Update `{outputFile}` with:

```yaml
project_key: "{{project_key}}"
project_name: "{{project_name}}"
cloud_id: "{{cloud_id}}"
jira_url: "https://siesa-team.atlassian.net"
# stepsCompleted: [1, 2] # (Optional tracking)
```

### 6. Present MENU OPTIONS

Display: "**Configuration Complete - Select an Option:** [C] Continue to Scope Selection"

#### Menu Handling Logic:

- IF C: Save content to `{outputFile}`, load, read entire file, then execute `{nextStepFile}`.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Valid `project_config.yaml` created
- Access verified via MCP
- User confirmed configuration

### ❌ SYSTEM FAILURE:

- Creating config with invalid credentials
- Skipping MCP validation

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
