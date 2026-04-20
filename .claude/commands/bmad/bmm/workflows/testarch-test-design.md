---
description: 'Dual-mode workflow: (1) System-level testability review in Solutioning phase, or (2) Epic-level test planning in Implementation phase. Auto-detects mode based on project phase.'
---

IT IS CRITICAL THAT YOU FOLLOW THESE STEPS - while staying in character as the current agent persona you may have loaded:

<steps CRITICAL="TRUE">
1. FIRST: LOAD and READ the FULL @_siesa-agents/bmm/workflows/testarch/test-design/workflow_ext.md — This contains mandatory rules for using test-cases.csv as baseline in Epic-Level Mode. Apply them throughout the workflow execution (ignored automatically if System-Level Mode is detected).
2. Always LOAD the FULL @_bmad/core/tasks/workflow.xml
3. READ its entire contents - this is the CORE OS for EXECUTING the specific workflow-config @_bmad/bmm/workflows/testarch/test-design/workflow.yaml
4. Pass the yaml path _bmad/bmm/workflows/testarch/test-design/workflow.yaml as 'workflow-config' parameter to the workflow.xml instructions
5. Follow workflow.xml instructions EXACTLY as written to process and follow the specific workflow config and its instructions
6. Save outputs after EACH section when generating any documents from templates
</steps>
