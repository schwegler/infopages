import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import os from "node:os";

const require = createRequire(import.meta.url);
const fseventsHandler = require("../node_modules/chokidar/lib/fsevents-handler.js");

test("fsevents-handler correctly calculates isMacos with real check", () => {
  const expectedIsMacos =
    process.platform === "darwin" && os.type() === "Darwin";
  assert.strictEqual(fseventsHandler.isMacos, expectedIsMacos);
  assert.strictEqual(typeof fseventsHandler.isMacos, "boolean");
});
