# Add GitHub Action to periodically update `achievements.json` and `ms-certifications.json`
Labels: automation,enhancement
Severity: Medium

Description:
Create a scheduled GitHub Action that periodically fetches the latest `achievements.json` and `ms-certifications.json` from a configurable upstream API endpoint and updates the files in the repository.

Motivation:
- Keep displayed achievements and Microsoft certifications current without manual edits.
- Provide traceable commits and easy rollback via normal Git history.

Suggested Implementation:
- Add `.github/workflows/sync-data.yml` that runs on a schedule (e.g., daily) and on manual workflow_dispatch.
- Steps:
  1. `actions/checkout@v4`
  2. Fetch two endpoints (configurable via repository secrets or workflow inputs) and write to `data/achievements.json` and `data/ms-certifications.json`.
  3. If files changed, commit and push using the GitHub token (e.g., `GITHUB_TOKEN`).
  4. Optional: create a pull request instead of pushing directly, or tag commits with `[sync]` prefix.

Security/Operational Notes:
- Store upstream endpoint and any auth tokens as repository secrets.
- Validate JSON shape and run a small JSON schema or basic sanity checks before committing.
- Rate-limit and backoff if upstream responds with 429/5xx.

Acceptance Criteria:
- A workflow file exists at `.github/workflows/sync-data.yml`.
- The action updates `data/achievements.json` and `data/ms-certifications.json` on schedule and/or via manual dispatch.
- Changes are traceable in git history and include a short summary in commit messages.
