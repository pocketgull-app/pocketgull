import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { BioHapticFeedbackService } from '../services/bio-haptic-feedback.service';
import { ConformalReadmissionCardComponent } from './conformal-readmission-card.component';

@Component({
  selector: 'app-vagal-biofeedback-dock',
  standalone: true,
  imports: [CommonModule, ConformalReadmissionCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full mb-8 p-5 sm:p-7 bg-[#F9F3D9] dark:bg-zinc-950 text-[#1C1C1C] dark:text-zinc-100 rounded-2xl border-2 border-[#F6B12B] dark:border-[#F6B12B]/80 shadow-[4px_6px_0px_0px_rgba(28,28,28,0.85)] font-mono overflow-hidden pocket-gull-card">
      
      <!-- Background Texture & Papercraft Overlay -->
      <div class="absolute inset-0 opacity-15 pointer-events-none mix-blend-multiply bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:12px_12px]"></div>

      <!-- Conformal Prediction & Pareto Trade-Off Card -->
      <app-conformal-readmission-card class="mb-6 block" />

      <!-- Top Header & Status Telemetry Bar -->
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-dashed border-[#1C1C1C]/20 dark:border-zinc-800 pb-5 mb-6 font-mono">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-[#F6B12B] text-zinc-950 border-2 border-[#1C1C1C] flex items-center justify-center text-2xl shadow-[2px_2px_0px_0px_rgba(28,28,28,0.9)] animate-bounce shrink-0">
            🔦
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-extrabold uppercase tracking-widest text-[#EF6658] dark:text-orange-400">Sentinel Telemetry Dock</span>
              <span class="text-xs px-2.5 py-0.5 rounded-md bg-[#3B82F6] text-white font-bold tracking-wider uppercase border border-[#1C1C1C]">
                Sentinel 🔦 Dispatch
              </span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 border border-[#1C1C1C] uppercase">
                Real-Time Checkin Dock
              </span>
            </div>
            <h3 class="text-base sm:text-lg font-black uppercase tracking-tight text-[#1C1C1C] dark:text-zinc-100 mt-1">
              Vagal Resonance & Biofeedback Quick-Dock
            </h3>
            <p class="text-xs sm:text-sm text-[#1C1C1C]/70 dark:text-zinc-400 mt-0.5 font-sans leading-relaxed">
              Log instant vagal tone check-ins, HRV micro-session completions, and clinical notes directly to patient state.
            </p>
          </div>
        </div>

        <div class="text-right text-xs sm:text-sm text-[#1C1C1C]/70 dark:text-zinc-400 font-mono shrink-0">
          <span>Logged Sessions Today: <strong class="text-orange-700 dark:text-orange-400 font-black">{{ sessionCount() }}</strong></span>
        </div>
      </div>

      <!-- Quick Action Biofeedback Dock Buttons with 3D Double-Click Flip State Machines -->
      <div class="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        
        <!-- Action 1: 5-Min Vagal Breathing Card -->
        @let isBreathingFlipped = isCardFlipped('breathing');
        <div (dblclick)="toggleCardFlip('breathing'); $event.stopPropagation()"
             class="relative perspective-1000 group cursor-pointer h-60"
             title="Double-click to flip over for Polyvagal Rationale & Autonomic Science">
          
          <div [class.rotate-y-180]="isBreathingFlipped"
               class="relative w-full h-full transition-transform duration-500 transform-style-3d">

            <!-- FRONT FACE -->
            <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden">
              <div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-xs font-black text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-tight font-mono">
                    <span class="text-lg">🫁</span>
                    <span>5-Min Resonant Breathing</span>
                  </div>
                  <span class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    dblclick 🔄
                  </span>
                </div>
                <p class="text-xs text-[#1C1C1C]/70 dark:text-zinc-400 font-sans leading-relaxed mt-2">
                  6.0 BPM pace (Inhale 5s, Exhale 5s) to boost RMSSD HRV and activate baroreflex sensitivity.
                </p>
              </div>
              <button (click)="logBreathingSession(); $event.stopPropagation()"
                class="w-full py-2.5 px-4 rounded-xl border-2 border-[#1C1C1C] bg-[#F6B12B] text-[#1C1C1C] font-mono text-xs font-black uppercase transition hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)]">
                ✓ Log 5-Min Session
              </button>
            </div>

            <!-- BACK FACE -->
            <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] bg-indigo-950 text-white shadow-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden font-sans text-xs">
              <div>
                <div class="flex items-center justify-between border-b border-indigo-800 pb-1.5 mb-2 font-mono text-xs">
                  <span class="text-indigo-300 font-bold uppercase flex items-center gap-1">
                    <span>🧬</span> Baroreflex Mechanism
                  </span>
                  <span class="text-indigo-400 text-[10px]">dblclick flip</span>
                </div>
                <p class="text-[11px] text-indigo-100 leading-snug">
                  Breathing at 0.1 Hz synchronizes heart rate variability with respiratory sinus arrhythmia (RSA), signaling safety to the nucleus tractus solitarius (NTS) in the brainstem.
                </p>
              </div>
              <div class="pt-1.5 border-t border-indigo-900 font-mono text-[9px] text-indigo-300 flex justify-between">
                <span>Ventral Vagal Tone Active</span>
                <span>Double-click to return</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Action 2: HRV Coherence Micro-Checkin Card -->
        @let isHrvFlipped = isCardFlipped('hrv');
        <div (dblclick)="toggleCardFlip('hrv'); $event.stopPropagation()"
             class="relative perspective-1000 group cursor-pointer h-60"
             title="Double-click to flip over for HRV Coherence Rationale">
          
          <div [class.rotate-y-180]="isHrvFlipped"
               class="relative w-full h-full transition-transform duration-500 transform-style-3d">

            <!-- FRONT FACE -->
            <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden">
              <div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-xs font-black text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-tight font-mono">
                    <span class="text-lg">💓</span>
                    <span>HRV Coherence Check-in</span>
                  </div>
                  <span class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    dblclick 🔄
                  </span>
                </div>
                <p class="text-xs text-[#1C1C1C]/70 dark:text-zinc-400 font-sans leading-relaxed mt-2">
                  Record instantaneous high HRV coherence status post-AVS or meditation exercise.
                </p>
              </div>
              <button (click)="logHrvCoherence(); $event.stopPropagation()"
                class="w-full py-2.5 px-4 rounded-xl border-2 border-[#1C1C1C] bg-[#F6B12B] text-[#1C1C1C] font-mono text-xs font-black uppercase transition hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)]">
                ✓ Record High Coherence
              </button>
            </div>

            <!-- BACK FACE -->
            <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] bg-emerald-950 text-white shadow-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden font-sans text-xs">
              <div>
                <div class="flex items-center justify-between border-b border-emerald-800 pb-1.5 mb-2 font-mono text-xs">
                  <span class="text-emerald-300 font-bold uppercase flex items-center gap-1">
                    <span>💚</span> Sympathovagal Balance
                  </span>
                  <span class="text-emerald-400 text-[10px]">dblclick flip</span>
                </div>
                <p class="text-[11px] text-emerald-100 leading-snug">
                  High coherence indicates optimal parasympathetic vagal dominance over sympathetic fight-or-flight drivers, promoting cellular repair.
                </p>
              </div>
              <div class="pt-1.5 border-t border-emerald-900 font-mono text-[9px] text-emerald-300 flex justify-between">
                <span>Parasympathetic Dominance</span>
                <span>Double-click to return</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Action 3: TCM Shen & Vata Calming Card -->
        @let isTeaFlipped = isCardFlipped('tea');
        <div (dblclick)="toggleCardFlip('tea'); $event.stopPropagation()"
             class="relative perspective-1000 group cursor-pointer h-60"
             title="Double-click to flip over for Energetic & Botanical Rationale">
          
          <div [class.rotate-y-180]="isTeaFlipped"
               class="relative w-full h-full transition-transform duration-500 transform-style-3d">

            <!-- FRONT FACE -->
            <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden">
              <div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-xs font-black text-[#1C1C1C] dark:text-zinc-100 uppercase tracking-tight font-mono">
                    <span class="text-lg">☯️</span>
                    <span>Shen & Vata Calming Tea</span>
                  </div>
                  <span class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    dblclick 🔄
                  </span>
                </div>
                <p class="text-xs text-[#1C1C1C]/70 dark:text-zinc-400 font-sans leading-relaxed mt-2">
                  Confirm ingestion of warm ginger jujube tea to soothe Stomach Vata and kindle Agni.
                </p>
              </div>
              <button (click)="logElixirTea(); $event.stopPropagation()"
                class="w-full py-2.5 px-4 rounded-xl border-2 border-[#1C1C1C] bg-[#F6B12B] text-[#1C1C1C] font-mono text-xs font-black uppercase transition hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)]">
                ✓ Confirm Elixir Ingestion
              </button>
            </div>

            <!-- BACK FACE -->
            <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] bg-amber-950 text-white shadow-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden font-sans text-xs">
              <div>
                <div class="flex items-center justify-between border-b border-amber-800 pb-1.5 mb-2 font-mono text-xs">
                  <span class="text-amber-300 font-bold uppercase flex items-center gap-1">
                    <span>🍵</span> Energetic Botanical Rationale
                  </span>
                  <span class="text-amber-400 text-[10px]">dblclick flip</span>
                </div>
                <p class="text-[11px] text-amber-100 leading-snug">
                  Warm ginger & jujube date decoction grounds unrooted Heart Shen, pacifies cold digestive Vata, and kindles metabolic Agni.
                </p>
              </div>
              <div class="pt-1.5 border-t border-amber-900 font-mono text-[9px] text-amber-300 flex justify-between">
                <span>Shen & Agni Grounding</span>
                <span>Double-click to return</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- Quick Text Note Publisher Input -->
      <div class="relative z-10 p-5 rounded-2xl border-2 border-[#1C1C1C] bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] sub-panel font-mono">
        <h4 class="text-xs font-black uppercase tracking-widest text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-1.5">
          <span>✍️</span> Log Micro-Observation to Patient Chart
        </h4>
        <div class="flex flex-col sm:flex-row gap-3">
          <input #noteInput type="text" placeholder="Enter clinical observation, symptom resolution, or biofeedback note..."
            class="flex-1 py-3 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-[#1C1C1C] text-xs text-[#1C1C1C] dark:text-zinc-100 placeholder-[#1C1C1C]/50 dark:placeholder-zinc-500 focus:outline-none font-sans">
          <button (click)="publishClinicalNote(noteInput.value); noteInput.value=''"
            class="px-5 py-3 rounded-xl border-2 border-[#1C1C1C] bg-[#F6B12B] text-[#1C1C1C] font-mono text-xs font-black uppercase transition hover:scale-105 active:scale-95 cursor-pointer shadow-[2px_3px_0px_0px_rgba(28,28,28,0.85)] shrink-0">
            Publish Note 📌
          </button>
        </div>
      </div>

    </div>
  `
})
export class VagalBiofeedbackDockComponent {
  patientState = inject(PatientStateService);
  bioHaptic = inject(BioHapticFeedbackService);
  sessionCount = signal<number>(2);

  readonly flippedCards = signal<Set<string>>(new Set());

  private lastFlipTimeMap = new Map<string, number>();

  toggleCardFlip(id: string, event?: Event) {
    if (event) event.stopPropagation();
    const now = Date.now();
    const last = this.lastFlipTimeMap.get(id) || 0;
    if (now - last < 200) return;
    this.lastFlipTimeMap.set(id, now);
    const current = new Set(this.flippedCards());
    if (current.has(id)) current.delete(id);
    else current.add(id);
    this.flippedCards.set(current);
  }

  isCardFlipped(id: string): boolean {
    return this.flippedCards().has(id);
  }

  logBreathingSession() {
    this.sessionCount.update(c => c + 1);
    this.bioHaptic.playSolfeggioTone(528, 2500);
    this.bioHaptic.triggerHapticPulse('exhale');
    this.patientState.addClinicalNote({
      id: `vagal-session-${Date.now()}`,
      text: '🫁 Completed 5-Min 0.1 Hz Resonant Vagal Breathing micro-session. HRV coherence boosted with 528Hz Solfeggio bio-haptic feedback.',
      sourceLens: 'Functional Protocols',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert('🫁 Vagal Breathing Session Logged! 528Hz Solfeggio & Web Haptic Feedback Engaged.');
  }

  logHrvCoherence() {
    this.sessionCount.update(c => c + 1);
    this.bioHaptic.playSolfeggioTone(432, 2000);
    this.bioHaptic.triggerDualPulse();
    this.patientState.addClinicalNote({
      id: `hrv-checkin-${Date.now()}`,
      text: '💓 Recorded High HRV Coherence check-in (RMSSD > 65 ms). 432Hz Harmonic Solfeggio active.',
      sourceLens: 'Functional Protocols',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert('💓 High HRV Coherence Logged with 432Hz Harmonic Entrainment!');
  }

  logElixirTea() {
    this.sessionCount.update(c => c + 1);
    this.patientState.addClinicalNote({
      id: `tea-checkin-${Date.now()}`,
      text: '☯️ Confirmed Warm Ginger Jujube Tea ingestion. Stomach Vata pacified & Agni supported.',
      sourceLens: 'Nutrition',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert('🍵 Elixir Ingestion Logged!');
  }

  publishClinicalNote(text: string) {
    if (!text || text.trim().length === 0) return;
    this.patientState.addClinicalNote({
      id: `user-note-${Date.now()}`,
      text: text.trim(),
      sourceLens: 'General Overview',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert('📌 Micro-Observation Logged to Patient Chart!');
  }
}
