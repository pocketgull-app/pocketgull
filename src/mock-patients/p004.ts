import { IPatient } from '../services/patient.types';

export const p004: IPatient = {
  id: "p004",
  name: "Pongo Pygmaeus (Orangutan, Arboreal Hominid, 16y)",
  age: 16,
  gender: "Male",
  lastVisit: "2026.03.12",
  preexistingConditions: [
    "Ischemic Heart Disease (IHD)",
    "Chronic Obstructive Pulmonary Disease (COPD)",
    "Type 2 Diabetes Mellitus (T2DM)",
    "Chronic Kidney Disease (CKD) Stage 3a"
  ],
  patientGoals: "Optimize oxygenation, stabilize blood glucose, manage exertional chest tightness, and protect renal function.",
  vitals: {
    bp: "138/82",
    hr: "74",
    temp: "98.6°F",
    spO2: "92%",
    weight: "172 lbs",
    height: "5'9\"",
    vitD3: "26 ng/mL",
    magnesium: "1.9 mg/dL",
    b12: "490 pg/mL",
    zinc: "78 mcg/dL"
  },
  oxidativeStressMarkers: [
    { id: "1", name: "hsCRP", value: "4.5 mg/L (Elevated)" },
    { id: "2", name: "NT-proBNP", value: "450 pg/mL (Borderline High)" },
    { id: "3", name: "HbA1c", value: "7.4%" }
  ],
  antioxidantSources: [
    { id: "1", name: "CoQ10 (Ubiquinol)", value: "0.62 μg/mL" },
    { id: "2", name: "Glutathione (GSH)", value: "1.4 μmol/g Hb" }
  ],
  medications: [
    { id: "1", name: "Atorvastatin", value: "40mg PM" },
    { id: "2", name: "Metformin", value: "1000mg BID" },
    { id: "3", name: "Spiriva (Tiotropium)", value: "18mcg Daily Inhalation" },
    { id: "4", name: "Empagliflozin (SGLT2i)", value: "10mg AM" }
  ],
  biometricHistory: [
    { timestamp: "2026-03-01T08:00:00Z", type: "hr", value: "76" },
    { timestamp: "2026-03-05T08:00:00Z", type: "hr", value: "75" },
    { timestamp: "2026-03-12T08:00:00Z", type: "hr", value: "74" },
    { timestamp: "2026-03-12T08:00:00Z", type: "bp", value: "138/82" }
  ],
  issues: {
    chest: [
      {
        id: "chest",
        noteId: "note_p004_chest_1",
        name: "Cardiopulmonary Strain (IHD & COPD)",
        painLevel: 4,
        description: "Comorbid ischemic heart disease and moderate COPD. Reports mild shortness of breath on climbing stairs and chronic morning cough.",
        symptoms: [
          { name: "Dyspnea on exertion", type: "Respiratory", verified: true, timeline: "Chronic" },
          { name: "Exertional chest tightness", type: "Cardiovascular", verified: true, timeline: "Chronic" }
        ]
      }
    ],
    abdomen: [
      {
        id: "abdomen",
        noteId: "note_p004_abdomen_1",
        name: "Cardiometabolic & Renal Syndrome",
        painLevel: 2,
        description: "Longstanding type 2 diabetes with eGFR of 52 mL/min/1.73m² (Stage 3a CKD). Patient shows signs of mild fluid retention.",
        symptoms: [
          { name: "Mild pedal edema", type: "Renal", verified: true, timeline: "Chronic" }
        ]
      }
    ]
  },
  history: [
    {
      type: "AnalysisRun",
      date: "2026.03.12",
      summary: "Comprehensive Clinical Analysis",
      report: {
        "Summary Overview": "### Clinical Assessment\nGlobal Sentinel presents with comorbid ischemic heart disease, moderate COPD, and Stage 3a CKD. Focus is on cardiopulmonary protection, maintaining SpO2 > 92%, and avoiding nephrotoxic agents.\n\n### Priority List\n- **Cardiopulmonary Stabilization**: SpO2 tracking and exertional dyspnea management.\n- **SGLT2i Renal Protection**: Maintain renal perfusion and glycemic control.\n- **PhysioNet 2026 Telemetry**: Real-time ST segment & ECG ischemia monitoring.\n\n### Goals\n- **Short-term**: Maintain resting SpO2 >= 93% without supplemental O2.\n- **Long-term**: Prevent COPD exacerbations; preserve eGFR > 50 mL/min.",
        "Functional Protocols": "### Immediate Actions (Within 72 hours)\n- Pulmonary rehabilitation and pursed-lip breathing exercises.\n- Inhaled bronchodilator compliance check.\n- Daily morning weight tracking for fluid balance.",
        "Nutrition": "### Cardiorenal Diet Protocol\n- Low sodium (< 2000mg/day) and potassium-balanced Mediterranean meal pattern.\n- Beetroot juice dietary nitrate trial for endothelial vasodilation.",
        "Monitoring & Follow-up": "### Tracking Schedule\n- Daily SpO2 and blood pressure logs.\n- Monthly eGFR, cystatin-C, and urine albumin-to-creatinine ratio (uACR).\n- Continuous PhysioNet BLE multi-lead ECG stream.",
        "Patient Education": "### Patient Guidance\n- Use pursed-lip breathing during physical activity.\n- Report any sudden weight increase > 3 lbs in 2 days immediately.",
        "Precision Nutrients": "### Orthomolecular Matrix\n- **CoQ10 (Ubiquinol)**: 200mg daily (mitochondrial cardiac support).\n- **Magnesium Citrate**: 200mg daily (vascular smooth muscle tone).\n- **Omega-3 EPA/DHA**: 2000mg daily.",
        "PhysioNet Telemetry": "### PhysioNet 2026 Challenge: Multi-Lead ECG Ischemia & ST-Elevation Telemetry\n- **QRS Interval Duration**: 102 ms\n- **ST Segment Deviation**: +0.08 mV Lead II (Transient ischemic monitoring)\n- **QTc Interval**: 432 ms\n- **Respiratory Rate**: 18 breaths/min"
      }
    }
  ],
  bookmarks: [],
  scans: [
    {
      id: "scan_p004_1",
      title: "12-Lead Electrocardiogram & Echocardiogram",
      type: "Lab Report",
      date: "2026.03.01",
      description: "Left ventricular ejection fraction 52%; mild concentric LV hypertrophy; zero acute ST elevation.",
      status: "Reviewed"
    }
  ]
};
