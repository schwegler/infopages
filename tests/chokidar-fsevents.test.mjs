import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";

class MockFSWatcher extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = { persistent: true, useFsEvents: true, ...options };
    this._readyCount = 0;
    this.readyCalls = 0;
    this.isReady = false;
  }

  _isIgnored(path) {
    return path.includes("ignored");
  }

  _emitReady() {
    this.readyCalls++;
    if (this.readyCalls >= this._readyCount && !this.isReady) {
      this.isReady = true;
      this.emit("ready");
    }
  }

  add(paths) {
    const arr = Array.isArray(paths) ? paths : [paths];
    if (this.options.useFsEvents) {
      this._readyCount = arr.length;
      if (this.options.persistent) this._readyCount *= 2;
      arr.forEach((p) => this._addToFsEvents(p));
    }
  }

  _addToFsEvents(path) {
    if (this._isIgnored(path)) {
      // Clean solution: Adjust _readyCount for skipped _watchWithFsEvents and emit ready ONCE
      if (this.options.persistent) this._readyCount--;
      return this._emitReady();
    }
    this._emitReady();
    this._watchWithFsEvents(path);
  }

  _watchWithFsEvents(path) {
    this._emitReady();
  }
}

test("should not choke on an ignored watch path with single ready emission and readyCount adjustment", async (t) => {
  const watcher = new MockFSWatcher({ persistent: true, useFsEvents: true });

  let readyFired = false;
  watcher.on("ready", () => {
    readyFired = true;
  });

  watcher.add("/some/ignored/path");

  assert.equal(
    readyFired,
    true,
    "ready event should fire for ignored watch path",
  );
  assert.equal(watcher.isReady, true, "isReady property should be true");
  assert.equal(
    watcher.readyCalls,
    1,
    "readyCalls should be exactly 1 after _readyCount adjustment",
  );
  assert.equal(
    watcher._readyCount,
    1,
    "adjusted _readyCount should be 1 for single emission",
  );
});

test("normal watch path completes 2 ready calls across stat and stream setup", async (t) => {
  const watcher = new MockFSWatcher({ persistent: true, useFsEvents: true });

  let readyFired = false;
  watcher.on("ready", () => {
    readyFired = true;
  });

  watcher.add("/some/valid/path");

  assert.equal(
    readyFired,
    true,
    "ready event should fire for valid watch path",
  );
  assert.equal(watcher.isReady, true, "isReady property should be true");
  assert.equal(watcher.readyCalls, 2, "readyCalls should equal 2");
});
