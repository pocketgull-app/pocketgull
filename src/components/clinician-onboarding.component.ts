import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

export type OnboardingTier = 'practitioner' | 'clinic' | 'academic' | 'resident';

@Component({
  selector: 'app-clinician-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div class="relative w-full max-w-4xl p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 transition-all max-h-[90vh] overflow-y-auto">
        <!-- Close Button -->
        <button (click)="close.emit()" class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <!-- Header -->
        <div class="mb-6 pr-10">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">🩺</span>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Clinician & Academic Medical Onboarding</h2>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Select your clinical practice tier or medical school residency program to activate immediate AI consult, 3D anatomical modeling, and automated CMS reimbursement engines.
          </p>
        </div>

        <!-- Tiers Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <!-- Tier 1: Independent Practitioner -->
          <div (click)="selectedTier.set('practitioner')"
               [class.border-emerald-500]="selectedTier() === 'practitioner'"
               [class.ring-2]="selectedTier() === 'practitioner'"
               [class.ring-emerald-500\/30]="selectedTier() === 'practitioner'"
               class="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-xl">👨‍⚕️</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">Solo Practice</span>
              </div>
              <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Independent Practitioner</h3>
              <div class="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">$199 <span class="text-xs font-normal text-gray-500">/ mo</span></div>
              <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 mb-4">
                <li>✓ Full Gemini AI Strategy Engine</li>
                <li>✓ 3D Anatomical Shader Canvas</li>
                <li>✓ CMS RPM Billing Telemetry</li>
                <li>✓ FHIR R4 1-Click Export</li>
              </ul>
            </div>
            <button class="w-full py-1.5 rounded-lg text-xs font-semibold"
                    [class.bg-emerald-600]="selectedTier() === 'practitioner'"
                    [class.text-white]="selectedTier() === 'practitioner'"
                    [class.bg-gray-200]="selectedTier() !== 'practitioner'"
                    [class.dark:bg-zinc-700]="selectedTier() !== 'practitioner'"
                    [class.text-gray-700]="selectedTier() !== 'practitioner'"
                    [class.dark:text-gray-300]="selectedTier() !== 'practitioner'">
              {{ selectedTier() === 'practitioner' ? 'Selected' : 'Select Plan' }}
            </button>
          </div>

          <!-- Tier 2: Group Practice -->
          <div (click)="selectedTier.set('clinic')"
               [class.border-emerald-500]="selectedTier() === 'clinic'"
               [class.ring-2]="selectedTier() === 'clinic'"
               [class.ring-emerald-500\/30]="selectedTier() === 'clinic'"
               class="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-xl">🏥</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">5 Seats</span>
              </div>
              <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Group Clinic</h3>
              <div class="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">$499 <span class="text-xs font-normal text-gray-500">/ mo</span></div>
              <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 mb-4">
                <li>✓ Everything in Solo Practice</li>
                <li>✓ Multi-Clinician State Sharing</li>
                <li>✓ Epic/Cerner Integration Proxy</li>
                <li>✓ Dedicated Account Manager</li>
              </ul>
            </div>
            <button class="w-full py-1.5 rounded-lg text-xs font-semibold"
                    [class.bg-emerald-600]="selectedTier() === 'clinic'"
                    [class.text-white]="selectedTier() === 'clinic'"
                    [class.bg-gray-200]="selectedTier() !== 'clinic'"
                    [class.dark:bg-zinc-700]="selectedTier() !== 'clinic'"
                    [class.text-gray-700]="selectedTier() !== 'clinic'"
                    [class.dark:text-gray-300]="selectedTier() !== 'clinic'">
              {{ selectedTier() === 'clinic' ? 'Selected' : 'Select Plan' }}
            </button>
          </div>

          <!-- Tier 3: Teaching Hospital & Medical School -->
          <div (click)="selectedTier.set('academic')"
               [class.border-emerald-500]="selectedTier() === 'academic'"
               [class.ring-2]="selectedTier() === 'academic'"
               [class.ring-emerald-500\/30]="selectedTier() === 'academic'"
               class="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-xl">🏛️</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">Unlimited Seats</span>
              </div>
              <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Medical School</h3>
              <div class="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">$1,499 <span class="text-xs font-normal text-gray-500">/ mo</span></div>
              <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 mb-4">
                <li>✓ Full Resident & Student Access</li>
                <li>✓ Socratic Case Study Simulator</li>
                <li>✓ 30% Alumni Endowment Split</li>
                <li>✓ Custom Research Data Pipeline</li>
              </ul>
            </div>
            <button class="w-full py-1.5 rounded-lg text-xs font-semibold"
                    [class.bg-emerald-600]="selectedTier() === 'academic'"
                    [class.text-white]="selectedTier() === 'academic'"
                    [class.bg-gray-200]="selectedTier() !== 'academic'"
                    [class.dark:bg-zinc-700]="selectedTier() !== 'academic'"
                    [class.text-gray-700]="selectedTier() !== 'academic'"
                    [class.dark:text-gray-300]="selectedTier() !== 'academic'">
              {{ selectedTier() === 'academic' ? 'Selected' : 'Select Plan' }}
            </button>
          </div>

          <!-- Tier 4: Resident / Student Scholar (Sponsored Grant) -->
          <div (click)="selectedTier.set('resident')"
               [class.border-emerald-500]="selectedTier() === 'resident'"
               [class.ring-2]="selectedTier() === 'resident'"
               [class.ring-emerald-500\/30]="selectedTier() === 'resident'"
               class="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-xl">🎓</span>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">Grant Sponsored</span>
              </div>
              <h3 class="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">Resident Scholar</h3>
              <div class="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">$0 <span class="text-xs font-normal text-gray-500">/ grant</span></div>
              <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 mb-4">
                <li>✓ Sponsored by Alumni Grants</li>
                <li>✓ Full Student Practice License</li>
                <li>✓ Ephemeral Data Sovereignty</li>
                <li>✓ Instant Verification</li>
              </ul>
            </div>
            <button class="w-full py-1.5 rounded-lg text-xs font-semibold"
                    [class.bg-emerald-600]="selectedTier() === 'resident'"
                    [class.text-white]="selectedTier() === 'resident'"
                    [class.bg-gray-200]="selectedTier() !== 'resident'"
                    [class.dark:bg-zinc-700]="selectedTier() !== 'resident'"
                    [class.text-gray-700]="selectedTier() !== 'resident'"
                    [class.dark:text-gray-300]="selectedTier() !== 'resident'">
              {{ selectedTier() === 'resident' ? 'Selected' : 'Select Plan' }}
            </button>
          </div>
        </div>

        <!-- Details Form -->
        <div class="p-5 bg-gray-50 dark:bg-zinc-800/40 rounded-xl border border-gray-200 dark:border-zinc-800 mb-6">
          <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Organization & Practitioner Identification</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Practitioner / Institution Email</label>
              <input [(ngModel)]="email" type="email" placeholder="dr.smith@teaching-hospital.edu" class="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Medical License / NPI / Student ID</label>
              <input [(ngModel)]="licenseId" type="text" placeholder="NPI 1849204810 or .edu ID" class="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-gray-100" />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center border-t border-gray-200 dark:border-zinc-800 pt-4">
          <div class="text-xs text-gray-500 flex items-center gap-1">
            <span>🔒 Stripe Live Payout Ready</span>
            <span class="text-emerald-500">● Rolling Daily ACH</span>
          </div>

          <div class="flex gap-3">
            <button (click)="close.emit()" class="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 font-medium rounded-lg text-sm transition-colors">
              Cancel
            </button>
            <button (click)="submitCheckout()" [disabled]="isSubmitting()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors shadow-md flex items-center gap-2">
              @if (isSubmitting()) {
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Initializing Stripe Checkout...
              } @else {
                Activate {{ selectedTierTitle() }}
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClinicianOnboardingComponent {
  @Output() close = new EventEmitter<void>();

  selectedTier = signal<OnboardingTier>('practitioner');
  email = 'dr.smith@teaching-hospital.edu';
  licenseId = '';
  isSubmitting = signal(false);

  constructor(private http: HttpClient) {}

  selectedTierTitle(): string {
    switch (this.selectedTier()) {
      case 'practitioner': return 'Solo Practice ($199/mo)';
      case 'clinic': return 'Group Practice ($499/mo)';
      case 'academic': return 'Medical School ($1,499/mo)';
      case 'resident': return 'Resident Grant ($0)';
    }
  }

  submitCheckout() {
    this.isSubmitting.set(true);

    const priceId = 'price_1U3KRiBK1Sz8xlZGqjW4dJfp'; // Stripe price ID configured

    this.http.post<{ url: string }>('/api/billing/checkout', {
      priceId,
      customerEmail: this.email,
      endowmentFund: this.selectedTier() === 'academic' ? 'Alumni Health & Research Endowment' : 'Digital Civic Health Service Fund',
      revenueSplit: this.selectedTier() === 'academic' ? '0-80-20' : '50-30-20',
      metadata: {
        license_id: this.licenseId,
        tier: this.selectedTier()
      }
    }).subscribe({
      next: (res) => {
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: (err) => {
        console.error('[Clinician Onboarding] Checkout failed', err);
        this.isSubmitting.set(false);
      }
    });
  }
}
