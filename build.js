/**
 * build.js
 * 
 * A simplified build script using standard Vite build for Firebase compatibility.
 * 
 * This script:
 * 1. Runs the standard Vite build
 * 2. Ensures the build directory exists
 * 3. Copies output files if needed
 * 4. Ensures index.html exists in the build directory
 * 5. Creates fallback index.html files for SPA routing
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Make sure the build directory exists
if (!fs.existsSync('build')) {
  fs.mkdirSync('build', { recursive: true });
}

// Copy the static files from the output directory
function copyBuildFiles() {
  try {
    const source = '.svelte-kit/output/client';
    const dest = 'build';
    
    if (fs.existsSync(source)) {
      // Copy files recursively
      fs.cpSync(source, dest, { recursive: true });
      console.log('Files copied successfully!');
    } else {
      console.error(`Source directory ${source} does not exist.`);
    }
    
    // Create an index.html in the build directory if it doesn't exist
    if (!fs.existsSync(path.join(dest, 'index.html'))) {
      fs.copyFileSync('index.html', path.join(dest, 'index.html'));
      console.log('Copied index.html to build directory');
    }
  } catch (err) {
    console.error('Error copying files:', err);
  }
}

// Create fallback index.html files for SPA routing
function createSPAFallbacks() {
  try {
    const buildDir = 'build';
    const indexContent = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf8');
    
    // Create protected directory if it doesn't exist
    const protectedDir = path.join(buildDir, 'protected');
    if (!fs.existsSync(protectedDir)) {
      fs.mkdirSync(protectedDir, { recursive: true });
    }
    
    // Create fallback index.html in protected directory
    fs.writeFileSync(path.join(protectedDir, 'index.html'), indexContent);
    
    // Create subdirectories for protected routes
    const protectedSubdirs = ['admin', 'client', 'consultant'];
    
    for (const subdir of protectedSubdirs) {
      const fullPath = path.join(protectedDir, subdir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      fs.writeFileSync(path.join(fullPath, 'index.html'), indexContent);
    }
    
    // Create other route directories
    const otherDirs = ['confirm', 'unauthorized'];
    
    for (const dir of otherDirs) {
      const fullPath = path.join(buildDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      fs.writeFileSync(path.join(fullPath, 'index.html'), indexContent);
    }
    
    console.log('Created SPA fallback index.html files');
  } catch (err) {
    console.error('Error creating SPA fallbacks:', err);
  }
}

// Run the Vite build
try {
  // Run the standard vite build command
  console.log("Running vite build...");
  execSync('npm run build:vite', { stdio: 'inherit' });
  
  // Copy files if needed
  copyBuildFiles();
  
  // Create SPA fallbacks for client-side routing
  createSPAFallbacks();
  
  console.log('Build completed successfully!');
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}