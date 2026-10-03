import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { IntimacyRelationshipVitalityComponent } from './intimacy-relationship-vitality.component';
import { IntimacyRelationshipVitalityService } from '../services/intimacy-relationship-vitality.service';
import { CouplesDecisionStudioService } from '../services/couples-decision-studio.service';

describe('IntimacyRelationshipVitalityComponent Unit Suite', () => {
  let component: IntimacyRelationshipVitalityComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntimacyRelationshipVitalityComponent],
      providers: [
        IntimacyRelationshipVitalityService,
        CouplesDecisionStudioService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(IntimacyRelationshipVitalityComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with cardiac subtab as default', () => {
    expect(component).toBeTruthy();
    expect(component.activeSubTab()).toBe('cardiac');
    expect(component.valuesDimensions.length).toBeGreaterThan(0);
    expect(component.fairPlayTasks.length).toBeGreaterThan(0);
  });

  it('2. Computes cardiac safety assessment based on MET stairs capacity', () => {
    const assessment = component.cardiacAssessment();
    expect(assessment).toBeDefined();
    expect(assessment.canClimbTwoFlightsStairs).toBe(true);
    expect(assessment.riskTier).toBe('LOW_RISK');
    expect(assessment.recommendations.length).toBeGreaterThan(0);
  });

  it('3. Computes couples reversibility decision gate', () => {
    const gate = component.reversibilityGate();
    expect(gate).toBeDefined();
    expect(gate.doorType).toBeDefined();
    expect(gate.safeToTestExperiment.length).toBeGreaterThan(0);
  });

  it('4. Switches between subtabs (cardiac, pacing, ergonomics, decisions)', () => {
    component.activeSubTab.set('pacing');
    expect(component.activeSubTab()).toBe('pacing');

    component.activeSubTab.set('decisions');
    expect(component.activeSubTab()).toBe('decisions');
  });

  it('5. Generates pre-mortem analysis when category changes', () => {
    component.selectedCategory = 'CAREER_PIVOT_EDUCATION';
    component.updatePreMortem();
    expect(component.preMortem().decisionTitle).toContain('Career Pivot');
  });
});
