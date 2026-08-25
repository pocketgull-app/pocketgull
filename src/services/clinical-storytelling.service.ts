import { Injectable, inject } from '@angular/core';
import { PatientManagementService } from './patient-management.service';
import { ActuarialLongevityService } from './actuarial-longevity.service';
import { MOCK_PATIENTS } from '../mock-patients';

export interface IStoryAct {
  actNumber: 1 | 2 | 3;
  title: string;
  subtitle: string;
  narrative: string;
  keyInsight: string;
}

export interface IPatientStory {
  title: string;
  acts: IStoryAct[];
  projectedQaly: number;
  bioAgeDelta: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalStorytellingService {
  private patientManager = inject(PatientManagementService);
  private actuarial = inject(ActuarialLongevityService);

  public generatePatientStory(): IPatientStory {
    const selectedId = this.patientManager.selectedPatientId();
    const patientList = this.patientManager.patients();
    const patient = patientList.find(p => p.id === selectedId) || MOCK_PATIENTS[0];

    const name = patient?.name || 'Mara Santos';
    const age = patient?.age || 42;
    const vitals = patient?.vitals || { hr: '72', spO2: '98%', bp: '120/80' };
    const issuesObj = patient?.issues || {};
    const issueNames = Array.isArray(issuesObj) 
      ? issuesObj.map((i: any) => i.name || i.issue || '') 
      : Object.keys(issuesObj);
    
    const issuesStr = issueNames.filter(Boolean).length > 0 ? issueNames.filter(Boolean).join(' and ') : 'metabolic imbalance';

    const actuarialProfile = this.actuarial.calculateActuarialProfile(vitals, 75, age);

    const act1: IStoryAct = {
      actNumber: 1,
      title: 'Act I: The Awakening (Understanding the Terrain)',
      subtitle: 'Recognizing inherited patterns and current bodily signals',
      narrative: `Every human life is a multi-generational relay race. For ${name}, at age ${age}, the body began sending subtle signals—manifesting as ${issuesStr}. Rather than viewing these symptoms as defects, TED research teaches us to see them as wise alarm signals from an ancient cellular defense network operating under stress.`,
      keyInsight: 'Symptoms are not enemies to suppress; they are vital signals calling for multi-paradigm realignment.'
    };

    const act2: IStoryAct = {
      actNumber: 2,
      title: 'Act II: The Multi-Paradigm Quest (Mobilizing Allies)',
      subtitle: 'Combining Western precision, TCM essence, and Ayurvedic balance',
      narrative: `Armed with clarity, ${name} mobilizes a coalition of healing allies. Western genetics provides targeted L-5-Methylfolate to bypass MTHFR mutations and CoQ10 Ubiquinol to recharge cellular mitochondria. Eastern TCM restores meridian Qi and calms the Shen, while Ayurvedic Rasayanas awaken digestive Agni. Autonomic vagal tone breathing at 6.0 bpm acts as a daily anchor, lowering baseline stress.`,
      keyInsight: 'True healing happens at the intersection of molecular precision and daily autonomic co-regulation.'
    };

    const act3: IStoryAct = {
      actNumber: 3,
      title: 'Act III: The Rejuvenated Horizon (Legacy & Longevity)',
      subtitle: 'Reclaiming biological youth and empowering future generations',
      narrative: `As multi-paradigm protocols take root, the actuarial horizon transforms. Quantitative hazard modeling projects a biological age reset of ${actuarialProfile.biologicalAgeDelta} years, unlocking +${actuarialProfile.projectedQalyGain} Quality-Adjusted Life Years. More than personal vitality, ${name}'s pre-conception and family health choices protect offspring DNA, leaving a thriving legacy for generations to come.`,
      keyInsight: 'By optimizing your health today, you rewrite the epigenetic story for your entire family tree.'
    };

    return {
      title: `The Hero Journey of ${name}: From Cellular Stress to Epigenetic Rejuvenation`,
      acts: [act1, act2, act3],
      projectedQaly: actuarialProfile.projectedQalyGain,
      bioAgeDelta: actuarialProfile.biologicalAgeDelta
    };
  }
}
