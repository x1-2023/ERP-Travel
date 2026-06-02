#!/usr/bin/env node

/**
 * VietERP — Cross-platform clean script
 * Removes build artifacts and node_modules
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const dirsToClean = [
  'node_modules',
];

// Collect app-level directories
const appsDir = path.join(root, 'apps');
if (fs.existsSync(appsDir)) {
  for (const app of fs.readdirSync(appsDir)) {
    const appPath = path.join(appsDir, app);
    if (fs.statSync(appPath).isDirectory()) {
      dirsToClean.push(
        path.join('apps', app, 'node_modules'),
        path.join('apps', app, '.next'),
        path.join('apps', app, 'dist'),
      );
    }
  }
}

// Collect package-level directories
const pkgsDir = path.join(root, 'packages');
if (fs.existsSync(pkgsDir)) {
  for (const pkg of fs.readdirSync(pkgsDir)) {
    const pkgPath = path.join(pkgsDir, pkg);
    if (fs.statSync(pkgPath).isDirectory()) {
      dirsToClean.push(
        path.join('packages', pkg, 'node_modules'),
        path.join('packages', pkg, 'dist'),
      );
    }
  }
}

let cleaned = 0;
for (const dir of dirsToClean) {
  const fullPath = path.join(root, dir);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`  removed ${dir}`);
    cleaned++;
  }
}

if (cleaned === 0) {
  console.log('  Nothing to clean.');
} else {
  console.log(`\n  Cleaned ${cleaned} directories.`);
}
