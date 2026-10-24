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
    nodes.forEach((node) => {
      if (typeof node === "string") {
        this.children.push(node);
      } else {
        this.children.push(node);
      }
    });
  }
}

globalThis.document = {
  createElement: (tag) => new MockElement(tag),
};

import { barChart, linePoints } from "../assets/js/charts.js";

test("line plot uses a common zero baseline and evenly spaced original values", () => {
  assert.equal(linePoints([0, 50, 100]), "20,180 300,100 580,20");
  assert.equal(
    linePoints([80, 75, 70, 85, 90]),
    "20,52 160,60 300,68 440,44 580,36",
  );
  assert.equal(
    linePoints([1600, 900, 0], 1800),
    "20,37.77777777777777 300,100 580,180",
  );
});

test("plot handles a single observation and bounds extreme values", () => {
  assert.equal(linePoints([50]), "20,100");
  assert.equal(linePoints([-5, 150]), "20,180 580,20");
});

test("barChart constructs a figure with correct structure, caption, and meters using default maximum", () => {
  const rows = [
    ["Category A", 40],
    ["Category B", 80],
  ];
  const figure = barChart(rows, "Sample Bar Chart");

  assert.equal(figure.tagName, "FIGURE");
  assert.equal(figure.className, "source-chart");
  assert.equal(figure.children.length, 2);

  const caption = figure.children[0];
  assert.equal(caption.tagName, "FIGCAPTION");
  assert.equal(caption.textContent, "Sample Bar Chart");

  const list = figure.children[1];
  assert.equal(list.tagName, "DIV");
  assert.equal(list.className, "chart-bars");
  assert.equal(list.children.length, 2);

  const row1 = list.children[0];
  assert.equal(row1.tagName, "DIV");
  assert.equal(row1.className, "chart-row");
  assert.equal(row1.children.length, 2);

  const text1 = row1.children[0];
  assert.equal(text1.tagName, "P");
  assert.equal(text1.textContent, "Category A");
  assert.equal(text1.children.length, 1);
  assert.equal(text1.children[0].tagName, "STRONG");
  assert.equal(text1.children[0].textContent, "40");

  const meter1 = row1.children[1];
  assert.equal(meter1.tagName, "METER");
  assert.equal(meter1.min, 0);
  assert.equal(meter1.max, 100);
  assert.equal(meter1.value, 40);
  assert.equal(meter1.getAttribute("aria-label"), "Category A: 40");

  const row2 = list.children[1];
  const meter2 = row2.children[1];
  assert.equal(meter2.value, 80);
  assert.equal(meter2.max, 100);
  assert.equal(meter2.getAttribute("aria-label"), "Category B: 80");
});

test("barChart handles custom maximum parameter and empty rows array", () => {
  const rows = [["Metric X", 150]];
  const figureCustomMax = barChart(rows, "Custom Max Chart", 200);

  const list = figureCustomMax.children[1];
  const meter = list.children[0].children[1];
  assert.equal(meter.max, 200);
  assert.equal(meter.value, 150);
  assert.equal(meter.getAttribute("aria-label"), "Metric X: 150");

  const figureEmpty = barChart([], "Empty Chart");
  assert.equal(figureEmpty.tagName, "FIGURE");
  assert.equal(figureEmpty.children[0].textContent, "Empty Chart");
  assert.equal(figureEmpty.children[1].children.length, 0);
});
