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

import { element, renderTable } from "../assets/js/dom.js";

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

test("element prevents DOM XSS when rendering dynamic link text and HTML entities", () => {
  const xssPayload = "<img src=x onerror=alert(1)> Link Title";
  const node = element("a", xssPayload, "nav-link");
  assert.equal(node.tagName, "A");
  assert.equal(node.textContent, xssPayload);
  assert.equal(node.innerHTML, undefined);
  assert.equal(node.className, "nav-link");
});

test("renderTable creates table structure without caption", () => {
  const headers = ["Name", "Role", "Status"];
  const rows = [
    ["Alice", "Developer", "Active"],
    ["Bob", "Designer", "Away"],
  ];
  const wrapper = renderTable(headers, rows);

  assert.equal(wrapper.tagName, "DIV");
  assert.equal(wrapper.className, "table-wrap");
  assert.equal(wrapper.children.length, 1);

  const table = wrapper.children[0];
  assert.equal(table.tagName, "TABLE");
  assert.equal(table.children.length, 2);

  const head = table.children[0];
  assert.equal(head.tagName, "THEAD");
  assert.equal(head.children.length, 1);

  const heading = head.children[0];
  assert.equal(heading.tagName, "TR");
  assert.equal(heading.children.length, 3);

  headers.forEach((text, i) => {
    const th = heading.children[i];
    assert.equal(th.tagName, "TH");
    assert.equal(th.textContent, text);
    assert.equal(th.scope, "col");
  });

  const body = table.children[1];
  assert.equal(body.tagName, "TBODY");
  assert.equal(body.children.length, 2);

  rows.forEach((rowValues, rowIndex) => {
    const tr = body.children[rowIndex];
    assert.equal(tr.tagName, "TR");
    assert.equal(tr.children.length, 3);

    rowValues.forEach((val, colIndex) => {
      const cell = tr.children[colIndex];
      if (colIndex === 0) {
        assert.equal(cell.tagName, "TH");
        assert.equal(cell.scope, "row");
      } else {
        assert.equal(cell.tagName, "TD");
        assert.equal(cell.scope, undefined);
      }
      assert.equal(cell.textContent, val);
    });
  });
});

test("renderTable includes caption element when caption argument is provided", () => {
  const headers = ["Metric", "Value"];
  const rows = [["Latency", "12ms"]];
  const captionText = "System Performance Metrics";

  const wrapper = renderTable(headers, rows, captionText);
  const table = wrapper.children[0];

  assert.equal(table.tagName, "TABLE");
  assert.equal(table.children.length, 3);

  const caption = table.children[0];
  assert.equal(caption.tagName, "CAPTION");
  assert.equal(caption.textContent, captionText);

  assert.equal(table.children[1].tagName, "THEAD");
  assert.equal(table.children[2].tagName, "TBODY");
});

test("renderTable handles empty rows array correctly", () => {
  const headers = ["Header 1", "Header 2"];
  const wrapper = renderTable(headers, []);
  const table = wrapper.children[0];
  const body = table.children[1];

  assert.equal(body.tagName, "TBODY");
  assert.equal(body.children.length, 0);
});

test("renderTable safely handles XSS payloads in headers, rows, and caption", () => {
  const xssCaption = "<script>alert('xss-caption')</script>";
  const xssHeaders = ["<img src=x onerror=alert('xss-header')>"];
  const xssRows = [["<svg onload=alert('xss-row')>"]];

  const wrapper = renderTable(xssHeaders, xssRows, xssCaption);
  const table = wrapper.children[0];

  const caption = table.children[0];
  assert.equal(caption.textContent, xssCaption);

  const th = table.children[1].children[0].children[0];
  assert.equal(th.textContent, xssHeaders[0]);

  const cell = table.children[2].children[0].children[0];
  assert.equal(cell.textContent, xssRows[0][0]);
});
