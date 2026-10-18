import { q, qa, setPressed } from "./dom.js";
const menu = q(".menu");
const nav = q("#nav");
function closeMenu(returnFocus = false) {
  nav.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
  menu.querySelector("span").textContent = "+";
  if (returnFocus) menu.focus();
}
if (menu && nav) {
  menu.hidden = false;
  document.documentElement.classList.add("js");
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
    menu.querySelector("span").textContent = open ? "−" : "+";
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open"))
      closeMenu(true);
  });
  matchMedia("(min-width: 761px)").addEventListener("change", () =>
    closeMenu(),
  );
  qa("#nav a").forEach((link) => {
    const path = (location.pathname.split("/").pop() || "index.html").replace(
      /\.html$/,
      "",
    );
    if (
      link
        .getAttribute("href")
        .split("#")[0]
        .replace(/\.html$/, "") === path &&
      !link.hash
    )
      link.setAttribute("aria-current", "page");
    link.addEventListener("click", () => closeMenu());
  });
}
qa("[data-year]").forEach(
  (node) => (node.textContent = new Date().getFullYear()),
);
q("#print")?.addEventListener("click", () => window.print());
qa("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    setPressed("[data-filter]", button);
    let count = 0;
    qa(".project-row").forEach((row) => {
      const visible =
        button.dataset.filter === "all" ||
        row.dataset.category === button.dataset.filter;
      row.hidden = !visible;
      if (visible) count++;
    });
    q(".filter-status").textContent = `${count} projects shown`;
  }),
);

const experimentStatus = q("#experiment-status");
if (experimentStatus) {
  const showExperimentFailure = () => {
    experimentStatus.hidden = false;
    experimentStatus.dataset.state = "error";
    experimentStatus.textContent =
      "The interactive script could not load or initialize. Reload this page to try again. The reference notes and static examples remain available below.";
  };
  q("script[data-experiment]")?.addEventListener(
    "error",
    showExperimentFailure,
  );
  window.addEventListener("error", (event) => {
    if (event.filename?.includes("/assets/js/")) showExperimentFailure();
  });
}
