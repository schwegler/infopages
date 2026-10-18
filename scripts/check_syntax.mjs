import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
for (const name of readdirSync('assets/js').filter((name) => name.endsWith('.js'))) {
  const result = spawnSync(process.execPath, ['--check', `assets/js/${name}`], {stdio:'inherit'});
  if (result.status !== 0) process.exit(result.status || 1);
}
