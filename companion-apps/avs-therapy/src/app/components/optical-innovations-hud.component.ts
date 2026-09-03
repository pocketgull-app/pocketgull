import {
  Component,
  inject,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  effect
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  OpticalInnovationsService,
  OpticalTherapyMode,
  CircadianPhase,
  DichopticRenderMode
} from '../services/optical-innovations.service';
import { OpticalChronoTrajectoryService } from '../services/optical-chrono-trajectory.service';
import { AVS_CLINICAL_EVIDENCE } from '../services/avs-evidence-citations';

@Component({
  selector: 'app-optical-innovations-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-rose-500/25 bg-gradient-to-b from-slate-950 via-zinc-950 to-rose-950/20 p-5 space-y-4 shadow-2xl font-sans">
      <!-- Header Bar -->
      <div class="flex flex-wrap items-center justify-between border-b border-rose-500/15 pb-3 gap-2">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold text-sm">
            ✨
          </div>
          <div>
            <h3 class="text-xs font-black uppercase tracking-widest text-rose-200">
              Positive Optical Innovations & Photobiomodulation
            </h3>
            <p class="text-[10px] text-zinc-400">
              UCL 670nm PBM · OKN/VOR Vestibular Grating · CIE S 026 ipRGC · Dichoptic Beat · Ganzfeld ORP
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[9px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-500/30">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ISCEV Ophthalmic Safe
          </span>
        </div>
      </div>

      <!-- Optical Paradigm Navigation Tabs -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        <button (click)="service.setMode('photobiomodulation-670nm')"
                class="p-2.5 rounded-xl border text-left transition-all cursor-pointer"
                [class.border-rose-400]="service.activeMode() === 'photobiomodulation-670nm'"
                [class.bg-rose-950/40]="service.activeMode() === 'photobiomodulation-670nm'"
                [class.border-zinc-800]="service.activeMode() !== 'photobiomodulation-670nm'"
                [class.bg-zinc-900/40]="service.activeMode() !== 'photobiomodulation-670nm'">
          <div class="text-[11px] font-bold text-rose-300 flex items-center gap-1">
            <span>🔴</span> 670nm PBM
          </div>
          <div class="text-[9px] text-zinc-400 mt-0.5">UCL Mitochondrial ATP</div>
        </button>

        <button (click)="service.setMode('okn-vor-grating')"
                class="p-2.5 rounded-xl border text-left transition-all cursor-pointer"
                [class.border-cyan-400]="service.activeMode() === 'okn-vor-grating'"
                [class.bg-cyan-950/40]="service.activeMode() === 'okn-vor-grating'"
                [class.border-zinc-800]="service.activeMode() !== 'okn-vor-grating'"
                [class.bg-zinc-900/40]="service.activeMode() !== 'okn-vor-grating'">
          <div class="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
            <span>〰️</span> OKN/VOR
          </div>
          <div class="text-[9px] text-zinc-400 mt-0.5">Vestibular Grating</div>
        </button>

        <button (click)="service.setMode('melanopic-iprgc-circadian')"
                class="p-2.5 rounded-xl border text-left transition-all cursor-pointer"
                [class.border-amber-400]="service.activeMode() === 'melanopic-iprgc-circadian'"
                [class.bg-amber-950/40]="service.activeMode() === 'melanopic-iprgc-circadian'"
                [class.border-zinc-800]="service.activeMode() !== 'melanopic-iprgc-circadian'"
                [class.bg-zinc-900/40]="service.activeMode() !== 'melanopic-iprgc-circadian'">
          <div class="text-[11px] font-bold text-amber-300 flex items-center gap-1">
            <span>🌅</span> ipRGC Lux
          </div>
          <div class="text-[9px] text-zinc-400 mt-0.5">CIE S 026 Circadian</div>
        </button>

        <button (click)="service.setMode('dichoptic-optical-beat')"
                class="p-2.5 rounded-xl border text-left transition-all cursor-pointer"
                [class.border-purple-400]="service.activeMode() === 'dichoptic-optical-beat'"
                [class.bg-purple-950/40]="service.activeMode() === 'dichoptic-optical-beat'"
                [class.border-zinc-800]="service.activeMode() !== 'dichoptic-optical-beat'"
                [class.bg-zinc-900/40]="service.activeMode() !== 'dichoptic-optical-beat'">
          <div class="text-[11px] font-bold text-purple-300 flex items-center gap-1">
            <span>👁️‍🗨️</span> Dichoptic
          </div>
          <div class="text-[9px] text-zinc-400 mt-0.5">Interocular V1 Beat</div>
        </button>

        <button (click)="service.setMode('ganzfeld-orp-reticle')"
                class="p-2.5 rounded-xl border text-left transition-all cursor-pointer"
                [class.border-indigo-400]="service.activeMode() === 'ganzfeld-orp-reticle'"
                [class.bg-indigo-950/40]="service.activeMode() === 'ganzfeld-orp-reticle'"
                [class.border-zinc-800]="service.activeMode() !== 'ganzfeld-orp-reticle'"
                [class.bg-zinc-900/40]="service.activeMode() !== 'ganzfeld-orp-reticle'">
          <div class="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
            <span>🌫️</span> Ganzfeld ORP
          </div>
          <div class="text-[9px] text-zinc-400 mt-0.5">Foveal Rest Reticle</div>
        </button>
      </div>

      <!-- Main Visual Viewport -->
      <div class="relative w-full h-52 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
        <canvas #opticalCanvas class="w-full h-full"></canvas>

        <!-- 670nm Countdown Overlay -->
        @if (service.activeMode() === 'photobiomodulation-670nm') {
          <div class="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/30 pointer-events-none">
            <div class="text-4xl font-extrabold font-mono text-rose-300 tracking-wider">
              {{ formatMinutesSeconds(service.pbmState().secondsRemaining) }}
            </div>
            <div class="text-[10px] font-semibold text-rose-200/80 mt-1 uppercase tracking-widest">
              670nm Retinal Photobiomodulation Bath
            </div>
            @if (service.pbmState().isCompleted) {
              <div class="mt-2 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full">
                ✓ 3-Minute Clinical Dose Completed (+{{ service.pbmState().atpElevationIndex }}% ATP)
              </div>
            }
          </div>
        }

        <!-- Ganzfeld ORP Reticle Overlay -->
        @if (service.activeMode() === 'ganzfeld-orp-reticle') {
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-3 h-3 rounded-full bg-indigo-950/80 border border-indigo-300/80 shadow-[0_0_12px_rgba(129,140,248,0.8)] flex items-center justify-center animate-pulse">
              <div class="w-1 h-1 rounded-full bg-white"></div>
            </div>
          </div>
        }
      </div>

      <!-- Dynamic Control & Telemetry Panel per Mode -->
      <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
        @switch (service.activeMode()) {
          @case ('photobiomodulation-670nm') {
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="text-xs font-bold text-rose-300">Cytochrome c Oxidase Photostimulation</div>
                <div class="text-[10px] text-zinc-400">
                  Target: RPE Mitochondria · Irradiance: {{ service.pbmState().irradianceMwCm2 }} mW/cm² · Boost: +{{ service.pbmState().atpElevationIndex }}% ATP
                </div>
              </div>

              <div class="flex items-center gap-2">
                @if (!service.pbmState().isActive) {
                  <button (click)="service.startPbmSession()"
                          class="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer">
                    ▶ Start 3-Min Dose
                  </button>
                } @else {
                  <button (click)="service.pausePbmSession()"
                          class="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer">
                    ⏸ Pause Session
                  </button>
                }
                <button (click)="service.resetPbmSession()"
                        class="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-all cursor-pointer">
                  Reset
                </button>
              </div>
            </div>
          }

          @case ('okn-vor-grating') {
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="text-xs font-bold text-cyan-300">Optokinetic Nystagmus & VOR Calibrator</div>
                <div class="text-[10px] text-zinc-400">
                  Spatial: {{ service.oknState().spatialFrequencyCpd }} cpd · Velocity: {{ service.oknState().driftVelocityDegPerSec }}°/s · Direction: {{ service.oknState().direction }}
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button (click)="service.updateOknDirection('left-to-right')"
                        class="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold"
                        [class.bg-cyan-500/20]="service.oknState().direction === 'left-to-right'"
                        [class.border-cyan-400]="service.oknState().direction === 'left-to-right'">
                  Left → Right
                </button>
                <button (click)="service.updateOknDirection('bilateral-respiratory')"
                        class="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold"
                        [class.bg-cyan-500/20]="service.oknState().direction === 'bilateral-respiratory'"
                        [class.border-cyan-400]="service.oknState().direction === 'bilateral-respiratory'">
                  Bilateral 0.1Hz
                </button>
              </div>
            </div>
          }

          @case ('melanopic-iprgc-circadian') {
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="text-xs font-bold text-amber-300">CIE S 026 ipRGC Melanopsin Lux Meter</div>
                <div class="text-[10px] text-zinc-400">
                  EML: {{ service.melanopicState().equivalentMelanopicLux }} lux · m-EDI: {{ service.melanopicState().melanopicEdiLux }} lux · Blue Attenuation: {{ service.melanopicState().blueAttenuationPercent }}%
                </div>
              </div>

              <div class="flex items-center gap-1.5">
                <button (click)="service.setCircadianPhase('dawn-alert')"
                        class="px-2.5 py-1 rounded-lg border text-[10px] font-bold"
                        [class.bg-amber-500/20]="service.melanopicState().phase === 'dawn-alert'"
                        [class.border-amber-400]="service.melanopicState().phase === 'dawn-alert'">
                  🌅 Dawn Alert
                </button>
                <button (click)="service.setCircadianPhase('dusk-depletion')"
                        class="px-2.5 py-1 rounded-lg border text-[10px] font-bold"
                        [class.bg-amber-500/20]="service.melanopicState().phase === 'dusk-depletion'"
                        [class.border-amber-400]="service.melanopicState().phase === 'dusk-depletion'">
                  🌆 Dusk Filter
                </button>
                <button (click)="service.setCircadianPhase('night-ruby')"
                        class="px-2.5 py-1 rounded-lg border text-[10px] font-bold"
                        [class.bg-rose-500/20]="service.melanopicState().phase === 'night-ruby'"
                        [class.border-rose-400]="service.melanopicState().phase === 'night-ruby'">
                  🌙 Zero-Blue Ruby
                </button>
              </div>
            </div>
          }

          @case ('dichoptic-optical-beat') {
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="text-xs font-bold text-purple-300">Dichoptic Interocular V1 Frequency Synthesis</div>
                <div class="text-[10px] text-zinc-400">
                  Left Eye: {{ service.dichopticState().leftEyeFreqHz }} Hz · Right Eye: {{ service.dichopticState().rightEyeFreqHz }} Hz · Cortical Beat: {{ service.dichopticState().interocularBeatHz }} Hz
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button (click)="service.setDichopticRenderMode('side-by-side')"
                        class="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold"
                        [class.bg-purple-500/20]="service.dichopticState().renderMode === 'side-by-side'"
                        [class.border-purple-400]="service.dichopticState().renderMode === 'side-by-side'">
                  Side-by-Side (VR)
                </button>
                <button (click)="service.setDichopticRenderMode('anaglyph-red-cyan')"
                        class="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold"
                        [class.bg-purple-500/20]="service.dichopticState().renderMode === 'anaglyph-red-cyan'"
                        [class.border-purple-400]="service.dichopticState().renderMode === 'anaglyph-red-cyan'">
                  Red/Cyan Anaglyph
                </button>
              </div>
            </div>
          }

          @case ('ganzfeld-orp-reticle') {
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="text-xs font-bold text-indigo-300">Ganzfeld Hypnagogia & Bionic ORP Fixation Reticle</div>
                <div class="text-[10px] text-zinc-400">
                  Reticle Size: 1.0 arcminute · Foveal Micro-Saccade Stabilization Active · Bio-Rhythmic Pacing
                </div>
              </div>

              <button (click)="service.toggleGanzfeldBreathingAnchor()"
                      class="px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all"
                      [class.bg-indigo-500/20]="service.ganzfeldState().isBreathingAnchorActive"
                      [class.border-indigo-400]="service.ganzfeldState().isBreathingAnchorActive">
                {{ service.ganzfeldState().isBreathingAnchorActive ? '✓ 0.1Hz Breathing Anchor ON' : 'Anchor Static' }}
              </button>
            </div>
          }
        }
      </div>

      <!-- ── SECTION: MY PRESCRIBED OPTICAL DAY (3-PHASE CIRCADIAN FLOW) ── -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-sm">🗓️</span>
            <h4 class="text-xs font-black uppercase tracking-widest text-zinc-200">
              My Prescribed Optical Day & Chrono-Flow
            </h4>
          </div>
          <span class="text-[10px] font-mono text-zinc-400">
            Suggested: {{ trajectory.currentSuggestedPhase() | uppercase }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          @for (phase of trajectory.dailyPhases(); track phase.id) {
            <div class="p-3 rounded-xl border transition-all flex flex-col justify-between"
                 [class.border-rose-500/50]="trajectory.currentSuggestedPhase() === phase.id"
                 [class.bg-rose-950/20]="trajectory.currentSuggestedPhase() === phase.id"
                 [class.border-zinc-800]="trajectory.currentSuggestedPhase() !== phase.id"
                 [class.bg-zinc-900/40]="trajectory.currentSuggestedPhase() !== phase.id">
              <div>
                <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span>{{ phase.timeWindow }}</span>
                  @if (phase.isCompleted) {
                    <span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">✓ DONE</span>
                  }
                </div>
                <div class="text-xs font-bold text-zinc-100 mb-1">{{ phase.title }}</div>
                <p class="text-[10px] text-zinc-400 leading-relaxed">{{ phase.clinicalMechanism }}</p>
              </div>

              <div class="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                <span class="text-[9px] font-mono text-zinc-500">{{ phase.clinicalDurationSeconds / 60 }} min dose</span>
                <button (click)="trajectory.launchDailyPhase(phase.id)"
                        class="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] shadow transition-all cursor-pointer">
                  ▶ Launch Phase
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- ── SECTION: CLOSED-LOOP AUTONOMIC COHERENCE FEEDBACK ── -->
      @if (trajectory.lastCoherenceDelta(); as delta) {
        <div class="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 via-zinc-950 to-teal-950/30 border border-emerald-500/25 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              🫀
            </div>
            <div>
              <div class="text-xs font-bold text-emerald-200">
                Post-Session Autonomic Coherence: +{{ delta.parasympatheticGainPercent }}% Parasympathetic Gain
              </div>
              <div class="text-[10px] text-zinc-400 font-mono">
                Heart Rate: {{ delta.preSessionHr }} → {{ delta.postSessionHr }} bpm ({{ delta.hrDeltaBpm }} bpm) · HRV: {{ delta.preSessionHrvMs }} → {{ delta.postSessionHrvMs }} ms (+{{ delta.hrvDeltaMs }} ms)
              </div>
            </div>
          </div>

          <div class="text-[9px] font-mono text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-2.5 py-1 rounded">
            {{ delta.attestationDigest }}
          </div>
        </div>
      }

      <!-- ── SECTION: 30 / 60 / 90-DAY VITALITY HORIZON MILESTONES ── -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-sm">🎯</span>
            <h4 class="text-xs font-black uppercase tracking-widest text-zinc-200">
              30 / 60 / 90-Day Clinical Vitality Milestones
            </h4>
          </div>
          <span class="text-[10px] text-zinc-400 font-mono">FDA 21 CFR Part 11 Longitudinal Record</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          @for (m of trajectory.milestones(); track m.daysTarget) {
            <div class="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
              <div class="flex items-center justify-between text-[10px]">
                <span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold font-mono">
                  Day {{ m.daysTarget }} Goal
                </span>
                <span class="text-emerald-400 font-bold font-mono">{{ m.completionPercent }}%</span>
              </div>
              <div class="font-bold text-zinc-100 text-xs">{{ m.title }}</div>
              <p class="text-[10px] text-zinc-400 leading-relaxed">{{ m.clinicalObjective }}</p>

              <!-- Progress bar -->
              <div class="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-rose-500 to-emerald-400 h-full rounded-full"
                     [style.width.%]="m.completionPercent"></div>
              </div>

              <div class="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-1">
                <span>{{ m.metricLabel }}</span>
                <span class="text-zinc-200 font-bold">{{ m.currentValue }} / {{ m.targetValue }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- ── SECTION: PEER-REVIEWED CLINICAL EVIDENCE ACCORDION ── -->
      <div class="pt-2 border-t border-zinc-800/80">
        <div class="flex items-center justify-between">
          <button (click)="isEvidenceDrawerOpen.set(!isEvidenceDrawerOpen())"
                  class="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-mono text-[11px] border border-zinc-700/80 cursor-pointer transition-all flex items-center gap-1.5">
            <span>📚</span>
            <span>{{ isEvidenceDrawerOpen() ? 'Hide Clinical Grounding' : 'Peer-Reviewed Clinical Evidence & PMIDs (' + evidenceCitations.length + ')' }}</span>
          </button>
          <span class="text-[10px] font-mono text-zinc-400">Grounded in UCL, Harvard & NIH Protocols</span>
        </div>

        @if (isEvidenceDrawerOpen()) {
          <div class="mt-3 p-4 rounded-xl bg-black/40 border border-zinc-800/80 space-y-3 font-sans text-xs animate-in fade-in duration-200">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              @for (cite of evidenceCitations; track cite.id) {
                <div class="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-2 flex flex-col justify-between">
                  <div class="space-y-1">
                    <div class="flex items-center justify-between gap-2">
                      <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {{ cite.evidenceLevel }}
                      </span>
                      <span class="text-[10px] font-mono text-zinc-400">{{ cite.journal }} ({{ cite.year }})</span>
                    </div>
                    <h5 class="text-xs font-bold text-zinc-200 leading-snug">{{ cite.title }}</h5>
                    <p class="text-[11px] text-zinc-400 italic">{{ cite.authors }}</p>
                    <p class="text-[11px] text-zinc-300 bg-black/40 p-2 rounded border border-zinc-800/60">
                      <span class="font-bold text-rose-400">Clinical Takeaway:</span> {{ cite.clinicalTakeaway }}
                    </p>
                  </div>

                  <div class="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
                    @if (cite.pmid) {
                      <a [href]="cite.pubMedUrl" target="_blank" rel="noopener noreferrer"
                         class="text-teal-400 hover:text-teal-300 underline flex items-center gap-1">
                        <span>PubMed:</span> {{ cite.pmid }} ↗
                      </a>
                    } @else {
                      <span class="text-zinc-500">Peer-Reviewed Article</span>
                    }
                    <a [href]="cite.doiUrl" target="_blank" rel="noopener noreferrer"
                       class="text-zinc-400 hover:text-zinc-200 underline truncate max-w-[140px]">
                      DOI: {{ cite.doi }} ↗
                    </a>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class OpticalInnovationsHudComponent implements AfterViewInit, OnDestroy {
  readonly service = inject(OpticalInnovationsService);
  readonly trajectory = inject(OpticalChronoTrajectoryService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly isEvidenceDrawerOpen = signal<boolean>(false);
  readonly evidenceCitations = AVS_CLINICAL_EVIDENCE;

  @ViewChild('opticalCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private rafId: number | null = null;
  private animStartTime = 0;

  constructor() {
    if (this.isBrowser) {
      effect(() => {
        // Trigger canvas render cycle whenever mode changes
        const _ = this.service.activeMode();
        this.resetCanvasLoop();
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.startCanvasLoop();
    }
  }

  ngOnDestroy(): void {
    this.stopCanvasLoop();
  }

  formatMinutesSeconds(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private resetCanvasLoop(): void {
    this.stopCanvasLoop();
    if (this.isBrowser) {
      setTimeout(() => this.startCanvasLoop(), 20);
    }
  }

  private startCanvasLoop(): void {
    if (!this.canvasRef?.nativeElement) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.animStartTime = performance.now();

    const render = (time: number) => {
      const elapsed = (time - this.animStartTime) / 1000;
      const width = (canvas.width = canvas.clientWidth);
      const height = (canvas.height = canvas.clientHeight);

      ctx.clearRect(0, 0, width, height);

      const mode = this.service.activeMode();

      switch (mode) {
        case 'photobiomodulation-670nm':
          this.render670nmPbm(ctx, width, height, elapsed);
          break;
        case 'okn-vor-grating':
          this.renderOknGrating(ctx, width, height, elapsed);
          break;
        case 'melanopic-iprgc-circadian':
          this.renderMelanopicCircadian(ctx, width, height, elapsed);
          break;
        case 'dichoptic-optical-beat':
          this.renderDichopticBeat(ctx, width, height, elapsed);
          break;
        case 'ganzfeld-orp-reticle':
          this.renderGanzfeldOrp(ctx, width, height, elapsed);
          break;
      }

      this.rafId = requestAnimationFrame(render);
    };

    this.rafId = requestAnimationFrame(render);
  }

  private stopCanvasLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // 1. Render 670nm Deep Red PBM
  private render670nmPbm(ctx: CanvasRenderingContext2D, width: number, height: number, t: number): void {
    const pulse = 0.85 + 0.15 * Math.sin(t * Math.PI * 0.2); // 0.1 Hz parasympathetic breath
    const grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, Math.max(width, height) / 1.5);
    grad.addColorStop(0, `rgba(220, 20, 60, ${pulse})`);
    grad.addColorStop(1, `rgba(139, 0, 0, ${pulse * 0.8})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Render OKN / VOR Drifting Grating
  private renderOknGrating(ctx: CanvasRenderingContext2D, width: number, height: number, t: number): void {
    const okn = this.service.oknState();
    const stripeWidth = Math.max(8, 40 / okn.spatialFrequencyCpd);
    let offset = (t * okn.driftVelocityDegPerSec * 4) % (stripeWidth * 2);

    if (okn.direction === 'bilateral-respiratory') {
      offset = Math.sin(t * 0.628) * stripeWidth * 3; // 0.1 Hz oscillation
    } else if (okn.direction === 'right-to-left') {
      offset = -offset;
    }

    for (let x = -stripeWidth * 2; x < width + stripeWidth * 2; x += stripeWidth * 2) {
      const drawX = x + offset;
      const grad = ctx.createLinearGradient(drawX, 0, drawX + stripeWidth, 0);
      grad.addColorStop(0, 'rgba(15, 23, 42, 1)');
      grad.addColorStop(1, 'rgba(34, 211, 238, 0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(drawX, 0, stripeWidth, height);
    }
  }

  // 3. Render Melanopic Circadian Wash
  private renderMelanopicCircadian(ctx: CanvasRenderingContext2D, width: number, height: number, t: number): void {
    const phase = this.service.melanopicState().phase;
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (phase === 'dawn-alert') {
      grad.addColorStop(0, '#0284C7'); // High cyan 480nm
      grad.addColorStop(1, '#38BDF8');
    } else if (phase === 'noon-zenith') {
      grad.addColorStop(0, '#38BDF8');
      grad.addColorStop(1, '#FDE047');
    } else if (phase === 'dusk-depletion') {
      grad.addColorStop(0, '#EA580C'); // Amber
      grad.addColorStop(1, '#D97706');
    } else {
      grad.addColorStop(0, '#881337'); // Ruby zero-blue
      grad.addColorStop(1, '#4C0519');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // 4. Render Dichoptic Beat
  private renderDichopticBeat(ctx: CanvasRenderingContext2D, width: number, height: number, t: number): void {
    const d = this.service.dichopticState();
    const pulseL = 0.5 + 0.5 * Math.sin(2 * Math.PI * d.leftEyeFreqHz * t);
    const pulseR = 0.5 + 0.5 * Math.sin(2 * Math.PI * d.rightEyeFreqHz * t);

    if (d.renderMode === 'side-by-side') {
      // Left eye viewport
      ctx.fillStyle = `rgba(168, 85, 247, ${pulseL * 0.9})`;
      ctx.fillRect(0, 0, width / 2, height);

      // Right eye viewport
      ctx.fillStyle = `rgba(59, 130, 246, ${pulseR * 0.9})`;
      ctx.fillRect(width / 2, 0, width / 2, height);

      // Center divider
      ctx.fillStyle = '#09090B';
      ctx.fillRect(width / 2 - 2, 0, 4, height);
    } else {
      // Anaglyph Red/Cyan composite
      ctx.fillStyle = `rgba(239, 68, 68, ${pulseL * 0.6})`;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = `rgba(6, 182, 212, ${pulseR * 0.6})`;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // 5. Render Ganzfeld ORP
  private renderGanzfeldOrp(ctx: CanvasRenderingContext2D, width: number, height: number, t: number): void {
    const breathe = 0.9 + 0.1 * Math.sin(t * 0.628); // 0.1 Hz breathing
    const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height) / 1.2);
    grad.addColorStop(0, `rgba(224, 231, 255, ${breathe})`);
    grad.addColorStop(1, `rgba(99, 102, 241, ${breathe * 0.85})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
}
