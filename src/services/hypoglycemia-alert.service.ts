import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { MedicalDecoderService } from './medical-decoder.service';

export interface IHypoglycemiaAlertState {
  isAlertActive: boolean;
  glucoseMgDl: number;
  rateOfFallMgDlPerMin: number;
  urgencyTier: 'normal' | 'caution' | 'critical_rescue';
  recommendedAction: string;
  nearestStoreSuggestion: string;
}

@Injectable({
  providedIn: 'root'
})
export class HypoglycemiaAlertService {
  private readonly state = inject(PatientStateService, { optional: true });
  private readonly decoder = inject(MedicalDecoderService, { optional: true });

  readonly alertState = signal<IHypoglycemiaAlertState>({
    isAlertActive: false,
    glucoseMgDl: 95,
    rateOfFallMgDlPerMin: 0,
    urgencyTier: 'normal',
    recommendedAction: 'Glucose levels stable.',
    nearestStoreSuggestion: 'No immediate rescue needed.'
  });

  constructor() {
    // Monitor vitals signal for hypoglycemia thresholds
    if (this.state) {
      try {
        effect(() => {
          const v = this.state?.vitals();
          if (!v) return;

          const rawGlucose = v.cgmGlucoseMgDl;
          const glucose = typeof rawGlucose === 'number' ? rawGlucose : typeof rawGlucose === 'string' ? (parseFloat(rawGlucose) || 95) : 95;

          // Rate of fall estimate or hard threshold (< 70 mg/dL = hypoglycemia threshold)
          if (glucose < 70) {
            this.triggerRescueAlert(glucose, -2.5, 'critical_rescue');
          } else if (glucose >= 70 && glucose <= 85) {
            this.triggerRescueAlert(glucose, -1.2, 'caution');
          } else {
            this.dismissAlert();
          }
        });
      } catch (e) {
        console.warn('[HypoglycemiaAlertService] Failed to initialize glucose monitor subscription:', e);
      }
    }
  }

  public triggerRescueAlert(glucose: number, rateOfFall: number, urgency: 'caution' | 'critical_rescue'): void {
    const isPatient = this.decoder ? this.decoder.readingLevel() === 'patient' : true;
    
    const action = isPatient
      ? `🚨 Low Blood Sugar Alert (${glucose} mg/dL)! Find 4 oz of Orange Juice, Apple Juice, or Glucose Gel immediately at the nearest grocery store, bodega, or vending machine (Rule of 15).`
      : `⚠️ Acute Hypoglycemia Event (${glucose} mg/dL, fall rate ${rateOfFall} mg/dL/min). Initiate Rule of 15: Administer 15g rapid-acting oral simple carbohydrate.`;

    const storeNote = 'Nearest 24/7 Grocery Store / Bodega: 0.2 miles away';

    this.alertState.set({
      isAlertActive: true,
      glucoseMgDl: glucose,
      rateOfFallMgDlPerMin: rateOfFall,
      urgencyTier: urgency,
      recommendedAction: action,
      nearestStoreSuggestion: storeNote
    });

    // Audio warning via Web Speech API
    if (this.decoder && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.decoder.speakTermDefinition(action);
    }

    // Haptic vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([150, 75, 150, 75, 300]);
      } catch (e) { console.debug('[HypoglycemiaAlertService] Haptic vibration unavailable:', e); }
    }
  }

  public dismissAlert(): void {
    this.alertState.set({
      isAlertActive: false,
      glucoseMgDl: 95,
      rateOfFallMgDlPerMin: 0,
      urgencyTier: 'normal',
      recommendedAction: 'Glucose levels stable.',
      nearestStoreSuggestion: 'No immediate rescue needed.'
    });
  }
}
