import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeledentistryService, ToothSurface, TWIGrade, IToothState } from '../../services/teledentistry.service';

@Component({
  selector: 'app-teledentistry-systemic-lens',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      
      <!-- Top SIBI Inflammatory Telemetry Header Card -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-rose-950/40 border border-rose-500/30 shadow-xl relative overflow-hidden">
        
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🦷</span>
              <h3 class="text-xl font-bold text-zinc-100">Teledentistry & Systemic Health Cross-Talk</h3>
            </div>
            <p class="text-xs text-zinc-400 mt-1 max-w-xl">
              FDI 32-Tooth Odontogram surface caries mapping, Smith & Knight TWI tooth wear index, and Periodontal Inflammatory Burden Index (SIBI) cross-talk to systemic cardiovascular & glycemic trajectory.
            </p>
          </div>

          <!-- SIBI Score & Trajectory Badges -->
          <div class="flex items-center gap-4">
            <!-- SIBI Score Badge -->
            <div class="text-center p-3 px-5 rounded-xl bg-zinc-950/80 border border-rose-500/40 backdrop-blur-md">
              <div class="text-[10px] uppercase tracking-wider font-bold text-zinc-400">SIBI Score</div>
              <div class="text-2xl font-black text-rose-400">{{ dental.sibiScore() }} <span class="text-xs font-normal text-zinc-500">/ 100</span></div>
            </div>

            <!-- CV Risk Multiplier Badge -->
            <div class="text-center p-3 px-4 rounded-xl bg-zinc-950/80 border border-amber-500/40 backdrop-blur-md">
              <div class="text-[10px] uppercase tracking-wider font-bold text-zinc-400">CV Risk</div>
              <div class="text-xl font-black text-amber-400">{{ dental.cvRiskMultiplier() }}x</div>
            </div>

            <!-- HbA1c Trajectory Badge -->
            <div class="text-center p-3 px-4 rounded-xl bg-zinc-950/80 border border-emerald-500/40 backdrop-blur-md">
              <div class="text-[10px] uppercase tracking-wider font-bold text-zinc-400">HbA1c Δ</div>
              <div class="text-xl font-black text-emerald-400">+{{ dental.predictedHbA1cElevation() }}%</div>
            </div>
          </div>
        </div>

        <!-- Telemetry Breakdown Bar -->
        <div class="mt-6 pt-4 border-t border-zinc-800/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div class="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800">
            <span class="text-zinc-500">Deep Pockets (PPD ≥ 4mm):</span>
            <span class="font-bold text-rose-400 ml-2">{{ dental.deepPocketsCount() }} teeth</span>
          </div>
          <div class="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800">
            <span class="text-zinc-500">Bleeding on Probing (%BOP):</span>
            <span class="font-bold text-amber-400 ml-2">{{ dental.bleedingPercentage() }}%</span>
          </div>
          <div class="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800">
            <span class="text-zinc-500">hs-CRP Marker:</span>
            <span class="font-bold text-purple-400 ml-2">{{ dental.hsCRP() }} mg/L</span>
          </div>
          <div class="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800">
            <span class="text-zinc-500">Pathogen bacteremia:</span>
            <span class="font-bold text-rose-300 ml-2">P. gingivalis +</span>
          </div>
        </div>

      </div>

      <!-- FDI 32-Tooth Odontogram Grid -->
      <div class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-bold text-zinc-200 uppercase tracking-wider">FDI 32-Tooth Odontogram Grid (Teeth 11–48)</h4>
          <span class="text-xs text-zinc-500 font-mono">Click tooth to inspect or toggle caries surfaces (M, O, D, F, L)</span>
        </div>

        <!-- Maxillary Arch (Q1 & Q2) -->
        <div>
          <div class="text-xs font-semibold text-zinc-400 mb-2 border-b border-zinc-800 pb-1">Maxillary Arch (Upper Jaw)</div>
          <div class="grid grid-cols-8 md:grid-cols-16 gap-1.5 overflow-x-auto pb-2">
            @for (tooth of dental.teeth().slice(0, 16); track tooth.fdiNumber) {
              <button (click)="selectedTooth.set(tooth)"
                [class.ring-2]="selectedTooth()?.fdiNumber === tooth.fdiNumber"
                [class.ring-emerald-400]="selectedTooth()?.fdiNumber === tooth.fdiNumber"
                [class.bg-rose-950\/40]="tooth.probingDepthMm >= 4"
                [class.border-rose-500\/40]="tooth.probingDepthMm >= 4"
                [class.bg-zinc-950]="tooth.probingDepthMm < 4"
                class="p-2 rounded-xl border border-zinc-800 hover:border-zinc-600 transition flex flex-col items-center gap-1 text-center cursor-pointer min-w-[50px]">
                <span class="text-[10px] font-mono font-bold text-zinc-400">#{{ tooth.fdiNumber }}</span>
                <div class="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-mono font-bold"
                  [class.text-amber-400]="tooth.cariesSurfaces.length > 0">
                  {{ tooth.cariesSurfaces.length > 0 ? tooth.cariesSurfaces.join('') : '✓' }}
                </div>
                <span class="text-[9px] font-mono" [class.text-rose-400]="tooth.probingDepthMm >= 4" [class.text-zinc-500]="tooth.probingDepthMm < 4">
                  {{ tooth.probingDepthMm }}mm
                </span>
              </button>
            }
          </div>
        </div>

        <!-- Mandibular Arch (Q4 & Q3) -->
        <div>
          <div class="text-xs font-semibold text-zinc-400 mb-2 border-b border-zinc-800 pb-1">Mandibular Arch (Lower Jaw)</div>
          <div class="grid grid-cols-8 md:grid-cols-16 gap-1.5 overflow-x-auto pb-2">
            @for (tooth of dental.teeth().slice(16, 32); track tooth.fdiNumber) {
              <button (click)="selectedTooth.set(tooth)"
                [class.ring-2]="selectedTooth()?.fdiNumber === tooth.fdiNumber"
                [class.ring-emerald-400]="selectedTooth()?.fdiNumber === tooth.fdiNumber"
                [class.bg-rose-950\/40]="tooth.probingDepthMm >= 4"
                [class.border-rose-500\/40]="tooth.probingDepthMm >= 4"
                [class.bg-zinc-950]="tooth.probingDepthMm < 4"
                class="p-2 rounded-xl border border-zinc-800 hover:border-zinc-600 transition flex flex-col items-center gap-1 text-center cursor-pointer min-w-[50px]">
                <span class="text-[10px] font-mono font-bold text-zinc-400">#{{ tooth.fdiNumber }}</span>
                <div class="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-mono font-bold"
                  [class.text-amber-400]="tooth.cariesSurfaces.length > 0">
                  {{ tooth.cariesSurfaces.length > 0 ? tooth.cariesSurfaces.join('') : '✓' }}
                </div>
                <span class="text-[9px] font-mono" [class.text-rose-400]="tooth.probingDepthMm >= 4" [class.text-zinc-500]="tooth.probingDepthMm < 4">
                  {{ tooth.probingDepthMm }}mm
                </span>
              </button>
            }
          </div>
        </div>

      </div>

      <!-- Selected Tooth Inspection & TWI Surface Editor -->
      @if (selectedTooth(); as active) {
        <div class="p-6 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              Tooth #{{ active.fdiNumber }} Inspector — {{ active.name }}
            </h4>
            <button (click)="selectedTooth.set(null)" class="text-xs text-zinc-500 hover:text-zinc-300">Close</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- Surface Caries Toggles (M, O, D, F, L) -->
            <div class="space-y-2">
              <label class="text-xs font-semibold text-zinc-300">Surface Caries & Restorations:</label>
              <div class="flex gap-2">
                @for (surf of surfaces; track surf) {
                  <button (click)="dental.toggleSurface(active.fdiNumber, surf)"
                    [class.bg-amber-500]="active.cariesSurfaces.includes(surf)"
                    [class.text-zinc-950]="active.cariesSurfaces.includes(surf)"
                    [class.bg-zinc-800]="!active.cariesSurfaces.includes(surf)"
                    [class.text-zinc-300]="!active.cariesSurfaces.includes(surf)"
                    class="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer border border-zinc-700">
                    {{ surf }}
                  </button>
                }
              </div>
            </div>

            <!-- Smith & Knight Tooth Wear Index (TWI Grades 0-4) -->
            <div class="space-y-2">
              <label class="text-xs font-semibold text-zinc-300">Smith & Knight TWI Grade:</label>
              <div class="flex gap-1.5">
                @for (g of twiGrades; track g) {
                  <button (click)="dental.setTWIGrade(active.fdiNumber, g)"
                    [class.bg-purple-600]="active.twiGrade === g"
                    [class.text-white]="active.twiGrade === g"
                    [class.bg-zinc-800]="active.twiGrade !== g"
                    [class.text-zinc-400]="active.twiGrade !== g"
                    class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer border border-zinc-700">
                    G{{ g }}
                  </button>
                }
              </div>
            </div>

            <!-- Periodontal Probing & BOP Toggle -->
            <div class="space-y-2">
              <label class="text-xs font-semibold text-zinc-300">Probing Depth & BOP:</label>
              <div class="flex items-center gap-3">
                <input type="number" min="1" max="12" [value]="active.probingDepthMm"
                  (input)="onDepthChange(active.fdiNumber, $event)"
                  class="w-16 p-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-center text-zinc-100" />
                <span class="text-xs text-zinc-400">mm PPD</span>

                <button (click)="dental.toggleBOP(active.fdiNumber)"
                  [class.bg-rose-600]="active.hasBleedingOnProbing"
                  [class.text-white]="active.hasBleedingOnProbing"
                  [class.bg-zinc-800]="!active.hasBleedingOnProbing"
                  [class.text-zinc-400]="!active.hasBleedingOnProbing"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border border-zinc-700">
                  BOP {{ active.hasBleedingOnProbing ? 'Active' : 'Off' }}
                </button>
              </div>
            </div>

          </div>
        </div>
      @}

    </div>
  `
})
export class TeledentistrySystemicLensComponent {
  readonly dental = inject(TeledentistryService);
  readonly selectedTooth = signal<IToothState | null>(null);

  readonly surfaces: ToothSurface[] = ['M', 'O', 'D', 'F', 'L'];
  readonly twiGrades: TWIGrade[] = [0, 1, 2, 3, 4];

  onDepthChange(fdiNumber: number, event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val) && val >= 1 && val <= 12) {
      this.dental.setProbingDepth(fdiNumber, val);
    }
  }
}
