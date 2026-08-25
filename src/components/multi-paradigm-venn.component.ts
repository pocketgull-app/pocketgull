import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type VennIntersectionKey = 'all' | 'western_functional_epigenetic' | 'western_functional' | 'functional_epigenetic' | 'western_epigenetic' | 'western' | 'functional' | 'epigenetic';

export interface IVennRegionData {
  key: VennIntersectionKey;
  label: string;
  confidence: number; // 0-100%
  colorClass: string;
  biomarkers: string[];
  recommendation: string;
}

@Component({
  selector: 'app-multi-paradigm-venn',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-lg flex flex-col gap-6 font-sans">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 font-mono">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs uppercase font-extrabold tracking-widest text-indigo-500 dark:text-indigo-400">Diagnostic Consensus Engine</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              3-Set Venn Triangulation
            </span>
          </div>
          <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">Multi-Paradigm Intersection Matrix</h3>
        </div>

        <!-- Active Region Badge -->
        <div class="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-950 px-3 py-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <span class="text-zinc-400">Selected:</span>
          <span class="font-bold text-zinc-900 dark:text-zinc-100">{{ activeRegion().label }}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold" [class]="activeRegion().colorClass">
            {{ activeRegion().confidence }}% Confidence
          </span>
        </div>
      </div>

      <!-- Main Layout: Interactive Venn Diagram + Data Panel -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        <!-- SVG Interactive 3-Set Venn Diagram -->
        <div class="relative flex justify-center items-center p-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-inner">
          <svg viewBox="0 0 400 360" class="w-full max-w-[360px] h-auto overflow-visible select-none">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <!-- Western Circle (Top Left) -->
            <circle cx="160" cy="140" r="100"
              (click)="selectedKey.set('western')"
              [attr.fill-opacity]="selectedKey() === 'western' ? '0.45' : '0.2'"
              class="fill-blue-500 stroke-blue-500 stroke-2 cursor-pointer transition-all hover:fill-opacity-40" />

            <!-- Functional Circle (Top Right) -->
            <circle cx="240" cy="140" r="100"
              (click)="selectedKey.set('functional')"
              [attr.fill-opacity]="selectedKey() === 'functional' ? '0.45' : '0.2'"
              class="fill-emerald-500 stroke-emerald-500 stroke-2 cursor-pointer transition-all hover:fill-opacity-40" />

            <!-- Epigenetics Circle (Bottom Center) -->
            <circle cx="200" cy="220" r="100"
              (click)="selectedKey.set('epigenetic')"
              [attr.fill-opacity]="selectedKey() === 'epigenetic' ? '0.45' : '0.2'"
              class="fill-purple-500 stroke-purple-500 stroke-2 cursor-pointer transition-all hover:fill-opacity-40" />

            <!-- Central Triple Consensus Touch Target (W ∩ F ∩ E) -->
            <circle cx="200" cy="165" r="32"
              (click)="selectedKey.set('western_functional_epigenetic')"
              [attr.fill-opacity]="selectedKey() === 'western_functional_epigenetic' ? '0.85' : '0.5'"
              filter="url(#glow)"
              class="fill-amber-400 stroke-amber-300 stroke-2 cursor-pointer transition-all hover:fill-opacity-90 animate-pulse" />

            <!-- Circle Labels -->
            <text x="110" y="80" class="text-xs font-bold fill-blue-600 dark:fill-blue-400 font-mono">Western Pathology (W)</text>
            <text x="230" y="80" class="text-xs font-bold fill-emerald-600 dark:fill-emerald-400 font-mono">Functional (F)</text>
            <text x="145" y="340" class="text-xs font-bold fill-purple-600 dark:fill-purple-400 font-mono">Epigenetics (E)</text>

            <!-- Center Intersection Label -->
            <text x="200" y="169" text-anchor="middle" class="text-[11px] font-black fill-zinc-950 font-mono pointer-events-none">
              W∩F∩E
            </text>
          </svg>
        </div>

        <!-- Intersection Findings & Clinical Recommendations Panel -->
        <div class="flex flex-col gap-4 p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          
          <div class="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 font-mono">
              <span>🎯 Consensus Profile:</span>
              <span>{{ activeRegion().label }}</span>
            </h4>
            <span class="text-xs font-mono font-bold px-2 py-0.5 rounded border" [class]="activeRegion().colorClass">
              {{ activeRegion().confidence }}% Certainty
            </span>
          </div>

          <!-- Biomarkers List -->
          <div>
            <span class="text-[11px] font-mono uppercase font-bold text-zinc-400 block mb-2">Overlapping Biomarkers & Indicators:</span>
            <div class="flex flex-wrap gap-1.5">
              @for (b of activeRegion().biomarkers; track b) {
                <span class="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs">
                  🔬 {{ b }}
                </span>
              }
            </div>
          </div>

          <!-- Clinical Recommendation -->
          <div class="mt-2 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
            <span class="text-[11px] font-mono uppercase font-bold text-indigo-400 block mb-1">💡 Integrative Actionable Recommendation:</span>
            <p class="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
              {{ activeRegion().recommendation }}
            </p>
          </div>

          <!-- Region Selection Buttons -->
          <div class="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-1">
            <button (click)="selectedKey.set('western_functional_epigenetic')"
              [class.bg-amber-500]="selectedKey() === 'western_functional_epigenetic'"
              [class.text-white]="selectedKey() === 'western_functional_epigenetic'"
              class="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold border border-amber-500/40 transition cursor-pointer">
              🌟 Triple Consensus (W∩F∩E)
            </button>
            <button (click)="selectedKey.set('western_functional')"
              [class.bg-blue-600]="selectedKey() === 'western_functional'"
              [class.text-white]="selectedKey() === 'western_functional'"
              class="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold border border-blue-500/40 transition cursor-pointer">
              W ∩ F
            </button>
            <button (click)="selectedKey.set('functional_epigenetic')"
              [class.bg-emerald-600]="selectedKey() === 'functional_epigenetic'"
              [class.text-white]="selectedKey() === 'functional_epigenetic'"
              class="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold border border-emerald-500/40 transition cursor-pointer">
              F ∩ E
            </button>
            <button (click)="selectedKey.set('western_epigenetic')"
              [class.bg-purple-600]="selectedKey() === 'western_epigenetic'"
              [class.text-white]="selectedKey() === 'western_epigenetic'"
              class="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold border border-purple-500/40 transition cursor-pointer">
              W ∩ E
            </button>
          </div>

        </div>
      </div>
    </div>
  `
})
export class MultiParadigmVennComponent {
  selectedKey = signal<VennIntersectionKey>('western_functional_epigenetic');

  private regions: Record<VennIntersectionKey, IVennRegionData> = {
    all: {
      key: 'all',
      label: 'All Paradigms Overview',
      confidence: 100,
      colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      biomarkers: ['hs-CRP', 'dnMet-Age', 'HRV Resonance', 'Homocysteine'],
      recommendation: 'Comprehensive multi-system synchronization across all diagnostic paradigms.'
    },
    western_functional_epigenetic: {
      key: 'western_functional_epigenetic',
      label: 'Triple Consensus (W ∩ F ∩ E)',
      confidence: 100,
      colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40',
      biomarkers: ['hs-CRP Elevated (>3.0 mg/L)', 'DNAm GrimAge Acceleration (+4.2 yrs)', 'Mitochondrial ATP Efficiency Low', 'Endothelial Glycocalyx Thinning'],
      recommendation: 'High-certainty root cause: Chronic Low-Grade Systemic Inflammation triggering accelerated epigenetic aging. Priority: Initiate anti-inflammatory nutrition protocol & 0.1 Hz vagal breathing.'
    },
    western_functional: {
      key: 'western_functional',
      label: 'Western ∩ Functional (W ∩ F)',
      confidence: 85,
      colorClass: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40',
      biomarkers: ['Fasting Triglycerides (>150 mg/dL)', 'Organic Acid Methylmalonate', 'Small Dense LDL Particles'],
      recommendation: 'Metabolic & Mitochondrial stress confirmed by pathology and organic acid panels. Optimize insulin sensitivity and NAD+ cofactors.'
    },
    functional_epigenetic: {
      key: 'functional_epigenetic',
      label: 'Functional ∩ Epigenetics (F ∩ E)',
      confidence: 90,
      colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
      biomarkers: ['Telomere Attrition Rate', 'Glutathione Depletion', 'Methylation Index (SAM/SAH)'],
      recommendation: 'Subclinical cellular aging driven by oxidative stress and undermethylation. Support phase II liver detox and folate cycle balance.'
    },
    western_epigenetic: {
      key: 'western_epigenetic',
      label: 'Western ∩ Epigenetics (W ∩ E)',
      confidence: 80,
      colorClass: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40',
      biomarkers: ['Arterial Stiffness (Pulse Wave Velocity)', 'Horvath Clock Acceleration'],
      recommendation: 'Structural vascular remodeling correlates with biological age acceleration. Implement nitric oxide precursors & aerobic zone 2 training.'
    },
    western: {
      key: 'western',
      label: 'Western Pathology Only (W)',
      confidence: 70,
      colorClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40',
      biomarkers: ['Systolic BP 138 mmHg', 'LDL-C 142 mg/dL'],
      recommendation: 'Isolated standard lab abnormalities. Cross-correlate with functional biomarker panels to determine subclinical etiology.'
    },
    functional: {
      key: 'functional',
      label: 'Functional Biochemistry Only (F)',
      confidence: 75,
      colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
      biomarkers: ['Gut Microbiome Dysbiosis Ratio', 'Elevated Urinary Indican'],
      recommendation: 'Functional gastrointestinal dysbiosis. Optimize gut mucosal barrier and probiotic diversity.'
    },
    epigenetic: {
      key: 'epigenetic',
      label: 'Epigenetic Longevity Only (E)',
      confidence: 65,
      colorClass: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40',
      biomarkers: ['CD8+ T-cell Senescence Score'],
      recommendation: 'Immunosenescence markers detected. Incorporate autophagy-inducing fasting windows and senolytic polyphenol support.'
    }
  };

  activeRegion = computed(() => this.regions[this.selectedKey()]);
}
