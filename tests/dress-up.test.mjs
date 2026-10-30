import test from "node:test";
import assert from "node:assert/strict";
import {
  validateManifest,
  defaultsFor,
  resolveSelection,
  combinationsFor,
  isCompatible,
} from "../assets/dress-up/model.js";

// Deliberately synthetic metadata, never presented as approved mascot art.
function fixture() {
  const layer = (name, role, order) => ({
    src: `assets/dress-up/test/${name}.png`,
    role,
    order,
    pose: "fixture-front",
  });
  return {
    version: 1,
    size: 1024,
    characters: ["telly", "facet", "hitch", "andrew"].map((id) => ({
      id,
      label: id,
      pose: "fixture-front",
      sourceCanvas: { width: 1024, height: 1024 },
      base: [layer("body", "body", 20)],
      groups: [
        {
          id: "outfit",
          label: "Outfit",
          default: "everyday",
          options: [
            { id: "everyday", label: "Everyday", layers: [] },
            {
              id: "costume",
              label: "Costume",
              layers: [layer("outfit", "outfit", 30)],
            },
          ],
        },
        {
          id: "accessory",
          label: "Accessory",
          default: "none",
          options: [
            { id: "none", label: "None", layers: [] },
            {
              id: "prop",
              label: "Prop",
              layers: [
                layer("hand", "occlusion", 50),
                layer("prop", "accessory", 40),
              ],
            },
          ],
        },
      ],
      exclusions: [{ outfit: "costume", accessory: "prop" }],
    })),
  };
}

test("every character has deterministic defaults and an exhaustive compatibility matrix", () => {
  const manifest = validateManifest(fixture());
  for (const character of manifest.characters) {
    assert.deepEqual(defaultsFor(character), {
      character: character.id,
      options: { outfit: "everyday", accessory: "none" },
    });
    const combinations = combinationsFor(character);
    assert.equal(combinations.length, 4);
    assert.equal(
      combinations.filter((row) => isCompatible(manifest, row)).length,
      3,
    );
    for (const row of combinations.filter((row) =>
      isCompatible(manifest, row),
    )) {
      const result = resolveSelection(manifest, row);
      assert.match(result.filename, /^schweg-[a-z-]+\.png$/);
      assert.deepEqual(
        result.layers.map((layer) => layer.order),
        [...result.layers.map((layer) => layer.order)].sort((a, b) => a - b),
      );
    }
  }
});

test("missing, unknown and incompatible selections fail instead of floating parts", () => {
  const manifest = fixture();
  for (const options of [
    {},
    { outfit: "unknown", accessory: "none" },
    { outfit: "everyday", accessory: "none", mystery: "yes" },
    { outfit: "costume", accessory: "prop" },
  ]) {
    assert.throws(() =>
      resolveSelection(manifest, { character: "telly", options }),
    );
  }
  assert.throws(() =>
    resolveSelection(manifest, { character: "unknown", options: {} }),
  );
});

test("remote artwork, wrong poses and unsafe IDs cannot enter a valid manifest", () => {
  for (const change of [
    (m) => (m.characters[0].base[0].src = "https://example.com/art.png"),
    (m) => (m.characters[0].base[0].src = "assets/dress-up/../private.png"),
    (m) => (m.characters[0].base[0].pose = "different-pose"),
    (m) => (m.characters[0].groups[0].options[0].id = "../../file"),
    (m) => (m.characters[0].groups[0].default = "missing"),
    (m) => (m.characters[0].exclusions[0].accessory = "missing"),
    (m) => (m.characters[1].id = m.characters[0].id),
    (m) => (m.size = 512),
  ]) {
    const manifest = fixture();
    change(manifest);
    assert.throws(() => validateManifest(manifest));
  }
});

test("resolving repeated changes does not mutate the manifest or default selection", () => {
  const manifest = fixture();
  const before = JSON.stringify(manifest);
  for (let i = 0; i < 30; i++) {
    for (const character of manifest.characters) {
      resolveSelection(manifest, {
        character: character.id,
        options: { outfit: "everyday", accessory: "prop" },
      });
      assert.equal(
        resolveSelection(manifest, defaultsFor(character)).layers.length,
        1,
      );
    }
  }
  assert.equal(JSON.stringify(manifest), before);
});

function handFixture() {
  const manifest = fixture();
  const character = manifest.characters[0];
  const hand = (id, order) => ({
    src: `assets/dress-up/test/${id}.png`,
    role: "hand",
    order,
    pose: character.pose,
  });
  character.handSlots = [
    {
      id: "prop-hand",
      default: "open",
      states: [
        { id: "open", layers: [hand("open-hand", 21)] },
        { id: "grip", layers: [hand("grip-rear", 21), hand("grip-front", 50)] },
      ],
    },
  ];
  character.groups[1].options[1].handStates = { "prop-hand": "grip" };
  return manifest;
}

test("mandatory hand states complete the base and replace the open hand with the matching prop grip", () => {
  const manifest = validateManifest(handFixture());
  const character = manifest.characters[0];
  const base = resolveSelection(manifest, defaultsFor(character));
  assert.deepEqual(base.handStates, { "prop-hand": "open" });
  assert.equal(base.layers.filter((layer) => layer.role === "hand").length, 1);
  const grip = resolveSelection(manifest, {
    character: "telly",
    options: { outfit: "everyday", accessory: "prop" },
  });
  assert.deepEqual(grip.handStates, { "prop-hand": "grip" });
  assert.deepEqual(
    grip.layers
      .filter((layer) => layer.role === "hand")
      .map((layer) => layer.src),
    [
      "assets/dress-up/test/grip-rear.png",
      "assets/dress-up/test/grip-front.png",
    ],
  );
  assert.ok(!grip.layers.some((layer) => layer.src.includes("open-hand")));
  assert.deepEqual(
    resolveSelection(manifest, defaultsFor(character)).handStates,
    { "prop-hand": "open" },
  );
});

test("missing, malformed or unknown required hands cannot yield an incomplete character", () => {
  for (const change of [
    (c) => (c.handSlots[0].default = "missing"),
    (c) => (c.handSlots[0].states[0].layers = []),
    (c) => (c.handSlots[0].states[0].layers[0].role = "outfit"),
    (c) => (c.groups[1].options[1].handStates = { "prop-hand": "missing" }),
    (c) => (c.groups[1].options[1].handStates = { "unknown-slot": "grip" }),
    (c) => (c.handSlots[0].states[1].layers[0].pose = "wrong-pose"),
  ]) {
    const manifest = handFixture();
    change(manifest.characters[0]);
    assert.throws(() => validateManifest(manifest));
  }
});

test("conflicting outfit and prop hand demands are an incompatible combination, never silently substituted", () => {
  const manifest = handFixture();
  manifest.characters[0].exclusions = [];
  manifest.characters[0].groups[0].options[1].handStates = {
    "prop-hand": "open",
  };
  validateManifest(manifest);
  const selection = {
    character: "telly",
    options: { outfit: "costume", accessory: "prop" },
  };
  assert.equal(isCompatible(manifest, selection), false);
  assert.throws(
    () => resolveSelection(manifest, selection),
    /incompatible hand states/,
  );
});

function bodyVariantFixture() {
  const manifest = fixture();
  const character = manifest.characters[0];
  const anchors = Object.fromEntries(
    [
      "head",
      "torso",
      "hip",
      "foot-left",
      "foot-right",
      "shoulder-left",
      "shoulder-right",
      "wrist-left",
      "wrist-right",
    ].map((name, index) => [name, [400 + index, 500 + index]]),
  );
  const body = (id) => ({
    src: `assets/dress-up/test/${id}.png`,
    role: "body",
    order: 20,
    pose: character.pose,
  });
  character.base = [];
  character.bodyStates = {
    default: "open",
    anchors,
    states: [
      {
        id: "open",
        completeBody: true,
        anchors: structuredClone(anchors),
        layers: [body("body-open")],
      },
      {
        id: "grip",
        completeBody: true,
        anchors: structuredClone(anchors),
        layers: [body("body-grip")],
      },
    ],
  };
  character.groups[1].options[1].bodyState = "grip";
  return manifest;
}

test("prop-owned complete body variants replace exactly one body while outfits stay independent", () => {
  const manifest = validateManifest(bodyVariantFixture());
  const character = manifest.characters[0];
  const base = resolveSelection(manifest, defaultsFor(character));
  assert.equal(base.bodyState, "open");
  assert.deepEqual(
    base.layers
      .filter((layer) => layer.role === "body")
      .map((layer) => layer.src),
    ["assets/dress-up/test/body-open.png"],
  );
  const prop = resolveSelection(manifest, {
    character: "telly",
    options: { outfit: "everyday", accessory: "prop" },
  });
  assert.equal(prop.bodyState, "grip");
  assert.deepEqual(
    prop.layers
      .filter((layer) => layer.role === "body")
      .map((layer) => layer.src),
    ["assets/dress-up/test/body-grip.png"],
  );
  assert.ok(!prop.layers.some((layer) => layer.src.includes("body-open")));
  const alternate = resolveSelection(manifest, {
    character: "telly",
    options: { outfit: "costume", accessory: "none" },
  });
  assert.equal(alternate.bodyState, "open");
  assert.ok(alternate.layers.some((layer) => layer.role === "outfit"));
});

test("body variants reject mixed ownership, incomplete/missing bodies, anchor drift and unknown demands", () => {
  for (const change of [
    (c) => c.base.push({ ...c.bodyStates.states[0].layers[0] }),
    (c) => (c.handSlots = [{ id: "prop-hand" }]),
    (c) => (c.bodyStates.default = "missing"),
    (c) => (c.bodyStates.states[1].completeBody = false),
    (c) => (c.bodyStates.states[1].layers = []),
    (c) =>
      c.bodyStates.states[1].layers.push({
        ...c.bodyStates.states[1].layers[0],
      }),
    (c) => (c.bodyStates.states[1].anchors.head[0] += 1),
    (c) => delete c.bodyStates.anchors["wrist-right"],
    (c) => (c.groups[1].options[1].bodyState = "missing"),
    (c) => delete c.groups[1].options[1].bodyState,
    (c) => (c.groups[1].options[0].bodyState = "grip"),
    (c) =>
      c.groups[0].options[0].layers.push({
        ...c.bodyStates.states[0].layers[0],
      }),
    (c) => (c.bodyStates.states[1].layers[0].pose = "wrong-pose"),
  ]) {
    const manifest = bodyVariantFixture();
    change(manifest.characters[0]);
    assert.throws(() => validateManifest(manifest));
  }
  const fixed = fixture();
  fixed.characters[0].base.push({ ...fixed.characters[0].base[0] });
  assert.throws(() => validateManifest(fixed), /Exactly one complete body/);
});

test("conflicting body-state requests are disabled instead of combining or substituting bodies", () => {
  const manifest = bodyVariantFixture();
  manifest.characters[0].exclusions = [];
  manifest.characters[0].groups[0].options[1].bodyState = "open";
  assert.throws(() => validateManifest(manifest), /owning prop group/);
  const selection = {
    character: "telly",
    options: { outfit: "costume", accessory: "prop" },
  };
  assert.equal(isCompatible(manifest, selection), false);
  assert.throws(
    () => resolveSelection(manifest, selection),
    /incompatible body states/,
  );
});

function attachedFixture() {
  const manifest = fixture();
  const c = manifest.characters[0];
  c.attachmentRegion = {
    id: "prop-arm",
    pose: c.pose,
    rect: [700, 500, 950, 800],
  };
  c.groups[1].options[1].layers = [];
  c.groups[1].options[1].attachmentBundle = {
    id: "prop-and-arm",
    region: "prop-arm",
    body: { ...c.base[0], src: "assets/dress-up/test/grip-body.png" },
    parts: [
      {
        src: "assets/dress-up/test/prop.png",
        role: "accessory",
        order: 40,
        pose: c.pose,
      },
    ],
  };
  return manifest;
}

test("an attached accessory resolves as one owned module and retains the canonical body and independent clothes", () => {
  const m = validateManifest(attachedFixture());
  const r = resolveSelection(m, {
    character: "telly",
    options: { outfit: "everyday", accessory: "prop" },
  });
  assert.equal(r.bundles.length, 1);
  assert.equal(r.layers.filter((l) => l.role === "body").length, 1);
  assert.equal(r.layers[0].src, "assets/dress-up/test/body.png");
  assert.ok(
    !r.layers.some(
      (l) => l.src.includes("grip-body") || l.role === "accessory",
    ),
  );
  assert.equal(
    resolveSelection(m, defaultsFor(m.characters[0])).bundles.length,
    0,
  );
});

test("attached bundles reject additive props, missing anatomy, whole-body replacement and independent fitting", () => {
  for (const change of [
    (c) =>
      c.groups[1].options[1].layers.push({ ...c.base[0], role: "accessory" }),
    (c) => (c.attachmentRegion.rect = [0, 0, 1024, 1024]),
    (c) => (c.groups[1].options[1].attachmentBundle.parts = []),
    (c) => (c.groups[1].options[1].attachmentBundle.body.pose = "wrong"),
    (c) => (c.groups[1].options[1].attachmentBundle.offset = [2, 0]),
    (c) => (c.groups[1].options[1].attachmentBundle.region = "missing"),
    (c) => (c.groups[1].options[1].attachmentBundle.body.role = "outfit"),
  ]) {
    const m = attachedFixture();
    change(m.characters[0]);
    assert.throws(() => validateManifest(m));
  }
});

test("atomic replacement clears old fingers including zero alpha and preserves every unowned byte", async () => {
  const { replaceOwnedPixels } =
    await import("../assets/dress-up/attachments.js");
  const base = new Uint8ClampedArray([
    255, 0, 0, 255, 20, 30, 40, 255, 100, 110, 120, 128,
  ]);
  const compiled = new Uint8ClampedArray([
    0, 0, 0, 0, 99, 98, 97, 10, 1, 2, 3, 255,
  ]);
  const actual = replaceOwnedPixels(base, compiled, new Uint8Array([1, 0, 1]));
  assert.deepEqual([...actual], [0, 0, 0, 0, 20, 30, 40, 255, 1, 2, 3, 255]);
  assert.deepEqual(
    [...base],
    [255, 0, 0, 255, 20, 30, 40, 255, 100, 110, 120, 128],
  );
});

import { cleanExportAlpha } from "../assets/dress-up/export-alpha.js";
test("export cleanup removes only whole remote alpha-1 islands and preserves input and protected edges", () => {
  const size = 64;
  const rgba = new Uint8ClampedArray(size * size * 4);
  const put = (x, y, alpha) =>
    rgba.set([123, 45, 67, alpha], (y * size + x) * 4);
  put(32, 32, 255);
  put(31, 31, 1); // Connected antialias edge.
  put(22, 32, 1); // Exactly ten pixels from original core.
  put(20, 32, 2); // Meaningful faint detail.
  put(0, 0, 1);
  put(1, 1, 1); // One diagonal 8-connected island.
  put(63, 63, 1);
  const before = new Uint8ClampedArray(rgba);
  const cleaned = cleanExportAlpha(rgba, size, size);
  assert.equal(cleaned.removedPixels, 3);
  assert.equal(cleaned.removedComponents, 2);
  assert.deepEqual(rgba, before);
  for (let p = 0; p < size * size; p++) {
    const x = p % size,
      y = Math.floor(p / size);
    const removed =
      (x === 0 && y === 0) || (x === 1 && y === 1) || (x === 63 && y === 63);
    assert.deepEqual(
      [...cleaned.pixels.slice(p * 4, p * 4 + 4)],
      removed ? [0, 0, 0, 0] : [...before.slice(p * 4, p * 4 + 4)],
    );
  }
});

test("integrated reference edits own one bounded native polygon and discard all old grip sources", () => {
  const m = attachedFixture();
  const c = m.characters[0];
  c.attachmentRegion.polygon = [
    [700, 500],
    [950, 500],
    [950, 800],
    [700, 800],
  ];
  const option = c.groups[1].options[1];
  option.attachmentBundle = {
    id: "integrated-prop",
    region: "prop-arm",
    integrated: {
      src: "assets/dress-up/test/integrated.png",
      role: "accessory",
      order: 20,
      pose: c.pose,
    },
    frontPolygon: [
      [800, 600],
      [900, 600],
      [900, 750],
      [800, 750],
    ],
  };
  validateManifest(m);
  const r = resolveSelection(m, {
    character: c.id,
    options: { outfit: "everyday", accessory: "prop" },
  });
  assert.equal(
    r.bundles[0].integrated.src,
    "assets/dress-up/test/integrated.png",
  );
  assert.ok(!r.bundles[0].body && !r.bundles[0].parts);
  assert.equal(r.layers.filter((l) => l.role === "body").length, 1);
  const broken = structuredClone(m);
  broken.characters[0].groups[1].options[1].attachmentBundle.frontPolygon[0][0] = 100;
  assert.throws(() => validateManifest(broken));
  const doubled = structuredClone(m);
  doubled.characters[0].groups[1].options[1].attachmentBundle.body = c.base[0];
  assert.throws(() => validateManifest(doubled));
});

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
test("the working factory ships only reviewed source bytes and all 30 approved combinations", () => {
  const manifest = validateManifest(
    JSON.parse(
      readFileSync(
        new URL("../assets/dress-up/manifest.json", import.meta.url),
        "utf8",
      ),
    ),
  );
  const provenance = JSON.parse(
    readFileSync(
      new URL("../assets/dress-up/provenance.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(manifest.reviewed, true);
  const sources = new Set();
  function visit(value) {
    if (!value || typeof value !== "object") return;
    if (value.src && value.role) {
      assert.equal(value.reviewed, true);
      sources.add(value.src);
    }
    Object.values(value).forEach(visit);
  }
  visit(manifest);
  assert.equal(sources.size, 20);
  assert.deepEqual(
    [...sources].sort(),
    provenance.assets.map((a) => a.path).sort(),
  );
  for (const asset of provenance.assets) {
    assert.equal(asset.reviewed, true);
    assert.ok(asset.library_file_id.startsWith("libfile_"));
    assert.ok(Number.isInteger(asset.library_version));
    const bytes = readFileSync(new URL("../" + asset.path, import.meta.url));
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      asset.sha256,
    );
    assert.deepEqual(
      [...bytes.subarray(0, 8)],
      [137, 80, 78, 71, 13, 10, 26, 10],
    );
    assert.equal(bytes.readUInt32BE(16), 1254);
    assert.equal(bytes.readUInt32BE(20), 1254);
    assert.equal(bytes[25], 6);
  }
  assert.equal(manifest.characters[0].id, "telly");
  let combinations = 0;
  for (const character of manifest.characters) {
    assert.equal(character.reviewed, true);
    character.groups
      .flatMap((g) => g.options)
      .forEach((o) => assert.equal(o.reviewed, true));
    for (const selection of combinationsFor(character)) {
      resolveSelection(manifest, selection);
      combinations++;
    }
  }
  assert.equal(combinations, 30);
});
