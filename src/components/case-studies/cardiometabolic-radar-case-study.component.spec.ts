import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardiometabolicRadarCaseStudyComponent } from './cardiometabolic-radar-case-study.component';
import { PatientStateService } from '../../services/patient-state.service';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';

describe('CardiometabolicRadarCaseStudyComponent', () => {
  let component: CardiometabolicRadarCaseStudyComponent;
  let fixture: ComponentFixture<CardiometabolicRadarCaseStudyComponent>;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardiometabolicRadarCaseStudyComponent],
      providers: [
        PatientStateService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock cardiometabolic intelligence'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CardiometabolicRadarCaseStudyComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('should render the Cardiometabolic Radar case study headline and GRADE badges', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Postprandial Pacing & AMPK Signaling Architecture');
    expect(el.textContent).toContain('GRADE A/B Grounded');
    expect(el.textContent).toContain('Generic Metformin ER');
    expect(el.textContent).toContain('Soleus Isolation');
  });

  it('should render the 3B Innovation Architecture (Breaking, Bending, Blending)', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Breaking');
    expect(el.textContent).toContain('Bending');
    expect(el.textContent).toContain('Blending');
    expect(el.textContent).toContain('Brandt & Eagleman Paradigm');
  });

  it('should calculate projected glycemic peak and velocity blunting with stepped-care interventions', () => {
    // Default has SPU (Tier 1), Circadian (Tier 1), Metformin (Tier 2) active
    expect(component.tier1Soleus()).toBe(true);
    expect(component.tier2Metformin()).toBe(true);
    expect(component.peakGlucose()).toBeLessThan(140);
    expect(component.maxVelocity()).toBeLessThan(1.5);
    expect(component.recoveryTime()).toBeLessThanOrEqual(90);
  });

  it('should trigger Level 2 Hypoglycemia Tier 4 safety stop card when hypo simulated', () => {
    component.toggleHypoSimulation();
    fixture.detectChanges();

    expect(component.isHypoSimulated()).toBe(true);
    expect(component.peakGlucose()).toBe(48);
    const card = component.activeCdsCard();
    expect(card.summary).toContain('CRITICAL Level 2 Hypoglycemia');
    expect(card.detail).toContain('Rule of 15');
    expect(card.detail).toContain('halt all physical pacing');

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('CRITICAL Level 2 Hypoglycemia');
  });

  it('should generate a valid HL7 FHIR R4 US Core Bundle with Observation components', () => {
    const bundle = component.generateFhirR4Bundle();
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.entry.length).toBe(4);

    const patientEntry = bundle.entry.find(e => e.resource.resourceType === 'Patient');
    expect(patientEntry?.resource['id']).toBe('SUBJ-7A2F');

    const carePlanEntry = bundle.entry.find(e => e.resource.resourceType === 'CarePlan');
    expect(carePlanEntry?.resource['title']).toContain('Postprandial Pacing');

    const obsEntry = bundle.entry.find(e => e.resource.resourceType === 'Observation');
    expect(obsEntry?.resource['code'].coding[0].code).toBe('99504-3'); // LOINC Interstitial Glucose
    const velComponent = obsEntry?.resource['component'].find((c: any) => c.code.coding[0].code === 'glucose-velocity');
    expect(velComponent).toBeDefined();
    expect(velComponent.valueQuantity.unit).toBe('mg/dL/min');
  });

  it('should populate patient state with SUBJ-7A2F profile upon loading case into cockpit', () => {
    component.loadCardiometabolicCaseIntoApp();
    expect(patientState.occupation()).toContain('Software Architect');
    expect(patientState.reasonForVisit()).toContain('56-year-old software architect');
    expect(patientState.vitals().bp).toBe('138/88');
    expect(patientState.issues()['pancreas_liver']).toBeDefined();
    expect(patientState.issues()['vascular_endothelium']).toBeDefined();
  });

  it('should render the Narrative Audio Podcast bar and navigate segments', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Episode 03: The Glycemic Phase Shift');
    expect(el.textContent).toContain('Dr. Sarah Carter');
    expect(el.textContent).toContain('432 Hz Vagal Bed');

    // Step to segment 2 (Dr. Marc Hamilton)
    component.podcastEngine.nextSegment();
    fixture.detectChanges();

    expect(component.podcastEngine.currentSegment().speaker).toBe('investigator');
    expect(component.podcastEngine.currentSegment().speakerTitle).toContain('Dr. Marc Hamilton');
    expect(el.textContent).toContain('Lead Biologist');

    // Stop podcast
    component.podcastEngine.stopPodcast();
    expect(component.podcastEngine.isPlaying()).toBe(false);
  });
});
