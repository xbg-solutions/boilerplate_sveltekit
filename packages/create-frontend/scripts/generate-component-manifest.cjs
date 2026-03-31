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
// Helpers — playground URL
// ---------------------------------------------------------------------------

async function buildPlaygroundUrl(source, title) {
  const payload = JSON.stringify({
    name: title,
    tailwind: true,
    files: [{
      type: 'file',
      name: 'App.svelte',
      basename: 'App.svelte',
      contents: source,
      text: true,
    }],
  });
  const compressed = await gzipAsync(Buffer.from(payload, 'utf8'));
  const hash = compressed.toString('base64');
  return `https://svelte.dev/playground/untitled#${hash}`;
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

  // Playground URL — only generate if the source has no $lib imports, since $lib
  // is a local SvelteKit path alias that the Svelte REPL cannot resolve.
  const hasLocalImports = source.includes("'$lib") || source.includes('"$lib');
  const playgroundUrl = hasLocalImports ? null : await buildPlaygroundUrl(source, `XBG — ${title}`);

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
