# Investigation: `normalize-path` vs `path.normalize` in Chokidar

## Context

In `chokidar` (`index.js`), the following line appears:

```javascript
// TODO: this is not equal to path-normalize module - investigate why
const sysPath = require("path");
```

This investigation analyzes why `chokidar` uses the `normalize-path` package rather than Node.js's native `path.normalize` (or the `path-normalize` module) and details the technical differences between their path normalization logic.

---

## Technical Comparison Matrix

| Feature / Behavior              | `normalize-path`                                                                   | Native `path.normalize` / `path-normalize`                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Slash Direction**             | Always converts backslashes (`\`) to POSIX forward slashes (`/`).                  | Converts slashes to platform-native separators (on Windows: `\`).                                        |
| **Dot Segments (`.` and `..`)** | Preserves relative dot segments (`foo/bar/../baz` $\rightarrow$ `foo/bar/../baz`). | Resolves relative dot segments (`foo/bar/../baz` $\rightarrow$ `foo/baz`).                               |
| **Leading `./` Prefix**         | Preserves leading `./` prefixes (`./foo/bar` $\rightarrow$ `./foo/bar`).           | Strips redundant leading `./` (`./foo/bar` $\rightarrow$ `foo/bar`).                                     |
| **Trailing Slash**              | Strips trailing slashes by default (`foo/bar/` $\rightarrow$ `foo/bar`).           | Preserves trailing slashes if present (`foo/bar/` $\rightarrow$ `foo/bar/`).                             |
| **Multiple Slashes**            | Collapses redundant slashes to single forward slash (`a//b` $\rightarrow$ `a/b`).  | Collapses redundant slashes to single platform-native separator (`a//b` $\rightarrow$ `a\b` on Windows). |

---

## Detailed Behavioral Differences

### 1. Cross-Platform Slash Consistency

`normalize-path` transforms all backslashes `\` into forward slashes `/` across all operating systems. On Windows, Node's `path.win32.normalize` produces backslash-separated paths (`C:\path\to\file`).

### 2. Dot Segment Preservation

Native `path.normalize` evaluates parent directory traversals (`..`) and current directory references (`.`). `normalize-path` treats path strings as literal patterns and does not alter segment hierarchy.

### 3. Leading Relative Path Indicators

`normalize-path` retains `./` at the start of relative paths. Native `path.normalize` strips `./` because `foo/bar` and `./foo/bar` resolve to the same filesystem location.

---

## Architectural Rationale for Chokidar

1. **Glob Engine Compatibility (`picomatch` / `anymatch`)**
   Chokidar uses `picomatch` for glob pattern matching. Glob engines require POSIX forward slashes (`/`). If paths on Windows were normalized using `path.win32.normalize`, backslashes (`\`) would break glob matching and cause watch filters to fail.

2. **Preservation of Watch Event Identities**
   File watchers match raw event paths against target watch paths. Resolving `..` or stripping `./` prematurely can cause path mismatch between watch declarations and emitted events.

3. **Unified Cross-Platform Interface**
   Using `normalize-path` ensures file paths reported by Chokidar events are deterministic and structured identically across Windows, macOS, and Linux.

---

## Summary & Upstream Recommendation

The TODO in Chokidar highlights a deliberate behavioral difference rather than a defect. `normalize-path` cannot be replaced by `path.normalize` or `path-normalize` because Chokidar specifically requires POSIX-style slash normalization without dot-segment resolution for glob matching and cross-platform path consistency.
