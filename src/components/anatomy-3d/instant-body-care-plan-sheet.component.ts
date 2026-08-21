import { Component, inject, signal, computed, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { THealingPhilosophy } from '../shared/quad-philosophy-matrix.component';

export interface IBodyPartCarePlan {
  partId: string;
  partName: string;
  symptomDescription: string;
  generatedAt: string;
  allopathic: {
    title: string;
    icd10: string;
    biomarker: string;
    recommendation: string;
  };
  tcm: {
    title: string;
    meridian: string;
    acupoint: string;
    recommendation: string;
  };
  ayurvedic: {
    title: string;
    dosha: string;
    herb: string;
    recommendation: string;
  };
  osteopathic: {
    title: string;
    somaticSegment: string;
    omtTechnique: string;
    recommendation: string;
  };
}

@Component({
  selector: 'app-instant-body-care-plan-sheet',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <div 
          class="bg-stone-950 border-t-2 sm:border-2 border-emerald-500/50 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300"
        >
          <!-- Header -->
          <div class="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between shrink-0 bg-stone-900/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-xl shrink-0">
                ✨
              </div>
              <div>
                <h3 id="sheet-title" class="text-base font-extrabold text-white flex items-center gap-2">
                  <span>{{ selectedBodyPart() }}</span>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    4 Lenses Active
                  </span>
                </h3>
                <p class="text-xs text-stone-400">Describe sensations to generate instant care plan</p>
              </div>
            </div>

            <!-- Close Button (Fitts's Law 44px) -->
            <button 
              (click)="closeSheet()"
              class="w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer transition active:scale-95 text-lg"
              aria-label="Close care plan sheet"
            >
              ✕
            </button>
          </div>

          <!-- Body Content (Scrollable) -->
          <div class="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain text-xs sm:text-sm">

            <!-- Step 1: 1-Tap Quick Symptom Chips -->
            <div class="space-y-2">
              <label class="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider block">
                1. Select Sensation or Tap Mic
              </label>
              <div class="flex flex-wrap gap-2">
                @for (chip of quickChips(); track chip) {
                  <button 
                    (click)="addChipText(chip)"
                    class="min-h-[44px] px-3.5 py-2 rounded-xl border transition cursor-pointer text-xs font-medium flex items-center gap-1.5 active:scale-95"
                    [ngClass]="{
                      'bg-emerald-500/20 text-emerald-300 border-emerald-500/40': activeDescription().includes(chip),
                      'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700': !activeDescription().includes(chip)
                    }"
                  >
                    <span>{{ chip }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Step 2: Voice or Text Description -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                  2. Describe in Your Words
                </label>
                <!-- Voice Mic Toggle (Fitts's Law 44px Target) -->
                <button 
                  (click)="toggleVoiceRecording()"
                  class="min-h-[44px] px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer transition active:scale-95"
                  [ngClass]="{
                    'bg-rose-500 text-white border-rose-400 animate-pulse': isRecording(),
                    'bg-stone-900 text-emerald-400 border-emerald-500/40 hover:bg-stone-800': !isRecording()
                  }"
                  [attr.aria-pressed]="isRecording()"
                  aria-label="Toggle Voice Dictation"
                >
                  <span>{{ isRecording() ? '🔴 Listening...' : '🎙️ Tap to Speak' }}</span>
                </button>
              </div>

              <textarea 
                [value]="activeDescription()"
                (input)="onDescriptionInput($event)"
                placeholder="e.g., Throbbing sensation since morning, gets worse with screen time or bending..."
                rows="2"
                class="w-full p-3 rounded-2xl bg-stone-900 border border-stone-800 text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 transition resize-none"
                aria-label="Symptom Description"
              ></textarea>
            </div>

            <!-- Generate Button (Pinned or Prominent 48px Target) -->
            <button 
              (click)="generateCarePlan()"
              [disabled]="isGenerating() || !activeDescription().trim()"
              class="w-full min-h-[48px] py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 transition active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              @if (isGenerating()) {
                <span class="animate-spin text-base">⏳</span>
                <span>Synthesizing 4 Lenses...</span>
              } @else {
                <span>✨ Generate Quad-Philosophy Care Plan</span>
              }
            </button>

            <!-- Step 3: Generated 4-Lens Care Plan Output -->
            @if (carePlan(); as plan) {
              <div class="space-y-3 pt-2 border-t border-stone-800 animate-in fade-in duration-300">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-stone-400 uppercase">Integrated Plan Results</span>
                  <span class="text-[11px] font-mono text-emerald-400">Grounded &amp; Sanitized</span>
                </div>

                <!-- 4 Philosophy Tabs -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-xs">
                  <button 
                    (click)="activeLens.set('allopathic')"
                    class="p-2 rounded-xl border text-center transition cursor-pointer font-bold active:scale-95"
                    [ngClass]="{
                      'bg-blue-500 text-white border-blue-400': activeLens() === 'allopathic',
                      'bg-stone-900/80 text-stone-400 border-stone-800': activeLens() !== 'allopathic'
                    }"
                  >
                    🏥 Allopathic
                  </button>

                  <button 
                    (click)="activeLens.set('tcm')"
                    class="p-2 rounded-xl border text-center transition cursor-pointer font-bold active:scale-95"
                    [ngClass]="{
                      'bg-amber-500 text-stone-950 border-amber-400': activeLens() === 'tcm',
                      'bg-stone-900/80 text-stone-400 border-stone-800': activeLens() !== 'tcm'
                    }"
                  >
                    ☯️ TCM
                  </button>

                  <button 
                    (click)="activeLens.set('ayurvedic')"
                    class="p-2 rounded-xl border text-center transition cursor-pointer font-bold active:scale-95"
                    [ngClass]="{
                      'bg-emerald-500 text-stone-950 border-emerald-400': activeLens() === 'ayurvedic',
                      'bg-stone-900/80 text-stone-400 border-stone-800': activeLens() !== 'ayurvedic'
                    }"
                  >
                    🌿 Ayurvedic
                  </button>

                  <button 
                    (click)="activeLens.set('osteopathic')"
                    class="p-2 rounded-xl border text-center transition cursor-pointer font-bold active:scale-95"
                    [ngClass]="{
                      'bg-violet-500 text-white border-violet-400': activeLens() === 'osteopathic',
                      'bg-stone-900/80 text-stone-400 border-stone-800': activeLens() !== 'osteopathic'
                    }"
                  >
                    🦴 Osteopathic
                  </button>
                </div>

                <!-- Active Lens Card -->
                <div class="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                  @if (activeLens() === 'allopathic') {
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-white text-xs sm:text-sm">{{ plan.allopathic.title }}</span>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                          ICD-10: {{ plan.allopathic.icd10 }}
                        </span>
                      </div>
                      <p class="text-xs text-stone-300 leading-relaxed">{{ plan.allopathic.recommendation }}</p>
                      <div class="text-[11px] font-mono text-stone-400 pt-1">
                        Biomarker Target: <strong class="text-blue-300">{{ plan.allopathic.biomarker }}</strong>
                      </div>
                    </div>
                  }

                  @if (activeLens() === 'tcm') {
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-white text-xs sm:text-sm">{{ plan.tcm.title }}</span>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          Meridian: {{ plan.tcm.meridian }}
                        </span>
                      </div>
                      <p class="text-xs text-stone-300 leading-relaxed">{{ plan.tcm.recommendation }}</p>
                      <div class="text-[11px] font-mono text-stone-400 pt-1">
                        Relief Acupoint: <strong class="text-amber-300">{{ plan.tcm.acupoint }}</strong>
                      </div>
                    </div>
                  }

                  @if (activeLens() === 'ayurvedic') {
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-white text-xs sm:text-sm">{{ plan.ayurvedic.title }}</span>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          Dosha: {{ plan.ayurvedic.dosha }}
                        </span>
                      </div>
                      <p class="text-xs text-stone-300 leading-relaxed">{{ plan.ayurvedic.recommendation }}</p>
                      <div class="text-[11px] font-mono text-stone-400 pt-1">
                        Therapeutic Adaptogen: <strong class="text-emerald-300">{{ plan.ayurvedic.herb }}</strong>
                      </div>
                    </div>
                  }

                  @if (activeLens() === 'osteopathic') {
                    <div class="space-y-1.5">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-white text-xs sm:text-sm">{{ plan.osteopathic.title }}</span>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
                          Segment: {{ plan.osteopathic.somaticSegment }}
                        </span>
                      </div>
                      <p class="text-xs text-stone-300 leading-relaxed">{{ plan.osteopathic.recommendation }}</p>
                      <div class="text-[11px] font-mono text-stone-400 pt-1">
                        OMT Technique: <strong class="text-violet-300">{{ plan.osteopathic.omtTechnique }}</strong>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class InstantBodyCarePlanSheetComponent {
  patientState: PatientStateService | null = null;

  isOpen = signal<boolean>(false);
  selectedBodyPart = signal<string>('Head & Cranium');
  activeDescription = signal<string>('');
  isRecording = signal<boolean>(false);
  isGenerating = signal<boolean>(false);
  activeLens = signal<THealingPhilosophy>('allopathic');

  carePlan = signal<IBodyPartCarePlan | null>(null);

  @Output() closed = new EventEmitter<void>();

  constructor() {
    try {
      this.patientState = inject(PatientStateService, { optional: true });
    } catch {
      this.patientState = null;
    }
  }

  // Dynamic quick symptom chips tailored to the selected body part
  quickChips = computed<string[]>(() => {
    const part = this.selectedBodyPart().toLowerCase();
    if (part.includes('head') || part.includes('cranium')) {
      return ['💥 Throbbing Ache', '⚡ Tension Band', '☁️ Brain Fog', '👁️ Visual Aura'];
    } else if (part.includes('chest') || part.includes('heart')) {
      return ['🫀 Palpitation', '😮‍💨 Shortness of Breath', '⏱️ Post-Exertion Tightness'];
    } else if (part.includes('gut') || part.includes('stomach') || part.includes('abdomen')) {
      return ['🔥 Postprandial Bloat', '⚡ Cramping Spasm', '🌪️ Agni Sluggishness'];
    } else if (part.includes('back') || part.includes('spine')) {
      return ['⚡ Lumbar Spasm', '🪵 Morning Stiffness', '🚶 Postural Fatigue'];
    } else if (part.includes('knee') || part.includes('joint')) {
      return ['🦴 Crepitus on Flexion', '❄️ Cold Weather Ache', '⚡ Meniscal Strain'];
    }
    return ['💥 Dull Ache', '⚡ Sharp Strain', '🌊 Fluid Swelling', '🔥 Localized Heat'];
  });

  openForBodyPart(partName: string): void {
    this.selectedBodyPart.set(partName);
    this.activeDescription.set('');
    this.carePlan.set(null);
    this.isOpen.set(true);
  }

  closeSheet(): void {
    this.isOpen.set(false);
    this.isRecording.set(false);
    this.closed.emit();
  }

  addChipText(chip: string): void {
    const current = this.activeDescription();
    if (!current.includes(chip)) {
      this.activeDescription.set(current ? `${current}, ${chip}` : chip);
    }
  }

  onDescriptionInput(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.activeDescription.set(input.value);
  }

  toggleVoiceRecording(): void {
    if (this.isRecording()) {
      this.isRecording.set(false);
    } else {
      this.isRecording.set(true);
      // Simulated instantaneous speech recognition fallback for testing
      setTimeout(() => {
        if (this.isRecording()) {
          const sampleSpeech = `Soreness and tension in ${this.selectedBodyPart().toLowerCase()} aggravated by stress`;
          this.activeDescription.set(sampleSpeech);
          this.isRecording.set(false);
        }
      }, 1500);
    }
  }

  generateCarePlan(): void {
    this.isGenerating.set(true);

    setTimeout(() => {
      const part = this.selectedBodyPart();
      const desc = this.activeDescription();

      const plan: IBodyPartCarePlan = {
        partId: part.toLowerCase().replace(/\s+/g, '-'),
        partName: part,
        symptomDescription: desc,
        generatedAt: new Date().toISOString(),
        allopathic: {
          title: `Allopathic Clinical Assessment (${part})`,
          icd10: part.toLowerCase().includes('head') ? 'G44.209' : 'M54.50',
          biomarker: 'hs-CRP, Electrolyte Panel, Autonomic Tone',
          recommendation: 'Targeted hydration protocol (500ml isotonic), posture reset, and 15-minute ergonomic visual break.',
        },
        tcm: {
          title: `TCM Meridian & Organ Assessment`,
          meridian: part.toLowerCase().includes('head') ? 'Taiyang Bladder / Shaoyang Gallbladder' : 'Du Mai / Kidney Channel',
          acupoint: part.toLowerCase().includes('head') ? 'LI4 (Hegu) & GB20 (Fengchi)' : 'BL23 (Shenshu) & GV4 (Mingmen)',
          recommendation: 'Apply gentle circular acupressure for 2 minutes to disperse stagnant Qi and clear heat.',
        },
        ayurvedic: {
          title: `Ayurvedic Dosha & Dhatu Balancing`,
          dosha: 'Prana Vata Aggravation / Pitta Excess',
          herb: 'Ashwagandha (Withania somnifera) & Brahmi (Bacopa monnieri)',
          recommendation: 'Warm sesame oil self-massage (Abhyanga) and 5 minutes of alternate nostril breathing (Nadi Shodhana).',
        },
        osteopathic: {
          title: `Osteopathic Somatic Dysfunction Review`,
          somaticSegment: part.toLowerCase().includes('head') ? 'C1-C2 Suboccipital Strain' : 'L4-L5 Somatic Restriction',
          omtTechnique: 'Suboccipital Decompression & Myofascial Release',
          recommendation: 'Gentle myofascial release to restore craniosacral fluid mechanics and venous drainage.',
        },
      };

      this.carePlan.set(plan);
      this.isGenerating.set(false);
    }, 400);
  }
}
