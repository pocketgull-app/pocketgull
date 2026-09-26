import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SleepVagalFlourishingService } from '../services/sleep-vagal-flourishing.service';
import { AvsEngineService, SOLFEGGIO_CATALOG } from '../services/avs-engine.service';
import { CircadianSleepinessService } from '../services/circadian-sleepiness.service';

@Component({
  selector: 'app-sleep-vagal-flourishing-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-zinc-950 rounded-3xl border border-teal-500/30 shadow-2xl font-mono text-xs text-zinc-100 relative overflow-hidden space-y-6">
      <!-- Ambient Bio-Rhythmic Glow -->
      <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

      <!-- Top Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-teal-500/20 relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center text-2xl shadow-lg">
            🫁
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-white tracking-tight">
                Sleep &amp; Vagal Autonomic Flourishing Hub
              </h2>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-700/60 uppercase">
                0.10 Hz Mayer Resonance • SWS Glymphatics
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-0.5">
              Parasympathetic co-regulation, carotid baroreflex Mayer-wave entrainment, slow-wave sleep priming, and screen apnea defense.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="px-3.5 py-2 rounded-xl bg-zinc-900 border border-teal-500/30 text-right">
            <span class="text-[9.5px] uppercase font-bold text-zinc-400 block">Vagal Brake Status</span>
            <span class="font-bold text-xs"
                  [class.text-emerald-400]="vagal.vagalTelemetry().vagalBrakeStatus.startsWith('ENGAGED')"
                  [class.text-amber-400]="vagal.vagalTelemetry().vagalBrakeStatus === 'TRANSITIONAL'"
                  [class.text-rose-400]="vagal.vagalTelemetry().vagalBrakeStatus.startsWith('WITHDRAWN')">
              {{ vagal.vagalTelemetry().vagalBrakeStatus }}
            </span>
          </div>

          <button
            type="button"
            (click)="vagal.togglePacer()"
            class="px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition active:scale-95 shadow-lg flex items-center gap-2 cursor-pointer border"
            [class.bg-rose-600]="vagal.isPacerActive()"
            [class.border-rose-400]="vagal.isPacerActive()"
            [class.text-white]="vagal.isPacerActive()"
            [class.bg-teal-600]="!vagal.isPacerActive()"
            [class.border-teal-400]="!vagal.isPacerActive()"
            [class.text-white]="!vagal.isPacerActive()">
            <span>{{ vagal.isPacerActive() ? '⏹ Stop Pacer' : '▶ Start 0.10 Hz Pacer' }}</span>
          </button>
        </div>
      </div>

      <!-- Main Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-zinc-800 pb-2 text-xs font-sans">
        <button
          type="button"
          (click)="activeTab.set('pacer')"
          [class.text-teal-300]="activeTab() === 'pacer'"
          [class.border-teal-500]="activeTab() === 'pacer'"
          [class.border-transparent]="activeTab() !== 'pacer'"
          [class.text-zinc-400]="activeTab() !== 'pacer'"
          class="pb-2 border-b-2 font-semibold hover:text-white transition flex items-center gap-1.5 cursor-pointer">
          <span>🌊</span> 0.10 Hz Resonance Pacer &amp; HRV
        </button>
        <button
          type="button"
          (click)="activeTab.set('glymphatic')"
          [class.text-teal-300]="activeTab() === 'glymphatic'"
          [class.border-teal-500]="activeTab() === 'glymphatic'"
          [class.border-transparent]="activeTab() !== 'glymphatic'"
          [class.text-zinc-400]="activeTab() !== 'glymphatic'"
          class="pb-2 border-b-2 font-semibold hover:text-white transition flex items-center gap-1.5 cursor-pointer">
          <span>🧠</span> SWS &amp; Glymphatic Clearance Protocol
        </button>
        <button
          type="button"
          (click)="activeTab.set('circadian')"
          [class.text-teal-300]="activeTab() === 'circadian'"
          [class.border-teal-500]="activeTab() === 'circadian'"
          [class.border-transparent]="activeTab() !== 'circadian'"
          [class.text-zinc-400]="activeTab() !== 'circadian'"
          class="pb-2 border-b-2 font-semibold hover:text-white transition flex items-center gap-1.5 cursor-pointer">
          <span>☀️</span> Morning Lux &amp; Melatonin Forecaster
        </button>
        <button
          type="button"
          (click)="activeTab.set('apnea')"
          [class.text-teal-300]="activeTab() === 'apnea'"
          [class.border-teal-500]="activeTab() === 'apnea'"
          [class.border-transparent]="activeTab() !== 'apnea'"
          [class.text-zinc-400]="activeTab() !== 'apnea'"
          class="pb-2 border-b-2 font-semibold hover:text-white transition flex items-center gap-1.5 cursor-pointer">
          <span>🫁</span> Screen Apnea &amp; Diaphragmatic Shield
        </button>
      </div>

      <!-- TAB 1: 0.10 HZ RESONANCE PACER -->
      @if (activeTab() === 'pacer') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <!-- Visual Bio-Pacer Ring -->
          <div class="lg:col-span-1 flex flex-col items-center justify-center p-6 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-4">
            <div class="relative w-48 h-48 flex items-center justify-center">
              <!-- Outer Glow -->
              <div
                class="absolute inset-0 rounded-full transition-all duration-300 pointer-events-none"
                [style.transform]="vagal.currentPhase() === 'inhale' ? 'scale(' + (1 + vagal.phaseProgressPercent() / 250) + ')' : 'scale(' + (1.4 - vagal.phaseProgressPercent() / 350) + ')'"
                [class.bg-teal-500/20]="vagal.currentPhase() === 'inhale'"
                [class.bg-indigo-500/20]="vagal.currentPhase() === 'exhale'"
                [class.bg-zinc-800/20]="vagal.currentPhase() === 'rest'">
              </div>

              <!-- Inner Breathing Sphere -->
              <div
                class="w-32 h-32 rounded-full flex flex-col items-center justify-center text-center border shadow-2xl transition-all duration-300"
                [class.border-teal-400]="vagal.currentPhase() === 'inhale'"
                [class.bg-teal-950/80]="vagal.currentPhase() === 'inhale'"
                [class.border-indigo-400]="vagal.currentPhase() === 'exhale'"
                [class.bg-indigo-950/80]="vagal.currentPhase() === 'exhale'"
                [class.border-zinc-700]="vagal.currentPhase() === 'rest'"
                [class.bg-zinc-900]="vagal.currentPhase() === 'rest'">
                <span class="text-xs uppercase tracking-widest font-black"
                      [class.text-teal-300]="vagal.currentPhase() === 'inhale'"
                      [class.text-indigo-300]="vagal.currentPhase() === 'exhale'"
                      [class.text-zinc-500]="vagal.currentPhase() === 'rest'">
                  {{ vagal.currentPhase() === 'rest' ? 'READY' : (vagal.currentPhase() | uppercase) }}
                </span>
                <span class="text-2xl font-black font-mono mt-1 text-white">
                  {{ vagal.elapsedCycleSeconds() }}s
                </span>
                <span class="text-[9px] text-zinc-400">0.10 Hz (6 bpm)</span>
              </div>
            </div>

            <!-- Cycle Metrics -->
            <div class="flex items-center justify-between w-full text-[11px] pt-2 border-t border-zinc-800/80 text-zinc-400 font-mono">
              <span>Completed Cycles: <strong class="text-white">{{ vagal.completedCycles() }}</strong></span>
              <span>Rate: <strong class="text-teal-300">6.0 bpm</strong></span>
            </div>
          </div>

          <!-- Real-Time Autonomic Telemetry Cards -->
          <div class="lg:col-span-2 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
                <span class="text-zinc-400 text-[10px] uppercase font-bold">Cardiac Coherence</span>
                <div class="text-xl font-bold font-mono text-teal-300">{{ vagal.vagalTelemetry().coherenceScorePercent }}%</div>
                <p class="text-[10px] text-zinc-400">Phase synchrony between Mayer waves and respiratory sinus arrhythmia (RSA).</p>
              </div>

              <div class="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
                <span class="text-zinc-400 text-[10px] uppercase font-bold">HRV RMSSD Estimate</span>
                <div class="text-xl font-bold font-mono text-indigo-300">{{ vagal.vagalTelemetry().rmssdEstimateMs }} ms</div>
                <p class="text-[10px] text-zinc-400">Root-mean-square of successive beat differences (Vagal tone marker).</p>
              </div>

              <div class="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
                <span class="text-zinc-400 text-[10px] uppercase font-bold">Glymphatic Readiness</span>
                <div class="text-sm font-bold font-mono text-emerald-300">{{ vagal.vagalTelemetry().glymphaticClearanceReadiness }}</div>
                <p class="text-[10px] text-zinc-400">Astroglial water channel (AQP4) slow-wave drainage readiness.</p>
              </div>
            </div>

            <div class="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-2">
              <span class="text-teal-300 uppercase text-[10px] font-bold block">Autonomic Mechanism &amp; Clinical Impact:</span>
              <p class="text-zinc-300 text-xs leading-relaxed font-sans">
                {{ vagal.vagalTelemetry().clinicalSummary }}
              </p>
              <div class="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 font-sans">
                <strong>Vagal Nerve Cholinergic Anti-Inflammatory Pathway:</strong> Slow, unhurried 6-breath/minute respiration stimulates the vagus nerve to release acetylcholine at the celiac ganglion, directly suppressing splenic macrophage release of pro-inflammatory TNF-&alpha;, IL-1&beta;, and IL-6.
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: SLOW-WAVE SLEEP & GLYMPHATIC PROTOCOL -->
      @if (activeTab() === 'glymphatic') {
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1">
              <span class="text-zinc-400 text-[10px] uppercase font-bold">Projected SWS Duration</span>
              <div class="text-2xl font-bold font-mono text-indigo-300">{{ vagal.sleepGlymphaticWindow().projectedSlowWaveMinutes }} min</div>
              <p class="text-[10px] text-zinc-400">Non-REM Stage 3 slow-wave sleep duration for neuro-cellular repair.</p>
            </div>

            <div class="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1">
              <span class="text-zinc-400 text-[10px] uppercase font-bold">Glymphatic Efficiency</span>
              <div class="text-2xl font-bold font-mono text-teal-300">{{ vagal.sleepGlymphaticWindow().glymphaticDrainageEfficiency }}%</div>
              <p class="text-[10px] text-zinc-400">Projected interstitial space expansion and &beta;-amyloid clearance.</p>
            </div>

            <div class="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1">
              <span class="text-zinc-400 text-[10px] uppercase font-bold">Optimal Wind-Down Window</span>
              <div class="text-2xl font-bold font-mono text-amber-300">{{ vagal.sleepGlymphaticWindow().optimalWindDownTime }}</div>
              <p class="text-[10px] text-zinc-400">Target timing to align cortisol nadir with pineal melatonin secretion.</p>
            </div>
          </div>

          <div class="p-5 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-3 font-sans">
            <h4 class="text-sm font-bold text-white flex items-center gap-2">
              <span>🌊</span> Evidence-Grounded Slow-Wave Priming Protocols:
            </h4>
            <ul class="space-y-2 text-xs text-zinc-300">
              @for (rec of vagal.sleepGlymphaticWindow().recommendations; track rec) {
                <li class="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span class="text-teal-400 font-bold">✓</span>
                  <span>{{ rec }}</span>
                </li>
              }
            </ul>
          </div>
        </div>
      }

      <!-- TAB 3: CIRCADIAN LUX & MELATONIN FORECASTER -->
      @if (activeTab() === 'circadian') {
        <div class="p-5 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-5 font-sans">
          <div class="border-b border-zinc-800 pb-3">
            <h4 class="text-sm font-bold text-white">Circadian Zeitgeber &amp; Daylight Exposure Matrix</h4>
            <p class="text-xs text-zinc-400">Morning retinal photon absorption entrains the SCN (Suprachiasmatic Nucleus) to initiate the 14-16 hour countdown to endogenous melatonin release.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
              <span class="text-zinc-400 block text-[10px]">Morning Outdoor Sunlight (Minutes)</span>
              <input
                type="number"
                min="0"
                max="120"
                [ngModel]="vagal.morningSunlightMinutes()"
                (ngModelChange)="vagal.morningSunlightMinutes.set($event)"
                class="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold" />
              <span class="text-[10px] text-zinc-500">Target &ge; 15-20 min before 09:00</span>
            </div>

            <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
              <span class="text-zinc-400 block text-[10px]">Caffeine Cutoff Hour (24h clock)</span>
              <input
                type="number"
                min="8"
                max="22"
                [ngModel]="vagal.caffeineCutoffHour()"
                (ngModelChange)="vagal.caffeineCutoffHour.set($event)"
                class="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white font-bold" />
              <span class="text-[10px] text-zinc-500">Protects adenosine sleep pressure</span>
            </div>

            <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col justify-between">
              <span class="text-zinc-400 block text-[10px]">Evening Warm Screen Shield</span>
              <button
                type="button"
                (click)="vagal.eveningBlueLightReduced.set(!vagal.eveningBlueLightReduced())"
                class="w-full py-1.5 rounded font-bold uppercase tracking-wider text-xs border transition"
                [class.bg-amber-950]="vagal.eveningBlueLightReduced()"
                [class.text-amber-300]="vagal.eveningBlueLightReduced()"
                [class.border-amber-700]="vagal.eveningBlueLightReduced()"
                [class.bg-zinc-900]="!vagal.eveningBlueLightReduced()"
                [class.text-zinc-400]="!vagal.eveningBlueLightReduced()"
                [class.border-zinc-800]="!vagal.eveningBlueLightReduced()">
                {{ vagal.eveningBlueLightReduced() ? 'Active (Warm Amber)' : 'Inactive (Unfiltered)' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- TAB 4: SCREEN APNEA & DIAPHRAGMATIC SHIELD -->
      @if (activeTab() === 'apnea') {
        <div class="p-5 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-4 font-sans">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h4 class="text-sm font-bold text-white">Screen Apnea Diaphragmatic Awareness</h4>
              <p class="text-xs text-zinc-400">Research by Linda Stone demonstrates over 80% of individuals unconsciously hold or constrict their breathing while typing or answering emails, spiking cortisol.</p>
            </div>
            <button
              type="button"
              (click)="vagal.triggerScreenApneaRelease()"
              class="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer">
              <span>💨</span>
              <span>Take Deep Diaphragmatic Exhale</span>
            </button>
          </div>

          <div class="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
            <span class="text-zinc-300">Conscious Exhale Cycles Logged Today:</span>
            <span class="font-mono font-bold text-teal-400 text-base">{{ vagal.apneaDetectedCounter() }}</span>
          </div>

          <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-400 leading-relaxed">
            <strong class="text-zinc-200">The 3-Second Check-In:</strong> Whenever switching browser tabs or opening a difficult email, gently place one hand on your lower belly. Ensure your abdomen expands softly rather than tensing into your shoulders.
          </div>
        </div>
      }
    </div>
  `
})
export class SleepVagalFlourishingHubComponent {
  public vagal = inject(SleepVagalFlourishingService);
  public avs = inject(AvsEngineService);
  public circadian = inject(CircadianSleepinessService);

  readonly activeTab = signal<'pacer' | 'glymphatic' | 'circadian' | 'apnea'>('pacer');
}
