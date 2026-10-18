import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  filterEvents,
  relatedEvents,
  missionResult,
  permissionCopy,
  securityCopy,
} from "../assets/js/model.js";
const data = JSON.parse(
  readFileSync(new URL("../hollyoaks_data.json", import.meta.url)),
);
test("timeline returns original data and filters numerically or by select value", () => {
  assert.equal(filterEvents(data.timelineEvents, "all").length, 25);
  assert.equal(filterEvents(data.timelineEvents, "2008").length, 2);
  assert.equal(filterEvents(data.timelineEvents, 2004).length, 1);
  assert.deepEqual(filterEvents(data.timelineEvents, "9999"), []);
});
test("character events come from the original dataset in chronological order", () => {
  const events = relatedEvents(data.timelineEvents, "Gordon Cunningham");
  assert.equal(events.length, 1);
  assert.equal(events[0].year, 2004);
  assert.ok(events[0].title.includes("Fatal Crash"));
});
test("all permission choices have explicit simulation outcomes", () => {
  for (const permission of Object.keys(permissionCopy)) {
    const text = missionResult(permission, 20);
    assert.ok(text.includes(permission));
    assert.ok(text.includes("20 characters"));
    assert.ok(text.includes("never executed or transmitted"));
  }
  assert.match(missionResult("SAFE", 0), /blocked/);
  assert.match(
    missionResult("EXTERNAL_ACCESS", 1),
    /No network request was sent/,
  );
  assert.match(missionResult("UNSAFE", 1), /Review required/);
  assert.throws(() => missionResult("ADMIN", 0), RangeError);
});
test("security controls cover all original topics", () => {
  assert.deepEqual(Object.keys(securityCopy), ["tde", "ae", "hsts", "audit"]);
  assert.ok(Object.values(securityCopy).every((text) => text.length > 50));
});
