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

// With the background dropped, a solid-colored cell (the matcher emits a
// space with a bg color for those) would vanish. Turn bright ones into a
// full block in fg so flat fills survive; dark ones stay transparent.
const SOLID_LUMA = 0.25;
function luma([r, g, b]) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function solidify(grid) {
  for (const row of grid) {
    for (const cell of row) {
      if (cell.glyph === ' ' && luma(cell.bg) >= SOLID_LUMA) {
        cell.glyph = '\u2588';
        cell.fg = cell.bg;
      }
    }
  }
  return grid;
}

let generated = 0;
for (const f of readdirSync('milli')) {
  const name = f.match(/^(.+)\.milli$/)?.[1];
  if (!name) continue;
  const luaPath = `splashes/${name}.lua`;
  if (existsSync(luaPath)) continue;
  const file = fmt.decodeMilli(readFileSync(`milli/${f}`));
  const grids = file.frames.map((_, i) => solidify(fmt.frameToGrid(file, i)));
  const delays = file.frames.map((fr) => fr.delay);
  // Threshold 1 = no background runs, same as `milli export --no-bg`, which is
  // how every original splash was made. Splashes sit on a dashboard, so a
  // painted background looks like a slab.
  const lua = emit.emitLuaData(grids, delays, file.width, file.height, true, 1);
  writeFileSync(luaPath, lua);
  console.log(`generated ${luaPath} (${file.frames.length} frames)`);
  generated++;
}
console.log(generated ? `${generated} lua file(s) generated` : 'nothing to generate');
