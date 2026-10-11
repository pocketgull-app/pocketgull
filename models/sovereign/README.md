# PocketGull Sovereign Local Models

This directory contains the canonical Modelfiles for the PocketGull Sovereign Clinical Intelligence Engine, designed under **Countess Ada Lovelace's Poetic Science** and **Aaron Antonovsky's Salutogenic Medical Framework**.

---

## 1. The Sovereign Model Pair

| Model ID | Base Model | Target Persona | Primary Hardware Optimization |
| :--- | :--- | :--- | :--- |
| **`pocketgull-clinical:latest`** | `gemma4:latest` (or `gemma-3-12b`) | **🔭 Gulliver** (Glaucous-winged Gull) | • **Apple Silicon**: Metal Unified Memory (UMA)<br>• **Windows NVIDIA**: CUDA + FP16/BF16 Tensor Cores |
| **`pocketgull-edge:3b`** | `llama3.2:3b` (or `gemma-3-1b/4b`) | **⚡ Skimmer** / **🚨 Samaritan** | • **Apple Silicon / iOS**: CoreML / Metal<br>• **Windows**: DirectML / In-Browser WebGPU |

---

## 2. Silicon-Specific Build & Run Instructions

### Apple Silicon (macOS M1 / M2 / M3 / M4)
Ollama utilizes the Apple Metal GPU framework and shares unified memory between CPU and GPU automatically:
```bash
ollama create pocketgull-clinical:latest -f models/sovereign/Modelfile.pocketgull
ollama create pocketgull-edge:3b -f models/sovereign/Modelfile.pocketgull-edge
```

### Windows with NVIDIA RTX / GTX
Ollama automatically detects NVIDIA CUDA drivers and offloads layers to VRAM:
```powershell
ollama create pocketgull-clinical:latest -f models/sovereign/Modelfile.pocketgull
ollama create pocketgull-edge:3b -f models/sovereign/Modelfile.pocketgull-edge
```

### Automated Setup Script
Run the cross-platform setup script from repository root:
- Windows: `powershell -ExecutionPolicy Bypass -File scripts/setup_sovereign_hardware.ps1`
- macOS / Linux: `bash scripts/setup_sovereign_hardware.sh`
