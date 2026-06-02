#!/usr/bin/env node

/**
 * VietERP — Cross-platform Development Setup Script
 * Works on Windows (PowerShell/CMD), macOS, and Linux
 *
 * Usage: node scripts/setup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isWindows = process.platform === 'win32';

// Colors (ANSI codes work in modern terminals including Windows Terminal)
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const NC = '\x1b[0m';

function log(msg) { console.log(`${BLUE}i ${msg}${NC}`); }
function success(msg) { console.log(`${GREEN}✓ ${msg}${NC}`); }
function warn(msg) { console.log(`${YELLOW}! ${msg}${NC}`); }
function error(msg) { console.error(`${RED}✗ ${msg}${NC}`); }

function run(cmd, options = {}) {
  try {
    execSync(cmd, { stdio: 'inherit', ...options });
    return true;
  } catch {
    return false;
  }
}

function getCommandOutput(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function commandExists(cmd) {
  const check = isWindows ? `where ${cmd}` : `command -v ${cmd}`;
  return getCommandOutput(check) !== null;
}

// ─── Main ───────────────────────────────────────────────────

console.log(`\n${BLUE}=== VietERP — Development Environment Setup ===${NC}\n`);
console.log(`${BLUE}Platform: ${process.platform} | Node: ${process.version}${NC}\n`);

let hasErrors = false;

// 1. Check Node.js version
log('Checking Node.js version...');
const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajor < 20) {
  error(`Node.js >= 20.x is required (current: ${process.version})`);
  error('Download: https://nodejs.org/');
  process.exit(1);
}
success(`Node.js ${process.version}`);

// 2. Check npm version
log('Checking npm version...');
const npmVersion = getCommandOutput('npm -v');
if (!npmVersion || parseInt(npmVersion.split('.')[0], 10) < 10) {
  error(`npm >= 10.x is required (current: ${npmVersion || 'not found'})`);
  process.exit(1);
}
success(`npm ${npmVersion}`);

// 3. Check Docker (optional)
log('Checking Docker...');
if (commandExists('docker')) {
  success('Docker detected');
} else {
  warn('Docker not found — database services will need manual setup');
  warn('Download Docker Desktop: https://www.docker.com/products/docker-desktop/');
  hasErrors = true;
}

// 4. Check Git
log('Checking Git...');
if (commandExists('git')) {
  const gitVersion = getCommandOutput('git --version');
  success(gitVersion || 'Git detected');
} else {
  warn('Git not found — version control will not work');
  hasErrors = true;
}

// 5. Install dependencies
log('Installing dependencies (this may take a few minutes)...');
if (!run('npm install --legacy-peer-deps')) {
  error('Failed to install dependencies');
  error('Try running manually: npm install --legacy-peer-deps');
  process.exit(1);
}
success('Dependencies installed');

// 6. Setup .env file
log('Setting up environment configuration...');
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    success('.env created from .env.example');
  } else {
    warn('.env.example not found — you may need to create .env manually');
  }
} else {
  log('.env already exists, skipping');
}

// 7. Start Docker services (if Docker is available)
if (commandExists('docker')) {
  log('Starting Docker services...');
  if (run('docker compose up -d')) {
    success('Docker services started');

    // Wait for services
    log('Waiting for services to be ready (5s)...');
    const waitMs = 5000;
    const start = Date.now();
    while (Date.now() - start < waitMs) { /* busy wait */ }
    success('Services ready');

    // 8. Database setup
    log('Generating database schema...');
    if (run('npx turbo db:generate')) {
      success('Database schema generated');
    } else {
      warn('Database schema generation failed — you can run later: npm run db:generate');
    }

    log('Pushing database schema...');
    if (run('npx turbo db:push')) {
      success('Database schema pushed');
    } else {
      warn('Database push failed — you can run later: npm run db:push');
    }
  } else {
    warn('Docker services failed to start — database setup skipped');
    warn('Start manually: docker compose up -d');
  }
} else {
  warn('Skipping Docker/database setup (Docker not installed)');
}

// Done
console.log('');
console.log(`${GREEN}========================================${NC}`);
if (hasErrors) {
  console.log(`${YELLOW}  Setup completed with warnings${NC}`);
} else {
  console.log(`${GREEN}  Setup completed successfully!${NC}`);
}
console.log(`${GREEN}========================================${NC}`);
console.log('');
console.log(`${YELLOW}Next steps:${NC}`);
console.log('');
console.log('  1. Start development server:');
console.log(`     ${BLUE}npm run dev${NC}`);
console.log('');
console.log('  2. Run tests:');
console.log(`     ${BLUE}npm test${NC}`);
console.log('');
console.log('  3. Build all modules:');
console.log(`     ${BLUE}npm run build${NC}`);
console.log('');
if (isWindows) {
  console.log(`  ${BLUE}Tip: All commands use npm scripts — no need for 'make'${NC}`);
  console.log('');
}
console.log(`${BLUE}For more information, see README.md${NC}`);
console.log('');
