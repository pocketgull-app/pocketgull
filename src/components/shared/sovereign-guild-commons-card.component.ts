import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SovereignGuildCommonsService } from '../../services/sovereign-guild-commons.service';

@Component({
  selector: 'app-sovereign-guild-commons-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-blue-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-xl">
            🏛️
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2">
              Sovereign Guild & Commons Governance
              <span class="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-800 dark:text-blue-300 font-mono font-bold">
                Ostrom 8 Invariants
              </span>
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Disproving the "Tragedy of the Commons" with Elinor Ostrom's Nobel framework. Defending learning pods, community food forests, and repair guilds from hostile enclosure.
            </p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-zinc-800/80 rounded-xl text-xs font-bold">
          <button
            type="button"
            (click)="activeTab.set('ostrom')"
            [class.bg-white]="activeTab() === 'ostrom'"
            [class.dark:bg-zinc-700]="activeTab() === 'ostrom'"
            [class.shadow-sm]="activeTab() === 'ostrom'"
            class="px-3 py-1.5 rounded-lg transition-all text-gray-700 dark:text-zinc-200"
          >
            📊 Ostrom Diagnostic ({{ guildService.commonsResilienceIndex() }}%)
          </button>
          <button
            type="button"
            (click)="activeTab.set('defense')"
            [class.bg-white]="activeTab() === 'defense'"
            [class.dark:bg-zinc-700]="activeTab() === 'defense'"
            [class.shadow-sm]="activeTab() === 'defense'"
            class="px-3 py-1.5 rounded-lg transition-all text-gray-700 dark:text-zinc-200"
          >
            🛡️ School & Land Defense
          </button>
          <button
            type="button"
            (click)="activeTab.set('curriculum')"
            [class.bg-white]="activeTab() === 'curriculum'"
            [class.dark:bg-zinc-700]="activeTab() === 'curriculum'"
            [class.shadow-sm]="activeTab() === 'curriculum'"
            class="px-3 py-1.5 rounded-lg transition-all text-gray-700 dark:text-zinc-200"
          >
            🛠️ Guild Apprenticeships
          </button>
        </div>
      </div>

      <!-- Tab 1: Ostrom 8 Design Principles Diagnostic -->
      @if (activeTab() === 'ostrom') {
        <div class="space-y-5">
          <!-- Resilience Index Header -->
          <div class="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 border border-blue-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                Commons Resilience & Anti-Enclosure Health
              </div>
              <div class="text-xl font-black text-gray-900 dark:text-gray-100 mt-0.5">
                {{ guildService.commonsResilienceIndex() }}% Immunity to Hardin's Tragedy
              </div>
              <p class="text-[11px] text-gray-600 dark:text-zinc-300 mt-1">
                Elinor Ostrom demonstrated that common-pool resources survive for centuries when all 8 governance conditions are met.
              </p>
            </div>

            <button
              type="button"
              (click)="downloadCharter()"
              class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shrink-0"
            >
              📜 Export Ostrom Commons Charter
            </button>
          </div>

          <!-- 8 Principles Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            @for (p of guildService.ostromPrinciples(); track p.principleNumber) {
              <div class="p-3.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl space-y-2">
                <div class="flex justify-between items-start">
                  <span class="font-bold text-gray-900 dark:text-gray-100 text-sm">
                    {{ p.principleNumber }}. {{ p.name }}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded font-mono text-[9px] font-bold"
                    [class.bg-emerald-500/20]="p.status === 'OPTIMAL'"
                    [class.text-emerald-800]="p.status === 'OPTIMAL'"
                    [class.dark:text-emerald-300]="p.status === 'OPTIMAL'"
                    [class.bg-amber-500/20]="p.status === 'VULNERABLE'"
                    [class.text-amber-800]="p.status === 'VULNERABLE'"
                    [class.dark:text-amber-300]="p.status === 'VULNERABLE'"
                    [class.bg-red-500/20]="p.status === 'CRITICAL_RISK'"
                    [class.text-red-800]="p.status === 'CRITICAL_RISK'"
                    [class.dark:text-red-300]="p.status === 'CRITICAL_RISK'"
                  >
                    {{ p.status }}
                  </span>
                </div>

                <div class="text-[11px] text-gray-600 dark:text-zinc-400">
                  <strong class="text-blue-700 dark:text-blue-400">Hardin Myth Disproved:</strong> {{ p.hardinMythDebunked }}
                </div>

                <div class="text-[11px] text-gray-700 dark:text-zinc-300">
                  <strong>Mechanism:</strong> {{ p.operationalMechanism }}
                </div>

                <div class="text-[10px] text-indigo-700 dark:text-indigo-400 border-t border-gray-200 dark:border-zinc-700/60 pt-1.5 font-medium">
                  💡 <strong>Action:</strong> {{ p.concreteRemediation }}
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab 2: School Closure & Anti-Enclosure Playbook -->
      @if (activeTab() === 'defense') {
        <div class="space-y-4">
          <p class="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
            When predatory finance or municipal austerity shuts down public schools or liquidates community land, use this legal and logistical transition playbook to retain pedagogical sovereignty.
          </p>

          <div class="space-y-3">
            @for (step of guildService.antiEnclosurePlaybook; track step.stepNumber) {
              <div class="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2 text-xs">
                <div class="flex justify-between items-center">
                  <h4 class="font-bold text-red-900 dark:text-red-300 text-sm">
                    Step {{ step.stepNumber }}: {{ step.threatVector }}
                  </h4>
                  <span class="text-[10px] font-mono text-gray-500 dark:text-zinc-400">
                    {{ step.legalFilingReference }}
                  </span>
                </div>

                <p class="text-[11px] text-gray-600 dark:text-zinc-400">
                  <strong>Financial Tactic:</strong> {{ step.financialMechanism }}
                </p>

                <div class="p-2.5 bg-white dark:bg-zinc-800 rounded-lg border border-red-300/40 dark:border-red-900/40 text-[11px] text-gray-800 dark:text-zinc-200 font-medium">
                  <strong>🛡️ Community Counter-Move:</strong> {{ step.communityDefenseAction }}
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab 3: Guild Apprenticeships & Useful Arts -->
      @if (activeTab() === 'curriculum') {
        <div class="space-y-4">
          <p class="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
            The "Invisible College" curriculum. Four un-killable, practical apprenticeships that guarantee economic and physical survival regardless of institutional collapse.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            @for (mod of guildService.guildModules; track mod.id) {
              <div class="p-4 bg-teal-500/5 border border-teal-500/20 rounded-xl space-y-2 text-xs flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-start">
                    <h4 class="font-bold text-teal-900 dark:text-teal-300 text-sm">
                      {{ mod.title }}
                    </h4>
                    <span class="px-2 py-0.5 rounded bg-teal-500/20 text-teal-800 dark:text-teal-300 text-[9px] font-mono font-bold">
                      {{ mod.domain }}
                    </span>
                  </div>

                  <p class="text-[11px] text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {{ mod.description }}
                  </p>

                  <div class="mt-2 space-y-1 text-[11px]">
                    <div class="font-bold text-gray-700 dark:text-zinc-300">Core Competencies:</div>
                    <ul class="list-disc pl-4 space-y-0.5 text-gray-600 dark:text-zinc-400 text-[10px]">
                      @for (c of mod.coreCompetencies; track c) {
                        <li>{{ c }}</li>
                      }
                    </ul>
                  </div>
                </div>

                <div class="mt-3 pt-2 border-t border-teal-500/20 space-y-1 text-[10px]">
                  <div class="text-emerald-700 dark:text-emerald-400">
                    <strong>Offline Kit:</strong> {{ mod.offlineResourceKit }}
                  </div>
                  <div class="text-blue-700 dark:text-blue-400 font-medium">
                    <strong>Capstone:</strong> {{ mod.apprenticeProject }}
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class SovereignGuildCommonsCardComponent {
  readonly guildService = inject(SovereignGuildCommonsService);
  readonly activeTab = signal<'ostrom' | 'defense' | 'curriculum'>('ostrom');

  downloadCharter(): void {
    const md = this.guildService.generateCommonsCharterMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ostrom_Commons_Charter_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
