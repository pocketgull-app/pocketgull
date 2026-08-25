import { Component, input, output, signal, computed, inject, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { generate } from 'lean-qr';

export interface ISpecialtyProfile {
  id: string;
  title: string;
  doctorType: string;
  icon: string;
  targetLens: string;
  accentClass: string;
  description: string;
  focusTags: string[];
}

export const SPECIALTY_PROFILES: ISpecialtyProfile[] = [
  {
    id: 'do_osteopathic',
    title: 'Neuromusculoskeletal & Somatic DO',
    doctorType: 'Doctor of Osteopathic Medicine (DO)',
    icon: '🦴',
    targetLens: 'Functional Protocols',
    accentClass: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300',
    description: 'Specializing in structural somatic dysfunction, HPA axis autonomic tone, craniosacral dynamics, and osteopathic manipulative medicine.',
    focusTags: ['Somatic Dysfunction', 'Autonomic Tone', 'HPA Axis', 'Postural Alignment']
  },
  {
    id: 'gastroenterology',
    title: 'Integrative Gastroenterology & Microbiome',
    doctorType: 'GI Specialist & Microbiome Fellow',
    icon: '🫄',
    targetLens: 'Nutrition',
    accentClass: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
    description: 'Focusing on mucosal barrier permeability, gut-brain axis neurotransmission, SIBO/dysbiosis correction, and elimination nutrition.',
    focusTags: ['Gut-Brain Axis', 'Microbiome Dysbiosis', 'Mucosal Permeability', 'Short-Chain Fatty Acids']
  },
  {
    id: 'orthomolecular',
    title: 'Orthomolecular Biochemistry & Genomics',
    doctorType: 'Functional Biochemistry Fellow',
    icon: '🧬',
    targetLens: 'Precision Nutrients',
    accentClass: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
    description: 'Precision targeting of enzymatic cofactors, methylation pathways, mitochondrial oxidative stress, and targeted nutrient dosing.',
    focusTags: ['Methylation Cycle', 'Mitochondrial Respiration', 'Enzymatic Cofactors', 'Antioxidant Reserves']
  },
  {
    id: 'tcm_master',
    title: 'TCM Master Herbalist & Acupuncturist',
    doctorType: 'Doctor of Acupuncture & Oriental Medicine (DAOM)',
    icon: '☯️',
    targetLens: 'Summary Overview',
    accentClass: 'border-emerald-600 bg-emerald-100/40 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200',
    description: 'Evaluating Zang-Fu organ disharmonies, five-element energetics, tongue/pulse diagnostic patterns, and classical herbal formulas.',
    focusTags: ['Zang-Fu Organ Status', 'Qi & Blood Flow', 'Meridian Obstruction', 'Empirical Canon']
  },
  {
    id: 'ayurvedic_vaidya',
    title: 'Ayurvedic Vaidya & Panchakarma Fellow',
    doctorType: 'Ayurvedic Physician (BAMS / MD Ayurveda)',
    icon: '🪷',
    targetLens: 'Nutrition',
    accentClass: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
    description: 'Constitutional Tridoshic profiling (Vata/Pitta/Kapha), evaluating Agni metabolic fire strength, and clearing cellular Ama load.',
    focusTags: ['Tridosha Imbalance', 'Agni Metabolic Strength', 'Ama Cellular Toxicity', 'Dinacharya Rhythm']
  },
  {
    id: 'psychiatry_ybocs',
    title: 'Neuro-Psychiatry & Behavioral Specialist',
    doctorType: 'Board Certified Neuro-Psychiatrist (MD/DO)',
    icon: '🧠',
    targetLens: 'ASSESSMENTS',
    accentClass: 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
    description: 'Specialized evaluation of obsessive-compulsive inventory trajectories, cognitive load thresholds, and neuro-behavioral protocols.',
    focusTags: ['Y-BOCs Trajectory', 'Neuro-Behavioral Inventory', 'Cognitive Load Shield', 'Autonomic Regulation']
  }
];

@Component({
  selector: 'app-handoff-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <!-- Modal Backdrop -->
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
           (click)="closeModal()">
        
        <!-- Modal Card Container -->
        <div class="relative w-full max-w-4xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
             (click)="$event.stopPropagation()">
          
          <!-- Header Bar -->
          <div class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
                🤝
              </div>
              <div>
                <h2 class="text-base font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                  World-Class Specialist Handoff Studio
                </h2>
                <p class="text-xs text-slate-500 dark:text-zinc-400">
                  Select a targeted clinical specialist to auto-tune patient state, pre-filter data, & generate referral SOAP notes
                </p>
              </div>
            </div>
            
            <button type="button" (click)="closeModal()" aria-label="Close modal"
                    class="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 dark:border-zinc-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Body Content Area -->
          <div class="p-6 overflow-y-auto space-y-6 flex-1">
            
            <!-- Specialty Selection Carousel/Grid -->
            <div>
              <label class="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 block mb-3">
                1. Select Target Specialist Field:
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                @for (spec of specialtyProfiles; track spec.id) {
                  @let isFlipped = isSpecialtyFlipped(spec.id);

                  <div (click)="selectSpecialty(spec)"
                       (dblclick)="toggleSpecialtyFlip(spec.id); $event.stopPropagation()"
                       class="relative perspective-1000 group cursor-pointer h-44">
                    
                    <div [class.rotate-y-180]="isFlipped"
                         class="relative w-full h-full transition-transform duration-500 transform-style-3d">

                      <!-- FRONT FACE: Clinical Doctor Profile & Focus Tags -->
                      <div [class]="selectedSpecialty().id === spec.id ? spec.accentClass + ' ring-2 ring-indigo-500' : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'"
                           class="p-3.5 rounded-xl border flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden shadow-sm">
                        
                        <div class="flex items-center justify-between">
                          <span class="text-xl">{{ spec.icon }}</span>
                          <div class="flex items-center gap-1">
                            <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                              dblclick 🔄
                            </span>
                            <span class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                              {{ spec.targetLens }}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 class="text-xs font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">
                            {{ spec.title }}
                          </h3>
                          <p class="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                            {{ spec.doctorType }}
                          </p>
                        </div>

                        <div class="flex flex-wrap gap-1 pt-1">
                          @for (tag of spec.focusTags.slice(0, 2); track tag) {
                            <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 font-medium">
                              {{ tag }}
                            </span>
                          }
                        </div>
                      </div>

                      <!-- BACK FACE: Plain-Language Patient Referral Rationale -->
                      <div class="p-3.5 rounded-xl border border-indigo-500/40 bg-indigo-950 text-white flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden shadow-xl font-sans text-xs">
                        <div>
                          <div class="flex items-center justify-between border-b border-indigo-800 pb-1.5 mb-1.5 font-mono text-[10px]">
                            <span class="text-indigo-300 font-bold uppercase flex items-center gap-1">
                              <span>💡</span> Patient Literacy Rationale
                            </span>
                            <span class="text-indigo-400">dblclick flip</span>
                          </div>
                          <p class="text-[11px] text-indigo-100 leading-snug line-clamp-3">
                            {{ spec.description }}
                          </p>
                        </div>

                        <div class="pt-1.5 border-t border-indigo-900 text-[9px] font-mono text-indigo-300 flex justify-between">
                          <span>Patient Referral Guide</span>
                          <span>Double-click to return</span>
                        </div>
                      </div>

                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Specialist Tailored Handoff Summary (SOAP / SBAR Format) -->
            <div class="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-3">
              <div class="flex items-center justify-between border-b border-slate-200/60 dark:border-zinc-800 pb-2">
                <span class="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>📝</span> Specialist Referral Handoff Summary (SBAR Format)
                </span>
                <span class="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  Target :: {{ selectedSpecialty().title }}
                </span>
              </div>

              <div class="text-xs font-sans space-y-2 text-slate-700 dark:text-zinc-300">
                <p><strong>[SITUATION]</strong> Referencing patient for specialized evaluation under <strong>{{ selectedSpecialty().doctorType }}</strong> protocol.</p>
                <p><strong>[BACKGROUND]</strong> Primary complaint: <em>{{ (patientState.reasonForVisit() || patientState.patientGoals()) || 'Complex Multi-System Assessment' }}</em> across {{ issueCount() }} anatomical region(s).</p>
                <p><strong>[ASSESSMENT]</strong> Active Medicine Paradigm set to <strong>{{ activeParadigmLabel() }}</strong>. Primary focus tags: <em>{{ selectedSpecialty().focusTags.join(', ') }}</em>.</p>
                <p><strong>[RECOMMENDATION]</strong> Direct specialist handoff to <strong>{{ selectedSpecialty().targetLens }}</strong> lens. Full telemetry & base64 state serialized below.</p>
              </div>
            </div>

            <!-- Share Options Grid (QR Code + Copy Link) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              <!-- QR Code Display -->
              <div class="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40">
                <div #qrContainer class="p-2 bg-white rounded-lg shadow-sm border border-slate-200 mb-2"></div>
                <span class="text-[11px] text-slate-500 dark:text-zinc-400 font-mono text-center">
                  📱 Scan to instantly load specialist-tuned state on mobile device
                </span>
              </div>

              <!-- Copy Link Action Box -->
              <div class="flex flex-col justify-center space-y-3">
                <label class="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Specialist Handoff URL (Base64 Encoded):
                </label>
                <div class="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-950 text-[11px] font-mono text-slate-600 dark:text-zinc-400 truncate select-all">
                  {{ shareUrl() }}
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <button type="button" (click)="copyShareUrl()"
                          class="py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5">
                    @if (copied()) {
                      <span>✔ Copied!</span>
                    } @else {
                      <span>📋 Copy Link</span>
                    }
                  </button>

                  <button type="button" (click)="copySbarNote()"
                          class="py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200 dark:hover:bg-indigo-900 border border-indigo-300 dark:border-indigo-800 active:scale-[0.98] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5">
                    @if (sbarCopied()) {
                      <span>✔ SBAR Copied!</span>
                    } @else {
                      <span>📝 Copy SBAR</span>
                    }
                  </button>
                </div>
              </div>
            </div>

          </div>

          <!-- Footer Actions -->
          <div class="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
            <span class="text-xs text-slate-500 font-mono">
              Pocket Gull™ Open Telemetry & Clinical Referral Engine
            </span>

            <button type="button" (click)="closeModal()"
                    class="py-2 px-5 rounded-xl font-bold text-xs border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer">
              Close Handoff Studio
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class HandoffModalComponent {
  patientState = inject(PatientStateService);
  
  isOpen = input<boolean>(false);
  close = output<void>();

  qrContainer = viewChild<ElementRef<HTMLDivElement>>('qrContainer');
  
  specialtyProfiles = SPECIALTY_PROFILES;
  selectedSpecialty = signal<ISpecialtyProfile>(SPECIALTY_PROFILES[0]);

  readonly flippedSpecialties = signal<Set<string>>(new Set());

  private lastSpecialtyFlipMap = new Map<string, number>();

  toggleSpecialtyFlip(id: string, event?: Event) {
    if (event) event.stopPropagation();
    const now = Date.now();
    const last = this.lastSpecialtyFlipMap.get(id) || 0;
    if (now - last < 200) return;
    this.lastSpecialtyFlipMap.set(id, now);
    const current = new Set(this.flippedSpecialties());
    if (current.has(id)) current.delete(id);
    else current.add(id);
    this.flippedSpecialties.set(current);
  }

  isSpecialtyFlipped(id: string): boolean {
    return this.flippedSpecialties().has(id);
  }

  copied = signal<boolean>(false);
  sbarCopied = signal<boolean>(false);

  shareUrl = computed(() => {
    return this.patientState.generateExpandedShareUrl();
  });

  issueCount = computed(() => {
    return this.patientState.selectedIssues().length;
  });

  activeParadigmLabel = computed(() => {
    switch (this.patientState.activePhilosophy()) {
      case 'eastern':
        return 'Eastern TCM Paradigm';
      case 'ayurvedic':
        return 'Ayurvedic Medicine Paradigm';
      case 'western':
      default:
        return 'Western Allopathic Paradigm';
    }
  });

  constructor() {
    effect(() => {
      if (this.isOpen() && this.qrContainer()) {
        this.renderQrCode();
      }
    });
  }

  selectSpecialty(spec: ISpecialtyProfile): void {
    this.selectedSpecialty.set(spec);
    // Automatically switch active paradigm if applicable
    if (spec.id === 'tcm_master') {
      this.patientState.selectPhilosophy('eastern');
    } else if (spec.id === 'ayurvedic_vaidya') {
      this.patientState.selectPhilosophy('ayurvedic');
    } else {
      this.patientState.selectPhilosophy('western');
    }
    this.renderQrCode();
  }

  closeModal(): void {
    this.close.emit();
  }

  copyShareUrl(): void {
    const url = this.shareUrl();
    navigator.clipboard.writeText(url).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    });
  }

  copySbarNote(): void {
    const spec = this.selectedSpecialty();
    const sbarText = `[CLINICIAN SPECIALIST REFERRAL NOTE — SBAR FORMAT]
Target Specialist: ${spec.title} (${spec.doctorType})
Target Lens: ${spec.targetLens}
Primary Complaint: ${this.patientState.reasonForVisit() || this.patientState.patientGoals() || 'Complex Multi-System Assessment'}
Anatomical Regions: ${this.issueCount()} region(s) selected
Focus Tags: ${spec.focusTags.join(', ')}
Handoff Telemetry URL: ${this.shareUrl()}
Generated by Pocket Gull™ Clinical Intelligence`;

    navigator.clipboard.writeText(sbarText).then(() => {
      this.sbarCopied.set(true);
      setTimeout(() => this.sbarCopied.set(false), 2500);
    });
  }

  private renderQrCode(): void {
    const container = this.qrContainer()?.nativeElement;
    if (!container) return;

    try {
      container.innerHTML = '';
      const url = this.shareUrl();
      const code = generate(url);
      const dataUrl = code.toDataURL({ scale: 6 });
      container.innerHTML = `<img src="${dataUrl}" class="w-44 h-44 rounded-lg select-none pointer-events-none" style="image-rendering: pixelated;" alt="Specialist Handoff QR Code" />`;
    } catch (err) {
      console.warn('[HandoffModal] QR code rendering error:', err);
    }
  }
}
