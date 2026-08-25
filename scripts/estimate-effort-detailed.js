/**
 * Detailed COCOMO II Effort Estimation Script (File-by-File Analysis)
 * Based on Constructive Cost Model II standards.
 * Outputs a comprehensive report to docs/cocomo_breakdown.md
 */

import sloc from 'sloc';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.normalize(path.resolve(__dirname, '..'));

// Define modules to scan
const modules = [
    { name: 'Web Client (Angular)', path: 'src', exts: ['.ts'] },
    { name: 'Backend API (Node)', path: 'pocketgull_api/src', exts: ['.ts'] },
    { name: 'AVS Therapy Companion (Angular)', path: 'companion-apps/avs-therapy/src', exts: ['.ts'] }
];

// Scale Factors (SF)
const scaleFactors = {
    prec: 3.72, // Precedentedness: Nominal
    flex: 3.04, // Development Flexibility: Nominal
    resl: 4.24, // Architecture/Risk Resolution: Nominal
    team: 2.19, // Team Cohesion: High (Solo/Small tight team)
    pmat: 4.68, // Process Maturity: Nominal
};

// Effort Multipliers (EM)
const effortMultipliers = {
    rely: 1.10, // Required Software Reliability: High (Medical app)
    data: 1.14, // Data Base Size: High (Patient records/Gemini context)
    cplx: 1.17, // Product Complexity: High (AI/Three.js integration)
    ruse: 1.07, // Developed for Reusability: Nominal
    docu: 1.00, // Documentation Match to Life-Cycle: Nominal
    time: 1.11, // Execution Time Constraint: High (Real-time AI voice)
    pvol: 0.87, // Platform Volatility: Low (Standard Web stack)
    acap: 0.71, // Analyst Capability: Extra High (Advanced agentic usage)
    pcap: 0.76, // Programmer Capability: Extra High
    pcon: 0.81, // Personnel Continuity: Very High
    aexp: 0.88, // Applications Experience: High
    pexp: 0.91, // Platform Experience: High
    lexp: 0.95, // Language Experience: High
    site: 0.80, // Multi-site Development: Extra High
    sced: 1.00, // Required Development Schedule: Nominal
};

function walk(relativeDir, exts) {
    let results = [];
    const joinedDir = path.join(projectRoot, relativeDir);
    const resolvedDir = path.normalize(joinedDir);
    if (!resolvedDir.startsWith(projectRoot)) return results;
    if (!fs.existsSync(resolvedDir)) return results;

    const list = fs.readdirSync(resolvedDir);
    list.forEach(file => {
        const fileRelativePath = path.join(relativeDir, file);
        const joinedPath = path.join(projectRoot, fileRelativePath);
        const fullPath = path.normalize(joinedPath);
        if (!fullPath.startsWith(projectRoot)) return;

        try {
            const stat = fs.statSync(fullPath);
            if (stat && stat.isDirectory()) {
                if (file !== 'node_modules' && !file.startsWith('.') && file !== 'dist') {
                    results = results.concat(walk(fileRelativePath, exts));
                }
            } else {
                if (exts.some(ext => file.endsWith(ext))) {
                    results.push(fullPath);
                }
            }
        } catch (e) { /* ignore unreachable */ }
    });
    return results;
}

// Gather files and calculate individual SLOCs
const allFiles = [];
let totalSloc = 0;

modules.forEach(mod => {
    const files = walk(mod.path, mod.exts);
    files.forEach(file => {
        try {
            const relativePath = path.relative(projectRoot, file).replace(/\\/g, '/');
            const code = fs.readFileSync(file, 'utf8');
            const ext = path.extname(file).substring(1);
            const stats = sloc(code, ext);
            
            if (stats && stats.source > 0) {
                allFiles.push({
                    path: relativePath,
                    sloc: stats.source,
                    moduleName: mod.name
                });
                totalSloc += stats.source;
            }
        } catch (e) { /* ignore */ }
    });
});

const KSLOC = totalSloc / 1000;
const B = 0.91 + 0.01 * Object.values(scaleFactors).reduce((a, b) => a + b, 0);
const EAF = Object.values(effortMultipliers).reduce((a, b) => a * b, 1);
const totalPM = 2.94 * EAF * Math.pow(KSLOC, B);
const TDEV = 3.67 * Math.pow(totalPM, (0.28 + 0.1 * (B - 0.91)));
const totalHours = totalPM * 152; // Assuming 152 hours per Person-Month

// Determine complexity of a file based on size & keywords
function getComplexityLabel(slocValue, content) {
    if (slocValue > 400 || content.includes('inject(') || content.includes('Three.js') || content.includes('THREE.') || content.includes('WebSocket')) {
        return 'High';
    }
    if (slocValue < 100 && !content.includes('Service') && !content.includes('@Component')) {
        return 'Low';
    }
    return 'Nominal';
}

const fileBreakdowns = allFiles.map(file => {
    const fullPath = path.join(projectRoot, file.path);
    const content = fs.readFileSync(fullPath, 'utf8');
    const complexity = getComplexityLabel(file.sloc, content);
    
    // Proportional allocation of total effort
    const proportion = file.sloc / totalSloc;
    const filePM = totalPM * proportion;
    const fileHours = totalHours * proportion;
    
    return {
        ...file,
        proportion: proportion * 100,
        pm: filePM,
        hours: fileHours,
        complexity
    };
});

// Sort by size descending
fileBreakdowns.sort((a, b) => b.sloc - a.sloc);

// Generate Markdown report
let markdown = `# COCOMO II Granular File Breakdown
**Project Architecture & Development Effort Cost Analysis**

This report details the Constructive Cost Model II (COCOMO II) estimation at the individual source file level. Effort allocation (Person-Hours) is calculated proportionally based on the total codebase size and product complexity.

## 📊 Summary Metrics

| Metric | Estimated Value | Details / Assumptions |
|---|---|---|
| **Total Lines of Code (SLOC)** | **${totalSloc.toLocaleString()}** | Source lines of code excluding comments/blanks across all scanned modules. |
| **Total Size (KSLOC)** | **${KSLOC.toFixed(3)}** | Thousands of Source Lines of Code. |
| **Exponent B** | **${B.toFixed(4)}** | Based on scale factors: Precedentedness, Flexibility, Risk Resolution, Team Cohesion, and Process Maturity. |
| **Effort Adjustment Factor (EAF)** | **${EAF.toFixed(4)}** | Based on multipliers: Reliability, Complexity, Time constraints, Personnel experience. |
| **Estimated Effort (Person-Months)** | **${totalPM.toFixed(2)} PM** | The total developer months required under standard velocity. |
| **Estimated Effort (Person-Hours)** | **${Math.round(totalHours).toLocaleString()} hrs** | Based on 152 working hours per person-month. |
| **Estimated Schedule (TDEV)** | **${TDEV.toFixed(2)} months** | Recommended calendar schedule for a standard team size. |

---

## 📂 File-by-File Effort Distribution

The table below catalogs every analyzed TypeScript (\`.ts\`) source file, sorted descending by code size.

| File Path | Module | SLOC | Code Share | Effort (Hrs) | Complexity |
|---|---|---|---|---|---|
`;

fileBreakdowns.forEach(f => {
    markdown += `| [${path.basename(f.path)}](file:///${projectRoot.replace(/\\/g, '/')}/${f.path}) | ${f.moduleName} | ${f.sloc.toLocaleString()} | ${f.proportion.toFixed(2)}% | ${f.hours.toFixed(1)} hrs | ${f.complexity} |\n`;
});

markdown += `
---

*Report generated automatically by \`scripts/estimate-effort-detailed.js\`. All metrics adhere to the COCOMO II Post-Architecture Model.*
`;

// Save report
const outputPath = path.join(projectRoot, 'docs', 'cocomo_breakdown.md');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, markdown, 'utf8');

console.log('✅ Detailed COCOMO II report successfully generated at docs/cocomo_breakdown.md');
