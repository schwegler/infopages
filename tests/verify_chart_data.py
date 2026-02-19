import pytest
from playwright.sync_api import sync_playwright
import http.server
import socketserver
import threading
import time
import os

# Start server on a different port to avoid conflicts
PORT = 8001

def run_server():
    # Serve from the current working directory which should be the repo root
    # Use SimpleHTTPRequestHandler to serve files
    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass # Suppress logging

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

def test_chart_data():
    # Start server in background
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(2) # Wait for server to start

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Mock Chart.js to capture data
        # We assign the config to window.chartConfig so we can inspect it
        page.add_init_script("""
            window.chartConfig = null;
            window.Chart = class {
                constructor(ctx, config) {
                    window.chartConfig = config;
                    console.log('Chart created with config:', config);
                }
            };
        """)

        # Block external Chart.js to ensure mock is used
        page.route("**/*.js", lambda route: route.continue_()) # Allow local JS
        page.route("https://cdn.jsdelivr.net/npm/chart.js", lambda route: route.abort())

        try:
            page.goto(f"http://localhost:{PORT}/hollyoaks_history.html")

            # Wait for chart data to be captured
            # Poll for window.chartConfig
            for _ in range(10):
                config = page.evaluate("window.chartConfig")
                if config:
                    break
                time.sleep(0.5)

            assert config is not None, "Chart was not initialized"

            data = config['data']

            expected_labels = ['1996-2000', '2001-2005', '2006-2010', '2011-2016']
            # Expected datasets with exact values from the original code
            expected_datasets = [
                {'label': 'Teen/Family Drama', 'data': [5, 4, 0, 0], 'backgroundColor': '#F472B6', 'borderRadius': 4},
                {'label': 'Crime/Revenge', 'data': [0, 2, 11, 10], 'backgroundColor': '#14B8A6', 'borderRadius': 4},
                {'label': 'Social Issue/Tragedy', 'data': [5, 5, 8, 9], 'backgroundColor': '#6366F1', 'borderRadius': 4}
            ]

            assert data['labels'] == expected_labels
            assert len(data['datasets']) == 3

            for i in range(3):
                assert data['datasets'][i]['label'] == expected_datasets[i]['label']
                assert data['datasets'][i]['data'] == expected_datasets[i]['data']
                assert data['datasets'][i]['backgroundColor'] == expected_datasets[i]['backgroundColor']
                assert data['datasets'][i]['borderRadius'] == expected_datasets[i]['borderRadius']

            print("Chart data verified successfully!")

        except Exception as e:
            print(f"Test failed: {e}")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    test_chart_data()
