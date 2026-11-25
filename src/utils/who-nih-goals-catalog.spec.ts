// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect } from 'vitest';
import { MOCK_PATIENTS } from '../mock-patients';
import { evaluatePatientTop10WhoAndNihGoals } from './who-nih-goals-catalog';

describe('WHO & NIH Top 10 Goals Catalog Unit Suite', () => {
  it('1. Equips every MOCK_PATIENT record (including 4 new WHO/NIH archetypes) with 10 WHO + 10 NIH goals', () => {
    expect(MOCK_PATIENTS.length).toBeGreaterThanOrEqual(25);

    for (const patient of MOCK_PATIENTS) {
      expect(patient.whoNihGoals).toBeDefined();
      expect(patient.whoNihGoals!.catalogVersion).toBe('2026.1-top10-nih-who');
      expect(patient.whoNihGoals!.top10WhoGoals.length).toBe(10);
      expect(patient.whoNihGoals!.top10NihGoals.length).toBe(10);
      expect(patient.whoNihGoals!.primaryPriorityGoalIds.length).toBe(4);
    }
  });

  it('2. Prioritizes non-opioid pain (NIH-02) for chronic/neuropathic pain archetypes', () => {
    const kahlo = MOCK_PATIENTS.find(p => p.id === 'p_frida_kahlo');
    expect(kahlo).toBeDefined();
    expect(kahlo!.whoNihGoals!.primaryPriorityGoalIds).toContain('NIH-02');
  });

  it('3. Prioritizes PGx/methylation (NIH-09) & metabolic CVD (WHO-01) accurately per phenotype', () => {
    const santos = MOCK_PATIENTS.find(p => p.id === 'p_mara_santos');
    expect(santos).toBeDefined();
    expect(santos!.whoNihGoals!.primaryPriorityGoalIds).toContain('NIH-09');

    const p001 = MOCK_PATIENTS.find(p => p.id === 'p001')!;
    const evalP001 = evaluatePatientTop10WhoAndNihGoals(p001);
    expect(evalP001.primaryPriorityGoalIds).toContain('WHO-01');
    expect(evalP001.primaryPriorityGoalIds).toContain('NIH-03');
  });

  it('4. Verifies signature WHO/NIH Top 10 priority alignment on all 4 new synthetic archetype patients', () => {
    const oral = MOCK_PATIENTS.find(p => p.id === 'p_who_oral_sibi')!;
    const amr = MOCK_PATIENTS.find(p => p.id === 'p_who_amr_exposome')!;
    const recover = MOCK_PATIENTS.find(p => p.id === 'p_nih_recover_heal')!;
    const pgx = MOCK_PATIENTS.find(p => p.id === 'p_nih_pgx_circadian')!;

    expect(oral.whoNihGoals!.primaryPriorityGoalIds).toContain('WHO-08');
    expect(oral.whoNihGoals!.primaryPriorityGoalIds).toContain('WHO-01');

    expect(amr.whoNihGoals!.primaryPriorityGoalIds).toContain('WHO-06');
    expect(amr.whoNihGoals!.primaryPriorityGoalIds).toContain('WHO-07');

    expect(recover.whoNihGoals!.primaryPriorityGoalIds).toContain('NIH-02');
    expect(recover.whoNihGoals!.primaryPriorityGoalIds).toContain('NIH-06');

    expect(pgx.whoNihGoals!.primaryPriorityGoalIds).toContain('NIH-09');
    expect(pgx.whoNihGoals!.primaryPriorityGoalIds).toContain('NIH-03');
  });
});
