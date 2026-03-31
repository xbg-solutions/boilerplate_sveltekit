#!/usr/bin/env node
'use strict';

/**
 * generate-component-manifest.cjs
 *
 * Generates the component-manifest/ directory at the repo root from the
 * create-frontend registry. Produces:
 *
 *   component-manifest/manifest.json          — Full presentation manifest
 *   component-manifest/images/**‌/*.png        — Figma screenshots (opt-in)
 *   component-manifest/code/**‌/*.json         — Encoded component source + metadata
 *
 * Usage:
 *   node packages/create-frontend/scripts/generate-component-manifest.cjs
 *   node packages/create-frontend/scripts/generate-component-manifest.cjs --images <figmaAccessToken>
 *   node packages/create-frontend/scripts/generate-component-manifest.cjs --images <figmaAccessToken> --force
 *   node packages/create-frontend/scripts/generate-component-manifest.cjs --update-meta
 *
 * Flags:
 *   --images <token>  Fetch Figma screenshots for any component with a figmaNodeId in component-meta.json.
 *                     The Figma personal access token must immediately follow the --images flag.
 *   --force           Re-fetch images even if already saved to disk (use with --images)
 *   --update-meta     Scan the registry and add any missing stubs to component-meta.json (non-destructive)
 *
 * npm scripts (package.json):
 *   npm run generate-manifest
 *   npm run generate-manifest:images -- <figmaAccessToken>
 *   npm run generate-manifest:update-meta
 *
 * Figma file key (shadcn-ui-kit Pro Blocks): 2Yi23pr62TTBzTJmOUORvR
 */

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');
const https = require('https');
const { promisify } = require('util');

const gzipAsync = promisify(zlib.gzip);

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const REPO_ROOT       = path.resolve(__dirname, '..', '..', '..');
const REGISTRY_ROOT   = path.join(__dirname, '..', 'src', 'registry');
const INSTALL_MANIFEST= path.join(__dirname, '..', 'src', 'manifest.json');
const META_PATH       = path.join(__dirname, 'component-meta.json');
const OUT_DIR         = path.join(REPO_ROOT, 'component-manifest');
const IMAGES_DIR      = path.join(OUT_DIR, 'images');
const CODE_DIR        = path.join(OUT_DIR, 'code');
const MANIFEST_OUT    = path.join(OUT_DIR, 'manifest.json');

const FIGMA_FILE_KEY  = '2Yi23pr62TTBzTJmOUORvR';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args         = process.argv.slice(2);
const FETCH_IMAGES = args.includes('--images');
const FORCE_IMAGES = args.includes('--force');
const UPDATE_META  = args.includes('--update-meta');

// Figma access token: the value immediately after --images, e.g.:
//   node generate-component-manifest.cjs --images figd_xxxx
//   npm run generate-manifest:images -- figd_xxxx
const imagesIdx = args.indexOf('--images');
const FIGMA_KEY = (FETCH_IMAGES && imagesIdx !== -1 && !args[imagesIdx + 1]?.startsWith('--'))
  ? args[imagesIdx + 1] || ''
  : '';

// ---------------------------------------------------------------------------
// Helpers — playground URL (multi-file $lib resolver)
// ---------------------------------------------------------------------------

const LIB_ROOT = path.join(REPO_ROOT, 'src', 'lib');

/** Return true only if p exists AND is a regular file (not a directory). */
function isFile(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

/** Resolve a $lib/... import to an absolute path on disk, or null. */
function resolveLib(libPath) {
  const rel = libPath.replace(/^\$lib\//, '');
  const base = path.join(LIB_ROOT, rel);
  // Check index files BEFORE .svelte so bare module paths like
  // '$lib/components/ui/button' resolve to the barrel index.ts
  // rather than an adjacent Button.svelte (avoids case-insensitive FS issues).
  for (const c of [base, `${base}.ts`, `${base}.js`,
    path.join(base, 'index.ts'), path.join(base, 'index.js'), `${base}.svelte`]) {
    if (isFile(c)) return c;
  }
  return null;
}

/** Resolve a relative import path from a given directory to an absolute path. */
function resolveRel(rel, fromDir) {
  const base = path.resolve(fromDir, rel);
  for (const c of [base, `${base}.ts`, `${base}.js`,
    path.join(base, 'index.ts'), path.join(base, 'index.js'), `${base}.svelte`]) {
    if (isFile(c)) return c;
  }
  return null;
}

/** Convert an absolute lib path to a flat playground filename. */
function pgFileName(absPath) {
  const rel = path.relative(LIB_ROOT, absPath);
  return rel.replace(/[\\/]/g, '_').replace(/\.ts$/, '.js');
}

/** Parse `export { A, B } from './x'` → { A: './x', B: './x' } */
function parseReexports(source) {
  const map = {};
  const re = /export\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const from = m[2];
    for (let spec of m[1].split(',')) {
      spec = spec.trim();
      if (!spec || /^type\b/.test(spec)) continue;
      const asMatch = spec.match(/(?:default\s+as\s+)?(\w+)(?:\s+as\s+(\w+))?/);
      const exported = asMatch ? (asMatch[2] || asMatch[1]) : null;
      if (exported && exported !== 'type') map[exported] = from;
    }
  }
  return map;
}

/**
 * Follow barrel chain (up to 4 hops) to find the actual .svelte file for a
 * named export. Handles both:
 *   export { Button } from './button'          (re-export with from)
 *   import Button from '../Button.svelte';
 *   export { Button }                          (import + re-export without from)
 */
function findSvelteForName(name, barrelAbsPath, _depth) {
  if ((_depth || 0) > 4) return null;
  if (!isFile(barrelAbsPath)) return null;
  const src = fs.readFileSync(barrelAbsPath, 'utf8');
  const barrelDir = path.dirname(barrelAbsPath);

  // Strategy 1: export { Name } from './path' (re-export with from clause)
  const relPath = parseReexports(src)[name];
  if (relPath) {
    const resolved = resolveRel(relPath, barrelDir);
    if (!resolved) return null;
    if (resolved.endsWith('.svelte')) return resolved;
    return findSvelteForName(name, resolved, (_depth || 0) + 1);
  }

  // Strategy 2: import Name from './path' (default import, then re-exported)
  const defMatch = new RegExp(`import\\s+${name}\\s+from\\s+['"]([^'"]+)['"]`).exec(src);
  if (defMatch) {
    const resolved = resolveRel(defMatch[1], barrelDir);
    if (!resolved) return null;
    if (resolved.endsWith('.svelte')) return resolved;
    return findSvelteForName(name, resolved, (_depth || 0) + 1);
  }

  // Strategy 3: import { Name } from './path' (named import, re-exported)
  const namedMatch = new RegExp(`import\\s+\\{[^}]*\\b${name}\\b[^}]*\\}\\s+from\\s+['"]([^'"]+)['"]`).exec(src);
  if (namedMatch) {
    const resolved = resolveRel(namedMatch[1], barrelDir);
    if (!resolved) return null;
    if (resolved.endsWith('.svelte')) return resolved;
    return findSvelteForName(name, resolved, (_depth || 0) + 1);
  }

  return null;
}

/** Strip TypeScript-only syntax from a .ts file to make it valid JS. */
function stripTS(src) {
  // Protect rename specifiers in import/export { X as Y } blocks BEFORE
  // any stripping so we don't accidentally remove them.
  // Strategy: temporarily replace " as Identifier" inside {…} spec lists
  // with a placeholder, strip, then restore.

  // We only need to preserve renames that follow an identifier (not type casts
  // which follow expressions).  Simple heuristic: inside an import/export
  // specifier block the pattern is always "word as word".
  const renames = [];
  let guarded = src.replace(
    /(\bimport\b|\bexport\b)\s*\{([^}]+)\}/g,
    (full, kw, specs) => {
      const patched = specs.replace(/\b(\w+)\s+as\s+(\w+)\b/g, (m, a, b) => {
        const idx = renames.length;
        renames.push(m);
        return `\x00RENAME${idx}\x00`;
      });
      return `${kw} {${patched}}`;
    }
  );

  guarded = guarded
    .replace(/^import\s+type\b[^\n]*\n?/gm, '')            // import type {...}
    .replace(/^export\s+type\b[^\n]*\n?/gm, '')             // export type {...}
    .replace(/,\s*type\s+\w+(?=\s*[,}])/g, '')              // , type Foo in list
    .replace(/\btype\s+(\w+)(?=\s*[,}])/g, '$1')            // type Foo at start
    .replace(/:\s*[\w.]+(?:<[^>]*>)?(?:\[\])?\s*(?=[,)=;\n])/g, '') // :Type
    .replace(/\s+as\s+[\w<>[\].]+(?=\s*[;,)}\n])/g, '');   // as Type casts

  // Restore rename placeholders
  return guarded.replace(/\x00RENAME(\d+)\x00/g, (_, i) => renames[+i]);
}

/** Inline stub for $lib/utils/cn — avoids including cn.ts + its npm deps. */
const CN_INLINE = "const cn = (...c) => c.flat(Infinity).filter(Boolean).join(' ');";

// ---------------------------------------------------------------------------
// Stubs for external packages unavailable in the Svelte playground
// ---------------------------------------------------------------------------

/**
 * Per-package, per-export inline stubs.
 * Each value is a self-contained JavaScript declaration string.
 */
const EXTERNAL_STUBS = {
  '$app/navigation': {
    goto:         "const goto = (url, _opts) => { if (typeof window !== 'undefined') window.location.href = String(url); };",
    afterNavigate:  'const afterNavigate = (_fn) => {};',
    beforeNavigate: 'const beforeNavigate = (_fn) => {};',
    pushState:    'const pushState = (_url, _state) => {};',
    replaceState: 'const replaceState = (_url, _state) => {};',
    invalidate:   'const invalidate = async (_url) => {};',
    invalidateAll:'const invalidateAll = async () => {};',
    preloadCode:  'const preloadCode = async (..._urls) => {};',
    preloadData:  "const preloadData = async (_url) => ({ type: 'loaded', status: 200, data: {} });",
  },
  '$app/stores': {
    page:       "const page = { subscribe: (fn) => { fn({ url: new URL('http://localhost/'), params: {}, data: {}, status: 200, route: { id: null }, form: null }); return () => {}; } };",
    navigating: 'const navigating = { subscribe: (fn) => { fn(null); return () => {}; } };',
    updated:    'const updated = { subscribe: (fn) => { fn(false); return () => {}; }, check: async () => false };',
  },
  '$app/environment': {
    browser:  'const browser = typeof window !== "undefined";',
    dev:      'const dev = false;',
    building: 'const building = false;',
    version:  'const version = "1.0.0";',
  },
  '@xbg.solutions/bpsk-core': {
    cn:           "const cn = (...c) => c.flat(Infinity).filter(Boolean).join(' ');",
    toastService: 'const toastService = { success: (m) => console.log("[toast:success]", m), error: (m) => console.error("[toast:error]", m), info: (m) => console.info("[toast:info]", m), warning: (m) => console.warn("[toast:warn]", m), show: (m, _t) => console.log("[toast]", m) };',
    AUTH_ROUTES:  "const AUTH_ROUTES = { LOGIN: '/login', SIGNUP: '/signup', FORGOT_PASSWORD: '/forgot-password', RESET_PASSWORD: '/reset-password', HOME: '/', DASHBOARD: '/dashboard' };",
    APP_CONFIG:   "const APP_CONFIG = { appName: 'App', version: '1.0.0', apiUrl: 'https://api.example.com', features: {} };",
    useAuth:      'const useAuth = () => ({ user: null, isAuthenticated: false, loading: false, signIn: async () => {}, signOut: async () => {} });',
  },
  '@xbg.solutions/bpsk-utils-sanitizer': {
    escapeHtml:   "const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#39;');",
    sanitizeText: 'const sanitizeText = (s) => String(s).replace(/<[^>]*>/g, "");',
  },
  '@xbg.solutions/bpsk-utils-file-upload': {
    storageService: 'const storageService = { upload: async (file, storagePath) => ({ url: URL.createObjectURL(file), path: storagePath || file.name }), delete: async (_path) => {}, getUrl: async (_path) => "", getMetadata: async (_path) => ({}) };',
  },
  '@xbg.solutions/bpsk-utils-firebase-auth': {
    safeSendEmailLink: 'const safeSendEmailLink = async (_email) => ({ success: true, error: null });',
    signInWithGoogle:  'const signInWithGoogle = async () => ({ user: null, error: null });',
    signInWithPhone:   'const signInWithPhone = async (_phone) => ({ verificationId: "demo", error: null });',
    confirmPhoneCode:  'const confirmPhoneCode = async (_vid, _code) => ({ user: null, error: null });',
  },
};

/**
 * Replace imports from private / SvelteKit-specific packages with inline stubs.
 * Handles named imports including aliases: import { A, B as b } from 'pkg'
 */
function rewriteExternalImports(source) {
  const pkgList = Object.keys(EXTERNAL_STUBS);
  if (pkgList.length === 0) return source;

  const escapedPkgs = pkgList.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pkgPattern  = escapedPkgs.join('|');
  const importRe    = new RegExp(
    `import\\s*\\{([^}]+)\\}\\s*from\\s*['"](?:${pkgPattern})['"]\\s*;?`,
    'g'
  );

  return source.replace(importRe, (match, specs) => {
    const pkgMatch = match.match(/from\s*['"]([^'"]+)['"]/);
    if (!pkgMatch) return match;
    const pkg   = pkgMatch[1];
    const stubs = EXTERNAL_STUBS[pkg];
    if (!stubs) return `// unresolved external: ${pkg}`;

    const lines = [];
    for (let spec of specs.split(',')) {
      spec = spec.trim();
      if (!spec || /^type[\s\b]/.test(spec)) continue;
      const asMatch  = spec.match(/^(\w+)\s+as\s+(\w+)$/);
      const original = asMatch ? asMatch[1] : spec;
      const alias    = asMatch ? asMatch[2] : null;
      const stubLine = stubs[original];
      if (!stubLine) {
        lines.push(`// playground stub not available: ${original} from ${pkg}`);
        continue;
      }
      // If imported with an alias (e.g. toastService as toast), rename the const
      lines.push(alias
        ? stubLine.replace(new RegExp(`\\bconst ${original}\\b`), `const ${alias}`)
        : stubLine
      );
    }
    return lines.join('\n');
  });
}

/**
 * Strip Svelte 4 slot-prop patterns that are invalid in Svelte 5 (the playground).
 *
 *  Svelte 4:  <Foo asChild let:builder> <Bar builders={[builder]} ...>
 *  Svelte 5:  <Foo>                     <Bar ...>
 *
 * Our DropdownMenuTrigger handles clicks via context already.
 * Without asChild it wraps in a plain <button>; click propagation ensures
 * the dropdown still opens correctly in the playground demo.
 */
function fixSvelte4SlotProps(source) {
  // Remove standalone `asChild` attribute (no value, e.g. <Foo asChild ...>)
  source = source.replace(/\s+asChild(?=[\s/>])/g, '');
  // Remove `let:builder` slot-prop directive
  source = source.replace(/\s+let:builder\b/g, '');
  // Remove `builders={…}` prop (e.g. builders={[builder]})
  source = source.replace(/\s+builders=\{[^}]*\}/g, '');
  return source;
}

/** Non-existent Lucide icon names → nearest valid substitute */
const LUCIDE_ICON_FIXES = {
  Scatter3D: 'ScatterChart',
};

/**
 * Replace imports of icons that don't exist in the playground's lucide-svelte
 * with valid substitutes, and patch their usages in the template too.
 */
function fixLucideImports(source) {
  const entries = Object.entries(LUCIDE_ICON_FIXES);
  if (entries.length === 0) return source;

  // Patch specifier names inside lucide-svelte import blocks
  source = source.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"]lucide-svelte['"]/g,
    (match, specs) => {
      const patched = specs.replace(
        new RegExp(`\\b(${Object.keys(LUCIDE_ICON_FIXES).join('|')})\\b`, 'g'),
        name => LUCIDE_ICON_FIXES[name]
      );
      return match.replace(specs, patched);
    }
  );

  // Also replace any remaining usages of the old names in the component body
  for (const [bad, good] of entries) {
    source = source.replace(new RegExp(`\\b${bad}\\b`, 'g'), good);
  }

  return source;
}

/**
 * Rewrite $lib/... imports in a source string.
 * Populates `collected` Map<pgFileName, contents> with all needed extra files.
 * Returns the rewritten source.
 */
function rewriteLibImports(source, collected) {
  // 0. Fix Svelte 4 slot-prop patterns, stub external packages, fix bad icons.
  source = fixSvelte4SlotProps(source);
  source = rewriteExternalImports(source);
  source = fixLucideImports(source);

  // 1. Replace $lib/utils/cn import with a self-contained inline
  source = source.replace(
    /^[^\n]*from\s+['"]\$lib\/utils\/cn['"]\s*;?[^\n]*$/m,
    CN_INLINE
  );

  // 2. Named barrel imports from $lib/components/ui (or $lib/components/ui/icon)
  //    → resolve each name directly to its .svelte file
  source = source.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"](\$lib\/components\/(?:ui|ui\/icon))['"]/g,
    (match, specs, libPath) => {
      const barrelAbs = resolveLib(libPath);
      if (!barrelAbs) return `// unresolved: ${libPath}`;
      const names = specs.split(',')
        .map(s => s.trim().replace(/^type\s+/, ''))
        .filter(Boolean);
      return names.map(name => {
        const svelteAbs = findSvelteForName(name, barrelAbs);
        if (!svelteAbs) return `// could not resolve: ${name} from ${libPath}`;
        const pg = pgFileName(svelteAbs);
        if (!collected.has(pg)) addLibFile(svelteAbs, collected);
        return `import { default as ${name} } from './${pg}'`;
      }).join('\n');
    }
  );

  // 3. Any remaining $lib/... imports (direct .svelte, blocks, etc.)
  source = source.replace(
    /from\s+['"](\$lib\/[^'"]+)['"]/g,
    (match, libPath) => {
      if (libPath === '$lib/utils/cn') return '/* cn inlined */';
      const abs = resolveLib(libPath);
      if (!abs) return match;
      const pg = pgFileName(abs);
      if (!collected.has(pg)) addLibFile(abs, collected);
      return match.replace(libPath, `./${pg}`);
    }
  );

  return source;
}

/**
 * Read a lib file, process its imports, and add it (and its deps) to collected.
 */
function addLibFile(absPath, collected) {
  const pg = pgFileName(absPath);
  if (collected.has(pg)) return; // already queued or done
  collected.set(pg, null);       // sentinel — prevents infinite cycles

  let src = fs.readFileSync(absPath, 'utf8');

  // .ts files need type stripping + relative-import rewriting
  if (absPath.endsWith('.ts') && !absPath.endsWith('.d.ts')) {
    src = stripTS(src);
    const dir = path.dirname(absPath);
    src = src.replace(/from\s+['"](\.[^'"]+)['"]/g, (match, rel) => {
      const childAbs = resolveRel(rel, dir);
      if (!childAbs || !childAbs.startsWith(LIB_ROOT)) return match;
      const childPg = pgFileName(childAbs);
      if (!collected.has(childPg)) addLibFile(childAbs, collected);
      return match.replace(rel, `./${childPg}`);
    });
  }

  // Rewrite $lib imports inside this file too
  src = rewriteLibImports(src, collected);

  collected.set(pg, src);
}

async function buildPlaygroundUrl(source, title, sourceFile) {
  const collected = new Map(); // pgFileName -> rewritten contents
  const appSource = rewriteLibImports(source, collected);

  const files = [
    { type: 'file', name: 'App.svelte', basename: 'App.svelte', contents: appSource, text: true },
    ...[...collected.entries()]
      .filter(([, v]) => v !== null)
      .map(([name, contents]) => ({ type: 'file', name, basename: name, contents, text: true })),
  ];

  const payload = JSON.stringify({ name: title, tailwind: true, files });
  const compressed = await gzipAsync(Buffer.from(payload, 'utf8'));
  return `https://svelte.dev/playground/untitled#${compressed.toString('base64')}`;
}

// ---------------------------------------------------------------------------
// Helpers — import parser
// ---------------------------------------------------------------------------

function parseImports(source) {
  const result = [];
  // named imports: import { A, B } from 'x'
  const namedRe = /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = namedRe.exec(source)) !== null) {
    const specifiers = m[1].split(',').map(s => s.trim().replace(/\s+as\s+\S+/, '')).filter(Boolean);
    result.push({ specifiers, from: m[2] });
  }
  // default imports: import Foo from 'x'
  const defaultRe = /import\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g;
  while ((m = defaultRe.exec(source)) !== null) {
    result.push({ specifiers: [m[1]], from: m[2] });
  }
  // namespace: import * as Foo from 'x'
  const nsRe = /import\s+\*\s+as\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g;
  while ((m = nsRe.exec(source)) !== null) {
    result.push({ specifiers: [`* as ${m[1]}`], from: m[2] });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Helpers — name formatting
// ---------------------------------------------------------------------------

function toTitleCase(str) {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function componentNameToTitle(name) {
  // "HeroSection01" → "Hero Section 01"
  // "BrandIcon"     → "Brand Icon"
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/(\D)(\d+)$/, '$1 $2')
    .trim();
}

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-');
}

// ---------------------------------------------------------------------------
// Helpers — HTTP fetch (no external deps)
// ---------------------------------------------------------------------------

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'X-Figma-Token': FIGMA_KEY } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return httpsGet(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadFile(url, dest) {
  const { body } = await httpsGet(url);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, body);
}

async function figmaGetImageUrls(nodeIds) {
  if (!FIGMA_KEY) throw new Error('No Figma access token provided. Usage: --images <figmaAccessToken>');
  const ids = nodeIds.join(',');
  const url = `https://api.figma.com/v1/images/${FIGMA_FILE_KEY}?ids=${encodeURIComponent(ids)}&format=png&scale=0.5`;
  const { status, body } = await httpsGet(url);
  if (status !== 200) throw new Error(`Figma API ${status}: ${body.toString()}`);
  const json = JSON.parse(body.toString());
  if (json.err) throw new Error(`Figma error: ${json.err}`);
  return json.images; // { "nodeId": "https://..." }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Helpers — fs
// ---------------------------------------------------------------------------

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------
// Load metadata seed file
// ---------------------------------------------------------------------------

function loadMeta() {
  if (fs.existsSync(META_PATH)) {
    return JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
  }
  return { atoms: {}, advanced: {}, blocks: {} };
}

function getGroupMeta(meta, category, groupId) {
  return (meta[category] || {})[groupId] || {};
}

function getVariantMeta(meta, category, groupId, componentName) {
  const group = getGroupMeta(meta, category, groupId);
  return (group.variants || {})[componentName] || {};
}

// ---------------------------------------------------------------------------
// Registry walker
// ---------------------------------------------------------------------------

function listSvelteFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.svelte'))
    .sort();
}

// ---------------------------------------------------------------------------
// Core: process one component variant
// ---------------------------------------------------------------------------

async function processVariant(opts) {
  const {
    category,      // 'atoms' | 'advanced' | 'blocks'
    groupId,       // 'hero-section' | 'icon' | etc.
    componentName, // 'HeroSection01'
    sourceFile,    // absolute path to .svelte
    meta,          // loaded component-meta.json
    imagesFetched, // Map nodeId -> local image path (populated during image batch)
  } = opts;

  const source = fs.readFileSync(sourceFile, 'utf8');
  const imports = parseImports(source);

  // Meta lookups
  const variantMeta  = getVariantMeta(meta, category, groupId, componentName);
  const groupMeta    = getGroupMeta(meta, category, groupId);

  const title        = variantMeta.title       || componentNameToTitle(componentName);
  const description  = variantMeta.description || groupMeta.description || `${toTitleCase(groupId)} component.`;
  const tags         = [...(groupMeta.tags || []), ...(variantMeta.tags || [])];
  const figmaNodeId  = variantMeta.figmaNodeId || null;

  // Playground URL — $lib imports are resolved into additional playground files.
  const playgroundUrl = await buildPlaygroundUrl(source, `XBG — ${title}`, sourceFile);

  // Image path (relative, for the manifest)
  const relImagePath  = `images/${category}/${groupId}/${componentName}.png`;
  const absImagePath  = path.join(IMAGES_DIR, category, groupId, `${componentName}.png`);
  const imageExists   = fs.existsSync(absImagePath);
  const imageReady    = imageExists || (figmaNodeId && imagesFetched.has(figmaNodeId));

  // Write code JSON
  const codeData = {
    id:            slugify(componentName),
    name:          componentName,
    category,
    group:         groupId,
    title,
    description,
    tags,
    source,
    imports,
    figmaNodeId,
    playgroundUrl,
  };
  const codeRelPath = `code/${category}/${groupId}/${componentName}.json`;
  writeJson(path.join(CODE_DIR, category, groupId, `${componentName}.json`), codeData);

  // If image was fetched this run, save it
  if (figmaNodeId && imagesFetched.has(figmaNodeId) && (!imageExists || FORCE_IMAGES)) {
    const imgUrl = imagesFetched.get(figmaNodeId);
    try {
      await downloadFile(imgUrl, absImagePath);
    } catch (e) {
      console.warn(`  ⚠ Could not download image for ${componentName}: ${e.message}`);
    }
  }

  return {
    id:               slugify(componentName),
    name:             componentName,
    title,
    description,
    tags,
    figmaNodeId,
    thumbnailUrl:     imageReady ? relImagePath : null,
    thumbnailAvailable: imageReady,
    playgroundUrl,
    codeFile:         codeRelPath,
    filePath:         `${category}/${groupId}/${componentName}.svelte`,
    importCount:      imports.length,
  };
}

// ---------------------------------------------------------------------------
// Core: collect all Figma node IDs, batch-fetch images
// ---------------------------------------------------------------------------

async function batchFetchFigmaImages(allVariantMetas) {
  const imagesFetched = new Map();
  if (!FETCH_IMAGES || !FIGMA_KEY) return imagesFetched;

  // Gather node IDs that need fetching
  const needFetch = allVariantMetas.filter(v => {
    if (!v.figmaNodeId) return false;
    const absPath = path.join(IMAGES_DIR, v.category, v.groupId, `${v.componentName}.png`);
    return FORCE_IMAGES || !fs.existsSync(absPath);
  });

  if (needFetch.length === 0) {
    console.log('  ✓ All images already present (use --force to re-fetch)');
    return imagesFetched;
  }

  const BATCH = 10;
  console.log(`  Fetching ${needFetch.length} Figma screenshots in batches of ${BATCH}…`);

  // Batch into groups of BATCH
  for (let i = 0; i < needFetch.length; i += BATCH) {
    const batch = needFetch.slice(i, i + BATCH);
    const nodeIds = batch.map(v => v.figmaNodeId);
    try {
      const urlMap = await figmaGetImageUrls(nodeIds);
      for (const [nodeId, url] of Object.entries(urlMap)) {
        if (url) imagesFetched.set(nodeId, url);
      }
      console.log(`  ✓ Batch ${Math.floor(i / BATCH) + 1}: got ${Object.keys(urlMap).length} URLs`);
    } catch (e) {
      console.warn(`  ✗ Batch ${Math.floor(i / BATCH) + 1} failed: ${e.message}`);
    }
    // Respect Figma rate limit
    if (i + BATCH < needFetch.length) await sleep(1500);
  }

  return imagesFetched;
}

// ---------------------------------------------------------------------------
// Core: update-meta mode — scan registry and add missing stubs
// ---------------------------------------------------------------------------

function updateMeta(meta, installManifest) {
  let changed = false;

  function ensureGroup(categoryKey, groupId, name) {
    if (!meta[categoryKey]) meta[categoryKey] = {};
    if (!meta[categoryKey][groupId]) {
      meta[categoryKey][groupId] = {
        title: toTitleCase(groupId),
        description: `${toTitleCase(groupId)} components.`,
        tags: [],
        variants: {},
      };
      changed = true;
    }
    return meta[categoryKey][groupId];
  }

  function ensureVariant(group, componentName) {
    if (!group.variants) group.variants = {};
    if (!group.variants[componentName]) {
      group.variants[componentName] = {
        title: componentNameToTitle(componentName),
        description: '',
        tags: [],
        figmaNodeId: null,
      };
      changed = true;
    }
  }

  // Atoms
  for (const [atomId, atomEntry] of Object.entries(installManifest.atoms || {})) {
    const group = ensureGroup('atoms', atomId, atomEntry.name);
    const dir = path.join(REGISTRY_ROOT, 'atoms', atomId);
    for (const file of listSvelteFiles(dir)) {
      ensureVariant(group, file.replace('.svelte', ''));
    }
  }

  // Advanced
  for (const [advId, advEntry] of Object.entries(installManifest.advanced || {})) {
    const dir = path.join(REGISTRY_ROOT, 'advanced');
    const group = ensureGroup('advanced', 'advanced', 'Advanced');
    const files = typeof advEntry.files === 'string' ? [advEntry.files] : (advEntry.files || []);
    for (const file of files.filter(f => f.endsWith('.svelte'))) {
      ensureVariant(group, file.replace('.svelte', ''));
    }
  }

  // Blocks
  for (const [blockKey, blockEntry] of Object.entries(installManifest.blocks || {})) {
    const groupId = blockKey.replace(/^block-/, '');
    const group = ensureGroup('blocks', groupId, blockEntry.name);
    const dir = path.join(REGISTRY_ROOT, 'blocks', groupId);
    for (const file of listSvelteFiles(dir)) {
      ensureVariant(group, file.replace('.svelte', ''));
    }
  }

  return changed;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n🔧 XBG Component Manifest Generator\n');

  const installManifest = JSON.parse(fs.readFileSync(INSTALL_MANIFEST, 'utf8'));
  let meta = loadMeta();

  // --- Update-meta mode ---
  if (UPDATE_META) {
    console.log('📝 Scanning registry and updating component-meta.json stubs…');
    const changed = updateMeta(meta, installManifest);
    if (changed) {
      fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2), 'utf8');
      console.log('  ✓ component-meta.json updated with new stubs\n');
    } else {
      console.log('  ✓ No new stubs needed — component-meta.json is up to date\n');
    }
    // Continue into full generation below
  }

  // Ensure output dirs
  ensureDir(OUT_DIR);
  ensureDir(IMAGES_DIR);
  ensureDir(CODE_DIR);

  // --- Collect all variants that have figmaNodeIds (for batch image fetch) ---
  const allVariantMetas = [];

  // Gather from atoms
  for (const [atomId] of Object.entries(installManifest.atoms || {})) {
    const dir = path.join(REGISTRY_ROOT, 'atoms', atomId);
    for (const file of listSvelteFiles(dir)) {
      const componentName = file.replace('.svelte', '');
      const vm = getVariantMeta(meta, 'atoms', atomId, componentName);
      allVariantMetas.push({ category: 'atoms', groupId: atomId, componentName, figmaNodeId: vm.figmaNodeId || null });
    }
  }

  // Gather from advanced (flat dir)
  const advDir = path.join(REGISTRY_ROOT, 'advanced');
  for (const file of listSvelteFiles(advDir)) {
    const componentName = file.replace('.svelte', '');
    const vm = getVariantMeta(meta, 'advanced', 'advanced', componentName);
    allVariantMetas.push({ category: 'advanced', groupId: 'advanced', componentName, figmaNodeId: vm.figmaNodeId || null });
  }

  // Gather from blocks
  for (const blockKey of Object.keys(installManifest.blocks || {})) {
    const groupId = blockKey.replace(/^block-/, '');
    const dir = path.join(REGISTRY_ROOT, 'blocks', groupId);
    for (const file of listSvelteFiles(dir)) {
      const componentName = file.replace('.svelte', '');
      const vm = getVariantMeta(meta, 'blocks', groupId, componentName);
      allVariantMetas.push({ category: 'blocks', groupId, componentName, figmaNodeId: vm.figmaNodeId || null });
    }
  }

  // --- Batch-fetch Figma images ---
  const imagesFetched = await batchFetchFigmaImages(allVariantMetas);

  // --- Build the presentation manifest ---
  const presentationManifest = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    figmaFileKey: FIGMA_FILE_KEY,
    summary: {
      atomGroups: 0,
      advancedComponents: 0,
      blockGroups: 0,
      totalVariants: 0,
      imagesAvailable: 0,
    },
    atoms: {},
    advanced: {},
    blocks: {},
  };

  // --- Process atoms ---
  console.log('⚛️  Processing atoms…');
  for (const [atomId, atomEntry] of Object.entries(installManifest.atoms || {})) {
    const groupMeta  = getGroupMeta(meta, 'atoms', atomId);
    const dir        = path.join(REGISTRY_ROOT, 'atoms', atomId);
    const files      = listSvelteFiles(dir);
    if (files.length === 0) continue;

    const variants = [];
    for (const file of files) {
      const componentName = file.replace('.svelte', '');
      const sourceFile = path.join(dir, file);
      const variant = await processVariant({
        category: 'atoms', groupId: atomId, componentName, sourceFile, meta, imagesFetched,
      });
      variants.push(variant);
      if (variant.thumbnailAvailable) presentationManifest.summary.imagesAvailable++;
      presentationManifest.summary.totalVariants++;
    }

    presentationManifest.atoms[atomId] = {
      id: atomId,
      category: 'atoms',
      title: groupMeta.title || atomEntry.name || toTitleCase(atomId),
      description: groupMeta.description || `${toTitleCase(atomId)} UI component.`,
      tags: groupMeta.tags || [],
      variants,
    };
    presentationManifest.summary.atomGroups++;
    console.log(`  ✓ ${atomId} (${variants.length} variant${variants.length !== 1 ? 's' : ''})`);
  }

  // --- Process advanced ---
  console.log('\n🧩 Processing advanced components…');
  {
    const groupMeta = getGroupMeta(meta, 'advanced', 'advanced');
    const dir = path.join(REGISTRY_ROOT, 'advanced');
    const files = listSvelteFiles(dir);
    if (files.length > 0) {
      const variants = [];
      for (const file of files) {
        const componentName = file.replace('.svelte', '');
        const variant = await processVariant({
          category: 'advanced', groupId: 'advanced', componentName,
          sourceFile: path.join(dir, file), meta, imagesFetched,
        });
        variants.push(variant);
        if (variant.thumbnailAvailable) presentationManifest.summary.imagesAvailable++;
        presentationManifest.summary.totalVariants++;
        presentationManifest.summary.advancedComponents++;
      }
      presentationManifest.advanced['advanced'] = {
        id: 'advanced',
        category: 'advanced',
        title: groupMeta.title || 'Advanced Components',
        description: groupMeta.description || 'Complex multi-feature components for data-heavy interfaces.',
        tags: groupMeta.tags || ['advanced', 'data', 'table', 'form'],
        variants,
      };
      console.log(`  ✓ advanced (${variants.length} components)`);
    }
  }

  // --- Process blocks ---
  console.log('\n🧱 Processing blocks…');
  for (const [blockKey, blockEntry] of Object.entries(installManifest.blocks || {})) {
    const groupId  = blockKey.replace(/^block-/, '');
    const groupMeta= getGroupMeta(meta, 'blocks', groupId);
    const dir      = path.join(REGISTRY_ROOT, 'blocks', groupId);
    const files    = listSvelteFiles(dir);
    if (files.length === 0) continue;

    const variants = [];
    for (const file of files) {
      const componentName = file.replace('.svelte', '');
      const variant = await processVariant({
        category: 'blocks', groupId, componentName,
        sourceFile: path.join(dir, file), meta, imagesFetched,
      });
      variants.push(variant);
      if (variant.thumbnailAvailable) presentationManifest.summary.imagesAvailable++;
      presentationManifest.summary.totalVariants++;
    }

    presentationManifest.blocks[groupId] = {
      id: groupId,
      category: 'blocks',
      title: groupMeta.title || blockEntry.name || toTitleCase(groupId),
      description: groupMeta.description || `${toTitleCase(groupId)} blocks.`,
      tags: groupMeta.tags || [],
      variants,
    };
    presentationManifest.summary.blockGroups++;
    console.log(`  ✓ ${groupId} (${variants.length} variant${variants.length !== 1 ? 's' : ''})`);
  }

  // --- Write manifest.json ---
  writeJson(MANIFEST_OUT, presentationManifest);

  const { summary } = presentationManifest;
  console.log(`
✅ Done!

  Atom groups:       ${summary.atomGroups}
  Advanced:          ${summary.advancedComponents}
  Block groups:      ${summary.blockGroups}
  Total variants:    ${summary.totalVariants}
  Images available:  ${summary.imagesAvailable}

  Output: ${OUT_DIR}
  `);
}

main().catch(e => {
  console.error('\n❌ Fatal error:', e.message);
  process.exit(1);
});
