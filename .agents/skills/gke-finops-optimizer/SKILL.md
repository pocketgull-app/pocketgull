---
name: gke-finops-optimizer
description: Audits Kubernetes manifests, Helm values, and GKE configurations to eliminate idle cloud waste, enforce scale-to-zero autoscaling, and optimize cloud billing.
---

# GKE FinOps & Scale-to-Zero Optimizer

This skill provides automated guidelines, scripts, and policies to keep PocketGull's Google Cloud Platform and Kubernetes cluster costs strictly bounded to near \$0–\$15/month when idle.

## Core Directives

1. **Scale-to-Zero Invariant**:
   - `k8s/agones-autoscaler.yaml` and `charts/pocketgull/values.yaml` MUST maintain `minReplicas: 0`.
   - GKE Node Pools MUST enable cluster autoscaling with `--min-nodes=0`.
2. **Artifact Registry & GCS Pruning**:
   - Docker image repositories MUST enforce a 7-day auto-deletion policy with `keepCount: 3` (`scripts/artifact-cleanup-policy.json`).
   - GCS deployment source buckets (`gs://run-sources-*`) MUST maintain a 7-day object deletion lifecycle policy.
3. **Single Cluster Free Tier**:
   - Only maintain a single active GKE cluster in `gen-lang-client-0540208645` to ensure 100% absorption by the GCP Free Tier cluster management fee credit (\$73.00/mo credit).
4. **Log Ingestion Filtering**:
   - Exclude high-frequency 200 OK health check logs (`/healthz`, `/livez`) from Cloud Logging sinks.

## Running the Automated FinOps Audit

Execute the auditor from repository root:
```bash
python .agents/skills/gke-finops-optimizer/scripts/audit_k8s_finops.py
```
