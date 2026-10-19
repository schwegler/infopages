import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

test("parade ships the approved PNG pixels and verified logo copies unchanged", () => {
  const base = new URL("../assets/parade/", import.meta.url);
  const provenance = JSON.parse(readFileSync(new URL("provenance.json", base)));
  for (const { file, sha256, bytes } of provenance.assets) {
    const content = readFileSync(new URL(file, base));
    assert.equal(content.byteLength, bytes, file);
    assert.equal(
      createHash("sha256").update(content).digest("hex"),
      sha256,
      file,
    );
  }
  const andrew = readFileSync(
    new URL("../assets/brand/andrew-pencil-mascot.png", import.meta.url),
  );
  assert.equal(
    createHash("sha256").update(andrew).digest("hex"),
    provenance.reusedAndrewSha256,
  );
});
