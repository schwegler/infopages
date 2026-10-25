"""Guard the public contact surface without dependencies."""
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parent.parent
ADDRESS = "andrew" + "@" + "schweg.xyz"


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.mail = []

    def handle_starttag(self, tag, attrs):
        href = dict(attrs).get("href", "")
        if tag == "a" and href.startswith("mailto:"):
            self.mail.append(href)


has_mailto = False
for path in ROOT.glob("*.html"):
    source = path.read_text()
    if "mailto:" in source:
        has_mailto = True
    assert ADDRESS not in source, f"Plaintext public email: {path}"
    parser = Links()
    parser.feed(source)
    for href in parser.mail:
        assert href == "mailto:" + ADDRESS, (path, href)

assert has_mailto, "No mailto: links found in HTML files"
print("Public source encoded; native HTML parsing preserves mail destinations.")
