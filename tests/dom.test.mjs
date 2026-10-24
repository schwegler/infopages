import test from "node:test";
import assert from "node:assert/strict";

class MockElement {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.textContent = "";
    this.className = "";
    this.attributes = new Map();
    this.children = [];
  }

  setAttribute(key, value) {
    this.attributes.set(key, value);
  }

  getAttribute(key) {
    return this.attributes.get(key) || null;
  }

  append(...nodes) {
    this.children.push(...nodes);
  }
}

globalThis.document = {
  createElement: (tag) => new MockElement(tag),
};

import { element } from "../assets/js/dom.js";

test("element creates a DOM element with tag name only", () => {
  const node = element("div");
  assert.equal(node.tagName, "DIV");
  assert.equal(node.textContent, "");
  assert.equal(node.className, "");
});

test("element sets text content when provided", () => {
  const node = element("p", "Hello world");
  assert.equal(node.tagName, "P");
  assert.equal(node.textContent, "Hello world");
  assert.equal(node.className, "");
});

test("element sets class name when provided", () => {
  const node = element("span", "Badge", "badge primary");
  assert.equal(node.tagName, "SPAN");
  assert.equal(node.textContent, "Badge");
  assert.equal(node.className, "badge primary");
});

test("element handles empty string textContent correctly", () => {
  const node = element("div", "", "empty-container");
  assert.equal(node.textContent, "");
  assert.equal(node.className, "empty-container");
});

test("element omits className when className argument is falsy or undefined", () => {
  const nodeWithUndefined = element("div", "Sample", undefined);
  assert.equal(nodeWithUndefined.className, "");

  const nodeWithEmptyClass = element("div", "Sample", "");
  assert.equal(nodeWithEmptyClass.className, "");
});

test("element preserves text containing HTML markup safely as textContent", () => {
  const unsafeText = "<script>alert('xss')</script>";
  const node = element("div", unsafeText, "safe-content");
  assert.equal(node.textContent, "<script>alert('xss')</script>");
  assert.equal(node.className, "safe-content");
});

test("element safely handles timeline event title and description XSS payloads", () => {
  const xssTitle = "<img src=x onerror=alert('xss-title')>";
  const xssDesc = "<script>alert('xss-desc')</script>";

  const titleNode = element("h3", xssTitle);
  assert.equal(titleNode.tagName, "H3");
  assert.equal(titleNode.textContent, xssTitle);

  const descNode = element("p", xssDesc);
  assert.equal(descNode.tagName, "P");
  assert.equal(descNode.textContent, xssDesc);
});

test("element safely handles timeline event title and description XSS payloads", () => {
  const xssTitle = "<img src=x onerror=alert('xss-title')>";
  const xssDesc = "<script>alert('xss-desc')</script>";

  const titleNode = element("h3", xssTitle);
  assert.equal(titleNode.tagName, "H3");
  assert.equal(titleNode.textContent, xssTitle);

  const descNode = element("p", xssDesc);
  assert.equal(descNode.tagName, "P");
  assert.equal(descNode.textContent, xssDesc);
});
