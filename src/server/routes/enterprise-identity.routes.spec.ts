// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect, afterEach } from 'vitest';
import crypto from 'node:crypto';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { createEnterpriseIdentityRouter } from './enterprise-identity.routes';
import { verifySessionToken } from '../middleware/auth-guard';

describe('Enterprise Identity Routes (Fail-Closed SAML 2.0 XML Signature & Auth-Gated SCIM 2.0)', () => {
  afterEach(() => {
    delete process.env['SAML_IDP_CERT'];
    delete process.env['SCIM_BEARER_TOKEN'];
  });

  async function withIdentityServer(fn: (baseUrl: string) => Promise<void>): Promise<void> {
    const app = express();
    app.use(express.json());
    app.use('/api', createEnterpriseIdentityRouter());
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    try {
      const { port } = server.address() as AddressInfo;
      await fn(`http://127.0.0.1:${port}`);
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  }

  it('1. GET /api/auth/saml/metadata returns valid OASIS SAML 2.0 XML', async () => {
    await withIdentityServer(async baseUrl => {
      const res = await fetch(`${baseUrl}/api/auth/saml/metadata`);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('application/xml');
      const xml = await res.text();
      expect(xml).toContain('<md:EntityDescriptor');
      expect(xml).toContain('WantAssertionsSigned="true"');
    });
  });

  it('2. POST /api/auth/saml/acs fails closed with 501 when SAML_IDP_CERT is not configured', async () => {
    const unsignedXml = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
      <samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status>
      <saml:Assertion ID="asn_unsigned"><saml:Subject><saml:NameID>dr.reed@hopkinsmedicine.org</saml:NameID></saml:Subject></saml:Assertion>
    </samlp:Response>`;

    await withIdentityServer(async baseUrl => {
      const res = await fetch(`${baseUrl}/api/auth/saml/acs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ SAMLResponse: unsignedXml })
      });
      expect(res.status).toBe(501);
    });
  });

  it('3. POST /api/auth/saml/acs rejects unsigned or tampered XML with 401 and accepts validly signed RSA-SHA256 SAML', async () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    process.env['SAML_IDP_CERT'] = publicKey;

    const signedInfoXml = `<ds:SignedInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/><ds:Reference URI="#asn_123"><ds:DigestValue>abc123</ds:DigestValue></ds:Reference></ds:SignedInfo>`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signedInfoXml, 'utf8');
    signer.end();
    const validSignatureB64 = signer.sign(privateKey).toString('base64');

    const signedXml = `<?xml version="1.0"?>
    <samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
      <samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status>
      <saml:Assertion ID="asn_123">
        <ds:Signature>${signedInfoXml}<ds:SignatureValue>${validSignatureB64}</ds:SignatureValue></ds:Signature>
        <saml:Subject><saml:NameID>dr.reed@hopkinsmedicine.org</saml:NameID></saml:Subject>
        <saml:AttributeStatement>
          <saml:Attribute Name="displayName"><saml:AttributeValue>Dr. Walter Reed</saml:AttributeValue></saml:Attribute>
          <saml:Attribute Name="email"><saml:AttributeValue>dr.reed@hopkinsmedicine.org</saml:AttributeValue></saml:Attribute>
          <saml:Attribute Name="clinicalRole"><saml:AttributeValue>roles/healthcare.datasetAdmin</saml:AttributeValue></saml:Attribute>
        </saml:AttributeStatement>
      </saml:Assertion>
    </samlp:Response>`;

    const forgedXml = signedXml.replace(validSignatureB64, Buffer.from('forged-sig').toString('base64'));

    await withIdentityServer(async baseUrl => {
      // Forged signature rejected with 401
      const badRes = await fetch(`${baseUrl}/api/auth/saml/acs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ SAMLResponse: forgedXml })
      });
      expect(badRes.status).toBe(401);

      // Validly signed SAML accepted with verifiable HMAC session token
      const okRes = await fetch(`${baseUrl}/api/auth/saml/acs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ SAMLResponse: signedXml })
      });
      expect(okRes.status).toBe(200);
      const data = await okRes.json() as any;
      expect(data.success).toBe(true);
      expect(data.session.email).toBe('dr.reed@hopkinsmedicine.org');
      expect(verifySessionToken(data.session.sessionToken)).not.toBeNull();
    });
  });

  it('4. Gates all /api/scim/v2/* routes behind constant-time Bearer token auth', async () => {
    const testScimSecret = 'scim_test_' + crypto.randomBytes(16).toString('hex');
    process.env['SCIM_BEARER_TOKEN'] = testScimSecret;

    await withIdentityServer(async baseUrl => {
      // Unauthenticated SCIM call MUST fail with 401
      const unauthRes = await fetch(`${baseUrl}/api/scim/v2/Users`);
      expect(unauthRes.status).toBe(401);

      // Wrong Bearer token MUST fail with 401
      const badTokenRes = await fetch(`${baseUrl}/api/scim/v2/Users`, {
        headers: { Authorization: 'Bearer wrong_token_value' }
      });
      expect(badTokenRes.status).toBe(401);

      // Valid SCIM Bearer token succeeds across Users, Provision, Patch, Delete, Audit
      const authHeaders = {
        Authorization: `Bearer ${testScimSecret}`,
        'Content-Type': 'application/json'
      };

      const listRes = await fetch(`${baseUrl}/api/scim/v2/Users?count=10`, { headers: authHeaders });
      expect(listRes.status).toBe(200);
      const listData = await listRes.json() as any;
      expect(listData.totalResults).toBeGreaterThanOrEqual(2);

      const createRes = await fetch(`${baseUrl}/api/scim/v2/Users`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          userName: `dr.salk.${Date.now()}@hospital.org`,
          displayName: 'Dr. Jonas Salk, MD'
        })
      });
      expect(createRes.status).toBe(201);
      const created = await createRes.json() as any;

      const patchRes = await fetch(`${baseUrl}/api/scim/v2/Users/${created.id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          Operations: [{ op: 'replace', path: 'active', value: false }]
        })
      });
      expect(patchRes.status).toBe(200);
      expect((await patchRes.json() as any).active).toBe(false);

      const delRes = await fetch(`${baseUrl}/api/scim/v2/Users/${created.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      expect(delRes.status).toBe(204);

      const auditRes = await fetch(`${baseUrl}/api/scim/v2/audit`, { headers: authHeaders });
      expect(auditRes.status).toBe(200);
      const auditData = await auditRes.json() as any;
      expect(auditData.records[0].integrityHash).toBeDefined();
    });
  });
});
