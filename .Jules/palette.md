## 2026-02-23 - [Keyboard Accessible CSS Dropdowns]
**Learning:** For static sites without complex state management, CSS `:focus-within` combined with `:hover` provides robust keyboard accessibility for dropdown menus, avoiding complex JS event listeners.
**Action:** Use `:focus-within` alongside `:hover` for all pure-CSS interactive elements to ensure keyboard users can access content.
## 2024-03-05 - Managing toggleable element groups & expanding regions
**Learning:** For sets of buttons acting as mutually exclusive filters (like map views), grouping them with `role="group"` and tracking active state with `aria-pressed` (toggled dynamically via JS) is crucial for screen readers. Similarly, hamburger/mobile menu buttons require dynamic `aria-expanded` attributes that stay perfectly in sync with the menu's visual visibility state to ensure users understand the menu's current state.
**Action:** When adding or maintaining groups of filter buttons or mobile menus, always ensure they are wrapped in an appropriate `role` container, and implement JavaScript to toggle `aria-pressed` or `aria-expanded` attributes synchronously with visual class changes.
## 2024-03-20 - Interactive Cards as Buttons
**Learning:** Interactive cards in this app (like those in gay_bar_closures.html) are implemented as <div> elements with onclick handlers, which breaks keyboard navigation and screen reader support.
**Action:** When implementing interactive cards, use <button type="button"> instead of <div>. To maintain block-level visual layout within Tailwind, apply classes such as text-left and w-full.
## 2024-04-19 - Dismissible floating widgets focus management
**Learning:** For dismissible floating widgets or modals (like the Giles AI helper), always returning focus to the triggering element upon closure is crucial to maintain keyboard accessibility context. Also, toggle buttons need dynamic `aria-expanded` attributes to communicate the widget's state to screen readers.
**Action:** When adding or fixing floating/modal UI components, ensure that closing the component explicitly calls `.focus()` on the trigger button, and update the trigger's `aria-expanded` state dynamically.
