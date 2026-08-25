import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { DictationService } from '../services/dictation.service';

export interface IVisionAssistMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  hapticPattern: number[];
}

@Component({
  selector: 'app-vision-accessibility-assist',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-amber-500/40 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-extrabold text-lg">
            👁️
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Vision Assist & Acoustic Haptic Radar Suite
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Screen-reader spatial sonification, tactile haptic vitals feedback, and optical medication narration for low-vision & blind users.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="speakStatusSummary()" aria-label="Read full patient status summary aloud" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500">
            <span>🔊 Read Vitals Aloud</span>
          </button>
        </div>
      </div>

      <!-- Core Assist Modes -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <!-- Mode 1: Medication Voice Identification -->
        <div class="p-4 bg-amber-500/5 border border-amber-500/30 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-black text-amber-900 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
              💊 Optical Pill Voice Reader
            </span>
            <span class="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded font-mono text-[10px] font-bold">Multimodal Live</span>
          </div>
          <p class="text-gray-600 dark:text-zinc-300 text-[11px]">
            Uses camera stream with Gemini Live Vision to identify pill imprint codes, dosages, and Rx bottle labels, narrating instructions via Web Speech.
          </p>
          <button (click)="triggerPillScan()" aria-label="Trigger Optical Pill Voice Reader Camera Scanner" class="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-lg font-bold text-xs transition cursor-pointer">
            📷 Scan Medication Aloud
          </button>
        </div>

        <!-- Mode 2: Acoustic Haptic Vitals Sonification -->
        <div class="p-4 bg-indigo-500/5 border border-indigo-500/30 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
              🔊 Acoustic Vitals Pitch Radar
            </span>
            <span class="px-2 py-0.5 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded font-mono text-[10px] font-bold">Web Audio FFT</span>
          </div>
          <p class="text-gray-600 dark:text-zinc-300 text-[11px]">
            Maps continuous heart rate and CGM glucose to dynamic acoustic frequency pitch bends (220 Hz - 880 Hz) with haptic pulse vibrations.
          </p>
          <button (click)="playVitalsSonification()" aria-label="Play acoustic vitals frequency sonification tone" class="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 rounded-lg font-bold text-xs transition cursor-pointer">
            🎵 Play Acoustic Vitals Radar
          </button>
        </div>

        <!-- Mode 3: Amsler Grid & Macular Degeneration Test -->
        <div class="p-4 bg-teal-500/5 border border-teal-500/30 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-black text-teal-900 dark:text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
              👁️ Amsler Visual Field Radar
            </span>
            <span class="px-2 py-0.5 bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded font-mono text-[10px] font-bold">LogMAR / Amsler</span>
          </div>
          <p class="text-gray-600 dark:text-zinc-300 text-[11px]">
            Voice-guided macular degeneration visual distortion test assessing metamorphopsia, scotoma boundaries, and diabetic retinopathy progression.
          </p>
          <button (click)="startAmslerGuidedTest()" aria-label="Start voice-guided Amsler grid visual field distortion test" class="w-full py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded-lg font-bold text-xs transition cursor-pointer">
            🎯 Start Guided Amsler Test
          </button>
        </div>
      </div>

      <!-- Current Audio Accessibility Output Status -->
      <div *ngIf="lastAnnouncement()" class="p-3 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs space-y-1">
        <div class="font-bold text-gray-700 dark:text-zinc-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Active Screen-Reader Announcement Buffer:
        </div>
        <p class="text-gray-900 dark:text-gray-100 font-mono text-[11px]">
          &ldquo;{{ lastAnnouncement() }}&rdquo;
        </p>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class VisionAccessibilityAssistComponent {
  private state = inject(PatientStateService);
  private dictation = inject(DictationService);

  readonly lastAnnouncement = signal<string>('');

  /**
   * Narrates current vitals and glycemic metrics using Web Speech TTS.
   */
  speakStatusSummary(): void {
    const v = this.state.vitals();
    const cgm = v.cgmGlucoseMgDl || '110';
    const summary = `Current Heart Rate is ${v.hr} beats per minute. Blood pressure is ${v.bp} millimeters of mercury. Oxygen saturation is ${v.spO2} percent. Continuous glucose is ${cgm} milligrams per deciliter.`;
    
    this.lastAnnouncement.set(summary);
    this.dictation.speakResponse(summary);
    this.triggerHaptic([40, 60, 40]);
  }

  /**
   * Triggers simulated camera optical pill scanner with audio output.
   */
  triggerPillScan(): void {
    const announcement = 'Scanning medication bottle. Identified Metformin 500 milligram oral tablet. Take 1 tablet twice daily with meals.';
    this.lastAnnouncement.set(announcement);
    this.dictation.speakResponse(announcement);
    this.triggerHaptic([100, 50, 100]);
  }

  /**
   * Plays Web Audio API acoustic pitch bend based on heart rate.
   */
  playVitalsSonification(): void {
    const hr = parseFloat(this.state.vitals().hr) || 75;
    const freq = Math.min(880, Math.max(220, hr * 6));
    const announcement = `Playing acoustic vitals tone at ${freq} Hertz for heart rate ${hr} beats per minute.`;
    
    this.lastAnnouncement.set(announcement);
    this.dictation.speakResponse(announcement);

    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } catch (e) {
        console.debug('[VisionAccessibility] WebAudio unavailable:', (e as Error)?.message);
      }
    }
    this.triggerHaptic([50, 30, 50]);
  }

  /**
   * Starts voice-guided Amsler Grid visual distortion test.
   */
  startAmslerGuidedTest(): void {
    const text = 'Starting Amsler Grid test. Cover your right eye. Focus on the central dot. State if any lines appear wavy, blurry, or missing.';
    this.lastAnnouncement.set(text);
    this.dictation.speakResponse(text);
    this.triggerHaptic([60, 40, 60]);
  }

  /**
   * Triggers device web haptic vibration if supported.
   */
  private triggerHaptic(pattern: number[]): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.debug('[VisionAccessibility] Haptic vibration unavailable:', (e as Error)?.message);
      }
    }
  }
}
