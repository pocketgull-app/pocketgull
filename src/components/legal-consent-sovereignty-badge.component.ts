import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LegalConsentSovereigntyService } from '../services/legal-consent-sovereignty.service';

@Component({
  selector: 'app-legal-consent-sovereignty-badge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full max-w-4xl mx-auto p-6 bg-zinc-950 text-gray-100 rounded-3xl border border-blue-500/30 shadow-2xl space-y-6">
      <!-- Header Banner -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-zinc-900 to-purple-950/80 border border-blue-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">⚖️</span>
          <div>
            <h2 class="text-xl font-bold text-gray-100">Legal Sovereignty, HIPAA & GDPR Consent Guardrails</h2>
            <p class="text-xs text-gray-400 mt-1">
              Transparent legal compliance, electronic estate trust binding, anti-surveillance edge guarantees, and GDPR Art. 17 1-click purging.
            </p>
          </div>
        </div>

        <span class="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
          HIPAA & GDPR Sovereign
        </span>
      </div>

      <!-- Compliance Badges Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        @for (badge of legalService.legalComplianceBadges(); track badge.label) {
          <div class="p-4 bg-zinc-900/70 rounded-xl border border-zinc-800 space-y-2">
            <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{{ badge.label }}</div>
            <span class="inline-block px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {{ badge.status }}
            </span>
          </div>
        }
      </div>

      <!-- Electronic Estate Trust & Legal Will Directives -->
      <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">🏛️</span>
            <h3 class="text-sm font-bold text-gray-200">Electronic Will & Estate Data Trust Alignment</h3>
          </div>
          <span class="text-xs font-mono text-purple-400">LegalZoom / Trust Binding</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-400 mb-1">Legal Estate Trust Name</label>
            <input 
              [ngModel]="legalService.consentSettings().legalEstateTrustName" 
              (ngModelChange)="legalService.updateConsent({ legalEstateTrustName: $event })"
              class="w-full text-xs p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-200" 
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-400 mb-1">Designated Data Executor Email</label>
            <input 
              [ngModel]="legalService.consentSettings().designatedDataExecutorEmail" 
              (ngModelChange)="legalService.updateConsent({ designatedDataExecutorEmail: $event })"
              class="w-full text-xs p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-200" 
            />
          </div>
        </div>
      </div>

      <!-- GDPR Art. 17 Ephemeral Purge Bar -->
      <div class="p-4 bg-rose-950/20 rounded-xl border border-rose-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span class="text-xs font-bold text-rose-300">GDPR Article 17 "Right to be Forgotten" Purge</span>
          <p class="text-[11px] text-gray-400">Permanently purge all transient local storage and active clinical signals with 1 click.</p>
        </div>
        <button (click)="purgeData()" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition whitespace-nowrap">
          🗑️ Purge All Ephemeral Data
        </button>
      </div>
    </div>
  `
})
export class LegalConsentSovereigntyBadgeComponent {
  readonly legalService = inject(LegalConsentSovereigntyService);

  purgeData(): void {
    if (confirm('Are you sure you wish to execute a 1-click GDPR Article 17 data purge? This will immediately reset all transient local data.')) {
      this.legalService.purgeAllDataUnderGdprArt17();
      alert('GDPR Article 17 Data Purge Complete.');
    }
  }
}
