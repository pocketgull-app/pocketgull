import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HiddenPartnersRegistryService } from './hidden-partners-registry';
import { LegalZoomPartnerConnectorService } from './legalzoom-partner-connector';

@Component({
  selector: 'app-hidden-partners-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-4xl mx-auto p-6 bg-zinc-950 text-gray-100 rounded-3xl border border-purple-500/30 shadow-2xl space-y-6">
      <!-- Header Banner -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-zinc-900 to-indigo-950/80 border border-purple-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🕵️</span>
          <div>
            <h2 class="text-xl font-bold text-gray-100">Hidden Partners Registry & LegalZoom Module</h2>
            <p class="text-xs text-gray-400 mt-1">
              Encapsulated, zero-friction commercial partner connectors (LegalZoom, Travel/Sports, Commercial Health) protected by strict privacy guardrails.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          {{ registry.activeHiddenPartnersCount() }} Hidden Partner Modules Active
        </div>
      </div>

      <!-- LegalZoom Connector Capability Spotlight -->
      <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">🏛️</span>
            <h3 class="text-sm font-bold text-gray-200">{{ legalZoomConnector.partnerMetadata().partnerName }}</h3>
          </div>
          <span class="text-xs font-mono text-purple-400">HIPAA Safe Harbor §164.514</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          @for (cap of legalZoomConnector.exportCapabilities(); track cap) {
            <div class="p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/60 text-xs text-gray-300 flex items-center gap-2">
              <span class="text-emerald-400">✓</span> {{ cap }}
            </div>
          }
        </div>
      </div>

      <!-- Registered Hidden Partners Grid -->
      <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-3">
        <h3 class="text-sm font-bold text-gray-200">Registered Hidden Partner Connectors</h3>
        <div class="space-y-2">
          @for (partner of registry.registeredHiddenPartners(); track partner.partnerId) {
            <div class="p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/60 flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-gray-200">{{ partner.partnerName }}</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    {{ partner.category }}
                  </span>
                </div>
                <div class="text-[11px] font-mono text-gray-400 mt-1">{{ partner.officialPortalUrl }}</div>
              </div>

              <span class="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                🔒 ENCAPSULATED
              </span>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class HiddenPartnersModalComponent {
  readonly registry = inject(HiddenPartnersRegistryService);
  readonly legalZoomConnector = inject(LegalZoomPartnerConnectorService);
}
