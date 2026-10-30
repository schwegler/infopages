import { validateAttachment } from "./attachments.js";

/** A strict, local-only paper-doll manifest. No generated art or remote URLs. */
export const CANVAS_SIZE = 1024;
export const LAYER_ROLES = Object.freeze([
  "back",
  "body",
  "outfit",
  "accessory",
  "hand",
  "occlusion",
  "expression",
]);

const BODY_ANCHORS = [
  "head",
  "torso",
  "hip",
  "foot-left",
  "foot-right",
  "shoulder-left",
  "shoulder-right",
  "wrist-left",
  "wrist-right",
];

function bodyVariantsFor(character) {
  const fixedBodies = character.base.filter((layer) => layer.role === "body");
  const config = character.bodyStates;
  if (!config) {
    if (fixedBodies.length !== 1)
      throw new Error("Exactly one complete body is required");
    return null;
  }
  if (
    fixedBodies.length ||
    character.handSlots?.length ||
    character.base.some((layer) => layer.role === "hand")
  ) {
    throw new Error(
      "Body variants cannot be mixed with a fixed body or separate hand ownership",
    );
  }
  if (
    !character.groups.some(
      (group) => group.id === (config.ownerGroup ?? "accessory"),
    )
  ) {
    throw new Error("Complete body states require their owning prop group");
  }
  for (const id of BODY_ANCHORS) {
    const point = config.anchors?.[id];
    if (
      !Array.isArray(point) ||
      point.length !== 2 ||
      point.some(
        (value) =>
          !Number.isFinite(value) ||
          value < 0 ||
          value > character.sourceCanvas.width,
      )
    ) {
      throw new Error(
        "Complete body variants require fixed registration anchors",
      );
    }
  }
  const states = new Map();
  for (const state of config.states ?? []) {
    if (
      !/^[a-z][a-z0-9-]*$/.test(state.id) ||
      states.has(state.id) ||
      state.completeBody !== true ||
      !state.layers?.length ||
      state.layers.filter((layer) => layer.role === "body").length !== 1 ||
      state.layers.some((layer) => layer.role === "hand")
    ) {
      throw new Error("Each body state must own exactly one complete body");
    }
    if (
      BODY_ANCHORS.some(
        (id) =>
          !Array.isArray(state.anchors?.[id]) ||
          state.anchors[id].length !== 2 ||
          state.anchors[id].some(
            (value, index) => value !== config.anchors[id][index],
          ),
      )
    ) {
      throw new Error("Body state registration anchors must not jump");
    }
    states.set(state.id, state);
  }
  if (config.default !== "open" || !states.has(config.default))
    throw new Error("Missing default complete body state");
  return states;
}

export function validateManifest(manifest) {
  if (manifest.version !== 1 || manifest.size !== CANVAS_SIZE) {
    throw new Error("Unsupported sticker manifest");
  }
  const ids = new Set();
  for (const character of manifest.characters) {
    if (!/^[a-z][a-z0-9-]*$/.test(character.id) || ids.has(character.id)) {
      throw new Error("Invalid or duplicate character");
    }
    ids.add(character.id);
    if (
      !character.label ||
      !character.pose ||
      !character.groups.length ||
      !Number.isInteger(character.sourceCanvas?.width) ||
      character.sourceCanvas.width < 256 ||
      character.sourceCanvas.width > 4096 ||
      character.sourceCanvas.height !== character.sourceCanvas.width
    ) {
      throw new Error("Incomplete character");
    }
    const groups = new Set();
    const allLayers = [...character.base];
    const bodyVariants = bodyVariantsFor(character);
    for (const state of bodyVariants?.values() ?? [])
      allLayers.push(...state.layers);
    const slots = new Map();
    for (const slot of character.handSlots ?? []) {
      if (
        !/^[a-z][a-z0-9-]*$/.test(slot.id) ||
        slots.has(slot.id) ||
        !slot.states?.length
      ) {
        throw new Error("Invalid mandatory hand slot");
      }
      const states = new Set();
      for (const state of slot.states) {
        if (
          !/^[a-z][a-z0-9-]*$/.test(state.id) ||
          states.has(state.id) ||
          !state.layers?.length ||
          !state.layers.some((layer) => layer.role === "hand")
        ) {
          throw new Error("Incomplete or duplicate hand state");
        }
        states.add(state.id);
        allLayers.push(...state.layers);
      }
      if (!states.has(slot.default))
        throw new Error("Missing default hand state");
      slots.set(slot.id, states);
    }
    for (const group of character.groups) {
      if (
        !/^[a-z][a-z0-9-]*$/.test(group.id) ||
        groups.has(group.id) ||
        !group.label ||
        !group.options.length
      ) {
        throw new Error("Invalid option group");
      }
      groups.add(group.id);
      const options = new Set();
      for (const option of group.options) {
        if (
          !/^[a-z][a-z0-9-]*$/.test(option.id) ||
          options.has(option.id) ||
          !option.label
        ) {
          throw new Error("Invalid option");
        }
        options.add(option.id);
        const bundle = validateAttachment(character, option);
        if (bundle) {
          if (group.id !== "accessory")
            throw new Error("Only accessories can own attached parts");
          allLayers.push(
            ...(bundle.integrated
              ? [bundle.integrated]
              : [bundle.body, ...bundle.parts]),
          );
        }
        if (bodyVariants) {
          const ownerGroup = character.bodyStates.ownerGroup ?? "accessory";
          if (group.id === ownerGroup) {
            if (option.id === "none") {
              if (option.bodyState !== undefined && option.bodyState !== "open")
                throw new Error("No prop must select the complete open body");
            } else if (
              option.bodyState === undefined ||
              option.bodyState === "open"
            ) {
              throw new Error("A prop requires its matched complete grip body");
            }
          } else if (option.bodyState !== undefined)
            throw new Error("Only the owning prop group may switch the body");
        }
        if (option.layers.some((layer) => layer.role === "body"))
          throw new Error("Options cannot add a second body");
        if (
          option.bodyState !== undefined &&
          !bodyVariants?.has(option.bodyState)
        )
          throw new Error("Unknown required complete body state");
        for (const [slotId, stateId] of Object.entries(
          option.handStates ?? {},
        )) {
          if (!slots.get(slotId)?.has(stateId))
            throw new Error("Unknown required hand state");
        }
        allLayers.push(...option.layers);
      }
      if (!options.has(group.default))
        throw new Error("Missing default option");
    }
    for (const layer of allLayers) {
      if (
        !LAYER_ROLES.includes(layer.role) ||
        !Number.isInteger(layer.order) ||
        layer.pose !== character.pose ||
        !/^assets\/dress-up\/[a-z0-9/-]+\.png$/.test(layer.src) ||
        layer.src.includes("..")
      ) {
        throw new Error("Invalid local layer or incompatible pose");
      }
    }
    for (const exclusion of character.exclusions ?? []) {
      for (const [groupId, optionId] of Object.entries(exclusion)) {
        const group = character.groups.find((item) => item.id === groupId);
        if (!group?.options.some((item) => item.id === optionId)) {
          throw new Error("Invalid compatibility rule");
        }
      }
      if (Object.keys(exclusion).length < 2) {
        throw new Error("Compatibility rules must name a combination");
      }
    }
    resolveSelection(manifest, defaultsFor(character));
  }
  return manifest;
}

export function defaultsFor(character) {
  return {
    character: character.id,
    options: Object.fromEntries(
      character.groups.map((group) => [group.id, group.default]),
    ),
  };
}

export function resolveSelection(manifest, selection) {
  const character = manifest.characters.find(
    (item) => item.id === selection.character,
  );
  if (!character) throw new Error("Unknown character");
  const bodyVariants = bodyVariantsFor(character);
  const known = new Set(character.groups.map((group) => group.id));
  if (Object.keys(selection.options).some((id) => !known.has(id))) {
    throw new Error("Unknown option group");
  }
  const layers = [...character.base];
  const names = [character.id];
  const bundles = [];
  const handRequests = new Map();
  let bodyRequest;
  for (const group of character.groups) {
    const option = group.options.find(
      (item) => item.id === selection.options[group.id],
    );
    if (!option) throw new Error("Unknown or missing option");
    names.push(option.id);
    const bundle = validateAttachment(character, option);
    if (bundle) bundles.push(bundle);
    layers.push(...option.layers);
    if (option.bodyState !== undefined) {
      if (bodyRequest !== undefined && bodyRequest !== option.bodyState)
        throw new Error("These options require incompatible body states");
      bodyRequest = option.bodyState;
    }
    for (const [slotId, stateId] of Object.entries(option.handStates ?? {})) {
      if (handRequests.has(slotId) && handRequests.get(slotId) !== stateId) {
        throw new Error("These options require incompatible hand states");
      }
      handRequests.set(slotId, stateId);
    }
  }
  if (bundles.length > 1)
    throw new Error("Attached part ownership cannot overlap");
  let resolvedBodyState = null;
  if (bodyVariants) {
    resolvedBodyState = bodyRequest ?? character.bodyStates.default;
    const state = bodyVariants.get(resolvedBodyState);
    if (!state) throw new Error("A matching complete body state is required");
    layers.push(...state.layers);
  } else if (bodyRequest !== undefined)
    throw new Error("Unknown required body state");
  if (layers.filter((layer) => layer.role === "body").length !== 1)
    throw new Error("A selection must contain exactly one body");
  const resolvedHands = {};
  for (const slot of character.handSlots ?? []) {
    const stateId = handRequests.get(slot.id) ?? slot.default;
    const state = slot.states.find((item) => item.id === stateId);
    if (
      !state?.layers?.length ||
      !state.layers.some((layer) => layer.role === "hand")
    ) {
      throw new Error("A complete hand state is required");
    }
    resolvedHands[slot.id] = stateId;
    layers.push(...state.layers);
    handRequests.delete(slot.id);
  }
  if (handRequests.size) throw new Error("Unknown required hand slot");
  if (
    (character.exclusions ?? []).some((rule) =>
      Object.entries(rule).every(
        ([id, value]) => selection.options[id] === value,
      ),
    )
  ) {
    throw new Error("These options cannot be worn together");
  }
  return {
    character,
    handStates: resolvedHands,
    bodyState: resolvedBodyState,
    bundles,
    layers: layers.sort((a, b) => a.order - b.order),
    filename: `schweg-${names.join("-")}.png`,
  };
}

export function isCompatible(manifest, selection) {
  try {
    resolveSelection(manifest, selection);
    return true;
  } catch {
    return false;
  }
}

/** Exhaustive matrix used by art QA and browser export tests. */
export function combinationsFor(character) {
  return character.groups.reduce(
    (rows, group) =>
      rows.flatMap((row) =>
        group.options.map((option) => ({
          character: character.id,
          options: { ...row.options, [group.id]: option.id },
        })),
      ),
    [{ character: character.id, options: {} }],
  );
}
