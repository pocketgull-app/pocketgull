import { Component, ChangeDetectionStrategy, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalCodingCopilotService, ICodingSuggestion } from '../services/clinical-coding-copilot.service';

@Component({
  selector: 'app-clinical-coding-copilot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300 select-none"
             [ngClass]="containerThemeClass()">
      
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Header & Productivity Ribbon -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border shadow-xl backdrop-blur-md"
             [ngClass]="cardThemeClass()">
          
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                👩‍⚕️ HIM & CODING AUDITOR COPILOT · USCDI v4 · CMS-HCC V28
              </span>
              <span class="text-xs text-zinc-400 font-mono">100% Keyboard Driven (Vim Shortcuts Enabled)</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Clinical Coding & Multi-Terminology Crosswalk Suite
            </h1>
            <p class="text-xs text-zinc-400 max-w-2xl">
              Real-time crosswalk between SNOMED-CT, ICD-10-CM, CPT-4/HCPCS, CMS-HCC V28, and LOINC with 2024 AMA E/M MDM scoring and FHIR R4 claim export.
            </p>
          </div>

          <!-- RAF Score & Productivity Badges -->
          <div class="flex flex-wrap items-center gap-3">
            <div class="p-3 rounded-2xl bg-zinc-950/80 border border-amber-500/30 text-center min-w-[110px]">
              <div class="text-[10px] font-mono text-zinc-400 uppercase">CMS-HCC RAF</div>
              <div class="text-xl font-mono font-black text-amber-400">+{{ copilotService.totalRafScore().toFixed(3) }}</div>
            </div>

            <div class="p-3 rounded-2xl bg-zinc-950/80 border border-sky-500/30 text-center min-w-[110px]">
              <div class="text-[10px] font-mono text-zinc-400 uppercase">Work RVUs</div>
              <div class="text-xl font-mono font-black text-sky-400">{{ copilotService.totalWorkRvus().toFixed(2) }}</div>
            </div>

            <div class="p-3 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 text-center min-w-[110px]">
              <div class="text-[10px] font-mono text-zinc-400 uppercase">Est. Reimbursement</div>
              <div class="text-xl font-mono font-black text-emerald-400">
                \${{ copilotService.totalEstimatedReimbursement().toFixed(2) }}
              </div>
            </div>

            <!-- Eye Care Theme Selector -->
            <div class="flex items-center gap-1 p-1.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono">
              <button (click)="copilotService.setEyeCareMode('warm-amber')"
                      type="button"
                      [class.bg-amber-950]="copilotService.eyeCareMode() === 'warm-amber'"
                      [class.text-amber-300]="copilotService.eyeCareMode() === 'warm-amber'"
                      class="min-h-[44px] px-2.5 py-1 rounded-xl transition cursor-pointer text-zinc-400">
                🕯️ Amber
              </button>
              <button (click)="copilotService.setEyeCareMode('oled-dark')"
                      type="button"
                      [class.bg-zinc-800]="copilotService.eyeCareMode() === 'oled-dark'"
                      [class.text-white]="copilotService.eyeCareMode() === 'oled-dark'"
                      class="min-h-[44px] px-2.5 py-1 rounded-xl transition cursor-pointer text-zinc-400">
                ⬛ OLED
              </button>
            </div>
          </div>

        </div>

        <!-- Main 2-Column Workstation Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Left Column (5 Cols): Clinical Note & Evidence Inspector -->
          <div class="lg:col-span-5 space-y-4">
            
            <div class="p-5 rounded-3xl border space-y-3"
                 [ngClass]="cardThemeClass()">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                  📄 Source Clinical Record & Chart Evidence
                </span>
                <button (click)="runSampleAudit()"
                        type="button"
                        class="min-h-[44px] px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-mono border border-amber-500/40 transition cursor-pointer">
                  Load Complex Chart
                </button>
              </div>

              <textarea [(ngModel)]="chartInputText"
                        rows="12"
                        class="w-full p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500/80 transition resize-y leading-relaxed"
                        placeholder="Paste physician SOAP note, discharge summary, or operative transcript here..."></textarea>

              <div class="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button (click)="analyzeCurrentNote()"
                        type="button"
                        class="min-h-[48px] px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer">
                  ⚡ Auto-Extract & Crosswalk
                </button>
                <button (click)="copilotService.acceptAll()"
                        type="button"
                        class="min-h-[48px] px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider border border-zinc-700 transition cursor-pointer">
                  Accept All (Ctrl+A)
                </button>
              </div>
            </div>

            <!-- Multi-Terminology Export Suite -->
            <div class="p-5 rounded-3xl border space-y-3"
                 [ngClass]="cardThemeClass()">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                📦 Interoperability & Claim Serialization
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button (click)="exportFhirR4Claim()"
                        type="button"
                        class="min-h-[48px] px-3 py-2 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 text-xs font-mono border border-emerald-700 transition cursor-pointer flex items-center justify-center gap-1.5">
                  <span>🔥</span>
                  <span>Export FHIR R4 Bundle</span>
                </button>

                <button (click)="exportDenialDefense()"
                        type="button"
                        class="min-h-[48px] px-3 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-amber-200 text-xs font-mono border border-amber-600/40 transition cursor-pointer flex items-center justify-center gap-1.5">
                  <span>🛡️</span>
                  <span>1-Click Denial Defense</span>
                </button>
              </div>

              @if (exportNotice()) {
                <div class="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between">
                  <span>{{ exportNotice() }}</span>
                  <button (click)="exportNotice.set(null)" class="text-emerald-400 hover:text-white">&times;</button>
                </div>
              }
            </div>

            <!-- Keyboard Shortcuts Legend (Ergonomic RSI Protection) -->
            <div class="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 flex flex-wrap items-center justify-between gap-2">
              <span>⌨️ Shortcuts:</span>
              <span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-300 font-bold">J / ↓ Next</span>
              <span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-300 font-bold">K / ↑ Prev</span>
              <span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-300 font-bold">A Accept</span>
              <span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-rose-300 font-bold">D Dispute</span>
            </div>

          </div>

          <!-- Right Column (7 Cols): Coding Suggestions & Crosswalk Matrix -->
          <div class="lg:col-span-7 space-y-4">
            
            @if (activeReport(); as report) {
              
              <!-- E&M Level & Medical Decision Making (MDM) Header -->
              <div class="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span class="text-[10px] font-mono text-zinc-400 uppercase block">RECOMMENDED ENCOUNTER E&M CODE</span>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="text-2xl font-mono font-black text-amber-300">CPT {{ report.mdmAudit.emLevel }}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        MDM: {{ report.mdmAudit.mdmLevel }}
                      </span>
                      <span class="text-xs font-mono text-emerald-400 font-bold">
                        \${{ report.mdmAudit.estimatedMedicarePayment.toFixed(2) }} ({{ report.mdmAudit.workRvu.toFixed(2) }} RVU)
                      </span>
                    </div>
                  </div>

                  <div class="text-right">
                    <span class="text-[10px] font-mono text-zinc-400 uppercase block">ACCEPTED CODES</span>
                    <span class="text-lg font-mono font-black text-emerald-400">{{ acceptedCount() }} / {{ totalSuggestionsCount() }}</span>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-400">
                  <div class="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <div class="text-zinc-500 text-[10px] uppercase">1. Problems Addressed</div>
                    <div class="font-bold text-zinc-200 truncate">{{ report.mdmAudit.problemsAddressed.level }}</div>
                  </div>
                  <div class="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <div class="text-zinc-500 text-[10px] uppercase">2. Data Reviewed</div>
                    <div class="font-bold text-zinc-200 truncate">{{ report.mdmAudit.dataReviewed.level }}</div>
                  </div>
                  <div class="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <div class="text-zinc-500 text-[10px] uppercase">3. Management Risk</div>
                    <div class="font-bold text-zinc-200 truncate">{{ report.mdmAudit.riskOfComplications.level }}</div>
                  </div>
                </div>
              </div>

              <!-- Suggestions List with Multi-Terminology Crosswalk Pills -->
              <div class="space-y-3">
                @for (sug of report.suggestions; track sug.id; let idx = $index) {
                  <div class="p-5 rounded-3xl border transition-all cursor-pointer relative"
                       (click)="copilotService.selectedIndex.set(idx)"
                       [ngClass]="suggestionCardClass(sug, idx)">
                    
                    <!-- Top Ribbon -->
                    <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800/60 text-xs font-mono">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="px-2.5 py-0.5 rounded-lg text-xs font-black bg-zinc-950 border border-zinc-700 text-white shadow-sm">
                          {{ sug.code }}
                        </span>
                        <span class="text-zinc-400 font-bold">{{ sug.codeType }}</span>
                        @if (sug.hccCategory) {
                          <span class="px-2 py-0.5 rounded-md text-[10px] bg-amber-950 text-amber-300 border border-amber-500/30 font-bold">
                            {{ sug.hccCategory }}
                          </span>
                        }
                      </div>

                      <div class="flex items-center gap-2">
                        @if (sug.rafWeight) {
                          <span class="text-amber-400 font-bold text-[11px]">RAF +{{ sug.rafWeight.toFixed(3) }}</span>
                        }
                        <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold"
                              [ngClass]="statusBadgeClass(sug.status)">
                          {{ sug.status }}
                        </span>
                      </div>
                    </div>

                    <!-- Description -->
                    <div class="pt-2 text-sm font-semibold text-zinc-100">
                      {{ sug.description }}
                    </div>

                    <!-- Crosswalk Badges (SNOMED, CPT, LOINC, RxNorm) -->
                    <div class="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                      @if (sug.snomedCode) {
                        <span class="px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-600/40 text-sky-300" title="SNOMED-CT Concept ID">
                          🩺 SCT: {{ sug.snomedCode }}
                        </span>
                      }
                      @if (sug.cptCodes && sug.cptCodes.length > 0) {
                        @for (cpt of sug.cptCodes; track cpt) {
                          <span class="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-600/40 text-emerald-300" title="Associated CPT Procedure Code">
                            📋 CPT: {{ cpt }}
                          </span>
                        }
                      }
                      @if (sug.loincCode) {
                        <span class="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-600/40 text-purple-300" title="LOINC Lab Code">
                          🧪 LOINC: {{ sug.loincCode }}
                        </span>
                      }
                      @if (sug.rxNormCui) {
                        <span class="px-2 py-0.5 rounded-md bg-teal-950/80 border border-teal-600/40 text-teal-300" title="RxNorm CUI">
                          💊 RxCUI: {{ sug.rxNormCui }}
                        </span>
                      }
                    </div>

                    <!-- Evidence Quote Callout -->
                    <div class="mt-2.5 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs font-mono text-zinc-300 space-y-1">
                      <div class="text-[10px] text-amber-400/80 uppercase font-bold flex items-center gap-1">
                        <span>🔍</span> Chart Quote ({{ sug.chartLocation }}):
                      </div>
                      <div class="italic text-zinc-200">"{{ sug.evidenceQuote }}"</div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800/60">
                      <div class="text-[10px] font-mono text-zinc-500">
                        {{ sug.ahaCodingClinicRef || 'CMS Title XVIII & USCDI v4 Compliant' }}
                      </div>

                      <div class="flex items-center gap-2">
                        <button (click)="copilotService.rejectCode(sug.id); $event.stopPropagation()"
                                type="button"
                                class="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-mono border border-rose-800 transition cursor-pointer">
                          Dispute (D)
                        </button>
                        <button (click)="copilotService.acceptCode(sug.id); $event.stopPropagation()"
                                type="button"
                                class="min-h-[44px] px-4 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-xs font-mono border border-emerald-800 transition cursor-pointer font-bold">
                          Accept (A)
                        </button>
                      </div>
                    </div>

                  </div>
                }
              </div>

            } @else {
              <!-- Empty State -->
              <div class="p-12 rounded-3xl border border-zinc-800 bg-zinc-950/60 text-center space-y-3">
                <div class="text-4xl">📋</div>
                <h3 class="text-lg font-serif font-bold text-white">No Active Chart Audit Loaded</h3>
                <p class="text-xs text-zinc-400 max-w-md mx-auto">
                  Paste clinical documentation in the left window or click "Load Complex Chart" to analyze and extract ICD-10, SNOMED-CT, CPT, HCC, and SDOH codes.
                </p>
                <button (click)="runSampleAudit()"
                        type="button"
                        class="min-h-[48px] px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer">
                  Load Clinical Demo Chart
                </button>
              </div>
            }

          </div>

        </div>

      </div>

    </section>
  `
})
export class ClinicalCodingCopilotComponent {
  copilotService = inject(ClinicalCodingCopilotService);

  exportNotice = signal<string | null>(null);

  chartInputText = `Patient is a 64-year-old female presenting with long-standing Type 2 Diabetes Mellitus with worsening bilateral foot numbness and neuropathic tingling, consistent with diabetic peripheral neuropathy.

Cardiovascular evaluation demonstrates chronic congestive heart failure with reduced ejection fraction (LVEF 32%) on recent echocardiogram, managed with daily carvedilol and furosemide.

Renal function shows stable Chronic Kidney Disease Stage 4 with baseline serum creatinine of 2.3 mg/dL and eGFR 24 mL/min/1.73m².

Social history: Patient reports significant food insecurity, noting difficulty affording fresh diabetic-friendly groceries on a fixed social security budget.

Plan: Adjusted insulin glargine, initiated dapagliflozin renal protocol, and placed referral to social work for community food assistance.`;

  readonly activeReport = computed(() => this.copilotService.activeAuditReport());
  readonly acceptedCount = computed(() => this.copilotService.activeAuditReport()?.acceptedCodesCount || 0);
  readonly totalSuggestionsCount = computed(() => this.copilotService.activeAuditReport()?.totalSuggestedCodes || 0);

  ngOnInit(): void {
    if (!this.copilotService.activeAuditReport()) {
      this.copilotService.auditChartText(this.chartInputText, 'p_marie_curie');
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardHotkeys(event: KeyboardEvent): void {
    if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) return;

    if (event.key.toLowerCase() === 'j' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.copilotService.selectNext();
    } else if (event.key.toLowerCase() === 'k' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.copilotService.selectPrev();
    } else if (event.key.toLowerCase() === 'a') {
      event.preventDefault();
      const report = this.copilotService.activeAuditReport();
      if (report && report.suggestions[this.copilotService.selectedIndex()]) {
        this.copilotService.acceptCode(report.suggestions[this.copilotService.selectedIndex()].id);
      }
    } else if (event.key.toLowerCase() === 'd') {
      event.preventDefault();
      const report = this.copilotService.activeAuditReport();
      if (report && report.suggestions[this.copilotService.selectedIndex()]) {
        this.copilotService.rejectCode(report.suggestions[this.copilotService.selectedIndex()].id);
      }
    }
  }

  analyzeCurrentNote(): void {
    this.copilotService.auditChartText(this.chartInputText, 'p_custom_chart');
  }

  runSampleAudit(): void {
    this.copilotService.auditChartText(this.chartInputText, 'p_marie_curie');
  }

  exportFhirR4Claim(): void {
    const bundle = this.copilotService.exportFhirR4ClaimBundle();
    if (!bundle) return;

    const jsonStr = JSON.stringify(bundle, null, 2);
    if (typeof window !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/fhir+json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FHIR_R4_CLAIM_BUNDLE_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.exportNotice.set(`FHIR R4 Bundle downloaded (${bundle.entry?.length || 0} conditions serialized)`);
    }
  }

  exportDenialDefense(): void {
    const packet = this.copilotService.generateDenialDefensePacket();
    if (typeof window !== 'undefined') {
      const blob = new Blob([packet], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DENIAL_DEFENSE_PACKET_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      this.exportNotice.set('Denial Defense Dossier downloaded successfully');
    }
  }

  containerThemeClass(): string {
    switch (this.copilotService.eyeCareMode()) {
      case 'warm-amber': return 'bg-[#0f0c08] text-amber-100';
      case 'oled-dark': return 'bg-[#000000] text-zinc-100';
      case 'high-contrast': return 'bg-[#18181b] text-white';
    }
  }

  cardThemeClass(): string {
    switch (this.copilotService.eyeCareMode()) {
      case 'warm-amber': return 'bg-[#1a140e]/90 border-amber-900/40 text-amber-100';
      case 'oled-dark': return 'bg-[#09090b]/90 border-zinc-800 text-zinc-100';
      case 'high-contrast': return 'bg-[#27272a] border-zinc-600 text-white';
    }
  }

  suggestionCardClass(sug: ICodingSuggestion, idx: number): string {
    const isSelected = this.copilotService.selectedIndex() === idx;
    const base = isSelected ? 'ring-2 ring-amber-400 bg-amber-950/20 border-amber-500' : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700';
    return `${base} ${sug.status === 'ACCEPTED' ? 'border-emerald-500/60' : ''}`;
  }

  statusBadgeClass(status: ICodingSuggestion['status']): string {
    switch (status) {
      case 'ACCEPTED': return 'bg-emerald-950 text-emerald-300 border border-emerald-600';
      case 'REJECTED': return 'bg-rose-950 text-rose-300 border border-rose-600';
      case 'QUERIED': return 'bg-cyan-950 text-cyan-300 border border-cyan-600';
      default: return 'bg-zinc-800 text-zinc-300 border border-zinc-700';
    }
  }
}

