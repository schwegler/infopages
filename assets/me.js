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
// Native disclosure works without JS; mobile starts edited, desktop stays open.
const narrowProfile = matchMedia("(max-width: 760px)");
const adaptDisclosures = () => {
  document.querySelectorAll(".gaming,.more-links").forEach((details) => {
    details.open = !narrowProfile.matches;
  });
};
adaptDisclosures();
narrowProfile.addEventListener("change", adaptDisclosures);

// Public updates are ephemeral. Revalidate on panel entry/visibility return;
// remove content and abort requests when it is no longer being viewed.
const latestPanel = document.getElementById("lately");
if (latestPanel) {
  const containers = ["latest-blog", "latest-bluesky", "latest-trove"].map(
    (id) => document.getElementById(id),
  );
  const status = latestPanel.querySelector(".latest-status");
  const refresh = latestPanel.querySelector(".refresh-updates");
  let controller;
  let inView = false;
  let revision = 0;
  const arrow = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", "M5 19 19 5M5 5h14v14");
    svg.append(path);
    return svg;
  };
  function link(text, href, className = "source-link") {
    const a = document.createElement("a");
    a.href = href;
    a.className = className;
    a.append(document.createTextNode(text));
    if (className !== "") a.append(arrow());
    return a;
  }
  function text(tag, value, className) {
    const node = document.createElement(tag);
    node.textContent = value;
    if (className) node.className = className;
    return node;
  }
  function date(value) {
    const parsed = new Date(value);
    if (!Number.isFinite(parsed.getTime())) return null;
    const node = text(
      "time",
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(parsed),
    );
    node.dateTime = parsed.toISOString();
    return node;
  }
  function safe(value, origin, pattern) {
    try {
      const u = new URL(value);
      return u.origin === origin &&
        !u.username &&
        !u.password &&
        pattern.test(u.pathname)
        ? u.href
        : null;
    } catch {
      return null;
    }
  }
  function clear() {
    revision++;
    controller?.abort();
    controller = undefined;
    containers.forEach((node) => node.replaceChildren());
    refresh.disabled = false;
  }
  function feedText(value) {
    const p = document.createElement("p");
    p.className = "feed-text";
    const parts = String(value).split(/(https:\/\/[^\s]+)/g);
    for (const part of parts) {
      if (part.startsWith("https://")) {
        try {
          const u = new URL(part);
          const a = text("a", part);
          a.href = u.href;
          a.rel = "noreferrer";
          p.append(a);
          continue;
        } catch {
          /* show malformed URL as text */
        }
      }
      p.append(document.createTextNode(part));
    }
    return p;
  }
  async function load() {
    clear();
    if (!inView || document.hidden) return;
    const current = revision;
    controller = new AbortController();
    refresh.disabled = true;
    status.textContent = "Checking public updates…";
    try {
      const response = await fetch("/api/profile-latest", {
        credentials: "omit",
        cache: "no-store",
        signal: controller.signal,
      });
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("application/json")
      )
        throw new Error("Unavailable");
      const data = await response.json();
      if (current !== revision || document.hidden || !inView) return;
      let shown = 0;
      const post = data.posts?.[0];
      const postURL =
        post && safe(post.url, "https://tacobout.online", /^\/.+/);
      if (postURL && typeof post.title === "string") {
        const article = text("article", "", "latest-entry");
        const when = date(post.date);
        if (when) article.append(when);
        const heading = document.createElement("h4");
        heading.append(link(post.title, postURL, ""));
        article.append(heading);
        if (typeof post.excerpt === "string")
          article.append(text("p", post.excerpt));
        article.append(link("Read the post", postURL));
        containers[0].append(article);
        shown++;
      }
      const feed = data.bluesky;
      const feedURL =
        feed &&
        safe(
          feed.url,
          "https://bsky.app",
          /^\/profile\/[^/]+\/post\/[a-zA-Z0-9]+$/,
        );
      if (feedURL && typeof feed.text === "string") {
        const article = text("article", "", "latest-entry");
        const when = date(feed.date);
        if (when) article.append(when);
        if (feed.text) article.append(feedText(feed.text));
        article.append(link("Read on Bluesky", feedURL));
        containers[1].append(article);
        shown++;
      }
      const item = data.trove;
      const itemURL =
        item &&
        safe(
          item.url,
          "https://trove.schweg.xyz",
          /^\/(movies|albums|comics|tv_shows|tv_episodes|video_games|books)\/[1-9]\d*(?:-[a-z0-9-]+)?\/?$/,
        );
      if (itemURL && typeof item.title === "string") {
        const article = text("article", "", "latest-entry");
        const heading = document.createElement("h4");
        heading.append(link(item.title, itemURL, ""));
        article.append(heading);
        article.append(
          text(
            "p",
            [item.type, item.year]
              .filter((value) => typeof value === "string" && value)
              .join(" · "),
            "media-meta",
          ),
        );
        if (
          typeof item.cover === "string" &&
          /^\/api\/profile-latest\?cover=(?:movie|album|comic|tv_show|tv_episode|video_game|book)%2F[1-9]\d*$/.test(
            item.cover,
          )
        ) {
          const coverLink = link("", itemURL, "trove-cover-link");
          coverLink.replaceChildren();
          const img = document.createElement("img");
          img.className = "trove-cover";
          img.alt = item.title + " cover";
          img.decoding = "async";
          img.referrerPolicy = "no-referrer";
          img.addEventListener(
            "error",
            () => {
              if (current !== revision) return;
              containers[2].replaceChildren(
                text(
                  "p",
                  "The public Trove item or cover is unavailable right now.",
                  "latest-status",
                ),
              );
              status.textContent =
                "Some public updates are unavailable right now. The source links above still work.";
            },
            { once: true },
          );
          img.src = item.cover;
          coverLink.append(img);
          article.append(coverLink);
        }
        article.append(link("View on Trove", itemURL));
        containers[2].append(article);
        shown++;
      }
      const fallback = [
        "No public article is available right now.",
        "No public feed entry is available right now.",
        "No public collection item is available right now.",
      ];
      containers.forEach((node, index) => {
        if (!node.childElementCount)
          node.append(text("p", fallback[index], "latest-status"));
      });
      const checked = new Date(data.checkedAt);
      status.textContent =
        shown === 3
          ? "Public updates checked on view. Refreshes when you return."
          : "Public updates are unavailable right now. The source links above still work.";
      if (shown && Number.isFinite(checked.getTime()))
        status.title = "Checked " + checked.toISOString();
    } catch (error) {
      if (current !== revision || error.name === "AbortError") return;
      containers.forEach((node) => node.replaceChildren());
      status.textContent =
        "Public updates are unavailable right now. The source links above still work.";
    } finally {
      if (current === revision) refresh.disabled = false;
    }
  }
  refresh.hidden = false;
  refresh.addEventListener("click", load);
  const observer = new IntersectionObserver(
    (entries) => {
      const visible =
        entries[0].isIntersecting && entries[0].intersectionRatio >= 0.01;
      if (visible === inView) return;
      inView = visible;
      if (visible) load();
      else {
        clear();
        status.textContent =
          "Public updates are checked when you view this panel and return to it.";
      }
    },
    { threshold: 0.01 },
  );
  observer.observe(latestPanel);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
    else if (inView) load();
  });
  window.addEventListener("pagehide", clear);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && inView) load();
  });
}

// Let the browser animate complete panels, then release snapping while reading
// overflow. WebKit can pin wheel input at the start of an oversized snap area.
// Native scrolling remains the only input path: no touch/wheel cancellation.
const cardPanel = document.getElementById("card");
if (cardPanel && latestPanel) {
  let snapFrame;
  const updatePanelSnap = () => {
    snapFrame = undefined;
    const viewport = document.documentElement.clientHeight;
    const card = cardPanel.getBoundingClientRect();
    const latest = latestPanel.getBoundingClientRect();
    const overflowingLatest = latest.height > viewport + 1 && latest.top <= 2;
    document.documentElement.classList.toggle(
      "panel-snap",
      card.height <= viewport + 1 && !overflowingLatest,
    );
  };
  const schedulePanelSnap = () => {
    if (snapFrame === undefined)
      snapFrame = requestAnimationFrame(updatePanelSnap);
  };
  const panelSizes = new ResizeObserver(schedulePanelSnap);
  panelSizes.observe(cardPanel);
  panelSizes.observe(latestPanel);
  addEventListener("scroll", schedulePanelSnap, { passive: true });
  addEventListener("resize", schedulePanelSnap);
  visualViewport?.addEventListener("resize", schedulePanelSnap);
  updatePanelSnap();
}
