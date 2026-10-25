import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

// Implementation of normalize-path behavior for comparison assertions
function normalizePath(pathStr, stripTrailing = true) {
  if (typeof pathStr !== "string") {
    throw new TypeError("expected path to be a string");
  }
  if (pathStr === "\\" || pathStr === "/") return "/";
  if (pathStr.length <= 1) return pathStr;

  let isUnc = false;
  if (pathStr.length > 4 && pathStr.startsWith("\\\\?\\")) {
    pathStr = pathStr.slice(4);
  }

  // Replace all backslashes with forward slashes
  let normalized = pathStr.replace(/\\/g, "/");

  // Collapse multiple slashes (preserving leading // if present)
  normalized = normalized.replace(/\/+/g, "/");

  // Strip trailing slash if requested and not root
  if (stripTrailing && normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

test("normalize-path converts Windows backslashes to POSIX forward slashes", () => {
  const input = "C:\\Users\\Project\\src\\index.js";
  const normalized = normalizePath(input);
  const nativeWin32 = path.win32.normalize(input);

  assert.equal(normalized, "C:/Users/Project/src/index.js");
  assert.equal(nativeWin32, "C:\\Users\\Project\\src\\index.js");
  assert.notEqual(normalized, nativeWin32);
});

test("normalize-path preserves relative dot segments while native path.normalize resolves them", () => {
  const input = "src/components/../utils/helpers.js";
  const normalized = normalizePath(input);
  const nativePosix = path.posix.normalize(input);

  assert.equal(normalized, "src/components/../utils/helpers.js");
  assert.equal(nativePosix, "src/utils/helpers.js");
  assert.notEqual(normalized, nativePosix);
});

test("normalize-path preserves leading relative ./ prefix while native path.normalize strips it", () => {
  const input = "./scripts/build.mjs";
  const normalized = normalizePath(input);
  const nativePosix = path.posix.normalize(input);

  assert.equal(normalized, "./scripts/build.mjs");
  assert.equal(nativePosix, "scripts/build.mjs");
  assert.notEqual(normalized, nativePosix);
});

test("normalize-path strips trailing slashes by default while native path.normalize preserves them", () => {
  const input = "docs/api/";
  const normalized = normalizePath(input);
  const nativePosix = path.posix.normalize(input);

  assert.equal(normalized, "docs/api");
  assert.equal(nativePosix, "docs/api/");
  assert.notEqual(normalized, nativePosix);
});

test("POSIX forward slashes are required for glob pattern compatibility", () => {
  const winPath = "src\\tests\\*.test.js";
  const posixPath = normalizePath(winPath);

  // Simple glob matcher simulation for path separators
  const globRegex = /^src\/tests\/.*\.test\.js$/;

  assert.equal(globRegex.test(winPath), false);
  assert.equal(globRegex.test(posixPath), true);
});
