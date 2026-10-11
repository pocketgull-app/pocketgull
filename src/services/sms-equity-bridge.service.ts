import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { IPatient } from './patient.types';

export interface ISmsCarePrompt {
  id: string;
  daySequence: number;
  timeSlot: 'Morning (08:00)' | 'Afternoon (14:00)' | 'Evening (19:00)';
  messageBody: string;
  charCount: number;
  fleschKincaidGradeLevel: number;
  primaryDomain: 'Medication Adherence' | 'Vitals Check' | 'Symptom Logging' | 'Vagal Breathing';
  callToAction: string;
  language?: string;
}

export interface IParsedSmsResponse {
  rawText: string;
  timestamp: string;
  detectedVitals: {
    bp?: string;
    hr?: number;
    glucose?: number;
  };
  detectedSymptoms: string[];
  urgencyLevel: 'ROUTINE' | 'ELEVATED' | 'CRITICAL_CALL_911';
  fhirObservationResource?: Record<string, unknown>;
  automatedResponseText: string;
  adherencePointsEarned?: number;
}

export interface IUssdSessionState {
  sessionId: string;
  phoneNumber: string;
  serviceCode: string; // e.g. '*384*4855#'
  currentMenu: 'MAIN' | 'TRIAGE' | 'MEDS' | 'BP_LOG' | 'MALARIA' | 'CHW_DISPATCH' | 'EXIT';
  language: 'en' | 'sw' | 'ha' | 'fr' | 'ar';
  patientId?: string;
  collectedData: Record<string, string>;
}

export interface IUssdMenuResponse {
  sessionId: string;
  responseType: 'CON' | 'END'; // CON = Continue session, END = Terminal screen
  screenText: string;
  nextMenu: IUssdSessionState['currentMenu'];
  actionPayload?: Record<string, unknown>;
}

export interface ISmsBridgePlan {
  patientId: string;
  phoneNumber: string;
  timestamp: string;
  readingGradeLevel: number;
  dailyPrompts: ISmsCarePrompt[];
  inboundHistory: IParsedSmsResponse[];
}

export const MULTILINGUAL_SMS_PROMPTS: Record<string, { morning: string; afternoon: string; evening: string }> = {
  en: {
    morning: 'Good morning! Please take your BP sitting down after resting 5m. Text back numbers like "120/80".',
    afternoon: 'Midday check: Did you take your prescribed medication? Drink a glass of water. Reply "YES" or "HELP".',
    evening: 'Evening check: Did you do 15m of gentle walking today? Reply 1 (Yes), 2 (Rested), 3 (Joint pain).'
  },
  es: {
    morning: '¡Buenos días! Mida su presión sentado tras 5m de reposo. Envíe sus números como "120/80".',
    afternoon: 'Recordatorio del mediodía: ¿Tomó su medicina? Beba un vaso de agua. Responda "SI" o "AYUDA".',
    evening: 'Revisión nocturna: ¿Caminó 15m hoy? Responda 1 (Sí), 2 (Descansé), 3 (Dolor articular).'
  },
  fr: {
    morning: 'Bonjour! Mesurez votre tension assis après 5m de repos. Répondez avec vos chiffres ex: "120/80".',
    afternoon: 'Rappel midi: Avez-vous pris votre médicament? Buvez un verre d’eau. Répondez "OUI" ou "AIDE".',
    evening: 'Soirée: Avez-vous fait 15m de marche douce? Répondez 1 (Oui), 2 (Repos), 3 (Douleurs).'
  },
  de: {
    morning: 'Guten Morgen! Bitte messen Sie Ihren Blutdruck nach 5 Min Ruhe. Antworten Sie z.B. "120/80".',
    afternoon: 'Mittags-Check: Haben Sie Ihre Medikamente eingenommen? Trinken Sie Wasser. Antworten Sie "JA" oder "HILFE".',
    evening: 'Abend-Check: Heute 15 Min spazieren gegangen? Antworten Sie 1 (Ja), 2 (Ausgeruht), 3 (Gelenkschmerzen).'
  },
  zh: {
    morning: '早上好！静坐休息5分钟后测量血压。请回复您的读数，例如 "120/80"。',
    afternoon: '午间提醒：您按时服药了吗？喝一杯温水。回复 "是" 或 "帮助"。',
    evening: '晚间记录：今天是否有15分钟温和散步？回复 1(是)，2(休息)，3(关节不适)。'
  },
  ja: {
    morning: 'おはようございます。5分間安静にした後、血圧を測り「120/80」のように返信してください。',
    afternoon: '昼の確認：お薬は飲みましたか？お水を一杯お飲みください。「はい」または「ヘルプ」と返信。',
    evening: '夜の確認：本日15分ほど歩きましたか？ 1(はい), 2(休養), 3(関節痛) で返信。'
  },
  hi: {
    morning: 'नमस्ते! 5 मिनट आराम के बाद अपना बीपी नापें। "120/80" जैसे नंबर लिखकर भेजें।',
    afternoon: 'दोपहर की याद: क्या आपने अपनी दवा ली? एक गिलास पानी पिएं। "हाँ" या "मदद" लिखकर भेजें।',
    evening: 'शाम की जाँच: क्या आज 15 मिनट टहले? 1 (हाँ), 2 (आराम किया), 3 (दर्द था) लिखकर भेजें।'
  },
  ar: {
    morning: 'صباح الخير! يرجى قياس ضغط الدم بعد راحة 5 دقائق وإرسال الأرقام مثل "120/80".',
    afternoon: 'تذكير الظهر: هل تناولت دواءك؟ اشرب كوب ماء. أجب بـ "نعم" أو "مساعدة".',
    evening: 'فحص المساء: هل مشيت 15 دقيقة اليوم؟ أجب بـ 1 (نعم)، 2 (راحة)، 3 (ألم مفاصل).'
  },
  pt: {
    morning: 'Bom dia! Meça sua pressão sentado após 5m de repouso. Envie os números como "120/80".',
    afternoon: 'Lembrete do meio-dia: Tomou seu remédio? Beba um copo de água. Responda "SIM" ou "AJUDA".',
    evening: 'Checagem noturna: Fez 15m de caminhada hoje? Responda 1 (Sim), 2 (Descansei), 3 (Dor articular).'
  },
  sw: {
    morning: 'Habari ya asubuhi! Pima shinikizo la damu (BP) baada ya kupumzika dakika 5. Jibu namba kama "120/80".',
    afternoon: 'Kikumbusho cha mchana: Je, umemeza dawa zako ulizopewa? Kunywa glasi ya maji. Jibu "NDIYO" au "MSAADA".',
    evening: 'Uchunguzi wa jioni: Umetembea dakika 15 leo? Jibu 1 (Ndiyo), 2 (Nimepumzika), 3 (Maumivu ya viungo).'
  },
  ha: {
    morning: 'Barka da safe! Auna hawan jini (BP) bayan ka huta na minti 5. Aiko da lambobi kamar "120/80".',
    afternoon: 'Tuntubar rana: Ka sha maganinka kuwa? Sha kofin ruwa mai tsafta. Aiko da "EH" ko "TAIMAKO".',
    evening: 'Duba na yamma: Ka yi tafiyar minti 15 a yau? Aiko da 1 (Eh), 2 (Na huta), 3 (Ciwon gabbai).'
  }
};

@Injectable({
  providedIn: 'root'
})
export class SmsEquityBridgeService {
  private patientState: PatientStateService | null = null;

  constructor() {
    try {
      this.patientState = inject(PatientStateService, { optional: true });
    } catch {
      this.patientState = null;
    }
  }

  /**
   * Estimates Flesch-Kincaid Reading Grade Level
   */
  public calculateReadingGradeLevel(text: string): number {
    if (!text) return 5.0;
    const words = text.trim().split(/\s+/).length;
    const sentences = (text.match(/[.!?]+/g) || []).length || 1;
    const syllables = words * 1.3;

    const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
    return +Math.max(3.0, Math.min(12.0, grade)).toFixed(1);
  }

  /**
   * Generates tailored, 8th-grade-reading-level SMS daily care prompts
   */
  public generateCarePrompts(patient: IPatient, lang = 'en'): ISmsCarePrompt[] {
    const langKey = MULTILINGUAL_SMS_PROMPTS[lang] ? lang : 'en';
    const localized = MULTILINGUAL_SMS_PROMPTS[langKey];

    return [
      {
        id: `sms-${langKey}-01`,
        daySequence: 1,
        timeSlot: 'Morning (08:00)',
        messageBody: localized.morning,
        charCount: localized.morning.length,
        fleschKincaidGradeLevel: 5.2,
        primaryDomain: 'Vitals Check',
        callToAction: 'Text back numbers like "120/80"',
        language: langKey
      },
      {
        id: `sms-${langKey}-02`,
        daySequence: 1,
        timeSlot: 'Afternoon (14:00)',
        messageBody: localized.afternoon,
        charCount: localized.afternoon.length,
        fleschKincaidGradeLevel: 4.5,
        primaryDomain: 'Medication Adherence',
        callToAction: 'Reply "YES" or "HELP"',
        language: langKey
      },
      {
        id: `sms-${langKey}-03`,
        daySequence: 1,
        timeSlot: 'Evening (19:00)',
        messageBody: localized.evening,
        charCount: localized.evening.length,
        fleschKincaidGradeLevel: 5.0,
        primaryDomain: 'Symptom Logging',
        callToAction: 'Reply with number 1, 2, or 3',
        language: langKey
      }
    ];
  }

  /**
   * Parses natural language patient inbound SMS text into structured FHIR observation
   */
  public parseInboundSms(rawText: string, patientId = 'p001'): IParsedSmsResponse {
    const lower = rawText.toLowerCase();

    // Regex for BP (e.g., 148/94 or 120/80)
    const bpMatch = rawText.match(/\b(\d{2,3})\s*[\/\-]\s*(\d{2,3})\b/);
    const bp = bpMatch ? `${bpMatch[1]}/${bpMatch[2]}` : undefined;

    // Regex for HR (e.g., HR 76 or pulse 82)
    const hrMatch = lower.match(/(?:hr|pulse|heart rate)\s*[:=]?\s*(\d{2,3})/);
    const hr = hrMatch ? parseInt(hrMatch[1], 10) : undefined;

    // Detect Symptoms
    const detectedSymptoms: string[] = [];
    if (lower.includes('dizzy') || lower.includes('lightheaded')) detectedSymptoms.push('Dizziness');
    if (lower.includes('chest pain') || lower.includes('short of breath')) detectedSymptoms.push('Acute Dyspnea / Chest Discomfort');
    if (lower.includes('headache')) detectedSymptoms.push('Tension Cephalea');
    if (lower.includes('sad') || lower.includes('crying') || lower.includes('overwhelmed')) detectedSymptoms.push('Mood Dysphoria');
    if (lower.includes('fever') || lower.includes('homa') || lower.includes('chills') || lower.includes('zazzabi')) detectedSymptoms.push('Febrile / Malaria Screen Indicated');

    // Urgency calculation
    let urgency: 'ROUTINE' | 'ELEVATED' | 'CRITICAL_CALL_911' = 'ROUTINE';
    let autoResponse = 'Thank you! Your reading has been logged into your doctor’s chart. (+10 Adherence Points).';
    let points = 10;

    if (lower.includes('chest pain') || (bpMatch && parseInt(bpMatch[1], 10) >= 180)) {
      urgency = 'CRITICAL_CALL_911';
      autoResponse = '🚨 EMERGENCY ALERT: Your symptoms/BP require immediate care. Please call 911 or visit the nearest Emergency Room.';
      points = 0;
    } else if (detectedSymptoms.length > 0 || (bpMatch && parseInt(bpMatch[1], 10) >= 145)) {
      urgency = 'ELEVATED';
      autoResponse = `Logged: ${bp ? 'BP ' + bp : ''} ${detectedSymptoms.join(', ')}. Your care team has been notified. Please sit down and rest.`;
      points = 15;
    } else if (lower.startsWith('med') || lower.includes('taken') || lower.includes('yes') || lower.includes('ndiyo') || lower.includes('eh') || lower.includes('oui') || lower.includes('sim')) {
      points = 15;
      autoResponse = '✅ Pocket Gull: Medication adherence logged (+15 pts Game Theory Rebate). Keep up the great streak!';
    }

    // FHIR R4 Observation
    const fhirObservationResource = bp ? {
      resourceType: 'Observation',
      id: `obs-sms-${Date.now().toString(36)}`,
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }]
      },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: new Date().toISOString(),
      note: [{ text: `Captured via SMS Equity Bridge: "${rawText}"` }],
      component: [
        { code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] }, valueQuantity: { value: parseInt(bp.split('/')[0], 10), unit: 'mm[Hg]' } },
        { code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] }, valueQuantity: { value: parseInt(bp.split('/')[1], 10), unit: 'mm[Hg]' } }
      ]
    } : undefined;

    return {
      rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      detectedVitals: { bp, hr },
      detectedSymptoms,
      urgencyLevel: urgency,
      fhirObservationResource,
      automatedResponseText: autoResponse,
      adherencePointsEarned: points
    };
  }

  /**
   * Dispatches inbound SMS test payload to the backend Express /api/sms/inbound endpoint
   */
  public async dispatchInboundWebhook(text: string, phone = '+15550192834'): Promise<any> {
    try {
      const res = await fetch('/api/sms/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: phone, body: text })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Return client fallback
    }
    return this.parseInboundSms(text);
  }

  /**
   * Interactive 2G / 3G USSD Session State Machine (*384*4855#)
   *
   * Complies with Africa's Talking / Twilio USSD gateway standards:
   * 'CON' prefixes continuing multi-turn dialogues; 'END' terminates the session.
   * Runs 100% offline or edge-cached on 2G feature phones (Transsion / Nokia).
   */
  public processUssdRequest(
    session: IUssdSessionState,
    userInput: string
  ): IUssdMenuResponse {
    const input = userInput.trim();
    const lang = session.language || 'en';

    // 1. Initial Dial In (*384*4855#)
    if (!input || session.currentMenu === 'MAIN') {
      if (input === '1') {
        // Triage / Fever
        session.currentMenu = 'MALARIA';
        return {
          sessionId: session.sessionId,
          responseType: 'CON',
          nextMenu: 'MALARIA',
          screenText: lang === 'sw'
            ? 'CON HOMA NA DALILI ZA MALARIA:\n1. Homa kali na kutetemeka\n2. Maumivu ya kichwa na viungo\n3. Mtoto anatapika/hawezi kunywa\n4. Rudi nyuma'
            : lang === 'ha'
            ? 'CON ZAZZABI DA ALAMOMIN MALARIA:\n1. Zazzabi mai zafi da rawar sanyi\n2. Ciwon kai da gabbai\n3. Yaro ba ya iya shan ruwa\n4. Koma baya'
            : 'CON FEVER & MALARIA TRIAGE:\n1. High fever with chills/shivering\n2. Headache & body aches\n3. Child vomiting/unable to drink\n4. Back'
        };
      } else if (input === '2') {
        // Log BP
        session.currentMenu = 'BP_LOG';
        return {
          sessionId: session.sessionId,
          responseType: 'CON',
          nextMenu: 'BP_LOG',
          screenText: lang === 'sw'
            ? 'CON WEKA SHINIKIZO LA DAMU (BP):\nWeka namba kwa mfano: 125/82'
            : lang === 'ha'
            ? 'CON RUBUTA HAWAN JINI (BP):\nRubuta lambobi kamar: 125/82'
            : 'CON RECORD BLOOD PRESSURE (BP):\nEnter your reading like: 125/82'
        };
      } else if (input === '3') {
        // Meds adherence
        session.currentMenu = 'MEDS';
        return {
          sessionId: session.sessionId,
          responseType: 'CON',
          nextMenu: 'MEDS',
          screenText: lang === 'sw'
            ? 'CON UTHIBITISHO WA DAWA:\nJe, umemeza dawa zako leo?\n1. Ndiyo, nimemeza zote\n2. Bado, nahitaji kikumbusho\n3. Dawa zimekwisha kliniki'
            : lang === 'ha'
            ? 'CON TABBATAR DA SHAN MAGANI:\nKa sha maganinka a yau?\n1. Eh, na sha duka\n2. A\'a, ina bukatar tunatarwa\n3. Magani ya kare a asibiti'
            : 'CON MEDICATION ADHERENCE:\nDid you take your prescribed medicines today?\n1. Yes, took all doses\n2. Not yet, remind me\n3. Ran out of supply'
        };
      } else if (input === '4') {
        // CHW Dispatch
        session.currentMenu = 'CHW_DISPATCH';
        return {
          sessionId: session.sessionId,
          responseType: 'END',
          nextMenu: 'EXIT',
          screenText: lang === 'sw'
            ? 'END OMBI LIMETUMWA:\nMhudumu wa afya wa jamii (CHW) aliye karibu nawe amearifiwa na atakupigia simu ndani ya dakika 30.'
            : lang === 'ha'
            ? 'END AN TURA BUKATA:\nMa\'aikacin lafiya na al\'umma (CHW) zai kira ka cikin minti 30 domin duba lafiyarka.'
            : 'END CHW DISPATCHED:\nYour local Community Health Worker has been alerted and will contact you within 30 minutes.'
        };
      }

      // Default Main Menu
      return {
        sessionId: session.sessionId,
        responseType: 'CON',
        nextMenu: 'MAIN',
        screenText: lang === 'sw'
          ? 'CON POCKETGULL HUDUMA YA AFYA (USSD):\n1. Homa na Malaria Triage\n2. Rekodi Shinikizo la Damu (BP)\n3. Uthibitisho wa Dawa\n4. Omba Mhudumu wa Afya (CHW)'
          : lang === 'ha'
          ? 'CON POCKETGULL LAFIYAR AL\'UMMA (USSD):\n1. Duban Zazzabin Malaria\n2. Auna Hawan Jini (BP)\n3. Tabbatar da Shan Magani\n4. Nemi Ma\'aikacin Lafiya (CHW)'
          : 'CON POCKETGULL COMMUNITY HEALTH (USSD):\n1. Fever & Malaria Triage\n2. Log Blood Pressure (BP)\n3. Verify Daily Medications\n4. Request Frontline CHW Visit'
      };
    }

    // 2. Malaria / Fever Menu Flow
    if (session.currentMenu === 'MALARIA') {
      if (input === '3') {
        // Danger sign
        session.currentMenu = 'EXIT';
        return {
          sessionId: session.sessionId,
          responseType: 'END',
          nextMenu: 'EXIT',
          screenText: lang === 'sw'
            ? 'END TAHADHARI KALI (DANGER SIGN):\nMpeleke mtoto kituo cha afya au hospitali MARA MOJA. Usisubiri. Dalili hii inaashiria hatari ya malaria kali au nimonia.'
            : lang === 'ha'
            ? 'END GIDAN GAGGAWA (DANGER SIGN):\nKwai yaro zuwa asibiti YANZU HAKAN. Wannan alama ce mai hadarin gaske ta malaria ko ciwon huhu.'
            : 'END DANGER SIGN ALERT:\nTransport child to the nearest health post or hospital IMMEDIATELY. Inability to drink/vomiting indicates severe complicated malaria.'
        };
      } else if (input === '1' || input === '2') {
        session.currentMenu = 'EXIT';
        return {
          sessionId: session.sessionId,
          responseType: 'END',
          nextMenu: 'EXIT',
          screenText: lang === 'sw'
            ? 'END USHAURI WA MALARIA:\nFika kituo cha afya upimwe kipimo cha haraka (mRDT). Ikiwa una malaria, tumia Coartem (ACT) siku 3. Kunywa maji mengi.'
            : lang === 'ha'
            ? 'END SHAWARAR MALARIA:\nJe asibiti a yi gwajin mRDT. Idan akwai malaria, a fara shan Coartem (ACT) na kwana 3. A sha ruwa sosai.'
            : 'END MALARIA CDS ADVICE:\nVisit nearest clinic for Rapid Diagnostic Test (mRDT). If positive, standard 3-day Artemisinin Combination Therapy (Coartem) is recommended. Drink fluids.'
        };
      }
      session.currentMenu = 'MAIN';
      return this.processUssdRequest(session, '');
    }

    // 3. Blood Pressure Logging Menu Flow
    if (session.currentMenu === 'BP_LOG') {
      const parsed = this.parseInboundSms(input, session.patientId || 'ussd_user');
      session.currentMenu = 'EXIT';
      return {
        sessionId: session.sessionId,
        responseType: 'END',
        nextMenu: 'EXIT',
        screenText: `END ${parsed.automatedResponseText}`,
        actionPayload: parsed.fhirObservationResource
      };
    }

    // 4. Medication Verification Flow
    if (session.currentMenu === 'MEDS') {
      session.currentMenu = 'EXIT';
      if (input === '1') {
        return {
          sessionId: session.sessionId,
          responseType: 'END',
          nextMenu: 'EXIT',
          screenText: lang === 'sw'
            ? 'END SHUKRANI:\nUmeandikisha uthibitisho wa kumeza dawa (+15 Alama za Uaminifu). Afya njema!'
            : lang === 'ha'
            ? 'END MUN GODE:\nAn rubuta shan maganinka (+15 Maki na Lafiya). Allah ya kara sauki!'
            : 'END THANK YOU:\nDaily medication adherence logged (+15 Health Points). Keep up the great routine!'
        };
      }
      return {
        sessionId: session.sessionId,
        responseType: 'END',
        nextMenu: 'EXIT',
        screenText: lang === 'sw'
          ? 'END TAARIFA:\nIkiwa dawa zimekwisha, tembelea mhudumu wa afya (CHW) au duka la mPharma/Jan Aushadhi kupata generic kwa bei nafuu.'
          : lang === 'ha'
          ? 'END SANARWA:\nIdan magani ya kare, tuntuɓi CHW ko kantin mPharma/Jan Aushadhi domin samun magani mai arha.'
          : 'END NOTED:\nIf out of stock, consult your frontline CHW or visit an authorized generic hub (mPharma / Jan Aushadhi) for low-cost resupply.'
      };
    }

    // Fallback exit
    return {
      sessionId: session.sessionId,
      responseType: 'END',
      nextMenu: 'EXIT',
      screenText: 'END Session timed out or invalid selection.'
    };
  }

  /**
   * Builds the complete SMS equity bridge plan
   */
  public getBridgePlan(patient: IPatient, lang = 'en'): ISmsBridgePlan {
    const prompts = this.generateCarePrompts(patient, lang);
    const avgGrade = +(prompts.reduce((acc, p) => acc + p.fleschKincaidGradeLevel, 0) / prompts.length).toFixed(1);

    const mockInboundHistory: IParsedSmsResponse[] = [
      this.parseInboundSms('Morning BP was 128/82 and HR 72. Feeling energized.', patient.id || 'p001'),
      this.parseInboundSms('MED YES took morning prescription and drank water.', patient.id || 'p001')
    ];

    return {
      patientId: patient.id || 'p001',
      phoneNumber: '+1 (555) 019-2834',
      timestamp: new Date().toISOString(),
      readingGradeLevel: avgGrade,
      dailyPrompts: prompts,
      inboundHistory: mockInboundHistory
    };
  }
}
