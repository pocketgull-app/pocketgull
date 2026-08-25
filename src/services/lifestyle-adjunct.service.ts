import { Injectable, inject, signal, computed } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import {
  ILifestyleContext, ILifestyleAdjunct, ISessionRecommendation,
} from './patient.types';

/**
 * LifestyleAdjunctService
 *
 * Deterministic, evidence-grounded lifestyle adjunct recommendations for the
 * clinical AVS session. Reads the patient chart for substance use and metabolic
 * conditions, then generates a personalized set of beverage recommendations,
 * session timing advisories, and AVS parameter adjustments.
 *
 * Substance–AVS interactions modeled:
 *  • Caffeine    — adenosine antagonism; interferes with alpha/theta entrainment
 *  • Nicotine    — stimulant; elevates HR/BP; impairs HRV coherence
 *  • Alcohol     — GABA/glutamate dysregulation; alters delta depth response
 *  • Cannabis    — heightened sensory sensitivity; amplifies AVS perceptually
 *  • CBD         — GABAergic; may synergize with alpha entrainment
 *  • Diabetes    — HRV impaired by glycemic variability; timing-sensitive
 *  • Pre-diabetes— mild autonomic neuropathy risk; moderate adjustments
 *
 * No Gemini required — deterministic for clinical reliability and instant display.
 */
@Injectable({ providedIn: 'root' })
export class LifestyleAdjunctService {
  private readonly state = inject(PatientStateService);

  // ── Reactive output ────────────────────────────────────────────────────────
  readonly adjunct = signal<ILifestyleAdjunct | null>(null);

  // ── Chart keyword maps ─────────────────────────────────────────────────────
  private readonly KW = {
    caffeine:   ['coffee', 'caffeine', 'espresso', 'energy drink', 'red bull', 'monster', 'tea.*black', 'tea.*green', 'matcha', 'caffeinated'],
    caffeineNow:['had coffee', 'coffee this morning', 'coffee before', 'coffee today', 'espresso today', 'energy drink today'],
    alcohol:    ['alcohol', 'ethanol', 'drinks', 'beer', 'wine', 'spirits', 'whiskey', 'vodka', 'liquor', 'drinking'],
    recovery:   ['sobriety', 'sober', 'aa ', 'alcoholics anonymous', 'in recovery', 'alcohol recovery', 'etoh recovery'],
    smoking:    ['smok', 'cigarette', 'tobacco', 'nicotine', 'vaping', 'vape', 'juul', 'e-cig'],
    cannabis:   ['cannabis', 'marijuana', 'thc', 'weed', 'pot ', 'dab', 'edible.*thc', 'high.*thc'],
    cbd:        ['cbd', 'cannabidiol', 'hemp oil', 'hemp extract'],
    diabetic:   ['diabetes', 'diabetic', 'type 1', 'type 2', 't1dm', 't2dm', 'insulin', 'metformin', 'glipizide', 'semaglutide', 'ozempic', 'jardiance'],
    preDiabetic:['pre-diabet', 'prediabet', 'impaired fasting', 'igf', 'borderline diabet'],
    neuro:      ['multiple sclerosis', ' ms ', 'ms,', 'demyelin', 'neuropathy', 'neurological', 'neuro-demyelinating', 'axon', 'optic neuritis', 'uhthoff', 'moga', 'santos'],
    visual:     ['blind', 'vision loss', 'optic neuritis', 'macular', 'glaucoma', 'cataract', 'retinopathy', 'low vision'],
    cognitive:  ['dyslexia', 'adhd', 'autism', 'sensory overload', 'mci', 'dementia', 'concussion', 'tbi', 'cognitive decline'],
  } as const;

  // ══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Scan the current patient chart and generate lifestyle adjunct recommendations.
   * Updates the `adjunct` signal — components react automatically.
   */
  generate(): ILifestyleAdjunct {
    const chartText = this.buildChartText();
    const ctx       = this.extractContext(chartText);
    const recs      = this.buildRecommendations(ctx);
    const note      = this.buildClinicianNote(ctx);

    const result: ILifestyleAdjunct = { context: ctx, recommendations: recs, clinician_note: note };
    this.adjunct.set(result);
    return result;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CONTEXT EXTRACTION
  // ══════════════════════════════════════════════════════════════════════════

  private extractContext(text: string): ILifestyleContext {
    const lower = text.toLowerCase();
    const any   = (kws: readonly string[]) => kws.some(k => new RegExp(k).test(lower));
    const notes: string[] = [];

    const ctx: ILifestyleContext = {
      hasCaffeine:           any(this.KW.caffeine),
      hasCaffeineWithinSession: any(this.KW.caffeineNow),
      hasAlcohol:            any(this.KW.alcohol),
      inAlcoholRecovery:     any(this.KW.recovery),
      isSmoker:              any(this.KW.smoking),
      isCannabisUser:        any(this.KW.cannabis),
      usesCbd:               any(this.KW.cbd),
      isDiabetic:            any(this.KW.diabetic),
      isPreDiabetic:         any(this.KW.preDiabetic),
      hasNeuroCondition:     any(this.KW.neuro),
      hasVisualImpairment:   any(this.KW.visual),
      hasCognitiveSensitivity: any(this.KW.cognitive),
      notes,
    };

    if (ctx.hasCaffeine)             notes.push('Caffeine use noted');
    if (ctx.hasAlcohol)              notes.push(ctx.inAlcoholRecovery ? 'Alcohol — in recovery' : 'Active alcohol use noted');
    if (ctx.isSmoker)                notes.push('Tobacco/nicotine use noted');
    if (ctx.isCannabisUser)          notes.push('Cannabis (THC) use noted');
    if (ctx.usesCbd)                 notes.push('CBD use noted');
    if (ctx.isDiabetic)              notes.push('Diabetic — glycemic timing matters');
    if (ctx.isPreDiabetic)           notes.push('Pre-diabetic — blood sugar monitoring recommended');
    if (ctx.hasNeuroCondition)       notes.push('Multiple Sclerosis / Neuro-Demyelination — Uhthoff thermoregulation & axonal support indicated');
    if (ctx.hasVisualImpairment)     notes.push('Visual Impairment / Optic Neuritis — Audio-primary spatial acoustic protocol active');
    if (ctx.hasCognitiveSensitivity)  notes.push('Cognitive Sensitivity / Neuro-divergence — High-legibility literacy & 40 Hz Gamma entrainment indicated');

    return ctx;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RECOMMENDATION ENGINE
  // ══════════════════════════════════════════════════════════════════════════

  private buildRecommendations(ctx: ILifestyleContext): ISessionRecommendation[] {
    const recs: ISessionRecommendation[] = [];

    // ── CAFFEINE ────────────────────────────────────────────────────────────
    if (ctx.hasCaffeineWithinSession) {
      recs.push({
        category: 'caution',
        emoji: '☕',
        title: 'Caffeine Within Last 2–3 Hours',
        detail: 'Recent caffeine blocks adenosine, suppressing the alpha waves we\'re targeting. '
          + 'Extend the session by 5 minutes and start with a slower breath rate (4.5 BPM) to compensate.',
        avsAdjust: { param: 'breathing_bpm', value: 4.5 },
      });
      recs.push({
        category: 'beverage',
        emoji: '🍵',
        title: 'Switch to L-Theanine Tea',
        detail: 'L-theanine (naturally in green tea) promotes alpha wave activity and synergizes with AVS entrainment. '
          + 'Matcha or green tea: 1 cup 20 minutes before the session. '
          + 'Chamomile or lemon balm tea are caffeine-free alternatives for alpha support.',
      });
    } else if (ctx.hasCaffeine) {
      recs.push({
        category: 'beverage',
        emoji: '🍵',
        title: 'Pre-Session Beverage Swap',
        detail: 'Consider replacing coffee with L-theanine-rich green tea or matcha 30–60 min before AVS. '
          + 'Chamomile, passionflower, or lemon balm teas are caffeine-free alternatives '
          + 'that actively support GABA and alpha coherence.',
      });
    }

    // ── NICOTINE / SMOKING ──────────────────────────────────────────────────
    if (ctx.isSmoker) {
      recs.push({
        category: 'avs-adjustment',
        emoji: '🫁',
        title: 'Nicotine — Extended Exhale Protocol',
        detail: 'Nicotine elevates cortisol and HR, making HRV coherence harder to achieve. '
          + 'Extend the exhale phase (use 4-1-7 ratio instead of 4-1-6). '
          + 'Brief breath-hold before exhale activates the vagal brake more effectively in nicotine-exposed airways.',
        avsAdjust: { param: 'breathing_bpm', value: 4.8 },
      });
      recs.push({
        category: 'beverage',
        emoji: '🌿',
        title: 'Peppermint or Ginger Tea',
        detail: 'Peppermint tea opens airways and reduces nicotine craving signals. '
          + 'Ginger tea addresses any nausea from cortisol elevation. '
          + 'Both are broncho-supportive without interfering with AVS entrainment.',
      });
      recs.push({
        category: 'wind-down',
        emoji: '🚭',
        title: 'Post-Session Craving Window',
        detail: 'HRV coherence from the AVS session can reduce nicotine cravings for 20–40 minutes. '
          + 'Encourage the patient to delay the post-appointment cigarette and walk outside instead.',
      });
    }

    // ── ALCOHOL — ACTIVE USE ────────────────────────────────────────────────
    if (ctx.hasAlcohol && !ctx.inAlcoholRecovery) {
      recs.push({
        category: 'caution',
        emoji: '🍺',
        title: 'Alcohol Use — Amplified Sedation Risk',
        detail: 'Alcohol potentiates GABA-A receptors. Combined with theta/delta AVS, there is a risk of '
          + 'excessive sedation or dissociation. Limit session to alpha (10 Hz), keep room well-lit, '
          + 'and have patient remain seated for 5 minutes post-session.',
        avsAdjust: { param: 'wave', value: 'alpha' },
      });
      recs.push({
        category: 'beverage',
        emoji: '💧',
        title: 'Electrolyte Water + B-Vitamins',
        detail: 'Alcohol depletes thiamine (B1), B12, and magnesium. '
          + 'Offer water with electrolytes. Coconut water is ideal. '
          + 'Milk thistle tea supports hepatic recovery between visits.',
      });
    }

    // ── ALCOHOL — RECOVERY ──────────────────────────────────────────────────
    if (ctx.inAlcoholRecovery) {
      recs.push({
        category: 'avs-adjustment',
        emoji: '🧠',
        title: 'Recovery Protocol — Theta for GABA Normalization',
        detail: 'Alpha/theta neurofeedback (the Peniston Protocol) has the strongest evidence base for '
          + 'alcohol use disorder recovery. Theta (6 Hz) helps normalize the dysregulated GABA/glutamate ratio '
          + 'from chronic alcohol exposure. This is the optimal protocol for this patient.',
        avsAdjust: { param: 'wave', value: 'theta' },
      });
      recs.push({
        category: 'beverage',
        emoji: '🌼',
        title: 'Suggested Teas for GABA Support',
        detail: '• Passionflower tea — mild GABA-A modulator, reduces anxiety without dependence risk\n'
          + '• Valerian root (evening only) — GABAergic, restorative sleep support\n'
          + '• Ashwagandha tea — HPA axis regulation, cortisol reduction\n'
          + '• Avoid kombucha if fermented (trace alcohol).',
      });
    }

    // ── CANNABIS / THC ──────────────────────────────────────────────────────
    if (ctx.isCannabisUser) {
      recs.push({
        category: 'caution',
        emoji: '🌿',
        title: 'Cannabis Use — Heightened Sensory Sensitivity',
        detail: 'THC amplifies sensory processing. AVS audio-visual inputs may feel more intense. '
          + 'Reduce binaural beat volume by 30%, use brown noise only (no pink), '
          + 'and use the amber or blue palette — avoid violet/red which can feel overwhelming.',
        avsAdjust: { param: 'wave', value: 'alpha' },
      });
      recs.push({
        category: 'beverage',
        emoji: '🍋',
        title: 'Limonene-Rich Teas for THC Modulation',
        detail: '• Lemon balm tea — anxiolytic, reduces THC-induced anxiety via GABAergic activity\n'
          + '• Lavender tea — linalool terpene synergizes with calming effects\n'
          + '• Black peppercorn tea (1–2 peppercorns steeped) — beta-caryophyllene, a CB2 agonist '
          + 'that modulates the high. A folk remedy with some pharmacological support.',
      });
    }

    // ── CBD (without THC) ───────────────────────────────────────────────────
    if (ctx.usesCbd && !ctx.isCannabisUser) {
      recs.push({
        category: 'avs-adjustment',
        emoji: '💚',
        title: 'CBD — Synergistic with Alpha Entrainment',
        detail: 'CBD has demonstrated anxiolytic and mild GABAergic effects that complement alpha AVS. '
          + 'If the patient takes CBD, schedule their dose 30–45 minutes before the session for maximal synergy. '
          + 'Alpha protocol (10 Hz) is ideal.',
        avsAdjust: { param: 'wave', value: 'alpha' },
      });
    }

    // ── DIABETES ────────────────────────────────────────────────────────────
    if (ctx.isDiabetic) {
      recs.push({
        category: 'timing',
        emoji: '🩸',
        title: 'Glycemic Timing — Session Scheduling',
        detail: 'HRV coherence is significantly impaired during hypoglycemia or post-meal hyperglycemia. '
          + 'Schedule AVS 90–120 minutes after a meal, not on an empty stomach. '
          + 'Confirm the patient has eaten and check for hypoglycemic symptoms before starting.',
      });
      recs.push({
        category: 'beverage',
        emoji: '🍵',
        title: 'Glycemic-Supportive Teas',
        detail: '• Cinnamon tea (Ceylon, not cassia) — enhances insulin sensitivity\n'
          + '• Berberine tea — clinically comparable to metformin for postprandial glucose\n'
          + '• Bitter melon tea — traditional hypoglycemic, use with caution if on insulin\n'
          + '• Fenugreek seed tea — slows carbohydrate absorption\n'
          + 'Avoid sweetened drinks before or during session.',
      });
      recs.push({
        category: 'caution',
        emoji: '⚠️',
        title: 'Autonomic Neuropathy Consideration',
        detail: 'Diabetic autonomic neuropathy reduces HRV amplitude and slows the response to the AVS '
          + 'breathing protocol. Lower expectations for coherence score. '
          + 'Longer sessions (30–40 min vs. 20 min) are more effective for this population.',
      });
    }

    // ── PRE-DIABETES ────────────────────────────────────────────────────────
    if (ctx.isPreDiabetic && !ctx.isDiabetic) {
      recs.push({
        category: 'beverage',
        emoji: '🍵',
        title: 'Pre-Diabetic Beverage Protocol',
        detail: '• Cinnamon tea (1 tsp Ceylon cinnamon, steeped 10 min) — reduces insulin resistance\n'
          + '• Hibiscus tea — antioxidant, mild blood pressure support\n'
          + '• Apple cider vinegar tea (1 tbsp ACV in warm water) — delays gastric emptying, '
          + 'reduces postprandial glucose spike\n'
          + 'Avoid fruit juices and high-sugar beverages within 2 hours of session.',
      });
    }

    // ── MULTIPLE SCLEROSIS & NEURO-DEMYELINATION ───────────────────────────
    if (ctx.hasNeuroCondition) {
      recs.push({
        category: 'caution',
        emoji: '❄️',
        title: 'Uhthoff Phenomenon — Thermoregulation & Chilled Hydration',
        detail: 'Core temperature rises as small as 0.5°C slow demyelinated axonal conduction, triggering transient nerve fatigue. '
          + 'Serve chilled electrolyte or iced mint tea; keep clinic ambient room temperature under 68°F (20°C). Avoid hot beverages before/during active therapy.',
      });
      recs.push({
        category: 'avs-adjustment',
        emoji: '🧠',
        title: 'Gentle Vagal Resonant Pacing (5.5 BPM)',
        detail: 'Demyelinating conditions benefit from gentle parasympathetic tone enhancement without autonomic over-exertion. '
          + 'Set breathing rate to 5.5 BPM with extended 4-1-6 ratio to avoid hyperventilation fatigue.',
        avsAdjust: { param: 'breathing_bpm', value: 5.5 },
      });
      recs.push({
        category: 'beverage',
        emoji: '🧬',
        title: 'Oligodendrocyte & Axonal Membrane Support',
        detail: '• High-Dose Vitamin D3 + K2 (5,000 IU) — crucial for immune tolerance and T-cell regulation\n'
          + '• Alpha-Lipoic Acid (600 mg) — mitochondrial antioxidant shown to reduce brain atrophy rates in progressive MS\n'
          + '• CoQ10 / Ubiquinol (200 mg) — supports electron transport chain resilience in demyelinated axons\n'
          + '• Omega-3 DHA/EPA (2,000 mg) — provides essential lipid precursors for myelin sheath maintenance.',
      });
    }

    // ── VISUAL IMPAIRMENT / BLINDNESS / OPTIC NEURITIS ──────────────────────
    if (ctx.hasVisualImpairment) {
      recs.push({
        category: 'avs-adjustment',
        emoji: '🎧',
        title: 'Audio-Primary Spatial Acoustic Protocol',
        detail: 'For patients with visual impairment or optic nerve damage, bypass photic light stimulation and rely on spatialized binaural audio entrainment. '
          + 'Activate voice dictation and high-clarity spoken feedback.',
        avsAdjust: { param: 'wave', value: 'alpha' },
      });
      recs.push({
        category: 'beverage',
        emoji: '🫐',
        title: 'Retinal & Optic Nerve Botanical Support',
        detail: '• Bilberry Extract (160 mg Anthocyanins) — enhances microvascular retinal circulation\n'
          + '• Lutein (20 mg) & Zeaxanthin (4 mg) — macula carotenoid protective shield\n'
          + '• Saffron Extract (30 mg) — clinically validated for neuroprotection of retinal ganglion cells.',
      });
    }

    // ── COGNITIVE LOAD & NEURO-DIVERGENCE (DYSLEXIA, ADHD, AUTISM, MCI, CONCUSSION) ──
    if (ctx.hasCognitiveSensitivity) {
      recs.push({
        category: 'avs-adjustment',
        emoji: '🧠',
        title: '40 Hz Gamma Cognitive Synchronization & Sensory Shield',
        detail: 'For MCI, concussion, or cognitive load sensitivities, use 40 Hz Gamma sensory stimulation (MIT protocol for amyloid clearance & microglial activation). '
          + 'Enforce Dyslexia-friendly high-legibility plain-language mode and low-stimulation acoustic brown noise.',
        avsAdjust: { param: 'wave', value: 'gamma' },
      });
      recs.push({
        category: 'beverage',
        emoji: '🍵',
        title: 'Nootropic Adaptogen & Synaptic Resilience Stack',
        detail: '• Bacopa Monnieri (300 mg) — enhances synaptic transmission and speed of recall\n'
          + '• Phosphatidylserine (200 mg) — membrane lipid that supports cognitive processing speed\n'
          + '• L-Theanine (200 mg) + Gotu Kola — promotes relaxed focus and mitigates sensory overload.',
      });
    }

    // ── UNIVERSAL WIND-DOWN ─────────────────────────────────────────────────
    // Only add if there are no other recommendations (avoids clutter for complex cases)
    if (recs.length === 0) {
      recs.push({
        category: 'beverage',
        emoji: '☕',
        title: 'General Pre-Session Beverages',
        detail: '• Chamomile tea — apigenin binds GABA-A receptors, gentle anxiolytic\n'
          + '• Lavender latte (warm milk + dried lavender) — linalool supports parasympathetic tone\n'
          + '• L-theanine green tea — promotes calm alertness, pairs well with alpha entrainment\n'
          + 'Stay hydrated with water throughout the session.',
      });
      recs.push({
        category: 'wind-down',
        emoji: '🌙',
        title: 'Post-Session Wind-Down',
        detail: 'After the session, encourage 5 minutes of quiet sitting before the patient resumes activity. '
          + 'Rooibos or chamomile tea afterward supports the parasympathetic state the session established.',
      });
    }

    return recs;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  private buildClinicianNote(ctx: ILifestyleContext): string {
    const factors: string[] = [];
    if (ctx.hasCaffeineWithinSession) factors.push('caffeine within session window');
    if (ctx.isSmoker)                 factors.push('active nicotine use');
    if (ctx.inAlcoholRecovery)        factors.push('alcohol recovery (Peniston protocol indicated)');
    else if (ctx.hasAlcohol)          factors.push('active alcohol use (alpha-only, monitor sedation)');
    if (ctx.isCannabisUser)           factors.push('THC use (reduced volume, alpha-only)');
    if (ctx.usesCbd)                  factors.push('CBD use (synergistic with alpha)');
    if (ctx.isDiabetic)               factors.push('diabetic (verify glycemic timing, neuropathy considered)');
    if (ctx.isPreDiabetic)            factors.push('pre-diabetic (glucose-supportive beverage suggestions provided)');
    if (ctx.hasNeuroCondition)        factors.push('Multiple Sclerosis / Neuro-demyelination (Uhthoff thermoregulation & oligodendrocyte support active)');
    if (ctx.hasVisualImpairment)     factors.push('Visual impairment / Low vision (Audio-primary spatial acoustic entrainment active)');
    if (ctx.hasCognitiveSensitivity)  factors.push('Cognitive sensitivity / Neuro-divergence (40 Hz Gamma entrainment & high-legibility literacy active)');

    if (factors.length === 0) return 'No substance or metabolic interactions detected. Standard protocol applies.';
    return `Lifestyle factors affecting this AVS session: ${factors.join('; ')}.`;
  }

  private buildChartText(): string {
    const s = this.state;
    return [
      s.reasonForVisit(),
      s.patientGoals(),
      s.occupation(),
      s.clinicalNotes().map(n => n.text).join('\n'),
      s.medications().map(m => `${m.name} ${m.value}`).join('\n'),
    ].join('\n').toLowerCase();
  }
}
