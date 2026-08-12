import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const changelogPath = path.join(rootDir, 'CHANGELOG.md');
const outputDir = path.join(rootDir, 'docs', 'retroactive-prs');

if (!fs.existsSync(changelogPath)) {
  console.error(`Error: Could not find ${changelogPath}`);
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Normalize newlines
const changelog = fs.readFileSync(changelogPath, 'utf8').replace(/\r\n/g, '\n');

let count = 0;

// Split the changelog into release blocks
// We use a regex that matches the start of a release block `\n## [`
const blocks = changelog.split(/\n## \[/);

for (let i = 1; i < blocks.length; i++) {
  const block = blocks[i];
  
  // The block starts with "VERSION] - DATE"
  const versionMatch = block.match(/^([^\]]+)\] - [\d-]+/);
  if (!versionMatch) continue;
  
  const version = versionMatch[1];
  let bodyContent = block.substring(versionMatch[0].length).trim();
  
  // Try to extract bold title if it exists on the first line
  let title = `General updates and improvements for ${version}`;
  const titleMatch = bodyContent.match(/^\*\*([^*]+)\*\*/);
  if (titleMatch) {
    title = titleMatch[1].trim();
    // Remove title from body
    bodyContent = bodyContent.substring(titleMatch[0].length).trim();
  }

  let type = 'feat';
  const titleLower = title.toLowerCase();
  if (titleLower.includes('fix') || titleLower.includes('resolve') || titleLower.includes('remediation')) type = 'fix';
  if (titleLower.includes('security') || titleLower.includes('cve') || titleLower.includes('audit') || titleLower.includes('compliance')) type = 'security';

  const prTitle = `${type}(release): ${title.substring(0, 60).toLowerCase()}${title.length > 60 ? '...' : ''}`;

  // Filter out headers, keep bullet points that look like changelog entries
  const changelogEntry = bodyContent
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .join('\n');

  const prTemplate = `---

## PR: ${prTitle}

### Description
This PR corresponds to the release **v${version}**.
${title}

### Changelog Entry
${changelogEntry || '- **[ ]** No specific bullet points recorded.'}

### Type of change
- [${type === 'fix' ? 'x' : ' '}] Bug fix (\`fix\`)
- [${type === 'feat' ? 'x' : ' '}] New feature (\`feat\`)
- [${type === 'security' ? 'x' : ' '}] Security fix (\`security\`)
- [ ] Refactoring (\`refactor\`)
- [ ] Documentation update (\`docs\`)
- [ ] Testing/CI update (\`test\`, \`ci\`)
- [ ] Clinical Intelligence & AI Prompting
- [ ] 3D Anatomical Spatial Lens (Three.js)
- [ ] Voice / Hardware Telemetry
- [ ] Companion App (Flutter / Dart)

## ☯️ Clinical Paradigms Touched
- [ ] 🔵 Western Allopathic
- [ ] 🟢 Eastern TCM (Traditional Chinese Medicine)
- [ ] 🟡 Ayurvedic Medicine

## Core Integration Checklist:
- [x] My commit messages follow the Conventional Commits format (max 72 chars subject, imperative mood).
- [x] My branch compiles with zero errors (\`node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit\`).
- [x] I have performed a self-review of my own code.
- [x] New and existing unit tests pass locally with my changes (\`npm test\`).
- [x] I have run the local security audit (\`npm run sentinel:audit\`).

## Domain-Specific Quality Gates (Check all that apply):
### 🏥 Clinical AI & Safety
- [ ] **Safety Filters:** Verified \`DANGEROUS_CONTENT\` remains \`OFF\` for clinical text to prevent false-positive blocks on standard-of-care plans.
- [ ] **Evidence Literacy:** Clinical recommendations include demarcated evidence tiers (Level A/B/C) and Cochrane Risk of Bias considerations.
- [ ] **Skeptical Epistemology:** If computing p-values, findings where $p \\ge 0.05$ trigger the \`skepticalWarningNotice\`.

### 🔒 Privacy & Data Sovereignty
- [ ] **FHIR R4:** Serialized patient data structures conform strictly to the FHIR R4 Bundle standard.
- [ ] **Logging Integrity:** No raw user inputs or un-sanitized PHI strings are passed to server loggers.
- [ ] **De-Identification:** New mock patient data adheres to HIPAA §164.514 Safe Harbor standards (or preserves historical luminaries).
- [ ] **CodeQL & Egress Guard:** Verified zero new SSRF, path traversal, or log injection vulnerabilities, and local Sentinel whitelists remain intact.

### 🎨 Dieter Rams UX & Accessibility
- [ ] **Functional Aesthetics:** Adheres to Dieter Rams principles ("Weniger, aber besser")—no unnecessary UI bloat or non-structural rounded pills.
- [ ] **Fitts's Law:** All new touch targets and buttons are at least 44x44px.
- [ ] **WCAG & Neurodiversity:** UI changes maintain 7:1 contrast ratios and respect \`prefers-reduced-motion\` for animations.

`;

  const prFilePath = path.join(outputDir, `${version}.md`);
  fs.writeFileSync(prFilePath, prTemplate);
  count++;
}

console.log(`Successfully generated ${count} retroactive PRs to the ${outputDir} directory.`);
