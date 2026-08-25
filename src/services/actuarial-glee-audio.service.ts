import { Injectable, signal, inject, computed } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export interface ISheetNote {
  pitch: string; // e.g. 'C4', 'E4', 'G4', 'C5'
  label: string; // 'Do', 'Mi', 'Sol', 'Do'
  role: 'A' | 'B' | 'Both';
  duration: 'quarter' | 'half' | 'whole' | 'eighth';
  staffStep: number; // 0 for C4, 1 for D4, 2 for E4, 3 for F4, 4 for G4, 5 for A4, 6 for B4, 7 for C5, 8 for D5, 9 for E5
}

export interface IGleeTrackFull {
  trackNumber: number;
  title: string;
  subtitle: string;
  paradigm: 'western' | 'eastern' | 'ayurvedic' | 'longevity';
  duetRoles: { roleA: string; roleB: string };
  lyrics: { time: number; role: 'A' | 'B' | 'Both'; text: string }[];
  qalyBonus: number;
  bpm: number;
  icon: string;
  keySignature: string;
  timeSignature: string;
  chordFrequencies: number[][];
  sheetNotes: ISheetNote[];
  biologicalMechanism: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActuarialGleeAudioService {
  private state = inject(PatientStateService);

  // FHIR Telemetry-Adapted Dynamic Audio Parameters
  readonly fhirAudioTelemetry = computed(() => {
    const vitals = this.state.vitals();
    const hr = parseFloat(vitals.hr) || 72;
    const temp = parseFloat(vitals.temp) || 98.6;
    const issues = this.state.issues();
    const allIssues = Object.values(issues).flat();
    const hasStress = allIssues.some(i => 
      (i.description && (i.description.toLowerCase().includes('anxiety') || i.description.toLowerCase().includes('stress') || i.description.toLowerCase().includes('pain'))) ||
      (i.name && (i.name.toLowerCase().includes('anxiety') || i.name.toLowerCase().includes('stress') || i.name.toLowerCase().includes('pain')))
    );

    // Dynamic Target Entrainment Tempo: deceleration towards 60 bpm if tachycardic
    const targetBpm = hr > 90 ? 60 : (hr < 55 ? 72 : Math.round(hr * 0.85));

    // Dynamic Solfeggio Carrier Offset based on inflammatory temperature
    const solfeggioCarrierHz = temp > 99.5 ? 432.0 : 528.0;

    // Vagal Respiratory Breathing LFO Frequency (0.08 Hz - 0.1 Hz)
    const vagalLfoHz = hasStress ? 0.08 : 0.1;

    return {
      heartRate: hr,
      temperature: temp,
      targetBpm,
      solfeggioCarrierHz,
      vagalLfoHz,
      hasStress
    };
  });

  isPlaying = signal<boolean>(false);
  isMuted = signal<boolean>(false);
  currentNoteIndex = signal<number>(0);
  volume = signal<number>(0.6);
  visualizerBars = signal<number[]>([35, 60, 85, 45, 90, 75, 50, 95, 65, 80, 40, 70]);

  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private chordInterval: any = null;
  private noteInterval: any = null;

  readonly gleeTracks: IGleeTrackFull[] = [
    {
      trackNumber: 1,
      title: 'Here Comes the Morning Light',
      subtitle: 'Circadian Sun Reset & Melatonin Awakening',
      paradigm: 'western',
      duetRoles: { roleA: 'Circadian Rhythm Lead', roleB: 'Solar Harmony' },
      keySignature: 'C Major',
      timeSignature: '4/4',
      bpm: 108,
      icon: '☀️',
      qalyBonus: 1.2,
      biologicalMechanism: 'Suppresses pineal melatonin secretion and triggers suprachiasmatic nucleus CORT cortisol awakenings for peak daytime alertness.',
      lyrics: [
        { time: 0, role: 'A', text: 'Step outside into the morning gold, 15 minutes as the story unfolds...' },
        { time: 5, role: 'B', text: 'Melatonin drops, serotonin soars, nature opens up circadian doors!' },
        { time: 10, role: 'Both', text: 'Here comes the sun, kindling our light, everything is gonna be all right!' }
      ],
      chordFrequencies: [
        [261.63, 329.63, 392.00], // C Maj
        [196.00, 246.94, 293.66], // G Maj
        [220.00, 261.63, 329.63], // A Min
        [174.61, 220.00, 261.63]  // F Maj
      ],
      sheetNotes: [
        { pitch: 'C4', label: 'C', role: 'A', duration: 'quarter', staffStep: 0 },
        { pitch: 'E4', label: 'E', role: 'A', duration: 'quarter', staffStep: 2 },
        { pitch: 'G4', label: 'G', role: 'B', duration: 'quarter', staffStep: 4 },
        { pitch: 'C5', label: 'C', role: 'Both', duration: 'half', staffStep: 7 },
        { pitch: 'B4', label: 'B', role: 'B', duration: 'quarter', staffStep: 6 },
        { pitch: 'A4', label: 'A', role: 'A', duration: 'quarter', staffStep: 5 },
        { pitch: 'G4', label: 'G', role: 'Both', duration: 'half', staffStep: 4 }
      ]
    },
    {
      trackNumber: 2,
      title: 'Inhale Five, Exhale Five',
      subtitle: '6.0 bpm Vagal Resonance & HRV Coherence',
      paradigm: 'western',
      duetRoles: { roleA: 'Vagus Breath Lead', roleB: 'Resonating Echo' },
      keySignature: 'F Major',
      timeSignature: '4/4',
      bpm: 60,
      icon: '🫁',
      qalyBonus: 1.5,
      biologicalMechanism: 'Maximizes respiratory sinus arrhythmia (RSA) and baroreflex vagal sensitivity at 0.1 Hz frequency.',
      lyrics: [
        { time: 0, role: 'A', text: 'Inhale deep for five slow counts, feel the peaceful peace that mounts...' },
        { time: 5, role: 'B', text: 'Exhale smooth for five counts more, calm the heart right to the core!' },
        { time: 10, role: 'Both', text: 'Resonant breath, six beats a minute, life is rich with calm within it!' }
      ],
      chordFrequencies: [
        [174.61, 220.00, 261.63], // F Maj
        [130.81, 164.81, 196.00], // C Maj
        [146.83, 174.61, 220.00], // D Min
        [116.54, 146.83, 174.61]  // Bb Maj
      ],
      sheetNotes: [
        { pitch: 'F4', label: 'F', role: 'A', duration: 'half', staffStep: 3 },
        { pitch: 'A4', label: 'A', role: 'A', duration: 'half', staffStep: 5 },
        { pitch: 'C5', label: 'C', role: 'B', duration: 'half', staffStep: 7 },
        { pitch: 'Bb4', label: 'Bb', role: 'Both', duration: 'half', staffStep: 6.5 },
        { pitch: 'A4', label: 'A', role: 'B', duration: 'half', staffStep: 5 },
        { pitch: 'F4', label: 'F', role: 'Both', duration: 'whole', staffStep: 3 }
      ]
    },
    {
      trackNumber: 3,
      title: 'Kindle the Agni Fire',
      subtitle: 'Ayurvedic Ama Detox & Metabolic Spark',
      paradigm: 'ayurvedic',
      duetRoles: { roleA: 'Agni Igniter', roleB: 'Doshic Balance' },
      keySignature: 'A Minor',
      timeSignature: '4/4',
      bpm: 95,
      icon: '🍵',
      qalyBonus: 1.1,
      biologicalMechanism: 'Stimulates digestive enzymatic secretion and activates AMP-activated protein kinase (AMPK) metabolic autophagy.',
      lyrics: [
        { time: 0, role: 'A', text: 'Warm ginger tea before the noon, metabolic fire coming soon...' },
        { time: 5, role: 'B', text: 'Clear out Ama, nourish the cell, every organ is feeling well!' },
        { time: 10, role: 'Both', text: 'Kindle the flame of health today, Ayurvedic strength is on its way!' }
      ],
      chordFrequencies: [
        [220.00, 261.63, 329.63], // A Min
        [174.61, 220.00, 261.63], // F Maj
        [130.81, 164.81, 196.00], // C Maj
        [196.00, 246.94, 293.66]  // G Maj
      ],
      sheetNotes: [
        { pitch: 'A4', label: 'A', role: 'A', duration: 'quarter', staffStep: 5 },
        { pitch: 'C5', label: 'C', role: 'A', duration: 'quarter', staffStep: 7 },
        { pitch: 'E5', label: 'E', role: 'B', duration: 'half', staffStep: 9 },
        { pitch: 'D5', label: 'D', role: 'Both', duration: 'quarter', staffStep: 8 },
        { pitch: 'C5', label: 'C', role: 'B', duration: 'quarter', staffStep: 7 },
        { pitch: 'A4', label: 'A', role: 'Both', duration: 'half', staffStep: 5 }
      ]
    },
    {
      trackNumber: 4,
      title: 'Be Like Water, Disperse the Qi',
      subtitle: 'TCM Liver Qi Flow & Emotional Fluidity',
      paradigm: 'eastern',
      duetRoles: { roleA: 'Flowing Water', roleB: 'Meridian Breeze' },
      keySignature: 'D Pentatonic',
      timeSignature: '4/4',
      bpm: 72,
      icon: '🌊',
      qalyBonus: 1.4,
      biologicalMechanism: 'Unblocks hepatic vascular microcirculation and restores balanced neurotransmitter tone across the central axis.',
      lyrics: [
        { time: 0, role: 'A', text: 'Flow through obstacles without strain, smooth away the tension and the pain...' },
        { time: 5, role: 'B', text: 'Liver Qi flows free and clear, harmony is present here!' },
        { time: 10, role: 'Both', text: 'Be like water, calm and free, in rhythm with eternity!' }
      ],
      chordFrequencies: [
        [146.83, 174.61, 220.00], // D Min
        [116.54, 146.83, 174.61], // Bb Maj
        [174.61, 220.00, 261.63], // F Maj
        [130.81, 164.81, 196.00]  // C Maj
      ],
      sheetNotes: [
        { pitch: 'D4', label: 'D', role: 'A', duration: 'half', staffStep: 1 },
        { pitch: 'F4', label: 'F', role: 'A', duration: 'half', staffStep: 3 },
        { pitch: 'G4', label: 'G', role: 'B', duration: 'quarter', staffStep: 4 },
        { pitch: 'A4', label: 'A', role: 'B', duration: 'half', staffStep: 5 },
        { pitch: 'C5', label: 'C', role: 'Both', duration: 'half', staffStep: 7 },
        { pitch: 'D5', label: 'D', role: 'Both', duration: 'whole', staffStep: 8 }
      ]
    },
    {
      trackNumber: 5,
      title: 'Ten Thousand Steps of Joy',
      subtitle: 'Mitochondrial Biogenesis & Aerobic Pulse',
      paradigm: 'western',
      duetRoles: { roleA: 'Stride Master', roleB: 'Rhythm Keeper' },
      keySignature: 'G Major',
      timeSignature: '4/4',
      bpm: 120,
      icon: '🚶',
      qalyBonus: 1.3,
      biologicalMechanism: 'Upregulates PGC-1alpha transcription for muscular mitochondrial fission and vascular endothelial growth factor (VEGF).',
      lyrics: [
        { time: 0, role: 'A', text: 'Pacing steady through the park, walking bright into the spark...' },
        { time: 5, role: 'B', text: 'Mitochondria multiply, healthspan climbing to the sky!' },
        { time: 10, role: 'Both', text: 'Ten thousand steps with joy in stride, longevity is by our side!' }
      ],
      chordFrequencies: [
        [196.00, 246.94, 293.66], // G Maj
        [164.81, 196.00, 246.94], // E Min
        [130.81, 164.81, 196.00], // C Maj
        [146.83, 185.00, 220.00]  // D Maj
      ],
      sheetNotes: [
        { pitch: 'G4', label: 'G', role: 'A', duration: 'quarter', staffStep: 4 },
        { pitch: 'B4', label: 'B', role: 'A', duration: 'quarter', staffStep: 6 },
        { pitch: 'D5', label: 'D', role: 'B', duration: 'quarter', staffStep: 8 },
        { pitch: 'G5', label: 'G', role: 'Both', duration: 'half', staffStep: 11 },
        { pitch: 'E5', label: 'E', role: 'B', duration: 'quarter', staffStep: 9 },
        { pitch: 'D5', label: 'D', role: 'Both', duration: 'half', staffStep: 8 }
      ]
    },
    {
      trackNumber: 6,
      title: 'Telomere Lullaby',
      subtitle: 'Epigenetic DNA Repair & Protection',
      paradigm: 'longevity',
      duetRoles: { roleA: 'Epigenetic Whisper', roleB: 'Telomerase Echo' },
      keySignature: 'E Minor',
      timeSignature: '3/4',
      bpm: 65,
      icon: '🧬',
      qalyBonus: 1.6,
      biologicalMechanism: 'Reduces DNA double-strand break accumulation and maintains TERT telomerase reverse transcriptase activity.',
      lyrics: [
        { time: 0, role: 'A', text: 'Deep restorative nightly sleep, promises our chromosomes keep...' },
        { time: 5, role: 'B', text: 'Protecting caps on every strand, living longer in the land!' },
        { time: 10, role: 'Both', text: 'Sing the telomere lullaby, years of quality pass us by!' }
      ],
      chordFrequencies: [
        [164.81, 196.00, 246.94], // E Min
        [130.81, 164.81, 196.00], // C Maj
        [110.00, 130.81, 164.81], // A Min
        [123.47, 155.56, 185.00]  // B7
      ],
      sheetNotes: [
        { pitch: 'E4', label: 'E', role: 'A', duration: 'half', staffStep: 2 },
        { pitch: 'G4', label: 'G', role: 'A', duration: 'quarter', staffStep: 4 },
        { pitch: 'B4', label: 'B', role: 'B', duration: 'half', staffStep: 6 },
        { pitch: 'E5', label: 'E', role: 'Both', duration: 'whole', staffStep: 9 }
      ]
    },
    {
      trackNumber: 7,
      title: 'Resveratrol & Golden Milk',
      subtitle: 'Sirtuin Activation & Cellular Defense',
      paradigm: 'longevity',
      duetRoles: { roleA: 'Sirtuin Lead', roleB: 'Curcumin Support' },
      keySignature: 'A Mixolydian',
      timeSignature: '4/4',
      bpm: 88,
      icon: '🍇',
      qalyBonus: 1.0,
      biologicalMechanism: 'Activates SIRT1 deacetylase pathways and neutralizes NF-kB nuclear inflammatory signaling cascades.',
      lyrics: [
        { time: 0, role: 'A', text: 'Warm turmeric and golden spice, cellular protection extra nice...' },
        { time: 5, role: 'B', text: 'NAD+ fuels the sirtuin key, feeling vibrant, young, and free!' },
        { time: 10, role: 'Both', text: 'Golden milk in every cup, building our longevity up!' }
      ],
      chordFrequencies: [
        [220.00, 277.18, 329.63], // A Maj
        [196.00, 246.94, 293.66], // G Maj
        [146.83, 185.00, 220.00], // D Maj
        [220.00, 277.18, 329.63]  // A Maj
      ],
      sheetNotes: [
        { pitch: 'A4', label: 'A', role: 'A', duration: 'quarter', staffStep: 5 },
        { pitch: 'C#5', label: 'C#', role: 'A', duration: 'quarter', staffStep: 7.5 },
        { pitch: 'E5', label: 'E', role: 'B', duration: 'half', staffStep: 9 },
        { pitch: 'G5', label: 'G', role: 'Both', duration: 'whole', staffStep: 11 }
      ]
    },
    {
      trackNumber: 8,
      title: 'Branch by Branch, We Prune the Risk',
      subtitle: 'Multi-Generational Pedigree Lineage Healing',
      paradigm: 'western',
      duetRoles: { roleA: 'Ancestral Gardener', roleB: 'Future Heritage' },
      keySignature: 'C Major',
      timeSignature: '4/4',
      bpm: 90,
      icon: '🌳',
      qalyBonus: 1.8,
      biologicalMechanism: 'Mitigates polygenic inheritance risk through epigenomic histone acetylation and trans-generational health choices.',
      lyrics: [
        { time: 0, role: 'A', text: 'Looking through the family tree, pruning risk for you and me...' },
        { time: 5, role: 'B', text: 'Pre-conception choices bright, giving future generations light!' },
        { time: 10, role: 'Both', text: 'Branch by branch we heal today, a legacy that is here to stay!' }
      ],
      chordFrequencies: [
        [261.63, 329.63, 392.00], // C Maj
        [164.81, 196.00, 246.94], // E Min
        [174.61, 220.00, 261.63], // F Maj
        [196.00, 246.94, 293.66]  // G Maj
      ],
      sheetNotes: [
        { pitch: 'C4', label: 'C', role: 'A', duration: 'quarter', staffStep: 0 },
        { pitch: 'E4', label: 'E', role: 'A', duration: 'quarter', staffStep: 2 },
        { pitch: 'G4', label: 'G', role: 'B', duration: 'quarter', staffStep: 4 },
        { pitch: 'C5', label: 'C', role: 'Both', duration: 'half', staffStep: 7 }
      ]
    },
    {
      trackNumber: 9,
      title: 'Shen in Harmony',
      subtitle: 'TCM Mind Tranquilizing & Deep Rest',
      paradigm: 'eastern',
      duetRoles: { roleA: 'Tranquil Mind', roleB: 'Peaceful Spirit' },
      keySignature: 'D Dorian',
      timeSignature: '4/4',
      bpm: 55,
      icon: '🧠',
      qalyBonus: 1.2,
      biologicalMechanism: 'Tonifies Heart Blood and anchors Shen, lowering sympathetic cardiac beta-adrenergic stimulation.',
      lyrics: [
        { time: 0, role: 'A', text: 'Calm the heart and settle the Shen, resting deeply once again...' },
        { time: 5, role: 'B', text: 'Quiet thoughts and peaceful eyes, wisdom beneath starry skies!' },
        { time: 10, role: 'Both', text: 'Shen in harmony tonight, waking up with clear insight!' }
      ],
      chordFrequencies: [
        [146.83, 174.61, 220.00], // D Min
        [130.81, 164.81, 196.00], // C Maj
        [116.54, 146.83, 174.61], // Bb Maj
        [110.00, 146.83, 174.61]  // A7
      ],
      sheetNotes: [
        { pitch: 'D4', label: 'D', role: 'A', duration: 'half', staffStep: 1 },
        { pitch: 'F4', label: 'F', role: 'A', duration: 'half', staffStep: 3 },
        { pitch: 'A4', label: 'A', role: 'B', duration: 'whole', staffStep: 5 }
      ]
    },
    {
      trackNumber: 10,
      title: 'Whole Foods, Pure Heart',
      subtitle: 'Metabolic Flexibility & Endothelial Glow',
      paradigm: 'ayurvedic',
      duetRoles: { roleA: 'Nourishment Lead', roleB: 'Vessel Harmony' },
      keySignature: 'E Major',
      timeSignature: '4/4',
      bpm: 100,
      icon: '🥑',
      qalyBonus: 1.1,
      biologicalMechanism: 'Improves eNOS endothelial nitric oxide generation and prevents postprandial triglyceride oxidative stress.',
      lyrics: [
        { time: 0, role: 'A', text: 'Rainbow colors on the plate, whole foods that we celebrate...' },
        { time: 5, role: 'B', text: 'Endothelium smooth and clean, health control like a machine!' },
        { time: 10, role: 'Both', text: 'Whole foods, pure heart, every day, vitality the natural way!' }
      ],
      chordFrequencies: [
        [164.81, 207.65, 246.94], // E Maj
        [123.47, 155.56, 185.00], // B Maj
        [138.59, 164.81, 207.65], // C#m
        [110.00, 138.59, 164.81]  // A Maj
      ],
      sheetNotes: [
        { pitch: 'E4', label: 'E', role: 'A', duration: 'quarter', staffStep: 2 },
        { pitch: 'G#4', label: 'G#', role: 'A', duration: 'quarter', staffStep: 4.5 },
        { pitch: 'B4', label: 'B', role: 'B', duration: 'half', staffStep: 6 }
      ]
    },
    {
      trackNumber: 5,
      title: 'Ten Thousand Steps of Joy',
      subtitle: 'Mitochondrial Biogenesis & Aerobic Pulse',
      paradigm: 'western',
      duetRoles: { roleA: 'Stride Master', roleB: 'Rhythm Keeper' },
      keySignature: 'G Major',
      timeSignature: '4/4',
      bpm: 120,
      icon: '🚶',
      qalyBonus: 1.3,
      biologicalMechanism: 'Upregulates PGC-1alpha transcription for muscular mitochondrial fission and vascular endothelial growth factor (VEGF).',
      lyrics: [
        { time: 0, role: 'A', text: 'Pacing steady through the park, walking bright into the spark...' },
        { time: 5, role: 'B', text: 'Mitochondria multiply, healthspan climbing to the sky!' },
        { time: 10, role: 'Both', text: 'Ten thousand steps with joy in stride, longevity is by our side!' }
      ],
      chordFrequencies: [
        [196.00, 246.94, 293.66], // G Maj
        [164.81, 196.00, 246.94], // E Min
        [130.81, 164.81, 196.00], // C Maj
        [146.83, 185.00, 220.00]  // D Maj
      ],
      sheetNotes: [
        { pitch: 'G4', label: 'G', role: 'A', duration: 'quarter', staffStep: 4 },
        { pitch: 'B4', label: 'B', role: 'A', duration: 'quarter', staffStep: 6 },
        { pitch: 'D5', label: 'D', role: 'B', duration: 'quarter', staffStep: 8 },
        { pitch: 'G5', label: 'G', role: 'Both', duration: 'half', staffStep: 11 },
        { pitch: 'E5', label: 'E', role: 'B', duration: 'quarter', staffStep: 9 },
        { pitch: 'D5', label: 'D', role: 'Both', duration: 'half', staffStep: 8 }
      ]
    },
    {
      trackNumber: 6,
      title: 'Telomere Lullaby',
      subtitle: 'Epigenetic DNA Repair & Protection',
      paradigm: 'longevity',
      duetRoles: { roleA: 'Epigenetic Whisper', roleB: 'Telomerase Echo' },
      keySignature: 'E Minor',
      timeSignature: '3/4',
      bpm: 65,
      icon: '🧬',
      qalyBonus: 1.6,
      biologicalMechanism: 'Reduces DNA double-strand break accumulation and maintains TERT telomerase reverse transcriptase activity.',
      lyrics: [
        { time: 0, role: 'A', text: 'Deep restorative nightly sleep, promises our chromosomes keep...' },
        { time: 5, role: 'B', text: 'Protecting caps on every strand, living longer in the land!' },
        { time: 10, role: 'Both', text: 'Sing the telomere lullaby, years of quality pass us by!' }
      ],
      chordFrequencies: [
        [164.81, 196.00, 246.94], // E Min
        [130.81, 164.81, 196.00], // C Maj
        [110.00, 130.81, 164.81], // A Min
        [123.47, 155.56, 185.00]  // B7
      ],
      sheetNotes: [
        { pitch: 'E4', label: 'E', role: 'A', duration: 'half', staffStep: 2 },
        { pitch: 'G4', label: 'G', role: 'A', duration: 'quarter', staffStep: 4 },
        { pitch: 'B4', label: 'B', role: 'B', duration: 'half', staffStep: 6 },
        { pitch: 'E5', label: 'E', role: 'Both', duration: 'whole', staffStep: 9 }
      ]
    },
    {
      trackNumber: 7,
      title: 'Resveratrol & Golden Milk',
      subtitle: 'Sirtuin Activation & Cellular Defense',
      paradigm: 'longevity',
      duetRoles: { roleA: 'Sirtuin Lead', roleB: 'Curcumin Support' },
      keySignature: 'A Mixolydian',
      timeSignature: '4/4',
      bpm: 88,
      icon: '🍇',
      qalyBonus: 1.0,
      biologicalMechanism: 'Activates SIRT1 deacetylase pathways and neutralizes NF-kB nuclear inflammatory signaling cascades.',
      lyrics: [
        { time: 0, role: 'A', text: 'Warm turmeric and golden spice, cellular protection extra nice...' },
        { time: 5, role: 'B', text: 'NAD+ fuels the sirtuin key, feeling vibrant, young, and free!' },
        { time: 10, role: 'Both', text: 'Golden milk in every cup, building our longevity up!' }
      ],
      chordFrequencies: [
        [220.00, 277.18, 329.63], // A Maj
        [196.00, 246.94, 293.66], // G Maj
        [146.83, 185.00, 220.00], // D Maj
        [220.00, 277.18, 329.63]  // A Maj
      ],
      sheetNotes: [
        { pitch: 'A4', label: 'A', role: 'A', duration: 'quarter', staffStep: 5 },
        { pitch: 'C#5', label: 'C#', role: 'A', duration: 'quarter', staffStep: 7.5 },
        { pitch: 'E5', label: 'E', role: 'B', duration: 'half', staffStep: 9 },
        { pitch: 'G5', label: 'G', role: 'Both', duration: 'whole', staffStep: 11 }
      ]
    },
    {
      trackNumber: 8,
      title: 'Branch by Branch, We Prune the Risk',
      subtitle: 'Multi-Generational Pedigree Lineage Healing',
      paradigm: 'western',
      duetRoles: { roleA: 'Ancestral Gardener', roleB: 'Future Heritage' },
      keySignature: 'C Major',
      timeSignature: '4/4',
      bpm: 90,
      icon: '🌳',
      qalyBonus: 1.8,
      biologicalMechanism: 'Mitigates polygenic inheritance risk through epigenomic histone acetylation and trans-generational health choices.',
      lyrics: [
        { time: 0, role: 'A', text: 'Looking through the family tree, pruning risk for you and me...' },
        { time: 5, role: 'B', text: 'Pre-conception choices bright, giving future generations light!' },
        { time: 10, role: 'Both', text: 'Branch by branch we heal today, a legacy that is here to stay!' }
      ],
      chordFrequencies: [
        [261.63, 329.63, 392.00], // C Maj
        [164.81, 196.00, 246.94], // E Min
        [174.61, 220.00, 261.63], // F Maj
        [196.00, 246.94, 293.66]  // G Maj
      ],
      sheetNotes: [
        { pitch: 'C4', label: 'C', role: 'A', duration: 'quarter', staffStep: 0 },
        { pitch: 'E4', label: 'E', role: 'A', duration: 'quarter', staffStep: 2 },
        { pitch: 'G4', label: 'G', role: 'B', duration: 'quarter', staffStep: 4 },
        { pitch: 'C5', label: 'C', role: 'Both', duration: 'half', staffStep: 7 }
      ]
    },
    {
      trackNumber: 9,
      title: 'Shen in Harmony',
      subtitle: 'TCM Mind Tranquilizing & Deep Rest',
      paradigm: 'eastern',
      duetRoles: { roleA: 'Tranquil Mind', roleB: 'Peaceful Spirit' },
      keySignature: 'D Dorian',
      timeSignature: '4/4',
      bpm: 55,
      icon: '🧠',
      qalyBonus: 1.2,
      biologicalMechanism: 'Tonifies Heart Blood and anchors Shen, lowering sympathetic cardiac beta-adrenergic stimulation.',
      lyrics: [
        { time: 0, role: 'A', text: 'Calm the heart and settle the Shen, resting deeply once again...' },
        { time: 5, role: 'B', text: 'Quiet thoughts and peaceful eyes, wisdom beneath starry skies!' },
        { time: 10, role: 'Both', text: 'Shen in harmony tonight, waking up with clear insight!' }
      ],
      chordFrequencies: [
        [146.83, 174.61, 220.00], // D Min
        [130.81, 164.81, 196.00], // C Maj
        [116.54, 146.83, 174.61], // Bb Maj
        [110.00, 146.83, 174.61]  // A7
      ],
      sheetNotes: [
        { pitch: 'D4', label: 'D', role: 'A', duration: 'half', staffStep: 1 },
        { pitch: 'F4', label: 'F', role: 'A', duration: 'half', staffStep: 3 },
        { pitch: 'A4', label: 'A', role: 'B', duration: 'whole', staffStep: 5 }
      ]
    },
    {
      trackNumber: 10,
      title: 'Whole Foods, Pure Heart',
      subtitle: 'Metabolic Flexibility & Endothelial Glow',
      paradigm: 'ayurvedic',
      duetRoles: { roleA: 'Nourishment Lead', roleB: 'Vessel Harmony' },
      keySignature: 'E Major',
      timeSignature: '4/4',
      bpm: 100,
      icon: '🥑',
      qalyBonus: 1.1,
      biologicalMechanism: 'Improves eNOS endothelial nitric oxide generation and prevents postprandial triglyceride oxidative stress.',
      lyrics: [
        { time: 0, role: 'A', text: 'Rainbow colors on the plate, whole foods that we celebrate...' },
        { time: 5, role: 'B', text: 'Endothelium smooth and clean, health control like a machine!' },
        { time: 10, role: 'Both', text: 'Whole foods, pure heart, every day, vitality the natural way!' }
      ],
      chordFrequencies: [
        [164.81, 207.65, 246.94], // E Maj
        [123.47, 155.56, 185.00], // B Maj
        [138.59, 164.81, 207.65], // C#m
        [110.00, 138.59, 164.81]  // A Maj
      ],
      sheetNotes: [
        { pitch: 'E4', label: 'E', role: 'A', duration: 'quarter', staffStep: 2 },
        { pitch: 'G#4', label: 'G#', role: 'A', duration: 'quarter', staffStep: 4.5 },
        { pitch: 'B4', label: 'B', role: 'B', duration: 'half', staffStep: 6 }
      ]
    },
    {
      trackNumber: 11,
      title: 'The Human Dignity Duet',
      subtitle: 'Social Gravitation & Parasympathetic Co-Regulation',
      paradigm: 'western',
      duetRoles: { roleA: 'Co-Regulator A', roleB: 'Co-Regulator B' },
      keySignature: 'F Major',
      timeSignature: '4/4',
      bpm: 80,
      icon: '🤝',
      qalyBonus: 1.5,
      biologicalMechanism: 'Fosters inter-individual oxytocin releases and vagal nerve social engagement system activation.',
      lyrics: [
        { time: 0, role: 'A', text: 'Side by side we sing as one, supporting until the day is done...' },
        { time: 5, role: 'B', text: 'Vagal tone in harmony, bound together, you and me!' },
        { time: 10, role: 'Both', text: 'Human dignity we hold, stories of health and joy retold!' }
      ],
      chordFrequencies: [
        [174.61, 220.00, 261.63], // F Maj
        [110.00, 138.59, 174.61], // A7
        [146.83, 174.61, 220.00], // D Min
        [116.54, 146.83, 174.61]  // Bb Maj
      ],
      sheetNotes: [
        { pitch: 'F4', label: 'F', role: 'A', duration: 'quarter', staffStep: 3 },
        { pitch: 'A4', label: 'A', role: 'A', duration: 'quarter', staffStep: 5 },
        { pitch: 'C5', label: 'C', role: 'B', duration: 'half', staffStep: 7 },
        { pitch: 'F5', label: 'F', role: 'Both', duration: 'whole', staffStep: 10 }
      ]
    },
    {
      trackNumber: 12,
      title: 'The Rejuvenated Horizon',
      subtitle: '+12.0 QALYs Victory Anthem for Generations',
      paradigm: 'longevity',
      duetRoles: { roleA: 'Victory Lead', roleB: 'Regeneration Chorus' },
      keySignature: 'C Major',
      timeSignature: '4/4',
      bpm: 115,
      icon: '⌛',
      qalyBonus: 2.0,
      biologicalMechanism: 'Comprehensive systemic rejuvenative homeostasis, cellular senolytic clearance, and multi-organ healthspan expansion.',
      lyrics: [
        { time: 0, role: 'A', text: 'Twelve tracks sung and health restored, blessings of longevity poured...' },
        { time: 5, role: 'B', text: 'Twelve QALY years of extra life, free from preventable illness and strife!' },
        { time: 10, role: 'Both', text: 'Onward to the horizon bright, living long in health and light!' }
      ],
      chordFrequencies: [
        [261.63, 329.63, 392.00], // C Maj
        [174.61, 220.00, 261.63], // F Maj
        [196.00, 246.94, 293.66], // G Maj
        [261.63, 329.63, 392.00]  // C Maj
      ],
      sheetNotes: [
        { pitch: 'C4', label: 'C', role: 'A', duration: 'quarter', staffStep: 0 },
        { pitch: 'E4', label: 'E', role: 'A', duration: 'quarter', staffStep: 2 },
        { pitch: 'G4', label: 'G', role: 'B', duration: 'quarter', staffStep: 4 },
        { pitch: 'C5', label: 'C', role: 'Both', duration: 'half', staffStep: 7 },
        { pitch: 'E5', label: 'E', role: 'Both', duration: 'whole', staffStep: 9 }
      ]
    },
    {
      trackNumber: 13,
      title: 'The Bach Crab Canon Entrainment',
      subtitle: 'Polyphonic Counterpoint & Vagal Retrograde Loop',
      paradigm: 'longevity',
      duetRoles: { roleA: 'Voice 1: 528 Hz Inhalation Theme', roleB: 'Voice 2: 432 Hz Crab Canon Retrograde' },
      keySignature: 'C Minor (Sacred Solfeggio)',
      timeSignature: '4/4',
      bpm: 60,
      icon: '🎼',
      qalyBonus: 1.8,
      biologicalMechanism: 'Hofstadter-Bach polyphonic counterpoint: Voice 1 (528 Hz Solfeggio) drives parasympathetic vagal stimulation during 4s inhalation; Voice 2 (432 Hz Retrograde) mirrors exhalation to establish an acoustic Strange Loop.',
      lyrics: [
        { time: 0, role: 'A', text: 'Inhale 528 Hz ascension theme, opening the mind like a golden dream...' },
        { time: 5, role: 'B', text: 'Exhale 432 Hz retrograde flow, strange loop resonance down below!' },
        { time: 10, role: 'Both', text: 'Gödel, Escher, Bach entwined, perfect harmony of heart and mind!' }
      ],
      chordFrequencies: [
        [528.0, 432.0, 639.0],
        [396.0, 528.0, 741.0],
        [415.3, 528.0, 852.0],
        [528.0, 432.0, 963.0]
      ],
      sheetNotes: [
        { pitch: 'C4', label: '528', role: 'A', duration: 'half', staffStep: 0 },
        { pitch: 'G4', label: '432', role: 'B', duration: 'half', staffStep: 4 },
        { pitch: 'Eb4', label: '639', role: 'Both', duration: 'whole', staffStep: 2 }
      ]
    },
    {
      trackNumber: 14,
      title: 'The Penrose Orch-OR Quantum Coherence',
      subtitle: 'Tubulin Lattice 40 Hz Gamma & Quantum Reduction',
      paradigm: 'longevity',
      duetRoles: { roleA: 'Voice 1: 40 Hz Gamma Coherence', roleB: 'Voice 2: 8 Hz Tubulin Resonance' },
      keySignature: 'A Minor (Quantum Coherence)',
      timeSignature: '4/4',
      bpm: 80,
      icon: '🧠',
      qalyBonus: 2.2,
      biologicalMechanism: 'Penrose-Hameroff Orchestrated Objective Reduction (Orch-OR): 40 Hz Gamma auditory entrainment stabilizes quantum superposition states across 13-protofilament microtubule tubulin dimers during deep cognitive rest.',
      lyrics: [
        { time: 0, role: 'A', text: '40 Hz Gamma pulses through the cortical dome, quantum coherence in tubulin home...' },
        { time: 5, role: 'B', text: 'Objective reduction in micro-space, non-algorithmic mind in time and space!' },
        { time: 10, role: 'Both', text: 'Penrose Orch-OR, conscious light, guiding our healthcare into the night!' }
      ],
      chordFrequencies: [
        [440.0, 523.25, 659.25],
        [349.23, 440.0, 523.25],
        [392.0, 493.88, 587.33],
        [440.0, 523.25, 659.25]
      ],
      sheetNotes: [
        { pitch: 'A4', label: '440', role: 'A', duration: 'quarter', staffStep: 5 },
        { pitch: 'C5', label: '523', role: 'A', duration: 'quarter', staffStep: 7 },
        { pitch: 'E5', label: '659', role: 'Both', duration: 'half', staffStep: 9 }
      ]
    }
  ];

  toggleMute() {
    this.isMuted.update(m => !m);
    if (this.masterGain && this.audioCtx) {
      if (this.isMuted()) {
        this.masterGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      } else {
        this.masterGain.gain.setValueAtTime(this.volume() * 0.25, this.audioCtx.currentTime);
      }
    }
  }

  playTrack(track: IGleeTrackFull, speedMultiplier: number = 1.0) {
    this.stopTrack();

    if (typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.audioCtx = new AudioCtx();

      this.masterGain = this.audioCtx.createGain();
      const initialGain = this.isMuted() ? 0 : this.volume() * 0.25;
      this.masterGain.gain.setValueAtTime(initialGain, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      this.isPlaying.set(true);
      this.currentNoteIndex.set(0);

      if (track.trackNumber === 13) {
        this.playCrabCanonPolyphony();
        return;
      }
      if (track.trackNumber === 14) {
        this.playOrchOrMicrotubuleCoherence();
        return;
      }

      // Play continuous polyphonic chord progression
      let chordIndex = 0;
      const playChord = () => {
        if (!this.audioCtx || !this.isPlaying()) return;

        const chordHz = track.chordFrequencies[chordIndex % track.chordFrequencies.length];
        chordHz.forEach((freq, idx) => {
          const osc = this.audioCtx!.createOscillator();
          const gain = this.audioCtx!.createGain();

          const finalFreq = freq * speedMultiplier;

          osc.type = idx === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(finalFreq, this.audioCtx!.currentTime);

          gain.gain.setValueAtTime(0.01, this.audioCtx!.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.12, this.audioCtx!.currentTime + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx!.currentTime + 1.8);

          const panner = typeof this.audioCtx!.createStereoPanner === 'function' ? this.audioCtx!.createStereoPanner() : null;
          if (panner) {
            panner.pan.value = idx % 2 === 0 ? -0.5 : 0.5;
            osc.connect(panner);
            panner.connect(gain);
          } else {
            osc.connect(gain);
          }

          gain.connect(this.masterGain!);

          osc.start();
          osc.stop(this.audioCtx!.currentTime + 2.0);
        });

        chordIndex++;
      };

      playChord();
      const chordTimeMs = Math.round((60000 / (track.bpm * speedMultiplier)) * 2);
      this.chordInterval = setInterval(playChord, chordTimeMs);

      const noteTimeMs = Math.round(60000 / (track.bpm * speedMultiplier));
      this.noteInterval = setInterval(() => {
        if (!this.isPlaying()) return;
        this.currentNoteIndex.update(idx => (idx + 1) % track.sheetNotes.length);

        const newBars = Array.from({ length: 12 }, () => Math.floor(Math.random() * 70) + 30);
        this.visualizerBars.set(newBars);
      }, noteTimeMs);

    } catch (err) {
      console.warn('[Actuarial Glee Audio Error]', err);
    }
  }

  setVolume(vol: number) {
    this.volume.set(vol);
    if (this.masterGain && this.audioCtx && !this.isMuted()) {
      this.masterGain.gain.setValueAtTime(vol * 0.25, this.audioCtx.currentTime);
    }
  }

  stopTrack() {
    this.isPlaying.set(false);
    if (this.chordInterval) clearInterval(this.chordInterval);
    if (this.noteInterval) clearInterval(this.noteInterval);
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) { /* Context may already be closed */ }
      this.audioCtx = null;
    }
    this.masterGain = null;
  }

  playCrabCanonPolyphony() {
    if (!this.audioCtx || !this.masterGain) return;

    const telem = this.fhirAudioTelemetry();

    // Voice 1: Dynamic FHIR Solfeggio Forward Theme (Inhalation - e.g. 528 Hz or 432 Hz)
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(telem.solfeggioCarrierHz, this.audioCtx.currentTime);

    // Voice 2: Retrograde Counter-Melodic Theme (Exhalation - 432 Hz / 396 Hz)
    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();
    osc2.type = 'triangle';
    const retroFreq = telem.solfeggioCarrierHz === 528.0 ? 432.0 : 396.0;
    osc2.frequency.setValueAtTime(retroFreq, this.audioCtx.currentTime);

    // LFO: FHIR Vagal Respiratory Modulation (0.08 Hz - 0.1 Hz)
    const lfo = this.audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(telem.vagalLfoHz, this.audioCtx.currentTime);

    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(gain1.gain);

    osc1.connect(gain1);
    osc2.connect(gain2);

    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);

    osc1.start();
    osc2.start();
    lfo.start();
  }

  playOrchOrMicrotubuleCoherence() {
    if (!this.audioCtx || !this.masterGain) return;

    const telem = this.fhirAudioTelemetry();

    // Carrier 1: Base Carrier (440 Hz or FHIR Solfeggio)
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(telem.solfeggioCarrierHz, this.audioCtx.currentTime);

    // Carrier 2: 40 Hz Gamma difference pulse for Orch-OR quantum tubulin entrainment
    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(telem.solfeggioCarrierHz + 40.0, this.audioCtx.currentTime);

    // Tubulin Resonance LFO: 8 Hz Alpha / Vagal Coherence Pulse
    const lfo = this.audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(telem.hasStress ? 8.0 : 10.0, this.audioCtx.currentTime);

    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(gain1.gain);

    osc1.connect(gain1);
    osc2.connect(gain2);

    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);

    osc1.start();
    osc2.start();
    lfo.start();
  }
}
