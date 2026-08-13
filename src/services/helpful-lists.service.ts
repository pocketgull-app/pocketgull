import { Injectable, signal } from '@angular/core';

export type HelpfulListCategory = 
  | 'EMERGENCY_HOTLINES'
  | 'PATIENT_RIGHTS_LIVING_WILLS'
  | 'CLINICAL_CHECKLISTS'
  | 'MEDICARE_FINANCIAL_RESOURCES';

export interface IHelpfulListItem {
  id: string;
  category: HelpfulListCategory;
  title: string;
  subtitle: string;
  description: string;
  contactOrUrl?: string;
  actionLabel?: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class HelpfulListsService {

  public readonly curatedLists = signal<IHelpfulListItem[]>([
    // 1. Emergency Hotlines
    {
      id: 'list_988',
      category: 'EMERGENCY_HOTLINES',
      title: '🚨 988 Suicide & Crisis Lifeline',
      subtitle: '24/7 Free & Confidential Support',
      description: 'Immediate crisis counselling, suicide prevention, and emotional distress support.',
      contactOrUrl: 'tel:988',
      actionLabel: 'Call or Text 988',
      tags: ['Crisis', 'Mental Health', '24/7', 'Free']
    },
    {
      id: 'list_poison',
      category: 'EMERGENCY_HOTLINES',
      title: '🧪 Poison Help Emergency Hotline',
      subtitle: 'National Poison Control Center',
      description: 'Expert medical guidance for toxic substance exposure, drug overdose, and chemical ingestion.',
      contactOrUrl: 'tel:18002221222',
      actionLabel: 'Call 1-800-222-1222',
      tags: ['Poison Control', 'Toxicity', 'Emergency']
    },
    {
      id: 'list_vets',
      category: 'EMERGENCY_HOTLINES',
      title: '🎖️ Veterans Crisis Line',
      subtitle: 'Dedicated Support for Veterans & Families',
      description: 'Free confidential support for military veterans, active service members, and their loved ones.',
      contactOrUrl: 'tel:988',
      actionLabel: 'Dial 988, Press 1',
      tags: ['Veterans', 'Military', 'Crisis']
    },

    // 2. Patient Rights & Living Wills
    {
      id: 'list_caringinfo',
      category: 'PATIENT_RIGHTS_LIVING_WILLS',
      title: '📜 CaringInfo 50-State Statutory Living Wills',
      subtitle: 'National Hospice & Palliative Care Organization (NHPCO)',
      description: '100% Free official state-specific statutory advance directives and healthcare power of attorney forms.',
      contactOrUrl: 'https://www.caringinfo.org/planning/advance-directives/by-state/',
      actionLabel: 'Download Free State Forms',
      tags: ['Living Will', '50 States', 'Advance Directives', 'Free']
    },
    {
      id: 'list_freewill',
      category: 'PATIENT_RIGHTS_LIVING_WILLS',
      title: '🕊️ FreeWill Non-Profit Legal Directives',
      subtitle: 'Free Public Legal Document Portal',
      description: 'Self-guided online estate planning, advance directives, and beneficiary designations.',
      contactOrUrl: 'https://www.freewill.com',
      actionLabel: 'Open FreeWill Portal',
      tags: ['Legal', 'Non-Profit', 'Living Will']
    },

    // 3. Clinical Checklists
    {
      id: 'list_hedis_gaps',
      category: 'CLINICAL_CHECKLISTS',
      title: '⭐ HEDIS Star Rating Quality Care Checklist',
      subtitle: 'NCQA Value-Based Care Benchmarks',
      description: 'Colorectal screening (ages 45-75), HbA1c control (< 8.0%), blood pressure (< 140/90 mmHg), and statin therapy for CVD.',
      tags: ['HEDIS', 'Quality', 'Value-Based Care']
    },
    {
      id: 'list_loinc_scales',
      category: 'CLINICAL_CHECKLISTS',
      title: '📋 Standardized Assessment Score Cutoffs',
      subtitle: 'PHQ-9, GAD-7, C-SSRS, ISI LOINC Instruments',
      description: 'PHQ-9: 5-9 Mild, 10-14 Moderate, 15-19 Mod. Severe, 20-27 Severe; GAD-7: 5-9 Mild, 10-14 Mod, 15-21 Severe.',
      tags: ['LOINC', 'Psychometrics', 'Cutoffs']
    },

    // 4. Medicare Financial Resources
    {
      id: 'list_ssa44_appeal',
      category: 'MEDICARE_FINANCIAL_RESOURCES',
      title: '⚖️ Form SSA-44 Life-Changing Event Checklist',
      subtitle: 'Social Security Administration IRMAA Reduction',
      description: 'Requirements for appealing Medicare Part B/D surcharges following Retirement, Marriage, Divorce, or Loss of Income.',
      contactOrUrl: 'https://www.ssa.gov/forms/ssa-44.pdf',
      actionLabel: 'Download Form SSA-44 PDF',
      tags: ['Medicare', 'IRMAA', 'SSA-44', 'Appeals']
    }
  ]);

  public getListsByCategory(category: HelpfulListCategory): IHelpfulListItem[] {
    return this.curatedLists().filter(item => item.category === category);
  }
}
