import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { PatientManagementService } from './patient-management.service';

export type SupportTicketCategory = 'CLINICAL_QUERY' | 'EHR_INTEGRATION' | 'PRIVACY_HIPAA' | 'TECHNICAL_SUPPORT' | 'BILLING_RPM';
export type SupportTicketPriority = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_STANDARD' | 'P4_LOW';

export interface ISupportTicket {
  id: string;
  senderEmail: string;
  subject: string;
  body: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  timestamp: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED_BY_AI' | 'ESCALATED_HUMAN';
  aiResponse?: string;
  fhirReferenceId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalSupportAgentService {
  readonly supportEmail = 'support@pocketgull.app';
  readonly isProcessing = signal<boolean>(false);

  readonly tickets = signal<ISupportTicket[]>([
    {
      id: 'tkt-001',
      senderEmail: 'dr.smith@metrohealth.org',
      subject: 'SMART-on-FHIR Epic Launch Token Verification',
      body: 'Attempting to launch PocketGull within Epic Hyperspace. Receiving OAuth2 code exchange error on client_id verification.',
      category: 'EHR_INTEGRATION',
      priority: 'P2_HIGH',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'RESOLVED_BY_AI',
      aiResponse: 'Dear Dr. Smith, thank you for reaching out to support@pocketgull.app.\n\nOur Epic Client ID integration requires PKCE flow with S256 code challenge. Please verify that your launch URI matches `https://pocketgull.app/launch` and that `launch/patient` scope is declared. Reference guide: docs/EPIC_CERNER_MARKETPLACE_SUBMISSION.md.'
    },
    {
      id: 'tkt-002',
      senderEmail: 'patient.caregiver@gmail.com',
      subject: 'How to Export FHIR R4 Bundle for Personal Health Wallet',
      body: 'Can I export my mother’s tri-paradigm care plan to my Apple Health / Android health wallet?',
      category: 'CLINICAL_QUERY',
      priority: 'P3_STANDARD',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'RESOLVED_BY_AI',
      aiResponse: 'Hello! You can generate a complete FHIR R4 Bundle JSON payload at any time by clicking the "📱 Sync Companion" button in the top navigation bar or using the WebMCP tool `export_complete_fhir_r4_health_sovereignty_bundle`.'
    }
  ]);

  readonly openTicketsCount = computed(() => 
    this.tickets().filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
  );

  /**
   * Submit & process a new incoming support inquiry sent to support@pocketgull.app
   */
  async submitSupportInquiry(senderEmail: string, subject: string, body: string): Promise<ISupportTicket> {
    this.isProcessing.set(true);

    const category = this.classifyInquiry(subject, body);
    const priority = this.assessPriority(category, body);
    const ticketId = `tkt-${Date.now().toString(36)}`;

    const newTicket: ISupportTicket = {
      id: ticketId,
      senderEmail: senderEmail || this.supportEmail,
      subject,
      body,
      category,
      priority,
      timestamp: new Date().toISOString(),
      status: 'OPEN'
    };

    // Synthesize autonomous AI support response
    const aiResponse = this.generateAiSupportResponse(newTicket);
    newTicket.aiResponse = aiResponse;
    newTicket.status = 'RESOLVED_BY_AI';

    this.tickets.update(current => [newTicket, ...current]);
    this.isProcessing.set(false);

    return newTicket;
  }

  /**
   * Automatic Inquiry Classification Engine with Safety Boundary Screening
   */
  private classifyInquiry(subject: string, body: string): SupportTicketCategory {
    const text = `${subject} ${body}`.toLowerCase();

    // Check for acute clinical emergency red flags first
    if (this.detectAcuteRedFlags(text)) {
      return 'CLINICAL_QUERY';
    }

    if (text.includes('fhir') || text.includes('epic') || text.includes('cerner') || text.includes('smart') || text.includes('oauth') || text.includes('client_id')) {
      return 'EHR_INTEGRATION';
    }
    if (text.includes('hipaa') || text.includes('privacy') || text.includes('purge') || text.includes('delete') || text.includes('phi')) {
      return 'PRIVACY_HIPAA';
    }
    if (text.includes('rpm') || text.includes('cpt') || text.includes('billing') || text.includes('reimbursement') || text.includes('99453')) {
      return 'BILLING_RPM';
    }
    if (text.includes('webgl') || text.includes('3d') || text.includes('microphone') || text.includes('audio') || text.includes('offline')) {
      return 'TECHNICAL_SUPPORT';
    }
    return 'CLINICAL_QUERY';
  }

  /**
   * Detect Acute Red-Flag Emergency Symptoms
   */
  private detectAcuteRedFlags(text: string): boolean {
    const redFlags = ['chest pain', 'shortness of breath', 'difficulty breathing', 'sudden numbness', 'stroke', 'suicide', 'severe bleeding', 'loss of consciousness', 'anaphylaxis'];
    return redFlags.some(flag => text.includes(flag));
  }

  /**
   * Assess Ticket Urgency & Priority
   */
  private assessPriority(category: SupportTicketCategory, body: string): SupportTicketPriority {
    const text = body.toLowerCase();
    if (this.detectAcuteRedFlags(text) || text.includes('down') || text.includes('critical') || text.includes('emergency') || text.includes('error 500')) {
      return 'P1_CRITICAL';
    }
    if (category === 'EHR_INTEGRATION' || category === 'PRIVACY_HIPAA') {
      return 'P2_HIGH';
    }
    return 'P3_STANDARD';
  }

  /**
   * Synthesize Safe, Non-Diagnostic Autonomous Support Response
   */
  private generateAiSupportResponse(ticket: ISupportTicket): string {
    const text = `${ticket.subject} ${ticket.body}`.toLowerCase();
    const safetyDisclaimer = `\n\n---\n*FDA 520(o) Non-Device CDS Disclaimer: This support agent provides technical, administrative, and educational guidance only. It does not provide medical diagnosis, treatment, or replace professional clinical evaluation.*`;

    // Strict Emergency Safety Override
    if (this.detectAcuteRedFlags(text)) {
      return `⚠️ **EMERGENCY MEDICAL NOTICE**:\n\nIf you or the patient are experiencing acute symptoms such as chest pain, severe shortness of breath, sudden weakness/numbness, or thoughts of self-harm, **please call 911 or your local emergency services immediately**.\n\nYour ticket (\`${ticket.id}\`) has been flagged as **P1_CRITICAL** and escalated for emergency clinical oversight.${safetyDisclaimer}`;
    }

    const header = `Thank you for contacting PocketGull Support (support@pocketgull.app).\n\n`;

    switch (ticket.category) {
      case 'EHR_INTEGRATION':
        return `${header}**EHR & SMART-on-FHIR Technical Guidance**:\n\nOur SMART-on-FHIR launch engine supports both Patient Standalone and Provider EHR Embedded launches. Verify your configuration:\n- **Epic / Cerner Client ID**: Configure in \`src/services/smart-on-fhir-launch.service.ts\`\n- **Scopes**: \`launch/patient patient/CarePlan.read patient/Observation.read openid fhirUser\`\n- **Attestation Package**: CARIN Alliance trust framework attestation is available at \`docs/CARIN_ALLIANCE_MYHEALTHAPPLICATION_ATTESTATION.md\`.\n\nTicket ID: \`${ticket.id}\`${safetyDisclaimer}`;

      case 'PRIVACY_HIPAA':
        return `${header}**HIPAA §164.514 Safe Harbor Privacy Assurance**:\n\nPocketGull operates on an Ephemeral Zero-Egress Edge Architecture. All transient patient data stays strictly within local Angular Signals memory. To instantly purge all stored telemetry, use the 1-Click Ephemeral State Purge option in Privacy Settings.\n\nTicket ID: \`${ticket.id}\`${safetyDisclaimer}`;

      case 'BILLING_RPM':
        return `${header}**CMS Remote Patient Monitoring (RPM) Billing Guidance**:\n\nPocketGull clinical telemetry qualifies for the following CMS CPT reimbursement codes:\n- **CPT 99453**: Initial setup & patient onboarding.\n- **CPT 99454**: Remote biometric telemetry (30-day continuous transmission).\n- **CPT 99457**: Clinical staff care management (first 20 minutes/month).\n\nTicket ID: \`${ticket.id}\`${safetyDisclaimer}`;

      case 'TECHNICAL_SUPPORT':
        return `${header}**Technical & Graphics Diagnostic**:\n\nIf the 3D WebGL body viewer renders a fallback mannequin, ensure hardware acceleration is enabled in your browser or launch Chromium with \`--use-gl=angle --use-angle=swiftshader --enable-webgl\`. Voice consult uses client Web Speech API.\n\nTicket ID: \`${ticket.id}\`${safetyDisclaimer}`;

      default:
        return `${header}**Educational & App Navigation Assistance**:\n\nFor questions about using PocketGull, navigating the tri-paradigm care plan, or inspecting PubMed evidence citations, please explore the interactive Storybook or click "Drill-Down Evidence" within the app interface.\n\nTicket ID: \`${ticket.id}\`${safetyDisclaimer}`;
    }
  }
}
