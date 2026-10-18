"""Exercise the actual experiment states at phone, tablet and desktop sizes."""
from pathlib import Path
import json
import pytest
from playwright.sync_api import expect

EXPERIMENTS = ['bsky_mutual_blocks', 'sqlhttp', 'sqlmovebuffy', 'hollyoaks_history', 'tna_history', 'gay_bar_closures']

@pytest.mark.parametrize('width', [390, 768, 1440])
@pytest.mark.parametrize('route', EXPERIMENTS)
def test_experiment_flow_and_results(clean_page, site_url, route, width):
    page = clean_page
    out = Path('artifacts/experiments'); out.mkdir(parents=True, exist_ok=True)
    page.set_viewport_size({'width': width, 'height': 900})
    page.goto(f'{site_url}/{route}.html')
    if route == 'hollyoaks_history':
        expect(page.locator('#timeline-count')).to_have_text('25 events shown')
    nav = page.get_by_role('navigation', name='On this page')
    expect(nav).to_be_visible()
    assert nav.bounding_box()['y'] < 600, 'Local navigation must precede the long-form content'
    for link in nav.get_by_role('link').all():
        link.click()
        target = page.locator(link.get_attribute('href'))
        expect(target).to_be_visible()
        assert target.bounding_box()['y'] >= 0
    page.goto(f'{site_url}/{route}.html')
    if route == 'bsky_mutual_blocks':
        launch = page.get_by_role('link', name='Launch application')
        expect(launch).to_have_attribute('href', 'https://bsky-mutual-blocks.pages.dev/')
        expect(page.get_by_role('link', name='View source')).to_have_attribute('href', 'https://github.com/schwegler/bsky-mutual-blocks')
        assert launch.bounding_box()['y'] < 1000
    elif route == 'sqlhttp':
        assert page.get_by_role('button', name='SAFE', exact=True).bounding_box()['y'] < 850
        page.get_by_role('textbox', name='Document payload').fill('local test payload')
        for mode, result in [('SAFE','blocked'),('EXTERNAL_ACCESS','No network request was sent'),('UNSAFE','Review required')]:
            page.get_by_role('button', name=mode, exact=True).click()
            page.get_by_role('button', name='Run demonstration').click()
            expect(page.locator('#console')).to_contain_text(result)
        assert page.locator('#console').evaluate('(el)=>getComputedStyle(el).color !== getComputedStyle(el).backgroundColor')
        page.locator('#reset-mission').click()
        expect(page.get_by_role('textbox', name='Document payload')).to_have_value('<p>Hello, world.</p>')
        expect(page.get_by_role('button', name='SAFE', exact=True)).to_have_attribute('aria-pressed', 'true')
    elif route == 'sqlmovebuffy':
        for checkbox in page.get_by_role('checkbox').all(): checkbox.check()
        expect(page.locator('#assessment-status')).to_have_text('4 of 4 assessment steps complete')
        page.locator('#compare').click()
        expect(page.locator('#compare-result')).to_contain_text('953')
        for topic in ['tde', 'ae', 'hsts', 'audit']:
            page.locator('#security').select_option(topic)
            assert len(page.locator('#security-text').inner_text()) > 30
        for _ in range(7): page.locator('#cutover').click()
        expect(page.locator('#cutover-status')).to_contain_text('Walkthrough complete')
        page.locator('#cutover').click()
        expect(page.locator('#cutover-list .done')).to_have_count(0)
    elif route == 'hollyoaks_history':
        expect(page.locator('#timeline-count')).to_have_text('25 events shown')
        page.get_by_role('combobox').select_option('2008')
        expect(page.locator('#timeline article')).to_have_count(2)
        page.get_by_role('button', name='Families', exact=True).click()
        expect(page.locator('#history-timeline')).not_to_be_visible()
        page.get_by_text('The Cunninghams', exact=True).click()
        page.get_by_role('button', name='Gordon Cunningham', exact=True).click()
        expect(page.get_by_role('dialog')).to_be_visible()
        page.screenshot(path=str(out / f'history-dialog-{width}.png'))
        page.keyboard.press('Escape')
        page.get_by_role('button', name='Themes', exact=True).click()
        expect(page.locator('#history-themes .source-chart')).to_have_count(4)
        page.evaluate('window.scrollTo(0,0)')
        page.screenshot(path=str(out / f'history-themes-{width}.png'), full_page=True)
        page.get_by_role('button', name='Timeline', exact=True).click()
        expect(page.get_by_role('combobox')).to_have_value('2008')
    elif route == 'tna_history':
        assert page.get_by_role('button', name='2007', exact=True).bounding_box()['y'] < 850
        for year in ['2007', '2008', '2009']:
            page.get_by_role('button', name=year, exact=True).click()
            expect(page.locator('#tna-story .source-chart')).to_be_visible()
            page.get_by_text('Explore the original visualization data', exact=True).click()
            expect(page.get_by_role('table')).to_be_visible()
            page.evaluate('window.scrollTo(0,0)')
            page.screenshot(path=str(out / f'tna-{year}-{width}.png'), full_page=True)
        expect(page.locator('#tna-story svg[role="img"]')).to_have_count(1)
    else:
        for label in ['Women’s bars', 'People of color', 'All bars']:
            page.get_by_role('button', name=label, exact=True).click()
            expect(page.locator('#demographic meter')).to_have_count(3)
        for label in ['02 / Dating apps', '03 / Mainstreaming', '01 / Gentrification']:
            page.get_by_role('button', name=label, exact=True).click()
            assert len(page.locator('#factor').inner_text()) > 60
        expect(page.locator('#geography .source-chart')).to_be_visible()
        expect(page.locator('#geography meter')).to_have_count(7)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    # Save the first reading view and the interactive result for human review.
    out = Path('artifacts/experiments'); out.mkdir(parents=True, exist_ok=True)
    page.evaluate('window.scrollTo(0,0)')
    page.screenshot(path=str(out / f'{route}-{width}-result.png'), full_page=True)
    page.goto(f'{site_url}/{route}.html')
    if route == 'hollyoaks_history': expect(page.locator('#timeline-count')).to_have_text('25 events shown')
    page.screenshot(path=str(out / f'{route}-{width}.png'), full_page=True)


def test_brand_contact_and_no_js_history(browser, site_url):
    context=browser.new_context(java_script_enabled=False, viewport={'width':390,'height':844})
    page=context.new_page(); page.goto(f'{site_url}/hollyoaks_history.html')
    expect(page.locator('#history-families')).to_be_visible()
    expect(page.locator('#history-themes')).to_be_visible()
    page.goto(f'{site_url}/index.html')
    expect(page.get_by_role('link', name='Email andrew@schweg.xyz')).to_have_attribute('href','mailto:andrew@schweg.xyz')
    expect(page.get_by_role('link', name='A schweg.xyz project')).to_have_attribute('href','https://schweg.xyz/')
    assert 'email' not in json.loads(page.locator('script[type="application/ld+json"]').text_content())
    page.goto(f'{site_url}/resume.html')
    expect(page.locator('main a[href="mailto:andrew@schweg.xyz"]')).to_be_visible()
    context.close()


def test_mascot_disclosures_are_native_and_use_approved_png(clean_page, site_url):
    page=clean_page
    for route in ['work.html', 'notes.html']:
        page.goto(f'{site_url}/{route}')
        image=page.locator('.mascot-signature img')
        expect(image).not_to_be_visible()
        page.locator('.mascot-note summary').click()
        expect(image).to_be_visible()
        assert image.evaluate('async(el)=>{await el.decode();return el.naturalWidth===1145 && el.naturalHeight===1374}')
        assert image.bounding_box()['width']==96
