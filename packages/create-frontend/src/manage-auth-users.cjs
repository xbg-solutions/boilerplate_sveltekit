#!/usr/bin/env node
/**
 * Firebase Auth User Management Script (DEVELOPMENT ONLY)
 * 
 * WARNING: This script is intended for local development and testing only.
 * It should be REMOVED from your project before deploying to production
 * as it could create significant security vulnerabilities.
 * 
 * Functions:
 * - Create users with email-link or phone auth
 * - Add, edit, or remove custom attributes from users
 * - List existing users with their custom attributes
 * 
 * Requirements:
 * - Firebase Admin SDK - install as a dev dependency!
 * - Node.js 14+
 * - service-account.json file in the project root or set FIREBASE_SERVICE_ACCOUNT_PATH environment variable
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const chalk = require('chalk');

// Check if .env file exists and load environment variables
const dotenvPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(dotenvPath)) {
  require('dotenv').config({ path: dotenvPath });
}

// Security warning
console.log(chalk.bgRed.white.bold('⚠️  SECURITY WARNING ⚠️'));
console.log(chalk.yellow('\nThis script is for DEVELOPMENT USE ONLY.'));
console.log(chalk.yellow('It should be REMOVED before deploying to production.'));
console.log(chalk.yellow('It provides administrative access to Firebase Authentication.\n'));

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) return;
  
  try {
    // Try to initialize using environment variables
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseInitialized = true;
      return;
    }
    
    // Try to initialize using service account file
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
      path.resolve(__dirname, '../service-account.json');
      
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseInitialized = true;
      return;
    }
    
    // If no service account found, prompt for manual input
    console.log(chalk.red('No Firebase service account found.'));
    console.log('You need to provide Firebase Admin SDK credentials to continue.');
    console.log('Please follow these steps:');
    console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
    console.log('2. Click "Generate New Private Key"');
    console.log('3. Save the JSON file in your project root as "service-account.json"');
    console.log('   or set FIREBASE_SERVICE_ACCOUNT_PATH environment variable\n');
    process.exit(1);
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    process.exit(1);
  }
}

// Helper function to prompt user
async function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Helper function for menu selection
async function showMenu(title, options) {
  console.log(chalk.cyan(`\n${title}`));
  
  options.forEach((option, index) => {
    console.log(`${index + 1}. ${option}`);
  });
  
  const selection = await prompt('\nSelect an option (number): ');
  const numSelection = parseInt(selection, 10);
  
  if (isNaN(numSelection) || numSelection < 1 || numSelection > options.length) {
    console.log(chalk.red('Invalid selection. Please try again.'));
    return showMenu(title, options);
  }
  
  return numSelection;
}

// List all users
async function listUsers() {
  console.log(chalk.cyan('\nFetching users...'));
  
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    
    if (listUsersResult.users.length === 0) {
      console.log(chalk.yellow('No users found in your Firebase project.'));
      return;
    }
    
    console.log(chalk.green(`\nFound ${listUsersResult.users.length} users:`));
    
    for (const user of listUsersResult.users) {
      console.log(chalk.cyan('\n-----------------------------------------'));
      console.log(`UID: ${chalk.yellow(user.uid)}`);
      console.log(`Email: ${user.email || 'N/A'}`);
      console.log(`Phone: ${user.phoneNumber || 'N/A'}`);
      console.log(`Email Verified: ${user.emailVerified}`);
      
      // Display custom claims (attributes)
      const customClaims = user.customClaims || {};
      console.log(chalk.cyan('\nCustom Attributes:'));
      
      if (Object.keys(customClaims).length === 0) {
        console.log('  No custom attributes');
      } else {
        for (const [key, value] of Object.entries(customClaims)) {
          console.log(`  ${key}: ${chalk.green(JSON.stringify(value))}`);
        }
      }
    }
  } catch (error) {
    console.error(chalk.red('Error fetching users:'), error);
  }
}

// Create a new user
async function createUser() {
  const authType = await showMenu('Select authentication method:', [
    'Email Link',
    'Phone Number'
  ]);
  
  try {
    let userRecord;
    
    if (authType === 1) {
      // Email Link user
      const email = await prompt('Enter email address: ');
      
      if (!email || !email.includes('@')) {
        console.log(chalk.red('Invalid email address. Please try again.'));
        return;
      }
      
      const emailVerified = true; // Always true for development convenience
      const password = Math.random().toString(36).slice(-10); // Random password
      
      userRecord = await admin.auth().createUser({
        email,
        emailVerified,
        password
      });
      
      console.log(chalk.green('\nEmail Link User created successfully:'));
      console.log(`UID: ${chalk.yellow(userRecord.uid)}`);
      console.log(`Email: ${userRecord.email}`);
      console.log('Password: [auto-generated, not needed for email link auth]');
    } else {
      // Phone Number user
      const phoneNumber = await prompt('Enter phone number (format: +11234567890): ');
      
      if (!phoneNumber || !phoneNumber.startsWith('+')) {
        console.log(chalk.red('Invalid phone number. Must start with + and country code.'));
        return;
      }
      
      userRecord = await admin.auth().createUser({
        phoneNumber
      });
      
      console.log(chalk.green('\nPhone Number User created successfully:'));
      console.log(`UID: ${chalk.yellow(userRecord.uid)}`);
      console.log(`Phone: ${userRecord.phoneNumber}`);
    }
    
    // Ask if they want to add custom attributes now
    const addAttributesNow = await prompt('Do you want to add custom attributes now? (y/n): ');
    
    if (addAttributesNow.toLowerCase() === 'y') {
      await manageCustomAttributes(userRecord.uid);
    }
  } catch (error) {
    console.error(chalk.red('Error creating user:'), error);
  }
}

// Manage custom attributes for a user
async function manageCustomAttributes(presetUid = null) {
  let uid = presetUid;
  
  if (!uid) {
    uid = await prompt('Enter user UID: ');
  }
  
  try {
    // Get the current user and their custom claims
    const userRecord = await admin.auth().getUser(uid);
    const currentClaims = userRecord.customClaims || {};
    
    console.log(chalk.cyan(`\nManaging custom attributes for user: ${userRecord.email || userRecord.phoneNumber || uid}`));
    console.log('\nCurrent custom attributes:');
    
    if (Object.keys(currentClaims).length === 0) {
      console.log('  No custom attributes');
    } else {
      for (const [key, value] of Object.entries(currentClaims)) {
        console.log(`  ${key}: ${chalk.green(JSON.stringify(value))}`);
      }
    }
    
    const action = await showMenu('\nWhat would you like to do?', [
      'Add or update attribute',
      'Add common roles (client, consultant, admin, sysAdmin)',
      'Remove attribute',
      'Clear all attributes',
      'Go back'
    ]);
    
    if (action === 1) {
      // Add or update attribute
      const key = await prompt('Enter attribute name: ');
      
      if (!key) {
        console.log(chalk.red('Invalid attribute name.'));
        return;
      }
      
      console.log(chalk.yellow('\nEnter attribute value (supports JSON).'));
      console.log('For string: just type the value');
      console.log('For boolean: type "true" or "false"');
      console.log('For number: type the number');
      console.log('For JSON: type an object like {"key": "value"}');
      
      const valueStr = await prompt('Value: ');
      let value;
      
      // Try to parse as JSON, otherwise use as string/boolean/number
      try {
        if (valueStr.toLowerCase() === 'true') {
          value = true;
        } else if (valueStr.toLowerCase() === 'false') {
          value = false;
        } else if (!isNaN(Number(valueStr))) {
          value = Number(valueStr);
        } else if (valueStr.startsWith('{') || valueStr.startsWith('[')) {
          value = JSON.parse(valueStr);
        } else {
          value = valueStr;
        }
      } catch (error) {
        value = valueStr; // Use as string if JSON parsing fails
      }
      
      // Update claims
      const newClaims = {
        ...currentClaims,
        [key]: value
      };
      
      await admin.auth().setCustomUserClaims(uid, newClaims);
      console.log(chalk.green(`\nCustom attribute '${key}' set successfully.`));
    } else if (action === 2) {
      // Add common roles
      const roles = [];
      
      const isClient = await prompt('Add client role? (y/n): ');
      if (isClient.toLowerCase() === 'y') roles.push('isClient');
      
      const isConsultant = await prompt('Add consultant role? (y/n): ');
      if (isConsultant.toLowerCase() === 'y') roles.push('isConsultant');
      
      const isAdmin = await prompt('Add admin role? (y/n): ');
      if (isAdmin.toLowerCase() === 'y') roles.push('isAdmin');
      
      const isSysAdmin = await prompt('Add sysAdmin role? (y/n): ');
      if (isSysAdmin.toLowerCase() === 'y') roles.push('isSysAdmin');
      
      // Check if user selected any roles
      if (roles.length === 0) {
        console.log(chalk.yellow('No roles selected.'));
        return;
      }
      
      // Update individual role flags
      const newClaims = { ...currentClaims };
      
      // Always set all role flags explicitly (true/false)
      newClaims.isClient = roles.includes('isClient');
      newClaims.isConsultant = roles.includes('isConsultant');
      newClaims.isAdmin = roles.includes('isAdmin');
      newClaims.isSysAdmin = roles.includes('isSysAdmin');
      
      // Keep existing roles array or create a new one
      newClaims.roles = roles;
      
      await admin.auth().setCustomUserClaims(uid, newClaims);
      console.log(chalk.green('\nCommon roles updated successfully.'));
    } else if (action === 3) {
      // Remove attribute
      const key = await prompt('Enter attribute name to remove: ');
      
      if (!key || !(key in currentClaims)) {
        console.log(chalk.red(`Attribute '${key}' not found.`));
        return;
      }
      
      // Create a new claims object without the specified key
      const { [key]: removedValue, ...newClaims } = currentClaims;
      
      await admin.auth().setCustomUserClaims(uid, newClaims);
      console.log(chalk.green(`\nCustom attribute '${key}' removed successfully.`));
    } else if (action === 4) {
      // Clear all attributes
      const confirm = await prompt('Are you sure you want to clear all custom attributes? (y/n): ');
      
      if (confirm.toLowerCase() === 'y') {
        await admin.auth().setCustomUserClaims(uid, {});
        console.log(chalk.green('\nAll custom attributes cleared successfully.'));
      }
    } else {
      // Go back
      return;
    }
  } catch (error) {
    console.error(chalk.red('Error managing custom attributes:'), error);
  }
}

// Main menu
async function mainMenu() {
  const option = await showMenu('Firebase Auth User Management', [
    'List all users',
    'Create a new user',
    'Manage custom attributes',
    'Exit'
  ]);
  
  switch (option) {
    case 1:
      await listUsers();
      break;
    case 2:
      await createUser();
      break;
    case 3:
      await manageCustomAttributes();
      break;
    case 4:
      console.log(chalk.green('\nExiting. Goodbye!'));
      rl.close();
      process.exit(0);
      break;
  }
  
  // Return to main menu
  await mainMenu();
}

// Start the script
async function start() {
  console.log(chalk.cyan('\nFirebase Auth User Management (DEVELOPMENT ONLY)'));
  
  initializeFirebase();
  await mainMenu();
}

// Handle errors and cleanup
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught exception:'), error);
  rl.close();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled rejection at:'), promise, chalk.red('reason:'), reason);
  rl.close();
  process.exit(1);
});

// Start the script
start();