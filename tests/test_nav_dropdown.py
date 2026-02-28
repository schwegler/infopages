import re
from playwright.sync_api import sync_playwright

def test_dropdown_keyboard_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:8000/index.html', wait_until='networkidle')

        # Find the dropdown container and toggle ("Projects")
        dropdown_container = page.locator('#universal-nav .dropdown').first
        dropdown_toggle = dropdown_container.locator('> a').first

        # Assert initial state
        assert dropdown_toggle.get_attribute('aria-expanded') == 'false'
        assert dropdown_toggle.get_attribute('aria-haspopup') == 'true'

        # Instead of locator.focus(), use keyboard Tab to naturally move focus
        page.keyboard.press("Tab") # body -> #universal-nav (maybe) or first link

        # We know the first link is Brand, then Home, then Projects
        brand_link = page.locator('#universal-nav .brand')
        brand_link.focus()
        page.wait_for_timeout(50)

        home_link = page.locator('#universal-nav a', has_text="Home").first
        home_link.focus()
        page.wait_for_timeout(50)

        page.keyboard.press("Tab")
        page.wait_for_timeout(100)

        # Verify focus is on Projects
        focused_text = page.locator('*:focus').text_content()
        assert "Projects" in focused_text

        # Assert expanded state via the event listener
        assert dropdown_toggle.get_attribute('aria-expanded') == 'true'

        # Verify the dropdown menu is visible when focused (due to :focus-within)
        dropdown_menu = page.locator('#universal-nav .dropdown-menu').first
        assert dropdown_menu.is_visible()

        # Tab through all dropdown links
        for link_text in ["Starfleet SQL", "Buffy Migration", "Hollyoaks History", "TNA History", "Gay Bars in Decline"]:
            page.keyboard.press("Tab")
            page.wait_for_timeout(50)
            focused_text = page.locator('*:focus').text_content()
            assert link_text in focused_text
            assert dropdown_toggle.get_attribute('aria-expanded') == 'true'

        # Tab out of the dropdown menu
        page.keyboard.press("Tab")
        page.wait_for_timeout(100) # give it a moment

        # Focus should now be on "Terms"
        focused_text = page.locator('*:focus').text_content()
        assert "Terms" in focused_text

        # Assert collapsed state
        assert dropdown_toggle.get_attribute('aria-expanded') == 'false'
        assert not dropdown_menu.is_visible()

        browser.close()

if __name__ == '__main__':
    test_dropdown_keyboard_accessibility()
    print("Dropdown keyboard accessibility test passed!")
