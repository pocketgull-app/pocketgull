# Pocket-Gull Multi-Platform Architecture & Native Bridge Matrix

Pocket-Gull utilizes a **Single-Source Web Platform (Angular 22)** hosted on Google Cloud Run, with a **Minimal Flutter Hybrid Shell (`pocketgull_flutter`, ~685 SLOC)** providing native iOS/Android device bridges, and a **Python FastAPI Sidecar** for standalone machine learning inference.

---

## 1. Architectural Distribution

| Platform Subsystem | Primary Technology | Responsibility | SLOC Footprint |
| :--- | :--- | :--- | :--- |
| **Clinical Core & UI** | Angular 22 (Signals, Three.js, Tailwind) | All UI screens, 3D procedural anatomy, live Gemini consults, FHIR serialization, PDF export | ~90,000 SLOC (91%) |
| **Mobile Native Host** | Flutter / Dart 3.12 (Hybrid Shell) | Native App Store shell, Apple HealthKit / Health Connect bridge, FaceID/TouchID, Secure Enclave | ~685 SLOC (0.8%) |
| **ML Scoring Sidecar** | Python 3.12 (FastAPI, Scikit-learn) | Matrix math, biophysical tensor calculations, Actuarial QALY scoring | ~3,500 SLOC (3.5%) |
| **Standalone Backend API** | Node.js / Express 5 | REST endpoints, WebSocket live streaming proxies, FHIR persistence | ~5,200 SLOC (5.2%) |

---

## 2. Flutter Native JavaScript Bridge Protocol (`PocketGullNativeBridge`)

The Angular Web App communicates bidirectionally with the Flutter host via `window.PocketGullNativeBridge.postMessage(JSON.stringify(request))` and receives responses via `window.onPocketGullNativeResponse(response)`.

### Supported Native Bridge Actions

| Action Identifier | Direction | Payload | Return Data | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `GET_BIOMETRIC_AUTH` | Web $\rightarrow$ Flutter | `{ reason?: string }` | `{ authenticated: boolean }` | Prompts FaceID, TouchID, or Android Fingerprint to unlock records |
| `GET_HEALTHKIT_VITALS` | Web $\rightarrow$ Flutter | `{ days?: number }` | `{ supported: boolean, observations: FHIR_Observation[] }` | Queries Apple HealthKit / Google Health Connect background vitals |
| `GET_SECURE_TOKEN` | Web $\rightarrow$ Flutter | `{ key: string }` | `{ key: string, token?: string }` | Retrieves tokens from iOS Keychain / Android Keystore |
| `SET_SECURE_TOKEN` | Web $\rightarrow$ Flutter | `{ key: string, value: string }` | `{ key: string, stored: boolean }` | Stores encryption keys in hardware-backed secure storage |
| `DELETE_SECURE_TOKEN` | Web $\rightarrow$ Flutter | `{ key: string }` | `{ key: string, deleted: boolean }` | Purges tokens from hardware-backed secure storage |
| `TRIGGER_HAPTIC` | Web $\rightarrow$ Flutter | `{ type: 'light'\|'medium'\|'heavy'\|'selection' }` | `{ haptic: string }` | Triggers native tactile haptic feedback |
| `GET_DEVICE_TELEMETRY` | Web $\rightarrow$ Flutter | `{}` | `{ platform: string, isMobile: boolean, clientVersion: string }` | Queries native OS version, connectivity, and client telemetry |
| `OPEN_EXTERNAL_URL` | Web $\rightarrow$ Flutter | `{ url: string }` | `{ launched: string }` | Opens external URLs safely via system browser |
| `SHARE_FHIR_RECORD` | Web $\rightarrow$ Flutter | `{ content: string }` | `{ shared: boolean }` | Triggers native system share sheet / clipboard for FHIR JSON records |

---

## 3. Advantages of the Minimal Hybrid Shell
1. **Zero UI Duplication**: 100% of clinical UI changes in Angular deploy instantly across Web, iOS, and Android without submitting new binaries to App Store review.
2. **Native Hardware Integration**: Access to iOS HealthKit, FaceID/TouchID, and Secure Enclave that Safari restricts on mobile web.
3. **Sub-800 SLOC Maintenance**: Dart footprint reduced by **99.7%** (from 242,000 SLOC to 685 SLOC), eliminating dual-stack feature drift.
