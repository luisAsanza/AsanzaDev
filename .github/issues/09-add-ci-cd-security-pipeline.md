# Add CI/CD Security Pipeline and Build Validation
Labels: security,low
Severity: Low

Description:
There is no CI workflow for building, testing, and validating security checks (e.g., Tailwind build, `npm audit`, CSP validation, SRI generation).

Remediation:
- Add `.github/workflows/build.yml` to run:
  - Tailwind CSS build (`npm run build:css`)
  - `npm audit` and dependency checks
  - Generate SRI hashes and validate CSP formatting
- Run on pushes and pull requests to catch issues early.
