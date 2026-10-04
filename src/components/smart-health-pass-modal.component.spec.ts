import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SmartHealthPassModalComponent } from './smart-health-pass-modal.component';
import { PatientStateService } from '../services/patient-state.service';

describe('SmartHealthPassModalComponent', () => {
  let component: SmartHealthPassModalComponent;
  let fixture: ComponentFixture<SmartHealthPassModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartHealthPassModalComponent],
      providers: [PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(SmartHealthPassModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders SMART Health Card & Cryptographic Pass header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('SMART Health Card & Cryptographic Pass');
    expect(el.textContent).toContain('FHIR R4 Verified');
    expect(el.textContent).toContain('HIPAA Safe Harbor De-Identified');
  });

  it('2. Renders patient archetype, ID, and branded QR code', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Homo Sapiens (Female, 34y)');
    expect(el.textContent).toContain('PGT-88429-FHIR');
    expect(el.querySelector('app-branded-qr-code')).toBeTruthy();
  });

  it('3. Renders clinical signals (Locus, Vitals, Popperian Null)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Primary Locus:');
    expect(el.textContent).toContain('Medial Meniscus (M23.22)');
    expect(el.textContent).toContain('Popperian Null H₀:');
  });

  it('4. Emits closeModal output on close button click', () => {
    let closed = false;
    component.closeModal.subscribe(() => {
      closed = true;
    });

    component.closeModal.emit();
    expect(closed).toBe(true);
  });

  it('5. Triggers downloadSmartPass without errors', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-pass-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue();

    expect(() => component.downloadSmartPass()).not.toThrow();

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });
});
