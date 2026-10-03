import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunityHealthWorkerSuiteComponent } from './community-health-worker-suite.component';
import { WhoEssentialMedicinesService } from '../../services/who-essential-medicines.service';
import { WhoEssentialDiagnosticsService } from '../../services/who-essential-diagnostics.service';
import { AustereMeshSyncService } from '../../services/austere-mesh-sync.service';
import { PediatricDosingEngineService } from '../../services/pediatric-dosing-engine.service';

describe('CommunityHealthWorkerSuiteComponent', () => {
  let component: CommunityHealthWorkerSuiteComponent;
  let fixture: ComponentFixture<CommunityHealthWorkerSuiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityHealthWorkerSuiteComponent],
      providers: [
        WhoEssentialMedicinesService,
        WhoEssentialDiagnosticsService,
        AustereMeshSyncService,
        PediatricDosingEngineService
      ]
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

  describe('Local Wi-Fi Mesh Synchronization & P2P Triage Roster', () => {
    it('should switch activeTab to austere_mesh_sync and show mesh network status', () => {
      component.activeTab.set('austere_mesh_sync');
      fixture.detectChanges();

      expect(component.activeTab()).toBe('austere_mesh_sync');
      expect(component.meshSync.connectionStatus()).toBe('MESH_CONNECTED');
      expect(component.meshSync.meshSsid()).toBe('MSF_AUSTERE_MESH_5G');
      expect(component.meshSync.activePeerCount()).toBeGreaterThanOrEqual(3);
    });

    it('should broadcast cold-chain emergency alert and display in active banner', () => {
      component.activeTab.set('austere_mesh_sync');
      fixture.detectChanges();

      const alert = component.meshSync.broadcastColdChainAlert({
        fridgeUnit: 'Field Cooler Bravo',
        temperatureCelsius: -2.0,
        statusTier: 'FREEZE_HAZARD',
        alertMessage: 'Sub-zero freezing alert on HepB supply!'
      });

      expect(component.meshSync.activeEmergencyAlertCount()).toBe(1);
      expect(alert.statusTier).toBe('FREEZE_HAZARD');

      // Acknowledge alert
      component.meshSync.acknowledgeColdChainAlert(alert.alertId);
      expect(component.meshSync.activeEmergencyAlertCount()).toBe(0);
    });

    it('should synchronize patient triage roster across local mesh nodes', () => {
      component.activeTab.set('austere_mesh_sync');
      const prevCount = component.meshSync.triageQueue().length;

      const patient = component.meshSync.enqueueTriagePatient({
        patientToken: 'Patient #109 (Infant F, 9m)',
        ageMonths: 9,
        weightKg: 8.0,
        gender: 'FEMALE',
        muacMm: 118,
        acuityTier: 'YELLOW',
        chiefComplaint: 'Fast breathing 52 bpm, MAM nutrition',
        clinicalCategory: 'Moderate Acute Malnutrition'
      });

      expect(component.meshSync.triageQueue().length).toBe(prevCount + 1);
      expect(patient.status).toBe('WAITING');

      // Transition to IN_CONSULT
      component.meshSync.updateTriageStatus(patient.ticketId, 'IN_CONSULT', 'Dr. Amina (MSF)');
      const inConsult = component.meshSync.triageQueue().find(t => t.ticketId === patient.ticketId);
      expect(inConsult?.status).toBe('IN_CONSULT');
      expect(inConsult?.assignedClinician).toBe('Dr. Amina (MSF)');

      // Transition to DISCHARGED
      component.meshSync.updateTriageStatus(patient.ticketId, 'DISCHARGED');
      const discharged = component.meshSync.triageQueue().find(t => t.ticketId === patient.ticketId);
      expect(discharged?.status).toBe('DISCHARGED');
      expect(discharged?.completedIso).toBeDefined();
    });
  });

  describe('WHO Model List of Essential Medicines for Children (EMLc & IMCI) Pediatric Dosing', () => {
    it('should switch activeTab to pediatric_dosing and calibrate child weight', () => {
      component.activeTab.set('pediatric_dosing');
      component.pediatricDosing.setWeightKg(11.0);
      component.pediatricDosing.setAgeMonths(18);
      fixture.detectChanges();

      expect(component.activeTab()).toBe('pediatric_dosing');
      expect(component.pediatricDosing.childWeightKg()).toBe(11.0);
      expect(component.pediatricDosing.childAgeMonths()).toBe(18);
    });

    it('should calculate Artemether + Lumefantrine (Coartem) weight bands and 6-dose schedule', () => {
      component.activeTab.set('pediatric_dosing');
      component.pediatricDosing.setSelectedMedication('artemether_lumefantrine');

      // 10 kg toddler: 1 tab per dose, 6 doses total
      component.pediatricDosing.setWeightKg(10.0);
      fixture.detectChanges();

      const alDose = component.pediatricDosing.artemetherLumefantrine();
      expect(alDose.isEligible).toBe(true);
      expect(alDose.tabletsPerDose).toBe(1);
      expect(alDose.totalTablets).toBe(6);
      expect(alDose.weightBandLabel).toContain('5 to <15 kg');
      expect(alDose.scheduleHours).toEqual([0, 8, 24, 36, 48, 60]);

      // 18 kg child: 2 tabs per dose, 12 doses total
      component.pediatricDosing.setWeightKg(18.0);
      fixture.detectChanges();

      const alDose2 = component.pediatricDosing.artemetherLumefantrine();
      expect(alDose2.tabletsPerDose).toBe(2);
      expect(alDose2.totalTablets).toBe(12);
      expect(alDose2.weightBandLabel).toContain('15 to <25 kg');
    });

    it('should calculate WHO Reduced Osmolarity ORS Plan B 4-hour rehydration volume', () => {
      component.activeTab.set('pediatric_dosing');
      component.pediatricDosing.setSelectedMedication('ors_rehydration');
      component.pediatricDosing.setWeightKg(10.0);
      component.pediatricDosing.setOrsPlan('PLAN_B');
      fixture.detectChanges();

      const ors = component.pediatricDosing.orsCalculation();
      expect(ors.plan).toBe('PLAN_B');
      expect(ors.totalVolumeMl4Hours).toBe(750); // 10 kg * 75 mL = 750 mL
      expect(ors.hourlyRateMlHour).toBe(188);
      expect(ors.zincAdjunctRequired).toBe(true);
      expect(ors.mixingInstructions).toContain('1.0 Liter');
    });

    it('should calculate Zinc Sulfate 14-day pediatric diarrhea course', () => {
      component.activeTab.set('pediatric_dosing');
      component.pediatricDosing.setSelectedMedication('zinc_sulfate');

      // Under 6 months
      component.pediatricDosing.setAgeMonths(4);
      fixture.detectChanges();
      let zinc = component.pediatricDosing.zincDose();
      expect(zinc.dailyDoseMg).toBe(10);
      expect(zinc.tabletFractionLabel).toBe('1/2 tablet');
      expect(zinc.durationDays).toBe(14);
      expect(zinc.totalTabletsDispensed).toBe(7);

      // Over 6 months
      component.pediatricDosing.setAgeMonths(20);
      fixture.detectChanges();
      zinc = component.pediatricDosing.zincDose();
      expect(zinc.dailyDoseMg).toBe(20);
      expect(zinc.tabletFractionLabel).toBe('1 tablet');
      expect(zinc.totalTabletsDispensed).toBe(14);
    });

    it('should calculate Amoxicillin dispersible tablets for fast-breathing pneumonia', () => {
      component.activeTab.set('pediatric_dosing');
      component.pediatricDosing.setSelectedMedication('amoxicillin_dispersible');

      // Under 10 kg & under 12 months: 1 tablet BID
      component.pediatricDosing.setWeightKg(8.0);
      component.pediatricDosing.setAgeMonths(6);
      fixture.detectChanges();
      let amox = component.pediatricDosing.amoxicillinDose();
      expect(amox.tabletsPerDose).toBe(1);
      expect(amox.doseMg).toBe(250);
      expect(amox.totalTabletsDispensed).toBe(10); // 1 tab x 2 x 5d

      // 10 kg and above: 2 tablets BID
      component.pediatricDosing.setWeightKg(14.0);
      fixture.detectChanges();
      amox = component.pediatricDosing.amoxicillinDose();
      expect(amox.tabletsPerDose).toBe(2);
      expect(amox.doseMg).toBe(500);
      expect(amox.totalTabletsDispensed).toBe(20); // 2 tabs x 2 x 5d
    });
  });
});
