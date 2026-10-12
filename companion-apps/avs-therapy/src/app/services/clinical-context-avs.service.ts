import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PatientStateService } from './patient-state.service';
import { GlobalAvsService } from './global-avs.service';
import { IAvsProtocol, ITraumaFlags } from './patient.types';

/**
 * ClinicalContextAvsService — Personalized Co-Regulation AVS Engine
 *
 * Uses Gemini to analyze the patient's clinical context (PTSD history,
 * occupation, reason for visit, mental health notes, medications) and
 * generate a personalized IAvsProtocol that calms both patient and clinician
 * simultaneously through shared rhythmic entrainment.
 *
 * Grounded in:
 *  - Polyvagal Theory (Porges, 2017) — clinician co-regulation effect
 *  - Peniston Protocol (1991) — alpha/theta for PTSD
 *  - HeartMath HRV coherence research — shared 0.1 Hz resonance
 *
 * Safety gates are applied BEFORE Gemini is called, blocking contraindicated
 * protocols for seizure disorders, active psychosis, and acute suicidality.
 */
@Injectable({ providedIn: 'root' })
export class ClinicalContextAvsService {
  private readonly state  = inject(PatientStateService);
  private readonly avs    = inject(GlobalAvsService);
  private readonly pid    = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.pid);

  // ── Occupation → Autonomic Profile ────────────────────────────────────────
  /**
   * Maps occupational keywords to recommended AVS parameters.
   * This is a clinical heuristic — Gemini may override based on chart context.
   */
  private readonly OCCUPATION_PROFILES: Array<{
    keywords: string[];
    wave: IAvsProtocol['wave'];
    bpm: number;
    palette: IAvsProtocol['color_palette'];
    noise: IAvsProtocol['noise_type'];
    ratio: IAvsProtocol['breath_ratio'];
  }> = [
    {
      keywords: ['veteran', 'military', 'army', 'navy', 'marine', 'air force', 'combat', 'soldier'],
      wave: 'theta', bpm: 5.0, palette: 'violet', noise: 'brown',
      ratio: { inhale: 4, hold: 1, exhale: 7 },
    },
    {
      keywords: ['firefighter', 'paramedic', 'emt', 'police', 'law enforcement', 'first responder', 'dispatcher'],
      wave: 'alpha', bpm: 5.5, palette: 'blue', noise: 'brown',
      ratio: { inhale: 4, hold: 2, exhale: 6 },
    },
    {
      keywords: ['nurse', 'doctor', 'physician', 'surgeon', 'therapist', 'counselor', 'healthcare', 'medical'],
      wave: 'alpha', bpm: 5.5, palette: 'blue', noise: 'pink',
      ratio: { inhale: 4, hold: 1, exhale: 6 },
    },
    {
      keywords: ['teacher', 'educator', 'professor', 'school', 'classroom'],
      wave: 'alpha', bpm: 6.0, palette: 'emerald', noise: 'pink',
      ratio: { inhale: 4, hold: 1, exhale: 5 },
    },
    {
      keywords: ['construction', 'labor', 'warehouse', 'factory', 'mechanic', 'driver', 'operator'],
      wave: 'theta', bpm: 5.5, palette: 'emerald', noise: 'brown',
      ratio: { inhale: 4, hold: 1, exhale: 6 },
    },
    {
      keywords: ['executive', 'manager', 'director', 'ceo', 'cfo', 'lawyer', 'attorney', 'finance', 'banker'],
      wave: 'alpha', bpm: 5.0, palette: 'blue', noise: 'white',
      ratio: { inhale: 4, hold: 2, exhale: 6 },
    },
  ];

  // ── Keyword Extraction ─────────────────────────────────────────────────────
  /** PTSD and trauma keywords for chart scanning. */
  private readonly TRAUMA_KEYWORDS = {
    ptsd:        ['ptsd', 'post-traumatic', 'post traumatic', 'trauma'],
    seizure:     ['seizure', 'epilepsy', 'epileptic', 'convulsion'],
    dissociation:['dissociation', 'dissociative', 'derealization', 'depersonalization'],
    combat:      ['combat', 'veteran', 'military trauma', 'war', 'deployment'],
    psychosis:   ['psychosis', 'psychotic', 'schizophrenia', 'hallucination', 'delusion'],
    photo:       ['photosensitivity', 'photophobia', 'light sensitivity'],
    stimulants:  ['adderall', 'ritalin', 'methylphenidate', 'amphetamine', 'vyvanse', 'concerta'],
    suicidality: ['suicidal', 'suicidality', 'self-harm', 'si', 'hx si'],
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Generate a personalized AVS co-regulation protocol using Gemini.
   *
   * Flow:
   *  1. Extract trauma safety gates from chart text
   *  2. Check for hard contraindications — if found, return null and log
   *  3. Build Gemini prompt from patient context
   *  4. Parse response → IAvsProtocol
   *  5. Apply to GlobalAvsService and PatientStateService
   *
   * @returns The generated protocol, or null if contraindicated.
   */
  async generateContextualProtocol(): Promise<IAvsProtocol | null> {
    if (!this.isBrowser) return null;

    this.state.isGeneratingAvsProtocol.set(true);
    try {
      // Step 1: Scan chart text for trauma flags
      const chartText = this.buildChartText();
      const flags = this.extractTraumaFlags(chartText);
      this.state.traumaFlags.set(flags);

      // Step 2: Hard contraindication gate
      const contraindications = this.checkContraindications(flags);
      if (contraindications.length > 0) {
        console.warn('[ClinicalContextAvs] AVS contraindicated:', contraindications);
        return null;
      }

      // Step 3: Try AI-generated protocol first
      const protocol = await this.generateWithGemini(chartText, flags);
      if (protocol) {
        this.applyProtocol(protocol);
        return protocol;
      }

      // Step 4: Fallback to deterministic heuristic if Gemini fails
      const fallback = this.buildHeuristicProtocol(flags);
      this.applyProtocol(fallback);
      return fallback;

    } finally {
      this.state.isGeneratingAvsProtocol.set(false);
    }
  }

  /**
   * Apply an already-generated protocol (e.g. from storage) without re-running Gemini.
   */
  applyProtocol(protocol: IAvsProtocol): void {
    this.state.avsProtocol.set(protocol);
    this.state.avsBrainwaveFrequency.set(protocol.wave);
    this.state.avsBreathingRate.set(protocol.breathing_bpm);
    this.avs.updateWave(protocol.wave);
    this.avs.updateBreathRate(protocol.breathing_bpm);
    this.applyColorPalette(protocol.color_palette);
  }

  /**
   * Returns a quick heuristic protocol without calling Gemini.
   * Useful for immediate feedback before the async Gemini call resolves.
   */
  buildHeuristicProtocol(flags?: ITraumaFlags): IAvsProtocol {
    const f = flags ?? this.extractTraumaFlags(this.buildChartText());
    const occupation = this.state.occupation()?.toLowerCase() ?? '';
    const profile = this.OCCUPATION_PROFILES.find(p =>
      p.keywords.some(k => occupation.includes(k))
    );

    // PTSD-specific override: Peniston alpha/theta protocol
    if (f.hasPtsd && !f.hasDissociativeEpisodes) {
      return this.buildProtocol({
        wave: 'theta', bpm: 5.0, palette: 'violet', noise: 'brown',
        ratio: { inhale: 4, hold: 1, exhale: 7 },
        intent: 'Theta resonance (Peniston-informed) — supporting grounded nervous system regulation',
        message: 'Take your time. You are safe here. Follow the gentle rhythm.',
        flags: ['PTSD noted — theta depth work only with clinician supervision'],
        contraindications: [],
      });
    }

    const p = profile ?? {
      wave: 'alpha', bpm: 5.5, palette: 'emerald', noise: 'brown',
      ratio: { inhale: 4, hold: 1, exhale: 6 },
    };

    return this.buildProtocol({
      ...p,
      intent: 'Alpha resonance at 5.5 BPM — supporting calm alertness for patient and clinician',
      message: 'Take a slow breath together. You\'re in good hands.',
      flags: [],
      contraindications: [],
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GEMINI INTEGRATION
  // ══════════════════════════════════════════════════════════════════════════

  private async generateWithGemini(chartText: string, flags: ITraumaFlags): Promise<IAvsProtocol | null> {
    const systemInstruction = `You are a clinical AVS (Audio-Visual Stimulation) protocol advisor
integrated into a trauma-informed medical care management platform.

Based on the patient's clinical context, generate a personalized co-regulation protocol
that calms BOTH the patient and the clinician simultaneously through shared rhythmic entrainment.

If Dietary & Nutrition Intake is provided, factor this into your clinical intent and wellness message. Parasympathetic dominance (rest and digest) should be leveraged to prime the body for nutrient absorption.

CRITICAL SAFETY RULES:
- NEVER recommend gamma or high beta for PTSD patients
- For dissociative episodes: alpha only (8–12 Hz), never theta depth work
- For stimulant medications: avoid beta (20–40 Hz), stay alpha
- For combat trauma: avoid red/amber color palettes
- For photosensitivity: note in safety_flags but still generate a protocol
- All patient-facing text must use wellness framing ONLY — never mention diagnoses

Output ONLY valid JSON. No markdown, no explanation, no code fences.`;

    const userPrompt = `Generate a personalized AVS co-regulation protocol for this patient encounter.

${chartText}

Return this exact JSON schema (all fields required):
{
  "wave": "alpha" | "theta" | "delta" | "beta",
  "breathing_bpm": <number between 4.5 and 7.0>,
  "color_palette": "emerald" | "blue" | "violet" | "amber" | "rose-earth",
  "noise_type": "brown" | "pink" | "white",
  "breath_ratio": { "inhale": <int 3-5>, "hold": <int 0-2>, "exhale": <int 5-8> },
  "session_intent": "<one sentence for the clinician — clinical framing, max 15 words>",
  "patient_message": "<one sentence shown to patient — wellness only, no diagnoses, max 12 words>",
  "safety_flags": ["<advisory string>"],
  "contraindications": []
}`;

    try {
      const res = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientData: userPrompt,
          systemInstruction,
          model: this.state.selectedAiModel() || 'gemini-3.8-flash',
          temperature: 0.1, // Low temperature for consistent, safe JSON
        }),
      });

      if (!res.ok || !res.body) return null;

      // Collect the full streamed response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Extract text from SSE data: lines
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
              fullText += text;
            } catch { /* skip malformed SSE lines */ }
          }
        }
      }

      return this.parseProtocolFromText(fullText, flags);
    } catch (err: any) {
      console.warn('[ClinicalContextAvs] Gemini call failed:', err.message);
      return null;
    }
  }

  /** Parse and validate the JSON protocol from Gemini's response text. */
  private parseProtocolFromText(text: string, flags: ITraumaFlags): IAvsProtocol | null {
    try {
      // Extract JSON from text (handles cases where model adds minor prose)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const raw = JSON.parse(jsonMatch[0]);

      // Validate and clamp critical safety fields
      const wave = this.safeWave(raw.wave, flags);
      const bpm  = Math.max(4.5, Math.min(7.0, Number(raw.breathing_bpm) || 5.5));

      return this.buildProtocol({
        wave,
        bpm,
        palette: this.safePalette(raw.color_palette, flags),
        noise:   (['brown', 'pink', 'white'].includes(raw.noise_type) ? raw.noise_type : 'brown') as IAvsProtocol['noise_type'],
        ratio: {
          inhale: Math.max(3, Math.min(5, Number(raw.breath_ratio?.inhale) || 4)),
          hold:   Math.max(0, Math.min(2, Number(raw.breath_ratio?.hold) || 1)),
          exhale: Math.max(5, Math.min(8, Number(raw.breath_ratio?.exhale) || 6)),
        },
        intent:          String(raw.session_intent || '').slice(0, 120),
        message:         String(raw.patient_message || '').slice(0, 80),
        flags:           Array.isArray(raw.safety_flags) ? raw.safety_flags : [],
        contraindications: [],
      });
    } catch (err) {
      console.warn('[ClinicalContextAvs] Protocol parse error:', err);
      return null;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TRAUMA FLAG EXTRACTION
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Scan chart text for trauma and safety keywords.
   * Errs on the side of detection — false positives are safer than false negatives.
   */
  private extractTraumaFlags(chartText: string): ITraumaFlags {
    const lower = chartText.toLowerCase();
    const has = (keywords: string[]) => keywords.some(k => lower.includes(k));

    const knownTriggers: string[] = [];
    const triggerPhrases = ['loud noises', 'crowds', 'confined spaces', 'authority', 'medical settings', 'uniforms'];
    triggerPhrases.forEach(t => { if (lower.includes(t)) knownTriggers.push(t); });

    return {
      hasPtsd:                has(this.TRAUMA_KEYWORDS.ptsd),
      hasSeizureDisorder:     has(this.TRAUMA_KEYWORDS.seizure),
      hasDissociativeEpisodes:has(this.TRAUMA_KEYWORDS.dissociation),
      hasCombatTrauma:        has(this.TRAUMA_KEYWORDS.combat),
      hasActivePsychosis:     has(this.TRAUMA_KEYWORDS.psychosis),
      hasPhotosensitivity:    has(this.TRAUMA_KEYWORDS.photo),
      hasStimulantMedication: has(this.TRAUMA_KEYWORDS.stimulants),
      acuteSuicidality:       has(this.TRAUMA_KEYWORDS.suicidality),
      knownTriggers,
    };
  }

  /** Return hard-blocking contraindications. AVS will not start if any are returned. */
  private checkContraindications(flags: ITraumaFlags): string[] {
    const c: string[] = [];
    if (flags.hasActivePsychosis)   c.push('Active psychosis — AVS contraindicated');
    if (flags.acuteSuicidality)     c.push('Acute suicidality — AVS contraindicated. Escalate to crisis protocol.');
    if (flags.hasSeizureDisorder)   c.push('Seizure disorder — flicker AVS contraindicated. Audio-only mode required.');
    return c;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  /** Build the chart text context string for Gemini from PatientStateService signals. */
  private buildChartText(): string {
    const s = this.state;
    const notes = s.clinicalNotes().map(n => n.text).join('\n');
    const meds  = s.medications().map(m => `${m.name}: ${m.value}`).join(', ');
    const parts = Object.entries(s.issues())
      .flatMap(([, issues]) => issues.map(i => `${i.name} (pain ${i.painLevel}/10): ${i.description}`))
      .join('\n');

    return `
Chief Complaint / Reason for Visit: ${s.reasonForVisit() || s.patientGoals() || 'Not recorded'}
Occupation: ${s.occupation() || 'Not recorded'}
Dietary & Nutrition Intake: ${s.dietaryProtocol() || 'None recorded'}
Active Medications: ${meds || 'None recorded'}
Clinical Notes: ${notes || 'None recorded'}
Body Areas of Concern: ${parts || 'None selected'}
`.trim();
  }

  /** Safety-gate the wave selection based on trauma flags. */
  private safeWave(raw: string, flags: ITraumaFlags): IAvsProtocol['wave'] {
    const allowed: IAvsProtocol['wave'][] = ['delta', 'theta', 'alpha', 'beta'];
    let wave = (allowed.includes(raw as any) ? raw : 'alpha') as IAvsProtocol['wave'];
    // Dissociative: force alpha, never theta/delta
    if (flags.hasDissociativeEpisodes && (wave === 'theta' || wave === 'delta')) wave = 'alpha';
    // Stimulants: avoid beta
    if (flags.hasStimulantMedication && wave === 'beta') wave = 'alpha';
    return wave;
  }

  /** Safety-gate color palette for combat trauma (avoid red/amber). */
  private safePalette(raw: string, flags: ITraumaFlags): IAvsProtocol['color_palette'] {
    const allowed: IAvsProtocol['color_palette'][] = ['emerald', 'blue', 'violet', 'amber', 'rose-earth'];
    let palette = (allowed.includes(raw as any) ? raw : 'blue') as IAvsProtocol['color_palette'];
    if (flags.hasCombatTrauma && (palette === 'amber')) palette = 'blue';
    return palette;
  }

  /** Apply the color palette from the protocol to the CSS contract. */
  private applyColorPalette(palette: IAvsProtocol['color_palette']): void {
    if (!this.isBrowser) return;
    const PALETTE_MAP: Record<IAvsProtocol['color_palette'], string> = {
      'emerald':   'alpha',   // maps to existing CSS brainwave classes
      'blue':      'alpha',
      'violet':    'delta',
      'amber':     'beta',
      'rose-earth':'theta',
    };
    // Set a direct palette override as a data attribute the CSS can target
    document.body.setAttribute('data-avs-palette', palette);
  }

  /** Build a typed IAvsProtocol from raw parameters. */
  private buildProtocol(p: {
    wave: IAvsProtocol['wave'];
    bpm: number;
    palette: IAvsProtocol['color_palette'];
    noise: IAvsProtocol['noise_type'];
    ratio: IAvsProtocol['breath_ratio'];
    intent: string;
    message: string;
    flags: string[];
    contraindications: string[];
  }): IAvsProtocol {
    const contextHash = btoa(
      `${this.state.reasonForVisit()}|${this.state.occupation()}|${p.wave}|${p.bpm}`
    ).slice(0, 12);

    return {
      wave:              p.wave,
      breathing_bpm:     p.bpm,
      color_palette:     p.palette,
      noise_type:        p.noise,
      breath_ratio:      p.ratio,
      session_intent:    p.intent,
      patient_message:   p.message,
      safety_flags:      p.flags,
      contraindications: p.contraindications,
      generated_at:      Date.now(),
      context_hash:      contextHash,
    };
  }
}
