# My InfoPages

Welcome to My InfoPages, a collection of static web documents and guides. This repository contains various informational pages served as a static site.

## Available Pages

*   **[C# & SQL: A Starfleet Guide to Secure API Calls](pages/sqlhttp/index.html)**: Learn about secure API calls with C# and SQL, framed as a Starfleet mission log.
*   **[The Slayer's Guide to SQL Server Migration](pages/sqlmovebuffy/index.html)**: A Buffy the Vampire Slayer-themed guide to migrating SQL Server databases.
*   **[Hollyoaks: The First 20 Years](pages/hollyoaks_history/index.html)**: An interactive exploration of the popular UK soap opera, Hollyoaks, covering its first two decades.
*   **[Total Nonstop Action: The Cross The Line Era (2007-2009)](pages/tna_history/index.html)**: A retrospective on TNA Wrestling's pivotal years (2007-2009), featuring data viz and a six-sided ring.

## Site Policies

*   **[Terms of Service](pages/tos/index.html)**: Read the terms and conditions for using this site.

## Local Development

To view most pages locally, you can simply open the `index.html` file in your web browser.

However, pages like **Hollyoaks: The First 20 Years** (which fetches external data) and **Starfleet Guide to Secure API Calls** (which uses ES modules) require a local web server to function correctly due to browser security restrictions on local file access (CORS).

To run a local web server, if you have Python installed:

```bash
python3 -m http.server
```

Then navigate to `http://localhost:8000` in your browser.

## Running Tests

### Prerequisites

*   Python 3.7+
*   Node.js 18+

### Local Setup

1.  **Install Python dependencies:**

    It is recommended to use a virtual environment.

    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

2.  **Install Playwright browsers:**

    ```bash
    playwright install chromium
    ```

### Running Tests

To run the Python tests (e.g., for `hollyoaks_history.html` and `sqlmovebuffy.html`):

```bash
# Run pytest (for tests/test_sqlmovebuffy.py)
python3 -m pytest tests/

# Run standalone Playwright scripts
python3 tests/test_hollyoaks.py
python3 tests/test_timeline_filtering.py
```

To run the Node.js unit tests (e.g., for `sqlhttp.js`):

```bash
node --test tests/test_mission_control.mjs
```

## Continuous Integration (CI)

This repository includes tests that can be run in a CI environment. Below is an example GitHub Actions workflow (`.github/workflows/ci.yml`) to run these tests:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v5
      with:
        python-version: '3.12'

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install Python dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt

    - name: Install Playwright Browsers
      run: playwright install chromium

    - name: Run Python Tests (Pytest)
      run: pytest tests/test_sqlmovebuffy.py

    - name: Run Python Tests (Standalone)
      run: |
        python tests/test_hollyoaks.py
        python tests/test_timeline_filtering.py

    - name: Run Node.js Tests
      run: node --test tests/test_mission_control.mjs
```

## Deployment

These are static HTML files using Tailwind CSS via CDN. You can deploy them to any static site hosting service or web server.

### General Instructions

1.  **Static Site Hosting**: Most static site hosts will automatically detect the HTML files. Ensure the publish directory is set to the root of the repository.
2.  **Traditional Web Hosting**: Upload all `.html` files to your `public_html` or `www` directory.

## License

This project is licensed under the CC0 1.0 Universal (Public Domain) License.
