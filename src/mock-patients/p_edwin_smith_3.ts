import { IPatient } from '../services/patient.types';

export const p_edwin_smith_3: IPatient = {
  id: "p_edwin_smith_3",
  name: "Edwin Smith Case 3",
  age: 30,
  gender: "Male",
  lastVisit: "-1600.01.01",
  preexistingConditions: [
    "Traumatic Skull Fracture",
    "Meningeal exposure",
    "Cervical rigidity"
  ],
  patientGoals: "Stabilize acute head injury, wound care, and address neck stiffness.",
  tcmIntake: {
    tongueColor: "purple",
    tongueCoating: "thick-white",
    pulseQuality: "wiry",
    thermalPreference: "neutral",
    sweatPattern: "spontaneous-day",
    tasteInMouth: "metallic",
    tcmPattern: "Acute Traumatic Qi & Blood Stagnation in Du Mai Channel"
  },
  ayurvedicIntake: {
    prakritiVata: 5,
    prakritiPitta: 6,
    prakritiKapha: 3,
    vikritiVata: 9,
    vikritiPitta: 7,
    vikritiKapha: 3,
    agniType: "vishamagni",
    amaScore: 7.9,
    nadiPulseType: "snake-vata",
    ayurvedicImbalance: "Severe Vata Wind Collapse in Pranavaha & Majjavaha Srotas"
  },
  vitals: {
    bp: "110/70",
    hr: "64",
    temp: "99.2°F",
    spO2: "95%",
    weight: "150 lbs",
    height: "5'7\"",
    vitD3: "30 ng/mL",
    magnesium: "2.0 mg/dL",
    b12: "500 pg/mL",
    zinc: "80 mcg/dL"
  },
  oxidativeStressMarkers: [
    { id: "1", name: "hsCRP", value: "12.5 mg/L (Severe Acute Trauma)" },
    { id: "2", name: "WBC Count", value: "14,200 /μL (Leukocytosis)" }
  ],
  antioxidantSources: [
    { id: "1", name: "Honey (Honey & Lint Dressing)", value: "High Enzymatic Osmotic Defense" },
    { id: "2", name: "Glutathione (GSH)", value: "1.6 μmol/g Hb" }
  ],
  medications: [
    { id: "1", name: "Fresh Meat & Grease Dressing", value: "Day 1 Hemostasis" },
    { id: "2", name: "Honey & Lint Poultice", value: "Daily Antimicrobial Wound Shield" }
  ],
  biometricHistory: [
    { timestamp: "-1600-01-01T08:00:00Z", type: "hr", value: "64" },
    { timestamp: "-1600-01-01T08:00:00Z", type: "bp", value: "110/70" }
  ],
  issues: {
    head: [
      {
        id: "head",
        noteId: "note_smith_head_1",
        name: "Skull & Cervical Spine Trauma",
        painLevel: 9,
        description: "Gaping wound in the head penetrating to the bone, smashing the skull. Patient is unable to look at his shoulders, suggesting severe cervical spine stiffness / meningeal irritation.",
        symptoms: [
          { name: "Gaping head wound", type: "Trauma", verified: true, timeline: "Acute" },
          { name: "Cervical rigidity (stiff neck)", type: "Neurological", verified: true, timeline: "Acute" }
        ]
      }
    ]
  },
  history: [
    {
      type: "AnalysisRun",
      date: "-1600.01.01",
      summary: "Historical Clinical Analysis",
      report: {
        "Summary Overview": "### Clinical Assessment\nEdwin Smith Case 3 presents with open penetrating cranial trauma and severe cervical rigidity. Ancient Egyptian surgical classification: *An ailment to be contended with*.\n\n### Priority List\n- **Wound Hemostasis & Infection Barrier**: Application of fresh meat dressing followed by honey-lint poultice.\n- **Cervical Spine Immobilization**: Prevent further spinal cord trauma during cervical neck stiffness.\n- **PhysioNet 2026 Telemetry**: Cervical vertebral dislocation and intracranial pressure (ICP) monitoring.\n\n### Goals\n- **Short-term**: Hemostasis within 12 hours; maintain clean wound margins.\n- **Long-term**: Granulation tissue formation and preservation of motor neurological function.",
        "Functional Protocols": "### Immediate Actions (Day 1-3)\n- Day 1: Bind wound with fresh meat to promote local coagulation.\n- Day 2+: Transition to honey poultice (natural osmotic antibacterial) and lint wraps.\n- Strict neck immobilization using head support blocks.",
        "Nutrition": "### Ancient Surgical Healing Protocol\n- High protein broth (wild game, bone broth).\n- Honey & pomegranate syrup for cellular repair co-factors.",
        "Monitoring & Follow-up": "### Tracking Schedule\n- Daily inspection for signs of suppurative infection or meningeal escalation.\n- PhysioNet continuous ICP and neck alignment telemetry.",
        "Patient Education": "### Practitioner Notes\n- Keep patient lying flat on back with head supported by linen rolls.",
        "Precision Nutrients": "### Ancient Orthomolecular Matrix\n- **Honey MGO**: High osmotic antibacterial shield.\n- **Zinc & Minerals**: Bio-available bone broth minerals.",
        "PhysioNet Telemetry": "### PhysioNet 2026 Challenge: Cervical Vertebral Dislocation & Spinal Shock Challenge\n- **Heart Rate**: 64 bpm (Bradycardic autonomic response)\n- **QRS Duration**: 92 ms\n- **Intracranial Pressure (ICP)**: 16 mmHg (Borderline elevated)\n- **Cervical Alignment Angle**: 12° Kyphotic tilt"
      }
    }
  ],
  bookmarks: [],
  scans: [
    {
      id: "scan_smith_1",
      title: "Cranial & Cervical Spine Inspection",
      type: "Document",
      date: "-1600.01.01",
      description: "Gaping skull fracture with visible meningeal pulsation; cervical spine rigidity upon passive lateral rotation.",
      status: "Abnormal"
    }
  ]
};
