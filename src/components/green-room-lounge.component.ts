import { Component, ChangeDetectionStrategy, inject, signal, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OshaWorkplaceSafetyService } from '../services/osha-workplace-safety.service';
import { APP_VERSION } from '../version';

export interface IGreenRoomReflection {
  id: string;
  author: string;
  role: 'Clinician' | 'Caregiver' | 'Patient' | 'Peer Support';
  timestamp: string;
  reflectionText: string;
  category: 'Gratitude' | 'Shift Debrief' | 'Hero Story' | 'Compassion';
}

@Component({
  selector: 'app-green-room-lounge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-3xl p-6 sm:p-10 flex flex-col justify-between overflow-y-auto font-mono text-zinc-100 animate-in fade-in duration-300">
      
      <!-- Top Navigation Header (Dieter Rams Braun Aesthetic) -->
      <div class="flex items-center justify-between gap-4 pb-6 border-b border-zinc-800 font-mono">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 text-orange-400 flex items-center justify-center text-xl font-bold shadow-inner">
            🌿
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold uppercase tracking-widest text-orange-400">Green Room Clinician & Patient Lounge</span>
              <span class="text-[9.5px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 uppercase">Restorative Debrief</span>
            </div>
            <h2 class="text-base font-black uppercase text-zinc-100 tracking-wide mt-0.5">The Green Room — Written Reflections</h2>
          </div>
        </div>

        <div class="flex items-center gap-3 font-mono">
          <button (click)="openGleeAlbum.emit()"
            class="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-orange-400/50">
            🎵 Acoustic Duet
          </button>

          <button (click)="closeModal.emit()"
            class="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white font-bold flex items-center justify-center transition cursor-pointer text-base">
            ✕
          </button>
        </div>
      </div>

      <!-- OSHA Compliance Banner -->
      <div class="my-6 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div class="flex items-center gap-2 text-zinc-300">
          <span>👷 OSHA Worker & Patient Safety Index:</span>
          <span class="font-bold text-orange-400">{{ osha().oshaComplianceScorePercent }}% Compliant</span>
          <span>(KSS Level {{ osha().currentKssLevel }}/9 — {{ osha().clinicianFatigueCapOk ? 'Shift Fatigue Safe' : 'Rest Advised' }})</span>
        </div>
        <div class="text-zinc-400 font-mono">
          Air Quality: {{ osha().environmentalAirQualityIndex }} AQI · Posture: {{ osha().ergonomicPostureStatus }}
        </div>
      </div>

      <!-- Written Reflection Cards Grid -->
      <div class="my-4 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        @for (card of reflections(); track card.id) {
          <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-950 text-orange-400 border border-zinc-800">
                  {{ card.category }}
                </span>
                <span class="text-[10px] font-mono text-zinc-400">{{ card.timestamp }}</span>
              </div>
              <p class="text-xs text-zinc-300 leading-relaxed font-sans italic">
                "{{ card.reflectionText }}"
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-300">
              <span class="font-bold">— {{ card.author }}</span>
              <span class="text-zinc-400">({{ card.role }})</span>
            </div>
          </div>
        }
      </div>

      <!-- Add New Written Reflection Note -->
      <div class="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 my-4 font-mono">
        <h4 class="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3 flex items-center gap-2">
          <span>✍️</span> Add a Written Reflection Card to the Green Room Wall
        </h4>
        <div class="flex flex-col sm:flex-row gap-3">
          <input #reflectionInput type="text" placeholder="Write a message of gratitude, shift encouragement, or patient hero reflection..."
            class="flex-1 py-3 px-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 font-sans">
          <button (click)="addReflection(reflectionInput.value); reflectionInput.value=''"
            class="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-orange-400/50 shrink-0">
            Publish Reflection 🌿
          </button>
        </div>
      </div>

      <!-- Bottom Status Bar -->
      <div class="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-400">
        <div>Restorative Green Room Lounge · Pocket-Gull Clinician Care Engine v{{ appVersion }}</div>
        <div class="flex items-center gap-2">
          <span>GCP Project: gen-lang-client-0540208645</span>
        </div>
      </div>

    </div>
  `
})
export class GreenRoomLoungeComponent {
  appVersion = APP_VERSION;
  oshaService = inject(OshaWorkplaceSafetyService);

  closeModal = output<void>();
  openGleeAlbum = output<void>();

  readonly osha = computed(() => this.oshaService.evaluateOshaCompliance());

  readonly reflections = signal<IGreenRoomReflection[]>([
    {
      id: 'ref_1',
      author: 'Dr. Sarah Lin, MD',
      role: 'Clinician',
      timestamp: 'Today, 18:30',
      reflectionText: 'Complex metabolic case stabilized today through resonant 0.1 Hz vagal breathing and precision magnesium glycinate. Immensely grateful for our multidisciplinary care team.',
      category: 'Gratitude'
    },
    {
      id: 'ref_2',
      author: 'Nurse Marcus Vance, RN',
      role: 'Clinician',
      timestamp: 'Today, 16:15',
      reflectionText: 'Post-shift debrief: The Karolinska fatigue shield reminded us to take a 10-minute break. Staying grounded and supporting each other is how we deliver exceptional care.',
      category: 'Shift Debrief'
    },
    {
      id: 'ref_3',
      author: 'Elena & Family',
      role: 'Caregiver',
      timestamp: 'Yesterday, 19:45',
      reflectionText: 'Participating in the Actuarial Glee singalong duet brought so much joy and calm into our living room tonight. Thank you for treating our family with such human dignity.',
      category: 'Hero Story'
    }
  ]);

  addReflection(text: string) {
    if (!text || text.trim().length === 0) return;
    const newCard: IGreenRoomReflection = {
      id: `ref_${Date.now()}`,
      author: 'Clinician Contributor',
      role: 'Clinician',
      timestamp: 'Just now',
      reflectionText: text.trim(),
      category: 'Compassion'
    };
    this.reflections.update(cards => [newCard, ...cards]);
  }
}
