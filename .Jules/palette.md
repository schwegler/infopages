## 2026-02-23 - [Keyboard Accessible CSS Dropdowns]
**Learning:** For static sites without complex state management, CSS `:focus-within` combined with `:hover` provides robust keyboard accessibility for dropdown menus, avoiding complex JS event listeners.
**Action:** Use `:focus-within` alongside `:hover` for all pure-CSS interactive elements to ensure keyboard users can access content.
## 2024-03-05 - Managing toggleable element groups & expanding regions
**Learning:** For sets of buttons acting as mutually exclusive filters (like map views), grouping them with `role="group"` and tracking active state with `aria-pressed` (toggled dynamically via JS) is crucial for screen readers. Similarly, hamburger/mobile menu buttons require dynamic `aria-expanded` attributes that stay perfectly in sync with the menu's visual visibility state to ensure users understand the menu's current state.
**Action:** When adding or maintaining groups of filter buttons or mobile menus, always ensure they are wrapped in an appropriate `role` container, and implement JavaScript to toggle `aria-pressed` or `aria-expanded` attributes synchronously with visual class changes.
## 2024-03-20 - Interactive Cards as Buttons
**Learning:** Interactive cards in this app (like those in gay_bar_closures.html) are implemented as <div> elements with onclick handlers, which breaks keyboard navigation and screen reader support.
**Action:** When implementing interactive cards, use <button type="button"> instead of <div>. To maintain block-level visual layout within Tailwind, apply classes such as text-left and w-full.
## 2026-03-05 - Managing focus for dismissible floating widgets
**Learning:** When implementing dismissible floating widgets or modals (like the Giles AI helper), always return focus to the triggering element upon closure to maintain keyboard accessibility context.
**Action:** When adding or maintaining dismissible UI components, use JavaScript to focus the invoking element (e.g. `triggerBtn.focus()`) within the close handler.
## 2026-04-21 - [Aria-Current for Navigation]
**Learning:** Highlighting the active page purely via CSS (e.g., bolding text or changing color) is inaccessible to screen readers. To provide semantic meaning about the active page in navigation elements, the `aria-current="page"` attribute must be programmatically applied to the active link.
**Action:** When building or maintaining navigation components, always ensure the active link receives the `aria-current="page"` attribute alongside any visual styling changes.
## 2026-04-22 - Keyboard Focus Parity on Animated Cards
**Learning:** Custom interactive elements (like the "wired cards" in `index.html`) that rely heavily on `:hover` pseudo-classes for visual feedback (scaling, glows, borders) often completely drop these styles for keyboard navigation, making them inaccessible to keyboard users who navigate via `Tab`.
**Action:** When using Tailwind's `hover:` or `group-hover:` utilities, or custom CSS `:hover` states on interactive elements acting as cards/buttons, always pair them explicitly with `focus-visible:` and `group-focus-visible:` classes (and `:focus-visible` in CSS). To prevent double-outlines, combine this with `outline-none` when the custom focus state is highly visible.
