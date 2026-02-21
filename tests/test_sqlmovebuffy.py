import pytest
from playwright.sync_api import Page, expect
import threading
import http.server
import socketserver
import time

PORT = 8001  # Use a different port to avoid conflict with potential other servers

class ReuseAddrTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

@pytest.fixture(scope="module")
def server():
    # Start a simple HTTP server in a background thread
    handler = http.server.SimpleHTTPRequestHandler
    httpd = ReuseAddrTCPServer(("", PORT), handler)
    thread = threading.Thread(target=httpd.serve_forever)
    thread.daemon = True
    thread.start()
    yield
    httpd.shutdown()
    httpd.server_close()

def test_sqlmovebuffy(page: Page, server):
    # Mock setTimeout to be faster for the ritual and analysis
    page.add_init_script("""
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = (fn, delay) => {
                return originalSetTimeout(fn, 100); // Faster but allows checks
        };
    """)

    # Navigate to the page
    page.goto(f"http://localhost:{PORT}/sqlmovebuffy.html")

    # 1. Page Load
    expect(page).to_have_title("The Slayer's Guide to SQL Server Migration")

    # 2. Scroll Animation
    header_bg = page.locator("#header-bg")
    # Initial opacity is 0.15.
    initial_opacity = float(header_bg.evaluate("el => getComputedStyle(el).opacity"))
    assert initial_opacity > 0

    # Scroll down
    page.evaluate("window.scrollTo(0, 500)")
    page.wait_for_timeout(200) # Wait for scroll event

    scrolled_opacity = float(header_bg.evaluate("el => getComputedStyle(el).opacity"))
    assert scrolled_opacity < initial_opacity

    # 3. DMA Checklist
    # Click first item
    first_item = page.locator(".dma-item").first
    note = first_item.get_attribute("data-note")
    first_item.click()

    # Check details
    details = page.locator("#dma-details p")
    expect(details).to_have_text(note)

    # 4. DEA Analysis
    run_btn = page.locator("#run-dea-btn")
    run_btn.click()

    # Wait for results
    results = page.locator("#dea-results")
    expect(results).to_be_visible()

    # Check if charts are rendered
    expect(page.locator("#dea-results-source .bg-red-500")).to_be_visible()

    # 5. Dependency Map
    web_server = page.locator("#server-web")
    # Wait for lines to be drawn
    page.wait_for_timeout(200)

    web_server.hover()
    # Check if any line turns purple (rgb(147, 51, 234))
    # Wait for the color change using wait_for_function which polls
    try:
        page.wait_for_function("""() => {
            const lines = document.querySelectorAll('.dependency-line');
            for (let line of lines) {
                if (getComputedStyle(line).stroke === 'rgb(147, 51, 234)') return true;
            }
            return false;
        }""", timeout=2000)
    except Exception:
        # If it fails, dump some debug info
        print("Timeout waiting for purple line. Current strokes:")
        print(page.evaluate("""() => {
            return Array.from(document.querySelectorAll('.dependency-line')).map(l => getComputedStyle(l).stroke)
        }"""))
        raise

    # 6. Security Armory
    tde_btn = page.locator(".security-btn[data-weapon='tde']")
    tde_btn.click()

    desc = page.locator("#weapon-desc h5")
    expect(desc).to_have_text("Transparent Data Encryption")

    # 7. Cutover Ritual
    cutover_btn = page.locator("#cutover-btn")
    status = page.locator("#cutover-status")

    # There are 7 steps. The button must be clicked for each step.
    for i in range(7):
        cutover_btn.click()
        # Wait for the step to complete (status becomes empty or final message)
        if i < 6:
            # Wait for button to be enabled again or status to clear
            expect(status).to_have_text(f"Performing: {['Apply Final Log Backups', 'Migrate IIS Configuration', 'Deploy Application Code to Cleveland', 'Run Final Data & App Validation', 'Redirect DNS to Cleveland', 'Bring Cleveland Databases Online', 'Decommission Sunnydale (Salt and Burn)'][i]}...", timeout=1000)
            expect(cutover_btn).to_be_enabled(timeout=1000)
        else:
            # Last step
            expect(status).to_have_text("The Hellmouth is Closed. Cleveland is Online.", timeout=5000)

def test_giles_ai(page: Page, server):
    # Mock setTimeout to be faster
    page.add_init_script("""
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = (fn, delay) => {
                return originalSetTimeout(fn, 100);
        };
    """)

    page.goto(f"http://localhost:{PORT}/sqlmovebuffy.html")

    # 1. Open Chat
    toggle_btn = page.locator("#giles-toggle-btn")
    chat_window = page.locator("#giles-chat-window")

    expect(chat_window).to_be_hidden()
    toggle_btn.click()
    expect(chat_window).to_be_visible()

    # 2. Ask question at Intro (default)
    ask_btn = page.locator("#giles-ask-btn")
    chat_log = page.locator("#giles-chat-log")

    ask_btn.click()
    # Check for user message
    expect(chat_log).to_contain_text("What should I know about this?")

    # Check for Giles response (Intro text contains "Welcome")
    expect(chat_log).to_contain_text("Welcome", timeout=2000)

    # 3. Scroll to Phase 1 and Ask
    page.locator("#phase-1").scroll_into_view_if_needed()
    # Wait for intersection observer to update
    page.wait_for_timeout(500)

    ask_btn.click()
    # Check for new response (Phase 1 text contains "Data Migration Assistant")
    expect(chat_log).to_contain_text("Data Migration Assistant", timeout=2000)

    # 4. Close Chat
    close_btn = page.locator("#giles-close-btn")
    close_btn.click()
    expect(chat_window).to_be_hidden()
