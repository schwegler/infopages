# Personal profile review

The standalone `/me` digital business card uses **Schwegler** only. The résumé and other pages retain their existing content and UI. The card adds no framework, remote fonts or analytics. The later scroll-through panel uses one narrowly scoped public Pages Function; see [the current public-source contract](profile-public-updates.md). A small local script progressively enhances the gaming text with clipboard buttons; all details remain readable and selectable without JavaScript. The small blue punctuation mark has a one-time entrance; reduced motion disables it.

## Routes and release checks

- Canonical: `https://schweg.xyz/me`, served by Cloudflare Pages from `me.html`.
- `/about`, `/about/`, and `/about.html`: explicit 301 to `/me`; no existing files collide.
- Existing Notes redirects and security headers are preserved.
- The route inventory and sitemap include the new page. The Bluesky validator exception remains unchanged and permits only the verified exact destination on `me.html`.
- Public mail destination and visible address use numeric character references. No email in metadata, ARIA, or data attributes.
- GitHub/LinkedIn, six verified personal social accounts, Spotify, Discord, the Steam profile, the two featured destinations, résumé, projects, and the signature home link are native anchors. Some social providers block automated public fetches; identity evidence is separate from live availability.
- Production routing must be checked after an authorized release. Local route tests emulate Pages behavior; they do not prove a deployment. No merge, deployment, account, DNS, or security changes are part of this change.

## Visual review

Image Gen produced complete desktop/mobile concepts before implementation, then a revised full-screen concept and final surname-only concept. Final local concept: `/workspace/generated_images/exec-048e9ec5-c2e9-46a0-a3b9-8abbcf5ab8b3.png`. Generated concept artwork is not shipped. The supplied signature PNG remains authoritative: the concept's invented signature is intentionally replaced with the exact approved asset.

Browser tools were unavailable in this environment, so Playwright Chromium was used over local HTTP with the repository CSP. No certificate warnings were bypassed. Both final concept and latest desktop/mobile render were inspected with `view_image`. Captures: desktop 1440×1000, mobile 390×844, small mobile 360×740, dark desktop 1440×1000, short landscape 844×390. The normal desktop and phone fill their viewport; short screens can scroll without clipping.

| Comparison          | Review / implementation decision                                                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Typography          | Bold title-case system sans name, italic Georgia supporting copy, quiet sans navigation; surname only. No remote font dependency.                                                                                                    |
| Hierarchy           | Name and statement lead; two featured rows precede the personal social grid and secondary links.                                                                                                                                     |
| Palette             | Paper `#f7f7f2`, ink `#191919`, cobalt `#2346ca`; dark mode has independently legible light text and links.                                                                                                                          |
| Spacing             | Open two-column desktop, single-column mobile, fine rules; all link targets are at least 44px tall.                                                                                                                                  |
| Branding            | Exact 1945×576 approved PNG at natural aspect ratio; 132px display width, light variant on dark backgrounds. No mascot or generated avatar.                                                                                          |
| Copy                | No full name, descriptions, experience, metrics, testimonials, or invented account links. Final concept contact label is supplemented with the verified encoded public address; social order follows row-major native reading order. |
| Responsive / motion | Dynamic viewport and safe-area sizing; scrolling retained for short landscape and zoom. Reduced motion removes entrance animation.                                                                                                   |

Intentional concept deviations: exact approved signature replaces generated artwork; actual public email replaces the concept's generic contact treatment; code-native system typography and accessible 44px targets take priority over raster mockup letterforms and tiny secondary controls. These are documented rather than claiming pixel-identical concept fidelity. The page was reviewed against the final concept for hierarchy, palette, typography character, spacing and asset treatment.

## Screenshots

![Desktop](screenshots/me/desktop.png)

![Phone](screenshots/me/mobile.png)

![Dark appearance](screenshots/me/dark.png)

## Gaming, music and Discord follow-up

PR #150 was already merged when these additions were requested. The follow-up starts from merge commit `6bc96078f77ad25abed2d87e5fe3e67a729b477b` on a fresh branch.

- Switch friend code: `SW-8401-9041-4251`; Xbox gamertag: `ajschwegler`. Both were explicitly supplied by the user. Separate accessible Copy buttons report success in a live status region. Clipboard failure selects the corresponding text and explains the manual-copy fallback. No Xbox deep link is invented.
- Steam uses the exact supplied numeric profile URL. The public page was inaccessible to the browsing tool, so the visible label is **Steam profile**, with no guessed display name.
- Spotify and Discord use the exact supplied public profile URLs and join the existing compact social navigation.
- This is a small extension within the existing visual system, not a new concept or generated artwork. The gaming-only stage used a left contact/gaming area and side-by-side phone feature links. The subsequent approved mobile refinement below restores stacked projects and places gaming last.
- Latest renders inspected with `view_image`: desktop 1440×1000, phone 390×844, narrow 320×568; dark and 360×740 captures also checked. Both 390×844 and 360×740 fit their viewport. Narrow 320×568 and short 844×390 scroll gracefully with no horizontal overflow. Existing signature artwork, typography character, palette, fine rules and open spacing are preserved.
- All 13 focused browser checks pass, including keyboard copying, exact clipboard values for both codes, clipboard denial fallback, no-JavaScript details, routing and at least 44px link/button targets. Local axe WCAG A/AA scans pass at six viewport/appearance combinations. Native browser zoom at 200% and 400% preserves heading/home reachability with no horizontal overflow.

Screenshots above show this latest implementation. The historical Image Gen concept does not contain the subsequently requested gaming/music/Discord content. These additions are intentional user-directed changes to the earlier concept, not a claim of pixel-identical fidelity.

## Current approved refinement

The latest screenshots above show stacked project links, eight icon-and-label social links directly below Trove, secondary-link and gaming disclosures, and gaming last in DOM order. The first 390×844 panel fits; smaller/shorter views scroll to preserve readability. The later Lately panel and updated verification/hosting gates are documented in [profile-public-updates.md](profile-public-updates.md). Earlier viewport-fit and layout descriptions in this note describe their historical stage, not the current smaller-screen composition.
