import { Injectable } from '@angular/core';
import { AnalysisLens } from './clinical-intelligence.service';

export interface IClinicalActProposal {
    actNumber: number;
    actCode: string;
    actTitle: string;
    subtitle: string;
    icon: string;
    lens: AnalysisLens;
    paradigmTitles: {
        western: string;
        eastern: string;
        ayurvedic: string;
        longevity: string;
    };
    proposalFocus: string;
    actsSequenceStage: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClinicalActLensMapperService {

    public readonly CLINICAL_THEATRE_ACTS: IClinicalActProposal[] = [
        {
            actNumber: 1,
            actCode: 'ACT_I',
            actTitle: 'Act I: Triage & Clinical Overture',
            subtitle: 'Patient Baseline & Immediate Threat Orientation',
            icon: '🎭',
            lens: 'Summary Overview',
            paradigmTitles: {
                western: 'Act I: Baseline Vitals & Triage Synthesis',
                eastern: 'Act I: Zang-Fu Qi & Blood Overture',
                ayurvedic: 'Act I: Tridosha & Agni Synthesis',
                longevity: 'Act I: Circadian & Hormetic Baseline'
            },
            proposalFocus: 'Immediate threat evaluation, vital sign stability, and clinical posture alignment.',
            actsSequenceStage: 'Proposal Act 1 of 5 • Initial Exposure'
        },
        {
            actNumber: 2,
            actCode: 'ACT_II',
            actTitle: 'Act II: Diagnostic & Biomarker Matrix',
            subtitle: 'Laboratory Profiling & Differential Risk Matrix',
            icon: '🔬',
            lens: 'Treatment Matrix',
            paradigmTitles: {
                western: 'Act II: Laboratory & Diagnostic Matrix',
                eastern: 'Act II: Meridian & Pulse Diagnostic Grid',
                ayurvedic: 'Act II: Srotas & Dhatu Diagnostic Matrix',
                longevity: 'Act II: Orthomolecular & Biomarker Matrix'
            },
            proposalFocus: 'Deep laboratory probing, cost-benefit trade-off analysis, and organ system vulnerability scoring.',
            actsSequenceStage: 'Proposal Act 2 of 5 • Diagnostic Probing'
        },
        {
            actNumber: 3,
            actCode: 'ACT_III',
            actTitle: 'Act III: Active Therapeutics & Functional Protocols',
            subtitle: 'Audio-Visual Entrainment, Relocation & Chrono-Nutrition',
            icon: '⚡',
            lens: 'Functional Protocols',
            paradigmTitles: {
                western: 'Act III: Allopathic & Functional Interventions',
                eastern: 'Act III: Acupoint & Thermal-Energetic Protocols',
                ayurvedic: 'Act III: Dinacharya & Panchakarma Protocols',
                longevity: 'Act III: Biohacking & Cellular Entrainment'
            },
            proposalFocus: 'Targeted therapeutic execution, vagal tone co-regulation, micro-climate selection, and allergen elimination.',
            actsSequenceStage: 'Proposal Act 3 of 5 • Active Interventions'
        },
        {
            actNumber: 4,
            actCode: 'ACT_IV',
            actTitle: 'Act IV: Surveillance & Waveform Trajectory',
            subtitle: 'Continuous Telemetry & PhysioNet Waveform Biosensing',
            icon: '📡',
            lens: 'PhysioNet Telemetry',
            paradigmTitles: {
                western: 'Act IV: High-Frequency ECG & Biomarker Surveillance',
                eastern: 'Act IV: Channel Circulation & Stasis Monitoring',
                ayurvedic: 'Act IV: Manovaha & Ojas Trajectory Monitoring',
                longevity: 'Act IV: HRV & Autonomic Biomarker Telemetry'
            },
            proposalFocus: 'High-frequency telemetry, autonomic recovery tracking, and continuous biomarker re-evaluation.',
            actsSequenceStage: 'Proposal Act 4 of 5 • Longitudinal Surveillance'
        },
        {
            actNumber: 5,
            actCode: 'ACT_V',
            actTitle: 'Act V: Empowerment & Evidence Passport',
            subtitle: 'UK RIO Evidence Hierarchy & FHIR Care Plan Passport',
            icon: '📜',
            lens: 'Patient Education',
            paradigmTitles: {
                western: 'Act V: UK RIO Evidence & Care Plan Passport',
                eastern: 'Act V: Taoist Longevity & Patient Education',
                ayurvedic: 'Act V: Svasthavritta & Health Literacy Passport',
                longevity: 'Act V: Empirical Longevity & Health Passport'
            },
            proposalFocus: 'Plain-language health literacy, peer-reviewed evidence verification, and exportable FHIR R4 passport.',
            actsSequenceStage: 'Proposal Act 5 of 5 • Care Continuity'
        }
    ];

    /**
     * Retrieves the paradigm-specific theatrical title for a given lens and philosophy.
     */
    public getActTitleForLens(lens: AnalysisLens | string, philosophy: 'western' | 'eastern' | 'ayurvedic' | 'longevity' = 'western'): string {
        const act = this.CLINICAL_THEATRE_ACTS.find(a => a.lens === lens);
        if (!act) return String(lens);
        const paradigmKey = (philosophy === 'longevity' ? 'longevity' : philosophy) as keyof typeof act.paradigmTitles;
        return act.paradigmTitles[paradigmKey] || act.actTitle;
    }

    /**
     * Retrieves the proposal stage description for a given lens.
     */
    public getActProposal(lens: AnalysisLens | string): IClinicalActProposal | undefined {
        return this.CLINICAL_THEATRE_ACTS.find(a => a.lens === lens);
    }
}
