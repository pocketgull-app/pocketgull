---
description: Machine Learning and Data Science Triage Model Pipeline
---
This workflow guides the training, evaluation, and verification of the clinical risk classifier used in the Pocket Gull API.

## 1. Pipeline Overview
The machine learning component is a `RandomForestClassifier` trained on vital signs (`hr`, `bp_systolic`, `bp_diastolic`, `spo2`, `age`) to predict patient clinical risk levels.

Files involved:
- [train_contest_model.py](file:///home/user/pocketgull/pocketgull_api/train_contest_model.py): Trains and serializes the model.
- [evaluate_model.py](file:///home/user/pocketgull/pocketgull_api/evaluate_model.py): Evaluates performance metrics and generates reports.
- [test_dsp.py](file:///home/user/pocketgull/pocketgull_api/test_dsp.py): Unit tests verifying DSP mathematics.
- [model_evaluation_report.md](file:///home/user/pocketgull/pocketgull_api/reports/model_evaluation_report.md): Output audit document.

---

## 2. Execution Steps

### Step 1: Model Training
Run the training pipeline to generate the serialized model:
```bash
python3 pocketgull_api/train_contest_model.py
```
This script splits synthetic clinical data and serializes the model to `pocketgull_api/models/clinical_risk_v2.joblib`.

### Step 2: Model Evaluation
Run the evaluation pipeline to test the model's accuracy, calibration (Brier score), and diagnostic feature importance:
```bash
python3 pocketgull_api/evaluate_model.py
```
This updates the [model_evaluation_report.md](file:///home/user/pocketgull/pocketgull_api/reports/model_evaluation_report.md) report containing ROC-AUC, a confusion matrix, and feature importances.

### Step 3: Run Unit & DSP Tests
Run Vitest and python unit tests to verify signal extraction logic:
```bash
# Run python tests only
npm run test:python

# Or run frontend and python tests together
npm run test
```

---

## 3. Clinical Governance Validation
Ensure the model meets these criteria before deploying changes:
1. **Low False Negatives (FN)**: False negative rate must be minimized to avoid overlooking critical patients.
2. **SpO2 Weight**: Oxygen saturation levels (`spo2`) should remain the most heavily weighted feature in triage classification.
3. **Model Path**: The loaded path in `main.py` should target the latest serialized joblib file.
