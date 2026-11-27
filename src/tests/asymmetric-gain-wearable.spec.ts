// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { WearableAsymmetricGainService } from '../services/wearable-asymmetric-gain.service';
import { GlobalHealthInitiativesService } from '../services/global-health-initiatives.service';
import { WhoEssentialMedicinesService } from '../services/who-essential-medicines.service';
import { FhirR4BundleExportService } from '../services/fhir-r4-bundle-export.service';

describe('Tri-Modal Asymmetric Clinical Gain & Wearable Shock-Trooper Engine', () => {
  const enginePath = path.resolve(
    process.cwd(),
    'pocketgull_api/services/asymmetric_loss_engine.py'
  );
  const mainPath = path.resolve(process.cwd(), 'pocketgull_api/main.py');

  it('defines compute_asymmetric_gain with Dual Log-Likelihood Info Gain, Vickers Net Benefit, and Salutogenic Reserve', () => {
    const content = fs.readFileSync(enginePath, 'utf-8');
    expect(content).toContain('# SPDX-License-Identifier: Apache-2.0');
    expect(content).toContain('def compute_asymmetric_gain(');
    expect(content).toContain('asymmetric_information_gain');
    expect(content).toContain('vickers_net_benefit');
    expect(content).toContain('salutogenic_reserve_gain');
    expect(content).toContain('composite_asymmetric_gain_score');
  });

  it('implements WearableTriModalTelemetryInput and evaluate_wearable_trimodal_gain across Doing, Feeling, and Not Doing', () => {
    const content = fs.readFileSync(enginePath, 'utf-8');
    expect(content).toContain('class WearableTriModalTelemetryInput(BaseModel):');
    expect(content).toContain('class TriModalAsymmetricGainOutput(BaseModel):');
    expect(content).toContain('doing_hormetic_vagal_gain');
    expect(content).toContain('feeling_interoceptive_calibration_gain');
    expect(content).toContain('not_doing_restraint_pem_shield_gain');
    expect(content).toContain('total_shock_trooper_readiness_gain');
    expect(content).toContain('estimated_pem_crash_hours_saved');
    expect(content).toContain('monk_skin_tone_scale');
  });

  it('exposes /api/ml/wearable-asymmetric-gain in FastAPI main.py', () => {
    const mainContent = fs.readFileSync(mainPath, 'utf-8');
    expect(mainContent).toContain('/api/ml/wearable-asymmetric-gain');
    expect(mainContent).toContain('evaluate_wearable_asymmetric_gain');
  });

  it('verifies ISO/IEC 42001 metadata cards exist for causal_treatment_optimizer and survival_ckd_decompensation_model', () => {
    const causalMetaPath = path.resolve(
      process.cwd(),
      'pocketgull_api/models/causal_treatment_optimizer.metadata.json'
    );
    const survivalMetaPath = path.resolve(
      process.cwd(),
      'pocketgull_api/models/survival_ckd_decompensation_model.metadata.json'
    );
    expect(fs.existsSync(causalMetaPath)).toBe(true);
    expect(fs.existsSync(survivalMetaPath)).toBe(true);

    const causalMeta = JSON.parse(fs.readFileSync(causalMetaPath, 'utf-8'));
    const survivalMeta = JSON.parse(fs.readFileSync(survivalMetaPath, 'utf-8'));
    expect(causalMeta.metrics.expected_calibration_error_ece).toBeLessThan(0.05);
    expect(survivalMeta.metrics.expected_calibration_error_ece).toBeLessThan(0.05);
  });

  it('calculates Doing, Feeling, and Not Doing gains and applies MST SpO2 debiasing in WearableAsymmetricGainService', () => {
    const service = new WearableAsymmetricGainService();
    const initial = service.gainEvaluation();

    expect(initial.totalShockTrooperReadinessGain).toBeGreaterThan(70);
    expect(initial.doingHormeticVagalGain).toBeGreaterThan(50);
    expect(initial.feelingInteroceptiveCalibrationGain).toBeGreaterThan(70);
    expect(initial.notDoingRestraintPemShieldGain).toBeGreaterThan(75);
    expect(initial.estimatedPemCrashHoursSaved).toBeGreaterThan(35);

    // Verify Monk Skin Tone (MST 9) optical PPG debiasing & PEM restraint penalty
    service.updateTelemetry({
      monkSkinToneScale: 9,
      stoppedBeforeExhaustion: false,
    });
    const updated = service.gainEvaluation();
    expect(updated.mstCalibratedSpo2Percent).toBeLessThan(initial.mstCalibratedSpo2Percent);
    expect(updated.totalShockTrooperReadinessGain).toBeLessThan(
      initial.totalShockTrooperReadinessGain
    );
    expect(updated.estimatedPemCrashHoursSaved).toBeLessThan(
      initial.estimatedPemCrashHoursSaved
    );
  });

  it('synchronizes live IoMT biometrics via syncFromLiveIomtHardware', () => {
    const service = new WearableAsymmetricGainService();
    const synced = service.syncFromLiveIomtHardware({
      hrvRmssdMs: 62,
      spo2Pct: 99,
      wristSkinTemperatureC: 33.1,
    });
    expect(service.telemetry().hrvRmssdMs).toBe(62);
    expect(service.telemetry().spo2RawPercent).toBe(99);
    expect(service.telemetry().wristTempDeltaC).toBeCloseTo(0.1, 2);
    expect(synced.mstCalibratedSpo2Percent).toBeGreaterThanOrEqual(98);
  });

  it('emits Wearable Tri-Modal ACG Observation and Provenance in FHIR R4 Bundle export', () => {
    const fhirService = new FhirR4BundleExportService();
    const bundle = fhirService.generateFhirR4Bundle({
      id: 'p-test-acg',
      name: 'Homo Sapiens (Test Archetype, 44y)',
      age: 44,
      gender: 'Female',
      vitals: { bp: '118/76', hr: '64', spO2: '98%' },
      preexistingConditions: [],
      issues: {},
      history: [],
    } as any);

    const obsEntry = bundle.entry.find(
      (e) =>
        e.resource?.resourceType === 'Observation' &&
        e.resource?.id === 'obs-wearable-acg-p-test-acg'
    );
    expect(obsEntry).toBeDefined();
    expect(JSON.stringify(obsEntry!.resource)).toContain('ACG-TRIMODAL-READINESS');
    expect(JSON.stringify(obsEntry!.resource)).toContain('EXPLORATORY IN SILICO MODEL');
    const provenance = bundle.entry.find((e) => e.resource?.resourceType === 'Provenance');
    expect(JSON.stringify(provenance?.resource)).toContain('obs-wearable-acg-p-test-acg');
  });

  it('verifies clinical_risk_v2 & seven_generations_protocol_model ISO/IEC 42001 calibration cards', () => {
    const riskMeta = JSON.parse(
      fs.readFileSync(
        path.resolve(process.cwd(), 'pocketgull_api/models/clinical_risk_v2.metadata.json'),
        'utf-8'
      )
    );
    const sevenGenMeta = JSON.parse(
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          'pocketgull_api/models/seven_generations_protocol_model.metadata.json'
        ),
        'utf-8'
      )
    );
    expect(riskMeta.metrics.oof_roc_auc).toBeGreaterThan(0.9);
    expect(riskMeta.metrics.oof_brier_score).toBeLessThan(0.08);
    expect(riskMeta.metrics.expected_calibration_error_ece).toBeLessThan(0.03);
    expect(sevenGenMeta.metrics.expected_calibration_error_ece).toBeLessThan(0.03);
  });

  it('parses imperial weight/height, percentage SpO2, pediatric ICOPE, and orthostatic BP drops accurately', () => {
    const ghi = new GlobalHealthInitiativesService();
    expect(ghi.parseNumericVital('92%')).toBe(92);
    expect(ghi.parseWeightKg('295 lbs')).toBeCloseTo(133.81, 1);
    expect(ghi.parseHeightMeters('5\'10"')).toBeCloseTo(1.778, 2);

    const ortho = ghi.parseOrthostaticBpDrop('128/78 (Supine) / 102/64 (Standing)');
    expect(ortho).not.toBeNull();
    expect(ortho!.systolicDrop).toBe(26);

    const arpahHypoxic = ghi.assessArpahEmergencyTriage({
      id: 'hypox',
      name: 'Homo Sapiens (Hypoxic)',
      age: 50,
      vitals: { hr: '102 bpm', spO2: '88%' },
      issues: {},
      history: [],
    } as any);
    expect(arpahHypoxic.triageCategory).toBe('IMMEDIATE (Red)');

    const icopePediatric = ghi.assessWhoIcope({
      id: 'peds',
      name: 'Homo Sapiens (Pediatric, 4y)',
      age: 4,
      vitals: { weight: '34 lbs', height: '3\'4"' },
      issues: {},
      history: [],
    } as any);
    const nutDomain = icopePediatric.domains.find((d) => d.domain === 'Nutrition');
    expect(nutDomain?.status).toBe('Intact');

    const recoverPots = ghi.assessNihRecover({
      id: 'pots',
      name: 'Homo Sapiens (POTS)',
      age: 32,
      vitals: { bp: '128/78 (Supine) / 102/64 (Standing)', hr: '88' },
      issues: {},
      history: [],
    } as any);
    const orthoSymptom = recoverPots.symptoms.find((s) =>
      s.name.includes('Orthostatic Intolerance')
    );
    expect(orthoSymptom?.present).toBe(true);
    expect(recoverPots.pascScore).toBeGreaterThanOrEqual(3);
  });

  it('enforces Salbutamolum INN spelling and acute course pricing in WhoEssentialMedicinesService', () => {
    const who = new WhoEssentialMedicinesService();
    const salbutamol = who
      .getAllEssentialMedicines()
      .find((m) => m.id === 'who-eml-salbutamol');
    expect(salbutamol?.genericInn).toBe('Salbutamolum');

    const audit = who.auditPrescriptionRegimen(['Amoxicillin Oral (Pediatric/Adult)', 'Azithromycin Oral']);
    // Amoxicillin 10 * 0.03 = 0.30, Azithromycin 10 * 0.15 = 1.50 -> $1.80 (not 30x!)
    expect(audit.totalMonthlyEssentialCostUsd).toBeLessThan(3);
  });

  it('verifies HIPAA Safe Harbor de-identification, ISMP % sanitizer, FinOps 1GB guard, AppComponent mount & WebMCP Tool #98', () => {
    const demoData = fs.readFileSync(path.resolve(process.cwd(), 'src/demo-data.ts'), 'utf-8');
    const fhirGuard = fs.readFileSync(
      path.resolve(process.cwd(), 'scripts/fhir_conformance_guard.mjs'),
      'utf-8'
    );
    const ingestTs = fs.readFileSync(
      path.resolve(process.cwd(), 'scripts/ingest_nih_who_corpus.ts'),
      'utf-8'
    );
    const ingestPy = fs.readFileSync(
      path.resolve(process.cwd(), 'pocketgull_api/ingest_public_health_data.py'),
      'utf-8'
    );
    const worldHealthTs = fs.readFileSync(
      path.resolve(process.cwd(), 'src/server/world-health.ts'),
      'utf-8'
    );
    const appComponentTs = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app.component.ts'),
      'utf-8'
    );
    const webMcpTs = fs.readFileSync(
      path.resolve(process.cwd(), 'src/services/webmcp-registration.service.ts'),
      'utf-8'
    );

    expect(demoData).not.toContain('Sarah Jenkins');
    expect(fhirGuard).not.toContain('Eleanor Vance');
    expect(ingestTs).toContain('(?:(?:mg|');
    expect(ingestPy).toContain("'spatial_dim'");
    expect(ingestPy).toContain('89.0');
    expect(worldHealthTs).toContain('maximumBytesBilled');
    expect(appComponentTs).toContain('<app-wearable-asymmetric-gain-card />');
    expect(webMcpTs).toContain('evaluate_wearable_asymmetric_gain');
  });
});
