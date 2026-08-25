import { Component, ChangeDetectionStrategy, signal, computed, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

export type StorybookReadingStyle = 'classic' | 'bionic' | 'dyslexic' | 'audiobook';

export interface IStorybookChapter {
  chapterNumber: number;
  romanNumeral: string;
  title: string;
  subtitle: string;
  icon: string;
  summary: string;
  paragraphs: string[];
  keyTakeaways: string[];
}

@Component({
  selector: 'app-patient-health-trajectory-storybook',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-4xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-amber-50/50 dark:bg-zinc-950 border-2 border-amber-200/80 dark:border-zinc-800 shadow-2xl font-sans relative overflow-hidden">
      
      <!-- Ambient Hardcover Book Background Glow -->
      <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

      <!-- Storybook Header & Reading Style Controls -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-amber-200/60 dark:border-zinc-800 pb-5 mb-6 relative z-10 font-mono">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">📖</span>
            <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 uppercase tracking-widest">
              Clinical Trajectory Biography
            </span>
          </div>
          <h2 class="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-amber-100 mt-1">
            The Health Story of {{ activePatientName() }}
          </h2>
          <p class="text-xs text-slate-600 dark:text-zinc-400 font-sans mt-0.5">
            An interactive, narrative-driven clinical biography with adaptive cognitive reading styles.
          </p>
        </div>

        <!-- 4 Reading Style Selection Bar -->
        <div class="flex flex-wrap items-center gap-1.5 shrink-0 bg-white/80 dark:bg-zinc-900 p-1.5 rounded-2xl border border-amber-200 dark:border-zinc-800 shadow-sm">
          <button (click)="setReadingStyle('classic')"
            [class.bg-amber-600]="readingStyle() === 'classic'"
            [class.text-white]="readingStyle() === 'classic'"
            [class.text-slate-700]="readingStyle() !== 'classic'"
            [class.dark:text-zinc-300]="readingStyle() !== 'classic'"
            class="px-3 py-1.5 text-[11px] font-bold uppercase rounded-xl transition cursor-pointer flex items-center gap-1">
            <span>📜</span> Classic
          </button>
          <button (click)="setReadingStyle('bionic')"
            [class.bg-indigo-600]="readingStyle() === 'bionic'"
            [class.text-white]="readingStyle() === 'bionic'"
            [class.text-slate-700]="readingStyle() !== 'bionic'"
            [class.dark:text-zinc-300]="readingStyle() !== 'bionic'"
            class="px-3 py-1.5 text-[11px] font-bold uppercase rounded-xl transition cursor-pointer flex items-center gap-1">
            <span>⚡</span> Bionic
          </button>
          <button (click)="setReadingStyle('dyslexic')"
            [class.bg-emerald-600]="readingStyle() === 'dyslexic'"
            [class.text-white]="readingStyle() === 'dyslexic'"
            [class.text-slate-700]="readingStyle() !== 'dyslexic'"
            [class.dark:text-zinc-300]="readingStyle() !== 'dyslexic'"
            class="px-3 py-1.5 text-[11px] font-bold uppercase rounded-xl transition cursor-pointer flex items-center gap-1">
            <span>🧩</span> Dyslexic
          </button>
          <button (click)="setReadingStyle('audiobook')"
            [class.bg-purple-600]="readingStyle() === 'audiobook'"
            [class.text-white]="readingStyle() === 'audiobook'"
            [class.text-slate-700]="readingStyle() !== 'audiobook'"
            [class.dark:text-zinc-300]="readingStyle() !== 'audiobook'"
            class="px-3 py-1.5 text-[11px] font-bold uppercase rounded-xl transition cursor-pointer flex items-center gap-1">
            <span>🎧</span> Audio
          </button>
        </div>
      </div>

      <!-- Chapter Navigation Tabs & Scrubber -->
      <div class="flex items-center justify-between gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar relative z-10 font-mono">
        <div class="flex items-center gap-2">
          @for (ch of chapters; track ch.chapterNumber) {
            <button (click)="activeChapterIndex.set($index)"
              [class.bg-amber-700]="activeChapterIndex() === $index && readingStyle() === 'classic'"
              [class.bg-indigo-600]="activeChapterIndex() === $index && readingStyle() !== 'classic'"
              [class.text-white]="activeChapterIndex() === $index"
              [class.bg-white]="activeChapterIndex() !== $index"
              [class.dark:bg-zinc-900]="activeChapterIndex() !== $index"
              [class.text-slate-700]="activeChapterIndex() !== $index"
              [class.dark:text-zinc-300]="activeChapterIndex() !== $index"
              class="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-amber-300/60 dark:border-zinc-800 transition cursor-pointer shrink-0 flex items-center gap-1.5">
              <span>{{ ch.icon }}</span>
              <span>Ch. {{ ch.romanNumeral }}</span>
            </button>
          }
        </div>

        <!-- Speech Narration Audio Player Controls -->
        @if (readingStyle() === 'audiobook') {
          <div class="flex items-center gap-2 bg-purple-950/40 p-1.5 px-3 rounded-xl border border-purple-500/30 text-purple-200 text-xs shrink-0">
            <button (click)="toggleAudiobookSpeech()"
              class="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase text-[10px] tracking-wider transition cursor-pointer flex items-center gap-1">
              <span>{{ isSpeechSpeaking() ? '⏸ Pause' : '▶ Play Narration' }}</span>
            </button>
            <span class="text-[10px] font-mono opacity-80">528 Hz Solfeggio Tone Active</span>
          </div>
        }
      </div>

      <!-- Active Chapter Storybook Page Container -->
      @if (currentChapter(); as ch) {
        <div class="p-6 sm:p-8 rounded-2xl border transition-all duration-300 relative z-10 shadow-inner"
             [class.bg-amber-100\/40]="readingStyle() === 'classic'"
             [class.border-amber-300\/60]="readingStyle() === 'classic'"
             [class.dark:bg-zinc-900\/80]="readingStyle() === 'classic'"
             [class.dark:border-amber-900\/40]="readingStyle() === 'classic'"
             [class.font-serif]="readingStyle() === 'classic'"
             
             [class.bg-white]="readingStyle() === 'bionic'"
             [class.dark:bg-zinc-900]="readingStyle() === 'bionic'"
             [class.border-indigo-200]="readingStyle() === 'bionic'"
             [class.dark:border-indigo-900\/40]="readingStyle() === 'bionic'"
             
             [class.bg-emerald-50\/40]="readingStyle() === 'dyslexic'"
             [class.dark:bg-zinc-900]="readingStyle() === 'dyslexic'"
             [class.border-emerald-300\/60]="readingStyle() === 'dyslexic'"
             [class.dark:border-emerald-900\/40]="readingStyle() === 'dyslexic'"
             [class.leading-loose]="readingStyle() === 'dyslexic'"
             [class.tracking-wide]="readingStyle() === 'dyslexic'"
             
             [class.bg-purple-950\/20]="readingStyle() === 'audiobook'"
             [class.dark:bg-zinc-900]="readingStyle() === 'audiobook'"
             [class.border-purple-300\/60]="readingStyle() === 'audiobook'"
             [class.dark:border-purple-900\/40]="readingStyle() === 'audiobook'">

          <!-- Chapter Header -->
          <div class="border-b border-amber-200/60 dark:border-zinc-800 pb-4 mb-6">
            <div class="flex items-center justify-between gap-2">
              <span class="font-mono text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400">
                Chapter {{ ch.romanNumeral }} • {{ ch.subtitle }}
              </span>
              <span class="text-xs font-mono text-slate-500 dark:text-zinc-500">
                Page {{ ch.chapterNumber }} of 4
              </span>
            </div>
            <h3 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-amber-100 mt-1">
              {{ ch.title }}
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 font-medium">
              {{ ch.summary }}
            </p>
          </div>

          <!-- Chapter Narrative Prose -->
          <div class="space-y-4 text-sm sm:text-base leading-relaxed text-slate-800 dark:text-zinc-200">
            @for (p of ch.paragraphs; track $index) {
              <p [class.first-letter:text-4xl]="readingStyle() === 'classic' && $index === 0"
                 [class.first-letter:font-serif]="readingStyle() === 'classic' && $index === 0"
                 [class.first-letter:text-amber-600]="$index === 0"
                 [class.first-letter:mr-2]="$index === 0"
                 [class.first-letter:float-left]="$index === 0"
                 [innerHTML]="formatParagraphText(p)"></p>
            }
          </div>

          <!-- Key Clinical Takeaways Badge Grid -->
          <div class="mt-8 pt-6 border-t border-amber-200/60 dark:border-zinc-800">
            <span class="text-xs font-mono font-bold uppercase tracking-widest text-amber-800 dark:text-amber-400 block mb-3">
              🎯 Chapter Key Insights
            </span>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              @for (takeaway of ch.keyTakeaways; track $index) {
                <div class="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-amber-200 dark:border-zinc-700 text-xs font-mono flex items-start gap-2 shadow-sm">
                  <span class="text-amber-600 dark:text-amber-400 font-bold">✓</span>
                  <span class="text-slate-800 dark:text-zinc-200 font-medium">{{ takeaway }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Storybook Page Flip Navigation Footer -->
          <div class="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-amber-200/60 dark:border-zinc-800 font-mono text-xs">
            <button (click)="prevChapter()" [disabled]="activeChapterIndex() === 0"
              class="px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 font-bold uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-100 dark:hover:bg-zinc-700 cursor-pointer flex items-center gap-1.5">
              ‹ Previous Chapter
            </button>
            <span class="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest">
              Chapter {{ activeChapterIndex() + 1 }} of {{ chapters.length }}
            </span>
            <button (click)="nextChapter()" [disabled]="activeChapterIndex() === chapters.length - 1"
              class="px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 font-bold uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-100 dark:hover:bg-zinc-700 cursor-pointer flex items-center gap-1.5">
              Next Chapter ›
            </button>
          </div>

        </div>
      }

    </div>
  `
})
export class PatientHealthTrajectoryStorybookComponent implements OnDestroy {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  readingStyle = signal<StorybookReadingStyle>('classic');
  activeChapterIndex = signal<number>(0);
  isSpeechSpeaking = signal<boolean>(false);
  private speechUtterance: SpeechSynthesisUtterance | null = null;

  chapters: IStorybookChapter[] = [
    {
      chapterNumber: 1,
      romanNumeral: 'I',
      title: 'The Ancestral Origin & Initial Baseline',
      subtitle: 'Genetic Lineage & Vital Posture',
      icon: '🌱',
      summary: 'Exploring patient inherited DNA markers, baseline vital stability, and primary physiological triggers.',
      paragraphs: [
        'Every health journey begins long before the first symptoms emerge. Inherited DNA taproots, such as maternal MTHFR C677T methylation variants and ancestral SOD2 antioxidant defenses, set the biological baseline.',
        'At baseline evaluation, physiological vitals remained stable (BP 124/80 mmHg, HR 72 BPM, SpO2 98%). However, chronic oxidative stress and mitochondrial fatigue began creating subtle physiological friction.',
        'By mapping these ancestral roots early, we align clinical interventions directly with your biological constitution.'
      ],
      keyTakeaways: [
        'MTHFR C677T Heterozygous Variant Identified',
        'Baseline Vitals Hemodynamically Stable',
        'Mitochondrial ATP Reserve Targeted for Support'
      ]
    },
    {
      chapterNumber: 2,
      romanNumeral: 'II',
      title: 'The Diagnostic Turning Point',
      subtitle: 'Multi-Paradigm Lab Findings & Telemetry',
      icon: '🔬',
      summary: 'Unveiling deep laboratory biomarkers, cost-benefit trade-offs, and PhysioNet electrophysiology waveforms.',
      paragraphs: [
        'Laboratory profiling revealed key orthomolecular shifts: serum magnesium levels measured at 1.9 mg/dL while Vitamin D3 registered at 28 ng/mL. High-sensitivity C-reactive protein (hs-CRP) indicated low-grade systemic inflammation.',
        'Continuous PhysioNet electrophysiology telemetry registered a healthy 92 ms QRS interval with neutral ST-segment deviation (+0.04 mV), confirming cardiac electrical stability.',
        'Cross-referencing Western Allopathic lab values with Eastern TCM Zang-Fu Qi profiles pinpointed a primary Liver-Spleen disharmony.'
      ],
      keyTakeaways: [
        'Magnesium & Vitamin D3 Cofactors Low',
        'PhysioNet ECG Signals Electrically Stable',
        'Eastern TCM Qi Disharmony Pinpointed'
      ]
    },
    {
      chapterNumber: 3,
      romanNumeral: 'III',
      title: 'The Therapeutic Quest & Daily Care',
      subtitle: 'Somatic Vagus Cooling & Chrono-Nutrition',
      icon: '🛡️',
      summary: 'Executing 3-tiered protocol cards, 4-7-8 bio-breathing entrainment, and anti-inflammatory recipes.',
      paragraphs: [
        'With diagnostic clarity established, the therapeutic quest began. Protocol tier one prescribed daily Magnesium Glycinate (400mg) and Liposomal Curcumin to dampen inflammatory cascades.',
        'To regulate the autonomic nervous system, 60-second carotid cold vagus cooling and 4-7-8 bio-breathing pacer sessions were integrated into daily routines.',
        'A 7-day chrono-nutrition meal schedule prioritized Pacific Northwest wild-caught salmon and golden turmeric elixirs.'
      ],
      keyTakeaways: [
        '400mg Magnesium Glycinate Prescribed',
        '4-7-8 Bio-Breathing Regulates Vagal Tone',
        'Anti-Inflammatory Chrono-Nutrition Active'
      ]
    },
    {
      chapterNumber: 4,
      romanNumeral: 'IV',
      title: 'The Future Vitality Horizon',
      subtitle: 'Predicted Vitality Score & Retest Milestone',
      icon: '🌅',
      summary: 'Projecting long-term health trajectory, 90-day vitality milestones, and continuous re-evaluation.',
      paragraphs: [
        'Looking forward toward the 90-day horizon, adhering to functional protocols projects a 91% Optimum Vitality Score, marked by improved cellular energy and deep sleep architecture.',
        'Key follow-up milestones include a 30-day serum biomarker re-check and a 90-day comprehensive care plan re-evaluation.',
        'Your health story remains an ongoing, evolving tapestry of resilience, balance, and empirical vitality.'
      ],
      keyTakeaways: [
        '91% Projected 90-Day Vitality Score',
        '30-Day Serum Biomarker Re-Check Scheduled',
        'Continuous Health Progression Tracked'
      ]
    }
  ];

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Charles Darwin';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Charles Darwin';
  });

  currentChapter = computed(() => this.chapters[this.activeChapterIndex()]);

  setReadingStyle(style: StorybookReadingStyle) {
    this.readingStyle.set(style);
    if (style !== 'audiobook' && this.isSpeechSpeaking()) {
      this.stopSpeech();
    }
  }

  prevChapter() {
    if (this.activeChapterIndex() > 0) {
      this.activeChapterIndex.update(i => i - 1);
      if (this.readingStyle() === 'audiobook') this.playAudiobookSpeech();
    }
  }

  nextChapter() {
    if (this.activeChapterIndex() < this.chapters.length - 1) {
      this.activeChapterIndex.update(i => i + 1);
      if (this.readingStyle() === 'audiobook') this.playAudiobookSpeech();
    }
  }

  formatParagraphText(text: string): string {
    // XSS-safe: strip all HTML tags before applying bionic formatting
    let sanitized = '';
    let inTag = false;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '<') { inTag = true; continue; }
      if (text[i] === '>') { inTag = false; continue; }
      if (!inTag) sanitized += text[i];
    }

    if (this.readingStyle() === 'bionic') {
      return sanitized.replace(/\b([A-Za-z]{1,3})([A-Za-z]*)\b/g, '<strong class="font-extrabold text-indigo-600 dark:text-indigo-400">$1</strong>$2');
    }
    return sanitized;
  }

  toggleAudiobookSpeech() {
    if (this.isSpeechSpeaking()) {
      this.stopSpeech();
    } else {
      this.playAudiobookSpeech();
    }
  }

  private playAudiobookSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const ch = this.currentChapter();
      const textToRead = `Chapter ${ch.romanNumeral}: ${ch.title}. ${ch.summary}. ${ch.paragraphs.join(' ')}`;
      this.speechUtterance = new SpeechSynthesisUtterance(textToRead);
      this.speechUtterance.rate = 0.95;
      this.speechUtterance.onend = () => this.isSpeechSpeaking.set(false);
      this.speechUtterance.onerror = () => this.isSpeechSpeaking.set(false);
      window.speechSynthesis.speak(this.speechUtterance);
      this.isSpeechSpeaking.set(true);
    }
  }

  private stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeechSpeaking.set(false);
    }
  }

  ngOnDestroy() {
    this.stopSpeech();
  }
}
