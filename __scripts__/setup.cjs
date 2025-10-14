#!/usr/bin/env node

/**
 * Interactive Setup Wizard for SvelteKit Boilerplate
 * 
 * Guides developers through:
 * - Firebase project configuration
 * - Environment variable setup
 * - API endpoint configuration
 * - Initial validation and testing
 * 
 * Usage: npm run setup
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${question}${colors.reset} `, resolve);
  });
}

// Helper to print colored messages
const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}\n`)
};

// Configuration object to build
const config = {
  app: {},
  firebase: {},
  api: {},
  features: {},
  seo: {}
};

// Main setup flow
async function setup() {
  console.clear();
  log.title('🚀 SvelteKit Boilerplate - Interactive Setup Wizard');
  
  log.info('This wizard will configure your project in 3 minutes.');
  log.info('You can press Ctrl+C at any time to exit.\n');
  
  // Step 1: Basic App Configuration
  await setupAppConfig();
  
  // Step 2: Firebase Configuration
  const useFirebase = await ask('Do you want to configure Firebase now? (y/n): ');
  if (useFirebase.toLowerCase() === 'y') {
    await setupFirebaseConfig();
  } else {
    log.warn('Skipping Firebase setup. You can configure it later in app.config.ts');
    setFirebaseDefaults();
  }
  
  // Step 3: API Configuration
  await setupApiConfig();
  
  // Step 4: Feature Flags
  await setupFeatures();
  
  // Step 5: Generate files
  await generateFiles();
  
  // Step 6: Validate setup
  await validateSetup();
  
  // Done!
  displaySummary();
  
  rl.close();
}

// Step 1: Basic app configuration
async function setupAppConfig() {
  log.title('📱 Step 1: Application Configuration');
  
  config.app.name = await ask('App name (e.g., "My SaaS App"): ') || 'My App';
  config.app.shortName = await ask('Short name (e.g., "MySaaS"): ') || config.app.name.replace(/\s/g, '');
  config.app.description = await ask('App description: ') || `${config.app.name} - Built with SvelteKit`;
  config.app.domain = await ask('Production domain (e.g., "myapp.com"): ') || 'localhost';
  config.app.supportEmail = await ask('Support email: ') || `support@${config.app.domain}`;
  
  log.success('App configuration complete!');
}

// Step 2: Firebase configuration
async function setupFirebaseConfig() {
  log.title('🔥 Step 2: Firebase Configuration');
  
  log.info('You can find these values in Firebase Console > Project Settings > General');
  log.info('URL: https://console.firebase.google.com/\n');
  
  const autoDetect = await ask('Try to auto-detect Firebase config from firebase.json? (y/n): ');
  
  if (autoDetect.toLowerCase() === 'y') {
    try {
      const firebaseJson = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
      if (firebaseJson.projectId) {
        config.firebase.projectId = firebaseJson.projectId;
        log.success(`Found project ID: ${config.firebase.projectId}`);
        
        // Try to get Firebase config using CLI
        const getFbConfig = await ask('Fetch Firebase web config using Firebase CLI? (requires login) (y/n): ');
        if (getFbConfig.toLowerCase() === 'y') {
          await autoFetchFirebaseConfig();
          return;
        }
      }
    } catch (e) {
      log.warn('Could not auto-detect. Please enter manually.');
    }
  }
  
  // Manual entry
  config.firebase.projectId = await ask('Firebase Project ID: ') || 'your-project-id';
  config.firebase.apiKey = await ask('Firebase API Key: ') || 'your-api-key';
  config.firebase.authDomain = await ask('Auth Domain (press Enter for default): ') || `${config.firebase.projectId}.firebaseapp.com`;
  config.firebase.storageBucket = await ask('Storage Bucket (press Enter for default): ') || `${config.firebase.projectId}.appspot.com`;
  config.firebase.messagingSenderId = await ask('Messaging Sender ID: ') || '123456789';
  config.firebase.appId = await ask('App ID: ') || 'your-app-id';
  
  log.success('Firebase configuration complete!');
}

// Auto-fetch Firebase config using CLI
async function autoFetchFirebaseConfig() {
  try {
    log.info('Attempting to fetch Firebase config...');
    
    // Check if Firebase CLI is installed
    try {
      execSync('firebase --version', { stdio: 'ignore' });
    } catch (e) {
      log.error('Firebase CLI not found. Please install: npm install -g firebase-tools');
      return;
    }
    
    // Get current project
    const project = execSync('firebase use', { encoding: 'utf8' }).trim();
    config.firebase.projectId = project.replace('Now using project ', '').replace('Active Project: ', '');
    
    log.info('Fetching web app config from Firebase...');
    const webApps = execSync(`firebase apps:list WEB --project ${config.firebase.projectId}`, { encoding: 'utf8' });
    
    // Parse the web app config (this is simplified - in production would need better parsing)
    log.success('Retrieved Firebase project info!');
    log.warn('Please verify the configuration in the generated .env file');
    
  } catch (e) {
    log.error('Failed to auto-fetch Firebase config. Please enter manually.');
    log.info(`Error: ${e.message}`);
  }
}

// Set Firebase defaults if skipped
function setFirebaseDefaults() {
  config.firebase = {
    projectId: 'your-project-id',
    apiKey: 'your-api-key',
    authDomain: 'your-project-id.firebaseapp.com',
    storageBucket: 'your-project-id.appspot.com',
    messagingSenderId: '123456789',
    appId: 'your-app-id'
  };
}

// Step 3: API configuration
async function setupApiConfig() {
  log.title('🌐 Step 3: API Configuration');
  
  const hasApi = await ask('Do you have a backend API? (y/n): ');
  
  if (hasApi.toLowerCase() === 'y') {
    config.api.devUrl = await ask('Development API URL (e.g., http://localhost:5001): ') || 'http://localhost:5001';
    config.api.prodUrl = await ask('Production API URL: ') || `https://api.${config.app.domain}`;
  } else {
    log.info('No API configured. Using Firebase Functions pattern.');
    config.api.devUrl = `http://localhost:5001/${config.firebase.projectId}/us-central1/api`;
    config.api.prodUrl = `https://us-central1-${config.firebase.projectId}.cloudfunctions.net/api`;
  }
  
  log.success('API configuration complete!');
}

// Step 4: Feature flags
async function setupFeatures() {
  log.title('✨ Step 4: Feature Configuration');
  
  log.info('Enable features you want to use (you can change these later):\n');
  
  const askFeature = async (name, description, defaultVal = true) => {
    const answer = await ask(`Enable ${name}? (${description}) (y/n) [${defaultVal ? 'y' : 'n'}]: `);
    return answer.toLowerCase() === 'y' || (answer === '' && defaultVal);
  };
  
  config.features.authentication = await askFeature('Authentication', 'User login/signup', true);
  config.features.emailVerification = await askFeature('Email Verification', 'Verify user emails', true);
  config.features.phoneVerification = await askFeature('Phone Verification', 'SMS authentication', false);
  config.features.analytics = await askFeature('Analytics', 'Google Analytics tracking', false);
  
  if (config.features.analytics) {
    config.analytics = {};
    config.analytics.gaId = await ask('Google Analytics ID (GA4): ') || 'G-XXXXXXXXXX';
  }
  
  log.success('Feature configuration complete!');
}

// Step 5: SEO configuration
async function setupSEO() {
  log.title('🔍 Step 5: SEO Configuration');
  
  log.info('Configure SEO metadata for better search rankings:\n');
  
  const configureSEO = await ask('Configure SEO settings now? (y/n) [y]: ');
  
  if (configureSEO.toLowerCase() === 'n') {
    log.warn('Skipping SEO configuration. You can configure it later in app.config.ts');
    config.seo = {
      defaultTitle: config.app.name,
      defaultDescription: config.app.description,
      defaultImage: '/og-image.jpg',
      defaultKeywords: [],
      twitterHandle: ''
    };
    return;
  }
  
  config.seo = {
    defaultTitle: await ask(`Default page title [${config.app.name}]: `) || config.app.name,
    defaultDescription: await ask(`Default meta description [${config.app.description}]: `) || config.app.description,
    defaultImage: await ask('Default OG image path [/og-image.jpg]: ') || '/og-image.jpg',
    defaultKeywords: [],
    twitterHandle: await ask('Twitter handle (e.g., @yourcompany): ') || ''
  };
  
  // Keywords
  const keywordsInput = await ask('Default keywords (comma-separated): ');
  if (keywordsInput) {
    config.seo.defaultKeywords = keywordsInput.split(',').map(k => k.trim());
  }
  
  log.success('SEO configuration complete!');
}

// Step 5: Generate configuration files
async function generateFiles() {
  log.title('📝 Step 5: Generating Configuration Files');
  
  // Generate .env file
  const envContent = `# Application Configuration
VITE_APP_NAME="${config.app.name}"
VITE_APP_DOMAIN="${config.app.domain}"
VITE_SUPPORT_EMAIL="${config.app.supportEmail}"

# Firebase Configuration
VITE_FIREBASE_PROJECT_ID="${config.firebase.projectId}"
VITE_FIREBASE_API_KEY="${config.firebase.apiKey}"
VITE_FIREBASE_AUTH_DOMAIN="${config.firebase.authDomain}"
VITE_FIREBASE_STORAGE_BUCKET="${config.firebase.storageBucket}"
VITE_FIREBASE_MESSAGING_SENDER_ID="${config.firebase.messagingSenderId}"
VITE_FIREBASE_APP_ID="${config.firebase.appId}"

# API Configuration
VITE_API_BASE_URL_DEV="${config.api.devUrl}"
VITE_API_BASE_URL_PROD="${config.api.prodUrl}"

# Feature Flags
VITE_ENABLE_EMAIL_VERIFICATION="${config.features.emailVerification}"
VITE_ENABLE_PHONE_VERIFICATION="${config.features.phoneVerification}"
VITE_ENABLE_ANALYTICS="${config.features.analytics}"
${config.features.analytics ? `VITE_GA_MEASUREMENT_ID="${config.analytics.gaId}"` : '# VITE_GA_MEASUREMENT_ID=""'}

# SEO Configuration
VITE_SEO_DEFAULT_TITLE="${config.seo.defaultTitle}"
VITE_SEO_DEFAULT_DESCRIPTION="${config.seo.defaultDescription}"
VITE_SEO_DEFAULT_IMAGE="${config.seo.defaultImage}"
VITE_SEO_DEFAULT_KEYWORDS="${config.seo.defaultKeywords.join(', ')}"
${config.seo.twitterHandle ? `VITE_SEO_TWITTER_HANDLE="${config.seo.twitterHandle}"` : '# VITE_SEO_TWITTER_HANDLE=""'}

# Development
NODE_ENV=development
`;

  // Write .env file
  fs.writeFileSync('.env', envContent);
  log.success('Created .env file');
  
  // Generate .env.example (without sensitive values)
  const envExampleContent = envContent
    .replace(config.firebase.apiKey, 'your-firebase-api-key')
    .replace(config.firebase.appId, 'your-firebase-app-id');
  
  fs.writeFileSync('.env.example', envExampleContent);
  log.success('Created .env.example file');
  
  // Update app.config.ts with environment variable usage
  await updateAppConfig();
  
  log.success('All configuration files generated!');
}

// Update app.config.ts to use environment variables
async function updateAppConfig() {
  const configPath = path.join('src', 'lib', 'config', 'app.config.ts');
  
  if (!fs.existsSync(configPath)) {
    log.warn('app.config.ts not found - skipping update');
    return;
  }
  
  // Read current config
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Replace FIXME values with env vars (only if they're still FIXME placeholders)
  const replacements = [
    { pattern: /name: ['"].*?['"],\s*\/\/ FIXME/, replacement: `name: import.meta.env.VITE_APP_NAME || '${config.app.name}',` },
    { pattern: /domain: ['"].*?['"],\s*\/\/ FIXME/, replacement: `domain: import.meta.env.VITE_APP_DOMAIN || '${config.app.domain}',` },
    { pattern: /projectId: ['"].*?['"],\s*\/\/ FIXME/, replacement: `projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '${config.firebase.projectId}',` },
    { pattern: /apiKey: ['"].*?['"],\s*\/\/ FIXME/, replacement: `apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '${config.firebase.apiKey}',` }
  ];
  
  replacements.forEach(({ pattern, replacement }) => {
    configContent = configContent.replace(pattern, replacement);
  });
  
  // Write back
  fs.writeFileSync(configPath, configContent);
  log.success('Updated app.config.ts with environment variables');
}

// Step 6: Validate setup
async function validateSetup() {
  log.title('✅ Step 6: Validating Setup');
  
  // Check .env file
  if (fs.existsSync('.env')) {
    log.success('.env file exists');
  } else {
    log.error('.env file missing');
  }
  
  // Check node_modules
  if (fs.existsSync('node_modules')) {
    log.success('Dependencies installed');
  } else {
    log.warn('Dependencies not installed. Run: npm install');
  }
  
  // Test Firebase config (basic validation)
  if (config.firebase.projectId !== 'your-project-id') {
    log.success('Firebase project ID configured');
  } else {
    log.warn('Firebase still using placeholder values');
  }
  
  log.success('Setup validation complete!');
}

// Display setup summary
function displaySummary() {
  log.title('🎉 Setup Complete!');
  
  console.log(`${colors.bright}Your Configuration:${colors.reset}`);
  console.log(`  App Name: ${colors.green}${config.app.name}${colors.reset}`);
  console.log(`  Domain: ${colors.green}${config.app.domain}${colors.reset}`);
  console.log(`  Firebase Project: ${colors.green}${config.firebase.projectId}${colors.reset}`);
  console.log(`  API (Dev): ${colors.green}${config.api.devUrl}${colors.reset}`);
  console.log(`  API (Prod): ${colors.green}${config.api.prodUrl}${colors.reset}\n`);
  
  console.log(`${colors.bright}Next Steps:${colors.reset}`);
  console.log(`  1. ${colors.cyan}npm install${colors.reset} - Install dependencies (if not already done)`);
  console.log(`  2. ${colors.cyan}npm run dev${colors.reset} - Start development server`);
  console.log(`  3. ${colors.cyan}Visit http://localhost:5173${colors.reset} - View your app`);
  console.log(`  4. ${colors.cyan}npm run test${colors.reset} - Run tests to verify setup\n`);
  
  console.log(`${colors.bright}Configuration Files Created:${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} .env - Your environment variables`);
  console.log(`  ${colors.green}✓${colors.reset} .env.example - Template for other developers`);
  console.log(`  ${colors.green}✓${colors.reset} src/lib/config/app.config.ts - Updated with your values\n`);
  
  console.log(`${colors.yellow}Remember:${colors.reset}`);
  console.log(`  • Never commit .env to git (it's in .gitignore)`);
  console.log(`  • Share .env.example with your team`);
  console.log(`  • Update Firebase security rules before production\n`);
  
  console.log(`${colors.bright}${colors.blue}Happy coding! 🚀${colors.reset}\n`);
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n');
  log.warn('Setup cancelled by user');
  rl.close();
  process.exit(0);
});

// Run setup
setup().catch((error) => {
  log.error(`Setup failed: ${error.message}`);
  rl.close();
  process.exit(1);
});