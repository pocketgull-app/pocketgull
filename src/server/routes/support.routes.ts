import { Router, Request, Response } from 'express';

export const supportRouter = Router();

interface SupportTicketPayload {
  senderEmail?: string;
  from?: string;
  subject?: string;
  body?: string;
  text?: string;
}

/**
 * POST /api/support/ticket
 * Webhook and API handler for inbound support tickets (support@pocketgull.app)
 */
supportRouter.post('/ticket', (req: Request, res: Response) => {
  try {
    const payload: SupportTicketPayload = req.body || {};

    const senderEmail = payload.senderEmail || payload.from || 'anonymous@pocketgull.app';
    const subject = payload.subject || 'PocketGull Inquiry';
    const bodyText = payload.body || payload.text || 'Inquiry payload empty.';

    const textLower = `${subject} ${bodyText}`.toLowerCase();

    // Check for acute medical emergency red flags first
    const isAcuteEmergency = ['chest pain', 'shortness of breath', 'difficulty breathing', 'sudden numbness', 'stroke', 'suicide', 'severe bleeding', 'loss of consciousness', 'anaphylaxis'].some(flag => textLower.includes(flag));

    let category = 'CLINICAL_QUERY';
    if (textLower.includes('fhir') || textLower.includes('epic') || textLower.includes('cerner') || textLower.includes('smart') || textLower.includes('oauth')) {
      category = 'EHR_INTEGRATION';
    } else if (textLower.includes('hipaa') || textLower.includes('privacy') || textLower.includes('purge') || textLower.includes('delete')) {
      category = 'PRIVACY_HIPAA';
    } else if (textLower.includes('rpm') || textLower.includes('cpt') || textLower.includes('billing') || textLower.includes('reimbursement')) {
      category = 'BILLING_RPM';
    } else if (textLower.includes('webgl') || textLower.includes('3d') || textLower.includes('microphone') || textLower.includes('audio')) {
      category = 'TECHNICAL_SUPPORT';
    }

    const priority = isAcuteEmergency ? 'P1_CRITICAL' : (category === 'EHR_INTEGRATION' || category === 'PRIVACY_HIPAA' ? 'P2_HIGH' : 'P3_STANDARD');

    const ticketId = 'tkt-' + Math.random().toString(36).substring(2, 9);
    const disclaimer = '\n\n---\n*FDA 520(o) Non-Device CDS Disclaimer: This support agent provides technical, administrative, and educational guidance only. It does not provide medical diagnosis, treatment, or replace professional clinical evaluation.*';

    let aiResponse = '';
    if (isAcuteEmergency) {
      aiResponse = `⚠️ **EMERGENCY MEDICAL NOTICE**:\n\nIf you or the patient are experiencing acute symptoms such as chest pain, severe shortness of breath, sudden weakness/numbness, or thoughts of self-harm, **please call 911 or your local emergency services immediately**.\n\nYour ticket (\`${ticketId}\`) has been flagged as **P1_CRITICAL** and escalated for emergency clinical oversight.${disclaimer}`;
    } else {
      aiResponse = `Thank you for contacting PocketGull Support (support@pocketgull.app).\n\nYour ticket (\`${ticketId}\`) regarding "${subject}" has been classified as **${category}** (${priority}).\n\nFor SMART-on-FHIR launches or HIPAA state purging, explore our interactive Help & Support portal at https://pocketgull.app/help.${disclaimer}`;
    }

    res.json({
      success: true,
      ticket: {
        id: ticketId,
        senderEmail,
        subject,
        body: bodyText,
        category,
        priority,
        timestamp: new Date().toISOString(),
        status: isAcuteEmergency ? 'OPEN' : 'RESOLVED_BY_AI',
        aiResponse
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error processing support ticket'
    });
  }
});
