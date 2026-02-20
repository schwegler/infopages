from playwright.sync_api import sync_playwright

def verify_tna_focus():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Mock Chart.js
        page.add_init_script("""
            window.Chart = function() {
                this.update = function() {};
                this.destroy = function() {};
            };
        """)

        print("Navigating to TNA History...")
        page.goto("http://localhost:8003/tna_history.html")

        # Wait for flip cards
        page.wait_for_selector(".flip-card")

        # Focus the first flip card
        card = page.locator(".flip-card").first
        card.focus()

        # Wait for transition to complete mostly
        page.wait_for_timeout(600)

        # Take screenshot of the card area
        card.scroll_into_view_if_needed()

        screenshot_path = "verification/tna_flip_focus.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    verify_tna_focus()
