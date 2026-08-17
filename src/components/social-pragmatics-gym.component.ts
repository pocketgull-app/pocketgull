import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialPragmaticsGymService, SocialPersonaId, ISocialTelemetryReport } from '../services/social-pragmatics-gym.service';

@Component({
  selector: 'app-social-pragmatics-gym',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-sans overflow-y-auto"
         (click)="close.emit()">
      
      <!-- Modal Container -->
      <div class="w-full max-w-5xl bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <div class="flex items-center gap-3">
            <span class="text-3xl p-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">🤝</span>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
                  Social Pragmatics &amp; Empathetic Communication Gym
                </h2>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                  Zero-Stakes Rehearsal
                </span>
              </div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                Active-Constructive Responding • Non-Violent Communication (NVC) • Theory of Mind Inner Monologue Mirror
              </p>
            </div>
          </div>

          <button (click)="close.emit()"
            class="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer text-lg font-bold">
            ✕
          </button>
        </div>

        <!-- Persona Selection Bar -->
        <div class="flex items-center gap-2 px-6 sm:px-8 py-3 bg-zinc-100/60 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto shrink-0 font-mono text-xs">
          <span class="text-zinc-500 font-bold uppercase shrink-0">Persona:</span>
          @for (p of gymService.personas; track p.id) {
            <button (click)="selectPersona(p.id)"
              [class.bg-indigo-600]="gymService.activePersonaId() === p.id"
              [class.text-white]="gymService.activePersonaId() === p.id"
              [class.font-bold]="gymService.activePersonaId() === p.id"
              [class.bg-white]="gymService.activePersonaId() !== p.id"
              [class.dark:bg-zinc-800]="gymService.activePersonaId() !== p.id"
              [class.text-zinc-700]="gymService.activePersonaId() !== p.id"
              [class.dark:text-zinc-300]="gymService.activePersonaId() !== p.id"
              class="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 transition cursor-pointer flex items-center gap-1.5 shrink-0">
              <span>{{ p.avatar }}</span>
              <span>{{ p.name }} ({{ p.role }})</span>
            </button>
          }
        </div>

        <!-- Main Body: Two-Column Layout (Dialogue & Telemetry) -->
        <div class="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">

          <!-- Left Column: Interactive Dialogue (7 cols) -->
          <div class="lg:col-span-7 p-6 flex flex-col justify-between space-y-4">
            
            <!-- Persona Scenario Context Card -->
            <div class="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-bold text-indigo-900 dark:text-indigo-200 font-mono uppercase tracking-wider">
                  Scenario: {{ gymService.activePersona().role }}
                </span>
                <span class="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded">
                  Target: {{ gymService.activePersona().targetSkillObjective }}
                </span>
              </div>
              <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                {{ gymService.activePersona().scenarioDescription }}
              </p>
            </div>

            <!-- Dialogue History Thread -->
            <div class="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[360px]">
              @for (turn of gymService.conversationHistory(); track $index) {
                <div [class.justify-end]="turn.speaker === 'user'"
                     [class.justify-start]="turn.speaker === 'persona'"
                     class="flex flex-col">
                  
                  <div [class.bg-indigo-600]="turn.speaker === 'user'"
                       [class.text-white]="turn.speaker === 'user'"
                       [class.ml-auto]="turn.speaker === 'user'"
                       [class.bg-zinc-100]="turn.speaker === 'persona'"
                       [class.dark:bg-zinc-800]="turn.speaker === 'persona'"
                       [class.text-zinc-900]="turn.speaker === 'persona'"
                       [class.dark:text-zinc-100]="turn.speaker === 'persona'"
                       class="max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed font-sans shadow-xs space-y-1">
                    
                    <div class="flex items-center justify-between gap-2 font-mono text-[10px] opacity-70">
                      <span>{{ turn.speaker === 'user' ? 'You' : gymService.activePersona().name }}</span>
                      <span>{{ turn.timestamp }}</span>
                    </div>

                    <p>{{ turn.text }}</p>
                  </div>

                  <!-- Inner Monologue Bubble (if enabled and persona turn) -->
                  @if (gymService.revealInnerMonologue() && turn.speaker === 'persona' && turn.innerMonologue) {
                    <div class="mt-1 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 max-w-[85%] font-mono space-y-0.5 animate-in fade-in duration-300">
                      <div class="font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        <span>💭 Unspoken Inner Monologue:</span>
                      </div>
                      <p class="italic leading-snug">"{{ turn.innerMonologue }}"</p>
                    </div>
                  }

                </div>
              }
            </div>

            <!-- Quick Practice Suggestions or Custom Input -->
            <div class="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              
              <!-- Quick Response Prompts -->
              <div class="space-y-1">
                <span class="text-[10px] font-mono font-bold uppercase text-zinc-500">Quick Practice Options:</span>
                <div class="flex flex-col gap-1.5">
                  @for (sample of gymService.activePersona().sampleResponses; track $index) {
                    <button (click)="submitInput(sample.prompt)"
                      class="text-left p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 text-[11px] text-zinc-700 dark:text-zinc-300 transition cursor-pointer flex items-center justify-between">
                      <span class="line-clamp-1 font-sans">"{{ sample.prompt }}"</span>
                      <span class="text-[10px] font-mono font-bold ml-2 shrink-0"
                        [class.text-emerald-600]="sample.empathyScore > 80"
                        [class.text-amber-600]="sample.empathyScore <= 80">
                        {{ sample.empathyScore > 80 ? '🌟 High Empathy' : '⚠️ Pitfall' }}
                      </span>
                    </button>
                  }
                </div>
              </div>

              <!-- Custom Text Input -->
              <div class="flex gap-2">
                <input type="text"
                  [ngModel]="customInput()"
                  (ngModelChange)="customInput.set($event)"
                  (keyup.enter)="submitCustomInput()"
                  placeholder="Type your own custom response..."
                  class="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button (click)="submitCustomInput()"
                  [disabled]="!customInput().trim()"
                  class="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold font-mono uppercase tracking-wider hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer">
                  Send
                </button>
              </div>

            </div>

          </div>

          <!-- Right Column: Live Social Telemetry & Coaching (5 cols) -->
          <div class="lg:col-span-5 p-6 bg-zinc-50/40 dark:bg-zinc-900/40 space-y-5">
            
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>📊</span>
                <span>Live Social Telemetry</span>
              </h3>

              <!-- Inner Monologue Toggle -->
              <label class="flex items-center gap-2 cursor-pointer font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                <input type="checkbox"
                  [checked]="gymService.revealInnerMonologue()"
                  (change)="gymService.revealInnerMonologue.set(!gymService.revealInnerMonologue())"
                  class="accent-amber-600 rounded cursor-pointer" />
                <span>💭 Reveal Inner Thoughts</span>
              </label>
            </div>

            <!-- Telemetry Gauges -->
            <div class="grid grid-cols-2 gap-3 font-mono">
              <div class="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span class="text-[10px] text-zinc-500 block uppercase">Curiosity Ratio</span>
                <span class="text-xl font-bold text-indigo-600 dark:text-indigo-400">{{ telemetry().curiosityRatio }}%</span>
                <span class="text-[9px] text-zinc-400 block mt-0.5">Target: 40-60%</span>
              </div>

              <div class="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span class="text-[10px] text-zinc-500 block uppercase">NVC Alignment</span>
                <span class="text-xl font-bold text-emerald-600 dark:text-emerald-400">{{ telemetry().nvcComplianceScore }}%</span>
                <span class="text-[9px] text-zinc-400 block mt-0.5">Non-Violent Comm.</span>
              </div>

              <div class="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span class="text-[10px] text-zinc-500 block uppercase">Turn Balance</span>
                <span class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ telemetry().turnBalancePct }}%</span>
                <span class="text-[9px] text-zinc-400 block mt-0.5">Words user vs partner</span>
              </div>

              <div class="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span class="text-[10px] text-zinc-500 block uppercase">Empathy Depth</span>
                <span class="text-xs font-bold text-amber-600 dark:text-amber-400 line-clamp-1 mt-1">{{ telemetry().empathyDepthTier }}</span>
              </div>
            </div>

            <!-- Strengths Observed -->
            <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs font-sans">
              <span class="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-[11px] uppercase tracking-wider block">
                ✓ Strengths Observed
              </span>
              <ul class="space-y-1 text-zinc-700 dark:text-zinc-300 list-disc list-inside text-[11px] leading-relaxed">
                @for (s of telemetry().strengthsObserved; track s) {
                  <li>{{ s }}</li>
                }
              </ul>
            </div>

            <!-- Actionable Growth Levers -->
            <div class="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs font-sans">
              <span class="font-bold text-indigo-700 dark:text-indigo-400 font-mono text-[11px] uppercase tracking-wider block">
                🎯 Actionable Growth Levers
              </span>
              <ul class="space-y-1 text-zinc-700 dark:text-zinc-300 list-disc list-inside text-[11px] leading-relaxed">
                @for (g of telemetry().growthOpportunities; track g) {
                  <li>{{ g }}</li>
                }
              </ul>
            </div>

            <!-- Suggested Next Workout -->
            <div class="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs font-sans space-y-1">
              <span class="text-[10px] font-mono font-bold uppercase text-indigo-800 dark:text-indigo-300">
                Suggested Next Workout
              </span>
              <p class="text-zinc-700 dark:text-zinc-300 text-[11px] leading-snug">
                {{ telemetry().suggestedNextDrill }}
              </p>
            </div>

          </div>

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <button (click)="resetCurrentPersona()"
            class="text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer">
            ↺ Restart Scenario
          </button>
          <button (click)="close.emit()"
            class="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold font-mono uppercase tracking-wider hover:opacity-90 transition cursor-pointer">
            Done Practicing
          </button>
        </div>

      </div>

    </div>
  `
})
export class SocialPragmaticsGymComponent {
  gymService = inject(SocialPragmaticsGymService);
  close = output<void>();

  customInput = signal<string>('');

  telemetry = computed<ISocialTelemetryReport>(() => {
    // Re-evaluate whenever conversation history changes
    const _ = this.gymService.conversationHistory();
    return this.gymService.generateTelemetryReport();
  });

  selectPersona(id: SocialPersonaId): void {
    this.gymService.resetSession(id);
    this.customInput.set('');
  }

  resetCurrentPersona(): void {
    this.gymService.resetSession(this.gymService.activePersonaId());
    this.customInput.set('');
  }

  submitInput(text: string): void {
    this.gymService.processUserResponse(text);
  }

  submitCustomInput(): void {
    const text = this.customInput().trim();
    if (text) {
      this.gymService.processUserResponse(text);
      this.customInput.set('');
    }
  }
}
