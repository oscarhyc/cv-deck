# cv-deck

Chan Ho Yin's portfolio CV deck — Cloudflare Pages hosted, print-friendly landscape A4.

## Live site
- **Production:** https://cv-deck.pages.dev/
- **Preview (last commit):** https://e345fd00.cv-deck.pages.dev/

## Stack
- Static HTML/CSS/JS — no build step
- Hosted on [Cloudflare Pages](https://pages.cloudflare.com/)
- Auto-deploys on push to `main`

## Local preview
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Print to PDF
Built-in print stylesheet renders **14 pages, A4 landscape, white background, black text**:

1. Open the site in Chrome
2. `Ctrl+P` (or `Cmd+P` on macOS)
3. Set **Layout: Landscape**
4. ✅ Tick **"Background graphics"** (so cards/code blocks render with their borders)
5. **Save as PDF**

## Files
- `index.html` — page markup (14 `<section>` slides, with embedded `@media print` stylesheet)
- `deck.css` — design tokens + dark theme
- `deck.js` — slide navigation (prev/next buttons, keyboard arrow keys)
