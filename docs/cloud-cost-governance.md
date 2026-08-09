# Cloud Cost Governance & Anti-Spike Policy

## Overview

Pocket Gull operates under a strict **Zero-Surprise Cloud Cost Policy**. Because the application integrates Google Gemini AI models, Cloud Run server-side rendering, and WebSockets, this document specifies the technical and administrative controls designed to prevent accidental or runaway cloud expenses.

---

## 1. Cloud Infrastructure & Compute Guardrails

### Cloud Run Scale-to-Zero (`minScale: 0`)
- **Baseline Cost**: $0.00/month when idle.
- **Enforcement**: Automated script `scripts/apply-gcp-lifecycle-policies.mjs` sets `--min-instances 0` on every deployment.

### Cloud Run Scaling Upper Bound (`maxScale: 2`)
- **Scaling Cap**: Cloud Run instances are strictly capped at `--max-instances 2` in `scripts/deploy.sh`.
- **Preflight Verification**: `scripts/gcloud-preflight.js` validates scaling annotations before deployment.
- **Protection**: If an external researcher or automated load testing tool hits the endpoint with parallel requests, the service caps instance creation at 2 containers rather than scaling horizontally to hundreds of nodes.

---

## 2. Real-Time Streaming & AI Token Guardrails

### WebSocket Live Audio Session Timeout (10 Minutes)
- **10-Minute Safety Ceiling**: `AdkLiveService.MAX_SESSION_DURATION_MS` imposes a strict **10-minute (600,000 ms)** maximum session timer on bi-directional WebSocket audio streams (`/ws/gemini-live`).
- **Auto-Disconnect**: When the 10-minute threshold is reached, the service automatically closes the WebSocket connection and resets listening signals.
- **User Notice**: Displays `"Safety Duration Limit Reached: Live streaming session automatically closed after 10 minutes to prevent cost overruns."`

### Client-Side Edge AI Offloading
- All local clinical scoring, biophysics matrix math, and local telemetry process locally on the client device via Web Workers (`OfflineEdgeAiService`). Basic UI interactions consume **0 remote cloud tokens**.

---

## 3. Storage & Artifact Auto-Pruning

### Artifact Registry Auto-Deletion (7-Day Policy)
- **Retention Rule**: Enforced by `scripts/artifact-cleanup-policy.json`.
- **Policy**: Auto-deletes container layers older than 7 days (`olderThan: "604800s"`), retaining the latest 3 builds (`keepCount: 3`).
- **Cost Cap**: Prevents build storage accumulation, maintaining Docker artifact storage at ~2–4 GB (~$0.20/month).

### GCS Deployment Source Zip Auto-Deletion (7-Day Policy)
- **Retention Rule**: Enforced by `scripts/gcs-lifecycle.json`.
- **Policy**: Automatically deletes source zip archives in `gs://run-sources-*` older than 7 days (`age: 7`).

---

## 4. Automated Billing Pub/Sub Kill-Switch

- **Pub/Sub Topic**: `pocketgull-billing-budget-topic` configured in `scripts/setup-billing-killswitch.mjs`.
- **Cloud Function Trigger**: Receives JSON billing notifications from Google Cloud Billing.
- **Hard Kill-Switch**: If monthly spend reaches 100% of the target budget, the Pub/Sub function programmatically executes `gcloud run services update pocket-gull --max-instances=0`, stopping container scaling until reset by project admin.

---

## 5. GCP Quota Ceilings & IAM Least Privilege

### API Quota Limits
Configured under **GCP Console → IAM & Admin → Quotas**:
- `generativelanguage.googleapis.com`: Capped at **60 RPM** and **250,000 TPM**.
- `aiplatform.googleapis.com`: Capped at **100 RPM**.

### IAM Role Isolation for Visiting Researchers
- **No `Owner` or `Editor` Roles**: Visiting researchers and external collaborators are restricted to granular roles:
  - `roles/run.developer` (Cloud Run Developer)
  - `roles/aiplatform.user` (Vertex AI User)
- **Restricted Permissions**: Deny `compute.instances.create`, `container.clusters.create`, and `aiplatform.notebooks.create` to prevent un-monitored GPU VM or GKE cluster provisioning.

---

## 6. Audit & Verification Commands

```bash
# 1. Run Preflight Health & Scaling Checks
node scripts/gcloud-preflight.js

# 2. Re-apply Storage Lifecycle & Scale-to-Zero Policies
node scripts/apply-gcp-lifecycle-policies.mjs

# 3. Audit IAM Roles & Quota Ceilings
node scripts/apply-gcp-quota-policy.mjs

# 4. Verify Billing Pub/Sub Kill-Switch Setup
node scripts/setup-billing-killswitch.mjs
```
