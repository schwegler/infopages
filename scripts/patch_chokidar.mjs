import fs from 'node:fs';
import path from 'node:path';

const sysDir = '/usr/share/nodejs/chokidar';
const targetDir = path.join(process.cwd(), 'node_modules', 'chokidar');

if (fs.existsSync(sysDir)) {
  fs.cpSync(sysDir, targetDir, { recursive: true });
}

const handlerPath = path.join(targetDir, 'lib', 'fsevents-handler.js');
let baseContent = '';
if (fs.existsSync(handlerPath)) {
  baseContent = fs.readFileSync(handlerPath, 'utf8');
}

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
  `const canUse = () => Boolean(fsevents && FSEventsWatchers.size < 128);`
);

fs.writeFileSync(handlerPath, patched);
