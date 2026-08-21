import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  InternationalUniversityGeofenceService, 
  InternationalJurisdiction, 
  IInternationalUniversityPartner 
} from '../../services/international-university-geofence.service';
import { POCKETGULL_CORPORATE_IDENTITY } from '../../services/corporate-identity';

@Component({
  selector: 'app-international-university-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-2xl space-y-6">
      
      <!-- Top Banner with Sovereign Geofence Status -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <span>🌐</span>
            <span>Geofenced International Medical &amp; Sports Science Network</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Sovereign Research Alliances &amp; Cross-Border Compliance
          </h2>
          <p class="text-xs sm:text-sm text-stone-400 mt-1">
            Geofenced clinical decision support adhering strictly to GDPR Art. 9, PIPEDA, APEC CBPR, and WADA anti-doping frameworks.
          </p>
        </div>

        <!-- Cryptographic Sovereign Residency Seal -->
        <div class="bg-stone-950 px-4 py-3 rounded-2xl border border-indigo-500/30 space-y-1">
          <div class="flex items-center justify-between gap-3 text-[10px] font-mono text-stone-400">
            <span>🔒 Geofence Seal:</span>
            <span class="text-indigo-400 font-bold">{{ attestation().residencySealHash }}</span>
          </div>
          <div class="text-[10px] font-mono text-stone-500">
            Zone: <span class="text-stone-300">{{ attestation().sovereignEdgeRegion }}</span>
          </div>
        </div>
      </div>

      <!-- Jurisdiction Selector HUD -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          type="button"
          (click)="service.setJurisdiction('US_NCAA')"
          [class.border-indigo-500]="service.activeJurisdiction() === 'US_NCAA'"
          [class.bg-indigo-500/10]="service.activeJurisdiction() === 'US_NCAA'"
          class="p-3 rounded-xl border border-stone-800 bg-stone-950 text-left transition-all">
          <span class="text-[10px] font-mono text-stone-400 block">🇺🇸 UNITED STATES</span>
          <span class="text-xs font-bold text-white">HIPAA &amp; NCAA</span>
        </button>

        <button
          type="button"
          (click)="service.setJurisdiction('UK_EU_GDPR')"
          [class.border-indigo-500]="service.activeJurisdiction() === 'UK_EU_GDPR'"
          [class.bg-indigo-500/10]="service.activeJurisdiction() === 'UK_EU_GDPR'"
          class="p-3 rounded-xl border border-stone-800 bg-stone-950 text-left transition-all">
          <span class="text-[10px] font-mono text-stone-400 block">🇬🇧 🇪🇺 UK &amp; EU</span>
          <span class="text-xs font-bold text-white">GDPR Art. 9 &amp; UKAD</span>
        </button>

        <button
          type="button"
          (click)="service.setJurisdiction('APAC_CROSS_BORDER')"
          [class.border-indigo-500]="service.activeJurisdiction() === 'APAC_CROSS_BORDER'"
          [class.bg-indigo-500/10]="service.activeJurisdiction() === 'APAC_CROSS_BORDER'"
          class="p-3 rounded-xl border border-stone-800 bg-stone-950 text-left transition-all">
          <span class="text-[10px] font-mono text-stone-400 block">🇯🇵 🇸🇬 🇦🇺 APAC</span>
          <span class="text-xs font-bold text-white">APEC CBPR &amp; AIS</span>
        </button>

        <button
          type="button"
          (click)="service.setJurisdiction('CA_PIPEDA')"
          [class.border-indigo-500]="service.activeJurisdiction() === 'CA_PIPEDA'"
          [class.bg-indigo-500/10]="service.activeJurisdiction() === 'CA_PIPEDA'"
          class="p-3 rounded-xl border border-stone-800 bg-stone-950 text-left transition-all">
          <span class="text-[10px] font-mono text-stone-400 block">🇨🇦 CANADA</span>
          <span class="text-xs font-bold text-white">PIPEDA &amp; CCES</span>
        </button>

        <button
          type="button"
          (click)="service.setJurisdiction('GLOBAL_WHO')"
          [class.border-indigo-500]="service.activeJurisdiction() === 'GLOBAL_WHO'"
          [class.bg-indigo-500/10]="service.activeJurisdiction() === 'GLOBAL_WHO'"
          class="p-3 rounded-xl border border-stone-800 bg-stone-950 text-left transition-all col-span-2 sm:col-span-1">
          <span class="text-[10px] font-mono text-stone-400 block">🌍 GLOBAL SOUTH</span>
          <span class="text-xs font-bold text-white">WHO Offline WASM</span>
        </button>
      </div>

      <!-- Regulatory & Anti-Doping Compliance Card -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-stone-950 rounded-2xl border border-stone-800">
        <div class="space-y-1">
          <div class="text-[10px] font-mono text-stone-500 uppercase">Statutory Framework</div>
          <div class="text-xs font-bold text-white">{{ attestation().regulatoryStandard }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-[10px] font-mono text-stone-500 uppercase">Anti-Doping Authority</div>
          <div class="text-xs font-bold text-amber-400">{{ attestation().antiDopingCompliance }}</div>
        </div>
        <div class="space-y-1">
          <div class="text-[10px] font-mono text-stone-500 uppercase">Cross-Border Egress Status</div>
          <div class="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
            <span>🛡️</span>
            <span>Locked to Sovereign Zone (0 Egress)</span>
          </div>
        </div>
      </div>

      <!-- Filtered International University Partner Cards -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-white">
            Geofenced Universities &amp; Medical Institutes ({{ filteredPartners().length }})
          </h3>
          <span class="text-[10px] font-mono text-stone-500">Dual-Custody Research Silo</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (uni of filteredPartners(); track uni.id) {
            <div 
              [class.border-indigo-500]="service.selectedUniversityId() === uni.id"
              (click)="service.selectUniversity(uni.id)"
              class="p-4 rounded-2xl bg-stone-950 border border-stone-800 hover:border-indigo-400/60 cursor-pointer transition-all space-y-2 group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">{{ uni.country }}</span>
                <span class="text-[10px] font-mono text-amber-400">{{ uni.antiDopingAuthority }}</span>
              </div>
              <h4 class="text-xs font-bold text-white group-hover:text-indigo-300">{{ uni.name }}</h4>
              <p class="text-[11px] text-stone-400 line-clamp-2">{{ uni.flagshipLab }}</p>
              <div class="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono text-stone-500">
                <span>{{ uni.geofencedCloudRegion }}</span>
                <span class="text-emerald-400">Sovereign Active</span>
              </div>
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class InternationalUniversityHubComponent {
  readonly service = inject(InternationalUniversityGeofenceService);
  readonly corporate = POCKETGULL_CORPORATE_IDENTITY;

  readonly attestation = computed(() => this.service.activeGeofenceAttestation());

  readonly filteredPartners = computed<IInternationalUniversityPartner[]>(() => {
    const jur = this.service.activeJurisdiction();
    if (jur === 'GLOBAL_WHO') {
      return this.service.internationalPartners();
    }
    return this.service.internationalPartners().filter(p => p.jurisdiction === jur);
  });
}
