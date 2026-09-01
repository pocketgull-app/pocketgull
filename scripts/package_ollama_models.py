#!/usr/bin/env python3
"""
🦙 PocketGull — Ollama Modelfile Packaging & Automation Engine.
Generates official Modelfile configurations for all 6 Avian Navigator models,
enabling 1-command local execution:
  ollama create pocketgull-compass -f dist/ollama/pocketgull-compass-2b/Modelfile
  ollama run pocketgull-compass
"""

import os
import sys
from pathlib import Path

MODELS = {
    "pocketgull-compass-2b": {
        "title": "PocketGull Compass (2B)",
        "base": "gemma2:2b",
        "system": (
            "You are PocketGull Compass, an empathetic and clinically rigorous medical reasoning engine "
            "grounded in Level A NIH MedQuAD and WHO mhGAP stepped-care triage consensus literature. "
            "Partition responses into a clear 3-Act Trajectory (1. Where You've Been, 2. Where You Stand Today, "
            "3. Where You're Going). Strictly adhere to ISMP decimal standards: never write trailing zeros (write 5 mg, not 5.0 mg) "
            "and always include leading zeros before decimals (write 0.5 mg, not .5 mg). "
            "Disclose that you provide supportive educational Clinical Decision Support under FDA 21 CFR §520(o)."
        ),
        "temperature": 0.2,
        "top_p": 0.95,
        "adapter_repo": "philgear/pocketgull-compass-2b"
    },
    "pocketgull-sentinel-peft": {
        "title": "PocketGull Sentinel (2B PEFT)",
        "base": "gemma2:2b",
        "system": (
            "You are PocketGull Sentinel, a zero-tolerance emergency red-flag interceptor and ISMP medication safety guard. "
            "Immediately intercept BE-FAST acute stroke symptoms (facial droop, arm drift, slurred speech), cardiopulmonary ACS distress, "
            "severe hypoxemia (SpO2 < 90%), Sepsis qSOFA, and C-SSRS suicidal crisis. Output mandatory emergency directives and statutory crisis hotlines (911/988/999/111). "
            "Audit all prescription orders for prohibited trailing zeros and naked decimals."
        ),
        "temperature": 0.1,
        "top_p": 0.90,
        "adapter_repo": "philgear/pocketgull-sentinel-peft"
    },
    "pocketgull-scribe-soap": {
        "title": "PocketGull Scribe (4B)",
        "base": "gemma2:2b",
        "system": (
            "You are PocketGull Scribe, an ambient clinical documentation encoder. Transform messy, fragmented doctor-patient encounter "
            "transcripts into clean, standardized 4-quadrant SOAP (Subjective, Objective, Assessment, Plan) and SBAR clinical notes. "
            "Enforce 100% ISMP decimal compliance and FHIR R4 clinical coding alignment."
        ),
        "temperature": 0.2,
        "top_p": 0.95,
        "adapter_repo": "philgear/pocketgull-scribe-soap"
    },
    "pocketgull-tern-edge": {
        "title": "PocketGull Tern (2B Edge)",
        "base": "gemma2:2b",
        "system": (
            "You are PocketGull Tern, an ultra-low latency on-device clinical triage assistant. "
            "Provide sub-45ms telegraphic clinical triage, vital sign risk tiering, and concise stepped-care guidance."
        ),
        "temperature": 0.1,
        "top_p": 0.90,
        "adapter_repo": "philgear/pocketgull-tern-edge"
    },
    "pocketgull-albatross-multimodal": {
        "title": "PocketGull Albatross (12B Integrative)",
        "base": "gemma2:2b",
        "system": (
            "You are PocketGull Albatross, a high-capacity Tri-Paradigm integrative diagnostic synthesizer. "
            "Integrate Western Allopathic medicine (Level A randomized clinical trials), Traditional Chinese Medicine (Zang-Fu organ meridian networks), "
            "and Ayurvedic Medicine (Tridosha constitution and Srotas channels) into unified 30-day functional health trajectories."
        ),
        "temperature": 0.3,
        "top_p": 0.95,
        "adapter_repo": "philgear/pocketgull-albatross-multimodal"
    },
    "pocketgull-rxguard-pgx": {
        "title": "PocketGull RxGuard & PGx (4B)",
        "base": "gemma2:2b",
        "system": (
            "You are PocketGull RxGuard, a clinical pharmacogenomics (PGx) and botanical herb-drug interaction screener. "
            "Analyze Cytochrome P450 (CYP2D6, CYP2C19, CYP3A4, CYP2C9) metabolic phenotypes and flag dangerous botanical herb-drug combinations "
            "(e.g. St. John's Wort + Warfarin/Statins, Ginkgo + Antiplatelets). Enforce strict ISMP dosage formatting."
        ),
        "temperature": 0.1,
        "top_p": 0.90,
        "adapter_repo": "philgear/pocketgull-rxguard-pgx"
    }
}

def generate_modelfile(model_id: str, config: dict) -> str:
    return f"""# 🦙 Ollama Modelfile for {config['title']}
# Grounded in NIH NLM MedQuAD, WHO mhGAP Guidelines & Level A Clinical Consensus
# License: Apache-2.0 | Publisher: PocketGull LLC (Phillip Gear / @philgear)
# HF Repo: https://huggingface.co/{config['adapter_repo']}

FROM {config['base']}

# Runtime Parameters
PARAMETER temperature {config['temperature']}
PARAMETER top_p {config['top_p']}
PARAMETER stop "<end_of_turn>"
PARAMETER stop "<eos>"

# Clinical System Instruction
SYSTEM \"\"\"{config['system']}\"\"\"

# Clinical Prompt Template
TEMPLATE \"\"\"<start_of_turn>user
{{{{ .Prompt }}}}<end_of_turn>
<start_of_turn>model
{{{{ .Response }}}}<end_of_turn>\"\"\"
"""

def package_all_models():
    output_root = Path("dist") / "ollama"
    output_root.mkdir(parents=True, exist_ok=True)

    install_cmds_ps1 = ["# PocketGull 1-Click Ollama Model Registration (PowerShell)", ""]
    install_cmds_sh = ["#!/usr/bin/env bash", "# PocketGull 1-Click Ollama Model Registration (macOS / Linux)", ""]

    for model_id, config in MODELS.items():
        model_dir = output_root / model_id
        model_dir.mkdir(parents=True, exist_ok=True)
        
        modelfile_content = generate_modelfile(model_id, config)
        modelfile_path = model_dir / "Modelfile"
        modelfile_path.write_text(modelfile_content, encoding="utf-8")
        
        print(f" [OLLAMA] Generated Modelfile for {model_id} -> {modelfile_path}")

        # Add CLI command
        alias = model_id.replace("pocketgull-", "")
        install_cmds_ps1.append(f'ollama create {model_id} -f "{modelfile_path}"')
        install_cmds_ps1.append(f'ollama create {alias} -f "{modelfile_path}"')
        install_cmds_sh.append(f'ollama create {model_id} -f "{modelfile_path}"')
        install_cmds_sh.append(f'ollama create {alias} -f "{modelfile_path}"')

    # Write quick registration scripts
    (output_root / "install_models.ps1").write_text("\n".join(install_cmds_ps1) + "\n", encoding="utf-8")
    (output_root / "install_models.sh").write_text("\n".join(install_cmds_sh) + "\n", encoding="utf-8")

    print("\n================================================================")
    print(f" [SUCCESS] Packaged all 6 Ollama Modelfiles in: {output_root}")
    print(f" Quick install scripts generated:")
    print(f"   Windows:    powershell -ExecutionPolicy Bypass -File dist/ollama/install_models.ps1")
    print(f"   Mac/Linux:  bash dist/ollama/install_models.sh")
    print("================================================================\n")

if __name__ == "__main__":
    package_all_models()
