import '@angular/compiler';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { ClinicalPosologyCalculatorComponent } from './clinical-posology-calculator.component';
import { PatientStateService } from '../services/patient-state.service';
import { ClinicalPosologyService } from '../services/clinical-posology.service';
import { EnvironmentalHeatPosologyService } from '../services/environmental-heat-posology.service';

describe('ClinicalPosologyCalculatorComponent', () => {
  let component: ClinicalPosologyCalculatorComponent;
  let mockState: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockState = {
      activePatientSummary: signal('Homo Sapiens (Female, Neurological, 34y)'),
      vitals: signal({
        bp: '118/76',
        hr: '72',
        weight: '154 lbs',
        height: "5'6\""
      })
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockState },
      ClinicalPosologyService,
      EnvironmentalHeatPosologyService
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new ClinicalPosologyCalculatorComponent();
    });
  });

  it('1. Instantiates successfully with adult tier default', () => {
    expect(component).toBeTruthy();
    expect(component.activeAgeTier()).toBe('adult');
  });

  it('2. Switches to neonate/infant tier and calculates Fried\'s rule', () => {
    component.selectAgeTier('neonate_infant');
    expect(component.activeAgeTier()).toBe('neonate_infant');
    expect(component.friedResult().calculatedDoseMg).toBeGreaterThan(0);
    expect(component.friedResult().microboreSyringeVolumeMl).toBeGreaterThan(0);
  });

  it('3. Switches to pediatric child tier and computes Young\'s and Clark\'s rules', () => {
    component.selectAgeTier('pediatric_child');
    expect(component.activeAgeTier()).toBe('pediatric_child');
    expect(component.youngResult().calculatedDoseMg).toBeGreaterThan(0);
    expect(component.clarkResult().calculatedDoseMg).toBeGreaterThan(0);
    expect(component.fluidResult().hourlyRateMlHr).toBeGreaterThan(0);
  });

  it('4. Switches to geriatric elder tier and computes Cockcroft-Gault CrCl', () => {
    component.selectAgeTier('geriatric_elder');
    expect(component.activeAgeTier()).toBe('geriatric_elder');
    expect(component.cockcroftResult().crClMlMin).toBeGreaterThan(0);
    expect(component.cockcroftResult().renalDosingTier).toBeDefined();
    expect(component.beersRegistry.length).toBeGreaterThan(0);
  });

  it('5. Live spellcheck identifies naked decimals and trailing zeros', () => {
    component.loadPreset('naked_decimal');
    const audit = component.spellcheckAudit();
    expect(audit.isCompliant).toBe(false);
    expect(audit.violations.some(v => v.type === 'NAKED_DECIMAL')).toBe(true);

    component.applySanitized();
    expect(component.testDosageInput()).toContain('0.5 mg');
  });

  it('6. Live spellcheck identifies prohibited abbreviations and multi-paradigm styling', () => {
    component.loadPreset('prohibited_abbrev');
    const audit = component.spellcheckAudit();
    expect(audit.violations.some(v => v.type === 'PROHIBITED_ABBREVIATION')).toBe(true);

    component.loadPreset('ayurvedic_tcm');
    const ayurAudit = component.spellcheckAudit();
    expect(ayurAudit.multiParadigmFontClass).toContain('ayurvedic');
  });

  it('7. Switches to environmental heat tier and computes Stull WBGT & thermal strain', () => {
    component.selectAgeTier('environmental_heat');
    expect(component.activeAgeTier()).toBe('environmental_heat');
    expect(component.selectedStation()).toBe('KPHX');
    expect(component.ambientTempF()).toBe(114);

    const heatAssessment = component.heatPosologyAssessment();
    expect(heatAssessment.estimatedWbgtF).toBeGreaterThanOrEqual(85);
    expect(heatAssessment.anhidrosisSweatRiskPct).toBeGreaterThan(50);
    expect(heatAssessment.hourlyHydrationRequirementMl).toBeGreaterThan(600);
  });
});
