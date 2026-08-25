import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const angularRoot = path.join(__dirname, '../src');
const flutterRoot = path.join(__dirname, '../pocketgull_flutter/lib');
const pythonRoot = path.join(__dirname, '../pocketgull_api');

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('.venv') && !filePath.includes('node_modules') && !filePath.includes('__pycache__') && !filePath.includes('dist')) {
        getFiles(filePath, fileList);
      }
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function extractBaseName(filename) {
  let base = path.basename(filename);
  base = base.replace(/\.(component|service|directive|pipe)\.ts$/, '');
  base = base.replace(/\.(dart|ts|py)$/, '');
  base = base.replace(/_(widget|screen|bloc|provider|model|types|cubit|event|service|targets)$/, '');
  base = base.replace(/(-|_)/g, ' ');
  return base.toLowerCase().trim();
}

const angularFiles = [
  ...getFiles(path.join(angularRoot, 'components')),
  ...getFiles(path.join(angularRoot, 'services')),
  ...getFiles(path.join(angularRoot, 'directives')),
  ...getFiles(path.join(angularRoot, 'pipes')),
].filter(f => !f.endsWith('.spec.ts'));

const flutterFiles = [
  ...getFiles(path.join(flutterRoot, 'widgets')),
  ...getFiles(path.join(flutterRoot, 'screens')),
  ...getFiles(path.join(flutterRoot, 'services')),
  ...getFiles(path.join(flutterRoot, 'providers')),
  ...getFiles(path.join(flutterRoot, 'models')),
  ...getFiles(path.join(flutterRoot, 'theme')),
];

const pythonFiles = [
  ...getFiles(pythonRoot).filter(f => f.endsWith('.py') && !f.includes('.venv'))
];

const angularMap = new Map();
angularFiles.forEach(f => {
  const base = extractBaseName(f);
  if (!angularMap.has(base)) angularMap.set(base, []);
  angularMap.get(base).push(path.relative(path.join(__dirname, '..'), f));
});

const flutterMap = new Map();
flutterFiles.forEach(f => {
  const base = extractBaseName(f);
  if (!flutterMap.has(base)) flutterMap.set(base, []);
  flutterMap.get(base).push(path.relative(path.join(__dirname, '..'), f));
});

const pythonMap = new Map();
pythonFiles.forEach(f => {
  const base = extractBaseName(f);
  if (!pythonMap.has(base)) pythonMap.set(base, []);
  pythonMap.get(base).push(path.relative(path.join(__dirname, '..'), f));
});

const allKeys = new Set([...angularMap.keys(), ...flutterMap.keys(), ...pythonMap.keys()]);
const sortedKeys = Array.from(allKeys).sort();

let markdown = '# Multi-Platform Feature Parity Matrix\n\n';
markdown += 'This document maps feature capabilities across the Angular/TypeScript Web App, Flutter/Dart Mobile Suite, and Python FastAPI Sidecar.\n\n';
markdown += '| Feature / Base Name | Angular / TS App | Flutter / Dart App | Python FastAPI Sidecar | System Status |\n';
markdown += '| :--- | :--- | :--- | :--- | :--- |\n';

let matchCount = 0;
let partialCount = 0;

for (const key of sortedKeys) {
  const angFiles = angularMap.get(key) || [];
  const fltFiles = flutterMap.get(key) || [];
  const pyFiles = pythonMap.get(key) || [];
  
  let status = '✅ Web & Mobile Parity';
  if (angFiles.length > 0 && fltFiles.length > 0 && pyFiles.length > 0) {
    status = '🌟 Full 3-Tier Synergy';
    matchCount++;
  } else if (angFiles.length > 0 && fltFiles.length > 0) {
    status = '✅ Web & Mobile Parity';
    matchCount++;
  } else if (pyFiles.length > 0) {
    status = '🐍 Python ML Service';
    partialCount++;
  } else if (fltFiles.length > 0) {
    status = '📱 Flutter Companion Feature';
    partialCount++;
  } else {
    status = '🌐 Web Core Feature';
    partialCount++;
  }

  const angStr = angFiles.map(f => `\`${f}\``).join('<br>');
  const fltStr = fltFiles.map(f => `\`${f}\``).join('<br>');
  const pyStr = pyFiles.map(f => `\`${f}\``).join('<br>');
  
  markdown += `| **${key}** | ${angStr || '-'} | ${fltStr || '-'} | ${pyStr || '-'} | ${status} |\n`;
}

markdown += '\n## 🏆 Clinical Contest APIs & Endpoint Contract Roadmap\n\n';
markdown += '| Contest / Challenge Endpoint | Clinical Domain & Model Target | FHIR R4 Bundle Contract | Cross-Platform Integration Status |\n';
markdown += '| :--- | :--- | :--- | :--- |\n';
markdown += '| **POST /ml/predict/physionet-2022** | Heart Sound (PCG) & Murmur Intensity | `RiskAssessment` + `Observation` | 🌟 Angular STT & Flutter Audio Bridge |\n';
markdown += '| **POST /ml/predict/physionet-2023** | Coma EEG Burst-Suppression Prognosis | `RiskAssessment` + `DiagnosticReport` | 🌟 Angular Neuro Matrix & Flutter Widget |\n';
markdown += '| **POST /ml/predict/physionet-2024** | Multi-Lead ECG Ischemia & STEMI Triage | `RiskAssessment` + `Observation` | 🌟 Angular Vitals Chart & Flutter Radar |\n';
markdown += '| **POST /ml/predict/physionet-2026** | Continuous PPG/HRV Sepsis Deterioration | `RiskAssessment` + `Condition` | 🌟 Python Sidecar & SSE Streaming |\n';
markdown += '| **GET /api/hardware/telemetry** | Sidecar VRAM, GPU, CPU, RAM Sensors | `HardwareTelemetryResponse` | 🌟 HardwareTelemetryService Sync |\n';
markdown += '| **GET /stream/biosignal/{id}** | Real-Time SSE EEG/HRV Array Stream | `Server-Sent Events (SSE)` | 🌟 GlobalAvsService Stream |\n\n';

markdown += '## Architecture Summary\n';
markdown += `- **Total Tracked System Capabilities**: ${sortedKeys.length}\n`;
markdown += `- **Unified Cross-Platform Matched Features**: ${matchCount}\n`;
markdown += `- **Specialized Subsystem Services**: ${partialCount}\n`;

const outputPath = path.join(__dirname, '../parity_matrix.md');
fs.writeFileSync(outputPath, markdown);

console.log(`Multi-Platform parity matrix with Contest APIs generated successfully at ${outputPath}`);
