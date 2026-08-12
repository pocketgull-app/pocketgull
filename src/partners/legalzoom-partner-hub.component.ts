import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LegalZoomIntegrationService } from '../services/legalzoom-integration.service';

@Component({
  selector: 'app-legalzoom-partner-hub',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-4xl mx-auto p-6 bg-zinc-950 text-gray-100 rounded-3xl border border-purple-500/30 shadow-2xl space-y-6">
      <!-- Header Banner -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-zinc-900 to-blue-950/80 border border-purple-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🏛️</span>
          <div>
            <h2 class="text-xl font-bold text-gray-100">Sovereign Estate Trust & Living Will Export Hub</h2>
            <p class="text-xs text-gray-400 mt-1">
              Export standardized, client-side digital data wills and living directives compatible with LegalZoom, FreeWill, or independent attorney networks.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 border border-purple-500/30">
          <span class="text-xs font-mono font-bold text-purple-300">Client-Side Sovereign Export</span>
          <span class="text-xl">📜</span>
        </div>
      </div>

      <!-- Sovereign Estate Packages Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (pkg of legalZoomService.availablePackages(); track pkg.packageId) {
          <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-purple-300">{{ pkg.packageName }}</span>
                <span class="text-xs font-mono font-bold text-emerald-400">Format: {{ pkg.documentFormat }}</span>
              </div>
              <p class="text-xs text-gray-400">
                Client-side document package pre-populated with your Pocketgull digital data directives, HIPAA Safe Harbor clauses, and executor settings.
              </p>

              <div class="space-y-1.5 text-xs text-gray-300 pt-1">
                <div class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span> Digital Sovereign Data Directives
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span> Living Healthcare Will & Directive
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span> HIPAA Safe Harbor §164.514 Release
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <a 
                [href]="pkg.impactRadiusPartnerTrackingUrl" 
                target="_blank" 
                class="text-[11px] font-mono text-purple-400 hover:underline flex items-center gap-1"
              >
                Official LegalZoom Partner Portal ↗
              </a>
              <button
                (click)="exportDocument(pkg.packageId)"
                class="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md"
              >
                Export Sovereign Bundle (.JSON / .PDF)
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class LegalZoomPartnerHubComponent {
  readonly legalZoomService = inject(LegalZoomIntegrationService);

  exportDocument(packageId: string): void {
    const bundle = this.legalZoomService.generateLegalZoomPayload();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pocketgull_sovereign_will_${packageId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
