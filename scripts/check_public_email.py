"""Guard the public contact surface without dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from html import unescape
import re
ROOT = Path(__file__).resolve().parent.parent
ADDRESS = "andrew" + "@" + "schweg.xyz"
class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.mail = []
    def handle_starttag(self, tag, attrs):
        href = dict(attrs).get("href", "")
        if tag == "a" and href.startswith("mailto:"):
            self.mail.append(href)
for path in ROOT.glob("*.html"):
    source = path.read_text()
    assert ADDRESS not in source, f"Plaintext public email: {path}"
    parser = Links(); parser.feed(source)
    for href in parser.mail:
        assert href == "mailto:" + ADDRESS, (path, href)
assert any("mailto:" in p.read_text() for p in ROOT.glob("*.html"))
print("Public source encoded; native HTML parsing preserves mail destinations.")
