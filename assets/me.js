// Native text remains readable and selectable without clipboard access or JS.
if (navigator.clipboard?.writeText) {
  const status = document.querySelector(".copy-status");
  document.querySelectorAll("[data-copy-code]").forEach((button) => {
    button.hidden = false;
    button.addEventListener("click", async () => {
      const code = document.getElementById(button.dataset.copyCode);
      const label = button.dataset.copyLabel;
      try {
        await navigator.clipboard.writeText(code.textContent.trim());
        status.textContent = `${label} copied.`;
      } catch {
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent = `Select and copy the highlighted ${label}.`;
      }
    });
  });
}
