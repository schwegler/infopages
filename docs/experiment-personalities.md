# Experiment identities and original Cat Club import

Baseline: current main `3727462`, including functional/reference repairs #138, email obfuscation #139 and approved PNG signature #140. Changes are isolated from the concurrent résumé work: no résumé, shared shell, identity asset or shared stylesheet edits.

## Historical evidence

Inspected all six original HTML files at pre-redesign commit `0b8fd6c`, immediately before #136. The restored body designs follow their documented concepts:

| Experiment    | Original concept retained in the modern treatment                                                                  | Existing feature coverage preserved                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| SQL/API       | Starfleet / LCARS: dark bridge, orange controls, lavender rail, blue console divisions, technical display headings | Three permission simulations, payload, reset, code/reference                                                                |
| SQL migration | Buffy / Slayer: dark grimoire, crimson accents, serif reading and chapter headings, framed teaching fixtures       | Four assessment checks/topics, comparison charts, dependency roles, four security topics, seven-step rehearsal/reset, Giles |
| Hollyoaks     | Fuchsia / teal, rounded family cards and a bright explorer                                                         | 25-event timeline, year filter, families, dialogs/Escape/focus return, four thematic charts, data recovery                  |
| TNA           | Black / red / gold arena, uppercase display typography and ring motif                                              | Three years, all chart types and adjacent accessible data tables                                                            |
| Fading Spaces | Warm neutral / indigo research story, prominent statistic and restrained reading layout                            | Demographics, causes, geography, trend, tables and original caveats                                                         |
| Bluesky       | Dark navy / signature blue technical overview                                                                      | Original application/source actions, process, architecture, code/reference                                                  |

All themes are scoped to experiment main content in `assets/experiments.css`; shared header/footer remain on the site palette. Native controls remain operable by touch/keyboard. Reduced motion disables transitions. Dark chart series use project colors for readable contrast. Historical unsupported claims were not reinstated; #138's content repairs remain intact.

Phone before/after captures are in `screenshots/experiment-personalities/`. These compare current main with this branch, not the pre-#136 pages. Full viewport evidence remains in the review artifact. Screenshots are review evidence, not pixel-diff tests.

## 5 PM Cat Club provenance

Original: <https://five-pm-cat-club.schweg.chatgpt.site/>. Original conversation identified by the parent: <https://chatgpt.com/c/6abab289-8a50-83ea-9b9b-0fa811d3043e?messageId=a973da59-beb5-5fd4-be9b-629fe8bbc196>.

Source researcher identified project `appgprj_6abab2fcf5dc8191bb48aceb2cc1a497`, version 1 / commit `0114daf29d5131e5ca24aeab36b94d3c11297397`. The saved archive could not be downloaded through the original artifact service. Instead, the actual HTML, CSS, JS and PNG were successfully downloaded from the public original website on 2026-10-18. This is an import of those publicly served bytes, not a reconstruction from the feature description and not a claim of verified archive identity. No original Site credentials or settings were changed and no Library projection was materialized.

SHA-256 of unmodified downloads:

```text
bf65a3b17ad2a566258f2bb40ed61d6148b20344a6e118c55e529a1da7524036 index.html
5bd1190aaae830d0698204669a2b92bbc3717c5a714d40a23dd589be3f0071c7 style.css
e18632a2bf121b8a397acf591a7662cb93ad82fb3e5b597dfc9f807f768be8cb app.js
560263e25e7af9aaca59213f55c1fdb83cd54c525ac4584399887ac0c70d5f19 assets/clock-library.png
```

Imported at `five_pm_cat_club.html` and linked from Notes & experiments. The PNG is byte-identical to the public source. Original countdown logic (device-local weekdays, 5 PM completion, weekend off-duty), Falling Blocks, Snake and Sudoku are retained. Snake's best score is explicitly “this visit”; original source has no localStorage, cookies, server requests or analytics. No new persistence was added. Remote Google font import is removed for the existing self-hosted CSP, with system font fallbacks. Original game CSS is nested under `.cat-club`; shared header/footer added outside it. Narrow layouts constrain canvas/grid width. Keyboard shortcuts are scoped to the club, and Sudoku retains focus when its cells rerender. No paid services.
