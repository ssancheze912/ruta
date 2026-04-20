"""Delete all Jira issues listed in a bmad_state_*.json file."""
import json
import os
import sys
import base64
import urllib.request
import urllib.error

STATE_FILE = r"C:\Users\ssancheze\Desktop\Dev\ruta\_bmad-output\implementation-artifacts\quality-process\diseno\test-design-2026-04-14-200000\bmad_state_BMAD.json"
JIRA_BASE = "https://siesa-test-sandbox.atlassian.net"
JIRA_USER = "ssancheze@siesa.com"

def get_token():
    token = os.environ.get("JIRA_API_TOKEN", "")
    if not token:
        print("ERROR: set JIRA_API_TOKEN env var first")
        sys.exit(1)
    return token

def delete_issue(key, auth_header):
    url = f"{JIRA_BASE}/rest/api/3/issue/{key}?deleteSubtasks=true"
    req = urllib.request.Request(url, method="DELETE")
    req.add_header("Authorization", auth_header)
    req.add_header("Accept", "application/json")
    try:
        with urllib.request.urlopen(req) as r:
            print(f"  DELETED {key} ({r.status})")
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  FAILED  {key} — HTTP {e.code}: {body[:200]}")
        return False

def main():
    token = get_token()
    creds = base64.b64encode(f"{JIRA_USER}:{token}".encode()).decode()
    auth = f"Basic {creds}"

    with open(STATE_FILE, encoding="utf-8") as f:
        state = json.load(f)

    # Collect all Jira keys to delete
    keys = []
    for k in state.get("test_cases", {}).values():
        keys.append(k)
    for k in state.get("plans", {}).values():
        keys.append(k)
    for k in state.get("executions", {}).values():
        keys.append(k)
    for k in state.get("stories", {}).values():
        keys.append(k)

    print(f"Deleting {len(keys)} issues from {JIRA_BASE}...")
    ok = 0
    fail = 0
    for key in keys:
        if delete_issue(key, auth):
            ok += 1
        else:
            fail += 1

    print(f"\nDone: {ok} deleted, {fail} failed")

    if fail == 0:
        # Reset state file
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f)
        print("State file reset to {}")

if __name__ == "__main__":
    main()
