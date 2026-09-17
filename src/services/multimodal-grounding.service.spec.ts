import { describe, it, expect, beforeEach } from 'vitest';
import { MultimodalGroundingService } from './multimodal-grounding.service';

describe('MultimodalGroundingService', () => {
  let service: MultimodalGroundingService;

  beforeEach(() => {
    service = new MultimodalGroundingService();
  });

  it('should build grounded multimodal context with anatomical and biophysical anchors', () => {
    const ctx = service.buildGroundedContext('p_mara_santos');

    expect(ctx.groundedPromptPrefix).toContain('[GROUNDED MULTIMODAL CLINICAL CONTEXT]');
    expect(ctx.groundedPromptPrefix).toContain('Patient ID: p_mara_santos');
    expect(ctx.imagingBiomarkers.modality).toContain('MAGNETIC_RESONANCE_IMAGING');
    expect(ctx.tabularBiomarkers.glucoseMgDl).toBeDefined();
    expect(ctx.tabularBiomarkers.crclMlMin).toBeDefined();
  });
});
