import { Injectable, signal } from '@angular/core';
import {
  DocLevel, IDocProfile, IDocStimBlock,
  IDocStimulationSession,
} from './patient.types';

/**
 * DocProtocolService
 *
 * Generates evidence-informed Sensory Stimulation Protocols for patients with
 * Disorders of Consciousness (DOC), including coma, vegetative state (VS/UWS),
 * minimally conscious state (MCS), and locked-in syndrome.
 *
 * Clinical basis:
 *  - Thalamocortical arousal theory (Schiff, 2010; Weill Cornell)
 *  - Gamma (40 Hz) entrainment via GENUS protocol (Tsai lab, MIT, 2019–2024)
 *  - Vibroacoustic therapy (Skille, 1989; Wigram, 1996)
 *  - Auditory SSEP/ASSR for covert cognition detection (Owen et al., 2006)
 *  - Coma Recovery Scale — Revised (CRS-R) response frameworks
 *  - Sensory Stimulation Assessment Measure (SSAM)
 *
 * IMPORTANT: All protocols generated here are research-informed and require
 * physician oversight. This tool is for scheduling/guidance only — it is not
 * a clinical decision-making system. Never use with elevated ICP without
 * neurosurgery clearance.
 */
@Injectable({ providedIn: 'root' })
export class DocProtocolService {

  readonly session = signal<IDocStimulationSession | null>(null);

  // ══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Generate a structured stimulation session protocol based on the patient's
   * DOC profile. Updates the `session` signal reactively.
   */
  generate(profile: IDocProfile): IDocStimulationSession {
    const schedule  = this.buildSchedule(profile);
    const warnings  = this.buildSafetyWarnings(profile);
    const guidance  = this.buildFamilyGuidance(profile);
    const refs      = this.buildReferences(profile);
    const total     = schedule.reduce((sum, b) => sum + b.durationMin, 0);

    const result: IDocStimulationSession = {
      profile,
      schedule,
      totalDurationMin:  total,
      sessionsPerDay:    this.sessionsPerDay(profile),
      clinician_note:    this.buildClinicianNote(profile),
      safety_warnings:   warnings,
      family_guidance:   guidance,
      evidence_references: refs,
    };

    this.session.set(result);
    return result;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCHEDULE BUILDER — ordered stimulation blocks per DOC level
  // ══════════════════════════════════════════════════════════════════════════

  private buildSchedule(p: IDocProfile): IDocStimBlock[] {
    switch (p.docLevel) {

      // ── COMA (no wake-sleep cycle, GCS 3–7) ──────────────────────────────
      case 'coma':
        return [
          this.block('Baseline Quiet', 5, 'quiet', null,
            'Silence all unnecessary ICU stimuli. Dim lights. Note any spontaneous movements or autonomic changes.',
            'Establishes a sensory baseline. Overstimulation in early coma worsens outcomes (Lombardi, 2002).'),
          this.block('Familiar Voice — Name + Memory', 10, 'familiar-voice', null,
            'Family member reads a short, personally meaningful narrative: childhood memories, shared experiences. '
            + 'Speak calmly, 60 cm from ear. Pause for 5 seconds between sentences.',
            'Familiar voice elicits stronger cortical response than unfamiliar voice in DOC patients (Perrin et al., 2006). '
            + 'Emotional + autobiographical content activates limbic pathways with preserved subcortical connectivity.'),
          this.block('Low-Frequency Vibroacoustic', 10, 'vibroacoustic', 40,
            'Apply 40 Hz vibration through mattress transducer pad (if available) or handheld massager to sternum/chest wall. '
            + 'Frequency: 40 Hz. Amplitude: 0.5mm displacement. Monitor for autonomic response.',
            'Somatosensory stimulation bypasses damaged cortical routes via thalamocortical projections. '
            + '40 Hz drives gamma through mechanoreceptors (Skille, 1989; Wigram, 1996).'),
          this.block('Rest + Autonomic Monitoring', 10, 'quiet', null,
            'Complete silence. Monitor HR, RR, BP, and pupillary response for 10 minutes. '
            + 'Document any motor response or facial expression.',
            'Post-stimulation window captures delayed cortical responses and prevents autonomic fatigue.'),
        ];

      // ── VEGETATIVE / UWS ──────────────────────────────────────────────────
      case 'vs-uws':
        return [
          this.block('Environment Calibration', 3, 'quiet', null,
            'Reduce ambient noise to < 45 dB. Minimize staff activity in room during session.',
            'Environmental noise in ICU averages 65–85 dB, masking meaningful stimulation responses.'),
          ...(p.familyVoiceAvailable ? [
            this.block('Familiar Voice — Personal Narrative', 8, 'familiar-voice', null,
              'Family reads 3–4 short sentences describing a meaningful shared memory. '
              + 'Pause 10 seconds between each. Watch for eye-tracking or orienting response.',
              'Perrin et al. (2006): EEG P300 detected in VS patients responding to own name. '
              + 'Familiar voice > unfamiliar voice for cortical activation in VS.'),
          ] : []),
          this.block('Preferred Music — 10 min', 10, 'auditory', null,
            `Play ${p.preferredMusic || 'patient\'s preferred music'} at 55–60 dB through stereo speakers or over-ear headphones. `
            + 'Observe for orienting head movements, facial expressions, or limb activity.',
            'Preferred music produces significantly more cortical activation than neutral music in VS/MCS '
            + '(Perrin et al., 2015; Naci et al., 2014). Limbic emotional memory pathways are often preserved.'),
          ...(!p.hasPhotosensitivity ? [
            this.block('Gamma Light Stimulation (40 Hz)', 10, 'gamma-light', 40,
              'Flickering LED panel at 40 Hz, positioned 30–60 cm from patient. Room lights dimmed. '
              + 'Session duration: 10 minutes. Monitor for startle, autonomic change, or ictal activity.',
              'MIT GENUS protocol (Iaccarino et al., 2016; Tsai, 2024): 40 Hz sensory flicker drives gamma '
              + 'oscillations via thalamocortical resonance. Early DOC trials show EEG gamma increase. '
              + 'CONTRAINDICATED in photosensitivity or seizure history.'),
          ] : []),
          this.block('Tactile + Auditory Combined', 8, 'tactile-audio', 40,
            'Gentle rhythmic touch (1 Hz) on forearm or hand, synchronized with soft drumbeat at 1 Hz. '
            + 'Maintain light pressure. Speak patient\'s name softly at 10-second intervals.',
            'Cross-modal sensory integration activates more thalamocortical networks than single-modality stimulation. '
            + 'Touch + auditory pairing (Rollnik, 2015).'),
          this.block('Rest + Documentation', 9, 'quiet', null,
            'Complete rest. Document: HR trend, any eye movement, limb movement, facial expression change. '
            + 'Use CRS-R response checklist.',
            'Structured behavioural observation post-stimulation. CRS-R is the gold-standard outcome measure.'),
        ];

      // ── MCS- (non-verbal responses only) ──────────────────────────────────
      case 'mcs-minus':
        return [
          this.block('Orienting + Name Response', 5, 'familiar-voice', null,
            'Say patient name 3× with 10s intervals. Watch for: eye opening, head turn, localising gaze. '
            + 'Record response latency.',
            'CRS-R visual pursuit and auditory localization items. MCS- patients show inconsistent non-reflexive responses.'),
          this.block('Preferred Music + Visual Tracking', 12, 'auditory', null,
            `Play ${p.preferredMusic || 'preferred music'} at 55 dB. Move a brightly coloured object slowly across the visual field. `
            + 'Document visual tracking episodes > 2 seconds.',
            'Visual pursuit ≥ 2 seconds above background = MCS criterion (Giacino et al., 2002).'),
          this.block('Binaural Theta (5.5 Hz)', 10, 'auditory', 5.5,
            'Binaural beats at 5.5 Hz (theta) through headphones, carrier 220 Hz. Volume: comfortable. '
            + 'Combine with quiet spoken narration from family.',
            'Theta entrainment targets thalamocortical binding frequencies associated with emerging consciousness. '
            + 'Higher-order thalamic nuclei show theta activity in MCS (Schiff, 2010).'),
          this.block('Vibroacoustic — 40 Hz Gamma', 10, 'vibroacoustic', 40,
            '40 Hz vibration to sternum or palms. Synchronize with soft verbal cue "feel this?" every 30 seconds.',
            'Somatosensory gamma entrainment supplements auditory pathways in patients with hearing deficit.'),
          this.block('Quiet + CRS-R Documentation', 8, 'quiet', null,
            'Rest. Complete CRS-R auditory, visual, motor, and oromotor subscales. '
            + 'Note any command-following attempt (MCS+ criterion).',
            'Post-stimulation window may unmask responses suppressed by cognitive fatigue during stimulation.'),
        ];

      // ── MCS+ (command-following, occasional yes/no) ────────────────────────
      case 'mcs-plus':
        return [
          this.block('Command-Following Calibration', 5, 'familiar-voice', null,
            'Simple motor command: "Close your eyes." "Move your right thumb." 3 repetitions, 15s interval. '
            + 'Record latency and consistency.',
            'CRS-R motor subscale 5–6. Functional communication precursor. '
            + 'Fatigue severely limits command-following — calibrate at session start.'),
          this.block('Theta + Alpha Entrainment', 15, 'auditory', 8,
            'Binaural beats 8 Hz (theta-alpha border) through headphones. '
            + 'Carrier 250 Hz. Background: brown noise at 45 dB. No conversation during this block.',
            'Alpha-theta border (8 Hz) is associated with hypnagogic states and early cortical integration. '
            + 'Targets thalamocortical binding needed for sustained command-following.'),
          this.block('Familiar Voice — Orientation Narrative', 10, 'familiar-voice', null,
            'Family reads: date, location, what has happened, reassurance. '
            + 'Pause for voluntary responses. If yes/no signaling exists: ask 2 simple questions.',
            'Orientation narrative reduces cognitive load and supports episodic memory reconstruction '
            + 'in EMCS transition (Shiel et al., 2000).'),
          this.block('Rest + Cognitive Recovery', 15, 'quiet', null,
            'Complete quiet. Dim lights. MCS+ patients experience significant cognitive fatigue. '
            + 'Do not attempt further stimulation if autonomic signs of distress appear.',
            'Cognitive fatigue in MCS+ is severe and clinically underappreciated. '
            + 'Owen et al. (2013): 35% of MCS+ patients fail command following due to fatigue, not absent awareness.'),
        ];

      // ── EMERGING FROM MCS ──────────────────────────────────────────────────
      case 'emcs':
        return [
          this.block('Alpha Coherence — Binaural', 20, 'auditory', 10,
            'Alpha binaural beats 10 Hz (carrier 300 Hz) through headphones. '
            + 'Pair with quiet ambient nature sounds at 45 dB.',
            'Alpha entrainment supports thalamocortical coherence and sustained attention — '
            + 'the primary cognitive deficit in EMCS. Targets DLPFC-thalamic connectivity.'),
          this.block('Preferred Music — Active Listening', 15, 'auditory', null,
            `Play ${p.preferredMusic || 'preferred music'}. Ask patient to indicate (thumb, eye, signal) when they recognize a song. `
            + 'Document recognition responses.',
            'Functional communication scaffold. Music recognition requires hippocampal + prefrontal engagement — '
            + 'emergence marker for higher-order consciousness.'),
          this.block('Vibroacoustic Wind-Down', 10, 'vibroacoustic', 40,
            '40 Hz vibroacoustic applied to lower back or soles of feet. '
            + 'Combine with slow guided breathing narration (4-1-6 ratio).',
            'End-of-session parasympathetic grounding. Prevents post-stimulation agitation in EMCS patients.'),
          this.block('Family Engagement + Orientation', 10, 'familiar-voice', null,
            'Unstructured conversation with family. Encourage patient response (any modality). '
            + 'Avoid overwhelming with questions — one question per minute maximum.',
            'EMCS patients may fatigue rapidly. Quality of engagement > quantity. '
            + 'Social presence maintains limbic arousal between formal sessions.'),
        ];

      // ── LOCKED-IN SYNDROME ────────────────────────────────────────────────
      case 'locked-in':
        return [
          this.block('IMPORTANT: Locked-in — Patient is FULLY CONSCIOUS', 0, 'quiet', null,
            'LiS patients are fully aware. Standard AVS entrainment is inappropriate. '
            + 'This session focuses on communication scaffolding and autonomic comfort.',
            'Locked-in Syndrome is frequently misdiagnosed as VS/coma. '
            + 'Establish eye-gaze or SSEP-based communication channel BEFORE any stimulation.'),
          this.block('Communication Channel Verification', 10, 'quiet', null,
            'Confirm yes/no eye-gaze code with patient. Test 3 questions with known answers. '
            + 'Do NOT proceed to stimulation without confirmed communication.',
            'Patient autonomy is paramount. All session content should be patient-directed.'),
          this.block('Patient-Directed Music Session', 20, 'auditory', null,
            `Ask: "Would you like to hear ${p.preferredMusic || 'your preferred music'}?" Wait for yes response. `
            + 'Patient controls session via eye gaze if BCI is available.',
            'Autonomy restoration is a primary therapeutic goal in LiS. '
            + 'Music provides emotional regulation and reduces depression (Bruno et al., 2011).'),
          this.block('Alpha Relaxation — Patient Consent Required', 15, 'auditory', 10,
            'Only if patient communicates willingness: alpha binaural 10 Hz at comfortable volume. '
            + 'Pause every 5 minutes to check comfort.',
            'Alpha AVS may provide spasticity reduction and autonomic calming without consciousness alteration.'),
          this.block('Rest on Patient\'s Signal', 10, 'quiet', null,
            'Watch for distress signals (eye gaze code for "stop"). '
            + 'End session whenever patient indicates.',
            'Patient-directed session termination is non-negotiable in LiS.'),
        ];
    }
  }

  // ── Helper ─────────────────────────────────────────────────────────────────
  private block(
    label: string,
    durationMin: number,
    modality: IDocStimBlock['modality'],
    frequencyHz: number | null,
    instruction: string,
    rationale: string,
    contraindications: string[] = [],
  ): IDocStimBlock {
    return { label, durationMin, modality, frequencyHz, instruction, rationale, contraindications };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SAFETY, GUIDANCE, REFERENCES
  // ══════════════════════════════════════════════════════════════════════════

  private buildSafetyWarnings(p: IDocProfile): string[] {
    const w: string[] = [];
    if (p.activeIcpMonitor)       w.push('⚠️ ICP monitor present — halt any stimulation if ICP > 20 mmHg or sustained HR increase > 20 bpm.');
    if (p.hasAutonomicStorming)   w.push('⚠️ Paroxysmal sympathetic hyperactivity documented — reduce stimulation intensity by 50%, monitor diaphoresis and posturing.');
    if (p.hasPhotosensitivity)    w.push('⚠️ Photosensitivity flagged — gamma-light flicker protocol is CONTRAINDICATED.');
    if (p.daysPostOnset < 7)      w.push('⚠️ < 7 days post-onset — neurological status is still evolving. Limit to familiar voice only. No vibroacoustic until Day 7.');
    if (p.gcsScore <= 5)          w.push('⚠️ GCS ≤ 5 — Stimulation sessions must be < 20 minutes. Monitor for agitation or autonomic stress throughout.');
    if (p.docLevel === 'locked-in') w.push('🔴 Locked-in Syndrome — Patient is FULLY CONSCIOUS. All sessions require explicit patient consent via established communication method.');
    if (!p.familyVoiceAvailable)  w.push('ℹ️ Family voice unavailable — substitute with patient\'s favourite narrator (audiobook) or music as a familiar-voice proxy.');
    w.push('ℹ️ All stimulation sessions: minimum 4-hour rest interval between sessions.');
    w.push('ℹ️ Discontinue immediately if: sustained HR > 110, visible distress, SBP > 180, new pupillary asymmetry.');
    return w;
  }

  private buildFamilyGuidance(p: IDocProfile): string[] {
    const base = [
      '📱 Record a 2–3 minute voice message describing a warm shared memory. The clinical team will play it during sessions.',
      '🎵 Share a playlist of 5–10 songs the patient loved. Include music from their late teens/early 20s — this period is most deeply encoded.',
      '🕐 Visit during scheduled session windows (posted on the room door). Your presence during stimulation is medically meaningful.',
      '🤫 During sessions: speak softly, move slowly. Minimize background noise — turn off TVs and phones.',
      '👁️ What to watch for: any eye movement toward your voice, a slight finger twitch, facial muscle change. Report everything to the nurse.',
      '💛 Understand that responses may be delayed by minutes. Do not interpret lack of immediate response as absence of awareness.',
    ];
    if (p.docLevel === 'locked-in') {
      return [
        '🔴 Your family member is FULLY AWAKE AND AWARE. They can hear and understand everything said in the room.',
        '👁️ We are establishing an eye-gaze communication system. Ask yes/no questions and watch for the agreed eye movement.',
        '📖 Read to them daily. Share news, stories, and updates as you normally would in conversation.',
        '🚫 Do NOT discuss the patient\'s prognosis, financial, or legal matters in the room without their communication method available.',
      ];
    }
    if (p.docLevel === 'mcs-plus' || p.docLevel === 'emcs') {
      base.push('💬 If your family member responds (however small), celebrate calmly. Excitement can cause cognitive shutdown. Say "I see you, that\'s wonderful" and wait 30 seconds before continuing.');
    }
    return base;
  }

  private buildClinicianNote(p: IDocProfile): string {
    const level = {
      'coma':       'Deep coma — subcortical-only stimulation; familiar voice + vibroacoustic + gamma',
      'vs-uws':     'Vegetative/UWS — full multimodal protocol; 40 Hz gamma + familiar voice + preferred music',
      'mcs-minus':  'MCS- — binaural theta + music + tactile; document CRS-R post-session',
      'mcs-plus':   'MCS+ — theta/alpha entrainment + orientation narrative; watch for command-following fatigue',
      'emcs':       'EMCS — alpha coherence + family engagement; cognitive fatigue limits session length',
      'locked-in':  'Locked-in Syndrome — FULLY CONSCIOUS; communication scaffolding only; explicit consent required for all stimulation',
    }[p.docLevel];
    return `${level}. GCS ${p.gcsScore}, day ${p.daysPostOnset} post-onset (${p.etiology}).`;
  }

  private sessionsPerDay(p: IDocProfile): number {
    if (p.docLevel === 'coma')      return 3;
    if (p.docLevel === 'vs-uws')    return 4;
    if (p.docLevel === 'mcs-minus') return 3;
    if (p.docLevel === 'mcs-plus')  return 2;
    if (p.docLevel === 'emcs')      return 2;
    return 1; // locked-in: patient-directed
  }

  private buildReferences(p: IDocProfile): string[] {
    const refs = [
      'Giacino JT et al. (2002). The minimally conscious state. Neurology. 58(3):349–353.',
      'Owen AM et al. (2006). Detecting awareness in the vegetative state. Science. 313(5792):1402.',
      'Schiff ND. (2010). Recovery of consciousness after brain injury. Prog Brain Res. 177:579–593.',
      'Perrin F et al. (2006). Brain response to one\'s own name in vegetative state. Neuroreport. 17(17):1719–1723.',
      'Skille O. (1989). Vibroacoustic therapy. Music Therapy. 8(1):61–77.',
      'Rollnik JD. (2015). Sensory stimulation in disorders of consciousness. Eur J Phys Rehabil Med. 51(5):655–663.',
    ];
    if (!p.hasPhotosensitivity) {
      refs.push('Iaccarino HF et al. (2016). Gamma frequency entrainment attenuates amyloid load and modifies microglia. Nature. 540(7632):230–235.');
      refs.push('Tsai LH. (2024). GENUS (Gamma ENtrainment Using Sensory Stimuli) — clinical trial updates. MIT Picower Institute.');
    }
    if (p.docLevel === 'locked-in') {
      refs.push('Bruno MA et al. (2011). A survey on self-assessed well-being in a cohort of chronic locked-in syndrome patients. BMJ Open. 1(1).');
    }
    return refs;
  }
}
