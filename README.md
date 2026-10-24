# Andrew Schwegler · Info Pages

A static digital résumé and collection of interactive technical guides and cultural explorations. The canonical site is <https://infopages.pages.dev/>.

## Local development

Serve the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000/>. Use a server: ES modules and the history JSON require HTTP. There is no application bundle, browser runtime package dependency, external font, icon service or chart CDN.

## Routes

- `me.html`: standalone profile card and a scroll-through panel of freshly checked public blog/RSS/Trove updates; see [public source and hosting notes](docs/profile-public-updates.md).

- `index.html`: professional introduction, selected work, background, skills, education and contact.
- `work.html`: unified, ranked projects and experiments showcase; three genuine screenshots followed by compact links.
- `notes.html`: legacy entry point redirecting to the unified showcase (with a static fallback).
- `resume.html`: comprehensive career résumé with a three-page print / save as PDF layout.
- `bsky_mutual_blocks.html`: AT Protocol application overview and launch/source links.
- `sqlhttp.html`: C# / SQL permissions guide and local payload simulation.
- `sqlmovebuffy.html`: migration assessment, comparison, dependencies, security and cutover rehearsal.
- `hollyoaks_history.html`: filterable timeline, nested family relationships and character details.
- `tna_history.html`: 2007–2009 retrospective and accessible chart-data tables.
- `gay_bar_closures.html`: demographic/cause exploration and annotated original datasets.
- `tos.html`: existing terms, retained without substantive edits.

## Maintenance

Shared layout tokens and responsive/print styles live in `assets/site.css`. `assets/js/site.js` owns navigation and the directory. Project modules have separate responsibilities; `model.js` contains testable data logic and `dom.js` builds dynamic content with text nodes. The original `hollyoaks_data.json` remains the history source of truth.

Public career facts and unresolved editorial questions are recorded in [docs/content-sources.md](docs/content-sources.md). Existing research/demo values are distinguished from independently verified measurements. Do not convert illustrative values into professional achievements or research claims.

## Checks

```sh
npm ci
npm run build
npm audit --audit-level=high
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/playwright install chromium
.venv/bin/python -m pytest tests/browser -q
```

`npm run build` checks formatting, JavaScript syntax, routes, local references, metadata, sitemap and unit tests, including the public projection in the Workers runtime. It does not generate or deploy a bundle. `npm run format` applies the formatter. Browser tests cover all pages at desktop and mobile widths, navigation with and without JavaScript, interactions, failure states and print output. Tests run sequentially; screenshots and a print PDF are written to ignored `artifacts/` and uploaded by CI.

## Hosting

Publish the repository root as before. The pages remain ordinary HTML, CSS, JS and JSON. The profile now adds one bounded Pages Function at `/api/profile-latest`; `_routes.json` keeps all other routes static. See [the hosting and privacy contract](docs/profile-public-updates.md) before releasing this addition. `_headers` supplies a same-origin Content Security Policy and standard response protections on Cloudflare Pages. There is no deployment workflow in this repository; hosting-account settings remain separate. No merge or deployment is part of this change.

## License

The repository LICENSE and previous README identify CC BY 4.0. The existing package metadata says ISC, and the retained terms contain incompatible restrictions. These have not been silently reconciled. Owner review is required; see the content-source notes.

## Experiment repair review

See [the route-by-route repair audit](docs/experiment-repair-audit.md) and [shared brand usage](docs/brand-usage.md). Browser tests exercise every experiment at phone, tablet and desktop sizes and upload reading/result screenshots through CI.
