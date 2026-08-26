---
name: chrome-builtin-ai
description: Architecture, capabilities, and enterprise zero-flag fallbacks for Chrome Built-in AI (Prompt API / Gemma 4 Dev Trial, Proofreader, Classifier, Semantic Embedder).
---

# Chrome Built-in AI & Gemma 4 Dev Trial Architecture

This skill defines the technical standards, API contracts, and enterprise fallback patterns for on-device AI in Pocket-Gull using Chrome Built-in AI APIs.

---

## 1. Core Model & Flag Specifications

| Capability | Chrome Flag / Requirement | API Surface | Latency / Throughput |
| :--- | :--- | :--- | :--- |
| **Gemma 4 Dev Trial** | `chrome://flags/#gemma4-for-built-in-ai` (Chrome Canary 153+) | `window.ai.languageModel` | Up to +70% tok/s increase vs legacy Nano |
| **Multimodal Prompt API** | `chrome://flags/#prompt-api-multimodal-input` | `session.prompt([text, imageBlob])` | Zero cloud transit visual inspection |
| **Clinical Proofreader** | `chrome://flags/#proofreader-api` | `window.ai.proofreader` / `ai.rewriter` | Sub-50ms grammar & ISMP safety check |
| **Acuity Classifier** | `chrome://flags/#classifier-api` | `window.ai.classifier` | Instant categorical triage routing |
| **Semantic Embedder** | `chrome://flags/#optimization-guide-on-device-model` | `window.ai.semanticEmbedder` | 256-dim zero-latency vector embeddings |

---

## 2. Enterprise Boundary Mandate & Zero-Flag Invariant

> **Enterprise Production Policy**: Enterprise administrators and standard browser users may not have experimental Chrome flags enabled in production.
> **Mandatory Invariant**: Every service or component utilizing Chrome Built-in AI MUST provide a deterministic, zero-dependency client-side fallback that guarantees **zero crashes** and **100% feature availability** regardless of browser environment.

### Fallback Mapping Table:

| API | Native Chrome Path | Production Fallback Path |
| :--- | :--- | :--- |
| `languageModel` | `ai.languageModel.create(...)` | `WebLLMProvider` (WebGPU Gemma 3) / `GeminiProvider` / `OfflineEdgeAiService` |
| `proofreader` | `ai.proofreader.create(...)` | Static ISMP Regex Engine (`5.0 mg` trailing zero, `.5 mg` naked decimal detectors) |
| `classifier` | `ai.classifier.create(...)` | Rule-based clinical acuity keyword matcher (`STAT_EMERGENCY`, `URGENT`, `ROUTINE`) |
| `semanticEmbedder` | `ai.semanticEmbedder.create(...)` | Normalized 256-dim sparse n-gram character/word hash projection in `OnDeviceEmbedderService` |

---

## 3. Implementation Code Patterns

### A. Semantic Vector Embedding & Cosine Similarity (`OnDeviceEmbedderService`)
```typescript
import { inject } from '@angular/core';
import { OnDeviceEmbedderService } from '../services/ai/on-device-embedder.service';

export class ExampleComponent {
  private embedder = inject(OnDeviceEmbedderService);

  async rankCandidates(query: string, items: Array<{ id: string; text: string }>) {
    const scored = await this.embedder.findTopMatches(query, items, 5);
    return scored; // Array<{ id, text, score: number (0.0 to 1.0) }>
  }
}
```

### B. On-Device ISMP Dosage Safety Proofreading (`NanoProvider`)
```typescript
const audit = await nanoProvider.verifySection(
  'Clinical Safety Proofreader',
  prescriptionText,
  'Prescription Safety Guidelines'
);
// Returns { status: 'verified' | 'warning', issues: IVerificationIssue[] }
```

### C. Multimodal Visual Inspection (`NanoProvider.analyzeImage`)
```typescript
// Converts data URL to Blob for native Chrome Multimodal Prompt API
const observations = await nanoProvider.analyzeImage(canvasDataUrl, 'Patient rash inspection');
```

---

## 4. Verification Checklist
- [ ] Ensure all experimental API calls check `typeof window !== 'undefined'` and `typeof (window as any).ai !== 'undefined'`.
- [ ] Enforce `samplingMode: 'most-predictable'` on clinical prompt sessions.
- [ ] Verify that unit tests mock `ai.languageModel`, `ai.proofreader`, `ai.classifier`, and `ai.semanticEmbedder`.
- [ ] Run `tsc -p tsconfig.json --noEmit` to confirm zero type errors.
