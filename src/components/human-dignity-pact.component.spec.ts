import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HumanDignityPactComponent } from './human-dignity-pact.component';
import { ExportService } from '../services/export.service';
import { PatientStateService } from '../services/patient-state.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('HumanDignityPactComponent', () => {
  let component: HumanDignityPactComponent;
  let fixture: ComponentFixture<HumanDignityPactComponent>;
  let exportService: ExportService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HumanDignityPactComponent],
      providers: [
        ExportService,
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

    fixture = TestBed.createComponent(HumanDignityPactComponent);
    component = fixture.componentInstance;
    exportService = TestBed.inject(ExportService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Human Dignity Health Charter modal header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Human Dignity Health Charter');
    expect(el.textContent).toContain('Voluntary Opt-In Open Health Pact');
  });

  it('2. Renders all 4 Braun minimalist pillars', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Voluntary Opt-In Autonomy');
    expect(el.textContent).toContain('Zero-Cost Open Access');
    expect(el.textContent).toContain('Multi-Paradigm Cultural Respect');
    expect(el.textContent).toContain('Restoring Human Connection');
  });

  it('3. Signs the charter and updates isAdopted state', () => {
    expect(component.isAdopted()).toBe(false);

    component.adoptPact();
    fixture.detectChanges();

    expect(component.isAdopted()).toBe(true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Charter Signed');
  });

  it('4. Triggers PDF export when downloadCharterPdf is invoked', () => {
    const spy = vi.spyOn(exportService, 'exportPdfReport').mockImplementation(() => Promise.resolve());

    component.downloadCharterPdf();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('HUMAN DIGNITY HEALTH CHARTER'), 'Human Dignity Health Charter');
  });

  it('5. Emits closeModal event when close is triggered', () => {
    let emitted = false;
    (component.closeModal as any).subscribe(() => {
      emitted = true;
    });

    component.closeModal.emit();
    expect(emitted).toBe(true);
  });
});
