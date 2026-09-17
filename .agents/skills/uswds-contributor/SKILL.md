---
name: uswds-contributor
description: Orchestrate end-to-end contribution workflow for the U.S. Web Design System (USWDS). Handles syncing with upstream/develop, creating isolated feature branches, evaluating the 16 core gates via pr-metrics.mjs, checking repository-local Ed25519 commit signatures for dpo@pocketgull.app, and drafting federal PRs complying with GSA/TTS templates.
args:
  action: (optional) sync, audit, new, or pr
---

# USWDS Contributor Orchestration Skill

This skill guides and executes the official GSA/TTS contribution lifecycle for the U.S. Web Design System.

## Principles

1. **Target Branch**: All PRs must target `develop` (never `main`).
2. **Commit Convention**: `USWDS - [Package]: [Brief summary]` (e.g. `USWDS - Tokens: Standardize literal spacing values to design tokens`).
3. **Commit Signatures**: All commits MUST be cryptographically verified using the repository-local Ed25519 SSH key (`dpo@pocketgull.app`).
4. **Size Budget**: Authored runtime changes must not exceed 400 lines (Gate 1).
5. **Zero New Runtime Dependencies**: Runtime dependencies must remain minimal (`lit` only); no new runtime packages without explicit maintainer approval (Gate 2).
6. **PR Template**: Must include release note statement in bold, breaking change declaration, linked issue (`Closes #NNNN`), problem statement, solution, and test steps.

## Workflow Commands

### 1. Sync Fork with Upstream
```bash
git fetch upstream develop
git log HEAD..upstream/develop --oneline
```

### 2. Run Quality Gates Audit
```bash
node -e 'const fs = require("fs"), { execSync } = require("child_process"); fs.writeFileSync("diff.patch", execSync("git diff origin/develop...HEAD"));'
node .agents/skills/uswds-code-review/scripts/pr-metrics.mjs --diff diff.patch
rm diff.patch
```

### 3. Verify Commit Signature
```bash
git log --show-signature -1
```

### 4. Create Pull Request
```bash
gh pr create --repo uswds/uswds --base develop --head pocketgull-app:<branch> --draft --title "USWDS - [Package]: [Summary]" --body-file "<path-to-body>"
```
