import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface IAuthenticatedUser {
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

export interface ISsoDiscoveryConfig {
  status: string;
  projectId: string;
  google: {
    enabled: boolean;
    clientId: string;
    supportedScopes: string[];
    authUrl: string;
  };
  smartOnFhir: {
    enabled: boolean;
    issuers: { name: string; fhirVersion: string }[];
  };
  webauthn: {
    enabled: boolean;
    rpName: string;
    rpId: string;
  };
  kineticZkp: {
    enabled: boolean;
    protocol: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthSsoService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private readonly STORAGE_KEY = 'pocketgull_auth_session_v1';

  // --- Reactive Authentication State ---
  readonly user = signal<IAuthenticatedUser | null>(null);
  readonly isAuthenticating = signal<boolean>(false);
  readonly authError = signal<string | null>(null);
  readonly ssoConfig = signal<ISsoDiscoveryConfig | null>(null);

  readonly isAuthenticated = computed(() => !!this.user());
  readonly clinicalRole = computed(() => this.user()?.clinicalRole ?? 'roles/aiplatform.user');
  readonly userDisplayName = computed(() => this.user()?.name ?? 'Clinician');
  readonly userEmail = computed(() => this.user()?.email ?? 'clinician@pocketgull.app');
  readonly provider = computed(() => this.user()?.provider ?? null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.restoreSession();
      this.fetchSsoConfig().catch(() => {});
    }
  }

  /**
   * Fetch SSO discovery configuration from backend
   */
  async fetchSsoConfig(): Promise<ISsoDiscoveryConfig | null> {
    try {
      const config = await firstValueFrom(this.http.get<ISsoDiscoveryConfig>('/api/auth/sso/config'));
      this.ssoConfig.set(config);
      return config;
    } catch {
      return null;
    }
  }

  /**
   * Google Cloud IAM & Workspace Single Sign-On
   */
  async signInWithGoogle(
    role: string = 'roles/aiplatform.user',
    profile?: { email?: string; name?: string; picture?: string; zkpKineticHash?: string }
  ): Promise<IAuthenticatedUser> {
    this.isAuthenticating.set(true);
    this.authError.set(null);

    try {
      const payload = {
        role,
        email: profile?.email || 'clinician@pocketgull.app',
        name: profile?.name || 'Dr. Gulliver (Attending Clinician)',
        picture: profile?.picture,
        zkpKineticHash: profile?.zkpKineticHash
      };

      const res = await firstValueFrom(
        this.http.post<{ success: boolean; session: IAuthenticatedUser }>('/api/auth/sso/google', payload)
      );

      if (res && res.session) {
        this.setSession(res.session);
        return res.session;
      }
      throw new Error('Invalid response from SSO server');
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Google SSO authentication failed';
      this.authError.set(msg);
      throw err;
    } finally {
      this.isAuthenticating.set(false);
    }
  }

  /**
   * SMART-on-FHIR Hospital EHR SSO Launch (Epic, Cerner, AthenaHealth)
   */
  async signInWithSmartFhir(
    issuer: string = 'Epic Systems EHR',
    fhirPatientId: string = 'patient-curie-2026',
    role: string = 'roles/aiplatform.user'
  ): Promise<IAuthenticatedUser> {
    this.isAuthenticating.set(true);
    this.authError.set(null);

    try {
      const res = await firstValueFrom(
        this.http.post<{ success: boolean; session: IAuthenticatedUser }>('/api/auth/sso/smart-fhir', {
          issuer,
          fhirPatientId,
          role
        })
      );

      if (res && res.session) {
        this.setSession(res.session);
        return res.session;
      }
      throw new Error('SMART-on-FHIR launch failed');
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'SMART-on-FHIR launch failed';
      this.authError.set(msg);
      throw err;
    } finally {
      this.isAuthenticating.set(false);
    }
  }

  /**
   * WebAuthn / FIDO2 Biometric Passkey SSO
   */
  async signInWithPasskey(): Promise<IAuthenticatedUser> {
    this.isAuthenticating.set(true);
    this.authError.set(null);

    try {
      const res = await firstValueFrom(
        this.http.post<{ success: boolean; session: IAuthenticatedUser }>('/api/auth/sso/webauthn', {
          credentialId: 'fido2_key_' + Math.random().toString(36).substring(2, 10)
        })
      );

      if (res && res.session) {
        this.setSession(res.session);
        return res.session;
      }
      throw new Error('Passkey verification failed');
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Passkey authentication failed';
      this.authError.set(msg);
      throw err;
    } finally {
      this.isAuthenticating.set(false);
    }
  }

  /**
   * Wacom WILL 3.0 Kinetic Gesture Biometric SSO
   */
  async signInWithKineticProof(
    zkpKineticHash: string,
    role: string = 'roles/aiplatform.user'
  ): Promise<IAuthenticatedUser> {
    this.isAuthenticating.set(true);
    this.authError.set(null);

    try {
      const res = await firstValueFrom(
        this.http.post<{ success: boolean; session: IAuthenticatedUser }>('/api/auth/sso/kinetic-zkp', {
          zkpKineticHash,
          role
        })
      );

      if (res && res.session) {
        this.setSession(res.session);
        return res.session;
      }
      throw new Error('Kinetic proof verification failed');
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Kinetic verification failed';
      this.authError.set(msg);
      throw err;
    } finally {
      this.isAuthenticating.set(false);
    }
  }

  /**
   * Sign out and clear active session
   */
  async signOut(): Promise<void> {
    try {
      if (isPlatformBrowser(this.platformId)) {
        await firstValueFrom(this.http.post('/api/auth/sso/logout', {}));
      }
    } catch {}

    this.user.set(null);
    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.STORAGE_KEY);
      } catch {}
    }
  }

  private setSession(session: IAuthenticatedUser): void {
    this.user.set(session);
    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
      } catch {}
    }
  }

  private restoreSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY) || localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const session: IAuthenticatedUser = JSON.parse(raw);
        if (session && session.expiresAt > Date.now()) {
          this.user.set(session);
        } else {
          sessionStorage.removeItem(this.STORAGE_KEY);
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    } catch {}
  }
}
