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
                             │   • Direct WebGL2/WebGPU Engine          │
                             │   • Web Speech API (Bidirectional)       │
                             │   • Sensory Studio & Scotopic UI         │
                             └────────────┬─────────────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
      ┌───────────────────────────┐ ┌───────────┐ ┌───────────────────────────┐
      │   OFFLINE LOCAL EDGE AI   │ │  MOBILE & │ │    HYBRID BACKEND / SSR   │
      │  pocketgull-clinical:v1.41│ │  DESKTOP  │ │  Node 24 + Express + SSR  │
      │  Ollama / Apple Metal UMA │ │  COMPANION│ │  WebSocket Streaming Proxy│
      │  WebLLM / DirectML / Nano │ │  Apple/And│ │  DOMPurify Sanitization   │
      │  Zero-Egress Sovereign    │ │  Tauri HUD│ └─────────────┬─────────────┘
      └───────────────────────────┘ └───────────┘               │
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
* **3D Procedural Anatomy (GullRenderEngine)**: Zero-dependency direct WebGL2 / WebGPU engine (`src/rendering/gull-render.engine.ts`, `src/engine/core/webgl2-backend.ts`) replacing Three.js. Delivers $O(1)$ offscreen color picking, zero garbage-collection allocations in `requestAnimationFrame`, and sub-10KB runtime weight.
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

### 2.5 Sovereign Model Fleet & Local Silicon Engine (`pocketgull-clinical:v1.41.0`)
* **Local Quantized Models**: Custom-fine-tuned GGUF/Ollama models (`pocketgull-clinical:v1.41.0` 7B Q4_K_M and `pocketgull-edge:v1.41.0` 2B Q4_K_M) running zero-egress clinical reasoning.
* **Universal Hardware Acceleration**:
  * **Apple Silicon**: Apple Metal Unified Memory Architecture (UMA) on M1–M4 Macs.
  * **NVIDIA**: CUDA tensor core offload.
  * **AMD**: DirectML / ROCm compute backends.
  * **Mobile / Browser**: WebGPU WGSL compute and Chrome Built-in AI Prompt API (`window.ai`).
* **Sovereignty Invariant**: Complete air-gapped clinical intelligence with automatic HIPAA §164.514 Safe Harbor de-identification prior to any optional cloud fallback.

### 2.6 Multi-Platform Companion Ecosystem (Apple iOS, iPadOS, macOS, Android & Wearables)
* **Apple iOS & iPadOS Companion (`companion-apps/patient_app`)**:
  * **App Store Listing**: *PocketGull AVS: Health Vitals* (Subtitle: *Vagal Pacer & Clinical Plan*).
  * **Apple HealthKit Integration**: Native bidirectional sync (`NSHealthShareUsageDescription`, `NSHealthUpdateUsageDescription`) reading resting heart rate, RMSSD heart rate variability (HRV), $\text{SpO}_2$, and step counts. Logs completed vagal pacing sessions and movement quests back to Apple Health.
  * **60-Second Clinician Handoff Brief**: Generates optotypically clean summaries with NIST SP 800-90A CSPRNG SHA-256 cryptographic verification seals.
* **Apple macOS Workstation HUD (`src-tauri` / Universal `.dmg`)**:
  * **Framework**: Tauri v2 + Rust Core, Universal `.dmg` supporting Apple Silicon (M1–M4) and Intel x86_64 (~8 MB RAM footprint).
  * **macOS Menu Bar Telemetry**: Live biometric badges (HRV, SIBI, Glucose) rendered silently in the macOS status bar.
  * **Global EHR Dictation Hotkey**: Ambient EHR dictation hotkey (`Option + Space` on Mac, `Win + Alt + P` on Windows) streaming formatted SOAP notes directly into Epic Hyperspace or Cerner PowerChart.
  * **Hardware Acceleration**: Local 4-bit Gemma inference executed natively via Apple Metal and the Apple Neural Engine (NPU).
* **Provider Field Kit (`companion-apps/provider_app`)**:
  * **Cross-Platform**: Flutter app for iOS, iPadOS, Android, and macOS.
  * **Offline Triage & Dispensary**: Offline WHO Essential Medicines List (EML) Backpack Dispensary, Multilingual Medical Passport, and offline emergency triage acuity scoring.
* **Wear OS Smartwatch Pacer (`companion-apps/avs_wear_app`)**:
  * **Vagal Reset**: Haptic 0.10 Hz Mayer-wave resonant breathing pacer, Continuous Electrodermal Activity (CEDA) monitoring, and BLE synchronization.
* **Audiovisual Stimulation PWA (`companion-apps/avs-therapy`)**:
  * **Responsive Entrainment**: Low-latency Audio-Visual Stimulation (AVS) brainwave entrainment (40 Hz Gamma, 18 Hz Beta, 14 Hz SMR) accessible from any browser or home screen.

### 2.7 Direct WebGL2 & WebGPU Engine (`GullRenderEngine`)
* **Complete Three.js Removal**: Three.js was completely purged from the codebase (`src/rendering/gull-render.engine.ts`, `src/engine/core/webgl2-backend.ts`, `src/rendering/direct-cardiac.renderer.ts`) to eliminate ~650 KB of bundle overhead.
* **Zero-Allocation Rendering Loop**: Custom GLSL 3.0 ES and WebGPU shaders run inside `requestAnimationFrame` with zero heap allocations, eliminating GC frame stutter.
* **O(1) Offscreen Picking**: GPU-accelerated offscreen color framebuffers enable instantaneous anatomical hotspot identification and touch targeting without CPU raycasting.

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
