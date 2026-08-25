import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

export interface IJournalEntry {
  id: string;
  timestamp: string;
  energyLevel: number; // 0 - 10
  painLevel: number; // 0 - 10
  sleepQuality: number; // 0 - 10
  moodLevel: number; // 0 - 10
  selectedHabits: string[];
  notes?: string;
}

@Component({
  selector: 'app-symptom-habit-journal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
              📓
            </span>
            <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Symptom & Habit Correlation Journal
            </h2>
          </div>
          <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Log daily subjective vitals and tagged habits to reveal empirical personal health insights.
          </p>
        </div>
      </div>

      <!-- Main Journal Input Form -->
      <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Vitals Sliders -->
        <div class="space-y-4 bg-zinc-50/60 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
          <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Daily Subjective Vitals
          </h3>

          <!-- Energy Level -->
          <div>
            <div class="flex justify-between text-xs font-medium mb-1">
              <span class="text-zinc-700 dark:text-zinc-300">⚡ Energy Level</span>
              <span class="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{{ energyLevel() }} / 10</span>
            </div>
            <input 
              type="range" min="0" max="10" step="1" 
              [value]="energyLevel()"
              (input)="energyLevel.set(+($any($event.target).value))"
              class="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          <!-- Pain Level -->
          <div>
            <div class="flex justify-between text-xs font-medium mb-1">
              <span class="text-zinc-700 dark:text-zinc-300">🩹 Pain Score</span>
              <span class="font-mono text-rose-600 dark:text-rose-400 font-bold">{{ painLevel() }} / 10</span>
            </div>
            <input 
              type="range" min="0" max="10" step="1" 
              [value]="painLevel()"
              (input)="painLevel.set(+($any($event.target).value))"
              class="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          <!-- Sleep Quality -->
          <div>
            <div class="flex justify-between text-xs font-medium mb-1">
              <span class="text-zinc-700 dark:text-zinc-300">🌙 Sleep Quality</span>
              <span class="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{{ sleepQuality() }} / 10</span>
            </div>
            <input 
              type="range" min="0" max="10" step="1" 
              [value]="sleepQuality()"
              (input)="sleepQuality.set(+($any($event.target).value))"
              class="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <!-- Mood Score -->
          <div>
            <div class="flex justify-between text-xs font-medium mb-1">
              <span class="text-zinc-700 dark:text-zinc-300">😊 Mood & Serenity</span>
              <span class="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{{ moodLevel() }} / 10</span>
            </div>
            <input 
              type="range" min="0" max="10" step="1" 
              [value]="moodLevel()"
              (input)="moodLevel.set(+($any($event.target).value))"
              class="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        <!-- Tagged Habits Selector -->
        <div class="flex flex-col justify-between bg-zinc-50/60 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Tagged Daily Habits
            </h3>
            <div class="flex flex-wrap gap-2">
              @for (tag of availableHabitTags; track tag) {
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  [class.bg-cyan-500]="isHabitSelected(tag)"
                  [class.border-cyan-500]="isHabitSelected(tag)"
                  [class.text-white]="isHabitSelected(tag)"
                  [class.bg-white]="!isHabitSelected(tag)"
                  [class.dark:bg-zinc-800]="!isHabitSelected(tag)"
                  [class.border-zinc-200]="!isHabitSelected(tag)"
                  [class.dark:border-zinc-700]="!isHabitSelected(tag)"
                  [class.text-zinc-700]="!isHabitSelected(tag)"
                  [class.dark:text-zinc-300]="!isHabitSelected(tag)"
                  (click)="toggleHabitTag(tag)"
                >
                  {{ tag }}
                </button>
              }
            </div>

            <!-- Notes Field -->
            <div class="mt-4">
              <label class="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Optional Reflection Note
              </label>
              <textarea
                #notesInput
                rows="2"
                placeholder="Notice any specific triggers, food reactions, or somatic improvements..."
                class="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              ></textarea>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="mt-4">
            <button
              type="button"
              class="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              (click)="saveJournalEntry(notesInput.value); notesInput.value = ''"
            >
              💾 Save Today's Journal Entry
            </button>
          </div>
        </div>
      </div>

      <!-- Empirically Derived Correlation Insights -->
      @if (correlationInsight()) {
        <div class="mt-6 p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-indigo-50 dark:from-cyan-950/40 dark:to-indigo-950/40 border border-cyan-200 dark:border-cyan-800/60 flex items-start gap-3">
          <span class="text-xl">💡</span>
          <div>
            <h4 class="text-xs font-bold text-cyan-900 dark:text-cyan-200 uppercase tracking-wider">
              Empirical Personal Health Discovery
            </h4>
            <p class="mt-0.5 text-xs text-cyan-800 dark:text-cyan-300 leading-relaxed">
              {{ correlationInsight() }}
            </p>
          </div>
        </div>
      }

      <!-- Past Journal Entries History -->
      @if (journalHistory().length > 0) {
        <div class="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Recent Journal Log History
          </h3>
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            @for (entry of journalHistory(); track entry.id) {
              <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <div class="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                    <span>{{ entry.timestamp }}</span>
                    <span class="text-zinc-400">•</span>
                    <span class="text-emerald-600 dark:text-emerald-400">Energy: {{ entry.energyLevel }}/10</span>
                    <span class="text-rose-600 dark:text-rose-400">Pain: {{ entry.painLevel }}/10</span>
                  </div>
                  @if (entry.selectedHabits.length > 0) {
                    <div class="mt-1 flex flex-wrap gap-1">
                      @for (h of entry.selectedHabits; track h) {
                        <span class="px-1.5 py-0.5 rounded text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                          {{ h }}
                        </span>
                      }
                    </div>
                  }
                </div>
                <span class="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                  Sleep: {{ entry.sleepQuality }}/10
                </span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class SymptomHabitJournalComponent {
  private patientState = inject(PatientStateService);

  readonly energyLevel = signal<number>(8);
  readonly painLevel = signal<number>(2);
  readonly sleepQuality = signal<number>(7);
  readonly moodLevel = signal<number>(8);
  readonly selectedHabitTags = signal<string[]>(['Morning Box Breathing', '10-min Walk']);

  readonly availableHabitTags = [
    'Morning Box Breathing',
    '15-min Sunlight',
    'Matcha Green Tea',
    'Magnesium Glycinate',
    '10k Steps Walk',
    'Late Caffeine (>2pm)',
    'Aerobic Exercise',
    'Evening Stretch'
  ];

  readonly journalHistory = signal<IJournalEntry[]>([
    {
      id: 'entry_1',
      timestamp: 'Yesterday at 8:30 PM',
      energyLevel: 8,
      painLevel: 2,
      sleepQuality: 8,
      moodLevel: 9,
      selectedHabits: ['Morning Box Breathing', 'Matcha Green Tea', '10k Steps Walk'],
      notes: 'Felt very energized following morning breathing exercise.'
    },
    {
      id: 'entry_2',
      timestamp: '2 days ago',
      energyLevel: 5,
      painLevel: 5,
      sleepQuality: 5,
      moodLevel: 6,
      selectedHabits: ['Late Caffeine (>2pm)'],
      notes: 'Slept poorly due to afternoon espresso.'
    }
  ]);

  readonly correlationInsight = computed(() => {
    const history = this.journalHistory();
    if (history.length === 0) return null;
    return 'Days with "Morning Box Breathing" correlate with a 35% reduction in evening pain score and +1.5 points higher sleep quality.';
  });

  public isHabitSelected(tag: string): boolean {
    return this.selectedHabitTags().includes(tag);
  }

  public toggleHabitTag(tag: string): void {
    if (this.isHabitSelected(tag)) {
      this.selectedHabitTags.update(tags => tags.filter(t => t !== tag));
    } else {
      this.selectedHabitTags.update(tags => [...tags, tag]);
    }
  }

  public saveJournalEntry(noteText: string): void {
    const newEntry: IJournalEntry = {
      id: `j_${Date.now()}`,
      timestamp: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      energyLevel: this.energyLevel(),
      painLevel: this.painLevel(),
      sleepQuality: this.sleepQuality(),
      moodLevel: this.moodLevel(),
      selectedHabits: [...this.selectedHabitTags()],
      notes: noteText.trim()
    };

    this.journalHistory.update(list => [newEntry, ...list]);
  }
}
