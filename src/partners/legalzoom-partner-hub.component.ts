import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LegalZoomIntegrationService } from '../services/legalzoom-integration.service';
import { UniversalLivingWillService } from '../services/universal-living-will.service';
import { BrandedQrCodeComponent } from '../components/shared/branded-qr-code.component';

@Component({
  selector: 'app-legalzoom-partner-hub',
  standalone: true,
  imports: [CommonModule, BrandedQrCodeComponent],
  template: `
    <div class="w-full max-w-4xl mx-auto p-6 bg-zinc-950 text-gray-100 rounded-3xl border border-purple-500/30 shadow-2xl space-y-6">
      <!-- Header Banner -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-zinc-900 to-blue-950/80 border border-purple-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🏛️</span>
          <div>
            <h2 class="text-xl font-bold text-gray-100">Universal Living Will & Statutory Advance Directive Hub</h2>
            <p class="text-xs text-gray-400 mt-1">
              Access 100% free U.S. statutory state advance directives, FHIR R4 Consent bundles, and trusted digital estate options.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 border border-purple-500/30">
          <span class="text-xs font-mono font-bold text-emerald-400">Free Statutory Directives Available</span>
          <span class="text-xl">📜</span>
        </div>
      </div>

      <!-- Emergency EMT Advance Directive Scannable QR Code Overlay/Card -->
      @if (showEmergencyQr()) {
        <div class="p-5 bg-zinc-900/90 border border-amber-500/40 rounded-2xl flex flex-col items-center">
          <div class="flex items-center justify-between w-full mb-3">
            <span class="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              📱 Statutory Advance Directive EMT QR Pass
            </span>
            <button type="button" (click)="showEmergencyQr.set(false)" class="text-xs text-zinc-400 hover:text-white cursor-pointer">✕ Close</button>
          </div>
          <app-branded-qr-code
            [data]="emergencyQrPayload()"
            [size]="160"
            variant="amber"
            [showLogo]="true"
            [showCard]="false"
            [showDestinationGrounding]="true"
            [enableCopy]="true"
            [enableDownload]="true"
            downloadFilename="advance-directive-emt-qr.png"
            title="Statutory Advance Directive"
            ariaLabel="Emergency EMT Advance Directive QR Code">
          </app-branded-qr-code>
          <span class="text-[9.5px] font-mono text-zinc-400 mt-2 text-center">
            Zero-Cloud Offline Scannable • HIPAA §164.514 & FHIR R4 Consent Compliant
          </span>
        </div>
      }

      <!-- Living Will & Advance Directive Options Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (opt of universalWillService.partnerOptions(); track opt.id) {
          <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 flex flex-col justify-between space-y-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-purple-300">{{ opt.name }}</span>
                @if (opt.is100PercentFree) {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">100% FREE</span>
                } @else {
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-gray-400 border border-zinc-700">PLATFORM</span>
                }
              </div>
              <p class="text-xs text-gray-400">
                {{ opt.description }}
              </p>

              <div class="space-y-1 text-xs text-gray-300 pt-1">
                @for (dir of opt.supportedDirectives; track dir) {
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-400">✓</span> {{ dir }}
                  </div>
                }
              </div>
            </div>

            <div class="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <a 
                [href]="opt.actionUrl" 
                target="_blank" 
                class="text-[11px] font-mono text-purple-400 hover:underline flex items-center gap-1"
              >
                Access Portal ↗
              </a>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="toggleEmergencyQr()"
                  class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600/90 hover:bg-amber-500 text-white transition-all shadow-md flex items-center gap-1 cursor-pointer"
                >
                  <span>📱</span> QR
                </button>
                <button
                  (click)="exportFhirConsent()"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md cursor-pointer"
                >
                  Export FHIR (.JSON)
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class LegalZoomPartnerHubComponent {
  readonly legalZoomService = inject(LegalZoomIntegrationService);
  readonly universalWillService = inject(UniversalLivingWillService);

  readonly showEmergencyQr = signal<boolean>(false);

  readonly emergencyQrPayload = computed<string>(() => {
    const payload = this.universalWillService.generateFhirConsentPayload();
    return JSON.stringify({
      schema: 'POCKETGULL_FHIR_CONSENT_ADVANCE_DIRECTIVE',
      id: payload.id,
      patient: payload.patient.display,
      status: payload.status,
      scope: 'Advance Directive (adr)',
      dateTime: payload.dateTime
    });
  });

  toggleEmergencyQr(): void {
    this.showEmergencyQr.update(v => !v);
  }

  exportFhirConsent(): void {
    const consent = this.universalWillService.generateFhirConsentPayload();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(consent, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pocketgull_fhir_consent_advance_directive.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
