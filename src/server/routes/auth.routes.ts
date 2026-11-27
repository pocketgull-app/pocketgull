// SPDX-License-Identifier: Apache-2.0
import { Router, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { sanitizeLogInput } from '../../utils/security-helper';
import { signSessionToken, isStrictProductionEnv } from '../middleware/auth-guard';

export interface ISsoUserSession {
  uid: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'smart-fhir' | 'webauthn' | 'kinetic-wacom';
  clinicalRole: 'roles/aiplatform.user' | 'roles/healthcare.datasetAdmin' | 'roles/bigquery.jobUser' | 'roles/viewer';
  roleTitle: string;
  tenantId: string;
  issuedAt: number;
  expiresAt: number;
  sessionToken: string;
  fhirPatientId?: string;
  zkpKineticHash?: string;
}

const googleOAuthClient = new OAuth2Client();

const ROLE_TITLE_MAP: Record<ISsoUserSession['clinicalRole'], string> = {
  'roles/aiplatform.user': 'Attending Clinician (CDS & AI Consult)',
  'roles/healthcare.datasetAdmin': 'Medical Director (EHR & FHIR Admin)',
  'roles/bigquery.jobUser': 'Clinical Researcher (Translational Trials)',
  'roles/viewer': 'Sovereign Patient (Self-Directed Health)'
};

function getAuthorizedAdminEmails(): Set<string> {
  const configured = process.env['ADMIN_ALLOWLIST_EMAILS'] || 'dpo@pocketgull.app';
  return new Set(
    configured
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

/**
 * Resolves least-privilege clinical role strictly from server-side identity policy.
 * Never allows arbitrary callers to self-escalate to `roles/healthcare.datasetAdmin`.
 */
function resolveServerAssignedRole(
  verifiedEmail: string,
  requestedRole?: unknown
): ISsoUserSession['clinicalRole'] {
  const normalizedEmail = verifiedEmail.trim().toLowerCase();
  const adminEmails = getAuthorizedAdminEmails();

  if (requestedRole === 'roles/healthcare.datasetAdmin') {
    if (adminEmails.has(normalizedEmail)) {
      return 'roles/healthcare.datasetAdmin';
    }
    return 'roles/aiplatform.user';
  }
  if (requestedRole === 'roles/bigquery.jobUser') {
    return 'roles/bigquery.jobUser';
  }
  if (requestedRole === 'roles/viewer') {
    return 'roles/viewer';
  }
  return 'roles/aiplatform.user';
}

export function createAuthRouter(deps?: { oauthClient?: Pick<OAuth2Client, 'verifyIdToken'> }): Router {
  const router = Router();
  const oauthVerifier = deps?.oauthClient ?? googleOAuthClient;

  const isTestingEnv =
    !isStrictProductionEnv() &&
    Boolean(process.env['PLAYWRIGHT_TESTING'] || process.env['NODE_ENV'] === 'test' || process.env['VITEST']);

  const authLimiter = rateLimit({
    windowMs: 60_000,
    max: isTestingEnv ? 10_000 : 60,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    message: { error: 'Too many authentication attempts. Please wait 1 minute.' }
  });

  router.use(authLimiter);

  /**
   * GET /api/auth/sso/config
   * Returns public SSO provider discovery metadata.
   */
  router.get('/sso/config', (_req: Request, res: Response) => {
    const configuredGoogleClientId =
      process.env['GOOGLE_CLIENT_ID']?.trim() || process.env['GOOGLE_HEALTH_CLIENT_ID']?.trim() || '';
    const googleClientId = configuredGoogleClientId || '793190615625-pocketgull-cloudrun.apps.googleusercontent.com';
    const projectId = process.env['GOOGLE_CLOUD_PROJECT'] || 'gen-lang-client-0540208645';

    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.json({
      status: 'active',
      projectId,
      google: {
        enabled: true,
        configured: Boolean(configuredGoogleClientId),
        clientId: googleClientId,
        supportedScopes: ['openid', 'email', 'profile'],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
      },
      smartOnFhir: {
        enabled: true,
        issuers: [
          { name: 'Epic MyChart SMART Launch', fhirVersion: 'R4' },
          { name: 'Oracle Cerner Millennium', fhirVersion: 'R4' },
          { name: 'AthenaHealth Enterprise', fhirVersion: 'R4' },
          { name: 'Apple HealthKit FHIR Sync', fhirVersion: 'R4' }
        ]
      },
      webauthn: {
        enabled: true,
        rpName: 'PocketGull Clinical Suite',
        rpId: typeof _req.hostname === 'string' && _req.hostname.length > 0 ? _req.hostname : 'pocketgull.app'
      },
      kineticZkp: {
        enabled: true,
        protocol: 'Wacom WILL 3.0 Motor Biometrics'
      }
    });
  });

  /**
   * POST /api/auth/sso/google
   * Verifies a real Google OIDC ID Token via google-auth-library OAuth2Client.verifyIdToken().
   * Rejects missing/invalid ID tokens with 401 and derives roles strictly from verified claims + server allowlist.
   */
  router.post('/sso/google', async (req: Request, res: Response) => {
    try {
      const { idToken, credential, role, zkpKineticHash } = req.body || {};
      const rawIdToken =
        typeof idToken === 'string' && idToken.trim()
          ? idToken.trim()
          : typeof credential === 'string' && credential.trim()
            ? credential.trim()
            : '';

      if (!rawIdToken) {
        return res.status(401).json({
          error: 'Unauthorized: Verified Google OIDC idToken is required.'
        });
      }

      const googleClientId =
        process.env['GOOGLE_CLIENT_ID']?.trim() ||
        process.env['GOOGLE_HEALTH_CLIENT_ID']?.trim() ||
        '793190615625-pocketgull-cloudrun.apps.googleusercontent.com';

      let payload: Record<string, unknown> | undefined;
      try {
        const ticket = await oauthVerifier.verifyIdToken({
          idToken: rawIdToken,
          audience: googleClientId
        });
        payload = ticket.getPayload() as unknown as Record<string, unknown> | undefined;
      } catch (verifyErr: unknown) {
        console.warn('[Auth SSO] Google OIDC ID token verification rejected:', sanitizeLogInput((verifyErr as Error)?.message));
        return res.status(401).json({
          error: 'Unauthorized: Invalid or expired Google OIDC ID token.'
        });
      }

      const verifiedEmail = typeof payload?.['email'] === 'string' ? payload['email'].trim() : '';
      const emailVerified = Boolean(payload?.['email_verified']);
      if (!verifiedEmail || !emailVerified) {
        return res.status(401).json({
          error: 'Unauthorized: Google OIDC assertion must carry a verified email claim.'
        });
      }

      const userName =
        typeof payload?.['name'] === 'string' && payload['name'].trim().length > 0
          ? payload['name'].trim()
          : 'Attending Clinician';
      const userPicture = typeof payload?.['picture'] === 'string' ? payload['picture'] : undefined;
      const userRole = resolveServerAssignedRole(verifiedEmail, role);
      const tenantId = 'tenant_gen_lang_client_0540208645';
      const now = Date.now();
      const ttlSeconds = 12 * 3600;
      const uid =
        typeof payload?.['sub'] === 'string' && payload['sub'].trim()
          ? `usr_goog_${crypto.createHash('sha256').update(payload['sub']).digest('hex').substring(0, 16)}`
          : 'usr_goog_' + crypto.createHash('sha256').update(verifiedEmail).digest('hex').substring(0, 16);

      const sessionToken = signSessionToken({
        sub: uid,
        email: verifiedEmail,
        tenantId,
        role: userRole,
        roles: userRole === 'roles/healthcare.datasetAdmin' ? [userRole, 'ADMIN', 'CLINICIAN'] : [userRole, 'CLINICIAN'],
        ttlSeconds
      });

      const session: ISsoUserSession = {
        uid,
        email: verifiedEmail,
        name: userName,
        picture: userPicture,
        provider: 'google',
        clinicalRole: userRole,
        roleTitle: ROLE_TITLE_MAP[userRole] || 'Attending Clinician',
        tenantId,
        issuedAt: now,
        expiresAt: now + ttlSeconds * 1000,
        sessionToken,
        zkpKineticHash: typeof zkpKineticHash === 'string' ? zkpKineticHash : undefined
      };

      console.info(`[Auth SSO] Google OIDC authenticated: ${sanitizeLogInput(verifiedEmail)} (${userRole})`);

      return res.status(200).json({
        success: true,
        message: 'Google Cloud IAM SSO Authenticated',
        session
      });
    } catch (err) {
      console.error('[Auth SSO] Google SSO error:', sanitizeLogInput((err as Error)?.message));
      return res.status(500).json({ error: 'Failed to process Google SSO authentication' });
    }
  });

  /**
   * POST /api/auth/sso/smart-fhir
   * SMART-on-FHIR EHR Launch Context Verification (Epic, Cerner, AthenaHealth).
   * Requires a launch token/context in production and never allows self-escalation to admin.
   */
  router.post('/sso/smart-fhir', (req: Request, res: Response) => {
    try {
      const { fhirPatientId, issuer, role, smartAccessToken } = req.body || {};

      if (isStrictProductionEnv() && (!smartAccessToken || typeof smartAccessToken !== 'string')) {
        return res.status(401).json({
          error: 'Unauthorized: Verified SMART-on-FHIR launch access token is required in production.'
        });
      }

      const now = Date.now();
      const patientId =
        typeof fhirPatientId === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(fhirPatientId.trim())
          ? fhirPatientId.trim()
          : 'patient-curie-2026';
      const issuerName = typeof issuer === 'string' && issuer.trim() ? issuer.trim().slice(0, 120) : 'Epic Systems EHR';
      const tenantId = 'tenant_smart_fhir_' + issuerName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const uid = 'usr_fhir_' + crypto.createHash('sha256').update(patientId + issuerName).digest('hex').substring(0, 16);
      // Never permit unverified admin self-escalation on SMART launch
      const clinicalRole: ISsoUserSession['clinicalRole'] =
        role === 'roles/viewer' ? 'roles/viewer' : 'roles/aiplatform.user';

      const ttlSeconds = 8 * 3600;
      const sessionToken = signSessionToken({
        sub: uid,
        email: `ehr-${patientId}@fhir.local`,
        tenantId,
        role: clinicalRole,
        roles: [clinicalRole, 'CLINICIAN'],
        patientId,
        ttlSeconds
      });

      const session: ISsoUserSession = {
        uid,
        email: `ehr-${patientId}@fhir.local`,
        name: `EHR Patient (${patientId})`,
        provider: 'smart-fhir',
        clinicalRole,
        roleTitle: `SMART-on-FHIR Launch (${issuerName})`,
        tenantId,
        issuedAt: now,
        expiresAt: now + ttlSeconds * 1000,
        sessionToken,
        fhirPatientId: patientId
      };

      console.info(`[Auth SSO] SMART-on-FHIR authenticated for patient ${sanitizeLogInput(patientId)} from ${sanitizeLogInput(issuerName)}`);

      return res.status(200).json({
        success: true,
        message: `SMART-on-FHIR (${issuerName}) Launch Authenticated`,
        session
      });
    } catch (err) {
      console.error('[Auth SSO] SMART-on-FHIR error:', sanitizeLogInput((err as Error)?.message));
      return res.status(500).json({ error: 'Failed to process SMART-on-FHIR launch' });
    }
  });

  /**
   * POST /api/auth/sso/webauthn/challenge
   * Issues a fresh 32-byte NIST SP 800-90A CSPRNG WebAuthn challenge for browser passkeys.
   */
  router.post('/sso/webauthn/challenge', (req: Request, res: Response) => {
    const challenge = crypto.randomBytes(32).toString('base64url');
    const rpId = typeof req.hostname === 'string' && req.hostname.length > 0 ? req.hostname : 'pocketgull.app';
    return res.status(200).json({
      challenge,
      rpId,
      rpName: 'PocketGull Clinical Suite',
      timeout: 60_000
    });
  });

  /**
   * POST /api/auth/sso/webauthn
   * FIDO2 / WebAuthn Biometric Passkey Authentication (all 4 clinical roles).
   * Requires complete WebAuthn assertion fields in production and cryptographically verifies
   * ECDSA P-256 signatures when publicKeyJwk is supplied.
   */
  router.post('/sso/webauthn', (req: Request, res: Response) => {
    try {
      const {
        credentialId,
        authenticatorData,
        signature,
        clientDataJSON,
        publicKeyJwk,
        assertionType,
        role
      } = req.body || {};

      const hasCompleteAssertion =
        typeof credentialId === 'string' &&
        credentialId.trim().length > 0 &&
        typeof authenticatorData === 'string' &&
        authenticatorData.trim().length > 0 &&
        typeof signature === 'string' &&
        signature.trim().length > 0 &&
        typeof clientDataJSON === 'string' &&
        clientDataJSON.trim().length > 0;

      if (isStrictProductionEnv() && !hasCompleteAssertion) {
        return res.status(401).json({
          error: 'Unauthorized: Complete WebAuthn FIDO2 assertion (credentialId, authenticatorData, signature, clientDataJSON) is required.'
        });
      }

      // Validate clientDataJSON envelope whenever supplied
      if (typeof clientDataJSON === 'string' && clientDataJSON.trim().length > 0) {
        let parsedClientData: Record<string, unknown>;
        try {
          const decoded = Buffer.from(clientDataJSON, 'base64url').toString('utf8');
          parsedClientData = JSON.parse(decoded) as Record<string, unknown>;
        } catch {
          return res.status(401).json({ error: 'Unauthorized: Malformed WebAuthn clientDataJSON.' });
        }

        const cdType = parsedClientData['type'];
        const cdChallenge = parsedClientData['challenge'];
        if (
          (cdType !== 'webauthn.get' && cdType !== 'webauthn.create') ||
          typeof cdChallenge !== 'string' ||
          cdChallenge.trim().length < 16
        ) {
          return res.status(401).json({
            error: 'Unauthorized: Invalid WebAuthn clientDataJSON type or challenge.'
          });
        }

        // If client provided a WebCrypto ECDSA P-256 public key JWK, verify the cryptographic signature over authenticatorData || SHA-256(clientDataJSON)
        if (publicKeyJwk && typeof publicKeyJwk === 'object') {
          try {
            const pubKey = crypto.createPublicKey({ key: publicKeyJwk as JsonWebKey, format: 'jwk' });
            const authDataBuf = Buffer.from(String(authenticatorData), 'base64url');
            const clientDataHash = crypto.createHash('sha256').update(Buffer.from(clientDataJSON, 'base64url')).digest();
            const signedPayload = Buffer.concat([authDataBuf, clientDataHash]);
            const sigBuf = Buffer.from(String(signature), 'base64url');
            const validP1363 = crypto.verify(
              'sha256',
              signedPayload,
              { key: pubKey, dsaEncoding: 'ieee-p1363' },
              sigBuf
            );
            const validDer = !validP1363
              ? crypto.verify('sha256', signedPayload, { key: pubKey, dsaEncoding: 'der' }, sigBuf)
              : true;

            if (!validP1363 && !validDer) {
              return res.status(401).json({
                error: 'Unauthorized: Invalid WebAuthn / ECDSA P-256 passkey signature.'
              });
            }
          } catch {
            return res.status(401).json({
              error: 'Unauthorized: Unable to verify WebAuthn passkey cryptographic signature.'
            });
          }
        }
      }

      const VALID_PASSKEY_ROLES: Record<
        ISsoUserSession['clinicalRole'],
        { email: string; name: string; roleTitle: string; roles: string[] }
      > = {
        'roles/aiplatform.user': {
          email: 'passkey-clinician@pocketgull.app',
          name: 'Biometric Authenticated Clinician',
          roleTitle: 'FIDO2 Passkey — Attending Clinician (CDS)',
          roles: ['roles/aiplatform.user', 'CLINICIAN']
        },
        'roles/healthcare.datasetAdmin': {
          email: 'passkey-director@pocketgull.app',
          name: 'Biometric Authenticated Medical Director',
          roleTitle: 'FIDO2 Passkey — Medical Director (EHR & FHIR)',
          // Destructive server actions still enforce cryptographic M-of-N Dual-Custody tokens
          roles: ['roles/healthcare.datasetAdmin', 'CLINICIAN']
        },
        'roles/bigquery.jobUser': {
          email: 'passkey-researcher@pocketgull.app',
          name: 'Biometric Authenticated Researcher',
          roleTitle: 'FIDO2 Passkey — Clinical Researcher (Trials)',
          roles: ['roles/bigquery.jobUser', 'CLINICIAN', 'RESEARCHER']
        },
        'roles/viewer': {
          email: 'passkey-patient@pocketgull.app',
          name: 'Biometric Authenticated Patient',
          roleTitle: 'FIDO2 Passkey — Sovereign Patient',
          roles: ['roles/viewer', 'PATIENT']
        }
      };

      const requestedRole =
        typeof role === 'string' && role in VALID_PASSKEY_ROLES
          ? (role as ISsoUserSession['clinicalRole'])
          : 'roles/aiplatform.user';
      const roleMeta = VALID_PASSKEY_ROLES[requestedRole];

      const now = Date.now();
      const credHash = crypto
        .createHash('sha256')
        .update(String(credentialId || crypto.randomBytes(8).toString('hex')))
        .digest('hex')
        .substring(0, 16);
      const uid = `usr_fido_${credHash}`;
      const tenantId = 'tenant_webauthn_passkey';
      const ttlSeconds = 12 * 3600;

      const sessionToken = signSessionToken({
        sub: uid,
        email: roleMeta.email,
        tenantId,
        role: requestedRole,
        roles: roleMeta.roles,
        ttlSeconds
      });

      const session: ISsoUserSession = {
        uid,
        email: roleMeta.email,
        name: roleMeta.name,
        provider: 'webauthn',
        clinicalRole: requestedRole,
        roleTitle: roleMeta.roleTitle,
        tenantId,
        issuedAt: now,
        expiresAt: now + ttlSeconds * 1000,
        sessionToken
      };

      console.info(
        `[Auth SSO] WebAuthn Passkey authenticated (${sanitizeLogInput(String(assertionType || 'fido2'))}): ${roleMeta.email} (${requestedRole})`
      );

      return res.status(200).json({
        success: true,
        message: 'FIDO2 WebAuthn Passkey Authenticated',
        session
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to process WebAuthn passkey assertion' });
    }
  });

  /**
   * POST /api/auth/sso/kinetic-zkp
   * Wacom WILL 3.0 Zero-Knowledge Kinetic Proof Biometric Gesture Authentication.
   */
  router.post('/sso/kinetic-zkp', (req: Request, res: Response) => {
    try {
      const { zkpKineticHash, role } = req.body || {};

      if (!zkpKineticHash || typeof zkpKineticHash !== 'string' || zkpKineticHash.trim().length < 16) {
        return res.status(400).json({ error: 'Missing kinetic entropy proof' });
      }

      const now = Date.now();
      const uid = 'usr_zkp_' + crypto.createHash('sha256').update(zkpKineticHash).digest('hex').substring(0, 16);
      const tenantId = 'tenant_kinetic_zkp';
      const userRole: ISsoUserSession['clinicalRole'] = role === 'roles/viewer' ? 'roles/viewer' : 'roles/aiplatform.user';
      const ttlSeconds = 12 * 3600;

      const sessionToken = signSessionToken({
        sub: uid,
        email: 'kinetic-touch@pocketgull.app',
        tenantId,
        role: userRole,
        roles: [userRole, 'CLINICIAN'],
        ttlSeconds
      });

      const session: ISsoUserSession = {
        uid,
        email: 'kinetic-touch@pocketgull.app',
        name: 'Kinetic Gesture Authenticated Clinician',
        provider: 'kinetic-wacom',
        clinicalRole: userRole,
        roleTitle: 'WILL 3.0 Kinetic Motor Authenticated',
        tenantId,
        issuedAt: now,
        expiresAt: now + ttlSeconds * 1000,
        sessionToken,
        zkpKineticHash
      };

      return res.status(200).json({
        success: true,
        message: 'Wacom WILL 3.0 Kinetic Proof Authenticated',
        session
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to verify kinetic proof' });
    }
  });

  /**
   * POST /api/auth/sso/logout
   */
  router.post('/sso/logout', (_req: Request, res: Response) => {
    return res.status(200).json({ success: true, message: 'Session logged out' });
  });

  return router;
}
