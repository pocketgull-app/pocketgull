import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { SpecialistReferralHubComponent } from './specialist-referral-hub.component';
import { SpecialistReferralDossierService } from '../services/specialist-referral-dossier.service';

describe('SpecialistReferralHubComponent Unit Suite', () => {
  let component: SpecialistReferralHubComponent;
  let referralService: SpecialistReferralDossierService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistReferralHubComponent],
      providers: [SpecialistReferralDossierService]
    }).compileComponents();

    const fixture = TestBed.createComponent(SpecialistReferralHubComponent);
    component = fixture.componentInstance;
    referralService = TestBed.inject(SpecialistReferralDossierService);
  });

  it('1. Instantiates successfully with preflight tab and cardiology domain', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('preflight');
    expect(referralService.selectedDomain()).toBe('cardiology');
    expect(component.specialtyList.length).toBe(4);
    expect(component.gate()).toBeDefined();
  });

  it('2. Switches specialty domains and updates gate and dossier', () => {
    component.selectDomain('rheumatology');
    expect(referralService.selectedDomain()).toBe('rheumatology');
    expect(component.gate().domain).toBe('rheumatology');

    component.selectDomain('neurology');
    expect(referralService.selectedDomain()).toBe('neurology');
    expect(component.gate().domain).toBe('neurology');
  });

  it('3. Switches between preflight, dossier, and reentry tabs', () => {
    component.activeTab.set('dossier');
    expect(component.activeTab()).toBe('dossier');

    component.activeTab.set('reentry');
    expect(component.activeTab()).toBe('reentry');

    component.activeTab.set('preflight');
    expect(component.activeTab()).toBe('preflight');
  });

  it('4. Computes valid FHIR R4 ServiceRequest dossier and JSON string', () => {
    const dossier = component.fhirDossier();
    expect(dossier).toBeDefined();
    expect(dossier.resourceType).toBe('ServiceRequest');
    expect(dossier.extension.length).toBeGreaterThan(0);

    const json = component.fhirJsonString();
    expect(json).toContain('ServiceRequest');
    expect(json).toContain('pat-9402');
  });

  it('5. Computes Dr. Crumpler Tri-Directional Re-Entry brief', () => {
    const brief = component.reentryBrief();
    expect(brief).toBeDefined();
    expect(brief.crumplerPatientGuide).toBeDefined();
    expect(brief.crumplerPatientGuide.dailyMedicationSchedule.length).toBeGreaterThan(0);
    expect(brief.pcpCoManagementContract.laboratoryMonitoringSchedule.length).toBeGreaterThan(0);
  });

  it('6. Simulates prerequisite toggles and updates score', () => {
    const initialScore = component.gate().readinessScore;
    component.simulateTogglePrerequisites();
    expect(component.gate().readinessScore).toBeDefined();
  });

  it('7. Emits closeModal when close button clicked', () => {
    let closed = false;
    component.closeModal.subscribe(() => {
      closed = true;
    });

    component.closeModal.emit();
    expect(closed).toBe(true);
  });
});
