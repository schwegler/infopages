## 2026-02-23 - [Keyboard Accessible CSS Dropdowns]
**Learning:** For static sites without complex state management, CSS `:focus-within` combined with `:hover` provides robust keyboard accessibility for dropdown menus, avoiding complex JS event listeners.
**Action:** Use `:focus-within` alongside `:hover` for all pure-CSS interactive elements to ensure keyboard users can access content.
## 2024-03-05 - Managing toggleable element groups & expanding regions
**Learning:** For sets of buttons acting as mutually exclusive filters (like map views), grouping them with `role="group"` and tracking active state with `aria-pressed` (toggled dynamically via JS) is crucial for screen readers. Similarly, hamburger/mobile menu buttons require dynamic `aria-expanded` attributes that stay perfectly in sync with the menu's visual visibility state to ensure users understand the menu's current state.
**Action:** When adding or maintaining groups of filter buttons or mobile menus, always ensure they are wrapped in an appropriate `role` container, and implement JavaScript to toggle `aria-pressed` or `aria-expanded` attributes synchronously with visual class changes.
## 2024-03-20 - Interactive Cards as Buttons
**Learning:** Interactive cards in this app (like those in gay_bar_closures.html) are implemented as <div> elements with onclick handlers, which breaks keyboard navigation and screen reader support.
**Action:** When implementing interactive cards, use <button type="button"> instead of <div>. To maintain block-level visual layout within Tailwind, apply classes such as text-left and w-full.
## 2026-04-09 - [Keyboard Accessible CSS Flip Cards]
**Learning:** CSS-only reveal components (like flip cards using `:hover` to show a back face) must have `tabindex="0"` on their containers if they lack inherently focusable elements, to allow `:focus-within` to trigger during keyboard navigation. Additionally, explicitly defining a `:focus-visible` outline ensures keyboard users have clear visual feedback when interacting with these components.
**Action:** When implementing or fixing interactive CSS-only cards, always ensure they are focusable (using `tabindex="0"` if necessary), pair `:hover` with `:focus-within` to trigger state changes, and implement a distinct `:focus-visible` style.
