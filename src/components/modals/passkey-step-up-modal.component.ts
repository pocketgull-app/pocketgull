import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebauthnPasskeyService, IStepUpChallengeRequest, IPasskeyAttestationReceipt } from '../../services/webauthn-passkey.service';

@Component({
  selector: 'app-passkey-step-up-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (passkeyService.pendingChallenge(); as challenge) {
      <div class="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none" role="dialog" aria-modal="true" aria-labelledby="passkey-modal-title">
        <div class="relative w-full max-w-md bg-zinc-950 border-2 border-emerald-500/80 rounded-xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.25)] text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
          
          <!-- Header -->
          <div class="flex items-start justify-between pb-4 border-b border-zinc-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-xl shadow-inner">
                🛡️
              </div>
              <div>
                <h2 id="passkey-modal-title" class="text-sm font-bold uppercase tracking-wider text-emerald-400">
                  FIDO2 Biometric Step-Up
                </h2>
                <span class="text-[10px] text-zinc-400">NIST SP 800-63B Level AAL-2</span>
              </div>
            </div>
            <button
              type="button"
              (click)="cancel()"
              class="text-zinc-500 hover:text-zinc-300 text-lg font-bold p-1 cursor-pointer"
              aria-label="Cancel Verification">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="py-4 space-y-3 text-xs">
            <div class="p-3 bg-zinc-900/90 border border-zinc-800 rounded-lg space-y-1">
              <div class="text-[10px] uppercase text-zinc-400 tracking-wider">Requested Action:</div>
              <div class="font-bold text-zinc-100">{{ challenge.actionDescription }}</div>
              <div class="flex items-center gap-2 pt-1">
                <span class="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                  Role: {{ challenge.requiredRole }}
                </span>
                <span class="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                  Zero-Voice Auth Enforced
                </span>
              </div>
            </div>

            <div class="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-lg flex items-center gap-3">
              <div class="text-2xl animate-pulse">👆</div>
              <div class="text-[11px] text-emerald-200/90">
                Touch your physical passkey, YubiKey, or use device biometrics (Face ID / Windows Hello / Fingerprint).
              </div>
            </div>

            @if (passkeyService.verificationError(); as err) {
              <div class="p-2.5 bg-red-950/50 border border-red-800 rounded-lg text-red-300 text-[11px]">
                ⚠️ {{ err }}
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              (click)="cancel()"
              class="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider border border-zinc-700 cursor-pointer">
              Cancel
            </button>
            <button
              type="button"
              (click)="authenticate()"
              [disabled]="passkeyService.isVerifying()"
              class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-zinc-950 text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50">
              <span>{{ passkeyService.isVerifying() ? 'Verifying...' : 'Verify Biometric' }}</span>
              <span>→</span>
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class PasskeyStepUpModalComponent {
  passkeyService = inject(WebauthnPasskeyService);

  verified = output<IPasskeyAttestationReceipt>();
  canceled = output<void>();

  async authenticate(): Promise<void> {
    const challenge = this.passkeyService.pendingChallenge();
    if (!challenge) return;

    try {
      const receipt = await this.passkeyService.requestPasskeyStepUp(challenge);
      this.verified.emit(receipt);
    } catch {
      // Error handled in service
    }
  }

  cancel(): void {
    this.passkeyService.cancelPendingChallenge();
    this.canceled.emit();
  }
}
