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
        { name: 'Web Client (Angular)', path: 'src', exts: ['.ts', '.js', '.html', '.css'] },
        { name: 'Backend API (Node)', path: 'pocketgull_api/src', exts: ['.ts'] },
        { name: 'AVS Therapy Companion (Angular)', path: 'companion-apps/avs-therapy/src', exts: ['.ts', '.js', '.html', '.css'] }
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
                let ext = path.extname(fullFile).substring(1);
                if (ext === 'dart') {
                    ext = 'ts'; // map dart comments to TS parser
                }
                const stats = sloc(code, ext);
                if (stats && stats.source) {
                    modSloc += stats.source;
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
    prec: 3.72, // Precedentedness: Nominal (New project area but existing tech)
    flex: 3.04, // Development Flexibility: Nominal
    resl: 4.24, // Architecture/Risk Resolution: Nominal
    team: 2.19, // Team Cohesion: High (Solo/Small tight team)
    pmat: 4.68, // Process Maturity: Nominal
};

// Post-Architecture Cost Drivers (EM - Effort Multipliers)
const effortMultipliers = {
    rely: 1.10, // Required Software Reliability: High (Medical app)
    data: 1.14, // Data Base Size: High (Patient records/Gemini context)
    cplx: 1.17, // Product Complexity: High (AI/Three.js integration)
    ruse: 1.07, // Developed for Reusability: Nominal
    docu: 1.00, // Documentation Match to Life-Cycle: Nominal

    // Platform Factors
    time: 1.11, // Execution Time Constraint: High (Real-time AI voice)
    pvol: 0.87, // Platform Volatility: Low (Standard Web stack)

    // Personnel Factors
    acap: 0.71, // Analyst Capability: Extra High (Advanced agentic usage)
    pcap: 0.76, // Programmer Capability: Extra High
    pcon: 0.81, // Personnel Continuity: Very High
    aexp: 0.88, // Applications Experience: High
    pexp: 0.91, // Platform Experience: High
    lexp: 0.95, // Language Experience: High

    // Project Factors
    site: 0.80, // Multi-site Development: Extra High (Colocated/Solo)
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
