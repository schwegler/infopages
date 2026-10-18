import test from "node:test";
import assert from "node:assert/strict";
import { linePoints } from "../assets/js/charts.js";

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
