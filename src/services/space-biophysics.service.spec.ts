import '@angular/compiler';
import { SpaceBiophysicsService } from './space-biophysics.service';

describe('SpaceBiophysicsService Unit Suite', () => {
  let service: SpaceBiophysicsService;

  beforeEach(() => {
    service = new SpaceBiophysicsService();
  });

  it('1. Initializes with default deep-space Mars transit telemetry', () => {
    const t = service.activeCrewTelemetry();
    expect(t.missionPhase).toBe('MARS_TRANSIT_AIRGAPPED');
    expect(t.missionDay).toBe(84);
    expect(t.frisenGrade).toBe(2);
    expect(service.sansRiskLevel()).toBe('MODERATE_SANS');
  });

  it('2. Correctly computes SANS risk levels across mild, moderate, and severe grades', () => {
    // Severe SANS
    service.updateTelemetry({ octTotalRetinalThicknessUm: 450, frisenGrade: 4 });
    expect(service.sansRiskLevel()).toBe('SEVERE_SANS');

    // Moderate SANS
    service.updateTelemetry({ octTotalRetinalThicknessUm: 360, frisenGrade: 2, choroidalFoldsDetected: true });
    expect(service.sansRiskLevel()).toBe('MODERATE_SANS');

    // Normal / Baseline
    service.updateTelemetry({ octTotalRetinalThicknessUm: 290, frisenGrade: 0, choroidalFoldsDetected: false, hyperopicShiftDiopters: 0 });
    expect(service.sansRiskLevel()).toBe('NORMAL');
  });

  it('3. Computes NASA Career Permissible Exposure Limit (PEL) % against 600 mSv ceiling', () => {
    service.updateTelemetry({ cumulativeDoseMsv: 300 });
    expect(service.radiationPelUsagePercent()).toBe(50.0);

    service.updateTelemetry({ cumulativeDoseMsv: 600 });
    expect(service.radiationPelUsagePercent()).toBe(100.0);
  });

  it('4. Prescribes targeted TRISH/NASA countermeasures including LBNP and 1-carbon nutritional stack', () => {
    service.updateTelemetry({
      frisenGrade: 3,
      hyperopicShiftDiopters: 1.5,
      monthlyBmdLossRatePercent: 1.4,
      urinaryNtxNmolBce: 95,
      speAlertActive: true,
    });

    const plan = service.countermeasurePlan();
    expect(plan.overallCrewFlightReadiness).toBe('STAT_COUNTERMEASURE_REQUIRED');
    expect(plan.radiationProtection.stormShelterProtocol).toContain('SPE FLUX HAZARD');
    expect(plan.musculoskeletalRegimen.bisphosphonateAntiresorptiveIndicated).toBe(true);
    expect(plan.sansMitigation.nutritionalOcularAdjuncts.some(n => n.includes('L-Methylfolate'))).toBe(true);
  });

  it('5. Exports valid FHIR R4 DiagnosticReport for NASA/TRISH telemetry exchange', () => {
    const fhir = service.exportTrishFhirBundle();
    expect(fhir['resourceType']).toBe('DiagnosticReport');
    expect((fhir['subject'] as { reference: string }).reference).toContain('Patient/ASTRONAUT');
    expect((fhir['result'] as Array<{ display: string }>).length).toBe(4);
  });
});
