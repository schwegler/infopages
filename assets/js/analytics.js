import { installPublicAnalytics } from "./public-analytics.js";

// Approved GA-only CSP and sanitized event contract. Collection still requires
// explicit visitor consent on an allowlisted public page.
export const PUBLIC_ANALYTICS_ENABLED = true;
const pages = {
  "/": ["/", "Résumé", "home", "portfolio"],
  "/index.html": ["/", "Résumé", "home", "portfolio"],
  "/work": ["/work", "Projects", "archive", "portfolio"],
  "/resume": ["/resume", "Résumé", "article", "portfolio"],
  "/sqlhttp": ["/sqlhttp", "SQL API guide", "article", "technical"],
  "/sqlmovebuffy": [
    "/sqlmovebuffy",
    "SQL migration guide",
    "article",
    "technical",
  ],
  "/bsky_mutual_blocks": [
    "/bsky_mutual_blocks",
    "Bluesky graph tool",
    "article",
    "technical",
  ],
  "/hollyoaks_history": [
    "/hollyoaks_history",
    "Hollyoaks history",
    "article",
    "culture",
  ],
  "/tna_history": ["/tna_history", "Wrestling history", "article", "culture"],
  "/gay_bar_closures": [
    "/gay_bar_closures",
    "Bar closures",
    "article",
    "culture",
  ],
  "/five_pm_cat_club": ["/five_pm_cat_club", "Cat club", "article", "culture"],
};
installPublicAnalytics({
  enabled: PUBLIC_ANALYTICS_ENABLED,
  id: "G-SQQ11FT8VW",
  origin: "https://schweg.xyz",
  storageKey: "schweg.analytics-consent.v1",
  page() {
    const path =
      location.pathname === "/index.html"
        ? "/index.html"
        : location.pathname.replace(/\.html$/, "");
    const page = pages[path];
    return (
      page && { path: page[0], title: page[1], type: page[2], group: page[3] }
    );
  },
});
