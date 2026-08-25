import { Injectable, signal } from '@angular/core';
import {
  AthleticState, IAthleticProfile, IAthleticStimBlock,
  IAthleticSession
} from './patient.types';

/**
 * AthleticProtocolService
 *
 * Generates evidence-informed Audio-Visual Stimulation (AVS) protocols for 
 * athletic performance enhancement.
 *
 * Targets:
 *  - Neurological Priming (Beta/Gamma)
 *  - Flow-State & Skill Training (SMR/Alpha)
 *  - Accelerated Down-Regulation Recovery (Theta)
 *  - Circadian Phase-Shifting (Jet lag mitigation)
 */
@Injectable({ providedIn: 'root' })
export class AthleticProtocolService {

  readonly session = signal<IAthleticSession | null>(null);

  // ══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Generate a structured athletic stimulation session protocol based on the profile.
   * Updates the `session` signal reactively.
   */
  generate(profile: IAthleticProfile): IAthleticSession {
    const schedule  = this.buildSchedule(profile);
    const guidance  = this.buildAthleteGuidance(profile);
    const refs      = this.buildReferences(profile);
    const total     = schedule.reduce((sum, b) => sum + b.durationMin, 0);

    const result: IAthleticSession = {
      profile,
      schedule,
      totalDurationMin:  total,
      coach_note:        this.buildCoachNote(profile),
      athlete_guidance:  guidance,
      evidence_references: refs,
    };

    this.session.set(result);
    return result;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCHEDULE BUILDER 
  // ══════════════════════════════════════════════════════════════════════════

  private buildSchedule(p: IAthleticProfile): IAthleticStimBlock[] {
    switch (p.state) {

      // ── PRIMING (Pre-workout / High-Beta / Gamma) ─────────────────────────
      case 'priming':
        return [
          this.block('Autonomic Calibration', 2, 'quiet', null,
            'Sit in a comfortable posture. Establish baseline resting heart rate before stimulation.',
            'Establishes a neurological baseline to prevent artificial over-stimulation and anxiety panic.'),
          this.block('High-Beta Escalation (20 Hz)', 5, 'auditory', 20,
            `Play ${p.preferredMusic || 'high-tempo, aggressive music'}. Binaural beats at 20 Hz carrier. Combine with deep, rapid nasal inhalations.`,
            'Beta entrainment begins activating the sympathetic nervous system, increasing localized blood flow to motor cortex.'),
          this.block('Gamma Peak Performance (40 Hz)', 5, 'ambient-light', 40,
            'Sync Hue room lighting to pulse rapidly in high-contrast Cyan/White. Introduce 40 Hz isochronic tones.',
            'Gamma (40 Hz) drives maximal focus, sensory processing, and reaction time. Creates a controlled cortisol and adrenaline surge.'),
          this.block('Action Transition', 1, 'visual-focus', null,
            'Cease AVS. Visualize the exact physical sequence of the first event movement. Proceed immediately to physical warm-up.',
            'Translates neurological arousal directly into specific motor pathway activation.')
        ];

      // ── FLOW-STATE (Skill-training / SMR / Alpha) ─────────────────────────
      case 'flow':
        return [
          this.block('Pre-Skill Relaxation', 3, 'auditory', 10,
            'Alpha wave (10 Hz) binaural beats with ambient brown noise. Practice 4-7-8 breathing.',
            'Alpha states quiet the Default Mode Network (inner critic), reducing motor-performance anxiety.'),
          this.block('Sensorimotor Rhythm (SMR) Entrainment (14 Hz)', 10, 'ambient-light', 14,
            'Ambient light locked to cool blue. 14 Hz binaural or isochronic tones through headphones.',
            'SMR (12-15 Hz) is strongly correlated with athletic "flow states." It maintains external physical alertness while suppressing internal cognitive chatter.'),
          this.block('Mental Rehearsal under SMR', 5, 'visual-focus', 14,
            'While maintaining 14 Hz stimulation, close eyes and mentally rehearse the specific complex skill (e.g. golf swing, free throw).',
            'Motor cortex activation during SMR rehearsal identical to physical practice without physical fatigue.'),
          this.block('Physical Transfer', 2, 'quiet', null,
            'Remove headphones. Perform the physical skill 3 times with zero conscious thought.',
            'Transfers the primed neurological state to physical execution.')
        ];

      // ── RECOVERY (Post-workout / Theta) ───────────────────────────────────
      case 'recovery':
        return [
          this.block('Immediate Down-Regulation', 5, 'auditory', 7,
            'Theta wave (7 Hz) binaural beats. Deep amber/red ambient lighting. Box breathing (4-4-4-4).',
            'Immediate shift from sympathetic to parasympathetic nervous system. Halts cortisol production instantly.'),
          this.block('Deep Parasympathetic Rest (4 Hz)', 10, 'vibroacoustic', 4,
            'If available, 4 Hz physical vibration to major muscle groups used during training. Binaural beats at 4 Hz.',
            'Delta/Theta border forces vasodilation and accelerates lactic acid clearance. Maximizes Heart Rate Variability (HRV) rebound.'),
          this.block('Autogenic Relaxation', 5, 'quiet', null,
            'Complete silence. Mentally scan the body from feet to head, consciously releasing all remaining tension.',
            'Completes the physiological stress cycle, ensuring the body fully enters an anabolic repair state.')
        ];

      // ── PHASE-SHIFT (Jet lag / Circadian) ─────────────────────────────────
      case 'phase-shift':
        const direction = p.targetTimezoneOffset && p.targetTimezoneOffset > 0 ? 'Advance (Eastward)' : 'Delay (Westward)';
        return [
          this.block(`Circadian Reset: Phase ${direction}`, 15, 'ambient-light', null,
            direction === 'Advance (Eastward)' 
              ? 'High-intensity blue/cyan ambient light exposure immediately upon waking. No sunglasses outdoors.'
              : 'Strict amber/red light only in the evening. Total blue light blockade (screens, overheads) 3 hours before target sleep time.',
            'Light is the primary zeitgeber for the suprachiasmatic nucleus. Timed exposure shifts melatonin onset.'),
          this.block('Temperature & Arousal Sync', 10, 'auditory', 15,
            direction === 'Advance (Eastward)' 
              ? 'Cold shower, followed by 15 Hz Beta stimulation to force morning alertness.'
              : 'Warm bath (vasodilation to drop core temp), followed by 6 Hz Theta to induce sleep pressure.',
            'Core body temperature and neurological arousal must align with the target timezone\'s natural rhythms.')
        ];
    }
  }

  // ── Helper ─────────────────────────────────────────────────────────────────
  private block(
    label: string,
    durationMin: number,
    modality: IAthleticStimBlock['modality'],
    frequencyHz: number | null,
    instruction: string,
    rationale: string
  ): IAthleticStimBlock {
    return { label, durationMin, modality, frequencyHz, instruction, rationale };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GUIDANCE & REFERENCES
  // ══════════════════════════════════════════════════════════════════════════

  private buildAthleteGuidance(p: IAthleticProfile): string[] {
    switch (p.state) {
      case 'priming':
        return [
          '🔥 Use this protocol 15-30 minutes before your event.',
          '⚠️ Do not use if you are already experiencing high anxiety or "jitters" — it will push you over the edge.',
          '🎧 High volume is acceptable here. Stand up and move during the final minutes.'
        ];
      case 'flow':
        return [
          '🎯 Use this protocol right before practicing high-skill, technical movements.',
          '🧘‍♂️ The goal is physical relaxation combined with sharp external focus.',
          '🚫 Let go of conscious control. Trust your muscle memory.'
        ];
      case 'recovery':
        return [
          '🛌 Start this protocol within 15 minutes of finishing your training/event.',
          '📱 Put your phone in Do Not Disturb. Avoid all social media and stressful inputs.',
          '🫁 Focus entirely on long, slow exhales to drop your heart rate.'
        ];
      case 'phase-shift':
        return [
          '🌍 Begin this protocol 1-3 days before you travel, depending on the time difference.',
          '💡 Control your light environment strictly. Light is your primary biological clock.'
        ];
    }
  }

  private buildCoachNote(p: IAthleticProfile): string {
    const stateDesc = {
      'priming':      'Sympathetic Nervous System Activation (Pre-Event)',
      'flow':         'Sensorimotor Rhythm Entrainment (Skill / Accuracy)',
      'recovery':     'Parasympathetic Down-Regulation (Anabolic Repair)',
      'phase-shift':  'Circadian Suprachiasmatic Nucleus Reset'
    }[p.state];
    return `Athletic Protocol: ${stateDesc}. Target: ${p.sportType}.`;
  }

  private buildReferences(p: IAthleticProfile): string[] {
    return [
      'Thompson T et al. (2008). EEG applications for sport and performance. Methods in Neuroscience.',
      'Cheron G et al. (2016). Brain oscillations in sport: toward EEG biomarkers of performance. Frontiers in Psychology.',
      'Waterhouse J et al. (2007). The stress of travel. Journal of Sports Sciences.',
      'Binaural beats and athletic performance: A review of the literature (Sports Med, 2020).'
    ];
  }
}
