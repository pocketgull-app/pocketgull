import { IPatient } from '../services/patient.types';

export const p_loms_elder: IPatient = {
  "id": "p_loms_elder",
  "name": "Homo Sapiens (Male, Late-Onset Primary Progressive MS, 58y)",
  "age": 58,
  "gender": "Male",
  "lastVisit": "2026.06.18",
  "genomicVariants": [
    { "rsId": "rs3135388", "gene": "HLA-DRB1", "chromosome": "6", "position": "32552134", "genotype": "C/C (Wildtype)", "clinicalSignificance": "Absence of classic HLA-DRB1*15:01 risk allele, typical of sporadic late-onset progressive phenotype", "pathogenicity": "Benign" },
    { "rsId": "rs10774625", "gene": "OAS1", "chromosome": "12", "position": "113357193", "genotype": "A/A", "clinicalSignificance": "Innate antiviral oligoadenylate synthetase variant influencing microglial priming and immunosenescence", "pathogenicity": "VUS" }
  ],
  "biochemicalPathways": [
    { "id": "path_microglia_loms", "name": "Microglial Compartmentalization & Smoldering Inflammation", "status": "Sub-optimal", "activeEnzymes": ["TREM2", "APOE"], "blocks": ["Trapped intrathecal microglial activation driving diffuse cervical spinal cord axonopathy without peripheral lymphocytic breakdown"] },
    { "id": "path_senescence", "name": "Adaptive Immunosenescence & Thymic Involution", "status": "Sub-optimal", "activeEnzymes": ["CD28", "IL-7R"], "blocks": ["Depleted naive T-cell repertoire, rendering classic peripheral anti-inflammatory DMTs less efficacious and increasing opportunistic infection liability"] }
  ],
  "pkInteractions": [
    { "agent": "Ocrelizumab (Ocrevus)", "target": "CD20 B-Cells", "affinity": "Kd = 1.6 nM", "effect": "Modest slowing of confirmed disability progression (ORATORIO trial); annual IgG hypogammaglobulinemia surveillance required", "riskLevel": "Moderate" },
    { "agent": "Baclofen + Tizanidine", "target": "Spinal Motor Interneurons", "affinity": "Additive", "effect": "Effective reduction of lower extremity extensor spasticity; monitor for muscle weakness compromising ambulation", "riskLevel": "Moderate" }
  ],
  "ewarsAlerts": [
    { "id": "ewars_loms_01", "pathogen": "JC Virus (JCV Seropositivity)", "viralCopyCount": "Index 0.22 (Low Antibody Index)", "surgeStatus": "Monitoring", "whoBulletin": "WHO-PML-SURV-2026", "riskToPatient": "Low" }
  ],
  "environmentalIndex": {
    "aqi": 52,
    "pm25": "14.8 µg/m³",
    "ozone": "40 ppb",
    "pollenDensity": "Low",
    "heatIndex": "78°F",
    "vulnerabilityWarning": "Elderly thermal dysregulation with combined spinal cord autonomic sympathetic impairment."
  },
  "preexistingConditions": [
    "Late-Onset Primary Progressive Multiple Sclerosis (LOMS / PPMS)",
    "Progressive Spastic Paraparesis & Right Foot Drop (4-Year Insidious Course)",
    "Neurogenic Bladder (Detrusor Sphincter Dyssynergia)",
    "Mild Cervical Spondylosis (Surgically Ruled Out as Primary Cause of Myelopathy)",
    "Borderline Osteopenia (DEXA T-score -1.8 Femoral Neck)"
  ],
  "patientGoals": "Stabilize ambulation and prevent progression to wheelchair dependence, optimize spasticity management without excessive limb weakness, preserve manual dexterity, and manage bladder urgency.",
  "vitals": {
    "bp": "126/78",
    "hr": "68",
    "temp": "97.9°F",
    "spO2": "97%",
    "weight": "172 lbs",
    "height": "5'10\"",
    "vitD3": "38 ng/mL (Borderline)",
    "magnesium": "1.9 mg/dL (Normal)",
    "b12": "420 pg/mL (Normal)",
    "zinc": "74 mcg/dL (Normal)"
  },
  "oxidativeStressMarkers": [
    { "id": "1", "name": "hsCRP", "value": "2.4 mg/L (Mild)" },
    { "id": "2", "name": "Homocysteine", "value": "10.4 μmol/L (Normal)" },
    { "id": "3", "name": "Neurofilament Light Chain (sNfL)", "value": "12.8 pg/mL (Moderately Elevated for Age)" },
    { "id": "4", "name": "Serum GFAP (Glial Fibrillary Acidic Protein)", "value": "185 pg/mL (Elevated - Active Astrogliosis)" }
  ],
  "antioxidantSources": [
    { "id": "1", "name": "Glutathione (GSH)", "value": "1.4 μmol/g Hb (Low-normal)" },
    { "id": "2", "name": "CoQ10", "value": "0.55 μg/mL (Borderline)" }
  ],
  "medications": [
    { "id": "1", "name": "Ocrelizumab (Ocrevus)", "value": "600mg IV q6mo (PPMS Indication)" },
    { "id": "2", "name": "Baclofen", "value": "15mg TID (Spastic Paraparesis)" },
    { "id": "3", "name": "Mirabegron (Myrbetriq)", "value": "50mg Daily (Neurogenic Bladder)" },
    { "id": "4", "name": "Vitamin D3 + K2", "value": "5,000 IU Daily" }
  ],
  "biometricHistory": [
    { "timestamp": "2026-01-10T08:00:00Z", "type": "hr", "value": "70" },
    { "timestamp": "2026-03-20T08:00:00Z", "type": "hr", "value": "68" },
    { "timestamp": "2026-06-18T08:00:00Z", "type": "hr", "value": "68" },
    { "timestamp": "2026-01-10T08:00:00Z", "type": "bp", "value": "128/80" },
    { "timestamp": "2026-03-20T08:00:00Z", "type": "bp", "value": "124/76" },
    { "timestamp": "2026-06-18T08:00:00Z", "type": "bp", "value": "126/78" }
  ],
  "issues": {
    "lower_back": [
      {
        "id": "lower_back",
        "noteId": "note_loms_spine_1",
        "name": "Cervical & Thoracic Spinal Cord Atrophy",
        "painLevel": 3,
        "description": "Insidious progression of spastic paraparesis over 4 years without acute relapses. Asymmetric right foot drop requiring custom carbon fiber Ankle-Foot Orthosis (AFO). Bilateral Babinski sign positive, hyperreflexia with sustained ankle clonus. MRI shows diffuse cervical cord atrophy with non-enhancing diffuse T2 hyperintensities, without brain gadolinium lesions.",
        "symptoms": [
          { "name": "Progressive spastic paraparesis", "type": "Neurological/Motor", "verified": true, "timeline": "Progressive" },
          { "name": "Right foot drop", "type": "Neurological/Motor", "verified": true, "timeline": "Progressive" },
          { "name": "Neurogenic urgency", "type": "Autonomic", "verified": true, "timeline": "Chronic" }
        ]
      }
    ]
  },
  "history": [
    {
      "type": "AnalysisRun",
      "date": "2026.06.18",
      "summary": "Late-Onset Primary Progressive MS Comprehensive Review",
      "report": {
        "Summary Overview": "### Late-Onset Primary Progressive MS (LOMS / PPMS) Assessment\n58-year-old male with 4-year progressive spinal cord syndrome (spastic paraparesis, right foot drop). Timed 25-Foot Walk (T25FW) is 8.4 seconds with bilateral canes/AFO. Elevated serum GFAP (185 pg/mL) indicates active chronic compartmentalized astrogliosis despite normal contrast brain MRI. Differential diagnoses of cervical spondylotic myelopathy and normal pressure hydrocephalus have been rigorously ruled out.",
        "Functional Protocols": "### Progressive Mobility & Fall Prevention Protocol\n- **Orthotic Optimization**: Carbon fiber ground-reaction AFO for right foot clearance.\n- **Spasticity Balance**: Calibrate Baclofen to avoid reducing necessary extensor muscle tone for standing.\n- **Functional Electrical Stimulation (FES)**: Trial of WalkAide/Bioness for peroneal nerve stimulation.",
        "Nutrition": "### Neuro-Degenerative Anabolic & Bone Health Support\n- **Bone Mineral Density**: 5,000 IU Vitamin D3 + 200mcg K2 + Calcium 600mg to prevent osteoporotic fracture.\n- **Mitochondrial Rescue**: CoQ10 200mg BID and R-Alpha Lipoic Acid 600mg QD.\n- **Anti-Inflammatory Protein**: 1.2g/kg lean protein daily to preserve quadriceps muscle mass against disuse sarcopenia.",
        "Monitoring & Follow-up": "### LOMS Monitoring & Immunosenescence Evaluation\n- Quantitative Timed 25-Foot Walk (T25FW) and 9-Hole Peg Test (9HPT) every 3 months.\n- Annual quantitative cervical cord cross-sectional area (C2-C3 area on high-res MRI).\n- Serum IgG/IgM levels before each Ocrevus infusion to detect hypogammaglobulinemia.\n- DISCOMS trial criteria review: Assess risk-benefit ratio of continuous B-cell depletion vs infection risk as age reaches 60."
      }
    }
  ],
  "bookmarks": [],
  "scans": []
};
