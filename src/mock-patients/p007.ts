import { IPatient } from '../services/patient.types';

export const p007: IPatient = {
  id: "p007",
  name: "Homo Sapiens (Female, Maternal Archetype, 28y)",
  age: 28,
  gender: "Female",
  lastVisit: "2026.03.12",
  preexistingConditions: [
    "Gestational Hypertension",
    "Primigravida (32 Weeks Gestation)",
    "Iron-Deficiency Anemia of Pregnancy"
  ],
  patientGoals: "Optimize blood pressure, correct anemia, track fetal movements, and establish a postpartum hemorrhage prevention plan.",
  vitals: {
    bp: "135/85",
    hr: "90",
    temp: "98.8°F",
    spO2: "98%",
    weight: "165 lbs",
    height: "5'6\"",
    vitD3: "28 ng/mL",
    magnesium: "1.8 mg/dL",
    b12: "450 pg/mL",
    zinc: "70 mcg/dL"
  },
  oxidativeStressMarkers: [
    { id: "1", name: "Hemoglobin", value: "9.8 g/dL (Low)" },
    { id: "2", name: "Serum Ferritin", value: "12 ng/mL (Deficient)" },
    { id: "3", name: "Urine Protein/Creatinine Ratio", value: "0.18 (Normal, < 0.3)" }
  ],
  antioxidantSources: [
    { id: "1", name: "Vitamin C", value: "1.3 mg/dL" },
    { id: "2", name: "Elemental Iron Bio-Availability", value: "65mg elemental" }
  ],
  medications: [
    { id: "1", name: "Ferrous Bisglycinate", value: "65mg elemental Iron BID with Vitamin C" },
    { id: "2", name: "Prenatal Multivitamin", value: "1 tablet Daily" },
    { id: "3", name: "Labetalol", value: "100mg BID PRN BP > 140/90" }
  ],
  biometricHistory: [
    { timestamp: "2026-03-01T08:00:00Z", type: "hr", value: "94" },
    { timestamp: "2026-03-06T08:00:00Z", type: "hr", value: "92" },
    { timestamp: "2026-03-12T08:00:00Z", type: "hr", value: "90" },
    { timestamp: "2026-03-12T08:00:00Z", type: "bp", value: "135/85" }
  ],
  issues: {
    pelvis: [
      {
        id: "pelvis",
        noteId: "note_p007_pelvis_1",
        name: "Uterine & Gestational Status (32 Weeks)",
        painLevel: 5,
        description: "Third-trimester pregnancy with borderline gestational hypertension (BP 135/85). Undergoing regular fetal kick count tracking and growth scans. Experiencing intermittent Braxton Hicks contractions.",
        symptoms: [
          { name: "Borderline gestational hypertension", type: "Obstetric/Cardiovascular", verified: true, timeline: "Chronic" },
          { name: "Intermittent Braxton Hicks contractions", type: "Obstetric", verified: true, timeline: "Intermittent" }
        ]
      }
    ],
    full_body: [
      {
        id: "full_body",
        noteId: "note_p007_full_1",
        name: "Iron-Deficiency Anemia & Fatigue",
        painLevel: 4,
        description: "Presents with moderate microcytic anemia (Hemoglobin 9.8 g/dL). Reports systemic fatigue, cold sensitivity, and mild orthostatic lightheadedness when standing up quickly.",
        symptoms: [
          { name: "Maternal fatigue", type: "Hematologic", verified: true, timeline: "Chronic" }
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
        "Summary Overview": "### Clinical Assessment\nMaternal Sentinel is a 28-year-old primigravida at 32 weeks gestation with gestational hypertension and iron deficiency anemia. Primary clinical focus is pre-eclampsia surveillance and optimization of maternal-fetal oxygen transport.\n\n### Priority List\n- **Pre-eclampsia Surveillance**: Daily BP and urine protein screening.\n- **Hematologic Restoration**: High bioavailability iron bisglycinate.\n- **PhysioNet 2026 Telemetry**: Uterine artery Doppler flow and fetal HR variability.\n\n### Goals\n- **Short-term**: Hemoglobin > 11.0 g/dL by week 36; BP < 135/85.\n- **Long-term**: Full-term delivery (>= 39 weeks) without pre-eclampsia escalation.",
        "Functional Protocols": "### Immediate Actions (Within 48 hours)\n- Daily fetal kick count tracking (target: >= 10 movements in 2 hours).\n- Left lateral recumbent rest position to optimize placental perfusion.",
        "Nutrition": "### Gestational Nutrition Protocol\n- Iron-rich foods (grass-fed beef, lentils, spinach) paired with citrus Vitamin C.\n- Hydration > 3L filtered water daily to maintain amniotic volume.",
        "Monitoring & Follow-up": "### Tracking Schedule\n- Bi-weekly non-stress tests (NST) and fetal growth biophysical profiles.\n- Weekly uACR and platelet counts.\n- PhysioNet continuous maternal ECG & uterine tone telemetry.",
        "Patient Education": "### Patient Guidance\n- Immediately contact labor triage if experiencing severe headaches, visual scotomas, or upper right abdominal pain.",
        "Precision Nutrients": "### Orthomolecular Matrix\n- **Ferrous Bisglycinate**: 65mg with 500mg Vitamin C.\n- **Choline**: 450mg daily (fetal neurodevelopment).\n- **DHA**: 300mg daily (fetal brain lipid accretion).",
        "PhysioNet Telemetry": "### PhysioNet 2026 Challenge: Maternal-Fetal Hemodynamic & Uterine Artery Doppler Challenge\n- **Maternal HR**: 90 bpm\n- **Fetal Heart Rate Baseline**: 142 bpm (Normal reactive)\n- **Uterine Artery Pulsatility Index (PI)**: 0.95 (Normal resistance)\n- **Accelerations**: 2 in 20 minutes (Category I Tracing)"
      }
    }
  ],
  bookmarks: [],
  scans: [
    {
      id: "scan_p007_1",
      title: "Obstetric Ultrasound & Doppler Biometry",
      type: "Ultrasound",
      date: "2026.03.05",
      description: "Estimated fetal weight 4th percentile for 32 weeks (1850g). Amniotic fluid index 14 cm (Normal).",
      status: "Reviewed"
    }
  ]
};
