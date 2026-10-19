/* Apply the device/default choice before stylesheet paint; seasons stay separate. */
(() => {
  const key = "schweg-color-mode:v1";
  const root = document.documentElement;
  const system = matchMedia("(prefers-color-scheme: dark)");
  const read = () => {
    try {
      const saved = localStorage.getItem(key);
      return ["light", "dark"].includes(saved) ? saved : "system";
    } catch {
      return "system";
    }
  };
  let mode = read();
  const buttons = [];
  const syncBrand = () => {
    const seasonal = root.dataset.season === "halloween";
    const dark = seasonal || root.dataset.theme === "dark";
    document
      .querySelectorAll('img[src*="schweg-signature-"]')
      .forEach((image) => {
        image.setAttribute(
          "src",
          image
            .getAttribute("src")
            .replace(
              /schweg-signature-(?:ink|light)\.png/,
              `schweg-signature-${dark ? "light" : "ink"}.png`,
            ),
        );
      });
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        seasonal ? "#18121d" : dark ? "#19171f" : "#f7f7f2",
      );
  };
  const apply = () => {
    root.dataset.theme =
      mode === "system" ? (system.matches ? "dark" : "light") : mode;
    root.dataset.colorMode = mode;
    buttons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.colorMode === mode),
      ),
    );
    syncBrand();
  };
  apply();
  system.addEventListener("change", () => {
    if (mode === "system") apply();
  });
  addEventListener("storage", (event) => {
    if (event.key === key || event.key === null) {
      mode = read();
      apply();
    }
  });
  addEventListener("schweg:seasonal-change", syncBrand);
  document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    if (!header) return;
    const controls = document.createElement("div");
    controls.className = "seasonal-controls";
    controls.dataset.appearanceControls = "";
    const disclosure = document.createElement("button");
    disclosure.type = "button";
    disclosure.className = "seasonal-appearance-toggle";
    disclosure.textContent = "Appearance";
    disclosure.setAttribute("aria-expanded", "false");
    disclosure.setAttribute("aria-controls", "seasonal-appearance-panel");
    const panel = document.createElement("div");
    panel.className = "seasonal-appearance-panel";
    panel.id = "seasonal-appearance-panel";
    panel.hidden = true;
    panel.setAttribute("role", "group");
    panel.setAttribute("aria-label", "Appearance settings");
    const group = document.createElement("div");
    group.className = "color-mode-options";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Color mode");
    for (const value of ["system", "light", "dark"]) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = value[0].toUpperCase() + value.slice(1);
      button.dataset.colorMode = value;
      button.addEventListener("click", () => {
        mode = value;
        try {
          value === "system"
            ? localStorage.removeItem(key)
            : localStorage.setItem(key, value);
        } catch {
          /* The in-page selection remains usable without storage. */
        }
        apply();
      });
      buttons.push(button);
      group.append(button);
    }
    panel.append(group);
    controls.append(disclosure, panel);
    header.append(controls);
    const close = () => {
      panel.hidden = true;
      disclosure.setAttribute("aria-expanded", "false");
    };
    const place = () =>
      controls.style.setProperty(
        "--appearance-top",
        `${Math.max(8, Math.min(disclosure.getBoundingClientRect().bottom + 8, innerHeight - 260))}px`,
      );
    disclosure.addEventListener("click", () => {
      place();
      panel.hidden = !panel.hidden;
      disclosure.setAttribute("aria-expanded", String(!panel.hidden));
    });
    document.addEventListener("click", (event) => {
      if (!controls.contains(event.target)) close();
    });
    document.addEventListener("focusin", (event) => {
      if (!controls.contains(event.target)) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && controls.contains(document.activeElement)) {
        close();
        disclosure.focus();
        event.preventDefault();
      }
    });
    addEventListener("resize", place, { passive: true });
    window.SchwegAppearance = { controls, panel, disclosure, close };
    apply();
  });
})();
