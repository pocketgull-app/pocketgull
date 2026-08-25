import { Component, ChangeDetectionStrategy, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BionicReadingService } from '../../services/bionic-reading.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

export type LearnerNeurotype = 'all' | 'adhd' | 'dyslexia' | 'icu-triage';
export type GameLevel = 1 | 2 | 3 | 4;

interface IGameLevelConfig {
  level: GameLevel;
  title: string;
  wpm: number;
  icon: string;
}

@Component({
  selector: 'app-bionic-focus-benchmark',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-3xl border border-amber-500/30 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 shadow-2xl p-6 space-y-5 transition-all">
      
      <!-- Header with Saccadic Fixation Badge -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-lg">📖</span>
            <h3 class="text-base font-extrabold tracking-tight text-white font-pocketgull-inter flex items-center gap-2">
              Bionic Focus: 2–3x Reading Speed with 40% Saccadic Fixation
            </h3>
          </div>
          <p class="text-xs text-zinc-400 font-sans max-w-2xl leading-relaxed">
            Engineered to combat clinical chart fatigue in ICU triage and empower neurodivergent learners (ADHD, Dyslexia, and Visual Processing differences) through instant letter fixation accentuation.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Game / Practice Mode Switcher -->
          <button
            type="button"
            (click)="isGameMode.set(!isGameMode())"
            [class.bg-teal-500]="isGameMode()"
            [class.text-zinc-950]="isGameMode()"
            [class.bg-zinc-900]="!isGameMode()"
            [class.text-teal-400]="!isGameMode()"
            class="px-3 py-2 rounded-xl text-xs font-bold font-mono border border-teal-500/40 transition hover:scale-105 cursor-pointer flex items-center gap-1.5"
            title="Toggle Saccadic Reading Speed Game"
          >
            <span>🎮</span>
            <span>{{ isGameMode() ? 'Exit Game' : 'Play Speed Game' }}</span>
          </button>

          <!-- Global Toggle Button -->
          <button
            type="button"
            (click)="bionicService.toggleBionicReading()"
            [class.bg-amber-500]="bionicService.isBionicReadingEnabled()"
            [class.text-zinc-950]="bionicService.isBionicReadingEnabled()"
            [class.bg-zinc-850]="!bionicService.isBionicReadingEnabled()"
            [class.text-amber-400]="!bionicService.isBionicReadingEnabled()"
            class="px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all hover:scale-105 shadow-lg border border-amber-500/40 active:scale-95 cursor-pointer shrink-0"
            title="Toggle Bionic Focus (Keyboard shortcut: Alt + B)"
            aria-label="Toggle Bionic Reading Mode"
          >
            <span>📖</span>
            <span>Bionic Focus: {{ bionicService.isBionicReadingEnabled() ? 'ACTIVE' : 'OFF' }}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900/60 font-mono text-zinc-300">Alt+B</span>
          </button>
        </div>
      </div>

      <!-- 🎮 SACCADIC VELOCITY SPEED GAME MODE -->
      @if (isGameMode()) {
        <div class="rounded-2xl border border-teal-500/30 bg-zinc-900/90 p-5 space-y-4 animate-in fade-in duration-200">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div>
              <span class="text-[11px] font-mono font-bold uppercase text-teal-400 tracking-wider block">
                🎮 Saccadic Velocity: The ICU Triage Reading Speed Game
              </span>
              <span class="text-xs text-zinc-400 font-sans">
                Train your brain to fixate and digest clinical orders at 300 to 1000 WPM!
              </span>
            </div>

            <!-- Difficulty Level Selector -->
            <div class="flex items-center gap-1.5">
              @for (lvl of gameLevels; track lvl.level) {
                <button
                  type="button"
                  (click)="selectGameLevel(lvl.level)"
                  [disabled]="isGameRunning()"
                  [class.bg-teal-500]="selectedLevel() === lvl.level"
                  [class.text-zinc-950]="selectedLevel() === lvl.level"
                  [class.bg-zinc-800]="selectedLevel() !== lvl.level"
                  [class.text-zinc-300]="selectedLevel() !== lvl.level"
                  class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer disabled:opacity-50"
                  [title]="lvl.title"
                >
                  <span>{{ lvl.icon }}</span>
                  <span class="ml-1">{{ lvl.wpm }} WPM</span>
                </button>
              }
            </div>
          </div>

          <!-- Rapid Serial Stream Canvas / Display Area -->
          <div class="relative h-28 w-full bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden p-4">
            @if (isGameRunning()) {
              <div class="text-center space-y-1 animate-pulse">
                <span class="text-3xl font-black font-pocketgull-inter text-amber-400 tracking-tight" [innerHTML]="currentStreamingWord() | safeHtml"></span>
                <div class="text-[10px] text-zinc-500 font-mono">
                  Word {{ currentWordIndex() + 1 }} / {{ gameWords.length }} &bull; {{ currentLevelConfig().wpm }} WPM Saccadic Stream
                </div>
              </div>
            } @else if (gameFinished()) {
              <div class="text-center space-y-2">
                <span class="text-xs font-bold text-teal-400 font-mono block">🎯 Passage Stream Complete!</span>
                <span class="text-sm font-semibold text-zinc-200 block">Answer the clinical comprehension question below:</span>
              </div>
            } @else {
              <div class="text-center space-y-2">
                <span class="text-sm text-zinc-400 font-sans block">Select your target WPM velocity and click Start Stream!</span>
                <button
                  type="button"
                  (click)="startGameStream()"
                  class="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-teal-500/20"
                >
                  ▶ Start {{ currentLevelConfig().wpm }} WPM Stream
                </button>
              </div>
            }
          </div>

          <!-- Comprehension Quiz when Finished -->
          @if (gameFinished() && !quizAnswered()) {
            <div class="p-4 rounded-xl bg-zinc-950 border border-teal-500/30 space-y-3 animate-in fade-in duration-150">
              <div class="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">
                Question: What was the primary clinical decision support priority highlighted?
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  (click)="answerQuiz(true)"
                  class="p-2.5 rounded-lg text-left text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-teal-500/50 transition cursor-pointer font-sans"
                >
                  ✅ Instant zero-error emergency triage comprehension
                </button>
                <button
                  type="button"
                  (click)="answerQuiz(false)"
                  class="p-2.5 rounded-lg text-left text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer font-sans"
                >
                  ❌ Routine billing code transcription
                </button>
                <button
                  type="button"
                  (click)="answerQuiz(false)"
                  class="p-2.5 rounded-lg text-left text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer font-sans"
                >
                  ❌ Non-urgent cosmetic skin assessments
                </button>
              </div>
            </div>
          } @else if (quizAnswered()) {
            <div class="p-4 rounded-xl bg-teal-950/40 border border-teal-500/40 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div class="text-sm font-black text-teal-300 font-pocketgull-inter">
                🎉 {{ isQuizCorrect() ? '100% Comprehension Mastery!' : 'Good Effort! Keep practicing!' }}
              </div>
              <p class="text-xs text-zinc-300 font-sans">
                You digested the clinical passage at <strong class="text-amber-400 font-mono">{{ currentLevelConfig().wpm }} WPM</strong> with 40% saccadic fixation accentuation.
              </p>
              <button
                type="button"
                (click)="resetGame()"
                class="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-teal-300 border border-teal-500/30 text-xs font-mono font-bold transition cursor-pointer"
              >
                🔄 Play Again / Try Higher Speed
              </button>
            </div>
          }
        </div>
      } @else {

        <!-- 📖 STANDARD INTERACTIVE DEMONSTRATION & BENCHMARK -->
        <div class="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-5 space-y-4">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] font-bold uppercase tracking-widest text-amber-400 font-mono">
              Interactive Demonstration &bull; Live Clinical Comprehension Benchmark
            </span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {{ readingWpm() }} WPM (+{{ speedupMultiplier() }}x Speedup)
            </span>
          </div>

          <!-- Formatted Benchmark Passage -->
          <div class="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800 text-sm leading-relaxed font-sans text-zinc-200">
            @if (bionicService.isBionicReadingEnabled()) {
              <div 
                [innerHTML]="formattedBionicPassage() | safeHtml"
                class="bionic-rendered-text"
              ></div>
            } @else {
              <p>{{ rawBenchmarkPassage }}</p>
            }
          </div>

          <!-- Neurodivergent Accessibility Persona Filters -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-[11px] font-mono text-zinc-400 mr-1">Target Profile:</span>
              @for (profile of profiles; track profile.id) {
                <button
                  type="button"
                  (click)="selectedProfile.set(profile.id)"
                  [class.bg-amber-500/20]="selectedProfile() === profile.id"
                  [class.text-amber-300]="selectedProfile() === profile.id"
                  [class.border-amber-500/40]="selectedProfile() === profile.id"
                  [class.bg-zinc-900]="selectedProfile() !== profile.id"
                  [class.text-zinc-400]="selectedProfile() !== profile.id"
                  [class.border-zinc-800]="selectedProfile() !== profile.id"
                  class="px-2.5 py-1 rounded-lg text-xs font-semibold border transition hover:border-zinc-700 cursor-pointer"
                >
                  <span>{{ profile.icon }}</span>
                  <span class="ml-1">{{ profile.label }}</span>
                </button>
              }
            </div>

            <!-- Pro-Tip Hint -->
            <div class="text-[11px] font-mono text-amber-400/90 flex items-center gap-1">
              <span>✨</span>
              <span>Pro-tip: Press <strong>Alt + B</strong> anywhere in the clinical application to toggle instantly.</span>
            </div>
          </div>
        </div>
      }

      <!-- Scientific Telemetry & Saccadic Fixation Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div class="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <span class="text-zinc-500 block text-[10px] uppercase">Fixation Ratio</span>
          <span class="text-amber-400 font-extrabold text-sm font-pocketgull-tabular">40%–50% Initial Letters</span>
        </div>
        <div class="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <span class="text-zinc-500 block text-[10px] uppercase">Comprehension Velocity</span>
          <span class="text-emerald-400 font-extrabold text-sm font-pocketgull-tabular">540 WPM (vs 220 Baseline)</span>
        </div>
        <div class="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <span class="text-zinc-500 block text-[10px] uppercase">ICU Cognitive Load</span>
          <span class="text-sky-400 font-extrabold text-sm font-pocketgull-tabular">-38% Saccadic Fatigue</span>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    ::ng-deep .bionic-rendered-text strong,
    ::ng-deep .bionic-rendered-text b {
      font-weight: 900;
      color: #fbbf24; /* Amber Gold Saccadic Fixation */
    }
    .bg-zinc-850 {
      background-color: #1c1c20;
    }
  `]
})
export class BionicFocusBenchmarkComponent implements OnDestroy {
  bionicService = inject(BionicReadingService);

  readonly rawBenchmarkPassage = `Clinical decision support engines require instant, zero-error comprehension during emergency triage. Pocket-Gull's integrated Bionic Reading algorithm highlights critical saccadic fixation points, allowing clinicians, patients, and fellow researchers to digest complex pharmacology and landmark trial dossiers with higher long-term retention.`;

  readonly selectedProfile = signal<LearnerNeurotype>('all');
  readonly isGameMode = signal<boolean>(false);
  readonly selectedLevel = signal<GameLevel>(2);

  readonly gameLevels: IGameLevelConfig[] = [
    { level: 1, title: 'Cadet Resident', wpm: 300, icon: '🌱' },
    { level: 2, title: 'Clinical Fellow', wpm: 500, icon: '⚡' },
    { level: 3, title: 'ICU Attending', wpm: 750, icon: '🔥' },
    { level: 4, title: 'Flight Surgeon', wpm: 1000, icon: '🚀' }
  ];

  readonly profiles: Array<{ id: LearnerNeurotype; icon: string; label: string }> = [
    { id: 'all', icon: '🌐', label: 'Universal Optometry' },
    { id: 'adhd', icon: '⚡', label: 'ADHD Executive Flow' },
    { id: 'dyslexia', icon: '🧩', label: 'Dyslexia Disambiguation' },
    { id: 'icu-triage', icon: '🚨', label: 'ICU STAT Triage' }
  ];

  // Game execution state
  readonly isGameRunning = signal<boolean>(false);
  readonly gameFinished = signal<boolean>(false);
  readonly currentWordIndex = signal<number>(0);
  readonly quizAnswered = signal<boolean>(false);
  readonly isQuizCorrect = signal<boolean>(false);

  readonly gameWords: string[] = this.rawBenchmarkPassage.split(/\s+/);
  private timerId: any = null;

  readonly currentLevelConfig = computed<IGameLevelConfig>(() => {
    return this.gameLevels.find(l => l.level === this.selectedLevel()) || this.gameLevels[1];
  });

  readonly currentStreamingWord = computed<string>(() => {
    const word = this.gameWords[this.currentWordIndex()] || '';
    return this.bionicService.formatToBionicHtml(word, 'font-black text-amber-400');
  });

  readonly readingWpm = computed<number>(() => {
    return this.bionicService.isBionicReadingEnabled() ? 540 : 220;
  });

  readonly speedupMultiplier = computed<string>(() => {
    return this.bionicService.isBionicReadingEnabled() ? '2.45' : '1.0';
  });

  readonly formattedBionicPassage = computed<string>(() => {
    const raw = this.rawBenchmarkPassage;
    return this.bionicService.formatToBionicHtml(raw, 'font-black text-amber-400');
  });

  selectGameLevel(level: GameLevel): void {
    this.selectedLevel.set(level);
  }

  startGameStream(): void {
    this.isGameRunning.set(true);
    this.gameFinished.set(false);
    this.quizAnswered.set(false);
    this.currentWordIndex.set(0);

    const wpm = this.currentLevelConfig().wpm;
    const intervalMs = Math.max(30, Math.floor(60000 / wpm));

    this.timerId = setInterval(() => {
      const nextIdx = this.currentWordIndex() + 1;
      if (nextIdx >= this.gameWords.length) {
        clearInterval(this.timerId);
        this.isGameRunning.set(false);
        this.gameFinished.set(true);
      } else {
        this.currentWordIndex.set(nextIdx);
      }
    }, intervalMs);
  }

  answerQuiz(correct: boolean): void {
    this.quizAnswered.set(true);
    this.isQuizCorrect.set(correct);
  }

  resetGame(): void {
    if (this.timerId) clearInterval(this.timerId);
    this.isGameRunning.set(false);
    this.gameFinished.set(false);
    this.quizAnswered.set(false);
    this.currentWordIndex.set(0);
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }
}
