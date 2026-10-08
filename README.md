# Rice Electric Vehicle (REV) website

Reviewed REV website prepared for publishing at **https://riceelectricvehicle.org**. This branch replaces the public placeholder with the approved local website. It has not been deployed.

## Run and build

Use Node.js 22 or newer (minimum supported: 20).

```sh
npm ci
npm test
npm start
```

Open http://localhost:3000. `npm start` builds and serves only `dist/`.

For a static host, run `npm run build` and publish **dist/**. For Cloudflare Pages, use `npm run build:cloudflare` and publish **dist/**; that profile aligns links and canonical URLs with Pages' extensionless routing. Do not publish the repository root or source folder.

For a staging preview, run `npm run build:preview` then `npm run preview` (port 3001). Preview pages include noindex protection.

## Files and handoff

- `rice-motorsport-site/`: six active HTML pages and the assets they use.
- `tools/`: repeatable packaging, serving, and HTTP checks.
- `release-manifest.json`: file inventory and SHA-256 checksums for the standard production build.
- `release-validation*.json`: results of local release checks.
- `LICENSES/`: bundled font license notices.
- [Deployment instructions](docs/DEPLOYMENT.md): exact settings and checks for the teammate publishing the site.
- [Release process and validation](docs/RELEASE-PROCESS-2026-10-08.md): scope, preserved content, test evidence, and remaining account actions.
- [SEO explanation](docs/SEO.md): what search descriptions, canonicals, crawler settings, and social metadata do.

The release preserves the approved page content, layout, styling, interest-form link, and Carrera model. Member and lead application buttons launch with Coming soon. Headshots are deferred. Sponsorship copy and the linked packet were verified by the CFO according to the project manager.

Work through branches and pull requests. Merging to main may trigger the existing host; the teammate must confirm that deployment connection before merging.
