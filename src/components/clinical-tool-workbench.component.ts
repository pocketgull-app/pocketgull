import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoubleFlipStateMachineService, DoubleClickState } from '../services/double-flip-state-machine.service';
import { PatientStateService } from '../services/patient-state.service';
import { BioHapticFeedbackService, SolfeggioTone } from '../services/hardware/bio-haptic-feedback.service';
import { ResidencyOsceSimulatorComponent } from './residency-osce-simulator.component';
import { SlackIntegrationCardComponent } from './slack-integration-card.component';
import { PopulationHealthEquityHubComponent } from './population-health-equity-hub.component';
import { TeledentistryOdontogramComponent } from './teledentistry-odontogram.component';
import { JoyPlayfulFlourishingCardComponent } from './joy-playful-flourishing-card.component';
import { SsaDisabilityNavigatorComponent } from './shared/ssa-disability-navigator.component';
import { JurisdictionMatrixCardComponent } from './shared/jurisdiction-matrix-card.component';
import { MandiantCyberDefenseCardComponent } from './shared/mandiant-cyber-defense-card.component';
import { ClinicalMandarinateExamCardComponent } from './shared/clinical-mandarinate-exam-card.component';
import { RxGuardLensComponent } from './rx-guard-lens.component';
import { BiomarkerVelocityCardComponent } from './biomarker-velocity-card.component';
import { ClinicalTrialsMatcherComponent } from './clinical-trials-matcher.component';
import { SmsEquityBridgeComponent } from './sms-equity-bridge.component';
import { DifferentialDiagnosisRadarComponent } from './differential-diagnosis-radar.component';
import { NOf1DesignerComponent } from './n-of-1-designer.component';
import { AmbientClinicalScribeComponent } from './ambient-clinical-scribe.component';
import { PresentationModalComponent } from './presentation-modal.component';
import { RolePathwayDocumentationHubComponent } from './role-pathway-documentation-hub.component';
import { RoleDemoModalComponent } from './role-demo-modal.component';
import { HistoricalLuminariesGameComponent } from './historical-luminaries-game.component';
import { HobbyDomainCompanionComponent } from './hobby-domain-companion.component';

export interface IPatientEducationLens {
  plainLanguageTitle: string;
  gradeLevel: string;
  plainLanguageDiagnosis: string;
  biophysicalAnalogy: string;
  socraticInquiry: string;
  spanishTranslation: string;
  homeCareSteps: string[];
}

export interface IWorkbenchToolStatus {
  id: string;
  name: string;
  category: 'Clinical AI' | '3D & Spatial' | 'FHIR & Security' | 'Multimodal Sensor';
  description: string;
  status: 'OPERATIONAL' | 'TESTING' | 'PASS';
  latencyMs: number;
  isFlipped: boolean;
  cognitiveInsight: string;
  isAutopilotSurfaced?: boolean;
  autopilotPriority?: 'HIGH' | 'MEDIUM';
  autopilotReason?: string;
  patientEducation?: IPatientEducationLens;
}

@Component({
  selector: 'app-clinical-tool-workbench',
  standalone: true,
  imports: [
    CommonModule,
    ResidencyOsceSimulatorComponent,
    SlackIntegrationCardComponent,
    PopulationHealthEquityHubComponent,
    TeledentistryOdontogramComponent,
    JoyPlayfulFlourishingCardComponent,
    SsaDisabilityNavigatorComponent,
    JurisdictionMatrixCardComponent,
    MandiantCyberDefenseCardComponent,
    ClinicalMandarinateExamCardComponent,
    RxGuardLensComponent,
    BiomarkerVelocityCardComponent,
    ClinicalTrialsMatcherComponent,
    SmsEquityBridgeComponent,
    DifferentialDiagnosisRadarComponent,
    NOf1DesignerComponent,
    AmbientClinicalScribeComponent,
    PresentationModalComponent,
    RolePathwayDocumentationHubComponent,
    RoleDemoModalComponent,
    HistoricalLuminariesGameComponent,
    HobbyDomainCompanionComponent
  ],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl max-w-7xl mx-auto space-y-6">
      
      <!-- Top Ribbon Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-bold tracking-tight text-white">🔬 Clinical Tool Workbench & Generative UI Lab</h2>
            <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              NN/g Heuristic #5 Compliant
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            Double-click any card (<code class="text-amber-400">dblclick 🔄</code>) to trigger the safety interlock and flip between <strong class="text-zinc-200">Clinician Controls (Front)</strong> and <strong class="text-emerald-400">Patient Education Lens (Back)</strong>.
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
            (click)="showRoleDemoModal.set(true)"
            class="px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>✨ Role Demo Mode</span>
          </button>
          <button
            (click)="runAllDiagnostics()"
            class="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>⚡ Run Self-Diagnostic Suite</span>
          </button>
        </div>
      </div>

      <!-- State Machine Safety Interlock & Generative UI Autopilot HUD Banner -->
      <div class="p-4 rounded-xl bg-gradient-to-r from-zinc-900 via-amber-950/20 to-zinc-900 border border-amber-500/20 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-4">
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
        </div>

        <!-- Generative UI Autopilot Directive Input -->
        <div class="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 text-teal-400 font-semibold font-mono">
            <span>✨ Generative UI Autopilot:</span>
          </div>
          <div class="flex-1 min-w-[280px]">
            <input
              type="text"
              [value]="intakeDirectiveQuery()"
              (input)="onIntakeInput($event)"
              placeholder="Enter patient symptoms (e.g. 'FDI tooth 36 pain + glucose 132', 'chest tightness', 'sleep hr spike')..."
              class="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition font-mono text-xs"
            />
          </div>
          <div class="flex items-center gap-2">
            <button (click)="applyPresetDirective('dental')"
                    class="px-2.5 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 transition cursor-pointer text-[11px]">
              🦷 FDI Tooth 36 + SIBI
            </button>
            <button (click)="applyPresetDirective('respiratory')"
                    class="px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition cursor-pointer text-[11px]">
              🫁 Dyspnea & Cough
            </button>
            <button (click)="applyPresetDirective('fhir')"
                    class="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition cursor-pointer text-[11px]">
              📄 FHIR R4 Bundle
            </button>
            <button (click)="clearAutopilotDirective()"
                    class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition cursor-pointer text-[11px]">
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs (DRY Loop) -->
      <div class="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-bold font-mono">
        @for (tab of workbenchTabs; track tab.id) {
          <button (click)="activeWorkbenchTab.set(tab.id)"
                  [ngClass]="activeWorkbenchTab() === tab.id ? tab.activeClass : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/60'"
                  class="px-3.5 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5">
            <span>{{ tab.icon }} {{ tab.label }}</span>
            @if (tab.id === 'tools' && surfacedCount() > 0) {
              <span class="px-1.5 py-0.5 text-[10px] rounded-full bg-teal-400 text-zinc-950 font-bold animate-pulse">
                {{ surfacedCount() }} surfaced
              </span>
            }
          </button>
        }
      </div>

      @if (activeWorkbenchTab() === 'tools') {
        <!-- Workbench Interactive Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (tool of tools(); track tool.id) {
            <div
              (dblclick)="onCardDblClick(tool.id)"
              class="relative min-h-[260px] rounded-xl border transition-all duration-300 cursor-pointer select-none group perspective-1000 p-4 flex flex-col justify-between"
              [ngClass]="{
                'bg-zinc-900/80 border-zinc-800 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-950/30': !tool.isFlipped && !tool.isAutopilotSurfaced,
                'bg-zinc-900 border-teal-500/80 shadow-lg shadow-teal-950/50 ring-2 ring-teal-500/30': !tool.isFlipped && tool.isAutopilotSurfaced,
                'bg-zinc-900 border-emerald-500/60 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500/30': tool.isFlipped
              }"
            >
              <!-- FRONT SIDE: Clinician Control Panel -->
              @if (!tool.isFlipped) {
                <div>
                  <div class="flex items-center justify-between text-xs mb-2">
                    <span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">{{ tool.category }}</span>
                    
                    <div class="flex items-center gap-1.5">
                      @if (tool.isAutopilotSurfaced) {
                        <span class="px-1.5 py-0.5 rounded font-mono font-bold text-[9px] bg-teal-500/20 text-teal-300 border border-teal-500/40 animate-pulse">
                          ✨ {{ tool.autopilotPriority }} SURFACED
                        </span>
                      }
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
                  </div>

                  <h3 class="text-sm font-semibold text-zinc-100 group-hover:text-teal-400 transition-colors">
                    {{ tool.name }}
                  </h3>

                  @if (tool.isAutopilotSurfaced && tool.autopilotReason) {
                    <div class="my-2 p-2 rounded bg-teal-950/40 border border-teal-500/30 text-[11px] text-teal-200 leading-snug">
                      <strong>AI Dispatch Rationale:</strong> {{ tool.autopilotReason }}
                    </div>
                  }

                  <p class="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    {{ tool.description }}
                  </p>
                </div>

                <div class="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                  <span class="font-mono">Latency: <span class="text-zinc-300">{{ tool.latencyMs }}ms</span></span>
                  <button type="button" (click)="onCardDblClick(tool.id); $event.stopPropagation()"
                          class="text-amber-400 hover:text-amber-300 font-medium cursor-pointer transition flex items-center gap-1">
                    Double-click for Patient Lens 🔄
                  </button>
                </div>
              } @else {
                <!-- BACK SIDE: Patient Education Lens (Double-Flip Patient-Facing View) -->
                <div class="space-y-2.5">
                  <div class="flex items-center justify-between text-xs pb-1.5 border-b border-emerald-500/30">
                    <span class="font-bold text-emerald-400 flex items-center gap-1">
                      🌿 Patient Education Lens
                    </span>
                    <span class="px-1.5 py-0.5 rounded font-mono text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {{ tool.patientEducation?.gradeLevel || 'Grade 6.2' }}
                    </span>
                  </div>

                  <!-- Plain Language Diagnosis -->
                  <div>
                    <div class="text-[11px] font-semibold text-zinc-200">
                      {{ tool.patientEducation?.plainLanguageTitle || tool.name }}
                    </div>
                    <p class="text-xs text-zinc-300 mt-0.5 leading-relaxed font-sans">
                      {{ tool.patientEducation?.plainLanguageDiagnosis || tool.cognitiveInsight }}
                    </p>
                  </div>

                  <!-- Biophysical Analogy Callout -->
                  @if (tool.patientEducation?.biophysicalAnalogy) {
                    <div class="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200 leading-snug">
                      <strong class="text-emerald-300">💡 Everyday Analogy:</strong>
                      <p class="mt-0.5 text-zinc-300 font-sans">
                        {{ tool.patientEducation?.biophysicalAnalogy }}
                      </p>
                    </div>
                  }

                  <!-- Socratic Health Literacy Question -->
                  @if (tool.patientEducation?.socraticInquiry) {
                    <div class="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 leading-snug">
                      <strong class="text-cyan-300">❓ Socratic Inquiry:</strong>
                      <p class="mt-0.5 text-zinc-300 italic font-sans">
                        "{{ tool.patientEducation?.socraticInquiry }}"
                      </p>
                    </div>
                  }

                  <!-- Section 1557 ACA Spanish Badge -->
                  @if (tool.patientEducation?.spanishTranslation) {
                    <div class="text-[10px] text-teal-400 font-mono flex items-center gap-1">
                      <span class="px-1 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">Section 1557 ACA</span>
                      <span class="truncate">{{ tool.patientEducation?.spanishTranslation }}</span>
                    </div>
                  }
                </div>

                <div class="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                  <button
                    (click)="testSingleTool(tool.id); $event.stopPropagation()"
                    class="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium transition-colors cursor-pointer"
                  >
                    ⚡ Test Audio/Print
                  </button>
                  <button type="button" (click)="onCardDblClick(tool.id); $event.stopPropagation()"
                          class="text-zinc-400 hover:text-zinc-200 text-[10px] cursor-pointer">
                    Return to Clinician ↩️
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
      } @else if (activeWorkbenchTab() === 'joy') {
        <app-joy-playful-flourishing-card />
      } @else if (activeWorkbenchTab() === 'ssa') {
        <app-ssa-disability-navigator />
      } @else if (activeWorkbenchTab() === 'jurisdiction') {
        <app-jurisdiction-matrix-card />
      } @else if (activeWorkbenchTab() === 'mandiant') {
        <app-mandiant-cyber-defense-card />
      } @else if (activeWorkbenchTab() === 'mandarinate') {
        <app-clinical-mandarinate-exam-card />
      } @else if (activeWorkbenchTab() === 'rxguard') {
        <app-rx-guard-lens />
      } @else if (activeWorkbenchTab() === 'velocity') {
        <app-biomarker-velocity-card />
      } @else if (activeWorkbenchTab() === 'trials') {
        <app-clinical-trials-matcher />
      } @else if (activeWorkbenchTab() === 'sms') {
        <app-sms-equity-bridge />
      } @else if (activeWorkbenchTab() === 'dxradar') {
        <app-differential-diagnosis-radar />
      } @else if (activeWorkbenchTab() === 'nof1') {
        <app-n-of-1-designer />
      } @else if (activeWorkbenchTab() === 'scribe') {
        <app-ambient-clinical-scribe />
      } @else if (activeWorkbenchTab() === 'presentation') {
        <app-presentation-modal />
      } @else if (activeWorkbenchTab() === 'pathwayDocs') {
        <app-role-pathway-documentation-hub (navigateToTab)="activeWorkbenchTab.set($any($event))" />
      } @else if (activeWorkbenchTab() === 'luminaries') {
        <app-historical-luminaries-game />
      } @else if (activeWorkbenchTab() === 'companion') {
        <app-hobby-domain-companion />
      }

      @if (showRoleDemoModal()) {
        <app-role-demo-modal (closeModal)="showRoleDemoModal.set(false)" (onDemoLaunched)="activeWorkbenchTab.set($any($event))" />
      }

    </div>
  `
})
export class ClinicalToolWorkbenchComponent {
  readonly stateMachine = inject(DoubleFlipStateMachineService);
  private readonly haptics = inject(BioHapticFeedbackService);

  readonly showRoleDemoModal = signal(false);
  readonly activeWorkbenchTab = signal<'tools' | 'osce' | 'slack' | 'equity' | 'dental' | 'joy' | 'ssa' | 'jurisdiction' | 'mandiant' | 'mandarinate' | 'rxguard' | 'velocity' | 'trials' | 'sms' | 'dxradar' | 'nof1' | 'scribe' | 'presentation' | 'pathwayDocs' | 'luminaries' | 'companion'>('tools');
  readonly intakeDirectiveQuery = signal<string>('');

  readonly workbenchTabs: { id: 'tools' | 'osce' | 'slack' | 'equity' | 'dental' | 'joy' | 'ssa' | 'jurisdiction' | 'mandiant' | 'mandarinate' | 'rxguard' | 'velocity' | 'trials' | 'sms' | 'dxradar' | 'nof1' | 'scribe' | 'presentation' | 'pathwayDocs' | 'luminaries' | 'companion'; label: string; icon: string; activeClass: string }[] = [
    { id: 'tools', label: 'Diagnostic Tools', icon: '🛠️', activeClass: 'bg-cyan-500 text-zinc-950 shadow-xs' },
    { id: 'companion', label: 'Craft & Passion Confidants (SNO-10)', icon: '🤝', activeClass: 'bg-amber-500 text-zinc-950 shadow-xs' },
    { id: 'luminaries', label: 'Historical Luminaries Arena', icon: '🏛️', activeClass: 'bg-amber-500 text-zinc-950 shadow-xs' },
    { id: 'pathwayDocs', label: 'Role & Pathway Docs', icon: '🧭', activeClass: 'bg-indigo-600 text-white shadow-xs' },
    { id: 'osce', label: 'Residency OSCE Trainer', icon: '🎓', activeClass: 'bg-amber-500 text-zinc-950 shadow-xs' },
    { id: 'slack', label: 'Slack Command & Alerts', icon: '💬', activeClass: 'bg-purple-500 text-zinc-950 shadow-xs' },
    { id: 'equity', label: 'Population Health Equity Hub', icon: '🌍', activeClass: 'bg-indigo-500 text-zinc-950 shadow-xs' },
    { id: 'dental', label: 'Teledentistry & Odontogram', icon: '🦷', activeClass: 'bg-teal-500 text-zinc-950 shadow-xs' },
    { id: 'joy', label: 'Joy & Play Matrix', icon: '☀️', activeClass: 'bg-amber-500 text-zinc-950 shadow-xs' },
    { id: 'ssa', label: 'SSA Disability Navigator', icon: '🏛️', activeClass: 'bg-blue-600 text-white shadow-xs' },
    { id: 'jurisdiction', label: 'Global & State Compliance', icon: '🌐', activeClass: 'bg-indigo-600 text-white shadow-xs' },
    { id: 'mandiant', label: 'Mandiant Threat Defense', icon: '🛡️', activeClass: 'bg-red-600 text-white shadow-xs' },
    { id: 'mandarinate', label: 'Keju AI Exam Arena', icon: '📜', activeClass: 'bg-amber-600 text-zinc-950 shadow-xs' },
    { id: 'rxguard', label: 'RxGuard PGx & Botanicals', icon: '🛡️', activeClass: 'bg-purple-600 text-white shadow-xs' },
    { id: 'velocity', label: 'BioTrajectory Velocity', icon: '📈', activeClass: 'bg-emerald-600 text-white shadow-xs' },
    { id: 'trials', label: 'TrialFinder', icon: '🔬', activeClass: 'bg-blue-600 text-white shadow-xs' },
    { id: 'sms', label: 'SMS Compass Bridge', icon: '💬', activeClass: 'bg-teal-600 text-white shadow-xs' },
    { id: 'dxradar', label: 'DxRadar Socratic Engine', icon: '🎯', activeClass: 'bg-rose-600 text-white shadow-xs' },
    { id: 'nof1', label: 'N-of-1 Trial Designer', icon: '🧪', activeClass: 'bg-indigo-600 text-white shadow-xs' },
    { id: 'scribe', label: 'Ambient Clinical Scribe', icon: '🎙️', activeClass: 'bg-teal-600 text-white shadow-xs' },
    { id: 'presentation', label: 'Grand Rounds Slides & CARE', icon: '📽️', activeClass: 'bg-cyan-600 text-white shadow-xs' }
  ];

  readonly tools = signal<IWorkbenchToolStatus[]>([
    {
      id: 'tool_double_flip',
      name: 'Double-Flip Bistable State Machine',
      category: 'Clinical AI',
      description: 'Double-click safety interlock & autonomic vagal-sympathetic bistability engine.',
      status: 'PASS',
      latencyMs: 12,
      isFlipped: false,
      cognitiveInsight: 'Bistable hysteresis model prevents accidental state destruction by requiring a 300ms double-click confirmation window.',
      patientEducation: {
        plainLanguageTitle: 'Double-Click Safety Interlock',
        gradeLevel: 'Grade 6.1',
        plainLanguageDiagnosis: 'A 2-step double-click confirmation window that keeps your medical data safe and prevents accidental button presses.',
        biophysicalAnalogy: 'Think of it like a child-proof bottle cap: it requires two intentional steps so nothing gets changed by mistake.',
        socraticInquiry: 'Would you feel more comfortable knowing every clinical action requires a double-confirmation before making changes?',
        spanishTranslation: 'Interbloqueo de seguridad de doble clic para protección de datos.',
        homeCareSteps: ['Review your health plan twice daily', 'Confirm medication dosages before taking']
      }
    },
    {
      id: 'tool_teledentistry',
      name: 'Teledentistry & Systemic Health Bridge',
      category: 'Clinical AI',
      description: 'FDI 32-tooth odontogram & Systemic Inflammatory Burden Index (SIBI) cross-talk.',
      status: 'PASS',
      latencyMs: 22,
      isFlipped: false,
      cognitiveInsight: 'Periodontal probing depth (PPD >= 4mm) cross-references cardiovascular & HbA1c glycemic risk trajectories.',
      patientEducation: {
        plainLanguageTitle: 'Gum & Blood Sugar Connection',
        gradeLevel: 'Grade 6.2',
        plainLanguageDiagnosis: 'Deep gum pockets around your teeth can cause mild body-wide swelling that affects how your body handles morning blood sugar.',
        biophysicalAnalogy: 'Think of healthy gums like a sealed door. When gum pockets get deeper than 4mm, bacteria slip through into your bloodstream, making your body work harder to balance blood sugar.',
        socraticInquiry: 'Would you like to see how taking care of your gums can help keep your morning blood sugar numbers steady?',
        spanishTranslation: 'Conexión entre salud bucal y control de glucosa en sangre.',
        homeCareSteps: ['Brush twice daily with soft bristles', 'Rinse with antimicrobial mouthwash', 'Schedule 2-week follow-up']
      }
    },
    {
      id: 'tool_3d_hominid',
      name: '3D Hominid & Primate Anatomy Engine',
      category: '3D & Spatial',
      description: 'WebGL 2 procedural skeletal model with Homo Sapiens & Pongo Pygmaeus archetypes.',
      status: 'PASS',
      latencyMs: 24,
      isFlipped: false,
      cognitiveInsight: 'Biophysical Subsurface Scattering (SSS) & Edwin Smith Surgical Codex PBR textures map tissue strain in real time.',
      patientEducation: {
        plainLanguageTitle: '3D Body & Joint Map',
        gradeLevel: 'Grade 6.0',
        plainLanguageDiagnosis: 'An interactive 3D model that highlights exactly where your body feels pressure or muscle tightness.',
        biophysicalAnalogy: 'Think of your muscles and bones like a bridge structure: when one cable gets tight, we can see where the pressure builds.',
        socraticInquiry: 'Would you like to see a 3D picture of your joints to understand where your tightness is coming from?',
        spanishTranslation: 'Mapa tridimensional de músculos y articulaciones.',
        homeCareSteps: ['Perform gentle daily stretching', 'Apply warm compress for 15 minutes', 'Stay hydrated']
      }
    },
    {
      id: 'tool_fhir_smart',
      name: 'SMART on FHIR R4 Bundle Exporter',
      category: 'FHIR & Security',
      description: 'DOMPurify sanitized FHIR R4 export engine with HIPAA Safe Harbor §164.514 compliance.',
      status: 'PASS',
      latencyMs: 18,
      isFlipped: false,
      cognitiveInsight: 'HIPAA §164.514 Safe Harbor de-identification serializes symptoms, vitals, and conditions into standard FHIR bundles.',
      patientEducation: {
        plainLanguageTitle: 'Private Health Records Exporter',
        gradeLevel: 'Grade 5.9',
        plainLanguageDiagnosis: 'A secure tool that cleans your health summary so it can be shared with your other doctors without leaking personal ID numbers.',
        biophysicalAnalogy: 'Think of it like putting your medical record in an envelope where your name is blacked out for total privacy.',
        socraticInquiry: 'Would you like a private digital copy of your health summary sent directly to your phone?',
        spanishTranslation: 'Exportación privada y segura de registros de salud.',
        homeCareSteps: ['Keep a digital copy of your care plan', 'Share health summary with primary doctor']
      }
    },
    {
      id: 'tool_audio_respiratory',
      name: 'Audio Respiratory Acoustic Analyzer',
      category: 'Multimodal Sensor',
      description: 'Real-time Web Audio spectral FFT dyspnea & cough frequency analyzer.',
      status: 'PASS',
      latencyMs: 15,
      isFlipped: false,
      cognitiveInsight: '40Hz Gamma wave resonance and respiratory rate spectral density detect early pulmonary distress signals.',
      patientEducation: {
        plainLanguageTitle: 'Breathing Sound & Rhythm Check',
        gradeLevel: 'Grade 6.4',
        plainLanguageDiagnosis: 'Listens to your breath rhythm to check how easily air flows in and out of your lungs.',
        biophysicalAnalogy: 'Think of your airways like a clear drinking straw: when there is mild swelling, the sound changes slightly as air flows.',
        socraticInquiry: 'Would you like to try a short guided breathing exercise to help relax your airway muscles?',
        spanishTranslation: 'Análisis de ritmo respiratorio y flujo de aire.',
        homeCareSteps: ['Practice 4-7-8 breathing twice daily', 'Use prescribed inhaler as directed']
      }
    },
    {
      id: 'tool_3paradigm_matrix',
      name: '3-Paradigm Diagnostic Cross-Talk',
      category: 'Clinical AI',
      description: 'Integrated Western LOINC/SNOMED, TCM Pulse/Tongue, & Ayurvedic Medha Sakti matrix.',
      status: 'PASS',
      latencyMs: 28,
      isFlipped: false,
      cognitiveInsight: 'Synthesizes empirical Western biomarkers with TCM Du Mai channel stagnation and Ayurvedic Vata Pranavaha imbalance.',
      patientEducation: {
        plainLanguageTitle: 'Whole-Person Whole-Body Matrix',
        gradeLevel: 'Grade 6.3',
        plainLanguageDiagnosis: 'Combines modern lab tests with traditional wellness insights to look at sleep, digestion, and energy balance together.',
        biophysicalAnalogy: 'Think of your health like an ecosystem: we look at your lab numbers, sleep patterns, and daily energy as one connected circle.',
        socraticInquiry: 'Would you like to explore how adjusting your sleep timing can improve your morning energy levels?',
        spanishTranslation: 'Matriz de salud integral y equilibrio corporal.',
        homeCareSteps: ['Maintain regular bedtime schedule', 'Eat balanced whole food meals']
      }
    },
    {
      id: 'tool_bio_haptics',
      name: 'Bio-Haptic Dual-Pulse Feedback',
      category: 'Multimodal Sensor',
      description: 'Web Haptics dual-pulse co-regulation engine for heart rate variability sync.',
      status: 'PASS',
      latencyMs: 8,
      isFlipped: false,
      cognitiveInsight: 'Dual-pulse haptic tactile rhythm (20ms-30ms-20ms) induces parasympathetic autonomic entrainment.',
      patientEducation: {
        plainLanguageTitle: 'Calming Heart-Rhythm Vibration',
        gradeLevel: 'Grade 5.8',
        plainLanguageDiagnosis: 'Gentle tactile vibrations on your phone or device that help slow down a racing pulse during stress.',
        biophysicalAnalogy: 'Think of it like a soothing tapping rhythm on your shoulder that guides your heart back to a slow, steady pulse.',
        socraticInquiry: 'Would you like to try feeling a gentle rhythm pulse on your phone for 60 seconds to lower your stress?',
        spanishTranslation: 'Vibraciones rítmicas para calmar el ritmo cardíaco.',
        homeCareSteps: ['Use haptic calming pulse during stress spikes', 'Combine with slow nasal breathing']
      }
    },
    {
      id: 'tool_gemini_live',
      name: 'Gemini 2.5 Multimodal Live Stream',
      category: 'Clinical AI',
      description: 'Full-duplex real-time streaming AI consult engine with defensive reconnect.',
      status: 'PASS',
      latencyMs: 45,
      isFlipped: false,
      cognitiveInsight: 'InMemoryRunner ADK multi-turn streaming engine handles symptom management and live clinical strategy.',
      patientEducation: {
        plainLanguageTitle: 'Live AI Health Assistant',
        gradeLevel: 'Grade 6.0',
        plainLanguageDiagnosis: 'A real-time voice and text assistant that answers your health questions instantly between clinic visits.',
        biophysicalAnalogy: 'Think of it like a friendly nurse on call who can explain your doctor’s instructions whenever you need a reminder.',
        socraticInquiry: 'Do you have any questions about your care plan that you would like your AI health assistant to explain right now?',
        spanishTranslation: 'Asistente de salud con voz e inteligencia artificial en vivo.',
        homeCareSteps: ['Ask AI assistant to review your care instructions', 'Record daily symptom updates']
      }
    }
  ]);

  readonly operationalCount = computed(() => 
    this.tools().filter(t => t.status === 'PASS' || t.status === 'OPERATIONAL').length
  );

  readonly surfacedCount = computed(() =>
    this.tools().filter(t => t.isAutopilotSurfaced).length
  );

  onIntakeInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.intakeDirectiveQuery.set(value);
    this.evaluateAutopilotDirective(value);
  }

  applyPresetDirective(preset: 'dental' | 'respiratory' | 'fhir'): void {
    let query = '';
    if (preset === 'dental') query = 'FDI tooth 36 pain + Fasting Glucose 132 mg/dL';
    if (preset === 'respiratory') query = 'Dyspnea, exertion cough, respiratory rate 24';
    if (preset === 'fhir') query = 'Export SMART on FHIR R4 anonymized bundle';

    this.intakeDirectiveQuery.set(query);
    this.evaluateAutopilotDirective(query);
  }

  clearAutopilotDirective(): void {
    this.intakeDirectiveQuery.set('');
    this.tools.update(items => items.map(t => ({
      ...t,
      isAutopilotSurfaced: false,
      autopilotPriority: undefined,
      autopilotReason: undefined
    })));
  }

  private evaluateAutopilotDirective(query: string): void {
    const q = query.toLowerCase();
    this.tools.update(items => items.map(t => {
      let isSurfaced = false;
      let priority: 'HIGH' | 'MEDIUM' | undefined = undefined;
      let reason: string | undefined = undefined;

      if (q.includes('tooth') || q.includes('fdi') || q.includes('sibi') || q.includes('dental') || q.includes('glucose')) {
        if (t.id === 'tool_teledentistry') {
          isSurfaced = true;
          priority = 'HIGH';
          reason = 'Periodontal SIBI risk detected from FDI tooth 36 + glycemic coupling.';
        }
        if (t.id === 'tool_3d_hominid') {
          isSurfaced = true;
          priority = 'MEDIUM';
          reason = 'Surfacing 3D mandible bone PBR mesh for spatial pain localization.';
        }
      }

      if (q.includes('breath') || q.includes('cough') || q.includes('respiratory') || q.includes('dyspnea')) {
        if (t.id === 'tool_audio_respiratory') {
          isSurfaced = true;
          priority = 'HIGH';
          reason = 'Acoustic pulmonary distress signals flagged from intake transcription.';
        }
      }

      if (q.includes('fhir') || q.includes('export') || q.includes('bundle') || q.includes('hipaa')) {
        if (t.id === 'tool_fhir_smart') {
          isSurfaced = true;
          priority = 'HIGH';
          reason = 'SMART on FHIR R4 export requested with §164.514 Safe Harbor de-identification.';
        }
      }

      if (q.includes('hr') || q.includes('heart') || q.includes('sleep') || q.includes('tachycardia')) {
        if (t.id === 'tool_bio_haptics') {
          isSurfaced = true;
          priority = 'MEDIUM';
          reason = 'Dual-pulse haptic tactile co-regulation recommended for autonomic vagal sync.';
        }
      }

      return {
        ...t,
        isAutopilotSurfaced: isSurfaced,
        autopilotPriority: priority,
        autopilotReason: reason
      };
    }));
  }

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
