import { Injectable, signal, computed } from '@angular/core';

export interface IImpactMpaComplianceRule {
  ruleId: string;
  section: string;
  ruleTitle: string;
  pocketgullComplianceGuarantee: string;
  isCompliant: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ImpactMasterProgramAgreementService {
  readonly mpaEffectiveDate = signal<string>('2025-04-01');

  readonly mpaComplianceRules = signal<IImpactMpaComplianceRule[]>([
    {
      ruleId: 'mpa_sec_4_2_a',
      section: 'Section 4.2(a)',
      ruleTitle: 'Prohibition of Data Scraping & Unsolicited Leads',
      pocketgullComplianceGuarantee: 'All referrals originate exclusively from explicit, user-initiated clicks within Pocketgull UI. Zero data scraping or automatic lead submission.',
      isCompliant: true
    },
    {
      ruleId: 'mpa_sec_4_2_b',
      section: 'Section 4.2(b)',
      ruleTitle: 'Prohibition of Fake Redirects & Bot Automation',
      pocketgullComplianceGuarantee: 'Zero automated redirects or bot software. All interactions pass Sentinel Security Guard verification.',
      isCompliant: true
    },
    {
      ruleId: 'mpa_sec_4_4',
      section: 'Section 4.4',
      ruleTitle: 'Confidential Information & Data Protection',
      pocketgullComplianceGuarantee: 'Strict HIPAA §164.514 Safe Harbor de-identification and GDPR Art. 9 & 17 client-side encryption.',
      isCompliant: true
    },
    {
      ruleId: 'mpa_sec_5_1',
      section: 'Section 5.1',
      ruleTitle: 'Representations & Applicable Law Compliance',
      pocketgullComplianceGuarantee: 'Full compliance with healthcare CDS regulations (FDA 21 CFR 520(o)) and electronic signatures.',
      isCompliant: true
    }
  ]);

  readonly isFullMpaCompliant = computed(() => 
    this.mpaComplianceRules().every(r => r.isCompliant)
  );
}
