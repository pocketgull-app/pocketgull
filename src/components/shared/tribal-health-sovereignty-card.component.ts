import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TribalHealthSovereigntyService, ITribalSovereigntyReport } from '../../services/tribal-health-sovereignty.service';

@Component({
  selector: 'app-tribal-health-sovereignty-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl bg-zinc-950 border border-emerald-500/30 p-5 shadow-2xl space-y-4 font-pocketgull-inter text-zinc-100">
      
      <!-- Header Banner with Sovereign Seal -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl">
            🪶
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold font-pocketgull-mono text-emerald-300">Tribal Health Sovereignty &amp; CARE Codex</h3>
              <span class="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-pocketgull-mono">
                Seven Generations
              </span>
            </div>
            <p class="text-xs text-zinc-400">Indigenous Data Sovereignty, Traditional Plant Formulary &amp; Maternal Epigenetics</p>
          </div>
        </div>

        <!-- Tribal Sovereign Seal Badge -->
        <div class="px-3 py-1 rounded-lg bg-zinc-900 border border-emerald-500/40 text-[10px] font-pocketgull-mono text-emerald-400">
          <span class="text-zinc-500">TIRB Seal:</span> {{ report().tribalIrbSeal }}
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          (click)="activeTab.set('care')"
          [class]="activeTab() === 'care'
            ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-sm'
            : 'px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'"
        >
          🛡️ CARE Principles
        </button>
        <button
          type="button"
          (click)="activeTab.set('herbs')"
          [class]="activeTab() === 'herbs'
            ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-sm'
            : 'px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'"
        >
          🌿 Traditional Plant Codex
        </button>
        <button
          type="button"
          (click)="activeTab.set('maternal')"
          [class]="activeTab() === 'maternal'
            ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-sm'
            : 'px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'"
        >
          👶 Sacred First 1,000 Days
        </button>
      </div>

      <!-- Tab 1: CARE Data Sovereignty Principles -->
      @if (activeTab() === 'care') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          @for (principle of report().carePrinciples; track principle.code) {
            <div class="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase font-pocketgull-mono text-emerald-400">
                  {{ principle.title }}
                </span>
                <span class="px-1.5 py-0.5 text-[8px] font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-500/20 font-pocketgull-mono">
                  {{ principle.implementationStatus }}
                </span>
              </div>
              <p class="text-zinc-300 text-[11px] leading-relaxed">{{ principle.description }}</p>
              <div class="text-[10px] text-zinc-500 font-mono pt-1">
                Audit: <span class="text-zinc-300">{{ principle.auditMetric }}</span>
              </div>
            </div>
          }
        </div>
      }

      <!-- Tab 2: Traditional Indigenous Herbal Codex -->
      @if (activeTab() === 'herbs') {
        <div class="space-y-3">
          <div class="text-xs text-zinc-400">
            Traditional Ecological Knowledge (TEK) remedies cross-referenced with modern phytochemical and Cytochrome P450 safety profiles:
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            @for (herb of report().botanicalCodexMatches; track herb.id) {
              <div class="p-3.5 rounded-xl bg-zinc-900/90 border border-emerald-500/30 space-y-2">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-bold text-zinc-100 text-sm font-pocketgull-inter">{{ herb.commonName }}</h4>
                    <span class="text-[10px] italic text-emerald-400 font-pocketgull-mono">{{ herb.botanicalName }}</span>
                  </div>
                  <span class="px-2 py-0.5 text-[9px] font-bold rounded bg-zinc-950 text-zinc-300 border border-zinc-700 font-pocketgull-mono">
                    {{ herb.safetyProfile }}
                  </span>
                </div>
                
                <div class="text-[11px] text-zinc-300">
                  <strong class="text-zinc-400">Tradition:</strong> {{ herb.indigenousTradition }}
                </div>
                <div class="text-[11px] text-zinc-300">
                  <strong class="text-zinc-400">Preparation:</strong> {{ herb.traditionalPreparation }}
                </div>

                <div class="flex flex-wrap gap-1 pt-1">
                  @for (action of herb.primaryTherapeuticActions; track action) {
                    <span class="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] font-medium border border-emerald-500/20">
                      {{ action }}
                    </span>
                  }
                </div>

                <div class="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] space-y-1">
                  <div class="text-amber-300 font-bold">⚠️ Rx Interaction Check:</div>
                  <div class="text-zinc-400">{{ herb.cyp450InteractionNotes }}</div>
                </div>

                <div class="text-[10px] text-emerald-400 italic">
                  🌲 <strong>Stewardship:</strong> {{ herb.sevenGenerationsStewardshipNote }}
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab 3: Sacred First 1,000 Days Maternal-Infant Protocol -->
      @if (activeTab() === 'maternal') {
        <div class="space-y-3">
          <div class="text-xs text-zinc-400">
            Epigenetic lineage shielding from preconception through infant development (the first 1,000 days):
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            @for (stage of report().first1000DaysProtocol; track stage.phase) {
              <div class="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <span class="text-xs font-bold text-emerald-300 font-pocketgull-inter">{{ stage.title }}</span>
                  <span class="px-2 py-0.5 text-[8px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-500/20 font-pocketgull-mono">
                    {{ stage.phase }}
                  </span>
                </div>

                <div class="text-[11px] text-zinc-300">
                  <strong class="text-emerald-400 font-pocketgull-mono">Traditional Nutrition:</strong>
                  <ul class="list-disc pl-4 mt-0.5 text-zinc-300 space-y-0.5">
                    @for (food of stage.nutritionalFocus; track food) {
                      <li>{{ food }}</li>
                    }
                  </ul>
                </div>

                <div class="text-[11px] text-zinc-400">
                  <strong class="text-zinc-300">Somatic &amp; Vagal Care:</strong> {{ stage.somaticVagalSupport }}
                </div>

                <div class="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300">
                  <strong class="text-emerald-300">Cultural Continuum:</strong> {{ stage.culturalTradition }}
                </div>

                <div class="text-[10px] text-zinc-400 font-mono">
                  🧬 <strong>Epigenetic Goal:</strong> {{ stage.epigeneticGoal }}
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Footer Attestation -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
        <div>
          Authority: <strong class="text-zinc-200">{{ report().tribalNationJurisdiction }}</strong>
        </div>
        <div class="text-emerald-400 font-bold font-pocketgull-mono">
          ✓ 100% Zero-Cloud Egress Edge Protected
        </div>
      </div>

    </div>
  `
})
export class TribalHealthSovereigntyCardComponent {
  private sovereigntyService: TribalHealthSovereigntyService;

  activeTab = signal<'care' | 'herbs' | 'maternal'>('care');
  report = signal<ITribalSovereigntyReport>({} as any);

  constructor(customService?: TribalHealthSovereigntyService) {
    if (customService) {
      this.sovereigntyService = customService;
    } else {
      try {
        this.sovereigntyService = inject(TribalHealthSovereigntyService, { optional: true }) || new TribalHealthSovereigntyService();
      } catch {
        this.sovereigntyService = new TribalHealthSovereigntyService();
      }
    }
    this.report.set(this.sovereigntyService.generateSovereigntyReport());
  }
}
