/** Export-only removal of entire remote alpha-1 islands. Sources stay untouched. */
export function cleanExportAlpha(rgba, width, height) {
  if (rgba.length !== width * height * 4)
    throw new Error("Invalid export pixels");
  const output = new Uint8ClampedArray(rgba);
  const seen = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let removedPixels = 0;
  let removedComponents = 0;
  for (let start = 0; start < seen.length; start++) {
    if (seen[start] || !rgba[start * 4 + 3]) continue;
    let end = 1;
    queue[0] = start;
    seen[start] = 1;
    let allOne = true;
    for (let cursor = 0; cursor < end; cursor++) {
      const pixel = queue[cursor];
      if (rgba[pixel * 4 + 3] !== 1) allOne = false;
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || xx >= width || yy < 0 || yy >= height) continue;
          const next = yy * width + xx;
          if (!seen[next] && rgba[next * 4 + 3]) {
            seen[next] = 1;
            queue[end++] = next;
          }
        }
      }
    }
    if (!allOne) continue;
    let nearCore = false;
    for (let cursor = 0; cursor < end && !nearCore; cursor++) {
      const x = queue[cursor] % width;
      const y = Math.floor(queue[cursor] / width);
      for (let dy = -10; dy <= 10 && !nearCore; dy++) {
        for (let dx = -10; dx <= 10; dx++) {
          if (dx * dx + dy * dy > 100) continue;
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || xx >= width || yy < 0 || yy >= height) continue;
          if (rgba[(yy * width + xx) * 4 + 3] >= 8) {
            nearCore = true;
            break;
          }
        }
      }
    }
    if (nearCore) continue;
    for (let cursor = 0; cursor < end; cursor++) {
      const offset = queue[cursor] * 4;
      output.fill(0, offset, offset + 4);
    }
    removedPixels += end;
    removedComponents++;
  }
  return { pixels: output, removedPixels, removedComponents };
}
