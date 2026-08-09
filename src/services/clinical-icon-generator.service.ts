import { Injectable } from '@angular/core';
import { ClinicalIcons } from '../assets/clinical-icons';

export type ClinicalIconTheme = 'western' | 'tcm' | 'ayurvedic';

export interface IClinicalIconSpec {
  svgMarkup: string;
  badgeClass: string;
  label: string;
  theme: ClinicalIconTheme;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalIconGeneratorService {
  /**
   * Resolves a theme-matched vector SVG icon spec for any clinical concept or paradigm.
   */
  getIconSpec(query: string, paradigmPreference: ClinicalIconTheme = 'western'): IClinicalIconSpec {
    const q = (query || '').toLowerCase();

    // 1. TCM / Zang-Fu Paradigm matching
    if (q.includes('tcm') || q.includes('qi') || q.includes('zang') || q.includes('meridian') || q.includes('acupressure') || q.includes('moxa') || q.includes('gua sha') || q.includes('astragalus') || q.includes('reishi')) {
      return {
        svgMarkup: ClinicalIcons.YinYang,
        badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        label: 'TCM Zang-Fu',
        theme: 'tcm'
      };
    }

    // 2. Ayurvedic Tridosha Paradigm matching
    if (q.includes('ayurveda') || q.includes('dosha') || q.includes('vata')) {
      return {
        svgMarkup: ClinicalIcons.TridoshaVata,
        badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
        label: 'Ayurvedic Vata',
        theme: 'ayurvedic'
      };
    }
    if (q.includes('pitta') || q.includes('agni') || q.includes('curcumin')) {
      return {
        svgMarkup: ClinicalIcons.TridoshaPitta,
        badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        label: 'Ayurvedic Pitta',
        theme: 'ayurvedic'
      };
    }
    if (q.includes('kapha') || q.includes('ama') || q.includes('triphala') || q.includes('shilajit')) {
      return {
        svgMarkup: ClinicalIcons.TridoshaKapha,
        badgeClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
        label: 'Ayurvedic Kapha',
        theme: 'ayurvedic'
      };
    }

    // 3. Western Allopathic & Orthomolecular matching
    if (q.includes('medication') || q.includes('pharmacy') || q.includes('drug') || q.includes('rx')) {
      return {
        svgMarkup: ClinicalIcons.Assessment,
        badgeClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
        label: 'Rx Pharmacy',
        theme: 'western'
      };
    }
    if (q.includes('ecg') || q.includes('cardio') || q.includes('vitals') || q.includes('heart')) {
      return {
        svgMarkup: ClinicalIcons.ECGWave,
        badgeClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
        label: 'Cardiovascular',
        theme: 'western'
      };
    }
    if (q.includes('dna') || q.includes('gene') || q.includes('proteomic') || q.includes('molecular')) {
      return {
        svgMarkup: ClinicalIcons.DoubleHelix,
        badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        label: 'Genomics',
        theme: 'western'
      };
    }

    // 4. Default Braun / Dieter Rams minimalist fallback
    return {
      svgMarkup: ClinicalIcons.Stethoscope,
      badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
      label: 'Clinical Allopathic',
      theme: paradigmPreference
    };
  }
}
