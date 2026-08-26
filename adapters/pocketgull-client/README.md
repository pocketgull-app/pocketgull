# @pocketgull/client

Canonical TypeScript/JavaScript SDK and Gateway Adapter for **PocketGull Clinical Strategy & Live AI Consult Engine**.

---

## Features
- 🌐 **Canonical `.app` Binding**: Built for `https://pocketgull.app` with zero hardcoding and proxy flexibility.
- 🧬 **Ethical Research Data Dividends**: Direct client bindings for disease research cohorts and Stripe Connect payouts.
- 🛡️ **HIPAA § 164.514 Provenance**: Pre-flight de-identification and cryptographic audit tags on every payload.
- ⚡ **Resilient Networking**: Jittered exponential backoff retries and bounded timeout controls.

---

## Quickstart

```typescript
import { PocketGullClient } from '@pocketgull/client';

const client = new PocketGullClient({
  baseUrl: 'https://pocketgull.app',
  apiKey: process.env.POCKETGULL_API_KEY
});

// 1. Fetch accredited research disease cohorts
const cohorts = await client.getResearchCohorts();
console.log('Available cohorts:', cohorts);

// 2. Generate Stripe Express onboarding URL for data dividends
const link = await client.generateStripeConnectLink('patient-123');
console.log('Connect Bank URL:', link.onboardingUrl);
```

---

## Compliance & Standards
- **HIPAA Safe Harbor**: Conforms to 45 CFR § 164.514(b)(2).
- **FHIR**: HL7 FHIR R4 Bundle & US Core.
- **License**: Apache 2.0.
