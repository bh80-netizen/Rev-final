# Publish approved REV website with clean deployment and SEO

Replaces the public placeholder with the reviewed six-page REV website, preserving the approved page content, layout, interest form/email list, sponsorship packet, and Carrera model. Production pages are indexable and include consistent canonical/social metadata and machine-readable organization information.

Builds publish only dist/, excluding unused raw photos, CAD, archives, and development files. Adds Season redirects, a true 404 page, cache-versioned assets, staging noindex protection, and documented Node/static/Cloudflare Pages settings.

Validation: all three local release profiles passed page, asset, redirect, metadata, sitemap, MIME, caching, and checksum checks. Approved page bodies and model bytes were compared with the reviewed local source. Hosting, live indexing, and remote CI still require the publishing teammate to verify after upload.
