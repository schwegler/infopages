# Public email obfuscation

This deters basic raw-source scrapers; it does not prevent spam or hide the address from HTML-aware crawlers, browser automation, source-repository readers, or visitors. Previously published copies may remain indexed.

Public HTML uses numeric character references for both mail destinations and visible addresses. Browsers decode these natively: keyboard activation, screen readers, copying the displayed address or link, no-JavaScript use, and printing retain normal behavior. No decoding script, event handler, or dependency is needed. Keep this encoding when editing contact links. Do not add the address to JSON-LD, meta tags, data attributes, or accessible labels. The Person JSON-LD email field is intentionally omitted.

No account, DNS, routing, or authentication settings change. Run `python3 scripts/check_public_email.py` for the source regression check. Manual release check: Tab to Contact, activate it, copy its destination; where address text is visible, copy it and inspect print preview, with JavaScript disabled as well as enabled.
