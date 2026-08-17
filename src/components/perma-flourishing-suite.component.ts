import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface IGratitudeLog {
  id: string;
  timestamp: string;
  category: 'Nature & Micro-Joys' | 'Human Connection' | 'Personal Milestone' | 'Acts of Kindness';
  entryText: string;
  permaDimension: 'Positive Emotion' | 'Engagement' | 'Relationships' | 'Meaning' | 'Accomplishment' | 'Vitality';
}

@Component({
  selector: 'app-perma-flourishing-suite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-gradient-to-br from-amber-50/60 via-emerald-50/50 to-teal-50/60 dark:from-zinc-900 dark:via-emerald-950/20 dark:to-zinc-900 rounded-2xl border border-amber-200/60 dark:border-emerald-800/40 shadow-xl transition-all">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-amber-200/50 dark:border-zinc-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🌸</span>
            <h2 class="text-xl font-bold text-amber-950 dark:text-amber-100">PERMA-V Human Flourishing & Happiness Suite</h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200/60 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300">
              Positive Psychology Engine
            </span>
          </div>
          <p class="text-xs text-amber-800/80 dark:text-zinc-400 mt-1">
            Based on Dr. Martin Seligman's PERMA-V model (Positive Emotion, Engagement, Relationships, Meaning, Accomplishment, & Vitality).
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right">
            <div class="text-xs text-amber-800/70 dark:text-zinc-400 font-medium">Flourishing Index</div>
            <div class="text-xl font-bold text-amber-900 dark:text-emerald-400">{{ flourishingIndex() }}/100</div>
          </div>
          <div class="w-12 h-12 rounded-full bg-amber-200/80 dark:bg-emerald-900/40 flex items-center justify-center text-xl shadow-inner border border-amber-300 dark:border-emerald-700">
            ✨
          </div>
        </div>
      </div>

      <!-- PERMA-V 6-Dimension Score Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        @for (dim of permaDimensions(); track dim.name) {
          <div class="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-amber-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div class="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
              <span>{{ dim.icon }} {{ dim.name }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-zinc-800 text-amber-800 dark:text-amber-300">{{ dim.score }}/10</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-1.5 mt-2">
              <div class="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-emerald-500" [style.width.%]="dim.score * 10"></div>
            </div>
            <p class="text-[10px] text-gray-500 dark:text-zinc-400 mt-2 leading-tight">{{ dim.tip }}</p>
          </div>
        }
      </div>

      <!-- Interactive Micro-Gratitude & Kindness Ledger -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Gratitude Micro-Journaling -->
        <div class="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-amber-200/70 dark:border-zinc-800 shadow-sm">
          <h3 class="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-2">
            <span>☀️</span> Daily Micro-Joy & Gratitude Journal
          </h3>
          <p class="text-xs text-gray-600 dark:text-zinc-400 mb-3">
            Capturing small daily micro-joys enhances ventral striatum dopamine and promotes autonomic calmness.
          </p>

          <div class="space-y-3 mb-3">
            <div>
              <label class="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Dimension Alignment</label>
              <select [(ngModel)]="newLogDimension" class="w-full text-xs p-2 bg-amber-50/50 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-gray-100 font-medium">
                <option value="Positive Emotion">Positive Emotion (Joy, Hope, Serenity)</option>
                <option value="Engagement">Engagement (Flow State, Absorption)</option>
                <option value="Relationships">Relationships (Laughter, Shared Bond)</option>
                <option value="Meaning">Meaning (Serving something greater)</option>
                <option value="Accomplishment">Accomplishment (Growth, Daily Win)</option>
                <option value="Vitality">Vitality (Restful Sleep, Movement, Sun)</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">What brought you joy or gratitude today?</label>
              <textarea [(ngModel)]="newLogText" rows="2" placeholder="e.g., Shared a warm tea with a friend, noticed autumn leaves, completed a deep coding session..."
                        class="w-full text-xs p-2.5 bg-amber-50/50 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-gray-100"></textarea>
            </div>
          </div>

          <button (click)="addGratitudeLog()" [disabled]="!newLogText.trim()"
                  class="w-full py-2 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white rounded-lg font-bold text-xs shadow-md transition disabled:opacity-50">
            ✨ Record Flourishing Micro-Joy
          </button>
        </div>

        <!-- Recent Logs Feed -->
        <div class="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-amber-200/70 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-3">
              <span>📖</span> Flourishing Gratitude Stream
            </h3>

            <div class="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              @for (log of gratitudeLogs(); track log.id) {
                <div class="p-3 bg-amber-50/40 dark:bg-zinc-800/60 rounded-lg border border-amber-100 dark:border-zinc-700/60 text-xs">
                  <div class="flex justify-between items-center mb-1 text-[11px]">
                    <span class="font-bold text-emerald-700 dark:text-emerald-400">● {{ log.permaDimension }}</span>
                    <span class="text-gray-400 text-[10px]">{{ log.timestamp }}</span>
                  </div>
                  <p class="text-gray-800 dark:text-gray-200 font-medium italic">"{{ log.entryText }}"</p>
                </div>
              }
            </div>
          </div>

          <div class="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center text-[11px] text-gray-500 dark:text-zinc-400">
            <span>Total Logged Micro-Joys: <strong>{{ gratitudeLogs().length }}</strong></span>
            <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Oxytocin Boost Active</span>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PermaFlourishingSuiteComponent {
  newLogDimension: 'Positive Emotion' | 'Engagement' | 'Relationships' | 'Meaning' | 'Accomplishment' | 'Vitality' = 'Positive Emotion';
  newLogText = '';

  readonly permaDimensions = signal([
    { name: 'Positive Emotion', icon: '☀️', score: 8.8, tip: 'Savor small moments & daily warmth' },
    { name: 'Engagement', icon: '🎨', score: 9.2, tip: 'Deep absorption in creative flow' },
    { name: 'Relationships', icon: '🤝', score: 8.5, tip: 'Nurture reciprocal acts of kindness' },
    { name: 'Meaning', icon: '🌱', score: 9.5, tip: 'Connecting code & care to human cures' },
    { name: 'Accomplishment', icon: '🏆', score: 9.0, tip: 'Celebrate continuous micro-progress' },
    { name: 'Vitality', icon: '🍵', score: 8.7, tip: 'Restful sleep, sun, & biophilic walks' }
  ]);

  readonly gratitudeLogs = signal<IGratitudeLog[]>([
    {
      id: 'log_001',
      timestamp: 'Today, 2:15 PM',
      category: 'Acts of Kindness',
      entryText: 'Collaborated with clinicians to build open access educational search & NSF grant portals.',
      permaDimension: 'Meaning'
    },
    {
      id: 'log_002',
      timestamp: 'Today, 11:30 AM',
      category: 'Nature & Micro-Joys',
      entryText: 'Took a biophilic 15-minute sunshine walk listening to 432 Hz ambient forest acoustics.',
      permaDimension: 'Vitality'
    }
  ]);

  readonly flourishingIndex = computed(() => {
    const total = this.permaDimensions().reduce((sum, d) => sum + d.score, 0);
    return Math.round((total / (this.permaDimensions().length * 10)) * 100);
  });

  addGratitudeLog(): void {
    const text = this.newLogText.trim();
    if (!text) return;

    const newLog: IGratitudeLog = {
      id: `log_${Date.now()}`,
      timestamp: 'Just now',
      category: 'Personal Milestone',
      entryText: text,
      permaDimension: this.newLogDimension
    };

    this.gratitudeLogs.update(logs => [newLog, ...logs]);
    this.newLogText = '';
  }
}
