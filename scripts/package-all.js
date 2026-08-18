import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('===========================================================');
console.log('📦 Starting Comprehensive Multi-Package Platform Packager');
console.log('===========================================================');

function runCommand(command, cwd) {
  console.log(`\n🏃 Running: "${command}" in ${cwd}...`);
  execSync(command, { cwd, stdio: 'inherit' });
}

try {
  // Ensure output packages directory exists and is clean
  const packagesDir = path.join(rootDir, 'packages');
  if (fs.existsSync(packagesDir)) {
    fs.rmSync(packagesDir, { recursive: true, force: true });
  }
  fs.mkdirSync(packagesDir, { recursive: true });

  // 1. Build the Angular Web Application
  console.log('\n--- 1. Building Angular Web Application ---');
  runCommand('npm run build', rootDir);

  // 2. Build pocketgull_flutter Hybrid Shell (if Flutter SDK present)
  console.log('\n--- 2. Building Core Flutter Hybrid Shell (pocketgull_flutter) ---');
  const coreFlutterDir = path.join(rootDir, 'pocketgull_flutter');
  try {
    runCommand('flutter build web --release --no-tree-shake-icons', coreFlutterDir);
  } catch (flutterErr) {
    console.warn('⚠️ Flutter web build skipped or failed (Flutter SDK may not be in PATH); bundling source shell instead.');
  }

  // 3. Build Standalone API Package
  console.log('\n--- 3. Building Standalone API ---');
  const apiDir = path.join(rootDir, 'pocketgull_api');
  runCommand('npm run build', apiDir);

  // 4. Consolidate Web Assets into dist/ for Full Release
  console.log('\n--- 4. Consolidating Web Assets into dist/ for Full Release ---');
  const distDir = path.join(rootDir, 'dist');
  const destCore = path.join(distDir, 'pocketgull_flutter');

  fs.mkdirSync(destCore, { recursive: true });
  if (fs.existsSync(path.join(coreFlutterDir, 'build/web'))) {
    fs.cpSync(path.join(coreFlutterDir, 'build/web'), destCore, { recursive: true });
  }

  // 5. Generate Release Tarballs
  console.log('\n--- 5. Generating Modular Release Packages ---');

  // A. Web Platform Package (Angular client/server build)
  const stagingAngular = path.join(packagesDir, 'staging-angular');
  fs.mkdirSync(stagingAngular, { recursive: true });
  fs.cpSync(distDir, stagingAngular, { recursive: true });
  if (fs.existsSync(path.join(stagingAngular, 'pocketgull_flutter'))) {
    fs.rmSync(path.join(stagingAngular, 'pocketgull_flutter'), { recursive: true, force: true });
  }

  console.log('📦 Archiving: pocketgull-web-platform.tar.gz');
  runCommand(`tar -czf ${path.join(packagesDir, 'pocketgull-web-platform.tar.gz')} -C ${stagingAngular} .`, rootDir);
  fs.rmSync(stagingAngular, { recursive: true, force: true });

  // B. Core Flutter Hybrid Shell Package
  console.log('📦 Archiving: pocketgull-flutter-shell.tar.gz');
  const flutterSourceStaging = path.join(packagesDir, 'staging-flutter');
  fs.mkdirSync(flutterSourceStaging, { recursive: true });
  fs.cpSync(coreFlutterDir, flutterSourceStaging, { recursive: true });
  runCommand(`tar -czf ${path.join(packagesDir, 'pocketgull-flutter-shell.tar.gz')} -C ${flutterSourceStaging} .`, rootDir);
  fs.rmSync(flutterSourceStaging, { recursive: true, force: true });

  // C. Standalone API Package
  console.log('📦 Archiving: pocketgull-api.tar.gz');
  const stagingApi = path.join(packagesDir, 'staging-api');
  fs.mkdirSync(stagingApi, { recursive: true });
  fs.cpSync(path.join(apiDir, 'dist'), path.join(stagingApi, 'dist'), { recursive: true });
  fs.cpSync(path.join(apiDir, 'package.json'), path.join(stagingApi, 'package.json'));
  fs.cpSync(path.join(apiDir, 'package-lock.json'), path.join(stagingApi, 'package-lock.json'));
  fs.cpSync(path.join(apiDir, 'Dockerfile'), path.join(stagingApi, 'Dockerfile'));
  fs.cpSync(path.join(apiDir, '.dockerignore'), path.join(stagingApi, '.dockerignore'));
  fs.cpSync(path.join(apiDir, 'deploy.sh'), path.join(stagingApi, 'deploy.sh'));
  fs.cpSync(path.join(apiDir, 'openapi.yaml'), path.join(stagingApi, 'openapi.yaml'));
  if (fs.existsSync(path.join(apiDir, '.env.example'))) {
    fs.cpSync(path.join(apiDir, '.env.example'), path.join(stagingApi, '.env.example'));
  }
  runCommand(`tar -czf ${path.join(packagesDir, 'pocketgull-api.tar.gz')} -C ${stagingApi} .`, rootDir);
  fs.rmSync(stagingApi, { recursive: true, force: true });

  // D. Unified Consolidated Package
  console.log('📦 Archiving: pocketgull-full-release.tar.gz');
  runCommand(`tar -czf ${path.join(packagesDir, 'pocketgull-full-release.tar.gz')} -C dist .`, rootDir);
  fs.cpSync(path.join(packagesDir, 'pocketgull-full-release.tar.gz'), path.join(rootDir, 'pocketgull-release.tar.gz'));

  console.log('\n===========================================================');
  console.log('✅ Packaging complete! All component packages successfully created.');
  console.log(`Individual tarballs and full release bundle are available in: ${packagesDir}`);
  console.log('===========================================================');
} catch (error) {
  console.error('\n❌ Packaging Failed with error:', error.message);
  process.exit(1);
}
