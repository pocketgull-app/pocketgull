import { Component, signal, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { Holographic3DAnatomyComponent } from './anatomy-3d/holographic-3d-anatomy.component';
import { TeledentistryOdontogramComponent } from './teledentistry-odontogram.component';
import { AdkLiveService } from '../services/ai/adk-live.service';
import { UniversityLeagueService } from '../services/university-league.service';
import { PublicServiceCorpsService } from '../services/public-service-corps.service';
import { ElderBridgeService } from '../services/elder-bridge.service';
import { YouthMentorshipService } from '../services/youth-mentorship.service';
import { OrToolsGoalOptimizerService } from '../services/or-tools-goal-optimizer.service';
import { TransitWellnessGatewayService } from '../services/transit-wellness-gateway.service';

@Component({
  selector: 'app-patient-portal',
  standalone: true,
  imports: [
    CommonModule,
    Holographic3DAnatomyComponent,
    TeledentistryOdontogramComponent
  ],
  template: `
    <div class="fixed inset-0 z-[9990] flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <!-- ══ Top Exit Vector & Status Navigation Header ══════════════════════════════ -->
      <header class="h-16 px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              PG
            </div>
            <div>
              <h1 class="text-base font-semibold text-slate-100 flex items-center gap-2">
                Patient Telehealth Portal
                <span class="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Telemetry
                </span>
              </h1>
              <p class="text-xs text-slate-400">Self-service biophysical tracking & AI consult studio</p>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
          <button (click)="activeTab.set('overview')"
                  [class.bg-emerald-600]="activeTab() === 'overview'"
                  [class.text-white]="activeTab() === 'overview'"
                  [class.text-slate-400]="activeTab() !== 'overview'"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
            Overview
          </button>
          <button (click)="activeTab.set('anatomy')"
                  [class.bg-emerald-600]="activeTab() === 'anatomy'"
                  [class.text-white]="activeTab() === 'anatomy'"
                  [class.text-slate-400]="activeTab() !== 'anatomy'"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
            3D Spatial Anatomy
          </button>
          <button (click)="activeTab.set('odontogram')"
                  [class.bg-emerald-600]="activeTab() === 'odontogram'"
                  [class.text-white]="activeTab() === 'odontogram'"
                  [class.text-slate-400]="activeTab() !== 'odontogram'"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
            Oral-Systemic (SIBI)
          </button>
          <button (click)="activeTab.set('quests')"
                  [class.bg-emerald-600]="activeTab() === 'quests'"
                  [class.text-white]="activeTab() === 'quests'"
                  [class.text-slate-400]="activeTab() !== 'quests'"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1">
            <span>🏆 Quests & Leagues</span>
          </button>
          <button (click)="activeTab.set('consult')"
                  [class.bg-emerald-600]="activeTab() === 'consult'"
                  [class.text-white]="activeTab() === 'consult'"
                  [class.text-slate-400]="activeTab() !== 'consult'"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            AI Voice Consult
          </button>
        </div>

        <!-- Exit & Privacy Actions -->
        <div class="flex items-center gap-3">
          <button (click)="confirmPurgeState()"
                  class="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium transition-colors flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            1-Click Ephemeral Purge
          </button>
          <button (click)="close.emit()"
                  class="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1">
            <span>Return to Clinician View</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </header>

      <!-- ══ Main Content Area ═══════════════════════════════════════════════════════ -->
      <main class="flex-1 overflow-y-auto p-6 bg-slate-950">
        @switch (activeTab()) {
          @case ('overview') {
            <div class="max-w-6xl mx-auto space-y-6">
              <!-- Welcome Banner -->
              <div class="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 flex justify-between items-center">
                <div>
                  <h2 class="text-xl font-bold text-slate-100">Welcome to Your Biophysical Health Hub</h2>
                  <p class="text-sm text-slate-400 mt-1">Real-time health status, biophysical markers, and systemic risk telemetry.</p>
                </div>
                <div class="flex items-center gap-3">
                  <div class="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
                    <div class="text-xs text-slate-400">Heart Rate</div>
                    <div class="text-lg font-bold text-emerald-400">72 bpm</div>
                  </div>
                  <div class="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-right">
                    <div class="text-xs text-slate-400">SIBI Score</div>
                    <div class="text-lg font-bold text-teal-400">0.18 (Low)</div>
                  </div>
                </div>
              </div>

              <!-- Quick Status Cards -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h3 class="text-xs uppercase font-bold tracking-wider text-slate-400">Active Paradigms</h3>
                  <p class="text-2xl font-extrabold text-slate-100">Unified Coherence</p>
                  <p class="text-xs text-slate-400">Western + TCM + Ayurveda Alignment</p>
                </div>

                <div class="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h3 class="text-xs uppercase font-bold tracking-wider text-slate-400">Vocal Biomarker Pitch (F0)</h3>
                  <p class="text-2xl font-extrabold text-emerald-400">142.5 Hz</p>
                  <p class="text-xs text-slate-400">Autocorrelation Vagal Tone Stable</p>
                </div>

                <div class="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h3 class="text-xs uppercase font-bold tracking-wider text-slate-400">Current Affiliation</h3>
                  <p class="text-2xl font-extrabold text-amber-400">{{ league.currentAffiliation().mascotEmoji }} {{ league.currentAffiliation().schoolName }}</p>
                  <p class="text-xs text-slate-400">Coherence Rank #{{ league.currentAffiliation().rank }}</p>
                </div>
              </div>
            </div>
          }

          @case ('anatomy') {
            <div class="h-full rounded-2xl overflow-hidden border border-slate-800">
              <app-holographic-3d-anatomy></app-holographic-3d-anatomy>
            </div>
          }

          @case ('odontogram') {
            <div class="h-full rounded-2xl overflow-hidden border border-slate-800 p-6 bg-slate-900">
              <app-teledentistry-odontogram></app-teledentistry-odontogram>
            </div>
          }

          @case ('quests') {
            <div class="max-w-6xl mx-auto space-y-8">
              <!-- Inter-University Bio-Coherence Cup -->
              <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div class="flex justify-between items-center">
                  <div>
                    <h2 class="text-lg font-bold text-slate-100 flex items-center gap-2">
                      🏆 Inter-University Bio-Coherence League
                    </h2>
                    <p class="text-xs text-slate-400">Friendly academic health & research competition (SNOMED CT Location Mapped)</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-400">Select Affiliation:</span>
                    <select (change)="league.selectSchool($any($event.target).value)"
                            [value]="league.selectedSchoolId()"
                            class="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-emerald-400 outline-none">
                      @for (s of league.scores(); track s.schoolId) {
                        <option [value]="s.schoolId">{{ s.mascotEmoji }} {{ s.schoolName }} ({{ s.cityState }})</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  @for (school of league.scores(); track school.schoolId) {
                    <div [class.border-emerald-500]="school.schoolId === league.selectedSchoolId()"
                         class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 transition-all">
                      <div class="flex justify-between items-center">
                        <span class="text-2xl">{{ school.mascotEmoji }}</span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Rank #{{ school.rank }}
                        </span>
                      </div>
                      <h3 class="text-xs font-bold text-slate-200 line-clamp-1">{{ school.schoolName }}</h3>
                      <div class="text-xl font-extrabold text-emerald-400">{{ school.averageCoherenceScore }} / 100</div>
                      <p class="text-[10px] text-slate-400">{{ school.activeStudentCount }} Students \| \${{ school.philanthropicContributionUsd }} R&D Fund</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Google OR-Tools Health & Lifestyle Constraint Optimizer -->
              <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h2 class="text-lg font-bold text-slate-100 flex items-center gap-2">
                  🧮 Google OR-Tools Health & Lifestyle Constraint Optimizer
                </h2>
                <p class="text-xs text-slate-400">Aligning hobbies, travel allocations, and clinical deadlines using constraint programming</p>

                <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span class="text-xs text-slate-400">Optimization Status:</span>
                    <span class="ml-2 font-bold text-emerald-400">{{ orTools.optimizedSchedule().constraintSatisfactionStatus }}</span>
                  </div>
                  <div>
                    <span class="text-xs text-slate-400">Goal Fulfillment Score:</span>
                    <span class="ml-2 font-bold text-teal-400">{{ orTools.optimizedSchedule().healthGoalFulfillmentPct }}%</span>
                  </div>
                </div>

                <div class="space-y-2">
                  <h3 class="text-xs uppercase font-bold text-slate-400">Recommended Aligned Quests:</h3>
                  @for (quest of orTools.optimizedSchedule().recommendedQuests; track quest) {
                    <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium">
                      {{ quest }}
                    </div>
                  }
                </div>
              </div>

              <!-- Public Service & Social Impact Initiatives -->
              <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h2 class="text-lg font-bold text-slate-100 flex items-center gap-2">
                  🌍 Public Service & Giving Back Corps
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  @for (init of publicService.activeInitiatives(); track init.id) {
                    <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div class="text-2xl">{{ init.emojiBadge }}</div>
                      <h3 class="text-xs font-bold text-slate-200">{{ init.title }}</h3>
                      <p class="text-[11px] text-slate-400">{{ init.targetBeneficiaries }}</p>
                      <p class="text-[10px] text-emerald-400 font-medium pt-1">{{ init.impactMetrics }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- Airport Transit TSA Bio-Pass & Millimeter-Wave Health Read -->
              <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div class="flex justify-between items-center">
                  <h2 class="text-lg font-bold text-slate-100 flex items-center gap-2">
                    🛫 Airport Transit TSA Bio-Pass & Millimeter-Wave Read
                  </h2>
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Venue: {{ transit.latestTransitScan().venueNameOrIata }}
                  </span>
                </div>
                <p class="text-xs text-slate-400">Voluntary non-ionizing millimeter-wave 3D postural & thermal travel baseline</p>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span class="text-[11px] text-slate-400">Postural Symmetry</span>
                    <div class="text-xl font-bold text-sky-400">{{ transit.latestTransitScan().postureSymmetryScore }}%</div>
                  </div>
                  <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span class="text-[11px] text-slate-400">Spinal Alignment</span>
                    <div class="text-xl font-bold text-teal-400">{{ transit.latestTransitScan().spinalCobbAngleDeg }}° Cobb</div>
                  </div>
                  <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span class="text-[11px] text-slate-400">Hydration Index</span>
                    <div class="text-xl font-bold text-emerald-400">{{ transit.latestTransitScan().hydrationIndexPct }}%</div>
                  </div>
                </div>

                <div class="space-y-2">
                  <h3 class="text-xs uppercase font-bold text-slate-400">Calibrated Transit Health Quests:</h3>
                  @for (q of transit.latestTransitScan().recommendedQuests; track q) {
                    <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                      {{ q }}
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          @case ('consult') {
            <div class="max-w-4xl mx-auto space-y-6">
              <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h2 class="text-lg font-bold text-slate-100 flex items-center gap-2">
                  🎙️ Multimodal Live AI Consult Studio
                </h2>
                <p class="text-xs text-slate-400">Bi-directional Web Speech & Gemini Live audio streaming session.</p>

                <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 min-h-[200px] text-xs text-slate-300 font-mono space-y-2">
                  @for (msg of adkLive.conversationHistory(); track $index) {
                    <div class="text-emerald-400">{{ msg }}</div>
                  }
                  @if (adkLive.conversationHistory().length === 0) {
                    <div class="text-slate-600 italic">Click "Start Live Consult" to initiate bi-directional AI voice session...</div>
                  }
                </div>

                <div class="flex items-center gap-3">
                  <button (click)="startLiveConsult()"
                          class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                    Start Live Voice Consult
                  </button>
                  <button (click)="adkLive.disconnect()"
                          [disabled]="!adkLive.isConnected()"
                          class="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold text-sm border border-slate-700 transition-all">
                    Disconnect Session
                  </button>
                </div>
              </div>
            </div>
          }
        }
      </main>

      <!-- ══ Ephemeral State Purge Modal ═══════════════════════════════════════════ -->
      @if (showPurgeConfirmation()) {
        <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" role="dialog" aria-modal="true">
          <div class="w-full max-w-md p-6 bg-slate-900 rounded-2xl border border-red-500/30 text-center space-y-4">
            <div class="w-12 h-12 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-slate-100">Confirm Ephemeral State Purge</h3>
            <p class="text-xs text-slate-400">
              This will permanently erase all local transient symptoms, vitals telemetry, and session state per HIPAA Safe Harbor §164.514 standards.
            </p>
            <div class="flex justify-center gap-3 pt-2">
              <button (click)="showPurgeConfirmation.set(false)"
                      class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors">
                Cancel
              </button>
              <button (click)="executePurgeState()"
                      class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors">
                Purge All Data
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PatientPortalComponent {
  close = output<void>();

  patientState = inject(PatientStateService);
  adkLive = inject(AdkLiveService);
  league = inject(UniversityLeagueService);
  publicService = inject(PublicServiceCorpsService);
  elder = inject(ElderBridgeService);
  youth = inject(YouthMentorshipService);
  orTools = inject(OrToolsGoalOptimizerService);
  transit = inject(TransitWellnessGatewayService);

  activeTab = signal<'overview' | 'anatomy' | 'odontogram' | 'quests' | 'consult'>('overview');
  showPurgeConfirmation = signal(false);

  confirmPurgeState() {
    this.showPurgeConfirmation.set(true);
  }

  executePurgeState() {
    this.showPurgeConfirmation.set(false);
    this.patientState.purgeTransientPatientState();
    this.close.emit();
  }

  startLiveConsult() {
    this.adkLive.simulateLiveStreamResponse([
      'Hello! I am your AI Patient Consult Assistant.',
      ' I am monitoring your SIBI inflammatory indices and vitals in real time.'
    ]);
  }
}
