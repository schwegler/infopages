from playwright.sync_api import expect


def test_seasonal_overlay_activation_motion_and_undo(clean_page, site_url):
    page = clean_page
    page.goto(site_url + '/resume.html', wait_until='domcontentloaded')
    heading = page.get_by_role('heading', name='Andrew Schwegler', exact=True)
    before = heading.bounding_box()
    overlay = page.locator('.seasonal-overlay')
    expect(overlay).to_be_hidden()
    expect(overlay).to_be_visible(timeout=5000)
    after = heading.bounding_box()
    assert abs(after['y'] - before['y']) < 1
    assert page.locator('.seasonal-stage,.seasonal-scene').count() == 0
    activate = page.get_by_role('button', name='Turn on Halloween mode', exact=True)
    activate.focus()
    page.keyboard.press('Enter')
    expect(page.locator('html')).to_have_attribute('data-season', 'halloween')
    expect(page.locator('.seasonal-atmosphere')).to_be_visible()
    expect(page.locator('.seasonal-notice')).to_have_text('well. it’s haunted now.')
    expect(page.locator('.seasonal-character img')).to_have_attribute('alt', '')
    assert abs(heading.bounding_box()['y'] - before['y']) < 1
    page.get_by_role('button', name='Appearance', exact=True).click()
    page.get_by_role('button', name='Pause seasonal animations', exact=True).click()
    expect(page.locator('html')).to_have_attribute('data-season-motion', 'paused')
    page.reload()
    expect(page.locator('html')).to_have_attribute('data-season', 'halloween')
    expect(page.locator('html')).to_have_attribute('data-season-motion', 'paused')
    page.emulate_media(media='print')
    expect(overlay).to_be_hidden()
    expect(page.locator('.seasonal-atmosphere')).to_be_hidden()
    page.emulate_media(media='screen')
    if page.get_by_role('button', name='Appearance', exact=True).get_attribute('aria-expanded') == 'false':
        page.get_by_role('button', name='Appearance', exact=True).click()
    page.get_by_role('button', name='Restore original appearance', exact=True).click()
    assert page.locator('html').get_attribute('data-season') is None
    page.reload()
    expect(overlay).to_be_hidden()
    if page.get_by_role('button', name='Appearance', exact=True).get_attribute('aria-expanded') == 'false':
        page.get_by_role('button', name='Appearance', exact=True).click()
    page.get_by_role('button', name='Reset appearance', exact=True).click()
    assert page.evaluate("localStorage.getItem('seasonal-theme:v1')") is None
    expect(overlay).to_be_visible(timeout=5000)


def test_seasonal_dismissal_and_reduced_motion(clean_page, site_url):
    page = clean_page
    page.emulate_media(reduced_motion='reduce')
    page.set_viewport_size({'width': 320, 'height': 844})
    page.goto(site_url + '/work.html')
    overlay = page.locator('.seasonal-overlay')
    expect(overlay).to_be_visible(timeout=5000)
    assert page.locator('.seasonal-character img').evaluate("node => getComputedStyle(node).animationName") == 'none'
    dismiss = page.get_by_role('button', name='Dismiss Halloween character', exact=True)
    box = dismiss.bounding_box()
    assert box['width'] >= 44 and box['height'] >= 44
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    dismiss.click()
    page.reload()
    expect(overlay).to_be_hidden()
    if page.get_by_role('button', name='Appearance', exact=True).get_attribute('aria-expanded') == 'false':
        page.get_by_role('button', name='Appearance', exact=True).click()
    page.get_by_role('button', name='Halloween appearance', exact=True).click()
    expect(page.locator('html')).to_have_attribute('data-season', 'halloween')
    expect(page.locator('html')).to_have_attribute('data-season-motion', 'paused')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')


def test_seasonal_storage_denied_and_mobile(clean_page, site_url):
    page = clean_page
    page.add_init_script("Storage.prototype.getItem = () => {throw new Error('Storage denied')}; Storage.prototype.setItem = () => {throw new Error('Storage denied')}; Storage.prototype.removeItem = () => {throw new Error('Storage denied')}")
    page.set_viewport_size({'width': 390, 'height': 844})
    page.goto(site_url + '/work.html', wait_until='networkidle')
    if page.get_by_role('button', name='Appearance', exact=True).get_attribute('aria-expanded') == 'false':
        page.get_by_role('button', name='Appearance', exact=True).click()
    page.get_by_role('button', name='Halloween appearance', exact=True).click()
    expect(page.locator('html')).to_have_attribute('data-season', 'halloween')
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    if page.get_by_role('button', name='Appearance', exact=True).get_attribute('aria-expanded') == 'false':
        page.get_by_role('button', name='Appearance', exact=True).click()
    page.get_by_role('button', name='Reset appearance', exact=True).click()
    assert page.locator('html').get_attribute('data-season') is None


def test_seasonal_choice_syncs_between_tabs(clean_page, site_url):
    page = clean_page
    page.goto(site_url + '/')
    other = page.context.new_page()
    other.goto(site_url + '/resume.html')
    if page.get_by_role('button', name='Appearance', exact=True).get_attribute('aria-expanded') == 'false':
        page.get_by_role('button', name='Appearance', exact=True).click()
    page.get_by_role('button', name='Halloween appearance', exact=True).click()
    expect(other.locator('html')).to_have_attribute('data-season', 'halloween')
    if other.get_by_role('button', name='Appearance', exact=True).get_attribute('aria-expanded') == 'false':
        other.get_by_role('button', name='Appearance', exact=True).click()
    other.get_by_role('button', name='Reset appearance', exact=True).click()
    assert page.locator('html').get_attribute('data-season') is None
    other.close()


def test_seasonal_restores_exact_root_attributes(clean_page, site_url):
    page = clean_page
    def seed_original_attributes(route):
        response = route.fetch()
        html = response.text().replace('<html lang="en">', '<html lang="en" data-season="original" data-season-motion="original-motion" data-seasonal-profile="original-profile">')
        route.fulfill(response=response, body=html)
    page.route('**/resume.html', seed_original_attributes)
    page.goto(site_url + '/resume.html')
    if page.get_by_role('button', name='Appearance', exact=True).get_attribute('aria-expanded') == 'false':
        page.get_by_role('button', name='Appearance', exact=True).click()
    page.get_by_role('button', name='Halloween appearance', exact=True).click()
    expect(page.locator('html')).to_have_attribute('data-season', 'halloween')
    if page.get_by_role('button', name='Appearance', exact=True).get_attribute('aria-expanded') == 'false':
        page.get_by_role('button', name='Appearance', exact=True).click()
    page.get_by_role('button', name='Hide atmosphere', exact=True).click()
    expect(page.locator('.seasonal-atmosphere')).to_be_hidden()
    expect(page.locator('html')).to_have_attribute('data-season', 'halloween')
    if page.get_by_role('button', name='Appearance', exact=True).get_attribute('aria-expanded') == 'false':
        page.get_by_role('button', name='Appearance', exact=True).click()
    page.get_by_role('button', name='Show atmosphere', exact=True).click()
    if page.get_by_role('button', name='Appearance', exact=True).get_attribute('aria-expanded') == 'false':
        page.get_by_role('button', name='Appearance', exact=True).click()
    page.get_by_role('button', name='Halloween appearance', exact=True).click()
    expect(page.locator('html')).to_have_attribute('data-season', 'original')
    expect(page.locator('html')).to_have_attribute('data-season-motion', 'original-motion')
    expect(page.locator('html')).to_have_attribute('data-seasonal-profile', 'original-profile')
    assert page.locator('html').get_attribute('data-season-id') is None


def test_seasonal_expires_at_exclusive_utc_boundary(clean_page, site_url):
    from datetime import datetime, timezone
    page = clean_page
    page.clock.install(time=datetime(2026, 10, 31, 23, 59, 50, tzinfo=timezone.utc))
    page.clock.pause_at(datetime(2026, 10, 31, 23, 59, 55, tzinfo=timezone.utc))
    page.goto(site_url + '/resume.html')
    if page.get_by_role('button', name='Appearance', exact=True).get_attribute('aria-expanded') == 'false':
        page.get_by_role('button', name='Appearance', exact=True).click()
    page.get_by_role('button', name='Halloween appearance', exact=True).click()
    expect(page.locator('html')).to_have_attribute('data-season', 'halloween')
    page.clock.run_for(6000)
    assert page.locator('html').get_attribute('data-season') is None
    assert page.locator('html').get_attribute('data-season-motion') is None
    expect(page.locator('.seasonal-overlay')).to_have_count(0)
    expect(page.locator('[data-seasonal-controls]')).to_have_count(0)
    expect(page.locator('.seasonal-atmosphere')).to_have_count(0)


def test_active_dismiss_leaves_theme_and_no_floating_controls(clean_page, site_url):
    page = clean_page
    page.goto(site_url + '/resume.html')
    page.get_by_role('button', name='Turn on Halloween mode', exact=True).click()
    page.get_by_role('button', name='Dismiss Halloween character', exact=True).click()
    expect(page.locator('html')).to_have_attribute('data-season', 'halloween')
    expect(page.locator('.seasonal-overlay')).to_be_hidden()
    assert page.locator('.seasonal-overlay button').count() == 2
    menu = page.get_by_role('button', name='Appearance', exact=True)
    menu.focus()
    page.keyboard.press('Enter')
    expect(menu).to_have_attribute('aria-expanded', 'true')
    page.keyboard.press('Tab')
    page.keyboard.press('Escape')
    expect(menu).to_be_focused()
    expect(menu).to_have_attribute('aria-expanded', 'false')
    page.reload()
    expect(page.locator('html')).to_have_attribute('data-season', 'halloween')
    expect(page.locator('.seasonal-overlay')).to_be_hidden()
    page.get_by_role('button', name='Appearance', exact=True).click()
    page.get_by_role('button', name='Restore original appearance', exact=True).click()
    assert page.locator('html').get_attribute('data-season') is None
