# My InfoPages

Welcome to My InfoPages, a collection of static web documents and guides. This repository contains various informational pages served as a static site.

## Available Pages

*   **[C# & SQL: A Starfleet Guide to Secure API Calls](sqlhttp.html)**: Learn about secure API calls with C# and SQL, framed as a Starfleet mission log.
*   **[The Slayer's Guide to SQL Server Migration](sqlmovebuffy.html)**: A Buffy the Vampire Slayer-themed guide to migrating SQL Server databases.
*   **[Hollyoaks: The First 20 Years](hollyoaks_history.html)**: An interactive exploration of the popular UK soap opera, Hollyoaks, covering its first two decades.

## Local Development

To view these pages locally, you can simply open the `index.html` file in your web browser.

Alternatively, you can run a local web server. For example, if you have Python installed:

```bash
python3 -m http.server
```

Then navigate to `http://localhost:8000` in your browser.

## Deployment

These are static HTML files using Tailwind CSS via CDN. You can deploy them to any static site hosting service or web server.

### General Instructions

1.  **Static Site Hosting**: Most static site hosts will automatically detect the HTML files. Ensure the publish directory is set to the root of the repository.
2.  **Traditional Web Hosting**: Upload all `.html` files to your `public_html` or `www` directory.

## License

This project is licensed under the CC0 1.0 Universal (Public Domain) License.
