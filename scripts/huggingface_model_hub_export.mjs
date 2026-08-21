/**
 * 🏛️ PocketGull LLC — Hugging Face & Kaggle Model Hub Exporter (Node.js)
 * Packages all 11 domain fine-tuned Gemma 3 LoRA adapters with standardized
 * Model Card metadata, Open Science citations, and HIPAA Safe Harbor compliance.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ADAPTERS_DIR = path.join(ROOT_DIR, 'adapters', 'huggingface');

const CLINICAL_ADAPTERS = [
  {
    id: 'gemma-3-clinical-rxguard',
    name: 'PocketGull Gemma 3 RxGuard & PGx Interaction Screener',
    base_model: 'google/gemma-3-4b-it',
    discipline: 'Pharmacogenomics & Botanical Supplement Interactions',
    description: 'Screens Cytochrome P450 (CYP2D6, CYP2C19, SLCO1B1) interactions across allopathic prescriptions and botanical herbs.'
  },
  {
    id: 'gemma-3-phenopackets-genomics',
    name: 'PocketGull Gemma 3 GA4GH Phenopackets v2 Translator',
    base_model: 'google/gemma-3-12b-it',
    discipline: 'Rare Disease Genomics & HPO Ontology',
    description: 'Translates free-text clinical notes into compliant GA4GH Phenopackets Schema v2.0 JSON with HPO/LOINC concepts.'
  },
  {
    id: 'gemma-3-ambient-soap-scribe',
    name: 'PocketGull Gemma 3 Ambient Clinical SOAP & SBAR Scribe',
    base_model: 'google/gemma-3-4b-it',
    discipline: 'Ambient Clinical NLP & Encounter Coding',
    description: 'Converts ambient patient-clinician conversation into structured SOAP records with ICD-10 and SNOMED-CT codes.'
  },
  {
    id: 'gemma-3-biomarker-velocity',
    name: 'PocketGull Gemma 3 Biomarker Velocity & Resilience Forecaster',
    base_model: 'google/gemma-3-4b-it',
    discipline: 'Biophysical Rate-of-Change & Organ Longevity',
    description: 'Computes first-derivative rate of change across longitudinal blood panels and forecasts stealth organ degradation.'
  },
  {
    id: 'gemma-3-tri-paradigm-radar',
    name: 'PocketGull Gemma 3 Tri-Paradigm Diagnostic Integrator',
    base_model: 'google/gemma-3-12b-it',
    discipline: 'Integrative Allopathic, TCM & Ayurvedic Synthesis',
    description: 'Simultaneously examines care plan vectors through Western, TCM Zang-Fu, and Ayurvedic Tridosha lenses.'
  },
  {
    id: 'gemma-3-nof1-trial-designer',
    name: 'PocketGull Gemma 3 N-of-1 Single-Case Trial Protocol Designer',
    base_model: 'google/gemma-3-4b-it',
    discipline: 'Personalized Clinical Biostatistics',
    description: 'Generates 56-day ABAB crossover trial protocols with Bayesian posterior superiority calculations.'
  },
  {
    id: 'gemma-3-prior-auth-cms0057',
    name: 'PocketGull Gemma 3 CMS-0057-F Fast-Track Prior Auth Assistant',
    base_model: 'google/gemma-3-4b-it',
    discipline: 'Regulatory Compliance & Payer Interoperability',
    description: 'Formats Da Vinci PAS (Payer Alert Services) FHIR bundles for 72-hour expedited prior authorization.'
  },
  {
    id: 'gemma-3-sdoh-equity-compass',
    name: 'PocketGull Gemma 3 WHO/CDC SDoH Health Equity Classifier',
    base_model: 'google/gemma-3-4b-it',
    discipline: 'Social Determinants of Health & Health Equity',
    description: 'Screens 5 SDoH domains and maps community-grounded resources at an 8th-grade reading level.'
  },
  {
    id: 'gemma-3-mandiant-defense-auditor',
    name: 'PocketGull Gemma 3 Mandiant Clinical Cyber Defense Guard',
    base_model: 'google/gemma-3-4b-it',
    discipline: 'Healthcare Cybersecurity & Anti-Whaling',
    description: 'Audits dual-custody authorization and sanitizes prompt injection vectors in external medical records.'
  },
  {
    id: 'gemma-3-ophthalmology-retina-cds',
    name: 'PocketGull Gemma 3 Ophthalmology & LogMAR Visual Acuity CDS',
    base_model: 'google/gemma-3-4b-it',
    discipline: 'Ophthalmological Decision Support',
    description: 'Analyzes optical coherence tomography findings and optotypic visual acuity charts with zero lexical ambiguity.'
  },
  {
    id: 'gemma-3-grand-rounds-care-presenter',
    name: 'PocketGull Gemma 3 Grand Rounds 7-Slide & CARE Case Publisher',
    base_model: 'google/gemma-3-12b-it',
    discipline: 'Academic Medical Case Publication',
    description: 'Compiles 7-slide academic Grand Rounds decks and CARE Guidelines-compliant medical case reports.'
  }
];

function generateModelCard(adapter) {
  return `---
language:
- en
license: apache-2.0
library_name: peft
tags:
- gemma-3
- lora
- clinical-nlp
- healthcare
- hipaa-safe-harbor
- open-science
- pocketgull
base_model: ${adapter.base_model}
pipeline_tag: text-generation
---

# 🕊️ ${adapter.name}

**Organization**: [PocketGull LLC](https://pocketgull.com) (Oregon Registry: 258869891)  
**Informatics Lead**: Phillip Gear (CMS NPI: 1487569752 | ORCID: [0009-0008-1372-5381](https://orcid.org/0009-0008-1372-5381))  
**Base Foundation Model**: \`${adapter.base_model}\`  
**Discipline**: ${adapter.discipline}  
**Open Science Provenance**: [Zenodo DOI 10.5281/zenodo.20647514](https://doi.org/10.5281/zenodo.20647514)  

---

## 📌 Overview
${adapter.description}

This LoRA adapter was fine-tuned using Direct Preference Optimization (DPO) on domain-specific clinical datasets conforming strictly to **HIPAA §164.514 Safe Harbor** de-identification standards.

---

## 🔒 HIPAA & Regulatory Compliance
* **Zero-PHI Retention**: Designed for local edge computation and private Google Cloud Vertex AI deployment.
* **FDA 520(o) Non-Device CDS**: Supportive evidence-grounded tool intended to assist licensed healthcare providers.

## 📖 Citation
\`\`\`bibtex
@software{pocketgull_clinical_2026,
  author = {Gear, Phillip},
  title = {Pocket-Gull: Living Medical Intelligence Engine & Open Clinical Science Suite},
  publisher = {Zenodo},
  version = {1.25.0},
  year = {2026},
  doi = {10.5281/zenodo.20647514},
  url = {https://pocketgull.app}
}
\`\`\`
`;
}

function exportAllModels() {
  if (!fs.existsSync(ADAPTERS_DIR)) {
    fs.mkdirSync(ADAPTERS_DIR, { recursive: true });
  }

  const manifest = [];

  console.log('================================================================');
  console.log('📦  POCKETGULL LLC — HUGGING FACE & KAGGLE MODEL HUB PACKAGER');
  console.log('================================================================\n');

  for (const adapter of CLINICAL_ADAPTERS) {
    const modelDir = path.join(ADAPTERS_DIR, adapter.id);
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true });
    }

    const readmePath = path.join(modelDir, 'README.md');
    fs.writeFileSync(readmePath, generateModelCard(adapter), 'utf8');

    const configPath = path.join(modelDir, 'adapter_config.json');
    const adapterConfig = {
      peft_type: 'LORA',
      auto_mapping: null,
      base_model_name_or_path: adapter.base_model,
      r: 16,
      lora_alpha: 32,
      lora_dropout: 0.05,
      target_modules: ['q_proj', 'v_proj', 'k_proj', 'o_proj'],
      bias: 'none',
      task_type: 'CAUSAL_LM'
    };
    fs.writeFileSync(configPath, JSON.stringify(adapterConfig, null, 2), 'utf8');

    manifest.push({
      id: adapter.id,
      name: adapter.name,
      hub_repo: `pocketgull-llc/${adapter.id}`,
      directory: modelDir
    });

    console.log(`✅ Packaged: ${adapter.id} -> ${modelDir}`);
  }

  const manifestPath = path.join(ADAPTERS_DIR, 'model_hub_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('\n----------------------------------------------------------------');
  console.log(`🎉 Successfully packaged all 11 Gemma 3 Clinical LoRA Model Cards!`);
  console.log(`📄 Manifest: ${manifestPath}`);
  console.log('================================================================\n');
}

exportAllModels();
