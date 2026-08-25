import fs from 'fs';
import path from 'path';

// COCOMO II Post-Architecture Model Constants
const A = 2.94; // Baseline Multiplier
const C = 3.67; // Schedule Multiplier
const MONTHLY_BURDENED_RATE_USD = 15000; // Average senior software engineer monthly cost

// Scale Factors (SF_i)
const PREC = 1.24;  // Precedentedness (High)
const FLEX = 2.03;  // Development Flexibility (High)
const RESL = 1.41;  // Architecture / Risk Resolution (Extra High)
const TEAM = 1.10;  // Team Cohesion (Very High)
const PMAT = 3.12;  // Process Maturity (High)

const sumSF = PREC + FLEX + RESL + TEAM + PMAT; // 8.90
const B = 0.91 + 0.01 * sumSF; // 0.999
const EAF = 1.15; // Effort Adjustment Factor (Nominal/High clinical reliability)

const extMap = {
  '.ts': { name: 'TypeScript (Angular Web Core & Services)', group: 'typescript' },
  '.dart': { name: 'Dart (Flutter Mobile Companion Suite)', group: 'dart' },
  '.py': { name: 'Python (FastAPI Sidecar & ML Pipelines)', group: 'python' },
  '.css': { name: 'CSS & Design System Tokens', group: 'css' },
  '.json': { name: 'JSON Data & Schemas', group: 'json_yaml' },
  '.yaml': { name: 'YAML Build & Cloud Manifests', group: 'json_yaml' },
  '.yml': { name: 'YAML Build & Cloud Manifests', group: 'json_yaml' },
  '.md': { name: 'Markdown Documentation & Workflows', group: 'markdown' }
};

const counts = {
  typescript: { files: 0, lines: 0 },
  dart: { files: 0, lines: 0 },
  python: { files: 0, lines: 0 },
  css: { files: 0, lines: 0 },
  json_yaml: { files: 0, lines: 0 },
  markdown: { files: 0, lines: 0 }
};

let totalFiles = 0;
let totalLines = 0;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', '.git', 'dist', '.dart_tool', 'build', '.angular', 'coverage', 'playwright-report', 'test-results', '.venv'].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (extMap[ext]) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n').filter(l => l.trim().length > 0).length;
          const group = extMap[ext].group;
          counts[group].lines += lines;
          counts[group].files += 1;
          totalLines += lines;
          totalFiles += 1;
        } catch (e) {}
      }
    }
  }
}

['src', 'pocketgull_flutter', 'pocketgull_api', 'scripts', 'tests', 'contests', 'e2e', 'docs', 'companion-apps'].forEach(scanDir);
// Also scan root config files
fs.readdirSync('.').forEach(f => {
  const ext = path.extname(f).toLowerCase();
  if (extMap[ext]) {
    try {
      const content = fs.readFileSync(f, 'utf8');
      const lines = content.split('\n').filter(l => l.trim().length > 0).length;
      const group = extMap[ext].group;
      counts[group].lines += lines;
      counts[group].files += 1;
      totalLines += lines;
      totalFiles += 1;
    } catch (e) {}
  }
});

const totalKSLOC = totalLines / 1000.0;
const executableKSLOC = (counts.typescript.lines + counts.dart.lines + counts.python.lines + counts.css.lines) / 1000.0;

// COCOMO II Effort Calculation
// Effort (Person-Months) = A * (KSLOC)^B * EAF
const effortPM = A * Math.pow(executableKSLOC, B) * EAF;

// Schedule Calculation (TDEV) = C * (PM)^D
// D = 0.28 + 0.2 * (B - 0.91)
const D = 0.28 + 0.2 * (B - 0.91);
const tdevMonths = C * Math.pow(effortPM, D);

const averageStaff = effortPM / tdevMonths;
const totalCostUSD = effortPM * MONTHLY_BURDENED_RATE_USD;

const reportData = {
  timestamp: new Date().toISOString(),
  metrics: {
    totalFiles,
    totalLines,
    totalKSLOC,
    executableKSLOC,
    languages: counts
  },
  cocomo2: {
    effortPersonMonths: Math.round(effortPM * 100) / 100,
    scheduleMonths: Math.round(tdevMonths * 100) / 100,
    averageStaffing: Math.round(averageStaff * 10) / 10,
    totalCostUSD: Math.round(totalCostUSD),
    parameters: {
      A,
      B,
      D: Math.round(D * 1000) / 1000,
      EAF,
      monthlyBurdenedRateUSD: MONTHLY_BURDENED_RATE_USD
    }
  }
};

fs.writeFileSync('cocomo2_report.json', JSON.stringify(reportData, null, 2));

const mdContent = `# 📊 COCOMO II Software Cost & Effort Estimation Report

**Generated**: ${new Date().toLocaleString()}
**Target System**: Pocket Gull Medical Intelligence Monorepo

## 1. Codebase Size & Language Metrics

| Language / Layer | Files | Source Lines (SLOC) | KSLOC |
| :--- | :--- | :--- | :--- |
| **TypeScript (Angular Core Web)** | ${counts.typescript.files.toLocaleString()} | ${counts.typescript.lines.toLocaleString()} | ${(counts.typescript.lines / 1000).toFixed(2)} |
| **Dart (Flutter Mobile Suite)** | ${counts.dart.files.toLocaleString()} | ${counts.dart.lines.toLocaleString()} | ${(counts.dart.lines / 1000).toFixed(2)} |
| **Python (FastAPI Sidecar & ML)** | ${counts.python.files.toLocaleString()} | ${counts.python.lines.toLocaleString()} | ${(counts.python.lines / 1000).toFixed(2)} |
| **CSS / Styling System** | ${counts.css.files.toLocaleString()} | ${counts.css.lines.toLocaleString()} | ${(counts.css.lines / 1000).toFixed(2)} |
| **JSON & YAML Manifests** | ${counts.json_yaml.files.toLocaleString()} | ${counts.json_yaml.lines.toLocaleString()} | ${(counts.json_yaml.lines / 1000).toFixed(2)} |
| **Markdown Documentation** | ${counts.markdown.files.toLocaleString()} | ${counts.markdown.lines.toLocaleString()} | ${(counts.markdown.lines / 1000).toFixed(2)} |
| **TOTAL MONOREPO** | **${totalFiles.toLocaleString()}** | **${totalLines.toLocaleString()}** | **${totalKSLOC.toFixed(2)} KSLOC** |

## 2. COCOMO II Post-Architecture Model Output

| Metric | COCOMO II Estimation |
| :--- | :--- |
| **Executable Code Base (KSLOC)** | **${executableKSLOC.toFixed(2)} KSLOC** (TS + Dart + Python + CSS) |
| **Effort Estimate** | **${effortPM.toFixed(2)} Person-Months** |
| **Estimated Development Time (TDEV)** | **${tdevMonths.toFixed(2)} Months** |
| **Average Full-Time Staffing** | **${averageStaff.toFixed(1)} Engineers** |
| **Estimated Commercial Value / Replacement Cost** | **$${Math.round(totalCostUSD).toLocaleString()} USD** ($15k/month burdened rate) |

## 3. Scale Factors & Effort Multipliers (EAF)

- **PREC (Precedentedness)**: High (1.24) — Proven clinical & 3D WebGL paradigms.
- **FLEX (Development Flexibility)**: High (2.03) — Modular standalone component architecture.
- **RESL (Architecture / Risk Resolution)**: Extra High (1.41) — Automated CodeQL, FHIR R4 validation, & Vitest suites.
- **TEAM (Team Cohesion)**: Very High (1.10) — Single/pair pair programming.
- **PMAT (Process Maturity)**: High (3.12) — CI/CD actions & shift-left pre-commit checks.
- **Effort Multiplier (EAF)**: 1.15 (Nominal/High clinical reliability requirement).
`;

fs.writeFileSync('cocomo2_report.md', mdContent);
console.log('✅ Generated COCOMO II Report: cocomo2_report.json & cocomo2_report.md');
