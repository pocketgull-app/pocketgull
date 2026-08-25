# Pocket Gull Agentic Instructions

This document provides guidance for AI agents working on the Pocket Gull project.

## Technical Stack
- **Framework**: Angular v21.2 (Signals-based, Standalone Components, SSR)
- **Styling**: Tailwind CSS (Vanilla CSS where needed).
- **Architecture**: Service-oriented with `PatientStateService` as the source of truth.
- **Components**: Functional-style standalone components.
- **3D Viewer**: Three.js v0.183+ — use `THREE.Timer` (not deprecated `THREE.Clock`) for elapsed time tracking.
- **AI**: Gemini 2.5 Flash via `@google/adk`, `@google/genai`, and Genkit.

## Development Workflows
- Always verify UI changes using the `browser_subagent`.
- Use `afterNextRender` for DOM-dependent signal initializations.
- Follow the **Industrial Grace** design standard: premium, obsidian-and-slate palette, obsidian glass effects.
- **Minimalist Dieter Rams Design Mandate**: All UI updates must prioritize a premium, minimalist design with clarity, neutrality, and functional excellence.
- **Mobile Responsiveness**: Enforce seamless mobile responsive layouts using `100dvh` to ensure perfect fit on mobile devices (e.g., Pixel Watch, smartphones). Avoid hardcoded pixel heights where `100dvh` and CSS grid/flexbox provide better responsive scaling.

## Local Environment, Cluster, & Data Science workflows
- **No `.env.local` required in Angular root**: `fetchGeminiApiKey()` in `src/server.ts` automatically falls back to `pocketgull_api/.env` and `pocketgull_api/.env.local`. Add `GEMINI_API_KEY=<key>` to either file for local dev/preview.
- **Run locally**: `npm run dev` (dev server) or `npm run preview` (production build + SSR server on port 4200).
- **Run in local Kubernetes Cluster**: Use [Skaffold](file:///home/user/pocketgull/skaffold.yaml) and [Kubernetes manifests](file:///home/user/pocketgull/k8s) for local container orchestration:
  - `npm run kube:start` — Boot local Minikube cluster.
  - `npm run kube:dev` — Start Skaffold dev loop with file syncing, live rebuilding, and automatic port forwarding for frontend (:4000) and API (:8000).
  - `npm run kube:stop` — Stop local Minikube cluster.
- **Machine Learning & Data Science**: Guide for training and evaluating clinical models can be found in [ml-pipeline.md](file:///home/user/pocketgull/.agents/workflows/ml-pipeline.md):
  - Train model: `python3 pocketgull_api/train_contest_model.py`
  - Evaluate & log report: `python3 pocketgull_api/evaluate_model.py` (updates [model_evaluation_report.md](file:///home/user/pocketgull/pocketgull_api/reports/model_evaluation_report.md)).
  - Run python tests: `npm run test:python` (runs [test_dsp.py](file:///home/user/pocketgull/pocketgull_api/test_dsp.py) math validations).
- **Access via `localhost:4200`** (or `localhost:4000` on k8s), not `0.0.0.0` — browsers enforce COOP/COEP headers only on trusted origins (`localhost` qualifies; `0.0.0.0` does not).

## Layout System
The layout is managed in `AppComponent` with a multi-directional resizable grid:
- **Vertical Split**: Medical Chart vs. Analysis/Intake.
- **Horizontal Split**: Main Workspace vs. Medical Summary (Care Plan Engine).
- **Signals**: `inputPanelWidth` and `topSectionHeight`.

## Known Third-Party Restrictions
- **OHIF Viewer (`viewer.ohif.org`)**: Sets `X-Frame-Options: DENY` — cannot be embedded in an `<iframe>`. Use a launch card that opens it in a new tab with `StudyInstanceUIDs` deep-link.
- **DICOM API**: Requires `HC_DATASET` + `HC_DICOM_STORE` env vars. Returns 400 locally without them — expected behavior.

## MCP Tool Integration
MCP config lives at: **`~/.gemini/antigravity/mcp_config.json`**

For complex tasks, leverage the following MCP servers:
- **`chrome-devtools`**: Inspect DOM, console logs, network requests, and Core Web Vitals in a live Chrome instance. Essential for verifying UI renders correctly at runtime.
- **`firebase-mcp-server`**: For database queries, Firestore reads/writes, security rules validation, and Cloud Storage management.
- **`github-mcp-server`**: For PR reviews, issue tracking, branch management, and repository automation. Requires `GITHUB_PERSONAL_ACCESS_TOKEN` env var.
- **`google-maps-platform-code-assist`**: For all location-based logic, routing, and map rendering optimization.

> To add a new MCP server, add an entry to `~/.gemini/antigravity/mcp_config.json` and restart the AI client.

## Verification Patterns
Use the following checks when verifying work:
1. **Resizer Integrity**: Ensure dragging both column and row resizers is smooth and snapping works.
2. **State Sync**: Verify that selections in the 3D viewer correctly update `selectedPartId` and trigger relevant UI transitions.
3. **Responsive Flow**: Check how panels behave when collapsed or maximized.
4. **Build Cleanliness**: Run `npm run build` — zero errors expected, `sourceMap: false` in production suppresses Angular's `init.mjs.map` warnings.

## Node.js & Dependency Overrides
- **Node.js**: The project strictly uses **Node.js v24.x**. Ensure `.node-version`, `.nvmrc`, and root `package.json` engines are kept in sync.
- **esbuild version mismatch**: Due to npm workspace link boundaries ignoring nested overrides, we lock `esbuild` (and platform `@esbuild/*` packages) globally to `0.27.2` at the root overrides, except for `@angular/build` and `@angular-devkit/build-angular` which are overridden specifically to `0.28.1`.
- **Astro root promotion**: To ensure the global overrides are respected for the Astro `docs-study` workspace package, `astro` and `@astrojs/mdx` are installed as direct `devDependencies` in the root `package.json`.


