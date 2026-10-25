/* Original PNG pixels, articulated with clipped layers rather than body warps. */
const asset = (name) => new URL(`../parade/${name}`, import.meta.url).href;
export const START_DELAY = 2000;
export const PREFERENCE_KEY = "schweg-mascot-parade:v1";
export function chooseLane(bottom, height, rects, maxLift) {
  const clear = (floor, size) =>
    rects.every(
      (rect) => floor <= rect.top - 6 || floor - size - 2 >= rect.bottom + 6,
    );
  const floors = [...new Set([bottom, ...rects.map((rect) => rect.top - 8)])]
    .filter((floor) => floor <= bottom && floor >= bottom - maxLift)
    .sort((a, b) => b - a);
  for (const floor of floors) {
    if (clear(floor, height)) return { bottom: floor, height };
    const nearby = rects.filter(
      (rect) => rect.top < floor && rect.bottom > floor - height - 10,
    );
    const size = nearby.length
      ? Math.min(
          height,
          floor - Math.max(...nearby.map((rect) => rect.bottom)) - 10,
        )
      : height;
    if (size >= 44 && clear(floor, size))
      return { bottom: floor, height: size };
  }
  return { bottom, height };
}

export function buildObstructingIntervals(rects, bottom, linkHeight, size) {
  const raw = [];
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    if (bottom > rect.top - 4 && bottom - linkHeight < rect.bottom + 4) {
      raw.push([rect.left - 4 - size, rect.right + 4]);
    }
  }
  if (!raw.length) return [];
  raw.sort((a, b) => a[0] - b[0]);
  const merged = [raw[0]];
  for (let i = 1; i < raw.length; i++) {
    const current = raw[i];
    const last = merged[merged.length - 1];
    if (current[0] < last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }
  return merged;
}

export function isPositionObstructed(x, intervals) {
  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    if (x >= interval[1]) continue;
    if (x <= interval[0]) return false;
    return true;
  }
  return false;
}
export const mascots = [
  {
    id: "telly",
    name: "Telly",
    app: "taco ’bout it",
    url: "https://tacobout.online/",
    image: asset("telly-facet-approved.png"),
    logo: asset("tacobout-logo.png"),
    width: 680,
    height: 915,
    crop: [175, 45, 680, 915],
    body: "polygon(0.000% 0.000%,100.000% 0.000%,100.000% 76.721%,0.000% 76.721%)",
    legs: [
      {
        hip: "38.235% 76.393%",
        knee: "34.265% 83.388%",
        upper:
          "polygon(32.206% 75.738%,45.000% 76.284%,40.000% 85.902%,29.853% 85.355%)",
        lower:
          "polygon(13.382% 82.077%,44.853% 82.077%,44.853% 99.344%,13.382% 99.344%)",
      },
      {
        hip: "57.500% 75.847%",
        knee: "56.618% 83.388%",
        upper:
          "polygon(52.059% 75.847%,62.647% 75.301%,61.765% 86.011%,51.176% 86.557%)",
        lower:
          "polygon(46.765% 82.077%,79.118% 82.077%,79.118% 99.344%,46.765% 99.344%)",
      },
    ],
  },
  {
    id: "facet",
    name: "Facet",
    app: "Trove",
    url: "https://trove.schweg.xyz/",
    image: asset("telly-facet-approved.png"),
    logo: asset("trove-logo.png"),
    width: 493,
    height: 880,
    crop: [883, 80, 493, 880],
    body: "polygon(0.000% 0.000%,100.000% 0.000%,100.000% 79.886%,0.000% 79.886%)",
    legs: [
      {
        hip: "34.077% 79.318%",
        knee: "34.686% 84.886%",
        upper:
          "polygon(26.572% 78.636%,39.959% 79.545%,41.785% 86.932%,27.181% 87.386%)",
        lower:
          "polygon(5.274% 82.045%,46.856% 82.045%,46.856% 99.205%,5.274% 99.205%)",
      },
      {
        hip: "58.418% 79.432%",
        knee: "63.286% 85.341%",
        upper:
          "polygon(50.710% 79.432%,66.531% 79.091%,70.994% 86.932%,57.606% 87.386%)",
        lower:
          "polygon(51.521% 82.045%,92.292% 82.045%,92.292% 99.205%,51.521% 99.205%)",
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
        lower:
          "polygon(41.295% 86.879%,54.018% 86.879%,54.018% 100.000%,25.000% 100.000%,25.000% 93.042%,36.384% 89.463%)",
      },
      {
        hip: "63% 82%",
        knee: "65% 88%",
        upper: "polygon(58% 81%,69% 81%,71% 89%,60% 89%)",
        lower: "polygon(56% 87%,90% 87%,90% 100%,56% 100%)",
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
    const pixels = el("span", "parade-pixels");
    pixels.style.clipPath = clip;
    if (mascot.crop) {
      const [x, y, width, height] = mascot.crop;
      art.style.width = `${(1536 / width) * 100}%`;
      art.style.height = `${(1024 / height) * 100}%`;
      art.style.left = `${(-x / width) * 100}%`;
      art.style.top = `${(-y / height) * 100}%`;
      art.style.objectFit = "fill";
    }
    pixels.append(art);
    node.append(pixels);
    return node;
  };
  mascot.legs.forEach((leg, i) => {
    const upper = part(`parade-leg parade-leg--${i}`, leg.upper);
    upper.style.transformOrigin = leg.hip;
    const lower = part("parade-shin", leg.lower);
    lower.style.transformOrigin = leg.knee;
    upper.append(lower);
    rig.prepend(upper);
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
  let distance = 0,
    activeIndex = 0;
  let protectedRects = [],
    obstructingIntervals = [],
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
    const wasStatic = region.classList.contains("parade-static");
    const returnFocus = wasStatic || region.contains(document.activeElement);
    stop();
    if (returnFocus) {
      window.SchwegAppearance?.disclosure.focus({ preventScroll: true });
      if (wasStatic)
        window.SchwegAppearance?.disclosure.scrollIntoView({
          block: "nearest",
          behavior: "instant",
        });
    }
  };
  close.addEventListener("click", dismiss);
  region.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dismiss();
    }
  });
  list.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch") pause("hover", true);
  });
  list.addEventListener("pointerleave", () => pause("hover", false));
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
    const safeBottom =
      parseFloat(style.getPropertyValue("--parade-safe-bottom")) || 0;
    const lift = parseFloat(style.getPropertyValue("--parade-lane-lift")) || 0;
    const size = width <= 600 ? 88 : 116;
    return {
      width,
      size,
      safeLeft,
      safeRight,
      baseBottom: innerHeight - 10 - safeBottom,
      bottom: innerHeight - 10 - safeBottom - lift,
      speed: width <= 600 ? 42 : 60,
    };
  };
  const tick = (now) => {
    const {
      width,
      size,
      safeLeft,
      safeRight,
      speed,
      baseBottom,
      bottom: oldBottom,
    } = layout();
    let bottom = oldBottom;
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
            rect.right > 0 &&
            rect.left < width &&
            rect.bottom > 0 &&
            rect.top < innerHeight,
        );
      const defaultHeight = width <= 600 ? 78 : 108;
      // Try a compact bottom lane, then a clear band just above low controls.
      const lane = chooseLane(
        baseBottom,
        defaultHeight,
        protectedRects,
        Math.min(140, innerHeight * 0.3),
      );
      const rigHeight = lane.height;
      bottom = lane.bottom;
      region.style.setProperty(
        "--parade-lane-lift",
        `${baseBottom - bottom}px`,
      );
      region.style.setProperty("--mascot-height", `${rigHeight}px`);
      region.style.setProperty("--mascot-link-height", `${rigHeight + 2}px`);
      region.style.setProperty(
        "--gait-scale",
        String(((rigHeight / 108) * 60) / speed),
      );
      const linkHeight = links[0].offsetHeight;
      obstructingIntervals = buildObstructingIntervals(
        protectedRects,
        bottom,
        linkHeight,
        size,
      );
      layoutDirty = false;
    }
    const linkHeight = links[0].offsetHeight;
    if (previous !== undefined && !pauses.size)
      distance += ((now - previous) * speed) / 1000;
    previous = now;
    // A padded exit accounts for the articulated shoes extending beyond the link.
    // Reset only after the current character has completely left the viewport.
    if (distance > width + size * 2) {
      activeIndex += 1;
      distance = 0;
    }
    if (activeIndex >= links.length) {
      stop();
      return;
    }
    links.forEach((link, i) => {
      const active = i === activeIndex;
      let x = active ? distance - size : -size * 2;
      if (link === document.activeElement)
        x = Math.max(safeLeft + 8, Math.min(x, width - size - safeRight - 8));
      link.style.setProperty("--parade-x", `${x}px`);
      const obstructs = isPositionObstructed(x, obstructingIntervals);
      // Only fully visible links enter the keyboard order.
      const ready = active && link.dataset.artReady === "true";
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
      "--parade-lane-lift",
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
