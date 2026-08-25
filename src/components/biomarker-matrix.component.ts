import { Component, ChangeDetectionStrategy, input, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';

interface IBiomarkerStatus {
  name: string;
  level: 'Deficient' | 'Sub-optimal' | 'Optimal' | 'High' | 'Excess';
  pathway: string;
}

/** WHO/CDC clinical reference guidelines mapped to biomarker names. */
const WHO_CDC_GUIDELINES: Record<string, string> = {
  'Magnesium':     'WHO RNI: 220–260 mg/day (adults). CDC notes Mg deficiency linked to type 2 diabetes, CVD, and osteoporosis.',
  'Vitamin D3':    'WHO: 5–15 µg/day (200–600 IU). CDC: serum 25(OH)D ≥20 ng/mL sufficient; ≥30 ng/mL optimal for bone health.',
  'Vitamin B12':   'WHO RNI: 2.4 µg/day. CDC: serum B12 <200 pg/mL indicates deficiency; methylmalonic acid confirms.',
  'Folate (B9)':   'WHO RNI: 400 µg DFE/day. CDC: ≥400 µg folic acid pre-conception reduces NTD risk by 50–70%.',
  'Zinc':          'WHO RNI: 4.9–7.0 mg/day (females), 7.0–9.8 mg/day (males). CDC: zinc supplementation reduces diarrhea duration 25%.',
  'Homocysteine':  'WHO: >15 µmol/L = hyperhomocysteinemia. CDC: elevated Hcy independently associated with CVD and stroke risk.',
  'Ferritin':      'WHO: serum ferritin <15 µg/L = iron deficiency. CDC: 12–150 ng/mL (females), 12–300 ng/mL (males) normal range.',
  'Vitamin C':     'WHO RNI: 45 mg/day. CDC: serum ascorbic acid <11.4 µmol/L = deficiency; scurvy risk below 10 mg/day intake.',
};

@Component({
  selector: 'app-biomarker-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (biomarkers().length > 0) {
      <div class="mb-8 mt-4 bg-zinc-900/5 dark:bg-black/20 rounded-2xl p-4 md:p-6 border border-emerald-900/10 dark:border-emerald-500/10 shadow-inner relative overflow-hidden">
        <!-- Glowing background effect -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl rounded-full"></div>
        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full"></div>

        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-4 md:mb-6">
            <div class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm md:text-base font-bold text-gray-900 dark:text-emerald-50 uppercase tracking-widest">
                {{ personaBiomarkerTitle() }}
              </h3>
              <p class="text-[10px] md:text-xs text-gray-600 dark:text-emerald-400/80 uppercase tracking-widest mt-0.5">Orthomolecular Telemetry Status</p>
            </div>
            <!-- Global WHO/CDC toggle -->
            <label class="flex items-center gap-1.5 cursor-pointer select-none group shrink-0" title="Show WHO/CDC clinical guidelines for all biomarkers">
              <input type="checkbox" class="sr-only peer" (change)="toggleAllGuidelines()" [checked]="allGuidelinesExpanded()">
              <div class="w-8 h-[18px] md:w-9 md:h-5 bg-gray-300 dark:bg-zinc-700 rounded-full relative transition-colors peer-checked:bg-sky-500 dark:peer-checked:bg-sky-600 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-400 peer-focus-visible:ring-offset-1">
                <div class="absolute left-0.5 top-0.5 w-3.5 h-3.5 md:w-4 md:h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-3.5 md:peer-checked:translate-x-4"
                     [class.translate-x-3.5]="allGuidelinesExpanded()"
                     [class.md:translate-x-4]="allGuidelinesExpanded()"></div>
              </div>
              <span class="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors whitespace-nowrap">WHO/CDC</span>
            </label>
          </div>

          @if (introText()) {
            <p class="text-[10px] md:text-xs text-gray-700 dark:text-zinc-300 mb-4 md:mb-6 leading-relaxed font-medium">
              {{ introText() }}
            </p>
          }

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            @for (marker of biomarkers(); track marker.name) {
              @let isCritical = marker.level === 'Deficient' || marker.level === 'Excess';
              @let isWarning = marker.level === 'Sub-optimal' || marker.level === 'High';
              @let isOptimal = marker.level === 'Optimal';
              @let isBiomarkerFlipped = isBiomarkerFlippedMethod(marker.name);
              @let guidelineVisible = isGuidelineExpanded(marker.name);
              @let guideline = getGuideline(marker.name);

              <div (dblclick)="toggleBiomarkerFlip(marker.name); $event.stopPropagation()"
                   class="relative perspective-1000 group cursor-pointer select-none h-48"
                   title="Double-click or click badge to flip over for Food-as-Medicine Sourcing Guide & Bioavailability">
                
                <div [class.rotate-y-180]="isBiomarkerFlipped"
                     class="relative w-full h-full transition-transform duration-500 transform-style-3d">

                  <!-- FRONT FACE -->
                  <div class="p-3 md:p-4 rounded-xl border flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden shadow-sm"
                       [class.bg-rose-500\/10]="isCritical"
                       [class.border-rose-500\/30]="isCritical"
                       [class.bg-amber-500\/10]="isWarning"
                       [class.border-amber-500\/30]="isWarning"
                       [class.bg-emerald-500\/10]="isOptimal"
                       [class.border-emerald-500\/30]="isOptimal">
                    <div>
                      <div class="flex items-center justify-between mb-1.5">
                        <span class="text-xs font-bold text-gray-900 dark:text-zinc-100 uppercase tracking-wider">{{ marker.name }}</span>
                        <button type="button" (click)="toggleBiomarkerFlip(marker.name, $event); $event.stopPropagation()"
                                class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 cursor-pointer transition">
                          dblclick 🔄
                        </button>
                      </div>
                      <div class="text-[11px] font-mono font-bold uppercase mb-2"
                           [class.text-rose-400]="isCritical"
                           [class.text-amber-400]="isWarning"
                           [class.text-emerald-400]="isOptimal">
                        {{ marker.level }}
                      </div>
                      <p class="text-[10px] text-gray-600 dark:text-zinc-400 leading-snug line-clamp-2">
                        {{ marker.pathway }}
                      </p>
                    </div>

                    @if (guidelineVisible && guideline) {
                      <div class="mt-1 p-1 rounded bg-sky-500/10 border border-sky-500/30 text-[9px] text-sky-300">
                        {{ guideline }}
                      </div>
                    }
                  </div>

                  <!-- BACK FACE -->
                  <div class="p-3 md:p-4 rounded-xl bg-emerald-950 text-white border border-emerald-500/40 shadow-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden font-sans text-xs">
                    <div>
                      <div class="flex items-center justify-between border-b border-emerald-800 pb-1 mb-1.5 font-mono text-[10px]">
                        <span class="text-emerald-300 font-bold uppercase flex items-center gap-1">
                          <span>🥗</span> Food-as-Medicine Sourcing
                        </span>
                        <button type="button" (click)="toggleBiomarkerFlip(marker.name, $event); $event.stopPropagation()"
                                class="text-emerald-400 hover:text-emerald-200 text-[9px] cursor-pointer">
                          dblclick 🔄 flip
                        </button>
                      </div>
                      <p class="text-[10px] text-emerald-100 leading-snug">
                        <strong>Dietary Sources:</strong> Pumpkin seeds, wild Alaskan salmon, organic dark leafy greens, grass-fed venison.
                      </p>
                    </div>
                    <div class="pt-1 border-t border-emerald-900 font-mono text-[9px] text-emerald-400 flex justify-between">
                      <span>Bioavailability Optimized</span>
                      <span>Double-click to return</span>
                    </div>
                  </div>

                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
  `]
})
export class BiomarkerMatrixComponent {
  reportText = input<string>('');
  protected readonly themeService = inject(ThemeService);

  readonly personaBiomarkerTitle = computed(() => {
    return '🔬 Biomarker Matrix Telemetry';
  });

  /** Track which biomarker guideline cards are expanded */
  private expandedGuidelines = signal<Set<string>>(new Set());

  /** Whether all guidelines are toggled on globally */
  allGuidelinesExpanded = signal(false);

  /** Toggle an individual biomarker's WHO/CDC guideline visibility */
  toggleGuideline(name: string): void {
    const current = new Set(this.expandedGuidelines());
    if (current.has(name)) {
      current.delete(name);
    } else {
      current.add(name);
    }
    this.expandedGuidelines.set(current);
    // Sync the global toggle state
    this.allGuidelinesExpanded.set(current.size === this.biomarkers().length);
  }

  /** Toggle all guidelines on/off */
  toggleAllGuidelines(): void {
    const nextState = !this.allGuidelinesExpanded();
    this.allGuidelinesExpanded.set(nextState);
    if (nextState) {
      this.expandedGuidelines.set(new Set(this.biomarkers().map(m => m.name)));
    } else {
      this.expandedGuidelines.set(new Set());
    }
  }

  readonly flippedBiomarkers = signal<Set<string>>(new Set());

  private lastBiomarkerFlipTime = 0;

  toggleBiomarkerFlip(name: string, event?: Event) {
    if (event) event.stopPropagation();
    const now = Date.now();
    if (now - this.lastBiomarkerFlipTime < 200) return;
    this.lastBiomarkerFlipTime = now;
    const set = new Set(this.flippedBiomarkers());
    if (set.has(name)) set.delete(name);
    else set.add(name);
    this.flippedBiomarkers.set(set);
  }

  isBiomarkerFlipped(name: string): boolean {
    return this.flippedBiomarkers().has(name);
  }

  isBiomarkerFlippedMethod(name: string): boolean {
    return this.flippedBiomarkers().has(name);
  }

  getFoodSourcingGuide(name: string): string {
    const map: Record<string, string> = {
      'Magnesium': 'Organic pumpkin seeds, spinach, dark chocolate (85%+), avocados, and Maine mineral spring water.',
      'Vitamin D3': 'Wild-caught Maine salmon, cod liver oil, egg yolks, shiitake mushrooms, and 15 mins morning sunlight.',
      'Vitamin B12': 'Grass-fed beef liver, wild sardines, nutritional yeast, clams, and pasture-raised eggs.',
      'Folate (B9)': 'L-5-MTHF rich foods: dark leafy greens, asparagus, lentils, broccoli, and organic avocado.',
      'Zinc': 'Wild oysters, pumpkin seeds, grass-fed lamb, hemp seeds, and pasture-raised poultry.',
      'Homocysteine': 'Reduce refined grains. Support clearance with bioactive L-methylfolate, P5P (B6), and Methyl-B12.',
      'Ferritin': 'Heme iron: wild venison, grass-fed beef. Non-heme: cooked lentils with Vitamin C (lemon juice) to triple absorption.',
      'Vitamin C': 'Wild Maine blueberries, rose hips, acerola cherry, bell peppers, and fresh spruce needle tea.'
    };
    return map[name] ?? 'Whole food sources rich in co-factors support bioavailable enzymatic conversion.';
  }

  /** Check if a specific guideline is expanded */
  isGuidelineExpanded(name: string): boolean {
    return this.expandedGuidelines().has(name);
  }

  /** Get the WHO/CDC guideline for a given biomarker name */
  getGuideline(name: string): string | null {
    return WHO_CDC_GUIDELINES[name] ?? null;
  }

  introText = computed(() => {
    const text = this.reportText();
    if (!text) return '';
    const match = text.match(/###\s*(?:Biochemical\s*\&\s*)?Biomarker\s*Matrix\s*\n([\s\S]*?)(?:```|###|$)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    return '';
  });

  // Auto-parse the AI markdown report to find implied biomarker statuses
  biomarkers = computed(() => {
    const text = this.reportText();
    if (!text) return [];

    const markers: IBiomarkerStatus[] = [];
    const dictionary = [
      { name: 'Magnesium', pathway: 'ATP Synthesis / NMDA' },
      { name: 'Vitamin D3', pathway: 'Immune / Bone' },
      { name: 'Vitamin B12', pathway: 'Methylation' },
      { name: 'Folate (B9)', pathway: 'Methylation / DNA' },
      { name: 'Zinc', pathway: 'Immune / Hormones' },
      { name: 'Homocysteine', pathway: 'Cardiovascular / Methylation' },
      { name: 'Ferritin', pathway: 'Iron Storage / Thyroid' },
      { name: 'Vitamin C', pathway: 'Collagen / Antioxidant' }
    ];

    // Strategy 1: Look for JSON code blocks or raw JSON arrays
    let jsonText: string | null = null;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)(?:```|$)/i);
    if (jsonMatch && jsonMatch[1]) {
      jsonText = jsonMatch[1].trim();
    } else {
      const rawArrayMatch = text.match(/(\[\s*\{\s*"name"[\s\S]*?\])/i);
      if (rawArrayMatch && rawArrayMatch[1]) {
        jsonText = rawArrayMatch[1].trim();
      }
    }

    if (jsonText) {
      try {
        let jsonStr = jsonText;
        // Handle potentially incomplete JSON if streaming
        if (!jsonStr.endsWith(']')) {
          const lastCurly = jsonStr.lastIndexOf('}');
          if (lastCurly !== -1) {
            jsonStr = jsonStr.substring(0, lastCurly + 1) + '\n]';
            if (!jsonStr.startsWith('[')) {
              jsonStr = '[\n' + jsonStr;
            }
          }
        }
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          parsed.forEach(item => {
            if (item && typeof item === 'object' && item.name) {
              const matchedDict = dictionary.find(d => d.name.toLowerCase() === item.name.toLowerCase());
              const name = matchedDict ? matchedDict.name : item.name;
              const pathway = item.pathway || (matchedDict ? matchedDict.pathway : 'Metabolic Pathway');
              const levelLower = String(item.level || '').toLowerCase();
              let level: IBiomarkerStatus['level'] = 'Optimal';
              if (levelLower.includes('defic') || levelLower === 'low') level = 'Deficient';
              else if (levelLower === 'sub-optimal') level = 'Sub-optimal';
              else if (levelLower === 'high') level = 'High';
              else if (levelLower === 'excess') level = 'Excess';
              else if (levelLower === 'optimal') level = 'Optimal';

              markers.push({ name, level, pathway });
            }
          });
        }
      } catch (e) {
        // If parsing fails, try custom regex extraction of individual objects
        const objRegex = /\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"level"\s*:\s*"([^"]+)"\s*,\s*"pathway"\s*:\s*"([^"]+)"\s*\}/gi;
        let match;
        while ((match = objRegex.exec(jsonText)) !== null) {
          const name = match[1];
          const levelStr = match[2].toLowerCase();
          const pathway = match[3];
          let level: IBiomarkerStatus['level'] = 'Optimal';
          if (levelStr.includes('defic') || levelStr === 'low') level = 'Deficient';
          else if (levelStr === 'sub-optimal') level = 'Sub-optimal';
          else if (levelStr === 'high') level = 'High';
          else if (levelStr === 'excess') level = 'Excess';

          markers.push({ name, level, pathway });
        }
      }
    }

    // If Strategy 1 successfully extracted markers, return them
    if (markers.length > 0) {
      return markers;
    }

    // Strategy 2: Heuristic regex fallback
    const textLower = text.toLowerCase();
    dictionary.forEach(d => {
      // Look for the biomarker name near words like deficient, low, optimal, high
      const regex = new RegExp(`(?:${d.name.toLowerCase().replace(/\\(.+\\)/, '').trim()}).{0,40}(deficient|deficiency|low|sub-optimal|optimal|high|excess)`, 'i');
      const match = textLower.match(regex);
      if (match) {
        const val = match[1].toLowerCase();
        let level: IBiomarkerStatus['level'] = 'Optimal';
        if (val.includes('defic') || val === 'low') level = 'Deficient';
        if (val === 'sub-optimal') level = 'Sub-optimal';
        if (val === 'high') level = 'High';
        if (val === 'excess') level = 'Excess';
        
        markers.push({ name: d.name, level, pathway: d.pathway });
      } else {
        // Look backwards as well (e.g., "deficient in magnesium")
        const reverseRegex = new RegExp(`(deficient|deficiency|low|sub-optimal|optimal|high|excess).{0,40}(?:${d.name.toLowerCase().replace(/\\(.+\\)/, '').trim()})`, 'i');
        const revMatch = textLower.match(reverseRegex);
        if (revMatch) {
          const val = revMatch[1].toLowerCase();
          let level: IBiomarkerStatus['level'] = 'Optimal';
          if (val.includes('defic') || val === 'low') level = 'Deficient';
          if (val === 'sub-optimal') level = 'Sub-optimal';
          if (val === 'high') level = 'High';
          if (val === 'excess') level = 'Excess';
          
          markers.push({ name: d.name, level, pathway: d.pathway });
        }
      }
    });

    return markers;
  });
}
