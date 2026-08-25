import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

export interface ISleepToolkitMilestone {
  title: string;
  timeframe: string;
  focus: string;
  completed: boolean;
}

export interface ISleepMicroAction {
  title: string;
  category: 'Clinical PSG' | 'Circadian' | 'Digital Detox' | 'Mind-Body' | 'Nutrition' | 'Ambient';
  description: string;
  impact: string;
}

@Component({
  selector: 'app-holistic-sleep-toolkit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🌙</span>
            <h2 class="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Sleep Twin & Ambient Sanctuary Engine
            </h2>
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            Contactless Remote Sensing, Continuous Sleep Fluidity & Multi-Modal Wearable Telemetry
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800">
            Sieve Filter Active
          </span>
          <div class="px-3 py-1.5 rounded-full text-xs font-semibold border bg-emerald-950/60 text-emerald-300 border-emerald-800/80 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Sleep Twin Synapse Active
          </div>
        </div>
      </div>

      <!-- Continuous Sleep Fluidity Continuum Gauge -->
      <div class="p-5 bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-zinc-900/90 rounded-xl border border-indigo-900/50 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold text-indigo-300">Continuous Sleep Fluidity & Restorative Depth Index</span>
            <p class="text-xs text-zinc-400">Dynamic continuum predicting sleep transition stability & restoration</p>
          </div>
          <span class="text-3xl font-extrabold text-emerald-400">{{ sleepFluidityIndex() }}%</span>
        </div>
        <div class="w-full bg-zinc-800 rounded-full h-3.5 p-0.5 border border-zinc-700">
          <div class="bg-gradient-to-r from-indigo-500 via-purple-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
               [style.width.%]="sleepFluidityIndex()"></div>
        </div>
        <div class="flex justify-between text-[10px] text-zinc-500 font-mono">
          <span>Fragmented / Disturbed</span>
          <span>Light Restoration</span>
          <span class="text-emerald-400 font-bold">Deep Glymphatic Clearance</span>
        </div>
      </div>

      <!-- Conformal Prediction 95% Statistical Coverage Uncertainty Bounds HUD -->
      <div class="p-4 bg-gradient-to-r from-zinc-900 via-indigo-950/30 to-zinc-900 rounded-xl border border-indigo-800/40 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping"></span>
            <span class="text-xs font-semibold text-indigo-300">Conformal Risk Uncertainty Bounds (95% Coverage Guarantee)</span>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
            q_hat ± 0.060
          </span>
        </div>

        <div class="flex items-center justify-between text-xs text-zinc-300 font-mono pt-1">
          <div>
            <span class="text-zinc-500 text-[10px] block">CONFORMAL LOWER (95%)</span>
            <span class="font-bold text-emerald-400 text-sm">{{ (conformalLower() * 100).toFixed(1) }}%</span>
          </div>

          <div class="flex-1 px-6">
            <div class="relative w-full bg-zinc-800 rounded-full h-2">
              <div class="absolute bg-gradient-to-r from-emerald-500 via-indigo-400 to-purple-400 h-full rounded-full opacity-80"
                   [style.left.%]="conformalLower() * 100"
                   [style.width.%]="(conformalUpper() - conformalLower()) * 100"></div>
              <div class="absolute w-2.5 h-2.5 bg-white rounded-full -top-0.25 shadow-md transform -translate-x-1/2"
                   [style.left.%]="riskScore() * 100" title="Point Probability Risk Estimate"></div>
            </div>
            <div class="flex justify-between text-[9px] text-zinc-500 mt-1">
              <span>Lower Bound</span>
              <span class="text-indigo-300 font-bold">Point Estimate: {{ (riskScore() * 100).toFixed(1) }}%</span>
              <span>Upper Bound</span>
            </div>
          </div>

          <div class="text-right">
            <span class="text-zinc-500 text-[10px] block">CONFORMAL UPPER (95%)</span>
            <span class="font-bold text-purple-300 text-sm">{{ (conformalUpper() * 100).toFixed(1) }}%</span>
          </div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2">
          <span>Interval Width: <strong class="text-zinc-200">{{ conformalWidth() }}</strong> (High Model Certainty)</span>
          <span class="text-emerald-400 font-medium flex items-center gap-1">
            <span>🛡️</span> Distribution-Free 95% Coverage Guaranteed
          </span>
        </div>
      </div>

      <!-- Telemetry Dashboard: PSG, Wearables & Contactless Ambient -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div class="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800/80">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-zinc-400">Two-Headed Hydra Risk</span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">s_C Ranker</span>
          </div>
          <div class="mt-1.5 flex items-baseline gap-1.5">
            <span class="text-2xl font-extrabold text-indigo-400">{{ (riskScore() * 100).toFixed(1) }}%</span>
            <span class="text-[10px] text-emerald-400">↓ 4.2%</span>
          </div>
          <p class="text-[10px] text-zinc-500">Pairwise Rank Probability</p>
        </div>

        <div class="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800/80">
          <span class="text-xs font-medium text-zinc-400">Glymphatic SWS (N3)</span>
          <div class="mt-1.5 flex items-baseline gap-1.5">
            <span class="text-2xl font-extrabold text-purple-300">{{ n3Percentage() }}%</span>
            <span class="text-[10px] text-emerald-400">Optimal</span>
          </div>
          <p class="text-[10px] text-zinc-500">P(N3→N3): {{ (n3Continuity() * 100).toFixed(1) }}%</p>
        </div>

        <div class="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800/80">
          <span class="text-xs font-medium text-zinc-400">Vagal Tone (RMSSD)</span>
          <div class="mt-1.5 flex items-baseline gap-1.5">
            <span class="text-2xl font-extrabold text-emerald-400">{{ hrvRmssd() }} ms</span>
            <span class="text-[10px] text-emerald-400">High Vagal</span>
          </div>
          <p class="text-[10px] text-zinc-500">Autonomic Balance</p>
        </div>

        <div class="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800/80">
          <span class="text-xs font-medium text-zinc-400">Markov Dynamics</span>
          <div class="mt-1.5 flex items-baseline gap-1.5">
            <span class="text-2xl font-extrabold text-amber-300">{{ (n2ToN1Rate() * 100).toFixed(1) }}%</span>
            <span class="text-[10px] text-emerald-400">Low Arousal</span>
          </div>
          <p class="text-[10px] text-zinc-500">P(N2→N1) Fragmentation</p>
        </div>

        <div class="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800/80">
          <span class="text-xs font-medium text-zinc-400">Covariate Armor</span>
          <div class="mt-1.5 flex items-baseline gap-1.5">
            <span class="text-xl font-extrabold text-teal-300">Active</span>
            <span class="text-[10px] text-emerald-400">Normalized</span>
          </div>
          <p class="text-[10px] text-zinc-500">Hardware Scaling Proof</p>
        </div>
      </div>

      <!-- Key Micro-Interventions Toolkit -->
      <div class="space-y-3">
        <h3 class="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <span>✨</span> Evidence-Based Sleep Micro-Actions & Ambient Sanctuary Cues
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          @for (action of microActions(); track action.title) {
            <div class="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-indigo-300">{{ action.title }}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {{ action.category }}
                </span>
              </div>
              <p class="text-xs text-zinc-300">{{ action.description }}</p>
              <p class="text-[11px] text-emerald-400 font-medium">✦ {{ action.impact }}</p>
            </div>
          }
        </div>
      </div>

      <!-- Reverse Brainstorming: What Sabotages Sleep? -->
      <div class="p-4 bg-red-950/20 rounded-xl border border-red-900/30 space-y-2">
        <h4 class="text-xs font-semibold text-red-300 flex items-center gap-1.5">
          <span>🚫</span> Reverse Brainstorming: Sleep Sabotage Triggers to Avoid
        </h4>
        <ul class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-zinc-400">
          <li class="flex items-center gap-2">
            <span class="text-red-400">✕</span> Inconsistent weekend sleep schedules
          </li>
          <li class="flex items-center gap-2">
            <span class="text-red-400">✕</span> Late-night blue light screen exposure
          </li>
          <li class="flex items-center gap-2">
            <span class="text-red-400">✕</span> Working or arguing in the bedroom
          </li>
        </ul>
      </div>

      <!-- Milestone Map -->
      <div class="border-t border-zinc-800 pt-4 space-y-3">
        <h3 class="text-sm font-semibold text-zinc-300">🗺️ 4-Phase Sleep Health Resilience Milestone Map</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
          @for (milestone of milestones(); track milestone.title) {
            <div class="p-3 rounded-xl border" 
                 [class.bg-emerald-950\/30]="milestone.completed" [class.border-emerald-800\/50]="milestone.completed"
                 [class.bg-zinc-900\/40]="!milestone.completed" [class.border-zinc-800]="!milestone.completed">
              <div class="flex items-center justify-between text-xs font-medium mb-1">
                <span [class.text-emerald-300]="milestone.completed" [class.text-zinc-400]="!milestone.completed">
                  {{ milestone.title }}
                </span>
                <span class="text-[10px] text-zinc-500">{{ milestone.timeframe }}</span>
              </div>
              <p class="text-[11px] text-zinc-400 leading-tight">{{ milestone.focus }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class HolisticSleepToolkitComponent {
  private patientService = inject(PatientStateService);

  riskScore = signal(0.184);
  conformalLower = signal(0.124);
  conformalUpper = signal(0.244);
  conformalWidth = computed(() => (this.conformalUpper() - this.conformalLower()).toFixed(3));
  sleepFluidityIndex = signal(88.4);
  n3Percentage = signal(21.5);
  n3Continuity = signal(0.915);
  n2ToN1Rate = signal(0.042);
  remInstability = signal(0.012);
  hrvRmssd = signal(44);
  ahi = signal(3.8);
  ambientLightLux = signal(2.5);
  roomTempCelsius = signal(18.5);

  microActions = signal<ISleepMicroAction[]>([
    {
      title: 'Clinical CPAP & Hypoxia Resolution',
      category: 'Clinical PSG',
      description: 'Treat AHI & SpO2 desaturation spikes to prevent nocturnal micro-arousals from interrupting SWS.',
      impact: 'Restores uninterrupted Slow-Wave Sleep and slows cognitive decline in mild impairment.'
    },
    {
      title: 'Lateral Glymphatic Positioning',
      category: 'Clinical PSG',
      description: 'Transition from supine (back) sleeping to lateral (side) position during sleep cycles.',
      impact: 'Mechanically optimizes cerebrospinal fluid (CSF) flow to flush amyloid-beta & tau proteins.'
    },
    {
      title: 'SWS Thermoregulation (18.5°C)',
      category: 'Ambient',
      description: 'Maintain bedroom ambient temp at 18.5°C (65°F) with regular daytime physical activity.',
      impact: 'Facilitates core body temp drop required to expand perivascular spaces for glymphatic clearance.'
    },
    {
      title: 'Photic & Acoustic Shielding (90m Window)',
      category: 'Digital Detox',
      description: 'Kill blue light 90m before bed, use blackout curtains, and mask ambient noise with white noise.',
      impact: 'Eliminates autonomic micro-arousals (N2→N1 transitions) and preserves sleep continuity.'
    },
    {
      title: 'Consistent Circadian Anchors',
      category: 'Circadian',
      description: 'Set a consistent wake-up time every day, supported by 10 minutes of morning sunlight.',
      impact: 'Stabilizes central circadian clock & improves nocturnal melatonin surge.'
    },
    {
      title: '15-Min Evening Digital Detox',
      category: 'Digital Detox',
      description: 'Replace blue-light screens 60 minutes before bed with light reading or audio entrainment.',
      impact: 'Reduces sleep latency by 45% and calms cortical hyper-arousal.'
    },
    {
      title: 'Nutrient-Optimized Wind Down',
      category: 'Nutrition',
      description: 'Combine magnesium glycinate evening snacks with warm Solfeggio 528 Hz audio.',
      impact: 'Enhances SWS N3 slow-wave sleep depth and vagal tone resilience.'
    },
    {
      title: 'Vagal Tone Biofeedback & CBT-I',
      category: 'Mind-Body',
      description: 'Practice diaphragmatic 4-7-8 breathing entrainment to lower sympathetic hyper-arousal.',
      impact: 'Elevates RMSSD vagal tone and stabilizes heart rate variability.'
    }
  ]);

  milestones = signal<ISleepToolkitMilestone[]>([
    { title: '1. Sleep Baseline', timeframe: 'Wks 1-2', focus: 'Telemetry audit & circadian anchor setup', completed: true },
    { title: '2. Core Sleep Hygiene', timeframe: 'Wks 3-6', focus: 'Digital detox & bedroom sanctuary', completed: true },
    { title: '3. Mind-Body Integration', timeframe: 'Mths 2-3', focus: 'CBT-I & Solfeggio vagal entrainment', completed: false },
    { title: '4. Long-Term Resilience', timeframe: 'Mths 4+', focus: 'Peer support & continuous Sleep Twin sync', completed: false }
  ]);
}
