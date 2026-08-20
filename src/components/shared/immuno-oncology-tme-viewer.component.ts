import { 
  Component, 
  ChangeDetectionStrategy, 
  signal, 
  computed, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  OnDestroy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

export interface IGrantOpportunity {
  id: string;
  paradigm: 'Allopathic' | 'Ayurvedic' | 'TCM' | 'Osteopathic' | 'Integrative / Multi-Center';
  agency: string;
  grantMechanism: string;
  title: string;
  awardCeiling: string;
  focusArea: string;
  applicationKeywords: string[];
  scientificRationale: string;
}

@Component({
  selector: 'app-immuno-oncology-tme-viewer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-slate-950/95 border border-rose-500/30 rounded-3xl space-y-6 text-zinc-100 shadow-2xl backdrop-blur-2xl">
      
      <!-- Top Title & Immuno-Oncology Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-amber-500 to-indigo-600 text-zinc-950 font-black flex items-center justify-center text-2xl shadow-lg shadow-rose-500/20">
            🎯
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black uppercase tracking-tight text-zinc-100">
                Immuno-Oncology 3D TME &amp; Multi-Paradigm Grant Lab
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold uppercase">
                TME Biophysics &amp; Grants
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Real-time 3D simulation of PD-1/PD-L1 checkpoint blockade, tumor angiogenesis (VEGF), and the Warburg Effect cross-referenced with global research grant mechanisms.
            </p>
          </div>
        </div>

        <!-- Mode Switcher -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono">
          <button
            (click)="activeTab.set('3d-tme')"
            [class.bg-rose-500]="activeTab() === '3d-tme'"
            [class.text-zinc-950]="activeTab() === '3d-tme'"
            [class.text-zinc-400]="activeTab() !== '3d-tme'"
            class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
          >
            🔬 3D Tumor Microenvironment
          </button>
          <button
            (click)="activeTab.set('grants')"
            [class.bg-rose-500]="activeTab() === 'grants'"
            [class.text-zinc-950]="activeTab() === 'grants'"
            [class.text-zinc-400]="activeTab() !== 'grants'"
            class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
          >
            🏛️ Multi-Paradigm Grant Matrix
          </button>
        </div>
      </div>

      <!-- Real-Time Immuno-Oncology Telemetry HUD -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <div class="text-[10px] text-zinc-400 uppercase font-bold">T-Cell Lysis Rate</div>
          <div class="text-lg font-black text-emerald-400 flex items-baseline gap-1">
            <span>{{ computedCytotoxicity() }}%</span>
            <span class="text-[10px] text-zinc-400">{{ antiPd1Active() ? '(Active)' : '(Cloaked)' }}</span>
          </div>
        </div>

        <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <div class="text-[10px] text-zinc-400 uppercase font-bold">Microenvironment pH</div>
          <div class="text-lg font-black" [class.text-rose-400]="computedPh() < 6.8" [class.text-emerald-400]="computedPh() >= 7.2">
            pH {{ computedPh() }}
          </div>
        </div>

        <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <div class="text-[10px] text-zinc-400 uppercase font-bold">Extracellular Lactate</div>
          <div class="text-lg font-black text-amber-400">
            {{ computedLactate() }} <span class="text-[10px] text-zinc-400">mM</span>
          </div>
        </div>

        <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <div class="text-[10px] text-zinc-400 uppercase font-bold">Angiogenesis (MVD)</div>
          <div class="text-lg font-black text-cyan-400">
            {{ computedMvd() }} <span class="text-[10px] text-zinc-400">vessels/mm²</span>
          </div>
        </div>

        <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <div class="text-[10px] text-zinc-400 uppercase font-bold">Tumor Apoptosis</div>
          <div class="text-lg font-black text-indigo-400">
            {{ computedApoptosisRate() }}%
          </div>
        </div>

        <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <div class="text-[10px] text-zinc-400 uppercase font-bold">Grant Fit Score</div>
          <div class="text-lg font-black text-teal-300">
            96.4 <span class="text-[10px] text-zinc-400">/ 100</span>
          </div>
        </div>
      </div>

      <!-- VIEW 1: 3D WEBGL IMMUNO-ONCOLOGY TME SCENE -->
      @if (activeTab() === '3d-tme') {
        <div class="space-y-4 animate-in fade-in duration-300 font-mono text-xs">
          
          <!-- 3D Toolbar -->
          <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full" [class.bg-emerald-400]="antiPd1Active()" [class.bg-rose-500]="!antiPd1Active()"></span>
              <span class="text-zinc-200">
                Checkpoint State: 
                <strong [class.text-emerald-300]="antiPd1Active()" [class.text-rose-400]="!antiPd1Active()">
                  {{ antiPd1Active() ? '🛡️ ANTI-PD-1 BLOCKADE ACTIVE (Immune Activated)' : '🔒 TUMOR PD-L1 EVASION (Immune Paralyzed)' }}
                </strong>
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                (click)="toggleAntiPd1()"
                [class.bg-emerald-500]="!antiPd1Active()"
                [class.bg-rose-500]="antiPd1Active()"
                class="px-4 py-1.5 rounded-xl font-bold text-zinc-950 transition cursor-pointer shadow-md"
              >
                {{ antiPd1Active() ? 'Remove Anti-PD-1 mAb' : '💉 Apply Anti-PD-1 mAb (Pembrolizumab)' }}
              </button>
            </div>
          </div>

          <!-- WebGL 3D Canvas -->
          <div class="relative w-full h-[460px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
            <canvas #tmeCanvas class="w-full h-full cursor-grab active:cursor-grabbing"></canvas>

            <!-- Holographic Callout Overlay -->
            <div class="absolute top-4 left-4 p-3.5 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl font-mono text-[11px] space-y-1 pointer-events-none max-w-sm">
              <div class="text-rose-400 font-bold flex items-center gap-1.5">
                <span>🔴</span>
                <span>Tumor Microenvironment (TME) Architecture</span>
              </div>
              <div class="text-zinc-300 text-[10px]">
                Malignant Spheroid • Cytotoxic CD8+ T-Cell Synapse • Sprouting VEGF Angiogenesis
              </div>
              <div class="text-amber-300/90 text-[10px] pt-1 border-t border-slate-800">
                The Warburg Effect: Aerobic Glycolysis generating lactate-rich acidic niche (pH {{ computedPh() }})
              </div>
            </div>
          </div>

          <!-- Interactive Biophysical Parameter Sliders -->
          <div class="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            <div class="space-y-1">
              <div class="flex justify-between text-zinc-400 text-[11px]">
                <span>VEGF Expression (Angiogenesis):</span>
                <span class="text-cyan-400 font-bold">{{ vegfLevel() }}%</span>
              </div>
              <input 
                type="range" min="10" max="100" step="5" 
                [value]="vegfLevel()" 
                (input)="updateVegf($event)"
                class="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-zinc-400 text-[11px]">
                <span>Warburg Glycolytic Flux (GLUT1):</span>
                <span class="text-amber-400 font-bold">{{ glycolysisFlux() }}%</span>
              </div>
              <input 
                type="range" min="20" max="100" step="5" 
                [value]="glycolysisFlux()" 
                (input)="updateGlycolysis($event)"
                class="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-zinc-400 text-[11px]">
                <span>T-Cell Infiltration Density:</span>
                <span class="text-emerald-400 font-bold">{{ tCellInfiltration() }}%</span>
              </div>
              <input 
                type="range" min="10" max="100" step="5" 
                [value]="tCellInfiltration()" 
                (input)="updateTCellInfiltration($event)"
                class="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

        </div>
      }

      <!-- VIEW 2: MULTI-PARADIGM RESEARCH GRANTS MATRIX -->
      @if (activeTab() === 'grants') {
        <div class="space-y-5 animate-in fade-in duration-300 font-mono text-xs">
          
          <!-- Paradigm Grant Filter Bar -->
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <span class="text-zinc-400 uppercase font-bold">Filter Grant Opportunities by Paradigm:</span>
            
            <div class="flex flex-wrap gap-1.5">
              @for (filter of grantParadigmFilters; track filter) {
                <button
                  (click)="selectedGrantFilter.set(filter)"
                  [class.bg-rose-500]="selectedGrantFilter() === filter"
                  [class.text-zinc-950]="selectedGrantFilter() === filter"
                  [class.text-zinc-400]="selectedGrantFilter() !== filter"
                  class="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 transition cursor-pointer font-bold"
                >
                  {{ filter }}
                </button>
              }
            </div>
          </div>

          <!-- Grant Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (grant of filteredGrants(); track grant.id) {
              <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-sm">
                
                <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    [class.bg-rose-500/10]="grant.paradigm === 'Allopathic'"
                    [class.text-rose-300]="grant.paradigm === 'Allopathic'"
                    [class.border-rose-500/30]="grant.paradigm === 'Allopathic'"
                    [class.bg-amber-500/10]="grant.paradigm === 'Ayurvedic'"
                    [class.text-amber-300]="grant.paradigm === 'Ayurvedic'"
                    [class.border-amber-500/30]="grant.paradigm === 'Ayurvedic'"
                    [class.bg-emerald-500/10]="grant.paradigm === 'TCM'"
                    [class.text-emerald-300]="grant.paradigm === 'TCM'"
                    [class.border-emerald-500/30]="grant.paradigm === 'TCM'"
                    [class.bg-cyan-500/10]="grant.paradigm === 'Osteopathic'"
                    [class.text-cyan-300]="grant.paradigm === 'Osteopathic'"
                    [class.border-cyan-500/30]="grant.paradigm === 'Osteopathic'"
                    [class.bg-indigo-500/10]="grant.paradigm === 'Integrative / Multi-Center'"
                    [class.text-indigo-300]="grant.paradigm === 'Integrative / Multi-Center'"
                    [class.border-indigo-500/30]="grant.paradigm === 'Integrative / Multi-Center'"
                    class="border"
                  >
                    {{ grant.paradigm }}
                  </span>

                  <span class="text-amber-400 font-bold text-[11px]">{{ grant.awardCeiling }}</span>
                </div>

                <div>
                  <div class="text-sm font-bold text-zinc-100 font-pocketgull-sans">
                    {{ grant.title }}
                  </div>
                  <div class="text-[11px] text-zinc-400">
                    {{ grant.agency }} • <strong>{{ grant.grantMechanism }}</strong>
                  </div>
                </div>

                <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div class="text-[10px] text-zinc-400 uppercase font-bold">Scientific Rationale:</div>
                  <div class="text-[11px] text-zinc-300">{{ grant.scientificRationale }}</div>
                </div>

                <div class="flex flex-wrap gap-1.5 pt-1">
                  @for (kw of grant.applicationKeywords; track kw) {
                    <span class="px-2 py-0.5 rounded-md bg-slate-800/80 text-zinc-300 text-[10px]">
                      #{{ kw }}
                    </span>
                  }
                </div>

              </div>
            }
          </div>

        </div>
      }

    </div>
  `
})
export class ImmunoOncologyTmeViewerComponent implements AfterViewInit, OnDestroy {
  activeTab = signal<'3d-tme' | 'grants'>('3d-tme');

  // Interactive Simulation Signals
  antiPd1Active = signal<boolean>(false);
  vegfLevel = signal<number>(75); // 10% - 100%
  glycolysisFlux = signal<number>(80); // 20% - 100%
  tCellInfiltration = signal<number>(50); // 10% - 100%

  @ViewChild('tmeCanvas') tmeCanvasRef?: ElementRef<HTMLCanvasElement>;

  // Three.js Scene Variables
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private animationFrameId?: number;
  private tumorGroup?: THREE.Group;
  private tCellGroup?: THREE.Group;
  private angiogenesisGroup?: THREE.Group;
  private granzymeParticles?: THREE.Points;

  // Computed Telemetry
  computedCytotoxicity = computed(() => {
    const base = this.tCellInfiltration() * 0.4;
    return this.antiPd1Active() ? Math.min(96, Math.round(base + 55)) : Math.round(base * 0.35);
  });

  computedPh = computed(() => {
    const flux = this.glycolysisFlux();
    return +(7.4 - (flux / 100) * 0.9).toFixed(2);
  });

  computedLactate = computed(() => {
    return +(2.5 + (this.glycolysisFlux() / 100) * 12.5).toFixed(1);
  });

  computedMvd = computed(() => {
    return Math.round(15 + (this.vegfLevel() / 100) * 85);
  });

  computedApoptosisRate = computed(() => {
    return Math.round(this.computedCytotoxicity() * 0.88);
  });

  // Multi-Paradigm Grant Opportunities Catalog
  readonly grantCatalog: IGrantOpportunity[] = [
    {
      id: 'nih-nci-r01',
      paradigm: 'Allopathic',
      agency: 'NIH / National Cancer Institute (NCI)',
      grantMechanism: 'R01 Research Project Grant',
      title: 'Mechanisms of Overcoming Checkpoint Resistance in the Tumor Microenvironment',
      awardCeiling: '$2,500,000 / 5 yrs',
      focusArea: 'Immune Checkpoint Blockade, T-Cell Exhaustion, Neo-antigen Vaccines',
      applicationKeywords: ['PD-1/PD-L1', 'TME Hypoxia', 'Cytotoxic CD8+', 'ctDNA'],
      scientificRationale: 'Investigating how targeting tumor glycolysis and VEGF angiogenesis sensitizes cold tumors to anti-PD-1 checkpoint inhibitors.'
    },
    {
      id: 'pcori-cer',
      paradigm: 'Allopathic',
      agency: 'Patient-Centered Outcomes Research Institute (PCORI)',
      grantMechanism: 'Comparative Clinical Effectiveness Research (CER)',
      title: 'Pragmatic Trial of Integrative Oncology Supportive Care vs. Standard Therapy in Cancer-Related Fatigue',
      awardCeiling: '$5,000,000 / 4 yrs',
      focusArea: 'Quality of Life, Neuropathy, Opioid Reduction, Patient-Reported Outcomes',
      applicationKeywords: ['Integrative Oncology', 'Acupuncture', 'Mind-Body', 'PROs'],
      scientificRationale: 'Large-scale multi-site pragmatic trial evaluating integrative botanical adaptogens and acupuncture for chemotherapy-induced peripheral neuropathy.'
    },
    {
      id: 'ayush-emr-oncology',
      paradigm: 'Ayurvedic',
      agency: 'Ministry of AYUSH / CCRAS (Govt of India)',
      grantMechanism: 'Extra-Mural Research (EMR) Scheme',
      title: 'Standardization and Anti-Angiogenic Efficacy of Withania somnifera (Ashwagandha) and Curcumin Formulations in Solid Tumors',
      awardCeiling: '₹1.5 Crore ($180,000) / 3 yrs',
      focusArea: 'Arbuda / Granthi, Ojas Restoration, Withaferin A Angiogenesis Inhibition',
      applicationKeywords: ['Withaferin A', 'Curcumin BCM-95', 'Rasayana', 'VEGF Downregulation'],
      scientificRationale: 'Multi-omics characterization of Ayurvedic Rasayana herbs in modulating tumor hypoxia-inducible factor (HIF-1α) and immune surveillance.'
    },
    {
      id: 'who-gctm-research',
      paradigm: 'Ayurvedic',
      agency: 'WHO Global Centre for Traditional Medicine (GCTM, Jamnagar)',
      grantMechanism: 'Global Integrative Research Cooperative Grant',
      title: 'Global Standardization of Tridosha Diagnostic Crosswalks with FHIR R4 Health Informatics',
      awardCeiling: '$750,000 / 2 yrs',
      focusArea: 'Terminology Standardization, No-Tofu Script Integration, Evidence Synthesis',
      applicationKeywords: ['FHIR R4', 'Ayurvedic Terminology', 'WHO-ICD-11 TM2', 'Global Health'],
      scientificRationale: 'Building universal digital health standards connecting Ayurvedic Prakriti/Vikriti phenotypes directly to international electronic health records.'
    },
    {
      id: 'nsfc-tcm-oncology',
      paradigm: 'TCM',
      agency: 'National Natural Science Foundation of China (NSFC) / SATCM',
      grantMechanism: 'Key International Joint Research Project',
      title: 'Fuzheng Guben (扶正固本) Formulations in Reversing T-Cell Immunological Exhaustion in the Tumor Microenvironment',
      awardCeiling: '¥3,000,000 ($420,000) / 4 yrs',
      focusArea: 'Zheng Qi vs Xie Qi, Huang Qi (Astragalus), Immune Synapse Modulation',
      applicationKeywords: ['Fuzheng Guben', 'Astragalus Polysaccharides', 'T-Cell Rejuvenation', 'PD-1 Synergism'],
      scientificRationale: 'Elucidating the molecular synergy between Astragalus membranaceus polysaccharides and anti-PD-1 antibodies in restoring exhausted CD8+ T-cells.'
    },
    {
      id: 'aoa-lborc-oncology',
      paradigm: 'Osteopathic',
      agency: 'American Osteopathic Association (AOA) / Louisa Burns Research Committee',
      grantMechanism: 'AOA Primary Research Award',
      title: 'Impact of Osteopathic Lymphatic Pump Techniques on Natural Killer (NK) Cell Mobilization and Interstitial Pressure in Oncology Patients',
      awardCeiling: '$150,000 / 2 yrs',
      focusArea: 'Thoracic Duct Lymphatics, Somatovisceral Reflexes, Biotensegrity, Cancer Fatigue',
      applicationKeywords: ['Lymphatic Pump', 'NK Cell Kinetics', 'T.A.R.T. Dysfunctions', 'OMT'],
      scientificRationale: 'Quantifying the acute mobilization of cytotoxic NK cells and cytokine clearance following standardized thoracic and splenic lymphatic pump OMT.'
    },
    {
      id: 'awcim-fellowship-endowment',
      paradigm: 'Integrative / Multi-Center',
      agency: 'The Weil Foundation / Osher Collaborative for Integrative Health',
      grantMechanism: 'Endowed Integrative Medicine Innovation Grant',
      title: 'Multi-Generational Digital Healer Codex: Interactive Multi-Paradigm Curriculum for Medical Residency',
      awardCeiling: '$1,000,000 / 3 yrs',
      focusArea: 'Medical Education, 4-7-8 Breathwork, Whole-Person Clinical Decision Support',
      applicationKeywords: ['AWCIM Fellowship', '4-7-8 Breathwork', 'Integrative CDS', 'Patient Agency'],
      scientificRationale: 'Deploying computable multi-paradigm decision support to train 500+ integrative medicine fellows across 40 academic medical centers nationwide.'
    }
  ];

  grantParadigmFilters = ['All', 'Allopathic', 'Ayurvedic', 'TCM', 'Osteopathic', 'Integrative / Multi-Center'] as const;
  selectedGrantFilter = signal<string>('All');

  filteredGrants = computed(() => {
    const f = this.selectedGrantFilter();
    if (f === 'All') return this.grantCatalog;
    return this.grantCatalog.filter(g => g.paradigm === f);
  });

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && this.tmeCanvasRef) {
      this.initThreeJsTme();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThreeJsTme(): void {
    const canvas = this.tmeCanvasRef?.nativeElement;
    if (!canvas) return;

    const width = canvas.parentElement?.clientWidth || 700;
    const height = canvas.parentElement?.clientHeight || 460;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617); // obsidian

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 5.0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.buildTumorSpheroid();
    this.buildCytotoxicTCell();
    this.buildAngiogenesisVessels();
    this.buildGranzymeStream();

    this.animate();
  }

  private buildTumorSpheroid(): void {
    if (!this.scene) return;

    this.tumorGroup = new THREE.Group();
    this.tumorGroup.position.set(0.6, 0, 0);

    // Malignant bumpy tumor core (ruby/crimson)
    const tumorGeom = new THREE.DodecahedronGeometry(1.2, 2);
    const tumorMat = new THREE.MeshBasicMaterial({ color: 0xbe123c, wireframe: true, transparent: true, opacity: 0.7 });
    const tumorMesh = new THREE.Mesh(tumorGeom, tumorMat);
    this.tumorGroup.add(tumorMesh);

    // Hypoxic necrotic center (dark amber glow)
    const hypoxicGeom = new THREE.SphereGeometry(0.7, 16, 16);
    const hypoxicMat = new THREE.MeshBasicMaterial({ color: 0xb45309, transparent: true, opacity: 0.5 });
    const hypoxicMesh = new THREE.Mesh(hypoxicGeom, hypoxicMat);
    this.tumorGroup.add(hypoxicMesh);

    this.scene.add(this.tumorGroup);
  }

  private buildCytotoxicTCell(): void {
    if (!this.scene) return;

    this.tCellGroup = new THREE.Group();
    this.tCellGroup.position.set(-1.6, 0.4, 0);

    // CD8+ T-Cell body (electric cyan/emerald)
    const tCellGeom = new THREE.SphereGeometry(0.65, 24, 24);
    const tCellMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.8 });
    const tCellMesh = new THREE.Mesh(tCellGeom, tCellMat);
    this.tCellGroup.add(tCellMesh);

    // PD-1 receptor stem
    const receptorGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.4);
    const receptorMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    const receptorMesh = new THREE.Mesh(receptorGeom, receptorMat);
    receptorMesh.position.set(0.65, 0, 0);
    receptorMesh.rotation.z = Math.PI / 2;
    this.tCellGroup.add(receptorMesh);

    this.scene.add(this.tCellGroup);
  }

  private buildAngiogenesisVessels(): void {
    if (!this.scene) return;

    this.angiogenesisGroup = new THREE.Group();

    // VEGF Sprouting Capillary Strands (Red/crimson branching lines)
    for (let v = 0; v < 8; v++) {
      const angle = (v / 8) * Math.PI * 2;
      const points = [
        new THREE.Vector3(Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, -0.5),
        new THREE.Vector3(Math.cos(angle + 0.2) * 1.5, Math.sin(angle + 0.2) * 1.5, 0),
        new THREE.Vector3(0.6 + Math.cos(angle) * 1.1, Math.sin(angle) * 1.1, 0.2)
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeom = new THREE.TubeGeometry(curve, 16, 0.03, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.65 });
      this.angiogenesisGroup.add(new THREE.Mesh(tubeGeom, tubeMat));
    }

    this.scene.add(this.angiogenesisGroup);
  }

  private buildGranzymeStream(): void {
    if (!this.scene) return;

    const count = 45;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = -1.0 + Math.random() * 1.5;
      positions[i + 1] = 0.2 + (Math.random() - 0.5) * 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 0.4;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x10b981, size: 0.06, blending: THREE.AdditiveBlending });
    this.granzymeParticles = new THREE.Points(geom, mat);
    this.scene.add(this.granzymeParticles);
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.tumorGroup) {
      this.tumorGroup.rotation.y += 0.005;
    }

    if (this.tCellGroup) {
      this.tCellGroup.rotation.y += 0.008;
    }

    if (this.granzymeParticles && this.antiPd1Active()) {
      const pos = this.granzymeParticles.geometry.attributes['position'] as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i) + 0.03;
        if (x > 0.6) x = -1.0;
        pos.setX(i, x);
      }
      pos.needsUpdate = true;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  toggleAntiPd1(): void {
    this.antiPd1Active.update(v => !v);
  }

  updateVegf(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.vegfLevel.set(Number(input.value));
  }

  updateGlycolysis(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.glycolysisFlux.set(Number(input.value));
  }

  updateTCellInfiltration(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.tCellInfiltration.set(Number(input.value));
  }
}
