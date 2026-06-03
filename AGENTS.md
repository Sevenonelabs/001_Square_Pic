# SquarePic — AGENTS.md

## Project structure

Static multi-page image-editing website (squarepic.io). No framework — vanilla TS/JS built with Vite 6. Every HTML page in the project root is a separate Vite entry point.

```
Root .html files          → 30+ tool/sub-pages
src/main.js               → Shared layout (navbar, sidebar, footer, SEO links) + editor (when #mainCanvas exists)
src/compressor.ts         → Compressor page entry (imports style.css, self-inits)
src/converter.ts          → Converter page entry (imports style.css, self-inits)
src/encoders.ts           → Custom GIF/TIFF/ICO canvas encoders
src/style.css             → Single monolithic stylesheet (~2800 lines)
```

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the build |

No lint, typecheck, or test npm scripts exist. TypeScript is installed but no `tsconfig` is checked in (Vite uses its own).

## Page wiring

- **All pages** load `<script type="module" src="/src/main.js">` inline — this `main.js` injects navbar, sidebar, footer, and SEO links bar via DOM. It also restores the accent-color theme from `localStorage('squarepic-theme')`.
- **Editor page** (`index.html`) has `#mainCanvas`; `main.js` detects it and runs `initEditor()`.
- **Compressor page** (`free-image-compressor.html`) loads `/src/compressor.ts` as a separate module entry. The TS file imports `./style.css` and self-initializes on DOMContentLoaded.
- **Converter page** (`free-image-converter.html`) loads `/src/converter.ts` the same way.
- All sub-pages share layout via `main.js` — never duplicate the shared HTML templates.

## Build quirks

- Vite config auto-discovers all `.html` files in project root — adding a new HTML file automatically creates a new build entry.
- Built assets go to `dist/`. **Never edit `dist/` or `assets/` directly** — they are generated.
- Post-build CI step copies `robots.txt`, `sitemap.xml`, `favicon.svg`, `squareframe_preview.png` into `dist/`.
- `.htaccess` is the live Apache config (clean URLs, HTTPS, CSP, caching). Must be kept in sync with any CSP changes.

## Deployment

- GitHub Actions pushes to `main` → `npm ci && npm run build` → FTP syncs `dist/` to Hostinger `/public_html/`.
- Secrets required: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.
- Live domain uses clean URLs (`.htaccess` rewrite strips `.html`). All internal links use extensionless paths like `href="free-image-converter"`.

## Style conventions

- Dark theme via CSS variables on `:root` (`--bg-color: #080a0e`).
- 6 accent colors stored in `localStorage('squarepic-theme')` as `{accent, glow}` JSON.
- BarlowCondensed (local TTF) + Syne Mono (Google Fonts) — both declared in `src/style.css`.
- Glass-morphism UI with `--glass-blur: blur(18px)`.
- All form controls, canvases, and image processing happen client-side — no server uploads.

## Dependencies

Only runtime dep is `jszip` (for batch download in compressor). Dev deps: `typescript`, `vite`.

## What NOT to do

- Do not create separate script entry points for new pages unless they need their own interactive tool. Most pages only need the shared `main.js` layout.
- Do not edit generated assets (`dist/`, `assets/`).
- Do not remove or modify GTM/GA4 tracking IDs (GTM-TFGGLL8S, G-9TTBK0ZDM5) unless asked.
- Do not add a JS framework — this is intentionally vanilla.
- `.htaccess` blocks access to `.json`, `.lock`, `.ts`, `.md` files on production — these files are safe in the repo but not served.
