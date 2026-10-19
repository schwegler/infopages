/* Seasonal overlay contract v2. No layout insertion, polling or animation loop. */
(() => {
  const base = new URL(".", document.currentScript.src);
  const config = window.SchwegSeasonalConfig;
  if (config?.schemaVersion !== 2) return;
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const season = config.seasons.find(
    (s) =>
      s.enabled !== false &&
      (!s.window ||
        ((!s.window.from || date >= s.window.from) &&
          (!s.window.until || date < s.window.until))),
  );
  if (!season) return;
  const root = document.documentElement;
  const themeKey = "seasonal-theme:v1",
    motionKey = "seasonal-motion:v1",
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
      dismissed = read(promptKey, true) === "dismissed",
      invited = false,
      timer,
      frame;
    let lastPosition = null;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    root.dataset.seasonalProfile = config.profile.id;
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
    const notice = el("span", "seasonal-notice", "well. it’s haunted now.");
    notice.hidden = true;
    const actions = el("div", "seasonal-overlay-actions");
    actions.hidden = true;
    const undo = button("Undo", "seasonal-undo");
    undo.setAttribute("aria-label", "Restore original appearance");
    const pause = button("Pause", "seasonal-pause");
    actions.append(undo, pause);
    overlay.append(character, dismiss, notice, actions);
    document.body.append(overlay);
    const atmosphere = el("div", "seasonal-atmosphere");
    atmosphere.setAttribute("aria-hidden", "true");
    atmosphere.hidden = true;
    for (const name of [
      "moon",
      "moon-stars",
      "pumpkin pumpkin-one",
      "pumpkin pumpkin-two",
      "wisp wisp-one",
      "wisp wisp-two",
      "sparkles sparkles-one",
      "sparkles sparkles-two",
    ])
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
    const portraits = originals(
      'img[src*="/telly_"],img[src*="/duo_left_telly_host_transparent"],img[src*="/andrew-pencil-mascot"]',
    );
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
    const controls = el("section", "seasonal-controls");
    controls.dataset.seasonalControls = "";
    controls.setAttribute("aria-label", "Seasonal appearance");
    const toggle = button(`${season.label} appearance`),
      motion = button("Pause seasonal animations"),
      reset = button("Reset appearance");
    const status = el("span", "seasonal-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-label", "Seasonal appearance status");
    controls.append(toggle, motion, reset, status);
    const footer = document.querySelector("footer");
    if (footer) footer.before(controls);
    else document.body.append(controls);
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
        bottom = offsetY + height - pad - safe("bottom") - box.height;
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
      if (!frame) frame = requestAnimationFrame(position);
    };
    const updateMotion = () => {
      const stopped = paused || reduce.matches;
      root.dataset.seasonMotion = stopped ? "paused" : "auto";
      pause.textContent = paused ? "Resume" : "Pause";
      pause.setAttribute(
        "aria-label",
        `${paused ? "Resume" : "Pause"} ${season.label} animations`,
      );
      pause.setAttribute("aria-pressed", String(stopped));
      pause.disabled = reduce.matches;
      motion.textContent = reduce.matches
        ? "Motion reduced by device"
        : `${paused ? "Resume" : "Pause"} seasonal animations`;
      motion.setAttribute("aria-pressed", String(stopped));
      motion.disabled = reduce.matches;
    };
    const renderOverlay = () => {
      const on = active();
      overlay.hidden = !(on || (!dismissed && invited && choice !== "off"));
      character.hidden = on && dismissed;
      dismiss.hidden = on && dismissed;
      actions.hidden = !on;
      notice.hidden = !on;
      character.title = on ? "Undo" : "make it weird";
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
      } else {
        delete root.dataset.season;
        delete root.dataset.seasonId;
      }
      atmosphere.hidden = !on;
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
        if (on) {
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
            motion: root.dataset.seasonMotion,
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
      if (active()) undo.focus({ preventScroll: true });
      else focusContent();
    };
    dismiss.addEventListener("click", dismissMascot);
    const changeMotion = () => {
      paused = !paused;
      save(motionKey, paused ? "paused" : "auto");
      apply("motion");
    };
    pause.addEventListener("click", changeMotion);
    motion.addEventListener("click", changeMotion);
    toggle.addEventListener("click", () =>
      choose(active() ? "off" : season.theme, "toggle"),
    );
    reset.addEventListener("click", () => {
      choice = null;
      paused = false;
      dismissed = false;
      invited = false;
      save(themeKey, null);
      save(motionKey, null);
      save(promptKey, null, true);
      apply("reset");
      schedule();
    });
    window.addEventListener("storage", (event) => {
      if ([themeKey, motionKey, null].includes(event.key)) {
        choice = read(themeKey);
        paused = read(motionKey) === "paused";
        apply("storage");
        schedule();
      }
    });
    reduce.addEventListener("change", () => {
      updateMotion();
      queue();
    });
    window.addEventListener("resize", queue, { passive: true });
    document.addEventListener("scroll", queue, {
      passive: true,
      capture: true,
    });
    document.addEventListener("click", queue, true);
    document.addEventListener("focusin", queue);
    document.addEventListener("close", queue, true);
    document.addEventListener("toggle", queue, true);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay.contains(document.activeElement)) {
        dismissMascot();
        event.preventDefault();
      } else if (event.key === "Escape" || event.key === "Tab") queue();
    });
    window.visualViewport?.addEventListener("resize", queue, { passive: true });
    window.visualViewport?.addEventListener("scroll", queue, { passive: true });
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(queue);
      document
        .querySelectorAll("main,header,footer")
        .forEach((node) => observer.observe(node));
    }
    apply();
    schedule();
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
