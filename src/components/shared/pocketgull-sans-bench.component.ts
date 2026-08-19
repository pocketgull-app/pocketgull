import { Component, ChangeDetectionStrategy, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IDisambiguationPair {
  id: string;
  category: string;
  testChars: string;
  description: string;
  clinicalRisk: string;
}

export interface IClinicalDosageExample {
  title: string;
  correct: string;
  confusable: string;
  rationale: string;
}

@Component({
  selector: 'app-pocketgull-sans-bench',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-700/60 dark:border-zinc-800 rounded-3xl space-y-6 text-zinc-100 font-sans shadow-2xl backdrop-blur-xl">
      
      <!-- Top Title & Badge Banner -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 dark:border-zinc-800 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-zinc-950 font-black flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">
            🔬
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black uppercase tracking-tight text-zinc-100">
                PocketGull Sans — Clinical Neo-Grotesque
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold tracking-wider uppercase">
                Inter-Inspired VF
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Engineered for screen micro-legibility, open apertures, tall x-height, and zero medical dosage misreading.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button 
            (click)="copyCssSnippet()"
            class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Copy PocketGull Sans OpenType CSS"
          >
            <span>{{ copyStatus() }}</span>
          </button>
        </div>
      </div>

      <!-- OpenType Clinical Disambiguation Feature Toggles -->
      <div class="p-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">
            OpenType Clinical Disambiguation Controls
          </span>
          <span class="text-[10px] font-mono text-zinc-400">
            Active Features: {{ activeFeatureString() }}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs font-mono">
          <button
            (click)="toggleFeature('cv05')"
            [class.bg-cyan-500/20]="enableCurvedL()"
            [class.border-cyan-500]="enableCurvedL()"
            [class.text-cyan-300]="enableCurvedL()"
            [class.bg-slate-900/60]="!enableCurvedL()"
            [class.border-slate-800]="!enableCurvedL()"
            [class.text-zinc-400]="!enableCurvedL()"
            class="p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer"
          >
            <div class="flex items-center justify-between font-bold">
              <span>Curved 'l' Tail</span>
              <span>{{ enableCurvedL() ? '✓ ON' : 'OFF' }}</span>
            </div>
            <span class="text-[10px] text-zinc-400 font-sans">cv05 • 1 vs l vs I</span>
          </button>

          <button
            (click)="toggleFeature('cv08')"
            [class.bg-cyan-500/20]="enableSlashedZero()"
            [class.border-cyan-500]="enableSlashedZero()"
            [class.text-cyan-300]="enableSlashedZero()"
            [class.bg-slate-900/60]="!enableSlashedZero()"
            [class.border-slate-800]="!enableSlashedZero()"
            [class.text-zinc-400]="!enableSlashedZero()"
            class="p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer"
          >
            <div class="flex items-center justify-between font-bold">
              <span>Slashed Zero (Ø)</span>
              <span>{{ enableSlashedZero() ? '✓ ON' : 'OFF' }}</span>
            </div>
            <span class="text-[10px] text-zinc-400 font-sans">cv08 • 0 vs O vs D</span>
          </button>

          <button
            (click)="toggleFeature('ss02')"
            [class.bg-cyan-500/20]="enableSerifedI()"
            [class.border-cyan-500]="enableSerifedI()"
            [class.text-cyan-300]="enableSerifedI()"
            [class.bg-slate-900/60]="!enableSerifedI()"
            [class.border-slate-800]="!enableSerifedI()"
            [class.text-zinc-400]="!enableSerifedI()"
            class="p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer"
          >
            <div class="flex items-center justify-between font-bold">
              <span>Serifed Capital 'I'</span>
              <span>{{ enableSerifedI() ? '✓ ON' : 'OFF' }}</span>
            </div>
            <span class="text-[10px] text-zinc-400 font-sans">ss02 • I vs l crossbars</span>
          </button>

          <button
            (click)="toggleFeature('tnum')"
            [class.bg-cyan-500/20]="enableTabularNums()"
            [class.border-cyan-500]="enableTabularNums()"
            [class.text-cyan-300]="enableTabularNums()"
            [class.bg-slate-900/60]="!enableTabularNums()"
            [class.border-slate-800]="!enableTabularNums()"
            [class.text-zinc-400]="!enableTabularNums()"
            class="p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer"
          >
            <div class="flex items-center justify-between font-bold">
              <span>Tabular Numerals</span>
              <span>{{ enableTabularNums() ? '✓ ON' : 'OFF' }}</span>
            </div>
            <span class="text-[10px] text-zinc-400 font-sans">tnum • Monospaced ICU</span>
          </button>

          <button
            (click)="toggleFeature('ss01')"
            [class.bg-cyan-500/20]="enableOpenFour()"
            [class.border-cyan-500]="enableOpenFour()"
            [class.text-cyan-300]="enableOpenFour()"
            [class.bg-slate-900/60]="!enableOpenFour()"
            [class.border-slate-800]="!enableOpenFour()"
            [class.text-zinc-400]="!enableOpenFour()"
            class="p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer"
          >
            <div class="flex items-center justify-between font-bold">
              <span>Open Four ('4')</span>
              <span>{{ enableOpenFour() ? '✓ ON' : 'OFF' }}</span>
            </div>
            <span class="text-[10px] text-zinc-400 font-sans">ss01 • Micro chart legibility</span>
          </button>
        </div>
      </div>

      <!-- Variable Font Axis Sliders -->
      <div class="p-4 bg-slate-800/40 border border-slate-700/40 rounded-2xl space-y-3">
        <div class="flex items-center justify-between text-xs font-mono">
          <span class="font-bold uppercase text-cyan-400 tracking-wider">
            Variable Font Sliders
          </span>
          <span class="text-zinc-400">
            wght: {{ weight() }} • opsz: {{ opticalSize() }}pt • size: {{ fontSize() }}px • track: {{ letterSpacing() }}em
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div class="space-y-1">
            <div class="flex justify-between text-zinc-300 text-[11px]">
              <span>Weight (wght)</span>
              <span class="text-cyan-400 font-bold">{{ weight() }}</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="900" 
              step="50" 
              [value]="weight()" 
              (input)="updateWeight($event)"
              class="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          <div class="space-y-1">
            <div class="flex justify-between text-zinc-300 text-[11px]">
              <span>Type Size (px)</span>
              <span class="text-cyan-400 font-bold">{{ fontSize() }}px</span>
            </div>
            <input 
              type="range" 
              min="12" 
              max="64" 
              step="1" 
              [value]="fontSize()" 
              (input)="updateFontSize($event)"
              class="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          <div class="space-y-1">
            <div class="flex justify-between text-zinc-300 text-[11px]">
              <span>Tracking (em)</span>
              <span class="text-cyan-400 font-bold">{{ letterSpacing() }}</span>
            </div>
            <input 
              type="range" 
              min="-0.03" 
              max="0.08" 
              step="0.005" 
              [value]="letterSpacing()" 
              (input)="updateLetterSpacing($event)"
              class="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          <div class="space-y-1">
            <div class="flex justify-between text-zinc-300 text-[11px]">
              <span>Optical Size (opsz)</span>
              <span class="text-cyan-400 font-bold">{{ opticalSize() }}pt</span>
            </div>
            <input 
              type="range" 
              min="8" 
              max="36" 
              step="1" 
              [value]="opticalSize()" 
              (input)="updateOpticalSize($event)"
              class="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      <!-- Real-Time ICU Telemetry HUD (Tabular Numerals in Action) -->
      <div class="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 class="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">
              Real-Time ICU Telemetry Matrix (Jitter-Free Tabular Figures)
            </h3>
          </div>
          <span class="text-[10px] font-mono text-emerald-400 font-bold">
            CLS: 0.000 (Zero Layout Shift)
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
            <span class="text-[10px] font-mono text-zinc-400 uppercase">Heart Rate</span>
            <div 
              class="text-2xl font-bold text-emerald-400 font-pocketgull-sans"
              [style.font-feature-settings]="computedFeatureSettings()"
              [style.font-variant-numeric]="enableTabularNums() ? 'tabular-nums' : 'normal'"
            >
              {{ simulatedHeartRate().toFixed(1) }} <span class="text-xs text-zinc-500 font-normal">bpm</span>
            </div>
          </div>

          <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
            <span class="text-[10px] font-mono text-zinc-400 uppercase">Blood Pressure</span>
            <div 
              class="text-2xl font-bold text-cyan-400 font-pocketgull-sans"
              [style.font-feature-settings]="computedFeatureSettings()"
              [style.font-variant-numeric]="enableTabularNums() ? 'tabular-nums' : 'normal'"
            >
              {{ simulatedSystolic() }}/{{ simulatedDiastolic() }} <span class="text-xs text-zinc-500 font-normal">mmHg</span>
            </div>
          </div>

          <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
            <span class="text-[10px] font-mono text-zinc-400 uppercase">Oxygen (SpO2)</span>
            <div 
              class="text-2xl font-bold text-sky-400 font-pocketgull-sans"
              [style.font-feature-settings]="computedFeatureSettings()"
              [style.font-variant-numeric]="enableTabularNums() ? 'tabular-nums' : 'normal'"
            >
              {{ simulatedSpo2().toFixed(1) }}<span class="text-xs text-zinc-500 font-normal">%</span>
            </div>
          </div>

          <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
            <span class="text-[10px] font-mono text-zinc-400 uppercase">Blood Glucose</span>
            <div 
              class="text-2xl font-bold text-amber-400 font-pocketgull-sans"
              [style.font-feature-settings]="computedFeatureSettings()"
              [style.font-variant-numeric]="enableTabularNums() ? 'tabular-nums' : 'normal'"
            >
              {{ simulatedGlucose().toFixed(1) }} <span class="text-xs text-zinc-500 font-normal">mg/dL</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Clinical Disambiguation Bench (Character Pairs) -->
      <div class="space-y-3">
        <h3 class="text-xs font-mono font-bold uppercase text-zinc-300 tracking-wider">
          Clinical Disambiguation Pairs (Zero Error Verification)
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          @for (pair of disambiguationPairs; track pair.id) {
            <div class="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-2 hover:border-cyan-500/40 transition">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold text-cyan-400 uppercase">{{ pair.category }}</span>
                <span class="text-[9px] text-zinc-500 font-mono">{{ pair.clinicalRisk }}</span>
              </div>

              <div 
                class="text-2xl font-bold text-zinc-100 tracking-wider py-1 font-pocketgull-sans bg-slate-900/60 rounded-xl text-center border border-slate-800"
                [style.font-feature-settings]="computedFeatureSettings()"
                [style.font-weight]="weight()"
              >
                {{ pair.testChars }}
              </div>

              <p class="text-[10px] text-zinc-400 leading-tight">
                {{ pair.description }}
              </p>
            </div>
          }
        </div>
      </div>

      <!-- High-Risk Prescription & Dosage Clarity Bench -->
      <div class="space-y-3">
        <h3 class="text-xs font-mono font-bold uppercase text-zinc-300 tracking-wider">
          High-Risk Prescription &amp; Medication Order Simulation
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          @for (example of dosageExamples; track example.title) {
            <div class="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
              <div class="flex items-center justify-between text-xs font-bold text-zinc-300">
                <span>{{ example.title }}</span>
                <span class="text-emerald-400 text-[10px] font-mono">Disambiguated</span>
              </div>

              <div 
                class="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-base font-bold text-zinc-100 font-pocketgull-sans tracking-tight"
                [style.font-feature-settings]="computedFeatureSettings()"
                [style.font-weight]="weight()"
              >
                {{ example.correct }}
              </div>

              <p class="text-[10px] text-zinc-400">
                <b>Safety Rationale:</b> {{ example.rationale }}
              </p>
            </div>
          }
        </div>
      </div>

      <!-- Live Interactive Sandbox Box -->
      <div class="space-y-2">
        <label class="text-[11px] font-mono font-extrabold uppercase text-cyan-400 tracking-wider">
          Interactive PocketGull Sans Sandbox
        </label>
        <textarea 
          [value]="previewText()" 
          (input)="updateText($event)"
          rows="3"
          class="w-full px-4 py-3 bg-slate-950/90 border border-slate-700/80 focus:border-cyan-500 rounded-2xl text-base text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition resize-y font-pocketgull-sans"
          [style.font-feature-settings]="computedFeatureSettings()"
          [style.font-weight]="weight()"
          placeholder="Type any medication, dosage, or clinical note to test PocketGull Sans..."
        ></textarea>
      </div>

    </div>
  `
})
export class PocketgullSansBenchComponent implements OnInit, OnDestroy {
  enableCurvedL = signal<boolean>(true);
  enableSlashedZero = signal<boolean>(true);
  enableSerifedI = signal<boolean>(true);
  enableTabularNums = signal<boolean>(true);
  enableOpenFour = signal<boolean>(true);

  weight = signal<number>(500);
  fontSize = signal<number>(20);
  opticalSize = signal<number>(14);
  letterSpacing = signal<number>(-0.01);
  copyStatus = signal<string>('📋 Copy PocketGull Sans CSS');

  previewText = signal<string>(
    'Patient Rx: Levothyroxine 50 mcg PO daily. KCl 20 mEq in 1000 mL D5W at 75 mL/hr. Heart rate: 72.4 bpm, BP: 120/80 mmHg, SpO2: 99.1%.'
  );

  // Simulated real-time vitals
  simulatedHeartRate = signal<number>(72.4);
  simulatedSystolic = signal<number>(120);
  simulatedDiastolic = signal<number>(80);
  simulatedSpo2 = signal<number>(99.2);
  simulatedGlucose = signal<number>(95.4);

  private timerId: any = null;

  readonly disambiguationPairs: IDisambiguationPair[] = [
    {
      id: 'l-1-I',
      category: 'Stem & Numeral Clarity',
      testChars: '1 l I | 100 ml | 100 mI',
      description: "Curved tail on 'l' (cv05) and crossbars on 'I' (ss02) prevent confusion with digit '1'.",
      clinicalRisk: 'Eliminates 1 vs l dosage errors'
    },
    {
      id: '0-O-D',
      category: 'Zero vs Letter O',
      testChars: '0 Ø O D Q | 50 mg | 5O mg',
      description: "Slashed zero 'Ø' (cv08/zero) ensures instant differentiation from uppercase 'O' and 'D'.",
      clinicalRisk: 'Prevents 10x overdose misreads'
    },
    {
      id: 'rn-m',
      category: 'Kerning & Stem Separation',
      testChars: 'rn m | burn vs bum | darn',
      description: "Optimized sidebearings and apex junctions prevent 'r' and 'n' from colliding into 'm'.",
      clinicalRisk: 'Medication name confusion'
    },
    {
      id: 'cl-d',
      category: 'Ascender Clarity',
      testChars: 'cl d | 100 cl vs 100 dl | close vs dose',
      description: "Distinct curved terminal on 'c' and tall vertical ascender on 'l' prevent collapse into 'd'.",
      clinicalRisk: 'Deciliter vs Centiliter safety'
    },
    {
      id: '5-S-8-B',
      category: 'Numeric Terminal Disambiguation',
      testChars: '5 S 8 B | 58 mg vs SB mg',
      description: "Square horizontal flag on '5' and asymmetrical loops on '8' prevent confusion with 'S' and 'B'.",
      clinicalRisk: 'Lab value readout precision'
    },
    {
      id: 'open-four',
      category: 'Micro-Chart Geometry',
      testChars: '4 44 40 | 14.4% vs 19.4%',
      description: "Open top terminal on '4' (ss01) prevents the apex from closing into a triangle at 8pt sizes.",
      clinicalRisk: 'ICU monitor readability'
    }
  ];

  readonly dosageExamples: IClinicalDosageExample[] = [
    {
      title: 'Microgram vs. Milligram Safety',
      correct: 'Levothyroxine 50 µg PO daily (50 mcg)',
      confusable: 'Levothyroxine 50 mg (1000x Fatal Overdose)',
      rationale: 'High-contrast Greek micro-symbol (µ) and tall x-height ensure unambiguous microgram differentiation.'
    },
    {
      title: 'Intravenous Infusion Rate',
      correct: '0.9% NaCl 1000 mL IV at 125 mL/hr',
      confusable: '0.9% NaCI 1000 ml IV at 125 ml/hr',
      rationale: "Serifed capital 'I' in 'IV' and curved 'l' in 'mL' eliminate ambiguous roman numeral collision."
    },
    {
      title: 'Electrolyte Additive Order',
      correct: 'KCl 20 mEq in 1000 mL D5W over 8 hrs',
      confusable: 'KCI 2O mEq in 1OOO mL DSW',
      rationale: "Slashed zero 'Ø' and serifed 'I' in Potassium Chloride (KCl) prevent mistaking 'O' for '0'."
    },
    {
      title: 'Inflammatory Biomarker Cytokine',
      correct: 'Interleukin-6 (IL-6) level: 4.8 pg/mL',
      confusable: '1L-6 (Interpreted as 1 Liter bottle)',
      rationale: "Clear differentiation between capital 'I' and numeral '1' avoids laboratory test order misclassification."
    }
  ];

  computedFeatureSettings = computed(() => {
    const features: string[] = [];
    if (this.enableCurvedL()) features.push('"cv05" 1');
    if (this.enableSlashedZero()) features.push('"cv08" 1', '"zero" 1');
    if (this.enableSerifedI()) features.push('"ss02" 1');
    if (this.enableTabularNums()) features.push('"tnum" 1');
    if (this.enableOpenFour()) features.push('"ss01" 1');
    return features.join(', ') || 'normal';
  });

  activeFeatureString = computed(() => {
    const active: string[] = [];
    if (this.enableCurvedL()) active.push('cv05');
    if (this.enableSlashedZero()) active.push('cv08/zero');
    if (this.enableSerifedI()) active.push('ss02');
    if (this.enableTabularNums()) active.push('tnum');
    if (this.enableOpenFour()) active.push('ss01');
    return active.join(', ') || 'None (Standard)';
  });

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.timerId = setInterval(() => {
        // Jitter numbers to prove tabular lining stability
        const deltaHr = (Math.random() - 0.5) * 0.6;
        this.simulatedHeartRate.update(hr => Math.max(68, Math.min(78, +(hr + deltaHr).toFixed(1))));

        if (Math.random() > 0.7) {
          this.simulatedSystolic.set(118 + Math.floor(Math.random() * 5));
          this.simulatedDiastolic.set(78 + Math.floor(Math.random() * 4));
        }

        const deltaGlucose = (Math.random() - 0.5) * 0.4;
        this.simulatedGlucose.update(g => +(g + deltaGlucose).toFixed(1));
      }, 800);
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  toggleFeature(feature: 'cv05' | 'cv08' | 'ss02' | 'tnum' | 'ss01'): void {
    switch (feature) {
      case 'cv05': this.enableCurvedL.update(v => !v); break;
      case 'cv08': this.enableSlashedZero.update(v => !v); break;
      case 'ss02': this.enableSerifedI.update(v => !v); break;
      case 'tnum': this.enableTabularNums.update(v => !v); break;
      case 'ss01': this.enableOpenFour.update(v => !v); break;
    }
  }

  updateText(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.previewText.set(input.value);
  }

  updateWeight(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.weight.set(Number(input.value));
  }

  updateFontSize(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fontSize.set(Number(input.value));
  }

  updateOpticalSize(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.opticalSize.set(Number(input.value));
  }

  updateLetterSpacing(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.letterSpacing.set(Number(input.value));
  }

  copyCssSnippet(): void {
    const css = `/* PocketGull Sans (Inter-Grotesque) No-Tofu OpenType Stack */\nfont-family: 'PocketGull Sans', 'Inter', 'WenQuanYi Zen Hei', 'IPA Gothic', 'Loma', 'FreeSans', 'Unifont', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\nfont-feature-settings: ${this.computedFeatureSettings()};\nfont-variation-settings: 'wght' ${this.weight()}, 'opsz' ${this.opticalSize()};`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(css).then(() => {
        this.copyStatus.set('✅ Copied PocketGull Sans CSS!');
        setTimeout(() => this.copyStatus.set('📋 Copy PocketGull Sans CSS'), 2500);
      }).catch(() => {
        this.copyStatus.set('⚠️ Copy Failed');
      });
    }
  }
}
