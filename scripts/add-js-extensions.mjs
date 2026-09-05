#!/usr/bin/env node
/**
 * Give every relative import in a package's compiled ESM an explicit file
 * extension, so plain Node can load it.
 *
 * tsc (module: ESNext, moduleResolution: bundler) emits the specifiers as
 * written in source — `./utils/foo` — which Vite resolves but Node's ESM
 * loader does not. That surfaced downstream as
 * "Cannot find module .../lib/constants/secure-storage.constants" whenever a
 * consumer prerendered a page that pulled a bpsk package in server-side.
 *
 * Usage: node ../../scripts/add-js-extensions.mjs lib   (from a package dir)
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'lib');
const HAS_EXT = /\.(js|mjs|cjs|json|svelte|css)$/;
const SPEC = /((?:^|\s)(?:import|export)\s[^'"]*?from\s*|\bimport\(\s*)(['"])(\.\.?\/[^'"]+)\2/g;

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith('.js')) yield p;
  }
}

let files = 0, rewritten = 0, unresolved = 0;
for (const file of walk(root)) {
  files++;
  const src = readFileSync(file, 'utf8');
  const out = src.replace(SPEC, (m, lead, q, spec) => {
    if (HAS_EXT.test(spec)) return m;
    const base = resolve(dirname(file), spec);
    let fixed = null;
    if (existsSync(base + '.js')) fixed = spec + '.js';
    else if (existsSync(join(base, 'index.js'))) fixed = spec.replace(/\/$/, '') + '/index.js';
    if (!fixed) { unresolved++; console.warn(`add-js-extensions: cannot resolve ${spec} from ${file}`); return m; }
    rewritten++;
    return `${lead}${q}${fixed}${q}`;
  });
  if (out !== src) writeFileSync(file, out);
}
console.log(`add-js-extensions: ${files} files, ${rewritten} specifiers fixed, ${unresolved} unresolved`);
process.exit(unresolved ? 1 : 0);
