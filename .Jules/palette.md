## 2024-04-15 - Universal Nav Accessibility
**Learning:** Highlighting the active page purely via CSS (e.g., `fontWeight: '700'`) is inaccessible to screen readers, and mobile menu toggles require dynamic `aria-expanded` management to communicate state changes.
**Action:** When creating navigation components, always programmatically set `aria-current="page"` on the active link and ensure toggle buttons dynamically update `aria-expanded`.
