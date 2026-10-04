# PocketGull Clinical Cybersecurity Incident Response & Breach Playbooks
**Document ID**: PG-SOP-IR-01 | **Version**: 2.4.0  
**Governing Standard**: NIST SP 800-61 Rev. 2, HIPAA Breach Notification Rule (45 CFR §§ 164.400–414), CISA CIRCIA, FDA 21 CFR Part 11  
**Incident Commander & Lead DPO**: `dpo@pocketgull.app`  
**Security Notification Channel**: `projects/gen-lang-client-0540208645/notificationChannels/14170492235561525169`  
**Target Cloud Platform**: Google Cloud Platform (`gen-lang-client-0540208645`)  

---

## 1. Incident Severity & Escalation Matrix

| Acuity Level | Description & Trigger Examples | Maximum SLA to Initial Containment | Incident Commander Roles Required |
| :---: | :--- | :---: | :--- |
| **P1 - CRITICAL** | • Confirmed unencrypted ePHI exfiltration.<br>• Administrative credential or GCP Service Account compromise.<br>• Adversarial injection altering medication dosage recommendations.<br>• Ransomware or active hostile infrastructure takeover. | **< 15 minutes** | Lead DPO (`dpo@pocketgull.app`) + Chief Clinical Officer (Dual-Custody) |
| **P2 - HIGH** | • Canary honeypot (`/api/canary/*`) active probe surge.<br>• Cloud Run error spike (`>5 in 5m`) or partial denial of service.<br>• Unauthenticated egress request blocked by Sentinel Guard. | **< 1 hour** | Lead DPO + Senior Cloud Engineer |
| **P3 - MEDIUM** | • Upstream AI provider 503 outage or rate-limiting (429).<br>• Single user authentication lockout loop.<br>• Package vulnerability (CVE) detected with no active exploit in wild. | **< 4 hours** | Systems / On-Call Engineer |
| **P4 - LOW** | • Routine automated vulnerability scan findings.<br>• Informational log formatting anomaly. | **< 24 hours** | Standard Dev Sprint |

---

## 2. Playbook 1: Compromised Secret or Credential (API Key, WIF, GitHub Token)

**Trigger**: GitHub Push Protection alert, Google Cloud Secret Manager leak alert, or anomalous BigQuery audit entries.

### Phase 1: Immediate Revocation (< 5 Minutes)
1. **Identify the Leaked Key Identifier**:
   ```bash
   gcloud services api-keys list --project=gen-lang-client-0540208645
   ```
2. **Delete or Disable the Key Immediately**:
   ```bash
   gcloud services api-keys delete <KEY_NAME> --project=gen-lang-client-0540208645 --quiet
   ```
3. **If GitHub Personal Access Token or Deploy Key is Compromised**:
   - Immediately revoke in GitHub > **Settings** > **Developer Settings** > **Personal Access Tokens**.

### Phase 2: In-Memory Secret Rotation in GCP Secret Manager (< 10 Minutes)
1. **Generate a fresh cryptographic secret** (NIST SP 800-90A CSPRNG):
   ```bash
   openssl rand -hex 32
   ```
2. **Update Secret Manager version**:
   ```bash
   echo -n "NEW_SECRET_VALUE" | gcloud secrets versions add GEMINI_API_KEY \
     --data-file=- --project=gen-lang-client-0540208645
   ```
3. **Trigger Cloud Run zero-downtime rolling deployment**:
   ```bash
   gcloud run services update pocketgull-app \
     --project=gen-lang-client-0540208645 \
     --region=us-central1
   ```

### Phase 3: Blast Radius Investigation via BigQuery Log Analytics
Execute this query in BigQuery to find every API call made with the compromised key in the last 72 hours:
```sql
SELECT
  timestamp,
  proto_payload.audit_log.authentication_info.principal_email AS caller,
  proto_payload.audit_log.request_metadata.caller_ip AS caller_ip,
  proto_payload.audit_log.service_name AS service_accessed,
  proto_payload.audit_log.method_name AS method_called,
  proto_payload.audit_log.status.code AS status_code
FROM
  `gen-lang-client-0540208645.default_log_link._AllLogs`
WHERE
  timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 72 HOUR)
  AND (
    proto_payload.audit_log.authentication_info.service_account_key_name LIKE '%<KEY_OR_SA_ID>%'
    OR proto_payload.audit_log.request_metadata.caller_ip = '<SUSPECT_IP>'
  )
ORDER BY
  timestamp DESC;
```

---

## 3. Playbook 2: Adversarial Clinical AI & Prompt Injection (OWASP LLM01 / MITRE ATLAS AML.T0043)

**Trigger**: `clinical_security_threat_count > 0` alert from Cloud Monitoring, zero-width Unicode injection, or prompt override attempt targeting medication doses.

### Phase 1: Immediate Clinical Safety Triage (< 5 Minutes)
1. **Engage Application Containment Mode**:
   - In [`ClinicalDefenseGuardService`](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-defense-guard.service.ts):
     ```typescript
     clinicalDefenseGuardService.isContainmentModeActive.set(true);
     ```
   - Automatically degrades clinical suggestions to **Deterministic Verified Medical Rules Only**; halts stochastic Gemini completions.
2. **Check Patient State for Dosage Alterations**:
   - Review active care plan signals in `PatientStateService`.
   - Assert zero un-vetted dosage alterations occurred.

### Phase 2: Forensic Snapshot & Evidence Sealing (< 15 Minutes)
1. **Compute SHA-256 Forensic Digest** (FDA 21 CFR Part 11 compliant):
   ```typescript
   const snapshot: IIncidentForensicSnapshot = {
     snapshotId: `AUDIT-${Date.now()}`,
     timestamp: new Date().toISOString(),
     eventCategory: 'PROMPT_INJECTION',
     severity: 'CRITICAL',
     evidencePayloadHash: crypto.createHash('sha256').update(rawPayload).digest('hex'),
     containmentApplied: 'System instruction immutability enforced; stochastic generation blocked.',
     hhs405dAlignment: 'HICP Section 3.1.2 - Ingestion Sanitization'
   };
   clinicalDefenseGuardService.forensicSnapshots.update(list => [snapshot, ...list]);
   ```
2. **Review Forensic Records in BigQuery**:
   ```sql
   SELECT * 
   FROM `gen-lang-client-0540208645.siem_audit_logs.v_clinical_ai_forensics`
   ORDER BY timestamp DESC LIMIT 10;
   ```

---

## 4. Playbook 3: Potential ePHI Exposure / Taint Boundary Leak

**Trigger**: Alert from `npm run siem:audit`, unauthorized external egress attempt intercepted by Sentinel Guard, or accidental direct identifier in telemetry.

### Phase 1: Four-Factor HIPAA Breach Risk Assessment (45 CFR § 164.402)
*Every suspected incident MUST be evaluated under the federal four-factor test to determine if a statutory breach occurred:*

1. **Factor 1: Nature and Extent of the PHI Involved**:
   - Were direct identifiers (names, SSNs, MRNs) exposed, or only clinical observations (heart rate, blood pressure)?
   - *PocketGull Invariant*: If [`deIdentifyClinicalPayload`](file:///c:/Users/philg/Pocketgull/pocketgull/scripts/simulate_clinical_cyber_tabletop.mjs#L144) stripped all 18 identifiers, data is legally de-identified under Safe Harbor §164.514, and **no breach has occurred**.
2. **Factor 2: Unauthorized Person Who Used or Received the PHI**:
   - Was data sent to an internal HIPAA BAA-covered service (Google Vertex AI) or an un-contracted third party?
3. **Factor 3: Whether PHI Was Actually Acquired or Viewed**:
   - Did external entities log, ingest, or view the packet, or was it intercepted in-flight by Sentinel Guard?
4. **Factor 4: The Extent to Which the Risk Has Been Mitigated**:
   - Was the payload immediately purged via 1-click state reset?

### Phase 2: Immediate Containment Actions (< 15 Minutes)
1. **Execute 1-Click Transient State Purge**:
   - Call WebMCP tool `purge_transient_patient_state` or invoke browser state reset to purge client-side IndexedDB and Angular Signals.
2. **Audit External Network Egress Logs**:
   ```sql
   SELECT timestamp, proto_payload.audit_log.request_metadata.caller_ip, proto_payload.audit_log.method_name
   FROM `gen-lang-client-0540208645.default_log_link._AllLogs`
   WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 6 HOUR)
     AND resource.type = 'cloud_run_revision'
   ORDER BY timestamp DESC;
   ```

---

## 5. Playbook 4: Cloud Run Infrastructure Compromise or Denial of Service

**Trigger**: Cloud Run container error loop, unauthorized revision deployment, or high HTTP 5xx error rate.

### Phase 1: Instant Rollback to Known-Good Revision (< 5 Minutes)
1. **List Historical Revisions**:
   ```bash
   gcloud run revisions list --service=pocketgull-app --project=gen-lang-client-0540208645 --region=us-central1
   ```
2. **Route 100% of Traffic to Previous Clean Revision**:
   ```bash
   gcloud run services update-traffic pocketgull-app \
     --to-revisions=<PREVIOUS_CLEAN_REVISION_NAME>=100 \
     --project=gen-lang-client-0540208645 \
     --region=us-central1
   ```

### Phase 2: Emergency Scale-to-Zero Killswitch (If Hostile Takeover Detected)
If container code is suspected of running unauthorized code:
```bash
gcloud run services update pocketgull-app \
  --min-instances=0 \
  --max-instances=0 \
  --project=gen-lang-client-0540208645 \
  --region=us-central1
```
*Note: Because PocketGull is local-first, clinicians can continue reviewing care plans locally on device via WASM/IndexedDB offline mode while the cloud API is frozen.*

---

## 6. Playbook 5: Statutory Breach Notification & Regulatory Escalation

If an incident is confirmed as a **Breach under HIPAA §164.402** or **CIRCIA**:

### Timeline & Statutory Notification Schedule

```
Incident Confirmed
      │
      ├──────────────────► Hour 72: CISA CIRCIA Mandatory Report (cisa.gov/report)
      │
      ├──────────────────► Day 60: Individual Patient Notifications (Written First-Class Mail)
      │
      ├──────────────────► Day 60: HHS OCR Portal Notification (If ≥ 500 individuals)
      │
      └──────────────────► Year-End + 60d: Annual HHS OCR Portal Report (If < 500 individuals)
```

1. **CISA Mandatory Reporting (CIRCIA)**:
   - **Deadline**: Within **72 hours** of reasonable belief that a covered cyber incident occurred.
   - **Submission Channel**: [cisa.gov/report](https://www.cisa.gov/report) or call `(888) 282-0870`.
   - **Ransomware Payment**: PocketGull enforces a strict **Zero-Ransom Payment Policy**. If an extortion demand occurs, notify CISA and FBI within **24 hours**.

2. **HHS OCR & Patient Notifications (HIPAA § 164.404 / § 164.406 / § 164.408)**:
   - **Large Breaches ($\ge 500$ Individuals in a State/Jurisdiction)**:
     - Notify affected individuals via written notice (first-class mail) without unreasonable delay and in no case later than **60 calendar days**.
     - Notify prominent media outlets in the state/jurisdiction.
     - Notify HHS Secretary electronically via the [HHS OCR Breach Reporting Portal](https://ocrportal.hhs.gov/ocr/breach/breach_report.jsf).
   - **Small Breaches ($< 500$ Individuals)**:
     - Notify affected individuals within **60 calendar days**.
     - Log incident in PocketGull forensic ledger; notify HHS Secretary within **60 days of the calendar year end**.

3. **International Statutory Partner Contacts (Five Eyes)**:
   - **United Kingdom**: Information Commissioner's Office (ICO) within 72 hours via [ico.org.uk](https://ico.org.uk).
   - **Canada**: Office of the Privacy Commissioner of Canada (OPC) under PIPEDA via [priv.gc.ca](https://www.priv.gc.ca).
   - **Australia**: Office of the Australian Information Commissioner (OAIC) under Notifiable Data Breaches (NDB) via [oaic.gov.au](https://www.oaic.gov.au).
   - **New Zealand**: Office of the Privacy Commissioner (OPC) under Privacy Act 2020 via [privacy.org.nz](https://www.privacy.org.nz).

---

## 7. Post-Incident Review & Evidence Preservation

1. **Evidence Immutable Archive**:
   - Export all relevant BigQuery query results into a tamper-evident GCS bucket with Object Hold and Bucket Lock enabled (`--retention-period=6y`).
2. **Post-Mortem Milestone Document**:
   - Complete root-cause analysis within **14 calendar days**.
   - Update `SECURITY.md` and repository tests (`tests/safety.spec.ts`) to ensure the root cause is covered by automated regression assertions.
