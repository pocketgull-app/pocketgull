import { Injectable, signal, computed } from '@angular/core';

export type ClinicalParadigm = 'WESTERN' | 'TCM' | 'AYURVEDA';

export interface IParadigmCollision {
  id: string;
  paradigmsInvolved: ClinicalParadigm[];
  conflictDescription: string;
  resolutionStrategy: 'WESTERN_ACUTE_PRIORITY' | 'COHERENCE_FUSION' | 'SOCRATIC_DISCLOSURE';
  arbitratedRecommendation: string;
  confidenceScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class ParadigmArbiterService {
  private activeCollisions = signal<IParadigmCollision[]>([
    {
      id: 'col-001',
      paradigmsInvolved: ['WESTERN', 'TCM'],
      conflictDescription: 'Melatonin circadian onset vs TCM Liver Meridian peak (1am-3am)',
      resolutionStrategy: 'COHERENCE_FUSION',
      arbitratedRecommendation: 'Maintain low ambient blue light after 10pm while recommending ST36 / SP6 acupressure',
      confidenceScore: 0.94
    }
  ]);

  readonly collisions = this.activeCollisions.asReadonly();
  readonly collisionCount = computed(() => this.activeCollisions().length);

  /**
   * Arbitrate collisions deterministically using predefined resolution strategies
   */
  arbitrateCollision(
    paradigms: ClinicalParadigm[],
    description: string,
    isAcuteEmergency: boolean
  ): IParadigmCollision {
    const strategy = isAcuteEmergency ? 'WESTERN_ACUTE_PRIORITY' : 'COHERENCE_FUSION';
    
    const resolution: IParadigmCollision = {
      id: `col-${Date.now().toString(36)}`,
      paradigmsInvolved: paradigms,
      conflictDescription: description,
      resolutionStrategy: strategy,
      arbitratedRecommendation: isAcuteEmergency
        ? 'WESTERN ACUTE PRIORITY: Execute immediate standard-of-care vital stabilization protocol.'
        : 'COHERENCE FUSION: Harmonize supportive botanical/lifestyle therapy with primary evidence-based guidelines.',
      confidenceScore: 0.96
    };

    this.activeCollisions.update(curr => [resolution, ...curr]);
    return resolution;
  }
}
