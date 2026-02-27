import sys
import threading
import http.server
import socketserver
import time
from playwright.sync_api import sync_playwright

PORT = 8005

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f"Serving at port {PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Error starting server: {e}")

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print(f"Navigating to http://localhost:{PORT}/index.html")
        page.goto(f"http://localhost:{PORT}/index.html")
        page.wait_for_selector("#universal-nav")

        # Set viewport to desktop to ensure dropdown behavior
        page.set_viewport_size({"width": 1280, "height": 720})

        projects_link = page.get_by_role("link", name="Projects")

        # Focus to trigger dropdown
        print("Focusing 'Projects' link...")
        projects_link.focus()

        # Wait for potential transition
        page.wait_for_timeout(500)

        # Take screenshot
        screenshot_path = "verification/dropdown_focus.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)
    try:
        verify_frontend()
    except Exception as e:
        print(f"Verification failed: {e}")
        sys.exit(1)
