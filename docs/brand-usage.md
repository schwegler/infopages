# schweg.xyz · canonical shared wordmark v1

Use these exact path-based SVGs; do not redraw or substitute a script font. No webfont is required.

- `schweg-xyz-ink.svg`: #242330 for light surfaces.
- `schweg-xyz-light.svg`: #f7f7f2 for dark surfaces.
- `schweg-xyz-violet.svg`: #514287 for very light surfaces.
- `wordmark-preview.png`: review preview, not the preferred production file.

Wordmark spelling: **schweg.xyz**. It is the personal creator umbrella. tacobout remains the shared/friends/guest brand. The character avatar is separate and must remain the detailed transparent PNG.

Source: Dancing Script, weight 650, shaped with kerning/ligatures then converted to static paths. SIL Open Font License 1.1 included in `OFL.txt`; copyright 2016 The Dancing Script Project Authors. Glyph outlines may be used in a wordmark. No font file should be loaded on production pages solely for the logo.

Suggested header width: 156–180px. Footer width: 112–132px. Minimum width 104px; maintain aspect ratio, no stretching, minimum clear space 8px on each side. Use ink on light and light on dark, not low-contrast opacity effects. Provide visible keyboard focus on the enclosing link.

Canonical shared footer:

```html
<a
  class="creator-credit"
  href="https://schweg.xyz/"
  aria-label="A schweg.xyz project"
>
  <span>a</span>
  <img
    src="/assets/brand/schweg-xyz-ink.svg"
    alt="schweg.xyz"
    width="132"
    height="42"
    loading="lazy"
    decoding="async"
  />
  <span>project</span>
</a>
```

Use natural casing “a [logo] project”. Keep the group together with `display:inline-flex;align-items:center;gap:8px;flex-wrap:nowrap`, and let surrounding footer columns stack on small screens. The destination is fixed to https://schweg.xyz/. Use a dark variant based on the footer surface, not OS preference when the site theme differs.

The source font and reproducible outline conversion are in `source/`; retain license/provenance in downstream repos.

## Andrew mascot

The approved transparent PNG is copied unchanged from Library `libfile_b96dc71179c881919e7e19df1e4a8254` (Purple-Haired Pencil Mascot.png), supplied by the blog worker. File: `assets/brand/andrew-pencil-mascot.png`, 1145 × 1374. Two native disclosure Easter eggs on Work and Notes render it at 96 CSS pixels. It is absent from the résumé and print layout. No replacement artwork or SVG conversion.
