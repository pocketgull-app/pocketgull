import { Component, ChangeDetectionStrategy, signal, computed, inject, output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export interface IShiftPhase {
  id: number;
  timeRange: string;
  title: string;
  subtitle: string;
  patientCount: number;
  fatigueBaseline: number; // 0 - 100%
  fatigueShielded: number; // 0 - 100%
  chartingHoursSaved: number;
  apiSpend: number; // $ USD
  fhirBundles: number;
  equityParityScore: number; // %
  keyIntervention: string;
  doctorWellnessTip: string;
}

export interface IShiftPatientCase {
  id: string;
  time: string;
  patientName: string;
  ward: string;
  chiefComplaint: string;
  triageLevel: 'L1-RED' | 'L2-ORANGE' | 'L3-YELLOW' | 'L4-GREEN';
  triageColor: string;
  parityAudit: 'Pass (Optimal)' | 'Pass (Monitored)';
}

@Component({
  selector: 'app-doctor-shift-simulator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-2xl p-4 sm:p-8 flex items-center justify-center overflow-y-auto font-mono text-zinc-100 animate-in fade-in duration-300">
      
      <div class="w-full max-w-5xl bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl p-6 sm:p-8 relative overflow-hidden font-mono flex flex-col justify-between max-h-[92vh]">
        
        <!-- Top Bar Header -->
        <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4 shrink-0">
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)] animate-pulse"></span>
            <div>
              <h2 class="text-sm sm:text-base font-black uppercase tracking-tight text-zinc-100 flex items-center gap-2">
                <span>⚡</span> 12-Hour Intensive Doctor Shift Simulator & Stress Test
              </h2>
              <p class="text-xs text-zinc-400 font-sans mt-0.5">
                Simulating Dr. Sarah Chen, MD — 28 Patient Encounters Across 5 Wards (07:00 – 19:00)
              </p>
            </div>
          </div>

          <button (click)="closeModal.emit()"
            class="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition cursor-pointer text-sm font-bold">
            ✕
          </button>
        </div>

        <!-- Scrollable Main Simulation Body -->
        <div class="space-y-6 overflow-y-auto pr-1 flex-1">
          
          <!-- Shift Timeline Stepper Controls -->
          <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3 font-mono">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-orange-400 uppercase tracking-widest">Shift Progression:</span>
                <span class="text-sm font-black text-white bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800">
                  Phase {{ currentPhaseIndex() + 1 }} / {{ phases.length }} ({{ currentPhase().timeRange }})
                </span>
              </div>

              <!-- Automated Time-Lapse Controls -->
              <div class="flex items-center gap-2 text-xs">
                <button (click)="toggleAutoPlay()" 
                  [class]="isAutoPlaying() ? 'bg-rose-600 hover:bg-rose-500 text-white font-bold' : 'bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold'"
                  class="px-4 py-1.5 rounded-xl uppercase tracking-wider transition cursor-pointer border border-orange-400/50 flex items-center gap-1.5">
                  <span>{{ isAutoPlaying() ? '⏸ Pause Time-Lapse' : '▶ Auto Play Shift' }}</span>
                </button>

                <button (click)="stepNextPhase()" [disabled]="currentPhaseIndex() === phases.length - 1"
                  class="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-300 font-bold uppercase transition cursor-pointer border border-zinc-800 disabled:opacity-40">
                  Step Phase →
                </button>
                <button (click)="resetShift()"
                  class="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white transition cursor-pointer border border-zinc-800">
                  ↺ Reset
                </button>
              </div>
            </div>

            <!-- Phase Buttons Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              @for (phase of phases; track phase.id) {
                <button (click)="currentPhaseIndex.set(phase.id)"
                  [class]="currentPhaseIndex() === phase.id
                    ? 'p-2.5 rounded-xl bg-orange-500 text-zinc-950 font-bold border border-orange-400 text-left transition shadow-md'
                    : 'p-2.5 rounded-xl bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800 text-left transition'"
                  class="cursor-pointer font-mono">
                  <span class="text-[10px] font-bold block uppercase tracking-wider">{{ phase.timeRange }}</span>
                  <span class="text-xs truncate font-sans block mt-0.5">{{ phase.title }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Active Shift Phase Highlight Card -->
          <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-orange-400">Current Active Shift Phase</span>
                <h3 class="text-base sm:text-lg font-black text-white font-sans mt-0.5">{{ currentPhase().title }}</h3>
                <p class="text-xs text-zinc-400 font-sans mt-0.5">{{ currentPhase().subtitle }}</p>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-zinc-400 uppercase block font-mono">Patients In Phase</span>
                <span class="text-xl font-black text-orange-400 font-mono">+{{ currentPhase().patientCount }} Cases</span>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs font-sans">
              <span class="text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-mono block">💡 Key Clinical & Architectural Intervention</span>
              <p class="text-zinc-200 leading-relaxed font-mono">
                {{ currentPhase().keyIntervention }}
              </p>
            </div>
          </div>

          <!-- 3D Double-Click Flip Analytics & Telemetry State Machine -->
          <div (dblclick)="toggleAnalyticsFlip($event)"
            class="relative perspective-1000 group cursor-pointer min-h-[220px] font-mono select-none"
            title="Double-click to flip over for Dr. Sarah Chen's Ergonomic Wellness & Vagal RSA Micro-Break">

            <div [class.rotate-y-180]="isAnalyticsFlipped()"
              class="relative w-full h-full transition-transform duration-500 transform-style-3d">

              <!-- FRONT FACE: Shift Performance & Unit Economics Telemetry -->
              <div class="p-5 rounded-2xl bg-zinc-950 text-zinc-100 border border-orange-500/40 shadow-2xl backdrop-blur-xl flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden">
                <div>
                  <div class="flex items-center justify-between border-b border-zinc-800 pb-2 mb-4 text-xs">
                    <span class="text-orange-400 font-bold uppercase flex items-center gap-1.5">
                      <span>📊</span> Cumulative 12-Hour Shift Telemetry
                    </span>
                    <span class="text-[9px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase font-mono">
                      dblclick 🔄 flip for doctor wellness
                    </span>
                  </div>

                  <!-- 4 Telemetry Metrics Grid -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                      <span class="text-[9.5px] text-zinc-400 uppercase block">Total Encounters</span>
                      <div class="text-2xl font-black text-white">{{ cumulativePatients() }} / 28</div>
                      <span class="text-[9.5px] text-emerald-400 block">✓ 100% On-Time</span>
                    </div>

                    <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                      <span class="text-[9.5px] text-zinc-400 uppercase block">Charting Time Saved</span>
                      <div class="text-2xl font-black text-orange-400">{{ cumulativeHoursSaved() }} Hrs</div>
                      <span class="text-[9.5px] text-orange-300 block">Pajama Time Eliminated</span>
                    </div>

                    <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                      <span class="text-[9.5px] text-zinc-400 uppercase block">Gemini API Spend</span>
                      <div class="text-2xl font-black text-emerald-400">\${{ cumulativeApiSpend().toFixed(3) }}</div>
                      <span class="text-[9.5px] text-zinc-400 block">~$0.006 / Patient</span>
                    </div>

                    <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                      <span class="text-[9.5px] text-zinc-400 uppercase block">HHS § 1557 Parity</span>
                      <div class="text-2xl font-black text-sky-400">{{ currentPhase().equityParityScore }}%</div>
                      <span class="text-[9.5px] text-sky-300 block">Zero Race Multipliers</span>
                    </div>
                  </div>
                </div>

                <div class="pt-2 border-t border-zinc-800 flex justify-between items-center text-[10px] text-zinc-400">
                  <span>Cognitive Fatigue Shield: <strong class="text-emerald-400">{{ currentPhase().fatigueShielded }}%</strong> (vs {{ currentPhase().fatigueBaseline }}% baseline burnout)</span>
                  <span class="text-orange-400 font-bold">Double-click flip 🔄</span>
                </div>
              </div>

              <!-- BACK FACE: Dr. Sarah Chen's Ergonomic Wellness & Vagal Micro-Break -->
              <div class="p-5 rounded-2xl bg-teal-950 text-white border border-teal-400/50 shadow-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden font-sans text-xs">
                <div>
                  <div class="flex items-center justify-between border-b border-teal-800 pb-2 mb-3 font-mono text-xs">
                    <span class="text-teal-200 font-bold uppercase flex items-center gap-1.5">
                      <span>🧠</span> Clinician Ergonomic & Vagal Micro-Break Protocol
                    </span>
                    <span class="text-teal-400 font-mono text-[9px]">dblclick flip</span>
                  </div>

                  <div class="space-y-2 text-teal-100 font-mono text-[11.5px]">
                    <p><strong>Shift Phase {{ currentPhaseIndex() + 1 }} Recommended Micro-Break:</strong></p>
                    <div class="p-3 rounded-xl bg-teal-900/60 border border-teal-700/60 text-teal-100 leading-relaxed font-sans text-xs">
                      {{ currentPhase().doctorWellnessTip }}
                    </div>
                  </div>
                </div>

                <div class="pt-2 border-t border-teal-900 font-mono text-[9px] text-teal-300 flex justify-between">
                  <span>Polyvagal RSA Co-Regulation Active</span>
                  <span>Double-click to return to shift telemetry</span>
                </div>
              </div>

            </div>
          </div>

          <!-- Simulated Patient Encounters Table -->
          <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 font-mono">
            <div class="flex justify-between items-center mb-1">
              <h4 class="text-xs font-bold uppercase tracking-widest text-zinc-100">
                📋 Simulated Patient Encounter Log (Phase {{ currentPhaseIndex() + 1 }})
              </h4>
              <span class="text-[10px] text-zinc-400 font-mono">FHIR R4 Bundles Synced</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr class="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
                    <th class="py-2 px-3">Time</th>
                    <th class="py-2 px-3">Patient Name</th>
                    <th class="py-2 px-3">Ward</th>
                    <th class="py-2 px-3">Chief Complaint</th>
                    <th class="py-2 px-3">Sentinel Triage</th>
                    <th class="py-2 px-3">§ 1557 Audit</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800/60 text-[11px]">
                  @for (c of activeCases(); track c.id) {
                    <tr class="hover:bg-zinc-850/50 transition">
                      <td class="py-2.5 px-3 font-bold text-orange-400">{{ c.time }}</td>
                      <td class="py-2.5 px-3 font-bold text-zinc-200">{{ c.patientName }}</td>
                      <td class="py-2.5 px-3 text-zinc-400">{{ c.ward }}</td>
                      <td class="py-2.5 px-3 text-zinc-300 font-sans text-[11px] max-w-xs truncate">{{ c.chiefComplaint }}</td>
                      <td class="py-2.5 px-3">
                        <span [class]="c.triageColor" class="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase">
                          {{ c.triageLevel }}
                        </span>
                      </td>
                      <td class="py-2.5 px-3">
                        <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-bold">
                          {{ c.parityAudit }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="border-t border-zinc-800 pt-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 font-mono">
          <div class="text-[11px] text-zinc-400">
            Shift Simulation Engine: <strong class="text-zinc-200">Pocket-Gull Doctor Resilience v2.4</strong>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button (click)="closeModal.emit()"
              class="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-orange-400/50">
              Close Simulation
            </button>
          </div>
        </div>

      </div>

    </div>
  `
})
export class DoctorShiftSimulatorComponent implements OnDestroy {
  closeModal = output<void>();

  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  currentPhaseIndex = signal<number>(0);
  isAutoPlaying = signal<boolean>(false);
  isAnalyticsFlipped = signal<boolean>(false);
  private lastAnalyticsFlipTime = 0;

  toggleAnalyticsFlip(event?: Event) {
    if (event) event.stopPropagation();
    const now = Date.now();
    if (now - this.lastAnalyticsFlipTime < 200) return;
    this.lastAnalyticsFlipTime = now;
    this.isAnalyticsFlipped.update(v => !v);
  }

  private autoPlayTimer: any = null;

  phases: IShiftPhase[] = [
    {
      id: 0,
      timeRange: '07:00 – 09:00',
      title: 'Inpatient Triage & Emergency Resuscitation',
      subtitle: 'Cardiology, Acute Renal Wards & Sentinel Triage Stream',
      patientCount: 6,
      fatigueBaseline: 35,
      fatigueShielded: 12,
      chartingHoursSaved: 0.5,
      apiSpend: 0.036,
      fhirBundles: 6,
      equityParityScore: 99.6,
      keyIntervention: 'Rapid 3D Spatial Lens organ inspection & Sentinel Triage level assignments (L1-RED resuscitation to L4-GREEN stable).',
      doctorWellnessTip: 'Perform 3 cycles of physiological sighing (double inhale through nose, long slow exhale through mouth) before high-stress ED consults.'
    },
    {
      id: 1,
      timeRange: '09:00 – 13:00',
      title: 'High-Density Outpatient Chronic Care',
      subtitle: 'Autoimmune, Circadian Disruption & Metabolic Consults',
      patientCount: 14,
      fatigueBaseline: 70,
      fatigueShielded: 24,
      chartingHoursSaved: 1.2,
      apiSpend: 0.084,
      fhirBundles: 14,
      equityParityScore: 99.4,
      keyIntervention: 'Double-Click Card Flips toggle Face A (high-density clinical telemetry) for clinician decision making and Face B (8th-grade reading level + 1 daily micro-habit) for patient counseling.',
      doctorWellnessTip: 'Double-click telemetry cards to activate Cognitive Load Shielding. Step into amber light entrainment between complex autoimmune consults.'
    },
    {
      id: 2,
      timeRange: '13:00 – 14:00',
      title: 'Multimodal Voice Dictation & SBAR Note Sync',
      subtitle: 'Gemini 3.6 Flash Voice Assistant, PubGemma 27B MeSH & Specialist Handoffs',
      patientCount: 2,
      fatigueBaseline: 82,
      fatigueShielded: 30,
      chartingHoursSaved: 0.4,
      apiSpend: 0.012,
      fhirBundles: 2,
      equityParityScore: 99.5,
      keyIntervention: 'Conversational Web Audio API dictation generates structured SBAR specialist briefs and populates FHIR R4 Bundles directly, saving 45 minutes of manual typing.',
      doctorWellnessTip: 'Hydrate with mineralized herbal decoction (suboccipital release) while reviewing voice assistant generated SBAR notes.'
    },
    {
      id: 3,
      timeRange: '14:00 – 17:00',
      title: 'HHS § 1557 Live Equity Audit & Multilingual Consults',
      subtitle: 'Limited English Proficiency (LEP) & Pediatric Cohorts',
      patientCount: 4,
      fatigueBaseline: 90,
      fatigueShielded: 35,
      chartingHoursSaved: 0.3,
      apiSpend: 0.024,
      fhirBundles: 4,
      equityParityScore: 99.4,
      keyIntervention: 'ACA Section 1557 Live Equity Check verifies zero race-adjusted multipliers (eGFR/VBAC) and streams 42-language translation for LEP family members.',
      doctorWellnessTip: '4-7-8 RSA diaphragmatic breathing break to maintain vagal baroreflex tone during complex pediatric multi-lingual family conferences.'
    },
    {
      id: 4,
      timeRange: '17:00 – 19:00',
      title: 'Zero-Backlog Shift Departure & Actuarial QALY Gain',
      subtitle: 'Final Chart Sign-off & Healthspan Projection',
      patientCount: 2,
      fatigueBaseline: 98,
      fatigueShielded: 40,
      chartingHoursSaved: 0.1,
      apiSpend: 0.012,
      fhirBundles: 2,
      equityParityScore: 99.6,
      keyIntervention: 'All 28 patient encounters completed with 0 home charting backlog ("pajama time eliminated"). Actuarial QALY biological age projections updated.',
      doctorWellnessTip: 'Shift complete! Zero un-signed charts. Enjoy 100% boundary separation between hospital and home life.'
    }
  ];

  currentPhase = computed(() => this.phases[this.currentPhaseIndex()]);

  cumulativePatients = computed(() => {
    return this.phases.slice(0, this.currentPhaseIndex() + 1).reduce((sum, p) => sum + p.patientCount, 0);
  });

  cumulativeHoursSaved = computed(() => {
    return Number(this.phases.slice(0, this.currentPhaseIndex() + 1).reduce((sum, p) => sum + p.chartingHoursSaved, 0).toFixed(1));
  });

  cumulativeApiSpend = computed(() => {
    return Number(this.phases.slice(0, this.currentPhaseIndex() + 1).reduce((sum, p) => sum + p.apiSpend, 0).toFixed(3));
  });

  patientCases: Record<number, IShiftPatientCase[]> = {
    0: [
      { id: 'sc01', time: '07:15 AM', patientName: 'Elena Rostova', ward: 'Cardiology W1', chiefComplaint: 'Acute substernal chest pressure, radiation to jaw', triageLevel: 'L1-RED', triageColor: 'bg-rose-950 text-rose-300 border border-rose-500/50', parityAudit: 'Pass (Optimal)' },
      { id: 'sc02', time: '07:45 AM', patientName: 'Marcus Vance', ward: 'Renal Unit R3', chiefComplaint: 'Acute oliguria, hyperkalemia (K+ 6.2)', triageLevel: 'L1-RED', triageColor: 'bg-rose-950 text-rose-300 border border-rose-500/50', parityAudit: 'Pass (Optimal)' },
      { id: 'sc03', time: '08:15 AM', patientName: 'Sarah Jenkins', ward: 'General Med', chiefComplaint: 'Post-op wound erythema & fever (101.8°F)', triageLevel: 'L2-ORANGE', triageColor: 'bg-orange-950 text-orange-300 border border-orange-500/50', parityAudit: 'Pass (Optimal)' },
      { id: 'sc04', time: '08:40 AM', patientName: 'David Kim', ward: 'Observation Unit', chiefComplaint: 'Syncope episode post-exertion, orthostatic drop', triageLevel: 'L3-YELLOW', triageColor: 'bg-amber-950 text-amber-300 border border-amber-500/50', parityAudit: 'Pass (Optimal)' }
    ],
    1: [
      { id: 'sc05', time: '09:15 AM', patientName: 'Alexander Vance', ward: 'Outpatient Clinic', chiefComplaint: 'L5-S1 radiculopathy, fatigue, circadian disruption', triageLevel: 'L3-YELLOW', triageColor: 'bg-amber-950 text-amber-300 border border-amber-500/50', parityAudit: 'Pass (Optimal)' },
      { id: 'sc06', time: '09:50 AM', patientName: 'Amara Okafor', ward: 'Outpatient Clinic', chiefComplaint: 'Hashimoto thyroiditis flare, brain fog, cold intolerance', triageLevel: 'L3-YELLOW', triageColor: 'bg-amber-950 text-amber-300 border border-amber-500/50', parityAudit: 'Pass (Optimal)' },
      { id: 'sc07', time: '10:30 AM', patientName: 'Robert Sterling', ward: 'Outpatient Clinic', chiefComplaint: 'Metabolic syndrome, HbA1c 7.8%, NAFLD suspicion', triageLevel: 'L4-GREEN', triageColor: 'bg-emerald-950 text-emerald-300 border border-emerald-500/50', parityAudit: 'Pass (Optimal)' },
      { id: 'sc08', time: '11:15 AM', patientName: 'Homo Sapiens (Female, Long COVID Dysautonomia)', ward: 'Outpatient Clinic', chiefComplaint: 'Long COVID dysautonomia, RSA vagal impairment', triageLevel: 'L3-YELLOW', triageColor: 'bg-amber-950 text-amber-300 border border-amber-500/50', parityAudit: 'Pass (Optimal)' }
    ],
    2: [
      { id: 'sc09', time: '13:15 PM', patientName: 'Dr. James Thorne', ward: 'Specialist Handoff', chiefComplaint: 'SBAR Dictation Sync: Cardiology Handoff for E. Rostova', triageLevel: 'L2-ORANGE', triageColor: 'bg-orange-950 text-orange-300 border border-orange-500/50', parityAudit: 'Pass (Optimal)' },
      { id: 'sc10', time: '13:40 PM', patientName: 'Dr. Maya Lin', ward: 'Specialist Handoff', chiefComplaint: 'SBAR Dictation Sync: Nephrology Consult for M. Vance', triageLevel: 'L2-ORANGE', triageColor: 'bg-orange-950 text-orange-300 border border-orange-500/50', parityAudit: 'Pass (Optimal)' }
    ],
    3: [
      { id: 'sc11', time: '14:20 PM', patientName: 'Lucia Ramirez (LEP)', ward: 'Multilingual Family', chiefComplaint: 'Pediatric asthma flare-up (Spanish Live Voice Sync)', triageLevel: 'L2-ORANGE', triageColor: 'bg-orange-950 text-orange-300 border border-orange-500/50', parityAudit: 'Pass (Optimal)' },
      { id: 'sc12', time: '15:10 PM', patientName: 'Chen Wei (LEP)', ward: 'Geriatric Consult', chiefComplaint: 'Frailty-index adjusted biomarker review (Mandarin Sync)', triageLevel: 'L3-YELLOW', triageColor: 'bg-amber-950 text-amber-300 border border-amber-500/50', parityAudit: 'Pass (Optimal)' }
    ],
    4: [
      { id: 'sc13', time: '17:15 PM', patientName: 'Hannah Abbott', ward: 'Final Sign-off', chiefComplaint: 'Routine Annual Longevity & Horvath Clock Review', triageLevel: 'L4-GREEN', triageColor: 'bg-emerald-950 text-emerald-300 border border-emerald-500/50', parityAudit: 'Pass (Optimal)' },
      { id: 'sc14', time: '18:00 PM', patientName: 'Shift Summary', ward: 'EHR Departure', chiefComplaint: '28/28 Charts Signed. Zero Pajama Time. Departure 18:15 PM', triageLevel: 'L4-GREEN', triageColor: 'bg-emerald-950 text-emerald-300 border border-emerald-500/50', parityAudit: 'Pass (Optimal)' }
    ]
  };

  activeCases = computed(() => {
    return this.patientCases[this.currentPhaseIndex()] || [];
  });

  stepNextPhase() {
    if (this.currentPhaseIndex() < this.phases.length - 1) {
      this.currentPhaseIndex.set(this.currentPhaseIndex() + 1);
    } else {
      this.stopAutoPlay();
    }
  }

  toggleAutoPlay() {
    if (this.isAutoPlaying()) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  startAutoPlay() {
    this.isAutoPlaying.set(true);
    if (this.currentPhaseIndex() === this.phases.length - 1) {
      this.currentPhaseIndex.set(0);
    }

    this.autoPlayTimer = setInterval(() => {
      if (this.currentPhaseIndex() < this.phases.length - 1) {
        this.currentPhaseIndex.set(this.currentPhaseIndex() + 1);
      } else {
        this.stopAutoPlay();
      }
    }, 2800);
  }

  stopAutoPlay() {
    this.isAutoPlaying.set(false);
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  resetShift() {
    this.stopAutoPlay();
    this.currentPhaseIndex.set(0);
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }
}
