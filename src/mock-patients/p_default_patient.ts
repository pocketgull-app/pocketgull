import { IPatient } from '../services/patient.types';

export const p_default_patient: IPatient = {
  id: "p_default_patient",
  name: "Alexander Vance",
  age: 42,
  gender: "Male",
  lastVisit: "2026.05.20",
  preexistingConditions: ["Hypertension", "Mild Sleep Apnea", "Google Health Integration"],
  patientGoals: "Optimize metabolic health, synchronize all personal biometrics from Google Health Connect, and reduce sleep latency.",
  tcmIntake: {
    tongueColor: "pink",
    tongueCoating: "thin-white",
    pulseQuality: "normal",
    thermalPreference: "neutral",
    sweatPattern: "normal",
    tasteInMouth: "normal",
    tcmPattern: "Zang-Fu Balance with Mild Liver Qi Constriction (Executive Stress)"
  },
  ayurvedicIntake: {
    prakritiVata: 3,
    prakritiPitta: 5,
    prakritiKapha: 3,
    vikritiVata: 4,
    vikritiPitta: 6,
    vikritiKapha: 3,
    agniType: "samagni",
    amaScore: 1.8,
    nadiPulseType: "frog-pitta",
    ayurvedicImbalance: "Samagni Metabolic Balance with Mild Pitta Exertion"
  },
  vitals: {
    bp: "122/82",
    hr: "68",
    temp: "98.6°F",
    spO2: "98%",
    weight: "178 lbs",
    height: "5'10\"",
    vitD3: "32 ng/mL",
    magnesium: "2.1 mg/dL",
    crp: "0.8 mg/L",
    hba1c: "5.4%",
    homocysteine: "8.2 µmol/L",
    ast: "22 U/L",
    alt: "24 U/L",
    fastingGlucose: "88 mg/dL",
    triglycerides: "110 mg/dL",
    hdl: "58 mg/dL",
    ldl: "92 mg/dL",
    vo2Max: "44 mL/kg/min",
    bodyFatPercentage: "18.5%",
    microbiomeDiversityIndex: "8.4/10",
    firmicutesBacteroidetesRatio: "1.2",
    cortisolAwakeningResponse: "Normal (+50% at 30min)",
    dheaS: "240 µg/dL",
    salivaryMelatoninPeak: "14 pg/mL",
    hrvSdnn: "52 ms",
    hrvRmssd: "42 ms",
    egfr: "95 mL/min/1.73m²"
  },
  symptoms: [
    { name: "Executive Workload Fatigue", severity: 2, duration: "3 weeks", onset: "Gradual", systemicDomain: "Neurological & Metabolic" },
    { name: "Intermittent Sleep Latency", severity: 2, duration: "1 month", onset: "Gradual", systemicDomain: "Circadian & Neuroendocrine" }
  ],
  medications: [
    { id: "med_magnesium", name: "Magnesium Glycinate", value: "400mg Daily at Bedtime (Sleep Architecture & Muscle Recovery)" },
    { id: "med_omega3", name: "Omega-3 Triglyceride EPA/DHA", value: "2000mg Daily (Cardiovascular & Neural Membrane Health)" }
  ],
  labResults: [
    { testName: "HbA1c", result: "5.4%", unit: "%", referenceRange: "< 5.7%", status: "Optimal" },
    { testName: "hs-CRP", result: "0.8", unit: "mg/L", referenceRange: "< 1.0 mg/L", status: "Optimal" },
    { testName: "Vitamin D3", result: "32", unit: "ng/mL", referenceRange: "30-100 ng/mL", status: "Normal" }
  ],
  wearablesTelemetry: {
    cgmAverageGlucose: 94,
    cgmTimeInRange: 96,
    deepSleepMinutes: 82,
    remSleepMinutes: 95,
    lightSleepMinutes: 240,
    dailySteps: 9850,
    activeCalories: 540,
    restingHeartRate: 58
  },
  aiSummary: "Alexander Vance demonstrates strong baseline metabolic stability with excellent glycemic control (HbA1c 5.4%, CGM TIR 96%) and balanced Zang-Fu/Samagni physiology. Primary opportunities include optimizing sleep architecture and managing executive stress response.",
  clinicalRoadmap: [
    { phase: "Phase 1: Circadian Entrainment", objective: "Anchor sleep onset with timed morning sunlight exposure and 400mg nocturnal Magnesium Glycinate.", status: "Active" },
    { phase: "Phase 2: HRV Recovery Optimization", objective: "Incorporate bi-weekly vagal breathwork sessions to elevate RMSSD above 50ms.", status: "Scheduled" }
  ],
  history: [],
  bookmarks: [],
  issues: {}
};
