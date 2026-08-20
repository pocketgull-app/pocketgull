import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export interface ITypographicAnatomyPart {
  id: string;
  name: string;
  latinName: string;
  japaneseName: string;
  chineseName: string;
  sanskritName: string;
  category: 'skeletal' | 'organ' | 'vascular' | 'neural' | 'muscular';
  snomedCode: string;
  pathD: string;
  startOffset?: string;
  textAnchor?: 'start' | 'middle' | 'end';
  fontSize: number;
  weight: number;
  defaultColor: string;
  alertColor: string;
  vitalKey?: string;
  clinicalDescription: string;
}

@Injectable({
  providedIn: 'root'
})
export class TypographicAnatomyService {
  private patientState = inject(PatientStateService, { optional: true });

  readonly languageMode = signal<'latin' | 'english' | 'japanese' | 'chinese' | 'sanskrit'>('latin');

  /** Comprehensive 40+ Human Typographic Anatomy Taxonomy Catalog */
  readonly parts: ITypographicAnatomyPart[] = [
    // ─── 1. CRANIUM & NEURO ──────────────────────────────────────────────────
    {
      id: 'cranium_frontal',
      name: 'Frontal Bone',
      latinName: 'OS FRONTALE',
      japaneseName: '前頭骨',
      chineseName: '额骨',
      sanskritName: 'ललाटास्थि',
      category: 'skeletal',
      snomedCode: '74872008',
      pathD: 'M 80 32 C 86 18 114 18 120 32',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 5.5,
      weight: 700,
      defaultColor: '#e2e8f0',
      alertColor: '#f43f5e',
      clinicalDescription: 'Anterior superior cranial vault enclosing frontal lobes.'
    },
    {
      id: 'cerebrum',
      name: 'Cerebrum',
      latinName: 'CEREBRUM',
      japaneseName: '大脳',
      chineseName: '大脑',
      sanskritName: 'मस्तिष्कम्',
      category: 'organ',
      snomedCode: '83678007',
      pathD: 'M 82 40 C 84 26 116 26 118 40',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 6.0,
      weight: 800,
      defaultColor: '#c084fc',
      alertColor: '#f43f5e',
      vitalKey: 'neurological',
      clinicalDescription: 'Telencephalon hemisphere governing cognitive processing and motor planning.'
    },
    {
      id: 'cerebellum',
      name: 'Cerebellum',
      latinName: 'CEREBELLUM',
      japaneseName: '小脳',
      chineseName: '小脑',
      sanskritName: 'अनुमस्तिष्कम्',
      category: 'organ',
      snomedCode: '78333008',
      pathD: 'M 86 48 C 92 52 108 52 114 48',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 5.0,
      weight: 700,
      defaultColor: '#a855f7',
      alertColor: '#f43f5e',
      clinicalDescription: 'Infratentorial structure coordinating motor control, balance, and proprioception.'
    },
    {
      id: 'mandible',
      name: 'Mandible',
      latinName: 'MANDIBULA',
      japaneseName: '下顎骨',
      chineseName: '下颌骨',
      sanskritName: 'हनु',
      category: 'skeletal',
      snomedCode: '91609006',
      pathD: 'M 88 56 Q 100 64 112 56',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.8,
      weight: 600,
      defaultColor: '#cbd5e1',
      alertColor: '#f59e0b',
      clinicalDescription: 'Inferior facial skeleton supporting dentition and temporomandibular articulation.'
    },

    // ─── 2. CERVICAL & SPINE ─────────────────────────────────────────────────
    {
      id: 'spine_cervical',
      name: 'Cervical Spine (C1-C7)',
      latinName: 'VERTEBRAE C1-C7',
      japaneseName: '頸椎 C1-C7',
      chineseName: '颈椎 C1-C7',
      sanskritName: 'ग्रीवा-कशेरुका',
      category: 'skeletal',
      snomedCode: '122494005',
      pathD: 'M 100 60 V 78',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.5,
      weight: 700,
      defaultColor: '#38bdf8',
      alertColor: '#f43f5e',
      clinicalDescription: 'Lordotic cervical column supporting cranium and protecting cervical spinal cord.'
    },
    {
      id: 'spine_thoracic',
      name: 'Thoracic Spine (T1-T12)',
      latinName: 'VERTEBRAE T1-T12',
      japaneseName: '胸椎 T1-T12',
      chineseName: '胸椎 T1-T12',
      sanskritName: 'वक्ष-कशेरुका',
      category: 'skeletal',
      snomedCode: '122495006',
      pathD: 'M 100 80 V 150',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.5,
      weight: 700,
      defaultColor: '#38bdf8',
      alertColor: '#f43f5e',
      clinicalDescription: 'Kyphotic thoracic column anchoring the rib cage and thoracic cage viscera.'
    },
    {
      id: 'spine_lumbar',
      name: 'Lumbar Spine (L1-L5)',
      latinName: 'VERTEBRAE L1-L5',
      japaneseName: '腰椎 L1-L5',
      chineseName: '腰椎 L1-L5',
      sanskritName: 'कटि-कशेरुका',
      category: 'skeletal',
      snomedCode: '122496007',
      pathD: 'M 100 152 V 195',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.5,
      weight: 700,
      defaultColor: '#38bdf8',
      alertColor: '#f43f5e',
      clinicalDescription: 'Lordotic lumbar vertebrae bearing axial weight and anchoring core musculature.'
    },

    // ─── 3. THORAX & CARDIOPULMONARY ─────────────────────────────────────────
    {
      id: 'clavicle_left',
      name: 'Left Clavicle',
      latinName: 'CLAVICULA SINISTRA',
      japaneseName: '左鎖骨',
      chineseName: '左锁骨',
      sanskritName: 'वामाक्षक',
      category: 'skeletal',
      snomedCode: '51299004',
      pathD: 'M 100 70 Q 118 68 132 72',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.2,
      weight: 600,
      defaultColor: '#e2e8f0',
      alertColor: '#f59e0b',
      clinicalDescription: 'Sinistral pectoral girdle strut connecting sternum to scapula.'
    },
    {
      id: 'clavicle_right',
      name: 'Right Clavicle',
      latinName: 'CLAVICULA DEXTRA',
      japaneseName: '右鎖骨',
      chineseName: '右锁骨',
      sanskritName: 'दक्षाक्षक',
      category: 'skeletal',
      snomedCode: '8887007',
      pathD: 'M 68 72 Q 82 68 100 70',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.2,
      weight: 600,
      defaultColor: '#e2e8f0',
      alertColor: '#f59e0b',
      clinicalDescription: 'Dextral pectoral girdle strut connecting sternum to scapula.'
    },
    {
      id: 'sternum',
      name: 'Sternum',
      latinName: 'STERNUM',
      japaneseName: '胸骨',
      chineseName: '胸骨',
      sanskritName: 'उरस्',
      category: 'skeletal',
      snomedCode: '56873002',
      pathD: 'M 100 75 V 125',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 5.0,
      weight: 800,
      defaultColor: '#f8fafc',
      alertColor: '#f43f5e',
      clinicalDescription: 'Anterior thoracic cage breastbone anchoring true costal cartilages.'
    },
    {
      id: 'ribs_upper',
      name: 'Costae 1-4',
      latinName: 'COSTAE I-IV',
      japaneseName: '肋骨 1-4',
      chineseName: '肋骨 1-4',
      sanskritName: 'पर्शुक १-४',
      category: 'skeletal',
      snomedCode: '113197003',
      pathD: 'M 78 88 Q 100 92 122 88',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.2,
      weight: 600,
      defaultColor: '#cbd5e1',
      alertColor: '#f59e0b',
      clinicalDescription: 'True ribs articulating directly with sternum protecting apical lungs and great vessels.'
    },
    {
      id: 'ribs_lower',
      name: 'Costae 5-10',
      latinName: 'COSTAE V-X',
      japaneseName: '肋骨 5-10',
      chineseName: '肋骨 5-10',
      sanskritName: 'पर्शुक ५-१०',
      category: 'skeletal',
      snomedCode: '113197003',
      pathD: 'M 76 112 Q 100 118 124 112',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.2,
      weight: 600,
      defaultColor: '#cbd5e1',
      alertColor: '#f59e0b',
      clinicalDescription: 'False and floating costal cage protecting liver, spleen, and diaphragm dome.'
    },
    {
      id: 'heart',
      name: 'Heart (Cor)',
      latinName: 'COR • MYOCARDIUM',
      japaneseName: '心臓 • 心筋',
      chineseName: '心脏 • 心肌',
      sanskritName: 'हृदयम् • हृत्पेशी',
      category: 'organ',
      snomedCode: '80891009',
      pathD: 'M 94 92 C 90 85 100 80 106 90 C 112 80 120 85 116 95 C 112 108 102 116 100 118 C 98 116 92 104 94 92',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 5.2,
      weight: 800,
      defaultColor: '#f43f5e',
      alertColor: '#ef4444',
      vitalKey: 'heartRate',
      clinicalDescription: 'Four-chambered muscular organ maintaining systemic and pulmonary hemodynamic perfusion.'
    },
    {
      id: 'lung_left',
      name: 'Left Lung',
      latinName: 'PULMO SINISTER',
      japaneseName: '左肺',
      chineseName: '左肺',
      sanskritName: 'वाम-फुप्फुस',
      category: 'organ',
      snomedCode: '44714003',
      pathD: 'M 106 82 C 112 80 122 80 124 88 C 126 102 124 118 112 120',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.6,
      weight: 700,
      defaultColor: '#38bdf8',
      alertColor: '#f43f5e',
      vitalKey: 'spo2',
      clinicalDescription: 'Bilobed sinistral respiratory organ with cardiac notch for gas exchange.'
    },
    {
      id: 'lung_right',
      name: 'Right Lung',
      latinName: 'PULMO DEXTER',
      japaneseName: '右肺',
      chineseName: '右肺',
      sanskritName: 'दक्षिण-फुप्फुस',
      category: 'organ',
      snomedCode: '45840003',
      pathD: 'M 94 82 C 88 80 78 80 76 88 C 74 102 76 118 88 120',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.6,
      weight: 700,
      defaultColor: '#38bdf8',
      alertColor: '#f43f5e',
      vitalKey: 'spo2',
      clinicalDescription: 'Trilobed dextral respiratory organ executing atmospheric gas exchange.'
    },

    // ─── 4. ABDOMEN & VISCERA ────────────────────────────────────────────────
    {
      id: 'liver',
      name: 'Hepatic Liver',
      latinName: 'HEPAR • LOBUS DEXTER',
      japaneseName: '肝臓 • 右葉',
      chineseName: '肝脏 • 右叶',
      sanskritName: 'यकृत्',
      category: 'organ',
      snomedCode: '10200004',
      pathD: 'M 76 128 C 76 138 82 146 98 146 C 102 146 104 135 102 128',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.6,
      weight: 700,
      defaultColor: '#f59e0b',
      alertColor: '#ef4444',
      vitalKey: 'alt',
      clinicalDescription: 'Primary metabolic and detoxification organ synthesizing bile, albumin, and clotting factors.'
    },
    {
      id: 'stomach',
      name: 'Gastric Stomach',
      latinName: 'GASTER • CORPUS',
      japaneseName: '胃 • 胃体',
      chineseName: '胃 • 胃体',
      sanskritName: 'आमाशय',
      category: 'organ',
      snomedCode: '69695003',
      pathD: 'M 104 128 C 106 138 112 144 122 142 C 124 134 122 128 116 128',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.6,
      weight: 700,
      defaultColor: '#fbbf24',
      alertColor: '#ef4444',
      clinicalDescription: 'J-shaped digestive reservoir initiating acid proteolysis and intrinsic factor secretion.'
    },
    {
      id: 'kidney_right',
      name: 'Right Kidney',
      latinName: 'REN DEXTER',
      japaneseName: '右腎',
      chineseName: '右肾',
      sanskritName: 'दक्षिण-वृक्क',
      category: 'organ',
      snomedCode: '64033007',
      pathD: 'M 82 150 C 80 156 80 162 86 164',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.2,
      weight: 700,
      defaultColor: '#fb7185',
      alertColor: '#ef4444',
      vitalKey: 'creatinine',
      clinicalDescription: 'Retroperitoneal excretory organ regulating fluid volume, electrolytes, and erythropoietin.'
    },
    {
      id: 'kidney_left',
      name: 'Left Kidney',
      latinName: 'REN SINISTER',
      japaneseName: '左腎',
      chineseName: '左肾',
      sanskritName: 'वाम-वृक्क',
      category: 'organ',
      snomedCode: '18639004',
      pathD: 'M 118 150 C 120 156 120 162 114 164',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.2,
      weight: 700,
      defaultColor: '#fb7185',
      alertColor: '#ef4444',
      vitalKey: 'creatinine',
      clinicalDescription: 'Sinistral retroperitoneal filter purifying blood and maintaining acid-base equilibrium.'
    },

    // ─── 5. PELVIS & LIMBS ───────────────────────────────────────────────────
    {
      id: 'pelvis',
      name: 'Pelvic Girdle',
      latinName: 'PELVIS • OS COXAE',
      japaneseName: '骨盤 • 寛骨',
      chineseName: '骨盆 • 髋骨',
      sanskritName: 'श्रोणिफलक',
      category: 'skeletal',
      snomedCode: '272671008',
      pathD: 'M 80 180 Q 100 205 120 180',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 5.0,
      weight: 700,
      defaultColor: '#e2e8f0',
      alertColor: '#f59e0b',
      clinicalDescription: 'Bony basin transmitting axial torso loads to the bilateral lower extremities.'
    },
    {
      id: 'femur_right',
      name: 'Right Femur',
      latinName: 'FEMUR DEXTRUM',
      japaneseName: '右大腿骨',
      chineseName: '右股骨',
      sanskritName: 'दक्षिण-ऊर्वस्थि',
      category: 'skeletal',
      snomedCode: '71341001',
      pathD: 'M 86 210 L 82 285',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.4,
      weight: 700,
      defaultColor: '#f1f5f9',
      alertColor: '#f43f5e',
      clinicalDescription: 'Longest, strongest bone in human body bearing upright weight and locomotion.'
    },
    {
      id: 'femur_left',
      name: 'Left Femur',
      latinName: 'FEMUR SINISTRUM',
      japaneseName: '左大腿骨',
      chineseName: '左股骨',
      sanskritName: 'वाम-ऊर्वस्थि',
      category: 'skeletal',
      snomedCode: '24029007',
      pathD: 'M 114 210 L 118 285',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.4,
      weight: 700,
      defaultColor: '#f1f5f9',
      alertColor: '#f43f5e',
      clinicalDescription: 'Sinistral femur articulating proximally with acetabulum and distally with patella/tibia.'
    },
    {
      id: 'tibia_right',
      name: 'Right Tibia & Fibula',
      latinName: 'TIBIA ET FIBULA (R)',
      japaneseName: '右脛骨・腓骨',
      chineseName: '右胫骨与腓骨',
      sanskritName: 'दक्षिण-जङ्घास्थि',
      category: 'skeletal',
      snomedCode: '12611008',
      pathD: 'M 82 295 L 76 385',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.0,
      weight: 600,
      defaultColor: '#cbd5e1',
      alertColor: '#f59e0b',
      clinicalDescription: 'Weight-bearing medial shin bone paired with lateral fibular muscle stabilizer.'
    },
    {
      id: 'tibia_left',
      name: 'Left Tibia & Fibula',
      latinName: 'TIBIA ET FIBULA (L)',
      japaneseName: '左脛骨・腓骨',
      chineseName: '左胫骨与腓骨',
      sanskritName: 'वाम-जङ्घास्थि',
      category: 'skeletal',
      snomedCode: '56795003',
      pathD: 'M 118 295 L 124 385',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.0,
      weight: 600,
      defaultColor: '#cbd5e1',
      alertColor: '#f59e0b',
      clinicalDescription: 'Sinistral crus lower leg skeleton transmitting forces to the talar dome.'
    },
    {
      id: 'humerus_right',
      name: 'Right Humerus',
      latinName: 'HUMERUS DEXTER',
      japaneseName: '右上腕骨',
      chineseName: '右肱骨',
      sanskritName: 'दक्षिण-प्रगण्डास्थि',
      category: 'skeletal',
      snomedCode: '18188000',
      pathD: 'M 62 105 L 56 160',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.0,
      weight: 600,
      defaultColor: '#cbd5e1',
      alertColor: '#f59e0b',
      clinicalDescription: 'Dextral upper arm bone articulating with glenoid cavity and cubital elbow joint.'
    },
    {
      id: 'humerus_left',
      name: 'Left Humerus',
      latinName: 'HUMERUS SINISTER',
      japaneseName: '左上腕骨',
      chineseName: '左肱骨',
      sanskritName: 'वाम-प्रगण्डास्थि',
      category: 'skeletal',
      snomedCode: '78277001',
      pathD: 'M 138 105 L 144 160',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.0,
      weight: 600,
      defaultColor: '#cbd5e1',
      alertColor: '#f59e0b',
      clinicalDescription: 'Sinistral brachium skeleton transferring kinetic force to the forearm.'
    },

    // ─── 6. VASCULAR HEMODYNAMIC SPLINES ─────────────────────────────────────
    {
      id: 'aorta',
      name: 'Ascending Aorta',
      latinName: 'AORTA • O2: 99%',
      japaneseName: '大動脈 • O2: 99%',
      chineseName: '主动脉 • O2: 99%',
      sanskritName: 'महाधमनी',
      category: 'vascular',
      snomedCode: '15825003',
      pathD: 'M 100 95 C 104 88 106 78 100 74',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.5,
      weight: 800,
      defaultColor: '#ef4444',
      alertColor: '#dc2626',
      vitalKey: 'bloodPressure',
      clinicalDescription: 'High-pressure systemic arterial trunk delivering oxygenated cardiac output.'
    },
    {
      id: 'vena_cava',
      name: 'Vena Cava',
      latinName: 'VENA CAVA • CO2',
      japaneseName: '大静脈 • CO2',
      chineseName: '腔静脉 • CO2',
      sanskritName: 'महाशिरा',
      category: 'vascular',
      snomedCode: '76784001',
      pathD: 'M 96 74 V 110',
      startOffset: '50%',
      textAnchor: 'middle',
      fontSize: 4.2,
      weight: 700,
      defaultColor: '#06b6d4',
      alertColor: '#0284c7',
      clinicalDescription: 'Primary venous trunk returning deoxygenated systemic blood to the right atrium.'
    }
  ];

  getLabelForPart(part: ITypographicAnatomyPart): string {
    switch (this.languageMode()) {
      case 'latin': return part.latinName;
      case 'english': return part.name.toUpperCase();
      case 'japanese': return part.japaneseName;
      case 'chinese': return part.chineseName;
      case 'sanskrit': return part.sanskritName;
      default: return part.latinName;
    }
  }

  isPartAlerted(part: ITypographicAnatomyPart): boolean {
    if (!this.patientState) return false;
    const partId = part.id.toLowerCase();

    // 1. Direct issue recorded on this body part
    const issuesMap = this.patientState.issues() || {};
    if (issuesMap[part.id] && issuesMap[part.id].length > 0) {
      return true;
    }

    // 2. AI anomaly highlights
    const aiAnomalies = this.patientState.aiAnomalyHighlights() || {};
    if (aiAnomalies[part.id]) {
      return true;
    }

    // 3. Reason for visit / chief complaint matching
    const reason = (this.patientState.reasonForVisit() || '').toLowerCase();
    if (partId.includes('heart') && (reason.includes('chest') || reason.includes('cardiac') || reason.includes('palpitation'))) {
      return true;
    }
    if (partId.includes('lung') && (reason.includes('breath') || reason.includes('cough') || reason.includes('dyspnea'))) {
      return true;
    }
    if (partId.includes('spine') && (reason.includes('back') || reason.includes('neck') || reason.includes('lumbar'))) {
      return true;
    }
    if (partId.includes('cerebrum') && (reason.includes('headache') || reason.includes('migraine') || reason.includes('dizzy'))) {
      return true;
    }
    return false;
  }

  cycleLanguage(): void {
    const modes: Array<'latin' | 'english' | 'japanese' | 'chinese' | 'sanskrit'> = [
      'latin', 'english', 'japanese', 'chinese', 'sanskrit'
    ];
    const currentIndex = modes.indexOf(this.languageMode());
    const nextIndex = (currentIndex + 1) % modes.length;
    this.languageMode.set(modes[nextIndex]);
  }
}
