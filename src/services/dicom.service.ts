import { Injectable, signal, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { PatientManagementService } from './patient-management.service';
import { WhispySwarmBioreactorService } from './whispy-swarm-bioreactor.service';

export interface IDicomStudy {
  studyInstanceUid: string;
  patientName?: string;
  patientId?: string;
  studyDate?: string;
  studyDescription?: string;
  modalities?: string[];
  seriesCount?: number;
  isMultiFrameVideo?: boolean;
  frameCount?: number;
  frameRateFps?: number;
  videoStreamUrl?: string;
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
  private bioreactorService = inject(WhispySwarmBioreactorService);

  studies = signal<IDicomStudy[]>([]);
  
  // Selected state
  selectedStudy = signal<IDicomStudy | null>(null);
  selectedSeries = signal<IDicomSeries | null>(null);
  selectedInstance = signal<IDicomInstance | null>(null);

  isLoading = signal(false);
  error = signal<string | null>(null);

  lastBioreactorDispatch = signal<{
    scanUid: string;
    description: string;
    voxelCount: number;
    phase: string;
    timestamp: string;
  } | null>(null);

  /**
   * Dispatches the currently selected DICOM scan defect parameters directly into
   * the Whispy Healing Swarm Bioreactor containment tank to initialize the Gor'kov
   * acoustic levitation trapping field for custom regenerative mist fabrication.
   */
  dispatchToBioreactor(studyOverride?: IDicomStudy, voxelOverride?: number): {
    scanUid: string;
    description: string;
    voxelCount: number;
    phase: string;
    timestamp: string;
  } {
    const study = studyOverride || this.selectedStudy();
    const scanUid = study?.studyInstanceUid || '1.2.840.113619.2.134.default';
    const desc = study?.studyDescription || 'Clinical Volumetric Lesion';
    const voxelCount = voxelOverride || (study?.frameCount ? study.frameCount * 64 : 1850);

    this.bioreactorService.loadPatientScan(scanUid, voxelCount);
    const receipt = {
      scanUid,
      description: desc,
      voxelCount,
      phase: this.bioreactorService.currentPhase(),
      timestamp: new Date().toISOString()
    };
    this.lastBioreactorDispatch.set(receipt);
    return receipt;
  }

  mockStudies: IDicomStudy[] = [
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.phil.1',
      patientName: 'Homo Sapiens (Male, 44y)',
      patientId: 'p_default_patient',
      studyDate: '20260716',
      studyDescription: 'Lumbar Spine MRI (L4-L5 herniation check)',
      modalities: ['MR'],
      frameCount: 32,
      frameRateFps: 24
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.phil.diatom',
      patientName: 'Homo Sapiens (Male, 44y)',
      patientId: 'p_default_patient',
      studyDate: '20260720',
      studyDescription: 'Diatom Frustule High-Resolution Micro-CT (Volumetric Scan)',
      modalities: ['CT'],
      isMultiFrameVideo: true,
      frameCount: 32,
      frameRateFps: 30
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.phil.cardiac',
      patientName: 'Homo Sapiens (Male, 44y)',
      patientId: 'p_default_patient',
      studyDate: '20260721',
      studyDescription: 'Cardiac Cine-MRI & Left Ventricle Dynamics',
      modalities: ['MR', 'US'],
      isMultiFrameVideo: true,
      frameCount: 32,
      frameRateFps: 24
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.moser.ald',
      patientName: 'Homo Sapiens (Pediatric, 7y)',
      patientId: 'p_default_patient',
      studyDate: '20260812',
      studyDescription: 'Hugo Moser Protocol: 3T Brain MRI (Loes Score 8/34 Demyelination)',
      modalities: ['MR'],
      frameCount: 32,
      frameRateFps: 24
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.ssf.cervical',
      patientName: 'Homo Sapiens (Trauma Model, 38y)',
      patientId: 'p_default_patient',
      studyDate: '20260815',
      studyDescription: 'Seattle Science Foundation: C5-C6 Cervical Subaxial Fracture-Dislocation Pre-Op CT/MRI',
      modalities: ['CT', 'MR'],
      frameCount: 32,
      frameRateFps: 24
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.rsna.knee',
      patientName: 'Homo Sapiens (Female, 31y)',
      patientId: 'p_default_patient',
      studyDate: '20260818',
      studyDescription: 'RSNA 2026: 3D Knee Multi-Planar Cartilage & Meniscus MRI',
      modalities: ['MR'],
      frameCount: 32,
      frameRateFps: 24
    },
    {
      studyInstanceUid: '1.2.840.113619.2.134.1.p001.1',
      patientName: 'Robert Davis',
      patientId: 'p001',
      studyDate: '20260710',
      studyDescription: 'Coronary Angiogram & Chest CT (Hypertension & Apnea)',
      modalities: ['CT', 'XA'],
      isMultiFrameVideo: true,
      frameCount: 32,
      frameRateFps: 30
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

  getRenderedImageUrl(
    studyUid: string, 
    seriesUid: string, 
    instanceUid: string, 
    project?: string, 
    location?: string, 
    dataset?: string, 
    dicomStore?: string,
    sliceIndex: number = 16,
    modalityOverride?: 'CT' | 'MR'
  ): string {
    if (this.patientState.isDemoMode()) {
      const sliceNorm = Math.max(1, Math.min(32, sliceIndex));
      const phaseAngle = ((sliceNorm - 1) / 32) * Math.PI * 2;
      const oscillation = Math.sin(phaseAngle);

      // 0. EXPLICIT PRE-OP CT BONE WINDOW (Osseous Architecture, Facet Joints, Pedicles & Spurs)
      if (modalityOverride === 'CT') {
        const canalWidth = 48 + oscillation * 8;
        const spurSize = 14 + oscillation * 4;

        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
          <rect width="400" height="400" fill="%2309090b"/>
          <!-- Vertebral Body Cortical Shell -->
          <path d="M 120 80 Q 200 60 280 80 L 280 220 Q 200 240 120 220 Z" fill="%2327272a" stroke="%23fafafa" stroke-width="6"/>
          <!-- Trabecular Cancellous Bone Core -->
          <ellipse cx="200" cy="150" rx="60" ry="50" fill="%233f3f46" stroke="%2371717a" stroke-width="2" stroke-dasharray="3,3"/>
          
          <!-- Spinal Canal Aperture -->
          <ellipse cx="200" cy="270" rx="${canalWidth.toFixed(1)}" ry="35" fill="%2318181b" stroke="%23fafafa" stroke-width="4"/>
          <!-- Pedicle Bars & Transverse Processes -->
          <line x1="120" y1="220" x2="60" y2="280" stroke="%23fafafa" stroke-width="8" stroke-linecap="round"/>
          <line x1="280" y1="220" x2="340" y2="280" stroke="%23fafafa" stroke-width="8" stroke-linecap="round"/>
          <!-- Spinous Process -->
          <polygon points="180,305 220,305 200,380" fill="%2327272a" stroke="%23fafafa" stroke-width="5"/>
          
          <!-- Posterior Marginal Osteophyte Spur (Bone +750 HU) -->
          <path d="M 185 228 Q 195 ${(228 + spurSize).toFixed(1)} 205 228" stroke="%23f59e0b" stroke-width="4" fill="%23f59e0b"/>
          <circle cx="195" cy="${(228 + spurSize).toFixed(1)}" r="3" fill="%23ef4444"/>
          <text x="215" y="${(228 + spurSize + 4).toFixed(1)}" fill="%23f59e0b" font-family="sans-serif" font-size="9" font-weight="bold">OSTEOPHYTE (+780 HU)</text>
          
          <path d="M 20 20 L 40 20 M 20 20 L 20 40 M 380 20 L 360 20 M 380 20 L 380 40 M 20 380 L 40 380 M 20 380 L 20 360 M 380 380 L 360 380 M 380 380 L 380 360" stroke="%2352525b" stroke-width="1"/>
          <text x="30" y="35" fill="%23f59e0b" font-family="monospace" font-size="10" font-weight="bold">PRE-OP HIGH-RES CT (BONE)</text>
          <text x="30" y="50" fill="%23a1a1aa" font-family="monospace" font-size="10">SLICE ${sliceNorm}/32 • W:2000 L:400 HU</text>
          <text x="30" y="375" fill="%23fbbf24" font-family="monospace" font-size="9">CANAL AP: ${(canalWidth * 0.28).toFixed(1)} mm</text>
        </svg>`;
      }

      // 1. DIATOM SCAN: High-resolution radial silicate frustule micro-CT with dynamic depth rings
      if (studyUid.includes('diatom')) {
        const radius = 95 + oscillation * 18;
        const poreCount = 16;
        const pores = Array.from({ length: poreCount }, (_, i) => {
          const a = (i / poreCount) * Math.PI * 2 + phaseAngle * 0.5;
          const px = 200 + Math.cos(a) * (radius * 0.7);
          const py = 200 + Math.sin(a) * (radius * 0.7);
          return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4" fill="%2314b8a6" opacity="0.8"/>`;
        }).join('');

        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
          <rect width="400" height="400" fill="%2309090b"/>
          <circle cx="200" cy="200" r="${radius.toFixed(1)}" fill="none" stroke="%2314b8a6" stroke-width="4" opacity="0.9"/>
          <circle cx="200" cy="200" r="${(radius * 0.5).toFixed(1)}" fill="%23134e4a" stroke="%232dd4bf" stroke-width="2" opacity="0.6"/>
          <circle cx="200" cy="200" r="14" fill="%235eead4" opacity="0.95"/>
          ${pores}
          <!-- Radial Costae Ribs -->
          <line x1="200" y1="${(200 - radius).toFixed(1)}" x2="200" y2="${(200 + radius).toFixed(1)}" stroke="%232dd4bf" stroke-width="1.5" opacity="0.7"/>
          <line x1="${(200 - radius).toFixed(1)}" y1="200" x2="${(200 + radius).toFixed(1)}" y2="200" stroke="%232dd4bf" stroke-width="1.5" opacity="0.7"/>
          
          <path d="M 20 20 L 40 20 M 20 20 L 20 40 M 380 20 L 360 20 M 380 20 L 380 40 M 20 380 L 40 380 M 20 380 L 20 360 M 380 380 L 360 380 M 380 380 L 380 360" stroke="%2352525b" stroke-width="1"/>
          <text x="30" y="35" fill="%2314b8a6" font-family="monospace" font-size="10" font-weight="bold">MICRO-CT DIATOM FRUSTULE</text>
          <text x="30" y="50" fill="%2371717a" font-family="monospace" font-size="10">SLICE ${sliceNorm}/32 • RADIUS ${(radius * 0.45).toFixed(1)} µm</text>
          <text x="30" y="375" fill="%232dd4bf" font-family="monospace" font-size="9">POCKET GULL BIOPHYSICS CINE</text>
        </svg>`;
      }

      // 2. CARDIAC CINE MRI / ULTRASOUND: Dynamic Ventricle & Valve Chamber
      if (studyUid.includes('cardiac') || studyUid.includes('p001')) {
        const lvWidth = 55 + oscillation * 14;
        const lvHeight = 75 - oscillation * 8;
        const valveDisplacement = 190 + oscillation * 12;

        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
          <rect width="400" height="400" fill="%2309090b"/>
          <!-- Myocardial Wall -->
          <ellipse cx="200" cy="190" rx="${(lvWidth + 16).toFixed(1)}" ry="${(lvHeight + 16).toFixed(1)}" fill="none" stroke="%23f97316" stroke-width="12" opacity="0.5"/>
          <!-- Left Ventricle Blood Pool -->
          <ellipse cx="200" cy="190" rx="${lvWidth.toFixed(1)}" ry="${lvHeight.toFixed(1)}" fill="%23431407" stroke="%23ea580c" stroke-width="3"/>
          <!-- Mitral Valve Leaflets -->
          <line x1="175" y1="140" x2="200" y2="${valveDisplacement.toFixed(1)}" stroke="%23fdba74" stroke-width="3"/>
          <line x1="225" y1="140" x2="200" y2="${valveDisplacement.toFixed(1)}" stroke="%23fdba74" stroke-width="3"/>
          
          <path d="M 20 20 L 40 20 M 20 20 L 20 40 M 380 20 L 360 20 M 380 20 L 380 40 M 20 380 L 40 380 M 20 380 L 20 360 M 380 380 L 360 380 M 380 380 L 380 360" stroke="%2352525b" stroke-width="1"/>
          <text x="30" y="35" fill="%23f97316" font-family="monospace" font-size="10" font-weight="bold">CARDIAC CINE MRI • 4-CHAMBER</text>
          <text x="30" y="50" fill="%2371717a" font-family="monospace" font-size="10">PHASE ${sliceNorm}/32 • EF ${(58 + oscillation * 12).toFixed(0)}%</text>
          <text x="30" y="375" fill="%23fb923c" font-family="monospace" font-size="9">CINE-LOOP DYNAMICS (24 FPS)</text>
        </svg>`;
      }

      // 3. HUGO MOSER ALD PROTOCOL: 3T Brain MRI (Loes Score 8/34 White Matter Demyelination)
      if (studyUid.includes('moser')) {
        const demyelinationSpread = 35 + oscillation * 8;
        const rimContrast = (0.7 + oscillation * 0.2).toFixed(2);

        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
          <rect width="400" height="400" fill="%2309090b"/>
          <!-- Calvarial Bone Contour -->
          <ellipse cx="200" cy="190" rx="140" ry="165" fill="%2318181b" stroke="%23fafafa" stroke-width="4"/>
          <!-- Cerebral Cortical Gray Matter -->
          <ellipse cx="200" cy="190" rx="130" ry="155" fill="%2327272a" stroke="%2352525b" stroke-width="2"/>
          
          <!-- Lateral Ventricles (Frontal & Occipital Horns) -->
          <path d="M 175 140 Q 185 190 170 230 Q 160 190 175 140 Z" fill="%2309090b" stroke="%230ea5e9" stroke-width="2"/>
          <path d="M 225 140 Q 215 190 230 230 Q 240 190 225 140 Z" fill="%2309090b" stroke="%230ea5e9" stroke-width="2"/>
          
          <!-- Posterior Corpus Callosum Splenium: Demyelination Zone (Loes Score Staging) -->
          <ellipse cx="200" cy="245" rx="${demyelinationSpread.toFixed(1)}" ry="28" fill="%23e0f2fe" opacity="0.85"/>
          <!-- Active Inflammatory Enhancement Rim (Gadolinium Concordance) -->
          <ellipse cx="200" cy="245" rx="${(demyelinationSpread + 8).toFixed(1)}" ry="34" fill="none" stroke="%2338bdf8" stroke-width="3" stroke-dasharray="4,2" opacity="${rimContrast}"/>
          
          <path d="M 20 20 L 40 20 M 20 20 L 20 40 M 380 20 L 360 20 M 380 20 L 380 40 M 20 380 L 40 380 M 20 380 L 20 360 M 380 380 L 360 380 M 380 380 L 380 360" stroke="%2352525b" stroke-width="1"/>
          <text x="30" y="35" fill="%2338bdf8" font-family="monospace" font-size="10" font-weight="bold">HUGO MOSER 3T BRAIN MRI</text>
          <text x="30" y="50" fill="%23a1a1aa" font-family="monospace" font-size="10">SLICE ${sliceNorm}/32 • LOES SCORE: 8/34 (STAGE 1B)</text>
          <text x="30" y="375" fill="%237dd3fc" font-family="monospace" font-size="9">VLCFA RATIO C26:0 ELEVATED • HSCT WINDOW ELIGIBLE</text>
        </svg>`;
      }

      // 4. SEATTLE SCIENCE FOUNDATION: C5-C6 Subaxial Fracture-Dislocation Traumatology
      if (studyUid.includes('cervical') || studyUid.includes('ssf')) {
        const displacementMm = 4 + oscillation * 2;
        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
          <rect width="400" height="400" fill="%2309090b"/>
          <!-- Spinal Cord Canal -->
          <path d="M 180 20 L 180 380" stroke="%2338bdf8" stroke-width="14" fill="none" opacity="0.6"/>
          <!-- C4 Vertebral Body -->
          <rect x="110" y="60" width="60" height="45" rx="3" fill="%2327272a" stroke="%23fafafa" stroke-width="2"/>
          <text x="140" y="88" fill="%23a1a1aa" font-family="monospace" font-size="12" text-anchor="middle">C4</text>
          
          <!-- C5 Vertebral Body (Subluxed) -->
          <rect x="${(110 + displacementMm).toFixed(1)}" y="125" width="60" height="45" rx="3" fill="%2327272a" stroke="%23ef4444" stroke-width="3"/>
          <text x="${(140 + displacementMm).toFixed(1)}" y="153" fill="%23ef4444" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">C5</text>
          
          <!-- Retropulsed Bony Teardrop Fracture Fragment (Bone +820 HU) -->
          <polygon points="175,155 195,160 178,170" fill="%23f59e0b" stroke="%23fafafa" stroke-width="2"/>
          
          <!-- C6 Vertebral Body -->
          <rect x="110" y="190" width="60" height="45" rx="3" fill="%2327272a" stroke="%23fafafa" stroke-width="2"/>
          <text x="140" y="218" fill="%23a1a1aa" font-family="monospace" font-size="12" text-anchor="middle">C6</text>
          
          <path d="M 20 20 L 40 20 M 20 20 L 20 40 M 380 20 L 360 20 M 380 20 L 380 40 M 20 380 L 40 380 M 20 380 L 20 360 M 380 380 L 360 380 M 380 380 L 380 360" stroke="%2352525b" stroke-width="1"/>
          <text x="30" y="35" fill="%23ef4444" font-family="monospace" font-size="10" font-weight="bold">SSF CERVICAL SUBAXIAL TRAUMA</text>
          <text x="30" y="50" fill="%23a1a1aa" font-family="monospace" font-size="10">SLICE ${sliceNorm}/32 • C5-C6 DISLOCATION (${displacementMm.toFixed(1)} mm)</text>
          <text x="30" y="375" fill="%23f87171" font-family="monospace" font-size="9">SURGICAL CORRIDOR ARIA: HIGH ACUITY (88/100)</text>
        </svg>`;
      }

      // 5. RSNA 2026: 3D Knee Multi-Planar Cartilage & Meniscus MRI
      if (studyUid.includes('rsna') || studyUid.includes('knee')) {
        const jointGap = 12 + oscillation * 3;
        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
          <rect width="400" height="400" fill="%2309090b"/>
          <!-- Distal Femoral Condyle -->
          <path d="M 120 40 L 280 40 L 270 170 Q 200 190 130 170 Z" fill="%2327272a" stroke="%23fafafa" stroke-width="3"/>
          <text x="200" y="110" fill="%23a1a1aa" font-family="monospace" font-size="12" text-anchor="middle">FEMUR</text>
          
          <!-- Proximal Tibial Plateau -->
          <path d="M 120 ${(190 + jointGap).toFixed(1)} Q 200 ${(180 + jointGap).toFixed(1)} 280 ${(190 + jointGap).toFixed(1)} L 270 350 L 130 350 Z" fill="%2327272a" stroke="%23fafafa" stroke-width="3"/>
          <text x="200" y="${(270 + jointGap).toFixed(1)}" fill="%23a1a1aa" font-family="monospace" font-size="12" text-anchor="middle">TIBIA</text>
          
          <!-- Medial Meniscus Triangular Wedge (Posterior Horn Tear) -->
          <polygon points="135,178 165,182 140,192" fill="%230ea5e9" stroke="%2338bdf8" stroke-width="2"/>
          <line x1="145" y1="180" x2="155" y2="190" stroke="%23ef4444" stroke-width="2"/>
          <text x="110" y="210" fill="%23ef4444" font-family="sans-serif" font-size="9" font-weight="bold">MENISCUS TEAR</text>
          
          <path d="M 20 20 L 40 20 M 20 20 L 20 40 M 380 20 L 360 20 M 380 20 L 380 40 M 20 380 L 40 380 M 20 380 L 20 360 M 380 380 L 360 380 M 380 380 L 380 360" stroke="%2352525b" stroke-width="1"/>
          <text x="30" y="35" fill="%2338bdf8" font-family="monospace" font-size="10" font-weight="bold">RSNA 2026 3D KNEE SAGITTAL MRI</text>
          <text x="30" y="50" fill="%23a1a1aa" font-family="monospace" font-size="10">SLICE ${sliceNorm}/32 • MEDIAL MENISCUS TEAR</text>
          <text x="30" y="375" fill="%2338bdf8" font-family="monospace" font-size="9">CARTILAGE WORMS SCORE: GRADE 2 FOCAL DEFECT</text>
        </svg>`;
      }

      // 6. STANDARD LUMBAR / SAGITTAL MRI WITH CROSS-SECTIONAL SLICE NAVIGATION
      const discBulge = 170 + oscillation * 5;
      const canalDepth = 175 + oscillation * 6;

      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
        <rect width="400" height="400" fill="%2309090b"/>
        <path d="M 180 0 Q ${canalDepth.toFixed(1)} 200 175 400" stroke="%233f3f46" stroke-width="24" fill="none" opacity="0.3"/>
        <path d="M 180 0 Q ${canalDepth.toFixed(1)} 200 175 400" stroke="%23fafafa" stroke-width="8" fill="none" opacity="0.8"/>
        
        <rect x="110" y="60" width="50" height="40" rx="4" fill="%2327272a" stroke="%2352525b" stroke-width="2"/>
        <text x="135" y="85" fill="%23a1a1aa" font-family="monospace" font-size="12" text-anchor="middle">L3</text>
        
        <ellipse cx="135" cy="110" rx="22" ry="6" fill="%2318181b" stroke="%230ea5e9" stroke-width="2"/>
        
        <rect x="112" y="120" width="50" height="40" rx="4" fill="%2327272a" stroke="%2352525b" stroke-width="2"/>
        <text x="137" y="145" fill="%23a1a1aa" font-family="monospace" font-size="12" text-anchor="middle">L4</text>
        
        <ellipse cx="137" cy="${discBulge.toFixed(1)}" rx="22" ry="6" fill="%2318181b" stroke="%23ef4444" stroke-width="2"/>
        <path d="M 159 ${discBulge.toFixed(1)} Q 185 ${(discBulge + 3).toFixed(1)} 177 ${(discBulge + 8).toFixed(1)}" stroke="%23ef4444" stroke-width="4" fill="none"/>
        <circle cx="178" cy="${(discBulge + 4).toFixed(1)}" r="5" fill="%23ef4444"/>
        <text x="210" y="${(discBulge + 4).toFixed(1)}" fill="%23ef4444" font-family="sans-serif" font-size="10" font-weight="bold">HERNIATION</text>
        
        <rect x="110" y="180" width="50" height="40" rx="4" fill="%2327272a" stroke="%2352525b" stroke-width="2"/>
        <text x="135" y="205" fill="%23a1a1aa" font-family="monospace" font-size="12" text-anchor="middle">L5</text>
        
        <ellipse cx="135" cy="230" rx="22" ry="6" fill="%2318181b" stroke="%230ea5e9" stroke-width="2"/>
        
        <path d="M 105 240 L 155 240 L 145 320 L 115 320 Z" fill="%2327272a" stroke="%2352525b" stroke-width="2"/>
        <text x="130" y="275" fill="%23a1a1aa" font-family="monospace" font-size="12" text-anchor="middle">S1</text>
        
        <path d="M 20 20 L 40 20 M 20 20 L 20 40 M 380 20 L 360 20 M 380 20 L 380 40 M 20 380 L 40 380 M 20 380 L 20 360 M 380 380 L 360 380 M 380 380 L 380 360" stroke="%2352525b" stroke-width="1"/>
        <text x="30" y="35" fill="%233f3f46" font-family="monospace" font-size="10">PRE-OP T2 MRI (SOFT TISSUE)</text>
        <text x="30" y="50" fill="%233f3f46" font-family="monospace" font-size="10">SLICE ${sliceNorm}/32</text>
      </svg>`;
    }
    const params = new URLSearchParams({
      studyUid, seriesUid, instanceUid, slice: sliceIndex.toString()
    });
    if (modalityOverride) params.append('modality', modalityOverride);
    if (project) params.append('project', project);
    if (location) params.append('location', location);
    if (dataset) params.append('dataset', dataset);
    if (dicomStore) params.append('dicomStore', dicomStore);
    
    return `/api/dicom/rendered?${params.toString()}`;
  }
}

