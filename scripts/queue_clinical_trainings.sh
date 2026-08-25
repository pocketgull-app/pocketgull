#!/usr/bin/env bash
# scripts/queue_clinical_trainings.sh
# PocketGull Automated Clinical LoRA Training Queue
set -e

REPO_DIR="/mnt/c/Users/philg/Pocketgull/pocketgull"
PYTHON_ENV="$HOME/ml_env/bin/python3"
SCRIPT="$REPO_DIR/scripts/finetune_gemma_lora.py"

echo "=========================================================="
echo "🚀 PocketGull Multi-Paradigm Clinical LoRA Training Queue"
echo "=========================================================="

# ── 1. Train RxGuard Pharmacogenomics & Herb-Drug Model ───────────────
echo -e "\n[1/3] 🧪 Starting RxGuard (PGx & Herb-Drug Cytochrome P450) Training..."
$PYTHON_ENV "$SCRIPT" \
    --model_name "Qwen/Qwen2.5-0.5B-Instruct" \
    --dataset_path "$REPO_DIR/datasets/dataset_rxguard_pgx.jsonl" \
    --paradigm "pharmacogenomics_pgx" \
    --epochs 3 \
    --cooldown_seconds 30 \
    --cooldown_steps 10 \
    --output_dir "$REPO_DIR/lora_rxguard_pgx"

echo "✅ RxGuard LoRA training complete."

# ── 2. Train CMS-0057-F Electronic Prior Authorization Model ──────────
echo -e "\n[2/3] 📋 Starting CMS-0057-F Electronic Prior Authorization Training..."
$PYTHON_ENV "$SCRIPT" \
    --model_name "Qwen/Qwen2.5-0.5B-Instruct" \
    --dataset_path "$REPO_DIR/datasets/dataset_prior_auth.jsonl" \
    --paradigm "prior_auth_cms0057f" \
    --epochs 3 \
    --cooldown_seconds 30 \
    --cooldown_steps 10 \
    --output_dir "$REPO_DIR/lora_prior_auth"

echo "✅ CMS-0057-F LoRA training complete."

# ── 3. Train Calgary-Cambridge Socratic Patient Intake Model ───────────
echo -e "\n[3/3] 🩺 Starting Calgary-Cambridge Patient Intake & Triage Training..."
$PYTHON_ENV "$SCRIPT" \
    --model_name "Qwen/Qwen2.5-0.5B-Instruct" \
    --dataset_path "$REPO_DIR/datasets/dataset_patient_intake.jsonl" \
    --paradigm "calgary_cambridge_intake" \
    --epochs 3 \
    --cooldown_seconds 30 \
    --cooldown_steps 10 \
    --output_dir "$REPO_DIR/lora_patient_intake"

echo "✅ Calgary-Cambridge Intake LoRA training complete."

echo -e "\n=========================================================="
echo "🎉 All 3 Clinical LoRA Models Successfully Trained & Checkpointed!"
echo "=========================================================="
