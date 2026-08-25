import { Injectable, inject, signal, computed } from '@angular/core';
import { PatientManagementService } from './patient-management.service';
import { IBiometricEntry } from './patient.types';

/** Current consent version — must match server CONSENT_VERSION */
const CONSENT_VERSION = '1.0.0';

/** Scopes shown to the user in the consent modal — must exactly match server CONSENTED_DATA_TYPES */
export const HEALTH_DATA_TYPES_CONSENTED = [
  'Resting Heart Rate (bpm) — daily summary',
  'Oxygen Saturation / SpO2 (%) — daily average',
  'Sleep duration (minutes) and efficiency (%) — nightly summary',
];

export interface IFitbitStatus {
  connected: boolean;
  expired?: boolean;
  scope?: string;
  expiresAt?: string;
  provider?: string;
  hasConsent?: boolean;
  consentTimestamp?: string;
  consentVersion?: string;
}

export interface IGoogleHealthSyncResult {
  patientId: string;
  provider: string;
  syncedAt: string;
  dataPoints: number;
  biometricEntries: IBiometricEntry[];
  sleepSummary: { date: string; totalMinutes: number; efficiency: number }[];
  consentVersion?: string;
}

/**
 * FitbitService manages the Google Health API OAuth2 lifecycle, informed consent
 * gating, biometric sync, and data withdrawal for PocketGull.
 *
 * Compliance with Google Health API Research Data Policy:
 * - No data is fetched without recorded informed consent
 * - Subjects can withdraw and purge all their data at any time
 * - Only minimal scopes (HR, SpO2, Sleep) are requested
 * - Audit trail maintained server-side in logs/health-data-audit.log
 */
@Injectable({ providedIn: 'root' })
export class FitbitService {
  private patientMgmt = inject(PatientManagementService);

  // ── Reactive state ──────────────────────────────────────────────────────────
  readonly isSyncing           = signal(false);
  readonly isCheckingStatus    = signal(false);
  readonly connectionStatus    = signal<IFitbitStatus>({ connected: false });
  readonly lastSyncResult      = signal<IGoogleHealthSyncResult | null>(null);
  readonly syncError           = signal<string | null>(null);

  /** True when the user has accepted the consent modal in this session. */
  readonly hasConsented        = signal(false);
  /** Controls whether the consent modal is visible. */
  readonly showConsentModal    = signal(false);

  readonly isConnected = computed(
    () => this.connectionStatus().connected && !this.connectionStatus().expired
  );

  // ── Status check ────────────────────────────────────────────────────────────
  /** Checks the Google Health connection status for the currently selected patient. */
  async checkStatus(): Promise<void> {
    const patient = this.patientMgmt.selectedPatient();
    if (!patient) return;

    this.isCheckingStatus.set(true);
    try {
      const res = await fetch(`/api/fitbit/status?patientId=${encodeURIComponent(patient.id)}`);
      if (res.ok) {
        const status: IFitbitStatus = await res.json();
        this.connectionStatus.set(status);
        // If server already has a consent record for this patient, reflect that locally
        if (status.hasConsent) this.hasConsented.set(true);
      }
    } catch (e: any) {
      console.warn('[FitbitService] Status check failed:', e.message);
    } finally {
      this.isCheckingStatus.set(false);
    }
  }

  // ── Consent flow ────────────────────────────────────────────────────────────
  /**
   * Opens the informed-consent modal.
   * The actual OAuth redirect only happens after the user accepts.
   */
  initiateAuth(): void {
    const patient = this.patientMgmt.selectedPatient();
    if (!patient) {
      console.warn('[FitbitService] No patient selected.');
      return;
    }

    if (this.hasConsented()) {
      // Consent already given — go straight to OAuth
      this._redirectToOAuth(patient.id);
    } else {
      // Show the consent modal first
      this.showConsentModal.set(true);
    }
  }

  /**
   * Records informed consent server-side and initiates OAuth.
   * Called by the consent modal's "I Agree" button.
   */
  async acceptConsent(): Promise<void> {
    const patient = this.patientMgmt.selectedPatient();
    if (!patient) return;

    try {
      const res = await fetch('/api/fitbit/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id, acknowledged: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to record consent.');
      }

      this.hasConsented.set(true);
      this.showConsentModal.set(false);

      console.log('[FitbitService] Consent recorded. Redirecting to Google OAuth...');
      this._redirectToOAuth(patient.id);
    } catch (e: any) {
      console.error('[FitbitService] Consent error:', e.message);
      this.syncError.set('Could not record consent: ' + e.message);
    }
  }

  /** Dismisses the consent modal without taking action. */
  declineConsent(): void {
    this.showConsentModal.set(false);
  }

  // ── Sync ────────────────────────────────────────────────────────────────────
  /**
   * Syncs the latest 30 days of Google Health biometric data for the current
   * patient and merges new entries into the patient's biometricHistory signal.
   *
   * Data types: Resting HR, SpO2, Sleep (as per informed consent).
   */
  async sync(): Promise<IGoogleHealthSyncResult | null> {
    const patient = this.patientMgmt.selectedPatient();
    if (!patient) {
      this.syncError.set('No patient selected.');
      return null;
    }

    this.isSyncing.set(true);
    this.syncError.set(null);

    try {
      const res = await fetch(`/api/fitbit/sync/${encodeURIComponent(patient.id)}`, {
        method: 'POST',
      });

      if (res.status === 403) {
        // Consent required but missing — show modal
        this.showConsentModal.set(true);
        return null;
      }

      if (res.status === 401) {
        const data = await res.json();
        this.connectionStatus.set({ connected: false });
        this.syncError.set(
          data.needsAuth
            ? 'Google Health not connected. Please authorize via Imports → Google Health Connect.'
            : (data.error || 'Authorization failed.')
        );
        return null;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as Record<string, string>;
        throw new Error(data['error'] || `Sync failed (${res.status})`);
      }

      const result: IGoogleHealthSyncResult = await res.json();
      this.lastSyncResult.set(result);
      this.connectionStatus.set({ connected: true, provider: result.provider });

      if (result.biometricEntries.length > 0) {
        this._mergeBiometricEntries(patient.id, result.biometricEntries);
      }

      console.log(
        `[FitbitService] ✅ Synced ${result.dataPoints} data points for ${patient.name}.`
      );
      return result;
    } catch (e: any) {
      console.error('[FitbitService] Sync error:', e.message);
      this.syncError.set(e.message || 'Sync failed. Please try again.');
      return null;
    } finally {
      this.isSyncing.set(false);
    }
  }

  // ── Revoke / Withdrawal ─────────────────────────────────────────────────────
  /**
   * Revokes the stored token. When purgeData=true, also clears all biometric
   * entries sourced from Google Health API from the patient record.
   *
   * COMPLIANCE: Research subjects have the right to withdraw at any time and
   * may request deletion of their data.
   */
  async revoke(purgeData = false): Promise<void> {
    const patient = this.patientMgmt.selectedPatient();
    if (!patient) return;

    try {
      const res = await fetch('/api/fitbit/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id, purgeData }),
      });

      const data = await res.json() as { ok: boolean; biometricPurgeRequired?: boolean };

      this.connectionStatus.set({ connected: false });
      this.lastSyncResult.set(null);
      this.hasConsented.set(false);

      // If full withdrawal requested, also purge from local patient state
      if (data.biometricPurgeRequired) {
        this._purgeGoogleHealthBiometrics(patient.id);
        console.log(`[FitbitService] 🗑️ Google Health biometric data purged for ${patient.name}.`);
      }

      console.log(`[FitbitService] Token revoked for ${patient.id}. Purge: ${purgeData}`);
    } catch (e: any) {
      console.warn('[FitbitService] Revoke failed:', e.message);
    }
  }

  // ── OAuth redirect handler ──────────────────────────────────────────────────
  /**
   * Handles the OAuth redirect callback signal in the URL (?fitbit=connected).
   * Call this from AppComponent afterNextRender.
   */
  handleOAuthRedirect(): boolean {
    if (typeof window === 'undefined') return false;

    const params = new URLSearchParams(window.location.search);
    const fitbitParam = params.get('fitbit');

    if (fitbitParam === 'connected') {
      window.history.replaceState({}, '', window.location.pathname);
      this.hasConsented.set(true);
      this.checkStatus().then(() => this.sync());
      return true;
    }

    if (fitbitParam === 'denied') {
      window.history.replaceState({}, '', window.location.pathname);
      this.syncError.set('Google Health authorization was cancelled.');
    } else if (fitbitParam === 'error') {
      window.history.replaceState({}, '', window.location.pathname);
      this.syncError.set('Google Health authorization failed. Please try again.');
    }

    return false;
  }

  // ── Private helpers ─────────────────────────────────────────────────────────
  private _redirectToOAuth(patientId: string): void {
    const authUrl = `/api/fitbit/auth?patientId=${encodeURIComponent(patientId)}`;
    console.log('[FitbitService] Redirecting to Google OAuth:', authUrl);
    window.location.href = authUrl;
  }

  private _mergeBiometricEntries(patientId: string, newEntries: IBiometricEntry[]): void {
    const patients = this.patientMgmt.patients();
    const idx = patients.findIndex(p => p.id === patientId);
    if (idx === -1) return;

    const patient = patients[idx];
    const existing = new Set(
      (patient.biometricHistory || []).map(e => `${e.timestamp}|${e.type}`)
    );

    const toAdd = newEntries.filter(e => !existing.has(`${e.timestamp}|${e.type}`));
    if (toAdd.length === 0) {
      console.log('[FitbitService] No new biometric entries to merge.');
      return;
    }

    const merged = [...(patient.biometricHistory || []), ...toAdd]
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const updated = [...patients];
    updated[idx] = { ...patient, biometricHistory: merged };
    this.patientMgmt.patients.set(updated);

    console.log(`[FitbitService] Merged ${toAdd.length} new entries. Total: ${merged.length}.`);
  }

  /** Removes all biometric entries sourced from Google Health API (data purge on withdrawal). */
  private _purgeGoogleHealthBiometrics(patientId: string): void {
    const patients = this.patientMgmt.patients();
    const idx = patients.findIndex(p => p.id === patientId);
    if (idx === -1) return;

    const patient = patients[idx];
    const purged = (patient.biometricHistory || []).filter(
      e => e.source !== 'Google Health API'
    );

    const updated = [...patients];
    updated[idx] = { ...patient, biometricHistory: purged };
    this.patientMgmt.patients.set(updated);
  }
}
