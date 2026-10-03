import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunityHealthWorkerSuiteComponent } from './community-health-worker-suite.component';
import { WhoEssentialMedicinesService } from '../../services/who-essential-medicines.service';

describe('CommunityHealthWorkerSuiteComponent', () => {
  let component: CommunityHealthWorkerSuiteComponent;
  let fixture: ComponentFixture<CommunityHealthWorkerSuiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityHealthWorkerSuiteComponent],
      providers: [WhoEssentialMedicinesService]
    }).compileComponents();

    fixture = TestBed.createComponent(CommunityHealthWorkerSuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the CHW Suite component', () => {
    expect(component).toBeTruthy();
  });

  it('should classify MUAC correctly for Severe Acute Malnutrition (SAM)', () => {
    component.muacMm.set(110); // <115mm
    component.edemaGrade.set('NONE');
    fixture.detectChanges();

    const triage = component.muacTriage();
    expect(triage.statusTier).toBe('SEVERE_ACUTE_MALNUTRITION');
    expect(triage.statusLabel).toContain('SAM');
    expect(triage.rutfSachetsPerDay).toBeGreaterThanOrEqual(2);
  });

  it('should flag SAM when bilateral pitting edema is present regardless of MUAC', () => {
    component.muacMm.set(135); // Normal circumference
    component.edemaGrade.set('GRADE_2'); // Edema present
    fixture.detectChanges();

    const triage = component.muacTriage();
    expect(triage.statusTier).toBe('SEVERE_ACUTE_MALNUTRITION');
    expect(triage.clinicalAction).toContain('Kwashiorkor');
  });

  it('should classify MUAC correctly for Moderate Acute Malnutrition (MAM)', () => {
    component.muacMm.set(120); // 115-124mm
    component.edemaGrade.set('NONE');
    fixture.detectChanges();

    const triage = component.muacTriage();
    expect(triage.statusTier).toBe('MODERATE_ACUTE_MALNUTRITION');
    expect(triage.statusLabel).toContain('MAM');
  });

  it('should classify tachypnea and fast breathing according to WHO IMCI age cutoffs', () => {
    // Age 2 to 11 months, cutoff is >=50 bpm
    component.respiratoryAgeGroup.set('2_11_MONTHS');
    component.respiratoryBpm.set(54);
    fixture.detectChanges();

    let pneu = component.pneumoniaTriage();
    expect(pneu.classification).toBe('PNEUMONIA');
    expect(pneu.recommendedTreatment).toContain('Amoxicillin');

    // Add chest indrawing -> triggers Severe Pneumonia (RED)
    component.chestIndrawing.set(true);
    fixture.detectChanges();

    pneu = component.pneumoniaTriage();
    expect(pneu.classification).toBe('SEVERE_PNEUMONIA');
    expect(pneu.recommendedTreatment).toContain('hospital referral');
  });

  it('should classify dehydration and calculate ORS volume according to WHO Plan B', () => {
    component.childWeightKg.set(10);
    component.generalState.set('IRRITABLE');
    component.thirstState.set('EAGER');
    fixture.detectChanges();

    const deh = component.dehydrationTriage();
    expect(deh.plan).toBe('PLAN_B');
    expect(deh.orsVolumeMl4Hours).toBe(750); // 10kg * 75 mL = 750 mL
    expect(deh.zincDoseMgDaily).toBe(20);
  });

  it('should compute compact QR handoff payload', () => {
    const payloadStr = component.qrPayloadString();
    expect(payloadStr).toContain('POCKETGULL_CHW_HANDOFF_V1');
    const parsed = JSON.parse(payloadStr);
    expect(parsed.patient.muacMm).toBe(128);
  });

  describe('Frontline Vernacular Voice & Audio Prompts', () => {
    it('should initialize with top 5 frontline languages and default to English', () => {
      const langs = component.voiceService.languages();
      expect(langs.length).toBe(5);
      expect(component.voiceService.activeLanguageCode()).toBe('en');

      const prompt = component.currentTriageVoicePrompt();
      expect(prompt).toBeTruthy();
      expect(prompt.languageCode).toBe('en');
      expect(prompt.direction).toBe('ltr');
    });

    it('should switch language to Swahili and update current triage prompt', () => {
      component.selectVernacularLanguage('sw');
      fixture.detectChanges();

      expect(component.voiceService.activeLanguageCode()).toBe('sw');
      const prompt = component.currentTriageVoicePrompt();
      expect(prompt.languageCode).toBe('sw');
      expect(prompt.promptText).toContain('Kipimo cha mkono');
      expect(prompt.promptText).toContain('Mtoto ana lishe nzuri');
      expect(prompt.direction).toBe('ltr');
    });

    it('should switch language to Arabic and enforce RTL text direction', () => {
      component.selectVernacularLanguage('ar');
      fixture.detectChanges();

      expect(component.voiceService.activeLanguageCode()).toBe('ar');
      const prompt = component.currentTriageVoicePrompt();
      expect(prompt.languageCode).toBe('ar');
      expect(prompt.direction).toBe('rtl');
      expect(prompt.promptText).toContain('قياس الذراع');
      expect(prompt.promptText).toContain('تغذية الطفل جيدة');
    });

    it('should update prompt dynamically when switching triage tabs to Tachypnea Counter', () => {
      component.selectVernacularLanguage('es');
      component.activeTab.set('pneumonia_timer');
      component.respiratoryAgeGroup.set('2_11_MONTHS');
      component.respiratoryBpm.set(52); // Fast breathing -> Pneumonia
      fixture.detectChanges();

      const prompt = component.currentTriageVoicePrompt();
      expect(prompt.acuityTier).toBe('YELLOW');
      expect(prompt.languageCode).toBe('es');
      expect(prompt.promptText).toContain('amoxicilina');
    });

    it('should invoke voiceService.speakPrompt when speakCurrentTriage is called', async () => {
      const speakSpy = vi.spyOn(component.voiceService, 'speakPrompt').mockResolvedValue();
      component.selectVernacularLanguage('hi');
      fixture.detectChanges();

      component.speakCurrentTriage();
      expect(speakSpy).toHaveBeenCalledWith(
        component.currentTriageVoicePrompt().promptText,
        'hi'
      );
    });

    it('should invoke voiceService.stopSpeaking when stopSpeaking is called', () => {
      const stopSpy = vi.spyOn(component.voiceService, 'stopSpeaking');
      component.stopSpeaking();
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should play acoustic attention cue on tapBreathing', () => {
      const cueSpy = vi.spyOn(component.voiceService, 'playAcousticAttentionCue');
      component.tapBreathing();
      expect(cueSpy).toHaveBeenCalledWith(700, 70);
    });
  });
});
