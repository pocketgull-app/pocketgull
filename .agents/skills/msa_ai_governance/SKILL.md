---
name: msa-ai-governance
description: Enforces compliance with Microsoft Services Agreement (MSA) Section 14.s (AI Services), Section 14.i (Health Bots & Medical Notice), C2PA content credentials, and emotion-inference prohibitions.
---

# Microsoft Services Agreement (MSA) & AI Governance Skill

## Purpose
Provides automated verification, static analysis patterns, and governance checklists to guarantee that Pocket-Gull features, agents, and background pipelines strictly comply with the Microsoft Services Agreement (effective September 30, 2026).

---

## 1. Compliance Invariant Matrix

| MSA Section | Prohibition / Requirement | Automated Check / Sentinel Rule |
| :--- | :--- | :--- |
| **Sec 14.s.iv** | **No Model Distillation** | Ensure telemetry/logging outputs are never routed to dataset builders for training foundation models. |
| **Sec 14.s.ix.9** | **No Emotion Inference** | Scan AST for emotion classification keywords (`classifyEmotion`, `sentimentScore`, `facialAffect`, `voiceEmotion`). |
| **Sec 14.s.ix.1** | **Mandatory Human Oversight** | Assert that all clinical action signals enforce `requiresClinicianAttestation: true`. |
| **Sec 14.s.vii** | **C2PA Credentials Preservation** | Ensure image and export pipelines preserve EXIF/C2PA manifest headers. |
| **Sec 14.i** | **Health Bot Non-Device Disclaimer** | Require presence of `MANDATORY_WELLNESS_DISCLAIMER` on consumer-facing bot views. |
| **Sec 14.s.ii** | **No Weight Extraction** | Disallow probe prompts or parameter extraction routines. |

---

## 2. Prohibited AST Patterns & Linter Rules

The following code constructs MUST be flagged and rejected by CI/CD pre-commit hooks:

```typescript
// ❌ PROHIBITED: Emotion inference from biometric/voice telemetry (Sec 14.s.ix.9)
function detectPatientEmotion(voiceAudio: Float32Array): 'calm' | 'anxious' | 'angry' {
  return emotionClassifier.predict(voiceAudio);
}

// ❌ PROHIBITED: Autonomous un-reviewed clinical order execution (Sec 14.s.ix.1)
async function executeAutonomousPrescription(carePlan: ICarePlan): Promise<void> {
  await pharmacyEHR.submitOrder(carePlan.medication);
}

// ❌ PROHIBITED: Stripping C2PA content credentials (Sec 14.s.vii)
function stripImageMetadata(imageBuffer: Buffer): Buffer {
  return sharp(imageBuffer).stripExif().toBuffer();
}
```

### Compliant Alternatives:

```typescript
// ✅ COMPLIANT: Acoustic clarity & signal quality assessment (Non-affective)
function measureAudioSignalQuality(voiceAudio: Float32Array): ISignalQualityMetric {
  return { snrDb: calculateSNR(voiceAudio), isClipping: checkClipping(voiceAudio) };
}

// ✅ COMPLIANT: Human-in-the-loop clinical attestation (Sec 14.s.ix.1)
async function queueCarePlanForClinicianReview(carePlan: ICarePlan): Promise<IAttestationTicket> {
  return attestationService.createReviewTicket({
    carePlan,
    requiresDualSignature: carePlan.isHighAcuity,
    status: 'PENDING_PHYSICIAN_ATTESTATION'
  });
}
```

---

## 3. Compliance Verification Checklist

Before deploying or finalizing any feature touching AI or medical data:
- [ ] Run Sentinel AST check for prohibited emotion/biometric classification symbols (`node scripts/msa_governance_guard.mjs`).
- [ ] Verify that all patient action plans render the statutory non-device health disclaimer (`MANDATORY_WELLNESS_DISCLAIMER`).
- [ ] Confirm no outbound telemetry routes AI responses to external model-training sinks.
- [ ] Ensure all generated exports maintain C2PA provenance headers.
