import { IPatient } from '../services/patient.types';

export const p_frida_kahlo: IPatient = {
  id: "p_frida_kahlo",
  name: "Frida Kahlo",
  age: 47,
  gender: "Female",
  lastVisit: "1954.07.13",
  preexistingConditions: [
    "Poliomyelitis (childhood, right leg atrophy)",
    "Severe streetcar accident trauma (1925)",
    "Multiple spinal fractures & pelvic fractures",
    "Right foot amputation (1953)",
    "Chronic neuropathic pain"
  ],
  patientGoals: "Manage chronic, intractable neuropathic pain, support spinal stability, and address severe right leg/foot phantom pain.",
  tcmIntake: {
    tongueColor: "purple",
    tongueCoating: "peeled",
    pulseQuality: "choppy",
    thermalPreference: "aversion-cold",
    sweatPattern: "night-sweats",
    tasteInMouth: "bitter",
    tcmPattern: "Traumatic Blood Stasis with Kidney Yin & Jing Depletion"
  },
  ayurvedicIntake: {
    prakritiVata: 6,
    prakritiPitta: 7,
    prakritiKapha: 2,
    vikritiVata: 9,
    vikritiPitta: 8,
    vikritiKapha: 2,
    agniType: "vishamagni",
    amaScore: 8.5,
    nadiPulseType: "snake-vata",
    ayurvedicImbalance: "Severe Vata-Pitta Aggravation in Asthi & Majja Dhatu"
  },
  vitals: {
    bp: "115/75",
    hr: "82",
    temp: "98.4°F",
    spO2: "97%",
    weight: "110 lbs",
    height: "5'3\"",
    vitD3: "18 ng/mL (Deficient)",
    magnesium: "1.6 mg/dL (Low)",
    b12: "320 pg/mL",
    zinc: "62 mcg/dL"
  },
  oxidativeStressMarkers: [
    { id: "1", name: "hsCRP", value: "8.4 mg/L (Severe Inflammation)" },
    { id: "2", name: "Substance P", value: "220 pg/mL (Elevated Nociception)" }
  ],
  antioxidantSources: [
    { id: "1", name: "Glutathione (GSH)", value: "0.9 μmol/g Hb (Low)" },
    { id: "2", name: "Vitamin C", value: "0.8 mg/dL" }
  ],
  medications: [
    { id: "1", name: "Demerol (Meperidine)", value: "50mg PRN Severe Pain" },
    { id: "2", name: "Morphine Sulfate", value: "10mg SC PRN" }
  ],
  biometricHistory: [
    { timestamp: "1954-07-01T08:00:00Z", type: "hr", value: "88" },
    { timestamp: "1954-07-10T08:00:00Z", type: "hr", value: "84" },
    { timestamp: "1954-07-13T08:00:00Z", type: "hr", value: "82" },
    { timestamp: "1954-07-13T08:00:00Z", type: "bp", value: "115/75" }
  ],
  issues: {
    spine: [
      {
        id: "spine",
        noteId: "note_frida_spine_1",
        name: "Spinal & Pelvic Trauma",
        painLevel: 8,
        description: "Chronic pain, spinal instability requiring steel corsets. Post-operative status of 30+ surgeries.",
        symptoms: [
          { name: "Severe back pain", type: "Neuropathic", verified: true, timeline: "Chronic" }
        ]
      }
    ],
    r_leg: [
      {
        id: "r_leg",
        noteId: "note_frida_leg_1",
        name: "Right Leg Atrophy & Amputation",
        painLevel: 9,
        description: "Right leg exhibits marked atrophy (post-polio). Right foot/lower leg amputated in 1953 due to gangrene, resulting in severe phantom limb sensations and burning.",
        symptoms: [
          { name: "Phantom foot pain", type: "Neuropathic", verified: true, timeline: "Chronic" },
          { name: "Right lower leg atrophy", type: "Musculoskeletal", verified: true, timeline: "Chronic" }
        ]
      }
    ]
  },
  history: [
    {
      type: "AnalysisRun",
      date: "1954.07.13",
      summary: "Comprehensive Clinical Analysis",
      report: {
        "Summary Overview": "### Clinical Assessment\nFrida Kahlo presents with severe, multi-site chronic pain stemming from childhood poliomyelitis, severe traumatic spinal/pelvic fractures (1925 streetcar collision), 30+ surgical revisions, and right lower leg amputation (1953). Main clinical challenge is controlling central sensitization and phantom limb pain without excessive sedation.\n\n### Priority List\n- **Phantom Limb & Nociceptive Pain**: Address peripheral neuro-inflammation and central pain wind-up.\n- **Spinal Stabilization**: Plaster and steel corset support optimization.\n- **PhysioNet 2026 Telemetry**: Neuromuscular EMG and central sensitization mapping.\n\n### Goals\n- **Short-term**: Reduce VAS pain score from 9/10 to <= 5/10; restore restorative sleep.\n- **Long-term**: Prevent surgical site breakdown and maintain artistic output capacity.",
        "Functional Protocols": "### Immediate Actions (Within 24 hours)\n- Mirror visual feedback therapy for phantom right limb pain.\n- Transcutaneous Electrical Nerve Stimulation (TENS) along spinal sensory dermatomes.\n- Solfeggio 174 Hz / 528 Hz acoustic nerve dampening soundscape.",
        "Nutrition": "### Anti-Inflammatory Recovery Nutrition\n- High polyphenol dietary pattern (papaya, avocado, Mexican oregano tea).\n- Curcumin extract 1000mg with black pepper piperine for COX-2 cytokine dampening.",
        "Monitoring & Follow-up": "### Tracking Schedule\n- Daily VAS pain score and phantom sensation log.\n- Weekly surgical stump skin integrity check.\n- PhysioNet continuous EEG/EMG central sensitization telemetry.",
        "Patient Education": "### Patient Guidance\n- Practice mirror box therapy for 15 minutes twice daily to retrain cortical somatosensory map.",
        "Precision Nutrients": "### Orthomolecular Matrix\n- **PEA (Palmitoylethanolamide)**: 600mg BID (glual microglial anti-inflammatory).\n- **Alpha-Lipoic Acid**: 600mg Daily (diabetic & post-surgical neuropathic support).\n- **Magnesium Glycinate**: 400mg before bed.",
        "PhysioNet Telemetry": "### PhysioNet 2026 Challenge: Neuromuscular Phantom Limb & Central Sensitization Challenge\n- **Heart Rate**: 82 bpm\n- **QRS Interval**: 90 ms\n- **ST Segment**: Neutral\n- **EMG Phantom Spiking Frequency**: 14 spikes/min (Central wind-up active)"
      }
    }
  ],
  bookmarks: [],
  scans: [
    {
      id: "scan_frida_1",
      title: "Spine AP & Lateral Radiograph",
      type: "X-Ray",
      date: "1954.06.10",
      description: "Severe lumbar scoliosis, post-fusion metallic hardware artifacts, and pelvic tilt consistent with limb length inequality.",
      status: "Abnormal"
    }
  ]
};
