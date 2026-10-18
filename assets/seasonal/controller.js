/* Seasonal controller v1: explicit opt-in; no calendar activation or remote services. */
(() => {
  const script = document.currentScript;
  const base = new URL(".", script.src);
  const profile = {
    id: "andrew",
    title: "A little practical magic.",
    detail:
      "A seasonal costume for the same curious mind. Everything else is business as usual.",
  };
  const key = "seasonal-theme:v1";
  const root = document.documentElement;
  const read = () => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const save = (value) => {
    try {
      value === null
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, value);
    } catch {
      /* Session-only if storage is unavailable. */
    }
  };
  const mount = () => {
    if (document.querySelector("[data-seasonal-controls]")) return;
    const main = document.querySelector("main");
    if (!main) return;
    const scene = document.createElement("div");
    scene.className = "seasonal-scene seasonal-" + profile.id;
    scene.hidden = true;
    const art = document.createElement("img");
    art.alt = "";
    art.width = 112;
    art.height = 140;
    art.decoding = "async";
    const copy = document.createElement("div");
    const label = document.createElement("p");
    label.className = "seasonal-kicker";
    label.textContent = "HALLOWEEN / 2026";
    const title = document.createElement("p");
    title.className = "seasonal-title";
    title.textContent = profile.title;
    const detail = document.createElement("p");
    detail.className = "seasonal-detail";
    detail.textContent = profile.detail;
    copy.append(label, title, detail);
    scene.append(copy, art);
    main.prepend(scene);
    // Existing character placements wear the same costume while enabled.
    const portraits = [
      ...document.querySelectorAll(
        'img[src*="/telly_"], img[src*="/duo_left_telly_host_transparent"], img[src*="/andrew-pencil-mascot"]',
      ),
    ].map((image) => ({
      image,
      original: Object.fromEntries(
        ["src", "srcset", "sizes", "alt"].map((attribute) => [
          attribute,
          image.getAttribute(attribute),
        ]),
      ),
    }));
    const controls = document.createElement("section");
    controls.className = "seasonal-controls";
    controls.dataset.seasonalControls = "";
    controls.setAttribute("aria-label", "Seasonal appearance");
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.textContent = "Halloween appearance";
    toggle.setAttribute("aria-pressed", "false");
    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "Reset appearance";
    const status = document.createElement("span");
    status.className = "seasonal-status";
    status.setAttribute("role", "status");
    const apply = (value) => {
      const active = value === "halloween";
      if (active && !art.hasAttribute("src"))
        art.src = new URL("mascot.png", base).href;
      if (active) root.dataset.season = "halloween";
      else delete root.dataset.season;
      scene.hidden = !active;
      portraits.forEach(({ image, original }) => {
        if (active) {
          image.src = new URL("mascot.png", base).href;
          image.removeAttribute("srcset");
          image.removeAttribute("sizes");
          image.alt = "";
        } else {
          Object.entries(original).forEach(([attribute, value]) => {
            if (value === null) image.removeAttribute(attribute);
            else image.setAttribute(attribute, value);
          });
        }
      });

      toggle.setAttribute("aria-pressed", String(active));
      status.textContent = active ? "Halloween on" : "Seasonal appearance off";
    };
    toggle.addEventListener("click", () => {
      const value = root.dataset.season === "halloween" ? "off" : "halloween";
      save(value);
      apply(value);
    });
    reset.addEventListener("click", () => {
      save(null);
      apply(null);
    });
    window.addEventListener("storage", (event) => {
      if (event.key === key || event.key === null) apply(read());
    });
    controls.append(toggle, reset, status);
    const footer = document.querySelector("footer");
    if (footer) footer.before(controls);
    else main.after(controls);
    apply(read());
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
