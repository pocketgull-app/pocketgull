#!/usr/bin/env python3
"""
🕊️ PocketGull — Hugging Face & Model Hub Packaging & Manifest Generator (Python wrapper)
Calls node scripts/huggingface_model_hub_export.mjs to maintain single-source-of-truth.
"""

import subprocess
import sys
from pathlib import Path

def main():
    root = Path(__file__).resolve().parent.parent
    script = root / "scripts" / "huggingface_model_hub_export.mjs"
    res = subprocess.run(["node", str(script)], cwd=str(root))
    sys.exit(res.returncode)

if __name__ == "__main__":
    main()
