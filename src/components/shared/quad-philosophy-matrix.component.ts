import { 
  Component, 
  ChangeDetectionStrategy, 
  signal, 
  computed 
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type THealingPhilosophy = 'ayurvedic' | 'tcm' | 'allopathic' | 'osteopathic';

export interface IOrganCrosswalk {
  id: string;
  name: string;
  icon: string;
  region: string;
  ayurvedic: {
    sanskritName: string;
    transliteration: string;
    chakra: string;
    chakraColor: string;
    doshaAffinity: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Tridoshic';
    marmaPoint: string;
    agniAmaState: string;
    therapeuticHerb: string;
  };
  tcm: {
    hanziName: string;
    pinyinName: string;
    zangFuPair: string;
    element: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
    elementColor: string;
    meridian: string;
    keyAcupoint: string;
    pathologyPattern: string;
  };
  allopathic: {
    latinName: string;
    icd10Code: string;
    snomedCt: string;
    hemodynamicFormula: string;
    primaryBiomarker: string;
    pharmacotherapy: string;
  };
  osteopathic: {
    somaticSegment: string;
    tartFindings: {
      tissue: string;
      asymmetry: string;
      restriction: string;
      tenderness: string;
    };
    craniosacralRhythm: string;
    fascialStrainPattern: string;
    omtTechnique: string;
  };
}

@Component({
  selector: 'app-quad-philosophy-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-slate-950/95 border border-slate-800 rounded-3xl space-y-6 text-zinc-100 shadow-2xl backdrop-blur-2xl">
      
      <!-- Header Banner -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-emerald-500 to-cyan-500 text-zinc-950 font-black flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
            🏛️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black uppercase tracking-tight text-zinc-100">
                Four Grand Healing Traditions Matrix
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                Interactive Crosswalk
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Comparative biophysical analysis translating Ayurvedic, TCM, Allopathic, and Osteopathic medicine in real time.
            </p>
          </div>
        </div>

        <!-- Active View Mode Toggle -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            (click)="focusMode.set('all')"
            [class.bg-emerald-500]="focusMode() === 'all'"
            [class.text-zinc-950]="focusMode() === 'all'"
            [class.text-zinc-400]="focusMode() !== 'all'"
            class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
          >
            🔀 4-Way Quad Matrix
          </button>
          <button
            (click)="focusMode.set('ayurvedic')"
            [class.bg-amber-500]="focusMode() === 'ayurvedic'"
            [class.text-zinc-950]="focusMode() === 'ayurvedic'"
            [class.text-zinc-400]="focusMode() !== 'ayurvedic'"
            class="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
          >
            🪷 Ayurvedic
          </button>
          <button
            (click)="focusMode.set('tcm')"
            [class.bg-emerald-500]="focusMode() === 'tcm'"
            [class.text-zinc-950]="focusMode() === 'tcm'"
            [class.text-zinc-400]="focusMode() !== 'tcm'"
            class="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
          >
            🌿 TCM
          </button>
          <button
            (click)="focusMode.set('allopathic')"
            [class.bg-rose-500]="focusMode() === 'allopathic'"
            [class.text-zinc-950]="focusMode() === 'allopathic'"
            [class.text-zinc-400]="focusMode() !== 'allopathic'"
            class="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
          >
            🩺 Allopathic
          </button>
          <button
            (click)="focusMode.set('osteopathic')"
            [class.bg-cyan-500]="focusMode() === 'osteopathic'"
            [class.text-zinc-950]="focusMode() === 'osteopathic'"
            [class.text-zinc-400]="focusMode() !== 'osteopathic'"
            class="px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
          >
            🦴 Osteopathic
          </button>
        </div>
      </div>

      <!-- Organ Selector Chips -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span class="font-bold uppercase tracking-wider">Select Anatomical Target / Organ System:</span>
          <span class="text-emerald-400">{{ activeOrgan().region }} • {{ activeOrgan().name }}</span>
        </div>

        <div class="flex flex-wrap gap-2">
          @for (organ of organCatalog; track organ.id) {
            <button
              (click)="selectOrgan(organ)"
              [class.bg-emerald-500/20]="activeOrgan().id === organ.id"
              [class.border-emerald-400]="activeOrgan().id === organ.id"
              [class.text-emerald-300]="activeOrgan().id === organ.id"
              [class.bg-slate-900]="activeOrgan().id !== organ.id"
              [class.border-slate-800]="activeOrgan().id !== organ.id"
              [class.text-zinc-400]="activeOrgan().id !== organ.id"
              class="px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition hover:border-slate-700 cursor-pointer shadow-sm"
            >
              <span>{{ organ.icon }}</span>
              <span>{{ organ.name }}</span>
            </button>
          }
        </div>
      </div>

      <!-- MAIN COMPARATIVE QUAD-MATRIX GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <!-- COLUMN 1: AYURVEDIC MEDICINE -->
        @if (focusMode() === 'all' || focusMode() === 'ayurvedic') {
          <div class="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-4 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div class="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">🪷</span>
                <div>
                  <h3 class="text-sm font-bold uppercase text-amber-300 tracking-wider">1. Ayurvedic Medicine</h3>
                  <span class="text-[10px] font-mono text-amber-400/80">त्रिदोष • Tridosha &amp; Marma</span>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                Sanskrit
              </span>
            </div>

            <!-- Sanskrit Calligramme Nomina -->
            <div class="p-4 bg-slate-950/80 rounded-xl border border-amber-500/20 text-center space-y-1">
              <div class="text-2xl font-bold font-pocketgull-notofu text-amber-200">
                {{ activeOrgan().ayurvedic.sanskritName }}
              </div>
              <div class="text-xs font-mono text-amber-400">
                {{ activeOrgan().ayurvedic.transliteration }}
              </div>
            </div>

            <!-- Ayurvedic Data Breakdown -->
            <div class="space-y-2.5 text-xs font-mono">
              <div class="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span class="text-zinc-400">Chakra Vortex:</span>
                <span class="font-bold text-amber-300 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full" [style.background-color]="activeOrgan().ayurvedic.chakraColor"></span>
                  {{ activeOrgan().ayurvedic.chakra }}
                </span>
              </div>

              <div class="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span class="text-zinc-400">Dosha Affinity:</span>
                <span class="font-bold text-amber-300">{{ activeOrgan().ayurvedic.doshaAffinity }}</span>
              </div>

              <div class="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span class="text-zinc-400">Vital Marma:</span>
                <span class="font-bold text-zinc-200">{{ activeOrgan().ayurvedic.marmaPoint }}</span>
              </div>

              <div class="p-2 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <div class="text-[10px] text-zinc-400 uppercase">Metabolic State (Agni / Ama):</div>
                <div class="text-zinc-200 text-[11px]">{{ activeOrgan().ayurvedic.agniAmaState }}</div>
              </div>

              <div class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
                <div class="text-[10px] text-amber-400 uppercase font-bold">Ayurvedic Herb / Rasayana:</div>
                <div class="text-amber-200 font-bold">{{ activeOrgan().ayurvedic.therapeuticHerb }}</div>
              </div>
            </div>
          </div>
        }

        <!-- COLUMN 2: TRADITIONAL CHINESE MEDICINE (TCM) -->
        @if (focusMode() === 'all' || focusMode() === 'tcm') {
          <div class="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div class="flex items-center justify-between border-b border-emerald-500/20 pb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">🌿</span>
                <div>
                  <h3 class="text-sm font-bold uppercase text-emerald-300 tracking-wider">2. TCM &amp; Acupuncture</h3>
                  <span class="text-[10px] font-mono text-emerald-400/80">藏象 • Zang-Fu &amp; Meridian</span>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                Hanzi / CJK
              </span>
            </div>

            <!-- Chinese Hanzi Calligramme Nomina -->
            <div class="p-4 bg-slate-950/80 rounded-xl border border-emerald-500/20 text-center space-y-1">
              <div class="text-2xl font-bold font-pocketgull-notofu text-emerald-200">
                {{ activeOrgan().tcm.hanziName }}
              </div>
              <div class="text-xs font-mono text-emerald-400">
                {{ activeOrgan().tcm.pinyinName }}
              </div>
            </div>

            <!-- TCM Data Breakdown -->
            <div class="space-y-2.5 text-xs font-mono">
              <div class="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span class="text-zinc-400">Five Elements (五行):</span>
                <span class="font-bold text-emerald-300 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full" [style.background-color]="activeOrgan().tcm.elementColor"></span>
                  {{ activeOrgan().tcm.element }}
                </span>
              </div>

              <div class="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span class="text-zinc-400">Zang-Fu Pairing:</span>
                <span class="font-bold text-emerald-300">{{ activeOrgan().tcm.zangFuPair }}</span>
              </div>

              <div class="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span class="text-zinc-400">Primary Meridian:</span>
                <span class="font-bold text-zinc-200">{{ activeOrgan().tcm.meridian }}</span>
              </div>

              <div class="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span class="text-zinc-400">Key Acupoint:</span>
                <span class="font-bold text-emerald-400">{{ activeOrgan().tcm.keyAcupoint }}</span>
              </div>

              <div class="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div class="text-[10px] text-emerald-400 uppercase font-bold">Pathology / Syndrome:</div>
                <div class="text-emerald-200 font-bold">{{ activeOrgan().tcm.pathologyPattern }}</div>
              </div>
            </div>
          </div>
        }

        <!-- COLUMN 3: ALLOPATHIC / WESTERN MEDICINE -->
        @if (focusMode() === 'all' || focusMode() === 'allopathic') {
          <div class="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div class="flex items-center justify-between border-b border-rose-500/20 pb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">🩺</span>
                <div>
                  <h3 class="text-sm font-bold uppercase text-rose-300 tracking-wider">3. Allopathic Medicine</h3>
                  <span class="text-[10px] font-mono text-rose-400/80">EHR • ICD-10 &amp; Physiology</span>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-mono">
                Latin / EBM
              </span>
            </div>

            <!-- Latin Nomina Anatomica -->
            <div class="p-4 bg-slate-950/80 rounded-xl border border-rose-500/20 text-center space-y-1">
              <div class="text-2xl font-bold font-pocketgull-notofu text-rose-200">
                {{ activeOrgan().allopathic.latinName }}
              </div>
              <div class="text-xs font-mono text-rose-400">
                ICD-10: {{ activeOrgan().allopathic.icd10Code }} • SNOMED: {{ activeOrgan().allopathic.snomedCt }}
              </div>
            </div>

            <!-- Allopathic Data Breakdown -->
            <div class="space-y-2.5 text-xs font-mono">
              <div class="p-2 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <div class="text-[10px] text-zinc-400 uppercase">Biophysical Equation / Law:</div>
                <div class="text-rose-300 font-bold text-[11px] font-mono">{{ activeOrgan().allopathic.hemodynamicFormula }}</div>
              </div>

              <div class="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span class="text-zinc-400">Lab Biomarker:</span>
                <span class="font-bold text-rose-300">{{ activeOrgan().allopathic.primaryBiomarker }}</span>
              </div>

              <div class="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1">
                <div class="text-[10px] text-rose-400 uppercase font-bold">Guideline Pharmacotherapy:</div>
                <div class="text-rose-200 font-bold">{{ activeOrgan().allopathic.pharmacotherapy }}</div>
              </div>
            </div>
          </div>
        }

        <!-- COLUMN 4: OSTEOPATHIC MEDICINE -->
        @if (focusMode() === 'all' || focusMode() === 'osteopathic') {
          <div class="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-4 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div class="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">🦴</span>
                <div>
                  <h3 class="text-sm font-bold uppercase text-cyan-300 tracking-wider">4. Osteopathic (OMT)</h3>
                  <span class="text-[10px] font-mono text-cyan-400/80">T.A.R.T. • Biomechanics &amp; PRM</span>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                Somatic Tensegrity
              </span>
            </div>

            <!-- Somatic Segment Nomina -->
            <div class="p-4 bg-slate-950/80 rounded-xl border border-cyan-500/20 text-center space-y-1">
              <div class="text-2xl font-bold font-pocketgull-notofu text-cyan-200">
                {{ activeOrgan().osteopathic.somaticSegment }}
              </div>
              <div class="text-xs font-mono text-cyan-400">
                Craniosacral PRM: {{ activeOrgan().osteopathic.craniosacralRhythm }}
              </div>
            </div>

            <!-- Osteopathic T.A.R.T. Breakdown -->
            <div class="space-y-2 text-xs font-mono">
              <div class="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                <div class="text-[10px] text-cyan-400 font-bold uppercase">T.A.R.T. Somatic Dysfunction:</div>
                <div class="grid grid-cols-2 gap-1 text-[10px]">
                  <div><span class="text-zinc-400">T:</span> {{ activeOrgan().osteopathic.tartFindings.tissue }}</div>
                  <div><span class="text-zinc-400">A:</span> {{ activeOrgan().osteopathic.tartFindings.asymmetry }}</div>
                  <div><span class="text-zinc-400">R:</span> {{ activeOrgan().osteopathic.tartFindings.restriction }}</div>
                  <div><span class="text-zinc-400">T:</span> {{ activeOrgan().osteopathic.tartFindings.tenderness }}</div>
                </div>
              </div>

              <div class="flex justify-between items-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span class="text-zinc-400">Fascial Tension:</span>
                <span class="font-bold text-cyan-300 text-[11px]">{{ activeOrgan().osteopathic.fascialStrainPattern }}</span>
              </div>

              <div class="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 space-y-1">
                <div class="text-[10px] text-cyan-400 uppercase font-bold">OMT Manipulative Modality:</div>
                <div class="text-cyan-200 font-bold">{{ activeOrgan().osteopathic.omtTechnique }}</div>
              </div>
            </div>
          </div>
        }

      </div>

      <!-- Live Clinical Synthesis Footer -->
      <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Zero-Tofu Typography Stack Active: <strong class="text-zinc-200">PocketGull VF + Noto Sans Devanagari/CJK/Latin</strong></span>
        </div>
        <div class="text-zinc-400">
          Target: <span class="text-emerald-400 font-bold">{{ activeOrgan().name }}</span> • 4 Paradigms Grounded in Peer-Reviewed Biophysics
        </div>
      </div>

    </div>
  `
})
export class QuadPhilosophyMatrixComponent {
  focusMode = signal<'all' | THealingPhilosophy>('all');

  readonly organCatalog: IOrganCrosswalk[] = [
    {
      id: 'heart',
      name: 'Heart & Myocardium',
      icon: '🫀',
      region: 'Thoracic Cavity',
      ayurvedic: {
        sanskritName: 'हृदयम् • साधक पित्त',
        transliteration: 'Hridaya (Seat of Ojas & Prana)',
        chakra: 'Anahata (Heart Chakra)',
        chakraColor: '#10b981',
        doshaAffinity: 'Pitta-Kapha',
        marmaPoint: 'Hridaya Marma (Lethal Sadyah Pranahara)',
        agniAmaState: 'Sadhaka Pitta imbalance with emotional Ama accumulation',
        therapeuticHerb: 'Terminalia arjuna (Arjuna Bark) & Ashwagandha'
      },
      tcm: {
        hanziName: '心 • 君主之官',
        pinyinName: 'Xin (Monarch of Zang-Fu)',
        zangFuPair: 'Small Intestine (小肠)',
        element: 'Fire',
        elementColor: '#ef4444',
        meridian: 'Hand Shaoyin Heart Meridian (手少阴心经)',
        keyAcupoint: 'PC-6 Neiguan (内关) & HT-7 Shenmen (神门)',
        pathologyPattern: 'Heart Qi Deficiency / Blood Stasis with Shen agitation'
      },
      allopathic: {
        latinName: 'COR • MYOCARDIUM',
        icd10Code: 'I20.9 / I25.10',
        snomedCt: '30288003',
        hemodynamicFormula: 'CO = HR × SV (Cardiac Output) • MAP = DP + 1/3(PP)',
        primaryBiomarker: 'Troponin-I, hs-CRP (<0.5 mg/L), NT-proBNP',
        pharmacotherapy: 'Beta-Blockers (Metoprolol), ACEi, Statins, ASA 81mg'
      },
      osteopathic: {
        somaticSegment: 'T1–T4 Left Paraspinal',
        tartFindings: {
          tissue: 'Boggy edema in T2-T4',
          asymmetry: 'Left rib angle prominence',
          restriction: 'T1-T4 sidebent L, rotated R',
          tenderness: 'Acute hyperalgesia over T3'
        },
        craniosacralRhythm: '10 cycles/min (Sympathicotonia)',
        fascialStrainPattern: 'Anterior thoracic myofascial tightening & subclavius strain',
        omtTechnique: 'Rib Raising, Thoracic Inlet Release, Suboccipital Decompression'
      }
    },
    {
      id: 'brain',
      name: 'Brain & Cranium',
      icon: '🧠',
      region: 'Cephalic Region',
      ayurvedic: {
        sanskritName: 'शिरस् • मस्तिष्कम्',
        transliteration: 'Shiras & Mastishka (Seat of Consciousness)',
        chakra: 'Sahasrara (Crown Chakra)',
        chakraColor: '#a855f7',
        doshaAffinity: 'Vata',
        marmaPoint: 'Adhipati Marma (Crown Vertex)',
        agniAmaState: 'Prana Vayu excitation with Tarpaka Kapha depletion',
        therapeuticHerb: 'Bacopa monnieri (Brahmi) & Gotu Kola'
      },
      tcm: {
        hanziName: '脑 • 髓之海',
        pinyinName: 'Nao (Sea of Marrow)',
        zangFuPair: 'Governing Vessel (督脉)',
        element: 'Water',
        elementColor: '#06b6d4',
        meridian: 'Du Mai Governing Channel (督脉)',
        keyAcupoint: 'GV-20 Baihui (百会) & Sishencong (四神聪)',
        pathologyPattern: 'Kidney Essence failing to nourish Sea of Marrow'
      },
      allopathic: {
        latinName: 'CEREBRUM • ENCEPHALON',
        icd10Code: 'G43.9 / G44.2',
        snomedCt: '113105001',
        hemodynamicFormula: 'CPP = MAP - ICP (Cerebral Perfusion Pressure ≥ 60 mmHg)',
        primaryBiomarker: 'Serum Neurofilament Light (NfL), S100B',
        pharmacotherapy: 'SSRIs, Triptans, GABA-mimetics, CoQ10 200mg'
      },
      osteopathic: {
        somaticSegment: 'Occiput-C1-C2 (OA & AA)',
        tartFindings: {
          tissue: 'Suboccipital hypertonicity',
          asymmetry: 'Sphenobasilar Synchondrosis (SBS) torsion',
          restriction: 'C1 rotated right on C2',
          tenderness: 'Greater occipital nerve trigger'
        },
        craniosacralRhythm: '8 cycles/min (SBS compression)',
        fascialStrainPattern: 'Dural tension tube twisting from foramen magnum to S2',
        omtTechnique: 'CV-4 (Compression of 4th Ventricle), SBS Decompression'
      }
    },
    {
      id: 'liver',
      name: 'Liver & Hepatic System',
      icon: '🫘',
      region: 'Right Hypochondrium',
      ayurvedic: {
        sanskritName: 'यकृत् • रञ्जक पित्त',
        transliteration: 'Yakrit (Seat of Ranjaka Pitta)',
        chakra: 'Manipura (Solar Plexus Chakra)',
        chakraColor: '#eab308',
        doshaAffinity: 'Pitta',
        marmaPoint: 'Mamsa Marma at right costal margin',
        agniAmaState: 'Ranjaka Pitta flare with hepatic bile sluggishness',
        therapeuticHerb: 'Phyllanthus niruri (Bhumyamalaki) & Milk Thistle'
      },
      tcm: {
        hanziName: '肝 • 将军之官',
        pinyinName: 'Gan (General of Zang-Fu)',
        zangFuPair: 'Gallbladder (胆)',
        element: 'Wood',
        elementColor: '#10b981',
        meridian: 'Foot Jueyin Liver Meridian (足厥阴肝经)',
        keyAcupoint: 'LR-3 Taichong (太冲) & LR-14 Qimen (期门)',
        pathologyPattern: 'Liver Qi Stagnation transforming into Liver Fire'
      },
      allopathic: {
        latinName: 'HEPAR • GLISSON CAPSULE',
        icd10Code: 'K76.0 / K71.9',
        snomedCt: '181277001',
        hemodynamicFormula: 'Hepatic Flow = Portal Vein (75%) + Hepatic Artery (25%)',
        primaryBiomarker: 'ALT, AST, Total Bilirubin, GGT, Ferritin',
        pharmacotherapy: 'N-Acetylcysteine (NAC), Phosphatidylcholine, UDCA'
      },
      osteopathic: {
        somaticSegment: 'T6–T9 Right Viscerosomatic',
        tartFindings: {
          tissue: 'Right paraspinal ropiness at T7',
          asymmetry: 'Right 7th-9th rib exhalation restriction',
          restriction: 'Liver fascial mobility restricted superiorly',
          tenderness: 'Chapman point in right 6th intercostal space'
        },
        craniosacralRhythm: '9 cycles/min (Hepatic congestion)',
        fascialStrainPattern: 'Coronary and triangular ligament fascial drag',
        omtTechnique: 'Hepatic Pump, Collateral Ganglion Inhibition, Celiac Plexus Release'
      }
    },
    {
      id: 'kidney',
      name: 'Kidneys & Adrenals',
      icon: '🫁',
      region: 'Retroperitoneal Cavity',
      ayurvedic: {
        sanskritName: 'वृक्क • अपान वायु',
        transliteration: 'Vrikka (Root of Ojas & Vital Fluids)',
        chakra: 'Svadhishthana (Sacral Chakra)',
        chakraColor: '#f97316',
        doshaAffinity: 'Vata-Pitta',
        marmaPoint: 'Kukundara Marma (Lumbosacral junction)',
        agniAmaState: 'Apana Vayu deficiency with urinary filtration Ama',
        therapeuticHerb: 'Tribulus terrestris (Gokshura) & Boerhavia diffusa (Punarnava)'
      },
      tcm: {
        hanziName: '肾 • 先天之本',
        pinyinName: 'Shen (Root of Pre-Heaven Essence)',
        zangFuPair: 'Urinary Bladder (膀胱)',
        element: 'Water',
        elementColor: '#0284c7',
        meridian: 'Foot Shaoyin Kidney Meridian (足少阴肾经)',
        keyAcupoint: 'KI-3 Taixi (太溪) & BL-23 Shenshu (肾俞)',
        pathologyPattern: 'Kidney Yin/Yang Deficiency failing to grasp Qi'
      },
      allopathic: {
        latinName: 'REN DEXTER ET SINISTER',
        icd10Code: 'N18.9 / E27.4',
        snomedCt: '64033007',
        hemodynamicFormula: 'eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^-1.200 × 0.9938^Age',
        primaryBiomarker: 'Serum Creatinine, Cystatin-C, Urine Albumin-to-Creatinine Ratio (UACR)',
        pharmacotherapy: 'SGLT2 inhibitors (Empagliflozin), ARBs (Losartan), Hydration'
      },
      osteopathic: {
        somaticSegment: 'T10–L1 Bilateral Paraspinal',
        tartFindings: {
          tissue: 'Psoas hypertonicity & deep thoracolumbar tightness',
          asymmetry: 'L1-L2 rotation with pelvic torsion',
          restriction: 'Limited renal fascial descent on inhalation',
          tenderness: 'Chapman point 1 inch lateral to umbilicus'
        },
        craniosacralRhythm: '8 cycles/min (Adrenal exhaustion)',
        fascialStrainPattern: 'Gerota fascia drag pulling on psoas major and quadratus lumborum',
        omtTechnique: 'Renal Fascial Mobilization, Psoas Muscle Energy, Thoracolumbar Release'
      }
    },
    {
      id: 'eye',
      name: 'Eyes & Optic Pathway',
      icon: '👁️',
      region: 'Orbital & Optic Canal',
      ayurvedic: {
        sanskritName: 'नेत्र • आलोचक पित्त',
        transliteration: 'Netra (Seat of Alochaka Pitta & Visual Fire)',
        chakra: 'Ajna (Third Eye Chakra)',
        chakraColor: '#6366f1',
        doshaAffinity: 'Pitta',
        marmaPoint: 'Apanga & Avarta Marma (Outer canthus & supraorbital notch)',
        agniAmaState: 'Alochaka Pitta dry heat with Tarpaka Kapha ocular depletion',
        therapeuticHerb: 'Triphala Ghrita (Eye Wash) & Phyllanthus emblica (Amalaki)'
      },
      tcm: {
        hanziName: '目 • 肝开窍于目',
        pinyinName: 'Mu (Liver Opens into the Eyes)',
        zangFuPair: 'Gallbladder & Liver (肝胆)',
        element: 'Wood',
        elementColor: '#10b981',
        meridian: 'Foot Jueyin Liver & Foot Taiyang Bladder Meridian',
        keyAcupoint: 'BL-1 Jingming (睛明) & GB-37 Guangming (光明)',
        pathologyPattern: 'Liver Blood failing to nourish Eyes / Liver Yang rising'
      },
      allopathic: {
        latinName: 'OCULUS • NERVUS OPTICUS (CN II)',
        icd10Code: 'H40.10 / H35.30',
        snomedCt: '81745001',
        hemodynamicFormula: 'IOP = 12–21 mmHg • Visual Angle = 5 arcmin • Optotype Stroke = 1 arcmin',
        primaryBiomarker: 'Intraocular Pressure (IOP via Goldmann), Cup-to-Disk Ratio (CDR ≤ 0.3), OCT Fovea Thickness',
        pharmacotherapy: 'Prostaglandin analogues (Latanoprost), Beta-blockers (Timolol), Lutein 10mg / Zeaxanthin 2mg'
      },
      osteopathic: {
        somaticSegment: 'Sphenoid & Frontal Bones (Orbit)',
        tartFindings: {
          tissue: 'Orbital fascial congestion & frontozygomatic restriction',
          asymmetry: 'Sphenobasilar synchondrosis (SBS) torsion pinching CN II, III, IV, VI',
          restriction: 'Restricted lateral expansion of frontal bone on cranial inhalation',
          tenderness: 'Supraorbital and infraorbital nerve notch tenderness'
        },
        craniosacralRhythm: '10 cycles/min (Orbital venous congestion)',
        fascialStrainPattern: 'Tenon capsule & common tendinous ring (Annulus of Zinn) fascial torque',
        omtTechnique: 'Frontal Lift, Sphenoid Decompression, Venous Sinus Drainage (Ophthalmic Protocol)'
      }
    }
  ];

  activeOrgan = signal<IOrganCrosswalk>(this.organCatalog[0]);

  selectOrgan(organ: IOrganCrosswalk): void {
    this.activeOrgan.set(organ);
  }
}
