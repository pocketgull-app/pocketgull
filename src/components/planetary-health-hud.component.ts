import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GreenComputingSustainabilityService, IEcoRecommendation } from '../services/green-computing-sustainability.service';

@Component({
  selector: 'app-planetary-health-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card-dark rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden space-y-6">
      <div class="rams-grill"><div></div><div></div><div></div><div></div></div>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            <span>🌍 EAT-Lancet &amp; WHO Planetary Health</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white">
            Planetary Health &amp; Sustainability HUD
          </h2>
          <p class="text-xs sm:text-sm text-stone-300">
            Personal health decisions that improve cardiovascular vitality while cutting global carbon footprint.
          </p>
        </div>

        <!-- Summary Metric Badges -->
        <div class="flex items-center gap-3 font-mono text-xs">
          <div class="p-3 rounded-2xl bg-stone-900 border border-emerald-500/30 text-center shadow-md">
            <div class="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
              {{ activeCo2SavingsKg() }}
            </div>
            <div class="text-[10px] text-stone-400">kg CO₂ Saved / yr</div>
          </div>
          <div class="p-3 rounded-2xl bg-stone-900 border border-amber-500/30 text-center shadow-md">
            <div class="text-xl sm:text-2xl font-bold text-amber-300 font-mono">
              {{ sustainabilityScore() }}%
            </div>
            <div class="text-[10px] text-stone-400">Eco-Health Score</div>
          </div>
        </div>
      </div>

      <!-- Interactive Eco-Health Actions Checklist -->
      <div class="space-y-3">
        <div class="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
          <span>Active Green Prescriptions &amp; Habits ({{ selectedCount() }}/{{ totalCount() }})</span>
          <span class="text-emerald-400">{{ activeTier() }}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (item of recommendations(); track item.id) {
            <div 
              (click)="toggleHabit(item.id)"
              class="p-4 rounded-2xl border transition-all cursor-pointer select-none relative overflow-hidden flex flex-col justify-between space-y-3"
              [ngClass]="{
                'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30': isSelected(item.id),
                'bg-stone-900/60 border-stone-800 hover:border-stone-700': !isSelected(item.id)
              }"
            >
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold px-2 py-0.5 rounded"
                    [ngClass]="{
                      'bg-emerald-500/20 text-emerald-300': isSelected(item.id),
                      'bg-stone-800 text-stone-400': !isSelected(item.id)
                    }"
                  >
                    {{ item.category.replace(/_/g, ' ') }}
                  </span>
                  <span class="font-mono text-xs font-bold" [ngClass]="isSelected(item.id) ? 'text-emerald-400' : 'text-stone-400'">
                    -{{ item.co2SavingsKgPerYear }} kg CO₂
                  </span>
                </div>

                <h3 class="text-sm font-bold text-white flex items-center gap-2">
                  <span>{{ isSelected(item.id) ? '✅' : '⚪' }}</span>
                  <span>{{ item.title }}</span>
                </h3>

                <p class="text-xs text-stone-300 leading-relaxed">
                  {{ item.description }}
                </p>
              </div>

              <!-- Clinical Co-Benefit Callout -->
              <div class="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-teal-300 space-y-1">
                <div><strong>🏥 Clinical Co-Benefit:</strong> {{ item.healthCoBenefit }}</div>
                <div class="text-stone-400 text-[10px]"><strong>Action:</strong> {{ item.actionableStep }}</div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Educational Evidence Footer -->
      <div class="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-stone-400">
        <div class="flex items-center gap-2">
          <span>📚 Grounded in Oxford CEBM Level 1 &amp; EAT-Lancet Commission 2026 Guidelines</span>
        </div>
        <button 
          (click)="selectAll()" 
          class="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition text-xs font-bold cursor-pointer"
        >
          Select All Active Eco Habits
        </button>
      </div>
    </div>
  `,
})
export class PlanetaryHealthHudComponent {
  private greenService = inject(GreenComputingSustainabilityService);

  recommendations = this.greenService.ecoRecommendations;

  // Selected habits state tracking
  selectedHabitIds = signal<Set<string>>(new Set(['eco_1', 'eco_2', 'eco_3', 'eco_4', 'eco_5', 'eco_6']));

  isSelected(id: string): boolean {
    return this.selectedHabitIds().has(id);
  }

  toggleHabit(id: string): void {
    const current = new Set(this.selectedHabitIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedHabitIds.set(current);
  }

  selectAll(): void {
    const allIds = new Set(this.recommendations().map((r) => r.id));
    this.selectedHabitIds.set(allIds);
  }

  totalCount = computed(() => this.recommendations().length);
  selectedCount = computed(() => this.selectedHabitIds().size);

  activeCo2SavingsKg = computed(() => {
    const active = this.recommendations().filter((r) => this.selectedHabitIds().has(r.id));
    const total = active.reduce((sum, r) => sum + r.co2SavingsKgPerYear, 0);
    return Math.round(total * 10) / 10;
  });

  sustainabilityScore = computed(() => {
    const totalPossible = this.recommendations().reduce((sum, r) => sum + r.co2SavingsKgPerYear, 0);
    if (totalPossible === 0) return 0;
    return Math.round((this.activeCo2SavingsKg() / totalPossible) * 100);
  });

  activeTier = computed(() => {
    const score = this.sustainabilityScore();
    if (score >= 80) return '🏆 ECO LEADER';
    if (score >= 50) return '🌱 SUSTAINABLE';
    if (score >= 25) return '⚡ MODERATE IMPACT';
    return '⚠️ LOW ECO ADOPTION';
  });
}
