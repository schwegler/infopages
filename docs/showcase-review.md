# Unified showcase and Hellmouth restoration

This review pass updates open PR #142. It includes current main through #143 (`2760f57`): the complete résumé from #141 and homepage “View full résumé” link from #143 are preserved. No résumé content, signature asset, email obfuscation, support destinations or original Cat Club Site has been changed. The résumé page receives only the same consolidated navigation item as every other page.

## Buffy: restore the actual identity

The previous pass supplied a dark serif palette but missed the pre-#136 guide’s defining visual features. Inspected and rendered historical `0b8fd6c:sqlmovebuffy.html` alongside the existing PR preview and this implementation. Restored the original **The Hellmouth Migration** title, locally hosted **Creepster** horror display font, crimson/black atmosphere, framed teaching fixtures and Roman-numbered five-chapter story. The font is the same Google Fonts Creepster family referenced by the original, served locally with its SIL OFL license; no runtime font service is required.

The five chapters are Research at the Library, Willow’s Testing Spell, The Evacuation Convoy, Fortifying Cleveland and Averting the Apocalypse. The security topic control is now in a real fourth chapter, rather than folded into the dependency column. Assessment topics, four checkboxes, original comparison charts/table, dependency-role buttons, four security topics, seven-step rehearsal/reset, Giles and reference destinations are retained. Historical unsupported migration findings and private-system implications are not reinstated. Headings are brighter than the old dark red for accessible contrast; lengthy reading remains in a familiar serif. Shared header/footer stay consistent with the site.

Both `https://schweg.xyz/sqlmovebuffy` and `.html` were checked before changes: both return the extensionless page successfully. Browser tests now exercise both forms with complete control/result assertions. The local test server models Pages’ extensionless HTML routing; preview checks verify the real host’s behavior independently.

## One showcase, ordered by demonstrated work

`work.html` is the canonical discovery surface. Three screenshot-led entries lead into six compact links, with no duplicate destinations:

1. **Bluesky Mutuals Block Checker** — practical public application, protocol integration, browser-based relationship analysis and export. Strongest demonstration of useful software.
2. **The Hellmouth Migration** — substantial domain-specific explanation with multiple working teaching tools: assessment, comparison, topology, security and cutover.
3. **5 PM Cat Club** — polished illustrated interface, local-time logic and three actual playable games.
4. **Hollyoaks** — deeper relationship/timeline interactions and resilient data states.
5. **Secure API calls with C# & SQL** — focused permission-boundary teaching console and reference material.
6. **TNA** — year explorer, charts and roster reveals.
7. **Fading Spaces** — interactive research illustration; its original data limitations remain explicit.
8. **Trove** and 9. **tacobout.online** retain the existing external destinations as compact supporting links. Their full implementations are outside this repository, so they are not presented as evaluated featured applications.

This is an editorial order based on visible technical depth, usefulness and polish, not invented usage or impact statistics. The header now has one “Projects & experiments” link. The homepage has one clear entry point instead of another directory. Old `/notes` and `/notes.html` URLs redirect to `/work`; `notes.html` retains an accessible static fallback without a second list. All original project and external destinations remain available. No personal Bluesky profile is linked.

## Genuine screenshot assets

The three production images are actual Playwright captures at 1280×800, not generated mockups:

- `bsky`: live <https://bsky-mutual-blocks.pages.dev/> sign-in/analysis entry screen, captured without signing in or submitting an account.
- `buffy`: this branch’s working illustrative comparison after revealing its results.
- `cat-club`: this branch’s imported original library/countdown/arcade interface, displaying the original weekend state at capture time.

Each ships as 640px and 1280px WebP with native dimensions, responsive `srcset`/`sizes`, meaningful alt text and decoding hints; lower entries load lazily. All six files together are approximately 240 KiB; a phone uses about 65 KiB for the three 640px variants. No account data, credentials or fabricated results appear in screenshots. Evidence comparisons are separate from these production images.

## Visual fidelity and validation

The accepted references are the historical Buffy source and the existing approved shared site system. No new generated artwork or speculative visual concept replaces either reference. Browser plugin unavailable; used regular Playwright Chromium. Inspected the historical source render and final native phone/desktop screenshots with `view_image`.

| Comparison point          | Result                                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Buffy typography          | Exact original Creepster family self-hosted, rather than generic small-caps Georgia                                                    |
| Buffy palette and frame   | Black/crimson with restrained glow; higher-contrast heading red; shared shell preserved                                                |
| Content hierarchy         | Original title and five Roman-numbered chapters restored, controls remain reachable                                                    |
| Showcase structure        | Three image-led open rows transition into one compact list, rather than repeated competing directories                                 |
| Asset treatment           | Genuine 8:5 screenshots, explicit dimensions, responsive WebP, no composited fake UI                                                   |
| Mobile/short screens      | Stacked feature rows, wrapping headings, single-column teaching content, no horizontal overflow                                        |
| Interaction/accessibility | Real result assertions, native links/disclosures, keyboard focus, touch navigation, reduced motion and script-failure reading retained |

Visible copy changes are intentional: the original Hellmouth title/chapter names and requested unified showcase descriptions replace the previous generic headings. No extra badges, product metrics or feature claims have been introduced. Historical spelling and numbers in teaching datasets remain unchanged.

[Review images](screenshots/showcase-review/) show previous-PR versus updated first viewports at phone/desktop, historical Buffy versus restored styling, and full updated showcase renders. Existing experiment comparisons and original Cat Club provenance remain in [experiment-personalities.md](experiment-personalities.md). Full interaction/responsive captures are in CI’s `site-qa` artifact under `showcase/`.

Validation commands: `npm run build`, `npm audit --audit-level=high`, `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright /workspace/infopages/venv/bin/python -m pytest tests/browser -q`. CI runs the same browser suite against Chromium with all dependencies installed. Real-host preview and terminal CI results are recorded in the PR description after completion. Touch verification uses browser emulation, not physical devices; screen-reader and cross-browser certification are outside this check.
