import test from "node:test";
import assert from "node:assert/strict";

class MockElement {
  constructor(tag, namespaceURI) {
    this.tagName = tag.toUpperCase();
    this.namespaceURI = namespaceURI;
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
  createElementNS: (ns, tag) => new MockElement(tag, ns),
};

import { barChart, lineChart, linePoints } from "../assets/js/charts.js";

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

test("lineChart constructs SVG line chart figure with grid lines, polylines, dots, axis and legend", () => {
  const labels = ["Q1", "Q2", "Q3"];
  const series = [
    ["Metric Alpha", [10, 50, 90]],
    ["Metric Beta", [30, 40, 20]],
  ];
  const figure = lineChart(labels, series, "Quarterly Performance");

  assert.equal(figure.tagName, "FIGURE");
  assert.equal(figure.className, "source-chart line-chart");
  assert.equal(figure.children.length, 4);

  // 1. Caption
  const caption = figure.children[0];
  assert.equal(caption.tagName, "FIGCAPTION");
  assert.equal(caption.textContent, "Quarterly Performance");

  // 2. Frame (Scale + SVG)
  const frame = figure.children[1];
  assert.equal(frame.tagName, "DIV");
  assert.equal(frame.className, "line-frame");
  assert.equal(frame.children.length, 2);

  const scale = frame.children[0];
  assert.equal(scale.className, "chart-scale");
  assert.equal(scale.children[0].textContent, "100");
  assert.equal(scale.children[1].textContent, "0");

  const svg = frame.children[1];
  assert.equal(svg.tagName, "SVG");
  assert.equal(svg.namespaceURI, "http://www.w3.org/2000/svg");
  assert.equal(svg.getAttribute("viewBox"), "0 0 600 200");
  assert.equal(svg.getAttribute("role"), "img");
  assert.equal(
    svg.getAttribute("aria-label"),
    "Quarterly Performance Values available in the adjacent data table.",
  );

  // SVG children: 3 grid lines + 2 series (each with 1 polyline + 3 dots = 4 items each) => 3 + 8 = 11 elements
  const gridLines = svg.children.filter(
    (el) => el.getAttribute("class") === "chart-grid",
  );
  assert.equal(gridLines.length, 3);
  assert.equal(gridLines[0].getAttribute("y1"), "20");
  assert.equal(gridLines[1].getAttribute("y1"), "100");
  assert.equal(gridLines[2].getAttribute("y1"), "180");

  const polylines = svg.children.filter((el) => el.tagName === "POLYLINE");
  assert.equal(polylines.length, 2);

  // Primary series polyline & color
  assert.equal(polylines[0].getAttribute("points"), "20,164 300,100 580,36");
  assert.equal(polylines[0].getAttribute("fill"), "none");
  assert.equal(polylines[0].getAttribute("stroke"), "#514287");

  // Secondary series polyline & color
  assert.equal(polylines[1].getAttribute("points"), "20,132 300,116 580,148");
  assert.equal(polylines[1].getAttribute("stroke"), "#9a7694");

  const circles = svg.children.filter((el) => el.tagName === "CIRCLE");
  assert.equal(circles.length, 6); // 3 for each series

  // Check first dot of first series
  assert.equal(circles[0].getAttribute("cx"), "20");
  assert.equal(circles[0].getAttribute("cy"), "164");
  assert.equal(circles[0].getAttribute("r"), "4");
  assert.equal(circles[0].getAttribute("fill"), "#514287");
  assert.equal(circles[0].children[0].tagName, "TITLE");
  assert.equal(circles[0].children[0].textContent, "Metric Alpha, Q1: 10");

  // Check second series dot fill & title
  assert.equal(circles[3].getAttribute("fill"), "#9a7694");
  assert.equal(circles[3].children[0].textContent, "Metric Beta, Q1: 30");

  // 3. Axis labels
  const axis = figure.children[2];
  assert.equal(axis.className, "chart-axis");
  assert.equal(axis.children.length, 3);
  assert.equal(axis.children[0].textContent, "Q1");
  assert.equal(axis.children[1].textContent, "Q2");
  assert.equal(axis.children[2].textContent, "Q3");

  // 4. Legend
  const legend = figure.children[3];
  assert.equal(legend.className, "chart-legend");
  assert.equal(legend.children.length, 2);
  assert.equal(legend.children[0].textContent, "Metric Alpha");
  assert.equal(legend.children[1].textContent, "Metric Beta");
});

test("lineChart handles custom maximum scale and single-observation series data", () => {
  const labels = ["Jan"];
  const series = [["Single Metric", [150]]];
  const figure = lineChart(labels, series, "Single Point Chart", 300);

  const scale = figure.children[1].children[0];
  assert.equal(scale.children[0].textContent, "300");

  const svg = figure.children[1].children[1];
  const polyline = svg.children.find((el) => el.tagName === "POLYLINE");
  assert.equal(polyline.getAttribute("points"), "20,100");

  const circle = svg.children.find((el) => el.tagName === "CIRCLE");
  assert.equal(circle.getAttribute("cx"), "20");
  assert.equal(circle.getAttribute("cy"), "100");
  assert.equal(circle.children[0].textContent, "Single Metric, Jan: 150");
});
