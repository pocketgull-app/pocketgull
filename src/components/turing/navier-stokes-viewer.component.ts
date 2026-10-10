import { Component, ChangeDetectionStrategy, signal, computed, ElementRef, viewChild, AfterViewInit, OnDestroy, inject, PLATFORM_ID, output } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { CircadianSleepinessService } from '../../services/circadian-sleepiness.service';

export type FluidModelMode = 'glymphatic' | 'morphogen' | 'shear';

export interface ISoluteMolecule {
  id: string;
  name: string;
  symbol: string;
  category: 'Therapeutic Small Molecule' | 'Pathological Proteopathy' | 'Endogenous Metabolite';
  isPathological: boolean;
  molecularWeightDa: number;
  hydrodynamicRadiusNm: number;
  diffusionRateMultiplier: number;
  basePeclet: number;
  color: string;
  shadowColor: string;
  description: string;
  foodScienceProfile?: {
    dietarySources: string;
    foodMatrixBioavailability: string;
    farmerAgronomyTip: string;
  };
}

export const SOLUTE_MOLECULES: ISoluteMolecule[] = [
  {
    id: 'amyloid_beta_42',
    name: 'Amyloid-β 1-42',
    symbol: '🧬',
    category: 'Pathological Proteopathy',
    isPathological: true,
    molecularWeightDa: 4514,
    hydrodynamicRadiusNm: 1.09,
    diffusionRateMultiplier: 0.35,
    basePeclet: 62.4,
    color: '#f43f5e',
    shadowColor: '#e11d48',
    description: '4.5 kDa neurotoxic monomer/oligomer. Bulky solute dependent on AQP4 bulk convective flow.',
    foodScienceProfile: {
      dietarySources: 'Endogenous neural proteopathy. Elevated by high-glycemic ultra-processed foods & saturated trans-fats.',
      foodMatrixBioavailability: 'Non-dietary. Cleared by N3 convective wash; polyphenols & EVOO oleocanthal enhance BBB efflux.',
      farmerAgronomyTip: 'Regenerative farming maximizing mycorrhizal soil biodiversity yields crops with superior neuroprotective polyphenols.'
    }
  },
  {
    id: 'tau_protein',
    name: 'p-Tau 181',
    symbol: '🧶',
    category: 'Pathological Proteopathy',
    isPathological: true,
    molecularWeightDa: 48000,
    hydrodynamicRadiusNm: 2.45,
    diffusionRateMultiplier: 0.12,
    basePeclet: 118.5,
    color: '#c084fc',
    shadowColor: '#a855f7',
    description: '48 kDa microtubule-associated protein. Negligible passive diffusion; requires N3 glymphatic wash.',
    foodScienceProfile: {
      dietarySources: 'Endogenous hyperphosphorylated axonal stabilizer. Exacerbated by systemic metabolic endotoxemia.',
      foodMatrixBioavailability: 'High molecular weight (Pe = 118.5). Glymphatic flushing requires lateral sleep posture & vagal tone.',
      farmerAgronomyTip: 'Low-pesticide organic berries rich in anthocyanins attenuate tau hyperphosphorylation in animal models.'
    }
  },
  {
    id: 'spermidine',
    name: 'Spermidine',
    symbol: '✨',
    category: 'Therapeutic Small Molecule',
    isPathological: false,
    molecularWeightDa: 145.25,
    hydrodynamicRadiusNm: 0.35,
    diffusionRateMultiplier: 1.8,
    basePeclet: 12.8,
    color: '#34d399',
    shadowColor: '#10b981',
    description: '145 Da natural polyamine and autophagy inducer. High permeability; diffuses easily across interstitium.',
    foodScienceProfile: {
      dietarySources: 'Wheat germ (243 mg/kg), fermented natto, aged cheddar, shiitake mushrooms, green peas.',
      foodMatrixBioavailability: 'High natural polyamine absorption via SLC transporters; highly stable in standard culinary preparation.',
      farmerAgronomyTip: 'Regulated Deficit Irrigation (RDI) in legumes and durum wheat triggers osmotic stress, boosting grain spermidine by 25–40%.'
    }
  },
  {
    id: 'curcumin',
    name: 'Curcumin',
    symbol: '🌿',
    category: 'Therapeutic Small Molecule',
    isPathological: false,
    molecularWeightDa: 368.38,
    hydrodynamicRadiusNm: 0.48,
    diffusionRateMultiplier: 1.2,
    basePeclet: 24.6,
    color: '#fbbf24',
    shadowColor: '#f59e0b',
    description: '368 Da polyphenolic NLRP3/NF-κB inhibitor. Moderate diffusion coefficient with lipid-affinity.',
    foodScienceProfile: {
      dietarySources: 'Whole Curcuma longa (turmeric) rhizomes, curry blends, golden milk preparations.',
      foodMatrixBioavailability: 'Hydrophobic. Pair with dietary lipids (olive oil, coconut) or piperine to increase absorption by 2000%.',
      farmerAgronomyTip: 'Inoculating turmeric with symbiotic arbuscular mycorrhizal fungi (AMF) increases rhizome curcuminoids by 30%.'
    }
  },
  {
    id: 'akba',
    name: 'AKBA (Boswellia)',
    symbol: '🛡️',
    category: 'Therapeutic Small Molecule',
    isPathological: false,
    molecularWeightDa: 512.72,
    hydrodynamicRadiusNm: 0.54,
    diffusionRateMultiplier: 0.95,
    basePeclet: 32.4,
    color: '#2dd4bf',
    shadowColor: '#14b8a6',
    description: '513 Da 5-LOX allosteric blocker. Favorable PVS clearance kinetics during N2/N3 sleep stages.',
    foodScienceProfile: {
      dietarySources: 'Resin extract of Boswellia serrata (Indian Frankincense).',
      foodMatrixBioavailability: 'Lipophilic triterpene. Consume with dinner fat matrix to enhance lymphatic chylomicron delivery.',
      farmerAgronomyTip: 'Sustainable rotational bark tapping on wild Boswellia trees preserves tree vitality and increases acetyl-11-keto yield.'
    }
  }
];

interface IFluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  morphogenConc: number;
  shearStress: number;
}

@Component({
  selector: 'app-navier-stokes-viewer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-sky-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-sky-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🌊</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-sky-300 flex items-center gap-2">
              Navier-Stokes & Biochemical Advection Engine
              @if (patientVitals()) {
                <span class="text-[9px] px-2 py-0.5 rounded-full bg-sky-950 border border-sky-500/40 text-sky-300">
                  BP: {{ patientVitals()?.bp || '118/76' }}
                </span>
              }
            </h3>
            <p class="text-[10px] text-sky-400/80">
              Microfluidic Viscous Flow, Poiseuille Parabolic Convection & Astrocytic AQP4 Flux
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-sky-950 border border-sky-700/60 text-sky-300"
                title="Microvascular creeping flow regime (Re << 1) and Womersley frequency parameter (alpha < 1)">
            Re: {{ reynoldsNumber() }} · α: {{ womersleyNumber() }} (Stokes Flow)
          </span>
        </div>
      </div>

      <!-- Mode & Stage Selector Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-sky-900/30">
        <!-- Fluid Mode Switcher -->
        <div class="flex items-center gap-1.5">
          <button (click)="setFluidMode('glymphatic')"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                  [class.bg-sky-600]="fluidMode() === 'glymphatic'" [class.text-white]="fluidMode() === 'glymphatic'" [class.border-sky-400]="fluidMode() === 'glymphatic'"
                  [class.bg-zinc-900]="fluidMode() !== 'glymphatic'" [class.text-zinc-400]="fluidMode() !== 'glymphatic'" [class.border-zinc-800]="fluidMode() !== 'glymphatic'">
            🌊 Glymphatic CSF
          </button>
          <button (click)="setFluidMode('morphogen')"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                  [class.bg-emerald-600]="fluidMode() === 'morphogen'" [class.text-white]="fluidMode() === 'morphogen'" [class.border-emerald-400]="fluidMode() === 'morphogen'"
                  [class.bg-zinc-900]="fluidMode() !== 'morphogen'" [class.text-zinc-400]="fluidMode() !== 'morphogen'" [class.border-zinc-800]="fluidMode() !== 'morphogen'">
            🧬 Morphogen Diffusion
          </button>
          <button (click)="setFluidMode('shear')"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                  [class.bg-amber-600]="fluidMode() === 'shear'" [class.text-white]="fluidMode() === 'shear'" [class.border-amber-400]="fluidMode() === 'shear'"
                  [class.bg-zinc-900]="fluidMode() !== 'shear'" [class.text-zinc-400]="fluidMode() !== 'shear'" [class.border-zinc-800]="fluidMode() !== 'shear'">
            ⚡ Wall Shear Stress
          </button>
        </div>

        <!-- Sleep State Controls (for Glymphatic mode) -->
        <div class="flex items-center gap-1.5">
          <button (click)="setSleepStage('wake')" class="px-2 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer border"
                  [class.bg-sky-900]="sleepStage() === 'wake'" [class.text-sky-200]="sleepStage() === 'wake'" [class.border-sky-700]="sleepStage() === 'wake'"
                  [class.bg-zinc-950]="sleepStage() !== 'wake'" [class.text-zinc-500]="sleepStage() !== 'wake'" [class.border-zinc-800]="sleepStage() !== 'wake'">
            Wake
          </button>
          <button (click)="setSleepStage('n2')" class="px-2 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer border"
                  [class.bg-sky-900]="sleepStage() === 'n2'" [class.text-sky-200]="sleepStage() === 'n2'" [class.border-sky-700]="sleepStage() === 'n2'"
                  [class.bg-zinc-950]="sleepStage() !== 'n2'" [class.text-zinc-500]="sleepStage() !== 'n2'" [class.border-zinc-800]="sleepStage() !== 'n2'">
            N2
          </button>
          <button (click)="setSleepStage('n3')" class="px-2 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer border"
                  [class.bg-sky-900]="sleepStage() === 'n3'" [class.text-sky-200]="sleepStage() === 'n3'" [class.border-sky-700]="sleepStage() === 'n3'"
                  [class.bg-zinc-950]="sleepStage() !== 'n3'" [class.text-zinc-500]="sleepStage() !== 'n3'" [class.border-zinc-800]="sleepStage() !== 'n3'">
            N3 (+600%)
          </button>
          <button (click)="syncWithCircadianTelemetry()"
                  class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 transition cursor-pointer">
            ⚡ Sync
          </button>
        </div>
      </div>

      <!-- Solute Carrier Molecule Selector Bar -->
      <div class="flex items-center gap-1.5 pb-2 mb-2 border-b border-sky-900/30 overflow-x-auto hide-scrollbar">
        <span class="text-[10px] uppercase font-bold text-sky-400/90 shrink-0">Solute Carrier:</span>
        @for (mol of soluteMolecules; track mol.id) {
          <button (click)="selectMolecule(mol)"
                  class="px-2 py-0.5 rounded-lg text-[9.5px] font-bold transition cursor-pointer border flex items-center gap-1 shrink-0"
                  [class.bg-sky-900]="selectedMolecule().id === mol.id"
                  [class.text-sky-100]="selectedMolecule().id === mol.id"
                  [class.border-sky-400]="selectedMolecule().id === mol.id"
                  [class.bg-zinc-950]="selectedMolecule().id !== mol.id"
                  [class.text-zinc-400]="selectedMolecule().id !== mol.id"
                  [class.border-zinc-800]="selectedMolecule().id !== mol.id"
                  [title]="mol.description">
            <span>{{ mol.symbol }}</span>
            <span>{{ mol.name }}</span>
            <span class="text-[8.5px] opacity-75 font-mono">({{ mol.molecularWeightDa >= 1000 ? (mol.molecularWeightDa / 1000).toFixed(1) + 'kDa' : mol.molecularWeightDa + 'Da' }})</span>
          </button>
        }
      </div>

      <!-- Fluid Dynamics Canvas -->
      <div class="flex-1 w-full relative bg-black rounded-xl overflow-hidden border border-sky-900/30 min-h-[220px]">
        <canvas #fluidCanvas class="w-full h-full block"></canvas>
      </div>

      <!-- Perturbations Bar -->
      <div class="mt-2 flex items-center gap-2 overflow-x-auto py-1 hide-scrollbar">
        <span class="text-[10px] uppercase font-bold text-sky-400/90 shrink-0">Biochemical Challenges:</span>
        <button (click)="pulseHypertension()"
                class="px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          ⚠️ Vasoconstriction
        </button>
        <button (click)="induceSlowWaveDeepSleep()"
                class="px-2.5 py-1 rounded-lg bg-sky-950/70 hover:bg-sky-900 border border-sky-500/50 text-sky-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          💤 Glymphatic Surge
        </button>
        <button (click)="toggleAqp4Polarity()"
                class="px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0"
                [class.bg-sky-950]="aqp4Polarized()" [class.text-sky-300]="aqp4Polarized()" [class.border-sky-500]="aqp4Polarized()"
                [class.bg-rose-950]="!aqp4Polarized()" [class.text-rose-300]="!aqp4Polarized()" [class.border-rose-500]="!aqp4Polarized()"
                title="Aquaporin-4 astrocytic endfoot polarity: 90% polarized provides high convective clearance; 25% depolarized reduces clearance by 62%">
          💧 AQP4: {{ aqp4Polarized() ? 'Polarized (90%)' : 'Depolarized (25%)' }}
        </button>
        <button (click)="injectMorphogenPulse()"
                class="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          🧬 BMP/Wnt Morphogen Pulse
        </button>
        <button (click)="pulseAtheroproneTurbulence()"
                class="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          🌪️ Atheroprone Low Shear (<0.4 Pa)
        </button>
      </div>

      <!-- Farm-to-Brain Food Science & Agronomy Profile -->
      @if (selectedMolecule().foodScienceProfile; as food) {
        <div class="mt-2 p-2 rounded-xl bg-sky-950/40 border border-sky-800/40 text-[10px] text-sky-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 shadow-inner">
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-sm">🌾</span>
            <span class="font-bold text-sky-300 uppercase tracking-wider text-[9.5px]">Farm-to-Brain Profile:</span>
          </div>
          <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 text-[9px] leading-snug">
            <div><strong class="text-emerald-300">Dietary Matrix:</strong> {{ food.dietarySources }}</div>
            <div><strong class="text-amber-300">Food Science:</strong> {{ food.foodMatrixBioavailability }}</div>
            <div><strong class="text-teal-300">Agronomy / Soil:</strong> {{ food.farmerAgronomyTip }}</div>
          </div>
        </div>
      }

      <!-- Metrics Footer -->
      <div class="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-sky-900/30">
        <div class="flex flex-wrap items-center gap-4 text-[10px] text-sky-300/80">
          <span>Solute: <strong class="text-sky-200 font-bold">{{ selectedMolecule().name }}</strong></span>
          <span>$R_H$: <strong class="text-sky-200 font-bold">{{ selectedMolecule().hydrodynamicRadiusNm.toFixed(2) }} nm</strong></span>
          <span>Velocity: <strong class="text-sky-200 font-bold">{{ csfVelocity() }} mm/s</strong></span>
          <span>Intercellular: <strong class="text-sky-200 font-bold">+{{ volumeExpansion() }}%</strong></span>
          <span>Péclet ($Pe$): <strong class="text-emerald-300 font-bold">{{ pecletNumber() }}</strong></span>
          <span>Wall Shear ($\tau$): <strong class="text-amber-300 font-bold">{{ wallShearStress() }}</strong></span>
          <span>AQP4: <strong [class.text-emerald-300]="aqp4Polarized()" [class.text-rose-400]="!aqp4Polarized()">{{ aqp4Polarized() ? '1.0x (Polarized)' : '0.38x (Depolarized)' }}</strong></span>
          <span>Transport: <strong [class.text-amber-300]="selectedMolecule().molecularWeightDa > 3000" [class.text-emerald-300]="selectedMolecule().molecularWeightDa <= 3000">{{ selectedMolecule().molecularWeightDa > 3000 ? 'Convective (N3 Dependent)' : 'Diffusive-Permissive' }}</strong></span>
          @if (caaStasisRisk()) {
            <span class="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/60 text-rose-300 font-mono text-[9px] animate-pulse">
              ⚠️ CAA Stasis Risk: Perivascular Amyloid Nucleation
            </span>
          }
        </div>
        <span class="text-[10px] text-zinc-500 font-mono">2D Poiseuille-Stokes + Solute Transport</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class NavierStokesViewerComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly patientState = inject(PatientStateService, { optional: true });
  private readonly circadianService = inject(CircadianSleepinessService, { optional: true });
  private readonly fluidCanvas = viewChild<ElementRef<HTMLCanvasElement>>('fluidCanvas');

  readonly fluidMode = signal<FluidModelMode>('glymphatic');
  readonly sleepStage = signal<'wake' | 'n2' | 'n3'>('n3');
  readonly aqp4Polarized = signal<boolean>(true);

  readonly soluteMolecules = SOLUTE_MOLECULES;
  readonly selectedMolecule = signal<ISoluteMolecule>(SOLUTE_MOLECULES[0]);

  readonly moleculeSelected = output<ISoluteMolecule>();
  readonly glymphaticStateChange = output<{ sleepStage: 'wake' | 'n2' | 'n3'; aqp4Polarized: boolean; clearanceRate: number }>();

  readonly csfVelocity = computed(() => this.sleepStage() === 'n3' ? '4.8' : this.sleepStage() === 'n2' ? '2.1' : '0.6');
  readonly volumeExpansion = computed(() => this.sleepStage() === 'n3' ? 60 : this.sleepStage() === 'n2' ? 20 : 0);
  readonly reynoldsNumber = computed(() => this.sleepStage() === 'n3' ? 142 : this.sleepStage() === 'n2' ? 85 : 24);
  readonly womersleyNumber = computed(() => this.sleepStage() === 'n3' ? 0.24 : this.sleepStage() === 'n2' ? 0.16 : 0.08);
  readonly stokesReynoldsNumber = computed(() => this.sleepStage() === 'n3' ? 0.048 : this.sleepStage() === 'n2' ? 0.021 : 0.006);
  readonly pecletNumber = computed(() => {
    if (this.fluidMode() === 'morphogen') return 48.5;
    if (this.selectedMolecule().id === 'amyloid_beta_42') {
      return this.sleepStage() === 'n3' ? 62.4 : this.sleepStage() === 'n2' ? 38.2 : 12.8;
    }
    const ratio = this.selectedMolecule().basePeclet;
    return this.sleepStage() === 'n3' ? ratio : this.sleepStage() === 'n2' ? Number((ratio * 0.6).toFixed(1)) : Number((ratio * 0.2).toFixed(1));
  });
  readonly wallShearStress = computed(() => this.fluidMode() === 'shear' ? '1.42 Pa' : this.sleepStage() === 'n3' ? '1.85 Pa' : '0.45 Pa');

  /** Cerebral Amyloid Angiopathy (CAA) stasis risk: proteopathy present + impaired bulk flow */
  readonly caaStasisRisk = computed(() => {
    const isProteopathy = this.selectedMolecule().isPathological;
    const isStalled = !this.aqp4Polarized() || this.sleepStage() === 'wake';
    return isProteopathy && isStalled;
  });

  readonly patientVitals = computed(() => this.patientState?.vitals() || null);

  private particles: IFluidParticle[] = [];
  private animId?: number;
  private timeStep = 0;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.syncWithCircadianTelemetry();
    this.initParticles();
    this.startLoop();
  }

  syncWithCircadianTelemetry() {
    const kss = this.circadianService?.clinicianKss?.() || 5;
    if (kss >= 7) {
      this.setSleepStage('n3');
    } else if (kss >= 5) {
      this.setSleepStage('n2');
    } else {
      this.setSleepStage('wake');
    }
  }

  selectMolecule(molecule: ISoluteMolecule) {
    this.selectedMolecule.set(molecule);
    this.initParticles();
    this.moleculeSelected.emit(molecule);
  }

  setFluidMode(mode: FluidModelMode) {
    this.fluidMode.set(mode);
    this.initParticles();
  }

  pulseHypertension() {
    this.particles.forEach(p => {
      p.vx *= 0.6; // Stiffened vessel slows clearance
      p.vy += (Math.random() - 0.5) * 1.5; // Shear turbulence
      p.shearStress = 0.35;
    });
  }

  induceSlowWaveDeepSleep() {
    this.setSleepStage('n3');
  }

  injectMorphogenPulse() {
    this.setFluidMode('morphogen');
    this.particles.forEach(p => {
      if (p.x < 100) {
        p.morphogenConc = 1.0;
      }
    });
  }

  pulseAtheroproneTurbulence() {
    this.setFluidMode('shear');
    this.particles.forEach(p => {
      p.vx = (Math.random() - 0.5) * 0.8;
      p.vy = (Math.random() - 0.5) * 2.0;
      p.shearStress = 0.22; // Low oscillating shear
    });
  }

  setSleepStage(stage: 'wake' | 'n2' | 'n3') {
    this.sleepStage.set(stage);
    this.initParticles();
    this.emitGlymphaticState();
  }

  setAqp4Polarization(polarized: boolean) {
    this.aqp4Polarized.set(polarized);
    this.emitGlymphaticState();
  }

  toggleAqp4Polarity() {
    this.aqp4Polarized.update(v => !v);
    this.emitGlymphaticState();
  }

  private emitGlymphaticState() {
    const rate = (this.sleepStage() === 'n3' ? 1.0 : this.sleepStage() === 'n2' ? 0.44 : 0.12) * (this.aqp4Polarized() ? 1.0 : 0.38);
    this.glymphaticStateChange.emit({
      sleepStage: this.sleepStage(),
      aqp4Polarized: this.aqp4Polarized(),
      clearanceRate: Number(rate.toFixed(2))
    });
  }

  private initParticles() {
    const count = this.sleepStage() === 'n3' ? 140 : this.sleepStage() === 'n2' ? 80 : 40;
    const mol = this.selectedMolecule();
    const sizeMultiplier = Math.max(0.7, mol.hydrodynamicRadiusNm / 0.85);

    this.particles = Array.from({ length: count }, () => {
      const y = Math.random() * 200 + 20;
      // Poiseuille parabolic profile: highest velocity at center, near zero at walls
      const normalizedY = (y - 120) / 100;
      const parabolicFactor = Math.max(0.2, 1 - normalizedY * normalizedY);
      const baseVelocity = (this.sleepStage() === 'n3' ? 3.0 : this.sleepStage() === 'n2' ? 1.5 : 0.6) * parabolicFactor;

      return {
        x: Math.random() * 400,
        y,
        vx: (Math.random() * 0.5 + 0.8) * baseVelocity,
        vy: (Math.random() - 0.5) * 0.25 * mol.diffusionRateMultiplier,
        radius: (Math.random() * 1.5 + 1.1) * sizeMultiplier,
        morphogenConc: Math.random() * 0.8,
        shearStress: 1.4 * (1 - parabolicFactor)
      };
    });
  }

  private startLoop() {
    const loop = () => {
      this.timeStep += 0.03;
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  private draw() {
    const canvas = this.fluidCanvas()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth || 360;
      canvas.height = canvas.clientHeight || 220;
    }

    ctx.fillStyle = '#030814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const mode = this.fluidMode();

    // Render morphogen concentration wave background in morphogen mode
    if (mode === 'morphogen') {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
      gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.1)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 25, canvas.width, canvas.height - 50);
    }

    // Draw Astrocytic Endfoot Footplates (AQP4 polarity) along vessel walls
    const aqp4Polarized = this.aqp4Polarized();
    const endfootColor = aqp4Polarized ? 'rgba(56, 189, 248, 0.45)' : 'rgba(244, 63, 94, 0.35)';
    ctx.fillStyle = endfootColor;
    const footplateStep = 28;
    for (let x = 6; x < canvas.width; x += footplateStep) {
      // Top wall astrocytic endfeet (trans-parenchymal clearance gates)
      ctx.fillRect(x, 18, 16, 6);
      // Bottom wall astrocytic endfeet
      ctx.fillRect(x, canvas.height - 24, 16, 6);
    }

    // Draw Endothelial Vessel Walls
    const wallColor = mode === 'shear' ? '#d97706' : mode === 'morphogen' ? '#059669' : '#1e3a8a';
    ctx.strokeStyle = wallColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.lineTo(canvas.width, 25);
    ctx.moveTo(0, canvas.height - 25);
    ctx.lineTo(canvas.width, canvas.height - 25);
    ctx.stroke();

    // Cerebral Amyloid Angiopathy (CAA) Perivascular Plaque Deposition
    // When pathological proteopathies stall at the vessel boundary, render sticky oligomer deposits
    if (this.caaStasisRisk()) {
      ctx.fillStyle = 'rgba(244, 63, 94, 0.75)';
      ctx.shadowColor = '#e11d48';
      ctx.shadowBlur = 8;
      const plaqueSites = [0.12, 0.28, 0.45, 0.63, 0.79, 0.91];
      for (let i = 0; i < plaqueSites.length; i++) {
        const px = canvas.width * plaqueSites[i];
        const radTop = 3.5 + (i % 3) * 0.8;
        const radBottom = 3.2 + ((i + 1) % 3) * 0.8;
        // Top basement membrane deposit
        ctx.beginPath();
        ctx.arc(px, 25, radTop, 0, Math.PI * 2);
        ctx.fill();
        // Bottom basement membrane deposit
        ctx.beginPath();
        ctx.arc(px + 14, canvas.height - 25, radBottom, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // 0.1 Hz Mayer Wave Parasympathetic Vasomotion (10-second respiratory cycle)
    const vasomotionPulse = 1.0 + 0.30 * Math.sin(this.timeStep * 0.628);
    const clearanceMultiplier = aqp4Polarized ? 1.0 : 0.38; // -62% clearance when AQP4 depolarized

    // Move & Render Flow Particles
    const mol = this.selectedMolecule();
    this.particles.forEach(p => {
      p.x += p.vx * vasomotionPulse * clearanceMultiplier;
      p.y += p.vy;

      // Small molecule interstitial Brownian diffusion jitter
      if (mol.diffusionRateMultiplier > 1.0) {
        p.y += (Math.random() - 0.5) * 0.18;
      }

      // Advection-diffusion decay and dispersion
      if (mode === 'morphogen') {
        p.morphogenConc = Math.max(0.05, p.morphogenConc * 0.998);
      }

      if (p.x > canvas.width) {
        p.x = 0;
        p.morphogenConc = Math.random() * 0.9 + 0.1;
      }
      if (p.y < 30 || p.y > canvas.height - 30) {
        p.vy *= -1;
      }

      // Color based on active mode
      if (mode === 'morphogen') {
        ctx.fillStyle = p.morphogenConc > 0.5 ? '#34d399' : '#06b6d4';
        ctx.shadowColor = '#10b981';
      } else if (mode === 'shear') {
        ctx.fillStyle = p.shearStress > 1.0 ? '#fbbf24' : '#f43f5e';
        ctx.shadowColor = '#f59e0b';
      } else {
        ctx.fillStyle = aqp4Polarized ? mol.color : '#fda4af';
        ctx.shadowColor = aqp4Polarized ? mol.shadowColor : '#f43f5e';
      }

      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ngOnDestroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
