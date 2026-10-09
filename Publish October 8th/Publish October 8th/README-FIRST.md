# Publish October 8th — REV website handoff

Prepared on October 9, 2026 from the reviewed October 8 release. This folder contains the complete website and the materials needed for publishing. No public deployment or GitHub upload was performed here.

## Start with the hosting method

| What the teammate needs | Folder | What to do |
| --- | --- | --- |
| Update the existing GitHub repository | `github-handoff/` | Import and push the verified Git bundle; follow the instructions below. |
| Complete editable source | `website-source/` | The pages and assets live in `website-source/rev-site/`; this folder also contains build scripts, package lock, workflow, and documentation. |
| Deploy to Cloudflare Pages | `deploy-cloudflare-pages/` | Upload the **contents** of this folder, with index.html at the site root. For a Git-connected build, use website-source with `npm run build:cloudflare` and output `dist`. |
| Deploy to another compatible static host | `deploy-standard/` | Upload the **contents** of this folder, with index.html at the site root. Configure the supplied redirects/headers for that provider. |
| Deploy to the existing Node/Procfile host | `website-source/` | Install with `npm ci`; start with `npm start`, which builds and serves only dist. |
| Verify the handoff | `verification/` and `SHA256SUMS.txt` | Includes file inventories, earlier local release tests, and export checks. |

The live domain has Cloudflare in its delivery path; the teammate should confirm the actual hosting provider before choosing a deployment folder. Do not upload this entire handoff folder as the website. The source and deployment copies serve different purposes; they are not extra public pages.

## GitHub handoff

Use an authenticated clone of `bh80-netizen/Rev-final`. Replace `/path/to/` with the actual location of this folder, keeping quotes around paths containing spaces:

```sh
git fetch origin
git bundle verify "/path/to/Publish October 8th/github-handoff/REV-publish-ready-20261008.bundle"
git fetch "/path/to/Publish October 8th/github-handoff/REV-publish-ready-20261008.bundle" publish-ready-20261008:publish-ready-20261008
git switch publish-ready-20261008
npm ci
npm test
git push -u origin publish-ready-20261008
```

Open a PR to main using `github-handoff/PR-DESCRIPTION.md`. Review before merging and check whether a merge automatically deploys. The bundle requires public main commit `75e90539ccab718deda0886e50c2f7edda05ee3c` and contains the completed branch at `52e8bbcb0ed5fe977633235f69739af82a608d82`. If the branch name already exists locally, inspect it before fetching rather than overwriting it. The complete source folder is also included if the teammate uses a different upload workflow.

## Source folder name

The website source folder is now `website-source/rev-site/`. Build scripts and documentation use that name. The rename does not alter public URLs, domain, SEO, or visible page content; hosting still publishes `dist` or one of the prepared deployment folders. See [rename notes](website-source/docs/source-folder-rename-2026-10-09.md).

## What is implemented

- Production pages are eligible for indexing; robots.txt and the six-page sitemap are included.
- The exact agreed homepage search title and description are implemented, with per-page canonical/social metadata, a favicon, and machine-readable organization/page information.
- Season is retired with a permanent redirect; January 2027 is corrected; the local-review footer label is removed.
- The approved page content, layout, styles, imagery, Carrera model, interest form, and email-list link are preserved. The added Join paragraph is absent. Application buttons retain the approved Coming soon strategy.
- The verified nine-page sponsorship PDF is included at its linked stable URL in the source and both deployment folders.
- Build files provide versioned asset caching, correct 404 behavior, staging noindex settings, and repeatable checks.

## Before and after publication

Read [deployment instructions](website-source/docs/DEPLOYMENT.md) for provider settings and the live checklist. Read [the process record](website-source/docs/RELEASE-PROCESS-2026-10-08.md) for the exact changes and earlier tests, and [SEO notes](website-source/docs/SEO.md) for the metadata explanation.

After publication, check all six pages, the sponsorship packet, interest link, model, redirects, HTTPS, robots.txt, sitemap, and absence of production noindex. The domain owner can then submit the sitemap and request homepage indexing in Google Search Console. Live hosting settings and Google indexing/ranking were not changed by this export.

## Export verification

The export was checked against release checksums: both deployment folders match their full 67-file inventories; source assets match the approved release; all six page bodies match the approved pre-release snapshot. See verification/EXPORT-VERIFICATION.json. Earlier local production, staging, and Cloudflare routing-profile tests are included. Raw CAD, original photo libraries, private records, credentials, local archives, and dependency folders are excluded.
