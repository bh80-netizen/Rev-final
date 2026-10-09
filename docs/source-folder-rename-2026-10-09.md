# Source folder rename — October 9, 2026

The project manager requested renaming the inherited source folder from rice-motorsport-site to rev-site. The release branch and publishing export now use rev-site. The build script, FAQ maintenance script, ignore entry, and README were updated to resolve the new path.

Every website source file is preserved byte-for-byte. This change does not modify visible content, layout, model, page URLs, domain, SEO metadata, or sponsorship/interest links. Production and staging output folder names remain dist and dist-preview; hosting build/start commands stay the same. A teammate running a direct source preview should use `python3 -m http.server 8000 --directory rev-site`.

Validation: compare all source checksums with the files before the rename, run the existing three-profile release checks, and verify that the standard deployment manifest is unchanged. The publishing export, Git bundle, and ZIP are regenerated to include the rename. Previous exports are retained outside served folders under the workspace deprecate/2026-10-09/ archive.
