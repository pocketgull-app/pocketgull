import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BiomedicalSuiteComponent } from './biomedical-suite.component';
import { TherapeuticsSuiteComponent } from './therapeutics-suite.component';
import { NutritionSuiteComponent } from './nutrition-suite.component';
import { RecoverySuiteComponent } from './recovery-suite.component';
import { TuringSuiteComponent } from '../turing/turing-suite.component';
import { NobelLaureatesSuiteComponent } from '../nobel/nobel-laureates-suite.component';
import { AaasBreakthroughsSuiteComponent } from '../aaas/aaas-breakthroughs-suite.component';
import { LaskerBreakthroughSuiteComponent } from '../lasker/lasker-breakthrough-suite.component';
import { EasternTcmSuiteComponent } from '../eastern/eastern-tcm-suite.component';
import { AyurvedicSystemsSuiteComponent } from '../ayurvedic/ayurvedic-systems-suite.component';
import { UnifiedParadigmSynthesizerComponent } from './master-paradigm-synthesizer.component';
import { BiochemicalSuiteComponent } from '../biochemical-suite.component';
import { PublicHealthSentinelSuiteComponent } from '../public-health-sentinel-suite.component';
import { OccupationalHazardCardComponent } from '../occupational-hazard-card.component';
import { FoodSafetyGuardrailCardComponent } from '../food-safety-guardrail-card.component';
import { PatientStateService } from '../../services/patient-state.service';
import { CircadianSleepinessService } from '../../services/circadian-sleepiness.service';
import { ThemeService } from '../../services/theme.service';

export type DomainSuiteId = 'biomedical' | 'biochemical' | 'public_health' | 'therapeutics' | 'nutrition' | 'recovery' | 'turing' | 'nobel' | 'aaas' | 'lasker' | 'eastern_tcm' | 'ayurvedic_systems';

export interface IDomainSuite {
  id: DomainSuiteId;
  name: string;
  subtitle: string;
  icon: string;
  badge: string;
}

@Component({
  selector: 'app-domain-suites-navigator',
  standalone: true,
  imports: [
    CommonModule,
    BiomedicalSuiteComponent,
    TherapeuticsSuiteComponent,
    NutritionSuiteComponent,
    RecoverySuiteComponent,
    TuringSuiteComponent,
    NobelLaureatesSuiteComponent,
    AaasBreakthroughsSuiteComponent,
    LaskerBreakthroughSuiteComponent,
    EasternTcmSuiteComponent,
    AyurvedicSystemsSuiteComponent,
    UnifiedParadigmSynthesizerComponent,
    OccupationalHazardCardComponent,
    FoodSafetyGuardrailCardComponent,
    BiochemicalSuiteComponent,
    PublicHealthSentinelSuiteComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full mb-10 space-y-6 font-sans">
      
      <!-- Clinician KSS Alert Banner if Fatigue Detected -->
      <div *ngIf="clinicianKss() >= 7" 
           class="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-300 flex items-center justify-between shadow-lg backdrop-blur-md">
        <div class="flex items-center gap-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wider">Clinician Fatigue Protocol Active (KSS Level {{ clinicianKss() }})</h4>
            <p class="text-xs opacity-90">Karolinska Sleepiness Scale indicates elevated cognitive fatigue. Multi-lens AI cross-validation is engaged for diagnostic safety.</p>
          </div>
        </div>
        <div class="text-right border-l border-amber-500/20 pl-4">
          <span class="text-[10px] uppercase font-bold tracking-widest text-amber-400/80 block">Safety Guard</span>
          <strong class="text-amber-400 text-sm font-bold">Score {{ clinicianKss() }}</strong>
        </div>
      </div>

      <!-- Top Ground Truth Telemetry Instrument Panel (Dieter Rams Braun Aesthetic) -->
      <div class="p-4 sm:p-5 rounded-lg bg-zinc-900 text-white border border-zinc-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
        <div class="flex items-center gap-3">
          <span class="w-2.5 h-2.5 rounded-sm bg-emerald-500 animate-pulse"></span>
          <div>
            <span class="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Unified Patient Ground Truth</span>
            <h2 class="text-base font-bold text-white flex items-center gap-2">
              <span>{{ activePatientName() }}</span>
              <span class="text-xs font-normal text-zinc-400">({{ activePatientAge() }} y/o {{ activePatientGender() }})</span>
            </h2>
          </div>
        </div>

        <!-- Telemetry Instrument Cells (Grid Structured, High Contrast) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div class="px-3 py-2 rounded-md bg-zinc-950 text-zinc-300 border border-zinc-800 flex flex-col">
            <span class="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Blood Pressure</span>
            <strong class="text-emerald-400 text-sm font-bold">{{ vitals().bp || '120/80' }}</strong>
          </div>
          <div class="px-3 py-2 rounded-md bg-zinc-950 text-zinc-300 border border-zinc-800 flex flex-col">
            <span class="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Heart Rate</span>
            <strong class="text-emerald-400 text-sm font-bold">{{ vitals().hr || 72 }} bpm</strong>
          </div>
          <div class="px-3 py-2 rounded-md bg-zinc-950 text-zinc-300 border border-zinc-800 flex flex-col">
            <span class="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">SpO2 Saturation</span>
            <strong class="text-emerald-400 text-sm font-bold">{{ vitals().spO2 || '98%' }}</strong>
          </div>
          <div class="px-3 py-2 rounded-md bg-zinc-950 text-zinc-300 border border-zinc-800 flex flex-col">
            <span class="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">KSS Readiness</span>
            <strong class="text-amber-400 text-sm font-bold">Score {{ clinicianKss() }}</strong>
          </div>
        </div>
      </div>

      <!-- 10-Dimensional Unified Synthesizer Overview -->
      <app-unified-paradigm-synthesizer />

      <!-- Occupational Healthspan & 10D Hazard Profile Card (Smart Conditional Display) -->
      @if (showAllSuites() || hasOccupationalData()) {
        <app-occupational-hazard-card />
      }

      <!-- Food-Drug & Patient State Safety Matrix Card (Smart Conditional Display) -->
      @if (showAllSuites() || hasFoodSafetyAlerts()) {
        <app-food-safety-guardrail-card />
      }

      <!-- Domain Suite Tab Navigation Bar (Dieter Rams Rectangular Precision) -->
      <div 
        role="tablist" 
        aria-label="Clinical Domain Suites Navigation"
        class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        
        <!-- Structural Functional Tabs (No Pills - Clean Edge Geometry) -->
        <div class="flex flex-wrap items-center gap-1 font-mono">
          @for (suite of displayedSuites(); track suite.id) {
            <button 
              role="tab"
              [attr.aria-selected]="activeSuite() === suite.id"
              [attr.aria-controls]="'suite-panel-' + suite.id"
              (click)="activeSuite.set(suite.id)"
              [class]="activeSuite() === suite.id
                ? 'min-h-[44px] px-4 py-2.5 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs shadow-sm flex items-center gap-2 border-b-2 border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
                : 'min-h-[44px] px-3.5 py-2.5 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-2 border-b-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'">
              <span>{{ suite.icon }}</span>
              <span>{{ suite.name }}</span>
            </button>
          }

          <button 
            (click)="toggleShowAllSuites()"
            aria-label="Toggle all domain suite paradigms view"
            class="min-h-[44px] px-3.5 py-2.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 text-xs font-mono font-bold transition flex items-center gap-1.5 border border-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <span>{{ showAllSuites() ? '⚡ High-Signal Only' : '🔍 All Paradigms (10)' }}</span>
          </button>
        </div>

        <!-- Paradigm Diff Mode Toggle -->
        <div class="flex items-center gap-2 font-mono text-xs border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-2 md:pt-0 md:pl-4">
          <span class="text-zinc-500 font-bold uppercase text-[10px]">Paradigm Diff:</span>
          <button 
            (click)="toggleParadigmDiff()"
            aria-label="Toggle paradigm differential mode"
            [class]="showParadigmDiff() 
              ? 'min-h-[36px] px-3 py-1.5 rounded-md bg-orange-600 text-white font-bold transition shadow-sm focus-visible:ring-2 focus-visible:ring-orange-500'
              : 'min-h-[36px] px-3 py-1.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold transition focus-visible:ring-2 focus-visible:ring-emerald-500'">
            {{ showParadigmDiff() ? '⚡ Diff Active' : 'Off (Full Lens)' }}
          </button>
        </div>
      </div>

      <!-- Paradigm Diff Notice Banner -->
      @if (showParadigmDiff()) {
        <div class="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-950 dark:text-orange-200 text-xs font-mono flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div class="flex items-center gap-2.5">
            <span class="text-lg">⚡</span>
            <div>
              <strong class="font-extrabold uppercase">Paradigm Diff Overlay Active (Zero Content Duplication)</strong>
              <p class="text-[11px] opacity-80 mt-0.5 font-sans">
                Suppressing baseline vitals and history repetition. Rendering exclusively novel paradigm-specific differentials for <strong class="uppercase text-orange-600 dark:text-orange-400">{{ activePhilosophy() }}</strong> mode.
              </p>
            </div>
          </div>
        </div>
      }

      <!-- Active Suite Component View -->
      <div [id]="'suite-panel-' + activeSuite()" role="tabpanel" class="animate-in fade-in duration-300">
        @switch (activeSuite()) {
          @case ('biomedical') { <app-biomedical-suite /> }
          @case ('biochemical') { <app-biochemical-suite /> }
          @case ('public_health') { <app-public-health-sentinel-suite /> }
          @case ('therapeutics') { <app-therapeutics-suite /> }
          @case ('nutrition') { <app-nutrition-suite /> }
          @case ('recovery') { <app-recovery-suite /> }
          @case ('turing') { <app-turing-suite /> }
          @case ('nobel') { <app-nobel-laureates-suite /> }
          @case ('aaas') { <app-aaas-breakthroughs-suite /> }
          @case ('lasker') { <app-lasker-breakthrough-suite /> }
          @case ('eastern_tcm') { <app-eastern-tcm-suite /> }
          @case ('ayurvedic_systems') { <app-ayurvedic-systems-suite /> }
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: auto; overflow: visible; }
  `]
})
export class DomainSuitesNavigatorComponent {
  private patientState = inject(PatientStateService);
  private kssService = inject(CircadianSleepinessService);
  private themeService = inject(ThemeService);

  activeSuite = signal<DomainSuiteId>('biomedical');
  showParadigmDiff = signal<boolean>(false);
  showAllSuites = signal<boolean>(false);

  activePhilosophy = this.patientState.activePhilosophy;
  vitals = this.patientState.vitals;
  activePatientName = this.patientState.patientName;
  activePatientAge = this.patientState.patientAge;
  activePatientGender = this.patientState.patientGender;
  hasOccupationalData = this.patientState.hasOccupationalData;
  hasFoodSafetyAlerts = computed(() => {
    const meds = this.patientState.medications() || [];
    const proto = this.patientState.dietaryProtocol() || '';
    const vitals = this.patientState.vitals();
    return meds.length > 0 || proto.trim().length > 0 || !!vitals.bp;
  });
  clinicianKss = computed(() => this.kssService.clinicianKss() || 1);

  suites: IDomainSuite[] = [
    { id: 'biomedical', name: 'Biomedical & Diagnostic', subtitle: 'Ground Truth Telemetry', icon: '🩺', badge: 'Lab & Vitals' },
    { id: 'biochemical', name: 'Biochemical & Molecular', subtitle: 'Genomics & Pathways', icon: '🧬', badge: 'Genomics' },
    { id: 'public_health', name: 'WHO / CDC Public Health', subtitle: 'Epidemiological & EWARS', icon: '📡', badge: 'Surveillance' },
    { id: 'therapeutics', name: 'Therapeutics & Botanical', subtitle: 'Precision Formulas', icon: '🌿', badge: 'Nutrients & Herbs' },
    { id: 'nutrition', name: 'Nutritional & Metabolic', subtitle: 'Circadian Meal Planning', icon: '🥗', badge: 'Thermal Matrix' },
    { id: 'recovery', name: 'Kinetic & Recovery', subtitle: '120 BPM Entrainment', icon: '⚡', badge: 'Vagal & Playbook' },
    { id: 'turing', name: 'Turing Formal Logic', subtitle: 'Cellular Automata & Petri Net Deadlock Models', icon: '🧮', badge: 'Turing' },
    { id: 'nobel', name: 'Nobel Evidence Engine', subtitle: 'Ohsumi, Hall & Pääbo Breakthrough Models', icon: '🏆', badge: 'Nobel' },
    { id: 'aaas', name: 'AAAS Science Breakthroughs', subtitle: 'GLP-1 Incretin & SCFA Gut-Brain Vagal Models', icon: '🔬', badge: 'AAAS' },
    { id: 'lasker', name: 'Lasker & Breakthrough', subtitle: 'mRNA LNP & PIEZO1/2 Mechanosensory Models', icon: '🏛️', badge: 'Lasker' },
    { id: 'eastern_tcm', name: 'Eastern TCM Jing-Luo', subtitle: '12 Meridians & Pulse/Tongue Diagnostics', icon: '☯️', badge: 'TCM' },
    { id: 'ayurvedic_systems', name: 'Ayurvedic Tridosha', subtitle: 'Vata/Pitta/Kapha Ratios & Agni Fire', icon: '🪷', badge: 'Ayurveda' }
  ];

  displayedSuites = computed(() => {
    if (this.showAllSuites()) {
      return this.suites;
    }
    const phil = this.activePhilosophy();
    if (phil === 'eastern') {
      return this.suites.filter(s => s.id === 'eastern_tcm' || s.id === 'biochemical' || s.id === 'biomedical' || s.id === 'therapeutics');
    }
    if (phil === 'ayurvedic') {
      return this.suites.filter(s => s.id === 'ayurvedic_systems' || s.id === 'biochemical' || s.id === 'therapeutics' || s.id === 'nutrition');
    }
    return this.suites.filter(s => s.id === 'biomedical' || s.id === 'biochemical' || s.id === 'public_health' || s.id === 'therapeutics' || s.id === 'nutrition' || s.id === 'recovery');
  });

  toggleParadigmDiff() {
    this.showParadigmDiff.set(!this.showParadigmDiff());
  }

  toggleShowAllSuites() {
    this.showAllSuites.set(!this.showAllSuites());
  }
}
