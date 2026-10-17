# BigQuery ↔ Kaggle & Data Science Engineering Rules

## 1. BigQuery ↔ Kaggle Bridge & FinOps Cost Guard (`gen-lang-client-0540208645`)
- **Zero Unbounded `SELECT *` Invariant**: Never execute `SELECT *` against BigQuery clinical, genomic, or Kaggle competition tables (`bigquery-public-data`, MIMIC, or `gen-lang-client-0540208645.*`). Always project explicit columns and filter on partition/clustering keys (`WHERE _PARTITIONDATE = ...`).
- **Mandatory 1 GB Query Cost Guard**: Interactive, notebook, and automated BigQuery jobs MUST set `maximum_bytes_billed = 1073741824` (1 GB) or run a dry-run byte estimate (`dry_run = True`) prior to execution unless explicitly approved for heavy batch ETL.
- **Zero-Egress Parquet / BigFrames Caching**: Never query BigQuery inside multi-epoch PyTorch or JAX training loops. Materialize filtered feature tables once into compressed `.parquet` artifacts (`compression='zstd'`) and mount or push them to Kaggle Datasets (`--dir-mode zip`).
- **SQL Patient-Level Split Parity (`GroupKFold`)**: When generating train/validation splits directly in BigQuery SQL or BigFrames, enforce deterministic patient-level fold assignment via `MOD(ABS(FARM_FINGERPRINT(CAST(patient_id AS STRING))), 5) AS fold_id` so all series, scans, and encounters for a patient remain strictly isolated within a single fold.
- **BigQuery Out-of-Fold (OOF) Telemetry Sink**: Log competition experiments and OOF validation runs to the centralized `kaggle_experiments.runs` BigQuery table (`run_id`, `competition`, `git_sha`, `model_arch`, `cv_scheme`, `oof_metric`, `lb_metric`, `params_json`, `created_at`) to enable SQL-driven ensemble selection and meta-stacking analysis.
- **HIPAA §164.514(b)(2) Safe Harbor on Cloud Exports**: Any dataset exported from BigQuery to Kaggle Datasets or Model Hub MUST pass Safe Harbor de-identification checks, include `dataset-metadata.json` / `model-metadata.json` with `Apache-2.0` or `CC-BY-4.0` licensing, and tag synthetic/weak-labeled records with `synthetic` via `scripts/kaggle_tags.py`.
- **GCS Sidecar Artifact Offloading (20 GB Disk Bypass)**: Kaggle imposes a strict 20 GB disk limit on `/kaggle/working/`. Heavy intermediate outputs (model weights $> 500\text{ MB}$, full-spectrum embedding caches, out-of-fold feature banks) MUST be streamed directly to `gs://pocketgull-kaggle-artifacts/`. Only the verified `submission.csv`, `candidate_audit.json`, and `run_manifest.json` are written to `/kaggle/working/` for Kaggle's evaluation engine.
- **Keyless Workload Identity & User Secrets Hygiene**: Interactive and automated Kaggle notebooks MUST access GCP and BigQuery services via Kaggle User Secrets (`from kaggle_secrets import UserSecretsClient`) or Keyless Workload Identity Federation (WIF) mapped to service account `pocketgull-run@gen-lang-client-0540208645.iam.gserviceaccount.com`. Zero hardcoded API keys or static credentials permitted in notebook cells.
- **BigFrames In-Engine Processing Invariant**: For large tabular datasets (>100k rows), use `bigframes.pandas`. Perform joins, formula grouping, and quantile filters directly on Google Cloud's petabit network; only pull the aggregated summary matrix into Kaggle memory.

---

## 2. Competition Modeling & Verification Standards
1. **Leak-Free Cross-Validation Anchoring (`GroupKFold`)**: In medical imaging and longitudinal datasets where patients have multiple series/scans, group splits strictly by `patient_id` using `GroupKFold(n_splits=5)` to prevent patient-feature leakage.
2. **Empirical Pipeline Verification (Numerical Proof First)**: Never claim an architecture edit or post-processing pipeline works based on intuition alone. Record Out-of-Fold (OOF) metric progression at every stage.
3. **Experiment Tracking & Model Hashing (`git` SHA)**: Log seed, git commit SHA, exact hyperparameters, and OOF target scores for every run. Save weights named by OOF score (e.g., `convnext_large_fold0_auc0.942.pt`).
4. **Asymmetric Loss (ASL) for Specificity & Class Imbalance**: Use Asymmetric Loss with $\gamma_- = 4.0, \gamma_+ = 1.0, \text{clip} = 0.05$ for sparse multi-label targets to focus gradient updates on hard positive abnormalities.
5. **Anatomical Co-Occurrence Prior Calibration**: Build an empirical target co-occurrence matrix $M_{ij} = \mathbb{P}(\text{Target}_j \mid \text{Target}_i)$ and calibrate predicted probabilities using Bayesian prior smoothing.
6. **Diversity Ensembling & 2nd-Level Meta-Stacking**: Train 2nd-level Gradient Boosted Trees (LightGBM/XGBoost) on Out-of-Fold predictions from diverse backbones (ConvNeXt + Swin + mDeBERTa).
7. **Nelder-Mead Target-Specific Threshold Optimization**: Use Nelder-Mead optimization to tune target decision thresholds $\tau_1, \tau_2, \dots, \tau_K$ on OOF predictions rather than using default $0.50$.
8. **Sub-Second Efficiency Latency Optimization**: For competition efficiency tracks, sample 8 central key slices, export PyTorch models to ONNX Runtime with FP16, and use multi-threaded asynchronous DICOM I/O pools.
9. **Semantic Versioning (`SemVer 2.0.0`) & Clean Identifiers**: Maintain a root `VERSION` file and `CHANGELOG.md` following *Keep a Changelog* standards, with `__version__` stamped into execution logs. Use clean public version tags without exposing proprietary recipe internals.
10. **Continuous Automated Verification (`vitest` / `pytest`)**: Write automated unit tests covering preprocessors, matrix math formulas, and DICOM tensor transformations across edge cases (empty text reports, missing headers, NaNs).

---

## 3. Kaggle Code Competition Submission & Zero-Crash Protocol
- **Hardware & Accelerator Conformance**: Use `enable_gpu: false` (CPU mode) or explicit T4 GPU settings (`gpu_t4`). NEVER use un-gated GPU settings that default to prohibited P100 GPUs.
- **Immediate Baseline Disk Output**: Always write a valid baseline `submission.csv` to disk at the very beginning of the submission cell *before* starting any ML inference loop.
- **Beyoncé Rule Pre-Flight Gate**: Run automated assertions verifying non-empty outputs, exact row count alignment, `float_format='%.6f'`, and zero `NaN`/`Inf` values prior to finalizing `submission.csv`.
- **Defensive Symbol & Engine Guards**: Wrap imports in `try-except` blocks and check `if 'engine' in globals() and engine is not None:` before calling inference methods to prevent unhandled `NameError` crashes.
- **ASCII Terminal Hygiene**: Use plain text status tags (`[OK]`, `[WARN]`) instead of non-ASCII emojis in notebook `print()` calls to prevent Papermill `UnicodeEncodeError` failures.
- **Memory & VRAM Hygiene**: Call `gc.collect()` and `torch.cuda.empty_cache()` every 100 studies to prevent RAM/CUDA OOM during hidden test evaluation.

---

## 4. NVIDIA GPU Acceleration & CASMI 2026 Lineage
- **Automatic Mixed Precision (AMP FP16)**: Wrap forward passes in `torch.cuda.amp.autocast(dtype=torch.float16)` and scale gradients via `torch.cuda.amp.GradScaler()`.
- **MONAI SmartCache & SDPA**: Cache volumetric 2.5D slabs in pinned host RAM (`pin_memory=True`), use `torch.nn.functional.scaled_dot_product_attention` (FlashAttention-2), set `optimizer.zero_grad(set_to_none=True)`, and enable `torch.backends.cudnn.benchmark = True` on fixed-shape inputs.
- **CASMI 2026 Lineage of Gratitude Invariant**: Every CASMI 2026 notebook, commit, and artifact MUST prominently display the Lineage of Gratitude (Hengck23, Eveliaveldrine, Enveda Biosciences & CASMI organizers, ICEBERG & GLACIER architects, LOTUS & COCONUT curators, Countess Ada Lovelace & Hermann von Helmholtz) and support the 3 cognitive lenses (*6th-Grade Explorer*, *Advanced Biochemist*, *Clinical Research*) in 100% self-contained offline HTML5 Canvas/SVG with $\text{mEDI} < 10\text{ lx}$.
