from playwright.sync_api import expect


def test_seasonal_choice_reset_and_print(clean_page, site_url):
    page = clean_page
    page.goto(site_url + '/resume.html')
    toggle = page.get_by_role('button', name='Halloween appearance', exact=True)
    scene = page.locator('.seasonal-scene')
    expect(toggle).to_have_attribute('aria-pressed', 'false')
    expect(scene).to_be_hidden()
    toggle.focus()
    page.keyboard.press('Space')
    expect(scene).to_be_visible()
    expect(scene.locator('img')).to_have_attribute('alt', '')
    page.reload()
    expect(toggle).to_have_attribute('aria-pressed', 'true')
    page.emulate_media(media='print')
    expect(scene).to_be_hidden()
    page.emulate_media(media='screen')
    toggle.click()
    page.reload()
    expect(scene).to_be_hidden()
    toggle.click()
    page.get_by_role('button', name='Reset appearance', exact=True).click()
    assert page.evaluate("localStorage.getItem('seasonal-theme:v1')") is None
    expect(scene).to_be_hidden()


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
