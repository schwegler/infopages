import sys
import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8003

def start_server():
    # Use a custom handler to serve files from the current directory
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=".", **kwargs)

    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Error starting server: {e}")

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()

        # Capture console messages for debugging
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

        url = f"http://localhost:{PORT}/index.html"
        print(f"Navigating to {url}")
        page.goto(url)

        # Wait for universal_nav.js to execute and inject the nav
        try:
            page.wait_for_selector("#universal-nav", timeout=5000)
            print("✅ Navigation loaded.")
        except Exception:
            raise Exception("Timeout waiting for #universal-nav")

        # Locate the "Projects" dropdown toggle
        # It's an 'a' tag with text "Projects" inside a 'li.dropdown'
        dropdown_toggle = page.locator("li.dropdown > a").filter(has_text="Projects")

        if not dropdown_toggle.count():
            raise Exception("Projects dropdown toggle not found")

        # 1. Check Initial ARIA Attributes
        print("Checking initial ARIA attributes...")
        has_popup = dropdown_toggle.get_attribute("aria-haspopup")
        expanded = dropdown_toggle.get_attribute("aria-expanded")

        if has_popup != "true":
            print(f"❌ FAIL: Expected aria-haspopup='true', got '{has_popup}'")
        else:
            print("✅ PASS: aria-haspopup is true")

        if expanded != "false":
            print(f"❌ FAIL: Expected aria-expanded='false', got '{expanded}'")
        else:
            print("✅ PASS: aria-expanded is false")

        # 2. Check Menu Visibility on Focus (Keyboard Interaction)
        print("Checking menu visibility on focus...")
        dropdown_menu = page.locator("li.dropdown .dropdown-menu")

        # Initially hidden
        if dropdown_menu.is_visible():
             print("❌ FAIL: Menu should be hidden initially")
        else:
             print("✅ PASS: Menu is hidden initially")

        # Focus the toggle
        dropdown_toggle.focus()

        # Check if visible (via CSS :focus-within or class)
        # Note: is_visible() checks for display: none, visibility: hidden, etc.
        # We need to wait a bit for any transition or state update
        time.sleep(0.5)

        if not dropdown_menu.is_visible():
            print("❌ FAIL: Menu should be visible on focus")
        else:
            print("✅ PASS: Menu is visible on focus")

        # Check aria-expanded update
        expanded_after_focus = dropdown_toggle.get_attribute("aria-expanded")
        if expanded_after_focus != "true":
            print(f"❌ FAIL: Expected aria-expanded='true' on focus, got '{expanded_after_focus}'")
        else:
            print("✅ PASS: aria-expanded updated to true on focus")

        # 3. Check Focus Management within Menu
        print("Checking focus management within menu...")
        # Press Tab to move to first item
        page.keyboard.press("Tab")

        focused_el_text = page.evaluate("document.activeElement.textContent")
        print(f"Focused element text: {focused_el_text}")

        # Verify menu still visible
        if not dropdown_menu.is_visible():
             print("❌ FAIL: Menu should remain visible when focusing items inside")
        else:
             print("✅ PASS: Menu remains visible when focusing items inside")

        # Check aria-expanded still true
        expanded_inside = dropdown_toggle.get_attribute("aria-expanded")
        if expanded_inside != "true":
             print(f"❌ FAIL: aria-expanded should remain true when focus is inside menu")

        # 4. Blur / Focus Out
        print("Checking focus out...")
        # Tab out of the menu (there are 5 items, so press Tab 5 times)
        # Or just click somewhere else
        page.locator("body").click(position={"x": 0, "y": 0})

        time.sleep(0.5)

        if dropdown_menu.is_visible():
             print("❌ FAIL: Menu should hide on blur")
        else:
             print("✅ PASS: Menu hidden on blur")

        expanded_after_blur = dropdown_toggle.get_attribute("aria-expanded")
        if expanded_after_blur != "false":
             print(f"❌ FAIL: Expected aria-expanded='false' after blur, got '{expanded_after_blur}'")
        else:
             print("✅ PASS: aria-expanded updated to false after blur")

        browser.close()

if __name__ == "__main__":
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)
    try:
        run_tests()
    except Exception as e:
        print(f"Test error: {e}")
        sys.exit(1)
