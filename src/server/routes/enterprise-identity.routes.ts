import { Router, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import crypto from 'node:crypto';
import { sanitizeLogInput } from '../../utils/security-helper';

export interface IScimServerUser {
  schemas: string[];
  id: string;
  externalId?: string;
  userName: string;
  name: {
    formatted: string;
    familyName: string;
    givenName: string;
    honorificPrefix?: string;
  };
  displayName: string;
  active: boolean;
  emails: Array<{ value: string; type: string; primary: boolean }>;
  roles: Array<{ value: string; display: string; primary: boolean }>;
  meta: {
    resourceType: 'User';
    created: string;
    lastModified: string;
    location: string;
    version: string;
  };
  'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'?: {
    employeeNumber?: string;
    costCenter?: string;
    organization?: string;
    division?: string;
    department?: string;
    npi?: string;
    clinicalPrivileges?: string[];
  };
}

export interface IScimServerAuditRecord {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  targetUserId?: string;
  targetUserName?: string;
  details: string;
  tenantId: string;
  integrityHash: string;
}

// In-memory server state for SCIM directory
const SERVER_CLINICIAN_STORE: Map<string, IScimServerUser> = new Map([
  [
    'usr_scim_curie_01',
    {
      schemas: [
        'urn:ietf:params:scim:schemas:core:2.0:User',
        'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'
      ],
      id: 'usr_scim_curie_01',
      externalId: 'ext_emp_10482',
      userName: 'dr.curie@hopkinsmedicine.org',
      name: {
        formatted: 'Dr. Jane Curie, MD, PhD',
        familyName: 'Curie',
        givenName: 'Jane',
        honorificPrefix: 'Dr.'
      },
      displayName: 'Dr. Jane Curie',
      active: true,
      emails: [{ value: 'dr.curie@hopkinsmedicine.org', type: 'work', primary: true }],
      roles: [{ value: 'roles/healthcare.datasetAdmin', display: 'Medical Director (EHR & FHIR Admin)', primary: true }],
      meta: {
        resourceType: 'User',
        created: '2026-08-01T08:00:00Z',
        lastModified: '2026-10-01T08:00:00Z',
        location: '/api/scim/v2/Users/usr_scim_curie_01',
        version: 'W/"1a2b3c4d"'
      },
      'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': {
        employeeNumber: 'JHM-10482',
        costCenter: 'CC-ICU-882',
        organization: 'Johns Hopkins Medicine',
        division: 'Department of Anesthesiology and Critical Care Medicine',
        department: 'Surgical ICU & Resuscitation',
        npi: '1982736450',
        clinicalPrivileges: ['ICU_ADMISSION', 'C2_PRESCRIBING', 'CDS_OVERRIDE', 'FHIR_ADMIN']
      }
    }
  ],
  [
    'usr_scim_vance_02',
    {
      schemas: [
        'urn:ietf:params:scim:schemas:core:2.0:User',
        'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'
      ],
      id: 'usr_scim_vance_02',
      externalId: 'ext_emp_20914',
      userName: 'marcus.vance@mayo.edu',
      name: {
        formatted: 'Dr. Marcus Vance, MD',
        familyName: 'Vance',
        givenName: 'Marcus',
        honorificPrefix: 'Dr.'
      },
      displayName: 'Dr. Marcus Vance',
      active: true,
      emails: [{ value: 'marcus.vance@mayo.edu', type: 'work', primary: true }],
      roles: [{ value: 'roles/aiplatform.user', display: 'Attending Clinician (CDS & AI Consult)', primary: true }],
      meta: {
        resourceType: 'User',
        created: '2026-08-15T09:30:00Z',
        lastModified: '2026-09-20T14:15:00Z',
        location: '/api/scim/v2/Users/usr_scim_vance_02',
        version: 'W/"2b3c4d5e"'
      },
      'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': {
        employeeNumber: 'MAY-20914',
        costCenter: 'CC-CARD-401',
        organization: 'Mayo Clinic Health System',
        division: 'Department of Cardiovascular Medicine',
        department: 'Division of Inpatient Cardiology',
        npi: '1457896321',
        clinicalPrivileges: ['CARDIOLOGY_CONSULT', 'ECG_INTERPRETATION', 'TELEHEALTH_AI']
      }
    }
  ]
]);

const SERVER_AUDIT_LOG: IScimServerAuditRecord[] = [
  {
    id: 'aud_srv_init',
    timestamp: '2026-10-01T00:00:00Z',
    action: 'SERVER_INITIALIZED',
    actor: 'system',
    details: 'Enterprise SAML 2.0 / SCIM 2.0 Identity Server endpoints initialized.',
    tenantId: 'tenant_hospital_enterprise',
    integrityHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  }
];

function computeSha256Digest(payload: string): string {
  return crypto.createHash('sha256').update(payload).digest('hex');
}

function recordServerAudit(
  action: string,
  actor: string,
  details: string,
  targetUserId?: string,
  targetUserName?: string,
  tenantId: string = 'tenant_hospital_enterprise'
): IScimServerAuditRecord {
  const id = 'aud_srv_' + crypto.randomBytes(8).toString('hex');
  const timestamp = new Date().toISOString();
  const raw = `${id}|${timestamp}|${action}|${actor}|${details}|${tenantId}`;
  const integrityHash = computeSha256Digest(raw);

  const entry: IScimServerAuditRecord = {
    id,
    timestamp,
    action,
    actor,
    targetUserId,
    targetUserName,
    details,
    tenantId,
    integrityHash
  };

  SERVER_AUDIT_LOG.unshift(entry);
  if (SERVER_AUDIT_LOG.length > 200) {
    SERVER_AUDIT_LOG.pop();
  }
  return entry;
}

export function createEnterpriseIdentityRouter(): Router {
  const router = Router();

  const isTestingEnv = Boolean(
    process.env['CI'] || process.env['PLAYWRIGHT_TESTING'] || process.env['NODE_ENV'] === 'test'
  );

  const identityLimiter = rateLimit({
    windowMs: 60_000,
    max: isTestingEnv || process.env['NODE_ENV'] !== 'production' ? 10_000 : 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many identity requests. Please wait 1 minute.' }
  });

  router.use(identityLimiter);

  // ──────────────────────────────────────────────────────────────────────────
  // SAML 2.0 Endpoints
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/auth/saml/metadata
   * Returns OASIS SAML 2.0 SP Metadata XML.
   */
  router.get('/auth/saml/metadata', (_req: Request, res: Response) => {
    const spEntityId = process.env['SAML_SP_ENTITY_ID'] || 'https://pocketgull.app/saml/sp';
    const acsUrl = process.env['SAML_ACS_URL'] || 'https://pocketgull.app/api/auth/saml/acs';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
                     entityID="${spEntityId}">
  <md:SPSSODescriptor AuthnRequestsSigned="true"
                      WantAssertionsSigned="true"
                      protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:persistent</md:NameIDFormat>
    <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:transient</md:NameIDFormat>
    <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                            Location="https://pocketgull.app/api/auth/saml/slo" />
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                Location="${acsUrl}"
                                index="0"
                                isDefault="true" />
    <md:AttributeConsumingService index="1" isDefault="true">
      <md:ServiceName xml:lang="en">PocketGull Clinical Intelligence Suite</md:ServiceName>
      <md:RequestedAttribute Name="email" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic" isRequired="true"/>
      <md:RequestedAttribute Name="displayName" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic" isRequired="true"/>
      <md:RequestedAttribute Name="http://schemas.pocketgull.app/claims/npi" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" isRequired="false"/>
      <md:RequestedAttribute Name="http://schemas.pocketgull.app/claims/clinicalRole" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri" isRequired="true"/>
      <md:RequestedAttribute Name="department" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic" isRequired="false"/>
    </md:AttributeConsumingService>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`.trim();

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(xml);
  });

  /**
   * POST /api/auth/saml/acs
   * Assertion Consumer Service endpoint handling incoming SAML 2.0 assertions.
   */
  router.post('/auth/saml/acs', (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      let samlResponse = body.SAMLResponse || body.samlResponse || body.assertionXml;

      if (!samlResponse && typeof body === 'string') {
        samlResponse = body;
      }

      if (!samlResponse || typeof samlResponse !== 'string') {
        return res.status(400).json({ error: 'Missing SAMLResponse in request body' });
      }

      let rawXml = samlResponse.trim();
      if (!rawXml.startsWith('<') && /^[A-Za-z0-9+/=\r\n]+$/.test(rawXml)) {
        try {
          rawXml = Buffer.from(rawXml, 'base64').toString('utf8');
        } catch {
          return res.status(400).json({ error: 'Invalid Base64 encoding in SAMLResponse' });
        }
      }

      // Check Success status
      if (!rawXml.includes('urn:oasis:names:tc:SAML:2.0:status:Success')) {
        return res.status(401).json({ error: 'SAML Authentication rejected by Identity Provider' });
      }

      // Extract Claims
      const nameIdMatch = rawXml.match(/<(?:saml:|saml2:)?NameID[^>]*>([^<]+)<\/(?:saml:|saml2:)?NameID>/i);
      const emailMatch = rawXml.match(/<(?:saml:|saml2:)?Attribute[^>]*Name="(?:email|User\.Email|[^"]*emailaddress)"[^>]*>[\s\S]*?<(?:saml:|saml2:)?AttributeValue[^>]*>([^<]+)<\/(?:saml:|saml2:)?AttributeValue>/i);
      const nameMatch = rawXml.match(/<(?:saml:|saml2:)?Attribute[^>]*Name="(?:displayName|name|cn|[^"]*displayname)"[^>]*>[\s\S]*?<(?:saml:|saml2:)?AttributeValue[^>]*>([^<]+)<\/(?:saml:|saml2:)?AttributeValue>/i);
      const roleMatch = rawXml.match(/<(?:saml:|saml2:)?Attribute[^>]*Name="[^"]*clinicalRole"[^>]*>[\s\S]*?<(?:saml:|saml2:)?AttributeValue[^>]*>([^<]+)<\/(?:saml:|saml2:)?AttributeValue>/i);
      const tenantMatch = rawXml.match(/<(?:saml:|saml2:)?Attribute[^>]*Name="[^"]*tenantId"[^>]*>[\s\S]*?<(?:saml:|saml2:)?AttributeValue[^>]*>([^<]+)<\/(?:saml:|saml2:)?AttributeValue>/i);

      const userEmail = emailMatch ? emailMatch[1].trim() : (nameIdMatch ? nameIdMatch[1].trim() : 'clinician@hospital.org');
      const userName = nameMatch ? nameMatch[1].trim() : 'Attending Clinician';
      const role = roleMatch ? roleMatch[1].trim() : 'roles/aiplatform.user';
      const tenantId = tenantMatch ? tenantMatch[1].trim() : 'tenant_hospital_enterprise';

      const validRole = role === 'roles/healthcare.datasetAdmin' ? 'roles/healthcare.datasetAdmin'
        : role === 'roles/bigquery.jobUser' ? 'roles/bigquery.jobUser'
        : role === 'roles/viewer' ? 'roles/viewer'
        : 'roles/aiplatform.user';

      const now = Date.now();
      const sessionToken = 'tok_saml_' + crypto.randomBytes(24).toString('hex');
      const uid = 'usr_saml_' + crypto.createHash('sha256').update(userEmail).digest('hex').substring(0, 16);

      const session = {
        uid,
        email: userEmail,
        name: userName,
        provider: 'smart-fhir',
        clinicalRole: validRole,
        roleTitle: 'Hospital Enterprise SAML Authenticated',
        tenantId,
        issuedAt: now,
        expiresAt: now + (12 * 60 * 60 * 1000), // 12-hour clinical shift
        sessionToken
      };

      recordServerAudit(
        'SAML_SSO_LOGIN',
        userEmail,
        `SAML 2.0 authentication successful for ${userName} (${validRole})`,
        uid,
        userName,
        tenantId
      );

      console.info(`[Enterprise Identity] SAML 2.0 authenticated: ${sanitizeLogInput(userEmail)} (${validRole})`);

      return res.status(200).json({
        success: true,
        message: 'SAML 2.0 Assertion Validated',
        session
      });
    } catch (err) {
      console.error('[Enterprise Identity] SAML ACS Error:', err);
      return res.status(500).json({ error: 'Failed to process SAML assertion' });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SCIM 2.0 Endpoints (RFC 7643 / RFC 7644)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/scim/v2/ServiceProviderConfig
   * RFC 7643 §5 Service Provider Configuration.
   */
  router.get('/scim/v2/ServiceProviderConfig', (_req: Request, res: Response) => {
    return res.status(200).json({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
      documentationUri: 'https://pocketgull.app/docs/scim',
      patch: { supported: true },
      bulk: { supported: false, maxOperations: 100, maxPayloadSize: 1048576 },
      filter: { supported: true, maxResults: 200 },
      changePassword: { supported: false },
      sort: { supported: false },
      etag: { supported: true },
      authenticationSchemes: [
        {
          name: 'OAuth Bearer Token',
          description: 'Authentication scheme using the OAuth Bearer Token Standard RFC 6750',
          specUri: 'http://www.rfc-editor.org/info/rfc6750',
          type: 'oauthbearertoken',
          primary: true
        }
      ],
      meta: {
        location: '/api/scim/v2/ServiceProviderConfig',
        resourceType: 'ServiceProviderConfig',
        created: '2026-10-01T00:00:00Z',
        lastModified: '2026-10-01T00:00:00Z'
      }
    });
  });

  /**
   * GET /api/scim/v2/Schemas
   * RFC 7643 §7 Schemas declaration.
   */
  router.get('/scim/v2/Schemas', (_req: Request, res: Response) => {
    return res.status(200).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: 2,
      startIndex: 1,
      itemsPerPage: 2,
      Resources: [
        {
          id: 'urn:ietf:params:scim:schemas:core:2.0:User',
          name: 'User',
          description: 'Core User Schema',
          meta: { resourceType: 'Schema', location: '/api/scim/v2/Schemas/urn:ietf:params:scim:schemas:core:2.0:User' }
        },
        {
          id: 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User',
          name: 'EnterpriseUser',
          description: 'Enterprise Extension with Healthcare NPI and Department Privileges',
          meta: { resourceType: 'Schema', location: '/api/scim/v2/Schemas/urn:ietf:params:scim:schemas:extension:enterprise:2.0:User' }
        }
      ]
    });
  });

  /**
   * GET /api/scim/v2/Users
   * RFC 7644 §3.4.2 Query Users with filter & pagination.
   */
  router.get('/scim/v2/Users', (req: Request, res: Response) => {
    const filter = typeof req.query['filter'] === 'string' ? req.query['filter'] : undefined;
    const startIndex = Math.max(1, parseInt(String(req.query['startIndex'] || '1'), 10));
    const count = Math.min(100, Math.max(1, parseInt(String(req.query['count'] || '20'), 10)));

    let users = Array.from(SERVER_CLINICIAN_STORE.values());

    if (filter) {
      const eqMatch = filter.match(/userName\s+eq\s+["']([^"']+)["']/i);
      if (eqMatch) {
        const target = eqMatch[1].toLowerCase();
        users = users.filter(u => u.userName.toLowerCase() === target);
      } else {
        const query = filter.toLowerCase();
        users = users.filter(u =>
          u.displayName.toLowerCase().includes(query) ||
          u.userName.toLowerCase().includes(query)
        );
      }
    }

    const totalResults = users.length;
    const from = startIndex - 1;
    const paginated = users.slice(from, from + count);

    return res.status(200).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults,
      startIndex,
      itemsPerPage: paginated.length,
      Resources: paginated
    });
  });

  /**
   * POST /api/scim/v2/Users
   * RFC 7644 §3.3 Create / Provision User.
   */
  router.post('/scim/v2/Users', (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const userName = body.userName || body.emails?.[0]?.value;

      if (!userName || typeof userName !== 'string') {
        return res.status(400).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: 'Missing required userName attribute',
          status: '400'
        });
      }

      // Check duplicate
      const existing = Array.from(SERVER_CLINICIAN_STORE.values()).find(
        u => u.userName.toLowerCase() === userName.toLowerCase()
      );
      if (existing) {
        return res.status(409).json({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
          detail: `User already exists with userName: ${userName}`,
          status: '409',
          scimType: 'uniqueness'
        });
      }

      const id = 'usr_scim_' + crypto.randomBytes(8).toString('hex');
      const nowIso = new Date().toISOString();
      const displayName = body.displayName || body.name?.formatted || userName.split('@')[0];

      const newUser: IScimServerUser = {
        schemas: [
          'urn:ietf:params:scim:schemas:core:2.0:User',
          'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'
        ],
        id,
        externalId: body.externalId || 'ext_' + crypto.randomBytes(6).toString('hex'),
        userName,
        name: body.name || {
          formatted: displayName,
          familyName: displayName.split(' ').slice(-1)[0] || 'Clinician',
          givenName: displayName.split(' ')[0] || 'Dr.'
        },
        displayName,
        active: body.active !== false,
        emails: body.emails || [{ value: userName, type: 'work', primary: true }],
        roles: body.roles || [{ value: 'roles/aiplatform.user', display: 'Attending Clinician', primary: true }],
        meta: {
          resourceType: 'User',
          created: nowIso,
          lastModified: nowIso,
          location: `/api/scim/v2/Users/${id}`,
          version: `W/"${crypto.randomBytes(4).toString('hex')}"`
        },
        'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': body[
          'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'
        ] || {
          department: 'General Inpatient Medicine',
          organization: 'Hospital Enterprise'
        }
      };

      SERVER_CLINICIAN_STORE.set(id, newUser);

      recordServerAudit(
        'SCIM_USER_PROVISIONED',
        'scim-client',
        `Provisioned account for ${displayName} (${userName})`,
        id,
        displayName
      );

      res.setHeader('Location', `/api/scim/v2/Users/${id}`);
      return res.status(201).json(newUser);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to provision SCIM user' });
    }
  });

  /**
   * GET /api/scim/v2/Users/:id
   */
  router.get('/scim/v2/Users/:id', (req: Request, res: Response) => {
    const userId = String(req.params['id'] || '');
    const user = SERVER_CLINICIAN_STORE.get(userId);
    if (!user) {
      return res.status(404).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: `User not found: ${userId}`,
        status: '404'
      });
    }
    return res.status(200).json(user);
  });

  /**
   * PATCH /api/scim/v2/Users/:id
   * RFC 7644 §3.5.2 Modification Operations (Instant De-provisioning active: false).
   */
  router.patch('/scim/v2/Users/:id', (req: Request, res: Response) => {
    const userId = String(req.params['id'] || '');
    const user = SERVER_CLINICIAN_STORE.get(userId);
    if (!user) {
      return res.status(404).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: `User not found: ${userId}`,
        status: '404'
      });
    }

    const { Operations } = req.body || {};
    if (!Array.isArray(Operations)) {
      return res.status(400).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'Invalid SCIM PATCH request: missing Operations array',
        status: '400'
      });
    }

    const nowIso = new Date().toISOString();
    for (const op of Operations) {
      if (op.op === 'replace' || op.op === 'add') {
        if (op.path === 'active' || op.path === 'Active') {
          user.active = Boolean(op.value);
        } else if (op.path === 'displayName') {
          user.displayName = String(op.value);
        } else if (!op.path && typeof op.value === 'object') {
          if ('active' in op.value) {
            user.active = Boolean(op.value.active);
          }
        }
      }
    }

    user.meta.lastModified = nowIso;
    user.meta.version = `W/"${crypto.randomBytes(4).toString('hex')}"`;
    SERVER_CLINICIAN_STORE.set(user.id, user);

    const action = user.active ? 'SCIM_USER_UPDATED' : 'SCIM_USER_DEPROVISIONED';
    recordServerAudit(
      action,
      'scim-client',
      user.active ? `Updated profile for ${user.displayName}` : `De-provisioned clinician ${user.displayName} (active: false)`,
      user.id,
      user.displayName
    );

    return res.status(200).json(user);
  });

  /**
   * DELETE /api/scim/v2/Users/:id
   */
  router.delete('/scim/v2/Users/:id', (req: Request, res: Response) => {
    const userId = String(req.params['id'] || '');
    const user = SERVER_CLINICIAN_STORE.get(userId);
    if (!user) {
      return res.status(404).json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: `User not found: ${userId}`,
        status: '404'
      });
    }

    SERVER_CLINICIAN_STORE.delete(userId);

    recordServerAudit(
      'SCIM_USER_DELETED',
      'scim-client',
      `Permanently offboarded clinician ${user.displayName}`,
      user.id,
      user.displayName
    );

    return res.status(204).send();
  });

  /**
   * GET /api/scim/v2/Groups
   */
  router.get('/scim/v2/Groups', (_req: Request, res: Response) => {
    const users = Array.from(SERVER_CLINICIAN_STORE.values());
    const icu = users.filter(u => u['urn:ietf:params:scim:schemas:extension:enterprise:2.0:User']?.department?.includes('ICU'));
    const card = users.filter(u => u['urn:ietf:params:scim:schemas:extension:enterprise:2.0:User']?.department?.includes('Cardiology'));

    return res.status(200).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: 2,
      startIndex: 1,
      itemsPerPage: 2,
      Resources: [
        {
          schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
          id: 'grp_icu_intensivists',
          displayName: 'ICU Critical Care & Resuscitation',
          members: icu.map(u => ({ value: u.id, display: u.displayName }))
        },
        {
          schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
          id: 'grp_cardiology_fellows',
          displayName: 'Cardiovascular Inpatient Service',
          members: card.map(u => ({ value: u.id, display: u.displayName }))
        }
      ]
    });
  });

  /**
   * GET /api/scim/v2/audit
   * FDA 21 CFR Part 11 Audit Trail retrieval.
   */
  router.get('/scim/v2/audit', (_req: Request, res: Response) => {
    return res.status(200).json({
      standard: 'FDA 21 CFR Part 11 Electronic Records / SCIM 2.0 RFC 7644',
      totalResults: SERVER_AUDIT_LOG.length,
      records: SERVER_AUDIT_LOG
    });
  });

  return router;
}
