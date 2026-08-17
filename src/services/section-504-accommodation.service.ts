import { Injectable, signal, computed } from '@angular/core';

export type Section504Category = 
  | 'type1_diabetes'
  | 'adhd_executive_function'
  | 'food_allergy_anaphylaxis'
  | 'pots_dysautonomia'
  | 'epilepsy_seizure'
  | 'asthma_respiratory'
  | 'dyslexia_learning'
  | 'ibd_gastrointestinal'
  | 'juvenile_arthritis';

export interface IAccommodationItem {
  id: string;
  category: string;
  title: string;
  description: string;
  rationale: string;
  isMandatory: boolean;
}

export interface IEmergencyActionProtocol {
  triggerSymptoms: string[];
  immediateSteps: string[];
  rescueMedication?: {
    name: string;
    dosage: string;
    route: string;
    location: string;
  };
  call911Criteria: string[];
}

export interface ISection504Plan {
  id: string;
  patientId: string;
  studentName: string;
  dateOfBirth?: string;
  gradeLevel?: string;
  schoolName?: string;
  attendingPhysician: string;
  physicianLicense?: string;
  primaryDiagnosis: string;
  icd10Codes: string[];
  functionalImpairmentSummary: string;
  accommodations: IAccommodationItem[];
  emergencyActionPlan?: IEmergencyActionProtocol;
  testingAccommodations: string[];
  physicalEducationModifications: string[];
  peModifications: string[];
  transportationProvisions?: string;
  generatedDate: string;
  reviewDate: string;
  fhirBundleDigest: string;
}

export interface ISubstituteTeacherCard {
  studentName: string;
  gradeLevel: string;
  conditionName: string;
  quickIdentifier: string;
  threeKeyRules: string[];
  emergencyActionText: string;
  rescueMedLocation: string;
  nurseExtension: string;
}

export interface IPediatricCourageBadge {
  badgeTitle: string;
  recipientName: string;
  badgeLevel: string;
  heroicAttributes: string[];
  motto: string;
  artworkTheme: string;
  dateGranted: string;
  physicianSignature: string;
}

@Injectable({
  providedIn: 'root'
})
export class Section504AccommodationService {
  readonly activePlans = signal<ISection504Plan[]>([]);
  readonly selectedPlan = signal<ISection504Plan | null>(null);

  readonly totalPlansCount = computed(() => this.activePlans().length);

  /**
   * Standard Clinical 504 Accommodation Catalog across pediatric chronic conditions.
   */
  readonly standardAccommodationCatalog: Record<Section504Category, {
    primaryDiagnosis: string;
    icd10: string[];
    functionalImpairment: string;
    accommodations: IAccommodationItem[];
    testingAccommodations: string[];
    peModifications: string[];
    emergencyProtocol?: IEmergencyActionProtocol;
  }> = {
    type1_diabetes: {
      primaryDiagnosis: 'Type 1 Diabetes Mellitus (Insulin Dependent)',
      icd10: ['E10.9', 'Z96.41'],
      functionalImpairment: 'Endocrine impairment requiring continuous subcutaneous glucose monitoring (CGM), carbohydrate calculation, and immediate treatment of hypoglycemia and hyperglycemia to prevent neuroglycopenia or ketoacidosis.',
      accommodations: [
        {
          id: 't1d-cgm',
          category: 'Medical Device Access',
          title: 'Continuous CGM & Smart Device Classroom Access',
          description: 'Student is permitted to carry their CGM receiver/smartphone on their person at all times with audible alerts enabled, including during standardized exams.',
          rationale: 'Necessary to detect rapid rate-of-fall glucose excursions before neuroglycopenia occurs.',
          isMandatory: true
        },
        {
          id: 't1d-water-restroom',
          category: 'Physiological Access',
          title: 'Unrestricted Water & Restroom Access',
          description: 'Student has automatic, unrestricted hall pass to drink water and use the restroom without delay or penalty.',
          rationale: 'Hyperglycemia triggers osmotic diuresis requiring immediate hydration and urination.',
          isMandatory: true
        },
        {
          id: 't1d-snack',
          category: 'Nutrition & Rescue',
          title: 'Immediate Fast-Acting Carbohydrate Access',
          description: 'Permitted to consume fast-acting carbohydrates (glucose tabs, juice boxes) anywhere on school grounds, including classrooms, library, and gym.',
          rationale: 'Prevents progression of mild hypoglycemia (< 70 mg/dL) into loss of consciousness or seizures.',
          isMandatory: true
        }
      ],
      testingAccommodations: [
        'Stop-the-clock testing pauses for blood glucose checks or hypoglycemia recovery (15–20 minutes).',
        'Testing rescheduling if blood glucose is < 70 mg/dL or > 300 mg/dL with ketones within 1 hour prior to exam.'
      ],
      peModifications: [
        'Pre-exercise glucose check required. If < 100 mg/dL, provide 15g fast-acting carbs before activity.',
        'Immediate access to glucose kit and designated peer/buddy system during field trips and sports.'
      ],
      emergencyProtocol: {
        triggerSymptoms: ['Confusion', 'Sweating', 'Slurred speech', 'Seizure', 'Unresponsiveness'],
        immediateSteps: [
          'If conscious: Administer 15g fast-acting glucose (4 oz juice). Re-check CGM in 15 minutes.',
          'If unconscious or seizing: Do NOT put anything in mouth. Place in recovery position.'
        ],
        rescueMedication: {
          name: 'Nasal Glucagon (Baqsimi) or Subcutaneous Glucagon (Gvoke)',
          dosage: '3mg intranasal or 0.5mg/1mg SQ auto-injector',
          route: 'Intranasal / Subcutaneous',
          location: 'Student backpack and School Health Clinic'
        },
        call911Criteria: [
          'Loss of consciousness',
          'Seizure activity',
          'Blood glucose remains < 54 mg/dL after 2 rescue doses'
        ]
      }
    },

    pots_dysautonomia: {
      primaryDiagnosis: 'Postural Orthostatic Tachycardia Syndrome (POTS) & Autonomic Dysfunction',
      icd10: ['G90.A', 'R00.0'],
      functionalImpairment: 'Autonomic nervous system impairment resulting in excessive orthostatic tachycardia (HR increase >= 30 bpm upon standing), cerebral hypoperfusion, cognitive brain fog, and presyncope.',
      accommodations: [
        {
          id: 'pots-hydration',
          category: 'Hydration & Electrolytes',
          title: 'Continuous Desk Hydration & Electrolyte Administration',
          description: 'Permitted to maintain an insulated water bottle and electrolyte packets at desk at all times, consuming 2.5–3.5L fluids and 4–6g sodium daily.',
          rationale: 'Maintains intravascular blood volume to counter venous pooling in lower extremities.',
          isMandatory: true
        },
        {
          id: 'pots-elevator',
          category: 'Mobility & Environmental',
          title: 'Elevator Pass & Dual Textbook Set',
          description: 'Permanent elevator access pass to prevent prolonged stair climbing; second set of textbooks provided for home use to minimize backpack weight (< 5 lbs).',
          rationale: 'Stair climbing and heavy spinal load trigger acute venous pooling and presyncope.',
          isMandatory: true
        },
        {
          id: 'pots-morning',
          category: 'Attendance & Scheduling',
          title: 'Morning Lateness Allowance & Cool Ambient Seating',
          description: 'Excused morning tardiness during severe orthostatic flare-ups; seating assigned away from direct heat radiators or sunny windows with room temp <= 70°F.',
          rationale: 'Orthostatic intolerance is clinically worst in morning hours due to nocturnal fluid shifts.',
          isMandatory: false
        }
      ],
      testingAccommodations: [
        'Frequent positional stretch breaks during exams > 45 minutes.',
        'Option to test in cool, well-ventilated room with legs elevated.'
      ],
      peModifications: [
        'Exempt from prolonged upright standing drills, cross-country distance running, or high-heat outdoor gym.',
        'Substitution with recumbent stationary cycling, rowing machine, or swimming.'
      ],
      emergencyProtocol: {
        triggerSymptoms: ['Tunnel vision', 'Severe dizziness', 'Pallor', 'Syncope (Fainting)'],
        immediateSteps: [
          'Lay student completely flat on back with legs elevated at 45 degrees.',
          'Loosen restrictive clothing and apply cool damp compress to forehead/neck.',
          'Do NOT force student to stand up quickly.'
        ],
        call911Criteria: [
          'Loss of consciousness exceeding 60 seconds',
          'Head trauma sustained during fall',
          'Persistent chest pain or irregular tachycardia > 180 bpm'
        ]
      }
    },

    food_allergy_anaphylaxis: {
      primaryDiagnosis: 'Severe IgE-Mediated Food Anaphylaxis (Peanuts / Tree Nuts / Milk / Shellfish)',
      icd10: ['T78.00XA', 'Z88.0'],
      functionalImpairment: 'Immune hypersensitivity capable of triggering life-threatening biphasic anaphylaxis with airway compromise, hypotension, and circulatory collapse upon microscopic allergen exposure.',
      accommodations: [
        {
          id: 'allergy-epipen',
          category: 'Emergency Medication',
          title: 'Self-Carry Epinephrine Auto-Injectors (Two-Pack)',
          description: 'Student is legally authorized to self-carry a dual-pack of Epinephrine auto-injectors on their person at all times, with backup pack in health office.',
          rationale: 'Fatal anaphylaxis correlates directly with delayed epinephrine administration (> 10-minute delay).',
          isMandatory: true
        },
        {
          id: 'allergy-table',
          category: 'Environmental Safety',
          title: 'Allergen-Aware Seating & Handwashing Protocol',
          description: 'Designated allergen-aware cafeteria seating with dedicated surface sanitization; mandatory handwashing with soap and water before classroom activities.',
          rationale: 'Hand sanitizers do NOT eliminate food protein residues from surfaces.',
          isMandatory: true
        }
      ],
      testingAccommodations: [
        'Pre-sanitized exam desk verified free of allergen residue.',
        'Permission to carry safe, parent-provided snacks and epinephrine into exam halls.'
      ],
      peModifications: [
        'Epinephrine auto-injector pack must accompany student to all outdoor athletic fields and gym classes.'
      ],
      emergencyProtocol: {
        triggerSymptoms: ['Hives', 'Lip/tongue swelling', 'Throat tightness', 'Wheezing', 'Vomiting', 'Dizziness'],
        immediateSteps: [
          'IMMEDIATELY administer Epinephrine auto-injector into outer mid-thigh (held for 3 seconds).',
          'Call 911 and notify EMS that epinephrine has been administered for anaphylaxis.',
          'Lay student flat with legs elevated (or seated upright if breathing is labored).'
        ],
        rescueMedication: {
          name: 'Epinephrine Auto-Injector (EpiPen / Auvi-Q)',
          dosage: '0.15mg (< 30 kg) or 0.30mg (>= 30 kg)',
          route: 'Intramuscular (Anterolateral Thigh)',
          location: 'Student pocket/backpack & Nurse Clinic'
        },
        call911Criteria: [
          'ANY administration of Epinephrine requires immediate 911 activation due to risk of biphasic reaction.'
        ]
      }
    },

    adhd_executive_function: {
      primaryDiagnosis: 'Attention-Deficit/Hyperactivity Disorder (Combined Type) & Executive Dysfunction',
      icd10: ['F90.2'],
      functionalImpairment: 'Neurodevelopmental dopaminergic dysregulation affecting sustained vigilance, working memory, impulse inhibition, and sequential task initiation.',
      accommodations: [
        {
          id: 'adhd-seating',
          category: 'Classroom Environment',
          title: 'Preferential Low-Distraction Seating',
          description: 'Seating near the primary teacher instruction point, away from noisy hallways, doorways, and pencil sharpeners.',
          rationale: 'Minimizes competing sensory stimuli to support selective auditory attention.',
          isMandatory: true
        },
        {
          id: 'adhd-breaks',
          category: 'Cognitive Pacing',
          title: 'Scheduled Movement & Reset Breaks',
          description: 'Brief 2-minute kinesthetic movement breaks every 25 minutes (e.g., passing papers, water errand) to modulate cortical arousal.',
          rationale: 'Physical motor activity increases prefrontal dopamine and norepinephrine release.',
          isMandatory: true
        },
        {
          id: 'adhd-chunking',
          category: 'Instructional Scaffolding',
          title: 'Multi-Step Task Chunking & Visual Checklists',
          description: 'Complex assignments broken into numbered sequential sub-tasks with visual milestone checklists provided in advance.',
          rationale: 'Accommodates reduced phonological and spatial working memory capacity.',
          isMandatory: false
        }
      ],
      testingAccommodations: [
        '50% extended time (1.5x) on exams > 30 minutes to accommodate processing speed variability.',
        'Testing in a small-group, low-distraction setting (<= 8 students).'
      ],
      peModifications: [
        'Visual multi-modal demonstrations of game rules; clear verbal redirection when impulsivity arises.'
      ]
    },

    epilepsy_seizure: {
      primaryDiagnosis: 'Generalized Tonic-Clonic & Absence Epilepsy',
      icd10: ['G40.909'],
      functionalImpairment: 'Cerebral neuronal hypersynchrony causing transient paroxysmal disruptions of consciousness, motor control, and post-ictal cognitive fatigue.',
      accommodations: [
        {
          id: 'epi-safety',
          category: 'Physical Safety',
          title: 'Seizure Precautions & Safe Floor Environment',
          description: 'Never left unattended in elevated lab stations or swimming pools; designated quiet recovery space in health room post-seizure.',
          rationale: 'Prevents secondary traumatic injury during paroxysmal events.',
          isMandatory: true
        },
        {
          id: 'epi-flashing',
          category: 'Trigger Minimization',
          title: 'Photosensitive Trigger Avoidance',
          description: 'Advance notice for video materials containing rapid strobe or flashing lights (> 3 Hz); blue-light filtering monitor.',
          rationale: 'Prevents photoparoxysmal EEG discharges and seizure induction.',
          isMandatory: true
        }
      ],
      testingAccommodations: [
        'Post-ictal rest allowance: Exams postponed if student experienced a seizure within 4 hours prior.',
        'Frequent breaks during computer-based testing.'
      ],
      peModifications: [
        'Continuous 1-on-1 visual supervision during swimming; protective headgear during high-impact sports if indicated.'
      ],
      emergencyProtocol: {
        triggerSymptoms: ['Sudden fall', 'Rhythmic convulsive jerking', 'Unresponsive blank staring > 10s', 'Cyanosis'],
        immediateSteps: [
          'Ease student gently to floor; turn student onto SIDE into recovery position.',
          'Clear hard or sharp objects away. Place soft cushion under head.',
          'Time the duration of the seizure. Do NOT restrain or place objects in mouth.'
        ],
        rescueMedication: {
          name: 'Nasal Midazolam (Nayzilam) or Rectal Diazepam (Diastat)',
          dosage: '5mg intranasal spray (1 spray in 1 nostril)',
          route: 'Intranasal',
          location: 'School Health Office'
        },
        call911Criteria: [
          'Seizure convulsive phase lasts > 5 minutes',
          'Second seizure occurs without full return of consciousness between events',
          'Difficulty breathing or skin remains blue after seizure ends'
        ]
      }
    },

    asthma_respiratory: {
      primaryDiagnosis: 'Chronic Persistent Asthma with Reactive Airway Hyperresponsiveness',
      icd10: ['J45.40'],
      functionalImpairment: 'Bronchospasm and airway inflammation triggered by exercise, cold air, viral illness, or ambient aeroallergens (AQI > 100).',
      accommodations: [
        {
          id: 'asthma-inhaler',
          category: 'Medication Access',
          title: 'Self-Carry Quick-Relief Albuterol Inhaler & Spacer',
          description: 'Student is authorized to self-carry short-acting beta-agonist (SABA) inhaler on person at all times, with pre-exercise dose 15 mins prior to gym.',
          rationale: 'Rapid bronchodilation prevents severe exercise-induced bronchoconstriction (EIB).',
          isMandatory: true
        },
        {
          id: 'asthma-aqi',
          category: 'Environmental Quality',
          title: 'Indoor Recess During High AQI / Cold Weather Alerts',
          description: 'Exempt from outdoor activities when Air Quality Index (AQI) > 100 or ambient temperature is < 32°F.',
          rationale: 'Cold, dry air and particulate matter trigger severe bronchial mast-cell degranulation.',
          isMandatory: true
        }
      ],
      testingAccommodations: [
        'Access to inhaler and water during all testing sessions.',
        'Testing in air-conditioned / HEPA-filtered classroom.'
      ],
      peModifications: [
        'Warm-up period prior to vigorous exertion; allowed to self-pace and take rest intervals without grade penalty.'
      ],
      emergencyProtocol: {
        triggerSymptoms: ['Severe wheezing', 'Intercostal retractions (chest pulling)', 'Cannot speak full sentences'],
        immediateSteps: [
          'Administer 2–4 puffs of Albuterol with spacer. Have student sit upright and take slow deep breaths.',
          'If no improvement in 5 minutes, repeat 2–4 puffs.'
        ],
        rescueMedication: {
          name: 'Albuterol HFA (90mcg/puff) with Valved Holding Chamber',
          dosage: '2–4 puffs with spacer',
          route: 'Inhalation',
          location: 'Student pocket/backpack & Health Clinic'
        },
        call911Criteria: [
          'Severe retractions or cyanosis (blue lips/fingertips)',
          'Peak flow meter reading < 50% of personal best',
          'Inhaler provides no relief after 10 minutes'
        ]
      }
    },

    dyslexia_learning: {
      primaryDiagnosis: 'Specific Learning Disorder with Impairment in Reading (Developmental Dyslexia)',
      icd10: ['F81.0'],
      functionalImpairment: 'Phonological processing and visual-orthographic decoding deficit causing significantly reduced reading fluency, spelling accuracy, and cognitive reading fatigue.',
      accommodations: [
        {
          id: 'dys-tts',
          category: 'Assistive Technology',
          title: 'Text-to-Speech (TTS) & Screen Reader Software',
          description: 'Access to speech synthesis software for all grade-level textbooks, digital worksheets, and exam prompts.',
          rationale: 'Bypasses low-level phonological bottleneck to enable accurate comprehension of grade-level content.',
          isMandatory: true
        },
        {
          id: 'dys-typography',
          category: 'Visual Scaffolding',
          title: 'High-Legibility Dyslexia Font & Color Contrast Overlays',
          description: 'Printed materials formatted in clean sans-serif/dyslexic typography (OpenDyslexic / Lexend / Caslon Text) with line spacing >= 1.5x on cream paper.',
          rationale: 'Reduces visual crowding and letter-inversion perceptual distortions.',
          isMandatory: true
        }
      ],
      testingAccommodations: [
        '50% extended time (1.5x) on reading-intensive examinations.',
        'Audio presentation of exam questions; exemption from spelling penalties on content knowledge tests.'
      ],
      peModifications: []
    },

    ibd_gastrointestinal: {
      primaryDiagnosis: 'Inflammatory Bowel Disease (Crohn\'s Disease / Ulcerative Colitis)',
      icd10: ['K50.90', 'K51.90'],
      functionalImpairment: 'Chronic gastrointestinal mucosal inflammation resulting in sudden, unpredictable urgency, abdominal pain, malabsorption fatigue, and joint arthralgias.',
      accommodations: [
        {
          id: 'ibd-pass',
          category: 'Physiological Urgency',
          title: 'Discreet Unrestricted Restroom Pass & Staff Bathroom Key',
          description: 'Permanent unrestricted restroom pass with zero verbal interrogation; access to private staff/nurse restroom facility.',
          rationale: 'Immediate toilet access is medically mandatory to avoid fecal incontinence and visceral pain.',
          isMandatory: true
        },
        {
          id: 'ibd-hydration',
          category: 'Hydration & Nutrition',
          title: 'Electrolyte Hydration & Gastrointestinal Snack Access',
          description: 'Desk access to oral rehydration solutions (ORS) and GI-safe snacks throughout the day.',
          rationale: 'Chronic mucosal diarrhea accelerates electrolyte depletion and hypovolemia.',
          isMandatory: true
        }
      ],
      testingAccommodations: [
        'Stop-the-clock testing pauses for bathroom emergencies.',
        'Testing in proximity to private restroom facility.'
      ],
      peModifications: [
        'Self-pacing during flare-ups; exemption from vigorous abdominal compression exercises.'
      ]
    },

    juvenile_arthritis: {
      primaryDiagnosis: 'Juvenile Idiopathic Arthritis (JIA) / Polyarticular Rheumatologic Disease',
      icd10: ['M08.00'],
      functionalImpairment: 'Synovial joint inflammation, morning stiffness (gel phenomenon), and chronic musculoskeletal pain limiting prolonged handwriting and physical mobility.',
      accommodations: [
        {
          id: 'jia-scribe',
          category: 'Ergonomic & Assistive Tech',
          title: 'Speech-to-Text Dictation & Digital Note-Taking Keyboard',
          description: 'Access to tablet/laptop for written assignments; peer note-taker or printed lecture outlines provided.',
          rationale: 'Prevents acute MCP/PIP finger joint strain and tenosynovitis from prolonged handwriting.',
          isMandatory: true
        },
        {
          id: 'jia-elevator',
          category: 'Mobility Access',
          title: 'Elevator Access Pass & Early Class Release (3 Minutes)',
          description: 'Elevator pass to avoid stairs; allowed to leave class 3 minutes early to navigate hallways safely before crowded passing periods.',
          rationale: 'Protects weight-bearing knees and hips from collision and rapid stair trauma.',
          isMandatory: true
        }
      ],
      testingAccommodations: [
        'Typing accommodation for essay exams.',
        'Frequent 2-minute hand stretching breaks during extended tests.'
      ],
      peModifications: [
        'Non-weight-bearing physical education alternatives (swimming, upper-body conditioning); exemption from high-impact running on asphalt.'
      ]
    }
  };

  /**
   * Synthesizes a formal Section 504 Plan for a given student condition.
   */
  generateSection504Plan(params: {
    patientId: string;
    studentName: string;
    conditionCategory: Section504Category;
    gradeLevel?: string;
    schoolName?: string;
    attendingPhysician?: string;
    customAccommodations?: string[];
    saveToState?: boolean;
  }): ISection504Plan {
    const template = this.standardAccommodationCatalog[params.conditionCategory];
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const customItems: IAccommodationItem[] = (params.customAccommodations || []).map((desc, idx) => ({
      id: `custom-acc-${idx + 1}`,
      category: 'Specialized Custom Accommodation',
      title: 'Individualized Classroom Modification',
      description: desc,
      rationale: 'Specific clinical necessity determined by attending medical provider.',
      isMandatory: true
    }));

    const plan: ISection504Plan = {
      id: `504-${params.patientId}-${Date.now()}`,
      patientId: params.patientId,
      studentName: params.studentName,
      gradeLevel: params.gradeLevel || 'Standard Grade',
      schoolName: params.schoolName || 'Enrolled School District',
      attendingPhysician: params.attendingPhysician || 'Dr. Phil Gear, FACP',
      physicianLicense: 'CA-MD-94021',
      primaryDiagnosis: template.primaryDiagnosis,
      icd10Codes: template.icd10,
      functionalImpairmentSummary: template.functionalImpairment,
      accommodations: [...template.accommodations, ...customItems],
      testingAccommodations: template.testingAccommodations,
      physicalEducationModifications: template.peModifications,
      peModifications: template.peModifications,
      emergencyActionPlan: template.emergencyProtocol,
      generatedDate: today,
      reviewDate: nextYear,
      fhirBundleDigest: `urn:uuid:504-bundle-${Math.random().toString(36).substring(2, 10)}`
    };

    if (params.saveToState) {
      this.activePlans.update(plans => [plan, ...plans]);
      this.selectedPlan.set(plan);
    }
    return plan;
  }

  savePlan(plan: ISection504Plan): void {
    this.activePlans.update(plans => [plan, ...plans]);
    this.selectedPlan.set(plan);
  }

  /**
   * Generates a 30-second rapid summary card for substitute teachers and staff.
   */
  generateSubstituteTeacherCard(plan: ISection504Plan): ISubstituteTeacherCard {
    const rules: string[] = plan.accommodations.slice(0, 3).map(a => `${a.title}: ${a.description}`);
    const eapText = plan.emergencyActionPlan 
      ? `If ${plan.emergencyActionPlan.triggerSymptoms.slice(0, 2).join(' or ')}, take immediate action: ${plan.emergencyActionPlan.immediateSteps[0] || 'Notify nurse'}.`
      : 'Follow standard classroom guidelines.';

    const medLoc = plan.emergencyActionPlan?.rescueMedication 
      ? `${plan.emergencyActionPlan.rescueMedication.name} (${plan.emergencyActionPlan.rescueMedication.location})`
      : 'Health Office / Nurse Station';

    return {
      studentName: plan.studentName,
      gradeLevel: plan.gradeLevel || 'Enrolled Student',
      conditionName: plan.primaryDiagnosis,
      quickIdentifier: `Student ${plan.studentName} has a legal medical Section 504 plan for ${plan.primaryDiagnosis}.`,
      threeKeyRules: rules.length > 0 ? rules : ['Allow unrestricted hydration and restroom passes', 'Never delay access to school nurse'],
      emergencyActionText: eapText,
      rescueMedLocation: medLoc,
      nurseExtension: 'Ext. 104 / Speed-Dial 1'
    };
  }

  /**
   * Generates a printable Pediatric Courage & Resilience Keepsake Badge for young patients.
   */
  generatePediatricCourageBadge(studentName: string, conditionCategory: Section504Category): IPediatricCourageBadge {
    const titles: Record<Section504Category, string> = {
      type1_diabetes: 'Grand Commander of Glucose Harmony & Cellular Energy',
      pots_dysautonomia: 'Master Navigator of Ocean Currents & Vagal Calm',
      food_allergy_anaphylaxis: 'Guardian of Safe Horizons & Golden Vigilance',
      adhd_executive_function: 'Grand Architect of Creative Lightning & Focus Sparks',
      epilepsy_seizure: 'Champion of Steady Rhythms & Lightning Courage',
      asthma_respiratory: 'Admiral of Gentle Breezes & Deep Breathing',
      dyslexia_learning: 'Master Storyteller & Multidimensional Thinker',
      ibd_gastrointestinal: 'Warrior of Resilience & Gut Instinct Strength',
      juvenile_arthritis: 'Noble Knight of Gentle Motion & Enduring Spirit'
    };

    const mottos: Record<Section504Category, string> = {
      type1_diabetes: 'Strong cells, steady mind, unstoppable spirit.',
      pots_dysautonomia: 'Like the seagull resting on the crest of the wave, balance is within.',
      food_allergy_anaphylaxis: 'Clear eyes, true friends, fierce protection.',
      adhd_executive_function: 'My mind creates constellations where others see stars.',
      epilepsy_seizure: 'Courage is the light that shines after every storm.',
      asthma_respiratory: 'Every breath is a reminder of how high I can soar.',
      dyslexia_learning: 'Words are maps, and I am the explorer.',
      ibd_gastrointestinal: 'Strength is not the absence of challenge, but rising each morning.',
      juvenile_arthritis: 'Every step forward is a victory of will.'
    };

    return {
      badgeTitle: titles[conditionCategory] || 'Order of the Brave Seagull',
      recipientName: studentName || 'Champion Patient',
      badgeLevel: 'Honorary First Class Navigator',
      heroicAttributes: [
        'Unwavering Resilience & Tenacity',
        'Mastery of Daily Healthspan Habits',
        'Inspiring Kindness to Fellow Classmates'
      ],
      motto: mottos[conditionCategory] || 'Soar high above the storm.',
      artworkTheme: 'Origami Seagull & Coastal Lighthouse Folio',
      dateGranted: new Date().toISOString().split('T')[0],
      physicianSignature: 'Dr. Phil Gear, FACP'
    };
  }
}
