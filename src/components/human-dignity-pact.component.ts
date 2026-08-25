import { Component, ChangeDetectionStrategy, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from '../services/export.service';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-human-dignity-pact',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 font-mono animate-in fade-in duration-200">
      
      <!-- Dieter Rams Braun Functional Shell -->
      <div class="bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto hide-scrollbar text-zinc-100">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-orange-400 flex items-center justify-center font-bold text-xl shadow-inner">
              🕊️
            </div>
            <div>
              <h2 class="text-base font-black text-zinc-100 uppercase tracking-wide">
                Human Dignity Health Charter
              </h2>
              <p class="text-xs text-zinc-400 font-sans mt-0.5">
                Voluntary Opt-In Open Health Pact for Autonomous Medical Intelligence
              </p>
            </div>
          </div>
          <button (click)="closeModal.emit()" aria-label="Close modal"
            class="w-8 h-8 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition bg-zinc-900">
            ✕
          </button>
        </div>

        <!-- 4 Pillars Grid (Braun Minimalist Style) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          
          <div class="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 space-y-1.5">
            <div class="flex items-center gap-2 font-bold font-mono text-zinc-200 uppercase tracking-wider text-[11px]">
              <span>🗽</span> Voluntary Opt-In Autonomy
            </div>
            <p class="text-zinc-400 text-xs leading-relaxed">
              Zero forced mandates or insurance lock-in. Participation is 100% voluntary, honoring patient and clinician choice.
            </p>
          </div>

          <div class="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 space-y-1.5">
            <div class="flex items-center gap-2 font-bold font-mono text-zinc-200 uppercase tracking-wider text-[11px]">
              <span>💎</span> Zero-Cost Open Access
            </div>
            <p class="text-zinc-400 text-xs leading-relaxed">
              Runs client-side on-device with WebGPU local AI. No cloud hosting fees, paywalls, or corporate subscriptions.
            </p>
          </div>

          <div class="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 space-y-1.5">
            <div class="flex items-center gap-2 font-bold font-mono text-zinc-200 uppercase tracking-wider text-[11px]">
              <span>🌿</span> Multi-Paradigm Cultural Respect
            </div>
            <p class="text-zinc-400 text-xs leading-relaxed">
              Synthesizes Western Clinical Medicine, Eastern TCM Zang-Fu, and Ayurvedic Vedic systems into whole-person care.
            </p>
          </div>

          <div class="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 space-y-1.5">
            <div class="flex items-center gap-2 font-bold font-mono text-zinc-200 uppercase tracking-wider text-[11px]">
              <span>🛡️</span> Restoring Human Connection
            </div>
            <p class="text-zinc-400 text-xs leading-relaxed">
              Automates 95% of administrative screening paperwork so doctors spend unhurried time listening to human beings.
            </p>
          </div>

        </div>

        <!-- Data Sovereignty Banner -->
        <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4 font-mono">
          <div class="space-y-1">
            <span class="text-xs font-bold uppercase tracking-widest text-orange-400 block">🔥 100% Patient Data Ownership (FHIR R4)</span>
            <span class="text-xs font-sans text-zinc-400 block">Your health records are exported in standard open FHIR format with zero proprietary vendor lock-in.</span>
          </div>
          <button (click)="adoptPact()"
            class="px-4 py-2.5 text-xs font-bold uppercase rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 transition shadow-md cursor-pointer shrink-0 border border-orange-400/50">
            {{ isAdopted() ? '✓ Charter Signed' : '🤝 Sign Charter' }}
          </button>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between pt-3 border-t border-zinc-800/80 font-mono">
          <button (click)="downloadCharterPdf()"
            class="px-3.5 py-2 text-xs font-bold uppercase rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-900 transition cursor-pointer flex items-center gap-2">
            <span>📄</span> Download Printable Charter PDF
          </button>
          <button (click)="closeModal.emit()"
            class="px-4 py-2 text-xs font-bold uppercase rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition cursor-pointer border border-zinc-700">
            Close
          </button>
        </div>

      </div>
    </div>
  `
})
export class HumanDignityPactComponent {
  closeModal = output<void>();
  exportService = inject(ExportService);
  state = inject(PatientStateService);
  
  isAdopted = signal(false);

  adoptPact() {
    this.isAdopted.set(true);
  }

  downloadCharterPdf() {
    const charterText = `
# HUMAN DIGNITY HEALTH CHARTER
Voluntary Open Healthcare Access & Data Sovereignty

## 1. Voluntary Opt-In Autonomy
Participation in Pocket-Gull is 100% voluntary. Zero mandates, zero forced data sharing.

## 2. Zero-Cost Open Access
Powered by local on-device WebGPU AI processing with zero subscription fees.

## 3. Multi-Paradigm Cultural Harmony
Honors Western Clinical Medicine, Eastern TCM Zang-Fu organ meridians, and Ayurvedic Vedic systems.

## 4. Administrative Paperwork Relief
Automates 95% of screening paperwork overhead so caregivers focus on human connection.

## 5. FHIR R4 Open Data Sovereignty
Patients own 100% of their medical data with zero vendor lock-in.
`;
    this.exportService.exportPdfReport(charterText, 'Human Dignity Health Charter');
  }
}
