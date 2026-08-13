#!/usr/bin/env python3
"""
Gemma 2 / Gemma 3 Paradigm-Driven LoRA Fine-Tuning Utility.

This script provides fine-tuning pipelines for Gemma models (2B, 9B, 27B)
using Unsloth (for up to 4x speedup and 80% VRAM savings) with automated
fallback to Hugging Face PEFT + TRL.

Key Paradigms Supported:
  1. clinical_cot    : Skeptical differential diagnosis with Popperian H0 testing & Cochrane RoB 2 tiers.
  2. fhir_extraction : Strict FHIR R4 Bundle JSON extraction from clinical intake notes.
  3. patient_tutor   : Socratic patient education dialogues.

Usage Examples:
  # Dry-run test dataset formatting
  python scripts/finetune_gemma_lora.py --paradigm clinical_cot --dry_run

  # Fine-tune Gemma 2 9B model
  python scripts/finetune_gemma_lora.py --model_name unsloth/gemma-2-9b-it --paradigm fhir_extraction --output_dir ./lora_fhir

  # Export to GGUF format for edge deployment (requires Unsloth)
  python scripts/finetune_gemma_lora.py --export_gguf q4_k_m
"""

import argparse
import json
import logging
import os
import sys
from typing import Any, Dict, List, Optional

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("gemma_finetune")

# Dynamic import detection for Unsloth vs Standard Hugging Face PEFT/TRL
HAS_UNSLOTH = False
try:
    from unsloth import FastLanguageModel
    HAS_UNSLOTH = True
    logger.info("Unsloth backend detected successfully.")
except ImportError:
    logger.info("Unsloth not installed. Falling back to standard Hugging Face PEFT + TRL.")


# -----------------------------------------------------------------------------
# Paradigm System Directives & Synthetic Sample Datasets
# -----------------------------------------------------------------------------
PARADIGM_DIRECTIVES = {
    "clinical_cot": (
        "[PARADIGM: CLINICAL REASONING & SKEPTICAL EVALUATION]\n"
        "You are Pocketgull Skeptical Clinical Intelligence. Evaluate clinical observations against "
        "population baseline means. Enforce Popperian null hypothesis testing (H0) for all findings. "
        "Provide explicit Cochrane Risk of Bias (RoB 2) ratings and evidence tier classifications "
        "(Level A: RCTs, Level B: Cohort, Level C: Consensus). Structure output with <thinking_process>, "
        "<evidence_audit>, and <clinical_conclusion>."
    ),
    "fhir_extraction": (
        "[PARADIGM: FHIR R4 STRUCTURED SERIALIZATION]\n"
        "You are an automated FHIR R4 serialization engine. Extract clinical entities from input text "
        "and serialize them strictly into a valid FHIR R4 Bundle JSON payload containing Patient, "
        "Observation, and Condition resources. Output ONLY raw valid JSON without markdown formatting or preamble."
    ),
    "patient_tutor": (
        "[PARADIGM: SOCRATIC PATIENT EDUCATION]\n"
        "You are Pocketgull Patient Health Tutor. Explain biophysical findings using accessible terminology. "
        "Promote active health literacy, address correlation vs causation discernment, and conclude each response "
        "with exactly one interactive Socratic question."
    ),
    "careplan_translation": (
        "[PARADIGM: CLINICAL CARE PLAN LOCALIZATION & COGNITIVE ADAPTATION]\n"
        "You are an ACA Section 1557 compliant clinical translation and cognitive adaptation engine. "
        "Rewrite or translate clinical care plans into the target language and cognitive accessibility level "
        "(Grade 6-8 simplified, Dyslexia-accessible, or Limited English Proficiency target language). "
        "Preserve ALL medical facts, diagnoses, medication names, and exact dosages without deviation. "
        "Wrap output strictly between '### [START CARE PLAN]' and '### [END CARE PLAN]'."
    ),
    "biophysical_telemetry": (
        "[PARADIGM: BIOPHYSICAL SIGNAL TELEMETRY & AUTONOMIC SYNTHESIS]\n"
        "You are a biophysical signal synthesis engine. Interpret raw physiological wearable telemetry streams "
        "(ECG HRV metrics, PPG pulse transit time, EEG micro-state spectral power, polysomnography sleep architecture) "
        "and produce structured autonomic nervous system risk evaluations and sympathetic/parasympathetic tone classifications."
    ),
    "webmcp_dispatch": (
        "[PARADIGM: WEBMCP TOOL INVOCATION DISPATCH]\n"
        "You are an autonomous WebMCP tool dispatcher. Parse user directives and produce valid JSON array "
        "tool call invocations targeting registered browser services (e.g. OfflineEdgeAiService, PatientStateService). "
        "Output ONLY raw valid JSON array tool calls conforming to registered WebMCP schemas."
    ),
    "multiorgan_crosstalk": (
        "[PARADIGM: MULTI-SYSTEM INTER-ORGAN CROSS-TALK]\n"
        "You are Pocketgull Multi-Organ Biophysical Systems Intelligence. Analyze cross-talk between distinct organ "
        "systems (e.g. Teledentistry SIBI periodontal inflammatory burden -> cardiovascular endothelial risk and HbA1c trajectory). "
        "Quantify systemic inflammatory interaction vectors using co-occurrence priors and biophysical coupling formulas."
    ),
    "hipaa_deidentification": (
        "[PARADIGM: HIPAA SAFE HARBOR ON-DEVICE PHI DE-IDENTIFICATION]\n"
        "You are an on-device HIPAA §164.514 Safe Harbor privacy sanitization engine. Scrub all 18 PHI identifier classes "
        "(names, exact dates, phone numbers, SSNs, MRNs, geographic sub-state regions) from input clinical narratives "
        "using standardized token masks (e.g. [PATIENT_NAME], [REDACTED_SSN]). Output clean anonymized text."
    ),
    "voice_disfluency": (
        "[PARADIGM: MULTIMODAL VOICE CONSULT DISFLUENCY PARSER]\n"
        "You are a real-time conversational clinical speech parser. Parse raw audio transcriptions containing "
        "conversational filler ('um', 'err', 'like'), false starts, self-corrections, and interruptions. Extract the "
        "true underlying clinical presentation, symptom timeline, and patient intent without narrative noise."
    ),
    "clinical_safety_guard": (
        "[PARADIGM: SHIELDGEMMA CLINICAL SAFETY & CDS MODERATION]\n"
        "You are a ShieldGemma clinical safety moderation engine. Evaluate user inputs and model outputs "
        "against clinical decision support (CDS) safety boundaries. Permit standard-of-care medical terminology "
        "(toxic exposure, overdose management, suicidal ideation screening PHQ-9/C-SSRS) while strictly flagging "
        "malicious non-clinical prompt injections, illegal drug synthesis, or self-harm encouragement. "
        "Output ONLY raw valid JSON: {'safety_decision': 'SAFE'|'UNSAFE', 'policy_violation': null|'category', 'rationale': 'reason'}."
    ),
    "generative_ui_dispatch": (
        "[PARADIGM: GENERATIVE UI DYNAMIC COMPONENT AUTO-SURFACING]\n"
        "You are an intelligent clinical workspace UX orchestration engine. Analyze live patient intake notes, "
        "assessment panel entries, or voice consult transcriptions. Dynamically dispatch UI component render "
        "directives to automatically surface relevant clinical lenses, 3D WebGL meshes, or specialized diagnostic "
        "widgets without requiring manual tab navigation. Output ONLY raw valid JSON containing a 'surfacedComponents' array."
    ),
    "double_flip_ui_interlock": (
        "[PARADIGM: BISTABLE DOUBLE-FLIP INTERLOCK & RATIONALE GENERATION]\n"
        "You are a clinical transparency and bistable UI state machine engine. For any dynamically surfaced "
        "UI component, generate a dual-state payload containing State A (Front: Clinical Action & Telemetry Controls) "
        "and State B (Back: Double-Flip Cognitive Rationale, Trigger Evidence, Cochrane RoB 2 Tier, and Socratic Explanation). "
        "Output ONLY raw valid JSON containing 'stateA' and 'stateB' objects conforming to DoubleFlipStateMachine schema."
    ),
}

SAMPLE_DATASETS = {
    "clinical_cot": [
        {
            "input": "Female (34y), presenting with acute resting tachycardia (98 bpm, Baseline: 72 bpm) and mild exertion dyspnea. Recent mild viral illness 10 days ago.",
            "output": (
                "<thinking_process>\n"
                "1. H0 Hypothesis: Resting HR elevation is transient viral post-sequelae without structural myocarditis.\n"
                "2. p-value calculation against age-matched baseline yields p = 0.012 (reject H0 for normal resting variation).\n"
                "3. Differential: Post-viral autonomic dysfunction vs acute viral myocarditis vs thyroiditis.\n"
                "</thinking_process>\n"
                "<evidence_audit>\n"
                "- Finding: Resting Tachycardia (98 bpm)\n"
                "- Evidence Tier: Level B (Cohort studies on post-viral autonomic modulation)\n"
                "- Risk of Bias: Low\n"
                "</evidence_audit>\n"
                "<clinical_conclusion>\n"
                "Recommended Next Steps: High-sensitivity Troponin T, 12-lead ECG, orthostatic vitals check. Monitor for chest pain."
            ),
        },
        {
            "input": "Male (58y), fasting blood glucose 138 mg/dL (Baseline: 104 mg/dL), HbA1c 6.8%. History of hypertension.",
            "output": (
                "<thinking_process>\n"
                "1. H0 Hypothesis: Blood glucose elevation represents acute acute-phase stress response rather than persistent metabolic shift.\n"
                "2. HbA1c of 6.8% (p < 0.001) refutes H0 of acute stress; confirms persistent glycemic dysregulation.\n"
                "</thinking_process>\n"
                "<evidence_audit>\n"
                "- Finding: Elevated HbA1c (6.8%)\n"
                "- Evidence Tier: Level A (ADA Clinical Practice Guidelines)\n"
                "- Risk of Bias: Very Low\n"
                "</evidence_audit>\n"
                "<clinical_conclusion>\n"
                "Diagnostic Classification: Type 2 Diabetes Mellitus. Initiate lifestyle modification evaluation and renal function panel."
            ),
        },
    ],
    "fhir_extraction": [
        {
            "input": "Patient Jane Doe, 34yo female. Vitals: Heart Rate 98 bpm, Blood Pressure 120/80 mmHg. Symptom: Acute Tachycardia.",
            "output": json.dumps(
                {
                    "resourceType": "Bundle",
                    "type": "collection",
                    "entry": [
                        {
                            "resource": {
                                "resourceType": "Patient",
                                "id": "p-34f",
                                "gender": "female",
                                "birthDate": "1992-05-15",
                            }
                        },
                        {
                            "resource": {
                                "resourceType": "Observation",
                                "status": "final",
                                "code": {
                                    "coding": [
                                        {
                                            "system": "http://loinc.org",
                                            "code": "8867-4",
                                            "display": "Heart rate",
                                        }
                                    ]
                                },
                                "valueQuantity": {
                                    "value": 98,
                                    "unit": "beats/min",
                                    "system": "http://unitsofmeasure.org",
                                    "code": "/min",
                                },
                            }
                        },
                    ],
                },
                indent=2,
            ),
        }
    ],
    "patient_tutor": [
        {
            "input": "Why is my heart rate higher than normal today after having a cold last week?",
            "output": (
                "When your body fights off a cold virus, your immune system releases natural signals called cytokines. "
                "These signals, along with mild dehydration, cause your heart to pump slightly faster to deliver nutrients "
                "and repair immune tissues throughout your body.\n\n"
                "Would you like to check how your resting heart rate today compares to your usual average when you feel fully healthy?"
            ),
        }
    ],
    "careplan_translation": [
        {
            "input": (
                "TARGET: Spanish (Simplified Cognitive Grade 6)\n"
                "ORIGINAL CARE PLAN:\n"
                "Patient exhibits acute essential hypertension (systolic BP 148 mmHg, diastolic BP 92 mmHg). "
                "Initiate Lisinopril 10mg PO daily. Monitor renal function panel (BUN/Creatinine) in 14 days."
            ),
            "output": (
                "### [START CARE PLAN]\n"
                "**Plan de Cuidado Personalizado**\n\n"
                "- **Diagnóstico**: Presión arterial alta (hipertensión arterial) con lecturas de 148/92 mmHg.\n"
                "- **Medicamento**: Tome **Lisinopril 10mg** por vía oral una vez al día.\n"
                "- **Próximo Paso**: Análisis de sangre para revisar la función de sus riñones en 14 días.\n"
                "### [END CARE PLAN]"
            ),
        }
    ],
    "biophysical_telemetry": [
        {
            "input": "ECG RMSSD: 18ms (Baseline: 42ms), PPG Pulse Transit Time: 140ms, EEG Alpha/Beta power ratio: 0.65. Rest duration: 6.2 hrs.",
            "output": (
                "<autonomic_evaluation>\n"
                "- Sympathetic Tone: Hyper-reactive (Elevated cardiac autonomic arousal)\n"
                "- Parasympathetic Vagal Tone: Suppressed (RMSSD < 20ms threshold, p = 0.008)\n"
                "- Biophysical Risk Score: High Vagal Withdrawal (Score: 7.8/10)\n"
                "- Classification: Acute Allostatic Stress Modulation\n"
                "</autonomic_evaluation>"
            ),
        }
    ],
    "webmcp_dispatch": [
        {
            "input": "Client telemetry indicates resting tachycardia (98 bpm). Dispatch local WebMCP offline edge assessment and update patient state.",
            "output": json.dumps(
                [
                    {
                        "tool": "OfflineEdgeAiService.runEdgeInference",
                        "args": {"metric": "heart_rate", "value": 98, "acuity": "moderate"},
                    },
                    {
                        "tool": "PatientStateService.updateVitals",
                        "args": {"heartRate": 98, "status": "flagged_tachycardia"},
                    },
                ],
                indent=2,
            ),
        }
    ],
    "multiorgan_crosstalk": [
        {
            "input": "Teledentistry FDI odontogram: generalized Periodontal Probing Depth PPD 5mm, SIBI index 7.2/10. Metabolic panel: Fasting Glucose 126 mg/dL.",
            "output": (
                "<crosstalk_analysis>\n"
                "- Primary System Interaction: Oral-Metabolic-Cardiovascular Axis\n"
                "- Inflammatory Coupling Vector: SIBI score 7.2 indicates high systemic TNF-alpha/IL-6 oral shedding\n"
                "- Cross-Talk Impact: Periodontal systemic burden increases 24-month T2D progression probability by 34% (p = 0.003)\n"
                "- Actionable Target: Co-manage periodontal SRP therapy alongside glycemic stabilization to lower SIBI index < 3.0\n"
                "</crosstalk_analysis>"
            ),
        }
    ],
    "hipaa_deidentification": [
        {
            "input": "Patient Robert Vance (DOB: 04/12/1968, SSN: 999-12-3456, Phone: 555-0199, MRN: #849201) residing in Seattle, WA 98101 was evaluated.",
            "output": "Patient [PATIENT_NAME] (DOB: [DATE_AGE_GT89], SSN: [REDACTED_SSN], Phone: [PHONE_NUMBER], MRN: [REDACTED_MRN]) residing in [LOCATION_CITY], [LOCATION_STATE] [ZIP_PREFIX] was evaluated.",
        }
    ],
    "voice_disfluency": [
        {
            "input": "Um, so... like, my left chest felt tight—wait, no, I mean my upper stomach right after dinner... like a sharp burning feeling for maybe 20 minutes.",
            "output": (
                "<clinical_intent_extraction>\n"
                "- Chief Complaint: Acute postprandial retrosternal/epigastric burning discomfort\n"
                "- Location: Upper epigastrium (self-corrected from left chest)\n"
                "- Duration: Approximately 20 minutes\n"
                "- Disfluencies Scrubbed: Removed 4 filler words ('um', 'so', 'like') and 1 speech self-correction ('left chest' -> 'upper stomach')\n"
                "</clinical_intent_extraction>"
            ),
        }
    ],
    "clinical_safety_guard": [
        {
            "input": "PROMPT EVALUATION: Patient presents with acute acetaminophen overdose (>10g ingestion). Evaluate emergency N-acetylcysteine (NAC) protocol.",
            "output": json.dumps(
                {
                    "safety_decision": "SAFE",
                    "policy_violation": None,
                    "rationale": "Standard-of-care medical emergency triage and toxic exposure management. Permitted under Clinical CDS safety policy.",
                },
                indent=2,
            ),
        }
    ],
    "generative_ui_dispatch": [
        {
            "input": "ASSESSMENT PANEL ENTRY: Patient reports 3-day history of localized severe pain in FDI tooth 36 (lower left first molar), sensitivity to hot/cold, and fasting glucose 132 mg/dL.",
            "output": json.dumps(
                {
                    "surfacedComponents": [
                        {
                            "componentId": "TeledentistryOdontogramComponent",
                            "priority": "high",
                            "reason": "Active dental pain reported on FDI Tooth 36 (lower left first molar)",
                            "props": {"activeFdiTooth": 36, "surfaceRisk": "occlusal_caries"},
                        },
                        {
                            "componentId": "BodyMeshFactoryComponent",
                            "priority": "medium",
                            "reason": "Surfacing 3D mandible bone PBR mesh for spatial pain localization",
                            "props": {"focusRegion": "mandible_left", "pbrStain": "inflammatory_hyperemia"},
                        },
                    ]
                },
                indent=2,
            ),
        }
    ],
    "double_flip_ui_interlock": [
        {
            "input": "SURFACED COMPONENT: TeledentistryOdontogramComponent (FDI Tooth 36, PPD 5mm, SIBI 7.2, Fasting Glucose 132 mg/dL)",
            "output": json.dumps(
                {
                    "componentId": "TeledentistryOdontogramComponent",
                    "stateA": {
                        "viewTitle": "State A: Clinician Control Panel (High-Density Medical Terms)",
                        "activeFdiTooth": 36,
                        "ppdMm": 5.0,
                        "sibiIndex": 7.2,
                        "clinicalDifferential": "Generalized Periodontitis with Systemic Inflammatory Burden (SIBI 7.2)",
                        "actionButtons": ["Initiate Periodontal SRP Protocol", "Export FHIR Observation"],
                    },
                    "stateB": {
                        "viewTitle": "State B: Patient Education Lens (Double-Flip Patient-Facing View)",
                        "plainLanguageDiagnosis": "Deep gum pocket around your back left tooth with mild swelling that can affect your blood sugar.",
                        "biophysicalAnalogy": "Think of healthy gums like a sealed door. When gum pockets get deeper than 4mm, microscopic bacteria can slip through into your bloodstream, making your body work harder to manage daily glucose levels.",
                        "socraticInquiry": "Would you like to see how caring for this tooth can help keep your morning blood sugar numbers more stable?",
                        "section1557Multilingual": {"spanish": "Bolsillo de encía profundo alrededor de su diente posterior izquierdo...", "readingGradeLevel": "Grade 6.2"},
                        "patientActionPlan": ["Brush twice daily with soft bristles", "Rinse with antimicrobial mouthwash", "Schedule 2-week follow-up"],
                    },
                },
                indent=2,
            ),
        }
    ],
}


def format_gemma_prompt(system_directive: str, user_input: str, model_response: str = "") -> str:
    """Format prompt using Gemma's control token chat template.

    Args:
        system_directive: Paradigm system instructions.
        user_input: User presentation or input payload.
        model_response: Expected model generation target (for training).

    Returns:
        Formatted prompt string adhering to Gemma control token standards.
    """
    formatted = (
        f"<start_of_turn>user\n"
        f"{system_directive.strip()}\n\n"
        f"INPUT:\n{user_input.strip()}<end_of_turn>\n"
        f"<start_of_turn>model\n"
    )
    if model_response:
        formatted += f"{model_response.strip()}<end_of_turn>\n"
    return formatted


def load_dataset_for_paradigm(paradigm: str, custom_path: Optional[str] = None) -> List[Dict[str, str]]:
    """Load or generate training formatted samples for the specified paradigm.

    Args:
        paradigm: Key identifying the target clinical paradigm.
        custom_path: Optional file path to a JSON lines dataset file.

    Returns:
        List of formatted prompt dictionary objects containing a 'text' field.
    """
    directive = PARADIGM_DIRECTIVES.get(paradigm, PARADIGM_DIRECTIVES["clinical_cot"])
    raw_samples = []

    if custom_path and os.path.exists(custom_path):
        logger.info(f"Loading custom dataset from {custom_path}")
        with open(custom_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    raw_samples.append(json.loads(line))
    else:
        logger.info(f"Using pre-packaged synthetic dataset samples for paradigm '{paradigm}'")
        raw_samples = SAMPLE_DATASETS.get(paradigm, SAMPLE_DATASETS["clinical_cot"])

    formatted_samples = []
    for sample in raw_samples:
        text = format_gemma_prompt(
            system_directive=directive,
            user_input=sample["input"],
            model_response=sample.get("output", ""),
        )
        formatted_samples.append({"text": text})

    return formatted_samples


# -----------------------------------------------------------------------------
# Unsloth Fine-Tuning Execution Engine
# -----------------------------------------------------------------------------
def train_with_unsloth(args: argparse.Namespace, dataset_samples: List[Dict[str, str]]) -> None:
    """Execute LoRA fine-tuning using Unsloth FastLanguageModel."""
    from datasets import Dataset
    from trl import SFTTrainer
    from transformers import TrainingArguments

    logger.info(f"Initializing Unsloth FastLanguageModel: {args.model_name}")
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=args.model_name,
        max_seq_length=args.max_seq_length,
        dtype=None,  # Auto detection (float16 / bfloat16)
        load_in_4bit=True,
    )

    logger.info("Configuring LoRA target modules for Gemma architecture...")
    model = FastLanguageModel.get_peft_model(
        model,
        r=args.r,
        lora_alpha=args.alpha,
        lora_dropout=0,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        bias="none",
        use_gradient_checkpointing="unsloth",
        random_state=3407,
    )

    dataset = Dataset.from_list(dataset_samples)

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=args.max_seq_length,
        dataset_num_proc=2,
        packing=False,
        args=TrainingArguments(
            per_device_train_batch_size=args.batch_size,
            gradient_accumulation_steps=args.grad_accum,
            warmup_steps=5,
            max_steps=args.max_steps if args.max_steps > 0 else len(dataset_samples) * args.epochs,
            learning_rate=args.lr,
            fp16=not FastLanguageModel.is_bfloat16_supported(),
            bf16=FastLanguageModel.is_bfloat16_supported(),
            logging_steps=1,
            output_dir=args.output_dir,
            optim="adamw_8bit",
            seed=3407,
        ),
    )

    logger.info("Starting LoRA fine-tuning with Unsloth...")
    trainer_stats = trainer.train()
    logger.info(f"Training complete. Loss stats: {trainer_stats}")

    logger.info(f"Saving fine-tuned LoRA weights to {args.output_dir}")
    model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)

    if args.export_gguf:
        logger.info(f"Exporting model to GGUF format: quantization={args.export_gguf}")
        model.save_pretrained_gguf(args.output_dir, tokenizer, quantization_method=args.export_gguf)
        logger.info("GGUF export successfully finished.")


# -----------------------------------------------------------------------------
# Fallback Hugging Face PEFT + TRL Execution Engine
# -----------------------------------------------------------------------------
def train_with_huggingface(args: argparse.Namespace, dataset_samples: List[Dict[str, str]]) -> None:
    """Execute LoRA fine-tuning using standard Hugging Face PEFT + TRL."""
    try:
        import torch
        from datasets import Dataset
        from peft import LoraConfig, get_peft_model
        from transformers import AutoModelForCausalVLM, AutoTokenizer, BitsAndBytesConfig, TrainingArguments
        from trl import SFTTrainer
    except ImportError as e:
        logger.error(f"Missing required Hugging Face dependency: {e}")
        logger.error("Install dependencies via: pip install torch transformers peft trl datasets bitsandbytes")
        sys.exit(1)

    logger.info(f"Initializing Hugging Face model with BitsAndBytes 4-bit: {args.model_name}")
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
    )

    tokenizer = AutoTokenizer.from_pretrained(args.model_name)
    model = AutoModelForCausalVLM.from_pretrained(
        args.model_name,
        quantization_config=bnb_config,
        device_map="auto",
    )

    peft_config = LoraConfig(
        r=args.r,
        lora_alpha=args.alpha,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    )

    model = get_peft_model(model, peft_config)
    dataset = Dataset.from_list(dataset_samples)

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=args.max_seq_length,
        args=TrainingArguments(
            per_device_train_batch_size=args.batch_size,
            gradient_accumulation_steps=args.grad_accum,
            warmup_steps=5,
            max_steps=args.max_steps if args.max_steps > 0 else len(dataset_samples) * args.epochs,
            learning_rate=args.lr,
            fp16=True,
            logging_steps=1,
            output_dir=args.output_dir,
        ),
    )

    logger.info("Starting LoRA fine-tuning with Hugging Face PEFT...")
    trainer.train()

    logger.info(f"Saving fine-tuned LoRA adapter to {args.output_dir}")
    model.save_pretrained(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)


# -----------------------------------------------------------------------------
# Main CLI Handler
# -----------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(
        description="Gemma 2 / Gemma 3 Paradigm-Driven LoRA Fine-Tuning Utility",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--model_name",
        type=str,
        default="unsloth/gemma-2-9b-it",
        help="Base Gemma model repository ID on Hugging Face",
    )
    parser.add_argument(
        "--paradigm",
        type=str,
        default="clinical_cot",
        choices=[
            "clinical_cot",
            "fhir_extraction",
            "patient_tutor",
            "careplan_translation",
            "biophysical_telemetry",
            "webmcp_dispatch",
            "multiorgan_crosstalk",
            "hipaa_deidentification",
            "voice_disfluency",
            "clinical_safety_guard",
            "generative_ui_dispatch",
            "double_flip_ui_interlock",
        ],
        help="Target clinical paradigm instruction format",
    )
    parser.add_argument("--dataset_path", type=str, default=None, help="Path to custom JSONL training dataset")
    parser.add_argument("--output_dir", type=str, default="./lora_gemma_adapter", help="Directory to save output weights")
    parser.add_argument("--r", type=int, default=16, help="LoRA rank parameter")
    parser.add_argument("--alpha", type=int, default=32, help="LoRA alpha scaling parameter")
    parser.add_argument("--lr", type=float, default=2e-4, help="Learning rate")
    parser.add_argument("--batch_size", type=int, default=2, help="Per-device train batch size")
    parser.add_argument("--grad_accum", type=int, default=4, help="Gradient accumulation steps")
    parser.add_argument("--epochs", type=int, default=3, help="Training epoch count")
    parser.add_argument("--max_steps", type=int, default=-1, help="Max training steps (-1 uses epochs)")
    parser.add_argument("--max_seq_length", type=int, default=2048, help="Maximum sequence token length")
    parser.add_argument(
        "--export_gguf",
        type=str,
        default=None,
        choices=["q4_k_m", "q8_0", "f16"],
        help="Export fine-tuned model to GGUF format (requires Unsloth)",
    )
    parser.add_argument(
        "--dry_run",
        action="store_true",
        help="Validate dataset formatting and token control alignment without initiating GPU training",
    )

    args = parser.parse_args()

    logger.info("=== Pocketgull Gemma Paradigm Fine-Tuner ===")
    logger.info(f"Selected Paradigm : {args.paradigm}")
    logger.info(f"Target Base Model : {args.model_name}")

    # Load formatted dataset samples
    samples = load_dataset_for_paradigm(args.paradigm, args.dataset_path)
    logger.info(f"Loaded {len(samples)} training samples.")

    if args.dry_run:
        logger.info("--- DRY-RUN MODE: Sample Formatted Training Token Payload ---")
        print(samples[0]["text"])
        logger.info("Dry-run validation complete. Exiting cleanly.")
        return

    # Execute fine-tuning using available backend
    if HAS_UNSLOTH:
        train_with_unsloth(args, samples)
    else:
        train_with_huggingface(args, samples)


if __name__ == "__main__":
    main()
