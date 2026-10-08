"""Mirror the other pages' FAQs into crawlable homepage HTML.

Run from any directory: python3 website/tools/sync_home_faqs.py
The source pages remain authoritative. Only the homepage's #faq section changes.
"""

from pathlib import Path
import re


SITE = Path(__file__).resolve().parents[1] / "rice-motorsport-site"
SOURCES = (
    ("Carrera", "car.html", "car-faq"),
    ("Team", "about.html", "team-faq"),
    ("Join", "join.html", "join-faq"),
    ("Sponsors", "sponsorship.html", "sponsor-faq"),
    ("Contact", "contact.html", "contact-faq"),
)


def render_faqs():
    groups = []
    total = 0
    for label, filename, section_id in SOURCES:
        source = (SITE / filename).read_text()
        main = re.search(r"<main\b[^>]*>(.*?)</main>", source, re.S)
        if not main:
            raise ValueError(f"Missing main element in {filename}")
        items = re.findall(r"<details\b[^>]*>.*?</details>", main[1], re.S)
        if not items:
            continue
        slug = label.lower()
        # Answers and links are copied intact. Start all homepage answers closed.
        questions = "\n".join(
            "          " + re.sub(r"^<details\b[^>]*>", "<details>", item)
            for item in items
        )
        page_link = filename + (f"#{section_id}" if f'id="{section_id}"' in source else "")
        groups.append(f'''      <section class="faq-group" data-faq-source="{filename}" aria-labelledby="faq-{slug}-title">
        <div class="faq-group-heading">
          <h3 id="faq-{slug}-title">{label}</h3>
          <a href="{page_link}">Go to {label} page <span aria-hidden="true">↗</span></a>
        </div>
        <div class="faq-list">
{questions}
        </div>
      </section>''')
        total += len(items)
        print(f"{label}: {len(items)} FAQs")
    if not groups:
        raise ValueError("No source FAQs found; homepage was not changed")
    return '''    <section class="faq-preview" id="faq" aria-labelledby="faq-title">
      <p class="section-label">FAQ</p>
      <h2 id="faq-title">Frequently asked questions.</h2>
      <!-- Generated from the source pages by tools/sync_home_faqs.py. Edit answers there, then run the sync command. -->
''' + "\n".join(groups) + f'''
    </section>''', total


if __name__ == "__main__":
    homepage = SITE / "index.html"
    html = homepage.read_text()
    start = html.index('    <section class="faq-preview" id="faq"')
    # Find the matching section close, including nested FAQ group sections.
    # This keeps synchronization independent of the neighboring section order.
    depth = 0
    for tag in re.finditer(r"</?section\b[^>]*>", html[start:]):
        depth += -1 if tag[0].startswith("</") else 1
        if depth == 0:
            end = start + tag.end()
            break
    else:
        raise ValueError("Homepage FAQ section is not closed")
    section, total = render_faqs()
    homepage.write_text(html[:start] + section + html[end:])
    print(f"Synced {total} FAQs to {homepage.name}")
