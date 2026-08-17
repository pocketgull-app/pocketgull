import { TestBed } from '@angular/core/testing';
import { AutoimmuneMultiSystemDelayReducerService } from './autoimmune-multi-system-delay-reducer.service';

describe('AutoimmuneMultiSystemDelayReducerService (Autoimmune & Endometriosis Accelerator)', () => {
  let service: AutoimmuneMultiSystemDelayReducerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AutoimmuneMultiSystemDelayReducerService]
    });
    service = TestBed.inject(AutoimmuneMultiSystemDelayReducerService);
  });

  it('should synthesize Lupus (SLE) multi-system features and generate ACR/EULAR referral', () => {
    const report = service.synthesizeMultiSystemComplaints({
      patientAge: 29,
      gender: 'female',
      symptomsDurationMonths: 24,
      symptoms: {
        malarOrDiscoidRash: true,
        photosensitivity: true,
        symmetricalJointSwelling: true,
        alopeciaNonScarring: true
      },
      laboratoryFindings: {
        anaTiterAndPattern: '1:320 Homogeneous',
        antiDsDnaPositive: true
      }
    });

    const sle = report.suspectedConditions.find(c => c.category === 'SLE_LUPUS');
    expect(sle).toBeDefined();
    expect(sle?.clinicalLikelihoodScore).toBeGreaterThanOrEqual(90);
    expect(sle?.recommendedSerologyBattery).toContain('Anti-dsDNA (Crithidia)');
    expect(report.physicianDismissalCounterEvidence).toContain('OBJECTIVE CLINICAL DISMISSAL DEFENSE');
  });

  it('should map Endometriosis rASRM catamenial symptoms and recommend pelvic MRI protocol', () => {
    const report = service.synthesizeMultiSystemComplaints({
      patientAge: 32,
      gender: 'female',
      symptomsDurationMonths: 48,
      symptoms: {
        severeCyclicalPelvicPainOrDysmenorrhea: true,
        deepDyspareuniaOrInfertility: true
      }
    });

    const endo = report.suspectedConditions.find(c => c.category === 'ENDOMETRIOSIS_RASRM');
    expect(endo).toBeDefined();
    expect(endo?.clinicalLikelihoodScore).toBeGreaterThanOrEqual(90);
    expect(endo?.recommendedSpecialtyReferral).toContain('Minimally Invasive Gynecologic Surgery');
  });
});
