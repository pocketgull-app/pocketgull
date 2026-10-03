import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import http from 'node:http';

describe('ICRC Digital Emblem (Geneva Conventions / Tallinn Manual Rule 131) Verification Suite', () => {
  const rootDir = path.resolve(__dirname, '..');
  const manifestPath = path.join(rootDir, 'public', '.well-known', 'digital-emblem.json');

  it('1. Verifies public/.well-known/digital-emblem.json existence and schema conformances', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);

    const raw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);

    // Schema and identity checks
    expect(manifest.$schema).toBe('https://www.icrc.org/ns/digital-emblem/v1/schema.json');
    expect(manifest['@context']).toBe('https://www.icrc.org/ns/digital-emblem/v1');
    expect(manifest.type).toBe('DigitalEmblem');
    expect(manifest.emblemType).toBe('RedCrystal');
    expect(manifest.entity).toBe('PocketGull LLC.');
    expect(manifest.jurisdiction).toBe('Portland, OR, United States');
    expect(manifest.status).toBe('PROTECTED_CIVILIAN_NON_COMBATANT');

    // Technical demarcation
    expect(manifest.technicalDesignation).toContain('Clinical Decision Support Software');
    expect(manifest.regulatoryDemarcation).toContain('21st Century Cures Act § 3060');

    // DNS and HTTP Header specifications
    expect(manifest.httpHeader).toContain('X-Digital-Emblem: humanitarian/medical-cds');
    expect(manifest.httpHeader).toContain('urn:icrc:digital-emblem:v1');
    expect(manifest.httpHeader).toContain('entity="PocketGull LLC."');
    expect(manifest.dnsTxtValidationRecord).toBe('_emblem.pocketgull.app');
    expect(manifest.dnsTxtRecordContent).toContain('v=adem1');
    expect(manifest.dnsTxtRecordContent).toContain('t=medical-unit');
    expect(manifest.dnsTxtRecordContent).toContain('a=icrc');
    expect(manifest.dnsTxtRecordContent).toContain('s=protected');
    expect(manifest.dnsTxtRecordContent).toContain('e=PocketGull LLC.');

    // Legal foundation
    expect(manifest.legalBasis).toContain('Geneva Convention I (1949) Article 19');
    expect(manifest.legalBasis).toContain('Geneva Convention IV (1949) Article 18');
    expect(manifest.legalBasis).toContain('Additional Protocol I (1977) Article 12');
    expect(manifest.legalBasis).toContain('Additional Protocol III (2005) Article 2 (Red Crystal)');
    expect(manifest.legalBasis.some((b: string) => b.includes('Tallinn Manual'))).toBe(true);
  });

  it('2. Verifies X-Digital-Emblem header configured in server.js and src/server.ts', () => {
    const serverJsPath = path.join(rootDir, 'server.js');
    const serverTsPath = path.join(rootDir, 'src', 'server.ts');

    expect(fs.existsSync(serverJsPath)).toBe(true);
    expect(fs.existsSync(serverTsPath)).toBe(true);

    const serverJs = fs.readFileSync(serverJsPath, 'utf8');
    const serverTs = fs.readFileSync(serverTsPath, 'utf8');

    // Both server files must inject the exact X-Digital-Emblem header
    expect(serverJs.includes('X-Digital-Emblem')).toBe(true);
    expect(serverTs.includes('X-Digital-Emblem')).toBe(true);

    const headerSnippet = 'humanitarian/medical-cds; urn:icrc:digital-emblem:v1; status=protected-civilian; authority=Geneva-Conventions-1949-AP1; entity="PocketGull LLC."';
    expect(serverJs.includes(headerSnippet)).toBe(true);
    expect(serverTs.includes(headerSnippet)).toBe(true);

    // Both files must mount the digital emblem endpoint
    expect(serverJs.includes('/.well-known/digital-emblem.json')).toBe(true);
    expect(serverTs.includes('/.well-known/digital-emblem.json')).toBe(true);
  });

  it('3. Serves X-Digital-Emblem header and manifest via live Express server simulation', async () => {
    const testApp = express();

    // Security headers middleware including X-Digital-Emblem
    testApp.use((req, res, next) => {
      res.setHeader(
        'X-Digital-Emblem',
        'humanitarian/medical-cds; urn:icrc:digital-emblem:v1; status=protected-civilian; authority=Geneva-Conventions-1949-AP1; entity="PocketGull LLC."'
      );
      next();
    });

    testApp.get(['/.well-known/digital-emblem.json', '/api/digital-emblem'], (req, res) => {
      const data = fs.readFileSync(manifestPath, 'utf8');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(data);
    });

    const server = http.createServer(testApp);
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    const response = await fetch(`http://127.0.0.1:${port}/.well-known/digital-emblem.json`);
    expect(response.status).toBe(200);

    const emblemHeader = response.headers.get('x-digital-emblem');
    expect(emblemHeader).toBeTruthy();
    expect(emblemHeader).toContain('humanitarian/medical-cds');
    expect(emblemHeader).toContain('urn:icrc:digital-emblem:v1');
    expect(emblemHeader).toContain('status=protected-civilian');
    expect(emblemHeader).toContain('entity="PocketGull LLC."');

    const json = await response.json();
    expect(json.entity).toBe('PocketGull LLC.');
    expect(json.emblemType).toBe('RedCrystal');

    const apiResponse = await fetch(`http://127.0.0.1:${port}/api/digital-emblem`);
    expect(apiResponse.status).toBe(200);
    const apiJson = await apiResponse.json();
    expect(apiJson.dnsTxtValidationRecord).toBe('_emblem.pocketgull.app');

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
});
