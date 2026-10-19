"""Rendered geometry catches intrinsic sizing that aspect-ratio CSS alone misses."""
import re
import json
import pytest
from playwright.sync_api import expect


VIEWPORTS = [
    (320, 568), (360, 740), (390, 844), (620, 800), (768, 1024),
    (820, 1180), (900, 900), (1024, 768), (1440, 900), (2048, 1215),
]


def assert_square_puzzle(page):
    geometry = page.locator('#sudoku-board').evaluate('''board => {
      const rect = e => {const r=e.getBoundingClientRect();
        return {width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom};};
      return {board:rect(board),area:rect(board.closest('.sudoku-area')),
        cells:[...board.children].map(rect),
        controls:[...board.closest('.sudoku-area').querySelectorAll('button')].map(rect),
        viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth};
    }''')
    board = geometry['board']
    assert abs(board['width'] - board['height']) <= 1, geometry
    assert abs(board['width'] - min(432, geometry['area']['width'])) <= 1, geometry
    assert len(geometry['cells']) == 81
    for cell in geometry['cells']:
        assert abs(cell['width'] - cell['height']) <= 1, cell
        assert cell['left'] >= board['left'] and cell['right'] <= board['right'] + 1
        assert cell['top'] >= board['top'] and cell['bottom'] <= board['bottom'] + 1
    for control in geometry['controls']:
        assert control['left'] >= 0 and control['right'] <= geometry['viewport'] + 1, control
    assert not geometry['overflow'], geometry


@pytest.mark.parametrize('width,height', VIEWPORTS)
def test_sudoku_board_and_all_cells_stay_square(clean_page, site_url, width, height):
    page = clean_page
    page.set_viewport_size({'width': width, 'height': height})
    page.goto(site_url + '/five_pm_cat_club.html')
    page.locator('[data-game="sudoku"]').click()
    assert_square_puzzle(page)
    # Cell rerenders and keyboard focus must preserve the same geometry.
    empty = page.get_by_role('gridcell', name=re.compile('empty')).first
    label = empty.get_attribute('aria-label').split(':')[0]
    empty.focus()
    page.keyboard.press('Enter')
    page.keyboard.press('1')
    selected = page.get_by_role('gridcell', name=re.compile(re.escape(label) + ': 1'))
    expect(selected).to_be_focused()
    page.keyboard.press('Backspace')
    expect(page.get_by_role('gridcell', name=label + ': empty', exact=True)).to_be_focused()
    page.locator('#number-pad button').first.click()
    expect(selected).to_have_count(1)
    page.locator('#sudoku-erase').click()
    expect(page.get_by_role('gridcell', name=label + ': empty', exact=True)).to_have_count(1)
    page.locator('#sudoku-check').click()
    expect(page.locator('#sudoku-message')).not_to_be_empty()
    page.locator('#new-game').click()
    expect(page.locator('#sudoku-message')).to_be_empty()
    assert_square_puzzle(page)


def test_sudoku_resize_and_larger_text_remain_square(clean_page, site_url):
    page = clean_page
    page.goto(site_url + '/five_pm_cat_club.html')
    page.locator('[data-game="sudoku"]').click()
    # Exercise reflow in one visit rather than only fresh page loads.
    for width, height in [(1440, 900), (720, 450), (320, 568), (820, 1180)]:
        page.set_viewport_size({'width': width, 'height': height})
        assert_square_puzzle(page)
    # An increased inherited reading line-height must not inflate implicit rows.
    page.locator('.cat-club').evaluate("e => {e.style.lineHeight='2.5';e.style.fontSize='20px';}")
    assert_square_puzzle(page)


@pytest.mark.parametrize('width,height,zoom', [(1440, 900, 2), (820, 1180, 2), (1280, 900, 4)])
def test_sudoku_native_browser_zoom(playwright, browser_name, site_url, tmp_path, width, height, zoom):
    if browser_name != 'chromium':
        pytest.skip('Native zoom uses the Chromium extension API; WebKit covers CSS reflow separately.')
    extension = tmp_path / 'zoom-extension'
    extension.mkdir()
    (extension / 'manifest.json').write_text(json.dumps({
        'manifest_version': 3, 'name': 'Sudoku zoom QA', 'version': '1.0',
        'permissions': ['tabs'], 'background': {'service_worker': 'background.js'},
    }))
    (extension / 'background.js').write_text('chrome.runtime.onInstalled.addListener(() => {});')
    context = playwright.chromium.launch_persistent_context(
        str(tmp_path / 'profile'), channel='chromium', headless=True,
        viewport={'width': width, 'height': height},
        args=[f'--disable-extensions-except={extension}', f'--load-extension={extension}'],
    )
    try:
        worker = context.service_workers[0] if context.service_workers else context.wait_for_event('serviceworker')
        page = context.pages[0]
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.add_init_script("window.__csp=[];document.addEventListener('securitypolicyviolation',e=>__csp.push(e.violatedDirective))")
        page.goto(site_url + '/five_pm_cat_club.html')
        actual_zoom = worker.evaluate('''async ({url,zoom}) => {
          const tab=(await chrome.tabs.query({})).find(tab=>tab.url===url);
          await chrome.tabs.setZoom(tab.id,zoom);return await chrome.tabs.getZoom(tab.id);
        }''', {'url': page.url, 'zoom': zoom})
        assert actual_zoom == pytest.approx(zoom)
        page.wait_for_function('(width)=>Math.abs(innerWidth-width)<=1', arg=width / zoom)
        page.locator('[data-game="sudoku"]').click()
        assert_square_puzzle(page)
        page.get_by_role('gridcell', name=re.compile('empty')).first.click()
        page.keyboard.press('1')
        expect(page.locator('#sudoku-board .selected')).to_have_text('1')
        expect(page.locator('#sudoku-board .selected')).to_be_focused()
        assert_square_puzzle(page)
        assert not errors and not page.evaluate('__csp')
    finally:
        context.close()
