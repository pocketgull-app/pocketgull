import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PatientTrajectoryService,
  IDailyVitalityHabit
} from '../services/patient-trajectory.service';

@Component({
  selector: 'app-patient-trajectory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rounded-2xl border border-teal-500/30 bg-gradient-to-b from-slate-950 via-zinc-950 to-teal-950/20 p-5 space-y-6 shadow-2xl font-sans text-zinc-100 max-w-5xl mx-auto">
      <!-- Top Title & Voice Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xl">🧭</span>
            <h2 class="text-lg font-black tracking-tight text-white">
              The 3-Act Patient Trajectory & Vitality Compass
            </h2>
          </div>
          <p class="text-xs text-zinc-400 mt-0.5">
            The Quiet Workshop Voice · Grounded in Empowerment, Zero Fatalism & Daily Micro-Habits
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Act Stepper Tabs -->
          <div class="flex items-center bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
            <button (click)="activeAct.set(1)"
                    class="px-3 py-1.5 rounded-lg transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5"
                    [class.bg-teal-600]="activeAct() === 1"
                    [class.text-white]="activeAct() === 1"
                    [class.text-zinc-400]="activeAct() !== 1">
              <span>🌱</span> Act 1: Origin
            </button>
            <button (click)="activeAct.set(2)"
                    class="px-3 py-1.5 rounded-lg transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5"
                    [class.bg-teal-600]="activeAct() === 2"
                    [class.text-white]="activeAct() === 2"
                    [class.text-zinc-400]="activeAct() !== 2">
              <span>☀️</span> Act 2: Today ({{ service.dailyAdherenceScore() }}%)
            </button>
            <button (click)="activeAct.set(3)"
                    class="px-3 py-1.5 rounded-lg transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5"
                    [class.bg-teal-600]="activeAct() === 3"
                    [class.text-white]="activeAct() === 3"
                    [class.text-zinc-400]="activeAct() !== 3">
              <span>🎯</span> Act 3: Horizon
            </button>
          </div>
        </div>
      </div>

      <!-- ════════════════════ ACT 1: WHERE YOU'VE BEEN ════════════════════ -->
      @if (activeAct() === 1) {
        <div class="space-y-4">
          <div class="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-start gap-3">
            <span class="text-2xl">📖</span>
            <div>
              <h3 class="text-sm font-bold text-teal-300">Act 1: Where You've Been — The Foundation (Zero Shame)</h3>
              <p class="text-xs text-zinc-400 mt-1 leading-relaxed">
                Medical charts often sound like permanent verdicts. We translate clinical nomenclature into plain-language
                "Teaspoon Explanations." Your past hurdles are simply physical adaptation requests—solvable engineering problems.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            @for (item of service.teaspoonExplanations(); track item.clinicalTerm) {
              <div class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col justify-between space-y-3">
                <div class="space-y-2">
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 inline-block">
                    {{ item.anatomicalAnchor }}
                  </span>
                  <div class="text-xs font-bold text-zinc-200">{{ item.clinicalTerm }}</div>
                  <p class="text-xs text-zinc-300 leading-relaxed italic bg-black/20 p-2.5 rounded-lg border border-zinc-800/80">
                    "{{ item.teaspoonExplanation }}"
                  </p>
                </div>

                <div class="space-y-1.5 pt-2 border-t border-zinc-800/60 text-[11px]">
                  <div class="text-zinc-500">
                    <span class="font-bold text-zinc-400">Trigger:</span> {{ item.historicalTrigger }}
                  </div>
                  <div class="text-emerald-400 font-medium">
                    <span class="font-bold">✨ Path Forward:</span> {{ item.empowermentReframe }}
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- ════════════════════ ACT 2: WHERE YOU STAND TODAY ════════════════════ -->
      @if (activeAct() === 2) {
        <div class="space-y-4">
          <div class="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">⚡</span>
              <div>
                <h3 class="text-sm font-bold text-amber-300">Act 2: Where You Stand Today — The Daily Vitality Loop</h3>
                <p class="text-xs text-zinc-400 mt-0.5">
                  Instead of a daunting 20-page plan, focus strictly on today's 3 achievable micro-habits.
                </p>
              </div>
            </div>

            <div class="text-right">
              <div class="text-xs font-bold text-zinc-400">Today's Adherence</div>
              <div class="text-lg font-black text-amber-400 font-mono">{{ service.dailyAdherenceScore() }}%</div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            @for (habit of service.dailyHabits(); track habit.id) {
              <div class="p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3"
                   [class.border-amber-500/40]="habit.isCompleted"
                   [class.bg-amber-950/10]="habit.isCompleted"
                   [class.border-zinc-800]="!habit.isCompleted"
                   [class.bg-zinc-900/30]="!habit.isCompleted">
                <div>
                  <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1.5">
                    <span>{{ habit.timeOfDay }}</span>
                    @if (habit.isCompleted) {
                      <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">✓ DONE ({{ habit.completedAt }})</span>
                    }
                  </div>

                  <h4 class="text-xs font-bold text-zinc-100 mb-2">{{ habit.title }}</h4>

                  <ul class="space-y-1.5 text-xs text-zinc-300">
                    @for (action of habit.actionItems; track action) {
                      <li class="flex items-start gap-2">
                        <span class="text-amber-400 mt-0.5">•</span>
                        <span>{{ action }}</span>
                      </li>
                    }
                  </ul>
                </div>

                <div class="pt-3 border-t border-zinc-800/60 space-y-2">
                  <div class="text-[10px] font-mono text-zinc-400">
                    <div><span class="text-zinc-500">Optical:</span> {{ habit.opticalIntegration }}</div>
                    <div><span class="text-zinc-500">Sound:</span> {{ habit.soundIntegration }}</div>
                  </div>

                  <button (click)="service.toggleHabitCompletion(habit.id)"
                          class="w-full py-2 px-3 rounded-lg font-bold text-xs transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
                          [class.bg-emerald-600]="habit.isCompleted"
                          [class.hover:bg-emerald-500]="habit.isCompleted"
                          [class.text-white]="habit.isCompleted"
                          [class.bg-zinc-800]="!habit.isCompleted"
                          [class.hover:bg-zinc-700]="!habit.isCompleted"
                          [class.text-zinc-300]="!habit.isCompleted">
                    {{ habit.isCompleted ? '✓ Completed Today' : 'Mark as Completed' }}
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- ════════════════════ ACT 3: WHERE YOU'RE GOING ════════════════════ -->
      @if (activeAct() === 3) {
        <div class="space-y-4">
          <div class="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🏆</span>
              <div>
                <h3 class="text-sm font-bold text-emerald-300">Act 3: Where You're Going — The Horizon Milestones</h3>
                <p class="text-xs text-zinc-400 mt-0.5">
                  Measurable 30, 60, and 90-day physiological targets. Reaching Day 90 unlocks your Cryptographic Vitality Certificate.
                </p>
              </div>
            </div>

            <button (click)="service.generateVitalityCertificate()"
                    class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer min-h-[44px] flex items-center gap-2">
              📜 Generate Vitality Certificate
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            @for (milestone of service.horizonMilestones(); track milestone.dayTarget) {
              <div class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-3 flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-xs font-mono">
                    <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                      Day {{ milestone.dayTarget }} Milestone
                    </span>
                    <span class="font-bold text-zinc-300">{{ milestone.completionPercent }}%</span>
                  </div>

                  <h4 class="text-xs font-bold text-zinc-100">{{ milestone.phaseTitle }}</h4>
                  <p class="text-xs text-zinc-400 leading-relaxed">{{ milestone.targetObjective }}</p>
                </div>

                <div class="space-y-2 pt-2 border-t border-zinc-800/60">
                  <div class="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div class="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all"
                         [style.width.%]="milestone.completionPercent"></div>
                  </div>

                  <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>{{ milestone.baselineValue }}</span>
                    <span class="text-emerald-300 font-bold">{{ milestone.currentValue }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Cryptographic Vitality Certificate Card -->
          @if (service.vitalityCertificate(); as cert) {
            <div class="p-5 rounded-2xl bg-gradient-to-b from-amber-950/20 via-zinc-950 to-emerald-950/20 border border-amber-500/40 shadow-2xl space-y-4">
              <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div class="flex items-center gap-2">
                  <span class="text-2xl">🎖️</span>
                  <div>
                    <div class="text-xs font-mono uppercase tracking-widest text-amber-400">Official Vitality Attestation Seal</div>
                    <div class="text-sm font-bold text-white">{{ cert.completedMilestone }}</div>
                  </div>
                </div>
                <span class="text-[10px] font-mono text-zinc-400">{{ cert.certificateId }}</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                @for (achieve of cert.clinicalAchievements; track achieve) {
                  <div class="flex items-center gap-2 text-zinc-200">
                    <span class="text-emerald-400">✓</span>
                    <span>{{ achieve }}</span>
                  </div>
                }
              </div>

              <div class="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-zinc-400">
                <span>{{ cert.sha256IntegritySeal }}</span>
                <span class="text-emerald-400">{{ cert.regulatoryAttestation }}</span>
              </div>
            </div>
          }
        </div>
      }

      <!-- ════════════════════ ON-DEVICE GEMMA 4 EDGE SCRIBE ════════════════════ -->
      <div class="p-4 rounded-xl border border-teal-500/20 bg-zinc-900/40 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm">🤖</span>
            <h4 class="text-xs font-black uppercase tracking-widest text-teal-300">
              Local On-Device AI Scribe (Gemma 4 Dev Trial)
            </h4>
          </div>
          <span class="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            100% Zero-Egress HIPAA Safe Harbor
          </span>
        </div>

        <p class="text-xs text-zinc-400 leading-relaxed">
          Ask or type any live symptom or sensation. The on-device model evaluates your past scan history locally without sending private health data to the cloud.
        </p>

        <div class="flex flex-wrap gap-1.5">
          <button (click)="samplePrompt('My lower back feels tight after sitting today')"
                  class="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-all cursor-pointer">
            "My lower back feels tight after sitting today"
          </button>
          <button (click)="samplePrompt('My eyes feel strained and heavy from the screen')"
                  class="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-all cursor-pointer">
            "My eyes feel strained from the screen"
          </button>
          <button (click)="samplePrompt('Having trouble falling asleep, mind is racing')"
                  class="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-all cursor-pointer">
            "Trouble falling asleep, mind racing"
          </button>
        </div>

        <div class="flex gap-2">
          <input [(ngModel)]="customNote"
                 (keyup.enter)="consultEdge()"
                 type="text"
                 placeholder="Type your current sensation or symptom..."
                 class="flex-1 bg-black/40 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-400 font-sans" />
          <button (click)="consultEdge()"
                  [disabled]="!customNote.trim() || isSubmitting()"
                  class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-bold text-xs transition-all cursor-pointer min-h-[44px]">
            {{ isSubmitting() ? 'Analyzing...' : 'Consult Edge AI' }}
          </button>
        </div>

        @if (service.recentEdgeConsult(); as consult) {
          <div class="p-3.5 rounded-xl bg-black/40 border border-teal-500/30 space-y-2 text-xs animate-fadeIn">
            <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span class="text-teal-400 font-bold">🎯 Anatomical Link: {{ consult.anatomicalLinkage }}</span>
              <span>{{ consult.source }} · {{ consult.timestamp }}</span>
            </div>

            <p class="text-zinc-200 leading-relaxed font-medium">
              {{ consult.teaspoonInsight }}
            </p>

            <div class="p-2.5 rounded-lg bg-teal-950/30 border border-teal-500/20 text-teal-200 text-xs">
              <span class="font-bold">⚡ Immediate Action:</span> {{ consult.recommendedImmediateAction }}
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PatientTrajectoryComponent {
  readonly service = inject(PatientTrajectoryService);

  readonly activeAct = signal<1 | 2 | 3>(2); // Default to Act 2: Today
  customNote = '';
  readonly isSubmitting = signal<boolean>(false);

  samplePrompt(text: string): void {
    this.customNote = text;
    this.consultEdge();
  }

  async consultEdge(): Promise<void> {
    if (!this.customNote.trim() || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    try {
      await this.service.consultEdgeScribe(this.customNote);
      this.customNote = '';
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
