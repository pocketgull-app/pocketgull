import { IPatient } from '../services/patient.types';

export const p005: IPatient = {
  id: "p005",
  name: "Homo Sapiens (Female, Hypertensive Heart, 78y)",
  age: 78,
  gender: "Female",
  lastVisit: "2026.03.12",
  preexistingConditions: [
    "Hypertensive Heart Disease",
    "Type 2 Diabetes Mellitus (T2DM)",
    "Nephritis / Chronic Kidney Disease (Stage 3b)",
    "Mild Cognitive Impairment (Early Alzheimer's)"
  ],
  patientGoals: "Manage blood pressure, optimize glycemic status, protect renal clearance, and support cognitive function and fall prevention.",
  vitals: {
    bp: "148/92",
    hr: "82",
    temp: "98.4°F",
    spO2: "94%",
    weight: "195 lbs",
    height: "5'9\"",
    vitD3: "20 ng/mL (Deficient)",
    magnesium: "1.6 mg/dL (Low)",
    b12: "380 pg/mL",
    zinc: "65 mcg/dL"
  },
  oxidativeStressMarkers: [
    { id: "1", name: "hsCRP", value: "5.2 mg/L (Elevated)" },
    { id: "2", name: "Serum Creatinine", value: "1.8 mg/dL" },
    { id: "3", name: "eGFR", value: "44 mL/min/1.73m² (Stage 3b CKD)" }
  ],
  antioxidantSources: [
    { id: "1", name: "Glutathione (GSH)", value: "1.1 μmol/g Hb" },
    { id: "2", name: "CoQ10", value: "0.45 μg/mL" }
  ],
  medications: [
    { id: "1", name: "Valsartan", value: "160mg Daily" },
    { id: "2", name: "Amlodipine", value: "5mg Daily" },
    { id: "3", name: "Linagliptin", value: "5mg Daily" },
    { id: "4", name: "Donepezil", value: "5mg PM" }
  ],
  biometricHistory: [
    { timestamp: "2026-03-01T08:00:00Z", type: "hr", value: "85" },
    { timestamp: "2026-03-05T08:00:00Z", type: "hr", value: "84" },
    { timestamp: "2026-03-12T08:00:00Z", type: "hr", value: "82" },
    { timestamp: "2026-03-12T08:00:00Z", type: "bp", value: "148/92" }
  ],
  issues: {
    chest: [
      {
        id: "chest",
        noteId: "note_p005_chest_1",
        name: "Cardiovascular Stress (Hypertensive Heart Disease)",
        painLevel: 3,
        description: "Essential hypertension with signs of left ventricular strain. Reports occasional heart palpitations and mild breathlessness when walking.",
        symptoms: [
          { name: "Mild exertional breathlessness", type: "Respiratory", verified: true, timeline: "Chronic" },
          { name: "Intermittent palpitations", type: "Cardiovascular", verified: true, timeline: "Chronic" }
        ]
      }
    ],
    abdomen: [
      {
        id: "abdomen",
        noteId: "note_p005_abdomen_1",
        name: "Metabolic-Renal Insufficiency",
        painLevel: 2,
        description: "Comorbid T2DM and nephritis (Stage 3b CKD, eGFR 44). Experiencing mild bilateral lower limb swelling due to fluid retention.",
        symptoms: [
          { name: "Mild lower extremity swelling", type: "Renal", verified: true, timeline: "Chronic" }
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
        "Summary Overview": "### Clinical Assessment\nCDC Sentinel is a 78-year-old female with Stage 3b CKD, hypertensive heart disease, and mild cognitive impairment. Primary clinical focus is blood pressure stabilization below 130/80 without causing renal hypoperfusion.\n\n### Priority List\n- **Blood Pressure & ARB Optimization**: Valsartan dose titration under renal function monitoring.\n- **Fluid Balance & Edema Control**: Monitor lower limb swelling and sodium intake.\n- **PhysioNet 2026 Telemetry**: Cardiorenal fluid retentive hemodynamic modeling.\n\n### Goals\n- **Short-term**: Reduce BP to < 135/85; maintain eGFR stable at >= 44 mL/min.\n- **Long-term**: Prevent progression to Stage 4 CKD; support cognitive retention.",
        "Functional Protocols": "### Immediate Actions (Within 72 hours)\n- Implement strict low-sodium dietary regimen (< 1500mg/day).\n- Daily morning ankle circumference and weight measurement log.\n- Cognition support via 0.1 Hz vagal audio-visual stimulation.",
        "Nutrition": "### Renal-Protective Nutrition Protocol\n- Moderate protein restriction (0.8g/kg/day) to lower nitrogenous waste.\n- High antioxidant polyphenol intake (wild blueberries, green tea catechins).\n- Active Vitamin D (Calcitriol) consultation.",
        "Monitoring & Follow-up": "### Tracking Schedule\n- Bi-weekly serum potassium and BUN/creatinine panels.\n- Daily home blood pressure log (AM & PM).\n- PhysioNet continuous fluid retention & bio-impedance telemetry.",
        "Patient Education": "### Patient Guidance\n- Avoid all OTC NSAIDs (ibuprofen, naproxen) as they worsen kidney function.\n- Elevate legs for 20 minutes in afternoon to reduce lower leg swelling.",
        "Precision Nutrients": "### Orthomolecular Matrix\n- **Methylated Folate (L-5-MTHF)**: 1000mcg daily (supports homocysteine clearance).\n- **CoQ10**: 150mg daily (mitochondrial renal endothelial support).\n- **Magnesium Glycinate**: 200mg nightly.",
        "PhysioNet Telemetry": "### PhysioNet 2026 Challenge: Cardiorenal Fluid Retentive Hemodynamic Challenge\n- **QRS Interval Duration**: 98 ms\n- **ST Segment**: Neutral (+0.02 mV)\n- **Pulse Wave Velocity (PWV)**: 11.2 m/s (Elevated arterial stiffness)\n- **Bio-Impedance Fluid Index**: +1.8 L surplus"
      }
    }
  ],
  bookmarks: [],
  scans: [
    {
      id: "scan_p005_1",
      title: "Renal Ultrasound & Echocardiogram",
      type: "Ultrasound",
      date: "2026.02.20",
      description: "Bilateral kidneys display increased cortical echogenicity consistent with chronic parenchymal disease. Concentric LV hypertrophy.",
      status: "Reviewed"
    }
  ]
};
