import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('📜 Generating SPDX 2.3 Software Bill of Materials (SBOM)...');

const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const sbom = {
  spdxVersion: 'SPDX-2.3',
  dataLicense: 'CC0-1.0',
  SPDXID: 'SPDXRef-DOCUMENT',
  name: `${pkg.name}-v${pkg.version}-SBOM`,
  documentNamespace: `https://github.com/philgear/pocketgull/spdx/${pkg.name}-${pkg.version}`,
  creationInfo: {
    creators: ['Tool: Pocket-Gull Automated Sentinel Guard', 'Organization: Pocket-Gull Engineering'],
    created: new Date().toISOString()
  },
  packages: [
    {
      name: pkg.name,
      SPDXID: 'SPDXRef-Package-Root',
      versionInfo: pkg.version,
      downloadLocation: 'git+https://github.com/philgear/pocketgull.git',
      filesAnalyzed: false,
      licenseConcluded: pkg.license || 'MIT',
      description: pkg.description || 'Pocket-Gull Real-Time Clinical Intelligence Suite'
    }
  ]
};

if (pkg.dependencies) {
  Object.entries(pkg.dependencies).forEach(([depName, depVer]) => {
    sbom.packages.push({
      name: depName,
      SPDXID: `SPDXRef-Package-${depName.replace(/[^a-zA-Z0-9]/g, '-')}`,
      versionInfo: depVer,
      downloadLocation: `NOASSERTION`,
      filesAnalyzed: false,
      licenseConcluded: 'NOASSERTION'
    });
  });
}

const outputPath = path.join(rootDir, 'sbom.spdx.json');
fs.writeFileSync(outputPath, JSON.stringify(sbom, null, 2), 'utf8');

console.log(`✅ [PASS] SPDX 2.3 SBOM generated successfully at: ${outputPath}`);
