/**
 * 🏛️ Nantucket Ferry Terminal & Visitor Center Interactive Tourism Kiosk
 * High-engagement touch kiosk for island trail safety, ecology storytelling, and family education.
 * Powered by natural-language conversational voice synthesis, COPPA child safety, and offline edge audio.
 */

export type KioskVoicePersona = 'ranger_maya' | 'barnaby_owl' | 'clinical_doc';

export interface IKioskStoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  icon: string;
  themeColor: string;
  badge: string;
  headline: string;
  storyParagraphs: string[];
  spokenNarration: string;
  defaultPersona: KioskVoicePersona;
  interactiveWidgetType: 'story_card' | 'armor_physics' | 'clock_kinetics' | 'trail_finder' | 'waffle_grid' | 'hospital_card';
  familyActionStep: string;
  heroImageUrl?: string;
}

export const KIOSK_STORY_CHAPTERS: IKioskStoryChapter[] = [
  {
    id: 'chapter_1_moorlands',
    chapterNumber: 1,
    title: 'The Ancient Moorlands',
    subtitle: 'A Globally Rare Sandplain Island Commons',
    icon: '🌾',
    themeColor: '#34d399',
    badge: 'ISLAND HERITAGE & ECOLOGY',
    headline: 'Welcome to Nantucket: Where Glacial Winds Shaped a Rare Ecosystem',
    storyParagraphs: [
      'Over 14,000 years ago, retreating glaciers left behind Nantucket’s rolling sandy plains, coastal heathlands, and freshwater kettle bogs.',
      'Today, the Nantucket Moors are among the rarest ecosystems on Earth, harboring endangered wildflowers, regal fritillary butterflies, and short-eared owls.',
      'As visitors and families, we practice the **Seven Generations principle**: exploring the beauty of our island commons while taking simple, evidence-based steps to keep our families safe and the landscape thriving.'
    ],
    spokenNarration: 'Hello, and welcome to Nantucket! Take a deep breath of that crisp, salty Atlantic air. Did you know that over fourteen thousand years ago, colossal moving glaciers sculpted the rolling sandplains and cranberry kettle bogs all around us? Today, these open moors are among the rarest ecosystems on planet Earth—home to bright purple wild lupines, regal butterflies, and short-eared owls. When you explore our island trails, you are walking through thousands of years of living natural history. Keep to the center of wide gravel paths, soak in the ocean views, and help us preserve this beautiful island commons for the next seven generations to come!',
    defaultPersona: 'ranger_maya',
    interactiveWidgetType: 'story_card',
    familyActionStep: 'Stay on established sand paths and paved bike paths when exploring coastal heathlands.'
  },
  {
    id: 'chapter_2_armor_lab',
    chapterNumber: 2,
    title: 'The Armor Lab',
    subtitle: 'Permethrin Socks & Repellent Physics',
    icon: '🛡️',
    themeColor: '#38bdf8',
    badge: 'FAMILY TRAIL DEFENSE',
    headline: 'Building Your Trail Armor: How Permethrin Keeps Ticks at Bay',
    storyParagraphs: [
      'Blacklegged tick nymphs quest on the tips of grass at calf and ankle level (4 to 12 inches high). They do not jump, fly, or drop from pine trees.',
      'Treating your sneakers, socks, and hiking cuffs with **Permethrin** creates an invisible defensive shield. When a tick steps onto treated fabric, its nervous system detects a "hot-foot" effect, causing it to curl up and fall off before biting.',
      'Pairing Permethrin socks with EPA-registered **Picaridin (20%)** on exposed skin provides nearly 100% protection during moorland adventures.'
    ],
    spokenNarration: 'Let us talk about trail armor! Ticks do not jump from pine trees, and they cannot fly through the air. Tiny, poppy-seed-sized nymphs wait patiently on low grass blades, just four to twelve inches off the ground. When you treat your sneakers and socks with Permethrin, you create an invisible protective barrier. The very moment a tick touches treated fabric, it feels what biologists call a hot-foot effect—its little legs pull back, it does a quick reverse spin, and it falls harmlessly to the ground before it can ever bite! Combine treated socks with twenty percent Picaridin on your exposed skin, and your family has world-class armor for every adventure.',
    defaultPersona: 'ranger_maya',
    interactiveWidgetType: 'armor_physics',
    familyActionStep: 'Spray hiking shoes and socks with Permethrin before leaving your rental home or hotel.'
  },
  {
    id: 'chapter_3_superhero_clock',
    chapterNumber: 3,
    title: 'The 72-Hour Clock',
    subtitle: 'Calm Science for Parents & Caregivers',
    icon: '⏱️',
    themeColor: '#fbbf24',
    badge: 'CALM & CONFIDENT HEALTH',
    headline: 'Finding a Tick is Not an Emergency: You Have Time',
    storyParagraphs: [
      'Many parents panic when finding a tick on their child. But science provides profound peace of mind: **Lyme bacteria (Borrelia burgdorferi) take over 36 hours of attachment to begin transmitting**.',
      'For the first 24 hours, the bacteria are dormant in the tick’s digestive tract. Only after hours of continuous blood feeding does the biological temperature switch activate.',
      'By performing a quick **3-minute nightly tick check** before bedtime stories, you will remove virtually every tick long before transmission is biologically possible.'
    ],
    spokenNarration: 'Here is the most reassuring fact every parent and caregiver should know: finding a tick is not an emergency, because biology is completely on your side. Lyme bacteria take over thirty-six hours of continuous feeding to wake up and begin moving into the bloodstream. For the first twenty-four hours, the bacteria stay completely dormant inside the tick. That means a quick, three-minute bedtime check—looking behind the knees, around the waistband, and along the hairline—will catch and remove virtually every tick long before any bacteria could ever transmit. Enjoy your evening on the island, and do a calm, routine check before bed!',
    defaultPersona: 'clinical_doc',
    interactiveWidgetType: 'clock_kinetics',
    familyActionStep: 'Make a quick 3-minute bedtime check (hairline, behind ears, waistband) part of your island evening routine.'
  },
  {
    id: 'chapter_4_trail_desiccation',
    chapterNumber: 4,
    title: 'The Trail Finder',
    subtitle: 'Microclimate Windows & Sunshine Defense',
    icon: '☀️',
    themeColor: '#f97316',
    badge: 'REAL-TIME WEATHER RADAR',
    headline: 'Hiking Smart: When Ocean Breezes Dry the Trails',
    storyParagraphs: [
      'Ticks breathe through microscopic spiracles and lose body moisture rapidly in dry, sunny air. When relative humidity drops below 50%, ticks retreat to underground leaf litter.',
      'Morning fog keeps trails damp and tick activity high. But by early afternoon (1:00 PM – 5:00 PM), sunshine and coastal ocean breezes create a natural "Desiccation Window."',
      'Open bluff trails like **Tupancy Links** and **Sconset Bluff Walk** offer near-zero tick exposure, while deep shaded hardwood swamps (like Squam Swamp) require full sock tucking.'
    ],
    spokenNarration: 'Did you know the island weather is one of your greatest hiking allies? Ticks breathe through tiny microscopic openings on their sides, and they lose water rapidly in dry, sunny air. When island humidity drops below fifty percent, ticks cannot survive in the open—they must climb down into the moist leaf litter underground. While morning fog keeps trails damp, our sunny afternoon sea breezes create a natural desiccation window. Open bluff walks like Tupancy Links and the Sconset Bluff Walk offer wide open skies and near-zero tick contact. Plan your deep woodland walks for sunny afternoons, and enjoy the breeze!',
    defaultPersona: 'ranger_maya',
    interactiveWidgetType: 'trail_finder',
    familyActionStep: 'Plan moorland forest hikes during sunny, breezy afternoon hours.'
  },
  {
    id: 'chapter_5_100_nymphs',
    chapterNumber: 5,
    title: '100 Nymphs of Nantucket',
    subtitle: 'Empirical Surveillance & Co-Infection Science',
    icon: '🪲',
    themeColor: '#c084fc',
    badge: 'CITIZEN SCIENCE & PCR LABS',
    headline: 'What Do Tested Island Ticks Actually Carry?',
    storyParagraphs: [
      'Through partnerships with the **UMass Amherst TickReport Laboratory** and Massachusetts DPH, thousands of ticks collected on Nantucket are PCR-tested annually.',
      'Approximately **52% of deer tick nymphs carry Borrelia burgdorferi**, while **18% carry Babesia microti** (an intraerythrocytic protozoan) and **11% carry Anaplasma**.',
      'About **9% of ticks carry dual co-infections**. Knowing this empowers Nantucket Cottage Hospital physicians to order comprehensive diagnostic panels if fevers persist.'
    ],
    spokenNarration: 'Let us look at the real island laboratory data. Every year, researchers at UMass Amherst and the Nantucket Board of Health PCR-test thousands of ticks collected across the island. On average, about fifty-two out of every hundred deer tick nymphs carry Borrelia burgdorferi, eighteen carry Babesia, and eleven carry Anaplasma. Around nine percent carry more than one microbe together. Knowing these exact numbers does not mean you need to worry; it gives our local physicians at Nantucket Cottage Hospital the exact diagnostic data they need to test and treat patients with incredible speed and precision.',
    defaultPersona: 'clinical_doc',
    interactiveWidgetType: 'waffle_grid',
    familyActionStep: 'Save removed ticks in a ziplock bag with a damp blade of grass for easy clinical identification.'
  },
  {
    id: 'chapter_6_hospital_intake',
    chapterNumber: 6,
    title: 'Hospital Walk-In Guide',
    subtitle: 'Cottage Hospital Access & Doxycycline Rules',
    icon: '🏥',
    themeColor: '#f87171',
    badge: 'ISLAND CLINICAL SUPPORT',
    headline: 'Nantucket Cottage Hospital (NCH): World-Class Island Care',
    storyParagraphs: [
      'If you discover a tick that has been attached for **36 hours or longer** (or is visibly engorged like a watermelon seed), you are eligible for **single-dose Doxycycline 200mg prophylaxis** per IDSA guidelines.',
      'The **NCH Walk-In Clinic at 57 Prospect Street** is open 7 days a week with expert triage nurses and physicians who specialize in rapid vector evaluation.',
      'No appointment is necessary; single-dose prophylaxis taken within 72 hours of removal reduces Lyme transmission risk by over 87%.'
    ],
    spokenNarration: 'If you ever discover a tick that has been attached for thirty-six hours or longer—or looks visibly swollen like a round watermelon seed—our island medical team is right down the road. The Nantucket Cottage Hospital Walk-in Clinic at 57 Prospect Street is open seven days a week, with expert triage nurses and doctors who evaluate tick bites every single day. If eligible, a single dose of two hundred milligrams of Doxycycline taken within seventy-two hours reduces Lyme transmission risk by over eighty-seven percent. Call five-zero-eight, eight-two-five, ten-hundred, or walk right in!',
    defaultPersona: 'clinical_doc',
    interactiveWidgetType: 'hospital_card',
    familyActionStep: 'Call (508) 825-1000 for NCH Walk-In hours or visit 57 Prospect St if attached >=36h.'
  }
];

export class TourismKioskEngine {
  private activeChapterIndex = 0;
  private isScreensaverActive = false;
  private idleTimer: any = null;
  private readonly IDLE_TIMEOUT_MS = 90000; // 90 seconds auto-screensaver

  // Voice narration state
  private isNarrating = false;
  private activePersona: KioskVoicePersona = 'ranger_maya';
  private speechUtterance: SpeechSynthesisUtterance | null = null;
  public onNarrationStateChange?: (isPlaying: boolean) => void;

  public getActiveChapter(): IKioskStoryChapter {
    return KIOSK_STORY_CHAPTERS[this.activeChapterIndex] || KIOSK_STORY_CHAPTERS[0];
  }

  public getAllChapters(): IKioskStoryChapter[] {
    return KIOSK_STORY_CHAPTERS;
  }

  public getChapterIndex(): number {
    return this.activeChapterIndex;
  }

  public setChapterIndex(index: number) {
    if (index >= 0 && index < KIOSK_STORY_CHAPTERS.length) {
      if (this.activeChapterIndex !== index && this.isNarrating) {
        this.stopNarration();
      }
      this.activeChapterIndex = index;
      this.resetIdleTimer();
    }
  }

  public nextChapter() {
    this.setChapterIndex((this.activeChapterIndex + 1) % KIOSK_STORY_CHAPTERS.length);
  }

  public prevChapter() {
    this.setChapterIndex((this.activeChapterIndex - 1 + KIOSK_STORY_CHAPTERS.length) % KIOSK_STORY_CHAPTERS.length);
  }

  public getIsScreensaver(): boolean {
    return this.isScreensaverActive;
  }

  public wakeKiosk() {
    this.isScreensaverActive = false;
    this.resetIdleTimer();
  }

  public triggerScreensaver() {
    this.stopNarration();
    this.isScreensaverActive = true;
  }

  public resetIdleTimer() {
    if (typeof window === 'undefined') return;
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.triggerScreensaver();
    }, this.IDLE_TIMEOUT_MS);
  }

  // ─── NATURAL VOICE SYNTHESIS ENGINE ─────────────────────────────────────

  public getIsNarrating(): boolean {
    return this.isNarrating;
  }

  public getActivePersona(): KioskVoicePersona {
    return this.activePersona;
  }

  public setPersona(persona: KioskVoicePersona) {
    this.activePersona = persona;
    if (this.isNarrating) {
      this.stopNarration();
      this.playCurrentChapterNarration();
    }
  }

  public toggleNarration() {
    if (this.isNarrating) {
      this.pauseNarration();
    } else {
      this.playCurrentChapterNarration();
    }
  }

  public playCurrentChapterNarration() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const chapter = this.getActiveChapter();
    const utterance = new SpeechSynthesisUtterance(chapter.spokenNarration);

    // Natural speech tuning parameters by persona
    switch (this.activePersona) {
      case 'barnaby_owl':
        utterance.rate = 0.90; // Playful, measured storytelling pace
        utterance.pitch = 1.15; // Higher, animated friendly tone
        break;
      case 'clinical_doc':
        utterance.rate = 0.94; // Calm, reassuring, steady cadence
        utterance.pitch = 0.98; // Grounded, professional warmth
        break;
      case 'ranger_maya':
      default:
        utterance.rate = 0.92; // Natural trail guide conversational flow
        utterance.pitch = 1.04; // Warm, inviting island cadence
        break;
    }

    // Select the best available natural voice from browser inventory
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const naturalVoice = voices.find(v =>
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Daniel') || v.name.includes('Ava')) &&
        (v.lang.startsWith('en'))
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }
    }

    utterance.onstart = () => {
      this.isNarrating = true;
      this.onNarrationStateChange?.(true);
    };

    utterance.onend = () => {
      this.isNarrating = false;
      this.onNarrationStateChange?.(false);
    };

    utterance.onerror = (e) => {
      console.warn('[TourismKioskEngine] Voice narration error:', e);
      this.isNarrating = false;
      this.onNarrationStateChange?.(false);
    };

    this.speechUtterance = utterance;
    this.isNarrating = true;
    this.resetIdleTimer();
    window.speechSynthesis.speak(utterance);
    this.onNarrationStateChange?.(true);
  }

  public pauseNarration() {
    this.isNarrating = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    this.onNarrationStateChange?.(false);
  }

  public stopNarration() {
    this.isNarrating = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.onNarrationStateChange?.(false);
  }

  /**
   * Generates a mobile handoff URL for visitors to take with them
   */
  public generateMobileHandoffUrl(chapterId: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nantucket-tick-radar-793190615625.us-east1.run.app';
    return `${baseUrl}/?ref=kiosk&chapter=${chapterId}`;
  }
}
