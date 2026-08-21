import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EyesFreeAccessibilityService, ITactileMedicationGuide } from '../services/eyes-free-accessibility.service';

@Component({
  selector: 'app-eyes-free-accessibility-hub',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="glass-card-dark rounded-3xl p-6 sm:p-8 border-2 border-indigo-500/40 shadow-2xl relative overflow-hidden space-y-6"
      role="region"
      aria-label="Eyes-Free Audio and Tactile Accessibility Hub"
    >
      <div class="rams-grill"><div></div><div></div><div></div><div></div></div>

      <!-- Live Screen Reader Announcement Region (Hidden visually or visible as HUD) -->
      <div 
        role="status" 
        aria-live="polite" 
        class="sr-only"
      >
        {{ service.lastScreenReaderAnnouncement() }}
      </div>

      <!-- Header & Master Eyes-Free Toggle -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
            <span>🦯 WCAG 2.2 AAA • Eyes-Free &amp; Sonification</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white">
            Eyes-Free Audio &amp; Tactile Accessibility Hub
          </h2>
          <p class="text-xs sm:text-sm text-stone-300">
            Audio sonification of vital signs, tactile haptic pulses, and spoken medication shape crosswalks for blind and low-vision users.
          </p>
        </div>

        <button 
          (click)="service.toggleEyesFreeMode()"
          class="px-5 py-3 rounded-2xl font-bold font-mono text-xs uppercase tracking-wider transition border-2 cursor-pointer flex items-center gap-2 shadow-xl"
          [ngClass]="{
            'bg-indigo-500 text-stone-950 border-indigo-300 shadow-indigo-500/30': service.isEyesFreeModeActive(),
            'bg-stone-900 text-indigo-300 border-indigo-500/40 hover:bg-stone-800': !service.isEyesFreeModeActive()
          }"
          [attr.aria-pressed]="service.isEyesFreeModeActive()"
          aria-label="Toggle Eyes-Free Mode"
        >
          <span class="text-lg">{{ service.isEyesFreeModeActive() ? '🔊' : '🦯' }}</span>
          <span>{{ service.isEyesFreeModeActive() ? 'Eyes-Free Active' : 'Enable Eyes-Free' }}</span>
        </button>
      </div>

      <!-- Active Screen Reader & Audio Telemetry Banner -->
      <div class="p-4 rounded-2xl bg-stone-900/90 border border-indigo-500/30 space-y-2">
        <div class="flex items-center justify-between text-xs font-mono font-bold text-stone-400">
          <span>🔊 Live Audio &amp; Screen Reader Telemetry Feed</span>
          <span class="text-indigo-400">aria-live="polite"</span>
        </div>
        <div class="p-3 rounded-xl bg-black/60 border border-white/5 font-mono text-xs text-indigo-200 min-h-10 flex items-center">
          {{ service.lastScreenReaderAnnouncement() || 'Awaiting auditory prompt or biometric sonification query...' }}
        </div>
      </div>

      <!-- 1. Biometric Audio Sonification Station -->
      <div class="space-y-3">
        <div class="flex items-center justify-between text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">
          <span>🎵 1. Biometric Audio Sonification (Hear Your Health)</span>
          <span class="text-teal-400">Web Audio API</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button 
            (click)="sonifyHeartRate()"
            class="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/50 text-left transition cursor-pointer space-y-1 group"
            aria-label="Sonify Heart Rate: 72 beats per minute"
          >
            <div class="flex items-center justify-between">
              <span class="text-2xl">🫀</span>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">Hear 72 BPM</span>
            </div>
            <div class="text-sm font-bold text-white group-hover:text-rose-200">Heart Rate Pitch</div>
            <p class="text-[11px] text-stone-300">Plays harmonic sine wave tuned to resting cardiovascular rhythm.</p>
          </button>

          <button 
            (click)="sonifyGlucose()"
            class="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/50 text-left transition cursor-pointer space-y-1 group"
            aria-label="Sonify Blood Glucose: 115 milligrams per deciliter"
          >
            <div class="flex items-center justify-between">
              <span class="text-2xl">🩸</span>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Hear 115 mg/dL</span>
            </div>
            <div class="text-sm font-bold text-white group-hover:text-cyan-200">Glucose Cadence</div>
            <p class="text-[11px] text-stone-300">Frequency rises safely for stable euglycemic range.</p>
          </button>

          <button 
            (click)="sonifyRespiration()"
            class="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/50 text-left transition cursor-pointer space-y-1 group"
            aria-label="Sonify Respiration: 14 breaths per minute"
          >
            <div class="flex items-center justify-between">
              <span class="text-2xl">🫁</span>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Hear 14 BPM</span>
            </div>
            <div class="text-sm font-bold text-white group-hover:text-emerald-200">Paced Respiration</div>
            <p class="text-[11px] text-stone-300">Soothing low harmonic sweep for breath coherence.</p>
          </button>

          <button 
            (click)="sonifyBloodPressure()"
            class="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/50 text-left transition cursor-pointer space-y-1 group"
            aria-label="Sonify Systolic Blood Pressure: 120 millimeters of mercury"
          >
            <div class="flex items-center justify-between">
              <span class="text-2xl">🩺</span>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Hear 120 mmHg</span>
            </div>
            <div class="text-sm font-bold text-white group-hover:text-amber-200">Blood Pressure</div>
            <p class="text-[11px] text-stone-300">Harmonic pitch chord confirming optimal arterial pressure.</p>
          </button>
        </div>
      </div>

      <!-- 2. Tactile Medication Shape & Earcon Catalog -->
      <div class="space-y-3">
        <div class="flex items-center justify-between text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">
          <span>💊 2. Tactile Medication Shapes &amp; Audio Earcons</span>
          <span class="text-indigo-400">Non-Visual Recognition</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          @for (med of service.tactileMedications(); track med.medicationName) {
            <div class="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3 flex flex-col justify-between">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                    {{ med.schedule }}
                  </span>
                  <span class="text-[11px] font-mono text-amber-400 font-bold">
                    {{ med.dosage }}
                  </span>
                </div>
                <h4 class="text-sm font-extrabold text-white">{{ med.medicationName }}</h4>
                <p class="text-xs text-stone-300 leading-relaxed">
                  ✋ <strong>Tactile Feel:</strong> {{ med.tactileShapeDescription }}
                </p>
              </div>

              <div class="flex items-center gap-2 pt-2 border-t border-white/5">
                <button 
                  (click)="playEarcon(med)"
                  class="flex-1 py-2 px-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 font-mono text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                  [attr.aria-label]="'Play audio chime for ' + med.medicationName"
                >
                  <span>🔔</span>
                  <span>Play Pill Chime</span>
                </button>
                <button 
                  (click)="describeMedication(med)"
                  class="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs font-bold transition cursor-pointer"
                  [attr.aria-label]="'Read shape aloud for ' + med.medicationName"
                >
                  🗣️
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- 3. Bio-Haptic Vibration Test Triggers -->
      <div class="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <span class="text-stone-300 font-bold">📳 3. Physical Haptic Vibrations (Phone / Wearable):</span>
        <div class="flex flex-wrap gap-2">
          <button (click)="service.triggerHapticPattern('CONFIRM')" class="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold cursor-pointer">
            1 Tap (Confirm)
          </button>
          <button (click)="service.triggerHapticPattern('REMINDER')" class="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold cursor-pointer">
            2 Pulses (Reminder)
          </button>
          <button (click)="service.triggerHapticPattern('PACED_BREATHING')" class="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-teal-300 font-bold cursor-pointer">
            Wave (Breathing)
          </button>
        </div>
      </div>
    </div>
  `,
})
export class EyesFreeAccessibilityHubComponent {
  public service = inject(EyesFreeAccessibilityService);

  sonifyHeartRate(): void {
    this.service.sonifyVitalSign('heartRate', 72);
    this.service.triggerHapticPattern('CONFIRM');
  }

  sonifyGlucose(): void {
    this.service.sonifyVitalSign('glucose', 115);
    this.service.triggerHapticPattern('CONFIRM');
  }

  sonifyRespiration(): void {
    this.service.sonifyVitalSign('respiration', 14);
    this.service.triggerHapticPattern('PACED_BREATHING');
  }

  sonifyBloodPressure(): void {
    this.service.sonifyVitalSign('bloodPressure', 120);
    this.service.triggerHapticPattern('CONFIRM');
  }

  playEarcon(med: ITactileMedicationGuide): void {
    this.service.playMedicationEarcon(med.audioEarconFrequencyHz);
    this.service.announceScreenReader(`Played audio earcon chime for ${med.medicationName} (${med.schedule} schedule).`);
  }

  describeMedication(med: ITactileMedicationGuide): void {
    const text = `${med.medicationName}, ${med.dosage}, scheduled for ${med.schedule.toLowerCase()}. Tactile physical feel: ${med.tactileShapeDescription}`;
    this.service.speakText(text);
    this.service.announceScreenReader(text);
  }
}
