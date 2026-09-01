# Dependency Management & License Compliance

Pocket Gull (Understory) is an MIT-licensed real-time medical Care Plan Strategy and Live AI Consult engine. To deliver robust clinical intelligence, 3D visualizations, and secure AI consults, the application relies on external dependencies. 

This document outlines our approach to dependency management, guided by the principles in *Software Engineering at Google*, and establishes the canonical registry of third-party software—specifically addressing the compliance requirements of combining Apache 2.0-licensed dependencies within our MIT-licensed project.

---

## 1. Considerations When Importing

Before adding any third-party dependency to the Pocket Gull ecosystem, we evaluate the software against three critical criteria:

1. **Safety & HIPAA Compatibility**:
   - Does the dependency process clinical data or Protected Health Information (PHI)?
   - If yes, does it support local processing, or are payloads encrypted and transient? For example, `@google/adk` and `@google/genai` are utilized strictly for transient inference with no remote persistence of patient state.
   - We use `dompurify` (Apache 2.0) to sanitize all clinical inputs and LLM outputs, preventing cross-site scripting (XSS) in clinical dashboards.

2. **Maintenance Footprint**:
   - What is the active maintenance status of the library?
   - What is the dependency graph size? We actively avoid deep, nested dependency trees that increase our security attack surface.
   - Are the APIs stable, or will they require frequent refactoring?

3. **Licensing Compliance**:
   - Are the licenses compatible with Pocket Gull’s MIT license?
   - Both MIT and Apache 2.0 are permissive and compatible. However, Apache 2.0 carries specific conditions regarding copyright preservation, state-change tracking, and the inclusion of NOTICE files.

---

## 2. Managing Compatibility Promises

Every dependency introduced represents a contract and a potential point of failure. We manage compatibility, security updates, and breaking changes defensively:

- **Automated Dependency Auditing**: We utilize Dependabot and automated security alerts to continuously monitor for vulnerability disclosures in our dependency tree.
- **Vulnerability Overrides**: Where transient dependencies introduce vulnerabilities, we enforce resolutions using the `overrides` field in `package.json` (e.g., locking sub-dependencies like `esbuild`, `hono`, and `express-rate-limit` to patched versions).
- **Type Safety**: All third-party integrations are strictly typed. We write custom type declarations or overrides if public `@types` are missing, ensuring typescript-level contract validation at compile time.
- **Local Testing**: We run integration suites to verify that dependency updates do not break core layout layouts, state management, or generative AI stream handling.

---

## 3. Canonical Sources of Information (Licensing & Attribution)

To comply with the requirements of the Apache License 2.0 (specifically Section 4 regarding redistribution and attribution) within our MIT-licensed codebase, we maintain this canonical register organized by sub-project.

---

### A. Core Web Application (Angular & Node.js SSR)

#### Apache License 2.0 Dependencies
The following dependencies used in the Core Web App are licensed under the Apache License 2.0:

* **Google Genkit & Plugins** (`genkit`, `@genkit-ai/googleai`) — Copyright 2024 Google LLC. Orchestrates AI agents.
* **Google ADK & GenAI Client** (`@google/adk`, `@google/genai`, `google-auth-library`, `@google-cloud/bigquery`, `@google-cloud/secret-manager`) — Copyright Google LLC. Connects to Gemini Live multimodal audio and Google Cloud services.
* **OpenTelemetry APIs & SDKs** (`@opentelemetry/api`, `@opentelemetry/sdk-node`, etc.) — Copyright The OpenTelemetry Authors. Diagnostic tracing and performance metrics.
* **AWS SDK for JavaScript** (`@aws-sdk/client-healthlake`, `@aws-sdk/client-bedrock-runtime`, etc.) — Copyright Amazon.com, Inc. or its affiliates. Connects to AWS HealthLake.
* **DOMPurify** (`dompurify`) — Copyright 2015 Mario Heiderich (Cure53). HTML sanitization for dynamic views.
* **RxJS** (`rxjs`) — Copyright (c) 2015-2018 Google, Inc., Netflix, Inc., and contributors. Reactive stream primitives.

#### Key MIT-Licensed Dependencies
* **Angular Framework** (`@angular/core`, `@angular/common`, etc.) — Copyright (c) 2010-2026 Google LLC.
* **Three.js** (`three`) — Copyright (c) 2010-2026 Three.js Authors. WebGL 3D anatomical viewer.
* **Express.js** (`express`) — Copyright (c) 2009-2014 TJ Holowaychuk, OpenJS Foundation. Server and secure proxy.
* **TailwindCSS** (`tailwindcss`) — Copyright (c) Tailwind Labs, Inc.
* **Chart.js** (`chart.js`) — Copyright (c) 2018 Chart.js Contributors. Telemetry and biomatrix comparison.
* **Socket.io** (`socket.io`) — Copyright (c) 2014-2026 Guillermo Rauch. Real-time WebSocket connection.

---

### B. AI/ML & Clinical API Sidecar (FastAPI & Python)

#### Apache License 2.0 Dependencies
The following dependencies used in the API Sidecar are licensed under the Apache License 2.0:

* **python-multipart** (`python-multipart`) — Copyright Andrew Halberstadt. Multipart form-data parsing for document uploads.

#### BSD-3-Clause & MIT-Licensed Dependencies
* **FastAPI** (`fastapi`) — MIT License. Copyright (c) 2018 Sebastián Ramírez. Core high-performance web API framework.
* **Pydantic** (`pydantic`) — MIT License. Copyright (c) 2017 Samuel Colvin. Data validation and settings management.
* **Uvicorn** (`uvicorn[standard]`) — BSD-3-Clause License. Copyright (c) 2017-present, Encode. High-performance ASGI server.
* **NumPy** (`numpy`) — BSD-3-Clause License. Copyright (c) 2005-2023, NumPy Developers. Scientific computing and matrix math.
* **Pandas** (`pandas`) — BSD-3-Clause License. Copyright (c) 2008-2011 AQR Capital Management, LLC, Lambda Foundry, Inc. and PyData Development Team. Data manipulation.
* **FHIR Resources** (`fhir.resources`) — BSD-3-Clause License. Copyright (c) 2019-present FHIR Resources Team. FHIR R4 schema models.
* **h5py** (`h5py`) — BSD-3-Clause License. Copyright (c) 2008-2023 Andrew Collette and contributors. HDF5 file format interface.
* **SciPy** (`scipy`) — BSD-3-Clause License. Copyright (c) 2001-2002 Enthought, Inc. and contributors. Signal processing.
* **Scikit-Learn** (`scikit-learn`) — BSD-3-Clause License. Copyright (c) 2007-2023, Scikit-learn developers. ML risk scoring.
* **HTTPX** (`httpx`) — BSD-3-Clause License. Copyright (c) 2019-present Encode. Async HTTP testing client.

---

### C. Mobile Suite & Companion Apps (Flutter & Dart)

These dependencies cover the primary Flutter application (on the `flutter` branch) and the companion patient and provider apps.

#### Apache License 2.0 Dependencies
* **PDF Engine** (`pdf`) — Copyright David Kaelin. Generates PDF documents.
* **Printing Integration** (`printing`) — Copyright David Kaelin. Handles OS-level printing and document previewing.
* **MediaPipe GenAI** (`mediapipe_genai`) — Copyright Google LLC. Coordinates local, on-device Gemini inference.
* **Hive NoSQL Storage** (`hive`, `hive_flutter`) — Copyright Simon Leier. Lightweight, ultra-fast key-value database.

#### BSD-3-Clause & MIT-Licensed Dependencies
* **Google Generative AI** (`google_generative_ai`) — BSD-3-Clause License. Copyright Google LLC. Official Dart SDK for Gemini.
* **Firebase SDK** (`firebase_core`, `firebase_messaging`) — BSD-3-Clause License. Copyright Google LLC. Notification push channels.
* **Speech to Text** (`speech_to_text`) — BSD-3-Clause License. Copyright Sven Ruopp. Translates patient voice to text.
* **Flutter Text-to-Speech** (`flutter_tts`) — BSD-3-Clause License. Copyright Tarik Belkahla. Synthesizes voice output for consults.
* **Flutter Bloc & BLoC** (`flutter_bloc`, `bloc`) — MIT License. Copyright Felix Angelov. Business Logic Component architecture.
* **Equatable** (`equatable`) — MIT License. Copyright Felix Angelov. Simplifies object value comparisons.
* **Shared Preferences** (`shared_preferences`) — BSD-3-Clause License. Copyright Flutter Team. Local settings state cache.
* **Flutter 3D Controller** (`flutter_3d_controller`) — MIT License. Copyright Eisa M. A. 3D canvas engine.
* **DiTreDi** (`ditredi`) — MIT License. Copyright J. R. 3D object visualizer.
* **WebView Flutter** (`webview_flutter`, `webview_flutter_web`) — BSD-3-Clause License. Copyright Flutter Team. Embedded browser frame.
* **Path Provider** (`path_provider`) — BSD-3-Clause License. Copyright Flutter Team. Location references for temporary files.
* **Flutter Markdown** (`flutter_markdown`) — BSD-3-Clause License. Copyright Flutter Team. Rich markdown text rendering.
* **HTTP Client** (`http`) — BSD-3-Clause License. Copyright Dart Team. Rest communication gateway.
* **URL Launcher** (`url_launcher`) — BSD-3-Clause License. Copyright Flutter Team. Safe external deep linking.
* **Vector Math** (`vector_math`) — BSD-3-Clause License. Copyright Dart / Vector Math contributors. Matrix math operations.
* **Flutter SVG** (`flutter_svg`) — MIT License. Copyright Dan Field. High-performance SVG asset loader (used in Patient Companion).
* **Cupertino Icons** (`cupertino_icons`) — MIT License. Copyright Flutter Team. iOS style graphics.

---

### Apache License 2.0 Terms & Conditions
For reference, redistributions of the above dependencies must adhere to the Apache License 2.0 terms. You may obtain a copy of the License at:
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
