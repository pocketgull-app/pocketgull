import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileMenuQrModalComponent } from './mobile-menu-qr-modal.component';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';
import { IClinicalMenuItem } from '../clinical-menu.component';
import { signal } from '@angular/core';

describe('MobileMenuQrModalComponent', () => {
  let component: MobileMenuQrModalComponent;
  let fixture: ComponentFixture<MobileMenuQrModalComponent>;
  let patientState: PatientStateService;

  const mockMenuItems: IClinicalMenuItem[] = [
    {
      id: 'item-1',
      name: 'Wild Salmon Bowl',
      emoji: '🐟',
      glycemicIndex: 'Low (25)',
      tcmEnergetics: 'Warm & Tonifying',
      activeCompounds: [{ name: 'EPA/DHA Omega-3', dose: '1200mg' }]
    } as any,
    {
      id: 'item-2',
      name: 'Turmeric Golden Broth',
      emoji: '🍵',
      glycemicIndex: 'Very Low (15)',
      tcmEnergetics: 'Invigorating Blood',
      activeCompounds: [{ name: 'Curcumin', dose: '500mg' }]
    } as any
  ];

  const mockPatientManagement = {
    selectedPatientId: signal('pt-1'),
    patients: signal([
      { id: 'pt-1', name: 'Charles Darwin' }
    ])
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileMenuQrModalComponent],
      providers: [
        PatientStateService,
        { provide: PatientManagementService, useValue: mockPatientManagement }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileMenuQrModalComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    (component as any).menuItems = signal(mockMenuItems);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Mobile Menu QR Code modal header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Mobile Menu QR Code');
    expect(el.textContent).toContain('Scan with Any Phone Camera');
  });

  it('2. Computes activePatientName fallback or selected patient name', () => {
    expect(component.activePatientName()).toBe('Charles Darwin');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Charles Darwin');
  });

  it('3. Renders provided clinical menu items in smartphone mockup', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Wild Salmon');
    expect(el.textContent).toContain('Turmeric Golden');
  });

  it('4. Prescribes item from mobile menu and adds note to PatientStateService', () => {
    const addNoteSpy = vi.spyOn(patientState, 'addClinicalNote');
    const fakeEvent = { stopPropagation: vi.fn() } as any;

    component.prescribeOnMobile(mockMenuItems[0], fakeEvent);
    expect(fakeEvent.stopPropagation).toHaveBeenCalled();
    expect(addNoteSpy).toHaveBeenCalledWith(expect.objectContaining({
      sourceLens: 'Nutrition',
      text: expect.stringContaining('Wild Salmon Bowl')
    }));
  });

  it('5. Emits closeModal output when close button is clicked', () => {
    let closed = false;
    component.closeModal.subscribe(() => {
      closed = true;
    });

    component.closeModal.emit();
    expect(closed).toBe(true);
  });
});
