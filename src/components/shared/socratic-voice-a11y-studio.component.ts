import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocraticVoiceDemystifierService } from '../../services/socratic-voice-demystifier.service';

export interface IWongBakerFace {
  score: number;
  name: string;
  rating: string;
  triageLevel: string;
  description: string;
  speechPrompt: string;
  emoji: string;
}

export interface IIcuNeedTile {
  id: string;
  title: string;
  category: string;
  spokenText: string;
  emoji: string;
  isCustom?: boolean;
}

@Component({
  selector: 'app-socratic-voice-a11y-studio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-teal-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-extrabold text-xl">
            🎙️
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2">
              Socratic Voice & AAC Bedside Studio
              <span class="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-800 dark:text-teal-300 font-mono font-bold">
                A11y Studio Parity
              </span>
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Neural voice scoring, Rachel Nabors parasympathetic pacing (0.88x / 0.93x), Wong-Baker FACES pain vocalizer, and ICU bedside need tiles.
            </p>
          </div>
        </div>

        <!-- Studio Mode Switcher -->
        <div class="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-zinc-800/80 rounded-xl text-xs font-bold">
          <button
            type="button"
            (click)="activeSubTab.set('aac')"
            [class.bg-white]="activeSubTab() === 'aac'"
            [class.dark:bg-zinc-700]="activeSubTab() === 'aac'"
            [class.shadow-sm]="activeSubTab() === 'aac'"
            class="px-3 py-1.5 rounded-lg transition-all text-gray-700 dark:text-zinc-200"
          >
            🏥 ICU Bedside AAC
          </button>
          <button
            type="button"
            (click)="activeSubTab.set('socratic')"
            [class.bg-white]="activeSubTab() === 'socratic'"
            [class.dark:bg-zinc-700]="activeSubTab() === 'socratic'"
            [class.shadow-sm]="activeSubTab() === 'socratic'"
            class="px-3 py-1.5 rounded-lg transition-all text-gray-700 dark:text-zinc-200"
          >
            🌱 Socratic Jargon Demystifier
          </button>
          <button
            type="button"
            (click)="activeSubTab.set('settings')"
            [class.bg-white]="activeSubTab() === 'settings'"
            [class.dark:bg-zinc-700]="activeSubTab() === 'settings'"
            [class.shadow-sm]="activeSubTab() === 'settings'"
            class="px-3 py-1.5 rounded-lg transition-all text-gray-700 dark:text-zinc-200"
          >
            ⚙️ Neural Synthesizer Settings
          </button>
        </div>
      </div>

      <!-- Live Voice Synthesizer & Acoustic Controls Bar (From a11y_studio.html#panel-aac) -->
      <div class="p-3.5 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-bold text-gray-700 dark:text-zinc-300">🗣️ Active Voice:</span>
          <select
            (change)="onBrowserVoiceChange($event)"
            class="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg text-xs font-mono text-gray-800 dark:text-zinc-200 max-w-[280px] truncate"
          >
            @for (v of detectedVoices(); track v.name) {
              <option [value]="v.name" [selected]="selectedBrowserVoice()?.name === v.name">
                {{ isNeuralVoice(v) ? '✨ ' : '' }}{{ v.name }} ({{ v.lang }})
              </option>
            }
          </select>

          <!-- Pacing Controls -->
          <div class="flex items-center gap-1 ml-2">
            <span class="text-gray-500 font-medium">Pacing:</span>
            <button
              type="button"
              (click)="setPacingRate(0.88)"
              class="px-2 py-1 rounded text-[11px] font-bold transition-all"
              [class.bg-teal-600]="activeRate() === 0.88"
              [class.text-white]="activeRate() === 0.88"
              [class.bg-gray-200]="activeRate() !== 0.88"
              [class.dark:bg-zinc-700]="activeRate() !== 0.88"
            >
              Calm (0.88x)
            </button>
            <button
              type="button"
              (click)="setPacingRate(0.93)"
              class="px-2 py-1 rounded text-[11px] font-bold transition-all"
              [class.bg-teal-600]="activeRate() === 0.93"
              [class.text-white]="activeRate() === 0.93"
              [class.bg-gray-200]="activeRate() !== 0.93"
              [class.dark:bg-zinc-700]="activeRate() !== 0.93"
            >
              Natural (0.93x)
            </button>
            <button
              type="button"
              (click)="setPacingRate(1.0)"
              class="px-2 py-1 rounded text-[11px] font-bold transition-all"
              [class.bg-teal-600]="activeRate() === 1.0"
              [class.text-white]="activeRate() === 1.0"
              [class.bg-gray-200]="activeRate() !== 1.0"
              [class.dark:bg-zinc-700]="activeRate() !== 1.0"
            >
              Standard (1.0x)
            </button>
          </div>

          <!-- Tone / Pitch Controls -->
          <div class="flex items-center gap-1 ml-2">
            <span class="text-gray-500 font-medium">Tone:</span>
            <button
              type="button"
              (click)="setPitchTone(0.98)"
              class="px-2 py-1 rounded text-[11px] font-bold transition-all"
              [class.bg-teal-600]="activePitch() === 0.98"
              [class.text-white]="activePitch() === 0.98"
              [class.bg-gray-200]="activePitch() !== 0.98"
              [class.dark:bg-zinc-700]="activePitch() !== 0.98"
            >
              Warm Bedside (0.98)
            </button>
            <button
              type="button"
              (click)="setPitchTone(1.06)"
              class="px-2 py-1 rounded text-[11px] font-bold transition-all"
              [class.bg-teal-600]="activePitch() === 1.06"
              [class.text-white]="activePitch() === 1.06"
              [class.bg-gray-200]="activePitch() !== 1.06"
              [class.dark:bg-zinc-700]="activePitch() !== 1.06"
            >
              Bright Clarity (1.06)
            </button>
          </div>
        </div>

        <button
          type="button"
          (click)="stopAudio()"
          class="px-3 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-all"
        >
          ⏹️ Silence Audio
        </button>
      </div>

      <!-- Live Spoken Output Bar -->
      <div class="p-3 bg-gray-900 border border-teal-500/40 rounded-xl flex items-center gap-3 text-xs font-mono text-teal-400 shadow-inner">
        <span class="text-lg" [class.animate-pulse]="isCurrentlySpeaking()">
          {{ isCurrentlySpeaking() ? '🔊' : '📢' }}
        </span>
        <div class="flex-1 truncate">
          <span class="text-gray-500 uppercase text-[10px] mr-2">Spoken Message:</span>
          <span class="text-teal-300 font-semibold select-all">{{ activeSpokenPhrase() }}</span>
        </div>
        @if (lastSpokenPhrase()) {
          <button
            type="button"
            (click)="repeatLastSpoken()"
            class="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-[11px] font-bold transition-all"
          >
            🔊 Repeat
          </button>
        }
      </div>

      <!-- TAB 1: ICU BEDSIDE AAC (FACES + PHYSIOLOGICAL TILES) -->
      @if (activeSubTab() === 'aac') {
        <div class="space-y-6">
          <!-- Wong-Baker FACES Pain Scale (0-10) -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <h4 class="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                <span>🤕</span> Wong-Baker FACES Pain Rating Scale (0–10):
              </h4>
              <span class="text-[10px] text-gray-500 dark:text-zinc-400 font-mono">
                Tap face to vocalize bedside pain level
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              @for (face of wongBakerFaces; track face.score) {
                <div
                  (click)="vocalizePainFace(face)"
                  class="p-3 bg-gray-50 dark:bg-zinc-800/70 border border-gray-200 dark:border-zinc-700/80 rounded-xl cursor-pointer hover:border-teal-500 hover:scale-[1.02] transition-all flex flex-col items-center text-center space-y-1.5 group select-none"
                >
                  <span class="text-3xl transition-transform group-hover:scale-110">{{ face.emoji }}</span>
                  <div class="font-bold text-gray-900 dark:text-gray-100 text-[11px]">
                    {{ face.name }}
                  </div>
                  <div class="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                       [class.bg-emerald-500/20]="face.score <= 2"
                       [class.text-emerald-700]="face.score <= 2"
                       [class.dark:text-emerald-300]="face.score <= 2"
                       [class.bg-amber-500/20]="face.score > 2 && face.score <= 6"
                       [class.text-amber-700]="face.score > 2 && face.score <= 6"
                       [class.dark:text-amber-300]="face.score > 2 && face.score <= 6"
                       [class.bg-red-500/20]="face.score >= 8"
                       [class.text-red-700]="face.score >= 8"
                       [class.dark:text-red-300]="face.score >= 8">
                    {{ face.rating }}
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- ICU Physiological & Emotional Need Board -->
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <h4 class="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                <span>🛏️</span> ICU Physiological & Emotional Need Tiles:
              </h4>
              <button
                type="button"
                (click)="toggleCustomTileBuilder()"
                class="px-2.5 py-1 bg-teal-600/10 hover:bg-teal-600/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded text-xs font-bold transition-all"
              >
                + Add Custom Bedside Tile
              </button>
            </div>

            <!-- Custom Tile Builder Box (Collapsible) -->
            @if (showTileBuilder()) {
              <div class="p-4 bg-teal-500/5 border border-teal-500/30 rounded-xl space-y-3 text-xs">
                <div class="font-bold text-teal-900 dark:text-teal-300">
                  Co-Create a Bedside Tile with Patient
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-[10px] text-gray-500 mb-1">Tile Label:</label>
                    <input
                      type="text"
                      [(ngModel)]="newTileTitle"
                      placeholder="e.g. Hold My Hand"
                      class="w-full p-2 bg-white dark:bg-zinc-800 border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] text-gray-500 mb-1">Spoken Message:</label>
                    <input
                      type="text"
                      [(ngModel)]="newTileSpeech"
                      placeholder="e.g. Could you please hold my hand?"
                      class="w-full p-2 bg-white dark:bg-zinc-800 border rounded text-xs"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] text-gray-500 mb-1">Emoji / Icon:</label>
                    <select [(ngModel)]="newTileEmoji" class="w-full p-2 bg-white dark:bg-zinc-800 border rounded text-xs">
                      <option value="🤝">🤝 Hold Hand</option>
                      <option value="❤️">❤️ Family Love</option>
                      <option value="👓">👓 Glasses</option>
                      <option value="🐕">🐕 Pet / Dog</option>
                      <option value="🎵">🎵 Music / Song</option>
                      <option value="🕊️">🕊️ Quiet / Rest</option>
                    </select>
                  </div>
                </div>
                <div class="flex justify-end gap-2">
                  <button type="button" (click)="showTileBuilder.set(false)" class="px-3 py-1 text-xs">Cancel</button>
                  <button type="button" (click)="saveCustomTile()" class="px-3 py-1 bg-teal-600 text-white rounded text-xs font-bold">
                    ✓ Save Tile
                  </button>
                </div>
              </div>
            }

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              @for (tile of allIcuTiles(); track tile.id) {
                <div
                  (click)="vocalizeNeedTile(tile)"
                  class="p-3.5 bg-gray-50 dark:bg-zinc-800/70 border rounded-xl cursor-pointer hover:border-teal-500 hover:scale-[1.02] transition-all flex flex-col justify-between space-y-2 select-none relative group"
                  [class.border-teal-500/40]="tile.isCustom"
                  [class.border-gray-200]="!tile.isCustom"
                  [class.dark:border-zinc-700/80]="!tile.isCustom"
                >
                  <div class="flex justify-between items-start">
                    <span class="text-2xl">{{ tile.emoji }}</span>
                    <span class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400">
                      {{ tile.category }}
                    </span>
                  </div>
                  <div>
                    <div class="font-bold text-gray-900 dark:text-gray-100 text-xs">
                      {{ tile.title }}
                    </div>
                    <p class="text-[10px] text-gray-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                      "{{ tile.spokenText }}"
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: SOCRATIC JARGON DEMYSTIFIER -->
      @if (activeSubTab() === 'socratic') {
        <div class="p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl space-y-3 text-xs">
          <div class="flex justify-between items-center">
            <label class="font-bold text-gray-800 dark:text-zinc-200">
              Clinical Note Socratic Demystifier:
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                (click)="loadSampleJargon('idiopathic')"
                class="px-2 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-[10px] font-medium"
              >
                Sample: ITP
              </button>
              <button
                type="button"
                (click)="loadSampleJargon('hypothyroid')"
                class="px-2 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-[10px] font-medium"
              >
                Sample: Hypothyroid
              </button>
              <button
                type="button"
                (click)="loadSampleJargon('tia')"
                class="px-2 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-[10px] font-medium"
              >
                Sample: TIA
              </button>
            </div>
          </div>

          <textarea
            [value]="rawInputText()"
            (input)="onInputChange($event)"
            rows="2"
            placeholder="Paste or speak doctor's notes (e.g. 'Patient has idiopathic thrombocytopenic purpura and subclinical hypothyroidism...')"
            class="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
          ></textarea>

          @if (demystifiedResult().demystifiedTermsCount > 0) {
            <div class="p-3.5 bg-teal-500/10 border border-teal-500/30 rounded-xl space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                  <span>🌱</span> Socratic Translation ({{ demystifiedResult().demystifiedTermsCount }} Jargon Terms Soothed):
                </span>
                <button
                  type="button"
                  (click)="speakText(demystifiedResult().processedText)"
                  class="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>🔊</span> Read Aloud with Vagal Pacing
                </button>
              </div>
              <p class="text-gray-800 dark:text-zinc-200 text-xs leading-relaxed whitespace-pre-line">
                {{ demystifiedResult().processedText }}
              </p>
            </div>
          }
        </div>
      }

      <!-- TAB 3: NEURAL SYNTHESIZER SETTINGS -->
      @if (activeSubTab() === 'settings') {
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            @for (persona of voiceService.personas; track persona.id) {
              <div
                (click)="voiceService.setPersona(persona.id)"
                class="p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 flex flex-col justify-between"
                [class.bg-teal-500/10]="voiceService.selectedPersonaId() === persona.id"
                [class.border-teal-500]="voiceService.selectedPersonaId() === persona.id"
                [class.bg-gray-50]="voiceService.selectedPersonaId() !== persona.id"
                [class.dark:bg-zinc-800/60]="voiceService.selectedPersonaId() !== persona.id"
                [class.border-gray-200]="voiceService.selectedPersonaId() !== persona.id"
                [class.dark:border-zinc-700]="voiceService.selectedPersonaId() !== persona.id"
              >
                <div>
                  <div class="font-bold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                    <span>{{ persona.name }}</span>
                    @if (voiceService.selectedPersonaId() === persona.id) {
                      <span class="text-teal-600 dark:text-teal-400 font-bold text-sm">✓</span>
                    }
                  </div>
                  <div class="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
                    {{ persona.role }}
                  </div>
                  <p class="text-[11px] text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {{ persona.description }}
                  </p>
                </div>

                <div class="pt-2 border-t border-gray-200 dark:border-zinc-700/60 text-[9px] font-mono text-gray-400 flex justify-between">
                  <span>Speed: {{ persona.speechRate }}x</span>
                  <span>Pause: {{ persona.vagalCadencePauseMs }}ms</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class SocraticVoiceA11yStudioComponent implements OnInit, OnDestroy {
  readonly voiceService = inject(SocraticVoiceDemystifierService);
  readonly activeSubTab = signal<'aac' | 'socratic' | 'settings'>('aac');

  // Voice synthesizer signals
  readonly detectedVoices = signal<SpeechSynthesisVoice[]>([]);
  readonly selectedBrowserVoice = signal<SpeechSynthesisVoice | null>(null);
  readonly activeRate = signal<number>(0.93);
  readonly activePitch = signal<number>(0.98);
  readonly activeSpokenPhrase = signal<string>('Tap any communication tile below to announce...');
  readonly lastSpokenPhrase = signal<string>('');
  readonly isCurrentlySpeaking = signal<boolean>(false);

  // Custom tile builder state
  readonly showTileBuilder = signal<boolean>(false);
  newTileTitle = '';
  newTileSpeech = '';
  newTileEmoji = '🤝';
  readonly customBedsideTiles = signal<IIcuNeedTile[]>([]);

  // Wong-Baker FACES dataset from a11y_neuro_ergonomics_data.js
  readonly wongBakerFaces: IWongBakerFace[] = [
    { score: 0, name: 'No Hurt', rating: '0 / 10', triageLevel: 'None', description: 'Patient is relaxed, comfortable, smiling.', speechPrompt: 'I am comfortable and have no pain. Pain score zero.', emoji: '😊' },
    { score: 2, name: 'Hurts Little Bit', rating: '2 / 10', triageLevel: 'Mild', description: 'Noticeable mild discomfort.', speechPrompt: 'It hurts just a little bit. Pain score two.', emoji: '🙂' },
    { score: 4, name: 'Hurts Little More', rating: '4 / 10', triageLevel: 'Moderate', description: 'Noticeable discomfort, neutral face.', speechPrompt: 'It hurts a little more now. Pain score four.', emoji: '😐' },
    { score: 6, name: 'Hurts Even More', rating: '6 / 10', triageLevel: 'Elevated', description: 'Pain is intrusive, furrowed brow.', speechPrompt: 'It hurts even more. It is hard to rest. Pain score six.', emoji: '😟' },
    { score: 8, name: 'Hurts Whole Lot', rating: '8 / 10', triageLevel: 'Severe', description: 'Patient in significant distress.', speechPrompt: 'It hurts a whole lot. I need pain relief. Pain score eight.', emoji: '😣' },
    { score: 10, name: 'Hurts Worst', rating: '10 / 10', triageLevel: 'Acute', description: 'Acute agony. Immediate response required.', speechPrompt: 'This hurts the worst possible. Please help me right away. Pain score ten.', emoji: '😭' }
  ];

  // Core ICU Needs from a11y_neuro_ergonomics_data.js
  readonly baseIcuNeeds: IIcuNeedTile[] = [
    { id: 'WATER', title: 'Water / Swab', category: 'Hydration', spokenText: 'Could I please have some water, or a mouth swab?', emoji: '💧' },
    { id: 'PAIN', title: 'Pain Medication', category: 'Clinical', spokenText: "I'm in pain. Could someone please check on my pain medication?", emoji: '💊' },
    { id: 'COLD', title: 'Cold / Blanket', category: 'Thermal', spokenText: "I'm feeling very cold. Could I please have a warm blanket?", emoji: '❄️' },
    { id: 'WARM', title: 'Too Warm / Fan', category: 'Thermal', spokenText: "I'm feeling too warm. Could we adjust the blankets or turn on a fan?", emoji: '☀️' },
    { id: 'REPOSITION', title: 'Reposition Bed', category: 'Mobility', spokenText: 'Could someone please help reposition me, or turn me in bed?', emoji: '🛏️' },
    { id: 'FAMILY', title: 'Family / Nurse', category: 'Emotional', spokenText: 'I would like to see my family, or speak with my nurse, please.', emoji: '👨‍👩‍👦' }
  ];

  readonly allIcuTiles = () => [...this.baseIcuNeeds, ...this.customBedsideTiles()];

  // Socratic Demystifier state
  readonly rawInputText = signal<string>('Patient presents with idiopathic thrombocytopenic purpura and subclinical hypothyroidism. Advise monitoring.');
  readonly demystifiedResult = signal<{ processedText: string; demystifiedTermsCount: number }>({ processedText: '', demystifiedTermsCount: 0 });

  ngOnInit(): void {
    this.updateDemystification(this.rawInputText());
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.populateBrowserVoices();
      window.speechSynthesis.onvoiceschanged = () => this.populateBrowserVoices();
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  populateBrowserVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Sort using your font repo heuristic
    const sorted = [...voices].sort((a, b) => this.scoreVoice(b) - this.scoreVoice(a));
    this.detectedVoices.set(sorted);

    // Auto-select best natural voice
    if (!this.selectedBrowserVoice() && sorted.length > 0) {
      this.selectedBrowserVoice.set(sorted[0]);
    }
  }

  scoreVoice(voice: SpeechSynthesisVoice): number {
    let score = 0;
    const name = (voice.name || '').toLowerCase();
    const lang = (voice.lang || '').toLowerCase();

    if (lang.startsWith('en')) score += 90;
    if (name.includes('natural')) score += 120;
    if (name.includes('neural')) score += 100;
    if (name.includes('online')) score += 90;
    if (name.includes('google')) score += 80;
    if (name.includes('jenny') || name.includes('guy') || name.includes('aria')) score += 70;
    if (name.includes('desktop') && !name.includes('natural')) score -= 40;
    return score;
  }

  isNeuralVoice(voice: SpeechSynthesisVoice): boolean {
    return /natural|neural|online|google|wavenet/i.test(voice.name);
  }

  onBrowserVoiceChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    const found = this.detectedVoices().find(v => v.name === val);
    if (found) {
      this.selectedBrowserVoice.set(found);
      this.speakText(`Voice set to ${found.name.replace(/\(.*?\)/g, '').trim()}`);
    }
  }

  setPacingRate(rate: number): void {
    this.activeRate.set(rate);
    this.voiceService.speechRateMultiplier.set(rate);
  }

  setPitchTone(pitch: number): void {
    this.activePitch.set(pitch);
    this.voiceService.speechPitch.set(pitch);
  }

  vocalizePainFace(face: IWongBakerFace): void {
    this.activeSpokenPhrase.set(face.speechPrompt);
    this.lastSpokenPhrase.set(face.speechPrompt);
    this.speakText(face.speechPrompt);
  }

  vocalizeNeedTile(tile: IIcuNeedTile): void {
    this.activeSpokenPhrase.set(tile.spokenText);
    this.lastSpokenPhrase.set(tile.spokenText);
    this.speakText(tile.spokenText);
  }

  repeatLastSpoken(): void {
    const phrase = this.lastSpokenPhrase();
    if (phrase) this.speakText(phrase);
  }

  speakText(text: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.selectedBrowserVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.rate = this.activeRate();
    utterance.pitch = this.activePitch();

    utterance.onstart = () => this.isCurrentlySpeaking.set(true);
    utterance.onend = () => this.isCurrentlySpeaking.set(false);
    utterance.onerror = () => this.isCurrentlySpeaking.set(false);

    window.speechSynthesis.speak(utterance);
  }

  stopAudio(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isCurrentlySpeaking.set(false);
  }

  toggleCustomTileBuilder(): void {
    this.showTileBuilder.set(!this.showTileBuilder());
  }

  saveCustomTile(): void {
    if (!this.newTileTitle.trim() || !this.newTileSpeech.trim()) return;
    const tile: IIcuNeedTile = {
      id: `CUSTOM_${Date.now()}`,
      title: this.newTileTitle.trim(),
      category: 'Personal',
      spokenText: this.newTileSpeech.trim(),
      emoji: this.newTileEmoji,
      isCustom: true
    };
    this.customBedsideTiles.update(list => [...list, tile]);
    this.newTileTitle = '';
    this.newTileSpeech = '';
    this.showTileBuilder.set(false);
    this.vocalizeNeedTile(tile);
  }

  onInputChange(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.rawInputText.set(val);
    this.updateDemystification(val);
  }

  updateDemystification(text: string): void {
    this.demystifiedResult.set(this.voiceService.demystifyText(text));
  }

  loadSampleJargon(type: 'idiopathic' | 'hypothyroid' | 'tia'): void {
    let sample = '';
    if (type === 'idiopathic') sample = 'Lab confirms idiopathic thrombocytopenic purpura with platelet count of 45k.';
    if (type === 'hypothyroid') sample = 'TSH is elevated at 6.2 with normal free T4, suggesting subclinical hypothyroidism.';
    if (type === 'tia') sample = 'Emergency intake note: Episodic facial numbness consistent with transient ischemic attack.';
    this.rawInputText.set(sample);
    this.updateDemystification(sample);
  }
}
