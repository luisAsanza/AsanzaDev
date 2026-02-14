# Avoid Hardcoding Formspree Endpoint
Labels: security,low
Severity: Low

Description:
The Formspree endpoint is hardcoded in `index.html` and referenced in the CSP. If the endpoint changes, multiple places require updates and a misconfiguration could break form submissions.

Remediation:
- Centralize the endpoint in a single configuration or environment step. For static sites, document the single place to change and consider generating the HTML during build from a template variable.
- Update CSP and form action references together during deployment.
