import { Injectable, signal, computed } from '@angular/core';

export interface IConsentRequirement {
  statute: string;
  requirementName: string;
  isMandatory: boolean;
  description: string;
  optInRequired: boolean;
}

export interface IEmergencyDispatch {
  serviceName: string;
  number: string;
  textSmsAvailable: boolean;
  specialtyType: 'General Emergency' | 'Crisis & Suicide' | 'Poison Control' | 'Veterans / First Responders';
}

export interface IJurisdictionProfile {
  jurisdictionId: string;
  displayName: string;
  regionType: 'US_STATE' | 'NATION_STATE' | 'SUPRANATIONAL_UNION';
  countryCode: string;
  stateCode?: string;
  dataPrivacyStatute: string;
  clinicalAiClassification: string;
  biometricConsentLaw: string;
  statutoryHealthAgency: string;
  electronicHealthRecordStandard: 'FHIR_US_CORE_R4' | 'FHIR_EU_EHDS' | 'FHIR_UK_CORE' | 'FHIR_CA_BASELINE' | 'FHIR_AU_BASE' | 'ABDM_FHIR_INDIA' | 'HL7_V2_JAPAN';
  approvedParadigms: string[];
  mandatoryConsents: IConsentRequirement[];
  emergencyDispatch: IEmergencyDispatch[];
  regulatoryNotes: string;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalJurisdictionMatrixService {
  readonly countryCode = signal<string>('US');
  readonly stateCode = signal<string>('CA');

  // Multi-Jurisdictional Regulatory Knowledge Base
  private readonly JURISDICTION_CATALOG: Record<string, IJurisdictionProfile> = {
    // 1. US - California
    'US-CA': {
      jurisdictionId: 'US-CA',
      displayName: 'United States — California',
      regionType: 'US_STATE',
      countryCode: 'US',
      stateCode: 'CA',
      dataPrivacyStatute: 'California Confidentiality of Medical Information Act (CMIA, Cal. Civ. Code § 56) & CCPA/CPRA',
      clinicalAiClassification: 'FDA 21 CFR 860.7 & California CalAIM Clinical Decision Support',
      biometricConsentLaw: 'CCPA § 1798.140(c) Biometric Definition & CMIA Medical Biometrics',
      statutoryHealthAgency: 'California Department of Public Health (CDPH) & DHCS (Medi-Cal)',
      electronicHealthRecordStandard: 'FHIR_US_CORE_R4',
      approvedParadigms: ['Conventional Western Allopathic', 'Functional Medicine', 'Integrative & TCM (CA Acupuncturist Board)', 'Lifestyle & Longevity Medicine'],
      mandatoryConsents: [
        {
          statute: 'CMIA § 56.10',
          requirementName: 'California CMIA Affirmative Medical Disclosure Consent',
          isMandatory: true,
          description: 'Explicit authorization required before sharing identifiable health or diagnostic records with third parties.',
          optInRequired: true
        },
        {
          statute: 'CPRA § 1798.121',
          requirementName: 'Right to Limit Use of Sensitive Personal Information',
          isMandatory: true,
          description: 'Patients have the right to restrict health and precise biometric processing to essential diagnostic delivery.',
          optInRequired: false
        }
      ],
      emergencyDispatch: [
        { serviceName: '911 Emergency Services', number: '911', textSmsAvailable: true, specialtyType: 'General Emergency' },
        { serviceName: '988 Suicide & Crisis Lifeline', number: '988', textSmsAvailable: true, specialtyType: 'Crisis & Suicide' },
        { serviceName: 'California Poison Control System', number: '1-800-222-1222', textSmsAvailable: false, specialtyType: 'Poison Control' },
        { serviceName: 'Veterans Crisis Line', number: '988 (Press 1)', textSmsAvailable: true, specialtyType: 'Veterans / First Responders' }
      ],
      regulatoryNotes: 'CalAIM ECM (Enhanced Care Management) reimburses non-medical community supports (housing, food security, environmental asthma remediation).'
    },

    // 2. US - Washington
    'US-WA': {
      jurisdictionId: 'US-WA',
      displayName: 'United States — Washington',
      regionType: 'US_STATE',
      countryCode: 'US',
      stateCode: 'WA',
      dataPrivacyStatute: 'Washington My Health My Data Act (MHMDA, RCW 19.373)',
      clinicalAiClassification: 'FDA 21 CFR & Washington State Department of Health Standards',
      biometricConsentLaw: 'RCW 19.373.010(5) Biometric Data Consent & Geofencing Ban',
      statutoryHealthAgency: 'Washington State Department of Health (DOH)',
      electronicHealthRecordStandard: 'FHIR_US_CORE_R4',
      approvedParadigms: ['Conventional Western Allopathic', 'Naturopathic Medicine (WA Naturopathic Board)', 'Functional Medicine', 'Osteopathic Manipulative Medicine'],
      mandatoryConsents: [
        {
          statute: 'MHMDA RCW 19.373.030',
          requirementName: 'Affirmative MHMDA Consumer Health Data Consent',
          isMandatory: true,
          description: 'Explicit, separate opt-in consent required prior to collecting, processing, or sharing any consumer health or biophysical metric.',
          optInRequired: true
        },
        {
          statute: 'MHMDA RCW 19.373.080',
          requirementName: 'Geofence Prohibition Notice',
          isMandatory: true,
          description: 'Strict prohibition against establishing virtual geofences within 2,000 feet of physical medical or reproductive health facilities.',
          optInRequired: false
        }
      ],
      emergencyDispatch: [
        { serviceName: '911 Emergency', number: '911', textSmsAvailable: true, specialtyType: 'General Emergency' },
        { serviceName: '988 Crisis Line', number: '988', textSmsAvailable: true, specialtyType: 'Crisis & Suicide' },
        { serviceName: 'Washington Poison Center', number: '1-800-222-1222', textSmsAvailable: false, specialtyType: 'Poison Control' }
      ],
      regulatoryNotes: 'MHMDA provides broad private right of action for unauthorized health data processing with zero pre-emption of consumer protections.'
    },

    // 3. US - Illinois
    'US-IL': {
      jurisdictionId: 'US-IL',
      displayName: 'United States — Illinois',
      regionType: 'US_STATE',
      countryCode: 'US',
      stateCode: 'IL',
      dataPrivacyStatute: 'Illinois Personal Information Protection Act (815 ILCS 530/) & HIPAA',
      clinicalAiClassification: 'FDA 21 CFR Section 520(o) Non-Device CDS',
      biometricConsentLaw: 'Illinois Biometric Information Privacy Act (BIPA, 740 ILCS 14/)',
      statutoryHealthAgency: 'Illinois Department of Public Health (IDPH)',
      electronicHealthRecordStandard: 'FHIR_US_CORE_R4',
      approvedParadigms: ['Conventional Western Allopathic', 'Integrative Medicine', 'Functional Medicine', 'Lifestyle Medicine'],
      mandatoryConsents: [
        {
          statute: 'BIPA 740 ILCS 14/15(b)',
          requirementName: 'Written Biometric Release for rPPG & Tremor Analysis',
          isMandatory: true,
          description: 'Informed written consent and retention schedule disclosure required before capturing optical rPPG pulse waveforms or micro-tremor geometry.',
          optInRequired: true
        }
      ],
      emergencyDispatch: [
        { serviceName: '911 Emergency', number: '911', textSmsAvailable: true, specialtyType: 'General Emergency' },
        { serviceName: '988 Suicide & Crisis Lifeline', number: '988', textSmsAvailable: true, specialtyType: 'Crisis & Suicide' },
        { serviceName: 'Illinois Poison Center', number: '1-800-222-1222', textSmsAvailable: false, specialtyType: 'Poison Control' }
      ],
      regulatoryNotes: 'BIPA establishes strict statutory liquidated damages per intentional/negligent biometric identifier violation.'
    },

    // 4. US - New York
    'US-NY': {
      jurisdictionId: 'US-NY',
      displayName: 'United States — New York',
      regionType: 'US_STATE',
      countryCode: 'US',
      stateCode: 'NY',
      dataPrivacyStatute: 'New York SHIELD Act (Gen. Bus. Law § 899-bb) & Article 28 Public Health Law',
      clinicalAiClassification: 'NYS Workers\' Comp Board Medical Treatment Guidelines (MTG) & FDA CDS',
      biometricConsentLaw: 'NY SHIELD Act Biometric Safeguard Mandate',
      statutoryHealthAgency: 'New York State Department of Health (NYSDOH)',
      electronicHealthRecordStandard: 'FHIR_US_CORE_R4',
      approvedParadigms: ['Conventional Western Allopathic', 'Acupuncture & Eastern Medicine (NYS Education Dept)', 'Functional Medicine'],
      mandatoryConsents: [
        {
          statute: 'NY SHIELD Act',
          requirementName: 'Reasonable Administrative & Technical Data Safeguards Notice',
          isMandatory: true,
          description: 'Verification of end-to-end TLS 1.3, AES-256 encryption, and zero-knowledge transient local storage.',
          optInRequired: false
        }
      ],
      emergencyDispatch: [
        { serviceName: '911 Emergency', number: '911', textSmsAvailable: true, specialtyType: 'General Emergency' },
        { serviceName: '988 Crisis Lifeline', number: '988', textSmsAvailable: true, specialtyType: 'Crisis & Suicide' },
        { serviceName: 'NYC Poison Control Center', number: '1-800-222-1222', textSmsAvailable: false, specialtyType: 'Poison Control' }
      ],
      regulatoryNotes: 'NYS WCB MTG establishes mandatory evidence-based treatment pathways for spine, knee, carpal tunnel, and shoulder injury claims.'
    },

    // 5. US - Texas
    'US-TX': {
      jurisdictionId: 'US-TX',
      displayName: 'United States — Texas',
      regionType: 'US_STATE',
      countryCode: 'US',
      stateCode: 'TX',
      dataPrivacyStatute: 'Texas Medical Records Privacy Act (TMRPA, Tex. Health & Safety Code § 181) & Texas Data Privacy and Security Act (TDPSA)',
      clinicalAiClassification: 'Texas Medical Board Rule § 174 (Telemedicine & CDS)',
      biometricConsentLaw: 'Texas Bus. & Com. Code § 503.001 (Capture or Use of Biometric Identifier)',
      statutoryHealthAgency: 'Texas Health and Human Services Commission (HHSC)',
      electronicHealthRecordStandard: 'FHIR_US_CORE_R4',
      approvedParadigms: ['Conventional Western Allopathic', 'Functional Medicine', 'Chiropractic & Physical Rehabilitation'],
      mandatoryConsents: [
        {
          statute: 'TMRPA § 181.101',
          requirementName: 'Texas 15-Day Electronic Medical Record Access Disclosure',
          isMandatory: true,
          description: 'Covered entities must fulfill electronic medical record export requests within 15 business days.',
          optInRequired: false
        }
      ],
      emergencyDispatch: [
        { serviceName: '911 Emergency', number: '911', textSmsAvailable: true, specialtyType: 'General Emergency' },
        { serviceName: '988 Lifeline', number: '988', textSmsAvailable: true, specialtyType: 'Crisis & Suicide' },
        { serviceName: 'Texas Poison Center Network', number: '1-800-222-1222', textSmsAvailable: false, specialtyType: 'Poison Control' }
      ],
      regulatoryNotes: 'TMRPA imposes individual training verification and civil monetary penalties for improper disclosure up to $250,000.'
    },

    // 6. European Union (EU)
    'EU': {
      jurisdictionId: 'EU',
      displayName: 'European Union (EU / EEA)',
      regionType: 'SUPRANATIONAL_UNION',
      countryCode: 'EU',
      dataPrivacyStatute: 'General Data Protection Regulation (GDPR Art. 9: Special Category Health & Genetic Data)',
      clinicalAiClassification: 'EU Artificial Intelligence Act (Regulation 2024/1689: High-Risk AI System in Healthcare) & Medical Device Regulation (EU MDR 2017/745 Class IIa/IIb)',
      biometricConsentLaw: 'GDPR Art. 9(2)(a) Explicit Consent for Biometric Identification/Analysis',
      statutoryHealthAgency: 'European Medicines Agency (EMA) & Directorate-General for Health (DG SANTE)',
      electronicHealthRecordStandard: 'FHIR_EU_EHDS',
      approvedParadigms: ['Conventional Allopathic (EMA Standard)', 'Naturopathy & Phytotherapy (Herbal Monograph HMPC)', 'Acupuncture & Anthroposophic Medicine', 'Physiotherapy & Osteopathy'],
      mandatoryConsents: [
        {
          statute: 'GDPR Article 9(2)(a)',
          requirementName: 'Explicit GDPR Article 9 Special Category Processing Consent',
          isMandatory: true,
          description: 'Explicit, freely given, specific, and unambiguous consent required prior to processing biometric, health, or genomic data.',
          optInRequired: true
        },
        {
          statute: 'EU AI Act Article 14',
          requirementName: 'Human-in-the-Loop Clinical Oversight Guarantee',
          isMandatory: true,
          description: 'High-risk clinical AI must be auditable, explainable, and supervised by a qualified healthcare professional with override capabilities.',
          optInRequired: false
        }
      ],
      emergencyDispatch: [
        { serviceName: '112 European Single Emergency Number', number: '112', textSmsAvailable: true, specialtyType: 'General Emergency' },
        { serviceName: 'National Health Services & Suicide Lifelines', number: '116 123 (Mental Support) / 112', textSmsAvailable: true, specialtyType: 'Crisis & Suicide' }
      ],
      regulatoryNotes: 'European Health Data Space (EHDS) guarantees cross-border electronic health record portability (MyHealth@EU) across 27 member states.'
    },

    // 7. United Kingdom (UK)
    'GB': {
      jurisdictionId: 'GB',
      displayName: 'United Kingdom (England, Scotland, Wales, NI)',
      regionType: 'NATION_STATE',
      countryCode: 'GB',
      dataPrivacyStatute: 'UK GDPR & Data Protection Act 2018 (Section 10 / Schedule 1)',
      clinicalAiClassification: 'MHRA Medical Device Regulations 2002 & NICE Evidence Standards Framework for Digital Health (Tier C)',
      biometricConsentLaw: 'UK GDPR Article 9 Explicit Consent',
      statutoryHealthAgency: 'Medicines and Healthcare products Regulatory Agency (MHRA) & NHS England',
      electronicHealthRecordStandard: 'FHIR_UK_CORE',
      approvedParadigms: ['NHS Conventional Allopathic', 'NICE Evidence-Based Clinical Pathways', 'Integrative & Herbal Medicine (Herbal Medicines Advisory Committee)'],
      mandatoryConsents: [
        {
          statute: 'NHS DTAC (Digital Technology Assessment Criteria)',
          requirementName: 'NHS Clinical Safety (DCB0129 / DCB0160) Compliance',
          isMandatory: true,
          description: 'Clinical safety officer risk assessment and clinical risk management file compliance.',
          optInRequired: false
        }
      ],
      emergencyDispatch: [
        { serviceName: '999 Emergency Services / 112', number: '999', textSmsAvailable: true, specialtyType: 'General Emergency' },
        { serviceName: 'NHS 111 Urgent Non-Emergency Advice', number: '111', textSmsAvailable: true, specialtyType: 'General Emergency' },
        { serviceName: 'Samaritans 24/7 Crisis Support', number: '116 123', textSmsAvailable: false, specialtyType: 'Crisis & Suicide' }
      ],
      regulatoryNotes: 'NICE Digital Health Technology (DHT) Framework benchmarks clinical effectiveness, economic impact, and interoperability with NHS Spine.'
    },

    // 8. Canada (CA)
    'CA': {
      jurisdictionId: 'CA',
      displayName: 'Canada (Federal & Provincial)',
      regionType: 'NATION_STATE',
      countryCode: 'CA',
      dataPrivacyStatute: 'PIPEDA & Provincial Health Acts (Ontario PHIPA, Quebec Law 25, Alberta HIA, BC PIPA)',
      clinicalAiClassification: 'Health Canada Software as a Medical Device (SaMD) Guidance (Class II/III)',
      biometricConsentLaw: 'PIPEDA Meaningful Consent for Biometrics',
      statutoryHealthAgency: 'Health Canada / Santé Canada & Canada Health Infoway',
      electronicHealthRecordStandard: 'FHIR_CA_BASELINE',
      approvedParadigms: ['Conventional Allopathic (Health Canada)', 'Naturopathic Medicine (Provincial Regulators)', 'Traditional Chinese Medicine & Acupuncture'],
      mandatoryConsents: [
        {
          statute: 'PHIPA / Law 25',
          requirementName: 'Express Provincial Health Privacy Consent',
          isMandatory: true,
          description: 'Express consent for collecting, using, or disclosing personal health information across provincial electronic health repositories.',
          optInRequired: true
        }
      ],
      emergencyDispatch: [
        { serviceName: '911 Emergency Services', number: '911', textSmsAvailable: true, specialtyType: 'General Emergency' },
        { serviceName: '988 Suicide Crisis Helpline (Canada-Wide)', number: '988', textSmsAvailable: true, specialtyType: 'Crisis & Suicide' },
        { serviceName: 'Canadian Poison Assistance Centers', number: '1-844-POISON-X', textSmsAvailable: false, specialtyType: 'Poison Control' }
      ],
      regulatoryNotes: 'Canada Health Infoway establishes national interoperability pan-Canadian FHIR Baseline specification.'
    },

    // 9. Australia (AU)
    'AU': {
      jurisdictionId: 'AU',
      displayName: 'Australia (Commonwealth)',
      regionType: 'NATION_STATE',
      countryCode: 'AU',
      dataPrivacyStatute: 'Privacy Act 1988 & Australian Privacy Principles (APPs, Schedule 1)',
      clinicalAiClassification: 'Therapeutic Goods Administration (TGA) Medical Device (Software) Regulations Class IIa',
      biometricConsentLaw: 'Privacy Act 1988 (Cth) Sensitive Information Consent',
      statutoryHealthAgency: 'Australian Digital Health Agency (ADHA) & TGA',
      electronicHealthRecordStandard: 'FHIR_AU_BASE',
      approvedParadigms: ['Medicare Conventional Allopathic', 'Acupuncture & Chinese Medicine (CMBA / AHPRA)', 'Naturopathy & Herbal Medicine'],
      mandatoryConsents: [
        {
          statute: 'My Health Record System Act 2012',
          requirementName: 'My Health Record Opt-In & Clinical Upload Consent',
          isMandatory: false,
          description: 'Claimant authorization for syncing health summaries with the Australian Commonwealth My Health Record portal.',
          optInRequired: true
        }
      ],
      emergencyDispatch: [
        { serviceName: '000 Triple Zero Emergency', number: '000', textSmsAvailable: false, specialtyType: 'General Emergency' },
        { serviceName: '112 Mobile Emergency Number', number: '112', textSmsAvailable: false, specialtyType: 'General Emergency' },
        { serviceName: 'Lifeline 24/7 Crisis Support', number: '13 11 14', textSmsAvailable: true, specialtyType: 'Crisis & Suicide' },
        { serviceName: 'Poisons Information Centre', number: '13 11 26', textSmsAvailable: false, specialtyType: 'Poison Control' }
      ],
      regulatoryNotes: 'ADHA My Health Record interoperates with Australian FHIR Base & AU Core for primary care and pathology reporting.'
    },

    // 10. Japan (JP)
    'JP': {
      jurisdictionId: 'JP',
      displayName: 'Japan (Nippon)',
      regionType: 'NATION_STATE',
      countryCode: 'JP',
      dataPrivacyStatute: 'Act on the Protection of Personal Information (APPI) & Next-Generation Medical Infrastructure Act',
      clinicalAiClassification: 'PMDA (Pharmaceuticals and Medical Devices Agency) AI Software as Medical Device (SaMD)',
      biometricConsentLaw: 'APPI Special Care-Required Personal Information Article 2(3)',
      statutoryHealthAgency: 'Ministry of Health, Labour and Welfare (MHLW) & PMDA',
      electronicHealthRecordStandard: 'HL7_V2_JAPAN',
      approvedParadigms: ['Western Modern Medicine', 'Kampo Medicine (MHLW National Health Insurance Covered Formulations)', 'Acupuncture & Moxibustion (Hari-Kyu)'],
      mandatoryConsents: [
        {
          statute: 'APPI Article 17(2)',
          requirementName: 'Special Care-Required Personal Information Advance Consent',
          isMandatory: true,
          description: 'Prior consent required for acquiring medical history, physical status, or diagnostic telemetry.',
          optInRequired: true
        }
      ],
      emergencyDispatch: [
        { serviceName: '119 Ambulance & Fire Services', number: '119', textSmsAvailable: false, specialtyType: 'General Emergency' },
        { serviceName: '110 Police Emergency', number: '110', textSmsAvailable: false, specialtyType: 'General Emergency' },
        { serviceName: 'Japan Suicide Prevention Hotline (TELL Japan)', number: '03-5774-0992', textSmsAvailable: false, specialtyType: 'Crisis & Suicide' },
        { serviceName: 'Japan Poison Information Center', number: '072-727-2499', textSmsAvailable: false, specialtyType: 'Poison Control' }
      ],
      regulatoryNotes: 'Kampo formulations are fully integrated into MHLW national statutory health insurance with clinical evidence guidelines.'
    },

    // 11. India (IN)
    'IN': {
      jurisdictionId: 'IN',
      displayName: 'India (Bharat)',
      regionType: 'NATION_STATE',
      countryCode: 'IN',
      dataPrivacyStatute: 'Digital Personal Data Protection Act 2023 (DPDP Act) & IT Rules (SPDI)',
      clinicalAiClassification: 'CDSCO (Central Drugs Standard Control Organisation) Medical Device Rules 2017',
      biometricConsentLaw: 'DPDP Act 2023 Section 6 Notice & Verifiable Consent',
      statutoryHealthAgency: 'National Health Authority (NHA) & Ministry of AYUSH',
      electronicHealthRecordStandard: 'ABDM_FHIR_INDIA',
      approvedParadigms: ['Allopathic Modern Medicine (NMC)', 'Ayurveda (Ministry of AYUSH)', 'Yoga & Naturopathy', 'Unani', 'Siddha', 'Homeopathy'],
      mandatoryConsents: [
        {
          statute: 'ABDM Health Data Management Policy',
          requirementName: 'ABHA (Ayushman Bharat Health Account) Consent Artifact',
          isMandatory: true,
          description: 'Electronic, revocable consent artifact required for linking health records with 14-digit ABHA address.',
          optInRequired: true
        }
      ],
      emergencyDispatch: [
        { serviceName: '112 National Emergency Number', number: '112', textSmsAvailable: true, specialtyType: 'General Emergency' },
        { serviceName: '102 / 108 Ambulance Service', number: '108', textSmsAvailable: false, specialtyType: 'General Emergency' },
        { serviceName: 'KIRAN National Mental Health Helpline', number: '1800-599-0019', textSmsAvailable: false, specialtyType: 'Crisis & Suicide' }
      ],
      regulatoryNotes: 'Ayushman Bharat Digital Mission (ABDM) unifies public/private health facilities with standard FHIR Health Information Exchange (HIE-CM).'
    }
  };

  /** Computed active jurisdiction profile based on country & state signals */
  readonly activeProfile = computed<IJurisdictionProfile>(() => {
    const country = this.countryCode().toUpperCase().trim();
    const state = this.stateCode().toUpperCase().trim();

    if (country === 'US') {
      const stateKey = `US-${state}`;
      if (this.JURISDICTION_CATALOG[stateKey]) {
        return this.JURISDICTION_CATALOG[stateKey];
      }
      // Fallback to California as baseline US state if specific state not customized
      return this.JURISDICTION_CATALOG['US-CA'];
    }

    if (this.JURISDICTION_CATALOG[country]) {
      return this.JURISDICTION_CATALOG[country];
    }

    // Default to EU for international requests outside specific catalogs
    return this.JURISDICTION_CATALOG['EU'];
  });

  /** Returns all available jurisdictions in catalog */
  public getAllJurisdictions(): IJurisdictionProfile[] {
    return Object.values(this.JURISDICTION_CATALOG);
  }

  /** Sets location signals */
  public setLocation(country: string, state?: string): void {
    if (country) this.countryCode.set(country.trim().toUpperCase());
    if (state) this.stateCode.set(state.trim().toUpperCase());
  }
}
