import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const targetDir = path.join(rootDir, 'node_modules', 'chokidar');

for (const dependency of ['chokidar', 'is-binary-path', 'binary-extensions']) {
  fs.cpSync(
    path.join(rootDir, 'vendor', dependency),
    path.join(rootDir, 'node_modules', dependency),
    { recursive: true }
  );
}

const handlerPath = path.join(targetDir, 'lib', 'fsevents-handler.js');
const baseContent = fs.readFileSync(handlerPath, 'utf8');

let patched = baseContent.replace(
  /if \(fsevents\) \{\s*\/\/ TODO: real check[\s\S]*?if \(maj === 8 && min < 16\) \{\s*fsevents = undefined;\s*\}\s*\}\s*\}/,
  `if (fsevents) {
  if (typeof fsevents.canBeUsed === 'function') {
    if (!fsevents.canBeUsed()) {
      fsevents = undefined;
    }
  } else if (process.versions && process.versions.node) {
    const [maj, min] = process.versions.node.split('.').map((n) => Number.parseInt(n, 10));
    if (maj === 8 && min < 16) {
      fsevents = undefined;
    }
  }
}
const isMacos = process.platform === 'darwin' && typeof fsevents !== 'undefined';`
);

patched = patched.replace(
  /const canUse = \(\) => fsevents && FSEventsWatchers\.size < 128;/,
  `const canUse = () => Boolean(isMacos && fsevents && FSEventsWatchers.size < 128);`
);

fs.writeFileSync(handlerPath, patched);
