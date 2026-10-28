import test from "node:test";
import assert from "node:assert/strict";

// Mock minimal document and window BEFORE importing app.js
class MockElement {
  constructor(tag = "div") {
    this.tagName = tag.toUpperCase();
    this.textContent = "";
    this.style = {};
    this.hidden = false;
    this.dataset = {};
    this.attributes = new Map();
    this.children = [];
  }

  setAttribute(k, v) {
    this.attributes.set(k, v);
  }

  removeAttribute(k) {
    this.attributes.delete(k);
  }

  getAttribute(k) {
    return this.attributes.get(k) || null;
  }

  classList = {
    toggle: () => {},
    add: () => {},
    remove: () => {},
    contains: () => false,
  };

  getContext() {
    return {
      fillStyle: "",
      strokeStyle: "",
      font: "",
      textAlign: "",
      fillRect: () => {},
      clearRect: () => {},
      fillText: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      arc: () => {},
      fill: () => {},
    };
  }

  addEventListener() {}

  replaceChildren(...nodes) {
    this.children = [...nodes];
  }

  closest() {
    return null;
  }
}

class MockDocument {
  querySelector() {
    return new MockElement();
  }

  querySelectorAll() {
    return [new MockElement()];
  }

  createElement(tag) {
    return new MockElement(tag);
  }

  addEventListener() {}
}

globalThis.document = globalThis.document || new MockDocument();
globalThis.window = globalThis.window || {
  addEventListener: () => {},
  setInterval: () => 1,
  clearInterval: () => {},
  Intl: globalThis.Intl,
};

const shapes = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
];

function rotateOld(m) {
  return m[0].map((_, i) => m.map((r) => r[i]).reverse());
}

test("rotate transposes and reverses matrix rows (90 degree clockwise rotation)", async () => {
  const { rotate } = await import("../assets/cat-club/app.js");

  shapes.forEach((shape) => {
    const expected = rotateOld(shape);
    const actual = rotate(shape);
    assert.deepStrictEqual(actual, expected);

    // 180 degrees
    assert.deepStrictEqual(rotate(rotate(shape)), rotateOld(rotateOld(shape)));

    // 360 degrees (4 rotations return matrix to equivalent shape)
    assert.deepStrictEqual(rotate(rotate(rotate(rotate(shape)))), shape);
  });
});

test("rotate handles non-square matrices accurately", async () => {
  const { rotate } = await import("../assets/cat-club/app.js");

  // 1x4 matrix
  const line = [[1, 1, 1, 1]];
  assert.deepStrictEqual(rotate(line), [[1], [1], [1], [1]]);

  // 3x2 matrix
  const rect = [
    [1, 2],
    [3, 4],
    [5, 6],
  ];
  assert.deepStrictEqual(rotate(rect), [
    [5, 3, 1],
    [6, 4, 2],
  ]);
});
