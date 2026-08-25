import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IOrganCard {
  id: string;
  name: string;
  emoji: string;
  clue: string;
  superpower: string;
  colorClass: string;
  funFact: string;
}

export const ALL_AGES_ORGAN_CARDS: IOrganCard[] = [
  {
    id: 'heart',
    name: 'The Mighty Heart',
    emoji: '🫀',
    clue: 'What pumps oxygen and beats like a drum so you can run and play?',
    superpower: 'Pumps blood 100,000 times a day with zero rest!',
    colorClass: 'border-rose-500/50 bg-rose-950/30 text-rose-300',
    funFact: 'Your heart is about the size of your fist and gets stronger every time you dance or play outdoors!'
  },
  {
    id: 'brain',
    name: 'The Super Brain',
    emoji: '🧠',
    clue: 'What helps you dream, remember stories, and solve fun puzzles?',
    superpower: 'Sends lightning-fast thoughts at over 250 miles per hour!',
    colorClass: 'border-purple-500/50 bg-purple-950/30 text-purple-300',
    funFact: 'Your brain has over 86 billion neurons working together like a giant friendly choir!'
  },
  {
    id: 'lungs',
    name: 'The Breathing Lungs',
    emoji: '🫁',
    clue: 'What takes in fresh air when you smell a flower or take a deep breath?',
    superpower: 'Expands like two gentle balloons with every single breath!',
    colorClass: 'border-sky-500/50 bg-sky-950/30 text-sky-300',
    funFact: 'Taking 3 slow deep breaths instantly calms your mind and relaxes your whole body!'
  },
  {
    id: 'bones',
    name: 'The Skeleton Frame',
    emoji: '🦴',
    clue: 'What holds you up straight and strong like a magnificent skyscraper?',
    superpower: '206 lightweight, super-strong living pillars!',
    colorClass: 'border-amber-500/50 bg-amber-950/30 text-amber-300',
    funFact: 'Bones are living tissue that rebuild themselves stronger when you run, jump, and eat calcium greens!'
  },
  {
    id: 'stomach',
    name: 'The Energy Stomach',
    emoji: '🥗',
    clue: 'What turns delicious fruits, berries, and meals into vibrant energy?',
    superpower: 'Breaks down rainbow meals into fuel for your muscles!',
    colorClass: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300',
    funFact: 'Your tummy is home to trillions of friendly gut microbes that love apples, oats, and carrots!'
  },
  {
    id: 'muscles',
    name: 'The Joyful Muscles',
    emoji: '💪',
    clue: 'What lets you lift things, give warm hugs, and sprint across the park?',
    superpower: 'Over 600 flexible springs working in perfect harmony!',
    colorClass: 'border-orange-500/50 bg-orange-950/30 text-orange-300',
    funFact: 'Even smiling uses 12 different facial muscles to spread cheer to others!'
  },
  {
    id: 'water',
    name: 'The Hydration River',
    emoji: '💧',
    clue: 'What is the sparkling drink that keeps all your cells refreshed and energetic?',
    superpower: 'Makes up 60% of your body and keeps everything flowing smoothly!',
    colorClass: 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300',
    funFact: 'Drinking fresh water gives you instant focus, crystal-clear eyes, and bouncy energy!'
  }
];

@Component({
  selector: 'app-body-explorer-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-card-dark rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden space-y-6">
      <div class="rams-grill"><div></div><div></div><div></div><div></div></div>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
            <span>✨ All-Ages Story &amp; Explorer Arena</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white">
            Body Explorer &amp; Organ Match Game
          </h2>
          <p class="text-xs sm:text-sm text-stone-300">
            Super easy, zero-timer matching adventure for kids, families, and seniors!
          </p>
        </div>

        <!-- Star Badge & Voice Read Aloud -->
        <div class="flex items-center gap-3 font-mono text-xs">
          <button (click)="speakCurrentClue()" 
                  class="px-3.5 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold transition flex items-center gap-2 cursor-pointer shadow-md">
            <span>{{ isSpeaking() ? '⏹️ Stop' : '🔊 Read Clue Aloud' }}</span>
          </button>

          <div class="p-3 rounded-2xl bg-stone-900 border border-amber-500/40 text-center shadow-md flex items-center gap-2">
            <span class="text-2xl">⭐</span>
            <div class="text-left">
              <div class="text-lg font-bold text-amber-400 font-mono">{{ matchedCount() }} / {{ organs.length }}</div>
              <div class="text-[10px] text-stone-400">Stars Earned</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Mystery Question Banner -->
      @if (!isGameWon()) {
        <div class="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 to-stone-900 border-2 border-amber-500/40 space-y-3 shadow-xl">
          <div class="flex items-center justify-between text-xs font-mono font-bold text-amber-300">
            <span>🎯 Current Body Mystery #{{ currentRound() + 1 }}</span>
            <span>No rush • Take your time!</span>
          </div>

          <div class="text-base sm:text-lg font-extrabold text-white leading-relaxed">
            "{{ currentTargetOrgan().clue }}"
          </div>

          @if (feedbackMessage()) {
            <div class="p-3 rounded-xl bg-black/50 border border-emerald-500/40 text-emerald-300 font-bold text-xs animate-in fade-in flex items-center gap-2">
              <span>🎉</span>
              <span>{{ feedbackMessage() }}</span>
            </div>
          }
        </div>
      } @else {
        <!-- Victory Banner -->
        <div class="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-2 border-emerald-400 text-center space-y-3 animate-in zoom-in-95">
          <div class="text-4xl">🌟 🏆 🌈</div>
          <h3 class="text-2xl font-black text-white">Congratulations, Master Body Explorer!</h3>
          <p class="text-sm text-emerald-200">
            You matched all 7 superpowers of the human body! Every cell is celebrating your curiosity!
          </p>
          <button (click)="restartGame()" 
                  class="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-black font-mono text-xs uppercase tracking-wider transition cursor-pointer shadow-lg">
            🔄 Play Another Round!
          </button>
        </div>
      }

      <!-- Interactive Big Organ Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (organ of organs; track organ.id) {
          <div 
            (click)="selectOrgan(organ)"
            class="p-5 rounded-2xl border-2 transition-all select-none cursor-pointer flex flex-col justify-between space-y-3 shadow-lg"
            [ngClass]="[
              organ.colorClass,
              isMatched(organ.id) ? 'opacity-80 scale-95 border-emerald-500 ring-2 ring-emerald-400/40' : 'hover:scale-[1.02] hover:border-amber-400'
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="text-3xl">{{ organ.emoji }}</span>
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-black/40">
                {{ isMatched(organ.id) ? '✅ MATCHED!' : 'Tap to Pick' }}
              </span>
            </div>

            <div>
              <h4 class="text-base font-extrabold text-white">{{ organ.name }}</h4>
              <p class="text-xs text-stone-200 mt-1 leading-relaxed">
                {{ organ.superpower }}
              </p>
            </div>

            <!-- Fun Kid-Friendly Health Fact -->
            <div class="p-2.5 rounded-xl bg-black/40 text-[11px] text-stone-300 font-sans border border-white/5">
              💡 <em>{{ organ.funFact }}</em>
            </div>
          </div>
        }
      </div>

      <!-- Footer Reset -->
      <div class="flex items-center justify-between text-xs font-mono text-stone-400 pt-2 border-t border-white/10">
        <span>Grounded in Pediatric &amp; Senior Cognitive Ergonomics</span>
        <button (click)="restartGame()" class="text-amber-400 hover:underline cursor-pointer">
          Reset Game 🔄
        </button>
      </div>
    </div>
  `,
})
export class BodyExplorerGameComponent {
  readonly organs = ALL_AGES_ORGAN_CARDS;
  
  matchedOrganIds = signal<Set<string>>(new Set());
  currentRound = signal<number>(0);
  feedbackMessage = signal<string | null>(null);
  isSpeaking = signal<boolean>(false);

  matchedCount = computed(() => this.matchedOrganIds().size);
  isGameWon = computed(() => this.matchedCount() === this.organs.length);

  currentTargetOrgan = computed<IOrganCard>(() => {
    const unmatched = this.organs.filter(o => !this.matchedOrganIds().has(o.id));
    if (unmatched.length === 0) return this.organs[0];
    const idx = this.currentRound() % unmatched.length;
    return unmatched[idx];
  });

  isMatched(id: string): boolean {
    return this.matchedOrganIds().has(id);
  }

  selectOrgan(organ: IOrganCard): void {
    if (this.isGameWon()) return;

    const target = this.currentTargetOrgan();
    if (organ.id === target.id) {
      // Correct Match!
      const current = new Set(this.matchedOrganIds());
      current.add(organ.id);
      this.matchedOrganIds.set(current);
      this.feedbackMessage.set(`Awesome job! ${organ.name} matches perfectly! +1 Star ⭐`);
      this.currentRound.update(r => r + 1);

      setTimeout(() => this.feedbackMessage.set(null), 3000);
    } else {
      // Gentle Encouraging Guidance
      this.feedbackMessage.set(`Almost! That's ${organ.name}. Try looking for: "${target.clue}"`);
      setTimeout(() => this.feedbackMessage.set(null), 3500);
    }
  }

  speakCurrentClue(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (this.isSpeaking()) {
      window.speechSynthesis.cancel();
      this.isSpeaking.set(false);
      return;
    }

    const target = this.currentTargetOrgan();
    const utterance = new SpeechSynthesisUtterance(target.clue);
    utterance.rate = 0.85; // Warm, friendly, slow cadence
    utterance.pitch = 1.1;

    utterance.onend = () => this.isSpeaking.set(false);
    utterance.onerror = () => this.isSpeaking.set(false);

    this.isSpeaking.set(true);
    window.speechSynthesis.speak(utterance);
  }

  restartGame(): void {
    this.matchedOrganIds.set(new Set());
    this.currentRound.set(0);
    this.feedbackMessage.set(null);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking.set(false);
  }
}
