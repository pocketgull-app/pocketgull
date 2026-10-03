import { Injectable, signal, computed } from '@angular/core';

export type VernacularLanguageCode = 'en' | 'es' | 'hi' | 'sw' | 'ar';
export type TextDirection = 'ltr' | 'rtl';
export type TriageAcuityColor = 'RED' | 'YELLOW' | 'GREEN';

export interface IVernacularLanguageSpec {
  code: VernacularLanguageCode;
  bcp47: string;
  name: string;
  nativeName: string;
  flagEmoji: string;
  direction: TextDirection;
  region: string;
  primaryAgency: string; // e.g. "WHO Afro", "MSF Jordan", "UNICEF India", "PAHO"
}

export interface IVernacularPrompt {
  languageCode: VernacularLanguageCode;
  language: IVernacularLanguageSpec;
  promptText: string;
  englishMeaning: string;
  phoneticGuide: string;
  acuityTier: TriageAcuityColor;
  direction: TextDirection;
  headline: string;
  audioDurationSecEst: number;
}

export interface ITriageVoiceContext {
  module: 'malnutrition_muac' | 'pneumonia_timer' | 'dehydration_ors' | 'danger_signs' | 'pediatric_dosing';
  muacTier?: 'SEVERE_ACUTE_MALNUTRITION' | 'MODERATE_ACUTE_MALNUTRITION' | 'WELL_NOURISHED';
  muacMm?: number;
  rutfSachets?: number;
  childWeightKg?: number;
  childAgeMonths?: number;
  pneumoniaClassification?: 'SEVERE_PNEUMONIA' | 'PNEUMONIA' | 'NO_PNEUMONIA';
  respiratoryBpm?: number;
  dehydrationPlan?: 'PLAN_A' | 'PLAN_B' | 'PLAN_C';
  orsVolumeMl?: number;
  hasDangerSigns?: boolean;
  dangerFlagNames?: string[];
  pediatricMedication?: 'artemether_lumefantrine' | 'ors_rehydration' | 'zinc_sulfate' | 'amoxicillin_dispersible';
  tabletsPerDose?: number;
  totalTablets?: number;
  doseMg?: number;
  isEligible?: boolean;
}

export const FRONTLINE_TOP5_LANGUAGES: IVernacularLanguageSpec[] = [
  {
    code: 'en',
    bcp47: 'en-US',
    name: 'English',
    nativeName: 'English (Plain)',
    flagEmoji: '🇺🇸',
    direction: 'ltr',
    region: 'Global / Humanitarian Standard',
    primaryAgency: 'WHO Headquarters / UNICEF'
  },
  {
    code: 'es',
    bcp47: 'es-MX',
    name: 'Spanish',
    nativeName: 'Español',
    flagEmoji: '🇲🇽',
    direction: 'ltr',
    region: 'Latin America & Caribbean',
    primaryAgency: 'PAHO (Pan American Health Organization)'
  },
  {
    code: 'hi',
    bcp47: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flagEmoji: '🇮🇳',
    direction: 'ltr',
    region: 'South Asia / Indo-Gangetic Basin',
    primaryAgency: 'National Health Mission / ASHA'
  },
  {
    code: 'sw',
    bcp47: 'sw-KE',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    flagEmoji: '🇰🇪',
    direction: 'ltr',
    region: 'East & Central Africa / Great Lakes',
    primaryAgency: 'WHO Afro / MSF East Africa'
  },
  {
    code: 'ar',
    bcp47: 'ar-SA',
    name: 'Arabic',
    nativeName: 'العربية',
    flagEmoji: '🇸🇦',
    direction: 'rtl',
    region: 'Middle East & North Africa (MENA)',
    primaryAgency: 'WHO EMRO / MSF Middle East'
  }
];

@Injectable({
  providedIn: 'root'
})
export class FrontlineVernacularVoiceService {
  /** Top 5 WHO/MSF Frontline Languages */
  public readonly languages = signal<IVernacularLanguageSpec[]>(FRONTLINE_TOP5_LANGUAGES);

  /** Currently selected vernacular language */
  public readonly activeLanguageCode = signal<VernacularLanguageCode>('en');

  /** Whether audio speech is currently active */
  public readonly isSpeaking = signal<boolean>(false);

  /** Last spoken prompt text */
  public readonly lastSpokenText = signal<string>('');

  /** Active audio playback error message if any */
  public readonly audioErrorMessage = signal<string | null>(null);

  /** Currently resolved language spec */
  public readonly activeLanguage = computed<IVernacularLanguageSpec>(() => {
    const code = this.activeLanguageCode();
    return this.languages().find(l => l.code === code) || this.languages()[0];
  });

  /** Whether the browser environment supports offline SpeechSynthesis */
  public readonly isSpeechSupported = computed<boolean>(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  });

  private audioCtx: AudioContext | null = null;

  /**
   * Switches the active frontline language.
   */
  public setLanguage(code: VernacularLanguageCode): void {
    this.activeLanguageCode.set(code);
    if (this.isSpeaking()) {
      this.stopSpeaking();
    }
  }

  /**
   * Generates localized vernacular spoken and visual guidance for the given clinical triage state.
   */
  public generateTriagePrompt(context: ITriageVoiceContext, langCode?: VernacularLanguageCode): IVernacularPrompt {
    const code = langCode || this.activeLanguageCode();
    const lang = this.languages().find(l => l.code === code) || this.languages()[0];

    switch (context.module) {
      case 'malnutrition_muac':
        return this.buildMuacPrompt(context, lang);
      case 'pneumonia_timer':
        return this.buildPneumoniaPrompt(context, lang);
      case 'dehydration_ors':
        return this.buildDehydrationPrompt(context, lang);
      case 'danger_signs':
        return this.buildDangerSignsPrompt(context, lang);
      case 'pediatric_dosing':
        return this.buildPediatricDosingPrompt(context, lang);
      default:
        return this.buildMuacPrompt(context, lang);
    }
  }

  /**
   * Synthesizes offline audio guidance using W3C Web Speech API with fallback acoustic chime.
   */
  public async speakPrompt(text: string, langCode?: VernacularLanguageCode): Promise<void> {
    const code = langCode || this.activeLanguageCode();
    const lang = this.languages().find(l => l.code === code) || this.languages()[0];

    this.audioErrorMessage.set(null);

    // Defensive check for server-side or non-window environments
    if (typeof window === 'undefined') {
      return;
    }

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang.bcp47;
        utterance.rate = 0.92; // Slightly paced for field clinic clarity
        utterance.pitch = 1.0;

        // Try to match matching voice from speech synthesis voices
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(v =>
          v.lang.toLowerCase().startsWith(code) ||
          v.lang.toLowerCase().replace('_', '-').startsWith(lang.bcp47.toLowerCase())
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.onstart = () => {
          this.isSpeaking.set(true);
          this.lastSpokenText.set(text);
        };

        utterance.onend = () => {
          this.isSpeaking.set(false);
        };

        utterance.onerror = (e) => {
          console.warn('[Vernacular Voice] SpeechSynthesis error:', e);
          this.isSpeaking.set(false);
          this.playAcousticAttentionCue(lang.code === 'ar' ? 440 : 528);
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err: unknown) {
        console.warn('[Vernacular Voice] SpeechSynthesis exception, falling back to acoustic chime:', err);
        this.audioErrorMessage.set('Audio synthesis fallback engaged.');
      }
    }

    // Fallback if SpeechSynthesis is not supported on thin client
    this.playAcousticAttentionCue(528);
    this.isSpeaking.set(true);
    this.lastSpokenText.set(text);
    setTimeout(() => {
      this.isSpeaking.set(false);
    }, 2500);
  }

  /**
   * Halts any active spoken utterance.
   */
  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking.set(false);
  }

  /**
   * Plays a calming 100% offline Web Audio synthesized chime for attention/pacing.
   */
  public playAcousticAttentionCue(freq = 528, durationMs = 350): void {
    if (typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, this.audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + (durationMs / 1000));

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + (durationMs / 1000));
    } catch {
      // AudioContext unavailable or restricted by browser policy
    }
  }

  /**
   * Alias for playAcousticAttentionCue for intuitive speech error fallback.
   */
  public playAcousticChime(freq = 528, durationMs = 350): void {
    this.playAcousticAttentionCue(freq, durationMs);
  }

  // ────────────────────────────────────────────────────────────────────────
  // Prompt Builders for the Top 5 Frontline Languages
  // ────────────────────────────────────────────────────────────────────────

  private buildMuacPrompt(context: ITriageVoiceContext, lang: IVernacularLanguageSpec): IVernacularPrompt {
    const tier = context.muacTier || 'WELL_NOURISHED';
    const sachets = context.rutfSachets || 2;
    const mm = context.muacMm || 130;

    if (tier === 'SEVERE_ACUTE_MALNUTRITION') {
      const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
        en: {
          headline: '🔴 RED ALERT: Severe Malnutrition',
          text: `Red Alert. Severe acute malnutrition detected. Arm measurement is ${mm} millimeters. Give ${sachets} sachets of therapeutic paste daily. Provide clean water and transfer urgently to hospital.`,
          english: `Red Alert. Severe acute malnutrition detected (${mm} mm). Prescribe ${sachets} sachets of RUTF daily and refer urgently.`,
          phonetic: 'Rɛd əˈlɜːrt. Sɪˈvɪr əˈkjuːt mælnjuːˈtrɪʃən dɪˈtɛktɪd.'
        },
        es: {
          headline: '🔴 ALERTA ROJA: Desnutrición Severa',
          text: `Alerta roja. Desnutrición aguda severa detectada. Medida del brazo: ${mm} milímetros. Administre ${sachets} sobres de pasta terapéutica cada día. Dé agua limpia y traslade de inmediato al centro de salud.`,
          english: `Red Alert. Severe acute malnutrition detected (${mm} mm). Administer ${sachets} RUTF sachets/day and transfer immediately.`,
          phonetic: 'Ah-LEHR-tah ROH-hah. Dehs-noo-tree-SYOHN ah-GOO-dah seh-VEH-rah.'
        },
        hi: {
          headline: '🔴 लाल चेतावनी: गंभीर कुपोषण',
          text: `लाल चेतावनी। गंभीर कुपोषण पाया गया है। बांह का माप ${mm} मिलीमीटर है। बच्चे को प्रतिदिन ${sachets} पैकेट पोषण पेस्ट दें। साफ पानी दें और तुरंत अस्पताल ले जाएं।`,
          english: `Red Alert. Severe acute malnutrition found (${mm} mm). Give ${sachets} nutrition packets daily and take to hospital immediately.`,
          phonetic: 'Laal chetavani. Gambhir kuposhan paya gaya hai.'
        },
        sw: {
          headline: '🔴 ONYO JEKUNDU: Utapiamlo Mkali',
          text: `Onyo jekundu. Utapiamlo mkali wa papo hapo umegunduliwa. Kipimo cha mkono ni milimita ${mm}. Mpe mtoto mifuko ${sachets} ya lishe ya Plumpy'Nut kila siku. Mpe maji safi na umpeleke kituo cha afya haraka sana.`,
          english: `Red Alert. Severe acute malnutrition detected (${mm} mm). Give child ${sachets} sachets of Plumpy'Nut daily and transfer to health center.`,
          phonetic: 'OHN-yoh jeh-KOON-doo. Oo-tah-pee-ah-MLOH m-KAH-lee.'
        },
        ar: {
          headline: '🔴 تحذير أحمر: سوء تغذية حاد',
          text: `تحذير أحمر. سوء تغذية حاد وشديد. قياس محيط الذراع ${mm} مليمتر. أعطِ الطفل ${sachets} أكياس من معجون التغذية بلومبي نت يومياً، وقدّم ماءً نظيفاً وانقله فوراً إلى أقرب مركز صحي.`,
          english: `Red Alert. Severe acute malnutrition detected (${mm} mm). Give child ${sachets} packets of RUTF daily, provide clean water, and transfer to clinic.`,
          phonetic: 'Tah-dheer AH-hmar. Soo tagh-dhi-yah HAAD.'
        }
      };
      const p = prompts[lang.code] || prompts.en;
      return {
        languageCode: lang.code,
        language: lang,
        headline: p.headline,
        promptText: p.text,
        englishMeaning: p.english,
        phoneticGuide: p.phonetic,
        acuityTier: 'RED',
        direction: lang.direction,
        audioDurationSecEst: 8
      };
    } else if (tier === 'MODERATE_ACUTE_MALNUTRITION') {
      const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
        en: {
          headline: '🟡 YELLOW ALERT: Moderate Malnutrition',
          text: `Yellow Alert. Moderate malnutrition. Arm measurement is ${mm} millimeters. Continue nutrient-dense family foods, enriched porridge, and supplemental feeding. Re-check in seven days.`,
          english: `Yellow Alert. Moderate malnutrition (${mm} mm). Give nutrient-dense family meals and return in 7 days for re-weighing.`,
          phonetic: 'ˈJɛloʊ əˈlɜːrt. ˈMɑːdərət mælnjuːˈtrɪʃən.'
        },
        es: {
          headline: '🟡 ALERTA AMARILLA: Desnutrición Moderada',
          text: `Alerta amarilla. Desnutrición moderada. Medida del brazo: ${mm} milímetros. Continúe con alimentos nutritivos, papillas enriquecidas y lactancia. Regrese para control en siete días.`,
          english: `Yellow Alert. Moderate malnutrition (${mm} mm). Continue nutritious food and breastfeeding. Review in 7 days.`,
          phonetic: 'Ah-LEHR-tah ah-mah-REE-yah. Dehs-noo-tree-SYOHN moh-deh-RAH-dah.'
        },
        hi: {
          headline: '🟡 पीली चेतावनी: मध्यम कुपोषण',
          text: `पीली चेतावनी। मध्यम कुपोषण। बांह का माप ${mm} मिलीमीटर है। पौष्टिक आहार, दाल-दलिया और स्तनपान जारी रखें। सात दिनों के बाद दोबारा वजन कराएं।`,
          english: `Yellow Alert. Moderate malnutrition (${mm} mm). Continue nutritious food, porridge, and breastfeeding. Re-check in 7 days.`,
          phonetic: 'Peeli chetavani. Madhyam kuposhan.'
        },
        sw: {
          headline: '🟡 ONYO LA NJANO: Utapiamlo wa Wastani',
          text: `Onyo la njano. Utapiamlo wa wastani. Kipimo cha mkono ni milimita ${mm}. Endelea kumpa mtoto vyakula vyenye virutubisho, uji ulioimarishwa, na maziwa ya mama. Rudi kupimwa tena baada ya siku saba.`,
          english: `Yellow Alert. Moderate malnutrition (${mm} mm). Continue nutrient-dense meals and enriched porridge. Re-check in 7 days.`,
          phonetic: 'OHN-yoh lah NJAH-noh. Oo-tah-pee-ah-MLOH wah wah-STAH-nee.'
        },
        ar: {
          headline: '🟡 تحذير أصفر: سوء تغذية معتدل',
          text: `تحذير أصفر. سوء تغذية معتدل. قياس الذراع ${mm} مليمتر. استمر في تقديم الأطعمة المغذية والعصيدة المدعمة والرضاعة الطبيعية. يجب إعادة الفحص بعد سبعة أيام.`,
          english: `Yellow Alert. Moderate malnutrition (${mm} mm). Continue nutrient-dense food and enriched porridge. Return for check in 7 days.`,
          phonetic: 'Tah-dheer AS-far. Soo tagh-dhi-yah moo-tah-DILL.'
        }
      };
      const p = prompts[lang.code] || prompts.en;
      return {
        languageCode: lang.code,
        language: lang,
        headline: p.headline,
        promptText: p.text,
        englishMeaning: p.english,
        phoneticGuide: p.phonetic,
        acuityTier: 'YELLOW',
        direction: lang.direction,
        audioDurationSecEst: 7
      };
    } else {
      const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
        en: {
          headline: '🟢 GREEN STATUS: Well Nourished',
          text: `Green Status. Normal arm measurement of ${mm} millimeters. Continue healthy diverse diet, safe drinking water, and routine immunizations.`,
          english: `Green Status. Child is well nourished (${mm} mm). Maintain balanced family diet and clean water.`,
          phonetic: 'Griːn ˈsteɪtəs. Wɛl ˈnɜːrɪʃt.'
        },
        es: {
          headline: '🟢 ESTADO VERDE: Bien Nutrito',
          text: `Estado verde. Medida normal del brazo de ${mm} milímetros. Mantenga una alimentación variada y saludable, agua limpia y vacunas al día.`,
          english: `Green Status. Arm measurement is normal (${mm} mm). Continue healthy diverse meals and vaccinations.`,
          phonetic: "Ehs-TAH-doh VEHR-deh. B'yehn noo-TREE-doh."
        },
        hi: {
          headline: '🟢 हरी स्थिति: सामान्य पोषण',
          text: `हरी स्थिति। बांह का माप ${mm} मिलीमीटर सामान्य है। बच्चे को विविध और पौष्टिक भोजन, साफ पानी और नियमित टीके दें।`,
          english: `Green Status. Arm measurement is normal (${mm} mm). Continue diverse nutritious meals and routine vaccines.`,
          phonetic: 'Hari sthiti. Samanya poshan.'
        },
        sw: {
          headline: '🟢 HALI YA KIJANI: Lishe Nzuri',
          text: `Hali ya kijani. Kipimo cha mkono cha milimita ${mm} ni cha kawaida. Mtoto ana lishe nzuri. Endelea kumpa lishe bora, maji safi na salama, na chanjo zote za kawaida.`,
          english: `Green Status. Normal arm measurement (${mm} mm). Child is well nourished. Maintain balanced food and vaccines.`,
          phonetic: 'HAH-lee yah kee-JAH-nee. LEE-sheh n-ZOO-ree.'
        },
        ar: {
          headline: '🟢 حالة خضراء: تغذية جيدة',
          text: `حالة خضراء. قياس الذراع طبيعي بمعدل ${mm} مليمتر. تغذية الطفل جيدة. استمر في التغذية المتوازنة والمياه النظيفة والتطعيمات الدورية.`,
          english: `Green Status. Normal arm measurement (${mm} mm). Child is well nourished. Maintain healthy diet and vaccinations.`,
          phonetic: 'HAH-lah KHAD-rah. Tagh-dhi-yah JAY-yi-dah.'
        }
      };
      const p = prompts[lang.code] || prompts.en;
      return {
        languageCode: lang.code,
        language: lang,
        headline: p.headline,
        promptText: p.text,
        englishMeaning: p.english,
        phoneticGuide: p.phonetic,
        acuityTier: 'GREEN',
        direction: lang.direction,
        audioDurationSecEst: 6
      };
    }
  }

  private buildPneumoniaPrompt(context: ITriageVoiceContext, lang: IVernacularLanguageSpec): IVernacularPrompt {
    const classification = context.pneumoniaClassification || 'NO_PNEUMONIA';
    const bpm = context.respiratoryBpm || 36;

    if (classification === 'SEVERE_PNEUMONIA') {
      const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
        en: {
          headline: '🔴 RED ALERT: Severe Pneumonia',
          text: `Emergency alert. Fast breathing with chest indrawing detected. Rate is ${bpm} breaths per minute. Give first dose of oral amoxicillin and refer urgently to hospital.`,
          english: `Emergency alert. Fast breathing (${bpm} bpm) with chest indrawing. Administer first amoxicillin dose and transfer to hospital immediately.`,
          phonetic: 'ɪˈmɜːrdʒənsi əˈlɜːrt. Sɪˈvɪr njuːˈmoʊnjə.'
        },
        es: {
          headline: '🔴 ALERTA ROJA: Neumonía Grave',
          text: `Alerta de emergencia. Respiración rápida con tiraje en el pecho detectada. ${bpm} respiraciones por minuto. Administre la primera dosis de amoxicilina y traslade urgente al hospital.`,
          english: `Emergency alert. Fast breathing (${bpm} bpm) with chest indrawing. Give first amoxicillin dose and refer urgently.`,
          phonetic: 'Ah-LEHR-tah deh eh-mehr-HEHN-syah. Neh-oo-moh-NEE-ah GRAH-veh.'
        },
        hi: {
          headline: '🔴 लाल चेतावनी: गंभीर निमोनिया',
          text: `आपातकालीन चेतावनी। सीने का धंसना और तेज सांस। सांस की गति ${bpm} प्रति मिनट है। अमोक्सिसिलिन की पहली खुराक दें और तुरंत अस्पताल ले जाएं।`,
          english: `Emergency alert. Fast breathing (${bpm} bpm) with chest indrawing. Give first dose of amoxicillin and rush to hospital.`,
          phonetic: 'Aapatkaleen chetavani. Gambhir nimoniya.'
        },
        sw: {
          headline: '🔴 ONYO JEKUNDU: Nimonia Kali',
          text: `Dharura ya haraka. Kupumua kwa kasi na kifua kinachovutika ndani. Pumzi ${bpm} kwa dakika. Mpe mtoto dozi ya kwanza ya amoksisilini na umpeleke hospitali mara moja bila kuchelewa.`,
          english: `Urgent emergency. Fast breathing (${bpm} bpm) with chest indrawing. Give first amoxicillin dose and take to hospital without delay.`,
          phonetic: 'Dhah-ROO-rah yah HAH-rah-kah. Nee-MOH-nee-ah KAH-lee.'
        },
        ar: {
          headline: '🔴 طوارئ قصوى: التهاب رئوي شديد',
          text: `طوارئ قصوى. تنفس سريع مع انسحاب الصدر إلى الداخل. معدل التنفس ${bpm} نَفَس في الدقيقة. أعطِ الجرعة الأولى من أموكسيسيلين وانقل الطفل فوراً للمستشفى.`,
          english: `Critical emergency. Fast breathing (${bpm} bpm) with chest indrawing. Administer first dose of amoxicillin and rush to hospital immediately.`,
          phonetic: 'Tawah-ree QOOS-wah. Il-ti-HAAB re-a-WEE shah-DEED.'
        }
      };
      const p = prompts[lang.code] || prompts.en;
      return {
        languageCode: lang.code,
        language: lang,
        headline: p.headline,
        promptText: p.text,
        englishMeaning: p.english,
        phoneticGuide: p.phonetic,
        acuityTier: 'RED',
        direction: lang.direction,
        audioDurationSecEst: 8
      };
    } else if (classification === 'PNEUMONIA') {
      const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
        en: {
          headline: '🟡 YELLOW ALERT: Pneumonia (Fast Breathing)',
          text: `Pneumonia identified with fast breathing of ${bpm} breaths per minute. Give oral amoxicillin dispersible tablets twice daily for three days. Watch closely for danger signs.`,
          english: `Pneumonia identified with fast breathing (${bpm} bpm). Give dispersible amoxicillin twice daily for 3 days and monitor danger signs.`,
          phonetic: 'Njuːˈmoʊnjə aɪˈdɛntɪfaɪd wɪð fæst ˈbriːðɪŋ.'
        },
        es: {
          headline: '🟡 ALERTA AMARILLA: Neumonía (Respiración Rápida)',
          text: `Neumonía identificada por respiración rápida de ${bpm} respiraciones por minuto. Administre amoxicilina en tabletas dispersables dos veces al día por tres días. Vigile signos de alarma.`,
          english: `Pneumonia identified by fast breathing (${bpm} bpm). Administer amoxicillin dispersible tablets twice daily for 3 days.`,
          phonetic: 'Neh-oo-moh-NEE-ah ee-dehn-tee-fee-KAH-dah.'
        },
        hi: {
          headline: '🟡 पीली चेतावनी: निमोनिया (तेज सांस)',
          text: `निमोनिया की पहचान। तेज सांस की गति ${bpm} प्रति मिनट। तीन दिनों तक दिन में दो बार अमोक्सिसिलिन गोली दें। खतरे के लक्षणों पर नजर रखें।`,
          english: `Pneumonia identified. Fast breathing (${bpm} bpm). Give amoxicillin dispersible tablet twice daily for 3 days.`,
          phonetic: 'Nimoniya ki pehchan. Tej saans.'
        },
        sw: {
          headline: '🟡 ONYO LA NJANO: Nimonia (Pumzi ya Kasi)',
          text: `Nimonia imegunduliwa kwa kupumua kwa haraka kwa pumzi ${bpm} kwa dakika. Mpe vidonge vya amoksisilini mara mbili kwa siku kwa siku tatu. Angalia dalili za hatari.`,
          english: `Pneumonia identified with fast breathing (${bpm} bpm). Give amoxicillin tablets twice daily for 3 days. Monitor danger signs.`,
          phonetic: 'Nee-MOH-nee-ah ee-meh-goon-doo-LEE-wah.'
        },
        ar: {
          headline: '🟡 تحذير أصفر: التهاب رئوي (تنفس سريع)',
          text: `تم تشخيص التهاب رئوي مع تنفس سريع بمعدل ${bpm} نَفَس في الدقيقة. أعطِ حبوب أموكسيسيلين القابلة للذوبان مرتين يومياً لمدة ثلاثة أيام وراقب علامات الخطر.`,
          english: `Pneumonia diagnosed with fast breathing (${bpm} bpm). Give amoxicillin dispersible tablets twice daily for 3 days and monitor for danger signs.`,
          phonetic: 'Il-ti-HAAB re-a-WEE ma-a tah-NAF-foos sah-REE.'
        }
      };
      const p = prompts[lang.code] || prompts.en;
      return {
        languageCode: lang.code,
        language: lang,
        headline: p.headline,
        promptText: p.text,
        englishMeaning: p.english,
        phoneticGuide: p.phonetic,
        acuityTier: 'YELLOW',
        direction: lang.direction,
        audioDurationSecEst: 7
      };
    } else {
      const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
        en: {
          headline: '🟢 GREEN STATUS: No Pneumonia',
          text: `No pneumonia. Breathing rate of ${bpm} is within normal range. Soothe cough with safe warm home fluids or honey. No antibiotics needed.`,
          english: `No pneumonia. Normal breathing rate (${bpm} bpm). Soothe cough with warm fluids. No antibiotics indicated.`,
          phonetic: 'Noʊ njuːˈmoʊnjə. ˈNɔːrməl ˈbriːðɪŋ reɪt.'
        },
        es: {
          headline: '🟢 ESTADO VERDE: Sin Neumonía',
          text: `Sin neumonía. La respiración de ${bpm} está dentro del rango normal. Alivie la tos con líquidos tibios seguros o miel. No necesita antibióticos.`,
          english: `No pneumonia. Respiratory rate (${bpm} bpm) is normal. Soothe cough with warm liquids or honey. No antibiotics needed.`,
          phonetic: 'Seen neh-oo-moh-NEE-ah. Rehs-pee-rah-SYOHN nohr-MAHL.'
        },
        hi: {
          headline: '🟢 हरी स्थिति: निमोनिया नहीं है',
          text: `निमोनिया नहीं है। सांस की गति ${bpm} सामान्य है। गुनगुने पानी या शहद से गले को आराम दें। किसी एंटीबायोटिक की जरूरत नहीं है।`,
          english: `No pneumonia. Breathing rate (${bpm} bpm) is normal. Soothe throat with warm water or honey. No antibiotics needed.`,
          phonetic: 'Nimoniya nahi hai. Saans samanya hai.'
        },
        sw: {
          headline: '🟢 HALI YA KIJANI: Hakuna Nimonia',
          text: `Hakuna nimonia. Pumzi ${bpm} kwa dakika iko katika kiwango cha kawaida. Tuliza kikohozi kwa vinywaji vya uvuguvugu au asali. Hahitaji viuavijasumu.`,
          english: `No pneumonia. Respiratory rate (${bpm} bpm) is within normal range. Relieve cough with warm drinks. No antibiotics required.`,
          phonetic: 'Hah-KOO-nah nee-MOH-nee-ah. POOM-zee yah kah-WAH-ee-dah.'
        },
        ar: {
          headline: '🟢 حالة خضراء: لا يوجد التهاب رئوي',
          text: `لا يوجد التهاب رئوي. معدل التنفس ${bpm} في النطاق الطبيعي. هدئ السعال بالسوائل الدافئة أو العسل. لا حاجة للمضادات الحيوية.`,
          english: `No pneumonia. Respiratory rate (${bpm} bpm) is normal. Soothe cough with warm fluids. No antibiotics necessary.`,
          phonetic: 'Lah YOO-jad il-ti-HAAB re-a-WEE.'
        }
      };
      const p = prompts[lang.code] || prompts.en;
      return {
        languageCode: lang.code,
        language: lang,
        headline: p.headline,
        promptText: p.text,
        englishMeaning: p.english,
        phoneticGuide: p.phonetic,
        acuityTier: 'GREEN',
        direction: lang.direction,
        audioDurationSecEst: 6
      };
    }
  }

  private buildDehydrationPrompt(context: ITriageVoiceContext, lang: IVernacularLanguageSpec): IVernacularPrompt {
    const plan = context.dehydrationPlan || 'PLAN_A';
    const orsMl = context.orsVolumeMl || 600;

    if (plan === 'PLAN_C') {
      const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
        en: {
          headline: '🔴 RED ALERT: Severe Dehydration (Plan C)',
          text: `Severe Dehydration detected. Child is lethargic with very sunken eyes. Start IV fluids or continuous oral rehydration immediately and transfer urgently to hospital.`,
          english: `Severe Dehydration. Child is lethargic with sunken eyes. Start IV/ORS immediately and transfer urgently.`,
          phonetic: 'Sɪˈvɪr diːhaɪˈdreɪʃən dɪˈtɛktɪd.'
        },
        es: {
          headline: '🔴 ALERTA ROJA: Deshidratación Severa (Plan C)',
          text: `Deshidratación severa detectada. El niño está decaído y con ojos muy hundidos. Inicie suero intravenoso o suero oral continuo de inmediato y traslade al hospital.`,
          english: `Severe Dehydration detected. Child is lethargic with sunken eyes. Start IV fluids/ORS immediately and transfer to hospital.`,
          phonetic: 'Dehs-ee-drah-tah-SYOHN seh-VEH-rah deh-tehk-TAH-dah.'
        },
        hi: {
          headline: '🔴 लाल चेतावनी: गंभीर निर्जलीकरण (प्लान C)',
          text: `गंभीर निर्जलीकरण। बच्चा बहुत सुस्त है और आंखें धंसी हुई हैं। तुरंत आईवी ड्रिप या लगातार ओआरएस शुरू करें और बिना देरी अस्पताल ले जाएं।`,
          english: `Severe Dehydration. Child is very lethargic with sunken eyes. Start IV/ORS immediately and transfer to hospital without delay.`,
          phonetic: 'Gambhir nirjalikaran. Bachha sust hai.'
        },
        sw: {
          headline: '🔴 ONYO JEKUNDU: Upungufu Mkali wa Maji (Mpango C)',
          text: `Upungufu mkali wa maji mwilini umegunduliwa. Mtoto ni mnyonge sana na macho yamezama. Anzisha maji ya mshipa au ORS mfululizo sasa hivi na umpeleke hospitali haraka.`,
          english: `Severe Dehydration detected. Child is very lethargic with sunken eyes. Start IV or continuous ORS and take to hospital immediately.`,
          phonetic: 'Oo-POON-goo-foo m-KAH-lee wah MAH-jee.'
        },
        ar: {
          headline: '🔴 طوارئ: جفاف حاد وشديد (الخطة ج)',
          text: `جفاف حاد وشديد. الطفل فاقد للنشاط وخامل وعيناه غائرتان جداً. ابدأ المحاليل الوريدية أو محلول الجفاف فوراً وانقله على وجه السرعة إلى المستشفى.`,
          english: `Severe dehydration. Child is lethargic with sunken eyes. Start IV fluids or ORS immediately and transfer to hospital urgently.`,
          phonetic: 'Jah-FAAF haad wa sha-DEED.'
        }
      };
      const p = prompts[lang.code] || prompts.en;
      return {
        languageCode: lang.code,
        language: lang,
        headline: p.headline,
        promptText: p.text,
        englishMeaning: p.english,
        phoneticGuide: p.phonetic,
        acuityTier: 'RED',
        direction: lang.direction,
        audioDurationSecEst: 8
      };
    } else if (plan === 'PLAN_B') {
      const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
        en: {
          headline: '🟡 YELLOW ALERT: Moderate Dehydration (Plan B)',
          text: `Moderate dehydration. Give ${orsMl} milliliters of ORS rehydration solution slowly with cup or spoon over four hours. Give zinc tablet daily.`,
          english: `Moderate dehydration. Give ${orsMl} mL of ORS slowly over 4 hours. Give zinc tablet daily.`,
          phonetic: 'ˈMɑːdərət diːhaɪˈdreɪʃən. Gɪv oʊ-ɑːr-ɛs.'
        },
        es: {
          headline: '🟡 ALERTA AMARILLA: Deshidratación Moderada (Plan B)',
          text: `Deshidratación moderada. Administre ${orsMl} mililitros de suero oral lentamente con taza o cuchara durante cuatro horas. Dé una tableta de zinc al día.`,
          english: `Moderate dehydration. Administer ${orsMl} mL of oral rehydration salts slowly with cup or spoon over 4 hours and zinc daily.`,
          phonetic: 'Dehs-ee-drah-tah-SYOHN moh-deh-RAH-dah.'
        },
        hi: {
          headline: '🟡 पीली चेतावनी: मध्यम निर्जलीकरण (प्लान B)',
          text: `मध्यम निर्जलीकरण। चार घंटे में चम्मच या कटोरी से ${orsMl} मिलीलीटर ओआरएस घोल थोड़ा-थोड़ा पिलाएं। रोजाना जिंक की गोली अवश्य दें।`,
          english: `Moderate dehydration. Give ${orsMl} mL of ORS slowly with spoon/cup over 4 hours. Give zinc tablet daily.`,
          phonetic: 'Madhyam nirjalikaran. Chaar ghante mein ORS pilayein.'
        },
        sw: {
          headline: '🟡 ONYO LA NJANO: Upungufu wa Wastani wa Maji (Mpango B)',
          text: `Upungufu wa wastani wa maji mwilini. Mpe mtoto mililita ${orsMl} za suluhisho la ORS polepole kwa kikombe au kijiko kwa muda wa saa nne. Mpe kidonge cha zinki kila siku.`,
          english: `Moderate dehydration. Give child ${orsMl} mL of ORS solution slowly by cup or spoon over 4 hours. Give zinc tablet daily.`,
          phonetic: 'Oo-POON-goo-foo wah wah-STAH-nee wah MAH-jee.'
        },
        ar: {
          headline: '🟡 تحذير أصفر: جفاف معتدل (الخطة ب)',
          text: `جفاف معتدل. أعطِ الطفل ${orsMl} مليلتر من محلول الجفاف ببطء بالكوب أو الملعقة على مدار أربع ساعات، مع إعطاء حبة زنك يومياً.`,
          english: `Moderate dehydration. Give ${orsMl} mL of ORS slowly with cup/spoon over 4 hours, plus daily zinc tablet.`,
          phonetic: 'Jah-FAAF moo-tah-DILL. Khit-tah BAA.'
        }
      };
      const p = prompts[lang.code] || prompts.en;
      return {
        languageCode: lang.code,
        language: lang,
        headline: p.headline,
        promptText: p.text,
        englishMeaning: p.english,
        phoneticGuide: p.phonetic,
        acuityTier: 'YELLOW',
        direction: lang.direction,
        audioDurationSecEst: 7
      };
    } else {
      const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
        en: {
          headline: '🟢 GREEN BASELINE: No Dehydration (Plan A)',
          text: `No dehydration. Give extra home fluids and continue breastfeeding. Give zinc sulfate tablet daily for fourteen days to protect the gut.`,
          english: `No dehydration. Give extra home fluids, continue breastfeeding, and give daily zinc sulfate for 14 days.`,
          phonetic: 'Noʊ diːhaɪˈdreɪʃən. Pæn eɪ.'
        },
        es: {
          headline: '🟢 LÍNEA BASE VERDE: Sin Deshidratación (Plan A)',
          text: `Sin deshidratación. Dé líquidos adicionales en casa y continúe la lactancia materna. Administre tableta de zinc durante catorce días para proteger el intestino.`,
          english: `No dehydration. Give extra fluids at home and continue breastfeeding. Administer zinc tablet for 14 days.`,
          phonetic: 'Seen dehs-ee-drah-tah-SYOHN.'
        },
        hi: {
          headline: '🟢 हरी स्थिति: निर्जलीकरण नहीं है (प्लान A)',
          text: `निर्जलीकरण नहीं है। घर पर अधिक तरल पदार्थ और स्तनपान जारी रखें। आंत की सुरक्षा के लिए चौदह दिनों तक रोजाना जिंक की गोली दें।`,
          english: `No dehydration. Give extra home fluids and continue breastfeeding. Give daily zinc sulfate for 14 days.`,
          phonetic: 'Nirjalikaran nahi hai. Plan A.'
        },
        sw: {
          headline: '🟢 HALI YA KIJANI: Hakuna Upungufu wa Maji (Mpango A)',
          text: `Hakuna upungufu wa maji. Mpe mtoto vinywaji vya ziada nyumbani na uendelee kunyonyesha mara kwa mara. Mpe vidonge vya zinki kwa siku kumi na nne.`,
          english: `No dehydration. Give extra fluids at home and continue frequent breastfeeding. Give zinc tablets for 14 days.`,
          phonetic: 'Hah-KOO-nah oo-POON-goo-foo wah MAH-jee.'
        },
        ar: {
          headline: '🟢 حالة خضراء: لا يوجد جفاف (الخطة أ)',
          text: `لا يوجد جفاف. قدّم سوائل إضافية واستمر في الرضاعة الطبيعية بانتظام. أعطِ حبة كبريتات الزنك يومياً لمدة أربعة عشر يوماً لحماية الأمعاء.`,
          english: `No dehydration. Give extra fluids and continue breastfeeding. Give zinc sulfate tablet daily for 14 days.`,
          phonetic: 'Lah YOO-jad jah-FAAF. Khit-tah ALIF.'
        }
      };
      const p = prompts[lang.code] || prompts.en;
      return {
        languageCode: lang.code,
        language: lang,
        headline: p.headline,
        promptText: p.text,
        englishMeaning: p.english,
        phoneticGuide: p.phonetic,
        acuityTier: 'GREEN',
        direction: lang.direction,
        audioDurationSecEst: 6
      };
    }
  }

  private buildDangerSignsPrompt(context: ITriageVoiceContext, lang: IVernacularLanguageSpec): IVernacularPrompt {
    const hasDanger = context.hasDangerSigns || false;

    if (hasDanger) {
      const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
        en: {
          headline: '🔴 CRITICAL DANGER: Emergency Red Flags Present',
          text: `Critical danger signs detected. Child is vomiting everything, having convulsions, or unable to drink. Immediate emergency referral to hospital is required. Keep child warm.`,
          english: `Critical danger signs detected (convulsions, vomiting, unable to drink). Urgent hospital transfer required.`,
          phonetic: 'ˈKrɪtɪkəl ˈdeɪndʒər saɪnz dɪˈtɛktɪd.'
        },
        es: {
          headline: '🔴 PELIGRO CRÍTICO: Signos de Alarma Presentes',
          text: `Signos críticos de peligro detectados. El niño no puede beber, vomita todo o tiene convulsiones. Se requiere traslado inmediato y urgente al hospital. Mantenga al niño abrigado.`,
          english: `Critical danger signs detected (cannot drink, vomits everything, convulsions). Immediate hospital transfer required.`,
          phonetic: 'Peh-LEE-groh KREE-tee-koh. Seeg-nohs deh ah-LAHR-mah.'
        },
        hi: {
          headline: '🔴 अत्यधिक खतरा: आपातकालीन खतरे के संकेत',
          text: `अत्यधिक खतरे के लक्षण पाए गए हैं। बच्चा कुछ भी पी नहीं पा रहा, लगातार उल्टी कर रहा है या दौरे पड़ रहे हैं। तुरंत आपातकालीन अस्पताल ले जाएं। बच्चे को गर्म रखें।`,
          english: `Critical danger signs found (cannot drink, persistent vomiting, convulsions). Urgent hospital transfer required. Keep child warm.`,
          phonetic: 'Atyadhik khatra. Aapatkaleen sanket.'
        },
        sw: {
          headline: '🔴 HATARI KUBWA: Dalili za Hatari Zipo',
          text: `Dalili mbaya za hatari zimegunduliwa. Mtoto anatapika kila kitu, ana degedege, au hawezi kunywa. Peleka mtoto hospitali ya dharura mara moja bila kuchelewa. Mfunike awe na joto.`,
          english: `Critical danger signs detected (vomiting everything, convulsions, unable to drink). Immediate hospital transfer required. Keep child warm.`,
          phonetic: 'Hah-TAH-ree KOO-bwah. Dah-LEE-lee zah hah-TAH-ree.'
        },
        ar: {
          headline: '🔴 خطر حرج: علامات خطر طارئة',
          text: `تم رصد علامات خطر حرجة. الطفل غير قادر على الشرب، أو يتقيأ كل شيء، أو يعاني من تشنجات. يجب نقل الطفل فوراً وبشكل طارئ إلى المستشفى مع تدفئته.`,
          english: `Critical danger signs detected (unable to drink, vomiting everything, convulsions). Immediate emergency hospital referral required.`,
          phonetic: 'KHA-tar HA-rij. Ah-lah-MAAT kha-tar.'
        }
      };
      const p = prompts[lang.code] || prompts.en;
      return {
        languageCode: lang.code,
        language: lang,
        headline: p.headline,
        promptText: p.text,
        englishMeaning: p.english,
        phoneticGuide: p.phonetic,
        acuityTier: 'RED',
        direction: lang.direction,
        audioDurationSecEst: 8
      };
    } else {
      const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
        en: {
          headline: '🟢 GREEN STATUS: No General Danger Signs',
          text: `No general danger signs present. Child is alert and able to drink. Safe to continue outpatient or home management.`,
          english: `No general danger signs present. Child is alert and drinking. Safe for outpatient care.`,
          phonetic: 'Noʊ ˈdʒɛnərəl ˈdeɪndʒər saɪnz.'
        },
        es: {
          headline: '🟢 ESTADO VERDE: Sin Signos Generales de Peligro',
          text: `Sin signos generales de peligro. El niño está alerta y puede beber líquidos. Es seguro continuar el manejo en casa o ambulatorio.`,
          english: `No general danger signs. Child is alert and can drink. Safe for home/outpatient care.`,
          phonetic: 'Seen seeg-nohs heh-neh-RAH-lehs deh peh-LEE-groh.'
        },
        hi: {
          headline: '🟢 हरी स्थिति: खतरे के कोई संकेत नहीं',
          text: `खतरे के कोई सामान्य लक्षण नहीं हैं। बच्चा सतर्क है और तरल पी पा रहा है। घर या प्राथमिक स्वास्थ्य केंद्र पर देखभाल सुरक्षित है।`,
          english: `No general danger signs. Child is alert and able to drink. Safe for home/primary care.`,
          phonetic: 'Khatre ke koi sanket nahi. Samanya sthiti.'
        },
        sw: {
          headline: '🟢 HALI YA KIJANI: Hakuna Dalili za Hatari',
          text: `Hakuna dalili za hatari. Mtoto yuko macho na anaweza kunywa vinywaji. Ni salama kuendelea na matibabu nyumbani au zahanati.`,
          english: `No danger signs present. Child is alert and can drink. Safe for outpatient or home care.`,
          phonetic: 'Hah-KOO-nah dah-LEE-lee zah hah-TAH-ree.'
        },
        ar: {
          headline: '🟢 حالة خضراء: لا توجد علامات خطر',
          text: `لا توجد علامات خطر عامة. الطفل يقظ وقادر على الشرب. من الآمن متابعة العلاج في المنزل أو في المركز الصحي الأولي.`,
          english: `No general danger signs present. Child is alert and able to drink. Safe for home or primary clinic care.`,
          phonetic: 'Lah YOO-jad ah-lah-MAAT kha-tar.'
        }
      };
      const p = prompts[lang.code] || prompts.en;
      return {
        languageCode: lang.code,
        language: lang,
        headline: p.headline,
        promptText: p.text,
        englishMeaning: p.english,
        phoneticGuide: p.phonetic,
        acuityTier: 'GREEN',
        direction: lang.direction,
        audioDurationSecEst: 6
      };
    }
  }

  private buildPediatricDosingPrompt(context: ITriageVoiceContext, lang: IVernacularLanguageSpec): IVernacularPrompt {
    const med = context.pediatricMedication || 'artemether_lumefantrine';
    const tabs = context.tabletsPerDose || 1;
    const mg = context.doseMg || (tabs * 250);
    const orsMl = context.orsVolumeMl || 750;
    const age = context.childAgeMonths ?? 18;
    const isEligible = context.isEligible !== false;
    const plan = context.dehydrationPlan || 'PLAN_B';

    if (med === 'artemether_lumefantrine') {
      if (!isEligible) {
        const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
          en: {
            headline: '🔴 RED ALERT: Coartem Ineligible (<5 kg)',
            text: 'Warning. Child is under five kilograms. Coartem is not recommended without specialist advice. Refer to clinic immediately.',
            english: 'Child is under 5 kg. Specialist consultation or alternative therapy required.',
            phonetic: 'ˈWɔːrnɪŋ. Tʃaɪld ɪz ˈʌndər faɪv ˈkɪləɡræmz.'
          },
          es: {
            headline: '🔴 ALERTA ROJA: Coartem No Apto (<5 kg)',
            text: 'Advertencia. El niño pesa menos de cinco kilogramos. No se recomienda Coartem sin consejo médico especializado. Traslade de inmediato a la clínica.',
            english: 'Warning. Child is under 5 kg. Coartem not recommended without specialist advice. Refer immediately.',
            phonetic: 'Ad-vehr-TEHN-syah. Ehl NEE-nyoh PEH-sah MEH-nohs deh SEEN-koh kee-loh-GRAH-mohs.'
          },
          hi: {
            headline: '🔴 लाल चेतावनी: कोआर्टेम अनुपयुक्त (<5 किग्रा)',
            text: 'चेतावनी। बच्चे का वजन पांच किलोग्राम से कम है। विशेषज्ञ सलाह के बिना कोआर्टेम की सिफारिश नहीं की जाती है। तुरंत अस्पताल ले जाएं।',
            english: 'Warning. Child is under 5 kg. Do not administer Coartem without specialist doctor advice.',
            phonetic: 'Chetavani. Bachhe ka vazan paanch kilogram se kam hai.'
          },
          sw: {
            headline: '🔴 ONYO JEKUNDU: Coartem Haifai (<5 kg)',
            text: 'Onyo. Mtoto ana uzito wa chini ya kilo tano. Dawa ya Coartem haishauriwi bila ushauri wa daktari. Mpeleke kliniki mara moja.',
            english: 'Warning. Child is under 5 kg. Coartem not recommended without doctor advice. Refer immediately.',
            phonetic: 'OH-nyoh. M-TOH-toh AH-nah oo-ZEE-toh wah CHEE-nee yah KEE-loh TAH-noh.'
          },
          ar: {
            headline: '🔴 طوارئ: كوارتم غير ملائم (أقل من 5 كجم)',
            text: 'تحذير. وزن الطفل أقل من خمسة كيلوغرامات. لا يُنصح بدواء كوارتم دون استشارة طبيب أطفال مختص. يُرجى التوجه فوراً للمستشفى.',
            english: 'Warning. Child is under 5 kg. Coartem not recommended without pediatric specialist consultation.',
            phonetic: 'Tah-dheer. WAZ-noo al-TIF-lee ah-QAL min KHAM-sah kee-loh-ghraam.'
          }
        };
        const p = prompts[lang.code] || prompts.en;
        return {
          languageCode: lang.code,
          language: lang,
          headline: p.headline,
          promptText: p.text,
          englishMeaning: p.english,
          phoneticGuide: p.phonetic,
          acuityTier: 'RED',
          direction: lang.direction,
          audioDurationSecEst: 7
        };
      }

      const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
        en: {
          headline: `🟡 MALARIA ACT: Coartem (${tabs} Tab/Dose)`,
          text: `Give ${tabs} dispersible tablet(s) of Coartem per dose. Total six doses over three days at hours zero, eight, twenty-four, thirty-six, forty-eight, and sixty. Dissolve in clean water or breastmilk and give with milk or fatty food. If the child vomits within one hour, repeat the full dose immediately.`,
          english: `Give ${tabs} Coartem tablet(s) per dose across 6 doses over 3 days with milk/fatty food. Repeat full dose if vomited within 1 hour.`,
          phonetic: `Gɪv ${tabs} dɪˈspɜːrsəbəl ˈtæblət(s) əv ˈkoʊɑːrtɛm.`
        },
        es: {
          headline: `🟡 MALARIA ACT: Coartem (${tabs} Tab/Dosis)`,
          text: `Administre ${tabs} tableta(s) dispersable(s) de Coartem por dosis. Seis dosis en total durante tres días en las horas cero, ocho, veinticuatro, treinta y seis, cuarenta y ocho y sesenta. Disuelva en agua limpia o leche materna y administre con leche o comida con grasa. Si vomita dentro de una hora, repita la dosis completa de inmediato.`,
          english: `Administer ${tabs} Coartem tablet(s) per dose across 6 doses over 3 days with milk/fatty food. Repeat full dose if vomited within 1 hour.`,
          phonetic: `Ad-mee-NEES-treh ${tabs} tah-BLEH-tah(s) dehs-pehr-SAH-bleh(s) deh Koh-AHR-tehm.`
        },
        hi: {
          headline: `🟡 मलेरिया ACT: कोआर्टेम (${tabs} गोली/खुराक)`,
          text: `कोआर्टेम की ${tabs} घुलनशील गोली प्रति खुराक दें। तीन दिनों में कुल छह खुराकें: शून्य, आठ, चौबीस, छत्तीस, अड़तालीस और साठ घंटे पर। साफ पानी या मां के दूध में घोलें और दूध या वसायुक्त भोजन के साथ दें। यदि बच्चा एक घंटे के भीतर उल्टी कर दे, तो तुरंत पूरी खुराक दोबारा दें।`,
          english: `Give ${tabs} Coartem tablet(s) per dose, 6 doses over 3 days with milk/fatty food. Repeat dose if vomited within 1 hour.`,
          phonetic: `Coartem kee ${tabs} goli prati khuraak dein.`
        },
        sw: {
          headline: `🟡 MALARIA ACT: Coartem (Tembe ${tabs}/Dozi)`,
          text: `Mpe mtoto tembe ${tabs} ya Coartem inayoyeyuka kwa kila dozi. Jumla ya dozi sita kwa siku tatu katika saa sifuri, nane, ishirini na nne, thelathini na sita, arobaini na nane na sitini. Yeyusha katika maji safi au maziwa ya mama na umpe pamoja na maziwa au chakula chenye mafuta. Mtoto akitapika ndani ya saa moja, rudia dozi nzima mara moja.`,
          english: `Give ${tabs} dispersible Coartem tablet(s) per dose across 6 doses over 3 days with milk/fatty food. Repeat full dose if vomited within 1 hour.`,
          phonetic: `M-peh M-TOH-toh TEHM-beh ${tabs} yah Koh-AHR-tehm.`
        },
        ar: {
          headline: `🟡 علاج الملاريا: كوارتم (${tabs} قرص/جرعة)`,
          text: `أعطِ ${tabs} قرص(أقراص) من كوارتم القابل للذوبان لكل جرعة. إجمالي ست جرعات على مدى ثلاثة أيام في الساعات صفر وثمانية وأربع وعشرين وست وثلاثين وثمان وأربعين وستين. قم بإذابتها في ماء نظيف أو حليب الأم وأعطها مع الحليب أو وجبة دسمة. إذا تقيأ الطفل خلال ساعة واحدة، أعد إعطاء الجرعة كاملة فوراً.`,
          english: `Give ${tabs} dispersible Coartem tablet(s) per dose across 6 doses over 3 days with milk/fatty food. Repeat full dose if vomited within 1 hour.`,
          phonetic: `A-TI ${tabs} QURS min Koh-AHR-tehm li-koo-lee JOOR-ah.`
        }
      };
      const p = prompts[lang.code] || prompts.en;
      return {
        languageCode: lang.code,
        language: lang,
        headline: p.headline,
        promptText: p.text,
        englishMeaning: p.english,
        phoneticGuide: p.phonetic,
        acuityTier: 'YELLOW',
        direction: lang.direction,
        audioDurationSecEst: 11
      };
    }

    if (med === 'ors_rehydration') {
      if (plan === 'PLAN_C') {
        const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
          en: {
            headline: '🔴 STAT RESUS: Severe Dehydration (Plan C)',
            text: 'Emergency severe dehydration. Start intravenous Ringer\'s Lactate or saline immediately. Transfer urgently to hospital.',
            english: 'Emergency severe dehydration. Start IV fluids STAT and transfer to hospital.',
            phonetic: 'ɪˈmɜːrdʒənsi sɪˈvɪr diːhaɪˈdreɪʃən.'
          },
          es: {
            headline: '🔴 RESUCITACIÓN STAT: Deshidratación Grave (Plan C)',
            text: 'Emergencia por deshidratación grave. Inicie suero intravenoso Lactato Ringer de inmediato y traslade urgente al hospital.',
            english: 'Emergency severe dehydration. Start IV fluids immediately and transfer urgently.',
            phonetic: 'Eh-mehr-HEHN-syah pohr dehs-ee-drah-tah-SYOHN GRAH-veh.'
          },
          hi: {
            headline: '🔴 आपातकालीन पुनर्जीवन: गंभीर निर्जलीकरण (प्लान C)',
            text: 'गंभीर निर्जलीकरण की आपात स्थिति। तुरंत नसों द्वारा ड्रिप शुरू करें और बच्चे को तत्काल अस्पताल ले जाएं।',
            english: 'Severe dehydration emergency. Start IV fluids immediately and rush to hospital.',
            phonetic: 'Gambhir nirjalikaran aapat sthiti. Turant IV shuru karein.'
          },
          sw: {
            headline: '🔴 DHARURA KUBWA: Upungufu Mkali wa Maji (Mpango C)',
            text: 'Dharura ya ukosefu mkubwa wa maji mwilini. Anzisha maji ya dripu ya mshipani mara moja na umpeleke mtoto hospitali haraka.',
            english: 'Critical dehydration emergency. Start IV fluids immediately and transfer child to hospital.',
            phonetic: 'Dhah-ROO-rah yah oo-KOH-seh-foo m-KAH-lee wah MAH-jee.'
          },
          ar: {
            headline: '🔴 إنعاش طارئ: جفاف شديد (الخطة ج)',
            text: 'طوارئ جفاف حاد شديد. ابدأ المحاليل الوريدية فوراً وانقل الطفل على وجه السرعة القصوى إلى المستشفى.',
            english: 'Severe dehydration emergency. Start IV fluids immediately and transfer urgently to hospital.',
            phonetic: 'Tah-wah-REE jah-FAAF haad wa sha-DEED.'
          }
        };
        const p = prompts[lang.code] || prompts.en;
        return {
          languageCode: lang.code,
          language: lang,
          headline: p.headline,
          promptText: p.text,
          englishMeaning: p.english,
          phoneticGuide: p.phonetic,
          acuityTier: 'RED',
          direction: lang.direction,
          audioDurationSecEst: 7
        };
      }

      if (plan === 'PLAN_B') {
        const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
          en: {
            headline: `🟡 ORS REHYDRATION: Plan B (${orsMl} mL / 4h)`,
            text: `Dissolve one packet of ORS in exactly one liter of clean water. Give ${orsMl} milliliters slowly with a cup or spoon over the next four hours. Also give Zinc tablet once daily for fourteen days.`,
            english: `Mix 1 ORS packet in 1L clean water. Give ${orsMl} mL slowly over 4 hours. Give Zinc daily for 14 days.`,
            phonetic: `Dɪˈzɑːlv wʌn ˈpækɪt əv oʊ-ɑːr-ɛs. Gɪv ${orsMl} ˈmɪləˌliːtərz.`
          },
          es: {
            headline: `🟡 SUERO ORAL: Plan B (${orsMl} mL / 4h)`,
            text: `Disuelva un sobre de suero en exactamente un litro de agua limpia. Administre ${orsMl} mililitros lentamente con cuchara o taza durante las próximas cuatro horas. También dé una tableta de Zinc al día por catorce días.`,
            english: `Mix 1 ORS packet in 1 liter clean water. Give ${orsMl} mL slowly over 4 hours. Give Zinc daily for 14 days.`,
            phonetic: `Dees-WEHL-vah oon SOH-breh deh SWEH-roh. Ad-mee-NEES-treh ${orsMl} mee-lee-LEE-trohs.`
          },
          hi: {
            headline: `🟡 ओआरएस घोल: प्लान B (${orsMl} मिली / 4 घंटे)`,
            text: `एक लीटर साफ पानी में ओआरएस का एक पैकेट घोलें। अगले चार घंटों में चम्मच या कटोरी से ${orsMl} मिलीलीटर घोल थोड़ा-थोड़ा पिलाएं। साथ ही चौदह दिनों तक रोजाना जिंक की गोली भी दें।`,
            english: `Dissolve 1 ORS packet in 1L clean water. Give ${orsMl} mL slowly over 4 hours. Give Zinc daily for 14 days.`,
            phonetic: `Ek liter saaf paani mein ORS gholein. ${orsMl} ml pilayein.`
          },
          sw: {
            headline: `🟡 SULUHISHO LA ORS: Mpango B (Mililita ${orsMl} / Saa 4)`,
            text: `Yeyusha pakiti moja ya ORS katika lita moja kamili ya maji safi. Mpe mtoto mililita ${orsMl} polepole kwa kijiko au kikombe katika masaa manne yajayo. Pia mpe tembe ya Zinki mara moja kwa siku kwa siku kumi na nne.`,
            english: `Mix 1 ORS packet in 1 liter clean water. Give ${orsMl} mL slowly over 4 hours. Give Zinc daily for 14 days.`,
            phonetic: `Yeh-YOO-shah pah-KEE-tee MOH-jah yah ORS. M-peh mee-lee-LEE-tah ${orsMl}.`
          },
          ar: {
            headline: `🟡 محلول الإرواء: الخطة ب (${orsMl} مل / 4 ساعات)`,
            text: `قم بإذابة كيس واحد من محلول الإرواء في لتر كامل من الماء النظيف. أعطِ الطفل ${orsMl} مليلتر ببطء بالملعقة أو الكوب خلال الساعات الأربع القادمة. كما يجب إعطاء قرص الزنك يومياً لمدة أربعة عشر يوماً.`,
            english: `Dissolve 1 ORS packet in 1L clean water. Give ${orsMl} mL slowly over 4 hours. Give Zinc daily for 14 days.`,
            phonetic: `A-dhib KEE-san WAH-hi-dan min mah-LOOL al-ir-WAA. A-ti ${orsMl} mee-lee-lee-tr.`
          }
        };
        const p = prompts[lang.code] || prompts.en;
        return {
          languageCode: lang.code,
          language: lang,
          headline: p.headline,
          promptText: p.text,
          englishMeaning: p.english,
          phoneticGuide: p.phonetic,
          acuityTier: 'YELLOW',
          direction: lang.direction,
          audioDurationSecEst: 9
        };
      }

      // Plan A (Home maintenance)
      const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
        en: {
          headline: '🟢 ORS HOME PROTOCOL: Plan A (Fluid Maintenance)',
          text: 'Mix one packet of ORS in one liter of clean water. Give half a cup to one full cup after every loose stool. Continue normal feeding and give Zinc tablet daily for fourteen days.',
          english: 'Mix 1 packet of ORS in 1L clean water. Give 1/2 to 1 cup after each loose stool. Continue feeding and give Zinc daily for 14 days.',
          phonetic: 'Mɪks wʌn ˈpækɪt əv oʊ-ɑːr-ɛs. Gɪv hæf ə kʌp æftər ˈɛvəri luːs stuːl.'
        },
        es: {
          headline: '🟢 SUERO EN CASA: Plan A (Mantenimiento)',
          text: 'Disuelva un sobre de suero en un litro de agua limpia. Administre de media a una taza después de cada deposición líquida. Continúe la alimentación normal y dé Zinc diario por catorce días.',
          english: 'Mix 1 ORS packet in 1L clean water. Give 1/2 to 1 cup after each loose stool. Continue feeding and give Zinc daily for 14 days.',
          phonetic: 'Dees-WEHL-vah oon SOH-breh deh SWEH-roh. Ad-mee-NEES-treh MEH-dyah TAH-sah.'
        },
        hi: {
          headline: '🟢 घरेलू ओआरएस: प्लान A (तरल रखरखाव)',
          text: 'एक लीटर साफ पानी में एक पैकेट ओआरएस घोलें। हर पतले दस्त के बाद आधा से एक कप घोल पिलाएं। भोजन जारी रखें और चौदह दिनों तक रोजाना जिंक की गोली दें।',
          english: 'Dissolve 1 packet of ORS in 1L clean water. Give 1/2 to 1 cup after each loose stool. Continue feeding and give Zinc daily for 14 days.',
          phonetic: 'Ek packet ORS gholein. Har dast ke baad aadha cup pilayein.'
        },
        sw: {
          headline: '🟢 ORS YA NYUMBANI: Mpango A (Kinga ya Upungufu)',
          text: 'Changanya pakiti moja ya ORS katika lita moja ya maji safi. Mpe mtoto nusu kikombe hadi kikombe kimoja kila baada ya kuharisha. Endelea kumlisha na umpe tembe ya Zinki kila siku kwa siku kumi na nne.',
          english: 'Mix 1 ORS packet in 1L clean water. Give 1/2 to 1 cup after each loose stool. Continue feeding and give Zinc daily for 14 days.',
          phonetic: 'Chahn-GAHN-yah pah-KEE-tee MOH-jah yah ORS. M-peh NOO-soo kee-KOHM-beh.'
        },
        ar: {
          headline: '🟢 محلول الإرواء المنزلي: الخطة أ (وقاية)',
          text: 'اخلط كيساً واحداً من محلول الجفاف في لتر ماء نظيف. أعطِ الطفل نصف كوب إلى كوب بعد كل إسهال مائي. استمر في الرضاعة والتغذية وأعطِ الزنك يومياً لمدة أربعة عشر يوماً.',
          english: 'Mix 1 ORS packet in 1L clean water. Give 1/2 to 1 cup after each loose stool. Continue feeding and give Zinc daily for 14 days.',
          phonetic: 'IKH-lat KEE-san WAH-hi-dan min mah-LOOL al-jah-FAAF. A-ti NISF KOOB.'
        }
      };
      const p = prompts[lang.code] || prompts.en;
      return {
        languageCode: lang.code,
        language: lang,
        headline: p.headline,
        promptText: p.text,
        englishMeaning: p.english,
        phoneticGuide: p.phonetic,
        acuityTier: 'GREEN',
        direction: lang.direction,
        audioDurationSecEst: 8
      };
    }

    if (med === 'zinc_sulfate') {
      const isUnder6Mo = age < 6;
      const zincMg = isUnder6Mo ? 10 : 20;
      const zincFrac = isUnder6Mo ? 'half a tablet' : 'one full tablet';

      const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
        en: {
          headline: `🟢 ZINC SUPPLEMENT: ${zincMg} mg Daily (14 Days)`,
          text: `Give ${zincFrac} of Zinc, which is ${zincMg} milligrams, once daily for fourteen full days. Dissolve in a spoon with clean water, breastmilk, or ORS. Complete all fourteen days even after diarrhea stops.`,
          english: `Give ${zincFrac} (${zincMg} mg) Zinc once daily for 14 full days. Dissolve in spoon with clean water/milk. Complete all 14 days.`,
          phonetic: `Gɪv ${zincFrac} əv zɪŋk, ${zincMg} ˈmɪləˌɡræmz, wʌns ˈdeɪli fɔːr ˈfɔːrˈtiːn deɪz.`
        },
        es: {
          headline: `🟢 SUPLEMENTO DE ZINC: ${zincMg} mg Diario (14 Días)`,
          text: `Administre ${isUnder6Mo ? 'media tableta' : 'una tableta entera'} de Zinc (${zincMg} miligramos) una vez al día durante catorce días completos. Disuélvala en una cuchara con agua limpia, leche materna o suero. Complete los catorce días incluso si la diarrea desaparece.`,
          english: `Give ${isUnder6Mo ? 'half' : 'one'} Zinc tablet (${zincMg} mg) once daily for 14 full days. Complete all 14 days.`,
          phonetic: `Ad-mee-NEES-treh ${isUnder6Mo ? 'MEH-dyah' : 'OO-nah'} tah-BLEH-tah deh Seenk (${zincMg} mee-lee-GRAH-mohs).`
        },
        hi: {
          headline: `🟢 जिंक अनुपूरक: ${zincMg} मिग्रा रोजाना (14 दिन)`,
          text: `जिंक की ${isUnder6Mo ? 'आधी गोली (दस मिलीग्राम)' : 'एक पूरी गोली (बीस मिलीग्राम)'} दिन में एक बार पूरे चौदह दिनों तक दें। चम्मच में साफ पानी, मां के दूध या ओआरएस में घोलें। दस्त बंद होने के बाद भी चौदह दिनों का कोर्स जरूर पूरा करें।`,
          english: `Give ${isUnder6Mo ? 'half' : 'one'} Zinc tablet (${zincMg} mg) once daily for 14 full days. Dissolve in spoon. Complete 14 days.`,
          phonetic: `Zinc kee ${isUnder6Mo ? 'aadhi' : 'ek poori'} goli rozana dein. 14 din poore karein.`
        },
        sw: {
          headline: `🟢 KIONGEZA CHA ZINKI: Miligramu ${zincMg} Kila Siku (Siku 14)`,
          text: `Mpe mtoto ${isUnder6Mo ? 'nusu tembe' : 'tembe moja nzima'} ya Zinki (miligramu ${zincMg}) mara moja kwa siku kwa siku kumi na nne kamili. Yeyusha kwenye kijiko chenye maji safi, maziwa ya mama au ORS. Kamilisha siku zote kumi na nne hata kama kuharisha kumekoma.`,
          english: `Give ${isUnder6Mo ? 'half' : 'one'} Zinc tablet (${zincMg} mg) once daily for 14 full days. Complete all 14 days.`,
          phonetic: `M-peh M-TOH-toh ${isUnder6Mo ? 'NOO-soo TEHM-beh' : 'TEHM-beh MOH-jah'} yah ZEEN-kee.`
        },
        ar: {
          headline: `🟢 مكمل الزنك: ${zincMg} مجم يومياً (14 يوماً)`,
          text: `أعطِ ${isUnder6Mo ? 'نصف قرص من الزنك (عشرة مجم)' : 'قرصاً كاملاً من الزنك (عشرين مجم)'} مرة واحدة يومياً لمدة أربعة عشر يوماً كاملة. قم بإذابته في ملعقة بماء نظيف أو حليب الأم أو محلول الجفاف. يجب إكمال الأيام الأربعة عشر كاملة حتى لو توقف الإسهال.`,
          english: `Give ${isUnder6Mo ? 'half' : 'one'} Zinc tablet (${zincMg} mg) once daily for 14 full days. Complete all 14 days.`,
          phonetic: `A-ti ${isUnder6Mo ? 'NISF QURS' : 'QUR-san KAH-mee-lan'} min al-ZEENK (${zincMg} mg).`
        }
      };
      const p = prompts[lang.code] || prompts.en;
      return {
        languageCode: lang.code,
        language: lang,
        headline: p.headline,
        promptText: p.text,
        englishMeaning: p.english,
        phoneticGuide: p.phonetic,
        acuityTier: 'GREEN',
        direction: lang.direction,
        audioDurationSecEst: 8
      };
    }

    // Default: amoxicillin_dispersible
    const prompts: Record<VernacularLanguageCode, { text: string; english: string; phonetic: string; headline: string }> = {
      en: {
        headline: `🟡 PNEUMONIA ANTIBIOTIC: Amoxicillin (${tabs} Tab / ${mg} mg BID)`,
        text: `Give ${tabs} dispersible tablet(s) of Amoxicillin, ${mg} milligrams, twice daily every twelve hours for five full days. Dissolve in a little clean water or allow child to chew. If breathing becomes harder or child vomits everything, rush to hospital immediately.`,
        english: `Give ${tabs} Amoxicillin dispersible tablet(s) (${mg} mg) twice daily for 5 full days. Rush to hospital if chest indrawing occurs.`,
        phonetic: `Gɪv ${tabs} dɪˈspɜːrsəbəl ˈtæblət(s) əv əˌmɑːksɪˈsɪlɪn, ${mg} ˈmɪləˌɡræmz.`
      },
      es: {
        headline: `🟡 ANTIBIÓTICO NEUMONÍA: Amoxicilina (${tabs} Tab / ${mg} mg BID)`,
        text: `Administre ${tabs} tableta(s) dispersable(s) de Amoxicilina (${mg} miligramos) dos veces al día, cada doce horas, durante cinco días completos. Disuelva en un poco de agua limpia o deje que el niño la mastique. Si la respiración se vuelve más difícil o presenta tiraje en el pecho, traslade urgente al hospital.`,
        english: `Administer ${tabs} Amoxicillin dispersible tablet(s) (${mg} mg) twice daily every 12 hours for 5 days. Refer urgently if chest indrawing occurs.`,
        phonetic: `Ad-mee-NEES-treh ${tabs} tah-BLEH-tah(s) dehs-pehr-SAH-bleh(s) deh Ah-mohk-see-see-LEE-nah.`
      },
      hi: {
        headline: `🟡 निमोनिया एंटीबायोटिक: अमोक्सिसिलिन (${tabs} गोली / ${mg} मिग्रा BID)`,
        text: `अमोक्सिसिलिन की ${tabs} घुलनशील गोली (${mg} मिलीग्राम) दिन में दो बार (हर बारह घंटे पर) पूरे पांच दिनों तक दें। थोड़े साफ पानी में घोलें या बच्चे को चबाने दें। यदि सांस लेना कठिन हो जाए या सीना धंसे, तो तुरंत अस्पताल ले जाएं।`,
        english: `Give ${tabs} Amoxicillin dispersible tablet(s) (${mg} mg) twice daily for 5 days. Rush to hospital if breathing worsens.`,
        phonetic: `Amoxicillin kee ${tabs} goli (${mg} mg) din mein do baar 5 din tak dein.`
      },
      sw: {
        headline: `🟡 DAWA YA NIMONIA: Amoksisilini (Tembe ${tabs} / mg ${mg} Mara 2)`,
        text: `Mpe mtoto tembe ${tabs} ya Amoksisilini inayoyeyuka (miligramu ${mg}) mara mbili kwa siku kila baada ya masaa kumi na mbili kwa siku tano kamili. Yeyusha kwenye maji safi kidogo au mtoto atafune. Mtoto akipumua kwa shida au akivuta kifua ndani, mpeleke hospitali mara moja.`,
        english: `Give ${tabs} Amoxicillin dispersible tablet(s) (${mg} mg) twice daily for 5 full days. Rush to hospital if breathing becomes difficult.`,
        phonetic: `M-peh M-TOH-toh TEHM-beh ${tabs} yah Ah-mohk-see-see-LEE-nee (${mg} mg).`
      },
      ar: {
        headline: `🟡 مضاد حيوي للالتهاب الرئوي: أموكسيسيلين (${tabs} قرص / ${mg} مجم)`,
        text: `أعطِ ${tabs} قرص(أقراص) أموكسيسيلين القابل للذوبان (${mg} مجم) مرتين يومياً كل اثنتي عشرة ساعة لمدة خمسة أيام كاملة. قم بإذابته في قليل من الماء النظيف أو دعه يمضغه. إذا ازداد التنفس صعوبة أو ظهر انسحاب بالصدر، انقل الطفل فوراً إلى المستشفى.`,
        english: `Give ${tabs} Amoxicillin dispersible tablet(s) (${mg} mg) twice daily every 12 hours for 5 full days. Rush to hospital if chest indrawing occurs.`,
        phonetic: `A-ti ${tabs} QURS Ah-mohk-see-see-LEEN (${mg} mg) mar-ra-TAYN yaw-MEE-yan.`
      }
    };
    const p = prompts[lang.code] || prompts.en;
    return {
      languageCode: lang.code,
      language: lang,
      headline: p.headline,
      promptText: p.text,
      englishMeaning: p.english,
      phoneticGuide: p.phonetic,
      acuityTier: 'YELLOW',
      direction: lang.direction,
      audioDurationSecEst: 9
    };
  }

  /**
   * Returns localized spoken prompt for Wong-Baker FACES pain scores (0, 2, 4, 6, 8, 10).
   */
  public getAacFacePrompt(score: number, langCode?: VernacularLanguageCode): string {
    const code = langCode || this.activeLanguageCode();
    const faceMap: Record<number, Record<VernacularLanguageCode, string>> = {
      0: {
        en: 'I am comfortable and have no pain. Pain score zero.',
        es: 'Estoy cómodo y no tengo dolor. Nivel de dolor cero.',
        hi: 'मैं आराम से हूँ और मुझे कोई दर्द नहीं है। दर्द का स्तर शून्य।',
        sw: 'Niko salama na sina maumivu yoyote. Kiwango cha maumivu sifuri.',
        ar: 'أنا مرتاح ولا أشعر بأي ألم. درجة الألم صفر.'
      },
      2: {
        en: 'It hurts just a little bit. Pain score two.',
        es: 'Me duele solo un poco. Nivel de dolor dos.',
        hi: 'मुझे बस थोड़ा सा दर्द हो रहा है। दर्द का स्तर दो।',
        sw: 'Inauma kidogo tu. Kiwango cha maumivu mawili.',
        ar: 'يؤلمني قليلاً فقط. درجة الألم اثنان.'
      },
      4: {
        en: 'It hurts a little more now. Pain score four.',
        es: 'Me duele un poco más ahora. Nivel de dolor cuatro.',
        hi: 'अब थोड़ा और दर्द हो रहा है। दर्द का स्तर चार।',
        sw: 'Sasa inauma zaidi kidogo. Kiwango cha maumivu manne.',
        ar: 'يؤلمني أكثر قليلاً الآن. درجة الألم أربعة.'
      },
      6: {
        en: 'It hurts even more. It is hard to rest. Pain score six.',
        es: 'Me duele aún más. Es difícil descansar. Nivel de dolor seis.',
        hi: 'और भी ज्यादा दर्द हो रहा है। आराम करना मुश्किल है। दर्द का स्तर छह।',
        sw: 'Inauma zaidi sana. Ni vigumu kupumzika. Kiwango cha maumivu sita.',
        ar: 'الألم يزداد أكثر، يصعب عليّ الراحة. درجة الألم ستة.'
      },
      8: {
        en: 'It hurts a whole lot. I need pain relief. Pain score eight.',
        es: 'Me duele muchísimo. Necesito alivio para el dolor. Nivel de dolor ocho.',
        hi: 'बहुत तेज दर्द हो रहा है। मुझे दर्द से राहत चाहिए। दर्द का स्तर आठ।',
        sw: 'Inauma sana mno. Nahitaji dawa ya maumivu. Kiwango cha maumivu nane.',
        ar: 'يؤلمني بشدة كبيرة. أحتاج إلى مسكن للألم. درجة الألم ثمانية.'
      },
      10: {
        en: 'This hurts the worst possible. Please help me right away. Pain score ten.',
        es: 'Es el peor dolor posible. Por favor ayúdenme de inmediato. Nivel de dolor diez.',
        hi: 'यह असहनीय और सबसे भयानक दर्द है। कृपया तुरंत मेरी मदद करें। दर्द का स्तर दस।',
        sw: 'Haya ni maumivu mabaya zaidi iwezekanavyo. Tafadhali nisaidieni mara moja. Kiwango cha maumivu kumi.',
        ar: 'هذا أشد ألم ممكن لا أستطيع تحمله. أرجو المساعدة فوراً. درجة الألم عشرة.'
      }
    };

    const targetScore = score in faceMap ? score : 0;
    return faceMap[targetScore][code] || faceMap[targetScore].en;
  }

  /**
   * Returns localized spoken prompt for ICU Bedside AAC need tiles.
   */
  public getAacTilePrompt(tileId: string, langCode?: VernacularLanguageCode): string {
    const code = langCode || this.activeLanguageCode();
    const tileMap: Record<string, Record<VernacularLanguageCode, string>> = {
      WATER: {
        en: 'Could I please have some water, or a mouth swab?',
        es: '¿Podría darme un poco de agua o una gasa húmeda para la boca, por favor?',
        hi: 'कृपया मुझे थोड़ा पानी या मुंह पोंछने के लिए गीला कपड़ा मिल सकता है?',
        sw: 'Tafadhali naomba maji ya kunywa au kitambaa cha kuloweka kinywa?',
        ar: 'هل يمكنني الحصول على بعض الماء أو مسحة رطبة للفم من فضلك؟'
      },
      PAIN: {
        en: "I'm in pain. Could someone please check on my pain medication?",
        es: 'Tengo dolor. ¿Alguien podría revisar mi medicamento para el dolor, por favor?',
        hi: 'मुझे दर्द हो रहा है। क्या कोई मेरी दर्द की दवा की जांच कर सकता है?',
        sw: 'Nina maumivu. Tafadhali naomba mtu anisaidie kuangalia dawa yangu ya maumivu?',
        ar: 'أشعر بألم. هل يمكن لأحد تفقد دواء تسكين الألم الخاص بي من فضلك؟'
      },
      COLD: {
        en: "I'm feeling very cold. Could I please have a warm blanket?",
        es: 'Tengo mucho frío. ¿Podría traerme una manta caliente, por favor?',
        hi: 'मुझे बहुत ठंड लग रही है। क्या मुझे एक गर्म कंबल मिल सकता है?',
        sw: 'Ninahisi baridi kali sana. Naomba blanketi ya joto tafadhali?',
        ar: 'أشعر ببرد شديد. هل يمكنني الحصول على بطانية دافئة من فضلك؟'
      },
      WARM: {
        en: "I'm feeling too warm. Could we adjust the blankets or turn on a fan?",
        es: 'Tengo mucho calor. ¿Podríamos retirar las mantas o encender un ventilador?',
        hi: 'मुझे बहुत गर्मी लग रही है। क्या हम कंबल हटा सकते हैं या पंखा चला सकते हैं?',
        sw: 'Ninahisi joto kali. Tunaweza kupunguza blanketi au kuwasha feni?',
        ar: 'أشعر بحرارة شديدة. هل يمكننا تخفيف الأغطية أو تشغيل مروحة؟'
      },
      REPOSITION: {
        en: 'Could someone please help reposition me, or turn me in bed?',
        es: '¿Podría alguien ayudarme a cambiar de posición o girarme en la cama, por favor?',
        hi: 'क्या कोई मुझे बिस्तर में करवट बदलने या सही स्थिति में लेटने में मदद कर सकता है?',
        sw: 'Tafadhali naomba mtu anisaidie kubadili mkao au kugeuka kitandani?',
        ar: 'هل يمكن لأحد مساعدتي في تغيير وضعيتي أو تعديل نومتي في السرير من فضلك؟'
      },
      FAMILY: {
        en: 'I would like to see my family, or speak with my nurse, please.',
        es: 'Me gustaría ver a mi familia o hablar con mi enfermera, por favor.',
        hi: 'मैं अपने परिवार से मिलना चाहता हूँ, या अपनी नर्स से बात करना चाहता हूँ।',
        sw: 'Ningependa kuona familia yangu au kuongea na muuguzi wangu, tafadhali.',
        ar: 'أود رؤية عائلتي أو التحدث مع ممرضتي من فضلك.'
      }
    };

    const tile = tileMap[tileId.toUpperCase()];
    if (!tile) return 'Assistance requested.';
    return tile[code] || tile.en;
  }
}
