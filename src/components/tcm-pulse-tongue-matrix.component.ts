import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

export interface ITcmPulsePosition {
  name: string;
  hand: 'Left' | 'Right';
  position: 'Cun (Inch)' | 'Guan (Bar)' | 'Chi (Cubit)';
  organSuperficial: string;
  organDeep: string;
  quality: 'Floating (Fu)' | 'Sinking (Chen)' | 'Rapid (Shu)' | 'Slow (Chi)' | 'Slippery (Hua)' | 'Wiry (Xian)' | 'Balanced (Ping)';
}

export interface ITcmTongueDiagnosis {
  bodyColor: 'Pale Pink (Normal)' | 'Pale (Qi/Blood Deficient)' | 'Red (Heat/Fire)' | 'Purple/Dusk (Blood Stasis)';
  coatingThickness: 'Thin White (Normal)' | 'Thick White (Cold/Damp)' | 'Thick Yellow (Damp-Heat)' | 'Peeled/Geographic (Yin Deficient)';
  sublingualVeins: 'Normal (Slim, Pink)' | 'Engorged / Dark Purple (Severe Blood Stasis)';
}

@Component({
  selector: 'app-tcm-pulse-tongue-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-emerald-500/40 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">
            ☯️
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              TCM 12-Meridian Pulse & Tongue Diagnostic Matrix
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Traditional Chinese Medicine pulse position mapping (Cun, Guan, Chi), Five Elements organ network, and sublingual vein stasis tracker.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold font-mono">
            TCM Tri-Paradigm
          </span>
        </div>
      </div>

      <!-- 6 Pulse Positions Grid (Cun, Guan, Chi for Left & Right Wrists) -->
      <div class="space-y-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-zinc-300">
          Radial Artery 6-Position Pulse Qualities (Cun, Guan, Chi):
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div *ngFor="let p of pulsePositions()" class="p-3 bg-emerald-500/5 border border-emerald-500/30 rounded-xl space-y-1.5">
            <div class="flex justify-between items-center">
              <span class="font-bold text-emerald-900 dark:text-emerald-300">{{ p.hand }} Wrist - {{ p.position }}</span>
              <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded font-mono text-[10px] font-bold">
                {{ p.quality }}
              </span>
            </div>
            <div class="text-[11px] text-gray-600 dark:text-zinc-300">
              <div><strong>Superficial organ:</strong> {{ p.organSuperficial }}</div>
              <div><strong>Deep organ:</strong> {{ p.organDeep }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tongue & Sublingual Vein Inspection Matrix -->
      <div class="p-4 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl space-y-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-zinc-300">
          Tongue Body, Coating & Sublingual Blood Stasis Diagnostics:
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-gray-700 dark:text-zinc-300">Tongue Body Color:</label>
            <div class="p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-800 dark:text-gray-200 font-medium">
              {{ tongueDiagnosis().bodyColor }}
            </div>
          </div>

          <div class="space-y-1">
            <label class="font-bold text-gray-700 dark:text-zinc-300">Coating & Moss Quality:</label>
            <div class="p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-800 dark:text-gray-200 font-medium">
              {{ tongueDiagnosis().coatingThickness }}
            </div>
          </div>

          <div class="space-y-1">
            <label class="font-bold text-gray-700 dark:text-zinc-300">Sublingual Veins (Blood Stasis):</label>
            <div class="p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-800 dark:text-gray-200 font-medium">
              {{ tongueDiagnosis().sublingualVeins }}
            </div>
          </div>
        </div>
      </div>

      <!-- TCM Disharmony & Botanical Strategy -->
      <div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
        <div class="font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wide flex items-center gap-2">
          <span>🌿 Active TCM Pattern Disharmony & Botanical Formula:</span>
        </div>
        <p class="text-gray-800 dark:text-gray-200">
          <strong>Pattern:</strong> Liver Qi Stagnation with Blood Deficient Heat.
        </p>
        <p class="text-gray-600 dark:text-zinc-300">
          <strong>Classical Botanical Formula:</strong> <em>Xiao Yao San</em> (Free & Easy Wanderer) featuring Chai Hu (Bupleurum), Dang Gui (Angelica Sinensis), and Bai Shao (White Peony).
        </p>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class TcmPulseTongueMatrixComponent {
  private state = inject(PatientStateService);

  readonly pulsePositions = signal<ITcmPulsePosition[]>([
    { name: 'Left Cun', hand: 'Left', position: 'Cun (Inch)', organSuperficial: 'Small Intestine', organDeep: 'Heart', quality: 'Balanced (Ping)' },
    { name: 'Left Guan', hand: 'Left', position: 'Guan (Bar)', organSuperficial: 'Gallbladder', organDeep: 'Liver', quality: 'Wiry (Xian)' },
    { name: 'Left Chi', hand: 'Left', position: 'Chi (Cubit)', organSuperficial: 'Urinary Bladder', organDeep: 'Kidney Yin', quality: 'Sinking (Chen)' },
    { name: 'Right Cun', hand: 'Right', position: 'Cun (Inch)', organSuperficial: 'Large Intestine', organDeep: 'Lung', quality: 'Floating (Fu)' },
    { name: 'Right Guan', hand: 'Right', position: 'Guan (Bar)', organSuperficial: 'Stomach', organDeep: 'Spleen', quality: 'Slippery (Hua)' },
    { name: 'Right Chi', hand: 'Right', position: 'Chi (Cubit)', organSuperficial: 'San Jiao (Triple Burner)', organDeep: 'Kidney Yang (Ming Men)', quality: 'Balanced (Ping)' }
  ]);

  readonly tongueDiagnosis = signal<ITcmTongueDiagnosis>({
    bodyColor: 'Red (Heat/Fire)',
    coatingThickness: 'Thin White (Normal)',
    sublingualVeins: 'Normal (Slim, Pink)'
  });
}
