import { spawnSync } from 'node:child_process';
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function run(script, ...args) {
  const result = spawnSync(process.execPath, [path.join(root, 'tools', script), ...args], { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
run('build-release.mjs');
run('check-release.mjs');
const standardManifest = await readFile(path.join(root, 'release-manifest.json'), 'utf8');
const standardValidation = await readFile(path.join(root, 'release-validation.json'), 'utf8');
run('build-release.mjs', '--preview');
run('check-release.mjs', '--preview');
run('build-release.mjs', '--cloudflare-pages');
run('check-release.mjs');
await copyFile(path.join(root, 'release-validation.json'), path.join(root, 'release-validation.cloudflare-pages.json'));
run('build-release.mjs');
assert.equal(await readFile(path.join(root, 'release-manifest.json'), 'utf8'), standardManifest, 'Production build must be repeatable.');
await writeFile(path.join(root, 'release-validation.json'), standardValidation);
console.log('All three release profiles passed; repeatable standard production artifact restored.');
