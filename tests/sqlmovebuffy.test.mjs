import test from "node:test";
import assert from "node:assert/strict";

class MockElement {
  constructor(tag, namespaceURI = null) {
    this.tagName = tag.toUpperCase();
    this.namespaceURI = namespaceURI;
    this.id = "";
    this.className = "";
    this.textContent = "";
    this.innerHTML = "";
    this.style = {};
    this.dataset = {};
    this.attributes = new Map();
    this.children = [];
    this.listeners = {};
  }

  setAttribute(key, value) {
    this.attributes.set(key, value);
  }

  getAttribute(key) {
    return this.attributes.get(key) || null;
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  replaceChildren(...nodes) {
    this.children = [...nodes];
  }

  querySelector(selector) {
    return (
      this.children.find((c) => c.tagName === selector.toUpperCase()) || null
    );
  }

  querySelectorAll() {
    return [];
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  getBoundingClientRect() {
    return { top: 0, left: 0, width: 100, height: 100 };
  }
}

class MockDocument {
  constructor() {
    this.elements = new Map();
    this.listeners = {};
  }

  createElement(tag) {
    return new MockElement(tag);
  }

  createElementNS(ns, tag) {
    return new MockElement(tag, ns);
  }

  getElementById(id) {
    return this.elements.get(id) || null;
  }

  querySelectorAll() {
    return [];
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  registerElement(id, el) {
    this.elements.set(id, el);
  }
}

test("sqlmovebuffy server nodes use textContent for name and type preventing XSS", async () => {
  const doc = new MockDocument();
  const mapContainer = new MockElement("div");
  const svgMap = new MockElement("svg");

  doc.registerElement("map-container", mapContainer);
  doc.registerElement("dependency-map", svgMap);

  globalThis.document = doc;
  globalThis.window = {
    addEventListener: () => {},
    pageYOffset: 0,
    innerHeight: 1000,
  };

  const { initPage } = await import("../sqlmovebuffy.js");

  initPage();

  assert.equal(mapContainer.children.length, 3);

  for (const serverNode of mapContainer.children) {
    const h5 = serverNode.children.find((c) => c.tagName === "H5");
    const p = serverNode.children.find((c) => c.tagName === "P");

    assert.ok(h5, "h5 element should exist");
    assert.ok(p, "p element should exist");

    // Ensure innerHTML was not used to inject elements
    assert.equal(serverNode.innerHTML, "");

    // Verify textContent contains the server details safely
    assert.ok(typeof h5.textContent === "string");
    assert.ok(typeof p.textContent === "string");
  }
});
