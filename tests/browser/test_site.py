from pathlib import Path
import json
import pytest
from playwright.sync_api import expect

ROUTES=['five_pm_cat_club.html','index.html','work.html','notes.html','resume.html','bsky_mutual_blocks.html','sqlhttp.html','sqlmovebuffy.html','hollyoaks_history.html','tna_history.html','gay_bar_closures.html','tos.html']
@pytest.mark.parametrize('route',ROUTES)
def test_pages_are_self_contained_and_responsive(clean_page,site_url,route):
    page=clean_page
    requests=[];page.on('request',lambda request:requests.append(request.url))
    page.goto(f'{site_url}/{route}')
    expect(page.locator('h1')).to_have_count(1)
    support=page.locator('footer .support-links')
    expect(support.locator('summary')).to_have_text('Help with hosting')
    support.locator('summary').click()
    for label,url in [('PayPal','https://paypal.me/schwegler'),('Venmo','https://venmo.com/u/Schwegler'),('Cash App','https://cash.app/$schwg')]:
        link=support.get_by_role('link',name=label,exact=True)
        expect(link).to_be_visible()
        expect(link).to_have_attribute('href',url)
    if route=='hollyoaks_history.html':expect(page.locator('#timeline-count')).to_have_text('25 events shown')
    for width in (1536,390,320):
        page.set_viewport_size({'width':width,'height':900})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'{route} overflows at {width}px'
    page.locator('details').evaluate_all('(nodes)=>nodes.forEach(n=>n.open=true)')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'{route} expanded content overflows at 320px'
    assert all(url.startswith(site_url) for url in requests), requests
    for href in page.locator('a[href]').evaluate_all('(nodes)=>nodes.map(n=>n.href)'):
        assert not ('bsky.app/profile/' in href or 'schwegler.lol' in href)


def test_navigation_filter_and_mobile_keyboard(clean_page,site_url):
    page=clean_page;page.goto(f'{site_url}/work.html')
    expect(page.locator('.showcase-feature')).to_have_count(3)
    expect(page.locator('.showcase-link')).to_have_count(6)
    assert page.locator('.showcase-entry').evaluate_all('(els)=>els.map(e=>Number(e.dataset.rank))') == list(range(1,10))
    page.set_viewport_size({'width':390,'height':844})
    menu=page.get_by_role('button',name='Menu')
    menu.click();expect(menu).to_have_attribute('aria-expanded','true')
    page.keyboard.press('Escape');expect(menu).to_be_focused();expect(menu).to_have_attribute('aria-expanded','false')
    menu.click();page.get_by_role('navigation').get_by_role('link',name='Contact',exact=True).click()
    expect(page.locator('#contact')).to_be_visible()
    expect(menu).to_have_attribute('aria-expanded','false')


def test_navigation_without_javascript(browser,site_url):
    context=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
    page=context.new_page();page.goto(f'{site_url}/index.html')
    expect(page.get_by_role('navigation')).to_be_visible()
    page.get_by_role('navigation').get_by_role('link',name='Projects & experiments',exact=True).click()
    expect(page.locator('h1')).to_contain_text('Projects &')


@pytest.mark.parametrize('width',[1440,390,320])
def test_hosting_support_touch_and_keyboard_without_javascript(browser,site_url,width):
    context=browser.new_context(java_script_enabled=False,viewport={'width':width,'height':900})
    try:
        page=context.new_page();page.goto(f'{site_url}/index.html')
        support=page.locator('footer .support-links')
        summary=support.locator('summary')
        expect(support.get_by_role('link',name='PayPal',exact=True)).not_to_be_visible()
        assert not support.evaluate('(el)=>el.open')
        box=summary.bounding_box()
        assert box['height'] >= 44
        # The extra hit area must activate the native disclosure, not just the text.
        summary.click(position={'x':box['width']/2,'y':box['height']-2})
        assert support.evaluate('(el)=>el.open')
        summary.focus();page.keyboard.press('Enter')
        assert not support.evaluate('(el)=>el.open')
        page.keyboard.press('Enter');page.keyboard.press('Tab')
        expect(support.get_by_role('link',name='PayPal',exact=True)).to_be_focused()
        assert support.locator('a').evaluate_all('(els)=>els.map(a=>a.getAttribute("href"))') == [
            'https://paypal.me/schwegler','https://venmo.com/u/Schwegler','https://cash.app/$schwg']
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        artifacts=Path(__file__).resolve().parents[2]/'artifacts'
        artifacts.mkdir(exist_ok=True)
        page.screenshot(path=str(artifacts/f'hosting-support-{width}.png'))
    finally:
        context.close()
    context.close()


def test_sql_simulation_cannot_execute_payload(clean_page,site_url):
    page=clean_page;page.goto(f'{site_url}/sqlhttp.html')
    page.get_by_role('textbox',name='Document payload').fill('<script>window.payloadExecuted=true</script>')
    page.get_by_role('button',name='Run demonstration').click()
    expect(page.locator('#console')).to_contain_text('blocked')
    assert page.evaluate('window.payloadExecuted') is None
    page.get_by_role('button',name='EXTERNAL_ACCESS',exact=True).click()
    page.get_by_role('button',name='Run demonstration').click()
    expect(page.locator('#console')).to_contain_text('No network request was sent')
    page.get_by_role('button',name='UNSAFE',exact=True).click()
    page.get_by_role('button',name='Run demonstration').click()
    expect(page.locator('#console')).to_contain_text('Review required')


def test_migration_complete_rehearsal_and_reset(clean_page,site_url):
    page=clean_page;page.goto(f'{site_url}/sqlmovebuffy.html')
    page.get_by_role('checkbox').first.check()
    expect(page.locator('#assessment-status')).to_have_text('1 of 4 assessment steps complete')
    page.get_by_role('button',name='Run example comparison').click()
    expect(page.locator('#compare-result')).to_be_visible()
    expect(page.locator('#compare-result')).to_contain_text('953')
    page.get_by_role('combobox',name='Security topic').select_option('ae')
    expect(page.locator('#security-text')).to_contain_text('keys controlled outside')
    for _ in range(7):page.locator('#cutover').click()
    expect(page.locator('#cutover-status')).to_contain_text('7 of 7 steps rehearsed')
    page.get_by_role('button',name='Reset rehearsal').click()
    expect(page.locator('#cutover-list .done')).to_have_count(0)
    page.get_by_text('Ask Giles: what should I check?',exact=True).click()
    expect(page.get_by_text('This is a scripted guide, not an AI service.',exact=False)).to_be_visible()


def test_history_filter_dialog_focus_and_empty_state(clean_page,site_url):
    page=clean_page;page.goto(f'{site_url}/hollyoaks_history.html')
    expect(page.locator('#timeline-count')).to_have_text('25 events shown')
    page.get_by_role('combobox').select_option('2008');expect(page.locator('#timeline article')).to_have_count(2)
    page.get_by_role('button',name='Families',exact=True).click()
    page.get_by_text('The Cunninghams',exact=True).click()
    trigger=page.get_by_role('button',name='Gordon Cunningham',exact=True);trigger.click()
    expect(page.get_by_role('dialog')).to_contain_text('Gordon Cunningham')
    expect(page.get_by_role('button',name='Close character details')).to_be_focused()
    page.keyboard.press('Escape');expect(page.get_by_role('dialog')).not_to_be_visible();expect(trigger).to_be_focused()
    page.get_by_role('button',name='Timeline',exact=True).click()
    page.locator('#year').evaluate("s=>{const o=new Option('9999','9999');s.add(o)}")
    page.get_by_role('combobox').select_option('9999')
    expect(page.locator('#timeline')).to_have_text('No major events recorded for this selection.')


def test_history_loading_failure_has_retry(clean_page,site_url):
    page=clean_page;page.route('**/hollyoaks_data.json',lambda route:route.abort())
    page.goto(f'{site_url}/hollyoaks_history.html')
    expect(page.locator('#timeline-count')).to_contain_text('could not load')
    page.unroute('**/hollyoaks_data.json');page.get_by_role('button',name='Try again').click()
    expect(page.locator('#timeline-count')).to_have_text('25 events shown')


def test_research_controls_and_accessible_data(clean_page,site_url):
    page=clean_page;page.goto(f'{site_url}/tna_history.html')
    page.get_by_role('button',name='2008',exact=True).click()
    expect(page.locator('#tna-story h3')).to_contain_text('Main Event Mafia')
    page.get_by_text('Explore the original visualization data',exact=True).click()
    expect(page.get_by_role('table')).to_contain_text('TNA Frontline')
    page.goto(f'{site_url}/gay_bar_closures.html')
    page.get_by_role('button',name='Women’s bars',exact=True).click()
    expect(page.locator('#demographic h3')).to_have_text('Women’s spaces')
    expect(page.locator('#demographic').get_by_role('meter')).to_have_count(3)
    page.get_by_role('button',name='02 / Dating apps').click()
    expect(page.locator('#factor')).to_contain_text('online connection')
    expect(page.locator('#geography')).to_contain_text('Not verified venue counts')


def test_print_profile_metadata_and_evidence(clean_page,site_url):
    page=clean_page;page.goto(f'{site_url}/index.html')
    person=json.loads(page.locator('script[type="application/ld+json"]').text_content())
    assert set(person['sameAs'])=={'https://github.com/schwegler','https://www.linkedin.com/in/schwegler','https://tacobout.online'}
    page.goto(f'{site_url}/resume.html');page.emulate_media(media='print')
    expect(page.locator('header')).not_to_be_visible();expect(page.locator('footer')).not_to_be_visible();expect(page.locator('.print-controls')).not_to_be_visible()
    assert 'pending' not in page.locator('main').inner_text().lower()
    out=Path('artifacts');out.mkdir(exist_ok=True)
    for paper in ['Letter', 'A4']:
        page.pdf(path=str(out/f'resume-{paper}.pdf'),format=paper,tagged=True,outline=True)
    page.emulate_media(media='screen');page.set_viewport_size({'width':1536,'height':1024})
    page.screenshot(path=str(out/'resume-desktop.png'),full_page=True)
    page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(out/'resume-mobile.png'),full_page=True)


def test_history_dataset_is_rendered_as_text(clean_page,site_url):
    page=clean_page
    data=json.loads((Path(__file__).resolve().parents[2]/'hollyoaks_data.json').read_text())
    payload='<img src=x onerror="window.injected=true">'
    data['characters']['gordon_c']['name']=payload
    data['timelineEvents'][0]['title']=payload
    page.route('**/hollyoaks_data.json',lambda route:route.fulfill(json=data))
    page.goto(f'{site_url}/hollyoaks_history.html')
    expect(page.locator('#timeline-count')).to_have_text('25 events shown')
    page.get_by_role('button',name='Families',exact=True).click()
    page.get_by_text('The Cunninghams',exact=True).click()
    expect(page.get_by_role('button',name=payload,exact=True)).to_be_visible()
    expect(page.locator('#families img, #timeline img')).to_have_count(0)
    assert page.evaluate('window.injected') is None


def test_approved_signature_alignment_and_credit(clean_page,site_url):
    page=clean_page;page.goto(f'{site_url}/index.html')
    for width in [390,768,1440]:
        page.set_viewport_size({'width':width,'height':900})
        logo=page.locator('header img.wordmark')
        assert logo.evaluate('async(el)=>{await el.decode();return el.naturalWidth===1945&&el.naturalHeight===576}')
        expect(page.get_by_role('link',name='Andrew Schwegler home',exact=True)).to_be_visible()
        expect(page.get_by_role('link',name='A schweg.xyz project',exact=True)).to_have_attribute('href','https://schweg.xyz/')
        credit=page.locator('.creator-credit img')
        assert credit.bounding_box()['width']==132
        if width==1440:
            centers=page.locator('header .brand-name,header #nav').evaluate_all('(nodes)=>nodes.map(el=>{const r=el.getBoundingClientRect();return r.y+r.height/2})')
            assert abs(centers[0]-centers[1])<2
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')


def test_comprehensive_resume_reading_and_print_action(clean_page, site_url):
    page=clean_page; page.goto(f'{site_url}/resume.html')
    expect(page.get_by_role('heading', name='Andrew Schwegler', exact=True)).to_be_visible()
    expect(page.locator('#current')).to_be_visible()
    expect(page.locator('main')).to_contain_text('July 2026–present')
    expect(page.locator('main')).to_contain_text('June 2024–June 2026')
    expect(page.locator('main')).to_contain_text('Techie Diva')
    expect(page.locator('main')).to_contain_text('2007–2013')
    expect(page.locator('.resume-role')).to_have_count(8)
    expect(page.locator('.earlier-roles > li')).to_have_count(9)
    expect(page.locator('.resume-projects a')).to_have_count(3)
    expect(page.locator('main a[href="mailto:andrew@schweg.xyz"]')).to_have_text('andrew@schweg.xyz')
    page.evaluate('window.print = () => { window.printRequested = true; }')
    page.get_by_role('button', name='Print / save as PDF').click()
    assert page.evaluate('window.printRequested')
    for width in [1440, 390]:
        page.set_viewport_size({'width':width,'height':900})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.emulate_media(media='print')
    expect(page.locator('.print-controls')).not_to_be_visible()
    expect(page.locator('footer')).not_to_be_visible()
    assert page.locator('.resume-page').count()==3
    for group in page.locator('.resume-page').all()[1:]:
        assert group.evaluate("el => getComputedStyle(el).breakBefore")=='page'
