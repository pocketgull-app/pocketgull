# 🤝 Contributing to Pocket Gull

Thank you for your interest in contributing to **Pocket Gull**! This project is a real-time medical Care Plan Strategy and Live AI Consult engine powered by Google Gemini.

Because Pocket Gull is used in high-stakes clinical decision support and emergency Good Samaritan settings, we enforce strict standards for code quality, security, and medical validation.

---

## 📜 Code of Conduct & Core Principles

We adhere strictly to our [Code of Conduct](file:///c:/Users/philg/Pocketgull/pocketgull/CODE_OF_CONDUCT.md), which embraces **Geek Feminism** principles:
- **Welcoming Environment & Anti-Gatekeeping**: We welcome contributors of all backgrounds, gender identities, neurodivergences, and experience levels. Technical gatekeeping, elitist testing, and condescension are strictly prohibited.
- **Valuing Non-Code Labor**: Clinical research, medical accuracy review, documentation, UI accessibility auditing, translation, and community stewardship are first-class contributions equal to code commits.
- **Standalone Components**: All Angular UI components MUST be standalone. NgModules are prohibited.
- **Signals State Management**: Always favor Angular Signals (`computed`, `signal`, `effect`) over RxJS observables for component state.
- **No Unsanitized PHI Logging**: Never commit raw user inputs or un-sanitized string interpolations in log statements (strictly follow CodeQL log injection prevention rules using `%s` / `%d` format specifiers).
- **Shift-Left Security & Accessibility**: All pull requests must pass `npm run sentinel:audit`, `npm run lint`, accessibility checks, and Vitest test suites.

---

## 🛠️ Getting Started

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/pocketgull.git
cd pocketgull

# 2. Install dependencies (Node 24.x strictly required)
npm install

# 3. Start local development server
npm run dev

# 4. Run local security & egress audit
npm run sentinel:audit

# 5. Run test suite
npm test
```

---

## 🔀 Branching & Pull Request Process

1. **Branch Naming**: Use descriptive branch names (`feature/wacom-pressure-telemetry`, `fix/care-plan-pdf-export`, `security/codeql-remediation`).
2. **Commit Messages**: We strictly follow the **Conventional Commits** specification: `<type>(<scope>): <description>`.
   - **Subject Line**: Strictly **72 characters or fewer**. Use imperative mood ("add", "fix"), do NOT capitalize the first letter, and no period at the end.
   - **Types**: `feat`, `fix`, `docs`, `test`, `security`, `chore`, `refactor`, `perf`, `style`, `ci`, `build`.
   - **Body**: Wrap at 80 characters. Explain *why* the change was made, not *what*. Prefix with `BREAKING CHANGE:` if applicable.
3. **Automated Audits**: Ensure your branch compiles with zero errors (`node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit`).
4. **Pull Request Descriptions**: PR descriptions must be written to cleanly translate into our `CHANGELOG.md` history. PR descriptions should use the following format for each major change:
   - **Format**: `- **[Subsystem / Area] Short Feature Name (\`impacted-file.ts\`)**:`
   - Include nested bullet points detailing exactly what was added, fixed, or modified.
5. **Pull Request Review**: Submit your PR targeting `main`. Automated GitHub Actions will run CodeQL, Sentinel egress audits, and dependency review scanners.

---

## 🏥 Medical & AI Validation Guidelines

- If you modify an AI prompt or clinical intelligence service ([`src/services/clinical-intelligence.service.ts`](file:///c:/Users/philg/Pocketgull/pocketgull/src/services/clinical-intelligence.service.ts)), you MUST provide accompanying unit or end-to-end tests verifying that medical safety filters and JSON schema constraints remain intact.
- Ensure all medical references use UKRIO-compliant citation formats with direct hyperlinking to PubMed/PMC IDs.
