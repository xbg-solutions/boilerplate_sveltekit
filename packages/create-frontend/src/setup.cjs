#!/usr/bin/env node

/**
 * Interactive Setup Wizard — XBG SvelteKit Boilerplate
 *
 * Covers:
 *   1. Context detection  (standalone vs mono-repo)
 *   2. Project identity   → writes .env
 *   3. Firebase           → writes .env, updates firebase.json + .firebaserc
 *   4. API / Backend      → writes .env
 *   5. RBAC / Roles       → writes app.config.ts SETUP:roles block
 *   6. Custom JWT attrs   → documents extra claims in .env comment
 *   7. Feature flags      → writes app.config.ts SETUP:features block
 *   8. Generate & validate
 *
 * Usage:  npm run setup
 */

'use strict';

const readline = require('readline');
const fs       = require('fs');
const path     = require('path');
const { execSync } = require('child_process');

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
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question, defaultVal = '') {
  const hint = defaultVal ? ` ${C.dim}[${defaultVal}]${C.reset}` : '';
  return new Promise((resolve) => {
    rl.question(`${C.cyan}${question}${hint}:${C.reset} `, (ans) => {
      resolve(ans.trim() || defaultVal);
    });
  });
}

function askYN(question, defaultYes = true) {
  const hint = defaultYes ? 'Y/n' : 'y/N';
  return new Promise((resolve) => {
    rl.question(`${C.cyan}${question} (${hint})${C.reset} `, (ans) => {
      const a = ans.trim().toLowerCase();
      if (a === '') resolve(defaultYes);
      else resolve(a === 'y' || a === 'yes');
    });
  });
}

// ─── Paths ───────────────────────────────────────────────────────────────────
const ROOT      = process.cwd();
const PARENT    = path.resolve(ROOT, '..');
const ENV_FILE  = path.join(ROOT, '.env');
const ENV_EX    = path.join(ROOT, '.env.example');
const FB_JSON   = path.join(ROOT, 'firebase.json');
const FB_RC     = path.join(ROOT, '.firebaserc');
const APP_CFG   = path.join(ROOT, 'src', 'lib', 'config', 'app.config.ts');

// ─── Context detection ────────────────────────────────────────────────────────
function detectContext() {
  const hasParentFunctions = fs.existsSync(path.join(PARENT, 'functions'));
  const hasParentFirebase  = fs.existsSync(path.join(PARENT, 'firebase.json'));
  const hasParentFirebaseRc = fs.existsSync(path.join(PARENT, '.firebaserc'));
  const isInFrontendDir    = path.basename(ROOT) === 'frontend';

  return {
    isMonoRepo: hasParentFunctions || (hasParentFirebase && isInFrontendDir),
    hasParentFirebase,
    hasParentFirebaseRc,
    isInFrontendDir,
  };
}

// ─── Existing .env loader ─────────────────────────────────────────────────────
function loadExistingEnv() {
  const existing = {};
  if (!fs.existsSync(ENV_FILE)) return existing;
  const lines = fs.readFileSync(ENV_FILE, 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=["']?(.+?)["']?\s*$/);
    if (m) existing[m[1]] = m[2];
  }
  return existing;
}

// ─── firebase.json helpers ────────────────────────────────────────────────────
function readFirebaseJson() {
  if (!fs.existsSync(FB_JSON)) return null;
  try { return JSON.parse(fs.readFileSync(FB_JSON, 'utf8')); } catch { return null; }
}

function writeFirebaseJson(data) {
  fs.writeFileSync(FB_JSON, JSON.stringify(data, null, 2) + '\n');
}

function readFirebaseRc() {
  if (!fs.existsSync(FB_RC)) return null;
  try { return JSON.parse(fs.readFileSync(FB_RC, 'utf8')); } catch { return null; }
}

function writeFirebaseRc(data) {
  fs.writeFileSync(FB_RC, JSON.stringify(data, null, 2) + '\n');
}

// ─── app.config.ts block replacement ─────────────────────────────────────────
function replaceSetupBlock(content, blockName, newContent) {
  const startMarker = `/* SETUP:start:${blockName} */`;
  const endMarker   = `/* SETUP:end:${blockName} */`;
  const startIdx = content.indexOf(startMarker);
  const endIdx   = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    log.warn(`SETUP markers for '${blockName}' not found in app.config.ts — skipping.`);
    return content;
  }

  // Determine indentation from the line containing the start marker
  const lineStart = content.lastIndexOf('\n', startIdx) + 1;
  const indent    = content.slice(lineStart, startIdx).match(/^(\s*)/)[1];

  return (
    content.slice(0, startIdx + startMarker.length) +
    '\n' + newContent.split('\n').map(l => l ? indent + l : l).join('\n') + '\n' + indent +
    content.slice(endIdx)
  );
}

// ─── TypeScript block generators ─────────────────────────────────────────────
function generateRolesBlock(cfg) {
  const { roles, roleHierarchy, permissions, claimMap } = cfg;

  const rolesLines = roles.map(r =>
    `  ${r.key}: '${r.value}',`
  ).join('\n');

  const hierarchyLines = Object.entries(roleHierarchy)
    .map(([role, inherits]) =>
      `  ${role}: ${JSON.stringify(inherits)},`
    ).join('\n');

  const permissionsLines = Object.entries(permissions)
    .map(([role, perms]) =>
      `  ${role}: ${JSON.stringify(perms)},`
    ).join('\n');

  const claimLines = Object.entries(claimMap)
    .map(([role, claim]) => `  ${role}: '${claim}',`)
    .join('\n');

  return [
    `roles: {`,
    rolesLines,
    `} as Record<string, string>,`,
    ``,
    `// Higher roles inherit all permissions of the roles they list`,
    `roleHierarchy: {`,
    hierarchyLines,
    `} as Record<string, string[]>,`,
    ``,
    `permissions: {`,
    permissionsLines,
    `} as Record<string, string[]>,`,
    ``,
    `// Maps role value → boolean JWT claim key`,
    `claimMap: {`,
    claimLines,
    `} as Record<string, string>,`,
  ].join('\n');
}

function generateFeaturesBlock(features) {
  return Object.entries(features)
    .map(([k, v]) => `${k}: ${v},`)
    .join('\n');
}

// ─── .env writer ─────────────────────────────────────────────────────────────
function buildEnvContent(cfg) {
  const { app, firebase, api, features, analytics, customAttrs } = cfg;

  const shortSlug = app.shortName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const lines = [
    `# =============================================================================`,
    `# ${app.name.toUpperCase()} — ENVIRONMENT CONFIGURATION`,
    `# Generated by npm run setup on ${new Date().toISOString().slice(0, 10)}`,
    `# =============================================================================`,
    ``,
    `# ── Project identity ─────────────────────────────────────────────────────────`,
    `VITE_APP_NAME="${app.name}"`,
    `VITE_APP_SHORT_NAME="${app.shortName}"`,
    `VITE_APP_DESCRIPTION="${app.description}"`,
    `VITE_APP_VERSION="1.0.0"`,
    `VITE_APP_DOMAIN="${app.domain}"`,
    `VITE_SUPPORT_EMAIL="${app.supportEmail}"`,
    ``,
    `# ── Firebase ─────────────────────────────────────────────────────────────────`,
    `# Get these from Firebase Console → Project Settings → General`,
    `VITE_FIREBASE_PROJECT_ID="${firebase.projectId}"`,
    `VITE_FIREBASE_API_KEY="${firebase.apiKey}"`,
    `VITE_FIREBASE_AUTH_DOMAIN="${firebase.authDomain}"`,
    `VITE_FIREBASE_STORAGE_BUCKET="${firebase.storageBucket}"`,
    `VITE_FIREBASE_MESSAGING_SENDER_ID="${firebase.messagingSenderId}"`,
    `VITE_FIREBASE_APP_ID="${firebase.appId}"`,
    firebase.measurementId
      ? `VITE_FIREBASE_MEASUREMENT_ID="${firebase.measurementId}"`
      : `# VITE_FIREBASE_MEASUREMENT_ID=""  # Optional — Google Analytics`,
    ``,
    `# Firebase Emulators (uncomment for local dev)`,
    `# VITE_FIREBASE_AUTH_EMULATOR_HOST="localhost"`,
    `# VITE_FIREBASE_AUTH_EMULATOR_PORT="9099"`,
    `# VITE_USE_EMULATORS="true"`,
    ``,
    `# ── API / Backend ─────────────────────────────────────────────────────────────`,
    `VITE_API_BASE_URL_DEV="${api.devUrl}"`,
    `VITE_API_BASE_URL_PROD="${api.prodUrl}"`,
    `VITE_API_TIMEOUT="30000"`,
    `VITE_API_RETRY_COUNT="2"`,
    `VITE_API_RETRY_DELAY="1000"`,
    ``,
    `# ── Auth ─────────────────────────────────────────────────────────────────────`,
    `VITE_AUTH_PERSISTENCE="local"  # local | session | none`,
    features.phoneVerification
      ? `VITE_RECAPTCHA_SITE_KEY=""  # Required for phone auth — https://console.cloud.google.com/security/recaptcha`
      : `# VITE_RECAPTCHA_SITE_KEY=""  # Required only if phoneVerification is enabled`,
    ``,
  ];

  if (customAttrs && customAttrs.length > 0) {
    lines.push(
      `# ── Custom JWT claims / token attributes ─────────────────────────────────────`,
      `# These keys are expected in Firebase custom claims set by your backend.`,
      `# They are documented here for reference; the claim names are set in`,
      `# app.config.ts auth.claimMap and your backend's token-minting logic.`,
      `#`,
      ...customAttrs.map(a => `# ${a.claimKey}  →  ${a.description}`),
      ``,
    );
  }

  lines.push(
    `# ── SEO ─────────────────────────────────────────────────────────────────────`,
    `VITE_SEO_DEFAULT_TITLE="${app.name}"`,
    `VITE_SEO_DEFAULT_DESCRIPTION="${app.description}"`,
    `VITE_SEO_DEFAULT_IMAGE="/og-image.jpg"`,
    `VITE_SEO_DEFAULT_KEYWORDS=""`,
    `# VITE_SEO_TWITTER_HANDLE=""`,
    ``,
    `# ── Feature flags ─────────────────────────────────────────────────────────────`,
    `# Structural flags live in app.config.ts features block (edit or re-run setup).`,
    `# Analytics IDs go here:`,
    features.analytics
      ? `VITE_GA_MEASUREMENT_ID="${analytics.gaId || ''}"`
      : `# VITE_GA_MEASUREMENT_ID=""`,
    `VITE_GA_ENABLED="${features.analytics}"`,
    ``,
    `# ── Development ───────────────────────────────────────────────────────────────`,
    `NODE_ENV="development"`,
  );

  return lines.join('\n') + '\n';
}

// ─── .env.example writer ──────────────────────────────────────────────────────
function buildEnvExample(envContent) {
  // Blank out secrets
  return envContent
    .replace(/(VITE_FIREBASE_API_KEY=)".+?"/,    '$1"your-firebase-api-key"')
    .replace(/(VITE_FIREBASE_APP_ID=)".+?"/,     '$1"1:000000000000:web:000000000000000000000000"')
    .replace(/(VITE_FIREBASE_MESSAGING_SENDER_ID=)".+?"/, '$1"000000000000"')
    .replace(/(VITE_RECAPTCHA_SITE_KEY=)".+?"/,  '$1"your-recaptcha-site-key"');
}

// ─── STEP 1 — Context ────────────────────────────────────────────────────────
async function stepContext(ctx) {
  log.title('⬡  Context Detection');

  if (ctx.isMonoRepo) {
    log.info('Mono-repo detected (sibling functions/ directory or parent firebase.json found).');
    log.info(`Running from: ${ROOT}`);
    log.info(`Parent:       ${PARENT}`);
    console.log();
    log.warn('After setup, some root-level files should live in the project parent, not here.');
    log.warn('A monorepo-setup.sh script will be generated to help with that tidy-up.');
  } else {
    log.info('Standalone project detected.');
  }
  console.log();
}

// ─── STEP 2 — Project identity ────────────────────────────────────────────────
async function stepApp(existing) {
  log.title('📱 Step 1 — Project Identity');

  const name      = await ask('App name (e.g. "Acme Dashboard")', existing.VITE_APP_NAME || '');
  const shortDef  = existing.VITE_APP_SHORT_NAME || name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  const shortName = await ask('Short name (used for localStorage prefix, icons)', shortDef);
  const desc      = await ask('Description (SEO)', existing.VITE_APP_DESCRIPTION || `${name} — built with SvelteKit`);
  const domain    = await ask('Production domain (e.g. acme.com)', existing.VITE_APP_DOMAIN || '');
  const email     = await ask('Support email', existing.VITE_SUPPORT_EMAIL || `support@${domain || 'example.com'}`);

  log.ok('Project identity captured.');
  return { name, shortName, description: desc, domain, supportEmail: email };
}

// ─── STEP 3 — Firebase ────────────────────────────────────────────────────────
async function stepFirebase(app, existing) {
  log.title('🔥 Step 2 — Firebase Configuration');
  log.info('Values are in Firebase Console → Project Settings → General → Your apps → Web app.');
  console.log();

  let firebase = {
    projectId:         existing.VITE_FIREBASE_PROJECT_ID || '',
    apiKey:            existing.VITE_FIREBASE_API_KEY || '',
    authDomain:        existing.VITE_FIREBASE_AUTH_DOMAIN || '',
    storageBucket:     existing.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: existing.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId:             existing.VITE_FIREBASE_APP_ID || '',
    measurementId:     existing.VITE_FIREBASE_MEASUREMENT_ID || '',
  };

  // Try to read from .firebaserc first
  const rc = readFirebaseRc();
  if (rc?.projects?.default && !firebase.projectId) {
    firebase.projectId = rc.projects.default;
    log.ok(`Found project ID from .firebaserc: ${firebase.projectId}`);
  }

  const tryCli = await askYN('Try to fetch web config via Firebase CLI?', false);
  if (tryCli) {
    firebase = await fetchFirebaseCli(firebase);
  }

  // Manual entry for any blanks
  firebase.projectId = await ask('Firebase Project ID', firebase.projectId);
  firebase.apiKey    = await ask('Firebase API Key', firebase.apiKey);

  const authDomainDef    = firebase.authDomain    || `${firebase.projectId}.firebaseapp.com`;
  const storageBucketDef = firebase.storageBucket || `${firebase.projectId}.appspot.com`;

  firebase.authDomain        = await ask('Auth Domain',            authDomainDef);
  firebase.storageBucket     = await ask('Storage Bucket',         storageBucketDef);
  firebase.messagingSenderId = await ask('Messaging Sender ID',    firebase.messagingSenderId);
  firebase.appId             = await ask('App ID',                 firebase.appId);
  firebase.measurementId     = await ask('Measurement ID (optional, for GA)', firebase.measurementId);

  log.ok('Firebase configuration captured.');

  // Update firebase.json
  await updateFirebaseJson(app, firebase);

  // Update .firebaserc
  await updateFirebaseRc(app, firebase);

  return firebase;
}

async function fetchFirebaseCli(firebase) {
  try {
    execSync('firebase --version', { stdio: 'ignore' });
  } catch {
    log.warn('Firebase CLI not found. Install with: npm install -g firebase-tools');
    return firebase;
  }
  try {
    const raw = execSync(`firebase apps:sdkconfig WEB --project ${firebase.projectId} 2>/dev/null`, { encoding: 'utf8' });
    const apiKeyMatch   = raw.match(/apiKey:\s*["']([^"']+)/);
    const appIdMatch    = raw.match(/appId:\s*["']([^"']+)/);
    const senderIdMatch = raw.match(/messagingSenderId:\s*["']([^"']+)/);
    const measureMatch  = raw.match(/measurementId:\s*["']([^"']+)/);
    if (apiKeyMatch)   firebase.apiKey = apiKeyMatch[1];
    if (appIdMatch)    firebase.appId  = appIdMatch[1];
    if (senderIdMatch) firebase.messagingSenderId = senderIdMatch[1];
    if (measureMatch)  firebase.measurementId = measureMatch[1];
    log.ok('Fetched web config from Firebase CLI.');
  } catch {
    log.warn('CLI fetch failed — enter values manually.');
  }
  return firebase;
}

async function updateFirebaseJson(app, firebase) {
  const fbJson = readFirebaseJson();
  if (!fbJson) {
    log.warn('firebase.json not found — skipping update.');
    return;
  }

  const targetAlias = app.shortName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

  // Update hosting target name
  if (fbJson.hosting) {
    fbJson.hosting.target = targetAlias;
  }

  // Ask about hosting region
  const region = await ask(
    'Firebase hosting/functions region',
    fbJson.hosting?.frameworksBackend?.region || 'us-central1'
  );
  if (fbJson.hosting?.frameworksBackend) {
    fbJson.hosting.frameworksBackend.region = region;
  }

  writeFirebaseJson(fbJson);
  log.ok(`firebase.json updated (target: ${targetAlias}, region: ${region}).`);

  // Persist for .firebaserc use
  app._targetAlias = targetAlias;
  app._region      = region;
}

async function updateFirebaseRc(app, firebase) {
  const targetAlias = app._targetAlias || app.shortName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const projectId   = firebase.projectId;

  let rc = readFirebaseRc() || { projects: {}, targets: {}, etags: {} };

  rc.projects = rc.projects || {};
  rc.projects.default = projectId;

  rc.targets = rc.targets || {};
  rc.targets[projectId] = rc.targets[projectId] || {};
  rc.targets[projectId].hosting = rc.targets[projectId].hosting || {};
  // Only set if not already pointing somewhere
  if (!rc.targets[projectId].hosting[targetAlias]) {
    rc.targets[projectId].hosting[targetAlias] = [targetAlias];
  }

  writeFirebaseRc(rc);
  log.ok(`.firebaserc updated (project: ${projectId}, target alias: ${targetAlias}).`);
}

// ─── STEP 4 — API / Backend ───────────────────────────────────────────────────
async function stepApi(app, firebase, existing) {
  log.title('🌐 Step 3 — API / Backend');

  const defaultDev  = existing.VITE_API_BASE_URL_DEV
    || `http://localhost:5001/${firebase.projectId}/us-central1/api`;
  const defaultProd = existing.VITE_API_BASE_URL_PROD
    || `https://us-central1-${firebase.projectId}.cloudfunctions.net/api`;

  const hasCustomBackend = await askYN(
    'Do you have a separate backend API (not Firebase Functions)?', false
  );

  let devUrl, prodUrl;
  if (hasCustomBackend) {
    devUrl  = await ask('Development API URL', defaultDev);
    prodUrl = await ask('Production API URL',  defaultProd);
  } else {
    log.info(`Using Firebase Functions URLs (edit VITE_API_BASE_URL_* in .env to change).`);
    devUrl  = defaultDev;
    prodUrl = defaultProd;
  }

  log.ok('API configuration captured.');
  return { devUrl, prodUrl };
}

// ─── STEP 5 — RBAC / Roles ───────────────────────────────────────────────────
async function stepRbac() {
  log.title('🔑 Step 4 — Roles & Access Control');

  log.info('Define the roles your app uses. Every app has a base "user" role.');
  log.info('For each additional role you can specify:');
  log.info('  • A role value (e.g. "admin") used in code + Firebase custom claims');
  log.info('  • A boolean JWT claim key (e.g. "isAdmin") — used if your backend');
  log.info('    also sets boolean flags in the token alongside a roles array.');
  log.info('  • Which lower roles it inherits');
  log.info('  • Permissions it grants');
  console.log();

  const useDefaults = await askYN(
    'Use the default role set (user, client, consultant, admin, sysadmin)?', true
  );

  if (useDefaults) {
    return defaultRoles();
  }

  return await customRoles();
}

function defaultRoles() {
  return {
    roles: [
      { key: 'USER',       value: 'user' },
      { key: 'CLIENT',     value: 'client' },
      { key: 'CONSULTANT', value: 'consultant' },
      { key: 'ADMIN',      value: 'admin' },
      { key: 'SYS_ADMIN',  value: 'sysadmin' },
    ],
    roleHierarchy: {
      sysadmin:   ['admin', 'consultant', 'client', 'user'],
      admin:      ['consultant', 'client', 'user'],
      consultant: ['client', 'user'],
      client:     ['user'],
    },
    permissions: {
      user:       ['editOwnProfile'],
      client:     ['editOwnProfile', 'viewClientDashboard'],
      consultant: ['editOwnProfile', 'viewClientDashboard', 'viewConsultantDashboard', 'viewClients'],
      admin:      ['editOwnProfile', 'viewClientDashboard', 'viewConsultantDashboard', 'viewClients', 'viewAdminDashboard', 'manageUsers'],
      sysadmin:   ['editOwnProfile', 'viewClientDashboard', 'viewConsultantDashboard', 'viewClients', 'viewAdminDashboard', 'manageUsers', 'viewSysAdminDashboard', 'manageSystem'],
    },
    claimMap: {
      client:     'isClient',
      consultant: 'isConsultant',
      admin:      'isAdmin',
      sysadmin:   'isSysAdmin',
    },
  };
}

async function customRoles() {
  const roles = [{ key: 'USER', value: 'user' }];
  const claimMap = {};
  const roleHierarchy = {};
  const permissions = { user: ['editOwnProfile'] };

  log.info('Enter additional roles one at a time. Leave the role value blank to finish.');
  console.log();

  while (true) {
    const value = await ask('Role value (e.g. "admin", blank to finish)', '');
    if (!value) break;

    const key   = await ask(`Constant name for "${value}" (e.g. ADMIN)`, value.toUpperCase().replace(/[^A-Z0-9]/g, '_'));
    const claim = await ask(`Boolean JWT claim key for "${value}" (blank = none)`, `is${value.charAt(0).toUpperCase()}${value.slice(1)}`);
    if (claim) claimMap[value] = claim;

    roles.push({ key, value });

    const inheritsRaw = await ask(
      `Which roles does "${value}" inherit? (comma-separated values, blank = none)`, ''
    );
    if (inheritsRaw) {
      roleHierarchy[value] = inheritsRaw.split(',').map(s => s.trim()).filter(Boolean);
    }

    const permsRaw = await ask(
      `Permissions for "${value}" (comma-separated, blank = editOwnProfile only)`, ''
    );
    permissions[value] = permsRaw
      ? permsRaw.split(',').map(s => s.trim()).filter(Boolean)
      : ['editOwnProfile'];
  }

  return { roles, roleHierarchy, permissions, claimMap };
}

// ─── STEP 6 — Custom JWT attributes ──────────────────────────────────────────
async function stepCustomAttrs() {
  log.title('🎫 Step 5 — Custom Token Attributes');

  log.info('Beyond roles, your backend may set extra custom claims in the Firebase JWT');
  log.info('(e.g. tenantId, orgId, subscriptionTier, accountId).');
  log.info('Document them here so the .env carries a reference for devs and agents.');
  console.log();

  const hasAttrs = await askYN('Do you have extra custom JWT claim attributes?', false);
  if (!hasAttrs) return [];

  const attrs = [];
  log.info('Enter each attribute (blank claim key to finish).');
  console.log();

  while (true) {
    const claimKey = await ask('Claim key in JWT (e.g. tenantId, blank to finish)', '');
    if (!claimKey) break;
    const description = await ask(`Description for "${claimKey}"`, '');
    attrs.push({ claimKey, description });
  }

  if (attrs.length > 0) {
    log.ok(`Documented ${attrs.length} custom attribute(s).`);
  }
  return attrs;
}

// ─── STEP 7 — Feature flags ───────────────────────────────────────────────────
async function stepFeatures() {
  log.title('✨ Step 6 — Feature Flags');

  const emailVerification = await askYN('Enable email verification?', true);
  const phoneVerification = await askYN('Enable phone authentication (SMS)?', false);
  const multiTenant       = await askYN('Enable multi-tenant support?', false);
  const realTimeUpdates   = await askYN('Enable real-time updates (Firestore listeners)?', true);
  const analytics         = await askYN('Enable analytics (Google Analytics)?', false);

  let gaId = '';
  if (analytics) {
    gaId = await ask('Google Analytics Measurement ID (G-XXXXXXXXXX)', '');
  }

  log.ok('Feature flags captured.');
  return {
    features: {
      authentication: true,
      userProfiles: true,
      emailVerification,
      phoneVerification,
      multiTenant,
      realTimeUpdates,
      analytics,
    },
    analytics: analytics ? { gaId } : null,
  };
}

// ─── STEP 8 — Generate & validate ────────────────────────────────────────────
async function stepGenerate(cfg) {
  log.title('📝 Step 7 — Generating Configuration');

  // Write .env
  const envContent = buildEnvContent(cfg);
  fs.writeFileSync(ENV_FILE, envContent);
  log.ok('.env written');

  // Write .env.example
  fs.writeFileSync(ENV_EX, buildEnvExample(envContent));
  log.ok('.env.example written');

  // Update app.config.ts
  if (fs.existsSync(APP_CFG)) {
    let content = fs.readFileSync(APP_CFG, 'utf8');

    const rolesBlock = generateRolesBlock(cfg.rbac);
    content = replaceSetupBlock(content, 'roles', rolesBlock);

    const featuresBlock = generateFeaturesBlock({
      authentication:    true,
      userProfiles:      true,
      emailVerification: cfg.features.emailVerification,
      phoneVerification: cfg.features.phoneVerification,
      multiTenant:       cfg.features.multiTenant,
      realTimeUpdates:   cfg.features.realTimeUpdates,
      analytics:         cfg.features.analytics,
    });
    content = replaceSetupBlock(content, 'features', featuresBlock);

    fs.writeFileSync(APP_CFG, content);
    log.ok('app.config.ts updated (roles + features blocks)');
  } else {
    log.warn('app.config.ts not found — skipping update');
  }

  // Mono-repo setup script
  if (cfg.ctx.isMonoRepo) {
    generateMonoRepoScript(cfg);
  }
}

function generateMonoRepoScript(cfg) {
  const scriptPath = path.join(ROOT, '__scripts__', 'monorepo-setup.sh');
  const parentRel  = path.relative(ROOT, PARENT);

  const script = [
    `#!/usr/bin/env bash`,
    `# Mono-repo tidy-up script`,
    `# Generated by npm run setup on ${new Date().toISOString().slice(0, 10)}`,
    `#`,
    `# Run this from the frontend directory (${path.basename(ROOT)}) once after`,
    `# copying the boilerplate into a mono-repo structure.`,
    `# Review each command before running — it moves files to the project root.`,
    `#`,
    `# Usage:  bash __scripts__/monorepo-setup.sh`,
    ``,
    `set -e`,
    `FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"`,
    `PROJECT_ROOT="$(cd "$FRONTEND_DIR/.." && pwd)"`,
    ``,
    `echo "Moving shared files from frontend → project root..."`,
    ``,
    `# Move .claude skills/config to project root`,
    `if [ -d "$FRONTEND_DIR/.claude" ] && [ ! -d "$PROJECT_ROOT/.claude" ]; then`,
    `  mv "$FRONTEND_DIR/.claude" "$PROJECT_ROOT/.claude"`,
    `  echo "  ✓ .claude/ → project root"`,
    `fi`,
    ``,
    `# Move __docs__ if present`,
    `if [ -d "$FRONTEND_DIR/__docs__" ] && [ ! -d "$PROJECT_ROOT/__docs__" ]; then`,
    `  mv "$FRONTEND_DIR/__docs__" "$PROJECT_ROOT/__docs__"`,
    `  echo "  ✓ __docs__/ → project root"`,
    `fi`,
    ``,
    `# Merge .gitignore — append frontend's gitignore to parent if parent has one`,
    `if [ -f "$FRONTEND_DIR/.gitignore" ] && [ -f "$PROJECT_ROOT/.gitignore" ]; then`,
    `  echo "" >> "$PROJECT_ROOT/.gitignore"`,
    `  echo "# frontend/" >> "$PROJECT_ROOT/.gitignore"`,
    `  cat "$FRONTEND_DIR/.gitignore" | sed 's|^|frontend/|' | grep -v "^frontend/#" >> "$PROJECT_ROOT/.gitignore"`,
    `  echo "  ✓ .gitignore entries merged into project root"`,
    `elif [ -f "$FRONTEND_DIR/.gitignore" ]; then`,
    `  cp "$FRONTEND_DIR/.gitignore" "$PROJECT_ROOT/.gitignore"`,
    `  echo "  ✓ .gitignore copied to project root"`,
    `fi`,
    ``,
    `echo ""`,
    `echo "Remaining in frontend/:"`,
    `echo "  package.json, src/, vite.config.ts, svelte.config.js, etc."`,
    `echo ""`,
    `echo "Remaining in project root (or functions/):"`,
    `echo "  firebase.json, .firebaserc, firestore.rules, storage.rules, cors.json"`,
    `echo ""`,
    `echo "Done. Review git status before committing."`,
  ].join('\n') + '\n';

  fs.writeFileSync(scriptPath, script);
  fs.chmodSync(scriptPath, '755');
  log.ok('__scripts__/monorepo-setup.sh generated — review before running.');
}

// ─── STEP 9 — Validate ───────────────────────────────────────────────────────
async function stepValidate(cfg) {
  log.title('✅ Step 8 — Validation');

  let ok = true;

  // .env exists
  if (fs.existsSync(ENV_FILE)) {
    log.ok('.env file exists');
  } else {
    log.err('.env missing');
    ok = false;
  }

  // Firebase not placeholder
  if (cfg.firebase.projectId && cfg.firebase.projectId !== 'your-project-id') {
    log.ok(`Firebase project: ${cfg.firebase.projectId}`);
  } else {
    log.warn('Firebase project ID still looks like a placeholder');
  }

  if (cfg.firebase.apiKey && cfg.firebase.apiKey !== 'your-api-key') {
    log.ok('Firebase API key present');
  } else {
    log.warn('Firebase API key is empty or placeholder');
  }

  // node_modules
  if (fs.existsSync(path.join(ROOT, 'node_modules'))) {
    log.ok('node_modules found');
  } else {
    log.warn('Run npm install before starting the dev server');
  }

  return ok;
}

// ─── Summary ─────────────────────────────────────────────────────────────────
function displaySummary(cfg) {
  log.title('🎉 Setup Complete!');

  console.log(`${C.bold}Configuration:${C.reset}`);
  console.log(`  App:        ${C.green}${cfg.app.name}${C.reset} (${cfg.app.shortName})`);
  console.log(`  Domain:     ${C.green}${cfg.app.domain}${C.reset}`);
  console.log(`  Firebase:   ${C.green}${cfg.firebase.projectId}${C.reset}`);
  console.log(`  API (dev):  ${C.green}${cfg.api.devUrl}${C.reset}`);
  console.log(`  API (prod): ${C.green}${cfg.api.prodUrl}${C.reset}`);
  console.log(`  Roles:      ${C.green}${cfg.rbac.roles.map(r => r.value).join(', ')}${C.reset}`);
  console.log();

  console.log(`${C.bold}Files written:${C.reset}`);
  console.log(`  ${C.green}✓${C.reset} .env`);
  console.log(`  ${C.green}✓${C.reset} .env.example`);
  console.log(`  ${C.green}✓${C.reset} src/lib/config/app.config.ts`);
  console.log(`  ${C.green}✓${C.reset} firebase.json`);
  console.log(`  ${C.green}✓${C.reset} .firebaserc`);
  if (cfg.ctx.isMonoRepo) {
    console.log(`  ${C.green}✓${C.reset} __scripts__/monorepo-setup.sh`);
  }
  console.log();

  console.log(`${C.bold}Next steps:${C.reset}`);
  console.log(`  1. ${C.cyan}npm install${C.reset}      Install dependencies`);
  console.log(`  2. ${C.cyan}npm run dev${C.reset}      Start dev server (http://localhost:5173)`);
  console.log(`  3. ${C.cyan}npm run validate${C.reset} Full validation (build + tests)`);
  if (cfg.ctx.isMonoRepo) {
    console.log(`  4. ${C.cyan}bash __scripts__/monorepo-setup.sh${C.reset}  Tidy mono-repo structure`);
  }
  console.log();
  console.log(`  ${C.yellow}⚠${C.reset}  Never commit .env to git`);
  console.log(`  ${C.yellow}⚠${C.reset}  Share .env.example with your team`);
  console.log();
  console.log(`${C.bold}${C.blue}Happy coding! 🚀${C.reset}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.clear();
  console.log(`${C.bold}${C.blue}╔══════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}${C.blue}║  XBG SvelteKit Boilerplate — Setup Wizard   ║${C.reset}`);
  console.log(`${C.bold}${C.blue}╚══════════════════════════════════════════════╝${C.reset}`);
  console.log();

  const ctx      = detectContext();
  const existing = loadExistingEnv();

  await stepContext(ctx);

  const app      = await stepApp(existing);
  const firebase = await stepFirebase(app, existing);
  const api      = await stepApi(app, firebase, existing);
  const rbac     = await stepRbac();
  const customAttrs = await stepCustomAttrs();
  const { features, analytics } = await stepFeatures();

  const cfg = { ctx, app, firebase, api, rbac, features, analytics, customAttrs };

  await stepGenerate(cfg);
  await stepValidate(cfg);
  displaySummary(cfg);

  rl.close();
}

// ─── Graceful exit ────────────────────────────────────────────────────────────
process.on('SIGINT', () => {
  console.log('\n');
  log.warn('Setup cancelled. Run npm run setup to start again.');
  rl.close();
  process.exit(0);
});

main().catch((err) => {
  log.err(`Setup failed: ${err.message}`);
  if (process.env.DEBUG) console.error(err);
  rl.close();
  process.exit(1);
});
