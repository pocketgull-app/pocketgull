// SPDX-License-Identifier: Apache-2.0

export type EmergencyFirstAidGuideId =
  | 'bleeding'
  | 'choking'
  | 'overdose'
  | 'stroke'
  | 'burns'
  | 'heat';

export interface IEmergencyTaskTemplate {
  id: string;
  role: string;
  assignedAction: string;
  icon: string;
}

export interface IEmergencyProtocolDescriptor {
  indication: string;
  title: string;
  shortBadge: string;
  step1Headline: string;
  step1Subtitle: string;
  dispatchStatusHint: string;
  defaultFirstAidGuide: EmergencyFirstAidGuideId | null;
  priorityTasks: readonly IEmergencyTaskTemplate[];
}

const DEFAULT_CALLER_TASK: IEmergencyTaskTemplate = {
  id: 'task_caller',
  role: 'Bystander 1: 911 Caller',
  assignedAction: 'Dial 911, state exact location, put phone on speakerphone, report patient status.',
  icon: '📞'
};

const DEFAULT_GUIDE_TASK: IEmergencyTaskTemplate = {
  id: 'task_guide',
  role: 'Bystander 4: Paramedic Guide',
  assignedAction: 'Go to street entrance or lobby to guide arriving paramedics directly to scene.',
  icon: '🚪'
};

const EMERGENCY_PROTOCOL_TABLE: Readonly<Record<string, IEmergencyProtocolDescriptor>> = {
  STAT_CODE_BLUE: {
    indication: 'STAT_CODE_BLUE',
    title: 'Cardiopulmonary Arrest / CPR Resuscitation',
    shortBadge: 'CPR RESCUE',
    step1Headline: 'Step 1: Call 911 Immediately',
    step1Subtitle: 'Assign a dedicated bystander to call 911 and place the phone on speakerphone next to the patient.',
    dispatchStatusHint: '"Unresponsive patient, CPR in progress." or "Severe trauma/choking."',
    defaultFirstAidGuide: null,
    priorityTasks: [
      {
        ...DEFAULT_CALLER_TASK,
        assignedAction: 'Dial 911, state location, put phone on speakerphone, report patient status.'
      },
      {
        id: 'task_aed',
        role: 'Bystander 2: AED & First Aid',
        assignedAction: 'Locate & retrieve nearest AED (Defibrillator) and Emergency First Aid kit.',
        icon: '⚡'
      },
      {
        id: 'task_cpr',
        role: 'Bystander 3: CPR Rescuer',
        assignedAction: 'Position patient flat on back and start 110 BPM chest compressions immediately.',
        icon: '❤️'
      },
      DEFAULT_GUIDE_TASK
    ]
  },
  BYSTANDER_OPIOID_OVERDOSE: {
    indication: 'BYSTANDER_OPIOID_OVERDOSE',
    title: 'Bystander Opioid Overdose / Naloxone (Narcan) Rescue',
    shortBadge: 'NALOXONE / OVERDOSE',
    step1Headline: 'Step 1: Call 911 & Give Naloxone Now',
    step1Subtitle: 'Call 911 on speakerphone and administer 4 mg intranasal Naloxone (Narcan) immediately; re-dose every 2–3 min if unresponsive.',
    dispatchStatusHint: '"Suspected opioid overdose, unresponsive/slow breathing, Naloxone administered."',
    defaultFirstAidGuide: 'overdose',
    priorityTasks: [
      DEFAULT_CALLER_TASK,
      {
        id: 'task_aed',
        role: 'Bystander 2: Naloxone (Narcan) Rescuer',
        assignedAction: 'Spray 4 mg Naloxone into one nostril (or inject 0.4 mg IM); prepare second dose after 2–3 min if no response.',
        icon: '💊'
      },
      {
        id: 'task_cpr',
        role: 'Bystander 3: Rescue Breathing / CPR',
        assignedAction: 'Open airway (head-tilt/chin-lift); deliver 1 rescue breath every 5–6 seconds if pulse present, or start 110 BPM CPR if pulseless.',
        icon: '❤️'
      },
      DEFAULT_GUIDE_TASK
    ]
  },
  BYSTANDER_ANAPHYLAXIS: {
    indication: 'BYSTANDER_ANAPHYLAXIS',
    title: 'Severe Anaphylaxis / Epinephrine Auto-Injector',
    shortBadge: 'EPINEPHRINE / AIRWAY',
    step1Headline: 'Step 1: Call 911 & Inject Epinephrine',
    step1Subtitle: 'Call 911 immediately and inject Epinephrine (0.3 mg adult / 0.15 mg child) firmly into the outer mid-thigh.',
    dispatchStatusHint: '"Severe anaphylaxis / airway swelling, Epinephrine auto-injector given."',
    defaultFirstAidGuide: null,
    priorityTasks: [
      DEFAULT_CALLER_TASK,
      {
        id: 'task_aed',
        role: 'Bystander 2: Epinephrine Auto-Injector',
        assignedAction: 'Inject 0.3 mg (adult) Epinephrine into outer mid-thigh through clothing; hold 3–10s per device label & note time.',
        icon: '💉'
      },
      {
        id: 'task_cpr',
        role: 'Bystander 3: Airway & Supine Positioning',
        assignedAction: 'Keep patient lying flat (elevate legs unless vomiting/dyspneic); monitor breathing and begin 110 BPM CPR if arrest occurs.',
        icon: '❤️'
      },
      DEFAULT_GUIDE_TASK
    ]
  },
  UNCONSCIOUS_TRAUMA: {
    indication: 'UNCONSCIOUS_TRAUMA',
    title: 'Unconscious Trauma / Hemorrhage Control',
    shortBadge: 'TRAUMA / BLEEDING',
    step1Headline: 'Step 1: Call 911 & Stop Major Bleeding',
    step1Subtitle: 'Apply direct firm pressure or commercial tourniquet 2–3 inches above life-threatening extremity bleed while maintaining spinal alignment.',
    dispatchStatusHint: '"Unconscious trauma patient, active hemorrhage control & airway monitoring."',
    defaultFirstAidGuide: 'bleeding',
    priorityTasks: [
      DEFAULT_CALLER_TASK,
      {
        id: 'task_aed',
        role: 'Bystander 2: Hemorrhage & Tourniquet',
        assignedAction: 'Apply continuous direct pressure with clean gauze; place high-and-tight tourniquet above massive limb bleeding and mark time.',
        icon: '🩸'
      },
      {
        id: 'task_cpr',
        role: 'Bystander 3: C-Spine & Hypothermia Guard',
        assignedAction: 'Avoid unnecessary neck movement unless airway obstructed; keep trauma victim warm and monitor breathing/CPR.',
        icon: '❤️'
      },
      DEFAULT_GUIDE_TASK
    ]
  },
  CRITICAL_SEPSIS: {
    indication: 'CRITICAL_SEPSIS',
    title: 'Severe Sepsis / Acute Hemodynamic Shock',
    shortBadge: 'SEPSIS / SHOCK',
    step1Headline: 'Step 1: Call 911 & Monitor Shock Vitals',
    step1Subtitle: 'Keep patient supine, preserve body heat, record HR/SpO2/Temp trends for EMS Sepsis Alert activation.',
    dispatchStatusHint: '"Acute sepsis / septic shock suspicion with altered mental status or hypotension."',
    defaultFirstAidGuide: null,
    priorityTasks: [
      DEFAULT_CALLER_TASK,
      {
        id: 'task_aed',
        role: 'Bystander 2: Baseline Vitals & History',
        assignedAction: 'Acquire pulse/SpO2 telemetry, check temperature/mental status, and gather fever onset & medication list.',
        icon: '📡'
      },
      {
        id: 'task_cpr',
        role: 'Bystander 3: Shock Positioning & Airway',
        assignedAction: 'Lay patient flat if tolerated, keep warm, do NOT give oral fluids if altered, and initiate CPR if unresponsive without pulse.',
        icon: '❤️'
      },
      DEFAULT_GUIDE_TASK
    ]
  },
  MSF_CHOLERA_SHOCK: {
    indication: 'MSF_CHOLERA_SHOCK',
    title: 'MSF Cholera Dehydration Shock (Plan C Protocol)',
    shortBadge: 'MSF PLAN C HYDRATION',
    step1Headline: 'Step 1: Activate Urgent Medical Transport & Rehydration',
    step1Subtitle: 'Assess severe dehydration signs (lethargy, sunken eyes, weak/absent radial pulse); prepare Ringer\'s Lactate IV Plan C or supervised ORS.',
    dispatchStatusHint: '"Severe acute watery diarrhea / hypovolemic shock requiring Plan C IV resuscitation."',
    defaultFirstAidGuide: 'heat',
    priorityTasks: [
      DEFAULT_CALLER_TASK,
      {
        id: 'task_aed',
        role: 'Bystander 2: Plan C IV / ORS Prep',
        assignedAction: 'Check radial pulse strength & capillary refill; prepare ORS sips ONLY if awake and alert, or assist medical IV setup.',
        icon: '💧'
      },
      {
        id: 'task_cpr',
        role: 'Bystander 3: Aspiration & Hygiene Control',
        assignedAction: 'Place lethargic patients in recovery position, sanitize excreta safely with 0.2% chlorine solution, and track output.',
        icon: '❤️'
      },
      DEFAULT_GUIDE_TASK
    ]
  },
  OUTBREAK_EPIDEMIC_ISOLATION: {
    indication: 'OUTBREAK_EPIDEMIC_ISOLATION',
    title: 'Humanitarian Outbreak / Epidemic Field Triage',
    shortBadge: 'ISOLATION / PPE',
    step1Headline: 'Step 1: Notify Public Health / EMS & Maintain PPE Barrier',
    step1Subtitle: 'Don disposable mask/gloves/eye shield before contact, isolate symptomatic person >= 2m, and log exposed contacts.',
    dispatchStatusHint: '"Suspected high-consequence infectious emergency; isolation precaution active."',
    defaultFirstAidGuide: null,
    priorityTasks: [
      DEFAULT_CALLER_TASK,
      {
        id: 'task_aed',
        role: 'Bystander 2: PPE & Isolation Perimeter',
        assignedAction: 'Establish ventilated isolation zone, apply medical mask to patient if breathing comfortably, and don PPE prior to contact.',
        icon: '🦠'
      },
      {
        id: 'task_cpr',
        role: 'Bystander 3: Non-Invasive Monitoring',
        assignedAction: 'Record temperature, SpO2, respiratory rate, and symptom onset timeline without unnecessary aerosol exposure.',
        icon: '❤️'
      },
      DEFAULT_GUIDE_TASK
    ]
  },
  DISASTER_TRIAGE: {
    indication: 'DISASTER_TRIAGE',
    title: 'Mass Casualty / Code Black START Disaster Triage',
    shortBadge: 'MCI START TRIAGE',
    step1Headline: 'Step 1: Notify Dispatch of Multi-Casualty Scene & Count',
    step1Subtitle: 'Ensure scene safety first; triage rapidly using START (Respiration -> Perfusion -> Mental Status) without delaying crowd movement.',
    dispatchStatusHint: '"Mass casualty incident: reporting casualty count, hazards, and START Red tags."',
    defaultFirstAidGuide: 'bleeding',
    priorityTasks: [
      DEFAULT_CALLER_TASK,
      {
        id: 'task_aed',
        role: 'Bystander 2: Scene Hazard & Green/Yellow Triage',
        assignedAction: 'Instruct ambulatory casualties ("walking wounded") to move to a safe assembly point; identify life-threatening bleeds.',
        icon: '⚠️'
      },
      {
        id: 'task_cpr',
        role: 'Bystander 3: Immediate Airway / Bleed Control',
        assignedAction: 'Open airway cleanly and pack/tourniquet arterial bleeds (< 30s per casualty) for START Red priority patients.',
        icon: '❤️'
      },
      DEFAULT_GUIDE_TASK
    ]
  }
};

/**
 * Resolves the active Good Samaritan / STAT protocol descriptor for a clinical indication code.
 */
export function resolveEmergencyProtocolDescriptor(indication?: string | null): IEmergencyProtocolDescriptor {
  if (indication && EMERGENCY_PROTOCOL_TABLE[indication]) {
    return EMERGENCY_PROTOCOL_TABLE[indication];
  }
  return EMERGENCY_PROTOCOL_TABLE['STAT_CODE_BLUE'];
}
