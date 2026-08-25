import { Component, ChangeDetectionStrategy, signal, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export interface IChronoMealSlot {
  id: string;
  timeWindow: string; // e.g. "07:30 AM — Morning Fast-Break"
  mealType: 'Quick Snack' | 'Quick Meal' | 'Full Course';
  prepTimeMins: number;
  title: string;
  emoji: string;
  description: string;
  activeBioCompounds: string[];
  glycemicLoad: 'Very Low' | 'Low' | 'Moderate' | 'Zero';
  tcmEnergetics: 'Warming' | 'Cooling' | 'Neutral';
  regionalSource: string;
  clinicalTarget: string;
}

export interface IDayMealPlan {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  dayTitle: string;
  circadianFocus: string;
  slots: IChronoMealSlot[];
}

@Component({
  selector: 'app-chrono-weekly-meal-planner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 sm:p-8 rounded-3xl bg-zinc-950/95 text-zinc-100 border border-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.15)] font-sans relative overflow-hidden my-6">
      
      <!-- Background Ambient Glow -->
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>

      <!-- Header & Regional Sourcing Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 font-mono relative z-10">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse"></span>
            <h3 class="text-base font-bold uppercase tracking-tight text-emerald-200">
              7-Day Chrono-Nutrition Meal Planner & Regional Sourcing
            </h3>
            <span class="text-[9.5px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              Circadian Align v2.4
            </span>
          </div>
          <p class="text-xs text-zinc-400 font-sans mt-1">
            Weekly therapeutic meal schedule calibrated for <strong>{{ activePatientName() }}</strong>'s metabolic window and regional food availability.
          </p>
        </div>

        <!-- Region & Prep Time Filter Controls -->
        <div class="flex flex-wrap items-center gap-3 text-xs">
          <!-- Region Selection Dropdown -->
          <div class="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
            <span class="text-zinc-400 font-mono text-[10px] uppercase">Region:</span>
            <select (change)="onRegionChange($event)" [value]="selectedRegion()"
              class="bg-transparent text-emerald-300 font-bold font-mono focus:outline-none cursor-pointer text-xs">
              <option value="Pacific Northwest" class="bg-zinc-900 text-zinc-100">🌲 Pacific Northwest & Coastal</option>
              <option value="Mediterranean" class="bg-zinc-900 text-zinc-100">🌿 Mediterranean Basin</option>
              <option value="Asian Subcontinent" class="bg-zinc-900 text-zinc-100">🎋 Asian Subcontinent & Tropical</option>
              <option value="Nordic & Alpine" class="bg-zinc-900 text-zinc-100">❄️ Nordic & Alpine Boreal</option>
            </select>
          </div>

          <!-- Prep Complexity Filter -->
          <div class="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 font-mono text-[10px]">
            <button (click)="selectedPrepFilter.set('ALL')"
              [class.bg-emerald-600]="selectedPrepFilter() === 'ALL'"
              [class.text-white]="selectedPrepFilter() === 'ALL'"
              [class.text-zinc-400]="selectedPrepFilter() !== 'ALL'"
              class="px-2.5 py-1 rounded-lg font-bold uppercase transition cursor-pointer">
              All Prep
            </button>
            <button (click)="selectedPrepFilter.set('Quick Snack')"
              [class.bg-emerald-600]="selectedPrepFilter() === 'Quick Snack'"
              [class.text-white]="selectedPrepFilter() === 'Quick Snack'"
              [class.text-zinc-400]="selectedPrepFilter() !== 'Quick Snack'"
              class="px-2.5 py-1 rounded-lg font-bold uppercase transition cursor-pointer">
              🍿 Snacks (&lt;5m)
            </button>
            <button (click)="selectedPrepFilter.set('Quick Meal')"
              [class.bg-emerald-600]="selectedPrepFilter() === 'Quick Meal'"
              [class.text-white]="selectedPrepFilter() === 'Quick Meal'"
              [class.text-zinc-400]="selectedPrepFilter() !== 'Quick Meal'"
              class="px-2.5 py-1 rounded-lg font-bold uppercase transition cursor-pointer">
              ⚡ Quick (&lt;15m)
            </button>
            <button (click)="selectedPrepFilter.set('Full Course')"
              [class.bg-emerald-600]="selectedPrepFilter() === 'Full Course'"
              [class.text-white]="selectedPrepFilter() === 'Full Course'"
              [class.text-zinc-400]="selectedPrepFilter() !== 'Full Course'"
              class="px-2.5 py-1 rounded-lg font-bold uppercase transition cursor-pointer">
              🍲 Full Course (30m+)
            </button>
          </div>
        </div>
      </div>

      <!-- Cephalic Phase Digestion AVS Audio Control Bar -->
      <div class="mb-6 p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/40 relative overflow-hidden font-mono flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg text-emerald-300">
            🧠
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-300">Cephalic Phase Digestion AVS Audio Deck</span>
              <span class="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-black">
                {{ activeAvsTitle() }}
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 font-sans mt-0.5">
              Vagal CN-X stimulation • Solfeggio <strong>{{ activeSolfeggioHz() }}Hz</strong> + <strong>{{ activeBinauralHz() }}Hz Alpha-Theta</strong> Entrainment
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button (click)="toggleCephalicAvs(528, 10, 'Pre-Meal Cephalic Awakening')"
            [class]="isPlayingAvs() && activeSolfeggioHz() === 528
              ? 'px-3 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs shadow-lg transition animate-pulse cursor-pointer'
              : 'px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-300 font-bold text-xs border border-zinc-700 transition cursor-pointer'">
            <span>🎧 528Hz Pre-Meal</span>
          </button>

          <button (click)="toggleCephalicAvs(432, 6, 'Mindful Mastication Satiety')"
            [class]="isPlayingAvs() && activeSolfeggioHz() === 432
              ? 'px-3 py-1.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs shadow-lg transition animate-pulse cursor-pointer'
              : 'px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs border border-zinc-700 transition cursor-pointer'">
            <span>🍵 432Hz Mastication</span>
          </button>

          <button (click)="toggleCephalicAvs(396, 2.5, 'Post-Prandial Rest & Digest')"
            [class]="isPlayingAvs() && activeSolfeggioHz() === 396
              ? 'px-3 py-1.5 rounded-xl bg-purple-500 text-zinc-950 font-bold text-xs shadow-lg transition animate-pulse cursor-pointer'
              : 'px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-purple-300 font-bold text-xs border border-zinc-700 transition cursor-pointer'">
            <span>🍲 396Hz Rest-Digest</span>
          </button>

          @if (isPlayingAvs()) {
            <button (click)="stopCephalicAvs()" class="p-1.5 rounded-xl bg-red-950 text-red-300 border border-red-800 text-xs hover:bg-red-900 transition cursor-pointer">
              ⏹ Stop
            </button>
          }
        </div>
      </div>

      <!-- 7-Day Calendar Day Tabs -->
      <div class="grid grid-cols-7 gap-2 mb-6 font-mono">
        @for (dayPlan of weeklySchedule(); track dayPlan.day) {
          <button (click)="selectedDay.set(dayPlan.day)"
            [class.bg-emerald-600]="selectedDay() === dayPlan.day"
            [class.text-white]="selectedDay() === dayPlan.day"
            [class.border-emerald-400]="selectedDay() === dayPlan.day"
            [class.bg-zinc-900\/60]="selectedDay() !== dayPlan.day"
            [class.text-zinc-400]="selectedDay() !== dayPlan.day"
            [class.border-zinc-800]="selectedDay() !== dayPlan.day"
            class="p-2.5 rounded-2xl border text-center transition cursor-pointer hover:border-emerald-500/50 group active:scale-95">
            <span class="text-xs font-bold uppercase block tracking-wider">{{ dayPlan.day }}</span>
            <span class="text-[9px] block mt-0.5 opacity-80 truncate">{{ dayPlan.dayTitle }}</span>
          </button>
        }
      </div>

      <!-- Selected Day Focus Callout -->
      @let activeDayPlan = currentDaySchedule();

      <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div class="flex items-center gap-3">
          <span class="text-xl">📅</span>
          <div>
            <h4 class="text-xs font-bold text-white uppercase tracking-wider">
              {{ activeDayPlan.dayTitle }} &bull; Circadian Focus
            </h4>
            <p class="text-xs text-emerald-300 font-sans mt-0.5">
              {{ activeDayPlan.circadianFocus }}
            </p>
          </div>
        </div>

        <div class="text-[10px] text-zinc-400 font-mono">
          <span>Regional Sourcing: <strong class="text-emerald-400">{{ selectedRegion() }}</strong></span>
        </div>
      </div>

      <!-- Circadian Meal Slots Grid with 3D Double-Click Flip State Machines -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10 font-sans">
        @for (slot of filteredMealSlots(); track slot.id) {
          @let isSlotFlipped = isMealFlipped(slot.id);
          <div (dblclick)="toggleMealFlip(slot.id); $event.stopPropagation()"
               class="relative perspective-1000 group cursor-pointer h-64"
               title="Double-click to flip over for BMAL1 Circadian Clock Science & Satiety Rationale">
            
            <div [class.rotate-y-180]="isSlotFlipped"
                 class="relative w-full h-full transition-transform duration-500 transform-style-3d">

              <!-- FRONT FACE -->
              <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/50 transition flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden shadow-sm">
                <div>
                  <!-- Header Badges -->
                  <div class="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2 font-mono text-[10px]">
                    <span class="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span>⏰</span> {{ slot.timeWindow }}
                    </span>

                    <div class="flex items-center gap-1.5">
                      <span class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        dblclick 🔄
                      </span>
                      <span class="px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                        [class.bg-amber-500\/20]="slot.mealType === 'Quick Snack'"
                        [class.text-amber-300]="slot.mealType === 'Quick Snack'"
                        [class.bg-sky-500\/20]="slot.mealType === 'Quick Meal'"
                        [class.text-sky-300]="slot.mealType === 'Quick Meal'"
                        [class.bg-purple-500\/20]="slot.mealType === 'Full Course'"
                        [class.text-purple-300]="slot.mealType === 'Full Course'">
                        {{ slot.mealType === 'Quick Snack' ? '🍿' : slot.mealType === 'Quick Meal' ? '⚡' : '🍲' }} {{ slot.mealType }} ({{ slot.prepTimeMins }}m)
                      </span>
                    </div>
                  </div>

                  <!-- Title & Description -->
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xl">{{ slot.emoji }}</span>
                    <h4 class="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                      {{ slot.title }}
                    </h4>
                  </div>
                  <p class="text-[11px] text-zinc-400 leading-relaxed font-sans line-clamp-2">
                    {{ slot.description }}
                  </p>

                  <!-- Bioactive Compounds -->
                  <div class="flex flex-wrap gap-1 mt-2">
                    @for (cmp of slot.activeBioCompounds; track cmp) {
                      <span class="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono border border-zinc-700">
                        💊 {{ cmp }}
                      </span>
                    }
                  </div>
                </div>

                <!-- Footer Telemetry -->
                <div class="pt-2 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[9.5px]">
                  <span class="text-zinc-400">Target: <strong class="text-emerald-300">{{ slot.clinicalTarget }}</strong></span>
                  <span class="text-amber-400 font-bold">Glycemic: {{ slot.glycemicLoad }}</span>
                </div>
              </div>

              <!-- BACK FACE -->
              <div class="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-500/40 shadow-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden font-sans text-xs">
                <div>
                  <div class="flex items-center justify-between border-b border-emerald-800 pb-1.5 mb-2 font-mono text-xs">
                    <span class="text-emerald-300 font-bold uppercase flex items-center gap-1">
                      <span>🥦</span> BMAL1 Circadian Clock Science
                    </span>
                    <span class="text-emerald-400 font-mono text-[10px]">dblclick flip</span>
                  </div>
                  <div class="space-y-1.5 text-emerald-100">
                    <p class="text-[11px]">
                      <strong>Circadian Alignment:</strong> Eating within the {{ slot.timeWindow.split('—')[0] }} window aligns with hepatic BMAL1/CLOCK gene transcription, maximizing pancreatic beta-cell insulin sensitivity.
                    </p>
                    <p class="text-[11px]">
                      <strong>Mastication Habit:</strong> Chew each bite 20+ times to stimulate cephalic phase vagal activation and GLP-1 satiety peptide release.
                    </p>
                  </div>
                </div>
                <div class="pt-1.5 border-t border-emerald-900 font-mono text-[9px] text-emerald-400 flex justify-between">
                  <span>Circadian Nutrition Active</span>
                  <span>Double-click to return</span>
                </div>
              </div>

            </div>
          </div>
        }
      </div>

    </div>
  `
})
export class ChronoWeeklyMealPlannerComponent implements OnDestroy {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  readonly flippedMeals = signal<Set<string>>(new Set());

  private lastMealFlipTimeMap = new Map<string, number>();

  toggleMealFlip(id: string, event?: Event) {
    if (event) event.stopPropagation();
    const now = Date.now();
    const last = this.lastMealFlipTimeMap.get(id) || 0;
    if (now - last < 200) return;
    this.lastMealFlipTimeMap.set(id, now);
    const current = new Set(this.flippedMeals());
    if (current.has(id)) current.delete(id);
    else current.add(id);
    this.flippedMeals.set(current);
  }

  isMealFlipped(id: string): boolean {
    return this.flippedMeals().has(id);
  }

  selectedDay = signal<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>('Mon');
  selectedRegion = signal<string>('Pacific Northwest');
  selectedPrepFilter = signal<'ALL' | 'Quick Snack' | 'Quick Meal' | 'Full Course'>('ALL');

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Charles Darwin';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Charles Darwin';
  });

  weeklySchedule = signal<IDayMealPlan[]>([
    {
      day: 'Mon',
      dayTitle: 'Monday • Insulin Sensitivity & Glycan Reset',
      circadianFocus: 'GLUT4 receptor activation and gut mucosal barrier repair following weekend metabolic transition.',
      slots: [
        {
          id: 'mon-1',
          timeWindow: '07:30 AM — Morning Fast-Break',
          mealType: 'Quick Meal',
          prepTimeMins: 10,
          title: 'Wild Blackberry & Sprouted Chia Polyphenol Porridge',
          emoji: '🫐',
          description: 'Steeped sprouted chia seeds with wild blackberries, Ceylon cinnamon, and MCT oil for steady ketone production.',
          activeBioCompounds: ['Anthocyanins 250mg', 'Cinnamaldehyde 100mg', 'Alpha-Linolenic Acid 3.5g'],
          glycemicLoad: 'Very Low',
          tcmEnergetics: 'Warming',
          regionalSource: 'Pacific Northwest Wild Foraged',
          clinicalTarget: 'Insulin Sensitivity & AMPK Activation'
        },
        {
          id: 'mon-2',
          timeWindow: '12:30 PM — Anabolic Peak Lunch',
          mealType: 'Full Course',
          prepTimeMins: 25,
          title: 'Wild Coho Salmon with Steamed Fennel & Turmeric Quinoa',
          emoji: '🐟',
          description: 'Pan-seared wild salmon over steamed digestive fennel, sprouted white quinoa, and cold-pressed extra virgin olive oil.',
          activeBioCompounds: ['EPA/DHA 2200mg', 'Curcumin 500mg', 'Anethole 150mg'],
          glycemicLoad: 'Low',
          tcmEnergetics: 'Neutral',
          regionalSource: 'Coastal Pacific Wild Catch',
          clinicalTarget: 'Resolvin SPM Production & Mitochondrial Repair'
        },
        {
          id: 'mon-3',
          timeWindow: '04:00 PM — Bio-Sustain Afternoon Snack',
          mealType: 'Quick Snack',
          prepTimeMins: 3,
          title: 'Dark Cacao Nibs & Roasted Pumpkin Seeds',
          emoji: '🍫',
          description: 'RAW 85% Cacao nibs blended with zinc-rich pumpkin seeds for steady dopamine synthesis and magnesium replenishment.',
          activeBioCompounds: ['Magnesium 180mg', 'Elemental Zinc 8mg', 'Theobromine 120mg'],
          glycemicLoad: 'Very Low',
          tcmEnergetics: 'Warming',
          regionalSource: 'Artisanal Roastery',
          clinicalTarget: 'Afternoon Dopamine & Executive Energy'
        },
        {
          id: 'mon-4',
          timeWindow: '07:00 PM — Circadian Evening Repair',
          mealType: 'Quick Meal',
          prepTimeMins: 14,
          title: 'Shiitake & Astragalus Restorative Broth with Sautéed Greens',
          emoji: '🍄',
          description: 'Warm medicinal mushroom broth with astragalus root, wilted lacinato kale, and toasted sesame oil for evening vagal calm.',
          activeBioCompounds: ['Beta-Glucans 400mg', 'Astragaloside IV 50mg', 'L-Tryptophan 250mg'],
          glycemicLoad: 'Very Low',
          tcmEnergetics: 'Warming',
          regionalSource: 'Regional Mushroom Cultivators',
          clinicalTarget: 'Parasympathetic Sleep Transition'
        }
      ]
    },
    {
      day: 'Tue',
      dayTitle: 'Tuesday • Mitochondrial Biogenesis & Anti-Inflammation',
      circadianFocus: 'Upregulating PGC-1alpha mitochondrial density and endogenous antioxidant enzyme synthesis.',
      slots: [
        {
          id: 'tue-1',
          timeWindow: '07:30 AM — Morning Fast-Break',
          mealType: 'Quick Snack',
          prepTimeMins: 5,
          title: 'Avocado & Hemp Seed Bio-Active Mash',
          emoji: '🥑',
          description: 'Hass avocado mashed with organic hemp hearts, sea salt, and lemon zest for steady cellular membrane fluidity.',
          activeBioCompounds: ['Oleic Acid 12g', 'GLA 300mg', 'Potassium 600mg'],
          glycemicLoad: 'Very Low',
          tcmEnergetics: 'Neutral',
          regionalSource: 'Local Organic Produce Co-op',
          clinicalTarget: 'Cell Membrane Fluidity'
        },
        {
          id: 'tue-2',
          timeWindow: '12:30 PM — Anabolic Peak Lunch',
          mealType: 'Full Course',
          prepTimeMins: 30,
          title: 'Rosemary Roasted Grass-Fed Bison with Root Vegetables',
          emoji: '🥩',
          description: 'Grass-fed bison steak roasted with fresh rosemary, roasted beets, and steamed broccoli sprouts rich in sulforaphane.',
          activeBioCompounds: ['Sulforaphane 40mg', 'Carnitine 350mg', 'Heme Iron 6mg'],
          glycemicLoad: 'Low',
          tcmEnergetics: 'Warming',
          regionalSource: 'Regional Grass-Fed Pastures',
          clinicalTarget: 'Phase II Liver Detox & Nrf2 Activation'
        },
        {
          id: 'tue-3',
          timeWindow: '04:00 PM — Bio-Sustain Afternoon Snack',
          mealType: 'Quick Snack',
          prepTimeMins: 4,
          title: 'Golden Turmeric & Piperine Coconut Latte',
          emoji: '🍵',
          description: 'Steamed coconut milk infused with organic turmeric, ginger root, and black pepper piperine for 2000% bioavailability boost.',
          activeBioCompounds: ['Curcumin 400mg', 'Piperine 15mg', 'Gingerols 80mg'],
          glycemicLoad: 'Very Low',
          tcmEnergetics: 'Warming',
          regionalSource: 'Organic Apothecary',
          clinicalTarget: 'NF-kB Inflammatory Cascade Suppression'
        },
        {
          id: 'tue-4',
          timeWindow: '07:00 PM — Circadian Evening Repair',
          mealType: 'Quick Meal',
          prepTimeMins: 12,
          title: 'Steamed Black Cod with Ginger & Baby Bok Choy',
          emoji: '🍲',
          description: 'Wild sablefish steamed with julienned ginger, tamari, and tender bok choy for easy evening digestion.',
          activeBioCompounds: ['Omega-3 Index 8.5%', 'Gingerol 60mg', 'Magnesium 90mg'],
          glycemicLoad: 'Very Low',
          tcmEnergetics: 'Cooling',
          regionalSource: 'Pacific Northwest Ocean Harvest',
          clinicalTarget: 'Glymphatic Brain Clearance Support'
        }
      ]
    },
    {
      day: 'Wed',
      dayTitle: 'Wednesday • Gut Microbiome & SCFAs Bio-Production',
      circadianFocus: 'Nurturing Akkermansia muciniphila and increasing Short-Chain Fatty Acid (Butyrate) production.',
      slots: [
        {
          id: 'wed-1',
          timeWindow: '08:00 AM — Morning Fast-Break',
          mealType: 'Quick Meal',
          prepTimeMins: 8,
          title: 'Green Banana Flour & Wild Blueberry Prebiotic Smoothie',
          emoji: '🥤',
          description: 'Unripe green banana resistant starch blended with wild blueberries, almond milk, and acacia fiber.',
          activeBioCompounds: ['Resistant Starch Type 2 (15g)', 'Pterostilbene 20mg', 'Polyphenols 350mg'],
          glycemicLoad: 'Low',
          tcmEnergetics: 'Cooling',
          regionalSource: 'Artisanal Organic Co-op',
          clinicalTarget: 'Akkermansia Gut Mucin Layer Maintenance'
        },
        {
          id: 'wed-2',
          timeWindow: '01:00 PM — Anabolic Peak Lunch',
          mealType: 'Full Course',
          prepTimeMins: 35,
          title: 'Fermented Kimchi & Tempeh Macro Bowl with Sweet Potato',
          emoji: '🥗',
          description: 'Organic unpasteurized kimchi served over organic fermented tempeh, roasted Japanese sweet potato, and sesame greens.',
          activeBioCompounds: ['ProbioticCFU 10B', 'Genistein 45mg', 'Beta-Carotene 8000IU'],
          glycemicLoad: 'Moderate',
          tcmEnergetics: 'Warming',
          regionalSource: 'Local Fermentation Lab',
          clinicalTarget: 'Microbiome Diversity & SCFA Butyrate Synthesis'
        },
        {
          id: 'wed-3',
          timeWindow: '04:30 PM — Bio-Sustain Afternoon Snack',
          mealType: 'Quick Snack',
          prepTimeMins: 2,
          title: 'Walnut & Tart Cherry Anti-Inflammatory Handful',
          emoji: '🍒',
          description: 'Raw Oregon walnuts paired with dried Montmorency tart cherries rich in natural melatonin and ellagic acid.',
          activeBioCompounds: ['Natural Melatonin 15mcg', 'Ellagic Acid 120mg', 'ALA Omega-3 2.5g'],
          glycemicLoad: 'Low',
          tcmEnergetics: 'Neutral',
          regionalSource: 'Oregon Orchard Harvest',
          clinicalTarget: 'Endogenous Circadian Rhythm Alignment'
        },
        {
          id: 'wed-4',
          timeWindow: '07:30 PM — Circadian Evening Repair',
          mealType: 'Quick Meal',
          prepTimeMins: 15,
          title: 'Creamy Zucchini & Basil Soup with Pumpkin Seed Crunch',
          emoji: '🥣',
          description: 'Blended organic zucchini soup infused with fresh basil, bone broth, and activated sprouted seeds.',
          activeBioCompounds: ['Lutein 12mg', 'Zeaxanthin 4mg', 'Glutamine 2g'],
          glycemicLoad: 'Very Low',
          tcmEnergetics: 'Cooling',
          regionalSource: 'Regional Farmers Market',
          clinicalTarget: 'Enterocyte Gut Lining Integrity'
        }
      ]
    },
    {
      day: 'Thu',
      dayTitle: 'Thursday • Neuro-Plasticity & BDNF Brain Surge',
      circadianFocus: 'Triggering Brain-Derived Neurotrophic Factor (BDNF) and cholinergic neurotransmitter synthesis.',
      slots: [
        {
          id: 'thu-1',
          timeWindow: '07:30 AM — Morning Fast-Break',
          mealType: 'Quick Meal',
          prepTimeMins: 12,
          title: 'Lions Mane & Pasture-Raised Choline Omelet',
          emoji: '🍳',
          description: 'Pasture-raised eggs scrambled with fresh organic Lions Mane mushroom, spinach, and Ghee.',
          activeBioCompounds: ['Hericenones 50mg', 'Choline 300mg', 'Lutein 8mg'],
          glycemicLoad: 'Very Low',
          tcmEnergetics: 'Warming',
          regionalSource: 'Local Pasture Farm',
          clinicalTarget: 'BDNF Production & Acetylcholine Synthesis'
        },
        {
          id: 'thu-2',
          timeWindow: '12:30 PM — Anabolic Peak Lunch',
          mealType: 'Full Course',
          prepTimeMins: 28,
          title: 'Mediterranean Sardine & Wild Arugula Salad with EVOO',
          emoji: '🥗',
          description: 'Wild Pacific sardines tossed with spicy wild arugula, capers, kalamata olives, and high-polyphenol EVOO.',
          activeBioCompounds: ['Oleocanthal 180mg', 'EPA/DHA 1800mg', 'Vitamin D3 400IU'],
          glycemicLoad: 'Very Low',
          tcmEnergetics: 'Cooling',
          regionalSource: 'Wild Sustainable Fishery',
          clinicalTarget: 'Synaptic Membrane Fluidity & COX-2 Inhibition'
        },
        {
          id: 'thu-3',
          timeWindow: '04:00 PM — Bio-Sustain Afternoon Snack',
          mealType: 'Quick Snack',
          prepTimeMins: 3,
          title: 'Matcha & L-Theanine Brain Energy Shot',
          emoji: '🍵',
          description: 'Ceremonial grade Japanese matcha whisked with warm water and a drop of MCT oil.',
          activeBioCompounds: ['EGCG 200mg', 'L-Theanine 150mg', 'Caffeine 35mg'],
          glycemicLoad: 'Very Low',
          tcmEnergetics: 'Cooling',
          regionalSource: 'Direct Import Tea Estate',
          clinicalTarget: 'Alpha-Wave EEG Synchronization & Calm Focus'
        },
        {
          id: 'thu-4',
          timeWindow: '07:00 PM — Circadian Evening Repair',
          mealType: 'Quick Meal',
          prepTimeMins: 15,
          title: 'Roasted Cauliflower Steak with Tahini & Lemon Herb Drizzle',
          emoji: '🥦',
          description: 'Thick-cut roasted cauliflower seasoned with cumin, garlic, lemon, and stone-ground sesame tahini.',
          activeBioCompounds: ['Glucosinolates 180mg', 'Sesamin 40mg', 'Potassium 550mg'],
          glycemicLoad: 'Low',
          tcmEnergetics: 'Neutral',
          regionalSource: 'Regional Organic Farm',
          clinicalTarget: 'Sulforaphane Nrf2 Antioxidant Cascade'
        }
      ]
    },
    {
      day: 'Fri',
      dayTitle: 'Friday • Vascular Endothelial & Nitric Oxide Boost',
      circadianFocus: 'Maximizing flow-mediated vasodilation and arterial endothelial nitric oxide (eNOS) production.',
      slots: [
        {
          id: 'fri-1',
          timeWindow: '07:30 AM — Morning Fast-Break',
          mealType: 'Quick Meal',
          prepTimeMins: 10,
          title: 'Fermented Beetroot & Pomegranate Stamina Elixir',
          emoji: '🥤',
          description: 'Cold-pressed fermented beetroot juice mixed with fresh pomegranate juice and sliced ginger root.',
          activeBioCompounds: ['Dietary Nitrates 400mg', 'Punicalagins 300mg', 'Gingerols 50mg'],
          glycemicLoad: 'Moderate',
          tcmEnergetics: 'Warming',
          regionalSource: 'Local Juicery & Farm',
          clinicalTarget: 'Endothelial eNOS Activation & Blood Pressure Optimization'
        },
        {
          id: 'fri-2',
          timeWindow: '12:30 PM — Anabolic Peak Lunch',
          mealType: 'Full Course',
          prepTimeMins: 30,
          title: 'Pan-Roasted Wild Halibut with Garlic Spinach & Lentils',
          emoji: '🍲',
          description: 'Wild Alaskan Halibut served over French green lentils, roasted garlic, and wilted spinach.',
          activeBioCompounds: ['Selenium 65mcg', 'Magnesium 140mg', 'Folate 180mcg'],
          glycemicLoad: 'Low',
          tcmEnergetics: 'Neutral',
          regionalSource: 'Alaskan Wild Fishery',
          clinicalTarget: 'Glutathione Peroxidase Cofactor Saturation'
        },
        {
          id: 'fri-3',
          timeWindow: '04:00 PM — Bio-Sustain Afternoon Snack',
          mealType: 'Quick Snack',
          prepTimeMins: 2,
          title: 'Activated Brazil Nuts & Golden Raisins',
          emoji: '🥜',
          description: '2 Organic Brazil nuts providing 100% daily selenium requirement paired with golden raisins for glycogen replenishment.',
          activeBioCompounds: ['Organic Selenium 140mcg', 'Resveratrol 15mg', 'Boron 2mg'],
          glycemicLoad: 'Low',
          tcmEnergetics: 'Warming',
          regionalSource: 'Organic Pantry Co-op',
          clinicalTarget: 'Thyroid T4 to T3 Hormone Conversion'
        },
        {
          id: 'fri-4',
          timeWindow: '07:00 PM — Circadian Evening Repair',
          mealType: 'Quick Meal',
          prepTimeMins: 12,
          title: 'Kombu Dashi Noodle Soup with Shiitake & Tofu',
          emoji: '🍜',
          description: 'Mineral-rich kelp kombu broth with organic silken tofu, shiitake caps, and green scallions.',
          activeBioCompounds: ['Iodine 150mcg', 'Fucoxanthin 10mg', 'L-Theanine 80mg'],
          glycemicLoad: 'Low',
          tcmEnergetics: 'Cooling',
          regionalSource: 'Coastal Kelp Harvest',
          clinicalTarget: 'Thyroid Hormone & Lymphatic Detox'
        }
      ]
    },
    {
      day: 'Sat',
      dayTitle: 'Saturday • Autophagy & Cellular Cleansing',
      circadianFocus: 'Stimulating AMPK-mediated autophagy and lysosomal clearance of cellular debris.',
      slots: [
        {
          id: 'sat-1',
          timeWindow: '08:30 AM — Morning Fast-Break',
          mealType: 'Quick Snack',
          prepTimeMins: 3,
          title: 'Bulletproof Coffee with C8 Caprylic MCT & Ghee',
          emoji: '☕',
          description: 'Organic single-origin coffee blended with pure C8 MCT oil and grass-fed Ghee for instant hepatic ketone elevation.',
          activeBioCompounds: ['C8 Caprylic Acid 10g', 'Chlorogenic Acid 150mg', 'CLA 200mg'],
          glycemicLoad: 'Zero',
          tcmEnergetics: 'Warming',
          regionalSource: 'Artisanal Coffee Roaster',
          clinicalTarget: 'Autophagy Activation & Ketogenesis'
        },
        {
          id: 'sat-2',
          timeWindow: '01:00 PM — Anabolic Peak Lunch',
          mealType: 'Full Course',
          prepTimeMins: 35,
          title: 'Slow-Cooked Organic Beef Bone Broth with Roasted Garlic',
          emoji: '🍲',
          description: '48-hour simmered organic grass-fed bone broth rich in collagen peptides, glycine, and roasted garlic confit.',
          activeBioCompounds: ['Collagen Peptides 15g', 'Glycine 3.5g', 'Allicin 120mg'],
          glycemicLoad: 'Zero',
          tcmEnergetics: 'Warming',
          regionalSource: 'Regional Artisanal Broth House',
          clinicalTarget: 'Joint Cartilage & Connective Tissue Repair'
        },
        {
          id: 'sat-3',
          timeWindow: '04:30 PM — Bio-Sustain Afternoon Snack',
          mealType: 'Quick Snack',
          prepTimeMins: 3,
          title: 'Golden Incan Berries & Roasted Macadamia Nuts',
          emoji: '🫐',
          description: 'Tangy organic golden berries rich in withanolide-like compounds paired with monounsaturated macadamias.',
          activeBioCompounds: ['Withanolides 25mg', 'Palmitoleic Acid 2.5g', 'Vitamin C 60mg'],
          glycemicLoad: 'Low',
          tcmEnergetics: 'Neutral',
          regionalSource: 'Import Co-op Harvest',
          clinicalTarget: 'Adrenal Stress Cortisol Buffer'
        },
        {
          id: 'sat-4',
          timeWindow: '07:30 PM — Circadian Evening Repair',
          mealType: 'Quick Meal',
          prepTimeMins: 15,
          title: 'Steamed Wild Cod with Asparagus Spears & Lemon Ghee',
          emoji: '🐟',
          description: 'Delicate wild cod steamed alongside young asparagus spears rich in natural folate and glutathione.',
          activeBioCompounds: ['Glutathione 80mg', 'Folate 220mcg', 'Selenium 45mcg'],
          glycemicLoad: 'Very Low',
          tcmEnergetics: 'Cooling',
          regionalSource: 'Coastal Pacific Catch',
          clinicalTarget: 'Hepatic Phase I/II Detoxification'
        }
      ]
    },
    {
      day: 'Sun',
      dayTitle: 'Sunday • Restorative Rejuvenation & Vitality Reserve',
      circadianFocus: 'Building Jing renal energy reserves and preparing immunometabolic system for the upcoming week.',
      slots: [
        {
          id: 'sun-1',
          timeWindow: '08:30 AM — Morning Fast-Break',
          mealType: 'Quick Meal',
          prepTimeMins: 12,
          title: 'Golden Spiced Stewed Apples with Goji Berries',
          emoji: '🍎',
          description: 'Organic Granny Smith apples stewed with Ceylon cinnamon, cardamom pods, and Ningxia goji berries.',
          activeBioCompounds: ['Pectin 4g', 'Polysaccharides 250mg', 'Zeaxanthin 15mg'],
          glycemicLoad: 'Low',
          tcmEnergetics: 'Warming',
          regionalSource: 'Regional Orchard Harvest',
          clinicalTarget: 'TCM Spleen Qi & Digestive Mucosal Shield'
        },
        {
          id: 'sun-2',
          timeWindow: '01:00 PM — Anabolic Peak Lunch',
          mealType: 'Full Course',
          prepTimeMins: 40,
          title: 'Herb-Crusted Pasture Chicken with Roasted Acorn Squash',
          emoji: '🍗',
          description: 'Pasture-raised chicken breast crusted with thyme and sage, served alongside caramelized acorn squash.',
          activeBioCompounds: ['Carnosine 250mg', 'Thymol 40mg', 'Potassium 650mg'],
          glycemicLoad: 'Moderate',
          tcmEnergetics: 'Warming',
          regionalSource: 'Local Sustainable Farm',
          clinicalTarget: 'Muscle Protein Synthesis & Carnosine Buffer'
        },
        {
          id: 'sun-3',
          timeWindow: '04:30 PM — Bio-Sustain Afternoon Snack',
          mealType: 'Quick Snack',
          prepTimeMins: 4,
          title: 'Chamomile & Passionflower Relaxing Botanical Infusion',
          emoji: '🫖',
          description: 'Brewed organic chamomile blossoms with passionflower and a drizzle of raw manuka honey.',
          activeBioCompounds: ['Apigenin 25mg', 'Chrysin 10mg', 'MGO 100mg'],
          glycemicLoad: 'Very Low',
          tcmEnergetics: 'Cooling',
          regionalSource: 'Local Botanical Farm',
          clinicalTarget: 'GABA-A Receptor Allosteric Modulation'
        },
        {
          id: 'sun-4',
          timeWindow: '07:30 PM — Circadian Evening Repair',
          mealType: 'Quick Meal',
          prepTimeMins: 14,
          title: 'Roasted Pumpkin & Leek Velvet Soup',
          emoji: '🎃',
          description: 'Silky puréed pumpkin soup with braised leeks, coconut cream, and nutmeg.',
          activeBioCompounds: ['Beta-Carotene 9000IU', 'Prebiotic Inulin 3g', 'Myristicin 15mg'],
          glycemicLoad: 'Low',
          tcmEnergetics: 'Warming',
          regionalSource: 'Regional Organic Harvest',
          clinicalTarget: 'Melatonin Production & Deep Sleep Readiness'
        }
      ]
    }
  ]);

  currentDaySchedule = computed(() => {
    const day = this.selectedDay();
    return this.weeklySchedule().find(d => d.day === day) || this.weeklySchedule()[0];
  });

  filteredMealSlots = computed(() => {
    const dayPlan = this.currentDaySchedule();
    const filter = this.selectedPrepFilter();
    if (filter === 'ALL') return dayPlan.slots;
    return dayPlan.slots.filter(s => s.mealType === filter);
  });

  onRegionChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedRegion.set(val);
  }

  prescribeChronoSlot(slot: IChronoMealSlot) {
    const noteText = `🥑 Prescribed Chrono Meal (${slot.timeWindow}): ${slot.title} (${slot.mealType}, ${slot.prepTimeMins}m prep) — Target: ${slot.clinicalTarget}`;
    this.patientState.addClinicalNote({
      id: `meal-${slot.id}-${Date.now()}`,
      text: noteText,
      sourceLens: 'Nutrition',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
  }

  isPlayingAvs = signal<boolean>(false);
  activeAvsTitle = signal<string>('Pre-Meal Cephalic Awakening');
  activeSolfeggioHz = signal<number>(528);
  activeBinauralHz = signal<number>(10);

  private audioCtx: AudioContext | null = null;
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  ngOnDestroy(): void {
    this.stopCephalicAvs();
  }

  toggleCephalicAvs(solfeggioHz: number, binauralHz: number, title: string): void {
    if (this.isPlayingAvs() && this.activeSolfeggioHz() === solfeggioHz) {
      this.stopCephalicAvs();
      return;
    }
    this.stopCephalicAvs();
    this.startCephalicAvs(solfeggioHz, binauralHz, title);
  }

  private startCephalicAvs(solfeggioHz: number, binauralHz: number, title: string): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.audioCtx = new AudioContextClass();

      const merger = this.audioCtx.createChannelMerger(2);
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.12, this.audioCtx.currentTime);

      this.oscLeft = this.audioCtx.createOscillator();
      this.oscRight = this.audioCtx.createOscillator();

      this.oscLeft.type = 'sine';
      this.oscRight.type = 'sine';

      this.oscLeft.frequency.setValueAtTime(solfeggioHz, this.audioCtx.currentTime);
      this.oscRight.frequency.setValueAtTime(solfeggioHz + binauralHz, this.audioCtx.currentTime);

      this.oscLeft.connect(merger, 0, 0);
      this.oscRight.connect(merger, 0, 1);

      merger.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.oscLeft.start();
      this.oscRight.start();

      this.activeSolfeggioHz.set(solfeggioHz);
      this.activeBinauralHz.set(binauralHz);
      this.activeAvsTitle.set(title);
      this.isPlayingAvs.set(true);
    } catch (e) {
      console.warn('Cephalic AVS audio playback failed', e);
    }
  }

  stopCephalicAvs(): void {
    if (this.oscLeft) {
      try { this.oscLeft.stop(); this.oscLeft.disconnect(); } catch (_) { /* Node may already be stopped */ }
      this.oscLeft = null;
    }
    if (this.oscRight) {
      try { this.oscRight.stop(); this.oscRight.disconnect(); } catch (_) { /* Node may already be stopped */ }
      this.oscRight = null;
    }
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch (_) { /* Context may already be closed */ }
      this.audioCtx = null;
    }
    this.isPlayingAvs.set(false);
  }
}
