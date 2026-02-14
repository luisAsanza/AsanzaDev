# Add Subresource Integrity (SRI) for Local Assets
Labels: security,medium
Severity: Medium

Description:
Local JS and CSS assets (e.g., `js/main.js`, `js/inline.js`, `css/styles.css`) lack Subresource Integrity attributes. Without SRI, tampered assets served by an intermediate compromise could be executed by browsers without warning.

Remediation:
- Generate SRI hashes for all served assets and add `integrity="sha384-..." crossorigin="anonymous"` attributes to `<link>` and `<script>` tags.
- Automate SRI generation in CI using the existing `scripts/add-sri.ps1` script and update assets on change.

References:
- https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
