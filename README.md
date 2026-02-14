# AsanzaDev — Static Portfolio

A compact, recruiter-focused static portfolio built with plain HTML/CSS/JS and Tailwind. The site is intentionally minimal and hardened to reduce runtime third-party code and to support a stricter Content Security Policy.

**Status:** Production-ready static site. Tailwind is built locally to `css/styles.css`.

**Quick overview**
- Entry: `index.html` (CSP meta present)
- Styles: `src/input.css` → compiled to `css/styles.css` (Tailwind + small custom rules)
- Scripts: `js/inline.js`, `js/main.js` (small vanilla JS helpers)
- Data: `data/*.json` (achievements, certifications)
- Assets: `assets/` (images, favicon)
- Utilities: `scripts/` (image tooling, SRI helper, favicon generator)

**What changed recently**
- Inline scripts/styles were externalized to improve CSP compatibility.
- Alpine.js removed in favor of tiny vanilla JS fallbacks.

## Developer guide

Prerequisites
- Node.js (14+) and npm

Install dependencies
```bash
npm ci
```

Build Tailwind CSS
```bash
npm run build:css
```

Watch CSS during development
```bash
npm run watch:css
```

Serve the static site locally
```bash
# from the repository root
python -m http.server 8000
# open http://localhost:8000/
```

## Files and folders
- `index.html` — main page and CSP meta (note: some CSP directives are more effective as HTTP headers)
- `src/input.css` — Tailwind input
- `css/styles.css` — compiled output
- `js/` — small JavaScript helpers (`inline.js`, `main.js`)
- `data/` — JSON content used by the UI
- `assets/` — images, favicon, user content
- `scripts/` — helper scripts (see `scripts/` README for details)

## Security notes
- A meta CSP is included in `index.html`, but for full protection (e.g., `frame-ancestors`) deliver CSP via HTTP response headers.
- Use `scripts/add-sri.ps1` to generate Subresource Integrity (SRI) attributes for third-party assets or incorporate into CI.
- See `SECURITY_ANALYSIS.md` for an audit and prioritized remediation steps.

## Deployment
- GitHub Pages is supported for static hosting. To add HTTP response headers, deploy behind Cloudflare Workers or to platforms with header support (Netlify, Vercel, Azure Static Web Apps).

## Contributing / Next steps
- If you want, I can:
	- Add a GitHub Action to build `css/styles.css` on push.
	- Add a pipeline step to generate SRI hashes and update `index.html` automatically.
	- Provide a Cloudflare Worker snippet to inject recommended security headers.

Open an issue or request which automation you'd like next.
