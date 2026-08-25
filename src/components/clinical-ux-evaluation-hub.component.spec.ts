import '@angular/compiler';
import { ClinicalUxEvaluationHubComponent } from './clinical-ux-evaluation-hub.component';
import { ClinicalUxEvaluationService } from '../services/clinical-ux-evaluation.service';

describe('ClinicalUxEvaluationHubComponent Unit Suite', () => {
  let component: ClinicalUxEvaluationHubComponent;
  let service: ClinicalUxEvaluationService;

  beforeEach(() => {
    service = new ClinicalUxEvaluationService();
    component = new ClinicalUxEvaluationHubComponent();
    component.service = service;
  });

  it('1. Initializes with CLINICAL tab active by default and 100% faithfulness score', () => {
    expect(component.activeTab()).toBe('CLINICAL');
    expect(component.service.clinicalFaithfulnessScore()).toBe(100);
  });

  it('2. Switches tabs cleanly to ERGONOMICS and PRIVACY', () => {
    component.activeTab.set('ERGONOMICS');
    expect(component.activeTab()).toBe('ERGONOMICS');
    expect(component.service.mobileErgonomicsScore()).toBe(100);

    component.activeTab.set('PRIVACY');
    expect(component.activeTab()).toBe('PRIVACY');
    expect(component.service.privacyEvaluation().zeroKnowledgeAttestationValid).toBe(true);
  });

  it('3. Verifies all evidence citations and touch target requirements', () => {
    const list = component.service.evidenceEvaluations();
    expect(list.length).toBeGreaterThanOrEqual(4);

    const ergo = component.service.ergonomicsEvaluations();
    expect(ergo.length).toBeGreaterThanOrEqual(4);
    ergo.forEach((e) => {
      expect(e.touchTargetWidthPx).toBeGreaterThanOrEqual(44);
      expect(e.touchTargetHeightPx).toBeGreaterThanOrEqual(44);
    });
  });
});
