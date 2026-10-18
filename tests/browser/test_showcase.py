"""Ranked portfolio discovery, genuine screenshot loading and historic Buffy identity."""
from pathlib import Path
import pytest
from playwright.sync_api import expect

@pytest.mark.parametrize('width,height',[(320,568),(390,844),(768,600),(1440,900),(1440,600)])
def test_unified_showcase(clean_page,site_url,width,height):
    page=clean_page;page.set_viewport_size({'width':width,'height':height})
    page.goto(site_url+'/work')
    expect(page.locator('.showcase-feature')).to_have_count(3)
    expect(page.locator('.showcase-link')).to_have_count(6)
    hrefs=page.locator('.showcase-entry').evaluate_all('(els)=>els.map(e=>e.getAttribute("href"))')
    assert hrefs==['bsky_mutual_blocks.html','sqlmovebuffy.html','five_pm_cat_club.html','hollyoaks_history.html','sqlhttp.html','tna_history.html','gay_bar_closures.html','https://trove.schweg.xyz','https://tacobout.online']
    assert len(hrefs)==len(set(hrefs))
    for image in page.locator('.showcase-feature img').all():
        image.scroll_into_view_if_needed()
        assert image.evaluate('async(e)=>{await e.decode();return e.complete && e.naturalWidth>0 && e.naturalHeight>0}')
    for link in page.locator('.showcase-entry').all():
        link.focus();expect(link).to_be_focused()
        if link.get_attribute('href').startswith('http'):continue
        target=link.get_attribute('href')
        assert target.endswith('.html')
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    out=Path('artifacts/showcase');out.mkdir(parents=True,exist_ok=True)
    page.evaluate('scrollTo(0,0)');page.screenshot(path=str(out/f'work-{width}-{height}.png'),full_page=True)
    page.goto(site_url+'/notes.html');expect(page).to_have_url(site_url+'/work')
    expect(page.locator('.showcase-entry')).to_have_count(9)
    page.goto(site_url+'/notes');expect(page).to_have_url(site_url+'/work')

@pytest.mark.parametrize('route',['sqlmovebuffy','sqlmovebuffy.html'])
@pytest.mark.parametrize('width',[390,768,1440])
def test_historical_buffy_identity_and_workflow(clean_page,site_url,route,width):
    page=clean_page;page.set_viewport_size({'width':width,'height':900});page.goto(site_url+'/'+route)
    expect(page.locator('h1')).to_have_text('The Hellmouth Migration')
    page.evaluate('document.fonts.ready')
    assert page.locator('h1').evaluate('(e)=>getComputedStyle(e).fontFamily').startswith('Creepster')
    assert page.evaluate('document.fonts.check("48px Creepster")')
    assert page.locator('h2[data-chapter]').evaluate_all('(els)=>els.map(e=>e.dataset.chapter)')==['I','II','III','IV','V']
    for check in page.get_by_role('checkbox').all():check.check()
    expect(page.locator('#assessment-status')).to_have_text('4 of 4 assessment steps complete')
    page.locator('#compare').click();expect(page.locator('#compare-result')).to_contain_text('953')
    for topic in ['tde','ae','hsts','audit']:
        page.locator('#security').select_option(topic);assert len(page.locator('#security-text').inner_text())>30
    for _ in range(7):page.locator('#cutover').click()
    expect(page.locator('#cutover-status')).to_contain_text('Walkthrough complete')
    page.locator('#cutover').click();expect(page.locator('#cutover-list .done')).to_have_count(0)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    out=Path('artifacts/showcase');out.mkdir(parents=True,exist_ok=True)
    page.evaluate('scrollTo(0,0)');page.screenshot(path=str(out/f'buffy-{route}-{width}.png'),full_page=True)

def test_showcase_keyboard_touch_and_legacy_entrypoints(browser,site_url):
    context=browser.new_context(has_touch=True,viewport={'width':390,'height':844},reduced_motion='reduce')
    page=context.new_page();page.goto(site_url+'/work')
    page.locator('.showcase-feature').nth(1).focus();page.keyboard.press('Enter')
    expect(page.locator('h1')).to_have_text('The Hellmouth Migration')
    page.goto(site_url+'/notes')
    page.locator('.showcase-feature').nth(2).tap()
    expect(page.locator('#blocks-board')).to_be_visible()
    page.goto(site_url+'/index.html');page.locator('#projects a').tap()
    expect(page.locator('.showcase-entry')).to_have_count(9)
    context.close()
