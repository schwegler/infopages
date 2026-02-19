import http.server
import socketserver
import threading
import time
import sys
from playwright.sync_api import sync_playwright, expect

PORT = 8002

def start_server():
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        httpd.serve_forever()

def setup_page(page):
    # Mock CDNs to avoid timeouts in restricted environment
    page.route("**/cdn.tailwindcss.com/**", lambda route: route.abort())
    page.route("**/cdn.jsdelivr.net/**", lambda route: route.abort())
    page.route("**/fonts.googleapis.com/**", lambda route: route.abort())
    page.route("**/fonts.gstatic.com/**", lambda route: route.abort())

    # Mock Chart.js to prevent ReferenceError when CDN is blocked
    page.add_init_script("window.Chart = class { constructor() { this.options = {}; } };")

def verify_default_display(page):
    print("Running verify_default_display...")
    page.goto(f"http://localhost:{PORT}/pages/hollyoaks_history.html")
    # Wait for the data to be fetched and rendered
    # We increase timeout slightly just in case
    page.wait_for_selector(".timeline-event-card", timeout=5000)
    events = page.locator(".timeline-event-card")
    count = events.count()
    print(f"Found {count} events.")
    assert count == 25, f"Expected 25 events, but found {count}"
    print("verify_default_display passed!")

def verify_year_filtering(page):
    print("Running verify_year_filtering...")
    # Page is already at the right URL from previous test if we reuse it,
    # but let's be safe or just continue.
    # Actually, run_all creates a new page, so we should ensure it's loaded.
    if page.url == "about:blank":
        page.goto(f"http://localhost:{PORT}/pages/hollyoaks_history.html")

    # Select year 2008
    page.select_option("#year-select", "2008")

    # Wait for the filter to apply (it's immediate but good practice)
    # Check for cards. In 2008 there should be 2.
    events = page.locator(".timeline-event-card")
    count = events.count()
    print(f"Found {count} events for 2008.")
    assert count == 2, f"Expected 2 events for 2008, but found {count}"

    # Verify the year header is also present
    year_header = page.locator("h3.text-fuchsia-700", has_text="2008")
    expect(year_header).to_be_visible()

    print("verify_year_filtering passed!")

def verify_empty_state(page):
    print("Running verify_empty_state...")
    if page.url == "about:blank":
        page.goto(f"http://localhost:{PORT}/pages/hollyoaks_history.html")

    # Inject a new option "9999" and trigger change
    page.evaluate("""
        const select = document.getElementById('year-select');
        const opt = document.createElement('option');
        opt.value = '9999';
        opt.innerHTML = '9999';
        select.appendChild(opt);
        select.value = '9999';
        select.dispatchEvent(new Event('change'));
    """)

    # Assert that the "No major events" message is visible
    empty_msg = page.locator("#timeline-content", has_text="No major events recorded for this selection.")
    expect(empty_msg).to_be_visible()

    # Also verify no event cards are present
    events = page.locator(".timeline-event-card")
    assert events.count() == 0, f"Expected 0 events for year 9999, but found {events.count()}"

    print("verify_empty_state passed!")

def run_all():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
        setup_page(page)

        try:
            verify_default_display(page)
            verify_year_filtering(page)
            verify_empty_state(page)
        except Exception as e:
            print(f"Test failed: {e}")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    run_all()
