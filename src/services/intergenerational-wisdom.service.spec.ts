import { TestBed } from '@angular/core/testing';
import { IntergenerationalWisdomService } from './intergenerational-wisdom.service';

describe('IntergenerationalWisdomService', () => {
  let service: IntergenerationalWisdomService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IntergenerationalWisdomService]
    });
    service = TestBed.inject(IntergenerationalWisdomService);
  });

  it('should calculate high Transgenerational Resilience Index for robust centenarian pedigree', () => {
    const report = service.synthesizeWisdomNexus({
      pedigree: {
        generationDepth: 4,
        maternalLongevityYears: 94,
        paternalLongevityYears: 91,
        knownFamilialResilienceTraits: ['Exceptional cognitive clarity at 90+', 'Low cardiovascular calcification', 'Daily gardening'],
        transgenerationalStressors: [],
        ancestralDietaryPattern: 'Mediterranean'
      },
      elderNarrative: {
        storytellerArchetype: 'Master_Clinician',
        coreLifeLesson: 'Listen closely to the patient; they are telling you the diagnosis.',
        clinicalOrLongevityHeuristic: 'Observe hand grip firmness and gait fluidity during the initial walk from the waiting room.',
        tacitObservationTechnique: 'Auscultate bilateral carotids at end-expiration to differentiate true aortic radiation.',
        palliativeOrCopingPhilosophy: 'Peace of mind is the greatest biological immunomodulator.'
      },
      patientAge: 62
    });

    expect(report.reportId).toContain('WISDOM-NEXUS-');
    expect(report.transgenerationalResilienceIndex).toBeGreaterThan(80);
    expect(report.grandmotherHypothesisLongevityScore).toBeGreaterThan(70);
    expect(report.pedigreeAnalysis.longevityTrajectory).toBe('SUPER_CENTENARIAN_RESILIENT');
    expect(report.masterClinicianTacitHeuristics.length).toBeGreaterThanOrEqual(3);
    expect(report.fhirResourceSummary.hipaaSanitizationVerified).toBe(true);
  });

  it('should identify cardio-metabolic vulnerability when transgenerational stressors dominate', () => {
    const report = service.synthesizeWisdomNexus({
      pedigree: {
        generationDepth: 2,
        maternalLongevityYears: 64,
        paternalLongevityYears: 62,
        knownFamilialResilienceTraits: [],
        transgenerationalStressors: ['Early onset myocardial infarction', 'Severe type 2 diabetes', 'Chronic shift work'],
        ancestralDietaryPattern: 'Standard_Western'
      },
      patientAge: 45
    });

    expect(report.transgenerationalResilienceIndex).toBeLessThan(60);
    expect(report.pedigreeAnalysis.longevityTrajectory).toBe('CARDIO_METABOLIC_VULNERABLE');
  });
});
