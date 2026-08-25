---
layout: ../layouts/DocsLayout.astro
title: API Reference
description: "Comprehensive documentation for Pocket Gull REST APIs, WebSocket Telemetry, and Python FastAPI ML Triage endpoints."
---
import DocNode from '../components/DocNode.astro';

# API Reference

**Base Server URL:** `https://api.pocketgull.app` (Production) / `http://localhost:4000` (Local Development)

Pocket Gull exposes a real-time bi-directional streaming architecture alongside RESTful endpoints for patient state management, multi-paradigm clinical intelligence, FHIR R4 exports, and ML triage scoring.

---

## 1. Clinical Intelligence & AI Consult Endpoints

### `POST /api/chat`
Streams real-time clinical responses from Google Gemini 2.5 Flash / Pro and Vertex AI Model Garden.

- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "history": [
    { "role": "user", "parts": [{ "text": "Patient has SpO2 92% and acute dyspnea." }] }
  ],
  "systemInstruction": "You are a clinical decision support system...",
  "model": "gemini-2.5-flash"
}
```
- **Response:** `200 OK` (Server-Sent Events / Chunked Stream)

---

## 2. Health & System Configuration

### `GET /health`
Returns system health status for Google Cloud Run load balancers and Kubernetes liveness probes.

- **Response:** `200 OK`
```text
OK
```

### `GET /api/config`
Retrieves server configuration status.

- **Response:** `200 OK`
```json
{
  "apiKey": "..."
}
```

---

## 3. Patient State Vault Endpoints

### `GET /api/patients`
Retrieves stored patient charts from the secure vault.

- **Response:** `200 OK` (Array of Patient Objects)

### `PUT /api/patients/:id`
Updates or synchronizes a patient chart by ID.

- **Headers:** `Content-Type: application/json`
- **Request Body:** Partial or complete `IPatient` record containing vitals, symptoms, care plan, and assessment metrics.
- **Response:** `200 OK`

---

## 4. Real-Time Telemetry Stream (WebSocket)

### `ws://localhost:4000/ws/telemetry` or `wss://api.pocketgull.app/ws/telemetry`
Full-duplex bi-directional streaming socket for real-time PhysioNet ECG, EEG, SpO2, and HRV telemetry streaming.

- **Outbound Event Payload:**
```json
{
  "id": "r5-obs-1722180000000",
  "topic": "Patient/vitals-stream",
  "timestamp": "2026-07-28T09:30:00.000Z",
  "heartRate": 76,
  "spO2": 98,
  "respirationRate": 16,
  "hrvMs": 45,
  "eegAlphaHz": 10.4,
  "eegBetaHz": 18.2,
  "status": "active"
}
```

---

## 5. Python FastAPI Sidecar (`pocketgull_api`)

The Python sidecar service provides advanced ML scoring and triage prediction.

- **Port:** `8080` / `pocketgull_api` container
- **Endpoints:**
  - `POST /api/ml/predict`: Runs XGBoost / Scikit-Learn clinical risk models.
  - `GET /health`: Sidecar health check.

---

## 6. Security & Egress Guardrails

All API endpoints strictly enforce:
- **Shift-Left Sentinel Egress Security**: Domain whitelisting for `pocketgull.app`, `api.pocketgull.app`, and `pocketgull.com`.
- **Log Injection Sanitization**: Input fields scrubbed of CRLF line-breaks.
- **CSPRNG ID Generation**: Cryptographic randomness for session identifiers.
