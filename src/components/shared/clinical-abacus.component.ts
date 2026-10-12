import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  model,
  output,
  effect,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { kachinkaAudio } from '../../utils/kachinka-audio.service';

export type AbacusMode = 'posology_dosing' | 'gcs_triage' | 'fluid_balance' | 'script_dial';
export type AbacusScriptSystem = 'latin' | 'eastern_arabic' | 'devanagari' | 'kaktovik' | 'suanpan';

export interface IRodDefinition {
  id: string;
  label: string;
  weight: number;
  min: number;
  max: number;
  hasReckoningDot?: boolean; // Star dot (Hoshi) on beam
}

const NUMERAL_MAPS: Record<AbacusScriptSystem, string[]> = {
  latin: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  eastern_arabic: ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'],
  devanagari: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  kaktovik: ['𝋀', '𝋁', '𝋂', '𝋃', '𝋄', '𝋅', '𝋆', '𝋇', '𝋈', '𝋉'],
  suanpan: ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
};

@Component({
  selector: 'app-clinical-abacus',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="clinical-abacus-container p-4 bg-zinc-950/95 border border-zinc-800 rounded-md text-zinc-100 font-mono shadow-2xl select-none">
      
      <!-- Header Telemetry Bar -->
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 bg-amber-400/90 rounded-xs rotate-45 shadow-xs"></div>
          <span class="text-xs font-bold uppercase tracking-wider text-zinc-300">
            {{ label() }}
          </span>
          <span class="text-[10px] px-2 py-0.5 bg-teal-950/60 text-teal-300 border border-teal-800/50 rounded-md">
            {{ modeLabel() }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Script System Selector -->
          <div class="flex items-center gap-1 text-[10px] bg-zinc-900 border border-zinc-800 p-0.5 rounded-md">
            @for (sys of scriptOptions; track sys.id) {
              <button
                type="button"
                (click)="setScriptSystem(sys.id)"
                [class.bg-teal-600]="activeScript() === sys.id"
                [class.text-white]="activeScript() === sys.id"
                [class.text-zinc-400]="activeScript() !== sys.id"
                class="px-1.5 py-0.5 rounded-xs transition-colors cursor-pointer text-[10px] font-bold"
                [title]="sys.label"
              >
                {{ sys.glyph }}
              </button>
            }
          </div>

          <!-- Quick Zero / Clear Action -->
          <button
            type="button"
            (click)="resetAbacus()"
            class="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-700/80 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
            title="Clear reckoning rods (Ka-chink!)"
          >
            <span>↺</span>
            <span class="hidden sm:inline">Zero</span>
          </button>
        </div>
      </div>

      <!-- Main Value Readout Card -->
      <div class="mb-4 p-3 bg-zinc-900/90 border border-zinc-800 rounded-md flex items-baseline justify-between">
        <div>
          <span class="text-[10px] text-zinc-400 uppercase tracking-widest font-bold block">
            {{ readoutLabel() }}
          </span>
          <div class="flex items-baseline gap-2 mt-0.5">
            <span class="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight font-math">
              {{ formattedValue() }}
            </span>
            <span class="text-sm font-bold text-zinc-400">{{ unit() }}</span>

            <!-- Native Numeral Echo -->
            @if (activeScript() !== 'latin') {
              <span class="text-lg text-teal-400/90 font-bold ml-2">
                ({{ nativeNumeralString() }})
              </span>
            }
          </div>
        </div>

        @if (mode() === 'gcs_triage') {
          <div class="text-right">
            <span class="text-[10px] text-zinc-400 block uppercase">Acuity Tier</span>
            <span
              class="px-2 py-0.5 text-xs font-bold rounded-md uppercase inline-block mt-0.5"
              [ngClass]="{
                'bg-rose-950/80 text-rose-300 border border-rose-800/80': gcsScore() <= 8,
                'bg-amber-950/80 text-amber-300 border border-amber-800/80': gcsScore() >= 9 && gcsScore() <= 12,
                'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80': gcsScore() >= 13
              }"
            >
              {{ gcsTier() }}
            </span>
          </div>
        } @else if (mode() === 'posology_dosing') {
          <div class="text-right">
            <span class="text-[10px] text-zinc-400 block uppercase">10× Overdose Guard</span>
            <span class="text-[11px] font-bold text-teal-400 flex items-center gap-1 justify-end">
              <span>🛡️</span> ISMP Microbore Safe
            </span>
          </div>
        }
      </div>

      <!-- Soroban Mechanical Frame (SVG) -->
      <div class="soroban-frame relative p-2 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-zinc-700/80 rounded-md shadow-inner overflow-x-auto">
        <svg
          [attr.viewBox]="'0 0 ' + svgWidth() + ' 280'"
          class="w-full h-56 sm:h-64 select-none block"
          style="min-width: 280px;"
          role="img"
          [attr.aria-label]="label() + ' interactive calculation rods'"
        >
          <defs>
            <!-- Bi-conical Faceted Bead Gradient (Upper Deck / Heaven Bead) -->
            <linearGradient id="beadHeavenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#14b8a6" />
              <stop offset="50%" stop-color="#2dd4bf" />
              <stop offset="51%" stop-color="#0f766e" />
              <stop offset="100%" stop-color="#042f2e" />
            </linearGradient>

            <!-- Bi-conical Faceted Bead Gradient (Lower Deck / Earth Beads) -->
            <linearGradient id="beadEarthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#f59e0b" />
              <stop offset="50%" stop-color="#fbbf24" />
              <stop offset="51%" stop-color="#b45309" />
              <stop offset="100%" stop-color="#451a03" />
            </linearGradient>

            <!-- Inactive Bead Gradient (Subtle Metallic Boxwood) -->
            <linearGradient id="beadInactiveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#3f3f46" />
              <stop offset="50%" stop-color="#52525b" />
              <stop offset="51%" stop-color="#27272a" />
              <stop offset="100%" stop-color="#18181b" />
            </linearGradient>

            <!-- Wooden Bamboo Rod Gradient -->
            <linearGradient id="rodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#71717a" />
              <stop offset="50%" stop-color="#a1a1aa" />
              <stop offset="100%" stop-color="#52525b" />
            </linearGradient>
          </defs>

          <!-- Outer Soroban Frame Border -->
          <rect x="2" y="2" [attr.width]="svgWidth() - 4" height="276" rx="4" fill="none" stroke="#3f3f46" stroke-width="3" />

          <!-- Vertical Bamboo Rods -->
          @for (rod of activeRods(); track rod.id; let rodIdx = $index) {
            <g>
              <!-- Bamboo Rod Spine -->
              <rect
                [attr.x]="getRodCenterX(rodIdx) - 2.5"
                y="10"
                width="5"
                height="240"
                rx="1"
                fill="url(#rodGrad)"
              />
            </g>
          }

          <!-- Central Reckoning Beam (The Dividing Bar) -->
          <rect
            x="4"
            y="76"
            [attr.width]="svgWidth() - 8"
            height="14"
            fill="#18181b"
            stroke="#52525b"
            stroke-width="1.5"
          />

          <!-- Reckoning Alignment Dots (Hoshi / Star Dots) on Beam -->
          @for (rod of activeRods(); track rod.id; let rodIdx = $index) {
            @if (rod.hasReckoningDot) {
              <!-- Star Dot indicates decimal or thousand separator -->
              <circle
                [attr.cx]="getRodCenterX(rodIdx)"
                cy="83"
                r="3"
                fill="#fbbf24"
                stroke="#78350f"
                stroke-width="1"
              />
            }
          }

          <!-- Beads Rendering for Each Rod -->
          @for (rod of activeRods(); track rod.id; let rodIdx = $index) {
            <g [attr.id]="'rod-' + rod.id">
              <!-- ── UPPER DECK: Heaven Bead (Value: 5) ── -->
              <!-- Active position: Touching the beam at y = 50. Inactive: Up against the frame at y = 18 -->
              <g
                class="cursor-pointer transition-transform duration-100"
                (click)="toggleHeavenBead(rodIdx)"
                role="button"
                tabindex="0"
                (keydown.enter)="toggleHeavenBead(rodIdx)"
                (keydown.space)="toggleHeavenBead(rodIdx)"
                [attr.aria-label]="rod.label + ' heaven bead value 5, currently ' + (isHeavenActive(rodIdx) ? 'active' : 'inactive')"
              >
                <!-- Hitbox for Upper Bead (at least 48px) -->
                <rect
                  [attr.x]="getRodCenterX(rodIdx) - 26"
                  y="12"
                  width="52"
                  height="60"
                  fill="transparent"
                />

                <!-- Bi-conical Faceted Rhomboid Bead (Strict Zero Pill Geometry) -->
                <polygon
                  [attr.points]="getBeadPolygonPoints(getRodCenterX(rodIdx), getHeavenBeadY(rodIdx))"
                  [attr.fill]="isHeavenActive(rodIdx) ? 'url(#beadHeavenGrad)' : 'url(#beadInactiveGrad)'"
                  [attr.stroke]="isHeavenActive(rodIdx) ? '#2dd4bf' : '#71717a'"
                  stroke-width="1.2"
                />
                <!-- Equator Chamfer Ridge -->
                <line
                  [attr.x1]="getRodCenterX(rodIdx) - 22"
                  [attr.y1]="getHeavenBeadY(rodIdx)"
                  [attr.x2]="getRodCenterX(rodIdx) + 22"
                  [attr.y2]="getHeavenBeadY(rodIdx)"
                  [attr.stroke]="isHeavenActive(rodIdx) ? '#99f6e4' : '#a1a1aa'"
                  stroke-width="1"
                />
              </g>

              <!-- ── LOWER DECK: 4 Earth Beads (Value: 1 each) ── -->
              <!-- Active position: Pushed UP toward beam. Inactive: Dropped DOWN toward frame -->
              @for (earthIdx of [0, 1, 2, 3]; track earthIdx) {
                <g
                  class="cursor-pointer transition-transform duration-100"
                  (click)="setEarthBeads(rodIdx, earthIdx)"
                  role="button"
                  tabindex="0"
                  (keydown.enter)="setEarthBeads(rodIdx, earthIdx)"
                  (keydown.space)="setEarthBeads(rodIdx, earthIdx)"
                  [attr.aria-label]="rod.label + ' earth bead ' + (earthIdx + 1) + ', value 1'"
                >
                  <!-- Hitbox for Earth Bead -->
                  <rect
                    [attr.x]="getRodCenterX(rodIdx) - 26"
                    [attr.y]="getEarthBeadY(rodIdx, earthIdx) - 12"
                    width="52"
                    height="24"
                    fill="transparent"
                  />

                  <!-- Bi-conical Faceted Rhomboid Bead -->
                  <polygon
                    [attr.points]="getBeadPolygonPoints(getRodCenterX(rodIdx), getEarthBeadY(rodIdx, earthIdx))"
                    [attr.fill]="isEarthActive(rodIdx, earthIdx) ? 'url(#beadEarthGrad)' : 'url(#beadInactiveGrad)'"
                    [attr.stroke]="isEarthActive(rodIdx, earthIdx) ? '#fbbf24' : '#71717a'"
                    stroke-width="1.2"
                  />
                  <!-- Equator Chamfer Ridge -->
                  <line
                    [attr.x1]="getRodCenterX(rodIdx) - 22"
                    [attr.y1]="getEarthBeadY(rodIdx, earthIdx)"
                    [attr.x2]="getRodCenterX(rodIdx) + 22"
                    [attr.y2]="getEarthBeadY(rodIdx, earthIdx)"
                    [attr.stroke]="isEarthActive(rodIdx, earthIdx) ? '#fef3c7' : '#a1a1aa'"
                    stroke-width="1"
                  />
                </g>
              }

              <!-- ── ROD FOOTER: Column Weight & Digit Display ── -->
              <text
                [attr.x]="getRodCenterX(rodIdx)"
                y="266"
                text-anchor="middle"
                fill="#e4e4e7"
                font-size="14"
                font-weight="900"
                font-family="monospace"
              >
                {{ getRodDisplayDigit(rodIdx) }}
              </text>
            </g>
          }
        </svg>
      </div>

      <!-- Rod Labels and Steppers (Mobile / Keyboard Accessible) -->
      <div class="mt-3 grid gap-2" [style.grid-template-columns]="'repeat(' + activeRods().length + ', minmax(0, 1fr))'">
        @for (rod of activeRods(); track rod.id; let rodIdx = $index) {
          <div class="text-center p-1.5 bg-zinc-900/60 border border-zinc-800 rounded-md">
            <span class="text-[9px] text-zinc-400 block truncate uppercase font-bold">
              {{ rod.label }}
            </span>
            <div class="flex items-center justify-center gap-1 mt-1">
              <button
                type="button"
                (click)="decrementRod(rodIdx)"
                class="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xs text-xs font-bold cursor-pointer active:scale-90"
                title="Decrement rod"
              >
                -
              </button>
              <span class="text-xs font-black text-amber-400 w-4">
                {{ rodValues()[rodIdx] }}
              </span>
              <button
                type="button"
                (click)="incrementRod(rodIdx)"
                class="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xs text-xs font-bold cursor-pointer active:scale-90"
                title="Increment rod"
              >
                +
              </button>
            </div>
          </div>
        }
      </div>

    </div>
  `
})
export class ClinicalAbacusComponent {
  mode = model<AbacusMode>('posology_dosing');
  scriptSystem = input<AbacusScriptSystem>('latin');
  initialValue = input<number>(0);
  label = input<string>('Clinical Soroban Abacus');
  unit = input<string>('mL');

  valueChanged = output<number>();
  scriptSystemChanged = output<AbacusScriptSystem>();

  activeScript = signal<AbacusScriptSystem>('latin');

  readonly scriptOptions: Array<{ id: AbacusScriptSystem; label: string; glyph: string }> = [
    { id: 'latin', label: 'Western Decimal (0-9)', glyph: '123' },
    { id: 'eastern_arabic', label: 'Eastern Arabic (٠-٩)', glyph: '٠١٢' },
    { id: 'devanagari', label: 'Devanagari / Indic (०-९)', glyph: '०१२' },
    { id: 'kaktovik', label: 'Inuktitut Kaktovik (𝋀-𝋉)', glyph: '𝋁𝋂𝋃' },
    { id: 'suanpan', label: 'Chinese Suzhou (〇-九)', glyph: '一二三' }
  ];

  // Active rod definitions based on Mode
  activeRods = computed<IRodDefinition[]>(() => {
    switch (this.mode()) {
      case 'gcs_triage':
        return [
          { id: 'eye', label: 'Eye (1-4)', weight: 1, min: 1, max: 4 },
          { id: 'verbal', label: 'Verbal (1-5)', weight: 1, min: 1, max: 5 },
          { id: 'motor', label: 'Motor (1-6)', weight: 1, min: 1, max: 6 }
        ];
      case 'fluid_balance':
        return [
          { id: 'thousands', label: '1000 mL', weight: 1000, min: 0, max: 9, hasReckoningDot: true },
          { id: 'hundreds', label: '100 mL', weight: 100, min: 0, max: 9 },
          { id: 'tens', label: '10 mL', weight: 10, min: 0, max: 9 },
          { id: 'units', label: '1 mL', weight: 1, min: 0, max: 9, hasReckoningDot: true }
        ];
      case 'script_dial':
        return [
          { id: 'family', label: 'Family (0-5)', weight: 1, min: 0, max: 5, hasReckoningDot: true },
          { id: 'dialect', label: 'Dialect (0-9)', weight: 1, min: 0, max: 9 }
        ];
      case 'posology_dosing':
      default:
        // 4 Rods: Tens, Units, Tenths (0.1), Hundredths (0.01) for microbore accuracy
        return [
          { id: 'tens', label: 'Tens (10)', weight: 10, min: 0, max: 9 },
          { id: 'units', label: 'Units (1)', weight: 1, min: 0, max: 9, hasReckoningDot: true },
          { id: 'tenths', label: '0.1 mL', weight: 0.1, min: 0, max: 9 },
          { id: 'hundredths', label: '0.01 mL', weight: 0.01, min: 0, max: 9 }
        ];
    }
  });

  // Current digit values per rod (0 to 9)
  rodValues = signal<number[]>([0, 0, 0, 0]);

  constructor() {
    // Sync activeScript when input changes
    effect(() => {
      this.activeScript.set(this.scriptSystem());
    });

    // Initialize rod values based on initialValue input and mode
    effect(() => {
      const mode = this.mode();
      const init = this.initialValue();
      const rods = this.activeRods();

      if (mode === 'gcs_triage') {
        // GCS defaults: Eye 4, Verbal 5, Motor 6 (Normal = 15)
        this.rodValues.set([4, 5, 6]);
      } else if (mode === 'posology_dosing') {
        // Parse initial value into tens, units, tenths, hundredths
        const val = Math.max(0, Math.min(99.99, init));
        const tens = Math.floor(val / 10);
        const units = Math.floor(val % 10);
        const tenths = Math.floor((val * 10) % 10);
        const hundredths = Math.floor(Math.round(val * 100) % 10);
        this.rodValues.set([tens, units, tenths, hundredths]);
      } else {
        this.rodValues.set(rods.map(() => 0));
      }
    });
  }

  svgWidth = computed<number>(() => {
    return Math.max(280, this.activeRods().length * 68 + 24);
  });

  getRodCenterX(rodIdx: number): number {
    const totalRods = this.activeRods().length;
    const spacing = (this.svgWidth() - 32) / totalRods;
    return 16 + spacing * rodIdx + spacing / 2;
  }

  // Bead Geometry: Generates points for bi-conical faceted rhomboid (Diamond)
  // cx, cy: center coordinate. w: total width (44px), h: total height (22px)
  getBeadPolygonPoints(cx: number, cy: number, w: number = 44, h: number = 22): string {
    const halfW = w / 2;
    const halfH = h / 2;
    // Rhomboid points: Left, Top apex, Right, Bottom apex
    return `${cx - halfW},${cy} ${cx},${cy - halfH} ${cx + halfW},${cy} ${cx},${cy + halfH}`;
  }

  // Upper Deck: Heaven Bead Y positions
  // Inactive (pushed UP against top frame): y = 24
  // Active (pushed DOWN against reckoning beam): y = 62
  getHeavenBeadY(rodIdx: number): number {
    const isAct = this.isHeavenActive(rodIdx);
    return isAct ? 62 : 24;
  }

  isHeavenActive(rodIdx: number): boolean {
    const val = this.rodValues()[rodIdx] ?? 0;
    return val >= 5;
  }

  // Lower Deck: 4 Earth Beads Y positions
  // Reckoning beam is at y = 76-90.
  // Active beads push UP toward y = 90.
  // Inactive beads drop DOWN toward y = 248.
  getEarthBeadY(rodIdx: number, earthIdx: number): number {
    const activeCount = (this.rodValues()[rodIdx] ?? 0) % 5;
    const isAct = earthIdx < activeCount;

    if (isAct) {
      // Pushed UP against the beam (y=90) in order
      return 104 + earthIdx * 24;
    } else {
      // Dropped DOWN against the bottom frame (y=248)
      // earthIdx 3 is at the very bottom, earthIdx 2 above it, etc.
      return 174 + earthIdx * 24;
    }
  }

  isEarthActive(rodIdx: number, earthIdx: number): boolean {
    const activeCount = (this.rodValues()[rodIdx] ?? 0) % 5;
    return earthIdx < activeCount;
  }

  toggleHeavenBead(rodIdx: number): void {
    const current = this.rodValues()[rodIdx] ?? 0;
    const isCurrentlyActive = current >= 5;
    const nextVal = isCurrentlyActive ? current - 5 : current + 5;
    this.updateRodValue(rodIdx, nextVal);
  }

  setEarthBeads(rodIdx: number, clickedEarthIdx: number): void {
    const current = this.rodValues()[rodIdx] ?? 0;
    const heavenVal = current >= 5 ? 5 : 0;
    const currentEarthCount = current % 5;

    let newEarthCount: number;
    if (clickedEarthIdx + 1 === currentEarthCount) {
      // Clicking the highest active bead turns it off
      newEarthCount = clickedEarthIdx;
    } else {
      newEarthCount = clickedEarthIdx + 1;
    }

    this.updateRodValue(rodIdx, heavenVal + newEarthCount);
  }

  incrementRod(rodIdx: number): void {
    const max = this.activeRods()[rodIdx]?.max ?? 9;
    const current = this.rodValues()[rodIdx] ?? 0;
    if (current < max) {
      this.updateRodValue(rodIdx, current + 1);
    }
  }

  decrementRod(rodIdx: number): void {
    const min = this.activeRods()[rodIdx]?.min ?? 0;
    const current = this.rodValues()[rodIdx] ?? 0;
    if (current > min) {
      this.updateRodValue(rodIdx, current - 1);
    }
  }

  private updateRodValue(rodIdx: number, val: number): void {
    const rod = this.activeRods()[rodIdx];
    if (!rod) return;
    const clamped = Math.max(rod.min, Math.min(rod.max, val));

    const updated = [...this.rodValues()];
    updated[rodIdx] = clamped;
    this.rodValues.set(updated);

    // Audio click feedback: Pitch increases with column weight (lower rodIdx = higher rod = higher pitch)
    const pitch = 0.8 + (this.activeRods().length - rodIdx) * 0.2;
    kachinkaAudio.playWoodBeadClick(pitch);

    this.emitCalculatedValue();
  }

  resetAbacus(): void {
    kachinkaAudio.playKaChink();
    if (this.mode() === 'gcs_triage') {
      this.rodValues.set([4, 5, 6]);
    } else {
      this.rodValues.set(this.activeRods().map(r => r.min));
    }
    this.emitCalculatedValue();
  }

  setScriptSystem(sys: AbacusScriptSystem): void {
    this.activeScript.set(sys);
    this.scriptSystemChanged.emit(sys);
    kachinkaAudio.playGearTick();
  }

  getRodDisplayDigit(rodIdx: number): string {
    const val = this.rodValues()[rodIdx] ?? 0;
    const numerals = NUMERAL_MAPS[this.activeScript()] ?? NUMERAL_MAPS.latin;
    return numerals[val] ?? String(val);
  }

  nativeNumeralString = computed<string>(() => {
    const digits = this.rodValues();
    const numerals = NUMERAL_MAPS[this.activeScript()] ?? NUMERAL_MAPS.latin;
    if (this.mode() === 'posology_dosing') {
      // tens units . tenths hundredths
      return `${numerals[digits[0]] ?? '0'}${numerals[digits[1]] ?? '0'}.${numerals[digits[2]] ?? '0'}${numerals[digits[3]] ?? '0'}`;
    }
    return digits.map(d => numerals[d] ?? String(d)).join(' ');
  });

  calculatedValue = computed<number>(() => {
    const vals = this.rodValues();
    const rods = this.activeRods();

    if (this.mode() === 'gcs_triage') {
      return (vals[0] ?? 0) + (vals[1] ?? 0) + (vals[2] ?? 0);
    }

    let total = 0;
    for (let i = 0; i < rods.length; i++) {
      total += (vals[i] ?? 0) * (rods[i]?.weight ?? 1);
    }
    return Math.round(total * 100) / 100;
  });

  formattedValue = computed<string>(() => {
    const val = this.calculatedValue();
    if (this.mode() === 'posology_dosing') {
      return val.toFixed(2);
    }
    return String(val);
  });

  gcsScore = computed<number>(() => {
    const vals = this.rodValues();
    return (vals[0] ?? 4) + (vals[1] ?? 5) + (vals[2] ?? 6);
  });

  gcsTier = computed<string>(() => {
    const s = this.gcsScore();
    if (s <= 8) return 'Severe Traumatic Injury (GCS ≤ 8)';
    if (s <= 12) return 'Moderate Injury (GCS 9-12)';
    return 'Mild / Intact (GCS 13-15)';
  });

  modeLabel = computed<string>(() => {
    switch (this.mode()) {
      case 'gcs_triage': return 'Glasgow Coma Scale Triage';
      case 'fluid_balance': return '24h Fluid Balance Tally';
      case 'script_dial': return 'Script & Dialect Selector';
      case 'posology_dosing':
      default:
        return 'Pediatric / Neonatal Posology (0.01 mL)';
    }
  });

  readoutLabel = computed<string>(() => {
    switch (this.mode()) {
      case 'gcs_triage': return 'Total Glasgow Coma Scale (Eye + Verbal + Motor)';
      case 'fluid_balance': return 'Cumulative Measured Fluid Volume';
      case 'script_dial': return 'Active Script & Dialect Index';
      case 'posology_dosing':
      default:
        return 'Calculated Microbore Syringe Dose';
    }
  });

  private emitCalculatedValue(): void {
    this.valueChanged.emit(this.calculatedValue());
  }
}
