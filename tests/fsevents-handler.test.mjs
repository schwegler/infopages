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
