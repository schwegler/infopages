from playwright.sync_api import sync_playwright

def verify_sqlhttp():
    url = "http://localhost:8000/sqlhttp.html"
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        try:
            page.goto(url)
            # Wait a bit for animation to run
            page.wait_for_timeout(2000)
        except Exception as e:
            print(f"Failed to load page: {e}")
            exit(1)

        if console_errors:
            print("Errors found:")
            for err in console_errors:
                print(err)
            exit(1)
        else:
            print("No errors found on sqlhttp.html")

if __name__ == "__main__":
    verify_sqlhttp()
