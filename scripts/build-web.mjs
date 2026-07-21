import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'www');
const ignored = new Set(['.git', '.github', 'backend', 'docs', 'node_modules', 'scripts', 'tests', 'tests-manuels', 'www', 'android']);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (ignored.has(entry.name) || entry.isDirectory()) continue;
  if (!/\.(html|js|css|json|svg|png|webmanifest)$/i.test(entry.name)) continue;
  await cp(resolve(root, entry.name), resolve(output, entry.name));
}

console.log('Version Android préparée dans www/.');
