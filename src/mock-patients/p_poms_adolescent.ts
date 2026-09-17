import { IPatient } from '../services/patient.types';

export const p_poms_adolescent: IPatient = {
  "id": "p_poms_adolescent",
  "name": "Homo Sapiens (Female, Pediatric-Onset MS / POMS, 15y)",
  "age": 15,
  "gender": "Female",
  "lastVisit": "2026.07.12",
  "genomicVariants": [
    { "rsId": "rs3135388", "gene": "HLA-DRB1", "chromosome": "6", "position": "32552134", "genotype": "C/T (Heterozygous)", "clinicalSignificance": "Associated with Pediatric-Onset Multiple Sclerosis susceptibility", "pathogenicity": "Likely Pathogenic" },
    { "rsId": "rs2104286", "gene": "IL2RA", "chromosome": "10", "position": "6093954", "genotype": "A/G (Heterozygous)", "clinicalSignificance": "Interleukin-2 receptor alpha chain variant modulating regulatory T-cell function", "pathogenicity": "VUS" }
  ],
  "biochemicalPathways": [
    { "id": "path_myelin_ped", "name": "Myelin Maintenance & Neuroplastic Remyelination", "status": "Sub-optimal", "activeEnzymes": ["MBP", "MOG"], "blocks": ["High-frequency autoimmune demyelinating flares countered by active pediatric oligodendrocyte precursor cell (OPC) recruitment"] },
    { "id": "path_immuno_ped", "name": "Thymic T-Cell Selection & Tolerance", "status": "Sub-optimal", "activeEnzymes": ["CD4", "CD8", "FOXP3"], "blocks": ["Altered peripheral regulatory T-cell suppression leading to elevated annualized relapse rate"] }
  ],
  "pkInteractions": [
    { "agent": "Fingolimod (Gilenya)", "target": "S1P1 / S1P5 Receptors", "affinity": "Kd = 0.3 nM", "effect": "Sequestration of naive and central memory lymphocytes in lymph nodes", "riskLevel": "Low" },
    { "agent": "Vitamin D3 + Fingolimod", "target": "Immune Tolerance / S1P Pathway", "affinity": "Synergistic", "effect": "Augmented reduction in annualized relapse rate and T2 lesion accrual", "riskLevel": "Low" }
  ],
  "ewarsAlerts": [
    { "id": "ewars_ped_01", "pathogen": "Varicella Zoster Virus (VZV)", "viralCopyCount": "Seropositive (VZV IgG Antibody Confirmed)", "surgeStatus": "Baseline", "whoBulletin": "WHO-VZV-PED-2026", "riskToPatient": "Low" }
  ],
  "environmentalIndex": {
    "aqi": 45,
    "pm25": "11.2 µg/m³",
    "ozone": "32 ppb",
    "pollenDensity": "Moderate",
    "heatIndex": "82°F",
    "vulnerabilityWarning": "Pediatric school gym heat exposure triggers transient Uhthoff vision blurriness and cognitive fatigue."
  },
  "preexistingConditions": [
    "Pediatric-Onset Multiple Sclerosis (POMS)",
    "History of Bilateral Optic Neuritis (2024)",
    "High Relapse Velocity (3 Flares in Past 18 Months)",
    "Cognitive School Fatigue & Processing Speed Fluctuations",
    "Suboptimal Vitamin D Level (24 ng/mL)"
  ],
  "patientGoals": "Achieve complete relapse freedom, stabilize school processing speed and academic stamina, prevent pediatric brain atrophy, and optimize high-energy sports participation with heat mitigation.",
  "vitals": {
    "bp": "104/66",
    "hr": "72",
    "temp": "98.2°F",
    "spO2": "99%",
    "weight": "118 lbs",
    "height": "5'4\"",
    "vitD3": "24 ng/mL (Suboptimal)",
    "magnesium": "2.1 mg/dL (Normal)",
    "b12": "480 pg/mL (Normal)",
    "zinc": "82 mcg/dL (Normal)"
  },
  "oxidativeStressMarkers": [
    { "id": "1", "name": "hsCRP", "value": "1.8 mg/L (Mild)" },
    { "id": "2", "name": "Homocysteine", "value": "7.2 μmol/L (Optimal)" },
    { "id": "3", "name": "Neurofilament Light Chain (sNfL)", "value": "22.4 pg/mL (Significantly Elevated)" }
  ],
  "antioxidantSources": [
    { "id": "1", "name": "Glutathione (GSH)", "value": "1.8 μmol/g Hb (Normal)" },
    { "id": "2", "name": "CoQ10", "value": "0.72 μg/mL (Borderline)" }
  ],
  "medications": [
    { "id": "1", "name": "Fingolimod (Gilenya)", "value": "0.5mg PO QD (Pediatric FDA Indication)" },
    { "id": "2", "name": "Vitamin D3 + K2", "value": "4,000 IU Daily" },
    { "id": "3", "name": "Omega-3 EPA/DHA", "value": "1,500mg Daily" }
  ],
  "biometricHistory": [
    { "timestamp": "2026-02-10T08:00:00Z", "type": "hr", "value": "74" },
    { "timestamp": "2026-04-15T08:00:00Z", "type": "hr", "value": "72" },
    { "timestamp": "2026-07-12T08:00:00Z", "type": "hr", "value": "72" },
    { "timestamp": "2026-02-10T08:00:00Z", "type": "bp", "value": "106/68" },
    { "timestamp": "2026-04-15T08:00:00Z", "type": "bp", "value": "102/64" },
    { "timestamp": "2026-07-12T08:00:00Z", "type": "bp", "value": "104/66" }
  ],
  "issues": {
    "head": [
      {
        "id": "head",
        "noteId": "note_poms_head_1",
        "name": "Head & Brainstem Demyelinating Plaque",
        "painLevel": 2,
        "description": "Pediatric-onset demyelinating disease with high inflammatory relapse rate. Past left optic neuritis with complete visual recovery. Post-concussive-like cognitive fatigue during prolonged exams. Normal baseline brain volume, but high T2 lesion count requiring strict S1P receptor suppression.",
        "symptoms": [
          { "name": "Pediatric cognitive fatigue", "type": "Neurological", "verified": true, "timeline": "Intermittent" },
          { "name": "Transient Uhthoff visual blur", "type": "Ophthalmological", "verified": true, "timeline": "Exertional" }
        ]
      }
    ]
  },
  "history": [
    {
      "type": "AnalysisRun",
      "date": "2026.07.12",
      "summary": "Pediatric MS Care Trajectory Review (NMSS POMS Guidance)",
      "report": {
        "Summary Overview": "### Pediatric-Onset Multiple Sclerosis (POMS) Assessment\n15-year-old female with aggressive relapsing-remitting course (3 relapses in 18 months). Currently stable on Fingolimod 0.5mg QD with excellent adherence. Highly neuroplastic CNS allowing near-complete recovery from clinical relapses, but sNfL remains elevated at 22.4 pg/mL, demonstrating subclinical axonal shearing that threatens long-term cognitive and cerebral reserve.",
        "Functional Protocols": "### Pediatric Care Trajectory Protocol\n- **Thermoregulation**: Rapid-cooling neck wraps during high school athletics and gym classes to prevent Uhthoff's conduction block.\n- **Cognitive Accommodations**: 504 Plan with 1.5x extended test time to compensate for processing speed fluctuations without penalizing intellectual capability.\n- **Neuroplastic Conditioning**: Aerobic interval training (cool room < 68°F) 3x/week.",
        "Nutrition": "### Pediatric Neuro-Immunology Nutrition\n- **Target 25(OH)D**: Titrate to 50-70 ng/mL via 4,000 IU Vitamin D3 daily.\n- **Gut Microbiome**: Polyphenol-rich colorful fruits, kefir, and plant fibers to promote SCFA butyrate-producing anti-inflammatory microbiota.\n- **Hydration**: 2.5L daily with balanced electrolytes.",
        "Monitoring & Follow-up": "### Pediatric MS Surveillance\n- Repeat sNfL and complete blood count (absolute lymphocyte count ALC > 200/μL) q3m.\n- Annual 3T brain MRI with volumetric thalamic and cortical volume tracking.\n- Symbol Digit Modalities Test (SDMT) screening q6m to safeguard educational trajectory."
      }
    }
  ],
  "bookmarks": [],
  "scans": []
};
