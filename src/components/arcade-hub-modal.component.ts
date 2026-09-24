import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationShellService } from '../services/navigation-shell.service';
import { HistoricalLuminariesGameComponent } from './historical-luminaries-game.component';
import { MovementHealingQuestComponent } from './movement-healing-quest.component';
import { DoctorShiftSimulatorComponent } from './doctor-shift-simulator.component';
import { ResidencyOsceSimulatorComponent } from './residency-osce-simulator.component';
import { JoyPlayfulFlourishingCardComponent } from './joy-playful-flourishing-card.component';

export type GameId = 'luminaries' | 'movement' | 'shift' | 'osce' | 'flourish' | 'trail';

@Component({
  selector: 'app-arcade-hub-modal',
  standalone: true,
  imports: [
    CommonModule,
    HistoricalLuminariesGameComponent,
    MovementHealingQuestComponent,
    DoctorShiftSimulatorComponent,
    ResidencyOsceSimulatorComponent,
    JoyPlayfulFlourishingCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[1150] bg-black/85 backdrop-blur-xl p-3 sm:p-6 flex items-center justify-center overflow-y-auto animate-in fade-in duration-300">
      <div class="w-full max-w-6xl bg-zinc-950 border border-amber-500/30 rounded-3xl shadow-2xl p-4 sm:p-6 text-zinc-100 relative space-y-6 max-h-[92vh] flex flex-col">
        
        <!-- Header Ribbon -->
        <div class="flex items-center justify-between border-b border-zinc-800 pb-4 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shadow-xs">
              🎮
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg sm:text-xl font-black tracking-wider text-white">
                  Pocket-Gull Arcade &amp; Clinical Quests Hub
                </h2>
                <span class="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                  Interactive Learning &amp; Flourishing
                </span>
              </div>
              <p class="text-xs text-zinc-400">
                Playful medicine, bio-rhythmic movement, historical mystery arenas, and clinical shift simulators.
              </p>
            </div>
          </div>

          <button 
            type="button"
            (click)="closeModal()"
            class="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
            aria-label="Close Arcade Hub"
          >
            ✕
          </button>
        </div>

        <!-- Game Navigation Tabs Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 shrink-0">
          <button 
            type="button"
            (click)="activeGame.set('luminaries')"
            [class.bg-amber-950/60]="activeGame() === 'luminaries'"
            [class.border-amber-500/60]="activeGame() === 'luminaries'"
            [class.text-amber-300]="activeGame() === 'luminaries'"
            [class.bg-zinc-900/80]="activeGame() !== 'luminaries'"
            [class.border-zinc-800]="activeGame() !== 'luminaries'"
            [class.text-zinc-400]="activeGame() !== 'luminaries'"
            class="p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between hover:border-amber-500/40 cursor-pointer"
          >
            <div class="text-lg">🏛️</div>
            <div class="mt-1">
              <div class="text-xs font-bold leading-tight">Luminaries</div>
              <div class="text-[9px] opacity-75 font-mono">Mystery Arena</div>
            </div>
          </button>

          <button 
            type="button"
            (click)="activeGame.set('movement')"
            [class.bg-emerald-950/60]="activeGame() === 'movement'"
            [class.border-emerald-500/60]="activeGame() === 'movement'"
            [class.text-emerald-300]="activeGame() === 'movement'"
            [class.bg-zinc-900/80]="activeGame() !== 'movement'"
            [class.border-zinc-800]="activeGame() !== 'movement'"
            [class.text-zinc-400]="activeGame() !== 'movement'"
            class="p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between hover:border-emerald-500/40 cursor-pointer"
          >
            <div class="text-lg">🌿</div>
            <div class="mt-1">
              <div class="text-xs font-bold leading-tight">Movement</div>
              <div class="text-[9px] opacity-75 font-mono">Healing Quest</div>
            </div>
          </button>

          <button 
            type="button"
            (click)="activeGame.set('shift')"
            [class.bg-indigo-950/60]="activeGame() === 'shift'"
            [class.border-indigo-500/60]="activeGame() === 'shift'"
            [class.text-indigo-300]="activeGame() === 'shift'"
            [class.bg-zinc-900/80]="activeGame() !== 'shift'"
            [class.border-zinc-800]="activeGame() !== 'shift'"
            [class.text-zinc-400]="activeGame() !== 'shift'"
            class="p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between hover:border-indigo-500/40 cursor-pointer"
          >
            <div class="text-lg">🏥</div>
            <div class="mt-1">
              <div class="text-xs font-bold leading-tight">Shift Duty</div>
              <div class="text-[9px] opacity-75 font-mono">Hospital Call Sim</div>
            </div>
          </button>

          <button 
            type="button"
            (click)="activeGame.set('osce')"
            [class.bg-cyan-950/60]="activeGame() === 'osce'"
            [class.border-cyan-500/60]="activeGame() === 'osce'"
            [class.text-cyan-300]="activeGame() === 'osce'"
            [class.bg-zinc-900/80]="activeGame() !== 'osce'"
            [class.border-zinc-800]="activeGame() !== 'osce'"
            [class.text-zinc-400]="activeGame() !== 'osce'"
            class="p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between hover:border-cyan-500/40 cursor-pointer"
          >
            <div class="text-lg">📋</div>
            <div class="mt-1">
              <div class="text-xs font-bold leading-tight">OSCE Sim</div>
              <div class="text-[9px] opacity-75 font-mono">Residency Cases</div>
            </div>
          </button>

          <button 
            type="button"
            (click)="activeGame.set('flourish')"
            [class.bg-rose-950/60]="activeGame() === 'flourish'"
            [class.border-rose-500/60]="activeGame() === 'flourish'"
            [class.text-rose-300]="activeGame() === 'flourish'"
            [class.bg-zinc-900/80]="activeGame() !== 'flourish'"
            [class.border-zinc-800]="activeGame() !== 'flourish'"
            [class.text-zinc-400]="activeGame() !== 'flourish'"
            class="p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between hover:border-rose-500/40 cursor-pointer"
          >
            <div class="text-lg">☀️</div>
            <div class="mt-1">
              <div class="text-xs font-bold leading-tight">Joy Matrix</div>
              <div class="text-[9px] opacity-75 font-mono">PERMA+ Flourishing</div>
            </div>
          </button>

          <button 
            type="button"
            (click)="activeGame.set('trail')"
            [class.bg-teal-950/60]="activeGame() === 'trail'"
            [class.border-teal-500/60]="activeGame() === 'trail'"
            [class.text-teal-300]="activeGame() === 'trail'"
            [class.bg-zinc-900/80]="activeGame() !== 'trail'"
            [class.border-zinc-800]="activeGame() !== 'trail'"
            [class.text-zinc-400]="activeGame() !== 'trail'"
            class="p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between hover:border-teal-500/40 cursor-pointer"
          >
            <div class="text-lg">🏕️</div>
            <div class="mt-1">
              <div class="text-xs font-bold leading-tight">Oregon Trail</div>
              <div class="text-[9px] opacity-75 font-mono">Terminal &amp; Web CLI</div>
            </div>
          </button>
        </div>

        <!-- Selected Game View Container -->
        <div class="flex-1 overflow-y-auto pr-1 space-y-4 font-sans">
          @switch (activeGame()) {
            @case ('luminaries') {
              <app-historical-luminaries-game />
            }
            @case ('movement') {
              <app-movement-healing-quest />
            }
            @case ('shift') {
              <app-doctor-shift-simulator (closeModal)="activeGame.set('luminaries')" />
            }
            @case ('osce') {
              <app-residency-osce-simulator />
            }
            @case ('flourish') {
              <app-joy-playful-flourishing-card />
            }
            @case ('trail') {
              <div class="p-6 rounded-3xl bg-zinc-900/95 border border-teal-500/30 space-y-4">
                <div class="flex items-center gap-3 border-b border-zinc-800 pb-4">
                  <span class="text-3xl">🏕️</span>
                  <div>
                    <h3 class="text-base font-bold text-teal-300">The Oregon Recovery Trail (Terminal &amp; CLI Expedition)</h3>
                    <p class="text-xs text-zinc-400">Launch the photographic ASCII Halftone Trail directly in your terminal, PowerShell, or desktop tray launcher!</p>
                  </div>
                </div>

                <div class="bg-black/90 p-4 rounded-xl border border-zinc-800 font-mono text-xs space-y-3">
                  <div class="text-amber-400 font-bold">Terminal &amp; PowerShell Commands:</div>
                  <div class="space-y-1 text-zinc-300">
                    <p><code class="text-emerald-400 font-bold bg-zinc-800 px-2 py-0.5 rounded">gull trail</code> — Launch instant ASCII 3-Act Recovery Expedition</p>
                    <p><code class="text-emerald-400 font-bold bg-zinc-800 px-2 py-0.5 rounded">gull play luminaries</code> — Retrospective mystery arena</p>
                    <p><code class="text-emerald-400 font-bold bg-zinc-800 px-2 py-0.5 rounded">gull play shift</code> — Doctor call duty simulator</p>
                    <p><code class="text-emerald-400 font-bold bg-zinc-800 px-2 py-0.5 rounded">gull play quest</code> — Movement &amp; Vagal Coherence Quest</p>
                  </div>
                </div>

                <div class="p-4 rounded-xl bg-teal-950/40 border border-teal-800/50 text-xs text-teal-200">
                  💡 <strong>Tray Integration:</strong> Right-click the Pocket-Gull icon in your Windows notification area (System Tray) to launch any game on demand!
                </div>
              </div>
            }
          }
        </div>

      </div>
    </div>
  `,
  styles: []
})
export class ArcadeHubModalComponent {
  navShell = inject(NavigationShellService);
  activeGame = signal<GameId>(
    (this.navShell.activeGameId() as GameId) || 'luminaries'
  );

  closeModal(): void {
    this.navShell.showArcadeHubModal.set(false);
  }
}
