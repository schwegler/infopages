import functools
import http.server
import os
from pathlib import Path
import threading
import pytest

ROOT=Path(__file__).resolve().parents[2]
@pytest.fixture(scope='session')
def site_url():
    class Handler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            for line in (ROOT/'_headers').read_text().splitlines():
                if line.startswith('  '):
                    key,value=line.strip().split(': ',1)
                    self.send_header(key,value)
            super().end_headers()
    handler=functools.partial(Handler,directory=str(ROOT))
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
    thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
    yield f'http://127.0.0.1:{server.server_address[1]}'
    server.shutdown();server.server_close();thread.join()

@pytest.fixture(scope='session')
def browser_type_launch_args(browser_type_launch_args):
    channel=os.environ.get('INFO_PAGES_BROWSER_CHANNEL')
    return {**browser_type_launch_args,**({'channel':channel} if channel else {})}

@pytest.fixture
def clean_page(page):
    errors=[]
    page.add_init_script("window.__policyViolations=[];document.addEventListener('securitypolicyviolation',e=>window.__policyViolations.push(e.violatedDirective))")
    page.on('pageerror',lambda error:errors.append(str(error)))
    yield page
    assert not errors, f'Uncaught browser errors: {errors}'
    assert not page.evaluate('window.__policyViolations || []'), 'Content Security Policy violation'
