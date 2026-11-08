// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { WearableAsymmetricGainService } from '../services/wearable-asymmetric-gain.service';

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
});
