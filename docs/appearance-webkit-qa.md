# Appearance browser QA

The Appearance change is checked across all 12 routes in Chromium and the
established WebKit QA runtime, including 320/390px phones, an 820px tablet,
keyboard selection/Escape, OS changes, persistence, blocked storage, cross-tab
updates, print, and seasonal expiry. Explicit `tabindex="0"` on menu buttons
preserves keyboard access under WebKit's native focus policy.

The additional CI WebKit runtime is pinned through Playwright 1.62.1, matching
the existing blog's WebKit QA baseline. The main Python/Chromium dependencies
remain unchanged. The optional `INFO_PAGES_BROWSER_EXECUTABLE` environment
variable lets local QA select an already-installed engine.

## WebKit 27.2 native select regression

Playwright 1.64's WebKit 27.2 reports a `style-src-attr` CSP violation for a bare
native `<select><option>One</option><option>Two</option></select>` served under
`default-src 'self'; script-src 'self'; style-src 'self'`. The isolated document
contains no application scripts, styles, or style attributes. The event targets
the select, with an empty source file. Explicit size, multiple, disabled, and
external appearance styling do not avoid the report.

The same report occurs on the existing SQL migration and Hollyoaks dropdowns in
both light and dark modes; their selection behavior and all Appearance assertions
pass. The older installed WebKit does not emit it. This is recorded as a browser
regression, not hidden by the CSP guard. The guard still fails on any violation,
and `_headers` is unchanged. No replacement dropdown or security-policy workaround
is included. Current physical iPad/iPhone testing remains outstanding.
