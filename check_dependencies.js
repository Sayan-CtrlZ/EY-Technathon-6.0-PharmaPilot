// Check if all client dependencies are installed
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));

const allDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

console.log('Checking client dependencies...\n');

const missing = [];
const installed = [];

for (const [packageName, version] of Object.entries(allDeps)) {
  try {
    // Try to require/import the package
    await import(packageName);
    installed.push(packageName);
    console.log(`[OK] ${packageName.padEnd(30)} - Installed`);
  } catch (error) {
    // Check if it's in node_modules
    try {
      const fs = await import('fs');
      const path = await import('path');
      const nodeModulesPath = path.join(__dirname, 'node_modules', packageName);
      if (fs.existsSync(nodeModulesPath)) {
        installed.push(packageName);
        console.log(`[OK] ${packageName.padEnd(30)} - Installed (in node_modules)`);
      } else {
        missing.push(packageName);
        console.log(`[MISSING] ${packageName.padEnd(30)} - NOT INSTALLED`);
      }
    } catch {
      missing.push(packageName);
      console.log(`[MISSING] ${packageName.padEnd(30)} - NOT INSTALLED`);
    }
  }
}

console.log('\n' + '='.repeat(50));
if (missing.length > 0) {
  console.log(`\n[MISSING] Missing packages: ${missing.join(', ')}`);
  console.log('Run: npm install');
  process.exit(1);
} else {
  console.log(`\n[SUCCESS] All ${installed.length} dependencies are installed!`);
  process.exit(0);
}

