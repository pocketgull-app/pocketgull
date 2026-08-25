import { IPatient } from '../services/patient.types';

export const p006: IPatient = {
  id: "p006",
  name: "Homo Sapiens (Male, Paediatric Archetype, 4y)",
  age: 4,
  gender: "Male",
  lastVisit: "2026.03.12",
  preexistingConditions: [
    "Preterm Birth History (32 weeks gestation)",
    "Mild-Intermittent Asthma",
    "Recent Rotavirus Enteritis (Resolving)"
  ],
  patientGoals: "Rehydrate after diarrhoeal episode, reduce airway hyperreactivity, and support pediatric immune health.",
  vitals: {
    bp: "95/60",
    hr: "112",
    temp: "99.1°F",
    spO2: "96%",
    weight: "34 lbs",
    height: "3'4\"",
    vitD3: "34 ng/mL",
    magnesium: "2.0 mg/dL",
    b12: "610 pg/mL",
    zinc: "75 mcg/dL"
  },
  oxidativeStressMarkers: [
    { id: "1", name: "hsCRP", value: "1.8 mg/L" },
    { id: "2", name: "Serum Electrolytes", value: "Na 136 mEq/L, K 4.1 mEq/L" }
  ],
  antioxidantSources: [
    { id: "1", name: "Vitamin C (Pediatric)", value: "1.4 mg/dL" },
    { id: "2", name: "Zinc Bio-Availability", value: "75 mcg/dL" }
  ],
  medications: [
    { id: "1", name: "Albuterol Nebulizer", value: "1.25mg PRN wheeze" },
    { id: "2", name: "Oral Rehydration Solution (ORS)", value: "50mL/kg over 4 hours" }
  ],
  biometricHistory: [
    { timestamp: "2026-03-10T08:00:00Z", type: "hr", value: "120" },
    { timestamp: "2026-03-11T08:00:00Z", type: "hr", value: "115" },
    { timestamp: "2026-03-12T08:00:00Z", type: "hr", value: "112" },
    { timestamp: "2026-03-12T08:00:00Z", type: "bp", value: "95/60" }
  ],
  issues: {
    chest: [
      {
        id: "chest",
        noteId: "note_p006_chest_1",
        name: "Bronchial Hyperreactivity (Post-Viral Cough)",
        painLevel: 3,
        description: "Exhibits post-viral bronchial irritation with mild expiratory wheezing. Responds well to occasional albuterol nebulization.",
        symptoms: [
          { name: "Dry cough", type: "Respiratory", verified: true, timeline: "Acute" },
          { name: "Mild expiratory wheeze", type: "Respiratory", verified: true, timeline: "Acute" }
        ]
      }
    ],
    abdomen: [
      {
        id: "abdomen",
        noteId: "note_p006_abdomen_1",
        name: "Gastroenteritis & Dehydration Recovery",
        painLevel: 4,
        description: "Recovering from multiple episodes of watery diarrhea. Oral intake is improving, but displays slightly dry mucous membranes.",
        symptoms: [
          { name: "Watery diarrhea", type: "Gastrointestinal", verified: true, timeline: "Acute" }
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
        "Summary Overview": "### Clinical Assessment\nPediatric Sentinel is a 4-year-old male recovering from rotavirus gastroenteritis with post-viral airway hyperreactivity. Primary focus is oral rehydration therapy (ORS) and respiratory monitoring.\n\n### Priority List\n- **Fluid Balance**: Electrolyte restoration via WHO ORS.\n- **Airway Support**: PRN albuterol for mild wheezing.\n- **PhysioNet 2026 Telemetry**: Pediatric acoustic respiratory audio & pulse oximetry.\n\n### Goals\n- **Short-term**: Normal skin turgor and moist mucous membranes within 24 hours.\n- **Long-term**: Zero asthma exacerbations requiring ED visit.",
        "Functional Protocols": "### Immediate Actions (Within 24 hours)\n- Continue WHO Oral Rehydration Salts (ORS) solution.\n- Cool-mist humidifier in bedroom during night sleep.",
        "Nutrition": "### Pediatric Recovery Diet\n- BRAT diet transition (Bananas, Rice, Applesauce, Toast).\n- Probiotic (Lactobacillus rhamnosus GG) 5B CFU daily to restore intestinal microbiome.",
        "Monitoring & Follow-up": "### Tracking Schedule\n- Track wet diapers / voiding frequency (target: >= 4/day).\n- Re-evaluate respiratory rate and SpO2 in 48 hours.",
        "Patient Education": "### Parent Guidance\n- Continue small, frequent sips of ORS every 5-10 minutes.\n- Seek urgent care if child becomes lethargic or develops high fever (> 102°F).",
        "Precision Nutrients": "### Pediatric Orthomolecular Matrix\n- **Zinc Sulfate**: 10mg daily x 14 days (reduces diarrhea duration).\n- **Probiotic GG**: 1 cap dissolved in water daily.\n- **Vitamin D3 Drops**: 400 IU daily.",
        "PhysioNet Telemetry": "### PhysioNet 2026 Challenge: Pediatric Autonomic Airway Reactivity & Dehydration Challenge\n- **Heart Rate**: 112 bpm (Appropriate for age 4)\n- **Respiratory Rate**: 24 breaths/min\n- **SpO2**: 96%\n- **Acoustic Cough Count**: 4 coughs / hour"
      }
    }
  ],
  bookmarks: [],
  scans: [
    {
      id: "scan_p006_1",
      title: "Pediatric Chest X-Ray",
      type: "X-Ray",
      date: "2026.03.10",
      description: "Mild peribronchial cuffing; no focal consolidation or pneumothorax.",
      status: "Normal"
    }
  ]
};
