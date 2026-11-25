# AGENTS.md - Contributor Guidelines and AI Agent Governance

## 1. Governance and Identity
- **Human Authorship and Responsibility**: All contributions, commits, and pull requests must be directed, verified, and signed off by a human maintainer. "The AI did it" is not an excuse.
- **Identity Integrity**: Git commits must strictly reflect the human author (git config user.name / user.email). Synthetic bot identities and automated Co-authored-by AI commit tags are prohibited.

## 2. Licensing and Reserved Font Names (SIL OFL 1.1)
- **Section 3 RFN Protection**: Derivative font families must NEVER reuse upstream Reserved Font Names without the required derivative designation (e.g., "Direct").
- **Section 4 Attribution**: Upstream copyright notices, author lists, and license texts must remain intact.

## 3. Sandboxing and Toolchain Isolation
- **Host Protection**: Never execute unvetted external scripts, compilers, or arbitrary package installers directly on the host OS.
- **Sandboxed Execution**: Heavy builds and untrusted dependencies must execute inside isolated sandbox containers defined in .sandbox.json.

## 4. Verification and Quality Gates
- **Zero-Defect Verification**: Code and font binary modifications must be empirically verified before committing:
  1. Automated table integrity audits must pass (e.g. 2-byte word boundaries: loca[i] % 2 == 0).
  2. Subpixel antialiasing and gasp tables must conform to specifications.
  3. Visual regression plates or automated test suites must pass without errors.
