# Security Analysis Report
**Date:** 2026-02-14  
**Analyst:** Security Review  
**Project:** AsanzaDev Portfolio

## Executive Summary
This static portfolio site demonstrates good security awareness with CSP implementation and removal of inline scripts. However, several high-priority security enhancements are needed, particularly around HTTP security headers and supply chain security.

## Identified Vulnerabilities & Improvements

### 1. 🔴 HIGH PRIORITY: Missing HTTP Security Response Headers
**Severity:** High  
**Category:** Infrastructure Security

**Description:**  
The site only uses a meta CSP tag but lacks critical HTTP security response headers that should be delivered by the server/CDN.

**Required Headers:**
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` - Force HTTPS
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `X-Frame-Options: DENY` - Clickjacking protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Control referrer info
- `Permissions-Policy: geolocation=(), microphone=(), camera=()` - Restrict browser features

**Security Impact:**
- Protocol downgrade attacks
- MIME confusion attacks
- Clickjacking vulnerabilities
- Information leakage via referrers

**Remediation:**
1. Configure GitHub Pages with Cloudflare Worker/Pages for header injection
2. Migrate to Netlify/Vercel (native header support via `_headers` file)
3. Use Azure Static Web Apps with `staticwebapp.config.json`

---

### 2. 🔴 HIGH PRIORITY: CSP Delivered via Meta Tag Instead of HTTP Header
**Severity:** High  
**Category:** Application Security

**Description:**  
Content-Security-Policy is currently delivered via meta tag (index.html:6). While functional, CSP via HTTP headers provides better security coverage.

**Current Implementation:**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'self' https://formspree.io; img-src 'self' data: https:; style-src 'self'; script-src 'self'; base-uri 'self'; object-src 'none';">
```

**Why HTTP Header is Better:**
1. `frame-ancestors` directive only works in HTTP headers (not meta tags)
2. `report-uri` / `report-to` only work in HTTP headers
3. Prevents CSP bypass via meta tag manipulation
4. Applies before any HTML is parsed

**Recommended CSP Header:**
```http
Content-Security-Policy: default-src 'self'; connect-src 'self' https://formspree.io; img-src 'self' data: https:; style-src 'self'; script-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://formspree.io
```

---

### 3. 🟡 MEDIUM PRIORITY: Missing Subresource Integrity (SRI)
**Severity:** Medium  
**Category:** Supply Chain Security

**Description:**  
While the project mentions SRI in README.md and has a PowerShell script (`scripts/add-sri.ps1`), SRI is not actually implemented for local JavaScript files.

**Current Risk:**  
If the hosting CDN or server is compromised, attackers could modify:
- `js/main.js`
- `js/inline.js`
- `css/styles.css`

Without SRI, browsers would load tampered files without warning.

**Remediation:**
```html
<link rel="stylesheet" href="css/styles.css" integrity="sha384-..." crossorigin="anonymous">
<script src="js/main.js" integrity="sha384-..." crossorigin="anonymous"></script>
<script src="js/inline.js" defer integrity="sha384-..." crossorigin="anonymous"></script>
```

**Action Items:**
1. Use `scripts/add-sri.ps1` to generate integrity hashes
2. Add to CI/CD pipeline to auto-update SRI on asset changes
3. Update index.html with integrity attributes

---

### 4. 🟡 MEDIUM PRIORITY: No Automated Dependency Vulnerability Scanning
**Severity:** Medium  
**Category:** Supply Chain Security

**Description:**  
No GitHub Actions workflow exists to automatically scan npm dependencies for vulnerabilities.

**Current Dependencies:**
- tailwindcss: ^3.4.0
- postcss: ^8.4.0
- autoprefixer: ^10.4.0

**Remediation:**  
Create `.github/workflows/security.yml`:
```yaml
name: Security Scan
on: [push, pull_request, schedule]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm audit --audit-level=moderate
      - run: npm outdated || true
```

---

### 5. 🟡 MEDIUM PRIORITY: Missing Dependency Version Pinning
**Severity:** Medium  
**Category:** Supply Chain Security

**Description:**  
`package.json` uses caret (^) ranges for dependencies, which allows minor/patch version updates that could introduce vulnerabilities.

**Current:**
```json
"tailwindcss": "^3.4.0"
```

**Recommendation:**  
Pin exact versions or use `~` for patch-only updates:
```json
"tailwindcss": "3.4.0"
```

Or use `npm ci` with `package-lock.json` (already present) to ensure reproducible builds.

---

### 6. 🟢 LOW PRIORITY: Potential XSS via URL Building Functions
**Severity:** Low  
**Category:** Code Security

**Description:**  
In `js/main.js`, URL building functions concatenate user-supplied data without sanitization:

```javascript
buildDetailsUrl(u) {
  if (!u) return undefined;
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  const path = u.startsWith('/') ? u : `/${u}`;
  return `https://learn.microsoft.com/en-us${path}`;
}
```

**Risk:**  
If `data/achievements.json` or `data/*-certifications.json` are compromised, malicious URLs could be injected.

**Remediation:**
1. Validate/sanitize URLs before building
2. Use URL() constructor for validation:
```javascript
buildDetailsUrl(u) {
  if (!u) return undefined;
  try {
    const url = new URL(u, 'https://learn.microsoft.com/en-us');
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.href;
    }
  } catch(e) {
    console.warn('Invalid URL:', u);
  }
  return undefined;
}
```

---

### 7. 🟢 LOW PRIORITY: Contact Form Lacks Rate Limiting
**Severity:** Low  
**Category:** Application Security

**Description:**  
The contact form (index.html:303) submits to Formspree without client-side rate limiting.

**Current Implementation:**
```javascript
form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  // ... no rate limiting
});
```

**Remediation:**
- Add client-side rate limiting (e.g., disable button for 10 seconds after submission)
- Consider adding reCAPTCHA or similar anti-spam measures
- Formspree may have server-side limits, but client-side prevention improves UX

---

### 8. 🟢 LOW PRIORITY: Missing Security.txt
**Severity:** Low  
**Category:** Security Operations

**Description:**  
No `security.txt` file exists to provide security vulnerability disclosure information.

**Remediation:**  
Create `.well-known/security.txt`:
```
Contact: mailto:security@asanzadev.com
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en, es
Canonical: https://asanzadev.com/.well-known/security.txt
```

---

### 9. 🟢 LOW PRIORITY: No CI/CD Security Pipeline
**Severity:** Low  
**Category:** DevSecOps

**Description:**  
No GitHub Actions workflow exists for building or testing the site.

**Remediation:**  
Create `.github/workflows/build.yml` to:
1. Build Tailwind CSS (`npm run build:css`)
2. Run security audits (`npm audit`)
3. Validate HTML/CSP configuration
4. Generate SRI hashes automatically

---

### 10. 🟢 LOW PRIORITY: Hardcoded Formspree Endpoint
**Severity:** Low  
**Category:** Configuration Management

**Description:**  
The Formspree endpoint is hardcoded in HTML and CSP:
```html
<form id="my-form" action="https://formspree.io/f/mreapwaa" method="POST">
```

**Consideration:**  
If the endpoint needs to change, multiple locations must be updated.

**Remediation:**  
Move to environment variables or configuration (though for static sites, this is acceptable).

---

## Positive Security Practices Identified ✅

1. **CSP Implementation** - Meta CSP restricts inline scripts/styles
2. **No Inline Scripts** - All JavaScript externalized to separate files
3. **No unsafe-eval/unsafe-inline** - Removed Alpine.js to avoid CSP relaxation
4. **Safe DOM Rendering** - Removed unsafe `innerHTML` usage
5. **HTTPS External Resources** - All external links use HTTPS
6. **Formspree for Forms** - No custom backend reducing attack surface
7. **Package Lock File** - `package-lock.json` ensures reproducible builds
8. **Security Documentation** - README mentions security considerations

---

## Recommended Priority Order

1. **Implement HTTP Security Headers** (Issue #1) - HIGH
2. **Migrate CSP to HTTP Header** (Issue #2) - HIGH
3. **Add Dependency Vulnerability Scanning** (Issue #4) - MEDIUM
4. **Implement SRI for Local Assets** (Issue #3) - MEDIUM
5. **Pin Dependency Versions** (Issue #5) - MEDIUM
6. **Add URL Validation** (Issue #6) - LOW
7. **Add Rate Limiting to Contact Form** (Issue #7) - LOW
8. **Create security.txt** (Issue #8) - LOW
9. **Create CI/CD Security Pipeline** (Issue #9) - LOW

---

## References
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy](https://content-security-policy.com/)
- [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [security.txt Specification](https://securitytxt.org/)

---

**Next Steps:** Create GitHub issues for each identified item using the #githubRepo functionality.
