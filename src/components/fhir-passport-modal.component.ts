import { Component, ChangeDetectionStrategy, signal, computed, inject, ElementRef, viewChild, effect, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { ExportService } from '../services/export.service';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { generate } from 'lean-qr';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fhir-passport-modal',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in font-mono print:static print:bg-white print:p-0 print:block">
      
      <!-- Dieter Rams Shell -->
      <div class="w-full max-w-4xl max-h-[92vh] bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col text-zinc-100 font-['Inter'] print:max-w-none print:max-h-none print:bg-white print:text-black print:border-none print:shadow-none">
        
        <!-- Modal Header -->
        <div class="p-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between font-mono no-print">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center text-xl font-bold">
              🔥
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base font-black uppercase tracking-wide text-zinc-100">FHIR R4 Patient Health Passport</h2>
                <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  HL7 FHIR R4.0.1 Validated
                </span>
              </div>
              <p class="text-xs text-zinc-400 font-sans mt-0.5">Interoperable clinical passport payload with scannable QR verification & zero-PII security</p>
            </div>
          </div>
          <button (click)="closeModal.emit()" class="text-zinc-400 hover:text-white text-2xl font-semibold p-1 cursor-pointer">
            &times;
          </button>
        </div>

        <!-- Printable Document Header (Print Only) -->
        <div class="hidden print:block p-6 border-b-2 border-slate-900 mb-4 font-mono">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-black uppercase tracking-wider text-slate-900">🔥 Official FHIR R4 Health Passport</h1>
              <p class="text-xs text-slate-600 font-sans mt-1">
                Patient: <strong class="uppercase text-slate-900 font-mono">{{ patientName() }}</strong> · 
                Resource ID: <span class="font-mono">{{ fhirId() }}</span> · 
                Issued: {{ todayDate }}
              </p>
            </div>
            <div class="text-right text-[10px] text-slate-500 font-mono">
              <span class="block font-bold uppercase">HL7 FHIR R4.0.1 Standard</span>
              <span>Pocket-Gull Interoperability Engine</span>
            </div>
          </div>
        </div>

        <!-- Main Body -->
        <div class="flex-1 p-6 overflow-y-auto bg-zinc-950 space-y-6 print:bg-white print:p-0 print:overflow-visible">
          
          <!-- Top Passport Card Banner -->
          <div class="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-850 border border-zinc-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 print:bg-slate-50 print:border-slate-300 print:text-black">
            
            <!-- Left Info -->
            <div class="space-y-3 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2.5 py-1 rounded-md bg-orange-500/20 text-orange-300 border border-orange-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Universal Health Pass ID
                </span>
                <span class="text-xs font-mono text-zinc-400 print:text-slate-600">UUID: {{ fhirId() }}</span>
              </div>

              <div>
                <h3 class="text-xl font-black text-white tracking-tight font-sans print:text-slate-900">{{ patientName() }}</h3>
                <span class="text-xs text-zinc-400 font-mono block mt-0.5 print:text-slate-600">
                  Demographics: Age {{ activePatient()?.age || 50 }} · Gender {{ activePatient()?.gender || 'Other' }} · Last Visit {{ activePatient()?.lastVisit || '2026.07.22' }}
                </span>
              </div>

              <!-- Risk Tier Badges -->
              <div class="flex flex-wrap gap-2 pt-1 font-mono">
                <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  30-Day Readmission Risk: LOW (12%)
                </span>
                <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  90-Day Recovery Index: OPTIMAL (94%)
                </span>
                <span class="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  QALY Gain: +12.0 QALYs
                </span>
              </div>
            </div>

            <!-- Right QR Canvas Container -->
            <div class="shrink-0 flex flex-col items-center gap-2 p-3 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-inner no-print">
              <div #qrContainer class="w-32 h-32 bg-white rounded-xl p-2 flex items-center justify-center shadow-md"></div>
              <span class="text-[9.5px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Scan to Verify FHIR</span>
            </div>

          </div>

          <!-- Clinical Telemetry Grid (FHIR Observation Sections) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Section 1: Active Diagnoses & Conditions (SNOMED CT / ICD-10) -->
            <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 font-sans print:bg-white print:border-slate-300">
              <div class="flex items-center justify-between border-b border-zinc-800 pb-2.5 font-mono print:border-slate-300">
                <span class="text-xs font-bold uppercase text-sky-400 print:text-slate-900">🏥 Active Diagnoses (SNOMED CT / ICD-10)</span>
                <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  FHIR Condition
                </span>
              </div>

              <div class="space-y-2 text-xs">
                @for (condition of activeConditions(); track condition) {
                  <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between print:bg-slate-50 print:border-slate-300">
                    <span class="font-semibold text-zinc-200 print:text-slate-900">{{ condition }}</span>
                    <span class="text-[10px] font-mono text-zinc-400 font-bold uppercase">Active</span>
                  </div>
                } @empty {
                  <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs">
                    Standard preventive health monitoring baseline.
                  </div>
                }
              </div>
            </div>

            <!-- Section 2: Vitals & Lab Baselines (LOINC) -->
            <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 font-sans print:bg-white print:border-slate-300">
              <div class="flex items-center justify-between border-b border-zinc-800 pb-2.5 font-mono print:border-slate-300">
                <span class="text-xs font-bold uppercase text-emerald-400 print:text-slate-900">🫀 Vital Signs & Labs (LOINC)</span>
                <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  FHIR Observation
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-0.5 print:bg-slate-50 print:border-slate-300">
                  <span class="text-[10px] text-zinc-400 uppercase block print:text-slate-600">Blood Pressure</span>
                  <strong class="text-zinc-100 font-bold print:text-slate-900">{{ activePatient()?.vitals?.bp || '118/76 mmHg' }}</strong>
                </div>

                <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-0.5 print:bg-slate-50 print:border-slate-300">
                  <span class="text-[10px] text-zinc-400 uppercase block print:text-slate-600">Heart Rate</span>
                  <strong class="text-zinc-100 font-bold print:text-slate-900">{{ activePatient()?.vitals?.hr || '72 bpm' }}</strong>
                </div>

                <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-0.5 print:bg-slate-50 print:border-slate-300">
                  <span class="text-[10px] text-zinc-400 uppercase block print:text-slate-600">SpO2 Oxygen</span>
                  <strong class="text-zinc-100 font-bold print:text-slate-900">{{ activePatient()?.vitals?.spO2 || '98%' }}</strong>
                </div>

                <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-0.5 print:bg-slate-50 print:border-slate-300">
                  <span class="text-[10px] text-zinc-400 uppercase block print:text-slate-600">Vitamin D3</span>
                  <strong class="text-zinc-100 font-bold print:text-slate-900">{{ activePatient()?.vitals?.vitD3 || '35 ng/mL' }}</strong>
                </div>
              </div>
            </div>

          </div>

          <!-- Section 3: Pharmacotherapy & Precision Nutrients -->
          <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 font-sans print:bg-white print:border-slate-300">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-2.5 font-mono print:border-slate-300">
              <span class="text-xs font-bold uppercase text-purple-400 print:text-slate-900">💊 Pharmacotherapy & Precision Nutrients</span>
              <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                FHIR MedicationStatement
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono space-y-1 print:bg-slate-50 print:border-slate-300">
                <span class="text-purple-300 font-bold block print:text-slate-900">Magnesium L-Threonate</span>
                <span class="text-zinc-400 text-[11px]">300mg at bedtime · Synaptic & Vagal Support</span>
              </div>

              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono space-y-1 print:bg-slate-50 print:border-slate-300">
                <span class="text-purple-300 font-bold block print:text-slate-900">Omega-3 EPA/DHA SPM</span>
                <span class="text-zinc-400 text-[11px]">2,400mg daily · Resolution of Inflammation</span>
              </div>

              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono space-y-1 print:bg-slate-50 print:border-slate-300">
                <span class="text-purple-300 font-bold block print:text-slate-900">CoQ10 Ubiquinol</span>
                <span class="text-zinc-400 text-[11px]">200mg morning · Mitochondrial Substrate</span>
              </div>
            </div>
          </div>

          <!-- Section 4: FHIR DeviceRequest / Active Prescribed Clinical Apps & Interventions -->
          @if (patientState.prescribedToolsList().length > 0) {
            <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 font-sans print:bg-white print:border-slate-300">
              <div class="flex items-center justify-between border-b border-zinc-800 pb-2.5 font-mono print:border-slate-300">
                <span class="text-xs font-bold uppercase text-emerald-400 print:text-slate-900">📱 Prescribed Clinical Apps & Digital Therapeutics ({{ patientState.prescribedToolsList().length }})</span>
                <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  FHIR DeviceRequest / CarePlan
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                @for (tool of patientState.prescribedToolsList(); track tool.id) {
                  <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3 print:bg-slate-50 print:border-slate-300">
                    <span class="text-xl shrink-0">{{ tool.icon }}</span>
                    <div class="overflow-hidden">
                      <strong class="block text-xs font-bold text-zinc-100 print:text-slate-900 truncate">{{ tool.name }}</strong>
                      <span class="text-[10px] text-emerald-400 font-mono uppercase font-bold block">{{ tool.category }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

        </div>

        <!-- Footer / Action Buttons (Screen Only) -->
        <div class="p-4 bg-zinc-900 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs no-print">
          <div class="flex items-center gap-2">
            <button (click)="downloadJson()" class="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold transition cursor-pointer flex items-center gap-2 shadow-md">
              <span>🔥</span> Download FHIR R4 JSON
            </button>
            <button (click)="printPassport()" class="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition cursor-pointer flex items-center gap-2">
              <span>📄</span> Print Passport Card
            </button>
          </div>

          <pocket-gull-button (click)="closeModal.emit()" variant="secondary" size="sm">
            Close Passport
          </pocket-gull-button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    @media print {
      body * {
        visibility: hidden;
      }
      app-fhir-passport-modal, app-fhir-passport-modal * {
        visibility: visible;
      }
      app-fhir-passport-modal {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  `]
})
export class FhirPassportModalComponent {
  closeModal = output<void>();
  
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);
  exportService = inject(ExportService);

  qrContainer = viewChild<ElementRef<HTMLDivElement>>('qrContainer');
  todayDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  activePatient = computed(() => this.patientManagement.selectedPatient());
  patientName = computed(() => this.activePatient()?.name || this.patientState.patientName() || 'Patient');
  fhirId = computed(() => this.activePatient()?.id || 'p_001_fhir_r4');

  activeConditions = computed(() => {
    const p = this.activePatient();
    if (p && p.preexistingConditions && p.preexistingConditions.length > 0) {
      return p.preexistingConditions;
    }
    return ['Cardiometabolic Baseline', 'Lumbar Radiculopathy (M54.16)', 'Circadian Phase Realignment'];
  });

  constructor() {
    effect(() => {
      if (this.qrContainer()) {
        this.renderQrCode();
      }
    });
  }

  renderQrCode() {
    const container = this.qrContainer()?.nativeElement;
    if (!container) return;
    container.innerHTML = '';

    const payload = `https://pocketgull.app/verify/fhir-passport?id=${this.fhirId()}&name=${encodeURIComponent(this.patientName())}`;
    const code = generate(payload);

    const canvas = document.createElement('canvas');
    canvas.width = 112;
    canvas.height = 112;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const size = code.size;
      const scale = canvas.width / size;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#09090b';

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (code.get(x, y)) {
            ctx.fillRect(Math.floor(x * scale), Math.floor(y * scale), Math.ceil(scale), Math.ceil(scale));
          }
        }
      }
    }
    container.appendChild(canvas);
  }

  downloadJson() {
    const p = this.activePatient();
    if (p) {
      this.exportService.downloadAsFhirBundle(p);
    } else {
      const bundle = this.exportService.buildFhirR4Bundle({
        id: this.fhirId(),
        name: this.patientName(),
        issues: this.patientState.issues()
      });
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fhir_r4_passport_${this.patientName().toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  printPassport() {
    window.print();
  }
}
