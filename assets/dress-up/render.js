import { cleanExportAlpha } from "./export-alpha.js";
import { replaceOwnedPixels } from "./attachments.js";
import { CANVAS_SIZE, resolveSelection } from "./model.js";

/** Compile a self-contained native accessory/part module before a single commit. */
export async function renderSelection(manifest, selection, { signal } = {}) {
  const resolved = resolveSelection(manifest, selection);
  const sources = [
    ...resolved.layers,
    ...resolved.bundles.flatMap((bundle) =>
      bundle.integrated ? [bundle.integrated] : [bundle.body, ...bundle.parts],
    ),
  ];
  const bitmaps = new Map();
  try {
    const loaded = await Promise.allSettled(
      [...new Set(sources.map((layer) => layer.src))].map(async (src) => {
        const bitmap = await loadLayer(
          src,
          resolved.character.sourceCanvas,
          signal,
        );
        bitmaps.set(src, bitmap);
      }),
    );
    const failure = loaded.find((result) => result.status === "rejected");
    if (failure) throw failure.reason;
    signal?.throwIfAborted();
    const canvas = makeCanvas(CANVAS_SIZE);
    let exportSource = canvas;
    const output = canvas.getContext("2d", { alpha: true });
    if (!resolved.bundles.length && !resolved.character.attachmentRegion) {
      resolved.layers.forEach((layer) =>
        output.drawImage(
          bitmaps.get(layer.src),
          0,
          0,
          CANVAS_SIZE,
          CANVAS_SIZE,
        ),
      );
    } else {
      const size = resolved.character.sourceCanvas.width;
      const native = makeCanvas(size);
      exportSource = native;
      const baseContext = native.getContext("2d", { alpha: true });
      const paint = (context, layers, body) =>
        [...layers]
          .sort((a, b) => a.order - b.order)
          .forEach((layer) =>
            context.drawImage(
              layer.raster ??
                (layer.role === "body" && body ? body : bitmaps.get(layer.src)),
              0,
              0,
            ),
          );
      paint(baseContext, resolved.layers);
      // Use the same RGBA round-trip in both states so browser alpha rounding
      // cannot make unchanged antialiased head/foot pixels flicker.
      if (!resolved.bundles.length)
        baseContext.putImageData(
          baseContext.getImageData(0, 0, size, size),
          0,
          0,
        );
      for (const bundle of resolved.bundles) {
        const canonical = resolved.layers.find(
          (layer) => layer.role === "body",
        );
        const partBody = makeCanvas(size);
        const partContext = partBody.getContext("2d", { alpha: true });
        partContext.drawImage(bitmaps.get(canonical.src), 0, 0);
        const [left, top, right, bottom] = bundle.rect;
        let integratedMask;
        if (bundle.integrated) {
          const support = makeCanvas(size);
          const ctx = support.getContext("2d");
          ctx.beginPath();
          const points = bundle.polygon ?? [
            [left, top],
            [right, top],
            [right, bottom],
            [left, bottom],
          ];
          points.forEach(([x, y], i) =>
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
          );
          ctx.closePath();
          ctx.fill();
          const coverage = ctx.getImageData(0, 0, size, size).data;
          integratedMask = new Uint8Array(size * size);
          for (let p = 0; p < integratedMask.length; p++)
            integratedMask[p] = coverage[p * 4 + 3] >= 128 ? 1 : 0;
          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(bitmaps.get(bundle.integrated.src), 0, 0);
          const replacement = ctx.getImageData(0, 0, size, size);
          const original = partContext.getImageData(0, 0, size, size);
          original.data.set(
            replaceOwnedPixels(original.data, replacement.data, integratedMask),
          );
          partContext.putImageData(original, 0, 0);
        } else {
          // Replacement, not source-over: clear every old open-hand pixel in the owned region.
          partContext.save();
          if (bundle.polygon) {
            partContext.beginPath();
            bundle.polygon.forEach(([x, y], index) =>
              index ? partContext.lineTo(x, y) : partContext.moveTo(x, y),
            );
            partContext.closePath();
            partContext.clip();
          }
          partContext.clearRect(left, top, right - left, bottom - top);
          partContext.drawImage(
            bitmaps.get((bundle.integrated ?? bundle.body).src),
            left,
            top,
            right - left,
            bottom - top,
            left,
            top,
            right - left,
            bottom - top,
          );
          partContext.restore();
        }
        const frontLayers = [];
        if (bundle.integrated && bundle.frontPolygon) {
          const front = makeCanvas(size);
          const ctx = front.getContext("2d");
          ctx.beginPath();
          bundle.frontPolygon.forEach(([x, y], i) =>
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
          );
          ctx.closePath();
          ctx.fill();
          const mask = ctx.getImageData(0, 0, size, size).data;
          ctx.clearRect(0, 0, size, size);
          ctx.drawImage(bitmaps.get(bundle.integrated.src), 0, 0);
          const pixels = ctx.getImageData(0, 0, size, size);
          for (let p = 0; p < size * size; p++)
            if (mask[p * 4 + 3] < 128 || !integratedMask[p])
              pixels.data.fill(0, p * 4, p * 4 + 4);
          ctx.putImageData(pixels, 0, 0);
          frontLayers.push({ raster: front, role: "occlusion", order: 40 });
        }
        const compiled = makeCanvas(size);
        const compiledContext = compiled.getContext("2d", { alpha: true });
        // Clothing remains independent; compile its real occlusion into this atomic module.
        paint(
          compiledContext,
          [...resolved.layers, ...(bundle.parts ?? []), ...frontLayers],
          partBody,
        );
        const mask = new Uint8Array(size * size);
        for (let y = top; y < bottom; y++)
          mask.fill(1, y * size + left, y * size + right);
        const support = makeCanvas(size);
        const supportContext = support.getContext("2d", { alpha: true });
        if (integratedMask) mask.set(integratedMask);
        for (const part of bundle.parts ?? []) {
          supportContext.clearRect(0, 0, size, size);
          supportContext.drawImage(bitmaps.get(part.src), 0, 0);
          const rgba = supportContext.getImageData(0, 0, size, size).data;
          // Every nonzero source alpha participates, including faint noise; no cleanup threshold.
          for (let pixel = 0; pixel < mask.length; pixel++)
            if (rgba[pixel * 4 + 3]) mask[pixel] = 1;
        }
        const base = baseContext.getImageData(0, 0, size, size);
        const atomic = compiledContext.getImageData(0, 0, size, size);
        base.data.set(replaceOwnedPixels(base.data, atomic.data, mask));
        baseContext.putImageData(base, 0, 0);
      }
      signal?.throwIfAborted();
      output.drawImage(native, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
    return { canvas, exportSource, filename: resolved.filename };
  } finally {
    bitmaps.forEach((bitmap) => bitmap.close());
  }
}

function makeCanvas(size) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  if (!canvas.getContext("2d", { alpha: true }))
    throw new Error("Your browser cannot create a sticker canvas");
  return canvas;
}

async function loadLayer(src, sourceCanvas, signal) {
  signal?.throwIfAborted();
  const url = new URL(`/${src}`, location.origin);
  if (url.origin !== location.origin) {
    throw new Error("Sticker artwork must be hosted on this site");
  }
  const response = await fetch(url, {
    signal,
    credentials: "same-origin",
    mode: "same-origin",
    redirect: "error",
  });
  if (
    !response.ok ||
    !response.headers.get("content-type")?.includes("image/png")
  ) {
    throw new Error("Sticker artwork could not be loaded");
  }
  const bytes = await response.blob();
  const image = await createImageBitmap(bytes);
  if (signal?.aborted) {
    image.close();
    signal.throwIfAborted();
  }
  if (
    image.width !== sourceCanvas.width ||
    image.height !== sourceCanvas.height
  ) {
    image.close();
    throw new Error("Sticker artwork has the wrong canvas dimensions");
  }
  return image;
}

export function pngBlob(canvas) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob?.type === "image/png") resolve(blob);
        else reject(new Error("Your browser could not export this sticker"));
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
}

export async function downloadSticker(rendered) {
  const source = rendered.exportSource ?? rendered.canvas;
  const context = source.getContext("2d");
  const original = context.getImageData(0, 0, source.width, source.height);
  const cleaned = cleanExportAlpha(original.data, source.width, source.height);
  const native = makeCanvas(source.width);
  original.data.set(cleaned.pixels);
  native.getContext("2d").putImageData(original, 0, 0);
  const exported = makeCanvas(CANVAS_SIZE);
  exported.getContext("2d").drawImage(native, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  const blob = await pngBlob(exported);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = rendered.filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Allow the download to consume its URL before releasing the local bytes.
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
