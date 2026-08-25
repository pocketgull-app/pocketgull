import { Injectable, signal, computed } from '@angular/core';

export interface IClinicianPeer {
  id: string;
  name: string;
  title: string;
  department: string;
  clinicName: string;
  activeMeasures: string[];
  matchScorePercent: number;
  contactEmail: string;
  status: 'Active Research' | 'Accepting Referrals' | 'On Shift Today';
}

export interface ITreatmentCenter {
  id: string;
  name?: string;
  facilityName: string;
  facilityType: 'Tertiary Academic Medical Center' | 'Functional Medicine Clinic' | 'Community Health Center' | 'Specialized Rehabilitation';
  distanceMiles: number;
  cityState: string;
  phone: string;
  accreditation: string;
  specializedPrograms: string[];
  isEmergency247: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProviderTreatmentNetworkService {
  readonly peers = signal<IClinicianPeer[]>([
    {
      id: 'peer-1',
      name: 'Dr. Eleanor Vance, MD',
      title: 'Director of Neuro-Cardiology',
      department: 'Autonomic Neuroscience Unit',
      clinicName: 'Androscoggin Integrative Health Center',
      activeMeasures: ['Vagal RSA Deceleration', 'Penrose 40Hz Gamma Entrainment', 'HRV Telemetry'],
      matchScorePercent: 98,
      contactEmail: 'e.vance@androscogginhealth.org',
      status: 'On Shift Today'
    },
    {
      id: 'peer-2',
      name: 'Dr. Marcus Thorne, PhD',
      title: 'Chief of Chemical Pathology',
      department: 'Clinical Biochemistry & Metabolism',
      clinicName: 'Androscoggin Integrative Health Center',
      activeMeasures: ['Henderson-Hasselbalch Buffering', 'GSH/GSSG Redox Potential', 'Plasma Osmolality'],
      matchScorePercent: 94,
      contactEmail: 'm.thorne@androscogginhealth.org',
      status: 'Active Research'
    },
    {
      id: 'peer-3',
      name: 'Dr. Sarah Lin, MD, MPH',
      title: 'Lead Epigenetics Specialist',
      department: 'Transgenerational Genomics',
      clinicName: 'Androscoggin Integrative Health Center',
      activeMeasures: ['Seven Generations Epigenetic Methylation', 'miR-146a Biomarkers', 'FHIR 7 Telemetry'],
      matchScorePercent: 91,
      contactEmail: 's.lin@androscogginhealth.org',
      status: 'Accepting Referrals'
    }
  ]);

  readonly treatmentCenters = signal<ITreatmentCenter[]>([
    {
      id: 'center-1',
      name: 'Androscoggin Autonomic & Neuro-Cardiology Institute',
      facilityName: 'Androscoggin Autonomic & Neuro-Cardiology Institute',
      facilityType: 'Tertiary Academic Medical Center',
      distanceMiles: 1.2,
      cityState: 'Lewiston, ME',
      phone: '(207) 555-0199',
      accreditation: 'JCAHO / Magnet Accredited',
      specializedPrograms: ['24/7 Vagal Autonomic Biofeedback', 'Post-Quantum FHIR Telemetry', 'Cardiac Rehabilitation'],
      isEmergency247: true
    },
    {
      id: 'center-2',
      name: 'Cascades Functional Medicine & Epigenetic Health',
      facilityName: 'Cascades Functional Medicine & Epigenetic Health',
      facilityType: 'Functional Medicine Clinic',
      distanceMiles: 4.8,
      cityState: 'Auburn, ME',
      phone: '(207) 555-0244',
      accreditation: 'Institute for Functional Medicine (IFM) Certified',
      specializedPrograms: ['Transgenerational Epigenetic Counseling', 'Nutritional Redox Therapy', 'Pantry Botanical Medicine'],
      isEmergency247: false
    },
    {
      id: 'center-3',
      name: 'Pine Tree Community Health & Triage Center',
      facilityName: 'Pine Tree Community Health & Triage Center',
      facilityType: 'Community Health Center',
      distanceMiles: 8.5,
      cityState: 'Portland, ME',
      phone: '(207) 555-0311',
      accreditation: 'Federally Qualified Health Center (FQHC)',
      specializedPrograms: ['Sliding Scale Primary Care', 'Public Health Sentinel Triage', 'Occupational Safety'],
      isEmergency247: true
    }
  ]);

  findPeersByMeasure(measureKeyword: string): IClinicianPeer[] {
    const kw = measureKeyword.toLowerCase();
    return this.peers().filter(p => 
      p.activeMeasures.some(m => m.toLowerCase().includes(kw)) ||
      p.department.toLowerCase().includes(kw)
    );
  }

  findTreatmentCentersByDistance(maxMiles: number = 10.0): ITreatmentCenter[] {
    return this.treatmentCenters().filter(c => c.distanceMiles <= maxMiles);
  }
}
