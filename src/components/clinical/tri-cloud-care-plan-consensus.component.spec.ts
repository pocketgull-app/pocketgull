import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { TriCloudCarePlanConsensusComponent } from './tri-cloud-care-plan-consensus.component';
import { TriCloudConsensusService, ITriCloudCarePlan } from '../../services/clinical-tri-cloud-consensus.service';

describe('TriCloudCarePlanConsensusComponent', () => {
  let component: TriCloudCarePlanConsensusComponent;
  let fixture: ComponentFixture<TriCloudCarePlanConsensusComponent>;
  let activeCarePlanSignal = signal<ITriCloudCarePlan | null>(null);

  const mockPlan: ITriCloudCarePlan = {
    patientId: 'PAT-PENTACLOUD-001',
    timestamp: new Date().toISOString(),
    primaryDiagnosis: 'Metabolic Dysregulation & Autonomic Fatigue',
    overallConsensusScore: 92,
    biophysicalProofMatrix: [
      {
        metric: 'Nocturnal Heart Rate Variability (rMSSD)',
        populationMean: 42,
        patientValue: 19,
        zScore: -2.3,
        pValue: 0.011,
        h0Rejected: true
      },
      {
        metric: 'Fasting Plasma Glucose (mg/dL)',
        populationMean: 88,
        patientValue: 114,
        zScore: 2.1,
        pValue: 0.018,
        h0Rejected: true
      }
    ],
    recommendations: [
      {
        provider: 'gcp',
        providerName: 'Google Cloud (Gemini 2.5)',
        model: 'gemini-2.5-flash',
        intervention: 'Chronotherapeutic Magnesium Glycinate',
        dosageOrProtocol: '400 mg PO 60 mins before sleep window',
        rationale: 'NMDA receptor antagonism and parasympathetic GABA augmentation.',
        evidenceTier: 'Tier A (RCTs)',
        pValue: 0.004,
        riskOfBiasScore: 'Low',
        paradigm: 'Western Allopathic',
        agreedBy: ['gcp', 'aws', 'azure', 'apple', 'meta'],
        consensusConfidence: 96,
        contraindications: ['Severe renal impairment (eGFR < 30)', 'Heart block']
      },
      {
        provider: 'apple',
        providerName: 'Apple Health & CareKit',
        model: 'CoreML-CareKit-Prior',
        intervention: 'Zone 2 Parasympathetic Recovery Walking',
        dosageOrProtocol: '30 mins daily at 60-70% HR max',
        rationale: 'Mitochondrial biogenesis and microvascular endothelial shear stress stabilization.',
        evidenceTier: 'Tier A (RCTs)',
        pValue: 0.008,
        riskOfBiasScore: 'Low',
        paradigm: 'On-Device Digital Biomarker',
        agreedBy: ['apple', 'gcp', 'azure'],
        consensusConfidence: 90,
        contraindications: ['Acute lower extremity trauma', 'Unstable angina']
      }
    ],
    discrepancies: [
      {
        field: 'Adaptogenic Rhodiola Rosea Initiation',
        description: 'Divergence between botanical adaptogen pacing and strict synthetic pharmaceutical mono-therapy.',
        gcpView: 'Supportive adjunct: 200 mg standardized to 3% rosavins in morning.',
        awsView: 'Requires monitoring for CYP3A4 substrate clearance acceleration.',
        azureView: 'Consider synthetic SSRI first-line if PHQ-9 > 14.',
        appleView: 'Prior clinical cohort demonstrated 14% elevation in daytime resting HR variability.',
        metaView: 'ESM-2 molecular docking indicates weak binding affinity to glucocorticoid receptors.',
        recommendedClinicianAction: 'Trial 100 mg low-dose with 14-day continuous biometric blood pressure telemetry.'
      }
    ]
  };

  beforeEach(async () => {
    activeCarePlanSignal = signal<ITriCloudCarePlan | null>(mockPlan);

    await TestBed.configureTestingModule({
      imports: [TriCloudCarePlanConsensusComponent],
      providers: [
        {
          provide: TriCloudConsensusService,
          useValue: {
            activeCarePlan: activeCarePlanSignal
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TriCloudCarePlanConsensusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render Big Five Health Matrix banner and cloud provider badges', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Big Five Clinical Consensus & Protocol Engine');
    expect(compiled.textContent).toContain('Google Cloud');
    expect(compiled.textContent).toContain('Amazon (AWS)');
    expect(compiled.textContent).toContain('Microsoft Azure');
    expect(compiled.textContent).toContain('Apple Health & CareKit');
    expect(compiled.textContent).toContain('Meta AI & ESM-2');
  });

  it('should display overall consensus score and verified protocol count', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('92%');
    expect(compiled.textContent).toContain('Agreement');
    expect(compiled.textContent).toContain('2 Verified Protocols');
    expect(compiled.textContent).toContain('All p-values < 0.05');
  });

  it('should render the Popperian null-hypothesis biophysical proof matrix table', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Popperian Null-Hypothesis (H₀) Biophysical Proof Matrix');
    expect(compiled.textContent).toContain('Nocturnal Heart Rate Variability (rMSSD)');
    expect(compiled.textContent).toContain('Fasting Plasma Glucose (mg/dL)');
    expect(compiled.textContent).toContain('-2.3σ');
    expect(compiled.textContent).toContain('+2.1σ');
    expect(compiled.textContent).toContain('REJECTED (Statistically Significant)');
  });

  it('should render synthesized Big Five care recommendation cards with dosages and contraindications', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Synthesized Big Five Care Recommendations');
    expect(compiled.textContent).toContain('Chronotherapeutic Magnesium Glycinate');
    expect(compiled.textContent).toContain('400 mg PO 60 mins before sleep window');
    expect(compiled.textContent).toContain('Severe renal impairment (eGFR < 30)');
    expect(compiled.textContent).toContain('Zone 2 Parasympathetic Recovery Walking');
    expect(compiled.textContent).toContain('96% Consensus');
  });

  it('should render the Big Five Consensus Variance Review card with all five perspectives and recommended action', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Big Five Consensus Variance Review');
    expect(compiled.textContent).toContain('Adaptogenic Rhodiola Rosea Initiation');
    expect(compiled.textContent).toContain('Supportive adjunct: 200 mg standardized');
    expect(compiled.textContent).toContain('Requires monitoring for CYP3A4');
    expect(compiled.textContent).toContain('Consider synthetic SSRI');
    expect(compiled.textContent).toContain('14% elevation in daytime resting HR variability');
    expect(compiled.textContent).toContain('ESM-2 molecular docking');
    expect(compiled.textContent).toContain('Trial 100 mg low-dose with 14-day continuous biometric');
  });

  it('should handle null care plan gracefully without errors', () => {
    activeCarePlanSignal.set(null);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Big Five Clinical Consensus & Protocol Engine');
    expect(compiled.textContent).not.toContain('Popperian Null-Hypothesis');
  });
});
