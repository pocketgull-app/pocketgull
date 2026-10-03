import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbientLivingSpaceDashboardComponent } from './ambient-living-space-dashboard.component';
import { CrossBorderHealthWalletService } from '../services/cross-border-health-wallet.service';

describe('AmbientLivingSpaceDashboardComponent', () => {
  let fixture: ComponentFixture<AmbientLivingSpaceDashboardComponent>;
  let component: AmbientLivingSpaceDashboardComponent;
  let mockWalletService: { generateEmergencyWallet: any };

  beforeEach(async () => {
    mockWalletService = {
      generateEmergencyWallet: vi.fn().mockReturnValue({
        walletId: 'WALLET-9921',
        vitalsSummary: 'BP 120/80; HR 72',
        activeConditionsIcd11: ['1A00', '5A11']
      })
    };

    await TestBed.configureTestingModule({
      imports: [AmbientLivingSpaceDashboardComponent],
      providers: [
        { provide: CrossBorderHealthWalletService, useValue: mockWalletService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AmbientLivingSpaceDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create and render ambient living space dashboard header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Living Room Ambient Health Studio');
    expect(el.textContent).toContain('Ambient Co-Regulation');
  });

  it('2. should render circadian lighting and family health cards', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Circadian Room Cue');
    expect(el.textContent).toContain('Warm Amber Twilight Spectrum');
    expect(el.textContent).toContain('Family Co-Regulation');
    expect(el.textContent).toContain('Actuarial Glee Duet Singalong Session');
  });

  it('3. should generate emergency passport and trigger alert on generatePassport', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.generatePassport();

    expect(mockWalletService.generateEmergencyWallet).toHaveBeenCalledWith('English');
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('International Health Wallet Generated'));
    alertSpy.mockRestore();
  });

  it('4. should emit openGleeAlbum when singalong event is triggered', () => {
    let emitted = false;
    component.openGleeAlbum.subscribe(() => {
      emitted = true;
    });

    component.openGleeAlbum.emit();
    expect(emitted).toBe(true);
  });

  it('5. should emit closeModal when close event is triggered', () => {
    let emitted = false;
    component.closeModal.subscribe(() => {
      emitted = true;
    });

    component.closeModal.emit();
    expect(emitted).toBe(true);
  });
});
