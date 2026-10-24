"""The standalone profile stays usable without JavaScript or site chrome."""
import pytest

@pytest.mark.parametrize('width,height', [(390,844),(360,740),(320,568),(768,1024),(1440,1000),(844,390)])
def test_profile(clean_page, site_url, width, height):
    page=clean_page
    page.set_viewport_size({'width':width,'height':height})
    page.goto(site_url+'/me')
    assert page.locator('h1').inner_text()=='Schwegler.'
    assert page.locator('header').count()==0
    assert page.locator('.socials a[href="https://bsky.app/profile/schwegler.lol"]').count()==1
    assert page.locator('a[href^="mailto:"]').get_attribute('href')=='mailto:andrew@schweg.xyz'
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    for link in page.locator('a:not(.skip)').all():
        if link.is_visible():
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


def test_mobile_disclosures_and_order(clean_page,site_url):
    page=clean_page
    page.set_viewport_size({'width':390,'height':844})
    page.goto(site_url+'/me')
    gaming=page.locator('.gaming')
    assert gaming.get_attribute('open') is None
    assert page.locator('.gaming').evaluate('(e)=>!!(document.querySelector(".socials").compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING)')
    assert page.locator('.socials a').count()==8
    for link in page.locator('.socials a').all():
        box=link.bounding_box();assert box['height']>=44 and box['width']>=44
    summary=gaming.locator('summary');summary.focus();page.keyboard.press('Enter')
    assert gaming.get_attribute('open') is not None
    assert page.locator('#switch-code').is_visible()
    more=page.locator('.more-links summary');more.focus();page.keyboard.press('Enter')
    assert page.get_by_role('link',name='GitHub',exact=True).is_visible()


def test_latest_panel_refreshes_and_removes_retracted_content(clean_page,site_url):
    import base64
    page=clean_page
    state={'trove':True,'text':'First newest RSS entry','calls':0}
    def respond(route):
        if 'cover=' in route.request.url:
            route.fulfill(status=200,content_type='image/png',body=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='));return
        state['calls']+=1
        route.fulfill(status=200,json={'posts':[{'title':'Public article','url':'https://tacobout.online/2026/10/23/public/','date':'2026-10-23T12:00:00Z','excerpt':'Published excerpt.'}],'bluesky':{'text':state['text'],'date':'2026-10-23T15:00:00Z','url':'https://bsky.app/profile/schwegler.lol/post/newest'},'trove':{'title':'Public collection title','type':'Book','year':'2026','url':'https://trove.schweg.xyz/books/12-public-title','cover':'/api/profile-latest?cover=book%2F12'} if state['trove'] else None,'checkedAt':'2026-10-24T05:00:00Z'},headers={'Cache-Control':'private, no-store'})
    page.route('**/api/profile-latest*',respond)
    page.emulate_media(reduced_motion='reduce')
    page.goto(site_url+'/me')
    page.locator('.lately-cue').click()
    page.get_by_text('First newest RSS entry',exact=True).wait_for()
    image=page.locator('#latest-trove img');assert image.get_attribute('alt')=='Public collection title cover'
    assert image.get_attribute('src').startswith('/api/profile-latest?cover=')
    page.get_by_role('link',name='Back to card').click()
    page.wait_for_function('()=>document.querySelector("#latest-trove").childElementCount===0')
    state['text']='Changed newest RSS entry';state['trove']=False
    page.locator('.lately-cue').click()
    page.get_by_text('Changed newest RSS entry',exact=True).wait_for()
    assert page.locator('#latest-trove img').count()==0
    assert page.get_by_text('Public collection title',exact=True).count()==0
    assert state['calls']>=2
    # A visibility return must revalidate instead of restoring the previous DOM.
    page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
    assert page.locator('#latest-bluesky').inner_text()==''
    state['text']='Newest after return'
    page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))")
    page.get_by_text('Newest after return',exact=True).wait_for()


def test_latest_failure_has_source_links_without_stale_content(clean_page,site_url):
    page=clean_page
    page.route('**/api/profile-latest',lambda route:route.fulfill(status=503,body='Unavailable'))
    page.goto(site_url+'/me')
    page.locator('.lately-cue').click()
    page.get_by_text('Public updates are unavailable right now. The source links above still work.',exact=True).wait_for()
    assert page.locator('#latest-trove img').count()==0
    assert page.locator('#blog-title a').get_attribute('href')=='https://tacobout.online'
    assert page.locator('#trove-title a').get_attribute('href')=='https://trove.schweg.xyz/@schwegler'


def test_cover_failure_removes_item_instead_of_showing_stale_title(clean_page,site_url):
    page=clean_page
    def respond(route):
        if 'cover=' in route.request.url:
            route.fulfill(status=404,body='Unavailable');return
        route.fulfill(status=200,json={'posts':None,'bluesky':None,'trove':{'title':'Retracted collection item','type':'Book','year':'2026','url':'https://trove.schweg.xyz/books/12-public-title','cover':'/api/profile-latest?cover=book%2F12'},'checkedAt':'2026-10-24T05:00:00Z'})
    page.route('**/api/profile-latest*',respond)
    page.goto(site_url+'/me')
    page.locator('.lately-cue').click()
    page.get_by_text('The public Trove item or cover is unavailable right now.',exact=True).wait_for()
    assert page.get_by_text('Retracted collection item',exact=True).count()==0
    assert page.locator('#latest-trove img').count()==0
