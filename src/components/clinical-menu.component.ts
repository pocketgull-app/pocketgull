import { Component, ChangeDetectionStrategy, signal, computed, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export interface IClinicalMenuItem {
  id: string;
  emoji: string;
  name: string;
  category: 'Starter' | 'Main Course' | 'Therapeutic Elixir' | 'Restorative Tonic';
  description: string;
  tcmEnergetics: 'Warming' | 'Cooling' | 'Neutral';
  ayurvedicDosha: 'Vata Pacifying' | 'Pitta Pacifying' | 'Kapha Pacifying' | 'Tridoshic';
  glycemicIndex: number;
  activeCompounds: { name: string; dose: string }[];
  clinicalRationale: string;
  ramsDesignPrinciple: string;
  targetConditions: string[];
}

import { PantryLazySusanComponent } from './pantry-lazy-susan.component';
import { ChronoClockDecisionRailComponent } from './chrono-clock-decision-rail.component';
import { MobileMenuQrModalComponent } from './modals/mobile-menu-qr-modal.component';
import { ChronoWeeklyMealPlannerComponent } from './chrono-weekly-meal-planner.component';

@Component({
  selector: 'app-clinical-menu',
  standalone: true,
  imports: [CommonModule, PantryLazySusanComponent, ChronoClockDecisionRailComponent, MobileMenuQrModalComponent, ChronoWeeklyMealPlannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,



  template: `
    <div class="mb-8 mt-4 bg-zinc-900/5 dark:bg-black/40 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-xl relative overflow-hidden font-sans">
      
      <!-- Dieter Rams Braun Industrial Design Minimal Banner -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div class="flex items-center gap-3">
            <!-- Orange accent dot (classic Braun T3 radio power indicator) -->
            <span class="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)] animate-pulse"></span>
            <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase font-mono">
              Dieter Rams Clinical Culinary Menu
            </h2>
            <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono tracking-widest uppercase">
              Weniger, aber besser
            </span>
          </div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 font-mono">
            Precision Nutrition Engine — Calibrated for <strong>{{ activePatientName() }}</strong>
          </p>
        </div>

        <!-- Category Filters & Mobile QR Trigger -->
        <div class="flex flex-wrap items-center gap-2">
          <button (click)="isQrModalOpen.set(true)"
            class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95">
            <span>📱</span>
            <span>Scan Mobile Menu QR</span>
          </button>

          @for (cat of categories; track cat) {
            <button (click)="selectedCategory.set(cat)"
              [class.bg-zinc-900]="selectedCategory() === cat"
              [class.text-white]="selectedCategory() === cat"
              [class.dark:bg-zinc-100]="selectedCategory() === cat"
              [class.dark:text-zinc-950]="selectedCategory() === cat"
              [class.bg-zinc-100]="selectedCategory() !== cat"
              [class.text-zinc-600]="selectedCategory() !== cat"
              [class.dark:bg-zinc-800/80]="selectedCategory() !== cat"
              [class.dark:text-zinc-400]="selectedCategory() !== cat"
              class="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700">
              {{ cat }}
            </button>
          }
        </div>

      </div>

      <!-- 3D Lazy Susan Pantry & Procedural Plate Visualizer -->
      <div class="mb-8">
        <app-pantry-lazy-susan 
          [items]="menuItems" 
          [selectedItem]="selectedMenuItem()" 
          (itemSelect)="on3dItemSelect($event)">
        </app-pantry-lazy-susan>
      </div>

      <!-- Chrono-Nutrition Circadian Clock & Decision Rail -->
      <app-chrono-clock-decision-rail></app-chrono-clock-decision-rail>

      <!-- 7-Day Chrono-Nutrition Meal Planner & Regional Sourcing -->
      <app-chrono-weekly-meal-planner></app-chrono-weekly-meal-planner>

      <!-- Patient Precision Health Data Context Callout -->
      <div class="mb-8 bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-indigo-500/10 dark:from-emerald-950/40 dark:via-sky-950/40 dark:to-indigo-950/40 p-4 rounded-2xl border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono">


        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-zinc-900 dark:text-zinc-100 uppercase">👤 Patient Health Telemetry Match:</span>
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
              {{ activePatientName() }} (Age {{ patientState.patientAge() || 45 }})
            </span>
          </div>
          <p class="text-zinc-600 dark:text-zinc-400 text-[11px]">
            Vitals & Conditions Analyzed: 
            <span class="text-zinc-800 dark:text-zinc-200 font-bold">
              {{ patientState.vitals().bp ? 'BP ' + patientState.vitals().bp + ' | ' : '' }}
              {{ patientState.vitals().hr ? 'HR ' + patientState.vitals().hr + ' bpm | ' : '' }}
              {{ activePatientConditions().join(', ') || 'Metabolic Optimization' }}
            </span>
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            ⚡ Dynamic Health Telemetry Matching Active
          </span>
        </div>
      </div>

      <!-- Clinical Menu Items Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (item of filteredMenuItems(); track item.id) {
          @let match = evaluatePatientMatch(item);
          <div class="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl p-6 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            [class.ring-2]="match.score >= 85"
            [class.ring-emerald-500/40]="match.score >= 85"
            [class.dark:ring-emerald-400/30]="match.score >= 85">
            
            <div>
              <!-- Course Badge, Patient Match Badge & Translucent Emoji Clinical Pill -->
              <div class="flex items-center justify-between gap-3 mb-4">
                <span class="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  {{ item.category }}
                </span>

                <div class="flex items-center gap-2">
                  <!-- Patient Precision Match Badge -->
                  <div class="px-2.5 py-1 rounded-full text-[11px] font-mono font-extrabold uppercase tracking-wider"
                    [class]="match.score >= 85 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' :
                             match.score >= 60 ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'">
                    🎯 {{ match.score }}% Patient Match
                  </div>

                  <!-- Translucent Emoji Badge (Inline Glassmorphism Style) -->
                  <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-900 dark:text-emerald-200 border border-emerald-500/20 backdrop-blur-md font-mono text-xs shadow-sm">
                    <span class="text-base group-hover:scale-125 transition-transform duration-300">{{ item.emoji }}</span>
                    <span class="font-bold tracking-tight">GI: {{ item.glycemicIndex }}</span>
                  </div>
                </div>
              </div>

              <!-- Item Name & Rationale -->
              <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight flex items-center gap-2">
                {{ item.name }}
              </h3>
              <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                {{ item.description }}
              </p>

              <!-- Patient Specific Match Rationale -->
              <div class="mb-4 p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
                <span class="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">🧬 Health Data Alignment for {{ activePatientName() }}:</span>
                <span>{{ match.reason }}</span>
              </div>

              <!-- Active Targeted Compounds Pills -->
              <div class="flex flex-wrap items-center gap-1.5 mb-4">
                @for (c of item.activeCompounds; track c.name) {
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
                    <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ c.name }}:</span>
                    <span class="text-zinc-500 dark:text-zinc-400">{{ c.dose }}</span>
                  </span>
                }
              </div>

              <!-- Thermal & Energetic Diagnostics -->
              <div class="grid grid-cols-2 gap-3 mb-4 p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-100 dark:border-zinc-850/80 text-[11px] font-mono">
                <div>
                  <span class="block text-zinc-400 dark:text-zinc-500 font-bold uppercase text-[9px]">TCM Thermal Quality</span>
                  <span class="font-bold"
                    [class.text-amber-600]="item.tcmEnergetics === 'Warming'"
                    [class.dark:text-amber-400]="item.tcmEnergetics === 'Warming'"
                    [class.text-sky-600]="item.tcmEnergetics === 'Cooling'"
                    [class.dark:text-sky-400]="item.tcmEnergetics === 'Cooling'"
                    [class.text-emerald-600]="item.tcmEnergetics === 'Neutral'"
                    [class.dark:text-emerald-400]="item.tcmEnergetics === 'Neutral'">
                    🔥 {{ item.tcmEnergetics }}
                  </span>
                </div>
                <div>
                  <span class="block text-zinc-400 dark:text-zinc-500 font-bold uppercase text-[9px]">Ayurvedic Constitution</span>
                  <span class="font-bold text-purple-600 dark:text-purple-400">
                    🌿 {{ item.ayurvedicDosha }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Clinical Rationale & Prescribe Action -->
            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-[11px]">
              <div class="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 italic flex-1">
                Rams Axiom: {{ item.ramsDesignPrinciple }}
              </div>
              <button (click)="prescribeMeal(item)"
                class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-[11px] uppercase tracking-wider transition shadow-sm active:scale-95 cursor-pointer whitespace-nowrap">
                ➕ Prescribe Meal
              </button>
            </div>

          </div>
        }
      </div>

      <!-- Emoji Translucent Badge Showcase Ribbon -->
      <div class="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <h4 class="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
          Unicode Nutrition & Clinical Emoji Badge Design System
        </h4>
        <div class="flex flex-wrap items-center gap-2">
          @for (badge of emojiBadges; track badge.emoji) {
            <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm backdrop-blur-md hover:border-indigo-500/40 transition-colors">
              <span class="text-lg">{{ badge.emoji }}</span>
              <div class="flex flex-col font-mono text-[10px]">
                <span class="font-bold text-zinc-800 dark:text-zinc-200 leading-none">{{ badge.label }}</span>
                <span class="text-zinc-400 dark:text-zinc-500 text-[9px] leading-tight">{{ badge.pathway }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Mobile QR Code Scanner Modal -->
      @if (isQrModalOpen()) {
        <app-mobile-menu-qr-modal
          [menuItems]="menuItems"
          (closeModal)="isQrModalOpen.set(false)">
        </app-mobile-menu-qr-modal>
      }

    </div>
  `
})
export class ClinicalMenuComponent {
  reportText = input<string>('');
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  isQrModalOpen = signal<boolean>(false);

  categories = ['All Courses', 'Starters', 'Mains', 'Elixirs', 'Tonics'];

  selectedCategory = signal<string>('All Courses');

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Active Patient';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Active Patient';
  });

  activePatientConditions = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return ['Metabolic Health'];
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient?.preexistingConditions || ['Cardiovascular Health', 'Inflammation Control'];
  });

  emojiBadges = [
    { emoji: '🥑', label: 'Avocado', pathway: 'Monounsaturated Fats & Glutathione' },
    { emoji: '🫐', label: 'Wild Blueberry', pathway: 'Anthocyanin HPA Axis Support' },
    { emoji: '🍣', label: 'Wild Salmon', pathway: 'Omega-3 EPA/DHA Resolution' },
    { emoji: '🫖', label: 'Ginger Lemongrass', pathway: 'Gingerol Agni Fire Activation' },
    { emoji: '🥦', label: 'Steamed Broccoli', pathway: 'Sulforaphane Nrf2 Phase II Detox' },
    { emoji: '🍋', label: 'Meyer Lemon', pathway: 'Ascorbate & Collagen Hydroxylation' },
    { emoji: '🫘', label: 'Black Sesame & Beans', pathway: 'Kidney Jing Essence Tonification' },
    { emoji: '🫚', label: 'Fresh Turmeric Root', pathway: 'Curcuminoid NF-kB Downregulation' },
    { emoji: '🫒', label: 'EV Olive Oil', pathway: 'Oleocanthal Anti-Inflammatory' },
    { emoji: '🧅', label: 'Red Onion & Garlic', pathway: 'Quercetin & Allicin Barrier Integrity' }
  ];

  menuItems: IClinicalMenuItem[] = [
    {
      id: 'menu-1',
      emoji: '🥑',
      name: 'Cold-Pressed Extra Virgin Olive Oil & Avocado Carpaccio',
      category: 'Starter',
      description: 'Thinly sliced Hass avocado drizzled with single-estate polyphenolic extra virgin olive oil, wild sea salt, and toasted black sesame seeds.',
      tcmEnergetics: 'Neutral',
      ayurvedicDosha: 'Vata Pacifying',
      glycemicIndex: 15,
      targetConditions: ['Diabetes', 'Hypertension', 'Hyperlipidemia', 'Cardiovascular', 'Vata'],
      activeCompounds: [
        { name: 'Oleic Acid (Omega-9)', dose: '14g' },
        { name: 'Glutathione', dose: '150mg' },
        { name: 'Sesamin Lignans', dose: '45mg' }
      ],
      clinicalRationale: 'Provides high-density monounsaturated fatty acids to stabilize cell membrane fluidity, reduce postprandial glycemic spikes, and nourish TCM Liver Blood.',
      ramsDesignPrinciple: 'Useful — Every ingredient serves a direct cell-membrane stabilization purpose without empty calories.'
    },
    {
      id: 'menu-2',
      emoji: '🍣',
      name: 'Wild Alaskan Salmon with Turmeric-Ginger Infusion & Steamed Bok Choy',
      category: 'Main Course',
      description: 'Pan-seared wild sockeye salmon over steamed Shanghai bok choy, finished with fresh grated turmeric root, cracked black pepper, and microgreens.',
      tcmEnergetics: 'Warming',
      ayurvedicDosha: 'Pitta Pacifying',
      glycemicIndex: 0,
      targetConditions: ['Inflammation', 'Pain', 'Cardiovascular', 'Fatigue', 'Arthritis'],
      activeCompounds: [
        { name: 'Omega-3 EPA/DHA', dose: '2.4g' },
        { name: 'Curcuminoids', dose: '500mg' },
        { name: 'Piperine Synergy', dose: '15mg' }
      ],
      clinicalRationale: 'Promotes active resolution of systemic tissue inflammation via Specialized Pro-Resolving Mediators (SPMs) and downregulates NF-kB transcription.',
      ramsDesignPrinciple: 'Honest — Direct biochemical synergy (Piperine + Curcumin) maximizing natural bio-availability.'
    },
    {
      id: 'menu-3',
      emoji: '🫖',
      name: 'Gingerol-Rich Lemongrass & Raw Manuka Decoction',
      category: 'Therapeutic Elixir',
      description: 'Slow-simmered organic ginger rhizome, lemongrass stalk, and raw MGO 400+ Manuka honey, served warm at 65°C.',
      tcmEnergetics: 'Warming',
      ayurvedicDosha: 'Kapha Pacifying',
      glycemicIndex: 35,
      targetConditions: ['Digestive', 'IBS', 'Nausea', 'Cold', 'Dampness', 'Fatigue'],
      activeCompounds: [
        { name: '6-Gingerol', dose: '25mg' },
        { name: 'Methylglyoxal (MGO)', dose: '400mg/kg' },
        { name: 'Citral', dose: '12mg' }
      ],
      clinicalRationale: 'Ignites Ayurvedic Agni (digestive fire), disperses TCM Cold & Dampness in the Spleen/Stomach channels, and stimulates gastric motility.',
      ramsDesignPrinciple: 'Thorough down to the last detail — Precision water temperature (65°C) preserves thermogenic enzyme integrity.'
    },
    {
      id: 'menu-4',
      emoji: '🫐',
      name: 'Wild Blueberry & Organic Ashwagandha Polyphenol Compote',
      category: 'Restorative Tonic',
      description: 'Chilled compote of wild Maine blueberries, KSM-66 Ashwagandha extract, and Ceylon cinnamon.',
      tcmEnergetics: 'Cooling',
      ayurvedicDosha: 'Tridoshic',
      glycemicIndex: 53,
      targetConditions: ['Stress', 'Anxiety', 'Insomnia', 'Cognitive', 'HPA Axis', 'Adrenal'],
      activeCompounds: [
        { name: 'Anthocyanins', dose: '450mg' },
        { name: 'Withanolides', dose: '30mg' },
        { name: 'Cinnamaldehyde', dose: '20mg' }
      ],
      clinicalRationale: 'Crosses the blood-brain barrier to reduce neuro-inflammation, modulates HPA-axis stress response, and supports central GABAergic tone.',
      ramsDesignPrinciple: 'As little design as possible — Natural berry polyphenols unadulterated by refined sugars or artificial additives.'
    }
  ];

  filteredMenuItems = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'All Courses') return this.menuItems;
    if (cat === 'Starters') return this.menuItems.filter(i => i.category === 'Starter');
    if (cat === 'Mains') return this.menuItems.filter(i => i.category === 'Main Course');
    if (cat === 'Elixirs') return this.menuItems.filter(i => i.category === 'Therapeutic Elixir');
    if (cat === 'Tonics') return this.menuItems.filter(i => i.category === 'Restorative Tonic');
    return this.menuItems;
  });

  evaluatePatientMatch(item: IClinicalMenuItem): { score: number; reason: string } {
    const conditions = this.activePatientConditions().map(c => c.toLowerCase());
    const vitals = this.patientState.vitals();
    let score = 75; // Baseline high match
    const reasons: string[] = [];

    // Check conditions match
    item.targetConditions.forEach(cond => {
      const condLower = cond.toLowerCase();
      if (conditions.some(c => c.includes(condLower) || condLower.includes(c))) {
        score += 10;
        reasons.push(`Directly targets ${cond}`);
      }
    });

    // Vitals alignment
    if (vitals.bp) {
      const sys = parseInt(vitals.bp.split('/')[0], 10);
      if (sys > 130 && item.glycemicIndex <= 20) {
        score += 8;
        reasons.push('Low glycemic index protects vascular endothelial function');
      }
    }

    if (vitals.hr) {
      const hr = parseInt(vitals.hr, 10);
      if (hr > 85 && item.tcmEnergetics === 'Cooling') {
        score += 7;
        reasons.push('TCM Cooling energetics counteract elevated heat/tachycardia');
      }
    }

    if (reasons.length === 0) {
      reasons.push(`Calibrated for ${this.activePatientName()}'s baseline metabolic optimization`);
    }

    const finalScore = Math.min(99, score);
    return {
      score: finalScore,
      reason: reasons.join(' • ')
    };
  }

  selectedMenuItem = signal<IClinicalMenuItem | null>(null);

  on3dItemSelect(item: IClinicalMenuItem) {
    this.selectedMenuItem.set(item);
  }

  prescribeMeal(item: IClinicalMenuItem) {
    const noteText = `Prescribed Culinary Medicine: ${item.emoji} ${item.name} (${item.activeCompounds.map(c => `${c.name} ${c.dose}`).join(', ')})`;
    this.patientState.addClinicalNote({
      id: `meal-${item.id}-${Date.now()}`,
      text: noteText,
      sourceLens: 'Nutrition',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    this.patientState.addDraftSummaryItem(`meal-${item.id}`, noteText);
  }

}
