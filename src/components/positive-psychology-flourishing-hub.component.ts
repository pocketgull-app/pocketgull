import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PositivePsychologyService, IAbcdeReframe, IThreeGoodThingsEntry, IPermaDimension } from '../services/positive-psychology.service';

@Component({
  selector: 'app-positive-psychology-flourishing-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-zinc-950 rounded-3xl border border-amber-500/30 shadow-2xl font-mono text-xs text-zinc-100 relative overflow-hidden">
      
      <!-- Top Decorative Aura -->
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 mb-6 border-b border-amber-500/20 relative z-10">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="text-2xl p-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-md">🌸</span>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base font-black text-amber-200 uppercase tracking-wider">
                  Martin Seligman Positive Psychology &amp; Human Flourishing Suite
                </h2>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  PERMA-V • VIA • ABCDE
                </span>
              </div>
              <p class="text-[11px] text-zinc-400 mt-0.5">
                Evidence-based positive psychology architecture: Asset-based clinical scaffolding, Learned Optimism reframing &amp; Snyder Hope pathways.
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4 bg-zinc-900/90 px-4 py-2.5 rounded-2xl border border-amber-500/30">
          <div class="text-right">
            <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Flourishing Index</div>
            <div class="text-xl font-black text-amber-300 font-mono">{{ posPsych.flourishingIndex() }}/100</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg text-amber-300 shadow-inner">
            ✨
          </div>
        </div>
      </div>

      <!-- Navigation Tabs for Positive Psychology Sub-Modules -->
      <div class="flex flex-wrap items-center gap-2 mb-6 border-b border-zinc-800 pb-3 relative z-10">
        <button type="button" (click)="activeTab.set('perma')"
          [class.bg-amber-500]="activeTab() === 'perma'"
          [class.text-zinc-950]="activeTab() === 'perma'"
          [class.bg-zinc-900]="activeTab() !== 'perma'"
          [class.text-zinc-300]="activeTab() !== 'perma'"
          class="px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5 border border-zinc-800">
          <span>📊</span>
          <span>1. PERMA-V Radar</span>
        </button>

        <button type="button" (click)="activeTab.set('abcde')"
          [class.bg-amber-500]="activeTab() === 'abcde'"
          [class.text-zinc-950]="activeTab() === 'abcde'"
          [class.bg-zinc-900]="activeTab() !== 'abcde'"
          [class.text-zinc-300]="activeTab() !== 'abcde'"
          class="px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5 border border-zinc-800">
          <span>🧠</span>
          <span>2. ABCDE Learned Optimism</span>
        </button>

        <button type="button" (click)="activeTab.set('via')"
          [class.bg-amber-500]="activeTab() === 'via'"
          [class.text-zinc-950]="activeTab() === 'via'"
          [class.bg-zinc-900]="activeTab() !== 'via'"
          [class.text-zinc-300]="activeTab() !== 'via'"
          class="px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5 border border-zinc-800">
          <span>💎</span>
          <span>3. VIA Character Strengths</span>
        </button>

        <button type="button" (click)="activeTab.set('gratitude')"
          [class.bg-amber-500]="activeTab() === 'gratitude'"
          [class.text-zinc-950]="activeTab() === 'gratitude'"
          [class.bg-zinc-900]="activeTab() !== 'gratitude'"
          [class.text-zinc-300]="activeTab() !== 'gratitude'"
          class="px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5 border border-zinc-800">
          <span>☀️</span>
          <span>4. Three Good Things (RCT)</span>
        </button>

        <button type="button" (click)="activeTab.set('hope')"
          [class.bg-amber-500]="activeTab() === 'hope'"
          [class.text-zinc-950]="activeTab() === 'hope'"
          [class.bg-zinc-900]="activeTab() !== 'hope'"
          [class.text-zinc-300]="activeTab() !== 'hope'"
          class="px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5 border border-zinc-800">
          <span>🧭</span>
          <span>5. Snyder Hope Pathways</span>
        </button>
      </div>

      <!-- TAB 1: PERMA-V RADAR & 6-DIMENSION SCORE CARDS -->
      @if (activeTab() === 'perma') {
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (dim of posPsych.permaDimensions(); track dim.key) {
              <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-lg">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-bold text-amber-300 flex items-center gap-1.5">
                      <span>{{ dim.icon }}</span>
                      <span>{{ dim.name }}</span>
                    </span>
                    <div class="flex items-center gap-1">
                      <button (click)="posPsych.updateDimensionScore(dim.key, -0.5)" class="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-xs">-</button>
                      <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold font-mono text-[11px]">{{ dim.score.toFixed(1) }}/10</span>
                      <button (click)="posPsych.updateDimensionScore(dim.key, 0.5)" class="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-xs">+</button>
                    </div>
                  </div>

                  <!-- Progress Bar -->
                  <div class="w-full bg-zinc-800 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div class="h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-emerald-400" [style.width.%]="dim.score * 10"></div>
                  </div>

                  <p class="text-[11px] text-zinc-300 mb-2 leading-relaxed">{{ dim.description }}</p>
                  
                  <div class="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 mb-2 text-[10px] text-amber-300/90 font-mono">
                    <span class="font-bold text-amber-400">📚 Evidence:</span> {{ dim.evidenceBase }}
                  </div>
                </div>

                <div class="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px]">
                  <span class="text-zinc-400 font-bold">🎯 Micro-Habit:</span>
                  <span class="text-emerald-400 font-semibold">{{ dim.clinicalScaffoldTip }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 2: SELIGMAN ABCDE LEARNED OPTIMISM COGNITIVE REFRAMING STUDIO -->
      @if (activeTab() === 'abcde') {
        <div class="space-y-4">
          <!-- Preset Selector -->
          <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 class="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🧠</span>
                <span>Select Clinical Adversity Event to Reframe:</span>
              </h3>
              <p class="text-[11px] text-zinc-400 mt-0.5">
                Seligman Explanatory Style Disputation: Transforming catastrophic thinking into temporary, specific, and empowered agency.
              </p>
            </div>

            <div class="flex flex-wrap gap-1.5">
              @for (item of posPsych.abcdeLibrary(); track item.id) {
                <button type="button" (click)="selectedAbcdeId.set(item.id)"
                  [class.bg-amber-600]="selectedAbcdeId() === item.id"
                  [class.text-white]="selectedAbcdeId() === item.id"
                  [class.bg-zinc-800]="selectedAbcdeId() !== item.id"
                  [class.text-zinc-300]="selectedAbcdeId() !== item.id"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition hover:bg-zinc-700 cursor-pointer">
                  {{ item.category }}
                </button>
              }
            </div>
          </div>

          <!-- Active ABCDE Transformation Deck -->
          @if (activeAbcde(); as reframe) {
            <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
              <!-- A: Adversity -->
              <div class="p-4 rounded-2xl bg-zinc-900/90 border border-red-500/30 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-1.5 text-red-400 font-bold mb-1.5">
                    <span class="text-sm">⚡</span>
                    <span class="uppercase font-black text-[11px]">A • Adversity</span>
                  </div>
                  <p class="text-[11px] text-zinc-200 leading-relaxed font-medium">"{{ reframe.adversity }}"</p>
                </div>
                <span class="text-[10px] text-zinc-500 mt-3 block">Objective Trigger Event</span>
              </div>

              <!-- B: Belief -->
              <div class="p-4 rounded-2xl bg-zinc-900/90 border border-orange-500/30 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-1.5 text-orange-400 font-bold mb-1.5">
                    <span class="text-sm">🌪️</span>
                    <span class="uppercase font-black text-[11px]">B • Belief</span>
                  </div>
                  <p class="text-[11px] text-zinc-300 leading-relaxed italic">"{{ reframe.pessimisticBelief }}"</p>
                </div>
                <span class="text-[10px] text-zinc-500 mt-3 block">Automatic Negative Thought</span>
              </div>

              <!-- C: Consequence -->
              <div class="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-1.5 text-amber-400 font-bold mb-1.5">
                    <span class="text-sm">📉</span>
                    <span class="uppercase font-black text-[11px]">C • Consequence</span>
                  </div>
                  <p class="text-[11px] text-zinc-300 leading-relaxed">{{ reframe.consequence }}</p>
                </div>
                <span class="text-[10px] text-zinc-500 mt-3 block">Autonomic Stress Cascade</span>
              </div>

              <!-- D: Disputation -->
              <div class="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/40 flex flex-col justify-between md:col-span-1 shadow-md">
                <div>
                  <div class="flex items-center gap-1.5 text-emerald-400 font-bold mb-1.5">
                    <span class="text-sm">🛡️</span>
                    <span class="uppercase font-black text-[11px]">D • Disputation</span>
                  </div>
                  <div class="space-y-1.5 text-[10px]">
                    <p class="text-emerald-300"><strong class="text-emerald-400">⏱️ Permanence:</strong> {{ reframe.disputation.permanence }}</p>
                    <p class="text-emerald-300"><strong class="text-emerald-400">🎯 Pervasiveness:</strong> {{ reframe.disputation.pervasiveness }}</p>
                    <p class="text-emerald-300"><strong class="text-emerald-400">✨ Personalization:</strong> {{ reframe.disputation.personalization }}</p>
                  </div>
                </div>
                <span class="text-[10px] text-emerald-500 font-bold mt-2 block">Popperian Empirical Challenge</span>
              </div>

              <!-- E: Energization -->
              <div class="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-zinc-900 to-teal-950/80 border border-emerald-400/50 flex flex-col justify-between shadow-lg">
                <div>
                  <div class="flex items-center gap-1.5 text-teal-300 font-bold mb-1.5">
                    <span class="text-sm">🚀</span>
                    <span class="uppercase font-black text-[11px]">E • Energization</span>
                  </div>
                  <p class="text-[11px] text-teal-100 leading-relaxed font-bold">{{ reframe.energizationAction }}</p>
                </div>
                <div class="mt-3 pt-2 border-t border-teal-500/30 flex items-center justify-between text-[10px] text-teal-300">
                  <span>Dopamine Restored</span>
                  <span class="font-bold">✓ Actionable Agency</span>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- TAB 3: VIA CHARACTER STRENGTHS SIGNATURE ACTIVATION MATRIX -->
      @if (activeTab() === 'via') {
        <div class="space-y-4">
          <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <h3 class="text-xs font-black text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>💎</span>
              <span>VIA 24 Character Strengths • Select 3–5 Signature Strengths</span>
            </h3>
            <p class="text-[11px] text-zinc-400 mb-3">
              Peterson &amp; Seligman (2004): Aligning medical adherence with signature strengths elevates intrinsic motivation and eliminates scolding friction.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              @for (strength of posPsych.viaStrengthsCatalog(); track strength.id) {
                <div (click)="posPsych.toggleSignatureStrength(strength.id)"
                  [class.border-amber-400]="posPsych.selectedSignatureStrengthIds().includes(strength.id)"
                  [class.bg-amber-950/30]="posPsych.selectedSignatureStrengthIds().includes(strength.id)"
                  [class.border-zinc-800]="!posPsych.selectedSignatureStrengthIds().includes(strength.id)"
                  [class.bg-zinc-900/60]="!posPsych.selectedSignatureStrengthIds().includes(strength.id)"
                  class="p-3 rounded-xl border transition-all cursor-pointer hover:border-amber-500/60 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-bold text-amber-200 flex items-center gap-1 text-[11px]">
                        <span>{{ strength.icon }}</span>
                        <span>{{ strength.name }}</span>
                      </span>
                      <span class="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold"
                        [class.bg-amber-500]="posPsych.selectedSignatureStrengthIds().includes(strength.id)"
                        [class.text-zinc-950]="posPsych.selectedSignatureStrengthIds().includes(strength.id)"
                        [class.bg-zinc-800]="!posPsych.selectedSignatureStrengthIds().includes(strength.id)"
                        [class.text-zinc-400]="!posPsych.selectedSignatureStrengthIds().includes(strength.id)">
                        {{ posPsych.selectedSignatureStrengthIds().includes(strength.id) ? 'ACTIVE' : strength.virtue }}
                      </span>
                    </div>
                    <p class="text-[10px] text-zinc-400 leading-tight mb-2">{{ strength.description }}</p>
                  </div>

                  <div class="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[10px] text-emerald-300">
                    <strong class="text-amber-300">Care Strategy:</strong> {{ strength.suggestedHealthMicroHabit }}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- TAB 4: THREE GOOD THINGS LEDGER (SELIGMAN 2005 RCT) -->
      @if (activeTab() === 'gratitude') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Logging Form -->
          <div class="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30 space-y-3">
            <h3 class="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>☀️</span>
              <span>Three Good Things • Daily Savoring Journal</span>
            </h3>
            <p class="text-[11px] text-zinc-400 leading-relaxed">
              Seligman et al. (2005): Recording 3 good things and their causal attribution daily reduces depressive symptoms and elevates positive affect for 6 months.
            </p>

            <div class="space-y-2.5">
              <div>
                <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">What went well today?</label>
                <textarea [(ngModel)]="newGratitudeEvent" rows="2" placeholder="e.g., Prepared a fresh Mediterranean vegetable salad with olive oil..."
                  class="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-400"></textarea>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Why did this go well? (Causal Attribution)</label>
                <textarea [(ngModel)]="newGratitudeWhy" rows="2" placeholder="e.g., I tapped into my strength of Self-Regulation and pre-cut vegetables yesterday..."
                  class="w-full p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs outline-none focus:border-amber-400"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">PERMA Pillar</label>
                  <select [(ngModel)]="newGratitudeDimension" class="w-full p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs">
                    <option value="Positive Emotion">Positive Emotion</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Relationships">Relationships</option>
                    <option value="Meaning">Meaning</option>
                    <option value="Accomplishment">Accomplishment</option>
                    <option value="Vitality">Vitality</option>
                  </select>
                </div>

                <div>
                  <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">VIA Strength</label>
                  <input [(ngModel)]="newGratitudeStrength" placeholder="e.g., Curiosity, Gratitude"
                    class="w-full p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs" />
                </div>
              </div>
            </div>

            <button type="button" (click)="addGratitudeEntry()" [disabled]="!newGratitudeEvent.trim() || !newGratitudeWhy.trim()"
              class="w-full py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-zinc-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50 cursor-pointer">
              ✨ Record Positive Micro-Joy Entry
            </button>
          </div>

          <!-- Log Feed -->
          <div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-3">
            <div>
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📖</span>
                  <span>Flourishing Reflection Stream</span>
                </h3>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  {{ posPsych.threeGoodThingsLogs().length }} Entries
                </span>
              </div>

              <div class="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                @for (log of posPsych.threeGoodThingsLogs(); track log.id) {
                  <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs">
                    <div class="flex justify-between items-center mb-1 text-[10px]">
                      <span class="font-bold text-amber-400">● {{ log.permaDimension }}</span>
                      <span class="text-zinc-500">{{ log.timestamp }}</span>
                    </div>
                    <p class="text-zinc-100 font-semibold mb-1">"{{ log.eventDescription }}"</p>
                    <p class="text-[11px] text-emerald-300/90 italic"><strong class="text-zinc-400 font-normal">Why:</strong> {{ log.whyItWentWell }}</p>
                    <div class="mt-1.5 pt-1.5 border-t border-zinc-900 flex justify-between items-center text-[9px] text-zinc-500">
                      <span>VIA: {{ log.associatedViaStrength }}</span>
                      <span class="text-teal-400 font-bold">Dopamine/Oxytocin Boost Active</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
              <span>Biochemical Effect:</span>
              <span class="text-emerald-400 font-bold">Blunts Cortisol by ~22%</span>
            </div>
          </div>
        </div>
      }

      <!-- TAB 5: SNYDER HOPE PATHWAYS CHOICE ARCHITECTURE -->
      @if (activeTab() === 'hope') {
        <div class="space-y-4">
          <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 border-b border-zinc-800 pb-3">
              <div>
                <h3 class="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🧭</span>
                  <span>Snyder Hope Theory: {{ posPsych.hopePathway().goalTitle }}</span>
                </h3>
                <p class="text-[11px] text-zinc-400 mt-0.5">
                  Hope = Agency Thinking (Willpower: {{ posPsych.hopePathway().agencyScore }}%) × Pathways Thinking (Waypower: {{ posPsych.hopePathway().pathwayScore }}%).
                </p>
              </div>

              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-xs">
                  Composite Hope: {{ posPsych.hopePathway().compositeHopeIndex }}/100
                </span>
              </div>
            </div>

            <!-- 3 Multi-Pathway Options -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              @for (path of posPsych.hopePathway().pathways; track path.id) {
                <div class="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between shadow-lg">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-bold text-amber-300 text-xs">{{ path.title }}</span>
                      <span class="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-bold uppercase">{{ path.routeType }}</span>
                    </div>
                    <p class="text-[11px] text-zinc-200 leading-relaxed font-medium mb-3">{{ path.actionPlan }}</p>
                  </div>

                  <div class="pt-2 border-t border-zinc-900 flex flex-col gap-1 text-[10px]">
                    <div class="flex justify-between text-zinc-400">
                      <span>Friction Level:</span>
                      <span class="text-emerald-400 font-bold">{{ path.frictionLevel }}</span>
                    </div>
                    <p class="text-teal-300 font-medium">{{ path.estimatedAutonomicBenefit }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class PositivePsychologyFlourishingHubComponent {
  protected readonly posPsych = inject(PositivePsychologyService);

  activeTab = signal<'perma' | 'abcde' | 'via' | 'gratitude' | 'hope'>('perma');
  selectedAbcdeId = signal<string>('abcde_glycemic_spike');

  newGratitudeEvent = '';
  newGratitudeWhy = '';
  newGratitudeDimension: IThreeGoodThingsEntry['permaDimension'] = 'Positive Emotion';
  newGratitudeStrength = 'Gratitude';

  readonly activeAbcde = () => {
    const id = this.selectedAbcdeId();
    return this.posPsych.abcdeLibrary().find(item => item.id === id) || this.posPsych.abcdeLibrary()[0];
  };

  addGratitudeEntry(): void {
    if (!this.newGratitudeEvent.trim() || !this.newGratitudeWhy.trim()) return;
    this.posPsych.addThreeGoodThingsLog(
      this.newGratitudeEvent,
      this.newGratitudeWhy,
      this.newGratitudeDimension,
      this.newGratitudeStrength
    );
    this.newGratitudeEvent = '';
    this.newGratitudeWhy = '';
  }
}
