
## 2026-02-28 - [Navigation Keyboard Accessibility]
**Learning:** Adding `:focus-within` on dropdown containers allows smooth tab-through for nested menus without relying solely on JS. Furthermore, setting `aria-expanded` attributes correctly with native focusin/focusout elements requires checking `event.relatedTarget` carefully to ensure focus didn't just move to a child of the container.
**Action:** Use `:focus-within` to trigger visual display and combine it with a `focusout` handler that uses `setTimeout` to inspect `document.activeElement` for robust keyboard accessible menus in vanilla JS.
