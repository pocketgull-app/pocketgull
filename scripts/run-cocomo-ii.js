import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceRoot = path.join(__dirname, '..');

const langStats = {
  typescript: { ext: ['.ts'], lines: 0, files: 0, ksloc: 0 },
  dart: { ext: ['.dart'], lines: 0, files: 0, ksloc: 0 },
  python: { ext: ['.py'], lines: 0, files: 0, ksloc: 0 },
  css: { ext: ['.css'], lines: 0, files: 0, ksloc: 0 },
  json_yaml: { ext: ['.json', '.yml', '.yaml'], lines: 0, files: 0, ksloc: 0 },
  markdown: { ext: ['.md'], lines: 0, files: 0, ksloc: 0 }
};

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip external/build dirs
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.venv', 'dist', '.angular', '.astro', 'build', '__pycache__', '.idea', '.vscode'].includes(entry.name)) {
        continue;
      }
      scanDir(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      
      for (const [lang, stat] of Object.entries(langStats)) {
        if (stat.ext.includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n').length;
            stat.lines += lines;
            stat.files += 1;
          } catch {}
          break;
        }
      }
    }
  }
}

scanDir(workspaceRoot);

let totalLines = 0;
let totalFiles = 0;

for (const stat of Object.values(langStats)) {
  stat.ksloc = stat.lines / 1000;
  totalLines += stat.lines;
  totalFiles += stat.files;
}

const totalKSLOC = totalLines / 1000;

// ── COCOMO II CALCULATION ──
// Formula: PM = A * (KSLOC ^ E) * EAF
// Constant A = 2.94
// Scale Factor Sum (SF): 8.90 -> E = 0.91 + (0.01 * 8.90) = 0.999
const A = 2.94;
const E = 0.999;
const EAF = 1.15; // Effort Adjustment Factor (Nominal/High clinical reliability)

const PM = A * Math.pow(totalKSLOC, E) * EAF;
const C = 3.67;
const F = 0.28 + 0.2 * (E - 0.91);
const TDEV = C * Math.pow(PM, F);
const Staffing = PM / TDEV;
const MonthlyRateUSD = 15000;
const TotalCostUSD = PM * MonthlyRateUSD;

const report = {
  timestamp: new Date().toISOString(),
  metrics: {
    totalFiles,
    totalLines,
    totalKSLOC: Number(totalKSLOC.toFixed(2)),
    languages: langStats
  },
  cocomo2: {
    effortPersonMonths: Number(PM.toFixed(2)),
    scheduleMonths: Number(TDEV.toFixed(2)),
    averageStaffing: Number(Staffing.toFixed(1)),
    totalCostUSD: Math.round(TotalCostUSD),
    parameters: {
      A,
      B: 0.91,
      E: Number(E.toFixed(4)),
      EAF,
      monthlyBurdenedRateUSD: MonthlyRateUSD
    }
  }
};

let md = '# 📊 COCOMO II Software Cost & Effort Estimation Report\n\n';
md += `**Generated**: ${new Date().toLocaleString()}\n`;
md += `**Target System**: Pocket Gull Medical Intelligence Monorepo\n\n`;

md += '## 1. Codebase Size & Language Metrics\n\n';
md += '| Language / Layer | Files | Source Lines (SLOC) | KSLOC |\n';
md += '| :--- | :--- | :--- | :--- |\n';
md += `| **TypeScript (Angular Core Web)** | ${langStats.typescript.files} | ${langStats.typescript.lines.toLocaleString()} | ${langStats.typescript.ksloc.toFixed(2)} |\n`;
md += `| **Dart (Flutter Mobile Suite)** | ${langStats.dart.files} | ${langStats.dart.lines.toLocaleString()} | ${langStats.dart.ksloc.toFixed(2)} |\n`;
md += `| **Python (FastAPI Sidecar & ML)** | ${langStats.python.files} | ${langStats.python.lines.toLocaleString()} | ${langStats.python.ksloc.toFixed(2)} |\n`;
md += `| **CSS / Styling System** | ${langStats.css.files} | ${langStats.css.lines.toLocaleString()} | ${langStats.css.ksloc.toFixed(2)} |\n`;
md += `| **JSON & YAML Manifests** | ${langStats.json_yaml.files} | ${langStats.json_yaml.lines.toLocaleString()} | ${langStats.json_yaml.ksloc.toFixed(2)} |\n`;
md += `| **Markdown Documentation** | ${langStats.markdown.files} | ${langStats.markdown.lines.toLocaleString()} | ${langStats.markdown.ksloc.toFixed(2)} |\n`;
md += `| **TOTAL MONOREPO** | **${totalFiles}** | **${totalLines.toLocaleString()}** | **${totalKSLOC.toFixed(2)} KSLOC** |\n\n`;

md += '## 2. COCOMO II Post-Architecture Model Output\n\n';
md += '| Metric | COCOMO II Estimation |\n';
md += '| :--- | :--- |\n';
md += `| **Effort Estimate** | **${PM.toFixed(2)} Person-Months** |\n`;
md += `| **Estimated Development Time (TDEV)** | **${TDEV.toFixed(2)} Months** |\n`;
md += `| **Average Full-Time Staffing** | **${Staffing.toFixed(1)} Engineers** |\n`;
md += `| **Estimated Project Cost** | **$${Math.round(TotalCostUSD).toLocaleString()} USD** ($15k/month rate) |\n\n`;

md += '## 3. Scale Factors & Effort Multipliers (EAF)\n\n';
md += '- **PREC (Precedentedness)**: High (1.24) — Proven clinical & 3D WebGL paradigms.\n';
md += '- **FLEX (Development Flexibility)**: High (2.03) — Flexible open API & modular standalone component design.\n';
md += '- **RESL (Architecture / Risk Resolution)**: Extra High (1.41) — Automated CodeQL, FHIR validation, & unit tests.\n';
md += '- **TEAM (Team Cohesion)**: Very High (1.10) — Single/pair pair programming.\n';
md += '- **PMAT (Process Maturity)**: High (3.12) — CI/CD actions & shift-left pre-commit checks.\n';
md += `- **Effort Multiplier (EAF)**: ${EAF} (Nominal/High clinical reliability requirement).\n`;

const outPath = path.join(__dirname, '../cocomo2_report.md');
fs.writeFileSync(outPath, md);
fs.writeFileSync(path.join(__dirname, '../cocomo2_report.json'), JSON.stringify(report, null, 2));

console.log(`COCOMO II report successfully written to ${outPath}`);
