import { Injectable, signal } from '@angular/core';

export type DsmCategory = 
  | 'ADDICTION_MEDICINE' 
  | 'SUICIDOLOGY' 
  | 'PSYCHIATRY' 
  | 'ADHERENCE' 
  | 'TOXICOLOGY'
  | 'EMERGENCY_TRIAGE';

export type DsmSeverity = 'RECOMMENDED_SHIFT' | 'STIGMA_ALERT' | 'HIGH_PRIORITY';

export interface IDsmLanguageRule {
  id: string;
  version: string;
  deprecatedPattern: RegExp;
  preferredTerm: string;
  category: DsmCategory;
  standardSource: 'DSM-5-TR' | 'ASAM_4TH_ED' | 'NIDA_WORDS_MATTER' | 'NIMH_CDC' | 'INSTITUTIONAL';
  citation: string;
  educationalRationale: string;
  sampleBefore: string;
  sampleAfter: string;
  severity: DsmSeverity;
  active: boolean;
}

export interface ILanguageSuggestion {
  ruleId: string;
  matchedText: string;
  preferredTerm: string;
  index: number;
  length: number;
  category: DsmCategory;
  standardSource: string;
  citation: string;
  educationalRationale: string;
  severity: DsmSeverity;
  sampleBefore: string;
  sampleAfter: string;
}

export interface ILanguageAuditResult {
  hasSuggestions: boolean;
  totalFlags: number;
  suggestions: ILanguageSuggestion[];
  harmonizedText: string;
  protectedQuoteCount: number;
}

export interface ISerializedDsmRule {
  id: string;
  version: string;
  patternString: string;
  patternFlags: string;
  preferredTerm: string;
  category: DsmCategory;
  standardSource: 'DSM-5-TR' | 'ASAM_4TH_ED' | 'NIDA_WORDS_MATTER' | 'NIMH_CDC' | 'INSTITUTIONAL';
  citation: string;
  educationalRationale: string;
  sampleBefore: string;
  sampleAfter: string;
  severity: DsmSeverity;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DsmLanguageCorrectionService {
  /**
   * Active registered rules count signal for reactive subscribers
   */
  readonly rulesCount = signal<number>(0);

  /**
   * Internal rule registry keyed by rule ID
   */
  private readonly rules = new Map<string, IDsmLanguageRule>();

  constructor() {
    this.registerCoreRules();
  }

  /**
   * Pre-populates the core DSM-5-TR, ASAM Criteria (4th Edition), and NIDA Words Matter rules.
   */
  private registerCoreRules(): void {
    const coreRules: IDsmLanguageRule[] = [
      {
        id: 'asam-medically-managed-withdrawal',
        version: '1.0.0',
        deprecatedPattern: /\b(detox center|detox unit|detoxification|detox)\b/gi,
        preferredTerm: 'medically-managed withdrawal',
        category: 'ADDICTION_MEDICINE',
        standardSource: 'ASAM_4TH_ED',
        citation: 'ASAM Criteria 4th Edition (2024), Dimension 1; DSM-5-TR p. 543',
        educationalRationale: '"Detox" implies an archaic commercial cleanse or a passive "flushing of toxins", and falsely suggests that acute stabilization completes treatment. Medically-Managed Withdrawal accurately denotes acute neurobiological stabilization of severe physiological withdrawal within a continuous chronic disease care plan.',
        sampleBefore: 'Patient was admitted to detox for 5 days.',
        sampleAfter: 'Patient was admitted for medically-managed withdrawal for 5 days.',
        severity: 'HIGH_PRIORITY',
        active: true
      },
      {
        id: 'nida-toxicology-screen-results',
        version: '1.0.0',
        deprecatedPattern: /\b(dirty\s+(?:urine|tox|screen|sample|uds)|clean\s+(?:urine|tox|screen|sample|uds))\b/gi,
        preferredTerm: 'toxicology screen (positive / negative for non-prescribed substances)',
        category: 'TOXICOLOGY',
        standardSource: 'NIDA_WORDS_MATTER',
        citation: 'NIDA "Words Matter" Terms to Use and Avoid (2021); ASAM Drug Testing Guidelines',
        educationalRationale: 'Labeling bodily fluids as "clean" or "dirty" conveys moral judgment, positioning the patient as contaminated or untrustworthy. Objective laboratory nomenclature requires reporting results as "positive/negative for non-prescribed substances" or "expected/unexpected results".',
        sampleBefore: 'Urine tox was dirty for cannabinoids.',
        sampleAfter: 'Toxicology screen was positive for non-prescribed cannabinoids.',
        severity: 'STIGMA_ALERT',
        active: true
      },
      {
        id: 'dsm-person-first-sud',
        version: '1.0.0',
        deprecatedPattern: /\b(substance abuser|drug abuser|alcoholic|addict)\b/gi,
        preferredTerm: 'person with a substance use disorder',
        category: 'ADDICTION_MEDICINE',
        standardSource: 'DSM-5-TR',
        citation: 'DSM-5-TR § Substance-Related Disorders; Kelly & Westerhoff (2010)',
        educationalRationale: 'Person-first language separates the individual human from their medical condition. Landmark research by Kelly & Westerhoff (2010) demonstrated that clinicians exposed to "abuser" vs "person with a substance use disorder" exhibit significant negative diagnostic bias and are 3x more likely to recommend punitive measures over medical treatment.',
        sampleBefore: 'Patient is a known alcoholic and heroin addict.',
        sampleAfter: 'Patient is diagnosed with severe alcohol use disorder and opioid use disorder.',
        severity: 'STIGMA_ALERT',
        active: true
      },
      {
        id: 'suicidology-died-by-suicide',
        version: '1.0.0',
        deprecatedPattern: /\b(committed suicide|commit suicide|commits suicide)\b/gi,
        preferredTerm: 'died by suicide',
        category: 'SUICIDOLOGY',
        standardSource: 'NIMH_CDC',
        citation: 'NIMH Suicidology Guidelines; AFSP Ethical Reporting Standards',
        educationalRationale: 'The verb "commit" historically associates suicidal death with crimes ("committed a felony") or moral sins dating to English common law. Suicidology recognizes suicidal crises as acute, lethal manifestations of severe psychiatric distress and neurobiological vulnerability, not criminal conduct.',
        sampleBefore: 'Family member committed suicide two years ago.',
        sampleAfter: 'Family member died by suicide two years ago.',
        severity: 'HIGH_PRIORITY',
        active: true
      },
      {
        id: 'ama-barriers-to-adherence',
        version: '1.0.0',
        deprecatedPattern: /\b(non-compliant|noncompliant|refused to comply|failed to comply)\b/gi,
        preferredTerm: 'experiencing barriers to treatment plan',
        category: 'ADHERENCE',
        standardSource: 'INSTITUTIONAL',
        citation: 'AMA Patient-Centered Care Ethics; AAFP Collaborative Communication Standard',
        educationalRationale: '"Non-compliance" positions the clinician as an authoritarian commander and the patient as a disobedient subordinate. Framing challenges as "barriers to treatment" fosters inquiry into financial toxicity, transportation deficits, pharmacy deserts, or medication adverse effects.',
        sampleBefore: 'Patient is non-compliant with hypertensive medications.',
        sampleAfter: 'Patient is navigating barriers to taking hypertensive medications.',
        severity: 'RECOMMENDED_SHIFT',
        active: true
      },
      {
        id: 'asam-symptom-recurrence',
        version: '1.0.0',
        deprecatedPattern: /\b(relapsed|fell off the wagon)\b/gi,
        preferredTerm: 'recurrence of symptoms / return to use',
        category: 'ADDICTION_MEDICINE',
        standardSource: 'ASAM_4TH_ED',
        citation: 'ASAM Criteria 4th Edition (2024); NIDA Principles of Drug Addiction Treatment',
        educationalRationale: '"Relapse" carries fatalistic moral judgment implying complete personal failure. Framing as "recurrence of symptoms" or "return to use" aligns substance use disorder with other chronic relapsing-remitting diseases like asthma, hypertension, or type 1 diabetes.',
        sampleBefore: 'Patient relapsed after three months of sobriety.',
        sampleAfter: 'Patient experienced a return to use after three months in recovery.',
        severity: 'RECOMMENDED_SHIFT',
        active: true
      },
      {
        id: 'asam-moud-pharmacotherapy',
        version: '1.0.0',
        deprecatedPattern: /\b(medication-assisted treatment|medication assisted treatment|\bMAT\b)\b/gi,
        preferredTerm: 'MOUD (Medications for Opioid Use Disorder) / Pharmacotherapy',
        category: 'ADDICTION_MEDICINE',
        standardSource: 'ASAM_4TH_ED',
        citation: 'SAMHSA Terminology Advisory (2021); ASAM Clinical Guidelines on MOUD',
        educationalRationale: 'The term "Medication-Assisted Treatment" implies that evidence-based pharmacotherapy (buprenorphine, methadone, naltrexone) is merely an auxiliary crutch rather than the primary life-saving medical treatment. We do not say "Medication-Assisted Diabetes Therapy" for insulin.',
        sampleBefore: 'Patient was started on MAT with Suboxone.',
        sampleAfter: 'Patient initiated MOUD pharmacotherapy with buprenorphine-naloxone.',
        severity: 'RECOMMENDED_SHIFT',
        active: true
      },
      {
        id: 'acep-emergency-utilization',
        version: '1.0.0',
        deprecatedPattern: /\b(frequent flyer|drug seeker|drug seeking)\b/gi,
        preferredTerm: 'patient with high acute healthcare utilization / seeking acute analgesia',
        category: 'EMERGENCY_TRIAGE',
        standardSource: 'INSTITUTIONAL',
        citation: 'ACEP Code of Ethics; Joint Commission Patient Safety Alert #54',
        educationalRationale: 'Pejorative colloquial labels cause "diagnostic overshadowing", predisposing clinicians to dismiss emergent organic pathologies (e.g. spinal epidural abscess, necrotizing fasciitis, aortic dissection) as manipulative behavior.',
        sampleBefore: 'Patient is a frequent flyer drug seeker presenting for back pain.',
        sampleAfter: 'Patient with high acute healthcare utilization presenting seeking acute analgesia for severe back pain.',
        severity: 'HIGH_PRIORITY',
        active: true
      }
    ];

    for (const rule of coreRules) {
      this.rules.set(rule.id, rule);
    }
    this.rulesCount.set(this.rules.size);
  }

  /**
   * Retrieves an array of all registered rules.
   */
  getAllRules(): IDsmLanguageRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Registers or updates a clinical language rule in the registry.
   */
  registerRule(rule: IDsmLanguageRule): void {
    this.rules.set(rule.id, rule);
    this.rulesCount.set(this.rules.size);
  }

  /**
   * Audits clinical text for obsolete or stigmatizing terminology while strictly
   * protecting direct patient quotes in quotation marks.
   */
  auditText(text: string): ILanguageAuditResult {
    if (!text || !text.trim()) {
      return {
        hasSuggestions: false,
        totalFlags: 0,
        suggestions: [],
        harmonizedText: text || '',
        protectedQuoteCount: 0
      };
    }

    // Step 1: Detect quoted segments to protect patient verbatim speech
    // Supports standard straight quotes ("..."), smart double quotes (“...”), and single quotes
    const quoteRegex = /(["“'][^"”']*["”'])/g;
    const protectedRanges: Array<{ start: number; end: number }> = [];
    let quoteMatch: RegExpExecArray | null;

    while ((quoteMatch = quoteRegex.exec(text)) !== null) {
      protectedRanges.push({
        start: quoteMatch.index,
        end: quoteMatch.index + quoteMatch[0].length
      });
    }

    const suggestions: ILanguageSuggestion[] = [];

    // Step 2: Evaluate active rules against unquoted text
    for (const rule of this.rules.values()) {
      if (!rule.active) continue;

      // Create a fresh regex instance with global flag to avoid state mutation
      const regex = new RegExp(rule.deprecatedPattern.source, rule.deprecatedPattern.flags);
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        const matchStart = match.index;
        const matchEnd = match.index + match[0].length;

        // Verify if match falls inside any protected patient quotation
        const isInsideQuote = protectedRanges.some(
          range => matchStart >= range.start && matchEnd <= range.end
        );

        if (!isInsideQuote) {
          suggestions.push({
            ruleId: rule.id,
            matchedText: match[0],
            preferredTerm: rule.preferredTerm,
            index: matchStart,
            length: match[0].length,
            category: rule.category,
            standardSource: rule.standardSource,
            citation: rule.citation,
            educationalRationale: rule.educationalRationale,
            severity: rule.severity,
            sampleBefore: rule.sampleBefore,
            sampleAfter: rule.sampleAfter
          });
        }
      }
    }

    // Sort suggestions by index ascending
    suggestions.sort((a, b) => a.index - b.index);

    // Step 3: Compute harmonized text
    const harmonizedText = this.harmonizeText(text);

    return {
      hasSuggestions: suggestions.length > 0,
      totalFlags: suggestions.length,
      suggestions,
      harmonizedText,
      protectedQuoteCount: protectedRanges.length
    };
  }

  /**
   * Harmonizes unquoted obsolete terminology into preferred DSM-5-TR / ASAM language.
   */
  harmonizeText(text: string): string {
    if (!text || !text.trim()) return text;

    // Segment text into quoted and non-quoted chunks to prevent modifying patient quotes
    const quoteRegex = /(["“'][^"”']*["”'])/g;
    const parts: string[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = quoteRegex.exec(text)) !== null) {
      // Chunk before the quote
      if (match.index > lastIndex) {
        const unquotedChunk = text.substring(lastIndex, match.index);
        parts.push(this.replaceUnquotedChunk(unquotedChunk));
      }
      // The quote itself (preserved exactly as-is)
      parts.push(match[0]);
      lastIndex = match.index + match[0].length;
    }

    // Remaining tail after last quote
    if (lastIndex < text.length) {
      parts.push(this.replaceUnquotedChunk(text.substring(lastIndex)));
    }

    return parts.join('');
  }

  private replaceUnquotedChunk(chunk: string): string {
    let result = chunk;
    for (const rule of this.rules.values()) {
      if (!rule.active) continue;
      const regex = new RegExp(rule.deprecatedPattern.source, rule.deprecatedPattern.flags);
      result = result.replace(regex, (match) => {
        // Match casing of original first letter where appropriate
        if (match[0] === match[0].toUpperCase() && rule.preferredTerm.length > 0) {
          return rule.preferredTerm.charAt(0).toUpperCase() + rule.preferredTerm.slice(1);
        }
        return rule.preferredTerm;
      });
    }
    return result;
  }

  /**
   * Serializes current rule registry to portable JSON for institutional distribution.
   */
  exportRulesManifest(): string {
    const serialized: ISerializedDsmRule[] = Array.from(this.rules.values()).map(r => ({
      id: r.id,
      version: r.version,
      patternString: r.deprecatedPattern.source,
      patternFlags: r.deprecatedPattern.flags,
      preferredTerm: r.preferredTerm,
      category: r.category,
      standardSource: r.standardSource,
      citation: r.citation,
      educationalRationale: r.educationalRationale,
      sampleBefore: r.sampleBefore,
      sampleAfter: r.sampleAfter,
      severity: r.severity,
      active: r.active
    }));

    return JSON.stringify({
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      ruleCount: serialized.length,
      rules: serialized
    }, null, 2);
  }

  /**
   * Ingests a JSON manifest of custom/institutional rules.
   */
  loadRulesFromJson(jsonString: string): number {
    try {
      const parsed = JSON.parse(jsonString);
      const rulesArray: ISerializedDsmRule[] = Array.isArray(parsed) ? parsed : (parsed.rules || []);
      let loaded = 0;

      for (const item of rulesArray) {
        if (!item.id || !item.patternString || !item.preferredTerm) continue;

        const rule: IDsmLanguageRule = {
          id: item.id,
          version: item.version || '1.0.0',
          deprecatedPattern: new RegExp(item.patternString, item.patternFlags || 'gi'),
          preferredTerm: item.preferredTerm,
          category: item.category || 'ADDICTION_MEDICINE',
          standardSource: item.standardSource || 'INSTITUTIONAL',
          citation: item.citation || 'Institutional Clinical Standard',
          educationalRationale: item.educationalRationale || 'Updated clinical terminology.',
          sampleBefore: item.sampleBefore || '',
          sampleAfter: item.sampleAfter || '',
          severity: item.severity || 'RECOMMENDED_SHIFT',
          active: item.active !== false
        };

        this.rules.set(rule.id, rule);
        loaded++;
      }

      this.rulesCount.set(this.rules.size);
      return loaded;
    } catch (e) {
      console.error('[DsmLanguageCorrectionService] Failed to load JSON manifest:', e);
      return 0;
    }
  }
}
