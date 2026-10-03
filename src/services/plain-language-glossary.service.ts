import { Injectable, signal } from '@angular/core';

export interface IJargonTerm {
  term: string;
  category: 'Western Physiology' | 'Eastern TCM' | 'Ayurvedic Vedic' | 'Neurology & Sleep';
  plainDefinition: string;
  simpleAnalogy: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlainLanguageGlossaryService {
  private readonly glossaryMap = new Map<string, IJargonTerm>([
    [
      'synovial fluid',
      {
        term: 'Synovial Fluid',
        category: 'Western Physiology',
        plainDefinition: 'Natural joint oil that cushions your joints and stops bones from rubbing together.',
        simpleAnalogy: 'Like smooth motor oil keeping bicycle gears turning without squeaking.'
      }
    ],
    [
      'mitochondria',
      {
        term: 'Mitochondria',
        category: 'Western Physiology',
        plainDefinition: 'Tiny energy factories inside your cells that turn food and oxygen into physical stamina.',
        simpleAnalogy: 'Like mini batteries inside every muscle cell powering your day.'
      }
    ],
    [
      'phytoncides',
      {
        term: 'Phytoncides',
        category: 'Western Physiology',
        plainDefinition: 'Natural airborne chemicals released by trees and plants that boost your immune system and lower blood pressure.',
        simpleAnalogy: 'Natural forest air medicine that calms your nervous system when walking outdoors.'
      }
    ],
    [
      'autonomic tone',
      {
        term: 'Autonomic Nervous System',
        category: 'Neurology & Sleep',
        plainDefinition: 'Your body’s automatic control system for heart rate, breathing, digestion, and stress recovery.',
        simpleAnalogy: 'Like an internal thermostat that automatically balances rest and action.'
      }
    ],
    [
      'glymphatic system',
      {
        term: 'Glymphatic System',
        category: 'Neurology & Sleep',
        plainDefinition: 'Your brain’s night-time washing system that clears away metabolic waste while you sleep deeply.',
        simpleAnalogy: 'Like a night shift cleaning crew washing your brain parenchyma clean every night.'
      }
    ],
    [
      'shen',
      {
        term: 'Shen (Mind & Spirit)',
        category: 'Eastern TCM',
        plainDefinition: 'In Traditional Chinese Medicine, your emotional calm, mental focus, and spirit centered in the heart channel.',
        simpleAnalogy: 'Like a calm inner flame that keeps your mood steady and peaceful.'
      }
    ],
    [
      'qi',
      {
        term: 'Qi (Vital Energy)',
        category: 'Eastern TCM',
        plainDefinition: 'The natural life force energy that flows through your body to nourish organs and muscles.',
        simpleAnalogy: 'Like water flowing smoothly through garden hoses to keep everything alive.'
      }
    ],
    [
      'vata',
      {
        term: 'Vata Dosha',
        category: 'Ayurvedic Vedic',
        plainDefinition: 'In Ayurvedic medicine, the air and wind energy that controls movement, nerves, and thoughts.',
        simpleAnalogy: 'Like a gentle breeze — when balanced, you feel creative; when out of balance, you feel anxious.'
      }
    ],
    [
      'pitta',
      {
        term: 'Pitta Dosha',
        category: 'Ayurvedic Vedic',
        plainDefinition: 'In Ayurvedic medicine, the fire energy that controls digestion, body warmth, and metabolism.',
        simpleAnalogy: 'Like your stomach’s digestive fire turning food into fuel.'
      }
    ],
    [
      'kapha',
      {
        term: 'Kapha Dosha',
        category: 'Ayurvedic Vedic',
        plainDefinition: 'In Ayurvedic medicine, the earth and water energy that gives your body physical strength and joint lubrication.',
        simpleAnalogy: 'Like solid foundation soil keeping your body grounded and strong.'
      }
    ],
    [
      'vitals',
      {
        term: 'Starting 5 Box Score',
        category: 'Western Physiology',
        plainDefinition: 'Your baseline cardiac and metabolic stats displayed like a 1996 Dream Team starting lineup box score.',
        simpleAnalogy: 'Like checking the halftime score, rebounds, and field goal percentage of your core organ systems.'
      }
    ],
    [
      'care plan',
      {
        term: 'Championship Playbook',
        category: 'Western Physiology',
        plainDefinition: 'Your customized clinical intervention protocol designed like a 1996 Dream Team halftime tactical playbook.',
        simpleAnalogy: 'Like running a flawless 90s fast break: crisp passes, precision execution, and zero turnovers.'
      }
    ],
    [
      'icu handover',
      {
        term: 'ICU Handover & Spatial Choreography (F1 Pit Crew Model)',
        category: 'Western Physiology',
        plainDefinition: 'A structured, silent-first transition protocol when transferring critical patients from surgery to the ICU, pioneered by Great Ormond Street Hospital and Ferrari/McLaren F1 teams.',
        simpleAnalogy: 'Like a 2.0-second Formula 1 pit stop: each specialist has an exact spatial zone and silent choreography before the verbal briefing starts, eliminating 40%+ of errors.'
      }
    ],
    [
      'surgical safety checklist',
      {
        term: 'Surgical Safety Time-Out & CRM (Flight 1549 Model)',
        category: 'Western Physiology',
        plainDefinition: 'A mandatory pre-incision team pause where hierarchies are flattened so any nurse, tech, or doctor can immediately speak up if something looks wrong.',
        simpleAnalogy: 'Like Captain Sully’s cockpit Crew Resource Management (CRM): every team member introduces themselves by name so safety overrides rank.'
      }
    ],
    [
      'medical tiger team',
      {
        term: 'Medical Incident Tiger Teams (Apollo 13 Crisis Model)',
        category: 'Western Physiology',
        plainDefinition: 'Rapid, un-bureaucratic sub-teams of frontline experts assembled during acute clinical crises to solve life-threatening constraints with existing bedside resources.',
        simpleAnalogy: 'Like Gene Kranz’s Apollo 13 Mission Control team: building a square CO2 scrubber from round parts on the spot to keep the crew breathing.'
      }
    ],
    [
      'blameless debrief',
      {
        term: 'Blameless M&M Safety Debrief (Blue Angels Safe Room)',
        category: 'Western Physiology',
        plainDefinition: 'A psychological safety culture where clinical leaders admit their own mistakes first to focus entirely on system failures and continuous team learning.',
        simpleAnalogy: 'Like the US Navy Blue Angels stripping away rank in the debrief room: total honesty about mistakes because systemic trust saves lives.'
      }
    ],
    [
      'dhanvantari surgical guild',
      {
        term: 'Dhanvantari Surgical Guilds & Sushruta Team (c. 600 BCE)',
        category: 'Ayurvedic Vedic',
        plainDefinition: 'Ancient multi-specialist surgical teams where distinct apprentices managed the patient’s vital Dosha stabilization via herbal intoxicants and breathing techniques, while toolmasters orchestrated 120+ specialized instruments for the lead surgeon during complex reconstructions (rhinoplasty and cataracts).',
        simpleAnalogy: 'The world’s first coordinated surgical theater: dividing trauma management, anesthesia/Dosha stabilization, and surgical instrument passing among dedicated specialists 2,500 years ago.'
      }
    ],
    [
      'project 523',
      {
        term: 'Project 523 & Tu Youyou Team (TCM & Allopathic Integration, 1967)',
        category: 'Eastern TCM',
        plainDefinition: 'A 500-scientist collaborative effort spanning 60 laboratories that synthesized 2,000 ancient TCM herbal recipes with modern Allopathic chemistry to discover Artemisinin. When heat distillation degraded sweet wormwood (Qinghao), Dr. Tu Youyou returned to Ge Hong’s 1,600-year-old manual to pioneer cold-ether extraction, saving millions of lives.',
        simpleAnalogy: 'The ultimate synthesis of ancient herbal wisdom and modern pharmacology: translating 4th-century cold-water steeping into Nobel Prize-winning malaria medicine.'
      }
    ],
    [
      'toronto insulin team',
      {
        term: 'The Toronto Insulin Discovery Team (Division of Scientific Labor, 1921)',
        category: 'Western Physiology',
        plainDefinition: 'The definitive model of physiological labor division: Frederick Banting (surgical plumbing of the pancreas), Charles Best (daily blood glucose monitoring), J.B. Collip (biochemical purification of the pancreatic extract to eliminate toxicity), and J.J.R. Macleod (physiological experimental framework).',
        simpleAnalogy: 'A perfect scientific relay: Banting and Best extracted the raw substance, Collip purified it from toxic impurities, and Macleod structured the human clinical trials that cured fatal diabetic ketoacidosis in months.'
      }
    ],
    [
      'allopathic team',
      {
        term: 'The Allopathic Team (Mechanistic Specialization)',
        category: 'Western Physiology',
        plainDefinition: 'Healthcare structured like a complex machine with hyper-specialized departments (Cardiology, Nephrology). Excels at acute crises and surgical trauma where targeted mechanical repair is paramount.',
        simpleAnalogy: 'Like an F1 pit crew replacing a failing tire at 200 mph: hyper-focused on fixing one mechanical part with flawless precision, but risking blind spots if one specialist’s drug causes undetected liver strain in another.'
      }
    ],
    [
      'integrated care team',
      {
        term: 'The Eastern & Ayurvedic Team (Ecosystem Care Network)',
        category: 'Eastern TCM',
        plainDefinition: 'Healthcare organized as an interconnected ecosystem (Qi/Prana flow), mirroring multidisciplinary Tumor Boards where surgeons, oncologists, dietitians, and social workers collaborate around the whole person.',
        simpleAnalogy: 'Like an interconnected forest ecosystem: understanding that treating the root tumor impacts psychological stamina, gut microbiome, and long-term vitality across the entire network.'
      }
    ],
    [
      'organizational vata',
      {
        term: 'Organizational Vata (The Flow of Hospital Information)',
        category: 'Ayurvedic Vedic',
        plainDefinition: 'The movement bio-element in hospital operations: the EHR network, telemetry pagers, and patient handoffs. When imbalanced, communication fractures, charts are delayed, and critical lab values are missed.',
        simpleAnalogy: 'The hospital’s central nervous system: when clear and fluid, data reaches doctors instantly; when chaotic or hyperactive, signals scatter into communication noise and missed handoffs.'
      }
    ],
    [
      'organizational pitta',
      {
        term: 'Organizational Pitta (Clinical Interventions & Acute Action)',
        category: 'Ayurvedic Vedic',
        plainDefinition: 'The metabolic fire of healthcare: surgeons, ER trauma bays, and aggressive pharmacological interventions. When excessively high, it breeds aggressive over-treatment and frontline provider burnout from constant firefighting.',
        simpleAnalogy: 'The hospital’s operational engine: essential for life-saving rescues, but if run at maximum RPM 24/7 without cooling down, it overheats clinicians and triggers system-wide exhaustion.'
      }
    ],
    [
      'organizational kapha',
      {
        term: 'Organizational Kapha (Institutional Infrastructure & Support)',
        category: 'Ayurvedic Vedic',
        plainDefinition: 'The structural earth of the healthcare system: bedside nursing ratios, physical facilities, safety protocols, and HR governance. When imbalanced, the institution becomes sluggish, resistant to change, and trapped in bureaucracy.',
        simpleAnalogy: 'The hospital’s solid foundation: providing psychological and structural stability, but needing enough agility so heavy protocols don’t paralyze clinical adaptation during acute crises.'
      }
    ],
    [
      'tridoshic hospital balance',
      {
        term: 'Tridoshic Organizational Balance (The Living Hospital Body)',
        category: 'Ayurvedic Vedic',
        plainDefinition: 'The optimal healthcare system state: decisive intervention (Pitta), supported by resilient nursing infrastructure (Kapha), harmonized by seamless real-time communication (Vata).',
        simpleAnalogy: 'A thriving living organism: brilliant surgical reflexes grounded in unwavering bedside support and connected by instantaneous telemetry.'
      }
    ]
  ]);

  isSpeaking = signal<boolean>(false);

  lookupTerm(term: string): IJargonTerm | undefined {
    return this.glossaryMap.get(term.toLowerCase().trim());
  }

  getAllTerms(): IJargonTerm[] {
    return Array.from(this.glossaryMap.values());
  }

  speakPlainLanguageSummary(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser environment.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly calmer, articulate reading speed
    utterance.pitch = 1.0;
    
    utterance.onstart = () => this.isSpeaking.set(true);
    utterance.onend = () => this.isSpeaking.set(false);
    utterance.onerror = () => this.isSpeaking.set(false);

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking.set(false);
  }
}
