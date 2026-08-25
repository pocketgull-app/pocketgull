import { Injectable, effect, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { AmbientLightingService } from './ambient-lighting.service';

@Injectable({
  providedIn: 'root'
})
export class StressInterventionService {
  private state = inject(PatientStateService);
  private lighting = inject(AmbientLightingService);

  private hasTriggered = false;

  constructor() {
    // Automatically trigger interventions when stress spikes
    effect(() => {
      const vitals = this.state.vitals();
      if (!vitals) return;

      // High-stress heuristic (e.g., HR > 100 or BP Systolic > 140)
      const isHighStress = parseInt(vitals.hr, 10) > 100 || parseInt(vitals.bp.split('/')[0], 10) > 140;

      if (isHighStress && !this.hasTriggered) {
        this.triggerStressProtocol();
      } else if (!isHighStress && this.hasTriggered) {
        this.hasTriggered = false;
        // Disable override when stress normalizes
        this.lighting.setEmergencyOverride(false);
        this.state.isAvsSessionActive.set(false);
      }
    });
  }

  private triggerStressProtocol() {
    this.hasTriggered = true;

    // 1. Dim Philips Hue lights to a warmer temperature
    // 10000 hue is a warm orange/amber, 200 sat is rich, 50 bri is dim
    this.lighting.setEmergencyOverride(true, 10000, 200, 50);

    // 2. Fade in a 432Hz binaural beat (delta brainwave is configured with 432Hz carrier)
    this.state.avsBrainwaveFrequency.set('delta');
    
    // 3. Prompt the clinician on-screen with targeted Box Breathing
    // 4.0 breaths per minute = 15 second cycle (inhale 4, hold 3.5, exhale 4, hold 3.5)
    this.state.avsBreathingRate.set(4.0); 
    
    // Triggering this opens the breathing UI and starts the audio
    this.state.isAvsSessionActive.set(true); 
  }
}
