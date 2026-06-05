import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const files = [
  'tests/smoke.mjs',
  ...readdirSync('tests')
    .filter((file) => file.endsWith('.test.mjs'))
    .sort()
    .map((file) => `tests/${file}`),
];

let failed = false;
for (const file of files) {
  console.log(`\n> ${file}`);
  const result = spawnSync(process.execPath, [file], { stdio: 'inherit' });
  if (result.status !== 0) failed = true;
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log('\nAll tests passed.');
}
