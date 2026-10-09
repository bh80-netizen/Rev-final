# Search and sharing settings

The homepage title is **Rice Solar Racing | Rice Electric Vehicle (REV)**. The exact project-manager-approved description is:

> Rice Electric Vehicle (REV) is Rice University’s student-led solar racing team, competing in the Formula Sun Grand Prix and American Solar Challenge. Join or support us.

These settings are in the HTML head and do not change the visible page layout or copy.

| Setting | Purpose in this release |
| --- | --- |
| Page title | Suggests the search result title and browser-tab label. Each page has a relevant title. |
| Meta description | Suggests the text beneath a Google result. Google may choose page text instead and may shorten it. [Google snippet documentation](https://developers.google.com/search/docs/appearance/snippet). |
| Canonical URL | Identifies the preferred public URL when aliases exist; helps consolidate duplicate URLs. Production canonicals match the selected host's routes. [Google canonical documentation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls). |
| Favicon | Small REV icon for tabs and eligible search results. The release includes a square vector icon using the existing mark. |
| Open Graph / Twitter metadata | Suggests the title, description, and existing image used when links are shared. Contact has its own canonical and sharing fields just like the other pages. |
| JSON-LD structured data | Machine-readable organization, website, and page records. The homepage connects public email, contact route, official profiles, project description, and sponsorship packet. It does not assert that Carrera is completed or race-ready. |
| robots.txt | Allows ordinary crawlers and points to the production sitemap. It is not a security boundary. |
| Sitemap | Lists the six active preferred page URLs. The retired Season page is excluded and permanently redirected. |
| noindex | Requests that a page stay out of search results. Removed from production pages; retained for staging and the 404 page. |
| nofollow | Requests that crawlers not follow a page's links. The old production restriction is removed; normal production links remain followable. |

The existing page text, public contact links, competition information, and downloadable packet are in ordinary HTML and remain accessible without the model or JavaScript. This helps both search engines and AI systems identify the project. Structured data is useful context, not a guarantee of an AI answer or favorable wording.

No keyword stuffing, invented claims, hidden promotional text, or visible copy changes are included. Discovery depends on relevant content, credible links, technical accessibility, and ongoing updates. No implementation can guarantee the first Google result for every search. See [Google's SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

The Carrera GLB remains 6,389,772 bytes. On a first load the browser may download it. The build fingerprints its URL and configures a one-year immutable cache, allowing repeat visits to reuse the unchanged file. Visitors with an empty/evicted cache or a changed model URL download it again. The host must honor the supplied caching configuration. No geometry, appearance, or viewer controls were changed.
