import { Injectable, inject, signal, afterNextRender } from '@angular/core';
import { SecureStorageService } from './secure-storage.service';

const CONSENT_KEY = 'pg_data_consent_v1';

/**
 * Manages informed consent state for HIPAA-aligned data handling.
 * Persists consent acknowledgment via SecureStorageService.
 *
 * @see ACM Code of Ethics §1.6 — Respect Privacy
 */
@Injectable({ providedIn: 'root' })
export class ConsentService {
    private storage = inject(SecureStorageService);

    /** Whether the user has acknowledged the data consent modal */
    readonly hasConsented = signal<boolean>(true);

    /** Timestamp of when consent was given */
    readonly consentTimestamp = signal<string | null>(null);

    constructor() {
        if (this.storage.isAvailable) {
            afterNextRender(() => {
                const consented = this.loadConsent();
                this.hasConsented.set(consented);
                if (consented) {
                    this.consentTimestamp.set(this.loadTimestamp());
                }
            });
        }
    }

    private loadConsent(): boolean {
        return this.storage.getItem(CONSENT_KEY) === 'true';
    }

    private loadTimestamp(): string | null {
        return this.storage.getItem(`${CONSENT_KEY}_ts`);
    }

    /** Record user's informed consent */
    acceptConsent(): void {
        const ts = new Date().toISOString();
        this.storage.setItem(CONSENT_KEY, 'true');
        this.storage.setItem(`${CONSENT_KEY}_ts`, ts);
        this.hasConsented.set(true);
        this.consentTimestamp.set(ts);
    }

    /** Revoke consent and clear data acknowledgment */
    revokeConsent(): void {
        this.storage.removeItem(CONSENT_KEY);
        this.storage.removeItem(`${CONSENT_KEY}_ts`);
        this.hasConsented.set(false);
        this.consentTimestamp.set(null);
    }
}
