# Pin Dependency Versions or Use Reproducible Installs
Labels: security,medium
Severity: Medium

Description:
`package.json` uses caret (`^`) ranges which allow automatic minor/patch updates. This can introduce unexpected changes or vulnerabilities into builds.

Remediation:
- Pin critical dependencies to exact versions (e.g., `3.4.0`) or use `~` for patch-only updates.
- Ensure CI uses `npm ci` with `package-lock.json` to guarantee reproducible installs.

References:
- https://docs.npmjs.com/cli/v9/using-npm/semver
