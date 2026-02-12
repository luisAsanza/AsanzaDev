# AsanzaDev
Portfolio personal site

## Frontend scaffold

This repository now includes a minimal static SPA scaffold using HTML5, Tailwind CSS (via CDN), and Alpine.js.

- `index.html` — main entry
- `css/styles.css` — small custom styles
- `js/main.js` — Alpine component that loads `data/achievements.json`
- `data/achievements.json` — seed file (populated by GitHub Action later)
- `assets/` — images and PDFs (place your `photo.jpg` and `resume.pdf` here)

To try locally, serve the folder and open `index.html` in a browser. Example:

```bash
# using Python
python -m http.server 8000

# or with Node (install serve):
npx serve .
```

The frontend expects `/data/achievements.json` to match the provided schema `{ "achievements": [ ... ], "totalCount": N }`.

