import { IPatient } from '../services/patient.types';

export const p_mara_santos: IPatient = {
  "id": "p_mara_santos",
  "name": "Homo Sapiens (Female, Neurological & Methylation, 34y)",
  "age": 34,
  "gender": "Female",
  "lastVisit": "2026.06.20",
  "genomicVariants": [
    { "rsId": "rs1801133", "gene": "MTHFR", "chromosome": "1", "position": "11796321", "genotype": "T/T (Homozygous)", "clinicalSignificance": "Reduced folate conversion capacity by ~70%", "pathogenicity": "Pathogenic" },
    { "rsId": "rs3135388", "gene": "HLA-DRB1", "chromosome": "6", "position": "32552134", "genotype": "C/T (Heterozygous)", "clinicalSignificance": "Associated with Relapsing-Remitting Multiple Sclerosis susceptibility", "pathogenicity": "Likely Pathogenic" },
    { "rsId": "rs3892760", "gene": "CYP2D6", "chromosome": "22", "position": "42127891", "genotype": "G/A (Intermediate)", "clinicalSignificance": "Altered metabolizer status for beta-blockers, pain medications, and SSRIs", "pathogenicity": "VUS" }
  ],
  "biochemicalPathways": [
    { "id": "path_meth", "name": "Folate / Methylation Cycle", "status": "Sub-optimal", "activeEnzymes": ["MTHFR", "MTR", "MTRR"], "blocks": ["Deficiency in L-methylfolate synthesis driving homocysteine to 14.1 μmol/L"] },
    { "id": "path_mito", "name": "Mitochondrial Electron Transport Chain", "status": "Sub-optimal", "activeEnzymes": ["Complex I", "Complex III", "CoQ10"], "blocks": ["Depleted CoQ10 (0.38 μg/mL) limiting oxidative phosphorylation"] },
    { "id": "path_myelin", "name": "Myelin Sheath Repair & Maintenance", "status": "Blocked", "activeEnzymes": ["MBP", "PLP1"], "blocks": ["Active auto-antigen presentation and immune-mediated demyelination"] }
  ],
  "pkInteractions": [
    { "agent": "Ocrevus (Ocrelizumab)", "target": "CD20 B-Cells", "affinity": "Kd = 1.6 nM", "effect": "Depletion of CD20+ B lymphocytes", "riskLevel": "Low" },
    { "agent": "Modafinil + CoQ10", "target": "Mitochondrial Energy Pathway", "affinity": "Synergy", "effect": "Synergistic enhancement of ATP production and alertness", "riskLevel": "Low" },
    { "agent": "Baclofen + Valerian Root", "target": "GABA-B Receptor", "affinity": "Additive", "effect": "Enhanced CNS depression and somnolence", "riskLevel": "Moderate" }
  ],
  "ewarsAlerts": [
    { "id": "ewars_01", "pathogen": "SARS-CoV-2 (KP.3.1.1 Subvariant)", "viralCopyCount": "4.8x10^5 copies/mL (CDC NWSS)", "surgeStatus": "Active Surge", "whoBulletin": "WHO-DON-2026-EU-04", "riskToPatient": "High" },
    { "id": "ewars_02", "pathogen": "Influenza A (H5N1 Clade 2.3.4.4b)", "viralCopyCount": "1.2x10^3 copies/mL (Monitoring)", "surgeStatus": "Monitoring", "whoBulletin": "WHO-DON-2026-GLOBAL-12", "riskToPatient": "Moderate" }
  ],
  "travelProfile": {
    "destination": "Geneva, Switzerland (WHO Global Health Forum)",
    "departureDate": "2026.08.15",
    "cdcNoticeLevel": "Level 1 - Watch",
    "requiredVaccines": ["Tick-Borne Encephalitis (TBE)", "Seasonal Influenza 2026/2027"],
    "vectorRisks": ["Ixodes ricinus tick-borne encephalitis in sub-alpine woodland trails"],
    "prophylacticProtocol": ["Permethrin 0.5% clothing treatment", "DEET 30% dermal application"]
  },
  "awareStewardship": [
    { "medication": "Amoxicillin / Clavulanate", "category": "Access", "resistanceRisk": "Low", "stewardshipNote": "First-line respiratory coverage if secondary bacterial infection occurs" },
    { "medication": "Ciprofloxacin", "category": "Watch", "resistanceRisk": "High", "stewardshipNote": "Reserve for acute complicated pyelonephritis or severe UTI only" }
  ],
  "environmentalIndex": {
    "aqi": 72,
    "pm25": "22.4 µg/m³",
    "ozone": "48 ppb",
    "pollenDensity": "High",
    "heatIndex": "84°F",
    "vulnerabilityWarning": "Moderate PM2.5 and High Birch Pollen may exacerbate MS autonomic fatigue and neuro-inflammatory flare risk."
  },
  "preexistingConditions": [
    "Relapsing-Remitting Multiple Sclerosis (RRMS)",
    "History of Optic Neuritis (Left Eye, 2024)",
    "Chronic Fatigue",
    "Mild Depression (reactive)",
    "Vitamin D Deficiency"
  ],
  "patientGoals": "Extend relapse-free interval, manage fatigue without additional sedating medications, preserve cognitive function, and explore integrative approaches alongside DMT.",
  "tcmIntake": {
    "tongueColor": "pale",
    "tongueCoating": "peeled",
    "pulseQuality": "deep-thready",
    "thermalPreference": "aversion-cold",
    "sweatPattern": "night-sweats",
    "tasteInMouth": "normal",
    "tcmPattern": "Liver & Kidney Yin Deficiency with Internal Wind & Jing Depletion"
  },
  "ayurvedicIntake": {
    "prakritiVata": 7,
    "prakritiPitta": 5,
    "prakritiKapha": 2,
    "vikritiVata": 9,
    "vikritiPitta": 6,
    "vikritiKapha": 2,
    "agniType": "vishamagni",
    "amaScore": 6.8,
    "nadiPulseType": "snake-vata",
    "ayurvedicImbalance": "Severe Vata Resurgence in Majja Dhatu (Nerve Sheath)"
  },
  "vitals": {
    "bp": "108/68",
    "hr": "76",
    "temp": "98.1°F",
    "spO2": "97%",
    "weight": "138 lbs",
    "height": "5'6\"",
    "vitD3": "18 ng/mL (Deficient)",
    "magnesium": "1.6 mg/dL (Low)",
    "b12": "310 pg/mL (Low-normal)",
    "zinc": "68 mcg/dL (Low-normal)"
  },
  "oxidativeStressMarkers": [
    {
      "id": "1",
      "name": "hsCRP",
      "value": "3.2 mg/L (Elevated)"
    },
    {
      "id": "2",
      "name": "Homocysteine",
      "value": "14.1 μmol/L (Elevated)"
    },
    {
      "id": "3",
      "name": "Neurofilament Light Chain (NfL)",
      "value": "18.2 pg/mL (Elevated)"
    }
  ],
  "antioxidantSources": [
    {
      "id": "1",
      "name": "Glutathione (GSH)",
      "value": "1.1 μmol/g Hb (Low)"
    },
    {
      "id": "2",
      "name": "CoQ10",
      "value": "0.38 μg/mL (Low)"
    },
    {
      "id": "3",
      "name": "Alpha-Lipoic Acid",
      "value": "Not tested"
    }
  ],
  "medications": [
    {
      "id": "1",
      "name": "Ocrevus (Ocrelizumab)",
      "value": "600mg IV q6mo"
    },
    {
      "id": "2",
      "name": "Baclofen",
      "value": "10mg TID (spasticity)"
    },
    {
      "id": "3",
      "name": "Modafinil",
      "value": "100mg AM (fatigue)"
    },
    {
      "id": "4",
      "name": "Escitalopram",
      "value": "10mg Daily"
    }
  ],
  "biometricHistory": [
    {
      "timestamp": "2025-12-01T08:00:00Z",
      "type": "hr",
      "value": "82"
    },
    {
      "timestamp": "2026-01-15T08:00:00Z",
      "type": "hr",
      "value": "80"
    },
    {
      "timestamp": "2026-03-10T08:00:00Z",
      "type": "hr",
      "value": "78"
    },
    {
      "timestamp": "2026-04-20T08:00:00Z",
      "type": "hr",
      "value": "77"
    },
    {
      "timestamp": "2026-06-20T08:00:00Z",
      "type": "hr",
      "value": "76"
    },
    {
      "timestamp": "2025-12-01T08:00:00Z",
      "type": "spO2",
      "value": "96"
    },
    {
      "timestamp": "2026-01-15T08:00:00Z",
      "type": "spO2",
      "value": "97"
    },
    {
      "timestamp": "2026-03-10T08:00:00Z",
      "type": "spO2",
      "value": "97"
    },
    {
      "timestamp": "2026-04-20T08:00:00Z",
      "type": "spO2",
      "value": "97"
    },
    {
      "timestamp": "2026-06-20T08:00:00Z",
      "type": "spO2",
      "value": "97"
    },
    {
      "timestamp": "2025-12-01T08:00:00Z",
      "type": "bp",
      "value": "112/72"
    },
    {
      "timestamp": "2026-01-15T08:00:00Z",
      "type": "bp",
      "value": "110/70"
    },
    {
      "timestamp": "2026-03-10T08:00:00Z",
      "type": "bp",
      "value": "108/68"
    },
    {
      "timestamp": "2026-04-20T08:00:00Z",
      "type": "bp",
      "value": "110/70"
    },
    {
      "timestamp": "2026-06-20T08:00:00Z",
      "type": "bp",
      "value": "108/68"
    }
  ],
  "issues": {
    "head": [
      {
        "id": "head",
        "noteId": "note_mara_head_1",
        "name": "Head & Neurological",
        "painLevel": 4,
        "description": "Cognitive fog ('cog fog') worsening in afternoon. Word-finding difficulty during conversations. Mild persistent headache post-Ocrevus infusion (resolves in 48h). History of left optic neuritis with residual color desaturation.",
        "symptoms": [
          {
            "name": "Cognitive fog",
            "type": "Neurological",
            "verified": true,
            "timeline": "Chronic"
          },
          {
            "name": "Word-finding difficulty",
            "type": "Neurological",
            "verified": true,
            "timeline": "Progressive"
          },
          {
            "name": "Visual color desaturation (L)",
            "type": "Ophthalmological",
            "verified": true,
            "timeline": "Residual"
          }
        ]
      }
    ],
    "lower_back": [
      {
        "id": "lower_back",
        "noteId": "note_mara_back_1",
        "name": "Lumbar Spine & Lower Extremities",
        "painLevel": 5,
        "description": "Bilateral lower extremity spasticity, worse in the morning. Lhermitte's sign positive — electric shock sensation down spine on neck flexion. Gait instability increasing over last 3 months, using a cane intermittently.",
        "symptoms": [
          {
            "name": "Lower limb spasticity",
            "type": "Neurological/Motor",
            "verified": true,
            "timeline": "Chronic"
          },
          {
            "name": "Lhermitte's sign",
            "type": "Neurological",
            "verified": true,
            "timeline": "Active"
          },
          {
            "name": "Gait instability",
            "type": "Neurological/Motor",
            "verified": true,
            "timeline": "Progressive"
          }
        ]
      }
    ],
    "chest": [
      {
        "id": "chest",
        "noteId": "note_mara_chest_1",
        "name": "Chest & Respiratory",
        "painLevel": 2,
        "description": "Occasional MS hug — band-like tightness around the ribcage, typically triggered by heat or stress. Resolves with cooling and rest. No cardiac involvement suspected.",
        "symptoms": [
          {
            "name": "MS hug (dysesthesia)",
            "type": "Neurological/Sensory",
            "verified": true,
            "timeline": "Intermittent"
          }
        ]
      }
    ]
  },
  "history": [
    {
      "type": "AnalysisRun",
      "date": "2026.06.20",
      "summary": "Comprehensive MS Management Review",
      "report": {
        "Summary Overview": "### Clinical Assessment\nMara Santos is a 34-year-old female with relapsing-remitting multiple sclerosis (RRMS), diagnosed in 2023 following an episode of left optic neuritis. She is currently on Ocrevus (ocrelizumab) disease-modifying therapy with stable MRI lesion burden. Primary concerns are progressive fatigue, increasing cognitive fog, lower extremity spasticity with gait instability, and reactive depression.\n\n### Priority List\n*   **Neuroprotection**: Maximize myelin preservation and mitochondrial support in the CNS.\n*   **Fatigue Management**: Address the multifactorial MS fatigue (central, peripheral, sleep disruption, and deconditioning).\n*   **Spasticity Optimization**: Refine Baclofen timing and add non-pharmacological interventions.\n*   **Cognitive Rehabilitation**: Structured neuroplasticity exercises to counter cog fog.\n*   **Vitamin D Repletion**: Critical immunomodulatory gap — 18 ng/mL is dangerously low for RRMS.\n\n### Plan of Care\n*   Aggressive Vitamin D3 repletion to target 60-80 ng/mL (immune modulation + neuroprotection).\n*   CoQ10 + Alpha-Lipoic Acid protocol for mitochondrial rescue.\n*   Structured aquatic therapy program for spasticity + cardiovascular conditioning.\n*   Cognitive rehabilitation: daily dual-task training (walking + mental arithmetic).\n*   Reassess NfL and MRI at 6 months to track subclinical disease activity.\n\n### Goals\n*   **Short-term (4 weeks)**: Fatigue severity scale (FSS) reduction by 20%. Gait confidence improvement.\n*   **Long-term (6 months)**: Extend relapse-free interval to 18+ months. Serum Vitamin D3 > 60 ng/mL. Stabilize EDSS score.",
        "Functional Protocols": "### Immediate Actions (72 hours)\n*   Begin high-dose Vitamin D3 loading protocol: 10,000 IU/day for 8 weeks, then 5,000 IU maintenance.\n*   Add CoQ10 200mg BID with meals for mitochondrial support.\n*   Schedule aquatic therapy evaluation — pool temperature must be < 84°F (Uhthoff's precaution).\n\n### Movement & Rehabilitation Protocol\n| Intervention | Frequency | Duration | Precautions |\n| :--- | :--- | :--- | :--- |\n| Aquatic therapy (cool pool) | 3x/week | 30 min | Temp < 84°F; monitor for Uhthoff's |\n| Yoga Nidra (guided rest) | Daily | 20 min | For fatigue + parasympathetic reset |\n| Dual-task gait training | 5x/week | 15 min | Walking + cognitive tasks simultaneously |\n| Progressive resistance (seated) | 2x/week | 20 min | Target proximal muscle groups |\n\n### Spasticity Management\n*   Baclofen timing optimization: shift from TID to QID with lower individual doses (7.5mg x4) to smooth coverage.\n*   Add evening stretching routine (hamstrings, hip flexors, calves) — 15 min before bed.\n*   Consider trial of CBD oil (15mg sublingual) for breakthrough spasticity — discuss with neurologist.\n\n### Heat Sensitivity Protocol\n*   Cooling vest for any outdoor activity > 75°F.\n*   Pre-cooling before exercise (cold towel on neck, cold water).\n*   Avoid hot baths/showers; use lukewarm water only.",
        "Nutrition": "### Biochemical Assessment\nMara's nutritional profile reveals significant micronutrient depletion consistent with active autoimmune neuroinflammation. Vitamin D deficiency is the most critical gap — studies show RRMS patients with serum D3 > 50 ng/mL have 50-70% fewer relapses. Glutathione depletion signals oxidative stress in the CNS.\n\n### Nutrition Targets\n*   **Vitamin D3**: Aggressive repletion to 60-80 ng/mL — immunomodulatory priority.\n*   **Anti-inflammatory Diet**: Mediterranean-style with emphasis on omega-3 fatty acids.\n*   **Gut-Brain Axis**: Microbiome support for immune regulation.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Vitamin D3 + K2 | 10,000 IU / 200mcg MK-7 | Oral with fat | T-reg upregulation / Neuroprotection |\n| Omega-3 EPA/DHA | 3000mg (high EPA) | Oral with meals | Neuroinflammation / Myelin integrity |\n| N-Acetyl Cysteine (NAC) | 600mg BID | Oral | Glutathione precursor / Antioxidant |\n| Probiotics (multi-strain) | 50B CFU | Oral AM | Gut-brain axis / Immune regulation |\n\n### Dietary Pattern\n- **Adopt**: Modified Mediterranean / Wahls Protocol Level 1 — 9 cups vegetables daily (3 cups greens, 3 cups sulfur-rich, 3 cups deeply colored)\n- **Eliminate**: Gluten, dairy, refined sugar (30-day elimination trial to assess neuroinflammatory response)\n- **Emphasize**: Wild-caught fatty fish 3x/week, bone broth daily, fermented vegetables",
        "Monitoring & Follow-up": "### Immediate Monitoring (0-30 days)\n1.  Baseline Fatigue Severity Scale (FSS) and Modified Fatigue Impact Scale (MFIS) scores.\n2.  Recheck serum 25(OH)D at 8 weeks — target > 60 ng/mL.\n3.  Begin daily fatigue diary in Pocket Gull (rate 1-10, morning + afternoon).\n4.  Monitor Baclofen dose adjustment — watch for increased drowsiness.\n\n### Ongoing Surveillance\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Serum Vitamin D3 | 60-80 ng/mL | 8 weeks, then quarterly | < 30 ng/mL or > 100 ng/mL |\n| Neurofilament Light (NfL) | < 10 pg/mL | Every 6 months | Rising trend = subclinical activity |\n| EDSS Score | Stable or improving | Every 6 months | Any 0.5-point increase |\n| MRI Brain + C-spine | No new T2 lesions | Annual (or if symptoms) | New enhancing lesions |\n| Fatigue Severity Scale | < 4.0 | Monthly | > 5.5 sustained |\n| 25-ft Walk Test | Stable or improving | Every 3 months | > 20% decline |\n\n### Red Flags — Seek Immediate Care\n> ⚠️ New or worsening visual loss, sudden limb weakness, bladder retention, or severe vertigo lasting > 24 hours may indicate a relapse. Contact your MS neurologist immediately — do NOT wait for a scheduled visit.\n\n### Long-term Trajectory\nWith Ocrevus maintaining immune suppression, aggressive Vitamin D repletion, mitochondrial support, and structured rehabilitation, Mara's trajectory should show stabilization of EDSS and extension of the relapse-free interval. The elevated NfL (18.2 pg/mL) warrants close 6-month surveillance.",
        "Patient Education": "### Understanding Multiple Sclerosis\nYour immune system is mistakenly attacking the myelin coating on your nerve fibers — think of it like the insulation on electrical wires getting damaged. When the insulation is thin or missing, the signals slow down or short-circuit. That's why you experience the fatigue, the fog, the spasticity, and the tingling.\n\n### What Your Care Plan Addresses\n*   **The Fatigue**: MS fatigue isn't just 'being tired.' Your brain is working harder to route signals around damaged areas — like a GPS rerouting around road closures. The CoQ10 and mitochondrial support help your nerve cells produce more energy for this extra work.\n*   **The Spasticity**: Your muscles are getting garbled signals, causing them to tighten when they shouldn't. Baclofen helps quiet these signals, and aquatic therapy gives your body a low-gravity environment to move freely.\n*   **The Cognitive Fog**: Your brain can rewire itself (neuroplasticity). The dual-task exercises are training your brain to build new pathways around the damaged ones.\n*   **Vitamin D**: This is not just a vitamin for you — it's a critical immune system regulator. Keeping your levels high has been shown to significantly reduce MS relapses.\n\n### Your Action Plan\n*   **Today**: Start Vitamin D3 with your next meal. This is the single most impactful thing you can do right now.\n*   **This Week**: Begin the evening stretching routine for spasticity. Try the Yoga Nidra recording for fatigue.\n*   **This Month**: Schedule aquatic therapy evaluation. Start the fatigue diary in the app.\n\n### Important Safety Notes\n> 💡 Never skip your Ocrevus infusions — they are the foundation protecting your brain from new attacks. Everything else we're doing is designed to work alongside your DMT, not replace it.\n> \n> 🌡️ Heat is your enemy. Always have a cooling strategy before exercise or hot days. Even a warm shower can temporarily worsen your symptoms (Uhthoff's phenomenon) — this is not a relapse, it's temporary.",
        "Precision Nutrients": "### Biochemical & Biomarker Matrix\nMara's orthomolecular profile is characteristic of active CNS autoimmune disease: severe Vitamin D deficiency driving immune dysregulation, depleted glutathione indicating oxidative stress on oligodendrocytes, low CoQ10 impairing mitochondrial respiration in demyelinated axons, and elevated homocysteine suggesting methylation pathway strain.\n\n```json\n[\n  { \"name\": \"Vitamin D3\", \"level\": \"Deficient\", \"pathway\": \"Immune Modulation / T-reg / Neuroprotection\" },\n  { \"name\": \"Glutathione (GSH)\", \"level\": \"Low\", \"pathway\": \"Antioxidant / Oligodendrocyte Protection\" },\n  { \"name\": \"CoQ10\", \"level\": \"Low\", \"pathway\": \"Mitochondrial Respiration / Axonal Energy\" },\n  { \"name\": \"Vitamin B12\", \"level\": \"Low-normal\", \"pathway\": \"Myelin Synthesis / Methylation\" },\n  { \"name\": \"Homocysteine\", \"level\": \"Elevated\", \"pathway\": \"Cardiovascular / Neurotoxicity\" },\n  { \"name\": \"Magnesium\", \"level\": \"Low\", \"pathway\": \"NMDA / Spasticity / Sleep\" },\n  { \"name\": \"Zinc\", \"level\": \"Low-normal\", \"pathway\": \"Immune / Blood-Brain Barrier\" }\n]\n```\n\n### Detected Deficiencies & MS Relevance\n- **Vitamin D3 (Deficient at 18 ng/mL)**: The most important modifiable risk factor in RRMS. Low D3 is associated with higher relapse rates, faster disability accumulation, and increased MRI lesion burden. Target: 60-80 ng/mL.\n- **Glutathione (Low at 1.1 μmol/g Hb)**: Oligodendrocytes (the cells that make myelin) are exquisitely sensitive to oxidative stress. Depleted GSH accelerates demyelination.\n- **CoQ10 (Low at 0.38 μg/mL)**: Demyelinated axons require dramatically more energy to conduct signals. Low CoQ10 = mitochondrial failure = axonal degeneration.\n- **Homocysteine (Elevated at 14.1 μmol/L)**: Neurotoxic at elevated levels; impairs myelin synthesis and increases BBB permeability.\n\n### Precision Nutrient Protocol\n| Intervention/Molecule | Therapeutic Dose | Delivery | Targeted Pathway |\n|---|---|---|---|\n| Vitamin D3 + K2 | 10,000 IU / 200mcg MK-7 | Oral with fat | T-reg upregulation / Neuroprotection |\n| N-Acetyl Cysteine (NAC) | 600mg BID | Oral | Glutathione precursor / Oligodendrocyte shield |\n| CoQ10 (Ubiquinol) | 200mg BID | Oral with fat | Mitochondrial Complex I-III rescue |\n| Methylcobalamin (B12) | 1000mcg sublingual | Daily | Myelin synthesis / Homocysteine clearance |\n| L-Methylfolate (5-MTHF) | 800mcg | Oral | Methylation cycle / Homocysteine clearance |\n| Alpha-Lipoic Acid (R-ALA) | 600mg | Oral | BBB-crossing antioxidant / Neuroprotection |\n| Magnesium Glycinate | 400mg | Oral, nightly | NMDA modulation / Spasticity / Sleep |\n\n### Cautions & Interactions\n- **Vitamin D3 + Ocrevus**: Monitor calcium levels quarterly; immunosuppression + high-dose D3 requires careful calcium homeostasis surveillance.\n- **NAC + Escitalopram**: NAC may modulate glutamatergic neurotransmission; generally synergistic with SSRIs but monitor for mood changes.\n- **Alpha-Lipoic Acid + Blood Sugar**: R-ALA can lower blood glucose; monitor if Mara ever starts corticosteroids for relapse treatment.\n- **B12 Supplementation**: Use methylcobalamin form specifically — cyanocobalamin requires hepatic conversion that may be impaired in MS."
      }
    },
    {
      "type": "Visit",
      "date": "2026.03.10",
      "summary": "Post-infusion follow-up. Fatigue worsening, gait instability noted. NfL drawn — elevated at 18.2 pg/mL.",
      "state": {
        "patientGoals": "Address worsening fatigue and leg stiffness.",
        "vitals": {
          "bp": "110/70",
          "hr": "78",
          "temp": "98.2°F",
          "spO2": "97%",
          "weight": "140 lbs",
          "height": "5'6\""
        },
        "oxidativeStressMarkers": [],
        "antioxidantSources": [],
        "medications": [
          {
            "id": "1",
            "name": "Ocrevus",
            "value": "600mg IV q6mo"
          },
          {
            "id": "2",
            "name": "Baclofen",
            "value": "10mg TID"
          }
        ],
        "issues": {
          "lower_back": [
            {
              "id": "lower_back",
              "noteId": "note_mara_back_hist1",
              "name": "Lower Extremities",
              "painLevel": 4,
              "description": "Increasing morning stiffness in both legs. Using cane more frequently.",
              "symptoms": []
            }
          ]
        }
      }
    },
    {
      type: "Y-BOCsAssessment",
      date: "2026.05.19",
      summary: "Y-BOCS Assessment completed: Moderate OCD score 18/40",
      assessment: {
        totalScore: 18,
        severityCategory: "Moderate",
        dateCreated: "2026-05-19T14:30:00Z"
      }
    }
  ],
  "bookmarks": [],
  "scans": []
};
