import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { OpenEvidenceCommonsHudComponent } from './open-evidence-commons-hud.component';
import { OpenEvidenceCommonsService } from '../services/open-evidence-commons.service';

describe('OpenEvidenceCommonsHudComponent Unit Suite', () => {
  const createComponent = () => {
    const service = new OpenEvidenceCommonsService();
    const injector = Injector.create({
      providers: [
        { provide: OpenEvidenceCommonsService, useValue: service },
      ],
    });
    return runInInjectionContext(injector, () => new OpenEvidenceCommonsHudComponent());
  };

  it('1. Initializes component and loads evidence nodes', () => {
    const component = createComponent();
    expect(component).toBeTruthy();
    expect(component.commonsService).toBeTruthy();
    expect(component.commonsService.totalEvidenceCount()).toBe(5);
  });

  it('2. Inspects Merkle inclusion proof for valid node', async () => {
    const component = createComponent();
    await component.inspectProof('ev-sprint-2015');
    expect(component.activeProof()).not.toBeNull();
    expect(component.activeProof()?.leafId).toBe('ev-sprint-2015');
    expect(component.activeProof()?.isValid).toBe(true);
  });

  it('3. Casts quadratic vote via component handler', async () => {
    const component = createComponent();
    const initialStake = component.commonsService.totalQuadraticStake();
    await component.voteAffirmative('ev-sprint-2015');
    expect(component.commonsService.totalQuadraticStake()).toBeGreaterThan(initialStake);
  });

  it('4. Generates attestation receipt successfully', async () => {
    const component = createComponent();
    await component.generateReceipt();
    expect(component.commonsService.latestReceipt()).toBeDefined();
  });
});
