import { XMLParser, XMLValidator } from "../../vendor/profile-xml.mjs";
// Public, anonymous, fixed-source projection. No cookies, storage or stale fallback.
const BLOG =
  "https://tacobout.online/wp-json/wp/v2/posts?per_page=2&orderby=date&order=desc&_fields=id,status,date_gmt,link,title,excerpt";
const FEED = "https://bsky.app/profile/did:plc:djguxreovfe4bkm7sizg2kxk/rss";
const PROFILE = "https://trove.schweg.xyz/@schwegler";
const security = {
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Cloudflare-CDN-Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
};
function reply(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...security, "Content-Type": "application/json; charset=utf-8" },
  });
}
async function upstream(url, type, limit = 768000, coverRedirect = false) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "omit",
    redirect: "manual",
    cache: "no-store",
    // `image/` is a response-type prefix, not a valid HTTP Accept media range.
    headers: {
      Accept: type === "image/" ? "image/*" : type,
      "Cache-Control": "no-cache",
    },
    signal: AbortSignal.timeout(5000),
  });
  if (coverRedirect && [301, 302, 303, 307, 308].includes(response.status)) {
    const target = new URL(response.headers.get("location") || "", url);
    if (
      target.origin !== "https://trove.schweg.xyz" ||
      target.username ||
      target.password ||
      target.search ||
      !/^\/rails\/active_storage\/blobs\/proxy\/[A-Za-z0-9._~%/=-]+$/.test(
        target.pathname,
      )
    )
      throw new Error("Unexpected cover redirect");
    await response.body?.cancel();
    return upstream(target.href, type, limit, false);
  }
  if (
    !response.ok ||
    !(
      response.headers.get("content-type")?.includes(type) ||
      (type === "application/rss+xml" &&
        /^(application|text)\/xml(?:;|$)/i.test(
          response.headers.get("content-type") || "",
        ))
    )
  )
    throw new Error("Unavailable public source");
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error("Public source exceeds limit");
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel();
    throw error;
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new Response(bytes, {
    headers: { "Content-Type": response.headers.get("content-type") },
  });
}
function clean(value, limit = 240) {
  if (typeof value !== "string") return "";
  const entities = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    rsquo: "’",
    lsquo: "‘",
    rdquo: "”",
    ldquo: "“",
    hellip: "…",
  };
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (whole, key) => {
      if (key[0] !== "#") return entities[key] ?? whole;
      const code =
        key[1].toLowerCase() === "x"
          ? parseInt(key.slice(2), 16)
          : Number(key.slice(1));
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
        ? String.fromCodePoint(code)
        : "";
    })
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}
function safeURL(value, origin, path) {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value, origin);
    return url.origin === origin &&
      !url.username &&
      !url.password &&
      path.test(url.pathname)
      ? url.origin + url.pathname
      : null;
  } catch {
    return null;
  }
}
async function posts() {
  const data = await (await upstream(BLOG, "application/json")).json();
  if (!Array.isArray(data)) throw new Error("Invalid public posts");
  return data.slice(0, 2).flatMap((post) => {
    const url = safeURL(
      post.link,
      "https://tacobout.online",
      /^\/(?!wp-|wp\/).+/,
    );
    const title = clean(post.title?.rendered);
    const date = new Date(post.date_gmt + "Z");
    if (
      post.status !== "publish" ||
      post.excerpt?.protected ||
      !url ||
      !title ||
      !Number.isFinite(date.getTime())
    )
      return [];
    return [
      {
        title,
        url,
        date: date.toISOString(),
        excerpt: clean(post.excerpt?.rendered, 180),
      },
    ];
  });
}
async function bluesky() {
  const xml = await (await upstream(FEED, "application/rss+xml")).text();
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true)
    throw new Error("Invalid public feed");
  const parser = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false,
    processEntities: false,
  });
  const entries = parser.parse(xml)?.rss?.channel?.item;
  const items = entries ? (Array.isArray(entries) ? entries : [entries]) : [];
  if (!items.length || items.length > 100) return null;
  // RSS may put an older pinned entry first. Newest means publication time,
  // with no author/reply/original-post filtering and no fallback to an older item.
  const dated = items.map((item) => ({ item, date: new Date(item.pubDate) }));
  if (dated.some((entry) => !Number.isFinite(entry.date.getTime())))
    return null;
  dated.sort((a, b) => b.date - a.date);
  const { item, date } = dated[0];
  const url = safeURL(
    item.link,
    "https://bsky.app",
    /^\/profile\/[^/]+\/post\/[a-zA-Z0-9]+$/,
  );
  if (!url) return null;
  return { url, date: date.toISOString(), text: clean(item.description, 1600) };
}
async function recent() {
  const response = await upstream(PROFILE, "text/html");
  let seen = false,
    active = false;
  const item = { title: "", type: "", year: "", url: null, coverPath: null };
  const rewriter = new HTMLRewriter()
    .on(".profile-recent .profile-media-entry", {
      element(element) {
        active = !seen;
        seen = true;
        if (active)
          element.onEndTag(() => {
            active = false;
          });
      },
    })
    .on(".profile-recent .profile-media-entry .profile-cover", {
      element(element) {
        if (!active || item.url) return;
        item.url = safeURL(
          element.getAttribute("href"),
          "https://trove.schweg.xyz",
          /^\/(movies|albums|comics|tv_shows|tv_episodes|video_games|books)\/[1-9]\d*(?:-[a-z0-9-]+)?\/?$/,
        );
        item.title = clean(element.getAttribute("aria-label"));
      },
    })
    .on(".profile-recent .profile-media-entry .profile-cover img", {
      element(element) {
        if (!active) return;
        const cover = safeURL(
          element.getAttribute("src"),
          "https://trove.schweg.xyz",
          /^\/media\/covers\/(movie|album|comic|tv_show|tv_episode|video_game|book)\/[1-9]\d*$/,
        );
        if (cover) item.coverPath = new URL(cover).pathname;
      },
    })
    .on(".profile-recent .profile-media-entry .profile-entry-type", {
      text(chunk) {
        if (active) item.type += chunk.text;
      },
    })
    .on(".profile-recent .profile-media-entry .profile-entry-year", {
      text(chunk) {
        if (active) item.year += chunk.text;
      },
    });
  await rewriter.transform(response).arrayBuffer();
  if (!seen || !item.url || !item.title) return null;
  return {
    title: item.title,
    url: item.url,
    type: clean(item.type, 30),
    year: /^\d{4}$/.test(item.year.trim()) ? item.year.trim() : "",
    coverPath: item.coverPath,
  };
}
export async function onRequest({ request }) {
  if (request.method !== "GET")
    return reply({ error: "Method not allowed" }, 405);
  const url = new URL(request.url);
  if (
    [...url.searchParams.keys()].some((key) => key !== "cover") ||
    url.searchParams.getAll("cover").length > 1
  )
    return reply({ error: "Invalid request" }, 400);
  if (url.searchParams.has("cover")) {
    const key = url.searchParams.get("cover");
    if (
      !/^(movie|album|comic|tv_show|tv_episode|video_game|book)\/[1-9]\d*$/.test(
        key,
      )
    )
      return reply({ error: "Invalid cover" }, 400);
    try {
      // Every cover use revalidates the current anonymous owner-profile entry.
      const item = await recent();
      if (item?.coverPath !== "/media/covers/" + key)
        return reply({ error: "Cover unavailable" }, 404);
      const image = await upstream(
        "https://trove.schweg.xyz" + item.coverPath + "?width=360",
        "image/",
        2000000,
        true,
      );
      const type = image.headers.get("content-type");
      if (!/^image\/(jpeg|png|webp|avif)(?:;|$)/i.test(type))
        return reply({ error: "Cover unavailable" }, 404);
      return new Response(image.body, {
        headers: { ...security, "Content-Type": type },
      });
    } catch {
      return reply({ error: "Cover unavailable" }, 404);
    }
  }
  const [blog, trove, feed] = await Promise.allSettled([
    posts(),
    recent(),
    bluesky(),
  ]);
  let item = trove.status === "fulfilled" ? trove.value : null;
  if (item) {
    const { coverPath, ...fields } = item;
    item = {
      ...fields,
      cover: coverPath
        ? "/api/profile-latest?cover=" +
          encodeURIComponent(coverPath.slice("/media/covers/".length))
        : null,
    };
  }
  return reply({
    posts: blog.status === "fulfilled" ? blog.value.slice(0, 1) : null,
    trove: item,
    bluesky: feed.status === "fulfilled" ? feed.value : null,
    checkedAt: new Date().toISOString(),
  });
}
