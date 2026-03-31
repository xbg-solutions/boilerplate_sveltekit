#!/usr/bin/env node

/**
 * Component Registry — Add Command
 *
 * Copies components from the XBG registry into a consuming project.
 *
 * Usage:
 *   npx bpsk add otp-input calendar          # Add extended atoms
 *   npx bpsk add block-auth block-dashboard   # Add block categories
 *   npx bpsk add chart-wrapper                # Add advanced components
 *   npx bpsk add block-auth --yes             # Skip prompts (for agents)
 *   npx bpsk add block-auth --force           # Overwrite existing
 *   npx bpsk list                             # List all available components
 */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ─── ANSI colours ────────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  blue:   '\x1b[34m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  dim:    '\x1b[2m',
};

const log = {
  ok:    (m) => console.log(`${C.green}✓${C.reset} ${m}`),
  err:   (m) => console.log(`${C.red}✗${C.reset} ${m}`),
  info:  (m) => console.log(`${C.blue}ℹ${C.reset} ${m}`),
  warn:  (m) => console.log(`${C.yellow}⚠${C.reset} ${m}`),
  title: (m) => console.log(`\n${C.bold}${C.blue}${m}${C.reset}\n`),
  dim:   (m) => console.log(`${C.dim}${m}${C.reset}`),
};

// ─── readline ────────────────────────────────────────────────────────────────
function askYN(question, defaultYes = true) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const hint = defaultYes ? 'Y/n' : 'y/N';
  return new Promise((resolve) => {
    rl.question(`${C.cyan}${question} (${hint})${C.reset} `, (ans) => {
      rl.close();
      const a = ans.trim().toLowerCase();
      if (a === '') resolve(defaultYes);
      else resolve(a === 'y' || a === 'yes');
    });
  });
}

// ─── Registry resolution ─────────────────────────────────────────────────────

function getRegistryRoot() {
  const registryRoot = path.resolve(__dirname, '..', 'registry');
  if (!fs.existsSync(registryRoot)) {
    log.err(`Registry not found at ${registryRoot}`);
    log.dim('This usually means the package was not installed correctly.');
    process.exit(1);
  }
  return registryRoot;
}

function loadManifest() {
  const manifestPath = path.resolve(__dirname, '..', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    log.err(`Manifest not found at ${manifestPath}`);
    log.dim('This usually means the package was not installed correctly.');
    process.exit(1);
  }
  try {
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    log.err(`Failed to parse manifest.json: ${e.message}`);
    process.exit(1);
  }
}

// ─── Component resolution ────────────────────────────────────────────────────

/**
 * Look up user-provided names across all manifest sections.
 * Returns an array of manifest entries with an added `type` field.
 */
function resolveComponents(names, manifest) {
  const entries = [];

  for (const name of names) {
    let found = null;

    // Search atoms first, then advanced, then blocks
    if (manifest.atoms && manifest.atoms[name]) {
      found = { ...manifest.atoms[name], name, type: 'atoms' };
    } else if (manifest.advanced && manifest.advanced[name]) {
      found = { ...manifest.advanced[name], name, type: 'advanced' };
    } else if (manifest.blocks && manifest.blocks[name]) {
      found = { ...manifest.blocks[name], name, type: 'blocks' };
    }

    if (!found) {
      log.err(`Unknown component: "${name}"`);
      console.log('');
      console.log('Available components:');
      const allNames = [
        ...Object.keys(manifest.atoms || {}),
        ...Object.keys(manifest.advanced || {}),
        ...Object.keys(manifest.blocks || {}),
      ];
      console.log(`  ${allNames.join(', ')}`);
      process.exit(1);
    }

    entries.push(found);
  }

  return entries;
}

/**
 * Recursively collect extended-atom dependencies from the registry.
 * Returns a deduplicated list of all entries to install.
 */
function buildDependencyTree(entries, manifest) {
  const seen = new Set();
  const result = [];

  function walk(entry) {
    if (seen.has(entry.name)) return;
    seen.add(entry.name);

    // Recurse into atom dependencies first (so deps are installed before dependents)
    const atomDeps = (entry.dependencies && entry.dependencies.atoms) || [];
    for (const depName of atomDeps) {
      if (manifest.atoms && manifest.atoms[depName]) {
        walk({ ...manifest.atoms[depName], name: depName, type: 'atoms' });
      } else {
        log.warn(`Dependency "${depName}" (required by ${entry.name}) not found in manifest atoms.`);
      }
    }

    result.push(entry);
  }

  for (const entry of entries) {
    walk(entry);
  }

  return result;
}

// ─── Existence checks ────────────────────────────────────────────────────────

/**
 * Check which target paths already exist in the project.
 * A component is considered "existing" if targetPath dir exists and contains
 * at least one .svelte file.
 */
function checkExisting(projectRoot, entries) {
  const existing = [];
  const toInstall = [];

  for (const entry of entries) {
    const targetDir = path.join(projectRoot, entry.targetPath);
    if (fs.existsSync(targetDir)) {
      // Check for at least one .svelte file
      try {
        const files = fs.readdirSync(targetDir);
        const hasSvelte = files.some((f) => f.endsWith('.svelte'));
        if (hasSvelte) {
          existing.push(entry);
          continue;
        }
      } catch {
        // directory read failed — treat as missing
      }
    }
    toInstall.push(entry);
  }

  return { existing, toInstall };
}

/**
 * Collect all basicAtoms dependencies and check if they exist in the project.
 * Returns list of missing basic atom names.
 */
function checkBasicAtoms(projectRoot, entries, manifest) {
  const needed = new Set();

  for (const entry of entries) {
    const basicDeps = (entry.dependencies && entry.dependencies.basicAtoms) || [];
    for (const atomName of basicDeps) {
      needed.add(atomName);
    }
  }

  const missing = [];
  for (const atomName of needed) {
    const atomDir = path.join(projectRoot, 'src', 'lib', 'components', 'ui', atomName);
    if (!fs.existsSync(atomDir)) {
      missing.push(atomName);
    }
  }

  return missing.sort();
}

// ─── cn.ts utility ───────────────────────────────────────────────────────────

/**
 * Ensure the cn() utility exists in the project. Copy from registry template
 * if missing. Warn about required npm dependencies.
 */
function ensureCn(projectRoot, registryRoot) {
  const cnTarget = path.join(projectRoot, 'src', 'lib', 'utils', 'cn.ts');

  if (fs.existsSync(cnTarget)) return;

  const cnSource = path.join(registryRoot, 'templates', 'cn.ts');
  if (!fs.existsSync(cnSource)) {
    log.warn('cn.ts template not found in registry — skipping cn.ts setup.');
    return;
  }

  // Ensure target directory exists
  const utilsDir = path.dirname(cnTarget);
  fs.mkdirSync(utilsDir, { recursive: true });

  fs.copyFileSync(cnSource, cnTarget);
  log.ok('Created src/lib/utils/cn.ts');

  // Check for required npm dependencies
  const pkgPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      const missingPkgs = [];
      if (!allDeps['clsx']) missingPkgs.push('clsx');
      if (!allDeps['tailwind-merge']) missingPkgs.push('tailwind-merge');
      if (missingPkgs.length > 0) {
        log.warn(`cn.ts requires: ${missingPkgs.join(', ')}`);
        log.dim(`  Run: npm install ${missingPkgs.join(' ')}`);
      }
    } catch {
      // ignore parse errors
    }
  }
}

// ─── File copying ────────────────────────────────────────────────────────────

/**
 * Copy all files for a component from the registry to the project.
 */
function copyComponent(registryRoot, projectRoot, entry) {
  const srcDir = path.join(registryRoot, entry.registryPath);
  const destDir = path.join(projectRoot, entry.targetPath);

  if (!fs.existsSync(srcDir)) {
    log.err(`Registry source not found: ${entry.registryPath}`);
    return;
  }

  // Ensure target directory exists
  fs.mkdirSync(destDir, { recursive: true });

  const filesToCopy = entry.files || [];

  if (filesToCopy.length === 0) {
    // If no files array, copy everything in the directory
    const allFiles = fs.readdirSync(srcDir);
    for (const file of allFiles) {
      const srcFile = path.join(srcDir, file);
      const destFile = path.join(destDir, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, destFile);
      }
    }
  } else {
    for (const file of filesToCopy) {
      const srcFile = path.join(srcDir, file);
      const destFile = path.join(destDir, file);
      if (!fs.existsSync(srcFile)) {
        log.warn(`File not found in registry: ${entry.registryPath}/${file}`);
        continue;
      }
      fs.copyFileSync(srcFile, destFile);
    }
  }

  log.ok(`${entry.name} → ${entry.targetPath}`);
}

// ─── Barrel export maintenance ───────────────────────────────────────────────

/**
 * Append an export line to the appropriate barrel index.ts if not already present.
 */
function updateBarrelExport(projectRoot, entry, manifest) {
  let barrelPath;

  switch (entry.type) {
    case 'atoms':
      barrelPath = path.join(projectRoot, 'src', 'lib', 'components', 'ui', 'index.ts');
      break;
    case 'advanced':
      barrelPath = path.join(projectRoot, 'src', 'lib', 'components', 'advanced', 'index.ts');
      break;
    case 'blocks':
      barrelPath = path.join(projectRoot, 'src', 'lib', 'components', 'blocks', 'index.ts');
      break;
    default:
      return;
  }

  if (!fs.existsSync(barrelPath)) return;

  const exportLine = entry.exportLine || `export { default as ${toPascal(entry.name)} } from './${entry.name}';`;

  const content = fs.readFileSync(barrelPath, 'utf-8');
  if (content.includes(entry.name)) return; // Already has some export for this component

  const newContent = content.trimEnd() + '\n' + exportLine + '\n';
  fs.writeFileSync(barrelPath, newContent, 'utf-8');
  log.dim(`  Updated ${path.relative(projectRoot, barrelPath)}`);
}

/**
 * Convert kebab-case name to PascalCase.
 */
function toPascal(str) {
  return str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

// ─── List command ────────────────────────────────────────────────────────────

function listComponents(manifest) {
  log.title('Available Components');

  if (manifest.atoms && Object.keys(manifest.atoms).length > 0) {
    console.log(`${C.bold}Extended Atoms${C.reset}`);
    for (const [name, entry] of Object.entries(manifest.atoms)) {
      const desc = entry.description ? `${C.dim} — ${entry.description}${C.reset}` : '';
      console.log(`  ${C.green}${name}${C.reset}${desc}`);
    }
    console.log('');
  }

  if (manifest.advanced && Object.keys(manifest.advanced).length > 0) {
    console.log(`${C.bold}Advanced Components${C.reset}`);
    for (const [name, entry] of Object.entries(manifest.advanced)) {
      const desc = entry.description ? `${C.dim} — ${entry.description}${C.reset}` : '';
      console.log(`  ${C.cyan}${name}${C.reset}${desc}`);
    }
    console.log('');
  }

  if (manifest.blocks && Object.keys(manifest.blocks).length > 0) {
    console.log(`${C.bold}Blocks${C.reset}`);
    for (const [name, entry] of Object.entries(manifest.blocks)) {
      const desc = entry.description ? `${C.dim} — ${entry.description}${C.reset}` : '';
      console.log(`  ${C.blue}${name}${C.reset}${desc}`);
    }
    console.log('');
  }

  const total =
    Object.keys(manifest.atoms || {}).length +
    Object.keys(manifest.advanced || {}).length +
    Object.keys(manifest.blocks || {}).length;

  log.dim(`${total} component(s) available.`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const flags = {
    yes: args.includes('--yes') || args.includes('-y'),
    force: args.includes('--force'),
  };
  const names = args.filter((a) => !a.startsWith('-'));

  // Handle 'list' sub-command or no arguments
  if (names[0] === 'list' || names.length === 0) {
    const manifest = loadManifest();
    listComponents(manifest);
    return;
  }

  const projectRoot = process.cwd();
  const registryRoot = getRegistryRoot();
  const manifest = loadManifest();

  // Resolve requested components
  const entries = resolveComponents(names, manifest);

  // Build full dependency tree (extended atoms needed by blocks/advanced)
  const allEntries = buildDependencyTree(entries, manifest);

  // Check what already exists
  const { existing, toInstall } = checkExisting(projectRoot, allEntries);

  if (toInstall.length === 0 && !flags.force) {
    log.ok('All requested components already exist in your project.');
    return;
  }

  // Show what will be installed
  console.log('\nComponents to add:');
  const installList = flags.force ? allEntries : toInstall;
  for (const entry of installList) {
    console.log(`  ${C.green}+${C.reset} ${entry.name} → ${C.dim}${entry.targetPath}${C.reset}`);
  }
  if (existing.length > 0 && !flags.force) {
    console.log('\nAlready present (skipping):');
    for (const entry of existing) {
      console.log(`  ${C.dim}= ${entry.name}${C.reset}`);
    }
  }

  // Check for missing basic atoms
  const missingBasic = checkBasicAtoms(projectRoot, allEntries, manifest);
  if (missingBasic.length > 0) {
    console.log('');
    log.warn('Required basic atoms not found in your project:');
    console.log(`  ${missingBasic.join(', ')}`);
    log.dim('  These are simple shadcn-style components. Code them following the');
    log.dim('  Svelte 5 runes + tv() + cn() pattern documented in bpsk/components skill.');
  }

  // Confirm (unless --yes)
  if (!flags.yes) {
    const proceed = await askYN('\nProceed?');
    if (!proceed) {
      console.log('Cancelled.');
      return;
    }
  }

  // Ensure cn.ts exists
  ensureCn(projectRoot, registryRoot);

  // Copy components
  let copied = 0;
  for (const entry of installList) {
    copyComponent(registryRoot, projectRoot, entry);
    updateBarrelExport(projectRoot, entry, manifest);
    copied++;
  }

  console.log(`\n${C.green}✓${C.reset} Added ${C.bold}${copied}${C.reset} component(s).`);
}

main().catch((err) => {
  log.err(err.message);
  process.exit(1);
});
