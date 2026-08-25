import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

/**
 * Pocket-Gull Zenodo REST API Release & Metadata Synchronizer
 * 
 * Usage:
 *   node scripts/zenodo-sync.mjs [--verify|--list|--sync]
 */

const ZENODO_API_BASE = 'https://zenodo.org/api';
const ACCESS_TOKEN = process.env.ZENODO_ACCESS_TOKEN || process.env.ZENODO_TOKEN;

async function checkAuthentication() {
    if (!ACCESS_TOKEN) {
        console.log('⚠️  No ZENODO_ACCESS_TOKEN environment variable found.');
        console.log('ℹ️  To authenticate with the Zenodo REST API:');
        console.log('    1. Generate a Personal Access Token on https://zenodo.org/account/settings/applications/tokens/new/');
        console.log('    2. Export token: $env:ZENODO_ACCESS_TOKEN="your_token_here"');
        console.log('    3. Re-run: node scripts/zenodo-sync.mjs --list\n');
        
        console.log('Testing unauthenticated request to /api/deposit/depositions (expecting 401)...');
        try {
            const res = await fetch(`${ZENODO_API_BASE}/deposit/depositions`);
            console.log(`Status Code: ${res.status}`);
            const data = await res.json();
            console.log('Response Payload:', JSON.stringify(data, null, 2));
        } catch (err) {
            console.error('Error fetching Zenodo endpoint:', err.message);
        }
        return false;
    }

    console.log('🔑 Authenticating with Zenodo REST API using Bearer token...');
    try {
        const res = await fetch(`${ZENODO_API_BASE}/deposit/depositions`, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Status Code: ${res.status}`);
        if (res.ok) {
            const depositions = await res.json();
            console.log(`✅ Successfully authenticated! Found ${depositions.length} deposition record(s).`);
            console.log(JSON.stringify(depositions, null, 2));
            return true;
        } else {
            const errData = await res.json();
            console.error('❌ Authentication failed:', JSON.stringify(errData, null, 2));
            return false;
        }
    } catch (err) {
        console.error('❌ Network error connecting to Zenodo:', err.message);
        return false;
    }
}

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function validateLocalMetadata() {
    const zenodoJsonPath = path.resolve(__dirname, '../.zenodo.json');
    if (!fs.existsSync(zenodoJsonPath)) {
        console.error('❌ .zenodo.json file missing from repository root.');
        return false;
    }

    try {
        const raw = fs.readFileSync(zenodoJsonPath, 'utf8');
        const metadata = JSON.parse(raw);
        console.log('✅ .zenodo.json valid JSON format.');
        console.log('📦 Title:', metadata.title);
        console.log('🏷️  Version:', metadata.version);
        console.log('⚖️  License:', metadata.license);
        console.log('👤 Creators:', metadata.creators.map(c => `${c.name} (${c.orcid || 'No ORCID'})`).join(', '));
        return true;
    } catch (err) {
        console.error('❌ Invalid .zenodo.json file:', err.message);
        return false;
    }
}

async function main() {
    console.log('🌌 Pocket-Gull Zenodo REST API CLI Tool\n');
    await validateLocalMetadata();
    console.log('\n--- Checking API Endpoint Status ---');
    await checkAuthentication();
}

main().catch(console.error);
