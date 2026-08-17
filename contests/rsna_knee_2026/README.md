# RSNA Knee Abnormalities Detection — Kaggle Competition (2026)

## Competition Overview & Clinical Problem
- **Host**: Radiological Society of North America (RSNA) & Dr. Jacob Kazam (MSK Radiologist Lead)
- **Total Prize Pool**: **$77,000 USD** (Main Leaderboard + Efficiency Track)
- **Dataset**: 5,000+ Knee MRI exams paired with original free-text radiology reports across 9 languages.
- **License**: CC-BY-NC 4.0
- **Submission Limit**: 5 submissions per day, max team size 5

---

## 12 Target Abnormalities & Strict MSK Radiologist Criteria

| Target Label | Anatomical Plane Priority | High-Specificity Clinical Grading Rule |
| :--- | :--- | :--- |
| `acl` | Sagittal / Coronal | **High-grade partial (>50% fibers) or complete tear only**. Mild thickening/degeneration = **Negative**. |
| `mcl` | Coronal / Frontal | **High-grade acute tear with disrupted fibers & adjacent edema**. Chronic stress / low-grade sprain = **Negative**. |
| `medial_meniscus` | Sagittal / Coronal | **Signal contacting surface on $\ge 2$ images**, or morphologic truncation/displaced fragment. Intrasubstance degeneration = **Negative**. |
| `lateral_meniscus` | Sagittal / Coronal | **Signal contacting surface on $\ge 2$ images**, or morphologic truncation/displaced fragment. Intrasubstance degeneration = **Negative**. |
| `medial_oa` | Coronal / Sagittal | **$\ge 1\text{ cm}$ area of high-grade cartilage loss (>50% thickness)** in medial compartment. |
| `lateral_oa` | Coronal / Sagittal | **$\ge 1\text{ cm}$ area of high-grade cartilage loss (>50% thickness)** in lateral compartment. |
| `pf_oa` | **Axial** (Trochlea) | **$\ge 1\text{ cm}$ area of high-grade cartilage loss (>50% thickness)** in patellofemoral compartment. |
| `effusion` | Sagittal / Axial | Moderate or large fluid distension in joint capsule. |
| `synovitis` | Sagittal / Axial | Thickening & inflammation of synovial lining. |
| `bakers_cyst` | Axial / Sagittal | Moderate or large fluid collection in popliteal space behind knee. |
| `contusion` | Sagittal / Coronal | Bone marrow edema-like signal from impact **without discrete fracture line**. |
| `fracture` | Sagittal / Coronal | **Acute cortical break or discrete fracture line**. |

> [!IMPORTANT]
> **Adjudication Bias to Specificity**: All ambiguous or "on-the-fence" findings were explicitly graded **Negative** by the adjudicating MSK radiologists. Models should use higher decision thresholds or asymmetry-penalized loss functions to favor high specificity.

---

## Metric
**Macro-Averaged Area Under the ROC Curve (Macro AUC-ROC)**:
$$\text{Final Score} = \frac{1}{12} \sum_{i=0}^{11} \text{AUC}_i$$

---

## Key Modeling & Feature Engineering Directives

### 1. Fluid-Sensitive Sequence Weighting
- **Primary Signal**: Edema, hemorrhage, effusion, and tears appear bright on **fluid-sensitive sequences** (Proton-Density Fat-Suppressed `PD-FS`, `T2-FS`, `STIR`).
- **Pipeline Implementation**: Assign higher sample weights or spatial attention priors to `PD-FS` / `T2-FS` DICOM series during 2.5D slice feature extraction.

### 2. Multi-Plane Functional Mapping
- **Sagittal & Coronal**: Primary planes for `acl`, `mcl`, `medial_meniscus`, `lateral_meniscus`, `contusion`, `fracture`.
- **Axial**: Primary plane for `pf_oa` (patellofemoral cartilage), `bakers_cyst`, and posterior effusion distension.

### 3. Multimodal Gated Cross-Attention
- Fuse 3D DICOM slice embeddings with `mDeBERTa-v3` multilingual text embeddings of the radiology report to mimic MSK radiologist workflow.

### 4. Pivot & Pulse Co-Occurrence Calibration
- Post-process probability predictions using Bayesian conditional priors $\mathbb{P}(\text{contusion} \mid \text{acl\_tear})$ and $\mathbb{P}(\text{effusion} \mid \text{acl\_tear})$.

---

## 5. Kaggle Code Competition Submission Protocol (Leaderboard Proven Rules)

1. **Hardware Accelerator Restriction**:
   - Competition submission rules explicitly prohibit P100 GPUs.
   - Set `"enable_gpu": "false"` (CPU mode) or use explicit T4 GPU settings (`"accelerator": "gpu_t4"`). CPU mode executes in $\sim 23$ seconds and guarantees zero hardware gating errors.
2. **Immediate Disk Output**:
   - Write `submission.csv` to `/kaggle/working/submission.csv` at the VERY FIRST STEP of the submission cell before starting model inference loop.
3. **Defensive Engine Guards**:
   - Wrap optional imports in `try-except` blocks.
   - Always check `if 'engine' in globals() and engine is not None:` before dereferencing model methods to prevent `NameError`.
4. **ASCII Output Stream**:
   - Use plain text tags `[OK]` and `[WARN]` instead of non-ASCII emojis (`✅`, `⚠️`) to prevent Papermill stdout `UnicodeEncodeError`.
5. **In-Place Schema Preservation**:
   - Modify candidate `sample_submission.csv` in-place, format floats with `float_format='%.6f'`, and preserve exact row index ordering.

