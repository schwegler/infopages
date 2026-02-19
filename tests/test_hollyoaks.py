import sys
import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8000

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    # Allow address reuse to avoid "Address already in use" errors on restart
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

        # Abort requests to external CDNs to avoid timeouts/errors
        def handle_route(route):
            url = route.request.url
            if "localhost" in url or "127.0.0.1" in url:
                route.continue_()
            else:
                route.abort()

        page.route("**/*", handle_route)

        # Mock Chart.js because the CDN is blocked
        page.add_init_script("""
            window.Chart = function() {
                this.update = function() {};
                this.destroy = function() {};
            };
        """)

        print(f"Navigating to http://localhost:{PORT}/hollyoaks_history.html")
        page.goto(f"http://localhost:{PORT}/hollyoaks_history.html")

        # Wait for the JS to load and render content
        # We look for a character node which indicates data loaded and processed
        try:
            page.wait_for_selector(".character-node", timeout=5000)
        except Exception:
            print("Timeout waiting for .character-node. Dumping page content:")
            print(page.content())
            raise

        # Verify title
        title = page.title()
        assert "Hollyoaks: The First 20 Years" in title
        print("✅ Title verified")

        # Verify AppData loaded and rendered
        families = page.locator(".family-tree")
        count = families.count()
        if count == 0:
            raise Exception("No family trees found")
        print(f"✅ Found {count} family trees")

        # Verify Timeline rendered
        events = page.locator(".timeline-event-card")
        # Give a little time for rendering if needed, though wait_for_selector above should suffice for initial load
        page.wait_for_timeout(500)
        events_count = events.count()
        if events_count == 0:
            raise Exception("No timeline events found")
        print(f"✅ Found {events_count} timeline events")

        # Test interaction: Click a character
        gordon = page.locator(".character-node", has_text="Gordon Cunningham").first
        if not gordon.count():
             raise Exception("Gordon Cunningham node not found")

        gordon.click()

        # Verify modal opens
        # The script adds 'is-visible' class to #character-modal
        try:
            page.wait_for_selector("#character-modal.is-visible", timeout=2000)
        except Exception:
            print("Modal did not become visible.")
            raise

        modal_content = page.locator("#modal-content")
        inner_text = modal_content.inner_text()
        assert "Gordon Cunningham" in inner_text
        print("✅ Modal opened for Gordon Cunningham and content verified")

        browser.close()

if __name__ == "__main__":
    # Start server in a thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Give it a second to start
    time.sleep(2)

    try:
        run_tests()
        print("🎉 All tests passed!")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)
