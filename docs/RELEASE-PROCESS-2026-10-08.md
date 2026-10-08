# Release process and validation — 2026-10-08

## Approved scope

Prepare the reviewed website for GitHub handoff, enable production indexing, complete invisible SEO/social presentation, and provide a clean repeatable deployment package. Preserve the existing model, page copy, layout, styling, interest form, and email list. The added Join paragraph about future application forms has been removed. No time zone or revised wording has been added to the approved recruitment copy.

Previously approved changes remain: remove the Team local-review label; correct January 2026 to January 2027; retire Season; use the exact approved homepage search title and description. Coming soon application buttons are approved. Headshots are deferred. The project manager confirmed CFO verification of the sponsorship packet and wording.

## Source and recovery

The clean branch `publish-ready-20261008` starts from public `origin/main` at `75e90539ccab718deda0886e50c2f7edda05ee3c`, rather than pushing the local experiment history containing large model/CAD work. The approved local site was copied into a separate checkout at `../website-release`.

Previous public source files were moved locally, preserving relative paths, to `deprecate/2026-10-08/release-source-before/`. That recovery copy is ignored and never served or uploaded. The old files also remain recoverable in existing public Git history. The original workspace's Drive export, model sources, references, and raw photos remain untouched. The previously retired Season source is retained in the original workspace's archive.

The package copies only page-referenced web assets and required font license notices. It excludes original Photos, legacy unused assets, CAD experiments, private records, development dependencies, and local archives. Existing public history was not rewritten; earlier public media still exists in that history.

## Content preservation evidence

All six page bodies were compared byte-for-byte with the snapshot taken immediately before release preparation. Changes inside the head are limited to approved metadata and indexing. CSS, viewer scripts, images, and model content are preserved from the reviewed local source; build-time asset filenames change for caching.

SHA-256 of the content beginning with the opening body tag (excluding the literal `<body` prefix), recorded for reproducibility:

| Page | Approved body SHA-256 |
| --- | --- |
| index.html | `02f26b348934e199c23dd7982173dc7b317af8004ef59065d40a6ed2495e768e` |
| car.html | `c95a1c809744dcc12455cf23b4e1d3a549e8b690ad3a4d901b2a816ee9352bc2` |
| about.html | `f98717a3e9ecb7943638e5eaced0684908019a724e20f50aadf855627c07c722` |
| join.html | `bf38df5f13177e4eebf01b41694913ae675c6dedadf41d55db6a5837dc1e6132` |
| sponsorship.html | `b78204a946f273bf11fc39b4ae61e12e9f2fd9cd7ff88b95cffde250e68a607f` |
| contact.html | `1f4abe77985272d782e494bcbac665c0db4e325fca7c66de461c592e6affba0d` |

Carrera GLB: `0b2a83b775d304a37c2e79606182b702824eba18ea46c267910b3a22152b2b03`, 6,389,772 bytes. Its geometry, materials, controls, hint text, and fallback presentation are unchanged.

The sponsorship link remains `assets/docs/REV-Sponsorship-Packet-2027.pdf`; the PDF is included in the source and artifact. Browser verification confirmed that Open sponsorship packet opens that document in a new tab. The existing interest-form/email-list URL is unchanged; no form response was submitted.

## Build behavior

The builder writes `dist/`, adds true 404 behavior and Season/index redirects, fingerprints cacheable asset filenames, rewrites their references, retains the stable PDF/favicon URLs, and generates provider configuration plus a checksum inventory. Headers request long caching for versioned assets and revalidation for pages/PDF. The Cloudflare Pages profile aligns links and canonicals with its extensionless routes. The staging profile includes noindex metadata/headers.

The repository root is never the served directory. Instructions are in [DEPLOYMENT.md](DEPLOYMENT.md). Run `npm ci`, `npm test`, then `npm run build` (or `npm run build:cloudflare`). The workflow repeats dependency installation and checks on GitHub and uploads the tested standard dist artifact; that remote workflow has not yet run.

## Checks actually completed

- Three profiles passed local checks: standard production, staging preview, and Cloudflare Pages routing configuration served through the local production server. The test restores the standard build and verifies reproducibility.
- All six pages have one H1, distinct IDs, required descriptions/canonicals/social fields, valid JSON-LD, image alt attributes, and correct indexing state. The exact homepage title/description and January 2027 correction are checked.
- Sitemap URLs, local page/asset links, anchors, and rewritten CSS font/background references resolve.
- Real HTTP tests passed: page/asset 200 responses, permanent redirects, unknown/private-directory 404 responses, no directory listings, nosniff headers, correct model/PDF MIME types, and model ETag/304 handling.
- Sponsorship PDF loads through its actual page button. The added Join paragraph is absent, and the email-list link matches the reviewed source.
- Browser checks on desktop and mobile found no horizontal page overflow. Existing navigation, contact copy-email control, and model rendering were checked. A temporary missing-model fixture exercised the static fallback; fixtures are excluded from final builds.

Local runtime was Node.js 24.19.0 with the locked serve 14.2.6 dependencies installed through the bundled pnpm lockfile import. A global npm executable was unavailable, so the equivalent Node scripts were executed directly. GitHub CI is configured to run actual `npm ci` and `npm test` on Node.js 22. Production provider behavior still needs live verification.

Standard artifact: 67 files, 15268769 bytes, 53 referenced assets. Exact inventory/checksums are in [release-manifest.json](../release-manifest.json); test results are in [release-validation.json](../release-validation.json) and [release-validation.cloudflare-pages.json](../release-validation.cloudflare-pages.json).

## Limits and remaining actions

The website has not been deployed, main has not been merged, and the release branch has not yet been uploaded because this machine has no authenticated GitHub write access. No domain/host settings or Search Console property were changed. The teammate must confirm the host and execute the publication checklist. Local tests do not establish CDN behavior, live Google indexing/ranking, AI responses, field performance, or full accessibility conformance. No Lighthouse score or slow-network measurement is claimed.
