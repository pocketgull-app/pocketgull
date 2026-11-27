---
name: agentic-training-orchestrator
description: >-
  Orchestrates closed-loop Machine Training across local 4-bit QLoRA (RX 6650 XT),
  JAX/Flax NNX, and Kaggle/Vertex pipelines with automated PHI dataset screening,
  dry-run VRAM safety gates, compact training log filtering, and clinical regression benchmarks.
  Use when preparing training datasets, launching fine-tuning queues, summarizing training logs,
  or promoting trained adapters to local Ollama/Lemonade runtimes.
---

# Agentic Machine Training Orchestrator

Use this workflow to close the **Prepare -> Gate -> Train -> Filter -> Evaluate -> Promote** loop without overflowing context windows or workstation VRAM.

---

## 1. Pre-Train Safety & Dataset Gate

Always run the pre-flight gate before launching fine-tuning or pushing any corpus to external hubs:

1. **Validate JSONL Format, Token Footprint & HIPAA Safe Harbor Compliance**:
   ```powershell
   node .agents/skills/agentic-training-orchestrator/scripts/preflight_train_gate.mjs --dataset scripts/clinical_cot_training_dataset.jsonl
   ```
   Abort immediately if any HIPAA identifier pattern (`SSN`, phone, email, raw MRN) or malformed JSON line is detected.

2. **QLoRA Dry-Run Validation (Mandatory on 8 GB RX 6650 XT)**:
   ```powershell
   python scripts/finetune_gemma_lora.py --paradigm clinical_cot --dry_run
   ```

---

## 2. Bounded-VRAM Execution & Context-Safe Logging

Follow [local-edge-trainer](../local-edge-trainer/SKILL.md) for AMD 8 GB hardware (`<= 3,800 MB` peak VRAM) or [nvidia-gpu-acceleration](../nvidia-gpu-acceleration/SKILL.md) for T4/A100/H100 runs:

1. **Launch Low-Memory Local Fine-Tuning**:
   - Enforce `--low_mem --batch_size 1 --grad_accum 8 --max_seq_length 1024` (enforced by `.agents/hooks.json` -> `scripts/agy_pre_tool_guard.mjs`).
   - Redirect verbose step output to a log file (e.g., `tmp/train.log`) rather than streaming thousands of lines into agent context.

2. **Extract Compact Training Curves & NaN/OOM Signals**:
   ```powershell
   node .agents/skills/agentic-training-orchestrator/scripts/preflight_train_gate.mjs --log tmp/train.log
   ```
   Or for RSNA Kaggle kernel logs, run `python scripts/filter_training_log.py`.

---

## 3. Clinical Regression & Edge Promotion Gate

Never promote a newly tuned LoRA adapter, GGUF binary, or Flax NNX checkpoint based on training loss alone:

1. **Run Clinical Safety & DORA Evals**:
   ```powershell
   node scripts/run-clinical-evals.mjs
   ```
   Or invoke the `lemonade` MCP tool `run_clinical_dora_benchmark` when comparing quantized GGUF variants on `127.0.0.1:13305`.
2. **Export & Package Locally**:
   - Use `python scripts/export_edge_model.py` or `python scripts/package_ollama_models.py` after unit tests (`pytest` / `vitest`) and zero-contraindication gates pass.
3. **Directory Governance**:
   - Respect [pocketgull_api/training/AGENTS.md](../../../pocketgull_api/training/AGENTS.md) (Orbax `AtomicityMode.COMMIT_FILE` on Windows, `GroupKFold(patient_id)`, and MSA §14.s open-weight-only distillation).
