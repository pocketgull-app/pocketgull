import { TestBed } from '@angular/core/testing';
import { FemaleCardiacAtypicalScreeningService } from './female-cardiac-atypical-screening.service';

describe('FemaleCardiacAtypicalScreeningService (Yentl Syndrome & INOCA/SCAD Guardian)', () => {
  let service: FemaleCardiacAtypicalScreeningService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FemaleCardiacAtypicalScreeningService]
    });
    service = TestBed.inject(FemaleCardiacAtypicalScreeningService);
  });

  it('should flag sex-specific elevated troponin (missed by unisex standard)', () => {
    const evaluation = service.evaluateFemaleCardiovascularProfile({
      patientAge: 48,
      gender: 'female',
      highSensitivityTroponinI_ng_L: 22.5, // Between 16 and 34
      symptoms: {
        epigastricBurningOrNausea: true,
        unexplainedProfoundFatigue: true
      }
    });

    expect(evaluation.hsTroponinInterpretation.isElevatedByFemaleStandard).toBe(true);
    expect(evaluation.hsTroponinInterpretation.missedByMaleStandard).toBe(true);
    expect(evaluation.misattributionWarning).toContain('YENTL SYNDROME PREVENTION');
  });

  it('should detect Spontaneous Coronary Artery Dissection (SCAD) in postpartum presentation', () => {
    const evaluation = service.evaluateFemaleCardiovascularProfile({
      patientAge: 34,
      gender: 'female',
      highSensitivityTroponinI_ng_L: 45.0,
      symptoms: {
        postpartumOrRecentParturition: true,
        chestDiscomfortOrPressure: true
      }
    });

    expect(evaluation.suspectedSyndrome).toBe('SCAD_DISSECTION');
    expect(evaluation.clinicalActionPlan.some(a => a.includes('Optical Coherence Tomography'))).toBe(true);
    expect(evaluation.clinicalActionPlan.some(a => a.includes('Conservative medical management'))).toBe(true);
  });

  it('should identify INOCA when coronary angiography shows no obstructive CAD', () => {
    const evaluation = service.evaluateFemaleCardiovascularProfile({
      patientAge: 56,
      gender: 'female',
      coronaryAngioObstructiveCadFound: false,
      symptoms: {
        jawNeckOrThroatPain: true,
        unexplainedProfoundFatigue: true
      }
    });

    expect(evaluation.suspectedSyndrome).toBe('INOCA_MICROVASCULAR');
    expect(evaluation.clinicalActionPlan.some(a => a.includes('Invasive Coronary Function Testing'))).toBe(true);
  });
});
