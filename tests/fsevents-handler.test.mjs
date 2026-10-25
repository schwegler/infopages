import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const FsEventsHandler = require("../node_modules/chokidar/lib/fsevents-handler.js");

test("fsevents-handler exports FsEventsHandler and canUse function", () => {
  assert.strictEqual(typeof FsEventsHandler, "function");
  assert.strictEqual(typeof FsEventsHandler.canUse, "function");
  assert.strictEqual(typeof FsEventsHandler.canUse(), "boolean");
});

test("fsevents canUse respects the platform and native availability", async () => {
  const { readFileSync } = await import("node:fs");
  const { runInNewContext } = await import("node:vm");
  const handlerUrl = new URL(
    "../node_modules/chokidar/lib/fsevents-handler.js",
    import.meta.url,
  );
  const handlerRequire = createRequire(handlerUrl);
  const source = readFileSync(handlerUrl, "utf8");
  const canUse = (platform, fsevents) => {
    const context = {
      module: { exports: {} },
      process: { platform, versions: process.versions, env: {} },
      require: (name) =>
        name === "fsevents" ? fsevents : handlerRequire(name),
    };
    runInNewContext(source, context);
    return context.module.exports.canUse();
  };

  assert.equal(canUse("linux", { canBeUsed: () => true }), false);
  assert.equal(canUse("darwin", { canBeUsed: () => true }), true);
  assert.equal(canUse("darwin", { canBeUsed: () => false }), false);
  assert.equal(canUse("darwin", undefined), false);
});
