#!/usr/bin/env node
'use strict';

/**
 * populate-registry.cjs
 *
 * Copies extended atoms, advanced components, and all block categories from the
 * boilerplate source into the create-frontend registry, then generates a
 * manifest.json that describes every component and its dependencies.
 *
 * Run from the repo root:
 *   node packages/create-frontend/scripts/populate-registry.cjs
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const UI_SRC = path.join(REPO_ROOT, 'src/lib/components/ui');
const ADVANCED_SRC = path.join(REPO_ROOT, 'src/lib/components/advanced');
const BLOCKS_SRC = path.join(REPO_ROOT, 'src/lib/components/blocks');
const CN_SRC = path.join(REPO_ROOT, 'src/lib/utils/cn.ts');

const REGISTRY_ROOT = path.join(__dirname, '..', 'src', 'registry');
const MANIFEST_PATH = path.join(__dirname, '..', 'src', 'manifest.json');

// ---------------------------------------------------------------------------
// Atom classification
// ---------------------------------------------------------------------------

const BASIC_ATOMS = [
  'button',
  'card',
  'input',
  'label',
  'badge',
  'checkbox',
  'radio-group',
  'sheet',
  'tabs',
  'table',
  'dropdown-menu',
  'breadcrumb',
  'alert',
  'progress',
];

// Loose files that live directly in src/lib/components/ui/ (not in sub-dirs).
// These are also considered basic / agent-coded and are NOT copied.
const BASIC_LOOSE_FILES = [
  'Textarea.svelte',
  'Popover.svelte',
  'Pagination.svelte',
  'Avatar.svelte',
  'Separator.svelte',
  'Skeleton.svelte',
  'AlertNew.svelte',
];

const EXTENDED_ATOMS = [
  'otp-input',
  'calendar',
  'select',
  'dialog',
  'statistic-card',
  'user-item',
  'notification-badge',
  'sidebar-item',
  'nav',
  'menu',
  'message',
  'legend',
  'settings-card',
  'text-editor',
  'uploader',
  'icon', // included if it exists on disk
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a directory (and parents) if it doesn't exist. */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** Remove a directory tree if it exists. */
function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Copy every .svelte and .ts file from `src` into `dest`, creating dest first.
 * Returns the list of file names copied.
 */
function copyComponentDir(src, dest) {
  if (!fs.existsSync(src)) return [];
  ensureDir(dest);

  const entries = fs.readdirSync(src, { withFileTypes: true });
  const copied = [];

  for (const entry of entries) {
    if (entry.isDirectory()) continue; // don't recurse into nested dirs
    const ext = path.extname(entry.name);
    if (ext !== '.svelte' && ext !== '.ts') continue;
    fs.copyFileSync(path.join(src, entry.name), path.join(dest, entry.name));
    copied.push(entry.name);
  }

  return copied;
}

/**
 * Convert a kebab-case name to PascalCase.
 *   "otp-input" -> "OtpInput"
 *   "hero-section" -> "HeroSection"
 */
function toPascalCase(kebab) {
  return kebab
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

/**
 * Generate a human-friendly block name from the category slug.
 *   "auth" -> "Auth Blocks"
 *   "hero-section" -> "Hero Section Blocks"
 */
function blockDisplayName(category) {
  const words = category
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  return words.join(' ') + ' Blocks';
}

// ---------------------------------------------------------------------------
// Dependency extraction
// ---------------------------------------------------------------------------

/**
 * Parse a single file's contents and return dependency info.
 *
 * Detects:
 *   import ... from '$lib/components/ui/<name>/...'   -> specific atom
 *   import ... from '$lib/components/ui/<LooseFile>'   -> loose basic atom
 *   import ... from '$lib/components/ui'               -> barrel (basic atoms)
 *   import ... from '<npm-package>'                    -> npm package
 */
function extractDeps(fileContent) {
  const atoms = new Set();
  const basicAtoms = new Set();
  const packages = new Set();

  // Match all import-from statements (handles single and double quotes)
  const importRe = /import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRe.exec(fileContent)) !== null) {
    const specifier = match[1];

    // --- $lib/components/ui/<subdir>/... or $lib/components/ui/<subdir> ---
    const subdirMatch = specifier.match(
      /^\$lib\/components\/ui\/([a-z][a-z0-9-]*)(?:\/|$)/
    );
    if (subdirMatch) {
      const name = subdirMatch[1];
      if (BASIC_ATOMS.includes(name)) {
        basicAtoms.add(name);
      } else if (EXTENDED_ATOMS.includes(name)) {
        atoms.add(name);
      }
      // If it's neither (e.g. some unknown dir), silently skip.
      continue;
    }

    // --- $lib/components/ui/<LooseFile.svelte> ---
    const looseMatch = specifier.match(
      /^\$lib\/components\/ui\/([A-Z][A-Za-z]+\.svelte)$/
    );
    if (looseMatch) {
      // Loose files are always basic
      continue; // we don't track individual loose files in deps
    }

    // --- Barrel import: $lib/components/ui ---
    if (specifier === '$lib/components/ui') {
      // Barrel re-exports basic atoms; mark as a barrel dep.
      // We can't know *which* basics without parsing the barrel, so we flag
      // them generically. The installer can treat barrel deps as "needs all
      // basic atoms that the barrel exports".
      // For now we parse the actual import names from the statement.
      const barrelNames = extractBarrelNames(match[0]);
      for (const n of barrelNames) {
        const kebab = pascalToKebab(n);
        if (BASIC_ATOMS.includes(kebab)) {
          basicAtoms.add(kebab);
        } else if (EXTENDED_ATOMS.includes(kebab)) {
          atoms.add(kebab);
        }
      }
      continue;
    }

    // --- Skip other $lib or $app imports ---
    if (specifier.startsWith('$')) continue;
    if (specifier.startsWith('.')) continue; // relative imports
    if (specifier.startsWith('svelte')) continue; // svelte internals

    // --- npm package ---
    // Capture the package name (scoped or unscoped)
    const pkgMatch = specifier.match(/^(@[^/]+\/[^/]+|[^/]+)/);
    if (pkgMatch) {
      packages.add(pkgMatch[1]);
    }
  }

  return {
    atoms: [...atoms].sort(),
    basicAtoms: [...basicAtoms].sort(),
    packages: [...packages].sort(),
  };
}

/**
 * Given a full barrel import statement like:
 *   import { Button, Card, Input } from '$lib/components/ui'
 * Return the named imports as an array: ['Button', 'Card', 'Input']
 */
function extractBarrelNames(importStatement) {
  const braceMatch = importStatement.match(/\{([^}]+)\}/);
  if (!braceMatch) return [];
  return braceMatch[1]
    .split(',')
    .map((s) => s.trim().split(/\s+as\s+/)[0].trim())
    .filter(Boolean);
}

/**
 * Convert a PascalCase name to kebab-case.
 *   "OtpInput" -> "otp-input"
 *   "DropdownMenu" -> "dropdown-menu"
 */
function pascalToKebab(pascal) {
  return pascal
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Merge two dependency objects, deduplicating.
 */
function mergeDeps(a, b) {
  return {
    atoms: [...new Set([...a.atoms, ...b.atoms])].sort(),
    basicAtoms: [...new Set([...a.basicAtoms, ...b.basicAtoms])].sort(),
    packages: [...new Set([...a.packages, ...b.packages])].sort(),
  };
}

/**
 * Scan all .svelte files in a list and return combined deps.
 */
function scanDeps(dir, fileNames) {
  let combined = { atoms: [], basicAtoms: [], packages: [] };
  for (const f of fileNames) {
    if (!f.endsWith('.svelte')) continue;
    const filePath = path.join(dir, f);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    combined = mergeDeps(combined, extractDeps(content));
  }
  return combined;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('populate-registry: starting...');
  console.log(`  Repo root : ${REPO_ROOT}`);
  console.log(`  Registry  : ${REGISTRY_ROOT}`);
  console.log('');

  // Wipe and recreate the registry so we start clean
  rmDir(REGISTRY_ROOT);
  ensureDir(REGISTRY_ROOT);

  const manifest = {
    version: 1,
    basicAtoms: [...BASIC_ATOMS],
    atoms: {},
    advanced: {},
    blocks: {},
  };

  // -----------------------------------------------------------------------
  // 1. Extended atoms
  // -----------------------------------------------------------------------
  let atomsCopied = 0;

  for (const name of EXTENDED_ATOMS) {
    const src = path.join(UI_SRC, name);
    if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
      console.log(`  [skip] atom "${name}" — directory not found`);
      continue;
    }

    const dest = path.join(REGISTRY_ROOT, 'atoms', name);
    const files = copyComponentDir(src, dest);

    if (files.length === 0) {
      console.log(`  [skip] atom "${name}" — no .svelte/.ts files`);
      rmDir(dest);
      continue;
    }

    const deps = scanDeps(src, files);

    manifest.atoms[name] = {
      name: toPascalCase(name),
      registryPath: `atoms/${name}`,
      targetPath: `src/lib/components/ui/${name}`,
      files,
      dependencies: deps,
    };

    atomsCopied++;
  }

  console.log(`  Copied ${atomsCopied} extended atoms`);

  // -----------------------------------------------------------------------
  // 2. Advanced components
  // -----------------------------------------------------------------------
  if (fs.existsSync(ADVANCED_SRC)) {
    const dest = path.join(REGISTRY_ROOT, 'advanced');
    const files = copyComponentDir(ADVANCED_SRC, dest);
    const svelteFiles = files.filter((f) => f.endsWith('.svelte'));

    for (const f of svelteFiles) {
      const baseName = f.replace('.svelte', '');
      const key = pascalToKebab(baseName);
      const deps = scanDeps(ADVANCED_SRC, [f]);

      manifest.advanced[key] = {
        name: baseName,
        registryPath: 'advanced',
        targetPath: 'src/lib/components/advanced',
        files: [f],
        dependencies: deps,
      };
    }

    // If there's an index.ts, include it in each advanced entry's files
    if (files.includes('index.ts')) {
      for (const key of Object.keys(manifest.advanced)) {
        if (!manifest.advanced[key].files.includes('index.ts')) {
          manifest.advanced[key].files.push('index.ts');
        }
      }
    }

    console.log(
      `  Copied ${svelteFiles.length} advanced components (${files.length} files total)`
    );
  } else {
    console.log('  [skip] advanced — directory not found');
  }

  // -----------------------------------------------------------------------
  // 3. Blocks
  // -----------------------------------------------------------------------
  let blocksCopied = 0;
  let blockFiles = 0;

  const blockEntries = fs.existsSync(BLOCKS_SRC)
    ? fs.readdirSync(BLOCKS_SRC, { withFileTypes: true })
    : [];

  for (const entry of blockEntries) {
    // Skip non-directories, non-component files, and metadata
    if (!entry.isDirectory()) continue;

    const category = entry.name;
    const src = path.join(BLOCKS_SRC, category);
    const dest = path.join(REGISTRY_ROOT, 'blocks', category);
    const files = copyComponentDir(src, dest);

    if (files.length === 0) {
      rmDir(dest);
      continue;
    }

    const deps = scanDeps(src, files);
    const key = `block-${category}`;

    manifest.blocks[key] = {
      name: blockDisplayName(category),
      registryPath: `blocks/${category}`,
      targetPath: `src/lib/components/blocks/${category}`,
      files,
      dependencies: deps,
    };

    blocksCopied++;
    blockFiles += files.length;
  }

  console.log(
    `  Copied ${blocksCopied} block categories (${blockFiles} files total)`
  );

  // -----------------------------------------------------------------------
  // 4. cn.ts template
  // -----------------------------------------------------------------------
  if (fs.existsSync(CN_SRC)) {
    const dest = path.join(REGISTRY_ROOT, 'templates');
    ensureDir(dest);
    fs.copyFileSync(CN_SRC, path.join(dest, 'cn.ts'));
    console.log('  Copied cn.ts template');
  } else {
    console.log('  [skip] cn.ts — not found');
  }

  // -----------------------------------------------------------------------
  // 5. Write manifest
  // -----------------------------------------------------------------------
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`  Wrote manifest.json (${Object.keys(manifest.atoms).length} atoms, ${Object.keys(manifest.advanced).length} advanced, ${Object.keys(manifest.blocks).length} blocks)`);
  console.log('');
  console.log('populate-registry: done.');
}

main();
