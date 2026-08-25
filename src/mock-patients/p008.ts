import { IPatient } from '../services/patient.types';

export const p008: IPatient = {
  id: "p008",
  name: "Linus P (Orthomolecular Profile)",
  age: 93,
  gender: "Male",
  lastVisit: "2024.12.10",
  genomicVariants: [
    { "rsId": "rs1801131", "gene": "MTHFR", "chromosome": "1", "position": "11796320", "genotype": "A/A (Normal)", "clinicalSignificance": "Optimal folate cycle function", "pathogenicity": "Benign" },
    { "rsId": "rs4343", "gene": "ACE", "chromosome": "17", "position": "63477061", "genotype": "I/D (Heterozygous)", "clinicalSignificance": "Moderate ACE activity, responds well to lifestyle/antioxidants", "pathogenicity": "Benign" }
  ],
  biochemicalPathways: [
    { "id": "path_ascorbate", "name": "Collagen Synthesis & Matrix Stabilization", "status": "Optimal", "activeEnzymes": ["PLOD1", "P4HA1"], "blocks": ["Optimal ascorbate substrate saturation enabling prolyl hydroxylase"] },
    { "id": "path_lpa", "name": "Atherogenic Lipoprotein Binding", "status": "Optimal", "activeEnzymes": ["LPA", "APOB"], "blocks": ["Lysine/Proline supplementation successfully inhibiting Lp(a) adhesion"] }
  ],
  pkInteractions: [
    { "agent": "Ascorbic Acid + L-Lysine", "target": "Lp(a) Lipoprotein Receptors", "affinity": "Competitive Inhibition", "effect": "Prevention of arterial wall plaque deposition", "riskLevel": "Low" }
  ],
  preexistingConditions: [
    "Prostate Cancer (Sustained Remission)",
    "Coronary Artery Disease (Pauling Protocol Managed)",
    "Macular Degeneration"
  ],
  patientGoals: "Evaluate high-dose ascorbic acid therapy, Lp(a) binding neutralization, and cellular longevity.",
  vitals: {
    bp: "125/78",
    hr: "68",
    temp: "98.2°F",
    spO2: "98%",
    weight: "165 lbs",
    height: "5'10\"",
    vitD3: "85 ng/mL (Optimal)",
    magnesium: "2.8 mg/dL (Optimal)",
    b12: "1200 pg/mL (Optimal)",
    zinc: "120 mcg/dL (Optimal)"
  },
  oxidativeStressMarkers: [
    { id: "1", name: "Malondialdehyde (MDA)", value: "0.8 μmol/L (Ultra-Low)" },
    { id: "2", name: "Lp(a) Lipoprotein", value: "14 mg/dL (Controlled)" },
    { id: "3", name: "hsCRP", value: "0.4 mg/L (Minimal)" }
  ],
  antioxidantSources: [
    { id: "1", name: "Plasma Ascorbic Acid (Vit C)", value: "18.5 mg/dL (High-Therapeutic)" },
    { id: "2", name: "Glutathione (GSH)", value: "3.2 μmol/g Hb (Optimal)" },
    { id: "3", name: "CoQ10 (Ubiquinol)", value: "2.8 μg/mL (Optimal)" }
  ],
  medications: [
    { id: "1", name: "Ascorbic Acid (Vitamin C)", value: "12g Daily (Divided Doses)" },
    { id: "2", name: "L-Lysine", value: "6g Daily (Lp(a) Binding Inhibitor)" },
    { id: "3", name: "L-Proline", value: "2g Daily (Atheroma Support)" },
    { id: "4", name: "Alpha-Tocopherol (Vit E)", value: "800 IU Daily" }
  ],
  biometricHistory: [
    { timestamp: "2024-11-01T08:00:00Z", type: "hr", value: "70" },
    { timestamp: "2024-11-20T08:00:00Z", type: "hr", value: "69" },
    { timestamp: "2024-12-10T08:00:00Z", type: "hr", value: "68" },
    { timestamp: "2024-12-10T08:00:00Z", type: "bp", value: "125/78" }
  ],
  issues: {
    chest: [
      {
        id: "chest",
        noteId: "note_p008_chest_1",
        name: "Cardiovascular & Endothelial Integrity",
        painLevel: 1,
        description: "Mild angina on heavy exertion. Controlled via Pauling Lp(a) binding inhibition protocol.",
        symptoms: [
          { name: "Exertional tightness", type: "Cardiovascular", verified: true, timeline: "Chronic" }
        ]
      }
    ],
    pelvis: [
      {
        id: "pelvis",
        noteId: "note_p008_pelvis_1",
        name: "Prostate & Cellular Health",
        painLevel: 2,
        description: "PSA stable at 4.2 ng/mL. High-dose antioxidant status maintaining cellular defense.",
        symptoms: [
          { name: "Prostate hypertrophy", type: "Oncologic", verified: true, timeline: "Chronic" }
        ]
      }
    ]
  },
  history: [
    {
      type: "AnalysisRun",
      date: "2024.12.10",
      summary: "Comprehensive Clinical Analysis",
      report: {
        "Summary Overview": "### Clinical Assessment\nLinus Pauling profile demonstrates optimal orthomolecular saturation. High-dose ascorbic acid (12g/day) combined with L-lysine and L-proline effectively neutralizes Lp(a) arterial binding sites.\n\n### Priority List\n- **Lp(a) Binding Inhibition**: Prevent atherosclerotic plaque adhesion.\n- **Endothelial Matrix Strength**: Collagen synthesis via ascorbate-proline hydroxylase.\n- **PhysioNet 2026 Telemetry**: High-resolution arterial elasticity waveform monitoring.\n\n### Goals\n- **Short-term**: Maintain plasma ascorbate > 15 mg/dL; Lp(a) < 20 mg/dL.\n- **Long-term**: Zero ischemic cardiac events; optimal neuro-visual longevity.",
        "Functional Protocols": "### Immediate Actions (Within 24 hours)\n- Continue divided-dose ascorbic acid protocol with meals.\n- Morning and evening L-lysine + L-proline powder infusion.",
        "Nutrition": "### Orthomolecular High-Density Nutrition\n- High antioxidant plant polyphenol diet (citrus, berries, dark greens).\n- Zero refined sugars to prevent competitive inhibition of GLUT1 ascorbate transport.",
        "Monitoring & Follow-up": "### Tracking Schedule\n- Monthly plasma ascorbate, Lp(a), and serum ferritin panels.\n- Bi-weekly renal stone risk screening (urine oxalate monitoring).\n- PhysioNet continuous arterial compliance telemetry.",
        "Patient Education": "### Patient Guidance\n- Maintain adequate fluid intake (2.5L/day) to support renal clearance during high-dose ascorbate therapy.",
        "Precision Nutrients": "### Orthomolecular Matrix\n- **Ascorbic Acid**: 12,000mg Daily.\n- **L-Lysine**: 6,000mg Daily.\n- **L-Proline**: 2,000mg Daily.\n- **CoQ10 (Ubiquinol)**: 300mg Daily.",
        "PhysioNet Telemetry": "### PhysioNet 2026 Challenge: Orthomolecular High-Dose Ascorbate & Lp(a) Binding Challenge\n- **Heart Rate**: 68 bpm\n- **QRS Interval**: 88 ms\n- **ST Segment**: Neutral (+0.01 mV)\n- **Arterial Stiffness Index**: 6.2 m/s (Optimal youthful elasticity)"
      }
    }
  ],
  bookmarks: [],
  scans: [
    {
      id: "scan_p008_1",
      title: "Coronary Artery Calcium (CAC) Scan",
      type: "CT Scan",
      date: "2024.11.15",
      description: "CAC score stable; calcified plaque display zero progression compared to 2022 baseline.",
      status: "Reviewed"
    }
  ]
};
