import { Component, ChangeDetectionStrategy, signal, computed, ElementRef, viewChild, AfterViewInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export interface ICellularRulePreset {
  id: string;
  name: string;
  description: string;
  birth: number[];
  survival: number[];
  gridSize: number;
}

const PRESETS: ICellularRulePreset[] = [
  {
    id: 'conway_b3s23',
    name: 'Conway (B3/S23) — Immune Homeostasis',
    description: 'Balanced cellular proliferation & apoptotic clearance.',
    birth: [3],
    survival: [2, 3],
    gridSize: 40
  },
  {
    id: 'highlife_b36s23',
    name: 'HighLife (B36/S23) — Replicating Tissue',
    description: 'Rapid regenerative cell multiplication & stem cell propagation.',
    birth: [3, 6],
    survival: [2, 3],
    gridSize: 40
  },
  {
    id: 'seeds_b2s',
    name: 'Seeds (B2/S) — Oncological Proliferation',
    description: 'Unchecked cellular division simulation (tumor angiogenesis).',
    birth: [2],
    survival: [],
    gridSize: 40
  },
  {
    id: 'day_night_b3678s34678',
    name: 'Day & Night — Autophagy & Lenten Reset',
    description: 'Symmetrical cellular turnover under circadian fasting.',
    birth: [3, 6, 7, 8],
    survival: [3, 4, 6, 7, 8],
    gridSize: 40
  }
];

@Component({
  selector: 'app-cellular-automata-viewer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-purple-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-purple-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🧬</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-purple-300">
              Turing-Complete Morphogenetic Automata
            </h3>
            <p class="text-[10px] text-purple-400/80">
              Cellular Automata (B3/S23) Epigenetic Tissue Simulation
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-purple-950 border border-purple-700/60 text-purple-300">
            Gen: {{ generation() }}
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest" [class.bg-emerald-950]="isRunning()" [class.text-emerald-400]="isRunning()" [class.bg-zinc-800]="!isRunning()" [class.text-zinc-400]="!isRunning()">
            {{ isRunning() ? 'LIVE' : 'PAUSED' }}
          </span>
        </div>
      </div>

      <!-- Preset Selector -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 hide-scrollbar">
        @for (preset of presets; track preset.id) {
          <button (click)="selectPreset(preset)"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border"
                  [class.bg-purple-600]="activePreset().id === preset.id"
                  [class.text-white]="activePreset().id === preset.id"
                  [class.border-purple-500]="activePreset().id === preset.id"
                  [class.bg-zinc-900]="activePreset().id !== preset.id"
                  [class.text-zinc-400]="activePreset().id !== preset.id"
                  [class.border-zinc-800]="activePreset().id !== preset.id">
            {{ preset.name }}
          </button>
        }
      </div>

      <!-- Canvas Viewport -->
      <div class="flex-1 w-full relative bg-black rounded-xl overflow-hidden border border-purple-900/30 min-h-[260px] flex items-center justify-center">
        <canvas #caCanvas (click)="onCanvasClick($event)" class="w-full h-full cursor-pointer block"></canvas>
      </div>

      <!-- Controls & Metrics Footer -->
      <div class="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-purple-900/30">
        <div class="flex items-center gap-2">
          <button (click)="togglePlay()" class="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1">
            {{ isRunning() ? '⏸ Pause' : '▶ Play' }}
          </button>
          <button (click)="stepOnce()" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-purple-300 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer">
            ⏭ Step
          </button>
          <button (click)="seedRandomGrid()" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-purple-300 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer">
            🎲 Seed Random
          </button>
          <button (click)="clearGrid()" class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-300 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer">
            🧹 Clear
          </button>
        </div>

        <div class="flex items-center gap-4 text-[10px] text-purple-300/80">
          <span>Active Cells: <strong class="text-purple-200 font-bold">{{ activeCellCount() }}</strong></span>
          <span>Density: <strong class="text-purple-200 font-bold">{{ densityPercentage() }}%</strong></span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class CellularAutomataViewerComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly caCanvas = viewChild<ElementRef<HTMLCanvasElement>>('caCanvas');

  readonly presets = PRESETS;
  readonly activePreset = signal<ICellularRulePreset>(PRESETS[0]);
  readonly generation = signal<number>(0);
  readonly isRunning = signal<boolean>(true);
  readonly activeCellCount = signal<number>(0);
  readonly densityPercentage = signal<string>('0.0');

  private grid: number[][] = [];
  private cols = 40;
  private rows = 40;
  private animId?: number;
  private lastTime = 0;
  private fps = 12;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initGrid();
    this.seedRandomGrid();
    this.startLoop();
  }

  selectPreset(preset: ICellularRulePreset) {
    this.activePreset.set(preset);
    this.cols = preset.gridSize;
    this.rows = preset.gridSize;
    this.initGrid();
    this.seedRandomGrid();
  }

  private initGrid() {
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    this.generation.set(0);
  }

  seedRandomGrid() {
    this.initGrid();
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = Math.random() > 0.72 ? 1 : 0;
      }
    }
    this.updateMetrics();
    this.draw();
  }

  clearGrid() {
    this.initGrid();
    this.updateMetrics();
    this.draw();
  }

  togglePlay() {
    this.isRunning.set(!this.isRunning());
  }

  stepOnce() {
    this.computeNextGeneration();
    this.draw();
  }

  onCanvasClick(e: MouseEvent) {
    const canvas = this.caCanvas()?.nativeElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellW = canvas.width / this.cols;
    const cellH = canvas.height / this.rows;

    const c = Math.floor(x / cellW);
    const r = Math.floor(y / cellH);

    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      this.grid[r][c] = this.grid[r][c] ? 0 : 1;
      this.updateMetrics();
      this.draw();
    }
  }

  private startLoop() {
    const loop = (timestamp: number) => {
      if (this.isRunning() && timestamp - this.lastTime > 1000 / this.fps) {
        this.computeNextGeneration();
        this.draw();
        this.lastTime = timestamp;
      }
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  private computeNextGeneration() {
    const preset = this.activePreset();
    const next: number[][] = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const neighbors = this.countNeighbors(r, c);
        const alive = this.grid[r][c] === 1;

        if (alive && preset.survival.includes(neighbors)) {
          next[r][c] = 1;
        } else if (!alive && preset.birth.includes(neighbors)) {
          next[r][c] = 1;
        }
      }
    }

    this.grid = next;
    this.generation.set(this.generation() + 1);
    this.updateMetrics();
  }

  private countNeighbors(r: number, c: number): number {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = (r + dr + this.rows) % this.rows;
        const nc = (c + dc + this.cols) % this.cols;
        count += this.grid[nr][nc];
      }
    }
    return count;
  }

  private updateMetrics() {
    let count = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        count += this.grid[r][c];
      }
    }
    this.activeCellCount.set(count);
    const total = this.rows * this.cols;
    this.densityPercentage.set(((count / total) * 100).toFixed(1));
  }

  private draw() {
    const canvas = this.caCanvas()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth || 360;
      canvas.height = canvas.clientHeight || 280;
    }

    ctx.fillStyle = '#05030A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellW = canvas.width / this.cols;
    const cellH = canvas.height / this.rows;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === 1) {
          ctx.fillStyle = '#A855F7';
          ctx.shadowColor = '#C084FC';
          ctx.shadowBlur = 6;
          ctx.fillRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);
        } else {
          ctx.fillStyle = '#0F081D';
          ctx.shadowBlur = 0;
          ctx.fillRect(c * cellW + 0.5, r * cellH + 0.5, cellW - 1, cellH - 1);
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }
}
