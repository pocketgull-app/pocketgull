import { IPatient } from '../services/patient.types';

export const p003: IPatient = {
  id: "p003",
  name: "Homo Sapiens (Male, Geriatric Cardiac, 81y)",
  age: 81,
  gender: "Male",
  lastVisit: "2024.12.05",
  preexistingConditions: [
    "Ischemic Heart Disease",
    "Chronic Kidney Disease (Stage 3a)",
    "Mild Cognitive Impairment / Early Alzheimer's",
    "Osteoarthritis"
  ],
  patientGoals: "Family requested evaluation for increased confusion, recent fall at home, and gait instability.",
  vitals: {
    bp: "135/82",
    hr: "68",
    temp: "97.9°F",
    spO2: "97%",
    weight: "162 lbs",
    height: "5'9\"",
    vitD3: "22 ng/mL (Sub-optimal)",
    magnesium: "1.7 mg/dL (Low-normal)",
    b12: "410 pg/mL",
    zinc: "72 mcg/dL"
  },
  oxidativeStressMarkers: [
    { id: "1", name: "8-OHdG", value: "15 ng/mg creatinine (Elevated)" },
    { id: "2", name: "Lipid Peroxides", value: "12 nmol/mL (Elevated)" },
    { id: "3", name: "Amyloid-Beta 42/40 Ratio", value: "0.08 (Sub-optimal)" }
  ],
  antioxidantSources: [
    { id: "1", name: "Alpha-Tocopherol", value: "11.5 mg/L" },
    { id: "2", name: "CoQ10 (Ubiquinol)", value: "0.52 μg/mL (Low)" },
    { id: "3", name: "Glutathione (GSH)", value: "1.3 μmol/g Hb" }
  ],
  medications: [
    { id: "1", name: "Donepezil", value: "5mg Daily" },
    { id: "2", name: "Aspirin", value: "81mg Daily" },
    { id: "3", name: "Furosemide", value: "20mg Daily" },
    { id: "4", name: "Memantine", value: "10mg BID" }
  ],
  biometricHistory: [
    { timestamp: "2024-11-15T08:00:00Z", type: "hr", value: "72" },
    { timestamp: "2024-12-01T08:00:00Z", type: "hr", value: "70" },
    { timestamp: "2024-12-05T08:00:00Z", type: "hr", value: "68" },
    { timestamp: "2024-12-05T08:00:00Z", type: "bp", value: "135/82" }
  ],
  issues: {
    head: [
      {
        id: "head",
        noteId: "note_p003_head_1",
        name: "Neuro-Cognitive Decline & Memory",
        painLevel: 2,
        description: "Progressive short-term memory impairment with occasional disorientation during late afternoon.",
        symptoms: [
          { name: "Short-term memory loss", type: "Cognitive", verified: true, timeline: "Chronic" },
          { name: "Sundowning confusion", type: "Neurological", verified: true, timeline: "Episodic" }
        ]
      }
    ],
    limbs: [
      {
        id: "r_thigh",
        noteId: "note_p003_limbs_1",
        name: "Right Hip & Knee Osteoarthritis",
        painLevel: 5,
        description: "Moderate right hip joint stiffness contributing to antalgic gait and fall risk.",
        symptoms: [
          { name: "Gait instability", type: "Musculoskeletal", verified: true, timeline: "Chronic" }
        ]
      }
    ]
  },
  history: [
    {
      type: "AnalysisRun",
      date: "2024.12.05",
      summary: "Comprehensive Clinical Analysis",
      report: {
        "Summary Overview": "### Clinical Assessment\nWilliam Henderson is an 81-year-old male presenting with mild cognitive impairment, gait instability, and fall risk. Primary focus is on neuro-protection, fall prevention, and renal safety.\n\n### Priority List\n- **Fall Risk & Gait Telemetry**: PhysioNet 2026 gait sensor monitoring to prevent hip fracture.\n- **Neuro-Protection**: Optimize cholinergic signaling and reduce central oxidative stress.\n- **Renal Preservation**: Stage 3a CKD requires careful fluid and blood pressure balancing.\n\n### Goals\n- **Short-term**: Zero falls over next 30 days; complete occupational therapy home safety assessment.\n- **Long-term**: Maintain MoCA cognitive score >= 22; preserve ADL independence.",
        "Functional Protocols": "### Immediate Actions (Within 72 hours)\n- Initiate physical therapy balance training with gait sensor telemetry.\n- Remove home trip hazards (loose rugs, dim lighting).\n- Implement bedtime magnesium threonate for synaptic plastic support.",
        "Nutrition": "### MIND Diet Protocol\n- High polyphenol berry and green leafy vegetable intake.\n- Olive oil as primary dietary fat; wild salmon 2x/week.\n- Acetyl-L-Carnitine 500mg daily for mitochondrial transport.",
        "Monitoring & Follow-up": "### Tracking Schedule\n- Monthly MoCA and MMSE cognitive reassessment.\n- Bi-weekly renal eGFR and serum creatinine monitoring.\n- PhysioNet continuous accelerometer gait telemetry tracking.",
        "Patient Education": "### Family & Patient Guide\n- Keep daily routine structured and predictable to reduce sundowning.\n- Ensure adequate hydration throughout the day.",
        "Precision Nutrients": "### Orthomolecular Matrix\n- **Magnesium L-Threonate**: 1000mg (crosses blood-brain barrier).\n- **Omega-3 DHA**: 1000mg daily (neuronal membrane support).\n- **Vitamin B Complex (Methylated)**: 1 cap daily.",
        "PhysioNet Telemetry": "### PhysioNet 2026 Challenge: Synaptic Waveform & Gait Telemetry\n- **ECG QRS Duration**: 96 ms (Normal)\n- **ST Segment**: Neutral\n- **Gait Asymmetry Index**: 14.2% (Elevated fall risk threshold: > 10%)\n- **Postural Sway Velocity**: 2.8 cm/s"
      }
    }
  ],
  bookmarks: [],
  scans: [
    {
      id: "scan_p003_1",
      title: "Brain MRI Volumetric Study",
      type: "MRI",
      date: "2024.11.10",
      description: "Mild hippocampal volume loss bilateral; non-specific microvascular white matter ischemic changes (Fazekas Grade 1).",
      status: "Reviewed"
    }
  ]
};
