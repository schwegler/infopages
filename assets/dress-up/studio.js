import {
  validateManifest,
  defaultsFor,
  resolveSelection,
  isCompatible,
} from "./model.js";
import { renderSelection, downloadSticker } from "./render.js";

const element = (id) => document.getElementById(id);
const nodes = Object.fromEntries(
  [
    "characters",
    "options",
    "character-name",
    "character-description",
    "preview",
    "reference",
    "sticker",
    "status",
    "reset",
    "download",
    "zoom",
    "checkerboard",
  ].map((id) => [id, element(id)]),
);
let manifest;
let selection;
let rendered;
let controller;
let generation = 0;
let busy = false;
const remembered = new Map();

function status(text, error = false) {
  nodes.status.textContent = text;
  nodes.status.classList.toggle("error", error);
}
function current() {
  return manifest.characters.find(
    (character) => character.id === selection.character,
  );
}
function makeCharacters() {
  for (const character of manifest.characters) {
    const label = document.createElement("label");
    label.className = "character-choice";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "character";
    input.value = character.id;
    input.checked = character.id === selection.character;
    input.addEventListener("change", () => {
      remembered.set(selection.character, structuredClone(selection));
      selection = structuredClone(
        remembered.get(character.id) ?? defaultsFor(character),
      );
      updateControls();
      updatePreview();
    });
    const name = document.createElement("span");
    name.textContent = character.label;
    label.append(input, name);
    nodes.characters.append(label);
  }
}
function updateControls() {
  const character = current();
  nodes["character-name"].textContent = character.label;
  nodes["character-description"].textContent = character.description;
  nodes.reset.textContent = `Reset ${character.label}`;
  nodes.reset.disabled = !manifest.reviewed;
  nodes.options.replaceChildren();
  for (const group of character.groups) {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "option-group";
    const legend = document.createElement("legend");
    legend.textContent = group.label;
    const list = document.createElement("div");
    list.className = "option-list";
    let hasIncompatible = false;
    for (const option of group.options) {
      const label = document.createElement("label");
      label.className = "option-choice";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = group.id;
      input.value = option.id;
      input.checked = selection.options[group.id] === option.id;
      const compatible =
        !manifest.reviewed ||
        isCompatible(manifest, {
          character: character.id,
          options: { ...selection.options, [group.id]: option.id },
        });
      input.disabled = !manifest.reviewed || !compatible;
      if (!compatible) {
        hasIncompatible = true;
        input.setAttribute("aria-describedby", `reason-${group.id}`);
      }
      input.addEventListener("change", () => {
        selection.options[group.id] = option.id;
        // Re-evaluate compatible radios without moving keyboard focus to the page body.
        updateCompatibility();
        updatePreview();
      });
      const text = document.createElement("span");
      text.textContent = option.label;
      label.append(input, text);
      list.append(label);
    }
    const reason = document.createElement("p");
    reason.id = `reason-${group.id}`;
    reason.className = "option-reason";
    reason.textContent = "Unavailable with the current combination.";
    reason.hidden = !hasIncompatible;
    fieldset.append(legend, list, reason);
    nodes.options.append(fieldset);
  }
}
function updateCompatibility() {
  for (const group of current().groups) {
    let hasIncompatible = false;
    for (const radio of nodes.options.querySelectorAll(
      `input[name="${group.id}"]`,
    )) {
      const compatible =
        !manifest.reviewed ||
        isCompatible(manifest, {
          character: selection.character,
          options: { ...selection.options, [group.id]: radio.value },
        });
      radio.disabled = !manifest.reviewed || !compatible;
      radio.checked = selection.options[group.id] === radio.value;
      if (!compatible) {
        hasIncompatible = true;
        radio.setAttribute("aria-describedby", `reason-${group.id}`);
      } else radio.removeAttribute("aria-describedby");
    }
    element(`reason-${group.id}`).hidden = !hasIncompatible;
  }
}
async function updatePreview() {
  controller?.abort();
  controller = new AbortController();
  const version = ++generation;
  busy = true;
  rendered = null;
  nodes.download.disabled = true;
  nodes.preview.setAttribute("aria-busy", "true");
  if (!manifest.reviewed) {
    nodes.sticker.hidden = true;
    nodes.reference.hidden = false;
    nodes.reference.alt = `${current().label}: approved full-figure reference, not a layered outfit preview`;
    nodes.reference.src = `/${current().reference}`;
    nodes.preview.setAttribute("aria-busy", "false");
    busy = false;
    status(
      "Internal preview — approved full-figure reference. Modular artwork awaiting review; dressing and download are disabled.",
    );
    return;
  }
  status(`Preparing ${current().label}…`);
  try {
    const result = await renderSelection(manifest, structuredClone(selection), {
      signal: controller.signal,
    });
    if (version !== generation) return;
    const context = nodes.sticker.getContext("2d", { alpha: true });
    context.clearRect(0, 0, 1024, 1024);
    context.drawImage(result.canvas, 0, 0);
    nodes.sticker.setAttribute(
      "aria-label",
      `${current().label} sticker: ${current()
        .groups.map(
          (group) =>
            group.options.find(
              (option) => option.id === selection.options[group.id],
            ).label,
        )
        .join(", ")}`,
    );
    nodes.sticker.hidden = false;
    nodes.reference.hidden = true;
    rendered = result;
    nodes.download.disabled = false;
    status(`${current().label} is ready to download.`);
  } catch (error) {
    if (version === generation && error.name !== "AbortError")
      status(
        "Artwork could not be loaded. Choose an option again to retry.",
        true,
      );
  } finally {
    if (version === generation) {
      busy = false;
      nodes.preview.setAttribute("aria-busy", "false");
    }
  }
}
nodes.reset.addEventListener("click", () => {
  selection = defaultsFor(current());
  updateControls();
  updatePreview();
});
nodes.zoom.addEventListener("change", () => {
  nodes.preview.classList.toggle("zoom-small", nodes.zoom.value === "0.75");
  nodes.preview.classList.toggle("zoom-large", nodes.zoom.value === "1.25");
});
nodes.checkerboard.addEventListener("change", () =>
  nodes.preview.classList.toggle("checkerboard", nodes.checkerboard.checked),
);
nodes.download.addEventListener("click", async () => {
  if (!rendered || busy || !manifest.reviewed) return;
  const version = generation;
  const result = rendered;
  nodes.download.disabled = true;
  try {
    await downloadSticker(result);
    if (version === generation)
      status("PNG downloaded. Your sticker has a transparent background.");
  } catch {
    if (version === generation)
      status("The PNG could not be downloaded. Please try again.", true);
  } finally {
    if (version === generation && rendered && !busy)
      nodes.download.disabled = false;
  }
});
async function start() {
  try {
    const response = await fetch("/assets/dress-up/manifest.json", {
      mode: "same-origin",
      redirect: "error",
    });
    if (!response.ok) throw new Error("Manifest unavailable");
    manifest = await response.json();
    if (manifest.reviewed === true) validateManifest(manifest);
    else if (manifest.reviewed !== false)
      throw new Error("Missing art review state");
    selection = defaultsFor(manifest.characters[0]);
    makeCharacters();
    updateControls();
    await updatePreview();
  } catch {
    status(
      "The editor could not be loaded. Please refresh to try again.",
      true,
    );
    nodes.preview.setAttribute("aria-busy", "false");
  }
}
start();
