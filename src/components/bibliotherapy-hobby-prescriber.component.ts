import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BioHapticFeedbackService } from '../services/hardware/bio-haptic-feedback.service';
import { ClinicalIconComponent } from './shared/clinical-icon.component';

export interface ITherapeuticHobby {
  snomedCode: string;
  name: string;
  category: 'craftsmanship' | 'nature' | 'art' | 'movement';
  icon: string;
  biomechanicalGoal: string;
  books: {
    title: string;
    author: string;
    description: string;
  }[];
  amazonQuery: string;
}

@Component({
  selector: 'app-bibliotherapy-hobby-prescriber',
  standalone: true,
  imports: [CommonModule, ClinicalIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-teal-500/40 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-extrabold shadow-inner">
            <app-clinical-icon name="Stethoscope" size="md" theme="western"></app-clinical-icon>
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2">
              SNOMED-CT Bibliotherapy & Therapeutic Hobby Prescriber
              <span class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">SIGCHI AAA ACCESSIBLE</span>
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Sweller Cognitive Load Optimization, SNOMED-CT activity prescribing, and evidence-grounded reading prescriptions.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold font-mono">
            Cognitive Load: Germane Optimized 🧠
          </span>
        </div>
      </div>

      <!-- Hobby Selection Ribbon -->
      <div class="flex flex-wrap items-center gap-2">
        @for (hobby of hobbies; track hobby.snomedCode) {
          <button (click)="selectHobby(hobby)"
                  [class.bg-teal-600]="selectedHobby().snomedCode === hobby.snomedCode"
                  [class.text-white]="selectedHobby().snomedCode === hobby.snomedCode"
                  [class.bg-gray-100]="selectedHobby().snomedCode !== hobby.snomedCode"
                  [class.dark:bg-zinc-800]="selectedHobby().snomedCode !== hobby.snomedCode"
                  [class.text-gray-700]="selectedHobby().snomedCode !== hobby.snomedCode"
                  [class.dark:text-zinc-300]="selectedHobby().snomedCode !== hobby.snomedCode"
                  class="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition cursor-pointer flex items-center gap-2 shadow-xs">
            <span>{{ hobby.icon }}</span>
            <span>{{ hobby.name }}</span>
          </button>
        }
      </div>

      <!-- Active Hobby Detail Card -->
      <div class="p-4 bg-slate-50/80 dark:bg-zinc-950/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ selectedHobby().icon }}</span>
              <h4 class="text-sm font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                {{ selectedHobby().name }}
              </h4>
              <span class="px-2 py-0.5 text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded font-bold">
                SNOMED: {{ selectedHobby().snomedCode }}
              </span>
            </div>
            <p class="text-xs text-gray-600 dark:text-zinc-400 mt-1">
              <strong>Biomechanical Goal:</strong> {{ selectedHobby().biomechanicalGoal }}
            </p>
          </div>

          <a [href]="amazonStoreUrl()" target="_blank" rel="noopener"
             class="min-h-[44px] min-w-[44px] px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md">
            <span>🛒 Recommended Supplies</span>
            <span class="text-[10px] font-mono opacity-80">(tag=pgdpo-20)</span>
          </a>
        </div>

        <!-- Bibliotherapy Books Grid -->
        <div class="space-y-2 pt-2">
          <h5 class="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-cyan-300 flex items-center gap-1.5">
            <span>📖 Prescribed Reading (Bibliotherapy)</span>
          </h5>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (book of selectedHobby().books; track book.title) {
              <div class="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
                <h6 class="text-xs font-black text-gray-900 dark:text-gray-100 leading-snug">
                  {{ book.title }}
                </h6>
                <p class="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
                  By {{ book.author }}
                </p>
                <p class="text-[11.5px] text-gray-600 dark:text-zinc-300 leading-relaxed italic">
                  "{{ book.description }}"
                </p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class BibliotherapyHobbyPrescriberComponent {
  private bioHaptic = inject(BioHapticFeedbackService);

  readonly hobbies: ITherapeuticHobby[] = [
    {
      snomedCode: 'SCTID 281084008',
      name: 'Woodworking & Hand Craftsmanship',
      category: 'craftsmanship',
      icon: '🪵',
      biomechanicalGoal: 'Fine motor coordination, tactile proprioceptive stimulation, and digital screen detox.',
      books: [
        {
          title: "The Anarchist's Tool Chest",
          author: 'Christopher Schwarz',
          description: 'A masterpiece on slow hand craftsmanship, tool mastery, and tactile neuro-grounding.'
        },
        {
          title: 'Why We Make Things and Why It Matters',
          author: 'Peter Korn',
          description: 'Explores the psychological flow state and restorative power of physical creation.'
        }
      ],
      amazonQuery: 'hand woodworking tools'
    },
    {
      snomedCode: 'SCTID 226065003',
      name: 'Botanical Horticulture & Soil Micro-Biome',
      category: 'nature',
      icon: '🌿',
      biomechanicalGoal: 'Environmental Mycobacterium vaccae exposure, circadian solar grounding, and cortisol reduction.',
      books: [
        {
          title: 'The Well-Gardened Mind',
          author: 'Sue Stuart-Smith',
          description: 'Neurobiological analysis of how tending plants restores brain chemistry and autonomic tone.'
        },
        {
          title: 'Braiding Sweetgrass',
          author: 'Robin Wall Kimmerer',
          description: 'Indigenous wisdom and botanical science on human-nature reciprocity.'
        }
      ],
      amazonQuery: 'organic gardening kit'
    },
    {
      snomedCode: 'SCTID 226071007',
      name: 'Ornithology & Acoustic Birdwatching',
      category: 'nature',
      icon: '🦜',
      biomechanicalGoal: 'Spatial visual tracking, auditory frequency discrimination, and peaceful vagal tone restoration.',
      books: [
        {
          title: 'The Genius of Birds',
          author: 'Jennifer Ackerman',
          description: 'Fascinating investigation into avian cognition, navigation, and problem-solving.'
        },
        {
          title: 'What the Robin Knows',
          author: 'Jon Young',
          description: 'Decoding bird language and acoustic environmental cues for deep mental presence.'
        }
      ],
      amazonQuery: 'birdwatching field guide'
    }
  ];

  readonly selectedHobby = signal<ITherapeuticHobby>(this.hobbies[0]);

  readonly amazonStoreUrl = computed(() => {
    const q = this.selectedHobby().amazonQuery;
    return `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=pgdpo-20`;
  });

  selectHobby(hobby: ITherapeuticHobby): void {
    this.selectedHobby.set(hobby);
    this.bioHaptic.triggerHapticPulse('inhale');
  }
}
