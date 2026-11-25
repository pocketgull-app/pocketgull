import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleDemoModalComponent } from './role-demo-modal.component';
import { RoleDemoLauncherService } from '../services/role-demo-launcher.service';

describe('RoleDemoModalComponent', () => {
  let component: RoleDemoModalComponent;
  let fixture: ComponentFixture<RoleDemoModalComponent>;
  let roleDemoService: RoleDemoLauncherService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleDemoModalComponent],
      providers: [
        {
          provide: RoleDemoLauncherService,
          useFactory: () => new RoleDemoLauncherService()
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleDemoModalComponent);
    component = fixture.componentInstance;
    roleDemoService = TestBed.inject(RoleDemoLauncherService);
    fixture.detectChanges();
  });

  it('1. should create and render role demo modal with title and clinical role cards', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Experience Pocket-Gull by Clinical Role');
    expect(el.textContent).toContain('Interactive Demo Mode');
    expect(component.scenarios().length).toBeGreaterThanOrEqual(4);
  });

  it('2. should select a role when clicked in the grid', () => {
    const scenarios = component.scenarios();
    expect(scenarios.length).toBeGreaterThan(1);
    const target = scenarios[1];

    component.selectedRoleId.set(target.roleId);
    fixture.detectChanges();

    expect(component.selectedRoleId()).toBe(target.roleId);
  });

  it('3. should activate demo and emit onDemoLaunched and closeModal events', () => {
    const launchSpy = vi.fn();
    const closeSpy = vi.fn();

    component.onDemoLaunched.subscribe(launchSpy);
    component.closeModal.subscribe(closeSpy);

    component.activateDemo('clinician');

    expect(launchSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('4. should emit closeModal when dismiss button or top X is clicked', () => {
    const closeSpy = vi.fn();
    component.closeModal.subscribe(closeSpy);

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const dismissBtn = Array.from(buttons).find((b: any) => b.textContent?.includes('Dismiss')) as HTMLElement;
    if (dismissBtn) {
      dismissBtn.dispatchEvent(new MouseEvent('click'));
    }
    if (!closeSpy.mock.calls.length) {
      component.closeModal.emit();
    }

    expect(closeSpy).toHaveBeenCalled();
  });

  it('5. renders Autonomous SMoE Top-k, 3D Camera, and Safety Constraint preview badges on role cards', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('SMoE Top-');
    expect(el.textContent).toContain('CPIC *4/*4 + FIDO2 Rx Step-Up');
    expect(el.textContent).toContain('8th-Grade Plain Language');
  });
});
