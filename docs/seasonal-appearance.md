# Seasonal appearance · shared contract v2

A fresh visitor sees the costumed character arrive after about one second in a dedicated area above the content. The character gently hovers; keyboard/touch activation turns the page into a pumpkin-orange Halloween scene with moons, jack-o’-lanterns, friendly wisps and twinkling dots. The 44px close button dismisses the invitation for this tab and season. Nothing transforms until the visitor chooses it.

The active scene provides **Restore original appearance** and **Pause scene animations**. Footer controls also provide on/off, motion pause and reset. Explicit saved on/off choices are respected; reset returns to standard appearance and makes the invitation available again. No control is covered by a fixed character overlay.

## Configuration and the next season

`assets/seasonal/season-config.js` defines `window.SchwegSeasonalConfig` with `schemaVersion: 2`, `invitationDelayMs`, a site `profile` (`id`, `character`, `placement`), and a `seasons` array. Entries contain `id`, `theme`, `label`, `enabled`, optional `window.from` / exclusive `window.until` local dates, `asset`, `kicker`, `title`, `detail` and `prompt`.

The controller selects the first enabled entry whose date window contains today. Halloween 2026 currently runs October 1 through October 31. A reviewed Christmas entry can start **November 1** using the same controller, preference contract and UI. Add its approved PNG, copy and CSS pack before enabling it; this change does not invent Christmas artwork or silently reuse Halloween costumes. If no entry applies, the controller mounts no seasonal UI.

## Preferences and events

- `localStorage['seasonal-theme:v1']`: active theme name (currently `halloween`) or `off`. The existing key is preserved. Unknown past-season values allow the current season’s invitation; explicit `off` suppresses invitations until reset.
- `localStorage['seasonal-motion:v1']`: `paused` or `auto`. Device reduced motion always wins.
- `sessionStorage['seasonal-prompt:v1:<season-id>']`: `dismissed`, scoped to this tab and season.
- Root attributes: `data-season`, `data-season-id`, `data-season-motion` and `data-seasonal-profile`.
- `window` event `schweg:seasonal-change`: detail `{schemaVersion:2, seasonId, theme, active, motion, source}`.

Storage failures leave usable in-page choices. Storage events synchronize appearance and motion between tabs. This contract is shared with the separate Trove implementation; Facet’s bat costume remains owned there.

## Motion, accessibility and restoration

One cancellable `setTimeout` schedules the invitation. There is no polling, canvas, animation loop, external service, filter/blur animation or pointer interception. Eight decorative spans plus the PNG use compositor-friendly transform/opacity animations. Pausing freezes seasonal motion; reduced motion renders a static invitation, static character and static background. All decoration has empty alt text or is hidden from accessibility APIs. Print hides seasonal controls and decoration.

The character lives in normal flow, with space reserved during the short arrival delay. Main content keeps readable cream/plum surfaces. Orange tokens apply only while `data-season=halloween` is present. Removing that attribute restores original tokens; existing Telly/Andrew placements restore their exact original src/srcset/sizes/alt attributes. Navigation/footer logos, contact encoding, support links and experiment behavior remain intact.

## Artwork provenance

The existing costume PNG is unchanged from the previous draft. Reference: `assets/brand/andrew-pencil-mascot.png`. Andrew’s wizard and Telly’s vampire host were produced by built-in imagegen editing their respective transparent character references, preserving identity and illustration style. Moots’ paired sheet ghosts were newly generated to echo its overlapping-circle brand. Alpha was verified; transparent margins were trimmed and delivery sizes limited to 480 × 600. No mascot SVG substitute was used.

## Genuine rendered previews

- [Invitation desktop](screenshots/seasonal/invitation-desktop.png) · [Invitation mobile](screenshots/seasonal/invitation-mobile.png)
- [Active Halloween desktop](screenshots/seasonal/halloween-desktop.png) · [Active Halloween mobile](screenshots/seasonal/halloween-mobile.png)
- [Browser interaction results](screenshots/seasonal/browser-results.json)

Desktop is 1440 × 1050; mobile is 390 × 844. The interaction harness also checks 320px width, keyboard activation, delayed arrival, dismissal, saved off, restoration, pause persistence, reduced motion, decorative alt text and print hiding. Browser plugin was unavailable; installed Playwright/Chromium was used. Blog previews render captured current WordPress HTML with local seasonal assets and exclude remote WordPress scripts. PHP tests cover integration; this is not a complete local WordPress installation.
