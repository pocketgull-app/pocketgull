import { Component, ChangeDetectionStrategy, inject, signal, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppLicensingGuardService, TARGET_CUSTOMER_PERSONAS } from '../../services/app-licensing-guard.service';

@Component({
  selector: 'app-usage-licensing-paywall-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div class="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col p-6 sm:p-8 text-zinc-100 relative">
        
        <!-- Close Button -->
        <button 
          type="button"
          (click)="close.emit()"
          class="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 p-2 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          aria-label="Close licensing modal">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <!-- Header -->
        <div class="text-center max-w-2xl mx-auto mb-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider mb-3">
            <span>🛡️ Enterprise Usage &amp; Target Licensing</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-zinc-50 tracking-tight">
            @if (licensing.isTrialExhausted()) {
              Free Trial Quota Reached (5/5 Consults)
            } @else if (licensing.isLicenseActive()) {
              Active License: {{ licensing.activeTier().toUpperCase().replace('_', ' ') }}
            } @else {
              PocketGull Professional Clinical Pass
            }
          </h2>
          <p class="text-sm text-zinc-400 mt-2">
            @if (licensing.isLicenseActive()) {
              Your device is registered for unrestricted offline AI scribing, systems thinking modeling, and EHR exports.
            } @else {
              No more free rides. Choose the plan tailored for your practice, or enter your clinic license key below.
            }
          </p>

          <!-- Current Quota Badge -->
          @if (!licensing.isLicenseActive()) {
            <div class="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono">
              <span class="text-zinc-400">Trial Allowance:</span>
              <strong class="text-amber-400">{{ licensing.consultCount() }} / {{ licensing.MAX_FREE_TRIAL_CONSULTS }} Used</strong>
              <span class="text-zinc-500">({{ licensing.remainingConsults() }} remaining)</span>
            </div>
          }
        </div>

        <!-- Target Customer Personas Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          @for (persona of personas; track persona.id) {
            <div class="bg-zinc-950/70 border rounded-xl p-5 flex flex-col justify-between transition-all hover:border-teal-500/60"
                 [class.border-teal-500]="persona.id === 'solo_founder'"
                 [class.border-zinc-800]="persona.id !== 'solo_founder'">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-teal-400 border border-zinc-700">
                    {{ persona.badge }}
                  </span>
                </div>
                <h3 class="text-base font-bold text-zinc-100">{{ persona.title }}</h3>
                <p class="text-xs text-zinc-400 mt-1 mb-3 leading-relaxed">{{ persona.subtitle }}</p>
                <div class="text-xl font-mono font-extrabold text-zinc-50 mb-3">{{ persona.price }}</div>

                <div class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Ideal For:</div>
                <div class="text-xs text-zinc-300 mb-4 bg-zinc-900/80 p-2 rounded border border-zinc-800/80">
                  {{ persona.recommendedFor }}
                </div>

                <ul class="space-y-2 mb-6">
                  @for (benefit of persona.keyBenefits; track benefit) {
                    <li class="text-xs text-zinc-300 flex items-start gap-2">
                      <span class="text-teal-400 font-bold shrink-0">✓</span>
                      <span>{{ benefit }}</span>
                    </li>
                  }
                </ul>
              </div>

              <div>
                <a [href]="'/api/billing/checkout?tier=' + persona.checkoutTier" 
                   target="_blank"
                   class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                   [class.bg-teal-500]="persona.id === 'solo_founder'"
                   [class.text-zinc-950]="persona.id === 'solo_founder'"
                   [class.hover:bg-teal-400]="persona.id === 'solo_founder'"
                   [class.bg-zinc-800]="persona.id !== 'solo_founder'"
                   [class.text-zinc-200]="persona.id !== 'solo_founder'"
                   [class.hover:bg-zinc-700]="persona.id !== 'solo_founder'">
                  {{ persona.ctaText }}
                </a>
              </div>
            </div>
          }
        </div>

        <!-- License Key Activation Section -->
        <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-5 sm:p-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="max-w-md">
              <h4 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>🔑 Have an Existing License Key or Institutional Token?</span>
              </h4>
              <p class="text-xs text-zinc-400 mt-1">
                Enter your key (format: <code class="text-teal-400">PG-FND-XXXX-XXXX</code> or <code class="text-teal-400">PG-CLN-XXXX-XXXX</code>) to activate instantly offline.
              </p>
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <input 
                type="text" 
                [(ngModel)]="enteredKey" 
                placeholder="PG-FND-XXXX-XXXX-XXXX"
                class="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-teal-400 min-w-[240px]" />
              
              <button 
                type="button"
                (click)="onActivateKey()"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer">
                Activate Key
              </button>
            </div>
          </div>

          @if (activationMessage()) {
            <div class="mt-3 text-xs font-mono px-3 py-2 rounded border"
                 [class.bg-emerald-950]="isActivationSuccess()"
                 [class.border-emerald-800]="isActivationSuccess()"
                 [class.text-emerald-300]="isActivationSuccess()"
                 [class.bg-rose-950]="!isActivationSuccess()"
                 [class.border-rose-800]="!isActivationSuccess()"
                 [class.text-rose-300]="!isActivationSuccess()">
              {{ activationMessage() }}
            </div>
          }
        </div>

        <!-- Case Study Link Footer -->
        <div class="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div>
            Case Study: <strong class="text-zinc-300">Nantucket Island Vector Triage</strong> &bull; Systems Biology in High-Incidence Coastal Communities.
          </div>
          <button (click)="openCaseStudy.emit()" class="text-teal-400 hover:underline font-semibold cursor-pointer">
            Explore Nantucket Tick Case Study →
          </button>
        </div>

      </div>
    </div>
  `
})
export class UsageLicensingPaywallModalComponent {
  licensing = inject(AppLicensingGuardService);
  personas = TARGET_CUSTOMER_PERSONAS;

  enteredKey = '';
  activationMessage = signal<string>('');
  isActivationSuccess = signal<boolean>(false);

  close = output<void>();
  openCaseStudy = output<void>();

  onActivateKey() {
    if (!this.enteredKey) {
      this.activationMessage.set('Please enter a license key.');
      this.isActivationSuccess.set(false);
      return;
    }

    const result = this.licensing.activateLicenseKey(this.enteredKey);
    this.activationMessage.set(result.message);
    this.isActivationSuccess.set(result.success);
    if (result.success) {
      setTimeout(() => {
        this.close.emit();
      }, 1500);
    }
  }
}
