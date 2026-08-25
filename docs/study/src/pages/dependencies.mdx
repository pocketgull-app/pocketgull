---
layout: ../layouts/DocsLayout.astro
title: "Dependencies & Licenses"
description: "Third-party dependency management, licensing compliance, and software attributions for Pocket Gull."
---
import DocNode from '../components/DocNode.astro';

# Dependencies & Licenses

Pocket Gull is released under the **MIT License**. However, to deliver clinical-grade AI consults, real-time telemetry tracking, and interactive 3D visualizations, the application imports external libraries, some of which are licensed under the **Apache License 2.0**. 

This document details our engineering approach to dependency management—aligned with *Software Engineering at Google* paradigms—and acts as our canonical registry for third-party compliance.

---

## 1. Considerations When Importing

Before any external software is added to the Pocket Gull codebase, we evaluate it against three core dimensions:

### A. Compliance & Licensing
Because Apache 2.0-licensed software has stricter attribution rules than MIT, we must ensure we preserve copyright notices, log significant modifications, and include NOTICE files where applicable. The two licenses are permissive and compatible, meaning Apache 2.0 code can be bundled within our MIT-licensed software, provided attribution requirements are satisfied.

### B. Security & HIPAA Safeguards
Any package processing user inputs or AI outputs must be audited. We utilize:
- <DocNode term="DOMPurify" category="Cure53" hint="DOM-purify HTML sanitizer. Prevents Cross-Site Scripting (XSS) from malicious inputs or unstable LLM output fragments." link="https://github.com/cure53/DOMPurify" linkLabel="GitHub Repository →" icon="https://github.com/favicon.ico">DOMPurify</DocNode> to scrub raw HTML inputs and generated markdown strings prior to rendering.
- Ephemeral payload mapping for AI client connectors (<DocNode term="@google/genai" category="Google" hint="Official Google GenAI SDK. Ephemeral inference payloads, no retention for standard API keys." link="https://github.com/googleapis/google-genai" linkLabel="GitHub →" icon="https://ai.google.dev/favicon.ico">@google/genai</DocNode> and <DocNode term="@google/adk" category="Google" hint="Agent Development Kit. Coordinates agent communication and system instructions." link="https://google.github.io/adk-docs/" linkLabel="ADK Docs →" icon="https://ai.google.dev/favicon.ico">@google/adk</DocNode>), ensuring clinical data is processed transiently and not stored on third-party servers.

### C. Maintenance & Dependency Overhead
We evaluate the maintainability, package size, and deprecation rates of dependencies. We avoid dependencies with overly bloated trees to minimize vulnerability surfaces.

---

## 2. Managing Compatibility Promises

To protect the codebase from downstream breaking changes and security vulnerabilities, we enforce several engineering safeguards:

- **Automated Scanning**: Automated vulnerability trackers (such as Dependabot) are integrated into our CI/CD pipeline to flag vulnerable sub-packages.
- **Dependency Overrides**: When transient dependencies contain security flaws, we override their versions explicitly in `package.json` resolutions (e.g., locking versions of `esbuild`, `hono`, and `express-rate-limit`).
- **Strict Typing Contracts**: All external interactions are strongly typed. Missing types are supplemented with custom TypeScript declarations (`.d.ts`), preventing API drift from introducing silent runtime errors.

---

## 3. Canonical Registry & Attributions

To ensure legal compliance and absolute transparency, we maintain this registry of the primary dependencies that form the Pocket Gull multi-platform ecosystem.

---

### A. Core Web Application (Angular)

#### Apache License 2.0 Dependencies

| Dependency | Author | Purpose | Attribution / Link |
|---|---|---|---|
| <DocNode term="Genkit" category="Google" hint="Google's open-source framework for building, running, and debugging GenAI applications." link="https://firebase.google.com/docs/genkit" linkLabel="Genkit Docs →" icon="https://firebase.google.com/favicon.ico">`genkit`</DocNode> | Google LLC | Multimodal agent flows and model orchestration | Copyright 2024 Google LLC. [Firebase Genkit](https://firebase.google.com/docs/genkit) |
| <DocNode term="ADK" category="Google" hint="Google Agent Development Kit. Powers the Live Assist chat routing engine." link="https://google.github.io/adk-docs/" linkLabel="ADK Docs →" icon="https://ai.google.dev/favicon.ico">`@google/adk`</DocNode> | Google LLC | Live consult duplex audio streams | Copyright Google LLC. [ADK Docs](https://google.github.io/adk-docs/) |
| <DocNode term="@google/genai" category="Google" hint="Official Google GenAI SDK. Ephemeral inference payloads, no retention for standard API keys." link="https://github.com/googleapis/google-genai" linkLabel="GitHub →" icon="https://ai.google.dev/favicon.ico">`@google/genai`</DocNode> | Google LLC | Standard client-side/server-side Gemini model calls | Copyright Google LLC. [Google GenAI](https://github.com/googleapis/google-genai) |
| <DocNode term="OpenTelemetry" category="CNCF" hint="Open-source observability framework for cloud-native software. Collects metrics, traces, and logs." link="https://opentelemetry.io/docs/" linkLabel="opentelemetry.io →" icon="https://opentelemetry.io/favicon.ico">`@opentelemetry/api`</DocNode> | OpenTelemetry Authors | Diagnostic tracing and performance metrics | Copyright The OpenTelemetry Authors. [OpenTelemetry](https://opentelemetry.io/) |
| <DocNode term="AWS SDK" category="Amazon" hint="AWS SDK for JavaScript. Handles interactions with AWS HealthLake and Bedrock." link="https://aws.amazon.com/sdk-for-javascript/" linkLabel="AWS SDK →" icon="https://aws.amazon.com/favicon.ico">`@aws-sdk/client-healthlake`</DocNode> | Amazon.com, Inc. | Connecting with AWS FHIR health databases | Copyright Amazon.com, Inc. [AWS JS SDK](https://github.com/aws/aws-sdk-js-v3) |
| <DocNode term="DOMPurify" category="Cure53" hint="Fast, portable HTML sanitizer for HTML5, SVG and MathML. Written by Mario Heiderich." link="https://github.com/cure53/DOMPurify" linkLabel="GitHub →" icon="https://github.com/favicon.ico">`dompurify`</DocNode> | Mario Heiderich | HTML sanitization for dynamic rendering safety | Copyright 2015 Mario Heiderich. [Cure53 DOMPurify](https://github.com/cure53/DOMPurify) |
| <DocNode term="RxJS" category="ReactiveX" hint="Reactive Extensions Library for JavaScript. Uses Observables to coordinate asynchronous streams." link="https://rxjs.dev/" linkLabel="rxjs.dev →" icon="https://rxjs.dev/assets/images/favicons/favicon.ico">`rxjs`</DocNode> | Google LLC / Contributors | State streaming and pub-sub communications | Copyright Google LLC. [RxJS](https://rxjs.dev/) |

#### Key MIT-Licensed Dependencies
- **Angular Framework** (`@angular/core`, etc.) — Copyright (c) Google LLC. Main UI architecture.
- <DocNode term="Three.js" category="Ricardo Cabello" hint="WebGL 3D Library used to render the interactive anatomical pain selection model." link="https://threejs.org/" linkLabel="threejs.org →" icon="https://threejs.org/files/favicon.ico">**Three.js**</DocNode> (`three`) — Copyright (c) Ricardo Cabello (mrdoob). Interactive 3D pain models.
- **Express.js** (`express`) — Copyright (c) TJ Holowaychuk. Server and API proxy.
- **TailwindCSS** (`tailwindcss`) — Copyright (c) Tailwind Labs. Responsive layouts.
- **Chart.js** (`chart.js`) — Copyright (c) Chart.js Contributors. Telemetry and biometric charts.
- **Socket.io** (`socket.io`) — Copyright (c) Guillermo Rauch. Bidirectional real-time websocket connections.

---

### B. AI/ML & Clinical API Sidecar (Python & FastAPI)

#### Apache License 2.0 Dependencies

| Dependency | Author | Purpose | Attribution / Link |
|---|---|---|---|
| <DocNode term="python-multipart" category="Multipart" hint="Streaming multipart parser for Python FastAPI. Processes form-data uploads." link="https://github.com/andrew-d/python-multipart" linkLabel="GitHub →" icon="https://github.com/favicon.ico">`python-multipart`</DocNode> | Andrew Halberstadt | Multipart form-data parsing for document uploads | Copyright Andrew Halberstadt. [python-multipart](https://github.com/andrew-d/python-multipart) |

#### BSD-3-Clause & MIT-Licensed Dependencies
- <DocNode term="FastAPI" category="Tiangolo" hint="Modern, fast, high-performance web framework for building APIs with Python." link="https://fastapi.tiangolo.com/" linkLabel="FastAPI Docs →" icon="https://fastapi.tiangolo.com/img/favicon.png">**FastAPI**</DocNode> — MIT. Core high-performance sidecar web API.
- <DocNode term="Pydantic" category="Pydantic" hint="Data validation and settings management using Python type annotations." link="https://docs.pydantic.dev/" linkLabel="Pydantic Docs →" icon="https://docs.pydantic.dev/latest/assets/images/favicon.png">**Pydantic**</DocNode> — MIT. Strong typing validator.
- **Uvicorn** (`uvicorn[standard]`) — BSD-3-Clause. Copyright Encode. High-performance ASGI server.
- **NumPy** (`numpy`) — BSD-3-Clause. Copyright NumPy Developers. Scientific computing and matrix math.
- **Pandas** (`pandas`) — BSD-3-Clause. Copyright PyData Team. Telemetry dataframe processing.
- **FHIR Resources** (`fhir.resources`) — BSD-3-Clause. Copyright FHIR Resources Team. FHIR R4 schema models.
- **h5py** (`h5py`) — BSD-3-Clause. Copyright Andrew Collette. HDF5 biological archive reader.
- **SciPy** (`scipy`) — BSD-3-Clause. Copyright SciPy Developers. Signal processing algorithms.
- **Scikit-Learn** (`scikit-learn`) — BSD-3-Clause. Copyright Scikit-learn developers. ML risk scoring.
- **HTTPX** (`httpx`) — BSD-3-Clause. Copyright Encode. Async HTTP client for mock integration testing.

---

### C. Mobile Suite & Companion Apps (Flutter & Dart)

#### Apache License 2.0 Dependencies

| Dependency | Author | Purpose | Attribution / Link |
|---|---|---|---|
| <DocNode term="PDF" category="Kaelin" hint="PDF creation and layout library for Dart and Flutter." link="https://pub.dev/packages/pdf" linkLabel="pub.dev →" icon="https://dart.dev/assets/shared/logos/icon/logo-black-64.png">`pdf`</DocNode> | David Kaelin | Clinical summary PDF document generation | Copyright David Kaelin. [pdf on pub.dev](https://pub.dev/packages/pdf) |
| <DocNode term="Printing" category="Kaelin" hint="Flutter plugin to print documents or display layout previews." link="https://pub.dev/packages/printing" linkLabel="pub.dev →" icon="https://dart.dev/assets/shared/logos/icon/logo-black-64.png">`printing`</DocNode> | David Kaelin | OS-level printing and document preview interface | Copyright David Kaelin. [printing on pub.dev](https://pub.dev/packages/printing) |
| <DocNode term="MediaPipe GenAI" category="Google" hint="On-device generative AI task coordination library by Google MediaPipe." link="https://pub.dev/packages/mediapipe_genai" linkLabel="pub.dev →" icon="https://ai.google.dev/favicon.ico">`mediapipe_genai`</DocNode> | Google LLC | Local on-device Gemini Nano inference | Copyright Google LLC. [MediaPipe GenAI](https://pub.dev/packages/mediapipe_genai) |
| <DocNode term="Hive" category="Leier" hint="Lightweight and ultra-fast key-value database written in pure Dart." link="https://pub.dev/packages/hive" linkLabel="pub.dev →" icon="https://dart.dev/assets/shared/logos/icon/logo-black-64.png">`hive`</DocNode> | Simon Leier | Lightweight, local NoSQL storage | Copyright Simon Leier. [hive on pub.dev](https://pub.dev/packages/hive) |

#### BSD-3-Clause & MIT-Licensed Dependencies
- <DocNode term="Generative AI" category="Google" hint="Official Dart SDK for the Gemini API." link="https://pub.dev/packages/google_generative_ai" linkLabel="pub.dev →" icon="https://ai.google.dev/favicon.ico">**google_generative_ai**</DocNode> — BSD-3-Clause. Official Dart SDK for cloud Gemini.
- **Firebase Core & Messaging** (`firebase_core`, `firebase_messaging`) — BSD-3-Clause. Push notification channel.
- **Speech to Text** (`speech_to_text`) — BSD-3-Clause. Translates patient voice to text.
- **Flutter Text-to-Speech** (`flutter_tts`) — BSD-3-Clause. Synthesizes voice output for consults.
- **Flutter Bloc** (`flutter_bloc`, `bloc`) — MIT. Business Logic Component architecture.
- **Equatable** (`equatable`) — MIT. Value comparisons.
- **Shared Preferences** (`shared_preferences`) — BSD-3-Clause. Local settings state cache.
- **Flutter 3D Controller** (`flutter_3d_controller`) — MIT. 3D skeletal canvas engine.
- **DiTreDi** (`ditredi`) — MIT. 3D object rendering.
- **WebView Flutter** (`webview_flutter`, `webview_flutter_web`) — BSD-3-Clause. Embedded browser.
- **Path Provider** (`path_provider`) — BSD-3-Clause. File location mapping.
- **Flutter Markdown** (`flutter_markdown`) — BSD-3-Clause. Rich markdown rendering.
- **HTTP Client** (`http`) — BSD-3-Clause. HTTP client gateway.
- **URL Launcher** (`url_launcher`) — BSD-3-Clause. Deep linking.
- **Vector Math** (`vector_math`) — BSD-3-Clause. Matrix and vector mathematics.
- **Flutter SVG** (`flutter_svg`) — MIT. SVG rendering for companion dashboard assets.
- **Cupertino Icons** (`cupertino_icons`) — MIT. iOS visual graphics.

---

> **Apache License 2.0 Compliance Notice**: You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0). Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations.
