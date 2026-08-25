import { IIndustryVerticalProfile, IndustryVerticalCode } from './types.js';
import { CLINICAL_VERTICAL_PROFILE } from './clinical.js';
import { AEROSPACE_VERTICAL_PROFILE } from './aerospace.js';
import { LEGAL_VERTICAL_PROFILE } from './legal.js';
import { INDUSTRIAL_VERTICAL_PROFILE } from './industrial.js';
import { AGRITECH_VERTICAL_PROFILE } from './agritech.js';

export class IndustryVerticalRegistry {
  private static readonly registry = new Map<IndustryVerticalCode, IIndustryVerticalProfile>([
    ['clinical_health', CLINICAL_VERTICAL_PROFILE],
    ['aerospace_flight', AEROSPACE_VERTICAL_PROFILE],
    ['legal_compliance', LEGAL_VERTICAL_PROFILE],
    ['industrial_manufacturing', INDUSTRIAL_VERTICAL_PROFILE],
    ['agritech_veterinary', AGRITECH_VERTICAL_PROFILE],
  ]);

  /**
   * Get all registered industry vertical profiles
   */
  public static getAllVerticals(): IIndustryVerticalProfile[] {
    return Array.from(this.registry.values());
  }

  /**
   * Look up an industry vertical profile by code
   */
  public static getVertical(code: IndustryVerticalCode): IIndustryVerticalProfile {
    const profile = this.registry.get(code);
    if (!profile) {
      throw new Error(`[VerticalRegistry] Unknown industry vertical code: "${code}"`);
    }
    return profile;
  }

  /**
   * Synthesize a cross-industry diagnostic schema
   */
  public static crossSynthesizeParadigms(code: IndustryVerticalCode): {
    vertical: IIndustryVerticalProfile;
    paradigmCount: number;
    primaryLens: string;
    secondaryLens: string;
    environmentalLens: string;
    evidenceTierLevelA: string;
  } {
    const v = this.getVertical(code);
    const primary = v.systemParadigms.find(p => p.lensType === 'primary')?.name || 'Primary Lens';
    const secondary = v.systemParadigms.find(p => p.lensType === 'secondary')?.name || 'Secondary Lens';
    const env = v.systemParadigms.find(p => p.lensType === 'environmental')?.name || 'Environmental Lens';

    return {
      vertical: v,
      paradigmCount: v.systemParadigms.length,
      primaryLens: primary,
      secondaryLens: secondary,
      environmentalLens: env,
      evidenceTierLevelA: v.epistemology.evidenceTiers.levelA
    };
  }
}
