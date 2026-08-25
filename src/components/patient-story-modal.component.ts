import { Component, ChangeDetectionStrategy, signal, inject, output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { ClinicalStorytellingService, IPatientStory, IStoryAct } from '../services/clinical-storytelling.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-patient-story-modal',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in font-mono">
      
      <!-- Dieter Rams Braun Functional Reader Shell -->
      <div class="w-full max-w-4xl max-h-[92vh] bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col font-['Inter'] text-zinc-100">
        
        <!-- Header -->
        <div class="p-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between font-mono">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 text-orange-400 flex items-center justify-center text-xl font-bold shadow-inner">
              📖
            </div>
            <div>
              <h2 class="text-base font-black uppercase text-zinc-100 tracking-wide">Patient Narrative Healthspan Story</h2>
              <p class="text-xs text-zinc-400 font-sans mt-0.5">3-Act Narrative Synthesis & Actuarial Longevity Projection</p>
            </div>
          </div>
          <button (click)="closeModal.emit()" class="text-zinc-400 hover:text-white text-2xl font-semibold p-1 cursor-pointer">
            &times;
          </button>
        </div>

        <!-- Main Body: Story Content -->
        <div *ngIf="story() as currentStory" class="flex-1 p-6 overflow-y-auto space-y-6 bg-zinc-950 font-mono">
          
          <!-- Story Header Card -->
          <div class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-md space-y-2">
            <span class="text-[10px] font-bold uppercase tracking-widest text-orange-400">Narrative Healthspan Synthesis</span>
            <h3 class="text-lg font-black leading-snug font-sans text-white">{{ currentStory.title }}</h3>
            <div class="flex items-center gap-4 text-xs text-zinc-300 pt-2 font-mono">
              <span>⏳ Bio-Age Delta: <strong class="text-orange-400">{{ currentStory.bioAgeDelta }} yrs</strong></span>
              <span>•</span>
              <span>📈 Projected QALY Gain: <strong class="text-emerald-400">+{{ currentStory.projectedQaly }} Years</strong></span>
            </div>
          </div>

          <!-- Act Tabs -->
          <div class="flex items-center gap-2 border-b border-zinc-800 pb-3 font-mono">
            <button *ngFor="let act of currentStory.acts" 
              (click)="activeActIndex.set(act.actNumber - 1)"
              [class]="activeActIndex() === act.actNumber - 1
                ? 'px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer bg-orange-500 text-zinc-950 border border-orange-400/50'
                : 'px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'"
              [attr.aria-pressed]="activeActIndex() === act.actNumber - 1">
              Act {{ act.actNumber }}
            </button>
          </div>

          <!-- Active Act Content Card -->
          @if (currentStory.acts[activeActIndex()]; as activeAct) {
            <div class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-4 font-mono">
              <div>
                <span class="text-[10px] font-bold uppercase text-orange-400">Chapter {{ activeAct.actNumber }}</span>
                <h4 class="text-base font-bold text-zinc-100 font-sans mt-0.5">{{ activeAct.title }}</h4>
                <p class="text-xs text-zinc-400 font-sans mt-0.5">{{ activeAct.subtitle }}</p>
              </div>

              <p class="text-sm text-zinc-300 leading-relaxed font-sans border-t border-zinc-800/80 pt-4">
                {{ activeAct.narrative }}
              </p>

              <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                <span class="text-[10px] font-bold uppercase text-orange-400 block mb-1">💡 Key Insight</span>
                <p class="font-bold text-zinc-200 font-sans italic">
                  "{{ activeAct.keyInsight }}"
                </p>
              </div>
            </div>
          }

        </div>

        <!-- Footer with Audio Controls -->
        <div class="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between font-mono">
          <div class="flex items-center gap-3">
            <button (click)="toggleAudio()" 
              [class]="isSpeaking()
                ? 'px-4 py-2 text-xs font-bold uppercase rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer border border-rose-400/30'
                : 'px-4 py-2 text-xs font-bold uppercase rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 transition cursor-pointer border border-orange-400/50'">
              {{ isSpeaking() ? '⏸ Pause Audio Story' : '▶ Play Audio Story (TED Voice)' }}
            </button>
            @if (isSpeaking()) {
              <span class="text-xs text-orange-400 font-bold animate-pulse">
                🎙 Speaking Chapter {{ story().acts[activeActIndex()].actNumber }}...
              </span>
            }
          </div>

          <pocket-gull-button (click)="closeModal.emit()" variant="secondary" size="sm">
            Close Reader
          </pocket-gull-button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .animate-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class PatientStoryModalComponent implements OnDestroy {
  closeModal = output<void>();
  private storytelling = inject(ClinicalStorytellingService);

  story = signal<IPatientStory>(this.storytelling.generatePatientStory());
  activeActIndex = signal<number>(0);
  isSpeaking = signal<boolean>(false);

  private synth: SpeechSynthesis | null = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  toggleAudio() {
    if (!this.synth) return;

    if (this.isSpeaking()) {
      this.synth.cancel();
      this.isSpeaking.set(false);
      return;
    }

    const activeAct = this.story().acts[this.activeActIndex()];
    const textToSpeak = `${activeAct.title}. ${activeAct.narrative}. Key Insight: ${activeAct.keyInsight}`;

    this.currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
    this.currentUtterance.rate = 0.95; // Warm, measured TED pace
    this.currentUtterance.pitch = 1.0;

    this.currentUtterance.onend = () => this.isSpeaking.set(false);
    this.currentUtterance.onerror = () => this.isSpeaking.set(false);

    this.synth.speak(this.currentUtterance);
    this.isSpeaking.set(true);
  }

  ngOnDestroy() {
    if (this.synth && this.isSpeaking()) {
      this.synth.cancel();
    }
  }
}
