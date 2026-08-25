---
name: antigravity_swe_google
description: Enforces Google Software Engineering at Google (SWE Book) practices, Hyrum's Law defensiveness, hermetic testing, and Antigravity 2.8+ primitives. Use when building or refactoring Pocket-Gull features.
---

# Google Software Engineering Standards & Antigravity IDE Integration

This skill codifies Google Software Engineering principles (Titus Winters et al., Abseil SWE Book) and Antigravity 2.8+ primitives for Pocket-Gull development.

## Core Rules & Hygiene

### 1. Hyrum's Law & Explicit API Contracts
- Prefix explicit TypeScript interfaces with `I` (e.g. `IPatientState`).
- Pydantic v2 `BaseModel` must strictly type all FastAPI routes in `pocketgull_api`.
- Never expose private internal side-effect state across component boundaries.

### 2. Programming Over Time & Angular Signals
- Always favor Angular Signals (`signal`, `computed`, `effect`) over RxJS observables for local component state.
- Standalone components are mandatory (`standalone: true`). Do not use `NgModules`.
- Node.js v24 engine lock must be respected across local dev, CI/CD, and Docker containers.

### 3. Empirical Verification & Hermetic Testing
- Never mark a task resolved without running full empirical verification:
  - TypeScript Typecheck: `node c:/Users/philg/Pocketgull/pocketgull/node_modules/typescript/lib/tsc.js -p c:/Users/philg/Pocketgull/pocketgull/tsconfig.json --noEmit`
  - Vitest Suite: `node c:/Users/philg/Pocketgull/pocketgull/node_modules/vitest/vitest.mjs run --config c:/Users/philg/Pocketgull/pocketgull/vitest.config.ts`
- Tests must be hermetic and run against stubs (`POCKETGULL_LIVE_DEMO=true`).

### 4. Conventional Commits & 72-Char Header Limit
- Headings: `<type>(<scope>): <description>` (72 characters max).
- Valid types: `feat`, `fix`, `docs`, `test`, `security`, `chore`, `refactor`, `perf`, `style`, `ci`, `build`.

### 5. WebMCP & AI Safety Policies
- All WebMCP tools registered via `WebMcpRegistrationService` must declare an `AbortController` signal and explicit JSON Schemas.
- Gemini Clinical Safety Filter policy: `DANGEROUS_CONTENT = OFF` in `src/server/genkit.ts` per `SECURITY.md §2` to prevent false-positive blocking of medical decision support content.

### 6. Domain Encapsulation & "Tell, Don't Ask" Principle
- Never reuse or query an existing getter to extract raw internal state and bolt new business logic, mutations, or domain calculations externally on the caller side.
- Keep domain behavior, state transitions, and validation invariants encapsulated within the class, entity, or service that owns the underlying data.
- Introduce explicit, purpose-built domain methods directly on the owning model/service instead of leaking raw state and chaining logic around generic property accessors.
