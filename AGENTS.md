# Project notes

Majestic Hotel — a single-page luxury hotel landing site (static HTML/CSS/JS) served by
the Vite dev server.

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d
```

- Web entry point: host port **3000** → container port 3000 (Vite dev server, `--strictPort`).
- `npm ci` runs at container start into the `node_modules` named volume, from the
  checked-in `package-lock.json`; Vite then starts with live reload.
- Tail output with `docker compose -f docker-compose.base44.yml logs -f web`.
- The healthcheck probes `http://127.0.0.1:3000/` with Node's `fetch` (no curl in the image).

## Layout

- `index.html` — the whole page (header, hero, rooms, booking bar, features, dining, spa,
  gallery, events, footer).
- `css/styles.css` — design system first (tokens for colour/type/spacing), then components,
  then responsive rules and reduced-motion overrides.
- `js/main.js` — header scroll state, mobile navigation, booking enquiry, scroll reveals.
- `assets/images/` — photography, served straight from the bind mount.

## Non-obvious details

- No build step is required to view the site; `npm run build` exists only for a future
  static deploy (output in `dist/`, gitignored).
- The compose service passes `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` through from the
  sandbox so Vite accepts the proxied preview hostname. It is empty outside the sandbox and
  has no effect on the app itself.
- Fonts load from Google Fonts (Playfair Display + Montserrat) with local serif/sans
  fallbacks, so the page still reads correctly if the CDN is unreachable.
- The booking bar is front-end only: it validates dates and shows an enquiry confirmation.
  There is no reservations backend or mailbox integration.

## Verify

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/   # 200
```
