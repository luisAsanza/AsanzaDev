# Move Content-Security-Policy to HTTP Header
Labels: security,high
Severity: High

Description:
The current Content-Security-Policy is delivered via a meta tag in `index.html` rather than an HTTP header. CSP via meta tags does not support directives like `frame-ancestors` and can be manipulated if HTML is altered.

Remediation:
- Move the CSP into an HTTP response header. Recommended header:
  - `Content-Security-Policy: default-src 'self'; connect-src 'self' https://formspree.io; img-src 'self' data: https:; style-src 'self'; script-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://formspree.io`
- Configure at CDN/server layer (Netlify/Vercel/Cloudflare/Azure) so CSP is sent before HTML parsing.

References:
- https://content-security-policy.com/
