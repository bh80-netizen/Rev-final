# REV website instructions

Read README.md and docs/DEPLOYMENT.md before changing deployment behavior. Read docs/RELEASE-PROCESS-2026-10-08.md for the approved release scope.

- Preserve the approved visible text, layout, styling, imagery, interest form/email list, and Carrera model unless the project manager explicitly authorizes a change.
- Rice Electric Vehicle (REV) is Rice University's student-led solar racing team. Carrera is under development; the current goal is Formula Sun Grand Prix 2027.
- The existing public website was a placeholder; this reviewed content supersedes it.
- Headshots are deferred. Coming soon application buttons are approved for launch. The project manager confirmed CFO verification of the sponsorship packet and wording.
- Keep content in static HTML so crawlers can read it without JavaScript.
- Publish dist/ only. Keep raw CAD, original large media, archives, private records, and credentials outside the source and deployment package.
- Archive retired source files outside served folders under deprecate/YYYY-MM-DD/ with their original relative paths and a reason. Never place private material in a public repository archive.
- Use branches and pull requests. The project manager authorized preparing and uploading this release; do not merge to main or deploy publicly without further review.
- Run npm test after changes to packaging, metadata, routes, or assets. Check the affected pages in a browser. Document factual assumptions and limitations.
