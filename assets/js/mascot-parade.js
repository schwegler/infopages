/* Original PNG pixels, articulated with clipped layers rather than body warps. */
const asset = (name) => new URL(`../parade/${name}`, import.meta.url).href;
const brand = (name) => new URL(`../brand/${name}`, import.meta.url).href;
export const START_DELAY = 2000;
export const PREFERENCE_KEY = "schweg-mascot-parade:v1";
export const mascots = [
  {
    id: "telly",
    name: "Telly",
    app: "taco ’bout it",
    url: "https://tacobout.online/",
    image: asset("telly.png"),
    logo: asset("tacobout-logo.png"),
    width: 508,
    height: 599,
    body: "polygon(0 0,100% 0,100% 84%,0 84%)",
    legs: [
      {
        hip: "38% 83%",
        knee: "38% 88%",
        upper: "polygon(33% 83%,44% 83%,44% 89%,33% 89%)",
        lower: "polygon(29% 88%,47% 88%,50% 100%,29% 100%)",
      },
      {
        hip: "55% 83%",
        knee: "55% 87%",
        upper: "polygon(50% 83%,61% 83%,61% 88%,50% 88%)",
        lower: "polygon(49% 87%,62% 87%,72% 100%,48% 100%)",
      },
    ],
  },
  {
    id: "facet",
    name: "Facet",
    app: "Trove",
    url: "https://trove.schweg.xyz/",
    image: asset("facet.png"),
    logo: asset("trove-logo.png"),
    width: 369,
    height: 641,
    body: "polygon(0 0,100% 0,100% 84%,0 84%)",
    legs: [
      {
        hip: "36% 83%",
        knee: "36% 89%",
        upper: "polygon(31% 83%,43% 83%,43% 90%,31% 90%)",
        lower: "polygon(14% 89%,45% 89%,47% 100%,14% 100%)",
      },
      {
        hip: "60% 83%",
        knee: "62% 89%",
        upper: "polygon(55% 83%,67% 83%,68% 90%,55% 90%)",
        lower: "polygon(52% 89%,70% 89%,78% 100%,52% 100%)",
      },
    ],
  },
  {
    id: "hitch",
    name: "Hitch",
    app: "Moots",
    url: "https://moots.schweg.xyz/",
    image: asset("hitch.png"),
    logo: asset("moots-logo.svg"),
    width: 448,
    height: 503,
    body: "polygon(0 0,100% 0,100% 47%,73% 47%,68% 59%,78% 67%,100% 67%,100% 83%,66% 85%,44% 85%,41% 91%,0 91%)",
    arm: {
      origin: "71% 55%",
      clip: "polygon(73% 47%,100% 47%,100% 67%,78% 67%,68% 59%)",
    },
    legs: [
      {
        hip: "47% 82%",
        knee: "46% 88%",
        upper: "polygon(43% 81%,54% 81%,52% 89%,41% 89%)",
        lower: "polygon(39% 87%,51% 87%,51% 100%,26% 100%,28% 94%)",
      },
      {
        hip: "63% 82%",
        knee: "65% 88%",
        upper: "polygon(58% 81%,69% 81%,71% 89%,60% 89%)",
        lower: "polygon(59% 87%,71% 87%,87% 100%,56% 100%)",
      },
    ],
  },
  {
    id: "andrew",
    name: "Andrew",
    app: "schweg.xyz",
    url: "https://schweg.xyz/",
    image: brand("andrew-pencil-mascot.png"),
    logo: brand("schweg-signature-ink.png"),
    width: 1145,
    height: 1374,
    body: "polygon(0 0,100% 0,100% 67%,0 67%)",
    legs: [
      {
        hip: "42% 66%",
        knee: "38% 81%",
        upper: "polygon(36% 65%,52% 65%,50% 73%,46% 83%,31% 83%)",
        lower: "polygon(30% 80%,46% 80%,48% 100%,20% 100%)",
      },
      {
        hip: "56% 66%",
        knee: "61% 81%",
        upper: "polygon(51% 65%,63% 65%,69% 83%,54% 83%,49% 73%)",
        lower: "polygon(54% 80%,69% 80%,85% 100%,54% 100%)",
      },
    ],
  },
];

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};

function image(src, width, height) {
  const node = el("img");
  node.src = src;
  node.alt = "";
  node.width = width;
  node.height = height;
  node.draggable = false;
  node.addEventListener("error", () => {
    node.hidden = true;
  });
  return node;
}

export function createRig(mascot) {
  const rig = el("span", `parade-rig parade-rig--${mascot.id}`);
  rig.setAttribute("aria-hidden", "true");
  rig.style.aspectRatio = `${mascot.width} / ${mascot.height}`;
  const part = (className, clip) => {
    const node = el("span", `parade-part ${className}`);
    const art = image(mascot.image, mascot.width, mascot.height);
    art.style.clipPath = clip;
    node.append(art);
    return node;
  };
  mascot.legs.forEach((leg, i) => {
    const upper = part(`parade-leg parade-leg--${i}`, leg.upper);
    upper.style.transformOrigin = leg.hip;
    const lower = part("parade-shin", leg.lower);
    lower.style.transformOrigin = leg.knee;
    upper.append(lower);
    rig.append(upper);
  });
  rig.append(part("parade-body", mascot.body));
  if (mascot.arm) {
    const arm = part("parade-arm", mascot.arm.clip);
    arm.style.transformOrigin = mascot.arm.origin;
    rig.append(arm);
  }
  return rig;
}

export function mountParade() {
  if (
    !document.querySelector("main") ||
    document.querySelector(".mascot-parade")
  )
    return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = matchMedia("(pointer: coarse)");
  const read = () => {
    try {
      return localStorage.getItem(PREFERENCE_KEY) !== "off";
    } catch {
      return true;
    }
  };
  let enabled = read();
  let started = false,
    dismissed = false,
    timer,
    frame,
    previous;
  let distance = 0;
  let protectedRects = [],
    layoutDirty = true;
  const pauses = new Set();
  const region = el("aside", "mascot-parade");
  region.setAttribute("aria-label", "Meet the apps");
  region.hidden = true;
  const heading = el("p", "parade-heading", "Meet the apps");
  const list = el("div", "parade-cast");
  const close = el("button", "parade-dismiss", "×");
  close.type = "button";
  close.tabIndex = 0;
  close.setAttribute("aria-label", "Dismiss mascot parade");
  close.title = "Dismiss mascot parade";
  const links = mascots.map((mascot) => {
    const link = el("a", "parade-mascot");
    link.dataset.mascot = mascot.id;
    link.href = mascot.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute(
      "aria-label",
      `${mascot.name} — ${mascot.app} (opens in a new tab)`,
    );
    const label = el("span", "parade-label");
    label.append(
      image(mascot.logo, 32, 32),
      el("span", "", mascot.app),
      el("span", "parade-arrow", "↗"),
    );
    link.append(createRig(mascot), label);
    link.dataset.artReady = "false";
    Promise.all(
      [...link.querySelectorAll(".parade-rig img")].map((art) => art.decode()),
    )
      .then(() => {
        link.dataset.artReady = "true";
      })
      .catch(() => {
        link.dataset.artReady = "failed";
      });
    link.inert = true;
    list.append(link);
    return link;
  });
  region.append(heading, list, close);
  document.querySelector("footer")?.before(region);
  if (!region.isConnected) document.body.append(region);

  const setting = el("div", "parade-setting");
  setting.setAttribute("role", "group");
  setting.setAttribute("aria-label", "Mascot parade preference");
  const toggle = el("button", "", "Mascot parade");
  toggle.type = "button";
  toggle.tabIndex = 0;
  toggle.setAttribute("aria-label", "Mascot parade");
  const note = el(
    "p",
    "",
    "One passing visit per page. Turn off to hide mascots on future pages.",
  );
  setting.append(toggle, note);
  window.SchwegAppearance?.panel.append(setting);
  const syncSetting = () =>
    toggle.setAttribute("aria-pressed", String(enabled));
  syncSetting();

  const pause = (reason, value) => {
    value ? pauses.add(reason) : pauses.delete(reason);
    previous = undefined;
    region.dataset.paused = String(pauses.size > 0);
  };
  const stop = () => {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    region.hidden = true;
    delete document.documentElement.dataset.mascotParade;
    links.forEach((link) => {
      link.inert = true;
    });
  };
  const dismiss = () => {
    dismissed = true;
    if (region.contains(document.activeElement)) {
      window.SchwegAppearance?.disclosure.focus({ preventScroll: true });
    }
    stop();
  };
  close.addEventListener("click", dismiss);
  region.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dismiss();
    }
  });
  region.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch") pause("hover", true);
  });
  region.addEventListener("pointerleave", () => pause("hover", false));
  region.addEventListener("focusin", () => pause("focus", true));
  region.addEventListener("focusout", (event) => {
    if (!region.contains(event.relatedTarget)) pause("focus", false);
  });
  // A first touch reveals the app and holds it still; the next activates the link.
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        coarse.matches &&
        link.dataset.selected !== "true" &&
        !reduced.matches
      ) {
        event.preventDefault();
        links.forEach((other) => {
          delete other.dataset.selected;
        });
        link.dataset.selected = "true";
        link.focus({ preventScroll: true });
        pause("touch", true);
      }
    });
  });
  document.addEventListener("pointerdown", (event) => {
    if (!region.contains(event.target)) {
      links.forEach((link) => {
        delete link.dataset.selected;
      });
      pause("touch", false);
      if (region.contains(document.activeElement))
        document.activeElement.blur();
    }
  });
  document.addEventListener("visibilitychange", () =>
    pause("hidden", document.hidden),
  );
  window.addEventListener("pagehide", () => pause("page", true));
  window.addEventListener("pageshow", () => pause("page", false));
  const invalidate = () => {
    layoutDirty = true;
  };
  addEventListener("resize", invalidate, { passive: true });
  addEventListener("scroll", invalidate, { passive: true });
  document.addEventListener("click", invalidate);
  document.addEventListener("toggle", invalidate, true);
  document.addEventListener("focusin", invalidate);

  const layout = () => {
    const width = document.documentElement.clientWidth;
    const style = getComputedStyle(region);
    const safeLeft =
      parseFloat(style.getPropertyValue("--parade-safe-left")) || 0;
    const safeRight =
      parseFloat(style.getPropertyValue("--parade-safe-right")) || 0;
    const size = width <= 600 ? 88 : 116;
    const gap = width <= 600 ? 160 : 198;
    return {
      width,
      size,
      gap,
      safeLeft,
      safeRight,
      speed: width <= 600 ? 42 : 60,
    };
  };
  const tick = (now) => {
    const { width, size, gap, safeLeft, safeRight, speed } = layout();
    const bottom = links[0].getBoundingClientRect().bottom;
    if (layoutDirty) {
      protectedRects = [
        ...document.querySelectorAll(
          'header, nav, button, a, input, select, textarea, summary, dialog[open], [role="dialog"]',
        ),
      ]
        .filter(
          (node) =>
            !region.contains(node) &&
            !node.closest(".seasonal-overlay") &&
            getComputedStyle(node).visibility !== "hidden",
        )
        .map((node) => node.getBoundingClientRect())
        .filter(
          (rect) =>
            rect.width &&
            rect.height &&
            rect.bottom > 0 &&
            rect.top < innerHeight,
        );
      const defaultHeight = width <= 600 ? 78 : 108;
      // A compact lane below low page links keeps every character visible on phones.
      const lowLinks = protectedRects.filter(
        (rect) =>
          rect.bottom > bottom - defaultHeight && rect.bottom < bottom - 52,
      );
      const available = lowLinks.length
        ? bottom - Math.max(...lowLinks.map((rect) => rect.bottom)) - 8
        : defaultHeight;
      const rigHeight = Math.max(44, Math.min(defaultHeight, available));
      region.style.setProperty("--mascot-height", `${rigHeight}px`);
      region.style.setProperty("--mascot-link-height", `${rigHeight + 2}px`);
      region.style.setProperty(
        "--gait-scale",
        String(((rigHeight / 108) * 60) / speed),
      );
      layoutDirty = false;
    }
    const linkHeight = links[0].offsetHeight;
    if (previous !== undefined && !pauses.size)
      distance += ((now - previous) * speed) / 1000;
    previous = now;
    links.forEach((link, i) => {
      let x = distance - size - i * gap;
      if (link === document.activeElement)
        x = Math.max(safeLeft + 8, Math.min(x, width - size - safeRight - 8));
      link.style.setProperty("--parade-x", `${x}px`);
      const obstructs = protectedRects.some(
        (rect) =>
          x < rect.right + 4 &&
          x + size > rect.left - 4 &&
          bottom > rect.top - 4 &&
          bottom - linkHeight < rect.bottom + 4,
      );
      // Only fully visible links enter the keyboard order.
      const ready = link.dataset.artReady === "true";
      const visible =
        ready &&
        x >= safeLeft + 8 &&
        x + size <= width - safeRight - 8 &&
        !obstructs;
      link.inert = !visible;
      link.dataset.visible = String(
        ready && x > -size && x < width && !obstructs,
      );
      const labelWidth = 200;
      const center = Math.max(
        labelWidth / 2 + safeLeft + 8,
        Math.min(x + size / 2, width - labelWidth / 2 - safeRight - 8),
      );
      link.style.setProperty("--label-shift", `${center - (x + size / 2)}px`);
    });
    if (distance > width + size + (links.length - 1) * gap) {
      stop();
      return;
    }
    frame = requestAnimationFrame(tick);
  };
  const staticMode = () => {
    cancelAnimationFrame(frame);
    delete document.documentElement.dataset.mascotParade;
    region.classList.add("parade-static");
    for (const property of [
      "--mascot-height",
      "--mascot-link-height",
      "--gait-scale",
    ])
      region.style.removeProperty(property);
    links.forEach((link) => {
      link.inert = false;
      link.dataset.visible = "true";
    });
  };
  const meet = el("button", "", "Meet the apps");
  meet.type = "button";
  meet.tabIndex = 0;
  setting.append(meet);
  meet.addEventListener("click", () => {
    clearTimeout(timer);
    started = true;
    dismissed = false;
    region.hidden = false;
    staticMode();
    window.SchwegAppearance?.close();
    region.scrollIntoView({ block: "center", behavior: "instant" });
    links[0].focus({ preventScroll: true });
  });
  const start = () => {
    if (!enabled || dismissed || started) return;
    started = true;
    // Do not hide a seasonal control someone is already using.
    if (document.querySelector(".seasonal-overlay:focus-within")) return;
    region.hidden = false;
    if (reduced.matches) staticMode();
    else {
      document.documentElement.dataset.mascotParade = "walking";
      pause("hidden", document.hidden);
      frame = requestAnimationFrame(tick);
    }
  };
  const schedule = () => {
    if (!enabled || started || dismissed) return;
    clearTimeout(timer);
    timer = setTimeout(
      start,
      Math.max(0, START_DELAY - (performance.now() - loadedAt)),
    );
  };
  let loadedAt;
  const loaded = () => {
    loadedAt = performance.now();
    schedule();
  };
  if (document.readyState === "complete") loaded();
  else window.addEventListener("load", loaded, { once: true });
  toggle.addEventListener("click", () => {
    enabled = !enabled;
    try {
      localStorage.setItem(PREFERENCE_KEY, enabled ? "on" : "off");
    } catch {
      /* In-page choice still works. */
    }
    syncSetting();
    if (!enabled) stop();
    else if (loadedAt !== undefined) schedule();
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== PREFERENCE_KEY && event.key !== null) return;
    enabled = read();
    syncSetting();
    if (!enabled) stop();
    else if (loadedAt !== undefined) schedule();
  });
  reduced.addEventListener("change", () => {
    if (started && !region.hidden && reduced.matches) staticMode();
  });
}
