"""Validate the deployable static pages and their public references without dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
ROUTES = {'dress-up.html','me.html','five_pm_cat_club.html','index.html','work.html','notes.html','resume.html','bsky_mutual_blocks.html','sqlhttp.html','sqlmovebuffy.html','hollyoaks_history.html','tna_history.html','gay_bar_closures.html','tos.html'}
PROFILE_URLS = {'https://github.com/schwegler','https://www.linkedin.com/in/schwegler','https://tacobout.online'}

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.refs=[]; self.h1=0; self.inline_handlers=[]; self.json_scripts=[]; self._json=False
    def handle_starttag(self, tag, attrs):
        self.h1 += tag == 'h1'
        href = src = None
        for k, v in attrs:
            if k == 'id' and v:
                self.ids.append(v)
            elif k.startswith('on'):
                self.inline_handlers.append(k)
            elif k == 'href':
                href = v
            elif k == 'src':
                src = v
            elif tag == 'script' and k == 'type' and v == 'application/ld+json':
                self._json = True
        if tag in ('a', 'link', 'script', 'img'):
            ref = href or src
            if ref:
                self.refs.append((tag, ref))
    def handle_endtag(self, tag):
        if tag=='script': self._json=False
    def handle_data(self, text):
        if self._json: self.json_scripts.append(json.loads(text))

def validate():
    assert {p.name for p in ROOT.glob('*.html')} == ROUTES, 'Route inventory changed unexpectedly'
    parsed={}
    checked_files = set(ROUTES)
    for name in ROUTES:
        page=Page(); page.feed((ROOT/name).read_text()); parsed[name]=page
        assert page.h1==1, f'{name}: expected one H1'
        assert len(page.ids)==len(set(page.ids)), f'{name}: duplicate IDs'
        assert not page.inline_handlers, f'{name}: inline handler not permitted by CSP'
        for data in page.json_scripts:
            if data.get('@type')=='Person':
                assert set(data['sameAs'])==PROFILE_URLS, 'Unexpected profile metadata'
    references=0
    for name,page in parsed.items():
        for tag,ref in page.refs:
            url=urlsplit(ref)
            if url.scheme or url.netloc:
                assert url.scheme=='https' or (tag=='a' and ref=='mailto:andrew@schweg.xyz'), f'{name}: unexpected external URL {ref}'
                assert tag not in ('script','img'), f'{name}: runtime remote asset {ref}'
                # Public identity links are explicitly scoped; project/service destinations remain separate.
                if '/profile/' in url.path or url.hostname in ('bsky.app','www.bsky.app'):
                    assert name == 'me.html' and ref == 'https://bsky.app/profile/schwegler.lol', f'{name}: unexpected profile destination'
                continue
            target=url.path or name
            if target not in checked_files:
                path=ROOT/target
                assert path.is_file(), f'{name}: missing {ref}'
                checked_files.add(target)
            if url.fragment and target.endswith('.html'):
                assert url.fragment in parsed[target].ids, f'{name}: missing fragment {ref}'
            references+=1
    tree=ET.parse(ROOT/'sitemap.xml')
    sitemap={node.text.rsplit('/',1)[-1] or 'index.html' for node in tree.findall('.//{*}loc')}
    sitemap = {{'me':'me.html','dress-up':'dress-up.html'}.get(route,route) for route in sitemap}
    assert sitemap==ROUTES, 'Sitemap does not cover every intended route'
    print(f'Validated {len(ROUTES)} routes and {references} local references; metadata, CSP-compatible handlers and sitemap passed.')

if __name__=='__main__': validate()
