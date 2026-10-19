import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
for (const directory of ['assets', 'assets/js', 'assets/seasonal']) {
  for (const name of readdirSync(directory).filter((name) => name.endsWith('.js'))) {
    const result = spawnSync(process.execPath, ['--check', `${directory}/${name}`], {stdio:'inherit'});
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
