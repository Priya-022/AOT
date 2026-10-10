# AOT

## Deploying to Netlify

Netlify is configured to build with `node build.mjs` and publish `dist/` (see `netlify.toml`).
Images are served by the external Fandom CDN, which returns 404 responses to hotlinked image
requests that include the Netlify site's referrer. The app therefore sets `referrerpolicy="no-referrer"`
on API-provided images; keep this attribute if changing the image markup.
