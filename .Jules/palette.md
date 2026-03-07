## 2024-03-20 - Interactive Cards as Buttons
**Learning:** Interactive cards in this app (like those in gay_bar_closures.html) are implemented as <div> elements with onclick handlers, which breaks keyboard navigation and screen reader support.
**Action:** When implementing interactive cards, use <button type="button"> instead of <div>. To maintain block-level visual layout within Tailwind, apply classes such as text-left and w-full.
