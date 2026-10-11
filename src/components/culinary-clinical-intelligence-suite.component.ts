import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContinuousMetabolicAutonomicService } from '../services/continuous-metabolic-autonomic.service';
import { KitchenVoiceAlchemistService } from '../services/kitchen-voice-alchemist.service';
import { DrugNutrientInteractionGuardService } from '../services/drug-nutrient-interaction-guard.service';
import { FamilyRecipeHeritageVaultService, IFamilyHeritageRecipe } from '../services/family-recipe-heritage-vault.service';
import { LocalFoodshedOnlineMenuService } from '../services/local-foodshed-online-menu.service';

@Component({
  selector: 'app-culinary-clinical-intelligence-suite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl p-6 sm:p-8 space-y-6 font-sans relative overflow-hidden my-8">
      
      <!-- Ambient Visual Glow -->
      <div class="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

      <!-- Header Banner -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-6 relative z-10">
        <div>
          <div class="flex items-center gap-2.5 mb-2 flex-wrap">
            <span class="w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)] animate-pulse"></span>
            <span class="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono text-[10.5px] font-bold uppercase tracking-wider">
              Culinary Medicine &amp; Metabolic Intelligence Suite
            </span>
            <span class="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px]">
              5-Pillar Clinical Architecture
            </span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
            CGM Telemetry, Voice Companion, Pantry Alchemist, CYP450 Guard &amp; FHIR Vault
          </h2>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
            Integrates continuous glucose and sleep autonomics with hands-free voice cooking guidance, cupboard pantry formulations, drug-herb safety screens, and FHIR R4 nutrition care plans.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 text-right font-mono">
            <span class="text-[10px] text-zinc-400 uppercase block">Real-Time CGM:</span>
            <span class="text-base font-bold text-teal-300">
              {{ cgmService.currentGlucose() }} mg/dL {{ cgmService.currentTrendArrow() }}
            </span>
          </div>
        </div>
      </div>

      <!-- 5-Pillar Tabs Navigation -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800/80 no-scrollbar font-mono text-xs">
        <button (click)="activeTab.set('cgm_autonomics')"
                [class.bg-teal-600]="activeTab() === 'cgm_autonomics'"
                [class.text-white]="activeTab() === 'cgm_autonomics'"
                [class.bg-zinc-900]="activeTab() !== 'cgm_autonomics'"
                [class.text-zinc-400]="activeTab() !== 'cgm_autonomics'"
                class="px-4 py-2.5 rounded-xl border border-zinc-800 font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px]">
          <span>📈</span>
          <span>1. CGM &amp; Autonomics</span>
        </button>

        <button (click)="activeTab.set('voice_companion')"
                [class.bg-teal-600]="activeTab() === 'voice_companion'"
                [class.text-white]="activeTab() === 'voice_companion'"
                [class.bg-zinc-900]="activeTab() !== 'voice_companion'"
                [class.text-zinc-400]="activeTab() !== 'voice_companion'"
                class="px-4 py-2.5 rounded-xl border border-zinc-800 font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px]">
          <span>🎙️</span>
          <span>2. Kitchen Voice Companion</span>
        </button>

        <button (click)="activeTab.set('pantry_alchemist')"
                [class.bg-teal-600]="activeTab() === 'pantry_alchemist'"
                [class.text-white]="activeTab() === 'pantry_alchemist'"
                [class.bg-zinc-900]="activeTab() !== 'pantry_alchemist'"
                [class.text-zinc-400]="activeTab() !== 'pantry_alchemist'"
                class="px-4 py-2.5 rounded-xl border border-zinc-800 font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px]">
          <span>🥘</span>
          <span>3. Pantry Alchemist</span>
        </button>

        <button (click)="activeTab.set('cyp450_guard')"
                [class.bg-rose-700]="activeTab() === 'cyp450_guard'"
                [class.text-white]="activeTab() === 'cyp450_guard'"
                [class.bg-zinc-900]="activeTab() !== 'cyp450_guard'"
                [class.text-zinc-400]="activeTab() !== 'cyp450_guard'"
                class="px-4 py-2.5 rounded-xl border border-zinc-800 font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px]">
          <span>💊</span>
          <span>4. Drug-Herb CYP450 Guard</span>
        </button>

        <button (click)="activeTab.set('heritage_vault')"
                [class.bg-amber-600]="activeTab() === 'heritage_vault'"
                [class.text-white]="activeTab() === 'heritage_vault'"
                [class.bg-zinc-900]="activeTab() !== 'heritage_vault'"
                [class.text-zinc-400]="activeTab() !== 'heritage_vault'"
                class="px-4 py-2.5 rounded-xl border border-zinc-800 font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px]">
          <span>📜</span>
          <span>5. Heritage Vault &amp; FHIR R4</span>
        </button>
      </div>

      <!-- TAB 1: CGM & WEARABLE AUTONOMICS -->
      @if (activeTab() === 'cgm_autonomics') {
        <div class="space-y-6 animate-in fade-in duration-200">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div class="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl">
              <span class="text-zinc-400 text-[10px] uppercase block">Time in Range (70-140):</span>
              <span class="text-base font-bold text-emerald-400">
                {{ cgmService.activeComparison().timeInRangePct }}% (Optimal)
              </span>
            </div>
            <div class="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl">
              <span class="text-zinc-400 text-[10px] uppercase block">Glycemic CV (Target ≤36%):</span>
              <span class="text-base font-bold text-teal-300">
                {{ cgmService.activeComparison().glycemicVariabilityCvPct }}%
              </span>
            </div>
            <div class="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl">
              <span class="text-zinc-400 text-[10px] uppercase block">Deep Slow-Wave Sleep:</span>
              <span class="text-base font-bold text-indigo-400">
                {{ cgmService.sleepAutonomicProfile().deepNremSlowWaveHours }}h ({{ cgmService.sleepAutonomicProfile().slowWaveSleepPct }}%)
              </span>
            </div>
            <div class="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl">
              <span class="text-zinc-400 text-[10px] uppercase block">Waking HRV (RMSSD):</span>
              <span class="text-base font-bold text-amber-300">
                {{ cgmService.sleepAutonomicProfile().hrvRmssdMs }} ms
              </span>
            </div>
          </div>

          <!-- Postprandial Glucose Curve Graph Comparison (SVG) -->
          <div class="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 class="text-sm font-bold text-white flex items-center gap-2">
                  <span>📉</span>
                  <span>Postprandial 120-Minute Trajectory: Predicted vs Actual CGM</span>
                </h4>
                <p class="text-xs text-zinc-400">
                  Meal: <strong class="text-teal-300">{{ cgmService.activeComparison().dishOrMealName }}</strong>
                </p>
              </div>
              <div class="flex items-center gap-4 text-xs font-mono">
                <span class="flex items-center gap-1.5 text-amber-400">
                  <span class="w-3 h-0.5 bg-amber-400 inline-block"></span> Predicted (Bergman Model)
                </span>
                <span class="flex items-center gap-1.5 text-teal-400">
                  <span class="w-3 h-0.5 bg-teal-400 inline-block"></span> Actual Continuous Telemetry
                </span>
              </div>
            </div>

            <!-- SVG Graph Container -->
            <div class="h-44 w-full bg-zinc-950 rounded-xl p-3 border border-zinc-800 flex items-center justify-center relative">
              <svg class="w-full h-full" viewBox="0 0 500 150">
                <!-- Grid Lines -->
                <line x1="40" y1="20" x2="480" y2="20" stroke="#27272a" stroke-dasharray="2" />
                <line x1="40" y1="60" x2="480" y2="60" stroke="#27272a" stroke-dasharray="2" />
                <line x1="40" y1="100" x2="480" y2="100" stroke="#27272a" stroke-dasharray="2" />
                <line x1="40" y1="130" x2="480" y2="130" stroke="#3f3f46" />

                <!-- Safe Range Zone (70 to 140 mg/dL) -->
                <rect x="40" y="25" width="440" height="95" fill="rgba(16, 185, 129, 0.05)" />

                <!-- Predicted Curve (Amber) -->
                <path d="M 40,115 C 100,105 130,55 180,45 C 230,52 300,75 360,95 C 420,110 450,115 480,118"
                      fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="4,2" />

                <!-- Actual Curve (Teal) -->
                <path d="M 40,117 C 100,108 130,59 180,48 C 230,56 300,78 360,98 C 420,112 450,117 480,119"
                      fill="none" stroke="#2dd4bf" stroke-width="3" />

                <!-- Axis Labels -->
                <text x="5" y="50" fill="#71717a" font-size="9" font-family="monospace">140</text>
                <text x="5" y="100" fill="#71717a" font-size="9" font-family="monospace">100</text>
                <text x="5" y="135" fill="#71717a" font-size="9" font-family="monospace">70</text>

                <text x="40" y="145" fill="#71717a" font-size="9" font-family="monospace">0m</text>
                <text x="175" y="145" fill="#71717a" font-size="9" font-family="monospace">45m (Peak)</text>
                <text x="350" y="145" fill="#71717a" font-size="9" font-family="monospace">90m</text>
                <text x="455" y="145" fill="#71717a" font-size="9" font-family="monospace">120m</text>
              </svg>
            </div>

            <p class="text-xs text-zinc-300 font-mono leading-relaxed bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              {{ cgmService.activeComparison().clinicalInterpretation }}
            </p>
          </div>

          <!-- Sleep Architecture & Glymphatic Correlation Banner -->
          <div class="p-4 bg-indigo-950/30 border border-indigo-800/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span class="text-indigo-300 font-bold block mb-0.5">🧠 Glymphatic AQP4 Convection Verification:</span>
              <p class="text-zinc-300">{{ cgmService.sleepAutonomicProfile().clinicalAutonomicCorrelation }}</p>
            </div>
            <button (click)="foodshed.simulateIn3dAnatomy('omega3_dha', 'Brain')"
                    class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer shrink-0">
              View Glymphatic 3D
            </button>
          </div>
        </div>
      }

      <!-- TAB 2: KITCHEN VOICE COMPANION -->
      @if (activeTab() === 'voice_companion') {
        <div class="space-y-6 animate-in fade-in duration-200">
          <!-- Voice Audio Coaching Banner -->
          <div class="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-xs font-semibold uppercase mb-2">
                <span>🎙️</span>
                <span>Hands-Free Culinary Scribe</span>
              </div>
              <h3 class="text-lg font-bold text-white">Full-Duplex Kitchen Audio Coach</h3>
              <p class="text-xs text-zinc-400 mt-1 max-w-xl">
                Keep your hands clean while kneading dough, peeling garlic, or braising. Ask clinical cooking questions and receive guidance spoken with 0.1 Hz soothing Mayer wave pacing.
              </p>
            </div>

            <!-- Speak / Listen Controls -->
            <div class="flex flex-col items-center gap-2 shrink-0">
              <button (click)="toggleVoiceListening()"
                      [class.bg-rose-600]="voiceService.isListening()"
                      [class.bg-teal-600]="!voiceService.isListening()"
                      class="px-6 py-3 rounded-2xl text-white font-mono font-bold text-sm shadow-xl transition active:scale-95 cursor-pointer flex items-center gap-2">
                <span>{{ voiceService.isListening() ? '⏹ Stop Listening' : '🎤 Hands-Free Voice Prompt' }}</span>
              </button>
              <span class="text-[10px] font-mono text-zinc-500">
                {{ voiceService.isSpeaking() ? 'Speaking...' : 'Listening Active' }}
              </span>
            </div>
          </div>

          <!-- Last Audio Transcript Card -->
          <div class="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl font-mono text-xs space-y-1">
            <span class="text-zinc-500 uppercase text-[9.5px] font-bold">Latest Companion Audio Response:</span>
            <p class="text-teal-300 italic">"{{ voiceService.lastSpokenTranscript() }}"</p>
          </div>

          <!-- Quick Question Prompts -->
          <div class="space-y-2">
            <span class="text-xs font-mono text-zinc-400 font-bold uppercase">Quick Kitchen Audio Queries:</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <button (click)="voiceService.answerKitchenQuestion('How do I prepare scallion roots for Cong Bai Tang?')"
                      class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-teal-500 text-left transition cursor-pointer text-zinc-300">
                🌿 "How do I prepare scallion roots for Cong Bai Tang?"
              </button>
              <button (click)="voiceService.answerKitchenQuestion('Why pair black pepper with turmeric?')"
                      class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-teal-500 text-left transition cursor-pointer text-zinc-300">
                🧂 "Why pair black pepper with turmeric?"
              </button>
              <button (click)="voiceService.answerKitchenQuestion('How does cooling rice create resistant starch?')"
                      class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-teal-500 text-left transition cursor-pointer text-zinc-300">
                🍚 "How does cooling rice create resistant starch?"
              </button>
              <button (click)="voiceService.answerKitchenQuestion('What is the healthiest substitute for commercial fryer oil?')"
                      class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-teal-500 text-left transition cursor-pointer text-zinc-300">
                🍳 "What is the best substitute for commercial fryer oil?"
              </button>
            </div>
          </div>
        </div>
      }

      <!-- TAB 3: PANTRY CUPBOARD ALCHEMIST -->
      @if (activeTab() === 'pantry_alchemist') {
        <div class="space-y-6 animate-in fade-in duration-200">
          <div class="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
            <label class="text-xs font-mono font-bold uppercase text-zinc-400 block">
              What Ingredients Do You Have on Hand Right Now?
            </label>
            <div class="flex flex-col sm:flex-row gap-3">
              <input type="text" [(ngModel)]="cupboardInput"
                     placeholder="e.g. Pasture Eggs, Black Beans, Onion, Garlic, Fresh Spinach, Olive Oil, Cumin"
                     class="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-xs font-mono text-zinc-100 focus:outline-none focus:border-teal-400 min-h-[44px]" />
              <button (click)="formulateRecipe()"
                      class="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-mono text-xs font-bold transition cursor-pointer shadow active:scale-95 shrink-0 min-h-[44px]">
                ✨ Formulate Ancestral Recipe
              </button>
            </div>
            <span class="text-[10px] font-mono text-zinc-500">
              The Alchemist balances the 6 Ayurvedic tastes (*Shad Rasa*) and applies biochemical synergies to maximize bioabsorption.
            </span>
          </div>

          <!-- Recipe Card Output -->
          <div class="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <span class="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-mono text-[10px] font-bold uppercase">
                  {{ voiceService.formulatedRecipe().culinaryTradition }}
                </span>
                <h3 class="text-lg font-bold text-white mt-1">{{ voiceService.formulatedRecipe().title }}</h3>
                <p class="text-xs text-zinc-400 font-mono">{{ voiceService.formulatedRecipe().culturalHeritage }}</p>
              </div>

              <div class="flex items-center gap-2">
                <span class="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-mono text-xs font-bold">
                  Glucose Spike: +{{ voiceService.formulatedRecipe().predictedGlucoseSpikeMgDl }} mg/dL
                </span>
                <button (click)="voiceService.simulateIn3d()"
                        class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95">
                  <span>🧬</span>
                  <span>Simulate in 3D</span>
                </button>
              </div>
            </div>

            <!-- Biochemical Synergies -->
            <div class="space-y-2">
              <span class="text-[10px] uppercase font-mono font-bold text-amber-400">Activated Biochemical Synergies:</span>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
                @for (syn of voiceService.formulatedRecipe().biochemicalSynergies; track syn.name) {
                  <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <strong class="text-teal-300 block mb-1">⚡ {{ syn.name }}</strong>
                    <p class="text-zinc-400 text-[11px] leading-relaxed">{{ syn.description }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Cooking Instructions -->
            <div class="space-y-2 pt-2">
              <span class="text-[10px] uppercase font-mono font-bold text-zinc-400">Step-by-Step Cooking Steps:</span>
              <ol class="space-y-1.5 text-xs text-zinc-300 font-mono pl-4 list-decimal">
                @for (step of voiceService.formulatedRecipe().stepByStepCookingGuide; track step) {
                  <li class="leading-relaxed">{{ step }}</li>
                }
              </ol>
            </div>
          </div>
        </div>
      }

      <!-- TAB 4: DRUG-NUTRIENT CYP450 GUARD -->
      @if (activeTab() === 'cyp450_guard') {
        <div class="space-y-6 animate-in fade-in duration-200">
          <div class="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 class="text-sm font-bold text-rose-200 flex items-center gap-2">
                <span>🛡️</span>
                <span>Active Prescription Medication &amp; Herbal CYP450 Interaction Screen</span>
              </h4>
              <p class="text-xs text-zinc-400 mt-1">
                Monitors hepatic cytochrome P450 (CYP3A4, CYP2C9, CYP1A2) and P-glycoprotein transport clearance to prevent adverse drug-nutrient events.
              </p>
            </div>
            <span class="px-3 py-1 rounded-xl bg-rose-900/60 border border-rose-500/50 text-rose-300 font-mono text-xs font-bold shrink-0">
              Overall Status: {{ drugGuard.highestSeverity() }}
            </span>
          </div>

          <!-- Active Medications Checked -->
          <div class="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-xs flex items-center gap-2 flex-wrap">
            <span class="text-zinc-400 font-bold uppercase text-[10px]">Patient Regimen Screened:</span>
            @for (m of drugGuard.activeMedications(); track m) {
              <span class="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200">
                💊 {{ m }}
              </span>
            }
          </div>

          <!-- Interactions Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (inter of drugGuard.interactionCatalog; track inter.id) {
              <div class="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 block">
                        {{ inter.metabolicPathway }} • {{ inter.medicationClass }}
                      </span>
                      <h4 class="text-base font-bold text-white mt-0.5">{{ inter.medicationName }}</h4>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0"
                          [class.bg-rose-950]="inter.severity.startsWith('Contraindicated')"
                          [class.text-rose-400]="inter.severity.startsWith('Contraindicated')"
                          [class.border-rose-700]="inter.severity.startsWith('Contraindicated')"
                          [class.bg-amber-950]="inter.severity.startsWith('Major')"
                          [class.text-amber-400]="inter.severity.startsWith('Major')">
                      {{ inter.severity }}
                    </span>
                  </div>

                  <div class="text-[11px] font-mono text-amber-300 mb-2">
                    Trigger Food/Herb: <strong class="text-white">{{ inter.foodOrHerbTrigger }}</strong>
                  </div>

                  <p class="text-xs text-zinc-300 leading-relaxed mb-3">
                    {{ inter.clinicalImpactSummary }}
                  </p>

                  <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400 mb-2">
                    <span class="font-bold text-emerald-400 block mb-0.5">Clinical Protocol:</span>
                    <span>{{ inter.actionableClinicalProtocol }}</span>
                  </div>
                </div>

                <div class="pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-400">
                  <span class="text-teal-400 font-bold">Safe Culinary Swap:</span> {{ inter.safeCulinaryAlternative }}
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 5: HERITAGE VAULT & FHIR R4 EXPORT -->
      @if (activeTab() === 'heritage_vault') {
        <div class="space-y-6 animate-in fade-in duration-200">
          <div class="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 class="text-base font-bold text-white flex items-center gap-2">
                <span>📜</span>
                <span>Personal &amp; Family Recipe Heritage Vault (HL7 FHIR R4 Bundle Standard)</span>
              </h4>
              <p class="text-xs text-zinc-400 mt-1">
                Digitize heirloom recipes, analyze their TCM thermal qualities and Ayurvedic doshas, apply gentle ancestral substrate upgrades, and export a certified FHIR R4 document.
              </p>
            </div>
            <button (click)="exportFhirBundle()"
                    class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow active:scale-95 shrink-0">
              <span>📥</span>
              <span>Export FHIR R4 Bundle (JSON)</span>
            </button>
          </div>

          <!-- Saved Recipes List -->
          <div class="space-y-5">
            @for (recipe of vaultService.savedRecipes(); track recipe.id) {
              <div class="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div>
                    <span class="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold uppercase">
                      {{ recipe.culturalTradition }} • {{ recipe.originGeneration }}
                    </span>
                    <h3 class="text-lg font-bold text-white mt-1">{{ recipe.recipeName }}</h3>
                    <div class="flex items-center gap-3 text-xs font-mono text-zinc-400 mt-1">
                      <span>TCM: <strong class="text-emerald-400">{{ recipe.tcmThermalNature }}</strong></span>
                      <span>Ayurveda: <strong class="text-purple-400">{{ recipe.ayurvedicDoshaBalance }}</strong></span>
                      <span>GL: <strong class="text-teal-400">{{ recipe.estimatedGlycemicLoad }}</strong></span>
                    </div>
                  </div>

                  <button (click)="vaultService.simulateIn3d(recipe)"
                          class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95 shrink-0">
                    <span>🧬</span>
                    <span>Simulate in 3D</span>
                  </button>
                </div>

                <!-- Substrate Upgrade Comparison -->
                <div class="space-y-2">
                  <span class="text-xs font-mono font-bold uppercase text-amber-300">
                    Ancestral Substrate Upgrades (Preserving Soul, Upgrading Health):
                  </span>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    @for (up of recipe.recommendedSubstrateUpgrades; track up.originalIngredient) {
                      <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                        <div class="text-rose-400 line-through text-[11px]">{{ up.originalIngredient }}</div>
                        <div class="text-emerald-400 font-bold text-xs">➔ {{ up.ancestralUpgrade }}</div>
                        <p class="text-zinc-400 text-[11px] leading-relaxed pt-1">{{ up.clinicalRationale }}</p>
                      </div>
                    }
                  </div>
                </div>

                <div class="text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-800/80">
                  <span class="text-zinc-300 font-bold">Preparation Notes:</span> {{ recipe.preparationNotes }}
                </div>
              </div>
            }
          </div>

          <!-- FHIR Export Success Toast / Message -->
          @if (fhirExportMessage()) {
            <div class="p-4 bg-emerald-950/80 border border-emerald-700/60 rounded-2xl font-mono text-xs text-emerald-300 flex items-center justify-between">
              <span>{{ fhirExportMessage() }}</span>
              <button (click)="fhirExportMessage.set(null)" class="text-zinc-400 hover:text-white text-xs">Dismiss</button>
            </div>
          }
        </div>
      }

    </div>
  `
})
export class CulinaryClinicalIntelligenceSuiteComponent {
  readonly cgmService = inject(ContinuousMetabolicAutonomicService);
  readonly voiceService = inject(KitchenVoiceAlchemistService);
  readonly drugGuard = inject(DrugNutrientInteractionGuardService);
  readonly vaultService = inject(FamilyRecipeHeritageVaultService);
  readonly foodshed = inject(LocalFoodshedOnlineMenuService);

  readonly activeTab = signal<'cgm_autonomics' | 'voice_companion' | 'pantry_alchemist' | 'cyp450_guard' | 'heritage_vault'>('cgm_autonomics');
  readonly cupboardInput = signal<string>('Pasture Eggs, Black Beans, Onion, Garlic, Fresh Spinach, Olive Oil, Cumin');
  readonly fhirExportMessage = signal<string | null>(null);

  toggleVoiceListening(): void {
    const next = !this.voiceService.isListening();
    this.voiceService.isListening.set(next);
    if (next) {
      this.voiceService.speakText('Listening for your kitchen questions. What are you cooking today?');
    }
  }

  formulateRecipe(): void {
    this.voiceService.generateAlchemistRecipe(this.cupboardInput());
  }

  exportFhirBundle(): void {
    const bundle = this.vaultService.generateFhirR4NutritionBundle();
    const jsonStr = JSON.stringify(bundle, null, 2);
    
    // Create download blob if browser
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FHIR-R4-Nutrition-Plan-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    this.fhirExportMessage.set(`Successfully generated official HL7 FHIR R4 Bundle (ID: ${bundle.id}) sealed with SHA-256: ${bundle.signatureSha256.substring(0, 16)}...`);
  }
}
