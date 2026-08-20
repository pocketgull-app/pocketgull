#!/usr/bin/env node
/**
 * PocketGull CycloneDX 1.6 JSON SBOM Generator
 * Conforms to EU Cyber Resilience Act (Regulation EU 2024/2847 Annex I §2)
 * & US Executive Order 14028 Minimum Elements for SBOM.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getPurl(name, version) {
  const encodedName = name.startsWith('@')
    ? `@${encodeURIComponent(name.slice(1))}`
    : encodeURIComponent(name);
  return `pkg:npm/${encodedName}@${version}`;
}

function generateSbom() {
  const rootPkgPath = path.join(rootDir, 'package.json');
  const lockfilePath = path.join(rootDir, 'package-lock.json');

  if (!fs.existsSync(rootPkgPath)) {
    throw new Error(`Cannot find root package.json at ${rootPkgPath}`);
  }

  const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
  const lockfile = fs.existsSync(lockfilePath)
    ? JSON.parse(fs.readFileSync(lockfilePath, 'utf8'))
    : null;

  const serialNumber = `urn:uuid:${crypto.randomUUID()}`;
  const timestamp = new Date().toISOString();

  const components = [];
  const componentMap = new Map();

  if (lockfile && lockfile.packages) {
    for (const [pkgPath, pkgData] of Object.entries(lockfile.packages)) {
      if (!pkgPath || pkgPath === '') continue; // Skip root entry

      const name = pkgData.name || pkgPath.replace(/^node_modules\//, '').replace(/^.*\/node_modules\//, '');
      const version = pkgData.version || '0.0.0';
      const key = `${name}@${version}`;

      if (componentMap.has(key)) continue;

      const comp = {
        type: 'library',
        name: name,
        version: version,
        purl: getPurl(name, version),
        scope: pkgData.dev ? 'excluded' : 'required'
      };

      if (pkgData.license) {
        comp.licenses = [{ license: { id: pkgData.license } }];
      }

      if (pkgData.integrity && pkgData.integrity.startsWith('sha512-')) {
        const hashBase64 = pkgData.integrity.replace('sha512-', '');
        const hashHex = Buffer.from(hashBase64, 'base64').toString('hex');
        comp.hashes = [
          {
            alg: 'SHA-512',
            content: hashHex
          }
        ];
      }

      componentMap.set(key, comp);
      components.push(comp);
    }
  }

  // Sort components deterministically by name
  components.sort((a, b) => a.name.localeCompare(b.name));

  const sbom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.6',
    serialNumber: serialNumber,
    version: 1,
    metadata: {
      timestamp: timestamp,
      tools: {
        components: [
          {
            type: 'application',
            author: 'PocketGull Team',
            name: 'pocketgull-cyclonedx-generator',
            version: '1.0.0'
          }
        ]
      },
      authors: [
        {
          name: 'Phil Gear',
          email: 'leads@pocketgull.app'
        }
      ],
      component: {
        type: 'application',
        'bom-ref': `pkg:npm/pocket-gull@${rootPkg.version || '1.23.0'}`,
        name: rootPkg.name || 'pocket-gull',
        version: rootPkg.version || '1.23.0',
        description: rootPkg.description || 'PocketGull Clinical AI Intelligence & Digital Twin Platform',
        licenses: [
          {
            license: {
              id: rootPkg.license || 'Apache-2.0'
            }
          }
        ],
        purl: `pkg:npm/pocket-gull@${rootPkg.version || '1.23.0'}`
      },
      properties: [
        {
          name: 'eu:cra:compliance',
          value: 'Regulation (EU) 2024/2847 Annex I §2'
        },
        {
          name: 'us:eo14028:compliance',
          value: 'NTIA Minimum Elements for SBOM'
        }
      ]
    },
    components: components
  };

  // Write to root sbom.cdx.json
  const outPathRoot = path.join(rootDir, 'sbom.cdx.json');
  fs.writeFileSync(outPathRoot, JSON.stringify(sbom, null, 2), 'utf8');

  // Write to dist/sbom.cdx.json if dist exists
  const distDir = path.join(rootDir, 'dist');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sbom.cdx.json'), JSON.stringify(sbom, null, 2), 'utf8');
  }

  console.log(`✅ [CRA SBOM] Successfully generated CycloneDX 1.6 SBOM with ${components.length} components.`);
  console.log(`📄 Output: ${outPathRoot}`);
}

try {
  generateSbom();
} catch (err) {
  console.error('❌ Failed to generate CycloneDX SBOM:', err);
  process.exit(1);
}
