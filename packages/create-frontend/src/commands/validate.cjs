#!/usr/bin/env node

/**
 * Validates the project setup and configuration
 * 
 * Checks:
 * - Environment variables
 * - Firebase configuration
 * - Dependencies
 * - Build configuration
 * - Test setup
 * 
 * Usage: npm run validate
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}`)
};

let errorCount = 0;
let warningCount = 0;

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log.success(`${description} exists`);
    return true;
  } else {
    log.error(`${description} missing: ${filePath}`);
    errorCount++;
    return false;
  }
}

function checkEnvVar(varName, description, isRequired = true) {
  // Read .env file
  if (!fs.existsSync('.env')) {
    if (isRequired) {
      log.error(`.env file not found - run 'npm run setup'`);
      errorCount++;
    }
    return false;
  }
  
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(new RegExp(`${varName}=(.+)`));
  
  if (match && match[1] && match[1].trim() !== '') {
    const value = match[1].trim().replace(/"/g, '');
    
    // Check if it's still a placeholder
    if (value.includes('your-') || value.includes('FIXME') || value === 'localhost') {
      if (isRequired) {
        log.warn(`${description} is set to placeholder value: ${value}`);
        warningCount++;
      }
      return false;
    }
    
    log.success(`${description} configured`);
    return true;
  } else {
    if (isRequired) {
      log.error(`${description} missing (${varName})`);
      errorCount++;
    } else {
      log.warn(`${description} not set (${varName})`);
      warningCount++;
    }
    return false;
  }
}

function validatePackageJson() {
  log.title('📦 Package.json Validation');
  
  if (!checkFile('package.json', 'package.json')) return;
  
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check required scripts
  const requiredScripts = ['dev', 'build', 'test', 'lint'];
  requiredScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      log.success(`Script '${script}' defined`);
    } else {
      log.error(`Script '${script}' missing`);
      errorCount++;
    }
  });
  
  // Check required dependencies
  const requiredDeps = ['svelte', 'firebase', 'tailwindcss'];
  requiredDeps.forEach(dep => {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      log.success(`Dependency '${dep}' installed`);
    } else if (pkg.devDependencies && pkg.devDependencies[dep]) {
      log.success(`Dev dependency '${dep}' installed`);
    } else {
      log.error(`Required dependency '${dep}' missing`);
      errorCount++;
    }
  });
}

function getTailwindVersion() {
  try {
    const pkgPath = path.join('node_modules', 'tailwindcss', 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return pkg.version || null;
    }
  } catch (e) { /* ignore */ }
  return null;
}

function validateTailwind() {
  const version = getTailwindVersion();
  const major = version ? parseInt(version.split('.')[0], 10) : 0;

  if (major >= 4) {
    // Tailwind v4 uses CSS-based config via @theme directive
    const cssFiles = ['src/app.css', 'src/app.pcss', 'src/styles/app.css'];
    const found = cssFiles.find(f => {
      if (!fs.existsSync(f)) return false;
      const content = fs.readFileSync(f, 'utf8');
      return content.includes('@theme');
    });

    if (found) {
      log.success(`Tailwind v${version} CSS config detected (${found})`);
    } else {
      log.error(`Tailwind v${version} detected but no @theme directive found in CSS entry point`);
      errorCount++;
    }
  } else {
    // Tailwind v3 or unknown — look for config file
    const configFiles = ['tailwind.config.js', 'tailwind.config.cjs', 'tailwind.config.ts'];
    const found = configFiles.find(f => fs.existsSync(f));

    if (found) {
      log.success(`Tailwind config (${found})`);
    } else {
      log.error('Tailwind config missing (expected tailwind.config.js, .cjs, or .ts)');
      errorCount++;
    }
  }
}

function validateFiles() {
  log.title('📁 File Structure Validation');
  
  const requiredFiles = [
    { path: 'src/app.html', desc: 'App HTML template' },
    { path: 'src/routes/+page.svelte', desc: 'Home page' },
    { path: 'src/lib/config/app.config.ts', desc: 'App configuration' },
    { path: 'svelte.config.js', desc: 'Svelte config' },
    { path: 'vite.config.ts', desc: 'Vite config' },
    { path: 'tsconfig.json', desc: 'TypeScript config' }
  ];

  requiredFiles.forEach(({ path, desc }) => checkFile(path, desc));

  // Tailwind — version-aware check (v3: config file, v4: CSS @theme directive)
  validateTailwind();
  
  // Check component library
  if (fs.existsSync('src/lib/components/ui')) {
    const uiComponents = fs.readdirSync('src/lib/components/ui');
    log.success(`UI component library (${uiComponents.length} components)`);
  } else {
    log.error('UI component library missing');
    errorCount++;
  }
}

function validateEnvironment() {
  log.title('🌍 Environment Configuration Validation');
  
  // Check .env file
  checkFile('.env', 'Environment file (.env)');
  checkFile('.env.example', 'Environment template (.env.example)');
  
  // Check required environment variables
  checkEnvVar('VITE_APP_NAME', 'App name', true);
  checkEnvVar('VITE_APP_DOMAIN', 'App domain', true);
  checkEnvVar('VITE_FIREBASE_PROJECT_ID', 'Firebase Project ID', true);
  checkEnvVar('VITE_FIREBASE_API_KEY', 'Firebase API Key', true);
  checkEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'Firebase Auth Domain', true);
  
  // Optional but recommended
  checkEnvVar('VITE_API_BASE_URL_DEV', 'Development API URL', false);
  checkEnvVar('VITE_API_BASE_URL_PROD', 'Production API URL', false);
}

function validateFirebase() {
  log.title('🔥 Firebase Configuration Validation');
  
  // Check firebase.json
  if (checkFile('firebase.json', 'Firebase config (firebase.json)')) {
    try {
      const firebaseConfig = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
      
      if (firebaseConfig.hosting) {
        log.success('Firebase Hosting configured');
      } else {
        log.warn('Firebase Hosting not configured');
        warningCount++;
      }
      
      if (firebaseConfig.emulators) {
        log.success('Firebase Emulators configured');
      } else {
        log.info('Firebase Emulators not configured (optional)');
      }
    } catch (e) {
      log.error(`Invalid firebase.json: ${e.message}`);
      errorCount++;
    }
  }
  
  // Check if Firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'ignore' });
    log.success('Firebase CLI installed');
  } catch (e) {
    log.warn('Firebase CLI not found - install: npm install -g firebase-tools');
    warningCount++;
  }
}

function validateBuild() {
  log.title('🏗️  Build Configuration Validation');
  
  // Check if node_modules exists
  if (fs.existsSync('node_modules')) {
    log.success('Dependencies installed');
  } else {
    log.error('Dependencies not installed - run: npm install');
    errorCount++;
    return;
  }
  
  // Try a build (optional - can be slow)
  const quickBuild = process.argv.includes('--quick');
  if (!quickBuild) {
    log.info('Testing build process (use --quick to skip)...');
    try {
      execSync('npm run build', { stdio: 'ignore', timeout: 60000 });
      log.success('Build successful');
    } catch (e) {
      log.error('Build failed - check build output for errors');
      errorCount++;
    }
  }
}

function validateTests() {
  log.title('🧪 Test Setup Validation');
  
  // Check test configuration
  if (checkFile('vitest.config.ts', 'Vitest config')) {
    // Try running tests
    log.info('Running tests (use --quick to skip)...');
    const quickTest = process.argv.includes('--quick');
    if (!quickTest) {
      try {
        const testOutput = execSync('npm test', { encoding: 'utf8', timeout: 30000 });
        
        // Parse test results
        const passMatch = testOutput.match(/(\d+) passed/);
        if (passMatch) {
          log.success(`Tests passing: ${passMatch[1]} tests`);
        } else {
          log.success('Tests completed');
        }
      } catch (e) {
        log.error('Tests failed - check test output for errors');
        errorCount++;
      }
    }
  }
}

function validateAppConfig() {
  log.title('⚙️  App Configuration Validation');
  
  const configPath = 'src/lib/config/app.config.ts';
  if (!fs.existsSync(configPath)) {
    log.error('app.config.ts not found');
    errorCount++;
    return;
  }
  
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // Check for FIXME comments
  const fixmeMatches = configContent.match(/\/\/ FIXME:/g);
  if (fixmeMatches && fixmeMatches.length > 0) {
    log.warn(`Found ${fixmeMatches.length} FIXME comments in app.config.ts`);
    log.info('  Review and update these configuration items');
    warningCount++;
  } else {
    log.success('No FIXME comments in app.config.ts');
  }
  
  // Check for placeholder values
  const placeholders = [
    'your-project-id',
    'your-api-key',
    'your-app-id',
    'your-domain.com'
  ];
  
  let placeholderCount = 0;
  placeholders.forEach(placeholder => {
    if (configContent.includes(placeholder)) {
      placeholderCount++;
    }
  });
  
  if (placeholderCount > 0) {
    log.warn(`Found ${placeholderCount} placeholder values in app.config.ts`);
    log.info('  Run `npm run setup` to configure automatically');
    warningCount++;
  } else {
    log.success('No placeholder values in app.config.ts');
  }
}

function displaySummary() {
  log.title('📊 Validation Summary');
  
  console.log(`\nResults:`);
  console.log(`  ${colors.green}✓ Checks passed${colors.reset}`);
  console.log(`  ${colors.red}✗ Errors: ${errorCount}${colors.reset}`);
  console.log(`  ${colors.yellow}⚠ Warnings: ${warningCount}${colors.reset}\n`);
  
  if (errorCount === 0 && warningCount === 0) {
    console.log(`${colors.green}${colors.bright}🎉 Your project is fully configured and ready!${colors.reset}\n`);
    console.log(`Next steps:`);
    console.log(`  ${colors.cyan}npm run dev${colors.reset} - Start development server`);
    console.log(`  ${colors.cyan}npm test${colors.reset} - Run tests`);
    console.log(`  ${colors.cyan}npm run build${colors.reset} - Build for production\n`);
  } else if (errorCount === 0) {
    console.log(`${colors.yellow}⚠ Project is mostly configured with ${warningCount} warnings${colors.reset}\n`);
    console.log(`Consider addressing the warnings above for best results.\n`);
  } else {
    console.log(`${colors.red}❌ Project has ${errorCount} errors that need to be fixed${colors.reset}\n`);
    console.log(`Fix the errors above before continuing.\n`);
    console.log(`Quick fixes:`);
    console.log(`  ${colors.cyan}npm run setup${colors.reset} - Run interactive setup wizard`);
    console.log(`  ${colors.cyan}npm install${colors.reset} - Install missing dependencies\n`);
  }
  
  process.exit(errorCount > 0 ? 1 : 0);
}

// Main validation
console.clear();
console.log(`${colors.bright}${colors.cyan}🔍 SvelteKit Boilerplate - Setup Validation${colors.reset}\n`);

validatePackageJson();
validateFiles();
validateEnvironment();
validateFirebase();
validateAppConfig();
validateBuild();
validateTests();
displaySummary();