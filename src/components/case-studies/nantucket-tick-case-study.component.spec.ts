import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NantucketTickCaseStudyComponent } from './nantucket-tick-case-study.component';
import { PatientStateService } from '../../services/patient-state.service';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';

describe('NantucketTickCaseStudyComponent', () => {
  let component: NantucketTickCaseStudyComponent;
  let fixture: ComponentFixture<NantucketTickCaseStudyComponent>;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NantucketTickCaseStudyComponent],
      providers: [
        PatientStateService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock clinical synthesis'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NantucketTickCaseStudyComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('should render the Nantucket Island case study headline and vector stats', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Vector Ecology & Multi-Organ Triage on Nantucket');
    expect(el.textContent).toContain('>40% Borrelia Rate');
    expect(el.textContent).toContain('Babesia microti');
  });

  it('should populate patient state with Nantucket Landscaper presentation upon loading case', () => {
    component.loadNantucketCaseIntoApp();
    expect(patientState.reasonForVisit()).toContain('Nantucket conservation landscaper');
    expect(patientState.vitals().hr).toBe('92');
    expect(patientState.issues()['thigh_left']).toBeDefined();
  });
});
