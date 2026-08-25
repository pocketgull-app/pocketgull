# Reference: Environment Variables & CLI Configuration

**Type**: Diátaxis Reference (Information-Oriented)
**Scope**: All environment variables consumed by the PocketGull runtime, build, and deployment systems

---

## Quick Start

```bash
# Minimum viable local dev (uses Gemini AI Studio key)
export GEMINI_API_KEY="<YOUR_GEMINI_API_KEY>"
npm run dev
```

---

## Environment Variables

### Secrets & API Keys

| Variable | Required | Default | Description | Files |
|---|---|---|---|---|
| `GEMINI_API_KEY` | **Yes** | `fake-key` (mock mode) | Google Gemini API key from AI Studio or Vertex AI. Powers all AI care plan generation, voice consult, and clinical intelligence flows. | `server.ts`, `genkit.ts`, `main.server.ts`, `veo.service.ts`, `verify-ai.service.ts` |
| `GOOGLE_GENAI_API_KEY` | No | -- | Alternative Gemini key consumed by Genkit flows. Falls back to `GEMINI_API_KEY` if unset. | `genkit.ts` |
| `AWS_ACCESS_KEY_ID` | No | -- | AWS IAM access key for HealthLake FHIR integration. Only required for AWS cross-cloud connectivity. | `aws.ts` |
| `AWS_SECRET_ACCESS_KEY` | No | -- | AWS IAM secret key (pair with `AWS_ACCESS_KEY_ID`). | `aws.ts` |
| `SWAGGER_USERNAME` | No | -- | HTTP Basic Auth username for the `/api-docs` Swagger UI endpoint. | `server.ts` |
| `SWAGGER_PASSWORD` | No | -- | HTTP Basic Auth password for the `/api-docs` Swagger UI endpoint. | `server.ts` |

### Google Cloud Platform (GCP)

| Variable | Required | Default | Description | Files |
|---|---|---|---|---|
| `GOOGLE_CLOUD_PROJECT` | Prod | -- | GCP project ID (must be `gen-lang-client-0540208645` for production). Used for Healthcare API, DICOM, and telemetry. | `server.ts`, `healthcare.ts`, `dicom.ts` |
| `GCLOUD_PROJECT` | No | -- | Legacy alias for `GOOGLE_CLOUD_PROJECT`. Checked as fallback. | `server.ts`, `healthcare.ts`, `dicom.ts` |
| `GOOGLE_CLOUD_REGION` | No | -- | GCP region for Vertex AI endpoints (e.g., `us-central1`). | `server.ts` |
| `GCLOUD_REGION` | No | -- | Legacy alias for `GOOGLE_CLOUD_REGION`. | `server.ts` |
| `GOOGLE_HEALTH_CLIENT_ID` | No | -- | OAuth2 client ID for Google Health / Fitbit API integration. | `fitbit.ts` |
| `GOOGLE_HEALTH_CLIENT_SECRET` | No | -- | OAuth2 client secret for Google Health / Fitbit API integration. | `fitbit.ts` |
| `GOOGLE_HEALTH_REDIRECT_URI` | No | -- | OAuth2 redirect URI for Google Health callback. | `fitbit.ts` |

### Healthcare API (Cloud Healthcare FHIR/DICOM)

| Variable | Required | Default | Description | Files |
|---|---|---|---|---|
| `HC_DATASET` | No | -- | Cloud Healthcare API dataset name. | `healthcare.ts`, `dicom.ts` |
| `HC_LOCATION` | No | -- | Cloud Healthcare API dataset location (e.g., `us-central1`). | `healthcare.ts`, `dicom.ts` |
| `HC_FHIR_STORE` | No | -- | FHIR store name within the dataset. | `healthcare.ts` |
| `HC_DICOM_STORE` | No | -- | DICOM store name within the dataset. | `healthcare.ts`, `dicom.ts` |
| `SKIP_HEALTHCARE_PROVISION` | No | -- | Set to any value to skip automatic Healthcare API provisioning on startup. | `healthcare.ts` |

### AWS Cross-Cloud

| Variable | Required | Default | Description | Files |
|---|---|---|---|---|
| `AWS_REGION` | No | -- | AWS region for HealthLake (e.g., `us-east-1`). | `aws.ts` |
| `AWS_HEALTHLAKE_ENDPOINT` | No | -- | AWS HealthLake FHIR endpoint URL. | `aws.ts` |
| `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` | No | -- | ECS task role credential URI (auto-populated in AWS environments). | `aws.ts` |

### Network & Ports

| Variable | Required | Default | Description | Files |
|---|---|---|---|---|
| `PORT` | No | `4000` | HTTP server listen port. Auto-set by Cloud Run. | `server.ts`, `Dockerfile` |
| `PYTHON_API_URL` | No | -- | URL of the Python FastAPI sidecar (`pocketgull_api`). | `server.ts` |
| `POCKETGULL_API_URL` | No | -- | Base URL for the PocketGull backend API (used by healthcare proxy). | `healthcare.ts` |
| `AGONES_SDK_GRPC_PORT` | No | -- | gRPC port for Agones game server SDK (research/experimental). | `server.ts` |
| `BASE_URL` | No | -- | Base URL for Playwright E2E tests. | `playwright.config.ts`, `e2e/utils/setup.ts` |
| `TEST_API_URL` | No | `https://pocketgull.app/api/ai/stream` | Target URL for safety specification tests. | `tests/safety.spec.ts` |

### Runtime & Build

| Variable | Required | Default | Description | Files |
|---|---|---|---|---|
| `NODE_ENV` | No | `development` | Node.js environment. Set to `production` in Cloud Run. Controls SSR behaviour, logging verbosity, and telemetry. | `server.ts`, `telemetry.ts`, `Dockerfile` |
| `NODE_OPTIONS` | No | -- | Node.js CLI flags. Dockerfile sets `--max-old-space-size=2048`. | `Dockerfile` |
| `CI` | No | -- | Set in CI/CD environments. Disables interactive prompts and adjusts Playwright workers. | `server.ts`, `playwright.config.ts` |
| `OTEL_SDK_DISABLED` | No | -- | Set to `true` to disable OpenTelemetry instrumentation. | `server.ts`, `Dockerfile` |

### Cloud Run Metadata

| Variable | Required | Default | Description | Files |
|---|---|---|---|---|
| `K_SERVICE` | Auto | -- | Cloud Run service name. Auto-injected by the Cloud Run runtime. Used to detect production environment. | `server.ts` |
| `pm_id` | Auto | -- | PM2 process manager instance ID. Used for multi-instance awareness. | `server.ts` |

### Testing

| Variable | Required | Default | Description | Files |
|---|---|---|---|---|
| `PLAYWRIGHT_TESTING` | No | -- | Set to `true` to enable Playwright-specific server behaviour (relaxed CSP, test endpoints). | `server.ts` |
| `PLAYWRIGHT_WORKERS` | No | -- | Number of parallel Playwright test workers. | `playwright.config.ts` |

---

## CLI Commands

### Development

| Command | Description |
|---|---|
| `npm run dev` | Start the development server (Angular SSR + Express backend, hot reload) |
| `npm run build` | Production build (AOT compilation, tree-shaking, SSR bundle) |
| `npm run lint` | Run ESLint across the workspace |
| `npm run test` | Run unit tests via Angular test runner |
| `npm run e2e` | Run Playwright end-to-end tests |

### Type Checking

| Command | Description |
|---|---|
| `node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit` | Full TypeScript type check (no output) |
| `node node_modules/@angular/cli/bin/ng.js build` | Angular production build with type checking |

### Deployment

| Command | Description |
|---|---|
| `npm run deploy` | Deploy to Google Cloud Run (`gen-lang-client-0540208645`) |

### SBOM & Security

| Command | Description |
|---|---|
| `npx @cyclonedx/cyclonedx-npm --output-file sbom.cdx.json` | Generate CycloneDX SBOM |
| `npx spdx-sbom-generator` | Generate SPDX SBOM |

---

## localStorage Keys (Client-Side Persistence)

The following keys are used for client-side state persistence. All are optional and degrade gracefully when unavailable (SSR-safe).

| Key | Service | Purpose |
|---|---|---|
| `pocket_gull_theme` | `ThemeService` | Active UI theme (light/dark/system) |
| `pocket_gull_seagull_persona` | `ThemeService` | Selected seagull persona variant |
| `pocket_gull_reduce_motion` | `ThemeService` | Reduced motion accessibility preference |
| `pocket_gull_plain_language` | `ThemeService` | Plain language mode for clinical text |
| `pocket_gull_text_size_scale` | `ThemeService` | Text size scaling factor |
| `pg_game_points` | `GamificationService` | Accumulated gamification XP points |
| `pg_game_quests` | `GamificationService` | Quest completion state (JSON) |
| `pg_registered_clinicians` | `FirestoreSyncService` | Registered clinician profiles (JSON) |
| `pg_consent_acknowledged` | `ConsentService` | HIPAA consent acknowledgment flag |
| `pg_consent_acknowledged_ts` | `ConsentService` | Consent acknowledgment timestamp |
| `pg_mock_clinician` | `SecureSplashComponent` | Demo mode clinician flag |
| `local_inference_preferred` | `NetworkStateService` | Local inference preference toggle |
| `pocketgull_evidence_focus_discovered` | `SummaryNodeComponent` | Evidence focus tooltip discovery state |
| `orcid_id` | `OrcidService` | Researcher ORCID identifier |
| `GEMINI_API_KEY` | `GeminiProvider` | User-provided Gemini API key (manual entry) |
| `voice_assistant_mode` | `VoiceAssistant` | Active voice assistant mode (e.g., `ybocs`) |
| `preferredModelTemperature` | `WebLLMProvider` | Local inference model temperature |
| `pocketgull_walkthrough_seen` | `WalkthroughTourService` | Tour completion state |
| `pocketgull_api_key_*` | `SecureKeyService` | Obfuscated API key storage |

---

*This reference is part of the PocketGull Diátaxis documentation framework. For guided onboarding, see [Tutorial: First Patient Encounter](tutorial-first-encounter.md). For architectural rationale, see [DESIGN.md](../DESIGN.md).*
