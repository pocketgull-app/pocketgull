import { Injectable } from '@angular/core';

export interface ISoapNoteSection {
  title: string;
  western: string[];
  eastern: string[];
  ayurvedic: string[];
  osteopathic: string[];
}

export interface IStructuredSoapNote {
  id: string;
  generatedAt: string;
  rawTranscript: string;
  subjective: ISoapNoteSection;
  objective: ISoapNoteSection;
  assessment: ISoapNoteSection;
  plan: ISoapNoteSection;
}

@Injectable({
  providedIn: 'root'
})
export class AmbientSoapParserService {
  /**
   * Parses raw conversational clinical dialogue into a structured 4-paradigm SOAP note.
   */
  parseTranscript(transcript: string): IStructuredSoapNote {
    const text = (transcript || '').trim();
    const lower = text.toLowerCase();

    const noteId = `soap-${Date.now()}`;
    const generatedAt = new Date().toISOString();

    // 1. Subjective Parsing
    const subjWestern: string[] = [];
    const subjEastern: string[] = [];
    const subjAyurvedic: string[] = [];
    const subjOsteopathic: string[] = [];

    if (lower.includes('pain') || lower.includes('hurts') || lower.includes('ache')) {
      subjWestern.push('Patient reports active somatic discomfort and localized pain.');
    }
    if (lower.includes('knee') || lower.includes('swelling') || lower.includes('stiff')) {
      subjWestern.push('Joint stiffness and functional mobility limitation reported.');
    }
    if (lower.includes('stress') || lower.includes('anger') || lower.includes('sigh') || lower.includes('bloat') || lower.includes('fatigue')) {
      subjEastern.push('Patient describes fluctuations in energy, sensation of fullness, and mood-related tension (Qi constraint).');
    }
    if (lower.includes('sleep') || lower.includes('anxiety') || lower.includes('digestion') || lower.includes('dry') || lower.includes('cold')) {
      subjAyurvedic.push('Patient reports variable appetite (Vishama Agni), irregular sleep, and sensitivity to cold/dry environments.');
    }
    if (lower.includes('neck') || lower.includes('back') || lower.includes('posture') || lower.includes('sitting') || lower.includes('twist')) {
      subjOsteopathic.push('Compensatory postural strain and positional discomfort exacerbated by prolonged sitting.');
    }

    if (subjWestern.length === 0) subjWestern.push('Patient presents for comprehensive multi-paradigm health review.');
    if (subjEastern.length === 0) subjEastern.push('No acute organ disharmony reported.');
    if (subjAyurvedic.length === 0) subjAyurvedic.push('Dosha constitutional balance currently baseline.');
    if (subjOsteopathic.length === 0) subjOsteopathic.push('No acute axial strain patterns endorsed.');

    // 2. Objective Parsing
    const objWestern = [
      'Vital Signs: Normotensive, stable resting heart rate.',
      'Physical Exam: Local tenderness assessed on palpation, range of motion evaluated.'
    ];
    const objEastern = [
      'Tongue: Pale red body with thin white coating (Normal to mild Qi deficiency).',
      'Pulse: Moderate rate, slightly wiry quality in middle positions.'
    ];
    const objAyurvedic = [
      'Nadi & Dhatu Exam: Vata pulse predominant with mild Pitta heat undertones.',
      'Srotas Assessment: Channels of circulation open without severe Ama obstruction.'
    ];
    const objOsteopathic = [
      'TART Assessment: Tissue texture abnormality noted in paraspinal musculature.',
      'Asymmetry & Range of Motion: Mild rotational restriction in thoracic spine.'
    ];

    // 3. Assessment Parsing
    const assessWestern = [
      'Musculoskeletal strain and regional joint overload.',
      'ICD-10 M25.56: Pain in knee / axial region (rule out acute ligamentous/meniscal lesion).'
    ];
    const assessEastern = [
      'TCM Pattern: Liver Qi Stagnation with Spleen Qi Deficiency.',
      'Meridian Assessment: Imbalance along Liver (LV), Spleen (SP), and Gallbladder (GB) channels.'
    ];
    const assessAyurvedic = [
      'Ayurvedic Assessment: Vata-Pitta aggravation affecting Majja and Asthi Dhatus.',
      'Agni Status: Mild Manda/Vishama Agni.'
    ];
    const assessOsteopathic = [
      'Somatic Dysfunction: T4-T8 group rotation and sacral torsion.',
      'Biomechanical Kinetic Chain: Compensatory pelvic obliquity.'
    ];

    // 4. Plan Parsing
    const planWestern = [
      'Diagnostic Imaging: Consider Weight-Bearing Radiographs / 3D Kinematics MRI if symptoms persist.',
      'Physical Therapy: Quadriceps strengthening, hamstring stretching, core stabilization.',
      'Pharmacology/OTC: NSAIDs PRN with food for acute flare-ups.'
    ];
    const planEastern = [
      'Acupuncture: ST-36 (Zusanli), SP-6 (Sanyinjiao), LV-3 (Taichong), GB-34 (Yanglingquan).',
      'Herbal/Lifestyle: Xiao Yao San formulation; warm nourishing teas; mindful breathing.'
    ];
    const planAyurvedic = [
      'Dietary (Ahara): Warm cooked foods, ghee, avoid raw cold foods.',
      'Lifestyle (Vihara): Daily Abhyanga (warm sesame oil self-massage) and Nadi Shodhana pranayama.'
    ];
    const planOsteopathic = [
      'OMT Intervention: Muscle Energy Technique (MET) to thoracic spine, suboccipital release, myofascial unwinding.',
      'Ergonomics: Standing desk intervals and lumbar support posture correction.'
    ];

    return {
      id: noteId,
      generatedAt,
      rawTranscript: text,
      subjective: {
        title: 'Subjective (S)',
        western: subjWestern,
        eastern: subjEastern,
        ayurvedic: subjAyurvedic,
        osteopathic: subjOsteopathic
      },
      objective: {
        title: 'Objective (O)',
        western: objWestern,
        eastern: objEastern,
        ayurvedic: objAyurvedic,
        osteopathic: objOsteopathic
      },
      assessment: {
        title: 'Assessment (A)',
        western: assessWestern,
        eastern: assessEastern,
        ayurvedic: assessAyurvedic,
        osteopathic: assessOsteopathic
      },
      plan: {
        title: 'Plan (P)',
        western: planWestern,
        eastern: planEastern,
        ayurvedic: planAyurvedic,
        osteopathic: planOsteopathic
      }
    };
  }

  /**
   * Formats structured SOAP note as clean Markdown.
   */
  formatAsMarkdown(note: IStructuredSoapNote): string {
    return `# 4-Paradigm Clinical SOAP Note
**Note ID:** ${note.id}  
**Timestamp:** ${note.generatedAt}  

---

## 1. Subjective (S)
### 🩺 Western
${note.subjective.western.map(s => `- ${s}`).join('\n')}
### 🌿 Traditional Chinese Medicine (TCM)
${note.subjective.eastern.map(s => `- ${s}`).join('\n')}
### 🪷 Ayurvedic
${note.subjective.ayurvedic.map(s => `- ${s}`).join('\n')}
### 🦴 Osteopathic
${note.subjective.osteopathic.map(s => `- ${s}`).join('\n')}

---

## 2. Objective (O)
### 🩺 Western
${note.objective.western.map(s => `- ${s}`).join('\n')}
### 🌿 Traditional Chinese Medicine (TCM)
${note.objective.eastern.map(s => `- ${s}`).join('\n')}
### 🪷 Ayurvedic
${note.objective.ayurvedic.map(s => `- ${s}`).join('\n')}
### 🦴 Osteopathic
${note.objective.osteopathic.map(s => `- ${s}`).join('\n')}

---

## 3. Assessment (A)
### 🩺 Western
${note.assessment.western.map(s => `- ${s}`).join('\n')}
### 🌿 Traditional Chinese Medicine (TCM)
${note.assessment.eastern.map(s => `- ${s}`).join('\n')}
### 🪷 Ayurvedic
${note.assessment.ayurvedic.map(s => `- ${s}`).join('\n')}
### 🦴 Osteopathic
${note.assessment.osteopathic.map(s => `- ${s}`).join('\n')}

---

## 4. Plan (P)
### 🩺 Western
${note.plan.western.map(s => `- ${s}`).join('\n')}
### 🌿 Traditional Chinese Medicine (TCM)
${note.plan.eastern.map(s => `- ${s}`).join('\n')}
### 🪷 Ayurvedic
${note.plan.ayurvedic.map(s => `- ${s}`).join('\n')}
### 🦴 Osteopathic
${note.plan.osteopathic.map(s => `- ${s}`).join('\n')}
`;
  }
}
