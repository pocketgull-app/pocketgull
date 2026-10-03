import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoapNoteGeneratorComponent } from './soap-note-generator.component';
import { SoapNoteGeneratorService } from '../services/soap-note-generator.service';
import { PatientStateService } from '../services/patient-state.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('SoapNoteGeneratorComponent', () => {
  let component: SoapNoteGeneratorComponent;
  let fixture: ComponentFixture<SoapNoteGeneratorComponent>;
  let soapService: SoapNoteGeneratorService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoapNoteGeneratorComponent],
      providers: [
        SoapNoteGeneratorService,
        PatientStateService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock CDS response'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SoapNoteGeneratorComponent);
    component = fixture.componentInstance;
    soapService = TestBed.inject(SoapNoteGeneratorService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Ambient SOAP Note header and FHIR badge', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ambient Real-Time SOAP Note Generator');
    expect(el.textContent).toContain('FHIR R4 Standard');
    expect(el.textContent).toContain('Ambient Audio Telemetry Scribing Active');
  });

  it('2. Renders all 4 SOAP sections (S, O, A, P) with editable textareas', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Subjective (S)');
    expect(el.textContent).toContain('Objective (O)');
    expect(el.textContent).toContain('Assessment (A)');
    expect(el.textContent).toContain('Plan (P)');

    const textareas = el.querySelectorAll('textarea');
    expect(textareas.length).toBe(4);
  });

  it('3. Syncs vitals from patient state when refreshObjectiveFromVitals is called', () => {
    component.soap.objective.set('Stale custom text');
    component.soap.refreshObjectiveFromVitals();
    expect(component.soap.objective()).toContain('Vitals:');
  });

  it('4. Copies note text to clipboard and toggles copied state', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    component.copyNoteToClipboard();
    await Promise.resolve();

    expect(writeTextMock).toHaveBeenCalled();
    expect(component.copied()).toBe(true);
  });

  it('5. Generates FHIR R4 DocumentReference bundle when download is triggered', () => {
    const spy = vi.spyOn(soapService, 'generateFhirR4DocumentReference').mockReturnValue('{"resourceType": "Bundle"}');
    
    // Stub URL methods
    const createUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:http://localhost/mock-fhir');
    const revokeUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    component.downloadFhirBundle();
    expect(spy).toHaveBeenCalled();
    expect(createUrlSpy).toHaveBeenCalled();
    expect(revokeUrlSpy).toHaveBeenCalled();

    createUrlSpy.mockRestore();
    revokeUrlSpy.mockRestore();
  });
});
