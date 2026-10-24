from playwright.sync_api import sync_playwright

def test_hollyoaks_xss_prevention():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        xss_payload = "<img src=x onerror='window.xss_vulnerable=true'>"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
        </head>
        <body>
            <select id="year-select"></select>
            <div id="all-family-trees"></div>
            <div id="timeline-content"></div>
            <div id="character-modal"></div>
            <button id="close-modal"></button>
            <div id="modal-content"></div>
            <canvas id="thematicChart"></canvas>
            <div id="timeline-section"></div>

            <script>
                window.Chart = function() {{}};
            </script>
            <script src="hollyoaks.js"></script>
            <script>
                window.appData = {{
                    characters: {{}},
                    familyStructures: {{
                        cunningham: {{
                            name: "Cunningham {xss_payload}",
                            tree: []
                        }}
                    }},
                    timelineEvents: [
                        {{
                            year: "1996",
                            title: "Event {xss_payload}",
                            description: "Description {xss_payload}",
                            family: "cunningham"
                        }}
                    ],
                    processedTimeline: {{
                        sortedYears: ["1996"],
                        eventsByYear: {{
                            "1996": [
                                {{
                                    year: "1996",
                                    title: "Event {xss_payload}",
                                    description: "Description {xss_payload}",
                                    family: "cunningham"
                                }}
                            ]
                        }}
                    }}
                }};
                document.dispatchEvent(new Event('DOMContentLoaded'));
            </script>
        </body>
        </html>
        """

        page.set_content(html_content)
        page.wait_for_timeout(500)

        is_vulnerable = page.evaluate("() => window.xss_vulnerable === true")
        assert not is_vulnerable, "XSS vulnerability detected! onerror handler executed."
        print("✅ XSS prevention verified: no payload executed.")

        browser.close()

if __name__ == "__main__":
    test_hollyoaks_xss_prevention()
