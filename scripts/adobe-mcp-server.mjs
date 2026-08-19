#!/usr/bin/env node
/**
 * Adobe Developer Console & Firefly PBR Texture MCP Server
 * STDIO Model Context Protocol server exposing Adobe Console & Firefly metadata tools.
 */

import readline from 'readline';

const ADOBE_ORG_ID = process.env.ADOBE_ORG_ID || '00AF226E687833EB0A495CEE@AdobeOrg';
const ADOBE_PROJECT_ID = process.env.ADOBE_PROJECT_ID || '224161';
const ADOBE_WORKSPACE_ID = process.env.ADOBE_WORKSPACE_ID || '4566206088345737575';
const ADOBE_CONSOLE_URL = process.env.ADOBE_CONSOLE_URL || 'https://developer.adobe.com/console/projects/224161/4566206088345737575/overview';

const TOOLS = [
  {
    name: 'get_adobe_workspace_info',
    description: 'Retrieves Adobe Developer Console project, workspace, and organization metadata.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_firefly_pbr_texture_specs',
    description: 'Retrieves Edwin Smith Surgical Codex PBR texture specifications for anatomical 3D rendering.',
    inputSchema: {
      type: 'object',
      properties: {
        layer: {
          type: 'string',
          enum: ['skin', 'muscle', 'skeleton', 'organs'],
          description: 'Anatomical tissue layer type'
        }
      },
      required: ['layer']
    }
  }
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line.trim()) return;

  try {
    const req = JSON.parse(line);
    const { id, method, params } = req;

    if (method === 'initialize') {
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'adobe-developer-console',
          version: '1.0.0'
        }
      });
    } else if (method === 'tools/list') {
      sendResponse(id, {
        tools: TOOLS
      });
    } else if (method === 'tools/call') {
      const { name, arguments: args } = params || {};

      if (name === 'get_adobe_workspace_info') {
        sendResponse(id, {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                orgId: ADOBE_ORG_ID,
                projectId: ADOBE_PROJECT_ID,
                workspaceId: ADOBE_WORKSPACE_ID,
                consoleUrl: ADOBE_CONSOLE_URL,
                status: 'configured'
              }, null, 2)
            }
          ]
        });
      } else if (name === 'get_firefly_pbr_texture_specs') {
        const layer = args?.layer || 'skin';
        const specs = {
          skin: { roughness: 0.35, metalness: 0.15, bumpScale: 0.04, emissiveHex: '#0284c7' },
          muscle: { roughness: 0.45, metalness: 0.25, bumpScale: 0.08, emissiveHex: '#0d9488' },
          skeleton: { roughness: 0.25, metalness: 0.10, bumpScale: 0.03, emissiveHex: '#e2e8f0' },
          organs: { roughness: 0.30, metalness: 0.20, bumpScale: 0.06, emissiveHex: '#f43f5e' }
        };

        sendResponse(id, {
          content: [
            {
              type: 'text',
              text: JSON.stringify(specs[layer] || specs.skin, null, 2)
            }
          ]
        });
      } else {
        sendError(id, -32601, `Method not found: ${name}`);
      }
    } else if (method === 'notifications/initialized') {
      // No response needed for initialized notification
    } else {
      sendError(id, -32601, `Unknown method: ${method}`);
    }
  } catch (err) {
    // Silent ignore on parse error to protect stdio
  }
});

function sendResponse(id, result) {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id,
    result
  });
  process.stdout.write(payload + '\n');
}

function sendError(id, code, message) {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id,
    error: { code, message }
  });
  process.stdout.write(payload + '\n');
}
