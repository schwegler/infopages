# Chokidar FSEvents Handler: Ignored Watch Path Double Ready Emission

## Context

In `node_modules/chokidar/lib/fsevents-handler.js` (around line 503 / line 342 in v2):

```javascript
  fs[wh.statMethod](wh.watchPath, function (error, stats) {
    if (this._handleError(error) || this._isIgnored(wh.watchPath, stats)) {
      this._emitReady();
      return this._emitReady();
    }
```

And in `node_modules/chokidar/index.js` (around line 706):

```javascript
if (this.options.useFsEvents && FsEventsHandler.canUse()) {
  if (!this._readyCount) this._readyCount = paths.length;
  if (this.options.persistent) this._readyCount *= 2;
  paths.forEach(this._addToFsEvents, this);
}
```

## Root Cause Analysis

1. **`_readyCount` Multiplication**:
   When FSEvents is enabled in persistent mode, `FSWatcher.prototype.add` initializes `this._readyCount = paths.length * 2`.
   Each watched path is expected to emit `this._emitReady()` twice during normal initialization:
   - **First emission**: In `_addToFsEvents` after `fs.stat` / `readdirp` completes initial file discovery.
   - **Second emission**: In `_watchWithFsEvents` after the persistent FSEvents listener stream is attached.

2. **Skipping `_watchWithFsEvents` for Ignored Paths**:
   When `_addToFsEvents` checks `this._isIgnored(wh.watchPath, stats)` and discovers that the watch path is ignored:
   - It returns early to avoid scanning or watching the ignored directory/file.
   - Because it returns early, `_watchWithFsEvents` is **never called** for that path, so its second `this._emitReady()` call would never execute under normal control flow.

3. **Why Two Ready Calls Were Required**:
   Since `this._readyCount` was already incremented expecting **two** ready calls per path (one for initial stat/scan, one for FSEvents stream binding), the early return for ignored paths must invoke `this._emitReady()` twice. Calling it once would leave `this._readyCount` under-decremented by 1, causing the watcher to hang and fail the test `'should not choke on an ignored watch path'`.

## Architecture Fix / Recommendation

To avoid duplicate calls to `_emitReady()` when handling ignored paths, `FSWatcher` should adjust `_readyCount` based on whether FSEvents watching will actually be initialized:

1. **Check ignored status before setting `_readyCount`**: Evaluate `_isIgnored` prior to multiplying `_readyCount` by 2 in `FSWatcher.prototype.add`.
2. **Explicit count adjustment**: If an ignored path returns early in `_addToFsEvents`, decrement `_readyCount` by 1 and call `_emitReady()` once, ensuring clean single-emission semantics per lifecycle phase.
