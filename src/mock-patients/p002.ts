import { IPatient } from '../services/patient.types';

export const p002: IPatient = {
  "id": "p002",
  "name": "Homo Sapiens (Female, Asthma & Respiratory, 42y)",
  "age": 42,
  "gender": "Female",
  "lastVisit": "2024.12.01",
  "preexistingConditions": [
    "Asthma",
    "Anxiety Disorder",
    "Chronic Lower Back Pain",
    "Opioid Use Disorder (in remission)",
    "Depression"
  ],
  "patientGoals": "Seeking alternative pain management options to avoid opioid relapse.",
  "vitals": {
    "bp": "118/72",
    "hr": "76",
    "temp": "98.2°F",
    "spO2": "99%",
    "weight": "145 lbs",
    "height": "5'5\""
  },
  "biometricHistory": [
    {
      "timestamp": "2024-10-15T08:00:00Z",
      "type": "hr",
      "value": "78"
    },
    {
      "timestamp": "2024-11-01T08:00:00Z",
      "type": "hr",
      "value": "77"
    },
    {
      "timestamp": "2024-12-01T08:00:00Z",
      "type": "hr",
      "value": "76"
    },
    {
      "timestamp": "2024-10-15T08:00:00Z",
      "type": "spO2",
      "value": "98"
    },
    {
      "timestamp": "2024-11-01T08:00:00Z",
      "type": "spO2",
      "value": "98"
    },
    {
      "timestamp": "2024-12-01T08:00:00Z",
      "type": "spO2",
      "value": "99"
    },
    {
      "timestamp": "2024-10-15T08:00:00Z",
      "type": "bp",
      "value": "120/75"
    },
    {
      "timestamp": "2024-11-01T08:00:00Z",
      "type": "bp",
      "value": "119/73"
    },
    {
      "timestamp": "2024-12-01T08:00:00Z",
      "type": "bp",
      "value": "118/72"
    }
  ],
  "oxidativeStressMarkers": [
    {
      "id": "1",
      "name": "Malondialdehyde (MDA)",
      "value": "2.4 μmol/L"
    },
    {
      "id": "2",
      "name": "F2-Isoprostanes",
      "value": "38 pg/mg creatinine"
    }
  ],
  "antioxidantSources": [
    {
      "id": "1",
      "name": "Vitamin C",
      "value": "1.2 mg/dL"
    },
    {
      "id": "2",
      "name": "Glutathione (GSH)",
      "value": "1.8 μmol/g Hb"
    }
  ],
  "medications": [
    {
      "id": "1",
      "name": "Albuterol Inhaler",
      "value": "2 puffs PRN"
    },
    {
      "id": "2",
      "name": "Sertraline",
      "value": "50mg Daily"
    },
    {
      "id": "3",
      "name": "Gabapentin",
      "value": "300mg TID"
    },
    {
      "id": "4",
      "name": "Ibuprofen",
      "value": "600mg PRN MSK Pain"
    }
  ],
  "issues": {
    "mid_back": [
      {
        "id": "mid_back",
        "noteId": "note_p002_back_1",
        "name": "Lower Back",
        "painLevel": 7,
        "description": "Constant aching pain in L4-L5 region radiating to the left glute. Worsens with prolonged standing.",
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
        "Summary Overview": "### Clinical Assessment\nSarah Jenkins presents with a complex clinical picture primarily characterized by Lower Back. Functional status remains stable, though specific risk factors require targeted intervention to prevent disease progression.\n\n### Priority List\n*   **Metabolic Optimization**: Immediate support needed for ongoing systemic stress.\n*   **Inflammatory Control**: Address underlying drivers of chronic inflammation.\n*   **Symptom Management**: Provide relief for primary presenting complaints.\n\n### Plan of Care\n*   Initiate targeted anti-inflammatory protocol.\n*   Begin functional medicine assessment for underlying root causes.\n*   Schedule follow-up to re-evaluate response to initial interventions.\n\n### Goals\n*   **Short-term (2 weeks)**: 15% reduction in primary symptom severity.\n*   **Long-term (3 months)**: Stabilization of key biomarkers and improved quality of life.\n\n### References\n*   **Smith, J. et al.** (2025). *Integrative Approaches to Chronic Disease*. Journal of Functional Medicine. [DOI:10.1234/jfm.2025.001](https://doi.org/10.1234/jfm.2025.001). Peer-Reviewed.",
        "Functional Protocols": "### Immediate Actions (To start within 72 hours)\n*   Begin comprehensive elimination diet to identify potential food triggers.\n*   Implement strict sleep hygiene protocol (7-8 hours uninterrupted).\n\n### Foundation (Diet & Lifestyle)\n*   Transition to a Mediterranean-style, whole-foods diet.\n*   Engage in 150 minutes of moderate-intensity zone 2 cardio weekly.\n*   Incorporate daily 10-minute mindfulness or breathwork practice.\n\n### Supplementation\n| Intervention | Dose | Timing | Rationale |\n| :--- | :--- | :--- | :--- |\n| Omega-3 EPA/DHA | 2000mg | With meals | Anti-inflammatory support |\n| Vitamin D3 + K2 | 5000 IU | AM | Immune modulation |\n| Magnesium Glycinate | 400mg | Before bed | Nervous system relaxation |\n\n### Functional Protocols\nA comprehensive **HPA Axis Support** protocol is recommended to address systemic fatigue and optimize stress resilience. This includes targeted adaptogens and circadian rhythm realignment.",
        "Nutrition": "### Biochemical Assessment\nAnalysis of Sarah's nutritional profile suggests a high oxidative burden and potential micronutrient insufficiencies. Markers indicate a need for enhanced cellular support and targeted antioxidant therapy.\n\n### Nutrition Targets\n*   **Oxidative Stress Reduction**: High priority due to systemic inflammatory presentation.\n*   **Mitochondrial Support**: Essential for resolving ongoing energy deficits.\n*   **Methylation Pathway Optimization**: Suggested by historical clinical context.\n\n### Nutritional Interventions\n| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |\n| :--- | :--- | :--- | :--- |\n| Liposomal Glutathione | 500mg | Oral | Phase II Detoxification |\n| CoQ10 (Ubiquinol) | 200mg | Oral | Electron Transport Chain |\n| B-Complex (Methylated) | 1 cap | Oral | One-Carbon Metabolism |\n\n### Dietary Adjustments\nIncrease intake of sulfur-rich cruciferous vegetables (broccoli sprouts, kale) to naturally support glutathione synthesis. Focus on deep-pigmented polyphenols (blueberries, pomegranate) for antioxidant defense.",
        "Monitoring & Follow-up": "### Immediate Next Steps (0-30 days)\n1.  Complete baseline advanced functional laboratory panels.\n2.  Initiate foundational diet and lifestyle modifications.\n3.  Two-week check-in to assess tolerance to new interventions and supplement protocols.\n\n### Ongoing (Month 1-3)\n| Parameter | Target | Frequency | Escalation Trigger |\n| :--- | :--- | :--- | :--- |\n| Primary Symptom Severity | < 4/10 | Weekly | Score > 7/10 for 3 consecutive days |\n| Sleep Duration | > 7 hours | Daily | < 5 hours for 2+ nights |\n| Energy Levels | > 6/10 | Daily | Severe crash preventing daily activities |\n\n### Long-term Trajectory (6+ months)\nExpect gradual but sustained improvement across major functional domains. Sarah should reach a new baseline of health resilience, requiring only periodic maintenance check-ins and minor protocol adjustments based on seasonal or stress-related fluctuations.",
        "Patient Education": "### Understanding Your Condition\nYour current symptoms are your body's way of signaling that its internal systems are out of balance. We are looking at a combination of factors including inflammation and metabolic stress that are contributing to how you feel right now.\n\n### What Was Found\n*   **Systemic Stress**: Your body is working harder than usual to maintain its normal functions.\n*   **Nutrient Needs**: There are specific areas where your cells could use more support to heal and repair.\n*   **Imbalanced Systems**: Some of your body's communication pathways need to be gently recalibrated.\n\n### Current Plan\n*   **Targeted Nutrition**: Providing the exact building blocks your body is missing.\n*   **Lifestyle Adjustments**: Making small, manageable changes to your daily routine that yield big results over time.\n*   **Careful Monitoring**: We will track your progress closely to ensure the plan is working for you.\n\n### Important Notes\n> 💡 Please reach out to your care team if you experience any unexpected reactions to the new supplements or if your primary symptoms significantly worsen. Stay hydrated and prioritize rest as you begin this new protocol.",
        "Precision Nutrients": "### Biochemical & Biomarker Matrix\nSarah's clinical markers suggest mild-to-moderate nutrient depletions corresponding to high-demand physiological stress and chronic condition burdens.\n\n| Nutrient/Biomarker | Level | Pathway / Target |\n| :--- | :--- | :--- |\n| Vitamin D3 | Sub-optimal | Immunomodulation / Serotonin |\n| Magnesium | Low-normal | Muscle / Sleep / Nervous System |\n| B-Complex | Sub-optimal | Methylation / Energy Co-factors |\n\n### Detected Deficiencies\n- **Intracellular Magnesium (Sub-optimal)**: Contributes to muscular tension, elevated vascular tone, and sleep disruptions.\n- **Vitamin D3 (Deficient/Sub-optimal)**: Common driver of compromised immune tolerance and lower neuroplastic resilience.\n\n### Orthomolecular Protocol\n- **Magnesium Glycinate**: 400mg before bed.\n- **Vitamin D3 + K2**: 5000 IU daily with breakfast.\n- **Methylated B12/Folate**: 1 capsule AM.",
        "PhysioNet Telemetry": "### PhysioNet 2026 Digital Signal & Electrophysiology Summary\nIntegrated EDF/PhysioNet waveform metrics captured from high-frequency BLE telemetry sensors and continuous multi-lead ECG monitoring.\n\n### Electrocardiographic Waveform Morphology\n- **QRS Interval Duration**: 86 ms (Normal baseline: < 120 ms).\n- **ST-Segment**: Neutral ST morphology across Lead II, V2, V5 (+0.01 mV deviation).\n- **QTc Interval (Fridericia)**: 405 ms (Normal baseline: < 450 ms).\n\n### Heart Rate Variability (HRV) Spectral Power Density\n- **LF/HF Ratio**: 1.6 (Mild sympathetic tone)\n- **RMSSD**: 36 ms (Baseline parasympathetic resilience)"
      }
    },
    {
      "type": "Visit",
      "date": "2024.10.15",
      "summary": "Discussion of physical therapy and cognitive behavioral therapy for pain.",
      "state": {
        "patientGoals": "Need help managing flare-ups without medication.",
        "vitals": {
          "bp": "120/75",
          "hr": "74",
          "temp": "98.5°F",
          "spO2": "99%",
          "weight": "148 lbs",
          "height": "5'5\""
        },
        "oxidativeStressMarkers": [],
        "antioxidantSources": [],
        "medications": [
          {
            "id": "1",
            "name": "Albuterol Inhaler",
            "value": "2 puffs PRN"
          },
          {
            "id": "2",
            "name": "Sertraline",
            "value": "50mg Daily"
          },
          {
            "id": "3",
            "name": "Gabapentin",
            "value": "300mg TID"
          }
        ],
        "issues": {
          "mid_back": [
            {
              "id": "mid_back",
              "noteId": "note_p002_back_hist1",
              "name": "Lower Back",
              "painLevel": 6,
              "description": "Pain has been increasing recently due to work stress.",
              "symptoms": []
            }
          ]
        }
      }
    }
  ],
  "bookmarks": [],
  "scans": [
    {
      "id": "scan_001",
      "type": "MRI",
      "title": "Lumbar Spine MRI",
      "date": "2024.11.15",
      "bodyPartId": "lower_back",
      "description": "L4-L5 disc desiccation and mild paracentral disc protrusion without significant canal stenosis. Mild bilateral neural foraminal narrowing.",
      "status": "Reviewed",
      "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/MRI_of_the_Lumbar_Spine_%28Sagittal_View%29.jpg/640px-MRI_of_the_Lumbar_Spine_%28Sagittal_View%29.jpg"
    },
    {
      "id": "scan_002",
      "type": "X-Ray",
      "title": "Lumbar Spine AP/Lateral X-Ray",
      "date": "2024.11.02",
      "bodyPartId": "lower_back",
      "description": "Normal alignment. No fracture or acute bony abnormality. Mild degenerative disc disease at L4-L5.",
      "status": "Reviewed",
      "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/X-ray_of_the_lumbar_spine_%28lateral_view%29.jpg/640px-X-ray_of_the_lumbar_spine_%28lateral_view%29.jpg"
    }
  ]
};
