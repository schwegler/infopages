"""The standalone profile stays usable without JavaScript or site chrome."""
import pytest

@pytest.mark.parametrize('width,height', [(390,844),(360,740),(320,568),(768,1024),(1440,1000),(844,390)])
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
    assert page.locator('#switch-code').inner_text()=='SW-8401-9041-4251'
    assert page.locator('#xbox-tag').inner_text()=='ajschwegler'
    assert not page.get_by_role('button',name='Copy Switch friend code').is_visible()
    assert page.locator('a[href="https://steamcommunity.com/profiles/76561198012788300"]').is_visible()
    assert page.locator('.signature img').evaluate('(e)=>e.complete && e.naturalWidth===1945')
    context.close()


@pytest.mark.parametrize('label,value,message', [('Switch friend code','SW-8401-9041-4251','Switch code copied.'),('Xbox gamertag','ajschwegler','Xbox gamertag copied.')])
def test_gaming_copy(clean_page, site_url, label, value, message):
    page=clean_page
    page.context.grant_permissions(['clipboard-read','clipboard-write'])
    page.goto(site_url+'/me')
    button=page.get_by_role('button',name='Copy '+label)
    button.focus()
    page.keyboard.press('Enter')
    page.get_by_role('status').filter(has_text=message).wait_for()
    assert page.evaluate('navigator.clipboard.readText()')==value
    assert button.bounding_box()['height']>=44
    assert button.bounding_box()['width']>=44


def test_switch_copy_denied(clean_page, site_url):
    page=clean_page
    page.add_init_script("Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('denied'))}})")
    page.goto(site_url+'/me')
    page.get_by_role('button',name='Copy Switch friend code').click()
    page.get_by_role('status').filter(has_text='Select and copy').wait_for()
    assert page.evaluate('window.getSelection().toString()')=='SW-8401-9041-4251'
