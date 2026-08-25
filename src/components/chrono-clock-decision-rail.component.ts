import { Component, ChangeDetectionStrategy, signal, computed, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

export interface IChronoWindow {
  id: string;
  name: string;
  startHour: number; // e.g. 7.0 for 07:00
  endHour: number;   // e.g. 9.0 for 09:00
  emoji: string;
  dishName: string;
  targetDishId: string;
  status: 'Optimal' | 'Suboptimal' | 'Fasting Mandatory';
  metabolicRationale: string;
  ramsAxiom: string;
}

@Component({
  selector: 'app-chrono-clock-decision-rail',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-950 rounded-3xl p-6 sm:p-7 border border-zinc-800 shadow-2xl mb-8 font-mono text-zinc-100 relative overflow-hidden">
      
      <!-- Clock Header & Braun Minimal Design Badge -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-6">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
            <h3 class="text-xs font-black text-zinc-100 uppercase tracking-widest">
              🕒 Chrono-Nutrition Circadian Clock & Decision Rail
            </h3>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-orange-400 border border-zinc-800">
              BMAL1 / CLOCK Pathway
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1 font-mono">
            Aligning meal timing with peripheral organ clock genes, GLUT4 sensitivity, and digestive fire.
          </p>
        </div>

        <!-- Quick Preset Time Buttons & Voice Assistant Launch -->
        <div class="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button (click)="setTime(8.0)"
            [class]="selectedHour() === 8.0
              ? 'px-3 py-1.5 rounded-xl bg-orange-500 text-zinc-950 font-bold uppercase transition border border-orange-400/50'
              : 'px-3 py-1.5 rounded-xl bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 transition'">
            08:00
          </button>
          <button (click)="setTime(13.0)"
            [class]="selectedHour() === 13.0
              ? 'px-3 py-1.5 rounded-xl bg-orange-500 text-zinc-950 font-bold uppercase transition border border-orange-400/50'
              : 'px-3 py-1.5 rounded-xl bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 transition'">
            13:00
          </button>
          <button (click)="setTime(16.0)"
            [class]="selectedHour() === 16.0
              ? 'px-3 py-1.5 rounded-xl bg-orange-500 text-zinc-950 font-bold uppercase transition border border-orange-400/50'
              : 'px-3 py-1.5 rounded-xl bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 transition'">
            16:00
          </button>
          <button (click)="setTime(19.0)"
            [class]="selectedHour() === 19.0
              ? 'px-3 py-1.5 rounded-xl bg-orange-500 text-zinc-950 font-bold uppercase transition border border-orange-400/50'
              : 'px-3 py-1.5 rounded-xl bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 transition'">
            19:00
          </button>
        </div>

      </div>

      <!-- Main Layout: SVG Clock Dial + Decision Rail -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        <!-- Left Column: SVG 24-Hour Analog Clock Dial -->
        <div class="md:col-span-4 flex flex-col items-center justify-center p-4 bg-zinc-900 rounded-2xl border border-zinc-800 relative">
          <svg viewBox="0 0 200 200" class="w-48 h-48">
            <!-- Outer Clock Dial Circle -->
            <circle cx="100" cy="100" r="88" fill="none" stroke="#27272a" stroke-width="6" />
            
            <!-- Shaded Window Arcs -->
            <path d="M 100 12 A 88 88 0 0 1 162 38" fill="none" stroke="rgba(249, 115, 22, 0.4)" stroke-width="10" />
            <path d="M 188 100 A 88 88 0 0 1 176 144" fill="none" stroke="rgba(249, 115, 22, 0.4)" stroke-width="10" />
            <path d="M 135 170 A 88 88 0 0 1 100 188" fill="none" stroke="rgba(249, 115, 22, 0.4)" stroke-width="10" />
            <path d="M 62 162 A 88 88 0 0 1 38 138" fill="none" stroke="rgba(249, 115, 22, 0.4)" stroke-width="10" />

            <!-- Hour Ticks -->
            @for (h of [0,3,6,9,12,15,18,21]; track h) {
              @let rad = (h / 24) * 2 * Math.PI - Math.PI / 2;
              <line 
                [attr.x1]="100 + 76 * Math.cos(rad)" 
                [attr.y1]="100 + 76 * Math.sin(rad)" 
                [attr.x2]="100 + 84 * Math.cos(rad)" 
                [attr.y2]="100 + 84 * Math.sin(rad)" 
                stroke="#52525b" stroke-width="2" />
            }

            <!-- Clock Center Pin -->
            <circle cx="100" cy="100" r="5" fill="#f97316" />

            <!-- Clock Rotating Hand -->
            @let handRad = (selectedHour() / 24) * 2 * Math.PI - Math.PI / 2;
            <line 
              [attr.x1]="100" 
              [attr.y1]="100" 
              [attr.x2]="100 + 68 * Math.cos(handRad)" 
              [attr.y2]="100 + 68 * Math.sin(handRad)" 
              stroke="#f97316" stroke-width="3" stroke-linecap="round" />
          </svg>

          <!-- Current Time Telemetry Pill -->
          <div class="mt-3 px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-orange-400 font-mono font-bold text-xs tracking-wider shadow-sm">
            ⏰ {{ formattedTime() }}
          </div>
        </div>

        <!-- Right Column: Interactive Decision Rail & Rationale -->
        <div class="md:col-span-8 space-y-4 font-mono">
          
          <!-- Interactive Time Slider (Rail) -->
          <div>
            <div class="flex justify-between items-center text-xs font-bold mb-2">
              <span class="text-zinc-400 uppercase tracking-widest">🎛️ Drag Chrono-Nutrition Decision Rail:</span>
              <span class="text-orange-400 font-extrabold">{{ formattedTime() }}</span>
            </div>
            <input 
              type="range" 
              min="6.0" 
              max="22.0" 
              step="0.5" 
              [value]="selectedHour()" 
              (input)="updateHour($event)" 
              class="w-full h-2.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-orange-500 border border-zinc-800" />
            
            <div class="flex justify-between text-[9px] text-zinc-400 mt-1 font-mono">
              <span>06:00 AM (Dawn)</span>
              <span>12:00 PM (Noon Peak)</span>
              <span>06:00 PM (Sunset)</span>
              <span>10:00 PM (Night Fast)</span>
            </div>
          </div>

          <!-- Active Window Evaluation & Clinical Guidance Box -->
          @let activeWindow = currentEvaluatedWindow();
          <div class="p-4 rounded-2xl border bg-zinc-900 border-zinc-800 transition-all duration-300 shadow-sm font-mono">
            
            <div class="flex items-center justify-between gap-3 mb-2">
              <div class="flex items-center gap-2 font-bold text-xs">
                <span class="text-base">{{ activeWindow.emoji }}</span>
                <span class="text-zinc-100 uppercase">{{ activeWindow.name }}</span>
              </div>

              <span class="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-zinc-950 text-orange-400 border border-zinc-800">
                {{ activeWindow.status }}
              </span>
            </div>

            <!-- Recommended Culinary Prescription for this Hour -->
            <div class="text-xs font-sans text-zinc-300 mb-2 leading-relaxed">
              <strong>Clinical Recommendation:</strong> {{ activeWindow.metabolicRationale }}
            </div>

            <!-- Rams Axiom Footnote -->
            <div class="text-[10px] text-zinc-400 italic font-mono">
              Chrono Axiom: {{ activeWindow.ramsAxiom }}
            </div>

          </div>

        </div>

      </div>

    </div>
  `
})
export class ChronoClockDecisionRailComponent {
  selectedHour = signal<number>(12.5); // Default 12:30 PM
  windowSelect = output<string>();
  patientState = inject(PatientStateService);

  Math = Math;

  formattedTime = computed(() => {
    const h = this.selectedHour();
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    const padH = hours < 10 ? `0${hours}` : `${hours}`;
    const padM = mins < 10 ? `0${mins}` : `${mins}`;
    return `${padH}:${padM}`;
  });

  windows: IChronoWindow[] = [
    {
      id: 'w-breakfast',
      name: 'Circadian Cortisol Awakening & Corticosteroid Window',
      startHour: 7.0,
      endHour: 9.5,
      emoji: '🌅',
      dishName: 'Steel-Cut Oats with Berries & Walnut Oil',
      targetDishId: 'd1',
      status: 'Optimal',
      metabolicRationale: 'High GLUT4 insulin sensitivity. Prime window for complex carbohydrates and healthy fats.',
      ramsAxiom: 'Functional design aligns nutrition with morning metabolic peak.'
    },
    {
      id: 'w-lunch',
      name: 'Peak Digestive Fire (Agni / Hepatic Metabolism Window)',
      startHour: 12.0,
      endHour: 14.5,
      emoji: '☀️',
      dishName: 'Grilled Wild Salmon with Steamed Bok Choy',
      targetDishId: 'd2',
      status: 'Optimal',
      metabolicRationale: 'Peak pancreatic enzyme secretion and hepatic clearance rate.',
      ramsAxiom: 'Less, but better: largest meal ingested during highest enzymatic capacity.'
    },
    {
      id: 'w-elixir',
      name: 'Spleen Qi & Autonomic Vagal Re-balancing Window',
      startHour: 15.3,
      endHour: 17.0,
      emoji: '🍵',
      dishName: 'Warm Jujube & Ginger Elixir Tea',
      targetDishId: 'd3',
      status: 'Optimal',
      metabolicRationale: 'Gentle polyphenol infusion to soothe afternoon cortisol micro-spikes.',
      ramsAxiom: 'Unobtrusive intervention restoring inner harmony.'
    },
    {
      id: 'w-dinner',
      name: 'Early Melatonin Preparation & Nighttime Repair Window',
      startHour: 18.0,
      endHour: 19.5,
      emoji: '🌙',
      dishName: 'Bone Broth Soup with Shiitake Mushrooms',
      targetDishId: 'd4',
      status: 'Optimal',
      metabolicRationale: 'Light glycine-rich protein supporting tissue repair without disturbing slow-wave sleep.',
      ramsAxiom: 'Long-lasting utility: early light dinner enhances nocturnal glymphatic clearance.'
    }
  ];

  currentEvaluatedWindow = computed(() => {
    const h = this.selectedHour();
    const match = this.windows.find(w => h >= w.startHour && h <= w.endHour);
    if (match) return match;

    if (h > 19.5 || h < 7.0) {
      return {
        id: 'w-fasting',
        name: 'Autophagy & Melatonin Secretion Window (Night Fasting)',
        startHour: 20.0,
        endHour: 6.0,
        emoji: '🌌',
        dishName: 'Fasting / Water Only',
        targetDishId: 'none',
        status: 'Fasting Mandatory' as const,
        metabolicRationale: 'Pineal gland is secreting melatonin. Feeding now impairs glucose tolerance and blunts nocturnal GH release.',
        ramsAxiom: 'Minimalist restraint: fasting allows deep cellular maintenance.'
      };
    }

    return {
      id: 'w-transition',
      name: 'Inter-Meal Transition Phase',
      startHour: h,
      endHour: h + 1,
      emoji: '⌛',
      dishName: 'Hydration / Herbal Tea',
      targetDishId: 'none',
      status: 'Suboptimal' as const,
      metabolicRationale: 'Allow GI tract migratory motor complex (MMC) to clear residual chyme between meals.',
      ramsAxiom: 'Honesty in function: rest period between digestive cycles.'
    };
  });

  updateHour(event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.selectedHour.set(val);
    const window = this.currentEvaluatedWindow();
    this.windowSelect.emit(window.id);
  }

  setTime(hour: number) {
    this.selectedHour.set(hour);
    const window = this.currentEvaluatedWindow();
    this.windowSelect.emit(window.id);
  }
}
