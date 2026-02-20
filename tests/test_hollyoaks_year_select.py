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
            httpd.serve_forever()
    except OSError as e:
        print(f"Error starting server: {e}")

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Mock CDNs
        page.route("**/cdn.tailwindcss.com/**", lambda route: route.abort())
        page.route("**/cdn.jsdelivr.net/**", lambda route: route.abort())
        page.route("**/fonts.googleapis.com/**", lambda route: route.abort())
        page.route("**/fonts.gstatic.com/**", lambda route: route.abort())

        # Mock Chart.js
        page.add_init_script("window.Chart = function() { this.update = function() {}; this.destroy = function() {}; };")

        print(f"Navigating to http://localhost:{PORT}/hollyoaks_history.html")
        page.goto(f"http://localhost:{PORT}/hollyoaks_history.html")

        # Wait for the year select to be populated (wait for options > 1 because "Show All Years" is always there)
        try:
            page.wait_for_function("document.getElementById('year-select').options.length > 1", timeout=5000)
        except Exception:
            print("Timeout waiting for year select options.")
            raise

        year_select = page.locator("#year-select")
        options = year_select.locator("option").all()

        # Extract values
        values = [opt.get_attribute("value") for opt in options]

        print(f"Found options: {values}")

        # Remove "all" option for checking years
        year_values = [v for v in values if v != "all"]

        # Check uniqueness
        unique_years = set(year_values)
        if len(unique_years) != len(year_values):
            raise Exception(f"Duplicate years found! {year_values}")
        print("✅ No duplicate years found.")

        # Check sorting
        sorted_years = sorted(year_values, key=lambda x: int(x))
        if year_values != sorted_years:
            raise Exception(f"Years are not sorted! Expected {sorted_years}, got {year_values}")
        print("✅ Years are sorted numerically.")

        # Check against known data (1996-2016 from json file analysis)
        expected_years = ['1996', '1997', '2002', '2004', '2006', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016']

        # Filter expected years based on what is actually in the data
        # Note: If the data changes, this test will fail, which is good.
        # But for now, I hardcoded what I saw in hollyoaks_data.json.

        if year_values != expected_years:
             raise Exception(f"Years do not match expected list! Expected {expected_years}, got {year_values}")
        print("✅ Years match expected data.")

        browser.close()

if __name__ == "__main__":
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2) # Give server time to start

    try:
        run_tests()
        print("🎉 All tests passed!")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)
