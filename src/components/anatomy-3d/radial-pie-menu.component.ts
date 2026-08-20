import { Component, ChangeDetectionStrategy, input, output, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type RadialPieAction = 'logSymptom' | 'orderLab' | 'checkDrugs' | 'launchWhatIf';

export interface IRadialPieItem {
  id: RadialPieAction;
  title: string;
  subtitle: string;
  icon: string;
  colorClass: string;
  bgHoverClass: string;
  borderClass: string;
  positionClass: string;
}

@Component({
  selector: 'app-radial-pie-menu',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop to capture outside clicks and dismiss -->
    <div class="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-150 select-none cursor-default"
         (click)="onBackdropClick($event)"
         (contextmenu)="$event.preventDefault()">
      
      <!-- Radial Menu Circle Hub positioned at (x, y) with boundary clamping -->
      <div class="absolute -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-auto flex items-center justify-center font-mono animate-in zoom-in-75 fade-in duration-200"
           [style.left.px]="clampedX()"
           [style.top.px]="clampedY()"
           (click)="$event.stopPropagation()">
        
        <!-- Central Center Node -->
        <div class="z-20 w-24 h-24 rounded-full bg-zinc-950/95 border-2 border-teal-500/80 shadow-[0_0_25px_rgba(20,184,166,0.35)] flex flex-col items-center justify-center text-center p-2 text-white backdrop-blur-xl">
          <span class="text-xl leading-none mb-1">{{ partIcon() }}</span>
          <span class="text-[10px] font-bold uppercase tracking-wider text-teal-300 truncate max-w-[80px]">
            {{ partName() }}
          </span>
          <button (click)="close.emit()" 
                  class="mt-1 text-[9px] text-zinc-400 hover:text-rose-400 transition-colors uppercase font-bold"
                  title="Close Menu (Esc)">
            ✕ Close
          </button>
        </div>

        <!-- 4 Quadrant Action Buttons (Fitts's Law Direct Access) -->
        
        <!-- 1. TOP: Log Focused Symptom -->
        <button (click)="selectAction('logSymptom')"
                class="absolute -top-1 left-1/2 -translate-x-1/2 w-28 py-2 px-2.5 rounded-xl bg-zinc-950/95 border border-teal-500/50 hover:border-teal-400 hover:bg-teal-950/80 text-white shadow-xl backdrop-blur-xl transition-all duration-150 hover:scale-105 flex items-center gap-2 group cursor-pointer z-10">
          <span class="text-base group-hover:scale-110 transition-transform">📋</span>
          <div class="text-left leading-tight">
            <div class="text-[10.5px] font-bold text-teal-300 uppercase">Log Symptom</div>
            <div class="text-[8.5px] text-zinc-400">Intake Focus</div>
          </div>
        </button>

        <!-- 2. RIGHT: Order Lab Biomarker Panel -->
        <button (click)="selectAction('orderLab')"
                class="absolute -right-3 top-1/2 -translate-y-1/2 w-28 py-2 px-2.5 rounded-xl bg-zinc-950/95 border border-sky-500/50 hover:border-sky-400 hover:bg-sky-950/80 text-white shadow-xl backdrop-blur-xl transition-all duration-150 hover:scale-105 flex items-center gap-2 group cursor-pointer z-10">
          <span class="text-base group-hover:scale-110 transition-transform">🧪</span>
          <div class="text-left leading-tight">
            <div class="text-[10.5px] font-bold text-sky-300 uppercase">Order Labs</div>
            <div class="text-[8.5px] text-zinc-400">Biomarkers</div>
          </div>
        </button>

        <!-- 3. BOTTOM: Launch What-If Sandbox Simulator -->
        <button (click)="selectAction('launchWhatIf')"
                class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-28 py-2 px-2.5 rounded-xl bg-zinc-950/95 border border-amber-500/50 hover:border-amber-400 hover:bg-amber-950/80 text-white shadow-xl backdrop-blur-xl transition-all duration-150 hover:scale-105 flex items-center gap-2 group cursor-pointer z-10">
          <span class="text-base group-hover:scale-110 transition-transform">🔮</span>
          <div class="text-left leading-tight">
            <div class="text-[10.5px] font-bold text-amber-300 uppercase">What-If Sim</div>
            <div class="text-[8.5px] text-zinc-400">Prognosis</div>
          </div>
        </button>

        <!-- 4. LEFT: Check Drug Interactions (CYP450) -->
        <button (click)="selectAction('checkDrugs')"
                class="absolute -left-3 top-1/2 -translate-y-1/2 w-28 py-2 px-2.5 rounded-xl bg-zinc-950/95 border border-purple-500/50 hover:border-purple-400 hover:bg-purple-950/80 text-white shadow-xl backdrop-blur-xl transition-all duration-150 hover:scale-105 flex items-center gap-2 group cursor-pointer z-10">
          <span class="text-base group-hover:scale-110 transition-transform">💊</span>
          <div class="text-left leading-tight">
            <div class="text-[10.5px] font-bold text-purple-300 uppercase">Check Drugs</div>
            <div class="text-[8.5px] text-zinc-400">Cross-Refer</div>
          </div>
        </button>

      </div>
    </div>
  `
})
export class RadialPieMenuComponent {
  x = input<number>(200);
  y = input<number>(200);
  partId = input<string>('organ');
  partName = input<string>('Organ System');
  partIcon = input<string>('🩺');

  actionSelected = output<{ action: RadialPieAction; partId: string }>();
  close = output<void>();

  /**
   * Clamps X and Y coordinates so the radial circle doesn't overflow screen bounds.
   */
  get clampedX(): () => number {
    return () => {
      const pad = 140;
      const maxX = (typeof window !== 'undefined' ? window.innerWidth : 800) - pad;
      return Math.max(pad, Math.min(this.x(), maxX));
    };
  }

  get clampedY(): () => number {
    return () => {
      const pad = 140;
      const maxY = (typeof window !== 'undefined' ? window.innerHeight : 600) - pad;
      return Math.max(pad, Math.min(this.y(), maxY));
    };
  }

  selectAction(action: RadialPieAction): void {
    this.actionSelected.emit({ action, partId: this.partId() });
  }

  onBackdropClick(event: MouseEvent): void {
    this.close.emit();
  }

  @HostListener('window:keydown.escape', ['$event'])
  onEscapeKey(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.close.emit();
  }
}
