import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnterpriseIdentityConsoleComponent } from './enterprise-identity-console.component';
import { EnterpriseIdentityService } from '../../services/enterprise-identity.service';
import { AuthSsoService } from '../../services/auth-sso.service';
import { signal } from '@angular/core';

describe('EnterpriseIdentityConsoleComponent', () => {
  let component: EnterpriseIdentityConsoleComponent;
  let fixture: ComponentFixture<EnterpriseIdentityConsoleComponent>;
  let identityService: EnterpriseIdentityService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterpriseIdentityConsoleComponent],
      providers: [
        EnterpriseIdentityService,
        {
          provide: AuthSsoService,
          useValue: {
            user: signal(null),
            setSession: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EnterpriseIdentityConsoleComponent);
    component = fixture.componentInstance;
    identityService = TestBed.inject(EnterpriseIdentityService);
    fixture.detectChanges();
  });

  it('1. Initializes with SAML tab and pre-loaded sample assertion', async () => {
    await component.validateCurrentAssertion();
    expect(component.activeTab()).toBe('saml');
    expect(component.samlInputXml()).toContain('samlp:Response');
    expect(component.validationResult()).not.toBeNull();
    expect(component.validationResult()?.valid).toBe(true);
  });

  it('2. Switches Identity Provider preset (e.g. Entra ID)', () => {
    component.onPresetChange('entra');
    expect(identityService.idpPreset()).toBe('entra');
    expect(identityService.activeIdp().name).toContain('Microsoft Entra ID');
    expect(component.notificationMessage()).toContain('Microsoft Entra ID');
  });

  it('3. Loads Dr. Vance sample assertion and validates claims', async () => {
    await component.loadSampleAssertion('vance');
    expect(component.samlInputXml()).toContain('marcus.vance@mayo.edu');
    expect(component.validationResult()?.claims?.displayName).toBe('Dr. Marcus Vance, MD');
    expect(component.validationResult()?.claims?.clinicalRole).toBe('roles/aiplatform.user');
  });

  it('4. Authorizes clinician session via SAML validation', async () => {
    await component.validateCurrentAssertion();
    await component.authorizeSession();
    expect(component.notificationMessage()).toContain('Session Authorized!');
  });

  it('5. Switches to SCIM tab and provisions a new clinician', async () => {
    component.activeTab.set('scim');
    fixture.detectChanges();

    component.newClinicianName.set('Dr. Jonas Salk, MD');
    component.newClinicianEmail.set('j.salk@pitt.edu');
    component.newClinicianNpi.set('1122334455');

    await component.provisionClinician();

    expect(component.notificationMessage()).toContain('Provisioned clinician Dr. Jonas Salk, MD');
    const found = identityService.clinicians().find(c => c.userName === 'j.salk@pitt.edu');
    expect(found).toBeDefined();
    expect(found?.active).toBe(true);
  });

  it('6. De-provisions a clinician on shift handover and reactivates', async () => {
    const curie = identityService.clinicians().find(c => c.userName === 'dr.curie@hopkinsmedicine.org')!;
    expect(curie.active).toBe(true);

    await component.deprovisionClinician(curie);
    expect(component.notificationMessage()).toContain('De-provisioned');
    expect(identityService.getScimUser(curie.id)?.active).toBe(false);

    await component.reactivateClinician(curie);
    expect(component.notificationMessage()).toContain('Reactivated');
    expect(identityService.getScimUser(curie.id)?.active).toBe(true);
  });

  it('7. Emits close event when close button is clicked', () => {
    let closed = false;
    component.close.subscribe(() => {
      closed = true;
    });

    component.close.emit();
    expect(closed).toBe(true);
  });
});
