import { describe, it, expect, beforeEach } from 'vitest';
import { CaregiverReliefService } from './caregiver-relief.service';

describe('CaregiverReliefService (Engine 2: Caregiver Relief & Shadow Patient Portal)', () => {
  let service: CaregiverReliefService;

  beforeEach(() => {
    service = new CaregiverReliefService();
  });

  it('1. Records and structures spoken caregiver shift memo transcript into 4 pillars', () => {
    const transcript = 'Mom ate a warm bowl of oatmeal this morning and drank water. But she seemed dizzy around 2 PM when trying to walk to the bathroom. Mood was good, but she woke up twice last night.';
    const memo = service.recordShiftMemo(transcript, 'ADULT_CHILD');

    expect(memo.id).toContain('shift_memo_');
    expect(memo.caregiverRole).toBe('ADULT_CHILD');
    expect(memo.parsedObservations.nutritionHydration).toContain('ate');
    expect(memo.parsedObservations.mobilitySafety).toContain('dizzy');
    expect(memo.parsedObservations.sleepRestlessness).toContain('woke');
    expect(memo.conciseHandoffSummary).toContain('[Caregiver Shift Summary]');
    expect(service.shiftMemos().length).toBe(1);
  });

  it('2. Generates targeted "What to Ask the Doctor" cheat sheet with clinical rationales', () => {
    const symptomLogs = [{ symptom: 'Dizziness', severity: 7, frequency: 'Daily' }];
    const meds = ['Amlodipine 10mg', 'Lisinopril 20mg'];
    const cheatSheet = service.generateDoctorVisitCheatSheet('patient_10', symptomLogs, meds);

    expect(cheatSheet.top3AdvocacyQuestions.length).toBe(3);
    expect(cheatSheet.top3AdvocacyQuestions[0].questionText).toContain('dizziness');
    expect(cheatSheet.top3AdvocacyQuestions[0].clinicalRationale).toContain('orthostatic hypotension');
    expect(cheatSheet.medicationReconciliationNote).toContain('2 active medications');
    expect(cheatSheet.caregiverEmpowermentTip).toContain('primary witness');
  });

  it('3. Finds subsidized respite care resources for US and UK jurisdictions', () => {
    const usResources = service.findLocalRespiteResources('US');
    expect(usResources.length).toBeGreaterThanOrEqual(3);
    expect(usResources.some(r => r.name.includes('ARCH'))).toBe(true);

    const ukResources = service.findLocalRespiteResources('UK');
    expect(ukResources.length).toBeGreaterThanOrEqual(1);
    expect(ukResources[0].name).toContain('Carer’s Allowance');
  });

  it('4. Assesses caregiver wellbeing and flags CRITICAL_BURNOUT when sleep < 5 hours', () => {
    const criticalEval = service.assessCaregiverWellbeing(9, 4.5);
    expect(criticalEval.riskLevel).toBe('CRITICAL_BURNOUT');
    expect(criticalEval.respiteReferralTriggered).toBe(true);
    expect(criticalEval.supportiveAdvice).toContain('Severe caregiver exhaustion detected');

    const stableEval = service.assessCaregiverWellbeing(3, 7.5);
    expect(stableEval.riskLevel).toBe('LOW');
    expect(stableEval.respiteReferralTriggered).toBe(false);
  });
});
