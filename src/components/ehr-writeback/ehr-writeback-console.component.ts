import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EhrWritebackService,
  IEhrWritebackBatchResult,
  IEhrSystemToken
} from '../../services/fhir/ehr-writeback.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ehr-writeback-console',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-6xl mx-auto bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl p-6 sm:p-7 font-mono relative overflow-hidden"
         role="region"
         aria-label="EHR Bi-Directional Writeback and Subscription ADT Console">
      <!-- Ambient Glow -->
      <div class="absolute -top-32 -right-32 w-80 h-80 bg-teal-500/10 blur-3xl rounded-full pointer-events-none"></div>
      <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-sky-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-6 relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center text-xl shadow-xs">
            🏥
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-black text-zinc-100 uppercase tracking-wider">
                EHR Bi-Directional Writeback &amp; Subscription ADT
              </h2>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                RFC 7523 private_key_jwt
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-sans mt-0.5">
              Automated DocumentReference, CarePlan &amp; Conformal Observation Filing • Instant FHIR R4 ADT Ingestion
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Vendor Selector -->
          <div class="flex items-center bg-zinc-900 border border-zinc-700/80 rounded-xl p-1 gap-1" role="radiogroup" aria-label="Target EHR Vendor">
            @for (v of vendors; track v.id) {
              <button type="button"
                      (click)="setVendor(v.id)"
                      [class.bg-teal-600]="activeVendor() === v.id"
                      [class.text-white]="activeVendor() === v.id"
                      [class.text-zinc-400]="activeVendor() !== v.id"
                      class="px-2.5 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer min-h-[36px] flex items-center gap-1.5"
                      [attr.aria-checked]="activeVendor() === v.id"
                      role="radio">
                <span>{{ v.icon }}</span>
                <span>{{ v.label }}</span>
              </button>
            }
          </div>

          <button type="button"
                  (click)="close.emit()"
                  aria-label="Close EHR Writeback Console"
                  class="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition min-h-[44px] min-w-[44px]">
            ✕
          </button>
        </div>
      </div>

      <!-- Telemetry Ribbon -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5">
          <div class="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Auth Protocol</div>
          <div class="text-xs font-bold text-teal-300 mt-1 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            RFC 7523 (RS384)
          </div>
          <div class="text-[10px] text-zinc-500 font-sans mt-0.5">Asymmetric Keyless JWT</div>
        </div>

        <div class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5">
          <div class="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Subscription Ingestion</div>
          <div class="text-xs font-bold text-emerald-300 mt-1 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ADT Active (REST Hook)
          </div>
          <div class="text-[10px] text-zinc-500 font-sans mt-0.5">/api/fhir/subscription</div>
        </div>

        <div class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5">
          <div class="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">USCDI v4 Profiles</div>
          <div class="text-xs font-bold text-sky-300 mt-1">3 Certified Resources</div>
          <div class="text-[10px] text-zinc-500 font-sans mt-0.5">DocRef • CarePlan • Obs</div>
        </div>

        <div class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5">
          <div class="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Audit Security</div>
          <div class="text-xs font-bold text-amber-300 mt-1">FDA 21 CFR Part 11</div>
          <div class="text-[10px] text-zinc-500 font-sans mt-0.5">SHA-256 Non-Repudiation</div>
        </div>
      </div>

      <!-- Action & Execution Bar -->
      <div class="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <span>⚡</span> Automated System-to-System Writeback
          </h3>
          <p class="text-xs text-zinc-400 font-sans mt-0.5">
            Executes keyless OAuth2 token assertion, formats USCDI v4 resources, and files directly to {{ activeVendorName() }}.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button type="button"
                  (click)="executeWriteback()"
                  [disabled]="writebackService.isWritingBack()"
                  class="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer min-h-[44px] shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
            @if (writebackService.isWritingBack()) {
              <span class="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
              <span>Filing to EHR...</span>
            } @else {
              <span>🚀 File SBAR, CarePlan &amp; Conformal Risk</span>
            }
          </button>

          <button type="button"
                  (click)="showJwksModal.set(!showJwksModal())"
                  class="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-bold transition cursor-pointer min-h-[44px]">
            {{ showJwksModal() ? 'Hide Keyring' : '🔑 Public JWKS' }}
          </button>
        </div>
      </div>

      <!-- JWKS & Assertion Card (Collapsible) -->
      @if (showJwksModal()) {
        <div class="bg-zinc-900 border border-teal-500/30 rounded-2xl p-5 mb-6 animate-fadeIn">
          <div class="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
            <div class="flex items-center gap-2">
              <span class="text-base">🔑</span>
              <span class="text-xs font-bold text-teal-300">RFC 7517 JSON Web Key Set (JWKS) Specification</span>
              <span class="text-[10px] text-zinc-500">(For Epic Connection Hub / Cerner Registration)</span>
            </div>
            <button type="button"
                    (click)="copyJwks()"
                    class="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold hover:bg-teal-500/30 transition cursor-pointer min-h-[36px]">
              {{ copiedJwks() ? '✓ Copied' : 'Copy JWKS JSON' }}
            </button>
          </div>
          <pre class="bg-zinc-950 p-3 rounded-xl text-[11px] text-zinc-300 overflow-x-auto max-h-48 border border-zinc-800/80">{{ jwksJson() }}</pre>
          <div class="flex items-center gap-4 text-[11px] text-zinc-400 mt-3 font-sans">
            <span>Algorithm: <strong class="text-zinc-200">RS384</strong></span>
            <span>Key ID: <strong class="text-zinc-200">{{ writebackService.keyId() }}</strong></span>
            <span>Client ID: <strong class="text-zinc-200">{{ writebackService.clientId() }}</strong></span>
          </div>
        </div>
      }

      <!-- Last Writeback Status Card -->
      @if (writebackService.lastBatchResult(); as batch) {
        <div class="bg-teal-950/20 border border-teal-500/40 rounded-2xl p-5 mb-6 relative">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-teal-500/20 pb-3 mb-4">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-teal-400"></span>
              <span class="text-xs font-bold text-teal-300">BATCH WRITEBACK COMPLETED: {{ batch.batchId }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-500/30 font-bold">
                {{ batch.overallStatus }}
              </span>
            </div>
            <div class="text-[10px] text-zinc-400">
              Timestamp: {{ batch.timestamp }}
            </div>
          </div>

          <!-- 3 Resource Receipts Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            @for (r of batch.receipts; track r.resourceType) {
              <div class="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-zinc-200">{{ r.resourceType }}</span>
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    HTTP {{ r.httpStatus }}
                  </span>
                </div>
                <div class="text-[11px] text-zinc-400 font-sans mb-1">LOINC: {{ r.loincCode }}</div>
                <div class="text-[10px] text-zinc-500 truncate" title="{{ r.fhirId }}">
                  ID: <span class="text-zinc-300">{{ r.fhirId }}</span>
                </div>
                <div class="text-[9px] text-teal-400/80 truncate mt-1">
                  Seal: {{ r.sha256AttestationSeal }}
                </div>
              </div>
            }
          </div>

          <!-- Inspection Drawer / View Tabs -->
          <div class="bg-zinc-900/95 border border-zinc-800 rounded-xl p-3">
            <div class="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-3">
              <span class="text-xs text-zinc-400 uppercase font-bold mr-2">Resource Inspector:</span>
              <button type="button"
                      (click)="activePreviewTab.set('DOCREF')"
                      [class.bg-teal-500/20]="activePreviewTab() === 'DOCREF'"
                      [class.text-teal-300]="activePreviewTab() === 'DOCREF'"
                      [class.text-zinc-400]="activePreviewTab() !== 'DOCREF'"
                      class="px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer min-h-[32px]">
                DocumentReference (SBAR)
              </button>
              <button type="button"
                      (click)="activePreviewTab.set('CAREPLAN')"
                      [class.bg-teal-500/20]="activePreviewTab() === 'CAREPLAN'"
                      [class.text-teal-300]="activePreviewTab() === 'CAREPLAN'"
                      [class.text-zinc-400]="activePreviewTab() !== 'CAREPLAN'"
                      class="px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer min-h-[32px]">
                CarePlan (Pathways)
              </button>
              <button type="button"
                      (click)="activePreviewTab.set('OBSERVATION')"
                      [class.bg-teal-500/20]="activePreviewTab() === 'OBSERVATION'"
                      [class.text-teal-300]="activePreviewTab() === 'OBSERVATION'"
                      [class.text-zinc-400]="activePreviewTab() !== 'OBSERVATION'"
                      class="px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer min-h-[32px]">
                Observation (Conformal Risk)
              </button>
              <button type="button"
                      (click)="activePreviewTab.set('JWT')"
                      [class.bg-teal-500/20]="activePreviewTab() === 'JWT'"
                      [class.text-teal-300]="activePreviewTab() === 'JWT'"
                      [class.text-zinc-400]="activePreviewTab() !== 'JWT'"
                      class="px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer min-h-[32px]">
                Client Assertion JWT
              </button>
            </div>

            <pre class="bg-zinc-950 p-3 rounded-lg text-[11px] text-zinc-300 overflow-x-auto max-h-60 border border-zinc-800/80">{{ currentPreviewJson() }}</pre>
          </div>
        </div>
      }

      <!-- Real-time Subscription Ingestion & ADT Simulation Panel -->
      <div class="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 mb-6">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-3 mb-4">
          <div>
            <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live FHIR R4 Subscription / ADT Ingestion Monitor
            </h3>
            <p class="text-xs text-zinc-400 font-sans mt-0.5">
              Listening at <code class="text-teal-300">/api/fhir/subscription</code> for admission, discharge, and telemetry triggers.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button type="button"
                    (click)="simulateAdtEvent('ADT_ADMISSION')"
                    [disabled]="isSimulating()"
                    class="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold transition cursor-pointer min-h-[40px] flex items-center gap-1.5 disabled:opacity-50">
              <span>📥 Simulate ADT Admission (A01)</span>
            </button>
            <button type="button"
                    (click)="simulateAdtEvent('ADT_DISCHARGE')"
                    [disabled]="isSimulating()"
                    class="px-3.5 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-xs font-bold transition cursor-pointer min-h-[40px] flex items-center gap-1.5 disabled:opacity-50">
              <span>📤 Simulate ADT Discharge (A03)</span>
            </button>
          </div>
        </div>

        <!-- Subscription Events Stream -->
        <div class="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          @if (subscriptionEvents().length === 0) {
            <div class="text-center py-6 text-xs text-zinc-500 font-sans">
              No subscription events received yet. Click "Simulate ADT Admission" above to trigger an incoming EHR notification.
            </div>
          } @else {
            @for (evt of subscriptionEvents(); track evt.id) {
              <div class="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-bold px-2 py-0.5 rounded-md"
                        [class.bg-emerald-500/20]="evt.eventType === 'ADT_ADMISSION'"
                        [class.text-emerald-300]="evt.eventType === 'ADT_ADMISSION'"
                        [class.bg-sky-500/20]="evt.eventType === 'ADT_DISCHARGE'"
                        [class.text-sky-300]="evt.eventType === 'ADT_DISCHARGE'">
                    {{ evt.eventType }}
                  </span>
                  <div>
                    <div class="text-xs font-bold text-zinc-200">
                      {{ evt.patientMrn }} • Encounter: {{ evt.encounterId }}
                    </div>
                    <div class="text-[11px] text-zinc-400 font-sans">
                      {{ evt.clinicalDecisionTriggered?.actionSummary }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] text-zinc-500">{{ evt.timestamp }}</div>
                  <div class="text-[9px] text-teal-400/70 font-mono truncate max-w-[180px]">
                    Seal: {{ evt.securityAttestation?.sha256Digest?.slice(0, 16) }}...
                  </div>
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Immutable Audit Ledger -->
      <div class="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
        <div class="flex items-center justify-between text-xs text-zinc-400 pb-2 mb-2 border-b border-zinc-800">
          <span class="font-bold uppercase tracking-wider">FDA 21 CFR Part 11 Electronic Records Audit Ledger</span>
          <span>{{ writebackService.writebackHistory().length }} Total Writebacks</span>
        </div>
        <div class="text-[11px] text-zinc-400 font-sans">
          All transactions are cryptographically signed with NIST SP 800-90A CSPRNG entropy and preserved in tamper-evident memory. System assertion nonces prevent replay attacks.
        </div>
      </div>
    </div>
  `
})
export class EhrWritebackConsoleComponent {
  public writebackService = inject(EhrWritebackService);
  private http = inject(HttpClient, { optional: true });

  readonly close = output<void>();

  // State
  readonly activeVendor = signal<'EPIC' | 'CERNER' | 'ATHENA' | 'GENERIC_FHIR'>('EPIC');
  readonly showJwksModal = signal<boolean>(false);
  readonly copiedJwks = signal<boolean>(false);
  readonly isSimulating = signal<boolean>(false);
  readonly activePreviewTab = signal<'DOCREF' | 'CAREPLAN' | 'OBSERVATION' | 'JWT'>('DOCREF');
  readonly localSubscriptionEvents = signal<any[]>([]);

  readonly vendors = [
    { id: 'EPIC' as const, label: 'Epic Hyperspace', icon: '🏛️' },
    { id: 'CERNER' as const, label: 'Cerner PowerChart', icon: '⚡' },
    { id: 'ATHENA' as const, label: 'Athenahealth', icon: '🌐' },
    { id: 'GENERIC_FHIR' as const, label: 'FHIR Sandbox', icon: '🧪' }
  ];

  readonly activeVendorName = computed(() => {
    const v = this.vendors.find(item => item.id === this.activeVendor());
    return v ? v.label : 'EHR System';
  });

  readonly jwksJson = computed(() => {
    return JSON.stringify(this.writebackService.getPublicJwks(), null, 2);
  });

  readonly subscriptionEvents = computed(() => {
    const liveFromService = this.writebackService.subscriptionEvents();
    if (liveFromService.length > 0) return liveFromService;
    return this.localSubscriptionEvents();
  });

  readonly currentPreviewJson = computed(() => {
    const last = this.writebackService.lastBatchResult();
    if (!last) return '// No batch writeback executed yet. Click "File SBAR, CarePlan & Conformal Risk" to preview.';

    switch (this.activePreviewTab()) {
      case 'DOCREF':
        return JSON.stringify(last.sbarDocumentReference, null, 2);
      case 'CAREPLAN':
        return JSON.stringify(last.carePlan, null, 2);
      case 'OBSERVATION':
        return JSON.stringify(last.conformalObservation, null, 2);
      case 'JWT':
        return JSON.stringify({
          header: last.clientAssertionJwtHeader,
          payload: last.clientAssertionJwtPayload
        }, null, 2);
      default:
        return '';
    }
  });

  constructor() {
    this.fetchSubscriptionHistory();
  }

  public setVendor(vendorId: 'EPIC' | 'CERNER' | 'ATHENA' | 'GENERIC_FHIR'): void {
    this.activeVendor.set(vendorId);
    this.writebackService.setVendor(vendorId);
  }

  public async executeWriteback(): Promise<void> {
    try {
      await this.writebackService.executeWriteback({
        ehrVendor: this.activeVendor()
      });
    } catch (err) {
      console.error('[EhrWritebackConsole] Writeback failed:', err);
    }
  }

  public copyJwks(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.jwksJson()).then(() => {
        this.copiedJwks.set(true);
        setTimeout(() => this.copiedJwks.set(false), 3000);
      });
    }
  }

  public async simulateAdtEvent(type: 'ADT_ADMISSION' | 'ADT_DISCHARGE'): Promise<void> {
    this.isSimulating.set(true);
    try {
      const mrn = 'MRN-' + Math.floor(100000 + Math.random() * 900000);
      await this.writebackService.simulateIncomingAdtEvent(type, mrn);
    } catch {
      this.addLocalSimulatedEvent(type);
    } finally {
      this.isSimulating.set(false);
    }
  }

  public fetchSubscriptionHistory(): void {
    if (this.http) {
      this.http.get<any>('/api/fhir/subscription/history?limit=10').subscribe({
        next: (data) => {
          if (data?.events) {
            this.writebackService.subscriptionEvents.set(data.events);
          }
        },
        error: () => {}
      });
    }
  }

  private addLocalSimulatedEvent(type: 'ADT_ADMISSION' | 'ADT_DISCHARGE'): void {
    const fakeMrn = 'MRN-' + Math.floor(100000 + Math.random() * 900000);
    const fakeId = 'sub-sim-' + Date.now().toString().slice(-6);
    const newEvent = {
      id: fakeId,
      eventType: type,
      patientMrn: fakeMrn,
      encounterId: 'enc-sim-' + Date.now().toString().slice(-5),
      timestamp: new Date().toISOString(),
      securityAttestation: {
        sha256Digest: 'sha256_mock_simulated_' + Math.random().toString(36).slice(2)
      },
      clinicalDecisionTriggered: {
        actionSummary: type === 'ADT_ADMISSION'
          ? `Simulated Admission for ${fakeMrn}. 95% Conformal Sepsis screening queued with epistemic abstention.`
          : `Simulated Discharge for ${fakeMrn}. Longitudinal care pathways synchronized with zero cloud egress.`
      }
    };

    this.localSubscriptionEvents.update(prev => [newEvent, ...prev.slice(0, 9)]);
  }
}
