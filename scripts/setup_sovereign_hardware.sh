#!/usr/bin/env bash
# PocketGull Sovereign Hardware & Silicon Auto-Detection Pipeline (macOS / Linux)
# Detects host silicon (Apple Metal / NVIDIA CUDA / AMD ROCm / CPU)
# Registers sovereign clinical models in Ollama and benchmarks local inference.

set -e

echo "============================================================"
echo "🌊 PocketGull Sovereign Silicon & Hardware Detection Engine"
echo "   Countess Ada Lovelace Poetic Science & Salutogenic CDS"
echo "============================================================"

OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"

# 1. Host Architecture & Operating System
OS="$(uname -s)"
ARCH="$(uname -m)"
echo -e "\n[1/4] Probing Host Environment..."
echo "  • OS Platform: $OS ($ARCH)"

# 2. Silicon & GPU Acceleration Detection
echo -e "\n[2/4] Detecting Neural & GPU Acceleration Hardware..."
DETECTED_SILICON="CPU (Fallback)"
ACCELERATION_BACKEND="WASM_CPU"

if [[ "$OS" == "Darwin" ]]; then
    CPU_BRAND=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "")
    if [[ "$ARCH" == "arm64" ]]; then
        DETECTED_SILICON="Apple Silicon ($CPU_BRAND)"
        ACCELERATION_BACKEND="METAL_UNIFIED_MEMORY"
        echo "  ✦ Optimal Backend: Apple Metal Unified Memory (UMA)"
    else
        DETECTED_SILICON="Intel Mac ($CPU_BRAND)"
        ACCELERATION_BACKEND="CPU_AVX2"
    fi
elif [[ "$OS" == "Linux" ]]; then
    if command -v nvidia-smi &> /dev/null; then
        GPU_NAME=$(nvidia-smi --query-gpu=name --format=csv,noheader | head -n 1)
        DETECTED_SILICON="NVIDIA ($GPU_NAME)"
        ACCELERATION_BACKEND="CUDA_TENSOR_CORES"
        echo "  ✦ Optimal Backend: NVIDIA CUDA (FP16/BF16 Tensor Cores & cuDNN)"
    elif command -v rocm-smi &> /dev/null; then
        DETECTED_SILICON="AMD Radeon (ROCm)"
        ACCELERATION_BACKEND="ROCM_VULKAN"
        echo "  ✦ Optimal Backend: AMD ROCm / Vulkan"
    fi
fi

echo "  ✦ Selected Primary Silicon: $DETECTED_SILICON [$ACCELERATION_BACKEND]"

# 3. Ollama Sovereign Model Registration
echo -e "\n[3/4] Verifying Local Ollama Sovereign Runtime ($OLLAMA_HOST)..."

if curl -s -f "$OLLAMA_HOST/api/tags" > /dev/null 2>&1; then
    echo "  ✔ Ollama Server is active."
    EXISTING_MODELS=$(curl -s "$OLLAMA_HOST/api/tags" | grep -o '"name":"[^"]*"' | cut -d'"' -f4 || echo "")
    
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    MODEL_DIR="$SCRIPT_DIR/../models/sovereign"
    
    if echo "$EXISTING_MODELS" | grep -q "pocketgull-clinical:latest"; then
        echo "  ✔ Sovereign Flagship: pocketgull-clinical:latest is already registered."
    elif [ -f "$MODEL_DIR/Modelfile.pocketgull" ]; then
        echo "  ⚡ Registering pocketgull-clinical:latest from Modelfile.pocketgull..."
        ollama create pocketgull-clinical:latest -f "$MODEL_DIR/Modelfile.pocketgull"
    fi
    
    if echo "$EXISTING_MODELS" | grep -q "pocketgull-edge:3b"; then
        echo "  ✔ Sovereign Edge: pocketgull-edge:3b is already registered."
    elif [ -f "$MODEL_DIR/Modelfile.pocketgull-edge" ]; then
        echo "  ⚡ Registering pocketgull-edge:3b from Modelfile.pocketgull-edge..."
        ollama create pocketgull-edge:3b -f "$MODEL_DIR/Modelfile.pocketgull-edge"
    fi
else
    echo "  ⚠ Ollama is not currently running at $OLLAMA_HOST."
    echo "    To activate sovereign offline models: start Ollama and run:"
    echo "    ollama create pocketgull-clinical:latest -f models/sovereign/Modelfile.pocketgull"
fi

echo -e "\n============================================================"
echo "✔ PocketGull Sovereign Hardware Setup Complete"
echo "  Active Backend: $ACCELERATION_BACKEND"
echo "============================================================"
