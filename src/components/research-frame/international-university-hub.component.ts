import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  InternationalUniversityGeofenceService, 
  InternationalJurisdiction, 
  IInternationalUniversityPartner 
} from '../../services/international-university-geofence.service';

@Component({
  selector: 'app-international-university-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-7 text-zinc-100 shadow-2xl space-y-6">
      
      <!-- Top Banner with Sovereign Geofence Status -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <span>🌐</span>
            <span>Sovereign Multi-Jurisdiction &amp; Global Research Alliances</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
            Sovereign Research Alliances &amp; Multi-Jurisdiction Hub
          </h2>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Point-of-care clinical research geofenced to HIPAA, NHS DTAC, PIPEDA, Australian Privacy Act, NZ HIPC, and India DPDP/ABDM standards.
          </p>
        </div>

        <!-- Cryptographic Sovereign Residency Seal -->
        <div class="bg-zinc-950 px-4 py-3 rounded-2xl border border-teal-500/30 space-y-1">
          <div class="flex items-center justify-between gap-3 text-[10px] font-mono text-zinc-400">
            <span>🔒 Geofence Seal:</span>
            <span class="text-teal-400 font-bold">{{ attestation().residencySealHash }}</span>
          </div>
          <div class="text-[10px] font-mono text-zinc-500">
            Zone: <span class="text-zinc-300">{{ attestation().sovereignEdgeRegion }}</span>
          </div>
        </div>
      </div>

      <!-- Seven-Nation Sovereign Selector Tabs -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 font-pocketgull-mono text-xs">
        <button
          type="button"
          (click)="service.setJurisdiction('US_NCAA')"
          [class.border-teal-500]="service.activeJurisdiction() === 'US_NCAA'"
          [class.bg-teal-500/10]="service.activeJurisdiction() === 'US_NCAA'"
          class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-left transition-all hover:border-zinc-700 min-h-[44px]">
          <span class="text-[10px] text-zinc-400 block">🇺🇸 UNITED STATES</span>
          <span class="text-xs font-bold text-white">HIPAA &amp; HTI-1</span>
        </button>

        <button
          type="button"
          (click)="service.setJurisdiction('UK_EU_GDPR')"
          [class.border-teal-500]="service.activeJurisdiction() === 'UK_EU_GDPR'"
          [class.bg-teal-500/10]="service.activeJurisdiction() === 'UK_EU_GDPR'"
          class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-left transition-all hover:border-zinc-700 min-h-[44px]">
          <span class="text-[10px] text-zinc-400 block">🇬🇧 UK &amp; NHS</span>
          <span class="text-xs font-bold text-white">DTAC &amp; UK-GDPR</span>
        </button>

        <button
          type="button"
          (click)="service.setJurisdiction('CA_PIPEDA')"
          [class.border-teal-500]="service.activeJurisdiction() === 'CA_PIPEDA'"
          [class.bg-teal-500/10]="service.activeJurisdiction() === 'CA_PIPEDA'"
          class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-left transition-all hover:border-zinc-700 min-h-[44px]">
          <span class="text-[10px] text-zinc-400 block">🇨🇦 CANADA</span>
          <span class="text-xs font-bold text-white">PIPEDA &amp; PHIPA</span>
        </button>

        <button
          type="button"
          (click)="service.setJurisdiction('APAC_CROSS_BORDER')"
          [class.border-teal-500]="service.activeJurisdiction() === 'APAC_CROSS_BORDER'"
          [class.bg-teal-500/10]="service.activeJurisdiction() === 'APAC_CROSS_BORDER'"
          class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-left transition-all hover:border-zinc-700 min-h-[44px]">
          <span class="text-[10px] text-zinc-400 block">🇦🇺 AUSTRALIA</span>
          <span class="text-xs font-bold text-white">Privacy Act &amp; TGA</span>
        </button>

        <button
          type="button"
          (click)="service.setJurisdiction('NZ_HIPC')"
          [class.border-teal-500]="service.activeJurisdiction() === 'NZ_HIPC'"
          [class.bg-teal-500/10]="service.activeJurisdiction() === 'NZ_HIPC'"
          class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-left transition-all hover:border-zinc-700 min-h-[44px]">
          <span class="text-[10px] text-zinc-400 block">🇳🇿 NEW ZEALAND</span>
          <span class="text-xs font-bold text-white">HIPC 2020 / CARE</span>
        </button>

        <button
          type="button"
          (click)="service.setJurisdiction('INDIA_AYUSH_ABDM')"
          [class.border-teal-500]="service.activeJurisdiction() === 'INDIA_AYUSH_ABDM'"
          [class.bg-teal-500/10]="service.activeJurisdiction() === 'INDIA_AYUSH_ABDM'"
          class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-left transition-all hover:border-zinc-700 min-h-[44px]">
          <span class="text-[10px] text-amber-400 block">🇮🇳 INDIA (BHARAT)</span>
          <span class="text-xs font-bold text-amber-300">AYUSH &amp; ABDM</span>
        </button>

        <button
          type="button"
          (click)="service.setJurisdiction('GLOBAL_WHO')"
          [class.border-teal-500]="service.activeJurisdiction() === 'GLOBAL_WHO'"
          [class.bg-teal-500/10]="service.activeJurisdiction() === 'GLOBAL_WHO'"
          class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-left transition-all hover:border-zinc-700 min-h-[44px]">
          <span class="text-[10px] text-zinc-400 block">🌍 GLOBAL WHO</span>
          <span class="text-xs font-bold text-white">Zero-Egress WASM</span>
        </button>
      </div>

      <!-- Regulatory & Anti-Doping Compliance Card -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs font-pocketgull-mono">
        <div class="space-y-1">
          <span class="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Statutory Privacy Standard</span>
          <span class="text-teal-300 font-semibold leading-tight block">{{ attestation().regulatoryStandard }}</span>
        </div>
        <div class="space-y-1">
          <span class="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Anti-Doping &amp; Lab Governance</span>
          <span class="text-amber-300 font-semibold leading-tight block">{{ attestation().antiDopingCompliance }}</span>
        </div>
        <div class="space-y-1">
          <span class="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Data Sovereignty Seal</span>
          <span class="text-zinc-300 font-semibold leading-tight block">{{ attestation().sovereignEdgeRegion }}</span>
        </div>
      </div>

      <!-- Flagship Research Alliances & Labs in Region -->
      <div class="space-y-3">
        <div class="flex items-center justify-between text-xs font-bold font-pocketgull-mono text-zinc-400">
          <span>🏛️ Accredited Sovereign Research Labs in Active Zone:</span>
          <span>{{ filteredPartners().length }} Verified Partners</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          @for (partner of filteredPartners(); track partner.id) {
            <div 
              (click)="service.selectUniversity(partner.id)"
              [class.border-teal-500]="service.selectedUniversityId() === partner.id"
              [class.bg-zinc-950]="service.selectedUniversityId() === partner.id"
              class="p-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 cursor-pointer transition-all space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white text-sm">{{ partner.name }}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {{ partner.country }}
                </span>
              </div>
              <div class="text-xs text-teal-300 font-medium">
                🔬 {{ partner.flagshipLab }}
              </div>
              <div class="text-[11px] text-zinc-400 font-mono flex items-center gap-2">
                <span>🛡️ {{ partner.regulatoryFramework }}</span>
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

  readonly attestation = this.service.activeGeofenceAttestation;

  readonly filteredPartners = computed(() => {
    const jur = this.service.activeJurisdiction();
    return this.service.internationalPartners().filter(p => p.jurisdiction === jur);
  });
}
