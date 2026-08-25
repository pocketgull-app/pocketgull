/**
 * Single Source of Truth for Multimodal Medical Paradigm Metadata
 */
export interface IParadigmDefinition {
  id: 'western' | 'tcm' | 'ayurvedic' | 'orthomolecular';
  title: string;
  subtitle: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
}

export const PARADIGM_DEFINITIONS: Record<string, IParadigmDefinition> = {
  western: {
    id: 'western',
    title: 'Western Allopathic',
    subtitle: 'Biomarker, ICD-10 & Receptor Pharmacokinetics',
    accentColor: '#1C6AFF',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-500/30'
  },
  tcm: {
    id: 'tcm',
    title: 'Traditional Chinese Medicine',
    subtitle: 'Meridian Channel & Zang-Fu Organ Energetics',
    accentColor: '#059669',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-500/30'
  },
  ayurvedic: {
    id: 'ayurvedic',
    title: 'Ayurvedic Medicine',
    subtitle: 'Tridosha (Vata, Pitta, Kapha) & Agni Dynamics',
    accentColor: '#D97706',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-500/30'
  },
  orthomolecular: {
    id: 'orthomolecular',
    title: 'Orthomolecular Medicine',
    subtitle: 'Optimal Micronutrient, Enzyme & Cellular Density',
    accentColor: '#7C3AED',
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    badgeText: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-500/30'
  }
};
