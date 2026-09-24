# System Architecture & Technical Specifications

**Pocket-Gull (Understory Clinical AI System)**  
*Clinical Decision Support, Edge Multimodal Inference & FHIR R4 Interoperability*

---

## 🏗️ 1. Architectural Overview

PocketGull is an open-source clinical intelligence ecosystem designed to bridge evidence-grounded Clinical Decision Support (CDS), multimodal real-time AI consultations, and standardized healthcare data exchange.

```
                             ┌──────────────────────────────────────────┐
                             │       CLINICAL CLIENT (PORTABLE)         │
                             │   Angular 22 Standalone + Signals        │
                             │   • Interactive 3D Anatomy (Three.js)    │
                             │   • Web Speech API (Bidirectional)       │
                             │   • Sensory Studio & Scotopic UI         │
                             └────────────┬─────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                           │
                    ▼                                           ▼
      ┌───────────────────────────┐               ┌───────────────────────────┐
      │   OFFLINE LOCAL EDGE AI   │               │    HYBRID BACKEND / SSR   │
      │  Chrome Prompt API (Nano) │               │  Node 24 + Express + SSR  │
      │  WebLLM / WebGPU / ONNX   │               │  WebSocket Streaming Proxy│
      │  Zero-Egress Processing   │               │  DOMPurify Sanitization   │
      └───────────────────────────┘               └─────────────┬─────────────┘
                                                                │
                                              ┌─────────────────┴─────────────────┐
                                              │                                   │
                                              ▼                                   ▼
                                ┌───────────────────────────┐       ┌───────────────────────────┐
                                │   PYTHON ML SIDECAR       │       │    UPSTREAM CLOUD AI      │
                                │  FastAPI (Port 8000)      │       │  Google Gemini 2.5 / Flash│
                                │  Asymmetric Loss Models   │       │  Genkit Multi-turn Chat   │
                                │  DICOM / FHIR Converters  │       │  Secret Manager KMS       │
                                └───────────────────────────┘       └───────────────────────────┘
```

---

## 🧩 2. Core Subsystems & Components

### 2.1 Frontend Client Layer (`src/app`)
* **Framework**: Angular 22 utilizing standalone components and native **Angular Signals** (`signal`, `computed`, `effect`) for fine-grained reactive state without overhead.
* **Patient State**: Centrally coordinated via `PatientStateService`, maintaining active biometrics, symptom graphs, active rooms, and clinical questionnaires.
* **3D Procedural Anatomy**: Three.js WebGL canvas rendering interactive skeletal and anatomical regions with custom shaders and biophysical PBR textures.
* **Accessibility & Sensory Dynamics**: WCAG AAA certified high-contrast scotopic obsidian theme (`#09090b`), optotypic typography (LogMAR 0.0 legibility), and 0.1 Hz parasympathetic vagal pacing visualizers.

### 2.2 Offline Edge AI Engine (`src/app/services/offline-edge-ai.service.ts`)
* **Local On-Device Inference**: Leverages Chrome Built-in AI Prompt API (`window.ai`), WebLLM, and ONNX Runtime Web for local summarization, triage acuity classification, and vector embeddings.
* **Zero Network Egress**: Sensitive clinical intake scribing can execute completely locally on the device without transmitting any data over the network.
* **Graceful Degradation**: Fallbacks to deterministic local TypeScript heuristics when experimental browser flags or hardware accelerators are unavailable.

### 2.3 Express / SSR Backend Layer (`src/server`)
* **Runtime**: Node.js v24 LTS with Angular Server-Side Rendering.
* **WebSocket Proxy**: Full-duplex bidirectional audio/text relay connecting client audio streams to upstream Google Gemini Live API via `@google/adk`.
* **Security & Egress Gateway**: Enforces strict Content Security Policy (CSP), subresource integrity, and request validation via `sentinel_security_guard`.

### 2.4 Machine Learning Sidecar (`pocketgull_api`)
* **Framework**: Python 3.11 / FastAPI microservice.
* **Inference Models**: Pre-trained PyTorch and ONNX models optimized with Asymmetric Loss (ASL) for sparse abnormality classification in medical imaging and clinical triage.
* **Data Contracts**: Strongly typed Pydantic v2 schemas validating request inputs and serialization invariants.

---

## 🔒 3. Trust Boundaries & Data Flow Invariants

| Invariant | Implementation Mechanism | Statutory / Standard Reference |
| :--- | :--- | :--- |
| **Zero PHI Persistence** | Ephemeral in-memory state; no identifiable data persisted to disk or external databases. | HIPAA §164.514 Safe Harbor |
| **Input Sanitization** | DOMPurify sanitization of all rendered HTML, notes, and SVG vectors. | OWASP LLM01 / XSS Prevention |
| **Data Interoperability** | Clinical exports formatted as standard HL7 FHIR R4 Bundles. | ONC HTI-1 / HL7 FHIR R4 |
| **Hardware Entropy** | CSPRNG kernel entropy via `crypto.getRandomValues()` (never `Math.random()`). | NIST SP 800-90A |
| **Deterministic Override** | STAT red-flag emergency vectors intercept execution prior to stochastic LLM generation. | FDA 21 CFR Part 11 CDS |

---

## 🌐 4. Deployment & Infrastructure Topology

* **Containerization**: Hermetic multi-stage Docker builds targeting Google Cloud Run in the `gen-lang-client-0540208645` project.
* **FinOps & Scaling**: All microservices configure `minScale: 0` to scale to zero when idle, eliminating baseline cloud compute costs.
* **Storage Lifecycle**: 7-day auto-deletion lifecycle policy on Artifact Registry images and Google Cloud Storage build buckets.
