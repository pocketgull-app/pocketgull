# Pocket-Gull Enterprise Support & Communication Channels

Welcome to the **Pocket-Gull** enterprise support directory.

---

## 🏥 Clinical & Engineering Support Channels

| Need | Primary Channel | SLA / Target Response |
| :--- | :--- | :--- |
| **Security & Vulnerabilities** | [Private Vulnerability Reporting](https://github.com/pocketgull-app/pocketgull/security/advisories/new) | **< 24 Hours** |
| **Urgent Clinical Triage / Critical Bug** | Email: `dpo@pocketgull.app` / `leads@pocketgull.app` | **< 4 Hours** |
| **Feature Requests & Architecture** | [GitHub Discussions](https://github.com/pocketgull-app/pocketgull/discussions) | **2-3 Business Days** |
| **Domain Specialist & Contractor Inquiries** | GitHub Issues with `[SPECIALIST-TASK]` tag | **1 Business Day** |
| **Regulatory & IRB Research Inquiries** | Email: `leads@pocketgull.app` | **2-3 Business Days** |

---

## 🛠️ Self-Service Diagnostics

Before opening an issue, please run the following local diagnostics:

```bash
# 1. Typecheck validation
npm run typecheck

# 2. Sentinel security and egress audit
npm run sentinel:audit

# 3. Unit test suite
npm test
```

---

<p align="center">
  <sub>© 2026 Pocket-Gull Engineering. Living Medical Intelligence Engine.</sub>
</p>
