---
name: local-edge-trainer
description: Optimizes local AI fine-tuning and inference for AMD Radeon GPUs (RX 6650 XT 8GB VRAM) and Intel Core i7 (28 threads) using Lemonade Server and 4-Bit QLoRA.
---

# Local Edge AI & Low-VRAM Training Architecture

This skill provides expert workflow instructions for training, fine-tuning, and evaluating clinical and general LLM models locally on the **ASUS AMD Radeon RX 6650 XT (8 GB GDDR6)** and **Intel Core i7-14700KF (28 Threads, 32 GB RAM)**.

---

## 1. Hardware & Memory Constraints

* **GPU**: ASUS AMD Radeon RX 6650 XT (8,192 MB VRAM GDDR6).
* **OS & Display Overhead**: ~1,200 MB.
* **Safe Model VRAM Budget**: $\le 3,800\text{ MB}$ peak allocation to maintain $\ge 3.0\text{ GB}$ safety buffer.
* **CPU / Host Memory**: Intel Core i7-14700KF (28 threads) with 32 GB RAM.

---

## 2. The 5-Point Zero-OOM Training Guardrails

When launching PyTorch / Hugging Face / Unsloth fine-tuning, ALWAYS enforce these parameters:

1. **4-Bit Double Quantization (NF4)**:
   ```python
   bnb_config = BitsAndBytesConfig(
       load_in_4bit=True,
       bnb_4bit_quant_type="nf4",
       bnb_4bit_use_double_quant=True,
       bnb_4bit_compute_dtype=torch.float16,
   )
   ```
2. **Gradient Checkpointing**: Cuts activation memory by ~70%.
3. **Micro-Batch Size = 1 & Gradient Accumulation = 8 or 16**: Delivers the statistical stability of batch size 8–16 with the memory footprint of batch size 1.
4. **Sequence Length = 1,024**: Caps attention tensor allocations.
5. **Paged 8-Bit AdamW**: `optim="paged_adamw_8bit"`.
6. **CUDA/ROCm Memory Allocator**: Set `PYTORCH_CUDA_ALLOC_CONF="expandable_segments:True"`.

---

## 3. Lemonade Server Local Edge Integration

* **Daemon**: `lemond` listening on `http://127.0.0.1:13305/api/v1` (WebSocket: `9000`).
* **Acceleration**: Vulkan / AMD ROCm.
* **Primary SOTA Model**: `Llama-3.2-3B-Instruct-GGUF` (2.1 GB VRAM, <25 ms latency).
* **Angular Provider**: `LemonadeProvider` in `src/services/ai/lemonade.provider.ts`.
* **Zero Cloud Egress**: Fully local, air-gapped HIPAA-compliant inference.

---

## 4. Execution Commands

* **Dry-Run Validation**:
  ```bash
  python scripts/finetune_gemma_lora.py --paradigm clinical_cot --dry_run
  ```
* **Memory-Safe Training Run**:
  ```bash
  python scripts/finetune_gemma_lora.py \
    --model_name unsloth/gemma-2-2b-it \
    --paradigm clinical_cot \
    --low_mem \
    --batch_size 1 \
    --grad_accum 8 \
    --max_seq_length 1024 \
    --output_dir ./lora_clinical_cot
  ```
* **Local Inference Benchmark**:
  ```powershell
  node scripts/test_lemonade_ai.mjs
  ```
