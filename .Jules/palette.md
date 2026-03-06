
## 2024-10-25 - Accessible Interactive Cards in Tailwind
**Learning:** Using `<div>` elements with `onclick` handlers for interactive cards creates accessibility barriers, as they are not natively focusable or announced correctly by screen readers.
**Action:** Always implement interactive block-level elements as `<button type="button">`. Use Tailwind classes like `text-left w-full` to maintain their block visual layout, and add focus styles (`focus:outline-none focus:ring-2`) to ensure keyboard users have clear focus indicators.
