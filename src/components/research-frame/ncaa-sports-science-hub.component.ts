import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  NcaaSportsScienceService, 
  NcaaDivisionTier, 
  CarnegieResearchTier, 
  ConferenceNetworkTier,
  INcaaBannedSubstanceCheck 
} from '../../services/ncaa-sports-science.service';
import { POCKETGULL_CORPORATE_IDENTITY } from '../../services/corporate-identity';

@Component({
  selector: 'app-ncaa-sports-science-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-2xl space-y-6">
      
      <!-- Top Banner with Siloed Division & Carnegie Selector -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <span>🏆</span>
            <span>NCAA Sports Science &amp; Collegiate Medicine Hub</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Intercollegiate Health, Concussion Telemetry &amp; Network Sports Science
          </h2>
          <p class="text-xs sm:text-sm text-stone-400 mt-1">
            Siloed clinical decision support, SCAT6 return-to-play workflows, and bioengineering pipelines for UW, Purdue, UO, Big Ten, and Pac-12 networks.
          </p>
        </div>

        <!-- Silo Boundary Security Pill -->
        <div class="bg-stone-950 px-4 py-3 rounded-2xl border border-stone-800 space-y-1">
          <div class="flex items-center justify-between gap-3 text-[10px] font-mono text-stone-400">
            <span>🔒 Silo Boundary:</span>
            <span class="text-teal-400 font-bold">{{ siloEnv().dataSiloBoundaryHash }}</span>
          </div>
          <div class="text-[10px] font-mono text-stone-500">
            IRB: <span class="text-stone-300">{{ siloEnv().irbProtocolNumber }}</span> | HIPAA 18-Element Safe Harbor
          </div>
        </div>
      </div>

      <!-- Silo Selection HUD (D1/D2/D3 & R1/R2/R3 & Networks) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-stone-950 rounded-2xl border border-stone-800">
        <!-- Division Silo -->
        <div class="space-y-1">
          <label class="text-[11px] font-mono text-stone-400">NCAA Competition Tier</label>
          <select 
            [ngModel]="service.selectedDivision()"
            (ngModelChange)="service.setDivision($event)"
            class="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500">
            <option value="D1">Division I (D1) — Elite National Competition</option>
            <option value="D2">Division II (D2) — Regional Balanced Scholar</option>
            <option value="D3">Division III (D3) — Preventative Academic Athlete</option>
          </select>
        </div>

        <!-- Carnegie Research Silo -->
        <div class="space-y-1">
          <label class="text-[11px] font-mono text-stone-400">Carnegie Research Classification</label>
          <select 
            [ngModel]="service.selectedResearchTier()"
            (ngModelChange)="service.setResearchTier($event)"
            class="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500">
            <option value="R1">R1: Very High Research Activity (UW, Purdue, UO)</option>
            <option value="R2">R2: High Research Activity (Applied Regional)</option>
            <option value="R3">R3: Master's / Undergraduate Collaborative</option>
          </select>
        </div>

        <!-- Broadcast Network Silo -->
        <div class="space-y-1">
          <label class="text-[11px] font-mono text-stone-400">Conference Broadcast Network</label>
          <select 
            [ngModel]="service.selectedNetwork()"
            (ngModelChange)="service.setNetwork($event)"
            class="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500">
            <option value="Big Ten Network (BTN)">Big Ten Network (BTN)</option>
            <option value="Pac-12 Network">Pac-12 Network</option>
            <option value="SEC Network">SEC Network / ESPN</option>
            <option value="ACC Network">ACC Network</option>
            <option value="NCAA Regional Hub">NCAA Regional Digital Studio</option>
          </select>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap gap-2 border-b border-stone-800 pb-2">
        <button
          type="button"
          (click)="activeTab.set('concussion')"
          [class.bg-amber-600]="activeTab() === 'concussion'"
          [class.text-white]="activeTab() === 'concussion'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 text-stone-300 hover:bg-stone-700 transition-all">
          🧠 SCAT6 Concussion &amp; Return-to-Play
        </button>

        <button
          type="button"
          (click)="activeTab.set('supplements')"
          [class.bg-amber-600]="activeTab() === 'supplements'"
          [class.text-white]="activeTab() === 'supplements'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 text-stone-300 hover:bg-stone-700 transition-all">
          🧪 NCAA Banned Substance &amp; NSF Screener
        </button>

        <button
          type="button"
          (click)="activeTab.set('workload')"
          [class.bg-amber-600]="activeTab() === 'workload'"
          [class.text-white]="activeTab() === 'workload'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 text-stone-300 hover:bg-stone-700 transition-all">
          ⚡ ACWR Workload &amp; Tendon Bio-Scaffolds
        </button>

        <button
          type="button"
          (click)="activeTab.set('circadian')"
          [class.bg-amber-600]="activeTab() === 'circadian'"
          [class.text-white]="activeTab() === 'circadian'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 text-stone-300 hover:bg-stone-700 transition-all">
          ✈️ Coast-to-Coast Circadian Flight Protocol
        </button>

        <button
          type="button"
          (click)="activeTab.set('broadcast')"
          [class.bg-amber-600]="activeTab() === 'broadcast'"
          [class.text-white]="activeTab() === 'broadcast'"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 text-stone-300 hover:bg-stone-700 transition-all">
          📺 Network Broadcast &amp; Grand Rounds Studio
        </button>
      </div>

      <!-- TAB 1: CONCUSSION SCAT6 PROTOCOL -->
      @if (activeTab() === 'concussion') {
        <div class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Stage Status Card -->
            <div class="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-amber-400">Current RTP Stage</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Stage {{ service.currentConcussionStage() }} of 6
                </span>
              </div>
              <div class="text-lg font-black text-white">
                {{ service.rtpStages[service.currentConcussionStage() - 1].name }}
              </div>
              <p class="text-xs text-stone-400">
                {{ service.rtpStages[service.currentConcussionStage() - 1].activityAllowed }}
              </p>
              <div class="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  (click)="service.advanceConcussionStage()"
                  [disabled]="service.currentConcussionStage() >= 6"
                  class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs">
                  Advance Stage &rarr;
                </button>
                <button
                  type="button"
                  (click)="service.resetConcussionProtocol()"
                  class="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs">
                  Reset
                </button>
              </div>
            </div>

            <!-- SCAT6 Score Matrix -->
            <div class="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <div class="text-xs font-bold text-stone-300">SCAT6 Total Symptom Score</div>
              <div class="text-3xl font-black text-teal-400">{{ service.scat6SymptomScore() }} <span class="text-xs text-stone-500 font-normal">/ 132</span></div>
              <div class="text-[11px] text-stone-400">
                Post-injury Day: <strong class="text-white">Day {{ service.daysPostConcussion() }}</strong>
              </div>
              <div class="p-2 rounded-lg bg-stone-900 border border-stone-800 text-[10px] font-mono text-stone-400">
                Vestibular-Ocular Motor Screening (VOMS): Passed (Smooth pursuit normal, saccades asymptomatic).
              </div>
            </div>

            <!-- Clinical Clearance Badge -->
            <div class="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <div class="text-xs font-bold text-stone-300">Physician Clearance Silo</div>
              <div class="text-xs text-stone-400">
                Governed by NCAA CSMAS &amp; Concussion Safety Protocol. Requires written sign-off from licensed team physician prior to Stage 5 full-contact.
              </div>
              <div class="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 pt-2">
                <span>🛡️</span>
                <span>Zero-Cloud PHI Egress Active</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: BANNED SUBSTANCE SCREENER -->
      @if (activeTab() === 'supplements') {
        <div class="space-y-4">
          <div class="flex gap-2">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearchSupplement()"
              placeholder="Search botanical supplement, OTC compound, or pre-workout (e.g. Tart Cherry, Synephrine, Creatine)..."
              class="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500" />
            <button
              type="button"
              (click)="onSearchSupplement()"
              class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs">
              Screen Compound
            </button>
          </div>

          @if (screenResult()) {
            <div 
              [class.border-red-500]="screenResult()?.isBannedByNcaa"
              [class.border-emerald-500]="!screenResult()?.isBannedByNcaa"
              class="p-5 rounded-2xl bg-stone-950 border space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ screenResult()?.isBannedByNcaa ? '🚫' : '✅' }}</span>
                  <span class="text-sm font-bold text-white">{{ screenResult()?.compound }}</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                    {{ screenResult()?.category }}
                  </span>
                </div>
                <span 
                  [class.text-red-400]="screenResult()?.isBannedByNcaa"
                  [class.text-emerald-400]="!screenResult()?.isBannedByNcaa"
                  class="text-xs font-mono font-bold">
                  {{ screenResult()?.isBannedByNcaa ? 'BANNED BY NCAA' : 'PERMITTED / SAFE' }}
                </span>
              </div>
              <p class="text-xs text-stone-300 leading-relaxed">{{ screenResult()?.clinicalAdvisory }}</p>
              <div class="flex items-center justify-between pt-2 border-t border-stone-800 text-[10px] font-mono text-stone-500">
                <span>Ref: {{ screenResult()?.evidenceReference }}</span>
                <span>NSF Certified: {{ screenResult()?.nsfCertifiedForSport ? 'Yes (Verified)' : 'No (Batch testing required)' }}</span>
              </div>
            </div>
          }
        </div>
      }

      <!-- TAB 3: WORKLOAD & TENDON BIO-SCAFFOLDS -->
      @if (activeTab() === 'workload') {
        <div class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div class="p-4 rounded-2xl bg-stone-950 border border-stone-800">
              <div class="text-[10px] font-mono text-stone-500">7-Day Acute Load</div>
              <div class="text-2xl font-black text-white mt-1">{{ workload().acuteWorkload7Day }} <span class="text-xs text-stone-500 font-normal">AU</span></div>
            </div>
            <div class="p-4 rounded-2xl bg-stone-950 border border-stone-800">
              <div class="text-[10px] font-mono text-stone-500">28-Day Chronic Load</div>
              <div class="text-2xl font-black text-white mt-1">{{ workload().chronicWorkload28Day }} <span class="text-xs text-stone-500 font-normal">AU</span></div>
            </div>
            <div class="p-4 rounded-2xl bg-stone-950 border border-stone-800">
              <div class="text-[10px] font-mono text-stone-500">ACWR Ratio</div>
              <div class="text-2xl font-black text-teal-400 mt-1">{{ workload().acwr }}</div>
              <div class="text-[10px] text-stone-400 mt-0.5">{{ workload().injuryRiskTier }}</div>
            </div>
            <div class="p-4 rounded-2xl bg-stone-950 border border-stone-800">
              <div class="text-[10px] font-mono text-stone-500">Autonomic HRV</div>
              <div class="text-2xl font-black text-emerald-400 mt-1">{{ workload().autonomicHrvScoreMs }} <span class="text-xs text-stone-500 font-normal">ms</span></div>
            </div>
          </div>

          <!-- UO Knight Campus Bioengineering Integration Box -->
          <div class="p-5 rounded-2xl bg-stone-950 border border-teal-500/30 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <span>🧬</span>
                <span>University of Oregon Knight Campus — 3D Bioprinted Tendon Scaffold Model</span>
              </span>
              <span class="text-[10px] font-mono text-stone-500">Young's Modulus: 1.2 GPa</span>
            </div>
            <p class="text-xs text-stone-300 leading-relaxed">
              Based on the student-athlete's ACWR ({{ workload().acwr }}), collegiate Achilles and patellar tendon tensile strain is modeled within the physiological remodeling window. Collagen fiber alignment velocity: <strong>+14.2% / week</strong>.
            </p>
            <div class="text-[11px] font-mono text-stone-400">
              Silo Directive: {{ workload().recoveryGuideline }}
            </div>
          </div>
        </div>
      }

      <!-- TAB 4: COAST-TO-COAST CIRCADIAN FLIGHT PROTOCOL -->
      @if (activeTab() === 'circadian') {
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-3 p-4 bg-stone-950 rounded-2xl border border-stone-800">
            <span class="text-xs text-stone-400">Flight Route:</span>
            <button
              type="button"
              (click)="originTz.set('PST'); destTz.set('EST')"
              [class.bg-teal-600]="originTz() === 'PST' && destTz() === 'EST'"
              class="px-3 py-1 rounded-lg text-xs font-semibold bg-stone-900 border border-stone-700 text-white">
              West-to-East (UW/UO &rarr; Purdue/Big Ten East: +3h)
            </button>
            <button
              type="button"
              (click)="originTz.set('EST'); destTz.set('PST')"
              [class.bg-teal-600]="originTz() === 'EST' && destTz() === 'PST'"
              class="px-3 py-1 rounded-lg text-xs font-semibold bg-stone-900 border border-stone-700 text-white">
              East-to-West (Purdue &rarr; UW/UO: -3h)
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <div class="text-xs font-bold text-amber-400">☀️ Light Exposure &amp; Melatonin Timing</div>
              <p class="text-xs text-stone-300">{{ travelPlan().lightExposureWindow }}</p>
              <p class="text-xs text-stone-400">{{ travelPlan().melatoninRecommendation }}</p>
            </div>
            <div class="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <div class="text-xs font-bold text-teal-400">💧 In-Flight Hydration &amp; Peak Performance</div>
              <p class="text-xs text-stone-300">Target Fluid Intake: <strong>{{ travelPlan().hydrationPlanMlPerHour }} mL / hour</strong></p>
              <p class="text-xs text-stone-400">Optimal Training Window: <strong>{{ travelPlan().optimalTrainingWindow }}</strong></p>
            </div>
          </div>
        </div>
      }

      <!-- TAB 5: BROADCAST NETWORK & GRAND ROUNDS STUDIO -->
      @if (activeTab() === 'broadcast') {
        <div class="space-y-4">
          <div class="p-5 rounded-2xl bg-gradient-to-r from-stone-950 to-stone-900 border border-stone-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white flex items-center gap-2">
                <span>📺</span>
                <span>{{ service.selectedNetwork() }} Educational Broadcast Telemetry Feed</span>
              </span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                100% De-Identified Telemetry
              </span>
            </div>
            <p class="text-xs text-stone-300 leading-relaxed">
              Provides television graphics packages, in-game medical graphics, and academic Grand Rounds presentations with aggregate physiological force curves and recovery indices with zero protected health information.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            @for (partner of service.academicPartners(); track partner.id) {
              <div class="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">{{ partner.division }} | {{ partner.researchTier }}</span>
                  <span class="text-[10px] font-mono text-amber-400">{{ partner.conference }}</span>
                </div>
                <h4 class="text-xs font-bold text-white">{{ partner.name }}</h4>
                <p class="text-[11px] text-stone-400 line-clamp-2">{{ partner.researchFocus }}</p>
                <div class="text-[10px] font-mono text-teal-400 pt-1">{{ partner.flagshipLab }}</div>
              </div>
            }
          </div>
        </div>
      }

    </div>
  `
})
export class NcaaSportsScienceHubComponent {
  readonly service = inject(NcaaSportsScienceService);
  readonly corporate = POCKETGULL_CORPORATE_IDENTITY;

  activeTab = signal<'concussion' | 'supplements' | 'workload' | 'circadian' | 'broadcast'>('concussion');
  searchQuery = 'tart cherry extract';
  screenResult = signal<INcaaBannedSubstanceCheck | null>(null);

  originTz = signal<'PST' | 'MST' | 'CST' | 'EST'>('PST');
  destTz = signal<'PST' | 'MST' | 'CST' | 'EST'>('EST');

  readonly siloEnv = computed(() => this.service.activeSiloEnvironment());
  readonly workload = computed(() => this.service.workloadAnalysis());
  readonly travelPlan = computed(() => this.service.computeCircadianTravelPlan(this.originTz(), this.destTz()));

  constructor() {
    this.screenResult.set(this.service.screenSupplement('tart cherry extract'));
  }

  onSearchSupplement(): void {
    if (this.searchQuery.trim()) {
      this.screenResult.set(this.service.screenSupplement(this.searchQuery));
    }
  }
}
