import '@angular/compiler';
import { ClinicalSupportAgentService } from './clinical-support-agent.service';

describe('ClinicalSupportAgentService', () => {
  let service: ClinicalSupportAgentService;

  beforeEach(() => {
    service = new ClinicalSupportAgentService();
  });

  it('should be created with support@pocketgull.app configuration', () => {
    expect(service).toBeTruthy();
    expect(service.supportEmail).toBe('support@pocketgull.app');
  });

  it('should classify EHR integration inquiries correctly', async () => {
    const ticket = await service.submitSupportInquiry(
      'dr.jones@hospital.org',
      'Epic SMART launch error',
      'Getting OAuth2 client_id failure on FHIR R4 launch'
    );
    expect(ticket.category).toBe('EHR_INTEGRATION');
    expect(ticket.status).toBe('RESOLVED_BY_AI');
    expect(ticket.aiResponse).toContain('SMART-on-FHIR');
  });

  it('should classify HIPAA privacy inquiries correctly', async () => {
    const ticket = await service.submitSupportInquiry(
      'patient@example.com',
      'HIPAA PHI Purge',
      'Please purge all my transient medical state'
    );
    expect(ticket.category).toBe('PRIVACY_HIPAA');
    expect(ticket.aiResponse).toContain('Safe Harbor Privacy Assurance');
  });

  it('should classify CMS RPM billing inquiries correctly', async () => {
    const ticket = await service.submitSupportInquiry(
      'billing@clinic.org',
      'CPT 99453 Reimbursement',
      'How to bill Remote Patient Monitoring CPT 99454?'
    );
    expect(ticket.category).toBe('BILLING_RPM');
    expect(ticket.aiResponse).toContain('CPT 99453');
  });

  it('should flag acute medical red flags as P1_CRITICAL and trigger emergency referral', async () => {
    const ticket = await service.submitSupportInquiry(
      'patient@example.com',
      'Urgent medical help',
      'I am experiencing severe chest pain and shortness of breath'
    );
    expect(ticket.priority).toBe('P1_CRITICAL');
    expect(ticket.aiResponse).toContain('EMERGENCY MEDICAL NOTICE');
    expect(ticket.aiResponse).toContain('911');
  });
});
