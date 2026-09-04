import { Injectable, signal, computed, inject } from '@angular/core';
import { SocraticJargonDictionaryService } from './socratic-jargon-dictionary.service';
import { PlainLanguageGlossaryService } from './plain-language-glossary.service';
import { ParquetKnowledgeDbService, IContextChip } from './parquet-knowledge-db.service';
import { getStoredApiKey } from './secure-key';

export type DocDrillPersona = 'clinician' | 'patient';

export interface IDocDrillTopic {
  id: string;
  term: string;
  category: string;
  citation?: string;
  clinicianBrief: string;
  patientBrief: string;
  suggestedChips: string[];
  formulaOrStandard?: string;
}

export interface IDocDrillMessage {
  id: string;
  sender: 'user' | 'drill';
  content: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocDrillService {
  private readonly jargonDict = inject(SocraticJargonDictionaryService);
  private readonly plainGlossary = inject(PlainLanguageGlossaryService);
  private readonly parquetDb = inject(ParquetKnowledgeDbService);

  // ─── Reactive Signals ───
  readonly isOpen = signal<boolean>(false);
  readonly activeTopic = signal<IDocDrillTopic | null>(null);
  readonly persona = signal<DocDrillPersona>('clinician');
  readonly messages = signal<IDocDrillMessage[]>([]);
  readonly isThinking = signal<boolean>(false);

  // Computed views
  readonly currentTitle = computed(() => this.activeTopic()?.term ?? 'Evidence Focus');
  readonly currentCategory = computed(() => this.activeTopic()?.category ?? 'CLINICAL SCIENCE');
  readonly currentCitation = computed(() => this.activeTopic()?.citation ?? 'PocketGull Clinical Intelligence');
  readonly currentBrief = computed(() => {
    const topic = this.activeTopic();
    if (!topic) return '';
    return this.persona() === 'clinician' ? topic.clinicianBrief : topic.patientBrief;
  });

  // Dynamic Columnar Parquet-derived Context Chips
  readonly currentContextChips = computed<IContextChip[]>(() => {
    const topic = this.activeTopic();
    const persona = this.persona();
    const asked = this.messages().map(m => m.content);
    return this.parquetDb.queryContextChips(topic?.id, persona, asked);
  });

  readonly currentChips = computed<string[]>(() => {
    const dynamic = this.currentContextChips();
    if (dynamic.length > 0) {
      return dynamic.map(c => c.label);
    }
    return this.activeTopic()?.suggestedChips ?? [];
  });

  // ─── Knowledge Base Registry ───
  private readonly knowledgeMap: Record<string, IDocDrillTopic> = {
    'sloan': {
      id: 'sloan',
      term: 'Louise Sloan 5:1 Optotype Invariant',
      category: 'OPHTHALMOLOGY',
      citation: 'Louise L. Sloan (1959), Am J Ophthalmol 48(6):807–813',
      formulaOrStandard: 'Height = 5′ arc | Stroke = 1′ arc (55 cm near, 6 m far)',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Empirical Biophysical Invariant</h4>
        <p class="mb-2 text-zinc-300">In 1959, Dr. Louise Sloan (Wilmer Eye Institute, Johns Hopkins) standardized optotype legibility across 10 balanced glyphs (<strong>C, D, H, K, N, O, R, S, V, Z</strong>) utilizing a rigorous <strong>5:1 proportion</strong>. Total letter height subtends 5 arcminutes; stroke width and internal counter clearance subtend exactly 1 arcminute, matching human foveal cone receptor spacing.</p>
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Clinical Implementation in PocketGull</h4>
        <p class="text-zinc-300">Counters are locked to 1000 UPM TrueType geometry. During mesopic resuscitation or fatigue, Phoropter apertures dilate by <code>1.00×</code> to <code>1.35×</code> to counteract retinal blooming.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">What This Means For You</h4>
        <p class="mb-2 text-zinc-300">Dr. Louise Sloan designed letters that your eyes can read with absolute clarity even when your vision is tired, blurry, or in dim light. The shapes have extra-wide openings inside so letters like <strong>C</strong> and <strong>O</strong> never blur together into a confusing blob.</p>
        <p class="text-zinc-300">Think of it like opening window blinds to let maximum light through, keeping your numbers and medications safe to read.</p>
      `,
      suggestedChips: ['Why 55cm distance?', 'How do apertures dilate?', 'Why not standard Snellen?', 'Explain retinal blooming']
    },
    'bouma': {
      id: 'bouma',
      term: "Herman Bouma's Law of Lateral Crowding",
      category: 'NEURO-ERGONOMICS',
      citation: 'Herman Bouma (1970), Nature 226(5241):177–178',
      formulaOrStandard: 'Critical Separation: r ≈ 0.5 × eccentricity (degrees)',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Parafoveal Flanker Interference</h4>
        <p class="mb-2 text-zinc-300">Herman Bouma demonstrated that peripheral letter identification is degraded by adjacent flanker letters within a critical radius of <code>r ≈ 0.5 × eccentricity</code>. In high-acuity surgical or ICU environments, peripheral vitals blur unless lateral character tracking expands proportionally.</p>
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Aperture Compensation</h4>
        <p class="text-zinc-300">PocketGull embeds native <code>+0.12em</code> lateral tracking expansion to isolate numbers and eliminate cortical flanker masking across electronic health records.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Easy Reading Without Straining</h4>
        <p class="mb-2 text-zinc-300">When you look at one word on a screen, the words next to it can "crowd" together and look jumbled in the corners of your eyes. Scientist Herman Bouma discovered that giving numbers a tiny bit of breathing room keeps them clear.</p>
        <p class="text-zinc-300">PocketGull puts extra space around your vital signs so you don't have to squint or double-take.</p>
      `,
      suggestedChips: ['What is flanker masking?', 'Try +0.12em spacing', 'Peripheral vs foveal vision']
    },
    'ismp': {
      id: 'ismp',
      term: 'ISMP & FDA Life-Critical Disambiguation',
      category: 'PATIENT SAFETY',
      citation: 'ISMP Medication Safety Alert (2023) & FDA CDER Guidance (2016)',
      formulaOrStandard: 'Strict prohibition of trailing zeros (5 mg, NEVER 5.0 mg); cv08 / cv05 / ss02',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Eliminating 10-Fold Dosage Misreadings</h4>
        <p class="mb-2 text-zinc-300">Writing <code>5.0 mg</code> instead of <code>5 mg</code> is an ISMP-prohibited practice because a speck on glass transforms the order into <code>50 mg</code> (10-fold fatal overdose). Naked decimals (<code>.5 mg</code> instead of <code>0.5 mg</code>) carry identical mortality risks.</p>
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Embedded OpenType Safety Rules</h4>
        <ul class="list-disc pl-4 text-xs space-y-1 text-zinc-300">
          <li><strong>Slashed Zero (<code>zero</code>/<code>cv08</code>):</strong> Disambiguates numeral 0 from capital letter O.</li>
          <li><strong>Curved l (<code>cv05</code>):</strong> Outward terminal sweep prevents collision with 1 and I.</li>
          <li><strong>Serifed I (<code>ss02</code>):</strong> Bilateral cap serifs prevent confusion with lowercase l.</li>
          <li><strong>Tabular Figures (<code>tnum</code>):</strong> Fixed pitch aligns decimals vertically.</li>
        </ul>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Protecting Your Prescriptions</h4>
        <p class="mb-2 text-zinc-300">Have you ever noticed how the letter <strong>l</strong>, the capital letter <strong>I</strong>, and the number <strong>1</strong> can look almost identical in standard fonts? In a hospital, confusing those letters could cause someone to get the wrong pill or dose.</p>
        <p class="text-zinc-300">PocketGull puts a diagonal slash through every zero (0) and gives lowercase l a gentle curve, making sure nobody ever misreads your prescriptions.</p>
      `,
      suggestedChips: ['Why is 5.0 mg banned?', 'What is slashed zero?', 'Show Tall Man Lettering']
    },
    'thermal': {
      id: 'thermal',
      term: 'Bedside 203 DPI Thermal Label Physics',
      category: 'HARDWARE INTEROP',
      citation: 'Zebra ZPL II Technical Architecture P1012728-011',
      formulaOrStandard: '203 DPI = 8 dots/mm direct thermal printhead integer quantization',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Binary Printhead Constraints</h4>
        <p class="mb-2 text-zinc-300">Bedside wristband and IV bag printers operate at 203 DPI (8 dots/mm) on direct thermal paper with zero grayscale anti-aliasing. Non-quantized vector fonts dither into jagged salt-and-pepper noise, obscuring decimal points.</p>
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Integer Stem Quantization</h4>
        <p class="text-zinc-300">PocketGull's stem widths, slashed zero diagonals, and Braille dots align rigidly to 8-dot integer printhead boundaries, ensuring zero dropouts on 3.5" × 2" eMAR labels.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Bedside Wristband Safety</h4>
        <p class="mb-2 text-zinc-300">Hospital wristband printers use special heat-sensitive paper that only prints black and white dots with no shades of gray. If the font isn't designed for it, numbers can look fuzzy or broken.</p>
        <p class="text-zinc-300">PocketGull is mathematically tuned so every letter and barcode is razor-sharp on your hospital bracelet.</p>
      `,
      suggestedChips: ['Show Zebra ZPL code', 'Test Bedside Print', 'Why 203 DPI?']
    },
    'braille': {
      id: 'braille',
      term: '256 Unicode Braille Block (U+2800–U+28FF)',
      category: 'ACCESSIBILITY',
      citation: 'ISO/TR 11548 Tactile Aids & Unicode 16.0 Standard',
      formulaOrStandard: '2.5 mm dot center-to-center, 6.0 mm cell pitch',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Full 256 Tactile Codepoints</h4>
        <p class="mb-2 text-zinc-300">PocketGull natively sculpts the complete 256-glyph 8-dot and 6-dot Unicode Braille block (<code>U+2800</code> to <code>U+28FF</code>) across all superfamily weights, satisfying EU Directive 2004/27/EC pharmaceutical packaging mandates without missing-glyph tofu.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Braille For Everyone</h4>
        <p class="mb-2 text-zinc-300">PocketGull includes all 256 Braille dot patterns natively. This lets doctors, pharmacies, and medicine boxes print Braille labels side-by-side with English text so blind and low-vision patients have equal access to their health info.</p>
      `,
      suggestedChips: ['Try Braille Transcriber', 'What is 8-dot Braille?', 'ISO/TR 11548 spec']
    },
    'pbm': {
      id: 'pbm',
      term: '670nm Retinal Photobiomodulation (PBM)',
      category: 'CIRCADIAN BIOLOGY',
      citation: 'Shinhmar, Jeffery et al. (2020), J Gerontol A 75(9):e49–e52',
      formulaOrStandard: '670nm Deep-Red = Cytochrome c oxidase stimulation + 0% melanopsin suppression',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Mitochondrial ATP Restoration</h4>
        <p class="mb-2 text-zinc-300">Prof. Glen Jeffery (UCL) demonstrated that photoreceptor outer segments suffer metabolic ATP decline during fatigue. 670nm red photons excite Complex IV (cytochrome c oxidase), recharging mitochondrial membrane potential by +22% without stimulating melanopsin-expressing ipRGCs (which peak at 460–480nm).</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Resting Your Eyes at Night</h4>
        <p class="mb-2 text-zinc-300">Blue light from phones and monitors tells your brain it's daytime, ruining your sleep. Pure 670nm deep-red light does the opposite: it gives your eye cells energy while letting your natural sleep hormone (melatonin) flow freely.</p>
      `,
      suggestedChips: ['Toggle 670nm Mode now', 'What is melanopsin?', 'How does ATP increase?']
    },
    'cha2ds2-vasc': {
      id: 'cha2ds2-vasc',
      term: 'CHA₂DS₂-VASc Stroke Risk Stratification',
      category: 'CARDIOLOGY',
      citation: 'Lip GY, et al. (2010), Chest 137(2):263–272',
      formulaOrStandard: 'CHF(1) + HTN(1) + Age≥75(2) + DM(1) + Stroke(2) + Vasc(1) + Age 65-74(1) + Sex-Cat-F(1)',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Thromboembolism Probability</h4>
        <p class="mb-2 text-zinc-300">Calculates 1-year ischemic stroke risk in non-valvular atrial fibrillation. Score $\\ge 2$ in males or $\\ge 3$ in females indicates strong recommendation for direct oral anticoagulant (DOAC) therapy (Class I, Level A evidence).</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Protecting Your Brain from Clots</h4>
        <p class="mb-2 text-zinc-300">When the top chambers of your heart beat irregularly, blood can pool and form small clots. This score adds up simple health factors (like your age and blood pressure) to help your doctor decide if a blood thinner will protect you from a stroke.</p>
        <p class="text-zinc-300">A higher score just means taking extra care to keep your circulation smooth and safe.</p>
      `,
      suggestedChips: ['Why is Age 75+ worth 2 points?', 'What about HAS-BLED bleeding risk?', 'When is DOAC recommended?']
    },
    'troponin': {
      id: 'troponin',
      term: 'High-Sensitivity Cardiac Troponin (hs-cTn)',
      category: 'BIOMARKER',
      citation: 'Thygesen K, et al. Fourth Universal Definition of Myocardial Infarction (2018)',
      formulaOrStandard: '99th percentile Upper Reference Limit (URL), dynamic delta over 1–3 hours',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Myocardial Necrosis vs Strain</h4>
        <p class="mb-2 text-zinc-300">Detects nanogram-level myocardial cell membrane injury. Clinical rule-out protocols evaluate initial concentration and 1-hour/2-hour delta to differentiate acute plaque rupture (STEMI/NSTEMI) from non-ischemic myocardial strain (sepsis, PE, renal failure).</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Your Heart Muscle Protein</h4>
        <p class="mb-2 text-zinc-300">Troponin is a special protein found inside your heart muscle cells. When your heart works unusually hard or is temporarily strained, tiny amounts can spill into your bloodstream.</p>
        <p class="text-zinc-300">Doctors measure this twice a couple of hours apart to make sure your heart is resting comfortably and getting plenty of oxygen.</p>
      `,
      suggestedChips: ['What causes troponin to rise?', 'What is the 99th percentile?', 'Can strenuous exercise raise troponin?']
    },
    'egfr': {
      id: 'egfr',
      term: 'Estimated Glomerular Filtration Rate (eGFR)',
      category: 'NEPHROLOGY',
      citation: 'CKD-EPI 2021 Race-Free Creatinine Refit Equation',
      formulaOrStandard: 'eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^-1.200 × 0.9938^Age × [1.012 if female]',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Renal Clearance & Drug Dosing</h4>
        <p class="mb-2 text-zinc-300">Evaluates filtration function in mL/min/1.73m². Governs medication clearance adjustments (metformin, DOACs, ACEi/ARBs, SGLT2i) and chronic kidney disease (CKD) staging from G1 ($\ge 90$) to G5 ($< 15$).</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Your Kidney Filter Health</h4>
        <p class="mb-2 text-zinc-300">Think of your kidneys like natural coffee filters cleaning your blood. Your eGFR tells you how fast your filters are running on a scale from 0 to 100+.</p>
        <p class="text-zinc-300">Staying well hydrated with water helps your kidney filters work smoothly every single day.</p>
      `,
      suggestedChips: ['What is normal eGFR for my age?', 'How does dehydration affect eGFR?', 'Which foods help kidneys?']
    },
    'hrv': {
      id: 'hrv',
      term: 'Heart Rate Variability (rMSSD & SDNN)',
      category: 'AUTONOMIC TONE',
      citation: 'Task Force of ESC and NASPE (1996), Circulation 93(5):1043–1065',
      formulaOrStandard: 'rMSSD = √(1/N Σ(RR_i+1 - RR_i)²) — Parasympathetic vagal index',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Vagal Nerve Parasympathetic Regulation</h4>
        <p class="mb-2 text-zinc-300">Measures beat-to-beat variations in R-R intervals. Higher rMSSD reflects robust vagal parasympathetic modulation and stress recovery resilience, while suppressed HRV indicates autonomic dysregulation or sympathetic exhaustion.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Your Body’s Battery Recharge Meter</h4>
        <p class="mb-2 text-zinc-300">Your heart doesn't tick like a rigid mechanical clock; healthy hearts change their speed slightly between every beat depending on whether you're breathing in or resting.</p>
        <p class="text-zinc-300">When your HRV is higher, it means your nervous system is relaxed, well-rested, and ready to bounce back from stress.</p>
      `,
      suggestedChips: ['How can I increase my HRV?', 'Does sleep raise HRV?', 'What is rMSSD?']
    },
    'herniation': {
      id: 'herniation',
      term: 'L4–L5 Intervertebral Disc Herniation',
      category: 'BIOMECHANICS',
      citation: 'Spine (Phila Pa 1976), Edwin Smith Surgical Codex & Lumbar Biomechanics',
      formulaOrStandard: 'Nucleus pulposus extrusion with posterolateral L5 nerve root impingement',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Structural Pathology & Radiculopathy</h4>
        <p class="mb-2 text-zinc-300">Annulus fibrosus tear with nucleus pulposus extrusion compressing the traversing L5 nerve root. Evaluates dermatomal numbness on the dorsum of foot, great toe extensor weakness (extensor hallucis longus), and straight leg raise test sensitivity.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Your Back Cushion</h4>
        <p class="mb-2 text-zinc-300">Between your spinal bones are soft, jelly-filled cushions called discs that absorb shocks when you walk or bend. Sometimes, a cushion gets squeezed and pushes slightly against a nearby nerve, causing tingling or aching down your leg.</p>
        <p class="text-zinc-300">Gentle walking, physical therapy, and resting in comfortable positions usually allow the cushion to calm down naturally.</p>
      `,
      suggestedChips: ['What exercises help L4-L5?', 'When is an MRI needed?', 'Conservative vs surgical timeline']
    },
    'noto': {
      id: 'noto',
      term: 'Google Noto Sans (Universal Multi-Script Lineage)',
      category: 'TYPOGRAPHIC HERITAGE',
      citation: 'Google Fonts, Monotype, & Adobe — SIL Open Font License (OFL 1.1)',
      formulaOrStandard: 'Universal Unicode Multi-Script Coverage ("No More Tofu")',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Pan-Unicode Script Cohesion</h4>
        <p class="mb-2 text-zinc-300">Google Noto Sans established the global open-source gold standard for universal multi-script typographic harmony and the landmark "No more tofu" mission. PocketGull's international clinical coverage acknowledges Noto's zero-tofu architecture, adapting its multi-script baseline alignment ($y = 720$ cap-height locked) for Pan-Asian CJK and Indic Devanagari medical records.</p>
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Licensing & Open Source Lineage</h4>
        <p class="text-zinc-300">Distributed under the SIL Open Font License 1.1, Noto's open ethos enables global healthcare equity and interoperability without restrictive proprietary font licensing barriers.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">A World Where No Letters Go Missing</h4>
        <p class="mb-2 text-zinc-300">Google created the Noto font family with a simple, inspiring mission: <strong>"No more tofu"</strong>—referring to those blank white boxes (▯) that show up when a screen can't display a character from another language.</p>
        <p class="text-zinc-300">PocketGull builds upon this open-source heritage so that medical charts, prescriptions, and patient names render cleanly across every language and script in the world.</p>
      `,
      suggestedChips: ['What is "No More Tofu"?', 'Which world scripts are supported?', 'What is the SIL Open Font License?']
    },
    'ember': {
      id: 'ember',
      term: 'Amazon Ember / Dalton Maag (Humanist Grotesque Lineage)',
      category: 'TYPOGRAPHIC HERITAGE',
      citation: 'Dalton Maag Ltd. — Humanist Grotesque Interface Typography',
      formulaOrStandard: 'Open aperture geometry, humanist stroke modulation, high-stress digital legibility',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Humanist Grotesque Ergonomics</h4>
        <p class="mb-2 text-zinc-300">Engineered by legendary type foundry Dalton Maag, Amazon Ember set benchmark standards for digital interface clarity across Kindle e-ink, mobile tablets, and ambient displays. PocketGull cites Ember's warm humanist proportions, generous counter apertures, and organic terminal curvature as foundational influences that counteract clinician visual fatigue during 12-hour shifts.</p>
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Clinical Acuity Synthesis</h4>
        <p class="text-zinc-300">PocketGull elevates this humanist lineage by embedding Louise Sloan 5:1 optotype ratios, ISMP slashed zeroes (<code>cv08</code>), and 256 Unicode Braille codepoints for mission-critical medical applications.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Warmth Meets Clarity</h4>
        <p class="mb-2 text-zinc-300">Amazon Ember was crafted by Dalton Maag to feel friendly, natural, and effortless to read across millions of screens worldwide. Instead of looking cold or mechanical, its letter shapes have a gentle, human touch.</p>
        <p class="text-zinc-300">PocketGull embraces this warmth so that your health information feels comforting, clear, and reassuring whenever you check your care plan.</p>
      `,
      suggestedChips: ['Who is Dalton Maag?', 'What makes a font "humanist"?', 'How do open apertures reduce eye fatigue?']
    },
    'pair': {
      id: 'pair',
      term: 'Google PAIR Data Cards & Healthsheets',
      category: 'AI ETHICS & TRANSPARENCY',
      citation: 'Pushkarna et al. (ACM FAccT 2022) & Rostamzadeh et al. (arXiv:2202.13028)',
      formulaOrStandard: 'Structured, purpose-driven transparency artifacts for clinical datasets & CDS models',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Human-Centered Model & Data Provenance</h4>
        <p class="mb-2 text-zinc-300">Google\'s People + AI Research (PAIR) team established the global standard for documentation artifacts in clinical machine learning (ACM FAccT \'22). The companion Healthsheet framework adapts these principles specifically for healthcare datasets to prevent opaque "black-box" decision support.</p>
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">PocketGull Implementation</h4>
        <p class="text-zinc-300">Every biometric invariant (5:1 Sloan), typography rule (ISMP slashed zero), and clinical scoring engine in PocketGull ships with explicit data provenance, documented clinical boundaries, zero-egress HIPAA declarations, and falsifiable null-hypothesis testing.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Total Transparency About How AI Helps You</h4>
        <p class="mb-2 text-zinc-300">Think of a PAIR Data Card like a detailed nutrition facts label on food, but for artificial intelligence and healthcare software.</p>
        <p class="text-zinc-300">It explains exactly what data was used, how safety was tested, what the system is good at, and where a human doctor must always make the final decision. Nothing is hidden in a "black box."</p>
      `,
      suggestedChips: ['What is a PAIR Data Card?', 'How do Healthsheets work in clinical CDS?', 'Why is transparency essential in medicine?']
    },
    'pemda-p': {
      id: 'pemda-p',
      term: 'PEMDA+ (P): Primary Intent & Tactile Inking',
      category: 'PEMDA_PLUS',
      citation: 'PocketGull Clinical Typography Specification §1 (2026)',
      formulaOrStandard: 'Parenthetical boundary: Human gesture precedes algorithmic automation',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Foundational Human Gesture</h4>
        <p class="mb-2 text-zinc-300">Like parentheses in arithmetic that govern execution priority, (P) Primary Intent establishes that human touch, physician-patient intimacy, and felt-marker cardstock handwriting are the foundational anchor of healthcare before computational layers intervene.</p>
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Clinical Implementation</h4>
        <p class="text-zinc-300">PocketGull utilizes genuine scanned marker inkings with micro-modulations to ground electronic health records in human authenticity rather than sterile corporate geometry.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">The Warmth of a Real Human Touch</h4>
        <p class="mb-2 text-zinc-300">When you visit a doctor, the most reassuring moment is often when they write a caring note by hand. (P) Primary Intent keeps that warm, handmade feeling in every corner of PocketGull so technology never feels cold or distant.</p>
      `,
      suggestedChips: ['Why felt-marker ink?', 'Human gesture vs synthetic design', 'How does design reduce patient anxiety?']
    },
    'pemda-e': {
      id: 'pemda-e',
      term: 'PEMDA+ [E]: Empirical Optics & Exponential Clarity',
      category: 'PEMDA_PLUS',
      citation: 'Louise Sloan (1959) & Herman Bouma (1970)',
      formulaOrStandard: 'Optotype 5:1 Grid + Bouma Radius r ≈ 0.5 × eccentricity',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Biophysical Mathematical Foundation</h4>
        <p class="mb-2 text-zinc-300">Just as Exponents multiply power, [E] Empirical Optics powers clinical readability through Louise Sloan 5:1 optotype proportions and Bouma lateral spacing, scientifically counteracting retinal bloom and parafoveal crowding.</p>
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Optotypic Invariant</h4>
        <p class="text-zinc-300">Text resolves cleanly at LogMAR 0.0 (Snellen 20/20) at 50–70cm reading distances across constrained COW workstations and high-stress ICU monitors.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Letters Tested by Eye Scientists</h4>
        <p class="mb-2 text-zinc-300">Every number and word is mathematically spaced so that even in dim room lighting or when your eyes feel tired, you can read your vitals clearly without squinting.</p>
      `,
      suggestedChips: ['Louise Sloan 5:1 grid proof', 'Bouma lateral crowding law', 'Why 50-70cm reading distance?']
    },
    'pemda-m': {
      id: 'pemda-m',
      term: 'PEMDA+ {M}: Multi-Style Superfamily Hierarchy',
      category: 'PEMDA_PLUS',
      citation: 'PocketGull Typeface Architecture Standard (2026)',
      formulaOrStandard: 'Harmonized 4-master hierarchy: Bold 700, Fineliner 400, Chiseltip 900, Mono 400',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Multiplicative Structural Clarity</h4>
        <p class="mb-2 text-zinc-300">Multiplication expands capacity. {M} establishes a complete 4-style superfamily where Bold provides focal fixation, Fineliner offers clean editorial prose, Chiseltip anchors high-acuity alerts, and Mono locks ICU vitals to fixed 600 UPM pitch.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Clear Visual Organization</h4>
        <p class="mb-2 text-zinc-300">Different weights guide your eyes naturally—important warnings stand out in bold, while details and stories are gentle and easy to read.</p>
      `,
      suggestedChips: ['Explore the 4 font masters', 'Why fixed-pitch monospace for vitals?', 'Focal fixation design']
    },
    'pemda-d': {
      id: 'pemda-d',
      term: 'PEMDA+ {D}: Disambiguation Safety & Division',
      category: 'PEMDA_PLUS',
      citation: 'ISMP Medication Safety Alert & FDA CDER Guideline',
      formulaOrStandard: 'Division of error vectors: cv08 (slashed 0), cv05 (curved l), ss02 (serifed I)',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Dividing Clinical Error Vectors</h4>
        <p class="mb-2 text-zinc-300">Division eliminates confusable pairs. {D} separates <code>0</code> from <code>O</code> via slashed zeros, <code>1</code> from <code>l</code> via curved stems, and <code>I</code> from <code>l</code> via bilateral serifs to eradicate fatal 10-fold dosage errors.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Zero Confusion on Numbers</h4>
        <p class="mb-2 text-zinc-300">A slashed zero (0) and distinct letters guarantee that medication instructions can never be mistaken or misread.</p>
      `,
      suggestedChips: ['ISMP slashed zero rules', 'Curved l vs number 1', 'Preventing 10-fold dosage errors']
    },
    'pemda-a': {
      id: 'pemda-a',
      term: 'PEMDA+ (A): Universal Accessibility & Addition',
      category: 'PEMDA_PLUS',
      citation: 'WCAG AAA Standard & Unicode Consortium U+2800',
      formulaOrStandard: 'Addition of inclusive modalities: 256 Braille Glyphs + 7:1 Contrast',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Additive Inclusivity Modality</h4>
        <p class="mb-2 text-zinc-300">Addition brings in every reader. (A) integrates the entire 256-glyph Unicode Braille block directly into the font alongside WCAG AAA 7:1 obsidian contrast and Fitts\'s Law 44px hitboxes.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Designed for Everyone</h4>
        <p class="mb-2 text-zinc-300">Whether reading on a bright tablet or with low vision, high-contrast colors and built-in Braille ensure care instructions are accessible to all.</p>
      `,
      suggestedChips: ['Unicode Braille matrix', 'WCAG AAA 7:1 contrast ratio', 'Fitts law 44px touch targets']
    },
    'pemda-plus': {
      id: 'pemda-plus',
      term: 'PEMDA+ (+): The Quiet Workshop Voice & Human Healing',
      category: 'PEMDA_PLUS',
      citation: 'Rachel Nabors Ethical Motion Standard (2026)',
      formulaOrStandard: 'Bio-rhythmic 0.1 Hz parasympathetic breathing resonance (4s in / 6s out)',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">The Calming Clinical Transference</h4>
        <p class="mb-2 text-zinc-300">The (+) is the transcendent summation of the entire hierarchy: communicating with quiet craftsmanship, reassuring clinical clarity, and bio-rhythmic 0.1 Hz motion that soothes the autonomic nervous system.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Peaceful Healing Rhythm</h4>
        <p class="mb-2 text-zinc-300">Gentle pulses match a slow, calming breath (4 seconds in, 6 seconds out) to help ease stress and screen apnea while you review your health.</p>
      `,
      suggestedChips: ['0.1 Hz parasympathetic breathing', 'Counteracting screen apnea', 'The Quiet Workshop voice']
    }
  };

  /**
   * Open the Doc Drill drawer for a specific term or concept.
   */
  openDrill(term: string, options?: { category?: string; persona?: DocDrillPersona; context?: string }): void {
    if (!term || !term.trim()) return;

    const trimmed = term.trim();
    if (options?.persona) {
      this.persona.set(options.persona);
    }

    const resolved = this.resolveTopic(trimmed, options?.category, options?.context);
    this.activeTopic.set(resolved);
    this.messages.set([]);
    this.isThinking.set(false);
    this.isOpen.set(true);
  }

  /**
   * Close the Doc Drill drawer.
   */
  close(): void {
    this.isOpen.set(false);
  }

  /**
   * Toggle between clinician and patient persona.
   */
  setPersona(persona: DocDrillPersona): void {
    this.persona.set(persona);
  }

  /**
   * Send a follow-up question in the active topic conversation.
   */
  async askQuestion(query: string): Promise<void> {
    if (!query || !query.trim()) return;
    const cleanQuery = query.trim();

    const userMsg: IDocDrillMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      content: cleanQuery,
      timestamp: Date.now()
    };
    this.messages.update(m => [...m, userMsg]);
    this.isThinking.set(true);

    const apiKey = getStoredApiKey();
    const topic = this.activeTopic();
    const currentPersona = this.persona();

    if (apiKey && topic) {
      try {
        const aiResponse = await this.callGeminiEducator(cleanQuery, topic, currentPersona, apiKey);
        this.addDrillResponse(aiResponse);
        return;
      } catch (err) {
        console.warn('[DocDrillService] Gemini completion error, using local reasoning fallback:', err);
      }
    }

    // 1. Check in-browser Parquet columnar knowledge database for authoritative curated answer
    const parquetAnswer = this.parquetDb.resolveChipAnswer(cleanQuery, topic?.id, currentPersona);
    if (parquetAnswer) {
      setTimeout(() => {
        this.addDrillResponse(parquetAnswer);
      }, 160);
      return;
    }

    // 2. Local Socratic heuristic fallback
    setTimeout(() => {
      const localResponse = this.generateLocalSocraticAnswer(cleanQuery, topic, currentPersona);
      this.addDrillResponse(localResponse);
    }, 280);
  }

  private addDrillResponse(content: string): void {
    const drillMsg: IDocDrillMessage = {
      id: `d_${Date.now()}`,
      sender: 'drill',
      content,
      timestamp: Date.now()
    };
    this.messages.update(m => [...m, drillMsg]);
    this.isThinking.set(false);
  }

  /**
   * Resolve a topic from internal registry, or fallback to Jargon/PlainGlossary dictionaries.
   */
  private resolveTopic(term: string, category?: string, context?: string): IDocDrillTopic {
    const lower = term.toLowerCase();

    // Check direct keys
    for (const [key, topic] of Object.entries(this.knowledgeMap)) {
      if (lower.includes(key) || key.includes(lower)) {
        return topic;
      }
    }

    // Check semantic synonyms
    if (lower.includes('sloan') || lower.includes('optotype') || lower.includes('acuity')) return this.knowledgeMap['sloan'];
    if (lower.includes('bouma') || lower.includes('crowd') || lower.includes('lateral')) return this.knowledgeMap['bouma'];
    if (lower.includes('ismp') || lower.includes('slash') || lower.includes('trailing zero')) return this.knowledgeMap['ismp'];
    if (lower.includes('thermal') || lower.includes('203') || lower.includes('zpl') || lower.includes('zebra')) return this.knowledgeMap['thermal'];
    if (lower.includes('braille') || lower.includes('tactile')) return this.knowledgeMap['braille'];
    if (lower.includes('pbm') || lower.includes('670') || lower.includes('photobio')) return this.knowledgeMap['pbm'];
    if (lower.includes('cha2ds2') || lower.includes('afib') || lower.includes('stroke risk')) return this.knowledgeMap['cha2ds2-vasc'];
    if (lower.includes('trop') || lower.includes('c-tn') || lower.includes('infarct')) return this.knowledgeMap['troponin'];
    if (lower.includes('egfr') || lower.includes('kidney') || lower.includes('renal') || lower.includes('glomerular')) return this.knowledgeMap['egfr'];
    if (lower.includes('hrv') || lower.includes('variability') || lower.includes('vagal')) return this.knowledgeMap['hrv'];
    if (lower.includes('hernia') || lower.includes('l4') || lower.includes('l5') || lower.includes('disc')) return this.knowledgeMap['herniation'];
    if (lower.includes('noto') || lower.includes('tofu')) return this.knowledgeMap['noto'];
    if (lower.includes('ember') || lower.includes('dalton') || lower.includes('maag')) return this.knowledgeMap['ember'];
    if (lower.includes('pair') || lower.includes('data card') || lower.includes('datacard') || lower.includes('healthsheet') || lower.includes('transparency')) return this.knowledgeMap['pair'];
    if (lower.includes('pemda-p') || lower.includes('primary intent') || lower.includes('felt-marker') || lower.includes('inking')) return this.knowledgeMap['pemda-p'];
    if (lower.includes('pemda-e') || lower.includes('empirical optics') || lower.includes('exponential clarity')) return this.knowledgeMap['pemda-e'];
    if (lower.includes('pemda-m') || lower.includes('multi-style') || lower.includes('superfamily hierarchy')) return this.knowledgeMap['pemda-m'];
    if (lower.includes('pemda-d') || lower.includes('disambiguation safety') || lower.includes('division')) return this.knowledgeMap['pemda-d'];
    if (lower.includes('pemda-a') || lower.includes('universal accessibility') || lower.includes('addition')) return this.knowledgeMap['pemda-a'];
    if (lower.includes('pemda-plus') || lower.includes('pemda+') || lower.includes('quiet workshop') || lower.includes('human healing')) return this.knowledgeMap['pemda-plus'];
    if (lower.includes('pemda')) return this.knowledgeMap['pemda-plus'];

    // Check SocraticJargonDictionaryService
    const jargonDef = this.jargonDict.getDefinition(term);
    if (jargonDef) {
      return {
        id: term.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        term: `${jargonDef.term} (${jargonDef.shortLabel})`,
        category: jargonDef.category,
        citation: 'PocketGull Socratic Jargon Dictionary',
        clinicianBrief: `
          <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Technical Overview</h4>
          <p class="mb-2 text-zinc-300">${jargonDef.technicalDetails}</p>
          <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Clinical Directive</h4>
          <p class="text-zinc-300">${jargonDef.actionableAdvice}</p>
        `,
        patientBrief: `
          <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">In Plain English</h4>
          <p class="mb-2 text-zinc-300">${jargonDef.plainEnglishDefinition}</p>
          <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">What You Can Do</h4>
          <p class="text-zinc-300">${jargonDef.actionableAdvice}</p>
        `,
        suggestedChips: ['How does this affect my plan?', 'Are there forms to file?', 'Who should I contact?']
      };
    }

    // Default synthesis
    return {
      id: term.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      term,
      category: category || 'CLINICAL SCIENCE',
      citation: 'PocketGull Universal Knowledge Base',
      clinicianBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Clinical Focus: ${term}</h4>
        <p class="mb-2 text-zinc-300"><strong>${term}</strong> is an active clinical parameter or diagnostic entity evaluated within the current patient care plan trajectory.</p>
        <p class="text-zinc-300">Use the query bar below or select a chip to explore underlying physiological pathways, evidence grades, and risk equations.</p>
      `,
      patientBrief: `
        <h4 class="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Understanding: ${term}</h4>
        <p class="mb-2 text-zinc-300"><strong>${term}</strong> is part of your medical record. Our care plan engine keeps track of it to help your doctors provide the best personalized care.</p>
        <p class="text-zinc-300">Ask any question below to learn what this means for your daily health and wellness.</p>
      `,
      suggestedChips: ['What does this mean for my health?', 'What questions should I ask my doctor?', 'What are the normal ranges?']
    };
  }

  /**
   * Generates a local instant Socratic response when offline or without an API key.
   */
  private generateLocalSocraticAnswer(query: string, topic: IDocDrillTopic | null, persona: DocDrillPersona): string {
    const q = query.toLowerCase();
    const t = topic?.term ?? 'this concept';

    if (persona === 'patient') {
      if (q.includes('normal') || q.includes('range') || q.includes('safe')) {
        return `Healthy ranges vary from person to person based on your age, gender, and daily physical activity. When reviewing your numbers with your doctor, ask them what your personal baseline is rather than worrying about small day-to-day changes.`;
      }
      if (q.includes('doctor') || q.includes('ask') || q.includes('question')) {
        return `Here are two great questions to ask your doctor:
1. *"How does this number compare to my results from last visit?"*
2. *"Is there a simple lifestyle habit—like drinking more water or walking 15 minutes a day—that will help keep this in my optimal zone?"*`;
      }
      return `Think of <strong>${t}</strong> as a helpful dashboard gauge on a car. Seeing this number gives you and your care team valuable insight into how your body is resting, digesting, and recovering. You don't have to navigate it alone—your doctor is there to guide you at every step!`;
    }

    // Clinician response
    if (q.includes('trailing zero') || q.includes('5.0') || q.includes('ismp')) {
      return `<strong>ISMP Zero-Error Rationale:</strong> Writing <code>5.0 mg</code> creates a fatal 10-fold overdose hazard because a faint watermark, display glare, or smudge on glass transforms the order into <code>50 mg</code>. In contrast, <code>5 mg</code> and <code>0.5 mg</code> (leading zero required) prevent misinterpretation across both digital EHRs and 203 DPI bedside thermal wristband printers.`;
    }
    if (q.includes('bouma') || q.includes('flanker') || q.includes('crowd')) {
      return `<strong>Bouma Lateral Clearance:</strong> The critical distance <code>r ≈ 0.5 × θ</code> dictates that flanker items spaced closer than half the eccentricity angle in degrees will blend into indistinguishable cortical textures. Adding <code>+0.12em</code> letter spacing guarantees spatial isolation in parafoveal HUD scanning.`;
    }
    if (q.includes('sloan') || q.includes('snellen') || q.includes('5:1')) {
      return `<strong>Louise Sloan 5:1 Invariant:</strong> At 55 cm (near reading) and 6 m (far testing), a 5 arcminute letter with 1 arcminute stroke width corresponds to 20/20 Snellen (LogMAR 0.0). Sloan's 10 letters balance perceptual difficulty equally across the optotype set, unlike Snellen's unequal legibility factors.`;
    }
    return `<strong>Clinical Synthesis regarding "${query}" for ${t}:</strong>
PocketGull couples high-throughput evidence grounding with deterministic safety invariants. For clinical telemetry, metrics are evaluated against population baselines ($p < 0.05$ thresholding) and mapped strictly to FHIR R4 standard terminologies (LOINC/SNOMED-CT).`;
  }

  /**
   * Calls Google Gemini Live/Flash with the Socratic clinical educator prompt.
   */
  private async callGeminiEducator(query: string, topic: IDocDrillTopic, persona: DocDrillPersona, apiKey: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = persona === 'clinician'
      ? `You are the PocketGull Doc Drill Clinical Socratic Educator embedded in the PocketGull Clinical Care Plan Engine.
Provide an authoritative, high-density, evidence-grounded clinical answer.
- Reference exact pathophysiology, biophysical formulas, p-values, or Cochrane Risk of Bias where appropriate.
- Adhere strictly to ISMP safety standards (no trailing zeros, slashed zero cv08, curved l cv05).
- Keep length to 2-3 focused paragraphs using markdown bolding and code blocks.`
      : `You are the PocketGull Doc Drill Patient Educator.
Your voice is warm, reassuring, calm, and conversational ("The Quiet Workshop Voice").
- Explain the concept in 5th-grade plain language using clear, friendly analogies ("Teaspoon explanations").
- Soothe health anxiety; never alarm or diagnose.
- Suggest 2 actionable questions for the patient to ask their physician.
- Keep length to 2 short paragraphs.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: `Topic: ${topic.term} (${topic.category})\nPersona: ${persona}\nQuestion: ${query}` }]
      }
    ];

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.65, maxOutputTokens: 600 }
      })
    });

    if (!resp.ok) {
      throw new Error(`Gemini API returned ${resp.status}`);
    }

    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
  }
}
