# Pocket Gull Agentic Instructions

This document provides guidance for AI agents working on the Pocket Gull project.

## Technical Stack
- **Framework**: Angular 22 (Signals-based, Standalone Components, SSR)
- **Styling**: Tailwind CSS (Vanilla CSS where needed).
- **Architecture**: Service-oriented with `PatientStateService` as the central reactive source of truth.
- **Components**: Functional-style standalone components.
- **3D Viewer**: Three.js v0.183+ — use `THREE.Timer` (not deprecated `THREE.Clock`) for elapsed time tracking.
- **AI Integration**: Gemini 2.5 Flash via `@google/adk`, `@google/genai`, and Genkit.
- **Python Sidecar**: FastAPI (`pocketgull_api`) for ML scoring, DSP analysis, and local inference.
- **Mobile Suite**: Flutter / Riverpod (`pocketgull_flutter`).

## Workspace Permissions & Resources
- **Execution Boundaries**:
  - Node.js / TypeScript commands must execute within `c:\Users\philg\Pocketgull\pocketgull`.
  - Python scripts must execute within `pocketgull_api` or use workspace virtual environments.
- **Scoping & Customizations**:
  - Workspace plugins are scoped via `.agents/plugins.json`.
  - Workspace skills are scoped via `.agents/skills.json` (19 core domain skills).
- **Active MCP Tool Integration**:
  - **`pocketgull_pubmed`**: Biomedical & clinical trial search bridge (`pocketgull_api/mcp_servers/pubmed_search.py`).
  - **`pocketgull_local_ehr`**: FHIR R4 clinical state & local EHR bridge (`pocketgull_api/mcp_servers/local_ehr_bridge.py`).
  - **`chrome-devtools`**: Live DOM inspection, accessibility verification, and WebMCP tool testing.
  - **`firebase-mcp-server`**: Cloud Firestore and Cloud Storage verification.
  - **`github-mcp-server`**: PR review and CI/CD workflow audit.
  - **`google-maps-platform`**: Location-based triage and geographic health resource mapping.

## Development Workflows
- Always verify UI changes using the `browser_subagent` or `webmcp-tester`.
- Use `afterNextRender` for DOM-dependent signal initializations.
- Follow the **Industrial Grace** design standard: premium, obsidian-and-slate palette, obsidian glass effects.
- **Minimalist Dieter Rams Design Mandate**: All UI updates must prioritize a premium, minimalist design with clarity, neutrality, and functional excellence.
- **Mobile Responsiveness**: Enforce seamless mobile responsive layouts using `100dvh` to ensure perfect fit on mobile devices (e.g., Pixel Watch, smartphones). Avoid hardcoded pixel heights where `100dvh` and CSS grid/flexbox provide better responsive scaling.

## Local Environment, Cluster, & Data Science workflows
- **No `.env.local` required in Angular root**: `fetchGeminiApiKey()` in `src/server.ts` automatically falls back to `pocketgull_api/.env` and `pocketgull_api/.env.local`. Add `GEMINI_API_KEY=<key>` to either file for local dev/preview.
- **Run locally**: `npm run dev` (dev server) or `npm run preview` (production build + SSR server on port 4200).
- **Run in local Kubernetes Cluster**: Use [Skaffold](file:///c:/Users/philg/Pocketgull/pocketgull/skaffold.yaml) and [Kubernetes manifests](file:///c:/Users/philg/Pocketgull/pocketgull/k8s) for local container orchestration:
  - `npm run kube:start` — Boot local Minikube cluster.
  - `npm run kube:dev` — Start Skaffold dev loop with file syncing, live rebuilding, and automatic port forwarding for frontend (:4000) and API (:8000).
  - `npm run kube:stop` — Stop local Minikube cluster.
- **Machine Learning & Data Science**: Guide for training and evaluating clinical models can be found in [ml-pipeline.md](file:///c:/Users/philg/Pocketgull/pocketgull/.agents/workflows/ml-pipeline.md):
  - Train model: `python pocketgull_api/train_contest_model.py`
  - Evaluate & log report: `python pocketgull_api/evaluate_model.py`
  - Run python tests: `npm run test:python` (runs math validations).
- **Access via `localhost:4200`** (or `localhost:4000` on k8s), not `0.0.0.0` — browsers enforce COOP/COEP headers only on trusted origins (`localhost` qualifies; `0.0.0.0` does not).

## Layout System
The layout is managed in `AppComponent` with a multi-directional resizable grid:
- **Vertical Split**: Medical Chart vs. Analysis/Intake.
- **Horizontal Split**: Main Workspace vs. Medical Summary (Care Plan Engine).
- **Signals**: `inputPanelWidth` and `topSectionHeight`.

## Verification Patterns
Use the following checks when verifying work:
1. **TypeScript Typecheck**: `node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit`
2. **Angular Production Build**: `node node_modules/@angular/cli/bin/ng.js build`
3. **Unit Test Suite**: `node node_modules/vitest/vitest.mjs run --config vitest.config.ts`
4. **State Sync**: Verify that selections in the 3D viewer correctly update `selectedPartId` and trigger relevant UI transitions.

## Node.js & Dependency Overrides
- **Node.js**: The project strictly uses **Node.js v24.x**. Ensure `.node-version`, `.nvmrc`, and root `package.json` engines are kept in sync.
- **esbuild version mismatch**: Due to npm workspace link boundaries ignoring nested overrides, we lock `esbuild` (and platform `@esbuild/*` packages) globally to `0.27.2` at the root overrides, except for `@angular/build` and `@angular-devkit/build-angular` which are overridden specifically to `0.28.1`.
- **Astro root promotion**: To ensure the global overrides are respected for the Astro `docs-study` workspace package, `astro` and `@astrojs/mdx` are installed as direct `devDependencies` in the root `package.json`.
