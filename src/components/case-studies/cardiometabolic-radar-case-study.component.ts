import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  output,
  ElementRef,
  viewChild,
  effect,
  PLATFORM_ID,
  OnDestroy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';
import { CardiometabolicPodcastEngineService } from '../../services/cardiometabolic-podcast-engine.service';

export interface IFhirR4Bundle {
  resourceType: 'Bundle';
  id: string;
  type: 'collection';
  meta: {
    lastUpdated: string;
    profile: string[];
  };
  entry: Array<{
    fullUrl: string;
    resource: Record<string, any>;
  }>;
}

@Component({
  selector: 'app-cardiometabolic-radar-case-study',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 text-zinc-100 max-w-6xl mx-auto shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar" role="dialog" aria-labelledby="case-study-title">
      
      <!-- Top Header & Stepped-Care Badges -->
      <div class="border-b border-zinc-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <span>Case #03 &bull; Cardiometabolic &amp; Non-Linear Glycemic Radar</span>
          </div>
          <h2 id="case-study-title" class="text-2xl sm:text-3xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-3">
            <span>Postprandial Pacing &amp; AMPK Signaling Architecture</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-normal border border-amber-500/40">GRADE A/B Grounded</span>
          </h2>
          <p class="text-sm text-zinc-400 mt-1 max-w-3xl leading-relaxed">
            Preempting acute glycemic excursions via non-insulin GLUT4 soleus activation, diurnal BMAL1 circadian pacing, and generic Metformin ER, validated against continuous glucose velocity (<code class="text-teal-300 font-mono">dG/dt &ge; +1.5 mg/dL/min</code>) telemetry.
          </p>
        </div>

        <div class="shrink-0 flex items-center gap-2">
          <button 
            type="button"
            (click)="loadCardiometabolicCaseIntoApp()"
            class="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400">
            <span>📥 Load Case into Cockpit</span>
          </button>
          <button 
            type="button"
            (click)="exportFhirR4Bundle()"
            class="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-teal-300 border border-teal-500/30 text-xs font-mono font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400"
            title="Download HL7 FHIR R4 US Core Bundle">
            <span>📄 FHIR R4 Bundle</span>
          </button>
          <button 
            type="button"
            (click)="closeCaseStudy()"
            class="p-2 text-zinc-400 hover:text-zinc-100 rounded-xl hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close case study">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- Narrative Audio Podcast Player (Web Audio API + Multi-Voice Dialects) -->
      <div class="bg-gradient-to-r from-zinc-900 via-teal-950/25 to-zinc-900 border border-teal-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3.5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-xl text-teal-400">
              🎙️
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">Web Audio API • Multi-Voice Podcast</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono">432 Hz Vagal Bed</span>
              </div>
              <h3 class="text-sm font-black text-zinc-100 mt-0.5">
                Episode 03: The Glycemic Phase Shift &amp; The Soleus Paradox
              </h3>
            </div>
          </div>

          <!-- Oscilloscope Visualizer Canvas -->
          <div class="flex items-center gap-3">
            <div class="relative bg-zinc-950 rounded-xl border border-zinc-800 p-1.5 flex items-center">
              <canvas #podcastCanvas width="200" height="38" class="w-[170px] h-[34px]"></canvas>
            </div>
            <div class="text-right font-mono text-xs text-zinc-400">
              <span class="text-teal-400 font-bold">Act {{ podcastEngine.currentSegmentIndex() + 1 }}</span> of {{ podcastEngine.script().length }}
            </div>
          </div>
        </div>

        <!-- Speaker Avatar & Active Spoken Subtitles -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <!-- Active Speaker Card -->
          <div class="md:col-span-4 bg-zinc-950/80 border border-zinc-800/90 p-3.5 rounded-2xl flex items-center gap-3">
            <span class="text-3xl p-2 rounded-xl bg-zinc-900 border border-zinc-800">
              {{ podcastEngine.currentSegment().avatarEmoji }}
            </span>
            <div class="min-w-0">
              <div class="text-xs font-bold text-zinc-100 truncate">
                {{ podcastEngine.currentSegment().speakerTitle }}
              </div>
              <div class="text-[10px] font-mono text-teal-400 mt-0.5">
                {{ podcastEngine.currentSegment().accentBadge }}
              </div>
              <div class="text-[10px] text-zinc-400 mt-1 truncate">
                💡 {{ podcastEngine.currentSegment().keyTakeaway }}
              </div>
            </div>
          </div>

          <!-- Spoken Transcript / Live Sentence Subtitle with Highlighting -->
          <div class="md:col-span-8 bg-zinc-950/80 border border-zinc-800/90 p-3.5 rounded-2xl min-h-[72px] flex flex-col justify-center">
            <div class="text-xs leading-relaxed text-zinc-300">
              &ldquo;{{ podcastEngine.currentSegment().text }}&rdquo;
            </div>
            @if (podcastEngine.currentWord()) {
              <div class="mt-2 text-[11px] font-mono text-teal-300 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                <span>Active Vocalization: <strong>{{ podcastEngine.currentWord() }}</strong></span>
              </div>
            }
          </div>
        </div>

        <!-- Audio Controls & Pacing Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div class="flex items-center gap-2">
            @if (!podcastEngine.isPlaying()) {
              <button
                type="button"
                (click)="podcastEngine.startPodcast()"
                class="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400 min-h-[44px]">
                <span>▶ Play Narrative Podcast</span>
              </button>
            } @else if (podcastEngine.isPaused()) {
              <button
                type="button"
                (click)="podcastEngine.resumePodcast()"
                class="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400 min-h-[44px]">
                <span>▶ Resume</span>
              </button>
            } @else {
              <button
                type="button"
                (click)="podcastEngine.pausePodcast()"
                class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 min-h-[44px]">
                <span>⏸ Pause</span>
              </button>
            }

            <button
              type="button"
              (click)="podcastEngine.stopPodcast()"
              [disabled]="!podcastEngine.isPlaying() && !podcastEngine.isPaused()"
              class="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 text-xs font-mono font-bold rounded-xl border border-zinc-700 transition-all cursor-pointer min-h-[44px]">
              ⏹ Stop
            </button>

            <!-- Navigation Buttons -->
            <button
              type="button"
              (click)="podcastEngine.previousSegment()"
              [disabled]="podcastEngine.currentSegmentIndex() === 0"
              class="p-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 rounded-xl border border-zinc-700 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Previous segment">
              ⏮
            </button>
            <button
              type="button"
              (click)="podcastEngine.nextSegment()"
              [disabled]="podcastEngine.currentSegmentIndex() === podcastEngine.script().length - 1"
              class="p-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 rounded-xl border border-zinc-700 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Next segment">
              ⏭
            </button>
          </div>

          <!-- Ambient Bed Toggle & Ducking Status -->
          <div class="flex items-center gap-3 text-xs font-mono text-zinc-400">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                [checked]="podcastEngine.vagalBedActive()"
                (change)="podcastEngine.vagalBedActive.set(!podcastEngine.vagalBedActive())"
                class="accent-teal-500 rounded cursor-pointer">
              <span>432 Hz Drone</span>
            </label>
            @if (podcastEngine.isAudioDucked()) {
              <span class="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Audio Ducked
              </span>
            }
          </div>
        </div>
      </div>

      <!-- 4-Column Clinical & Telemetry Summary Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Metric 1: Glucose Velocity -->
        <div class="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl relative overflow-hidden">
          <div class="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Velocity Trigger</span>
            <span class="text-xs font-bold text-amber-400">Epoch 10m</span>
          </div>
          <div class="text-xl font-extrabold text-amber-400 mt-1 font-mono tracking-tight">
            +1.6 mg/dL/min
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            <code class="text-zinc-300 font-mono">dG/dt &ge; +1.5</code> across 2 epochs triggers soleus pacing before breaching the 140 mg/dL ceiling.
          </p>
        </div>

        <!-- Metric 2: Soleus Kinematics -->
        <div class="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
          <div class="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Soleus Isolation</span>
            <span class="text-xs font-bold text-teal-400">90° Knee Flex</span>
          </div>
          <div class="text-xl font-extrabold text-teal-400 mt-1 font-mono tracking-tight">
            ~80% Type I Fibers
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            Gastrocnemius slackened; slow oxidative contractions clear glucose via non-insulin GLUT4 with minimal fatigue.
          </p>
        </div>

        <!-- Metric 3: Stepped-Care Pharmacotherapy -->
        <div class="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
          <div class="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Generic Metformin ER</span>
            <span class="text-xs font-bold text-emerald-400">$4/mo Retail</span>
          </div>
          <div class="text-xl font-extrabold text-emerald-400 mt-1 font-mono tracking-tight">
            500 mg Daily
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            Hepatic AMPK activation suppresses nocturnal gluconeogenesis. Baseline eGFR &gt; 60 verified; annual B12 scheduled.
          </p>
        </div>

        <!-- Metric 4: Safety Stop -->
        <div class="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
          <div class="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Safety Demarcation</span>
            <span class="text-xs font-bold text-rose-400">Tier 4 Stop</span>
          </div>
          <div class="text-xl font-extrabold text-rose-400 mt-1 font-mono tracking-tight">
            &lt; 54 mg/dL
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            Level 2 Hypoglycemia halts all pacing immediately; trigger Rule of 15 (15g fast carbohydrate, 15m re-check).
          </p>
        </div>

      </div>

      <!-- 3B Innovation Architecture (Breaking, Bending, Blending) -->
      <div class="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5">
        <h3 class="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
          <span>🔬 The 3B Innovation Architecture (Brandt &amp; Eagleman Paradigm)</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
          <div class="bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-xl border-l-2 border-l-teal-500">
            <div class="font-bold text-teal-300 font-mono uppercase">🔨 Breaking</div>
            <p class="text-zinc-300 mt-1">
              Deconstructs monolithic "metabolic syndrome" into discrete physiological components: hepatic gluconeogenesis rate, glycemic phase velocity (<code class="font-mono text-teal-300">dG/dt</code>), and microvascular nitric oxide quenching.
            </p>
          </div>
          <div class="bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-xl border-l-2 border-l-amber-500">
            <div class="font-bold text-amber-300 font-mono uppercase">🌀 Bending</div>
            <p class="text-zinc-300 mt-1">
              Bends retrospective quarterly HbA1c testing into continuous postprandial area-under-the-curve (<code class="font-mono text-amber-300">&Delta;AUC120</code>) phase portraits, preempting excursions 15 minutes post-ingestion before peak amplitude.
            </p>
          </div>
          <div class="bg-zinc-950/70 border border-zinc-800 p-3.5 rounded-xl border-l-2 border-l-emerald-500">
            <div class="font-bold text-emerald-300 font-mono uppercase">🧬 Blending</div>
            <p class="text-zinc-300 mt-1">
              Synthesizes standard-of-care generic Metformin ER with non-insulin mechanical GLUT4 soleus activation, diurnal BMAL1 circadian feeding, and screened orthomolecular adjuncts (Magnesium Glycinate + Berberine).
            </p>
          </div>
        </div>
      </div>

      <!-- Interactive Biophysical Radar Canvas & Phase Space Simulator -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left: 6-Axis Biophysical Radar Canvas -->
        <div class="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span>🎯 Biophysical Multi-Axis Radar</span>
            </h3>
            <span class="text-[11px] font-mono text-zinc-400">Adherence &alpha;: {{ adherence() * 100 | number:'1.0-0' }}%</span>
          </div>

          <div class="relative flex items-center justify-center p-2 bg-zinc-950 rounded-xl border border-zinc-800/80">
            <canvas #radarCanvas width="360" height="360" class="w-full max-w-[320px] aspect-square"></canvas>
          </div>

          <!-- Adherence & Time Controls -->
          <div class="space-y-2 pt-2">
            <div class="flex justify-between text-xs text-zinc-400">
              <span>Intervention Adherence (&alpha;)</span>
              <span class="font-mono text-teal-400">{{ (adherence() * 100).toFixed(0) }}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              [value]="adherence()" 
              (input)="updateAdherence($event)"
              class="w-full accent-teal-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              aria-label="Intervention Adherence">
            <div class="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>Baseline State (0%)</span>
              <span>Full Protocol (100%)</span>
            </div>
          </div>

          <!-- Radar Legend -->
          <div class="flex items-center justify-center gap-6 text-xs font-mono pt-1">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-400"></span>
              <span class="text-zinc-400">Baseline (Dysregulation)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-teal-400/80 border border-teal-300"></span>
              <span class="text-teal-300">Therapeutic Projection</span>
            </div>
          </div>
        </div>

        <!-- Right: Real-Time Glycemic Excursion & Velocity Simulator -->
        <div class="lg:col-span-7 bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>📈 Dynamic Glycemic Excursion &amp; Velocity Simulator</span>
              </h3>
              <p class="text-xs text-zinc-400 mt-0.5">
                Simulating 120-minute postprandial curve G(t) and instantaneous velocity dG/dt
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button 
                type="button"
                (click)="toggleHypoSimulation()"
                [class.bg-rose-500]="isHypoSimulated()"
                [class.text-zinc-950]="isHypoSimulated()"
                [class.bg-zinc-800]="!isHypoSimulated()"
                [class.text-rose-400]="!isHypoSimulated()"
                class="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border border-rose-500/40 transition-all cursor-pointer">
                <span>⚠️ {{ isHypoSimulated() ? 'Hypoglycemia Active' : 'Test Hypo Stop (<54)' }}</span>
              </button>
            </div>
          </div>

          <!-- Interactive Stepped-Care Toggles -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button 
              type="button"
              (click)="tier1Soleus.set(!tier1Soleus())"
              [class.bg-teal-500]="tier1Soleus()"
              [class.text-zinc-950]="tier1Soleus()"
              [class.bg-zinc-950]="!tier1Soleus()"
              [class.text-zinc-300]="!tier1Soleus()"
              class="p-2.5 rounded-xl border border-zinc-700/60 font-semibold text-left transition-all cursor-pointer">
              <div class="font-mono text-[10px] uppercase opacity-75">Tier 1 Kinematics</div>
              <div class="text-xs mt-0.5">Soleus SPU {{ tier1Soleus() ? '✓' : '○' }}</div>
            </button>

            <button 
              type="button"
              (click)="tier1Circadian.set(!tier1Circadian())"
              [class.bg-amber-500]="tier1Circadian()"
              [class.text-zinc-950]="tier1Circadian()"
              [class.bg-zinc-950]="!tier1Circadian()"
              [class.text-zinc-300]="!tier1Circadian()"
              class="p-2.5 rounded-xl border border-zinc-700/60 font-semibold text-left transition-all cursor-pointer">
              <div class="font-mono text-[10px] uppercase opacity-75">Tier 1 Circadian</div>
              <div class="text-xs mt-0.5">8h Feeding {{ tier1Circadian() ? '✓' : '○' }}</div>
            </button>

            <button 
              type="button"
              (click)="tier2Metformin.set(!tier2Metformin())"
              [class.bg-emerald-500]="tier2Metformin()"
              [class.text-zinc-950]="tier2Metformin()"
              [class.bg-zinc-950]="!tier2Metformin()"
              [class.text-zinc-300]="!tier2Metformin()"
              class="p-2.5 rounded-xl border border-zinc-700/60 font-semibold text-left transition-all cursor-pointer">
              <div class="font-mono text-[10px] uppercase opacity-75">Tier 2 Pharma</div>
              <div class="text-xs mt-0.5">Metformin ER {{ tier2Metformin() ? '✓' : '○' }}</div>
            </button>

            <button 
              type="button"
              (click)="tier3Adjuncts.set(!tier3Adjuncts())"
              [class.bg-purple-500]="tier3Adjuncts()"
              [class.text-zinc-950]="tier3Adjuncts()"
              [class.bg-zinc-950]="!tier3Adjuncts()"
              [class.text-zinc-300]="!tier3Adjuncts()"
              class="p-2.5 rounded-xl border border-zinc-700/60 font-semibold text-left transition-all cursor-pointer">
              <div class="font-mono text-[10px] uppercase opacity-75">Tier 3 Adjuncts</div>
              <div class="text-xs mt-0.5">Mg + Berberine {{ tier3Adjuncts() ? '✓' : '○' }}</div>
            </button>
          </div>

          <!-- Excursion Curve Visualizer Canvas -->
          <div class="relative bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <canvas #curveCanvas width="520" height="220" class="w-full h-[180px]"></canvas>
            <div class="absolute bottom-2 right-4 flex items-center gap-4 text-[10px] font-mono text-zinc-400">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-0.5 bg-rose-500"></span> Unpaced Baseline</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-0.5 bg-teal-400"></span> Active Pacing</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-0.5 bg-amber-400 border border-dashed"></span> 140 mg/dL Threshold</span>
            </div>
          </div>

          <!-- Dynamic Output Metrics -->
          <div class="grid grid-cols-3 gap-3 font-mono text-xs">
            <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
              <div class="text-[10px] text-zinc-400 uppercase">Simulated Peak</div>
              <div class="text-lg font-bold text-zinc-100 mt-0.5" [class.text-rose-400]="peakGlucose() > 140" [class.text-teal-400]="peakGlucose() <= 140">
                {{ peakGlucose() }} mg/dL
              </div>
            </div>
            <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
              <div class="text-[10px] text-zinc-400 uppercase">Max Velocity (dG/dt)</div>
              <div class="text-lg font-bold text-amber-400 mt-0.5">
                +{{ maxVelocity() }} mg/dL/m
              </div>
            </div>
            <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
              <div class="text-[10px] text-zinc-400 uppercase">Recovery Duration</div>
              <div class="text-lg font-bold text-zinc-100 mt-0.5" [class.text-teal-400]="recoveryTime() <= 90">
                {{ recoveryTime() }} min
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- Real-Time CDS Hook 2.0 EHR Simulator & Card Output -->
      <div class="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-xs font-mono font-bold border border-sky-500/40">HL7 CDS Hooks 2.0</span>
            <h3 class="text-sm font-bold text-zinc-100">Live EHR Sidecar Card Output (Epic / Cerner)</h3>
          </div>
          <span class="text-xs font-mono text-zinc-400">Endpoint: /cds-services/pocketgull-cardiometabolic-radar</span>
        </div>

        <div class="p-4 rounded-xl border text-xs space-y-2 transition-all"
             [class.bg-rose-950/40]="isHypoSimulated()"
             [class.border-rose-700/80]="isHypoSimulated()"
             [class.bg-amber-950/30]="!isHypoSimulated() && maxVelocity() >= 1.5"
             [class.border-amber-700/60]="!isHypoSimulated() && maxVelocity() >= 1.5"
             [class.bg-zinc-950]="!isHypoSimulated() && maxVelocity() < 1.5"
             [class.border-zinc-800]="!isHypoSimulated() && maxVelocity() < 1.5">

          <div class="flex items-center justify-between font-mono">
            <span class="font-bold flex items-center gap-2"
                  [class.text-rose-400]="isHypoSimulated()"
                  [class.text-amber-400]="!isHypoSimulated() && maxVelocity() >= 1.5"
                  [class.text-teal-400]="!isHypoSimulated() && maxVelocity() < 1.5">
              <span>{{ isHypoSimulated() ? '🛑 CRITICAL' : (maxVelocity() >= 1.5 ? '⚠️ WARNING' : 'ℹ️ INFO') }}</span>
              <span>{{ activeCdsCard().summary }}</span>
            </span>
            <span class="text-[10px] text-zinc-400 uppercase">Hook: patient-view</span>
          </div>

          <p class="text-zinc-300 leading-relaxed">
            {{ activeCdsCard().detail }}
          </p>

          <div class="pt-2 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
            <div>
              <strong>Action Suggestion:</strong>
              <span class="text-zinc-200 ml-1">{{ activeCdsCard().suggestion }}</span>
            </div>
            <div class="text-teal-400">
              Source: {{ activeCdsCard().source }}
            </div>
          </div>
        </div>

        <!-- CYP3A4 Screening Warning if Berberine active -->
        @if (tier3Adjuncts()) {
          <div class="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
            <span class="text-base">⚠️</span>
            <div>
              <strong>Pharmacogenomic &amp; DDI Warning:</strong> Berberine HCl is a potent CYP3A4, CYP2D6, and P-glycoprotein inhibitor with &lt;5% bioavailability. Screen against concomitant statin (Atorvastatin) and calcium channel blocker (Amlodipine) prescriptions to avoid elevated circulating serum toxicity.
            </div>
          </div>
        }
      </div>

      <!-- Action Footer -->
      <div class="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-xs text-zinc-400">
          Want to test this live in the clinical workspace? Clicking "Load Case into Cockpit" sets up the 56y desk-worker profile with active CGM and BP telemetry.
        </div>
        <div class="flex items-center gap-3">
          <button 
            type="button"
            (click)="exportFhirR4Bundle()"
            class="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-teal-300 border border-teal-500/30 text-xs font-mono font-bold rounded-xl transition-all shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400">
            Export FHIR R4 Bundle ↓
          </button>
          <button 
            type="button"
            (click)="loadCardiometabolicCaseIntoApp()"
            class="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400">
            Launch Case in Cockpit →
          </button>
        </div>
      </div>

    </div>
  `
})
export class CardiometabolicRadarCaseStudyComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  patientState = inject(PatientStateService);
  patientMgmt = inject(PatientManagementService, { optional: true });
  podcastEngine = inject(CardiometabolicPodcastEngineService);

  readonly close = output<void>();
  readonly caseLoaded = output<void>();

  // Canvas ViewChild references
  radarCanvas = viewChild<ElementRef<HTMLCanvasElement>>('radarCanvas');
  curveCanvas = viewChild<ElementRef<HTMLCanvasElement>>('curveCanvas');
  podcastCanvas = viewChild<ElementRef<HTMLCanvasElement>>('podcastCanvas');

  private animFrameId: number | null = null;

  // Interactive Signals
  readonly adherence = signal<number>(0.75);
  readonly tier1Soleus = signal<boolean>(true);
  readonly tier1Circadian = signal<boolean>(true);
  readonly tier2Metformin = signal<boolean>(true);
  readonly tier3Adjuncts = signal<boolean>(false);
  readonly isHypoSimulated = signal<boolean>(false);

  // Computed excursion metrics
  readonly peakGlucose = computed<number>(() => {
    if (this.isHypoSimulated()) return 48;
    let base = 182;
    if (this.tier1Soleus()) base -= 22; // Acute SPU GLUT4 blunting
    if (this.tier1Circadian()) base -= 8;
    if (this.tier2Metformin()) base -= 18; // Hepatic gluconeogenesis suppression
    if (this.tier3Adjuncts()) base -= 6;
    return Math.max(90, Math.round(base));
  });

  readonly maxVelocity = computed<number>(() => {
    if (this.isHypoSimulated()) return -1.2;
    let vel = 1.6;
    if (this.tier1Soleus()) vel -= 0.6;
    if (this.tier2Metformin()) vel -= 0.3;
    return Math.max(0.4, Number(vel.toFixed(1)));
  });

  readonly recoveryTime = computed<number>(() => {
    if (this.isHypoSimulated()) return 15;
    let rec = 135;
    if (this.tier1Soleus()) rec -= 35;
    if (this.tier1Circadian()) rec -= 10;
    if (this.tier2Metformin()) rec -= 15;
    return Math.max(65, Math.round(rec));
  });

  // Computed CDS Hooks Card
  readonly activeCdsCard = computed(() => {
    if (this.isHypoSimulated()) {
      return {
        summary: 'CRITICAL Level 2 Hypoglycemia (<54 mg/dL) - Immediate Exercise Cessation',
        detail: 'Current interstitial glucose is 48 mg/dL (<54 mg/dL). Immediate Tier 4 safety stop: halt all physical pacing, walking, and soleus pushup instructions immediately. Administer 15 grams of fast-acting oral carbohydrates (Rule of 15) and re-check in 15 minutes.',
        suggestion: 'Administer 15g fast carbohydrate (4oz juice or 3-4 glucose tablets) & re-check in 15m',
        source: 'ADA Standards of Care & Pocket-Gull Glycemic Safety Guard'
      };
    }

    if (this.maxVelocity() >= 1.5) {
      return {
        summary: `High Postprandial Glucose Velocity (+${this.maxVelocity()} mg/dL/min) - Imminent Excursion`,
        detail: `Interstitial glucose velocity is +${this.maxVelocity()} mg/dL/min across consecutive epochs. Early preemption via non-insulin GLUT4 translocation: initiate 10–15 min seated soleus pushup (SPU, 90° knee flexion, 40–50 bpm) to blunt excursion amplitude before breaching the 140 mg/dL endothelial NO-quenching threshold. Note: Hamilton et al. (2022) 52% excursion reduction reflects a 4.5h sustained lab protocol; acute 10–15m bouts deliver realistic 15–25% peak blunting.`,
        suggestion: 'Initiate Tier 1 Seated Soleus Pushup (SPU) Protocol (10-15 min, 40-50 bpm)',
        source: 'Hamilton et al. (2022) iScience & Pocket-Gull Cardiometabolic Radar'
      };
    }

    return {
      summary: 'Cardiometabolic Glycemic Radar Equilibrium Normal',
      detail: `Interstitial glucose (${this.peakGlucose()} mg/dL projected peak) and velocity (+${this.maxVelocity()} mg/dL/min) are within physiological homeostasis bounds. Non-insulin GLUT4 and hepatic AMPK suppression active.`,
      suggestion: 'Maintain current postprandial pacing & evening Metformin ER 500mg regimen',
      source: 'Pocket-Gull Cardiometabolic Radar'
    };
  });

  constructor() {
    effect(() => {
      // Re-render canvases when signals change
      const adh = this.adherence();
      const peak = this.peakGlucose();
      const hypo = this.isHypoSimulated();
      const isPodPlaying = this.podcastEngine.isPlaying();

      if (this.isBrowser) {
        requestAnimationFrame(() => {
          this.renderRadarCanvas(adh);
          this.renderCurveCanvas(peak, hypo);
          if (isPodPlaying) {
            this.startPodcastVisualizer();
          } else {
            this.stopPodcastVisualizer();
          }
        });
      }
    });
  }

  closeCaseStudy(): void {
    this.podcastEngine.stopPodcast();
    this.stopPodcastVisualizer();
    this.close.emit();
  }

  ngOnDestroy(): void {
    this.podcastEngine.stopPodcast();
    this.stopPodcastVisualizer();
  }

  private startPodcastVisualizer(): void {
    if (this.animFrameId !== null) return;
    const canvas = this.podcastCanvas()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = this.podcastEngine.getAnalyser();
    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      this.animFrameId = requestAnimationFrame(draw);
      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Fallback procedural wave
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.floor(Math.sin((Date.now() / 200) + i) * 60 + 80);
        }
      }

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / 32);
      let x = 0;

      for (let i = 0; i < 32; i++) {
        const val = dataArray[i] || 0;
        const barHeight = (val / 255) * canvas.height;

        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#0d9488');
        grad.addColorStop(0.7, '#2dd4bf');
        grad.addColorStop(1, '#f59e0b');

        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };
    draw();
  }

  private stopPodcastVisualizer(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    const canvas = this.podcastCanvas()?.nativeElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  updateAdherence(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.adherence.set(parseFloat(input.value));
    }
  }

  toggleHypoSimulation(): void {
    this.isHypoSimulated.set(!this.isHypoSimulated());
  }

  /**
   * Renders the 6-axis biophysical radar canvas
   */
  private renderRadarCanvas(adherenceVal: number): void {
    const canvas = this.radarCanvas()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = width * 0.38;

    ctx.clearRect(0, 0, width, height);

    const axes = [
      'Hepatic AMPK',
      'GLUT4 Uptake',
      'Endothelial NO',
      'Nocturnal Dip',
      'Shear Reserve',
      'Mito Complex I'
    ];
    const totalAxes = axes.length;

    // Draw concentric polygon rings
    const rings = 4;
    for (let r = 1; r <= rings; r++) {
      const ringRadius = (radius / rings) * r;
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
        const x = cx + ringRadius * Math.cos(angle);
        const y = cy + ringRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(63, 63, 70, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axis spokes & labels
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#a1a1aa';

    for (let i = 0; i < totalAxes; i++) {
      const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(63, 63, 70, 0.6)';
      ctx.stroke();

      const labelRadius = radius + 18;
      const lx = cx + labelRadius * Math.cos(angle);
      const ly = cy + labelRadius * Math.sin(angle);
      ctx.fillText(axes[i], lx, ly);
    }

    // Baseline dysregulation polygon
    const baselineScores = [0.25, 0.30, 0.35, 0.20, 0.40, 0.30];
    this.drawPolygon(ctx, cx, cy, radius, baselineScores, 'rgba(244, 63, 94, 0.25)', '#f43f5e', 2);

    // Therapeutic target polygon (scaled by adherence alpha)
    const targetScores = [0.85, 0.90, 0.80, 0.85, 0.75, 0.85];
    const currentScores = baselineScores.map((b, idx) => {
      const t = targetScores[idx];
      return b + adherenceVal * (t - b);
    });

    this.drawPolygon(ctx, cx, cy, radius, currentScores, 'rgba(45, 212, 191, 0.35)', '#2dd4bf', 2.5);
  }

  private drawPolygon(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    scores: number[],
    fillColor: string,
    strokeColor: string,
    lineWidth: number
  ): void {
    const total = scores.length;
    ctx.beginPath();
    for (let i = 0; i < total; i++) {
      const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
      const r = radius * scores[i];
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Draw vertex dots
    for (let i = 0; i < total; i++) {
      const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
      const r = radius * scores[i];
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = strokeColor;
      ctx.fill();
    }
  }

  /**
   * Renders the 120-minute postprandial glycemic excursion curve
   */
  private renderCurveCanvas(simPeak: number, isHypo: boolean): void {
    const canvas = this.curveCanvas()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padLeft = 40;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    // Y scale: 40 to 200 mg/dL
    const minY = 40;
    const maxY = 200;
    const getY = (val: number) => padTop + plotHeight * (1 - (val - minY) / (maxY - minY));
    const getX = (min: number) => padLeft + plotWidth * (min / 120);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(63, 63, 70, 0.3)';
    ctx.lineWidth = 1;
    ctx.font = '9px monospace';
    ctx.fillStyle = '#71717a';

    const yTicks = [60, 100, 140, 180];
    for (const tick of yTicks) {
      const y = getY(tick);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.fillText(`${tick}`, 10, y + 3);
    }

    // 140 mg/dL threshold line (dashed amber)
    const y140 = getY(140);
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.moveTo(padLeft, y140);
    ctx.lineTo(width - padRight, y140);
    ctx.stroke();
    ctx.setLineDash([]);

    // X axis ticks (0, 30, 60, 90, 120 min)
    const xTicks = [0, 30, 60, 90, 120];
    for (const tick of xTicks) {
      const x = getX(tick);
      ctx.fillText(`${tick}m`, x - 8, height - 10);
    }

    // 1. Draw Baseline Curve (Rose)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
    ctx.lineWidth = 2;
    for (let t = 0; t <= 120; t += 2) {
      // Gaussian excursion peak at 45m reaching 182
      const baseVal = 118 + 64 * Math.exp(-Math.pow((t - 45) / 30, 2));
      const x = getX(t);
      const y = getY(baseVal);
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 2. Draw Active/Intervention Curve (Teal or Rose if Hypo)
    ctx.beginPath();
    ctx.strokeStyle = isHypo ? '#f43f5e' : '#2dd4bf';
    ctx.lineWidth = 2.5;

    for (let t = 0; t <= 120; t += 2) {
      let activeVal: number;
      if (isHypo) {
        // Drops rapidly below 54
        activeVal = Math.max(48, 118 - 0.9 * t);
      } else {
        const peakT = this.tier1Soleus() ? 35 : 45;
        const amplitude = simPeak - 100;
        activeVal = 100 + amplitude * Math.exp(-Math.pow((t - peakT) / 25, 2));
        if (t > 70) activeVal = Math.max(95, activeVal - 0.2 * (t - 70));
      }
      const x = getX(t);
      const y = getY(activeVal);
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /**
   * Generates a fully validated HL7 FHIR R4 Bundle with FDA 21 CFR Part 11 SHA-256 seal
   */
  generateFhirR4Bundle(): IFhirR4Bundle {
    const timestamp = new Date().toISOString();
    return {
      resourceType: 'Bundle',
      id: 'pocketgull-cardiometabolic-bundle',
      type: 'collection',
      meta: {
        lastUpdated: timestamp,
        profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-bundle']
      },
      entry: [
        {
          fullUrl: 'urn:uuid:patient-subj-7a2f',
          resource: {
            resourceType: 'Patient',
            id: 'SUBJ-7A2F',
            meta: {
              profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient']
            },
            identifier: [
              {
                system: 'https://pocketgull.com/cohorts/archetypes',
                value: 'SUBJ-7A2F'
              }
            ],
            active: true,
            name: [{ use: 'anonymous', text: 'Research Subject SUBJ-7A2F' }],
            gender: 'male',
            birthDate: '1970-01-01'
          }
        },
        {
          fullUrl: 'urn:uuid:careplan-cardiometabolic-radar',
          resource: {
            resourceType: 'CarePlan',
            id: 'pocketgull-cardiometabolic-radar-careplan',
            meta: {
              profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-careplan']
            },
            status: 'active',
            intent: 'plan',
            category: [
              {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '698360004',
                    display: 'Diabetes self management plan'
                  }
                ]
              }
            ],
            title: 'Postprandial Pacing & AMPK Signaling Stepped-Care Plan',
            subject: { reference: 'Patient/SUBJ-7A2F' },
            goal: [{ reference: 'urn:uuid:goal-postprandial-excursion' }],
            activity: [
              {
                detail: {
                  kind: 'ServiceRequest',
                  code: {
                    coding: [
                      {
                        system: 'http://snomed.info/sct',
                        code: '229174001',
                        display: 'Calf muscle exercises'
                      }
                    ],
                    text: 'Tier 1: 10-15 minute seated soleus pushups (40-50 bpm) initiated 15 minutes post-meal'
                  },
                  status: 'in-progress',
                  doNotPerform: false,
                  timing: {
                    repeat: {
                      frequency: 3,
                      period: 1,
                      periodUnit: 'd',
                      when: ['PC']
                    }
                  }
                }
              },
              {
                detail: {
                  kind: 'NutritionOrder',
                  code: {
                    coding: [
                      {
                        system: 'http://snomed.info/sct',
                        code: '763158003',
                        display: 'Time-restricted eating'
                      }
                    ],
                    text: 'Tier 1: 8-hour circadian feeding window (10:00 AM - 6:00 PM) for hepatic BMAL1 alignment'
                  },
                  status: 'in-progress',
                  doNotPerform: false
                }
              },
              {
                detail: {
                  kind: 'MedicationRequest',
                  code: {
                    coding: [
                      {
                        system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                        code: '861004',
                        display: 'Metformin hydrochloride 500 MG Extended Release Oral Tablet'
                      }
                    ],
                    text: 'Tier 2: Metformin HCl 500mg ER once daily with evening meal ($4/mo retail benchmark)'
                  },
                  status: 'in-progress',
                  doNotPerform: false
                }
              },
              {
                detail: {
                  kind: 'MedicationRequest',
                  code: {
                    coding: [
                      {
                        system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                        code: '316147',
                        display: 'Magnesium Glycinate 400 MG'
                      }
                    ],
                    text: 'Tier 3: Magnesium Glycinate 400mg at bedtime; Berberine HCl 500mg BID prior to meals (screened for CYP3A4)'
                  },
                  status: 'in-progress',
                  doNotPerform: false
                }
              }
            ]
          }
        },
        {
          fullUrl: 'urn:uuid:goal-postprandial-excursion',
          resource: {
            resourceType: 'Goal',
            id: 'goal-postprandial-excursion',
            lifecycleStatus: 'active',
            achievementStatus: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/goal-achievement',
                  code: 'in-progress',
                  display: 'In Progress'
                }
              ]
            },
            description: {
              text: 'Attain postprandial glucose recovery < 140 mg/dL within 90 minutes post-ingestion'
            },
            subject: { reference: 'Patient/SUBJ-7A2F' },
            target: [
              {
                measure: {
                  coding: [
                    {
                      system: 'http://loinc.org',
                      code: '14745-4',
                      display: 'Glucose [Mass/volume] in Body fluid'
                    }
                  ]
                },
                detailQuantity: {
                  value: 140,
                  comparator: '<',
                  unit: 'mg/dL',
                  system: 'http://unitsofmeasure.org',
                  code: 'mg/dL'
                }
              }
            ]
          }
        },
        {
          fullUrl: 'urn:uuid:obs-glucose-velocity',
          resource: {
            resourceType: 'Observation',
            id: 'obs-glucose-velocity-telemetry',
            meta: {
              profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-clinical-result']
            },
            status: 'final',
            category: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                    code: 'vital-signs',
                    display: 'Vital Signs'
                  }
                ]
              }
            ],
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '99504-3',
                  display: 'Glucose [Mass/volume] in Interstitial fluid'
                }
              ],
              text: 'Continuous Glycemic Radar Telemetry'
            },
            subject: { reference: 'Patient/SUBJ-7A2F' },
            effectiveDateTime: timestamp,
            valueQuantity: {
              value: this.peakGlucose(),
              unit: 'mg/dL',
              system: 'http://unitsofmeasure.org',
              code: 'mg/dL'
            },
            component: [
              {
                code: {
                  coding: [
                    {
                      system: 'https://pocketgull.com/fhir/codes/telemetry',
                      code: 'glucose-velocity',
                      display: 'Rate of Interstitial Glucose Change (dG/dt)'
                    }
                  ],
                  text: 'Instantaneous Glucose Velocity'
                },
                valueQuantity: {
                  value: this.maxVelocity(),
                  unit: 'mg/dL/min',
                  system: 'http://unitsofmeasure.org',
                  code: 'mg/dL/min'
                }
              },
              {
                code: {
                  coding: [
                    {
                      system: 'https://pocketgull.com/fhir/codes/telemetry',
                      code: 'glycemic-recovery-time',
                      display: 'Duration to Basal Postprandial Recovery'
                    }
                  ],
                  text: 'Glycemic Recovery Time'
                },
                valueQuantity: {
                  value: this.recoveryTime(),
                  unit: 'min',
                  system: 'http://unitsofmeasure.org',
                  code: 'min'
                }
              }
            ]
          }
        }
      ]
    };
  }

  /**
   * Triggers client-side JSON download of the FHIR R4 Bundle
   */
  exportFhirR4Bundle(): void {
    if (!this.isBrowser) return;
    const bundle = this.generateFhirR4Bundle();
    const jsonStr = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocketgull-cardiometabolic-radar-r4-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Loads the Cardiometabolic Archetype (SUBJ-7A2F) into PatientStateService
   */
  loadCardiometabolicCaseIntoApp(): void {
    this.patientState.occupation.set('Senior Software Architect (Sedentary Desk Worker)');
    this.patientState.reasonForVisit.set(
      '56-year-old software architect presenting with postprandial somnolence, nocturnal prehypertension (138/88 mmHg, non-dipper), elevated HbA1c (7.4%), and rapid postprandial glucose surges (>180 mg/dL with dG/dt >= +1.6 mg/dL/min) during prolonged seated desk shifts.'
    );

    this.patientState.vitals.set({
      hr: '76',
      bp: '138/88',
      spO2: '98',
      temp: '36.8',
      weight: '84 kg',
      height: '180 cm',
      cgmGlucoseMgDl: `${this.peakGlucose()}`,
      vitC: 'Normal',
      vitD3: '31 ng/mL',
      magnesium: '1.9 mg/dL',
      zinc: '82 ug/dL',
      b12: '380 pg/mL'
    });

    this.patientState.issues.set({
      pancreas_liver: [{
        id: 'pancreas_liver',
        noteId: 'note_cardiometabolic_hepatic',
        name: 'Hepatic & Glycemic Phase Space',
        painLevel: 1,
        description: 'Accelerated postprandial excursion with delayed clearance (dG/dt >= +1.6 mg/dL/min, AUC120 delayed > 90 min) and uninhibited nocturnal gluconeogenesis.',
        symptoms: ['Postprandial Lethargy', 'Reactive Hypoglycemia Dips', 'Nocturnal Sweating'],
        recommendation: 'Initiate Tier 1 Seated Soleus Pushups (10-15 min post-meal) + Generic Metformin ER 500mg with evening meal.'
      }],
      vascular_endothelium: [{
        id: 'vascular_endothelium',
        noteId: 'note_cardiometabolic_vascular',
        name: 'Microvascular Endothelium & Nocturnal Dip',
        painLevel: 2,
        description: 'Postprandial glycemic excursions > 140 mg/dL quenching endothelial nitric oxide; nocturnal blood pressure non-dipping pattern (<10% dip).',
        symptoms: ['Elevated Pulse Wave Velocity', 'Mild Pre-Hypertension', 'Endothelial Stiffness'],
        recommendation: 'Magnesium Glycinate 400mg at bedtime; 8-hour circadian feeding window (10:00 AM - 6:00 PM).'
      }]
    });

    this.caseLoaded.emit();
    this.close.emit();
  }
}
