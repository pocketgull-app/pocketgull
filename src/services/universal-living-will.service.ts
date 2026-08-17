import { Injectable, signal, computed } from '@angular/core';

export interface ILivingWillPartnerOption {
  id: string;
  name: string;
  category: 'FREE_STATUTORY' | 'NON_PROFIT' | 'COMMERCIAL_PLATFORM';
  is100PercentFree: boolean;
  description: string;
  actionUrl: string;
  supportedDirectives: string[];
}

export interface IFhirConsentPayload {
  resourceType: 'Consent';
  id: string;
  status: 'active';
  scope: {
    coding: Array<{ system: string; code: string; display: string }>;
  };
  category: Array<{
    coding: Array<{ system: string; code: string; display: string }>;
  }>;
  dateTime: string;
  patient: { reference: string; display: string };
  policyRule: { text: string };
}

@Injectable({
  providedIn: 'root'
})
export class UniversalLivingWillService {

  public selectedStateCode = signal<string>('CA');

  /** Available Living Will & Advance Directive Options */
  public partnerOptions = signal<ILivingWillPartnerOption[]>([
    {
      id: 'free_statutory_state',
      name: '50-State Free Statutory Advance Health Care Directive',
      category: 'FREE_STATUTORY',
      is100PercentFree: true,
      description: 'Official U.S. State-approved statutory healthcare power of attorney & living will forms. Zero cost, no registration required.',
      actionUrl: 'https://www.caringinfo.org/planning/advance-directives/by-state/',
      supportedDirectives: ['Healthcare Power of Attorney', 'Living Will', 'DNR Preference', 'Organ Donation']
    },
    {
      id: 'freewill_nonprofit',
      name: 'FreeWill Patient Estate & Directive Portal',
      category: 'NON_PROFIT',
      is100PercentFree: true,
      description: 'Free online tool to create legally binding advance directives and living wills in under 20 minutes.',
      actionUrl: 'https://www.freewill.com/',
      supportedDirectives: ['Living Will', 'Healthcare Proxy', 'Digital Data Asset Directive']
    },
    {
      id: 'trust_and_will',
      name: 'Trust & Will Digital Estate Suite',
      category: 'COMMERCIAL_PLATFORM',
      is100PercentFree: false,
      description: 'Modern digital estate planning, revocable trusts, and HIPAA authorization releases.',
      actionUrl: 'https://trustandwill.com/',
      supportedDirectives: ['HIPAA Authorization', 'Living Will', 'Trust & Will']
    },
    {
      id: 'legalzoom_fallback',
      name: 'LegalZoom Living Directive Connector',
      category: 'COMMERCIAL_PLATFORM',
      is100PercentFree: false,
      description: 'Commercial estate planning and legal document preparation platform.',
      actionUrl: 'https://www.legalzoom.com/personal/wills-and-estates/living-will.html',
      supportedDirectives: ['Living Will', 'Power of Attorney']
    }
  ]);

  /** Generates FHIR R4 Consent resource payload for advance directive storage */
  public generateFhirConsentPayload(patientName = 'Homo Sapiens (Male, 44y)'): IFhirConsentPayload {
    return {
      resourceType: 'Consent',
      id: `consent_adv_dir_${Date.now()}`,
      status: 'active',
      scope: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/consentscope',
          code: 'adr',
          display: 'Advance Directive'
        }]
      },
      category: [{
        coding: [{
          system: 'http://loinc.org',
          code: '42348-3',
          display: 'Advance directive'
        }]
      }],
      dateTime: new Date().toISOString(),
      patient: {
        reference: 'Patient/p010',
        display: patientName
      },
      policyRule: {
        text: 'Patient preferences regarding artificial nutrition, hydration, mechanical ventilation, and healthcare proxy designation under USCDI FHIR R4 standard.'
      }
    };
  }
}
