import { Component, ChangeDetectionStrategy, inject, computed, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolePathwayDocsService, ClinicalRolePathway, IPathwayDocumentation, IClinicalWorkflowStage } from '../services/role-pathway-docs.service';

@Component({
  selector: 'app-role-pathway-documentation-hub',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-zinc-950/95 text-zinc-100 border border-indigo-500/30 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      <!-- Top Header & Role Selector -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-xs">
            🧭
          </div>
          <div>
            <h3 class="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              Role &amp; Pathway Adaptive Documentation
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                Persona-Tailored View
              </span>
            </h3>
            <p class="text-xs text-zinc-400">
              Continuous 5-stage clinical workflow: Intake &rarr; Tri-Paradigm Consult &rarr; Care Plan &rarr; Soundscape Therapy &rarr; Longitudinal Outcomes.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-xs font-mono text-zinc-400">
            Viewing as: <strong class="text-indigo-400 font-bold">{{ currentPathwayDoc().roleTitle }}</strong>
          </div>
        </div>
      </div>

      <!-- 5 Role Pathway Selection Buttons -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        @for (pathway of allPathways(); track pathway.pathwayId) {
          <button (click)="selectPathway(pathway.pathwayId)"
                  [class.border-indigo-500]="activePathwayId() === pathway.pathwayId"
                  [class.bg-indigo-950/50]="activePathwayId() === pathway.pathwayId"
                  [class.ring-2]="activePathwayId() === pathway.pathwayId"
                  [class.ring-indigo-500/40]="activePathwayId() === pathway.pathwayId"
                  [class.border-zinc-800]="activePathwayId() !== pathway.pathwayId"
                  [class.bg-zinc-900/80]="activePathwayId() !== pathway.pathwayId"
                  class="p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-850 flex flex-col justify-between space-y-1.5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xl">{{ pathway.icon }}</span>
              @if (activePathwayId() === pathway.pathwayId) {
                <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              }
            </div>
            <div>
              <span class="text-xs font-bold block text-white leading-snug">{{ pathway.roleTitle.split('&')[0] }}</span>
              <span class="text-[10px] font-mono text-zinc-400 block truncate">{{ pathway.targetAudience.split(',')[0] }}</span>
            </div>
          </button>
        }
      </div>

      <!-- Role Overview Banner -->
      <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">{{ currentPathwayDoc().icon }}</span>
            <h4 class="text-sm font-black text-white">{{ currentPathwayDoc().roleTitle }}</h4>
          </div>
          <span class="px-2.5 py-1 rounded-lg bg-zinc-800 text-[10px] font-mono text-indigo-300 font-bold border border-zinc-700">
            Tone: {{ currentPathwayDoc().toneAndDensity.split('(')[0] }}
          </span>
        </div>
        <p class="text-xs text-zinc-300 leading-relaxed font-sans">
          {{ currentPathwayDoc().tagline }}
        </p>
      </div>

      <!-- 🌟 Continuous 5-Stage Step-by-Step Clinical Journey Stepper -->
      <div class="p-5 rounded-3xl bg-zinc-950 border border-emerald-500/30 space-y-5 shadow-xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">
              ⚡
            </div>
            <div>
              <h4 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                Continuous 5-Stage Clinical Journey
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                  Guided Workflow
                </span>
              </h4>
              <p class="text-[11px] text-zinc-400">Step sequentially through the end-to-end clinical encounter lifecycle.</p>
            </div>
          </div>

          <button (click)="launchStage(selectedWorkflowStage().targetTabId)"
                  class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer shrink-0">
            <span>Launch Active Stage ({{ selectedWorkflowStage().stageNumber }}/5)</span>
            <span>&rarr;</span>
          </button>
        </div>

        <!-- Linear Progress Pipeline Rail -->
        <div class="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono">
          @for (stage of currentPathwayDoc().workflowStages; track stage.stageNumber) {
            <button (click)="selectedStageNumber.set(stage.stageNumber)"
                    [class.bg-emerald-950\/60]="selectedStageNumber() === stage.stageNumber"
                    [class.border-emerald-500]="selectedStageNumber() === stage.stageNumber"
                    [class.ring-2]="selectedStageNumber() === stage.stageNumber"
                    [class.ring-emerald-500\/40]="selectedStageNumber() === stage.stageNumber"
                    [class.bg-zinc-900\/70]="selectedStageNumber() !== stage.stageNumber"
                    [class.border-zinc-800]="selectedStageNumber() !== stage.stageNumber"
                    class="p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer hover:border-emerald-500/40 flex flex-col justify-between space-y-2 group">
              
              <div class="flex items-center justify-between">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      [class.bg-emerald-500]="selectedStageNumber() === stage.stageNumber"
                      [class.text-zinc-950]="selectedStageNumber() === stage.stageNumber"
                      [class.bg-zinc-800]="selectedStageNumber() !== stage.stageNumber"
                      [class.text-zinc-300]="selectedStageNumber() !== stage.stageNumber">
                  {{ stage.stageNumber }}
                </span>
                <span class="text-base">{{ stage.icon }}</span>
              </div>

              <div>
                <span class="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">
                  {{ stage.statusBadge }}
                </span>
                <h5 class="text-xs font-bold text-white group-hover:text-emerald-300 transition line-clamp-1">
                  {{ stage.title.split('. ')[1] || stage.title }}
                </h5>
              </div>
            </button>
          }
        </div>

        <!-- Active Stage Spotlight Card -->
        @if (selectedWorkflowStage(); as activeStage) {
          <div class="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 animate-in fade-in duration-200">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl shrink-0">
                  {{ activeStage.icon }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                      STAGE {{ activeStage.stageNumber }} OF 5
                    </span>
                    <span class="text-xs font-mono text-zinc-400">• Standard: {{ activeStage.evidenceOrStandard }}</span>
                  </div>
                  <h4 class="text-sm font-bold text-white font-sans mt-0.5">{{ activeStage.title }}: {{ activeStage.subtitle }}</h4>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button (click)="previousStage()"
                        [disabled]="activeStage.stageNumber <= 1"
                        class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono text-zinc-300 transition cursor-pointer">
                  &larr; Prev
                </button>
                <button (click)="nextStage()"
                        [disabled]="activeStage.stageNumber >= 5"
                        class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono text-zinc-300 transition cursor-pointer">
                  Next &rarr;
                </button>
                <button (click)="launchStage(activeStage.targetTabId)"
                        class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs">
                  <span>Open Tool</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            <!-- Objective Statement -->
            <div class="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-200 leading-relaxed font-sans">
              <strong class="text-emerald-400 font-mono">Clinical Objective:</strong> {{ activeStage.clinicalObjective }}
            </div>

            <!-- Key Deliverables / Structured Outputs -->
            <div class="space-y-2">
              <span class="text-[10px] font-mono uppercase font-bold text-zinc-400 block tracking-wider">
                📦 Key Stage Outputs &amp; Deliverables:
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                @for (output of activeStage.keyOutputs; track output) {
                  <div class="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/60 text-xs font-mono text-zinc-300 flex items-center gap-2">
                    <span class="text-emerald-400 font-bold">&check;</span>
                    <span class="truncate">{{ output }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- 2-Column: Quick Actions + Recommended Tools -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        <!-- Left: Quick Actions -->
        <div class="space-y-3">
          <h4 class="text-xs font-mono uppercase font-bold text-zinc-400 flex items-center gap-1.5">
            <span>⚡ High-Priority Actions for Your Role</span>
          </h4>
          <div class="space-y-2.5">
            @for (action of currentPathwayDoc().quickActions; track action.title) {
              <div class="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-lg shrink-0">
                    {{ action.icon }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h5 class="text-xs font-bold text-white">{{ action.title }}</h5>
                      <span class="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-mono font-bold">
                        {{ action.badge }}
                      </span>
                    </div>
                    <p class="text-[11px] text-zinc-400 mt-0.5">{{ action.description }}</p>
                  </div>
                </div>
                <button (click)="navigateToTab.emit(action.targetTabId)"
                        class="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-mono font-bold transition cursor-pointer shrink-0 shadow-xs">
                  Launch &rarr;
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Right: Recommended Tool Suite -->
        <div class="space-y-3">
          <h4 class="text-xs font-mono uppercase font-bold text-zinc-400 flex items-center gap-1.5">
            <span>🧰 Curated Tool Matrix</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            @for (tool of currentPathwayDoc().recommendedTools; track tool.name) {
              <button (click)="navigateToTab.emit(tool.tabId)"
                      class="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-left hover:border-cyan-500/50 transition cursor-pointer group flex flex-col justify-between">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-base">{{ tool.icon }}</span>
                  <span class="text-xs font-bold text-white group-hover:text-cyan-300 transition">{{ tool.name }}</span>
                </div>
                <p class="text-[10px] text-zinc-400 line-clamp-2">{{ tool.purpose }}</p>
              </button>
            }
          </div>
        </div>

      </div>

      <!-- Positive Psychology & Snyder Hope Pathway Framework -->
      @if (currentPathwayDoc().flourishingAndHopeFramework; as fw) {
        <div class="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 via-emerald-950/30 to-indigo-950/40 border border-teal-500/30 space-y-3 shadow-sm">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-mono uppercase font-bold text-teal-300 flex items-center gap-2">
              <span>🌸 Positive Psychology &amp; Hope Framework</span>
              <span class="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 text-[10px] border border-teal-500/40 font-bold">
                {{ fw.permaDimension }}
              </span>
            </h4>
            <span class="text-[10px] font-mono text-zinc-400">Dr. Martin E. P. Seligman / Snyder Hope Protocol</span>
          </div>

          <!-- Multi-Pathway Choice Options -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            @for (path of fw.hopePathways; track path) {
              <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed flex items-start gap-2">
                <span class="text-teal-400 font-bold mt-0.5">✦</span>
                <span>{{ path }}</span>
              </div>
            }
          </div>

          <!-- Learned Optimism Reframe Banner -->
          <div class="p-2.5 rounded-xl bg-teal-950/30 border border-teal-500/20 flex items-center gap-2.5 text-[11px] text-teal-200">
            <span class="text-base shrink-0">💡</span>
            <span><strong>Learned Optimism Reframe:</strong> {{ fw.learnedOptimismReframe }}</span>
          </div>
        </div>
      }

      <!-- Regulatory Standards & Compliance Footer -->
      <div class="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 text-xs">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-mono uppercase font-bold text-indigo-300 text-[10px]">
            Governance &amp; Standards Compliance:
          </span>
          <div class="flex flex-wrap gap-1.5">
            @for (std of currentPathwayDoc().regulatoryAndStandards; track std) {
              <span class="px-2 py-0.5 rounded bg-indigo-900/50 text-indigo-200 text-[10px] font-mono font-semibold border border-indigo-700/40">
                {{ std }}
              </span>
            }
          </div>
        </div>
        <p class="text-zinc-400 text-[11px] italic pt-1 border-t border-indigo-500/20">
          "{{ currentPathwayDoc().takeHomeSummary }}"
        </p>
      </div>

    </div>
  `
})
export class RolePathwayDocumentationHubComponent {
  private docsService = inject(RolePathwayDocsService);

  readonly navigateToTab = output<string>();

  activePathwayId = computed(() => this.docsService.activePathway());
  allPathways = computed(() => this.docsService.getAllPathways());
  currentPathwayDoc = computed<IPathwayDocumentation>(() => this.docsService.getPathway(this.activePathwayId()));

  readonly selectedStageNumber = signal<number>(1);

  readonly selectedWorkflowStage = computed<IClinicalWorkflowStage>(() => {
    const stages = this.currentPathwayDoc().workflowStages;
    const stage = stages.find(s => s.stageNumber === this.selectedStageNumber());
    return stage || stages[0];
  });

  selectPathway(id: ClinicalRolePathway): void {
    this.docsService.setPathway(id);
    this.selectedStageNumber.set(1);
  }

  nextStage(): void {
    if (this.selectedStageNumber() < 5) {
      this.selectedStageNumber.update(n => n + 1);
    }
  }

  previousStage(): void {
    if (this.selectedStageNumber() > 1) {
      this.selectedStageNumber.update(n => n - 1);
    }
  }

  launchStage(targetTabId: string): void {
    if (targetTabId) {
      this.navigateToTab.emit(targetTabId);
    }
  }
}
