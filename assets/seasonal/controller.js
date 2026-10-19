/* Shared seasonal interaction contract v2. One invitation timer; CSS-only motion. */
(() => {
  const script = document.currentScript;
  const base = new URL(".", script.src);
  const manifest = window.SchwegSeasonalConfig;
  if (!manifest || manifest.schemaVersion !== 2) return;
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const season = manifest.seasons.find(
    (item) =>
      item.enabled !== false &&
      (!item.window ||
        ((!item.window.from || date >= item.window.from) &&
          (!item.window.until || date < item.window.until))),
  );
  if (!season) return;
  const profile = manifest.profile;
  const root = document.documentElement;
  const themeKey = "seasonal-theme:v1";
  const motionKey = "seasonal-motion:v1";
  const promptKey = `seasonal-prompt:v1:${season.id}`;
  const read = (key, session = false) => {
    try {
      return (session ? sessionStorage : localStorage).getItem(key);
    } catch {
      return null;
    }
  };
  const save = (key, value, session = false) => {
    try {
      const storage = session ? sessionStorage : localStorage;
      value === null ? storage.removeItem(key) : storage.setItem(key, value);
    } catch {
      /* Session-only choices remain usable when storage is denied. */
    }
  };
  const mount = () => {
    if (document.querySelector("[data-seasonal-controls]")) return;
    const main = document.querySelector("main");
    if (!main) return;
    root.dataset.seasonalProfile = profile.id;
    let choice = read(themeKey);
    let paused = read(motionKey) === "paused";
    let dismissed = read(promptKey, true) === "dismissed";
    let timer;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const el = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    };
    const button = (text, className = "") => {
      const node = el("button", className, text);
      node.type = "button";
      return node;
    };
    const art = () => {
      const image = el("img");
      image.src = new URL(season.asset, base).href;
      image.alt = "";
      image.width = 144;
      image.height = 170;
      image.decoding = "async";
      return image;
    };
    const stage = el("div", "seasonal-stage");
    const invitation = el("section", "seasonal-invitation");
    invitation.setAttribute("aria-label", `${season.label} invitation`);
    invitation.hidden = true;
    const inviteCopy = el("div", "seasonal-invite-copy");
    inviteCopy.append(
      el("p", "seasonal-kicker", season.kicker),
      el("p", "seasonal-title", season.prompt),
      el(
        "p",
        "seasonal-detail",
        `Click ${profile.character} to dress up the page. Your choice.`,
      ),
    );
    const activate = button("", "seasonal-character");
    activate.setAttribute("aria-label", `Turn on ${season.label} appearance`);
    activate.append(
      art(),
      el(
        "span",
        "seasonal-character-caption",
        `Invite ${profile.character} in`,
      ),
    );
    const dismiss = button("×", "seasonal-dismiss");
    dismiss.setAttribute("aria-label", `Dismiss ${season.label} invitation`);
    invitation.append(inviteCopy, activate, dismiss);
    const scene = el("section", `seasonal-scene seasonal-${profile.id}`);
    scene.setAttribute("aria-label", `${season.label} scene`);
    scene.hidden = true;
    const copy = el("div", "seasonal-scene-copy");
    copy.append(
      el("p", "seasonal-kicker", season.kicker),
      el("p", "seasonal-title", season.title),
      el("p", "seasonal-detail", season.detail),
    );
    const actions = el("div", "seasonal-scene-actions");
    const undo = button("Restore original appearance");
    const sceneMotion = button("Pause scene animations");
    actions.append(undo, sceneMotion);
    copy.append(actions);
    const heroArt = el("div", "seasonal-hero-art");
    heroArt.append(art());
    scene.append(copy, heroArt);
    stage.append(invitation, scene);
    if (profile.placement === "before-shell")
      document.querySelector("#shell").before(stage);
    else main.prepend(stage);
    const atmosphere = el("div", "seasonal-atmosphere");
    atmosphere.setAttribute("aria-hidden", "true");
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
    atmosphere.hidden = true;
    document.body.prepend(atmosphere);
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
    const controls = el("section", "seasonal-controls");
    controls.dataset.seasonalControls = "";
    controls.setAttribute("aria-label", "Seasonal appearance");
    const toggle = button(`${season.label} appearance`);
    const motion = button("Pause seasonal animations");
    const reset = button("Reset appearance");
    const status = el("span", "seasonal-status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-label", "Seasonal appearance status");
    controls.append(toggle, motion, reset, status);
    const footer = document.querySelector("footer");
    if (footer) footer.before(controls);
    else main.after(controls);
    const focusContent = () => {
      if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
      main.focus({ preventScroll: true });
    };
    const updateMotion = () => {
      const stopped = paused || reduce.matches;
      root.dataset.seasonMotion = stopped ? "paused" : "auto";
      for (const [node, scope] of [
        [motion, "seasonal"],
        [sceneMotion, "scene"],
      ]) {
        node.textContent = reduce.matches
          ? "Motion reduced by device"
          : `${paused ? "Resume" : "Pause"} ${scope} animations`;
        node.setAttribute("aria-pressed", String(stopped));
        node.disabled = reduce.matches;
      }
    };
    const hideInvitation = () => {
      clearTimeout(timer);
      invitation.hidden = true;
      stage.classList.remove("seasonal-awaiting");
    };
    const announce = (source) =>
      window.dispatchEvent(
        new CustomEvent("schweg:seasonal-change", {
          detail: {
            schemaVersion: 2,
            seasonId: season.id,
            theme: season.theme,
            active: choice === season.theme,
            motion: root.dataset.seasonMotion,
            source,
          },
        }),
      );
    const apply = (source = "initial") => {
      const active = choice === season.theme;
      if (active) {
        root.dataset.season = season.theme;
        root.dataset.seasonId = season.id;
      } else {
        delete root.dataset.season;
        delete root.dataset.seasonId;
      }
      scene.hidden = !active;
      atmosphere.hidden = !active;
      if (active || choice === "off") hideInvitation();
      portraits.forEach(({ image, original }) => {
        if (active) {
          image.src = new URL(season.asset, base).href;
          image.removeAttribute("srcset");
          image.removeAttribute("sizes");
          image.alt = "";
        } else
          Object.entries(original).forEach(([attribute, value]) =>
            value === null
              ? image.removeAttribute(attribute)
              : image.setAttribute(attribute, value),
          );
      });
      toggle.setAttribute("aria-pressed", String(active));
      status.textContent = active
        ? `${season.label} on`
        : "Seasonal appearance off";
      updateMotion();
      announce(source);
    };
    const schedule = () => {
      clearTimeout(timer);
      if (choice === season.theme || choice === "off" || dismissed) return;
      stage.classList.add("seasonal-awaiting");
      timer = setTimeout(() => {
        stage.classList.remove("seasonal-awaiting");
        invitation.hidden = false;
      }, manifest.invitationDelayMs ?? 1000);
    };
    const choose = (value, source) => {
      choice = value;
      save(themeKey, value);
      apply(source);
    };
    activate.addEventListener("click", () => {
      choose(season.theme, "invitation");
      undo.focus({ preventScroll: true });
    });
    dismiss.addEventListener("click", () => {
      dismissed = true;
      save(promptKey, "dismissed", true);
      hideInvitation();
      focusContent();
    });
    undo.addEventListener("click", () => {
      choose("off", "undo");
      focusContent();
    });
    toggle.addEventListener("click", () =>
      choose(choice === season.theme ? "off" : season.theme, "toggle"),
    );
    const switchMotion = () => {
      paused = !paused;
      save(motionKey, paused ? "paused" : "auto");
      updateMotion();
      announce("motion");
    };
    motion.addEventListener("click", switchMotion);
    sceneMotion.addEventListener("click", switchMotion);
    reset.addEventListener("click", () => {
      choice = null;
      paused = false;
      dismissed = false;
      save(themeKey, null);
      save(motionKey, null);
      save(promptKey, null, true);
      hideInvitation();
      apply("reset");
      schedule();
    });
    window.addEventListener("storage", (event) => {
      if (
        event.key === themeKey ||
        event.key === motionKey ||
        event.key === null
      ) {
        choice = read(themeKey);
        paused = read(motionKey) === "paused";
        hideInvitation();
        apply("storage");
        schedule();
      }
    });
    reduce.addEventListener("change", updateMotion);
    apply();
    schedule();
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
