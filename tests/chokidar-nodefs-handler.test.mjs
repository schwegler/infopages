import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import NodeFsHandler from "../node_modules/chokidar/lib/nodefs-handler.js";

test("NodeFsHandler handles EMFILE error properly during _watchWithNodeFs", (t) => {
  const originalWatch = fs.watch;
  t.after(() => {
    fs.watch = originalWatch;
  });

  let emittedError = null;

  const mockFsW = {
    options: { persistent: true },
    _getWatchedDir: () => new Set(),
    _emitRaw: () => {},
    _handleError: (err) => {
      emittedError = err;
      return err;
    },
  };

  const handler = new NodeFsHandler(mockFsW);

  // Mock fs.watch to throw an EMFILE error
  const emfileError = new Error("EMFILE: too many open files, watch");
  emfileError.code = "EMFILE";
  fs.watch = () => {
    throw emfileError;
  };

  const closer = handler._watchWithNodeFs("/fake/path", () => {});

  assert.equal(
    emittedError,
    emfileError,
    "EMFILE error should be passed to _handleError",
  );
  assert.equal(
    typeof closer,
    "function",
    "A closer function should always be returned",
  );
  assert.doesNotThrow(() => closer(), "Invoking closer should not throw");
});

test("NodeFsHandler handles non-persistent watcher failure gracefully", (t) => {
  const originalWatch = fs.watch;
  t.after(() => {
    fs.watch = originalWatch;
  });

  let emittedError = null;

  const mockFsW = {
    options: { persistent: false },
    _getWatchedDir: () => new Set(),
    _emitRaw: () => {},
    _handleError: (err) => {
      emittedError = err;
      return err;
    },
  };

  const handler = new NodeFsHandler(mockFsW);

  const emfileError = new Error("EMFILE: too many open files, watch");
  emfileError.code = "EMFILE";
  fs.watch = () => {
    throw emfileError;
  };

  const closer = handler._watchWithNodeFs("/fake/path", () => {});

  assert.equal(
    emittedError,
    emfileError,
    "EMFILE error should be passed to _handleError",
  );
  assert.equal(
    typeof closer,
    "function",
    "A safe closer function should be returned for non-persistent watchers",
  );
  assert.doesNotThrow(() => closer(), "Invoking closer should not throw");
});
