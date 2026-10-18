# Seasonal appearance

Halloween 2026 is an optional, local appearance. It starts off; the accessible toggle saves `halloween` or `off` in `seasonal-theme:v1` on this origin. Reset deletes that preference and returns to off. Storage denial gracefully leaves a session-only choice; storage events synchronize other tabs. No calendar activation, analytics, network service, floating trigger, or motion is used. Print hides both the costume panel and controls.

The controller owns preference and rendering, the stylesheet owns the self-contained decoration, and `mascot.png` owns the costume artwork. The three sites use the same behavior contract with distinct copy and illustration. Future seasons should extend an explicit allowlist and profile/assets after review, rather than adding speculative packs. Existing experiments, content palettes, navigation and footer branding are deliberately preserved.

Review: enable using “Halloween appearance” near the footer; turn it off using the same toggle, or choose “Reset appearance”. No production activation or publishing is part of this change.

## Costume artwork

Built-in image generation produced the transparent PNG; alpha was verified, transparent margins trimmed, and the image resized to at most 480 × 600 for delivery. Original source: `assets/brand/andrew-pencil-mascot.png`.

Prompt specification: Andrew as a friendly plum-cloaked wizard, keeping his purple hair, blue eyes, smile and pencil wand. Polished restrained cartoon cutout, full body, genuine transparent PNG, no background, text, or watermark. Preserve existing character identity and illustration style.

Existing Telly/Andrew image placements change to the costume while enabled; original sources, responsive attributes and alt text return when switched off.

## Rendered review evidence

- [Desktop, 1440 × 1050](screenshots/seasonal/halloween-desktop.png)
- [Mobile, 390 × 844](screenshots/seasonal/halloween-mobile.png)
- [Interaction results](screenshots/seasonal/browser-results.json)

Headless Chromium exercised default off, toggle on, reload persistence, saved off, reset, print hiding, empty decorative alt text and horizontal overflow. All routes using the shared résumé script were also visited with the seasonal panel enabled. Browser plugin was not available; the installed Playwright runtime and Chromium were used.
