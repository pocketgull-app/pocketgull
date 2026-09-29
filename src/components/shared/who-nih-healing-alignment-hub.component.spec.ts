import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhoNihHealingAlignmentHubComponent } from './who-nih-healing-alignment-hub.component';
import { WhoNihHealingGoalsService } from '../../services/who-nih-healing-goals.service';
import { GlobalHealingParadigmsService } from '../../services/global-healing-paradigms.service';
import { PatientStateService } from '../../services/patient-state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('WhoNihHealingAlignmentHubComponent Unit Suite', () => {
  let component: WhoNihHealingAlignmentHubComponent;
  let fixture: ComponentFixture<WhoNihHealingAlignmentHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhoNihHealingAlignmentHubComponent, HttpClientTestingModule],
      providers: [WhoNihHealingGoalsService, GlobalHealingParadigmsService, PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(WhoNihHealingAlignmentHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and computes the strategic summary', () => {
    expect(component).toBeTruthy();
    const summary = component.strategicSummary();
    expect(summary.overallStrategicFulfillmentScore).toBeGreaterThanOrEqual(85);
    expect(summary.activeStrategicGoals.length).toBe(6);
  });

  it('2. Filters strategic goals by governing body', () => {
    component.activeFilter.set('who');
    fixture.detectChanges();
    expect(component.filteredGoals().length).toBe(3);
    expect(component.filteredGoals().every(g => g.governingBody === 'WHO')).toBe(true);

    component.activeFilter.set('nih');
    fixture.detectChanges();
    expect(component.filteredGoals().length).toBe(3);
    expect(component.filteredGoals().every(g => g.governingBody === 'NIH')).toBe(true);
  });

  it('3. Renders Machine Learning Contextual Assurance parameters', () => {
    component.activeFilter.set('ml_assurance');
    fixture.detectChanges();
    const ml = component.strategicSummary().machineLearningAssurance;
    expect(ml.conformalPredictionCoveragePercent).toBe(95.2);
    expect(ml.epistemicOodUncertaintyScore).toBeLessThan(0.15);
  });

  it('4. Exposes WHO ICD-11 Chapter 26 Traditional Medicine Table', () => {
    component.activeFilter.set('ictm_chapter26');
    fixture.detectChanges();
    const ictm = component.strategicSummary().whoIctmCodifiedDiagnoses;
    expect(ictm.length).toBe(3);
    expect(ictm[0].ictmCode).toBe('TM-TM12.1');
  });
});
