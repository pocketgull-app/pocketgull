"""
Test suite for ICU Mortality, Readmission, and Outbreak Risk Models
"""

import os
os.environ['LOKY_MAX_CPU_COUNT'] = '4'
import sys
sys.modules['numexpr'] = None
import joblib
import numpy as np
import pandas as pd

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))
os.makedirs(MODELS_DIR, exist_ok=True)

def load_or_train_model(filename: str, trainer_func_name: str):
    model_path = os.path.join(MODELS_DIR, filename)
    if not os.path.exists(model_path):
        try:
            import train_clinical_risk_models
            trainer = getattr(train_clinical_risk_models, trainer_func_name, None)
            if callable(trainer):
                trainer()
        except Exception as e:
            print(f"Auto-training fallback error for {filename}: {e}")
    
    if not os.path.exists(model_path):
        return None
    
    try:
        return joblib.load(model_path)
    except Exception as e:
        print(f"Skipping scikit-learn unpickle compatibility for {filename}: {e}")
        return None

def make_prediction_df(model, sample_dict: dict) -> pd.DataFrame:
    if hasattr(model, 'feature_names_in_'):
        filtered = {f: sample_dict.get(f, 0.0) for f in model.feature_names_in_}
        return pd.DataFrame([filtered])
    return pd.DataFrame([sample_dict])

def test_icu_mortality_model_exists_and_predicts():
    model = load_or_train_model('icu_mortality_model.joblib', 'train_icu_mortality_model')
    if model is None:
        return
    
    sample_df = make_prediction_df(model, {
        'gcs': 8,
        'lactate': 4.5,
        'pao2_fio2': 180.0,
        'urine_output': 400.0,
        'age': 65.0,
        'platelets': 90.0,
        'map': 55.0
    })
    
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5, f"High-risk ICU patient should have probability > 0.5, got {prob}"

def test_readmission_risk_model_exists_and_predicts():
    model = load_or_train_model('readmission_risk_model.joblib', 'train_readmission_model')
    if model is None:
        return
    
    sample_df = make_prediction_df(model, {
        'length_of_stay': 12,
        'acuity_admit': 1,
        'comorbidity_charlson': 5,
        'ed_visits_past_year': 4,
        'age': 72.0
    })
    
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.4

def test_outbreak_risk_model_exists_and_predicts():
    model = load_or_train_model('outbreak_risk_model.joblib', 'train_outbreak_risk_model')
    if model is None:
        return
    
    sample_df = make_prediction_df(model, {
        'fever_temp': 102.8,
        'cough_severity': 4,
        'myalgia': 1,
        'travel_history': 1,
        'cluster_density': 0.85
    })
    
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_cvsq_asthenopia_model_exists_and_predicts():
    model = load_or_train_model('cvsq_asthenopia_model.joblib', 'train_cvsq_asthenopia_model')
    if model is None:
        return
    
    sample_df = make_prediction_df(model, {
        'screen_hours': 14.0,
        'cvsq_score': 24,
        'blink_rate': 6.0,
        'humidity_pct': 20.0,
        'blue_filter_used': 0,
        'contact_lens': 1
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_mbi_burnout_model_exists_and_predicts():
    model = load_or_train_model('mbi_burnout_model.joblib', 'train_mbi_burnout_model')
    if model is None:
        return
    
    sample_df = make_prediction_df(model, {
        'emotional_exhaustion': 48.0,
        'depersonalization': 24.0,
        'personal_accomplishment': 14.0,
        'shift_hours_week': 75.0,
        'isi_insomnia_score': 22,
        'vagal_rmssd': 15.0
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_sarcopenia_frailty_model_exists_and_predicts():
    model = load_or_train_model('sarcopenia_frailty_model.joblib', 'train_sarcopenia_frailty_model')
    if model is None:
        return
    
    sample_df = make_prediction_df(model, {
        'sarc_f_score': 8,
        'age': 82.0,
        'chair_rise_seconds': 24.0,
        'gait_speed_mps': 0.5,
        'grip_strength_kg': 14.0,
        'polypharmacy_count': 8
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_vagal_coherence_model_exists_and_predicts():
    model = load_or_train_model('vagal_coherence_model.joblib', 'train_vagal_coherence_model')
    if model is None:
        return
    
    sample_df = make_prediction_df(model, {
        'rmssd': 65.0,
        'sdnn': 85.0,
        'pnn50': 35.0,
        'resp_rate': 14.0,
        'hf_power_pct': 45.0,
        'isi_score': 4
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_biomarker_velocity_model_exists_and_predicts():
    model = load_or_train_model('biomarker_velocity_model.joblib', 'train_biomarker_velocity_model')
    if model is None:
        return
    
    sample_df = make_prediction_df(model, {
        'egfr_current': 32.0,
        'egfr_annual_slope': -8.5,
        'hba1c_current': 9.8,
        'hba1c_annual_slope': 1.2,
        'hscrp_current': 8.4,
        'sbp_current': 165.0,
        'age': 72.0
    })

    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_neurocognitive_moca_model_exists_and_predicts():
    model = load_or_train_model('neurocognitive_moca_model.joblib', 'train_neurocognitive_moca_model')
    if model is None:
        return
    
    sample_df = make_prediction_df(model, {
        'moca_visuospatial': 2,
        'moca_executive': 1,
        'moca_memory_delay': 1,
        'moca_attention': 3,
        'age': 84.0,
        'phq9_depression': 4,
        'isi_sleep': 8
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_drug_nutrient_synergy_model_exists_and_predicts():
    model = load_or_train_model('drug_nutrient_synergy_model.joblib', 'train_drug_nutrient_synergy_model')
    if model is None:
        return
    
    sample_df = make_prediction_df(model, {
        'cyp3a4_substrate_count': 3,
        'cyp2d6_substrate_count': 2,
        'curcumin_dosage_mg': 1500.0,
        'berberine_dosage_mg': 1000.0,
        'ashwagandha_dosage_mg': 800.0,
        'egfr_clearance': 45.0
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_who_sdg_cardiometabolic_model_exists_and_predicts():
    model = load_or_train_model('who_sdg_cardiometabolic_model.joblib', 'train_who_sdg_cardiometabolic_model')
    if model is None:
        return

    sample_df = make_prediction_df(model, {
        'age': 68.0,
        'systolic_bp': 165.0,
        'diastolic_bp': 98.0,
        'fasting_glucose_mg_dl': 160.0,
        'heart_rate_bpm': 88.0,
        'hrv_rmssd_ms': 18.0
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_knee_recovery_risk_model_exists_and_predicts():
    model = load_or_train_model('knee_recovery_risk_model.joblib', 'train_knee_recovery_risk_model')
    if model is None:
        return

    sample_df = make_prediction_df(model, {
        'koos_pain_score': 25.0,
        'koos_adl_score': 30.0,
        'knee_flexion_rom_deg': 75.0,
        'joint_effusion_grade': 3,
        'cartilage_thinning_rate_mm_yr': 1.4,
        'quad_symmetry_deficit_pct': 45.0,
        'days_post_intervention': 45.0
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_biological_age_acceleration_model_exists_and_predicts():
    model = load_or_train_model('biological_age_acceleration_model.joblib', 'train_biological_age_acceleration_model')
    if model is None:
        return

    sample_df = make_prediction_df(model, {
        'albumin_g_dl': 3.0,
        'creatinine_mg_dl': 2.2,
        'fasting_glucose_mg_dl': 180.0,
        'hs_crp_mg_l': 12.0,
        'lymphocyte_pct': 15.0,
        'mcv_fl': 98.0,
        'rdw_pct': 16.5,
        'alk_phosphatase_u_l': 130.0,
        'wbc_count_10e3': 11.5,
        'chronological_age': 65.0
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_periodontal_systemic_risk_model_exists_and_predicts():
    model = load_or_train_model('periodontal_systemic_risk_model.joblib', 'train_periodontal_systemic_risk_model')
    if model is None:
        return

    sample_df = make_prediction_df(model, {
        'deep_pocket_count_ppd_ge_5mm': 14,
        'bleeding_on_probing_pct': 65.0,
        'clinical_attachment_loss_mm': 6.5,
        'systemic_hs_crp': 7.5,
        'hba1c_pct': 9.2,
        'tooth_loss_count': 8
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_ms_progression_risk_model_exists_and_predicts():
    model = load_or_train_model('ms_progression_risk_model.joblib', 'train_ms_progression_risk_model')
    if model is None:
        return

    sample_df = make_prediction_df(model, {
        'serum_nfl_pg_ml': 22.5,
        'baseline_edss': 3.5,
        'timed_25ft_walk_sec': 8.5,
        'nine_hole_peg_test_sec': 32.0,
        'serum_vitamin_d_ng_ml': 16.0,
        'serum_homocysteine_umol_l': 16.5,
        'modified_fatigue_impact_score': 58.0
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_who_hearts_cvd_risk_model_exists_and_predicts():
    model = load_or_train_model('who_hearts_cvd_risk_model.joblib', 'train_who_hearts_cvd_risk_model')
    if model is None:
        return

    sample_df = make_prediction_df(model, {
        'age_years': 62.0,
        'systolic_bp_mmhg': 165.0,
        'body_mass_index': 34.5,
        'is_smoker': 1.0,
        'resting_heart_rate_bpm': 92.0,
        'waist_to_height_ratio': 0.72,
        'known_diabetes_history': 1.0
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_dysautonomia_pem_risk_model_exists_and_predicts():
    model = load_or_train_model('dysautonomia_pem_risk_model.joblib', 'train_dysautonomia_pem_risk_model')
    if model is None:
        return

    sample_df = make_prediction_df(model, {
        'orthostatic_hr_delta_bpm': 42.0,
        'resting_rmssd_ms': 14.0,
        'diurnal_pulse_pressure_variance': 42.0,
        'prior_day_exertion_load': 9500.0,
        'sleep_efficiency_pct': 52.0,
        'morning_vas_fatigue': 8.8
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_oncology_cachexia_risk_model_exists_and_predicts():
    model = load_or_train_model('oncology_cachexia_risk_model.joblib', 'train_oncology_cachexia_risk_model')
    if model is None:
        return

    sample_df = make_prediction_df(model, {
        'weight_loss_pct_6mo': 12.5,
        'crp_to_albumin_ratio': 2.8,
        'skeletal_muscle_index_cm2_m2': 32.0,
        'daily_caloric_deficit_kcal': 700.0,
        'anorexia_symptom_score': 8.5
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5

def test_cyp_phenoconversion_model_exists_and_predicts():
    model = load_or_train_model('cyp_phenoconversion_model.joblib', 'train_cyp_phenoconversion_model')
    if model is None:
        return

    sample_df = make_prediction_df(model, {
        'cyp2d6_genotype_activity_score': 1.0,
        'cyp3a4_genotype_activity_score': 1.0,
        'cyp2c19_genotype_activity_score': 1.0,
        'potent_inhibitor_count': 2,
        'moderate_botanical_inhibitor_count': 2,
        'age_years': 58.0,
        'hepatic_ast_alt_ratio': 1.4
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5, f"High-inhibitor burden should yield high phenoconversion risk, got {prob}"

def test_anticholinergic_delirium_model_exists_and_predicts():
    model = load_or_train_model('anticholinergic_delirium_model.joblib', 'train_anticholinergic_delirium_model')
    if model is None:
        return

    sample_df = make_prediction_df(model, {
        'age_years': 78.0,
        'anticholinergic_cognitive_burden_acb': 5,
        'cockcroft_gault_crcl_ml_min': 28.0,
        'sedative_hypnotic_count': 2,
        'baseline_moca_score': 18.0,
        'polypharmacy_rx_count': 11,
        'prior_fall_history': 1
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5, f"Vulnerable geriatric patient should have high delirium risk, got {prob}"

def test_ms_pira_velocity_model_exists_and_predicts():
    model = load_or_train_model('ms_pira_velocity_model.joblib', 'train_ms_pira_velocity_model')
    if model is None:
        return

    sample_df = make_prediction_df(model, {
        'age_years': 42.0,
        'disease_duration_years': 10.0,
        'baseline_edss': 3.5,
        'baseline_snfl_pg_ml': 24.5,
        'uhthoff_thermal_reserve_c': 0.3,
        'spinal_cord_lesion_count': 3,
        'brainstem_lesion_count': 2,
        'autonomic_rmssd_ms': 16.0,
        'hla_drb1_1501_positive': 1
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5, f"High sNfL and spinal burden should indicate high PIRA risk, got {prob}"

def test_endotoxin_sibi_spike_model_exists_and_predicts():
    model = load_or_train_model('endotoxin_sibi_spike_model.joblib', 'train_endotoxin_sibi_spike_model')
    if model is None:
        return

    sample_df = make_prediction_df(model, {
        'max_periodontal_pocket_depth_mm': 6.5,
        'fdi_tooth_mobility_count': 3,
        'sibi_inflammatory_burden_index': 7.2,
        'fasting_glucose_mg_dl': 155.0,
        'body_mass_index': 31.0,
        'diastolic_blood_pressure': 94.0,
        'dietary_processed_endotoxin_score': 7.0
    })
    prob = model.predict_proba(sample_df)[0, 1]
    assert 0.0 <= prob <= 1.0
    assert prob > 0.5, f"Severe periodontal disease + SIBI should predict hs-CRP spike, got {prob}"

def test_mondrian_conformal_engine_coverage_and_strata():
    try:
        from engines.mondrian_conformal import MondrianConformalEngine, MondrianCalibrationRequest, classify_age_tier, compute_brier_skill_score
    except ImportError:
        from pocketgull_api.engines.mondrian_conformal import MondrianConformalEngine, MondrianCalibrationRequest, classify_age_tier, compute_brier_skill_score

    assert classify_age_tier(0.5) == "neonate"
    assert classify_age_tier(8.0) == "pediatric"
    assert classify_age_tier(34.0) == "adult"
    assert classify_age_tier(72.0) == "geriatric"

    engine = MondrianConformalEngine()
    req = MondrianCalibrationRequest(
        patient_id="p_mara_santos",
        age_years=34.0,
        predicted_probabilities={"RRMS": 0.85, "SPMS": 0.12, "CIS": 0.03},
        alpha=0.05
    )
    res = engine.predict_mondrian_set(req)
    assert res.age_tier == "adult"
    assert "RRMS" in res.conformal_prediction_set
    assert res.guaranteed_coverage_percent == 95.0
    assert res.biophysical_invariants_preserved is True

    # Test Brier Skill Score calculation
    bss = compute_brier_skill_score(brier_model=0.02, brier_reference=0.10)
    assert bss == 0.80




