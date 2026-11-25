# Machine Training Directory Rules (`pocketgull_api/training`)

These scoped rules apply automatically whenever working inside `pocketgull_api/training/`:

1. **Zero BigQuery Inside Training Loops**: Materialize query results once to compressed `.parquet` (`zstd`) with `maximum_bytes_billed = 1073741824` (1 GB); never issue SQL queries per batch or epoch.
2. **Patient-Isolated Cross-Validation (`GroupKFold`)**: Group all splits strictly by `patient_id` (`GroupKFold(n_splits=5)` or `FARM_FINGERPRINT`) to prevent encounter/scan leakage.
3. **Windows Orbax Checkpointing Atomicity**: On Windows hosts, instantiate `ocp.StandardCheckpointer` with `ocp.options.AtomicityOptions(mode=ocp.options.AtomicityMode.COMMIT_FILE)` to prevent `WinError 5` lock errors.
4. **Flax NNX >= 0.11 & Pydantic Typing**: Declare `wrt=nnx.Param` in `nnx.Optimizer`, pass `(model, grads)` to `optimizer.update`, and use strict Pydantic v2 models without raw `Any` dicts on API boundaries.
5. **Open-Weight Only & HIPAA Safe Harbor §164.514**: Never capture, distill, or fine-tune using closed-source proprietary API outputs prohibited by MSA §14.s; scrub datasets via `preflight_train_gate.mjs` before training or hub export.
6. **ASCII Logs & Bounded Output**: Use ASCII `[OK]`/`[WARN]` status prefixes (no raw emojis) for cross-platform Papermill/Windows safety, and summarize long epoch logs externally rather than streaming raw stderr/stdout.
