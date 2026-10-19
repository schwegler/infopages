# Seasonal appearance · floating overlay contract v2

After about one second, the small costumed PNG itself arrives and hovers above the existing page. There is no hero, explanatory panel, reserved space or insertion into main content. Hover tooltip: **make it weird**. Accessible character label: **Turn on Halloween mode**. The discreet X has a 44px hit area and label **Dismiss Halloween character**.

Clicking the character applies dark plum/charcoal colourways, orange accents and animated camp atmosphere. The only new visible phrase is **well. it’s haunted now.**, followed by plain **Undo** and **Pause** controls. Clicking the active character also turns the theme off. The footer retains on/off, motion, Hide atmosphere and reset controls. Dismissing an active character hides the sprite but leaves its compact Undo/Pause controls available.

## Shared configuration and state

`assets/seasonal/season-config.js` defines `window.SchwegSeasonalConfig`: `schemaVersion: 2`, `invitationDelayMs`, `profile: {id, character}`, and `seasons` entries with `id`, `theme`, `label`, `enabled`, required UTC date `window.from` / exclusive `window.until`, and `asset`. Optional `scheme`, `tooltip`, `notice` and `decorations` keep pack-specific copy and scenery out of the controller, so a future Christmas pack does not inherit Halloween jokes or pumpkins.

Halloween 2026 is explicitly configured for October 18 through the exclusive November 1 boundary in UTC. A single deadline timeout restores the original state and removes seasonal UI at that boundary; long future windows are chunked only at the browser’s maximum timeout limit, without polling. Add a reviewed Christmas pack with a November 1 start, its approved PNG and matching theme CSS to use the same controller next. No final Christmas artwork or speculative pack is invented here. No entry in the current date window means no seasonal UI. Date selection chooses an invitation; it does not automatically activate a theme.

- `localStorage['seasonal-theme:v1']`: theme name (currently `halloween`) or `off`. Existing saved choices remain compatible. Unknown past-season values allow the new season’s invitation; explicit `off` suppresses invitations until reset.
- `localStorage['seasonal-motion:v1']`: `paused` / `auto`; device reduced motion takes precedence.
- `localStorage['seasonal-atmosphere:v1']`: optional site extension `hidden` / `auto`; Hide atmosphere removes the scene without turning off the dark theme.
- `sessionStorage['seasonal-prompt:v1:<season-id>']`: `dismissed` for this tab and season.
- Root attributes: `data-season`, `data-season-id`, `data-season-motion`, `data-seasonal-profile`.
- Window event `schweg:seasonal-change`: `{schemaVersion:2, seasonId, theme, active, motion, source}`.

Root attributes are snapshotted with their exact missing/present values and restored on Undo/expiry; the existing non-seasonal theme preference is preserved. Storage denial leaves usable in-page choices. Storage events synchronize appearance and motion across tabs. The same contract was sent to the separate Trove task; Facet’s bat remains owned there.

## Positioning, performance and accessibility

The transparent fixed wrapper has `pointer-events:none`; only character/control buttons receive pointer events. Positioning preserves a currently safe viewport-edge location, or chooses another location clear of visible headers, navigation, alerts, status/notice areas, links, buttons and form controls. Mobile safe-area insets and the visual viewport are respected. A visible modal or lack of a safe gap temporarily hides the overlay rather than covering an action. Custom obstacles can use `data-seasonal-avoid`.

One cancellable timeout schedules the invitation. Position reads are coalesced by a single animation frame only after show, scroll, resize, click/focus or dialog events; a ResizeObserver handles content-size changes. There is no polling, continuously running JavaScript animation loop, canvas or pointer-follow handler. Character and background motion use CSS transforms/opacity. Static shadows are not animated. Paused motion stays paused across reloads; reduced motion gives a static character and background. No focus is stolen on arrival. Keyboard Enter/Space activates the button, Escape dismisses when focus is in the overlay, and Undo restores the original appearance.

All artwork is decorative (`alt=""` or hidden from accessibility APIs). Print suppresses overlays and seasonal decoration. Dark mode uses the existing approved light signature PNG where necessary and restores the exact original source attributes on undo. Existing character images preserve their original aspect ratio, responsive sources and alt text. Existing `data-theme` and its saved preference are never changed. No main-content element is inserted or resized by the invitation.

## Costume provenance

The costume PNGs are unchanged. Reference: `assets/brand/andrew-pencil-mascot.png`. Built-in imagegen edited Andrew’s existing transparent pencil mascot into a wizard and Telly’s microphone pose into a vampire host. Moots’ paired sheet ghosts were newly generated to echo its overlapping-circle brand. Transparency was verified, transparent margins trimmed, and delivery sizes limited to 480 × 600. No mascot SVG substitute was used.

## Genuine review evidence

- [Short actual animation (GIF)](screenshots/seasonal/overlay-demo.gif) · [Original browser recording (WebM)](screenshots/seasonal/overlay-demo.webm)
- [Floating invitation desktop](screenshots/seasonal/invitation-desktop.png) · [Floating invitation mobile](screenshots/seasonal/invitation-mobile.png)
- [Dark Halloween desktop](screenshots/seasonal/halloween-desktop.png) · [Dark Halloween mobile](screenshots/seasonal/halloween-mobile.png)
- [Browser results](screenshots/seasonal/browser-results.json)

Videos show a real browser’s arrival, activation, moving background, pause and undo; the GIF is converted from that recording, not fabricated from design mockups. Stills are 1440 × 1050 and 390 × 844; the harness also checks 320px, zero main-layout movement, actual animated movement, keyboard activation, dismissal, persistence, motion pause, reduced motion, print hiding and protected controls. The Browser plugin was unavailable; installed Playwright/Chromium was used.

Blog previews render captured current WordPress HTML with local theme assets, excluding remote WordPress scripts. Fonts/assets are warmed before recording to avoid measuring unrelated network/font layout shifts. PHP regression tests cover integration; the preview is not a complete local WordPress installation. No production theme was activated.
