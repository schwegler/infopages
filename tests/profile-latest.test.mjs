import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { build } from "esbuild";
import { Miniflare } from "miniflare";

const bundle = await build({
  stdin: {
    contents:
      'import {onRequest} from "./functions/api/profile-latest.js"; export default {fetch(request){return onRequest({request});}}',
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  format: "esm",
  platform: "browser",
  target: "es2022",
});
const profile = `<section class="profile-recent"><article class="profile-media-entry"><a class="profile-cover" href="/books/12-public-title" aria-label="Public &amp; recent"><img src="/media/covers/book/12"></a><p class="profile-entry-type">Book</p><p class="profile-entry-year">2026</p></article><article class="profile-media-entry"><a class="profile-cover" href="/books/11-older" aria-label="Older"><img src="/media/covers/book/11"></a></article></section><section class="activities-feed">DO_NOT_PROJECT_PRIVATE_PROGRESS_OR_ACTIVITY</section>`;
const rss = (latest = "New feed entry", id = "newest", day = "23") =>
  `<rss version="2.0"><channel><item><link>https://bsky.app/profile/schwegler.lol/post/pinned</link><description>Pinned older entry</description><pubDate>22 Oct 2026 12:00 +0000</pubDate></item><item><link>https://bsky.app/profile/schwegler.lol/post/${id}</link><description>${latest}</description><pubDate>${day} Oct 2026 15:00 +0000</pubDate></item></channel></rss>`;
function runtime(t, state = {}) {
  const calls = [];
  const mf = new Miniflare({
    modules: true,
    script: bundle.outputFiles[0].text,
    compatibilityDate: "2026-08-01",
    outboundService: async (request) => {
      const url = new URL(request.url);
      calls.push(url.href);
      assert.equal(request.headers.get("cookie"), null);
      assert.equal(request.headers.get("authorization"), null);
      assert.equal(request.headers.get("cache-control"), "no-cache");
      if (url.hostname === "tacobout.online")
        return new Response(
          JSON.stringify([
            {
              status: "publish",
              date_gmt: "2026-10-23T12:00:00",
              link: "https://tacobout.online/2026/10/23/public/",
              title: { rendered: "A public article" },
              excerpt: { rendered: "<p>Public excerpt.</p>", protected: false },
            },
          ]),
          { headers: { "content-type": "application/json" } },
        );
      if (url.hostname === "bsky.app")
        return new Response(state.rss ?? rss(), {
          status: state.rssStatus ?? 200,
          headers: { "content-type": "application/xml" },
        });
      assert.equal(url.hostname, "trove.schweg.xyz");
      if (url.pathname === "/@schwegler")
        return new Response(state.profile ?? profile, {
          status: state.profileStatus ?? 200,
          headers: {
            "content-type": "text/html",
            "cache-control": "private, no-store",
            "set-cookie": "upstream-session=never-forward",
          },
        });
      // Rails content negotiation returns 406 for malformed `Accept: image/`.
      // The valid wildcard must survive both the cover route and blob hop.
      assert.equal(request.headers.get("accept"), "image/*");
      if (url.pathname === "/media/covers/book/12") {
        assert.equal(url.search, "?width=360");
        return new Response(null, {
          status: 302,
          headers: {
            location:
              state.coverRedirect ||
              "https://trove.schweg.xyz/rails/active_storage/blobs/proxy/public-token==/cover.jpg",
          },
        });
      }
      assert.equal(
        url.pathname,
        "/rails/active_storage/blobs/proxy/public-token==/cover.jpg",
      );
      return new Response(new Uint8Array([255, 216, 255, 217]), {
        headers: { "content-type": "image/jpeg" },
      });
    },
  });
  t.after(() => mf.dispose());
  return { mf, calls };
}

test("projects only fixed anonymous public sources and chooses newest RSS timestamp rather than pinned order", async (t) => {
  const { mf, calls } = runtime(t);
  const response = await mf.dispatchFetch(
    "https://schweg.xyz/api/profile-latest",
    {
      headers: {
        cookie: "private=do-not-forward",
        authorization: "Bearer do-not-forward",
      },
    },
  );
  const data = await response.json();
  assert.equal(data.posts.length, 1);
  assert.equal(data.trove.title, "Public & recent");
  assert.equal(
    data.trove.url,
    "https://trove.schweg.xyz/books/12-public-title",
  );
  assert.equal(data.trove.cover, "/api/profile-latest?cover=book%2F12");
  assert.equal(data.bluesky.text, "New feed entry");
  assert.match(data.bluesky.url, /\/newest$/);
  assert(!JSON.stringify(data).includes("DO_NOT_PROJECT"));
  assert(!JSON.stringify(data).includes("Older"));
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(calls.length, 3);
  assert(calls.includes("https://trove.schweg.xyz/@schwegler"));
  assert(
    calls.includes(
      "https://bsky.app/profile/did:plc:djguxreovfe4bkm7sizg2kxk/rss",
    ),
  );
});

test("privacy retraction and RSS updates are revalidated with no stale fallback", async (t) => {
  const state = {};
  const { mf } = runtime(t, state);
  let data = await (
    await mf.dispatchFetch("https://schweg.xyz/api/profile-latest")
  ).json();
  assert(data.trove);
  state.profileStatus = 404;
  state.rss = rss("A newer public post", "changed", "24");
  data = await (
    await mf.dispatchFetch("https://schweg.xyz/api/profile-latest")
  ).json();
  assert.equal(data.trove, null);
  assert.equal(data.bluesky.text, "A newer public post");
  assert.match(data.bluesky.url, /\/changed$/);
  const cover = await mf.dispatchFetch(
    "https://schweg.xyz/api/profile-latest?cover=book%2F12",
  );
  assert.equal(cover.status, 404);
  assert.match(cover.headers.get("cache-control"), /no-store/);
  state.rssStatus = 503;
  data = await (
    await mf.dispatchFetch("https://schweg.xyz/api/profile-latest")
  ).json();
  assert.equal(data.bluesky, null);
  assert.equal(data.trove, null);
});

test("cover access is limited to the fresh first public profile entry; arbitrary proxying is rejected", async (t) => {
  const state = {};
  const { mf, calls } = runtime(t, state);
  const cover = await mf.dispatchFetch(
    "https://schweg.xyz/api/profile-latest?cover=book%2F12",
  );
  assert.equal(cover.status, 200);
  assert.equal(cover.headers.get("content-type"), "image/jpeg");
  assert.match(cover.headers.get("cache-control"), /no-store/);
  assert.equal(calls.length, 3);
  const older = await mf.dispatchFetch(
    "https://schweg.xyz/api/profile-latest?cover=book%2F11",
  );
  assert.equal(older.status, 404);
  state.coverRedirect = "https://untrusted.example/cover.jpg";
  assert.equal(
    (
      await mf.dispatchFetch(
        "https://schweg.xyz/api/profile-latest?cover=book%2F12",
      )
    ).status,
    404,
  );
  state.coverRedirect = "https://trove.schweg.xyz/private-path";
  assert.equal(
    (
      await mf.dispatchFetch(
        "https://schweg.xyz/api/profile-latest?cover=book%2F12",
      )
    ).status,
    404,
  );
  const before = calls.length;
  for (const query of [
    "cover=https%3A%2F%2Fevil.example",
    "url=https%3A%2F%2Fevil.example",
    "cover=book%2F12&cover=book%2F11",
  ])
    assert.equal(
      (await mf.dispatchFetch("https://schweg.xyz/api/profile-latest?" + query))
        .status,
      400,
    );
  assert.equal(calls.length, before);
  assert.equal(
    (
      await mf.dispatchFetch("https://schweg.xyz/api/profile-latest", {
        method: "POST",
      })
    ).status,
    405,
  );
});

test("malformed/DTD feeds and non-public profile shapes fail closed rather than falling back to activity", async (t) => {
  const state = {
    profile:
      '<section class="activities-feed">private fallback title</section>',
    rss: '<!DOCTYPE rss [<!ENTITY secret SYSTEM "file:///etc/passwd">]><rss><channel/></rss>',
  };
  const { mf } = runtime(t, state);
  const data = await (
    await mf.dispatchFetch("https://schweg.xyz/api/profile-latest")
  ).json();
  assert.equal(data.trove, null);
  assert.equal(data.bluesky, null);
  assert.equal(data.posts.length, 1);
});

test("invalid or path-traversing coverPath shapes are rejected and yield null cover property", async (t) => {
  const malformedProfile = `<section class="profile-recent"><article class="profile-media-entry"><a class="profile-cover" href="/books/12-public-title" aria-label="Public &amp; recent"><img src="/media/covers/../../etc/passwd"></a><p class="profile-entry-type">Book</p><p class="profile-entry-year">2026</p></article></section>`;
  const state = { profile: malformedProfile };
  const { mf } = runtime(t, state);
  const data = await (
    await mf.dispatchFetch("https://schweg.xyz/api/profile-latest")
  ).json();
  assert(data.trove);
  assert.equal(data.trove.cover, null);
});

test("only the single public endpoint invokes a Pages Function", () => {
  assert.deepEqual(JSON.parse(readFileSync("_routes.json", "utf8")), {
    version: 1,
    include: ["/api/profile-latest"],
    exclude: [],
  });
});

test("Pages can bundle the Function without installing any npm runtime package", async () => {
  const result = await build({
    entryPoints: ["functions/api/profile-latest.js"],
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    packages: "external",
    metafile: true,
  });
  assert(
    Object.values(result.metafile.outputs).every(
      (output) => output.imports.length === 0,
    ),
  );
  assert(!result.outputFiles[0].text.includes('from "fast-xml-parser"'));
});
