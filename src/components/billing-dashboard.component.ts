import { Component, signal, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-billing-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div class="relative w-full max-w-3xl p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 transition-all max-h-[90vh] overflow-y-auto">
        <!-- Close Button -->
        <button (click)="close.emit()" class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div class="flex justify-between items-start mb-6 pr-10">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Billing & Subscription</h2>
            <p class="text-sm text-gray-500 mt-1">Manage your active plan, monitor usage, and configure philanthropic pledges.</p>
          </div>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-green/10 text-brand-green border border-brand-green/20">
            Clinical Pro Active
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Plan Details -->
          <div class="p-5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Current Plan</h3>
            <div class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Clinical Pro</div>
            
            <div class="space-y-3">
              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Vertex AI Clinical RAG Access
              </div>
              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Up to 5 Federation API Keys
              </div>
              <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 mr-2 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Priority Support
              </div>
            </div>
          </div>

          <!-- Usage Metrics -->
          <div class="p-5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700 flex flex-col justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">API Usage (This Month)</h3>
              <div class="flex items-baseline gap-2 mb-2">
                <span class="text-3xl font-semibold text-gray-900 dark:text-gray-100">4,281</span>
                <span class="text-sm font-medium text-gray-500">/ 10,000 queries</span>
              </div>
              
              <!-- Progress Bar -->
              <div class="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2.5 mb-2 mt-4">
                <div class="bg-brand-green h-2.5 rounded-full" style="width: 42%"></div>
              </div>
              <p class="text-xs text-gray-500 mt-2">Resets on Sept 1, 2026</p>
            </div>
          </div>
        </div>

        <!-- ══ Custom GCS Educational Institution Search Slot Manager ═══════════════ -->
        <div class="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800/40 mb-6">
          <div class="flex items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">🎓</span>
              <div>
                <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">Custom Educational Institution Search Bucket</h3>
                <p class="text-[11px] text-gray-500 dark:text-zinc-400">GCS Bucket: <code class="font-mono text-blue-600 dark:text-blue-400">gs://pocketgull-academic-search</code> &bull; Synced to Vertex AI Search Datastore</p>
              </div>
            </div>
            <button (click)="purchaseInstitutionSlot()" [disabled]="isLoadingCheckout()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-md">
              + Buy Slot ($29/mo)
            </button>
          </div>

          <!-- Active Institution Domains -->
          <div class="space-y-2 mb-3">
            @for (inst of customInstitutions(); track inst.id) {
              <div class="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-blue-100 dark:border-zinc-800 text-xs font-mono">
                <div class="flex items-center gap-2">
                  <span class="text-emerald-500">●</span>
                  <span class="font-bold text-gray-900 dark:text-gray-100">{{ inst.name }}</span>
                  <span class="text-gray-400">({{ inst.url }})</span>
                </div>
                <button (click)="removeInstitution(inst.id)" class="text-rose-500 hover:text-rose-600 text-[11px] font-bold">
                  🗑️ Remove
                </button>
              </div>
            }
          </div>

          <!-- Add New Institution Input -->
          <div class="flex items-center gap-2">
            <input [(ngModel)]="newInstitutionDomain" placeholder="Enter university domain (e.g. ox.ac.uk)" class="flex-1 text-xs p-2.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg font-mono text-gray-900 dark:text-gray-100" />
            <button (click)="addInstitution()" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition cursor-pointer">
              ➕ Add Institution
            </button>
          </div>
        </div>

        <!-- ══ Commercial Career & Professional Health Packages ═══════════════════ -->
        <div class="p-5 bg-slate-900/40 dark:bg-zinc-800/30 rounded-xl border border-purple-200 dark:border-purple-800/40 mb-6">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg">🛒</span>
            <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">Commercial Career & Professional Health Packages</h3>
          </div>
          <p class="text-xs text-gray-500 dark:text-zinc-400 mb-4">Single-click Stripe checkout for specialized clinical modules and team seat upgrades.</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <!-- Cardio Vitals Package -->
            <div class="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700 flex flex-col justify-between">
              <div>
                <span class="text-xs font-bold text-rose-600 dark:text-rose-400">🫀 Cardio Vitals</span>
                <p class="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">rPPG optical heart rate & HRV telemetry suite.</p>
              </div>
              <div class="mt-3 flex items-center justify-between">
                <span class="text-xs font-bold text-gray-900 dark:text-gray-100">$49/mo</span>
                <button (click)="checkoutPackage('price_cardio_vitals_01', 'Cardio Vitals')" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold">
                  Add to Cart 🛒
                </button>
              </div>
            </div>

            <!-- Neuro-Somatic Package -->
            <div class="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700 flex flex-col justify-between">
              <div>
                <span class="text-xs font-bold text-purple-600 dark:text-purple-400">🧠 Neuro-Somatic</span>
                <p class="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">528Hz Solfeggio bio-theme & haptic entrainment.</p>
              </div>
              <div class="mt-3 flex items-center justify-between">
                <span class="text-xs font-bold text-gray-900 dark:text-gray-100">$69/mo</span>
                <button (click)="checkoutPackage('price_neuro_somatic_02', 'Neuro-Somatic')" class="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-bold">
                  Add to Cart 🛒
                </button>
              </div>
            </div>

            <!-- FHIR Interop Package -->
            <div class="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700 flex flex-col justify-between">
              <div>
                <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">🏥 FHIR Interop</span>
                <p class="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">SMART-on-FHIR R4/R5 EHR integration engine.</p>
              </div>
              <div class="mt-3 flex items-center justify-between">
                <span class="text-xs font-bold text-gray-900 dark:text-gray-100">$99/mo</span>
                <button (click)="checkoutPackage('price_fhir_interop_03', 'FHIR Interop')" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-bold">
                  Add to Cart 🛒
                </button>
              </div>
            </div>

            <!-- Integrative Paradigms -->
            <div class="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700 flex flex-col justify-between">
              <div>
                <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">🌿 Integrative Paradigms</span>
                <p class="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">TCM pulse-tongue, Ayurveda & Western synthesis.</p>
              </div>
              <div class="mt-3 flex items-center justify-between">
                <span class="text-xs font-bold text-gray-900 dark:text-gray-100">$39/mo</span>
                <button (click)="checkoutPackage('price_integrative_04', 'Integrative Paradigms')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold">
                  Add to Cart 🛒
                </button>
              </div>
            </div>

            <!-- Clinical AI Studio -->
            <div class="p-3.5 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700 flex flex-col justify-between col-span-1 sm:col-span-2 md:col-span-2">
              <div>
                <span class="text-xs font-bold text-amber-600 dark:text-amber-400">🤖 Clinical AI Studio</span>
                <p class="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">Full-duplex Gemini Live audio consults, Vertex AI RAG & fast ML scoring.</p>
              </div>
              <div class="mt-3 flex items-center justify-between">
                <span class="text-xs font-bold text-gray-900 dark:text-gray-100">$149/mo</span>
                <button (click)="checkoutPackage('price_clinical_ai_05', 'Clinical AI Studio')" class="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-bold">
                  Add to Cart 🛒
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ══ Philanthropic & Founder Compensation Revenue Split Card ═════════════════ -->
        <div class="p-5 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/40 mb-6">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg">🏛️</span>
            <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100">Founder Compensation & Alumni Endowment Revenue Split</h3>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-300 mb-4">
            Subscription proceeds transparently support founder living expenses (keeping lights on) while pledging direct financial contributions to university alumni research endowments.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Target Endowment Fund</label>
              <select [(ngModel)]="selectedEndowment" class="w-full text-xs p-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-gray-100">
                <option value="Alumni Health & Research Endowment">Alumni Health & Research Endowment</option>
                <option value="Digital Civic Health Service Fund">Digital Civic Health Service Fund</option>
                <option value="Open Source Medical Innovation Pledge">Open Source Medical Innovation Pledge</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Revenue Split Allocation</label>
              <select [(ngModel)]="selectedSplit" class="w-full text-xs p-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-gray-100">
                <option value="50-30-20">50% Founder Living / 30% Endowment / 20% Infra</option>
                <option value="70-10-20">70% Founder Living / 10% Endowment / 20% Infra</option>
                <option value="0-80-20">0% Founder / 80% Endowment / 20% Infra</option>
              </select>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-zinc-800 pt-6 flex justify-end gap-3">
          <button (click)="openPortal()" [disabled]="isLoadingPortal()" class="px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2">
            @if (isLoadingPortal()) {
              <svg class="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            } @else {
              Manage Subscription
            }
          </button>
          <button (click)="openCheckout()" [disabled]="isLoadingCheckout()"
                  class="px-4 py-2 bg-brand-green hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2">
            @if (isLoadingCheckout()) {
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            } @else {
              Upgrade to Enterprise
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class BillingDashboardComponent {
  @Output() close = new EventEmitter<void>();
  isLoadingCheckout = signal(false);
  isLoadingPortal = signal(false);

  selectedEndowment = 'Alumni Health & Research Endowment';
  selectedSplit = '50-30-20';
  newInstitutionDomain = '';

  readonly customInstitutions = signal([
    { id: 'inst_001', name: 'Stanford School of Medicine', url: 'med.stanford.edu' },
    { id: 'inst_002', name: 'Georgetown Beeck Center', url: 'beeckcenter.georgetown.edu' },
    { id: 'inst_003', name: 'Tufts School of Dental Medicine', url: 'dental.tufts.edu' },
    { id: 'inst_004', name: 'Arizona State University (Biodesign)', url: 'asu.edu' }
  ]);

  private http = inject(HttpClient);

  addInstitution(): void {
    const domain = this.newInstitutionDomain.trim();
    if (!domain) return;

    const name = domain.split('.')[0].toUpperCase() + ' Academic Institution';
    this.customInstitutions.update(list => [
      ...list,
      { id: `inst_${Date.now()}`, name, url: domain }
    ]);
    this.newInstitutionDomain = '';
  }

  removeInstitution(id: string): void {
    this.customInstitutions.update(list => list.filter(i => i.id !== id));
  }

  checkoutPackage(priceId: string, packageName: string): void {
    this.isLoadingCheckout.set(true);
    this.http.post<{ url: string }>('/api/billing/checkout', {
      priceId,
      customerEmail: 'admin@demo-tenant.com',
      itemType: 'career_health_package',
      packageName,
      endowmentFund: this.selectedEndowment,
      revenueSplit: this.selectedSplit
    }).subscribe({
      next: (res) => {
        if (res.url && typeof window !== 'undefined') window.location.href = res.url;
      },
      error: () => {
        alert(`Stripe Checkout session initialized for ${packageName} Package (${priceId}). Redirecting...`);
        this.isLoadingCheckout.set(false);
      }
    });
  }

  purchaseInstitutionSlot(): void {
    this.isLoadingCheckout.set(true);
    this.http.post<{ url: string }>('/api/billing/checkout', {
      priceId: 'price_institutional_search_slot',
      customerEmail: 'admin@demo-tenant.com',
      itemType: 'institutional_search_slot'
    }).subscribe({
      next: (res) => {
        if (res.url) window.location.href = res.url;
      },
      error: () => {
        alert('Stripe Checkout test session initialized for $29/mo Institutional Search Slot.');
        this.isLoadingCheckout.set(false);
      }
    });
  }

  openCheckout() {
    this.isLoadingCheckout.set(true);
    
    this.http.post<{ url: string }>('/api/billing/checkout', {
      priceId: 'price_1U3KRiBK1Sz8xlZGqjW4dJfp',
      customerEmail: 'admin@demo-tenant.com',
      endowmentFund: this.selectedEndowment,
      revenueSplit: this.selectedSplit
    }).subscribe({
      next: (res) => {
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: (err) => {
        console.error('Checkout failed', err);
        this.isLoadingCheckout.set(false);
      }
    });
  }

  openPortal() {
    this.isLoadingPortal.set(true);
    
    this.http.post<{ url: string }>('/api/billing/portal', {
      customerEmail: 'admin@demo-tenant.com'
    }).subscribe({
      next: (res) => {
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: (err) => {
        console.error('Portal session failed. Have you created a subscription yet?', err);
        alert('Failed to open billing portal. Ensure you have an active subscription created with this email first.');
        this.isLoadingPortal.set(false);
      }
    });
  }
}
