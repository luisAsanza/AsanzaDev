# Missing HTTP Security Response Headers
Labels: security,high
Severity: High

Description:
The site currently only uses a meta CSP tag and lacks critical HTTP security response headers delivered by the server or CDN (e.g., HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy). This increases risk of protocol downgrade, MIME sniffing, clickjacking, and information leakage.

Remediation:
- Configure the hosting/CDN or server to add the following headers:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- Options: Cloudflare Worker/Pages header injection, Netlify `_headers`, Vercel headers, or Azure `staticwebapp.config.json`.

References:
- https://owasp.org/www-project-secure-headers/
