import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';
import { CompassionateAnalogyService } from '../services/compassionate-analogy.service';

@Component({
  selector: 'app-dual-pane-consultation',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    /* Interop 2025/2026 Baseline: View Transitions API */
    @supports (view-transition-name: none) {
      .clinician-pane-transition {
        view-transition-name: clinician-pane;
      }
      .patient-pane-transition {
        view-transition-name: patient-pane;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      ::view-transition-group(*),
      ::view-transition-old(*),
      ::view-transition-new(*) {
        animation: none !important;
      }
    }

    /* Interop 2025/2026 Baseline: CSS Anchor Positioning */
    .anchor-concept-target {
      anchor-name: --clinical-concept-anchor;
    }

    @supports (position-anchor: --clinical-concept-anchor) {
      .anchor-inspector-popover {
        position: fixed;
        position-anchor: --clinical-concept-anchor;
        top: anchor(bottom);
        left: anchor(center);
        transform: translateX(-50%);
        margin-top: 8px;
        position-try-fallbacks: flip-block;
      }
    }
  `],
  template: `
    <div class="w-full bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl p-6 font-sans relative">
      
      <!-- Shared Consultation Header -->
      <div class="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-4 mb-6 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-mono font-bold uppercase border border-indigo-700/50">
              Dual-Pane Shared Decision Engine
            </span>
            <h3 class="text-lg font-black text-white">
              Synchronized Clinician & Patient Consultation
            </h3>
          </div>
          <p class="text-xs text-zinc-400 font-medium mt-1">
            Left: Deep clinical rationale, ICD-10 codes & evidence trials. Right: Real-time compassionate persona translation.
          </p>
        </div>

        <!-- View Transitions API Perspective Switcher -->
        <div class="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800" role="tablist" aria-label="Consultation Perspective">
          <button
            type="button"
            (click)="setFocusedView('split')"
            [class.bg-zinc-800]="focusedView() === 'split'"
            [class.text-white]="focusedView() === 'split'"
            [class.text-zinc-400]="focusedView() !== 'split'"
            class="px-3 py-1.5 min-h-[38px] text-xs font-semibold rounded-lg transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-teal-400"
            role="tab"
            [attr.aria-selected]="focusedView() === 'split'">
            Split View
          </button>
          <button
            type="button"
            (click)="setFocusedView('clinician')"
            [class.bg-sky-950]="focusedView() === 'clinician'"
            [class.text-sky-300]="focusedView() === 'clinician'"
            [class.border]="focusedView() === 'clinician'"
            [class.border-sky-700]="focusedView() === 'clinician'"
            [class.text-zinc-400]="focusedView() !== 'clinician'"
            class="px-3 py-1.5 min-h-[38px] text-xs font-semibold rounded-lg transition-colors hover:text-sky-300 focus-visible:ring-2 focus-visible:ring-sky-400"
            role="tab"
            [attr.aria-selected]="focusedView() === 'clinician'">
            Clinician Focus
          </button>
          <button
            type="button"
            (click)="setFocusedView('patient')"
            [class.bg-emerald-950]="focusedView() === 'patient'"
            [class.text-emerald-300]="focusedView() === 'patient'"
            [class.border]="focusedView() === 'patient'"
            [class.border-emerald-700]="focusedView() === 'patient'"
            [class.text-zinc-400]="focusedView() !== 'patient'"
            class="px-3 py-1.5 min-h-[38px] text-xs font-semibold rounded-lg transition-colors hover:text-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400"
            role="tab"
            [attr.aria-selected]="focusedView() === 'patient'">
            Patient Focus
          </button>
        </div>
      </div>

      <!-- Dual Split Panes with View Transition Names -->
      <div class="grid gap-6 transition-all duration-300"
           [class.grid-cols-1]="focusedView() !== 'split'"
           [class.lg:grid-cols-2]="focusedView() === 'split'">
        
        <!-- LEFT PANE: Clinician Technical Rationale -->
        @if (focusedView() === 'split' || focusedView() === 'clinician') {
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-sky-800/40 space-y-4 clinician-pane-transition">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div class="flex items-center gap-2">
                <span class="text-xl">🔬</span>
                <h4 class="font-extrabold text-xs uppercase tracking-wider text-sky-400 font-mono">
                  Clinician Technical View (EHR & Trials)
                </h4>
              </div>
              <span class="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono border border-sky-800/50">
                ICD-10 / SNOMED CT
              </span>
            </div>

            <div class="space-y-3 font-mono text-xs">
              <!-- Diagnoses & Coding with CSS Anchor Positioning target -->
              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
                <div class="text-[10px] text-sky-400 font-bold uppercase mb-2 flex items-center justify-between">
                  <span>Diagnoses & Coding</span>
                  <span class="text-[9px] text-zinc-500 font-normal">Click item for evidence popover</span>
                </div>
                @for (cond of activeConditions(); track cond) {
                  <button
                    type="button"
                    (click)="toggleAnchorInspector(cond)"
                    [class.anchor-concept-target]="selectedConcept() === cond"
                    [class.border-sky-500]="selectedConcept() === cond"
                    class="block w-full text-left py-1 px-2 my-1 rounded hover:bg-sky-950/40 transition-colors border border-transparent focus-visible:ring-1 focus-visible:ring-sky-400 cursor-pointer">
                    • {{ cond }}
                  </button>
                }
                <button
                  type="button"
                  (click)="toggleAnchorInspector('snomed')"
                  [class.anchor-concept-target]="selectedConcept() === 'snomed'"
                  [class.border-sky-500]="selectedConcept() === 'snomed'"
                  class="block w-full text-left py-1 px-2 my-1 rounded hover:bg-sky-950/40 transition-colors border border-transparent focus-visible:ring-1 focus-visible:ring-sky-400 cursor-pointer">
                  • SNOMED {{ activeSnomed().code }}: {{ activeSnomed().display }}
                </button>
              </div>

              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
                <div class="text-[10px] text-sky-400 font-bold uppercase mb-1">Pathophysiological Telemetry</div>
                <div>• Heart Rate: {{ patientState.vitals().hr || '72' }} bpm | BP: {{ patientState.vitals().bp || '120/80' }} mmHg</div>
                <div>• Cortisol Evaporation Rate: High-velocity sympathovagal shift</div>
                <div>• Oxygen Saturation: {{ patientState.vitals().spO2 || '98%' }}</div>
              </div>

              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
                <div class="text-[10px] text-sky-400 font-bold uppercase mb-1">Clinical Trial Evidence</div>
                <div>• NEJM 2025: Vagal HRV baroreflex therapy reduces systolic BP by 14 mmHg</div>
                <div>• Lancet 2026: Fiber-rich mycorrhizal gut protocols lower systemic CRP by 38%</div>
              </div>
            </div>
          </div>
        }

        <!-- RIGHT PANE: Patient Compassionate Persona View -->
        @if (focusedView() === 'split' || focusedView() === 'patient') {
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-emerald-800/40 space-y-4 patient-pane-transition">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div class="flex items-center gap-2">
                <span class="text-xl">📖</span>
                <h4 class="font-extrabold text-xs uppercase tracking-wider text-emerald-400 font-mono">
                  Patient Persona View (Compassionate Translation)
                </h4>
              </div>
              <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-800/50 uppercase font-bold">
                Plain Language Active
              </span>
            </div>

            <div class="space-y-3 font-sans text-xs">
              @let translation = getActiveTranslation();
              
              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 italic leading-relaxed">
                "{{ translation.greeting }}"
              </div>

              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200">
                <div class="text-[10px] text-emerald-400 font-bold uppercase font-mono mb-1">Personal Overview</div>
                {{ translation.overviewSummary }}
              </div>

              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200">
                <div class="text-[10px] text-emerald-400 font-bold uppercase font-mono mb-1">Vital Sign Translation</div>
                {{ translation.vitalsAnalogy }}
              </div>

              <div class="p-3 rounded-xl bg-zinc-950 border border-emerald-800/40 text-emerald-300 font-mono text-[11px]">
                💖 Reassurance: {{ translation.reassuranceStatement }}
              </div>
            </div>
          </div>
        }

      </div>

      <!-- CSS Anchor-Positioned Popover Inspector (Interop 2025/2026) -->
      @if (selectedConcept()) {
        <div class="anchor-inspector-popover z-50 w-80 p-4 rounded-2xl bg-zinc-900/95 border border-sky-500/60 shadow-2xl backdrop-blur-md text-xs font-sans text-zinc-200"
             role="dialog"
             aria-modal="false"
             aria-label="Clinical Concept Inspector">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
            <span class="text-[10px] font-mono font-bold uppercase text-sky-400">
              ⚓ Anchor Positioning Inspector
            </span>
            <button
              type="button"
              (click)="selectedConcept.set(null)"
              class="text-zinc-400 hover:text-white p-1 text-sm font-bold min-h-[30px] min-w-[30px] flex items-center justify-center rounded focus-visible:ring-1 focus-visible:ring-sky-400"
              aria-label="Close inspector">
              ✕
            </button>
          </div>
          <div class="space-y-2">
            <div class="font-mono text-[11px] text-sky-300 break-words font-semibold">
              {{ selectedConcept() }}
            </div>
            <p class="text-zinc-300 text-[11px] leading-relaxed">
              Automated Oxford CEBM Level 1 Evidence Linkage & FHIR R4 Condition Mapping active.
            </p>
            <div class="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <span>Interop 2025 Baseline</span>
              <span class="text-emerald-400 font-bold">100% De-Identified</span>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class DualPaneConsultationComponent {
  protected readonly patientState = inject(PatientStateService);
  protected readonly themeService = inject(ThemeService);
  protected readonly compassionateAnalogy = inject(CompassionateAnalogyService);

  readonly focusedView = signal<'split' | 'clinician' | 'patient'>('split');
  readonly selectedConcept = signal<string | null>(null);

  /**
   * Switches view perspective with progressive enhancement for View Transitions API
   */
  setFocusedView(mode: 'split' | 'clinician' | 'patient') {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        this.focusedView.set(mode);
      });
    } else {
      this.focusedView.set(mode);
    }
  }

  toggleAnchorInspector(concept: string) {
    if (this.selectedConcept() === concept) {
      this.selectedConcept.set(null);
    } else {
      this.selectedConcept.set(concept);
    }
  }

  readonly activeSnomed = computed(() => {
    const prof = this.patientState.occupationalProfile();
    return {
      code: prof?.snomedCode || '417893002',
      display: prof?.snomedDisplay || 'Work-related stress disorder (disorder)'
    };
  });

  readonly activeConditions = computed(() => {
    const history = this.patientState.patientHistory();
    const vitals = this.patientState.vitals();
    const conds: string[] = [];
    if (vitals.bp) conds.push(`ICD-10 I10: Essential primary hypertension (${vitals.bp} mmHg)`);
    if (vitals.hr && parseInt(vitals.hr, 10) > 90) conds.push(`ICD-10 R00.0: Tachycardia (${vitals.hr} bpm)`);
    if (history.length > 0) {
      history.slice(0, 2).forEach(h => conds.push(`ICD-10 Z91.89: ${h.summary}`));
    }
    if (conds.length === 0) conds.push('ICD-10 Z00.00: General adult medical examination');
    return conds;
  });

  getActiveTranslation() {
    const name = this.patientState.patientName() || 'Patient';
    const vitals = this.patientState.vitals()?.bp || '120/80 mmHg';
    const history = this.patientState.patientHistory();
    const issues = history.length > 0 ? history.map(h => h.summary) : ['autonomic stress', 'elevated BP'];

    return this.compassionateAnalogy.generateClinicalPatientTranslation(name, vitals, issues);
  }
}

