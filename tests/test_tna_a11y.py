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

        # Mock Chart.js
        page.add_init_script("""
            window.Chart = function() {
                this.update = function() {};
                this.destroy = function() {};
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

        print("Focusing flip card...")
        card.focus()

        # Verify focus
        is_focused = page.evaluate("document.activeElement === document.querySelector('.flip-card')")
        if is_focused:
            print("✅ PASS: Flip card received focus.")
        else:
            raise Exception("❌ FAIL: Flip card did not receive focus.")

        # Verify flip transform
        inner = card.locator(".flip-card-inner")
        # Allow a small delay for CSS transition to start/apply computed style
        page.wait_for_timeout(100)

        transform = inner.evaluate("el => getComputedStyle(el).transform")
        print(f"Computed transform: {transform}")

        # matrix3d(...) or matrix(...) corresponding to rotation
        # rotateY(180deg) is usually matrix3d(-1, 0, ... ) or similar

        if transform != 'none' and transform != 'matrix(1, 0, 0, 1, 0, 0)':
             print("✅ PASS: Flip transformation applied.")
        else:
             raise Exception(f"❌ FAIL: Flip transformation NOT applied. Transform: {transform}")

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
