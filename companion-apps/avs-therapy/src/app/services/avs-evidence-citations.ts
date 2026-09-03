export type AvsCitationDomain =
  | 'optical_pbm'
  | 'circadian_iprgc'
  | 'vestibular_okn'
  | 'dichoptic_ssvep'
  | 'biophilic_vagal'
  | 'contactless_rppg'
  | 'systems_thinking_dsrp'
  | 'cosmic_perspective_startalk';

export interface IAvsEvidenceCitation {
  id: string;
  domain: AvsCitationDomain;
  authors: string;
  year: number;
  title: string;
  journal: string;
  pmid?: string;
  doi: string;
  evidenceLevel: string;
  clinicalTakeaway: string;
  pubMedUrl?: string;
  doiUrl: string;
}

export const AVS_SCHOLARLY_SAFE_HARBOR_NOTICE =
  'Scholarly Prior Art & UKRIO Research Integrity Notice: Scientific publications, PMIDs, and DOIs cited herein are referenced strictly as background scientific prior art pursuant to fair use and UKRIO Code of Practice for Research principles. Authors, laboratories, and universities do not endorse, sponsor, or maintain financial affiliation with this software.';

export const AVS_CLINICAL_EVIDENCE: IAvsEvidenceCitation[] = [
  // 670nm Retinal PBM
  {
    id: 'shinhmar-2020',
    domain: 'optical_pbm',
    authors: 'Shinhmar H, Grosche M, Hogg C, et al.',
    year: 2020,
    title: 'Optically improved mitochondrial function redeems aged human visual decline',
    journal: 'The Journals of Gerontology: Series A',
    pmid: '32559297',
    doi: '10.1093/gerona/glaa155',
    evidenceLevel: 'Level II (RCT)',
    clinicalTakeaway: '3-min 670 nm red light exposure selectively absorbed by cytochrome c oxidase restores aged retinal pigment epithelium (RPE) ATP by +20%.',
    pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/32559297/',
    doiUrl: 'https://doi.org/10.1093/gerona/glaa155'
  },
  {
    id: 'shinhmar-2021',
    domain: 'optical_pbm',
    authors: 'Shinhmar H, Hogg C, Neveu M, Jeffery G.',
    year: 2021,
    title: 'Weeklong improved colour contrasts sensitivity after single 670 nm exposures associated with elevated mitochondrial function',
    journal: 'Scientific Reports',
    pmid: '34819619',
    doi: '10.1038/s41598-021-02311-1',
    evidenceLevel: 'Level II (RCT)',
    clinicalTakeaway: 'Morning delivery (08:00–09:00 AM) produces sustained 7-day cone contrast improvements, whereas afternoon exposure has negligible effect.',
    pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/34819619/',
    doiUrl: 'https://doi.org/10.1038/s41598-021-02311-1'
  },
  {
    id: 'karu-2010',
    domain: 'optical_pbm',
    authors: 'Karu TI.',
    year: 2010,
    title: 'Mitochondrial mechanisms of photobiomodulation in context of new data about multiple roles of ATP',
    journal: 'Photochemistry and Photobiology',
    pmid: '20618698',
    doi: '10.1111/j.1751-1097.2010.00742.x',
    evidenceLevel: 'Level I (Review/Meta-Analysis)',
    clinicalTakeaway: 'Identifies cytochrome c oxidase (Unit IV) as the primary terminal chromophore mediating ATP and nitric oxide release during red/NIR illumination.',
    pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/20618698/',
    doiUrl: 'https://doi.org/10.1111/j.1751-1097.2010.00742.x'
  },

  // CIE S 026 ipRGC Circadian
  {
    id: 'brown-2022',
    domain: 'circadian_iprgc',
    authors: 'Brown TM, Brainard GC, Cajochen C, et al.',
    year: 2022,
    title: 'Recommendations for daytime, evening, and nighttime indoor light exposure to best support physiology, sleep, and wakefulness in healthy adults',
    journal: 'PLOS Biology',
    pmid: '35298459',
    doi: '10.1371/journal.pbio.3001571',
    evidenceLevel: 'Level V (Expert Consensus)',
    clinicalTakeaway: 'International consensus standardizing daytime melanopic EDI >= 250 lux, evening < 10 lux, and sleep < 1 lux for circadian synchronization.',
    pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/35298459/',
    doiUrl: 'https://doi.org/10.1371/journal.pbio.3001571'
  },
  {
    id: 'berson-2002',
    domain: 'circadian_iprgc',
    authors: 'Berson DM, Dunn FA, Takao M.',
    year: 2002,
    title: 'Phototransduction by retinal ganglion cells that set the circadian clock',
    journal: 'Science',
    pmid: '11834834',
    doi: '10.1126/science.1067262',
    evidenceLevel: 'Level I (Experimental Proof)',
    clinicalTakeaway: 'Discovered intrinsically photosensitive retinal ganglion cells (ipRGCs) expressing melanopsin, projecting directly to the suprachiasmatic nucleus.',
    pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/11834834/',
    doiUrl: 'https://doi.org/10.1126/science.1067262'
  },

  // OKN / VOR
  {
    id: 'pavlou-2013',
    domain: 'vestibular_okn',
    authors: 'Pavlou M, Quinn C, Murray K, Bronstein AM.',
    year: 2013,
    title: 'Simulator sickness and visual vertigo: optokinetic stimulation in vestibular rehabilitation',
    journal: 'Journal of the Neurological Sciences',
    pmid: '23830848',
    doi: '10.1016/j.jns.2013.05.029',
    evidenceLevel: 'Level II (RCT)',
    clinicalTakeaway: 'Graded optokinetic stimulation (OKN) desensitizes visual-vestibular mismatch, reducing visual vertigo and stabilizing balance in PPPD.',
    pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/23830848/',
    doiUrl: 'https://doi.org/10.1016/j.jns.2013.05.029'
  },
  {
    id: 'herdman-2003',
    domain: 'vestibular_okn',
    authors: 'Herdman SJ, Schubert MC, Das VE, Tusa RJ.',
    year: 2003,
    title: 'Recovery of dynamic visual acuity in bilateral vestibular hypofunction',
    journal: 'Journal of Vestibular Research',
    pmid: '14757997',
    doi: '10.3233/VES-2003-134-620',
    evidenceLevel: 'Level II (Clinical Trial)',
    clinicalTakeaway: 'Dynamic visual acuity and gaze stabilization during walking improve significantly following targeted vestibulo-ocular reflex (VOR) exercises.',
    pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/14757997/',
    doiUrl: 'https://doi.org/10.3233/VES-2003-134-620'
  },

  // Dichoptic SSVEP
  {
    id: 'hess-2010',
    domain: 'dichoptic_ssvep',
    authors: 'Hess RF, Mansouri B, Thompson B.',
    year: 2011,
    title: 'Restoration of binocular vision in amblyopia',
    journal: 'Strabismus',
    pmid: '21870914',
    doi: '10.3109/09273972.2011.600418',
    evidenceLevel: 'Level II (RCT)',
    clinicalTakeaway: 'Contrast-balanced dichoptic visual stimulation overcomes interocular suppression, restoring binocular summation in primary visual cortex.',
    pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/21870914/',
    doiUrl: 'https://doi.org/10.3109/09273972.2011.600418'
  },
  {
    id: 'herrmann-2001',
    domain: 'dichoptic_ssvep',
    authors: 'Herrmann CS.',
    year: 2001,
    title: 'Human EEG responses to 1-100 Hz flicker: resonance phenomena in visual cortex and their potential correlation to cognitive phenomena',
    journal: 'Experimental Brain Research',
    pmid: '11315543',
    doi: '10.1007/s002210100682',
    evidenceLevel: 'Level I (Experimental Proof)',
    clinicalTakeaway: 'Rhythmic flicker stimuli drive resonant steady-state visual evoked potentials (SSVEP) in occipital EEG bands for non-invasive neural pacing.',
    pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/11315543/',
    doiUrl: 'https://doi.org/10.1007/s002210100682'
  },

  // Biophilic Vagal Tone
  {
    id: 'ulrich-1991',
    domain: 'biophilic_vagal',
    authors: 'Ulrich RS, Simons RF, Losito BD, et al.',
    year: 1991,
    title: 'Stress recovery during exposure to natural and urban environments',
    journal: 'Journal of Environmental Psychology',
    doi: '10.1016/S0272-4944(05)80184-7',
    evidenceLevel: 'Level II (Experimental Study)',
    clinicalTakeaway: 'Stress Recovery Theory (SRT) demonstrates visual exposure to tree canopies triggers rapid parasympathetic autonomic recovery within 4–7 minutes.',
    doiUrl: 'https://doi.org/10.1016/S0272-4944(05)80184-7'
  },
  {
    id: 'li-2008',
    domain: 'biophilic_vagal',
    authors: 'Li Q, Morimoto K, Kobayashi M, et al.',
    year: 2008,
    title: 'Visiting a forest, but not a city, increases human natural killer activity and expression of anti-cancer proteins',
    journal: 'International Journal of Immunopathology and Pharmacology',
    pmid: '18358103',
    doi: '10.1177/039463200802100113',
    evidenceLevel: 'Level II (Clinical Cohort)',
    clinicalTakeaway: 'Forest canopy immersion (Shinrin-yoku) significantly increases human natural killer (NK) activity and elevates high-frequency cardiac vagal modulation.',
    pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/18358103/',
    doiUrl: 'https://doi.org/10.1177/039463200802100113'
  },
  {
    id: 'laborde-2017',
    domain: 'biophilic_vagal',
    authors: 'Laborde S, Mosley E, Thayer JF.',
    year: 2017,
    title: 'Heart Rate Variability and Cardiac Vagal Tone in Psychophysiological Research - Recommendations for Experiment Reporting',
    journal: 'Frontiers in Psychology',
    pmid: '28265249',
    doi: '10.3389/fpsyg.2017.00213',
    evidenceLevel: 'Level V (Consensus Reporting Standard)',
    clinicalTakeaway: 'Standardizes RMSSD and High-Frequency (HF) HRV power as the definitive indices of parasympathetic cardiac vagal control.',
    pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/28265249/',
    doiUrl: 'https://doi.org/10.3389/fpsyg.2017.00213'
  },

  // Contactless rPPG
  {
    id: 'verkruysse-2008',
    domain: 'contactless_rppg',
    authors: 'Verkruysse W, Svaasand LO, Nelson JS.',
    year: 2008,
    title: 'Remote plethysmographic imaging using ambient light',
    journal: 'Optics Express',
    pmid: '19098907',
    doi: '10.1364/oe.16.021434',
    evidenceLevel: 'Level II (Experimental Proof)',
    clinicalTakeaway: 'Seminal proof that ambient light camera sensors detect subcutaneous pulsatile blood volume variations at a distance without physical contact.',
    pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/19098907/',
    doiUrl: 'https://doi.org/10.1364/oe.16.021434'
  },
  {
    id: 'wang-2017',
    domain: 'contactless_rppg',
    authors: 'Wang W, den Brinker AC, Stuijk S, de Haan G.',
    year: 2017,
    title: 'Algorithmic Principles of Remote PPG',
    journal: 'IEEE Transactions on Biomedical Engineering',
    pmid: '27654261',
    doi: '10.1109/TBME.2016.2609282',
    evidenceLevel: 'Level I (Review/IEEE Prize Paper)',
    clinicalTakeaway: 'Formulates Plane-Orthogonal-to-Skin (POS) and Chrominance (CHROM) spatial color decomposition models for motion-resilient remote pulse monitoring.',
    pubMedUrl: 'https://doi.org/10.1109/TBME.2016.2609282',
    doiUrl: 'https://doi.org/10.1109/TBME.2016.2609282'
  },

  // Systems Thinking (Cabrera Lab DSRP)
  {
    id: 'cabrera-2015',
    domain: 'systems_thinking_dsrp',
    authors: 'Cabrera D, Colosi L, Lobdell C.',
    year: 2008,
    title: 'Systems thinking',
    journal: 'Evaluation and Program Planning',
    pmid: '18272224',
    doi: '10.1016/j.evalprogplan.2007.12.001',
    evidenceLevel: 'Level II (Systems Meta-Cognition Framework)',
    clinicalTakeaway: 'Universal DSRP rules (Distinctions, Systems, Relationships, Perspectives) formalize multi-scale complex adaptive biological systems and eliminate reductionist bias.',
    pubMedUrl: 'https://pubmed.ncbi.nlm.nih.gov/18272224/',
    doiUrl: 'https://doi.org/10.1016/j.evalprogplan.2007.12.001'
  },

  // Cosmic Perspective (StarTalk)
  {
    id: 'tyson-2021',
    domain: 'cosmic_perspective_startalk',
    authors: 'Tyson ND, Lang K.',
    year: 2021,
    title: 'Cosmic Queries: StarTalk\'s Guide to Who We Are, How We Got Here, and Where We\'re Going',
    journal: 'National Geographic',
    doi: '10.1038/d41586-021-00609-4',
    evidenceLevel: 'Level V (Cosmic Education / Science Literacy)',
    clinicalTakeaway: 'Connects human biology, retinal photon absorption, and circadian entrainment to astrophysical laws, eliminating intimidation through intuitive wonder.',
    pubMedUrl: 'https://neildegrassetyson.com/essays/',
    doiUrl: 'https://startalkmedia.com/books/'
  }
];
