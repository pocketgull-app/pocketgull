import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderTreatmentNetworkService, IClinicianPeer, ITreatmentCenter } from '../services/provider-treatment-network.service';

@Component({
  selector: 'app-provider-treatment-network',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-xl backdrop-blur-md transition-all hover:border-emerald-500/40">
      <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg">
            🩺
          </div>
          <div>
            <h3 class="text-base font-semibold text-zinc-100">Clinician Peer Match & Treatment Locator</h3>
            <p class="text-xs text-zinc-400">Discover Colleagues Working on Similar Measures & Accredited Care Facilities</p>
          </div>
        </div>
        
        <div class="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button 
            (click)="activeTab.set('peers')"
            [class.bg-teal-600]="activeTab() === 'peers'"
            [class.text-white]="activeTab() === 'peers'"
            [class.text-zinc-400]="activeTab() !== 'peers'"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all">
            Clinician Peers
          </button>
          <button 
            (click)="activeTab.set('facilities')"
            [class.bg-teal-600]="activeTab() === 'facilities'"
            [class.text-white]="activeTab() === 'facilities'"
            [class.text-zinc-400]="activeTab() !== 'facilities'"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all">
            Treatment Centers
          </button>
        </div>
      </div>

      <!-- Peer Clinician Matchmaker View -->
      @if (activeTab() === 'peers') {
        <div class="mt-4 space-y-3">
          @for (peer of networkService.peers(); track peer.id) {
            <div class="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-teal-500/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-semibold text-zinc-100">{{ peer.name }}</h4>
                  <span class="px-2 py-0.5 text-[10px] font-mono rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    {{ peer.matchScorePercent }}% Measure Match
                  </span>
                </div>
                <p class="text-xs text-zinc-400">{{ peer.title }} • {{ peer.department }}</p>
                <div class="flex flex-wrap gap-1.5 pt-1">
                  @for (m of peer.activeMeasures; track m) {
                    <span class="px-2 py-0.5 text-[10px] rounded-full bg-zinc-800 text-zinc-300">{{ m }}</span>
                  }
                </div>
              </div>
              <div class="flex items-center gap-2">
                <a 
                  [href]="'mailto:' + peer.contactEmail"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-all flex items-center gap-1.5">
                  <span>✉️</span> Connect
                </a>
              </div>
            </div>
          }
        </div>
      }

      <!-- Treatment & Care Locator View -->
      @if (activeTab() === 'facilities') {
        <div class="mt-4 space-y-3">
          @for (facility of networkService.treatmentCenters(); track facility.id) {
            <div class="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-emerald-500/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-semibold text-zinc-100">{{ facility.facilityName }}</h4>
                  @if (facility.isEmergency247) {
                    <span class="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      🚨 24/7 Care
                    </span>
                  }
                </div>
                <p class="text-xs text-zinc-400">{{ facility.facilityType }} • {{ facility.cityState }} ({{ facility.distanceMiles }} miles)</p>
                <div class="flex flex-wrap gap-1.5 pt-1">
                  @for (prog of facility.specializedPrograms; track prog) {
                    <span class="px-2 py-0.5 text-[10px] rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">{{ prog }}</span>
                  }
                </div>
              </div>
              <div class="flex items-center gap-2">
                <a 
                  [href]="'tel:' + facility.phone"
                  class="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5">
                  <span>📞</span> Call Center
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ProviderTreatmentNetworkComponent {
  readonly activeTab = signal<'peers' | 'facilities'>('peers');

  constructor(public networkService: ProviderTreatmentNetworkService = new ProviderTreatmentNetworkService()) {}
}
