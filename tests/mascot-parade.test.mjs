import test from "node:test";
import assert from "node:assert/strict";
import { chooseLane } from "../assets/js/mascot-parade.js";

test("chooseLane returns default bottom and height when rects array is empty", () => {
  const result = chooseLane(600, 108, [], 140);
  assert.deepEqual(result, { bottom: 600, height: 108 });
});

test("chooseLane returns default bottom and height when rects do not obstruct the lane", () => {
  // Rect is far above the mascot path
  const rects = [{ top: 100, bottom: 200, left: 0, right: 100 }];
  const result = chooseLane(600, 108, rects, 140);
  assert.deepEqual(result, { bottom: 600, height: 108 });
});

test("chooseLane lifts floor to clear an obstructing rect near base bottom", () => {
  // Rect obstructs bottom 600 (floor <= top - 6 fails because 600 > 550 - 6)
  // Floor candidate: 550 - 8 = 542
  const rects = [{ top: 550, bottom: 620, left: 0, right: 100 }];
  const result = chooseLane(600, 108, rects, 140);
  assert.deepEqual(result, { bottom: 542, height: 108 });
});

test("chooseLane selects compact mascot height when full height cannot fit between rects", () => {
  // Rect 1 obstructs bottom 600 (top: 550, bottom: 620) -> floor candidate 542
  // Rect 2 is above floor 542 (top: 400, bottom: 480)
  // Full height 108 gives top 542 - 108 - 2 = 432 (overlaps Rect 2)
  // Compact height = 542 - 480 - 10 = 52 (>= 44)
  // Top with compact height = 542 - 52 - 2 = 488 (clears Rect 2 bottom 480 + 6 = 486)
  const rects = [
    { top: 550, bottom: 620, left: 0, right: 100 },
    { top: 400, bottom: 480, left: 0, right: 100 },
  ];
  const result = chooseLane(600, 108, rects, 140);
  assert.deepEqual(result, { bottom: 542, height: 52 });
});

test("chooseLane respects maxLift constraint", () => {
  // Rect at top 500 -> candidate floor 492
  // maxLift = 50 -> minimum floor allowed is 600 - 50 = 550
  // Candidate floor 492 is rejected as it is < 550
  const rects = [{ top: 500, bottom: 620, left: 0, right: 100 }];
  const result = chooseLane(600, 108, rects, 50);
  assert.deepEqual(result, { bottom: 600, height: 108 });
});

test("chooseLane falls back to default when compact height is below minimum threshold (< 44)", () => {
  // Rect 1 at top 550 -> candidate floor 542
  // Rect 2 at bottom 500 -> compact size = 542 - 500 - 10 = 32 (< 44)
  const rects = [
    { top: 550, bottom: 620, left: 0, right: 100 },
    { top: 400, bottom: 500, left: 0, right: 100 },
  ];
  const result = chooseLane(600, 108, rects, 140);
  assert.deepEqual(result, { bottom: 600, height: 108 });
});

test("chooseLane evaluates candidate floors in descending order (minimal lift first)", () => {
  // Obstacle 1 at top 560 -> floor candidate 552 (lift 48)
  // Obstacle 2 at top 480 -> floor candidate 472 (lift 128)
  // Floor 600 blocked by Obstacle 1
  // Floor 552 clears Obstacle 1 top, but Obstacle 2 blocks full height (552-108-2=442 < 540+6)
  //   and compact height on floor 552: 552 - 540 - 10 = 2 (< 44)
  // Floor 472 clears Obstacle 2 top (472 <= 480 - 6 = 474) andObstacle 1 bottom (472 - 108 - 2 = 362 <= 560)
  const rects = [
    { top: 560, bottom: 620, left: 0, right: 100 },
    { top: 480, bottom: 540, left: 0, right: 100 },
  ];
  const result = chooseLane(600, 108, rects, 200);
  assert.deepEqual(result, { bottom: 472, height: 108 });
});
