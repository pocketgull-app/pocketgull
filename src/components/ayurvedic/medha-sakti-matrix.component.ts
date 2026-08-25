import { Component, computed, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { ThemeService } from '../../services/theme.service';

export interface IMedhaRasayanaHerb {
  id: string;
  name: string;
  sanskritName: string;
  botanicalName: string;
  dosage: string;
  saktiTarget: 'Grahana' | 'Dharana' | 'Smarana' | 'Tri-Sakti';
  clinicalMechanism: string;
  phytochemicals: string[];
  synergisticPairs: string[];
  traditionalFormulation: string;
  icon: string;
}

@Component({
  selector: 'app-medha-sakti-matrix',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full p-6 rounded-2xl border transition-all duration-300 shadow-xl backdrop-blur-md flex flex-col justify-between"
         [ngClass]="themeService.activeTheme() === 'dark' ? 'bg-amber-950/30 border-amber-800/40 text-amber-100' : 'bg-amber-50/90 border-amber-200 text-slate-900'">
      
      <!-- Component Header -->
      <div>
        <div class="flex items-center justify-between pb-4 border-b"
             [ngClass]="themeService.activeTheme() === 'dark' ? 'border-amber-800/40' : 'border-amber-200'">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
              🧠
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight">Medha Śakti Tri-Fold Cognitive Matrix</h3>
              <p class="text-xs text-amber-400 font-medium">Grahana, Dhāraṇā & Smaraṇa Intellect Telemetry</p>
            </div>
          </div>

          <span class="px-3 py-1 text-xs font-bold rounded-full border bg-amber-500/10 border-amber-500/30 text-amber-300">
            Medha Level: {{ overallMedhaIndex() }}%
          </span>
        </div>

        <!-- Tri-Fold Śakti Telemetry Gauges Grid -->
        <div class="mt-5 grid grid-cols-3 gap-3">
          <!-- Grahana Śakti Gauge -->
          <div class="p-3 rounded-xl border bg-black/20 border-amber-500/20">
            <div class="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
              <span>👁️ Grahana</span>
              <span>{{ grahanaSakti() }}%</span>
            </div>
            <p class="text-[10px] text-amber-200/70 mb-2">Acquisition & Intake</p>
            <div class="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-amber-500/30">
              <div class="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500 rounded-full"
                   [style.width.%]="grahanaSakti()"></div>
            </div>
          </div>

          <!-- Dhāraṇā Śakti Gauge -->
          <div class="p-3 rounded-xl border bg-black/20 border-emerald-500/20">
            <div class="flex items-center justify-between text-xs font-bold text-emerald-300 mb-1">
              <span>🛡️ Dhāraṇā</span>
              <span>{{ dharanaSakti() }}%</span>
            </div>
            <p class="text-[10px] text-emerald-200/70 mb-2">Retention & Stability</p>
            <div class="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-emerald-500/30">
              <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 rounded-full"
                   [style.width.%]="dharanaSakti()"></div>
            </div>
          </div>

          <!-- Smaraṇa Śakti Gauge -->
          <div class="p-3 rounded-xl border bg-black/20 border-indigo-500/20">
            <div class="flex items-center justify-between text-xs font-bold text-indigo-300 mb-1">
              <span>⚡ Smaraṇa</span>
              <span>{{ smaranaSakti() }}%</span>
            </div>
            <p class="text-[10px] text-indigo-200/70 mb-2">Recall & Synthesis</p>
            <div class="w-full bg-black/40 rounded-full h-2 overflow-hidden border border-indigo-500/30">
              <div class="bg-gradient-to-r from-indigo-500 to-purple-400 h-full transition-all duration-500 rounded-full"
                   [style.width.%]="smaranaSakti()"></div>
            </div>
          </div>
        </div>

        <!-- Medha Rasayana Quad-Botanical Grid -->
        <div class="mt-5 space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>🌿</span> Medha Rasayana Botanical Nootropic Formulations
            </h4>
            <span class="text-[10px] text-amber-400/70 italic">Click card for clinical depth</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            @for (herb of medhaHerbs; track herb.id) {
              <div (click)="selectHerb(herb)"
                   class="p-2.5 rounded-xl border bg-black/20 border-amber-500/20 flex items-start gap-2.5 cursor-pointer hover:border-amber-400/60 hover:bg-amber-500/10 transition-all duration-200"
                   [ngClass]="selectedHerb()?.id === herb.id ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-500/20' : ''">
                <span class="text-lg shrink-0 mt-0.5">{{ herb.icon }}</span>
                <div class="space-y-0.5 flex-1">
                  <div class="flex items-center justify-between gap-1">
                    <strong class="text-amber-200 text-xs font-bold">{{ herb.name }} ({{ herb.sanskritName }})</strong>
                    <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                      {{ herb.dosage }}
                    </span>
                  </div>
                  <p class="text-[10px] italic text-amber-400/80">{{ herb.botanicalName }} • Target: {{ herb.saktiTarget }}</p>
                  <p class="text-[11px] leading-snug opacity-90">{{ herb.clinicalMechanism }}</p>
                </div>
              </div>
            }
          </div>

          <!-- Expanded Botanical Detail Modal/Panel -->
          @if (selectedHerb(); as herb) {
            <div class="mt-3 p-3.5 rounded-xl border bg-amber-950/60 border-amber-500/40 text-amber-100 space-y-2 animate-fadeIn shadow-2xl">
              <div class="flex items-center justify-between pb-2 border-b border-amber-500/30">
                <div class="flex items-center gap-2">
                  <span class="text-xl">{{ herb.icon }}</span>
                  <div>
                    <h5 class="text-xs font-extrabold text-amber-200">{{ herb.name }} • {{ herb.sanskritName }} ({{ herb.botanicalName }})</h5>
                    <span class="text-[10px] text-amber-400 font-semibold">Target Śakti: {{ herb.saktiTarget }}</span>
                  </div>
                </div>
                <button (click)="selectHerb(null)" class="text-xs text-amber-400 hover:text-amber-200 px-2 py-0.5 rounded bg-black/40 border border-amber-500/30">
                  ✕ Close
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div>
                  <strong class="text-amber-300 block mb-0.5">Active Phytochemicals:</strong>
                  <div class="flex flex-wrap gap-1">
                    @for (phyto of herb.phytochemicals; track phyto) {
                      <span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 text-[10px] border border-amber-500/30">
                        {{ phyto }}
                      </span>
                    }
                  </div>
                </div>

                <div>
                  <strong class="text-amber-300 block mb-0.5">Synergistic Pairings:</strong>
                  <p class="text-amber-100/90 text-[10px] leading-snug">{{ herb.synergisticPairs.join(', ') }}</p>
                </div>
              </div>

              <div class="pt-1.5 border-t border-amber-500/20 text-[11px]">
                <strong class="text-amber-300">Classical Formulation:</strong>
                <p class="text-amber-100/80 text-[10px] italic">{{ herb.traditionalFormulation }}</p>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Medha Pranayama & Solfeggio Co-Regulation Ribbon -->
      <div class="mt-4 pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
           [ngClass]="themeService.activeTheme() === 'dark' ? 'border-amber-800/40' : 'border-amber-200'">
        <div class="flex items-center gap-2">
          <span>🫁</span>
          <div>
            <strong class="text-amber-300 font-bold block">Nadi Shodhana Pranayama (4-4-4-4 Box Breath)</strong>
            <span class="text-[11px] opacity-80">Alternate nostril breathing to balance Ida & Pingala nadis and clear Pranavaha Srotas.</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          @if (isSolfeggioActive()) {
            <div class="flex items-center gap-1.5 text-[10px] text-emerald-300 font-medium">
              <span>🔊 Volume:</span>
              <input type="range" min="0" max="1" step="0.05" [value]="solfeggioVolume()" (input)="updateVolume($event)"
                     class="w-16 accent-emerald-400 h-1 rounded cursor-pointer" />
            </div>
          }

          <button (click)="toggleSolfeggioSync()"
                  class="px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md shrink-0 flex items-center gap-2"
                  [ngClass]="isSolfeggioActive() ? 'bg-emerald-500 border-emerald-400 text-black shadow-emerald-500/40' : 'bg-amber-500/20 border-amber-500/40 text-amber-200 hover:bg-amber-500/30'">
            <span>🎵</span> {{ isSolfeggioActive() ? 'Solfeggio 528Hz Active' : 'Engage 528Hz Medha Sync' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class MedhaSaktiMatrixComponent implements OnDestroy {
  private patientState = inject(PatientStateService);
  readonly themeService = inject(ThemeService);

  readonly isSolfeggioActive = signal<boolean>(false);
  readonly solfeggioVolume = signal<number>(0.15);
  readonly selectedHerb = signal<IMedhaRasayanaHerb | null>(null);

  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  readonly medhaHerbs: IMedhaRasayanaHerb[] = [
    {
      id: 'brahmi',
      name: 'Brahmi',
      sanskritName: 'ब्राह्मी',
      botanicalName: 'Bacopa monnieri',
      dosage: '300 mg (55% Bacosides)',
      saktiTarget: 'Smarana',
      clinicalMechanism: 'Upregulates dendritic arborization, TPH2 gene expression, and accelerates long-term memory retrieval speed.',
      phytochemicals: ['Bacoside A', 'Bacoside B', 'Hersaponin', 'Monnierin'],
      synergisticPairs: ['Gotu Kola', 'Ghee (Liposomal Carrier)', 'Black Pepper'],
      traditionalFormulation: 'Brahmi Ghrita (Medicated Ghee cooked with Bacopa monnieri & Triphala)',
      icon: '🌱'
    },
    {
      id: 'shankhpushpi',
      name: 'Shankhpushpi',
      sanskritName: 'शंखपुष्पी',
      botanicalName: 'Convolvulus pluricaulis',
      dosage: '400 mg Extract',
      saktiTarget: 'Dharana',
      clinicalMechanism: 'Enhances GABAergic inhibition, calms hyper-ideation anxiety, and fortifies long-term cognitive retention capacity.',
      phytochemicals: ['Convolvine', 'Scopoletin', 'Phytosterols', 'Microphyline'],
      synergisticPairs: ['Jatamansi', 'Vacha', 'Ashwagandha'],
      traditionalFormulation: 'Shankhpushpi Syrup with Shankhapushpi & Bramhi decoction',
      icon: '🌸'
    },
    {
      id: 'jyotishmati',
      name: 'Jyotishmati',
      sanskritName: 'ज्योतिष्मती',
      botanicalName: 'Celastrus paniculatus',
      dosage: '200 mg Seed Oil',
      saktiTarget: 'Grahana',
      clinicalMechanism: 'Promotes acetylcholine V_max, sharpens sensory perception, and accelerates real-time multi-domain context acquisition.',
      phytochemicals: ['Celastrine', 'Paniculatine', 'Malkanguni Oil', 'Sesquiterpenes'],
      synergisticPairs: ['Cow Milk', 'Vacha (Acorus calamus)', 'Honey'],
      traditionalFormulation: 'Jyotishmati Taila Drop Titration with Milk',
      icon: '🔥'
    },
    {
      id: 'mandukaparni',
      name: 'Mandukaparni',
      sanskritName: 'मण्डूकपर्णी',
      botanicalName: 'Centella asiatica',
      dosage: '350 mg Extract',
      saktiTarget: 'Tri-Sakti',
      clinicalMechanism: 'Enhances cerebral microvascular perfusion, scavenges ROS, and protects microglial tight junctions.',
      phytochemicals: ['Asiaticoside', 'Madecassoside', 'Asiatic Acid', 'Madasiatic Acid'],
      synergisticPairs: ['Brahmi', 'Guduchi', 'Licorice'],
      traditionalFormulation: 'Mandukaparni Swarasa (Fresh Leaf Juice with Honey)',
      icon: '🍃'
    }
  ];

  readonly grahanaSakti = computed<number>(() => {
    const vitals = this.patientState.vitals();
    const hrVal = parseFloat(vitals?.hr || '72');
    const spO2Val = parseFloat(vitals?.spO2 || '98');

    let score = 85;
    if (hrVal > 85) score -= 10;
    if (spO2Val < 95) score -= 15;
    if (this.patientState.occupation().toLowerCase().includes('polymath')) score += 10;
    return Math.min(100, Math.max(50, score));
  });

  readonly dharanaSakti = computed<number>(() => {
    const occProfile = this.patientState.occupationalProfile();
    let score = 82;
    if (occProfile) {
      if (occProfile.actuarialQalyImpact > 2.0) score += 12;
      if (occProfile.allostaticBurnoutScore > 8.0) score -= 14;
    }
    return Math.min(100, Math.max(45, score));
  });

  readonly smaranaSakti = computed<number>(() => {
    let score = 88;
    if (this.isSolfeggioActive()) score += 8;
    if (this.patientState.medications().length > 0) score += 4;
    return Math.min(100, Math.max(55, score));
  });

  readonly overallMedhaIndex = computed<number>(() => {
    const avg = (this.grahanaSakti() + this.dharanaSakti() + this.smaranaSakti()) / 3;
    return Math.round(avg);
  });

  selectHerb(herb: IMedhaRasayanaHerb | null) {
    if (this.selectedHerb()?.id === herb?.id) {
      this.selectedHerb.set(null);
    } else {
      this.selectedHerb.set(herb);
    }
  }

  toggleSolfeggioSync() {
    const newState = !this.isSolfeggioActive();
    this.isSolfeggioActive.set(newState);

    if (newState) {
      this.startSolfeggioTone();
    } else {
      this.stopSolfeggioTone();
    }
  }

  updateVolume(event: Event) {
    const input = event.target as HTMLInputElement;
    const val = parseFloat(input.value);
    this.solfeggioVolume.set(val);
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setTargetAtTime(val, this.audioCtx.currentTime, 0.05);
    }
  }

  private startSolfeggioTone() {
    if (typeof window === 'undefined') return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.oscillator = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();

      // 528 Hz Solfeggio frequency (Transformation & DNA Repair Tone)
      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(528.0, this.audioCtx.currentTime);

      // Smooth attack ramp to prevent audible click
      this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(this.solfeggioVolume(), this.audioCtx.currentTime + 0.15);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.oscillator.start();
    } catch (e) {
      console.debug('[MedhaSaktiMatrix] Solfeggio tone start failed:', (e as Error)?.message);
    }
  }

  private stopSolfeggioTone() {
    if (!this.oscillator || !this.gainNode || !this.audioCtx) return;

    try {
      // Smooth decay ramp
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioCtx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.15);

      setTimeout(() => {
        if (this.oscillator) {
          this.oscillator.stop();
          this.oscillator.disconnect();
          this.oscillator = null;
        }
      }, 160);
    } catch (e) {
      console.debug('[MedhaSaktiMatrix] Solfeggio tone stop failed:', (e as Error)?.message);
      this.oscillator = null;
    }
  }

  ngOnDestroy() {
    this.stopSolfeggioTone();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}

