# AsanzaDev
Portfolio personal site

## Frontend scaffold

This repository now includes a minimal static SPA scaffold using HTML5, Tailwind CSS (via CDN), and Alpine.js.


To try locally, serve the folder and open `index.html` in a browser. Example:

```bash
# using Python
python -m http.server 8000

# or with Node (install serve):
npx serve .
```

The frontend expects `/data/achievements.json` to match the provided schema `{ "achievements": [ ... ], "totalCount": N }`.
# AsanzaDev — personal portfolio

This is a small, recruiter-focused static portfolio site (HTML/CSS/JS) built with Tailwind CSS and plain JavaScript.

What's in this repo
- `index.html` — site entry and CSP meta
- `css/styles.css` — compiled Tailwind + small head styles (built locally)
- `js/main.js` — runtime helpers (Alpine registration if present)
- `js/inline.js` — previously-inline runtime code (durations renderer, fallbacks for certifications/achievements, menu toggle)
- `data/` — JSON seed files (`achievements.json`, `ms-certifications.json`, `other-certifications.json`)
- `assets/` — images and `favicon.ico`
- `scripts/` — helper scripts (`make_favicon.py`, `add-sri.ps1`)

Notable recent updates
- Tailwind moved from CDN to a local PostCSS/Tailwind build (`css/styles.css`).
- All inline `<script>`/`<style>` blocks were externalized to allow a strict Content Security Policy (meta CSP added to `index.html`).
- Alpine CDN was removed to avoid `unsafe-eval`; `js/inline.js` provides vanilla-JS fallbacks so the site remains functional without Alpine.
- Safe DOM rendering: removed unsafe `innerHTML` usage in duration and list renderers.
- Favicon generated (`assets/favicon.ico`) using `scripts/make_favicon.py`.
- UI tweaks: status badges reduced in size (`.asanza-badge` in `css/styles.css`), achievements category keys are mapped to friendly labels (e.g., `learningpaths` → "Learning Path").

Local development / build
Prereqs: Node.js (14+), npm

1. Install dependencies and build Tailwind CSS

```bash
npm ci
npm run build:css
```

2. Serve the site locally and smoke-test

```bash
# from repository root
python -m http.server 8000
# then open http://localhost:8000/
```

Security & deployment notes
- CSP: a meta Content-Security-Policy is included in `index.html` to restrict scripts/styles; removing inline code allowed dropping `'unsafe-inline'` for script/style sources. Note: some directives such as `frame-ancestors` and HSTS must be delivered as response headers from the host.
- SRI: a PowerShell helper `scripts/add-sri.ps1` exists for computing integrity values, but dynamic CDN endpoints (e.g., some Tailwind CDN behaviors) make SRI unreliable — prefer pinned or local assets.
- Hosting: GitHub Pages works for static hosting, but to enforce HTTP response headers (HSTS, frame-ancestors) consider a proxy or Cloudflare Worker or migrate to Netlify/Vercel which support custom response headers.

Remaining high-priority items
- Serve strict security headers (HSTS, frame-ancestors, X-Frame-Options) via the host or an edge worker.
- Add CI workflow to build `css/styles.css` on push (the npm scripts are present; the Action can be added).
- Run supply-chain/dependency scans and pin any external libraries where feasible.

Contributing / testing
- To reproduce the production build locally: run `npm ci && npm run build:css`, then serve the folder and verify the Certifications and Achievements panels render correctly.
- If you add or update items under `data/`, the site will read the JSON files at runtime.

If you'd like, I can add a GitHub Action to build Tailwind on push and/or a short Cloudflare Worker snippet to inject response headers for GitHub Pages.

