# Publishing handoff — 2026-10-08

The release is prepared for https://riceelectricvehicle.org. The project manager authorized a GitHub release branch, not a public deployment. The hosting/domain teammate performs the final merge and publication after reviewing the branch.

## 1. Identify the current host

The live domain uses Cloudflare in its delivery path. That alone does not identify the origin host. The public repository contains a Node `Procfile`, but no active deployment configuration identifies the provider. Confirm the existing dashboard, connected repository, production branch, build command, and served directory before merging. Keep the current domain and HTTPS configuration unless the host requires an explicit change.

## 2. Review and merge

Review the release pull request against main. The branch contains the complete approved website and no new raw photo library or CAD experiments. All six page bodies match the reviewed local pages preceding release preparation. Confirm the interest/email-list link and sponsorship PDF, then merge when ready to publish. Check whether merging itself starts deployment.

## 3. Configure the build

Run from the repository root. Install dependencies with `npm ci` using Node.js 22 or newer (minimum 20).

| Hosting type | Build command | Publish/output directory | Start command |
| --- | --- | --- | --- |
| Existing Node/Procfile host | Host may run `npm ci` during install | Served by start script | `npm start` |
| Static host honoring supplied redirect/header files | `npm run build` | `dist` | None |
| Cloudflare Pages | `npm run build:cloudflare` | `dist` | None |

`npm start` runs a production build through `prestart` and serves `dist` using the host's PORT environment variable (default 3000). The existing Procfile is retained. No secrets or application backend are required. The interest list uses the existing external Google Form.

On other static providers, map the generated routing and caching configuration to that provider's settings. `_redirects` and `_headers` are provider-specific files; do not assume every host interprets them. A generic file upload alone does not establish redirects or cache headers.

Cloudflare Pages redirects `.html` URLs to extensionless URLs automatically. The Pages build profile adjusts canonicals, links, structured data, and sitemap accordingly. Its top-level 404.html prevents an unintended single-page-app fallback. See [Cloudflare's serving documentation](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## 4. Preview without indexing

```sh
npm run build:preview
npm run preview
```

Publish `dist-preview` only to a staging environment. It contains noindex metadata and an X-Robots-Tag header in supported configurations. For a Pages staging artifact:

```sh
node tools/build-release.mjs --preview --cloudflare-pages
```

Preview noindex settings reduce indexing; they do not provide access control. Production uses `dist`, with six indexable pages and a sitemap.

## 5. Check immediately after publication

- Open Home, Carrera, Team, Join, Sponsors, and Contact on desktop and mobile.
- Open the interest/email-list link without changing it or submitting a test response.
- Click Open sponsorship packet and confirm the nine-page PDF loads.
- Confirm the existing Carrera model loads and the static fallback remains available.
- Confirm `/season.html` permanently redirects to Carrera, `/index.html` redirects to `/`, and a nonexistent URL returns HTTP 404.
- Open `/robots.txt` and `/sitemap.xml`; the sitemap must list the six production URLs matching the selected hosting profile.
- Confirm production HTML and response headers do not contain noindex. Check that CDN security rules do not challenge ordinary search crawlers.
- Confirm one preferred HTTPS hostname; redirect HTTP and any www alias to `https://riceelectricvehicle.org` in the host/domain dashboard. The current HTTPS domain already works, but dashboard settings were not changed in this task.
- Confirm hashed model/CSS/JS/image/font URLs receive long-lived caching, while HTML and the stable PDF URL revalidate. The model file itself is unchanged.

## 6. Enable discovery after launch

The domain owner should verify the property in [Google Search Console](https://search.google.com/search-console), submit `https://riceelectricvehicle.org/sitemap.xml`, and inspect/request indexing of the homepage. Indexing and ranking are Google's decisions; removing noindex makes pages eligible rather than guaranteeing immediate inclusion or first place. Search descriptions may vary by query.

Update official Rice/team profiles to link to the domain when the team is ready. Keep contacts, application deadlines, packet, competition goal, and sponsor information current. See [SEO notes](SEO.md).

## Rollback

Use the hosting dashboard's prior successful deployment to restore the old public placeholder if a launch fails. Previous public Git state is commit `75e90539ccab718deda0886e50c2f7edda05ee3c`. Avoid rewriting shared Git history. Resolve the problem on a new branch, review, and redeploy.

## Account actions still required

An authenticated GitHub account with write access is needed to push the branch and create the PR. The hosting teammate must confirm the provider, publish the reviewed branch, and verify Search Console. None of those account/dashboard actions were completed locally.
