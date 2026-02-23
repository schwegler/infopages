import sys
import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright, expect

PORT = 8002

def start_server():
    # Serve from current directory (project root)
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Error starting server: {e}")

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Handle console messages for debugging
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"BROWSER ERROR: {exc}"))

        print(f"Navigating to http://localhost:{PORT}/index.html")
        page.goto(f"http://localhost:{PORT}/index.html")

        # Wait for nav to load (it's injected by universal_nav.js)
        # universal_nav.js runs immediately (IIFE) but might take a moment to render
        page.wait_for_selector("#universal-nav", timeout=5000)

        # Locate the "Projects" link
        # It's inside a list item with class 'dropdown'
        # The text is "Projects"
        projects_link = page.locator("#universal-nav a", has_text="Projects")
        expect(projects_link).to_be_visible()

        # Locate the dropdown menu (UL inside the LI)
        # The structure is li.dropdown > a + ul.dropdown-menu
        dropdown_menu = page.locator("#universal-nav .dropdown-menu")

        # Verify initial state: hidden
        expect(dropdown_menu).not_to_be_visible()
        print("✅ PASS: Dropdown menu is initially hidden.")

        # Focus the Projects link using Tab key
        # We need to find where focus is initially. usually on body.
        # Press Tab until we reach "Projects".
        # Order: Brand -> Home -> Projects

        print("Pressing Tab to reach Projects link...")
        # Focus on body first to be sure
        page.focus("body")

        # Tab 1: Brand (Schwegler // Digital Garden)
        page.keyboard.press("Tab")
        # Tab 2: Home
        page.keyboard.press("Tab")
        # Tab 3: Projects
        page.keyboard.press("Tab")

        # Check if Projects link is focused
        expect(projects_link).to_be_focused()
        print("✅ PASS: Projects link is focused.")

        # Verify dropdown menu visibility on focus
        # NEW BEHAVIOR: It should be visible (fix)
        expect(dropdown_menu).to_be_visible()
        print("✅ PASS: Dropdown menu is visible on focus.")

        browser.close()

if __name__ == "__main__":
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2) # Give server time to start
    try:
        run_tests()
    except Exception as e:
        print(f"Test error: {e}")
        sys.exit(1)
