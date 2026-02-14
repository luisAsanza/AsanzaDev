# AsanzaDev — personal portfolio

This repository contains a compact, recruiter-facing static portfolio (HTML/CSS/JS). The site is intentionally minimal and hardened to reduce runtime third-party code and to support a stricter Content Security Policy.

## Current status
- Tailwind CSS: built locally (PostCSS + Tailwind) and compiled to `css/styles.css`.
- Inline code: previously inline `<script>` and `<style>` have been externalized to `js/inline.js` and `css/styles.css` to permit a stricter CSP.
- Alpine.js: CDN removed; `js/inline.js` provides vanilla-JS fallbacks for menu, certifications, achievements, and durations.
- Security: meta CSP added to `index.html`; `form-action` restricted. Some hardening (HSTS, `frame-ancestors`) still requires response headers from the host.
- UI: smaller status badges (`.asanza-badge`), achievement categories are displayed as friendly labels (e.g., `learningpaths` → "Learning Path").
- Favicon: `assets/favicon.ico` generated via `scripts/make_favicon.py`.

## Repository layout
- `index.html` — entry point and CSP meta
- `css/styles.css` — compiled Tailwind + small custom rules
- `js/inline.js` — runtime helpers and safe renderers
- `js/main.js` — Alpine registration helper and other helpers
- `data/` — JSON source files (`achievements.json`, `ms-certifications.json`, `other-certifications.json`)
- `assets/` — images and `favicon.ico`
- `scripts/` — utility scripts (`make_favicon.py`, `add-sri.ps1`)

## Quick developer guide

### Requirements
- Node.js (14+), npm

### Build CSS
```bash
npm ci
npm run build:css
```

### Serve locally
```bash
python -m http.server 8000
# then open http://localhost:8000/
```

### Verify
- Open the site and confirm the Certifications and Achievements panels render and badges show the correct, smaller styling.

## Security & deployment notes
- CSP: a meta CSP is present, but some directives (HSTS, `frame-ancestors`) must be enforced as HTTP response headers by your host or edge worker.
- SRI: a helper exists (`scripts/add-sri.ps1`), however dynamic CDN endpoints can break SRI checks — prefer local, pinned assets.
- Hosting: GitHub Pages is supported; to inject response headers consider a Cloudflare Worker or move to Netlify/Vercel for easy header configuration.

## Planned high-priority items
- Deploy response headers (HSTS, `frame-ancestors`, X-Frame-Options) via edge worker or host.
- Add CI to build `css/styles.css` on push (I can scaffold a GitHub Action for this).
- Run supply-chain scans and pin external dependencies.

If you'd like, I can add a GitHub Action to build CSS on push or scaffold a Cloudflare Worker to inject response headers for GitHub Pages — tell me which and I'll create it.
