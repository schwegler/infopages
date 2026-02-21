import sys
import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8002

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

        # Mock Chart.js to avoid errors
        page.add_init_script("""
            window.Chart = class {
                constructor() {
                    this.update = function() {};
                    this.destroy = function() {};
                }
            };
        """)

        print(f"Navigating to http://localhost:{PORT}/tna_history.html")
        page.goto(f"http://localhost:{PORT}/tna_history.html")

        # Wait for content to load
        try:
            page.wait_for_selector(".flip-card", timeout=5000)
        except Exception:
            print("Timeout waiting for .flip-card")
            raise

        # Find the first flip card
        card = page.locator(".flip-card").first
        if not card.count():
             raise Exception("No flip card found")

        # Check for tabindex="0"
        tabindex = card.get_attribute("tabindex")
        if tabindex != "0":
            raise Exception(f"❌ FAIL: Flip card missing tabindex='0'. Found: {tabindex}")
        print("✅ PASS: Flip card has tabindex='0'.")

        # Focus the card
        print("Focusing card...")
        card.focus()

        # Check computed style for transform
        # We need to check the inner element
        inner = card.locator(".flip-card-inner")

        # Wait for transition (though focus is instant, transition takes 0.6s)
        page.wait_for_timeout(700)

        # Check if transform is applied
        # Note: getComputedStyle returns matrix usually
        transform = inner.evaluate("el => getComputedStyle(el).transform")
        print(f"Transform value: {transform}")

        if transform == "none" or not transform:
            raise Exception("❌ FAIL: Flip card did not rotate on focus.")
        else:
             print("✅ PASS: Flip card rotated on focus.")

        # Check outline on focus
        outline_style = card.evaluate("el => getComputedStyle(el).outlineStyle")
        outline_color = card.evaluate("el => getComputedStyle(el).outlineColor")
        print(f"Outline style: {outline_style}, color: {outline_color}")

        if outline_style == "none":
             raise Exception("❌ FAIL: Focus outline is missing.")
        else:
             print("✅ PASS: Focus outline is present.")

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
