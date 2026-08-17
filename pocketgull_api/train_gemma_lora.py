"""Pocket-Gull Clinical Model Fine-Tuning & Distillation Pipeline.

This module loads synthetic clinical datasets exported from WebMCP tool executions,
configures Low-Rank Adaptation (LoRA) on Gemma 2 9B / MedGemma backbones, and formats
Direct Preference Optimization (DPO) training pairs.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("pocketgull.fine_tuning")


class ClinicalTrainingSample(BaseModel):
    """Pydantic model representing a single clinical instruction fine-tuning sample."""
    instruction: str = Field(..., description="Clinical task directive or WebMCP tool invocation instruction")
    input: str = Field(..., description="JSON serialized patient state, symptoms, and parameters")
    output: str = Field(..., description="Target FHIR, WebGPU, or clinical decision response")
    chosen: Optional[str] = Field(None, description="DPO preferred evidence-grounded response")
    rejected: Optional[str] = Field(None, description="DPO rejected uncalibrated or non-evidence response")


class LoRaConfigModel(BaseModel):
    """Pydantic model for LoRA fine-tuning hyperparameters."""
    base_model_name: str = Field(default="google/gemma-2-9b-it", description="Hugging Face base model identifier")
    r: int = Field(default=16, description="LoRA rank dimension")
    lora_alpha: int = Field(default=32, description="LoRA scaling factor alpha")
    lora_dropout: float = Field(default=0.05, description="LoRA dropout rate")
    target_modules: List[str] = Field(
        default_factory=lambda: ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        description="Transformer projection layers targeted for adaptation"
    )


def load_dataset(dataset_path: Path) -> List[ClinicalTrainingSample]:
    """Loads and validates JSONL fine-tuning samples.

    Args:
        dataset_path: Path to the JSONL dataset file.

    Returns:
        List of validated ClinicalTrainingSample instances.
    """
    if not dataset_path.exists():
        logger.warning(f"Dataset path {dataset_path} does not exist. Returning empty list.")
        return []

    samples: List[ClinicalTrainingSample] = []
    with open(dataset_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                data = json.loads(line)
                samples.append(ClinicalTrainingSample(**data))

    logger.info(f"Successfully loaded {len(samples)} clinical training samples from {dataset_path}")
    return samples


def generate_dpo_preference_pairs(samples: List[ClinicalTrainingSample]) -> List[Dict[str, Any]]:
    """Formats training samples into DPO preference pairs (prompt, chosen, rejected).

    Args:
        samples: List of ClinicalTrainingSample items.

    Returns:
        List of DPO preference dictionary items.
    """
    dpo_pairs: List[Dict[str, Any]] = []
    for s in samples:
        if s.chosen and s.rejected:
            prompt = f"System: You are Pocket-Gull Clinical AI.\nInstruction: {s.instruction}\nContext: {s.input}\nResponse:"
            dpo_pairs.append({
                "prompt": prompt,
                "chosen": s.chosen,
                "rejected": s.rejected
            })

    logger.info(f"Generated {len(dpo_pairs)} DPO preference pairs for alignment training.")
    return dpo_pairs


if __name__ == "__main__":
    scratch_path = Path(__file__).resolve().parent.parent / "scratch" / "fine_tuning_clinical_dataset.jsonl"
    logger.info("Initializing Pocket-Gull Fine-Tuning Pipeline...")
    
    config = LoRaConfigModel()
    logger.info(f"Target Base Model: {config.base_model_name} (Rank r={config.r}, Alpha={config.lora_alpha})")
    
    dataset_samples = load_dataset(scratch_path)
    dpo_dataset = generate_dpo_preference_pairs(dataset_samples)
    
    print("\n--- Sample DPO Preference Pair ---")
    if dpo_dataset:
        print(json.dumps(dpo_dataset[0], indent=2))
