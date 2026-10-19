/* Seasonal overlay contract v2. No layout insertion, polling or animation loop. */
(() => {
  const base = new URL(".", document.currentScript.src);
  const config = window.SchwegSeasonalConfig;
  if (config?.schemaVersion !== 2) return;
  const date = new Date().toISOString().slice(0, 10);
  const season = config.seasons.find(
    (s) =>
      s.enabled !== false &&
      typeof s.asset === "string" &&
      /\.png(?:[?#]|$)/i.test(s.asset) &&
      (!config.activeSeason || config.activeSeason === s.id) &&
      s.window?.from &&
      s.window?.until &&
      date >= s.window.from &&
      date < s.window.until &&
      Number.isFinite(Date.parse(`${s.window.until}T00:00:00Z`)),
  );
  if (!season) return;
  const root = document.documentElement;
  const themeKey = "seasonal-theme:v1",
    motionKey = "seasonal-motion:v1",
    effectsKey = "seasonal-atmosphere:v1",
    promptKey = `seasonal-prompt:v1:${season.id}`;
  const read = (key, session = false) => {
    try {
      return (session ? sessionStorage : localStorage).getItem(key);
    } catch {
      return null;
    }
  };
  const save = (key, value, session = false) => {
    try {
      const s = session ? sessionStorage : localStorage;
      value === null ? s.removeItem(key) : s.setItem(key, value);
    } catch {
      /* In-page choices still work with storage disabled. */
    }
  };
  const mount = () => {
    if (
      document.querySelector("[data-seasonal-controls]") ||
      !document.querySelector("main")
    )
      return;
    let choice = read(themeKey),
      paused = read(motionKey) === "paused",
      hiddenEffects = read(effectsKey) === "hidden",
      dismissed = read(promptKey, true) === "dismissed",
      invited = false,
      timer,
      frame;
    let lastPosition = null,
      expired = false,
      deadlineTimer,
      sizeObserver;
    const events = new AbortController();
    const listen = (target, name, handler, options = {}) =>
      target?.addEventListener(name, handler, {
        ...(typeof options === "boolean" ? { capture: options } : options),
        signal: events.signal,
      });
    const snapshot = Object.fromEntries(
      [
        "data-season",
        "data-season-id",
        "data-season-motion",
        "data-seasonal-profile",
      ].map((key) => [key, root.getAttribute(key)]),
    );
    const restoreAttribute = (key) =>
      snapshot[key] === null
        ? root.removeAttribute(key)
        : root.setAttribute(key, snapshot[key]);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const el = (tag, className, text) => {
      const n = document.createElement(tag);
      if (className) n.className = className;
      if (text) n.textContent = text;
      return n;
    };
    const button = (text, className) => {
      const n = el("button", className, text);
      n.type = "button";
      return n;
    };
    const overlay = el("div", "seasonal-overlay");
    overlay.hidden = true;
    overlay.setAttribute("role", "group");
    overlay.setAttribute("aria-label", `${season.label} mascot`);
    const character = button("", "seasonal-character");
    character.setAttribute("aria-label", `Turn on ${season.label} mode`);
    const flight = el("span", "seasonal-flight"),
      image = el("img");
    image.src = new URL(season.asset, base).href;
    image.alt = "";
    image.width = 104;
    image.height = 132;
    image.decoding = "async";
    flight.append(image);
    character.append(flight);
    const dismiss = button("×", "seasonal-dismiss");
    dismiss.setAttribute("aria-label", `Dismiss ${season.label} character`);
    const notice = el(
      "span",
      "seasonal-notice",
      season.notice || `${season.label} on`,
    );
    notice.hidden = true;
    const undo = button("Undo", "seasonal-undo");
    undo.setAttribute("aria-label", "Restore original appearance");
    overlay.append(character, dismiss);
    document.body.append(overlay);
    const atmosphere = el("div", "seasonal-atmosphere");
    atmosphere.setAttribute("aria-hidden", "true");
    atmosphere.hidden = true;
    for (const name of season.decorations || [])
      atmosphere.append(el("span", `seasonal-${name}`));
    document.body.prepend(atmosphere);
    const originals = (selector) =>
      [...document.querySelectorAll(selector)].map((image) => ({
        image,
        attributes: Object.fromEntries(
          ["src", "srcset", "sizes", "alt"].map((key) => [
            key,
            image.getAttribute(key),
          ]),
        ),
        aspect: image.style.aspectRatio,
        fit: image.style.objectFit,
        ratio:
          image.naturalWidth && image.naturalHeight
            ? `${image.naturalWidth}/${image.naturalHeight}`
            : image.getAttribute("width") && image.getAttribute("height")
              ? `${image.getAttribute("width")}/${image.getAttribute("height")}`
              : null,
      }));
    const portraits = [];
    const marks = originals('img[src*="/schweg-signature-ink.png"]');
    const restore = ({ image, attributes, aspect, fit }) => {
      Object.entries(attributes).forEach(([key, value]) =>
        value === null
          ? image.removeAttribute(key)
          : image.setAttribute(key, value),
      );
      image.style.aspectRatio = aspect;
      image.style.objectFit = fit;
      image.classList.remove("seasonal-light-mark");
    };
    const controls = el("div", "seasonal-controls");
    controls.dataset.seasonalControls = "";
    const disclosure = button("Appearance", "seasonal-appearance-toggle");
    disclosure.setAttribute("aria-expanded", "false");
    disclosure.setAttribute("aria-controls", "seasonal-appearance-panel");
    const panel = el("div", "seasonal-appearance-panel");
    panel.id = "seasonal-appearance-panel";
    panel.hidden = true;
    panel.setAttribute("role", "group");
    panel.setAttribute("aria-label", "Appearance settings");
    const toggle = button(`${season.label} appearance`),
      motion = button("Pause seasonal animations"),
      effects = button("Hide atmosphere"),
      reset = button("Reset appearance"),
      restoreInvite = button("Show Halloween character");
    const status = el("span", "seasonal-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-label", "Seasonal appearance status");
    const existingMode = document.querySelector(".tacobout-theme-control");
    if (existingMode) {
      existingMode.before(controls);
      panel.append(existingMode);
    } else {
      (
        document.querySelector("header .header-right") ||
        document.querySelector("header")
      ).append(controls);
    }
    panel.append(
      toggle,
      undo,
      motion,
      effects,
      restoreInvite,
      reset,
      notice,
      status,
    );
    controls.append(disclosure, panel);
    const closeMenu = () => {
      panel.hidden = true;
      disclosure.setAttribute("aria-expanded", "false");
    };
    const placeMenu = () => {
      controls.style.setProperty(
        "--appearance-top",
        `${Math.max(8, Math.min(disclosure.getBoundingClientRect().bottom + 8, innerHeight - 260))}px`,
      );
    };
    listen(window, "resize", placeMenu, { passive: true });
    disclosure.addEventListener("click", () => {
      placeMenu();
      panel.hidden = !panel.hidden;
      disclosure.setAttribute("aria-expanded", String(!panel.hidden));
    });
    listen(document, "click", (event) => {
      if (!controls.contains(event.target)) closeMenu();
    });
    listen(document, "keydown", (event) => {
      if (event.key === "Escape" && controls.contains(document.activeElement)) {
        closeMenu();
        disclosure.focus();
        event.preventDefault();
      }
    });
    listen(document, "focusin", (event) => {
      if (!controls.contains(event.target)) closeMenu();
    });
    const active = () => choice === season.theme;
    // Layout reads happen only in response to page events. Keep a safe current position when possible.
    const position = () => {
      frame = null;
      if (overlay.hidden) return;
      if (
        [
          ...document.querySelectorAll(
            'dialog[open],[role="dialog"][aria-modal="true"]',
          ),
        ].some(
          (n) =>
            n.getClientRects().length &&
            getComputedStyle(n).visibility !== "hidden",
        )
      ) {
        overlay.dataset.obscured = "true";
        return;
      }
      const view = window.visualViewport,
        width = view?.width || innerWidth,
        height = view?.height || innerHeight,
        offsetX = view?.offsetLeft || 0,
        offsetY = view?.offsetTop || 0;
      const style = getComputedStyle(overlay),
        safe = (side) =>
          parseFloat(style.getPropertyValue(`--seasonal-safe-${side}`)) || 0;
      const box = overlay.getBoundingClientRect(),
        pad = 12;
      const left = offsetX + pad + safe("left"),
        right = offsetX + width - pad - safe("right") - box.width,
        top = offsetY + pad + safe("top"),
        bottom =
          offsetY +
          height -
          (width <= 600 ? 64 : 16) -
          safe("bottom") -
          box.height;
      const protectedRects = [
        ...document.querySelectorAll(
          'header,nav,[role="alert"],[role="status"],[role="dialog"],dialog[open],button,a,input,select,textarea,summary,[role="button"],.notice,[data-seasonal-avoid]',
        ),
      ]
        .filter((node) => !overlay.contains(node))
        .map((node) => node.getBoundingClientRect())
        .filter(
          (r) =>
            r.width &&
            r.height &&
            r.bottom > offsetY &&
            r.top < offsetY + height &&
            r.right > offsetX &&
            r.left < offsetX + width,
        );
      const clear = (p) =>
        p.x >= left &&
        p.y >= top &&
        p.x <= right &&
        p.y <= bottom &&
        !protectedRects.some(
          (r) =>
            p.x - 8 < r.right &&
            p.x + box.width + 8 > r.left &&
            p.y - 10 < r.bottom &&
            p.y + box.height + 10 > r.top,
        );
      let point = lastPosition && clear(lastPosition) ? lastPosition : null;
      if (!point) {
        const headerBottom = Math.max(
          top,
          ...[...document.querySelectorAll("header,nav")]
            .map((n) => n.getBoundingClientRect())
            .filter(
              (r) => r.width && r.height && r.top < offsetY + height * 0.25,
            )
            .map((r) => r.bottom + 12),
        );
        const ys = [
          bottom,
          bottom - (bottom - top) * 0.33,
          bottom - (bottom - top) * 0.66,
          headerBottom,
          top,
        ];
        for (const y of ys) {
          for (const x of [right, left]) {
            if (clear({ x, y })) {
              point = { x, y };
              break;
            }
          }
          if (point) break;
        }
      }
      if (!point) {
        overlay.dataset.obscured = "true";
        return;
      }
      delete overlay.dataset.obscured;
      lastPosition = point;
      overlay.style.left = `${point.x}px`;
      overlay.style.top = `${point.y}px`;
    };
    const queue = () => {
      if (expired) return;
      if (!frame) frame = requestAnimationFrame(position);
    };
    const updateMotion = () => {
      const stopped = paused || reduce.matches;
      const state = stopped ? "paused" : "auto";
      overlay.dataset.seasonMotion = state;
      atmosphere.dataset.seasonMotion = state;
      if (active()) root.dataset.seasonMotion = state;
      else restoreAttribute("data-season-motion");
      motion.textContent = reduce.matches
        ? "Motion reduced by device"
        : `${paused ? "Resume" : "Pause"} seasonal animations`;
      motion.setAttribute("aria-pressed", String(stopped));
      motion.disabled = reduce.matches;
    };
    const renderOverlay = () => {
      const on = active();
      overlay.hidden =
        dismissed || !(on || (!dismissed && invited && choice !== "off"));
      character.hidden = false;
      dismiss.hidden = false;
      undo.hidden = !on;
      notice.hidden = !on;
      character.title = on
        ? "Undo"
        : season.tooltip || "Change seasonal appearance";
      character.setAttribute(
        "aria-label",
        on ? `Turn off ${season.label} mode` : `Turn on ${season.label} mode`,
      );
      character.setAttribute("aria-pressed", String(on));
      queue();
    };
    const apply = (source = "initial") => {
      const on = active();
      if (on) {
        root.dataset.season = season.theme;
        root.dataset.seasonId = season.id;
        root.dataset.seasonalProfile = config.profile.id;
      } else {
        [
          "data-season",
          "data-season-id",
          "data-seasonal-profile",
          "data-season-motion",
        ].forEach(restoreAttribute);
      }
      atmosphere.hidden = !on || hiddenEffects;
      effects.textContent = hiddenEffects
        ? "Show atmosphere"
        : "Hide atmosphere";
      effects.setAttribute("aria-pressed", String(hiddenEffects));
      portraits.forEach((record) => {
        if (on) {
          const { image, ratio } = record;
          image.src = new URL(season.asset, base).href;
          image.removeAttribute("srcset");
          image.removeAttribute("sizes");
          image.alt = "";
          if (ratio) image.style.aspectRatio = ratio;
          image.style.objectFit = "contain";
        } else restore(record);
      });
      marks.forEach((record) => {
        if (on && season.scheme !== "light") {
          record.image.src = record.attributes.src.replace(
            "schweg-signature-ink.png",
            "schweg-signature-light.png",
          );
          record.image.removeAttribute("srcset");
          record.image.classList.add("seasonal-light-mark");
        } else restore(record);
      });
      toggle.setAttribute("aria-pressed", String(on));
      status.textContent = on ? `${season.label} on` : "Standard appearance";
      updateMotion();
      renderOverlay();
      window.dispatchEvent(
        new CustomEvent("schweg:seasonal-change", {
          detail: {
            schemaVersion: 2,
            seasonId: season.id,
            theme: season.theme,
            active: on,
            motion: paused || reduce.matches ? "paused" : "auto",
            source,
          },
        }),
      );
    };
    const schedule = () => {
      clearTimeout(timer);
      if (active() || choice === "off" || dismissed) return;
      timer = setTimeout(() => {
        invited = true;
        renderOverlay();
      }, config.invitationDelayMs ?? 1000);
    };
    const focusContent = () => {
      const main = document.querySelector("main");
      if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
      main.focus({ preventScroll: true });
    };
    const choose = (value, source) => {
      clearTimeout(timer);
      choice = value;
      save(themeKey, value);
      if (value === "off") invited = false;
      apply(source);
    };
    character.addEventListener("click", () =>
      choose(active() ? "off" : season.theme, "character"),
    );
    undo.addEventListener("click", () => {
      choose("off", "undo");
      focusContent();
    });
    const dismissMascot = () => {
      dismissed = true;
      save(promptKey, "dismissed", true);
      clearTimeout(timer);
      renderOverlay();
      disclosure.focus({ preventScroll: true });
    };
    dismiss.addEventListener("click", dismissMascot);
    const changeMotion = () => {
      paused = !paused;
      save(motionKey, paused ? "paused" : "auto");
      apply("motion");
    };
    motion.addEventListener("click", changeMotion);
    effects.addEventListener("click", () => {
      hiddenEffects = !hiddenEffects;
      save(effectsKey, hiddenEffects ? "hidden" : "auto");
      apply("atmosphere");
    });
    toggle.addEventListener("click", () =>
      choose(active() ? "off" : season.theme, "toggle"),
    );
    restoreInvite.addEventListener("click", () => {
      if (!active()) {
        choice = null;
        save(themeKey, null);
      }
      dismissed = false;
      invited = true;
      save(promptKey, null, true);
      renderOverlay();
      closeMenu();
    });
    reset.addEventListener("click", () => {
      choice = null;
      paused = false;
      hiddenEffects = false;
      dismissed = false;
      invited = false;
      save(themeKey, null);
      save(motionKey, null);
      save(effectsKey, null);
      save(promptKey, null, true);
      apply("reset");
      schedule();
    });
    listen(window, "storage", (event) => {
      if ([themeKey, motionKey, effectsKey, null].includes(event.key)) {
        choice = read(themeKey);
        paused = read(motionKey) === "paused";
        hiddenEffects = read(effectsKey) === "hidden";
        apply("storage");
        schedule();
      }
    });
    listen(reduce, "change", () => {
      updateMotion();
      queue();
    });
    listen(window, "resize", queue, { passive: true });
    listen(document, "scroll", queue, { passive: true, capture: true });
    listen(document, "click", queue, true);
    listen(document, "focusin", queue);
    listen(document, "close", queue, true);
    listen(document, "toggle", queue, true);
    listen(document, "keydown", (event) => {
      if (event.key === "Escape" && overlay.contains(document.activeElement)) {
        dismissMascot();
        event.preventDefault();
      } else if (event.key === "Escape" || event.key === "Tab") queue();
    });
    listen(window.visualViewport, "resize", queue, { passive: true });
    listen(window.visualViewport, "scroll", queue, { passive: true });
    if (typeof ResizeObserver !== "undefined") {
      sizeObserver = new ResizeObserver(queue);
      document
        .querySelectorAll("main,header,footer")
        .forEach((node) => sizeObserver.observe(node));
    }
    const boundary = season.window?.until
      ? Date.parse(`${season.window.until}T00:00:00Z`)
      : NaN;
    const expire = () => {
      expired = true;
      clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
      events.abort();
      sizeObserver?.disconnect();
      portraits.forEach(restore);
      marks.forEach(restore);
      Object.keys(snapshot).forEach(restoreAttribute);
      if (overlay.contains(document.activeElement)) focusContent();
      overlay.remove();
      atmosphere.remove();
      if (existingMode) controls.before(existingMode);
      controls.remove();
      window.dispatchEvent(
        new CustomEvent("schweg:seasonal-change", {
          detail: {
            schemaVersion: 2,
            seasonId: season.id,
            theme: season.theme,
            active: false,
            motion: snapshot["data-season-motion"] || "auto",
            source: "expired",
          },
        }),
      );
    };
    const armBoundary = () => {
      const remaining = boundary - Date.now();
      if (remaining <= 0) expire();
      else
        deadlineTimer = setTimeout(
          armBoundary,
          Math.min(remaining, 2147483647),
        );
    };
    apply();
    schedule();
    if (Number.isFinite(boundary)) armBoundary();
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
