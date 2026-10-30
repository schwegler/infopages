/** Exact-pixel, native-origin accessory + attached-part ownership. No art edits. */
export function validateAttachment(character, option) {
  const bundle = option.attachmentBundle;
  if (!bundle) return null;
  const region = character.attachmentRegion;
  if (
    character.bodyStates ||
    character.handSlots?.length ||
    option.bodyState ||
    Object.keys(option.handStates ?? {}).length ||
    option.layers.length
  ) {
    throw new Error("An attached accessory exclusively owns its part and prop");
  }
  const size = character.sourceCanvas.width;
  const rect = region?.rect;
  if (
    !region ||
    region.pose !== character.pose ||
    bundle.region !== region.id ||
    !/^[a-z][a-z0-9-]*$/.test(bundle.id) ||
    !Array.isArray(rect) ||
    rect.length !== 4 ||
    rect.some((value) => !Number.isInteger(value)) ||
    rect[0] < 0 ||
    rect[1] < 0 ||
    rect[2] > size ||
    rect[3] > size ||
    rect[2] <= rect[0] ||
    rect[3] <= rect[1] ||
    (rect[2] - rect[0]) * (rect[3] - rect[1]) > (size * size) / 3
  ) {
    throw new Error(
      "An attached accessory requires a bounded native part region",
    );
  }
  if (
    !bundle.integrated &&
    (bundle.body?.role !== "body" ||
      !bundle.parts?.length ||
      bundle.parts.some((part) => part.role === "body") ||
      !bundle.parts.some((part) => part.role === "accessory"))
  ) {
    throw new Error(
      "The attached part and matching prop must be one complete bundle",
    );
  }
  if (
    bundle.integrated &&
    (bundle.integrated.role !== "accessory" ||
      bundle.body ||
      bundle.parts?.length)
  )
    throw new Error("An integrated attachment must own one source only");
  if (
    [region.polygon, bundle.frontPolygon]
      .filter(Boolean)
      .some(
        (polygon) =>
          !Array.isArray(polygon) ||
          polygon.length < 3 ||
          polygon.some(
            (p) =>
              !Array.isArray(p) ||
              p.length !== 2 ||
              p.some(
                (v, i) =>
                  !Number.isInteger(v) || v < rect[i] || v > rect[i + 2],
              ),
          ),
      )
  )
    throw new Error("Invalid native attachment polygon");
  for (const source of [
    bundle,
    ...(bundle.integrated
      ? [bundle.integrated]
      : [bundle.body, ...bundle.parts]),
  ]) {
    if (["x", "y", "offset", "scale", "transform"].some((key) => key in source))
      throw new Error("Bundle sources cannot move independently");
  }
  return {
    ...bundle,
    rect: [...rect],
    ...(region.polygon ? { polygon: region.polygon.map((p) => [...p]) } : {}),
  };
}

/** Copy an owned module INCLUDING its transparent pixels, removing the old hand. */
export function replaceOwnedPixels(base, compiled, mask) {
  if (base.length !== compiled.length || base.length !== mask.length * 4)
    throw new Error("Invalid atomic replacement dimensions");
  const result = new Uint8ClampedArray(base);
  for (let pixel = 0; pixel < mask.length; pixel++) {
    if (!mask[pixel]) continue;
    const offset = pixel * 4;
    result.set(compiled.subarray(offset, offset + 4), offset);
  }
  return result;
}
