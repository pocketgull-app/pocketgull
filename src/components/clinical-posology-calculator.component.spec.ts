import '@angular/compiler';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { ClinicalPosologyCalculatorComponent } from './clinical-posology-calculator.component';
import { PatientStateService } from '../services/patient-state.service';
import { ClinicalPosologyService } from '../services/clinical-posology.service';
import { EnvironmentalHeatPosologyService } from '../services/environmental-heat-posology.service';
import { ComplexAdaptiveSystemsService } from '../services/complex-adaptive-systems.service';

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
      }),
      addChecklistItem: vi.fn(),
      logEnterpriseAudit: vi.fn()
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockState },
      ClinicalPosologyService,
      EnvironmentalHeatPosologyService,
      ComplexAdaptiveSystemsService
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

  it('8. Switches to SFI complex adaptive systems tier and computes WBE allometry and CSD metrics', () => {
    component.selectAgeTier('sfi_complex_adaptive');
    expect(component.activeAgeTier()).toBe('sfi_complex_adaptive');

    const allometric = component.sfiAllometricResult();
    expect(allometric.allometricMetabolicFactor).toBeGreaterThan(0);
    expect(allometric.wbeCalibratedClearanceRateMlMin).toBeGreaterThan(0);

    const csd = component.sfiCsdMetrics();
    expect(csd.earlyWarningLeadTimeHours).toBeDefined();
    expect(csd.tippingPointAcuity).toBeDefined();

    const hypergraph = component.sfiHypergraphResult();
    expect(hypergraph.hyperedgeOrder).toBeGreaterThan(0);
    expect(hypergraph.attractorBasinState).toBeDefined();
  });

  it('9. Computes Structured 3-Act Trajectory across environmental heat and geriatric tiers', () => {
    // Environmental Heat Tier
    component.selectAgeTier('environmental_heat');
    const heatTraj = component.posologyTrajectory();
    expect(heatTraj.act1WhereYouveBeen.title).toContain('Heat');
    expect(heatTraj.act1WhereYouveBeen.baselineFactors.length).toBeGreaterThan(0);
    expect(heatTraj.act2WhereYouStandToday.calibratedDosage).toContain('Diphenhydramine');
    expect(heatTraj.act2WhereYouStandToday.hydrationTarget).toContain('2,500 mL');
    expect(heatTraj.act3WhereYoureGoing.warningSignsToMonitor.length).toBeGreaterThanOrEqual(3);
    expect(heatTraj.act3WhereYoureGoing.homeCareWatchWindow).toBe('Next 48 Hours');

    // Geriatric Elder Tier
    component.selectAgeTier('geriatric_elder');
    const elderTraj = component.posologyTrajectory();
    expect(elderTraj.act1WhereYouveBeen.title).toContain('Renal Reserve');
    expect(elderTraj.act2WhereYouStandToday.clinicalSafetyStamp).toContain('Beers');
    expect(elderTraj.act3WhereYoureGoing.warningSignsToMonitor.some(s => s.toLowerCase().includes('unsteady'))).toBe(true);
  });

  it('10. Toggles persona between Clinician CDS lens and Family Teaspoon lens', () => {
    expect(component.personaMode()).toBe('clinician');
    component.togglePersona('family');
    expect(component.personaMode()).toBe('family');

    const traj = component.posologyTrajectory();
    expect(traj.act1WhereYouveBeen.plainLanguageRationale).toBeDefined();
    expect(traj.act2WhereYouStandToday.plainLanguageAdvice).toBeDefined();
    expect(traj.act3WhereYoureGoing.plainLanguageGuidance).toBeDefined();

    component.togglePersona('clinician');
    expect(component.personaMode()).toBe('clinician');
  });

  it('11. Applies calibrated dose to care plan, copies FHIR R4 MedicationStatement, and exports ASU Python simulation', () => {
    // Mock navigator.clipboard
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    (globalThis as any).navigator.clipboard = { writeText: writeTextSpy };

    // Apply to Care Plan
    component.applyToCarePlan();
    expect(mockState.addChecklistItem).toHaveBeenCalled();
    expect(mockState.logEnterpriseAudit).toHaveBeenCalledWith(
      'AI_SYNTHESIS',
      expect.stringContaining('Posology 3-Act care plan applied')
    );
    expect(component.showAppliedToast()).toBe(true);

    // Copy FHIR R4
    component.copyFhirMedicationStatement();
    expect(writeTextSpy).toHaveBeenCalled();
    const fhirPayload = JSON.parse(writeTextSpy.mock.calls[0][0]);
    expect(fhirPayload.resourceType).toBe('MedicationStatement');
    expect(component.showCopiedFhirToast()).toBe(true);

    // Copy ASU Python Snippet
    component.copyAsuSandboxSnippet();
    expect(writeTextSpy).toHaveBeenCalledTimes(2);
    expect(writeTextSpy.mock.calls[1][0]).toContain('simulate_allometric_and_csd');
    expect(component.showCopiedAsuToast()).toBe(true);
  });
});
