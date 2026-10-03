import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BiomedicalSuiteComponent } from './biomedical-suite.component';
import { PatientStateService } from '../../services/patient-state.service';
import { AigaModelAugmentationService } from '../../services/aiga-model-augmentation.service';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';

describe('BiomedicalSuiteComponent', () => {
  let fixture: ComponentFixture<BiomedicalSuiteComponent>;
  let component: BiomedicalSuiteComponent;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiomedicalSuiteComponent],
      providers: [
        PatientStateService,
        AigaModelAugmentationService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock CDS response'),
            streamContent: vi.fn()
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BiomedicalSuiteComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('1. should create and render header with Ground Truth badge', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Biomedical & Diagnostic Suite');
    expect(el.textContent).toContain('Ground Truth');
  });

  it('2. should display patient blood pressure and heart rate vitals', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('BP:');
    expect(el.textContent).toContain('HR:');
  });

  it('3. should bind reactive vitals from PatientStateService', () => {
    expect(component.vitals).toBe(patientState.vitals);
    expect(component.history).toBe(patientState.patientHistory);
  });
});
