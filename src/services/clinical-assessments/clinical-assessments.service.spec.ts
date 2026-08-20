import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { ClinicalAssessmentsService } from './clinical-assessments.service';
import { PatientManagementService } from '../patient-management.service';
import { PatientStateService } from '../patient-state.service';
import { StorageService } from '../storage.service';

describe('ClinicalAssessmentsService', () => {
  let service: ClinicalAssessmentsService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        ClinicalAssessmentsService,
        { provide: PatientManagementService, useValue: { activePatient: () => ({ id: 'P-TEST', history: [] }) } },
        { provide: PatientStateService, useValue: { toggleBodyPart: () => {} } },
        { provide: StorageService, useValue: { savePatient: () => {} } }
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(ClinicalAssessmentsService));
  });

  it('should initialize with default activeTab as phq9', () => {
    expect(service).toBeTruthy();
    expect(service.activeTab()).toBe('phq9');
    expect(service.phq9Score()).toBe(0);
  });

  it('should calculate MoCA cognitive impairment score and tier', () => {
    service.setAnswer('moca', 1, 2);
    service.setAnswer('moca', 2, 2);
    service.setAnswer('moca', 3, 2);
    service.setAnswer('moca', 4, 2);
    service.setAnswer('moca', 5, 2);
    service.setAnswer('moca', 6, 2);

    expect(service.mocaScore()).toBe(12);
    expect(service.mocaTier().label).toBe('Normal Cognitive Function');
  });

  it('should calculate AUDIT-C alcohol risk score', () => {
    service.setAnswer('auditc', 1, 3);
    service.setAnswer('auditc', 2, 2);
    service.setAnswer('auditc', 3, 2);

    expect(service.auditcScore()).toBe(7);
    expect(service.auditcTier().label).toBe('High Risk / Possible Dependence');
  });

  it('should calculate SARC-F sarcopenia & frailty risk', () => {
    service.setAnswer('sarcf', 1, 2);
    service.setAnswer('sarcf', 2, 1);
    service.setAnswer('sarcf', 3, 2);

    expect(service.sarcfScore()).toBe(5);
    expect(service.sarcfTier().label).toBe('Predictive of Sarcopenia & Frailty');
  });

  it('should calculate DN4 neuropathic pain score and confirm neuropathic component', () => {
    service.setAnswer('dn4', 1, 1);
    service.setAnswer('dn4', 2, 1);

    expect(service.dn4Score()).toBe(2);
    expect(service.dn4Tier().label).toBe('Neuropathic Pain Component Confirmed');
  });

  it('should calculate SIBI teledentistry systemic inflammatory burden', () => {
    service.setAnswer('sibi', 1, 2);
    service.setAnswer('sibi', 2, 2);
    service.setAnswer('sibi', 3, 2);
    service.setAnswer('sibi', 4, 1);

    expect(service.sibiScore()).toBe(7);
    expect(service.sibiTier().label).toBe('High Endothelial & Cardiovascular Inflammatory Burden');
  });

  it('should reset assessment answers when resetAssessment is called', () => {
    service.setAnswer('moca', 1, 2);
    expect(service.mocaScore()).toBe(2);

    service.resetAssessment('moca');
    expect(service.mocaScore()).toBe(0);
  });
});
