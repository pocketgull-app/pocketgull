import { Injectable, signal } from '@angular/core';

export interface IClinicalBionicToken {
  /** Leading punctuation, quotes, or brackets (e.g. '(', '"', '[') */
  leadingPunct: string;
  /** Core alphanumeric word token */
  coreWord: string;
  /** Fixation letters to bold/emphasize (e.g. medical prefix or leading 40-45%) */
  fixation: string;
  /** Remaining letters completed by the brain */
  suffix: string;
  /** Trailing punctuation (e.g. ')', '",', '.', ';') */
  trailingPunct: string;
  /** Complete original word including punctuation */
  fullWord: string;
  /** Clinical categorization */
  category: 'standard' | 'medical-morpheme' | 'medication-tallman' | 'vital' | 'clinical-warning';
  /** 0-based Optimal Recognition Point index within coreWord */
  orpIndex: number;
  /** The single character physically centered on the foveal crosshair */
  orpChar: string;
  /** Substring to the left of the ORP character */
  leftOfOrp: string;
  /** Substring to the right of the ORP character */
  rightOfOrp: string;
  /** Full Tall Man formatted string if medication */
  tallManWord?: string;
  /** Pacing multiplier for RSVP engine (1.5x for punctuation, 1.0x standard) */
  holdMultiplier: number;
}

@Injectable({
  providedIn: 'root'
})
export class BionicReadingService {
  /** Global toggle signal for Bionic Reading Mode across Research Frame and Care Plans. */
  readonly isBionicReadingEnabled = signal<boolean>(false);

  /** Notification signal for assistive screen readers when mode changes. */
  readonly accessibilityNotice = signal<string>('');

  /** Active RSVP speed in Words Per Minute (300 to 900 WPM). Default: 600 WPM. */
  readonly rsvpSpeedWpm = signal<number>(600);

  /** Curated medical prefix/morpheme dictionary anchored for clinical speed reading */
  public static readonly MEDICAL_PREFIXES: string[] = [
    'hypercholestero', 'gastroenterolo', 'ophthalmolo', 'pharmacogeno',
    'atherosclero', 'electrocardio', 'cerebrovascu', 'encephalo',
    'brady', 'tachy', 'hyper', 'hypo', 'chole', 'osteo', 'nephro',
    'cardio', 'neuro', 'dermato', 'gastro', 'pneumo', 'pulmono',
    'hemo', 'myo', 'arthro', 'angio', 'immuno', 'carcino', 'pharma',
    'thrombo', 'endo', 'peri', 'meso', 'sub', 'inter', 'intra'
  ];

  /** FDA / ISMP Tall Man Look-Alike / Sound-Alike (LASA) Medication Dictionary */
  public static readonly ISMP_TALL_MAN_MAP: Record<string, string> = {
    'hydroxyzine': 'hydrOXYzine',
    'hydralazine': 'hydraLAZine',
    'prednisone': 'predniSONE',
    'prednisolone': 'prednisoLONE',
    'bupropion': 'buPROPion',
    'buspirone': 'busPIRone',
    'clomiphene': 'clomiPHENE',
    'clomipramine': 'clomiPRAMINE',
    'cyclosporine': 'cycloSPORINE',
    'cycloserine': 'cycloSERINE',
    'diazepam': 'diaZEPAM',
    'diltiazem': 'diltiaZEM',
    'doxorubicin': 'DOXOrubicin',
    'daunorubicin': 'DAUNOrubicin',
    'fluoxetine': 'FLUoxetine',
    'duloxetine': 'DULoxetine',
    'glipizide': 'glipiZIDE',
    'glyburide': 'glyBURIDE',
    'metformin': 'metFORMIN',
    'metronidazole': 'metroNIDAZOLE',
    'vinblastine': 'vinBLAStine',
    'vincristine': 'vinCRIStine',
    'alprazolam': 'alPRAZolam',
    'lorazepam': 'lorAZEpam',
    'clonazepam': 'cloNAZEpam'
  };

  constructor() {
    this.initKeyboardShortcutListener();
  }

  /**
   * Initializes global keyboard shortcut (Alt + B / Option + B) for rapid accessibility toggle.
   */
  private initKeyboardShortcutListener(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      // Check for Alt+B or Option+B without active input/textarea focus
      if (event.altKey && (event.key === 'b' || event.key === 'B')) {
        const target = event.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        event.preventDefault();
        this.toggleBionicReading();
      }
    });
  }

  /**
   * Toggles Bionic Reading Mode globally.
   */
  toggleBionicReading(): void {
    const nextState = !this.isBionicReadingEnabled();
    this.isBionicReadingEnabled.set(nextState);
    this.accessibilityNotice.set(`Bionic Reading mode ${nextState ? 'enabled (morpheme fixation active)' : 'disabled'}`);
  }

  /**
   * Sets Bionic Reading Mode state explicitly.
   */
  setBionicReading(enabled: boolean): void {
    this.isBionicReadingEnabled.set(enabled);
    this.accessibilityNotice.set(`Bionic Reading mode ${enabled ? 'enabled (morpheme fixation active)' : 'disabled'}`);
  }

  /**
   * Computes the Optimal Recognition Point (ORP) index for a word of length L.
   * Empirical formula:
   *  L <= 1 -> 0
   *  2 <= L <= 5 -> 1
   *  6 <= L <= 9 -> 2
   *  10 <= L <= 13 -> 3
   *  L >= 14 -> 4
   */
  public static calculateOrpIndex(length: number): number {
    if (length <= 1) return 0;
    if (length <= 5) return 1;
    if (length <= 9) return 2;
    if (length <= 13) return 3;
    return 4;
  }

  /**
   * Parses a single word token into a structured IClinicalBionicToken,
   * detecting ISMP Tall Man drug names, medical morphemes/prefixes,
   * and calculating center-foveal ORP offsets.
   */
  parseClinicalToken(token: string): IClinicalBionicToken {
    if (!token) {
      return {
        leadingPunct: '',
        coreWord: '',
        fixation: '',
        suffix: '',
        trailingPunct: '',
        fullWord: '',
        category: 'standard',
        orpIndex: 0,
        orpChar: '',
        leftOfOrp: '',
        rightOfOrp: '',
        holdMultiplier: 1.0
      };
    }

    // Extract leading punctuation, core word (with internal hyphens/slashes/periods), and trailing punctuation
    const match = token.match(/^([^\w]*)([a-zA-Z0-9]+(?:[-./][a-zA-Z0-9]+)*)([^\w]*)$/);
    if (!match) {
      const orp = BionicReadingService.calculateOrpIndex(token.length);
      return {
        leadingPunct: '',
        coreWord: token,
        fixation: token,
        suffix: '',
        trailingPunct: '',
        fullWord: token,
        category: 'standard',
        orpIndex: orp,
        orpChar: token.charAt(orp),
        leftOfOrp: token.slice(0, orp),
        rightOfOrp: token.slice(orp + 1),
        holdMultiplier: 1.0
      };
    }

    const [, leadingPunct, coreWord, trailingPunct] = match;
    const lowerCore = coreWord.toLowerCase();
    const len = coreWord.length;

    // Determine sentence-boundary pacing multiplier
    const hasSentencePunct = /[.!?;:]/.test(trailingPunct);
    const hasCommaPunct = /[,]/.test(trailingPunct);
    const holdMultiplier = hasSentencePunct ? 1.6 : hasCommaPunct ? 1.25 : 1.0;

    // Check ISMP Tall Man look-alike / sound-alike match
    if (BionicReadingService.ISMP_TALL_MAN_MAP[lowerCore]) {
      const tallMan = BionicReadingService.ISMP_TALL_MAN_MAP[lowerCore];
      const orp = BionicReadingService.calculateOrpIndex(len);
      // High-risk LASA medication safety deceleration: enforce 2.5x dwell time (~250-280 WPM)
      const ismpHoldMultiplier = Math.round(holdMultiplier * 2.5 * 10) / 10;
      return {
        leadingPunct,
        coreWord,
        fixation: tallMan,
        suffix: '',
        trailingPunct,
        fullWord: token,
        category: 'medication-tallman',
        tallManWord: tallMan,
        orpIndex: orp,
        orpChar: tallMan.charAt(orp),
        leftOfOrp: tallMan.slice(0, orp),
        rightOfOrp: tallMan.slice(orp + 1),
        holdMultiplier: ismpHoldMultiplier
      };
    }

    // Check critical clinical safety red-flags
    const isClinicalSafetyWarning = /^(allergy|allergic|contraindicated|anaphylaxis|blackbox|fatal|toxicity|overdose|warning)$/i.test(lowerCore);
    if (isClinicalSafetyWarning) {
      const orp = BionicReadingService.calculateOrpIndex(len);
      const fixLen = Math.max(1, Math.ceil(len * 0.45));
      return {
        leadingPunct,
        coreWord,
        fixation: coreWord.slice(0, fixLen),
        suffix: coreWord.slice(fixLen),
        trailingPunct,
        fullWord: token,
        category: 'clinical-warning',
        orpIndex: orp,
        orpChar: coreWord.charAt(orp),
        leftOfOrp: coreWord.slice(0, orp),
        rightOfOrp: coreWord.slice(orp + 1),
        holdMultiplier: Math.round(holdMultiplier * 2.0 * 10) / 10
      };
    }

    // Check medical prefix/morpheme dictionary
    const matchedPrefix = BionicReadingService.MEDICAL_PREFIXES.find(p => lowerCore.startsWith(p));
    if (matchedPrefix && len > matchedPrefix.length) {
      const fixLen = matchedPrefix.length;
      const fixation = coreWord.slice(0, fixLen);
      const suffix = coreWord.slice(fixLen);
      const orp = BionicReadingService.calculateOrpIndex(len);

      return {
        leadingPunct,
        coreWord,
        fixation,
        suffix,
        trailingPunct,
        fullWord: token,
        category: 'medical-morpheme',
        orpIndex: orp,
        orpChar: coreWord.charAt(orp),
        leftOfOrp: coreWord.slice(0, orp),
        rightOfOrp: coreWord.slice(orp + 1),
        holdMultiplier
      };
    }

    // Check vitals / numeric values (e.g. 120/80, 72bpm, 98%)
    const isVital = /^\d+(\.\d+)?(bpm|%|mmHg|mg|mcg|ml)?$/i.test(coreWord);

    // Standard Bionic character bolding (40-45% of word)
    let fixLen = Math.max(1, Math.ceil(len * 0.45));
    if (len <= 1) fixLen = 1;
    if (len === 2 || len === 3) fixLen = 1;

    const fixation = coreWord.slice(0, fixLen);
    const suffix = coreWord.slice(fixLen);
    const orp = BionicReadingService.calculateOrpIndex(len);

    return {
      leadingPunct,
      coreWord,
      fixation,
      suffix,
      trailingPunct,
      fullWord: token,
      category: isVital ? 'vital' : 'standard',
      orpIndex: orp,
      orpChar: coreWord.charAt(orp),
      leftOfOrp: coreWord.slice(0, orp),
      rightOfOrp: coreWord.slice(orp + 1),
      holdMultiplier
    };
  }

  /**
   * Tokenizes arbitrary clinical text into structured IClinicalBionicToken streams
   * ready for Rapid Serial Visual Presentation (RSVP) teleprompter.
   */
  tokenizeForRsvp(text: string): IClinicalBionicToken[] {
    if (!text) return [];
    const words = text.trim().split(/\s+/);
    return words.map(w => this.parseClinicalToken(w));
  }

  /**
   * Converts plain text string or HTML content into Morpheme-Aware Bionic Reading HTML.
   * Accurately extracts leading/trailing non-word punctuation while anchoring on:
   * 1. ISMP Tall Man drug names (e.g. hydrOXYzine)
   * 2. Medical prefixes (e.g. brady-cardia, tachy-pnea, chole-cystitis)
   * 3. Standard 40-45% character fixation
   *
   * @param text Plain text or HTML string to format
   * @param highlightClass Optional custom Tailwind CSS class for bolded prefix letters
   */
  formatToBionicHtml(text: string, highlightClass?: string): string {
    if (!text) return '';

    // Match HTML tags (to preserve markup), HTML entities, or whitespace-delimited tokens
    return text.replace(/<[^>]+>|&[a-zA-Z0-9#]+;|([^\s<>]+)/g, (match) => {
      // Preserve HTML tags and HTML entities untouched
      if ((match.startsWith('<') && match.endsWith('>')) || (match.startsWith('&') && match.endsWith(';'))) {
        return match;
      }

      // Format individual word token
      return match.replace(/[a-zA-Z0-9]+/g, (letters) => {
        if (letters.length <= 1) {
          return highlightClass 
            ? `<strong class="${highlightClass}">${letters}</strong>`
            : `<b>${letters}</b>`;
        }

        const lower = letters.toLowerCase();

        // 1. ISMP Tall Man formatting
        if (BionicReadingService.ISMP_TALL_MAN_MAP[lower]) {
          const tallMan = BionicReadingService.ISMP_TALL_MAN_MAP[lower];
          // Wrap the upper-case Tall Man letters in bold/highlight
          const formatted = tallMan.replace(/[A-Z]+/g, (caps) => {
            return highlightClass
              ? `<strong class="${highlightClass} underline decoration-amber-500/80">${caps}</strong>`
              : `<b class="text-amber-600 dark:text-amber-400 underline decoration-amber-500/80">${caps}</b>`;
          });
          return formatted;
        }

        // 2. Medical Prefix / Morpheme matching
        const matchedPrefix = BionicReadingService.MEDICAL_PREFIXES.find(p => lower.startsWith(p));
        let boldLen: number;
        if (matchedPrefix && letters.length > matchedPrefix.length) {
          boldLen = matchedPrefix.length;
        } else {
          boldLen = Math.max(1, Math.ceil(letters.length * 0.45));
        }

        const boldPart = letters.slice(0, boldLen);
        const restPart = letters.slice(boldLen);

        return highlightClass
          ? `<strong class="${highlightClass}">${boldPart}</strong>${restPart}`
          : `<b>${boldPart}</b>${restPart}`;
      });
    });
  }
}
