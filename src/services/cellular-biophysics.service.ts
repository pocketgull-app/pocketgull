import { Injectable, signal, computed } from '@angular/core';

export type TOrganelleId = 'mitochondria' | 'nucleus' | 'membrane' | 'cytoskeleton';

export interface IOrganelleCytology {
  id: TOrganelleId;
  name: string;
  subTitle: string;
  icon: string;
  allopathic: {
    title: string;
    biochemicalPathway: string;
    equation: string;
    keyProteins: string[];
    clinicalRelevance: string;
  };
  ayurvedic: {
    sanskritTitle: string;
    transliteration: string;
    dhatuLayer: string;
    bhutaAgniType: string;
    ojasResonance: string;
    herbalModality: string;
  };
  tcm: {
    hanziTitle: string;
    pinyinTitle: string;
    qiTransformation: string;
    yinYangAspect: string;
    meridianResonance: string;
    acupuncturePrinciple: string;
  };
  osteopathic: {
    title: string;
    tensegrityMechanism: string;
    mechanotransductionPath: string;
    fluidExchangeDynamic: string;
    omtImpact: string;
  };
}

export interface ICellularTelemetry {
  atpProductionRate: number; // in umol/g/min (nominal: 4.8)
  membranePotentialDeltaPsi: number; // in mV (nominal: -140 mV)
  rosLevelPercent: number; // Reactive Oxygen Species (nominal: 12%)
  glutathioneGshRatio: number; // GSH / GSSG ratio (nominal: 98.2)
  intracellularCalciumNanomolar: number; // in nM (nominal: 100 nM baseline)
  mechanotensionPicoNewtons: number; // in pN per focal adhesion (nominal: 25 pN)
}

@Injectable({
  providedIn: 'root'
})
export class CellularBiophysicsService {
  // Reactive Signals for Cellular Parameters
  mitochondrialEfficiency = signal<number>(85); // 40% - 95%
  metabolicDemand = signal<number>(60); // 10% - 100%
  oxidativeStressFactor = signal<number>(15); // 0% - 100%
  interstitialHydrationPercent = signal<number>(75); // 50% - 100%
  mechanicalShearStress = signal<number>(20); // 0 - 60 dyne/cm2

  // Computed Real-Time Cellular Telemetry
  cellularTelemetry = computed<ICellularTelemetry>(() => {
    const eff = this.mitochondrialEfficiency() / 100;
    const demand = this.metabolicDemand() / 100;
    const stress = this.oxidativeStressFactor() / 100;
    const shear = this.mechanicalShearStress();

    // ATP Production rate calculation (nominal: 4.8 umol/g/min)
    const atp = +(4.8 * eff * demand * (1 - stress * 0.3)).toFixed(2);

    // Mitochondrial membrane potential Delta Psi_m (-140 mV nominal)
    const deltaPsi = Math.round(-100 - 45 * eff + 20 * stress);

    // ROS Generation percentage
    const ros = Math.min(100, Math.round(12 * (1 / Math.max(0.3, eff)) * (1 + stress * 1.5)));

    // Glutathione Redox Balance GSH/GSSG ratio (nominal: ~95-100)
    const gsh = Math.max(10, +(100 - ros * 0.7).toFixed(1));

    // Intracellular Calcium nM (transient flux under shear/stress)
    const ca2 = Math.round(100 + shear * 4 + stress * 80);

    // Focal adhesion mechanotension in pN
    const tension = +(25 + shear * 0.85).toFixed(1);

    return {
      atpProductionRate: atp,
      membranePotentialDeltaPsi: deltaPsi,
      rosLevelPercent: ros,
      glutathioneGshRatio: gsh,
      intracellularCalciumNanomolar: ca2,
      mechanotensionPicoNewtons: tension
    };
  });

  // Authoritative Organelle Cytological Catalog
  readonly organelleCatalog: IOrganelleCytology[] = [
    {
      id: 'mitochondria',
      name: 'Mitochondria & Bioenergetics',
      subTitle: 'Electron Transport Chain & ATP Synthase ($F_0F_1$ Rotary Motor)',
      icon: '🫀',
      allopathic: {
        title: 'Mitochondrial Respiration & Oxidative Phosphorylation',
        biochemicalPathway: 'TCA Krebs Cycle → Complex I-IV Proton Gradient → F0F1 ATP Synthase',
        equation: 'ADP + Pi + 4H+ (intermembrane) → ATP + H2O + 4H+ (matrix) [ΔG° = -30.5 kJ/mol]',
        keyProteins: ['Complex I (NADH Dehydrogenase)', 'Cytochrome c Oxidase', 'ATP Synthase (9000 RPM)'],
        clinicalRelevance: 'Mitochondrial dysfunction drives fatigue, myocardial ischemia, and metabolic aging.'
      },
      ayurvedic: {
        sanskritTitle: 'भूताग्नि • कोशिकीय ओजस्',
        transliteration: 'Bhuta Agni & Koshikiya Ojas',
        dhatuLayer: 'Majja & Shukra Dhatu (Marrow & Regenerative Vitality)',
        bhutaAgniType: 'Tejas (Agni) converting nutrient substrates into vital cellular warmth',
        ojasResonance: 'Subtle Ojas (Supreme metabolic immunity preventing cellular decay)',
        herbalModality: 'CoQ10, Shilajit (Fulvic Acid carrier), Ashwagandha'
      },
      tcm: {
        hanziTitle: '细胞正气 • 命门之火',
        pinyinTitle: 'Cellular Zheng Qi & Mingmen Fire',
        qiTransformation: 'Original Yang (Yuan Yang) generating cellular functional kinetic heat',
        yinYangAspect: 'Aerobic Catabolism (Yang 阳) balanced with Mitochondrial Matrix Storage (Yin 阴)',
        meridianResonance: 'Kidney Meridian (Foot Shaoyin) & Du Mai Governing Vessel',
        acupuncturePrinciple: 'Tonify Spleen & Kidney Qi to augment cellular ATP bioenergetics'
      },
      osteopathic: {
        title: 'Cellular Energetics & Micro-Circulatory Perfusion',
        tensegrityMechanism: 'Capillary pulsation driving oxygen delivery across interstitial distance to mitochondria',
        mechanotransductionPath: 'Shear stress-mediated nitric oxide (eNOS) opening capillary sphincters',
        fluidExchangeDynamic: 'Overcoming interstitial fluid stasis to prevent cellular lactic acidosis',
        omtImpact: 'Thoracic Pump & Rib Raising optimizing oxygenation and metabolic clearance'
      }
    },
    {
      id: 'nucleus',
      name: 'Nucleus & Epigenetic Chromatin',
      subTitle: 'DNA Double Helix, Histone Acetylation & 5mC Methylation',
      icon: '🧬',
      allopathic: {
        title: 'Genomic Architecture & Epigenetic Regulation',
        biochemicalPathway: 'DNA Transcription → Pre-mRNA Splicing → Nuclear Pore Complex Export',
        equation: 'DNA Methylation (DNMT1: CpG → 5mC) • Histone Acetylation (HAT / HDAC)',
        keyProteins: ['RNA Polymerase II', 'Histone Octamer H2A/H2B/H3/H4', 'Nuclear Lamin A/C'],
        clinicalRelevance: 'Epigenetic silencing and DNA damage response (PARP1, ATM/ATR kinases).'
      },
      ayurvedic: {
        sanskritTitle: 'बीज भाग • प्रकृति संस्कार',
        transliteration: 'Bija Bhaga & Prakriti Samskara',
        dhatuLayer: 'Shukra Dhatu (Supreme Genetic Essence & Constitutional Blueprint)',
        bhutaAgniType: 'Akasha & Vayu governing the nuclear chromatin spatial matrix',
        ojasResonance: 'Param Ojas holding the ancestral biological memory (Smriti)',
        herbalModality: 'Brahmi (Bacopa monnieri), Shankhpushpi, Amalaki'
      },
      tcm: {
        hanziTitle: '先天之精 • 肾藏精',
        pinyinTitle: 'Pre-Heaven Jing & Kidney Essence',
        qiTransformation: 'Inherited genetic blueprint (Yuan Jing) stored within nuclear chromosomes',
        yinYangAspect: 'Deep Yin structure (Chromatin) transcribing into dynamic Yang action (mRNA)',
        meridianResonance: 'Kidney Jing Channel & Chong Mai Penetrating Vessel',
        acupuncturePrinciple: 'Nourish Kidney Yin to protect genomic longevity and telomeres'
      },
      osteopathic: {
        title: 'Mechanotransduction to the Nuclear Envelope',
        tensegrityMechanism: 'LINC Complex (SUN/KASH proteins) transferring cytoskeleton tension directly to chromatin',
        mechanotransductionPath: 'Mechanical strain deforming nuclear lamina to expose specific gene promoters',
        fluidExchangeDynamic: 'Nuclear pore transport influenced by cellular osmotic turgor',
        omtImpact: 'Craniosacral therapy harmonizing central nervous system cellular gene transcription'
      }
    },
    {
      id: 'membrane',
      name: 'Lipid Bilayer & Ion Channels',
      subTitle: 'Na+/K+ ATPase, Ca2+ Voltage-Gating & Phospholipid Bilayer',
      icon: '⚡',
      allopathic: {
        title: 'Plasma Membrane Electrophysiology & Transporters',
        biochemicalPathway: 'Na+/K+ Pump (3 Na+ out / 2 K+ in) • Ca2+ Influx & Sarcoplasmic Uptake',
        equation: 'Nernst Equation: E_ion = (RT / zF) ln([ion]_out / [ion]_in) → Resting Vm = -70 mV',
        keyProteins: ['Na+/K+-ATPase', 'L-type Ca2+ Channel (Cav1.2)', 'SGLT2 Cotransporter'],
        clinicalRelevance: 'Membrane excitability, cardiac action potentials, and targeted antiarrhythmics.'
      },
      ayurvedic: {
        sanskritTitle: 'कोश कला • प्राण वहा स्रोतस्',
        transliteration: 'Kosha Kala & Prana Vaha Srotas',
        dhatuLayer: 'Rasa Dhatu (Interstitial fluid & cellular fluid membrane interface)',
        bhutaAgniType: 'Jala (Apas) governing osmotic permeation and fluid barrier integrity',
        ojasResonance: 'Tarpaka Kapha providing cellular lipid boundary lubrication',
        herbalModality: 'Centella asiatica (Gotu Kola), Guggulu, Omega-3 Fatty Acids'
      },
      tcm: {
        hanziTitle: '气机出入 • 膜原枢机',
        pinyinTitle: 'Qi Mechanism & Mo Yuan Interstitial Gate',
        qiTransformation: 'Qi ascending, descending, entering, and exiting across cell membranes',
        yinYangAspect: 'Extracellular Fluid (Yang) vs. Intracellular Cytoplasm (Yin) equilibrium',
        meridianResonance: 'San Jiao (Triple Burner) governing micro-fluid irrigation',
        acupuncturePrinciple: 'Open Triple Burner to clear cellular damp-heat and restore ion flux'
      },
      osteopathic: {
        title: 'Trans-Membrane Hydrostatic & Osmotic Dynamics',
        tensegrityMechanism: 'Membrane stretch-activated ion channels (PIEZO1/2) converting pressure into ionic flux',
        mechanotransductionPath: 'Direct membrane depolarization from shear stresses and tissue distortion',
        fluidExchangeDynamic: 'Starling forces: Capillary hydrostatic pressure vs. Colloid osmotic pressure',
        omtImpact: 'Lymphatic Drainage techniques restoring trans-membrane pressure equilibrium'
      }
    },
    {
      id: 'cytoskeleton',
      name: 'Cytoskeleton & Mechanotransduction',
      subTitle: 'Microtubules, Actin Filaments & Integrin Focal Adhesions',
      icon: '🕸️',
      allopathic: {
        title: 'Cellular Tensegrity & Cytoskeletal Biomechanics',
        biochemicalPathway: 'Integrin-Fibronectin Adhesion → Focal Adhesion Kinase (FAK) → YAP/TAZ Nuclear Translocation',
        equation: 'Tensegrity Equilibrium: Σ F_tension (Actin) + Σ F_compression (Microtubules) = 0',
        keyProteins: ['β1-Integrin', 'F-Actin / Myosin II', 'Tubulin Dimers (α/β)'],
        clinicalRelevance: 'Cell motility, wound healing, cardiac remodeling, and fibrotic tissue stiffness.'
      },
      ayurvedic: {
        sanskritTitle: 'अस्थि मज्जा धात्वाधार',
        transliteration: 'Asthi-Majja Dhatvadhara (Structural Framework)',
        dhatuLayer: 'Mamsa & Asthi Dhatu (Muscle & Bone structural foundation)',
        bhutaAgniType: 'Prithvi (Earth) providing tensile solidity and architectural resistance',
        ojasResonance: 'Dhatu Sara (Excellence of structural tissue density and resilience)',
        herbalModality: 'Cissus quadrangularis (Hadjod), Boswellia serrata (Shallaki)'
      },
      tcm: {
        hanziTitle: '筋骨之质 • 经筋网络',
        pinyinTitle: 'Sinews, Bones & Jing-Jin Fascial Network',
        qiTransformation: 'Liver governing the Sinews (筋) connecting intracellular matrix to fascia',
        yinYangAspect: 'Structural Actin Filaments (Yin) yielding to kinetic contractility (Yang)',
        meridianResonance: 'Jing-Jin Sinew Channels conducting bio-mechanical kinetic lines',
        acupuncturePrinciple: 'Release Ashi points along Jing-Jin channels to relax cytoskeletal tension'
      },
      osteopathic: {
        title: 'Cellular Biotensegrity Architecture (Donald Ingber)',
        tensegrityMechanism: 'Continuous tension struts (Actin) balancing discontinuous compression elements (Microtubules)',
        mechanotransductionPath: 'Mechanical forces applied at the skin propagate through fascia directly into intracellular cytoskeleton',
        fluidExchangeDynamic: 'Cytoplasmic streaming and axonal transport along microtubule highways',
        omtImpact: 'Myofascial Release (MFR) directly altering cellular gene expression via mechanotransduction'
      }
    }
  ];

  activeOrganelle = signal<IOrganelleCytology>(this.organelleCatalog[0]);

  selectOrganelle(organelle: IOrganelleCytology): void {
    this.activeOrganelle.set(organelle);
  }
}
