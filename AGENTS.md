# SquarePic — AGENTS.md

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the build (port 4173) |

No lint, typecheck, or test scripts exist. TypeScript is installed but no `tsconfig` (Vite uses its own).

## Entry points & page wiring

- **All pages** load `<script type="module" src="/src/main.js">` — this injects navbar, sidebar, footer, and SEO links bar via DOM. It also restores the accent-color theme from `localStorage('squarepic-theme')`.
- **Editor** (`index.html`): `main.js` detects `#mainCanvas` and runs `initEditor()`.
- **Compressor** (`free-image-compressor.html`): loads both `src/main.js` (layout) and `src/compressor.ts` (tool logic, self-inits).
- **Converter** (`free-image-converter.html`): loads both `src/main.js` (layout) and `src/converter.ts` (tool logic, self-inits).
- **Content pages** (about, support, faq, privacy, terms): no custom entrypoint; `main.js` fetches them into a bottom-sheet via `class="sheet-trigger"` links in the footer.
- All sub-pages share layout via `main.js` — never duplicate the shared HTML templates in individual HTML files.

## Source files

- `src/main.js` — the actual entry point loaded by all HTML pages. Duplicated (with TypeScript types) as `src/main.ts`. Edit `main.js` unless the TS migration is explicitly in progress.
- `src/compressor.ts` — imports `./style.css` and JSZip; self-initializes on DOMContentLoaded.
- `src/converter.ts` — imports `./style.css` and `./encoders`; self-initializes.
- `src/encoders.ts` — custom GIF/TIFF/ICO/AVIF/BMP canvas encoders.
- `src/style.css` — single monolithic stylesheet (~2800 lines).
- `assets/fonts.css` — loaded by all HTML pages for font-face declarations.

## Build quirks

- Vite config (`vite.config.ts`) auto-discovers all `.html` files in project root — adding a new HTML file automatically adds a build entry.
- Built assets go to `dist/`. **Never edit `dist/` directly**.
- `assets/` contains stale build outputs committed to git. Do not edit these files — they are regenerated on build. (Unlike `dist/`, they are not gitignored.)
- Post-build CI step copies `robots.txt`, `sitemap.xml`, `favicon.svg`, `squareframe_preview.png` into `dist/`.
- `.htaccess` is the live Apache config. The CSP header in `.htaccess` must stay in sync with the `<meta http-equiv="Content-Security-Policy">` tag in every HTML file.
- All internal links use extensionless paths (e.g. `href="free-image-converter"`) matching the `.htaccess` rewrite rules.

## Deployment

- GitHub Actions on push to `main`: `npm ci && npm run build` → FTP syncs `dist/` to Hostinger `/public_html/`.
- Secrets required: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.
- Live domain uses clean URLs (`.htaccess` rewrites strip `.html`).

## Git-tracked config notes

- `.agents/`, `.opencode/`, `opencode.json`, `skills-lock.json` are all gitignored — they are local opencode agent config.
- `BarlowCondensed-Regular.ttf` lives at repo root, loaded via `assets/fonts.css`.
- `test_built.py`, `test_built2.py`, `test_index.py` are Playwright test scripts, gitignored.

## Style conventions

- Dark theme via CSS variables on `:root` (`--bg-color: #080a0e`).
- 6 accent colors stored in `localStorage('squarepic-theme')` as `{accent, glow}` JSON.
- Fonts: BarlowCondensed (local TTF via `assets/fonts.css`) + Syne Mono (Google Fonts).
- Glass-morphism UI with `--glass-blur: blur(18px)`.
- All processing is client-side (canvas/browser APIs) — no server uploads.

## Dependencies

- Runtime: `jszip` (batch download in compressor).
- Dev: `typescript`, `vite`.

## What NOT to do

- Do not create separate script entry points for new pages unless they need their own interactive tool. Most pages only need the shared `main.js` layout.
- Do not edit generated assets (`dist/`, `assets/`).
- Do not remove or modify GTM/GA4 tracking IDs (GTM-TFGGLL8S, G-9TTBK0ZDM5) unless asked.
- Do not add a JS framework — this is intentionally vanilla.
- Do not blindly re-deploy; verify the build works with `npm run preview` first.
