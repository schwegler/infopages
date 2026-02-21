import sys
import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8003

def start_server():
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

        def handle_route(route):
            url = route.request.url
            if "localhost" in url or "127.0.0.1" in url:
                route.continue_()
            else:
                route.abort()

        page.route("**/*", handle_route)

        print(f"Navigating to http://localhost:{PORT}/sqlhttp.html")
        page.goto(f"http://localhost:{PORT}/sqlhttp.html")

        # Wait for collapsible headers to be visible
        try:
            page.wait_for_selector(".collapsible-header", timeout=5000)
        except Exception:
            print("Timeout waiting for .collapsible-header")
            raise

        # Find the second collapsible header (index 1) which should be closed by default
        headers = page.locator(".collapsible-header")
        count = headers.count()
        if count < 2:
            raise Exception(f"Expected at least 2 collapsible headers, found {count}")

        header = headers.nth(1)

        # Verify initial accessibility attributes
        role = header.get_attribute("role")
        tabindex = header.get_attribute("tabindex")
        aria_expanded = header.get_attribute("aria-expanded")

        print(f"Initial attributes: role={role}, tabindex={tabindex}, aria-expanded={aria_expanded}")

        if role != "button":
            print("❌ FAIL: role is not 'button'")
            # Don't raise yet, let's see other failures

        if tabindex != "0":
            print("❌ FAIL: tabindex is not '0'")

        if aria_expanded != "false":
            print(f"❌ FAIL: aria-expanded is '{aria_expanded}', expected 'false'")

        # Test Keyboard Interaction (Enter)
        print("Focusing header and pressing Enter...")
        header.focus()
        page.keyboard.press("Enter")

        # Check if it expanded
        # Wait for the class 'open' on the header
        try:
            page.wait_for_function("document.querySelectorAll('.collapsible-header')[1].classList.contains('open')", timeout=2000)
            print("✅ PASS: Header expanded on Enter (class 'open' present).")
        except Exception:
            print("❌ FAIL: Header did not expand on Enter.")

        # Check aria-expanded after expansion
        aria_expanded_after = header.get_attribute("aria-expanded")
        if aria_expanded_after != "true":
             print(f"❌ FAIL: aria-expanded is '{aria_expanded_after}' after expansion, expected 'true'")

        # Test Keyboard Interaction (Space) to close
        print("Focusing header and pressing Space...")
        header.focus() # Ensure focus
        page.keyboard.press("Space")

        # Check if it collapsed
        try:
            page.wait_for_function("!document.querySelectorAll('.collapsible-header')[1].classList.contains('open')", timeout=2000)
            print("✅ PASS: Header collapsed on Space.")
        except Exception:
             print("❌ FAIL: Header did not collapse on Space.")

        # Check aria-expanded after collapse
        aria_expanded_final = header.get_attribute("aria-expanded")
        if aria_expanded_final != "false":
             print(f"❌ FAIL: aria-expanded is '{aria_expanded_final}' after collapse, expected 'false'")

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
