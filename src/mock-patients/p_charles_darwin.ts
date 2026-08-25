import { IPatient } from '../services/patient.types';

export const p_charles_darwin: IPatient = {
  id: "p_charles_darwin",
  name: "Charles Darwin",
  age: 73,
  gender: "Male",
  occupation: "Naturalist, Geologist & Evolutionary Biologist",
  lastVisit: "1882.04.19",
  preexistingConditions: [
    "Chronic Gastrointestinal Disease",
    "Cyclic Vomiting Syndrome (suspected)",
    "Systemic eczema & skin rashes",
    "Mitochondrial dysfunction / Chagas disease (suspected)"
  ],
  patientGoals: "Resolve debilitating chronic fatigue, severe episodic vomiting, flatulence, and chest palpitations.",
  vitals: {
    bp: "110/70",
    hr: "68",
    temp: "98.2°F",
    spO2: "96%",
    weight: "148 lbs",
    height: "5'11\"",
    vitD3: "24 ng/mL",
    magnesium: "1.7 mg/dL (Low-normal)",
    b12: "420 pg/mL",
    zinc: "68 mcg/dL"
  },
  oxidativeStressMarkers: [
    { id: "1", name: "Trypanosoma cruzi Antibodies", value: "Positive (Suspected Chagas exposure 1835)" },
    { id: "2", name: "hsCRP", value: "3.8 mg/L (Elevated)" },
    { id: "3", name: "Lactate/Pyruvate Ratio", value: "24 (Mitochondrial Overload)" }
  ],
  antioxidantSources: [
    { id: "1", name: "Glutathione (GSH)", value: "1.2 μmol/g Hb" },
    { id: "2", name: "CoQ10", value: "0.48 μg/mL" }
  ],
  medications: [
    { id: "1", name: "Bismuth Subnitrate", value: "Gastrointestinal soothing" },
    { id: "2", name: "Hydrotherapy (Malvern Water Cure)", value: "Cold compress & spa regimen" }
  ],
  biometricHistory: [
    { timestamp: "1882-04-01T08:00:00Z", type: "hr", value: "72" },
    { timestamp: "1882-04-10T08:00:00Z", type: "hr", value: "70" },
    { timestamp: "1882-04-19T08:00:00Z", type: "hr", value: "68" },
    { timestamp: "1882-04-19T08:00:00Z", type: "bp", value: "110/70" }
  ],
  issues: {
    abdomen: [
      {
        id: "abdomen",
        noteId: "note_darwin_gut_1",
        name: "Chronic Gastrointestinal Syndrome",
        painLevel: 6,
        description: "Debilitating abdominal pain, severe flatulence, acid reflux, and cyclical episodes of vomiting triggered by stress or intellectual exertion.",
        symptoms: [
          { name: "Cyclic vomiting", type: "Gastrointestinal", verified: true, timeline: "Chronic/Episodic" },
          { name: "Severe flatulence & dyspepsia", type: "Gastrointestinal", verified: true, timeline: "Chronic" }
        ]
      }
    ],
    chest: [
      {
        id: "chest",
        noteId: "note_darwin_chest_1",
        name: "Cardiac Palpitations",
        painLevel: 4,
        description: "Recurrent palpitations and chest discomfort, typically co-occurring with episodes of anxiety or intense focus.",
        symptoms: [
          { name: "Palpitations", type: "Cardiovascular", verified: true, timeline: "Intermittent" }
        ]
      }
    ]
  },
  history: [
    {
      type: "AnalysisRun",
      date: "1882.04.19",
      summary: "Comprehensive Clinical Analysis",
      report: {
        "Summary Overview": "### Clinical Assessment\nCharles Darwin presents with chronic debilitating GI distress, cyclic vomiting, and cardiac conduction palpitations. Differential includes Chagas disease (Trypanosoma cruzi acquired in South America during HMS Beagle voyage), histamine intolerance, and mitochondrial dysfunction.\n\n### Priority List\n- **Autonomic & Vagal Alignment**: Regulate enteric nervous system and gastric emptying.\n- **Cardiac Conduction Protection**: Monitor for Chagasic AV block / bundle branch block.\n- **PhysioNet 2026 Telemetry**: Enteric vagal dysmotility & cardiac electrophysiology.\n\n### Goals\n- **Short-term**: Reduce vomiting frequency to 0 episodes per month.\n- **Long-term**: Maintain stable cardiac AV conduction and resolve post-prandial fatigue.",
        "Functional Protocols": "### Immediate Actions (Within 24 hours)\n- Eliminate high-histamine foods (aged cheeses, fermented wines, nightshades).\n- Implement 0.1 Hz vagal resonant breathing before meals to stimulate parasympathetic digestive agni.\n- Short daily walks in Down House gardens.",
        "Nutrition": "### Chrono-Nutrition & Easy-Digest Protocol\n- Low FODMAP, easily digestible warm soups (stewed apple, ginger-carrot puree).\n- Gingerol (500mg) and peppermint oil for gastric motility support.",
        "Monitoring & Follow-up": "### Tracking Schedule\n- Daily symptom diary correlating food intake, mental work, and nausea.\n- Monthly ECG for PR/QRS interval elongation.\n- PhysioNet continuous gastric dysmotility and HRV telemetry.",
        "Patient Education": "### Patient Guidance\n- Take short breaks during writing sessions; avoid intense intellectual stress directly following meals.",
        "Precision Nutrients": "### Orthomolecular Matrix\n- **CoQ10 (Ubiquinol)**: 200mg daily (mitochondrial ATP transport).\n- **Magnesium Glycinate**: 400mg PM.\n- **DAO (Diamine Oxidase)**: 1 cap before meals.",
        "PhysioNet Telemetry": "### PhysioNet 2026 Challenge: Trypanosoma Cardiac Conduction & Vagal Gastric Dysmotility Challenge\n- **Heart Rate**: 68 bpm\n- **PR Interval**: 198 ms (Borderline 1st degree AV block)\n- **QRS Duration**: 94 ms\n- **Gastric Slow-Wave Frequency**: 2.2 cpm (Tachygastria/Bradygastria dysrhythmia)"
      }
    }
  ],
  bookmarks: [],
  scans: [
    {
      id: "scan_darwin_1",
      title: "Electrocardiographic & Gastric Motility Study",
      type: "Lab Report",
      date: "1882.04.10",
      description: "Borderline PR interval prolongations; gastric dysrhythmia during post-prandial recording.",
      status: "Reviewed"
    }
  ]
};
