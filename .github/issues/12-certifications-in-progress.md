# Feature: Support Certifications "In Progress"
Labels: enhancement,ui
Severity: Low

Description:
Add support for marking certifications as "in progress" in the data model and UI so visitors can see certifications that are being pursued but not yet completed.

Current Data Samples:
- `data/ms-certifications.json` contains `certifications` with fields like `status`, `dateEarned`, and `certificationNumber`.

Suggested Changes:
1. Data model:
   - Allow `status` to include `In Progress` (or `in-progress`) in addition to `Active`/`Expired`.
   - Optionally add `expectedCompletionDate` and `progressPercent` fields.
2. UI:
   - Render `In Progress` certifications with a distinct visual treatment (badge or subtle tint) and show optional `expectedCompletionDate` or `progressPercent`.
   - Provide an admin/developer note describing how to add/update these entries in `data/ms-certifications.json`.
3. Validation:
   - Update any JSON validation or build checks to accept the new optional fields.

Backward Compatibility:
- Treat missing new fields as optional; default `status` handling should remain unchanged for existing items.

Acceptance Criteria:
- `data/ms-certifications.json` can include `In Progress` items without build errors.
- UI displays these items clearly and accessibly.
