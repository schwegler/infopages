from datetime import datetime, timezone
import pytest
from playwright.sync_api import expect


def open_appearance(page):
    toggle = page.get_by_role('button', name='Appearance', exact=True)
    if toggle.get_attribute('aria-expanded') != 'true':
        toggle.click()
    return toggle


@pytest.mark.parametrize('route', ['/', '/resume.html', '/work.html', '/tos.html',
    '/notes.html', '/five_pm_cat_club.html', '/bsky_mutual_blocks.html',
    '/sqlhttp.html', '/sqlmovebuffy.html', '/hollyoaks_history.html',
    '/tna_history.html', '/gay_bar_closures.html'])
def test_base_choices_exist_on_every_route_outside_season(clean_page, site_url, route):
    page = clean_page
    page.clock.install(time=datetime(2026, 11, 2, tzinfo=timezone.utc))
    page.emulate_media(color_scheme='dark')
    page.goto(site_url + route)
    expect(page.locator('html')).to_have_attribute('data-color-mode', 'system')
    expect(page.locator('html')).to_have_attribute('data-theme', 'dark')
    open_appearance(page)
    expect(page.get_by_role('group', name='Color mode', exact=True)).to_be_visible()
    expect(page.get_by_role('button', name='System', exact=True)).to_have_attribute('aria-pressed', 'true')
    expect(page.get_by_role('group', name='Seasonal appearance', exact=True)).to_have_count(0)


def test_device_changes_saved_override_and_system_reset(clean_page, site_url):
    page = clean_page
    page.emulate_media(color_scheme='dark')
    page.goto(site_url + '/')
    expect(page.locator('html')).to_have_attribute('data-theme', 'dark')
    page.emulate_media(color_scheme='light')
    expect(page.locator('html')).to_have_attribute('data-theme', 'light')
    open_appearance(page)
    page.get_by_role('button', name='Dark', exact=True).click()
    page.reload()
    expect(page.locator('html')).to_have_attribute('data-color-mode', 'dark')
    expect(page.locator('html')).to_have_attribute('data-theme', 'dark')
    open_appearance(page)
    page.get_by_role('button', name='System', exact=True).click()
    expect(page.locator('html')).to_have_attribute('data-theme', 'light')
    assert page.evaluate("localStorage.getItem('schweg-color-mode:v1')") is None
    page.emulate_media(color_scheme='dark')
    expect(page.locator('html')).to_have_attribute('data-theme', 'dark')


def test_color_mode_syncs_tabs_and_survives_seasonal_reset(clean_page, site_url):
    page = clean_page
    page.goto(site_url + '/')
    other = page.context.new_page()
    other.goto(site_url + '/resume.html')
    open_appearance(page)
    page.get_by_role('button', name='Halloween appearance', exact=True).click()
    page.get_by_role('button', name='Dark', exact=True).click()
    expect(other.locator('html')).to_have_attribute('data-color-mode', 'dark')
    page.get_by_role('button', name='Light', exact=True).click()
    expect(page.locator('html')).to_have_attribute('data-season', 'halloween')
    expect(page.locator('.wordmark')).to_have_attribute('src', 'assets/brand/schweg-signature-light.png')
    page.get_by_role('button', name='Reset appearance', exact=True).click()
    expect(page.locator('html')).to_have_attribute('data-color-mode', 'light')
    expect(page.locator('.wordmark')).to_have_attribute('src', 'assets/brand/schweg-signature-ink.png')
    expect(other.locator('html')).to_have_attribute('data-theme', 'light')
    other.close()


@pytest.mark.parametrize('width', [320, 390, 820])
def test_menu_keyboard_touch_targets_and_viewport_bounds(clean_page, site_url, width):
    page = clean_page
    page.set_viewport_size({'width': width, 'height': 844})
    page.goto(site_url + '/')
    toggle = page.get_by_role('button', name='Appearance', exact=True)
    toggle.focus()
    page.keyboard.press('Enter')
    page.keyboard.press('Tab')
    system = page.get_by_role('button', name='System', exact=True)
    expect(system).to_be_focused()
    page.keyboard.press('Tab')
    page.keyboard.press('Enter')
    expect(page.locator('html')).to_have_attribute('data-color-mode', 'light')
    page.keyboard.press('Escape')
    expect(toggle).to_be_focused()
    expect(toggle).to_have_attribute('aria-expanded', 'false')
    open_appearance(page)
    panel = page.locator('#seasonal-appearance-panel').bounding_box()
    assert panel['x'] >= 0 and panel['x'] + panel['width'] <= width
    assert panel['y'] >= 0 and panel['y'] + panel['height'] <= 844
    for name in ['System', 'Light', 'Dark']:
        rect = page.get_by_role('button', name=name, exact=True).bounding_box()
        assert rect['width'] >= 44 and rect['height'] >= 44
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.mouse.click(2, 2)  # Outside the mobile panel without clicking covered copy.
    expect(toggle).to_have_attribute('aria-expanded', 'false')


def test_blocked_storage_and_print_keep_readable_content(clean_page, site_url):
    page = clean_page
    page.add_init_script("Storage.prototype.getItem=()=>{throw Error('denied')};Storage.prototype.setItem=()=>{throw Error('denied')};Storage.prototype.removeItem=()=>{throw Error('denied')}")
    page.goto(site_url + '/resume.html')
    open_appearance(page)
    page.get_by_role('button', name='Dark', exact=True).click()
    expect(page.locator('html')).to_have_attribute('data-theme', 'dark')
    assert page.locator('body').evaluate('n=>getComputedStyle(n).backgroundColor') == 'rgb(25, 23, 31)'
    page.emulate_media(media='print')
    expect(page.locator('[data-appearance-controls]')).to_be_hidden()
    assert page.locator('body').evaluate('n=>getComputedStyle(n).color') == 'rgb(0, 0, 0)'


def test_base_menu_remains_after_season_expires(clean_page, site_url):
    page = clean_page
    page.clock.install(time=datetime(2026, 10, 31, 23, 59, 55, tzinfo=timezone.utc))
    page.clock.pause_at(datetime(2026, 10, 31, 23, 59, 56, tzinfo=timezone.utc))
    page.goto(site_url + '/')
    open_appearance(page)
    page.get_by_role('button', name='Dark', exact=True).click()
    page.get_by_role('button', name='Halloween appearance', exact=True).click()
    page.get_by_role('button', name='Halloween appearance', exact=True).focus()
    page.clock.run_for(5000)
    expect(page.locator('[data-seasonal-controls]')).to_have_count(0)
    expect(page.get_by_role('group', name='Color mode', exact=True)).to_be_visible()
    expect(page.locator('html')).to_have_attribute('data-theme', 'dark')
    expect(page.get_by_role('button', name='Appearance', exact=True)).to_be_focused()


@pytest.mark.parametrize('route', ['/sqlmovebuffy.html', '/hollyoaks_history.html'])
@pytest.mark.parametrize('scheme', ['light', 'dark'])
def test_native_dropdowns_keep_working_in_both_palettes(clean_page, site_url, route, scheme):
    page = clean_page
    page.emulate_media(color_scheme=scheme)
    page.goto(site_url + route)
    control = page.get_by_role('combobox')
    control.select_option('audit' if 'sqlmovebuffy' in route else '2008')
    expect(control).to_have_value('audit' if 'sqlmovebuffy' in route else '2008')
