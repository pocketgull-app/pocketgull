import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TcmAyurvedicIntegrativeService, DoshaType } from '../../services/tcm-ayurvedic-integrative.service';

@Component({
  selector: 'app-tcm-ayurvedic-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-amber-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-extrabold text-xl">
            🌿
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2">
              TCM & Ayurvedic Integrative Engine
              <span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-mono font-bold">
                Shi Liao & Ahara
              </span>
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Constitutional food therapy, reproductive convalescence (Zuo Yue Zi / Sutika Paricharya), and high-stakes herb-drug interaction screening.
            </p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-zinc-800/80 rounded-xl text-xs font-bold">
          <button
            type="button"
            (click)="activeTab.set('food')"
            [class.bg-white]="activeTab() === 'food'"
            [class.dark:bg-zinc-700]="activeTab() === 'food'"
            [class.shadow-sm]="activeTab() === 'food'"
            class="px-3 py-1.5 rounded-lg transition-all text-gray-700 dark:text-zinc-200"
          >
            🍲 Food Therapy
          </button>
          <button
            type="button"
            (click)="activeTab.set('repro')"
            [class.bg-white]="activeTab() === 'repro'"
            [class.dark:bg-zinc-700]="activeTab() === 'repro'"
            [class.shadow-sm]="activeTab() === 'repro'"
            class="px-3 py-1.5 rounded-lg transition-all text-gray-700 dark:text-zinc-200"
          >
            🌸 Reproductive & Postpartum
          </button>
          <button
            type="button"
            (click)="activeTab.set('safety')"
            [class.bg-white]="activeTab() === 'safety'"
            [class.dark:bg-zinc-700]="activeTab() === 'safety'"
            [class.shadow-sm]="activeTab() === 'safety'"
            class="px-3 py-1.5 rounded-lg transition-all text-gray-700 dark:text-zinc-200"
          >
            ⚠️ Safety & Interactions
          </button>
          <button
            type="button"
            (click)="activeTab.set('logistics')"
            [class.bg-white]="activeTab() === 'logistics'"
            [class.dark:bg-zinc-700]="activeTab() === 'logistics'"
            [class.shadow-sm]="activeTab() === 'logistics'"
            class="px-3 py-1.5 rounded-lg transition-all text-gray-700 dark:text-zinc-200"
          >
            🛒 Sourcing & Co-ops
          </button>
        </div>
      </div>

      <!-- Tab 1: Food Therapy (Shi Liao & Ahara) -->
      @if (activeTab() === 'food') {
        <div class="space-y-5">
          <!-- Pattern & Dosha Selectors -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
              <label class="block text-xs font-bold text-emerald-800 dark:text-emerald-300">
                TCM Pattern Differentiation (辨证):
              </label>
              <select
                [value]="tcmService.selectedTcmPattern()"
                (change)="onPatternChange($event)"
                class="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 font-medium"
              >
                <option value="Spleen Qi Deficiency with Dampness">Spleen Qi Deficiency with Dampness (Fatigue, congee indicated)</option>
                <option value="Liver Qi Stagnation">Liver Qi Stagnation (Emotional tension, citrus peel indicated)</option>
                <option value="Kidney Yin Deficiency">Kidney Yin Deficiency (Night sweats, goji berries indicated)</option>
              </select>
            </div>

            <div class="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
              <label class="block text-xs font-bold text-amber-800 dark:text-amber-300">
                Ayurvedic Prakriti / Vikriti (Dosha):
              </label>
              <select
                [value]="tcmService.selectedAyurvedicDosha()"
                (change)="onDoshaChange($event)"
                class="w-full text-xs p-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 font-medium"
              >
                <option value="Vata">Vata (Air/Ether - Warm unctuous stews, ghee)</option>
                <option value="Pitta">Pitta (Fire/Water - Cooling cilantro, coconut, mung dal)</option>
                <option value="Kapha">Kapha (Earth/Water - Warming spices, dry grains, ginger)</option>
                <option value="Vata-Pitta">Vata-Pitta (Biphasic seasonal adjustments)</option>
                <option value="Tridoshic">Tridoshic (Balanced Kitchari & CCF tea)</option>
              </select>
            </div>
          </div>

          <!-- TCM Recommendations -->
          <div class="space-y-3">
            <h4 class="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <span>🥢</span> TCM Thermal Food Therapy (食疗 - Shi Liao):
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              @for (food of tcmService.recommendedTcmFoods(); track food.id) {
                <div class="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1.5">
                  <div class="flex justify-between items-start">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ food.name }}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                      {{ food.thermalNature }}
                    </span>
                  </div>
                  <div class="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                    {{ food.chineseCharacters }} ({{ food.chinesePinyin }})
                  </div>
                  <p class="text-gray-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                    {{ food.clinicalActions }}
                  </p>
                  <div class="text-[10px] text-gray-500 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-800 pt-1">
                    🛒 Aisle: {{ food.groceryAisle }}
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Ayurvedic Recommendations -->
          <div class="space-y-3">
            <h4 class="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
              <span>🪔</span> Ayurvedic Ahara & Agni Reset (आहार):
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              @for (food of tcmService.recommendedAyurvedicFoods(); track food.id) {
                <div class="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5">
                  <div class="flex justify-between items-start">
                    <span class="font-bold text-gray-900 dark:text-gray-100">{{ food.name }}</span>
                    <span class="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                      {{ food.sanskritName }}
                    </span>
                  </div>
                  <p class="text-gray-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                    {{ food.clinicalBenefits }}
                  </p>
                  <div class="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-800 pt-1">
                    <span>⚡ Virya: {{ food.digestiveEffect }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Tab 2: Reproductive & Postpartum -->
      @if (activeTab() === 'repro') {
        <div class="space-y-4">
          <p class="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
            Evidence-grounded postpartum and post-procedure convalescent traditions. Integrates centuries of cultural comfort with biomedical safety red flags.
          </p>

          <div class="grid grid-cols-1 gap-4">
            @for (proto of tcmService.reproductiveProtocols; track proto.protocolTitle) {
              <div class="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-2.5 text-xs">
                <div class="flex flex-wrap justify-between items-center gap-2">
                  <h4 class="font-bold text-purple-900 dark:text-purple-300 text-sm">
                    {{ proto.protocolTitle }}
                  </h4>
                  <span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-800 dark:text-purple-300 font-mono text-[10px] font-bold">
                    {{ proto.tradition }} | {{ proto.culturalTerm }}
                  </span>
                </div>

                <div class="space-y-1.5 text-[11px] text-gray-700 dark:text-zinc-300">
                  <div class="font-bold text-gray-800 dark:text-zinc-200">Core Interventions:</div>
                  <ul class="list-disc pl-4 space-y-0.5">
                    @for (item of proto.coreInterventions; track item) {
                      <li>{{ item }}</li>
                    }
                  </ul>
                </div>

                <div class="space-y-1.5 text-[11px] text-gray-700 dark:text-zinc-300">
                  <div class="font-bold text-gray-800 dark:text-zinc-200">Nourishing Convalescent Foods:</div>
                  <ul class="list-disc pl-4 space-y-0.5 text-emerald-700 dark:text-emerald-400">
                    @for (food of proto.safeNourishingFoods; track food) {
                      <li>{{ food }}</li>
                    }
                  </ul>
                </div>

                <div class="space-y-1 text-[11px] text-gray-700 dark:text-zinc-300">
                  <div class="font-bold text-gray-800 dark:text-zinc-200">Acupressure & Marma Points:</div>
                  <div class="flex flex-wrap gap-1.5">
                    @for (point of proto.acupressureOrMarmaPoints; track point) {
                      <span class="px-2 py-0.5 bg-gray-200 dark:bg-zinc-800 rounded text-[10px] font-mono">
                        {{ point }}
                      </span>
                    }
                  </div>
                </div>

                <div class="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-[10px] text-red-700 dark:text-red-300 font-medium">
                  <strong>🚨 Biomedical Clinical Boundary:</strong> {{ proto.biomedicalSafetyBoundary }}
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab 3: Safety & Interactions -->
      @if (activeTab() === 'safety') {
        <div class="space-y-4">
          <div class="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-2 text-xs">
            <div class="font-bold text-blue-900 dark:text-blue-300">
              Active Patient Pharmacotherapy Screen:
            </div>
            <div class="flex flex-wrap gap-2">
              @for (rx of tcmService.activePatientPrescriptions(); track rx) {
                <span class="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-blue-400/40 rounded-full font-mono text-xs flex items-center gap-1.5">
                  💊 {{ rx }}
                  <button type="button" (click)="tcmService.removePrescription(rx)" class="hover:text-red-500 text-gray-400">×</button>
                </span>
              }
            </div>
          </div>

          <!-- Interaction Alerts -->
          <div class="space-y-3">
            <h4 class="text-xs font-black uppercase tracking-wider text-red-700 dark:text-red-400">
              Detected Botanical-Drug Interactions:
            </h4>
            @if (tcmService.activeInteractions().length > 0) {
              <div class="space-y-3">
                @for (alert of tcmService.activeInteractions(); track alert.herbName) {
                  <div class="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 text-xs">
                    <div class="flex justify-between items-center">
                      <span class="font-bold text-red-900 dark:text-red-300 text-sm">{{ alert.herbName }}</span>
                      <span class="px-2 py-0.5 bg-red-600 text-white rounded font-mono text-[10px] font-bold">
                        {{ alert.severity }}
                      </span>
                    </div>
                    <div class="text-[11px] text-gray-700 dark:text-zinc-300">
                      <strong>Conflict:</strong> {{ alert.contraindicatedDrugClass }}
                    </div>
                    <p class="text-[11px] text-red-800 dark:text-red-300">
                      <strong>Mechanism:</strong> {{ alert.mechanism }}
                    </p>
                    <div class="text-[10px] text-gray-600 dark:text-zinc-400 border-t border-red-200 dark:border-red-900/40 pt-1.5">
                      <strong>Safe Alternative:</strong> {{ alert.safeAlternative }}
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                ✅ Zero severe botanical interactions detected with current prescription list.
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab 4: Logistics & Sourcing -->
      @if (activeTab() === 'logistics') {
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              Community Clinics & Verified Co-Ops:
            </h4>
            <button
              type="button"
              (click)="printManifest()"
              class="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              📄 Export Bilingual Shopping Manifest
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            @for (hub of tcmService.communityHubs; track hub.name) {
              <div class="p-3.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl space-y-1.5">
                <div class="flex justify-between items-start">
                  <span class="font-bold text-gray-900 dark:text-gray-100">{{ hub.name }}</span>
                  <span class="px-2 py-0.5 bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded font-mono text-[9px] font-bold">
                    {{ hub.category }}
                  </span>
                </div>
                <p class="text-gray-600 dark:text-zinc-400 text-[11px]">
                  {{ hub.description }}
                </p>
                <div class="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                  💵 {{ hub.slidingScaleFee }}
                </div>
                <div class="text-[9px] text-gray-500 dark:text-zinc-500">
                  🛡️ {{ hub.verificationBadge }}
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class TcmAyurvedicCardComponent {
  readonly tcmService = inject(TcmAyurvedicIntegrativeService);
  readonly activeTab = signal<'food' | 'repro' | 'safety' | 'logistics'>('food');

  onPatternChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.tcmService.setTcmPattern(val);
  }

  onDoshaChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as DoshaType;
    this.tcmService.setAyurvedicDosha(val);
  }

  printManifest(): void {
    const list = this.tcmService.generateBilingualShoppingManifest();
    const formatted = list.map(item => `• ${item.english} [${item.traditionalOrSanskrit}] - ${item.aisle}`).join('\n');
    alert(`Bilingual Grocery Manifest for Asian & Indian Grocers:\n\n${formatted}`);
  }
}
