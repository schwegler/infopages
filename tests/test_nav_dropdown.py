import os
import pytest
from playwright.sync_api import Page, expect

def test_nav_dropdown_accessibility(page: Page):
    # Load index.html (assumes served or file path)
    page.goto("file://" + os.path.abspath("index.html"))

    # Locate the Projects dropdown toggle
    projects_link = page.get_by_text("Projects")

    # Check initial state (should have ARIA attributes)
    expect(projects_link).to_have_attribute("aria-haspopup", "true")
    expect(projects_link).to_have_attribute("aria-expanded", "false")

    # Focus the link
    projects_link.focus()

    # Check if menu is visible on focus (CSS focus-within)
    dropdown_menu = page.locator(".dropdown-menu")
    expect(dropdown_menu).to_be_visible()

    # Check if aria-expanded updates
    expect(projects_link).to_have_attribute("aria-expanded", "true")

    # Check if focus moves into menu
    # Press Tab
    page.keyboard.press("Tab")

    # First item in dropdown should be focused
    first_item = dropdown_menu.locator("a").first
    expect(first_item).to_be_focused()

    # aria-expanded should still be true
    expect(projects_link).to_have_attribute("aria-expanded", "true")

    # Tab out of dropdown
    # We have 5 items in the dropdown based on universal_nav.js
    for _ in range(5):
        page.keyboard.press("Tab")

    # Now focus should be on the next item in nav (Terms)
    # Target the Terms link specifically within the nav or by exact text/role if unique
    terms_link = page.locator("#universal-nav").get_by_text("Terms")
    expect(terms_link).to_be_focused()

    # aria-expanded should be false now
    expect(projects_link).to_have_attribute("aria-expanded", "false")
