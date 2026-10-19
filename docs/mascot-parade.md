# Mascot parade

Each page gets one staggered left-to-right visit, beginning 2,000 ms after
`window.load`. Hover or keyboard focus holds the whole cast still, including
the joint animation. Background tabs pause; returning from the back/forward
cache continues the same visit. Completion and dismissal do not replay it.

The Appearance menu from merged PR #146 holds the persistent **Mascot parade**
toggle and a **Meet the apps** action. That action opens a static list in the
document, focuses its first link, and works even after dismissal or opt-out.
Reduced motion uses the same static list automatically, with visible logos and
names and no walking or entrance effects. Turning reduced motion off does not
restart a moving visit. Dismissal returns keyboard focus to Appearance.

Touch uses a first tap to identify and pause a mascot, then a second tap to
follow its link. Tapping outside releases the touch pause. Every external link
has an accessible name, `target="_blank"`, and `rel="noopener noreferrer"`.
Decorative artwork and logos have empty alt text. Offscreen characters are inert.

The transparent lane does not intercept input outside individual controls. Low
page links compact the lane while preserving character proportions; characters
yield their hit areas if another page control still intersects. Labels stay
within the viewport and safe-area insets. The seasonal corner invitation yields
while the cast passes, then returns. A seasonal control that already has focus
takes priority over starting a parade. Existing seasonal-flow tests set the
parade preference off; a separate integration test verifies the corner handoff.

## Artwork and verified destinations

No walking sprites or layered production rigs were available in the Mac
workspace. The cutout rigs use the exact original PNG pixels in clipped DOM
layers. Hips and knees rotate independently; Hitch's gesture moves slightly at
the shoulder. Telly holds the microphone, Facet holds the book, and Andrew keeps
the pencil and pocket poses. Bodies, faces, props, palettes, and limb shapes
are not redrawn or warped. A small vertical step follows foot contact. Stride
timing follows displayed size and travel speed. The result is a two-dimensional
cutout walk using the approved front/three-quarter drawings.

| Character | Source                                                                                                                                                                      | Destination                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Telly     | [Approved host PNG](https://github.com/schwegler/tacobout.online/blob/e95817b1146e9d3b94532acd38e0d7894dc8e56f/assets/brand/duo_left_telly_host_transparent.png)            | <https://tacobout.online/>  |
| Facet     | [Approved archivist PNG](https://github.com/schwegler/tacobout.online/blob/e95817b1146e9d3b94532acd38e0d7894dc8e56f/assets/brand/duo_right_facet_archivist_transparent.png) | <https://trove.schweg.xyz/> |
| Hitch     | [Approved Hitch PNG](https://github.com/schwegler/bsky-mutual-blocks/blob/0a3bcaac5f5189ab43669739293801a98a103737/public/assets/brand/hitch.png)                           | <https://moots.schweg.xyz/> |
| Andrew    | Existing `assets/brand/andrew-pencil-mascot.png`, unchanged                                                                                                                 | <https://schweg.xyz/>       |

Public HTML was checked on 2026-10-19. Telly's label uses the actual blog header
`/wp-content/uploads/2026/10/taco-mark.png`; Trove uses the existing
`trove_rounded_app_icon.png`, also used by the live Trove header. Moots uses the
live header's exact two-circle SVG geometry in its brand violet. Andrew uses
the approved existing signature PNG; its label selects
its light variant on dark backgrounds. Runtime assets are local and work with
the unchanged strict CSP. `assets/parade/provenance.json` records byte hashes.

The local test server uses a 64-connection queue so parallel module/image
requests cannot overflow Python's default queue of five sockets. Every mascot
must decode before its moving link becomes visible; failed art never shows a
broken-image placeholder.

## Validation

`npm run build` validates formatting, JavaScript, all 12 routes, and Node tests.
`python -m pytest tests/browser/test_mascot_parade.py -q` covers the blocked-load
timer boundary, stagger, single completion, hover/focus pause, actual new-tab
destinations, dismissal, stored and cross-tab opt-out, storage denial, five
viewport sizes, clamped labels, reduced motion and live changes, touch, page
control collision, and seasonal coexistence. The full Chromium suite protects
the existing site. The focused parade and Appearance checks also run in the
established WebKit runtime described in `appearance-webkit-qa.md`.

Browser plugin unavailable in this environment; isolated headless Playwright
processes avoid interfering with other Mac browser tasks. Physical iPhone/iPad
touch remains a manual follow-up check.

## Follow-up QA

The first Linux CI run found that the cast could stay hidden at 320 × 568 when
page controls occupied the bottom lane. The lane now tries a compact band at
the bottom, then a clear band above those controls. Hovering the stationary
dismiss button also no longer holds the cast offscreen. Regression checks
cover full-width bottom navigation at 320 × 568 and 720 × 450, plus dismiss
hover before entry.

Native Chromium browser zoom was set to 200% through the browser's zoom API
in a fresh, isolated profile. A 1440 × 900 window becomes a 720 × 450 CSS
viewport; an 820 × 1180 window becomes 410 × 590. All four mascots, label
bounds, keyboard access, the static list, and dismissal were checked with no
horizontal overflow or CSP errors. Closing the static list scrolls its returned
Appearance focus into view.
On narrow phones, the static labels put the logo above the app name so WebKit's
font metrics cannot force horizontal overflow. Dismissal restores focus after
hiding the list, including WebKit pointer clicks that do not focus buttons.

Sixteen walking phases were inspected at 300px character height against the
original PNGs. Cropped shoe outlines in Telly, Facet, and Hitch were corrected,
front/back part ordering was improved, and Telly/Andrew cadence was shortened
to better match travel distance. Faces and the microphone remain rigid original
pixels; the held microphone does not swing or distort.

This remains a cutout gait from front/three-quarter artwork. At enlarged sizes,
small join changes and some foot sliding remain visible: the soles are not
locked to world coordinates, and the original overlapping limbs contain no
independent hidden-heel artwork. It should be judged from the motion proof,
not represented as a fully drawn walk cycle. Eliminating those limitations
would require additional approved walking frames or layered limb art.
