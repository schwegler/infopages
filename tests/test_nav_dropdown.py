import sys
import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8004

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Error starting server: {e}")

def test_dropdown_keyboard_access():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print(f"Navigating to http://localhost:{PORT}/index.html")
        page.goto(f"http://localhost:{PORT}/index.html")
        page.wait_for_selector("#universal-nav")

        projects_link = page.get_by_role("link", name="Projects")

        # Test 1: Visibility on focus
        print("Focusing 'Projects' link...")
        projects_link.focus()

        # Check CSS visibility via :focus-within
        # We check computed style of the dropdown menu
        dropdown_menu = page.locator(".dropdown-menu")
        is_visible = dropdown_menu.is_visible()

        if not is_visible:
            raise Exception("Dropdown menu not visible on focus")

        # Test 2: ARIA attributes
        aria_expanded = projects_link.get_attribute("aria-expanded")
        if aria_expanded != "true":
            raise Exception(f"ARIA expanded should be true, got {aria_expanded}")

        # Test 3: Blur behavior
        page.get_by_role("link", name="Home").focus()
        aria_expanded = projects_link.get_attribute("aria-expanded")
        if aria_expanded != "false":
            raise Exception(f"ARIA expanded should be false after blur, got {aria_expanded}")

        print("All tests passed!")
        browser.close()

if __name__ == "__main__":
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)
    try:
        test_dropdown_keyboard_access()
    except Exception as e:
        print(f"Test failed: {e}")
        sys.exit(1)
