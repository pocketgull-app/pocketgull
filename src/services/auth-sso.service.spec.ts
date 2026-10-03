import '@angular/compiler';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { AuthSsoService, IAuthenticatedUser, ISsoDiscoveryConfig } from './auth-sso.service';

class MockStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.get(key) ?? null; }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string) { this.store.delete(key); }
  setItem(key: string, value: string) { this.store.set(key, String(value)); }
}

describe('AuthSsoService (Battletest Client SSO & Session Lifecycle)', () => {
  let service: AuthSsoService;
  let httpMock: HttpTestingController;

  const mockGoogleSession: IAuthenticatedUser = {
    uid: 'usr_goog_1234567890',
    email: 'dr.curie@pocketgull.app',
    name: 'Dr. Marie Curie',
    provider: 'google',
    clinicalRole: 'roles/aiplatform.user',
    roleTitle: 'Attending Clinician (CDS & AI Consult)',
    tenantId: 'tenant_gen_lang_client_0540208645',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 86400000,
    sessionToken: 'a'.repeat(64)
  };

  beforeEach(() => {
    if (typeof globalThis.sessionStorage === 'undefined') {
      (globalThis as any).sessionStorage = new MockStorage();
    }
    if (typeof globalThis.localStorage === 'undefined') {
      (globalThis as any).localStorage = new MockStorage();
    }
    sessionStorage.clear();
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthSsoService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(AuthSsoService);
    httpMock = TestBed.inject(HttpTestingController);

    // Drain initial discovery request in constructor if triggered
    const req = httpMock.match('/api/auth/sso/config');
    if (req.length > 0) {
      req[0].flush({
        status: 'active',
        projectId: 'gen-lang-client-0540208645',
        google: { enabled: true, clientId: 'test-client', supportedScopes: ['openid'], authUrl: 'https://accounts.google.com/o/oauth2/v2/auth' },
        smartOnFhir: { enabled: true, issuers: [] },
        webauthn: { enabled: true, rpName: 'PocketGull', rpId: 'localhost' },
        kineticZkp: { enabled: true, protocol: 'Wacom WILL 3.0' }
      } as ISsoDiscoveryConfig);
    }
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('initializes with unauthenticated reactive state', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(service.clinicalRole()).toBe('roles/aiplatform.user');
  });

  it('fetches SSO discovery configuration successfully', async () => {
    const configPromise = service.fetchSsoConfig();
    const req = httpMock.expectOne('/api/auth/sso/config');
    expect(req.request.method).toBe('GET');

    const mockConfig: ISsoDiscoveryConfig = {
      status: 'active',
      projectId: 'gen-lang-client-0540208645',
      google: { enabled: true, clientId: 'client_id_test', supportedScopes: ['openid'], authUrl: 'https://accounts.google.com/o/oauth2/v2/auth' },
      smartOnFhir: { enabled: true, issuers: [{ name: 'Epic', fhirVersion: 'R4' }] },
      webauthn: { enabled: true, rpName: 'PocketGull', rpId: 'pocketgull.app' },
      kineticZkp: { enabled: true, protocol: 'WILL 3.0' }
    };

    req.flush(mockConfig);
    const result = await configPromise;
    expect(result?.projectId).toBe('gen-lang-client-0540208645');
    expect(service.ssoConfig()?.google.enabled).toBe(true);
  });

  it('authenticates with Google IAM SSO and stores session in sessionStorage', async () => {
    const signInPromise = service.signInWithGoogle('roles/aiplatform.user', {
      email: 'dr.curie@pocketgull.app',
      name: 'Dr. Marie Curie'
    });

    const req = httpMock.expectOne('/api/auth/sso/google');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.email).toBe('dr.curie@pocketgull.app');

    req.flush({ success: true, session: mockGoogleSession });
    const user = await signInPromise;

    expect(user.email).toBe('dr.curie@pocketgull.app');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.userDisplayName()).toBe('Dr. Marie Curie');
    expect(service.provider()).toBe('google');

    const stored = sessionStorage.getItem('pocketgull_auth_session_v1');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).email).toBe('dr.curie@pocketgull.app');
  });

  it('authenticates SMART-on-FHIR launch with EHR issuer context', async () => {
    const fhirSession: IAuthenticatedUser = {
      ...mockGoogleSession,
      provider: 'smart-fhir',
      fhirPatientId: 'pat-999',
      roleTitle: 'SMART-on-FHIR Launch (Epic Systems EHR)'
    };

    const signInPromise = service.signInWithSmartFhir('Epic Systems EHR', 'pat-999');
    const req = httpMock.expectOne('/api/auth/sso/smart-fhir');
    expect(req.request.body.issuer).toBe('Epic Systems EHR');
    expect(req.request.body.fhirPatientId).toBe('pat-999');

    req.flush({ success: true, session: fhirSession });
    const user = await signInPromise;

    expect(user.provider).toBe('smart-fhir');
    expect(user.fhirPatientId).toBe('pat-999');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('authenticates with WebAuthn / FIDO2 Passkey', async () => {
    const passkeySession: IAuthenticatedUser = {
      ...mockGoogleSession,
      provider: 'webauthn',
      roleTitle: 'FIDO2 / WebAuthn Biometric Clinician'
    };

    const signInPromise = service.signInWithPasskey();
    const req = httpMock.expectOne('/api/auth/sso/webauthn');
    expect(req.request.method).toBe('POST');

    req.flush({ success: true, session: passkeySession });
    const user = await signInPromise;

    expect(user.provider).toBe('webauthn');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('authenticates with Wacom WILL 3.0 Zero-Knowledge Kinetic Proof', async () => {
    const zkpHash = 'sha256:0123456789abcdef0123456789abcdef';
    const kineticSession: IAuthenticatedUser = {
      ...mockGoogleSession,
      provider: 'kinetic-wacom',
      zkpKineticHash: zkpHash
    };

    const signInPromise = service.signInWithKineticProof(zkpHash);
    const req = httpMock.expectOne('/api/auth/sso/kinetic-zkp');
    expect(req.request.body.zkpKineticHash).toBe(zkpHash);

    req.flush({ success: true, session: kineticSession });
    const user = await signInPromise;

    expect(user.provider).toBe('kinetic-wacom');
    expect(user.zkpKineticHash).toBe(zkpHash);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('clears reactive state and removes tokens on signOut()', async () => {
    service.user.set(mockGoogleSession);
    sessionStorage.setItem('pocketgull_auth_session_v1', JSON.stringify(mockGoogleSession));

    const signOutPromise = service.signOut();
    const req = httpMock.expectOne('/api/auth/sso/logout');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });

    await signOutPromise;

    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(sessionStorage.getItem('pocketgull_auth_session_v1')).toBeNull();
  });

  it('handles server authentication errors and updates reactive authError signal', async () => {
    const signInPromise = service.signInWithGoogle('roles/aiplatform.user');
    const req = httpMock.expectOne('/api/auth/sso/google');
    req.flush({ error: 'OAuth assertion invalid' }, { status: 401, statusText: 'Unauthorized' });

    await expect(signInPromise).rejects.toThrow();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.authError()).not.toBeNull();
  });
});
