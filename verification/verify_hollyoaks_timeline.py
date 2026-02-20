
import http.server
import socketserver
import threading
import time
import sys
from playwright.sync_api import sync_playwright

PORT = 8003

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        httpd.serve_forever()

def setup_page(page):
    # Mock CDNs
    page.route("**/cdn.tailwindcss.com/**", lambda route: route.abort())
    page.route("**/cdn.jsdelivr.net/**", lambda route: route.abort())
    page.route("**/fonts.googleapis.com/**", lambda route: route.abort())
    page.route("**/fonts.gstatic.com/**", lambda route: route.abort())

    # Mock Chart.js
    page.add_init_script("window.Chart = class { constructor() { this.options = {}; } };")

def verify_timeline(page):
    page.goto(f"http://localhost:{PORT}/hollyoaks_history.html")

    # Wait for content
    page.wait_for_selector(".timeline-event-card", timeout=5000)

    # Scroll to timeline section
    page.locator("#timeline-section").scroll_into_view_if_needed()
    time.sleep(1) # Wait for animation

    # Take screenshot of default view
    page.screenshot(path="verification/timeline_default.png")
    print("Screenshot saved: verification/timeline_default.png")

    # Filter by year
    page.select_option("#year-select", "2008")
    time.sleep(1) # Wait for update and animation

    # Take screenshot of filtered view
    page.screenshot(path="verification/timeline_filtered_2008.png")
    print("Screenshot saved: verification/timeline_filtered_2008.png")

def run():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        setup_page(page)

        try:
            verify_timeline(page)
        finally:
            browser.close()

if __name__ == "__main__":
    run()
