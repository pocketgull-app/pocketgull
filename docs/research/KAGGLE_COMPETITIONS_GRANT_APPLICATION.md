# Kaggle Competitions Research Grant Program — Application Form & Answers

Use this document as your direct copy-paste answer key for the [Kaggle Competitions Research Grant Application Form](https://services.google.com/fb/forms/kaggle-research-grants-application/).

---

## 1. Competition Selection
* **What kind of competition are you applying for?**
  * `[X] Prediction Competition`

---

## 2. Contact Details
* **First name**: `Phil`
* **Last name**: `Gear`
* **Organization name**: `Pocket-Gull Research Lab`
* **Describe your organization**: `Academic/Research Institution` *(or `Business` / `Non-Profit` based on your official entity)*
* **If you selected "Other", please specify**: `N/A`
* **Job title**: `Lead AI/ML Research Architect`
* **Email**: `[YOUR_EMAIL_ADDRESS]`
* **Confirm email address**: `[YOUR_EMAIL_ADDRESS]`
* **Community Competition URL**: `https://www.kaggle.com/competitions/rsna-knee-abnormality-detection` *(or link to your drafted community competition page from kaggle.com/competitions?new=true)*
* **Additional Features Needed**:
  > *Code Competition submission pipeline: We require hidden test-set evaluation via Kaggle Notebooks (9-hour GPU runtime with Tesla T4 / L4 support) to handle multi-plane DICOM volumetric ingestion and prevent label leakage.*

---

## 3. Problem Statement
* **Please briefly describe the overall objective of your competition. What would a successful outcome be?**
  > *The objective is to advance state-of-the-art weakly-supervised computer vision and Multi-Instance Learning (MIL) for multi-plane musculoskeletal MRI analysis. A successful outcome will produce open-source, highly calibrated deep learning models that accurately detect 12 structural and inflammatory knee abnormalities from multi-plane DICOM stacks, proving that LLM-derived weak labels can effectively bridge the massive annotation bottleneck in clinical radiology.*

* **In a single sentence, what is your competition's problem statement?**
  > *We would like to accurately detect and classify 12 distinct knee abnormalities across multi-plane MRI scans using weakly supervised multi-instance deep learning models.*

* **What specific prediction would you like a participant to make for your competition?**
  > *Predict the continuous probability (between 0.0 and 1.0) for the presence of 12 distinct knee pathologies (ACL tear, MCL tear, Medial Meniscus tear, Lateral Meniscus tear, Medial Osteoarthritis, Lateral Osteoarthritis, Patellofemoral Osteoarthritis, Joint Effusion, Synovitis, Baker's Cyst, Bone Contusion, and Fracture) for each patient's multi-plane MRI study.*

* **What is your ground truth/target variable?**
  > *Twelve multi-label binary indicators (0 or 1) per study, established and verified by fellowship-trained musculoskeletal radiologists across the 12 target pathologies, evaluated on a sequestered, held-out gold-standard test set.*

* **How is this done today? What are the methods or existing models you’ve tried to solve this problem? Do you have any existing benchmarks? Do you have a sense of how much improvement is possible over current methods?**
  > *Today, knee MRI triage requires time-consuming manual inspection by radiologists across sagittal, coronal, and axial series (15–30 minutes per patient). Prior academic models (e.g., MRNet, KneeNet) rely on simple slice pooling or 3D CNNs that struggle with slice sparsity, class imbalance, and multi-plane fusion. We have implemented a 2.5D ResNet/ConvNeXt Multiple Instance Learning (MIL) baseline using attention pooling pre-trained on 4,407 LLM weak-labeled studies and fine-tuned on expert gold labels, achieving an initial validation Macro-AUC of ~0.74. We anticipate participants can achieve 0.86+ Macro-AUC through hierarchical spatial transformers, Swin-3D backbones, anatomical co-occurrence calibration, and multi-resolution slice aggregation.*  
  > *Reference papers: Bien et al., 'Deep-learning-assisted diagnosis for knee magnetic resonance imaging', PLoS Medicine (2018); Liu et al., 'Deep Learning for Musculoskeletal MRI', Radiology (2018).*

* **What impact would this competition have on the industry or space your organization specializes in?**
  > *This competition will provide the clinical and machine learning communities with the first large-scale, open benchmark for weak-to-strong learning in radiology. It will democratize automated orthopedic triage, dramatically reducing MRI interpretation turnaround times in underserved emergency and outpatient settings from days to seconds.*

---

## 4. Data
* **What type of data do you have?**
  * `[X] Images`
  * `[X] Structured Data/Tabular`
  * `[X] Text`

* **Is your ground truth publicly available?**
  * `[X] No` *(Private test labels are sequestered to ensure fair leaderboard scoring)*

* **Do you have a preferred scoring metric? How would you measure model submissions on a live leaderboard?**
  * `Macro-Averaged Area Under the ROC Curve (Macro-AUROC)` *(The arithmetic mean of ROC-AUC computed across each of the 12 target abnormality classes)*

* **Is the dataset uploaded to your community competition page?**
  * `[X] Yes` *(or `[X] Other: Dataset prepared and ready for upload/review`)*

---

## 5. Budget, Timeline & Impact
* **What is your Budget?**
  * `NA — Applying for Kaggle Research Grant prize funding support ($25,000 - $50,000 prize pool)`

* **When is your preferred launch date?**
  * `11/15/2026` *(or your preferred target date, MM/DD/YYYY)*

* **Is your expected date flexible? If not, what limitations do you have?**
  * `Yes, fully flexible between Q4 2026 and Q1 2027 to align with Kaggle's competition schedule and review rounds.`

* **Are there any conferences or publications associated with this competition?**
  * `RSNA (Radiological Society of North America), MICCAI (Medical Image Computing and Computer Assisted Intervention), and CVPR/NeurIPS Medical AI workshops.`

* **Are there any licensing restrictions for your dataset or for the winning submissions?**
  * `Dataset licensed under Creative Commons Attribution 4.0 International (CC-BY 4.0). Winning code submissions will be licensed under Apache License 2.0 or MIT License for open scientific access.`

* **Is there anything else about your competition or dataset that would be helpful for us to know?**
  * `All imaging data has undergone full HIPAA §164.514(b)(2) Safe Harbor de-identification. The pairing of 4,400+ weakly annotated studies with high-confidence gold benchmarks provides a unique, highly impactful problem formulation for the Kaggle community.`

* **Are there any other opportunities being made available to winners that we should be aware of?**
  * `Top-ranking teams will be invited as co-authors on the competition findings benchmark paper and offered speaking/presentation slots at associated academic workshop sessions.`

---

## 6. Conditions & Submission
* **Human?**: `[X] Verified`
* **Kaggle Conditions**: `[X] Accept standard Kaggle terms, Google Privacy Policy, and MCSA/SOW.`
