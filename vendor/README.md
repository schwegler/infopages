# Profile XML parser

`profile-xml.mjs` is the reproducible, browser-platform ESM bundle of only the XML parser and validator exports used by the Pages Function. It contains code only, no feed data. Regenerate with `npm run vendor:profile`; `npm run check` verifies it is current. Included dependency licenses are in `LICENSE-profile-xml.txt`.

The existing Cloudflare project has no build command and therefore cannot resolve a bare npm dependency during Functions compilation. The Function imports this checked-in relative module, so its deployment requires no package install or hosting-account configuration change. The parser is not loaded by the browser.
