import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { SpecialistReferralHubComponent } from './specialist-referral-hub.component';
import { SpecialistReferralDossierService } from '../services/specialist-referral-dossier.service';
import { RxGuardService } from '../services/rx-guard.service';
import { WaveformDspEngineService } from '../services/waveform-dsp-engine.service';
import { SkepticalEpistemologyService } from '../services/skeptical-epistemology.service';

describe('SpecialistReferralHubComponent', () => {
  let component: SpecialistReferralHubComponent;
  let referralService: SpecialistReferralDossierService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SpecialistReferralHubComponent],
      providers: [
        SpecialistReferralDossierService,
        RxGuardService,
        WaveformDspEngineService,
        SkepticalEpistemologyService
      ]
    });

    referralService = TestBed.inject(SpecialistReferralDossierService);
    const fixture = TestBed.createComponent(SpecialistReferralHubComponent);
    component = fixture.componentInstance;
  });

  it('should initialize with default activeTab as preflight and not embedded', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('preflight');
    expect(component.embedded()).toBe(false);
    expect(component.specialtyList.length).toBe(4);
  });

  it('should compute gate and fhirDossier correctly for default cardiology domain', () => {
    const gate = component.gate();
    expect(gate).toBeTruthy();
    expect(gate.specialtyName).toBe('Cardiology (Cardiovascular Disease)');

    const fhirDossier = component.fhirDossier();
    expect(fhirDossier.resourceType).toBe('ServiceRequest');
    expect(fhirDossier.status).toBe('active');

    const jsonStr = component.fhirJsonString();
    expect(jsonStr).toContain('"resourceType": "ServiceRequest"');
  });

  it('should switch domain when selectDomain is called', () => {
    component.selectDomain('neurology');
    expect(referralService.selectedDomain()).toBe('neurology');
    expect(component.gate().specialtyName).toBe('Neurology (Neuro-Axonal & Autonomic)');
  });

  it('should switch activeTab and generate re-entry brief', () => {
    component.activeTab.set('reentry');
    expect(component.activeTab()).toBe('reentry');

    const brief = component.reentryBrief();
    expect(brief).toBeTruthy();
    expect(brief.crumplerPatientGuide).toBeTruthy();
    expect(brief.specialistEhrNote).toBeTruthy();
    expect(brief.pcpCoManagementContract).toBeTruthy();
  });

  it('should simulate toggle prerequisites', () => {
    component.simulateTogglePrerequisites();
    expect(component.gate()).toBeTruthy();
  });
});
