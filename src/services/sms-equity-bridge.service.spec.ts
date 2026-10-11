import '@angular/compiler';
import { SmsEquityBridgeService } from './sms-equity-bridge.service';
import { IPatient } from './patient.types';

describe('SmsEquityBridgeService - Health Equity SMS Bridge Suite', () => {
  let service: SmsEquityBridgeService;

  const mockPatient: IPatient = {
    id: 'p001',
    name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
    age: 58,
    gender: 'Male',
    lastVisit: '2026-08-19',
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: '',
    medications: [],
    dietarySupplements: [],
    vitals: { bp: '148/94', hr: '76', spO2: '98%', temp: '36.6', weight: '82', height: '175' },
    preexistingConditions: ['Essential Hypertension', 'Type 2 Diabetes']
  };

  beforeEach(() => {
    service = new SmsEquityBridgeService();
  });

  it('1. Generates 8th-grade-or-lower reading level daily SMS care prompts', () => {
    const plan = service.getBridgePlan(mockPatient);
    expect(plan.dailyPrompts.length).toBe(3);
    expect(plan.readingGradeLevel).toBeLessThanOrEqual(8.0);
    expect(plan.dailyPrompts[0].charCount).toBeLessThanOrEqual(160);
  });

  it('2. Parses natural language inbound SMS and extracts blood pressure & dizziness symptom', () => {
    const inbound = 'My BP 138/88 pulse 74 feeling dizzy today';
    const parsed = service.parseInboundSms(inbound, 'p001');

    expect(parsed.detectedVitals.bp).toBe('138/88');
    expect(parsed.detectedVitals.hr).toBe(74);
    expect(parsed.detectedSymptoms).toContain('Dizziness');
    expect(parsed.urgencyLevel).toBe('ELEVATED');
    expect(parsed.fhirObservationResource).toBeDefined();
    expect(parsed.fhirObservationResource?.['resourceType']).toBe('Observation');
    expect(parsed.adherencePointsEarned).toBe(15);
  });

  it('3. Triggers critical emergency response for severe chest pain text', () => {
    const inbound = 'Having sharp chest pain and my BP 190/110';
    const parsed = service.parseInboundSms(inbound, 'p001');

    expect(parsed.urgencyLevel).toBe('CRITICAL_CALL_911');
    expect(parsed.automatedResponseText).toContain('EMERGENCY ALERT');
    expect(parsed.adherencePointsEarned).toBe(0);
  });

  it('4. Generates localized prompts across multiple languages (Spanish, German, Japanese)', () => {
    const spanishPlan = service.getBridgePlan(mockPatient, 'es');
    expect(spanishPlan.dailyPrompts[0].messageBody).toContain('presión');

    const germanPlan = service.getBridgePlan(mockPatient, 'de');
    expect(germanPlan.dailyPrompts[0].messageBody).toContain('Blutdruck');

    const japanesePlan = service.getBridgePlan(mockPatient, 'ja');
    expect(japanesePlan.dailyPrompts[0].messageBody).toContain('血圧');
  });

  it('5. Awards game theory adherence points on medication confirmation', () => {
    const inbound = 'MED YES took morning pills with breakfast';
    const parsed = service.parseInboundSms(inbound, 'p001');
    expect(parsed.adherencePointsEarned).toBe(15);
    expect(parsed.automatedResponseText).toContain('Medication adherence logged');
  });

  it('6. Generates localized Swahili and Hausa 2G SMS prompts for frontline health equity', () => {
    const swahiliPlan = service.getBridgePlan(mockPatient, 'sw');
    expect(swahiliPlan.dailyPrompts[0].messageBody).toContain('shinikizo la damu');
    expect(swahiliPlan.dailyPrompts[1].messageBody).toContain('dawa zako');

    const hausaPlan = service.getBridgePlan(mockPatient, 'ha');
    expect(hausaPlan.dailyPrompts[0].messageBody).toContain('hawan jini');
    expect(hausaPlan.dailyPrompts[1].messageBody).toContain('maganinka');
  });

  it('7. Parses febrile symptom and multilingual affirmative medication adherence (Swahili/Hausa)', () => {
    const inboundFever = 'BP 118/76 feeling high fever and chills today';
    const parsedFever = service.parseInboundSms(inboundFever, 'p001');
    expect(parsedFever.detectedSymptoms).toContain('Febrile / Malaria Screen Indicated');
    expect(parsedFever.urgencyLevel).toBe('ELEVATED');

    const inboundSwahiliMed = 'Ndiyo nimekunywa dawa zangu';
    const parsedSw = service.parseInboundSms(inboundSwahiliMed, 'p001');
    expect(parsedSw.adherencePointsEarned).toBe(15);
  });

  it('8. Simulates interactive USSD session (*384*4855#) for Malaria Triage and Danger Sign', () => {
    const session = {
      sessionId: 'sess_ussd_001',
      phoneNumber: '+254712345678',
      serviceCode: '*384*4855#',
      currentMenu: 'MAIN' as const,
      language: 'en' as const,
      collectedData: {}
    };

    // Step 1: Initial dial-in
    const initRes = service.processUssdRequest(session, '');
    expect(initRes.responseType).toBe('CON');
    expect(initRes.screenText).toContain('POCKETGULL COMMUNITY HEALTH');

    // Step 2: User selects option '1' (Fever & Malaria)
    const triageMenu = service.processUssdRequest(session, '1');
    expect(triageMenu.responseType).toBe('CON');
    expect(triageMenu.screenText).toContain('FEVER & MALARIA TRIAGE');

    // Step 3: User flags option '3' (Child vomiting/unable to drink)
    const dangerRes = service.processUssdRequest(session, '3');
    expect(dangerRes.responseType).toBe('END');
    expect(dangerRes.screenText).toContain('DANGER SIGN ALERT');
    expect(dangerRes.screenText).toContain('IMMEDIATELY');
  });

  it('9. Simulates interactive USSD blood pressure capture and FHIR observation creation', () => {
    const session = {
      sessionId: 'sess_ussd_002',
      phoneNumber: '+2348031234567',
      serviceCode: '*384*4855#',
      currentMenu: 'MAIN' as const,
      language: 'en' as const,
      patientId: 'patient_af_09',
      collectedData: {}
    };

    // Dial into BP Log
    service.processUssdRequest(session, '2');
    expect(session.currentMenu).toBe('BP_LOG');

    // User submits reading '134/86'
    const bpResult = service.processUssdRequest(session, '134/86');
    expect(bpResult.responseType).toBe('END');
    expect(bpResult.actionPayload).toBeDefined();
    expect((bpResult.actionPayload as any)?.resourceType).toBe('Observation');
    expect((bpResult.actionPayload as any)?.subject?.reference).toBe('Patient/patient_af_09');
  });

  it('10. Simulates interactive USSD session in Swahili for frontline CHW dispatch', () => {
    const session = {
      sessionId: 'sess_ussd_003',
      phoneNumber: '+255784112233',
      serviceCode: '*384*4855#',
      currentMenu: 'MAIN' as const,
      language: 'sw' as const,
      collectedData: {}
    };

    // Initial dial in Swahili
    const mainSw = service.processUssdRequest(session, '');
    expect(mainSw.screenText).toContain('POCKETGULL HUDUMA YA AFYA');

    // Select option '4' (Omba Mhudumu wa Afya / CHW)
    const chwRes = service.processUssdRequest(session, '4');
    expect(chwRes.responseType).toBe('END');
    expect(chwRes.screenText).toContain('OMBI LIMETUMWA');
    expect(chwRes.screenText).toContain('dakika 30');
  });
});

