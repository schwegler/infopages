# Investigation: `chokidar` Path Normalization Logic (`normalize-path` vs `path-normalize`)

## Context

In `node_modules/chokidar/index.js`, the package requires `normalize-path` and includes the following TODO comment:

```javascript
// TODO: this is not equal to path-normalize module - investigate why
const sysPath = require("path");
```

This document investigates the behavioral differences between `normalize-path` and `path-normalize` / `path.normalize`, explains why `chokidar` uses `normalize-path`, and outlines the maintenance rationale.

---

## Technical Comparison

| Feature / Behavior                 | `normalize-path`                                                                          | `path-normalize` / `path.normalize`                                                      |
| :--------------------------------- | :---------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **Directory Separators**           | Converts Windows backslashes (`\`) to POSIX forward slashes (`/`).                        | Converts separators based on OS (`\` on Windows, `/` on POSIX).                          |
| **Relative Segments (`.` / `..`)** | **Preserves** relative navigation dot segments (`foo/bar/../baz` stays `foo/bar/../baz`). | **Resolves & canonicalizes** relative dot segments (`foo/bar/../baz` becomes `foo/baz`). |
| **Leading Prefix (`./`)**          | Preserves leading `./` prefixes.                                                          | Strips leading `./` prefixes.                                                            |
| **Trailing Slashes**               | Strips trailing slashes by default (except for root path `/`).                            | Strips trailing slashes during segment collapse.                                         |
| **UNC & Double Slashes (`//`)**    | Preserves leading double slashes for UNC network paths.                                   | Normalizes leading double slashes according to OS path rules.                            |

---

## Why `chokidar` Uses `normalize-path`

1. **Glob Matching Compatibility (`picomatch`)**:
   `chokidar` uses `picomatch` to match file paths against watch glob patterns. Glob specs strictly require POSIX forward slashes (`/`), even on Windows platforms.
2. **Preserving User Watch Paths**:
   `chokidar` monitors paths provided by the user. Automatically resolving `.` or `..` segments or stripping `./` prefixes can alter relative watch path keys or break pattern matching across sub-trees monitored by `readdirp`.
3. **Performance**:
   `normalize-path` uses lightweight string manipulation (backslash replacing and trailing slash trimming) rather than full path parsing, avoiding computational overhead during high-volume file system events.

---

## Conclusion and Recommendations

- **Upstream Scope**: The comment is an internal maintainer TODO in the `chokidar` upstream repository.
- **Do Not Modify `node_modules`**: Modifying code directly in `node_modules` is an anti-pattern because any manual changes are ephemeral and overwritten when running `npm install`, `npm ci`, or package updates. Any proposed changes to `chokidar`'s normalization behavior must be submitted and addressed in the upstream `chokidar` repository.
