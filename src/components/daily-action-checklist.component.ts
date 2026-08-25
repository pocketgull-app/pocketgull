import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { LifestyleAdjunctService } from '../services/lifestyle-adjunct.service';

export interface IDailyHabitItem {
  id: string;
  title: string;
  category: 'hydration' | 'circadian' | 'breathing' | 'nutrition' | 'sleep' | 'custom';
  description: string;
  targetTime?: string;
  impactLabel: string;
  completed: boolean;
}

@Component({
  selector: 'app-daily-action-checklist',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              ✓
            </span>
            <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Daily Action Checklist
            </h2>
          </div>
          <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Personalized daily micro-habits translated from your clinical care plan.
          </p>
        </div>

        <!-- Progress & Streak Badges -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <span>🔥</span>
            <span>{{ streakDays() }} Day Streak</span>
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <span>{{ completionPercent() }}% Done</span>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mt-4 w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-500 ease-out"
          [style.width.%]="completionPercent()">
        </div>
      </div>

      <!-- 100% Celebration Banner -->
      @if (completionPercent() === 100) {
        <div class="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 animate-fade-in">
          <div class="flex items-center gap-2">
            <span class="text-base">🎉</span>
            <span class="font-medium">All daily micro-habits complete! Excellent consistency.</span>
          </div>
          <span class="font-bold uppercase tracking-wider text-[10px] bg-emerald-200 dark:bg-emerald-800 px-2 py-0.5 rounded text-emerald-900 dark:text-emerald-100">
            Achieved
          </span>
        </div>
      }

      <!-- Habit List -->
      <div class="mt-5 space-y-3" role="list" aria-label="Daily health habits checklist">
        @for (item of habits(); track item.id) {
          <div 
            class="group p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            [class.bg-emerald-50\/30]="item.completed"
            [class.dark:bg-emerald-950\/20]="item.completed"
            [class.border-emerald-300]="item.completed"
            [class.dark:border-emerald-800\/60]="item.completed"
            [class.bg-zinc-50\/60]="!item.completed"
            [class.dark:bg-zinc-800\/40]="!item.completed"
            [class.border-zinc-200\/80]="!item.completed"
            [class.dark:border-zinc-800]="!item.completed"
            [class.hover:border-zinc-300]="!item.completed"
            [class.dark:hover:border-zinc-700]="!item.completed"
            tabindex="0"
            role="checkbox"
            [attr.aria-checked]="item.completed"
            [attr.aria-label]="item.title + ': ' + item.description"
            (click)="toggleHabit(item.id)"
            (keydown.space)="$event.preventDefault(); toggleHabit(item.id)"
            (keydown.enter)="$event.preventDefault(); toggleHabit(item.id)"
          >
            <!-- Checkbox Button (44px target) -->
            <button 
              type="button" 
              class="w-8 h-8 rounded-lg flex items-center justify-center border transition-all focus:outline-none shrink-0 mt-0.5"
              [class.bg-emerald-500]="item.completed"
              [class.border-emerald-500]="item.completed"
              [class.text-white]="item.completed"
              [class.border-zinc-300]="!item.completed"
              [class.dark:border-zinc-600]="!item.completed"
              [class.bg-white]="!item.completed"
              [class.dark:bg-zinc-900]="!item.completed"
              [attr.aria-hidden]="true"
              tabindex="-1"
            >
              @if (item.completed) {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
              }
            </button>

            <!-- Habit Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <h3 
                  class="text-sm font-semibold transition-all"
                  [class.line-through]="item.completed"
                  [class.text-zinc-500]="item.completed"
                  [class.dark:text-zinc-400]="item.completed"
                  [class.text-zinc-900]="!item.completed"
                  [class.dark:text-zinc-100]="!item.completed"
                >
                  {{ item.title }}
                </h3>
                @if (item.targetTime) {
                  <span class="text-[11px] font-mono font-medium text-zinc-400 dark:text-zinc-500">
                    {{ item.targetTime }}
                  </span>
                }
              </div>
              <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                {{ item.description }}
              </p>
              <div class="mt-2 flex items-center gap-2">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                  ⚡ {{ item.impactLabel }}
                </span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Add Custom Habit Input -->
      <div class="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <input 
          #newHabitInput
          type="text" 
          placeholder="Add custom daily habit (e.g. 10-min evening stretch)..."
          class="flex-1 px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          (keydown.enter)="addCustomHabit(newHabitInput.value); newHabitInput.value = ''"
        />
        <button 
          type="button"
          class="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          (click)="addCustomHabit(newHabitInput.value); newHabitInput.value = ''"
        >
          Add Habit
        </button>
      </div>
    </div>
  `
})
export class DailyActionChecklistComponent {
  private patientState = inject(PatientStateService);
  private lifestyleService = inject(LifestyleAdjunctService);

  readonly streakDays = signal<number>(5);

  readonly habits = signal<IDailyHabitItem[]>([
    {
      id: 'habit_hydration',
      title: 'Morning Electrolyte Hydration',
      category: 'hydration',
      description: 'Drink 500ml water with pinch of unrefined sea salt upon waking.',
      targetTime: '07:00 AM',
      impactLabel: 'Lowers morning vascular resistance',
      completed: true
    },
    {
      id: 'habit_sunlight',
      title: 'Circadian Sunlight Exposure',
      category: 'circadian',
      description: '15 minutes outdoor natural light exposure within 1 hour of waking.',
      targetTime: '07:30 AM',
      impactLabel: 'Aligns Cortisol Awakening Response (CAR)',
      completed: true
    },
    {
      id: 'habit_vagal_breathing',
      title: 'Vagal Box-Breathing Grounding',
      category: 'breathing',
      description: '5 minutes of 4-4-4-4 rhythmic diaphragm box-breathing.',
      targetTime: '12:30 PM',
      impactLabel: 'Enhances Parasympathetic Tone & HRV',
      completed: false
    },
    {
      id: 'habit_micronutrient',
      title: 'Anti-Inflammatory Nutrient Protocol',
      category: 'nutrition',
      description: 'Take targeted CoQ10 & Green Tea EGCG oral rinse adjunct.',
      targetTime: '01:00 PM',
      impactLabel: 'Attenuates systemic hs-CRP & SIBI',
      completed: false
    },
    {
      id: 'habit_sleep_hygiene',
      title: 'Circadian Screen Wind-Down',
      category: 'sleep',
      description: 'Turn off electronic screens 60 minutes before bedtime.',
      targetTime: '09:30 PM',
      impactLabel: 'Optimizes Pineal Melatonin Secretion',
      completed: false
    }
  ]);

  readonly completedCount = computed(() => this.habits().filter(h => h.completed).length);
  
  readonly completionPercent = computed(() => {
    const list = this.habits();
    if (list.length === 0) return 0;
    return Math.round((this.completedCount() / list.length) * 100);
  });

  public toggleHabit(id: string): void {
    this.habits.update(list => 
      list.map(h => h.id === id ? { ...h, completed: !h.completed } : h)
    );
  }

  public addCustomHabit(title: string): void {
    const trimmed = title.trim();
    if (!trimmed) return;
    const newHabit: IDailyHabitItem = {
      id: `custom_${Date.now()}`,
      title: trimmed,
      category: 'custom',
      description: 'Custom patient self-care goal.',
      impactLabel: 'Personalized Health Goal',
      completed: false
    };
    this.habits.update(list => [...list, newHabit]);
  }
}
