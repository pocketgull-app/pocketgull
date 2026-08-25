---
layout: ../layouts/DocsLayout.astro
title: Architecture
description: "System architecture, data flow, and technology stack for Pocket Gull."
---
import DocNode from '../components/DocNode.astro';

# Architecture

Pocket Gull leverages a modern, reactive architecture utilizing <DocNode term="Angular Signals" category="Google · Angular Team" hint="Reactive state primitives introduced in Angular v16+, replacing zone.js. Signals enable fine-grained reactivity via signal(), computed(), and effect()." link="https://angular.dev/guide/signals" linkLabel="angular.dev →" icon="https://angular.dev/favicon.ico">Angular Signals</DocNode>, <DocNode term="Google Cloud Run" category="Google Cloud" hint="Fully managed serverless container platform. Automatically scales from zero to thousands of instances. Created by Google Cloud." link="https://cloud.google.com/run/docs" linkLabel="cloud.google.com →" icon="https://www.gstatic.com/devrel-devsite/prod/v0e0f589edd85502a40d78d7d0825db8ea5ef3b99ab4070381571c97ab7df9861/cloud/images/favicons/onecloud/favicon.ico">Cloud Run</DocNode> orchestration, and the <DocNode term="Google GenAI SDK" category="Google DeepMind" hint="Client-side JavaScript SDK for accessing Gemini models. Supports streaming, function calling, and multimodal inputs." link="https://ai.google.dev/gemini-api/docs" linkLabel="ai.google.dev →" icon="https://ai.google.dev/favicon.ico">Google GenAI API</DocNode> stack.

---

## System Diagram

```mermaid
graph TB
    classDef doorway fill:#18181b,stroke:#a855f7,stroke-width:3px,color:#fafafa;
    classDef leftWing fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef rightWing fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#f8fafc;
    classDef cloudCeiling fill:#0f172a,stroke:#6366f1,stroke-width:2px,color:#f8fafc;
    classDef foundation fill:#0f172a,stroke:#f59e0b,stroke-width:2px,color:#f8fafc;

    %% TOP CEILING: CLOUD & BACKEND RUNTIME
    subgraph CloudCeiling ["⚡ CLOUD CEILING & BACKEND RUNTIME"]
        CloudRun["Google Cloud Run Serverless Service"]
        ExpressProxy["Express.js SSR & Single-Hop Proxy"]
        FastAPISidecar["Python FastAPI Sidecar (ML Risk Scoring)"]
        VertexAI["Vertex AI Enterprise (Gemini 2.5 Flash)"]
    end

    %% LEFT WING: INGESTION & USER PORTALS
    subgraph LeftWing ["📱 LEFT WING — INGESTION & PORTALS"]
        Body3D["Three.js 3D Body Surface & Skeleton Viewer"]
        VoiceSTT["Bi-Directional Voice Assistant & Web Speech API"]
        URLHandoff["Expanded URL State Handoff (?share=...&mode=...)"]
        IntakeForm["Demographics & Vitals Diagnostic Intake"]
    end

    %% CENTER CORE: THE DOORWAY HUB
    subgraph DoorwayHub ["🚪 THE DOORWAY HUB — CENTRAL STATE & AI ORCHESTRATION"]
        PatientState["PatientStateService Signal Store\n(Central Source of Truth)"]
        ADKRunner["@google/adk InMemoryRunner\n(Multi-Agent Orchestrator)"]
        WebMCPCatalog["WebMCP Polyfill & JSON-LD Tool Catalog"]
        CognitiveShield["Cognitive Localization & Shield Filter\n(Grade 4 / Grade 8 / Dyslexia)"]
    end

    %% RIGHT WING: MULTI-PARADIGM LENSES
    subgraph RightWing ["🩺 RIGHT WING — MULTI-PARADIGM LENSES"]
        WesternLens["Western Allopathic Lens\n(Summary, Workup & Monitoring)"]
        TCMLens["Eastern TCM Lens\n(Meridian, Tongue/Pulse & Qi)"]
        AyurvedicLens["Ayurvedic Lens\n(Vata, Pitta, Kapha & Agni)"]
        OrthoLens["Orthomolecular Lens\n(Biomarker & Precision Nutrients)"]
        YBOCsLens["Y-BOCs Diagnostic Screener"]
        CDCSentinel["CDC Sentinel Triage (Levels 1–5)"]
    end

    %% BOTTOM FOUNDATION: STANDARDS & ARCHIVING
    subgraph Foundation ["💾 FOUNDATION — STANDARDS & ARCHIVING"]
        FHIRBundles["FHIR R4 / R5 / R6 / FHIR 7 Bundles"]
        CERNZenodo["CERN Zenodo Open Science (CC0 1.0 + ORCID iD)"]
        IndexedDBCache["Encrypted Offline Browser Cache"]
        PubmedGrounding["NCBI PubMed & Evidence Grounding"]
    end

    %% CONNECTIONS RADIATING FROM & THROUGH THE DOORWAY HUB
    CloudRun --> ExpressProxy
    ExpressProxy <--> FastAPISidecar
    ExpressProxy <--> VertexAI

    Body3D -->|Spatio-Anatomical Signals| PatientState
    VoiceSTT -->|Audio Stream & Transcripts| ADKRunner
    URLHandoff -->|Base64 Payload Restore| PatientState
    IntakeForm -->|Vitals & Symptoms| PatientState

    ExpressProxy <-->|WebSocket & REST| DoorwayHub

    PatientState <--> ADKRunner
    ADKRunner <--> WebMCPCatalog
    PatientState <--> CognitiveShield

    DoorwayHub <--> WesternLens
    DoorwayHub <--> TCMLens
    DoorwayHub <--> AyurvedicLens
    DoorwayHub <--> OrthoLens
    DoorwayHub <--> YBOCsLens
    DoorwayHub <--> CDCSentinel

    PatientState --> FHIRBundles
    FHIRBundles --> CERNZenodo
    PatientState --> IndexedDBCache
    ADKRunner --> PubmedGrounding

    class PatientState,ADKRunner,WebMCPCatalog,CognitiveShield doorway;
    class Body3D,VoiceSTT,URLHandoff,IntakeForm leftWing;
    class WesternLens,TCMLens,AyurvedicLens,OrthoLens,YBOCsLens,CDCSentinel rightWing;
    class CloudRun,ExpressProxy,FastAPISidecar,VertexAI cloudCeiling;
    class FHIRBundles,CERNZenodo,IndexedDBCache,PubmedGrounding foundation;
```

---

## Data Flow

1. **Input** — Clinician enters data via body map interaction, intake forms, or voice dictation (<DocNode term="Web Speech API" category="W3C · Web Platform" hint="W3C standard browser API for speech recognition and synthesis. No external dependencies. Supported in Chrome, Edge, and Safari." link="https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API" linkLabel="MDN Reference →" icon="https://developer.mozilla.org/favicon-48x48.png">Web Speech API</DocNode>).
2. **State** — All inputs flow into the centralized `PatientState` service, which uses <DocNode term="Angular Signals" category="Google · Angular Team" hint="Fine-grained reactive primitives. signal() creates writable state, computed() derives values, effect() triggers side-effects. Powers all UI reactivity in Pocket Gull." link="https://angular.dev/guide/signals" linkLabel="angular.dev →" icon="https://angular.dev/favicon.ico">Angular Signals</DocNode> for granular reactivity.
3. **Analysis** — The Analysis component reads state and invokes the <DocNode term="ADK InMemoryRunner" category="Google · Agent Development Kit" hint="Google's open-source framework for building multi-agent AI systems. InMemoryRunner manages agent lifecycle, tool calls, and LLM orchestration in-process." link="https://google.github.io/adk-docs/" linkLabel="ADK Docs →" icon="https://ai.google.dev/favicon.ico">ADK `InMemoryRunner`</DocNode>, which orchestrates specialized <DocNode term="LlmAgent" category="Google · Agent Development Kit" hint="Core agent class from @google/adk. Configured with a model, system prompt, and optional tools. Each instance focuses on one diagnostic lens." link="https://google.github.io/adk-docs/agents/" linkLabel="Agent Reference →" icon="https://ai.google.dev/favicon.ico">`LlmAgent`</DocNode> experts.
4. **Generation** — Each agent streams requests through the Express `/ws/gemini-live` WebSocket proxy (for live audio) or HTTPS REST (for completions) to <DocNode term="Vertex AI Enterprise" category="Google Cloud" hint="Google Cloud's enterprise-grade AI platform. Provides regional endpoints, IAM-based authentication (ADC), custom safety thresholds, and SLA-backed infrastructure." link="https://cloud.google.com/vertex-ai" linkLabel="Vertex AI Docs →" icon="https://www.gstatic.com/devrel-devsite/prod/v0e0f589edd85502a40d78d7d0825db8ea5ef3b99ab4070381571c97ab7df9861/cloud/images/favicons/onecloud/favicon.ico">Vertex AI Enterprise</DocNode>, which hosts `gemini-2.5-flash` and streams structured JSON chunks back through the runner.
5. **Output** — Streamed chunks are rendered in real-time as a Care Plan organized by diagnostic lens.
6. **Persistence** — Patient state is saved to local session storage with visual "Saving…/Saved ✔" indicators.
7. **Export** — Data is exportable as <DocNode term="FHIR R4" category="HL7 International" hint="Fast Healthcare Interoperability Resources Release 4 — the current standard for electronic health data exchange. Defines resource types like Patient, Condition, and Observation." link="https://hl7.org/fhir/R4/" linkLabel="HL7 FHIR R4 →" icon="https://hl7.org/favicon.ico">FHIR R4 Bundles</DocNode> (Base64 JSON) or printable PDF stationery.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | <DocNode term="Angular v21.2" category="Google · Angular Team" hint="Component-based web framework by Google. v21.2 features Signals, Zoneless mode, and SSR with hydration." link="https://angular.dev" linkLabel="angular.dev →" icon="https://angular.dev/favicon.ico">Angular v21.2</DocNode> (Signals, Zoneless) + SSR | Ultra-reactive UI, minimal change-detection overhead |
| **Visualization** | <DocNode term="Three.js v0.183" category="Ricardo Cabello (mrdoob)" hint="JavaScript 3D library built on WebGL. Created by Ricardo Cabello (mrdoob). Used for procedural skeletal and surface anatomy with particle systems." link="https://threejs.org/docs/" linkLabel="threejs.org →" icon="https://threejs.org/favicon.ico">Three.js v0.183</DocNode> | Real-time 3D anatomical modeling |
| **Intelligence** | <DocNode term="Vertex AI Enterprise" category="Google Cloud" hint="Enterprise AI platform with regional endpoints, IAM/ADC authentication, and custom safety thresholds. Hosts gemini-2.5-flash for Pocket Gull." link="https://cloud.google.com/vertex-ai" linkLabel="Vertex AI Docs →" icon="https://www.gstatic.com/devrel-devsite/prod/v0e0f589edd85502a40d78d7d0825db8ea5ef3b99ab4070381571c97ab7df9861/cloud/images/favicons/onecloud/favicon.ico">Vertex AI Enterprise</DocNode> + <DocNode term="@google/adk" category="Google · Agent Development Kit" hint="Multi-agent orchestration framework. Supports LlmAgent, SequentialAgent, LoopAgent patterns with built-in tool management." link="https://google.github.io/adk-docs/" linkLabel="ADK Docs →" icon="https://ai.google.dev/favicon.ico">`@google/adk`</DocNode> | LLM inference (enterprise) + multi-agent orchestration |
| **Research** | <DocNode term="Google CSE" category="Google" hint="Google Programmable Search Engine — a customizable search engine for specific domains. Pocket Gull uses it for differential diagnostic info." link="https://programmablesearchengine.google.com/" linkLabel="CSE Console →" icon="https://www.google.com/favicon.ico">Google CSE</DocNode>, <DocNode term="PubMed E-utilities" category="NIH · NLM" hint="NCBI's programmatic interface to PubMed. Returns XML metadata for peer-reviewed biomedical literature. Created by the National Library of Medicine." link="https://www.ncbi.nlm.nih.gov/books/NBK25501/" linkLabel="E-utilities Docs →" icon="https://www.ncbi.nlm.nih.gov/favicon.ico">NIH PubMed E-utilities</DocNode> | Evidence-based clinical augmentation |
| **Export** | <DocNode term="jsPDF" category="James Hall · Parallax" hint="Client-side PDF generation library. Used for printable clinical stationery and cognition/child export modes." link="https://github.com/parallax/jsPDF" linkLabel="GitHub →" icon="https://github.com/favicon.ico">jsPDF</DocNode>, <DocNode term="FHIR Bundle" category="HL7 International" hint="A container resource that groups related FHIR resources for atomic transfer. Pocket Gull generates Bundle resources containing Patient, Condition, and Observation entries." link="https://hl7.org/fhir/R4/bundle.html" linkLabel="FHIR Bundle Spec →" icon="https://hl7.org/favicon.ico">FHIR Bundle standard</DocNode> | Clinically-compliant data portability |
| **Styling** | <DocNode term="Tailwind CSS" category="Tailwind Labs (Adam Wathan)" hint="Utility-first CSS framework by Adam Wathan and Tailwind Labs. Pocket Gull extends it with custom Dieter Rams design tokens." link="https://tailwindcss.com/docs" linkLabel="tailwindcss.com →" icon="https://tailwindcss.com/favicons/favicon.ico">Tailwind CSS</DocNode> + Dieter Rams design tokens | Consistent, performance-first UI |
| **Speech** | <DocNode term="Web Speech API" category="W3C · Web Platform" hint="Bi-directional speech recognition and synthesis standard. Chrome implementation by Google." link="https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API" linkLabel="MDN Reference →" icon="https://developer.mozilla.org/favicon-48x48.png">Web Speech API</DocNode> | Bi-directional voice interaction |
| **Hosting** | <DocNode term="Google Cloud Run" category="Google Cloud" hint="Serverless container platform with auto-scaling. Pocket Gull deploys as a Docker container serving Express.js + Angular SSR." link="https://cloud.google.com/run/docs" linkLabel="Cloud Run Docs →" icon="https://www.gstatic.com/devrel-devsite/prod/v0e0f589edd85502a40d78d7d0825db8ea5ef3b99ab4070381571c97ab7df9861/cloud/images/favicons/onecloud/favicon.ico">Cloud Run</DocNode> + <DocNode term="Express.js" category="OpenJS Foundation" hint="Minimal web framework for Node.js. Created by TJ Holowaychuk, now maintained by the OpenJS Foundation. Powers the SSR backend and API proxy." link="https://expressjs.com/" linkLabel="expressjs.com →" icon="https://expressjs.com/images/favicon.png">Express.js</DocNode> | Serverless, auto-scaling, zero-ops |

---

## Service Orchestration & Multi-Agent Parallelism

Pocket Gull coordinates complex clinical synthesis through a structured, multi-agent orchestration layer designed for low-latency feedback and clinical modularity:

### 1. Parallel Lens Generation
Rather than relying on a single, monolithic LLM request, the `ClinicalIntelligenceService` partitions the Care Plan into six independent clinical dimensions (lenses). These lenses are processed concurrently in the background using `Promise.allSettled()` orchestration:
* **Summary Overview** — Unified clinical assessment, urgency priority list, and measurable timeline goals.
* **Functional Protocols** — Biochemical pathway targets, precision molecule dosing matrices, and HPA axis/circadian guidelines.
* **Nutrition** — Micronutrient deficiency correction, cellular oxidative stress, and whole-food adjustments.
* **Orthomolecular Profiling** — Methylation blocks, heavy metal depletions, and structured JSON biomarker output mapping.
* **Monitoring & Follow-up** — Time-horizon next steps, tracking parameters, and threshold escalation triggers.
* **Patient Education** — Empathetic, de-identified plain-language translations of all recommended strategies.

### 2. Avian Agent Personas
Each clinical lens is orchestrated by a dedicated specialist agent from the *Gull Squadron* with customized prompt boundaries:
* `Gulliver` (Summary Overview) — Synthesis and big-picture overview lead.
* `Swoop` (Functional Protocols, Nutrition, Orthomolecular Profiling) — Precision pathway and dosing specialist.
* `Sentinel` (Monitoring & Follow-up) — Care coordination and vigilance monitor.
* `Scribes` (Patient Education) — Patient-facing plain language translation specialist.

### 3. Dynamic Prompt Compounding
The system compiles system instructions dynamically at runtime by stitching together several layers:
1. **Agent Identity** — Persona role, voice, and diagnostic boundaries.
2. **Clinical Paradigm** — Standard Western guidelines, Eastern (Zang-Fu, 8 Principles, acupoints, pulse), or Ayurvedic (Dosha constitutions, Agni/Ama metabolism, Dhatu tissue mapping) paradigms.
3. **ORCID Research Integration** — Dynamically appends the clinician's publications and research keywords to align AI insights with the practitioner's scholarly background.
4. **Formatting Constraints** — Strict Markdown layouts, citation parameters, and HIPAA de-identification masks.

### 4. Real-time Reactive Streaming
Each parallel agent execution maps directly to a chunked generator stream (`generateReportStream$`). Chunks are consumed as they arrive from Vertex AI and immediately update the respective Angular Signals. This drives fine-grained UI updates card-by-card in real-time, keeping the interface responsive and alive.

---

## Key Infrastructure Files

| File | Responsibility |
|---|---|
| `server.js` | Express.js backend — SSR, PubMed proxy, CSE static serve, WebSocket live proxy, rate limiting |
| `src/services/clinical-intelligence.service.ts` | ADK runner configuration, agent orchestration |
| `src/services/ai/gemini.provider.ts` | Vertex AI Enterprise provider — ADC token resolution, regional endpoints |
| `src/services/ai/adk-live.service.ts` | Bidirectional live audio streaming via `/ws/gemini-live` proxy |
| `src/services/patient-state.service.ts` | Centralized Signals-based state management |
| `src/app.component.ts` | Root layout, MCP tool registration, panel management |
| `scripts/deploy.sh` | Automated Cloud Run deployment script |
| `Dockerfile` | Container build configuration |

---

## 📜 Architecture Evolution Timeline

- **v1.2.0 (2026-07-22)**: 10 Standardized Clinical & Life Sovereignty Assessment Suite (`ClinicalAssessmentsSuiteComponent`), Dynamic 3D Paradigm Viewport Synchronization (`body-viewer.component.ts` & `body-3d-viewer.component.ts`), and Rice Papercraft design system.
- **v1.1.0 (2026-07-21)**: AIGA 2025/2026 Model Augmentation & Telemetry Lens (`aiga-telemetry-lens.component.ts`), Physiological Storm De-escalation Shield (`storm-analysis.component.ts`), and WHO ICD-11 Cross-Border Emergency Health Passport (`cross-border-health-wallet.service.ts`).
- **v1.0.0-rc10 (2026-07-21)**: PhysioNet 2026 Waveform Lens (`clinical-intelligence.service.ts`) & 7-second papercraft origami splash animation (`secure-splash.component.ts`).
- **v0.6.0 (2026-05-17)**: Three.js r183 `THREE.Timer` migration & monorepo `.env.local` fallback resolution.
- **v0.5.0 (2026-03-16)**: Initial Cloud Run serverless deployment, Express.js SSR, and custom domain mapping (`pocketgull.app`).
