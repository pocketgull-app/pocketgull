import { Component, ChangeDetectionStrategy, signal, output, Injectable, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PatientStateService } from '../services/patient-state.service';

export interface IPostItNote {
  id: string;
  title: string;
  category: 'happiness' | 'vagal_calm' | 'elixir' | 'longevity';
  text: string;
  color: 'yellow' | 'mint' | 'rose' | 'lavender';
  rotation: number;
  pinnedArea?: string;
}

@Injectable({ providedIn: 'root' })
export class PostItService {
  notes = signal<IPostItNote[]>([
    {
      id: 'n_rx',
      title: '🎵 Mandatory Clinical Prescription',
      category: 'longevity',
      text: 'Prescribed: Actuarial Glee 12-Track Duet Singalong Album (+12.0 QALYs). Sing daily with partner/family for vagal co-regulation.',
      color: 'yellow',
      rotation: 0,
      pinnedArea: 'Universal Mandatory Rx'
    },
    {
      id: 'n1',
      title: '☀️ Morning Circadian Sun Reset',
      category: 'happiness',
      text: '15 mins outdoor sunlight within 30 min of waking to boost serotonin & anchor melatonin.',
      color: 'yellow',
      rotation: -2,
      pinnedArea: 'General Circadian'
    },
    {
      id: 'n2',
      title: '🫁 6.0 bpm Resonant Vagal Calm',
      category: 'vagal_calm',
      text: 'Inhale 5s, Exhale 5s for 5 minutes when feeling stress to boost HRV & calm amygdala.',
      color: 'mint',
      rotation: 2,
      pinnedArea: 'Vagus Nerve / Chest'
    },
    {
      id: 'n3',
      title: '🍵 Warm Ginger Jujube Elixir',
      category: 'elixir',
      text: 'Sip warm ginger jujube tea before 2 PM to kindle Agni and disperse Liver Qi stagnation.',
      color: 'rose',
      rotation: -1,
      pinnedArea: 'Spleen / Stomach'
    },
    {
      id: 'n4',
      title: '⌛ Multi-Generational Longevity Anchor',
      category: 'longevity',
      text: 'Every healthy choice today adds quality years to your family story (+7.2 QALYs).',
      color: 'lavender',
      rotation: 3,
      pinnedArea: 'Epigenetic Lineage'
    }
  ]);
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-post-it-notes',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent],
  template: `
    <!-- Screen View Modal Container -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in font-mono print:static print:bg-white print:p-0 print:block">
      
      <!-- Dieter Rams Braun Functional Shell -->
      <div class="w-full max-w-5xl max-h-[92vh] bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col font-['Inter'] text-zinc-100 print:max-w-none print:max-h-none print:bg-white print:text-black print:border-none print:shadow-none print:rounded-none">
        
        <!-- Header (Screen Only) -->
        <div class="p-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between font-mono no-print">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 text-orange-400 flex items-center justify-center text-xl font-bold shadow-inner">
              📌
            </div>
            <div>
              <h2 class="text-base font-black uppercase tracking-wide text-zinc-100">Interactive Prescription Post-It Notes</h2>
              <p class="text-xs text-zinc-400 font-sans mt-0.5">Tactile visual sticky notes to pin to refrigerators, mirrors, or desks for daily health anchors</p>
            </div>
          </div>
          <button (click)="closeModal.emit()" class="text-zinc-400 hover:text-white text-2xl font-semibold p-1 cursor-pointer">
            &times;
          </button>
        </div>

        <!-- Printable Document Header (Print Only) -->
        <div class="hidden print:block p-6 border-b-2 border-slate-900 mb-4 font-mono">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-black uppercase tracking-wider text-slate-900">📌 Pocket-Gull Prescription Sticky Notes</h1>
              <p class="text-xs text-slate-600 font-sans mt-1">
                Patient: <strong class="uppercase text-slate-900 font-mono">{{ state.patientName() || 'Active Encounter' }}</strong> · 
                Issued: {{ todayDate }} · 
                Instructions: <em>Cut along dashed lines and pin to refrigerator, mirror, or workspace.</em>
              </p>
            </div>
            <div class="text-right text-[10px] text-slate-500 font-mono">
              <span class="block font-bold uppercase">HIPAA Compliant Cutout Sheet</span>
              <span>Pocket-Gull Care Engine</span>
            </div>
          </div>
        </div>

        <!-- Main Body: Sticky Notes Board -->
        <div class="flex-1 p-6 overflow-y-auto bg-zinc-950 flex flex-col space-y-6 print:bg-white print:p-0 print:overflow-visible">
          
          <!-- Actions & Template Adders (Screen Only) -->
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 font-mono no-print">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-400">Quick Templates:</span>
              <button (click)="addTemplate('sun')" class="px-2.5 py-1 text-xs font-bold rounded bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-orange-400 hover:border-orange-500/40 transition cursor-pointer">
                + ☀️ Sun Reset
              </button>
              <button (click)="addTemplate('vagal')" class="px-2.5 py-1 text-xs font-bold rounded bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-emerald-400 hover:border-emerald-500/40 transition cursor-pointer">
                + 🫁 Vagal Calm
              </button>
              <button (click)="addTemplate('tea')" class="px-2.5 py-1 text-xs font-bold rounded bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-orange-400 hover:border-orange-500/40 transition cursor-pointer">
                + 🍵 Elixir Tea
              </button>
              <button (click)="addTemplate('hawking')" class="px-2.5 py-1 text-xs font-bold rounded bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-sky-400 hover:border-sky-500/40 transition cursor-pointer">
                + 🎵 Hawking / Stars
              </button>
              <button (click)="addTemplate('water')" class="px-2.5 py-1 text-xs font-bold rounded bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-sky-400 hover:border-sky-500/40 transition cursor-pointer">
                + 🌊 Lao Tzu Water
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button (click)="printNotes()" class="px-4 py-2 text-xs font-bold uppercase rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 transition shadow-md cursor-pointer border border-orange-400/50 flex items-center gap-2">
                <span>📄</span> Print Replica Sheet
              </button>
            </div>
          </div>

          <!-- Screen Sticky Notes Grid (Screen Only) -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-2 no-print">
            <div *ngFor="let note of notes(); let i = index" 
              [style.transform]="'rotate(' + note.rotation + 'deg)'"
              class="relative p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl transition-all duration-200 flex flex-col justify-between min-h-[220px] group cursor-grab hover:border-orange-500/40">
              
              <!-- Tape Pin Top Header -->
              <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-orange-500/80 rounded border border-orange-400/60 shadow-sm transform -rotate-1"></div>

              <div class="space-y-3 font-mono">
                <div class="flex items-start justify-between">
                  <h4 class="text-xs font-extrabold text-white leading-snug font-sans">{{ note.title }}</h4>
                  <button (click)="deleteNote(note.id)" class="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white text-xs font-bold transition cursor-pointer">
                    &times;
                  </button>
                </div>
                
                <p class="text-xs text-zinc-300 font-sans leading-relaxed">
                  {{ note.text }}
                </p>
              </div>

              <!-- Pin Location Badge -->
              <div class="pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] font-bold font-mono text-zinc-400">
                <span>📍 {{ note.pinnedArea || 'Body & Mind' }}</span>
                <span class="uppercase text-orange-400">Rx Note</span>
              </div>
            </div>
          </div>

          <!-- High-Contrast Printable Cutout Grid (Print Only) -->
          <div class="hidden print:grid grid-cols-2 gap-6 p-4">
            <div *ngFor="let note of notes()"
              [class.bg-amber-50]="note.color === 'yellow'"
              [class.border-amber-300]="note.color === 'yellow'"
              [class.bg-emerald-50]="note.color === 'mint'"
              [class.border-emerald-300]="note.color === 'mint'"
              [class.bg-rose-50]="note.color === 'rose'"
              [class.border-rose-300]="note.color === 'rose'"
              [class.bg-purple-50]="note.color === 'lavender'"
              [class.border-purple-300]="note.color === 'lavender'"
              class="relative p-6 rounded-2xl border-2 border-dashed shadow-sm flex flex-col justify-between min-h-[260px] text-slate-900 break-inside-avoid">
              
              <!-- Printable Scissors & Tape Bar -->
              <div class="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-3 pb-2 border-b border-slate-300/60">
                <span>✂️ Cut along line</span>
                <span class="px-2 py-0.5 rounded bg-amber-200/80 border border-amber-300 font-bold uppercase text-amber-900">
                  📌 Tape Anchor
                </span>
                <span>Rx #{{ note.id }}</span>
              </div>

              <div class="space-y-3">
                <h3 class="text-sm font-extrabold text-slate-900 leading-snug font-sans flex items-center gap-2">
                  {{ note.title }}
                </h3>
                <p class="text-xs text-slate-800 font-sans leading-relaxed">
                  {{ note.text }}
                </p>
              </div>

              <div class="pt-4 mt-4 border-t border-slate-300/80 flex items-center justify-between text-[10.5px] font-bold font-mono text-slate-700">
                <span>📍 Anchor: {{ note.pinnedArea || 'Refrigerator / Mirror' }}</span>
                <span class="uppercase font-extrabold text-slate-900">Pocket-Gull Rx</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Printable Document Footer (Print Only) -->
        <div class="hidden print:block p-4 border-t border-slate-300 text-center font-mono text-[10px] text-slate-500">
          Pocket-Gull Clinical Intelligence System · Multimodal Healthspan Anchors · Verified HIPAA-Compliant Printout
        </div>

        <!-- Footer (Screen Only) -->
        <div class="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between font-mono text-xs text-zinc-400 no-print">
          <span>Print or pin these 3D Post-Its for continuous health & happiness anchors</span>
          <pocket-gull-button (click)="closeModal.emit()" variant="secondary" size="sm">
            Close Notes
          </pocket-gull-button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    @media print {
      body * {
        visibility: hidden;
      }
      app-post-it-notes, app-post-it-notes * {
        visibility: visible;
      }
      app-post-it-notes {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  `]
})
export class PostItNotesComponent {
  closeModal = output<void>();
  protected readonly state = inject(PatientStateService);

  todayDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  notes = signal<IPostItNote[]>([
    {
      id: 'n_rx',
      title: '🎵 Mandatory Clinical Prescription',
      category: 'longevity',
      text: 'Prescribed: Actuarial Glee 12-Track Duet Singalong Album (+12.0 QALYs). Sing daily with partner/family for vagal co-regulation.',
      color: 'yellow',
      rotation: 0,
      pinnedArea: 'Universal Mandatory Rx'
    },
    {
      id: 'n1',
      title: '☀️ Morning Circadian Sun Reset',
      category: 'happiness',
      text: '15 mins outdoor sunlight within 30 min of waking to boost serotonin & anchor melatonin.',
      color: 'yellow',
      rotation: -2,
      pinnedArea: 'General Circadian'
    },
    {
      id: 'n2',
      title: '🫁 6.0 bpm Resonant Vagal Calm',
      category: 'vagal_calm',
      text: 'Inhale 5s, Exhale 5s for 5 minutes when feeling stress to boost HRV & calm amygdala.',
      color: 'mint',
      rotation: 2,
      pinnedArea: 'Vagus Nerve / Chest'
    },
    {
      id: 'n3',
      title: '🍵 Warm Ginger Jujube Elixir',
      category: 'elixir',
      text: 'Sip warm ginger jujube tea before 2 PM to kindle Agni and disperse Liver Qi stagnation.',
      color: 'rose',
      rotation: -1,
      pinnedArea: 'Spleen / Stomach'
    },
    {
      id: 'n4',
      title: '⌛ Multi-Generational Longevity Anchor',
      category: 'longevity',
      text: 'Every healthy choice today adds quality years to your family story (+7.2 QALYs).',
      color: 'lavender',
      rotation: 3,
      pinnedArea: 'Epigenetic Lineage'
    }
  ]);

  addTemplate(type: 'sun' | 'vagal' | 'tea' | 'hawking' | 'water') {
    const id = 'n_' + Date.now();
    if (type === 'sun') {
      this.notes.update(list => [...list, {
        id,
        title: '🌅 Morning Light Walk',
        category: 'happiness',
        text: 'Walk 10 mins outdoors in early morning light without sunglasses for peak alertness.',
        color: 'yellow',
        rotation: Math.floor(Math.random() * 6) - 3,
        pinnedArea: 'Circadian Eye Path'
      }]);
    } else if (type === 'vagal') {
      this.notes.update(list => [...list, {
        id,
        title: '🫁 Resonant Breathing Break',
        category: 'vagal_calm',
        text: 'Take 6 deep resonant breaths before meals to activate parasympathetic digestion.',
        color: 'mint',
        rotation: Math.floor(Math.random() * 6) - 3,
        pinnedArea: 'Vagus Nervous System'
      }]);
    } else if (type === 'tea') {
      this.notes.update(list => [...list, {
        id,
        title: '🍵 Warm Jujube & Cardamom Elixir',
        category: 'elixir',
        text: 'Sip warm jujube tea to soothe Stomach Vata and harmonize digestion.',
        color: 'rose',
        rotation: Math.floor(Math.random() * 6) - 3,
        pinnedArea: 'Digestive Axis'
      }]);
    } else if (type === 'hawking') {
      this.notes.update(list => [...list, {
        id,
        title: '⭐ Stephen Hawking Star-Gazing',
        category: 'longevity',
        text: 'Look up at the stars rather than down at your feet. Curiosity keeps human spirit alive.',
        color: 'lavender',
        rotation: Math.floor(Math.random() * 6) - 3,
        pinnedArea: 'Cosmic Perspective'
      }]);
    } else if (type === 'water') {
      this.notes.update(list => [...list, {
        id,
        title: '🌊 Lao Tzu Be Like Water',
        category: 'vagal_calm',
        text: 'Water overcomes hard stone by yielding without resistance. Smooth away inner tension.',
        color: 'mint',
        rotation: Math.floor(Math.random() * 6) - 3,
        pinnedArea: 'TCM Qi Flow'
      }]);
    }
  }

  deleteNote(id: string) {
    this.notes.update(list => list.filter(n => n.id !== id));
  }

  printNotes() {
    window.print();
  }
}
