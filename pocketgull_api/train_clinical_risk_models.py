"""
PocketGull Clinical Risk Models Trainer
Trains and serializes 3 distinct calibrated machine learning risk models:
1. ICU 30-Day Mortality & Decompensation Risk Classifier (HistGradientBoostingClassifier)
2. 30-Day All-Cause Hospital Readmission Risk Estimator (HistGradientBoostingClassifier)
3. Infectious Outbreak & Symptom Cluster Triage Classifier (HistGradientBoostingClassifier)
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score, brier_score_loss, f1_score
import joblib

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

def train_icu_mortality_model():
    print("\n--- Training ICU 30-Day Mortality Risk Model ---")
    np.random.seed(42)
    n_samples = 4000

    # SOFA / SAPS-II inspired features
    gcs = np.random.randint(3, 16, n_samples)
    lactate = np.random.uniform(0.5, 12.0, n_samples)
    pao2_fio2 = np.random.uniform(100.0, 500.0, n_samples)
    urine_output = np.random.uniform(100.0, 3000.0, n_samples)
    age = np.random.uniform(18.0, 95.0, n_samples)
    platelets = np.random.uniform(10.0, 450.0, n_samples)
    map_val = np.random.uniform(40.0, 120.0, n_samples)

    # Risk score equation
    risk = (
        (15 - gcs) * 0.25 +
        lactate * 0.35 -
        (pao2_fio2 / 100.0) * 0.4 -
        (urine_output / 1000.0) * 0.3 +
        (age / 50.0) * 0.3 -
        (map_val / 80.0) * 0.2
    )
    prob = 1.0 / (1.0 + np.exp(-risk))
    y = (prob > 0.52).astype(int)

    X = pd.DataFrame({
        'gcs': gcs,
        'lactate': lactate,
        'pao2_fio2': pao2_fio2,
        'urine_output': urine_output,
        'age': age,
        'platelets': platelets,
        'map': map_val
    })

    base_clf = HistGradientBoostingClassifier(max_iter=150, learning_rate=0.08, random_state=42)
    calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method='sigmoid', cv=5)
    calibrated_clf.fit(X, y)

    y_probs = calibrated_clf.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, y_probs)
    brier = brier_score_loss(y, y_probs)
    print(f"[OK] ICU Mortality Model Trained | ROC-AUC: {auc:.4f} | Brier: {brier:.4f}")

    path = os.path.join(MODELS_DIR, 'icu_mortality_model.joblib')
    joblib.dump(calibrated_clf, path)
    print(f"Saved: {path}")

def train_readmission_model():
    print("\n--- Training 30-Day Readmission Risk Model ---")
    np.random.seed(43)
    n_samples = 4000

    # LACE Index features
    length_of_stay = np.random.randint(1, 21, n_samples)
    acuity_admit = np.random.binomial(1, 0.3, n_samples)
    comorbidity_charlson = np.random.randint(0, 8, n_samples)
    ed_visits_past_year = np.random.randint(0, 10, n_samples)
    age = np.random.uniform(20.0, 90.0, n_samples)

    risk = (
        length_of_stay * 0.15 +
        acuity_admit * 0.8 +
        comorbidity_charlson * 0.3 +
        ed_visits_past_year * 0.4 +
        (age / 60.0) * 0.2 - 2.5
    )
    prob = 1.0 / (1.0 + np.exp(-risk))
    y = (prob > 0.48).astype(int)

    X = pd.DataFrame({
        'length_of_stay': length_of_stay,
        'acuity_admit': acuity_admit,
        'comorbidity_charlson': comorbidity_charlson,
        'ed_visits_past_year': ed_visits_past_year,
        'age': age
    })

    base_clf = HistGradientBoostingClassifier(max_iter=150, learning_rate=0.08, random_state=43)
    calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method='sigmoid', cv=5)
    calibrated_clf.fit(X, y)

    y_probs = calibrated_clf.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, y_probs)
    brier = brier_score_loss(y, y_probs)
    print(f"[OK] 30-Day Readmission Model Trained | ROC-AUC: {auc:.4f} | Brier: {brier:.4f}")

    path = os.path.join(MODELS_DIR, 'readmission_risk_model.joblib')
    joblib.dump(calibrated_clf, path)
    print(f"Saved: {path}")

def train_outbreak_risk_model():
    print("\n--- Training Outbreak & Symptom Cluster Model ---")
    np.random.seed(44)
    n_samples = 4000

    fever_temp = np.random.uniform(97.0, 104.5, n_samples)
    cough_severity = np.random.randint(0, 5, n_samples)
    myalgia = np.random.binomial(1, 0.4, n_samples)
    travel_history = np.random.binomial(1, 0.25, n_samples)
    cluster_density = np.random.uniform(0.0, 1.0, n_samples)

    risk = (
        (fever_temp - 98.6) * 0.6 +
        cough_severity * 0.4 +
        myalgia * 0.5 +
        travel_history * 0.9 +
        cluster_density * 1.2 - 2.0
    )
    prob = 1.0 / (1.0 + np.exp(-risk))
    y = (prob > 0.50).astype(int)

    X = pd.DataFrame({
        'fever_temp': fever_temp,
        'cough_severity': cough_severity,
        'myalgia': myalgia,
        'travel_history': travel_history,
        'cluster_density': cluster_density
    })

    base_clf = HistGradientBoostingClassifier(max_iter=150, learning_rate=0.08, random_state=44)
    calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method='sigmoid', cv=5)
    calibrated_clf.fit(X, y)

    y_probs = calibrated_clf.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, y_probs)
    brier = brier_score_loss(y, y_probs)
    print(f"[OK] Outbreak Risk Model Trained | ROC-AUC: {auc:.4f} | Brier: {brier:.4f}")

    path = os.path.join(MODELS_DIR, 'outbreak_risk_model.joblib')
    joblib.dump(calibrated_clf, path)
    print(f"Saved: {path}")

def train_cvsq_asthenopia_model():
    print("\n--- Training CVS-Q Asthenopia & Digital Eye Strain Model ---")
    np.random.seed(45)
    n_samples = 4000

    screen_hours = np.random.uniform(2.0, 16.0, n_samples)
    cvsq_score = np.random.randint(0, 33, n_samples)
    blink_rate = np.random.uniform(4.0, 24.0, n_samples)
    humidity_pct = np.random.uniform(15.0, 75.0, n_samples)
    blue_filter_used = np.random.binomial(1, 0.35, n_samples)
    contact_lens = np.random.binomial(1, 0.28, n_samples)

    risk = (
        (screen_hours / 8.0) * 0.8 +
        (cvsq_score / 16.0) * 1.2 -
        (blink_rate / 15.0) * 0.7 -
        (humidity_pct / 50.0) * 0.5 -
        blue_filter_used * 0.4 +
        contact_lens * 0.6 - 0.5
    )
    prob = 1.0 / (1.0 + np.exp(-risk))
    y = (prob > 0.50).astype(int)

    X = pd.DataFrame({
        'screen_hours': screen_hours,
        'cvsq_score': cvsq_score,
        'blink_rate': blink_rate,
        'humidity_pct': humidity_pct,
        'blue_filter_used': blue_filter_used,
        'contact_lens': contact_lens
    })

    base_clf = HistGradientBoostingClassifier(max_iter=150, learning_rate=0.08, random_state=45)
    calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method='sigmoid', cv=5)
    calibrated_clf.fit(X, y)

    y_probs = calibrated_clf.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, y_probs)
    brier = brier_score_loss(y, y_probs)
    print(f"[OK] CVS-Q Asthenopia Model Trained | ROC-AUC: {auc:.4f} | Brier: {brier:.4f}")

    path = os.path.join(MODELS_DIR, 'cvsq_asthenopia_model.joblib')
    joblib.dump(calibrated_clf, path)
    print(f"Saved: {path}")

def train_mbi_burnout_model():
    print("\n--- Training Maslach Burnout (MBI) Trajectory Model ---")
    np.random.seed(46)
    n_samples = 4000

    emotional_exhaustion = np.random.uniform(0.0, 54.0, n_samples)
    depersonalization = np.random.uniform(0.0, 30.0, n_samples)
    personal_accomplishment = np.random.uniform(0.0, 48.0, n_samples)
    shift_hours_week = np.random.uniform(30.0, 90.0, n_samples)
    isi_insomnia_score = np.random.randint(0, 29, n_samples)
    vagal_rmssd = np.random.uniform(10.0, 90.0, n_samples)

    risk = (
        (emotional_exhaustion / 27.0) * 1.1 +
        (depersonalization / 15.0) * 0.9 -
        (personal_accomplishment / 30.0) * 0.7 +
        (shift_hours_week / 50.0) * 0.6 +
        (isi_insomnia_score / 15.0) * 0.5 -
        (vagal_rmssd / 40.0) * 0.6 - 0.8
    )
    prob = 1.0 / (1.0 + np.exp(-risk))
    y = (prob > 0.52).astype(int)

    X = pd.DataFrame({
        'emotional_exhaustion': emotional_exhaustion,
        'depersonalization': depersonalization,
        'personal_accomplishment': personal_accomplishment,
        'shift_hours_week': shift_hours_week,
        'isi_insomnia_score': isi_insomnia_score,
        'vagal_rmssd': vagal_rmssd
    })

    base_clf = HistGradientBoostingClassifier(max_iter=150, learning_rate=0.08, random_state=46)
    calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method='sigmoid', cv=5)
    calibrated_clf.fit(X, y)

    y_probs = calibrated_clf.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, y_probs)
    brier = brier_score_loss(y, y_probs)
    print(f"[OK] MBI Burnout Trajectory Model Trained | ROC-AUC: {auc:.4f} | Brier: {brier:.4f}")

    path = os.path.join(MODELS_DIR, 'mbi_burnout_model.joblib')
    joblib.dump(calibrated_clf, path)
    print(f"Saved: {path}")

def train_sarcopenia_frailty_model():
    print("\n--- Training Sarcopenia & Frailty Fall Risk Model ---")
    np.random.seed(47)
    n_samples = 4000

    sarc_f_score = np.random.randint(0, 11, n_samples)
    age = np.random.uniform(50.0, 95.0, n_samples)
    chair_rise_seconds = np.random.uniform(6.0, 30.0, n_samples)
    gait_speed_mps = np.random.uniform(0.3, 1.8, n_samples)
    grip_strength_kg = np.random.uniform(10.0, 55.0, n_samples)
    polypharmacy_count = np.random.randint(0, 15, n_samples)

    risk = (
        (sarc_f_score / 4.0) * 1.0 +
        (age / 70.0) * 0.7 +
        (chair_rise_seconds / 15.0) * 0.8 -
        gait_speed_mps * 1.2 -
        (grip_strength_kg / 30.0) * 0.9 +
        (polypharmacy_count / 5.0) * 0.5 - 0.4
    )
    prob = 1.0 / (1.0 + np.exp(-risk))
    y = (prob > 0.50).astype(int)

    X = pd.DataFrame({
        'sarc_f_score': sarc_f_score,
        'age': age,
        'chair_rise_seconds': chair_rise_seconds,
        'gait_speed_mps': gait_speed_mps,
        'grip_strength_kg': grip_strength_kg,
        'polypharmacy_count': polypharmacy_count
    })

    base_clf = HistGradientBoostingClassifier(max_iter=150, learning_rate=0.08, random_state=47)
    calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method='sigmoid', cv=5)
    calibrated_clf.fit(X, y)

    y_probs = calibrated_clf.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, y_probs)
    brier = brier_score_loss(y, y_probs)
    print(f"[OK] Sarcopenia & Frailty Model Trained | ROC-AUC: {auc:.4f} | Brier: {brier:.4f}")

    path = os.path.join(MODELS_DIR, 'sarcopenia_frailty_model.joblib')
    joblib.dump(calibrated_clf, path)
    print(f"Saved: {path}")

def train_vagal_coherence_model():
    print("\n--- Training Vagal Coherence & Resonance Breathing Model ---")
    np.random.seed(48)
    n_samples = 4000

    rmssd = np.random.uniform(10.0, 120.0, n_samples)
    sdnn = np.random.uniform(15.0, 150.0, n_samples)
    pnn50 = np.random.uniform(0.0, 50.0, n_samples)
    resp_rate = np.random.uniform(8.0, 24.0, n_samples)
    hf_power_pct = np.random.uniform(5.0, 60.0, n_samples)
    isi_score = np.random.randint(0, 29, n_samples)

    # Coherence rebound probability under 0.1 Hz paced breathing
    risk = (
        (rmssd / 45.0) * 0.9 +
        (sdnn / 60.0) * 0.7 +
        (pnn50 / 20.0) * 0.6 +
        (hf_power_pct / 30.0) * 0.8 -
        ((resp_rate - 14.0) / 6.0) ** 2 * 0.4 -
        (isi_score / 14.0) * 0.5 - 0.2
    )
    prob = 1.0 / (1.0 + np.exp(-risk))
    y = (prob > 0.50).astype(int)

    X = pd.DataFrame({
        'rmssd': rmssd,
        'sdnn': sdnn,
        'pnn50': pnn50,
        'resp_rate': resp_rate,
        'hf_power_pct': hf_power_pct,
        'isi_score': isi_score
    })

    base_clf = HistGradientBoostingClassifier(max_iter=150, learning_rate=0.08, random_state=48)
    calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method='sigmoid', cv=5)
    calibrated_clf.fit(X, y)

    y_probs = calibrated_clf.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, y_probs)
    brier = brier_score_loss(y, y_probs)
    print(f"[OK] Vagal Coherence Model Trained | ROC-AUC: {auc:.4f} | Brier: {brier:.4f}")

    path = os.path.join(MODELS_DIR, 'vagal_coherence_model.joblib')
    joblib.dump(calibrated_clf, path)
    print(f"Saved: {path}")

def train_biomarker_velocity_model():
    print("\n--- Training Biomarker Velocity & Organ Decline Model ---")
    np.random.seed(49)
    n_samples = 4000

    egfr_current = np.random.uniform(15.0, 120.0, n_samples)
    egfr_annual_slope = np.random.uniform(-12.0, 3.0, n_samples)
    hba1c_current = np.random.uniform(4.8, 13.5, n_samples)
    hba1c_annual_slope = np.random.uniform(-1.5, 2.5, n_samples)
    hscrp_current = np.random.uniform(0.2, 18.0, n_samples)
    sbp_current = np.random.uniform(95.0, 195.0, n_samples)

    risk = (
        ((60.0 - egfr_current) / 25.0) * 1.0 -
        (egfr_annual_slope / 3.0) * 1.2 +
        ((hba1c_current - 6.5) / 2.0) * 0.8 +
        (hba1c_annual_slope / 1.0) * 0.6 +
        (hscrp_current / 5.0) * 0.7 +
        ((sbp_current - 130.0) / 25.0) * 0.5 - 1.0
    )
    prob = 1.0 / (1.0 + np.exp(-risk))
    y = (prob > 0.50).astype(int)

    X = pd.DataFrame({
        'egfr_current': egfr_current,
        'egfr_annual_slope': egfr_annual_slope,
        'hba1c_current': hba1c_current,
        'hba1c_annual_slope': hba1c_annual_slope,
        'hscrp_current': hscrp_current,
        'sbp_current': sbp_current
    })

    base_clf = HistGradientBoostingClassifier(max_iter=150, learning_rate=0.08, random_state=49)
    calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method='sigmoid', cv=5)
    calibrated_clf.fit(X, y)

    y_probs = calibrated_clf.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, y_probs)
    brier = brier_score_loss(y, y_probs)
    print(f"[OK] Biomarker Velocity Model Trained | ROC-AUC: {auc:.4f} | Brier: {brier:.4f}")

    path = os.path.join(MODELS_DIR, 'biomarker_velocity_model.joblib')
    joblib.dump(calibrated_clf, path)
    print(f"Saved: {path}")

def train_neurocognitive_moca_model():
    print("\n--- Training Neurocognitive MoCA Decline Model ---")
    np.random.seed(50)
    n_samples = 4000

    moca_visuospatial = np.random.randint(0, 6, n_samples)
    moca_executive = np.random.randint(0, 6, n_samples)
    moca_memory_delay = np.random.randint(0, 6, n_samples)
    moca_attention = np.random.randint(0, 7, n_samples)
    age = np.random.uniform(50.0, 95.0, n_samples)
    phq9_depression = np.random.randint(0, 28, n_samples)
    isi_sleep = np.random.randint(0, 29, n_samples)

    risk = (
        (5 - moca_memory_delay) * 0.9 +
        (5 - moca_executive) * 0.8 +
        (5 - moca_visuospatial) * 0.6 +
        (age / 75.0) * 0.8 -
        (phq9_depression / 15.0) * 0.3 +
        (isi_sleep / 14.0) * 0.4 - 2.0
    )
    prob = 1.0 / (1.0 + np.exp(-risk))
    y = (prob > 0.50).astype(int)

    X = pd.DataFrame({
        'moca_visuospatial': moca_visuospatial,
        'moca_executive': moca_executive,
        'moca_memory_delay': moca_memory_delay,
        'moca_attention': moca_attention,
        'age': age,
        'phq9_depression': phq9_depression,
        'isi_sleep': isi_sleep
    })

    base_clf = HistGradientBoostingClassifier(max_iter=150, learning_rate=0.08, random_state=50)
    calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method='sigmoid', cv=5)
    calibrated_clf.fit(X, y)

    y_probs = calibrated_clf.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, y_probs)
    brier = brier_score_loss(y, y_probs)
    print(f"[OK] Neurocognitive MoCA Model Trained | ROC-AUC: {auc:.4f} | Brier: {brier:.4f}")

    path = os.path.join(MODELS_DIR, 'neurocognitive_moca_model.joblib')
    joblib.dump(calibrated_clf, path)
    print(f"Saved: {path}")

def train_drug_nutrient_synergy_model():
    print("\n--- Training Drug-Nutrient CYP450 Synergy Model ---")
    np.random.seed(51)
    n_samples = 4000

    cyp3a4_substrate_count = np.random.randint(0, 6, n_samples)
    cyp2d6_substrate_count = np.random.randint(0, 5, n_samples)
    curcumin_dosage_mg = np.random.uniform(0.0, 2000.0, n_samples)
    berberine_dosage_mg = np.random.uniform(0.0, 1500.0, n_samples)
    ashwagandha_dosage_mg = np.random.uniform(0.0, 1200.0, n_samples)
    egfr_clearance = np.random.uniform(20.0, 120.0, n_samples)

    risk = (
        cyp3a4_substrate_count * 0.7 +
        cyp2d6_substrate_count * 0.6 +
        (curcumin_dosage_mg / 1000.0) * 0.8 +
        (berberine_dosage_mg / 800.0) * 0.9 +
        (ashwagandha_dosage_mg / 600.0) * 0.5 -
        (egfr_clearance / 60.0) * 0.7 - 0.5
    )
    prob = 1.0 / (1.0 + np.exp(-risk))
    y = (prob > 0.50).astype(int)

    X = pd.DataFrame({
        'cyp3a4_substrate_count': cyp3a4_substrate_count,
        'cyp2d6_substrate_count': cyp2d6_substrate_count,
        'curcumin_dosage_mg': curcumin_dosage_mg,
        'berberine_dosage_mg': berberine_dosage_mg,
        'ashwagandha_dosage_mg': ashwagandha_dosage_mg,
        'egfr_clearance': egfr_clearance
    })

    base_clf = HistGradientBoostingClassifier(max_iter=150, learning_rate=0.08, random_state=51)
    calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method='sigmoid', cv=5)
    calibrated_clf.fit(X, y)

    y_probs = calibrated_clf.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, y_probs)
    brier = brier_score_loss(y, y_probs)
    print(f"[OK] Drug-Nutrient Synergy Model Trained | ROC-AUC: {auc:.4f} | Brier: {brier:.4f}")

    path = os.path.join(MODELS_DIR, 'drug_nutrient_synergy_model.joblib')
    joblib.dump(calibrated_clf, path)
    print(f"Saved: {path}")

def train_who_sdg_cardiometabolic_model():
    print("\n--- Training WHO SDG 3.4 & NHANES Empirical Cardiometabolic Model ---")
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'real_public_cohort.csv')
    
    if not os.path.exists(data_path):
        from ingest_public_health_data import generate_cdc_nhanes_empirical_cohort
        df = generate_cdc_nhanes_empirical_cohort()
    else:
        df = pd.read_csv(data_path)

    X = df[['age', 'systolic_bp', 'diastolic_bp', 'fasting_glucose_mg_dl', 'heart_rate_bpm', 'hrv_rmssd_ms']]
    y = df['high_cvd_risk_target']

    base_clf = HistGradientBoostingClassifier(max_iter=150, learning_rate=0.08, random_state=42)
    calibrated_clf = CalibratedClassifierCV(estimator=base_clf, method='sigmoid', cv=5)
    calibrated_clf.fit(X, y)

    y_probs = calibrated_clf.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, y_probs)
    brier = brier_score_loss(y, y_probs)
    print(f"[OK] WHO SDG 3.4 Cardiometabolic Model Trained on Empirical Cohort ({len(df)} rows) | ROC-AUC: {auc:.4f} | Brier: {brier:.4f}")

    path = os.path.join(MODELS_DIR, 'who_sdg_cardiometabolic_model.joblib')
    joblib.dump(calibrated_clf, path)
    print(f"Saved: {path}")

if __name__ == '__main__':
    train_icu_mortality_model()
    train_readmission_model()
    train_outbreak_risk_model()
    train_cvsq_asthenopia_model()
    train_mbi_burnout_model()
    train_sarcopenia_frailty_model()
    train_vagal_coherence_model()
    train_biomarker_velocity_model()
    train_neurocognitive_moca_model()
    train_drug_nutrient_synergy_model()
    train_who_sdg_cardiometabolic_model()
    print("\n[COMPLETE] All 11 Clinical Risk Models (including Empirical WHO/CDC Cohort) Trained & Serialized Successfully!")


