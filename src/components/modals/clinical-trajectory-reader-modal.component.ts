import { Component, signal, computed, inject, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalTrajectoryReaderService, TrajectoryPersona, IBionicWord } from '../../services/clinical-trajectory-reader.service';
import { BionicReadingService, IClinicalBionicToken } from '../../services/bionic-reading.service';

@Component({
  selector: 'app-clinical-trajectory-reader-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="traj-reader-title">
      <!-- Rachel Nabors Parasympathetic Ambient Respiration Glow (10s Cycle) -->
      <div class="absolute w-96 h-96 rounded-full bg-teal-500/20 pointer-events-none animate-vagal-glow"></div>
      
      <div class="relative w-full max-w-4xl p-6 bg-zinc-950 text-zinc-100 rounded-2xl shadow-2xl border border-zinc-800 transition-all max-h-[92vh] overflow-y-auto font-sans flex flex-col animate-origami-unfurl">
        
        <!-- Close Button -->
        <button (click)="close.emit()" class="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pr-10 border-b border-zinc-800/80 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">⚡</span>
              <h2 id="traj-reader-title" class="text-xl font-bold text-zinc-100 tracking-tight">
                High-Velocity Trajectory & Bionic Speed Reader
              </h2>
            </div>
            <p class="text-xs text-zinc-400 mt-1">
              Absorb 4-page medical records in 45 seconds. Understand where the patient has been, where they stand today, and where they are going.
            </p>
          </div>

          <!-- Persona Selector -->
          <div class="inline-flex rounded-lg bg-zinc-900 p-1 border border-zinc-800 shrink-0">
            <button
              (click)="setPersona('clinician')"
              [class.bg-teal-600]="trajectoryService.persona() === 'clinician'"
              [class.text-white]="trajectoryService.persona() === 'clinician'"
              [class.text-zinc-400]="trajectoryService.persona() !== 'clinician'"
              class="px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
              👨‍⚕️ Clinician Note
            </button>
            <button
              (click)="setPersona('patient')"
              [class.bg-emerald-600]="trajectoryService.persona() === 'patient'"
              [class.text-white]="trajectoryService.persona() === 'patient'"
              [class.text-zinc-400]="trajectoryService.persona() !== 'patient'"
              class="px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
              🌱 Patient Horizon
            </button>
          </div>
        </div>

        <!-- RSVP Speed Reading Teleprompter Box -->
        <div class="mb-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800/80">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-3">
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono">RSVP Velocity Engine</span>
              <div class="flex items-center gap-2">
                <button
                  (click)="toggleRsvpPlay()"
                  class="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold rounded-md transition flex items-center gap-1 cursor-pointer">
                  <span>{{ isPlaying() ? '⏸️ Pause' : '▶️ Play Stream' }}</span>
                </button>
                <button
                  (click)="resetRsvp()"
                  class="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-md transition cursor-pointer">
                  🔄 Reset
                </button>
              </div>
            </div>

            <!-- Speed Slider -->
            <div class="flex items-center gap-2 font-mono text-xs text-zinc-300 w-full md:w-auto justify-end">
              <span>Pacing:</span>
              <input
                type="range"
                min="300"
                max="900"
                step="50"
                [ngModel]="speedWpm()"
                (ngModelChange)="setSpeed($event)"
                class="w-32 accent-teal-400 cursor-pointer" />
              <span class="font-bold text-teal-300 w-16 text-right">{{ speedWpm() }} WPM</span>
            </div>
          </div>

          <!-- RSVP Focus Word Screen with Center-Locked ORP Foveal Reticle -->
          <div class="relative h-24 bg-zinc-950 rounded-xl border border-teal-500/30 flex items-center justify-center overflow-hidden font-mono shadow-inner select-none">
            <!-- Center Vertical Guide Markers -->
            <div class="absolute top-0 bottom-0 left-1/2 w-[1px] bg-teal-500/25 pointer-events-none"></div>
            <div class="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
            <div class="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>

            @if (currentClinicalToken(); as token) {
              <div class="flex items-baseline text-2xl sm:text-3xl md:text-4xl tracking-tight leading-none">
                <!-- Left of ORP: right-aligned to crosshair -->
                <span class="w-[180px] sm:w-[220px] text-right text-zinc-300 font-semibold truncate pr-0.5">
                  {{ token.leadingPunct }}{{ token.leftOfOrp }}
                </span>
                <!-- Centered ORP Character -->
                <span class="text-amber-400 font-black text-3xl sm:text-4xl md:text-5xl px-0.5 underline decoration-amber-400 decoration-2 underline-offset-4 font-mono">
                  {{ token.orpChar }}
                </span>
                <!-- Right of ORP: left-aligned from crosshair -->
                <span class="w-[180px] sm:w-[220px] text-left text-zinc-400 font-normal truncate pl-0.5">
                  {{ token.rightOfOrp }}{{ token.trailingPunct }}
                </span>
              </div>
            } @else {
              <div class="text-sm font-mono text-zinc-500">Press Play to begin 600–900 WPM stream</div>
            }
          </div>
        </div>

        <!-- 3-Act Chronological Arc View -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          <!-- 1. Where You've Been -->
          <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-base">⏪</span>
                <h3 class="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  1. Where You've Been
                </h3>
              </div>
              <div class="text-[11px] text-zinc-400 mb-3">Historical Foundation & Triggers</div>
              
              <div class="space-y-3">
                @for (node of profile().pastFoundation; track node.id) {
                  <div class="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs">
                    <div class="font-bold text-zinc-200" [innerHTML]="trajectoryService.toBionicHtml(node.title)"></div>
                    <div class="text-zinc-400 mt-1 leading-relaxed text-[11px]" [innerHTML]="trajectoryService.toBionicHtml(node.description)"></div>
                    @if (node.code) {
                      <span class="inline-block mt-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">{{ node.code }}</span>
                    }
                  </div>
                }
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-zinc-800/60 text-[10px] text-zinc-500 font-mono">
              Baseline: Epigenetic drag identified
            </div>
          </div>

          <!-- 2. Where You Stand Today -->
          <div class="p-4 rounded-xl bg-zinc-900/60 border border-teal-500/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-base">📍</span>
                <h3 class="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono">
                  2. Where You Stand Today
                </h3>
              </div>
              <div class="text-[11px] text-zinc-400 mb-3">Current Fulcrum & Telemetry</div>

              <div class="space-y-3">
                @for (node of profile().presentFulcrum; track node.id) {
                  <div class="p-2.5 rounded-lg bg-zinc-950/80 border border-teal-500/20 text-xs">
                    <div class="font-bold text-zinc-200" [innerHTML]="trajectoryService.toBionicHtml(node.title)"></div>
                    <div class="text-zinc-400 mt-1 leading-relaxed text-[11px]" [innerHTML]="trajectoryService.toBionicHtml(node.description)"></div>
                    @if (node.metrics) {
                      <div class="grid grid-cols-2 gap-1.5 mt-2 font-mono text-[10px]">
                        @for (item of node.metrics | keyvalue; track item.key) {
                          <div class="bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                            <span class="text-zinc-500">{{ item.key }}: </span>
                            <span class="text-teal-300 font-bold">{{ item.value }}</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-teal-500/20 flex items-center justify-between text-[10px] text-teal-400 font-mono">
              <span>Active Vitality:</span>
              <span class="text-sm font-bold text-teal-300">{{ profile().currentVitalityScore }}%</span>
            </div>
          </div>

          <!-- 3. Where You're Going -->
          <div class="p-4 rounded-xl bg-zinc-900/60 border border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-base">🚀</span>
                <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  3. Where You're Going
                </h3>
              </div>
              <div class="text-[11px] text-zinc-400 mb-3">90-Day Vitality Horizon</div>

              <div class="space-y-3">
                @for (node of profile().futureHorizon; track node.id) {
                  <div class="p-2.5 rounded-lg bg-zinc-950/80 border border-emerald-500/20 text-xs">
                    <div class="flex items-center justify-between">
                      <div class="font-bold text-zinc-200" [innerHTML]="trajectoryService.toBionicHtml(node.title)"></div>
                      <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">{{ node.timeframe }}</span>
                    </div>
                    <div class="text-zinc-400 mt-1 leading-relaxed text-[11px]" [innerHTML]="trajectoryService.toBionicHtml(node.description)"></div>
                  </div>
                }
              </div>
            </div>
            <div class="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-400 font-mono">
              <span>Projected Vitality:</span>
              <span class="text-sm font-bold text-emerald-300">{{ profile().projectedVitalityScore }}%</span>
            </div>
          </div>
        </div>

        <!-- Footer Actions & Integrity Seal -->
        <div class="pt-4 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span class="text-emerald-400">🛡️ NIST SP 800-90A CSPRNG SHA-256 Attested:</span>
            <span class="text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{{ profile().digestSeal }}</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="copyFormattedBrief()"
              class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
              📋 Copy Brief
            </button>
            <button
              (click)="exportFhirCarePlan()"
              class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
              📥 Export FHIR CarePlan
            </button>
            <button
              (click)="printBrief()"
              class="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-md hover:shadow-lg cursor-pointer">
              🖨️ Print Handoff
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class ClinicalTrajectoryReaderModalComponent implements OnDestroy {
  @Output() close = new EventEmitter<void>();

  readonly trajectoryService = inject(ClinicalTrajectoryReaderService);
  readonly bionic = inject(BionicReadingService);

  speedWpm = signal<number>(450);
  isPlaying = signal<boolean>(false);
  currentIndex = signal<number>(0);
  tokens = signal<IBionicWord[]>([]);

  private timerInterval: any = null;

  profile = computed(() => this.trajectoryService.getTrajectoryProfile());
  currentWord = computed(() => {
    const list = this.tokens();
    const idx = this.currentIndex();
    return list[idx] || null;
  });

  currentClinicalToken = computed<IClinicalBionicToken | null>(() => {
    const word = this.currentWord();
    if (!word) return null;
    return this.bionic.parseClinicalToken(word.fullText || `${word.prefix}${word.fixation}${word.suffix}`);
  });

  constructor() {
    this.refreshTokens();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  setPersona(p: TrajectoryPersona): void {
    this.trajectoryService.persona.set(p);
    this.refreshTokens();
    this.resetRsvp();
  }

  setSpeed(val: number): void {
    this.speedWpm.set(val);
    if (this.isPlaying()) {
      this.stopTimer();
      this.startTimer();
    }
  }

  toggleRsvpPlay(): void {
    if (this.isPlaying()) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  resetRsvp(): void {
    this.stopTimer();
    this.currentIndex.set(0);
  }

  copyFormattedBrief(): void {
    const text = this.trajectoryService.persona() === 'clinician'
      ? this.trajectoryService.generateDoctorHandoffText()
      : this.trajectoryService.generatePatientTrajectoryText();
    navigator.clipboard?.writeText(text);
  }

  exportFhirCarePlan(): void {
    const plan = this.trajectoryService.exportFhirCarePlan();
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PocketGull-FHIR-CarePlan-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  printBrief(): void {
    window.print();
  }

  private refreshTokens(): void {
    const text = this.trajectoryService.persona() === 'clinician'
      ? this.trajectoryService.generateDoctorHandoffText()
      : this.trajectoryService.generatePatientTrajectoryText();
    this.tokens.set(this.trajectoryService.tokenizeForRsvp(text));
  }

  private startTimer(): void {
    this.isPlaying.set(true);
    const msPerWord = Math.max(50, Math.floor(60000 / this.speedWpm()));
    this.timerInterval = setInterval(() => {
      const next = this.currentIndex() + 1;
      if (next >= this.tokens().length) {
        this.stopTimer();
        this.currentIndex.set(0);
      } else {
        this.currentIndex.set(next);
      }
    }, msPerWord);
  }

  private stopTimer(): void {
    this.isPlaying.set(false);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
