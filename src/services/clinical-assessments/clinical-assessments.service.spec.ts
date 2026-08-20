import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
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
        { provide: PatientManagementService, useValue: { activePatient: () => ({ id: 'P-TEST', history: [] }), selectedPatientId: () => 'P-TEST', selectedPatient: () => ({ id: 'P-TEST', history: [] }) } },
        { provide: PatientStateService, useValue: { selectPart: () => {}, toggleBodyPart: () => {} } },
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

  it('should calculate PHQ-9 depression score and severity tier', () => {
    service.setAnswer('phq9', 1, 3);
    service.setAnswer('phq9', 2, 3);
    service.setAnswer('phq9', 3, 2);
    service.setAnswer('phq9', 4, 2);

    expect(service.phq9Score()).toBe(10);
    expect(service.phq9Tier().label).toBe('Moderate Depression');
  });

  it('should calculate ISI insomnia severity score and tier', () => {
    service.setAnswer('isi', 1, 3);
    service.setAnswer('isi', 2, 3);
    service.setAnswer('isi', 3, 3);
    service.setAnswer('isi', 4, 3);
    service.setAnswer('isi', 5, 2);
    service.setAnswer('isi', 6, 2);

    expect(service.isiScore()).toBe(16);
    expect(service.isiTier().label).toBe('Clinical Insomnia (Moderate Severity)');
  });

  it('should calculate CVS-Q digital eye strain score and tier', () => {
    service.setAnswer('cvsq', 1, 2);
    service.setAnswer('cvsq', 2, 2);
    service.setAnswer('cvsq', 3, 1);
    service.setAnswer('cvsq', 4, 2);
    service.setAnswer('cvsq', 9, 2);
    service.setAnswer('cvsq', 10, 2);

    expect(service.cvsqScore()).toBe(11);
    expect(service.cvsqTier().label).toBe('Mild Computer Vision Syndrome (CVS)');
  });

  it('should calculate MBI burnout subscale indices (EE, DP, PA)', () => {
    service.setAnswer('mbi', 1, 3); // EE
    service.setAnswer('mbi', 2, 3); // EE
    service.setAnswer('mbi', 7, 2); // DP
    service.setAnswer('mbi', 8, 2); // DP
    service.setAnswer('mbi', 12, 2); // PA

    expect(service.mbiScore()).toBe(12);
    expect(service.mbiBreakdown().ee).toBe(6);
    expect(service.mbiBreakdown().dp).toBe(4);
    expect(service.mbiBreakdown().pa).toBe(2);
    expect(service.mbiTier().label).toBe('Low Burnout / High Autonomic Resiliency');
  });

  it('should reset assessment answers when resetAssessment is called', () => {
    service.setAnswer('moca', 1, 2);
    expect(service.mocaScore()).toBe(2);

    service.resetAssessment('moca');
    expect(service.mocaScore()).toBe(0);
  });
});

