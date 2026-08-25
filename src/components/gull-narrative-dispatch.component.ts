import { Component, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface INarrativeStep {
  act: number;
  personaId: 'gulliver' | 'swoop' | 'sentinel' | 'scribes';
  personaName: string;
  roleTitle: string;
  quote: string;
  badge: string;
  propIcon: string;
  propName: string;
  propAnimation: string;
  themeColor: string;
  bgGradient: string;
  borderColor: string;
  headline: string;
  bodyText: string;
  shantyVerse: string;
  metrics: Array<{ label: string; value: string; status?: 'normal' | 'warning' | 'alert' }>;
  voiceModelName: string;
  voiceTone: string;
  pitch: number;
  rate: number;
}

@Component({
  selector: 'app-gull-narrative-dispatch',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full rounded-2xl border-2 p-5 transition-all duration-500 bg-[#F9F3D9] text-[#1C1C1C] border-[#F6B12B] shadow-[4px_6px_0px_0px_rgba(28,28,28,0.85)] font-sans overflow-hidden">
      <!-- Background Texture & Papercraft Overlay -->
      <div class="absolute inset-0 opacity-15 pointer-events-none mix-blend-multiply bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:12px_12px]"></div>

      <!-- Header: Avian Squadron Banner & Narrative Stepper -->
      <div class="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-dashed border-[#1C1C1C]/20">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#F6B12B] border-2 border-[#1C1C1C] flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_rgba(28,28,28,0.9)] animate-bounce">
            🪺
          </div>
          <div>
            <h3 class="text-base font-black tracking-tight text-[#1C1C1C] flex items-center gap-2 uppercase font-mono">
              Gull Squadron Dispatch
              <span class="text-xs px-2 py-0.5 rounded-full bg-[#2AA4A0] text-white font-bold tracking-widest lowercase border border-[#1C1C1C]">narrative arc</span>
            </h3>
            <p class="text-xs font-medium text-[#1C1C1C]/70">Multimodal Avian Voice & Singalong Shanty</p>
          </div>
        </div>

        <!-- Right Controls: 4-Act Navigation & Sea Shanty Singalong Button -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Avian Sea Shanty Mode Trigger -->
          <button 
            (click)="toggleSingalong()"
            [class.bg-[#EF6658]]="isSingalongActive()"
            [class.text-white]="isSingalongActive()"
            [class.bg-[#F6B12B]]="!isSingalongActive()"
            [class.text-[#1C1C1C]]="!isSingalongActive()"
            class="px-3 py-1.5 rounded-xl border-2 border-[#1C1C1C] text-xs font-black shadow-[2px_2px_0px_0px_rgba(28,28,28,0.85)] hover:scale-105 transition-all min-h-[36px] cursor-pointer flex items-center gap-1.5 font-mono">
            <span>{{ isSingalongActive() ? '🎶 Stop Singalong' : '🎵 Avian Sea Shanty Singalong' }}</span>
          </button>

          <!-- 4-Act Persona Navigation Pills -->
          <div class="flex items-center gap-1 bg-[#FFFFFF] p-1.5 rounded-xl border-2 border-[#1C1C1C] shadow-[2px_2px_0px_0px_rgba(28,28,28,0.8)]">
            @for (step of steps; track step.act) {
              <button 
                (click)="selectAct(step.act)"
                [attr.aria-pressed]="activeAct() === step.act"
                [attr.aria-label]="'Act ' + step.act + ': ' + step.personaName"
                [class.bg-[#F6B12B]]="activeAct() === step.act"
                [class.text-[#1C1C1C]]="activeAct() === step.act"
                [class.bg-transparent]="activeAct() !== step.act"
                [class.text-[#1C1C1C]/60]="activeAct() !== step.act"
                class="px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 min-h-[36px] cursor-pointer hover:bg-[#F6B12B]/40 focus:outline-none focus:ring-2 focus:ring-[#1C1C1C]">
                <span>{{ step.propIcon }}</span>
                <span class="hidden sm:inline font-mono">{{ step.personaName }}</span>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Karaoke Avian Sea Shanty Singalong Banner (Visible when active) -->
      @if (isSingalongActive()) {
        <div class="relative z-10 my-4 p-4 rounded-xl border-2 border-[#1C1C1C] bg-[#FFFFFF] shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] font-mono animate-pulse">
          <div class="flex items-center justify-between text-xs font-black text-[#1C1C1C] uppercase tracking-wider mb-1">
            <span class="flex items-center gap-2">
              <span class="animate-spin">🎶</span> Gull Squadron Health Sea Shanty
            </span>
            <span class="px-2 py-0.5 rounded bg-[#2AA4A0] text-white">Verse {{ activeAct() }} of 4</span>
          </div>
          <p class="text-base font-black text-[#EF6658] italic tracking-tight font-serif mt-1">
            "{{ currentStep()?.shantyVerse }}"
          </p>
        </div>
      }

      <!-- Active Act Card Content -->
      <div class="relative z-10 mt-5 transition-all duration-300">
        @if (currentStep(); as step) {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            <!-- Persona Avatar & Prop Card (Left 4 cols) -->
            <div class="lg:col-span-4 rounded-xl border-2 border-[#1C1C1C] p-4 flex flex-col items-center text-center justify-between relative shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)]"
                 [style.backgroundColor]="step.themeColor">
              
              <!-- Act Badge & Voice Profile -->
              <div class="w-full flex justify-between items-center text-xs font-black font-mono text-[#1C1C1C]/80 uppercase">
                <span>ACT {{ step.act }} OF 4</span>
                <span class="px-2 py-0.5 bg-[#FFFFFF] rounded-md border border-[#1C1C1C] shadow-[1px_1px_0px_0px_rgba(28,28,28,0.8)]">{{ step.badge }}</span>
              </div>

              <!-- Animated Prop Display -->
              <div class="my-4 relative flex flex-col items-center">
                <div class="w-20 h-20 rounded-full bg-[#FFFFFF] border-2 border-[#1C1C1C] flex items-center justify-center text-4xl shadow-[3px_3px_0px_0px_rgba(28,28,28,0.9)] transition-transform duration-500 hover:scale-110">
                  <span class="inline-block transform transition-transform duration-700"
                        [class.scale-125]="activeAct() === step.act"
                        [class.rotate-12]="step.act % 2 === 0">
                    {{ step.propIcon }}
                  </span>
                </div>
                <span class="mt-2 text-xs font-black uppercase font-mono tracking-widest text-[#1C1C1C] bg-[#FFFFFF]/90 px-2 py-0.5 rounded border border-[#1C1C1C]">
                  {{ step.propName }}
                </span>
              </div>

              <!-- Persona Title, Quote & Dedicated Voice Model Badge -->
              <div class="w-full">
                <h4 class="text-lg font-black text-[#1C1C1C] tracking-tight">{{ step.personaName }}</h4>
                <p class="text-xs font-bold text-[#1C1C1C]/80 uppercase font-mono tracking-wider">{{ step.roleTitle }}</p>
                <div class="mt-2 p-2 rounded-lg bg-[#FFFFFF]/80 border border-[#1C1C1C] text-[11px] italic text-[#1C1C1C]">
                  "{{ step.quote }}"
                </div>

                <!-- Voice Model Spec Badge -->
                <div class="mt-3 p-2 bg-[#FFFFFF]/90 rounded-lg border border-[#1C1C1C] font-mono text-[10px] text-left">
                  <div class="font-bold text-[#1C1C1C] flex items-center justify-between">
                    <span>🎙️ Voice Model:</span>
                    <span class="text-[#2AA4A0] font-black uppercase">{{ step.voiceModelName }}</span>
                  </div>
                  <div class="text-[#1C1C1C]/75 mt-0.5 italic">{{ step.voiceTone }}</div>
                </div>
              </div>
            </div>

            <!-- Narrative Dispatch Findings (Right 8 cols) -->
            <div class="lg:col-span-8 bg-[#FFFFFF] rounded-xl border-2 border-[#1C1C1C] p-5 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between gap-3">
                  <h4 class="text-xl font-black text-[#1C1C1C] tracking-tight flex items-center gap-2">
                    <span>{{ step.headline }}</span>
                  </h4>

                  <!-- Voice Synthesis Trigger Button -->
                  <button 
                    (click)="speakDispatch(step)"
                    [class.bg-[#2AA4A0]]="isPlayingVoice()"
                    [class.bg-[#F6B12B]]="!isPlayingVoice()"
                    class="px-3 py-1.5 rounded-lg border-2 border-[#1C1C1C] text-xs font-black text-[#1C1C1C] shadow-[2px_2px_0px_0px_rgba(28,28,28,0.85)] hover:scale-105 transition-all min-h-[36px] cursor-pointer flex items-center gap-1.5 shrink-0">
                    <span>{{ isPlayingVoice() ? '🔊 Speaking...' : '🎙️ Speak Persona Voice' }}</span>
                  </button>
                </div>

                <p class="mt-3 text-sm text-[#1C1C1C]/90 leading-relaxed font-serif">
                  {{ step.bodyText }}
                </p>

                <!-- Key Metrics Grid -->
                @if (step.metrics.length > 0) {
                  <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                    @for (m of step.metrics; track m.label) {
                      <div class="p-2.5 rounded-lg border-2 border-[#1C1C1C] bg-[#F9F3D9]/60 shadow-[2px_2px_0px_0px_rgba(28,28,28,0.8)]">
                        <div class="text-[10px] uppercase font-bold text-[#1C1C1C]/70">{{ m.label }}</div>
                        <div class="text-base font-black text-[#1C1C1C] mt-0.5 flex items-center justify-between">
                          <span>{{ m.value }}</span>
                          @if (m.status === 'alert') {
                            <span class="w-2 h-2 rounded-full bg-[#EF6658] border border-[#1C1C1C]"></span>
                          } @else if (m.status === 'warning') {
                            <span class="w-2 h-2 rounded-full bg-[#F6B12B] border border-[#1C1C1C]"></span>
                          } @else {
                            <span class="w-2 h-2 rounded-full bg-[#2AA4A0] border border-[#1C1C1C]"></span>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Footer Actions & Narrative Progression Controls -->
              <div class="mt-6 pt-4 border-t-2 border-dashed border-[#1C1C1C]/20 flex flex-wrap items-center justify-between gap-3">
                <div class="text-xs font-mono font-bold text-[#1C1C1C]/70">
                  Step {{ activeAct() }} of 4 • Voice Model: <span class="text-[#2AA4A0] font-black uppercase">{{ step.voiceModelName }}</span>
                </div>

                <div class="flex items-center gap-2">
                  @if (activeAct() > 1) {
                    <button 
                      (click)="prevAct()"
                      class="px-3 py-1.5 rounded-lg bg-[#F9F3D9] border-2 border-[#1C1C1C] text-xs font-black text-[#1C1C1C] shadow-[2px_2px_0px_0px_rgba(28,28,28,0.85)] hover:bg-[#F6B12B] transition-all min-h-[36px] cursor-pointer">
                      ← Previous Act
                    </button>
                  }

                  @if (activeAct() < 4) {
                    <button 
                      (click)="nextAct()"
                      class="px-4 py-1.5 rounded-lg bg-[#2AA4A0] border-2 border-[#1C1C1C] text-xs font-black text-white shadow-[2px_2px_0px_0px_rgba(28,28,28,0.85)] hover:bg-[#228582] transition-all min-h-[36px] cursor-pointer flex items-center gap-1.5">
                      <span>Next Act</span>
                      <span>→</span>
                    </button>
                  } @else {
                    <button 
                      (click)="resetAct()"
                      class="px-4 py-1.5 rounded-lg bg-[#EF6658] border-2 border-[#1C1C1C] text-xs font-black text-white shadow-[2px_2px_0px_0px_rgba(28,28,28,0.85)] hover:bg-[#d95346] transition-all min-h-[36px] cursor-pointer flex items-center gap-1.5">
                      <span>Replay Narrative Arc</span>
                      <span>🔄</span>
                    </button>
                  }
                </div>
              </div>
            </div>

          </div>
        }
      </div>
    </div>
  `
})
export class GullNarrativeDispatchComponent implements OnDestroy {
  activeAct = signal<number>(1);
  isPlayingVoice = signal<boolean>(false);
  isSingalongActive = signal<boolean>(false);

  readonly steps: INarrativeStep[] = [
    {
      act: 1,
      personaId: 'gulliver',
      personaName: 'Gulliver',
      roleTitle: 'Overview & Chart Synthesis',
      quote: 'I see the whole ocean from up here.',
      badge: 'OBSERVATION',
      propIcon: '🔭',
      propName: 'Brass Telescope',
      propAnimation: 'scale-x',
      themeColor: '#F5B98E',
      bgGradient: 'from-[#F5B98E] to-[#F9F3D9]',
      borderColor: '#EF6658',
      headline: 'High-Altitude Clinical Observation',
      bodyText: 'Scanning complete patient telemetry across 30-day baseline. Primary signals indicate strong cardiovascular stability with mild metabolic friction.',
      shantyVerse: 'Oh, scan the sea from high above! High-altitude signs we know and love!',
      metrics: [
        { label: 'Stability Index', value: '94%', status: 'normal' },
        { label: 'Complexity Score', value: '3.2 / 5', status: 'normal' },
        { label: 'Diagnostic Certainty', value: '98.4%', status: 'normal' }
      ],
      voiceModelName: 'Aoede (Deep Baritone)',
      voiceTone: 'Deep, calm, nautical captain tone',
      pitch: 0.85,
      rate: 0.9
    },
    {
      act: 2,
      personaId: 'swoop',
      personaName: 'Swoop',
      roleTitle: 'Interventions & Dosing',
      quote: 'Spotted. Locked. Delivering.',
      badge: 'INTERVENTION',
      propIcon: '⚡',
      propName: 'Leather Satchel',
      propAnimation: 'bounce',
      themeColor: '#2AA4A0',
      bgGradient: 'from-[#2AA4A0] to-[#F9F3D9]',
      borderColor: '#1C1C1C',
      headline: 'Precision Dosage Delivery',
      bodyText: 'Targeting specific biomarker offsets. Delivering 2 calibrated lifestyle interventions and morning dosing schedule adjustments.',
      shantyVerse: 'Spotted, locked, and clear the deck! Two healthy doses round your neck!',
      metrics: [
        { label: 'Target Interventions', value: '2 Active', status: 'warning' },
        { label: 'Dose Accuracy', value: '99.1%', status: 'normal' },
        { label: 'Response Time', value: '< 12 hrs', status: 'normal' }
      ],
      voiceModelName: 'Fenrir (Fast Aviator)',
      voiceTone: 'Crisp, rapid flight-leader precision',
      pitch: 1.2,
      rate: 1.15
    },
    {
      act: 3,
      personaId: 'sentinel',
      personaName: 'Sentinel',
      roleTitle: 'Vigilance & Trends',
      quote: 'I never blink. I never look away.',
      badge: 'VIGILANCE',
      propIcon: '🔦',
      propName: 'Signal Lantern',
      propAnimation: 'pulse',
      themeColor: '#F6B12B',
      bgGradient: 'from-[#F6B12B] to-[#F9F3D9]',
      borderColor: '#1C1C1C',
      headline: 'Watchtower Vital Vigilance',
      bodyText: 'Continuous 48-hour monitoring enabled. No arrhythmia spikes detected; pulse pressure variance remains within safe threshold.',
      shantyVerse: 'Watch the lantern, hold the light! Your vital pulse stays calm all night!',
      metrics: [
        { label: 'Vital Drift', value: '± 1 font', status: 'normal' },
        { label: 'Nightly SPO2', value: '98%', status: 'normal' },
        { label: 'Alert Trigger', value: '0 Level-1', status: 'normal' }
      ],
      voiceModelName: 'Charon (Lighthouse Watch)',
      voiceTone: 'Steady, vigilant sentinel clarity',
      pitch: 0.95,
      rate: 0.95
    },
    {
      act: 4,
      personaId: 'scribes',
      personaName: 'Scribes',
      roleTitle: 'Translation & Education',
      quote: 'Let me explain that in a way that actually helps.',
      badge: 'EDUCATION',
      propIcon: '📖',
      propName: 'Open Storybook',
      propAnimation: 'spin',
      themeColor: '#E8D0B5',
      bgGradient: 'from-[#E8D0B5] to-[#F9F3D9]',
      borderColor: '#1C1C1C',
      headline: 'Patient-Friendly Knowledge Parchment',
      bodyText: 'Translating clinical complexity into daily actionable habits: drink 8oz water at 08:00, complete 20 min morning walk, and log evening sleep quality.',
      shantyVerse: 'Drink your water, walk your mile! Old Scribes records it with a smile!',
      metrics: [
        { label: 'Health Literacy', value: 'Grade 6', status: 'normal' },
        { label: 'Action Items', value: '3 Steps', status: 'normal' },
        { label: 'Comprehension', value: '100%', status: 'normal' }
      ],
      voiceModelName: 'Orpheus (Warm Scholar)',
      voiceTone: 'Warm, encouraging storyteller cadence',
      pitch: 1.05,
      rate: 0.9
    }
  ];

  currentStep = computed(() => {
    return this.steps.find((s) => s.act === this.activeAct()) || this.steps[0];
  });

  selectAct(act: number) {
    this.activeAct.set(act);
    this.stopVoice();
  }

  nextAct() {
    if (this.activeAct() < 4) {
      this.activeAct.update((a) => a + 1);
      this.stopVoice();
    }
  }

  prevAct() {
    if (this.activeAct() > 1) {
      this.activeAct.update((a) => a - 1);
      this.stopVoice();
    }
  }

  resetAct() {
    this.activeAct.set(1);
    this.stopVoice();
  }

  toggleSingalong() {
    if (this.isSingalongActive()) {
      this.isSingalongActive.set(false);
      this.stopVoice();
    } else {
      this.isSingalongActive.set(true);
      this.playShantySequence(0);
    }
  }

  private playShantySequence(index: number) {
    if (!this.isSingalongActive() || index >= this.steps.length) {
      this.isSingalongActive.set(false);
      this.isPlayingVoice.set(false);
      return;
    }

    const step = this.steps[index];
    this.activeAct.set(step.act);

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${step.personaName} sings! ${step.shantyVerse}`);

    utterance.pitch = step.pitch;
    utterance.rate = step.rate * 0.95; // Slightly rhythmic pace for singing

    utterance.onstart = () => this.isPlayingVoice.set(true);
    utterance.onend = () => {
      if (this.isSingalongActive()) {
        setTimeout(() => this.playShantySequence(index + 1), 600);
      }
    };
    utterance.onerror = () => this.isPlayingVoice.set(false);

    window.speechSynthesis.speak(utterance);
  }

  speakDispatch(step: INarrativeStep) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (this.isPlayingVoice()) {
      this.stopVoice();
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = `${step.personaName} reporting. ${step.quote}. ${step.headline}. ${step.bodyText}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    utterance.pitch = step.pitch;
    utterance.rate = step.rate;

    utterance.onstart = () => this.isPlayingVoice.set(true);
    utterance.onend = () => this.isPlayingVoice.set(false);
    utterance.onerror = () => this.isPlayingVoice.set(false);

    window.speechSynthesis.speak(utterance);
  }

  stopVoice() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlayingVoice.set(false);
  }

  ngOnDestroy() {
    this.stopVoice();
  }
}
