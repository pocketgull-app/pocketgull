#!/usr/bin/env node
/**
 * Adobe Developer Console & Firefly PBR Texture MCP Server
 * STDIO Model Context Protocol server exposing Adobe Console & Firefly metadata tools.
 */

import readline from 'readline';
import fs from 'fs';

const logFile = 'C:\\Users\\philg\\Pocketgull\\pocketgull\\scripts\\adobe-mcp.log';
function log(msg) {
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch {}
}

log('--- Server starting --- PID: ' + process.pid);
process.on('uncaughtException', err => {
  log('UncaughtException: ' + err.stack);
});
process.on('unhandledRejection', err => {
  log('UnhandledRejection: ' + err);
});
process.on('exit', code => {
  log('Process exiting with code: ' + code);
});

const ADOBE_ORG_ID = process.env.ADOBE_ORG_ID || '00AF226E687833EB0A495CEE@AdobeOrg';
const ADOBE_PROJECT_ID = process.env.ADOBE_PROJECT_ID || '224161';
const ADOBE_WORKSPACE_ID = process.env.ADOBE_WORKSPACE_ID || '4566206088345737575';
const ADOBE_CONSOLE_URL =
  process.env.ADOBE_CONSOLE_URL ||
  'https://developer.adobe.com/console/projects/224161/4566206088345737575/overview';

const TOOLS = [
  {
    name: 'get_adobe_workspace_info',
    description: 'Retrieves Adobe Developer Console project, workspace, and organization metadata.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_firefly_pbr_texture_specs',
    description:
      'Retrieves Edwin Smith Surgical Codex PBR texture specifications for anatomical 3D rendering.',
    inputSchema: {
      type: 'object',
      properties: {
        layer: {
          type: 'string',
          enum: ['skin', 'muscle', 'skeleton', 'organs'],
          description: 'Anatomical tissue layer type',
        },
      },
      required: ['layer'],
    },
  },
];

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false,
});

rl.on('line', line => {
  if (!line.trim()) return;
  log('IN: ' + line);

  try {
    const req = JSON.parse(line);
    if (!req || typeof req !== 'object') return;

    const { id, method, params } = req;
    const isNotification = id === undefined || id === null;

    // Handle notifications silently (never reply to notifications per JSON-RPC 2.0 spec)
    if (isNotification || (typeof method === 'string' && method.startsWith('notifications/'))) {
      return;
    }

    if (method === 'initialize') {
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
        serverInfo: {
          name: 'adobe-developer-console',
          version: '1.0.0',
        },
      });
    } else if (method === 'ping') {
      sendResponse(id, {});
    } else if (method === 'tools/list') {
      sendResponse(id, {
        tools: TOOLS,
      });
    } else if (method === 'resources/list') {
      sendResponse(id, {
        resources: [],
      });
    } else if (method === 'prompts/list') {
      sendResponse(id, {
        prompts: [],
      });
    } else if (method === 'tools/call') {
      const { name, arguments: args } = params || {};

      if (name === 'get_adobe_workspace_info') {
        sendResponse(id, {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  orgId: ADOBE_ORG_ID,
                  projectId: ADOBE_PROJECT_ID,
                  workspaceId: ADOBE_WORKSPACE_ID,
                  consoleUrl: ADOBE_CONSOLE_URL,
                  status: 'configured',
                },
                null,
                2,
              ),
            },
          ],
        });
      } else if (name === 'get_firefly_pbr_texture_specs') {
        const layer = args?.layer || 'skin';
        const specs = {
          skin: { roughness: 0.35, metalness: 0.15, bumpScale: 0.04, emissiveHex: '#0284c7' },
          muscle: { roughness: 0.45, metalness: 0.25, bumpScale: 0.08, emissiveHex: '#0d9488' },
          skeleton: { roughness: 0.25, metalness: 0.1, bumpScale: 0.03, emissiveHex: '#e2e8f0' },
          organs: { roughness: 0.3, metalness: 0.2, bumpScale: 0.06, emissiveHex: '#f43f5e' },
        };

        sendResponse(id, {
          content: [
            {
              type: 'text',
              text: JSON.stringify(specs[layer] || specs.skin, null, 2),
            },
          ],
        });
      } else {
        sendError(id, -32601, `Method not found: ${name}`);
      }
    } else {
      sendError(id, -32601, `Method not found: ${method}`);
    }
  } catch (err) {
    // Silent ignore on parse error to protect stdio
  }
});

function sendResponse(id, result) {
  if (id === undefined || id === null) return;
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id,
    result,
  });
  process.stdout.write(payload + '\n');
}

function sendError(id, code, message) {
  if (id === undefined || id === null) return;
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id,
    error: { code, message },
  });
  process.stdout.write(payload + '\n');
}
