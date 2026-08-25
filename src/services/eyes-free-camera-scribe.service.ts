import { Injectable, signal, computed } from '@angular/core';

export type VisionScribeMode = 
  | 'MEDICATION_IDENTIFIER'
  | 'ROOM_NAVIGATION'
  | 'DOCUMENT_READER'
  | 'LIGHT_AND_COLOR';

export interface IVisionInspectionResult {
  mode: VisionScribeMode;
  headline: string;
  detailedNarration: string;
  spatialFramingCue: string;
  confidenceScore: number;
  tactileHapticCue: 'CONFIRM' | 'REMINDER' | 'WARNING';
  audioEarconHz: number;
  keyDetails: Array<{ label: string; value: string }>;
}

@Injectable({
  providedIn: 'root',
})
export class EyesFreeCameraScribeService {
  readonly isCameraStreaming = signal<boolean>(false);
  readonly activeMode = signal<VisionScribeMode>('MEDICATION_IDENTIFIER');
  readonly isAnalyzing = signal<boolean>(false);
  readonly isSpeaking = signal<boolean>(false);
  readonly lastInspection = signal<IVisionInspectionResult | null>(null);

  private readonly modePresets: Record<VisionScribeMode, IVisionInspectionResult> = {
    MEDICATION_IDENTIFIER: {
      mode: 'MEDICATION_IDENTIFIER',
      headline: 'Metformin Hydrochloride 500 mg',
      detailedNarration: 'You are holding a white oval pill bottle of Metformin Hydrochloride 500 milligrams. Prescribed for morning glucose control. Expiration date is November 2027. Bottle is centered and clear.',
      spatialFramingCue: '✅ Pill bottle centered in frame (15 cm away).',
      confidenceScore: 0.98,
      tactileHapticCue: 'CONFIRM',
      audioEarconHz: 523.25,
      keyDetails: [
        { label: 'Medication', value: 'Metformin HCl' },
        { label: 'Strength', value: '500 mg' },
        { label: 'Dosage Instruction', value: 'Take 1 tablet with breakfast' },
        { label: 'Expiration Date', value: '11/2027' },
        { label: 'Imprint Shape', value: 'Oval scored tablet' }
      ]
    },
    ROOM_NAVIGATION: {
      mode: 'ROOM_NAVIGATION',
      headline: 'Clear Path to Living Room Doorway',
      detailedNarration: 'Straight path ahead for 10 steps. A wooden dining chair is positioned 3 feet on your immediate right. The open doorway is directly ahead at 12 o’clock.',
      spatialFramingCue: '🚶 Clear corridor ahead • Obstacle on right.',
      confidenceScore: 0.94,
      tactileHapticCue: 'REMINDER',
      audioEarconHz: 440.0,
      keyDetails: [
        { label: 'Center Distance', value: '3.2 meters clear' },
        { label: 'Right Periphery', value: 'Chair (0.9 m)' },
        { label: 'Left Periphery', value: 'Smooth wall' },
        { label: 'Floor Surface', value: 'Hardwood / Low slip' }
      ]
    },
    DOCUMENT_READER: {
      mode: 'DOCUMENT_READER',
      headline: 'Hospital Discharge Care Summary',
      detailedNarration: 'Clinical Discharge Plan: Patient is recovering well from orthopedic arthroscopy. Keep dressing dry for 48 hours. Schedule physical therapy follow-up on Tuesday at 10 AM.',
      spatialFramingCue: '📄 Document fully captured • 4 paragraphs found.',
      confidenceScore: 0.96,
      tactileHapticCue: 'CONFIRM',
      audioEarconHz: 587.33,
      keyDetails: [
        { label: 'Document Type', value: 'Discharge Summary' },
        { label: 'Clinic Name', value: 'Memorial Health Orthopedics' },
        { label: 'Next Appointment', value: 'Tuesday 10:00 AM' },
        { label: 'Primary Directive', value: 'Keep wound dressing dry' }
      ]
    },
    LIGHT_AND_COLOR: {
      mode: 'LIGHT_AND_COLOR',
      headline: 'Warm Overhead Light & Navy Blue Garment',
      detailedNarration: 'Overhead room lights are turned on with bright warm lighting. You are holding a dark navy blue long-sleeve cotton sweater.',
      spatialFramingCue: '💡 Room illuminated (380 Lux) • High contrast.',
      confidenceScore: 0.99,
      tactileHapticCue: 'CONFIRM',
      audioEarconHz: 659.25,
      keyDetails: [
        { label: 'Room Lighting', value: 'On / 380 Lux (Bright)' },
        { label: 'Natural Daylight', value: 'Window on right' },
        { label: 'Object Color', value: 'Deep Navy Blue (#1B2A4A)' },
        { label: 'Fabric Texture', value: 'Knitted Cotton' }
      ]
    }
  };

  constructor() {
    this.lastInspection.set(this.modePresets.MEDICATION_IDENTIFIER);
  }

  setMode(mode: VisionScribeMode): void {
    this.activeMode.set(mode);
    this.analyzeCurrentFrame(mode);
  }

  startCamera(): void {
    this.isCameraStreaming.set(true);
    this.speakNarration('Camera activated. Point your phone at objects, pill bottles, or documents.');
  }

  stopCamera(): void {
    this.isCameraStreaming.set(false);
    this.stopSpeech();
  }

  /**
   * Analyzes the active camera frame and generates spoken visual intelligence.
   */
  analyzeCurrentFrame(mode: VisionScribeMode = this.activeMode()): void {
    this.isAnalyzing.set(true);
    
    // Simulate multi-modal optical capture delay (150ms)
    setTimeout(() => {
      const result = this.modePresets[mode];
      this.lastInspection.set(result);
      this.isAnalyzing.set(false);
      this.speakNarration(result.detailedNarration);
    }, 150);
  }

  speakNarration(text: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (this.isSpeaking()) {
      window.speechSynthesis.cancel();
      this.isSpeaking.set(false);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => this.isSpeaking.set(false);
    utterance.onerror = () => this.isSpeaking.set(false);

    this.isSpeaking.set(true);
    window.speechSynthesis.speak(utterance);
  }

  stopSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking.set(false);
  }
}
