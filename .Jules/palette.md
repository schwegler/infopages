# Palette's Journal

## UX/Accessibility Insights

## 2024-05-24 - Interactive Card Accessibility and Semantic HTML
**Learning:** Using `div` elements for interactive cards (like those revealing content on click) breaks keyboard navigation and hides functionality from screen reader users. Additionally, creating toggleable button groups without using `aria-pressed` prevents screen readers from understanding which option is currently active.
**Action:** Always use `<button type="button">` for custom interactive card components to ensure proper focus management and semantic meaning, combining it with Tailwind classes like `text-left w-full` to maintain block-level rendering. Use `aria-pressed` to explicitly manage the state of filter or toggle buttons, and use `aria-hidden="true"` to hide decorative icons that do not add meaning to the text label.
