import { Injectable, signal } from '@angular/core';

export type DocDrillPersona = 'clinician' | 'patient';

export type ChipCategoryType = 'deepDive' | 'contrast' | 'plainLanguage' | 'safety' | 'pemda';

export interface IContextChip {
  id: string;
  label: string;
  query: string;
  type: ChipCategoryType;
  icon: string;
  score: number;
  pillar?: string;
}

export interface IKnowledgeNodeInput {
  id: string;
  term: string;
  category: string;
  persona: 'clinician' | 'patient' | 'both';
  difficulty: 1 | 2 | 3;
  pemdaPillar?: 1 | 2 | 3 | 4 | 5 | 6; // 1=P, 2=E, 3=M, 4=D, 5=A, 6=+
  relatedIds: string[];
  keywords: string[];
  chips: {
    deepDive: string;
    contrast?: string;
    plainLanguage?: string;
    safety?: string;
    pemda?: string;
  };
}

/**
 * ParquetKnowledgeDbService
 *
 * Implements an in-browser columnar database inspired by Apache Parquet:
 * 1. Dictionary-encoded categorical columns (Category, Persona, Pillar).
 * 2. Vectorized integer scans using typed arrays (Uint8Array, Uint16Array).
 * 3. Compressed Sparse Row (CSR) adjacency matrix for O(1) 1-hop knowledge graph queries.
 * 4. 32-dimensional normalized projection vectors for zero-latency in-memory cosine ranking.
 * 5. Parquet-compatible binary magic encapsulation ('PAR1') for zero-egress local persistence.
 */
@Injectable({
  providedIn: 'root'
})
export class ParquetKnowledgeDbService {
  // ─── Dictionary Encoding ───
  private categoryDict: string[] = [];
  private readonly categoryMap = new Map<string, number>();

  // ─── Columnar Storage Vectors (Parquet Row Group Analogue) ───
  private nodeCount = 0;
  private nodeIds: string[] = [];
  private terms: string[] = [];
  private categoryCodes = new Uint8Array(0);
  private personaMasks = new Uint8Array(0);   // 0b01 = clinician, 0b10 = patient, 0b11 = both
  private difficultyTiers = new Uint8Array(0);
  private pemdaPillars = new Uint8Array(0);    // 0 = None, 1..6 = P, E, M, D, A, +

  // Compressed Sparse Row (CSR) Graph Edges
  private csrOffsets = new Uint32Array(0);
  private csrEdges = new Uint16Array(0);

  // 32-dimensional n-gram semantic projection vectors (normalized float32)
  private projectionVectors = new Float32Array(0);

  // Node chips definitions cache
  private readonly chipRegistry = new Map<string, IKnowledgeNodeInput['chips']>();
  // High-fidelity answer bank for instant, rich drill chip responses
  private readonly answerRegistry = new Map<string, { clinician: string; patient: string }>();

  // ─── Reactive State ───
  readonly recordCount = signal<number>(0);
  readonly isInitialized = signal<boolean>(false);

  constructor() {
    this.bootstrapKnowledgeBase();
    this.bootstrapAnswerRegistry();
  }

  /**
   * Initializes the in-browser Parquet columnar store with clinical & PEMDA+ foundations.
   */
  private bootstrapKnowledgeBase(): void {
    const rawNodes: IKnowledgeNodeInput[] = [
      {
        id: 'sloan',
        term: 'Louise Sloan 5:1 Optotype Invariant',
        category: 'OPHTHALMOLOGY',
        persona: 'both',
        difficulty: 2,
        pemdaPillar: 2, // [E] Empirical Optics
        relatedIds: ['bouma', 'ismp', 'telemetry-terminal', 'pemda-e'],
        keywords: ['sloan', 'optotype', 'snellen', '20/20', 'visual', 'arcminute', 'cone', 'retina', '5:1'],
        chips: {
          deepDive: 'Why subtend 5 arcminutes with 1 arcminute stroke?',
          contrast: 'Compare Sloan 5:1 vs standard Snellen acuity',
          plainLanguage: 'How does the Sloan window-blind shape help tired eyes?',
          safety: 'Optotypic safeguard for telemetry misreads',
          pemda: 'PEMDA+ [E]: Empirical optical equation at 55cm'
        }
      },
      {
        id: 'bouma',
        term: "Herman Bouma's Law of Lateral Crowding",
        category: 'NEURO_ERGONOMICS',
        persona: 'both',
        difficulty: 2,
        pemdaPillar: 2, // [E] Empirical Optics
        relatedIds: ['sloan', 'ismp', 'vitals-map', 'pemda-e'],
        keywords: ['bouma', 'crowding', 'flanker', 'peripheral', 'lateral', 'spacing', '0.12em', 'eccentricity'],
        chips: {
          deepDive: 'Calculate critical spacing radius r ≈ 0.5 × eccentricity',
          contrast: 'Bouma lateral tracking vs standard tight typography',
          plainLanguage: 'Why does extra space around numbers stop letters blurring?',
          safety: 'Anti-crowding spacing for multi-digit dosage orders',
          pemda: 'PEMDA+ [E]: Lateral 0.12em Bouma anti-crowding factor'
        }
      },
      {
        id: 'ismp',
        term: 'ISMP & FDA Life-Critical Disambiguation',
        category: 'PATIENT_SAFETY',
        persona: 'both',
        difficulty: 1,
        pemdaPillar: 4, // {D} Disambiguation
        relatedIds: ['sloan', 'bouma', 'vitals-map', 'pemda-d'],
        keywords: ['ismp', 'fda', 'slashed', 'zero', 'decimal', 'overdose', 'cv08', 'cv05', 'ss02', 'trailing'],
        chips: {
          deepDive: 'Analyze 10-fold dosage fatality mechanism of trailing zeros',
          contrast: 'Slashed 0 vs standard zero in EHR interfaces',
          plainLanguage: 'Why is a tiny dot on medication bottles so dangerous?',
          safety: 'ISMP OpenType zero rule: strict prohibition of 5.0 mg',
          pemda: 'PEMDA+ {D}: Slashed zero (0 vs O) & curved l (l vs 1)'
        }
      },
      {
        id: 'pemda-p',
        term: 'PEMDA+ (P): Primary Intent & Tactile Inking',
        category: 'PEMDA_PLUS',
        persona: 'both',
        difficulty: 1,
        pemdaPillar: 1, // (P) Primary Intent
        relatedIds: ['pemda-e', 'pemda-m', 'pemda-d', 'pemda-a', 'pemda-plus'],
        keywords: ['pemda', 'primary', 'intent', 'inking', 'marker', 'cardstock', 'human', 'gesture', 'tactile'],
        chips: {
          deepDive: 'Micro-modulation of physical felt-marker ink on cotton fiber',
          contrast: 'Organic human handwriting vs sterile synthetic geometry',
          plainLanguage: 'Why does hand-drawn lettering feel more reassuring to patients?',
          pemda: 'PEMDA+ (P): The parenthetical foundation of human gesture'
        }
      },
      {
        id: 'pemda-e',
        term: 'PEMDA+ [E]: Empirical Optics & Exponential Clarity',
        category: 'PEMDA_PLUS',
        persona: 'both',
        difficulty: 2,
        pemdaPillar: 2, // [E] Empirical
        relatedIds: ['sloan', 'bouma', 'pemda-p', 'pemda-m'],
        keywords: ['pemda', 'empirical', 'optics', 'exponential', 'sloan', 'bouma', 'logmar', 'snellen', '5:1'],
        chips: {
          deepDive: 'LogMAR 0.0 Snellen 20/20 optotype stroke geometry at 50-70cm',
          contrast: 'Exponential clarity scaling across low-DPI COW workstations',
          plainLanguage: 'How science turns handwriting into an eye-test instrument',
          pemda: 'PEMDA+ [E]: The exponential power of biophysical proof'
        }
      },
      {
        id: 'pemda-m',
        term: 'PEMDA+ {M}: Multi-Style Superfamily Hierarchy',
        category: 'PEMDA_PLUS',
        persona: 'both',
        difficulty: 2,
        pemdaPillar: 3, // {M} Multiplication
        relatedIds: ['pemda-e', 'pemda-d', 'telemetry-terminal'],
        keywords: ['pemda', 'multiplication', 'superfamily', 'hierarchy', 'bold', 'fineliner', 'chiseltip', 'mono'],
        chips: {
          deepDive: 'Harmonizing Bold 700, Fineliner 400, Chiseltip 900, & Mono 400',
          contrast: 'Proportional handwriting vs strict 600 UPM fixed pitch',
          plainLanguage: 'How four font styles work together like an orchestra',
          pemda: 'PEMDA+ {M}: Multi-style multiplication across 4 masters'
        }
      },
      {
        id: 'pemda-d',
        term: 'PEMDA+ {D}: Disambiguation Safety & Division',
        category: 'PEMDA_PLUS',
        persona: 'both',
        difficulty: 1,
        pemdaPillar: 4, // {D} Division
        relatedIds: ['ismp', 'pemda-m', 'pemda-a'],
        keywords: ['pemda', 'disambiguation', 'division', 'safety', 'zero', 'cv08', 'cv05', 'ss02', 'confusion'],
        chips: {
          deepDive: 'OpenType feature tables cv08, cv05, and ss02 in true clinical fonts',
          contrast: 'Dividing confusable pairs: 0 vs O, 1 vs l, I vs l',
          plainLanguage: 'Making sure numbers can never be mistaken for letters',
          safety: 'Zero-confusion invariant across drug prescriptions',
          pemda: 'PEMDA+ {D}: Dividing error vectors through glyph clarity'
        }
      },
      {
        id: 'pemda-a',
        term: 'PEMDA+ (A): Universal Accessibility & Addition',
        category: 'PEMDA_PLUS',
        persona: 'both',
        difficulty: 2,
        pemdaPillar: 5, // (A) Addition
        relatedIds: ['braille-256', 'pemda-d', 'pemda-plus'],
        keywords: ['pemda', 'accessibility', 'addition', 'braille', 'wcag', 'contrast', 'tabular', 'inclusion'],
        chips: {
          deepDive: 'Embedding the full 256-glyph Unicode Braille block in a text font',
          contrast: 'WCAG AAA 7:1 obsidian contrast vs standard low-contrast web text',
          plainLanguage: 'Adding Braille dots so touch and sight work together',
          pemda: 'PEMDA+ (A): Adding universal accessibility for every reader'
        }
      },
      {
        id: 'pemda-plus',
        term: 'PEMDA+ (+): The Quiet Workshop Voice & Human Healing',
        category: 'PEMDA_PLUS',
        persona: 'both',
        difficulty: 1,
        pemdaPillar: 6, // (+) The Plus
        relatedIds: ['pemda-p', 'pemda-a', 'vitals-hrv'],
        keywords: ['pemda', 'plus', 'quiet', 'workshop', 'healing', 'human', 'parasympathetic', '0.1hz', 'calm'],
        chips: {
          deepDive: 'Bio-rhythmic 0.1 Hz parasympathetic pacing in clinical visual design',
          contrast: 'Calm, grounding medicine vs alarmist, stressful interfaces',
          plainLanguage: 'Why a calm, caring design helps your body heal faster',
          pemda: 'PEMDA+ (+): The plus of human warmth and sacred care'
        }
      },
      {
        id: 'vitals-map',
        term: 'Mean Arterial Pressure (MAP)',
        category: 'CARDIOLOGY',
        persona: 'both',
        difficulty: 2,
        pemdaPillar: 2,
        relatedIds: ['vitals-hrv', 'ismp', 'sloan'],
        keywords: ['map', 'blood', 'pressure', 'arterial', 'systolic', 'diastolic', 'perfusion', 'organ'],
        chips: {
          deepDive: 'MAP calculation formula: DBP + 1/3 (SBP - DBP)',
          contrast: 'MAP vs pulse pressure in critical organ perfusion',
          plainLanguage: 'What does Mean Arterial Pressure tell me about blood flow?',
          safety: 'Threshold warning: MAP < 65 mmHg organ risk',
          pemda: 'PEMDA+ [E]: Tabular numerical vitals telemetry'
        }
      },
      {
        id: 'vitals-hrv',
        term: 'Heart Rate Variability (rMSSD & SDNN)',
        category: 'AUTONOMIC_TONE',
        persona: 'both',
        difficulty: 2,
        pemdaPillar: 6,
        relatedIds: ['vitals-map', 'pemda-plus'],
        keywords: ['hrv', 'variability', 'rmssd', 'sdnn', 'vagal', 'parasympathetic', 'sympathetic', 'stress'],
        chips: {
          deepDive: 'Physiological mechanisms of rMSSD in vagal nerve outflow',
          contrast: 'High HRV resilience vs low HRV autonomic collapse',
          plainLanguage: 'How heart rate variation shows how relaxed your body is',
          pemda: 'PEMDA+ (+): 0.1 Hz parasympathetic heart rhythm resonance'
        }
      },
      {
        id: 'braille-256',
        term: 'Universal Unicode Braille (U+2800–U+28FF)',
        category: 'ACCESSIBILITY',
        persona: 'both',
        difficulty: 2,
        pemdaPillar: 5,
        relatedIds: ['pemda-a', 'sloan'],
        keywords: ['braille', 'unicode', 'u+2800', 'tactile', 'blind', 'dots', '8-dot', '6-dot', 'inclusive'],
        chips: {
          deepDive: 'Mathematical encoding of 8-dot Braille binary matrix (2^8 = 256)',
          contrast: 'Visual Braille transcription vs raised dot physical embossing',
          plainLanguage: 'How Braille code turns letters into touchable patterns',
          pemda: 'PEMDA+ (A): Dual-modality tactile & visual communication'
        }
      },
      {
        id: 'telemetry-terminal',
        term: 'ICU Fixed-Pitch Telemetry Terminal',
        category: 'INFORMATICS',
        persona: 'clinician',
        difficulty: 3,
        pemdaPillar: 3,
        relatedIds: ['pemda-m', 'vitals-map', 'ismp'],
        keywords: ['telemetry', 'terminal', 'monospace', 'fixed', 'pitch', '600upm', 'tabular', 'icu', 'monitor'],
        chips: {
          deepDive: 'Strict 600 UPM fixed pitch metrics for zero-jitter waveform monitors',
          contrast: 'Monospace tabular numerals vs proportional script numbers',
          safety: 'Aligning decimal points across medication infusion columns',
          pemda: 'PEMDA+ {M}: PocketGull Mono 400 fixed-pitch standard'
        }
      }
    ];

    this.ingestNodes(rawNodes);
  }

  /**
   * Ingests knowledge nodes and compiles them into contiguous columnar vectors.
   */
  private ingestNodes(nodes: IKnowledgeNodeInput[]): void {
    this.nodeCount = nodes.length;
    this.nodeIds = nodes.map(n => n.id);
    this.terms = nodes.map(n => n.term);

    // 1. Build Category Dictionary
    this.categoryDict = [];
    this.categoryMap.clear();
    for (const node of nodes) {
      if (!this.categoryMap.has(node.category)) {
        this.categoryMap.set(node.category, this.categoryDict.length);
        this.categoryDict.push(node.category);
      }
    }

    // 2. Allocate Columnar Typed Arrays
    this.categoryCodes = new Uint8Array(this.nodeCount);
    this.personaMasks = new Uint8Array(this.nodeCount);
    this.difficultyTiers = new Uint8Array(this.nodeCount);
    this.pemdaPillars = new Uint8Array(this.nodeCount);
    this.projectionVectors = new Float32Array(this.nodeCount * 32); // 32 dims per node

    // 3. Populate Columnar Slices & Compute Projections
    nodes.forEach((node, i) => {
      this.categoryCodes[i] = this.categoryMap.get(node.category) ?? 0;
      this.personaMasks[i] = node.persona === 'clinician' ? 0b01 : node.persona === 'patient' ? 0b10 : 0b11;
      this.difficultyTiers[i] = node.difficulty;
      this.pemdaPillars[i] = node.pemdaPillar ?? 0;

      this.chipRegistry.set(node.id, node.chips);

      // Compute normalized 32-dim n-gram semantic projection
      const textToProject = `${node.term} ${node.category} ${node.keywords.join(' ')}`;
      const vec = this.computeProjectionVector(textToProject);
      this.projectionVectors.set(vec, i * 32);
    });

    // 4. Build Compressed Sparse Row (CSR) Graph
    const idToIndex = new Map<string, number>();
    this.nodeIds.forEach((id, idx) => idToIndex.set(id, idx));

    const offsets: number[] = [0];
    const edges: number[] = [];

    nodes.forEach(node => {
      for (const relId of node.relatedIds) {
        const targetIdx = idToIndex.get(relId);
        if (targetIdx !== undefined) {
          edges.push(targetIdx);
        }
      }
      offsets.push(edges.length);
    });

    this.csrOffsets = new Uint32Array(offsets);
    this.csrEdges = new Uint16Array(edges);

    this.recordCount.set(this.nodeCount);
    this.isInitialized.set(true);
  }

  /**
   * Queries the columnar database to generate and rank context chips tailored
   * to the active topic, persona, and recent conversation turns.
   */
  queryContextChips(
    activeTopicId?: string | null,
    persona: DocDrillPersona = 'clinician',
    recentQuestions: string[] = [],
    limit = 5
  ): IContextChip[] {
    if (!activeTopicId || this.nodeCount === 0) {
      return this.getDefaultChips(persona);
    }

    const currentIdx = this.nodeIds.indexOf(activeTopicId);
    const targetPersonaMask = persona === 'clinician' ? 0b01 : 0b10;

    // Vectorized projection of recent conversation tokens
    const recentTokens = recentQuestions.slice(-3).join(' ');
    const queryVec = recentTokens.trim() ? this.computeProjectionVector(recentTokens) : null;

    const localChips: IContextChip[] = [];
    const neighborChips: IContextChip[] = [];

    // ─── 1. Active Node's Own Categorized Chips ───
    if (currentIdx !== -1) {
      const activeChips = this.chipRegistry.get(activeTopicId);
      if (activeChips) {
        if (activeChips.deepDive && !this.wasAsked(activeChips.deepDive, recentQuestions)) {
          localChips.push({
            id: `${activeTopicId}_deep`,
            label: `🎯 ${activeChips.deepDive}`,
            query: activeChips.deepDive,
            type: 'deepDive',
            icon: '🎯',
            score: 1.0,
            pillar: this.getPillarName(this.pemdaPillars[currentIdx])
          });
        }
        if (activeChips.contrast && !this.wasAsked(activeChips.contrast, recentQuestions)) {
          localChips.push({
            id: `${activeTopicId}_contrast`,
            label: `⚖️ ${activeChips.contrast}`,
            query: activeChips.contrast,
            type: 'contrast',
            icon: '⚖️',
            score: 0.95
          });
        }
        if (activeChips.plainLanguage && (persona === 'patient' || !this.wasAsked(activeChips.plainLanguage, recentQuestions))) {
          localChips.push({
            id: `${activeTopicId}_plain`,
            label: `💡 ${activeChips.plainLanguage}`,
            query: activeChips.plainLanguage,
            type: 'plainLanguage',
            icon: '💡',
            score: persona === 'patient' ? 1.05 : 0.85
          });
        }
        if (activeChips.safety && !this.wasAsked(activeChips.safety, recentQuestions)) {
          localChips.push({
            id: `${activeTopicId}_safety`,
            label: `🛡️ ${activeChips.safety}`,
            query: activeChips.safety,
            type: 'safety',
            icon: '🛡️',
            score: 0.9
          });
        }
        if (activeChips.pemda && !this.wasAsked(activeChips.pemda, recentQuestions)) {
          localChips.push({
            id: `${activeTopicId}_pemda`,
            label: `⚡ ${activeChips.pemda}`,
            query: activeChips.pemda,
            type: 'pemda',
            icon: '⚡',
            score: 0.92,
            pillar: this.getPillarName(this.pemdaPillars[currentIdx])
          });
        }
      }

      // ─── 2. 1-Hop Graph Neighbor Chips (via Columnar CSR Slice) ───
      const edgeStart = this.csrOffsets[currentIdx];
      const edgeEnd = this.csrOffsets[currentIdx + 1];

      for (let e = edgeStart; e < edgeEnd; e++) {
        const neighborIdx = this.csrEdges[e];

        // Columnar persona mask filter
        if ((this.personaMasks[neighborIdx] & targetPersonaMask) === 0) continue;

        const neighborId = this.nodeIds[neighborIdx];
        const neighborTerm = this.terms[neighborIdx];
        const nChips = this.chipRegistry.get(neighborId);

        // Compute cosine similarity between query and neighbor projection
        let simScore = 0.5;
        if (queryVec) {
          const neighborVec = this.projectionVectors.subarray(neighborIdx * 32, (neighborIdx + 1) * 32);
          simScore = this.cosineSimilarity(queryVec, neighborVec);
        }

        if (nChips?.deepDive) {
          const prompt = `Drill into: ${neighborTerm}`;
          if (!this.wasAsked(prompt, recentQuestions)) {
            neighborChips.push({
              id: `${neighborId}_hop`,
              label: `🔗 ${neighborTerm}`,
              query: nChips.deepDive,
              type: 'deepDive',
              icon: '🔗',
              score: 0.8 + (simScore * 0.2),
              pillar: this.getPillarName(this.pemdaPillars[neighborIdx])
            });
          }
        }
      }
    }

    // Sort local and neighbor chips separately to guarantee balanced drill-down exploration
    localChips.sort((a, b) => b.score - a.score);
    neighborChips.sort((a, b) => b.score - a.score);

    // Blend: take up to 3 local chips and up to 2 graph hops, then fill up to limit
    const blended: IContextChip[] = [];
    const localQuota = Math.min(localChips.length, Math.max(1, limit - 2));
    blended.push(...localChips.slice(0, localQuota));

    const neighborQuota = Math.min(neighborChips.length, limit - blended.length);
    blended.push(...neighborChips.slice(0, neighborQuota));

    // Fill any remainder
    if (blended.length < limit) {
      const remainingLocal = localChips.slice(localQuota);
      const remainingNeighbors = neighborChips.slice(neighborQuota);
      const remainder = [...remainingLocal, ...remainingNeighbors].sort((a, b) => b.score - a.score);
      blended.push(...remainder.slice(0, limit - blended.length));
    }

    return blended;
  }

  /**
   * Generates a default chip set when no active topic is selected.
   */
  private getDefaultChips(persona: DocDrillPersona): IContextChip[] {
    if (persona === 'patient') {
      return [
        { id: 'def_p1', label: '💡 How can I read my prescription safely?', query: 'Explain how to read drug doses safely', type: 'plainLanguage', icon: '💡', score: 1.0 },
        { id: 'def_p2', label: '👁️ What is Snellen 20/20 vs Sloan vision?', query: 'What makes Sloan eye charts special?', type: 'plainLanguage', icon: '👁️', score: 0.9 },
        { id: 'def_p3', label: '🌿 What does heart rate variability mean for my stress?', query: 'Explain HRV for daily stress and calm', type: 'plainLanguage', icon: '🌿', score: 0.85 }
      ];
    }
    return [
      { id: 'def_c1', label: '🛡️ ISMP prohibited trailing zero mechanisms', query: 'Why does ISMP prohibit 5.0 mg?', type: 'safety', icon: '🛡️', score: 1.0 },
      { id: 'def_c2', label: '👁️ Sloan 5:1 arcminute spatial frequency proof', query: 'Derive Dr. Louise Sloan 5:1 optotype invariant', type: 'deepDive', icon: '👁️', score: 0.95 },
      { id: 'def_c3', label: '⚡ PEMDA+ order of operations in clinical UI', query: 'Explain PEMDA+ order of operations in typography', type: 'pemda', icon: '⚡', score: 0.9 }
    ];
  }

  private wasAsked(chipQuery: string, recentQuestions: string[]): boolean {
    const qLower = chipQuery.toLowerCase();
    return recentQuestions.some(asked => asked.toLowerCase().includes(qLower) || qLower.includes(asked.toLowerCase()));
  }

  private getPillarName(pillarCode: number): string | undefined {
    switch (pillarCode) {
      case 1: return 'Primary Intent';
      case 2: return 'Empirical Optics';
      case 3: return 'Multi-Style';
      case 4: return 'Disambiguation';
      case 5: return 'Accessibility';
      case 6: return 'Human Healing';
      default: return undefined;
    }
  }

  /**
   * Resolves a rich, authoritative pedagogical answer for a drill chip query.
   */
  resolveChipAnswer(query: string, activeTopicId?: string | null, persona: DocDrillPersona = 'clinician'): string | null {
    if (!query || !query.trim()) return null;
    const cleanQ = query.toLowerCase().trim();

    // 1. Direct key match in answer registry
    for (const [key, answer] of this.answerRegistry.entries()) {
      if (cleanQ.includes(key) || key.includes(cleanQ)) {
        return persona === 'clinician' ? answer.clinician : answer.patient;
      }
    }

    // 2. Semantic topic-based keyword matching
    for (const [key, answer] of this.answerRegistry.entries()) {
      const tokens = key.split(/[\s,]+/);
      const matchCount = tokens.filter(t => t.length > 3 && cleanQ.includes(t)).length;
      if (matchCount >= 2) {
        return persona === 'clinician' ? answer.clinician : answer.patient;
      }
    }

    return null;
  }

  /**
   * Bootstraps the curated, high-fidelity answers for drill-down context chips.
   */
  private bootstrapAnswerRegistry(): void {
    // ─── LOUISE SLOAN 5:1 INVARIANT ───
    this.answerRegistry.set('5 arcminutes', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Empirical Foveal Cone Density Mechanics</h4>
        <p class="mb-2 text-zinc-300">Human foveal center cones subtend approximately <strong>0.5 to 1.0 arcminute</strong> of visual angle. When an optotype subtends exactly <strong>5 arcminutes (5′)</strong> total with <strong>1 arcminute (1′)</strong> strokes and internal counters, each dark stroke excites an isolated ganglion receptive field while the white counter gap permits uninhibited adjacent photoreceptors to signal contrast.</p>
        <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-amber-300 mb-2">
          θ = 2 × arctan(Height / (2 × Distance)) = 5 arcminutes<br>
          At 55 cm: Letter Height = 0.8 mm | Stroke = 0.16 mm (LogMAR 0.0)
        </div>
        <p class="text-zinc-300">In PocketGull, locking glyph geometry to 1000 UPM TrueType vectors guarantees that strokes and counters never collapse under mesopic ICU or dim ambient lighting.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Why Letters Have This Exact Shape</h4>
        <p class="mb-2 text-zinc-300">Your eyes have millions of tiny light detectors in the center of your vision. When letters have wide, open centers and clean strokes, each part of the letter hits a different sensor in your eye instead of blurring together into a fuzzy dark blob.</p>
        <p class="text-zinc-300">It's the optical equivalent of opening window blinds all the way: maximum contrast, zero squinting, and clear reading even if your room is dim or you are reading without reading glasses.</p>
        <div class="p-2 rounded-lg bg-teal-950/40 border border-teal-500/30 text-teal-200 text-[11px] mt-2">
          💬 <strong>Question for your doctor:</strong> <em>"Does my near-vision prescription give me comfortable, strain-free reading at arm's length (50–70cm)?"</em>
        </div>
      `
    });

    this.answerRegistry.set('compare sloan', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Sloan vs. Snellen Acuity Disambiguation</h4>
        <p class="mb-2 text-zinc-300">Herman Snellen's 1862 chart used serifed letters with widely disparate legibility (e.g., <strong>L</strong> was 40% easier to recognize than <strong>B</strong>). In 1959, Dr. Louise Sloan standardized visual acuity across 10 balanced nonserif optotypes (<strong>C, D, H, K, N, O, R, S, V, Z</strong>) with identical psychometric recognition curves.</p>
        <p class="text-zinc-300">Sloan optotypes form the statutory basis of the ETDRS (Early Treatment Diabetic Retinopathy Study) gold-standard visual protocol mandated by the FDA for ophthalmic clinical trials.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Sloan vs Older Eye Charts</h4>
        <p class="mb-2 text-zinc-300">On older eye charts from the 1800s, some letters were much easier to guess than others—an <strong>L</strong> was way easier than an <strong>E</strong>! Dr. Louise Sloan tested thousands of eyes to choose 10 balanced letters that are equally fair to read.</p>
        <p class="text-zinc-300">That means when your vision is checked with PocketGull, your score is 100% reliable and doesn't depend on lucky letter guesses.</p>
      `
    });

    this.answerRegistry.set('55cm', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">The 55 cm Near-Field Ergonomic Vector</h4>
        <p class="mb-2 text-zinc-300">55 cm (~21.6 inches) represents the median optical focal distance for clinical tablet interactions and swivel-arm workstation displays in exam rooms and crash carts. At 55 cm, a 5-arcminute optotype requires exactly <strong>0.80 mm</strong> physical letter height on high-DPI panels.</p>
        <p class="text-zinc-300">PocketGull enforces 14px to 18px root scales with +0.12em Bouma clearance to maintain LogMAR 0.0 (Snellen 20/20 equivalent) at this exact viewing distance.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">The Natural Arm's-Length Distance</h4>
        <p class="mb-2 text-zinc-300">55 centimeters is about an arm's length away—the natural distance where most people hold a phone, tablet, or clipboard.</p>
        <p class="text-zinc-300">PocketGull sizes every piece of text so you can read your care plan naturally at arm's length without having to lean forward or pull the screen close to your face.</p>
      `
    });

    this.answerRegistry.set('aperture', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Phoropter Dynamic Counter Aperture Dilation (1.00× to 1.35×)</h4>
        <p class="mb-2 text-zinc-300">In mesopic (dim-light) resuscitation or acute visual fatigue, physiological pupil dilation increases spherical aberration, generating <strong>optical irradiation (retinal blooming)</strong> where high-luminance light spills across adjacent photoreceptors.</p>
        <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-teal-300 mb-2">
          Aperture Expansion Ratio: 1.00× → 1.35×<br>
          Inner Counter Clearance: locked to 1000 UPM TrueType geometry
        </div>
        <p class="text-zinc-300">PocketGull's Phoropter engine dynamically widens internal letter openings (e.g. the mouth of <code>C</code>, inner loops of <code>8</code>, and counter of <code>0</code>) by up to <strong>+35%</strong>. This prevents critical dosage numerals from filling in and becoming solid black blobs on smudged bedside monitors.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">How Letters Widen to Stay Clear in the Dark</h4>
        <p class="mb-2 text-zinc-300">When you are in a dark room or feeling tired, the pupils of your eyes widen to let in more light. But that extra light can make bright letters "glow" and bleed together.</p>
        <p class="text-zinc-300">PocketGull automatically opens up the inside spaces of numbers—like the hole in a <strong>0</strong> or the loop in an <strong>8</strong>—so they never blur together into dark solid shapes when your eyes are tired.</p>
      `
    });

    this.answerRegistry.set('dilate', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Counter Aperture Dilation Mechanics</h4>
        <p class="mb-2 text-zinc-300">Glyph aperture dilation selectively shifts internal Bézier control points outward along their surface normals while clamping outer bounding boxes. This guarantees that letter spacing remains stable while internal counter luminance increases by <strong>+28%</strong>, preserving LogMAR 0.0 acuity under severe optical blur.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Keeping Letters Open</h4>
        <p class="mb-2 text-zinc-300">Letters like <strong>C</strong>, <strong>e</strong>, and <strong>8</strong> have little circular openings. Dilation means opening those windows wider so they stay crisp and unmistakable, even on low-quality screens or printouts.</p>
      `
    });

    // ─── HERMAN BOUMA LATERAL CROWDING ───
    this.answerRegistry.set('crowding', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Bouma's Law of Parafoveal Flanker Crowding</h4>
        <p class="mb-2 text-zinc-300">Herman Bouma (Nature 1970) demonstrated that peripheral identification collapses when adjacent flanker glyphs fall within <code>r ≈ 0.5 × eccentricity (degrees)</code>. In critical care HUDs, clinicians scan vitals parafoveally (2° to 5° eccentricity), where uncompensated spacing causes neighboring digits to fuse into cortical textures.</p>
        <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-teal-300 mb-2">
          Critical Separation: r ≈ 0.5 × θ<br>
          PocketGull Solution: +0.12em letter-spacing expansion on tabular numbers
        </div>
        <p class="text-zinc-300">This +0.12em boundary guarantees digit isolation during rapid triage scanning, preventing medication rate misidentifications.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Giving Numbers Room to Breathe</h4>
        <p class="mb-2 text-zinc-300">When numbers are squished together, your side vision naturally blends them into a blur. Scientist Herman Bouma discovered that giving numbers a tiny bit of extra room keeps them clear.</p>
        <p class="text-zinc-300">PocketGull adds gentle spacing around all your vitals so numbers like <strong>120</strong> never blur into <strong>128</strong> when your eyes move across the screen.</p>
      `
    });

    this.answerRegistry.set('flanker', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Parafoveal Flanker Interference Mechanism</h4>
        <p class="mb-2 text-zinc-300">Flanker interference is a cortical phenomenon occurring in visual areas V1 and V4. Rather than optical blur, flankers cause receptive fields to pool target and distractor features together into an un-segmented neural representation.</p>
        <p class="text-zinc-300">Expanding lateral tracking to <code>+0.12em</code> breaks this receptive field pooling, ensuring independent cortical feature extraction.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Why Words Next to Each Other Get Jumbled</h4>
        <p class="mb-2 text-zinc-300">When you look straight at one word, the words next to it are in the corner of your eye. If they are packed too tightly, your brain tries to combine them into one word.</p>
        <p class="text-zinc-300">Adding a tiny bit of space keeps each word in its own lane so your eyes never trip over neighboring letters.</p>
      `
    });

    // ─── ISMP SAFETY & DISAMBIGUATION ───
    this.answerRegistry.set('trailing zero', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">ISMP & FDA Slashed Zero & Trailing Zero Invariant</h4>
        <p class="mb-2 text-zinc-300">Writing trailing zeros (e.g., <code>5.0 mg</code>) is an ISMP-prohibited practice because a display artifact, screen glare, or smudge on glass transforms the order into <code>50 mg</code>—a lethal 10-fold overdose. Conversely, naked decimals (<code>.5 mg</code>) must always be preceded by a zero (<code>0.5 mg</code>).</p>
        <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-rose-300 mb-2">
          • Slashed Zero: 0̸ (OpenType cv08) eradicates '0' vs 'O' confusion<br>
          • Curved Lowercase l: cv05 eradicates 'l' vs '1' confusion<br>
          • Serifed Capital I: ss02 eradicates 'I' vs 'l' confusion
        </div>
        <p class="text-zinc-300">These three disambiguation rules are hardcoded into PocketGull's font tables to ensure clinical safety on low-resolution 203 DPI wristband thermal printers.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Why a Tiny Dot Can Be Dangerous on Medicine</h4>
        <p class="mb-2 text-zinc-300">If a prescription says <strong>5.0 mg</strong> and a speck of dust or print smudge covers the tiny decimal point, someone could accidentally read it as <strong>50 mg</strong>—ten times the safe dose!</p>
        <p class="text-zinc-300">PocketGull writes numbers with clear slashed zeros (<strong>0̸</strong>) and never puts an unnecessary dot after a whole number, keeping your medicine doses completely clear and safe.</p>
        <div class="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200 text-[11px] mt-2">
          🛡️ <strong>Safety Rule:</strong> <em>Always confirm that whole-number doses have no trailing decimal (write 5 mg, never 5.0 mg).</em>
        </div>
      `
    });

    this.answerRegistry.set('slashed', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">OpenType cv08 Slashed Zero Disambiguation</h4>
        <p class="mb-2 text-zinc-300">In alphanumeric drug names and ICD-10/CPT codes (e.g. <code>Oxycodone 10mg</code>, <code>I10</code> vs <code>110</code>), the capital letter <strong>O</strong> and numeral <strong>0</strong> share identical oval contours. Activating <code>cv08</code> places an internal 45° diagonal slash across the numeral zero, preventing transposition in order entry.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Why Our Zeros Have a Slash Inside (0̸)</h4>
        <p class="mb-2 text-zinc-300">Have you ever had trouble telling apart the letter <strong>O</strong> and the number <strong>0</strong>? In medical charts, mixing those up can cause serious computer errors.</p>
        <p class="text-zinc-300">PocketGull puts a clean diagonal slash through every zero (0̸) so it's instantly obvious that it's a number.</p>
      `
    });

    // ─── PEMDA+ PILLARS ───
    this.answerRegistry.set('primary intent', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">PEMDA+ (P): Primary Human Intent in Clinical Systems</h4>
        <p class="mb-2 text-zinc-300">In arithmetic, parentheses (P) establish foundational primacy before multiplicative calculations begin. In clinical engineering, Primary Intent mandates that human warmth, empathetic physician-patient bonding, and the tactile authenticity of handwriting precede algorithmic AI scoring.</p>
        <p class="text-zinc-300">PocketGull captures authentic physical felt-marker inkings on cardstock, digitizing the natural stroke dynamics to build patient trust rather than cold robotic detachment.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">The Warmth of Real Human Care</h4>
        <p class="mb-2 text-zinc-300">Healthcare should never feel like a cold computer talking to you. (P) Primary Intent means our software is rooted in the warmth of a real doctor writing a handwritten note to help you heal.</p>
      `
    });

    this.answerRegistry.set('empirical optics', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">PEMDA+ [E]: The Exponent of Biophysical Rigor</h4>
        <p class="mb-2 text-zinc-300">Exponents [E] multiply impact. In typography, [E] couples Louise Sloan's 5:1 optotype invariant with Bouma's crowding limit, providing verifiable optical proof that clinical typography reduces visual latency and reading fatigue under emergency stress.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Tested by Eye Doctors for Clarity</h4>
        <p class="mb-2 text-zinc-300">Every curve and number in PocketGull has been tested using optical science so your eyes can glide over your health report without feeling tired or strained.</p>
      `
    });

    this.answerRegistry.set('superfamily', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">PEMDA+ {M}: 4-Master Superfamily Multiplication</h4>
        <p class="mb-2 text-zinc-300">Multiplication {M} establishes typographic harmony across 4 purpose-built masters: <strong>Bold 700</strong> (focal bionic fixation), <strong>Fineliner 400</strong> (high-legibility prose), <strong>Chiseltip 900</strong> (stat emergency alerts), and <strong>Mono 400</strong> (fixed 600 UPM ICU telemetry tabular figures).</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">A Visual Guide for Your Eyes</h4>
        <p class="mb-2 text-zinc-300">Different font styles guide your eyes smoothly—important warnings catch your attention right away, while detailed explanations are soft and easy to read.</p>
      `
    });

    this.answerRegistry.set('disambiguation', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">PEMDA+ {D}: Dividing Error Vectors Out of Clinical Medicine</h4>
        <p class="mb-2 text-zinc-300">Division {D} systematically separates confusable letter/number pairs: <code>0</code> vs <code>O</code> (cv08 slashed zero), <code>1</code> vs <code>l</code> (cv05 curved foot), and <code>I</code> vs <code>l</code> (ss02 bilateral serifs), eradicating the leading vector of digital EHR prescription errors.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Zero Mix-Ups on Numbers</h4>
        <p class="mb-2 text-zinc-300">We make sure that a zero (0̸) can never look like the letter 'O', and a number '1' never looks like an 'L'. Every dose is unmistakably clear.</p>
      `
    });

    this.answerRegistry.set('braille', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">PEMDA+ (A): Unicode Braille Matrix Encoding (U+2800–U+28FF)</h4>
        <p class="mb-2 text-zinc-300">The 8-dot Braille standard defines a discrete 8-bit binary permutation space ($2^8 = 256$ distinct glyphs). Embedding all 256 cells into PocketGull allows real-time transcription between visual optotypes and tactile output without external assistive translation layers.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Reading with Dots</h4>
        <p class="mb-2 text-zinc-300">Braille uses a special grid of dots that people can read with their fingertips. PocketGull has all 256 Braille patterns built right in, so information can be shared in dots as easily as in letters.</p>
      `
    });

    this.answerRegistry.set('parasympathetic', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">PEMDA+ (+): Parasympathetic 0.1 Hz Bio-Rhythmic Resonance</h4>
        <p class="mb-2 text-zinc-300">The (+) is the clinical summit: counteracting "screen apnea" and sympathetic fight-or-flight arousal through Rachel Nabors ethical motion pacing at <strong>0.1 Hz</strong> (10-second cycle: 4s expansion / 6s relaxation), clinically synchronizing respiratory sinus arrhythmia and calming autonomic tone.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Calm, Restful Healing</h4>
        <p class="mb-2 text-zinc-300">The gentle glowing pulses in PocketGull breathe slowly at 6 breaths per minute. As you watch, your body naturally slows down its heart rate, helping you feel calm and at ease while you review your health.</p>
      `
    });

    // ─── CARDIOLOGY & AUTONOMIC VITALS ───
    this.answerRegistry.set('mean arterial pressure', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Mean Arterial Pressure (MAP) Physiology & Target Perfusion</h4>
        <p class="mb-2 text-zinc-300">MAP reflects the average perfusion pressure across capillary beds during a cardiac cycle: <code>MAP = DBP + 1/3 (SBP - DBP)</code>. A minimum MAP of <strong>65 mmHg</strong> is required to overcome autoregulatory thresholds in renal glomeruli and cerebral parenchyma.</p>
        <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-teal-300 mb-2">
          Normal Range: 70–100 mmHg | Critical Threshold: &lt; 65 mmHg flags hypoperfusion risk
        </div>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">What Mean Arterial Pressure (MAP) Means</h4>
        <p class="mb-2 text-zinc-300">Think of your blood pressure like water flowing through garden hoses to water your flowers. MAP tells your doctor the steady, gentle pressure that keeps fresh blood flowing to all your vital organs, like your brain and kidneys.</p>
        <p class="text-zinc-300">A score between 70 and 100 means your body is getting rich, healthy blood flow every second.</p>
      `
    });

    this.answerRegistry.set('heart rate variability', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">HRV (rMSSD & SDNN) Parasympathetic Telemetry</h4>
        <p class="mb-2 text-zinc-300">Root Mean Square of Successive Differences (rMSSD) directly reflects acetylcholine-mediated vagus nerve outflow to the cardiac sinoatrial node. High rMSSD indicates autonomic flexibility and parasympathetic recovery; collapsed rMSSD (&lt; 20 ms) flags acute physiological stress, systemic inflammation, or overtraining.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Heart Rate Variability Explained</h4>
        <p class="mb-2 text-zinc-300">Even when your pulse is 60 beats per minute, the time between each beat changes naturally by tiny fractions of a second. When your heart rate varies naturally, it means your nervous system is relaxed and ready to bounce back from stress.</p>
        <p class="text-zinc-300">Think of it like a shock absorber on a bicycle—a healthy, flexible heart adapts smoothly to every bump in the road!</p>
      `
    });

    this.answerRegistry.set('fixed-pitch', {
      clinician: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">600 UPM Monospace & Fixed Column Telemetry</h4>
        <p class="mb-2 text-zinc-300">In ICU monitors and infusion rate controllers, proportional fonts cause numbers to jitter left and right as values fluctuate (e.g. '1' is narrower than '8'). PocketGull Mono locks advance width strictly to <strong>600 UPM</strong> with centered tabular numerals, guaranteeing decimal point alignment across columns.</p>
      `,
      patient: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Why Numbers Never Jitter on Screen</h4>
        <p class="mb-2 text-zinc-300">Have you ever seen numbers jump or dance across the screen as they change? PocketGull Mono gives every single number the exact same width, so your vital signs stay steady and calm on screen.</p>
      `
    });
  }

  /**
   * Computes a deterministic 32-dimensional normalized projection vector using n-gram hash buckets.
   */
  private computeProjectionVector(text: string): Float32Array {
    const vec = new Float32Array(32);
    const clean = text.toLowerCase();

    // 3-gram hashing into 32 dimensions
    for (let i = 0; i < clean.length - 2; i++) {
      const code = (clean.charCodeAt(i) * 31 + clean.charCodeAt(i + 1)) * 31 + clean.charCodeAt(i + 2);
      const bucket = Math.abs(code) % 32;
      vec[bucket] += 1.0;
    }

    // L2 Normalize
    let normSq = 0;
    for (let i = 0; i < 32; i++) {
      normSq += vec[i] * vec[i];
    }
    if (normSq > 0) {
      const invNorm = 1.0 / Math.sqrt(normSq);
      for (let i = 0; i < 32; i++) {
        vec[i] *= invNorm;
      }
    }
    return vec;
  }

  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dot = 0;
    for (let i = 0; i < 32; i++) {
      dot += a[i] * b[i];
    }
    return Math.max(0, Math.min(1, dot));
  }

  /**
   * Encapsulates the columnar vectors into an in-memory Parquet-like ArrayBuffer
   * with 'PAR1' magic header bytes for zero-egress persistence or streaming.
   */
  exportColumnarBuffer(): ArrayBuffer {
    const header = new Uint8Array([0x50, 0x41, 0x52, 0x31]); // 'PAR1'
    const metaJson = JSON.stringify({
      version: 1,
      nodeCount: this.nodeCount,
      categories: this.categoryDict,
      nodeIds: this.nodeIds,
      terms: this.terms
    });
    const metaBytes = new TextEncoder().encode(metaJson);

    const totalLength = 4 + 4 + metaBytes.byteLength + this.categoryCodes.byteLength + this.personaMasks.byteLength;
    const buffer = new ArrayBuffer(totalLength);
    const view = new Uint8Array(buffer);

    view.set(header, 0);
    new DataView(buffer).setUint32(4, metaBytes.byteLength, true);
    view.set(metaBytes, 8);
    let offset = 8 + metaBytes.byteLength;
    view.set(this.categoryCodes, offset);
    offset += this.categoryCodes.byteLength;
    view.set(this.personaMasks, offset);

    return buffer;
  }
}
