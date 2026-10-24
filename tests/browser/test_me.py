"""The standalone profile stays usable without JavaScript or site chrome."""
import pytest

@pytest.mark.parametrize('width,height', [(390,844),(768,1024),(1440,1000),(844,390)])
def test_profile(clean_page, site_url, width, height):
    page=clean_page
    page.set_viewport_size({'width':width,'height':height})
    page.goto(site_url+'/me')
    assert page.locator('h1').inner_text()=='Schwegler.'
    assert page.locator('header').count()==0
    assert page.locator('a[href="https://bsky.app/profile/schwegler.lol"]').count()==1
    assert page.locator('a[href^="mailto:"]').get_attribute('href')=='mailto:andrew@schweg.xyz'
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    for link in page.locator('a:not(.skip)').all():
        assert link.bounding_box()['height'] >= 44
    page.keyboard.press('Tab')
    assert page.locator('.skip').evaluate('(e)=>e===document.activeElement')
    page.keyboard.press('Enter')
    assert page.evaluate('location.hash')=='#main'
    assert page.locator('h1').is_visible()

@pytest.mark.parametrize('alias',['/about','/about/','/about.html'])
def test_profile_aliases(page, site_url, alias):
    response=page.goto(site_url+alias)
    assert response.status==200
    assert page.url==site_url+'/me'
    assert response.request.redirected_from.response().status==301


def test_profile_without_javascript(browser, site_url):
    context=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
    page=context.new_page()
    page.goto(site_url+'/me')
    assert page.locator('a[href="https://trove.schweg.xyz"]').is_visible()
    assert page.locator('.signature img').evaluate('(e)=>e.complete && e.naturalWidth===1945')
    context.close()
