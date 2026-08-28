import pytest
from playwright.sync_api import sync_playwright
import http.server
import socketserver
import threading
import time
import os

PORT = 8011

class ReuseAddrTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

def run_server():
    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass

    with ReuseAddrTCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

def test_chart_data():
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        page.add_init_script("""
            window.chartConfig = null;
            window.Chart = class {
                constructor(ctx, config) {
                    window.chartConfig = config;
                    console.log('Chart created with config:', config);
                }
            };
        """)

        page.route("**/*.js", lambda route: route.continue_())
        page.route("https://cdn.jsdelivr.net/npm/chart.js", lambda route: route.abort())

        try:
            page.goto(f"http://localhost:{PORT}/hollyoaks_history.html")

            for _ in range(10):
                config = page.evaluate("window.chartConfig")
                if config:
                    break
                time.sleep(0.5)

            assert config is not None, "Chart was not initialized"

            data = config['data']

            expected_labels = ['1996-2000', '2001-2005', '2006-2010', '2011-2016']
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
