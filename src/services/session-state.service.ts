import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { PatientManagementService } from './patient-management.service';

@Injectable({
  providedIn: 'root'
})
export class SessionStateService {
  /** 
   * Streamlined Session: Default to unlocked with onboarding complete so clinicians
   * and users enter the full workspace immediately with zero lock friction.
   * Can be locked explicitly via lock() or initialized as locked via pg_session_locked.
   */
  readonly isLocked = signal(
    typeof window !== 'undefined' && (
      window.sessionStorage?.getItem('pg_session_locked') === 'true' ||
      window.localStorage?.getItem('pg_session_locked') === 'true'
    )
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
      if (typeof window !== 'undefined') {
        window.sessionStorage?.removeItem('pg_session_locked');
        window.localStorage?.removeItem('pg_session_locked');
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
    if (typeof window !== 'undefined') {
      window.sessionStorage?.setItem('pg_session_locked', 'true');
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
