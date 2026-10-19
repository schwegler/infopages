"""One visit after window.load; original art, safe links, input, and motion choices."""
from datetime import datetime, timezone
from pathlib import Path
import pytest
from playwright.sync_api import expect


def freeze(page, month=11, day=2):
    now = datetime(2026, month, day, tzinfo=timezone.utc)
    page.clock.install(time=now)
    page.clock.pause_at(now)


def appearance(page):
    button = page.get_by_role('button', name='Appearance', exact=True)
    if button.get_attribute('aria-expanded') != 'true':
        button.click()


def static_cast(page):
    appearance(page)
    page.get_by_role('button', name='Meet the apps', exact=True).click()


def x(link):
    return link.bounding_box()['x']


def test_waits_two_seconds_after_load_not_dom_ready(clean_page, site_url):
    page = clean_page
    freeze(page)
    held = []
    page.route('**/assets/brand/schweg-signature-ink.png', lambda route: held.append(route))
    page.goto(site_url + '/', wait_until='domcontentloaded')
    page.clock.run_for(10000)
    parade = page.locator('.mascot-parade')
    expect(parade).to_be_hidden()
    assert page.evaluate('document.readyState') != 'complete'
    path = Path(__file__).resolve().parents[2] / 'assets/brand/schweg-signature-ink.png'
    for route in held:
        route.fulfill(path=str(path), content_type='image/png')
    page.wait_for_load_state('load')
    page.clock.run_for(1999)
    expect(parade).to_be_hidden()
    page.clock.run_for(1)
    expect(parade).to_be_visible()
    expect(page.locator('html')).to_have_attribute('data-mascot-parade', 'walking')
    links = parade.locator('a')
    assert all(link.evaluate('(e) => e.inert') for link in links.all())


def test_stagger_pause_hover_focus_and_one_pass(clean_page, site_url):
    page = clean_page
    freeze(page)
    page.set_viewport_size({'width': 1440, 'height': 900})
    page.goto(site_url + '/')
    page.clock.run_for(4500)
    telly = page.locator('[data-mascot="telly"]')
    facet = page.locator('[data-mascot="facet"]')
    assert x(telly) > x(facet) + 190
    rect = telly.bounding_box()
    page.mouse.move(rect['x'] + 50, rect['y'] + 50)
    before = x(telly)
    page.clock.run_for(1000)
    assert abs(x(telly) - before) < 1
    expect(telly.locator('.parade-label')).to_be_visible()
    assert telly.locator('.parade-leg').first.evaluate('(e) => getComputedStyle(e).animationPlayState') == 'paused'
    page.mouse.move(10, 200)
    page.clock.run_for(500)
    assert x(telly) > before + 20
    telly.focus()
    before = x(telly)
    page.clock.run_for(1000)
    expect(telly).to_be_focused()
    assert abs(x(telly) - before) < 1
    page.keyboard.press('Tab')
    expect(page.get_by_role('button', name='Dismiss mascot parade')).to_be_focused()
    page.get_by_role('button', name='Appearance', exact=True).focus()
    page.clock.run_for(40000)
    expect(page.locator('.mascot-parade')).to_be_hidden()
    page.clock.run_for(40000)
    expect(page.locator('.mascot-parade')).to_be_hidden()
    assert page.locator('html').get_attribute('data-mascot-parade') is None


def test_all_actual_destinations_logos_and_new_tabs(clean_page, site_url):
    page = clean_page
    page.goto(site_url + '/')
    static_cast(page)
    expected = {
        'telly': ('https://tacobout.online/', 'taco ’bout it'),
        'facet': ('https://trove.schweg.xyz/', 'Trove'),
        'hitch': ('https://moots.schweg.xyz/', 'Moots'),
        'andrew': ('https://schweg.xyz/', 'schweg.xyz'),
    }
    for identity, (url, name) in expected.items():
        link = page.locator(f'[data-mascot="{identity}"]')
        expect(link).to_have_attribute('href', url)
        expect(link).to_have_attribute('target', '_blank')
        assert set(link.get_attribute('rel').split()) >= {'noopener', 'noreferrer'}
        assert name in link.get_attribute('aria-label')
        assert link.locator('.parade-label img').evaluate('async e => { await e.decode(); return e.naturalWidth > 0; }')
        assert link.locator('.parade-rig img').evaluate_all('async images => { await Promise.all(images.map(e => e.decode())); return images.every(e => e.naturalWidth > 0); }')
        page.context.route(url, lambda route: route.fulfill(body='<title>Verified app target</title>'))
        link.focus()
        with page.expect_popup() as popup:
            page.keyboard.press('Enter')
        popup.value.wait_for_load_state()
        assert popup.value.url == url
        popup.value.close()
    assert page.locator('.mascot-parade img').evaluate_all('(images) => images.every(e => e.alt === "")')


def test_approved_signature_remains_legible_in_dark_mode(clean_page, site_url):
    page = clean_page
    page.emulate_media(color_scheme='dark')
    page.goto(site_url + '/')
    static_cast(page)
    logo = page.locator('[data-mascot="andrew"] .parade-label img')
    assert 'schweg-signature-light.png' in logo.evaluate('(e) => getComputedStyle(e).content')
    page.emulate_media(color_scheme='light')
    expect(page.locator('html')).to_have_attribute('data-theme', 'light')
    assert logo.evaluate('(e) => getComputedStyle(e).content') == 'normal'


@pytest.mark.parametrize('keyboard', [False, True])
def test_dismissal_ends_page_visit_and_restores_focus(clean_page, site_url, keyboard):
    page = clean_page
    freeze(page)
    page.goto(site_url + '/')
    page.clock.run_for(4500)
    close = page.get_by_role('button', name='Dismiss mascot parade')
    close.focus()
    if keyboard:
        page.keyboard.press('Escape')
    else:
        close.click()
    expect(page.locator('.mascot-parade')).to_be_hidden()
    expect(page.get_by_role('button', name='Appearance', exact=True)).to_be_focused()
    page.clock.run_for(60000)
    expect(page.locator('.mascot-parade')).to_be_hidden()


def test_persistent_opt_out_and_cross_tab_sync(clean_page, site_url):
    page = clean_page
    freeze(page)
    page.goto(site_url + '/')
    appearance(page)
    toggle = page.get_by_role('button', name='Mascot parade', exact=True)
    toggle.click()
    expect(toggle).to_have_attribute('aria-pressed', 'false')
    assert page.evaluate('localStorage.getItem("schweg-mascot-parade:v1")') == 'off'
    other = page.context.new_page()
    other.goto(site_url + '/work.html')
    appearance(other)
    expect(other.get_by_role('button', name='Mascot parade', exact=True)).to_have_attribute('aria-pressed', 'false')
    page.reload()
    page.clock.run_for(5000)
    expect(page.locator('.mascot-parade')).to_be_hidden()
    appearance(page)
    toggle.click()
    expect(other.get_by_role('button', name='Mascot parade', exact=True)).to_have_attribute('aria-pressed', 'true')
    other.close()


def test_blocked_storage_remains_usable(clean_page, site_url):
    page = clean_page
    page.add_init_script('Storage.prototype.getItem=()=>{throw Error("denied")};Storage.prototype.setItem=()=>{throw Error("denied")}')
    freeze(page)
    page.goto(site_url + '/')
    page.clock.run_for(2200)
    expect(page.locator('.mascot-parade')).to_be_visible()
    appearance(page)
    page.get_by_role('button', name='Mascot parade', exact=True).click()
    expect(page.locator('.mascot-parade')).to_be_hidden()


@pytest.mark.parametrize('width,height', [(320, 568), (390, 844), (600, 800), (820, 1180), (1440, 900)])
def test_responsive_visible_cast_and_clamped_labels(clean_page, site_url, width, height):
    page = clean_page
    freeze(page)
    page.set_viewport_size({'width': width, 'height': height})
    page.goto(site_url + '/')
    page.clock.run_for(2000)
    seen = set()
    for _ in range(22):
        page.clock.run_for(1000)
        for link in page.locator('.parade-mascot[data-visible="true"]').all():
            if link.evaluate('(e) => e.inert'):
                continue
            seen.add(link.get_attribute('data-mascot'))
            rect = link.bounding_box()
            assert rect['x'] >= 0 and rect['x'] + rect['width'] <= width
            assert rect['y'] >= 0 and rect['y'] + rect['height'] <= height
            link.focus()
            label = link.locator('.parade-label').bounding_box()
            assert label['x'] >= 0 and label['x'] + label['width'] <= width
            page.get_by_role('button', name='Appearance', exact=True).focus()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert seen == {'telly', 'facet', 'hitch', 'andrew'}


@pytest.mark.parametrize('width', [320, 820, 1440])
def test_reduced_motion_is_static_in_flow_and_print_hidden(clean_page, site_url, width):
    page = clean_page
    freeze(page)
    page.set_viewport_size({'width': width, 'height': 900})
    page.emulate_media(reduced_motion='reduce')
    page.goto(site_url + '/')
    page.clock.run_for(2000)
    parade = page.locator('.mascot-parade')
    expect(parade).to_have_class('mascot-parade parade-static')
    assert parade.evaluate('(e) => getComputedStyle(e).position') == 'relative'
    for link in parade.locator('a').all():
        link.scroll_into_view_if_needed()
        expect(link.locator('.parade-label')).to_be_visible()
        assert not link.evaluate('(e) => e.inert')
        assert link.locator('.parade-rig').evaluate('(e) => getComputedStyle(e).animationName') == 'none'
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.emulate_media(media='print')
    expect(parade).to_be_hidden()


def test_live_reduced_motion_and_meet_apps_keyboard_path(clean_page, site_url):
    page = clean_page
    freeze(page)
    page.goto(site_url + '/')
    page.clock.run_for(4500)
    page.emulate_media(reduced_motion='reduce')
    expect(page.locator('.parade-static')).to_be_visible()
    page.emulate_media(reduced_motion='no-preference')
    page.clock.run_for(60000)
    expect(page.locator('.parade-static')).to_be_visible()
    page.get_by_role('button', name='Dismiss mascot parade').click()
    appearance(page)
    page.get_by_role('button', name='Meet the apps', exact=True).focus()
    page.keyboard.press('Enter')
    expect(page.locator('[data-mascot="telly"]')).to_be_focused()


def test_touch_first_tap_labels_and_second_tap_navigates(browser, site_url):
    context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    page = context.new_page()
    freeze(page)
    page.goto(site_url + '/')
    page.clock.run_for(5500)
    telly = page.locator('[data-mascot="telly"]')
    rect = telly.bounding_box()
    page.touchscreen.tap(rect['x'] + 44, rect['y'] + 46)
    expect(telly).to_have_attribute('data-selected', 'true')
    expect(telly.locator('.parade-label')).to_be_visible()
    before = x(telly)
    page.clock.run_for(1000)
    assert abs(x(telly) - before) < 1
    context.route('https://tacobout.online/', lambda route: route.fulfill(body='<title>App</title>'))
    with page.expect_popup() as popup:
        page.touchscreen.tap(rect['x'] + 44, rect['y'] + 46)
    popup.value.wait_for_load_state()
    assert popup.value.url == 'https://tacobout.online/'
    context.close()


def test_seasonal_corner_returns_after_parade(clean_page, site_url):
    page = clean_page
    freeze(page, month=10, day=19)
    page.goto(site_url + '/')
    page.clock.run_for(4500)
    expect(page.locator('.seasonal-overlay')).to_be_hidden()
    page.get_by_role('button', name='Dismiss mascot parade').click()
    expect(page.locator('.seasonal-overlay')).to_be_visible()


def test_protected_page_controls_remain_selectable(clean_page, site_url):
    page = clean_page
    freeze(page)
    page.goto(site_url + '/')
    page.clock.run_for(4500)
    telly = page.locator('[data-mascot="telly"]')
    # Put an actual page button in the path; the sprite yields its hit area.
    page.evaluate('''() => {
      const button = document.createElement('button'); button.id = 'protected-action';
      button.textContent = 'Page action'; button.style.position = 'fixed';
      button.style.left = '80px'; button.style.bottom = '12px'; button.style.width = '130px';
      button.style.height = '100px'; button.addEventListener('click', () => button.textContent = 'Selected');
      document.querySelector('main').append(button); dispatchEvent(new Event('resize'));
    }''')
    page.clock.run_for(50)
    expect(telly).to_be_hidden()
    page.get_by_role('button', name='Page action', exact=True).click()
    expect(page.get_by_role('button', name='Selected', exact=True)).to_be_visible()
