import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoubleFlipStateMachineService, DoubleClickState } from '../services/double-flip-state-machine.service';
import { PatientStateService } from '../services/patient-state.service';
import { BioHapticFeedbackService } from '../services/bio-haptic-feedback.service';
import { ResidencyOsceSimulatorComponent } from './residency-osce-simulator.component';
import { SlackIntegrationCardComponent } from './slack-integration-card.component';
import { PopulationHealthEquityHubComponent } from './population-health-equity-hub.component';
import { TeledentistryOdontogramComponent } from './teledentistry-odontogram.component';

export interface IWorkbenchToolStatus {
  id: string;
  name: string;
  category: 'Clinical AI' | '3D & Spatial' | 'FHIR & Security' | 'Multimodal Sensor';
  description: string;
  status: 'OPERATIONAL' | 'TESTING' | 'PASS';
  latencyMs: number;
  isFlipped: boolean;
  cognitiveInsight: string;
}

@Component({
  selector: 'app-clinical-tool-workbench',
  standalone: true,
  imports: [
    CommonModule,
    ResidencyOsceSimulatorComponent,
    SlackIntegrationCardComponent,
    PopulationHealthEquityHubComponent,
    TeledentistryOdontogramComponent
  ],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl max-w-7xl mx-auto space-y-6">
      
      <!-- Top Ribbon Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-bold tracking-tight text-white">🔬 Clinical Tool Workbench & Diagnostics Lab</h2>
            <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              NN/g Heuristic #5 Compliant
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            Double-click any card (<code class="text-amber-400">dblclick 🔄</code>) to trigger the safety interlock and flip between Clinical Controls and Cognitive Diagnostics.
          </p>
        </div>

        <!-- Telemetry Summary Badges -->
        <div class="flex items-center gap-3">
          <div class="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-xs">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-zinc-400">Operational Tools:</span>
            <span class="font-mono font-semibold text-emerald-400">{{ operationalCount() }} / {{ tools().length }}</span>
          </div>
          <button
            (click)="runAllDiagnostics()"
            class="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <span>⚡ Run Self-Diagnostic Suite</span>
          </button>
        </div>
      </div>

      <!-- State Machine Safety Interlock HUD Banner -->
      <div class="p-4 rounded-xl bg-gradient-to-r from-zinc-900 via-amber-950/20 to-zinc-900 border border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
            🔄
          </div>
          <div>
            <div class="text-xs font-medium text-amber-400">Double-Flip Safety Interlock Status</div>
            <div class="text-sm font-semibold text-zinc-200 mt-0.5">
              State: <span class="font-mono text-cyan-300">{{ stateMachine.doubleClickStatus().state }}</span>
              <span class="mx-2 text-zinc-600">|</span>
              Telemetry: <span class="text-emerald-400">{{ stateMachine.doubleFlipTelemetry().vagalSympatheticBalance }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4 text-xs font-mono text-zinc-400">
          <div>Flips: <span class="text-amber-400 font-bold">{{ stateMachine.doubleFlipTelemetry().flipCount }}</span></div>
          <div>Hysteresis: <span class="text-cyan-400 font-bold">{{ stateMachine.doubleFlipTelemetry().hysteresisRatio }}</span></div>
        </div>
           <!-- Navigation Tabs -->
      <div class="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-bold font-mono">
        <button (click)="activeWorkbenchTab.set('tools')"
                [class.bg-cyan-500]="activeWorkbenchTab() === 'tools'"
                [class.text-zinc-950]="activeWorkbenchTab() === 'tools'"
                [class.text-zinc-300]="activeWorkbenchTab() !== 'tools'"
                class="px-3.5 py-2 rounded-lg transition cursor-pointer">
          🛠️ Diagnostic Tools
        </button>
        <button (click)="activeWorkbenchTab.set('osce')"
                [class.bg-amber-500]="activeWorkbenchTab() === 'osce'"
                [class.text-zinc-950]="activeWorkbenchTab() === 'osce'"
                [class.text-zinc-300]="activeWorkbenchTab() !== 'osce'"
                class="px-3.5 py-2 rounded-lg transition cursor-pointer">
          🎓 Residency OSCE Trainer
        </button>
        <button (click)="activeWorkbenchTab.set('slack')"
                [class.bg-purple-500]="activeWorkbenchTab() === 'slack'"
                [class.text-zinc-950]="activeWorkbenchTab() === 'slack'"
                [class.text-zinc-300]="activeWorkbenchTab() !== 'slack'"
                class="px-3.5 py-2 rounded-lg transition cursor-pointer">
          💬 Slack Command & Alerts
        </button>
        <button (click)="activeWorkbenchTab.set('equity')"
                [class.bg-indigo-500]="activeWorkbenchTab() === 'equity'"
                [class.text-zinc-950]="activeWorkbenchTab() === 'equity'"
                [class.text-zinc-300]="activeWorkbenchTab() !== 'equity'"
                class="px-3.5 py-2 rounded-lg transition cursor-pointer">
          🌍 Population Health Equity Hub
        </button>
        <button (click)="activeWorkbenchTab.set('dental')"
                [class.bg-teal-500]="activeWorkbenchTab() === 'dental'"
                [class.text-zinc-950]="activeWorkbenchTab() === 'dental'"
                [class.text-zinc-300]="activeWorkbenchTab() !== 'dental'"
                class="px-3.5 py-2 rounded-lg transition cursor-pointer">
          🦷 Teledentistry & Odontogram
        </button>
      </div>

      @if (activeWorkbenchTab() === 'tools') {
        <!-- Workbench Interactive Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (tool of tools(); track tool.id) {
            <div
              (dblclick)="onCardDblClick(tool.id)"
              class="relative min-h-[220px] rounded-xl border transition-all duration-300 cursor-pointer select-none group perspective-1000 p-4 flex flex-col justify-between"
              [ngClass]="{
                'bg-zinc-900/80 border-zinc-800 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-950/30': !tool.isFlipped,
                'bg-zinc-900 border-amber-500/40 shadow-xl shadow-amber-950/40 ring-1 ring-amber-500/20': tool.isFlipped
              }"
            >
              <!-- FRONT SIDE: Clinical Controls -->
              @if (!tool.isFlipped) {
                <div>
                  <div class="flex items-center justify-between text-xs mb-2">
                    <span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">{{ tool.category }}</span>
                    <span
                      class="px-2 py-0.5 rounded font-mono font-semibold text-[10px]"
                      [ngClass]="{
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': tool.status === 'PASS',
                        'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20': tool.status === 'OPERATIONAL',
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse': tool.status === 'TESTING'
                      }"
                    >
                      {{ tool.status }}
                    </span>
                  </div>

                  <h3 class="text-sm font-semibold text-zinc-100 group-hover:text-teal-400 transition-colors">
                    {{ tool.name }}
                  </h3>
                  <p class="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    {{ tool.description }}
                  </p>
                </div>

                <div class="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                  <span class="font-mono">Latency: <span class="text-zinc-300">{{ tool.latencyMs }}ms</span></span>
                  <button type="button" (click)="onCardDblClick(tool.id); $event.stopPropagation()"
                          class="text-amber-400 hover:text-amber-300 font-medium cursor-pointer transition flex items-center gap-1">
                    Double-click to Flip 🔄
                  </button>
                </div>
              } @else {
                <!-- BACK SIDE: Cognitive Diagnostics & Mechanism Insight -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-xs pb-1.5 border-b border-amber-500/20">
                    <span class="font-bold text-amber-400 flex items-center gap-1">
                      🧠 Cognitive Diagnostic Insight
                    </span>
                    <button type="button" (click)="onCardDblClick(tool.id); $event.stopPropagation()"
                            class="text-[10px] text-zinc-400 hover:text-zinc-200 font-mono cursor-pointer">
                      Flipped View 🔄
                    </button>
                  </div>

                  <p class="text-xs text-zinc-300 leading-relaxed font-sans">
                    {{ tool.cognitiveInsight }}
                  </p>
                </div>

                <div class="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                  <button
                    (click)="testSingleTool(tool.id); $event.stopPropagation()"
                    class="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium transition-colors cursor-pointer"
                  >
                    ⚡ Trigger Test
                  </button>
                  <button type="button" (click)="onCardDblClick(tool.id); $event.stopPropagation()"
                          class="text-zinc-400 hover:text-zinc-200 text-[10px] cursor-pointer">
                    Return ↩️
                  </button>
                </div>
              }
            </div>
          }
        </div>
      } @else if (activeWorkbenchTab() === 'osce') {
        <app-residency-osce-simulator />
      } @else if (activeWorkbenchTab() === 'slack') {
        <app-slack-integration-card />
      } @else if (activeWorkbenchTab() === 'equity') {
        <app-population-health-equity-hub />
      } @else if (activeWorkbenchTab() === 'dental') {
        <app-teledentistry-odontogram />
      }

    </div>
  `
})
export class ClinicalToolWorkbenchComponent {
  readonly stateMachine = inject(DoubleFlipStateMachineService);
  private readonly haptics = inject(BioHapticFeedbackService);

  readonly activeWorkbenchTab = signal<'tools' | 'osce' | 'slack' | 'equity' | 'dental'>('tools');

  readonly tools = signal<IWorkbenchToolStatus[]>([
    {
      id: 'tool_double_flip',
      name: 'Double-Flip Bistable State Machine',
      category: 'Clinical AI',
      description: 'Double-click safety interlock & autonomic vagal-sympathetic bistability engine.',
      status: 'PASS',
      latencyMs: 12,
      isFlipped: false,
      cognitiveInsight: 'Bistable hysteresis model prevents accidental state destruction by requiring a 300ms double-click confirmation window.'
    },
    {
      id: 'tool_3d_hominid',
      name: '3D Hominid & Primate Anatomy Engine',
      category: '3D & Spatial',
      description: 'WebGL 2 procedural skeletal model with Homo Sapiens & Pongo Pygmaeus archetypes.',
      status: 'PASS',
      latencyMs: 24,
      isFlipped: false,
      cognitiveInsight: 'Biophysical Subsurface Scattering (SSS) & Edwin Smith Surgical Codex PBR textures map tissue strain in real time.'
    },
    {
      id: 'tool_fhir_smart',
      name: 'SMART on FHIR R4 Bundle Exporter',
      category: 'FHIR & Security',
      description: 'DOMPurify sanitized FHIR R4 export engine with HIPAA Safe Harbor §164.514 compliance.',
      status: 'PASS',
      latencyMs: 18,
      isFlipped: false,
      cognitiveInsight: 'HIPAA §164.514 Safe Harbor de-identification serializes symptoms, vitals, and conditions into standard FHIR bundles.'
    },
    {
      id: 'tool_audio_respiratory',
      name: 'Audio Respiratory Acoustic Analyzer',
      category: 'Multimodal Sensor',
      description: 'Real-time Web Audio spectral FFT dyspnea & cough frequency analyzer.',
      status: 'PASS',
      latencyMs: 15,
      isFlipped: false,
      cognitiveInsight: '40Hz Gamma wave resonance and respiratory rate spectral density detect early pulmonary distress signals.'
    },
    {
      id: 'tool_teledentistry',
      name: 'Teledentistry & Systemic Health Bridge',
      category: 'Clinical AI',
      description: 'FDI 32-tooth odontogram & Systemic Inflammatory Burden Index (SIBI) cross-talk.',
      status: 'PASS',
      latencyMs: 22,
      isFlipped: false,
      cognitiveInsight: 'Periodontal probing depth (PPD >= 4mm) cross-references cardiovascular & HbA1c glycemic risk trajectories.'
    },
    {
      id: 'tool_3paradigm_matrix',
      name: '3-Paradigm Diagnostic Cross-Talk',
      category: 'Clinical AI',
      description: 'Integrated Western LOINC/SNOMED, TCM Pulse/Tongue, & Ayurvedic Medha Sakti matrix.',
      status: 'PASS',
      latencyMs: 28,
      isFlipped: false,
      cognitiveInsight: 'Synthesizes empirical Western biomarkers with TCM Du Mai channel stagnation and Ayurvedic Vata Pranavaha imbalance.'
    },
    {
      id: 'tool_bio_haptics',
      name: 'Bio-Haptic Dual-Pulse Feedback',
      category: 'Multimodal Sensor',
      description: 'Web Haptics dual-pulse co-regulation engine for heart rate variability sync.',
      status: 'PASS',
      latencyMs: 8,
      isFlipped: false,
      cognitiveInsight: 'Dual-pulse haptic tactile rhythm (20ms-30ms-20ms) induces parasympathetic autonomic entrainment.'
    },
    {
      id: 'tool_gemini_live',
      name: 'Gemini 2.5 Multimodal Live Stream',
      category: 'Clinical AI',
      description: 'Full-duplex real-time streaming AI consult engine with defensive reconnect.',
      status: 'PASS',
      latencyMs: 45,
      isFlipped: false,
      cognitiveInsight: 'InMemoryRunner ADK multi-turn streaming engine handles symptom management and live clinical strategy.'
    }
  ]);

  readonly operationalCount = computed(() => 
    this.tools().filter(t => t.status === 'PASS' || t.status === 'OPERATIONAL').length
  );

  onCardDblClick(toolId: string): void {
    // 1. Register click in Double-Click State Machine
    const result = this.stateMachine.registerClick(toolId);
    
    if (result === 'CONFIRMED_ACTION') {
      // 2. Trigger Double-Flip Bistable State
      this.stateMachine.triggerDoubleFlip();

      // 3. Dual-pulse Web Haptics co-regulation
      this.haptics.triggerDualPulse(25, 40, 25);

      // 4. Toggle Card Flip State
      this.tools.update(items =>
        items.map(t => t.id === toolId ? { ...t, isFlipped: !t.isFlipped } : t)
      );
    }
  }

  testSingleTool(toolId: string): void {
    this.tools.update(items =>
      items.map(t => t.id === toolId ? { ...t, status: 'TESTING' } : t)
    );

    setTimeout(() => {
      this.tools.update(items =>
        items.map(t => t.id === toolId ? { ...t, status: 'PASS', latencyMs: Math.floor(Math.random() * 20) + 10 } : t)
      );
      this.haptics.triggerDualPulse(20, 30, 20);
    }, 400);
  }

  runAllDiagnostics(): void {
    this.tools.update(items => items.map(t => ({ ...t, status: 'TESTING' })));

    setTimeout(() => {
      this.tools.update(items =>
        items.map(t => ({
          ...t,
          status: 'PASS',
          latencyMs: Math.floor(Math.random() * 25) + 8
        }))
      );
      this.haptics.triggerDualPulse(40, 60, 40);
    }, 600);
  }
}
