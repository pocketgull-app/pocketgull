#!/usr/bin/env bash
# ==============================================================================
# Pocket-Gull — Pixel Experimental Linux Setup & Launch Script
# ==============================================================================
# Automated environment initialization for Google Pixel Linux Terminal (crosvm/AVF).
# Sets up Python 3.11+, virtual environment, installs dependencies, and runs
# the FastAPI Clinical Intelligence ML Sidecar on 127.0.0.1:8000.
# ==============================================================================

set -eo pipefail

echo "================================================================="
echo "  🚀 Pocket-Gull: Initializing Pixel Experimental Linux Sidecar"
echo "================================================================="

# 1. Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "📦 Installing Python3 and system build dependencies via apt..."
    sudo apt-get update
    sudo apt-get install -y python3 python3-pip python3-venv git curl libhdf5-dev build-essential
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
API_DIR="$PROJECT_ROOT/pocketgull_api"

if [ ! -d "$API_DIR" ]; then
    echo "❌ Error: Could not locate pocketgull_api directory at $API_DIR"
    exit 1
fi

cd "$API_DIR"

# 2. Initialize Virtual Environment
VENV_DIR=".venv-pixel"
if [ ! -d "$VENV_DIR" ]; then
    echo "🐍 Creating Python virtual environment ($VENV_DIR)..."
    python3 -m venv "$VENV_DIR"
fi

echo "⚡ Activating virtual environment..."
source "$VENV_DIR/bin/activate"

# 3. Upgrade Pip & Install Requirements
echo "📥 Installing / Updating Pocket-Gull Python dependencies..."
pip install --require-hashes -r requirements-bootstrap.txt --quiet
pip install --require-hashes -r requirements.txt --quiet

# 4. Verify Sidecar Imports
echo "🔍 Verifying Python clinical modules..."
python3 -c "import fastapi, numpy, pandas, scipy, sklearn; print('  ✅ Core ML & Biosignal modules verified.')"

# 5. Launch FastAPI Sidecar
HOST="127.0.0.1"
PORT="8000"

echo "================================================================="
echo "  🌿 Pocket-Gull FastAPI Sidecar starting on http://$HOST:$PORT"
echo "  Connect PWA or Angular client to: http://$HOST:$PORT/api/python/"
echo "  Press Ctrl+C to terminate."
echo "================================================================="

uvicorn main:app --host "$HOST" --port "$PORT" --reload
