# 🌐 PocketGull Developer Community & Safe Data Coalition

Welcome to the **PocketGull Open-Source Developer Community**! We are a global network of engineers, clinicians, data scientists, and healthcare advocates building open, privacy-preserving, and mathematically validated clinical intelligence systems.

---

## 🎯 Our Mission: Zero-Retention, Safe-Data Clinical AI

In an era where patient data is frequently harvested, aggregated, or used to train commercial models without explicit consent, PocketGull champions **Data Sovereignty & Ephemeral Intelligence**:

1. **Default to Client-Side Edge Execution**: Compute biometric equations and triage scoring locally via WebAssembly and Web Workers.
2. **HIPAA Safe Harbor §164.514 De-Identification**: Automatically strip all 18 personal identifiers from mock data and telemetry before any cloud consult.
3. **FHIR R4 Open Standard Interoperability**: Eliminate proprietary data silos by supporting open HL7 FHIR R4 Bundles.
4. **Popperian Falsifiability & Socratic Evidence**: Explicitly report $p$-values and Cochrane Risk of Bias tiers ($A, B, C$) so clinicians never blindly trust AI output.

---

## 🚀 Hands-On Developer Codelab: Safe Data Practices in AI

Want to build privacy-first AI apps? Follow our 4-step reference codelab:

### Step 1: Break AI Prompt Injection Taint Chains
Never concatenate raw user input into LLM `systemInstruction`. Keep system prompts strictly static, and pass user data as sanitized context blocks:

```typescript
// ❌ INSECURE: Untrusted input concatenated into system instruction
const prompt = { systemInstruction: `You are an MD. Patient notes: ${userInput}` };

// ✅ SECURE: Static system prompt + sanitized user content
const sanitizedInput = DOMPurify.sanitize(userInput);
const prompt = {
  systemInstruction: BASE_CLINICAL_PROMPT, // Static constant
  contents: [{ role: 'user', parts: [{ text: `[PATIENT CONTEXT]: ${sanitizedInput}` }] }]
};
```

### Step 2: Enforce Ephemeral State & 1-Click Purging
Store transient clinical state in memory (Angular Signals / reactive stores) without persisting raw vitals to unencrypted databases:

```typescript
export class PatientStateService {
  private readonly state = signal<IPatientState | null>(null);

  // 1-Click State Purge for HIPAA Safe Harbor compliance
  purgeTransientPatientState(): void {
    this.state.set(null);
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  }
}
```

### Step 3: Run Our Reusable GitHub Actions in Your CI/CD
Add our automated compliance scanners to your own `.github/workflows/ci.yml`:

```yaml
- name: Scan for HIPAA Safe Harbor PHI/PII
  uses: pocketgull-app/pocketgull/.github/actions/hipaa-safe-harbor-action@main

- name: Validate HL7 FHIR R4 Schemas
  uses: pocketgull-app/pocketgull/.github/actions/fhir-r4-validator-action@main
```

---

## 🏷️ Good First Issues for New Contributors

We maintain beginner-friendly and intermediate tasks tagged with [`good-first-issue`](https://github.com/pocketgull-app/pocketgull/labels/good-first-issue):

| Category | Task Idea | Skills Involved |
| :--- | :--- | :--- |
| **FHIR Resources** | Add FHIR R4 schema mappings for `Immunization` and `AllergyIntolerance`. | TypeScript, JSON Schema |
| **Multilingual** | Add native medical term translations for Spanish, Arabic, Hindi, or Japanese. | i18n, Typography |
| **Accessibility (a11y)** | Audit touch target sizes (>44px) and WCAG AAA contrast ratios on telemetry cards. | TailwindCSS, HTML5 |
| **Clinical Citations** | Author Cochrane Risk of Bias metadata for integrative medicine protocols. | Clinical Research, JSON |

---

## 🤝 Join the Discussion & Meetup Channels

- **GitHub Discussions**: [github.com/pocketgull-app/pocketgull/discussions](https://github.com/pocketgull-app/pocketgull/discussions)
- **Local Developer Groups**: Present our [Lightning Talk Deck](./public/docs/study/positioning.md) at your local Google Developer Group (GDG) or OWASP chapter.
- **Code of Conduct**: We strictly enforce our [Code of Conduct](./CODE_OF_CONDUCT.md) to ensure an inclusive, respectful, and safe environment for all contributors.
