import { Injectable, signal, computed } from '@angular/core';

export interface IStanfordHciPrinciple {
  id: string;
  name: string;
  stanfordLab: string;
  clinicalApplication: string;
  cognitiveLoadReductionPct: number;
  userAgencyLevel: 'DIRECT_MANIPULATION_CONFIRMED' | 'MIXED_INITIATIVE' | 'FULL_CLINICIAN_SOVEREIGNTY';
}

@Injectable({
  providedIn: 'root'
})
export class StanfordHciClinicalLensService {
  readonly hciPrinciples = signal<IStanfordHciPrinciple[]>([
    {
      id: 'hci-generative-agents',
      name: 'Generative Multi-Agent Clinical Reflection',
      stanfordLab: 'Stanford HCI Lab (Park, Joon Sung et al.)',
      clinicalApplication: 'Interprofessional team simulations (MD, PharmD, RN) reflecting on drug interactions before displaying treatment options.',
      cognitiveLoadReductionPct: 42,
      userAgencyLevel: 'FULL_CLINICIAN_SOVEREIGNTY'
    },
    {
      id: 'hci-mixed-initiative',
      name: 'Mixed-Initiative EHR Co-Pilot',
      stanfordLab: 'Stanford HAI & Winograd HCI Tradition',
      clinicalApplication: 'AI suggests draft clinical notes while physician retains 100% granular editing control and 1-click override vectors.',
      cognitiveLoadReductionPct: 65,
      userAgencyLevel: 'MIXED_INITIATIVE'
    },
    {
      id: 'hci-artful-design',
      name: 'Artful 3D Spatial Audio & Haptic Bio-Feedback',
      stanfordLab: 'Stanford CCRMA & Ge Wang Artful Design Lab',
      clinicalApplication: 'Bi-directional Three.js 3D PBR anatomy models paired with harmonic spatial audio entrainment for patient anxiety reduction.',
      cognitiveLoadReductionPct: 58,
      userAgencyLevel: 'DIRECT_MANIPULATION_CONFIRMED'
    }
  ]);

  readonly activePrincipleIndex = signal<number>(0);
  readonly currentPrinciple = computed(() => this.hciPrinciples()[this.activePrincipleIndex()]);

  selectPrinciple(index: number): void {
    if (index >= 0 && index < this.hciPrinciples().length) {
      this.activePrincipleIndex.set(index);
    }
  }
}
