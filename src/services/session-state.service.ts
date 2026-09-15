import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { PatientManagementService } from './patient-management.service';

@Injectable({
  providedIn: 'root'
})
export class SessionStateService {
  /**
   * Secure Session: Default to locked so the splash screen is the initial entry
   * gatekeeper, requiring biometric / gesture / demo unlock.
   */
  readonly isLocked = signal(
    (() => {
      try {
        if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) {
          return globalThis.sessionStorage.getItem('pg_session_unlocked') !== 'true';
        }
      } catch {
        // Fallback for restricted storage environments
      }
      return true;
    })()
  );
  readonly isOnboardingComplete = signal(true);
  private auth = inject(AuthService);
  private patientMgmt = inject(PatientManagementService, { optional: true });

  /**
   * Represents the inactivity timer in seconds (disabled by default for smooth workflow).
   */
  private readonly TIMEOUT_SECONDS = 30 * 60; // 30 minutes
  private timeoutId: any;

  constructor() {
    // Session state initialized
  }

  async unlock(): Promise<boolean> {
    const success = await this.auth.promptLocalBiometric();
    if (success) {
      try {
        if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) {
          globalThis.sessionStorage.setItem('pg_session_unlocked', 'true');
          globalThis.sessionStorage.removeItem('pg_session_locked');
        }
        if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
          globalThis.localStorage.removeItem('pg_session_locked');
        }
      } catch {
        // Ignore storage write errors in private browsing/sandboxed contexts
      }
      this.isLocked.set(false);
      this.resetIdleTimer();
      return true;
    }
    return false;
  }

  async verifyBiometrics(): Promise<boolean> {
    return await this.auth.promptLocalBiometric();
  }

  lock() {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.sessionStorage) {
        globalThis.sessionStorage.removeItem('pg_session_unlocked');
        globalThis.sessionStorage.setItem('pg_session_locked', 'true');
      }
    } catch {
      // Ignore storage write errors
    }
    if (this.patientMgmt) {
      this.patientMgmt.triggerImmediateSaveAndSync();
    }
    this.isLocked.set(true);
    // Note: isOnboardingComplete is intentionally NOT reset here.
    // HIPAA idle-lock re-entry only requires re-authentication (gesture/PIN),
    // not a full KSS onboarding cycle. The session remains "onboarded".
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  resetIdleTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    // Only reset if we are currently unlocked
    if (!this.isLocked()) {
      this.timeoutId = setTimeout(() => {
        this.lock();
      }, this.TIMEOUT_SECONDS * 1000);
    }
  }
}
