# Mascot parade

Each page gets one left-to-right visit, beginning 2,000 ms after `window.load`.
Telly, Facet, and Hitch cross **one at a time**. The next character enters only
after the previous one has completely exited, including extra space for moving
shoes. Hover or keyboard focus pauses travel and joint motion without admitting
the next character. Completion and dismissal do not replay the visit.
Background tabs pause; the back/forward cache continues the same visit.

The Appearance menu from merged PR #146 holds the persistent **Mascot parade**
toggle and **Meet the apps** action. That action opens a static list in the
document and focuses its first link, including after dismissal or opt-out.
Reduced motion uses this same static list automatically with visible logos and
names. Turning reduced motion off does not restart movement. Dismissal returns
focus to Appearance; closing the static list also brings that focus into view.

Touch uses a first tap to identify and pause a mascot and a second tap to open
the app. Tapping outside releases the touch pause. Each app link has an accessible
name, `target="_blank"`, and `rel="noopener noreferrer"`. Decorative images have
empty alt text. Offscreen and inactive characters are inert.

The transparent lane accepts input only on its controls. Low page links compact
the lane while preserving proportions; the lane can lift above bottom navigation.
Characters yield their hit areas if a page control still intersects. Labels stay
within the viewport and safe-area insets. The seasonal corner invitation yields
while the cast passes and returns afterwards. A seasonal control already in use
takes priority over starting a parade.

## Artwork and destinations

Telly and Facet use the approved detailed **Telly and Facet Sticker Duo.png**,
Library file `libfile_71921a5f1ae8819181b5bd2ed0efbd07`. The 1536 × 1024 PNG is
copied byte-for-byte to `assets/parade/telly-facet-approved.png`; each character
is cropped only at display time. The earlier incorrect variants were removed.
Telly retains the antennae, gold smiling face, taco sticker, pale hoodie,
microphone and blue shoes. Facet retains the faceted head, gold glasses, dark
headphones, purple hoodie, yellow book and purple shoes. No redraw was needed.

Hitch uses the approved [Moots PNG](https://github.com/schwegler/bsky-mutual-blocks/blob/0a3bcaac5f5189ab43669739293801a98a103737/public/assets/brand/hitch.png).
All three rigs use clipped original pixels with hip and knee rotations. Hitch's
raised arm moves slightly at the shoulder. Faces, bodies and props stay rigid;
there is no whole-body warp. This is a cutout walk from approved front/three-quarter
art. Small joint changes and foot sliding can remain visible at enlarged sizes;
there are no independent hidden-heel drawings or fully drawn walk frames.

| Character | App           | Destination                 |
| --------- | ------------- | --------------------------- |
| Telly     | taco ’bout it | <https://tacobout.online/>  |
| Facet     | Trove         | <https://trove.schweg.xyz/> |
| Hitch     | Moots         | <https://moots.schweg.xyz/> |

The labels use the actual blog header taco mark, Trove header app icon and
Moots header two-circle geometry in its brand violet. Public destinations and
logos were checked on 2026-10-19. Assets are local and use the existing strict
CSP. `assets/parade/provenance.json` records the source hashes. All rig images
must decode before the moving link appears; failed artwork stays hidden.

## Review and validation

- [Approved reference versus corrected rig](qa/mascot-parade/reference-comparison.png)
- [Full sequential mobile passage, original timing](qa/mascot-parade/motion.gif)
- [Desktop](qa/mascot-parade/desktop.png), [mobile](qa/mascot-parade/mobile.png),
  [tablet](qa/mascot-parade/tablet.png), [reduced motion](qa/mascot-parade/reduced-motion.png)

`npm run build` checks formatting, JavaScript, all 12 routes, and Node tests.
The browser suite covers the blocked-load timer boundary, at most one visible
character throughout each passage at five viewport sizes, completion, a long
hover pause, keyboard focus, actual new-tab destinations, dismissal, stored and
cross-tab opt-out, storage denial, reduced motion, touch, page controls and
seasonal coexistence. The parade and Appearance checks also run in WebKit.

Isolated headless browser processes avoid interfering with other Mac tasks.
Physical iPhone/iPad touch remains a manual follow-up. The prior native 200%
zoom checks covered 720 × 450 and 410 × 590 CSS viewports; their old four-character
screenshots were removed to avoid presenting stale artwork as current evidence.
