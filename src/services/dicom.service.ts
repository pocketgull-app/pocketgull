import { Injectable, signal, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { PatientManagementService } from './patient-management.service';

export interface IDicomStudy {
  studyInstanceUid: string;
  patientName?: string;
  patientId?: string;
  studyDate?: string;
  studyDescription?: string;
  modalities?: string[];
}

export interface IDicomSeries {
  seriesInstanceUid: string;
  modality: string;
  seriesDescription?: string;
}

export interface IDicomInstance {
  sopInstanceUid: string;
  instanceNumber?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DicomService {
  private patientState = inject(PatientStateService);
  private patientManager = inject(PatientManagementService);

  studies = signal<IDicomStudy[]>([]);
  
  // Selected state
  selectedStudy = signal<IDicomStudy | null>(null);
  selectedSeries = signal<IDicomSeries | null>(null);
  selectedInstance = signal<IDicomInstance | null>(null);

  isLoading = signal(false);
  error = signal<string | null>(null);

  mockStudies: IDicomStudy[] = [
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.phil.1',
      patientName: 'Alexander Vance',
      patientId: 'p_default_patient',
      studyDate: '20260716',
      studyDescription: 'Lumbar Spine MRI (L4-L5 herniation check)',
      modalities: ['MR']
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.p001.1',
      patientName: 'Robert Davis',
      patientId: 'p001',
      studyDate: '20260710',
      studyDescription: 'Coronary Angiogram & Chest CT (Hypertension & Apnea)',
      modalities: ['CT', 'XA']
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.p002.1',
      patientName: 'Sarah Jenkins',
      patientId: 'p002',
      studyDate: '20260715',
      studyDescription: 'Lumbar Spine MRI (L4-L5 radiculopathy check)',
      modalities: ['MR']
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.p003.1',
      patientName: 'Marcus Aurelius',
      patientId: 'p003',
      studyDate: '20260708',
      studyDescription: 'Cervical & Lumbar Spine Radiograph (Degenerative Joint)',
      modalities: ['CR']
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.p004.1',
      patientName: 'Florence Nightingale',
      patientId: 'p004',
      studyDate: '20260712',
      studyDescription: 'High-Resolution Chest CT & Autonomic Vagal Scan',
      modalities: ['CT']
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.p005.1',
      patientName: 'Hypatia of Alexandria',
      patientId: 'p005',
      studyDate: '20260714',
      studyDescription: '3T Cortical Brain MRI (Prefrontal Volumetry)',
      modalities: ['MR']
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.p006.1',
      patientName: 'Ada Lovelace',
      patientId: 'p006',
      studyDate: '20260711',
      studyDescription: 'Abdomino-Pelvic Contrast CT Scan',
      modalities: ['CT']
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.p007.1',
      patientName: 'Gregor Mendel',
      patientId: 'p007',
      studyDate: '20260709',
      studyDescription: 'Renal Parenchymal Ultrasound & Contrast CT',
      modalities: ['US', 'CT']
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.p008.1',
      patientName: 'Marie Curie',
      patientId: 'p008',
      studyDate: '20260705',
      studyDescription: 'Whole-Body PET/CT Radiation Biomarker Scan',
      modalities: ['PT', 'CT']
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.mara.1',
      patientName: 'Homo Sapiens (Female, Neurological & Methylation, 34y)',
      patientId: 'p_mara_santos',
      studyDate: '20260718',
      studyDescription: 'Postpartum Pelvic & Lumbar Spine MRI',
      modalities: ['MR']
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.frida.1',
      patientName: 'Frida Kahlo',
      patientId: 'p_frida_kahlo',
      studyDate: '20260717',
      studyDescription: '3D Full Spinal & Pelvic Reconstruction CT',
      modalities: ['CT']
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.edwin.1',
      patientName: 'Edwin Smith',
      patientId: 'p_edwin_smith_3',
      studyDate: '20260719',
      studyDescription: 'Cervical Spine Fracture Emergency CT',
      modalities: ['CT']
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.darwin.1',
      patientName: 'Charles Darwin',
      patientId: 'p_charles_darwin',
      studyDate: '20260713',
      studyDescription: 'Gastric Motility & Abdominal Ultrasound',
      modalities: ['US']
    }
  ];

  /**
   * Search for DICOM studies using QIDO-RS via proxy.
   * Strictly filters studies for the currently selected active patient.
   */
  async searchStudies(params: Record<string, string> = {}) {
    this.isLoading.set(true);
    this.error.set(null);

    const activePatient = this.patientManager.selectedPatient();
    const activePid = this.patientManager.selectedPatientId() || 'p_default_patient';
    const patientName = activePatient?.name || 'Active Patient';

    if (this.patientState.isDemoMode()) {
      // STRICT PATIENT ISOLATION: Filter studies exclusively for the active patient
      let filtered = this.mockStudies.filter(s => s.patientId === activePid || (s.patientName && s.patientName.toLowerCase() === patientName.toLowerCase()));
      
      if (filtered.length === 0) {
        // Dynamic DICOM study creation for newly added patients
        const primaryCond = activePatient?.preexistingConditions?.[0] || 'Clinical Diagnostic Assessment';
        const dynamicStudy: IDicomStudy = {
          studyInstanceUid: `1.2.840.113619.2.134.1.${activePid}.1`,
          patientName: patientName,
          patientId: activePid,
          studyDate: '20260720',
          studyDescription: `${primaryCond} Diagnostic Imaging`,
          modalities: ['CT']
        };
        filtered = [dynamicStudy];
      }
      this.studies.set(filtered);
      this.selectedStudy.set(filtered[0]);
      this.isLoading.set(false);
      return;
    }

    try {
      const queryParams = { ...params, patientId: activePid };
      const qs = new URLSearchParams(queryParams).toString();
      const res = await fetch(`/api/dicom/studies?${qs}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch studies: ${res.statusText}`);
      }
      const data = await res.json();
      const formattedStudies = this.parseStudies(data);
      // Strictly filter studies for active patient
      const filteredBackend = formattedStudies.filter(s => 
        s.patientId === activePid || (s.patientName && s.patientName.toLowerCase().includes(patientName.toLowerCase()))
      );
      const finalStudies = filteredBackend.length > 0 ? filteredBackend : formattedStudies;
      this.studies.set(finalStudies);
      if (finalStudies.length > 0) {
        this.selectedStudy.set(finalStudies[0]);
      }
    } catch (e: any) {
      console.warn('[DicomService] Warning searching studies:', e.message);
      this.error.set(null);
      this.studies.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Parses the DICOMweb JSON responses into friendly TS interfaces.
   */
  private parseStudies(data: any[]): IDicomStudy[] {
    if (!Array.isArray(data)) return [];
    
    return data.map(study => {
        // Common DICOM tags
        // 0020000D: Study Instance UID
        // 00100010: IPatient Name
        // 00100020: IPatient ID
        // 00080020: Study Date
        // 00081030: Study Description
        // 00080061: Modalities in Study
        
        const getValue = (tags: any, tagId: string) => tags?.[tagId]?.Value?.[0];
        const getAlphabeticalName = (tags: any, tagId: string) => tags?.[tagId]?.Value?.[0]?.Alphabetic;
        
        return {
           studyInstanceUid: getValue(study, '0020000D'),
           patientName: getAlphabeticalName(study, '00100010') || getValue(study, '00100010') || 'Unknown',
           patientId: getValue(study, '00100020'),
           studyDate: getValue(study, '00080020'),
           studyDescription: getValue(study, '00081030'),
           modalities: study['00080061']?.Value || []
        };
    });
  }

  getRenderedImageUrl(studyUid: string, seriesUid: string, instanceUid: string, project?: string, location?: string, dataset?: string, dicomStore?: string): string {
    if (this.patientState.isDemoMode()) {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="%2309090b"/>
        <path d="M 180 0 Q 185 200 175 400" stroke="%233f3f46" stroke-width="24" fill="none" opacity="0.3"/>
        <path d="M 180 0 Q 185 200 175 400" stroke="%23fafafa" stroke-width="8" fill="none" opacity="0.8"/>
        
        <rect x="110" y="60" width="50" height="40" rx="4" fill="%2327272a" stroke="%2352525b" stroke-width="2"/>
        <text x="135" y="85" fill="%23a1a1aa" font-family="monospace" font-size="12" text-anchor="middle">L3</text>
        
        <ellipse cx="135" cy="110" rx="22" ry="6" fill="%2318181b" stroke="%230ea5e9" stroke-width="2"/>
        
        <rect x="112" y="120" width="50" height="40" rx="4" fill="%2327272a" stroke="%2352525b" stroke-width="2"/>
        <text x="137" y="145" fill="%23a1a1aa" font-family="monospace" font-size="12" text-anchor="middle">L4</text>
        
        <ellipse cx="137" cy="170" rx="22" ry="6" fill="%2318181b" stroke="%23ef4444" stroke-width="2"/>
        <path d="M 159 170 Q 185 173 177 178" stroke="%23ef4444" stroke-width="4" fill="none"/>
        <circle cx="178" cy="174" r="5" fill="%23ef4444"/>
        <text x="210" y="174" fill="%23ef4444" font-family="sans-serif" font-size="10" font-weight="bold">HERNIATION</text>
        
        <rect x="110" y="180" width="50" height="40" rx="4" fill="%2327272a" stroke="%2352525b" stroke-width="2"/>
        <text x="135" y="205" fill="%23a1a1aa" font-family="monospace" font-size="12" text-anchor="middle">L5</text>
        
        <ellipse cx="135" cy="230" rx="22" ry="6" fill="%2318181b" stroke="%230ea5e9" stroke-width="2"/>
        
        <path d="M 105 240 L 155 240 L 145 320 L 115 320 Z" fill="%2327272a" stroke="%2352525b" stroke-width="2"/>
        <text x="130" y="275" fill="%23a1a1aa" font-family="monospace" font-size="12" text-anchor="middle">S1</text>
        
        <path d="M 20 20 L 40 20 M 20 20 L 20 40 M 380 20 L 360 20 M 380 20 L 380 40 M 20 380 L 40 380 M 20 380 L 20 360 M 380 380 L 360 380 M 380 380 L 380 360" stroke="%2352525b" stroke-width="1"/>
        <text x="30" y="35" fill="%233f3f46" font-family="monospace" font-size="10">SAGITTAL T2 MRI</text>
        <text x="30" y="50" fill="%233f3f46" font-family="monospace" font-size="10">POCKET GULL MRI SUITE</text>
      </svg>`;
    }
    const params = new URLSearchParams({
      studyUid, seriesUid, instanceUid
    });
    if (project) params.append('project', project);
    if (location) params.append('location', location);
    if (dataset) params.append('dataset', dataset);
    if (dicomStore) params.append('dicomStore', dicomStore);
    
    return `/api/dicom/rendered?${params.toString()}`;
  }
}
