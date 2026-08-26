import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsageLicensingPaywallModalComponent } from './usage-licensing-paywall-modal.component';
import { AppLicensingGuardService } from '../../services/app-licensing-guard.service';

describe('UsageLicensingPaywallModalComponent', () => {
  let component: UsageLicensingPaywallModalComponent;
  let fixture: ComponentFixture<UsageLicensingPaywallModalComponent>;
  let licensing: AppLicensingGuardService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [UsageLicensingPaywallModalComponent],
      providers: [AppLicensingGuardService]
    }).compileComponents();

    fixture = TestBed.createComponent(UsageLicensingPaywallModalComponent);
    component = fixture.componentInstance;
    licensing = TestBed.inject(AppLicensingGuardService);
    fixture.detectChanges();
  });

  it('should render target customer personas', () => {
    expect(component.personas.length).toBe(3);
    expect(component.personas[0].id).toBe('solo_founder');
    expect(component.personas[1].id).toBe('community_clinic');
    expect(component.personas[2].id).toBe('academic_institute');
  });

  it('should handle invalid key activation cleanly', () => {
    component.enteredKey = 'BAD-KEY';
    component.onActivateKey();
    expect(component.isActivationSuccess()).toBe(false);
    expect(component.activationMessage()).toContain('Invalid license key format');
  });

  it('should activate valid founder key successfully', () => {
    component.enteredKey = 'PG-FND-8823-9941-K4A2';
    component.onActivateKey();
    expect(component.isActivationSuccess()).toBe(true);
    expect(licensing.isLicenseActive()).toBe(true);
  });
});
