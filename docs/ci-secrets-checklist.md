# CI Secrets Checklist

## GitHub Actions — Required Setup

Configure these in: **Repository → Settings → Secrets and variables → Actions**

---

## Automatic Secrets (No Action Required)

| Secret | Status | Description |
|--------|--------|-------------|
| `GITHUB_TOKEN` | ✅ Auto-provisioned | Used by `publish.yml` for git operations |

---

## Optional Secrets

| Secret | Required For | How to Get |
|--------|-------------|------------|
| `SLACK_WEBHOOK` | Failure notifications | Create an Incoming Webhook in your Slack workspace |

---

## Environment Variables (Not Secrets)

These can be set as **Repository variables** (not secrets) since they are not sensitive:

| Variable | Value | Purpose |
|----------|-------|---------|
| `BASE_URL` | e.g. `https://staging.ruta.siesa.com` | Override Vite dev server URL for tests against a deployed env |

---

## How to Configure

### Adding a secret
1. Go to `https://github.com/ssancheze912/ruta/settings/secrets/actions`
2. Click **New repository secret**
3. Enter the name and value
4. Click **Add secret**

### Adding a repository variable
1. Go to the same page → **Variables** tab
2. Click **New repository variable**
3. Enter name/value → **Add variable**

---

## Security Best Practices

- [ ] Never commit secret values to the repository
- [ ] Use `${{ secrets.NAME }}` syntax in workflow YAML — never hardcode
- [ ] Rotate secrets if they are accidentally exposed
- [ ] Set artifact retention to 30 days max (already configured) — avoid long-lived sensitive logs
- [ ] Review which jobs have `permissions: write` — only grant what is needed
- [ ] `GITHUB_TOKEN` write permissions are scoped per-job in `publish.yml`

---

## Verify Secrets Are Working

After configuring secrets, trigger a workflow run and check:

- [ ] Pipeline starts without "secret not found" errors
- [ ] Artifact upload succeeds (no auth errors)
- [ ] (If Slack configured) Notification received on failure

---

**Checklist completed by:** ___________________
**Date:** ___________________
**Reviewer:** ___________________
