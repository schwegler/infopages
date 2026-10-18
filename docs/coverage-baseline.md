# Coverage baseline and roadmap

Assessment on the experiment-repair branch, 2026-10-18. This documents the new request to approach 99% coverage; it does not expand the approved repair into a broad testing project.

## What is measured

There was no existing code-coverage command, reporter or threshold in `package.json`, the Python requirements or CI. CI runs static checks, six Node unit tests and forty browser scenarios; passing tests are not a code-coverage percentage.

A lightweight local baseline used Node v26.3.1:

```sh
node --experimental-test-coverage --test --test-coverage-include='assets/js/*.js' tests/*.test.mjs
```

| Loaded unit-test module           |      Lines |    Branches |  Functions |
| --------------------------------- | ---------: | ----------: | ---------: |
| `assets/js/charts.js`             |     13.25% |     100.00% |     50.00% |
| `assets/js/dom.js`                |     14.63% |     100.00% |      0.00% |
| `assets/js/model.js`              |    100.00% |     100.00% |     83.33% |
| **These three loaded files only** | **37.79%** | **100.00%** | **46.67%** |

The denominator is the three modules loaded by these unit tests, **not the whole codebase**. The five remaining browser modules (`site.js`, `history.js`, `migration.js`, `research.js`, `sql-guide.js`) are not imported by Node and absent from this report. V8's branch figures here do not prove unexecuted browser branches are covered. The complete raw text is in the review ZIP at `implementation/artifacts/coverage/unit-baseline.txt`.

## Runtime boundaries and unmeasured work

- Production consists of eight first-party JavaScript modules, eleven static HTML routes, shared CSS, one history JSON dataset, images and deployment headers/configuration. There is no application backend in this repo.
- Browser tests execute the interactive modules but do not currently collect V8 coverage. Their scenarios include responsive navigation, filtering, dialogs, all experiment selectors, simulations, failed history fetch/retry and unsafe text rendering.
- HTML, CSS, source data, accessibility, layout, print quality and static deployment settings cannot honestly be reduced to the Node JavaScript percentage. Current static checks and visual/browser assertions address some of those separately.
- Python `scripts/validate_site.py` and Node `scripts/check_syntax.mjs` are build tooling, not browser application code. They have no measured coverage. Their parser/error paths need a separate tooling-test denominator.
- Test harness code, third-party dependencies, fonts and raster/vector artwork should not enter the first-party executable JavaScript denominator. Generated screenshots/reports are evidence, not source code. No runtime module should be excluded merely to increase a percentage.

## Meaningful next steps toward 99%

1. Add separate CI reports for the complete eight-module production JavaScript set and build tooling. Initialize unvisited production files as zero coverage so the denominator stays complete. Record line, branch and function totals separately.
2. Collect browser V8 coverage during the existing behavior suite, convert to an audited common report, and merge browser/unit executions without double counting. Keep print/responsiveness/accessibility evidence as separate quality gates.
3. Inspect the real uncovered report before writing tests. Likely useful gaps include non-OK and malformed history responses (currently only network abort is tested), direct history deep links/back-forward view consistency, all model fallback branches, chart empty/single/extreme inputs, navigation breakpoint changes and absent optional controls. Test product outcomes and user-visible recovery, not just function calls.
4. Exercise validator failures using disposable minimal sites: broken local references, missing headings/metadata, prohibited personal profile links, invalid sitemap and disallowed handlers. Verify meaningful diagnostics and nonzero exit status.
5. Establish an honest baseline gate, then raise it with reviewed tests toward approximately 99% for each executable denominator. Review any unreachable or defensive remainder explicitly. Do not remove legitimate guards or add empty assertions to meet the number.

A 99% target is practical for a small static JavaScript application, but no current whole-repository percentage is established. External app behavior, Cloudflare delivery, email routing and browser rendering remain integration boundaries even at high source coverage.
