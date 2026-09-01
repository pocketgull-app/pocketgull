/**
 * COCOMO II Effort Estimation Script
 * Based on the Constructive Cost Model II (Reference Manual 2000.0)
 */

import sloc from 'sloc';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.normalize(path.resolve(__dirname, '..'));

// Dynamically calculate KSLOC across modules
function getDynamicKsloc() {
    const modules = [
        { name: 'Web Client (Angular & SSR)', path: 'src', exts: ['.ts', '.js', '.html', '.css'] },
        { name: 'Flutter Mobile Companion (Dart)', path: 'pocketgull_flutter/lib', exts: ['.dart'] },
        { name: 'Python FastAPI Sidecar & ML Engines', path: 'pocketgull_api', exts: ['.py', '.ts'] },
        { name: 'AVS Therapy Companion (Angular)', path: 'companion-apps/avs-therapy/src', exts: ['.ts', '.js', '.html', '.css'] },
        { name: 'Automated Test Suites (Playwright & Vitest)', path: 'tests', exts: ['.ts', '.js'] },
        { name: 'Clinical Tooling, Data Pipelines & Dart Scripts', path: 'scripts', exts: ['.ts', '.js', '.mjs', '.dart', '.py'] }
    ];

    let totalSloc = 0;
    const breakdown = [];

    function walk(relativeDir, exts) {
        let results = [];
        const joinedDir = path.join(projectRoot, relativeDir);
        const resolvedDir = path.normalize(joinedDir);
        if (!resolvedDir.startsWith(projectRoot)) return results;
        if (!fs.existsSync(resolvedDir)) return results;

        const list = fs.readdirSync(resolvedDir);
        list.forEach(file => {
            if (['node_modules', '.git', 'dist', '.dart_tool', 'build', '.angular', 'coverage', '.venv'].includes(file)) return;
            const fileRelativePath = path.join(relativeDir, file);
            const joinedPath = path.join(projectRoot, fileRelativePath);
            const fullPath = path.normalize(joinedPath);
            if (!fullPath.startsWith(projectRoot)) return;

            try {
                const stat = fs.statSync(fullPath);
                if (stat && stat.isDirectory()) { 
                    results = results.concat(walk(fileRelativePath, exts));
                } else { 
                    if (exts.some(ext => file.endsWith(ext))) {
                       results.push(fullPath);
                    }
                }
            } catch (e) { /* ignore unreachable files */ }
        });
        return results;
    }

    modules.forEach(mod => {
        let modSloc = 0;
        const files = walk(mod.path, mod.exts);
        files.forEach(file => {
            try {
                const fullFile = path.normalize(file);
                if (!fullFile.startsWith(projectRoot)) return;

                const code = fs.readFileSync(fullFile, 'utf8');
                let ext = path.extname(fullFile).substring(1).toLowerCase();
                if (ext === 'dart') ext = 'ts';
                if (ext === 'mjs') ext = 'js';
                const stats = sloc(code, ext);
                if (stats && stats.source) {
                    modSloc += stats.source;
                } else {
                    // Fallback line counter if sloc extension parser is unmapped
                    const lines = code.split('\n').filter(l => l.trim().length > 0 && !l.trim().startsWith('//') && !l.trim().startsWith('#')).length;
                    modSloc += lines;
                }
            } catch(e) { /* ignore */ }
        });
        if (modSloc > 0) {
            breakdown.push({ name: mod.name, ksloc: modSloc / 1000 });
            totalSloc += modSloc;
        }
    });

    return {
        total: totalSloc / 1000,
        breakdown
    };
}

const { total: KSLOC, breakdown } = getDynamicKsloc();

// Post-Architecture Scale Factors (SF)
const scaleFactors = {
    prec: 1.24, // Precedentedness: High (Proven clinical & 3D WebGL paradigms)
    flex: 2.03, // Development Flexibility: High (Modular standalone architecture)
    resl: 1.41, // Architecture/Risk Resolution: Extra High (CodeQL, FHIR R4, Vitest)
    team: 1.10, // Team Cohesion: Very High (Single/pair programming)
    pmat: 3.12, // Process Maturity: High (Shift-left CI/CD & pre-commit)
};

// Post-Architecture Cost Drivers (EM - Effort Multipliers)
const effortMultipliers = {
    rely: 1.26, // Required Software Reliability: Very High (Clinical CDS / HIPAA)
    data: 1.14, // Data Base Size: High (Patient records / Gemini context)
    cplx: 1.30, // Product Complexity: Very High (AI Live full-duplex / WebGPU rPPG)
    ruse: 1.15, // Developed for Reusability: High (FHIR standard schemas)
    docu: 1.00, // Documentation Match to Life-Cycle: Nominal

    // Platform Factors
    time: 1.11, // Execution Time Constraint: High (Sub-second audio/triage)
    pvol: 0.87, // Platform Volatility: Low (Modern web & container standards)

    // Personnel Factors
    acap: 0.85, // Analyst Capability: High
    pcap: 0.88, // Programmer Capability: High
    pcon: 0.90, // Personnel Continuity: High
    aexp: 0.91, // Applications Experience: High
    pexp: 0.91, // Platform Experience: High
    lexp: 0.95, // Language Experience: High

    // Project Factors
    site: 0.90, // Multi-site Development: High
    sced: 1.00, // Required Development Schedule: Nominal
};

function calculateEffort() {
    const B = 0.91 + 0.01 * Object.values(scaleFactors).reduce((a, b) => a + b, 0);
    const EAF = Object.values(effortMultipliers).reduce((a, b) => a * b, 1);

    const PM = 2.94 * EAF * Math.pow(KSLOC, B);

    // Schedule estimation (TDEV)
    const TDEV = 3.67 * Math.pow(PM, (0.28 + 0.1 * (B - 0.91)));

    return {
        ksloc: KSLOC,
        breakdown,
        exponent_B: B.toFixed(4),
        eaf: EAF.toFixed(4),
        effort_pm: PM.toFixed(2),
        schedule_tdev: TDEV.toFixed(2),
    };
}

const results = calculateEffort();

console.log('--- COCOMO II Estimation Results ---');
console.log('Project Size Breakdown:');
results.breakdown.forEach(mod => {
    console.log(`  - ${mod.name}: ${mod.ksloc.toFixed(3)} KSLOC`);
});
console.log(`Total Project Size: ${results.ksloc.toFixed(3)} KSLOC`);
console.log(`Exponent B: ${results.exponent_B}`);
console.log(`Effort Adjustment Factor (EAF): ${results.eaf}`);
console.log(`Estimated Effort: ${results.effort_pm} Person-Months`);
console.log(`Estimated Schedule: ${results.schedule_tdev} Calendar Months`);
console.log('-----------------------------------');
