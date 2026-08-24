import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AkovosLongevityService, IArcadianBotanical, IArcadianSpringProfile } from '../services/akovos-longevity.service';

type AkovosTab = 'botanicals' | 'incline' | 'evoo' | 'circadian';

@Component({
  selector: 'app-akovos-longevity-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full bg-[#080d1a] text-zinc-100 rounded-2xl border border-teal-500/30 p-5 md:p-8 shadow-2xl overflow-hidden relative">
      
      <!-- Top Arcadian Panorama Header -->
      <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-teal-900/50">
        <div>
          <div class="flex items-center gap-2.5 flex-wrap mb-1.5">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ⛰️ 950m ALTITUDE • MT. TAYGETOS
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40">
              ARCADIA, GREECE (ΑΚΟΒΟΣ)
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              HIPPOCRATIC DIAITA & PHYSIS
            </span>
          </div>
          <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>🏛️ Akovos Arcadian Longevity Sanctuary</span>
          </h2>
          <p class="text-xs md:text-sm text-zinc-400 mt-1 max-w-3xl">
            High-altitude endemic botanicals, high-phenolic mountain olive oil, natural incline stone paths (<em class="text-teal-300">Kalderimia</em>), and pure limestone alpine springs.
          </p>
        </div>

        <!-- Metric Fast Stats Pill -->
        <div class="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 px-4">
          <div class="text-center">
            <div class="text-xs text-zinc-400 font-mono">Air Microplastics</div>
            <div class="text-lg font-bold text-emerald-400 font-mono">0.0 ppm</div>
          </div>
          <div class="h-8 w-px bg-zinc-800"></div>
          <div class="text-center">
            <div class="text-xs text-zinc-400 font-mono">Spring Water pH</div>
            <div class="text-lg font-bold text-sky-400 font-mono">8.15</div>
          </div>
          <div class="h-8 w-px bg-zinc-800"></div>
          <div class="text-center">
            <div class="text-xs text-zinc-400 font-mono">EVOO Polyphenols</div>
            <div class="text-lg font-bold text-amber-400 font-mono">>800 mg</div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap gap-2 pt-6 pb-6" role="tablist" aria-label="Akovos Sanctuary Navigation">
        <button
          role="tab"
          [attr.aria-selected]="activeTab() === 'botanicals'"
          (click)="activeTab.set('botanicals')"
          class="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 min-h-[44px] cursor-pointer touch-manipulation"
          [ngClass]="activeTab() === 'botanicals' ? 'bg-teal-500 text-zinc-950 font-bold shadow-lg shadow-teal-500/20' : 'bg-zinc-900/70 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'">
          <span>🌿 Taygetos Pharmacopoeia</span>
        </button>

        <button
          role="tab"
          [attr.aria-selected]="activeTab() === 'incline'"
          (click)="activeTab.set('incline')"
          class="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 min-h-[44px] cursor-pointer touch-manipulation"
          [ngClass]="activeTab() === 'incline' ? 'bg-teal-500 text-zinc-950 font-bold shadow-lg shadow-teal-500/20' : 'bg-zinc-900/70 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'">
          <span>⛰️ Incline Biomechanics & Springs</span>
        </button>

        <button
          role="tab"
          [attr.aria-selected]="activeTab() === 'evoo'"
          (click)="activeTab.set('evoo')"
          class="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 min-h-[44px] cursor-pointer touch-manipulation"
          [ngClass]="activeTab() === 'evoo' ? 'bg-teal-500 text-zinc-950 font-bold shadow-lg shadow-teal-500/20' : 'bg-zinc-900/70 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'">
          <span>🫒 Mountain EVOO & Wild Horta</span>
        </button>

        <button
          role="tab"
          [attr.aria-selected]="activeTab() === 'circadian'"
          (click)="activeTab.set('circadian')"
          class="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 min-h-[44px] cursor-pointer touch-manipulation"
          [ngClass]="activeTab() === 'circadian' ? 'bg-teal-500 text-zinc-950 font-bold shadow-lg shadow-teal-500/20' : 'bg-zinc-900/70 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'">
          <span>☀️ Arcadian Eudaimonia & Sleep</span>
        </button>
      </div>

      <!-- TAB 1: TAYGETOS BOTANICAL PHARMACOPOEIA -->
      @if (activeTab() === 'botanicals') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          <!-- Botanical List -->
          <div class="lg:col-span-5 flex flex-col gap-3">
            <h3 class="text-sm font-bold text-teal-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Alpine Flora of Akovos</span>
              <span class="text-xs text-zinc-400 font-mono font-normal">{{ longevityService.botanicals().length }} Endemic Specimens</span>
            </h3>
            
            @for (b of longevityService.botanicals(); track b.id) {
              <div
                (click)="longevityService.selectBotanical(b.id)"
                class="p-4 rounded-xl border transition-all cursor-pointer touch-manipulation"
                [ngClass]="longevityService.selectedBotanicalId() === b.id ? 'bg-teal-950/40 border-teal-500 shadow-md shadow-teal-500/10' : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-800/50 hover:border-zinc-700'">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">{{ b.icon }}</span>
                    <div>
                      <h4 class="font-bold text-sm text-zinc-100">{{ b.englishName }}</h4>
                      <p class="text-xs text-teal-400 font-serif italic">{{ b.greekName }}</p>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {{ b.polyphenolContentMgG }} mg/g
                  </span>
                </div>
                <div class="mt-2.5 flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                  <span>📍 {{ b.altitudeZoneMeters }}</span>
                </div>
              </div>
            }
          </div>

          <!-- Botanical Deep Dive Detail Card -->
          <div class="lg:col-span-7 bg-zinc-900/60 border border-teal-500/30 rounded-xl p-6 flex flex-col justify-between">
            @let item = longevityService.selectedBotanical();
            <div>
              <div class="flex items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div class="flex items-center gap-3">
                  <span class="text-3xl p-2 bg-teal-500/10 rounded-xl border border-teal-500/30">{{ item.icon }}</span>
                  <div>
                    <h3 class="text-lg font-bold text-white">{{ item.englishName }}</h3>
                    <p class="text-xs text-teal-300 font-mono">{{ item.botanicalTaxonomy }} • <span class="font-serif italic">{{ item.greekName }}</span></p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] uppercase font-mono text-zinc-400">Total Bioactive Phenolics</div>
                  <div class="text-xl font-extrabold text-teal-300 font-mono">{{ item.polyphenolContentMgG }} <span class="text-xs font-normal text-zinc-400">mg GAE/g</span></div>
                </div>
              </div>

              <!-- Key Phytochemicals Badges -->
              <div class="mt-4">
                <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Key Bioactive Phytochemicals:</div>
                <div class="flex flex-wrap gap-1.5">
                  @for (chem of item.keyPhytochemicals; track chem) {
                    <span class="px-2.5 py-1 rounded-md text-xs font-mono bg-teal-900/40 text-teal-200 border border-teal-700/50">
                      ⚡ {{ chem }}
                    </span>
                  }
                </div>
              </div>

              <!-- Mechanism of Action -->
              <div class="mt-4 p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <div class="text-xs font-bold text-sky-400 uppercase tracking-wide mb-1">🔬 Cellular Longevity Mechanism:</div>
                <p class="text-xs text-zinc-300 leading-relaxed">{{ item.mechanismOfAction }}</p>
              </div>

              <!-- Preparation Protocol -->
              <div class="mt-4 p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
                <div class="text-xs font-bold text-amber-300 uppercase tracking-wide mb-1">🍵 Traditional Arcadian Preparation:</div>
                <p class="text-xs text-zinc-300 leading-relaxed">{{ item.traditionalPreparation }}</p>
                <div class="mt-2 text-xs font-mono text-amber-200 font-semibold">
                  ⏱️ Target Intake: {{ item.dailyDoseOrFrequency }}
                </div>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>Clinical Target: <strong class="text-zinc-200">{{ item.clinicalLongevityTarget }}</strong></span>
              <span class="font-mono text-teal-400">Wild-Harvested • Non-GMO</span>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: INCLINE BIOMECHANICS & SPRINGS -->
      @if (activeTab() === 'incline') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          <!-- Incline Walking Calculator -->
          <div class="lg:col-span-6 bg-zinc-900/60 border border-teal-500/30 rounded-xl p-6">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xl">⛰️</span>
              <h3 class="text-base font-bold text-white">Kalderimia Incline & Glucose Disposal Simulator</h3>
            </div>
            <p class="text-xs text-zinc-400 mb-6">
              Akovos's historic stone paths feature a natural 15–25% slope, generating high eccentric muscular tension and rapid postprandial GLUT-4 translocation.
            </p>

            <!-- Interactive Sliders -->
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Body Weight (kg):</span>
                  <span class="font-mono font-bold text-teal-400">{{ userWeightKg() }} kg</span>
                </div>
                <input type="range" min="45" max="130" [(ngModel)]="userWeightKg" class="w-full accent-teal-400 cursor-pointer" />
              </div>

              <div>
                <div class="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Walk Duration (minutes):</span>
                  <span class="font-mono font-bold text-teal-400">{{ walkMinutes() }} min</span>
                </div>
                <input type="range" min="15" max="90" step="5" [(ngModel)]="walkMinutes" class="w-full accent-teal-400 cursor-pointer" />
              </div>

              <div>
                <div class="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Trail Grade / Incline Slope:</span>
                  <span class="font-mono font-bold text-teal-400">{{ inclineGrade() }}% (Village Grade)</span>
                </div>
                <input type="range" min="5" max="30" step="1" [(ngModel)]="inclineGrade" class="w-full accent-teal-400 cursor-pointer" />
              </div>
            </div>

            <!-- Calculation Output Cards -->
            @let calc = currentInclineResult();
            <div class="grid grid-cols-2 gap-3 mt-6">
              <div class="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <div class="text-[10px] text-zinc-400 uppercase font-mono">Calories Burned</div>
                <div class="text-xl font-bold text-teal-300 font-mono">{{ calc.estimatedCaloriesBurned }} <span class="text-xs font-normal text-zinc-400">kcal</span></div>
                <div class="text-[10px] text-zinc-500 font-mono mt-0.5">MET {{ calc.metabolicEquivalent }}x vs Flat Ground</div>
              </div>

              <div class="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800">
                <div class="text-[10px] text-zinc-400 uppercase font-mono">Post-Meal Glucose Drop</div>
                <div class="text-xl font-bold text-emerald-400 font-mono">-{{ calc.postprandialGlucoseDropMgDl }} <span class="text-xs font-normal text-zinc-400">mg/dL</span></div>
                <div class="text-[10px] text-zinc-500 font-mono mt-0.5">GLUT-4 Insulin Sensitizing</div>
              </div>
            </div>
          </div>

          <!-- Pure Mountain Springs Profile -->
          <div class="lg:col-span-6 flex flex-col gap-4">
            <h3 class="text-sm font-bold text-sky-300 uppercase tracking-wider flex items-center justify-between">
              <span>💧 Akovos Alpine Limestone Springs</span>
              <span class="text-xs text-zinc-400 font-mono font-normal">0% Microplastics</span>
            </h3>

            @for (sp of longevityService.springProfiles(); track sp.name) {
              <div class="p-5 rounded-xl bg-zinc-900/60 border border-sky-500/30">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-bold text-white text-sm">{{ sp.name }}</h4>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-700">
                    {{ sp.altitudeMeters }}m Elev.
                  </span>
                </div>
                <p class="text-xs text-zinc-400 mb-3">{{ sp.hydrologicalSource }}</p>
                <div class="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                  <div>
                    <div class="text-[10px] text-zinc-500">pH Level</div>
                    <div class="text-sky-300 font-bold">{{ sp.waterPh }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] text-zinc-500">Magnesium</div>
                    <div class="text-emerald-300 font-bold">{{ sp.magnesiumMgL }} mg/L</div>
                  </div>
                  <div>
                    <div class="text-[10px] text-zinc-500">Calcium</div>
                    <div class="text-amber-300 font-bold">{{ sp.calciumMgL }} mg/L</div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 3: MOUNTAIN EVOO & WILD HORTA -->
      @if (activeTab() === 'evoo') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          <div class="lg:col-span-6 bg-zinc-900/60 border border-amber-500/30 rounded-xl p-6">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-2xl">🫒</span>
              <h3 class="text-base font-bold text-white">Arcadian Mountain Extra Virgin Olive Oil</h3>
            </div>
            <p class="text-xs text-zinc-300 leading-relaxed mb-4">
              Grown on dry-farmed mountain terraces under intense Peloponnesian sunlight, Akovos olive trees experience mild drought stress that stimulates massive polyphenol synthesis (>800 mg/kg).
            </p>
            <div class="space-y-3 font-mono text-xs">
              <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center">
                <span class="text-zinc-400">Oleocanthal (Natural COX Inhibitor):</span>
                <span class="text-amber-300 font-bold">> 450 mg/kg</span>
              </div>
              <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center">
                <span class="text-zinc-400">Oleacein (Endothelial Protector):</span>
                <span class="text-emerald-300 font-bold">> 350 mg/kg</span>
              </div>
              <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center">
                <span class="text-zinc-400">Anti-Inflammatory Equivalent:</span>
                <span class="text-teal-300 font-bold">~9mg Ibuprofen per 50mL</span>
              </div>
            </div>
          </div>

          <div class="lg:col-span-6 bg-zinc-900/60 border border-emerald-500/30 rounded-xl p-6">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-2xl">🥗</span>
              <h3 class="text-base font-bold text-white">The Arcadian Forager's Plate (Horta)</h3>
            </div>
            <p class="text-xs text-zinc-300 leading-relaxed mb-4">
              Wild chicory, dandelion (*Radiki*), and sow thistle (*Zochos*) deliver exceptional inulin prebiotic fiber, feeding <em class="text-emerald-300">Akkermansia muciniphila</em> for gut barrier integrity.
            </p>
            <div class="space-y-2 text-xs">
              <div class="flex items-center gap-2 text-zinc-300">
                <span class="text-emerald-400 font-bold">✓</span>
                <span><strong>Radiki (Wild Dandelion):</strong> Bitter taraxacin stimulates liver bile & phase-2 enzymes.</span>
              </div>
              <div class="flex items-center gap-2 text-zinc-300">
                <span class="text-emerald-400 font-bold">✓</span>
                <span><strong>Zochos (Sow Thistle):</strong> High antioxidant lutein protecting retinal macula & vascular walls.</span>
              </div>
              <div class="flex items-center gap-2 text-zinc-300">
                <span class="text-emerald-400 font-bold">✓</span>
                <span><strong>Stamnagathi:</strong> Extreme omega-3 ALA & glutathione precursor reserves.</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- TAB 4: ARCADIAN EUDAIMONIA & CIRCADIAN SLEEP -->
      @if (activeTab() === 'circadian') {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          
          <div class="bg-zinc-900/60 border border-amber-500/30 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div class="text-2xl mb-2">🌅</div>
              <h4 class="font-bold text-white text-sm mb-1.5">Taygetos Sunrise Priming</h4>
              <p class="text-xs text-zinc-300 leading-relaxed">
                Early morning high-altitude photons stimulate retinal melanopsin ganglion cells, anchoring dopamine and setting the 14-hour melatonin release timer.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-amber-300">
              ⏰ 06:45 – 07:30 AM Peak Lux
            </div>
          </div>

          <div class="bg-zinc-900/60 border border-teal-500/30 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div class="text-2xl mb-2">☕</div>
              <h4 class="font-bold text-white text-sm mb-1.5">Platia Co-Regulation (Eudaimonia)</h4>
              <p class="text-xs text-zinc-300 leading-relaxed">
                Afternoon gatherings in the central village square foster multi-generational storytelling, oxytocin release, and radical reduction of cortisol allostatic load.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-teal-300">
              🤝 Zero Chronic Social Isolation
            </div>
          </div>

          <div class="bg-zinc-900/60 border border-sky-500/30 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div class="text-2xl mb-2">🌌</div>
              <h4 class="font-bold text-white text-sm mb-1.5">Alpine Deep Delta Sleep</h4>
              <p class="text-xs text-zinc-300 leading-relaxed">
                Nightly mountain breezes cool the village to 15–18°C, lowering core body temperature rapidly to maximize deep non-REM stage-3 and stage-4 slow-wave sleep.
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-sky-300">
              💤 +28% Glymphatic Clearance
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class AkovosLongevityHubComponent {
  readonly longevityService = inject(AkovosLongevityService);
  
  readonly activeTab = signal<AkovosTab>('botanicals');
  readonly userWeightKg = signal<number>(75);
  readonly walkMinutes = signal<number>(45);
  readonly inclineGrade = signal<number>(18);

  readonly currentInclineResult = computed(() => {
    return this.longevityService.calculateInclineBiomechanics(
      this.userWeightKg(),
      this.walkMinutes(),
      this.inclineGrade()
    );
  });
}
