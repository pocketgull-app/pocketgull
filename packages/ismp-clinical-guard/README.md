# @pocketgull/ismp-clinical-guard

Zero-dependency, zero-latency on-device ISMP medication safety linter and FDA Tall Man lettering engine.

## Features
- **Zero Dependencies**: Pure TypeScript, running natively in Node, Browsers, Edge Workers, Deno, and Bun.
- **ISMP Posology Guard**: Detects trailing zeros (`5.0 mg` $\rightarrow$ `5 mg`) and naked decimals (`.5 mg` $\rightarrow$ `0.5 mg`).
- **FDA Tall Man Lettering**: Canonical lookup and formatting for high-risk Look-Alike / Sound-Alike (LASA) pairs (e.g. `vinBLAStine` vs `vinCRIStine`, `hydrALAZINE` vs `hydrOXYzine`).
- **Dangerous Abbreviations**: Automatically flags and corrects ISMP "Do Not Use" list entries (`U`, `QD`, `QOD`, `MSO4`, `MgSO4`, `ug`).
- **Clinical Severity Classification**: Categorizes defects into `CRITICAL_SAFETY_DEFECT`, `HIGH_RISK_WARNING`, and `ADVISORY`.

## Installation

```bash
npm install @pocketgull/ismp-clinical-guard
```

## Quick Start

```typescript
import { ismpGuard } from '@pocketgull/ismp-clinical-guard';

// 1. Sanitize dosages and abbreviations
const clean = ismpGuard.sanitizeClinicalDosage('Give vinblastine 5.0 mg IV QD with .5 mg lorazepam');
console.log(clean);
// Output: "Give vinBLAStine 5 mg IV daily with 0.5 mg LORazepam"

// 2. Perform a comprehensive safety audit
const audit = ismpGuard.auditPrescription('Order: MSO4 4.0 mg IV QD');
console.log(audit.isSafe); // false
console.log(audit.violations);
```

## License
Apache-2.0
