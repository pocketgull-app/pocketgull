import { Injectable, signal, computed, PLATFORM_ID, inject, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * KSS (Karolinska Sleepiness Scale) score — 9-point validated scale.
 * 1 = Extremely alert, 9 = Extremely sleepy / fighting sleep.
 * Åkerstedt & Gillberg (1990).
 */
export type KssScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface IKssDescriptor {
  score: KssScore;
  label: string;
  detail: string;
  emoji: string;
}

/**
 * PASS (Pennsylvania Sleepiness Scale / Penn PVT Index) — 7-tier psychomotor vigilance scale.
 * Developed by Dr. David F. Dinges et al., University of Pennsylvania Division of Sleep & Chronobiology.
 * 1 = Peak Vigilance (RT < 200ms), 7 = Critical Microsleep Phase (Lapses > 3000ms).
 */
export type PassScore = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface IPassDescriptor {
  score: PassScore;
  label: string;
  pvtLapseRisk: string;
  detail: string;
  emoji: string;
}

/** Circadian phase based on clock time. */
export type CircadianPhase =
  | 'early-morning'    // 05:00–08:00 — alertness building, cortisol surge
  | 'morning-peak'     // 08:00–12:00 — peak cognitive performance window
  | 'post-lunch-dip'   // 12:00–15:00 — post-prandial adenosine peak, highest risk
  | 'afternoon-rally'  // 15:00–18:00 — second cognitive wind, motor peak
  | 'evening-wind-down'// 18:00–21:00 — melatonin onset, slowing
  | 'night'            // 21:00–05:00 — significant impairment, not for clinical work
  | 'graveyard';       // 00:00–05:00 — maximum impairment

export interface ICircadianContext {
  phase:         CircadianPhase;
  hour:          number;
  phaseLabel:    string;
  phaseEmoji:    string;
  expectedKss:   number;         // Normative KSS for this time from literature
  cognitiveLoad: 'optimal' | 'good' | 'moderate' | 'reduced' | 'impaired';
  recommendation: string;
  avsWave:       'beta' | 'alpha' | 'theta' | 'delta'; // Ideal entrainment for reset
  avsBpm:        number;
  colorHsl:      string;         // For ambient gradient tinting
  colorHslData:  { h: number; s: number; l: number }; // For CSS variable interpolation
}

export interface IReadinessProfile {
  clinicianKss:   KssScore;
  patientKss:     KssScore | null;  // null if not yet assessed
  circadian:      ICircadianContext;
  combinedAlert:  'clear' | 'caution' | 'high-risk';
  recommendation: string;
  avsReset:       { wave: string; bpm: number; durationMin: number; rationale: string; } | null;
}

/**
 * CircadianSleepinessService
 *
 * Provides:
 *  1. KSS scale definitions (validated 9-point)
 *  2. Time-of-day circadian context (phase, cognitive load, expected KSS)
 *  3. Combined readiness profile for clinician + patient
 *  4. AVS reset protocol recommendations based on time + KSS state
 *
 * Literature:
 *  - Åkerstedt & Gillberg (1990) — KSS development and validation
 *  - Monk et al. (1997) — circadian performance rhythms
 *  - Lim & Dinges (2010) — adenosine and sleepiness
 *  - Cajochen et al. (2003) — circadian phase and cognitive performance
 */
@Injectable({ providedIn: 'root' })
export class CircadianSleepinessService {

  // ── KSS Definitions (verbatim from validated instrument) ───────────────────
  readonly KSS_ITEMS: IKssDescriptor[] = [
    { score: 1, emoji: '⚡', label: 'Extremely Alert',        detail: 'Feeling fully awake and sharp. Peak readiness.' },
    { score: 2, emoji: '✨', label: 'Very Alert',             detail: 'High energy, no drowsiness.' },
    { score: 3, emoji: '🟢', label: 'Alert',                  detail: 'Normal, rested state.' },
    { score: 4, emoji: '🟡', label: 'Rather Alert',           detail: 'Mild variability, mostly focused.' },
    { score: 5, emoji: '😐', label: 'Neither Alert nor Sleepy', detail: 'Neutral state — manageable.' },
    { score: 6, emoji: '🟠', label: 'Some Signs of Sleepiness', detail: 'Noticeable effort needed to stay focused.' },
    { score: 7, emoji: '🔴', label: 'Sleepy, No Effort to Stay Awake', detail: 'Significant impairment — errors more likely.' },
    { score: 8, emoji: '🚨', label: 'Sleepy, Some Effort to Stay Awake', detail: 'High impairment risk. Clinical tasks affected.' },
    { score: 9, emoji: '💤', label: 'Very Sleepy / Fighting Sleep', detail: 'Severe impairment. Not safe for complex clinical decisions.' },
  ];

  // ── PASS Definitions (University of Pennsylvania School of Medicine PVT Instrument) ──
  readonly PASS_ITEMS: IPassDescriptor[] = [
    { score: 1, emoji: '⚡', label: 'PASS 1 — Peak Vigilance', pvtLapseRisk: 'RT < 200ms | 0 Lapses', detail: 'Optimal psychomotor speed. Peak clinical decision capacity.' },
    { score: 2, emoji: '✨', label: 'PASS 2 — Optimal Readiness', pvtLapseRisk: 'RT 200–240ms | < 1 Lapse', detail: 'Sustained focus, minimal fatigue onset.' },
    { score: 3, emoji: '🟢', label: 'PASS 3 — Moderate Focus', pvtLapseRisk: 'RT 240–280ms | 1–2 Lapses', detail: 'Slight reaction slowing. Normal shift operational state.' },
    { score: 4, emoji: '🟡', label: 'PASS 4 — Mild Impairment', pvtLapseRisk: 'RT 280–350ms | 2–3 Lapses', detail: 'Sub-second microsleep vulnerability detected. Caution advised.' },
    { score: 5, emoji: '🟠', label: 'PASS 5 — Significant Fatigue', pvtLapseRisk: 'RT 350–500ms | 3–5 Lapses', detail: 'Noticeable vigilance lapses. Auto-acronym expansion & enlarged hitboxes active.' },
    { score: 6, emoji: '🔴', label: 'PASS 6 — Severe Impairment', pvtLapseRisk: 'RT > 500ms | 6+ Lapses', detail: 'High error probability. Enforce dual-clinician confirmation on high-risk orders.' },
    { score: 7, emoji: '💤', label: 'PASS 7 — Critical Microsleep', pvtLapseRisk: 'Lapses > 3000ms', detail: 'Severe psychomotor deficit. Mandatory 10-minute AVS theta reset required.' }
  ];

  // ── Reactive state ─────────────────────────────────────────────────────────
  readonly activeScaleMode = signal<'karolinska' | 'pennsylvania'>('karolinska');
  readonly clinicianKss = signal<KssScore | null>(null);
  readonly clinicianPass = signal<PassScore | null>(null);
  readonly patientKss   = signal<KssScore | null>(null);
  readonly dismissed    = signal<boolean>(false);
  readonly now          = signal<Date>(new Date());

  readonly circadian = computed<ICircadianContext>(() => this.getCircadianContext(this.now()));

  readonly readiness = computed<IReadinessProfile | null>(() => {
    const ck = this.clinicianKss();
    if (ck === null) return null;
    return this.buildReadinessProfile(ck, this.patientKss(), this.circadian());
  });

  /**
   * Maps the current KSS score to a CSS tier string for `data-kss-tier`.
   * KSS 1–3 → optimal, 4–5 → neutral, 6–7 → caution, 8–9 → alert.
   */
  readonly kssTheme = computed<'optimal' | 'neutral' | 'caution' | 'alert' | null>(() => {
    const s = this.clinicianKss();
    if (s === null) return null;
    if (s <= 3) return 'optimal';
    if (s <= 5) return 'neutral';
    if (s <= 7) return 'caution';
    return 'alert';
  });

  private platformId = inject(PLATFORM_ID);

  constructor() {
    // Continuously update the current time every minute
    if (isPlatformBrowser(this.platformId)) {
      setInterval(() => {
        this.now.set(new Date());
      }, 60000);
    }

    // Apply the KSS tier to <body>, manage the ambient halo, and continuously
    // update the global circadian CSS variables so the theme smoothly follows the sun.
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const tier = this.kssTheme();
      const circ = this.circadian();

      // Always apply the continuous circadian time-of-day theme to the root
      document.documentElement.style.setProperty('--circadian-h', circ.colorHslData.h.toString());
      document.documentElement.style.setProperty('--circadian-s', `${circ.colorHslData.s}%`);
      document.documentElement.style.setProperty('--circadian-l', `${circ.colorHslData.l}%`);
      document.documentElement.style.setProperty('--circadian-a', '0.04');

      if (tier) {
        document.body.setAttribute('data-kss-tier', tier);
        this.ensureHalo();
      } else {
        document.body.removeAttribute('data-kss-tier');
        // Let the default circadian ambient halo breathe slowly
        this.ensureHalo(); 
      }
    });
  }

  private ensureHalo(): void {
    if (document.getElementById('kss-ambient-halo')) return;
    const halo = document.createElement('div');
    halo.id = 'kss-ambient-halo';
    document.body.insertAdjacentElement('afterbegin', halo);
  }


  getCircadianContext(now: Date): ICircadianContext {
    const h = now.getHours() + now.getMinutes() / 60;

    if (h >= 5 && h < 8) return {
      phase: 'early-morning', hour: Math.floor(h),
      phaseLabel: 'Early Morning — Cortisol Surge',
      phaseEmoji: '🌅',
      expectedKss: 4,
      cognitiveLoad: 'good',
      recommendation: 'Cortisol is peaking — good alerting window, but emotional regulation lags. '
        + 'Beta entrainment can sharpen focus. Hydrate before seeing first patient.',
      avsWave: 'beta', avsBpm: 6.0,
      colorHsl: 'hsl(30, 80%, 55%)',
      colorHslData: { h: 30, s: 80, l: 55 },
    };

    if (h >= 8 && h < 12) return {
      phase: 'morning-peak', hour: Math.floor(h),
      phaseLabel: 'Morning Peak — Optimal Window',
      phaseEmoji: '☀️',
      expectedKss: 2,
      cognitiveLoad: 'optimal',
      recommendation: 'Peak cognitive performance window. Schedule complex diagnoses, difficult conversations, '
        + 'and procedures here. Alpha entrainment maintains coherence without sedation.',
      avsWave: 'alpha', avsBpm: 5.5,
      colorHsl: 'hsl(45, 90%, 60%)',
      colorHslData: { h: 45, s: 90, l: 60 },
    };

    if (h >= 12 && h < 15) return {
      phase: 'post-lunch-dip', hour: Math.floor(h),
      phaseLabel: 'Post-Lunch Dip — Adenosine Peak',
      phaseEmoji: '😴',
      expectedKss: 6,
      cognitiveLoad: 'reduced',
      recommendation: 'Post-prandial adenosine surge causes the highest sleepiness of the day — even without lunch. '
        + 'A 10–20 minute beta AVS reset significantly reduces medical error risk in this window.',
      avsWave: 'beta', avsBpm: 6.5,
      colorHsl: 'hsl(210, 70%, 50%)',
      colorHslData: { h: 210, s: 70, l: 50 },
    };

    if (h >= 15 && h < 18) return {
      phase: 'afternoon-rally', hour: Math.floor(h),
      phaseLabel: 'Afternoon Rally — Motor Peak',
      phaseEmoji: '🌤️',
      expectedKss: 4,
      cognitiveLoad: 'good',
      recommendation: 'Second cognitive peak — good for procedural tasks and chart reviews. '
        + 'Melatonin has not yet risen. Alpha maintains calm focus.',
      avsWave: 'alpha', avsBpm: 5.5,
      colorHsl: 'hsl(270, 60%, 55%)',
      colorHslData: { h: 270, s: 60, l: 55 },
    };

    if (h >= 18 && h < 21) return {
      phase: 'evening-wind-down', hour: Math.floor(h),
      phaseLabel: 'Evening Wind-Down — Melatonin Onset',
      phaseEmoji: '🌆',
      expectedKss: 5,
      cognitiveLoad: 'moderate',
      recommendation: 'Melatonin is rising. Cognitive flexibility decreasing. '
        + 'Theta entrainment supports a natural wind-down. Avoid scheduling high-complexity cases.',
      avsWave: 'theta', avsBpm: 5.0,
      colorHsl: 'hsl(320, 60%, 45%)',
      colorHslData: { h: 320, s: 60, l: 45 },
    };

    if (h >= 21 || h < 0) return {
      phase: 'night', hour: Math.floor(h),
      phaseLabel: 'Night Shift — Impairment Risk',
      phaseEmoji: '🌙',
      expectedKss: 7,
      cognitiveLoad: 'impaired',
      recommendation: 'Circadian misalignment with social sleep pressure. Error rate comparable to 0.05% BAC. '
        + 'Beta AVS reset every 2 hours is strongly recommended. Caffeine + 10-min AVS nap more effective than caffeine alone.',
      avsWave: 'beta', avsBpm: 7.0,
      colorHsl: 'hsl(240, 50%, 30%)',
      colorHslData: { h: 240, s: 50, l: 30 },
    };

    return { // graveyard
      phase: 'graveyard', hour: Math.floor(h),
      phaseLabel: 'Graveyard Hours — Maximum Impairment',
      phaseEmoji: '🌑',
      expectedKss: 9,
      cognitiveLoad: 'impaired',
      recommendation: 'Maximum circadian impairment window (2–4 AM nadir). '
        + 'Cognitive performance equivalent to 24h total sleep deprivation. '
        + 'Strategic beta AVS reset is critical. Consider peer-check for all clinical decisions.',
      avsWave: 'beta', avsBpm: 7.5,
      colorHsl: 'hsl(240, 40%, 20%)',
      colorHslData: { h: 240, s: 40, l: 20 },
    };
  }

  kssDescriptor(score: KssScore): IKssDescriptor {
    return this.KSS_ITEMS[score - 1]!;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private buildReadinessProfile(
    ck: KssScore,
    pk: KssScore | null,
    circ: ICircadianContext,
  ): IReadinessProfile {
    // Combined risk: clinician KSS + circadian phase modifier
    const effectiveKss = Math.min(9, ck + (circ.cognitiveLoad === 'impaired' ? 2 : circ.cognitiveLoad === 'reduced' ? 1 : 0));
    const patientHigh  = pk !== null && pk >= 7;

    let combinedAlert: IReadinessProfile['combinedAlert'] = 'clear';
    if (effectiveKss >= 8 || (ck >= 7 && circ.cognitiveLoad === 'impaired')) combinedAlert = 'high-risk';
    else if (effectiveKss >= 6 || patientHigh) combinedAlert = 'caution';

    const rec = this.buildRecommendation(ck, pk, circ, combinedAlert);
    const avsReset = this.buildAvsReset(ck, circ, combinedAlert);

    return { clinicianKss: ck, patientKss: pk, circadian: circ, combinedAlert, recommendation: rec, avsReset };
  }

  private buildRecommendation(ck: KssScore, pk: KssScore | null, circ: ICircadianContext, alert: string): string {
    if (alert === 'high-risk') {
      return `⚠️ KSS ${ck} + ${circ.phaseLabel}: High impairment risk. `
        + `A ${circ.avsWave.toUpperCase()} AVS reset before your first patient is strongly recommended. `
        + `Peer-check complex decisions. Avoid unsupported procedural work.`;
    }
    if (alert === 'caution') {
      return `KSS ${ck} during ${circ.phaseLabel}. Mild-moderate impairment. `
        + `${circ.recommendation} `
        + (pk && pk >= 6 ? `Patient also reports elevated sleepiness (KSS ${pk}) — adjust communication pace and check comprehension.` : '');
    }
    return `KSS ${ck} — ${this.kssDescriptor(ck).label}. ${circ.phaseLabel}. ${circ.recommendation}`;
  }

  private buildAvsReset(ck: KssScore, circ: ICircadianContext, alert: string): IReadinessProfile['avsReset'] | null {
    if (ck <= 3 && alert === 'clear') return null; // No reset needed

    const wave = circ.avsWave;
    const bpm  = circ.avsBpm;
    const dur  = ck >= 7 ? 15 : ck >= 5 ? 10 : 5;

    const rationale: Record<string, string> = {
      beta:  `Beta (18 Hz) binaural entrainment promotes cortical arousal and counters adenosine-mediated sleepiness. `
           + `Most effective during the ${circ.phaseLabel} window.`,
      alpha: `Alpha (10 Hz) entrainment sustains calm focus without sedation — ideal for peak and rally windows.`,
      theta: `Theta (6 Hz) supports natural wind-down alignment with circadian melatonin onset.`,
      delta: `Delta entrainment is not indicated for clinical reset scenarios.`,
    };

    return { wave, bpm, durationMin: dur, rationale: rationale[wave] ?? '' };
  }
}
