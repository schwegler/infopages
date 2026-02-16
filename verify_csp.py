import html.parser
import sys

class CSPParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.csp_found = False
        self.csp_content = None

    def handle_starttag(self, tag, attrs):
        if tag == 'meta':
            attrs_dict = dict(attrs)
            if attrs_dict.get('http-equiv', '').lower() == 'content-security-policy':
                self.csp_found = True
                self.csp_content = attrs_dict.get('content')

def verify_csp(filename):
    with open(filename, 'r') as f:
        content = f.read()

    parser = CSPParser()
    parser.feed(content)

    if not parser.csp_found:
        print(f"FAIL: No Content-Security-Policy meta tag found in {filename}")
        sys.exit(1)

    print(f"SUCCESS: Found CSP: {parser.csp_content}")

    expected_directives = {
        "default-src": ["'self'"],
        "script-src": ["'self'", "https://cdn.tailwindcss.com", "'unsafe-inline'", "blob:"],
        "style-src": ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "https://placehold.co", "data:"],
        "connect-src": ["'self'"]
    }

    csp_directives = {}
    parts = parser.csp_content.split(';')
    for part in parts:
        part = part.strip()
        if not part:
            continue
        tokens = part.split()
        directive = tokens[0]
        values = tokens[1:]
        csp_directives[directive] = values

    errors = []
    for directive, expected_values in expected_directives.items():
        if directive not in csp_directives:
            errors.append(f"Missing directive: {directive}")
            continue

        actual_values = csp_directives[directive]
        for val in expected_values:
            if val not in actual_values:
                errors.append(f"Missing value '{val}' in directive '{directive}'")

    if errors:
        print("FAIL: CSP validation errors:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)

    print("SUCCESS: CSP matches expected configuration.")

if __name__ == "__main__":
    verify_csp("sqlmovebuffy.html")
