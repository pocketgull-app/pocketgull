import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunityHealthWorkerSuiteComponent } from './community-health-worker-suite.component';
import { WhoEssentialMedicinesService } from '../../services/who-essential-medicines.service';
import { WhoEssentialDiagnosticsService } from '../../services/who-essential-diagnostics.service';

describe('CommunityHealthWorkerSuiteComponent', () => {
  let component: CommunityHealthWorkerSuiteComponent;
  let fixture: ComponentFixture<CommunityHealthWorkerSuiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityHealthWorkerSuiteComponent],
      providers: [WhoEssentialMedicinesService, WhoEssentialDiagnosticsService]
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

  describe('WHO EDL-4 Point-of-Care Rapid Diagnostic Tests (RDTs)', () => {
    it('should switch activeTab to who_edl_rdt and initialize with dual HIV/syphilis assay', () => {
      component.activeTab.set('who_edl_rdt');
      fixture.detectChanges();

      expect(component.activeTab()).toBe('who_edl_rdt');
      expect(component.edlService.activeRdtType()).toBe('hiv_syphilis_dual');
      expect(component.edlService.hivSyphilisAssessment().classification).toBe('SYPHILIS_MONO_REACTIVE');
    });

    it('should evaluate Dual HIV/Syphilis in pregnant patient and issue PMTCT & Benzathine Penicillin alert', () => {
      component.activeTab.set('who_edl_rdt');
      component.edlService.setRdtType('hiv_syphilis_dual');
      component.edlService.hivSyphilisControl.set(true);
      component.edlService.hivReactive.set(true);
      component.edlService.syphilisReactive.set(true);
      component.edlService.isPregnant.set(true);
      fixture.detectChanges();

      const assessment = component.edlService.hivSyphilisAssessment();
      expect(assessment.classification).toBe('DUAL_REACTIVE');
      expect(assessment.acuityTier).toBe('RED');
      expect(assessment.clinicalAction).toContain('prevention of mother-to-child transmission');
      expect(assessment.mandatoryFormulary).toContain('Benzathine Penicillin G 2.4 MU IM single dose');
    });

    it('should evaluate Malaria Pf/Pv and warn of G6PD deficiency testing before 14-day Primaquine', () => {
      component.activeTab.set('who_edl_rdt');
      component.edlService.setRdtType('malaria_pf_pv');
      component.edlService.malariaControl.set(true);
      component.edlService.malariaPfHrp2.set(false);
      component.edlService.malariaPvLdh.set(true);
      fixture.detectChanges();

      const assessment = component.edlService.malariaAssessment();
      expect(assessment.speciesClassification).toBe('P_VIVAX');
      expect(assessment.g6pdWarningRequired).toBe(true);
      expect(assessment.firstLineTherapy).toContain('Primaquine');
      expect(assessment.clinicalAction).toContain('G6PD test mandatory');
    });

    it('should evaluate Dengue NS1 and strictly contraindicate NSAIDs / Aspirin', () => {
      component.activeTab.set('who_edl_rdt');
      component.edlService.setRdtType('dengue_ns1_ab');
      component.edlService.dengueControl.set(true);
      component.edlService.dengueNs1.set(true);
      component.edlService.dengueIgm.set(false);
      component.edlService.dengueIgg.set(false);
      fixture.detectChanges();

      const assessment = component.edlService.dengueAssessment();
      expect(assessment.infectionStage).toBe('ACUTE_PRIMARY');
      expect(assessment.contraindicatedMedications).toContain('Ibuprofen');
      expect(assessment.contraindicatedMedications).toContain('Aspirin');
      expect(assessment.clinicalAction).toContain('Paracetamol only');
    });

    it('should evaluate Sickle Cell Disease RDT and trigger penicillin prophylaxis', () => {
      component.activeTab.set('who_edl_rdt');
      component.edlService.setRdtType('sickle_cell_rdt');
      component.edlService.sickleControl.set(true);
      component.edlService.sicklePhenotype.set('HB_SS_DISEASE');
      component.edlService.sicklePatientAgeMonths.set(18);
      fixture.detectChanges();

      const assessment = component.edlService.sickleCellAssessment();
      expect(assessment.phenotypeResult).toBe('HB_SS_DISEASE');
      expect(assessment.acuityTier).toBe('RED');
      expect(assessment.preventiveBundle.some(b => b.includes('Penicillin V'))).toBe(true);
      expect(assessment.clinicalAction).toContain('SICKLE CELL DISEASE');
    });
  });

  describe('Cold-Chain & Solar Microgrid Watchdog', () => {
    it('should switch activeTab to cold_chain and evaluate optimal +4°C vaccine storage', () => {
      component.activeTab.set('cold_chain');
      component.edlService.updateColdChainTelemetry({ fridgeTempC: 4.0, vvmStage: 1 });
      fixture.detectChanges();

      expect(component.activeTab()).toBe('cold_chain');
      const telem = component.edlService.coldChainTelemetry();
      expect(telem.statusTier).toBe('OPTIMAL');
      expect(telem.statusLabel).toContain('Optimal');
      expect(telem.actionGuidance).toContain('WHO PQS certified range');
    });

    it('should detect FREEZE_HAZARD when refrigerator drops below 0°C', () => {
      component.activeTab.set('cold_chain');
      component.edlService.updateColdChainTelemetry({ fridgeTempC: -1.5 });
      fixture.detectChanges();

      const telem = component.edlService.coldChainTelemetry();
      expect(telem.statusTier).toBe('FREEZE_HAZARD');
      expect(telem.actionGuidance).toContain('Shake Test');
    });

    it('should detect HEAT_EXCURSION when refrigerator exceeds 8°C', () => {
      component.activeTab.set('cold_chain');
      component.edlService.updateColdChainTelemetry({ fridgeTempC: 11.2 });
      fixture.detectChanges();

      const telem = component.edlService.coldChainTelemetry();
      expect(telem.statusTier).toBe('HEAT_EXCURSION');
      expect(telem.actionGuidance).toContain('VVM stickers');
    });

    it('should compute solar microgrid autonomy hours accurately', () => {
      component.activeTab.set('cold_chain');
      component.edlService.updateColdChainTelemetry({ batterySocPct: 80, solarWattsM2: 700 });
      fixture.detectChanges();

      const telem = component.edlService.coldChainTelemetry();
      expect(telem.projectedAutonomyHours).toBeGreaterThan(0);
    });
  });
});
