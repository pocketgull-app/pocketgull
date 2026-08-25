import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { PatientManagementService } from './patient-management.service';

@Injectable({
  providedIn: 'root'
})
export class SessionStateService {
  /** 
   * Is the application currently locked due to inactivity or lack of authentication?
   * Defaulting to true so the papercraft living splash screen is active on boot.
   */
  readonly isLocked = signal(true);
  readonly isOnboardingComplete = signal(false);
  private auth = inject(AuthService);
  private patientMgmt = inject(PatientManagementService, { optional: true });

  /**
   * Represents the inactivity timer in seconds.
   */
  private readonly TIMEOUT_SECONDS = 10 * 60; // 10 minutes
  private timeoutId: any;

  constructor() {
    this.resetIdleTimer();
    if (typeof sessionStorage !== 'undefined') {
      try {
        const sessionOnboarded = sessionStorage.getItem('pg_session_onboarded') === '1';
        if (sessionOnboarded) {
          this.isOnboardingComplete.set(true);
          this.isLocked.set(false);
        }
      } catch (e) { /* ignore */ }
    }
  }

  async unlock(): Promise<boolean> {
    const success = await this.auth.promptLocalBiometric();
    if (success) {
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
    if (this.patientMgmt) {
      this.patientMgmt.triggerImmediateSaveAndSync();
    }
    this.isLocked.set(true);
    this.isOnboardingComplete.set(false);
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
