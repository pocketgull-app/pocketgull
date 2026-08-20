import { Component, ChangeDetectionStrategy, inject, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleDemoLauncherService, IRoleDemoScenario } from '../services/role-demo-launcher.service';
import { ClinicalRolePathway } from '../services/role-pathway-docs.service';

@Component({
  selector: 'app-role-demo-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      <div class="relative w-full max-w-4xl rounded-3xl bg-zinc-950 text-zinc-100 border border-teal-500/40 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col justify-between">
        
        <!-- Modal Top Bar -->
        <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-2xl shadow-xs">
              ✨
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                Experience Pocket-Gull by Clinical Role
                <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30">
                  Interactive Demo Mode
                </span>
              </h3>
              <p class="text-xs text-zinc-400">
                Select your perspective to launch an automated, curated live case and clinical tool walk-through.
              </p>
            </div>
          </div>

          <button (click)="closeModal.emit()"
                  class="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition flex items-center justify-center cursor-pointer text-sm font-bold">
            ✕
          </button>
        </div>

        <!-- 5 Role Demo Scenario Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 overflow-y-auto pr-1 py-1">
          @for (scenario of scenarios(); track scenario.roleId) {
            <div class="p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3"
                 [class.border-teal-500]="selectedRoleId() === scenario.roleId"
                 [class.bg-teal-950/30]="selectedRoleId() === scenario.roleId"
                 [class.ring-2]="selectedRoleId() === scenario.roleId"
                 [class.ring-teal-500/40]="selectedRoleId() === scenario.roleId"
                 [class.border-zinc-800]="selectedRoleId() !== scenario.roleId"
                 [class.bg-zinc-900/80]="selectedRoleId() !== scenario.roleId"
                 (click)="selectedRoleId.set(scenario.roleId)">
              
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-2xl">{{ scenario.roleIcon }}</span>
                  <span class="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wider bg-zinc-800 text-zinc-300">
                    {{ scenario.roleTitle.split('&')[0] }}
                  </span>
                </div>
                
                <h4 class="text-xs font-black text-white leading-snug">{{ scenario.scenarioName }}</h4>
                <p class="text-[11px] text-zinc-400 leading-snug">{{ scenario.clinicalNarrative }}</p>
              </div>

              <div class="space-y-2 pt-2 border-t border-zinc-800/80">
                <div class="flex flex-wrap gap-1">
                  @for (mod of scenario.highlightedModules; track mod) {
                    <span class="px-1.5 py-0.5 rounded bg-zinc-800/80 text-[9px] font-mono text-teal-300 font-semibold border border-zinc-700/40">
                      {{ mod }}
                    </span>
                  }
                </div>

                <button (click)="activateDemo(scenario.roleId); $event.stopPropagation()"
                        class="w-full py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-mono font-bold text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5">
                  <span>Launch {{ scenario.roleIcon }} Demo →</span>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Footer HUD -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800 pt-4 text-xs font-mono text-zinc-400">
          <span>🔒 100% HIPAA Safe Harbor De-identified & Offline Capable</span>
          <button (click)="closeModal.emit()"
                  class="px-4 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 text-xs font-mono transition cursor-pointer">
            Dismiss
          </button>
        </div>

      </div>

    </div>
  `
})
export class RoleDemoModalComponent {
  private demoService = inject(RoleDemoLauncherService);

  readonly closeModal = output<void>();
  readonly onDemoLaunched = output<string>();

  selectedRoleId = signal<ClinicalRolePathway>('clinician');
  scenarios = computed(() => this.demoService.getScenarios());

  activateDemo(roleId: ClinicalRolePathway): void {
    const scenario = this.demoService.launchRoleDemo(roleId);
    this.onDemoLaunched.emit(scenario.initialActiveTab);
    this.closeModal.emit();
  }
}
