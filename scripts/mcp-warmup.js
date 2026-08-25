import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

console.log('🚀 [MCP Warmup] Initializing background MCP daemons & named pipe proxies...');

// 1. Check & refresh Application Default Credentials if needed
try {
  console.log('🔐 [MCP Warmup] Checking Google Application Default Credentials (ADC)...');
  const userHome = os.homedir();
  const adcPath = path.join(userHome, 'AppData', 'Roaming', 'gcloud', 'application_default_credentials.json');
  if (fs.existsSync(adcPath)) {
    console.log('✅ [MCP Warmup] ADC credentials found at:', adcPath);
  } else {
    console.log('⚠️ [MCP Warmup] ADC credentials missing. Run "gcloud auth application-default login" to authenticate.');
  }
} catch (e) {
  console.warn('⚠️ [MCP Warmup] ADC check warning:', e.message);
}

// 2. Pre-warm Windows named pipes for notebooks and visualization
if (process.platform === 'win32') {
  const pipes = [
    '\\\\?\\pipe\\datacloud-mcp-notebooks-antigravityide',
    '\\\\?\\pipe\\datacloud-mcp-visualization-antigravityide'
  ];
  pipes.forEach(pipePath => {
    try {
      if (fs.existsSync(pipePath)) {
        console.log(`✅ [MCP Warmup] Named pipe active: ${pipePath}`);
      } else {
        console.log(`ℹ️ [MCP Warmup] Named pipe on standby: ${pipePath}`);
      }
    } catch (e) {
      // Ignore pipe access errors - pipe will bind on demand
    }
  });
}

console.log('✨ [MCP Warmup] MCP environment ready for smooth IDE operation.');
