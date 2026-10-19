from playwright.sync_api import expect


def test_seasonal_invitation_activation_motion_and_undo(clean_page, site_url):
    page = clean_page
    page.goto(site_url + '/resume.html', wait_until='domcontentloaded')
    invitation = page.get_by_role('region', name='Halloween invitation')
    expect(invitation).to_be_hidden()
    expect(invitation).to_be_visible(timeout=4000)
    activate = page.get_by_role('button', name='Turn on Halloween appearance', exact=True)
    activate.focus()
    page.keyboard.press('Enter')
    expect(page.locator('html')).to_have_attribute('data-season', 'halloween')
    expect(page.locator('.seasonal-scene')).to_be_visible()
    expect(page.locator('.seasonal-atmosphere')).to_be_visible()
    expect(page.locator('.seasonal-scene img')).to_have_attribute('alt', '')
    page.get_by_role('button', name='Pause scene animations', exact=True).click()
    expect(page.locator('html')).to_have_attribute('data-season-motion', 'paused')
    page.reload()
    expect(page.locator('.seasonal-scene')).to_be_visible()
    expect(invitation).to_be_hidden()
    expect(page.locator('html')).to_have_attribute('data-season-motion', 'paused')
    page.emulate_media(media='print')
    expect(page.locator('.seasonal-scene')).to_be_hidden()
    expect(page.locator('.seasonal-atmosphere')).to_be_hidden()
    page.emulate_media(media='screen')
    page.get_by_role('button', name='Restore original appearance', exact=True).click()
    expect(page.locator('.seasonal-scene')).to_be_hidden()
    assert page.locator('html').get_attribute('data-season') is None
    page.reload()
    expect(invitation).to_be_hidden()
    page.get_by_role('button', name='Reset appearance', exact=True).click()
    assert page.evaluate("localStorage.getItem('seasonal-theme:v1')") is None
    expect(invitation).to_be_visible(timeout=4000)


def test_seasonal_dismissal_and_reduced_motion(clean_page, site_url):
    page = clean_page
    page.emulate_media(reduced_motion='reduce')
    page.set_viewport_size({'width': 320, 'height': 844})
    page.goto(site_url + '/work.html')
    invitation = page.get_by_role('region', name='Halloween invitation')
    expect(invitation).to_be_visible(timeout=4000)
    assert page.locator('.seasonal-character img').evaluate("node => getComputedStyle(node).animationName") == 'none'
    dismiss = page.get_by_role('button', name='Dismiss Halloween invitation', exact=True)
    box = dismiss.bounding_box()
    assert box['width'] >= 44 and box['height'] >= 44
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    dismiss.click()
    page.reload()
    expect(invitation).to_be_hidden()
    page.get_by_role('button', name='Halloween appearance', exact=True).click()
    expect(page.locator('.seasonal-scene')).to_be_visible()
    expect(page.locator('html')).to_have_attribute('data-season-motion', 'paused')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')


def test_seasonal_storage_denied_and_mobile(clean_page, site_url):
    page = clean_page
    page.add_init_script("Storage.prototype.getItem = () => {throw new Error('Storage denied')}; Storage.prototype.setItem = () => {throw new Error('Storage denied')}; Storage.prototype.removeItem = () => {throw new Error('Storage denied')}")
    page.set_viewport_size({'width': 390, 'height': 844})
    page.goto(site_url + '/work.html', wait_until='networkidle')
    page.get_by_role('button', name='Halloween appearance', exact=True).click()
    expect(page.locator('.seasonal-scene')).to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.get_by_role('button', name='Reset appearance', exact=True).click()
    expect(page.locator('.seasonal-scene')).to_be_hidden()


def test_seasonal_choice_syncs_between_tabs(clean_page, site_url):
    page = clean_page
    page.goto(site_url + '/')
    other = page.context.new_page()
    other.goto(site_url + '/resume.html')
    page.get_by_role('button', name='Halloween appearance', exact=True).click()
    expect(other.locator('.seasonal-scene')).to_be_visible()
    other.get_by_role('button', name='Reset appearance', exact=True).click()
    expect(page.locator('.seasonal-scene')).to_be_hidden()
    other.close()
