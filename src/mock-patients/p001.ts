import { IPatient } from '../services/patient.types';

export const p001: IPatient = {
  "id": "p001",
  "name": "Homo Sapiens (Male, Metabolic Syndrome, 58y)",
  "age": 58,
  "gender": "Male",
  "lastVisit": "2024.11.20",
  "preexistingConditions": [
    "Essential Hypertension",
    "Type 2 Diabetes Mellitus",
    "Obesity (BMI 42)",
    "Severe Obstructive Sleep Apnea",
    "Metabolic Syndrome"
  ],
  "patientGoals": "Discuss CPAP compliance issues and weight management strategies.",
  "tcmIntake": {
    "tongueColor": "pale",
    "tongueCoating": "thick-white",
    "pulseQuality": "slippery",
    "thermalPreference": "aversion-cold",
    "sweatPattern": "spontaneous-day",
    "tasteInMouth": "bland",
    "tcmPattern": "Spleen Qi Deficiency with Phlegm-Damp Accumulation"
  },
  "ayurvedicIntake": {
    "prakritiVata": 3,
    "prakritiPitta": 4,
    "prakritiKapha": 8,
    "vikritiVata": 4,
    "vikritiPitta": 5,
    "vikritiKapha": 9,
    "agniType": "mandagni",
    "amaScore": 7.2,
    "nadiPulseType": "swan-kapha",
    "ayurvedicImbalance": "Kapha Agni Suppression & Medas Dhatu Stagnation"
  },
  "vitals": {
    "bp": "152/95",
    "hr": "88",
    "temp": "98.4°F",
    "spO2": "94%",
    "weight": "295 lbs",
    "height": "5'10\""
  },
  "oxidativeStressMarkers": [
    {
      "id": "1",
      "name": "Malondialdehyde (MDA)",
      "value": "3.8 μmol/L"
    },
    {
      "id": "2",
      "name": "F2-Isoprostanes",
      "value": "45 pg/mg creatinine"
    }
  ],
  "antioxidantSources": [
    {
      "id": "1",
      "name": "Glutathione (GSH)",
      "value": "1.2 μmol/g Hb"
    },
    {
      "id": "2",
      "name": "CoQ10",
      "value": "0.45 μg/mL"
    }
  ],
  "medications": [
    {
      "id": "1",
      "name": "Lisinopril",
      "value": "20mg Daily"
    },
    {
      "id": "2",
      "name": "Metformin",
      "value": "1000mg BID"
    },
    {
      "id": "3",
      "name": "Atorvastatin",
      "value": "40mg Daily"
    }
  ],
  "issues": {
    "chest": [
      {
        "id": "chest",
        "noteId": "note_p001_chest_1",
        "name": "Chest & Lungs",
        "painLevel": 1,
        "description": "Reports waking up gasping for air frequently. Daytime somnolence affecting work performance.",
        "symptoms": []
      }
    ],
    "head": [
      {
        "id": "head",
        "noteId": "note_p001_head_1",
        "name": "Head & Neck",
        "painLevel": 2,
        "description": "Morning headaches nearly every day, likely secondary to hypoxemia and OSA.",
        "symptoms": []
      }
    ]
  },
  "history": [
    {
      "type": "AnalysisRun",
      "date": "2026.06.25",
      "summary": "Comprehensive Clinical Analysis",
      "report": {
        "Summary Overview": "### Clinical Assessment\nRobert Davis presents with a complex clinical picture primarily characterized by Chest & Lungs, Head & Neck. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
        "Functional Protocols": "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
        "Nutrition": "### Biochemical Assessment\nAnalysis of Robert's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
        "Monitoring & Follow-up": "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. Robert should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
        "Patient Education": "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
        "Precision Nutrients": "### Biochemical & Biomarker Matrix\nRobert's clinical markers suggest mild-to-moderate nutrient depletions corresponding to high-demand physiological stress and chronic condition burdens.\n\n| Nutrient/Biomarker | Level | Pathway / Target |\n| :--- | :--- | :--- |\n| Vitamin D3 | Sub-optimal | Immunomodulation / Serotonin |\n| Magnesium | Low-normal | Muscle / Sleep / Nervous System |\n| B-Complex | Sub-optimal | Methylation / Energy Co-factors |\n\n### Detected Deficiencies\n- **Intracellular Magnesium (Sub-optimal)**: Contributes to muscular tension, elevated vascular tone, and sleep disruptions.\n- **Vitamin D3 (Deficient/Sub-optimal)**: Common driver of compromised immune tolerance and lower neuroplastic resilience.\n\n### Orthomolecular Protocol\n- **Magnesium Glycinate**: 400mg before bed.\n- **Vitamin D3 + K2**: 5000 IU daily with breakfast.\n- **Methylated B12/Folate**: 1 capsule AM.",
        "PhysioNet Telemetry": "### PhysioNet 2026 Digital Signal & Electrophysiology Summary\nIntegrated EDF/PhysioNet waveform metrics captured from high-frequency BLE telemetry sensors and continuous multi-lead ECG monitoring.\n\n### Electrocardiographic Waveform Morphology\n- **QRS Interval Duration**: 92 ms (Normal baseline: < 120 ms).\n- **ST-Segment**: Neutral ST morphology (+0.04 mV deviation).\n- **QTc Interval (Fridericia)**: 418 ms (Normal baseline: < 450 ms).\n\n### Heart Rate Variability (HRV) Spectral Power Density\n- **LF/HF Ratio**: 2.4 (Elevated sympathetic load)\n- **RMSSD**: 22 ms (Suppressed parasympathetic tone)"
      }
    },
    {
      "type": "Visit",
      "date": "2024.10.10",
      "summary": "Initial consultation for sleep study follow-up.",
      "state": {
        "patientGoals": "Review sleep study results.",
        "vitals": {
          "bp": "148/92",
          "hr": "85",
          "temp": "98.6°F",
          "spO2": "96%",
          "weight": "298 lbs",
          "height": "5'10\""
        },
        "oxidativeStressMarkers": [
          {
            "id": "1",
            "name": "Malondialdehyde (MDA)",
            "value": "3.6 μmol/L"
          }
        ],
        "antioxidantSources": [
          {
            "id": "1",
            "name": "Glutathione (GSH)",
            "value": "1.4 μmol/g Hb"
          }
        ],
        "medications": [
          {
            "id": "1",
            "name": "Lisinopril",
            "value": "20mg Daily"
          },
          {
            "id": "2",
            "name": "Metformin",
            "value": "1000mg BID"
          },
          {
            "id": "3",
            "name": "Atorvastatin",
            "value": "40mg Daily"
          }
        ],
        "issues": {}
      }
    }
  ],
  "bookmarks": [],
  "scans": [
    {
      "id": "scan_003",
      "type": "X-Ray",
      "title": "PA and Lateral Chest",
      "date": "2024.10.12",
      "bodyPartId": "chest",
      "description": "Bilateral hyperinflation consistent with COPD. No focal consolidation, pneumothorax or pleural effusion. Borderline cardiomegaly.",
      "status": "Reviewed",
      "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Chest_xray_mac.jpg/640px-Chest_xray_mac.jpg"
    }
  ],
  "dynamicNutrients": [],
  "clinicalNotes": [],
  "checklist": []
};
