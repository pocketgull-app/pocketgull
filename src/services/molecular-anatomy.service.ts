import { Injectable, signal, computed } from '@angular/core';

export type TZoomLevel = 'macro_organ' | 'tissue_histology' | 'cellular_organelle' | 'molecular_atomic';

export interface IMolecularLayer {
  level: TZoomLevel;
  zoomFactor: string;
  spatialScale: string; // e.g. "10 cm", "100 µm", "1 µm", "2 nm"
  title: string;
  biophysicalMechanism: string;
  keyMolecules: Array<{
    name: string;
    symbol: string;
    role: string;
    pdbId?: string;
    uniprotId?: string;
  }>;
  kineticEquation: string;
  opticalVisualPrompt: string;
}

export interface IGlobalAnatomyDrilldown {
  id: string;
  organName: string;
  snomedCode: string;
  clinicalSpecialty: string;
  translations: Array<{
    country: string;
    flag: string;
    language: string;
    nativeName: string;
    script: string;
    direction: 'ltr' | 'rtl';
    phoneticGuide: string;
  }>;
  layers: Record<TZoomLevel, IMolecularLayer>;
}

@Injectable({
  providedIn: 'root'
})
export class MolecularAnatomyService {
  readonly currentZoomLevel = signal<TZoomLevel>('macro_organ');
  readonly selectedOrganId = signal<string>('heart');

  readonly zoomLevels: Array<{ id: TZoomLevel; label: string; scale: string; magnification: string }> = [
    { id: 'macro_organ', label: '1. Gross Organ', scale: '10 cm', magnification: '1×' },
    { id: 'tissue_histology', label: '2. Histological Tissue', scale: '100 µm', magnification: '100×' },
    { id: 'cellular_organelle', label: '3. Cellular Organelle', scale: '1 µm', magnification: '10,000×' },
    { id: 'molecular_atomic', label: '4. Molecular & Atomic', scale: '2 nm (20 Å)', magnification: '1,000,000×' }
  ];

  readonly organs: IGlobalAnatomyDrilldown[] = [
    // 1. HEART / MYOCARDIUM
    {
      id: 'heart',
      organName: 'Heart (Myocardium)',
      snomedCode: '302509004',
      clinicalSpecialty: 'Cardiovascular Biophysics',
      translations: [
        { country: 'United States / UK', flag: '🇺🇸', language: 'English', nativeName: 'Heart (Myocardium)', script: 'Latin', direction: 'ltr', phoneticGuide: 'hɑːrt' },
        { country: 'Vatican / Scientific', flag: '🏛️', language: 'Latin', nativeName: 'COR (MYOCARDIUM)', script: 'Classical Latin', direction: 'ltr', phoneticGuide: 'kor' },
        { country: 'China', flag: '🇨🇳', language: 'Chinese (Simplified)', nativeName: '心肌 (心脏)', script: 'Hanzi', direction: 'ltr', phoneticGuide: 'xīn jī' },
        { country: 'Japan', flag: '🇯🇵', language: 'Japanese', nativeName: '心臓 (心筋)', script: 'Kanji / Kana', direction: 'ltr', phoneticGuide: 'shinzō' },
        { country: 'India', flag: '🇮🇳', language: 'Sanskrit', nativeName: 'हृदयम् (हृत्पेशी)', script: 'Devanagari', direction: 'ltr', phoneticGuide: 'hridayam' },
        { country: 'South Korea', flag: '🇰🇷', language: 'Korean', nativeName: '심장 (심근)', script: 'Hangul', direction: 'ltr', phoneticGuide: 'simjang' },
        { country: 'Saudi Arabia / UAE', flag: '🇸🇦', language: 'Arabic', nativeName: 'عضلة القلب', script: 'Arabic (RTL)', direction: 'rtl', phoneticGuide: '‘adˤalat al-qalb' },
        { country: 'Israel', flag: '🇮🇱', language: 'Hebrew', nativeName: 'שריר הלב', script: 'Hebrew (RTL)', direction: 'rtl', phoneticGuide: 'sreer ha-lev' },
        { country: 'Ukraine / Displaced', flag: '🇺🇦', language: 'Ukrainian', nativeName: 'Серце (Міокард)', script: 'Cyrillic', direction: 'ltr', phoneticGuide: 'sértse' },
        { country: 'Global Medical Blind', flag: '🌐', language: 'Braille', nativeName: '⠠⠓⠑⠁⠗⠞', script: 'Braille 8-Dot', direction: 'ltr', phoneticGuide: 'ISO/TR 11548' }
      ],
      layers: {
        macro_organ: {
          level: 'macro_organ',
          zoomFactor: '1×',
          spatialScale: '10–12 cm',
          title: 'Gross Four-Chambered Myocardial Pump',
          biophysicalMechanism: 'Frank-Starling law of the heart: end-diastolic volume stretches sarcomeres, generating stroke volume (60–100 mL/beat) against systemic vascular resistance.',
          keyMolecules: [
            { name: 'Cardiac Output', symbol: 'Q = HR × SV', role: 'Systemic Hemodynamic Perfusion' },
            { name: 'Ejection Fraction', symbol: 'LVEF ~ 55–70%', role: 'Ventricular Systolic Contractility' }
          ],
          kineticEquation: 'W_{ventricular} = \\int P \\, dV + \\frac{1}{2} m v^2',
          opticalVisualPrompt: 'Four muscular cardiac chambers with coronary vasculature and ascending aorta.'
        },
        tissue_histology: {
          level: 'tissue_histology',
          zoomFactor: '100×',
          spatialScale: '100 µm',
          title: 'Striated Cardiomyocyte Syncytium & Intercalated Discs',
          biophysicalMechanism: 'Branched, uninucleated cardiomyocytes joined end-to-end by intercalated discs containing desmosomes (mechanical tensile integrity) and gap junctions (low-resistance electrical propagation).',
          keyMolecules: [
            { name: 'Connexin-43', symbol: 'Cx43', role: 'Gap junction electrical coupling (conduction velocity ~0.5 m/s)' },
            { name: 'N-Cadherin', symbol: 'CDH2', role: 'Mechanical anchor at fascia adherens' }
          ],
          kineticEquation: 'I_{gap} = g_{gap} \\cdot (V_{cell1} - V_{cell2})',
          opticalVisualPrompt: 'Striated myocardial branching fibers with dark intercalated disc bands and central oval nuclei.'
        },
        cellular_organelle: {
          level: 'cellular_organelle',
          zoomFactor: '10,000×',
          spatialScale: '1 µm',
          title: 'Sarcolemma, T-Tubules & Sarcoplasmic Reticulum Triad',
          biophysicalMechanism: 'Excitation-Contraction (E-C) Coupling: Depolarization travels down transverse (T) tubules, opening L-type Ca2+ channels (Cav1.2), triggering massive Calcium-Induced Calcium Release (CICR) from RyR2 receptors in the sarcoplasmic reticulum.',
          keyMolecules: [
            { name: 'Ryanodine Receptor 2', symbol: 'RyR2', role: 'Sarcoplasmic Ca2+ release channel', uniprotId: 'Q92736' },
            { name: 'SERCA2a / Phospholamban', symbol: 'SERCA2a', role: 'Ca2+ reuptake pump driving diastolic relaxation', uniprotId: 'P16615' },
            { name: 'Mitochondria Cristae', symbol: 'Complex I-V', role: 'Generates 30 kg ATP/day for cardiac duty cycle' }
          ],
          kineticEquation: 'J_{CICR} = v_1 \\cdot \\frac{[\\text{Ca}^{2+}]_{cyt}^n}{K_a^n + [\\text{Ca}^{2+}]_{cyt}^n} \\cdot ([\\text{Ca}^{2+}]_{SR} - [\\text{Ca}^{2+}]_{cyt})',
          opticalVisualPrompt: 'Dense mitochondrial arrays packed between myofibrils adjacent to T-tubule membrane invaginations.'
        },
        molecular_atomic: {
          level: 'molecular_atomic',
          zoomFactor: '1,000,000×',
          spatialScale: '2 nm (20 Å)',
          title: 'Actin-Myosin Crossbridge & Troponin Complex Cycle',
          biophysicalMechanism: 'Ca2+ binds Troponin C (TnC), inducing a conformational shift in Troponin I (TnI) and Tropomyosin, unmasking myosin-binding sites on the F-actin filament. Myosin S1 head hydrolyzes ATP, executing a 70° power stroke producing 3–5 pN force.',
          keyMolecules: [
            { name: 'Cardiac Troponin I', symbol: 'cTnI', role: 'Inhibitory subunit (clinical biomarker for acute MI)', pdbId: '1J1D', uniprotId: 'P19429' },
            { name: 'Cardiac Troponin C', symbol: 'cTnC', role: 'Low-affinity EF-hand Ca2+ sensor', pdbId: '1J1D', uniprotId: 'P63316' },
            { name: 'Beta-Cardiac Myosin Heavy Chain', symbol: 'MYH7', role: 'Molecular motor executing crossbridge ATP power stroke', pdbId: '4P7H', uniprotId: 'P12883' },
            { name: 'Alpha-Cardiac Actin', symbol: 'ACTC1', role: 'Thin filament helical track', pdbId: '1ALM', uniprotId: 'P68032' }
          ],
          kineticEquation: '\\text{Actin} + \\text{Myosin}\\cdot\\text{ADP}\\cdot\\text{P}_i \\xrightarrow{\\text{Power Stroke}} \\text{Acto-Myosin} + \\text{ADP} + \\text{P}_i',
          opticalVisualPrompt: 'Alpha-helical ribbon backbone of the Troponin C-I-T heterotrimer docked onto actin with calcium ion coordination spheres.'
        }
      }
    },

    // 2. BRAIN / CEREBRUM
    {
      id: 'cerebrum',
      organName: 'Cerebrum (Telencephalon)',
      snomedCode: '83678007',
      clinicalSpecialty: 'Neurobiology & Synaptic Biophysics',
      translations: [
        { country: 'United States / UK', flag: '🇺🇸', language: 'English', nativeName: 'Cerebrum', script: 'Latin', direction: 'ltr', phoneticGuide: 'səˈriːbrəm' },
        { country: 'Vatican / Scientific', flag: '🏛️', language: 'Latin', nativeName: 'CEREBRUM', script: 'Classical Latin', direction: 'ltr', phoneticGuide: 'keˈreː.brum' },
        { country: 'China', flag: '🇨🇳', language: 'Chinese (Simplified)', nativeName: '大脑', script: 'Hanzi', direction: 'ltr', phoneticGuide: 'dà nǎo' },
        { country: 'Japan', flag: '🇯🇵', language: 'Japanese', nativeName: '大脳', script: 'Kanji / Kana', direction: 'ltr', phoneticGuide: 'dainō' },
        { country: 'India', flag: '🇮🇳', language: 'Sanskrit', nativeName: 'मस्तिष्कम्', script: 'Devanagari', direction: 'ltr', phoneticGuide: 'mastiṣkam' },
        { country: 'South Korea', flag: '🇰🇷', language: 'Korean', nativeName: '대뇌', script: 'Hangul', direction: 'ltr', phoneticGuide: 'daenoe' },
        { country: 'Saudi Arabia / UAE', flag: '🇸🇦', language: 'Arabic', nativeName: 'المخ (الدماغ)', script: 'Arabic (RTL)', direction: 'rtl', phoneticGuide: 'al-mukh' },
        { country: 'Israel', flag: '🇮🇱', language: 'Hebrew', nativeName: 'המוח הגדול', script: 'Hebrew (RTL)', direction: 'rtl', phoneticGuide: 'ha-moach ha-gadol' },
        { country: 'Ukraine / Displaced', flag: '🇺🇦', language: 'Ukrainian', nativeName: 'Головний мозок', script: 'Cyrillic', direction: 'ltr', phoneticGuide: 'holovnýj mózok' },
        { country: 'Global Medical Blind', flag: '🌐', language: 'Braille', nativeName: '⠠⠃⠗⠁⠊⠝', script: 'Braille 8-Dot', direction: 'ltr', phoneticGuide: 'ISO/TR 11548' }
      ],
      layers: {
        macro_organ: {
          level: 'macro_organ',
          zoomFactor: '1×',
          spatialScale: '15 cm',
          title: 'Cerebral Cortex & Bilateral Telencephalic Hemispheres',
          biophysicalMechanism: 'Contains ~86 billion neurons and 100 trillion synapses. Folded gyri and sulci maximize cortical surface area (2,500 cm2) within cranial constraints.',
          keyMolecules: [
            { name: 'Cerebral Blood Flow', symbol: 'CBF ~ 50 mL/100g/min', role: 'Nutrient and oxygen delivery' },
            { name: 'Intracranial Pressure', symbol: 'ICP ~ 7–15 mmHg', role: 'Monro-Kellie doctrine compliance' }
          ],
          kineticEquation: 'CPP = MAP - ICP',
          opticalVisualPrompt: 'Folded cortical gyral ribbons with middle cerebral artery arborization.'
        },
        tissue_histology: {
          level: 'tissue_histology',
          zoomFactor: '100×',
          spatialScale: '100 µm',
          title: 'Six-Layer Neocortical Laminae & Pyramidal Dendritic Trees',
          biophysicalMechanism: 'Cajal-Retzius cells, Layer V giant pyramidal neurons with long apical dendrites integrating feedforward sensory and feedback cognitive neural projections.',
          keyMolecules: [
            { name: 'Myelin Sheath', symbol: 'MBP', role: 'Oligodendrocyte insulation enabling saltatory conduction (100 m/s)' },
            { name: 'Astrocytic End-Feet', symbol: 'AQP4', role: 'Blood-Brain Barrier and glymphatic fluid clearance' }
          ],
          kineticEquation: 'v_{conduction} \\propto d_{axon} \\cdot \\text{Myelination}',
          opticalVisualPrompt: 'Golgi-stained pyramidal neurons with thorny dendritic spines in laminar cortex.'
        },
        cellular_organelle: {
          level: 'cellular_organelle',
          zoomFactor: '10,000×',
          spatialScale: '1 µm',
          title: 'Presynaptic Bouton, Synaptic Cleft & Postsynaptic Density',
          biophysicalMechanism: 'Action potential reaches presynaptic terminal, activating voltage-gated Ca2+ channels (Cav2.1). SNARE complex mediates vesicular exocytosis of Glutamate into the 20 nm synaptic cleft.',
          keyMolecules: [
            { name: 'Synaptotagmin-1', symbol: 'Syt1', role: 'Presynaptic Ca2+ sensor triggering vesicle fusion', uniprotId: 'P21579' },
            { name: 'Syntaxin / SNAP-25', symbol: 'SNARE', role: 'Membrane fusion helical zipper', pdbId: '1SFC' }
          ],
          kineticEquation: 'P_{release} \\propto [\\text{Ca}^{2+}]_{local}^4',
          opticalVisualPrompt: 'Vesicles docked at presynaptic active zone facing dense receptor cluster across synaptic cleft.'
        },
        molecular_atomic: {
          level: 'molecular_atomic',
          zoomFactor: '1,000,000×',
          spatialScale: '2 nm (20 Å)',
          title: 'NMDA / AMPA Glutamate Receptor Ion Channel Pore',
          biophysicalMechanism: 'Glutamate and Glycine bind GluN1/GluN2 tetrameric channel. Membrane depolarization expels pore-blocking Mg2+ ion, allowing Ca2+ influx that activates CaMKII, driving Long-Term Potentiation (LTP) memory consolidation.',
          keyMolecules: [
            { name: 'NMDA Receptor Subunit GluN1', symbol: 'GRIN1', role: 'Co-agonist glycine binding site', pdbId: '4PE5', uniprotId: 'Q05586' },
            { name: 'NMDA Receptor Subunit GluN2B', symbol: 'GRIN2B', role: 'Glutamate sensor and Mg2+ voltage gate', pdbId: '4PE5', uniprotId: 'Q13224' },
            { name: 'CaMKII Kinase', symbol: 'CAMK2A', role: 'Synaptic plasticity memory molecule', uniprotId: 'P11798' }
          ],
          kineticEquation: 'I_{NMDA} = g_{max} \\cdot \\frac{V - V_{rev}}{1 + \\frac{[\\text{Mg}^{2+}]_o}{3.57} \\cdot e^{-0.062 \\cdot V}}',
          opticalVisualPrompt: 'Tetrameric ionotropic pore with magnesium ion sitting in the central selectivity filter coordinate cage.'
        }
      }
    }
  ];

  readonly activeOrgan = computed(() => {
    return this.organs.find(o => o.id === this.selectedOrganId()) || this.organs[0];
  });

  readonly activeLayer = computed(() => {
    return this.activeOrgan().layers[this.currentZoomLevel()];
  });

  setOrgan(id: string): void {
    if (this.organs.some(o => o.id === id)) {
      this.selectedOrganId.set(id);
    }
  }

  setZoomLevel(level: TZoomLevel): void {
    this.currentZoomLevel.set(level);
  }

  nextZoomTier(): void {
    const keys: TZoomLevel[] = ['macro_organ', 'tissue_histology', 'cellular_organelle', 'molecular_atomic'];
    const idx = keys.indexOf(this.currentZoomLevel());
    const nextIdx = (idx + 1) % keys.length;
    this.currentZoomLevel.set(keys[nextIdx]);
  }

  prevZoomTier(): void {
    const keys: TZoomLevel[] = ['macro_organ', 'tissue_histology', 'cellular_organelle', 'molecular_atomic'];
    const idx = keys.indexOf(this.currentZoomLevel());
    const prevIdx = (idx - 1 + keys.length) % keys.length;
    this.currentZoomLevel.set(keys[prevIdx]);
  }
}
