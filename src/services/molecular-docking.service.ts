import { Injectable, signal, computed } from '@angular/core';

export interface IProteinTarget {
  id: string;
  name: string;
  pdbId: string;
  uniprotId: string;
  category: 'Inflammation' | 'Cartilage Structural' | 'Cardiovascular';
  description: string;
  activeSiteResidues: string[];
  alphaFoldConfidenceScore: number; // 0 - 100 pLDDT
}

export interface ILigandMolecule {
  id: string;
  name: string;
  molecularWeight: number; // g/mol
  chemicalFormula: string;
  category: 'Phytomedical Botanical' | 'Synthetic Drug' | 'Endogenous Biomolecule';
  targetPockets: string[];
  baseBindingAffinityKcal: number; // kcal/mol
  mechanismOfAction: string;
}

export interface IDockingResult {
  targetId: string;
  ligandId: string;
  deltaGKcalPerMol: number;
  inhibitionConstantKiMicroMolar: number; // Ki = exp(DeltaG / RT)
  rmsdAngstrom: number;
  hydrogenBondsCount: number;
  hydrophobicContactsCount: number;
  bindingEfficiency: number; // -DeltaG / Heavy Atom Count
  status: 'Docked' | 'Simulating' | 'Equilibrated';
}

@Injectable({
  providedIn: 'root'
})
export class MolecularDockingService {
  readonly proteinTargets: IProteinTarget[] = [
    {
      id: 'nlrp3',
      name: 'NLRP3 Inflammasome Sensor',
      pdbId: '7PZC',
      uniprotId: 'Q96P20',
      category: 'Inflammation',
      description: 'Central NOD-like receptor mediating IL-1β and IL-18 release in joint synovitis.',
      activeSiteResidues: ['Arg262', 'Glu629', 'Leu631', 'Tyr632'],
      alphaFoldConfidenceScore: 92.4
    },
    {
      id: 'collagen2',
      name: 'Collagen Type-II Triple Helix',
      pdbId: '1BKV',
      uniprotId: 'P02458',
      category: 'Cartilage Structural',
      description: 'Primary articular cartilage tensile scaffolding damaged in meniscus & OA degeneration.',
      activeSiteResidues: ['Hyp24', 'Gly27', 'Pro30', 'Arg33'],
      alphaFoldConfidenceScore: 96.1
    },
    {
      id: 'five_lox',
      name: '5-Lipoxygenase (5-LOX)',
      pdbId: '6NCF',
      uniprotId: 'P09917',
      category: 'Inflammation',
      description: 'Rate-limiting enzyme for leukotriene B4 (LTB4) synthesis causing neutrophil chemotaxis.',
      activeSiteResidues: ['His367', 'His372', 'His550', 'Ile673'],
      alphaFoldConfidenceScore: 89.8
    },
    {
      id: 'cox2',
      name: 'Cyclooxygenase-2 (COX-2)',
      pdbId: '5KIR',
      uniprotId: 'P35354',
      category: 'Inflammation',
      description: 'Inducible pro-inflammatory enzyme synthesizing PGE2 in joint capsules.',
      activeSiteResidues: ['Arg120', 'Tyr355', 'Tyr385', 'Ser530'],
      alphaFoldConfidenceScore: 94.2
    }
  ];

  readonly ligandMolecules: ILigandMolecule[] = [
    {
      id: 'akba',
      name: 'Acetyl-11-keto-β-boswellic acid (AKBA)',
      molecularWeight: 512.72,
      chemicalFormula: 'C32H48O4',
      category: 'Phytomedical Botanical',
      targetPockets: ['five_lox', 'nlrp3'],
      baseBindingAffinityKcal: -9.4,
      mechanismOfAction: 'Direct allosteric inhibition of 5-LOX and selective blockage of NLRP3 oligomerization.'
    },
    {
      id: 'curcumin',
      name: 'Curcumin (Diferuloylmethane)',
      molecularWeight: 368.38,
      chemicalFormula: 'C21H20O6',
      category: 'Phytomedical Botanical',
      targetPockets: ['nlrp3', 'cox2'],
      baseBindingAffinityKcal: -8.8,
      mechanismOfAction: 'Suppresses NF-κB nuclear translocation and disrupts inflammasome priming.'
    },
    {
      id: 'hyaluronic_acid',
      name: 'Hyaluronic Acid (HA Tetrasaccharide)',
      molecularWeight: 776.65,
      chemicalFormula: 'C28H44N2O23',
      category: 'Endogenous Biomolecule',
      targetPockets: ['collagen2'],
      baseBindingAffinityKcal: -7.6,
      mechanismOfAction: 'Viscosupplementation & CD44 chondrocyte receptor stimulation.'
    },
    {
      id: 'celecoxib',
      name: 'Celecoxib (Reference NSAID)',
      molecularWeight: 381.37,
      chemicalFormula: 'C17H14F3N3O2S',
      category: 'Synthetic Drug',
      targetPockets: ['cox2'],
      baseBindingAffinityKcal: -9.1,
      mechanismOfAction: 'Competitive active-site blockage of arachidonic acid entry in COX-2.'
    }
  ];

  readonly selectedTarget = signal<IProteinTarget>(this.proteinTargets[0]);
  readonly selectedLigand = signal<ILigandMolecule>(this.ligandMolecules[0]);
  readonly isSimulating = signal<boolean>(false);
  readonly simulationProgress = signal<number>(100); // 0 to 100%

  readonly dockingResult = computed<IDockingResult>(() => {
    const target = this.selectedTarget();
    const ligand = this.selectedLigand();

    // Compute affinity based on pocket compatibility and thermodynamic potential
    const isTargetMatched = ligand.targetPockets.includes(target.id);
    const affinityBoost = isTargetMatched ? 0.0 : 2.5; // Non-matched pockets have weaker binding (higher Delta G)
    const deltaG = ligand.baseBindingAffinityKcal + affinityBoost;

    // R = 1.9872e-3 kcal/(mol*K), T = 310.15 K (Human body temperature 37°C)
    // Ki = exp(DeltaG / RT) in Molar -> converted to microMolar
    const RT = 0.0019872 * 310.15;
    const kiMolar = Math.exp(deltaG / RT);
    const kiMicroMolar = Math.max(0.001, kiMolar * 1e6);

    const hBonds = isTargetMatched ? Math.floor(Math.abs(deltaG) * 0.45) + 1 : 1;
    const hydrophobic = isTargetMatched ? Math.floor(Math.abs(deltaG) * 0.8) + 2 : 2;

    return {
      targetId: target.id,
      ligandId: ligand.id,
      deltaGKcalPerMol: parseFloat(deltaG.toFixed(2)),
      inhibitionConstantKiMicroMolar: parseFloat(kiMicroMolar.toFixed(3)),
      rmsdAngstrom: parseFloat((0.85 + (isTargetMatched ? 0.2 : 1.8)).toFixed(2)),
      hydrogenBondsCount: hBonds,
      hydrophobicContactsCount: hydrophobic,
      bindingEfficiency: parseFloat((Math.abs(deltaG) / (ligand.molecularWeight / 12)).toFixed(3)),
      status: this.isSimulating() ? 'Simulating' : 'Docked'
    };
  });

  setTarget(target: IProteinTarget): void {
    this.selectedTarget.set(target);
    this.runDockingSimulation();
  }

  setLigand(ligand: ILigandMolecule): void {
    this.selectedLigand.set(ligand);
    this.runDockingSimulation();
  }

  runDockingSimulation(): void {
    this.isSimulating.set(true);
    this.simulationProgress.set(0);

    const interval = setInterval(() => {
      this.simulationProgress.update(p => {
        if (p >= 100) {
          clearInterval(interval);
          this.isSimulating.set(false);
          return 100;
        }
        return p + 20;
      });
    }, 80);
  }
}
