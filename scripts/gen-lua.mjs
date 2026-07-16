#!/usr/bin/env node
// Generate splashes/<name>.lua for any milli/<name>.milli that lacks one.
// Run from repo root:
//   node scripts/gen-lua.mjs <path-to-milli-package>
// Existing .lua files are never overwritten (the 26 originals predate their
// .milli counterparts and keep their hand-tuned "NONE" backgrounds).

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const pkgRoot = process.argv[2];
if (!pkgRoot) {
  console.error('usage: gen-lua.mjs <path-to-milli-package>');
  process.exit(1);
}
const fmt = await import(
  pathToFileURL(resolve(pkgRoot, 'dist/src/core/format.js')).href
);
const emit = await import(
  pathToFileURL(resolve(pkgRoot, 'dist/src/core/emit.js')).href
);

let generated = 0;
for (const f of readdirSync('milli')) {
  const name = f.match(/^(.+)\.milli$/)?.[1];
  if (!name) continue;
  const luaPath = `splashes/${name}.lua`;
  if (existsSync(luaPath)) continue;
  const file = fmt.decodeMilli(readFileSync(`milli/${f}`));
  const grids = file.frames.map((_, i) => fmt.frameToGrid(file, i));
  const delays = file.frames.map((fr) => fr.delay);
  const lua = emit.emitLuaData(grids, delays, file.width, file.height, true, 0);
  writeFileSync(luaPath, lua);
  console.log(`generated ${luaPath} (${file.frames.length} frames)`);
  generated++;
}
console.log(generated ? `${generated} lua file(s) generated` : 'nothing to generate');
