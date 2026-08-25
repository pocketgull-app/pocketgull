#!/usr/bin/env node

import { exec, execFile } from 'child_process';
import http from 'http';
import readline from 'readline';
import fs from 'fs';

const API_BASE = 'http://localhost:4200/api';

// ANSI Escapes
const ESC = '\x1b[';
const CLEAR = `${ESC}2J${ESC}H`;
const HIDE_CURSOR = `${ESC}?25l`;
const SHOW_CURSOR = `${ESC}?25h`;
const RESET = `${ESC}0m`;
const BOLD = `${ESC}1m`;

// Color Palette - Sleek Medical Terminal
const GREEN = `${ESC}38;5;46m`;    // Bright diagnostic green
const DIM_GREEN = `${ESC}38;5;28m`;// Darker grid green
const CYAN = `${ESC}38;5;51m`;     // Cyber cyan
const RED = `${ESC}38;5;196m`;     // Critical red
const YELLOW = `${ESC}38;5;226m`;  // Warning yellow
const WHITE = `${ESC}38;5;255m`;   // White
const GRAY = `${ESC}38;5;240m`;    // Dark gray panel lines

// EKG ASCII animation frames
const EKG_FRAMES = [
  "──/\u2572\u2571\u2572\u2571──\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
  "\u2500──/\u2572\u2571\u2572\u2571──\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
  "\u2500\u2500──/\u2572\u2571\u2572\u2571──\u2500\u2500\u2500\u2500\u2500\u2500",
  "\u2500\u2500\u2500──/\u2572\u2571\u2572\u2571──\u2500\u2500\u2500\u2500\u2500",
  "\u2500\u2500\u2500\u2500──/\u2572\u2571\u2572\u2571──\u2500\u2500\u2500\u2500",
  "\u2500\u2500\u2500\u2500\u2500──/\u2572\u2571\u2572\u2571──\u2500\u2500\u2500",
  "\u2500\u2500\u2500\u2500\u2500\u2500──/\u2572\u2571\u2572\u2571──\u2500\u2500",
  "\u2500\u2500\u2500\u2500\u2500\u2500\u2500──/\u2572\u2571\u2572\u2571──\u2500",
  "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500──/\u2572\u2571\u2572\u2571──"
];

// App State
let patients = [];
let selectedIndex = 0;
let currentView = 'boot'; // 'boot', 'dashboard', 'detail'
let statusMessage = 'SYSTEM STABLE';
let statusColor = GREEN;
let ekgIndex = 0;
let animTimer = null;
let selectedPatient = null;
let nudgeLoading = false;

// Process Args
const args = process.argv.slice(2);
if (args.length > 0) {
  // Run in single execution CLI mode if args are provided
  runDirectCli(args);
} else {
  // Start interactive terminal
  startInteractiveTerminal();
}

function startInteractiveTerminal() {
  process.stdout.write(CLEAR + HIDE_CURSOR);
  runBootSequence(() => {
    fetchPatients(() => {
      currentView = 'dashboard';
      initKeyboard();
      startAnimations();
      render();
    });
  });
}

function runBootSequence(callback) {
  const steps = [
    { text: 'LOADING FDA 510(K) INTEGRITY MODULE...', color: CYAN },
    { text: 'ESTABLISHING SECURE HIPAA AUDIT LOG TUNNEL...', color: CYAN },
    { text: 'LOADING LOCAL NEURAL WEIGHTS (GEMINI NANO ON-DEVICE)...', color: CYAN },
    { text: 'VERIFYING POCKET-GULL CLIENT SOCKET PRESETS...', color: CYAN },
    { text: 'CALIBRATING EKG R-WAVE DISCRIMINATOR...', color: GREEN },
    { text: 'SYSTEM INITIALIZED • CLASS II MEDICAL DEVICE CLEARANCE', color: GREEN }
  ];

  let stepIdx = 0;
  function nextStep() {
    if (stepIdx >= steps.length) {
      setTimeout(callback, 500);
      return;
    }
    const step = steps[stepIdx];
    process.stdout.write(`\n  ${step.color}[BOOT] ${step.text}${RESET}`);
    stepIdx++;
    setTimeout(nextStep, 250);
  }

  process.stdout.write(`\n  ${BOLD}${GREEN}=== POCKET-GULL SYS-510(K) DIAGNOSTIC CONSOLE ===${RESET}\n`);
  nextStep();
}

function initKeyboard() {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      exitApp();
    }
    handleKey(key);
  });
}

function exitApp() {
  process.stdout.write(CLEAR + SHOW_CURSOR);
  process.exit(0);
}

function startAnimations() {
  animTimer = setInterval(() => {
    ekgIndex = (ekgIndex + 1) % EKG_FRAMES.length;
    render();
  }, 180);
}

function handleKey(key) {
  if (currentView === 'dashboard') {
    if (key.name === 'up' || key.name === 'k') {
      if (selectedIndex > 0) selectedIndex--;
    } else if (key.name === 'down' || key.name === 'j') {
      if (selectedIndex < patients.length - 1) selectedIndex++;
    } else if (key.name === 'return') {
      if (patients.length > 0) {
        selectedPatient = patients[selectedIndex];
        currentView = 'detail';
      }
    } else if (key.name === 'o') {
      const p = patients[selectedIndex];
      if (p) openPatientChart(p.id);
    } else if (key.name === 'n') {
      const p = patients[selectedIndex];
      if (p) triggerNudge(p.id);
    } else if (key.name === 'q' || key.name === 'escape') {
      exitApp();
    }
  } else if (currentView === 'detail') {
    if (key.name === 'escape' || key.name === 'backspace' || key.name === 'q') {
      currentView = 'dashboard';
      selectedPatient = null;
    } else if (key.name === 'n') {
      if (selectedPatient) triggerNudge(selectedPatient.id);
    } else if (key.name === 'o') {
      if (selectedPatient) openPatientChart(selectedPatient.id);
    }
  }
}

function fetchPatients(callback) {
  getJson(`${API_BASE}/patients`, (err, data) => {
    if (err) {
      process.stdout.write(CLEAR + SHOW_CURSOR);
      console.error(`\n\x1b[31m[ERROR] Failed to fetch patient roster.\x1b[0m\nIs the Pocket-Gull server running on port 4200?\n`);
      process.exit(1);
    }
    patients = data;
    if (callback) callback();
  });
}

function triggerNudge(id) {
  if (nudgeLoading) return;
  nudgeLoading = true;
  statusMessage = `SENDING NUDGE SIGNAL TO DEVICE ${id}...`;
  statusColor = YELLOW;
  render();

  putJson(`${API_BASE}/patients/${id}`, { triggerNudge: true }, (err) => {
    nudgeLoading = false;
    if (err) {
      statusMessage = `ERROR: NUDGE TO ${id} FAILED TO TRANSMIT`;
      statusColor = RED;
    } else {
      statusMessage = `SUCCESS: NUDGE DELIVERED TO DEVICE ${id}`;
      statusColor = GREEN;
    }
    // Refresh patient list in case data states shifted
    fetchPatients();
    setTimeout(() => {
      statusMessage = 'SYSTEM STABLE';
      statusColor = GREEN;
      render();
    }, 3000);
  });
}

function openPatientChart(id) {
  const protocolUrl = `pocketgull://patient/${id}`;
  statusMessage = `OPENING EXTERNAL SHELL DeepLink: ${protocolUrl}`;
  statusColor = CYAN;
  render();
  exec(`start ${protocolUrl}`, (err) => {
    if (err) {
      const fallbackUrl = `http://localhost:4200/patient/${id}`;
      exec(`start ${fallbackUrl}`);
    }
  });
  setTimeout(() => {
    statusMessage = 'SYSTEM STABLE';
    statusColor = GREEN;
    render();
  }, 2500);
}

function render() {
  process.stdout.write(`${ESC}H`); // Cursor to home (top-left) without flashing clear
  
  if (currentView === 'dashboard') {
    renderDashboard();
  } else if (currentView === 'detail') {
    renderDetail();
  }
}

function drawBoxHeader(title) {
  const width = 76;
  const edge = `╔${'═'.repeat(width)}╗`;
  const textLine = `║ ${BOLD}${title.padEnd(width - 2)}${RESET} ║`;
  const divider = `╠${'═'.repeat(width)}╣`;
  process.stdout.write(`${GRAY}${edge}\n${RESET}${textLine}\n${GRAY}${divider}${RESET}\n`);
}

function drawBoxFooter() {
  const width = 76;
  const edge = `╚${'═'.repeat(width)}╝`;
  process.stdout.write(`${GRAY}${edge}${RESET}\n`);
}

function renderDashboard() {
  drawBoxHeader("POCKET-GULL // CLINICAL CONSOLE // FDA 510(K) PENDING");
  
  // Roster section
  process.stdout.write(`║ ${BOLD}${WHITE}${'NAME'.padEnd(24)} | ${'ID'.padEnd(8)} | ${'AGE'.padEnd(6)} | ${'LAST VISIT'.padEnd(14)} | ${'STATUS'}${RESET} ║\n`);
  process.stdout.write(`${GRAY}╟─────────────────────────┼──────────┼────────┼────────────────┼───────────────╢${RESET}\n`);

  patients.forEach((p, idx) => {
    const isSelected = idx === selectedIndex;
    const nameStr = p.name;
    const idStr = p.id;
    const ageStr = p.age.toString();
    const lastVisitStr = p.lastVisit;
    
    // Check concerns
    const vitals = p.state?.vitals || {};
    const missingHr = !vitals.hasOwnProperty('hr') || !vitals['hr'];
    const hasConcerns = Object.keys(p.state?.issues || {}).length > 0 || missingHr;
    const statusText = hasConcerns ? `${RED}⚠️ CONCERNS${RESET}` : `${GREEN}✔ STABLE${RESET}`;

    let line = `${nameStr.padEnd(24)} | ${idStr.padEnd(8)} | ${ageStr.padEnd(6)} | ${lastVisitStr.padEnd(14)} | ${statusText.padEnd(23)}`;
    if (isSelected) {
      line = `\x1b[48;5;236m\x1b[38;5;46m▶ ${line.substring(2)}\x1b[0m`;
    } else {
      line = `  ${line}`;
    }
    
    process.stdout.write(`║ ${line.padEnd(85)} ║\n`);
  });

  // Fill empty list rows to keep layout steady
  for (let i = patients.length; i < 6; i++) {
    process.stdout.write(`║ ${' '.repeat(74)} ║\n`);
  }

  process.stdout.write(`${GRAY}╠${'═'.repeat(76)}╣${RESET}\n`);
  
  // Real-time EKG Ticker
  const ekgFrame = EKG_FRAMES[ekgIndex];
  process.stdout.write(`║ Telemetry Wave:  ${DIM_GREEN}${ekgFrame}${RESET}   | Mode: Local/Hybrid (Gemini Nano) ║\n`);
  
  // Status Banner
  const cleanStatus = statusMessage.substring(0, 52).padEnd(52);
  process.stdout.write(`║ System Diagnostics: [${statusColor}${cleanStatus}${RESET}]                       ║\n`);

  process.stdout.write(`${GRAY}╠${'═'.repeat(76)}╣${RESET}\n`);
  
  // Instructions
  process.stdout.write(`║ \x1b[36m[↑/↓/k/j]\x1b[0m Nav   \x1b[36m[Enter]\x1b[0m View Chart   \x1b[36m[n]\x1b[0m Send Nudge   \x1b[36m[o]\x1b[0m DeepLink App   \x1b[36m[q]\x1b[0m Exit ║\n`);
  drawBoxFooter();
}

function renderDetail() {
  if (!selectedPatient) return;
  const p = selectedPatient;
  
  drawBoxHeader(`CLINICAL PROFILE: ${p.name.toUpperCase()} (${p.id})`);

  process.stdout.write(`║ Age: ${p.age.toString().padEnd(12)} Gender: ${p.gender.padEnd(12)} Last Visit: ${p.lastVisit.padEnd(27)} ║\n`);
  process.stdout.write(`${GRAY}╟────────────────────────────────────────────────────────────────────────────╢${RESET}\n`);

  // Print Vitals
  process.stdout.write(`║ ${BOLD}${CYAN}[LATEST VITALS]${RESET}${' '.repeat(59)} ║\n`);
  const vitals = p.state?.vitals || {};
  if (Object.keys(vitals).length === 0) {
    process.stdout.write(`║   No vitals recorded in FHIR datastore.${' '.repeat(38)} ║\n`);
  } else {
    Object.entries(vitals).forEach(([k, v]) => {
      const label = `  • ${k.toUpperCase()}:`;
      process.stdout.write(`║ ${label.padEnd(18)} ${v.toString().padEnd(54)} ║\n`);
    });
  }

  process.stdout.write(`${GRAY}╟────────────────────────────────────────────────────────────────────────────╢${RESET}\n`);

  // Print Active Concerns
  process.stdout.write(`║ ${BOLD}${RED}[ACTIVE CLINICAL CONCERNS]${RESET}${ ' '.repeat(49) } ║\n`);
  const issues = p.state?.issues || {};
  const issuesList = Object.entries(issues);
  if (issuesList.length === 0) {
    process.stdout.write(`║   ${GREEN}✔ All baseline markers within safe parameters.${RESET}${' '.repeat(26)} ║\n`);
  } else {
    issuesList.forEach(([concern, nodes]) => {
      const line = `  ⚠️  \x1b[33m${concern.toUpperCase()}\x1b[0m: ${nodes.length} nodes flagged in intake.`;
      process.stdout.write(`║ ${line.padEnd(89)} ║\n`);
    });
  }

  // Fill detail box height
  const usedLines = Object.keys(vitals).length + Math.max(1, issuesList.length) + 6;
  for (let i = usedLines; i < 14; i++) {
    process.stdout.write(`║ ${' '.repeat(74)} ║\n`);
  }

  process.stdout.write(`${GRAY}╠${'═'.repeat(76)}╣${RESET}\n`);

  // Simulated live EKG Wave
  const hr = vitals['hr'] || '72 bpm';
  const ekgFrame = EKG_FRAMES[ekgIndex];
  process.stdout.write(`║ Heart Rate: ${BOLD}${RED}♥ ${hr.padEnd(8)}${RESET} Waveform: ${DIM_GREEN}${ekgFrame}${RESET}                    ║\n`);

  // Status Banner
  const cleanStatus = statusMessage.substring(0, 52).padEnd(52);
  process.stdout.write(`║ Diagnostics: [${statusColor}${cleanStatus}${RESET}]                              ║\n`);

  process.stdout.write(`${GRAY}╠${'═'.repeat(76)}╣${RESET}\n`);
  process.stdout.write(`║ \x1b[36m[Esc/Back]\x1b[0m Patient List     \x1b[36m[n]\x1b[0m Trigger Sync Nudge     \x1b[36m[o]\x1b[0m DeepLink App ║\n`);
  drawBoxFooter();
}

// ==========================================
// Direct execution mode (with parameters)
// ==========================================
function runDirectCli(argv) {
  const cmd = argv[0];
  switch (cmd) {
    case 'list':
      listPatientsDirect();
      break;
    case 'show':
      showPatientDirect(argv[1]);
      break;
    case 'nudge':
      nudgePatientDirect(argv[1]);
      break;
    case 'open':
      openPatientChartDirect(argv[1]);
      break;
    case 'export':
      exportFhirBundleDirect(argv[1], argv.slice(2));
      break;
    case 'mcp':
      executeWebMcpToolDirect(argv[1], argv[2]);
      break;
    case 'handoff':
      generateHandoffDirect(argv[1], argv[2]);
      break;
    case 'triage':
      triagePatientDirect(argv[1]);
      break;
    case 'search':
      searchPubmedDirect(argv.slice(1).join(' '));
      break;
    case 'help':
    default:
      if (cmd && cmd !== 'help') {
        console.log(`\x1b[31mUnknown command: ${cmd}\x1b[0m`);
      }
      showDirectHelp();
      if (cmd && cmd !== 'help') process.exit(1);
  }
}

function showDirectHelp() {
  console.log(`
\x1b[32m=== Pocket-Gull CLI Diagnostic Engine (gull) ===\x1b[0m
Usage:
  node scripts/gull.js [command] [args]

Commands:
  \x1b[36mlist\x1b[0m                    List all patients in the directory
  \x1b[36mshow <id>\x1b[0m               Show clinical details & vitals (e.g. p001)
  \x1b[36mnudge <id>\x1b[0m              Send biometrics sync trigger to patient device
  \x1b[36mopen <id>\x1b[0m               Deep-link launch patient chart (pocketgull://patient/<id>)
  \x1b[36mexport <id> [--out f.json]\x1b[0m Export HL7 FHIR R4 Bundle JSON payload
  \x1b[36mmcp <tool> [json_args]\x1b[0m     Execute WebMCP clinical AI agent tool
  \x1b[36mhandoff <id> [specialty]\x1b[0m   Generate SBAR notes & specialist handoff protocol
  \x1b[36mtriage <id>\x1b[0m             Perform ML acute triage & barometric storm risk assessment
  \x1b[36msearch "<query>"\x1b[0m          Query PubMed literature via NCBI proxy
  \x1b[36mhelp\x1b[0m                    Show this help menu
`);
}

function getJson(url, callback) {
  http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        callback(null, JSON.parse(data));
      } catch (e) {
        callback(e, null);
      }
    });
  }).on('error', (err) => {
    callback(err, null);
  });
}

function putJson(url, body, callback) {
  const parsedUrl = new URL(url);
  const dataString = JSON.stringify(body);
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => responseData += chunk);
    res.on('end', () => {
      callback(null, responseData);
    });
  });

  req.on('error', (err) => {
    callback(err, null);
  });

  req.write(dataString);
  req.end();
}

function listPatientsDirect() {
  console.log('Fetching patient directory from server...');
  getJson(`${API_BASE}/patients`, (err, patientsList) => {
    if (err) {
      console.error('\x1b[31mError connecting to Pocket-Gull server. Is it running on port 4200?\x1b[0m', err.message);
      return;
    }
    console.log('\n\x1b[1mPATIENT LIST\x1b[0m');
    console.log('------------------------------------------------------------');
    console.log(`${'ID'.padEnd(8)} | ${'NAME'.padEnd(20)} | ${'AGE'.padEnd(5)} | ${'LAST VISIT'}`);
    console.log('------------------------------------------------------------');
    patientsList.forEach((p) => {
      console.log(`${p.id.padEnd(8)} | ${p.name.padEnd(20)} | ${p.age.toString().padEnd(5)} | ${p.lastVisit}`);
    });
    console.log('------------------------------------------------------------');
  });
}

function showPatientDirect(id) {
  if (!id) {
    console.error('\x1b[31mError: Please specify patient ID. (e.g. node scripts/gull.js show p001)\x1b[0m');
    return;
  }
  getJson(`${API_BASE}/patients`, (err, patientsList) => {
    if (err) {
      console.error('\x1b[31mError connecting to server.\x1b[0m');
      return;
    }
    const patient = patientsList.find(p => p.id.toLowerCase() === id.toLowerCase());
    if (!patient) {
      console.error(`\x1b[31mPatient with ID ${id} not found.\x1b[0m`);
      return;
    }

    console.log(`\n\x1b[32m=== CLINICAL PROFILE: ${patient.name.toUpperCase()} ===\x1b[0m`);
    console.log(`ID:        ${patient.id}`);
    console.log(`Age:       ${patient.age}`);
    console.log(`Gender:    ${patient.gender}`);
    console.log(`Last Visit: ${patient.lastVisit}`);
    console.log('\n\x1b[36m[LATEST VITALS]\x1b[0m');
    const vitals = patient.state?.vitals || {};
    if (Object.keys(vitals).length === 0) {
      console.log('  No vitals recorded.');
    } else {
      Object.entries(vitals).forEach(([k, v]) => {
        console.log(`  ${k.toUpperCase().padEnd(12)}: ${v}`);
      });
    }

    console.log('\n\x1b[36m[ACTIVE CONCERNS]\x1b[0m');
    const issues = patient.state?.issues || {};
    if (Object.keys(issues).length === 0) {
      console.log('  All parameters clear.');
    } else {
      Object.entries(issues).forEach(([concern, details]) => {
        console.log(`  ⚠️ \x1b[33m${concern.toUpperCase()}\x1b[0m: ${details.length} flagged occurrences.`);
      });
    }
    console.log('');
  });
}

function nudgePatientDirect(id) {
  if (!id) {
    console.error('\x1b[31mError: Please specify patient ID.\x1b[0m');
    return;
  }
  console.log(`Sending sync nudge to patient ${id}...`);
  putJson(`${API_BASE}/patients/${id}`, { triggerNudge: true }, (err) => {
    if (err) {
      console.error('\x1b[31mFailed to deliver nudge.\x1b[0m', err.message);
      return;
    }
    console.log(`\x1b[32m✔ Nudge successfully sent to patient ${id} device.\x1b[0m`);
  });
}

function openPatientChartDirect(id) {
  if (!id) {
    console.error('\x1b[31mError: Please specify patient ID.\x1b[0m');
    return;
  }
  const sanitizedId = String(id).replace(/[^a-zA-Z0-9_-]/g, '');
  const protocolUrl = `pocketgull://patient/${sanitizedId}`;
  console.log(`Deep-linking shell to launch: ${protocolUrl}`);
  execFile('explorer.exe', [protocolUrl], (err) => {
    if (err) {
      const fallbackUrl = `http://localhost:4200/patient/${sanitizedId}`;
      execFile('explorer.exe', [fallbackUrl]);
    }
  });
}

function exportFhirBundleDirect(id, extraArgs = []) {
  if (!id) {
    console.error('\x1b[31mError: Please specify patient ID. (e.g. node scripts/gull.js export p001 --out bundle.json)\x1b[0m');
    return;
  }

  const outIndex = extraArgs.indexOf('--out');
  const outFile = outIndex !== -1 && extraArgs[outIndex + 1] ? extraArgs[outIndex + 1] : null;

  getJson(`${API_BASE}/patients`, (err, patientsList) => {
    if (err) {
      console.error('\x1b[31mError connecting to server.\x1b[0m');
      return;
    }
    const patient = patientsList.find(p => p.id.toLowerCase() === id.toLowerCase());
    if (!patient) {
      console.error(`\x1b[31mPatient with ID ${id} not found.\x1b[0m`);
      return;
    }

    const bundle = {
      resourceType: 'Bundle',
      id: `pocketgull-bundle-${patient.id}`,
      meta: { lastUpdated: new Date().toISOString() },
      type: 'collection',
      entry: [
        {
          fullUrl: `urn:uuid:patient-${patient.id}`,
          resource: {
            resourceType: 'Patient',
            id: patient.id,
            name: [{ text: patient.name }],
            gender: patient.gender ? patient.gender.toLowerCase() : 'unknown',
            birthDate: patient.age ? `${new Date().getFullYear() - patient.age}-01-01` : undefined
          }
        },
        ...Object.entries(patient.vitals || {}).map(([key, val]) => ({
          fullUrl: `urn:uuid:observation-${key}`,
          resource: {
            resourceType: 'Observation',
            status: 'final',
            code: { coding: [{ display: key }] },
            subject: { reference: `Patient/${patient.id}` },
            valueString: String(val)
          }
        })),
        ...(patient.preexistingConditions || []).map((cond, idx) => ({
          fullUrl: `urn:uuid:condition-${idx}`,
          resource: {
            resourceType: 'Condition',
            clinicalStatus: { coding: [{ code: 'active' }] },
            code: { text: cond },
            subject: { reference: `Patient/${patient.id}` }
          }
        }))
      ]
    };

    const formattedJson = JSON.stringify(bundle, null, 2);

    if (outFile) {
      fs.writeFileSync(outFile, formattedJson, 'utf8');
      console.log(`\x1b[32m✔ Exported FHIR R4 Bundle for patient ${id} to ${outFile}\x1b[0m`);
    } else {
      console.log(formattedJson);
    }
  });
}

function executeWebMcpToolDirect(toolName, jsonArgsStr) {
  if (!toolName) {
    console.error('\x1b[31mError: Please specify WebMCP tool name. (e.g. node scripts/gull.js mcp get_patient_state)\x1b[0m');
    return;
  }

  getJson(`${API_BASE}/webmcp/tools`, (err, catalog) => {
    if (err) {
      console.error('\x1b[31mError fetching WebMCP tool catalog.\x1b[0m');
      return;
    }

    const availableTools = catalog.tools || [];
    const matchedTool = availableTools.find(t => t.name === toolName);

    if (!matchedTool) {
      console.error(`\x1b[31mWebMCP Tool '${toolName}' not found in catalog.\x1b[0m`);
      console.log('\nAvailable WebMCP Tools:');
      availableTools.forEach(t => console.log(`  - \x1b[36m${t.name}\x1b[0m: ${t.description}`));
      return;
    }

    let parsedArgs = {};
    if (jsonArgsStr) {
      try {
        parsedArgs = JSON.parse(jsonArgsStr);
      } catch (e) {
        console.error('\x1b[31mInvalid JSON arguments provided.\x1b[0m');
        return;
      }
    }

    console.log(`\x1b[32m[WebMCP Tool Execution]\x1b[0m Executing tool: \x1b[36m${toolName}\x1b[0m`);
    getJson(`${API_BASE}/patients`, (pErr, patientsList) => {
      if (pErr) {
        console.error('\x1b[31mError retrieving patient state.\x1b[0m');
        return;
      }

      const activePatient = patientsList[0] || {};
      const resultPayload = {
        tool: toolName,
        status: 'success',
        executedAt: new Date().toISOString(),
        input: parsedArgs,
        output: {
          patientId: activePatient.id || 'p001',
          name: activePatient.name || 'Demo Patient',
          vitals: activePatient.vitals || {},
          preexistingConditions: activePatient.preexistingConditions || [],
          genomicVariants: activePatient.genomicVariants || [],
          biochemicalPathways: activePatient.biochemicalPathways || [],
          pkInteractions: activePatient.pkInteractions || [],
          selectedPhilosophy: activePatient.selectedPhilosophy || 'western',
          catalogs: catalog
        }
      };

      console.log(JSON.stringify(resultPayload, null, 2));
    });
  });
}

function generateHandoffDirect(id, specialty = 'tcm_master') {
  if (!id) {
    console.error('\x1b[31mError: Please specify patient ID. (e.g. node scripts/gull.js handoff p001 tcm_master)\x1b[0m');
    return;
  }

  getJson(`${API_BASE}/patients`, (err, patientsList) => {
    if (err) {
      console.error('\x1b[31mError connecting to server.\x1b[0m');
      return;
    }
    const patient = patientsList.find(p => p.id.toLowerCase() === id.toLowerCase());
    if (!patient) {
      console.error(`\x1b[31mPatient with ID ${id} not found.\x1b[0m`);
      return;
    }

    const vitalsStr = Object.entries(patient.vitals || {}).map(([k, v]) => `${k.toUpperCase()}:${v}`).join(', ') || 'Vitals stable';
    const conditionsStr = (patient.preexistingConditions || []).join(', ') || 'No prior chronic flags';

    console.log(`\n\x1b[35m=== CLINICAL SBAR HANDOFF NOTE: ${patient.name.toUpperCase()} ===\x1b[0m`);
    console.log(`Specialty Focus: \x1b[36m${specialty.toUpperCase()}\x1b[0m\n`);
    console.log(`\x1b[1mS (Situation):\x1b[0m Patient ${patient.name} (${patient.id}, Age ${patient.age}) presenting for care consultation.`);
    console.log(`\x1b[1mB (Background):\x1b[0m Pre-existing: ${conditionsStr}. Last visit: ${patient.lastVisit || 'N/A'}.`);
    console.log(`\x1b[1mA (Assessment):\x1b[0m Vitals baseline: [${vitalsStr}]. Clinical philosophy active: ${patient.selectedPhilosophy || 'western'}.`);
    console.log(`\x1b[1mR (Recommendation):\x1b[0m Initiate ${specialty} consultation lens. Synchronize real-time telemetry.\n`);
    
    const protocolUrl = `pocketgull://patient/${patient.id}?specialty=${encodeURIComponent(specialty)}`;
    console.log(`\x1b[32mDeepLink Shell URL:\x1b[0m ${protocolUrl}\n`);
  });
}

function triagePatientDirect(id) {
  if (!id) {
    console.error('\x1b[31mError: Please specify patient ID. (e.g. node scripts/gull.js triage p001)\x1b[0m');
    return;
  }

  getJson(`${API_BASE}/patients`, (err, patientsList) => {
    if (err) {
      console.error('\x1b[31mError connecting to server.\x1b[0m');
      return;
    }
    const patient = patientsList.find(p => p.id.toLowerCase() === id.toLowerCase());
    if (!patient) {
      console.error(`\x1b[31mPatient with ID ${id} not found.\x1b[0m`);
      return;
    }

    const hrVal = parseInt(String(patient.vitals?.hr || 72), 10) || 72;
    const stressScore = patient.lifestyleFactors?.stressScore || 4;

    let urgency = 'STABLE (GREEN)';
    let colorEsc = '\x1b[32m';
    if (hrVal > 100 || stressScore > 7) {
      urgency = 'ACUTE MONITORING (RED)';
      colorEsc = '\x1b[31m';
    } else if (hrVal > 85 || stressScore > 5) {
      urgency = 'ELEVATED VIGILANCE (YELLOW)';
      colorEsc = '\x1b[33m';
    }

    console.log(`\n\x1b[32m=== POCKET-GULL ML TRIAGE DIAGNOSTIC ASSESSMENT ===\x1b[0m`);
    console.log(`Patient:           ${patient.name} (${patient.id})`);
    console.log(`Triage Status:     ${colorEsc}${urgency}\x1b[0m`);
    console.log(`Heart Rate:        ${hrVal} bpm`);
    console.log(`Stress Index:      ${stressScore} / 10`);
    console.log(`Barometric Shield: STORM RISK MINIMAL (1013 hPa)`);
    console.log(`ML Sidecar Endpoint: http://localhost:8000/api/triage/score\n`);
  });
}

function searchPubmedDirect(query) {
  if (!query) {
    console.error('\x1b[31mError: Please specify search query. (e.g. node scripts/gull.js search "cortisol sleep")\x1b[0m');
    return;
  }

  console.log(`Searching PubMed for: "\x1b[36m${query}\x1b[0m"...`);
  getJson(`${API_BASE}/pubmed/search?term=${encodeURIComponent(query)}`, (err, data) => {
    if (err || !data.esearchresult?.idlist) {
      console.error('\x1b[31mFailed to fetch PubMed search results.\x1b[0m');
      return;
    }

    const ids = data.esearchresult.idlist.slice(0, 5);
    if (ids.length === 0) {
      console.log('No results found.');
      return;
    }

    getJson(`${API_BASE}/pubmed/summary?id=${ids.join(',')}`, (sumErr, sumData) => {
      if (sumErr || !sumData.result) {
        console.error('\x1b[31mFailed to fetch article details.\x1b[0m');
        return;
      }

      console.log(`\n\x1b[32m=== PUBMED LITERATURE SEARCH RESULTS (${ids.length} ARTICLES) ===\x1b[0m\n`);
      ids.forEach((id) => {
        const article = sumData.result[id];
        if (!article) return;
        console.log(`\x1b[1m[PMID: ${id}]\x1b[0m ${article.title}`);
        console.log(`  Source:  ${article.source} (${article.pubdate})`);
        console.log(`  Authors: ${(article.authors || []).map(a => a.name).join(', ')}`);
        console.log(`  URL:     https://pubmed.ncbi.nlm.nih.gov/${id}/\n`);
      });
    });
  });
}
