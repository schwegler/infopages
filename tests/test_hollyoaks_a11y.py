import sys
import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8001

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

        page.add_init_script("""
            window.Chart = function() {
                this.update = function() {};
                this.destroy = function() {};
            };
        """)

        print(f"Navigating to http://localhost:{PORT}/hollyoaks_history.html")
        page.goto(f"http://localhost:{PORT}/hollyoaks_history.html")

        # Wait for content to load
        try:
            page.wait_for_selector(".character-node", timeout=5000)
        except Exception:
            print("Timeout waiting for .character-node")
            raise

        # Find a character button
        character = page.locator(".character-node").first
        if not character.count():
             raise Exception("No character node found")

        print("Clicking character...")
        character.click()

        # Wait for modal to open
        modal = page.locator("#character-modal")
        try:
            page.wait_for_selector("#character-modal.is-visible", timeout=2000)
            print("Modal opened.")
        except Exception:
            print("Modal did not open.")
            raise

        # 1. Check if focus moved to close button or inside modal
        # We'll check if the active element is the close button or inside the modal
        active_element_id = page.evaluate("document.activeElement.id")
        print(f"Active element ID: {active_element_id}")

        if active_element_id == "close-modal":
             print("✅ PASS: Focus moved to close button.")
        else:
             print(f"❌ FAIL: Focus did not move to close button. Active element: {active_element_id}")

        # 2. Test Escape key
        print("Pressing Escape...")
        page.keyboard.press("Escape")

        # Check if modal is closed
        # We give it a moment for transition
        page.wait_for_timeout(500)

        is_visible = modal.get_attribute("class")
        if "is-visible" in is_visible:
            print("❌ FAIL: Modal is still visible after pressing Escape.")
        else:
            print("✅ PASS: Modal closed after pressing Escape.")

        # 3. Check if focus returned to the trigger element
        # We need to check if the previously clicked character button is focused
        # We can check if document.activeElement matches the character button
        # Since we can't easily compare objects between contexts, we'll check if the active element has the same text/attributes

        # For strict verification, let's see if the focused element has the 'selected' class or simply if it's the button we clicked.
        # But wait, the 'selected' class is removed on close.
        # So we check if the active element is the character button we clicked.

        # We can assign an ID to the button before clicking if it doesn't have one, or use data-id
        # The buttons have data-id.

        focused_data_id = page.evaluate("document.activeElement.getAttribute('data-id')")
        clicked_data_id = character.get_attribute("data-id")

        print(f"Clicked data-id: {clicked_data_id}")
        print(f"Focused data-id: {focused_data_id}")

        if focused_data_id == clicked_data_id:
             print("✅ PASS: Focus returned to trigger element.")
        else:
             print("❌ FAIL: Focus did not return to trigger element.")

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
