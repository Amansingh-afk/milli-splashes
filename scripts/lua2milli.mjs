#!/usr/bin/env node
// One-time reverse importer: generated splash .lua -> .milli.
// Original .milli sources for the migrated splashes were lost; this parses the
// machine-generated Lua (see milli's emitLuaData) back into cell grids.
//
// Usage: node scripts/lua2milli.mjs <path-to-milli-repo> <splash.lua...>
// Writes milli/<name>.milli next to the splashes/ dir.
//
// Fidelity notes:
//   - bg "NONE" (terminal default) becomes rgb(0,0,0); .milli has no transparency.
//   - Splashes without M.colors get white-on-black.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [milliRepo, ...luaFiles] = process.argv.slice(2);
if (!milliRepo || luaFiles.length === 0) {
  console.error('usage: lua2milli.mjs <milli-repo> <splash.lua...>');
  process.exit(1);
}
const { encodeMilli } = await import(
  pathToFileURL(resolve(milliRepo, 'dist/src/core/format.js')).href
);

function unescLua(s) {
  return s.replace(/\\(["\\])/g, '$1');
}

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function parseLuaSplash(src) {
  const head = src.match(
    /local M = \{ cols = (\d+), rows = (\d+), delays = \{ ([^}]*) \}/,
  );
  if (!head) throw new Error('header not found');
  const cols = parseInt(head[1], 10);
  const rows = parseInt(head[2], 10);
  const delays = head[3].split(',').map((s) => parseInt(s.trim(), 10));

  const frames = [];
  const colors = [];
  const blockRe = /M\.(frames|colors)\[(\d+)\] = \(function\(\) return \{\n([\s\S]*?)\n\} end\)\(\)/g;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    const [, kind, idxStr, body] = m;
    const idx = parseInt(idxStr, 10) - 1;
    if (kind === 'frames') {
      const rowStrs = [];
      for (const line of body.split('\n')) {
        const rm = line.match(/^\s*"(.*)",\s*$/);
        if (rm) rowStrs.push(unescLua(rm[1]));
      }
      frames[idx] = rowStrs;
    } else {
      const rowRuns = [];
      for (const line of body.split('\n')) {
        if (!/^\s*\{/.test(line)) continue;
        const runs = [];
        const runRe = /\{(\d+),(\d+),"([^"]*)","([^"]*)"\}/g;
        let r;
        while ((r = runRe.exec(line)) !== null) {
          runs.push({
            sb: parseInt(r[1], 10),
            eb: parseInt(r[2], 10),
            fg: r[3],
            bg: r[4],
          });
        }
        rowRuns.push(runs);
      }
      colors[idx] = rowRuns;
    }
  }
  return { cols, rows, delays, frames, colors };
}

const enc = new TextEncoder();
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];

function toGrid(rowStrs, rowRuns, cols, rows) {
  const grid = [];
  for (let y = 0; y < rows; y++) {
    const glyphs = [...(rowStrs[y] ?? '')];
    while (glyphs.length < cols) glyphs.push(' ');
    const runs = rowRuns?.[y] ?? [];
    const row = [];
    let b = 0;
    let ri = 0;
    for (let x = 0; x < cols; x++) {
      const glyph = glyphs[x];
      while (ri < runs.length && b >= runs[ri].eb) ri++;
      const run = ri < runs.length && b >= runs[ri].sb ? runs[ri] : null;
      row.push({
        glyph,
        fg: run ? hexToRgb(run.fg) : WHITE,
        bg: run && run.bg !== 'NONE' ? hexToRgb(run.bg) : BLACK,
      });
      b += enc.encode(glyph).length;
    }
    grid.push(row);
  }
  return grid;
}

for (const luaPath of luaFiles) {
  const name = basename(luaPath, '.lua');
  const src = await readFile(luaPath, 'utf8');
  const { cols, rows, delays, frames, colors } = parseLuaSplash(src);
  const grids = frames.map((rowStrs, i) => toGrid(rowStrs, colors[i], cols, rows));
  if (grids.length !== delays.length) {
    throw new Error(`${name}: ${grids.length} frames vs ${delays.length} delays`);
  }
  const buf = encodeMilli(grids, delays, true);
  const outDir = join(dirname(dirname(resolve(luaPath))), 'milli');
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, `${name}.milli`);
  await writeFile(outPath, buf);
  console.log(
    `${name}: ${grids.length} frames ${cols}x${rows} -> ${outPath} (${(buf.length / 1024).toFixed(1)}KB)`,
  );
}
