import os
import json
from playwright.sync_api import sync_playwright

def run_benchmark(filename):
    file_path = os.path.abspath(filename)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"file://{file_path}")

        # Wait for results
        page.wait_for_selector("#benchmark-results")
        results_text = page.locator("#benchmark-results").inner_text()
        results = json.loads(results_text)

        browser.close()
        return results

if __name__ == "__main__":
    baseline = run_benchmark("tests/perf_benchmark.html")
    optimized = run_benchmark("tests/perf_benchmark_optimized.html")

    print(f"Baseline Results:")
    print(f"Dots: {baseline['dots']:.4f} ms/frame")
    print(f"Warp: {baseline['warp']:.4f} ms/frame")

    print(f"\nOptimized Results:")
    print(f"Dots: {optimized['dots']:.4f} ms/frame")
    print(f"Warp: {optimized['warp']:.4f} ms/frame")

    print(f"\nImprovement:")
    print(f"Dots: {baseline['dots'] / optimized['dots']:.2f}x faster")
    print(f"Warp: {baseline['warp'] / optimized['warp']:.2f}x faster")
