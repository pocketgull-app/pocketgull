/**
 * Family Health Hero Quest Component.
 * Interactive and printable family health adventure empowering kids and parents
 * to build daily lifelong habits: walking, rainbow nutrition, hydration, sleep, and connection.
 *
 * @module components/family/family-health-quest
 */
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IFamilyMission {
  id: string;
  emoji: string;
  title: string;
  role: string;
  scienceRationale: string;
  kidAction: string;
  completed: boolean;
  color: string;
  badgeName: string;
}

@Component({
  selector: 'app-family-health-quest',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
      <!-- Header Banner -->
      <div class="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-2xl shadow-lg relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-white/20 rounded-full border border-white/30">
                Kid-Powered Health Coaching
              </span>
              <span class="text-xs text-white/90">Daily Family Health Adventures</span>
            </div>
            <h2 class="text-2xl font-black uppercase tracking-tight font-pocketgull text-white">
              Family Health Hero Quests 🌟
            </h2>
            <p class="text-xs text-white/90 mt-0.5 max-w-xl">
              Empowering kids to be their parents' health champions—turning daily walking, healthy eating, hydration, and restful sleep into a shared family game.
            </p>
          </div>

          <!-- Progress Stars -->
          <div class="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 flex items-center gap-3 shrink-0">
            <div class="text-center">
              <div class="text-2xl font-black text-white leading-none">{{ completedCount() }} / {{ missions().length }}</div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-white/80 mt-0.5">Missions Done</div>
            </div>
            <div class="text-2xl">🏆</div>
          </div>
        </div>
      </div>

      <!-- Missions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (m of missions(); track m.id) {
          <div
            (click)="toggleMission(m.id)"
            [class.border-emerald-500]="m.completed"
            [class.bg-emerald-50/40]="m.completed"
            [class.dark:bg-emerald-950/20]="m.completed"
            class="p-5 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div class="flex items-center justify-between gap-2 mb-3">
                <div class="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xl shadow-xs">
                  {{ m.emoji }}
                </div>
                <button
                  type="button"
                  (click)="$event.stopPropagation(); toggleMission(m.id)"
                  [class.bg-emerald-500]="m.completed"
                  [class.text-white]="m.completed"
                  [class.border-emerald-500]="m.completed"
                  [class.bg-white]="!m.completed"
                  [class.dark:bg-zinc-800]="!m.completed"
                  [class.border-zinc-300]="!m.completed"
                  [class.dark:border-zinc-700]="!m.completed"
                  class="w-6 h-6 rounded-lg border flex items-center justify-center transition-all text-xs font-bold"
                >
                  @if (m.completed) {
                    ✓
                  }
                </button>
              </div>

              <div class="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
                {{ m.role }}
              </div>
              <h3 class="text-sm font-black text-zinc-900 dark:text-zinc-100 font-pocketgull mb-1">
                {{ m.title }}
              </h3>
              <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                {{ m.kidAction }}
              </p>
            </div>

            <div class="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div class="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-1">
                <span class="font-bold text-zinc-700 dark:text-zinc-300 shrink-0">🔬 Science:</span>
                <span class="line-clamp-2">{{ m.scienceRationale }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Printable Fridge Tracker Section -->
      <div class="p-5 bg-zinc-100 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
            🖨️
          </div>
          <div>
            <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Printable Refrigerator Quest Chart
            </h4>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Download and print a fun weekly badge sheet for kids to stick on the fridge and stamp each night!
            </p>
          </div>
        </div>

        <button
          type="button"
          (click)="printQuestSheet()"
          class="px-4 py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <span>Print Quest Sheet</span>
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>
      </div>
    </div>
  `
})
export class FamilyHealthQuestComponent {
  missions = signal<IFamilyMission[]>([
    {
      id: 'mission-walk',
      emoji: '🚶',
      title: 'After-Dinner Walk Expedition',
      role: 'Family Step Captain',
      kidAction: 'Invite Mom or Dad for a 15-minute neighborhood walk. Spot 3 dogs, birds, or cool trees along the way!',
      scienceRationale: '15-minute post-meal walking reduces blood sugar spikes by 30% and activates restorative parasympathetic calming.',
      completed: false,
      color: 'amber',
      badgeName: 'Trailblazer Star'
    },
    {
      id: 'mission-rainbow',
      emoji: '🥗',
      title: 'Rainbow Plate Challenge',
      role: 'Kitchen Sous Chef',
      kidAction: 'Help pick out 3 different colorful foods (like green broccoli, red peppers, and orange carrots) for dinner.',
      scienceRationale: 'Diverse phytonutrients and dietary fiber nurture the gut microbiome and protect long-term cardiovascular health.',
      completed: false,
      color: 'emerald',
      badgeName: 'Rainbow Master'
    },
    {
      id: 'mission-hydration',
      emoji: '💧',
      title: 'Hydration & Screen Break Officer',
      role: 'Hydration Captain',
      kidAction: 'Bring your parent a fresh glass of water with a lemon slice while they work, and remind them to look out the window for 20 seconds!',
      scienceRationale: 'Proper hydration prevents mental fatigue, while the 20-20-20 rule prevents digital eye strain and headaches.',
      completed: false,
      color: 'blue',
      badgeName: 'Hydra Hero'
    },
    {
      id: 'mission-sleep',
      emoji: '🌙',
      title: 'Bedtime Wind-Down DJ',
      role: 'Sleep Guardian',
      kidAction: 'Help put phones to bed in a "parking lot" basket 30 minutes before bedtime and pick a relaxing book chapter to read together.',
      scienceRationale: 'Blue light cessation triggers natural melatonin secretion and optimizes deep non-REM restorative sleep cycles.',
      completed: false,
      color: 'indigo',
      badgeName: 'Dream Catcher'
    },
    {
      id: 'mission-hug',
      emoji: '❤️',
      title: 'Laughter & Daily Check-In Rx',
      role: 'Chief Happiness Officer',
      kidAction: 'Ask your parent: "What was the most fun thing that happened today?" and give them a big, genuine 10-second hug!',
      scienceRationale: '10-second hugs release oxytocin and stimulate the vagus nerve, immediately lowering cortisol and blood pressure.',
      completed: false,
      color: 'rose',
      badgeName: 'Heart of Gold'
    }
  ]);

  completedCount = signal<number>(0);

  toggleMission(id: string): void {
    this.missions.update(list => {
      const updated = list.map(m => m.id === id ? { ...m, completed: !m.completed } : m);
      this.completedCount.set(updated.filter(m => m.completed).length);
      return updated;
    });
  }

  printQuestSheet(): void {
    window.print();
  }
}
