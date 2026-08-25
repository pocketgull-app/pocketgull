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

  // 1. Build the Angular App
  console.log('\n--- Building Angular Application ---');
  runCommand('npm run build', rootDir);

  // 2. Build pocketgull_flutter Web App
  console.log('\n--- Building Core Flutter Application (pocketgull_flutter) ---');
  const coreFlutterDir = path.join(rootDir, 'pocketgull_flutter');
  runCommand('flutter build web --release --no-tree-shake-icons', coreFlutterDir);

  // 3. Build Provider Companion App
  console.log('\n--- Building Provider Companion App ---');
  const providerDir = path.join(rootDir, 'companion-apps/provider_app');
  runCommand('flutter build web --release --no-tree-shake-icons', providerDir);

  // 4. Build Patient Companion App
  console.log('\n--- Building Patient Companion App ---');
  const patientDir = path.join(rootDir, 'companion-apps/patient_app');
  runCommand('flutter build web --release --no-tree-shake-icons', patientDir);

  // 5. Build Standalone API Package
  console.log('\n--- Building Standalone API ---');
  const apiDir = path.join(rootDir, 'pocketgull_api');
  runCommand('npm run build', apiDir);

  // 6. Consolidate Web Assets into dist/ for Full Consolidated Bundle
  console.log('\n--- Consolidating Web Assets into dist/ for Full Release ---');
  const distDir = path.join(rootDir, 'dist');
  const destCore = path.join(distDir, 'pocketgull_flutter');
  const destProvider = path.join(distDir, 'companion-apps/provider_app');
  const destPatient = path.join(distDir, 'companion-apps/patient_app');

  // Create paths in dist/
  fs.mkdirSync(destCore, { recursive: true });
  fs.mkdirSync(destProvider, { recursive: true });
  fs.mkdirSync(destPatient, { recursive: true });

  // Copy assets recursively using fs.cpSync
  fs.cpSync(path.join(coreFlutterDir, 'build/web'), destCore, { recursive: true });
  fs.cpSync(path.join(providerDir, 'build/web'), destProvider, { recursive: true });
  fs.cpSync(path.join(patientDir, 'build/web'), destPatient, { recursive: true });

  // 7. Generate Release Tarballs
  console.log('\n--- Generating Modular Release Packages ---');

  // A. Web Platform Package (Angular client/server build, no companion apps)
  // Let's create a temporary staging directory to zip ONLY the Angular dist without the copied Flutter subfolders
  const stagingAngular = path.join(packagesDir, 'staging-angular');
  fs.mkdirSync(stagingAngular, { recursive: true });
  fs.cpSync(distDir, stagingAngular, { recursive: true });
  // Remove Flutter subdirectories from staging Angular
  fs.rmSync(path.join(stagingAngular, 'pocketgull_flutter'), { recursive: true, force: true });
  fs.rmSync(path.join(stagingAngular, 'companion-apps'), { recursive: true, force: true });

  console.log('📦 Archiving: pocketgull-web-platform.tar.gz');
  runCommand(`tar -czf ${path.join(packagesDir, 'pocketgull-web-platform.tar.gz')} -C ${stagingAngular} .`, rootDir);
  fs.rmSync(stagingAngular, { recursive: true, force: true });

  // B. Core Flutter Web Package
  console.log('📦 Archiving: pocketgull-flutter-core.tar.gz');
  runCommand(`tar -czf ${path.join(packagesDir, 'pocketgull-flutter-core.tar.gz')} -C ${path.join(coreFlutterDir, 'build/web')} .`, rootDir);

  // C. Provider Companion Web Package
  console.log('📦 Archiving: pocketgull-companion-provider.tar.gz');
  runCommand(`tar -czf ${path.join(packagesDir, 'pocketgull-companion-provider.tar.gz')} -C ${path.join(providerDir, 'build/web')} .`, rootDir);

  // D. Patient Companion Web Package
  console.log('📦 Archiving: pocketgull-companion-patient.tar.gz');
  runCommand(`tar -czf ${path.join(packagesDir, 'pocketgull-companion-patient.tar.gz')} -C ${path.join(patientDir, 'build/web')} .`, rootDir);

  // E. Standalone API Package
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

  // F. Unified Consolidated Package
  console.log('📦 Archiving: pocketgull-full-release.tar.gz');
  runCommand(`tar -czf ${path.join(packagesDir, 'pocketgull-full-release.tar.gz')} -C dist .`, rootDir);

  // Copy unified package to root for convenience as well
  fs.cpSync(path.join(packagesDir, 'pocketgull-full-release.tar.gz'), path.join(rootDir, 'pocketgull-release.tar.gz'));

  console.log('\n===========================================================');
  console.log('✅ Packaging complete! All component packages successfully created.');
  console.log(`Individual tarballs and full release bundle are available in: ${packagesDir}`);
  console.log('===========================================================');
} catch (error) {
  console.error('\n❌ Packaging Failed with error:', error.message);
  process.exit(1);
}
