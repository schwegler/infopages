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


@pytest.mark.parametrize('width,height', [(320,568),(375,548),(375,812),(390,664),(390,781),(390,844),(430,932),(1440,900)])
def test_card_fits_usable_viewport(clean_page, site_url, width, height):
    page=clean_page
    page.set_viewport_size({'width':width,'height':height})
    page.goto(site_url+'/me')
    assert abs(page.locator('#card').bounding_box()['height']-height)<=1
    for selector in ('.socials','.gaming summary','.lately-cue'):
        box=page.locator(selector).bounding_box()
        assert box['y']>=0 and box['y']+box['height']<=height
    assert page.locator('.features').evaluate('(e)=>e.nextElementSibling.matches(".socials")')


def wait_for_panel(page, selector):
    page.wait_for_function('(selector)=>Math.abs(document.querySelector(selector).getBoundingClientRect().top)<2',arg=selector)


def test_wheel_transition_and_keyboard_return(clean_page, site_url):
    page=clean_page
    page.set_viewport_size({'width':1440,'height':900})
    page.goto(site_url+'/me')
    page.mouse.move(700,400)
    page.mouse.wheel(0,600)
    wait_for_panel(page,'#lately')
    page.mouse.wheel(0,-600)
    wait_for_panel(page,'#card')
    page.keyboard.press('PageDown')
    wait_for_panel(page,'#lately')
    page.get_by_role('link',name='Back to card').focus()
    page.keyboard.press('Enter')
    wait_for_panel(page,'#card')
    assert page.locator('#card').evaluate('(e)=>e===document.activeElement')


@pytest.mark.parametrize('width,height', [(320,568),(375,548),(390,664),(430,932)])
def test_real_touch_swipe_moves_whole_viewport(browser, browser_name, site_url, width, height):
    if browser_name!='chromium':
        pytest.skip('CDP supplies native touch input in Chromium; WebKit runs layout/keyboard coverage')
    context=browser.new_context(viewport={'width':width,'height':height},is_mobile=True,has_touch=True)
    page=context.new_page()
    page.goto(site_url+'/me')
    cdp=context.new_cdp_session(page)
    def swipe(start,end):
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':width/2,'y':start}]})
        for step in range(1,11):
            cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':width/2,'y':start+(end-start)*step/10}]})
            page.wait_for_timeout(20)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    swipe(height*.8,height*.2)
    wait_for_panel(page,'#lately')
    assert page.locator('#card').bounding_box()['y']<=-height+2
    swipe(height*.2,height*.8)
    wait_for_panel(page,'#card')
    context.close()


def test_resize_disclosures_and_large_text_do_not_trap_scroll(clean_page, site_url):
    page=clean_page
    page.set_viewport_size({'width':390,'height':664})
    page.goto(site_url+'/me')
    # Available viewport changes as mobile browser chrome opens and closes.
    for height in (548,740,664):
        page.set_viewport_size({'width':390,'height':height})
        assert abs(page.locator('#card').bounding_box()['height']-height)<=1
    page.locator('.gaming summary').click()
    page.locator('.more-links summary').click()
    page.locator('#switch-code').scroll_into_view_if_needed()
    assert page.locator('#switch-code').is_visible()
    page.set_viewport_size({'width':844,'height':390})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    # Browser text magnification: preserve every label and native overflow.
    from pathlib import Path
    css=Path('assets/me.css').read_text()
    page.route('**/assets/me.css',lambda route:route.fulfill(content_type='text/css',body=css+'\n h1,.dek,.contact a,.feature-title,.domain,.socials a,summary,.gaming-hint,.secondary a {font-size:2rem!important}'))
    page.reload()
    assert page.locator('#card').bounding_box()['height']>390
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.locator('.lately-cue').click()
    wait_for_panel(page,'#lately')
    page.get_by_role('link',name='Back to card').click()
    wait_for_panel(page,'#card')


def test_reduced_motion_uses_unrestricted_native_scroll(clean_page, site_url):
    page=clean_page
    page.emulate_media(reduced_motion='reduce')
    page.goto(site_url+'/me')
    assert page.evaluate('getComputedStyle(document.documentElement).scrollSnapType')=='none'
    assert page.evaluate('getComputedStyle(document.documentElement).scrollBehavior')=='auto'
    page.locator('.lately-cue').click()
    wait_for_panel(page,'#lately')
    page.get_by_role('link',name='Back to card').click()
    wait_for_panel(page,'#card')



def test_oversized_latest_panel_keeps_middle_and_bottom_reachable(clean_page, site_url):
    page=clean_page
    page.set_viewport_size({'width':320,'height':568})
    page.route('**/api/profile-latest',lambda route:route.fulfill(json={'posts':[{'title':'Latest article','url':'https://tacobout.online/latest/','excerpt':'Long public article. '*150}], 'bluesky':{'text':'Long public feed. '*100,'url':'https://bsky.app/profile/schwegler.lol/post/newest'}, 'trove':None}))
    page.goto(site_url+'/me')
    page.locator('.lately-cue').click()
    page.get_by_text('Latest article',exact=True).wait_for()
    wait_for_panel(page,'#lately')
    top=page.evaluate('scrollY')
    page.mouse.move(160,280)
    page.mouse.wheel(0,400)
    page.wait_for_function('(top)=>scrollY>top+100',arg=top)
    assert page.locator('#lately').bounding_box()['y']<0
    page.locator('.refresh-updates').scroll_into_view_if_needed()
    box=page.locator('.refresh-updates').bounding_box()
    assert 0<=box['y'] and box['y']+box['height']<=568
    page.get_by_role('link',name='Back to card').click()
    wait_for_panel(page,'#card')



@pytest.mark.parametrize('width,height,top,right,bottom,left', [(390,664,47,0,34,0),(430,759,59,0,34,0),(844,390,0,44,21,44)])
def test_safe_area_layout(clean_page,site_url,width,height,top,right,bottom,left):
    from pathlib import Path
    page=clean_page
    page.set_viewport_size({'width':width,'height':height})
    # Substitute inset values in the external stylesheet to exercise notch/home
    # indicator space without bypassing CSP. Real-device chrome is separate QA.
    css=Path('assets/me.css').read_text()
    for edge,value in [('top',top),('right',right),('bottom',bottom),('left',left)]:
        css=css.replace('env(safe-area-inset-'+edge+')',str(value)+'px')
    page.route('**/assets/me.css',lambda route:route.fulfill(content_type='text/css',body=css))
    page.goto(site_url+'/me')
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    if width<760:
        assert abs(page.locator('#card').bounding_box()['height']-height)<=1
        assert page.locator('h1').bounding_box()['y']>=top
        box=page.locator('.lately-cue').bounding_box()
        assert box['y']+box['height']<=height-bottom
    page.locator('.lately-cue').click()
    wait_for_panel(page,'#lately')
    box=page.locator('.latest-heading').bounding_box()
    assert box['y']>=top and box['x']>=left
