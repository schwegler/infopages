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

        print(f"Navigating to http://localhost:{PORT}/sqlhttp.html")
        page.goto(f"http://localhost:{PORT}/sqlhttp.html")

        # Check if focusable
        print("Checking if #btn-clr is focusable...")
        tabindex = page.evaluate("document.getElementById('btn-clr').tabIndex")
        print(f"tabIndex: {tabindex}")

        if tabindex < 0:
             print("FAIL: btn-clr is not focusable (tabIndex < 0)")
             sys.exit(1)

        # Focus and press Enter
        print("Focusing and pressing Enter...")
        try:
            page.focus("#btn-clr")
            page.keyboard.press("Enter")
        except Exception as e:
            print(f"Error focusing or pressing key: {e}")
            sys.exit(1)

        # Wait a bit for the 'typing' animation
        page.wait_for_timeout(1000)

        # Check console output
        output = page.inner_text("#console-output")
        print(f"Console Output: '{output}'")

        if "sp_configure" not in output:
             print("FAIL: Console output did not update on Enter")
             sys.exit(1)

        print("PASS: Button is keyboard accessible")
        browser.close()

if __name__ == "__main__":
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(2)
    try:
        run_tests()
    except SystemExit as e:
        sys.exit(e.code)
    except Exception as e:
        print(f"Test error: {e}")
        sys.exit(1)
